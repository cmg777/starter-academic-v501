// slide-audit.cjs — drive a real browser to audit a Quarto reveal.js deck.
//
// Extends write-slides' math-check.cjs. Walks EVERY slide and reports, per slide:
//   1. math render — raw backslash-LaTeX still visible? (engine broken / not typeset)
//   2. overflow    — does the slide's content extend past the reveal slide box?
//   3. density     — visible word count and bullet (<li>) count on the slide
//
// The review-slides skill folds these into Dimensions 3 (math), 5/9 (density),
// and 9 (overflow). It is READ-ONLY — it only inspects the rendered deck.
//
// Usage (no NODE_PATH needed — Playwright is auto-located):
//   node slide-audit.cjs <abs path to index.html>
// First run only, if Playwright is missing:  npx playwright install chromium
// Uses system Chrome (channel:'chrome'); falls back to Playwright's bundled Chromium.
//
// Exit codes: 0 = no HIGH visual issue; 1 = raw LaTeX OR clipping overflow on some
// slide; 2 = usage / browser-launch error; 3 = Playwright not installed.
// Density over the caps is reported but does NOT change the exit code (it is a MED
// the skill weighs, not a hard browser failure).

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const { createRequire } = require("module");

// Tunable caps (kept in sync with readability-rules.md / headless-browser.md).
const WORD_CAP = 60;     // visible words on a single slide before it reads as dense
const BULLET_CAP = 5;    // <li> bullets before the slide is overloaded
const OVERFLOW_TOL = 8;  // px of slop allowed before content counts as overflowing

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
