# Introduction to the Synthetic Control Method in Python with mlsynth

- **Status:** script executed successfully.
- **Language:** Python.
- **Last run:** 2026-10-05.

## Overview

This folder holds the Python twin of the Stata post `stata_sc` on Proposition 99 and cigarette sales in California. The script fits the synthetic control method with `VanillaSC` of mlsynth 1.0.0. It compares every step with the published `synth2` log: weights, gaps, placebo tests, the in-time placebo, and leave-one-out fits. It then runs a short tour of three other estimators (outcome-only VanillaSC, SDID, and CLUSTERSC) and computes the answers to the six exercises of the post.

The run reproduces the Stata benchmark closely. All 96 checks pass, including the 31 benchmark rows of the replication scorecard. The canonical numbers for the post, the lab, and the web app live in `sc101_results.json`.

## Pipeline progress

- [x] Script (`script.py`): executed, with `execution_log.txt`.
- [x] Results report (`results_report.md`): written, with a reproduction audit against the Stata benchmark.
- [x] Blog post (`index.md`): written; every code block is executed and its output is checked.
- [x] Interactive lab (`sc-lab` shortcode, data from `build_sc_lab_data.py`): built and tested.
- [ ] Companions (notebook, Quarto bundle, cheat sheets, data dictionary, web app, slides, AhaSlides): next phase.
- [ ] Infographic (`infographic_instructions.md`): next phase.

## Generated figures

| # | File | Description |
|---|------|-------------|
| 1 | `sc101_raw_trends.png` | Cigarette sales per capita in California, the 38 donor states, and their simple average, 1970–2000. |
| 2 | `sc101_mlsynth_plot.png` | The native `res.plot()` panels of mlsynth (counterfactual and gap), restyled for the dark site, with a line at 1989 added by hand. |
| 3 | `sc101_synthetic_path.png` | Observed and synthetic California, with the gap in 2000 marked. |
| 4 | `sc101_gap.png` | The yearly gap between observed and synthetic California, with the ATT over 1989–2000. |
| 5 | `sc101_donor_weights.png` | Donor weights of mlsynth and Stata for the five positive donors. |
| 6 | `sc101_balance.png` | Percent gaps of synthetic California and of the donor average for the seven predictors, and the V weights of mlsynth and Stata. |
| 7 | `sc101_placebo_ratios.png` | Post-to-pre MSPE ratios of the 39 states, with the states removed by cut(2) dimmed. |
| 8 | `sc101_placebo_gaps.png` | Gap paths of California and the 19 placebo states retained by cut(2). |
| 9 | `sc101_placebo_pvalues.png` | Two-, right-, and left-sided pointwise p-values by year at cut(2), next to the Stata values. |
| 10 | `sc101_intime_placebo.png` | Observed and synthetic paths and the gap with a fake start in 1985. |
| 11 | `sc101_leave_one_out.png` | Synthetic California and the gap when each positive donor is dropped in turn. |
| 12 | `sc101_estimator_tour.png` | Counterfactual paths and ATTs of four synthetic control estimators, with a TWFE DiD reference. |

## Generated tables (CSV)

| # | File | Description |
|---|------|-------------|
| 1 | `descriptive_stats.csv` | Descriptive statistics of the five numeric variables, with the Stata counts and means. |
| 2 | `coverage.csv` | Observations and the first and last years observed for each variable. |
| 3 | `data_prepared.csv` | The panel with the treatment indicator and the three lagged-sales columns. |
| 4 | `predictors.csv` | Means of the seven predictors over their windows for the 39 states. |
| 5 | `weights.csv` | Donor weights of mlsynth and Stata for the 38 donors. |
| 6 | `predictor_weights.csv` | The diagonal of V from mlsynth and from Stata. |
| 7 | `balance.csv` | Predictor balance for California, synthetic California (mlsynth W and Stata W), and the donor average, with percent gaps. |
| 8 | `synthetic_path.csv` | Observed, synthetic, and gap paths for 1970–2000, with the Stata W path and the donor average. |
| 9 | `effects_post.csv` | Post-period paths and gaps of mlsynth and Stata, 1989–2000. |
| 10 | `placebo_mspe.csv` | Pre-period and post-period MSPE, ratio, relative pre-period MSPE, rank, and cut(2) status for the 39 states, with the Stata values. |
| 11 | `placebo_gaps.csv` | Gap paths of the 39 placebo fits in long format. |
| 12 | `placebo_pvalues.csv` | Pointwise two-, right-, and left-sided p-values at cut(2), with the Stata values. |
| 13 | `intime_summary.csv` | Fit and gap summaries for the fake start years 1985–1988. |
| 14 | `intime_paths.csv` | Synthetic and gap paths for the fake start years 1985–1988. |
| 15 | `loo_results.csv` | ATT, gaps in 1997 and 2000, pre-period RMSE, and weights of each leave-one-out fit. |
| 16 | `loo_paths.csv` | Synthetic and gap paths of the baseline and the five leave-one-out fits. |
| 17 | `estimator_tour.csv` | The estimator tour: call, matched quantities, weight rule, donors, pre-period RMSE, ATT, and gap in 2000. |
| 18 | `stata_benchmark.csv` | The replication scorecard: quantity, Stata value, mlsynth value, absolute difference, tolerance, and verdict. |

## Other outputs

| File | Description |
|------|-------------|
| `sc101_results.json` | Canonical results (13 top-level keys, from `meta` to `lab_scenarios`) for the post, the sc-lab shortcode, the tests, and the web app. |
| `execution_log.txt` | The full console log of the run, with every PASS or FAIL line. |
| `plan.md` | The approved scope of the script. |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `data/smoking_sc.csv` | 1209 | 7 | Local copy of `smoking_sc.dta` (quarcs-lab): the float32 values of the Stata file at full float64 precision, bit-identical to the Stata path. |
| `data_prepared.csv` | 1209 | 11 | The analysis panel with `treated`, `cigsale_1988`, `cigsale_1980`, and `cigsale_1975`. |

## Packages

- `mlsynth` 1.0.0 (PyPI): `VanillaSC`, `SDID`, and `CLUSTERSC`.
- `numpy` 2.3.5 and `pandas` 3.0.1: arrays, data frames, and the CSV round trip.
- `scipy` 1.17.1: SLSQP for the inner weight problem of exercise 6.
- `statsmodels` 0.14.6: the TWFE regression with standard errors clustered by state.
- `matplotlib` 3.10.8: all figures.
- `cvxpy` 1.8.1 and `scs` 3.2.8: solvers used inside mlsynth; scs 3.2.8 is the last release with macOS x86_64 wheels.

## How to reproduce

The script runs from this folder with the pinned stack. It reads `data/smoking_sc.csv` first, then `smoking_sc.csv`, and finally the Stata file on GitHub. A full run takes about three minutes; a timed run took 2 minutes 47 seconds on an Intel Mac.

```bash
cd content/tutorials/python_sc101
set -o pipefail
MPLBACKEND=Agg python script.py 2>&1 | tee execution_log.txt
```

The log prints no timings, so two runs give byte-identical logs. We confirmed this with two consecutive runs on 5 October 2026, which also produced identical CSV and JSON files. The JSON stays identical for two reasons. The script recomputes each RMSE with a numpy mean instead of the BLAS dot product inside mlsynth. It also rounds the tour entries to ten decimals, because the SDID fit can change in its last bit between runs.
