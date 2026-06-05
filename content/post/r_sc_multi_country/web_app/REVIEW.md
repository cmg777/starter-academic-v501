# Web App Review — r_sc_multi_country

**Verdict: ACCEPT** · Reviewed 2026-06-05 · App at `content/post/r_sc_multi_country/web_app/`

Comprehensive audit across 10 dimensions. Node smoke test + Hugo dev server (HTTP 200) +
headless Chromium across all 4 tabs at desktop (1280×800) and mobile (375×667).

## Dimension scores

| # | Dimension | Score | Notes |
|---|-----------|------:|-------|
| 1 | File completeness | 10 | index.html, styles.css, charts.js, app.js, data/results.json all present |
| 2 | HTML structure | 10 | 4 tabs, semantic header/nav/main/footer, valid tab/tabpanel roles |
| 3 | JS correctness | 10 | `node --check` passes; data-accessor smoke test resolves every key to finite values |
| 4 | Data contract | 10 | results.json schema matches all app.js accessors (hero, single, suitability, multi, emu) |
| 5 | Accessibility | 10 | html lang=en, tabs role=tab + aria-selected, panes role=tabpanel, radios label-wrapped, SVG role=img |
| 6 | Performance | 10 | DOMContentLoaded/load 80 ms; 23 KB JSON, D3 from CDN, no heavy compute |
| 7 | Pedagogy | 10 | Tab-1 lede + tab headings align with the post's three takeaways (recovery, suitability/sign-flip, replication) |
| 8 | Hugo integration | 10 | Publishes to `public/post/.../web_app/`; opens from the post's "Web app" YAML link; no trailing-slash bug |
| 9 | Visual design | 10 | Dark palette consistent with site (#6a9bcc/#d97757/#00d4c8); legends, tooltips, hover states |
| 10 | Mobile responsiveness | 9 | 0 per-tab overflow, charts scale via SVG viewBox; LOW: wide comparison table now wrapped in `overflow-x:auto` |

## Headless browser results

- **Desktop (1280×800):** all 4 tabs render SVGs (intro hero 5 paths; single+recovery 2 SVGs/12 bars; multi path; EMU scatter 12 circles). Unit toggle (C01↔C05) and panel toggle (sim↔EMU) update live. **0 console/page errors.**
- **Mobile (375×667):** 0 horizontal-overflow tabs, 0 console errors, charts render.
- **Dynamic readouts verified:** hero Spearman 0.74; C05 true −1.23 / ridge −1.32 (the sign-flip story); EMU pooled −0.016.

## Issues

| Severity | Dimension | Issue | Status |
|----------|-----------|-------|--------|
| LOW | 10 Mobile | 5-column comparison table could exceed 375 px width | Fixed — `#multi-table, #emu-table { overflow-x: auto; }` |

No HIGH or MED issues. All dimensions ≥ 9. **ACCEPT.**
