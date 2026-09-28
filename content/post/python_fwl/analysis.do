*==============================================================================
* The FWL Theorem: Making Multivariate Regressions Intuitive — Stata companion
*
* This do-file mirrors script.py section by section, so the Python and Stata
* implementations can be read side by side. Every number quoted in a comment
* is the one published in the post (and stored in fwl_results.json); every
* identity the post claims is checked below with -assert-, so the do-file
* stops with an error the moment a claim fails.
*
* Companion post:  https://carlos-mendez.org/post/python_fwl/
* Companions:      script.py            (the Python original)
*                  cheatsheet_stata.do  cheatsheet_python.py  cheatsheet_R.R
*
* Data: 50 simulated stores (numpy default_rng(42)), 4 columns:
*   income    ~ N(50, 10)                 neighborhood income, thousands $
*   dayofweek ~ U{1, ..., 7}
*   coupons   = 60 - 0.5*income + N(0, 5)  coupon usage, %
*   sales     = 10 + 0.2*coupons + 0.3*income + 0.5*dayofweek + N(0, 3)
* The true effect of coupons on sales is +0.2.
*
* Usage (batch):
*   "/Applications/Stata/StataSE.app/Contents/MacOS/stata-se" -b do analysis.do
* Run time: about 2 seconds. Besides the batch log, nothing is written to disk
*           unless EXPORT is 1.
* Requires: nothing beyond official Stata. (cheatsheet_stata.do optionally uses
*           reghdfe:  . ssc install reghdfe   . ssc install ftools)
* Verified with: Python 3.13 / R 4.5 / Stata 19 (this file: Stata 19 SE).
*==============================================================================

clear all
set more off
set linesize 100
set varabbrev off          // never let a scalar name resolve to a variable
version 14                 // runiformint() in section 11 needs Stata 14+

global EXPORT 0            // 1 = export the section-10 graph as a PNG

* Only the naive and full regressions print the full ANOVA header; every other
* -regress- uses -noheader- so the log stays focused on the coefficient tables.

* Site palette (RGB) for the optional graph
global BLUE   "106 155 204"   // #6a9bcc steel blue
global ORANGE "217 119 87"    // #d97757 warm orange

global url "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/python_fwl/data/fwl_store_data.csv"

* Print "label ...... value" at the post's 4-decimal precision.
capture program drop show
program define show
    gettoken label 0 : 0
    display as text %-46s "`label'" as result %10.4f `0'
end


*==============================================================================
* 0. SETUP AND DATA
*    Local copy first (the Quarto zip ships the CSV flat; the post folder keeps
*    it under data/), then the raw GitHub URL.
*
*    -asdouble- is not optional. The CSV stores 2-decimal values such as 37.37,
*    which are not exactly representable in binary. Stata's default float
*    import keeps about 7 significant digits (37.37 becomes 37.369998931884766),
*    so every coefficient drifts in its 7th decimal: invisible at 4 decimals,
*    but enough to fail any 1e-8 comparison with the Python and R numbers.
*==============================================================================
capture confirm file "fwl_store_data.csv"
if !_rc {
    local src "fwl_store_data.csv"
}
else {
    capture confirm file "data/fwl_store_data.csv"
    if !_rc {
        local src "data/fwl_store_data.csv"
    }
    else {
        local src "$url"
    }
}
display as text "Loading: `src'"
import delimited "`src'", clear asdouble

assert _N == 50
confirm numeric variable sales coupons income dayofweek


*==============================================================================
* 1. DESCRIBE AND SUMMARIZE
*    Published means: sales 33.61, coupons 33.84, income 50.91, dayofweek 3.92
*==============================================================================
describe
summarize sales coupons income dayofweek

quietly summarize sales
scalar m_sales = r(mean)
quietly summarize coupons
scalar m_coupons = r(mean)


*==============================================================================
* 2. THE NAIVE RELATIONSHIP
*    Published: -0.1059 (SE 0.1158, p 0.365). Coupons appear to LOWER sales.
*==============================================================================
regress sales coupons
scalar b_naive  = _b[coupons]
scalar se_naive = _se[coupons]
show "Naive slope (sales on coupons)" b_naive
show "  its SE" se_naive


*==============================================================================
* 3. CONTROLLING FOR INCOME
*    Published: coupons +0.2673 (SE 0.1203, p 0.031); income +0.3836.
*    The sign flips — a textbook Simpson's paradox.
*==============================================================================
regress sales coupons income
scalar b_full  = _b[coupons]
scalar se_full = _se[coupons]
scalar g_hat   = _b[income]
show "Full slope (sales on coupons + income)" b_full
show "  its SE" se_full
show "Income coefficient, gamma_hat" g_hat


*==============================================================================
* 4. WHERE THE BIAS COMES FROM: THE OMITTED-VARIABLE-BIAS IDENTITY
*
*    naive = full + gamma_hat * delta_hat          (exact, in the sample)
*
*    gamma_hat : income's coefficient in the FULL regression   = 0.3836
*    delta_hat : slope from regressing the OMITTED variable (income) ON the
*                included one (coupons)                         = -0.9730
*    product   : -0.3732 = naive - full = -0.1059 - 0.2673
*
*    Population check: Var(coupons) = 0.25*100 + 25 = 50 and
*    Cov(income, coupons) = -0.5*100 = -50, so delta = -1.0 and
*    plim naive = 0.2 + 0.3*(-1.0) = -0.10.
*==============================================================================
regress income coupons, noheader
scalar d_hat = _b[coupons]
show "delta_hat (income ON coupons)" d_hat
show "gamma_hat * delta_hat" g_hat*d_hat
show "naive - full" b_naive - b_full
assert reldif(g_hat*d_hat, b_naive - b_full) < 1e-8

* THE DIRECTION TRAP. Regressing coupons on income is the natural-looking
* auxiliary regression (it is FWL's first step), but it is the wrong one for
* the OVB formula: -0.3935 x 0.3836 = -0.1510, which reconciles nothing.
regress coupons income, noheader
scalar d_wrong = _b[income]
show "WRONG direction: coupons ON income" d_wrong
show "  gamma_hat * wrong slope (reconciles nothing)" g_hat*d_wrong
assert abs(g_hat*d_wrong - (b_naive - b_full)) > 0.1


*==============================================================================
* 5. FWL STEP 1 — RESIDUALIZE COUPONS ONLY
*    Published: 0.2673 with SE 1.2715 (p 0.834). Same coefficient, useless SE.
*
*    Why the SE explodes: -noconstant- forces the line through the origin, but
*    sales has mean 33.6, so the residuals carry the whole level of sales and
*    the residual variance is enormous. Add the intercept back and the SE falls
*    to 0.1437 — about 98% of the gap to the full-model SE closes. What is left
*    is sales' own dependence on income, which Step 2 removes.
*==============================================================================
quietly regress coupons income         // shown in section 4
predict double ct, residuals           // coupons, income partialled out

regress sales ct, noconstant noheader
scalar b_s1  = _b[ct]
scalar se_s1 = _se[ct]
show "Step 1: sales on ct, no intercept" b_s1
show "  its SE (the blow-up)" se_s1
assert reldif(b_s1, b_full) < 1e-8

regress sales ct, noheader
scalar se_s1c = _se[ct]
show "Step 1 + intercept: SE" se_s1c
assert reldif(_b[ct], b_full) < 1e-8

generate double sdm = sales - m_sales  // demeaned sales, still no intercept
regress sdm ct, noconstant noheader
scalar se_s1d = _se[ct]
show "Step 1, demeaned sales, no intercept: SE" se_s1d
show "Share of the SE gap closed by the intercept" (se_s1 - se_s1c)/(se_s1 - se_full)

* Residualized coupons are UNCORRELATED with income by construction (OLS
* residuals are orthogonal to every regressor). That is not the same as
* independent: only the linear association is removed.
correlate ct income
assert abs(r(rho)) < 1e-10


*==============================================================================
* 6. FWL STEP 2 — RESIDUALIZE BOTH
*    Published: 0.2673, SE 0.1178 (p 0.028).
*
*    The residuals here are IDENTICAL to the full model's residuals. The SE
*    differs only because -regress, noconstant- divides the residual sum of
*    squares by 50 - 1 = 49, while the full model spends two more degrees of
*    freedom (intercept + income) and divides by 47. Hence
*        0.1178 * sqrt(49/47) = 0.1203        and   0.1178/0.1203 = sqrt(47/49).
*==============================================================================
regress sales income, noheader
predict double st, residuals           // sales, income partialled out

regress st ct, noconstant noheader
scalar b_s2  = _b[ct]
scalar se_s2 = _se[ct]
show "Step 2: st on ct, no intercept" b_s2
show "  its SE (df = 49)" se_s2
show "  SE x sqrt(49/47) = full-model SE" se_s2*sqrt(49/47)
show "  SE ratio step2/full = sqrt(47/49)" se_s2/se_full
assert reldif(b_s2, b_full) < 1e-8
assert reldif(se_s2*sqrt(49/47), se_full) < 1e-8

* Same residuals as the full model, observation by observation
quietly regress sales coupons income
predict double e_full, residuals
quietly regress st ct, noconstant
predict double e_s2, residuals
assert reldif(e_full, e_s2) < 1e-8


*==============================================================================
* 7. FWL BY HAND
*    beta = Cov(st, ct) / Var(ct) = 3.9380 / 14.7320 = 0.2673
*    (both with the n - 1 denominator, which cancels)
*==============================================================================
correlate st ct, covariance
scalar cov_sc = r(cov_12)
scalar var_c  = r(Var_2)
show "Cov(st, ct)" cov_sc
show "Var(ct)" var_c
show "Cov / Var" cov_sc/var_c
assert reldif(cov_sc/var_c, b_full) < 1e-8

* Matrix form: (ct'ct)^-1 ct'st
matrix accum XX  = ct, noconstant
matrix vecaccum yX = st ct, noconstant
matrix B = yX * invsym(XX)
show "Matrix form (ct'ct)^-1 ct'st" B[1,1]
assert reldif(B[1,1], b_full) < 1e-8


*==============================================================================
* 8. SCALING FOR INTERPRETABILITY
*    Adding each variable's mean back to its residual moves the cloud to the
*    original units without changing the slope: 0.2673 (SE 0.1190, p 0.029).
*==============================================================================
generate double cs = ct + m_coupons
generate double ss = st + m_sales
regress ss cs, noheader
show "Scaled residuals slope" _b[cs]
assert reldif(_b[cs], b_full) < 1e-8


*==============================================================================
* 9. EXTENDING TO MULTIPLE CONTROLS: income + dayofweek
*    Published: full 0.2706 (SE 0.1194); FWL 0.2706 (SE 0.1157).
*
*    Why the coefficient moves only from 0.2673 to 0.2706: the OVB identity of
*    section 4, one control up,
*
*        one-control coef = two-control coef + gamma_dow * delta_dow
*
*    gamma_dow : dayofweek's coefficient in the two-control model = 0.3195
*                (p 0.198)
*    delta_dow : coupons coefficient in dayofweek ~ coupons + income = -0.0101,
*                the PARTIAL association of dayofweek with coupons once income
*                is held fixed (partial corr -0.021)
*    product   : 0.3195 x (-0.0101) = -0.0032 = 0.2673 - 0.2706
*
*    The raw corr(dayofweek, coupons) = -0.076 is not the relevant quantity.
*    dayofweek is independent of coupons and income in the DGP, so the shift is
*    a small chance association that would vanish in large samples.
*==============================================================================
regress sales coupons income dayofweek, noheader
scalar b_two  = _b[coupons]
scalar se_two = _se[coupons]
scalar g_dow  = _b[dayofweek]
show "Full, two controls" b_two
show "  its SE (df = 46)" se_two

quietly regress coupons income dayofweek
predict double ct2, residuals
quietly regress sales income dayofweek
predict double st2, residuals
regress st2 ct2, noconstant noheader
show "FWL, two controls" _b[ct2]
show "  its SE (df = 49)" _se[ct2]
show "  SE x sqrt(49/46)" _se[ct2]*sqrt(49/46)
assert reldif(_b[ct2], b_two) < 1e-8
assert reldif(_se[ct2]*sqrt(49/46), se_two) < 1e-8

regress dayofweek coupons income, noheader
scalar d_dow = _b[coupons]
show "gamma_dow (dayofweek, two-control model)" g_dow
show "delta_dow (dayofweek on coupons | income)" d_dow
show "gamma_dow * delta_dow" g_dow*d_dow
show "one control - two controls" b_full - b_two
assert reldif(g_dow*d_dow, b_full - b_two) < 1e-8

quietly regress dayofweek income
predict double dowt, residuals          // dayofweek, income partialled out
quietly correlate dowt ct
display as text %-46s "partial corr(dayofweek, coupons | income)" as result %10.3f r(rho)
quietly correlate dayofweek coupons
display as text %-46s "raw corr(dayofweek, coupons), for contrast" as result %10.3f r(rho)


*==============================================================================
* 10. VISUALIZING THE PARTIALLED-OUT RELATIONSHIP (optional export)
*     The FWL plot: residual sales against residual coupons. Its OLS slope is
*     the full-model coefficient, 0.2673. The graph is drawn in memory; it is
*     written to disk only when EXPORT is 1.
*==============================================================================
twoway (scatter ss cs, mcolor("$BLUE") msize(medium))              ///
       (lfit ss cs, lcolor("$ORANGE") lwidth(thick)),               ///
       xtitle("Coupon usage (%, income partialled out + mean)")     ///
       ytitle("Daily sales (thousands USD, income partialled out + mean)") ///
       title("Conditional relationship after partialling-out income") ///
       legend(order(1 "Stores" 2 "Linear fit")) name(g_fwl, replace)

if $EXPORT == 1 {
    graph export "fwl_partialled_out_stata.png", name(g_fwl) width(1600) replace
}


*==============================================================================
* SUMMARY — six of the eight rows of the post's results table. The other two,
* FWL by hand (NumPy) and FWL (+ income + day), are checked in sections 7
* and 9.
*==============================================================================
display _n as text "{hline 60}"
display as text %-40s "Specification" %10s "coef" %10s "SE"
display as text "{hline 60}"
display as text %-40s "Naive (no controls)"           as result %10.4f b_naive %10.4f se_naive
display as text %-40s "Full (+ income)"               as result %10.4f b_full  %10.4f se_full
display as text %-40s "FWL Step 1 (no intercept)"     as result %10.4f b_s1    %10.4f se_s1
display as text %-40s "FWL Step 1 + intercept"        as result %10.4f b_full  %10.4f se_s1c
display as text %-40s "FWL Step 2 (residualize both)" as result %10.4f b_s2    %10.4f se_s2
display as text %-40s "Full (+ income + day)"         as result %10.4f b_two   %10.4f se_two
display as text "{hline 60}"
display as text "All identities asserted above hold."


*==============================================================================
* 11. APPENDIX — THE SAME DGP, SIMULATED NATIVELY IN STATA
*     Stata's random-number stream is not numpy's, so set seed 42 here gives
*     DIFFERENT stores and DIFFERENT estimates from the post. The point is the
*     recipe, not the digits: FWL still reproduces the full-model coefficient
*     exactly, and the naive slope is still biased downward.
*==============================================================================
clear
set obs 50
set seed 42
generate double income    = rnormal(50, 10)
generate        dayofweek = runiformint(1, 7)
generate double coupons   = 60 - 0.5*income + rnormal(0, 5)
generate double sales     = 10 + 0.2*coupons + 0.3*income + 0.5*dayofweek ///
                            + rnormal(0, 3)
foreach v of varlist income coupons sales {
    replace `v' = round(`v', 0.01)
}

quietly regress sales coupons
scalar sim_naive = _b[coupons]
quietly regress sales coupons income
scalar sim_full = _b[coupons]
quietly regress coupons income
predict double sim_ct, residuals
quietly regress sales income
predict double sim_st, residuals
quietly regress sim_st sim_ct, noconstant
scalar sim_fwl = _b[sim_ct]
assert reldif(sim_fwl, sim_full) < 1e-8

display _n as text "Native Stata simulation (numbers differ from the post by design):"
show "  naive slope" sim_naive
show "  full slope (+ income)" sim_full
show "  FWL slope (residualize both)" sim_fwl

display _n as text "=== done ==="
