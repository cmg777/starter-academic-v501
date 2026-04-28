# Introduction to Panel Data Methods

**Status:** Script executed successfully
**Language:** Python
**Last run:** 2026-04-28

## Overview

Introduction to panel data estimation methods using a wage panel dataset (wage_panel_bob4.dta). Progressively implements Pooled OLS, first-differencing, within-estimator FE, dummy variable FE, random effects, and correlated random effects (Mundlak) using pyfixest and linearmodels.

## Pipeline Progress

- [x] Script (`script.py`) -- executed
- [ ] Results report (`results_report.md`) -- pending
- [ ] Blog post (`index.md`) -- pending
- [ ] Infographic (`infographic_instructions.md`) -- pending

## Generated Figures

| # | File | Description |
|---|------|-------------|
| 1 | `panel_intro_variation.png` | Between vs within variance decomposition for lwage, union, age, schooling |
| 2 | `panel_intro_coef_comparison.png` | Union coefficient across 6 panel estimators (POLS, FDFE, TDFE, DVFE, RE, CRE) with 95% CI |
| 3 | `panel_intro_extended_models.png` | Coefficient comparison across extended models (POLS, TWFE, RE, CRE) for union, age, schooling, female |
| 4 | `panel_intro_wage_trajectories.png` | Spaghetti plot of individual wage paths for 30 sampled workers, colored by union status |

## Generated Tables (CSV)

| # | File | Description |
|---|------|-------------|
| 1 | `descriptive_stats.csv` | Overall descriptive statistics for key variables |
| 2 | `variation_decomposition.csv` | Between/within variance shares for each variable |
| 3 | `basic_models_comparison.csv` | Union coefficient, SE, and 95% CI across 6 basic estimators |
| 4 | `extended_models_comparison.csv` | Coefficient comparison table for 4 extended models with controls |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `raw_data.csv` | 11045 | 9 | Full wage panel dataset (2010-2018, all years) |
| `data_panel.csv` | 4398 | 10 | Filtered two-period panel (2010 & 2012), cleaned |

## Packages

- `pyfixest` -- OLS and fixed effects estimation with absorbed FE and clustered SE
- `linearmodels` -- Random effects GLS estimation (panel.RandomEffects)
- `statsmodels` -- Adding constant to exogenous variables (sm.add_constant)
- `pandas` -- Data manipulation, read_stata() for .dta files
- `numpy` -- Numerical operations
- `matplotlib` -- Figure generation with dark theme styling
