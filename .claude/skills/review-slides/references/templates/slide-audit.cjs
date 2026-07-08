// slide-audit.cjs — drive a real browser to audit a Quarto reveal.js deck.
//
// Extends write-slides' math-check.cjs. Walks EVERY slide and reports, per slide:
//   1. math render — raw backslash-LaTeX still visible? (engine broken / not typeset)
//   2. overflow    — does the slide's content extend past the reveal slide box?
//   3. density     — visible word count and bullet (<li>) count on the slide
//
// Plus a one-time DESIGN/BRANDING pass on the title slide (folds into Dim 7/8):
//   4. background  — the deck canvas is the brand light cool gray #eef1f6 (not white)
//   5. accent rule — the thin orange rule under the title (#title-slide .title::after)
//   6. byline      — author name larger than institute/date (refined byline)
//   7. pipeline    — if the key-result strip has kr-arrows, it must be a WORD strip
//                    (Learn->Explore->Research), never a numeric one
//   8. takeaway    — deck-wide count of .takeaway concluding cards
//
// The review-slides skill folds these into Dimensions 3 (math), 5/9 (density),
// 9 (overflow), 7 (takeaway), and 8 (background/accent/byline/pipeline).
// It is READ-ONLY — it only inspects the rendered deck.
//
// Usage (no NODE_PATH needed — Playwright is auto-located):
//   node slide-audit.cjs <abs path to index.html>
// First run only, if Playwright is missing:  npx playwright install chromium
// Uses system Chrome (channel:'chrome'); falls back to Playwright's bundled Chromium.
//
// Exit codes: 0 = no HIGH visual issue; 1 = raw LaTeX OR clipping overflow on some
// slide; 2 = usage / browser-launch error; 3 = Playwright not installed.
// Density AND the design/branding signals are reported but do NOT change the exit
// code (they are MED/Dim-8 findings the skill weighs, not hard browser failures).

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const { createRequire } = require("module");

// Tunable caps (kept in sync with readability-rules.md / headless-browser.md).
const WORD_CAP = 60;     // visible words on a single slide before it reads as dense
const BULLET_CAP = 5;    // <li> bullets before the slide is overloaded
const OVERFLOW_TOL = 8;  // px of slop allowed before content counts as overflowing
const BRAND_BG = "rgb(238, 241, 246)";    // $body-bg: #eef1f6 — the deliberate light cool gray canvas
const BRAND_ORANGE = "rgb(217, 119, 87)"; // $orange: #d97757 — the title accent rule color

// Resolve Playwright from any reachable install (project, npx cache, global npm
// root) — hash-agnostic, mirrors math-check.cjs.
function loadChromium() {
  try { return require("playwright").chromium; } catch (_) {}
  try { return require("playwright-core").chromium; } catch (_) {}
  const candidates = [];
  const npxRoot = path.join(os.homedir(), ".npm", "_npx");
  if (fs.existsSync(npxRoot)) {
    for (const sub of fs.readdirSync(npxRoot)) candidates.push(path.join(npxRoot, sub, "node_modules"));
  }
  try {
    const globalRoot = execSync("npm root -g", { encoding: "utf8" }).trim();
    if (globalRoot) candidates.push(globalRoot);
  } catch (_) {}
  for (const nm of candidates) {
    if (!fs.existsSync(path.join(nm, "playwright", "package.json"))) continue;
    try { return createRequire(path.join(nm, "_anchor.js"))("playwright").chromium; } catch (_) {}
  }
  return null;
}

(async () => {
  const file = process.argv[2];
  if (!file) { console.error("usage: node slide-audit.cjs <abs index.html>"); process.exit(2); }
  const chromium = loadChromium();
  if (!chromium) {
    console.error("[~] Playwright not found. Run: npx playwright install chromium");
    process.exit(3);
  }
  let browser;
  try { browser = await chromium.launch({ channel: "chrome" }); }
  catch { try { browser = await chromium.launch(); }
          catch (e) { console.error("[✗] cannot launch a browser:", e.message.split("\n")[0]); process.exit(2); } }

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto("file://" + file, { waitUntil: "load", timeout: 30000 });
  await page.waitForSelector(".MathJax, mjx-container", { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1800);

  // Walk every slide with Reveal.next() (covers vertical sub-slides under `#` dividers).
  await page.evaluate(() => window.Reveal && Reveal.slide(0, 0, 0));
  const total = await page.evaluate(() => (window.Reveal ? Reveal.getTotalSlides() : 1));

  // --- One-time DESIGN/BRANDING pass (title slide is present after Reveal.slide(0)) ---
  await page.waitForTimeout(200);
  const design = await page.evaluate((brands) => {
    const out = {};
    // (5) Page background: whichever ancestor carries the canvas color.
    const bgEls = [document.querySelector(".reveal-viewport"), document.querySelector(".reveal"), document.body];
    const bgs = bgEls.filter(Boolean).map((el) => getComputedStyle(el).backgroundColor);
    out.bg = bgs.find((c) => c === brands.bg) || bgs.find((c) => c && c !== "rgba(0, 0, 0, 0)") || bgs[0] || "";
    out.bgOk = bgs.includes(brands.bg);
    // The actual title slide is id="title-slide" (NOT the reveal .title-slide class).
    const title = document.querySelector("#title-slide .title");
    // (2) Accent rule: the ::after under the title.
    if (title) {
      const af = getComputedStyle(title, "::after");
      const h = parseFloat(af.height) || 0;
      out.accentOk = af.content !== "none" && (h > 0 || af.backgroundColor === brands.orange);
    } else out.accentOk = null;
    // (3) Byline: author font-size larger than institute/date.
    const fs = (sel) => { const e = document.querySelector("#title-slide " + sel); return e ? parseFloat(getComputedStyle(e).fontSize) : 0; };
    const au = fs(".author"), inst = fs(".institute"), dt = fs(".date");
    out.bylineOk = au > 0 && (inst > 0 || dt > 0) && au > Math.max(inst, dt);
    out.bylineSizes = { author: au, institute: inst, date: dt };
    // (4) Pipeline arrows: only valid on a WORD key-result strip.
    const arrows = document.querySelectorAll("#title-slide .kr-arrow").length;
    if (!arrows) out.pipeline = "none";
    else {
      const nums = [...document.querySelectorAll("#title-slide .kr-num")].map((e) => (e.innerText || "").trim());
      const numeric = nums.filter((t) => /^[\s\-−+]*[\d.,]+$/.test(t)).length;
      out.pipeline = numeric ? "NUMERIC" : "word-ok";
      out.krNums = nums;
    }
    // (1) Concluding takeaway cards — count deck-wide once (a per-slide walk over-counts,
    // because Reveal.next() steps through fragments and revisits slides).
    out.takeaways = document.querySelectorAll(".takeaway").length;
    return out;
  }, { bg: BRAND_BG, orange: BRAND_ORANGE }).catch(() => ({}));
  const dbFlags = design || {};

  const rows = [];
  let rawLatex = 0, overflow = 0, dense = 0;

  for (let k = 0; k < total; k++) {
    await page.waitForTimeout(220);
    const info = await page.evaluate((tol) => {
      const s = document.querySelector("section.present") || document.body;
      const text = (s.innerText || "").trim();
      const words = text ? text.split(/\s+/).length : 0;
      const bullets = s.querySelectorAll("li").length;
      // Raw LaTeX commands / \( \) delimiters still visible = math not typeset.
      const m = text.match(/\\[a-zA-Z]+|\\\(|\\\)/g);
      const raw = m ? [...new Set(m)].slice(0, 6) : [];
      // Overflow: does any child extend past the slide container's box?
      const slideBox = s.getBoundingClientRect();
      let over = false;
      for (const el of s.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.height === 0 && r.width === 0) continue;
        if (r.bottom > slideBox.bottom + tol || r.right > slideBox.right + tol ||
            r.top < slideBox.top - tol || r.left < slideBox.left - tol) { over = true; break; }
      }
      // Best-effort assertion title = first heading text on the slide.
      const h = s.querySelector("h1, h2, h3");
      const title = h ? (h.innerText || "").trim().slice(0, 50) : "";
      return { words, bullets, raw, over, title };
    }, OVERFLOW_TOL);

    if (info.raw.length) rawLatex++;
    if (info.over) overflow++;
    if (info.words > WORD_CAP || info.bullets > BULLET_CAP) dense++;

    rows.push({ slide: k, ...info });
    await page.evaluate(() => window.Reveal && Reveal.next());
  }
  await browser.close();

  // Per-slide lines (machine-readable-ish; the skill folds these into dimensions).
  for (const r of rows) {
    const flags = [];
    if (r.raw.length) flags.push("RAW-LATEX:" + r.raw.join(","));
    if (r.over) flags.push("OVERFLOW");
    if (r.words > WORD_CAP) flags.push("WORDS:" + r.words);
    if (r.bullets > BULLET_CAP) flags.push("BULLETS:" + r.bullets);
    const tag = flags.length ? "[!] " + flags.join(" ") : "[ok]";
    console.log(`slide ${String(r.slide).padStart(2)} ${tag}  words=${r.words} bullets=${r.bullets}` +
                (r.title ? `  "${r.title}"` : ""));
  }

  console.log(`\nslides traversed: ${total}`);
  console.log(`raw-latex slides: ${rawLatex}   overflow slides: ${overflow}   dense slides: ${dense}` +
              `   (caps: ${WORD_CAP} words / ${BULLET_CAP} bullets)`);

  // --- Design / branding summary (folds into Dim 7/8; never changes the exit code) ---
  const bg = dbFlags.bgOk ? "ok" : `MISMATCH:${dbFlags.bg || "?"} (want ${BRAND_BG})`;
  const accent = dbFlags.accentOk == null ? "n/a (no #title-slide .title)" : dbFlags.accentOk ? "ok" : "MISSING";
  const byline = dbFlags.bylineOk ? "refined" : `FLAT (author=${dbFlags.bylineSizes ? dbFlags.bylineSizes.author : "?"}px vs inst/date)`;
  const pipe = dbFlags.pipeline === "NUMERIC" ? `ARROWS-ON-NUMERIC! (${(dbFlags.krNums || []).join(", ")})`
             : dbFlags.pipeline === "word-ok" ? "word-strip ok"
             : "none";
  console.log("\ndesign/branding (title slide):");
  console.log(`  background:  ${bg}`);
  console.log(`  accent-rule: ${accent}`);
  console.log(`  byline:      ${byline}`);
  console.log(`  pipeline:    ${pipe}`);
  console.log(`  takeaway-cards: ${dbFlags.takeaways != null ? dbFlags.takeaways : "?"}`);
  const dbIssues = [];
  if (!dbFlags.bgOk) dbIssues.push("background");
  if (dbFlags.accentOk === false) dbIssues.push("accent-rule");
  if (!dbFlags.bylineOk) dbIssues.push("byline");
  if (dbFlags.pipeline === "NUMERIC") dbIssues.push("arrows-on-numeric");
  console.log(dbIssues.length
    ? `[!] design/branding to review (Dim 8): ${dbIssues.join(", ")}`
    : "[✓] design/branding: background, accent rule, byline, pipeline all on-brand");

  if (rawLatex || overflow) {
    console.log("[✗] HIGH visual issue: " +
      (rawLatex ? `${rawLatex} slide(s) show raw LaTeX` : "") +
      (rawLatex && overflow ? "; " : "") +
      (overflow ? `${overflow} slide(s) overflow the box` : ""));
    process.exit(1);
  }
  console.log("[✓] math renders on every slide; no overflow" +
              (dense ? `; ${dense} dense slide(s) flagged (MED)` : ""));
  process.exit(0);
})();
