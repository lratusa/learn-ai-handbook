// Checks for the handbook generator (build.mjs) and its four language editions.
// Run: node --test test/handbook.test.mjs   (builds into a temporary folder; no network needed)
import test from "node:test";
import assert from "node:assert";
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COURSES, STATIONS } from "../content/courses.mjs";
import { LANGS, REPO, build, loadConfig, resolveConfig } from "../build.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const [zh] = LANGS;
const TMP = mkdtempSync(join(tmpdir(), "learn-ai-"));
test.after(() => rmSync(TMP, { recursive: true, force: true }));

// Three ways the site gets built: the official edition, a self-hosted copy that knows its address,
// and a bare copy (no address, served from the root).
const BUILDS = {
  official: await loadConfig(join(ROOT, "config", "gitechdesign.mjs")),
  mirror: resolveConfig({ siteUrl: "https://example.org/handbook/" }),
  bare: resolveConfig({}),
};
for (const [name, cfg] of Object.entries(BUILDS)) await build(cfg, join(TMP, name));
const pageOf = (name, L) => readFileSync(join(TMP, name, L.dir, "index.html"), "utf8");

/** Shape of a value: keys and array lengths, not the text. */
function shape(v) {
  if (Array.isArray(v)) return v.map(shape);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, shape(v[k])]));
  return typeof v;
}

/** Every string leaf with its path, for cross-language comparisons. */
function leaves(v, path = "", out = {}) {
  if (typeof v === "string") out[path] = v;
  else if (v && typeof v === "object") for (const k of Object.keys(v)) leaves(v[k], path + "/" + k, out);
  return out;
}

// The setup section is regional on purpose (China: mirrors, local platforms; overseas: Colab, global
// APIs), so only its keys must match; everything else is a translation of zh, item for item.
const strip = ({ setup, ...rest }) => rest;

test("config defaults", () => {
  assert.deepStrictEqual(resolveConfig({}), { siteUrl: "", basePath: "/", icp: "", official: false });
  assert.strictEqual(resolveConfig({ siteUrl: "https://a.b/x/y/" }).basePath, "/x/y/");
  assert.strictEqual(resolveConfig({ siteUrl: "https://a.b" }).basePath, "/");
  assert.strictEqual(resolveConfig({ basePath: "repo" }).basePath, "/repo/");
});

test("every language edition has exactly the zh structure", () => {
  for (const L of LANGS.slice(1)) {
    assert.deepStrictEqual(shape(strip(L)), shape(strip(zh)), `${L.lang} differs from zh`);
    assert.deepStrictEqual(Object.keys(L.setup).sort(), Object.keys(zh.setup).sort(), `${L.lang} setup keys`);
  }
});

test("placeholders and in-page anchors survive translation", () => {
  const zl = leaves(strip(zh));
  for (const L of LANGS.slice(1)) {
    const ll = leaves(strip(L));
    for (const [p, s] of Object.entries(zl)) {
      const ph = (x) => (x.match(/\{\w+\}/g) || []).sort().join();
      const anchors = (x) => (x.match(/href="#[^"]+"/g) || []).sort().join();
      assert.strictEqual(ph(ll[p]), ph(s), `${L.lang}${p}: placeholders`);
      assert.strictEqual(anchors(ll[p]), anchors(s), `${L.lang}${p}: in-page links`);
    }
  }
});

test("every course on the route has data and text in all languages", () => {
  for (const s of STATIONS) for (const [id] of s.courses) {
    assert.ok(COURSES[id], `courses.mjs lacks ${id}`);
    for (const L of LANGS) assert.ok(L.courses[id]?.why, `${L.lang} lacks text for ${id}`);
  }
  for (const L of LANGS) assert.strictEqual(L.stations.length, STATIONS.length, `${L.lang} station count`);
});

test("course links are well-formed", () => {
  for (const [id, c] of Object.entries(COURSES)) {
    for (const b of c.bili || []) assert.match(b.url, /^https:\/\/www\.bilibili\.com\/video\/BV[0-9A-Za-z]{10}\/?$/, id);
    if (c.yt) assert.match(c.yt.url, /^https:\/\/www\.youtube\.com\/(playlist\?list=[\w-]+|watch\?v=[\w-]+|@[\w-]+)/, id);
    for (const u of [c.site, ...(c.materials || []).map((m) => m.url), c.primary?.url].filter(Boolean))
      assert.match(u, /^(https:\/\/|\/)/, `${id}: ${u}`);
    for (const m of [...(c.materials || []), c.primary].filter((m) => m && !m.label))
      for (const L of LANGS) assert.ok(L.ui[m.k], `${L.lang} ui lacks a label for "${m.k}" (${id})`);
    if (!c.noVideo) assert.ok(c.biliSearch, `${id} needs a Bilibili search keyword`);
  }
});

test("French copy uses no-break spaces before high punctuation", () => {
  const fr = LANGS.find((L) => L.lang === "fr");
  for (const [p, s] of Object.entries(leaves(fr))) {
    const text = s.replace(/<[^>]+>/g, "").replace(/https?:\/\/\S+/g, "");
    assert.ok(!/ [:;!?»]/.test(text) && !/« /.test(text), `fr${p}: ordinary space next to :;!?«» in “${text.slice(0, 80)}”`);
  }
});

test("generated pages are complete and self-consistent", () => {
  for (const name of Object.keys(BUILDS)) for (const L of LANGS) {
    const html = pageOf(name, L);
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(target), `${name}/${L.lang}: #${target} has no target`);
    for (const s of STATIONS) assert.ok(ids.has(s.id), `${name}/${L.lang}: station ${s.id}`);
    assert.ok(html.includes(`<html lang="${L.htmlLang}" data-platform="${L.platform}">`), `${name}/${L.lang}: html lang/platform`);
    const blob = html.match(/<script type="application\/json" id="la-i18n">([\s\S]*?)<\/script>/);
    assert.ok(blob && JSON.parse(blob[1]).quiz.qs.length === 7, `${name}/${L.lang}: i18n blob`);
    const visible = html.replace(/<script type="application\/json"[\s\S]*?<\/script>/, "");
    assert.ok(!/\{(n|t|p|date|org|h|title|up|ch|repo|repoName|official|officialName)\}/.test(visible), `${name}/${L.lang}: unfilled placeholder`);
    assert.ok(!/undefined|\[object Object\]/.test(html), `${name}/${L.lang}: undefined leaked into the page`);
    assert.ok(html.includes(`href="${REPO}"`), `${name}/${L.lang}: link to the source repository`);
  }
});

test("official edition: canonical URLs, ICP line, relative links to the company site", () => {
  for (const L of LANGS) {
    const html = pageOf("official", L);
    assert.ok(html.includes(`<link rel="canonical" href="https://www.gitechdesign.com/learn-ai/${L.dir}">`), `${L.lang}: canonical`);
    for (const x of LANGS) assert.ok(html.includes(`hreflang="${x.hreflang}" href="https://www.gitechdesign.com/learn-ai/${x.dir}"`), `${L.lang}: hreflang ${x.hreflang}`);
    assert.ok(html.includes('href="/learn-ai/assets/style.css?v=') && html.includes('src="/learn-ai/assets/app.js?v='), `${L.lang}: assets`);
    assert.ok(html.includes("京ICP备2022003471号-1"), `${L.lang}: ICP line`);
    assert.ok(html.includes(`<a class="brand" href="${L.home}">`), `${L.lang}: relative home link`);
    assert.ok(!html.includes(`<a href="https://www.gitechdesign.com/learn-ai/${L.dir}">`), `${L.lang}: self-hosted note on the official site`);
  }
});

test("self-hosted copies: own URLs and base path, no ICP, absolute links to the company site", () => {
  for (const L of LANGS) {
    const m = pageOf("mirror", L);
    assert.ok(m.includes(`<link rel="canonical" href="https://example.org/handbook/${L.dir}">`), `${L.lang}: mirror canonical`);
    assert.ok(m.includes('content="https://example.org/handbook/assets/og.png"'), `${L.lang}: og:image`);
    for (const [, u] of m.matchAll(/(?:href|src)="(\/[^"]*)"/g)) assert.ok(u.startsWith("/handbook/"), `${L.lang}: mirror link ${u} escapes the base path`);
    const b = pageOf("bare", L);
    assert.ok(!/rel="canonical"|hreflang=|og:url|og:image/.test(b), `${L.lang}: bare build must not guess its URL`);
    assert.ok(b.includes('href="/assets/style.css?v='), `${L.lang}: bare assets at the root`);
    // company pages such as /zh/, /cs329a/, /en/research/ must not stay relative; in the bare build
    // the handbook's own language pages are exactly /en/, /ja/, /fr/
    assert.ok(!/href="\/(zh|en|ja|fr|cs329a)\//.test(m), `${L.lang}: company page left as a relative link (mirror)`);
    assert.ok(!/href="\/(zh|cs329a)\/|href="\/(en|ja|fr)\/[^"]/.test(b), `${L.lang}: company page left as a relative link (bare)`);
    for (const html of [m, b]) {
      assert.ok(!html.includes("京ICP备"), `${L.lang}: ICP line on a copy`);
      assert.ok(html.includes(`<a class="brand" href="https://www.gitechdesign.com${L.home}">`), `${L.lang}: absolute home link`);
      assert.ok(html.includes(`<a href="https://www.gitechdesign.com/learn-ai/${L.dir}">`), `${L.lang}: link to the official edition`);
    }
  }
});

test("every asset a page references is in the output", () => {
  for (const [name, cfg] of Object.entries(BUILDS)) {
    const html = pageOf(name, zh);
    let n = 0;
    for (const [, u] of html.matchAll(/(?:href|src)="([^"#?]+)(?:\?v=[^"]*)?"/g)) {
      if (!u.startsWith(cfg.basePath + "assets/")) continue;
      assert.ok(existsSync(join(TMP, name, u.slice(cfg.basePath.length))), `${name}: ${u} missing`);
      n++;
    }
    assert.ok(n >= 4, `${name}: expected the icon, stylesheet and script, found ${n} asset links`);
  }
});

test("code on the page is byte-for-byte the tested snippet", () => {
  const html = pageOf("official", zh);
  for (const name of ["s1_gd", "s2_loop", "s3_attn", "s4_agent"]) {
    const src = readFileSync(join(ROOT, "snippets", name + ".py"), "utf8").replace(/\r\n/g, "\n").trimEnd();
    const block = html.match(new RegExp(`<pre id="code-${name}"><code>([\\s\\S]*?)</code></pre>`));
    assert.ok(block, `${name} missing on page`);
    const text = block[1].replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    assert.strictEqual(text, src, `${name} on the page differs from the tested file`);
  }
});
