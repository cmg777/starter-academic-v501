****************************************************
* Sensitivity Analysis for Parallel Trends
* in Difference-in-Differences Using honestdid
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_honestdid/
*
* Dataset: ehec_data.dta (Medicaid expansion)
*   US states, 2008--2015
*   Treatment: Medicaid expansion in 2014
*   Control: Never-expanded states
*
* Required packages:
*   reghdfe, ftools, honestdid, coefplot, csdid, drdid
*
* Usage:
*   1. Open Stata (17+ recommended)
*   2. Run: do analysis.do
*   3. All graphs are saved as PNG files
*   4. See analysis.log for full output
****************************************************

clear all
set more off

*---------------------------------------------------
* Section 4: Setup --- data loading and packages
*---------------------------------------------------

* Install required packages
capture ssc install require, replace
capture ssc install ftools, replace
capture ssc install reghdfe, replace
capture ssc install coefplot, replace
capture ssc install drdid, replace
capture ssc install csdid, replace
capture net install honestdid, from("https://raw.githubusercontent.com/mcaceresb/stata-honestdid/main") replace

* Update reghdfe dependencies
capture reghdfe, compile
capture reghdfe, reload

* Load data
use "https://raw.githubusercontent.com/Mixtape-Sessions/Advanced-DID/main/Exercises/Data/ehec_data.dta", clear

* Examine the data
des
tab year
tab yexp2, m

* Restrict to 2008--2015 and drop 2015 expansion cohort for clean 2-group design
keep if (year <= 2015) & (missing(yexp2) | (yexp2 == 2014))

* Create treatment indicator
gen byte D = (yexp2 == 2014)

* Verify sample
tab D
tab year

* Summary statistics
tabstat dins, by(D) stat(mean sd min max n) format(%9.4f)

*---------------------------------------------------
* Section 5: The 2x2 DiD --- concept and estimation
*---------------------------------------------------

* 5.1 Collapsing to two periods
gen byte post = (year >= 2014)

* Compute the four group means
preserve
collapse (mean) dins, by(D post)
list, clean noobs

* 2x2 means plot with counterfactual trend
separate dins, by(D) gen(dins_)

* Compute counterfactual: treated pre-mean + control group's change
quietly sum dins_0 if post == 0
local ctrl_pre = r(mean)
quietly sum dins_0 if post == 1
local ctrl_post = r(mean)
local ctrl_change = `ctrl_post' - `ctrl_pre'
quietly sum dins_1 if post == 0
local treat_pre = r(mean)
local cf_post = `treat_pre' + `ctrl_change'
gen dins_cf = `treat_pre' if post == 0
replace dins_cf = `cf_post' if post == 1

twoway (connected dins_0 post, lcolor("106 155 204") mcolor("106 155 204") ///
            lpattern(dash) msymbol(circle) lwidth(medthick)) ///
       (connected dins_1 post, lcolor("217 119 87") mcolor("217 119 87") ///
            msymbol(diamond) lwidth(medthick)) ///
       (connected dins_cf post, lcolor("217 119 87") mcolor("217 119 87") ///
            lpattern(shortdash) msymbol(none) lwidth(medthin)), ///
       legend(order(1 "Control (Never-treated)" 2 "Treated (2014 Expanders)" ///
            3 "Counterfactual (Treated without expansion)") ///
            ring(0) pos(11) size(small)) ///
       ytitle("Insurance share") xtitle("") ///
       xlabel(0 "Pre (2008-2013)" 1 "Post (2014-2015)") ///
       title("2x2 DiD: Group Means and Counterfactual") ///
       graphregion(color(white)) plotregion(color(white))
graph export "stata_honestdid_2x2_means.png", replace width(1200)
restore

* 5.2 Regression-based 2x2 DiD
reg dins i.D##i.post, cluster(stfips)

*---------------------------------------------------
* Section 6: Sensitivity analysis for the 2x2 DiD
*---------------------------------------------------

* 6.1 Restrict to 3-year window: 2012, 2013, 2014
preserve
keep if inrange(year, 2012, 2014)

* Create Dyear variable (treatment-year interaction)
gen Dyear = cond(D, year, 2013)

* Event study with 2013 as reference (3-year window)
reghdfe dins b2013.Dyear, absorb(stfips year) cluster(stfips) noconstant

* Display coefficient matrix for reference
matrix list e(b)

* 6.3 Sensitivity analysis: relative magnitudes (2x2)
* Note: with b2013.Dyear, e(b) = [2012, 2013(omitted), 2014]
* So numpre(1) picks the 2012 coefficient as the 1 pre-period
* and treats the rest (including omitted 2013) as post
* We use pre() and post() explicitly to skip the omitted coefficient
honestdid, pre(1/1) post(3/3) mvec(0(0.5)2)

* 6.4 Sensitivity plot (2x2)
honestdid, pre(1/1) post(3/3) mvec(0(0.5)2) coefplot
graph export "stata_honestdid_2x2_rm.png", replace width(1200)

restore

*---------------------------------------------------
* Section 7: From 2x2 to event study (full panel)
*---------------------------------------------------

* Create Dyear for event study (full sample, 2008-2015)
gen Dyear = cond(D, year, 2013)

* Full event study: 2008--2015 with 2013 as reference
reghdfe dins b2013.Dyear, absorb(stfips year) cluster(stfips) noconstant

* Display coefficient matrix for reference
matrix list e(b)

* Event study plot
coefplot, vertical yline(0, lcolor(gs8)) ///
    xline(5.5, lpattern(dash) lcolor(gs8)) ///
    ciopts(recast(rcap)) ///
    ytitle("Effect on insurance share") xtitle("Year") ///
    title("Event Study: Medicaid Expansion and Insurance Coverage") ///
    graphregion(color(white)) plotregion(color(white))
graph export "stata_honestdid_event_study.png", replace width(1200)

* 7.3 Conventional pre-trends test
test 2008.Dyear 2009.Dyear 2010.Dyear 2011.Dyear 2012.Dyear

*---------------------------------------------------
* Section 9: Sensitivity --- relative magnitudes (full)
*---------------------------------------------------

* Note: e(b) = [2008, 2009, 2010, 2011, 2012, 2013(omitted), 2014, 2015]
* Pre-period coefficients: positions 1-5 (2008-2012)
* Omitted 2013: position 6
* Post-period coefficients: positions 7-8 (2014-2015)

* 9.1 Relative magnitudes: full panel (first post-period)
honestdid, pre(1/5) post(7/8) mvec(0(0.5)2)

* Sensitivity plot
honestdid, pre(1/5) post(7/8) mvec(0(0.5)2) coefplot
graph export "stata_honestdid_rm_full.png", replace width(1200)

* 9.2 Average effect across 2014 and 2015
matrix l_vec = 0.5 \ 0.5
honestdid, pre(1/5) post(7/8) mvec(0(0.5)2) l_vec(l_vec)

*---------------------------------------------------
* Section 10: Sensitivity --- smoothness restrictions
*---------------------------------------------------

* 10.2 Smoothness restriction
honestdid, pre(1/5) post(7/8) mvec(0(0.005)0.04) delta(sd)

* Smoothness sensitivity plot
honestdid, pre(1/5) post(7/8) mvec(0(0.005)0.04) delta(sd) coefplot
graph export "stata_honestdid_sd_full.png", replace width(1200)

*---------------------------------------------------
* Section 11: Staggered DiD with csdid + honestdid
*---------------------------------------------------

* Reload full dataset for staggered analysis
use "https://raw.githubusercontent.com/Mixtape-Sessions/Advanced-DID/main/Exercises/Data/ehec_data.dta", clear

* Keep only 2014-expanders and never-expanders, years 2008-2015
keep if (year <= 2015) & (missing(yexp2) | (yexp2 == 2014))

* Replace missing yexp2 with 0 for csdid (never-treated)
replace yexp2 = 0 if missing(yexp2)

* Callaway-Sant'Anna estimator
csdid dins, ivar(stfips) time(year) gvar(yexp2) long2 notyet

* Aggregate to event study
csdid_estat event, window(-5 1) estore(csdid)

* Restore csdid results and apply honestdid
estimates restore csdid
* csdid_estat stores: Pre_avg(1), Post_avg(2), Tm6(3)..Tm2(7), Tp0(8), Tp1(9)
honestdid, pre(3/7) post(8/9) mvec(0(0.5)2) coefplot
graph export "stata_honestdid_csdid.png", replace width(1200)

****************************************************
* End of analysis
****************************************************
