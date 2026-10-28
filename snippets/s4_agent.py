import json, os, pathlib, urllib.request

BASE = os.environ.get("LLM_BASE_URL", "https://api.deepseek.com")   # any OpenAI-compatible endpoint
MODEL = os.environ.get("LLM_MODEL", "deepseek-chat")
KEY = os.environ.get("LLM_API_KEY", "")
ROOT = pathlib.Path("workspace").resolve()     # the agent may only touch this folder
ROOT.mkdir(exist_ok=True)

def inside(path):                              # permission check #1: stay in the sandbox
    p = (ROOT / path).resolve()
    if not p.is_relative_to(ROOT):
        raise PermissionError(f"{path} is outside the workspace")
    return p

def list_files(path="."):
    return "\n".join(sorted(f.name for f in inside(path).iterdir()))

def read_file(path):
    return inside(path).read_text(encoding="utf-8")[:4000]   # cap what flows back into context

def write_file(path, content):
    if input(f"Allow writing {path}? [y/N] ").strip().lower() != "y":   # permission check #2: ask a human
        return "the user refused this write"
    inside(path).write_text(content, encoding="utf-8")
    return f"wrote {len(content)} characters to {path}"

TOOLS = {f.__name__: f for f in (list_files, read_file, write_file)}
SCHEMAS = [
    {"type": "function", "function": {"name": "list_files", "description": "List files in a workspace folder",
        "parameters": {"type": "object", "properties": {"path": {"type": "string"}}}}},
    {"type": "function", "function": {"name": "read_file", "description": "Read a UTF-8 text file from the workspace",
        "parameters": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}}},
    {"type": "function", "function": {"name": "write_file", "description": "Create or overwrite a text file in the workspace",
        "parameters": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}},
                       "required": ["path", "content"]}}},
]

def chat(messages):
    body = json.dumps({"model": MODEL, "messages": messages, "tools": SCHEMAS}).encode()
    req = urllib.request.Request(BASE.rstrip("/") + "/chat/completions", data=body,
                                 headers={"Content-Type": "application/json", "Authorization": f"Bearer {KEY}"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)["choices"][0]["message"]

def run(task, max_steps=10):
    messages = [{"role": "system", "content": "You work inside a sandboxed workspace. Use the tools; never guess file contents."},
                {"role": "user", "content": task}]
    for step in range(max_steps):              # the loop is the agent
        msg = chat(messages)
        messages.append(msg)
        if not msg.get("tool_calls"):
            return msg.get("content")
        for call in msg["tool_calls"]:
            name, args = call["function"]["name"], json.loads(call["function"]["arguments"] or "{}")
            try:
                result = TOOLS[name](**args)
            except Exception as e:             # errors go back to the model, not up the stack
                result = f"error: {e}"
            print(f"[{step}] {name}({args}) -> {str(result)[:60]!r}")   # the trace: your first eval tool
            messages.append({"role": "tool", "tool_call_id": call["id"], "content": str(result)})
    return "stopped: step limit reached"

if __name__ == "__main__":
    print(run("Summarise every .txt file in the workspace into summary.md"))
