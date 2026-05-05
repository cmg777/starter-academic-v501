# python_dowhy_intro Tutorial

**Date:** 2026-05-05
**Post:** `content/post/python_dowhy_intro/`
**Status:** Complete (script, post, infographic instructions)

## Summary

Beginner-friendly introduction to causal inference using DoWhy v0.14 with simulated observational data (N=5,000). The tutorial uses a work-from-home productivity scenario where the true causal effect is known (ATE=1.0), allowing readers to verify that methods recover the correct answer.

## Key Features

- **4 estimation methods:** Linear Regression, IPW (Hajek), Doubly Robust (AIPW), IV (2SLS via Wald estimator)
- **2 identification strategies:** Selection on observables (backdoor criterion) and instrumental variables
- **Robust standard errors:** HC1 for regression/IV, influence-function SEs for IPW/DR
- **95% confidence intervals** with visual comparison (dot-and-whisker figure)
- **Bias-variance tradeoff:** IV's SE is 5.4x larger than regression's (0.33 vs 0.06)
- **Key insight:** Naive estimate is "precisely wrong" --- small SE (0.07) but CI misses the true ATE
- **DoWhy 4-step framework:** Model, Identify, Estimate, Refute with 3 refutation tests

## Results

| Method | Estimate | Robust SE | 95% CI | Covers True? |
|--------|----------|-----------|--------|-------------|
| Naive | 1.385 | 0.072 | [1.25, 1.53] | No |
| Regression | 1.005 | 0.061 | [0.88, 1.13] | Yes |
| IPW | 1.028 | 0.075 | [0.88, 1.18] | Yes |
| DR | 1.012 | 0.062 | [0.89, 1.13] | Yes |
| IV | 0.888 | 0.330 | [0.24, 1.54] | Yes |

## Artifacts

- `script.py` --- Python script (~400 lines, DoWhy + statsmodels + sklearn)
- `index.md` --- Blog post with notebook-style sandwich pattern, 8 takeaways
- `execution_log.txt` --- Full script output
- `results_report.md` --- 7 key findings with interpretations
- `infographic_instructions.md` --- 6-panel chalkboard infographic prompt
- 3 PNG figures (EDA, DAG, comparison with CIs)
- 2 CSV exports (simulated data, estimation results)
- `notebook.ipynb` --- Jupyter notebook version
- `featured.webp` --- Featured image

## Pipeline Skills Applied

1. write-script (manual execution)
2. write-results-report (manual)
3. write-post (manual)
4. write-infographic (manual)
5. review-infographic (manual) --- Panel 4 revised from precise chart to archery target metaphor

## Relationship to Existing Tutorials

- **Companion to `python_dowhy`** (Lalonde dataset, 5 methods, 841 lines) --- this is the shorter, more introductory version
- Inspired by DataCamp's DoWhy tutorial (work-from-home scenario)
- Uses simulated data (known truth) vs `python_dowhy`'s real data (Lalonde)
