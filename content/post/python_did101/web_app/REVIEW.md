# Review: python_did101 Web App

**Audited:** content/post/python_did101/web_app/
**Date:** 2026-05-24
**Audit version:** review-app v1.0 (manual run, re-reviewed after fixes)
**Focus:** all 10 dimensions
**Browser pass:** enabled (Playwright Chromium 1.60)

---

## Verdict: ACCEPT

**Overall assessment.** Smoke test 8/8, HTTP 200 on every asset, no console errors, post takeaways covered in Tab 1 lede + tab headings. After the legend/annotation overlap fixes (Tab 2 histogram legend moved outside the plot area, Tab 4 "treatment" annotation moved below the x-axis, Tab 1 legend background made opaque), no chart text overlaps any data mark.

---

## Dimension scores

| # | Dimension              | Score / 10 | Issues  | Notes                                                    |
|---|------------------------|-----------:|--------:|----------------------------------------------------------|
| 1 | File completeness      | 10         | 0       | All 7 expected files present                             |
| 2 | HTML structure         | 10         | 0       | 4 tabs, proper roles, D3 loads before app.js             |
| 3 | JS correctness         | 10         | 0       | Smoke test 8/8 passed; 105 ms lasso_path                 |
| 4 | Data contract          | 10         | 0       | results.json parses; 15 rows, expected schema            |
| 5 | Accessibility          | 10         | 0       | All sliders + cta-cards have ARIA / keyboard handlers    |
| 6 | Performance            | 10         | 0       | Smoke test 105 ms (well under 300 ms)                    |
| 7 | Pedagogy               | 9          | 0       | Takeaway alignment 3/3; glossary 8 entries               |
| 8 | Hugo integration       | 10         | 0       | YAML link `url: web_app/index.html` correct              |
| 9 | Visual design          | 9          | 0       | All legends/annotations clear of data marks              |
|10 | Mobile responsiveness  | 9          | 0       | viewBox responsive; legends out of plot area             |

---

## Issues found (post-fix)

No HIGH or MED issues remain.

| #  | Dim | Severity | Location                       | Issue                                                  | Status |
|---:|----:|----------|--------------------------------|--------------------------------------------------------|--------|
| 1  | 9   | RESOLVED | app.js did_histograms_chart    | Legend moved outside the plot area (right margin)      | Fixed  |
| 2  | 9   | RESOLVED | app.js event_study_chart        | "treatment" annotation moved below x-axis              | Fixed  |
| 3  | 9   | RESOLVED | charts.js l1_vs_l2_animation    | Legend background made fully opaque (0.95 alpha)       | Fixed  |
| 4  | 5   | RESOLVED | index.html cta-cards            | Added `role="button"`, `tabindex="0"`, keyboard handler | Fixed  |

---

## Positive highlights

- Smoke test: 8/8 checks pass in 105 ms.
- Glossary has 8 entries (DiD, parallel trends, ATT, counterfactual, TWFE, naive before-after, event study, SUTVA).
- Pedagogy is excellent: Tab 1 lede opens with the 36.20 → 25.32 ATT story; every tab has a "What to look for" panel; tab headings re-state post takeaways verbatim.
- Tab 2 simulator is correctly wired: naive vs DiD vs true-ATT with CI bars + Monte Carlo replication button.
- Tab 4 event study correctly inserts the omitted t=−1 reference at zero.
- No chart text overlaps a data mark (lines, bars, points, areas).

---

## How to re-review

```
/project:review-app python_did101
```

---

## Addendum — 2026-10-02 content audit

A pre-teaching audit of the whole `python_did101` folder changed the app. Smoke-checked afterwards in headless Chromium (Playwright): no console or page errors, every tab renders, and no request for `lasso.js`.

- **Tab 1 animation replaced.** It was still the Double-LASSO "L1 vs L2 shrinkage" chart (penalty-strength axis, LASSO/Ridge legend). The new `parallel_trends_animation` (`charts.js`) draws the comparison, treated and counterfactual lines from the post's means and sweeps the treated post-period point from the counterfactual (71.05) to the observed mean (96.37), labelling the gap; it is static under `prefers-reduced-motion`.
- **Dead code removed:** `lasso.js` (deleted), `simulate_lasso` / `simulate_dl` and their helpers in `dgp.js`, and the unused `coefficient_path`, `selection_bars`, `alpha_compare`, `alpha_histograms` builders in `charts.js`. The forest-plot tooltip label "α̂" became "Estimate".
- **`data/results.json` regenerated** from pyfixest 0.50.1 at full precision. The naive before-after row previously carried a non-reproducible SE of 4.27 (CI 27.83–44.57); the regression SE is 0.525 (CI 35.10–37.30), and Tab 3 now points out that the naive estimate is precise but biased. The TWFE SE-type CIs now use PyFixest's t-based intervals. The t = 1 label now reads 24.71 (was 24.70 from 3-decimal storage).
- Event-study value labels sit clear of the CI caps; pre-trend wording says "consistent with parallel trends" rather than "validate"; CRV3 is described as a jackknife, not Bell-McCaffrey.
- Asset URLs carry `?v=20261002` cache-busting query strings.
