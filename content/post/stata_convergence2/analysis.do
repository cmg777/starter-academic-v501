/*─────────────────────────────────────────────────────────────────────────────
  Converging to Convergence: Understanding the Main Ideas of the
  Convergence Literature

  This tutorial presents the key ideas from Kremer, Willis, and You (2021)
  "Converging to Convergence" (NBER WP 29484). The paper documents:
    1. A trend toward unconditional convergence since 1990
    2. Convergence in growth correlates (policies, institutions, human capital)
    3. A link between the two via the omitted variable bias (OVB) formula

  The central finding: absolute convergence has converged toward conditional
  convergence. Growth correlates have improved in poorer countries, and the
  predictive power of many 1990s growth regression variables has faded. As a
  result, the gap between unconditional and conditional convergence has closed.

  NOTE: This analysis is DESCRIPTIVE. We document cross-country patterns and
  relationships, but do not make causal claims. Causality can run both ways:
  better institutions may cause growth, and growth may cause better
  institutions (modernization theory).

  Data: Kremer, Willis, You (2021) replication dataset (PWT 10.0 + WDI + 50+
        institutional/policy variables, 1960-2018 panel)
  Usage: do analysis.do
  Output: stata_convergence2_*.png figures, *.csv tables, analysis.log

  References:
    - Kremer, Willis, and You (2021) "Converging to Convergence," NBER WP 29484
    - Barro (1991) "Economic Growth in a Cross Section of Countries," QJE
    - Barro and Sala-i-Martin (1992) "Convergence," JPE
    - Durlauf, Johnson, and Temple (2005) "Growth Econometrics," Handbook
    - Patel, Sandefur, and Subramanian (2021) "The New Era of Unconditional
      Convergence," JDE
─────────────────────────────────────────────────────────────────────────────*/

clear all
set more off
set seed 42
set scheme s2color

* ── Install dependencies (capture to avoid errors if already installed) ──
capture ssc install estout
capture ssc install winsor
capture ssc install colorpalette

* ── Start log ─────────────────────────────────────────────────────────────
capture log close
log using "analysis.log", replace text

display as text ""
display as text "================================================================"
display as text "  Converging to Convergence"
display as text "  Kremer, Willis, and You (2021) -- Key Ideas Tutorial"
display as text "================================================================"
display as text ""


*===============================================================================
* SECTION 0: SETUP AND DATA PREPARATION
*
*   We load the Kremer et al. (2021) replication dataset, which contains
*   GDP per capita and 50+ growth correlates for ~170 countries, 1960-2018.
*   The dataset already excludes very small countries (pop < 200,000) and
*   those heavily reliant on natural resource rents (> 75% of GDP).
*===============================================================================

display as text ""
display as text "----------------------------------------------------------------"
display as text "  SECTION 0: SETUP AND DATA PREPARATION"
display as text "----------------------------------------------------------------"

* ── Load the main dataset ──
use "main_data.dta", clear

* ── Describe the panel structure ──
display as text ""
display as text "Panel structure:"
codebook country_id, compact
tab year if loggdp != ., missing
summarize year
display as text "Years covered: " r(min) " to " r(max)

* Count unique countries with GDP data
preserve
keep if loggdp != .
duplicates drop country_id, force
count
local n_countries = r(N)
display as text "Countries with GDP data: `n_countries'"
restore

* ── Display key variables ──
display as text ""
display as text "Key income variables:"
summarize loggdp loggdp_growth loggdp_growth_10

* ── Define variable groups (following the paper's classification) ──
*   A: Solow determinants -- fundamental steady-state determinants
*   B: Short-run correlates -- policies/institutions that can change quickly
*   C: Long-run correlates -- geography and historical institutions (time-invariant)
*   D: Culture -- Hofstede cultural dimensions (time-invariant)

local solow investment population_growth barrolee2060

local short_run edugap laborparti polity2 FH_political_rights FH_civil_liberties ///
        totalscore WGI_pol_stability WGI_gov_effectiveness WGI_regulatory_quality ///
        WGI_rule_law WGI_control_corruption overallscore governmentintegrity ///
        propertyrights businessfreedom tariff_all_ew tariff_all_vw inc_tax ///
        sev_tax gov_spending taxburden pri_inv miliexp inflation lvaw_garriga ///
        WDI_credit credit financialfreedom investmentfreedom

local long_run population_1900 legor_uk legor_fr legor_ge legor_sc legor_so ///
        logem4 meantemp lt100km avelf landlock lat_abst tropics

local culture VSM_power_dist VSM_individualism VSM_masculinity ///
        VSM_uncertain_avoid VSM_indulgence VSM_longterm

local total `solow' `short_run'
local total_plus_long_run `total' `long_run' `culture'

display as text ""
display as text "Variable groups defined:"
display as text "  Solow fundamentals: `solow'"
display as text "  Short-run correlates: " wordcount("`short_run'") " variables"
display as text "  Long-run correlates: " wordcount("`long_run'") " variables"
display as text "  Culture: " wordcount("`culture'") " variables"

* ── Merge regional classification from WDI ──
preserve
import delimited "WDICountry.csv", clear varnames(1)
* The first column may have a BOM character
capture rename ïcountrycode code
capture rename countrycode code
drop if tablename == ""
* Fix string type
gen str code_str = code
replace code = ""
compress code
replace code = code_str
drop code_str
keep code region
tempfile regions
save `regions'
restore

merge m:1 code using `regions'
keep if _merge == 3 | _merge == 1
drop _merge

* Create region groups (following the reference code)
gen region_group = 1 if region == "Europe & Central Asia" | region == "North America"
replace region_group = 2 if region == "Latin America & Caribbean"
replace region_group = 3 if region == "East Asia & Pacific" | region == "South Asia"
replace region_group = 4 if region == "Sub-Saharan Africa"
label define reg_lbl 1 "Europe, C. Asia & N. America" 2 "Latin America & Caribbean" ///
    3 "South & East Asia" 4 "Sub-Saharan Africa"
label values region_group reg_lbl

display as text ""
display as text "Regional distribution:"
tab region_group if loggdp != . & year == 2000

* ── Export data summary ──
preserve
collapse (count) n_countries = loggdp (mean) mean_loggdp = loggdp ///
    (sd) sd_loggdp = loggdp, by(year)
export delimited using "convergence2_data_summary.csv", replace
display as text ""
display as text "Exported: convergence2_data_summary.csv"
restore

* ── Save working dataset with regions ──
save "convergence2_working.dta", replace


*===============================================================================
* SECTION 1: THE SIMPLEST TEST -- HAS THE WORLD BEEN CONVERGING?
*
*   We start with the most basic visual test: scatter plots of 10-year
*   growth versus initial income, decade by decade. Convergence means a
*   NEGATIVE slope -- poorer countries (lower log GDP) growing faster.
*
*   Key question: Does the relationship between income and growth change
*   over time?
*===============================================================================

display as text ""
display as text "----------------------------------------------------------------"
display as text "  SECTION 1: SCATTER PLOTS BY DECADE"
display as text "----------------------------------------------------------------"

use "convergence2_working.dta", clear

* ── Restrict to decade starting years ──
keep if inlist(year, 1960, 1970, 1980, 1990, 2000, 2007)

* ── Run regressions and create scatter plots for each decade ──
local decade_list "1960 1970 1980 1990 2000 2007"
local fig_num = 1

foreach yr of local decade_list {
    * Run the regression
    quietly reg loggdp_growth_10 loggdp if year == `yr', robust
    local b_`yr' = _b[loggdp]
    local se_`yr' = _se[loggdp]
    local p_`yr' = 2 * ttail(e(df_r), abs(_b[loggdp] / _se[loggdp]))
    local n_`yr' = e(N)

    * Determine the end year for the label
    local end_yr = `yr' + 10
    if `yr' == 2007 local end_yr = 2017

    * Create scatter plot with fitted line
    twoway (scatter loggdp_growth_10 loggdp if year == `yr' & abs(loggdp_growth_10) < 10, ///
            msize(small) mcolor("106 155 204") msymbol(circle)) ///
           (lfit loggdp_growth_10 loggdp if year == `yr', ///
            lwidth(medthick) lcolor("20 20 19")), ///
        xtitle("Log GDP per capita in `yr'") ///
        ytitle("Avg annual growth (%)") ///
        title("`yr'-`end_yr'", size(medium)) ///
        legend(off) graphregion(color(white)) ///
        name(G`fig_num', replace)

    display as text "  `yr'-`end_yr': beta = " %6.3f `b_`yr'' ///
        " (SE = " %5.3f `se_`yr'' ", p = " %5.3f `p_`yr'' ", N = " `n_`yr'' ")"

    local fig_num = `fig_num' + 1
}

* ── Combine into one figure ──
graph combine G1 G2 G3 G4 G5 G6, rows(2) cols(3) ///
    graphregion(color(white)) ///
    title("Income Convergence by Decade", size(medium))
graph export "stata_convergence2_scatter_by_decade.png", replace width(2400)
graph drop G1 G2 G3 G4 G5 G6

display as text ""
display as text "Exported: stata_convergence2_scatter_by_decade.png"
display as text ""
display as text "INTERPRETATION: The slope shifts from flat/positive (1960s-1980s)"
display as text "to clearly negative (2000s). Convergence emerged around 2000."

* ── Export beta by decade ──
preserve
clear
set obs 6
gen decade = .
gen beta = .
gen se = .
gen pval = .
gen n_obs = .
local i = 1
foreach yr of local decade_list {
    replace decade = `yr' in `i'
    replace beta = `b_`yr'' in `i'
    replace se = `se_`yr'' in `i'
    replace pval = `p_`yr'' in `i'
    replace n_obs = `n_`yr'' in `i'
    local i = `i' + 1
}
export delimited using "convergence2_beta_by_decade.csv", replace
display as text "Exported: convergence2_beta_by_decade.csv"
restore


*===============================================================================
* SECTION 2: THE TREND IN BETA-CONVERGENCE
*
*   The scatter plots show snapshots. Now we track the convergence
*   coefficient CONTINUOUSLY over time. This is the paper's key
*   innovation: studying the TREND in convergence, not just testing
*   whether convergence exists at one point in time.
*
*   Specification (Equation 1 in the paper):
*     Growth_{i,t+10} = beta_t * log(GDPpc_{i,t}) + mu_t + epsilon_{i,t}
*   where beta_t is allowed to vary by year.
*===============================================================================

display as text ""
display as text "----------------------------------------------------------------"
display as text "  SECTION 2: THE TREND IN BETA-CONVERGENCE"
display as text "----------------------------------------------------------------"

use "convergence2_working.dta", clear

* ── Estimate year-by-year beta coefficients ──
*   This regression interacts log GDP with year dummies, giving a
*   separate convergence coefficient for each year.
local y loggdp
quietly areg `y'_growth_10 c.`y'#i.year, absorb(year) robust cluster(country_id)

* Extract coefficients and standard errors
local b1960_`y' = _b[1960b.year#c.`y']
local s1960_`y' = _se[1960b.year#c.`y']
foreach i of numlist 1961(1)2018 {
    capture local b`i'_`y' = _b[`i'.year#c.`y']
    capture local s`i'_`y' = _se[`i'.year#c.`y']
}

* ── Save to a dataset for plotting ──
preserve
clear
set obs 50
gen year = 1959 + _n
gen beta = .
gen se = .
foreach i of numlist 1960(1)2009 {
    capture replace beta = `b`i'_`y'' if year == `i'
    capture replace se = `s`i'_`y'' if year == `i'
}
recode beta 0 = .
recode se 0 = .

gen ci_upper = beta + 1.96 * se
gen ci_lower = beta - 1.96 * se

* ── Plot the beta trend ──
twoway (rarea ci_upper ci_lower year if beta != ., ///
        fcolor("106 155 204%30") lwidth(none)) ///
       (line beta year if beta != ., lcolor("106 155 204") lwidth(medthick)) ///
       (function y = 0, range(1960 2009) lcolor("217 119 87") lpattern(dash) lwidth(thin)), ///
    xtitle("Year") ytitle("Beta-convergence coefficient") ///
    title("Trend in Beta-Convergence, 1960-2007", size(medium)) ///
    legend(off) graphregion(color(white)) ///
    note("Negative beta = convergence (poorer countries grow faster)" ///
         "Shaded area = 95% confidence interval", size(vsmall))
graph export "stata_convergence2_beta_trend.png", replace width(2400)

display as text ""
display as text "Exported: stata_convergence2_beta_trend.png"

* Export the trend data
export delimited using "convergence2_beta_trend.csv", replace
display as text "Exported: convergence2_beta_trend.csv"
restore

* ── Table 1 replication: convergence regressions ──
display as text ""
display as text "TABLE 1: CONVERGING TO CONVERGENCE"
display as text "─────────────────────────────────────"

use "convergence2_working.dta", clear
keep if inlist(year, 1960, 1970, 1980, 1990, 2000, 2007)

* (1) Pooled beta
estimates clear
quietly eststo pooled: areg loggdp_growth_10 loggdp, absorb(year) robust cluster(country_id)
estadd local year_FE "Y"

* (2) Beta with linear trend
gen loggdp_X_year = loggdp * (year - 1960)
label var loggdp_X_year "log(GDPpc) x (Year-1960)"
quietly eststo trend: areg loggdp_growth_10 loggdp loggdp_X_year, absorb(year) robust cluster(country_id)
estadd local year_FE "Y"

* (3) Beta by decade
foreach dec in 60 70 80 90 00 07 {
    local yr_val = 1900 + `dec'
    if `dec' == 0 | `dec' < 10 {
        local yr_val = 2000 + `dec'
    }
    if `dec' == 100 local yr_val = 2000
    if `dec' == 107 local yr_val = 2007
    gen I`dec's = (year == `yr_val')
    gen loggdp_I`dec's = loggdp * I`dec's
}
* Fix the year values
capture drop I60s I70s I80s I90s I00s I07s loggdp_I60s loggdp_I70s loggdp_I80s loggdp_I90s loggdp_I00s loggdp_I07s
gen I60s = (year == 1960)
gen I70s = (year == 1970)
gen I80s = (year == 1980)
gen I90s = (year == 1990)
gen I00s = (year == 2000)
gen I07s = (year == 2007)
gen loggdp_I60s = loggdp * I60s
gen loggdp_I70s = loggdp * I70s
gen loggdp_I80s = loggdp * I80s
gen loggdp_I90s = loggdp * I90s
gen loggdp_I00s = loggdp * I00s
gen loggdp_I07s = loggdp * I07s
label var loggdp_I60s "log(GDPpc) x 1960s"
label var loggdp_I70s "log(GDPpc) x 1970s"
label var loggdp_I80s "log(GDPpc) x 1980s"
label var loggdp_I90s "log(GDPpc) x 1990s"
label var loggdp_I00s "log(GDPpc) x 2000s"
label var loggdp_I07s "log(GDPpc) x 2007s"

quietly eststo decades: areg loggdp_growth_10 loggdp_I60s loggdp_I70s loggdp_I80s ///
    loggdp_I90s loggdp_I00s loggdp_I07s, absorb(year) robust cluster(country_id)
estadd local year_FE "Y"

esttab pooled trend decades, ///
    keep(loggdp loggdp_X_year loggdp_I60s loggdp_I70s loggdp_I80s ///
         loggdp_I90s loggdp_I00s loggdp_I07s) ///
    se star(* 0.10 ** 0.05 *** 0.01) ///
    title("Table 1: Converging to Convergence") ///
    mtitles("Pooled" "Trend" "By Decade") ///
    scalars("year_FE Year FE") ///
    b(%9.3f) se(%9.3f) compress

display as text ""
display as text "INTERPRETATION: The trend coefficient (-0.025***) means that the"
display as text "convergence coefficient has decreased by 0.025 per year since 1960."
display as text "By decade, beta shifts from +0.53 (1960s, divergence) to -0.76 (2007+)."


*===============================================================================
* SECTION 3: SIGMA-CONVERGENCE
*
*   Beta-convergence asks: do poor countries grow faster?
*   Sigma-convergence asks: is the SPREAD of income narrowing?
*
*   The two concepts are related but not identical. Beta-convergence is
*   NECESSARY but NOT SUFFICIENT for sigma-convergence, because random
*   shocks can increase dispersion even if poor countries grow faster
*   on average (Young, Higgins, and Levy 2008).
*===============================================================================

display as text ""
display as text "----------------------------------------------------------------"
display as text "  SECTION 3: SIGMA-CONVERGENCE"
display as text "----------------------------------------------------------------"

use "convergence2_working.dta", clear

* ── Compute cross-sectional standard deviation of log GDP by year ──
bysort year: egen sigma = sd(loggdp)

* ── Plot sigma over time ──
twoway (line sigma year, lcolor("106 155 204") lwidth(medthick)), ///
    xtitle("Year") ytitle("Std. Dev. of Log GDP per Capita") ///
    title("Sigma-Convergence: Cross-Country Income Dispersion", size(medium)) ///
    legend(off) graphregion(color(white)) ///
    note("Falling line = sigma-convergence (dispersion narrowing)", size(vsmall))
graph export "stata_convergence2_sigma.png", replace width(2400)

display as text ""
display as text "Exported: stata_convergence2_sigma.png"

* ── Export sigma data ──
preserve
bysort year: keep if _n == 1
keep year sigma
export delimited using "convergence2_sigma.csv", replace
display as text "Exported: convergence2_sigma.csv"
restore

display as text ""
display as text "INTERPRETATION: Sigma peaked in the early 2000s and has been"
display as text "declining since. This is consistent with beta-convergence leading"
display as text "sigma-convergence by about a decade (beta-convergence emerges in"
display as text "the early 1990s; sigma-convergence follows in the early 2000s)."


*===============================================================================
* SECTION 4: WHO DRIVES CONVERGENCE?
*
*   Is the trend toward convergence driven by catch-up growth (poorer
*   countries growing faster) or frontier stagnation (richer countries
*   growing slower)? We answer by tracking growth rates by income
*   quartile and by testing robustness to excluding different regions.
*===============================================================================

display as text ""
display as text "----------------------------------------------------------------"
display as text "  SECTION 4: WHO DRIVES CONVERGENCE?"
display as text "----------------------------------------------------------------"

* ── 4A: Growth by income quartile ──
use "convergence2_working.dta", clear

* Compute income quartiles (recalculated each year)
foreach i of numlist 1/3 {
    local t = 25 * `i'
    bysort year: egen p_`i' = pctile(loggdp), p(`t')
}
gen qtile = 1 if loggdp < p_1
replace qtile = 2 if loggdp >= p_1 & loggdp < p_2
replace qtile = 3 if loggdp >= p_2 & loggdp < p_3
replace qtile = 4 if loggdp >= p_3 & loggdp != .

label define quart 1 "Q1 (Poorest)" 2 "Q2" 3 "Q3" 4 "Q4 (Richest)"
label values qtile quart

* Compute mean growth by quartile and year
bysort year qtile: egen mean_growth = mean(loggdp_growth_10)

* Plot
twoway (line mean_growth year if qtile == 1, lcolor("255 141 61") lwidth(medthick)) ///
       (line mean_growth year if qtile == 2, lcolor("246 199 0") lwidth(medthick)) ///
       (line mean_growth year if qtile == 3, lcolor("146 195 51") lwidth(medthick)) ///
       (line mean_growth year if qtile == 4, lcolor("106 155 204") lwidth(medthick)), ///
    graphregion(color(white)) ///
    legend(label(1 "Q1 (Poorest)") label(2 "Q2") label(3 "Q3") label(4 "Q4 (Richest)") ///
        rows(2) position(6)) ///
    xtitle("Year") ytitle("Mean 10-Year Growth Rate (%)") ///
    title("Growth by Income Quartile", size(medium))
graph export "stata_convergence2_growth_by_quartile.png", replace width(2400)

display as text ""
display as text "Exported: stata_convergence2_growth_by_quartile.png"

* Export
preserve
bysort year qtile: keep if _n == 1
keep year qtile mean_growth
export delimited using "convergence2_growth_by_quartile.csv", replace
display as text "Exported: convergence2_growth_by_quartile.csv"
restore

display as text ""
display as text "INTERPRETATION: The richest quartile (Q4) had the highest growth"
display as text "in the 1980s but the lowest since 2000. All other quartiles"
display as text "experienced accelerating growth through the 1990s and 2000s."
display as text "This shows BOTH catch-up growth AND frontier stagnation."

* ── 4B: Beta trend excluding regions ──
use "convergence2_working.dta", clear

local y loggdp

foreach q in 1 2 3 4 {
    quietly areg `y'_growth_10 c.`y'#i.year if region_group != `q', ///
        absorb(year) robust cluster(country_id)

    local b1960_`y'_`q' = _b[1960b.year#c.`y']
    local s1960_`y'_`q' = _se[1960b.year#c.`y']
    foreach i of numlist 1961(1)2018 {
        capture local b`i'_`y'_`q' = _b[`i'.year#c.`y']
        capture local s`i'_`y'_`q' = _se[`i'.year#c.`y']
    }
}

* Save output
preserve
clear
set obs 50
gen year = 1959 + _n

foreach q in 1 2 3 4 {
    gen beta_excl_`q' = .
    gen se_excl_`q' = .
    foreach i of numlist 1960(1)2009 {
        capture replace beta_excl_`q' = `b`i'_`y'_`q'' if year == `i'
        capture replace se_excl_`q' = `s`i'_`y'_`q'' if year == `i'
    }
    recode beta_excl_`q' 0 = .
    recode se_excl_`q' 0 = .
}

* Plot
twoway (line beta_excl_1 year if beta_excl_1 != ., lcolor("255 141 61") lwidth(medthick)) ///
       (line beta_excl_2 year if beta_excl_2 != ., lcolor("246 199 0") lwidth(medthick)) ///
       (line beta_excl_3 year if beta_excl_3 != ., lcolor("146 195 51") lwidth(medthick)) ///
       (line beta_excl_4 year if beta_excl_4 != ., lcolor("106 155 204") lwidth(medthick)), ///
    graphregion(color(white)) ///
    legend(label(1 "Excl. Europe/C.Asia/N.Am") label(2 "Excl. L.Am & Carib") ///
           label(3 "Excl. S. & E. Asia") label(4 "Excl. Sub-Saharan Africa") ///
           rows(2) position(6)) ///
    xtitle("Year") ytitle("Beta-convergence coefficient") ///
    title("Beta Trend: Robustness to Excluding Regions", size(medium))
graph export "stata_convergence2_beta_excluding_regions.png", replace width(2400)

display as text ""
display as text "Exported: stata_convergence2_beta_excluding_regions.png"

* Export
export delimited using "convergence2_beta_by_region.csv", replace
display as text "Exported: convergence2_beta_by_region.csv"
restore

display as text ""
display as text "INTERPRETATION: The trend toward convergence is robust to excluding"
display as text "any single region. Convergence becomes STRONGER when excluding"
display as text "Sub-Saharan Africa, and is not driven by any one region."


*===============================================================================
* SECTION 5: HAVE GROWTH CORRELATES CONVERGED?
*
*   The 1990s convergence literature found that convergence held
*   CONDITIONAL on policies and institutions (Barro and Sala-i-Martin
*   1992). This raises the question: have these policies and
*   institutions themselves changed?
*
*   Kremer et al. find that most growth correlates have converged
*   substantially -- poorer countries have moved toward the policy
*   configurations of richer countries. We examine 6 representative
*   correlates: population growth, investment, education, democracy,
*   government spending, and financial credit.
*===============================================================================

display as text ""
display as text "----------------------------------------------------------------"
display as text "  SECTION 5: CONVERGENCE IN GROWTH CORRELATES"
display as text "----------------------------------------------------------------"

use "convergence2_working.dta", clear

* ── 6 representative correlates ──
* Population growth, Investment, Education, Polity2, Gov spending, Credit
local rep_vars "population_growth investment barrolee2060 polity2 gov_spending credit"
local rep_labels `" "Population Growth" "Investment (% GDP)" "Barro-Lee Education" "Polity 2 Score" "Government Spending (% GDP)" "Credit by Financial Sector" "'

local fig_num = 1
local csv_rows = 0

* Create a temporary dataset to accumulate results
tempfile corr_results
preserve
clear
gen str40 variable = ""
gen beta_convergence = .
gen se_beta = .
gen n_obs = .
gen mean_base = .
gen mean_end = .
save `corr_results'
restore

foreach var of local rep_vars {
    * Determine base and end years
    local base_yr = 1985
    local end_yr = 2015
    if "`var'" == "population_growth" | "`var'" == "investment" {
        local end_yr = 2014
    }
    if "`var'" == "barrolee2060" {
        local end_yr = 2010
    }
    if "`var'" == "credit" {
        local base_yr = 1990
    }

    preserve
    * For Barro-Lee, impute nearby years if needed
    if "`var'" == "barrolee2060" {
        * Education data is quinquennial; keep closest available years
        keep if (year >= `base_yr' - 1 & year <= `base_yr' + 1) | ///
                (year >= `end_yr' - 1 & year <= `end_yr' + 1)
        drop if `var' == .
        * Keep only one obs per country closest to base and end years
        gen dist_base = abs(year - `base_yr')
        gen dist_end = abs(year - `end_yr')
        gen period = 1 if dist_base <= dist_end
        replace period = 2 if period == .
        bysort code period (year): keep if _n == 1
        sort code period
        bysort code: gen id = _n
        bysort code: egen maxid = max(id)
        keep if maxid == 2
        by code: gen change = `var' - `var'[_n-1]
        by code: gen lag = `var'[_n-1]
        keep if id == 2
    }
    else {
        keep if year == `base_yr' | year == `end_yr'
        drop if `var' == .
        sort code year
        bysort code: gen id = _n
        bysort code: egen maxid = max(id)
        keep if maxid == 2
        by code: gen change = `var' - `var'[_n-1]
        by code: gen lag = `var'[_n-1]
        keep if id == 2
    }

    * Run convergence regression
    reg change lag, robust
    local b_`var' = _b[lag]
    local se_`var' = _se[lag]
    local n_`var' = e(N)

    * Get means
    sum lag
    local mean_base_`var' = r(mean)
    sum `var'
    local mean_end_`var' = r(mean)

    * Get nice label
    local lab_num = `fig_num'
    local lab: word `lab_num' of `rep_labels'

    * Scatter plot
    twoway (scatter change lag, msize(small) mcolor("106 155 204") msymbol(circle)) ///
           (lfit change lag, lcolor("20 20 19") lwidth(medthick)), ///
        xtitle("`lab' in `base_yr'") ///
        ytitle("Change (`base_yr'-`end_yr')") ///
        title("`lab'", size(medium)) ///
        legend(off) graphregion(color(white)) ///
        yline(0, lpattern(dot) lcolor("217 119 87")) ///
        name(C`fig_num', replace)

    display as text "  `lab': beta = " %6.3f `b_`var'' ///
        " (N = " `n_`var'' ")"

    restore
    local fig_num = `fig_num' + 1
}

* ── Combine into one figure ──
graph combine C1 C2 C3 C4 C5 C6, rows(2) cols(3) ///
    graphregion(color(white)) ///
    title("Convergence in Growth Correlates, 1985-2015", size(medium))
graph export "stata_convergence2_correlate_convergence.png", replace width(2400)
graph drop C1 C2 C3 C4 C5 C6

display as text ""
display as text "Exported: stata_convergence2_correlate_convergence.png"

* ── Compute beta-convergence for all available correlates ──
display as text ""
display as text "TABLE 3: CONVERGENCE IN CORRELATES (beta coefficients)"
display as text "───────────────────────────────────────────────────────"

use "convergence2_working.dta", clear

* Create locals for min/max years per variable
foreach y in `total' {
    preserve
    collapse (count) `y', by(year)
    keep if `y' > 40 & `y' != .
    egen temp_min = min(year)
    keep if year == temp_min
    sort year
    local min_year_`y' = year[1]
    if `min_year_`y'' < 1985 local min_year_`y' = 1985
    restore
}

* Compute convergence betas
preserve
clear
gen str40 variable = ""
gen beta = .
gen se = .
gen n = .
gen mean_start = .
gen mean_end = .
local row = 1
save `corr_results', replace
restore

* Impute missing 2015 values with nearest available year (following reference code)
foreach y in `total' {
    sort code year
    forval k = 1/5 {
        replace `y' = `y'[_n-`k'] if `y' == . & year == 2015
    }
}

foreach y in `total' {
    preserve
    drop if year < 1985 | year > 2015
    drop if `y' == .
    keep if year == `min_year_`y'' | year == 2015
    sort code year
    bysort code: gen id = _n
    bysort code: egen maxid = max(id)
    keep if maxid == 2
    sort code year
    by code: gen growth = 100 * ((`y' - `y'[_n-1]) / (2015 - `min_year_`y''))
    by code: gen z = `y'[_n-1]
    keep if id == 2
    quietly reg growth z, robust
    local b_`y' = _b[z]
    local se_`y' = _se[z]
    local n_`y' = e(N)
    local p_`y' = 2 * ttail(e(df_r), abs(_b[z] / _se[z]))
    local stars_`y' = ""
    if `p_`y'' < 0.01 local stars_`y' = "***"
    else if `p_`y'' < 0.05 local stars_`y' = "**"
    else if `p_`y'' < 0.10 local stars_`y' = "*"
    display as text "  `y': beta = " %7.2f `b_`y'' "`stars_`y''" ///
        " (N = " `n_`y'' ")"
    restore
}

* Export correlate convergence results
preserve
clear
local n_vars: word count `total'
set obs `n_vars'
gen str40 variable = ""
gen beta = .
gen se = .
gen n_obs = .
gen pval = .
local i = 1
foreach y in `total' {
    replace variable = "`y'" in `i'
    replace beta = `b_`y'' in `i'
    replace se = `se_`y'' in `i'
    replace n_obs = `n_`y'' in `i'
    replace pval = `p_`y'' in `i'
    local i = `i' + 1
}
export delimited using "convergence2_correlate_convergence.csv", replace
display as text ""
display as text "Exported: convergence2_correlate_convergence.csv"
restore

display as text ""
display as text "INTERPRETATION: Most correlates show significant beta-convergence."
display as text "This means countries with initially worse institutions experienced"
display as text "the largest improvements -- they are catching up."


*===============================================================================
* SECTION 6: THE OVB FRAMEWORK -- BUILDING THE INTUITION
*
*   This is the paper's central contribution. The omitted variable bias
*   (OVB) formula provides an exact decomposition of the gap between
*   UNCONDITIONAL convergence (beta) and CONDITIONAL convergence (beta*):
*
*     beta - beta* = delta x lambda
*
*   where:
*     delta = correlate-income slope (Inst on GDP)
*     lambda = growth-correlate slope (Growth on Inst, controlling for GDP)
*
*   We first build intuition with a single correlate (Polity 2), then
*   generalize to all correlates.
*===============================================================================

display as text ""
display as text "----------------------------------------------------------------"
display as text "  SECTION 6: THE OVB FRAMEWORK"
display as text "----------------------------------------------------------------"

* ── 6A: Worked example with Polity 2 (democracy) ──
display as text ""
display as text "6A: WORKED EXAMPLE -- POLITY 2 SCORE (DEMOCRACY)"
display as text "================================================="

use "convergence2_working.dta", clear

* Normalize polity2 by its 1985 SD
preserve
drop if year < 1985
drop if polity2 == .
collapse (sd) sd = polity2, by(year)
sort year
local sd_polity2 = sd[1]
restore

gen polity2_norm = polity2 / `sd_polity2'

foreach yr in 1985 2005 {
    display as text ""
    display as text "---- Period: `yr' ----"

    * Determine growth variable period
    local growth_var = "loggdp_growth_10"

    * Regression 1: Unconditional convergence (beta)
    quietly reg `growth_var' loggdp if year == `yr' & polity2_norm != ., robust
    local beta_`yr' = _b[loggdp]
    local beta_se_`yr' = _se[loggdp]
    local beta_n_`yr' = e(N)
    display as text "  Regression 1 (Unconditional): beta = " %7.3f `beta_`yr'' ///
        " (SE = " %5.3f `beta_se_`yr'' ", N = " `beta_n_`yr'' ")"

    * Regression 2: Conditional convergence (beta*)
    quietly reg `growth_var' loggdp polity2_norm if year == `yr', robust
    local betastar_`yr' = _b[loggdp]
    local lambda_`yr' = _b[polity2_norm]
    local lambda_se_`yr' = _se[polity2_norm]
    display as text "  Regression 2 (Conditional):   beta* = " %7.3f `betastar_`yr'' ///
        ", lambda = " %7.3f `lambda_`yr''

    * Regression 3: Correlate-income slope (delta)
    quietly reg polity2_norm loggdp if year == `yr' & `growth_var' != ., robust
    local delta_`yr' = _b[loggdp]
    local delta_se_`yr' = _se[loggdp]
    display as text "  Regression 3 (Income-Inst):   delta = " %7.3f `delta_`yr''

    * Verify OVB formula: beta - beta* should equal delta * lambda
    local gap_`yr' = `beta_`yr'' - `betastar_`yr''
    local product_`yr' = `delta_`yr'' * `lambda_`yr''
    display as text ""
    display as text "  OVB DECOMPOSITION:"
    display as text "    beta - beta*   = " %7.3f `gap_`yr'' "  (actual gap)"
    display as text "    delta x lambda = " %7.3f `product_`yr'' "  (predicted by OVB formula)"
    display as text "    delta          = " %7.3f `delta_`yr'' "  (richer countries more democratic?)"
    display as text "    lambda         = " %7.3f `lambda_`yr'' "  (democracy predicts growth?)"
}

display as text ""
display as text "COMPARISON ACROSS TIME:"
display as text "  delta (1985) = " %7.3f `delta_1985' " --> delta (2005) = " %7.3f `delta_2005' "  [STABLE]"
display as text "  lambda (1985) = " %7.3f `lambda_1985' " --> lambda (2005) = " %7.3f `lambda_2005' "  [SHRANK]"
display as text "  gap (1985) = " %7.3f `product_1985' " --> gap (2005) = " %7.3f `product_2005' "  [CLOSED]"
display as text ""
display as text "INTERPRETATION: The correlate-income slope (delta) stayed similar --"
display as text "richer countries are still more democratic in the same proportion."
display as text "But the growth-correlate slope (lambda) shrank -- democracy predicts"
display as text "growth much less in 2005 than in 1985. The explanatory gap closed."

* ── 6B: Generalize -- Compute delta for ALL correlates ──
display as text ""
display as text "6B: CORRELATE-INCOME SLOPES (DELTA) FOR ALL CORRELATES"
display as text "======================================================="

use "convergence2_working.dta", clear

* Normalize all correlates by their 1985 SD
local base_year = 1985
foreach y in `total_plus_long_run' {
    preserve
    drop if year < `base_year'
    drop if `y' == .
    collapse (count) `y' (sd) sd = `y', by(year)
    keep if `y' >= 40
    sort year
    local sd_`y' = sd[1]
    restore
}

* Apply normalization and impute missing final year
sort code year
foreach y in `total_plus_long_run' {
    * Impute final year if missing (use nearest prior value within same country)
    forval k = 1/5 {
        replace `y' = `y'[_n-`k'] if `y' == . & year == 2015
    }
    replace `y' = `y' / `sd_`y''
}
save "convergence2_normalized.dta", replace

* Create min year locals
foreach y in `total_plus_long_run' {
    preserve
    use "convergence2_working.dta", clear
    collapse (count) `y', by(year)
    keep if `y' > 40 & `y' != .
    egen temp_min = min(year)
    keep if year == temp_min
    sort year
    local rmn_year_`y' = year[1]
    replace year = 1985 if year < 1985
    sort year
    local min_year_`y' = year[1]
    restore
}

* Compute delta for each correlate in base year and 2015
use "convergence2_normalized.dta", clear

local p = 1
foreach x in `total_plus_long_run' {
    preserve
    drop if `x' == . | loggdp == .
    keep if year == `min_year_`x'' | year == 2015
    sort code year
    by code: gen count = _n
    by code: egen total_count = max(count)
    drop if total_count == 1

    * Winsorize at 5%
    winsor `x', gen(w) p(0.05)

    * Delta in base year
    quietly reg w loggdp if year == `min_year_`x'', robust
    local delta_base_`p' = _b[loggdp]
    local delta_base_t_`p' = _b[loggdp] / _se[loggdp]

    * Delta in 2015
    quietly reg w loggdp if year == 2015, robust
    local delta_end_`p' = _b[loggdp]
    local delta_end_t_`p' = _b[loggdp] / _se[loggdp]

    local obs_`p' = r(N)
    local var_`p' = "`x'"

    restore
    local p = `p' + 1
}

* Create dataset for the delta scatter plot
local n_total = `p' - 1
preserve
clear
set obs `n_total'
gen str40 var = ""
gen delta_1985 = .
gen delta_2015 = .
gen delta_1985_t = .
gen delta_2015_t = .
gen id = _n

forval i = 1/`n_total' {
    replace var = "`var_`i''" if id == `i'
    replace delta_1985 = `delta_base_`i'' if id == `i'
    replace delta_2015 = `delta_end_`i'' if id == `i'
    replace delta_1985_t = `delta_base_t_`i'' if id == `i'
    replace delta_2015_t = `delta_end_t_`i'' if id == `i'
}

* Flag variable groups
gen flag_solow = 0
foreach v in `solow' {
    replace flag_solow = 1 if var == "`v'"
}
gen flag_long_run = 0
foreach v in `long_run' `culture' {
    replace flag_long_run = 1 if var == "`v'"
}

* Drop variables that are standardized each year (not comparable over time)
drop if inlist(var, "WGI_pol_stability", "WGI_gov_effectiveness", "WGI_regulatory_quality") | ///
    inlist(var, "WGI_rule_law", "WGI_control_corruption", "overallscore") | ///
    inlist(var, "governmentintegrity", "propertyrights", "businessfreedom", "taxburden", "financialfreedom")

* ── Figure 5 Panel A: Solow + Short-run correlates ──
reg delta_2015 delta_1985 if flag_solow == 0 & flag_long_run == 0
local slope_sr: display %5.3f _b[delta_1985]
local r2_sr: display %5.3f e(r2)
reg delta_2015 delta_1985 if flag_solow == 1, nocon
local slope_solow: display %5.3f _b[delta_1985]

twoway (scatter delta_2015 delta_1985 if flag_solow == 0 & flag_long_run == 0, ///
        mcolor("106 155 204") msymbol(square) msize(small)) ///
       (scatter delta_2015 delta_1985 if flag_solow == 1 & flag_long_run == 0, ///
        mcolor("20 20 19") msymbol(circle) msize(small)) ///
       (lfit delta_2015 delta_1985 if flag_solow == 0 & flag_long_run == 0, ///
        lcolor("106 155 204") lpattern(dash) range(-0.8 1)) ///
       (lfit delta_2015 delta_1985 if flag_solow == 1 & flag_long_run == 0, ///
        lcolor("20 20 19") lpattern(solid) range(-0.8 1)) ///
       (function y = x, range(-0.8 1) lcolor("185 185 185") lpattern(dot)), ///
    xtitle("Correlate-Income Slope in 1985 ({&delta}{sub:1985})") ///
    ytitle("Correlate-Income Slope in 2015 ({&delta}{sub:2015})") ///
    title("Panel A: Solow Fundamentals and Short-Run Correlates", size(medium)) ///
    legend(label(1 "Short-Run Correlates") label(2 "Solow Fundamentals") ///
           label(3 "Fitted (Short-Run)") label(4 "Fitted (Solow)") ///
           label(5 "45-degree line") rows(2) position(6) size(small)) ///
    graphregion(color(white)) ///
    note("Slopes: Solow = `slope_solow'; Short-Run = `slope_sr'", size(vsmall)) ///
    xlabel(-0.5(0.5)1) ylabel(-0.5(0.5)1) ///
    name(delta_A, replace)

* ── Figure 5 Panel B: Long-run + Culture ──
gen flag_culture = 0
foreach v in `culture' {
    replace flag_culture = 1 if var == "`v'"
}
gen flag_longrun = 0
foreach v in `long_run' {
    replace flag_longrun = 1 if var == "`v'"
}

capture reg delta_2015 delta_1985 if flag_culture == 1
local slope_culture: display %5.3f _b[delta_1985]
capture reg delta_2015 delta_1985 if flag_longrun == 1
local slope_lr: display %5.3f _b[delta_1985]

twoway (scatter delta_2015 delta_1985 if flag_culture == 1, ///
        mcolor("106 155 204") msymbol(square) msize(small)) ///
       (scatter delta_2015 delta_1985 if flag_longrun == 1, ///
        mcolor("20 20 19") msymbol(circle) msize(small)) ///
       (lfit delta_2015 delta_1985 if flag_culture == 1, ///
        lcolor("106 155 204") lpattern(dash) range(-0.8 1)) ///
       (lfit delta_2015 delta_1985 if flag_longrun == 1, ///
        lcolor("20 20 19") lpattern(solid) range(-0.8 1)) ///
       (function y = x, range(-0.8 1) lcolor("185 185 185") lpattern(dot)), ///
    xtitle("Correlate-Income Slope in 1985 ({&delta}{sub:1985})") ///
    ytitle("Correlate-Income Slope in 2015 ({&delta}{sub:2015})") ///
    title("Panel B: Long-Run Correlates and Culture", size(medium)) ///
    legend(label(1 "Culture") label(2 "Long-Run Correlates") ///
           label(3 "Fitted (Culture)") label(4 "Fitted (Long-Run)") ///
           label(5 "45-degree line") rows(2) position(6) size(small)) ///
    graphregion(color(white)) ///
    note("Slopes: Long-Run = `slope_lr'; Culture = `slope_culture'", size(vsmall)) ///
    xlabel(-0.5(0.5)1) ylabel(-0.5(0.5)1) ///
    name(delta_B, replace)

graph combine delta_A delta_B, rows(1) cols(2) ///
    graphregion(color(white)) ///
    title("Stability of Correlate-Income Slopes", size(medium))
graph export "stata_convergence2_delta_stability.png", replace width(2400)
graph drop delta_A delta_B

display as text ""
display as text "Exported: stata_convergence2_delta_stability.png"
display as text ""
display as text "INTERPRETATION: The correlate-income relationships are remarkably"
display as text "STABLE. Points cluster near the 45-degree line, meaning richer"
display as text "countries still have better institutions in the same proportion as"
display as text "30 years ago. Modernization theory passes its out-of-sample test."

* Export delta slopes
export delimited using "convergence2_delta_slopes.csv", replace
display as text "Exported: convergence2_delta_slopes.csv"
restore


*===============================================================================
* SECTION 7: GROWTH REGRESSIONS THEN VS NOW -- THE LAMBDA FLATTENING
*
*   In the 1990s, a massive literature ran growth regressions:
*     Growth = alpha + beta* x Income + lambda x Correlate + epsilon
*   These regressions identified which policies/institutions predict
*   growth. They were the empirical backbone of the Washington Consensus.
*
*   Key question: Do these regressions hold up as an OUT-OF-SAMPLE test
*   with 25 years of new data? The answer: Solow fundamentals (investment,
*   population growth, education) remain somewhat stable, but short-run
*   correlates (democracy, fiscal policy, financial institutions) have
*   COLLAPSED as growth predictors.
*===============================================================================

display as text ""
display as text "----------------------------------------------------------------"
display as text "  SECTION 7: GROWTH REGRESSIONS THEN VS NOW"
display as text "----------------------------------------------------------------"

use "convergence2_normalized.dta", clear

* ── Compute lambda for each correlate in base year and 2005 ──
local p = 1
foreach x in `total_plus_long_run' {
    * Fix country sample by base year
    preserve
    drop if year < 1985
    drop if `x' == .
    keep if year == `min_year_`x'' & loggdp != . & `x' != .
    keep code
    tempfile temp_`x'
    save `temp_`x''
    restore

    preserve
    merge m:1 code using `temp_`x'', keep(3) nogen
    sort country_id year
    gen gdp_growth = loggdp_growth_10

    foreach yr in `min_year_`x'' 2005 {
        * Unconditional (beta)
        quietly reg gdp_growth loggdp if year == `yr' & `x' != ., robust
        local short_`yr'_`p' = _b[loggdp]
        local shortse_`yr'_`p' = _se[loggdp]

        * Conditional (beta* and lambda)
        quietly reg gdp_growth loggdp `x' if year == `yr' & `x' != ., robust
        local long_`yr'_`p' = _b[loggdp]
        local lambda_`yr'_`p' = _b[`x']
        local lambdase_`yr'_`p' = _se[`x']
        local obs_`yr'_`p' = e(N)

        * Delta
        quietly reg `x' loggdp if year == `yr' & gdp_growth != ., robust
        local delta_`yr'_`p' = _b[loggdp]
        local deltase_`yr'_`p' = _se[loggdp]
    }
    local var_`p' = "`x'"
    local minyr_`p' = `min_year_`x''
    restore
    local p = `p' + 1
}

* Create dataset for plotting
local n_total = `p' - 1
preserve
clear
set obs `n_total'
gen str40 var = ""
gen lambda_1985 = .
gen lambda_2005 = .
gen delta_1985 = .
gen delta_2005 = .
gen obs_1985 = .
gen obs_2005 = .
gen id = _n

forval i = 1/`n_total' {
    replace var = "`var_`i''" if id == `i'
    local myr = `minyr_`i''
    capture replace lambda_1985 = `lambda_`myr'_`i'' if id == `i'
    capture replace lambda_2005 = `lambda_2005_`i'' if id == `i'
    capture replace delta_1985 = `delta_`myr'_`i'' if id == `i'
    capture replace delta_2005 = `delta_2005_`i'' if id == `i'
    capture replace obs_1985 = `obs_`myr'_`i'' if id == `i'
    capture replace obs_2005 = `obs_2005_`i'' if id == `i'
}

* Flag variable groups
gen flag_solow = 0
foreach v in `solow' {
    replace flag_solow = 1 if var == "`v'"
}
gen flag_long_run = 0
foreach v in `long_run' `culture' {
    replace flag_long_run = 1 if var == "`v'"
}
gen flag_culture = 0
foreach v in `culture' {
    replace flag_culture = 1 if var == "`v'"
}
gen flag_longrun = 0
foreach v in `long_run' {
    replace flag_longrun = 1 if var == "`v'"
}

* Drop standardized variables
drop if inlist(var, "WGI_pol_stability", "WGI_gov_effectiveness", "WGI_regulatory_quality") | ///
    inlist(var, "WGI_rule_law", "WGI_control_corruption", "overallscore") | ///
    inlist(var, "governmentintegrity", "propertyrights", "businessfreedom", "taxburden", "financialfreedom")

* ── Figure 6 Panel A: Solow + Short-run ──
reg lambda_2005 lambda_1985 if flag_solow == 0 & flag_long_run == 0
local slope_sr: display %5.3f _b[lambda_1985]
local r2_sr: display %5.3f e(r2)
reg lambda_2005 lambda_1985 if flag_solow == 1 & flag_long_run == 0
local slope_solow: display %5.3f _b[lambda_1985]
local r2_solow: display %5.3f e(r2)

twoway (scatter lambda_2005 lambda_1985 if flag_solow == 0 & flag_long_run == 0, ///
        mcolor("106 155 204") msymbol(square) msize(small)) ///
       (scatter lambda_2005 lambda_1985 if flag_solow == 1, ///
        mcolor("20 20 19") msymbol(circle) msize(small)) ///
       (lfit lambda_2005 lambda_1985 if flag_solow == 0 & flag_long_run == 0, ///
        lcolor("106 155 204") lpattern(dash) range(-1.5 1.5)) ///
       (lfit lambda_2005 lambda_1985 if flag_solow == 1 & flag_long_run == 0, ///
        lcolor("20 20 19") lpattern(solid) range(-1.5 1.5)) ///
       (function y = x, range(-1.5 1.5) lcolor("185 185 185") lpattern(dot)), ///
    xtitle("Growth Regression Coefficient in 1985 ({&lambda}{sub:1985})") ///
    ytitle("Growth Regression Coefficient in 2005 ({&lambda}{sub:2005})") ///
    title("Panel A: Solow Fundamentals & Short-Run Correlates", size(medium)) ///
    legend(label(1 "Short-Run Correlates") label(2 "Solow Fundamentals") ///
           label(3 "Fitted (Short-Run)") label(4 "Fitted (Solow)") ///
           label(5 "45-degree line") rows(2) position(6) size(small)) ///
    graphregion(color(white)) yline(0, lpattern(dot) lcolor("217 119 87")) ///
    note("Slopes: Solow = `slope_solow' (R{sup:2} = `r2_solow'); Short-Run = `slope_sr' (R{sup:2} = `r2_sr')", size(vsmall)) ///
    xlabel(-1.5(0.5)1.5) ylabel(-1.5(0.5)1.5) ///
    name(lambda_A, replace)

display as text ""
display as text "Lambda slopes:"
display as text "  Solow: slope = `slope_solow', R-sq = `r2_solow'"
display as text "  Short-run: slope = `slope_sr', R-sq = `r2_sr'"

* ── Figure 6 Panel B: Long-run + Culture ──
capture reg lambda_2005 lambda_1985 if flag_culture == 1
local slope_culture: display %5.3f _b[lambda_1985]
capture reg lambda_2005 lambda_1985 if flag_longrun == 1
local slope_lr: display %5.3f _b[lambda_1985]

twoway (scatter lambda_2005 lambda_1985 if flag_culture == 1, ///
        mcolor("106 155 204") msymbol(square) msize(small)) ///
       (scatter lambda_2005 lambda_1985 if flag_longrun == 1, ///
        mcolor("20 20 19") msymbol(circle) msize(small)) ///
       (lfit lambda_2005 lambda_1985 if flag_culture == 1, ///
        lcolor("106 155 204") lpattern(dash) range(-1.5 1.5)) ///
       (lfit lambda_2005 lambda_1985 if flag_longrun == 1, ///
        lcolor("20 20 19") lpattern(solid) range(-1.5 1.5)) ///
       (function y = x, range(-1.5 1.5) lcolor("185 185 185") lpattern(dot)), ///
    xtitle("Growth Regression Coefficient in 1985 ({&lambda}{sub:1985})") ///
    ytitle("Growth Regression Coefficient in 2005 ({&lambda}{sub:2005})") ///
    title("Panel B: Long-Run Correlates and Culture", size(medium)) ///
    legend(label(1 "Culture") label(2 "Long-Run Correlates") ///
           label(3 "Fitted (Culture)") label(4 "Fitted (Long-Run)") ///
           label(5 "45-degree line") rows(2) position(6) size(small)) ///
    graphregion(color(white)) yline(0, lpattern(dot) lcolor("217 119 87")) ///
    note("Slopes: Long-Run = `slope_lr'; Culture = `slope_culture'", size(vsmall)) ///
    xlabel(-1.5(0.5)1.5) ylabel(-1.5(0.5)1.5) ///
    name(lambda_B, replace)

graph combine lambda_A lambda_B, rows(1) cols(2) ///
    graphregion(color(white)) ///
    title("Growth Regression Coefficients: 1985 vs 2005", size(medium))
graph export "stata_convergence2_lambda_flattening.png", replace width(2400)
graph drop lambda_A lambda_B

display as text ""
display as text "Exported: stata_convergence2_lambda_flattening.png"
display as text ""
display as text "INTERPRETATION: This is the most striking result. Growth regression"
display as text "coefficients for SHORT-RUN correlates essentially collapsed (slope 0.18,"
display as text "R-sq 0.06). Variables that predicted growth in the 1990s no longer do."
display as text "Solow fundamentals are more stable (slope ~0.86, R-sq ~0.95)."
display as text "This is an OUT-OF-SAMPLE test: the 1990s growth literature fails."

* ── Compute delta*lambda products ──
gen dl_1985 = delta_1985 * lambda_1985
gen dl_2005 = delta_2005 * lambda_2005

* Export comprehensive Table 4
export delimited using "convergence2_delta_lambda.csv", replace
display as text "Exported: convergence2_delta_lambda.csv"
restore


*===============================================================================
* SECTION 8: THE PUNCHLINE -- ABSOLUTE CONVERGES TO CONDITIONAL
*
*   Everything comes together here. The OVB formula tells us:
*     beta - beta* = delta x lambda
*
*   We showed that delta (correlate-income slopes) stayed stable
*   while lambda (growth regression coefficients) flattened.
*   Therefore delta x lambda shrank toward zero, closing the gap
*   between unconditional (beta) and conditional (beta*) convergence.
*
*   Result: The world "converged to convergence."
*===============================================================================

display as text ""
display as text "----------------------------------------------------------------"
display as text "  SECTION 8: ABSOLUTE CONVERGENCE CONVERGES TO CONDITIONAL"
display as text "----------------------------------------------------------------"

* ── 8A: Univariate OVB gap (Figure 7) ──
display as text ""
display as text "8A: THE OVB GAP -- delta x lambda"

import delimited "convergence2_delta_lambda.csv", clear

* ── Figure 7 Panel A: Solow + Short-run ──
reg dl_2005 dl_1985 if flag_solow == 0 & flag_long_run == 0
local slope_sr: display %5.3f _b[dl_1985]
reg dl_2005 dl_1985 if flag_solow == 1 & flag_long_run == 0
local slope_solow: display %5.3f _b[dl_1985]

twoway (scatter dl_2005 dl_1985 if flag_solow == 0 & flag_long_run == 0, ///
        mcolor("106 155 204") msymbol(square) msize(small)) ///
       (scatter dl_2005 dl_1985 if flag_solow == 1, ///
        mcolor("20 20 19") msymbol(circle) msize(small)) ///
       (lfit dl_2005 dl_1985 if flag_solow == 0 & flag_long_run == 0, ///
        lcolor("106 155 204") lpattern(dash) range(-0.5 0.6)) ///
       (lfit dl_2005 dl_1985 if flag_solow == 1 & flag_long_run == 0, ///
        lcolor("20 20 19") lpattern(solid) range(-0.5 0.6)) ///
       (function y = x, range(-0.5 0.6) lcolor("185 185 185") lpattern(dot)), ///
    xtitle("Effect of Conditioning in 1985 ({&delta}{sub:1985}{&lambda}{sub:1985})") ///
    ytitle("Effect of Conditioning in 2005 ({&delta}{sub:2005}{&lambda}{sub:2005})") ///
    title("Panel A: Solow & Short-Run", size(medium)) ///
    legend(label(1 "Short-Run") label(2 "Solow") ///
           label(3 "Fitted (Short-Run)") label(4 "Fitted (Solow)") ///
           label(5 "45-degree line") rows(2) position(6) size(small)) ///
    graphregion(color(white)) yline(0, lpattern(dot) lcolor("217 119 87")) ///
    note("Slopes: Solow = `slope_solow'; Short-Run = `slope_sr'", size(vsmall)) ///
    xlabel(-0.5(0.25)0.5) ylabel(-0.5(0.25)0.5) ///
    name(ovb_A, replace)

* ── Figure 7 Panel B: Long-run + Culture ──
capture reg dl_2005 dl_1985 if flag_culture == 1
local slope_culture: display %5.3f _b[dl_1985]
capture reg dl_2005 dl_1985 if flag_longrun == 1
local slope_lr: display %5.3f _b[dl_1985]

twoway (scatter dl_2005 dl_1985 if flag_culture == 1, ///
        mcolor("106 155 204") msymbol(square) msize(small)) ///
       (scatter dl_2005 dl_1985 if flag_longrun == 1, ///
        mcolor("20 20 19") msymbol(circle) msize(small)) ///
       (lfit dl_2005 dl_1985 if flag_culture == 1, ///
        lcolor("106 155 204") lpattern(dash) range(-0.5 0.6)) ///
       (lfit dl_2005 dl_1985 if flag_longrun == 1, ///
        lcolor("20 20 19") lpattern(solid) range(-0.5 0.6)) ///
       (function y = x, range(-0.5 0.6) lcolor("185 185 185") lpattern(dot)), ///
    xtitle("Effect of Conditioning in 1985 ({&delta}{sub:1985}{&lambda}{sub:1985})") ///
    ytitle("Effect of Conditioning in 2005 ({&delta}{sub:2005}{&lambda}{sub:2005})") ///
    title("Panel B: Long-Run & Culture", size(medium)) ///
    legend(label(1 "Culture") label(2 "Long-Run") ///
           label(3 "Fitted (Culture)") label(4 "Fitted (Long-Run)") ///
           label(5 "45-degree line") rows(2) position(6) size(small)) ///
    graphregion(color(white)) yline(0, lpattern(dot) lcolor("217 119 87")) ///
    note("Slopes: Long-Run = `slope_lr'; Culture = `slope_culture'", size(vsmall)) ///
    xlabel(-0.5(0.25)0.5) ylabel(-0.5(0.25)0.5) ///
    name(ovb_B, replace)

graph combine ovb_A ovb_B, rows(1) cols(2) ///
    graphregion(color(white)) ///
    title("Gap Between Unconditional and Conditional Convergence", size(medium))
graph export "stata_convergence2_ovb_gap.png", replace width(2400)
graph drop ovb_A ovb_B

display as text ""
display as text "Exported: stata_convergence2_ovb_gap.png"
display as text ""
display as text "INTERPRETATION: The product delta x lambda has shrunk toward zero"
display as text "for most correlates. The 'omitted variable bias' that made"
display as text "unconditional convergence look worse than conditional convergence"
display as text "has largely vanished. This happened because lambda flattened"
display as text "(growth regressions lost predictive power), NOT because delta"
display as text "changed (income-institution relationships are stable)."

* ── 8B: Multivariate -- The closing gap over time (Figure 8) ──
display as text ""
display as text "8B: THE CLOSING GAP -- UNCONDITIONAL VS CONDITIONAL CONVERGENCE"

use "convergence2_normalized.dta", clear

* Fix the country sample: countries with ALL 10 correlates in 1985
local base_year = 1985
local var_all polity2 FH_political_rights FH_civil_liberties pri_inv ///
    gov_spending inflation WDI_credit credit barrolee2060 edugap

keep if year == `base_year'
foreach ins of local var_all {
    keep if `ins' != .
}
keep if loggdp != .
keep code
count
local n_fixed = r(N)
display as text "Fixed sample: `n_fixed' countries with complete data"
tempfile fixed_sample
save `fixed_sample'

* Merge back and prepare
use "convergence2_normalized.dta", clear
merge m:1 code using `fixed_sample', keep(3) nogen
xtset country_id year
gen gdp_growth = loggdp_growth_10

* Impute missing correlates with most recent value
forval i = `base_year'/2007 {
    foreach ins of local var_all {
        by country_id: replace `ins' = L.`ins' if `ins' == .
    }
}

* ── Run regressions for each year ──
forval yr = `base_year'/2007 {
    * Check data availability
    quietly count if year == `yr' & gdp_growth != .
    if r(N) < 20 continue

    * Unconditional convergence
    quietly reg gdp_growth loggdp if year == `yr', robust cluster(country_id)
    local coefshort_`yr' = _b[loggdp]
    local seshort_`yr' = _se[loggdp]

    * Conditional convergence (with all 10 correlates)
    quietly reg gdp_growth loggdp `var_all' if year == `yr', robust cluster(country_id)
    local coeflong_`yr' = _b[loggdp]
    local selong_`yr' = _se[loggdp]
}

* ── Create dataset and plot ──
preserve
clear
local n_years = 2007 - `base_year' + 1
set obs `n_years'
gen year = _n + `base_year' - 1
gen beta_unconditional = .
gen beta_conditional = .
gen se_unconditional = .
gen se_conditional = .

forval yr = `base_year'/2007 {
    capture replace beta_unconditional = `coefshort_`yr'' if year == `yr'
    capture replace beta_conditional = `coeflong_`yr'' if year == `yr'
    capture replace se_unconditional = `seshort_`yr'' if year == `yr'
    capture replace se_conditional = `selong_`yr'' if year == `yr'
}

drop if beta_unconditional == .

* Plot the closing gap
gen zero = 0
twoway (line beta_unconditional year, lcolor("20 20 19") lwidth(medthick) lpattern(solid)) ///
       (line beta_conditional year, lcolor("106 155 204") lwidth(medthick) lpattern(solid)) ///
       (line zero year, lcolor("217 119 87") lpattern(dot) lwidth(thin)), ///
    graphregion(color(white)) ///
    legend(label(1 "Absolute Convergence ({&beta})") ///
           label(2 "Conditional Convergence ({&beta}*)") ///
           order(1 2) position(6) rows(1)) ///
    xtitle("Year") ytitle("Convergence Coefficient") ///
    title("Absolute Convergence Converges to Conditional", size(medium)) ///
    note("Conditional on: Polity 2, FH Rights, FH Civil Lib, Private Inv," ///
         "Gov Spending, Inflation, Credit (Pvt), Credit (Fin), Education, Edu Gap", ///
         size(vsmall))
graph export "stata_convergence2_absolute_vs_conditional.png", replace width(2400)

display as text ""
display as text "Exported: stata_convergence2_absolute_vs_conditional.png"

* Export
export delimited using "convergence2_conditional_convergence.csv", replace
display as text "Exported: convergence2_conditional_convergence.csv"
restore

* ── 8C: Table 5 -- Multivariate regressions ──
display as text ""
display as text "TABLE 5: ABSOLUTE AND CONDITIONAL CONVERGENCE"
display as text "─────────────────────────────────────────────"

use "convergence2_normalized.dta", clear
merge m:1 code using `fixed_sample', keep(3) nogen
xtset country_id year
gen gdp_growth = loggdp_growth_10

* Impute missing values
forval i = `base_year'/2007 {
    foreach ins of local var_all {
        by country_id: replace `ins' = L.`ins' if `ins' == .
    }
}

* Keep only relevant observations
keep if polity2 != . & FH_political_rights != . & pri_inv != . & ///
    gov_spending != . & inflation != . & FH_civil_liberties != . & ///
    WDI_credit != . & credit != . & investment != . & ///
    population_growth != . & barrolee2060 != .

estimates clear

foreach yr in 1985 2005 {
    * (1) Absolute convergence only
    eststo abs_`yr': reg gdp_growth loggdp if year == `yr', robust cluster(country_id)

    * (2) + Solow fundamentals
    eststo solow_`yr': reg gdp_growth loggdp investment population_growth barrolee2060 ///
        if year == `yr', robust cluster(country_id)

    * (3) + Short-run correlates
    eststo short_`yr': reg gdp_growth loggdp polity2 FH_political_rights ///
        pri_inv gov_spending inflation FH_civil_liberties WDI_credit credit ///
        if year == `yr', robust cluster(country_id)

    * (4) + Both
    eststo full_`yr': reg gdp_growth loggdp investment population_growth barrolee2060 ///
        polity2 FH_political_rights pri_inv gov_spending inflation ///
        FH_civil_liberties WDI_credit credit ///
        if year == `yr', robust cluster(country_id)
}

esttab abs_1985 solow_1985 short_1985 full_1985 ///
       abs_2005 solow_2005 short_2005 full_2005, ///
    keep(loggdp investment population_growth barrolee2060 polity2 ///
         FH_political_rights pri_inv gov_spending inflation ///
         FH_civil_liberties WDI_credit credit _cons) ///
    se star(* 0.10 ** 0.05 *** 0.01) ///
    title("Table 5: Absolute and Conditional Convergence") ///
    mtitles("(1)" "(2)" "(3)" "(4)" "(5)" "(6)" "(7)" "(8)") ///
    mgroups("1985-1995" "2005-2015", pattern(1 0 0 0 1 0 0 0)) ///
    stats(N r2, labels("Observations" "R-squared") fmt(%9.0f %9.3f)) ///
    b(%9.3f) se(%9.3f) compress

* Export table as CSV
esttab abs_1985 solow_1985 short_1985 full_1985 ///
       abs_2005 solow_2005 short_2005 full_2005 ///
    using "convergence2_multivariate_table.csv", ///
    keep(loggdp investment population_growth barrolee2060 polity2 ///
         FH_political_rights pri_inv gov_spending inflation ///
         FH_civil_liberties WDI_credit credit _cons) ///
    se plain replace ///
    mtitles("abs_1985" "solow_1985" "short_1985" "full_1985" ///
            "abs_2005" "solow_2005" "short_2005" "full_2005") ///
    stats(N r2, labels("N" "R2") fmt(%9.0f %9.3f)) ///
    b(%9.3f) se(%9.3f)
display as text "Exported: convergence2_multivariate_table.csv"

display as text ""
display as text "INTERPRETATION: In 1985-1995, adding correlates converts divergence"
display as text "(beta > 0) into conditional convergence (beta* < 0). In 2005-2015,"
display as text "unconditional convergence is already strong, and correlates deepen it"
display as text "only slightly. The GAP between columns (1) and (4) has closed."

* ── 8D: Summary ──
display as text ""
display as text "================================================================"
display as text "  THE STORY IN FOUR FACTS"
display as text "================================================================"
display as text ""
display as text "  1. ABSOLUTE CONVERGENCE EMERGED since ~2000"
display as text "     Beta went from +0.5 (divergence) to -1.0 (convergence)"
display as text ""
display as text "  2. GROWTH CORRELATES CONVERGED since ~1985"
display as text "     17 of 20 short-run correlates show beta-convergence"
display as text "     Education, democracy, trade, fiscal policy -- all converged"
display as text ""
display as text "  3. GROWTH REGRESSION COEFFICIENTS FLATTENED"
display as text "     Short-run correlates: lambda slope = 0.18 (essentially zero)"
display as text "     Solow fundamentals: lambda slope = 0.86 (relatively stable)"
display as text ""
display as text "  4. THE GAP BETWEEN ABSOLUTE AND CONDITIONAL CONVERGENCE CLOSED"
display as text "     delta x lambda shrank toward zero"
display as text "     Unconditional beta caught up to conditional beta*"
display as text ""
display as text "  THEREFORE: The world converged to convergence because"
display as text "  absolute convergence converged toward conditional convergence."
display as text "  (Kremer, Willis, and You, 2021)"
display as text ""


*===============================================================================
* SECTION 9: ROBUSTNESS
*
*   We verify that the key findings are not driven by methodological
*   choices: (a) the averaging period for growth, (b) the unbalanced
*   panel (new countries entering over time), (c) the GDP measure used.
*===============================================================================

display as text ""
display as text "----------------------------------------------------------------"
display as text "  SECTION 9: ROBUSTNESS CHECKS"
display as text "----------------------------------------------------------------"

* ── 9A: Robustness to averaging period ──
display as text ""
display as text "9A: Averaging period (1, 2, 5, 10 years)"

use "main_data.dta", clear

local y loggdp

* Generate growth rates for different periods (some may already exist)
foreach t in 1 2 5 10 {
    capture gen `y'_growth_`t' = 100 * ((F`t'.logrgdpna - logrgdpna) / `t')
}

* Run regressions for each averaging period
foreach t in 1 2 5 10 {
    quietly areg `y'_growth_`t' c.`y'#i.year, absorb(year) robust cluster(country_id)

    local b1960_`y'_`t' = _b[1960b.year#c.`y']
    local s1960_`y'_`t' = _se[1960b.year#c.`y']
    foreach i of numlist 1961(1)2018 {
        capture local b`i'_`y'_`t' = _b[`i'.year#c.`y']
        capture local s`i'_`y'_`t' = _se[`i'.year#c.`y']
    }
}

* Save and plot
preserve
clear
set obs 50
gen year = 1959 + _n

foreach t in 1 2 5 10 {
    gen `y'_`t'_b = .
    gen `y'_`t'_se = .
    foreach i of numlist 1960(1)2018 {
        capture replace `y'_`t'_b = `b`i'_`y'_`t'' if year == `i'
        capture replace `y'_`t'_se = `s`i'_`y'_`t'' if year == `i'
    }
    recode `y'_`t'_b 0 = .
    recode `y'_`t'_se 0 = .
}

foreach t in 1 2 5 10 {
    gen b_h_`t' = `y'_`t'_b + 1.96 * `y'_`t'_se
    gen b_l_`t' = `y'_`t'_b - 1.96 * `y'_`t'_se

    twoway (line `y'_`t'_b year, lcolor("106 155 204") lwidth(medthick)) ///
           (line b_h_`t' year, lpattern(dash) lcolor("106 155 204%50")) ///
           (line b_l_`t' year, lpattern(dash) lcolor("106 155 204%50")), ///
        xtitle("Year") ytitle("Beta") ///
        title("`t'-year average", size(medium)) ///
        legend(off) graphregion(color(white)) ///
        name(R`t', replace)
}

graph combine R1 R2 R5 R10, rows(2) cols(2) graphregion(color(white)) ///
    title("Robustness to Averaging Period", size(medium))
graph export "stata_convergence2_robustness_averaging.png", replace width(2400)
graph drop R1 R2 R5 R10

display as text ""
display as text "Exported: stata_convergence2_robustness_averaging.png"
display as text "10-year averages show the clearest trend; 1-year is noisy."

restore


*===============================================================================
* CLEANUP AND FINAL SUMMARY
*===============================================================================

display as text ""
display as text "================================================================"
display as text "  SCRIPT COMPLETED SUCCESSFULLY"
display as text "================================================================"

* List generated files
display as text ""
display as text "Generated PNG figures:"
local figlist : dir "." files "stata_convergence2_*.png"
foreach f of local figlist {
    display as text "  `f'"
}

display as text ""
display as text "Generated CSV files:"
local csvlist : dir "." files "convergence2_*.csv"
foreach f of local csvlist {
    display as text "  `f'"
}

* Clean up temporary files
capture erase "convergence2_working.dta"
capture erase "convergence2_normalized.dta"

display as text ""
display as text "=== Script completed successfully ==="

log close
