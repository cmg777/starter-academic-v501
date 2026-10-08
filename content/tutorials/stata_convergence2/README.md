# Converging to Convergence: Understanding the Main Ideas of the Convergence Literature

Tutorial on the convergence literature based on Kremer, Willis, and You (2021) "Converging to Convergence" (NBER WP 29484). Uses the authors' replication dataset to reproduce and explain the key findings.

## Pipeline Progress

- [x] Script (`analysis.do`)
- [x] Script review (`script-review.md`) -- ACCEPT
- [x] Results report (`results_report.md`)
- [x] Blog post (`index.md`)
- [x] Infographic (`infographic_instructions.md`)

## Figures

| File | Description |
|------|-------------|
| `stata_convergence2_scatter_by_decade.png` | 6-panel scatter: growth vs income by decade (1960-2007) |
| `stata_convergence2_beta_trend.png` | Rolling beta-convergence coefficient 1960-2007 with 95% CI |
| `stata_convergence2_sigma.png` | Sigma-convergence: SD of log GDP per capita over time |
| `stata_convergence2_growth_by_quartile.png` | Mean 10-year growth by income quartile over time |
| `stata_convergence2_beta_excluding_regions.png` | Beta trend robustness: excluding each region |
| `stata_convergence2_correlate_convergence.png` | 6-panel scatter: convergence in growth correlates 1985-2015 |
| `stata_convergence2_delta_stability.png` | Correlate-income slopes (delta): 1985 vs 2015, 2 panels |
| `stata_convergence2_lambda_flattening.png` | Growth-correlate slopes (lambda): 1985 vs 2005, 2 panels |
| `stata_convergence2_ovb_gap.png` | OVB gap (delta*lambda): 1985 vs 2005, 2 panels |
| `stata_convergence2_absolute_vs_conditional.png` | Unconditional vs conditional beta over time (1985-2007) |
| `stata_convergence2_robustness_averaging.png` | Robustness: 1/2/5/10-year averaging periods |

## CSV Files

| File | Description |
|------|-------------|
| `convergence2_data_summary.csv` | Country-year panel summary |
| `convergence2_beta_by_decade.csv` | Beta coefficients by decade (Table 1) |
| `convergence2_beta_trend.csv` | Year-by-year beta with CIs |
| `convergence2_sigma.csv` | Sigma (SD of log GDP) by year |
| `convergence2_growth_by_quartile.csv` | Mean growth by quartile and year |
| `convergence2_beta_by_region.csv` | Beta trend excluding each region |
| `convergence2_correlate_convergence.csv` | Correlate beta-convergence coefficients (Table 3) |
| `convergence2_delta_lambda.csv` | Delta, lambda, and delta*lambda for all correlates (Table 4) |
| `convergence2_delta_slopes.csv` | Delta slopes with variable flags |
| `convergence2_conditional_convergence.csv` | Unconditional vs conditional beta over time |
| `convergence2_multivariate_table.csv` | Multivariate regression results (Table 5) |

## Datasets

| File | Description |
|------|-------------|
| `main_data.dta` | Kremer et al. (2021) replication dataset (PWT 10.0 + 50+ correlates) |
| `WDICountry.csv` | WDI country metadata for regional classification |

## Stata Packages

- `estout` (regression table export)
- `winsor` (winsorizing correlates)
- `colorpalette` (color schemes for plots)
