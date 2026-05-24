# REVIEW — python_EconML web_app

- **Audit date:** 2026-05-24
- **Focus:** all 10 dimensions
- **Browser pass:** enabled (Playwright Chromium 1.60, Node 25.9)
- **Verdict:** ACCEPT

## Dimension scores

| # | Dimension              | Score | Notes |
|---|------------------------|-------|-------|
| 1 | File completeness      | 10    | All 7 expected files present (index.html, styles.css, dgp.js, lasso.js, charts.js, app.js, data/results.json). |
| 2 | HTML structure         | 10    | 4 tabs with matching button/pane IDs, role="tab"/"tabpanel", aria-selected toggling, D3 loaded before app scripts. |
| 3 | JS correctness         | 10    | 8/8 smoke tests pass. 0 console errors, 0 page errors across all 4 tabs in headless Chromium. |
| 4 | Data contract          | 10    | results.json parses; 18 estimate rows match the post's tutorial_results/ate-table.csv; gate_by_exec series intact. |
| 5 | Accessibility          | 9     | Every slider has aria-label; tabs use role="tab"+aria-selected; high-contrast palette throughout. |
| 6 | Performance            | 10    | lasso_path(n=500, p=100) = 106 ms (well under 300 ms budget). Slider response < 200 ms in browser. |
| 7 | Pedagogy               | 9     | Tab-1 lede surfaces the 0.109 vs 0.250 vs 0.240 bias story; glossary has 8 entries; "What to look for" panels on every tab; explicit ties between Tabs 2/3 (simulation) and Tab 4 (real EconML output). |
| 8 | Hugo integration       | 10    | YAML link uses url: web_app/index.html (no trailing slash); all assets HTTP 200 via Hugo dev server at /post/python_econml/web_app/. |
| 9 | Visual design          | 10    | Dark palette tokens only (steel/orange/teal on bg). Every legend now sits OUTSIDE the plot area; no annotation-on-data overlap. Forest plot uses 2x3 grid when 6 outcomes are active so facet titles never collide. |
|10 | Mobile responsiveness  | 9     | 375x667 viewport: tab strip intact, no horizontal page scroll, all 4 tabs reachable, SVGs use viewBox for responsive scaling. |

## Issues table

(No HIGH or MED issues remaining after the overlap-fix pass.)

| Severity | Dimension | Location | Issue | Fix applied |
|----------|-----------|----------|-------|-------------|
| (fixed) HIGH | 9 | charts.js l1_vs_l2_animation | Legend at translate(w-220, 10) sat INSIDE the plot area and overlapped the L1 curve (visible in initial screenshot). | Moved legend to below x-axis label; added 42 px bottom margin; centered horizontally. |
| (fixed) HIGH | 9 | charts.js gate_lines | Legend rect at translate(w-320, 0) overlapped the mining-effect (teal) line and CI band across the entire upper-right of the GATE chart. | Moved legend to legendTopY = h + 64 (below x-axis label); stacked 2 rows; added 60 px bottom margin. |
| (fixed) MED  | 9 | charts.js forest_plot | When all 6 outcomes were selected, the 1-row strip squeezed facets to ~100 px and adjacent facet titles ran into each other ("1-0 (Mining vs n2-0 (Med price vs n3-0..."). | Switched to a 2x3 grid layout when nFacets > 3; titles now have full facet width and never overlap. |
| (fixed) MED  | 9 | charts.js forest_plot | No legend at all — readers had to infer method colors from the post text. | Added method-color legend below the bottom row of facets. |
| (fixed) MED  | 9 | charts.js alpha_histograms | "true α = X.XX" caption rendered at y=10 inside the plot, potentially overlapping a tall histogram bar; no legend distinguished teal (rigorous) vs orange (CV) bars. | Added 54 px top margin; moved true-α label to y=-22 (in reserved whitespace); added centered top legend. |
| (fixed) LOW  | 9 | charts.js coefficient_path | No legend for the orange (treatment) / teal (active control) / faint-grey (dropped) lines. | Added 3-entry legend below the chart; widths estimated with fixed em (≈6.6 px/char) since getComputedTextLength returns 0 for off-screen SVG nodes. |
| (fixed) LOW  | 9 | charts.js alpha_compare | "true α = X.XX" caption could spill off the right edge of the chart when alpha_true was near the maximum. | Anchor flips to end/middle/start based on x position; added 12 px to top margin so caption sits in dedicated whitespace. |

## Positive highlights

- **Pedagogy is tight.** The Tab-1 lede ("0.109 observed vs 0.250 true, 56% downward bias") is repeated almost verbatim in the Tab-4 "Connecting back" card — strong narrative spine.
- **Two-stage residualization message is built into the widgets.** Tab 2 (LASSO selection) -> Tab 3 (rigorous vs CV head-to-head) -> Tab 4 (real EconML output) is a clean pedagogical sequence.
- **Mobile works without horizontal scroll** even with the tab strip + 4 sliders per pane.
- **Data contract is honest:** DL (CV) is repurposed as Ground Truth and that decision is documented inline in results.json.
- **Glossary covers exactly the EconML jargon a reader needs** (CATE, ATE, GATE, nuisance functions, cross-fitting, honest splitting, Neyman orthogonality, BLB SEs) — 8 entries, just above the 6-entry floor.

## Priority action items

None remaining. The app is in shippable state.

## How to re-review

```
/project:review-app python_EconML
# or focus on visual / accessibility for a quick re-check:
/project:review-app python_EconML focus: visual
```

## Audit metadata

- Smoke test: 8/8 pass (run via Node 25.9 + smoke-test.js).
- Browser pass: Playwright Chromium, desktop 1280x800 + mobile 375x667. 0 page errors, 0 console errors, all 4 tabs reachable in both viewports.
- Hugo: served via 0.84.2 Extended at port 1316; all 7 assets + post page returned HTTP 200 (lowercased URL: /post/python_econml/...).
- Reference posts compared: r_double_lasso (the write-app reference implementation) for tab structure and legend conventions.
