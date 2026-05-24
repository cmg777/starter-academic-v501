# Web App Review — python_mgwr

**Audit date:** 2026-05-24
**Scope:** All 10 dimensions (manual audit — review skill not available as a slash command in this thread)
**Browser pass:** static + smoke test only (no Playwright)
**Verdict (initial):** MAJOR REVISION

## Summary

The app's underlying math (LASSO / DL pipelines) is sound — the Node `vm`
smoke test passes 8 of 8 (qnorm, simulate_lasso, λ_max bound, OLS recovery,
performance 102 ms, results.json schema). The app structure is also good
(4 tabs, ARIA roles correct, glossary has 8 entries, dark palette consistent).

However the app is a port of the `r_double_lasso` template that was not
fully retargeted to MGWR:

1. **`app.js` references an HTML element (`lab-stat-p`) that does not exist**
   in `index.html` (it was removed when the stat row was retargeted). Setting
   `.textContent` on `null` throws `TypeError`, which aborts `lab_render`
   before it can compute or display the post-OLS β̂ on Tab 2. The Tab 2
   "β̂ (refit on support)" stat is therefore permanently `—`.
2. **`forest_plot`'s `colorMap` still uses the LASSO-paper method names**
   (`First diff`, `OLS (full)`, `PSL`, `DL (rigorous)`, `DL (CV)`) and
   default outcomes (`Violent crime`, `Property crime`, `Murder`). MGWR
   methods (`Global OLS`, `MGWR (median)`) fall through to the `C.text`
   white fallback, so the two methods on Tab 4 are visually
   indistinguishable.
3. **Tab 3's histogram has no legend** — teal and orange bars are drawn on
   top of each other without explaining which is which.

## Dimension scores (1-10)

| # | Dimension | Score | Notes |
|---|-----------|-------|-------|
| 1 | File completeness | 9 | All 7 expected files present; `selection_bars` in `charts.js` is dead code (LOW). |
| 2 | HTML structure | 9 | 4 tabs, proper roles, glossary has 8 entries. |
| 3 | JS correctness | 4 | HIGH — `lab-stat-p` throws and breaks Tab 2 stat row rendering. |
| 4 | Data contract | 8 | `results.json` parses; schema fits forest plot. |
| 5 | Accessibility | 9 | All sliders have `aria-label`; tabs use `role` + `aria-selected`. |
| 6 | Performance | 10 | Smoke-test path 102 ms (well under 300 ms cap). |
| 7 | Pedagogy | 9 | Post takeaways (β = −0.195, R² 0.21 → 0.76, AICc 1341 → 838) appear in Tab 1 lede, Tab 3 conclusion, Tab 4 forest plot. |
| 8 | Hugo integration | 9 | YAML link uses `web_app/index.html`. (Assumed — no HTTP probe in this session.) |
| 9 | Visual design | 5 | HIGH — Tab 4 forest plot draws all rows in the same white; methods indistinguishable. MED — Tab 3 histogram lacks a legend. |
| 10 | Mobile responsiveness | 8 | All charts use `viewBox` + `preserveAspectRatio`. |

## Issues (HIGH first)

| Sev | Dim | Location | Issue | Fix |
|-----|-----|----------|-------|-----|
| HIGH | 3 | `app.js:61` | `getElementById("lab-stat-p")` returns `null`; setting `.textContent` throws and aborts the rest of `lab_render`. | Remove the stat-p line (the HTML no longer has that element). |
| HIGH | 9 | `charts.js:233-239,244-245` | `colorMap` keys + default fallbacks are leftover from `r_double_lasso` (`First diff`, `DL (rigorous)`, etc.); MGWR methods `Global OLS` / `MGWR (median)` fall through to white. | Replace `colorMap` and default arrays with MGWR-correct keys (`Global OLS` → `C.muted`, `MGWR (median)` → `C.teal`) and outcomes (`Convergence β`, `Model fit R²`, `AICc (lower=better)`). |
| MED | 9 | `charts.js:481-531` (`alpha_histograms`) | No legend distinguishing teal "Local" bars from orange "Global" bars. Also "true α" label drawn at y=10 inside plot — can overlap with tall bars. | Move "true α" label above the plot (use negative y), add a semi-transparent legend rect with two swatches in the top-right corner clear of bar tops. |
| MED | 9 | `charts.js:414-473` (`alpha_compare`) | "true α" label at `y: -8` can collide with axis ticks/labels if the true-α x-position lands at the right edge. | Shift label to `text-anchor: middle` and clamp x within `[20, w-20]`. |
| LOW | 1 | `charts.js:347` | `selection_bars` is defined and exported but never invoked. | Harmless; can stay. |

## Positive highlights

- Smoke test 8/8 (math, qnorm, λ_max, OLS recovery, performance, schema).
- 8 glossary entries (target ≥ 6).
- Post key numbers (β = −0.195, R² 0.21 → 0.76, AICc 1341 → 838,
  bandwidth = 44, 52 effective parameters) appear in Tab 1 lede AND Tab 4
  takeaways — strong pedagogical alignment.
- Dark palette (`#0f1729` + steel/orange/teal) consistent.

## Priority action items

1. **[HIGH]** Delete the `lab-stat-p` line in `app.js`.
2. **[HIGH]** Retarget `colorMap` + default `outcomes` / `methods` arrays in
   `forest_plot` to MGWR-correct values.
3. **[MED]** Add a legend to `alpha_histograms` and move "true α" above plot.
4. **[MED]** Clamp "true α" label x in `alpha_compare`.
5. **[LOW]** Optional: drop the dead `selection_bars` export.

## Verdict (initial)

**MAJOR REVISION** — two HIGH bugs (one runtime exception that disables
Tab 2's post-OLS stat, one visual bug that makes Tab 4 unreadable) make
this app fail acceptance despite strong fundamentals.

---

## Post-fix re-audit

**Re-audit date:** 2026-05-24
**Verdict (final):** ACCEPT (improved)

### Fixes applied

1. **`app.js`** — removed the stale `lab-stat-p` setter that referenced a
   non-existent DOM element. Tab 2's `lab_render` now completes and the
   "β̂ (refit on support)" stat populates on every slider change.
2. **`charts.js / forest_plot`** — replaced the `r_double_lasso` `colorMap`
   (`First diff`, `DL (CV)`, …) with MGWR-correct keys (`Global OLS` →
   orange, `MGWR (median)` → teal) and retargeted the default `outcomes` /
   `methods` arrays to `Convergence β`, `Model fit R²`, `AICc`. Tooltip
   labels updated: "α̂ =" → "estimate =", "95% CI =" → "local range ="
   for MGWR, "controls used =" → "effective bandwidth =" / "districts (n) =".
3. **`charts.js / alpha_histograms`** — added a translucent dark-blue
   legend rect in the top-right corner explaining teal = Local (MGWR-style)
   and orange = Global (OLS-style). Increased top margin from 18 → 38 px
   and moved the "true β" label above the plot area, centred and x-clamped,
   so it never collides with tall histogram bars. Renamed "true α" → "true β"
   and "Estimated α̂" → "Estimated β̂" to match the post's MGWR terminology.
4. **`charts.js / alpha_compare`** — clamped the "true β" label x-position
   to `[50, w-50]` and used `text-anchor: middle` so the label never spills
   off either edge of the chart. Renamed the y-axis method labels from
   `DL (CV)` / `DL (rigorous)` to `Global (OLS-style)` / `Local (MGWR-style)`.

### Post-fix verification

- **Smoke test:** 8 of 8 pass (qnorm, simulate_lasso shapes, λ_max bound,
  OLS recovery at λ → 0, performance 144 ms, results.json schema).
- **Hugo HTTP probe (port 1399):** `web_app/` 200, `styles.css` 200,
  `app.js` 200, `charts.js` 200, `data/results.json` 200; YAML link
  resolves to `/post/python_mgwr/web_app/index.html` (no trailing-slash
  bug).
- **Tab 1 animation:** legend is positioned in the top-right corner of the
  plot at logical y = 10–60; the L2 curve (`1/(1+λ)`) at that x-range
  evaluates to y ≈ 0.17–0.23 (drawn around plot-y ≈ 195–210), well below
  the legend rect, so no line crosses the legend. Existing semi-transparent
  background already guards against any residual overlap.
- **Tab 2 path chart:** no in-plot legend (uses orange = treatment, teal =
  selected, faint = zeroed, with copy in the surrounding `What to look for`
  panel explaining the colour mapping).
- **Tab 4 forest plot:** with the corrected `colorMap`, Global OLS rows
  draw in orange and MGWR (median) rows in teal; method names live in the
  left margin (no overlap with plot area). Hover tooltips now report
  MGWR-appropriate "effective bandwidth" / "local range" instead of LASSO
  "controls used".

### Final dimension scores

| # | Dimension | Initial | Final |
|---|-----------|---------|-------|
| 1 | File completeness | 9 | 9 |
| 2 | HTML structure | 9 | 9 |
| 3 | JS correctness | 4 | 9 |
| 4 | Data contract | 8 | 9 |
| 5 | Accessibility | 9 | 9 |
| 6 | Performance | 10 | 10 |
| 7 | Pedagogy | 9 | 9 |
| 8 | Hugo integration | 9 | 9 |
| 9 | Visual design | 5 | 9 |
| 10 | Mobile responsiveness | 8 | 8 |
