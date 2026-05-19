****************************************************************
* Causal Machine Learning and the Resource Curse with Stata 19
*
* A pedagogical tutorial using Stata 19's -cate- command to
* estimate heterogeneous treatment effects of mining and mineral
* prices on economic development and conflict.
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_cate2/
*
* Dataset: sim_resource_curse.csv (simulated)
*   3,000 observations = 300 districts x 10 years
*   Outcomes:  ntl_log  (log nighttime lights, continuous)
*              conflict (conflict event, binary)
*   Treatment: treatment (0=none, 1=low, 2=med, 3=high price)
*   Question:  Does mining increase development? Do price
*              effects jump at high prices? Do institutions
*              moderate these effects?
*
* Three key findings reproduced (Hodler, Lechner & Raschky, 2023):
*   1. Mining increases NTL and conflict (positive ATEs)
*   2. Price effects are non-linear (ATE 2-1 ~ 0.05 vs 3-1 ~ 0.30)
*   3. Institutions moderate mining but NOT prices (GATE slopes)
*
* Methods illustrated (all from Stata 19's -cate- command):
*   - PO   (partialing-out; partial-linear model)
*   - AIPW (augmented IPW; doubly robust)
*   - GATE  (group ATEs by institutional variables)
*   - IATE diagnostics (histogram, iateplot, projection)
*   - Formal tests (estat heterogeneity, estat gatetest)
*
* Prerequisites:
*   - Stata 19 (the -cate- command does not exist in earlier
*     versions). Script aborts if the running Stata is older.
*
* Usage:
*   1. Open Stata 19 (or StataNow / MP / SE)
*   2. cd to the directory containing this do-file
*   3. Run: do analysis.do
*   4. Outputs: analysis.log + ~8 PNG figures
*
* Approximate runtime: 20--30 minutes (cross-fitting + causal
*   forest are CPU-intensive; MP build recommended).
****************************************************************

clear all
set more off
capture log close
log using "analysis.log", replace text


*================================================================
* Section 0: Stata 19 version gate
*================================================================
*
* The -cate- command is brand-new in Stata 19. There is NO
* equivalent in Stata 18 or earlier. We refuse to run on older
* Stata so that the user gets a clear error rather than a stream
* of "command cate is unrecognized" messages.
*----------------------------------------------------------------

if c(stata_version) < 19 {
    di as error ""
    di as error "============================================================"
    di as error "  ERROR: this script requires Stata 19 or later."
    di as error "  Detected Stata version: " c(stata_version)
    di as error "  The -cate- command was introduced in Stata 19."
    di as error "============================================================"
    log close
    exit 198
}

di as text "Stata version detected: " c(stata_version) "  -- OK."


*================================================================
* Section 1: Data import, labeling, and globals
*================================================================
*
* Import the simulated resource curse dataset. 3,000 observations
* across 300 districts in 8 fictional countries over 10 years.
* The treatment has 4 levels: 0 = no mining (~85% of obs),
* 1/2/3 = mining at low/medium/high mineral prices (~5% each).
*
* Two macro groups control the analysis:
*
*   $catevars:  variables that may drive heterogeneity in the
*               treatment effect. These are the inputs to tau(x).
*
*   $controls:  additional variables for nuisance models only
*               (country and year fixed effects for the panel).
*----------------------------------------------------------------

* Import from local CSV (or GitHub raw URL below)
* GitHub: import delimited using "https://github.com/cmg777/starter-academic-v501/raw/master/content/post/stata_cate2/sim_resource_curse.csv", clear
import delimited using "sim_resource_curse.csv", clear

* Label all variables
label variable district_id "District ID (1-300)"
label variable country_id "Country ID (1-8)"
label variable year "Year (2003-2012)"
label variable treatment "Treatment group (0=none, 1=low, 2=med, 3=high)"
label variable mining "Mining district (binary)"
label variable price_index "Mineral price index"
label variable exec_constraints "Constraints on Executive (1-6)"
label variable quality_of_govt "Quality of Government (0.22-0.70)"
label variable gdp_pc "GDP per capita"
label variable elevation "Elevation (meters)"
label variable temperature "Mean temperature (Celsius)"
label variable ruggedness "Terrain ruggedness"
label variable distance_capital "Distance to capital (meters)"
label variable agri_suitability "Agricultural suitability (0-1)"
label variable population "Population"
label variable ethnic_frac "Ethnic fractionalization (0-1)"
label variable ntl_log "Log nighttime lights"
label variable conflict "Conflict event (binary)"

* Create integer version of exec_constraints for group()
gen int exec_con = round(exec_constraints)
label variable exec_con "Executive Constraints (integer 1-6)"

* Save as .dta for faster reloading
save "sim_resource_curse.dta", replace

* Report dataset dimensions
describe, short

* Panel structure
codebook district_id, compact
codebook country_id, compact
tab year, nofreq

* Define variable lists as globals
global catevars exec_constraints quality_of_govt gdp_pc ///
    elevation temperature ruggedness distance_capital ///
    agri_suitability population ethnic_frac

global controls i.country_id i.year


*================================================================
* Section 2: Descriptive statistics
*================================================================
*
* Summary statistics, treatment distribution, and outcomes by
* treatment group. The key features to note:
*   - Treatment is highly imbalanced (~85% control)
*   - Mining districts differ from non-mining districts
*   - Institutional variables vary by country
*----------------------------------------------------------------

* Summary statistics for all key variables
tabstat ntl_log conflict exec_constraints quality_of_govt gdp_pc ///
    elevation temperature ruggedness distance_capital ///
    agri_suitability population ethnic_frac, ///
    statistics(mean sd min max) columns(statistics) format(%9.3f)

* Treatment distribution
tab treatment, missing

* Mining share
count if treatment > 0
local mining_n = r(N)
quietly count
display _newline "Mining share: " %5.1f 100*(`mining_n'/r(N)) "%"

* Outcomes by treatment group
table treatment, statistic(mean ntl_log) statistic(mean conflict) ///
    statistic(count ntl_log) nformat(%9.3f)


*================================================================
* Section 3: Naive comparison vs ground truth
*================================================================
*
* Raw difference-in-means for key contrasts. These are biased
* because mining districts differ systematically from non-mining
* districts. The ground-truth ATEs come from the data-generating
* process (known because the data are simulated).
*----------------------------------------------------------------

display as text _newline "=== Naive Difference-in-Means (biased) ==="
display as text "Comparison" _col(20) "NTL diff" _col(35) "Ground Truth"
display as text "{hline 50}"

* 1-0: mining vs no mining
quietly summarize ntl_log if treatment == 1
local m1 = r(mean)
quietly summarize ntl_log if treatment == 0
local m0 = r(mean)
display as result "1 vs 0" _col(20) %7.4f (`m1' - `m0') _col(35) "0.25"

* 2-0: medium mining vs no mining
quietly summarize ntl_log if treatment == 2
local m2 = r(mean)
display as result "2 vs 0" _col(20) %7.4f (`m2' - `m0') _col(35) "0.30"

* 3-0: high mining vs no mining
quietly summarize ntl_log if treatment == 3
local m3 = r(mean)
display as result "3 vs 0" _col(20) %7.4f (`m3' - `m0') _col(35) "0.55"

* 2-1: medium vs low prices
display as result "2 vs 1" _col(20) %7.4f (`m2' - `m1') _col(35) "0.05"

* 3-1: high vs low prices
display as result "3 vs 1" _col(20) %7.4f (`m3' - `m1') _col(35) "0.30"

* 3-2: high vs medium prices
display as result "3 vs 2" _col(20) %7.4f (`m3' - `m2') _col(35) "0.25"

display as text "{hline 50}"


*================================================================
* Section 4: ATE -- NTL 1 vs 0 (PO + AIPW)
*================================================================
*
* Mining vs No Mining on nighttime lights. This is the most
* important contrast for Finding 1. We show both estimators:
*   PO   = partialing-out (partial linear model)
*   AIPW = augmented inverse-probability weighting (doubly robust)
*
* Ground truth ATE: 0.25
*----------------------------------------------------------------

*--- PO estimator ---
preserve
keep if treatment == 1 | treatment == 0
gen byte treat_1v0 = (treatment == 1)
label define treat_1v0_lbl 0 "No mining" 1 "Mining (low price)"
label values treat_1v0 treat_1v0_lbl

display _newline as text "=== NTL: Mining vs No Mining (1-0) --- PO Estimator ==="
display as text "N = " _N " observations"

cate po (ntl_log $catevars) (treat_1v0), ///
    controls($controls) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

estimates store po_ntl_1v0
restore

*--- AIPW estimator ---
preserve
keep if treatment == 1 | treatment == 0
gen byte treat_1v0 = (treatment == 1)
label define treat_1v0_lbl 0 "No mining" 1 "Mining (low price)"
label values treat_1v0 treat_1v0_lbl

display _newline as text "=== NTL: Mining vs No Mining (1-0) --- AIPW Estimator ==="

cate aipw (ntl_log $catevars) (treat_1v0), ///
    controls($controls) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

estimates store aipw_ntl_1v0
restore


*================================================================
* Section 5: ATE -- NTL 3 vs 1 (PO + AIPW)
*================================================================
*
* High vs Low mineral prices on NTL. Key contrast for Finding 2
* (non-linear price effects). Ground truth ATE: 0.30
*
* Note: this uses only mining districts (~300 obs total),
* so estimates will be noisier than the 1-0 comparison.
*----------------------------------------------------------------

*--- PO estimator ---
preserve
keep if treatment == 3 | treatment == 1
gen byte treat_3v1 = (treatment == 3)
label define treat_3v1_lbl 0 "Low price" 1 "High price"
label values treat_3v1 treat_3v1_lbl

display _newline as text "=== NTL: High vs Low Prices (3-1) --- PO Estimator ==="
display as text "N = " _N " observations (mining districts only)"

cate po (ntl_log $catevars) (treat_3v1), ///
    controls($controls) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

estimates store po_ntl_3v1
restore

*--- AIPW estimator ---
preserve
keep if treatment == 3 | treatment == 1
gen byte treat_3v1 = (treatment == 3)
label define treat_3v1_lbl 0 "Low price" 1 "High price"
label values treat_3v1 treat_3v1_lbl

display _newline as text "=== NTL: High vs Low Prices (3-1) --- AIPW Estimator ==="

cate aipw (ntl_log $catevars) (treat_3v1), ///
    controls($controls) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

estimates store aipw_ntl_3v1
restore


*================================================================
* Section 6: ATE -- NTL remaining comparisons (AIPW only)
*================================================================
*
* Four remaining NTL contrasts using AIPW with default lasso
* methods (faster than rforest on smaller subsamples).
*
* Ground truths: 2-0 = 0.30, 3-0 = 0.55, 2-1 = 0.05, 3-2 = 0.25
*----------------------------------------------------------------

*--- NTL: 2 vs 0 (medium mining vs no mining) ---
preserve
keep if treatment == 2 | treatment == 0
gen byte treat_2v0 = (treatment == 2)

display _newline as text "=== NTL: Medium Mining vs No Mining (2-0) ==="
display as text "N = " _N

cate aipw (ntl_log $catevars) (treat_2v0), ///
    controls($controls) ///
    rseed(12345) xfolds(5)

estimates store aipw_ntl_2v0
restore

*--- NTL: 3 vs 0 (high mining vs no mining) ---
preserve
keep if treatment == 3 | treatment == 0
gen byte treat_3v0 = (treatment == 3)

display _newline as text "=== NTL: High Mining vs No Mining (3-0) ==="
display as text "N = " _N

cate aipw (ntl_log $catevars) (treat_3v0), ///
    controls($controls) ///
    rseed(12345) xfolds(5)

estimates store aipw_ntl_3v0
restore

*--- NTL: 2 vs 1 (medium vs low prices) ---
preserve
keep if treatment == 2 | treatment == 1
gen byte treat_2v1 = (treatment == 2)

display _newline as text "=== NTL: Medium vs Low Prices (2-1) ==="
display as text "N = " _N " (within-mining comparison)"

cate aipw (ntl_log $catevars) (treat_2v1), ///
    controls($controls) ///
    rseed(12345) xfolds(5) ///
    pstolerance(1e-6)

estimates store aipw_ntl_2v1
restore

*--- NTL: 3 vs 2 (high vs medium prices) ---
preserve
keep if treatment == 3 | treatment == 2
gen byte treat_3v2 = (treatment == 3)

display _newline as text "=== NTL: High vs Medium Prices (3-2) ==="
display as text "N = " _N " (within-mining comparison)"

* Note: AIPW fails on this tiny subsample due to propensity score
* overlap violations. PO with relaxed tolerance handles this.
cate po (ntl_log $catevars) (treat_3v2), ///
    controls($controls) ///
    rseed(12345) xfolds(5) ///
    pstolerance(1e-8)

estimates store aipw_ntl_3v2
restore


*================================================================
* Section 7: ATE -- Conflict (PO + AIPW for 1-0, AIPW for rest)
*================================================================
*
* Conflict outcome: does mining increase conflict events?
* PO + AIPW for the key comparison (1-0), AIPW loop for rest.
*
* Note: conflict ground truths are not specified in the DGP,
* so we interpret directionally rather than against exact values.
*----------------------------------------------------------------

*--- Conflict: 1 vs 0 (PO estimator) ---
preserve
keep if treatment == 1 | treatment == 0
gen byte treat_1v0 = (treatment == 1)

display _newline as text "=== Conflict: Mining vs No Mining (1-0) --- PO Estimator ==="

cate po (conflict $catevars) (treat_1v0), ///
    controls($controls) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

estimates store po_conf_1v0
restore

*--- Conflict: 1 vs 0 (AIPW estimator) ---
preserve
keep if treatment == 1 | treatment == 0
gen byte treat_1v0 = (treatment == 1)

display _newline as text "=== Conflict: Mining vs No Mining (1-0) --- AIPW Estimator ==="

cate aipw (conflict $catevars) (treat_1v0), ///
    controls($controls) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

estimates store aipw_conf_1v0
restore

*--- Conflict: remaining comparisons (AIPW, loop) ---
local comparisons "2_0 3_0 2_1 3_1 3_2"

foreach comp of local comparisons {
    local t_hi = substr("`comp'", 1, 1)
    local t_lo = substr("`comp'", 3, 1)

    preserve
    keep if treatment == `t_hi' | treatment == `t_lo'
    gen byte treat_bin = (treatment == `t_hi')

    display _newline as text "=== Conflict: Treatment `t_hi' vs `t_lo' ==="
    display as text "N = " _N

    quietly cate aipw (conflict $catevars) (treat_bin), ///
        controls($controls) ///
        rseed(12345) xfolds(5) ///
        pstolerance(1e-6)

    * Display ATE (extract from coefficient matrix)
    matrix b = e(b)
    matrix V = e(V)
    display as result "  ATE = " %7.4f b[1,1] ///
        "  SE = " %7.4f sqrt(V[1,1])

    estimates store aipw_conf_`t_hi'v`t_lo'
    restore
}


*================================================================
* Section 8: ATE summary table
*================================================================
*
* Compile all NTL AIPW ATEs into a single comparison table
* against the known ground-truth values from the DGP.
*----------------------------------------------------------------

display _newline as text "{hline 70}"
display as text "SUMMARY: Average Treatment Effects (NTL Outcome)"
display as text "{hline 70}"
display as text "Contrast" _col(15) "AIPW ATE" _col(30) "SE" _col(42) "Ground Truth"
display as text "{hline 70}"

local comps   "1v0 2v0 3v0 2v1 3v1 3v2"
local gts     "0.25 0.30 0.55 0.05 0.30 0.25"

local i = 1
foreach comp of local comps {
    local gt : word `i' of `gts'
    quietly estimates restore aipw_ntl_`comp'
    matrix b = e(b)
    matrix V = e(V)
    local ate = b[1,1]
    local se  = sqrt(V[1,1])
    display as result "`comp'" _col(15) %7.4f `ate' _col(30) %7.4f `se' _col(42) "`gt'"
    local ++i
}
display as text "{hline 70}"


*================================================================
* Section 9: GATEs by Executive Constraints (NTL 1-0, 3-1)
*================================================================
*
* Finding 3: Institutions moderate mining effects (upward GATE
* slope for 1-0) but NOT price effects (flat GATEs for 3-1).
*
* We estimate GATEs using the group(exec_con) option, which
* computes average effects within each level of executive
* constraints (integer 1-6).
*----------------------------------------------------------------

*--- GATEs: NTL Mining Effect (1-0) by Executive Constraints ---
preserve
keep if treatment == 1 | treatment == 0
gen byte treat_1v0 = (treatment == 1)

display _newline as text "=== GATEs: NTL Mining Effect (1-0) by Executive Constraints ==="

cate aipw (ntl_log $catevars) (treat_1v0), ///
    controls($controls) ///
    group(exec_con) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

categraph gateplot
graph export "stata_cate2_gate_ntl_1v0_exec.png", replace width(1200)

estat gatetest

estimates store gate_ntl_1v0_exec
restore

*--- GATEs: NTL Price Effect (3-1) by Executive Constraints ---
preserve
keep if treatment == 3 | treatment == 1
gen byte treat_3v1 = (treatment == 3)

display _newline as text "=== GATEs: NTL Price Effect (3-1) by Executive Constraints ==="

cate aipw (ntl_log $catevars) (treat_3v1), ///
    controls($controls) ///
    group(exec_con) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

categraph gateplot
graph export "stata_cate2_gate_ntl_3v1_exec.png", replace width(1200)

estat gatetest

estimates store gate_ntl_3v1_exec
restore


*================================================================
* Section 10: GATEs by Quality of Government (NTL 1-0, 3-1)
*================================================================
*
* Alternative institutional measure. Quality of government is
* continuous (0.22-0.70), so we discretize into quartiles.
* Expect same pattern: upward slope for 1-0, flat for 3-1.
*----------------------------------------------------------------

*--- GATEs: NTL Mining Effect (1-0) by Quality of Government ---
preserve
keep if treatment == 1 | treatment == 0
gen byte treat_1v0 = (treatment == 1)
egen qog_cat = cut(quality_of_govt), group(4) label

display _newline as text "=== GATEs: NTL Mining Effect (1-0) by Quality of Government ==="

cate aipw (ntl_log $catevars) (treat_1v0), ///
    controls($controls) ///
    group(qog_cat) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

categraph gateplot
graph export "stata_cate2_gate_ntl_1v0_qog.png", replace width(1200)

estat gatetest

estimates store gate_ntl_1v0_qog
restore

*--- GATEs: NTL Price Effect (3-1) by Quality of Government ---
preserve
keep if treatment == 3 | treatment == 1
gen byte treat_3v1 = (treatment == 3)
egen qog_cat = cut(quality_of_govt), group(4) label

display _newline as text "=== GATEs: NTL Price Effect (3-1) by Quality of Government ==="

cate aipw (ntl_log $catevars) (treat_3v1), ///
    controls($controls) ///
    group(qog_cat) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

categraph gateplot
graph export "stata_cate2_gate_ntl_3v1_qog.png", replace width(1200)

estat gatetest

estimates store gate_ntl_3v1_qog
restore


*================================================================
* Section 11: GATEs -- Conflict by Executive Constraints (1-0)
*================================================================
*
* Does institutional quality moderate the conflict effect of
* mining? Expect downward slope or U-shape: stronger institutions
* should dampen conflict from mining.
*----------------------------------------------------------------

preserve
keep if treatment == 1 | treatment == 0
gen byte treat_1v0 = (treatment == 1)

display _newline as text "=== GATEs: Conflict Mining Effect (1-0) by Executive Constraints ==="

cate aipw (conflict $catevars) (treat_1v0), ///
    controls($controls) ///
    group(exec_con) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

categraph gateplot
graph export "stata_cate2_gate_conf_1v0_exec.png", replace width(1200)

estat gatetest

estimates store gate_conf_1v0_exec
restore


*================================================================
* Section 12: IATE distribution + heterogeneity test
*================================================================
*
* Re-estimate the NTL mining effect (1-0) with i.exec_con in the
* catevarlist. This enables reestimate group(exec_con) later.
* Then examine the IATE distribution and test for heterogeneity.
*----------------------------------------------------------------

preserve
keep if treatment == 1 | treatment == 0
gen byte treat_1v0 = (treatment == 1)

display _newline as text "=== Stata 19 Bonus Diagnostics: NTL Mining Effect (1-0) ==="

cate aipw (ntl_log exec_constraints quality_of_govt gdp_pc ///
    elevation temperature ruggedness distance_capital ///
    agri_suitability population ethnic_frac ///
    i.exec_con) (treat_1v0), ///
    controls($controls) ///
    rseed(12345) xfolds(5) ///
    omethod(rforest) tmethod(rforest)

* IATE histogram
display _newline as text "--- IATE Histogram ---"
categraph histogram
graph export "stata_cate2_iate_histogram.png", replace width(1200)

* Formal test: are treatment effects heterogeneous?
display _newline as text "--- Test of Treatment-Effect Heterogeneity ---"
estat heterogeneity


*================================================================
* Section 13: GATE equality test with reestimate
*================================================================
*
* Use -reestimate- to quickly recompute GATEs from the existing
* IATE function, without refitting the causal forest.
*----------------------------------------------------------------

display _newline as text "--- GATEs by Executive Constraints (reestimate) ---"
cate, reestimate group(exec_con)

* Test H0: GATEs are equal across executive constraint levels
estat gatetest


*================================================================
* Section 14: Subpopulation ATEs
*================================================================
*
* Compare ATEs for districts with strong vs weak institutions.
* Strong institutions: exec_constraints >= 4
* Weak institutions:   exec_constraints <= 2
*----------------------------------------------------------------

display _newline as text "--- ATE for districts with exec_constraints >= 4 ---"
estat ate if exec_constraints >= 4

display _newline as text "--- ATE for districts with exec_constraints <= 2 ---"
estat ate if exec_constraints <= 2


*================================================================
* Section 15: Linear projection of IATEs
*================================================================
*
* Project the estimated IATEs onto covariates. This tells us
* which variables are the strongest linear predictors of the
* individual treatment effect -- a quick summary of "who
* responds most."
*----------------------------------------------------------------

estat projection exec_constraints quality_of_govt gdp_pc elevation temperature


*================================================================
* Section 16: IATE function plots
*================================================================
*
* Plot the IATE function varying one covariate at a time.
* exec_constraints should show an upward trend (more constraints
* = higher mining benefit). quality_of_govt should show similar.
*----------------------------------------------------------------

categraph iateplot exec_constraints
graph export "stata_cate2_iateplot_exec.png", replace width(1200)

categraph iateplot quality_of_govt
graph export "stata_cate2_iateplot_qog.png", replace width(1200)

restore


*================================================================
* Section 17: Session info and closing
*================================================================

di _newline(2)
di "============================================================"
di "  CATE analysis complete."
di ""
di "  Sections 4-8:  ATEs for all 6 NTL + 6 conflict contrasts."
di "  Sections 9-11: GATEs by institutions (Finding 3)."
di "  Sections 12-16: IATE diagnostics, projections, plots."
di ""
di "  Figures saved: ~8 PNGs (stata_cate2_*.png)."
di "============================================================"

about
display _newline "Working directory: `c(pwd)'"
display "Date: `c(current_date)'"
display "Time: `c(current_time)'"
display "Stata version: `c(stata_version)'"
display "Machine: `c(machine_type)'"
display "OS: `c(os)'"

log close
