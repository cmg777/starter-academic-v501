# python_bridge_impact -- artifact inventory

Replication of Blankespoor, Emran, Shilpi and Xu (2021), *Bridge to bigpush or backwash?*

Run with `python analysis.py 2>&1 | tee execution_log.txt`.

## Data (`data/`)
| File | Rows | Description |
|---|---|---|
| `bridge_nightlights.csv` | 2513 | DMSP-OLS luminosity, upazila x 3-year period, 1992-2013 |
| `bridge_employment.csv` | 1053 | Population censuses 1991/2001/2011, upazila |
| `bridge_yield.csv` | 128 | Boro rice yield, former district x period, 1988-2013 |
| `bridge_dhs_household.csv` | 1543 | DHS/HIES household questionnaire, village-year |
| `bridge_dhs_village.csv` | 1455 | DHS village questionnaire, village-year |

## Figures
21 PNGs named `python_bridge_impact_NN_<name>.png`, 300 dpi, dark navy.

## Result tables
`python_bridge_impact_table1_mean_effects.csv`, `_table2_short_long_run.csv`, `_table3_public_goods.csv`,
`_table4_heterogeneity.csv`, `_balance_pretrends.csv`, `_event_study_*.csv`,
`_estimator_agreement.csv`, `_audit_reproduction.csv`, `_honest_did.csv`,
`_randomization_null.csv`, `_covariate_balance.csv`, `_distance_bands.csv`,
`_pre_bridge_gradients.csv`, `_did_2x2.csv`, `_summary.json`.

## Reproduction
122 of 122 published coefficients reproduce to the printed three decimals.

## Review reports
| File | Covers | Verdict |
|---|---|---|
| `script-review.md` | `analysis.py` — 8 dimensions, fresh run, determinism check | ACCEPT |
| `results_report_review.md` | `results_report.md` — 7 dimensions incl. the v2 gates | MINOR REVISION |
| `slides/SLIDES_REVIEW.md` | the reveal.js deck — 10 dimensions + browser pass | ACCEPT |
| `web_app/REVIEW.md` | the D3 explorer — 10 dimensions + browser pass | MINOR REVISION |
