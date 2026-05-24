# Review: r_dynamic_bma2/web_app

- **Slug:** `r_dynamic_bma2`
- **Audit date:** 2026-05-24
- **Focus:** all dimensions
- **Browser pass:** enabled (Chromium 1280x800 + 375x667)
- **Verdict:** ACCEPT (after fixes)

## Dimension scores

| # | Dimension              | Score |
|---|------------------------|-------|
| 1 | File completeness      | 10    |
| 2 | HTML structure         | 9     |
| 3 | JS correctness         | 10    |
| 4 | Data contract          | 10    |
| 5 | Accessibility          | 9     |
| 6 | Performance            | 10    |
| 7 | Pedagogy               | 9     |
| 8 | Hugo integration       | 8     |
| 9 | Visual design          | 9     |
|10 | Mobile responsiveness  | 8     |

## Issues found and fixed

| # | Sev  | Dim | Location              | Issue                                                                                                                              | Fix applied                                                                                       |
|---|------|-----|-----------------------|------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| 1 | HIGH | 9   | charts.js pip_bars    | Threshold labels ("0.95 strong" etc.) at y=-8 collided with top bar's PIP value label when Population PIP near 0.95-0.99           | Increased top margin from 36 to 56; moved threshold labels to y=-22 with semi-transparent background pill; PIP labels now render inside the bar (right-aligned, dark text) when wide enough |
| 2 | MED  | 9   | charts.js pip_forest  | Global title at y=18 sat too close to per-facet titles ("Binomial", etc.) at y=26                                                  | Increased pip_forest margin.top from 36 to 56, global title moved to y=22, viewBox height bumped 460->480 |

## Open notes (not fixed)

| # | Sev  | Dim | Location              | Issue                                                                                                                              | Suggested fix                                                                                     |
|---|------|-----|-----------------------|------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| 3 | LOW  | 3   | charts.js forest_plot, selection_bars, alpha_compare, alpha_histograms, l1_vs_l2_animation, coefficient_path | Dead-code chart builders from the LASSO template (with stale LASSO-method colorMaps and outcome names) ship in charts.js but are not registered in app.js | Either delete unused builders or update their colorMaps; harmless (never executed) |
| 4 | LOW  | 8   | post folder           | No `index.md` exists at `content/post/r_dynamic_bma2/` — the web app is reachable directly via Hugo but no published post links to it | Out of scope for this review                                                                       |

## Positive highlights

- Smoke test passes 8/8 (qnorm precision, OLS recovery, < 110 ms perf)
- Tabs use proper `role="tab"` + `aria-selected` switching
- Glossary has 9 entries (>= 6 minimum)
- Tab-1 lede contains all three post takeaways (population/life-expectancy dominance, posterior model size, prior sensitivity)
- Jointness heatmap correctly anchors the diagonal, shades cells >= 0.35 with numeric labels in dark text
- Pedagogy panels per tab; "what to look for" lists with specific PIPs from the post

## How to re-review

```
/project:review-app r_dynamic_bma2
```
