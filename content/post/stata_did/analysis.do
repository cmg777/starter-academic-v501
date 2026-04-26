****************************************************
* Difference-in-Differences (DiD) Tutorial
* Effect of an After-School Tutoring Program
* on Academic Performance
*
* Based on: Corral, D. & Yang, M. (2024).
*   An introduction to the difference-in-differences
*   design in education policy research.
*   Asia Pacific Education Review.
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_did/
*
* Datasets:
*   tutoring_did.dta      (35 schools x 2 periods)
*   tutoring_didevent.dta (35 schools x 8 periods)
*
* Setting:
*   A fictitious government implements an after-school
*   tutoring program in 10 of 35 high schools to
*   improve GPA of low-income students.
*
* Estimand: ATT (Average Treatment Effect on Treated)
* Key result: ~25.32 GPA point increase
*
* Variables:
*   id           - School identifier
*   time         - Time period
*   treated      - 1 if school implements program
*   post         - 1 for post-program period
*   txp          - Interaction: treated x post (DiD)
*   gpa          - Grade Point Average (0-100)
*   female_share - Share of female students
*   timeToTreat  - Relative time to treatment (event study)
*
* Usage:
*   1. Open Stata (17+ recommended)
*   2. Run: do analysis.do
*   3. All graphs saved as stata_did_*.png
*   4. See analysis.log for full output
*
* Required packages:
*   diff_plot, diff, ftools, reghdfe,
*   panelview, eventdd, matsort, outreg2
****************************************************

clear all
set more off
set seed 42


*---------------------------------------------------
* Section 0: Install dependencies
*---------------------------------------------------

capture ssc install diff_plot, replace
capture ssc install diff, replace
capture net install ftools, from("https://raw.githubusercontent.com/sergiocorreia/ftools/master/src/") replace
capture ftools, compile
capture net install reghdfe, from("https://raw.githubusercontent.com/sergiocorreia/reghdfe/master/src/") replace
capture ssc install panelview, replace
capture ssc install eventdd, replace
capture ssc install matsort, replace
capture ssc install outreg2, replace

* Start log
capture log close
log using "analysis.log", replace text

di _newline(2)
di "============================================"
di "  Difference-in-Differences (DiD) Tutorial"
di "  Corral & Yang (2024)"
di "  $S_DATE $S_TIME"
di "============================================"


*===================================================
*  PART 1: THE 2x2 DiD DESIGN
*  Dataset: tutoring_did.dta (35 schools x 2 periods)
*===================================================


*---------------------------------------------------
* Section 1: Load and explore the 2x2 DiD dataset
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 1: DATA LOADING & EXPLORATION"
di "========================================"

use "https://github.com/quarcs-lab/data-open/raw/master/isds/tutoring_did.dta", clear

* Inspect variable labels and storage types
describe

* Check means, SD, min, max
summarize

* Show a few rows for context
list in 1/6

* Declare panel structure: id = school, time = period
xtset id time

* Panel summary: within/between variance, balancedness
xtsum

di _newline
di "Panel: 35 schools x 2 time periods = 70 observations"
di "Treatment: 10 schools receive after-school tutoring"
di "Comparison: 25 schools do not"


*---------------------------------------------------
* Section 2: Treatment visualization (panelview)
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 2: TREATMENT VISUALIZATION"
di "========================================"

panelview gpa txp, i(id) t(time) type(treat) ///
    prepost bytiming ///
    xtitle("Time Period") ytitle("School ID") ///
    legend(position(6)) ///
    name(panelview_2x2, replace)

graph export "stata_did_panelview_2x2.png", replace width(2400)

di "Figure saved: stata_did_panelview_2x2.png"


*---------------------------------------------------
* Section 3: Interrupted Time Series (ITS) -- Figure 1
*   Naive pre/post comparison for treated group only
*   Shows why a simple comparison overstates the effect
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 3: INTERRUPTED TIME SERIES"
di "  (Figure 1 -- Treated Group Only)"
di "========================================"

preserve
collapse (mean) gpa, by(time treated)

twoway (connected gpa time if treated==1, ///
        msymbol(O) mcolor(gs1) lcolor(gs1) ///
        ylab(0(10)100) xlab(1(1)2)), ///
    ytitle("GPA") xtitle("Time") ///
    xline(1.5, lcolor(red) lpattern(dash)) ///
    title("Figure 1: Interrupted Time Series (Treated Group Only)") ///
    note("Source: Corral & Yang (2024). Simulated data.") ///
    graphregion(color(white)) plotregion(color(white)) ///
    name(fig1_its, replace)

graph export "stata_did_its.png", replace width(2400)
restore

di "Figure saved: stata_did_its.png"
di _newline
di "Naive ITS comparison:"
di "  Treated group GPA jumped from ~60 to ~96"
di "  Naive change: ~36 GPA points"
di "  BUT: this ignores secular time trends!"
di "  We need a comparison group to isolate the causal effect."


*---------------------------------------------------
* Section 4: Parallel Trends & Counterfactual -- Figure 2
*   Shows treated, control, and counterfactual trends
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 4: PARALLEL TRENDS"
di "  (Figure 2 -- Counterfactual)"
di "========================================"

preserve
collapse (mean) gpa, by(time treated)

* Compute counterfactual: what would treated look like without treatment?
* Counterfactual = treated_pre + control_change
quietly sum gpa if treated==0 & time==1
local ctrl_pre = r(mean)
quietly sum gpa if treated==0 & time==2
local ctrl_post = r(mean)
local ctrl_change = `ctrl_post' - `ctrl_pre'

quietly sum gpa if treated==1 & time==1
local treat_pre = r(mean)
local cf_post = `treat_pre' + `ctrl_change'

di "Control pre:  `ctrl_pre'"
di "Control post: `ctrl_post'"
di "Control change: `ctrl_change'"
di "Treated pre:  `treat_pre'"
di "Counterfactual post: `cf_post'"

* Add counterfactual observations (treated==2 for dashed line)
* After collapse, dataset has: time, treated, gpa (4 rows)
local N = _N
insobs 2
replace time = 1 in `=`N'+1'
replace time = 2 in `=`N'+2'
replace treated = 2 in `=`N'+1'
replace treated = 2 in `=`N'+2'
replace gpa = `treat_pre' in `=`N'+1'
replace gpa = `cf_post' in `=`N'+2'

twoway (connected gpa time if treated==1, ///
            msymbol(O) mcolor(gs1) lcolor(gs1)) ///
       (connected gpa time if treated==0, ///
            msymbol(+) mcolor(gs5) lcolor(gs5)) ///
       (connected gpa time if treated==2, ///
            msymbol(O) mcolor(gs1) lcolor(gs1) lpattern(shortdash_dot)), ///
    ylab(0(10)100) xlab(1(1)2) ///
    legend(order(1 "Treated" 2 "Comparison" 3 "Counterfactual")) ///
    ytitle("GPA") xtitle("Time") ///
    xline(1.5, lcolor(red) lpattern(dash)) ///
    title("Figure 2: DiD Design with Counterfactual Trend") ///
    note("Source: Corral & Yang (2024). Dashed line = counterfactual (treated without program).") ///
    graphregion(color(white)) plotregion(color(white)) ///
    name(fig2_counterfactual, replace)

graph export "stata_did_counterfactual.png", replace width(2400)
restore

di "Figure saved: stata_did_counterfactual.png"


*---------------------------------------------------
* Section 5: DiD Means Table -- Table 1
*   Manual calculation of the 2x2 DiD estimate
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 5: DiD MEANS TABLE (Table 1)"
di "========================================"

* Means table by treatment status and time period
table treated post, stat(mean gpa) nformat(%12.2f)

* Manual DiD calculation
di _newline
di "Manual DiD Calculation (Table 1):"
di "================================="
di "Treated change:  96.37 - 60.17 = " %5.2f 96.37 - 60.17
di "Control change:  82.10 - 71.22 = " %5.2f 82.10 - 71.22
di "---------------------------------"
di "DiD estimate:    36.20 - 10.88 = " %5.2f 36.20 - 10.88
di _newline
di "The after-school program increased GPA by ~25.32 points."
di "This is lower than the naive ITS estimate (~36 points),"
di "illustrating the importance of using a comparison group."


*---------------------------------------------------
* Section 6: DiD Plots (diff_plot + diff commands)
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 6: DiD PLOTS"
di "========================================"

* Visual DiD plot showing both groups
diff_plot gpa, group(treated) time(post)
graph export "stata_did_diff_plot.png", replace width(2400)

di "Figure saved: stata_did_diff_plot.png"

* Formal DiD table using the diff command
diff gpa, treated(treated) period(post)


*---------------------------------------------------
* Section 7: DiD Regression Approaches
*   Five equivalent methods for estimating the DiD
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 7: DiD REGRESSION APPROACHES"
di "========================================"

* 7.1 Classical DiD Regression
*   Y = alpha + B1*Treat + B2*Post + B3*(Treat x Post) + e
*   B3 is the DiD estimate (~25.31)
di _newline
di "--- 7.1 Classical DiD Regression ---"
reg gpa treated post txp, robust

* 7.2 Stata Built-in DiD (Stata 17+)
*   Note: requires Stata 17+; wrapped in capture for backward compatibility
di _newline
di "--- 7.2 Stata Built-in DiD (didregress, Stata 17+) ---"
capture noisily didregress (gpa) (txp), group(id) time(time)

* 7.3 Standard Two-Way Fixed Effects (TWFE) with xtreg
*   Y = B3*(Treat x Post) + gamma_i + theta_t + e
*   Unit FE (gamma_i) absorb time-invariant school differences
*   Time FE (theta_t) absorb common shocks
di _newline
di "--- 7.3 Standard TWFE (xtreg) ---"
xtreg gpa txp i.time, fe vce(cluster id)

* 7.4 High-Dimensional TWFE with reghdfe
*   Faster alternative for models with many fixed effects
di _newline
di "--- 7.4 High-Dimensional TWFE (reghdfe) ---"
reghdfe gpa txp, absorb(id time) cluster(id)

* 7.5 TWFE with Covariate (female_share)
*   Adding exogenous controls can improve precision
*   NOTE: Never control for variables affected by treatment
di _newline
di "--- 7.5 TWFE with Covariate ---"
reghdfe gpa txp female_share, absorb(id time) cluster(id)

di _newline
di "All five approaches yield DiD estimate ~25.31-25.33"
di "This confirms the manual calculation from Table 1."


*---------------------------------------------------
* Section 8: Table 2 Replication
*   Three specifications exported with outreg2
*   (1) Baseline TWFE
*   (2) + Covariate (female_share)
*   (3) + Clustered SEs at school level
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 8: TABLE 2 REPLICATION"
di "========================================"

* Specification (1): Baseline TWFE, no controls, no clustering
reghdfe gpa i.txp, absorb(id time)
outreg2 using table2.doc, replace keep(1.txp) ///
    addtext(Controls, No, Clustered SEs, No) dec(2)

* Specification (2): + Covariate (female_share), no clustering
reghdfe gpa i.txp c.female_share, absorb(id time)
outreg2 using table2.doc, append keep(1.txp) ///
    addtext(Controls, Yes, Clustered SEs, No) dec(2)

* Specification (3): No controls, + clustered SEs at school level
reghdfe gpa i.txp, absorb(id time) cluster(id)
outreg2 using table2.doc, append keep(1.txp) ///
    addtext(Controls, No, Clustered SEs, Yes) dec(2)

di _newline
di "Table 2 saved to: table2.doc"
di "Expected results:"
di "  (1) Treatment = 25.31*** (no controls, no clustering)"
di "  (2) Treatment = 25.33*** (+ female_share control)"
di "  (3) Treatment = 25.31*** (+ clustered SEs at school level)"
di "  All: N=70, R-squared ~0.99"
di _newline
di "In this simulated example, clustering has minimal effect"
di "on standard errors. In real-world applications, clustering"
di "typically changes SEs substantially."


*===================================================
*  PART 2: EVENT STUDY DESIGN
*  Dataset: tutoring_didevent.dta (35 schools x 8 periods)
*  Extends the 2x2 DiD to examine dynamic effects
*===================================================


*---------------------------------------------------
* Section 9: Load and explore the event study dataset
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 9: EVENT STUDY DATA"
di "========================================"

use "https://github.com/quarcs-lab/data-open/raw/master/isds/tutoring_didevent.dta", clear

* Inspect the dataset
describe
summarize

* Declare panel structure
xtset id time

* Panel summary
xtsum

di _newline
di "Panel: 35 schools x 8 time periods = 280 observations"
di "4 pre-treatment periods + 4 post-treatment periods"
di "timeToTreat: relative time to treatment onset"


*---------------------------------------------------
* Section 10: Treatment visualization (panelview)
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 10: EVENT STUDY PANEL VIEW"
di "========================================"

panelview gpa txp, i(id) t(time) type(treat) ///
    prepost bytiming ///
    xtitle("Time Period") ytitle("School ID") ///
    legend(position(6)) ///
    name(panelview_event, replace)

graph export "stata_did_panelview_event.png", replace width(2400)

di "Figure saved: stata_did_panelview_event.png"


*---------------------------------------------------
* Section 11: Event Study Estimation -- Figure 3
*   Replaces single DiD interaction with leads & lags
*   Y_it = alpha + sum(theta_j * treat_it(t=k+j)) + gamma_i + theta_t + e
*   Leads (pre-treatment): test parallel trends
*   Lags (post-treatment): capture dynamic effects
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 11: EVENT STUDY ESTIMATION"
di "  (Figure 3 -- Dynamic Effects)"
di "========================================"

eventdd gpa i.time, timevar(timeToTreat) ///
    method(hdfe, absorb(id time) cluster(id)) ///
    keepdummies ///
    graph_op(ylab(-10(5)30) ///
        ytitle("GPA Effect") ///
        xtitle("Time to Treatment") ///
        xlab(-4(1)4) ///
        title("Figure 3: Event Study -- Dynamic Treatment Effects") ///
        note("Source: Corral & Yang (2024). Reference period: t = -1.") ///
        graphregion(color(white)) plotregion(color(white)))

graph export "stata_did_event_study.png", replace width(2400)

di "Figure saved: stata_did_event_study.png"


*---------------------------------------------------
* Section 12: Table 4 Replication
*   Event study coefficients (leads and lags)
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 12: TABLE 4 REPLICATION"
di "========================================"

outreg2 using table4.doc, replace ///
    keep(lead4 lead3 lead2 lag0 lag1 lag2 lag3) dec(2)

di _newline
di "Table 4 saved to: table4.doc"
di _newline
di "Event Study Results (Table 4):"
di "  Pre-treatment coefficients (leads):"
di "    lead4 = " %7.3f _b[lead4] "  (SE = " %5.3f _se[lead4] ")"
di "    lead3 = " %7.3f _b[lead3] "  (SE = " %5.3f _se[lead3] ")"
di "    lead2 = " %7.3f _b[lead2] "  (SE = " %5.3f _se[lead2] ")"
di "  Post-treatment coefficients (lags):"
di "    lag0  = " %7.3f _b[lag0] "  (SE = " %5.3f _se[lag0] ")"
di "    lag1  = " %7.3f _b[lag1] "  (SE = " %5.3f _se[lag1] ")"
di "    lag2  = " %7.3f _b[lag2] "  (SE = " %5.3f _se[lag2] ")"
di "    lag3  = " %7.3f _b[lag3] "  (SE = " %5.3f _se[lag3] ")"
di _newline
di "Interpretation:"
di "  Pre-treatment coefficients are close to zero and mostly"
di "  insignificant, supporting the parallel trends assumption."
di "  Post-treatment coefficients are consistently around 25 points,"
di "  confirming the 2x2 DiD result and showing a constant effect."
di "  N=280, 35 schools, R-squared ~0.992"


*---------------------------------------------------
* Section 13: Closing
*---------------------------------------------------

di _newline(2)
di "============================================"
di "  ANALYSIS COMPLETE"
di "============================================"
di "  DiD estimate: ~25.32 GPA points"
di "  Estimand: ATT (Average Treatment on Treated)"
di _newline
di "  Figures:"
di "    stata_did_panelview_2x2.png"
di "    stata_did_its.png"
di "    stata_did_counterfactual.png"
di "    stata_did_diff_plot.png"
di "    stata_did_panelview_event.png"
di "    stata_did_event_study.png"
di _newline
di "  Tables:"
di "    table2.doc (3 regression specifications)"
di "    table4.doc (event study coefficients)"
di _newline
di "  Reference:"
di "    Corral, D. & Yang, M. (2024). An introduction"
di "    to the difference-in-differences design in"
di "    education policy research."
di "============================================"
di _newline
di "=== Script completed successfully ==="

log close
