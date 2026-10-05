# Plan: the analysis script of python_sc101

This file records the approved scope of `script.py`, the computational backbone of the post. The post introduces the synthetic control method and the mlsynth library with the Proposition 99 case of the Stata post `stata_sc`. Every number in the post and its companions comes from one run of this script.

## 1. Topic and question

The script replicates the synthetic control analysis of Proposition 99 in Python. It uses the `VanillaSC` estimator of mlsynth 1.0.0 and the same `smoking_sc.dta` file of quarcs-lab as the Stata post. The question is how much Proposition 99 reduced cigarette sales per capita in California between 1989 and 2000.

## 2. Language, stack, and figures

The scope fixes the software stack and the figure style. We pin the stack because the placebo fits are sensitive to the optimizer and to library versions. The figures reuse the dark theme of `python_did101` so that they match the site.

- Python 3.13.11 with mlsynth 1.0.0 from PyPI (build fingerprint `pypi`), numpy 2.3.5, pandas 3.0.1, scipy 1.17.1, matplotlib 3.10.8, cvxpy 1.8.1, scs 3.2.8, statsmodels 0.14.6, and pydantic 2.13.4.
- Twelve figures named `sc101_*.png`, saved at 300 dpi on a dark navy background.
- No featured image: the author adds `featured.webp` by hand.

## 3. Model specification

The baseline follows `synth2 ... nested allopt` of the Stata post as closely as mlsynth allows. Four covariates enter as averages over 1980–1988, and three lagged sales enter as separate columns. Each lag has its own one-year window, because mlsynth 1.0.0 deletes years listwise when all windows are equal.

- Covariates: `lnincome`, `age15to24`, `retprice`, and `beer`, each averaged over 1980–1988.
- Lags: `cigsale_1988`, `cigsale_1980`, and `cigsale_1975`, each with a one-year window.
- Settings: `backend="mscmt"`, `canonical_v="min.loss.w"`, `seed=42`, `display_graphs=False`, and `inference=False` except where the built-in placebo is shown.
- A guard in `sc_config()` stops the run when all predictor windows resolve to the same years.

## 4. Script sections

The sections follow the order of the post. Each section prints its results and the PASS or FAIL lines of its checks. The script stops with an error at the end if any check fails.

| Section | Content |
|---|---|
| 0 | Environment: versions, build fingerprint, and seed |
| 1 | Data loading and checks against the Stata summary |
| 2 | Raw trends of California and the donor average |
| 3 | Panel preparation and predictor means, checked against Stata |
| 4 | Baseline synthetic California: weights, V, balance, paths, ATT, and fit |
| 5 | Exact Stata recomputations with the rounded Stata weights |
| 6 | In-space placebo tests: built-in test, synth2-style loop, cut(2), and pointwise p-values |
| 7 | In-time placebo test at 1985, fake years 1986–1988, and the failed 1984 start |
| 8 | Leave-one-out over the five positive-weight donors |
| 9 | Replication scorecard against Stata |
| 10 | Estimator tour: outcome-only VanillaSC, SDID, CLUSTERSC, and a TWFE reference |
| 11 | Answers to the six exercises |
| 12 | Exports: canonical JSON and eighteen CSV tables |
| 13 | Final success line |

## 5. Deliverables

The script writes all of its outputs to the post folder. The canonical results file feeds the lab, the web app, and the tests. The log, the README, and this plan document the run.

- `script.py` and `execution_log.txt`.
- `data/smoking_sc.csv`, a full-precision copy of the Stata file that the script reads first.
- Twelve `sc101_*.png` figures and eighteen CSV tables without a slug prefix.
- `sc101_results.json`, the canonical results file; a copy goes to `web_app/data/results.json` only when that folder exists.
- `README.md` (artifact inventory) and `plan.md` (this file).

## 6. Framing and estimand

The analysis is causal and observational. The estimand is the average treatment effect on the treated (ATT) for California, averaged over 1989–2000. The estimate is credible only if the synthetic control reproduces the path that California would have followed without the policy.

The placebo p-values are permutation p-values over the 39 states. They measure how unusual the gap of California is among placebo gaps, not the probability that the policy had no effect. The in-time placebo and the leave-one-out fits are robustness checks, not formal tests.

## 7. Decisions taken during planning

Several choices resolve conflicts between the design notes. They keep the script reproducible and close to the Stata benchmark. They also give the post a few honest teaching points.

- The seed is 42 everywhere, as in the Stata do-file; with this seed the loop keeps the same 20 states as Stata at cut(2).
- The built-in placebo leaves California out of every placebo pool, while the loop keeps it in, as synth2 does; both are reported.
- `oracle_weights` fails with covariates in mlsynth 1.0.0, so the fit that reproduces the Stata path uses the outcome alone.
- The lab uses fake start years 1985–1988; a fake start in 1984 fails because the beer data begin in 1984.
- The tour uses SDID with `B=500` and `seed=42` and CLUSTERSC with its `pcr` defaults; one line reports the `clustering=False` variant.
- The log prints no timings, so two runs produce byte-identical logs.
