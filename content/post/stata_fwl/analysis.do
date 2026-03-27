****************************************************
* Visualizing Regression with the FWL Theorem
* in Stata
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_fwl/
*
* Datasets: Loaded from GitHub (CSV files from R FWL tutorial)
*   store_data.csv   -- 200 obs, simulated retail data
*   flights_sample.csv -- 5,000 obs, NYC flights 2013
*   wagepan.csv      -- 4,360 obs, wage panel 1980-1987
*
* Packages: scatterfit, reghdfe, ftools, estout
*
* Usage:
*   1. Open Stata
*   2. Run: do analysis.do
*   3. All graphs are saved as PNG files
****************************************************

clear all
set more off

* Install packages if not already installed
capture ssc install ftools, replace
capture ssc install require, replace
capture ssc install reghdfe, replace
capture ssc install estout, replace
capture net install scatterfit, from("https://raw.githubusercontent.com/leojahrens/scatterfit/master") replace

*===============================================================
* PART 1: SIMULATED STORE DATA
*===============================================================

*---------------------------------------------------
* Section 3: Load and explore the store data
*---------------------------------------------------

import delimited "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_fwlplot/store_data.csv", clear

describe
summarize sales coupons income dayofweek
correlate sales coupons income

*---------------------------------------------------
* Section 4: scatterfit -- Naive vs. Controlled
*---------------------------------------------------

* 4.1 Naive scatter: coupons appear to hurt sales
scatterfit sales coupons, ///
    regparameters(coef pval) ///
    opts(name(naive, replace) title("A. Naive: No Controls"))

* 4.2 Controlled scatter: FWL reveals the true positive effect
scatterfit sales coupons, controls(income) ///
    regparameters(coef pval) ///
    opts(name(controlled, replace) title("B. FWL: Controlling for Income"))

* Figure 1: Combine naive and controlled
graph combine naive controlled, ///
    title("What Does 'Controlling for Income' Look Like?") ///
    subtitle("scatterfit reveals the true positive effect hidden by confounding") ///
    rows(1) xsize(12) ysize(5)
graph export "stata_fwl_fig1_naive_vs_controlled.png", replace width(2400)

* 4.3 Regression table comparison
regress sales coupons
estimates store naive_ols

regress sales coupons income
estimates store full_ols

estimates table naive_ols full_ols, ///
    stats(r2 N) b(%9.4f) se(%9.4f)

* 4.4 OVB calculation
* gamma = effect of income on sales (in full model)
regress sales coupons income
local gamma = _b[income]
display "gamma (income -> sales): " %9.4f `gamma'

* delta = regression of coupons on income
regress coupons income
local delta = _b[income]
display "delta (income -> coupons): " %9.4f `delta'

* OVB = gamma * delta
local ovb = `gamma' * `delta'
display "OVB = gamma * delta: " %9.4f `ovb'

* Verify: naive ~ true + OVB
regress sales coupons
local naive_coef = _b[coupons]
regress sales coupons income
local true_coef = _b[coupons]

display "Naive coefficient:  " %9.4f `naive_coef'
display "True coefficient:   " %9.4f `true_coef'
display "True + OVB:         " %9.4f `true_coef' + `ovb'

*---------------------------------------------------
* Section 5: Manual FWL Verification
*---------------------------------------------------

* Step 1: Residualize sales on income
regress sales income
predict resid_sales, residuals

* Step 2: Residualize coupons on income
regress coupons income
predict resid_coupons, residuals

* Step 3: Regress residuals on residuals
regress resid_sales resid_coupons

* Verify: this coefficient matches the full regression
regress sales coupons income
display "Full OLS coupons coef: " %12.6f _b[coupons]
regress resid_sales resid_coupons
display "FWL manual coef:       " %12.6f _b[resid_coupons]

* Clean up residual variables
drop resid_sales resid_coupons

* 5.2 Three-panel progression
scatterfit sales coupons, ///
    regparameters(coef pval) ///
    opts(name(panel_a, replace) title("A. No Controls"))

scatterfit sales coupons, controls(income) ///
    regparameters(coef pval) ///
    opts(name(panel_b, replace) title("B. + Income"))

scatterfit sales coupons, controls(income dayofweek) ///
    regparameters(coef pval) ///
    opts(name(panel_c, replace) title("C. + Income + Day"))

* Figure 2: Three-panel progression
graph combine panel_a panel_b panel_c, ///
    title("Progressive Controls: How the Scatter Changes") ///
    rows(1) xsize(14) ysize(5)
graph export "stata_fwl_fig2_three_panels.png", replace width(2800)

* Three-model regression comparison
regress sales coupons
estimates store m1_naive

regress sales coupons income
estimates store m2_income

regress sales coupons income dayofweek
estimates store m3_full

estimates table m1_naive m2_income m3_full, ///
    stats(r2 r2_a N) b(%9.4f) se(%9.4f)

*---------------------------------------------------
* Section 6: Binned Scatter Plots
*---------------------------------------------------

* 6.2 Unbinned vs. binned FWL scatter
scatterfit sales coupons, controls(income) ///
    regparameters(coef pval) ///
    opts(name(unbinned, replace) title("A. Unbinned (all points)"))

scatterfit sales coupons, controls(income) binned ///
    regparameters(coef pval) ///
    opts(name(binned, replace) title("B. Binned (20 quantiles)"))

* Figure 3: Binned vs. unbinned
graph combine unbinned binned, ///
    title("Binned Scatter: Summarizing Patterns in Large Data") ///
    subtitle("Both show the same FWL-residualized relationship") ///
    rows(1) xsize(12) ysize(5)
graph export "stata_fwl_fig3_binned_scatter.png", replace width(2400)

*===============================================================
* PART 2: NYC FLIGHTS DATA
*===============================================================

*---------------------------------------------------
* Section 7: Fixed Effects with Flights
*---------------------------------------------------

import delimited "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_fwlplot/flights_sample.csv", clear

describe
summarize dep_delay air_time
tabulate origin

* Encode string variables for fixed effects
encode origin, gen(origin_fe)
encode dest, gen(dest_fe)

* 7.2 Progressive FE with scatterfit
scatterfit dep_delay air_time, ///
    regparameters(coef pval) ///
    opts(name(fe_none, replace) title("A. No Fixed Effects"))

scatterfit dep_delay air_time, fcontrols(origin_fe) ///
    regparameters(coef pval) ///
    opts(name(fe_origin, replace) title("B. Origin FE"))

scatterfit dep_delay air_time, fcontrols(origin_fe dest_fe) ///
    regparameters(coef pval) ///
    opts(name(fe_both, replace) title("C. Origin + Dest FE"))

* Figure 4: Progressive FE
graph combine fe_none fe_origin fe_both, ///
    title("What Do Fixed Effects 'Do' to the Data?") ///
    subtitle("Each panel adds more fixed effects, residualizing progressively") ///
    rows(1) xsize(14) ysize(5)
graph export "stata_fwl_fig4_fixed_effects.png", replace width(2800)

* 7.3 Regression table comparison
regress dep_delay air_time
estimates store fe0

reghdfe dep_delay air_time, absorb(origin_fe) vce(robust)
estimates store fe1

reghdfe dep_delay air_time, absorb(origin_fe dest_fe) vce(robust)
estimates store fe2

estimates table fe0 fe1 fe2, ///
    stats(r2 N) b(%9.4f) se(%9.4f)

*===============================================================
* PART 3: WAGE PANEL DATA
*===============================================================

*---------------------------------------------------
* Section 8: Panel Data -- Returns to Experience
*---------------------------------------------------

import delimited "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_fwlplot/wagepan.csv", clear

describe nr year lwage exper expersq educ
summarize lwage exper expersq educ

* Declare panel structure
xtset nr year

* 8.2 Pooled OLS vs. FE
regress lwage educ exper expersq
estimates store pool

reghdfe lwage exper expersq, absorb(nr)
estimates store fe_ind

reghdfe lwage exper expersq, absorb(nr year)
estimates store fe_twfe

estimates table pool fe_ind fe_twfe, ///
    stats(r2 N) b(%9.4f) se(%9.4f)

* 8.3 scatterfit with individual FE
* Sample 150 individuals for visual clarity
preserve
set seed 456
bysort nr: gen first = (_n == 1)
gen rand = runiform() if first
bysort nr (rand): replace rand = rand[1]
sort rand nr year
egen rank = group(rand) if first
bysort nr (rank): replace rank = rank[1]
keep if rank <= 150

scatterfit lwage exper, ///
    regparameters(coef pval) ///
    opts(name(wage_raw, replace) title("A. Raw: Pooled Cross-Section"))

scatterfit lwage exper, fcontrols(nr) ///
    regparameters(coef pval) ///
    opts(name(wage_fe, replace) title("B. FWL: Individual Fixed Effects"))

* Figure 5: Raw vs. individual FE
graph combine wage_raw wage_fe, ///
    title("Controlling for Unobserved Ability") ///
    subtitle("Individual FE removes person-specific wage levels") ///
    rows(1) xsize(12) ysize(5)
graph export "stata_fwl_fig5_panel_data.png", replace width(2400)

restore

*---------------------------------------------------
* Section 9: Advanced Features
*---------------------------------------------------

* Reload store data for advanced features
import delimited "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_fwlplot/store_data.csv", clear

* 9.1 Linear fit with full regression parameters on the plot
scatterfit sales coupons, controls(income) ///
    regparameters(coef se pval r2 n)
graph export "stata_fwl_fig6_advanced.png", replace width(1600)

* 9.2 Quadratic fit (no regparameters — only available for linear)
scatterfit sales coupons, controls(income) ///
    fit(quadratic) ///
    opts(name(quad_fit, replace))

* 9.3 Lowess fit (without controls — lowess does not support controls())
scatterfit sales coupons, ///
    fit(lowess) ///
    opts(name(lowess_fit, replace))

display "Analysis complete. All figures generated."
