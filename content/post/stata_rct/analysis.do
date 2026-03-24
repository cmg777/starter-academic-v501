****************************************************
* Evaluating a Cash Transfer Program (RCT)
* with Panel Data in Stata
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_rct/
*
* Dataset: dataSIM4RCT.dta
*   2,000 households, balanced panel (2021--2024)
*   Stratified randomization, imperfect compliance
*   True treatment effect: 0.12 log points (~12%)
*
* Usage:
*   1. Open Stata
*   2. Run: do analysis.do
*   3. All graphs are saved as PNG files
****************************************************

clear all
set more off

*---------------------------------------------------
* Section 4: Data loading and exploration
*---------------------------------------------------

use "https://github.com/quarcs-lab/data-open/raw/master/ametrics/dataSIM4RCT.dta", clear

* Describe key variables
des y age edu female poverty treat D

* Summary statistics at baseline
sum y age edu female poverty treat D if post==0

* Summary statistics at endline
sum y age edu female poverty treat D if post==1

* Declare panel structure
xtset id year

*---------------------------------------------------
* Section 5: Baseline balance checks
*---------------------------------------------------

* 5.1 T-tests and proportion tests
preserve
keep if post==0

ttest y,      by(treat)
ttest age,    by(treat)
ttest edu,    by(treat)
prtest female,  by(treat)
prtest poverty, by(treat)

* 5.2 Balance table (iebaltab)
capture ssc install ietoolkit, replace
iebaltab y age edu female poverty, grpvar(treat)

* 5.3 Visual balance plot
capture net install balanceplot, from("https://tdmize.github.io/data") replace
balanceplot y age edu i.female i.poverty, group(treat) table nodropdv
graph export "stata_rct_balance_plot.png", replace width(1200)

* 5.4 AIPW as a formal balance test
teffects aipw (y age edu i.female i.poverty) (treat age edu i.female i.poverty)

* Diagnostic checks
tebalance overid
tebalance summarize

tebalance density y
graph export "stata_rct_density_y.png", replace width(1200)

teffects overlap
graph export "stata_rct_overlap_baseline.png", replace width(1200)

restore

*---------------------------------------------------
* Section 8: Cross-sectional estimation at endline
*---------------------------------------------------

preserve
keep if post==1

* 8.1 Simple difference in means
reg y treat, robust

* 8.2 Regression Adjustment -- ATE and ATT
teffects ra (y c.age c.edu i.female i.poverty) (treat), ate
teffects ra (y c.age c.edu i.female i.poverty) (treat), atet

* 8.3 Inverse Probability Weighting -- ATE and ATT
teffects ipw (y) (treat c.age c.edu i.female i.poverty), ate
teffects ipw (y) (treat c.age c.edu i.female i.poverty), atet

* 8.4 Doubly Robust (IPWRA) -- ATE and ATT
teffects ipwra (y c.age c.edu i.female i.poverty) ///
               (treat c.age c.edu i.female i.poverty), vce(robust)

teffects ipwra (y c.age c.edu i.female i.poverty) ///
               (treat c.age c.edu i.female i.poverty), atet vce(robust)

* 8.5 Doubly Robust (AIPW) -- ATE
teffects aipw (y c.age c.edu i.female i.poverty) ///
              (treat c.age c.edu i.female i.poverty)

restore

*---------------------------------------------------
* Section 9: Difference-in-Differences
*---------------------------------------------------

* 9.3 Basic DiD with panel fixed effects
gen treat_post = treat * post
label var treat_post "Treated x Post (1 only for treated in 2024)"

xtset id year
xtdidregress (y) (treat_post), group(id) time(year) vce(cluster id)

* 9.4 Doubly Robust DiD (DRDID)
capture ssc install drdid, replace
drdid y c.age c.edu i.female i.poverty, ivar(id) time(year) treatment(treat) dripw

* Alternative: Stata 17+ built-in command
xthdidregress aipw (y c.age c.edu i.female i.poverty) ///
                   (treat_post c.age c.edu i.female i.poverty), group(id)

*---------------------------------------------------
* Section 10: Endogenous treatment (Advanced)
*---------------------------------------------------

* 10.2 Endogenous treatment regression
preserve
keep if post==1

etregress y c.age i.female i.poverty c.edu, ///
    treat(D = treat c.age i.female i.poverty c.edu) vce(robust)

gen byte esample = e(sample)

* ATE of receipt
margins r.D if esample==1

* ATT of receipt
margins, predict(cte) subpop(if D==1 & esample==1)

restore

* 10.3 Doubly robust estimation of receipt effect
preserve
keep if post==1

teffects ipwra (y y0 c.age i.female i.poverty c.edu) ///
               (D c.age i.female i.poverty c.edu treat), vce(robust)

* Diagnostic checks
tebalance summarize age edu i.female i.poverty
tebalance summarize, baseline

tebalance density y0
graph export "stata_rct_density_y0_receipt.png", replace width(1200)

tebalance density age

teffects overlap
graph export "stata_rct_overlap_receipt.png", replace width(1200)

restore

*---------------------------------------------------
* End of analysis
*---------------------------------------------------

di _newline(2)
di "============================================"
di "  Analysis complete."
di "  True treatment effect: 0.12 log points"
di "  See comparison table in the tutorial."
di "============================================"
