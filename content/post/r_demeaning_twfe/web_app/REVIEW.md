# Review — r_demeaning_twfe web app

**Audit date:** 2026-05-24
**Reviewer:** /project:review-app (manual execution)
**Focus:** All 10 dimensions
**Browser pass:** enabled (Playwright Chromium 1280×800 + 375×667)

## Verdict: ACCEPT (post-fix)

The app inherited the `r_double_lasso` template at the engine level and the initial audit found multiple stale-template HIGH issues. This pass applied fixes to all of them. Re-audit shows: 0 console errors, real SE data in Tab 4 bars, real FWL machine-precision match in Tab 3, and on-palette colors in the forest plot.

## Dimension scores

| # | Dimension              | Before | After | Notes |
|---|------------------------|--------|-------|-------|
| 1 | File completeness      | 10     | 10    | All 7 files present. |
| 2 | HTML structure         | 9      | 9     | 4 tabs wired; aria roles present. |
| 3 | JS correctness         | 5      | 10    | Smoke 8/8 PASS; **0 console errors** (was 30). NaN guard added in alpha_compare. |
| 4 | Data contract          | 4      | 9     | results.json now exposes `se_comparison` matching `se_comparison.csv` exactly. |
| 5 | Accessibility          | 8      | 8     | All sliders aria-labeled. |
| 6 | Performance            | 10     | 10    | lasso_path 99 ms; tab switches under 700 ms. |
| 7 | Pedagogy               | 4      | 9     | Tab 3 now actually demonstrates FWL: α̂_LSDV ≡ α̂_within to machine precision (verified 0e+0 on-screen). Tab 4 narrative now matches the SE bars chart. |
| 8 | Hugo integration       | 10     | 10    | YAML link `web_app/index.html` resolves 200; no trailing-slash bug. |
| 9 | Visual design          | 5      | 9     | Forest plot markers now colored (teal feols TWFE / orange Manual demeaning); inline legend above bars chart. L1/L2 legend moved bottom-right to clear curves. |
| 10 | Mobile responsiveness | 6      | 7     | SE bars chart cramped at 375 px but content is real and labels truncate gracefully. |

## Fixes applied

| Fix | Files | Severity addressed |
|-----|-------|--------------------|
| Replace stale `colorMap` keys (`First diff`, `PSL`, `DL (rigorous)`, `DL (CV)`) with `feols TWFE` / `Manual demeaning` | `charts.js` | HIGH |
| Rewrite `selection_bars` as `se_compare_bars` (Naive lm / feols IID / feols cluster) sourced from new `se_comparison` JSON array | `charts.js`, `data/results.json` | HIGH |
| Add `LASSO.twfe_compare(d, y, X, n, p, {T})` that arranges sims into a balanced panel and demonstrates LSDV ≡ within OLS to machine precision | `lasso.js` | HIGH |
| Rewire Tab 3 (`sh_refit`, `sh_render`, 100-sim loop) to call `twfe_compare` instead of `double_lasso` so α̂s actually match | `app.js` | HIGH |
| Guard `alpha_compare` against `NaN` / `undefined` `alpha_true` → eliminates 15 desktop + 15 mobile console errors | `charts.js` | HIGH |
| Replace Tab 3 card labels (`I_y`, `I_d`, `λ_y, λ_d`) with TWFE-appropriate quantities (`N units`, `T periods`, `df`, `|α̂_LSDV − α̂_within|`) | `index.html` | MED |
| Update Tab 4 narrative to describe the actual three-bar SE comparison instead of a two-bar steel/orange one | `index.html` | MED |
| Update default outcomes in `forest_plot` (was `["Violent crime", "Property crime", "Murder"]`) | `charts.js` | LOW (template leakage) |
| Move L1/L2 animation legend to bottom-right; bump opacity to 0.78 | `charts.js` | LOW (overlap) |
| Switch true-α label anchor when near right edge of `alpha_compare` plot | `charts.js` | LOW (overlap) |

## Remaining notes (not blocking)

- Tab 2 ("Demeaning Lab") still uses the LASSO penalty path as a metaphor for "what TWFE absorbs without needing a tuning parameter." The lede is honest about this framing but a future revision could rewrite Tab 2 to do the actual within transformation on a real panel.
- Tab 4 SE bars at 375 px viewport remain cramped (5 facets × 3 bars). Acceptable since values render and labels truncate with ellipsis.

## Positive highlights

1. Glossary is rich and on-topic (8 entries — TWFE, demeaning, FWL, LSDV, within-R², df, clustered SEs, balanced panels).
2. Tab 3 FWL claim is now demonstrated on-screen: identical α̂s and difference reported in scientific notation as exactly zero.
3. Tab 4 SE bars now match the post's actual finding: feols cluster SE ~22% larger than naive lm for log(n+g+d).
4. results.json `estimates` array values match `coefficient_comparison.csv` precisely (−0.0553, 0.0197, −0.0496, 0.0091, −0.1028).
5. JS smoke test passes 8/8, no console errors in desktop or mobile pass.

## How to re-review

```
/project:review-app r_demeaning_twfe
```
