*! ═════════════════════════════════════════════════════════════════
*! Double LASSO in Stata: replicating Donohue & Levitt (2001) on
*! abortion and crime.
*!
*! Stata companion to the R tutorial in content/post/r_double_lasso/.
*! Same data, same five estimators, same identification story.
*!
*!   1. First-difference OLS               (no controls)
*!   2. Kitchen-sink OLS                   (all 284 partialled controls)
*!   3. PSL  (Post-Structural LASSO)       (one rlasso, treatment pinned via pnotpen)
*!   4. DL-rigorous  (Belloni-Chernozhukov-Hansen penalty via -rlasso-)
*!   5. DL-CV        (cross-validated penalty via -cvlasso-, lcount(10))
*!
*! Engines: rlasso / cvlasso / lasso2 / pdslasso from the StataLasso
*! suite (Ahrens, Hansen, Schaffer 2018, "pdslasso and ivlasso").
*!
*! Usage:    stata -b do analysis.do
*! Outputs:  analysis.log
*!           results_table2.csv           (5 estimators x 3 outcomes)
*!           selection_diagnostic.csv     (|I_y|, |I_d|, |union|)
*!           stata_double_lasso_*.png     (3 dark-theme figures: forest plot,
*!                                         selection bars, rigorous-vs-CV compare)
*!
*! Data:     Six CSVs pulled over HTTPS from the r_double_lasso post,
*!           which itself extracted them from the JAE replication
*!           archive's .mat files via prepare_data.R.
*!
*! References:
*!   - Fitzgerald, Lattimore, Robinson & Zhu (2026), JAE.
*!   - Belloni, Chernozhukov & Hansen (2014), Rev. Econ. Stud. 81: 608-650.
*!   - Donohue & Levitt (2001), Q. J. Econ. 116: 379-420.
*!   - Ahrens, Hansen & Schaffer (2018), pdslasso package.
*! ═════════════════════════════════════════════════════════════════

* ── 0. Setup ─────────────────────────────────────────────────────

version 18
clear all
set more off
set seed 20260520
capture log close
log using "analysis.log", replace text

* Check required packages are installed (already in user's ado/plus).
foreach pkg in rlasso cvlasso lasso2 pdslasso coefplot {
    capture which `pkg'
    if _rc {
        di as error "Required package not installed: `pkg'"
        di as error "Install via:  ssc install lassopack"
        di as error "             ssc install pdslasso"
        di as error "             ssc install coefplot"
        exit 198
    }
}

* Site palette (dark theme, mirrors R version's ggplot theme_site).
*   DARK_BG  = #0f1729 = "15 23 41"
*   DARK_PNL = #1f2b5e = "31 43 94"
*   LIGHT_TX = #c8d0e0 = "200 208 224"
*   LIGHTER  = #e8ecf2 = "232 236 242"
*   STEEL    = #6a9bcc = "106 155 204"
*   ORANGE   = #d97757 = "217 119 87"
*   TEAL     = #00d4c8 = "0 212 200"
*   LT_ORG   = #e8956a = "232 149 106"
global C_BG    "15 23 41"
global C_PANEL "31 43 94"
global C_GRID  "31 43 94"
global C_TEXT  "200 208 224"
global C_TXTHI "232 236 242"
global C_STEEL "106 155 204"
global C_ORG   "217 119 87"
global C_TEAL  "0 212 200"
global C_LTORG "232 149 106"

* Standard graph-region options for the dark theme.
global DARKBG ///
    graphregion(fcolor("$C_BG") ifcolor("$C_BG") lcolor("$C_BG") ilcolor("$C_BG")) ///
    plotregion(fcolor("$C_BG") lcolor("$C_BG"))


* ── 1. Data loading (six CSVs from GitHub raw URLs) ───────────────

di _n(2) "========================================"
di "STEP 1 - DATA LOADING (six CSVs over HTTPS)"
di "========================================"

local BASE = "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_double_lasso/data"

tempfile linear partialled ctrl_v ctrl_p ctrl_m

* (a) Raw first-differenced outcomes and treatments + state IDs.
*     Cols: state, Dyv, Dxv, Dyp, Dxp, Dym, Dxm
import delimited "`BASE'/levitt_linear.csv", clear varnames(1) case(preserve)
gen long obs_id = _n
di "  levitt_linear.csv         : `=_N' obs x `=c(k)' cols"
save "`linear'"

* (b) Partialled (year-FE-removed) outcomes and treatments.
*     Cols: state, DxV, DyV, DxP, DyP, DxM, DyM
import delimited "`BASE'/levitt_partialled.csv", clear varnames(1) case(preserve)
* drop the duplicate state col so the merge is clean
drop state
gen long obs_id = _n
di "  levitt_partialled.csv     : `=_N' obs x `=c(k)' cols (incl obs_id)"
save "`partialled'"

* (c)-(e) Three 284-column control matrices, one per outcome.
*         Column names in source CSV use ^, *, ( ) etc. which Stata
*         sanitises on import; we then rename to zv1..zv284 (etc.)
*         so downstream code can address them uniformly.
foreach o in v p m {
    if "`o'" == "v" local long "viol"
    if "`o'" == "p" local long "prop"
    if "`o'" == "m" local long "murd"
    import delimited "`BASE'/levitt_controls_`long'.csv", clear varnames(1)
    local k = 0
    foreach var of varlist _all {
        local ++k
        rename `var' z`o'`k'
    }
    di "  levitt_controls_`long'.csv : `=_N' obs x `k' cols (renamed zv1..z`o'`k')"
    gen long obs_id = _n
    save "`ctrl_`o''"
}

* Combine into one working dataset.
use "`linear'", clear
merge 1:1 obs_id using "`partialled'", nogen
merge 1:1 obs_id using "`ctrl_v'", nogen
merge 1:1 obs_id using "`ctrl_p'", nogen
merge 1:1 obs_id using "`ctrl_m'", nogen

* Sanity check: must be 576 obs, 48 states.
assert _N == 576
qui levelsof state, local(states)
local nstates : word count `states'
assert `nstates' == 48

di _n "  Merged working dataset: `=_N' obs, `nstates' clusters (states)"


* ── 2. Convenience: outcome metadata ─────────────────────────────

* For each outcome we have:
*   raw differenced:   y = Dy[v/p/m]   d = Dx[v/p/m]
*   year-FE partialled:y = Dy[V/P/M]   d = Dx[V/P/M]
*   284 partialled controls: z[v/p/m]1..z[v/p/m]284
*
* The partialling step (done in the original Matlab pre-processing)
* absorbs year fixed effects via Frisch-Waugh-Lovell: every variable
* v becomes v - T (T'T)^-1 T' v, where T is the matrix of year
* dummies. Regressions on the partialled vars are equivalent to
* regressing the raw differences while controlling for year dummies,
* with one less degree of freedom.

* Will use these foreach loops repeatedly.
* Iteration uses short prefixes v/p/m (matching the renamed control vars
* zv1..zv284, zp1..zp284, zm1..zm284).  Look-up helpers below map the
* short prefix to outcome label and raw/partialled variable names.
*
*   prefix  -> label             y (raw)  d (raw)  y (partialled)  d (partialled)
*   v       -> Violent crime     Dyv      Dxv      DyV             DxV
*   p       -> Property crime    Dyp      Dxp      DyP             DxP
*   m       -> Murder            Dym      Dxm      DyM             DxM


* ── 3. Cluster-robust SEs ─────────────────────────────────────────

* Stata's vce(cluster state) on -regress- applies exactly the
* small-sample correction used in the Fitzgerald et al. (2026)
* replication code:
*
*   V_cluster = (N-1)/(N-k) * G/(G-1) * (X'X)^-1 . S . (X'X)^-1
*
* with G = 48 clusters of 12 observations each. No extra code needed.


* ── 4. Estimator A - First-difference OLS (no controls) ──────────

* ESTIMAND. Throughout the five estimators below the parameter of
* interest is alpha, the average partial effect of (first-differenced)
* effective abortion rate on (first-differenced) state crime rate.
* Identification rests on:
*   (1) conditional independence given the 284 partialled controls; and
*   (2) parallel trends in levels (state FEs absorbed by differencing,
*       year FEs by the partialling step).

di _n(2) "========================================"
di "STEP 4 - FIRST-DIFFERENCE OLS (no controls)"
di "========================================"

* Storage for downstream table.
tempname FD_b FD_se
mat `FD_b'  = J(3, 1, .)
mat `FD_se' = J(3, 1, .)

local row = 0
foreach o in v p m {
    local ++row
    local lab = cond("`o'"=="v","Violent crime",cond("`o'"=="p","Property crime","Murder"))
    local Y = cond("`o'"=="v","Dyv", cond("`o'"=="p","Dyp","Dym"))
    local D = cond("`o'"=="v","Dxv", cond("`o'"=="p","Dxp","Dxm"))
    di _n "  Outcome: `lab'  (y=`Y', d=`D')"
    qui regress `Y' `D', noconstant vce(cluster state)
    mat `FD_b'[`row',1]  = _b[`D']
    mat `FD_se'[`row',1] = _se[`D']
    di as text "    alpha_hat = " as result %9.4f _b[`D'] ///
       as text "    SE = " as result %9.4f _se[`D']
}


* ── 5. Estimator B - OLS with all 284 controls ───────────────────

di _n(2) "========================================"
di "STEP 5 - OLS WITH ALL 284 CONTROLS (kitchen-sink)"
di "========================================"
di "Feasible because p=284 < n=576: OLS technically inverts. But"
di "many controls are near-collinear, so SEs balloon. This is what"
di "motivates LASSO: keep the controls that matter, drop the rest."

tempname OLS_b OLS_se OLS_n
mat `OLS_b'  = J(3, 1, .)
mat `OLS_se' = J(3, 1, .)
mat `OLS_n'  = J(3, 1, .)

local row = 0
foreach o in v p m {
    local ++row
    local lab = cond("`o'"=="v","Violent crime",cond("`o'"=="p","Property crime","Murder"))
    local Y = cond("`o'"=="v","DyV", cond("`o'"=="p","DyP","DyM"))
    local D = cond("`o'"=="v","DxV", cond("`o'"=="p","DxP","DxM"))
    di _n "  Outcome: `lab'  (y=`Y', d=`D')"
    qui regress `Y' `D' z`o'1-z`o'284, noconstant vce(cluster state)
    mat `OLS_b'[`row',1]  = _b[`D']
    mat `OLS_se'[`row',1] = _se[`D']
    mat `OLS_n'[`row',1]  = 284
    di as text "    alpha_hat = " as result %9.4f _b[`D'] ///
       as text "    SE = " as result %9.4f _se[`D'] ///
       as text "    (using 284 controls)"
}


* ── 6. Estimator C - Post-Structural LASSO (PSL) ─────────────────

* PSL = one LASSO on (d, X) -> y with the treatment d FORCED IN
* (penalty.factor=0 in R; pnotpen() in Stata's rlasso). The selected
* controls are passed to plain OLS for the final alpha.
*
* DESIGN NOTE: The R companion uses cv.glmnet for PSL (3-fold CV).
* Stata's cvlasso supports notpen(), but its CV path through 100+
* lambda values with notpen-partialling is dramatically slower than
* cv.glmnet's coordinate descent. We use the Belloni-Chernozhukov-
* Hansen RIGOROUS penalty via rlasso instead, with d pinned via
* pnotpen(). This is fast, deterministic, and answers the same
* conceptual question PSL was designed to ask: "one LASSO with the
* treatment forced in, then post-OLS". The penalty rule differs
* across the two implementations but the recipe is identical.
*
* WHY POST-OLS, not LASSO coefficients? LASSO shrinks the
* coefficients of variables it keeps toward zero - that introduces
* bias in alpha. Refitting with plain OLS on the selected variables
* removes the shrinkage. Throughout this script LASSO is used for
* SELECTION only; the final alpha always comes from OLS.

di _n(2) "========================================"
di "STEP 6 - POST-STRUCTURAL LASSO (PSL)"
di "========================================"
di "One rlasso on (d, X) -> y with d pinned (pnotpen),"
di "then OLS on d + selected controls. Rigorous penalty (c=1.1, gamma=0.05)."

tempname PSL_b PSL_se PSL_n
mat `PSL_b'  = J(3, 1, .)
mat `PSL_se' = J(3, 1, .)
mat `PSL_n'  = J(3, 1, .)

local row = 0
foreach o in v p m {
    local ++row
    local lab = cond("`o'"=="v","Violent crime",cond("`o'"=="p","Property crime","Murder"))
    local Y = cond("`o'"=="v","DyV", cond("`o'"=="p","DyP","DyM"))
    local D = cond("`o'"=="v","DxV", cond("`o'"=="p","DxP","DxM"))
    di _n "  Outcome: `lab'  (y=`Y', d=`D')"
    qui rlasso `Y' `D' z`o'1-z`o'284, nocons pnotpen(`D') c(1.1) gamma(0.05)
    local sel "`e(selected)'"
    * e(selected) includes pnotpen variable(s) (here: DxV). Strip d out
    * so we can pass clean "d + controls" to the post-OLS regression.
    local sel : list sel - D
    local nsel : word count `sel'
    qui regress `Y' `D' `sel', noconstant vce(cluster state)
    mat `PSL_b'[`row',1]  = _b[`D']
    mat `PSL_se'[`row',1] = _se[`D']
    mat `PSL_n'[`row',1]  = `nsel'
    di as text "    alpha_hat = " as result %9.4f _b[`D'] ///
       as text "    SE = " as result %9.4f _se[`D'] ///
       as text "    | `nsel' controls selected"
}


* ── 7. Estimator D - Double LASSO, rigorous penalty (rlasso) ─────

* Belloni-Chernozhukov-Hansen Double LASSO with the rigorous penalty:
*
*   1. rlasso y on X           -> I_y = selected outcome-equation indices
*   2. rlasso d on X           -> I_d = selected treatment-equation indices
*   3. OLS y on d + X[I_y ∪ I_d]   with state-clustered SEs
*
* The rigorous penalty is data-driven (Belloni, Chen, Chernozhukov &
* Hansen 2012) and chosen so that selection-error noise is dominated
* by the signal. It is much more parsimonious than CV.
*
* Penalty constants c=1.1 and gamma=0.05 match the JAE (2026)
* replication code (readdata_all_OLS.R lines 585, 653) and the
* R companion's hdm::rlasso call.

di _n(2) "========================================"
di "STEP 7 - DOUBLE LASSO, RIGOROUS PENALTY (rlasso)"
di "========================================"
di "Two rlasso calls (y on X, d on X), union of selected, then post-OLS."
di "'Rigorous' = lambda from Belloni et al. (2012) theory, not CV."

tempname DLR_b DLR_se DLR_n DLR_Iy DLR_Id DLR_U
mat `DLR_b'  = J(3, 1, .)
mat `DLR_se' = J(3, 1, .)
mat `DLR_n'  = J(3, 1, .)
mat `DLR_Iy' = J(3, 1, .)
mat `DLR_Id' = J(3, 1, .)
mat `DLR_U'  = J(3, 1, .)

local row = 0
foreach o in v p m {
    local ++row
    local lab = cond("`o'"=="v","Violent crime",cond("`o'"=="p","Property crime","Murder"))
    local Y = cond("`o'"=="v","DyV", cond("`o'"=="p","DyP","DyM"))
    local D = cond("`o'"=="v","DxV", cond("`o'"=="p","DxP","DxM"))
    di _n "  Outcome: `lab'  (y=`Y', d=`D')"

    * Step 1: LASSO y on X.
    qui rlasso `Y' z`o'1-z`o'284, nocons c(1.1) gamma(0.05)
    local Iy "`e(selected)'"
    local nIy : word count `Iy'

    * Step 2: LASSO d on X.
    qui rlasso `D' z`o'1-z`o'284, nocons c(1.1) gamma(0.05)
    local Id "`e(selected)'"
    local nId : word count `Id'

    * Step 3: union of selected, then post-OLS.
    local U : list Iy | Id
    local nU : word count `U'

    if `nU' > 0 {
        qui regress `Y' `D' `U', noconstant vce(cluster state)
    }
    else {
        * Fall back to univariate first-difference fit (no controls survived).
        qui regress `Y' `D', noconstant vce(cluster state)
    }

    mat `DLR_b'[`row',1]  = _b[`D']
    mat `DLR_se'[`row',1] = _se[`D']
    mat `DLR_n'[`row',1]  = `nU'
    mat `DLR_Iy'[`row',1] = `nIy'
    mat `DLR_Id'[`row',1] = `nId'
    mat `DLR_U'[`row',1]  = `nU'

    di as text "    |I_y| = " as result %3.0f `nIy' ///
       as text "  |I_d| = " as result %3.0f `nId' ///
       as text "  |union| = " as result %3.0f `nU'
    di as text "    alpha_hat = " as result %9.4f _b[`D'] ///
       as text "    SE = " as result %9.4f _se[`D']
}


* ── 8. Estimator E - Double LASSO, CV penalty (cvlasso) ──────────

* Same three steps as section 7, but each LASSO is tuned by 3-fold
* CV (matching Fitzgerald et al. 2026 footnote 2). Lambda is picked
* to minimise out-of-sample MSE (lopt = "lambda at MSE minimum").
*
* RUNTIME NOTE. Stata's cvlasso at p/n ≈ 0.5 is dramatically slower
* than R's cv.glmnet: a single call with the default lcount(100)
* takes 5+ minutes per outcome-equation, which makes the 6-call DL-CV
* pipeline impractical. We use lcount(10) to get the CV grid down to
* 10 lambda values, sacrificing precision in lambda selection in
* exchange for finishing in under 60 seconds per call. The Stata-vs-R
* drift in Section 14 captures the consequence: DL-CV's α and selected
* set sizes diverge more than the other Tier-C estimators do.

di _n(2) "========================================"
di "STEP 8 - DOUBLE LASSO, CV PENALTY (cvlasso, 3-fold, lcount=10)"
di "========================================"

tempname DLC_b DLC_se DLC_n DLC_Iy DLC_Id DLC_U
mat `DLC_b'  = J(3, 1, .)
mat `DLC_se' = J(3, 1, .)
mat `DLC_n'  = J(3, 1, .)
mat `DLC_Iy' = J(3, 1, .)
mat `DLC_Id' = J(3, 1, .)
mat `DLC_U'  = J(3, 1, .)

local row = 0
foreach o in v p m {
    local ++row
    local lab = cond("`o'"=="v","Violent crime",cond("`o'"=="p","Property crime","Murder"))
    local Y = cond("`o'"=="v","DyV", cond("`o'"=="p","DyP","DyM"))
    local D = cond("`o'"=="v","DxV", cond("`o'"=="p","DxP","DxM"))
    di _n "  Outcome: `lab'  (y=`Y', d=`D')"

    qui cvlasso `Y' z`o'1-z`o'284, nfolds(3) seed(20260520) lopt lglmnet lcount(10)
    local Iy "`e(selected)'"
    local nIy : word count `Iy'

    qui cvlasso `D' z`o'1-z`o'284, nfolds(3) seed(20260520) lopt lglmnet lcount(10)
    local Id "`e(selected)'"
    local nId : word count `Id'

    local U : list Iy | Id
    local nU : word count `U'

    if `nU' > 0 {
        qui regress `Y' `D' `U', noconstant vce(cluster state)
    }
    else {
        qui regress `Y' `D', noconstant vce(cluster state)
    }

    mat `DLC_b'[`row',1]  = _b[`D']
    mat `DLC_se'[`row',1] = _se[`D']
    mat `DLC_n'[`row',1]  = `nU'
    mat `DLC_Iy'[`row',1] = `nIy'
    mat `DLC_Id'[`row',1] = `nId'
    mat `DLC_U'[`row',1]  = `nU'

    di as text "    |I_y| = " as result %3.0f `nIy' ///
       as text "  |I_d| = " as result %3.0f `nId' ///
       as text "  |union| = " as result %3.0f `nU'
    di as text "    alpha_hat = " as result %9.4f _b[`D'] ///
       as text "    SE = " as result %9.4f _se[`D']
}


* ── 9. Build results_table2.csv (5 estimators x 3 outcomes) ──────

di _n(2) "========================================"
di "STEP 9 - REPLICATION OF PAPER TABLE 2"
di "========================================"

preserve
clear
set obs 15
gen str14 method   = ""
gen str16 outcome  = ""
gen double estimate  = .
gen double std_error = .
gen long   n_selected = .

local outcomes "viol prop murd"
local methods  "FD OLS PSL DLR DLC"
local mlabels  `""First diff" "OLS (full)" "PSL" "DL (rigorous)" "DL (CV)""'

* Fill the table by hand, row-by-row, looking up the right matrix per cell.
local i = 0
forvalues oi = 1/3 {
    local o : word `oi' of `outcomes'
    if "`o'" == "viol" local olab "Violent crime"
    if "`o'" == "prop" local olab "Property crime"
    if "`o'" == "murd" local olab "Murder"
    forvalues mi = 1/5 {
        local ++i
        local m : word `mi' of `methods'
        local mlab : word `mi' of `mlabels'
        qui replace method = "`mlab'" in `i'
        qui replace outcome = "`olab'" in `i'
        if "`m'" == "FD" {
            qui replace estimate   = `FD_b'[`oi',1]  in `i'
            qui replace std_error  = `FD_se'[`oi',1] in `i'
            qui replace n_selected = 0               in `i'
        }
        else if "`m'" == "OLS" {
            qui replace estimate   = `OLS_b'[`oi',1]  in `i'
            qui replace std_error  = `OLS_se'[`oi',1] in `i'
            qui replace n_selected = `OLS_n'[`oi',1]  in `i'
        }
        else if "`m'" == "PSL" {
            qui replace estimate   = `PSL_b'[`oi',1]  in `i'
            qui replace std_error  = `PSL_se'[`oi',1] in `i'
            qui replace n_selected = `PSL_n'[`oi',1]  in `i'
        }
        else if "`m'" == "DLR" {
            qui replace estimate   = `DLR_b'[`oi',1]  in `i'
            qui replace std_error  = `DLR_se'[`oi',1] in `i'
            qui replace n_selected = `DLR_n'[`oi',1]  in `i'
        }
        else if "`m'" == "DLC" {
            qui replace estimate   = `DLC_b'[`oi',1]  in `i'
            qui replace std_error  = `DLC_se'[`oi',1] in `i'
            qui replace n_selected = `DLC_n'[`oi',1]  in `i'
        }
    }
}

gen double ci_lo = estimate - 1.96 * std_error
gen double ci_hi = estimate + 1.96 * std_error
order method outcome estimate std_error n_selected ci_lo ci_hi
list, sepby(outcome) abbreviate(20)
export delimited "results_table2.csv", replace
di _n "Wrote results_table2.csv"
restore


* ── 9b. Selection diagnostic CSV ─────────────────────────────────

preserve
clear
set obs 6
gen str16 outcome = ""
gen str14 method  = ""
gen long  n_Iy = .
gen long  n_Id = .
gen long  n_union = .
local i = 0
forvalues oi = 1/3 {
    local o : word `oi' of viol prop murd
    if "`o'" == "viol" local olab "Violent crime"
    if "`o'" == "prop" local olab "Property crime"
    if "`o'" == "murd" local olab "Murder"
    local ++i
    qui replace outcome = "`olab'"        in `i'
    qui replace method  = "DL (rigorous)" in `i'
    qui replace n_Iy    = `DLR_Iy'[`oi',1] in `i'
    qui replace n_Id    = `DLR_Id'[`oi',1] in `i'
    qui replace n_union = `DLR_U'[`oi',1]  in `i'
    local ++i
    qui replace outcome = "`olab'"        in `i'
    qui replace method  = "DL (CV)"       in `i'
    qui replace n_Iy    = `DLC_Iy'[`oi',1] in `i'
    qui replace n_Id    = `DLC_Id'[`oi',1] in `i'
    qui replace n_union = `DLC_U'[`oi',1]  in `i'
}
list, sepby(outcome) abbreviate(20)
export delimited "selection_diagnostic.csv", replace
di "Wrote selection_diagnostic.csv"
restore


* ── 10. Figures ──────────────────────────────────────────────────
*
* Figure construction is delegated to the companion file figures.do,
* which reads the two CSVs we just wrote (results_table2.csv and
* selection_diagnostic.csv) and rebuilds all three PNGs in seconds.
*
* Keeping the plotting logic in one file gives us a single source of
* truth: a styling tweak only needs to be made in figures.do (no need
* to re-run the full ~10-minute LASSO pipeline).
*
* The three outputs are:
*   stata_double_lasso_estimates.png       (forest plot, 3 panels)
*   stata_double_lasso_selection.png       (selection bars, 4 metrics x 2 methods)
*   stata_double_lasso_methods_compare.png (rigorous vs CV with point labels)

di _n(2) "========================================"
di "STEP 10 - FIGURES (delegated to figures.do)"
di "========================================"

do figures.do


* ── 11. Summary ──────────────────────────────────────────────────

di _n(2) "========================================"
di "STEP 11 - SUMMARY"
di "========================================"
di ""
di "Generated files:"
di "  results_table2.csv          (5 estimators x 3 outcomes)"
di "  selection_diagnostic.csv    (|I_y|, |I_d|, union)"
di "  stata_double_lasso_estimates.png       (forest plot)"
di "  stata_double_lasso_selection.png       (selection bars)"
di "  stata_double_lasso_methods_compare.png (rigorous vs CV)"
di ""
di "Key practical insight from Fitzgerald et al. (2026):"
di "DL helps most when the TREATMENT is highly predictable from the"
di "controls but the OUTCOME is not. That is the case here: the"
di "effective abortion rate is well explained by lagged demographics"
di "and within-state trends, while crime is much noisier."


* ── 12. pdslasso one-line demo (three-estimator output) ──────────

* The explicit DL-rigorous recipe in Step 7 corresponds to the PDS
* (post-double-selection) column that pdslasso reports. But pdslasso
* also computes two additional valid estimators — the lasso-
* orthogonalized and post-lasso-orthogonalized versions — based on
* the Belloni-Chernozhukov-Hansen-Chen orthogonalization framework.
* All three target the same causal alpha; they differ in how the
* high-dimensional controls are residualised out. The post's Section
* 8 walks through the three side-by-side; the call below produces
* the actual three-panel output on the violent-crime equation.

di _n(2) "========================================"
di "STEP 12 - pdslasso three-estimator demo (violent crime)"
di "========================================"

pdslasso DyV DxV (zv1-zv284), cluster(state) loptions(c(1.1) gamma(0.05))

di _n "=== Script completed successfully ==="

log close
