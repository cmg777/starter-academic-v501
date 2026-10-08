#!/usr/bin/env node
/**
 * audit-nav.cjs — check the main menu and horizontal overflow at phone, tablet
 * and desktop widths, in English, Spanish and Japanese, on both page systems
 * (the standalone homepage, layouts/index.html, and the Wowchemy content pages).
 *
 * Usage (repo root, after a production build into public/):
 *   "$HOME/Library/Application Support/Hugo/0.111.3/hugo" --gc --minify --buildFuture
 *   node scripts/audit-nav.cjs [--widths 360,390,768,1024,1280,1440] [--pages /,/es/books/]
 *
 * It serves public/ itself on a free localhost port (no other server needed) and
 * drives headless Chromium through Playwright (same lookup as
 * scripts/capture-dashboard-screenshots.cjs; `npx playwright install chromium`
 * once if missing). For every page x width it checks:
 *   - full menu row  -> all items on ONE row, none clipped, a gap before the
 *                       search/language icons, no label wrapping;
 *   - collapsed      -> the toggle opens and shows every menu item;
 *   - the page has no horizontal scroll.
 * Rules it enforces: .claude/docs/design-system.md (menu collapses below 1200px).
 * Exit codes: 0 pass, 1 failures, 3 Playwright missing, 2 bad args / no build.
 */
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { execSync } = require("child_process");
const { createRequire } = require("module");

const ROOT = path.resolve(__dirname, "..");
const PUB = path.join(ROOT, "public");
const EXPECTED_ITEMS = 12;
let widths = [360, 390, 768, 1024, 1280, 1440];
let pages = [
  "/", "/es/", "/ja/",
  "/books/", "/es/webapps/", "/ja/data/",
  "/articles/", "/ja/articles/20220808-arc/",
  "/tutorials/", "/es/tutorials/", "/tutorials/python_did101/",
  "/presentations/", "/software/geometrics/",
];

function loadChromium() {
  try { return require("playwright").chromium; } catch (_) {}
  try { return require("playwright-core").chromium; } catch (_) {}
  const candidates = [];
  const npxRoot = path.join(os.homedir(), ".npm", "_npx");
  if (fs.existsSync(npxRoot)) for (const sub of fs.readdirSync(npxRoot)) candidates.push(path.join(npxRoot, sub, "node_modules"));
  try { candidates.push(execSync("npm root -g", { encoding: "utf8" }).trim()); } catch (_) {}
  for (const nm of candidates) {
    if (!fs.existsSync(path.join(nm, "playwright", "package.json"))) continue;
    try { return createRequire(path.join(nm, "_anchor.js"))("playwright").chromium; } catch (_) {}
  }
  return null;
}

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
    let f = path.join(PUB, p);
    if (!f.startsWith(PUB)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end("404"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(f).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

// Runs inside the page.
function measure() {
  const vw = document.documentElement.clientWidth;
  const r = { vw, hscroll: document.documentElement.scrollWidth > vw };
  const box = (e) => e.getBoundingClientRect();
  const shown = (e) => !!e && getComputedStyle(e).display !== "none" && e.offsetWidth > 0;
  const home = document.querySelector(".desktop-nav");
  let links, icons, toggle;
  if (home) {
    r.sys = "home"; r.full = shown(home);
    links = [...home.querySelectorAll("a")];
    icons = document.querySelector(".header-tools");
    toggle = document.querySelector(".mobile-menu");
    r.toggle = shown(toggle);
  } else {
    const nb = document.querySelector("#navbar-main");
    r.sys = "inner"; r.full = shown(nb.querySelector(".navbar-collapse"));
    links = [...nb.querySelectorAll(".navbar-collapse .nav-link")];
    icons = nb.querySelector(".nav-icons");
    r.toggle = shown(nb.querySelector(".navbar-toggler"));
  }
  r.items = links.length;
  if (r.full && !r.toggle) {
    r.rows = new Set(links.map((a) => Math.round(box(a).top))).size;
    r.clipped = links.filter((a) => box(a).right > vw || box(a).left < 0).length;
    const lh = parseFloat(getComputedStyle(links[0]).lineHeight) || 20;
    r.wrapped = links.filter((a) => a.getClientRects().length > 1 || box(a).height > lh * 1.6 + 16).map((a) => a.textContent.trim());
    r.gap = icons ? Math.round(box(icons).left - box(links[links.length - 1]).right) : null;
  }
  return r;
}

async function openToggle(page, sys) {
  if (sys === "home") {
    await page.click(".mobile-menu summary");
    await page.waitForTimeout(300);
    return page.$$eval(".mobile-menu nav a", (as) => as.filter((a) => a.offsetWidth > 0 && a.offsetHeight > 0).length);
  }
  await page.click("#navbar-main .navbar-toggler");
  await page.waitForTimeout(600);
  return page.$$eval("#navbar-main .navbar-collapse .nav-link", (as) => as.filter((a) => a.offsetWidth > 0 && a.offsetHeight > 0).length);
}

async function main() {
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--widths") widths = argv[++i].split(",").map(Number);
    else if (argv[i] === "--pages") pages = argv[++i].split(",");
    else { console.error(`audit-nav: unknown arg ${argv[i]}`); process.exit(2); }
  }
  if (!fs.existsSync(path.join(PUB, "index.html"))) { console.error("audit-nav: public/ not built"); process.exit(2); }
  const chromium = loadChromium();
  if (!chromium) { console.error("audit-nav: Playwright not found — run: npx playwright install chromium"); process.exit(3); }

  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try { browser = await chromium.launch({ channel: "chrome" }); } catch (_) { browser = await chromium.launch(); }
  const failures = [];
  for (const p of pages) {
    for (const w of widths) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      await page.goto(base + p, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(400);
      const r = await page.evaluate(measure);
      const problems = [];
      if (r.items !== EXPECTED_ITEMS) problems.push(`${r.items} menu items (expected ${EXPECTED_ITEMS})`);
      if (r.full && !r.toggle) {
        if (w < 1200) problems.push("full menu row shown below 1200px");
        if (r.rows !== 1) problems.push(`menu on ${r.rows} rows`);
        if (r.clipped) problems.push(`${r.clipped} item(s) clipped`);
        if (r.wrapped.length) problems.push(`wrapped: ${r.wrapped.join(", ")}`);
        if (r.gap !== null && r.gap < 8) problems.push(`only ${r.gap}px before the icons`);
      } else if (r.toggle) {
        if (w >= 1200) problems.push("collapsed at >=1200px");
        const visible = await openToggle(page, r.sys);
        if (visible !== EXPECTED_ITEMS) problems.push(`toggle shows ${visible}/${EXPECTED_ITEMS} items`);
      } else {
        problems.push("neither the menu row nor the toggle is visible");
      }
      if (r.hscroll) problems.push("horizontal page scroll");
      const mode = r.full && !r.toggle ? `row (gap ${r.gap}px)` : "toggle";
      console.log(`${problems.length ? "FAIL" : "ok  "} ${p.padEnd(30)} ${String(w).padStart(4)}  ${r.sys.padEnd(5)} ${mode}${problems.length ? "  -> " + problems.join("; ") : ""}`);
      if (problems.length) failures.push(`${p} @${w}: ${problems.join("; ")}`);
      await page.close();
    }
  }
  await browser.close();
  server.close();
  console.log(`\n${failures.length ? failures.length + " failure(s)" : "All checks passed"} — ${pages.length} pages x ${widths.length} widths.`);
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
