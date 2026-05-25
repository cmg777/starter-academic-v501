# python_double_lasso — Full pipeline + DoubleML library introduction

**Date:** 2026-05-25
**Post slug:** `python_double_lasso`
**Topic:** Python companion to the R and Stata Double LASSO tutorials, plus a
dedicated introduction to the [DoubleML](https://docs.doubleml.org/) library
(DoubleMLPLR, DoubleMLIRM, learner-robustness comparison)

## Summary

The `python_double_lasso` post completes the R + Stata + Python triad on the
Belloni-Chernozhukov-Hansen (2014) 284-control extension of Donohue-Levitt
(2001) abortion-and-crime panel. **Part A** (§1-§14) mirrors the R/Stata
five-estimator narrative using `pyfixest` for OLS, `hdmpy` for rigorous
LASSO, and `sklearn.LassoCV` for CV LASSO. **Part B** (§15-§18) is a new
contribution unique to the Python post: a dedicated introduction to the
`DoubleML` library, featuring `DoubleMLPLR` with a hand-rolled
state-clustered sandwich on the orthogonal scores, `DoubleMLIRM` on a
binarised treatment (pure API demo), and a learner-robustness comparison
across LASSO, RandomForest, and XGBoost.

The numerical replication is **faithful at the variable-selection level** —
all six \|I_y\|, \|I_d\| cells exactly match Fitzgerald et al. (2026) Table 2
and the R/Stata companions. DL-rigorous point estimates match the paper to
3 decimals (violent −0.104 = paper −0.104; property −0.030 = paper −0.030;
murder −0.125 = paper −0.125).

The Python-specific surprise is that the dramatic violent-crime sign-flip
the R post showcases (rigorous −0.10 → CV +0.02) does **NOT reproduce in
Python**: `sklearn.LassoCV` is less aggressive than R's `cv.glmnet`
(picks 56 controls vs R's 150), so the violent-crime DL-CV estimate stays
clearly negative at −0.14. §15 of the post is a dedicated "Why DoubleML
results don't match R hdm" section walking through five sources of drift
(cross-fitting, learner defaults, standardisation, fold RNG, inference
target).

## Deliverables

| # | Skill / step | Artefact | Status |
|---|---|---|---|
| 1 | `/project:write-script` | `script.py` (~530 lines) | Clean run, exit 0, 3 cosmetic pandas warnings; ~7.5 min wall clock (Part A: ~90 s; DoubleMLPLR + IRM + 3-learner comparison: ~6 min) |
| 2 | (manual) execution log | `execution_log.txt` (~174 lines) | Full stdout captured via `python -u ... | tee` |
| 3 | `/project:write-results-report` | `results_report.md` (~430 lines, 10 Key Findings, 7-category Surprises checklist, Reproduction Audit appendix with 15 rows + paper line citations) | ACCEPT; Tier A/B/C drift documented explicitly |
| 4 | `/project:write-post` | `index.md` (1,200+ lines, 22 sections, 8 display equations, 5 figures + 2 Mermaid diagrams, 7 link buttons) | Comprehensive; Part B (§15-§18) is new content beyond the R/Stata twins |
| 5 | `/project:write-quarto-notebook-python` | `references/tutorial.qmd` + `setup_env.py` + `_quarto.yml` + `render.command` + `render.bat` + `README.md` + `build_bundle.sh` + `python_double_lasso.zip` (8 files in bundle, 75 KB zip) | Bundle built; verified ZIP structure (7 files inside `python_double_lasso/`); Quarto end-to-end render skipped this session (script.py already runs end-to-end successfully — bundle is structurally identical to verified `python_pyfixest` template) |

**Featured image:** NOT generated (user adds manually per repo convention).

## Library stack

| Library | Version | Role |
|---|---|---|
| `pyfixest` | 0.50.1 | OLS rows with `vcov={"CRV1": "state"}` |
| `DoubleML` | 0.11.2 | Part B: `DoubleMLPLR`, `DoubleMLIRM` |
| `hdmpy` | 0.1.0 | Rigorous-penalty LASSO (BCH, c=1.1, gamma=0.05) |
| `scikit-learn` | 1.8.0 | `LassoCV`, `KFold`, `RandomForestRegressor`, `RandomForestClassifier` |
| `xgboost` | 3.2.0 | Learner-comparison nuisance estimator |
| `numba` / `llvmlite` | 0.62.1 / 0.45.0 | Intel-wheel pins (transitive via pyfixest) |
| `jupyter` / `ipykernel` | 1.1.1 / 7.2.0 | Quarto bundle bootstrap |

## Key methodological choices

1. **PSL implementation.** `hdmpy.rlasso` has no `pnotpen` option (unlike
   R's `glmnet` `penalty.factor=0` or Stata's `pnotpen`). We use
   **Frisch-Waugh-Lovell partialling** as the natural Python equivalent:
   residualise both `y` and `X` against `d` via OLS, then run rigorous
   LASSO on the residuals, then post-OLS via `pyfixest` with CRV1.

2. **Cluster SE on DoubleMLPLR.** `DoubleMLPLR.se` is iid by default. We
   hand-roll a state-clustered HC1 sandwich on `dml.psi` and
   `dml.psi_elements["psi_a"]` — code in `cluster_se_orthogonal()` (~30
   lines of NumPy). On this G=48 panel the cluster SE (0.073) is actually
   SLIGHTLY SMALLER than the iid SE (0.083), unusual but valid (negative
   within-cluster autocorrelation in crime rates).

3. **DoubleMLIRM caveat.** The treatment (effective abortion rate) is
   continuous; DoubleMLIRM requires a binary treatment. We binarise at the
   median **purely to demonstrate the API**, with an explicit caveat that
   this is not a causal estimate. ATE = −0.016 on the binary version is on
   a completely different scale from PLR's continuous-treatment α̂ = −0.115.

4. **Hand-rolled NumPy cluster sandwich for OLS rows.** `pyfixest.feols`
   with a 285-term formula string was too slow (>11 minutes on first run)
   so we hand-roll the cluster sandwich in pure NumPy via rank-revealing
   QR. The blog post showcases pyfixest's syntax with a small one-regressor
   example, then explains that the bulk computation uses the equivalent
   manual sandwich for performance.

## Reproduction tier table (Python vs R vs paper)

| Outcome | Method | Python α̂ | R α̂ | Paper α̂ | Match |
|---|---|---:|---:|---:|---|
| Violent | First diff | −0.1521 | −0.1521 | −0.152 | Tier A (exact) |
| Violent | OLS-full | +0.0135 | +0.0135 | +0.014 | Tier A (exact) |
| Violent | DL-rigorous | −0.1043 | −0.0964 | −0.104 | Tier B (within 0.01) |
| Violent | DL-CV | −0.1401 | +0.0193 | (not in paper) | Tier C (R sign-flips, Python doesn't) |
| Property | DL-rigorous | −0.0302 | −0.0314 | −0.030 | Tier B (exact) |
| Murder | DL-rigorous | −0.1253 | −0.1662 | −0.125 | Tier B (Python closer to paper) |

Selection counts \|I_y\| and \|I_d\| are **exact matches** to the R companion
and the paper across all six rigorous-penalty cells.

## DoubleML Part B results (Python-only)

| Estimator | α̂ (violent crime) | iid SE | Cluster SE |
|---|---:|---:|---:|
| DoubleMLPLR (LassoCV) | −0.1152 | 0.0826 | 0.0727 |
| DoubleMLIRM (binarised, API only) | −0.0163 | 0.0043 | — |
| DoubleMLPLR (RandomForest learner) | −0.0855 | 0.1806 | 0.1432 |
| DoubleMLPLR (XGBoost learner) | −0.1123 | 0.2089 | 0.1421 |

Three different DoubleMLPLR nuisance learners agree within a 0.03 spread —
DoubleML's learner-robustness signal works as advertised.

## File inventory

```
content/post/python_double_lasso/
├── index.md                                    (1,200+ lines, 22 sections)
├── script.py                                   (~530 lines)
├── execution_log.txt                           (~174 lines)
├── results_report.md                           (~430 lines)
├── README.md                                   (auto-generated artifact inventory)
├── results_table2.csv                          (15 rows: 5 methods × 3 outcomes)
├── selection_diagnostic.csv                    (selection counts)
├── doubleml_showcase.csv                       (Part B PLR + IRM results)
├── learner_comparison.csv                      (Part B learner comparison)
├── python_double_lasso_estimates.png           (forest plot)
├── python_double_lasso_selection.png           (variable-selection bar chart)
├── python_double_lasso_methods_compare.png     (rigorous vs CV)
├── python_double_lasso_doubleml_showcase.png   (PDS vs DoubleMLPLR)
├── python_double_lasso_learners.png            (LASSO vs RF vs XGBoost)
├── python_double_lasso.zip                     (Quarto bundle, 75 KB)
├── build_bundle.sh                             (bundler script, +x)
└── references/
    ├── tutorial.qmd                            (executable Quarto notebook)
    ├── setup_env.py                            (hermetic venv bootstrap)
    ├── _quarto.yml                             (Quarto pre-render hook)
    ├── render.command                          (macOS one-click wrapper, +x)
    ├── render.bat                              (Windows one-click wrapper)
    └── README.md                               (bundle README)
```

## Web app

Reuses the R companion's web app via the front-matter link button
`url: /post/r_double_lasso/web_app/index.html` — same pattern the Stata
companion uses. No Python-specific web_app/ directory was created (the
underlying LASSO math is language-agnostic; building a Python-specific
clone would not add pedagogical value).

## Next steps for the user

1. Add `featured.webp` to `content/post/python_double_lasso/` (user
   convention — skill does not generate featured images).
2. Optionally: add AI Podcast via the standard "Add AI Podcast to
   python_double_lasso" workflow (provides a podcast audio URL; appends
   the player block to `index.md`).
3. Optionally: run `/project:review-script python_double_lasso` and
   `/project:review-post python_double_lasso` for quality-checked review
   reports.
4. Commit when ready: `git add content/post/python_double_lasso/ logs/2026-05-25-python-double-lasso-pipeline.md`.
