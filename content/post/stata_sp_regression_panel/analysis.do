****************************************************
* Spatial Panel Regression in Stata:
* Cigarette Demand Across US States
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_sp_regression_panel/
*
* Dataset: Baltagi cigarette demand
*   46 US states, 1963--1992 (balanced panel)
*   Variables: logc, logp, logy
*   Weight matrix: binary contiguity (row-standardized)
*
* Packages required: spmat, xsmle, spwmatrix, estout
*
* Usage:
*   1. Open Stata
*   2. Run: do analysis.do
****************************************************

clear all
macro drop _all
set more off
version 12

* Install packages (uncomment if needed)
*net install st0292, from(http://www.stata-journal.com/software/sj13-2)
*net install xsmle, from(http://fmwww.bc.edu/RePEc/bocode/x)
*net install spwmatrix, from(http://fmwww.bc.edu/RePEc/bocode/s)
*capture ssc install estout, replace

*---------------------------------------------------
* Section 3: Setup and data loading
*---------------------------------------------------

* 3.1 Spatial weight matrix
use "https://github.com/quarcs-lab/data-open/raw/master/cigar/Wct_bin.dta", replace
spmat dta Wst m1-m46, norm(row) replace

* 3.2 Panel data setup
use "https://github.com/quarcs-lab/data-open/raw/master/cigar/baltagi_cigar.dta", clear
sort year state
xtset state year

* 3.3 Panel summary statistics
xtsum

*---------------------------------------------------
* Section 4: Non-spatial panel models
*---------------------------------------------------

* 4.1 Pooled OLS
reg logc logp logy
estimates store pool

* 4.2 Region fixed effects
xtreg logc logp logy, fe
estimates store rfe

* 4.3 Time fixed effects
reg logc logp logy i.year
estimates store tfe

* 4.4 Two-way fixed effects
xtreg logc logp logy i.year, fe
estimates store rtfe

* 4.5 Comparison table
estimates table pool rfe tfe rtfe, b(%7.2f) star(0.1 0.05 0.01) stf(%9.0f)

*---------------------------------------------------
* Section 6: Spatial Durbin Model (SDM)
*---------------------------------------------------

* 6.1 SDM with two-way fixed effects
xsmle logc logp logy, fe type(both) wmat(Wst) mod(sdm) effects nsim(999) nolog
estimates store sdm1

* 6.2 SDM with Lee-Yu bias correction
xsmle logc logp logy, fe type(both) leeyu wmat(Wst) mod(sdm) effects nsim(999) nolog
estimates store sdm2

* 6.3 Comparison
estimates table sdm1 sdm2, b(%7.3f) star(0.1 0.05 0.01) stf(%9.0f)

*---------------------------------------------------
* Section 7: Wald specification tests
*---------------------------------------------------

quietly xsmle logc logp logy, fe type(both) leeyu wmat(Wst) mod(sdm) effects nsim(999) nolog

* Wald test: Reduce to SAR? (NO if p < 0.05)
test ([Wx]logp = 0) ([Wx]logy = 0)

* Wald test: Reduce to SLX? (NO if p < 0.05)
test ([Spatial]rho = 0)

* Wald test: Reduce to SEM? (NO if p < 0.05)
testnl ([Wx]logp = -[Spatial]rho*[Main]logp) ([Wx]logy = -[Spatial]rho*[Main]logy)

*---------------------------------------------------
* Section 8: Dynamic spatial panel models
*---------------------------------------------------

* 8.1 Non-dynamic SDM (baseline)
xsmle logc logp logy, fe type(both) wmat(Wst) mod(sdm) effects nsim(999) nolog
eststo SDM0

* 8.2 Dynamic: tau * y_it-1
xsmle logc logp logy, dlag(1) fe type(both) wmat(Wst) mod(sdm) effects nsim(999) nolog
eststo dySDM1

* 8.3 Dynamic: psi * W * y_it-1
xsmle logc logp logy, dlag(2) fe type(both) wmat(Wst) mod(sdm) effects nsim(999) nolog
eststo dySDM2

* 8.4 Dynamic: tau * y_it-1 + psi * W * y_it-1
xsmle logc logp logy, dlag(3) fe type(both) wmat(Wst) mod(sdm) effects nsim(999) nolog
eststo dySDM3

* 8.5 Comparison table
esttab SDM0 dySDM1 dySDM2 dySDM3, mtitle("SDM" "dySDM1" "dySDM2" "dySDM3")
