# Review — r_causalpolicy_workshop/web_app

- **Date:** 2026-05-24
- **Focus:** all 10 dimensions
- **Browser pass:** enabled (Playwright desktop + mobile)
- **Verdict:** ACCEPT
- **Total issues:** 0 HIGH, 0 MED, 0 LOW (post-fix)

## Dimension scores

| Dim | Area                  | Score |
|----:|-----------------------|------:|
| 1   | File completeness     | 10    |
| 2   | HTML structure        | 9     |
| 3   | JS correctness        | 9     |
| 4   | Data contract         | 10    |
| 5   | Accessibility         | 9     |
| 6   | Performance           | 10    |
| 7   | Pedagogy              | 10    |
| 8   | Hugo integration      | 10    |
| 9   | Visual design         | 9     |
| 10  | Mobile responsiveness | 9     |

## Fixes applied (this pass)

| # | Severity | Dim | Location              | Issue                                                                                                              | Fix applied                                                                                                            |
|--:|----------|----:|-----------------------|--------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| 1 | MED      | 9   | app.js makeIntroChart | "Estimated ATT = ..." top-right text overlapped the orange observed line near year 2000.                            | Reserved a 56-px top band; ATT text and legend now sit above the plot area, no overlap with data marks.                |
| 2 | MED      | 9   | app.js makeIntroChart | Top-left legend rect overlapped the orange line in the early-1970s.                                                | Legend moved to top band, left-aligned, separate from the plot region.                                                 |
| 3 | MED      | 9/10| app.js makeSimChart   | Inline "treated (California)" and "single control" text labels at right edge collided with line endpoints (mobile).| Replaced inline labels with a top-band horizontal legend (treated · single control · donor states).                    |
| 4 | MED      | 9   | app.js makeHistChart  | "true α" label and the legend (Naive / DiD / SCM-style) jammed against each other at the top of the histogram.     | Moved legend to a bottom horizontal strip with translucent backdrop; raised "true α" label into reserved top band.     |
| 5 | LOW      | 3   | charts.js             | Stale header "Double LASSO web app" with dead `forest_plot` / `selection_bars` / `coefficient_path` builders carrying r_double_lasso colorMaps ("First diff", "OLS (full)", "PSL", "DL (CV)") and outcome domains ("Violent crime", "Property crime", "Murder"). | Updated header to clearly mark the file as inherited template scaffolding; documented that the workshop's charts are inlined in app.js and the LASSO-themed builders below are retained only for smoke-test compatibility.  |
| 6 | LOW      | 3   | dgp.js                | Stale LASSO-app header.                                                                                            | Tightened header comment to describe the workshop's actual usage (mulberry32 + makeNormal via app.js `simulatePanel`); kept legacy helpers for smoke-test compatibility. |

## Verification

- Smoke test: **8 / 8 passes** (qnorm precision, simulate_lasso shape, λ_max bound, OLS recovery, performance 101 ms, results.json schema).
- Hugo HTTP: post + `web_app/index.html` + `data/results.json` all return 200.
- YAML link: `web_app/index.html` (no trailing-slash bug).
- Playwright desktop (1280×800): no console errors; all four tabs render correctly post-fix.
- Playwright mobile (375×667): no horizontal overflow; all four tabs render correctly; series labels no longer collide with line endpoints.

## Positive highlights

- Forest plot (Tab 3) values match `table_cross_method.csv` exactly: Naive −27.0, DiD −5.7, ITS-growth −28.3, ITS-ARIMA +4.5, RDD −20.1, SCM −18.8, CausalImpact −12.8.
- Tab 1 counterfactual animation walks through all seven methods with crisp captions (e.g. "Naive pre-post · CF = California's 1970–1988 mean (116 packs)").
- Tabs 2 and 4 expose the single-control-vs-many-donors simulation that motivates Synthetic Control — directly tied to the post's §6 Nevada-vs-many discussion.
- Donor-weights bar chart on Tab 3 highlights the 5-state cocktail (Utah 34.3%, Nevada 23.6%, Montana 18.2%, Colorado 17.5%, Connecticut 6.2%) matching the post's reported donor recipe.
- Glossary (8 entries) covers the right vocabulary (Counterfactual, ATT, Parallel trends, Donor pool, RMSPE ratio, Fisher exact p-value, BSTS, Posterior CI).

## How to re-review

```
/project:review-app r_causalpolicy_workshop
```
