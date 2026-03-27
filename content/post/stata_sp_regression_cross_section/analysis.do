****************************************************
* Cross-Sectional Spatial Regression in Stata:
* Crime in Columbus Neighborhoods
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_sp_regression_cross_section/
*
* Dataset: Columbus crime data (GeoDa Center)
*   49 neighborhoods in Columbus, Ohio
*   Variables: CRIME, INC, HOVAL
*   Weight matrix: Queen contiguity (row-standardized)
*
* Packages required: estout, spatwmat/spatdiag
*
* Usage:
*   1. Open Stata 15+
*   2. Run: do analysis.do
****************************************************

clear all
macro drop _all
set more off

* Install packages (uncomment if needed)
*capture ssc install estout, replace
*net install st0085_2, from(http://www.stata-journal.com/software/sj14-2)

*---------------------------------------------------
* Section 3: Setup and data loading
*---------------------------------------------------

* 3.1 Spatial weight matrix
use "https://github.com/quarcs-lab/data-open/raw/master/Columbus/columbus/Wqueen_fromStata_spmat.dta", clear
gen id = _n
order id, first
spset id
spmatrix fromdata WqueenS_fromStata15 = v*, normalize(row) replace
spmatrix summarize WqueenS_fromStata15

* 3.2 Dataset
use "https://github.com/quarcs-lab/data-open/raw/master/Columbus/columbus/columbusDbase.dta", clear
spset id

label var CRIME "Crime"
label var INC   "Income"
label var HOVAL "House value"

* 3.3 Generate spatial lags of X manually
* NOTE: We compute W*X explicitly rather than using spregress ivarlag(),
* which may produce incorrect signs for the spatial lag coefficients.
* See Elhorst (2014, Table 2.2) for the reference results.
mata: spmatrix_matafromsp(W_mata, id_vec, "WqueenS_fromStata15")
mata: st_view(inc=., ., "INC")
mata: st_view(hoval=., ., "HOVAL")
gen double W_INC = .
gen double W_HOVAL = .
mata: st_store(., "W_INC", W_mata * inc)
mata: st_store(., "W_HOVAL", W_mata * hoval)
label var W_INC   "W * Income"
label var W_HOVAL "W * House value"

summarize CRIME INC HOVAL W_INC W_HOVAL

*---------------------------------------------------
* Section 4: OLS baseline and spatial diagnostics
*---------------------------------------------------

* 4.1 OLS regression
regress CRIME INC HOVAL
eststo OLS

estat ic
mat s = r(S)
quietly estadd scalar AIC = s[1,5]

* 4.2 Moran's I test on OLS residuals
regress CRIME INC HOVAL
estat moran, errorlag(WqueenS_fromStata15)

* 4.3 LM tests (requires spatwmat/spatdiag)
spatwmat using "https://github.com/quarcs-lab/data-open/raw/master/Columbus/columbus/Wqueen_fromStata_spmat.dta", name(WqueenS_spatwmat) eigenval(eWqueenS_spatwmat) standardize

quietly reg CRIME INC HOVAL
spatdiag, weights(WqueenS_spatwmat)

*---------------------------------------------------
* Section 5: First-generation spatial models
*---------------------------------------------------

* 5.1 SAR (Spatial Autoregressive / Spatial Lag)
spregress CRIME INC HOVAL, ml dvarlag(WqueenS_fromStata15)
eststo SAR

estat ic
mat s = r(S)
quietly estadd scalar AIC = s[1,5]

estat impact

* 5.2 SEM (Spatial Error Model)
spregress CRIME INC HOVAL, ml errorlag(WqueenS_fromStata15)
eststo SEM

estat ic
mat s = r(S)
quietly estadd scalar AIC = s[1,5]

estat impact

*---------------------------------------------------
* Section 6: Models with spatial lags of X
*---------------------------------------------------

* 6.1 SLX (Spatial Lag of X)
* NOTE: We use regress with manually computed W*X instead of spregress ivarlag()
regress CRIME INC HOVAL W_INC W_HOVAL
eststo SLX

estat ic
mat s = r(S)
quietly estadd scalar AIC = s[1,5]

estat impact

* 6.2 SDM (Spatial Durbin Model)
* NOTE: We include W*X as regular regressors instead of using ivarlag()
spregress CRIME INC HOVAL W_INC W_HOVAL, ml dvarlag(WqueenS_fromStata15)
eststo SDM

estat ic
mat s = r(S)
quietly estadd scalar AIC = s[1,5]

estat impact

*---------------------------------------------------
* Section 7: Wald specification tests from SDM
*---------------------------------------------------

quietly spregress CRIME INC HOVAL W_INC W_HOVAL, ml dvarlag(WqueenS_fromStata15)

* Wald test: Reduce to SLX? (rho = 0; NO if p < 0.05)
test ([WqueenS_fromStata15]CRIME = 0)

* Wald test: Reduce to SAR? (theta = 0; NO if p < 0.05)
test ([CRIME]W_INC = 0) ([CRIME]W_HOVAL = 0)

* Wald test: Reduce to SEM? (common factor; NO if p < 0.05)
testnl ([CRIME]W_INC = -[WqueenS_fromStata15]CRIME*[CRIME]INC) ([CRIME]W_HOVAL = -[WqueenS_fromStata15]CRIME*[CRIME]HOVAL)

*---------------------------------------------------
* Section 8: Extended spatial models
*---------------------------------------------------

* 8.1 SDEM (Spatial Durbin Error Model)
* NOTE: We include W*X as regular regressors instead of using ivarlag()
spregress CRIME INC HOVAL W_INC W_HOVAL, ml errorlag(WqueenS_fromStata15)
eststo SDEM

estat ic
mat s = r(S)
quietly estadd scalar AIC = s[1,5]

estat impact

* 8.2 SAC (Spatial Autoregressive Combined)
spregress CRIME INC HOVAL, ml dvarlag(WqueenS_fromStata15) errorlag(WqueenS_fromStata15)
eststo SAC

estat ic
mat s = r(S)
quietly estadd scalar AIC = s[1,5]

estat impact

* 8.3 GNS (General Nesting Spatial)
* NOTE: We include W*X as regular regressors instead of using ivarlag()
spregress CRIME INC HOVAL W_INC W_HOVAL, ml dvarlag(WqueenS_fromStata15) errorlag(WqueenS_fromStata15)
eststo GNS

estat ic
mat s = r(S)
quietly estadd scalar AIC = s[1,5]

estat impact

*---------------------------------------------------
* Section 9: Model comparison
*---------------------------------------------------

esttab OLS SAR SEM SLX SDM SDEM SAC GNS, label stats(AIC) mtitle("OLS" "SAR" "SEM" "SLX" "SDM" "SDEM" "SAC" "GNS")
