# Review — r_did_ring/web_app

**Audit date:** 2026-05-24
**Reviewer:** /project:review-app (manual execution)
**Focus:** all 10 dimensions
**Browser pass:** enabled (Chromium 1280×800 + 375×667)

## Verdict (post-fix)

**ACCEPT** — code is correct, smoke test passes 8/8, no console errors, and the overlap issues identified in the initial pass have been fixed by moving legends out of the data area and adding offset logic to the cut/dt labels.

## Dimension scores

| # | Dimension              | Score | Notes |
|---|------------------------|-------|-------|
| 1 | File completeness      |  10   | All 7 files present, data/results.json valid |
| 2 | HTML structure         |  10   | 4 tabs, correct role/aria-selected wiring, headings present |
| 3 | JS correctness         |   9   | Smoke test 8/8; no console errors |
| 4 | Data contract          |  10   | results.json schema matches; values agree with table_lr_*.csv |
| 5 | Accessibility          |   9   | All sliders have aria-label; tabs have role=tab + aria-selected |
| 6 | Performance            |  10   | smoke test < 110 ms; 100-sim run debounced and batched |
| 7 | Pedagogy               |   9   | Lede foregrounds key takeaways; "what to look for" panels in every interactive tab; 8 glossary entries |
| 8 | Hugo integration       |  10   | YAML link uses `web_app/index.html`; all assets HTTP 200 |
| 9 | Visual design          |   9   | Legends moved below x-axis (outside the data area); cut/dt labels split horizontally when close |
|10 | Mobile responsiveness  |   8   | Charts use viewBox; legends still legible at 375px since they're outside the plot |

## Issues (resolved)

| # | Sev  | Dim | Location                          | Issue                                                                                                        | Fix applied                                                                                                  |
|---|------|-----|-----------------------------------|--------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| 1 | MED  | 9   | charts.js `ringchoice_curve` legend  | Legend box (top-right) sat on top of the CI band and curve at the right edge.                            | Moved legend below the x-axis label (bottom margin 50 → 110, top margin 30 → 46). |
| 2 | MED  | 9   | charts.js `ringchoice_curve` slider readout | "d̄ = X.XX mi · ATT = X.XX %" text near top overlapped the legend box.                              | Top margin grown to 46 so readout has its own band; legend is now below the chart, so no overlap.            |
| 3 | MED  | 9   | charts.js `simulator_curve` legend   | Legend box (top-right) overlapped the true τ(d) curve when A or k pulled the curve right.              | Moved legend below x-axis label; added entries for d̄ and d_t vertical lines for completeness.               |
| 4 | LOW  | 9   | charts.js `simulator_curve` cut/dt labels | When `cut ≈ dt`, "d̄ = X" and "d_t = X" labels stacked and were hard to read.                          | When `|cut - dt| < 0.06`, labels are now split horizontally (d_t left, d̄ right) at y = -22.                  |

## Positive highlights

- Clean DGP and accurate truth-avg formula for simulator (analytical integral, not Monte Carlo).
- 100-sim batched with `setTimeout` to keep UI responsive — good pattern.
- 8 glossary cards covering the canonical jargon (ATT, ring choice, parallel trends, etc).
- Lede in Tab 1 directly cites Linden-Rockoff numbers from the post.
- No inherited template bugs: no stale `r_double_lasso` colorMap, no stale x-domain.
- After the fix, legends are now consistently rendered as a horizontal strip below the x-axis label — readable on mobile too.

## How to re-review

```
/project:review-app r_did_ring
```
