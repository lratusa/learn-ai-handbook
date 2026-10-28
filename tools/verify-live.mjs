// Checks a deployed copy in a real browser: each edition loads with its CSS and JS, the self-check
// works, there are no script errors, and the Open Graph image is served.
// Usage: node tools/verify-live.mjs [url=https://www.gitechdesign.com/learn-ai/]
import { COURSES, STATIONS } from "../content/courses.mjs";
import { LANGS, OFFICIAL } from "../build.mjs";
import { launch } from "./lib.mjs";

const base = (process.argv[2] || OFFICIAL).replace(/\/?$/, "/");
const cards = STATIONS.reduce((n, s) => n + s.courses.length, 0);
const browser = await launch();
let fail = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "OK  " : "FAIL"} ${msg}`);
  if (!cond) fail++;
};

for (const L of LANGS) {
  const url = base + L.dir;
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const types = {};
  page.on("response", (r) => {
    if (/\/assets\/[^/]+$/.test(r.url().split("?")[0])) types[r.url().split("?")[0].split("/").pop()] = r.headers()["content-type"];
  });
  const res = await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  const info = await page.evaluate(() => ({
    title: document.title,
    plat: document.documentElement.dataset.platform,
    radius: getComputedStyle(document.querySelector(".course")).borderRadius,
    cards: document.querySelectorAll(".course").length,
  }));
  for (let i = 0; i < 7; i++) await page.click(`[data-q="${i}"][data-v="y"]`);
  const quiz = await page.$eval("#quiz-result", (el) => el.innerText.split("\n")[0]);
  ok(res.status() === 200, `${url} HTTP ${res.status()} · ${info.title}`);
  ok(info.plat === L.platform && info.radius === "22px" && info.cards === cards, `${url} platform=${info.plat} css=${info.radius} cards=${info.cards}/${cards}`);
  ok(/3/.test(quiz), `${url} self-check → “${quiz}”`);
  ok(/text\/css/.test(types["style.css"] || "") && /javascript/.test(types["app.js"] || ""), `${url} assets ${JSON.stringify(types)}`);
  ok(errors.length === 0, `${url} script errors: ${errors.length ? errors.join(" | ") : "none"}`);
  await page.close();
}
const page = await browser.newPage();
const og = await page.goto(base + "assets/og.png");
ok(og.status() === 200 && /image\/png/.test(og.headers()["content-type"]), `og.png ${og.status()} ${og.headers()["content-type"]}`);
await browser.close();
console.log(fail ? `\n${fail} check(s) failed` : `\nall checks passed (${Object.keys(COURSES).length} courses in the catalogue)`);
process.exitCode = fail ? 1 : 0;
