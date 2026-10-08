*============================================================================
* DIFFERENCE-IN-DIFFERENCES (DiD) IN STATA: a one-page cheat sheet
*
* Companion to https://carlos-mendez.org/tutorials/python_did101/
* Companions: cheatsheet_python.py, cheatsheet_R.R, script.py (post script)
*
* The Stata port of cheatsheet_python.py: same CSVs, same sections, same
* comparison table at the end, so the three files can be read side by side.
*
* Install: nothing. Built-in commands only (regress, xtreg, etable).
*
* Usage: inside Stata,  . do cheatsheet_stata.do
*   or in batch mode,  stata-se -b do cheatsheet_stata.do  (on macOS the
*   binary is in /Applications/Stata/StataSE.app/Contents/MacOS/). The batch
*   log starts with your license details: do not commit or share it.
* Run time: about 5 seconds. Besides the batch log, the only files written
*           are the figure and the LaTeX table, both in c(tmpdir).
* Verified with: Python 3.11 / R 4.5 / Stata 19
*
* Contents
*   0.  Vocabulary in thirty seconds
*   1.  Load the data (local copy, then URL)
*   2.  The naive before-after comparison
*   3.  The 2x2 DiD by hand
*   4.  DiD as a regression: every coefficient is a group mean
*   5.  Two-way fixed effects
*   6.  Adding a covariate
*   7.  Four standard errors (and what CRV3 really computes)
*   8.  Regression tables (text and LaTeX)
*   9.  The event study
*   10. The event-study plot
*   11. Traps that silently give wrong answers
*   Comparison table (identical in all three cheat sheets)
*============================================================================

clear all
set more off
set linesize 100
set varabbrev off        // a typo must not silently match another variable
version 17               // etable needs 17+


*-------------------------------------------------------------------------------
* 0. VOCABULARY IN THIRTY SECONDS
*
*   DiD ................. (treated after - treated before)
*                         - (comparison after - comparison before). The second
*                         difference removes the trend both groups share.
*   ATT ................. average treatment effect on the TREATED schools. DiD
*                         identifies the ATT, not the ATE.
*   Parallel trends ..... without the program, treated schools would have moved
*                         like the comparison schools. Levels may differ; trends
*                         may not. It is an assumption about an unobserved
*                         counterfactual, so no test can prove it.
*   Counterfactual ...... treated pre-period mean + comparison group's change.
*   TWFE ................ y on D with unit and period fixed effects; they absorb
*                         treated and post, leaving the interaction.
*   Event study ......... one coefficient per period relative to adoption,
*                         measured against a reference period (here t = -1).
*   CRV1 / CRV3 ......... cluster-robust variances (clusters = schools). CRV3
*                         is a leave-one-school-out jackknife.
*   Absorbing treatment . once a school starts the program it stays treated.
*-------------------------------------------------------------------------------


*-------------------------------------------------------------------------------
* 1. LOAD THE DATA (LOCAL COPY, THEN URL)
*    Corral & Yang (2024): 35 high schools, 10 adopt an after-school tutoring
*    program at the same time. gpa = average GPA of low-income students (nominally 0-100;
*    the simulated event-study file reaches 107.68).
*      tutoring_did.csv       35 schools x 2 periods  (the 2x2 design)
*      tutoring_didevent.csv  35 schools x 8 periods  (the event study; adoption
*                             in period 5; timeToTreat is empty for comparison
*                             schools and imports as missing)
*    ALWAYS asdouble: see trap 10.
*-------------------------------------------------------------------------------
global BASE "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/tutorials/python_did101/data/"

capture program drop load_csv
program define load_csv
    args name
    local src "$BASE`name'"
    capture confirm file "data/`name'"
    if !_rc local src "data/`name'"
    capture confirm file "`name'"
    if !_rc local src "`name'"
    quietly import delimited "`src'", clear asdouble case(preserve)
    display as text "Loaded: `src' (" _N " x " c(k) ")"
end

load_csv tutoring_did.csv
assert _N == 70 & c(k) == 7
xtset id time
assert "`r(balanced)'" == "strongly balanced"
bysort id (treated): assert treated[1] == treated[_N]      // fixed groups
assert txp == treated * post
quietly levelsof id if treated == 1
display as text "Treated schools: " r(r) " of 35"           // 10 of 35


*-------------------------------------------------------------------------------
* 2. THE NAIVE BEFORE-AFTER COMPARISON
*-------------------------------------------------------------------------------
forvalues g = 0/1 {
    forvalues p = 0/1 {
        quietly summarize gpa if treated == `g' & post == `p', meanonly
        scalar m`g'`p' = r(mean)
    }
}
scalar naive = m11 - m10
display as text _n "Treated schools: " %5.2f m10 " -> " %5.2f m11 ///
    ", naive change " %5.2f naive                       // 60.17 -> 96.37, 36.20

* The same number as a regression on the treated schools only. Its SE is SMALL:
* the naive estimate is precise, just biased.
quietly regress gpa post if treated == 1
assert reldif(_b[post], naive) < 1e-10
scalar b_naive  = _b[post]
scalar se_naive = _se[post]
display as text "As a regression: " %7.4f b_naive " (SE " %6.4f se_naive ")"
* 36.2008 (0.5252)


*-------------------------------------------------------------------------------
* 3. THE 2x2 DID BY HAND
*-------------------------------------------------------------------------------
scalar trend = m01 - m00                    // comparison schools' change
scalar cf    = m10 + trend                  // counterfactual
scalar did   = m11 - cf
display as text _n "Comparison schools: " %5.2f m00 " -> " %5.2f m01 ///
    ", trend " %6.3f trend                              // 71.22 -> 82.10, 10.886
display as text "Counterfactual " %5.2f cf ", DiD " %7.4f did   // 71.05, 25.3149
display as text "Naive overstates DiD by " %2.0f 100*(naive/did - 1) "%"   // 43%

* ROUNDING: the post's 10.88 and 25.32 are differences of means ROUNDED to two
* decimals (82.10 - 71.22, 36.20 - 10.88). Unrounded: 10.886 and 25.315.
assert string(round(m01, .01) - round(m00, .01), "%5.2f") == "10.88"
assert string(did, "%6.3f") == "25.315"


*-------------------------------------------------------------------------------
* 4. DID AS A REGRESSION: EVERY COEFFICIENT IS A GROUP MEAN
*    vce(robust) after regress = HC1 (n / (n - k) small-sample factor).
*-------------------------------------------------------------------------------
regress gpa treated post txp, vce(robust)
assert reldif(_b[_cons],   m00)       < 1e-10           // comparison, pre
assert reldif(_b[treated], m10 - m00) < 1e-10           // baseline gap
assert reldif(_b[post],    trend)     < 1e-10           // common trend
assert reldif(_b[txp],     did)       < 1e-10           // the DiD
scalar b_ols  = _b[txp]
scalar se_ols = _se[txp]
estimates store ols
* 71.215, -11.049, 10.886, 25.3149 (HC1 SE 0.6150)


*-------------------------------------------------------------------------------
* 5. TWO-WAY FIXED EFFECTS
*    School FE absorb treated, period FE absorb post. Balanced 2x2: the
*    coefficient is IDENTICAL to the OLS interaction; only the SE changes.
*    xtreg, fe absorbs the school FE; i.time adds the period FE. Its cluster
*    df correction does not count FE nested in the clusters, like fixest.
*-------------------------------------------------------------------------------
xtreg gpa txp i.time, fe vce(cluster id)
assert reldif(_b[txp], did) < 1e-10
scalar b_twfe  = _b[txp]
scalar se_twfe = _se[txp]
estimates store twfe
quietly regress gpa txp i.id i.time                     // same model as LSDV
scalar r2_lsdv = e(r2)
scalar rss     = e(rss)
* WITHIN R2. fixest and pyfixest report the R2 after removing BOTH sets of
* fixed effects. xtreg's e(r2_w) removes only the school FE and counts the
* period dummies as regressors, so it says 0.995. Two-way demeaning of a
* balanced panel: y - mean_i - mean_t + overall mean.
bysort id:   egen double ybar_i = mean(gpa)
bysort time: egen double ybar_t = mean(gpa)
quietly summarize gpa
generate double y_ww2 = (gpa - ybar_i - ybar_t + r(mean))^2
quietly summarize y_ww2
scalar r2_w = 1 - rss / r(sum)
drop ybar_i ybar_t y_ww2
display as text "TWFE: " %7.4f b_twfe " (CRV1 SE " %6.4f se_twfe "), R2 " ///
    %5.3f r2_lsdv ", within R2 " %5.3f r2_w          // 25.3149 (0.5851), 0.995, 0.981


*-------------------------------------------------------------------------------
* 6. ADDING A COVARIATE
*-------------------------------------------------------------------------------
xtreg gpa txp female_share i.time, fe vce(cluster id)
scalar b_cov  = _b[txp]
scalar se_cov = _se[txp]
estimates store twfe_cov
display as text "+ female_share: " %7.4f b_cov " (SE " %6.4f se_cov ///
    "); female_share " %6.3f _b[female_share] ", p = " ///
    %5.3f 2*ttail(e(df_r), abs(_b[female_share]/_se[female_share]))
* 25.3281 (0.6048); -3.216, p = 0.714. The estimate moves by 0.013.
* Stability is the reassuring part. An insignificant covariate does NOT show
* that the fixed effects "capture everything", and a covariate the program
* itself can move (a bad control) should be measured before treatment.


*-------------------------------------------------------------------------------
* 7. FOUR STANDARD ERRORS (AND WHAT CRV3 REALLY COMPUTES)
*    Same coefficient, 25.3149, four variance estimators. N = 70, G = 35.
*-------------------------------------------------------------------------------
matrix SE_REF = (0.6071, 0.5852, 0.5851, 0.6373)    // iid HC1 CRV1 CRV3 = Python = R

quietly xtreg gpa txp i.time, fe                    // iid: df = 70 - 35 - 2 = 33
scalar se_iid = _se[txp]
quietly regress gpa txp i.id i.time, vce(robust)    // HC1 with all 37 parameters
scalar se_hc1 = _se[txp]
* NOT xtreg, fe vce(robust): after xtreg that silently means CLUSTER (trap 4).

* CRV3 by hand: drop one school, re-estimate, repeat 35 times. pyfixest centres
* the 35 estimates on the FULL-sample estimate and multiplies by the same
* small-sample factor xtreg applies to CRV1:  G/(G-1) x (N-1)/(N-K) =
* 35/34 x 69/67, K = 3 (txp, one period dummy, the constant).
scalar G = 35
scalar N = 70
scalar K = 3
scalar ss_est  = 0
scalar ss_mean = 0
scalar sum_b   = 0
matrix BDROP = J(35, 1, .)
forvalues g = 1/35 {
    quietly xtreg gpa txp i.time if id != `g', fe
    matrix BDROP[`g', 1] = _b[txp]
    scalar ss_est = ss_est + (_b[txp] - did)^2
    scalar sum_b  = sum_b + _b[txp]
}
forvalues g = 1/35 {
    scalar ss_mean = ss_mean + (BDROP[`g', 1] - sum_b/G)^2
}
scalar se_crv3 = sqrt(G/(G-1) * (N-1)/(N-K) * ss_est)
scalar se_jk   = sqrt((G-1)/G * ss_mean)

* Stata's own jackknife (delete one panel at a time) centres on the MEAN of
* the 35 estimates and uses (G-1)/G: a different number (trap 6).
quietly xtreg gpa txp i.time, fe vce(jackknife)
assert reldif(_se[txp], se_jk) < 1e-5     // agrees to 6 significant digits

matrix SE_LIVE = (se_iid, se_hc1, se_twfe, se_crv3)
local names "iid HC1 CRV1 CRV3"
display ""
forvalues j = 1/4 {
    assert string(SE_LIVE[1, `j'], "%6.4f") == string(SE_REF[1, `j'], "%6.4f")
    local nm : word `j' of `names'
    display as text "  " %-5s "`nm'" " SE " as result %6.4f SE_LIVE[1, `j'] ///
        as text "   t " %5.2f did / SE_LIVE[1, `j']
}
display as text "  CRV3 by hand " %6.4f se_crv3 ///
    "  (Stata's vce(jackknife) definition: " %6.4f se_jk ")"   // 0.6373 (0.6101)

* What matters for inference is the 10 TREATED schools, not the 35 clusters:
* with few treated clusters CRV1 understates uncertainty. Prefer CRV3 or the
* wild cluster bootstrap (ssc install boottest; boottest txp after regress).


*-------------------------------------------------------------------------------
* 8. REGRESSION TABLES (TEXT AND LATEX)
*    etable (Stata 17+) collects stored estimates; export() writes LaTeX.
*-------------------------------------------------------------------------------
etable, estimates(ols twfe twfe_cov) keep(txp female_share) ///
    stars(.05 "*" .01 "**" .001 "***", attach(_r_b)) showstarsnote ///
    mstat(N) cstat(_r_b, nformat(%7.3f)) cstat(_r_se, nformat(%7.3f))
local tex "`c(tmpdir)'/did101_table_stata.tex"
quietly etable, estimates(ols twfe twfe_cov) keep(txp female_share) ///
    stars(.05 "*" .01 "**" .001 "***", attach(_r_b)) mstat(N)       ///
    export("`tex'", replace)
display as text "LaTeX table written to `tex'"


*-------------------------------------------------------------------------------
* 9. THE EVENT STUDY
*    One dummy per event time, t = -1 omitted. Stata factor variables cannot be
*    negative (trap 10), so build the dummies by hand. For comparison schools timeToTreat
*    is missing and (missing == -4) is FALSE, so they get 0 on every dummy and
*    stay in the sample (contrast trap 1 in Python and R).
*-------------------------------------------------------------------------------
load_csv tutoring_didevent.csv
assert _N == 280
xtset id time
local ev_names ""
foreach k in -4 -3 -2 0 1 2 3 {
    local nm = cond(`k' < 0, "lead" + string(-`k'), "lag" + string(`k'))
    generate byte `nm' = (timeToTreat == `k')
    local ev_names "`ev_names' `nm'"
}
xtreg gpa `ev_names' i.time, fe vce(cluster id)
assert e(N) == 280
matrix ES_B  = J(7, 1, .)
matrix ES_SE = J(7, 1, .)
local i = 0
display as text _n "Event study (CRV1 by school), N = " e(N)
foreach nm of local ev_names {
    local ++i
    matrix ES_B[`i', 1]  = _b[`nm']
    matrix ES_SE[`i', 1] = _se[`nm']
    local t : word `i' of -4 -3 -2 0 1 2 3
    display as text "  t = " %2s "`t'" "  " as result %7.3f _b[`nm'] ///
        as text "  [" %6.2f _b[`nm'] - invttail(e(df_r), .025)*_se[`nm'] ///
        ", " %6.2f _b[`nm'] + invttail(e(df_r), .025)*_se[`nm'] "]  p = " ///
        %5.3f 2*ttail(e(df_r), abs(_b[`nm']/_se[`nm']))
}
* Leads 0.342, -0.322, 0.593 (all p > 0.17): CONSISTENT with parallel trends,
* not proof of it. Lags 25.03, 24.71, 24.77, 25.70: roughly flat, no fade-out.

scalar lead_avg = (ES_B[1,1] + ES_B[2,1] + ES_B[3,1] + 0) / 4
scalar lag_avg  = (ES_B[4,1] + ES_B[5,1] + ES_B[6,1] + ES_B[7,1]) / 4
display as text "  mean(lags) - mean(leads incl. ref) = " %6.3f lag_avg - lead_avg


*-------------------------------------------------------------------------------
* 10. THE EVENT-STUDY PLOT
*-------------------------------------------------------------------------------
preserve
clear
quietly set obs 8
generate t  = _n - 5                                   // -4 ... 3
generate b  = 0
generate lo = 0
generate hi = 0
local df = 34                                          // G - 1, as above
local r = 0
forvalues i = 1/8 {
    if `i' == 4 continue                               // t = -1, the reference
    local ++r
    quietly replace b  = ES_B[`r',1] in `i'
    quietly replace lo = ES_B[`r',1] - invttail(`df', .025)*ES_SE[`r',1] in `i'
    quietly replace hi = ES_B[`r',1] + invttail(`df', .025)*ES_SE[`r',1] in `i'
}
twoway (rcap lo hi t if t != -1, lcolor("106 155 204"))                    ///
       (scatter b t, mcolor("106 155 204")),                              ///
       yline(0, lcolor("20 20 19") lpattern(solid))                       ///
       xline(-0.5, lpattern(dash) lcolor("217 119 87")) xlabel(-4(1)3)    ///
       xtitle("Periods relative to adoption (t = -1 is the reference)")    ///
       ytitle("Effect on GPA (points)") title("Event study: tutoring and GPA") ///
       legend(off) name(event_study, replace)
local png "`c(tmpdir)'/did101_event_study_cheatsheet_stata.png"
quietly graph export "`png'", name(event_study) width(1200) replace
display as text _n "Figure saved to" _n "  `png'"
restore


*-------------------------------------------------------------------------------
* 11. TRAPS THAT SILENTLY GIVE WRONG ANSWERS
*
*  1. LEAVING THE COMPARISON SCHOOLS' EVENT TIME MISSING. In Python and R the
*     missing rows are dropped and the event study fails. In Stata, i.timeToTreat
*     also drops them; the hand-built dummies above do not, because
*     (missing == k) is 0. Check e(N) after every event study.
*
*  2. "INSIGNIFICANT LEADS PROVE PARALLEL TRENDS." They are consistent with it.
*     With 10 treated schools a one-point pre-trend would still sit inside the
*     t = -2 interval [-0.27, 1.45] (Roth 2022, "Pretest with caution").
*
*  3. MISREADING THE REFERENCE PERIOD. Every event-study coefficient is a gap
*     RELATIVE TO t = -1. "Immediate effect" means "at t = 0 relative to t = -1".
*
*  4. HC1 IN A PANEL, AND xtreg's "robust". regress ..., vce(robust) treats a
*     school's two observations as independent. xtreg, fe vce(robust) silently
*     CLUSTERS by the panel variable. Say vce(cluster id) when you mean it.
*
*  5. FEW TREATED CLUSTERS. 35 clusters looks comfortable, but only 10 are
*     treated. CRV1 can understate uncertainty; use CRV3 or boottest.
*
*  6. "CRV3" IS NOT ONE NUMBER ACROSS PACKAGES. pyfixest: jackknife centred on
*     the full-sample estimate x the CRV1 factor (0.6373). Stata's
*     xtreg, fe vce(jackknife): centred on the replicate mean x (G-1)/G
*     (0.6101). Section 7 reproduces both.
*
*  7. CLUSTER DF WITH ABSORBED FE. regress ... i.id, vce(cluster id) counts the
*     35 school dummies in K and inflates the SE; xtreg, fe and reghdfe do not,
*     matching fixest and pyfixest. Demo below.
*
*  8. ROUNDED MEANS. 36.20 - 10.88 = 25.32 uses means rounded to 2 decimals;
*     the regression says 25.315. Round at the end, not in the middle.
*
*  9. STAGGERED ADOPTION. Here every school adopts in period 5, so TWFE is fine.
*     With staggered adoption AND effects that vary across cohorts or time,
*     TWFE can be badly biased (Goodman-Bacon 2021); use hdidregress /
*     xthdidregress (Stata 18+), csdid or did_imputation.
*
* 10. FLOAT IMPORT AND NEGATIVE FACTOR LEVELS. import delimited without
*     asdouble stores gpa as float (7th-decimal drift, fatal to an exact
*     cross-language check). i.timeToTreat fails because factor variables
*     must be nonnegative integers, and ib(-1). is not even parsed. Demo below.
*-------------------------------------------------------------------------------
capture regress gpa i.timeToTreat i.id i.time
display as text _n "Trap 10: i.timeToTreat -> error r(" _rc "), negative factor levels"

preserve
load_csv tutoring_did.csv
quietly regress gpa txp i.id i.time, vce(cluster id)
display as text "Trap 7: regress + school dummies, vce(cluster id): SE " ///
    %6.4f _se[txp] " (xtreg, fe: " %6.4f se_twfe ")"
restore


*-------------------------------------------------------------------------------
* COMPARISON TABLE (identical in all three cheat sheets)
*    The Python and R columns are what cheatsheet_python.py and cheatsheet_R.R
*    print. They equal the Stata column to every printed digit because all
*    three read the same CSVs; this file checks its own column against them.
*    The manual 2x2 DiD has no SE (missing in REF and LIVE).
*-------------------------------------------------------------------------------
matrix REF = ( 36.2008, 0.5252 \ 25.3149, . \ 25.3149, 0.6150 \           ///
               25.3149, 0.5851 \ 25.3281, 0.6048 \  0.3420, 0.4013 \      ///
               -0.3220, 0.4413 \  0.5933, 0.4235 \ 25.0276, 0.4451 \      ///
               24.7052, 0.5593 \ 24.7685, 0.7386 \ 25.7015, 0.7965)
matrix LIVE = ( b_naive, se_naive \ did, . \ b_ols, se_ols \              ///
                b_twfe, se_twfe \ b_cov, se_cov )
matrix LIVE = LIVE \ (ES_B, ES_SE)
local r1  "Naive before-after"
local r2  "Manual 2x2 DiD"
local r3  "OLS interaction, HC1"
local r4  "TWFE, CRV1"
local r5  "TWFE + female_share"
local r6  "Event study t = -4"
local r7  "Event study t = -3"
local r8  "Event study t = -2"
local r9  "Event study t =  0"
local r10 "Event study t =  1"
local r11 "Event study t =  2"
local r12 "Event study t =  3"

capture program drop cell
program define cell, rclass
    args b se
    local s = string(`b', "%8.4f")
    local s = substr("        ", 1, 8 - strlen("`s'")) + "`s'"
    if missing(`se') local s = "`s' (   -  )"
    else local s = "`s' (" + string(`se', "%6.4f") + ")"
    return local cell "`s'"
end

display _n as text "DiD estimate (SE): 35 schools, one pair of CSVs, three languages"
display as text "{hline 78}"
display as text %-24s "Row" %-18s "Python" %-18s "R" "Stata"
display as text "{hline 78}"
forvalues i = 1/12 {
    cell REF[`i',1] REF[`i',2]
    local ref "`r(cell)'"
    cell LIVE[`i',1] LIVE[`i',2]
    local live "`r(cell)'"
    assert "`live'" == "`ref'"
    display as text %-24s "`r`i''" as result %-18s "`ref'" %-18s "`ref'" "`live'"
}
display as text "{hline 78}"
display as text "Naive: treated schools only, iid SE. 2x2 rows: N = 70. Event study:"
display as text "N = 280, t = -1 omitted, CRV1 by school. Section 7 adds iid/HC1/CRV3."
