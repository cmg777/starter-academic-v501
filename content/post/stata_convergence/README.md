# Beta and Sigma Convergence Across Countries

Tutorial on economic convergence using Penn World Tables 10.0, replicating and extending Patel, Sandefur, and Subramanian (2021).

## Pipeline Progress

- [x] Script (`analysis.do`)
- [x] Script review (`script-review.md`) -- ACCEPT
- [x] Results report (`results_report.md`)
- [x] Blog post (`index.md`)
- [x] Infographic (`infographic_instructions.md`)

## Figures

| File | Description |
|------|-------------|
| `stata_convergence_scatter_1960_2019.png` | Simple scatter: growth vs initial income, 1960-2019 |
| `stata_convergence_scatter_two_eras.png` | Two-panel scatter: divergence era (1960-2000) vs convergence era (2000-2019) |
| `stata_convergence_speed_halflife.png` | Speed of convergence across periods vs 2% benchmark |
| `stata_convergence_sigma_two_periods.png` | Bar chart: variance of log GDP in 1960 vs 2019 |
| `stata_convergence_rolling_beta.png` | Rolling NLS beta coefficient over time (1960-2010 to 2019) |
| `stata_convergence_sigma_evolution.png` | Sigma convergence: variance evolution 1960-2019, full + fixed sample |
| `stata_convergence_heatmap.png` | Convergence heatmap: all start/end year combinations |
| `stata_convergence_regional_beta.png` | Regional decomposition: dropping Africa/Asia/Latin America |

## CSV Files

| File | Description |
|------|-------------|
| `convergence_data_prepared.csv` | Cleaned PWT 10.0 dataset (GDP per capita, excl. oil/small) |
| `convergence_beta_simple.csv` | Two-period OLS beta convergence results |
| `convergence_speed_halflife.csv` | Speed of convergence and half-life for 6 periods |
| `convergence_rolling_beta.csv` | Rolling NLS beta coefficients (start years 1960-2010) |
| `convergence_sigma_evolution.csv` | Year-by-year variance of log GDP (full + fixed sample) |
| `convergence_heatmap_coefficients.csv` | Full matrix of NLS beta for all start/end pairs |

## Datasets

| File | Rows | Description |
|------|------|-------------|
| `pwt100.dta` | ~12,000 | Penn World Tables 10.0 (raw) |

## Stata Packages

- `kountry` (regional classification for Section 9)
