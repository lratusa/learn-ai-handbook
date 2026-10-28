// Shared helpers for the browser-based tools: find a Chromium-family browser, serve a folder locally.
// The tools need `npm install` (puppeteer-core) and an installed Chrome, Edge or Chromium.
import http from "node:http";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";

const BROWSERS = [
  process.env.CHROME_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/microsoft-edge",
];

export async function launch(args = []) {
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer-core")).default;
  } catch {
    throw new Error("puppeteer-core is missing: run `npm install` first");
  }
  const executablePath = BROWSERS.find((p) => p && existsSync(p));
  if (!executablePath) throw new Error("no Chrome, Edge or Chromium found: set CHROME_PATH to the browser executable");
  return puppeteer.launch({ executablePath, headless: "new", args });
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

/** Serves `dir` on 127.0.0.1 (directories → index.html). Resolves to the server; its URL is `origin(server)`. */
export function serve(dir, port = 0) {
  const root = resolve(dir);
  const srv = http.createServer(async (req, res) => {
    let file = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (file !== root && !file.startsWith(root + sep)) return res.writeHead(403).end();
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" }).end(body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("404");
    }
  });
  return new Promise((ok) => srv.listen(port, "127.0.0.1", () => ok(srv)));
}

export const origin = (srv) => `http://127.0.0.1:${srv.address().port}`;
