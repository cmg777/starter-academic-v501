/*==============================================================================
  Cross-Validation: Causal Inference Methods in Stata

  Replicates the DoWhy (Python) analysis of the Lalonde/NSW dataset using
  Stata's teffects suite and manual implementations.

  Dataset: lalonde_dowhy.csv (exported from Python script)
  Treatment: treat (1=Job Training, 0=Control)
  Outcome: re78 (Real Earnings in 1978, USD)
  Covariates: age educ black hisp married nodegr re74 re75

  Usage: do analysis.do

  Requirements: Stata 13+ (for teffects)
==============================================================================*/

clear all
set more off
set seed 42
version 13

* ── Data Loading ─────────────────────────────────────────────────────────

import delimited "lalonde_dowhy.csv", clear

* Label variables
label variable treat   "Job Training (1=Training, 0=Control)"
label variable re78    "Real Earnings in 1978 (USD)"
label variable age     "Age"
label variable educ    "Years of Education"
label variable black   "Black"
label variable hisp    "Hispanic"
label variable married "Married"
label variable nodegr  "No High School Degree"
label variable re74    "Real Earnings in 1974 (USD)"
label variable re75    "Real Earnings in 1975 (USD)"

* Verify data
describe
summarize
tabulate treat

display _newline(2)
display "============================================================"
display "CAUSAL INFERENCE: NSW Job Training Program (Stata)"
display "============================================================"

* Define covariates for convenience
local covariates "age educ black hisp married nodegr re74 re75"

* ── Method 1: Naive Difference in Means ──────────────────────────────────

display _newline(1)
display "--- Method 1: Naive Difference in Means ---"

ttest re78, by(treat)

* Store the ATE (treat=1 mean minus treat=0 mean)
summarize re78 if treat == 1
scalar mean_treated = r(mean)
summarize re78 if treat == 0
scalar mean_control = r(mean)
scalar naive_ate = mean_treated - mean_control

display _newline(1)
display "Mean earnings (Training): $" %10.2f mean_treated
display "Mean earnings (Control):  $" %10.2f mean_control
display "Naive ATE:                $" %10.2f naive_ate

* ── Method 2: Regression Adjustment ──────────────────────────────────────

display _newline(2)
display "--- Method 2a: Regression Adjustment (teffects ra) ---"

teffects ra (re78 `covariates') (treat)
matrix b_ra = e(b)
scalar ra_ate = b_ra[1,1]

display _newline(1)
display "RA ATE (teffects ra):     $" %10.2f ra_ate

* Pooled OLS (matches Python's backdoor.linear_regression)
display _newline(1)
display "--- Method 2b: Regression Adjustment (Pooled OLS) ---"

regress re78 treat `covariates'
scalar ra_ate_ols = _b[treat]

display _newline(1)
display "RA ATE (pooled OLS):      $" %10.2f ra_ate_ols

* ── Method 3: Inverse Probability Weighting (IPW) ────────────────────────

display _newline(2)
display "--- Method 3: Inverse Probability Weighting (IPW) ---"

teffects ipw (re78) (treat `covariates', logit)
matrix b_ipw = e(b)
scalar ipw_ate = b_ipw[1,1]

display _newline(1)
display "IPW ATE:                  $" %10.2f ipw_ate

* ── Method 4: Doubly Robust (IPWRA / AIPW) ───────────────────────────────

display _newline(2)
display "--- Method 4: Doubly Robust (IPWRA) ---"

teffects ipwra (re78 `covariates') (treat `covariates', logit)
matrix b_dr = e(b)
scalar dr_ate = b_dr[1,1]

display _newline(1)
display "DR ATE (teffects ipwra):  $" %10.2f dr_ate

* ── Method 5: Propensity Score Stratification ─────────────────────────────

display _newline(2)
display "--- Method 5: Propensity Score Stratification (5 strata) ---"

* Step 1: Estimate propensity scores
logit treat `covariates'
predict ps, pr

* Step 2: Create 5 strata based on PS quintiles
xtile ps_strata = ps, nquantiles(5)

* Step 3: Compute stratum-specific ATEs and weighted average
scalar ps_strat_ate = 0
scalar total_weight = 0

forvalues s = 1/5 {
    quietly count if treat == 1 & ps_strata == `s'
    scalar n_t = r(N)
    quietly count if treat == 0 & ps_strata == `s'
    scalar n_c = r(N)

    * Skip strata with no treated or no control observations
    if n_t > 0 & n_c > 0 {
        quietly summarize re78 if treat == 1 & ps_strata == `s'
        scalar mean_t = r(mean)
        quietly summarize re78 if treat == 0 & ps_strata == `s'
        scalar mean_c = r(mean)
        scalar ate_s = mean_t - mean_c
        scalar w_s = n_t + n_c
        scalar ps_strat_ate = ps_strat_ate + ate_s * w_s
        scalar total_weight = total_weight + w_s
        display "  Stratum `s': ATE = $" %10.2f ate_s " (n_t=" %3.0f n_t ", n_c=" %3.0f n_c ")"
    }
    else {
        display "  Stratum `s': SKIPPED (empty treatment or control group)"
    }
}

scalar ps_strat_ate = ps_strat_ate / total_weight

display _newline(1)
display "PS Stratification ATE:    $" %10.2f ps_strat_ate

* Clean up
drop ps ps_strata

* ── Method 6: Propensity Score Matching ───────────────────────────────────

display _newline(2)
display "--- Method 6: Propensity Score Matching ---"

teffects psmatch (re78) (treat `covariates', logit)
matrix b_match = e(b)
scalar match_ate = b_match[1,1]

display _newline(1)
display "PS Matching ATE:          $" %10.2f match_ate

* ── Summary: Cross-Validation Table ──────────────────────────────────────

display _newline(3)
display "============================================================"
display "CROSS-VALIDATION: Python (DoWhy) vs Stata"
display "============================================================"
display "Method                         Python ATE    Stata ATE"
display "------------------------------------------------------------"
display "Naive (Diff. in Means)         $  1,794.34   $" %10.2f naive_ate
display "Regression Adj. (pooled OLS)   $  1,676.34   $" %10.2f ra_ate_ols
display "Regression Adj. (teffects ra)  $  1,676.34   $" %10.2f ra_ate
display "IPW                            $  1,559.41   $" %10.2f ipw_ate
display "Doubly Robust (IPWRA)          $  1,620.04   $" %10.2f dr_ate
display "PS Stratification              $  1,617.07   $" %10.2f ps_strat_ate
display "PS Matching                    $  1,735.69   $" %10.2f match_ate
display "============================================================"
display _newline(1)
display "Notes:"
display "- Naive and Pooled OLS should match Python exactly (same arithmetic)"
display "- IPW/DR/Stratification may differ: Python uses L2-regularized logit"
display "  (scikit-learn), Stata uses MLE logit (no regularization)"
display "- PS Matching differences reflect algorithm implementation details"
display "  (tie-breaking, replacement, caliper)"
