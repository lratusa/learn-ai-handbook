// Generates the Learn-AI handbook: one static page per language, zh at the root, en/ ja/ fr/ below it.
// One language-neutral course catalogue (content/courses.mjs) + one text module per language
// (content/i18n/*.mjs). The Python snippets are the exact files that test/snippets.py runs.
// Usage: node build.mjs [--config config/default.mjs] [--out dist]
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { COURSES, STATIONS, UPDATED } from "./content/courses.mjs";
import { GLOSSARY } from "./content/glossary.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// LA_LANGS=zh,en limits the build (e.g. while a translation is in progress); zh must come first.
const CODES = (process.env.LA_LANGS || "zh,en,ja,fr").split(",");
export const LANGS = await Promise.all(CODES.map(async (c) => (await import(`./content/i18n/${c}.mjs`)).default));
const SNIPPETS = ["s1_gd", "s2_loop", "s3_attn", "s4_agent"];
const ASSETS = ["style.css", "app.js", "og.png", "favicon.svg", "apple-touch-icon.png"];
// GiTech Design compiles the handbook; the official edition lives on its site.
export const PUBLISHER = "https://www.gitechdesign.com";
export const OFFICIAL = PUBLISHER + "/learn-ai/";
export const REPO = "https://github.com/lratusa/learn-ai-handbook";

/** Fills in defaults: siteUrl without trailing slash, basePath with both slashes (from siteUrl's path if unset). */
export function resolveConfig(c = {}) {
  const siteUrl = (c.siteUrl || "").replace(/\/+$/, "");
  const basePath = `/${c.basePath || (siteUrl ? new URL(siteUrl + "/").pathname : "/")}/`.replace(/\/{2,}/g, "/");
  return { siteUrl, basePath, icp: c.icp || "", official: !!c.official };
}

export async function loadConfig(file) {
  return resolveConfig((await import(pathToFileURL(resolve(file)).href)).default);
}

/** Outside the official site, links to other pages of the company site ("/zh/", href="/cs329a/") become absolute. */
function localize(v, origin) {
  if (typeof v === "string") return v.replace(/^\/(?!\/)/, origin + "/").replace(/href="\/(?!\/)/g, `href="${origin}/`);
  if (Array.isArray(v)) return v.map((x) => localize(x, origin));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, localize(x, origin)]));
  return v;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const attr = esc;
const ext = (href, cls, label) => `<a class="${cls}" href="${attr(href)}" target="_blank" rel="noopener">${label}</a>`;
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (k in o ? o[k] : `{${k}}`));

/** Escape Python source and grey out trailing # comments (snippets keep '#' out of string literals). */
function highlight(code) {
  return code
    .split("\n")
    .map((line) => {
      const m = /(^|\s)(#.*)$/.exec(line);
      if (!m) return esc(line);
      const at = m.index + m[1].length;
      return esc(line.slice(0, at)) + `<span class="cm">${esc(line.slice(at))}</span>`;
    })
    .join("\n");
}

function courseCard(L, id, role, cfg) {
  const c = COURSES[id];
  const t = L.courses[id];
  if (!c || !t) throw new Error(`[${L.lang}] course ${id} missing data or text`);
  const u = L.ui;
  const tag =
    role === "core" ? `<span class="tag core">${u.core}</span>` :
    role === "alt" ? `<span class="tag">${u.alt}</span>` :
    `<span class="tag">${u.optional}</span>`;
  const nonStanford = !c.org.startsWith("Stanford") ? `<span class="tag ext">${esc(fill(u.nonStanford, { org: c.org }))}</span>` : "";
  const watch = t.watch.map((w) => `<p>${w}</p>`).join("");

  const links = [];
  if (c.noVideo) {
    // companion pages / reading lists: same links on both platforms
    if (c.primary) links.push(`<a class="lk go" href="${attr(link(c.primary.url, cfg))}"${c.primary.url.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${u[c.primary.k] || esc(c.primary.k)} ›</a>`);
    for (const m of c.materials || []) links.push(ext(link(m.url, cfg), "lk", esc(m.label || u[m.k] || m.k)));
    return cardShell(L, id, c, t, tag, nonStanford, watch, links, "", role);
  }
  // Bilibili family
  const bsearch = "https://search.bilibili.com/all?keyword=" + encodeURIComponent(c.biliSearch);
  if (c.bili && c.bili.length) {
    links.push(ext(c.bili[0].url, "lk go only-bili", "▶ " + u.watchBili));
    if (c.bili[1]) links.push(ext(c.bili[1].url, "lk only-bili", c.bili[1].label ? esc(fill(u.otherTerm, { t: c.bili[1].label })) : u.backup));
    links.push(ext(bsearch, "lk only-bili", u.searchBili));
  } else {
    links.push(ext(bsearch, "lk go only-bili", "⌕ " + u.searchBili));
  }
  // YouTube family
  if (c.yt) {
    links.push(ext(c.yt.url, "lk go only-yt", "▶ " + u.watchYt));
    if (c.ytAlt) links.push(ext(c.ytAlt.url, "lk only-yt", c.ytAlt.label ? esc(fill(u.otherTerm, { t: c.ytAlt.label })) : u.backup));
  } else {
    links.push(ext("https://www.youtube.com/results?search_query=" + encodeURIComponent(c.ytSearch || c.biliSearch), "lk go only-yt", "⌕ " + u.searchYt));
  }
  if (c.site) links.push(ext(c.site, "lk", u.site));
  for (const m of c.materials || []) links.push(ext(link(m.url, cfg), "lk", u[m.k] || esc(m.k)));

  const srcB = c.bili && c.bili.length
    ? `<p class="src only-bili">${esc(fill(u.srcBili, { title: c.bili[0].title, up: c.bili[0].up, n: c.bili[0].parts ?? "?" }))}${c.bili[0].subs ? " · " + esc(u.subs[c.bili[0].subs] || c.bili[0].subs) : ""}</p>`
    : `<p class="src only-bili">${esc(u.srcBiliNone)}</p>`;
  const srcY = c.yt ? `<p class="src only-yt">${esc(fill(u.srcYt, { title: c.yt.title, ch: c.yt.channel, n: c.yt.n ?? "?" }))}</p>` : "";

  return cardShell(L, id, c, t, tag, nonStanford, watch, links, srcB + srcY, role);
}

/** Root-relative course links point at the company site (e.g. the /cs329a/ companion). */
const link = (url, cfg) => (cfg.official || !/^\/(?!\/)/.test(url) ? url : PUBLISHER + url);

function cardShell(L, id, c, t, tag, nonStanford, watch, links, src, role) {
  const u = L.ui;
  const hours = c.hours ? `<span class="tag">${esc(fill(u.hoursFmt, { h: c.hours }))}</span>` : "";
  return `<article class="course${role === "core" ? " core" : ""}" id="c-${id}">
  <div class="c-top"><span class="code">${esc(c.code)}</span>${tag}${nonStanford}${hours}</div>
  <h3>${esc(c.name)}</h3>
  <p class="by">${esc(c.org)} · ${esc(c.by)}${c.term ? " · " + esc(c.term) : ""}</p>
  <p class="why">${t.why}</p>
  <div class="watch">${watch}</div>
  <div class="links">${links.join("")}</div>
  ${src}
  <label class="done"><input type="checkbox" data-pk="c:${id}"> ${u.markDone}</label>
</article>`;
}

function milestone(L, i, snippets) {
  const m = L.stations[i].ms;
  const u = L.ui;
  const code = m.code
    ? `<div class="codebox"><button class="copy" type="button" data-copy="code-${m.code}">${u.copy}</button><pre id="code-${m.code}"><code>${highlight(snippets[m.code])}</code></pre></div>${m.run ? `<p class="run">${m.run}</p>` : ""}`
    : "";
  const pass = m.pass.map((p, j) => `<li><label><input type="checkbox" data-pk="m:${i}:${j}"> <span>${p}</span></label></li>`).join("");
  return `<div class="ms"><div class="hair"></div>
  <p class="k">${esc(fill(u.milestone, { n: i }))}</p>
  <h3>${m.title}</h3>
  ${m.body.map((p) => `<p>${p}</p>`).join("")}
  ${code}
  ${m.after ? m.after.map((p) => `<p>${p}</p>`).join("") : ""}
  <p style="margin:16px 0 0;font-weight:600;color:#fff">${u.passTitle}</p>
  <ul class="pass">${pass}</ul>
</div>`;
}

function page(L, langs, snippets, cfg) {
  const u = L.ui;
  const B = cfg.basePath;
  const url = cfg.siteUrl ? `${cfg.siteUrl}/${L.dir}` : "";
  // canonical / hreflang / Open Graph need absolute URLs, so they are only emitted when siteUrl is known
  const seo = cfg.siteUrl
    ? [`<link rel="canonical" href="${url}">`,
      ...langs.map((x) => `<link rel="alternate" hreflang="${x.hreflang}" href="${cfg.siteUrl}/${x.dir}">`),
      `<link rel="alternate" hreflang="x-default" href="${cfg.siteUrl}/${langs[0].dir}">`].join("\n") + "\n"
    : "";
  const og = cfg.siteUrl ? `\n<meta property="og:url" content="${url}">\n<meta property="og:image" content="${cfg.siteUrl}/assets/og.png">` : "";
  const langNav = langs.map((x) => `<a href="${B}${x.dir}" lang="${x.htmlLang}"${x.lang === L.lang ? ' aria-current="page"' : ""}>${x.short}</a>`).join("");
  const MAIN = STATIONS.filter((s) => !s.elective);
  const totalCourses = new Set(STATIONS.flatMap((s) => s.courses.map((c) => c[0])).filter((id) => COURSES[id].kind !== "reading")).size;

  const stationsHtml = STATIONS.map((s, i) => {
    const st = L.stations[i];
    const cards = s.courses.map(([id, role]) => courseCard(L, id, role, cfg)).join("\n");
    const ms = st.ms ? milestone(L, i, snippets) : "";
    return `<section class="station" id="${s.id}" aria-labelledby="${s.id}-h">
  <div class="st-head"><div class="st-num" aria-hidden="true">${s.n}</div><div>
    <p class="sec-k">${s.elective ? u.electives : esc(fill(u.station, { n: s.n })) + (s.optional ? " · " + u.optionalStation : "")}</p>
    <h2 id="${s.id}-h">${st.title}</h2>
    <p class="sub" style="margin-bottom:0">${st.goal}</p>
    <div class="chips">${st.weeks ? `<span class="chip k">${esc(st.weeks)}</span>` : ""}${st.chips.map((c) => `<span class="chip">${c}</span>`).join("")}</div>
  </div></div>
  ${st.intro.map((p) => `<p>${p}</p>`).join("")}
  <div class="courses">${cards}</div>
  ${ms}
</section>`;
  }).join("\n");

  const mapHtml = MAIN.map((s, i) => `<li class="${s.optional ? "opt" : ""}"><a href="#${s.id}"><span class="dot">${s.n}</span><b>${L.stations[i].short}</b><span class="ml">${L.stations[i].mapLine}</span><span class="ml wk">${esc(L.stations[i].weeks)}</span></a></li>`).join("");

  const quizHtml = L.quiz.qs.map((q, i) => `<div class="q"><div class="t">${q.q}</div><div class="seg" role="group" aria-label="${attr(u.yesNo)}"><button type="button" data-q="${i}" data-v="y" aria-pressed="false">${u.yes}</button><button type="button" data-q="${i}" data-v="n" aria-pressed="false">${u.no}</button></div></div>`).join("");

  const gl = GLOSSARY.map((g) => `<tr><td${L.lang === "zh" ? ' class="me"' : ""} lang="zh-CN">${g.zh}</td><td${L.lang === "en" ? ' class="me"' : ""} lang="en">${g.en}</td><td${L.lang === "ja" ? ' class="me"' : ""} lang="ja">${g.ja}</td><td${L.lang === "fr" ? ' class="me"' : ""} lang="fr">${g.fr}</td></tr>`).join("");

  const blob = {
    quiz: { qs: L.quiz.qs.map((q) => ({ fix: q.fix || null })), res: L.quiz.res, left: L.quiz.left, go: L.quiz.go },
    progress: { status: L.progress.status, confirm: L.progress.confirm },
    copy: u.copy,
    copied: u.copied,
  };

  return `<!doctype html>
<html lang="${L.htmlLang}" data-platform="${L.platform}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(L.meta.title)}</title>
<meta name="description" content="${attr(L.meta.description)}">
${seo}<meta property="og:type" content="article">
<meta property="og:site_name" content="GiTech Design">
<meta property="og:title" content="${attr(L.meta.ogTitle)}">
<meta property="og:description" content="${attr(L.meta.description)}">${og}
<meta property="og:locale" content="${L.ogLocale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="${B}assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${B}assets/apple-touch-icon.png">
<script>(function(){var p=null;try{var m=/[?&]p=(bili|yt)\\b/.exec(location.search);if(m)p=m[1];}catch(e){}if(!p){try{p=localStorage.getItem("learn-ai-platform");}catch(e){}}if(p==="bili"||p==="yt")document.documentElement.setAttribute("data-platform",p);})();</script>
<link rel="stylesheet" href="${B}assets/style.css?v=${UPDATED}">
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: L.meta.ogTitle,
    description: L.meta.description,
    inLanguage: L.htmlLang,
    ...(url ? { url } : {}),
    isAccessibleForFree: true,
    learningResourceType: "Curriculum",
    dateModified: UPDATED,
    publisher: { "@type": "Organization", name: "GiTech Design", url: PUBLISHER },
  })}</script>
</head>
<body>
<a class="skip" href="#main">${u.skip}</a>
<header class="bar"><div class="wrap">
  <a class="brand" href="${L.home}">${u.brand}</a>
  <span class="grow"></span>
  <a class="pill prog-pill" href="#progress">${u.progress} <b data-prog-count>0/0</b></a>
  <div class="seg" role="group" aria-label="${attr(u.platformLabel)}"><button type="button" data-set-platform="bili" aria-pressed="false">${u.bili}</button><button type="button" data-set-platform="yt" aria-pressed="false">YouTube</button></div>
  <nav class="seg hide-sm" aria-label="${attr(u.langLabel)}">${langNav}</nav>
</div></header>

<main id="main">
<div class="hero"><div class="glow" aria-hidden="true"></div><div class="wrap">
  <span class="kicker">${L.hero.kicker}</span>
  <h1>${L.hero.title}</h1>
  <p class="lead">${L.hero.lead}</p>
  <p class="meta">${fill(L.hero.meta, { date: UPDATED })}</p>
  <nav class="seg" style="margin-top:14px;display:inline-flex" aria-label="${attr(u.langLabel)}">${langNav}</nav>
  <div class="cta"><a class="btn btn-dark" href="#start">${L.hero.cta1} ›</a><a class="btn btn-line" href="#map">${L.hero.cta2}</a></div>
  <div class="stats">${[
    { n: MAIN.length, l: L.hero.stats[0] },
    { n: totalCourses, l: L.hero.stats[1] },
    { n: L.hero.statMonths, l: L.hero.stats[2] },
    { n: "0", l: L.hero.stats[3] },
  ].map((s) => `<div class="stat"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>`).join("")}</div>
  <p class="meta" style="margin-top:14px">${L.hero.platformNote}</p>
</div></div>

<section id="who"><div class="wrap">
  <p class="sec-k">${L.who.k}</p>
  <h2>${L.who.title}</h2>
  <p class="sub">${L.who.sub}</p>
  <div class="grid g2">${L.who.outcomes.map((o, i) => `<div class="card outcome dark"><div class="hair"></div><p class="num">0${i + 1}</p><h3>${o.t}</h3><p>${o.d}</p></div>`).join("")}</div>
  <div class="grid g2" style="margin-top:14px">
    <div class="card soft"><h3>${L.who.forTitle}</h3><ul>${L.who.forList.map((x) => `<li>${x}</li>`).join("")}</ul></div>
    <div class="card soft"><h3>${L.who.notTitle}</h3><ul>${L.who.notList.map((x) => `<li>${x}</li>`).join("")}</ul></div>
  </div>
</div></section>

<section id="start"><div class="wrap narrow">
  <p class="sec-k">${L.quiz.k}</p>
  <h2>${L.quiz.title}</h2>
  <p class="sub">${L.quiz.sub}</p>
  <div class="quiz" id="quiz">${quizHtml}<div class="result" id="quiz-result" aria-live="polite"></div></div>
</div></section>

<section id="map"><div class="wrap">
  <p class="sec-k">${L.mapK}</p>
  <h2>${L.mapTitle}</h2>
  <p class="sub">${L.mapSub}</p>
  <ol class="map">${mapHtml}</ol>
  <p class="branch">${L.mapBranch}</p>
</div></section>

<div class="wrap">
${stationsHtml}
</div>

<section id="setup"><div class="wrap">
  <p class="sec-k">${L.setup.k}</p>
  <h2>${L.setup.title}</h2>
  <p class="sub">${L.setup.sub}</p>
  <div class="grid g2">${L.setup.cards.map((c) => `<div class="card"><h3>${c.t}</h3>${c.d.map((p) => `<p>${p}</p>`).join("")}</div>`).join("")}</div>
  <h3 style="margin-top:28px">${L.setup.apiTitle}</h3>
  <p class="muted">${L.setup.apiSub}</p>
  <div class="scroll"><table class="tbl"><thead><tr>${L.setup.apiHead.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${L.setup.apis.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
</div></section>

<section id="method"><div class="wrap narrow">
  <p class="sec-k">${L.method.k}</p>
  <h2>${L.method.title}</h2>
  <p class="sub">${L.method.sub}</p>
  <ol class="steps">${L.method.items.map((m) => `<li><b>${m.t}</b>${m.d}</li>`).join("")}</ol>
</div></section>

<section id="progress"><div class="wrap narrow">
  <p class="sec-k">${L.progress.k}</p>
  <h2>${L.progress.title}</h2>
  <div class="prog">
    <div class="prog-row"><strong id="prog-text"></strong><button class="linkbtn" id="prog-reset" type="button">${L.progress.reset}</button></div>
    <div class="bartrack"><div class="barfill"></div></div>
    <p class="muted" style="margin:0;font-size:14px">${L.progress.note}</p>
  </div>
</div></section>

<section id="glossary"><div class="wrap">
  <p class="sec-k">${L.glossary.k}</p>
  <h2>${L.glossary.title}</h2>
  <p class="sub">${L.glossary.sub}</p>
  <div class="scroll"><table class="tbl gl"><thead><tr><th>中文</th><th>English</th><th>日本語</th><th>Français</th></tr></thead><tbody>${gl}</tbody></table></div>
</div></section>

<section id="faq"><div class="wrap narrow">
  <p class="sec-k">${L.faq.k}</p>
  <h2>${L.faq.title}</h2>
  ${L.faq.items.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join("")}
</div></section>
</main>

<footer><div class="wrap">
  <div class="row">${L.footer.links.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}</div>
  ${L.footer.notes.map((p) => `<p>${fill(p, { date: UPDATED })}</p>`).join("")}
  <p>${fill(L.footer.source, { repo: REPO, repoName: REPO.replace("https://", "") })}</p>
  ${cfg.official ? "" : `<p>${fill(L.footer.mirror, { official: OFFICIAL + L.dir, officialName: (OFFICIAL + L.dir).replace("https://", "") })}</p>`}
  ${cfg.icp ? `<p><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener" style="color:inherit">${esc(cfg.icp)}</a></p>` : ""}
</div></footer>
<script type="application/json" id="la-i18n">${JSON.stringify(blob).replace(/</g, "\\u003c")}</script>
<script src="${B}assets/app.js?v=${UPDATED}" defer></script>
</body>
</html>
`;
}

/** Writes index.html per language plus assets/ into `out`; returns the pages written. */
export async function build(cfg, out) {
  const snippets = {};
  for (const s of SNIPPETS) snippets[s] = (await readFile(join(HERE, "snippets", s + ".py"), "utf8")).replace(/\r\n/g, "\n").trimEnd();
  const langs = cfg.official ? LANGS : LANGS.map((L) => localize(L, PUBLISHER));
  await mkdir(join(out, "assets"), { recursive: true });
  for (const f of ASSETS) await copyFile(join(HERE, "assets", f), join(out, "assets", f));
  const written = [];
  for (const L of langs) {
    const dir = join(out, L.dir);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.html"), page(L, langs, snippets, cfg));
    written.push(join(dir, "index.html"));
  }
  return written;
}

async function main() {
  const { values } = parseArgs({
    options: { config: { type: "string", default: join(HERE, "config", "default.mjs") }, out: { type: "string", default: join(HERE, "dist") } },
  });
  const cfg = await loadConfig(values.config);
  for (const f of await build(cfg, resolve(values.out))) console.log("wrote", f.replace(/\\/g, "/"));
  console.log(`base path ${cfg.basePath}` + (cfg.siteUrl ? ` · site ${cfg.siteUrl}` : " · no SITE_URL, so canonical/hreflang/og:url tags are left out"));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) await main();
