# JASID 2026 deck: layout fixes, readability pass and PDF

The deck at `/presentations/mapping-local-development-ai-satellite-imagery/` (source `content/presentations/20261129JASID/slides/`) for the 29 November 2026 talk had broken and hard-to-read slides. This pass fixes the layout, rewrites the slide text for a mixed, mostly non-technical audience, and publishes a PDF.

## Broken layout (root cause)

- **Limits slide:** "Useful clues / Important unknowns" rendered as eight thin columns, with text running about 335px off the right edge. The two-step slide had the same fault in a milder form.
  - Cause: raw `<div>` tags inside a Pandoc fenced div are dropped by Pandoc, so every `h3` and `p` became its own flex item.
  - Fix: every multi-column block is now built from nested fenced divs (`::::` / `:::`). `jasid.css` documents the rule.
- **Information-gap banner:** `object-fit: cover` cropped its edge labels ("MISSING", "SINGLE CENSUS"). It is now shown uncropped.

## Slide changes (17 → 18 slides, same three acts)

- **Two-step slide** (prediction needs measured data): rebuilt as a two-row pipeline diagram.
- **Population slide:** the map plus a schematic of a simple vs population-weighted average.
- **New "Three findings to take home" recap:** 64 numbers; 0.38 → 0.69; 0.54 to 0.72.
- **Limits slide:** rebuilt as two equal cards.
- **Chart slides:** the chart sits on the left, with a reading panel on the right that carries the poverty numbers in large type. The Poverty row is highlighted in each chart.
- **Captions:** added under the embedding and landscape illustrations.
- **Type floor:** no audience text below 0.6em (about 20px at 1280×720).
- **Slide text:** no em dashes, possessives or contractions; the published title is unchanged. Speaker notes were updated to match.
- **Label:** "Daytime embeddings" is shown as "AI embeddings". The notes record that the source study uses the first name.

## Figures

- **Nighttime-lights scatter and R² teaching figure:** both were static Matplotlib SVGs whose embedded glyphs mixed bold and regular weights. They are now Plotly charts with hover names.
  - Drawn by `slides/figures-src/make_ntl_figures.py`, using the 339-municipality extract `ntl_sdg1_2017.csv` decoded from the study repo (quarcs-lab/project2026e-slides @ bb860234).
  - The script asserts mean 37.46, error share 45.6% and R² 0.544 before writing.
- **The four upstream Plotly includes are untouched.** `slides/jasid-figures.js` wraps `Plotly.newPlot` and changes only size, fonts, labels, legends and the Poverty highlight; data are unchanged. Numbers were checked against the arrays:
  - 0.515 / 0.375, 8 of 15 goals
  - 0.553 / 0.691, 14 of 15 goals
  - 0.537 to 0.721
- **Print:** a print rule paints the canvas gradient on each PDF page. Before it, every page showed a lighter rectangle.

## PDF

- **File:** `slides/slides.pdf`: 18 pages, 3.5 MB.
  - Printed from `?print-pdf&pdfSeparateFragments=false` with Playwright Chromium, then Ghostscript `/printer` at 200 dpi.
- **Buttons:** a "Slides (PDF)" link button on the EN page, "Diapositivas (PDF)" on ES and "スライド（PDF）" on JA. All use the absolute URL, following the ADBI pattern.

## Verification

- **Layout gate** (Playwright, every slide, at 1280×720, 1920×1080 and 1024×768):
  - nothing outside the slide frame
  - no text under 19.5px
  - all six Plotly charts drawn
  - clean console
- **Embedded on the presentation page:** checked at 1280, 1440 and 390 px; no horizontal scroll.
- **Style gate** on rendered slide text: 0 em dashes, possessives or contractions.
- **Site checks:**
  - Hugo 0.111.3 production build is clean (one pre-existing theme deprecation warning).
  - The built `slides/index.html` is byte-identical to the source.
  - i18n parity: 0 missing.

## Follow-up: stale stylesheet in browsers (same day)

- **Symptom:** after the deploy, the HTML deck still looked broken in the author's Chrome, both standalone and embedded, while the PDF was fine. The limits slide showed bare stacked text with no cards.
- **Cause:** `netlify.toml` sends `Cache-Control: public, max-age=2592000` for every `*.css` and `*.js`. That is right for Hugo's fingerprinted assets but wrong for a deck file linked by a fixed name.
  - The browser kept the pre-redesign `jasid.css` (46 rules, served from cache with transferSize 0) and applied it to the new `index.html`, which is `max-age=0`.
  - Headless checks start with an empty cache, so they could not see it.
  - Any visitor who had opened the deck in the previous 30 days would see the same thing.
- **Fix:** the deck CSS and JS are now inlined into `index.html`, so they are revalidated with it on every load. The files are now `slides/jasid-style.html` (`<style>`) and `slides/jasid-figures.html` (`<script>`), via `include-in-header`.
  - They had to become `.html`: Quarto HTML-escapes `.css` and `.js` includes (`>` becomes `&gt;`, `&&` becomes `&amp;&amp;`).
  - Nothing deck-specific is linked by an unchanging name any more, apart from unchanged vendor files and images.
- **Verification:**
  - The re-render is pixel-identical to the verified screenshots, apart from R² glyph anti-aliasing on two axis labels.
  - The layout and style gates pass.
- **Other decks:** other presentation decks that link their own CSS by a fixed name (for example ADBI `deck.css`) carry the same latent risk.

## Site-wide cache policy (same day)

- **Root cause** of the JASID problem: since 2026-04-20 (`3cd7182a`), `netlify.toml` cached files by extension, which affected every deck, web app and figure on the site.
  - Every `*.css` and `*.js` was cached for 30 days.
  - Every `*.png`, `*.jpg` and `*.webp` was cached for a year with `immutable`.
- **New rule:** only content-hashed names get a long cache (one year, `immutable`). These are:
  - Hugo-fingerprinted `/css/*.min.*.css`, `/css/wowchemy.*.css`, `/js/*.min.*.js` (plus `/en|es|ja/` copies) and `/js/*-lab.*.js`
  - Hugo-processed images (`*_hu*_*_*`)

  Everything else falls through to Netlify's default `max-age=0, must-revalidate`: the browser revalidates with the ETag and gets a cheap 304.
- **Pattern check:** against the full `public/` tree, no original image matches the processed-image pattern and no unhashed CSS or JS matches the hashed patterns.
- **Stale copies already in browsers:** the new rule does not evict copies cached under the old one, so the files changed inside their old cache window were busted one by one.
  - CSS and JS changed in the last 30 days:
    - JASID `jasid.css`: now inlined (see above).
    - `python_sc_dsc_sdid` web app: `app.js` changed on 2026-11-20. Added `?v=20261120` to `styles.css`, `charts.js` and `app.js` in `web_app/index.html`.
    - ADBI `deck.css`: last changed 2026-10-28, so any copy cached before then expires by 2026-11-27. Nothing to do.
  - Images changed in place since 2026-04-20 that still exist at the same URL (25):
    - Featured and avatar originals: referenced only from `og:image` / `twitter:image` meta (thumbnails use processed copies). Nothing to do.
    - `python_sc_bayes_spatial_13_prior_predictive.png` (changed 2026-11-20): `?v=20261120` added in `index.md`.
- **Docs:** a CLAUDE.md gotcha records the rule.
- **Checks:** Hugo build is clean. `audit-site.py` reports the same 6 pre-existing legacy `/post/python_dynamic_panel` problems.
- **Correction after deploy:** the first version used `/js/*.*.js`, and live headers showed `/js/mathjax-config.js` and `/js/tutorial-gallery.js` getting the one-year `immutable` cache.
  - Cause: Netlify treats `.` in a pattern as "any character".
  - Fix: replaced it with `/js/*.min.*.js` (plus the `/en|es|ja/` copies) and `/js/*-lab.*.js`.
  - Check: simulated over every file in `public/` with `.` read both as literal and as any character: 1,396 hashed files matched, 0 unhashed.
  - Side effect: the two files were served with the long header for a few minutes. Neither has changed since, so no stale copy can result.
