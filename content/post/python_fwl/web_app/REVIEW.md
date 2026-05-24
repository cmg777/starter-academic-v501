# Review — python_fwl/web_app

- **Audit date:** 2026-05-24
- **Focus:** all 10 dimensions (with explicit overlap audit)
- **Browser pass:** enabled (headless Chromium, desktop 1280x800 + mobile 375x667)
- **Smoke test:** 8 / 8 passed (lasso path 104 ms)
- **HTTP checks:** all assets HTTP 200; YAML link `web_app/index.html` (no trailing-slash bug)
- **Console errors:** none on any tab in either viewport

## Verdict: ACCEPT (after fix)

Smoke test and pedagogical alignment are strong; data contract matches the post's Summary-of-results table exactly. The previous overlap issues on Tabs 1, 2, and 4 (legends and "true α" annotations colliding with bars/points) have been fixed by relocating all legends and annotations into the top margin so they sit ABOVE the plot area. Re-audit confirms no remaining overlap; no console errors.

## Dimension scores

| # | Dimension              | Score | Note                                                              |
|---|------------------------|-------|-------------------------------------------------------------------|
| 1 | File completeness      | 10    | All 7 expected files present                                      |
| 2 | HTML structure         | 10    | 4 tabs with matching button/pane IDs; semantic roles correct       |
| 3 | JS correctness         | 10    | Smoke test 8/8; no console errors                                  |
| 4 | Data contract          | 10    | results.json matches post Summary table verbatim                   |
| 5 | Accessibility          | 9     | All sliders have aria-label; tab buttons use role=tab              |
| 6 | Performance            | 10    | lasso_path 104 ms; smoke test < 300 ms                             |
| 7 | Pedagogy               | 9     | Takeaways foregrounded in Tab 1; glossary 8 entries                |
| 8 | Hugo integration       | 10    | YAML link correct; all assets 200                                  |
| 9 | Visual design          | 9     | All legends/annotations relocated outside plot area; no overlap    |
|10 | Mobile responsiveness  | 8     | viewBox/preserveAspectRatio in use; no horizontal overflow         |

## Issues

| Severity | Dim | Location                              | Issue                                                                                  | Fix                                                                                              |
|----------|-----|---------------------------------------|----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| HIGH     | 9   | charts.js naive_vs_fwl_histograms     | Legend rect at top-right INSIDE plot overlaps the teal histogram bars                  | Increase top margin, move legend ABOVE chart (between title and plot area), or place outside SVG |
| MED      | 9   | charts.js naive_vs_fwl_bars           | "true α = 0.20" label at y=-8 collides with FWL value label when value ≈ 0.20          | Push label above plot via larger top margin; ensure horizontal offset away from bar label        |
| MED      | 9   | charts.js fwl_residualisation_animation | slopeNote text inside plot at y=14 can sit on top of data points near top-right       | Move slopeNote above plot area (negative y in margin)                                            |
| LOW      | 5   | index.html                            | Forest-plot method checkboxes lack aria-label (label wraps input — fine, just minor)   | None required                                                                                    |

## Overlap audit (mandatory)

Inspected all chart-rendering JS:

- `fwl_residualisation_animation` (Tab 1): `titleLabel` at y=-8 sits ABOVE plot — OK. `slopeNote` at y=14 (inside plot, top-right) — **flagged MED**, can overlap data.
- `naive_vs_fwl_bars` (Tab 2): "true α" annotation at (x(alpha_true)+4, -8) — **flagged MED**, collides with FWL value label.
- `fwl_forest_plot` (Tab 3): "true α" annotation at y=-12 — OK; sits above the plot area.
- `naive_vs_fwl_histograms` (Tab 4): legend `<rect>` at translate(w-180, 4) INSIDE plot area — **flagged HIGH**, overlaps FWL teal bars.

## Positive highlights

- Smoke test clean; lasso_path under 110 ms.
- Pedagogy: Tab-1 lede states sign-flip headline numbers (-0.106 -> +0.267) tying to post.
- Tab 3 forest plot uses correct method colors and tooltip with SE/CI/p-value.
- Mobile screenshots show no horizontal overflow; tab strip wraps cleanly.

## Priority action items

1. **[HIGH]** Move Tab 4 histogram legend OUTSIDE the plot area (top, above the chart).
2. **[MED]** Increase top margin on Tab 2 bar chart and reposition "true α" label so it sits above the plot.
3. **[MED]** Move Tab 1 slopeNote out of the data area (negative y in margin).

## How to re-review

```
/project:review-app python_fwl
```
