# Web App Review — `stata_cate`

**Audit date:** 2026-05-24
**Focus:** all 10 dimensions (full audit, browser pass enabled)
**Reviewer:** automated `/project:review-app`-equivalent audit

## Verdict

**ACCEPT** (after two fixes applied — see "Fixes applied" below)

Initial pass uncovered a JS parse error in `charts.js` that prevented the
second IIFE (containing all CATE-specific chart builders) from loading at
all. Tab 1 animation, the GATE/GATES bars, the IATE histogram, and the
covariate scatter were therefore non-functional out of the gate. A second
issue caused the forest plot view on Tab 3 to silently render nothing
because two D3 builders bound to the same container clobbered each
other's SVG. Both are now fixed; smoke test passes 8/8; no console errors
across the four tabs at desktop and mobile viewports; forest plot now
renders with proper colour-coding for the four ATE estimators.

## Dimension scores

| # | Dimension              | Score | Notes |
|---|------------------------|------:|-------|
| 1 | File completeness      |    10 | All 7 expected files present. |
| 2 | HTML structure         |     9 | 4 tabs with matching IDs, `role="tab"`/`aria-selected`, headings hierarchical, glossary 8 entries. |
| 3 | JS correctness         |    10 | After fix: smoke 8/8, no console errors, no `{{…}}` leakage. |
| 4 | Data contract          |     9 | `results.json` parses, schema matches app, numbers agree with post ($7,937 ATE, 9,913 households, etc.). |
| 5 | Accessibility          |     8 | Every slider has `aria-label`; tab strip uses `role="tab"`. Glossary uses native `<details>`. |
| 6 | Performance            |    10 | `lasso_path(n=500, p=100)` runs in 102 ms (well under 300 ms budget). |
| 7 | Pedagogy               |     9 | Tab-1 lede foregrounds ATE-vs-CATE distinction; "what to look for" panels on Tabs 2-3; 8-entry glossary; post takeaways visible. |
| 8 | Hugo integration       |    10 | YAML link uses `web_app/index.html` (no trailing-slash bug); all assets HTTP 200. |
| 9 | Visual design          |     9 | Dark navy palette throughout; teal/orange/steel accents consistent with the rest of the site. Legend panel in Tab 2 uses semi-transparent backing for clean separation from data. |
|10 | Mobile responsiveness  |     8 | Charts use `viewBox` and `preserveAspectRatio`. The GATE bars chart has a 250 px left margin baked in — at 375 px viewport the bar area is squeezed but legible. |

## Issues table

| # | Sev  | Dim | Location                       | Issue                                                                                                       | Fix                                                                                                                                              | Status |
|---|------|-----|--------------------------------|-------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| 1 | HIGH | 3   | `charts.js:603`                | `Math.exp(-((v - 20)/8)**2)` — unary `-` immediately before `**` is a SyntaxError. Entire second IIFE bails, breaking every CATE-specific chart. | Use `Math.exp(-(Math.pow((v - 20)/8, 2)))`.                                                                                                       | FIXED  |
| 2 | HIGH | 3   | `app.js:148-150`               | `gate_bars` and `forest_plot` both created at init with same container. Whichever was used last detaches the other's SVG; switching the radio to "Forest plot" produced an empty chart. | Drop the shared init; recreate the chart fresh inside `gate_render` for each view.                                                               | FIXED  |
| 3 | MED  | 9   | `charts.js:233-239`            | `forest_plot`'s `colorMap` only listed r_double_lasso method names; the four stata_cate methods fell through to white `C.text` — losing colour differentiation in the forest plot. | Extended `colorMap` with the four stata_cate method names (muted/steel/teal/orange).                                                              | FIXED  |
| 4 | LOW  | 10  | `charts.js:734`                | `gate_bars` uses a fixed 250 px left margin; on 375 px mobile the data area shrinks but text remains legible. | Out of scope for this review; would need a responsive margin keyed off viewport.                                                                  | OPEN   |
| 5 | LOW  | 7   | `charts.js:705-722`            | In Tab-4 histogram the ATE and median labels sit very close to the top of the plot area; they don't overlap bars but feel cramped. | Could move labels under axis or add a small leader line.                                                                                          | OPEN   |

## Positive highlights

- The Tab-2 simulator legend uses a semi-transparent panel (`rgba(15,23,41,0.7)`)
  with a thin border, sitting in the top-right corner above the data. This is a
  clean implementation of the "legend outside the plot lines" pattern the
  user has been asking for site-wide.
- Tab-1 animation is on-message — a marker bouncing along a curve with the
  flat ATE line above is a strong visual hook for the ATE-hides-CATE
  argument.
- Eight glossary entries cover the full vocabulary the post uses: ATE,
  CATE, IATE, GATE, GATES, PO, AIPW, heterogeneity test. None feel like
  filler.
- GATE/GATES view toggle is a single radio group — minimal cognitive
  load for a non-trivial pedagogical pivot.
- Real Stata-exported numbers ($7,937 ATE, $4,087 lowest income cat,
  $20,511 highest) flow straight through `results.json` into the bars
  and the side-stats — no hand-typed magic numbers in the JS.

## Overlap audit (user's site-wide concern)

Explicitly checked every chart for legend / annotation overlap with data:

- Tab 1 animation: ATE label sits at right edge on the ATE line (above);
  CATE label at far right above its curve. Marker label "$Xk" tracks
  the moving dot above. **No overlap.**
- Tab 2 simulator: legend in semi-transparent panel top-right; data
  scatters in the lower-centre region. **No overlap.**
- Tab 3 GATE/GATES bars: dollar amounts sit immediately to the right
  of each CI whisker, never on top of bars. ATE reference label sits
  above the plot area. **No overlap.**
- Tab 3 forest: same pattern — dollar labels right of CIs, method
  labels left of plot. **No overlap.**
- Tab 4 histogram: ATE/median labels in top-right where bin counts
  are zero. **No overlap with bars** (but cramped — LOW issue #5).
- Tab 4 IATE-vs-covariate scatter: no annotations on the plot itself,
  only axis labels. **No overlap.**

## Fixes applied this session

1. `charts.js`: rewrote `Math.exp(-((v - 20)/8)**2)` → `Math.exp(-(Math.pow((v - 20)/8, 2)))` to avoid the unary-minus-before-exponent SyntaxError that was breaking the entire second IIFE.
2. `app.js`: removed the eager init of `gate_bars` and `forest_plot` into a shared `gateState` object; now `gate_render` creates the appropriate builder fresh per view. This fixes the empty-chart bug when switching to "Forest plot of ATE estimators".
3. `charts.js`: extended `forest_plot`'s `colorMap` to include the four stata_cate method names so each estimator gets its own colour in the forest plot view.

## How to re-review

```bash
/project:review-app stata_cate
# or focus on a single dimension:
/project:review-app stata_cate focus: pedagogy
```
