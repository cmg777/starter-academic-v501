*===============================================================================
* analysis.do
* Staggered Synthetic Difference-in-Differences (SDID): Gender quotas & women in
* parliament.  Companion script for the Stata tutorial post `stata_sdid_staggered`.
*
* Run (batch):
*   "/Applications/Stata 18.0/StataMP.app/Contents/MacOS/stata-mp" -b do analysis.do
*
* Requires (all from SSC): sdid, sdid_event, panelview, reghdfe (+ ftools, unique)
*   . ssc install sdid
*   . ssc install sdid_event          // Ciccia, Clarke & Pailanir (2024)
*   . ssc install panelview
*   . ssc install reghdfe
*
* Data: quota_example.dta (Bhalotra, Clarke, Gomes & Venkataramani 2023, shipped
*       with the sdid package).  119 countries, 1990-2015, balanced panel.
*         outcome   womparl   = % women in the national parliament
*         treatment quota     = 1 once a country adopts a gender quota (absorbing)
*         control   lngdp     = log GDP per capita
*       Treatment is STAGGERED: 9 countries adopt across 7 cohorts
*       (2000, 2002, 2003, 2005, 2010, 2012, 2013); 110 never-treated controls.
*       Estimand: ATT -- the effect of adopting a quota on the adopting countries'
*       women-in-parliament share, aggregated across cohorts (Clarke et al. 2024).
*===============================================================================

clear all
set more off
set scheme s2color
set linesize 100

cd "/Users/carlosmendez/Documents/GitHub/starter-academic-v501/content/post/stata_sdid_staggered"   // students: set this to your local copy of this post folder
capture mkdir web_app
capture mkdir web_app/data

* Site colour palette (RGB strings for Stata graphs)
global TREAT "217 119 87"   // #d97757 warm orange  -> treated / adopting cohorts
global CTRL  "106 155 204"  // #6a9bcc steel blue    -> control / synthetic / never-treated
global TEAL  "0 212 200"    // #00d4c8 teal          -> SDID estimate / aggregate
global INK   "20 20 19"     // #141413 ink

* Packages (capture so re-runs do not error). sdid_event is not always on SSC.
capture ssc install sdid, replace
capture ssc install sdid_event, replace
capture which sdid_event
if _rc net install sdid_event, from("https://raw.githubusercontent.com/DiegoCiccia/sdid/main/sdid_event") replace
capture ssc install panelview, replace
capture ssc install reghdfe, replace
capture ssc install ftools, replace

capture log close
log using "analysis.log", replace text

*-------------------------------------------------------------------------------
* 1. DATA -- load, persist, document the staggered structure
*-------------------------------------------------------------------------------
capture confirm file quota_example.dta
if _rc {
    webuse set www.damianclarke.net/stata/
    webuse quota_example, clear
    save quota_example.dta, replace
}
use quota_example.dta, clear
label variable quota "Parliamentary gender quota"

describe womparl quota lngdp country year quotaYear
summarize womparl quota lngdp
encode country, gen(id)
xtset id year
xtdescribe

* Adoption cohort = first year a country is treated (quotaYear ships with the data).
* Verify it equals the first treated year, then tabulate cohort sizes.
bysort country (year): egen firsttreat = min(cond(quota==1, year, .))
gen byte evertreat = !missing(firsttreat)
capture assert firsttreat == quotaYear if evertreat   // sanity check (quotaYear ships with the data)
di as result "firsttreat == quotaYear check rc = " _rc
di as result _n "=== Adoption cohorts (one row per country) ==="
preserve
    keep country firsttreat
    duplicates drop
    tab firsttreat, missing
restore
count if quota==1
di as result "treated country-year observations = " r(N)

* cohort sizes (countries per adoption year) for later merges + the web app
preserve
    keep if evertreat
    bysort country: keep if _n==1
    contract firsttreat, freq(n_treated)
    rename firsttreat cohort
    list, noobs
    tempfile csize
    save `csize', replace
restore

*-------------------------------------------------------------------------------
* 2. EDA -- panelview (staggered structure) + a site-coloured trend figure
*-------------------------------------------------------------------------------
* (2a) Treatment-timing heatmap: the staggered "staircase"
panelview womparl quota, i(country) t(year) type(treat) bytiming               ///
    xtitle("Year") ytitle("Country (sorted by adoption timing)")               ///
    title("Staggered adoption of parliamentary gender quotas", size(medium))   ///
    ylabdist(10) xlabdist(5)
graph export "stata_sdid_staggered_panelview_treat.png", replace width(2400)

* (2b) Outcome trajectories, treated (orange) vs control (blue)
panelview womparl quota, i(country) t(year) type(outcome)                      ///
    xtitle("Year") ytitle("% women in parliament")                             ///
    title("Women in parliament: treated vs. control trajectories", size(medium))
graph export "stata_sdid_staggered_panelview_outcome.png", replace width(2400)

* (2c) Mean outcome: ever-adopting vs never-adopting (site colours)
preserve
    collapse (mean) womparl, by(evertreat year)
    reshape wide womparl, i(year) j(evertreat)
    label var womparl1 "Ever-adopting countries (mean)"
    label var womparl0 "Never-adopting countries (mean)"
    twoway (line womparl1 year, lcolor("$TREAT") lwidth(thick))                 ///
           (line womparl0 year, lcolor("$CTRL")  lwidth(medthick) lpattern(dash)), ///
           ytitle("% women in parliament") xtitle("") xlabel(1990(5)2015)       ///
           legend(order(1 "Ever-adopting (mean)" 2 "Never-adopting (mean)")      ///
                  pos(11) ring(0) cols(1) size(small))                          ///
           title("Raw outcome trends by treatment group", size(medium))         ///
           note("Adoption is staggered (2000-2013); a single group mean blurs the timing.")
    graph export "stata_sdid_staggered_raw_trends.png", replace width(2400)
restore

*-------------------------------------------------------------------------------
* 3. BASELINE -- static two-way fixed-effects DiD (the biased foil)
*    Under staggered timing with heterogeneous effects, this TWFE coefficient is
*    a contaminated weighted average that uses already-treated units as controls
*    (Goodman-Bacon 2021; de Chaisemartin & D'Haultfoeuille 2020).  Reported only
*    as a benchmark, NOT as a credible ATT.
*-------------------------------------------------------------------------------
capture reghdfe womparl quota, absorb(id year) vce(cluster id)
if _rc {
    di as error "reghdfe unavailable (rc=" _rc "); falling back to xtreg."
    xtreg womparl quota i.year, fe vce(cluster id)
}
scalar twfe_att = _b[quota]
scalar twfe_se  = _se[quota]
di as result "Static TWFE 'ATT' (biased foil) = " twfe_att "  (cluster SE " twfe_se ")"

*-------------------------------------------------------------------------------
* 4. MAIN STAGGERED SDID -- bootstrap inference + cohort-specific effects
*-------------------------------------------------------------------------------
use quota_example.dta, clear
label variable quota "Parliamentary gender quota"

sdid womparl country year quota, vce(bootstrap) seed(1213)
scalar sdid_att = e(ATT)
scalar sdid_se  = e(se)
scalar sdid_cil = e(ATT_l)
scalar sdid_cir = e(ATT_r)
di as result "SDID staggered ATT = " sdid_att "  SE = " sdid_se ///
             "  95% CI = [" sdid_cil ", " sdid_cir "]"

* ---- e(tau): cohort-specific ATTs (Tau, Std.Err., Time) ----
matrix Tau = e(tau)
matrix list Tau
preserve
    clear
    svmat Tau                                   // Tau1=tau, Tau2=se, Tau3=cohort year
    rename (Tau1 Tau2 Tau3) (tau se cohort)
    gen lci = tau - 1.96*se
    gen uci = tau + 1.96*se
    gen t_post = 2015 - cohort + 1
    merge 1:1 cohort using `csize', nogen
    * aggregation weight = treated (unit x post-period) share -> reproduces overall ATT
    gen w_raw = n_treated * t_post
    egen w_tot = total(w_raw)
    gen agg_weight = w_raw / w_tot
    gsort cohort
    order cohort tau se lci uci n_treated t_post agg_weight
    list cohort tau se n_treated t_post agg_weight, noobs
    * verification: weighted average of cohort taus = overall ATT
    gen wtau = agg_weight*tau
    egen check_att = total(wtau)
    di as result "Sum of weighted cohort taus = " check_att "  (should match overall ATT " sdid_att ")"
    drop w_raw w_tot wtau check_att
    export delimited cohort tau se lci uci n_treated t_post agg_weight ///
        using "web_app/data/cohorts.csv", replace
restore

* ---- cohort-ATT figure: tau_a with 95% CI, zero line, aggregate-ATT line ----
preserve
    clear
    svmat Tau                                   // Tau1=tau, Tau2=se, Tau3=cohort year
    rename (Tau1 Tau2 Tau3) (tau se cohort)
    gen lci = tau - 1.96*se
    gen uci = tau + 1.96*se
    twoway (rcap lci uci cohort, lcolor("$CTRL"))                               ///
           (scatter tau cohort, mcolor("$TREAT") msize(large) ms(d)),           ///
           yline(0, lcolor(gs10) lpattern(dash))                                ///
           yline(`=sdid_att', lcolor("$TEAL") lwidth(medthick))                 ///
           xlabel(2000 2002 2003 2005 2010 2012 2013, angle(45))                ///
           ytitle("Adoption-cohort ATT (pp)") xtitle("Adoption year (cohort)")   ///
           legend(off)                                                          ///
           title("Cohort-specific SDID effects", size(medium))                  ///
           note("Teal line: overall weighted ATT (8.0 pp). Cohorts range from -3.5 (2005) to +21.8 (2012).")
    graph export "stata_sdid_staggered_cohort_taus.png", replace width(2400)
restore

* ---- e(series): treated vs synthetic outcome path per cohort -> CSV ----
matrix S = e(series)
preserve
    clear
    svmat S, names(col)
    reshape long Yco Ytr, i(year) j(cohort)
    rename (Yco Ytr) (y_synth y_treated)
    drop if missing(y_treated) & missing(y_synth)
    order cohort year y_treated y_synth
    sort cohort year
    export delimited using "web_app/data/series_by_cohort.csv", replace
restore

* ---- e(lambda): pre-period time weights per cohort -> CSV ----
matrix L = e(lambda)
local cohlist 2000 2002 2003 2005 2010 2012 2013
preserve
    clear
    svmat L
    * last row holds adoption-year labels; last column (L8) is the calendar year
    local nr = rowsof(L)
    drop in `nr'
    rename L8 year
    local j = 0
    foreach c of local cohlist {
        local ++j
        rename L`j' lam`c'
    }
    reshape long lam, i(year) j(cohort)
    rename lam lambda
    drop if missing(lambda)
    order cohort year lambda
    sort cohort year
    export delimited using "web_app/data/lambda_by_cohort.csv", replace
restore

* ---- donor (unit) weights per cohort -> CSV ----
*      Use returnweights: the country name is native in the data, avoiding the
*      e(omega) matrix rownames (which mattitles fills with names that can carry
*      spaces).  A quick noinference re-fit returns the same weights.
sdid womparl country year quota, vce(noinference) returnweights
preserve
    keep country quotaYear omega2000 omega2002 omega2003 omega2005 omega2010 omega2012 omega2013
    duplicates drop
    keep if missing(quotaYear)                 // donors = never-treated countries
    drop quotaYear
    reshape long omega, i(country) j(cohort)
    drop if missing(omega) | omega==0          // keep nonzero donors
    order cohort country omega
    gsort cohort -omega
    export delimited using "web_app/data/omega_by_cohort.csv", replace
restore

* ---- treated-vs-synthetic path for the 2002 cohort (the worked example) ----
*      SDID matches the pre-period TREND, not the level (the unit fixed effect
*      absorbs the level gap).  To visualise the counterfactual we anchor the
*      synthetic to the treated cohort by its lambda-weighted pre-period gap
*      (exactly the baseline SDID differences against; see the sdid post).
preserve
    import delimited "web_app/data/lambda_by_cohort.csv", clear
    keep if cohort==2002
    keep year lambda
    tempfile l2002
    save `l2002', replace

    import delimited "web_app/data/series_by_cohort.csv", clear
    keep if cohort==2002
    keep year y_treated y_synth
    merge 1:1 year using `l2002', nogen
    replace lambda = 0 if missing(lambda)
    gen double pg = lambda*(y_synth - y_treated) if year<2002
    egen double offset = total(pg)
    gen y_synth_anch = y_synth - offset
    di as result "2002 cohort lambda-weighted pre-period gap (anchor) = " offset[1]
    twoway (line y_treated    year, lcolor("$TREAT") lwidth(thick))             ///
           (line y_synth_anch year, lcolor("$CTRL")  lwidth(medthick) lpattern(dash)), ///
           xline(2001.5, lcolor(gs10))                                          ///
           ytitle("% women in parliament") xtitle("") xlabel(1990(5)2015)       ///
           legend(order(1 "Treated cohort (2002)" 2 "Synthetic control (anchored)") ///
                  pos(11) ring(0) cols(1) size(small))                          ///
           title("SDID counterfactual for the 2002 cohort", size(medium))        ///
           note("Synthetic anchored to the treated cohort by its {&lambda}-weighted pre-2002 gap; the post-2002 divergence is the effect.")
    graph export "stata_sdid_staggered_cohort2002_path.png", replace width(2400)
restore

* ---- 2002-cohort pre-period time weights (lambda) bar chart ----
preserve
    import delimited "web_app/data/lambda_by_cohort.csv", clear
    keep if cohort==2002
    twoway (bar lambda year, color("$CTRL") barwidth(0.8)),                     ///
           ytitle("SDID time weight ({&lambda})") xtitle("")                    ///
           xlabel(1990(2)2001, angle(45)) legend(off)                           ///
           title("Where SDID looks: 2002-cohort pre-period time weights", size(medium)) ///
           note("Weight concentrates on the years just before 2002 -- the pre-period most like the post-period.")
    graph export "stata_sdid_staggered_lambda.png", replace width(2400)
restore

*-------------------------------------------------------------------------------
* 5. COVARIATES -- optimized (Arkhangelsky et al.) vs projected (Kranz 2022)
*    sdid needs a balanced panel, so drop the 104 obs with missing lngdp first.
*-------------------------------------------------------------------------------
use quota_example.dta, clear
label variable quota "Parliamentary gender quota"
drop if missing(lngdp)

sdid womparl country year quota, vce(bootstrap) seed(2022) covariates(lngdp, optimized)
scalar att_opt = e(ATT)
scalar se_opt  = e(se)
di as result "SDID + lngdp (optimized) ATT = " att_opt "  SE = " se_opt

sdid womparl country year quota, vce(bootstrap) seed(1213) covariates(lngdp, projected)
scalar att_prj = e(ATT)
scalar se_prj  = e(se)
di as result "SDID + lngdp (projected) ATT = " att_prj "  SE = " se_prj

*-------------------------------------------------------------------------------
* 6. EVENT STUDY -- sdid_event on the full staggered panel + the 2002 cohort
*-------------------------------------------------------------------------------
* (6a) Full staggered panel: aggregated ATT + cohort-aggregated dynamic effects
use quota_example.dta, clear
label variable quota "Parliamentary gender quota"
drop if missing(lngdp)
sdid_event womparl country year quota, vce(bootstrap) brep(100) effects(8) ///
    placebo(5) covariates(lngdp)
matrix Hfull = e(H)
di as result "sdid_event full-panel aggregated ATT = " Hfull[1,1] "  SE = " Hfull[1,2]

* (6b) Clean event study on the 2002 cohort (the package authors' worked example).
*      Effect_l = event time (l-1); Placebo_l = event time (-l).
use quota_example.dta, clear
label variable quota "Parliamentary gender quota"
keep if quotaYear==2002 | quotaYear==.
drop if missing(lngdp)
sdid_event womparl country year quota, vce(placebo) brep(100) placebo(all) covariates(lngdp)
matrix H = e(H)
matrix list H

local Lg  = 2015 - 2002 + 1     // 14 post-treatment (dynamic) effects
local Lpl = 2002 - 1990         // 12 pre-treatment placebos
preserve
    clear
    svmat H
    rename (H1 H2 H3 H4 H5) (coef se ci_l ci_u switchers)
    gen row = _n
    drop if row==1                                   // drop the aggregate ATT row
    gen event_time = .
    gen str4 period_type = ""
    replace event_time = row-2      if row>=2          & row<=1+`Lg'
    replace period_type = "post"    if row>=2          & row<=1+`Lg'
    replace event_time = -(row-1-`Lg') if row>=2+`Lg'  & row<=1+`Lg'+`Lpl'
    replace period_type = "pre"        if row>=2+`Lg'  & row<=1+`Lg'+`Lpl'
    keep event_time coef se ci_l ci_u period_type
    sort event_time
    list, noobs
    export delimited using "web_app/data/event_study.csv", replace

    * headline event-study figure
    twoway (rarea ci_l ci_u event_time, color("${CTRL}%35") lwidth(none))       ///
           (line coef event_time, lcolor("$TREAT") lwidth(medthick))            ///
           (scatter coef event_time, mcolor("$TREAT") msize(small) ms(O)),      ///
           yline(0, lcolor("$TEAL") lpattern(dash))                             ///
           xline(-0.5, lcolor(gs9) lpattern(solid))                            ///
           xlabel(-12(2)13) xtitle("Years relative to quota adoption (event time)") ///
           ytitle("Effect on women in parliament (pp)")                        ///
           legend(order(3 "Point estimate" 1 "95% CI") pos(11) ring(0) cols(1) size(small)) ///
           title("Event-study SDID for the 2002 cohort (sdid_event)", size(medium)) ///
           note("Pre-period placebos hug zero (parallel trends); post-period effects trace the dynamic ATT.")
    graph export "stata_sdid_staggered_event_study.png", replace width(2400)
restore

*-------------------------------------------------------------------------------
* 7. INFERENCE -- bootstrap vs placebo vs jackknife (paper's 2-cohort subsample)
*    Drop the five single-country cohorts so jackknife (needs >1 treated unit per
*    period) is defined; only the 2002 & 2003 cohorts remain.
*-------------------------------------------------------------------------------
use quota_example.dta, clear
label variable quota "Parliamentary gender quota"
drop if inlist(country,"Algeria","Kenya","Samoa","Swaziland","Tanzania")

sdid womparl country year quota, vce(bootstrap) seed(1213)
scalar b_att = e(ATT)
scalar b_se  = e(se)
scalar b_cil = e(ATT_l)
scalar b_cir = e(ATT_r)
sdid womparl country year quota, vce(placebo) seed(1213)
scalar p_att = e(ATT)
scalar p_se  = e(se)
scalar p_cil = e(ATT_l)
scalar p_cir = e(ATT_r)
sdid womparl country year quota, vce(jackknife)
scalar j_att = e(ATT)
scalar j_se  = e(se)
scalar j_cil = e(ATT_l)
scalar j_cir = e(ATT_r)

clear
set obs 3
gen str10 method = ""
gen double att = .
gen double se  = .
gen double ci_l = .
gen double ci_u = .
replace method="bootstrap" in 1
replace att=b_att in 1
replace se=b_se in 1
replace ci_l=b_cil in 1
replace ci_u=b_cir in 1
replace method="placebo" in 2
replace att=p_att in 2
replace se=p_se in 2
replace ci_l=p_cil in 2
replace ci_u=p_cir in 2
replace method="jackknife" in 3
replace att=j_att in 3
replace se=j_se in 3
replace ci_l=j_cil in 3
replace ci_u=j_cir in 3
gen tstat = att/se
gen pval  = 2*(1-normal(abs(tstat)))
list, noobs
export delimited using "web_app/data/inference.csv", replace

* forest plot of the three inference methods (same point estimate, different SEs)
gen order = _n
twoway (rcap ci_l ci_u order, horizontal lcolor("$CTRL"))                       ///
       (scatter order att, mcolor("$TREAT") msize(large) ms(d)),                ///
       xline(0, lcolor(gs10) lpattern(dash))                                    ///
       ylabel(1 "bootstrap" 2 "placebo" 3 "jackknife", angle(0))                ///
       ytitle("") xtitle("ATT on women in parliament (pp)")                     ///
       legend(off) ysc(reverse)                                                 ///
       title("Same ATT, three variance estimators (2002 & 2003 cohorts)", size(medium)) ///
       note("Point estimate is identical (10.3 pp); jackknife is most conservative, placebo tightest.")
graph export "stata_sdid_staggered_inference.png", replace width(2400)

*-------------------------------------------------------------------------------
* 8. SUMMARY TABLE -> web_app/data/atts.csv
*-------------------------------------------------------------------------------
clear
set obs 4
gen str28 spec = ""
gen double att = .
gen double se  = .
gen double ci_l = .
gen double ci_u = .
replace spec="Static TWFE (biased foil)" in 1
replace att=twfe_att in 1
replace se=twfe_se in 1
replace spec="SDID (no covariates)" in 2
replace att=sdid_att in 2
replace se=sdid_se in 2
replace ci_l=sdid_cil in 2
replace ci_u=sdid_cir in 2
replace spec="SDID + lngdp (optimized)" in 3
replace att=att_opt in 3
replace se=se_opt in 3
replace spec="SDID + lngdp (projected)" in 4
replace att=att_prj in 4
replace se=se_prj in 4
gen tstat = att/se
gen pval  = 2*(1-normal(abs(tstat)))
replace ci_l = att - 1.96*se if missing(ci_l)
replace ci_u = att + 1.96*se if missing(ci_u)
list, noobs
export delimited spec att se ci_l ci_u pval using "web_app/data/atts.csv", replace

*-------------------------------------------------------------------------------
* 9. KEY NUMBERS
*-------------------------------------------------------------------------------
di as result _n "==================== KEY NUMBERS ===================="
di as result "Static TWFE ATT (biased foil)  = " %7.2f twfe_att "  SE " %5.2f twfe_se
di as result "SDID staggered ATT             = " %7.2f sdid_att "  SE " %5.2f sdid_se
di as result "  95% CI                       = [" %5.2f sdid_cil ", " %5.2f sdid_cir "]"
di as result "SDID + lngdp (optimized)       = " %7.2f att_opt  "  SE " %5.2f se_opt
di as result "SDID + lngdp (projected)       = " %7.2f att_prj  "  SE " %5.2f se_prj
di as result "Inference subsample ATT        = " %7.2f b_att
di as result "  bootstrap SE                 = " %7.2f b_se
di as result "  placebo SE                   = " %7.2f p_se
di as result "  jackknife SE                 = " %7.2f j_se
di as result "====================================================="

log close
