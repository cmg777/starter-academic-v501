# Review Report — `python_ml_random_forest/web_app`

**Audited:** 2026-05-24 (manual /project:review-app workflow)
**Focus:** all 10 dimensions, browser pass enabled
**Verdict (after fix):** **ACCEPT** (was MAJOR REVISION before fixes)

## Dimension scores (post-fix)

| # | Dimension              | Score | Notes |
|---|------------------------|-------|-------|
| 1 | File completeness      | 10    | 7/7 expected files present                                                  |
| 2 | HTML structure         |  9    | 4 tabs, correct ARIA roles, D3 before app.js                                |
| 3 | JS correctness         | 10    | smoke-test 8/8; zero console errors after fix (was 6 NaN errors)            |
| 4 | Data contract          |  9    | `results.json` valid; chart code now matches RF labels (was: stale)         |
| 5 | Accessibility          |  8    | all sliders have aria-label; tab roles correct                              |
| 6 | Performance            | 10    | lasso_path(500,100) = 99 ms                                                 |
| 7 | Pedagogy               |  9    | Tab-1 lede surfaces R² 0.23, RMSE 6.52, MAE 4.72; A59/A42/A26 named         |
| 8 | Hugo integration       | 10    | YAML link uses `web_app/index.html` (no trailing-slash bug); all 200        |
| 9 | Visual design          |  9    | Tab-1 legend overlap with L2 curve FIXED (moved to top margin)              |
|10 | Mobile responsiveness  |  7    | 375px viewport: forest plot left-margin labels feel cramped but readable    |

## Issues found and fixed

| Severity | Dimension | Issue | Fix |
|----------|-----------|-------|-----|
| HIGH     | 3, 4      | `selection_bars` hardcoded `["DL (rigorous)", "DL (CV)"]` x-axis domain; RF data has `Baseline RF` / `Tuned RF` → bars rendered with NaN x positions, 6 console errors per page load | Made x-axis domain data-driven; discover methods from `subset` |
| HIGH     | 4         | `forest_plot.colorMap` only had old DL method entries; RF dots/CIs rendered white | Added `Baseline RF`/`Tuned RF`/`Baseline CV`/`Tuned CV` color entries |
| HIGH     | 4         | `forest_plot` default outcomes were `["Violent crime", "Property crime", "Murder"]` and default methods were `["First diff", ...]` — wrong defaults | Updated defaults to `["Test R²", "Test RMSE", "Test MAE"]` and RF methods |
| MED      | 4, 9      | Caption hardcoded "Controls selected (out of 284)"; post has 64 features | Caption now reads `Features in play (out of ${totalFeatures})` and pulls from data |
| MED      | 7         | Tooltip used `α̂` and `controls used` labels (double-LASSO terminology) | Changed to `estimate`, `n_estimators`, and added outcome label |
| MED      | 9         | Tab-1 L1/L2 animation legend (inside-plot, top-right) overlapped the L2 (Ridge) curve at small λ where coefficient ≈ 1.0 | Moved legend OUT of plot area into top margin; expanded `margin.top` 28 → 48 and `H` 320 → 340 |

## Positive highlights

- Smoke test passes 8/8 (lasso_path 99 ms is excellent).
- Hugo YAML link is the correct `web_app/index.html` form.
- Tab-1 lede has all three headline numbers from the post (R²=0.23, RMSE=6.52, MAE=4.72) plus the A59/A42/A26 ranking.
- Glossary has 8 entries (`Random Forest`, `Decision tree`, `Bagging`, `Train/test split`, `Cross-validation`, `R²/RMSE/MAE`, `Feature importance (MDI)`, `Permutation importance`).
- Coefficient-path chart (Tab 2) places the cursor λ-label in the top margin — no overlap with data lines.
- Showdown alpha-bar value labels (Tab 3) sit cleanly to the right of bars, no overlap.

## Overlap audit (explicit, per user concern)

| Chart                                  | Overlap before? | After fix |
|----------------------------------------|-----------------|-----------|
| Tab 1: L1 vs L2 animation              | YES — inside-plot legend covered L2 curve at small λ | Legend moved to top margin; clear |
| Tab 2: coefficient path                | No                                                   | n/a |
| Tab 3: alpha_compare                   | No (value labels right-anchored, true-α label in top margin) | n/a |
| Tab 3: alpha_histograms (post-Run)     | No (true-α label in top margin at y=10)              | n/a |
| Tab 4: forest_plot                     | No (method labels in left gutter, facet titles in top margin) | n/a |
| Tab 4: selection_bars                  | No (value labels above bars, axis-title in left gutter) | n/a |

## How to re-review

```
/project:review-app python_ml_random_forest
```
