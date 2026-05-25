#!/usr/bin/env node
/**
 * render.js — drive a sketchy-diagram template with a layout JSON and
 * export SVG (and optionally PNG) via headless Chromium.
 *
 * Usage:
 *   npx playwright@latest install chromium   # one-time
 *   node render.js LAYOUT.json --out OUT_PATH [--jpeg] [--quality 85] [--scale 2] [--timeout-ms 8000]
 *
 * --out must end in .svg, .jpg, or .jpeg.
 *   - With --out *.svg, adding --jpeg also writes a sibling JPEG (.jpg).
 *   - With --out *.jpg|.jpeg, only the JPEG is written.
 *
 * LAYOUT.json must contain a `type` key matching a template stem in
 * ../templates/ (e.g. type: "comparison" -> ../templates/comparison.html).
 * See ../references/layout-schema.md.
 *
 * Exit codes:
 *   0  success
 *   2  bad arguments / layout JSON malformed / template missing
 *   3  Playwright not installed (run: npx playwright install chromium)
 *   4  template did not signal window.READY in time
 */

const fs            = require("fs");
const path          = require("path");
const os            = require("os");
const { execSync }  = require("child_process");
const { createRequire } = require("module");

const SCRIPT_DIR    = __dirname;
const TEMPLATES_DIR = path.join(SCRIPT_DIR, "..", "templates");

// Resolve Playwright from any reachable install:
//   1. Default require — works when invoked from a project that has it.
//   2. The npx cache directories review-app populates on first use.
//   3. Global npm root.
// Returns the `chromium` export, or null if nothing resolves.
function loadChromium() {
  // 1. Default resolution.
  try { return require("playwright").chromium; } catch (_) {}
  try { return require("playwright-core").chromium; } catch (_) {}

  // 2. & 3. Search known cache + global locations.
  const candidates = [];

  // npx caches: ~/.npm/_npx/<hash>/node_modules
  const npxRoot = path.join(os.homedir(), ".npm", "_npx");
  if (fs.existsSync(npxRoot)) {
    for (const sub of fs.readdirSync(npxRoot)) {
      candidates.push(path.join(npxRoot, sub, "node_modules"));
    }
  }

  // Global npm root.
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

function die(code, msg, extra) {
  process.stderr.write(`render.js: ${msg}\n`);
  if (extra && extra.length) for (const line of extra) process.stderr.write(`  ${line}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { positional: [], jpeg: false, quality: 85, scale: 2, timeoutMs: 8000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out")              args.out       = argv[++i];
    else if (a === "--jpeg")        args.jpeg      = true;
    else if (a === "--quality")     args.quality   = parseInt(argv[++i], 10);
    else if (a === "--scale")       args.scale     = parseFloat(argv[++i]);
    else if (a === "--timeout-ms")  args.timeoutMs = parseInt(argv[++i], 10);
    else if (a === "--help" || a === "-h") { printHelp(); process.exit(0); }
    else if (a.startsWith("--"))    die(2, `unknown flag: ${a}`);
    else                            args.positional.push(a);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    "node render.js LAYOUT.json --out OUT_PATH [--jpeg] [--quality 85] [--scale 2] [--timeout-ms 8000]\n"
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.positional.length !== 1) die(2, "expected exactly one positional arg (layout JSON path)");
  if (!args.out) die(2, "missing required --out");

  const layoutPath = path.resolve(args.positional[0]);
  if (!fs.existsSync(layoutPath)) die(2, `layout file not found: ${layoutPath}`);

  let layout;
  try { layout = JSON.parse(fs.readFileSync(layoutPath, "utf8")); }
  catch (e) { die(2, `layout JSON parse error: ${e.message}`); }

  if (!layout.type) die(2, "layout JSON is missing required `type` key");

  const templatePath = path.join(TEMPLATES_DIR, `${layout.type}.html`);
  if (!fs.existsSync(templatePath)) {
    die(2, `no template for type=${JSON.stringify(layout.type)} (expected ${templatePath})`);
  }

  const chromium = loadChromium();
  if (!chromium) {
    die(3, "Playwright not found. Run: npx playwright install chromium  (the audit-side skills in this repo install it on first use)");
  }

  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const outExt = path.extname(outPath).toLowerCase();
  if (outExt !== ".svg" && outExt !== ".jpg" && outExt !== ".jpeg") {
    die(2, `--out must end in .svg, .jpg, or .jpeg, got ${outExt || "(none)"}`);
  }
  if (!(args.quality >= 1 && args.quality <= 100)) {
    die(2, `--quality must be between 1 and 100, got ${args.quality}`);
  }

  const width  = parseInt(layout.width  || 1400, 10);
  const height = parseInt(layout.height || 900,  10);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: args.scale
  });
  const page = await ctx.newPage();

  // Capture JS errors so a silent failure becomes a useful message.
  const errors = [];
  page.on("pageerror",  (exc) => errors.push(`pageerror: ${exc.message}`));
  page.on("console",    (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      errors.push(`[console.${msg.type()}] ${msg.text()}`);
    }
  });

  // Inject the layout BEFORE the template's inline scripts run.
  await page.addInitScript(`window.LAYOUT = ${JSON.stringify(layout)};`);

  await page.goto("file://" + templatePath);

  try {
    await page.waitForFunction("window.READY === true", null, { timeout: args.timeoutMs });
  } catch (e) {
    await browser.close();
    die(4, `template did not signal READY within ${args.timeoutMs}ms`, errors);
  }

  const svgMarkup = await page.evaluate(
    () => document.getElementById("stage").outerHTML
  );

  if (outExt === ".svg") {
    fs.writeFileSync(outPath, svgMarkup);
    process.stdout.write(`wrote ${outPath}\n`);
    if (args.jpeg) {
      const jpegPath = outPath.replace(/\.svg$/i, ".jpg");
      await page.locator("#stage").screenshot({
        path: jpegPath,
        type: "jpeg",
        quality: args.quality
      });
      process.stdout.write(`wrote ${jpegPath} (jpeg q=${args.quality})\n`);
    }
  } else { // .jpg / .jpeg
    await page.locator("#stage").screenshot({
      path: outPath,
      type: "jpeg",
      quality: args.quality
    });
    process.stdout.write(`wrote ${outPath} (jpeg q=${args.quality})\n`);
  }

  await browser.close();
}

main().catch((e) => {
  process.stderr.write(`render.js: unexpected error: ${e.stack || e.message}\n`);
  process.exit(1);
});
