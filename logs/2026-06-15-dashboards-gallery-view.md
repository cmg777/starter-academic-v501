# 2026-06-15 — Dashboards: gallery view with auto-captured screenshots

## Summary

Replaced the **GeoDevelopment Dashboards** project page's stack of 9 collapsible
`<details>` blocks (each embedding a live `fullwidth-iframe` of a Google Earth Engine
app) with a **responsive card gallery**: a 3-up grid of screenshot thumbnails, each a
block link that opens the published GEE app in a **new tab**. No live iframes remain on
the page → much lighter, faster, and more visually appealing. Applied across all three
language bundles (EN/ES/JA).

The thumbnails are **generated automatically** by a committed, re-runnable Playwright
script that opens each public GEE app headlessly, waits for the map tiles to paint, and
captures a 16:9 frame — no manual screenshotting.

## What changed

- **NEW `scripts/capture-dashboard-screenshots.cjs`** — Playwright capture driver. `APPS`
  array (9 slugs) is the single source of truth. Reuses the `loadChromium()` resolver from
  `.claude/skills/draw-sketchy-diagram/scripts/render.js` (system Chrome → bundled Chromium
  fallback). Per app: 1600×900 viewport, `networkidle` + 10 s settle, screenshot to
  **JPEG q82** (maps compress well; Hugo downsizes to webp anyway), written to the EN bundle
  then copied byte-for-byte into the ES/JA bundles. Flags: `--slug <slug>` (re-shoot one),
  `--wait <ms>`. Prereq: `npx playwright install chromium` if Playwright is missing.
- **NEW `layouts/shortcodes/dashboard-gallery.html`** — wrapper emitting
  `<div class="dashboard-gallery">{{ .Inner | safeHTML }}</div>` (paired shortcode so the
  nested cards stay inside the grid regardless of Goldmark HTML-block parsing).
- **NEW `layouts/shortcodes/dashboard-card.html`** — one card. Params `title`/`cite`/`url`/
  `image`; processes the bundle screenshot with `.Fill "800x450 Center webp"` (same pattern
  as `layouts/partials/tutorial_card.html`); links out `target="_blank" rel="noopener"`;
  localizes the **"Access App"** affordance via `site.Language.Lang` (en `Access App`,
  es `Acceder a la app`, ja `アプリを開く`) so the markdown stays language-agnostic for that
  string; missing-image placeholder fallback so the build never breaks mid-capture.
- **EDIT `content/{,es/,ja/}projects/dashboards/index.md`** — body replaced with the
  `dashboard-gallery` + 9 `dashboard-card` calls. Titles/citations translated per language;
  `url`/`image` identical across languages. The 7 `<!-- Source code (GEE): … -->` comments
  are preserved (entries 3 & 4, the annual VIIRS apps, never had one). Front matter unchanged.
- **EDIT `assets/scss/custom.scss`** — appended a "Dashboard gallery card grid" section
  (3/2/1-column responsive) + dark-mode block, reusing the `.tg-card` hover-lift/shadow idiom.
- **NEW `content/{,es/,ja/}projects/dashboards/screenshots/<slug>.jpg`** — 9 thumbnails per
  bundle (27 files, ~2 MB/bundle). Identical across languages (app UI is English).

The legacy `fullwidth-iframe` shortcode and its overflow-reset CSS were left untouched (may be
used elsewhere); only the dashboards page stopped calling it. `.dashboard-entry` CSS also left
in place (now unused).

## Issue surfaced by the capture — RESOLVED 2026-06-15

At first capture, two apps rendered broken in their public viewers, so their thumbnails reflected
that:

- `viirs-like-yearly` — on-screen error: `ImageCollection.load …
  projects/ee-carlosmendez777/assets/viirs_like_annual not found (does not exist or caller
  does not have access)`; map showed plain satellite imagery.
- `viirs-like-yearly-region` — no nighttime-lights layer rendered (plain terrain).

Both are the two **annual VIIRS** apps and both depended on the same `viirs_like_annual` EE asset,
which the public viewer could not access.

**Resolved 2026-06-15**: the asset was fixed on the GEE side and both apps now render correctly
(`viirs-like-yearly` shows its annual-radiance chart; `viirs-like-yearly-region` shows the lights
layer + legend). Both thumbnails were re-captured with
`node scripts/capture-dashboard-screenshots.cjs --slug viirs-like-yearly --slug viirs-like-yearly-region`
and committed.

## Verification

Built clean on Hugo 0.111.3 extended (`--gc --minify`). Rendered HTML confirmed across EN/ES/JA:
9 cards in `.dashboard-gallery`, webp thumbnails, `target="_blank"`, **0 iframes**, localized
labels + co-author citation (entry 9), GEE source URLs present only as HTML comments (stripped by
`--minify` in prod, same as before). Headless-browser screenshot confirmed the 3-up grid (desktop)
and 1-up stack (mobile) with dark-theme styling.
