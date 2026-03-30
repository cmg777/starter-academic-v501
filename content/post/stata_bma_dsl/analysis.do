*=============================================================================*
*  TUTORIAL: Bayesian Model Averaging (BMA) and Double-Selection LASSO (DSL)
*  -------------------------------------------------------------------------
*  Data:    Gravina & Lanzafame (2025) "What's your shape?"
*           Energy Economics, 108649
*  Purpose: Learn how to apply BMA and DSL to test the Environmental
*           Kuznets Curve (EKC) hypothesis using real research data.
*  Requires: Stata 18+ (bmaregress, dsregress)
*  Runtime:  ~15-20 minutes (mostly the BMA step)
*  Outputs:  analysis.log                       -- full session log
*            stata_bma_dsl_fig1_scatter.png     -- raw data scatter plot
*            stata_bma_dsl_fig2_instability.png -- coefficient instability
*            stata_bma_dsl_fig3_pip.png         -- BMA posterior inclusion probs
*            stata_bma_dsl_fig4_varmap.png      -- BMA variable inclusion map
*            stata_bma_dsl_fig5_coefdensity.png -- BMA coefficient densities
*            stata_bma_dsl_fig6_ekc_curves.png  -- predicted EKC curves
*            stata_bma_dsl_comparison.csv       -- side-by-side results table
*=============================================================================*

clear all
set more off

* Install required packages (capture suppresses "already installed" errors)
capture ssc install reghdfe
capture ssc install ftools


*=============================================================================*
*  SECTION 1: DATA SETUP
*=============================================================================*

* Start the log file -- this records everything Stata does
log using "analysis.log", replace text

display _newline "============================================="
display "  TUTORIAL: BMA and DSL for the EKC"
display "  Started: $S_DATE $S_TIME"
display "============================================="

* Load the dataset (84 countries, 1995-2015)
* Data from Gravina & Lanzafame (2025), hosted on GitHub for reproducibility
use "https://github.com/cmg777/starter-academic-v501/raw/master/content/post/stata_bma_dsl/AFG_ML_master_dataset.dta", clear
xtset id year, yearly

*---------------------------------------------*
* Generate variables                          *
*---------------------------------------------*

* Our outcome: CO2 emissions per capita, in logs
* We use logs because the relationship is multiplicative, not additive.
gen wdi_lnco2 = ln(wdi_co2)
label variable wdi_lnco2 "CO2 emissions per capita (log)"

* GDP per capita terms -- the heart of the EKC test
* We need linear, squared, and cubed terms to fit a cubic polynomial.
* rgdpo = real GDP (output-side), pop = population
gen pwt_gdppc = ln(rgdpo/pop)
gen pwt_gdppc_sq = pwt_gdppc^2
gen pwt_gdppc_cb = pwt_gdppc^3
label variable pwt_gdppc    "Real GDP per capita (log)"
label variable pwt_gdppc_sq "Real GDP per capita squared (log)"
label variable pwt_gdppc_cb "Real GDP per capita cubed (log)"

* Control variables -- these are the 24 "candidate" variables that BMA and DSL
* will evaluate. Each captures a different channel through which economic
* development might affect CO2 emissions.
gen ist = pl_i/pl_c
gen gini_mkt = ln(swiid_gini_mkt)
gen wdi_tourism_arr_pop = ln(wdi_tourism_arrivals / wdi_pop)
gen lab_prod = ln(rgdpe/emp)
gen ln_credit = ln(fds_pr_credit_gdp)
gen ln_rat = ln(1 + iead_rat)
gen gdppc_level = rgdpo/pop

label variable ist                    "Investment-specific tech progress"
label variable gini_mkt               "Gini Index (log)"
label variable wdi_tourism_arr_pop    "International tourism (log)"
label variable lab_prod               "Labor productivity (log)"
label variable ln_credit              "Private credit to GDP (log)"
label variable ln_rat                 "IEAs ratified per year (log)"
label variable wdi_fossil             "Fossil fuel energy (%)"
label variable wdi_energy_imp         "Energy imports (%)"
label variable wdi_alt_energy         "Alternative & nuclear energy (%)"
label variable wdi_urbanpop           "Urban population (%)"
label variable KOFGI                  "KOF Globalization Index"
label variable wdi_pop_dens           "Population density"
label variable ctfp                   "TFP level"
label variable em_envmin_upd          "Environmental ministry (dummy)"
label variable fao_luforest           "Forest land (%)"
label variable wdi_agri_va_gdp        "Agriculture value added (% GDP)"
label variable wdi_industry_va_gdp    "Industry value added (% GDP)"
label variable wdi_services_gdp       "Services value added (% GDP)"
label variable bl_1564_lh_ipo         "Tertiary education (%)"
label variable wdi_fdi_net_inflows_gdp "FDI net inflows (% GDP)"
label variable wdi_inflation          "Inflation (%)"
label variable wdi_imports_gdp        "Imports (% GDP)"
label variable wdi_exports_gdp        "Exports (% GDP)"
label variable wdi_trade_gdp          "Total trade (% GDP)"
label variable polity2                "Polity Score Index"
label variable corruption             "Corruption Index"
label variable dpi_polariz            "Political Polarization"

*---------------------------------------------*
* Define variable groups (macros)             *
*---------------------------------------------*
* These macros organize variables by category. BMA and DSL will evaluate
* all of them as potential controls alongside the three GDP terms.

global outcome      "wdi_lnco2"
global gdppc_vars   "pwt_gdppc pwt_gdppc_sq pwt_gdppc_cb"
global energy_vars  "wdi_fossil wdi_energy_imp wdi_alt_energy"
global sociodemo    "wdi_urbanpop KOFGI wdi_pop_dens"
global tech_vars    "ctfp ist"
global env_vars     "em_envmin_upd ln_rat fao_luforest"
global econ_vars    "wdi_agri_va_gdp wdi_industry_va_gdp wdi_services_gdp bl_1564_lh_ipo wdi_fdi_net_inflows_gdp gini_mkt wdi_tourism_arr_pop lab_prod wdi_inflation wdi_imports_gdp wdi_exports_gdp wdi_trade_gdp ln_credit"
global inst_vars    "polity2 corruption dpi_polariz"

* All controls combined (for baseline regressions)
global all_controls "$energy_vars $sociodemo $env_vars $tech_vars $inst_vars $econ_vars"

* Fixed effects -- always included in every model
global fe_vars      "i.id i.year"

*---------------------------------------------*
* Restrict to analysis sample                 *
*---------------------------------------------*
* The paper uses 84 countries with complete data (no missing values).

keep if countrycode == "ARM" | countrycode == "AUS" | countrycode == "AUT" | ///
    countrycode == "BEL" | countrycode == "BGR" | countrycode == "BHR" | ///
    countrycode == "BOL" | countrycode == "BRA" | countrycode == "BWA" | ///
    countrycode == "CAN" | countrycode == "CHL" | countrycode == "CHN" | ///
    countrycode == "CMR" | countrycode == "COL" | countrycode == "CRI" | ///
    countrycode == "CYP" | countrycode == "CZE" | countrycode == "DNK" | ///
    countrycode == "DOM" | countrycode == "ECU" | countrycode == "EGY" | ///
    countrycode == "ESP" | countrycode == "EST" | countrycode == "FIN" | ///
    countrycode == "FRA" | countrycode == "GAB" | countrycode == "GBR" | ///
    countrycode == "GRC" | countrycode == "GTM" | countrycode == "HND" | ///
    countrycode == "HRV" | countrycode == "HUN" | countrycode == "IDN" | ///
    countrycode == "IND" | countrycode == "IRL" | countrycode == "IRN" | ///
    countrycode == "ISR" | countrycode == "ITA" | countrycode == "JAM" | ///
    countrycode == "JOR" | countrycode == "JPN" | countrycode == "KAZ" | ///
    countrycode == "KEN" | countrycode == "KOR" | countrycode == "LKA" | ///
    countrycode == "LTU" | countrycode == "LUX" | countrycode == "LVA" | ///
    countrycode == "MAR" | countrycode == "MEX" | countrycode == "MNG" | ///
    countrycode == "MOZ" | countrycode == "MYS" | countrycode == "NAM" | ///
    countrycode == "NER" | countrycode == "NIC" | countrycode == "NLD" | ///
    countrycode == "NOR" | countrycode == "NZL" | countrycode == "PAN" | ///
    countrycode == "PER" | countrycode == "PHL" | countrycode == "POL" | ///
    countrycode == "PRT" | countrycode == "PRY" | countrycode == "RUS" | ///
    countrycode == "SAU" | countrycode == "SDN" | countrycode == "SEN" | ///
    countrycode == "SGP" | countrycode == "SVK" | countrycode == "SVN" | ///
    countrycode == "SWE" | countrycode == "TGO" | countrycode == "THA" | ///
    countrycode == "TUN" | countrycode == "TUR" | countrycode == "TZA" | ///
    countrycode == "UKR" | countrycode == "URY" | countrycode == "USA" | ///
    countrycode == "VEN" | countrycode == "ZAF" | countrycode == "ZMB"

drop if year < 1995 | year > 2015

* Flag observations with any missing values across all variables
cap drop nmissing
egen nmissing = rowmiss($outcome $gdppc_vars $energy_vars $sociodemo ///
    $env_vars $tech_vars $inst_vars $econ_vars)

display _newline "=== Analysis sample ==="
count if nmissing == 0
display "Expected: 1,215 observations (84 countries x ~14.5 years avg)"

* Quick summary of key variables
display _newline "=== Summary statistics ==="
summarize $outcome $gdppc_vars if nmissing == 0


*=============================================================================*
*  SECTION 2: EXPLORE THE DATA -- FIGURE 1
*=============================================================================*
*
*  Before running any models, let's look at the raw data. Does the scatter
*  of log GDP vs log CO2 suggest a nonlinear relationship?

twoway (scatter wdi_lnco2 pwt_gdppc if nmissing == 0, ///
        msize(tiny) mcolor(navy%40) msymbol(circle)), ///
    ytitle("Log CO2 emissions per capita") ///
    xtitle("Log real GDP per capita") ///
    title("Raw Data: CO2 Emissions vs. Income", size(medium)) ///
    subtitle("84 countries, 1995-2015 (N = 1,215)", size(small)) ///
    note("Each dot is a country-year observation." ///
         "Notice the nonlinear pattern -- motivates testing for a cubic shape.") ///
    scheme(s2color) ///
    name(fig1_scatter, replace)

graph export "stata_bma_dsl_fig1_scatter.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig1_scatter.png"


*=============================================================================*
*  SECTION 3: BASELINE -- STANDARD FIXED EFFECTS
*=============================================================================*
*
*  Before using BMA or DSL, let's see what standard panel regressions say.
*  We run two specifications:
*    (a) SPARSE: GDP polynomial terms + country & year FE only (no controls)
*    (b) KITCHEN-SINK: GDP terms + ALL 24 controls + country & year FE
*
*  If the coefficients are stable across both, we don't need fancy methods.
*  If they change dramatically, that proves model uncertainty is a real problem.

display _newline "============================================="
display "  BASELINE: Standard Fixed Effects Regressions"
display "============================================="

*---------------------------------------------*
* 3a. Sparse specification (no controls)      *
*---------------------------------------------*

reghdfe $outcome $gdppc_vars if nmissing == 0, absorb(id year)
estimates store fe_sparse

* Extract coefficients
local b1_sparse = _b[pwt_gdppc]
local b2_sparse = _b[pwt_gdppc_sq]
local b3_sparse = _b[pwt_gdppc_cb]

display _newline "=== Sparse FE Coefficients ==="
display "  b1 (GDP):       " %9.4f `b1_sparse'
display "  b2 (GDP^2):     " %9.4f `b2_sparse'
display "  b3 (GDP^3):     " %9.4f `b3_sparse'

*---------------------------------------------*
* 3b. Kitchen-sink specification (all controls)*
*---------------------------------------------*

reghdfe $outcome $gdppc_vars $all_controls if nmissing == 0, absorb(id year)
estimates store fe_kitchen

* Extract coefficients
local b1_kitchen = _b[pwt_gdppc]
local b2_kitchen = _b[pwt_gdppc_sq]
local b3_kitchen = _b[pwt_gdppc_cb]

display _newline "=== Kitchen-Sink FE Coefficients ==="
display "  b1 (GDP):       " %9.4f `b1_kitchen'
display "  b2 (GDP^2):     " %9.4f `b2_kitchen'
display "  b3 (GDP^3):     " %9.4f `b3_kitchen'

*---------------------------------------------*
* 3c. Compare the two specifications          *
*---------------------------------------------*

display _newline "=== Coefficient Comparison ==="
display _newline "                    Sparse FE       Kitchen-Sink FE"
display "  b1 (GDP):       " %9.4f `b1_sparse' "       " %9.4f `b1_kitchen'
display "  b2 (GDP^2):     " %9.4f `b2_sparse' "       " %9.4f `b2_kitchen'
display "  b3 (GDP^3):     " %9.4f `b3_sparse' "       " %9.4f `b3_kitchen'

* Compute turning points for both specifications
local disc_sparse = (`b2_sparse')^2 - 3 * `b1_sparse' * `b3_sparse'
local disc_kitchen = (`b2_kitchen')^2 - 3 * `b1_kitchen' * `b3_kitchen'

display _newline "=== Turning Points Comparison ==="

if `disc_sparse' > 0 {
    local min_sparse = exp((-`b2_sparse' + sqrt(`disc_sparse')) / (3 * `b3_sparse'))
    local max_sparse = exp((-`b2_sparse' - sqrt(`disc_sparse')) / (3 * `b3_sparse'))
    display "  Sparse  -- Min: $" %10.0fc `min_sparse' "  Max: $" %10.0fc `max_sparse'
}
else {
    display "  Sparse  -- No real turning points (discriminant < 0)"
    local min_sparse = .
    local max_sparse = .
}

if `disc_kitchen' > 0 {
    local min_kitchen = exp((-`b2_kitchen' + sqrt(`disc_kitchen')) / (3 * `b3_kitchen'))
    local max_kitchen = exp((-`b2_kitchen' - sqrt(`disc_kitchen')) / (3 * `b3_kitchen'))
    display "  Kitchen -- Min: $" %10.0fc `min_kitchen' "  Max: $" %10.0fc `max_kitchen'
}
else {
    display "  Kitchen -- No real turning points (discriminant < 0)"
    local min_kitchen = .
    local max_kitchen = .
}

*---------------------------------------------*
* 3d. Coefficient instability chart -- Fig 2  *
*---------------------------------------------*
* This bar chart shows how the GDP coefficients change between the two
* specifications, visually demonstrating the model uncertainty problem.

preserve
clear
set obs 6

gen spec = ""
gen coef_name = ""
gen value = .
gen order = _n

* Sparse specification
replace spec = "Sparse FE" in 1
replace coef_name = "b1 (GDP)" in 1
replace value = `b1_sparse' in 1

replace spec = "Sparse FE" in 2
replace coef_name = "b2 (GDP sq)" in 2
replace value = `b2_sparse' in 2

replace spec = "Sparse FE" in 3
replace coef_name = "b3 (GDP cb)" in 3
replace value = `b3_sparse' in 3

* Kitchen-sink specification
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
        barwidth(0.35) color(navy%70)) ///
    (bar value order if spec == "Kitchen-Sink FE", ///
        barwidth(0.35) color(cranberry%70)), ///
    xlabel(1 "b1 (GDP)" 2 "b2 (GDP{superscript:2})" 3 "b3 (GDP{superscript:3})" ///
           4 "b1 (GDP)" 5 "b2 (GDP{superscript:2})" 6 "b3 (GDP{superscript:3})", ///
        angle(0) labsize(small)) ///
    xline(3.5, lcolor(gs10) lpattern(dash)) ///
    ylabel(, format(%4.2f)) ///
    ytitle("Coefficient value") ///
    title("Coefficient Instability: Which Controls to Include?", size(medium)) ///
    subtitle("Same GDP terms, different control sets -- coefficients shift dramatically", size(small)) ///
    legend(order(1 "Sparse FE (no controls)" 2 "Kitchen-Sink FE (all 24 controls)") ///
        rows(1) position(6) size(small)) ///
    note("This instability motivates BMA and DSL: principled methods" ///
         "for deciding which controls belong in the model.") ///
    scheme(s2color) ///
    name(fig2_instability, replace)

graph export "stata_bma_dsl_fig2_instability.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig2_instability.png"
restore


*=============================================================================*
*  SECTION 4: BAYESIAN MODEL AVERAGING (BMA)
*=============================================================================*
*
*  HOW BMA WORKS:
*  1. Consider all possible subsets of control variables (2^24 models).
*  2. Estimate each model and compute its posterior probability (how well
*     it fits the data, penalized for complexity).
*  3. Average coefficients across models, weighted by posterior probability.
*  4. For each variable, compute its Posterior Inclusion Probability (PIP):
*     the sum of posterior probabilities of all models that include it.
*     PIP > 0.5 = "robust" (more likely in than out).
*
*  KEY OPTIONS EXPLAINED:
*  - gprior(uip): Unit Information Prior -- sets the prior on coefficient
*    magnitudes equal to the information in one observation. This is a
*    standard, relatively uninformative choice.
*  - mprior(uniform): Every model is equally likely a priori.
*  - groupfv: Treats all country dummies as a single group (in/out together).
*  - mcmcsize(50000): Number of MCMC draws to explore model space.
*    The paper uses 200,000 for precision; we use 50,000 for speed.
*  - inputorder: Keeps variables in the order we specified, so GDP terms
*    are always in columns 1-3 of the coefficient matrix.
*  - The (i.id i.year, always) part means country and year fixed effects
*    are ALWAYS included -- they are not subject to model selection.

display _newline "============================================="
display "  STEP 1: BMA ESTIMATION"
display "  This will take ~10-15 minutes."
display "  Starting at: $S_DATE $S_TIME"
display "============================================="

bmaregress $outcome $gdppc_vars $energy_vars $sociodemo $env_vars ///
    $tech_vars $inst_vars $econ_vars ///
    ($fe_vars, always) if nmissing == 0, ///
    mprior(uniform) groupfv gprior(uip) ///
    mcmcsize(50000) dots(5000, every(10000)) ///
    rseed(9988) inputorder pipcutoff(0.5) ///
    saving("_tutorial_bma_temp.dta", replace)

display _newline "BMA completed at: $S_DATE $S_TIME"

* Store estimates so we can come back to them later
estimates store bma_uip

*---------------------------------------------*
* 4a. Extract and interpret BMA coefficients  *
*---------------------------------------------*
* The BMA posterior means are in e(b_bma) -- NOT e(b) like regular Stata.
* This is because BMA averages coefficients across many models.

matrix bma_coefs = e(b_bma)

* The cubic coefficients tell us the shape:
local b1_bma = bma_coefs[1,1]    // ln(GDP)
local b2_bma = bma_coefs[1,2]    // ln(GDP)^2
local b3_bma = bma_coefs[1,3]    // ln(GDP)^3

display _newline "=== BMA Coefficient Signs ==="
display "  b1 (GDP):       " %9.4f `b1_bma' _col(40) cond(`b1_bma' < 0, "NEGATIVE", "positive")
display "  b2 (GDP^2):     " %9.4f `b2_bma' _col(40) cond(`b2_bma' > 0, "POSITIVE", "negative")
display "  b3 (GDP^3):     " %9.4f `b3_bma' _col(40) cond(`b3_bma' < 0, "NEGATIVE", "positive")
display _newline "  For an inverted-N, we need: b1 < 0, b2 > 0, b3 < 0"

* Get posterior standard deviations
matrix bma_se = e(se_bma)
local se1_bma = bma_se[1,1]
local se2_bma = bma_se[1,2]
local se3_bma = bma_se[1,3]

*---------------------------------------------*
* 4b. Compute turning points                  *
*---------------------------------------------*
* The cubic has two turning points (where the slope = 0):
*   First derivative: b1 + 2*b2*x + 3*b3*x^2 = 0
*   This is a quadratic in x. Using the quadratic formula:
*     x* = (-b2 +/- sqrt(b2^2 - 3*b1*b3)) / (3*b3)
*   The discriminant (b2^2 - 3*b1*b3) must be > 0 for real turning points.
*   We then exponentiate because x = ln(GDP), so GDP = exp(x).

local disc_bma = (`b2_bma')^2 - 3 * `b1_bma' * `b3_bma'

display _newline "=== BMA Turning Points ==="
display "  Discriminant: " %12.6f `disc_bma' ///
    cond(`disc_bma' > 0, "  (> 0: turning points exist!)", "  (< 0: no turning points)")

* Compute the two turning points (in international dollars)
local min_bma = exp((-`b2_bma' + sqrt(`disc_bma')) / (3 * `b3_bma'))
local max_bma = exp((-`b2_bma' - sqrt(`disc_bma')) / (3 * `b3_bma'))

display "  Minimum (CO2 starts rising):  $" %10.0fc `min_bma'
display "  Maximum (CO2 starts falling): $" %10.0fc `max_bma'
display _newline "  Interpretation: CO2 falls below $" %10.0fc `min_bma' ///
    ", rises between the two,"
display "  and falls again above $" %10.0fc `max_bma' " -- an inverted-N."

*---------------------------------------------*
* 4c. PIP bar chart -- Figure 3               *
*---------------------------------------------*
* The PIP chart is the signature output of BMA. It shows which variables
* are "robust" (PIP > 0.5) across all the models BMA considered.
* We build this chart manually from the e(pip) matrix.

matrix pip_mat = e(pip)
local nvars = colsof(pip_mat)

preserve
clear
set obs `nvars'

gen varname = ""
gen pip = .

* Extract variable names and PIP values from the matrix
local varnames : colnames pip_mat
forvalues i = 1/`nvars' {
    local vname : word `i' of `varnames'
    replace varname = "`vname'" in `i'
    replace pip = pip_mat[1,`i'] in `i'
}

* Sort by PIP (highest first) and create a plotting order
gsort -pip
gen order = _n

* Create the horizontal bar chart
graph twoway ///
    (bar pip order, horizontal barwidth(0.7) color(navy%70)), ///
    xline(0.5, lcolor(cranberry) lpattern(dash) lwidth(medium)) ///
    ylabel(1(1)`nvars', valuelabel angle(0) labsize(vsmall) nogrid) ///
    xlabel(0(0.1)1, format(%3.1f)) ///
    ytitle("") xtitle("Posterior Inclusion Probability (PIP)") ///
    title("BMA: Which Variables Matter?", size(medium)) ///
    subtitle("Variables sorted by PIP. Dashed line = 0.5 threshold.", size(small)) ///
    note("PIP > 0.5 means the variable appears in more than half of the" ///
         "highest-probability models. These are considered 'robust' predictors.") ///
    scheme(s2color) ///
    name(fig3_pip, replace)

graph export "stata_bma_dsl_fig3_pip.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig3_pip.png"
restore


*---------------------------------------------*
* 4d. Variable inclusion map -- Figure 4      *
*---------------------------------------------*
* bmagraph varmap shows which variables are included in which models,
* ordered by model posterior probability. Each column is a model, each
* row is a variable. Blue = included, blank = excluded.
* This gives a visual "fingerprint" of the model space BMA explored.

estimates restore bma_uip

bmagraph varmap, ///
    title("BMA: Variable Inclusion Map", size(medium)) ///
    subtitle("Each column is a model, ordered by posterior probability", size(small)) ///
    note("Blue = variable included. Models on the left have higher posterior probability." ///
         "Variables appearing blue across most top models have high PIPs.") ///
    name(fig4_varmap, replace)

graph export "stata_bma_dsl_fig4_varmap.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig4_varmap.png"


*---------------------------------------------*
* 4e. Coefficient density plots -- Figure 5   *
*---------------------------------------------*
* bmagraph coefdensity shows the posterior distribution of each coefficient.
* The density is a mixture: a spike at zero (from models excluding the
* variable) and a continuous distribution (from models including it).
* A density concentrated far from zero = strong evidence the variable matters.

bmagraph coefdensity $gdppc_vars, ///
    title("BMA: Posterior Coefficient Densities (GDP Terms)", size(medium)) ///
    subtitle("Density far from zero = strong evidence the variable matters", size(small)) ///
    note("Each density is a weighted average across all sampled models." ///
         "Spike at zero comes from models that exclude the variable.") ///
    name(fig5_coefdensity, replace)

graph export "stata_bma_dsl_fig5_coefdensity.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig5_coefdensity.png"


*=============================================================================*
*  SECTION 5: DOUBLE-SELECTION LASSO (DSL)
*=============================================================================*
*
*  HOW DSL WORKS:
*  1. Run LASSO on the outcome (CO2) using all controls -> selects controls
*     that predict CO2.
*  2. Run LASSO on each treatment variable (GDP, GDP^2, GDP^3) using all
*     controls -> selects controls that predict GDP terms.
*  3. Take the UNION of all selected controls from steps 1 and 2.
*  4. Run OLS of CO2 on GDP terms + selected controls -> valid inference.
*
*  The "double selection" avoids omitted variable bias: if a control
*  affects both CO2 and GDP, leaving it out would bias the GDP coefficients.
*
*  KEY DIFFERENCES FROM BMA:
*  - BMA is Bayesian (posterior probabilities); DSL is frequentist (p-values).
*  - BMA averages across models; DSL selects ONE model.
*  - BMA takes ~15 minutes; DSL takes ~15 seconds.
*  - Both handle model uncertainty, but through different philosophies.
*
*  KEY OPTIONS:
*  - controls(): Variables for LASSO to consider. Parenthesized variables
*    (i.id, i.year) are forced in -- not subject to selection.
*  - vce(robust): Heteroskedasticity-robust standard errors.

display _newline "============================================="
display "  STEP 2: DSL ESTIMATION"
display "  This runs in seconds -- much faster than BMA."
display "  Starting at: $S_DATE $S_TIME"
display "============================================="

dsregress $outcome $gdppc_vars, ///
    controls(($fe_vars) $energy_vars $sociodemo $env_vars ///
    $tech_vars $inst_vars $econ_vars) ///
    vce(robust)

display _newline "DSL completed at: $S_DATE $S_TIME"

* Store estimates
estimates store dsl_plugin

*---------------------------------------------*
* 5a. Extract and interpret DSL coefficients  *
*---------------------------------------------*
* DSL coefficients are in e(b) -- standard Stata convention.

matrix dsl_coefs = e(b)

local b1_dsl = dsl_coefs[1,1]
local b2_dsl = dsl_coefs[1,2]
local b3_dsl = dsl_coefs[1,3]

display _newline "=== DSL Coefficient Signs ==="
display "  b1 (GDP):       " %9.4f `b1_dsl' _col(40) cond(`b1_dsl' < 0, "NEGATIVE", "positive")
display "  b2 (GDP^2):     " %9.4f `b2_dsl' _col(40) cond(`b2_dsl' > 0, "POSITIVE", "negative")
display "  b3 (GDP^3):     " %9.4f `b3_dsl' _col(40) cond(`b3_dsl' < 0, "NEGATIVE", "positive")

* Get standard errors
local se1_dsl = sqrt(e(V)[1,1])
local se2_dsl = sqrt(e(V)[2,2])
local se3_dsl = sqrt(e(V)[3,3])

*---------------------------------------------*
* 5b. Compute DSL turning points              *
*---------------------------------------------*
* Same formula as BMA -- the math doesn't change, only the coefficients do.

local disc_dsl = (`b2_dsl')^2 - 3 * `b1_dsl' * `b3_dsl'

display _newline "=== DSL Turning Points ==="
display "  Discriminant: " %12.6f `disc_dsl' ///
    cond(`disc_dsl' > 0, "  (> 0: turning points exist!)", "  (< 0: no turning points)")

local min_dsl = exp((-`b2_dsl' + sqrt(`disc_dsl')) / (3 * `b3_dsl'))
local max_dsl = exp((-`b2_dsl' - sqrt(`disc_dsl')) / (3 * `b3_dsl'))

display "  Minimum (CO2 starts rising):  $" %10.0fc `min_dsl'
display "  Maximum (CO2 starts falling): $" %10.0fc `max_dsl'

*---------------------------------------------*
* 5c. Which controls did LASSO select?        *
*---------------------------------------------*
* After dsregress, lassoinfo shows how many controls were selected
* in each LASSO step. This is the "variable selection" part.

display _newline "=== LASSO Selection Summary ==="
lassoinfo


*=============================================================================*
*  SECTION 6: COMPARE RESULTS
*=============================================================================*

display _newline "============================================="
display "  COMPARISON: ALL METHODS"
display "============================================="
display _newline "                    Sparse FE     Kitchen FE    BMA (UIP)     DSL (Plugin)"
display "  b1 (GDP):       " %9.4f `b1_sparse' "   " %9.4f `b1_kitchen' "   " %9.4f `b1_bma' "   " %9.4f `b1_dsl'
display "  b2 (GDP^2):     " %9.4f `b2_sparse' "   " %9.4f `b2_kitchen' "   " %9.4f `b2_bma' "   " %9.4f `b2_dsl'
display "  b3 (GDP^3):     " %9.4f `b3_sparse' "   " %9.4f `b3_kitchen' "   " %9.4f `b3_bma' "   " %9.4f `b3_dsl'
display "  ----------------------------------------------------------------"

display _newline "  TURNING POINTS (GDP per capita in international $):"
display "                    Sparse FE     Kitchen FE    BMA (UIP)     DSL (Plugin)"
if `min_sparse' != . {
    display "  Minimum ($):    " %9.0fc `min_sparse' "   " %9.0fc `min_kitchen' "   " %9.0fc `min_bma' "   " %9.0fc `min_dsl'
    display "  Maximum ($):    " %9.0fc `max_sparse' "   " %9.0fc `max_kitchen' "   " %9.0fc `max_bma' "   " %9.0fc `max_dsl'
}
else {
    display "  Sparse FE has no real turning points"
    display "  Kitchen Min ($):  " %9.0fc `min_kitchen' "   BMA: " %9.0fc `min_bma' "   DSL: " %9.0fc `min_dsl'
    display "  Kitchen Max ($):  " %9.0fc `max_kitchen' "   BMA: " %9.0fc `max_bma' "   DSL: " %9.0fc `max_dsl'
}

*---------------------------------------------*
* 6a. Predicted EKC curves -- Figure 6        *
*---------------------------------------------*
* We plot the cubic polynomial from each method over the observed range
* of log GDP, overlaid. This is the "payoff" figure.

* Save the range of log GDP in the data
quietly summarize pwt_gdppc if nmissing == 0
local xmin = r(min)
local xmax = r(max)

* Also grab turning points in log scale for vertical lines
local lnmin_bma = ln(`min_bma')
local lnmax_bma = ln(`max_bma')
local lnmin_dsl = ln(`min_dsl')
local lnmax_dsl = ln(`max_dsl')

preserve

* Create a grid of 500 points spanning the GDP range
clear
set obs 500
gen lngdp = `xmin' + (_n - 1) * (`xmax' - `xmin') / 499

* Compute predicted log(CO2) from each method's cubic
gen fitted_bma = `b1_bma' * lngdp + `b2_bma' * lngdp^2 + `b3_bma' * lngdp^3
gen fitted_dsl = `b1_dsl' * lngdp + `b2_dsl' * lngdp^2 + `b3_dsl' * lngdp^3

* Plot both curves
twoway ///
    (line fitted_bma lngdp, lcolor(navy) lwidth(medthick) lpattern(solid)) ///
    (line fitted_dsl lngdp, lcolor(cranberry) lwidth(medthick) lpattern(dash)), ///
    xline(`lnmin_bma', lcolor(navy%50) lpattern(shortdash) lwidth(thin)) ///
    xline(`lnmax_bma', lcolor(navy%50) lpattern(shortdash) lwidth(thin)) ///
    xline(`lnmin_dsl', lcolor(cranberry%50) lpattern(shortdash) lwidth(thin)) ///
    xline(`lnmax_dsl', lcolor(cranberry%50) lpattern(shortdash) lwidth(thin)) ///
    ytitle("Predicted log CO2 per capita" "(cubic component only)") ///
    xtitle("Log real GDP per capita") ///
    title("Predicted EKC Shape: BMA vs. DSL", size(medium)) ///
    subtitle("Both methods trace an inverted-N curve", size(small)) ///
    legend(order(1 "BMA (UIP g-prior)" 2 "DSL (Plugin LASSO)") ///
        rows(1) position(6) size(small)) ///
    note("Vertical dashed lines mark turning points." ///
         "Navy = BMA turning points; Red = DSL turning points.") ///
    scheme(s2color) ///
    name(fig6_ekc, replace)

graph export "stata_bma_dsl_fig6_ekc_curves.png", replace width(2400)
display _newline "Saved: stata_bma_dsl_fig6_ekc_curves.png"
restore

*---------------------------------------------*
* 6b. Export comparison CSV                   *
*---------------------------------------------*

preserve
clear
set obs 4

gen method = ""
replace method = "Sparse FE" in 1
replace method = "Kitchen-Sink FE" in 2
replace method = "BMA (UIP)" in 3
replace method = "DSL (Plugin)" in 4

gen b_gdppc = .
replace b_gdppc = `b1_sparse' in 1
replace b_gdppc = `b1_kitchen' in 2
replace b_gdppc = `b1_bma' in 3
replace b_gdppc = `b1_dsl' in 4

gen b_gdppc_sq = .
replace b_gdppc_sq = `b2_sparse' in 1
replace b_gdppc_sq = `b2_kitchen' in 2
replace b_gdppc_sq = `b2_bma' in 3
replace b_gdppc_sq = `b2_dsl' in 4

gen b_gdppc_cb = .
replace b_gdppc_cb = `b3_sparse' in 1
replace b_gdppc_cb = `b3_kitchen' in 2
replace b_gdppc_cb = `b3_bma' in 3
replace b_gdppc_cb = `b3_dsl' in 4

gen se_gdppc = .
replace se_gdppc = . in 1
replace se_gdppc = . in 2
replace se_gdppc = `se1_bma' in 3
replace se_gdppc = `se1_dsl' in 4

gen se_gdppc_sq = .
replace se_gdppc_sq = . in 1
replace se_gdppc_sq = . in 2
replace se_gdppc_sq = `se2_bma' in 3
replace se_gdppc_sq = `se2_dsl' in 4

gen se_gdppc_cb = .
replace se_gdppc_cb = . in 1
replace se_gdppc_cb = . in 2
replace se_gdppc_cb = `se3_bma' in 3
replace se_gdppc_cb = `se3_dsl' in 4

gen minimum_tp = .
replace minimum_tp = `min_sparse' in 1
replace minimum_tp = `min_kitchen' in 2
replace minimum_tp = `min_bma' in 3
replace minimum_tp = `min_dsl' in 4

gen maximum_tp = .
replace maximum_tp = `max_sparse' in 1
replace maximum_tp = `max_kitchen' in 2
replace maximum_tp = `max_bma' in 3
replace maximum_tp = `max_dsl' in 4

export delimited "stata_bma_dsl_comparison.csv", replace
display _newline "Saved: stata_bma_dsl_comparison.csv"
restore


*=============================================================================*
*  SECTION 7: WRAP-UP
*=============================================================================*

display _newline "============================================="
display "  TUTORIAL COMPLETE"
display "  Finished: $S_DATE $S_TIME"
display "============================================="
display _newline "Output files:"
display "  analysis.log                       -- this log"
display "  stata_bma_dsl_fig1_scatter.png     -- raw data scatter"
display "  stata_bma_dsl_fig2_instability.png -- coefficient instability"
display "  stata_bma_dsl_fig3_pip.png         -- BMA inclusion probabilities"
display "  stata_bma_dsl_fig4_varmap.png      -- BMA variable inclusion map"
display "  stata_bma_dsl_fig5_coefdensity.png -- BMA coefficient densities"
display "  stata_bma_dsl_fig6_ekc_curves.png  -- predicted EKC curves"
display "  stata_bma_dsl_comparison.csv       -- full comparison table"

*---------------------------------------------*
* Clean up temporary files                    *
*---------------------------------------------*
capture erase "_tutorial_bma_temp.dta"

log close
