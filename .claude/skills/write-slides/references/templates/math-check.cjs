// math-check.cjs — confirm the deck's LaTeX math actually RENDERS (not raw source).
//
// WHY: the static Node smoke test only checks that `$…$` became `<span class="math">` spans —
// it CANNOT see whether they render. A broken engine (e.g. html-math-method: katex in revealjs)
// leaves the spans as raw `\hat\alpha`, which the static test happily passes. This drives a real
// browser and fails if ANY slide shows raw backslash-LaTeX.
//
// Usage:
//   NODE_PATH=<dir containing node_modules/playwright> node math-check.cjs <abs path to index.html>
// Playwright is often only in the npx cache; find it with:
//   find "$HOME/.npm/_npx" -path '*node_modules/playwright/package.json' | head -1
// then NODE_PATH=<that .../node_modules>. Uses the system Chrome (channel:'chrome'); falls back
// to Playwright's bundled Chromium if present.

const { chromium } = require("playwright");

(async () => {
  const file = process.argv[2];
  if (!file) { console.error("usage: node math-check.cjs <abs index.html>"); process.exit(2); }
  let browser;
  try { browser = await chromium.launch({ channel: "chrome" }); }
  catch { try { browser = await chromium.launch(); }
          catch (e) { console.error("[✗] cannot launch a browser:", e.message.split("\n")[0]); process.exit(2); } }

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto("file://" + file, { waitUntil: "load", timeout: 30000 });
  // Wait for MathJax to produce rendered output.
  await page.waitForSelector(".MathJax, mjx-container", { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1800);

  // Traverse EVERY slide with Reveal.next() (covers vertical sub-slides under `#` dividers —
  // Reveal.slide(i) only moves horizontally and would miss the content slides).
  await page.evaluate(() => window.Reveal && Reveal.slide(0, 0, 0));
  const total = await page.evaluate(() => (window.Reveal ? Reveal.getTotalSlides() : 1));
  const leaks = [];
  for (let k = 0; k < total; k++) {
    await page.waitForTimeout(220);
    const vis = await page.evaluate(() => {
      const s = document.querySelector("section.present") || document.body;
      return s.innerText || "";                       // visible text of the current slide only
    });
    const m = vis.match(/\\[a-zA-Z]+|\\\(|\\\)/g);     // raw LaTeX commands / \( \) delimiters
    if (m) leaks.push({ slide: k, raw: [...new Set(m)].slice(0, 6) });
    await page.evaluate(() => window.Reveal && Reveal.next());
  }
  await browser.close();

  console.log(`slides traversed: ${total}`);
  if (leaks.length) {
    console.log("[✗] RAW LATEX VISIBLE — math is NOT rendering:", JSON.stringify(leaks));
    process.exit(1);
  }
  console.log("[✓] no raw LaTeX on any slide — math renders");
  process.exit(0);
})();
