"""Runs every code snippet published in the Learn-AI handbook and checks what the page claims.

    python test/snippets.py        (needs numpy + torch; CPU is fine)

The agent snippet is driven by an in-process OpenAI-compatible mock that replays a scripted
tool-calling session, covering: normal completion, an out-of-sandbox read, and a refused write.
"""
import json
import os
import subprocess
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
SNIP = Path(__file__).resolve().parent.parent / "snippets"


def run(name, cwd, stdin="", env=None):
    r = subprocess.run([sys.executable, str(SNIP / name)], cwd=cwd, input=stdin, text=True,
                       capture_output=True, timeout=300, env={**os.environ, **(env or {})})
    assert r.returncode == 0, f"{name} failed:\n{r.stderr}"
    return r.stdout


def tc(i, name, args):
    return {"id": f"call_{i}", "type": "function", "function": {"name": name, "arguments": json.dumps(args)}}


SCRIPT = [
    {"role": "assistant", "content": None, "tool_calls": [tc(1, "list_files", {})]},
    {"role": "assistant", "content": None, "tool_calls": [tc(2, "read_file", {"path": "a.txt"}),
                                                          tc(3, "read_file", {"path": "../secret.txt"})]},
    {"role": "assistant", "content": None, "tool_calls": [tc(4, "write_file", {"path": "summary.md", "content": "# a.txt: hello\n"})]},
    {"role": "assistant", "content": "done"},
]


def mock_server():
    log = []

    class H(BaseHTTPRequestHandler):
        def do_POST(self):
            body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            assert self.path == "/v1/chat/completions" and body["tools"], self.path
            log.append(body)
            msg = SCRIPT[min(len(log), len(SCRIPT)) - 1]
            out = json.dumps({"choices": [{"index": 0, "message": msg, "finish_reason": "stop"}]}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(out)

        def log_message(self, *a):
            pass

    srv = HTTPServer(("127.0.0.1", 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, log


def test_agent(answer):
    with tempfile.TemporaryDirectory() as d:
        (Path(d) / "workspace").mkdir()
        (Path(d) / "workspace" / "a.txt").write_text("hello\n", encoding="utf-8")
        (Path(d) / "secret.txt").write_text("TOPSECRET", encoding="utf-8")
        srv, log = mock_server()
        try:
            out = run("s4_agent.py", d, stdin=answer + "\n", env={
                "LLM_BASE_URL": f"http://127.0.0.1:{srv.server_port}/v1", "LLM_MODEL": "mock"})
        finally:
            srv.shutdown()
        tool_msgs = [m for m in log[-1]["messages"] if m["role"] == "tool"]
        assert len(log) == 4, len(log)
        assert any("outside the workspace" in m["content"] for m in tool_msgs), "sandbox escape not blocked"
        assert all("TOPSECRET" not in m["content"] for m in tool_msgs), "secret leaked into context"
        written = Path(d) / "workspace" / "summary.md"
        if answer == "y":
            assert written.read_text(encoding="utf-8") == "# a.txt: hello\n"
        else:
            assert not written.exists() and any("refused" in m["content"] for m in tool_msgs)
        assert out.strip().endswith("done")


with tempfile.TemporaryDirectory() as d:
    out = run("s1_gd.py", d)
    gd, ls = [l.split(":", 1)[1].strip() for l in out.splitlines()[-2:]]
    assert gd == ls, (gd, ls)
    print("s1_gd    ok  gradient descent == least squares:", gd)

    out = run("s2_loop.py", d)
    base = float(out.splitlines()[0].rsplit(" ", 1)[1])
    best = float(out.splitlines()[-1].rsplit(" ", 1)[1])
    assert best < base / 100, (base, best)
    print(f"s2_loop  ok  baseline {base:.4f} -> best val_mse {best:.4f}")

    out = run("s3_attn.py", d)
    assert out.strip().endswith("True"), out
    print("s3_attn  ok  hand-written attention matches PyTorch")

test_agent("y")
print("s4_agent ok  completes, blocks ../secret.txt, writes after approval")
test_agent("n")
print("s4_agent ok  refused write leaves no file")
