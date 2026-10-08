# Script Review: python_mgwrfer

**Script:** `script.py` (1,346 lines)
**Language:** Python
**Executed:** 2026-05-11 (paper-faithful DGP run, ~15 min)
**Status:** All code runs, exit code 0, all 8 figures and 8 CSVs produced

## Verdict: MINOR REVISION

The script is a faithful Python translation of Li & Fotheringham (2026): the DGP matches Eqs. 39-45, six estimators are fitted (cross-sectional OLS, pooled OLS, individual FE, MGWR_cs, PMGWR, MGWFER), and Figures 5 and 9 are replicated. One MEDIUM consistency issue and four LOW polish items are flagged below.

## Execution Results

- Exit code: 0
- Execution time: ~15 minutes (three MGWR-style bandwidth searches dominate)
- Figures generated: 8 PNG files
- CSVs generated: 8 (simulated_panel_data, true_coefficients, global_models_comparison, mgwr_cs_params, pooled_mgwr_params, mgwrfer_params, mgwrfer_alpha_recovery, model_comparison)
- Warnings: none (FutureWarnings and RuntimeWarnings are silenced via `warnings.filterwarnings`, intentional)

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Statistical correctness | MEDIUM | lines 440-444 (PMGWR), 519-526 (MGWR_cs) | Intercept back-transform inconsistency: MGWR_cs adds the location shift `+ y_mean - x_mean @ beta` so its intercept is on the original outcome scale; PMGWR omits this shift and reports `sigma_y * intercept_std` (zero-centered). Consequence: PMGWR's reported `alpha_pmgwr` range [-11, 10] and RMSE_alpha 25.62 are not directly comparable to MGWR_cs's [2, 22] / RMSE 14.18. Most of PMGWR's RMSE is the constant ~23 mean shift, not estimation error. | Document explicitly that MGWR_cs and PMGWR intercepts are reported on different scales (a comment in the script and one clarifying sentence in the post would suffice). Alternatively, harmonize the back-transform — but that requires a 15-min rerun. |
| 2 | Code quality | LOW | lines 622-627 | Redundant `y_pred_std` then `resid_std` calculation. `resid_std` ends up equal to `fe_model.resid_response.ravel()`, so the intermediate computation is unnecessary. The fallback branch (when `resid_response` is unavailable) does work but obscures intent. | Replace with `resid_std = fe_model.resid_response.ravel()` (no fallback needed — `mgwr.MGWR` always exposes `resid_response`). |
| 3 | Reproducibility | LOW | lines 38-46 | DGP parameters `SIGMA_X = 0.5` and `SC_COUPLING = 0.05` are defined inline in the DGP section (lines ~190). To make the data-generating contract easier to find and audit, promote them to the Configuration block near the top alongside `N_GRID` and `N_TIME`. | Move `SIGMA_X` and `SC_COUPLING` to the Configuration block (top of file). Reference Eqs. 40-43 in the comment. |
| 4 | Code quality | LOW | lines 1100-1106 | Fallback in the t-values block uses `np.diag(fe_model.CCT)` but `CCT` has shape `(N_OBS, K)`, not square — `np.diag` would interpret it as building a diagonal matrix from a 1D array, not extracting diagonal. The primary path (`filter_tvals()`) is used, so this code never executes, but it is misleading. | Either drop the fallback (it's defensive code for an unreachable path) or fix to per-observation standard errors. |
| 5 | Structure | LOW | section header at line 256 | The new `import statsmodels.api as sm` statement sits in the middle of the script (inside the Global Models section) rather than with the other imports at the top. Mild style violation; works but breaks "imports at the top". | Move `import statsmodels.api as sm` to the top-of-file imports block, alongside numpy/pandas. |

## Positive Highlights

- **Paper fidelity**: the DGP now matches paper Eqs. 39-45 verbatim — sc coupling at 0.05, sigma_x = 0.5, sigma_eps = 0.5, β_4·x_4 correctly dropped from `y`. The sanity check prints (`Cor(x_k, sc) ≈ 0.84`, `Cor(x_4, y) = 0.84`) make the indirect channel visible.
- **Two-stage MGWFER fully implemented**: Stage 1 produces the slopes, Stage 2 recovers α_i with paper Eqs. 30 and 32-37 (variance rescaling, t-test, df = NT − K − N).
- **Six-estimator lineup**: cross-sectional OLS, pooled OLS, FE (via manual within-demeaning, no new dependency), MGWR_cs, PMGWR, MGWFER. Mirrors the paper's Tables 2 and 3.
- **Figure 5 replication** (`mgwrfer_alpha_map.png`, 2×2 panel) and **Figure 9 replication** (`mgwrfer_beta4_bias.png`, 1×3 panel) directly reproduce the paper's headline visuals.
- **Dark theme styling** consistently applied: dark navy `#0f1729` background, grid color `#1f2b5e`, dpi=300, `pad_inches=0`. Site palette (steel blue, warm orange, teal) used purposefully across model comparisons.
- **Reproducibility**: `RANDOM_SEED = 42` set at top and used via `np.random.default_rng(RANDOM_SEED)` consistently. Local mgwr fork cloned once and cached at `mgwpr_repo/`.
- **Outputs are well-documented**: end-of-file README is regenerated each run with full figure and CSV inventory.

## Priority Action Items

1. **[MED] Document the PMGWR vs MGWR_cs intercept back-transform inconsistency** in the script (one-line comment near line 441) and ensure the post explains how to read PMGWR's negative-shifted alpha range.
2. **[LOW] Move `import statsmodels.api as sm` to the top of file** with the other imports (1-line move).
3. **[LOW] Simplify the redundant `y_pred_std` / `resid_std` calculation** to `resid_std = fe_model.resid_response.ravel()`.
4. **[LOW] Promote `SIGMA_X` and `SC_COUPLING` to the Configuration block** at the top of the script.
5. **[LOW] Drop the unreachable t-values fallback** at lines ~1102.

## Notes on rerun

These revisions are all documentation/structural cleanups; **none of them change any numerical output**. The script does not need to be rerun. Numbers in `index.md`, `results_report.md`, and the figures remain valid.
