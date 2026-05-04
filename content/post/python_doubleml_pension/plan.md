# Plan: python_doubleml_pension

## Scope

- **Topic:** Double Machine Learning with 401(k) pension data
- **Question:** Does 401(k) eligibility cause higher household savings?
- **Language:** Python
- **Theme:** Light
- **Framing:** Causal (observational) — ATE (PLR, IRM) and LATE (IIVM)
- **Dataset:** `doubleml.datasets.fetch_401K` — 9,915 households, 1991 SIPP

## Script Sections

0. Setup (packages, seed=42, site colors)
1. Data loading (`fetch_401K`) + CSV export
2. EDA (outcome distributions, income confounding) + 2 figures
3. Naive baselines (difference-in-means for e401 and p401)
4. PLR models (4 learners: Lasso, RF, Tree, XGBoost) — base + flex features
5. IRM models (4 learners, propensity score approach) — base + flex features
6. IIVM models (4 learners, e401 as IV for p401) — base + flex features
7. Grand comparison (all models + naive, summary figure)
8. Summary

## Deliverables

- script.py
- execution_log.txt
- ~6 PNG figures
- ~7 CSV tables
- README.md
- plan.md

## Reference

- https://docs.doubleml.org/stable/examples/py_double_ml_pension.html
- Chernozhukov et al. (2018). Double/Debiased Machine Learning.
