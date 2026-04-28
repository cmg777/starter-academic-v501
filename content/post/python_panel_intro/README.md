# Introduction to Panel Data Methods

**Status:** Script executed successfully
**Language:** Python
**Last run:** 2026-04-28

## Overview

Beginner-friendly tour of the standard panel data estimators on a two-period wage panel (wage_panel_bob4.dta, 2010 & 2012, N = 2,199 workers). Each method gets its own short, commented section: Pooled OLS, Between, First-Differences, Within (FE), Two-Way FE, Random Effects, Hausman test, and Correlated Random Effects (Mundlak). Uses pyfixest, linearmodels, and scipy.

## Pipeline Progress

- [x] Script (`script.py`) -- executed
- [ ] Results report (`results_report.md`) -- pending
- [ ] Blog post (`index.md`) -- pending
- [ ] Infographic (`infographic_instructions.md`) -- pending

## Generated Figures

| # | File | Description |
|---|------|-------------|
| 1 | `panel_intro_variation.png` | Between vs within variance decomposition for lwage, union, age, schooling |
| 2 | `panel_intro_trajectories.png` | Spaghetti plot of individual wage paths for 30 sampled workers, colored by union status — placed early as motivation |
| 3 | `panel_intro_demeaning.png` | Two-panel scatter: raw data (POLS slope) vs demeaned data (FE slope) — visualizes the within transformation |
| 4 | `panel_intro_coef_comparison.png` | Union coefficient across 6 estimators (POLS, Between, FDFE, FE, RE, CRE) with 95% CI; Hausman χ² in caption |
| 5 | `panel_intro_extended_models.png` | Coefficient comparison across extended models (POLS, TWFE, RE, CRE) for union, age, schooling, female |

## Generated Tables (CSV)

| # | File | Description |
|---|------|-------------|
| 1 | `descriptive_stats.csv` | Overall descriptive statistics for key variables |
| 2 | `variation_decomposition.csv` | Between/within variance shares for each variable |
| 3 | `basic_models_comparison.csv` | Union coefficient, SE, and 95% CI across 6 basic estimators (POLS, Between, FDFE, FE, RE, CRE) |
| 4 | `extended_models_comparison.csv` | Coefficient comparison table for 4 extended models with controls (POLS, TWFE, RE, CRE) |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `raw_data.csv` | 11045 | 9 | Full wage panel dataset (2010-2018, all years) |
| `data_panel.csv` | 4398 | 10 | Filtered two-period panel (2010 & 2012), cleaned |

## Methods covered

POLS, Between, First-Differences (FDFE), Within / Fixed Effects (FE), Dummy-Variable FE (one-line aside), Two-Way Fixed Effects (TWFE), Random Effects (RE), Hausman test, Correlated Random Effects / Mundlak (CRE).

## Packages

- `pyfixest` -- OLS and fixed effects estimation with absorbed FE and clustered SE
- `linearmodels` -- Random effects GLS estimation (panel.RandomEffects)
- `statsmodels` -- Adding constant to exogenous variables (sm.add_constant)
- `scipy` -- Hausman test χ² distribution
- `pandas` -- Data manipulation, read_stata() for .dta files
- `numpy` -- Numerical operations
- `matplotlib` -- Figure generation with dark theme styling
