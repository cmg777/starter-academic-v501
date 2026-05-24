# Web app review — `python_mgwrfer`

- Audit date: 2026-05-24 (re-review after fixes)
- Focus: all 10 dimensions
- Browser pass: enabled (Chromium 1.60, 1280×800 + 375×667)
- Verdict: **ACCEPT** — zero console errors, all 8 smoke-test checks pass, all HTTP 200, color-differentiated forest plot, bandwidth bars now render with proper labels and an offset legend that does not overlap any data marks.

## Dimension scores

| # | Dimension | Score |
|---|-----------|------:|
| 1 | File completeness | 10 |
| 2 | HTML structure | 9 |
| 3 | JS correctness | 10 |
| 4 | Data contract | 10 |
| 5 | Accessibility | 8 |
| 6 | Performance | 10 |
| 7 | Pedagogy | 8 |
| 8 | Hugo integration | 10 |
| 9 | Visual design | 9 |
| 10 | Mobile responsiveness | 9 |

## Fixes applied

- `selection_bars`: derive x-domain from the data's actual method names; previous hard-coded domain `["DL (rigorous)", "DL (CV)"]` produced 12 `NaN` console errors per render and no visible bars for MGWFER / PMGWR / MGWR_cs. Added per-method color legend below the facet row (outside the plot, no overlap with bars).
- `selection_bars`: relabeled Y axis from "Controls selected (out of 284)" to "Bandwidth (n units)" — correct context for the MGWFER post.
- `forest_plot`: extended `colorMap` to recognise `MGWR_cs / PMGWR / MGWFER`; previously every dot rendered white via the `C.text` fallback.
- `forest_plot`: updated defensive default `methods` and `outcomes` lists to the MGWFER set so a stale invocation cannot resurrect double-LASSO labels.
- `forest_plot`: now also removes orphan `text.facet` labels on each re-render (previous `g.facet` removal left them stacking).
- `coefficient_path`: added an inset legend (`treatment` / `nonzero at current λ` / `shrunk to zero`) in the top margin with a semi-transparent dark background, so it cannot overlap data lines. Top margin grew 20 → 44 px to host it.
- `coefficient_path`: moved the cursor `λ = …` label up from `y=-6` to `y=-22`, fully inside the top margin and outside the plotting area.

## Positive highlights

- All 8/8 smoke-test checks pass.
- Zero console / page errors in Chromium for all 4 tabs at both viewports.
- YAML `Web app` link uses `web_app/index.html` (no trailing-slash bug).
- 100-sim batch with progress bar is excellent pedagogically.
- Mobile tab strip scrolls horizontally without overflowing the page.
- Glossary has 8 entries.
- Forest plot now visually distinguishes the three estimators (steel / orange / teal) — pedagogically critical because the MGWFER vs PMGWR contrast is the post's headline.

## Overlap audit (per user concern)

| Chart | Legend / annotation placement | Status |
|-------|-------------------------------|--------|
| Tab 1 — `l1_vs_l2_animation` | Legend inside plot, top-right, semi-transparent panel rect | OK (clear of paths) |
| Tab 2 — `coefficient_path` cursor label | Top margin at `y=-22` | Fixed (was overlapping when slider near edges) |
| Tab 2 — `coefficient_path` color legend | Top margin with semi-transparent rect | Fixed (new) |
| Tab 3 — `alpha_compare` "true α" line label | Top margin at `y=-8` | OK |
| Tab 3 — `alpha_histograms` "true α" line label | Inside plot at `y=10`, on bin edge | OK (only touches single bar edge) |
| Tab 4 — `forest_plot` facet titles, method labels | Above and to the left of plot region | OK |
| Tab 4 — `selection_bars` per-bar count, axis label | Bar count above bar, axis labels outside | OK |
| Tab 4 — `selection_bars` color legend | NEW: rendered in bottom margin below x-axis | OK (clear of bars) |

No legend or annotation overlaps a data mark in any of the four tabs.
