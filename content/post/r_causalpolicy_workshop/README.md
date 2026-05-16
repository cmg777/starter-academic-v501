# r_causalpolicy_workshop -- Artifact Inventory

Replication of the causalpolicy.nl workshop (DiD, ITS, RDD, Synthetic Control,
CausalImpact) using California's 1988 Proposition 99 cigarette tax.

## Pipeline progress
- [x] Stage 1: write-script (analysis.R)
- [x] Stage 2: write-results-report (results_report.md)
- [x] Stage 3: write-post (index.md)
- [x] Stage 4: write-infographic (infographic_instructions.md)

## Figures
| File | Description |
|---|---|
| fig1_raw_series.png | Per-capita cigarette sales, 1970-2000, all states |
| fig2_did_parallel_trends.png | California vs Nevada (DiD inputs) |
| fig3_its_arima.png | ITS via ARIMA: observed vs counterfactual |
| fig4_rdd_segmented.png | RDD on time: piecewise pre/post fit |
| fig5_sc_trends.png | Synthetic Control: observed vs synthetic California |
| fig6_sc_weights.png | Top 10 donor-state weights |
| fig7_sc_placebos.png | Placebo distribution of average causal effects |
| fig8_causalimpact.png | CausalImpact pointwise + cumulative |
| fig9_cross_method_forest.png | Forest plot of all six estimators |
| fig10_sc_mspe_ratio.png | MSPE-ratio bar chart (Abadie Fisher rank visualisation) |
| fig11_sc_differences.png | tidysynth::plot_differences() -- California's per-year gap |
| fig12_sc_placebos_unpruned.png | plot_placebos(prune = FALSE) -- every donor's placebo gap |

## CSV tables
| File | Description |
|---|---|
| proposition99.csv | Raw dataset (mirror of proposition99.rds) |
| data_california.csv | California-only series with prepost factor |
| data_california_tsibble.csv | Same with year0 centred at 1989 |
| data_imputed.csv | Full panel after mice random-forest imputation |
| table_eda_california_prepost.csv | Pre/post descriptives for California |
| table_sc_unit_weights.csv | Synthetic Control unit weights |
| table_sc_balance.csv | Synthetic Control predictor balance |
| table_sc_predictor_weights.csv | Synthetic Control V matrix (predictor weights) |
| table_sc_loss.csv | Pre-period MSPE for treated unit + all placebos |
| table_sc_significance.csv | Fisher exact p-value via MSPE ratios |
| table_sc_placebo_aces.csv | Placebo average causal effects |
| table_sc_outcomes_long.csv | Unnested .outcome list-column from prop99_syn |
| table_causalimpact_series.csv | CausalImpact pointwise / cumulative series |
| table_cross_method.csv | Six-method comparison table |

## Packages
tidyverse, sandwich, lmtest, tidysynth, fpp3, mice, CausalImpact, broom, glue
