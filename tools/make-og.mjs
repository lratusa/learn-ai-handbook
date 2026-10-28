// Renders assets/og.png (1200×630) by screenshotting an HTML card in a headless browser,
// so CJK text uses real system fonts. Usage: node tools/make-og.mjs
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { launch } from "./lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const iri = "linear-gradient(102deg,#4E8CFF,#8B7BFF,#C77BFF,#FF7EB0,#FFB37A)";
const stops = ["0 基础", "1 机器学习", "2 CNN", "3 大模型", "4 Agent"];

const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#fff;font-family:"Microsoft YaHei","PingFang SC","Segoe UI",sans-serif;color:#1D1D1F;position:relative;overflow:hidden}
.glow{position:absolute;width:760px;height:380px;right:-200px;top:-120px;border-radius:50%;background:${iri};filter:blur(90px);opacity:.22}
.wrap{position:absolute;inset:0;padding:70px 80px}
.k{font-size:24px;font-weight:600;background:${iri};-webkit-background-clip:text;color:transparent;display:inline-block}
h1{font-size:76px;line-height:1.12;letter-spacing:-1.5px;margin-top:22px;font-weight:800}
h1 span{background:${iri};-webkit-background-clip:text;color:transparent}
p{font-size:28px;color:#6E6E73;margin-top:22px}
.path{position:absolute;left:80px;right:80px;bottom:70px;display:flex;justify-content:space-between}
.path::before{content:"";position:absolute;left:14px;right:14px;top:14px;height:3px;background:${iri};opacity:.7}
.s{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:12px;font-size:22px;font-weight:600}
.s i{width:30px;height:30px;border-radius:50%;background:#fff;border:3px solid #8B7BFF}
.s:last-child{align-items:flex-end}
</style></head><body><div class="glow"></div><div class="wrap">
<span class="k">际和科技 · 公益 · GiTech Design</span>
<h1>用 B 站学 AI<br><span>从零到亲手训模型、搭 Agent</span></h1>
<p>Learn AI from Stanford's open courses · 中文 / English / 日本語 / Français</p>
</div><div class="path">${stops.map((s) => `<div class="s"><i></i>${s}</div>`).join("")}</div></body></html>`;

const browser = await launch();
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.screenshot({ path: join(ROOT, "assets", "og.png") });
await browser.close();
console.log("wrote assets/og.png");
