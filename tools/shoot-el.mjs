// Screenshots single sections or cards of one edition (element shots avoid the stitching artefacts
// of full-page captures). Usage: npm run build && node tools/shoot-el.mjs /en/ s4 c-cs329z footer
// W=390 sets the viewport width (default 1440).
import { mkdir } from "node:fs/promises";
import { launch, serve, origin } from "./lib.mjs";

const [path, ...ids] = process.argv.slice(2);
const width = Number(process.env.W || 1440);
const srv = await serve(process.env.DIST || "dist");
await mkdir(".preview", { recursive: true });
const browser = await launch();
const page = await browser.newPage();
await page.setViewport({ width, height: 900 });
await page.goto(origin(srv) + path, { waitUntil: "networkidle0" });
for (const id of ids) {
  const el = await page.$(id === "footer" ? "footer" : `#${id}`);
  if (!el) {
    console.log("not found", id);
    continue;
  }
  const file = `.preview/${(path.replace(/\//g, "") || "zh")}_${id}_${width}.png`;
  await el.screenshot({ path: file });
  console.log("shot", file);
}
await browser.close();
srv.close();
