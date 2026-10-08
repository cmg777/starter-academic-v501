# Review: python_panel_intro/web_app

**Audit date:** 2026-05-24
**Verdict:** ACCEPT (after overlap fixes)
**Browser pass:** enabled (Playwright headless Chromium, 1280×800)

## Summary

Manual /project:review-app pass focused on the user's site-wide concern:
**LEGENDS AND ANNOTATIONS overlapping with chart data marks** across the
54 web apps on the site. python_panel_intro had four such overlaps; all
four are now fixed.

## Dimension scores (1–10)

| # | Dimension              | Score | Notes                                                                                  |
|---|------------------------|-------|----------------------------------------------------------------------------------------|
| 1 | File completeness      | 10    | 7/7 expected files present, sensible bundle size                                       |
| 2 | HTML structure         | 10    | 4 tabs, button/pane IDs match, semantic roles, D3 loaded before app.js                 |
| 3 | JS correctness         | 10    | smoke-test 8/8 pass; 0 console errors in browser across all 4 tabs                     |
| 4 | Data contract          | 9     | results.json parses; estimates align with post tables                                  |
| 5 | Accessibility          | 9     | every slider has aria-label; tabs use role=tab + aria-selected                         |
| 6 | Performance            | 10    | lasso_path n=500,p=100 in 103 ms                                                       |
| 7 | Pedagogy               | 9     | post takeaways foregrounded in Tab-1 lede; "what to look for" panels; 8 glossary rows  |
| 8 | Hugo integration       | 10    | YAML link uses web_app/index.html; all assets HTTP 200                                 |
| 9 | Visual design          | 9     | dark palette tokens only; **legend-overlap issues fixed** (was: 6 before fix)          |
|10 | Mobile responsiveness  | 9     | charts use viewBox; tab strip horizontal-scrollable                                    |

## Issues fixed

### HIGH — Overlap audit findings (mandatory site-wide concern)

| Chart                                | Issue                                                                                         | Fix                                                                                                       |
|--------------------------------------|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| Tab 1 `within_animation`             | "POLS slope = 0.07" label placed at line endpoint collided with worker name labels (Alice)    | Moved both POLS and FE slope labels into a dedicated right-margin legend column (margin.right 28→130)    |
| Tab 1 `variation_bars`               | Legend "between/within" at y=-14 sat right against the top bar's inside percentage labels     | Enlarged top margin 18→42, moved legend to y=-24 well above the bars                                      |
| Tab 2 `panel_scatter`                | 3 slope labels (truth, POLS, FE) stacked at right edge of each line, overlapping each other AND data points when slopes were similar | Moved into a fixed 3-row right-margin legend column with color swatches (margin.right 24→140) |
| Tab 2 `beta_histograms`              | "true beta = 0.21" label at y=12 sat directly on the histogram bars (which peak at beta_true) | Moved annotation to top margin (y=-8); added top-margin POLS/FE color-swatch legend                       |
| Tab 4 `hausman_explorer`             | "H = ... · p = ..." label at y=12 overlapped chi-square curve peak; "5% critical (3.84)" at y=h-10 overlapped x-axis tick labels | Both labels moved into top margin band (margin.top 28→48); H/p centered & clamped, critical label at y=14 |

### Other observations

- Forest plot (Tab 3) was already clean — facet labels, method labels, estimates all in their own lanes.
- No `console.error` calls in the browser pass.
- Pedagogical alignment: post's "POLS 7%, FE 21%, factor of 3" takeaway appears verbatim in Tab-1 lede and the forest-plot Tab-3 "what to look for" panel.

## Positive highlights

1. **Live within-transformation animation** demonstrates the post's central
   "only switchers identify beta" pedagogical point.
2. **Forest plot tooltips** show SE, 95% CI, and n on hover — uncommon polish.
3. **Hausman + Mundlak Tab 4** lets users drive H themselves and see the
   underpowered-test pathology, matching the post's argument exactly.
4. **Smoke-test 8/8 passes** at 103 ms.
5. **All four tabs** share the dark navy palette + clean typography.

## How to re-review

```
/project:review-app python_panel_intro
```
