# REVIEW — python_pca2 web app

- **Slug:** python_pca2
- **Audit date:** 2026-05-24
- **Browser pass:** enabled (Playwright + Chromium, desktop 1280×800 + mobile 375×667)
- **Verdict (post-fix):** ACCEPT

## Summary

The app shipped with three high-severity inherited-template bugs from the
`r_double_lasso` reference: the forest-plot `colorMap`, the
`selection_bars` x-axis domain, and the forest-plot tooltip labels all
referred to LASSO methods/terminology that did not match this post's
PCA data. These produced (a) all-white circles on Tab 3 (no
method↔colour mapping) and (b) 9 `<text> attribute x: Expected length,
"NaN"` console errors plus invisible bars on Tab 3's lower chart. All
three were fixed; a re-audit returns 0 console errors and visually
correct, colour-coded charts.

## Dimension scores (post-fix)

| # | Dimension              | Score | Notes                                                                         |
|---|------------------------|-------|-------------------------------------------------------------------------------|
| 1 | File completeness      | 10    | All 7 expected files present; bundle ~80 KB                                    |
| 2 | HTML structure         |  9    | 4 tabs with matching button/pane IDs; clean semantic roles                     |
| 3 | JS correctness         | 10    | Smoke test 8/8; 0 browser console errors (was 9)                              |
| 4 | Data contract          | 10    | `results.json` schema matches Tab-3 + Tab-4 consumers                          |
| 5 | Accessibility          |  9    | All 4 sliders have `aria-label`; tabs use `role=tab` + `aria-selected`         |
| 6 | Performance            | 10    | `lasso_path` smoke = 101 ms; tab switch < 100 ms                              |
| 7 | Pedagogy               |  9    | Pooled-vs-per-period takeaway foregrounded in Tab-1 lede + all three subtabs   |
| 8 | Hugo integration       | 10    | YAML link `web_app/index.html` (no trailing slash); HTTP 200 on all assets    |
| 9 | Visual design          |  9    | Site palette only; method colours now consistent across forest + bars         |
|10 | Mobile responsiveness  |  8    | viewBox used everywhere; rotated x-axis labels keep 3 methods readable        |

## Issues (all fixed in this audit)

| Sev   | Dim | File                          | Issue                                                                                                                                       | Fix applied                                                                                                                                          |
|-------|----:|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| HIGH  | 3,9 | `charts.js` (forest_plot)     | `colorMap` keyed to LASSO methods ("First diff", "OLS (full)", "PSL", "DL (rigorous)", "DL (CV)"). All 9 PCA-data circles fell back to white. | Replaced keys with PCA methods: `Pooled PCA` → teal, `Per-period 2013` → steel, `Per-period 2019` → orange. Left-margin method labels also coloured. |
| HIGH  | 3,9 | `charts.js` (selection_bars)  | `x.domain(["DL (rigorous)", "DL (CV)"])` hard-coded; data methods are PCA, so `x(d.method)` returned `undefined` → 9 NaN console errors, no bars. | Domain now derived from data, restricted to PCA method order with defensive fallback. Rotated tick labels so all 3 method names fit.                  |
| HIGH  | 7   | `charts.js` (forest tooltip)  | Tooltip used LASSO terminology: `α̂ =`, `controls used =`. Mis-describes PCA weights.                                                       | Tooltip now reads `weight =`, `n observations =`. Method colour swatch defensive against unknown methods (`colorMap[m] \|\| C.text`).                  |
| MED   | 9   | `charts.js` (selection_bars)  | Y-axis title "Controls selected (out of 284)" — completely irrelevant to PCA observation counts.                                            | Y-axis title changed to "Observations used".                                                                                                          |
| LOW   | 9   | `app.js` (drift histogram)    | Inline legend at `(w-200, 10)` could overlap histogram bars on right side when sim batch runs.                                              | Added semi-opaque dark background rect behind the legend to prevent visual merge with bars.                                                            |

## Positive highlights

- Tab-1 "shifting vs fixed yardstick" animation cleanly repurposes the
  L1/L2 metaphor with PCA-appropriate framing.
- Tab-2 PCA simulator is fully PCA-specific (power iteration on a 3×3
  covariance; pooled vs per-period weights side-by-side; 100-sim batch
  drift histogram).
- Tab-3 forest plot now correctly shows the 0.583→0.541 drop in
  Education weight and 0.510→0.566 rise in Health weight described in
  the post.
- Tab-4 SHDI validation bars are zoomed to [0.95, 1.00] so the small
  but consistent pooled advantage is visually legible.
- Pedagogical alignment: post's 3 key takeaways (pooled stability,
  per-period drift, sign-flip for 16/153 regions) all appear in
  Tab-1 lede and individual tab "What to look for" panels.

## Re-review

```
/project:review-app python_pca2
```
