# Cross-Validation Report: Causal Inference Estimates Across Python, R, and Stata

## Purpose

This report compares the Average Treatment Effect (ATE) estimates of the NSW Job Training Program produced by three statistical platforms — Python (DoWhy), R, and Stata — using the same Lalonde dataset (445 observations: 185 treated, 260 control). The goal is to verify that the causal estimates are robust to implementation differences and to explain where and why the results diverge.

All three platforms analyze the same outcome (real earnings in 1978), the same treatment indicator (job training participation), and the same set of covariates (age, education, black, Hispanic, married, no high school degree, earnings in 1974, earnings in 1975).

## Combined Results Table

| Method | Python (DoWhy) | R | Stata |
|--------|:-:|:-:|:-:|
| Naive (Diff. in Means) | $1,794.34 | $1,794.34 | $1,794.34 |
| Regression Adj. (Pooled OLS) | $1,676.34 | $1,676.34 | $1,676.34 |
| Regression Adj. (teffects ra) | — | — | $1,621.58 |
| IPW | $1,559.64 | $1,641.32 (norm.) / $1,613.13 (H-T) | $1,641.32 |
| Doubly Robust (AIPW) | $1,620.01 | $1,619.05 | $1,617.18 |
| PS Stratification | $1,617.07 | $1,586.60 | $1,586.60 |
| PS Matching | $1,822.97 | $2,164.43 | $1,993.29 |

## Where Results Match Exactly

**Naive Difference in Means** — All three platforms report $1,794.34. This is a simple arithmetic operation (mean of treated minus mean of control) with no modeling choices. Given the same dataset, the result is deterministic.

**Pooled OLS Regression Adjustment** — All three platforms report $1,676.34. Ordinary least squares has a closed-form solution (the normal equations), so given the same design matrix and outcome vector, the coefficient on the treatment indicator is identical to machine precision.

These two exact matches confirm that all three platforms are working with the same dataset and variable definitions.

## Where Results Differ and Why

### Inverse Probability Weighting (IPW)

| Platform | ATE | Propensity Model |
|----------|-----|-----------------|
| Python (DoWhy) | $1,559.64 | L2-regularized logistic regression (scikit-learn) |
| R (normalized/Hajek) | $1,641.32 | Maximum likelihood logit (no regularization) |
| R (Horvitz-Thompson) | $1,613.13 | Maximum likelihood logit (no regularization) |
| Stata (teffects ipw) | $1,641.32 | Maximum likelihood logit (no regularization) |

**Key driver: propensity score estimation method.** Python's scikit-learn `LogisticRegression` applies L2 (ridge) regularization by default, which shrinks propensity score coefficients toward zero. This produces different propensity scores — and therefore different inverse-probability weights — than the unregularized MLE logit used by R's `glm()` and Stata's `logit`.

**R normalized and Stata match exactly** ($1,641.32) because both use the same Hajek-style normalized weighting estimator with identical MLE propensity scores. The R Horvitz-Thompson estimator ($1,613.13) differs because it uses unnormalized weights (weights do not sum to sample size within treatment groups), making it more sensitive to extreme propensity scores.

### Regression Adjustment: teffects ra vs. Pooled OLS

Stata's `teffects ra` ($1,621.58) differs from pooled OLS ($1,676.34) by $54.76. These are fundamentally different estimators:

- **Pooled OLS** fits a single regression of the outcome on treatment and covariates. The ATE is the coefficient on the treatment dummy, which constrains the covariate effects to be equal across treatment arms.
- **teffects ra** fits separate outcome models for treated and control groups, then averages the predicted potential outcomes across all observations. This potential-outcomes approach allows covariate effects to differ by treatment status, producing a different ATE when the covariate-outcome relationship varies between groups.

Python and R do not include a `teffects ra` equivalent in their analyses, so this comparison is Stata-only.

### Doubly Robust (AIPW)

| Platform | ATE |
|----------|-----|
| Python (DoWhy) | $1,620.01 |
| R | $1,619.05 |
| Stata (teffects ipwra) | $1,617.18 |

The three estimates span only $2.83 — the tightest convergence of any method. This is expected: the doubly robust estimator combines both an outcome model and a treatment model, and is consistent if *either* model is correctly specified. Small differences arise from the regularized vs. unregularized propensity scores, but the outcome model component compensates for these discrepancies, which is precisely the theoretical advantage of doubly robust estimation.

### Propensity Score Stratification

| Platform | ATE | Propensity Model |
|----------|-----|-----------------|
| Python (DoWhy) | $1,617.07 | L2-regularized logit |
| R | $1,586.60 | MLE logit |
| Stata | $1,586.60 | MLE logit |

**R and Stata match exactly** ($1,586.60) because both use MLE logit to estimate propensity scores, produce identical quintile boundaries, and apply the same weighted-average-of-stratum-ATEs formula. Python's regularized logit shifts the propensity score distribution, which changes the quintile cutpoints and the composition of observations within each stratum, resulting in a $30.47 difference.

### Propensity Score Matching

| Platform | ATE | Matching Algorithm |
|----------|-----|--------------------|
| Python (DoWhy) | $1,822.97 | Nearest-neighbor (DoWhy internal) |
| R (MatchIt) | $2,164.43 | Greedy nearest-neighbor |
| Stata (teffects psmatch) | $1,993.29 | Nearest-neighbor with bias adjustment |

This method shows the largest cross-platform variation — a $341.46 spread from lowest to highest. Multiple factors contribute:

1. **Propensity score model**: Python uses regularized logit; R and Stata use MLE logit. Different propensity scores produce different distance metrics for matching.
2. **Matching algorithm**: Each platform implements its own greedy nearest-neighbor algorithm with different tie-breaking rules when multiple control units are equidistant from a treated unit.
3. **With vs. without replacement**: Differences in whether matched controls can be reused affect which pairs are formed.
4. **Bias adjustment**: Stata's `teffects psmatch` applies an Abadie-Imbens bias-corrected estimator, which adjusts for remaining covariate imbalance within matched pairs. R's MatchIt and Python's DoWhy do not apply this correction by default.
5. **Matched sample size**: R reports 370 matched observations; Stata matches all 445; Python's matched sample size depends on its internal algorithm.

Matching is inherently the most implementation-sensitive method because the estimate depends on which specific units are paired, and small changes in the matching algorithm can substantially change the result.

## Key Takeaways

1. **The causal estimate is robust across platforms.** All methods across all three platforms estimate an ATE in the range of $1,559–$2,164, with most estimates clustering between $1,600 and $1,800. This convergence strengthens confidence that the NSW job training program increased earnings by roughly $1,600–$1,800 per year.

2. **Doubly robust estimation is the most stable across platforms.** With only a $2.83 spread ($1,617.18–$1,620.01), the doubly robust estimator is virtually identical across Python, R, and Stata. This makes it the most reliable single-method recommendation when results must be reproducible across software environments.

3. **Exact matches validate data consistency.** The Naive and Pooled OLS results match to the cent across all three platforms, confirming that the same dataset and variable definitions are used throughout.

4. **Regularization is the primary driver of Python vs. R/Stata differences.** For IPW and stratification, the gap between Python and R/Stata is almost entirely attributable to scikit-learn's default L2 regularization in logistic regression. Setting `C=1e10` in scikit-learn (effectively removing regularization) would bring Python's results closer to R and Stata.

5. **Matching is the most implementation-sensitive method.** The $341.46 spread in matching estimates reflects genuine algorithmic differences (tie-breaking, replacement, bias correction) that are difficult to harmonize across platforms. Researchers should report matching algorithm details and consider matching as a complement to, not a substitute for, model-based methods.

6. **R and Stata agree closely when using the same statistical models.** For IPW (normalized), stratification, and the naive/OLS benchmarks, R and Stata produce identical results because both use unregularized MLE estimation with equivalent weighting formulas.
