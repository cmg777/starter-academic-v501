*===============================================================================
* THE FRISCH-WAUGH-LOVELL THEOREM IN STATA — a one-page cheat sheet
*
* Companion to https://carlos-mendez.org/post/python_fwl/
* Companions:  cheatsheet_python.py   cheatsheet_R.R
*              analysis.do (the full, commented Stata port of the post)
*
* The Stata port of cheatsheet_python.py: same CSV, same sections, same
* comparison table at the end, so the three files can be read side by side.
*
* Install (optional; section 9 falls back to the built-in -areg-):
*   . ssc install reghdfe
*   . ssc install ftools
*
* Usage (batch):
*   "/Applications/Stata/StataSE.app/Contents/MacOS/stata-se" -b do cheatsheet_stata.do
* Run time: about 2 seconds. Besides the batch log, nothing is written to disk
*           unless EXPORT is 1.
* Verified with: Python 3.13 / R 4.5 / Stata 19 (reghdfe 6.13)
*
* Contents
*   0.  Vocabulary in thirty seconds
*   1.  Load the data (local copy, then URL) or simulate it natively
*   2.  Naive vs full
*   3.  The OVB identity (and the direction trap)
*   4.  FWL in three lines
*   5.  FWL by hand
*   6.  Standard errors: the intercept trap and the df correction
*   7.  Multiple controls
*   8.  The partialled-out plot
*   9.  Fixed effects are FWL too
*   10. Traps that silently give wrong answers
*   Comparison table (identical in all three cheat sheets)
*===============================================================================

clear all
set more off
set linesize 100
set varabbrev off        // a typo must not silently match another variable
version 14               // runiformint() needs Stata 14+

global EXPORT   0        // 1 = export the section-8 graph as a PNG
global SIMULATE 0        // 1 = Stata's own set seed 42 draw (numbers will differ)

capture program drop show
program define show
    gettoken label 0 : 0
    display as text %-44s "`label'" as result %10.4f `0'
end


*-------------------------------------------------------------------------------
* 0. VOCABULARY IN THIRTY SECONDS
*
*   Partialling-out ..... regress X1 on the controls and keep the residual: the
*                         part of X1 the controls cannot predict. Also called
*                         residualizing or orthogonalizing.
*   FWL theorem ......... the coefficient on X1 in  y X1 X2  equals the slope of
*                         resid(y on X2) on resid(X1 on X2). Exactly, in every
*                         sample, not approximately.
*   Annihilator M2 ...... I - X2 (X2'X2)^-1 X2'. Multiplying by M2 = taking the
*                         residuals on X2 (constant included). Symmetric and
*                         idempotent.
*   OVB ................. naive - full = gamma_hat * delta_hat. gamma_hat is the
*                         omitted variable's coefficient in the full model;
*                         delta_hat is the slope of the OMITTED variable regressed
*                         ON the INCLUDED one.
*   Uncorrelated ........ zero LINEAR association. Residuals are uncorrelated with
*                         the controls by construction, not independent of them.
*   Residual df ......... n minus the parameters estimated. The short FWL
*                         regression does not know you already estimated the
*                         controls, so its df is too large.
*-------------------------------------------------------------------------------


*-------------------------------------------------------------------------------
* 1. LOAD THE DATA (LOCAL COPY, THEN URL) OR SIMULATE IT NATIVELY
*    50 stores. income ~ N(50, 10), dayofweek ~ U{1..7},
*    coupons = 60 - 0.5 income + N(0, 5),
*    sales   = 10 + 0.2 coupons + 0.3 income + 0.5 dayofweek + N(0, 3).
*    The true coupon effect is +0.2.
*-------------------------------------------------------------------------------
global url "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/python_fwl/data/fwl_store_data.csv"

* NUMBERS WILL DIFFER. Same DGP, but Stata's random-number stream is not
* numpy's, so set seed 42 draws different stores from the post's. Use it to see
* that FWL holds in ANY sample, not to reproduce the post.
capture program drop simulate_store_data
program define simulate_store_data
    clear
    quietly set obs 50
    set seed 42
    generate double income    = rnormal(50, 10)
    generate        dayofweek = runiformint(1, 7)
    generate double coupons   = 60 - 0.5*income + rnormal(0, 5)
    generate double sales     = 10 + 0.2*coupons + 0.3*income + 0.5*dayofweek ///
                                + rnormal(0, 3)
    foreach v of varlist income coupons sales {
        quietly replace `v' = round(`v', 0.01)
    }
    order sales coupons income dayofweek
end

* Local copy first (the Quarto zip ships the CSV flat; the post folder keeps
* it under data/), then the URL. ALWAYS asdouble: see trap 8.
local src "$url"
capture confirm file "data/fwl_store_data.csv"
if !_rc local src "data/fwl_store_data.csv"
capture confirm file "fwl_store_data.csv"
if !_rc local src "fwl_store_data.csv"

if $SIMULATE {
    simulate_store_data
    local src "Stata simulation, set seed 42"
}
else {
    capture import delimited "`src'", clear asdouble
    if _rc {                                   // offline: simulate instead
        display as error "Could not read `src'; using simulate_store_data"
        simulate_store_data
        global SIMULATE 1
        local src "Stata simulation (offline)"
    }
}
display as text "Loaded: `src'  (" _N " stores)"
assert _N == 50

preserve
    simulate_store_data
    quietly regress sales coupons
    local sn = _b[coupons]
    quietly regress sales coupons income
    display as text "Native Stata simulation (numbers will differ): naive " ///
        as result %7.4f `sn' as text "  full " as result %7.4f _b[coupons]
restore


*-------------------------------------------------------------------------------
* 2. NAIVE VS FULL
*    Naive -0.1059 (SE 0.1158, p 0.365); full +0.2673 (SE 0.1203, p 0.031);
*    income +0.3836. The sign flips: rich neighborhoods use fewer coupons AND
*    buy more.
*-------------------------------------------------------------------------------
regress sales coupons
scalar b_naive  = _b[coupons]
scalar se_naive = _se[coupons]

regress sales coupons income
scalar b_full  = _b[coupons]
scalar se_full = _se[coupons]
scalar g_hat   = _b[income]

show "Naive slope" b_naive
show "Full slope (+ income)" b_full
show "  its SE" se_full
show "Income in the full model, gamma_hat" g_hat


*-------------------------------------------------------------------------------
* 3. THE OVB IDENTITY (AND THE DIRECTION TRAP)
*    naive - full = gamma_hat * delta_hat holds EXACTLY in the sample:
*    0.3836 x -0.9730 = -0.3732 = -0.1059 - 0.2673.
*    Population: delta = -50/50 = -1.0, so plim naive = 0.2 + 0.3*(-1.0) = -0.10.
*-------------------------------------------------------------------------------
quietly regress income coupons              // omitted ON included
scalar d_hat = _b[coupons]
show "delta_hat (income ON coupons)" d_hat
show "gamma_hat x delta_hat" g_hat*d_hat
show "naive - full" b_naive - b_full
assert reldif(g_hat*d_hat, b_naive - b_full) < 1e-8

* THE TRAP: coupons ON income is FWL's first regression, so it is the one you
* have lying around. Wrong direction for OVB: -0.3935 -> -0.151, reconciles
* nothing.
quietly regress coupons income
show "WRONG: gamma_hat x (coupons ON income)" g_hat*_b[income]


*-------------------------------------------------------------------------------
* 4. FWL IN THREE LINES
*    Residualize both on income (constant included), regress residual on
*    residual: 0.2673, SE 0.1178.
*-------------------------------------------------------------------------------
foreach v in coupons sales {
    quietly regress `v' income
    quietly predict double `v'_t, residuals
}
regress sales_t coupons_t, noconstant noheader

scalar b_s2  = _b[coupons_t]
scalar se_s2 = _se[coupons_t]
assert reldif(b_s2, b_full) < 1e-8
show "FWL (residualize both)" b_s2
show "  its SE" se_s2

* coupons_t is uncorrelated with income by construction:
quietly correlate coupons_t income
assert abs(r(rho)) < 1e-10


*-------------------------------------------------------------------------------
* 5. FWL BY HAND
*    Cov(s_t, c_t) / Var(c_t) = 3.9380 / 14.7320 = 0.2673
*-------------------------------------------------------------------------------
quietly correlate sales_t coupons_t, covariance
show "Cov(sales_t, coupons_t)" r(cov_12)
show "Var(coupons_t)" r(Var_2)
show "Cov / Var" r(cov_12)/r(Var_2)
assert reldif(r(cov_12)/r(Var_2), b_full) < 1e-8

* Matrix form with the annihilator, in Mata (X2 = [income, 1])
mata:
    y  = st_data(., "sales")
    x1 = st_data(., "coupons")
    X2 = st_data(., "income"), J(rows(y), 1, 1)
    M2 = I(rows(y)) - X2 * invsym(X2'X2) * X2'
    st_numscalar("b_mata", (x1' * M2 * y) / (x1' * M2 * x1))
    st_numscalar("idem", mreldif(M2 * M2, M2))
end
show "Matrix form x1'M2y / x1'M2x1" b_mata
assert reldif(b_mata, b_full) < 1e-8
assert idem < 1e-10


*-------------------------------------------------------------------------------
* 6. STANDARD ERRORS: THE INTERCEPT TRAP AND THE DF CORRECTION
*    Same coefficient, 0.2673, in every row. Very different standard errors:
*      Step 1, no intercept      1.2715
*      Step 1 + intercept        0.1437
*      Step 1, demeaned sales    0.1422
*      Step 2, residualize both  0.1178
*      Full model                0.1203
*
*    (a) The blow-up is the DROPPED INTERCEPT, not "outcome variance not yet
*        adjusted": sales has mean 33.6, a no-intercept line must pass through
*        the origin, and the whole level of sales lands in the residuals.
*        Putting the intercept back closes about 98% of the gap.
*    (b) Step 2 has the full model's residuals but divides their sum of
*        squares by 49 instead of 47: the full model also estimated an
*        intercept and income. Rescale by sqrt(49/47) and you are back to 0.1203.
*-------------------------------------------------------------------------------
quietly regress sales coupons_t, noconstant          // Step 1: X only
scalar b_s1  = _b[coupons_t]
scalar se_s1 = _se[coupons_t]
quietly regress sales coupons_t                      // ... + intercept
scalar b_s1c  = _b[coupons_t]
scalar se_s1c = _se[coupons_t]
quietly summarize sales, meanonly
generate double sales_dm = sales - r(mean)
quietly regress sales_dm coupons_t, noconstant       // ... demeaned y
scalar se_s1d = _se[coupons_t]

show "Step 1, no intercept: SE" se_s1
show "Step 1 + intercept: SE" se_s1c
show "Step 1, demeaned sales: SE" se_s1d
show "Step 2, residualize both: SE" se_s2
show "Full model: SE" se_full
show "Step 2 SE x sqrt(49/47)" se_s2*sqrt(49/47)
assert reldif(b_s1, b_full) < 1e-8 & reldif(b_s1c, b_full) < 1e-8
assert reldif(se_s2*sqrt(49/47), se_full) < 1e-8


*-------------------------------------------------------------------------------
* 7. MULTIPLE CONTROLS
*    0.2706 both ways; SE 0.1194 (full) vs 0.1157 (FWL), and
*    0.1157 x sqrt(49/46) = 0.1194.
*    Why 0.2673 -> 0.2706: the OVB identity again, one control up. dayofweek
*    moves sales (0.3195) but, holding income fixed, is almost unrelated to
*    coupons (slope -0.0101, partial corr -0.021), so the two coefficients
*    differ by only 0.3195 x (-0.0101) = -0.0032 = 0.2673 - 0.2706. The raw
*    corr (-0.076) is not the relevant quantity.
*-------------------------------------------------------------------------------
quietly regress sales coupons income dayofweek
scalar b_two  = _b[coupons]
scalar se_two = _se[coupons]
scalar g_dow  = _b[dayofweek]
foreach v in coupons sales {
    quietly regress `v' income dayofweek
    quietly predict double `v'_t2, residuals
}
quietly regress sales_t2 coupons_t2, noconstant
assert reldif(_b[coupons_t2], b_two) < 1e-8
assert reldif(_se[coupons_t2]*sqrt(49/46), se_two) < 1e-8
show "Two controls: full" b_two
show "  its SE" se_two
show "Two controls: FWL" _b[coupons_t2]
show "  its SE (before df fix)" _se[coupons_t2]
quietly regress dayofweek coupons income
scalar d_dow = _b[coupons]
assert reldif(b_full - b_two, g_dow*d_dow) < 1e-8
show "gamma_dow (dayofweek, two-control model)" g_dow
show "delta_dow (dayofweek on coupons | income)" d_dow
show "gamma_dow x delta_dow" g_dow*d_dow
show "  = one control - two controls" b_full - b_two
quietly regress dayofweek income
quietly predict double dow_t, residuals
quietly correlate dow_t coupons_t
display as text %-44s "partial corr(dayofweek, coupons | income)" as result %10.3f r(rho)
quietly correlate dayofweek coupons
display as text %-44s "  (raw corr(dayofweek, coupons))" as result %10.3f r(rho)


*-------------------------------------------------------------------------------
* 8. THE PARTIALLED-OUT PLOT
*    Add the means back so the axes are in real units; the slope is unchanged.
*    Drawn in memory; written to disk only when EXPORT is 1.
*-------------------------------------------------------------------------------
quietly summarize coupons, meanonly
generate double coupons_sc = coupons_t + r(mean)
quietly summarize sales, meanonly
generate double sales_sc = sales_t + r(mean)
quietly regress sales_sc coupons_sc
assert reldif(_b[coupons_sc], b_full) < 1e-8

twoway (scatter sales_sc coupons_sc, mcolor("106 155 204"))            ///
       (lfit sales_sc coupons_sc, lcolor("217 119 87") lwidth(thick)), ///
       xtitle("Coupon usage (%, income partialled out + mean)")        ///
       ytitle("Daily sales (income partialled out + mean)")            ///
       title("The FWL plot: what controlling for income looks like")   ///
       legend(order(1 "Stores" 2 "Linear fit")) name(fwl_plot, replace)
if $EXPORT == 1 {
    graph export "fwl_partialled_out_stata.png", name(fwl_plot) width(1600) replace
}


*-------------------------------------------------------------------------------
* 9. FIXED EFFECTS ARE FWL TOO
*    Seven day-of-week dummies are just seven controls. Partialling them out is
*    subtracting the day mean ("within" transformation), which is what -areg-,
*    -reghdfe-, fixest and pyfixest do under the hood. A DIFFERENT model from
*    section 7 (day as categories, not a linear trend), so the number differs.
*-------------------------------------------------------------------------------
quietly regress sales coupons income i.dayofweek
scalar b_fe  = _b[coupons]
scalar se_fe = _se[coupons]

areg sales coupons income, absorb(dayofweek)
assert reldif(_b[coupons], b_fe) < 1e-8 & reldif(_se[coupons], se_fe) < 1e-8

foreach v in sales coupons income {
    bysort dayofweek: egen double m_`v' = mean(`v')
    generate double w_`v' = `v' - m_`v'
}
quietly regress w_sales w_coupons w_income, noconstant
assert reldif(_b[w_coupons], b_fe) < 1e-8
* df trap again: 50 - 2 = 48 within, 50 - 9 = 41 with the dummies
assert reldif(_se[w_coupons]*sqrt(48/41), se_fe) < 1e-8
show "Day FE: dummies / areg" b_fe
show "  its SE" se_fe
show "Day FE: manual within" _b[w_coupons]
show "  its SE (before df fix)" _se[w_coupons]

capture which reghdfe
if !_rc {
    quietly reghdfe sales coupons income, absorb(dayofweek)
    assert reldif(_b[coupons], b_fe) < 1e-8 & reldif(_se[coupons], se_fe) < 1e-8
    show "reghdfe, absorb(dayofweek): SE, df corrected" _se[coupons]
}
else {
    display as text "reghdfe not installed; skipping (ssc install reghdfe ftools)"
}


*-------------------------------------------------------------------------------
* 10. TRAPS THAT SILENTLY GIVE WRONG ANSWERS
*
*  1. WRONG OVB DIRECTION. delta_hat is the omitted variable ON the included
*     one (regress income coupons: -0.9730). The FWL-shaped regress coupons
*     income (-0.3935) gives -0.151 and reconciles nothing. See section 3.
*
*  2. DROPPING THE INTERCEPT WHEN THE OUTCOME IS NOT RESIDUALIZED.
*     regress sales coupons_t, noconstant returns the right coefficient with a
*     standard error ten times too big (1.2715 vs 0.1203). Keep the constant
*     or residualize y as well.
*
*  3. FORGETTING THE DF CORRECTION. Residual-on-residual SEs divide by n - 1;
*     the full model divides by n - k. Harmless with one control (0.1178 vs
*     0.1203), severe with many fixed effects. Multiply by sqrt((n-1)/(n-k)),
*     or let -areg-/-reghdfe- do it.
*
*  4. "UNCORRELATED" IS NOT "INDEPENDENT". Residualizing removes the LINEAR
*     association with the controls and nothing else. Demo below: a pure
*     function of income, residualized on income, is uncorrelated with income
*     yet still almost entirely determined by it.
*
*  5. LINEAR RESIDUALIZATION CANNOT FIX A MISSPECIFIED OUTCOME EQUATION. If
*     sales has a nonlinear income term that the linear control misses AND
*     that term moves with coupons beyond linear income, FWL reproduces the
*     misspecified full regression exactly, bias included (post Exercise 7b:
*     0.127 vs 0.2). A curve only in the coupon equation is harmless (7a:
*     0.200). FWL is algebra, not identification. Add the missing term, or let
*     Double Machine Learning do both partialling-out regressions with
*     flexible learners and cross-fitting.
*
*  6. THE CONSTANT IS A CONTROL. Residualize with the same control set as the
*     full model, intercept included. regress coupons income, noconstant
*     answers a different question.
*
*  7. SAME ROWS EVERYWHERE. A missing value in ANY model variable makes the
*     auxiliary regressions run on different samples: regress coupons income
*     keeps rows that regress sales income drops, and the slope is wrong
*     without an error. Fit the full model once and -keep if e(sample)-
*     before step 1.
*
*  8. FLOAT IMPORT. import delimited without asdouble stores 37.37 as
*     37.369998931884766. Coefficients drift in the 7th decimal: invisible at
*     4 decimals, fatal to any exact cross-language check. Demo below.
*
*  9. FE DEFAULT STANDARD ERRORS DIFFER ACROSS TOOLS AND VERSIONS (older
*     fixest clustered by the first fixed effect). State the vce() you want.
*-------------------------------------------------------------------------------
quietly summarize income, meanonly
generate double q = (income - r(mean))^2           // a function of income
quietly regress q income
quietly predict double q_t, residuals
quietly correlate q_t income
local rho_inc = r(rho)
quietly correlate q_t q
display as text "Trap 4: corr(q_t, income) = " as result %8.1e `rho_inc' ///
        as text "   corr(q_t, q) = " as result %5.3f r(rho)

if !$SIMULATE {
    preserve
        quietly import delimited "`src'", clear          // float: the trap
        quietly regress sales coupons income
        display as text "Trap 8: float import moves the full slope by " ///
            as result %8.1e _b[coupons] - b_full                        ///
            as text " (asdouble: " as result %12.10f b_full as text ")"
    restore
}


*-------------------------------------------------------------------------------
* COMPARISON TABLE (identical in all three cheat sheets)
*    The Python and R columns are what cheatsheet_python.py and cheatsheet_R.R
*    print. They equal the Stata column to every printed digit because all
*    three read the same CSV; this file checks its own column against them.
*-------------------------------------------------------------------------------
matrix REF = (-0.1059, 0.1158 \ 0.2673, 0.1203 \ 0.2673, 1.2715 \ ///
               0.2673, 0.1437 \ 0.2673, 0.1178 \ 0.2706, 0.1194)   // fwl_results.json
matrix LIVE = J(6, 2, .)
local i 0
foreach m in naive full s1 s1c s2 two {
    local ++i
    matrix LIVE[`i', 1] = b_`m'
    matrix LIVE[`i', 2] = se_`m'
}
local r1 "Naive (no controls)"
local r2 "Full (+ income)"
local r3 "Step 1 (no intercept)"
local r4 "Step 1 + intercept"
local r5 "Step 2 (resid. both)"
local r6 "Two controls (full)"

display _n as text "Coupon coefficient (SE): 50 stores, one CSV, three languages"
display as text "{hline 78}"
display as text %-24s "Row" %-18s "Python" %-18s "R" "Stata"
display as text "{hline 78}"
forvalues i = 1/6 {
    if !$SIMULATE {
        assert string(LIVE[`i',1], "%7.4f") == string(REF[`i',1], "%7.4f")
        assert string(LIVE[`i',2], "%6.4f") == string(REF[`i',2], "%6.4f")
    }
    display as text %-24s "`r`i''"                                          ///
        as result %7.4f REF[`i',1]  " (" %6.4f REF[`i',2]  ")  "            ///
                  %7.4f REF[`i',1]  " (" %6.4f REF[`i',2]  ")  "            ///
                  %7.4f LIVE[`i',1] " (" %6.4f LIVE[`i',2] ")"
}
display as text "{hline 78}"
display as text "Every row: the same coefficient in all three languages. Rows 2-5: the"
display as text "same coefficient, four different standard errors (sections 4 and 6)."
if $SIMULATE display as text "(Stata simulation in use: the Stata column is NOT the post's data.)"
