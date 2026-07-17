# Covariates in Difference-in-Differences: the LaLonde Test in Python

Reproduces Scott Cunningham's "Covariates, diff in diff and LaLonde test" in Python.
Estimates the job-training ATT eight ways on the LaLonde/Dehejia-Wahba non-experimental
panel and shows that covariates rescue the estimate only when they enter the control
group's counterfactual **trend**.

## Reproduce

```bash
uv venv --python 3.13
uv pip install pyfixest causaldata diff-diff statsmodels pandas numpy matplotlib seaborn scipy
.venv/bin/python script.py
```

Data downloads automatically via the `causaldata` package (no local files needed).

## Artifacts

| File | Description |
|---|---|
| `script.py` | Full analysis: data build, 8 specs (pyfixest + hand-coded IPW/DR), diff-diff cross-check, bootstrap, 5 figures |
| `execution_log.txt` | Captured console output of the run |
| `results_report.md` | Structured results report + reproduction audit vs Cunningham (2026) |
| `lalonde_results.csv` / `.md` | Estimator table (ATT, SE, 95% CI, class) |
| `did_covariates_lalonde_estimates.json` | Precomputed estimates + trend means for the web app |
| `did_covariates_lalonde_balance.png` | Covariate imbalance (SMD): treated vs CPS vs RCT controls |
| `did_covariates_lalonde_trends.png` | Raw earnings trends 1974/75/78 by group |
| `did_covariates_lalonde_forest.png` | Forest plot of all estimators vs the \$1,794 benchmark |
| `did_covariates_lalonde_ladder.png` | Spec ladder: the estimate snaps to the benchmark |
| `did_covariates_lalonde_crosscheck.png` | By-hand vs diff-diff package |

## Key result

| Spec | ATT | Class |
|---|---|---|
| No covariates / additive X / X×treatment | \$3,621 | inert |
| X×post / saturated FD = HIT | \$1,711 / \$1,770 | corrected |
| IPW / doubly robust | \$1,861 / \$1,993 | propensity |
| **RCT benchmark** | **\$1,794** | ground truth |

Source: Cunningham (2026), *Covariates, diff in diff and LaLonde test*, Scott's Mixtape Substack.
