# Review: r_did2 web app

**Audit date:** 2026-05-24
**Verdict (initial):** MINOR REVISION (legend/data overlap on all four tab charts)
**Verdict (after fixes):** ACCEPT
**Browser pass:** enabled (headless Chromium 1280x800 + 375x667)

## Summary

- File completeness: PASS (7 expected files present).
- Smoke test: 8/8 PASS (qnorm, simulate, lambda_max, OLS recovery, perf ~150 ms, schema OK).
- HTTP: index.html, results.json, all JS/CSS served HTTP 200.
- Console errors: none (desktop + mobile).
- Pedagogy: post takeaways foregrounded in Tab 1 lede + "three key takeaways" card (sign reversal, weighting dominates methodology, power is binding) — all three clearly aligned.
- Hugo integration: link uses `web_app/index.html` (no trailing-slash bug).

## Dimension scores

| # | Dimension              | Score | Notes                                                                                  |
|---|------------------------|------:|----------------------------------------------------------------------------------------|
| 1 | File completeness      | 10    | All 7 expected files present.                                                          |
| 2 | HTML structure         | 10    | 4 tabs with matching button/pane IDs; role=tab/tabpanel; aria-selected toggling.       |
| 3 | JS correctness         | 9     | Smoke 8/8; no console errors. Stale `forest_plot`/`selection_bars` dead code (unused). |
| 4 | Data contract          | 10    | results.json parses; 14-row estimates schema matches; event_study, by_cohort, honestdid present. |
| 5 | Accessibility          | 9     | Every slider has aria-label; tabs use role=tab + aria-selected.                        |
| 6 | Performance            | 10    | Tab switches < 200 ms; chart redraws < 100 ms.                                         |
| 7 | Pedagogy               | 10    | Tab-1 lede covers sign reversal; "three key takeaways" + glossary 8 entries.           |
| 8 | Hugo integration       | 10    | YAML link `web_app/index.html`; all assets HTTP 200.                                   |
| 9 | Visual design          | 9     | FIXED: legends moved below all four chart plot areas; no overlap with data lines.      |
|10 | Mobile responsiveness  | 8     | Charts use viewBox; tab strip wraps OK; horizontal legend strip readable at 375 px.    |

## Issues identified and fixed

| # | Severity | Dimension | Location | Issue | Fix applied |
|---|----------|-----------|----------|-------|-------------|
| 1 | HIGH | 9 (visual) | charts.js `did_dgp_chart` | Legend (4 entries) sat inside the plot area at top-right and overlapped the orange treated line. | Increased SVG H 360 -> 410 and bottom margin 44 -> 96; moved legend to a horizontal strip below the x-axis label. |
| 2 | HIGH | 9 (visual) | charts.js `event_study_chart` | Legend sat over the data line at e ~ 0..+5 — the unweighted (blue) trajectory rose right through it. | Increased SVG H 360 -> 410 and bottom margin 44 -> 96; moved legend to a horizontal strip below the x-axis label, with expanded labels naming the estimand. |
| 3 | MED  | 9 (visual) | charts.js `parallel_trends_animation` | Legend overlapped treated/control lines at the upper-right of the chart. | Increased SVG H 320 -> 380 and bottom margin 44 -> 100; moved legend to a horizontal strip below the x-axis label. |
| 4 | MED  | 9 (visual) | charts.js `did_forest` | Legend at top-right of the SVG could overlap the first method-row CI bars. | Increased bottom margin 36 -> 92; moved legend to a horizontal strip below the x-axis. |
| 5 | LOW  | 3 (code)   | charts.js `forest_plot`, `selection_bars`, `l1_vs_l2_animation`, `coefficient_path`, `alpha_compare`, `alpha_histograms` | Dead r_double_lasso template code (colorMap with "First diff"/"OLS (full)"/"PSL", outcomes "Violent crime"/"Property crime"/"Murder"). Never invoked by r_did2 app.js. | Left in place — never called; pruning is optional cleanup deferred to a separate pass. |

## Positive highlights

- Pedagogical sandwich is tight: every tab opens with a lede that names the post takeaway, then shows the chart, then "what to look for" bullets.
- Data values match the post numerically to 4 decimals (cell-means +0.1216 / -2.5629; GxT +7.9171 / +0.2657).
- DGP simulator interactively reproduces the headline sign-reversal mechanism with intuitive sliders.
- Event study includes both leads (placebo) and lags (effect) with shaded 95% CIs and a clear e=-0.5 separator.
- Glossary covers DiD, ATT, parallel trends, TWFE, DRDID, Callaway-Sant'Anna ATT(g,t), HonestDiD M-bar — all 8 entries directly from the post vocabulary.

## How to re-review

```
/project:review-app r_did2 focus: visual
```
