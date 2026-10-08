# Dynamic Panel Data Models in Python: Employment Persistence

Tutorial project estimating the persistence of firm-level employment with the
classic Arellano-Bond (1991) panel of 140 UK manufacturing firms (1976-1984).
Covers the full beginner-to-practitioner arc: pooled OLS and fixed effects
(the bias bracket), Anderson-Hsiao IV, Arellano-Bond difference GMM, and
Blundell-Bond system GMM via `pydynpd`, with AR(1)/AR(2) and Hansen
diagnostics plus an instrument-proliferation experiment.

## Pipeline progress

- [x] Script (`script.py` executed cleanly, replication check passed)
- [x] Results report (`results_report.md`)
- [x] Blog post (`index.md`)
- [x] Infographic (`infographic_instructions.md`)
- [x] Web app (`web_app/` — 4-tab interactive Dynamic Panel Explorer)
- [x] Quarto bundle (`python_dynamic_panel.zip`)
- [x] Colab notebook (`notebook.ipynb` — executed with outputs, 46 cells, replication check passed)
- [x] Slides (`slides/` — Quarto reveal.js deck, 25 slides; plus `slides.pdf`)

## Figures

| File | Description |
|------|-------------|
| `python_dynamic_panel_trajectories.png` | Log-employment paths for 40 sample firms with the median path — visualizes firm fixed effects and persistence |
| `python_dynamic_panel_bias_bracket.png` | Pooled OLS (biased up) vs fixed effects (Nickell bias, down) with the credible bracket for rho |
| `python_dynamic_panel_instrument_proliferation.png` | Instrument count vs Hansen p-value across lag windows, full vs collapsed instrument matrix |
| `python_dynamic_panel_estimates_forest.png` | Forest plot of rho-hat across all seven estimators with the OLS-FE bracket band |

## CSV tables

| File | Description |
|------|-------------|
| `abdata.csv` | Source data: Arellano-Bond (1991) panel, 1,031 rows x 10 cols (id, year, emp, wage, cap, indoutpt, n, w, k, ys) |
| `data_prepared.csv` | Panel with firm-level lags and first differences used by all estimators (1,031 rows) |
| `ols_results.csv` | Pooled OLS coefficient table (year dummies, SEs clustered by firm) |
| `fe_results.csv` | Fixed-effects (within) coefficient table |
| `anderson_hsiao_results.csv` | Anderson-Hsiao first-difference 2SLS coefficient table |
| `diff_gmm_results.csv` | Two-step Arellano-Bond difference GMM regression table (pydynpd) |
| `sys_gmm_results.csv` | Two-step collapsed Blundell-Bond system GMM regression table (pydynpd) |
| `proliferation_grid.csv` | System GMM across lag windows {2:3, 2:5, 2:99} x {full, collapsed}: instruments, rho, Hansen p |
| `ab_replication_results.csv` | Replication of the pydynpd vignette example (exact match: L1.n = 0.2710675) |
| `estimates_summary.csv` | Headline rho estimates, SEs, CIs, and diagnostics for all seven estimators |

## Packages

Python 3.11: `pydynpd` 0.2.2 (GMM estimation), `pyfixest` 0.50.1 (OLS/FE/IV
benchmarks), `pandas`, `numpy`, `matplotlib`. The script carries a small
NumPy 2.x compatibility shim for pydynpd 0.2.2 (see `script.py` section 0a).

## Headline results

| Estimator | rho (L1.n) | SE | Notes |
|-----------|-----------|----|-------|
| Pooled OLS | 0.962 | 0.008 | Upper bound (biased up) |
| Fixed effects | 0.626 | 0.052 | Lower bound (Nickell bias) |
| Anderson-Hsiao IV | 1.233 | 0.478 | Consistent but imprecise |
| Diff GMM (two-step) | 0.679 | 0.089 | Hugs FE bound — weak instruments |
| Sys GMM (two-step, collapsed) | 0.927 | 0.079 | Inside bracket; Hansen p=0.46, AR(2) p=0.99 |
