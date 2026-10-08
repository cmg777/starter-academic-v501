# IV Estimation with Panel Data: Economic Shocks and Civil Conflict

Replication of Hodler & Raschky (2014, Economics Letters): "Economic shocks
and civil conflict at the regional level."

## Pipeline Progress

- [x] Script (`analysis.do`)
- [x] Script review (`script-review.md`) -- ACCEPT
- [x] Results report (`results_report.md`)
- [x] Blog post (`index.md`)
- [x] Post review (`post-review.md`) -- ACCEPT (9.75/10)
- [ ] Infographic (`infographic_instructions.md`)

## Dataset

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `reference/EL_regional_conflict_replication.dta` | 96,591 | ~20 | Panel data: 5,689 African regions, 1994-2010 |

## Figures

| File | Description |
|------|-------------|
| `stata_iv_panel_coef_comparison.png` | OLS vs 2SLS coefficient comparison with 95% CIs |
| `stata_iv_panel_reduced_form.png` | Reduced-form coefficients: weather shocks on conflict |
| `stata_iv_panel_first_stage_rain.png` | First-stage binned scatter: rainfall -> nightlights |
| `stata_iv_panel_first_stage_drought.png` | First-stage binned scatter: drought -> nightlights |
| `stata_iv_panel_conflict_prevalence.png` | Conflict prevalence over time (1+ and 25+ deaths) |

## CSV Tables

| File | Description |
|------|-------------|
| `table1_summary_stats.csv` | Descriptive statistics (Table 1 replication) |
| `table2_conflict01.csv` | OLS and 2SLS results for conflict with 1+ deaths |
| `table3_conflict25.csv` | OLS and 2SLS results for conflict with 25+ deaths |
| `coef_comparison_conflict01.csv` | Coefficient estimates for OLS vs 2SLS comparison |
| `reduced_form_coefficients.csv` | Reduced-form coefficient estimates |
| `yearly_averages.csv` | Year-level averages for all main variables |
| `conflict_prevalence_by_year.csv` | Conflict share by year (percentage) |

## Stata Packages

- `estout` (esttab for formatted tables)
- `ivreg2`, `ranktest`, `xtivreg2` (IV estimation)
- `outreg2` (table export)
- `schemepack` (graph schemes)
