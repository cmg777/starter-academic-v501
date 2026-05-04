# Script Review: python_mgwrfer

**Script:** `script.py` (850 lines)
**Language:** Python
**Executed:** 2026-05-04
**Status:** All code runs

## Verdict: MINOR REVISION

The script runs cleanly, produces all 6 figures and 5 CSVs, and demonstrates the MGWRFER method convincingly. The core two-stage estimation (within-transformation + MGWR) is correctly implemented. However, the interpretation section overstates the results (ignoring that beta_2 and beta_3 RMSE are *worse* with MGWRFER), the README template has stale hardcoded numbers from the original 30x30 grid, and the significance maps are uninformative (all units significant for all coefficients).

## Execution Results

- Exit code: 0
- Execution time: ~10 minutes (bandwidth selection dominates)
- Figures generated: 6 PNG files (all at DPI=300)
- Warnings: Suppressed globally via `warnings.filterwarnings("ignore")`

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Statistical | MEDIUM | lines 776-780 | Interpretation claims unqualified success ("MGWRFER successfully removes bias") but beta_2 RMSE is 18.2% *worse* (0.089 -> 0.105) and beta_3 is 25.2% *worse* (0.058 -> 0.072). Only beta_1 and beta_4 improve. | Rewrite interpretation to acknowledge the bias-variance tradeoff: within-transformation reduces bias but also reduces effective sample size, increasing variance. MGWRFER wins where bias was large (beta_1, beta_4) but loses where pooled MGWR was already unbiased (beta_2, beta_3). |
| 2 | Data handling | MEDIUM | lines 818-819 | README template has hardcoded "2700 obs" and "900 units" — stale from when N_GRID was 30. Actual values are 675 obs and 225 units. The Datasets table (lines 827-828) correctly uses f-strings. | Replace hardcoded strings with `{N_OBS}` and `{N_UNITS}` in the Generated Tables section. |
| 3 | Figures | MEDIUM | lines 649-709 + figure | Significance maps are uninformative — all 225 units show "Positive (n=225)" for all 3 coefficients, producing three identical solid-orange panels. No spatial variation visible. | Include beta_4 (the null effect) in the significance analysis — it should show non-significant regions. Alternatively, show the continuous t-value surface instead of a 3-category classification. |
| 4 | Structure | MEDIUM | line 121 | Comment says "Create 30x30 spatial grid" but grid is actually 15x15. | Change comment to "Create 15x15 spatial grid" or make it dynamic: f"Create {N_GRID}x{N_GRID} spatial grid". |
| 5 | Statistical | LOW | lines 547-548, 773 | R-squared comparison (0.977 pooled vs 0.890 MGWRFER) is not apples-to-apples. Pooled R^2 includes alpha_i variance in Y; MGWRFER R^2 uses demeaned Y. Comparing them directly is misleading. | Add a comment or print statement noting that R^2 values are not directly comparable because the dependent variables differ. |
| 6 | Code quality | LOW | line 33 | `warnings.filterwarnings("ignore")` blanket suppression could mask convergence or deprecation warnings. | Narrow the filter: `warnings.filterwarnings("ignore", category=FutureWarning)` or suppress only during MGWR fitting. |
| 7 | Reproducibility | LOW | lines 256, 494, 532, 623, 702, 756 | `plt.show()` calls may block execution in non-interactive environments (e.g., CI/CD, remote servers). | Move all `plt.show()` calls behind a `if os.environ.get("DISPLAY"):` guard, or remove them entirely since figures are already saved. |

## Positive Highlights

- **Clean two-stage implementation:** Within-transformation (Section 5) correctly demeanes by unit, verifies with max unit mean check (7.11e-15), and passes `constant=False` to MGWR — exactly right since demeaning removes the intercept.
- **Excellent causal framing:** Estimand blocks at lines 261-264 and 351-355 clearly state the identification strategy, the assumption being violated (pooled), and the assumption being leveraged (MGWRFER).
- **Dark theme execution is flawless:** All 6 figures use the site dark palette consistently. Colorbars, legends, tick labels, and text all render correctly on the dark navy background.
- **Back-transformation is correct:** Standardize-before-MGWR, then back-transform via `beta_orig = beta_std * (y_std / x_std)` — properly handles the two different standardizations (pooled vs within).
- **DGP design is pedagogically strong:** Four coefficient types (quadratic, linear, constant, null) plus a spatial confounder clearly demonstrate when MGWRFER helps and when it doesn't.
- **Bandwidth comparison figure** effectively communicates the key finding: MGWRFER uses smaller, more localized bandwidths.

## Priority Action Items

1. **[MED]** Rewrite the interpretation (lines 776-780) to acknowledge that MGWRFER improves beta_1 and beta_4 but slightly worsens beta_2 and beta_3 — frame as bias-variance tradeoff inherent in within-transformation.
2. **[MED]** Fix README template: replace hardcoded "2700 obs" and "900 units" with `{N_OBS}` and `{N_UNITS}` (lines 818-819).
3. **[MED]** Improve significance maps: add beta_4 (null effect) panel to show where the method correctly detects non-significance, or switch to continuous t-value heatmaps.
4. **[MED]** Fix stale comment "Create 30x30 spatial grid" at line 121.
5. **[LOW]** Add note that R-squared values are not directly comparable between pooled and MGWRFER models.
