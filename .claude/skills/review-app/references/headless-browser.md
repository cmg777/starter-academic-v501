# Headless Browser (Playwright) Phase 4.2

The skill drives a headless Chromium via Playwright to verify the
app's runtime behaviour — tab switching, slider interaction, console
errors, mobile layout. This file documents the bootstrap and the
script the skill executes.

---

## Bootstrap (Phase 0.3)

```bash
# Check whether Playwright is installed.
if ! npx playwright --version >/dev/null 2>&1; then
  echo "First-run bootstrap: installing Playwright Chromium (~200 MB, ~2 min)…"
  # Install the package then the browser:
  npx --yes playwright@latest install chromium 2>&1
fi
```

If the install fails (offline, disk full, network error), surface
the exact stderr and proceed with `--no-browser` semantics for this
run (Phase 4.2 skipped; Dims 9 + 10 report `[~] Not audited`).

After bootstrap, locate the Playwright executable directory if
needed via `npx playwright install --dry-run` (it prints the cached
path).

---

## The audit script

The skill writes this script to a tempfile and runs it via
`node <tempfile>`:

```javascript
// review-app browser audit. Emits a JSON report to stdout.
const { chromium } = require("playwright");
const fs = require("fs");

const BASE_URL = process.env.BASE_URL;     // e.g. http://localhost:1316/post/r_double_lasso/web_app/
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR; // a tempdir
const out = { console_errors: [], tabs: [], mobile: {}, errors: [] };

(async () => {
  const browser = await chromium.launch();
  // ============================== DESKTOP =================================
  const ctxDesk = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctxDesk.newPage();

  page.on("console", msg => {
    if (msg.type() === "error" || msg.type() === "warning") {
      out.console_errors.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on("pageerror", err => out.errors.push({ message: err.message }));

  await page.goto(BASE_URL, { waitUntil: "load", timeout: 10000 });
  const title = await page.title();
  out.title = title;

  // Find tab buttons (4 expected)
  const tabButtons = await page.$$("nav.tab-strip button");
  out.tab_count = tabButtons.length;
  for (let i = 0; i < tabButtons.length; i++) {
    const id = await tabButtons[i].getAttribute("id");
    const dataPane = await tabButtons[i].getAttribute("data-pane");
    const tabRecord = { id, dataPane, ok: true, sliderMoved: false, errors: [] };

    // Click the tab and wait for its pane to activate.
    await tabButtons[i].click();
    await page.waitForTimeout(120);
    const paneActive = await page.evaluate((paneId) => {
      const el = document.getElementById(paneId);
      return !!(el && el.classList.contains("active"));
    }, dataPane);
    tabRecord.paneActive = paneActive;
    if (!paneActive) tabRecord.ok = false;

    // Find a slider in this pane and emit one input event.
    const slider = await page.$(`#${dataPane} input[type="range"]`);
    if (slider) {
      try {
        const min = +(await slider.getAttribute("min"));
        const max = +(await slider.getAttribute("max"));
        const target = String(Math.round((min + max) / 2));
        const t0 = Date.now();
        await slider.fill(target);
        await page.waitForTimeout(60);  // let debounce settle
        tabRecord.sliderMoved = true;
        tabRecord.sliderResponseMs = Date.now() - t0;
      } catch (e) {
        tabRecord.errors.push("slider drag failed: " + e.message);
      }
    }

    // Screenshot
    const shot = `${SCREENSHOT_DIR}/REVIEW_${dataPane}.png`;
    await page.screenshot({ path: shot, fullPage: false });
    tabRecord.screenshot = shot;
    out.tabs.push(tabRecord);
  }

  await ctxDesk.close();

  // ============================== MOBILE ===================================
  const ctxMob = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const mPage = await ctxMob.newPage();
  await mPage.goto(BASE_URL, { waitUntil: "load", timeout: 10000 });
  // Check for horizontal page scrollbar:
  const hScroll = await mPage.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  });
  out.mobile.horizontal_scroll = hScroll;
  // Tab strip reachability: count visible tab buttons
  const visTabs = await mPage.$$eval("nav.tab-strip button", btns => btns.filter(b => {
    const r = b.getBoundingClientRect();
    return r.width > 30 && r.height > 30;  // touch-target threshold
  }).length);
  out.mobile.visible_tabs = visTabs;
  // Screenshot Tab 2 on mobile
  const tab2 = await mPage.$("nav.tab-strip button:nth-child(2)");
  if (tab2) {
    await tab2.click();
    await mPage.waitForTimeout(150);
    const shot = `${SCREENSHOT_DIR}/REVIEW_tab2_mobile.png`;
    await mPage.screenshot({ path: shot, fullPage: false });
    out.mobile.screenshot = shot;
  }
  await ctxMob.close();
  await browser.close();
  fs.writeFileSync(process.env.OUTPUT_JSON, JSON.stringify(out, null, 2));
})().catch(err => {
  console.error("browser script failed:", err);
  process.exit(1);
});
```

---

## How the skill consumes the JSON

After running the script, parse `OUTPUT_JSON` and apply these rules:

| JSON field                       | Maps to dimension / check                                       |
|----------------------------------|-----------------------------------------------------------------|
| `tab_count !== 4`                | Dim 2 HIGH                                                      |
| `tabs[i].ok === false`           | Dim 2 HIGH (tab click did not activate pane)                    |
| `tabs[i].sliderResponseMs > 300` | Dim 6 MED                                                       |
| `console_errors.length > 0`      | Dim 3 MED per error                                             |
| `errors.length > 0`              | Dim 3 HIGH per uncaught exception                               |
| `mobile.horizontal_scroll`       | Dim 10 HIGH                                                     |
| `mobile.visible_tabs < tab_count`| Dim 10 HIGH                                                     |

---

## Screenshot retention

- All screenshots are written to a tempdir during Phase 4.2.
- After Phase 5 composes the report:
  - **If verdict is ACCEPT**, delete every screenshot. No artifacts
    left in the repo.
  - **If verdict is MINOR or MAJOR and a HIGH issue exists under
    Dim 9 or Dim 10**, copy the relevant screenshots into
    `content/post/<slug>/web_app/REVIEW_<tabid>.png` and reference
    them in REVIEW.md. Keep at most 3 screenshots; prefer mobile
    ones over desktop.
  - **Otherwise** (MINOR/MAJOR but no visual/mobile HIGH), delete the
    tempdir.

Screenshots committed to the repo are not added to `.gitignore`; the
user can `git add` them with the REVIEW.md commit if they want, or
delete them after applying fixes.

---

## Performance budget

The browser pass typically takes 6–10 s after Chromium is cached.
First-run bootstrap (Chromium download) adds ~90–120 s. The skill
should print a progress line at each major step ("Launching
Chromium…", "Cycling tabs…", "Mobile pass…") so a slow run isn't
silently mistaken for a hang.

If the browser pass takes > 60 s, surface as a LOW issue ("Browser
audit slow; consider closing other Chromium instances") rather than
failing the run.

---

## Failure protocol

If the Playwright script crashes mid-run (e.g. CDN fails to load D3,
the page never reaches `load` state):

1. Capture stderr from Node.
2. Mark Dims 9 + 10 as `[~] Could not run browser pass (see error
   below)`.
3. Include the error message verbatim in REVIEW.md's "Audit
   metadata" section.
4. Do not fail the entire audit; the static + smoke-test results are
   still useful.
