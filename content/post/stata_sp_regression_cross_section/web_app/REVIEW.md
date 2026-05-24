# Review: stata_sp_regression_cross_section Web App

**Audited:** content/post/stata_sp_regression_cross_section/web_app/
**Date:** 2026-05-24
**Audit version:** review-app v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** After the Tab-1 fix the app is coherent end to end:
the intro chart now sweeps ρ ∈ [0, 0.9] and plots the SAR multiplier
`1/(1−ρ)` (orange) against the residual `1−ρ` (steel dashed), with axes,
legend, and surrounding card text all telling the same spatial-regression
story. Tabs 2–4 were already strong: the spillover lattice, DGP simulator,
and 8-model forest plot have clean labels with no legend/annotation
overlap. Smoke test 8/8; no console errors desktop or mobile.

---

## Dimension scores

| # | Dimension              | Score / 10 | Issues  | Notes                                                    |
|---|------------------------|-----------:|--------:|----------------------------------------------------------|
| 1 | File completeness      | 10         | 0       | All 7 expected files present; bundle ~105 KB             |
| 2 | HTML structure         | 9          | 0       | 4 tabs, correct ids, role=tab, sliders have aria-labels  |
| 3 | JS correctness         | 10         | 0       | Smoke test 8/8 passed; no console errors                 |
| 4 | Data contract          | 10         | 0       | results.json parses; 48 estimate rows; matches §9.2      |
| 5 | Accessibility          | 9          | 0       | Every range has aria-label; tabs use role+aria-selected  |
| 6 | Performance            | 10         | 0       | LASSO smoke 102 ms; tab interactions snappy              |
| 7 | Pedagogy               | 9          | 0       | Coverage 3/3; Tab-1 widget now matches surrounding text  |
| 8 | Hugo integration       | 10         | 0       | YAML link `web_app/index.html` correct; all assets 200   |
| 9 | Visual design          | 9          | 0       | On-palette; legend bottom-right with translucent backing |
|10 | Mobile responsiveness  | 9          | 0       | 375 px: tabs scrollable, sliders reachable, charts scale |

---

## Issues found

| #  | Dim | Severity | Location                                    | Issue                                                                                                                                                              | Suggested fix                                                                                                                                                       |
|---:|----:|----------|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1  | 3   | LOW      | charts.js:236-242                            | Unused `forest_plot()` colorMap still keys on stale methods (`First diff`, `OLS (full)`, `PSL`, `DL (rigorous)`, `DL (CV)`); the live forest plot lives in `app.js:531-540` and is correct. | Either delete the unused `forest_plot()` / `selection_bars()` / `alpha_compare()` / `alpha_histograms()` helpers or update their color keys to match the 8 spatial models. No runtime impact today. |

---

## Pedagogical alignment (Dim 7 deep-dive)

**Post takeaways extracted (from §11 summary):**
1. Spatial autocorrelation is significant (Moran's I = 0.222, p = 0.005);
   LM tests favor the spatial-error specification.
2. SDM and SDEM are the preferred models; both find a significant negative
   indirect effect of neighbours' income.
3. Total income effect in SDM/SDEM (−2.3 to −2.5) is 40–55% larger than
   OLS (−1.60) — the headline understatement finding.

**App messaging extracted:**
- Tab 1 lede: "A neighborhood's crime rate depends not only on its own income and housing values but also on conditions in adjacent neighborhoods…"
- Tab 2 heading: "Spillover Animation — watch the multiplier propagate"
- Tab 3 heading: "SAR / SEM / SDM Simulator — generate data, estimate it back"
- Tab 4 heading: "The post's headline numbers — interactively"

**Coverage:**
- Takeaway 1: ✓ covered in Tab 1 lede ("Moran's I = 0.222 (p = 0.005)") and 2nd `<p class="lede">` ("compare direct/indirect/total effects across the full eight-model taxonomy")
- Takeaway 2: ✓ covered in Tab 4 card "Why does SAR force a constant indirect/direct ratio?"
- Takeaway 3: ✓ covered in Tab 4 pedagogy bullet ("40–55% understatement")

**Coverage score:** 3/3

**Glossary check:**
- Post lists 8 key concepts (W, autocorrelation, ρ, θ, λ, taxonomy, direct/indirect, multiplier).
- App glossary covers all 8 plus SAR-vs-SEM and SDM-vs-SDEM cards.

---

## Widget catalog audit

| Tab | Widget archetype          | Status   | Notes                                                                                  |
|-----|---------------------------|----------|----------------------------------------------------------------------------------------|
| 1   | concept-animation         | READY    | ρ-multiplier animation (orange: 1/(1−ρ); steel: 1−ρ); axes/legend/text aligned         |
| 2   | spatial-multiplier-grid   | READY    | 7×7 rook lattice; rho slider; click-to-shock; stat row updates correctly               |
| 3   | dgp-simulator             | READY    | Simulates y from (ρ, λ, θ, σ); recovers ρ̂, λ̂; Moran scatter rendered                  |
| 4   | forest-plot               | READY    | Real-data forest from results.json; 8 models × 3 effects × 2 regressors; labels clean  |

---

## Positive highlights

- Tab 4 forest plot is exemplary: each estimate label sits directly above
  its point with no overlap on either the INC or HOVAL view; the 3-facet
  side-by-side layout makes the "SAR vs SLX/SDM/SDEM" story self-evident
  (`app.js:577-603`).
- Tab 2 lattice grid uses high-contrast cell text (dark text on bright
  cells, light text on dark cells via `response[i] > maxVal * 0.5`
  threshold, `app.js:182`) — readable across the entire dynamic range.
- Tab 3 DGP simulator includes a "Reset to Columbus defaults" button that
  restores ρ = 0.40, λ = 0.00, θ = −1.20, σ = 5.00 (`app.js:479-490`) —
  excellent UX for letting students explore freely without getting lost.
- Glossary in Tab 1 covers all 8 post concepts plus two model-comparison
  cards, all behind `<details>` elements (no scroll bloat).
- New Tab-1 chart uses a bottom-right legend with a translucent backing,
  cleanly avoiding overlap with the diverging amplification curve in the
  upper right.

---

## Priority action items

1. **[LOW]** Optional cleanup: prune the unused `forest_plot()`,
   `selection_bars()`, `alpha_compare()`, and `alpha_histograms()` helpers
   in `charts.js` (left over from `r_double_lasso`). They are not called
   by `app.js` but inflate the bundle and could confuse future readers.

---

## How to re-review

After applying the fixes, re-run:

    /project:review-app stata_sp_regression_cross_section

To focus on the dimension you just fixed:

    /project:review-app stata_sp_regression_cross_section focus: pedagogy

---

## Audit metadata

- Hugo port used: 1330
- Node version: v25.9.0
- Playwright: enabled (Chromium headless)
- Tooling notes: smoke-test.js executed under Node vm; Chromium reused.

---

*Generated by `/project:review-app`. Skill at
`.claude/skills/review-app/`. Verification rubric at
`references/scoring-and-criteria.md`.*
