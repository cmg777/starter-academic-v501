# Review — python_scpi/web_app

- **Audit date:** 2026-05-24
- **Focus:** all 10 dimensions
- **Browser pass:** enabled (Playwright, desktop 1280x800 + mobile 375x667)
- **Verdict:** ACCEPT

## Dimension scores

| # | Dimension | Score |
|---|-----------|-------|
| 1 | File completeness        | 10 |
| 2 | HTML structure           |  9 |
| 3 | JS correctness           | 10 |
| 4 | Data contract            | 10 |
| 5 | Accessibility            |  9 |
| 6 | Performance              | 10 |
| 7 | Pedagogy                 |  9 |
| 8 | Hugo integration         | 10 |
| 9 | Visual design            |  9 |
|10 | Mobile responsiveness    |  9 |

Totals: 0 HIGH / 0 MED / 3 LOW (all resolved).

## Issues found and fixed

| # | Severity | Dim | Location | Issue | Fix |
|---|----------|-----|----------|-------|-----|
| 1 | HIGH | 9 | charts.js `scpi_trajectory` (Tab 2) | Legend box placed at top-right inside the plot area; the upward-sloping actual/synthetic lines pass directly through the legend, obscuring data values 1996-2003. | Moved legend to a horizontal strip above the plot in a reserved 60px top margin. Bumped chart height 360 -> 380. |
| 2 | LOW  | 3 | charts.js `forest_plot` (unused) | Stale `colorMap` keyed on r_double_lasso method names (`First diff`, `OLS (full)`, `PSL`, `DL (rigorous)`, `DL (CV)`) and default outcomes (`Violent crime`, `Property crime`, `Murder`). Dead code (SCPI uses `scpi_forest_plot`) but a future maintenance hazard. | Replaced placeholders with SCPI method names (`Simplex`, `Lasso`, `Ridge`, `OLS`) and outcomes (`Gap 2003`, `Avg gap`); added comment marking it unused. |
| 3 | LOW  | 3 | charts.js `selection_bars` (unused) | Stale default outcomes (`Violent crime`, `Property crime`, `Murder`). | Replaced with SCPI outcomes; added unused-by-SCPI note. |

## Checks passed

- Smoke test: 8/8 (qnorm precision, lambda_max bound, OLS recovery, n*p simulate, lasso_path < 300ms = 98ms, results.json schema).
- HTTP 200 for `web_app/`, all 4 JS files, `styles.css`, `data/results.json`, and the parent post.
- YAML link uses `web_app/index.html` (no trailing-slash bug).
- No browser console errors on any tab, desktop or mobile.
- All sliders have `aria-label`; tabs use `role=tab` + `aria-selected`.
- Color palette uses dark-theme tokens only (`#1f2b5e`, `#6a9bcc`, `#d97757`, `#00d4c8`, `#e8ecf2`).
- Pedagogical alignment: 3/3 takeaways from post §11 (large/growing gap, statistical significance, sparse synthetic) covered in Tab-1 lede + glossary.

## How to re-review

```
/project:review-app python_scpi
```
