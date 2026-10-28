// Fetches every external link on the built pages (except Bilibili video pages, which check-bili.mjs
// opens in a browser, and search-result URLs) and prints the HTTP status.
// Usage: npm run build && node tools/check-links.mjs [dir=dist]
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { LANGS } from "../build.mjs";

const dir = process.argv[2] || "dist";
const urls = new Set();
for (const L of LANGS) {
  const html = await readFile(join(dir, L.dir, "index.html"), "utf8");
  for (const [, u] of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const url = u.replace(/&amp;/g, "&");
    if (/bilibili\.com\/video\/|search\.bilibili\.com|youtube\.com\/results/.test(url)) continue;
    urls.add(url);
  }
}
const list = [...urls].sort();
const bad = [];
async function check(url) {
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
    const line = `${r.status} ${url}${r.url !== url ? "  -> " + r.url : ""}`;
    if (r.status >= 400) bad.push(line);
    console.log(line);
  } catch (e) {
    const line = `ERR ${url}  (${e.cause?.code || e.name})`;
    bad.push(line);
    console.log(line);
  }
}
for (let i = 0; i < list.length; i += 4) await Promise.all(list.slice(i, i + 4).map(check));
console.log(`\n${list.length} links, ${bad.length} not OK${bad.length ? ":\n" + bad.join("\n") : ""}`);
