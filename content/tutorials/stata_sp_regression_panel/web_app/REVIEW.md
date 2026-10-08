# Web App Review — `stata_sp_regression_panel`

**Audit date:** 2026-05-24
**Scope:** all 10 dimensions
**Browser pass:** enabled (Playwright headless Chromium, desktop 1280x800 + mobile 375x667)

---

## Verdict: ACCEPT (after fixes)

No HIGH issues remain after fixes were applied. The web app loads cleanly,
all four tabs switch with no JS errors, sliders respond in well under
300 ms, and the smoke test passes 8/8. The two MED issues identified
(Tab-3 title/annotation overlap and Tab-4 facet-title vs value-label
crowding) have been resolved.

---

## Dimension scores

| # | Dimension                | Score | Notes                                                              |
|---|--------------------------|-------|--------------------------------------------------------------------|
| 1 | File completeness        | 10    | All 7 expected files present at `web_app/`                         |
| 2 | HTML structure           | 10    | 4 tabs with matching button/pane IDs, role/aria attributes correct |
| 3 | JS correctness           | 10    | Smoke test 8/8, no console errors during Playwright pass           |
| 4 | Data contract            | 10    | `data/results.json` parses, schema matches data-handling.md        |
| 5 | Accessibility            | 9     | Every slider has aria-label, tabs use role=tab + aria-selected     |
| 6 | Performance              | 10    | `lasso_path(n=500, p=100)` = 97 ms; slider tick responsive         |
| 7 | Pedagogy                 | 9     | Three key takeaways foregrounded in Tab-1; glossary 10 entries     |
| 8 | Hugo integration         | 10    | YAML link uses `web_app/index.html` (no trailing-slash bug)        |
| 9 | Visual design            | 9     | Dark palette tokens; overlap fixed in Tab-3 dynamic chart          |
|10 | Mobile responsiveness    | 9     | 375x667 tab strip reachable; charts use viewBox                    |

---

## Issues identified and fixed

| Sev  | Dim | Location                          | Issue                                                                                                   | Fix applied                                                                                          |
|------|-----|-----------------------------------|---------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| MED  | 9   | `app.js` renderDynamicChart       | The cyan "true ρ = X.XX" label (at y=-2) collided with the chart title (at y=-10) for typical ρ values. | Increased top margin to 44; placed title at y=-28, truth label at y=-10 with anchor clamped to edges. |
| MED  | 9   | `app.js` renderDynamicChart       | Bar value labels (e.g. "0.700") could overflow to the right of the chart when ρ̂ approached 0.8.        | Added flip-anchor logic: when bar tip is within 50 px of right edge, the label is right-anchored inside. |
| MED  | 9   | `app.js` renderForest             | Per-facet titles "logp — Direct effect" sat at y=-12, only 3 px above value labels (y=yc-9) on row 1.    | Top margin raised to 44; title placed at y=-22; row pitch increased from 30 to 34 px.                |
| LOW  | 9   | `app.js` renderForest             | Value labels above forest dots could overflow the facet box at the left or right edge.                  | Label x-coord clamped to `[12, facetW-12]` so it stays inside the facet.                             |

---

## Positive highlights

- The Tab-2 lattice spillover animation is genuinely novel pedagogy:
  click any cell to drop a unit shock, then watch the multiplier
  propagate. The amplification statistic mirrors the `1 / (1 − ρ)`
  formula directly.
- Tab-3's "trade τ against ρ" simulator hits the §8 finding hard:
  setting τ = 0.85 with ρ = 0 still produces a spurious large ρ̂ in
  the static SDM — the false-positive trap made visible.
- The Tab-1 lede pulls the three key headline numbers (ρ̂ = 0.265,
  indirect price −0.314, τ̂ = 0.654) into a single paragraph, then
  surfaces them as a numbered list in the "three key takeaways"
  card. Pedagogical alignment is strong (3/3 covered).
- The forest plot in Tab 4 lets the reader toggle models AND
  regressors, making the OLS/FE-vs-SDM gap interactive rather than
  static. The data contract in `results.json` includes 8 models × 2
  regressors × 3 effects = 48 rows so the toggles are well-supported.
- Tab 1 reuses the L1/L2 animation as a metaphor for the spatial
  multiplier (`1 / (1 − ρ)`) — slightly cute but pedagogically apt.

---

## How to re-review

```
/project:review-app stata_sp_regression_panel
```

To re-screenshot only the dynamic-chart area:

```
node /tmp/sp_panel_verify.js   # uses Hugo on port 1339
```
