*=============================================================================*
*  GENERATE SYNTHETIC PANEL DATA FOR BMA/DSL TUTORIAL
*  -------------------------------------------------------------------
*  Purpose: Create a synthetic panel dataset inspired by (but not identical
*           to) Gravina & Lanzafame (2025). The data has a KNOWN ground
*           truth so we can verify whether BMA and DSL recover the true
*           predictors.
*  Output:  synthetic_ekc_panel.csv
*  DGP:     ln_co2 = b1*ln_gdp + b2*ln_gdp^2 + b3*ln_gdp^3
*                   + TRUE controls + country FE + year FE + noise
*  Design:  80 countries, 20 years (1995-2014), 12 controls (5 true, 7 noise)
*=============================================================================*

clear all
set seed 20250330

*---------------------------------------------*
* Parameters                                  *
*---------------------------------------------*
local N_countries = 80
local N_years     = 20
local first_year  = 1995

* GDP polynomial (inverted-N EKC)
* Turning points designed at ln(GDP) ~ 7.5 ($1,800) and ~ 10.5 ($36,000)
local b1 = -7.1
local b2 = 0.81
local b3 = -0.03

* TRUE predictor coefficients
local g_fossil   =  0.015   // fossil fuel -> more CO2
local g_renew    = -0.010   // renewables -> less CO2
local g_urban    =  0.007   // urbanization -> more CO2
local g_democracy = -0.005  // democracy -> less CO2 (environmental regulation)
local g_industry =  0.010   // industry share -> more CO2

* Noise level
local sigma_eps  = 0.15     // observation-level noise
local sigma_fe   = 0.50     // country fixed effect spread

*---------------------------------------------*
* Step 1: Create panel structure              *
*---------------------------------------------*
set obs `N_countries'
gen country_id = _n

* Country-level characteristics (drawn once per country)
gen alpha_i     = rnormal(0, `sigma_fe')           // country FE
gen gdp_base    = runiform(7.0, 11.5)              // baseline log GDP
gen gdp_growth  = runiform(0.005, 0.035)           // annual GDP growth rate
gen fossil_base = 30 + 50 * (gdp_base - 7) / 4.5 + rnormal(0, 10)  // correlated with GDP
gen renew_base  = 40 - 25 * (gdp_base - 7) / 4.5 + rnormal(0, 8)   // negative corr with GDP
gen urban_base  = 30 + 40 * (gdp_base - 7) / 4.5 + rnormal(0, 10)  // correlated with GDP
gen demo_base   = runiform(-5, 10)                 // democracy score
gen indust_base = 20 + 10 * (gdp_base - 7) / 4.5 + rnormal(0, 5)   // correlated with GDP

* Noise variable bases (some correlated with GDP to make selection harder)
gen global_base  = 40 + 30 * (gdp_base - 7) / 4.5 + rnormal(0, 8)   // strong GDP corr
gen popden_base  = exp(rnormal(4, 1.2))                                // log-normal, no GDP corr
gen corrupt_base = runiform(0, 100)                                     // no GDP corr
gen serv_base    = 30 + 25 * (gdp_base - 7) / 4.5 + rnormal(0, 6)   // strong GDP corr
gen trade_base   = 50 + 30 * (gdp_base - 7) / 4.5 + rnormal(0, 15)  // moderate GDP corr
gen fdi_base     = rnormal(3, 4)                                        // no GDP corr
gen credit_base  = 30 + 40 * (gdp_base - 7) / 4.5 + rnormal(0, 15)  // moderate GDP corr

* Expand to panel
expand `N_years'
bysort country_id: gen year = `first_year' + _n - 1

*---------------------------------------------*
* Step 2: Generate time-varying variables     *
*---------------------------------------------*

* Year fixed effect: slight downward trend (global decarbonization) + noise
gen delta_t = -0.008 * (year - `first_year') + rnormal(0, 0.02)
* Make delta_t constant within year
bysort year: egen delta_t_mean = mean(delta_t)
replace delta_t = delta_t_mean
drop delta_t_mean

* Log GDP per capita: base + trend + noise
gen ln_gdp = gdp_base + gdp_growth * (year - `first_year') + rnormal(0, 0.05)

* GDP polynomial terms
gen ln_gdp_sq = ln_gdp^2
gen ln_gdp_cb = ln_gdp^3

* TRUE predictors (with time variation around base)
gen fossil_fuel = fossil_base + rnormal(0, 3) - 0.3 * (year - `first_year')
replace fossil_fuel = max(5, min(95, fossil_fuel))  // bound to [5, 95]

gen renewable = renew_base + rnormal(0, 2) + 0.4 * (year - `first_year')
replace renewable = max(1, min(80, renewable))

gen urban = urban_base + rnormal(0, 1.5) + 0.3 * (year - `first_year')
replace urban = max(10, min(95, urban))

gen democracy = demo_base + rnormal(0, 0.5)
replace democracy = max(-10, min(10, democracy))

gen industry = indust_base + rnormal(0, 2) - 0.1 * (year - `first_year')
replace industry = max(5, min(60, industry))

* NOISE predictors (zero true effect, but some correlated with GDP)
gen globalization = global_base + rnormal(0, 3) + 0.2 * (year - `first_year')
replace globalization = max(20, min(95, globalization))

gen pop_density = popden_base * (1 + 0.01 * (year - `first_year')) + rnormal(0, 5)
replace pop_density = max(1, pop_density)

gen corruption = corrupt_base + rnormal(0, 5)
replace corruption = max(0, min(100, corruption))

gen services = serv_base + rnormal(0, 2) + 0.2 * (year - `first_year')
replace services = max(10, min(80, services))

gen trade = trade_base + rnormal(0, 5)
replace trade = max(10, min(200, trade))

gen fdi = fdi_base + rnormal(0, 2)

gen credit = credit_base + rnormal(0, 5) + 0.3 * (year - `first_year')
replace credit = max(5, credit)

*---------------------------------------------*
* Step 3: Generate outcome from DGP           *
*---------------------------------------------*

gen ln_co2 = `b1' * ln_gdp + `b2' * ln_gdp_sq + `b3' * ln_gdp_cb ///
           + `g_fossil'   * fossil_fuel ///
           + `g_renew'    * renewable ///
           + `g_urban'    * urban ///
           + `g_democracy' * democracy ///
           + `g_industry' * industry ///
           + alpha_i + delta_t ///
           + rnormal(0, `sigma_eps')

*---------------------------------------------*
* Step 4: Label variables                     *
*---------------------------------------------*
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

*---------------------------------------------*
* Step 5: Keep only analysis variables        *
*---------------------------------------------*
keep country_id year ln_co2 ln_gdp ln_gdp_sq ln_gdp_cb ///
     fossil_fuel renewable urban globalization pop_density ///
     democracy corruption industry services trade fdi credit

order country_id year ln_co2 ln_gdp ln_gdp_sq ln_gdp_cb ///
      fossil_fuel renewable urban globalization pop_density ///
      democracy corruption industry services trade fdi credit

*---------------------------------------------*
* Step 6: Verify and export                   *
*---------------------------------------------*
display _newline "=== Synthetic Data Summary ==="
describe
summarize

display _newline "=== Verify inverted-N turning points ==="
display "  b1 = `b1', b2 = `b2', b3 = `b3'"
local disc = `b2'^2 - 3 * `b1' * `b3'
display "  Discriminant = " %8.4f `disc' cond(`disc' > 0, " (> 0: turning points exist)", " (< 0: no turning points)")
if `disc' > 0 {
    local tp_min = exp((-`b2' + sqrt(`disc')) / (3 * `b3'))
    local tp_max = exp((-`b2' - sqrt(`disc')) / (3 * `b3'))
    display "  Minimum turning point: $" %10.0fc `tp_min'
    display "  Maximum turning point: $" %10.0fc `tp_max'
}

display _newline "=== Correlations with ln_gdp ==="
correlate ln_gdp fossil_fuel renewable urban globalization pop_density ///
    democracy corruption industry services trade fdi credit

export delimited "synthetic_ekc_panel.csv", replace
display _newline "Saved: synthetic_ekc_panel.csv"
display "Observations: " _N
display "Variables: " c(k)
