# Review — python_did/web_app

**Audit date:** 2026-05-24
**Reviewer:** /project:review-app (manual exec)
**Focus:** all 10 dimensions
**Browser pass:** enabled (Playwright + Chromium, 1280x800 & 375x667)

---

## Verdict (after fixes)

**ACCEPT** — initial pass flagged two MED overlap issues (Tab-1 animation
legend overlapping the L2 curve, Tab-4 ATT label colliding with the M cursor
label); both fixed in this revision. Smoke 8/8, no console errors, all assets
HTTP 200, YAML link correct.

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
| 8 | Hugo integration       | 10    |
| 9 | Visual design          | 9     |
|10 | Mobile responsiveness  | 9     |

## Fixes applied

| Sev | Dim | File | Fix |
|-----|-----|------|-----|
| MED | 9 | charts.js `l1_vs_l2_animation` | Legend moved OUTSIDE the plot area to a horizontal strip below the x-axis title. Plot height grown from 320 -> 360 and bottom margin from 44 -> 84 to accommodate. The moving L1/L2 dots can no longer pass behind legend text. |
| MED | 9 | app.js `h_render` (Tab 4) | "ATT = 2.60" annotation re-anchored to the LEFT (just inside the y-axis). "M = ..." cursor label moved to the BOTTOM of the plot and auto-flips text-anchor near the right edge (M > ~12) so it stays inside the chart. The two labels can no longer collide at any M. |

## Positive highlights

- All 4 tabs render cleanly across desktop and mobile viewports.
- 9 glossary entries (above the 6 minimum).
- "What to look for" pedagogy panels present on Tabs 2, 3, 4.
- Forest plot uses facet titles outside the plot area and method labels on the leftmost facet only.
- Smoke test 8/8 passes; LASSO inner loop runs in ~110-200 ms.

## How to re-review

```
/project:review-app python_did focus: visual
```
