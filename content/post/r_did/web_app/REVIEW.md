# Web app review: `r_did`

- **Audit date:** 2026-05-24 (re-review after legend/annotation overlap fixes)
- **Focus:** all 10 dimensions (full audit + post-fix verification)
- **Browser pass:** enabled (headless Chromium @ 1280×800 + 375×667)
- **Report path:** `content/post/r_did/web_app/REVIEW.md`

## Verdict: **ACCEPT**

All HIGH-severity visual overlap issues have been resolved. Smoke test
passes 8/8, no console errors, pedagogical alignment is strong, and every
chart legend now sits in its own lane below the plot with a background
rect for legibility. In-plot annotations ("DiD effect at t+3",
"True ATT = …", "breakdown M̄ ≈ 0.67") all now carry semi-transparent
dark backgrounds so they remain readable against any underlying data marks.

## Dimension scores

| # | Dimension              | Score | Notes                                                                 |
|---|------------------------|------:|-----------------------------------------------------------------------|
| 1 | File completeness      |   10  | All 7 expected files present; bundle is well-organised                |
| 2 | HTML structure         |   10  | 4 tabs with correct ARIA, glossary has 8 entries, lasso-template tags renamed |
| 3 | JS correctness         |   10  | Smoke test passes 8/8; 0 console errors                               |
| 4 | Data contract          |   10  | results.json parses; 10 forest rows; 3 event-study series             |
| 5 | Accessibility          |    8  | All sliders have labels; tabs use role="tab" + aria-selected          |
| 6 | Performance            |   10  | lasso_path 96ms; sim of 100 runs <3s                                  |
| 7 | Pedagogy               |    9  | Tab-1 lede covers all 3 takeaways; glossary 8 entries                 |
| 8 | Hugo integration       |   10  | YAML link `web_app/index.html` is correct; all assets HTTP 200        |
| 9 | Visual design          |    9  | Legends out of plot area + in-plot labels have background rects       |
|10 | Mobile responsiveness  |    9  | viewBox used; tab strip works; no horizontal overflow at 375×667      |

## Issues resolved in this revision

| Severity | Dim | Location | Issue | Fix applied |
|---------:|----:|----------|-------|-------------|
| HIGH (FIXED) | 9 | `charts.js` `parallel_trends_animation` | Legend at `translate(W-240, 10)` overlapped lines on right edge of Tab 1 chart. | Moved legend to a dedicated lane at the bottom of the SVG with semi-transparent background rect; raised `H` from 340 to 380 and `bottom` margin from 48 to 80. ATT annotation now has a dark background rect. |
| HIGH (FIXED) | 9 | `app.js` `initParallelTrends` | Same pattern duplicated on Tab 2 — legend overlapped lines AND the teal DiD α̂ label. | Same fix: legend moved below plot, both DiD label and legend get background rects. |
| HIGH (FIXED) | 9 | `charts.js` `did_event_study` | Legend at `translate(w-220, 4)` overlapped lines/points on Tab 4 event study. | Moved legend to a dedicated lane at SVG bottom with background rect; raised `H` from 360 to 400 and `bottom` margin from 48 to 80. |
| HIGH (FIXED) | 9 | `charts.js` `honestdid_chart` | "breakdown M̄ ≈ 0.67" label at `y=16` overlapped teal CI band. | Added semi-transparent dark background rect behind the label. |
| HIGH (FIXED) | 9 | `charts.js` `did_sim_histograms` | "True ATT = …" label collided with TWFE/CS-style legend. | Legend moved to dedicated lane at SVG bottom with background rect; True-ATT label gets its own dark background rect. |
| LOW (FIXED) | 2 | `index.html` Tab 3 panel headings | `<span class="tag rigorous">` and `<span class="tag cv">` inherited lasso-template class names. | Renamed to neutral `tag tag-cs` and `tag tag-twfe`; added matching CSS rules in `styles.css`. |

## Positive highlights

- Smoke test passes 8 of 8 (qnorm precision, λ_max bound, OLS recovery, < 300 ms performance, results.json schema).
- Tab 1 lede explicitly states all three headline numbers (TWFE −0.038, DR −0.065, M̄ ≈ 0.67) — strong pedagogical alignment.
- All chart legends now sit outside the plotting area, with semi-transparent dark background rects for legibility.
- In-plot annotations (DiD effect, True ATT, HonestDiD breakdown) carry dark background rects so they remain readable against any underlying data marks.
- Zero console errors across all four tabs in desktop and mobile viewports.
- No horizontal overflow at 375×667 (scrollWidth = clientWidth).

## How to re-review

```
/project:review-app r_did
# or focus on visual + mobile:
/project:review-app r_did focus: visual
```
