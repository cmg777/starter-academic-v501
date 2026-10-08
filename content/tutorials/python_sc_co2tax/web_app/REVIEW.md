# REVIEW — python_sc_co2tax web_app

- **Audit date:** 2026-05-24
- **Slug:** python_sc_co2tax
- **Focus:** all 10 dimensions
- **Browser pass:** enabled (headless Chromium, desktop 1280×800)
- **Smoke test:** 8 / 8 passed (lasso.js + dgp.js + results.json)
- **Hugo HTTP:** all assets 200; YAML link `web_app/index.html` correct (no trailing-slash bug)

## Verdict

**ACCEPT** (post-fix) — after addressing three HIGH issues from the
initial audit (stale `r_double_lasso` template content carried into
Tab-4 forest plot, plus a type-mixing NaN bug in Tab-3 placebo
distribution) and four MED legend/data-mark overlap issues across all
four tabs, the app renders cleanly with 0 console errors and every
chart legend sits outside its plot area.

## Dimension scores (post-fix)

| # | Dimension              | Score | Notes                                                             |
|---|------------------------|-------|-------------------------------------------------------------------|
| 1 | File completeness      | 10    | All 7 expected files present; bundle size healthy                 |
| 2 | HTML structure         |  9    | 4 tabs OK; semantic roles in place; slider has aria-label         |
| 3 | JS correctness         |  9    | 0 console errors after NaN fix; smoke test 8/8                    |
| 4 | Data contract          |  9    | colorMap + fallback arrays now keyed to sc_co2tax methods         |
| 5 | Accessibility          |  8    | Slider aria-label present; tabs use role/aria-selected            |
| 6 | Performance            | 10    | smoke-test lasso_path 99 ms; charts render < 200 ms               |
| 7 | Pedagogy               |  9    | Strong post↔app alignment; 10 glossary entries; lede covers takeaways|
| 8 | Hugo integration       | 10    | YAML link correct; all 7 assets served HTTP 200                   |
| 9 | Visual design          |  9    | All 4 legends moved below x-axis — no overlap with data marks     |
|10 | Mobile responsiveness  |  9    | Charts use viewBox; tabs reachable; legends now safe under axis   |

## Issues addressed in this review

### HIGH (all fixed)

| # | Dim | Location                         | Issue                                                                                  | Fix applied                                                                                         |
|---|-----|----------------------------------|----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| 1 | 3   | charts.js: sc_placebo_distribution | `placebos.flatMap(p => p.gap)` returned `{year,gap}` objects; concat with numbers gave mixed types → `d3.extent` undefined → NaN scale → 16 NaN console errors. | Replaced with `placebos.flatMap(p => p.gap.map(d => d.gap))` so only the numeric `gap` field is collected. |
| 2 | 4   | charts.js: forest_plot colorMap  | `colorMap` keyed to r_double_lasso methods (`"First diff"`, `"DL (rigorous)"`, …) — every sc_co2tax bar/dot fell through to `C.text` so the forest plot looked half-empty. | Rebuilt `colorMap` with all 9 sc_co2tax methods (Naive=steel, DiD×2=muted blues, Synthetic Sweden×2=orange family, OLS4 + IV×3=teal family). |
| 3 | 4   | charts.js: forest_plot fallback  | Fallback `outcomes` / `methods` arrays referenced stale `"Violent crime"` / `"First diff"` strings. | Replaced with sc_co2tax outcomes (`"Transport CO2 (t/cap)"`, `"ln(gas) — price (β₁)"`, `"ln(gas) — tax (β₂)"`) and the 9 sc_co2tax methods. |

### MED — legend / data-mark overlap (all fixed)

| # | Dim | Chart                                   | Original placement                          | Fix applied                                                       |
|---|-----|-----------------------------------------|---------------------------------------------|-------------------------------------------------------------------|
| 4 | 9   | sc_parallel_paths_animation (Tab 1)     | Inside plot, top-right (overlapping curves) | Moved below x-axis; bottom margin raised 44 → 78 px               |
| 5 | 9   | sc_path_plot (Tab 2)                    | Inside plot, top-right                       | Moved below x-axis; bottom margin raised 44 → 78 px               |
| 6 | 9   | sc_placebo_distribution (Tab 3)         | Inside plot, top-right                       | Moved below x-axis; bottom margin raised 44 → 78 px               |
| 7 | 9   | sc_disentangling (Tab 4)                | Inside plot, top-right (overlapped 3 series climbing to >2.8 t/cap) | Moved below x-axis; bottom margin raised 44 → 96 px; legend laid out as a single horizontal row |

## Positives

- Strong narrative arc: Tab 1 (motivation + spoiler) → Tab 2 (path/gap/weights) → Tab 3 (placebos) → Tab 4 (method comparison + disentangling).
- 10 glossary cards cover every term the post introduces.
- All real numbers in `results.json` match `tab_*.csv` in the post folder (treatment_year, donor weights, MSPE ratios, disentangling).
- Pre-fit threshold slider on Tab 3 maps directly to Andersson's recommended robustness check.
- Hugo serves all 7 assets at HTTP 200; YAML link uses the canonical `web_app/index.html`.
- Forest plot now distinguishes 9 methods cleanly: Naive (outlier, steel blue, +0.55), DiD pair (muted blues, ≈−0.14 to −0.21), Synthetic Sweden pair (orange family, ≈−0.27 to −0.36), OLS4/IV trio (teal family, all four agree at β₂ ≈ −0.186).

## How to re-review

```
/project:review-app python_sc_co2tax
```
