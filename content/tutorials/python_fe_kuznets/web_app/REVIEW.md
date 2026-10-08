# Web App Review — python_fe_kuznets

- **Audit date:** 2026-05-24
- **Focus:** all 10 dimensions
- **Browser pass:** enabled (Playwright headless Chromium 1280×800 + 375×667)

## Verdict

**ACCEPT** — App is functionally correct (smoke test 8/8, no console
errors, all assets HTTP 200, YAML link correct). Overlap fixes applied
in this pass move three chart legends OUTSIDE the plot areas so they
no longer collide with data marks. Pedagogy and data contract are
strong.

## Dimension scores

| # | Dimension              | Score |
|---|------------------------|-------|
| 1 | File completeness      | 10    |
| 2 | HTML structure         | 10    |
| 3 | JS correctness         | 10    |
| 4 | Data contract          | 10    |
| 5 | Accessibility          | 9     |
| 6 | Performance            | 10    |
| 7 | Pedagogy               | 9     |
| 8 | Hugo integration       | 10    |
| 9 | Visual design          | 9     |
|10 | Mobile responsiveness  | 8     |

## Issues fixed in this pass

| Severity | Dim | Location                              | Issue                                                                                                                                                                | Fix applied                                                                                                                                  |
|----------|-----|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| HIGH     | 9   | charts.js `panel_scatter`             | Three curve end-labels ("true cubic", "pooled OLS", "TWFE (within)") stacked at the same `x` and overlapped the scatter cluster.                                      | Right margin increased to 150 px; legend rendered as a labelled box OUTSIDE the data area with one mini-line + text per curve.               |
| MED      | 9   | charts.js `panel_animation`           | Legend rect at `(w - 130, 6)` sat INSIDE the plot, covering Qatar's trajectory at log GDP ≈ 11.0–11.5.                                                                | Right margin increased to 150 px; legend translated to `(w + 8, 0)`, sitting in the new outside-band so country lines render uninterrupted. |
| LOW      | 9   | charts.js `kuznets_curve`             | "data range" bracket label sat between USD ticks and could read as an overlapping element near $100,000.                                                              | Bracket now has explicit end caps; the label is anchored to the right of `x(5.25)−6` in the left axis margin, away from USD ticks.           |

## Positive highlights

- Smoke test passes 8/8 (qnorm precision, OLS recovery, performance 107 ms).
- `data/results.json` schema validates; values agree with the post's Table 4 numbers.
- Glossary covers 8 terms; "What to look for" pedagogy panel in each tab.
- Tab-1 lede directly states the headline N-shape finding.
- All four chart areas use `viewBox` for mobile scaling.
- Tab strip uses `role="tablist"` and `aria-selected` attributes.

## How to re-review

```
/project:review-app python_fe_kuznets
/project:review-app python_fe_kuznets focus: visual
```
