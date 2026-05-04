# MGWRFER: Multiscale Geographically Weighted Fixed Effects Regression

**Status:** Script executed successfully
**Language:** Python
**Last run:** 2026-05-04

## Overview

Demonstrates the MGWRFER method using simulated panel data (225 units x 3 periods)
with known spatially varying coefficients and a time-invariant spatial confounder.
Compares naive pooled MGWR (biased) with MGWRFER (bias-corrected).

## Pipeline Progress

- [x] Script — executed
- [x] Results report — completed
- [x] Blog post — completed
- [x] Infographic — completed

## Generated Figures

| # | File | Description |
|---|------|-------------|
| 1 | mgwrfer_true_coefficients.png | True DGP coefficient surfaces (2x2 grid) |
| 2 | mgwrfer_bias_pooled.png | True vs Pooled MGWR scatter (showing bias) |
| 3 | mgwrfer_recovery_fe.png | True vs MGWRFER scatter (showing correction) |
| 4 | mgwrfer_coefficient_maps.png | True vs MGWRFER coefficient maps (2x3) |
| 5 | mgwrfer_significance_maps.png | Statistical significance maps |
| 6 | mgwrfer_bandwidth_comparison.png | Bandwidth comparison bar chart |

## Generated Tables (CSV)

| # | File | Description |
|---|------|-------------|
| 1 | simulated_panel_data.csv | Raw panel data (675 obs) |
| 2 | true_coefficients.csv | True coefficients (225 units) |
| 3 | pooled_mgwr_params.csv | Pooled MGWR estimates |
| 4 | mgwrfer_params.csv | MGWRFER estimates |
| 5 | model_comparison.csv | Summary comparison metrics |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| simulated_panel_data.csv | 675 | 14 | Simulated panel with true coefficients |
| true_coefficients.csv | 225 | 8 | True coefficient values per spatial unit |

## Packages

- `numpy` — numerical computation, DGP simulation
- `pandas` — data management, CSV I/O
- `matplotlib` — visualization (dark theme)
- `scipy` — statistical computations
- `mgwr` (custom) — MGWR/MGWRFER estimation (from GeoZhipengLi/MGWPR)

## References

- Li et al. (2024). MGWRFER: Multiscale Geographically Weighted Fixed Effects Regression.
- Fotheringham et al. (2017). Multiscale Geographically Weighted Regression.
- Oshan et al. (2019). mgwr: A Python Implementation of MGWR.
