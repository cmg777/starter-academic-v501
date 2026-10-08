# Manual Demeaning vs Two-Way Fixed Effects

**Status:** Script executed successfully
**Language:** R
**Last run:** 2026-04-03

## Overview

Demonstrates the algebraic equivalence between two-way fixed effects (TWFE) estimation and OLS on manually demeaned data, grounded in the Frisch-Waugh-Lovell (FWL) theorem. Uses a balanced panel of 150 countries over 8 time periods from the Barro convergence dataset.

## Pipeline Progress

- [x] Script (`analysis.R`) -- executed
- [x] Script review (`script-review.md`) -- ACCEPT
- [x] Results report (`results_report.md`) -- completed
- [x] Results report review (`results_report_review.md`) -- ACCEPT (1 MED fix needed)
- [x] Blog post (`index.md`) -- completed
- [x] Infographic (`infographic_instructions.md`) -- completed

## Generated Figures

| # | File | Description |
|---|------|-------------|
| 1 | `r_demeaning_twfe_panel_structure.png` | Heatmap confirming balanced panel (150 countries x 8 periods) |
| 2 | `r_demeaning_twfe_coef_comparison.png` | Dot plot showing TWFE and manual demeaning coefficients overlap perfectly |
| 3 | `r_demeaning_twfe_scatter_before_after.png` | Faceted scatter: raw vs demeaned data for ln_y_initial vs growth |
| 4 | `r_demeaning_twfe_decomposition.png` | Single-country decomposition of the demeaning formula components |
| 5 | `r_demeaning_twfe_se_comparison.png` | Grouped bars comparing naive lm() SEs vs feols iid vs feols clustered SEs |

## Generated Tables (CSV)

| # | File | Description |
|---|------|-------------|
| 1 | `source_data.csv` | Original panel data with factor-converted id and time |
| 2 | `country_means.csv` | Country-level means for all 6 variables (150 rows) |
| 3 | `time_means.csv` | Time-period means for all 6 variables (8 rows) |
| 4 | `data_demeaned.csv` | Full dataset with original and demeaned variables (1200 rows) |
| 5 | `twfe_results.csv` | feols() TWFE regression results (5 coefficients) |
| 6 | `ols_demeaned_results.csv` | lm() on demeaned data results (5 coefficients) |
| 7 | `coefficient_comparison.csv` | Side-by-side coefficient comparison with differences |
| 8 | `se_comparison.csv` | Three-way SE comparison (naive, iid, clustered) |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `referenceMaterials/barro_convergence_panel.csv` | 1200 | 11 | Source: Barro convergence balanced panel |
| `source_data.csv` | 1200 | 11 | Copy with factor-converted id/time |
| `data_demeaned.csv` | 1200 | 18 | Original + demeaned variables |

## Packages

- `fixest` -- TWFE estimation via feols()
- `tidyverse` -- data wrangling and ggplot2 visualization
- `scales` -- axis formatting
- `patchwork` -- (loaded but not used in final version)
