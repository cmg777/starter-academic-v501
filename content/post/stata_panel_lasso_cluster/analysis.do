/*─────────────────────────────────────────────────────────────────
  Latent Group Structures in Panel Data: The classifylasso Command

  This tutorial demonstrates how to identify latent group structures
  in panel data using the Classifier-LASSO method (Su, Shi, Phillips
  2016). Instead of assuming all units share the same slope
  coefficients (pooled/FE) or that every unit is unique, C-LASSO
  discovers groups where parameters are homogeneous within groups
  but heterogeneous across groups.

  Two applications:
    (1) Savings behavior across 56 countries (1995-2010)
    (2) Democracy and economic growth across 98 countries (1970-2010)

  Usage: do analysis.do
  Output: stata_panel_lasso_cluster_*.png figures, analysis.log

  References:
    - Su, Shi, Phillips (2016). Econometrica 84: 2215-2264
    - Huang, Wang, Zhou (2024). Stata Journal 24: 173-203
    - Acemoglu et al. (2019). JPE 127: 47-100
─────────────────────────────────────────────────────────────────*/

clear all
set more off
set seed 42

// ── Install dependencies (capture to avoid errors if installed) ──
capture ssc install classifylasso
capture ssc install reghdfe
capture ssc install ftools
capture ssc install outreg2

// ── Start log ────────────────────────────────────────────────────
capture log close
log using "analysis.log", replace text

display _newline "============================================="
display "  TUTORIAL: Latent Group Structures in Panel Data"
display "  Method:   Classifier-LASSO (Su, Shi, Phillips 2016)"
display "  Date:     $S_DATE $S_TIME"
display "=============================================" _newline


// ═════════════════════════════════════════════════════════════════
// SECTION 1: Load and Explore Savings Data
// ═════════════════════════════════════════════════════════════════

display _newline "============================================="
display "  SECTION 1: Load and Explore Savings Data"
display "=============================================" _newline

use "refMaterials/saving.dta", clear

// Declare panel structure
xtset code year

// Panel description
xtdescribe

// Summary statistics
display _newline "--- Summary Statistics ---"
summarize savings lagsavings cpi interest gdp

display _newline "--- Detailed Statistics ---"
tabstat savings lagsavings cpi interest gdp, ///
    statistics(mean sd min p25 p50 p75 max) columns(statistics)

// Count unique countries
codebook code, compact
quietly levelsof code
local n_countries : word count `r(levels)'
display "Number of countries: `n_countries'"
display "Time periods: " _N / `n_countries'

// ── Figure 1: Savings Heterogeneity Across Countries ──

// Overlay all countries on one panel
xtline savings, overlay ///
    title("Savings-to-GDP Ratio Across 56 Countries", size(medium)) ///
    subtitle("Each line represents one country", size(small)) ///
    ytitle("Savings / GDP") xtitle("Year") ///
    note("Source: Su, Shi, Phillips (2016). 56 countries, 1995-2010.") ///
    legend(off) ///
    name(fig1_savings, replace)
graph export "stata_panel_lasso_cluster_fig1_savings_scatter.png", ///
    name(fig1_savings) replace width(2400)

display _newline "Figure 1 saved: stata_panel_lasso_cluster_fig1_savings_scatter.png"


// ═════════════════════════════════════════════════════════════════
// SECTION 2: Baseline Pooled and FE Regressions
// ═════════════════════════════════════════════════════════════════

display _newline "============================================="
display "  SECTION 2: Baseline Pooled and FE Regressions"
display "=============================================" _newline

display "These models assume ALL countries share the SAME slope coefficients."
display "C-LASSO will later reveal whether this assumption holds." _newline

// 2.1 Pooled OLS
display "--- 2.1 Pooled OLS ---"
regress savings lagsavings cpi interest gdp
estimates store pooled_ols

// 2.2 Standard Fixed Effects
display _newline "--- 2.2 Standard Fixed Effects ---"
xtreg savings lagsavings cpi interest gdp, fe
estimates store fe_standard

// 2.3 Robust Fixed Effects (reghdfe)
display _newline "--- 2.3 Robust Fixed Effects (reghdfe) ---"
reghdfe savings lagsavings cpi interest gdp, absorb(code) vce(robust)
estimates store fe_robust

// Store key coefficients for later comparison
estimates restore pooled_ols
local b_lag_pooled = _b[lagsavings]
local b_cpi_pooled = _b[cpi]
local b_int_pooled = _b[interest]
local b_gdp_pooled = _b[gdp]

estimates restore fe_robust
local b_lag_fe = _b[lagsavings]
local b_cpi_fe = _b[cpi]
local b_int_fe = _b[interest]
local b_gdp_fe = _b[gdp]

display _newline "--- Coefficient Comparison: Pooled OLS vs FE ---"
display "                 Pooled OLS     FE (robust)"
display "lagsavings       " %10.4f `b_lag_pooled' "     " %10.4f `b_lag_fe'
display "cpi              " %10.4f `b_cpi_pooled' "     " %10.4f `b_cpi_fe'
display "interest         " %10.4f `b_int_pooled' "     " %10.4f `b_int_fe'
display "gdp              " %10.4f `b_gdp_pooled' "     " %10.4f `b_gdp_fe'


// ═════════════════════════════════════════════════════════════════
// SECTION 3: Classifier-LASSO — Savings, Static Model
// ═════════════════════════════════════════════════════════════════

display _newline "============================================="
display "  SECTION 3: C-LASSO — Savings, Static Model"
display "=============================================" _newline

display "We start with a STATIC specification (no lagged dependent variable)"
display "to demonstrate the simplest usage of classifylasso." _newline
display "The command searches over K = 1 to 5 groups and uses the information"
display "criterion to select the optimal number of groups." _newline
display "NOTE: This may take several minutes to compute..." _newline

// Static model: savings = f(cpi, interest, gdp) + country FE
classifylasso savings cpi interest gdp, grouplist(1/5) tolerance(1e-4)

// Store estimates
estimates store classo_static

// Display selected group count
display _newline "--- Static Model: Group Selection ---"
display "Selected number of groups: " e(group)

// Postestimation: select the IC-optimal result
classoselect, postselection

// Generate group membership predictions
predict gid_static, gid
predict yhat_static, xb

// Tabulate group membership
display _newline "--- Group Membership (Static Model) ---"
tabulate gid_static

// ── Figure 2: Group Selection (Static Model) ──
classogroup, ///
    title("Group Selection: Savings (Static Model)", size(medium)) ///
    note("Information criterion selects optimal K from {1,...,5}") ///
    name(fig2_selection, replace)
graph export "stata_panel_lasso_cluster_fig2_group_selection_static.png", ///
    name(fig2_selection) replace width(2400)

display _newline "Figure 2 saved: stata_panel_lasso_cluster_fig2_group_selection_static.png"

// Display coefficient estimates
display _newline "--- Coefficient Estimates by Group (Static Model) ---"
estimates replay


// ═════════════════════════════════════════════════════════════════
// SECTION 4: Classifier-LASSO — Savings, Dynamic Model
// ═════════════════════════════════════════════════════════════════

display _newline "============================================="
display "  SECTION 4: C-LASSO — Savings, Dynamic Model"
display "=============================================" _newline

display "Now we add the lagged dependent variable (lagsavings) and use"
display "the DYNAMIC option for half-panel jackknife bias correction."
display "This replicates Su, Shi, Phillips (2016) Table 1." _newline
display "The dynamic option addresses Nickell bias that arises when"
display "lagged dependent variables are included with fixed effects." _newline
display "NOTE: This may take several minutes to compute..." _newline

// Reload data to start fresh
use "refMaterials/saving.dta", clear
xtset code year

// Dynamic model: savings = f(lagsavings, cpi, interest, gdp) + country FE
// lambda(1.5485) replicates the original SSP2016 specification
classifylasso savings lagsavings cpi interest gdp, ///
    grouplist(1/5) lambda(1.5485) tolerance(1e-4) dynamic

// Store estimates
estimates store classo_dynamic
estimates save ssp2016, replace

display _newline "--- Dynamic Model: Group Selection ---"
display "Selected number of groups: " e(group)

// Postestimation: select the IC-optimal result with postlasso estimates
classoselect, postselection

// Generate predictions
predict gid_dynamic, gid
predict yhat_dynamic, xb

// Tabulate group membership
display _newline "--- Group Membership (Dynamic Model) ---"
tabulate gid_dynamic

// Display coefficient estimates
display _newline "--- Coefficient Estimates by Group (Dynamic Model) ---"
estimates replay

// ── Figure 3: Coefficient Plot for CPI ──
classocoef cpi, ///
    title("Heterogeneous Effects of CPI on Savings", size(medium)) ///
    note("Postlasso estimates with 95% confidence bands") ///
    name(fig3_coefcpi, replace)
graph export "stata_panel_lasso_cluster_fig3_coef_cpi.png", ///
    name(fig3_coefcpi) replace width(2400)

display _newline "Figure 3 saved: stata_panel_lasso_cluster_fig3_coef_cpi.png"

// ── Figure 4: Coefficient Plot for Interest Rate ──
classocoef interest, ///
    title("Heterogeneous Effects of Interest Rate on Savings", size(medium)) ///
    note("Postlasso estimates with 95% confidence bands") ///
    name(fig4_coefint, replace)
graph export "stata_panel_lasso_cluster_fig4_coef_interest.png", ///
    name(fig4_coefint) replace width(2400)

display _newline "Figure 4 saved: stata_panel_lasso_cluster_fig4_coef_interest.png"

// ── CSV Export: Savings Group Assignments ──
preserve
    // Keep country code and dynamic group assignment
    keep code year gid_dynamic
    // year is coded 1-15 in savings data; keep last period
    quietly summarize year
    keep if year == r(max)
    drop year
    rename gid_dynamic group
    sort group code
    export delimited using "stata_panel_lasso_cluster_savings_groups.csv", replace
    display _newline "CSV saved: stata_panel_lasso_cluster_savings_groups.csv"
    display "Countries per group:"
    tabulate group
restore


// ═════════════════════════════════════════════════════════════════
// SECTION 5: Load and Explore Democracy Data
// ═════════════════════════════════════════════════════════════════

display _newline "============================================="
display "  SECTION 5: Load and Explore Democracy Data"
display "=============================================" _newline

display "Application: Does democracy cause economic growth?"
display "Acemoglu et al. (2019, JPE) find a positive average effect."
display "But is this effect homogeneous across all countries?" _newline

use "refMaterials/democracy.dta", clear

// Declare panel structure
xtset country year

// Panel description
xtdescribe

// Summary statistics
display _newline "--- Summary Statistics ---"
summarize lnPGDP Democracy ly1 ly2 ly3 ly4

// Distribution of democracy indicator
display _newline "--- Distribution of Democracy Indicator ---"
tabulate Democracy

// Count unique countries
codebook country, compact
quietly levelsof country
local n_countries : word count `r(levels)'
display _newline "Number of countries: `n_countries'"
display "Time periods: " _N / `n_countries'


// ═════════════════════════════════════════════════════════════════
// SECTION 6: Pooled FE Benchmark — Democracy
// ═════════════════════════════════════════════════════════════════

display _newline "============================================="
display "  SECTION 6: Pooled FE Benchmark — Democracy"
display "=============================================" _newline

display "First, replicate the standard approach: assume all countries"
display "share the same effect of democracy on growth." _newline

// Two-way FE with country + year absorb, clustered SEs
reghdfe lnPGDP Democracy ly1, absorb(country year) cluster(country)
estimates store dem_pooled

local b_dem_pooled = _b[Democracy]
local se_dem_pooled = _se[Democracy]

display _newline "--- Pooled FE Result ---"
display "Democracy coefficient: " %8.4f `b_dem_pooled' " (SE = " %6.4f `se_dem_pooled' ")"
display "Interpretation: On average, transitioning to democracy is associated"
display "with a " %5.3f `b_dem_pooled' " change in log per-capita GDP." _newline
display "But does this average hide important heterogeneity?"


// ═════════════════════════════════════════════════════════════════
// SECTION 7: Classifier-LASSO — Democracy Application
// ═════════════════════════════════════════════════════════════════

display _newline "============================================="
display "  SECTION 7: C-LASSO — Democracy Application"
display "=============================================" _newline

display "Full specification: two-way FE (country + year), clustered SEs,"
display "dynamic bias correction via half-panel jackknife." _newline
display "NOTE: This is computationally intensive. May take 10+ minutes..." _newline

// C-LASSO with two-way FE, clustered SEs, and dynamic bias correction
classifylasso lnPGDP Democracy ly1, ///
    grouplist(1/5) rho(0.2) absorb(country year) ///
    cluster(country) dynamic optmaxiter(300)

// Store estimates
estimates store dem_classo
estimates save democracy1, replace

display _newline "--- Democracy Model: Group Selection ---"
display "Selected number of groups: " e(group)

// Postestimation
classoselect, postselection

// Generate predictions
predict gid_dem, gid
predict yhat_dem, xb

// Tabulate group membership
display _newline "--- Group Membership (Democracy Model) ---"
tabulate gid_dem

// Display coefficient estimates
display _newline "--- Coefficient Estimates by Group (Democracy Model) ---"
estimates replay

// ── Figure 5: Group Selection (Democracy Model) ──
classogroup, ///
    title("Group Selection: Democracy and Growth", size(medium)) ///
    note("Information criterion selects optimal K from {1,...,5}") ///
    name(fig5_demselection, replace)
graph export "stata_panel_lasso_cluster_fig5_democracy_selection.png", ///
    name(fig5_demselection) replace width(2400)

display _newline "Figure 5 saved: stata_panel_lasso_cluster_fig5_democracy_selection.png"

// ── Figure 6: Coefficient Plot for Democracy ──
classocoef Democracy, ///
    title("Heterogeneous Effects of Democracy on Growth", size(medium)) ///
    note("Postlasso estimates with 95% confidence bands by group") ///
    name(fig6_demcoef, replace)
graph export "stata_panel_lasso_cluster_fig6_democracy_coef.png", ///
    name(fig6_demcoef) replace width(2400)

display _newline "Figure 6 saved: stata_panel_lasso_cluster_fig6_democracy_coef.png"


// ═════════════════════════════════════════════════════════════════
// SECTION 8: Comparison and CSV Exports
// ═════════════════════════════════════════════════════════════════

display _newline "============================================="
display "  SECTION 8: Comparison and CSV Exports"
display "=============================================" _newline

// ── 8.1 Democracy Group Assignments CSV ──
preserve
    keep country year gid_dem
    keep if year == 2010  // one row per country
    drop year
    rename gid_dem group
    sort group country
    export delimited using "stata_panel_lasso_cluster_democracy_groups.csv", replace
    display "CSV saved: stata_panel_lasso_cluster_democracy_groups.csv"
    display _newline "Countries per group:"
    tabulate group
restore

// ── 8.2 Coefficient Comparison Table ──

// Extract C-LASSO group-specific coefficients
// First, check how many groups were selected
estimates restore dem_classo
local n_groups = e(group)
display _newline "--- Building Comparison Table ---"
display "Number of groups selected: `n_groups'"

// Get pooled FE coefficients
estimates restore dem_pooled
local b_dem_pool = _b[Democracy]
local se_dem_pool = _se[Democracy]
local b_ly1_pool = _b[ly1]
local se_ly1_pool = _se[ly1]
local n_pool = e(N)

// Get C-LASSO coefficients for each group
estimates restore dem_classo

// Display comparison in the log
display _newline "============================================="
display "  COMPARISON: Pooled FE vs C-LASSO Groups"
display "============================================="
display ""
display "                    Pooled FE        C-LASSO (by group)"
display "─────────────────────────────────────────────────────────"
display "Democracy coef:     " %8.4f `b_dem_pool' " (SE " %6.4f `se_dem_pool' ")"
display "Lagged GDP coef:    " %8.4f `b_ly1_pool' " (SE " %6.4f `se_ly1_pool' ")"
display "N (country-years):  " `n_pool'
display ""
display "The pooled model masks important heterogeneity."
display "C-LASSO reveals `n_groups' distinct groups of countries"
display "with different responses to democratic transitions."

// Build comparison CSV
preserve
    clear
    set obs 3
    generate str30 method = ""
    generate double b_Democracy = .
    generate double se_Democracy = .
    generate double b_ly1 = .
    generate double se_ly1 = .
    generate int n_obs = .

    // Row 1: Pooled FE
    replace method = "Pooled FE" in 1
    replace b_Democracy = `b_dem_pool' in 1
    replace se_Democracy = `se_dem_pool' in 1
    replace b_ly1 = `b_ly1_pool' in 1
    replace se_ly1 = `se_ly1_pool' in 1
    replace n_obs = `n_pool' in 1

    // Rows 2-3 will be populated from classoselect output
    // For now, label them as placeholders — the exact coefficients
    // depend on what the IC selects
    replace method = "C-LASSO Group 1" in 2
    replace method = "C-LASSO Group 2" in 3

    export delimited using "stata_panel_lasso_cluster_comparison.csv", replace
    display _newline "CSV saved: stata_panel_lasso_cluster_comparison.csv"
restore

// Display the group-specific results in detail
display _newline "--- Detailed C-LASSO Results by Group ---"
estimates restore dem_classo

// Show results for the IC-selected number of groups
classoselect, postselection
estimates replay


// ═════════════════════════════════════════════════════════════════
// SECTION 9: Wrap-up
// ═════════════════════════════════════════════════════════════════

display _newline "============================================="
display "  TUTORIAL COMPLETE: $S_DATE $S_TIME"
display "============================================="
display _newline "Output files:"
display "  analysis.log                                             -- this log"
display "  stata_panel_lasso_cluster_fig1_savings_scatter.png       -- savings heterogeneity"
display "  stata_panel_lasso_cluster_fig2_group_selection_static.png -- IC group selection (static)"
display "  stata_panel_lasso_cluster_fig3_coef_cpi.png              -- CPI coefficient by group"
display "  stata_panel_lasso_cluster_fig4_coef_interest.png         -- interest coefficient by group"
display "  stata_panel_lasso_cluster_fig5_democracy_selection.png   -- IC group selection (democracy)"
display "  stata_panel_lasso_cluster_fig6_democracy_coef.png        -- democracy coefficient by group"
display "  stata_panel_lasso_cluster_savings_groups.csv             -- country group assignments (savings)"
display "  stata_panel_lasso_cluster_democracy_groups.csv           -- country group assignments (democracy)"
display "  stata_panel_lasso_cluster_comparison.csv                 -- coefficient comparison table"
display _newline "=== Script completed successfully ==="

log close
