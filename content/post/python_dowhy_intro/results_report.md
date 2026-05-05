# Results Report: Introduction to Causal Inference with DoWhy

## Study Design

**Research question:** What is the causal effect of working from home on employee productivity?

**Dataset:** Simulated observational data (N=5,000) with known true ATE = 1.0, designed to demonstrate confounding bias and causal inference methods.

**Variables:**
- Treatment: `work_from_home` (binary, 66.2% treated)
- Outcome: `productivity` (continuous, mean=53.88, SD=2.49)
- Confounders: `introversion` (continuous, mean=4.97), `num_children` (integer, mean=1.50)
- Instrument: `company_policy` (binary, 42% with WFH-friendly policy)

**Estimand:** Average Treatment Effect (ATE)

**Identification strategies:**
1. Backdoor criterion (selection on observables) — used by Regression, IPW, Doubly Robust
2. Instrumental variables — used by IV/2SLS

---

## Key Finding 1: The Naive Estimate is Biased Upward

The simple difference in means between WFH and office workers yields an estimated effect of **1.39**, which is **39% larger** than the true effect of 1.0.

- Mean productivity (WFH): 54.35
- Mean productivity (Office): 52.97
- Naive ATE: 1.39 (bias = +0.39)

**Why?** Introverts self-select into WFH (mean introversion: WFH=5.19 vs Office=4.55) AND are independently more productive (coefficient = 0.8). This confounding inflates the naive estimate.

---

## Key Finding 2: Backdoor Methods Recover the True Effect

All three methods using selection on observables (backdoor criterion) closely recover the true ATE of 1.0:

| Method | Estimate | Bias |
|--------|----------|------|
| Linear Regression | 1.0051 | +0.0051 |
| IPW | 1.0275 | +0.0275 |
| Doubly Robust (AIPW) | 1.0115 | +0.0115 |

**Linear Regression** (bias = 0.5%) performs best because the true DGP is linear — the model is correctly specified.

**IPW** (bias = 2.8%) reweights observations by inverse propensity scores to create a pseudo-population where treatment is independent of confounders.

**Doubly Robust** (bias = 1.2%) combines outcome modeling and propensity score weighting. It is consistent if *either* model is correctly specified.

---

## Key Finding 3: IV Estimation is Noisier but Uses a Different Identification Strategy

The IV (2SLS) estimate using `company_policy` as an instrument yields **0.888** (bias = -0.112, or -11.2%).

This is noisier than the backdoor methods because IV estimation divides the reduced-form effect by the first-stage effect, amplifying variance. However, IV has a crucial advantage: it is valid even with **unmeasured confounders**, provided the exclusion restriction holds (the instrument affects productivity only through WFH choice).

---

## Key Finding 4: Covariate Imbalance Confirms Confounding

The covariate balance check reveals systematic differences between WFH and office groups:

| Covariate | Office Mean | WFH Mean | Direction |
|-----------|------------|----------|-----------|
| Introversion | 4.547 | 5.186 | WFH group more introverted |
| Num. Children | 1.327 | 1.583 | WFH group has more children |

Both confounders are higher in the WFH group, confirming self-selection. Since introversion positively affects productivity (coeff = 0.8), the naive comparison is confounded upward.

---

## Key Finding 5: All Three Refutation Tests Pass

DoWhy's automated robustness checks confirm the estimates are sound:

| Refutation Test | New Effect | p-value | Interpretation |
|----------------|------------|---------|----------------|
| Placebo Treatment | -0.00003 | 0.96 | Fake treatment → no effect (PASS) |
| Random Common Cause | 1.0051 | 0.98 | Adding noise confounder → estimate unchanged (PASS) |
| Data Subset (80%) | 0.9988 | 0.64 | Estimate stable on subsamples (PASS) |

The placebo test is particularly convincing: when treatment is randomly permuted, the estimated effect collapses to essentially zero (-0.00003), confirming that the original effect is not an artifact.

---

## Key Finding 6: DoWhy's Four-Step Framework Provides Transparency

The DoWhy framework structures causal analysis into four explicit steps:

1. **Model** — Define a causal DAG with 5 variables, 6 directed edges
2. **Identify** — DoWhy automatically finds the backdoor estimand (condition on introversion, num_children) and the IV estimand (use company_policy)
3. **Estimate** — Four methods across two identification strategies
4. **Refute** — Three automated robustness checks

This transparency is the key contribution: every causal claim is traceable to explicit assumptions encoded in the DAG.

---

## Key Finding 7: Standard Errors Reveal the Bias-Variance Tradeoff

All standard errors are robust (heteroskedasticity-consistent): HC1 for regression and IV, influence-function SEs for IPW and DR, Welch SE for the naive estimate.

| Method | Robust SE | Relative to Regression |
|--------|-----------|----------------------|
| Naive | 0.0716 | 1.17x |
| Linear Regression | 0.0614 | 1.00x (reference) |
| IPW | 0.0754 | 1.23x |
| Doubly Robust | 0.0623 | 1.01x |
| IV (2SLS) | 0.3303 | 5.38x |

IV's SE is 5.4x larger than regression's because it only uses the exogenous variation from the instrument (22% of treatment variation), amplifying noise through the Wald ratio. The naive SE is small but misleading: its CI [1.25, 1.53] does not contain the true ATE — an example of being *precisely wrong*.

---

## Summary Table

| Method | Estimate | Robust SE | 95% CI | CI Width | Covers True? | Identification |
|--------|----------|-----------|--------|----------|-------------|----------------|
| True ATE | 1.0000 | --- | --- | --- | --- | --- |
| Naive (Diff. in Means) | 1.3853 | 0.0716 | [1.245, 1.526] | 0.281 | No | None (biased) |
| Linear Regression | 1.0051 | 0.0614 | [0.885, 1.126] | 0.241 | Yes | Backdoor |
| IPW | 1.0275 | 0.0754 | [0.880, 1.175] | 0.296 | Yes | Backdoor |
| Doubly Robust (AIPW) | 1.0115 | 0.0623 | [0.889, 1.134] | 0.244 | Yes | Backdoor |
| IV (2SLS) | 0.8881 | 0.3303 | [0.241, 1.536] | 1.295 | Yes | Instrument |
