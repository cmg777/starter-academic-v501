*=============================================================================*
*  TUTORIAL: Bayesian Model Averaging (BMA) and Double-Selection LASSO (DSL)
*  -------------------------------------------------------------------------
*  Data:    Synthetic panel inspired by Gravina & Lanzafame (2025)
*           80 countries, 1995-2014, 12 controls (5 true, 7 noise)
*  Purpose: Learn BMA and DSL for the Environmental Kuznets Curve (EKC)
*  Requires: Stata 18+ (bmaregress, dsregress), reghdfe, labutil
*  Outputs:  analysis.log, 6 PNG figures, comparison CSV
*=============================================================================*

clear all
set more off

* Install required packages
capture ssc install reghdfe
capture ssc install ftools
capture ssc install labutil


*=============================================================================*
*  VARIABLE DEFINITIONS (define once, use everywhere)
*=============================================================================*

global outcome    "ln_co2"
global gdp_vars   "ln_gdp ln_gdp_sq ln_gdp_cb"

global energy     "fossil_fuel renewable"
global socio      "urban globalization pop_density"
global inst       "democracy corruption"
global econ       "industry services trade fdi credit"

global controls   "$energy $socio $inst $econ"
global fe         "i.country_id i.year"

* Ground truth: which variables are TRUE predictors vs NOISE
global true_vars  "fossil_fuel renewable urban democracy industry"
global noise_vars "globalization pop_density corruption services trade fdi credit"


*=============================================================================*
*  SECTION 1: LOAD DATA
*=============================================================================*

log using "analysis.log", replace text

display _newline "============================================="
display "  TUTORIAL: BMA and DSL for the EKC"
display "  Data: Synthetic panel (80 countries, 1995-2014)"
display "  Started: $S_DATE $S_TIME"
display "============================================="

* Load synthetic data from GitHub for reproducibility
import delimited "https://github.com/cmg777/starter-academic-v501/raw/master/content/post/stata_bma_dsl/synthetic_ekc_panel.csv", clear

xtset country_id year, yearly

* Label variables for readable output
label variable country_id    "Country ID"
label variable year          "Year"
label variable ln_co2        "CO2 per capita (log)"
label variable ln_gdp        "GDP per capita (log)"
label variable ln_gdp_sq     "GDP per capita squared (log)"
label variable ln_gdp_cb     "GDP per capita cubed (log)"
label variable fossil_fuel   "Fossil fuel share (%)"
label variable renewable     "Renewable energy (%)"
label variable urban         "Urban population (%)"
label variable globalization "Globalization index"
label variable pop_density   "Population density"
label variable democracy     "Democracy score"
label variable corruption    "Corruption index"
label variable industry      "Industry VA (% GDP)"
label variable services      "Services VA (% GDP)"
label variable trade         "Trade openness (% GDP)"
label variable fdi           "FDI inflows (% GDP)"
label variable credit        "Domestic credit (% GDP)"

display _newline "=== Dataset summary ==="
xtdescribe
summarize $outcome $gdp_vars $controls


*=============================================================================*
*  SECTION 2: EXPLORE THE DATA -- FIGURE 1
*=============================================================================*

twoway (scatter $outcome ln_gdp, ///
        msize(vsmall) mcolor("106 155 204"%40) msymbol(circle)), ///
    ytitle("Log CO2 per capita") ///
    xtitle("Log GDP per capita") ///
    title("Synthetic Data: CO2 vs. Income", size(medium)) ///
    subtitle("80 countries, 1995-2014 (N = 1,600)", size(small)) ///
    note("Each dot is a country-year observation." ///
         "The nonlinear pattern motivates testing for a cubic EKC shape.") ///
    scheme(s2color) ///
    name(fig1_scatter, replace)

graph export "stata_bma_dsl_fig1_scatter.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig1_scatter.png"


*=============================================================================*
*  SECTION 3: BASELINE FIXED EFFECTS
*=============================================================================*

display _newline "============================================="
display "  BASELINE: Standard Fixed Effects"
display "============================================="

*---------------------------------------------*
* 3a. Sparse specification (no controls)      *
*---------------------------------------------*
reghdfe $outcome $gdp_vars, absorb(country_id year) vce(cluster country_id)
estimates store fe_sparse

local b1_sparse = _b[ln_gdp]
local b2_sparse = _b[ln_gdp_sq]
local b3_sparse = _b[ln_gdp_cb]

display _newline "=== Sparse FE Coefficients ==="
display "  b1 (GDP):   " %9.4f `b1_sparse'
display "  b2 (GDP^2): " %9.4f `b2_sparse'
display "  b3 (GDP^3): " %9.4f `b3_sparse'

*---------------------------------------------*
* 3b. Kitchen-sink specification              *
*---------------------------------------------*
reghdfe $outcome $gdp_vars $controls, absorb(country_id year) vce(cluster country_id)
estimates store fe_kitchen

local b1_kitchen = _b[ln_gdp]
local b2_kitchen = _b[ln_gdp_sq]
local b3_kitchen = _b[ln_gdp_cb]

display _newline "=== Kitchen-Sink FE Coefficients ==="
display "  b1 (GDP):   " %9.4f `b1_kitchen'
display "  b2 (GDP^2): " %9.4f `b2_kitchen'
display "  b3 (GDP^3): " %9.4f `b3_kitchen'

*---------------------------------------------*
* 3c. Compare specifications                  *
*---------------------------------------------*
display _newline "=== Coefficient Comparison ==="
display _newline "                Sparse FE     Kitchen-Sink FE"
display "  b1 (GDP):   " %9.4f `b1_sparse' "     " %9.4f `b1_kitchen'
display "  b2 (GDP^2): " %9.4f `b2_sparse' "     " %9.4f `b2_kitchen'
display "  b3 (GDP^3): " %9.4f `b3_sparse' "     " %9.4f `b3_kitchen'

* Turning points
local disc_sparse = (`b2_sparse')^2 - 3 * `b1_sparse' * `b3_sparse'
local disc_kitchen = (`b2_kitchen')^2 - 3 * `b1_kitchen' * `b3_kitchen'

display _newline "=== Turning Points ==="
if `disc_sparse' > 0 {
    local min_sparse = exp((-`b2_sparse' + sqrt(`disc_sparse')) / (3 * `b3_sparse'))
    local max_sparse = exp((-`b2_sparse' - sqrt(`disc_sparse')) / (3 * `b3_sparse'))
    display "  Sparse:  Min $" %8.0fc `min_sparse' "  Max $" %8.0fc `max_sparse'
}
else {
    display "  Sparse: No real turning points"
    local min_sparse = .
    local max_sparse = .
}
if `disc_kitchen' > 0 {
    local min_kitchen = exp((-`b2_kitchen' + sqrt(`disc_kitchen')) / (3 * `b3_kitchen'))
    local max_kitchen = exp((-`b2_kitchen' - sqrt(`disc_kitchen')) / (3 * `b3_kitchen'))
    display "  Kitchen: Min $" %8.0fc `min_kitchen' "  Max $" %8.0fc `max_kitchen'
}
else {
    display "  Kitchen: No real turning points"
    local min_kitchen = .
    local max_kitchen = .
}

*---------------------------------------------*
* 3d. Coefficient instability chart -- Fig 2  *
*---------------------------------------------*
preserve
clear
set obs 6

gen spec = ""
gen coef_name = ""
gen value = .
gen order = _n

replace spec = "Sparse FE" in 1
replace coef_name = "b1 (GDP)" in 1
replace value = `b1_sparse' in 1

replace spec = "Sparse FE" in 2
replace coef_name = "b2 (GDP sq)" in 2
replace value = `b2_sparse' in 2

replace spec = "Sparse FE" in 3
replace coef_name = "b3 (GDP cb)" in 3
replace value = `b3_sparse' in 3

replace spec = "Kitchen-Sink FE" in 4
replace coef_name = "b1 (GDP)" in 4
replace value = `b1_kitchen' in 4

replace spec = "Kitchen-Sink FE" in 5
replace coef_name = "b2 (GDP sq)" in 5
replace value = `b2_kitchen' in 5

replace spec = "Kitchen-Sink FE" in 6
replace coef_name = "b3 (GDP cb)" in 6
replace value = `b3_kitchen' in 6

graph twoway ///
    (bar value order if spec == "Sparse FE", ///
        barwidth(0.35) color("106 155 204")) ///
    (bar value order if spec == "Kitchen-Sink FE", ///
        barwidth(0.35) color("217 119 87")), ///
    xlabel(1 `""b1" "(GDP)""' 2 `""b2" "(GDP{sup:2})""' 3 `""b3" "(GDP{sup:3})""' ///
           4 `""b1" "(GDP)""' 5 `""b2" "(GDP{sup:2})""' 6 `""b3" "(GDP{sup:3})""', ///
        angle(0) labsize(small)) ///
    xline(3.5, lcolor(gs10) lpattern(dash)) ///
    ylabel(, format(%5.2f)) ///
    ytitle("Coefficient value") ///
    title("Coefficient Instability Across Specifications", size(medium)) ///
    subtitle("Same GDP terms, different control sets", size(small)) ///
    legend(order(1 "Sparse FE (no controls)" 2 "Kitchen-Sink FE (all 12 controls)") ///
        rows(1) position(6) size(small)) ///
    note("Adding controls shifts GDP coefficients --- which specification is correct?") ///
    scheme(s2color) ///
    name(fig2_instab, replace)

graph export "stata_bma_dsl_fig2_instability.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig2_instability.png"
restore


*=============================================================================*
*  SECTION 4: BAYESIAN MODEL AVERAGING (BMA)
*=============================================================================*

display _newline "============================================="
display "  BMA ESTIMATION"
display "  Starting: $S_DATE $S_TIME"
display "============================================="

bmaregress $outcome $gdp_vars $controls ///
    ($fe, always), ///
    mprior(uniform) groupfv gprior(uip) ///
    mcmcsize(50000) dots(5000, every(10000)) ///
    rseed(9988) inputorder pipcutoff(0.8) ///
    saving("_bma_temp.dta", replace)

display _newline "BMA completed: $S_DATE $S_TIME"
estimates store bma_uip

*---------------------------------------------*
* 4a. Extract BMA coefficients                *
*---------------------------------------------*
matrix bma_coefs = e(b_bma)

local b1_bma = bma_coefs[1,1]
local b2_bma = bma_coefs[1,2]
local b3_bma = bma_coefs[1,3]

display _newline "=== BMA Coefficient Signs ==="
display "  b1 (GDP):   " %9.4f `b1_bma' _col(35) cond(`b1_bma' < 0, "NEGATIVE", "positive")
display "  b2 (GDP^2): " %9.4f `b2_bma' _col(35) cond(`b2_bma' > 0, "POSITIVE", "negative")
display "  b3 (GDP^3): " %9.4f `b3_bma' _col(35) cond(`b3_bma' < 0, "NEGATIVE", "positive")

matrix bma_se = e(se_bma)
local se1_bma = bma_se[1,1]
local se2_bma = bma_se[1,2]
local se3_bma = bma_se[1,3]

*---------------------------------------------*
* 4b. BMA turning points                      *
*---------------------------------------------*
local disc_bma = (`b2_bma')^2 - 3 * `b1_bma' * `b3_bma'

display _newline "=== BMA Turning Points ==="
display "  Discriminant: " %8.4f `disc_bma' ///
    cond(`disc_bma' > 0, " (turning points exist)", " (no turning points)")

local min_bma = exp((-`b2_bma' + sqrt(`disc_bma')) / (3 * `b3_bma'))
local max_bma = exp((-`b2_bma' - sqrt(`disc_bma')) / (3 * `b3_bma'))

display "  Minimum: $" %8.0fc `min_bma'
display "  Maximum: $" %8.0fc `max_bma'

*---------------------------------------------*
* 4c. PIP bar chart -- Figure 3               *
*---------------------------------------------*
* Build a clean PIP chart with readable labels and color-coding

matrix pip_mat = e(pip)
local nvars_all = colsof(pip_mat)

preserve
clear
set obs `nvars_all'

gen varname = ""
gen pip = .

local varnames : colnames pip_mat
forvalues i = 1/`nvars_all' {
    local vname : word `i' of `varnames'
    replace varname = "`vname'" in `i'
    replace pip = pip_mat[1,`i'] in `i'
}

* Keep ONLY the 15 candidate variables (drop FE dummies and constant)
keep if inlist(varname, "ln_gdp", "ln_gdp_sq", "ln_gdp_cb", ///
    "fossil_fuel", "renewable", "urban", "globalization") | ///
    inlist(varname, "pop_density", "democracy", "corruption", ///
    "industry", "services", "trade", "fdi", "credit")
local nvars = _N

* Create readable labels
gen label = ""
replace label = "GDP per capita (log)"      if varname == "ln_gdp"
replace label = "GDP squared (log)"         if varname == "ln_gdp_sq"
replace label = "GDP cubed (log)"           if varname == "ln_gdp_cb"
replace label = "Fossil fuel share (%)"     if varname == "fossil_fuel"
replace label = "Renewable energy (%)"      if varname == "renewable"
replace label = "Urban population (%)"      if varname == "urban"
replace label = "Globalization index"       if varname == "globalization"
replace label = "Population density"        if varname == "pop_density"
replace label = "Democracy score"           if varname == "democracy"
replace label = "Corruption index"          if varname == "corruption"
replace label = "Industry VA (% GDP)"       if varname == "industry"
replace label = "Services VA (% GDP)"       if varname == "services"
replace label = "Trade openness (% GDP)"    if varname == "trade"
replace label = "FDI inflows (% GDP)"       if varname == "fdi"
replace label = "Domestic credit (% GDP)"   if varname == "credit"

* Mark true vs noise predictors
gen is_true = inlist(varname, "fossil_fuel", "renewable", "urban", ///
    "democracy", "industry", "ln_gdp", "ln_gdp_sq", "ln_gdp_cb")

* Sort by PIP (highest first) and create plotting order
gsort -pip
gen order = _n

* Apply readable labels to the order variable
labmask order, values(label)

* Display PIP values for the log
list varname label pip is_true, sep(0)

* Create the bar chart with color coding
graph twoway ///
    (bar pip order if is_true == 1, horizontal barwidth(0.6) ///
        color("106 155 204")) ///
    (bar pip order if is_true == 0, horizontal barwidth(0.6) ///
        color(gs11)), ///
    xline(0.8, lcolor("217 119 87") lpattern(dash) lwidth(medium)) ///
    ylabel(1(1)`nvars', valuelabel angle(0) labsize(small) nogrid) ///
    xlabel(0(0.2)1, format(%3.1f)) ///
    ytitle("") ///
    xtitle("Posterior Inclusion Probability (PIP)") ///
    title("BMA: Which Variables Matter?", size(medsmall)) ///
    subtitle("Dashed line = 0.8 robustness threshold", size(small)) ///
    legend(order(1 "True predictor (in DGP)" 2 "Noise variable (not in DGP)") ///
        rows(1) position(6) size(vsmall)) ///
    note("Variables sorted by PIP. Blue = true predictor, gray = noise." ///
         "Only candidate variables shown (country and year FE excluded).", size(vsmall)) ///
    scheme(s2color) ysize(7) xsize(9) ///
    name(fig3_pip, replace)

graph export "stata_bma_dsl_fig3_pip.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig3_pip.png"
restore

*---------------------------------------------*
* 4d. Coefficient densities -- Figure 4       *
*---------------------------------------------*
* bmagraph coefdensity with multiple vars shows only the last one.
* Generate individual plots for all 6 robust variables (PIP > 0.80)
* and combine in a 3x2 grid. Use consistent small fonts, legends off.

* All axis text at vsmall, zero reference line, no legend
local popts ///
    xtitle("Coefficient", size(vsmall)) ///
    ytitle("Density", size(vsmall)) ///
    ylabel(, labsize(vsmall) angle(0) axis(1)) ///
    ylabel(, labsize(vsmall) angle(0) axis(2)) ///
    ytitle("Probability", size(vsmall) axis(2)) ///
    xlabel(, labsize(vsmall)) ///
    xline(0, lcolor(gs10) lpattern(dash) lwidth(thin)) ///
    legend(off) scheme(s2color)

bmagraph coefdensity ln_gdp, ///
    title("GDP per capita (log)", size(small)) `popts' name(dens_gdp, replace)
bmagraph coefdensity ln_gdp_sq, ///
    title("GDP squared (log)", size(small)) `popts' name(dens_gdp_sq, replace)
bmagraph coefdensity ln_gdp_cb, ///
    title("GDP cubed (log)", size(small)) `popts' name(dens_gdp_cb, replace)
bmagraph coefdensity fossil_fuel, ///
    title("Fossil fuel share (%)", size(small)) `popts' name(dens_fossil, replace)
bmagraph coefdensity renewable, ///
    title("Renewable energy (%)", size(small)) `popts' name(dens_renewable, replace)
bmagraph coefdensity industry, ///
    title("Industry VA (% GDP)", size(small)) `popts' name(dens_industry, replace)

graph combine dens_gdp dens_gdp_sq dens_gdp_cb ///
    dens_fossil dens_renewable dens_industry, ///
    cols(3) rows(2) imargin(small) ///
    title("BMA: Posterior Coefficient Densities", size(medsmall)) ///
    subtitle("All 6 robust variables (PIP > 0.80)", size(small)) ///
    note("Blue curve = posterior density conditional on inclusion. Red line = probability of noninclusion (1 - PIP)." ///
         "Dashed gray line = zero. A blue curve far from zero = strong evidence the variable matters.", size(vsmall)) ///
    scheme(s2color) xsize(12) ysize(7) ///
    name(fig4_density, replace)

graph export "stata_bma_dsl_fig4_coefdensity.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig4_coefdensity.png"

*---------------------------------------------*
* 4e. Pooled BMA (without fixed effects)      *
*---------------------------------------------*
* Run BMA without country/year FE to show the cost of omitting FE.
* Without FE, noise variables get spuriously high PIPs.

display _newline "=== BMA WITHOUT FIXED EFFECTS (POOLED) ==="
bmaregress $outcome $gdp_vars $controls, ///
    mprior(uniform) gprior(uip) ///
    mcmcsize(50000) rseed(9988) pipcutoff(0.5) burnin(5000)
* Note: bmaregress does not support estimates store
matrix bma_pooled_tbl = r(table)
local b1_bma_p = bma_pooled_tbl[1,1]
local b2_bma_p = bma_pooled_tbl[1,2]
local b3_bma_p = bma_pooled_tbl[1,3]
local sd1_bma_p = bma_pooled_tbl[2,1]
local sd2_bma_p = bma_pooled_tbl[2,2]
local sd3_bma_p = bma_pooled_tbl[2,3]

display _newline "Pooled BMA coefficients:"
display "  b1 = " %9.4f `b1_bma_p'
display "  b2 = " %9.4f `b2_bma_p'
display "  b3 = " %9.4f `b3_bma_p'

* Turning points
local disc_bma_p = (`b2_bma_p')^2 - 3 * `b1_bma_p' * `b3_bma_p'
if `disc_bma_p' > 0 {
    local min_bma_p = exp((-`b2_bma_p' + sqrt(`disc_bma_p')) / (3 * `b3_bma_p'))
    local max_bma_p = exp((-`b2_bma_p' - sqrt(`disc_bma_p')) / (3 * `b3_bma_p'))
    display "  Minimum: $" %8.0fc `min_bma_p'
    display "  Maximum: $" %8.0fc `max_bma_p'
}


*=============================================================================*
*  SECTION 5: DOUBLE-SELECTION LASSO (DSL)
*=============================================================================*

display _newline "============================================="
display "  DSL ESTIMATION"
display "  Starting: $S_DATE $S_TIME"
display "============================================="

dsregress $outcome $gdp_vars, ///
    controls(($fe) $controls) ///
    vce(cluster country_id)

display _newline "DSL completed: $S_DATE $S_TIME"
estimates store dsl_plugin

*---------------------------------------------*
* 5a. Extract DSL coefficients                *
*---------------------------------------------*
matrix dsl_coefs = e(b)

local b1_dsl = dsl_coefs[1,1]
local b2_dsl = dsl_coefs[1,2]
local b3_dsl = dsl_coefs[1,3]

display _newline "=== DSL Coefficient Signs ==="
display "  b1 (GDP):   " %9.4f `b1_dsl' _col(35) cond(`b1_dsl' < 0, "NEGATIVE", "positive")
display "  b2 (GDP^2): " %9.4f `b2_dsl' _col(35) cond(`b2_dsl' > 0, "POSITIVE", "negative")
display "  b3 (GDP^3): " %9.4f `b3_dsl' _col(35) cond(`b3_dsl' < 0, "NEGATIVE", "positive")

local se1_dsl = sqrt(e(V)[1,1])
local se2_dsl = sqrt(e(V)[2,2])
local se3_dsl = sqrt(e(V)[3,3])

*---------------------------------------------*
* 5b. DSL turning points                      *
*---------------------------------------------*
local disc_dsl = (`b2_dsl')^2 - 3 * `b1_dsl' * `b3_dsl'

display _newline "=== DSL Turning Points ==="
display "  Discriminant: " %8.4f `disc_dsl' ///
    cond(`disc_dsl' > 0, " (turning points exist)", " (no turning points)")

local min_dsl = exp((-`b2_dsl' + sqrt(`disc_dsl')) / (3 * `b3_dsl'))
local max_dsl = exp((-`b2_dsl' - sqrt(`disc_dsl')) / (3 * `b3_dsl'))

display "  Minimum: $" %8.0fc `min_dsl'
display "  Maximum: $" %8.0fc `max_dsl'

*---------------------------------------------*
* 5c. LASSO selection summary                 *
*---------------------------------------------*
display _newline "=== LASSO Selection ==="
lassoinfo

*---------------------------------------------*
* 5d. Pooled DSL (without fixed effects)      *
*---------------------------------------------*
* Run DSL without country/year FE to show how LASSO behaves
* when it has only 12 candidate controls (no FE dummies).
* This demonstrates LASSO's selection power but also the cost
* of omitting fixed effects (severe omitted variable bias).

display _newline "=== DSL WITHOUT FIXED EFFECTS (POOLED) ==="
dsregress $outcome $gdp_vars, ///
    controls($controls) ///
    vce(cluster country_id)
estimates store dsl_pooled

matrix dsl_pooled_coefs = e(b)
local b1_pooled = dsl_pooled_coefs[1,1]
local b2_pooled = dsl_pooled_coefs[1,2]
local b3_pooled = dsl_pooled_coefs[1,3]

local se1_pooled = sqrt(e(V)[1,1])
local se2_pooled = sqrt(e(V)[2,2])
local se3_pooled = sqrt(e(V)[3,3])

display _newline "Pooled DSL coefficients:"
display "  b1 = " %9.4f `b1_pooled'
display "  b2 = " %9.4f `b2_pooled'
display "  b3 = " %9.4f `b3_pooled'

* Turning points
local disc_pooled = (`b2_pooled')^2 - 3 * `b1_pooled' * `b3_pooled'
if `disc_pooled' > 0 {
    local min_pooled = exp((-`b2_pooled' + sqrt(`disc_pooled')) / (3 * `b3_pooled'))
    local max_pooled = exp((-`b2_pooled' - sqrt(`disc_pooled')) / (3 * `b3_pooled'))
    display "  Minimum: $" %8.0fc `min_pooled'
    display "  Maximum: $" %8.0fc `max_pooled'
}

lassoinfo


*=============================================================================*
*  SECTION 6: COMPARISON
*=============================================================================*

display _newline "============================================="
display "  COMPARISON: ALL METHODS"
display "============================================="
display _newline "                Sparse FE   Kitchen FE  BMA (UIP)   DSL"
display "  b1 (GDP):   " %9.4f `b1_sparse' " " %9.4f `b1_kitchen' " " %9.4f `b1_bma' " " %9.4f `b1_dsl'
display "  b2 (GDP^2): " %9.4f `b2_sparse' " " %9.4f `b2_kitchen' " " %9.4f `b2_bma' " " %9.4f `b2_dsl'
display "  b3 (GDP^3): " %9.4f `b3_sparse' " " %9.4f `b3_kitchen' " " %9.4f `b3_bma' " " %9.4f `b3_dsl'

display _newline "  TRUE DGP:   b1 = -7.1000, b2 = 0.8100, b3 = -0.0300"

*---------------------------------------------*
* 6a. Predicted EKC curves -- Figure 6        *
*---------------------------------------------*
* Normalize both curves so they are comparable on the same y-scale

quietly summarize ln_gdp
local xmin = r(min)
local xmax = r(max)
local xmean = r(mean)

preserve
clear
set obs 500
gen lngdp = `xmin' + (_n - 1) * (`xmax' - `xmin') / 499

* Compute cubic component for each method
gen fit_bma = `b1_bma' * lngdp + `b2_bma' * lngdp^2 + `b3_bma' * lngdp^3
gen fit_dsl = `b1_dsl' * lngdp + `b2_dsl' * lngdp^2 + `b3_dsl' * lngdp^3

* Normalize: subtract value at the sample mean GDP
local norm_bma = `b1_bma' * `xmean' + `b2_bma' * `xmean'^2 + `b3_bma' * `xmean'^3
local norm_dsl = `b1_dsl' * `xmean' + `b2_dsl' * `xmean'^2 + `b3_dsl' * `xmean'^3

replace fit_bma = fit_bma - `norm_bma'
replace fit_dsl = fit_dsl - `norm_dsl'

* Turning point vertical lines (in log scale)
local lnmin_bma = ln(`min_bma')
local lnmax_bma = ln(`max_bma')
local lnmin_dsl = ln(`min_dsl')
local lnmax_dsl = ln(`max_dsl')

twoway ///
    (line fit_bma lngdp, lcolor("106 155 204") lwidth(medthick) lpattern(solid)) ///
    (line fit_dsl lngdp, lcolor("217 119 87") lwidth(medthick) lpattern(dash)), ///
    xline(`lnmin_bma', lcolor("106 155 204"%50) lpattern(shortdash) lwidth(thin)) ///
    xline(`lnmax_bma', lcolor("106 155 204"%50) lpattern(shortdash) lwidth(thin)) ///
    xline(`lnmin_dsl', lcolor("217 119 87"%50) lpattern(shortdash) lwidth(thin)) ///
    xline(`lnmax_dsl', lcolor("217 119 87"%50) lpattern(shortdash) lwidth(thin)) ///
    yline(0, lcolor(gs12) lpattern(dot)) ///
    ytitle("Predicted log CO2 (normalized at mean GDP)") ///
    xtitle("Log GDP per capita") ///
    title("Predicted EKC Shape: BMA vs. DSL", size(medium)) ///
    subtitle("Both methods trace an inverted-N curve", size(small)) ///
    legend(order(1 "BMA" 2 "DSL") rows(1) position(6) size(small)) ///
    note("Curves normalized to zero at sample-mean GDP." ///
         "Vertical dashed lines mark turning points (blue = BMA, orange = DSL).") ///
    scheme(s2color) ///
    name(fig5_ekc, replace)

graph export "stata_bma_dsl_fig5_ekc_curves.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig5_ekc_curves.png"
restore

*---------------------------------------------*
* 6b. Answer-key evaluation -- Figure 7       *
*---------------------------------------------*
* Compare BMA PIPs against ground truth

estimates restore bma_uip
matrix pip_mat = e(pip)
local nvars_all = colsof(pip_mat)

preserve
clear
set obs `nvars_all'

gen varname = ""
gen pip = .

local varnames : colnames pip_mat
forvalues i = 1/`nvars_all' {
    local vname : word `i' of `varnames'
    replace varname = "`vname'" in `i'
    replace pip = pip_mat[1,`i'] in `i'
}

* Keep ONLY the 15 candidate variables
keep if inlist(varname, "ln_gdp", "ln_gdp_sq", "ln_gdp_cb", ///
    "fossil_fuel", "renewable", "urban", "globalization") | ///
    inlist(varname, "pop_density", "democracy", "corruption", ///
    "industry", "services", "trade", "fdi", "credit")
local nvars = _N

* Readable labels
gen label = ""
replace label = "GDP per capita (log)"      if varname == "ln_gdp"
replace label = "GDP squared (log)"         if varname == "ln_gdp_sq"
replace label = "GDP cubed (log)"           if varname == "ln_gdp_cb"
replace label = "Fossil fuel share (%)"     if varname == "fossil_fuel"
replace label = "Renewable energy (%)"      if varname == "renewable"
replace label = "Urban population (%)"      if varname == "urban"
replace label = "Globalization index"       if varname == "globalization"
replace label = "Population density"        if varname == "pop_density"
replace label = "Democracy score"           if varname == "democracy"
replace label = "Corruption index"          if varname == "corruption"
replace label = "Industry VA (% GDP)"       if varname == "industry"
replace label = "Services VA (% GDP)"       if varname == "services"
replace label = "Trade openness (% GDP)"    if varname == "trade"
replace label = "FDI inflows (% GDP)"       if varname == "fdi"
replace label = "Domestic credit (% GDP)"   if varname == "credit"

* Ground truth
gen is_true = inlist(varname, "fossil_fuel", "renewable", "urban", ///
    "democracy", "industry", "ln_gdp", "ln_gdp_sq", "ln_gdp_cb")

* Sort: true predictors first (by PIP), then noise (by PIP)
gsort -is_true -pip
gen order = _n
labmask order, values(label)

* Dot plot: BMA PIP by variable, colored by ground truth
graph twoway ///
    (scatter order pip if is_true == 1, ///
        mcolor("106 155 204") msymbol(circle) msize(large)) ///
    (scatter order pip if is_true == 0, ///
        mcolor(gs9) msymbol(diamond) msize(large)), ///
    xline(0.8, lcolor("217 119 87") lpattern(dash) lwidth(medium)) ///
    ylabel(1(1)`nvars', valuelabel angle(0) labsize(small) nogrid) ///
    xlabel(0(0.2)1, format(%3.1f)) ///
    ytitle("") ///
    xtitle("BMA Posterior Inclusion Probability") ///
    title("Answer Key: Do BMA and DSL Recover the Truth?", size(medsmall)) ///
    subtitle("True predictors should have PIP > 0.8; noise should have PIP < 0.8", size(small)) ///
    legend(order(1 "True predictor" 2 "Noise variable") ///
        rows(1) position(6) size(vsmall)) ///
    note("Dashed line = 0.8 threshold. Circle = true predictor, diamond = noise." ///
         "Only candidate variables shown (country and year FE excluded).", size(vsmall)) ///
    scheme(s2color) ysize(7) xsize(9) ///
    name(fig6_answer, replace)

graph export "stata_bma_dsl_fig6_answer_key.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig6_answer_key.png"
restore

*---------------------------------------------*
* 6c. Export comparison CSV                   *
*---------------------------------------------*
preserve
clear
set obs 4

gen method = ""
replace method = "Sparse FE" in 1
replace method = "Kitchen-Sink FE" in 2
replace method = "BMA (UIP)" in 3
replace method = "DSL (Plugin)" in 4

gen b_gdp = .
replace b_gdp = `b1_sparse' in 1
replace b_gdp = `b1_kitchen' in 2
replace b_gdp = `b1_bma' in 3
replace b_gdp = `b1_dsl' in 4

gen b_gdp_sq = .
replace b_gdp_sq = `b2_sparse' in 1
replace b_gdp_sq = `b2_kitchen' in 2
replace b_gdp_sq = `b2_bma' in 3
replace b_gdp_sq = `b2_dsl' in 4

gen b_gdp_cb = .
replace b_gdp_cb = `b3_sparse' in 1
replace b_gdp_cb = `b3_kitchen' in 2
replace b_gdp_cb = `b3_bma' in 3
replace b_gdp_cb = `b3_dsl' in 4

gen min_tp = .
replace min_tp = `min_sparse' in 1
replace min_tp = `min_kitchen' in 2
replace min_tp = `min_bma' in 3
replace min_tp = `min_dsl' in 4

gen max_tp = .
replace max_tp = `max_sparse' in 1
replace max_tp = `max_kitchen' in 2
replace max_tp = `max_bma' in 3
replace max_tp = `max_dsl' in 4

export delimited "stata_bma_dsl_comparison.csv", replace
display _newline "Saved: stata_bma_dsl_comparison.csv"
restore


*=============================================================================*
*  APPENDIX A: FIRST-DIFFERENCES ANALYSIS
*=============================================================================*
* Create a cross-sectional dataset by taking (2014 value) - (1995 value)
* for each country. This removes time-invariant FE and produces a setting
* where BMA and DSL operate on pure cross-sectional data (N=80).

display _newline "============================================="
display "  APPENDIX A: FIRST DIFFERENCES"
display "============================================="

preserve

* Keep only first and last years
keep if year == 1995 | year == 2014

* Reshape to wide
reshape wide $outcome $gdp_vars $controls, i(country_id) j(year)

* Compute first differences: delta_var = var(2014) - var(1995)
foreach v in $outcome $gdp_vars $controls {
    gen d_`v' = `v'2014 - `v'1995
}

summarize d_*

*---------------------------------------------*
* A1. FD: Sparse OLS                          *
*---------------------------------------------*
display _newline "=== FD: Sparse OLS ==="
regress d_ln_co2 d_ln_gdp d_ln_gdp_sq d_ln_gdp_cb, robust

*---------------------------------------------*
* A2. FD: Kitchen-sink OLS                    *
*---------------------------------------------*
display _newline "=== FD: Kitchen-sink OLS ==="
regress d_ln_co2 d_ln_gdp d_ln_gdp_sq d_ln_gdp_cb ///
    d_fossil_fuel d_renewable d_urban d_industry d_democracy ///
    d_services d_trade d_fdi d_credit d_pop_density ///
    d_corruption d_globalization, robust

*---------------------------------------------*
* A3. FD: BMA                                 *
*---------------------------------------------*
display _newline "=== FD: BMA ==="
bmaregress d_ln_co2 d_ln_gdp d_ln_gdp_sq d_ln_gdp_cb ///
    d_fossil_fuel d_renewable d_urban d_industry d_democracy ///
    d_services d_trade d_fdi d_credit d_pop_density ///
    d_corruption d_globalization, ///
    mprior(uniform) gprior(uip) ///
    mcmcsize(50000) rseed(9988) pipcutoff(0.5) burnin(5000)

* List all PIPs
matrix pip_fd = e(pip)
local varnames_fd : colnames pip_fd
local ncols_fd = colsof(pip_fd)
display _newline "FD BMA PIPs:"
forvalues i = 1/`ncols_fd' {
    local vname : word `i' of `varnames_fd'
    display "  `vname': " %8.6f pip_fd[1,`i']
}

*---------------------------------------------*
* A4. FD: DSL                                 *
*---------------------------------------------*
display _newline "=== FD: DSL ==="
dsregress d_ln_co2 d_ln_gdp d_ln_gdp_sq d_ln_gdp_cb, ///
    controls(d_fossil_fuel d_renewable d_urban d_industry d_democracy ///
             d_services d_trade d_fdi d_credit d_pop_density ///
             d_corruption d_globalization) ///
    rseed(9988)

lassoinfo

restore


*=============================================================================*
*  WRAP-UP
*=============================================================================*

display _newline "============================================="
display "  TUTORIAL COMPLETE: $S_DATE $S_TIME"
display "============================================="
display _newline "Output files:"
display "  analysis.log                       -- this log"
display "  stata_bma_dsl_fig1_scatter.png     -- scatter plot"
display "  stata_bma_dsl_fig2_instability.png -- coefficient instability"
display "  stata_bma_dsl_fig3_pip.png         -- BMA PIPs (color-coded)"
display "  stata_bma_dsl_fig4_coefdensity.png -- BMA coefficient densities (4 panels)"
display "  stata_bma_dsl_fig5_ekc_curves.png  -- EKC curves (normalized)"
display "  stata_bma_dsl_fig6_answer_key.png  -- answer key evaluation"
display "  stata_bma_dsl_comparison.csv       -- coefficient comparison"

capture erase "_bma_temp.dta"
log close
