*===============================================================================
* analysis.do
* Synthetic Difference-in-Differences (SDID): California's Proposition 99
* Companion script for the Stata tutorial post `stata_sdid`.
*
* Run (batch):
*   "/Applications/Stata/StataSE.app/Contents/MacOS/stata-se" -b do analysis.do
*
* Requires (all from SSC): sdid, synth, synth2
*   . ssc install sdid
*   . ssc install synth2
*   . ssc install synth
*
* Data: prop99_example.dta (Arkhangelsky et al. 2021 / Abadie et al. 2010).
*       39 US states, 1970-2000, outcome = cigarette packs per capita.
*       California is the single treated unit; Proposition 99 takes effect 1989.
*       The panel is OUTCOME-ONLY (no covariates), so synthetic control and SDID
*       see exactly the same information set -- an apples-to-apples comparison.
*       Estimand: ATT -- the effect of Proposition 99 on California, 1989-2000.
*===============================================================================

clear all
set more off
set scheme s2color
set linesize 100

cd "/Users/carlos/GitHub/starter-academic-v501/content/post/stata_sdid"   // students: set this to your local copy of this post folder
capture mkdir web_app
capture mkdir web_app/data

* Site colour palette (RGB strings for Stata graphs)
global TREAT "217 119 87"   // #d97757 warm orange  -> California / observed
global CTRL  "106 155 204"  // #6a9bcc steel blue    -> control / synthetic
global TEAL  "0 212 200"    // #00d4c8 teal          -> SDID
global INK   "20 20 19"     // #141413

*-------------------------------------------------------------------------------
* 1. DATA
*-------------------------------------------------------------------------------
capture confirm file prop99_example.dta
if _rc {
    webuse set www.damianclarke.net/stata/
    webuse prop99_example.dta, clear
    save prop99_example.dta, replace
}
use prop99_example.dta, clear
describe
tab treated
summarize packspercapita

encode state, gen(id)
xtset id year
summ id if state=="California", meanonly
local ca = r(mean)
scalar ca_id = `ca'
di as result "California id = `ca'"

*-------------------------------------------------------------------------------
* 2. EDA: California vs. the simple average of the 38 control states
*-------------------------------------------------------------------------------
preserve
    gen byte iscal = state=="California"
    collapse (mean) packs=packspercapita, by(iscal year)
    reshape wide packs, i(year) j(iscal)
    label var packs1 "California"
    label var packs0 "Average of 38 controls"
    twoway (line packs1 year, lcolor("$TREAT") lwidth(thick))                  ///
           (line packs0 year, lcolor("$CTRL") lwidth(medthick) lpattern(dash)), ///
           xline(1989, lcolor(gs10) lpattern(solid))                          ///
           ytitle("Cigarette packs per capita") xtitle("")                    ///
           xlabel(1970(5)2000)                                                ///
           legend(order(1 "California" 2 "Average of 38 controls") pos(1) ring(0) cols(1) size(small)) ///
           title("California vs. the raw control average", size(medium))      ///
           note("Vertical line: Proposition 99 takes effect (1989).")
    graph export "stata_sdid_raw_trends.png", replace width(2000)
restore

*-------------------------------------------------------------------------------
* 3. The original difference-in-differences: a raw 2x2
*-------------------------------------------------------------------------------
gen byte cal  = state=="California"
gen byte post = year>=1989
quietly summ packspercapita if cal==1 & post==0
scalar m_ca_pre  = r(mean)
quietly summ packspercapita if cal==1 & post==1
scalar m_ca_post = r(mean)
quietly summ packspercapita if cal==0 & post==0
scalar m_co_pre  = r(mean)
quietly summ packspercapita if cal==0 & post==1
scalar m_co_post = r(mean)
scalar did2x2 = (m_ca_post - m_ca_pre) - (m_co_post - m_co_pre)
di as result "2x2 DiD = " did2x2
* identical to the interaction in a saturated regression:
reg packspercapita i.cal##i.post
drop cal post

*-------------------------------------------------------------------------------
* 4. The original synthetic control (Abadie et al. 2010) via synth2
*    Match on the full pre-period outcome PATH (each pre-year a separate
*    predictor) -- the fair analogue to SDID's unit weights.
*-------------------------------------------------------------------------------
local preds ""
forvalues y = 1970/1988 {
    local preds "`preds' packspercapita(`y')"
}

synth2 packspercapita `preds', trunit(`ca') trperiod(1989) frame(sc2) symbol(2) nofigure
scalar sc_att  = e(att)
scalar sc_rmse = e(rmse)
matrix scU = e(U_wt)
matrix list scU

* export synth2 donor weights (rownames carry the donor names)
local rn : rownames scU
file open fh using "web_app/data/sc_omega.csv", write replace
file write fh "state,weight" _n
local i = 0
foreach s of local rn {
    local ++i
    local w = scU[`i',1]
    file write fh "`s',`w'" _n
}
file close fh

* pull California's synthetic path + gap out of the synth2 frame (by var label)
tempfile scser
frame change sc2
    keep if id==`ca'
    foreach v of varlist _all {
        local lbl : variable label `v'
        if strpos("`lbl'","prediction")        rename `v' sc_synth
        if strpos("`lbl'","treatment effect")   rename `v' sc_effect
    }
    keep year sc_synth sc_effect
    save `scser', replace
frame change default

* SC inference: in-space placebo (RMSPE-ratio) test -> p-value (optional)
capture noisily synth2 packspercapita `preds', trunit(`ca') trperiod(1989) placebo(unit) nofigure
if _rc==0 {
    matrix scPV = e(pval)
    di as result "--- synth2 in-space placebo p-values e(pval) ---"
    matrix list scPV
}

*-------------------------------------------------------------------------------
* 5. Synthetic difference-in-differences (Arkhangelsky et al. 2021) via sdid
*    Run A: point estimate + canonical figure + returned unit/time weights
*-------------------------------------------------------------------------------
use prop99_example.dta, clear
encode state, gen(id)

sdid packspercapita state year treated, method(sdid) vce(noinference) graph g1on ///
     returnweights mattitles                                                     ///
     g1_opt(ylabel(-110(20)50) xtitle(""))                                       ///
     g2_opt(ylabel(0(25)150) ytitle("Packs per capita"))
graph export "stata_sdid_sdid_main.png", replace width(2000)
scalar sdid_att = e(ATT)
di as result "SDID ATT = " sdid_att

* capture the treated + SDID synthetic outcome trajectories
matrix S = e(series)
tempfile sdidser
preserve
    clear
    svmat S, names(col)
    rename (Yco1989 Ytr1989) (sdid_synth ca_actual)
    keep year sdid_synth ca_actual
    save `sdidser', replace
restore

* export SDID unit weights (omega) and time weights (lambda)
preserve
    keep state omega1989
    duplicates drop
    rename omega1989 omega
    gsort -omega
    export delimited using "web_app/data/sdid_omega.csv", replace
restore
tempfile lamf
preserve
    keep year lambda1989
    duplicates drop
    rename lambda1989 lambda
    export delimited using "web_app/data/sdid_lambda.csv", replace
    save `lamf', replace
restore
capture drop omega1989 lambda1989

* Run B: placebo inference (the valid choice with ONE treated unit)
sdid packspercapita state year treated, vce(placebo) seed(1213)
scalar sdid_se  = e(se)
scalar sdid_cil = e(ATT_l)
scalar sdid_cir = e(ATT_r)
di as result "SDID ATT = " e(ATT) "  SE = " sdid_se "  95% CI = [" sdid_cil "," sdid_cir "]"

*-------------------------------------------------------------------------------
* 6. The three estimators in one framework: method(did|sc|sdid)
*-------------------------------------------------------------------------------
sdid packspercapita state year treated, method(did) vce(noinference) graph g1on  ///
     g1_opt(ylabel(-110(20)50) xtitle(""))                                       ///
     g2_opt(ylabel(0(25)150) ytitle("Packs per capita"))
graph export "stata_sdid_did_panel.png", replace width(2000)
scalar did_att = e(ATT)

sdid packspercapita state year treated, method(sc) vce(noinference) graph g1on   ///
     g1_opt(ylabel(-110(20)50) xtitle(""))                                       ///
     g2_opt(ylabel(0(25)150) ytitle("Packs per capita"))
graph export "stata_sdid_sc_panel.png", replace width(2000)
scalar sc_sdidframe_att = e(ATT)

di as result "DiD(sdid)=" did_att "  SC(sdid)=" sc_sdidframe_att "  SDID=" sdid_att

*-------------------------------------------------------------------------------
* 7. Putting them side by side: one chart of California vs. every counterfactual
*-------------------------------------------------------------------------------
preserve
    keep if state!="California"
    collapse (mean) ctrl_mean=packspercapita, by(year)
    tempfile cm
    save `cm', replace
restore

use `sdidser', clear
merge 1:1 year using `scser', nogen
merge 1:1 year using `cm',   nogen
merge 1:1 year using `lamf', nogen
* DiD counterfactual: California's pre-level shifted by the controls' change
summ ca_actual if year<=1988, meanonly
local capre = r(mean)
summ ctrl_mean if year<=1988, meanonly
local copre = r(mean)
gen did_cf = `capre' + (ctrl_mean - `copre')
* SDID counterfactual: e(series) Yco matches TRENDS not levels (unit FE absorbs
* the offset), so anchor it by the lambda-WEIGHTED pre-period gap -- exactly the
* baseline SDID differences against. Post-period (ca_actual - sdid_cf) then
* averages to the SDID ATT.
gen double pregap = lambda*(sdid_synth - ca_actual) if year<=1988 & lambda<.
egen double offset_sdid = total(pregap)
gen sdid_cf = sdid_synth - offset_sdid
summ offset_sdid, meanonly
di as result "SDID lambda-weighted pre-period gap (anchor) = " r(mean)
drop pregap offset_sdid
order year ca_actual did_cf sc_synth sdid_cf sdid_synth ctrl_mean sc_effect lambda
export delimited using "web_app/data/series.csv", replace
list year ca_actual did_cf sc_synth sdid_cf, sepby(year) noobs

twoway (line ca_actual year, lcolor("$TREAT") lwidth(thick))                     ///
       (line did_cf    year, lcolor(gs7)      lpattern(dash))                    ///
       (line sc_synth  year, lcolor("$CTRL")  lpattern(shortdash) lwidth(medthick)) ///
       (line sdid_cf   year, lcolor("$TEAL")  lpattern(solid)     lwidth(medthick)),  ///
       xline(1989, lcolor(gs10))                                                 ///
       ytitle("Cigarette packs per capita") xtitle("") xlabel(1970(5)2000)      ///
       legend(order(1 "California (observed)" 2 "DiD counterfactual"             ///
                    3 "Synthetic control (synth2)" 4 "SDID counterfactual")      ///
              rows(2) pos(6) size(small))                                        ///
       title("Four counterfactuals for California", size(medium))                ///
       note("SDID counterfactual anchored to California by its {&lambda}-weighted pre-period gap.")
graph export "stata_sdid_compare_paths.png", replace width(2000)

* synth2 path + gap figures (built from the merged series)
twoway (line ca_actual year, lcolor("$TREAT") lwidth(thick))                     ///
       (line sc_synth  year, lcolor("$CTRL")  lpattern(dash) lwidth(medthick)),  ///
       xline(1989, lcolor(gs10)) ytitle("Packs per capita") xtitle("")           ///
       xlabel(1970(5)2000)                                                       ///
       legend(order(1 "California" 2 "Synthetic California") pos(1) ring(0) cols(1) size(small)) ///
       title("Synthetic control fit (synth2)", size(medium))
graph export "stata_sdid_sc_path.png", replace width(2000)

twoway (line sc_effect year, lcolor("$INK") lwidth(medthick)),                   ///
       yline(0, lcolor(gs10)) xline(1989, lcolor(gs10) lpattern(dash))           ///
       ytitle("Gap: California - synthetic") xtitle("") xlabel(1970(5)2000)      ///
       title("Estimated gap (synth2)", size(medium))
graph export "stata_sdid_sc_gap.png", replace width(2000)

* time-weight bar chart (SDID puts all pre-weight on 1986-1988)
preserve
    import delimited "web_app/data/sdid_lambda.csv", clear
    twoway (bar lambda year if year<=1988, color("$CTRL") barwidth(0.8)),        ///
           ytitle("SDID time weight ({&lambda})") xtitle("")                     ///
           xlabel(1970(2)1988) ylabel(0(.1).5) legend(off)                       ///
           title("Where SDID looks: pre-period time weights", size(medium))      ///
           note("Pre-period weight (1970-1988): zero until 1986, then 0.37, 0.21, 0.43 on 1986-1988." ///
                "Post-1989 years are omitted; SDID weights them uniformly at 1/12.")
    graph export "stata_sdid_lambda.png", replace width(2000)
restore

*-------------------------------------------------------------------------------
* 8. Inference figure: SDID in-space placebo distribution
*    Drop California; assign each control as the placebo-treated unit at 1989;
*    re-estimate SDID; collect placebo ATTs.  p = share with |placebo| >= |obs|.
*-------------------------------------------------------------------------------
use prop99_example.dta, clear
drop if state=="California"
levelsof state, local(ctrls)
tempname pf
postfile `pf' str20 pstate double ptau using "_placebo.dta", replace
foreach s of local ctrls {
    preserve
        gen byte ptreat = (state=="`s'") & (year>=1989)
        capture sdid packspercapita state year ptreat, vce(noinference)
        if _rc==0 post `pf' ("`s'") (e(ATT))
    restore
}
postclose `pf'

use "_placebo.dta", clear
local aatt = sdid_att
count if abs(ptau) >= abs(`aatt')
local pc = r(N)
count
local pn = r(N)
scalar sdid_pperm = `pc'/`pn'
di as result "SDID placebo permutation p-value = " sdid_pperm "  (n=`pn')"
export delimited using "web_app/data/placebo.csv", replace

local aatts : di %4.1f `aatt'
local pvals : di %5.3f sdid_pperm
twoway (histogram ptau, width(2) color("${CTRL}%70") lcolor(white)),             ///
       xline(`aatt', lcolor("$TREAT") lwidth(thick))                             ///
       xtitle("Placebo ATT among control states") ytitle("Density")             ///
       title("SDID placebo distribution", size(medium))                         ///
       note("Orange line: California's estimated ATT (`aatts'). Permutation p = `pvals'.")
graph export "stata_sdid_placebo_hist.png", replace width(2000)

*-------------------------------------------------------------------------------
* 9. Summary table of every ATT estimate -> web_app/data/atts.csv
*-------------------------------------------------------------------------------
clear
set obs 5
gen str30 method = ""
gen double att  = .
gen double se   = .
gen double ci_l = .
gen double ci_r = .
gen double note_pval = .
replace method = "Raw 2x2 DiD"                 in 1
replace att = did2x2                            in 1
replace method = "DiD (TWFE, sdid)"            in 2
replace att = did_att                           in 2
replace method = "Synthetic control (synth2)"  in 3
replace att = sc_att                            in 3
replace method = "SC (sdid framework)"         in 4
replace att = sc_sdidframe_att                  in 4
replace method = "SDID"                         in 5
replace att = sdid_att                          in 5
replace se = sdid_se                            in 5
replace ci_l = sdid_cil                         in 5
replace ci_r = sdid_cir                         in 5
replace note_pval = sdid_pperm                  in 5
export delimited using "web_app/data/atts.csv", replace
list, noobs

*-------------------------------------------------------------------------------
* Clean up scratch file
*-------------------------------------------------------------------------------
capture erase "_placebo.dta"

di as result _n "==================== KEY NUMBERS ===================="
di as result "Raw 2x2 DiD                 = " %7.2f did2x2
di as result "DiD (sdid framework)        = " %7.2f did_att
di as result "Synthetic control (synth2)  = " %7.2f sc_att   "   (RMSE " %4.2f sc_rmse ")"
di as result "SC (sdid framework)         = " %7.2f sc_sdidframe_att
di as result "SDID                        = " %7.2f sdid_att
di as result "SDID placebo SE             = " %7.2f sdid_se
di as result "SDID 95% CI                 = [" %6.2f sdid_cil ", " %6.2f sdid_cir "]"
di as result "SDID permutation p-value    = " %5.3f sdid_pperm
di as result "====================================================="
