// Serves a build locally and screenshots each edition (desktop + phone) into .preview/,
// also exercising the platform switch, the self-check and the progress tracker.
// Usage: npm run build && node tools/shoot.mjs [path ...]   e.g. / /en/   (default: all four)
import { mkdir } from "node:fs/promises";
import { LANGS } from "../build.mjs";
import { launch, serve, origin } from "./lib.mjs";

const paths = process.argv.slice(2).length ? process.argv.slice(2) : LANGS.map((L) => "/" + L.dir);
const srv = await serve(process.env.DIST || "dist");
await mkdir(".preview", { recursive: true });

const browser = await launch();
const errors = [];
for (const path of paths) {
  const tag = path.replace(/\//g, "_").replace(/^_|_$/g, "") || "zh";
  for (const [w, h, dev] of [[1440, 900, "desk"], [390, 844, "phone"]]) {
    const page = await browser.newPage();
    page.on("pageerror", (e) => errors.push(`${path} ${dev}: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && errors.push(`${path} ${dev}: console ${m.text()}`));
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.goto(origin(srv) + path, { waitUntil: "networkidle0" });
    // answer the self-check: yes to everything except "hand-written backprop" -> expect stage 2
    for (let i = 0; i < 7; i++) await page.click(`[data-q="${i}"][data-v="${i === 6 ? "n" : "y"}"]`);
    const quiz = await page.$eval("#quiz-result", (el) => el.innerText.split("\n")[0]);
    // tick two items and check the counter
    await page.click('input[data-pk="c:cs229"]');
    await page.click('input[data-pk="m:1:0"]');
    const count = await page.$eval("[data-prog-count]", (el) => el.textContent);
    const plat = await page.evaluate(() => document.documentElement.dataset.platform);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`${path} ${dev}: platform=${plat} quiz="${quiz}" progress=${count} h-overflow=${overflow}px`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `.preview/${tag}_${dev}.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
srv.close();
if (errors.length) {
  console.log("ERRORS:\n" + errors.join("\n"));
  process.exitCode = 1;
}
