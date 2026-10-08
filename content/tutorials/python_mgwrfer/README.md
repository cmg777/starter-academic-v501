# MGWFER: Multiscale Geographically Weighted Fixed Effects Regression

**Status:** Script executed successfully
**Language:** Python
**Method:** MGWFER (Li & Fotheringham 2026)

## Overview

Faithful Python replication of Li & Fotheringham (2026), *Spatial Context
as a Time-Invariant Confounder: A Fixed-Effects Extension of MGWR*. Uses
the paper's DGP (covariates coupled to spatial context, paper Eqs. 39-45)
at a 15x15 grid scale (225 units x 3 periods).

Replicates:

- **Paper Table 2** — global model comparison: OLS_cs, pooled OLS, FE.
- **Paper Table 3** — local model comparison: MGWR_cs, PMGWR, MGWFER.
- **Paper Figure 5** — spatial-context surface recovered by each local model.
- **Paper Figure 9** — `beta_4` spurious-coefficient bias pattern.
- **Paper Algorithm 1** — MGWFER's two-stage estimator:
  - **Stage 1**: within-transform + standardise + MGWR + back-transform.
  - **Stage 2**: recover individual fixed effects alpha_i (Eq. 30) with
    per-unit t-tests (Eqs. 32-37).

Filenames retain the historical `mgwrfer_` prefix for URL/asset stability
with the existing post slug.

## Pipeline Progress

- [x] Script — executed (paper-faithful DGP, six estimators)
- [x] Results report — present
- [x] Blog post — index.md
- [ ] Infographic — pending

## Generated Figures

| # | File | Description |
|---|------|-------------|
| 1 | mgwrfer_true_coefficients.png | True DGP coefficient surfaces (2x2 grid) |
| 2 | mgwrfer_bias_pooled.png | True vs PMGWR scatter (showing bias) |
| 3 | mgwrfer_recovery_fe.png | True vs MGWFER scatter (showing correction) |
| 4 | mgwrfer_coefficient_maps.png | True vs MGWFER coefficient maps (2x3) |
| 5 | mgwrfer_significance_maps.png | Statistical significance maps |
| 6 | mgwrfer_bandwidth_comparison.png | Bandwidth bar chart (3 models) |
| 7 | mgwrfer_alpha_map.png | Paper Fig. 5: true sc vs MGWFER, MGWR_cs, PMGWR |
| 8 | mgwrfer_beta4_bias.png | Paper Fig. 9: spurious beta_4 surfaces |

## Generated Tables (CSV)

| # | File | Description |
|---|------|-------------|
| 1 | simulated_panel_data.csv | Raw panel data (675 obs) |
| 2 | true_coefficients.csv | True coefficients (225 units) |
| 3 | global_models_comparison.csv | Paper Table 2: OLS_cs, OLS_pool, FE |
| 4 | mgwr_cs_params.csv | Cross-sectional MGWR estimates |
| 5 | pooled_mgwr_params.csv | PMGWR estimates |
| 6 | mgwrfer_params.csv | MGWFER slope estimates (Stage 1) |
| 7 | mgwrfer_alpha_recovery.csv | MGWFER alpha_hat + t-tests (Stage 2) |
| 8 | model_comparison.csv | Local model headline metrics (3 models) |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| simulated_panel_data.csv | 675 | 14 | Simulated panel with true coefficients |
| true_coefficients.csv | 225 | 8 | True coefficient values per spatial unit |
| mgwrfer_alpha_recovery.csv | 225 | 9 | alpha_hat per unit with SE/t/p/sig flag |

## Packages

- `numpy` — numerical computation, DGP simulation
- `pandas` — data management, CSV I/O
- `matplotlib` — visualization (dark theme)
- `scipy` — statistical computations (t-tests for Stage 2)
- `statsmodels` — OLS / pooled OLS / FE (within-transform) baselines
- `mgwr` (custom) — MGWR/MGWFER estimation (from GeoZhipengLi/MGWPR)

## References

- Li, Z. & Fotheringham, A. S. (2026). Spatial Context as a Time-Invariant
  Confounder: A Fixed-Effects Extension of MGWR. *Annals of the AAG*.
  DOI: 10.1080/24694452.2026.2654481
- Fotheringham et al. (2017). Multiscale Geographically Weighted Regression.
- Oshan et al. (2019). mgwr: A Python Implementation of MGWR.
- Wooldridge (2010). *Econometric Analysis of Cross Section and Panel Data*, MIT Press.
