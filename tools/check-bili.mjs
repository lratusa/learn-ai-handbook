// Opens Bilibili video pages in a normal (headless) browser, one at a time with pauses, and prints
// what a human would read on the page: title, uploader, number of parts, views.
// Stops at the first sign of a verification page.
// Usage: node tools/check-bili.mjs [BV... ]   (no arguments: every Bilibili link in content/courses.mjs)
import { COURSES } from "../content/courses.mjs";
import { launch } from "./lib.mjs";

const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : Object.values(COURSES).flatMap((c) => (c.bili || []).map((b) => b.url.match(/BV\w{10}/)[0]));
const browser = await launch(["--lang=zh-CN"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The page sometimes redirects (e.g. to ?p=1) after load, which kills a running evaluate; retry. */
async function read(page) {
  for (let i = 0; ; i++) {
    try {
      await page.waitForSelector("h1", { timeout: 15000 }).catch(() => {});
      return await page.evaluate(readPage);
    } catch (e) {
      if (i === 2 || !/context was destroyed|detached/i.test(String(e))) throw e;
      await sleep(3000);
    }
  }
}

for (const bv of ids) {
  const page = await browser.newPage();
  try {
    await page.goto(`https://www.bilibili.com/video/${bv}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(3000);
    const info = await read(page);
    console.log(JSON.stringify({ bv, ...info }));
    if (/验证|captcha/i.test(info.docTitle) && !info.title) {
      console.log("STOP: verification page");
      break;
    }
  } catch (e) {
    console.log(JSON.stringify({ bv, error: String(e).slice(0, 120) }));
  } finally {
    await page.close().catch(() => {});
  }
  await sleep(3000);
}
await browser.close().catch(() => {});

function readPage() {
  const meta = (sel) => document.querySelector(sel)?.getAttribute("content") || null;
  const text = (sel) => document.querySelector(sel)?.textContent.trim() || null;
  const desc = meta('meta[name="description"]') || "";
  const pod = (document.body ? document.body.innerText : "").match(/[（(](\d+)\/(\d+)[）)]/); // "(3/11)" multi-part or "（3/11）" collection
  return {
    url: location.href,
    docTitle: document.title,
    title: text("h1") || meta('meta[itemprop="name"]'),
    up: text(".up-name") || meta('meta[itemprop="author"]') || meta('meta[name="author"]'),
    parts: pod ? Number(pod[2]) : Number((desc.match(/共计(\d+)条视频/) || [])[1]) || 1,
    views: text(".view-text"),
  };
}
