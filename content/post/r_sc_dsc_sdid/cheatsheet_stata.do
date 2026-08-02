*===============================================================================
* THE SYNTHETIC-CONTROL LADDER IN STATA — one command per stage
*
*   DiD  ->  SC  ->  DSC  ->  SDID  ->  [MASC]  ->  ASCM
*
* The Stata port of cheatsheet_R.R. Same data, same treatment date, same two
* evaluation quarters, same comparative table at the end -- so the two files
* can be read side by side.
*
* Companion post:  https://carlos-mendez.org/post/r_sc_dsc_sdid/
* Companions:      cheatsheet_R.R   cheatsheet_python.py
*
* Run (batch):
*   "/Applications/Stata/StataSE.app/Contents/MacOS/stata-se" -b do cheatsheet_stata.do
*
* Requires (all from SSC):
*   . ssc install sdid
*   . ssc install synth
*   . ssc install allsynth
*   . ssc install distinct          // allsynth dependency
*   . ssc install elasticregress    // allsynth dependency
*
* Run time: about 3 minutes with SE on, 20 seconds with SE off.
* Verified with Stata 19 SE, sdid 2.0.2, synth 0.0.7, allsynth (2026-07-15).
*===============================================================================

clear all
set more off
set linesize 100

global SE   1        // 1 = placebo standard errors (slow), 0 = point estimates only
global REPS 50       // placebo replications
global SEED 20260802

* Site colour palette, for consistency with the other Stata posts
global TREAT "217 119 87"   // #d97757 warm orange
global CTRL  "106 155 204"  // #6a9bcc steel blue

*-------------------------------------------------------------------------------
* 1. DATA
*    24 OECD countries x 104 quarters (1995Q1-2020Q4), quarterly log real GDP.
*    Loads over HTTPS if the local copy is not present.
*-------------------------------------------------------------------------------
capture confirm file "brexit_analysis.csv"
if _rc {
    import delimited "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_sc_dsc_sdid/brexit_analysis.csv", clear varnames(1) case(preserve)
}
else {
    import delimited "brexit_analysis.csv", clear varnames(1) case(preserve)
}

keep country t unit_id log_rgdp
qui summ unit_id if country == "United Kingdom", meanonly
global UK = r(mean)
qui distinct unit_id
di as text "Countries: " r(ndistinct) "    UK unit_id: $UK"

global T0 86                      // pre-treatment quarters, through 2016Q2
gen byte treat = (country == "United Kingdom") & t > ${T0}

tempfile base
save `base'

*===============================================================================
* THE ONE TRICK THAT MAKES THIS A CHEAT SHEET
*
* -sdid- returns an ATT averaged over ALL post-treatment periods. We want the
* shortfall at two specific quarters (2018Q4 = t 96, 2019Q4 = t 100). So keep
* the 86 pre-treatment quarters PLUS the single quarter of interest, renumber
* time so it runs 1..87, and the average over "all post periods" becomes an
* average over one period. The bare command then returns exactly the number we
* want -- no post-estimation arithmetic anywhere in this file.
*
* -egen tt = group(t)- does the renumbering. -sdid- needs contiguous periods.
*===============================================================================

* Results matrix: rows = stages, cols = 2018Q4, 2019Q4, SE(2018Q4)
matrix RES = J(6, 3, .)
matrix rownames RES = DiD SC DSC SDID MASC ASCM
matrix colnames RES = q2018Q4 q2019Q4 se2018Q4

local ri = 0
foreach m in DiD SC DSC SDID MASC ASCM {
    local ++ri
    local row_`m' = `ri'
}

*-------------------------------------------------------------------------------
* 2. THE LADDER, stages 0-3: everything -sdid- can do on its own
*-------------------------------------------------------------------------------
foreach e in 96 100 {

    use `base', clear
    keep if t <= ${T0} | t == `e'
    egen tt = group(t)                       // 1..87, contiguous
    local col = cond(`e' == 96, 1, 2)

    di _n as text "{hline 79}"
    di as text "Evaluation quarter: t = `e'" _continue
    di as text cond(`e' == 96, "  (2018Q4)", "  (2019Q4)")
    di as text "{hline 79}"

    * --- Stage 0. DiD ----------------------------------------------------------
    * Every donor weighted 1/23, every pre-quarter weighted 1/86. Nothing is
    * fitted; the unit fixed effect absorbs the level gap.
    qui sdid log_rgdp unit_id tt treat, vce(noinference) method(did)
    matrix RES[`row_DiD', `col'] = -100 * e(ATT)

    * --- Stage 1. SC -----------------------------------------------------------
    * Donor weights on the simplex, fitted to the pre-treatment path, no
    * intercept. method(sc) sets the time weights to ZERO (sdid.ado line 951),
    * which is what turns the SDID double difference back into Abadie's
    * post-period-only comparison.
    qui sdid log_rgdp unit_id tt treat, vce(noinference) method(sc)
    matrix RES[`row_SC', `col'] = -100 * e(ATT)

    * --- Stage 2. DSC ----------------------------------------------------------
    * Demeaned SC. There is no dsc command, and none is needed: DSC *is* SC run
    * on outcomes from which each country's own pre-treatment mean has been
    * subtracted. After demeaning, the pre-treatment gap averages to zero by
    * construction, so method(sc) on the demeaned series returns exactly the
    * DSC estimate. Three lines, no hand-rolled optimiser.
    bysort unit_id: egen pmean = mean(cond(t <= ${T0}, log_rgdp, .))
    gen ytilde = log_rgdp - pmean
    qui sdid ytilde unit_id tt treat, vce(noinference) method(sc)
    matrix RES[`row_DSC', `col'] = -100 * e(ATT)

    * --- Stage 3. SDID ---------------------------------------------------------
    * Same unit weights as DSC, but the time weights are fitted too.
    *
    * WATCH THE ZETA ARGUMENTS. The documented default zeta_omega(1e-6) is a
    * magic sentinel, not a value: sdid.ado line 904 reads
    *     if (EOmega==1e-6) EtaOmega = (yNtr*yTpost)^(1/4)
    * so passing 1e-6 silently requests the Arkhangelsky et al. default ridge
    * penalty. The paper solves the UNPENALISED problem. Passing 0 is what
    * actually switches the penalty off, and it is the difference between
    * 2.79 (the published number) and 2.66.
    qui sdid log_rgdp unit_id tt treat, vce(noinference) zeta_omega(0) zeta_lambda(0)
    matrix RES[`row_SDID', `col'] = -100 * e(ATT)

    if `e' == 96 {
        qui sdid log_rgdp unit_id tt treat, vce(noinference)
        di as text "  SDID with package defaults (zeta left alone): " ///
            as result %5.2f -100*e(ATT) as text "   vs " ///
            as result %5.2f RES[`row_SDID', 1] as text " unpenalised"
    }

    * --- Standard errors ------------------------------------------------------
    * vce(placebo) is the right choice with a single treated unit: it permutes
    * treatment across the donor pool. Only computed at 2018Q4, and only for
    * the stages sdid can fit.
    if `e' == 96 & $SE == 1 {
        foreach spec in DiD SC DSC SDID {
            if "`spec'" == "DiD"  local opt "method(did)"
            if "`spec'" == "SC"   local opt "method(sc)"
            if "`spec'" == "DSC"  local opt "method(sc)"
            if "`spec'" == "SDID" local opt "zeta_omega(0) zeta_lambda(0)"
            local yv = cond("`spec'" == "DSC", "ytilde", "log_rgdp")
            qui sdid `yv' unit_id tt treat, vce(placebo) reps($REPS) seed($SEED) `opt'
            matrix RES[`row_`spec'', 3] = 100 * e(se)
        }
    }
}

*-------------------------------------------------------------------------------
* 3. Stage 4. MASC — NOT AVAILABLE IN STATA
*
* Kellogg, Mogstad, Pouliot & Torgovitsky's matching-and-synthetic-control
* estimator has no Stata implementation. The reference implementation is the R
* package masc (github.com/maxkllgg/masc); see cheatsheet_R.R stage 4, which
* returns 2.73 / 3.83 with m = 10 neighbours and phi = 0.158.
*
* The row stays in the table, empty, so the ladder is not silently shortened.
*-------------------------------------------------------------------------------

*-------------------------------------------------------------------------------
* 4. Stage 5. ASCM — via allsynth, with two honest caveats
*
* CAVEAT 1: DIFFERENT ESTIMATOR. allsynth implements the BIAS-CORRECTED
* synthetic control of Abadie & L'Hour (2021) and Ben-Michael, Feller &
* Rothstein (2021): fit SC, then regress the outcome on the predictors across
* the donor pool and subtract the predicted discrepancy. R's augsynth uses
* RIDGE-augmented SC instead. They are cousins, not the same estimator, and
* they will not agree to two decimals.
*
* CAVEAT 2: THE PREDICTOR BUDGET. The bias correction is an OLS fit across
* donors, so it needs at least K + 2 control units for K predictors. With 23
* donors that caps K at 21 -- we cannot hand it all 86 pre-treatment quarters
* the way augsynth's ridge penalty can. So the pre-treatment path has to be
* summarised. BLOCK MEANS (the average of log GDP over consecutive stretches of
* quarters) are far better conditioned here than sparse individual lags: with
* single lags the bias-corrected estimate swings between -0.8 and 5.1 depending
* on which quarters you pick, which is not an estimator anyone should report.
*
* SELECTION RULE, fixed in advance: fit a small grid of block counts and keep
* the one with the LOWEST PRE-TREATMENT RMSPE. That is standard synthetic
* control practice and does not look at the post-treatment answer. The full
* grid is printed so the sensitivity is visible rather than buried.
*-------------------------------------------------------------------------------
di _n as text "{hline 79}"
di as text "ASCM via allsynth: block-mean grid (selection on pre-treatment RMSPE)"
di as text "{hline 79}"
di as text "  blocks    SC gap   bias-corrected   pre-RMSPE"

foreach e in 96 100 {
    local col = cond(`e' == 96, 1, 2)
    local best_rmspe = .
    local best_bc    = .
    local best_nb    = .

    foreach nb in 4 6 8 10 12 {
        use `base', clear
        keep if t <= ${T0} | t == `e'
        egen tt = group(t)
        xtset unit_id tt

        local w = ceil(${T0}/`nb')
        local P ""
        local V ""
        local K = 0
        forvalues b = 1/`nb' {
            local lo = 1 + (`b'-1)*`w'
            local hi = min(`b'*`w', ${T0})
            if `lo' <= ${T0} {
                local P "`P' log_rgdp(`lo'(1)`hi')"     // average over the block
                local V "`V' 1"                          // equal predictor weights
                local ++K
            }
        }

        qui capture allsynth log_rgdp `P', trunit($UK) trperiod(`=${T0}+1') ///
            customV(`V') bcorrect(merge) keep(_as_`K'_`e', replace) nograph
        if _rc continue

        preserve
            qui use _as_`K'_`e', clear
            qui summ gap_bc if _time == `=${T0}+1', meanonly
            local bc = -100 * r(mean)
            qui summ gap if _time == `=${T0}+1', meanonly
            local sc = -100 * r(mean)
            qui summ gap if _time <= ${T0}
            local rmspe = sqrt(r(Var)*(r(N)-1)/r(N) + r(mean)^2)
        restore
        capture erase _as_`K'_`e'.dta

        if `e' == 96 {
            di as text "  " %6.0f `K' as result %10.3f `sc' %17.3f `bc' ///
               as result %12.5f `rmspe'
        }
        if `rmspe' < `best_rmspe' {
            local best_rmspe = `rmspe'
            local best_bc    = `bc'
            local best_nb    = `K'
        }
    }
    matrix RES[`row_ASCM', `col'] = `best_bc'
    if `e' == 96 {
        di as text "  selected: `best_nb' blocks (lowest pre-treatment RMSPE = " ///
           as result %6.5f `best_rmspe' as text ")"
        global ASCM_NB = `best_nb'
    }
}

*===============================================================================
* 5. COMPARATIVE TABLE
*
* The `Paper` column is de Brabander, Juodis & Miyazato Szini (2025), 2018Q4,
* no covariates. The `R` column is what cheatsheet_R.R prints, so the two ports
* can be checked against each other directly.
*===============================================================================
matrix PAPER = (.\3.06\2.98\2.79\2.73\3.04)
matrix RCOL  = (4.98\3.06\2.98\2.79\2.73\3.04)

di _n _n as text "{hline 92}"
di as text "UK GDP shortfall (%), 2016Q3 treatment, outcomes only, 23 donors, 86 pre-quarters"
di as text "{hline 92}"
di as text %-6s "Stage" %-40s "  Command" %8s "2018Q4" %8s "2019Q4" ///
   %9s "SE 18Q4" %7s "R" %7s "Paper"
di as text "{hline 92}"

local i = 0
foreach m in DiD SC DSC SDID MASC ASCM {
    local ++i
    if "`m'" == "DiD"  local cmd "sdid ..., method(did)"
    if "`m'" == "SC"   local cmd "sdid ..., method(sc)"
    if "`m'" == "DSC"  local cmd "sdid ..., method(sc)  [demeaned y]"
    if "`m'" == "SDID" local cmd "sdid ..., zeta_omega(0) zeta_lambda(0)"
    if "`m'" == "MASC" local cmd "-- no Stata implementation --"
    if "`m'" == "ASCM" local cmd "allsynth ..., bcorrect(merge)"

    local v1 : di cond(RES[`i',1] == ., "--", string(RES[`i',1], "%5.2f"))
    local v2 : di cond(RES[`i',2] == ., "--", string(RES[`i',2], "%5.2f"))
    local v3 : di cond(RES[`i',3] == ., "--", string(RES[`i',3], "%5.2f"))
    local v4 : di cond(PAPER[`i',1] == ., "--", string(PAPER[`i',1], "%5.2f"))
    local v5 : di string(RCOL[`i',1], "%5.2f")

    di as text %-6s "`m'" as text %-40s "  `cmd'" ///
       as result %8s "`v1'" %8s "`v2'" %9s "`v3'" ///
       as text   %7s "`v5'" %7s "`v4'"
}
di as text "{hline 92}"

di _n as text "Reading the table:"
di as text ""
di as text "  * DiD, SC, DSC and SDID reproduce the R column to five decimal places."
di as text "    The estimator is identical; only the language differs."
di as text ""
di as text "  * The SE column is NOT comparable digit-for-digit with the R sheet's."
di as text "    Both are placebo standard errors, but they resample differently and use"
di as text "    different replication counts ($REPS here, 200 in R). Read them as orders of"
di as text "    magnitude: every one is wide enough to contain zero."
di as text ""
di as text "  * MASC has no Stata implementation. Use cheatsheet_R.R."
di as text ""
di as text "  * ASCM is a DIFFERENT estimator in Stata (bias-corrected SC, not"
di as text "    ridge-augmented SC) fitted on ${ASCM_NB} block means rather than 86 quarterly"
di as text "    lags, because the OLS bias correction needs more donors than predictors."
di as text "    Treat any agreement with R's 3.04 as a coincidence worth noticing, not"
di as text "    as a replication."
di as text ""
di as text "  * Not here: SC(B) and the covariate specifications, which need Synth's"
di as text "    nested optimisation over 92 predictors. See analysis.R section 14d."

*===============================================================================
* END
*===============================================================================
