#!/usr/bin/env node
/**
 * capture-dashboard-screenshots.cjs — capture 16:9 thumbnails of the published
 * standalone web apps (Google Earth Engine and Streamlit) via headless Chromium,
 * for the cards on /webapps/.
 *
 * Usage:
 *   npx playwright install chromium     # one-time, only if Playwright/Chrome missing
 *   node scripts/capture-dashboard-screenshots.cjs [--slug <slug>] [--wait <ms>]
 *
 *   --slug <slug>   capture only one app (re-shoot a single tile); repeatable
 *   --wait <ms>     override the post-load settle time (default 10000)
 *
 * APPS below is the single source of truth: add/edit an entry, re-run, commit.
 * Each JPEG is written to the EN bundle then copied byte-for-byte into the ES and
 * JA bundles (page-bundle resources do not cross languages; the app UI is English
 * so one capture serves all three).
 *
 * Exit codes:
 *   0  success
 *   2  bad arguments
 *   3  Playwright/Chromium not installed (run: npx playwright install chromium)
 */

const fs   = require("fs");
const path = require("path");
const os   = require("os");
const { execSync }      = require("child_process");
const { createRequire } = require("module");

const REPO_ROOT = path.resolve(__dirname, "..");

// Where the thumbnails live: each app is a WebApps bundle whose featured.jpg is
// the card image. EN is the capture target; ES/JA get byte-for-byte copies.
const LANG_ROOTS = [
  path.join(REPO_ROOT, "content", "webapps"),
  path.join(REPO_ROOT, "content", "es", "webapps"),
  path.join(REPO_ROOT, "content", "ja", "webapps"),
];

const BASE = "https://carlos-mendez.projects.earthengine.app/view";

// Single source of truth — one entry per standalone app bundle in
// content/{,es/,ja/}webapps/<slug>/ (GEE apps use BASE/<slug>; others give `url`).
// The Streamlit app bundles are NOT listed: their maps live in nested iframes that
// headless Chromium leaves blank, so those cards reuse the package's featured.webp.
const APPS = [
  { slug: "viirs-like-monthly" },
  { slug: "viirs-like-monthly-regions" },
  { slug: "viirs-like-yearly" },
  { slug: "viirs-like-yearly-region" },
  { slug: "dmsp-like-econ" },
  { slug: "dmsp-like-econ-regional" },
  { slug: "dmsp-like-econ-split-view" },
  { slug: "geoexplorer1" },
  { slug: "japan-regional-gdp-disparities" },
  { slug: "geoexplorer1v100bolivia" },
  { slug: "dynamics-dmsp-like" },
  { slug: "dynamicsegdpv2" },
  { slug: "viirs-like2-dynamics" },
  { slug: "world-dmsp-extended" },
  { slug: "world-dmsp-like" },
  { slug: "world-viirs-annualv2" },
].map((a) => ({ ...a, url: a.url || `${BASE}/${a.slug}` }));

// 16:9 capture; deviceScaleFactor 1 → 1600x900 PNG, ~2x the 800x450 display size.
const VIEWPORT = { width: 1600, height: 900 };
const DEFAULT_WAIT_MS = 10000;
const NAV_TIMEOUT_MS  = 60000;

// Resolve Playwright from any reachable install (project, npx cache, global npm),
// mirroring .claude/skills/draw-sketchy-diagram/scripts/render.js.
function loadChromium() {
  try { return require("playwright").chromium; } catch (_) {}
  try { return require("playwright-core").chromium; } catch (_) {}

  const candidates = [];
  const npxRoot = path.join(os.homedir(), ".npm", "_npx");
  if (fs.existsSync(npxRoot)) {
    for (const sub of fs.readdirSync(npxRoot)) {
      candidates.push(path.join(npxRoot, sub, "node_modules"));
    }
  }
  try {
    const globalRoot = execSync("npm root -g", { encoding: "utf8" }).trim();
    if (globalRoot) candidates.push(globalRoot);
  } catch (_) {}

  for (const nm of candidates) {
    const pkg = path.join(nm, "playwright", "package.json");
    if (!fs.existsSync(pkg)) continue;
    try {
      const req = createRequire(path.join(nm, "_anchor.js"));
      return req("playwright").chromium;
    } catch (_) {}
  }
  return null;
}

function parseArgs(argv) {
  const args = { slugs: [], waitMs: DEFAULT_WAIT_MS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--slug")      args.slugs.push(argv[++i]);
    else if (a === "--wait") args.waitMs = parseInt(argv[++i], 10);
    else if (a === "--help" || a === "-h") {
      process.stdout.write("Usage: node scripts/capture-dashboard-screenshots.cjs [--slug <slug>] [--wait <ms>]\n");
      process.exit(0);
    } else {
      process.stderr.write(`capture-dashboard-screenshots: unknown arg: ${a}\n`);
      process.exit(2);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const chromium = loadChromium();
  if (!chromium) {
    process.stderr.write(
      "capture-dashboard-screenshots: Playwright not found.\n" +
      "  Run: npx playwright install chromium\n"
    );
    process.exit(3);
  }


  const targets = args.slugs.length
    ? APPS.filter((a) => args.slugs.includes(a.slug))
    : APPS;
  if (!targets.length) {
    process.stderr.write(`capture-dashboard-screenshots: no matching slug(s): ${args.slugs.join(", ")}\n`);
    process.exit(2);
  }

  // Prefer the system Chrome (already installed); fall back to bundled Chromium.
  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome" });
  } catch (_) {
    browser = await chromium.launch();
  }

  const [enRoot, ...copyRoots] = LANG_ROOTS;
  let failures = 0;

  for (const app of targets) {
    // JPEG keeps the committed source small (maps compress well); Hugo downsizes
    // each to an 800x450 webp at render time anyway.
    const enPath = path.join(enRoot, app.slug, "featured.jpg");
    if (!fs.existsSync(path.dirname(enPath))) {
      process.stdout.write(`    skip: no bundle content/webapps/${app.slug}/\n`);
      failures++;
      continue;
    }
    process.stdout.write(`→ ${app.slug}  (${app.url})\n`);
    const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
    try {
      await page.goto(app.url, { waitUntil: "networkidle", timeout: NAV_TIMEOUT_MS });
    } catch (e) {
      // networkidle can time out on map apps that keep streaming tiles — that's
      // fine, the UI is usually painted; log and continue to the settle wait.
      process.stdout.write(`    (load wait: ${e.message.split("\n")[0]})\n`);
    }
    // A sleeping Streamlit app shows a wake-up button first; press it and wait.
    const wake = page.getByRole("button", { name: /get this app back up/i });
    if (await wake.count().catch(() => 0)) {
      await wake.first().click().catch(() => {});
      await page.waitForTimeout(60000);
    }
    await page.waitForTimeout(args.waitMs); // let EE map tiles + panels paint
    await page.screenshot({ path: enPath, type: "jpeg", quality: 82 });
    await page.close();

    // Mirror the EN capture into the ES/JA bundles.
    for (const root of copyRoots) {
      const dir = path.join(root, app.slug);
      if (fs.existsSync(dir)) fs.copyFileSync(enPath, path.join(dir, "featured.jpg"));
    }
    process.stdout.write(`    saved ${path.relative(REPO_ROOT, enPath)} (+es,+ja)\n`);
  }

  await browser.close();
  process.stdout.write(`Done: ${targets.length - failures}/${targets.length} captured.\n`);
}

main().catch((e) => {
  process.stderr.write(`capture-dashboard-screenshots: ${e.stack || e}\n`);
  process.exit(1);
});
