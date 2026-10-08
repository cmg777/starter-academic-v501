*============================================================================
* PANEL DATA METHODS IN STATA: a one-page cheat sheet
*
* Companion to https://carlos-mendez.org/tutorials/python_panel_intro/
* Companions: cheatsheet_python.py, cheatsheet_R.R, script.py (post script)
*
* The Stata port of cheatsheet_python.py: same CSV, same sections, same
* comparison table at the end, so the three files can be read side by side.
*
* Install: nothing. Built-in commands only (xtreg, areg, regress, hausman).
*   Optional cross-check in section 7 (skipped if any piece is missing):
*   . ssc install reghdfe   . ssc install ftools   . ssc install require
*
* Usage: inside Stata,  . do cheatsheet_stata.do
*   or in batch mode,  stata-se -b do cheatsheet_stata.do  (on macOS the
*   binary is in /Applications/Stata/StataSE.app/Contents/MacOS/). The batch
*   log starts with your license details: do not commit or share it.
* Run time: about 40 seconds (mostly the 2,199-dummy regress). Besides the
*           batch log, nothing is written to disk unless EXPORT is 1.
* Verified with: Python 3.13 / R 4.5 / Stata 19 (reghdfe 6.13)
*
* Contents
*   0.  Vocabulary in thirty seconds
*   1.  Load the data (local copy, then URL)
*   2.  Panel structure: who switches?
*   3.  Between vs within variance
*   4.  Pooled OLS and the between estimator
*   5.  First differences
*   6.  Fixed effects three ways (and the df trap)
*   7.  Two-way FE and the T = 2 identities
*   8.  Random effects is OLS on quasi-demeaned data
*   9.  The Hausman test: two versions, two verdicts
*   10. Correlated random effects (Mundlak)
*   11. Adding controls
*   12. The within picture
*   13. The window matters: all five waves
*   14. Traps that silently give wrong answers
*   Comparison table (identical in all three cheat sheets)
*============================================================================

clear all
set more off
set linesize 100
set varabbrev off        // a typo must not silently match another variable
version 15               // graph transparency (%30) needs 15+

global EXPORT 0          // 1 = export the section-12 graph as a PNG

capture program drop show
program define show
    gettoken label 0 : 0
    display as text %-44s "`label'" as result %10.4f `0'
end

* RE as OLS on quasi-demeaned data with White (HC1) standard errors: the
* post's linearmodels cov_type="robust" and R's vcovHC(method = "white1").
* Leaves regress results in e(); coefficients are named q_<var>.
capture program drop re_white
program define re_white
    syntax varlist(min=2)
    quietly xtreg `varlist', re
    scalar theta = e(theta)
    capture drop q_*
    foreach v of local varlist {
        tempvar m
        quietly bysort id: egen double `m' = mean(`v')
        quietly generate double q_`v' = `v' - theta*`m'
    }
    quietly generate double q_cons = 1 - theta
    gettoken y xs : varlist
    local qx
    foreach v of local xs {
        local qx `qx' q_`v'
    }
    quietly regress q_`y' `qx' q_cons, noconstant vce(robust)
    sort id year
end


*-------------------------------------------------------------------------------
* 0. VOCABULARY IN THIRTY SECONDS
*
*   Panel ............... the same units observed repeatedly. Here 2,199
*                         workers x 2 waves (2010, 2012) = 4,398 worker-years.
*   alpha_i ............. the worker effect: everything about worker i that
*                         does not change over the sample (ability, schooling,
*                         gender, family background).
*   Between / within .... variation across workers' means vs variation around
*                         a worker's own mean. FE, FD, TWFE and CRE use ONLY
*                         the within part.
*   Within transform .... x_it - mean_i(x). Kills alpha_i. Identical to adding
*                         one dummy per worker (FWL with N dummies).
*   First difference .... x_it - x_i,t-1. Also kills alpha_i. With T = 2 it
*                         carries exactly the same information as demeaning.
*   Switchers ........... workers whose union status changes. The ONLY workers
*                         that identify the within estimators: 73 of 2,199.
*   Random effects ...... GLS that assumes alpha_i is uncorrelated with x. It is
*                         OLS on quasi-demeaned data z_it - theta * mean_i(z):
*                         theta = 0 is pooled OLS, theta = 1 is FE.
*   Mundlak / CRE ....... RE plus mean_i(x) as an extra regressor. Its x
*                         coefficient is exactly FE; its mean_i(x) coefficient
*                         tests the RE assumption.
*   Hausman ............. (b_FE - b_RE)^2 / (V_FE - V_RE) ~ chi2(1). Valid only
*                         with classical variances (RE efficient under H0).
*-------------------------------------------------------------------------------


*-------------------------------------------------------------------------------
* 1. LOAD THE DATA (LOCAL COPY, THEN URL)
*    NLSY-style wage panel, restricted to 2010 and 2012 (T = 2, balanced).
*    lwage = log hourly wage; union = 1 if union member; female = 1 if female.
*    import delimited lowercases ID to id. ALWAYS asdouble: see trap 13.
*-------------------------------------------------------------------------------
global url "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/tutorials/python_panel_intro/data"

capture program drop load_csv
program define load_csv
    args name
    local src "$url/`name'"
    capture confirm file "data/`name'"
    if !_rc local src "data/`name'"
    capture confirm file "`name'"
    if !_rc local src "`name'"
    import delimited "`src'", clear asdouble
    global src "`src'"
end

load_csv data_panel.csv
global panel_src "$src"
sort id year
display as text "Loaded: $src  (" _N " rows)"
assert _N == 4398
assert !missing(lwage, union, age, schooling)


*-------------------------------------------------------------------------------
* 2. PANEL STRUCTURE: WHO SWITCHES?
*    N = 2,199, T = 2. never 1,805 / always 321 / joiner 36 / leaver 37.
*    Waves are TWO years apart: delta(2) is not optional (trap 2).
*-------------------------------------------------------------------------------
xtset id year, delta(2)
assert "`r(balanced)'" == "strongly balanced"
quietly levelsof id
display as text "N = " r(r) "   T = 2   N x T = " _N

bysort id (year): generate pattern = cond(union[1] == 0 & union[2] == 0, "never",  ///
                                     cond(union[1] == 1 & union[2] == 1, "always", ///
                                     cond(union[1] == 0, "joiner", "leaver")))
tabulate pattern if year == 2010
quietly count if year == 2010 & inlist(pattern, "joiner", "leaver")
display as text "Switchers: " r(N) " (" %3.1f 100*r(N)/2199 "% of workers)"


*-------------------------------------------------------------------------------
* 3. BETWEEN VS WITHIN VARIANCE
*    between = Var(mean_i(x)); within = Var(x_it - mean_i(x)). Share = variance
*    ratio, NOT a ratio of standard deviations. union: 0.3576 / 0.0911 / 6.1%.
*    schooling: 0.0% -> FE cannot estimate it. (xtsum prints the same SDs.)
*-------------------------------------------------------------------------------
foreach v in lwage union age schooling {
    quietly bysort id: egen double m_`v' = mean(`v')
    quietly generate double w_`v' = `v' - m_`v'
    quietly summarize m_`v' if year == 2010           // one mean per worker
    local b = r(Var)
    quietly summarize w_`v'
    local w = r(Var)
    display as text %-11s "`v'" "between SD " as result %6.4f sqrt(`b')      ///
        as text "  within SD " as result %6.4f sqrt(`w')                    ///
        as text "  within share " as result %5.1f 100*`w'/(`b' + `w') "%"
}


*-------------------------------------------------------------------------------
* 4. POOLED OLS AND THE BETWEEN ESTIMATOR
*    POLS 0.0750 (0.0231); between 0.0662 (0.0311, HC1 on the worker means).
*    Both compare DIFFERENT workers, so both inherit any selection on alpha_i.
*-------------------------------------------------------------------------------
quietly regress lwage union, vce(robust)
scalar b_pols  = _b[union]
scalar se_pols = _se[union]

preserve
    collapse (mean) lwage union, by(id)                // one row per worker
    quietly regress lwage union, vce(robust)
    scalar b_betw  = _b[union]
    scalar se_betw = _se[union]
restore
quietly xtreg lwage union, be                          // same b, classical SE
assert reldif(_b[union], b_betw) < 1e-8

show "POLS" b_pols
show "  its SE (HC1)" se_pols
show "Between" b_betw
show "  its SE (HC1)" se_betw
show "  xtreg, be SE (classical: trap 5)" _se[union]


*-------------------------------------------------------------------------------
* 5. FIRST DIFFERENCES
*    D. differences PERIODS within id (that is what xtset delta(2) is for).
*    FD 0.2113 (0.0792), intercept 0.0727 = the common 2010 -> 2012 wage
*    growth; without the intercept 0.2103.
*-------------------------------------------------------------------------------
regress D.lwage D.union, vce(robust)
scalar b_fd   = _b[D.union]
scalar se_fd  = _se[D.union]
scalar fd_int = _b[_cons]
quietly regress D.lwage D.union, noconstant vce(robust)
scalar b_fd0  = _b[D.union]

show "FD" b_fd
show "  its SE (HC1)" se_fd
show "  intercept (common wage growth)" fd_int
show "FD, no intercept" b_fd0
display as text "Rows used: " e(N)


*-------------------------------------------------------------------------------
* 6. FIXED EFFECTS THREE WAYS (AND THE DF TRAP)
*    (a) Absorbed: 0.2103, HC1 SE 0.0812, iid SE 0.0509.
*    (b) Demeaned by hand: same coefficient, WRONG SE (0.0360). regress does
*        not know that 2,199 worker means were estimated, so it divides by
*        NT - 1 = 4397 instead of NT - N - 1 = 2198; x sqrt(4397/2198) = 1.414.
*    (c) One dummy per worker (2,199 columns): same coefficient, same SE.
*-------------------------------------------------------------------------------
areg lwage union, absorb(id) vce(robust)
scalar b_fe  = _b[union]
scalar se_fe = _se[union]
quietly xtreg lwage union, fe                          // iid
scalar se_fe_iid = _se[union]
estimates store fe

quietly regress w_lwage w_union, noconstant
assert reldif(_b[w_union], b_fe) < 1e-8
assert reldif(_se[w_union]*sqrt(4397/2198), se_fe_iid) < 1e-8
scalar se_hand = _se[w_union]

quietly regress lwage union i.id
assert reldif(_b[union], b_fe) < 1e-8 & reldif(_se[union], se_fe_iid) < 1e-8

show "FE (areg / xtreg, fe)" b_fe
show "  its SE (HC1)" se_fe
show "  its SE (iid)" se_fe_iid
show "By hand: SE" se_hand
show "  x sqrt(4397/2198)" se_hand*sqrt(4397/2198)


*-------------------------------------------------------------------------------
* 7. TWO-WAY FE AND THE T = 2 IDENTITIES
*    With T = 2:  FD without intercept == one-way FE;  FD with intercept ==
*    TWFE. The year effect does the job of the FD intercept. TWFE 0.2113,
*    clustered SE 0.0792. With T > 2 both identities break (section 13).
*-------------------------------------------------------------------------------
xtreg lwage union i.year, fe vce(cluster id)
scalar b_twfe  = _b[union]
scalar se_twfe = _se[union]
assert reldif(b_fd0, b_fe) < 1e-8
assert reldif(b_fd, b_twfe) < 1e-8
show "TWFE" b_twfe
show "  its SE (clustered by id)" se_twfe
show "FD0 - FE" b_fd0 - b_fe
show "FD - TWFE" b_fd - b_twfe

capture quietly reghdfe lwage union, absorb(id year) vce(cluster id)
if !_rc {         // also skipped when reghdfe, ftools or require is missing
    assert reldif(_b[union], b_twfe) < 1e-8 & reldif(_se[union], se_twfe) < 1e-6
    display as text "reghdfe, absorb(id year): same coefficient and SE"
}


*-------------------------------------------------------------------------------
* 8. RANDOM EFFECTS IS OLS ON QUASI-DEMEANED DATA
*    theta = 1 - sqrt(s2_e / (s2_e + T s2_u)) = 0.6091. Subtract theta x the
*    worker mean from every column (the constant becomes 1 - theta) and run
*    OLS: 0.1092, White SE 0.0299. theta = 0 is POLS (section 4), theta = 1
*    is the by-hand FE regression (section 6). RE leans toward POLS here
*    because only 6.1% of union's variance is within.
*-------------------------------------------------------------------------------
xtreg lwage union, re                                  // Swamy-Arora, iid SE
estimates store re
scalar b_re_xt = _b[union]
display as text %-44s "theta" as result %10.4f e(theta)

re_white lwage union
assert reldif(_b[q_union], b_re_xt) < 1e-8
scalar b_re  = _b[q_union]
scalar se_re = _se[q_union]
show "RE = OLS on quasi-demeaned data" b_re
show "  its SE (White, HC1)" se_re

quietly xtreg lwage union, re vce(robust)              // CLUSTERS by id: trap 5
show "  xtreg, re vce(robust) SE (clustered)" _se[union]


*-------------------------------------------------------------------------------
* 9. THE HAUSMAN TEST: TWO VERSIONS, TWO VERDICTS
*    H0: alpha_i uncorrelated with union (RE consistent and efficient).
*    The textbook test (-hausman-, plm::phtest) REJECTS RE: H = 5.62,
*    p = 0.018; it is the one the post reports. Plugging robust SEs into the
*    same formula (H = 1.79, p = 0.180) is not a valid Hausman test, because
*    RE is no longer the efficient estimator. With robust or clustered
*    errors, use the Mundlak test in section 10 instead.
*-------------------------------------------------------------------------------
hausman fe re
scalar H_txt = r(chi2)
scalar p_txt = r(p)
scalar H_post = (b_fe - b_re)^2 / (se_fe^2 - se_re^2)
scalar p_post = chi2tail(1, H_post)
show "Hausman, textbook: H" H_txt
show "  p" p_txt
show "Hausman, robust SEs plugged in (invalid): H" H_post
show "  p" p_post


*-------------------------------------------------------------------------------
* 10. CORRELATED RANDOM EFFECTS (MUNDLAK)
*    RE + union_bar: union 0.2103 (0.0703) == FE exactly; union_bar -0.1441
*    (0.0800, p 0.0717). Pooled OLS + union_bar clustered by worker: same
*    coefficients, union_bar SE 0.0891, p 0.1059: the robust replacement for
*    Hausman. gamma < 0 is consistent with negative selection; borderline.
*-------------------------------------------------------------------------------
bysort id: egen double union_bar = mean(union)
re_white lwage union union_bar
assert reldif(_b[q_union], b_fe) < 1e-8
scalar b_cre   = _b[q_union]
scalar se_cre  = _se[q_union]
scalar b_mk    = _b[q_union_bar]
scalar se_mk   = _se[q_union_bar]
show "CRE: union" b_cre
show "  its SE (White)" se_cre
show "CRE: union_bar (Mundlak term)" b_mk
show "  its SE (White)" se_mk
show "  p" 2*ttail(e(df_r), abs(b_mk/se_mk))

regress lwage union union_bar, vce(cluster id)
assert reldif(_b[union], b_fe) < 1e-8
show "Pooled Mundlak, clustered: union_bar p" 2*ttail(e(df_r), abs(_b[union_bar]/_se[union_bar]))


*-------------------------------------------------------------------------------
* 11. ADDING CONTROLS
*    schooling and female never change within a worker -> absorbed by the FE.
*    Every model gets year effects; for RE and CRE that is a 2012 dummy (its
*    worker mean is 0.5 for everyone, so it needs no Mundlak term).
*              POLS     TWFE      RE      CRE
*    union    0.0571   0.2129   0.0875   0.2129
*    age      0.0209  -0.0576   0.0205  -0.0576
*    CRE with year effects reproduces TWFE exactly. Drop y2012 and CRE becomes
*    one-way FE instead (union 0.2103, age +0.0332: age soaks up the trend).
*    Why is age NEGATIVE under TWFE? 1,885 workers age exactly 2 years between
*    waves, which the year effect absorbs; only 164 + 150 irregular spacings
*    are left to identify it.
*-------------------------------------------------------------------------------
bysort id: egen double age_bar = mean(age)
generate byte y2012 = year == 2012
quietly regress lwage union age schooling female i.year, vce(robust)
local pols_u = _b[union]
local pols_a = _b[age]
quietly xtreg lwage union age i.year, fe vce(cluster id)
scalar b_twx  = _b[union]
scalar se_twx = _se[union]
local tw_a = _b[age]
re_white lwage union age schooling female y2012
scalar b_rex  = _b[q_union]
scalar se_rex = _se[q_union]
local re_a = _b[q_age]
scalar theta_rex = theta                               // 0.5529 (trap 11)
re_white lwage union union_bar age age_bar schooling female y2012
local cre_u = _b[q_union]
local cre_a = _b[q_age]
assert reldif(`cre_u', b_twx) < 1e-8
show "RE + controls: theta (trap 11)" theta_rex

display _n as text %-8s "" %9s "POLS" %9s "TWFE" %9s "RE" %9s "CRE"
display as text %-8s "union" as result %9.4f `pols_u' %9.4f b_twx %9.4f b_rex %9.4f `cre_u'
display as text %-8s "age"   as result %9.4f `pols_a' %9.4f `tw_a' %9.4f `re_a' %9.4f `cre_a'

quietly generate dage = D.age                          // missing in 2010
tabulate dage                                          // 164 / 1,885 / 150


*-------------------------------------------------------------------------------
* 12. THE WITHIN PICTURE
*    Left: raw data, POLS slope. Right: demeaned data, FE slope. Same 4,398
*    rows; only the 146 switcher rows move off zero on the right. Drawn in
*    memory; written to disk only when EXPORT is 1.
*-------------------------------------------------------------------------------
set seed 42
generate double jx_raw = union + rnormal(0, .025)
generate double jx_dm  = w_union + rnormal(0, .005)
twoway (scatter lwage jx_raw, msize(tiny) mcolor("106 155 204%30"))       ///
       (lfit lwage union, lcolor("217 119 87") lwidth(thick)),            ///
       xtitle("union (jittered)") ytitle("log wage") legend(off)          ///
       title("Raw: POLS slope 0.075") name(raw, replace) nodraw
twoway (scatter w_lwage jx_dm, msize(tiny) mcolor("106 155 204%30"))      ///
       (lfit w_lwage w_union, lcolor("217 119 87") lwidth(thick)),        ///
       xtitle("union - worker mean") ytitle("log wage - worker mean")     ///
       legend(off) title("Demeaned: FE slope 0.210") name(dm, replace) nodraw
graph combine raw dm, cols(2) name(within_picture, replace)
if $EXPORT == 1 {
    graph export "panel_within_picture_stata.png", name(within_picture) width(1600) replace
}


*-------------------------------------------------------------------------------
* 13. THE WINDOW MATTERS: ALL FIVE WAVES
*    2010-2018, T = 5: 11,045 rows, 2,209 workers, within share 16.1%.
*    TWFE 0.0396 (0.0255); FD + year effects 0.0566 (0.0322). FD and FE no
*    longer coincide, and the 0.21 premium collapses.
*-------------------------------------------------------------------------------
preserve
    load_csv raw_data.csv
    drop if missing(lwage, union)
    xtset id year, delta(2)
    assert "`r(balanced)'" == "strongly balanced"
    display as text "Five waves: " _N " rows"
    bysort id: egen double m5 = mean(union)
    generate double w5 = union - m5
    quietly summarize m5 if year == 2010               // one mean per worker
    local b5 = r(Var)
    quietly summarize w5
    display as text "  within share of union variance " as result %4.1f ///
        100*r(Var)/(r(Var) + `b5') "%"
    quietly xtreg lwage union i.year, fe vce(cluster id)
    scalar b_fe5  = _b[union]
    scalar se_fe5 = _se[union]
    quietly regress D.lwage D.union i.year, vce(cluster id)
    scalar b_fd5  = _b[D.union]
    scalar se_fd5 = _se[D.union]
restore
show "Five waves: TWFE" b_fe5
show "  its SE (clustered)" se_fe5
show "Five waves: FD + year effects" b_fd5
show "  its SE (clustered)" se_fd5


*-------------------------------------------------------------------------------
* 14. TRAPS THAT SILENTLY GIVE WRONG ANSWERS
*
*  1. DIFFERENCING ACROSS WORKERS. generate dl = lwage - lwage[_n-1] without
*     -by id:- subtracts one worker from the next: 4,397 rows instead of 2,199
*     and a slope of 0.0783 instead of 0.2113. No error. Use D. after xtset,
*     or -by id (year):-. Demo below.
*
*  2. DIFFERENCING ROWS, NOT PERIODS. Waves are two years apart. Plain
*     -xtset id year- makes D.lwage missing everywhere ("no observations",
*     demo below); -by id: ... [_n-1]- subtracts the previous ROW and silently
*     spans a missing wave. xtset id year, delta(2), then D.
*
*  3. DEMEANING BY HAND UNDERSTATES THE SE. Section 6: iid SE 0.0360 instead
*     of 0.0509, because the 2,199 worker means are not counted as estimated
*     parameters. Multiply by sqrt((NT-1)/(NT-N-1)) or let xtreg/areg do it.
*
*  4. TIME-INVARIANT REGRESSORS DISAPPEAR. xtreg lwage union schooling female,
*     fe reports schooling and female as "omitted because of collinearity".
*     FE cannot estimate them; CRE can (section 11).
*
*  5. "ROBUST" MEANS DIFFERENT THINGS. xtreg ..., fe/re vce(robust) CLUSTERS
*     by panel (RE SE 0.0314); regress/areg ..., vce(robust) is
*     heteroskedasticity-only; the post's RE SE 0.0299 is White on the
*     quasi-demeaned data (re_white above). xtreg, be is classical (0.0332).
*     Name the variance you want.
*
*  6. DEFAULT SEs DIFFER ACROSS TOOLS AND VERSIONS. fixest 0.14 and pyfixest
*     0.50 default to iid; older versions clustered by the first fixed effect.
*     State the vce() you want.
*
*  7. WHICH HAUSMAN? -hausman fe re- gives H = 5.62, p = 0.018 (reject RE).
*     Robust SEs plugged into the same formula give H = 1.79, p = 0.180, but
*     that is not a valid test; -hausman- itself refuses vce(robust) fits with
*     r(198). With robust errors, report the clustered Mundlak test (p = 0.106).
*
*  8. NOT REJECTING IS NOT ACCEPTING. With 6.1% of union's variance within
*     workers, V_FE is large and any FE-vs-RE test has little power. RE's
*     smaller SE is worth nothing if its assumption fails.
*
*  9. FE IS AN AVERAGE OVER SWITCHERS. 73 workers identify 0.21; joiners alone
*     give 0.345 and leavers 0.081 (post Exercise 5). It is not the premium
*     of the 2,126 workers who never switch.
*
* 10. A REGRESSOR NEARLY COLLINEAR WITH THE FEs IS IDENTIFIED BY NOISE. TWFE's
*     age coefficient (-0.0576) rests on the 314 workers whose interviews were
*     not exactly two years apart. Do not read it as an age profile.
*
* 11. RE IS NOT ONE ESTIMATOR. The variance components set theta, and tools
*     differ slightly: with controls, Stata/plm get theta 0.5529 and
*     linearmodels 0.5528 (union 0.0875 in all three at four decimals;
*     without the year dummy the gap shows up as 0.0862 vs 0.0861). In this
*     balanced panel xtreg, re sa gives the same theta; plm's Amemiya and
*     Nerlove methods move union to 0.116 and 0.146.
*
* 12. FE REMOVES ONLY TIME-CONSTANT CONFOUNDING, IN THIS WINDOW. All five
*     waves: TWFE 0.0396, FD 0.0566. The 0.21 is a 2010-2012 number.
*
* 13. FLOAT IMPORT. import delimited without asdouble stores lwage as float;
*     the POLS slope moves by 2e-9. Invisible at 4 decimals, fatal to exact
*     cross-language checks. Demo below.
*-------------------------------------------------------------------------------
sort id year
generate double dl_bad = lwage - lwage[_n-1]            // no -by id:-
generate double du_bad = union - union[_n-1]
quietly regress dl_bad du_bad
display as text "Trap 1: ungrouped diff -> " e(N) " rows, slope " as result %6.4f _b[du_bad]

preserve
    quietly xtset id year                               // delta forgotten
    capture regress D.lwage D.union
    display as text "Trap 2: xtset without delta(2) -> regress D.lwage D.union, rc = " ///
        _rc " (2000 = no observations)"
restore
quietly xtset id year, delta(2)

quietly xtreg lwage union schooling female, fe
display as text "Trap 4: _se[schooling] = " _se[schooling] ", _se[female] = " _se[female] " (omitted)"

preserve
    quietly import delimited "$panel_src", clear        // float: the trap
    quietly regress lwage union, vce(robust)
    display as text "Trap 13: float import moves the POLS slope by " ///
        as result %8.1e _b[union] - b_pols
restore


*-------------------------------------------------------------------------------
* COMPARISON TABLE (identical in all three cheat sheets)
*    The Python and R columns are what cheatsheet_python.py and cheatsheet_R.R
*    print. They equal the Stata column to every printed digit because all
*    three read the same CSV (trap 11 explains the fifth-decimal RE
*    differences). This file checks its own column against the reference.
*    Hausman rows: H (p).
*-------------------------------------------------------------------------------
matrix REF = ( 0.0750, 0.0231 \  0.0662, 0.0311 \ 0.2113, 0.0792 \ ///
               0.2103, 0.0812 \  0.2113, 0.0792 \ 0.1092, 0.0299 \ ///
               0.2103, 0.0703 \ -0.1441, 0.0800 \ 0.0875, 0.0258 \ ///
               0.2129, 0.0793 \  0.0396, 0.0255 \ 0.0566, 0.0322 \ ///
               5.6209, 0.0177 \  1.7941, 0.1804)    // = Python = R
matrix PY = REF
matrix LIVE = ( b_pols, se_pols \ b_betw, se_betw \ b_fd, se_fd \    ///
                b_fe, se_fe \ b_twfe, se_twfe \ b_re, se_re \        ///
                b_cre, se_cre \ b_mk, se_mk \ b_rex, se_rex \        ///
                b_twx, se_twx \ b_fe5, se_fe5 \ b_fd5, se_fd5 \      ///
                H_txt, p_txt \ H_post, p_post)
local r1  "Pooled OLS"
local r2  "Between"
local r3  "First differences"
local r4  "FE (within)"
local r5  "Two-way FE"
local r6  "Random effects"
local r7  "CRE: union"
local r8  "CRE: union_bar"
local r9  "RE + controls"
local r10 "TWFE + age"
local r11 "Five waves: TWFE"
local r12 "Five waves: FD + year"
local r13 "Hausman textbook H (p)"
local r14 "Hausman plug-in H (p)"

display _n as text "Union coefficient (SE): 2,199 workers, one CSV, three languages"
display as text "{hline 78}"
display as text %-24s "Row" %-18s "Python" %-18s "R" "Stata"
display as text "{hline 78}"
forvalues i = 1/14 {
    assert string(LIVE[`i',1], "%7.4f") == string(REF[`i',1], "%7.4f")
    assert string(LIVE[`i',2], "%6.4f") == string(REF[`i',2], "%6.4f")
    display as text %-24s "`r`i''"                                        ///
        as result %7.4f PY[`i',1]   " (" %6.4f PY[`i',2]   ")  "          ///
                  %7.4f REF[`i',1]  " (" %6.4f REF[`i',2]  ")  "          ///
                  %7.4f LIVE[`i',1] " (" %6.4f LIVE[`i',2] ")"
}
display as text "{hline 78}"
display as text "SEs: HC1 for POLS, between, FD, FE; clustered by worker for TWFE and five"
display as text "waves; White on quasi-demeaned data for RE and CRE. Within rows ~0.21,"
display as text "cross-sectional rows 0.07-0.11; with five waves the 0.21 disappears."
display as text "Hausman plug-in = robust SEs in the textbook formula: NOT a valid test."
