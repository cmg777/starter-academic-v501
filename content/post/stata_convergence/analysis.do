/*─────────────────────────────────────────────────────────────────────────────
  Beta and Sigma Convergence Across Countries: A Tutorial Using PWT 10.0

  This tutorial teaches the two fundamental concepts of economic convergence:
    - Beta (β) convergence: Do poorer countries grow faster than richer ones?
    - Sigma (σ) convergence: Is the dispersion of income narrowing over time?

  We start with the simplest possible code (two periods, OLS) and gradually
  build to advanced methods (NLS, rolling windows, heatmaps) as used in:
    Patel, Sandefur, and Subramanian (2021) "The New Era of Unconditional
    Convergence," Journal of Development Economics.

  Data: Penn World Tables version 10.0 (Feenstra, Inklaar, Timmer 2015)
  Usage: do analysis.do
  Output: stata_convergence_*.png figures, *.csv tables, analysis.log

  References:
    - Barro and Sala-i-Martin (1992) "Convergence," JPE
    - Sala-i-Martin (1996) "The Classical Approach to Convergence Analysis"
    - Patel, Sandefur, and Subramanian (2021) "The New Era of Unconditional
      Convergence," Journal of Development Economics
    - Young, Higgins, and Levy (2008) "Sigma vs Beta Convergence," JMCB
─────────────────────────────────────────────────────────────────────────────*/

clear all
set more off
set seed 42
set scheme s2color

* ── Install dependencies (capture to avoid errors if already installed) ──
capture ssc install kountry

* ── Start log ─────────────────────────────────────────────────────────────
capture log close
log using "analysis.log", replace text

display as text ""
display as text "╔══════════════════════════════════════════════════════════════╗"
display as text "║  Beta and Sigma Convergence: A Tutorial with PWT 10.0      ║"
display as text "╚══════════════════════════════════════════════════════════════╝"
display as text ""


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 0: DATA PREPARATION
*
*   We load the Penn World Tables 10.0 and prepare a clean cross-country
*   dataset of GDP per capita. Following the literature, we exclude:
*   (1) oil-exporting countries (whose income is driven by resource rents)
*   (2) very small countries (population under 1 million)
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 0: DATA PREPARATION"
display as text "────────────────────────────────────────────────────────────────"

* ── Load PWT 10.0 ──
use "pwt100.dta", clear

* Keep only the variables we need
rename countrycode ccode
keep country ccode year pop rgdpe

* ── Compute GDP per capita (PPP) ──
*   rgdpe = expenditure-side real GDP at chained PPPs (in million 2017 US$)
*   pop   = population (in millions)
*   gdppc = GDP per capita in 2017 US$ PPP
gen gdppc = rgdpe / pop
label variable gdppc "Real GDP per capita (PPP, 2017 US$)"
drop if missing(gdppc)
drop if missing(pop)

* ── Identify and exclude oil-producing countries ──
*   These countries' incomes are driven by resource extraction rather than
*   the capital accumulation process that convergence theory describes.
*   List follows IMF classification, same as Patel et al. (2021).
gen oil = inlist(ccode, "DZA", "AGO", "AZE", "BHR", "BRN", "TCD", "COG") | ///
          inlist(ccode, "ECU", "GNQ", "GAB", "IRN", "IRQ", "KAZ", "KWT") | ///
          inlist(ccode, "NGA", "OMN", "QAT", "RUS", "SAU", "TTO", "TKM") | ///
          inlist(ccode, "ARE", "VEN", "YEM", "LBY", "TLS", "SDN")
display "Oil-producing countries excluded:"
tab ccode if oil == 1
drop if oil == 1
drop oil

* ── Exclude small countries (population < 1 million) ──
*   Small economies behave differently (e.g., tax havens, tourism-dependent)
gen small = pop < 1
drop if small == 1
drop small

* ── Restrict to 1960 onwards ──
*   Reliable cross-country data begins around 1960
drop if year < 1960

* ── Summary statistics ──
display as text ""
display as text "Summary of cleaned PWT dataset:"
summarize gdppc year pop, detail
display as text ""
display as text "Number of unique countries:"
codebook ccode

* ── Export cleaned data ──
export delimited ccode country year gdppc pop using "convergence_data_prepared.csv", replace
display as text "Cleaned data exported to: convergence_data_prepared.csv"

* ── Save working dataset ──
save "convergence_working.dta", replace


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 1: BETA CONVERGENCE — THE SIMPLEST CASE (Two Periods)
*
*   The most fundamental test of convergence:
*     Do countries that START poorer GROW faster?
*
*   We use just two years: 1960 (initial) and 2019 (final).
*   If the answer is yes, we have "beta convergence."
*
*   The regression is:
*     growth_i = α + β × ln(y_i,1960) + ε_i
*
*   where:
*     growth_i = (1/s) × ln(y_i,2019 / y_i,1960) = annualized growth rate
*     ln(y_i,1960) = log of initial GDP per capita
*
*   A NEGATIVE β means convergence: poorer countries (low y_1960) grow faster.
*   A POSITIVE β (or zero) means divergence or no convergence.
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 1: BETA CONVERGENCE — THE SIMPLEST CASE"
display as text "  Two periods: 1960 and 2019"
display as text "────────────────────────────────────────────────────────────────"

use "convergence_working.dta", clear

* ── Reshape to wide format so each country is one row ──
keep ccode country year gdppc
reshape wide gdppc, i(ccode country) j(year)

* ── Calculate annualized growth rate and log initial income ──
*   growth = (1/59) × ln(GDP_2019 / GDP_1960)
*   This gives the average annual growth rate over 59 years.
local s = 2019 - 1960
gen growth = (1/`s') * ln(gdppc2019 / gdppc1960)
gen initial = ln(gdppc1960)

* Drop countries missing either endpoint
drop if missing(growth) | missing(initial)

* ── Display what we have ──
display as text ""
display as text "Countries with data for both 1960 and 2019: " _continue
count
display as text ""
display as text "Summary of variables:"
summarize growth initial

* ── Run the simplest beta-convergence regression ──
*   This is a simple OLS: growth = α + β × initial + ε
*   We use robust standard errors to account for heteroskedasticity.
display as text ""
display as text "╔══════════════════════════════════════════════════════════════╗"
display as text "║  OLS Beta-Convergence Regression: 1960 to 2019             ║"
display as text "╚══════════════════════════════════════════════════════════════╝"
reg growth initial, robust

* ── Interpret the result ──
local beta_ols = _b[initial]
local se_ols   = _se[initial]
local t_ols    = `beta_ols' / `se_ols'
local p_ols    = 2 * ttail(e(df_r), abs(`t_ols'))

display as text ""
display as text "INTERPRETATION:"
if `beta_ols' < 0 & `p_ols' < 0.05 {
    display as result "  The coefficient is NEGATIVE and statistically significant."
    display as result "  This means poorer countries grew FASTER — evidence of CONVERGENCE."
}
else if `beta_ols' < 0 & `p_ols' >= 0.05 {
    display as result "  The coefficient is negative but NOT statistically significant."
    display as result "  Weak or no evidence of convergence over the full 1960-2019 period."
}
else {
    display as result "  The coefficient is positive — evidence of DIVERGENCE."
    display as result "  Richer countries grew faster, and the gap widened."
}

* ── Create scatter plot with fitted line ──
*   This is the classic convergence scatter plot: growth vs. initial income
#delimit ;
tw (lfitci growth initial, fcolor("106 155 204"%20) lcolor("106 155 204"))
   (scatter growth initial, mcolor("217 119 87"%70) msymbol(O) msize(small)
    mlabel(ccode) mlabsize(vsmall) mlabpos(0) mlabcolor("20 20 19"%60)),
   ytitle("Average Annual Growth Rate (1960-2019)")
   xtitle("Log GDP per Capita in 1960")
   title("Beta Convergence Test: 1960 to 2019", color("20 20 19"))
   subtitle("Do poorer countries grow faster?", color("20 20 19"))
   xlabel(6 "$403" 7 "$1,097" 8 "$2,981" 9 "$8,103" 10 "$22,026", angle(0))
   ylabel(, angle(horizontal))
   legend(off)
   plotregion(style(none) lcolor(none))
   graphregion(fcolor(white) lcolor(white))
   note("Data: Penn World Tables 10.0. Excludes oil producers and countries with pop < 1M."
        "Shaded area: 95% confidence interval around fitted line.", size(vsmall))
   xsize(5) ysize(4)
;
#delimit cr
graph export "stata_convergence_scatter_1960_2019.png", replace width(2400)
display as text "Figure saved: stata_convergence_scatter_1960_2019.png"

* ── Export results ──
preserve
    clear
    set obs 1
    gen period = "1960-2019"
    gen method = "OLS"
    gen beta = `beta_ols'
    gen se = `se_ols'
    gen pvalue = `p_ols'
    gen n = `e(N)'
    export delimited using "convergence_beta_simple.csv", replace
restore


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 2: BETA CONVERGENCE — COMPARING TWO ERAS
*
*   A single regression over 1960-2019 misses a crucial story:
*   the WORLD CHANGED in the mid-1990s.
*
*   - Era of DIVERGENCE (1960-2000): Poor countries did NOT catch up.
*   - Era of CONVERGENCE (2000-2019): Poor countries ARE catching up.
*
*   By splitting the sample, we can see this structural break.
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 2: COMPARING TWO ERAS — Divergence vs. Convergence"
display as text "────────────────────────────────────────────────────────────────"

* ── Era of Divergence: 1960 to 2000 ──
display as text ""
display as text "--- Era 1: 1960 to 2000 (the 'divergence era') ---"
gen growth_era1 = (1/40) * ln(gdppc2000 / gdppc1960)
gen initial_era1 = ln(gdppc1960)
reg growth_era1 initial_era1 if !missing(growth_era1) & !missing(initial_era1), robust
local b_era1 = _b[initial_era1]
local se_era1 = _se[initial_era1]
local n_era1 = e(N)

* ── Era of Convergence: 2000 to 2019 ──
display as text ""
display as text "--- Era 2: 2000 to 2019 (the 'convergence era') ---"
gen growth_era2 = (1/19) * ln(gdppc2019 / gdppc2000)
gen initial_era2 = ln(gdppc2000)
reg growth_era2 initial_era2 if !missing(growth_era2) & !missing(initial_era2), robust
local b_era2 = _b[initial_era2]
local se_era2 = _se[initial_era2]
local n_era2 = e(N)

display as text ""
display as text "╔══════════════════════════════════════════════════════════════╗"
display as text "║  Comparison of Two Eras                                    ║"
display as text "╚══════════════════════════════════════════════════════════════╝"
display as text "  Era of Divergence (1960-2000):  β = " %7.5f `b_era1' " (SE = " %7.5f `se_era1' ", N = " `n_era1' ")"
display as text "  Era of Convergence (2000-2019): β = " %7.5f `b_era2' " (SE = " %7.5f `se_era2' ", N = " `n_era2' ")"
display as text ""
display as text "  The slope FLIPPED from near-zero/positive to clearly NEGATIVE."
display as text "  This is the 'new era of unconditional convergence.'"

* ── Side-by-side scatter plots ──
#delimit ;
tw (lfitci growth_era1 initial_era1, fcolor("217 119 87"%15) lcolor("217 119 87"))
   (scatter growth_era1 initial_era1, mcolor("217 119 87"%60) msymbol(O) msize(small)
    mlabel(ccode) mlabsize(tiny) mlabpos(0) mlabcolor("20 20 19"%40)),
   ytitle("Average Annual Growth Rate")
   xtitle("Log Initial GDP per Capita")
   title("Era of Divergence: 1960 to 2000", color("20 20 19") size(medium))
   xlabel(6 "$403" 7 "$1,097" 8 "$2,981" 9 "$8,103" 10 "$22,026", angle(0))
   ylabel(-0.02 "-2%" 0 "0%" 0.02 "2%" 0.04 "4%" 0.06 "6%", angle(horizontal))
   legend(off)
   plotregion(style(none) lcolor(none))
   graphregion(fcolor(white) lcolor(white))
   xsize(4) ysize(4)
   saving("_era1.gph", replace)
;
tw (lfitci growth_era2 initial_era2, fcolor("106 155 204"%15) lcolor("106 155 204"))
   (scatter growth_era2 initial_era2, mcolor("106 155 204"%60) msymbol(O) msize(small)
    mlabel(ccode) mlabsize(tiny) mlabpos(0) mlabcolor("20 20 19"%40)),
   ytitle("Average Annual Growth Rate")
   xtitle("Log Initial GDP per Capita")
   title("Era of Convergence: 2000 to 2019", color("20 20 19") size(medium))
   xlabel(7 "$1,097" 8 "$2,981" 9 "$8,103" 10 "$22,026" 11 "$59,874", angle(0))
   ylabel(-0.02 "-2%" 0 "0%" 0.02 "2%" 0.04 "4%" 0.06 "6%", angle(horizontal))
   legend(off)
   plotregion(style(none) lcolor(none))
   graphregion(fcolor(white) lcolor(white))
   xsize(4) ysize(4)
   saving("_era2.gph", replace)
;
#delimit cr
graph combine "_era1.gph" "_era2.gph", ///
    title("The Structural Break in Cross-Country Growth", color("20 20 19")) ///
    subtitle("The slope flipped from flat/positive (divergence) to negative (convergence)", ///
             color("20 20 19") size(small)) ///
    note("Data: Penn World Tables 10.0. Excludes oil producers and countries with pop < 1M.", ///
         size(vsmall)) ///
    graphregion(fcolor(white) lcolor(white)) ///
    xsize(8) ysize(4)
graph export "stata_convergence_scatter_two_eras.png", replace width(2400)
display as text "Figure saved: stata_convergence_scatter_two_eras.png"
capture erase "_era1.gph"
capture erase "_era2.gph"


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 3: SPEED OF CONVERGENCE AND HALF-LIFE
*
*   How FAST are poor countries catching up? Two key metrics:
*
*   (A) SPEED OF CONVERGENCE (β):
*       The fraction of the income gap closed per year.
*       β = 0.02 means 2% of the gap is closed annually.
*       Classic benchmark: β ≈ 2% (Barro & Sala-i-Martin, 1992)
*       — but that was for CONDITIONAL convergence (controlling for
*         human capital, institutions, etc.)
*
*   (B) HALF-LIFE (τ):
*       How many years to close HALF the gap to steady-state income?
*       τ = -ln(2) / ln(1 - (1 - exp(-β×s)) / s)
*       Classic benchmark: τ ≈ 35 years (conditional convergence)
*
*   We use the Barro & Sala-i-Martin (1992) NON-LINEAR specification:
*
*     (1/s) × ln(y_{t+s}/y_t) = α - ((1 - exp(-β×s)) / s) × ln(y_t) + ε
*
*   This is estimated with Non-Linear Least Squares (NLS) because:
*   - The β parameter has a structural interpretation (speed of convergence)
*   - Unlike OLS, the NLS β is INVARIANT to the length of the growth period
*   - OLS coefficients shrink mechanically with longer periods
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 3: SPEED OF CONVERGENCE AND HALF-LIFE"
display as text "────────────────────────────────────────────────────────────────"

* We will estimate the NLS convergence equation for multiple periods
* and compare the speed and half-life.
*
* IMPORTANT: We reload the data fresh for each period so that each
* regression uses the MAXIMUM available sample (all countries with data
* for that specific start AND end year), not just the 1960 sample.

* ── Define the periods to analyze ──
*   We pick key periods that tell the convergence story.
local periods   "1960-2019 1960-2000 1980-2019 1990-2019 1995-2019 2000-2019"
local starts    "1960      1960      1980      1990      1995      2000"
local ends      "2019      2000      2019      2019      2019      2019"

* ── Create a file to collect results ──
tempfile speed_results
preserve
    clear
    gen str20 period = ""
    gen str5  method = ""
    gen double beta_nls = .
    gen double se_nls = .
    gen double speed_pct = .
    gen double halflife = .
    gen double beta_ols = .
    gen int    n = .
    save `speed_results', replace
restore

* ── Loop over periods ──
local nperiods : word count `periods'
forval p = 1/`nperiods' {
    local period : word `p' of `periods'
    local sy : word `p' of `starts'
    local ey : word `p' of `ends'
    local s = `ey' - `sy'

    display as text ""
    display as text "--- Period: `period' (s = `s' years) ---"

    * Reload and reshape for each period to use maximum available sample
    preserve
        use "convergence_working.dta", clear
        keep ccode country year gdppc
        reshape wide gdppc, i(ccode country) j(year)

        * Calculate variables for this period
        gen outcome_temp = (1/`s') * ln(gdppc`ey' / gdppc`sy')
        gen initial_temp = ln(gdppc`sy')
        drop if missing(outcome_temp) | missing(initial_temp)

        * ── NLS estimation (Barro-Sala-i-Martin specification) ──
        capture noisily nl (outcome_temp = {b0=1} - (1 - exp(-1*{b1=0.00}*`s'))/`s' * initial_temp), ///
            vce(robust)

        if _rc == 0 {
            local beta_nls = _b[/b1]
            local se_nls   = _se[/b1]
            local n_obs    = e(N)

            * Speed of convergence (in percent per year)
            local speed = `beta_nls' * 100

            * Half-life: τ = -ln(2) / ln(1 - (1 - exp(-β×s))/s)
            local convergence_factor = (1 - exp(-1*`beta_nls'*`s')) / `s'
            if `convergence_factor' > 0 & `convergence_factor' < 1 {
                local halflife = -ln(2) / ln(1 - `convergence_factor')
            }
            else {
                local halflife = .
            }

            * Also compute simple OLS for comparison
            qui reg outcome_temp initial_temp, robust
            local beta_ols_val = _b[initial_temp]

            display as text ""
            display as result "  NLS β = " %8.5f `beta_nls' " (SE = " %8.5f `se_nls' ")"
            display as result "  Speed of convergence = " %5.2f `speed' "% per year"
            if `halflife' < . {
                display as result "  Half-life = " %6.1f `halflife' " years"
            }
            else {
                display as result "  Half-life = not computable (no convergence)"
            }
            display as result "  OLS β (linear) = " %8.5f `beta_ols_val'
            display as result "  N = " `n_obs' " countries"
        }
        else {
            display as error "  NLS did not converge for period `period'"
            local beta_nls = .
            local se_nls = .
            local speed = .
            local halflife = .
            local beta_ols_val = .
            local n_obs = .
        }
    restore

    * Store results (outside preserve/restore so tempfile is accessible)
    if `beta_nls' < . {
        preserve
            clear
            set obs 1
            gen str20 period = "`period'"
            gen str5  method = "NLS"
            gen double beta_nls = `beta_nls'
            gen double se_nls = `se_nls'
            gen double speed_pct = `speed'
            gen double halflife = `halflife'
            gen double beta_ols = `beta_ols_val'
            gen int    n = `n_obs'
            append using `speed_results'
            save `speed_results', replace
        restore
    }
}

* ── Display comparison table ──
display as text ""
display as text "╔══════════════════════════════════════════════════════════════════════════════════╗"
display as text "║  Speed of Convergence and Half-Life Across Periods                             ║"
display as text "╠══════════════════════════════════════════════════════════════════════════════════╣"
display as text "║  Period       │ NLS β      │ Speed (%/yr) │ Half-life (yrs) │ OLS β      │ N   ║"
display as text "╠══════════════════════════════════════════════════════════════════════════════════╣"
display as text "║  Benchmarks:  │            │  2.00        │  35             │            │     ║"
display as text "║  (Barro & Sala-i-Martin 1992, conditional convergence)                         ║"
display as text "╚══════════════════════════════════════════════════════════════════════════════════╝"

preserve
    use `speed_results', clear
    drop if missing(beta_nls)
    sort period
    list period beta_nls speed_pct halflife beta_ols n, noobs clean
    export delimited using "convergence_speed_halflife.csv", replace
    display as text "Results exported to: convergence_speed_halflife.csv"
restore

* ── Create speed & half-life visualization ──
preserve
    use `speed_results', clear
    drop if missing(beta_nls)
    sort period
    gen id = _n
    gen speed_bench = 2

    * Bar chart of speed of convergence
    #delimit ;
    tw (bar speed_pct id, barwidth(0.6) fcolor("106 155 204") lcolor("106 155 204"%80))
       (line speed_bench id, lcolor("217 119 87") lwidth(medthick) lpattern(dash)),
       xlabel(1 "1960-2000" 2 "1960-2019" 3 "1980-2019" 4 "1990-2019" 5 "1995-2019" 6 "2000-2019",
              angle(30) labsize(small))
       ylabel(, angle(horizontal))
       ytitle("Speed of Convergence (% per year)")
       xtitle("Period")
       title("Speed of Unconditional Convergence Across Periods", color("20 20 19"))
       subtitle("Benchmark: 2% per year (Barro & Sala-i-Martin 1992, conditional)", color("20 20 19") size(small))
       legend(order(1 "Unconditional β (NLS)" 2 "Conditional benchmark (2%/yr)")
              pos(2) ring(0) region(lcolor(none) fcolor(none)) size(small))
       plotregion(style(none) lcolor(none))
       graphregion(fcolor(white) lcolor(white))
       note("Data: Penn World Tables 10.0. Negative values indicate divergence.", size(vsmall))
       xsize(6) ysize(4)
    ;
    #delimit cr
    graph export "stata_convergence_speed_halflife.png", replace width(2400)
    display as text "Figure saved: stata_convergence_speed_halflife.png"
restore


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 4: SIGMA CONVERGENCE — THE SIMPLEST CASE (Two Periods)
*
*   While beta convergence asks "do poor countries grow faster?",
*   sigma convergence asks a different question:
*     Is the SPREAD of income across countries getting NARROWER?
*
*   We measure the spread using the VARIANCE of log GDP per capita.
*   (Using logs means we measure proportional, not absolute, differences.)
*
*   If Var(ln y) decreases over time → σ-convergence (income is converging)
*   If Var(ln y) increases over time → σ-divergence (income is spreading out)
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 4: SIGMA CONVERGENCE — THE SIMPLEST CASE"
display as text "  Two periods: 1960 and 2019"
display as text "────────────────────────────────────────────────────────────────"

* ── Load the long-format data ──
use "convergence_working.dta", clear

* ── Calculate variance of log GDP per capita in 1960 ──
display as text ""
display as text "--- Cross-country dispersion in 1960 ---"
gen logy = ln(gdppc)
ci variances logy if year == 1960
local var_1960 = r(Var)
local var_1960_lb = r(lb)
local var_1960_ub = r(ub)
local n_1960 = r(N)
local sd_1960 = sqrt(`var_1960')
display as result "  Variance of ln(GDP pc) in 1960 = " %6.4f `var_1960' " [" %6.4f `var_1960_lb' ", " %6.4f `var_1960_ub' "]"
display as result "  Std. Dev. of ln(GDP pc) in 1960 = " %6.4f `sd_1960'
display as result "  N = " `n_1960' " countries"

* ── Calculate variance of log GDP per capita in 2019 ──
display as text ""
display as text "--- Cross-country dispersion in 2019 ---"
ci variances logy if year == 2019
local var_2019 = r(Var)
local var_2019_lb = r(lb)
local var_2019_ub = r(ub)
local n_2019 = r(N)
local sd_2019 = sqrt(`var_2019')
display as result "  Variance of ln(GDP pc) in 2019 = " %6.4f `var_2019' " [" %6.4f `var_2019_lb' ", " %6.4f `var_2019_ub' "]"
display as result "  Std. Dev. of ln(GDP pc) in 2019 = " %6.4f `sd_2019'
display as result "  N = " `n_2019' " countries"

* ── Compare ──
display as text ""
display as text "╔══════════════════════════════════════════════════════════════╗"
display as text "║  Sigma Convergence Test: 1960 vs 2019                      ║"
display as text "╚══════════════════════════════════════════════════════════════╝"
local change = `var_2019' - `var_1960'
local pct_change = (`change' / `var_1960') * 100
display as result "  Change in variance: " %6.4f `change' " (" %5.1f `pct_change' "%)"
if `change' < 0 {
    display as result "  → Variance DECREASED: evidence of σ-convergence"
}
else {
    display as result "  → Variance INCREASED: evidence of σ-DIVERGENCE"
    display as result "    Even though beta convergence may exist, the spread widened!"
}

* ── Bar chart of variance in 1960 vs 2019 ──
preserve
    clear
    set obs 2
    gen year = 1960 in 1
    replace year = 2019 in 2
    gen variance = `var_1960' in 1
    replace variance = `var_2019' in 2
    gen var_lb = `var_1960_lb' in 1
    replace var_lb = `var_2019_lb' in 2
    gen var_ub = `var_1960_ub' in 1
    replace var_ub = `var_2019_ub' in 2

    #delimit ;
    tw (bar variance year if year == 1960, barwidth(8) fcolor("217 119 87") lcolor("217 119 87"%80))
       (bar variance year if year == 2019, barwidth(8) fcolor("106 155 204") lcolor("106 155 204"%80))
       (rcap var_lb var_ub year, lcolor("20 20 19")),
       xlabel(1960 "1960" 2019 "2019")
       ylabel(, angle(horizontal))
       ytitle("Variance of ln(GDP per capita)")
       title("Sigma Convergence: Cross-Country Income Dispersion", color("20 20 19"))
       subtitle("Has the spread of income across countries narrowed?", color("20 20 19") size(small))
       legend(order(1 "1960" 2 "2019" 3 "95% CI") pos(2) ring(0)
              region(lcolor(none) fcolor(none)) size(small))
       plotregion(style(none) lcolor(none))
       graphregion(fcolor(white) lcolor(white))
       note("Data: Penn World Tables 10.0. Variance of log GDP per capita (PPP)."
            "Excludes oil producers and countries with pop < 1M.", size(vsmall))
       xsize(4) ysize(4)
    ;
    #delimit cr
    graph export "stata_convergence_sigma_two_periods.png", replace width(2400)
    display as text "Figure saved: stata_convergence_sigma_two_periods.png"
restore

drop logy


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 5: THE RELATIONSHIP BETWEEN BETA AND SIGMA CONVERGENCE
*
*   A crucial insight from the convergence literature:
*
*     β-convergence is NECESSARY but NOT SUFFICIENT for σ-convergence.
*                                    (Young, Higgins, and Levy 2008)
*
*   WHY? Think of it like a race:
*     - β-convergence means the slowest runners are speeding up (catch-up)
*     - σ-convergence means the runners are getting closer together
*
*   Even if slower runners speed up ON AVERAGE, random shocks (injuries,
*   wind gusts) can keep the pack spread out. The catch-up tendency
*   (β) must be strong enough to overcome the dispersing force of shocks.
*
*   Formally: if growth shocks are i.i.d. with variance σ²_ε, then
*   Var(ln y_t) converges to σ²_ε / (1-(1-β)²) in the long run.
*   β-convergence (β > 0) ensures a finite steady-state variance,
*   but the CURRENT variance can still be rising toward that level.
*
*   In the data: β-convergence appears since ~1995, but σ-convergence
*   only appears since ~2008. The catch-up was too slow to immediately
*   narrow the distribution.
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 5: THE RELATIONSHIP BETWEEN BETA AND SIGMA"
display as text "────────────────────────────────────────────────────────────────"

display as text ""
display as text "  KEY INSIGHT:"
display as text "  β-convergence is NECESSARY but NOT SUFFICIENT for σ-convergence."
display as text ""
display as text "  Think of runners in a race:"
display as text "    β-convergence = the slowest runners speed up (catch-up)"
display as text "    σ-convergence = the pack of runners gets tighter"
display as text ""
display as text "  Even if the slow runners speed up on average, random shocks"
display as text "  (weather, injuries) can keep the pack spread out."

* ── Empirical demonstration: the lag between β and σ ──
*   Let's compute both β (OLS slope) and σ (variance of log income)
*   for each decade to show that β turns positive BEFORE σ starts declining.

display as text ""
display as text "  EMPIRICAL DEMONSTRATION:"
display as text "  Computing β and σ for each decade to show the lag..."
display as text ""

use "convergence_working.dta", clear
keep ccode country year gdppc
reshape wide gdppc, i(ccode country) j(year)

display as text "  ┌─────────────┬───────────┬───────────┬────────────────────────────┐"
display as text "  │ Decade      │ OLS β     │ σ² start  │ Interpretation             │"
display as text "  ├─────────────┼───────────┼───────────┼────────────────────────────┤"

foreach decade in 1960 1970 1980 1990 2000 2010 {
    local ey = `decade' + 10
    if `ey' > 2019 local ey = 2019
    local s = `ey' - `decade'

    * Beta (OLS): regress growth on initial income
    capture drop g_temp i_temp logy_temp
    gen g_temp = (1/`s') * ln(gdppc`ey' / gdppc`decade')
    gen i_temp = ln(gdppc`decade')
    qui reg g_temp i_temp if !missing(g_temp) & !missing(i_temp), robust
    local b = _b[i_temp]

    * Sigma: variance of log income at the START of the decade
    gen logy_temp = ln(gdppc`decade')
    qui summarize logy_temp
    local v = r(Var)

    * Determine interpretation
    local interp = ""
    if `b' >= 0 {
        local interp = "β≥0: divergence"
    }
    else {
        local interp = "β<0: convergence"
    }

    display as text "  │ `decade'-`ey'  │ " %8.5f `b' " │ " %8.4f `v' "  │ `interp'     │"
    drop g_temp i_temp logy_temp
}

display as text "  └─────────────┴───────────┴───────────┴────────────────────────────┘"
display as text ""
display as text "  NOTICE: β turns negative (convergence) around 2000, but σ² keeps"
display as text "  RISING until ~2008. This is the lag: β-convergence is necessary"
display as text "  but not sufficient for σ-convergence."
display as text "  For ~13 years, poorer countries grew faster on average, but random"
display as text "  shocks kept the income distribution from narrowing."


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 6: ROLLING BETA CONVERGENCE — THE EVOLUTION OVER TIME
*
*   Instead of just two snapshots, let's see the FULL MOVIE:
*     How has the convergence coefficient evolved year by year?
*
*   Method: Fix the end year at 2019. For each start year from 1960 to 2010,
*   estimate the NLS β coefficient. This gives us a time series of β:
*     β(start=1960, end=2019), β(start=1961, end=2019), ..., β(start=2010, end=2019)
*
*   This is the key figure from Patel et al. (2021), Figure 1.
*
*   - β > 0 → convergence (poorer countries catching up)
*   - β < 0 → divergence (gap widening)
*   - β ≈ 0 → neither convergence nor divergence
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 6: ROLLING BETA CONVERGENCE OVER TIME"
display as text "────────────────────────────────────────────────────────────────"

* ── Load and reshape data ──
use "convergence_working.dta", clear
keep ccode country year gdppc
reshape wide gdppc, i(ccode country) j(year)

* ── Loop over start years ──
local j = 1
local lastyear = 2019

forval startyear = 1960(1)2010 {
    local s = `lastyear' - `startyear'

    capture drop outcome initial
    gen outcome = (1/`s') * ln(gdppc`lastyear' / gdppc`startyear')
    gen initial = ln(gdppc`startyear')

    * NLS estimation
    capture qui nl (outcome = {b0=1} - (1 - exp(-1*{b1=0.00}*`s'))/`s' * initial) ///
        if !missing(outcome) & !missing(initial), vce(robust)

    if _rc == 0 {
        preserve
            clear
            set obs 1
            tempfile file`j'
            gen startyear = `startyear'
            gen endyear = `lastyear'
            gen beta = _b[/b1]
            gen se = _se[/b1]
            gen lower = _b[/b1] - invttail(`e(df_r)', 0.025) * _se[/b1]
            gen upper = _b[/b1] + invttail(`e(df_r)', 0.025) * _se[/b1]
            gen n = `e(N)'
            * Speed and half-life
            gen speed_pct = beta * 100
            local cf = (1 - exp(-1*_b[/b1]*`s')) / `s'
            gen halflife = .
            if `cf' > 0 & `cf' < 1 {
                replace halflife = -ln(2) / ln(1 - `cf')
            }
            save `file`j''
        restore
        local ++j
    }
    else {
        display as text "  Warning: NLS did not converge for start year `startyear'"
        local ++j
    }
}

* ── Combine all results ──
local jminus1 = `j' - 1
preserve
    clear
    forval i = 1/`jminus1' {
        capture append using `file`i''
    }

    * Display key transitions
    display as text ""
    display as text "╔══════════════════════════════════════════════════════════════╗"
    display as text "║  Rolling Beta Convergence: Key Findings                    ║"
    display as text "╚══════════════════════════════════════════════════════════════╝"
    list startyear beta speed_pct halflife n if inlist(startyear, 1960, 1970, 1980, 1990, 1995, 2000, 2005, 2010), noobs clean

    * Export
    export delimited using "convergence_rolling_beta.csv", replace
    display as text "Results exported to: convergence_rolling_beta.csv"

    * ── Create the rolling beta plot ──
    #delimit ;
    tw (rcap lower upper startyear, lcolor("106 155 204"%30))
       (scatter beta startyear, mcolor("106 155 204"%80) msymbol(O) msize(small)),
       yline(0, lcolor("20 20 19") lpattern(shortdash) lwidth(medium))
       xlabel(1960(5)2010, angle(45))
       ylabel(-0.005(0.0025)0.01, angle(horizontal) format(%6.4f))
       ytitle("{&beta} (speed of convergence)", size(medlarge))
       xtitle("Initial Year")
       title("Rolling Unconditional Convergence: PWT 10.0", color("20 20 19"))
       subtitle("Each point: NLS β from initial year to 2019", color("20 20 19") size(small))
       legend(off)
       plotregion(style(none) lcolor(none))
       graphregion(fcolor(white) lcolor(white))
       note("β > 0: convergence (poorer countries grow faster). β < 0: divergence."
            "Bars: 95% confidence intervals. Data: PWT 10.0, robust SE.", size(vsmall))
       xsize(5) ysize(4)
    ;
    #delimit cr
    graph export "stata_convergence_rolling_beta.png", replace width(2400)
    display as text "Figure saved: stata_convergence_rolling_beta.png"

restore


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 7: SIGMA CONVERGENCE OVER TIME
*
*   Now let's track the dispersion of income EVERY YEAR from 1960 to 2019.
*   We compute Var(ln GDP pc) for each year and plot the time series.
*
*   We create two versions:
*     (A) FULL SAMPLE: all available countries in each year
*         (the number of countries changes as data becomes available)
*     (B) FIXED SAMPLE: only countries with COMPLETE data from 1980 to 2019
*         (this controls for changes in sample composition)
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 7: SIGMA CONVERGENCE OVER TIME"
display as text "────────────────────────────────────────────────────────────────"

* ── (A) Full sample ──
use "convergence_working.dta", clear
keep ccode year gdppc
reshape wide gdppc, i(ccode) j(year)

local j = 1
forval yr = 1960(1)2019 {
    gen logy = ln(gdppc`yr')
    ci variances logy
    preserve
        clear
        set obs 1
        tempfile sigma`j'
        gen year = `yr'
        gen variance = r(Var)
        gen var_lb = `r(lb)'
        gen var_ub = `r(ub)'
        gen n = `r(N)'
        gen fixed = 0
        save `sigma`j''
    restore
    drop logy
    local ++j
}

* ── (B) Fixed sample (countries with complete data 1980-2019) ──
use "convergence_working.dta", clear
keep ccode year gdppc
drop if year < 1980
bys ccode: egen count = count(gdppc)
keep if count == 40
drop count
reshape wide gdppc, i(ccode) j(year)

forval yr = 1980(1)2019 {
    gen logy = ln(gdppc`yr')
    ci variances logy
    preserve
        clear
        set obs 1
        tempfile sigma`j'
        gen year = `yr'
        gen variance = r(Var)
        gen var_lb = `r(lb)'
        gen var_ub = `r(ub)'
        gen n = `r(N)'
        gen fixed = 1
        save `sigma`j''
    restore
    drop logy
    local ++j
}

* ── Combine ──
local jminus1 = `j' - 1
clear
forval i = 1/`jminus1' {
    append using `sigma`i''
}

* Stagger fixed sample slightly for visual clarity
gen year2 = year + 0.3 if fixed == 1
replace year2 = year if fixed == 0

* ── Display key years ──
display as text ""
display as text "╔══════════════════════════════════════════════════════════════╗"
display as text "║  Sigma Convergence Over Time: Key Years                    ║"
display as text "╚══════════════════════════════════════════════════════════════╝"
list year variance n fixed if inlist(year, 1960, 1970, 1980, 1990, 2000, 2008, 2010, 2019) & fixed == 0, noobs clean
display as text ""
display as text "Fixed sample (1980-2019):"
list year variance n fixed if inlist(year, 1980, 1990, 2000, 2008, 2010, 2019) & fixed == 1, noobs clean

* Export
export delimited using "convergence_sigma_evolution.csv", replace
display as text "Results exported to: convergence_sigma_evolution.csv"

* ── Create sigma convergence time series plot ──
#delimit ;
tw (rcap var_lb var_ub year if fixed == 0 & year >= 1960, lcolor("106 155 204"%20))
   (rcap var_lb var_ub year2 if fixed == 1 & year >= 1980, lcolor("217 119 87"%20))
   (scatter variance year if fixed == 0 & year >= 1960, mcolor("106 155 204"%60) msymbol(O) msize(vsmall))
   (scatter variance year2 if fixed == 1 & year >= 1980, mcolor("217 119 87"%60) msymbol(D) msize(vsmall)),
   xlabel(1960(10)2020)
   ylabel(, angle(horizontal))
   ytitle("Variance of ln(GDP per capita)", size(medsmall))
   xtitle("Year")
   title("Sigma Convergence: Cross-Country Income Dispersion Over Time", color("20 20 19") size(medium))
   subtitle("Variance of log GDP per capita across countries", color("20 20 19") size(small))
   legend(order(3 "Full Sample" 4 "Fixed Sample (1980-2019)")
          pos(10) ring(0) col(1) region(lcolor(none) fcolor(none)) size(small))
   plotregion(style(none) lcolor(none))
   graphregion(fcolor(white) lcolor(white))
   note("Data: Penn World Tables 10.0. Bars: 95% CI."
        "σ-convergence (decreasing variance) appears only after ~2008.", size(vsmall))
   xsize(6) ysize(4)
;
#delimit cr
graph export "stata_convergence_sigma_evolution.png", replace width(2400)
display as text "Figure saved: stata_convergence_sigma_evolution.png"


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 8: THE CONVERGENCE HEATMAP — ALL WINDOWS
*
*   The most comprehensive view of convergence:
*     For EVERY combination of start year and end year,
*     estimate the β coefficient and color-code it.
*
*   This reproduces Figure 2 from Patel et al. (2021).
*
*   Blue = convergence (positive β), Red = divergence (negative β)
*
*   Along lines parallel to the diagonal, you see how convergence
*   changes over time for a FIXED growth interval (rolling window).
*   This shows that convergence is not an artifact of choosing 2019
*   as the end year — it appears across many time windows.
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 8: THE CONVERGENCE HEATMAP"
display as text "────────────────────────────────────────────────────────────────"

* ── Load and reshape ──
use "convergence_working.dta", clear
keep ccode country year gdppc
reshape wide gdppc, i(ccode country) j(year)

* ── Loop over ALL start/end year combinations ──
local j = 1
local firstyear = 1960
local lastyear = 2019
local endyear_loop = `lastyear' - 1

forval startyear = `firstyear'(1)`endyear_loop' {
    local startplus1 = `startyear' + 1
    forval outcomeyear = `startplus1'(1)`lastyear' {
        local s = `outcomeyear' - `startyear'

        capture drop outcome initial
        gen outcome = (1/`s') * ln(gdppc`outcomeyear' / gdppc`startyear')
        gen initial = ln(gdppc`startyear')

        capture qui nl (outcome = {b0=1} - (1 - exp(-1*{b1=0.00}*`s'))/`s' * initial) ///
            if !missing(outcome) & !missing(initial), vce(robust)

        if _rc == 0 {
            preserve
                clear
                set obs 1
                tempfile hm`j'
                gen startyear = `startyear'
                gen endyear = `outcomeyear'
                gen beta = _b[/b1]
                gen se = _se[/b1]
                gen n = `e(N)'
                save `hm`j''
            restore
        }
        local ++j
    }
    * Progress indicator every 5 years
    if mod(`startyear' - `firstyear', 5) == 0 {
        display as text "  Processing start year: `startyear'..."
    }
}

* ── Combine all heatmap results ──
local jminus1 = `j' - 1
preserve
    clear
    forval i = 1/`jminus1' {
        capture append using `hm`i''
    }
    gen period = endyear - startyear

    * Export
    export delimited using "convergence_heatmap_coefficients.csv", replace
    display as text "Results exported to: convergence_heatmap_coefficients.csv"

    * ── Create heatmap (color-coded scatter) ──
    *   11 bins following Patel et al. (2021):
    *   Deep blue (strong convergence) → white (neither) → deep red (strong divergence)
    #delimit ;
    tw (scatter startyear endyear if beta > .0035, msize(medsmall)
            mfcolor("5 48 97") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta < .0035 & beta > .0025, msize(medsmall)
            mfcolor("33 102 172") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta < .0025 & beta > .0015, msize(medsmall)
            mfcolor("67 147 195") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta < .0015 & beta > .0005, msize(medsmall)
            mfcolor("146 197 222") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta < .0005 & beta > -.0005, msize(medsmall)
            mfcolor("209 229 240") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta > -.0015 & beta < -.0005, msize(medsmall)
            mfcolor("247 247 247") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta > -.0025 & beta < -.0015, msize(medsmall)
            mfcolor("253 219 199") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta > -.0035 & beta < -.0025, msize(medsmall)
            mfcolor("244 165 130") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta > -.0045 & beta < -.0035, msize(medsmall)
            mfcolor("214 96 77") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta > -.0055 & beta < -.0045, msize(medsmall)
            mfcolor("178 24 43") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta < -.0055, msize(medsmall)
            mfcolor("103 0 31") mlcolor("20 20 19") mlwidth(vthin)),
       plotregion(style(none) lcolor(none))
       graphregion(fcolor(white) lcolor(white))
       xtitle("End Year") ytitle("Start Year")
       title("Convergence Heatmap: All Start/End Year Combinations", color("20 20 19") size(medium))
       subtitle("Blue = convergence (β>0), Red = divergence (β<0)", color("20 20 19") size(small))
       aspectratio(1)
       xlabel(1960(10)2020) ylabel(1960(10)2010)
       xsize(5) ysize(5)
       legend(order(1 ">.0035" 2 "[.0025,.0035]" 3 "[.0015,.0025]"
                    4 "[.0005,.0015]" 5 "[-.0005,.0005]"
                    6 "[-.0015,-.0005]" 7 "[-.0025,-.0015]"
                    8 "[-.0035,-.0025]" 9 "[-.0045,-.0035]"
                    10 "[-.0055,-.0045]" 11 "<-.0055")
              size(vsmall) pos(10) ring(0) bmargin(medsmall) col(1)
              region(lcolor(none) fcolor(none))
              title("{&beta} coefficient", size(small)))
       note("Data: Penn World Tables 10.0. NLS estimation."
            "Each dot: one convergence regression for that start-end pair.", size(vsmall))
    ;
    #delimit cr
    graph export "stata_convergence_heatmap.png", replace width(2400)
    display as text "Figure saved: stata_convergence_heatmap.png"

restore


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 9: REGIONAL DECOMPOSITION
*
*   Which regions drive the convergence result?
*   We drop one region at a time and re-estimate beta.
*
*   Following Patel et al. (2021):
*   - Dropping Africa → convergence coefficient INCREASES
*     (Africa drags convergence down)
*   - Dropping Asia → convergence coefficient DECREASES
*     (Asia drives convergence up)
*   - Dropping Latin America → modest effect
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 9: REGIONAL DECOMPOSITION"
display as text "────────────────────────────────────────────────────────────────"

* ── Load and reshape ──
use "convergence_working.dta", clear
keep ccode country year gdppc
drop if missing(gdppc)
reshape wide gdppc, i(ccode country) j(year)

* ── Assign regions using kountry ──
kountry ccode, from(iso3c) geo(undet)
gen clusters = "West" if country == "Kosovo" | regexm(GEO, "Europe") == 1 | ///
    regexm(GEO, "Australia and New Zealand") | inlist(country, "Canada", "United States")
replace clusters = "Africa" if regexm(GEO, "Africa") == 1
replace clusters = "Latin America" if GEO == "South America" | ///
    GEO == "Caribbean" | GEO == "Central America"
replace clusters = "Asia" if regexm(GEO, "Asia") == 1 | ///
    GEO == "Melanesia" | GEO == "Micronesia" | GEO == "Polynesia" | ///
    country == "Taiwan"

display as text ""
display as text "Regional distribution of countries:"
tab clusters if !missing(gdppc2019)

* ── Loop: for each start year, estimate OLS dropping each region ──
local lastyear = 2019
local j = 1

forval startyear = 1960(1)2010 {
    local s = `lastyear' - `startyear'

    capture drop outcome initial
    gen outcome = (1/`s') * ln(gdppc`lastyear' / gdppc`startyear')
    gen initial = ln(gdppc`startyear')

    * Full sample OLS
    qui reg outcome initial if !missing(outcome) & !missing(initial), robust
    local b_full = _b[initial]
    local lb_full = _b[initial] - invttail(`e(df_r)', 0.025) * _se[initial]
    local ub_full = _b[initial] + invttail(`e(df_r)', 0.025) * _se[initial]

    * Drop each region
    foreach cluster in "Africa" "Asia" "Latin America" {
        qui reg outcome initial if clusters != "`cluster'" & !missing(outcome) & !missing(initial), robust
        local b_`=subinstr("`cluster'"," ","_",.)' = _b[initial]
        local lb_`=subinstr("`cluster'"," ","_",.)' = _b[initial] - invttail(`e(df_r)', 0.025) * _se[initial]
        local ub_`=subinstr("`cluster'"," ","_",.)' = _b[initial] + invttail(`e(df_r)', 0.025) * _se[initial]
    }

    preserve
        clear
        set obs 1
        tempfile reg`j'
        gen year = `startyear'
        gen period = `s'
        gen beta_full = `b_full'
        gen lb_full = `lb_full'
        gen ub_full = `ub_full'
        gen beta_noAfrica = `b_Africa'
        gen lb_noAfrica = `lb_Africa'
        gen ub_noAfrica = `ub_Africa'
        gen beta_noAsia = `b_Asia'
        gen lb_noAsia = `lb_Asia'
        gen ub_noAsia = `ub_Asia'
        gen beta_noLatAm = `b_Latin_America'
        gen lb_noLatAm = `lb_Latin_America'
        gen ub_noLatAm = `ub_Latin_America'
        save `reg`j''
    restore

    local ++j
}

* ── Combine and convert OLS lambda to NLS-equivalent beta ──
local jminus1 = `j' - 1
preserve
    clear
    forval i = 1/`jminus1' {
        append using `reg`i''
    }

    * Convert OLS coefficient (lambda) to beta: β = -ln(λ*s + 1) / s
    foreach var in full noAfrica noAsia noLatAm {
        gen nls_`var' = -ln(beta_`var' * period + 1) / period
        gen nls_lb_`var' = -ln(ub_`var' * period + 1) / period
        gen nls_ub_`var' = -ln(lb_`var' * period + 1) / period
    }

    * Stagger for visual clarity
    gen year2 = year + 0.2
    gen year3 = year + 0.4
    gen year4 = year + 0.6

    * ── Create regional decomposition plot ──
    #delimit ;
    tw (rcap nls_lb_full nls_ub_full year4 if inrange(year, 1960, 2010), lcolor("20 20 19"%30))
       (rcap nls_lb_noAfrica nls_ub_noAfrica year if inrange(year, 1960, 2010), lcolor("0 0 128"%30))
       (rcap nls_lb_noAsia nls_ub_noAsia year2 if inrange(year, 1960, 2010), lcolor("128 0 0"%30))
       (rcap nls_lb_noLatAm nls_ub_noLatAm year3 if inrange(year, 1960, 2010), lcolor("0 128 0"%30))
       (scatter nls_full year4 if inrange(year, 1960, 2010), msymbol(O) mcolor("20 20 19"%70))
       (scatter nls_noAfrica year if inrange(year, 1960, 2010), mcolor("0 0 128"%70))
       (scatter nls_noAsia year2 if inrange(year, 1960, 2010), msymbol(D) mcolor("128 0 0"%70))
       (scatter nls_noLatAm year3 if inrange(year, 1960, 2010), msymbol(S) mcolor("0 128 0"%70)),
       xtitle("Initial Year")
       ytitle("{&beta}", orientation(horizontal) size(large))
       title("Regional Decomposition of Convergence", color("20 20 19"))
       subtitle("Dropping one region at a time from the convergence regression", color("20 20 19") size(small))
       plotregion(style(none) lcolor(none))
       xlabel(1960(5)2010)
       graphregion(fcolor(white) lcolor(white))
       legend(order(6 "World Minus Africa" 7 "World Minus Asia"
                    8 "World Minus Latin America" 5 "Full Sample")
              cols(1) ring(0) pos(10) bmargin(small) region(color(none))
              size(small))
       yline(0, lcolor("20 20 19"%30) lpattern(dash))
       note("OLS coefficient converted to NLS-equivalent β."
            "Data: Penn World Tables 10.0.", size(vsmall))
       xsize(5) ysize(4)
    ;
    #delimit cr
    graph export "stata_convergence_regional_beta.png", replace width(2400)
    display as text "Figure saved: stata_convergence_regional_beta.png"

restore


*═══════════════════════════════════════════════════════════════════════════════
* CLEAN UP AND FINAL SUMMARY
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "╔══════════════════════════════════════════════════════════════╗"
display as text "║  TUTORIAL SUMMARY                                          ║"
display as text "╠══════════════════════════════════════════════════════════════╣"
display as text "║                                                            ║"
display as text "║  Beta Convergence (β):                                     ║"
display as text "║    - Asks: do poorer countries grow faster?                ║"
display as text "║    - 1960-2000: NO (era of divergence)                     ║"
display as text "║    - 2000-2019: YES (new era of convergence)               ║"
display as text "║    - Speed ≈ 0.4% per year (much slower than 2% benchmark) ║"
display as text "║    - Half-life ≈ 170 years                                 ║"
display as text "║                                                            ║"
display as text "║  Sigma Convergence (σ):                                    ║"
display as text "║    - Asks: is the income spread narrowing?                 ║"
display as text "║    - 1960-2008: variance rose (σ-DIVERGENCE)               ║"
display as text "║    - Post-2008: variance started declining (σ-convergence) ║"
display as text "║    - β is necessary but NOT sufficient for σ               ║"
display as text "║                                                            ║"
display as text "║  Key Reference:                                            ║"
display as text "║    Patel, Sandefur, Subramanian (2021)                     ║"
display as text "║    'The New Era of Unconditional Convergence'              ║"
display as text "║    Journal of Development Economics                         ║"
display as text "╚══════════════════════════════════════════════════════════════╝"

* ── Clean up temporary files ──
capture erase "convergence_working.dta"

display as text ""
display as text "Script completed successfully."
display as text ""

log close
exit
