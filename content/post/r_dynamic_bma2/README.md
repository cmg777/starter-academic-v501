# Dynamic Panel BMA: Which Factors Truly Drive Economic Growth?

**Status:** Script reviewed (ACCEPT)
**Language:** R
**Last run:** 2026-04-01

## Overview

Bayesian Model Averaging for dynamic panel data with weakly exogenous regressors using the `bdsm` R package. Analyzes which of 9 candidate growth determinants truly drive economic growth across 73 countries over 4 decades (1970--2000), accounting for reverse causality through lagged dependent variables and fixed effects. Improvement over v1: data preparation demeaning by both year AND entity (country).

## Pipeline Progress

- [x] Script (`analysis.R`) -- executed and reviewed (ACCEPT)
- [ ] Results report (`results_report.md`) -- pending
- [ ] Blog post (`index.md`) -- pending
- [ ] Infographic (`infographic_instructions.md`) -- pending

## Generated Figures

| # | File | Description |
|---|------|-------------|
| 1 | `r_bdsm_model_pmp.png` | Prior vs posterior model probabilities (bdsm built-in) |
| 2 | `r_bdsm_model_sizes.png` | Model size distribution (bdsm built-in) |
| 3 | `r_bdsm_coef_hist_pop.png` | Population coefficient histogram (bdsm built-in) |
| 4 | `r_bdsm_sizes_dilution.png` | Model sizes under dilution prior (bdsm built-in) |
| 5 | `r_dynamic_bma2_pip.png` | PIP bar chart -- custom ggplot2 dark theme |
| 6 | `r_dynamic_bma2_coef.png` | Coefficient estimates with 95% CIs -- custom ggplot2 dark theme |
| 7 | `r_dynamic_bma2_sensitivity.png` | Prior sensitivity dumbbell chart -- custom ggplot2 dark theme |

## Generated Tables (CSV)

| # | File | Description |
|---|------|-------------|
| 1 | `economic_growth.csv` | Raw source dataset from bdsm package |
| 2 | `original_economic_growth.csv` | Source dataset with lagged GDP column |
| 3 | `data_prepared.csv` | Final processed dataset (standardized + demeaned by year + entity) |
| 4 | `fe_regression.csv` | Kitchen-sink fixed effects regression coefficients |
| 5 | `bma_binomial.csv` | BMA results with binomial prior (EMS = 4.5) |
| 6 | `bma_binomial_beta.csv` | BMA results with binomial-beta prior |
| 7 | `best_models_inclusion.csv` | Top 8 models inclusion matrix |
| 8 | `best_models_estimates.csv` | Top 8 models coefficient estimates |
| 9 | `prior_sensitivity.csv` | PIPs across all prior specifications |
| 10 | `jointness_hcghm.csv` | HCGHM jointness matrix |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `economic_growth.csv` | 365 | 12 | Raw panel data (73 countries, 5 periods, 9 regressors) |
| `original_economic_growth.csv` | 292 | 13 | Panel data with lagged GDP (excludes initial period) |
| `data_prepared.csv` | 365 | 12 | Standardized + demeaned by year + demeaned by entity |

## Pipeline Documents

| File | Description |
|------|-------------|
| `plan.md` | Approved scope and design decisions |
| `script-review.md` | Code review report (verdict: ACCEPT) |
| `README.md` | This file -- artifact inventory and status |

## Packages

- `bdsm` -- Bayesian Dynamic Systems Modeling
- `tidyverse` -- data manipulation and visualization
- `parallel` -- parallel computing for model space estimation
- `scales` -- number formatting for ggplot axes
