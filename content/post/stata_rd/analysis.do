****************************************************
* Regression Discontinuity Design (RDD)
* Sharp Design with Tutoring Program Data
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_rd/
*
* Dataset: tutoring.dta
*   Students with entrance_exam (running variable, 0-100),
*   exit_exam (outcome, 0-100), tutoring (Yes/No treatment)
*   Cutoff: 70 on entrance_exam (score <= 70 -> tutoring)
*
* Estimand: LATE at the cutoff -- the causal effect of
*   tutoring on exit exam scores for students at the
*   70-point threshold
*
* Required packages: rdrobust, rddensity, lpdensity
*
* Usage:
*   1. Open Stata
*   2. Run: do analysis.do
*   3. All graphs are saved as PNG files
*   4. See analysis.log for full output
****************************************************

clear all
set more off
set seed 42

* Install required packages
capture ssc install rdrobust, replace
capture ssc install rddensity, replace
capture ssc install lpdensity, replace

* Open log
capture log close
log using "analysis.log", replace text

*---------------------------------------------------
* Section 1: Data loading and exploration
*---------------------------------------------------

use "https://github.com/quarcs-lab/data-open/raw/master/isds/tutoring.dta", clear

* Describe variables
des

* Summary statistics
sum

* Treatment distribution
tab tutoring

* Create treat variable (explicit copy for cleaner code below)
clonevar treat = tutoring
label var treat "Tutoring program (1 = Yes, 0 = No)"

* Center running variable at cutoff
gen centered = entrance_exam - 70
label var centered "Entrance exam centered at cutoff (70)"

*---------------------------------------------------
* Section 2: Verify sharp design
*---------------------------------------------------

* In a sharp RDD, treatment is a deterministic function
* of the running variable at the cutoff

gen byte below_cutoff = (entrance_exam <= 70)
label var below_cutoff "Scored at or below cutoff (70)"

tab below_cutoff treat, row

* Confirm: 100% treated below, 0% treated above
di _newline
di "If the table above shows 100% compliance,"
di "this is a sharp RDD."

*---------------------------------------------------
* Section 3: Figure 1 -- Scatter plot with cutoff
*---------------------------------------------------

twoway (scatter exit_exam entrance_exam if treat==1, ///
        mcolor("106 155 204") msize(small) msymbol(circle)) ///
       (scatter exit_exam entrance_exam if treat==0, ///
        mcolor("217 119 87") msize(small) msymbol(circle)), ///
    xline(70, lcolor(black) lwidth(medium) lpattern(dash)) ///
    legend(order(1 "Tutored (score {&le} 70)" ///
                 2 "Not tutored (score > 70)") ///
           position(5) ring(0) col(1)) ///
    title("Exit Exam Scores by Entrance Exam Score") ///
    subtitle("Vertical dashed line at cutoff = 70") ///
    xtitle("Entrance Exam Score") ///
    ytitle("Exit Exam Score") ///
    scheme(s2color) ///
    name(scatter_raw, replace)
graph export "stata_rd_fig1_scatter_raw.png", replace width(2400)

*---------------------------------------------------
* Section 4: Figure 2 -- Histogram of running variable
*---------------------------------------------------

* Visual check for manipulation/bunching around cutoff

histogram entrance_exam, ///
    bin(30) ///
    fcolor("106 155 204") lcolor(white) ///
    xline(70, lcolor(black) lwidth(medium) lpattern(dash)) ///
    title("Distribution of Entrance Exam Scores") ///
    subtitle("Check for bunching at the cutoff (70)") ///
    xtitle("Entrance Exam Score") ///
    ytitle("Density") ///
    scheme(s2color) ///
    name(hist_running, replace)
graph export "stata_rd_fig2_histogram_running.png", replace width(2400)

*---------------------------------------------------
* Section 5: Figure 3 -- RD Plot (rdplot)
*---------------------------------------------------

* Binned scatter with local polynomial fits on each side

rdplot exit_exam entrance_exam, c(70) p(1) ///
    graph_options(title("RD Plot: Exit Exam Score") ///
                  xtitle("Entrance Exam Score") ///
                  ytitle("Exit Exam Score") ///
                  legend(position(5) ring(0) col(1)) ///
                  name(rdplot_main, replace))
graph export "stata_rd_fig3_rdplot.png", replace width(2400)

*---------------------------------------------------
* Section 6: Parametric RDD (OLS)
*---------------------------------------------------

di _newline(2)
di "============================================"
di "  Parametric RDD Estimation"
di "============================================"

* Model 1: Simple linear -- same slope on both sides
di _newline
di "--- Model 1: Simple linear RDD ---"
reg exit_exam entrance_exam treat, robust
estimates store m1_linear

* Model 2: Different slopes on each side (interaction)
di _newline
di "--- Model 2: Linear with different slopes ---"
gen interact = centered * treat
label var interact "Centered x Treat interaction"
reg exit_exam centered treat interact, robust
estimates store m2_interact

* Model 3: Quadratic specification
di _newline
di "--- Model 3: Quadratic specification ---"
gen centered2 = centered^2
label var centered2 "Centered squared"
reg exit_exam centered centered2 treat ///
    c.centered#c.treat c.centered2#c.treat, robust
estimates store m3_quadratic

* Compare all parametric models
di _newline
di "--- Comparison of parametric models ---"
estimates table m1_linear m2_interact m3_quadratic, ///
    b(%9.3f) se(%9.3f) stats(r2 N)

*---------------------------------------------------
* Section 7: Nonparametric RDD (rdrobust)
*---------------------------------------------------

di _newline(2)
di "============================================"
di "  Nonparametric RDD Estimation (rdrobust)"
di "============================================"

* Default: MSE-optimal bandwidth, triangular kernel
* Note: rdrobust estimates the jump from left to right of the cutoff.
* Since tutored students are to the LEFT (score <= 70) and score higher,
* the RD effect is NEGATIVE (right minus left < 0). This is the same
* finding as the positive parametric coefficient on treat (~10.8), just
* with opposite sign convention. The magnitudes also differ because
* rdrobust uses only observations within the optimal bandwidth (~10 points
* around the cutoff), while the parametric model uses the full sample.
di _newline
di "--- Default (MSE-optimal, triangular kernel) ---"
rdrobust exit_exam entrance_exam, c(70)

* Store main results
local rd_coef = e(tau_cl)
local rd_se   = e(se_tau_cl)
local rd_bw   = e(h_l)
local rd_N    = e(N_h_l) + e(N_h_r)

di _newline
di "Summary of main RD estimate:"
di "  RD estimate:     " %9.3f `rd_coef'
di "  Robust SE:       " %9.3f `rd_se'
di "  Bandwidth (h):   " %9.3f `rd_bw'
di "  Effective N:     " `rd_N'

* Uniform kernel for comparison
di _newline
di "--- Uniform kernel ---"
rdrobust exit_exam entrance_exam, c(70) kernel(uniform)

* Epanechnikov kernel for comparison
di _newline
di "--- Epanechnikov kernel ---"
rdrobust exit_exam entrance_exam, c(70) kernel(epanechnikov)

*---------------------------------------------------
* Section 8: Bandwidth sensitivity
*---------------------------------------------------

di _newline(2)
di "============================================"
di "  Bandwidth Sensitivity Analysis"
di "============================================"

* Show all available bandwidth selectors
di _newline
di "--- Bandwidth selection methods ---"
rdbwselect exit_exam entrance_exam, c(70) all

* Estimate at multiple manual bandwidths
di _newline
di "--- Manual bandwidth sensitivity ---"
di "BW       Coef         SE          p-value"
di "----     ---------    ---------   ---------"

foreach bw in 5 7 10 12 15 20 {
    quietly rdrobust exit_exam entrance_exam, c(70) h(`bw')
    local coef_`bw' = e(tau_cl)
    local se_`bw'   = e(se_tau_cl)
    local pv_`bw'   = e(pv_cl)
    di "`bw'" _col(10) %9.3f `coef_`bw'' ///
       _col(23) %9.3f `se_`bw'' ///
       _col(36) %9.3f `pv_`bw''
}

*---------------------------------------------------
* Section 9: McCrary density test (rddensity)
*---------------------------------------------------

di _newline(2)
di "============================================"
di "  McCrary Density Test"
di "============================================"

* Formal test: is there bunching at the cutoff?
* H0: density is continuous at the cutoff
* A non-significant p-value supports the RDD assumption

rddensity entrance_exam, c(70)

* Store p-value
local density_pval = e(pv_q)
di _newline
di "Density test p-value: " %9.4f `density_pval'
di "If p > 0.05, no evidence of manipulation."

* Figure 4: Density plot using lpdensity
* Generate density estimates on each side of the cutoff
* and plot them manually since rddensity plot can be fragile

* Left side density
preserve
keep if entrance_exam <= 70
kdensity entrance_exam, generate(xL densL) nograph
save "_tmpL.dta", replace
restore

* Right side density
preserve
keep if entrance_exam > 70
kdensity entrance_exam, generate(xR densR) nograph
save "_tmpR.dta", replace
restore

* Combine and plot
preserve
use "_tmpL.dta", clear
append using "_tmpR.dta"

twoway (line densL xL, lcolor("106 155 204") lwidth(medthick)) ///
       (line densR xR, lcolor("217 119 87") lwidth(medthick)), ///
    xline(70, lcolor(black) lwidth(medium) lpattern(dash)) ///
    legend(order(1 "Below cutoff" 2 "Above cutoff") ///
           position(5) ring(0) col(1)) ///
    title("Density of the Running Variable") ///
    subtitle("No bunching at the cutoff supports the RDD assumption") ///
    xtitle("Entrance Exam Score") ///
    ytitle("Density") ///
    scheme(s2color) ///
    name(density_test, replace)
graph export "stata_rd_fig4_density_test.png", replace width(2400)
restore

* Clean up temp files
capture erase "_tmpL.dta"
capture erase "_tmpR.dta"

*---------------------------------------------------
* Section 10: Placebo cutoffs (robustness)
*---------------------------------------------------

di _newline(2)
di "============================================"
di "  Placebo Cutoff Tests"
di "============================================"

* If the effect is real, only the true cutoff (70)
* should show a significant discontinuity

* Use postfile to collect results for plotting
tempname pf
tempfile placebo_results
postfile `pf' cutoff coef se pval using `placebo_results', replace

di _newline
di "Cutoff   Coef         SE          p-value"
di "------   ---------    ---------   ---------"

foreach c in 50 55 60 65 70 75 80 85 90 {
    capture quietly rdrobust exit_exam entrance_exam, c(`c')
    if _rc == 0 {
        local pc = e(tau_cl)
        local ps = e(se_tau_cl)
        local pp = e(pv_cl)
        if `c' == 70 {
            di "`c' *" _col(10) %9.3f `pc' ///
               _col(23) %9.3f `ps' ///
               _col(36) %9.3f `pp'
        }
        else {
            di "`c'" _col(10) %9.3f `pc' ///
               _col(23) %9.3f `ps' ///
               _col(36) %9.3f `pp'
        }
        post `pf' (`c') (`pc') (`ps') (`pp')
    }
    else {
        di "`c'" _col(10) "  (insufficient data)"
    }
}

postclose `pf'

* Figure 5: Placebo cutoff plot
preserve
use `placebo_results', clear

gen ci_upper = coef + 1.96 * se
gen ci_lower = coef - 1.96 * se
gen byte is_true = (cutoff == 70)

twoway (rcap ci_upper ci_lower cutoff if is_true==0, ///
            lcolor("106 155 204")) ///
       (scatter coef cutoff if is_true==0, ///
            mcolor("106 155 204") msymbol(circle)) ///
       (rcap ci_upper ci_lower cutoff if is_true==1, ///
            lcolor("217 119 87") lwidth(thick)) ///
       (scatter coef cutoff if is_true==1, ///
            mcolor("217 119 87") msymbol(diamond) msize(large)), ///
    yline(0, lcolor(black) lpattern(dash)) ///
    legend(order(2 "Placebo cutoffs" 4 "True cutoff (70)") ///
           position(5) ring(0) col(1)) ///
    title("Placebo Cutoff Test") ///
    subtitle("Only the true cutoff should show a significant effect") ///
    xtitle("Cutoff Value") ///
    ytitle("RD Estimate") ///
    scheme(s2color) ///
    name(placebo_cutoffs, replace)
graph export "stata_rd_fig5_placebo_cutoffs.png", replace width(2400)
restore

*---------------------------------------------------
* End of analysis
*---------------------------------------------------

di _newline(2)
di "============================================"
di "  Analysis complete."
di "  Sharp RDD: tutoring at entrance_exam <= 70"
di "  Estimand: LATE at the cutoff"
di "  See the tutorial for interpretation."
di "============================================"

log close
