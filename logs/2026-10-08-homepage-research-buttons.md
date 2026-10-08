# 2026-10-08 — Homepage research rows: plain-language summaries and buttons

## What changed
- **Homepage "Recent research"** rows (`layouts/index.html`, `#featured`) now show the article's buttons as small pills beneath the summary. Readers can open the DOI, published article, working paper, AI podcast, video and so on without opening the article page.
  - New partial: `layouts/partials/orbital-paper-links.html`.
  - It mirrors Wowchemy `page_links.html`, with the same order and URL resolution, but drops Cite. The Cite pop-up needs Wowchemy JS that the standalone homepage does not load.
  - The labels come from each language's `links:` names and the `btn_*` i18n strings, so ES/JA are localized automatically.
  - Icons are inline SVG (Font Awesome Free 5.15.4 paths, CC BY 4.0). Unknown icons fall back to `link`, and Academicons `open-data` uses the FA `database` icon.
  - The group label is `paperLinksLabel` in `data/orbital.json` (EN/ES/JA).
  - Styles: `.paper-links` in `assets/css/orbital.css`. Pills have a 32px minimum height, turn gold on hover/focus, and span the full width on mobile.
- **Plain-language `summary:`** (EN/ES/JA) for the three papers currently on the homepage: `20260528-EM`, `20260216-APJRS`, `20251006-SIR`. New papers should get a general-audience summary when they are added.

## Verified
- Production build. On `/`, `/es/` and `/ja/` the button hrefs match the article pages' `btn-page-header` hrefs, including the per-language `working-paper.pdf` and `#podcast-player`.
- Chrome at 2560px desktop and a 390px iframe: no horizontal overflow, the pills wrap, and the thumbnail `filter`/`transform` stay `none`.
- `node --test tests/*.cjs` (22 pass); `scripts/i18n-parity.sh` (0 missing).
