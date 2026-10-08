# Double LASSO in Python: Does Abortion Reduce Crime?

**Status:** Script executed successfully
**Language:** Python (pyfixest 0.50.1, DoubleML 0.11.2, hdmpy 0.1.0, xgboost 3.2.0)
**Last run:** 2026-05-25

## Overview

Python companion to the R and Stata Double LASSO tutorials. Replicates the
Belloni-Chernozhukov-Hansen (2014) 284-control extension of Donohue & Levitt
(2001) on the abortion-crime panel (n = 576, p = 284, G = 48 state clusters).

Part A (§1–§14) runs the same 5-estimator post-double-selection narrative as
the R/Stata posts. Part B (§15–§18) introduces the `DoubleML` library and
showcases `DoubleMLPLR`, `DoubleMLIRM`, and a 3-learner comparison
(LASSO / RandomForest / XGBoost).

## Pipeline Progress

- [x] Script (`script.py`) — executed
- [ ] Results report (`results_report.md`) — pending
- [ ] Blog post (`index.md`) — pending
- [ ] Infographic (`infographic_instructions.md`) — pending

## Generated Figures

| # | File | Description |
|---|------|-------------|
| 1 | `python_double_lasso_estimates.png` | Forest plot of 5 estimators across 3 outcomes |
| 2 | `python_double_lasso_selection.png` | |I_y|, |I_d|, union counts for DL-rigorous vs DL-CV |
| 3 | `python_double_lasso_methods_compare.png` | Rigorous vs CV penalty side-by-side |
| 4 | `python_double_lasso_doubleml_showcase.png` | PDS vs DoubleMLPLR on violent crime |
| 5 | `python_double_lasso_learners.png` | DoubleMLPLR with LASSO vs RandomForest vs XGBoost |

## Generated Tables (CSV)

| # | File | Description |
|---|------|-------------|
| 1 | `results_table2.csv` | 15 rows: 5 methods × 3 outcomes (estimate, SE, n_selected, CI) |
| 2 | `selection_diagnostic.csv` | |I_y|, |I_d|, intersection, union counts per outcome × method |
| 3 | `doubleml_showcase.csv` | Part B: DoubleMLPLR + DoubleMLIRM results |
| 4 | `learner_comparison.csv` | Part B §18: DoubleMLPLR with three nuisance learners |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `levitt_state.csv` | 576 | 1 | State cluster IDs (1..48) — fetched from R post's data/ |
| `levitt_linear.csv` | 576 | 7 | Raw first-differenced y and d for three crime outcomes |
| `levitt_partialled.csv` | 576 | 7 | y, d after year-FE partialling (FWL pre-processing) |
| `levitt_controls_*.csv` | 576 | 284 | Three control matrices Z_v, Z_p, Z_m (one per outcome) |

## Packages

- `pyfixest` — OLS rows with CRV1 state-clustered SE (every row in Table 2)
- `hdmpy` — Rigorous-penalty LASSO (`rlasso` with c=1.1, gamma=0.05)
- `scikit-learn` — LassoCV, RandomForest, KFold cross-validation
- `DoubleML` — Part B: DoubleMLPLR, DoubleMLIRM, DoubleMLData
- `xgboost` — Part B §18: XGBRegressor as DoubleMLPLR nuisance learner
- `pandas`, `numpy`, `matplotlib` — data wrangling and dark-theme figures
