# REVIEW — python_pyfixest/web_app

- Date: 2026-05-24
- Reviewer: automated (`/project:review-app`)
- Focus: all 10 dimensions
- Browser pass: enabled (Playwright headless Chromium, desktop 1280x800 + mobile 375x667)
- Verdict (post-fix): **ACCEPT**

## Dimension scores (post-fix)

| # | Dimension              | Score | Notes |
|---|------------------------|-------|-------|
| 1 | File completeness      | 10 | All 7 expected files present |
| 2 | HTML structure         | 10 | 4 tabs, button/pane IDs match, semantic roles |
| 3 | JS correctness         | 10 | 8/8 smoke tests pass; 0 console errors across all 4 tabs in both viewports |
| 4 | Data contract          | 10 | results.json parses; method names now match charts (see fix below) |
| 5 | Accessibility          | 9  | Sliders have aria-label, tabs have role+aria-selected |
| 6 | Performance            | 10 | lasso_path 98 ms (well under 300 ms budget) |
| 7 | Pedagogy               | 9  | Takeaways foregrounded; 8 glossary entries; "what to look for" panels on each tab |
| 8 | Hugo integration       | 10 | All HTTP 200 |
| 9 | Visual design          | 9  | Dark palette tokens only; legends now distinct from data marks |
| 10 | Mobile responsiveness | 9  | viewBox scaling clean at 375x667 |

## Issues found & fixed

| Severity | Dimension | Location | Issue | Fix applied |
|----------|-----------|----------|-------|-------------|
| HIGH | 4 (data contract) | `charts.js` forest_plot METHOD_COLOR | Color map keys were stale-template values (`POLS`, `Between`, `FDFE`, `FE`, `TWFE`, `RE`, `CRE`) that did not match the actual `method` field in results.json (`Pooled OLS`, `One-Way FE`, `Two-Way FE`, `Three-Way FE`, `CRE`). All non-CRE bars fell back to the same default steel color. | Rekeyed METHOD_COLOR to use the exact strings from results.json, assigned distinct hues per method, and added a legend in the top margin so readers can decode the colors. |
| HIGH | 9 (visual) | `charts.js` within_animation POLS slope label | The "Pooled OLS slope = 0.183" label at `x(1.1)` overlapped Carla's data point (1, 2.4) in the top-right of the within-animation chart. | Replaced inline label with a 2-row legend block (POLS + FE) in the upper-left corner. Each legend item shares the animation's per-phase opacity. |
| HIGH | 9 (visual) | `charts.js` panel_scatter line labels | Three right-edge labels (true beta, POLS, FE) stacked at the right margin and overlapped each other badly whenever slopes were similar. | Removed inline right-edge labels. Added a 3-item horizontal legend in an enlarged top margin (top: 20 -> 70px). Labels update in place when the data refreshes. |
| MED | 9 (visual) | `charts.js` variation_bars "0.0% within" callout for `educ` | The within-pct callout for the educ row (100% between, 0% within) was rendered with `text-anchor:start` past `x(100)`, pushing it off the chart's right edge. | Increased right margin 28 -> 90px so the callout sits inside the plot area. |
| MED | 9 (visual) | `charts.js` variation_bars legend | Legend was at `y=-14` inside a 18px top margin — cramped against the top of the topmost bar. | Increased top margin 18 -> 36px and re-anchored the legend to `y=-28` so it sits in clear airspace above the bars. |

## Positive highlights

- 8/8 smoke tests pass; no console errors across all four tabs in either viewport.
- Within-animation cycles smoothly with a clear caption that names the current phase (raw / demeaning / demeaned).
- SE Showdown bar chart has clean above-bar value labels and a rotated x-axis — no overlap.
- Glossary covers the eight key concepts (FE, within transformation, TWFE, three-way FE, time-invariant variables, CRV1, CRE/Mundlak, event study).
- Mobile layout collapses cleanly via the existing `grid-2 -> 1fr` breakpoint at 900px.

## Files touched

- `charts.js` — five edits (see issues table)

## How to re-review

```
/project:review-app python_pyfixest
```
