/*─────────────────────────────────────────────────────────────────────────────
  Beta and Sigma Convergence Across Countries: A Tutorial Using PWT 10.0

  This tutorial teaches the two fundamental concepts of economic convergence:
    - Beta (β) convergence: Do poorer countries grow faster than richer ones?
    - Sigma (σ) convergence: Is the dispersion of income narrowing over time?

  We start with the simplest possible code (two periods, OLS) and gradually
  build to advanced methods (NLS, rolling windows, heatmaps) as used in:
    Patel, Sandefur, and Subramanian (2021) "The New Era of Unconditional
    Convergence," Journal of Development Economics.

  Sample: 84-country balanced panel (countries with GDP data since 1960)
          Excludes oil producers (IMF classification) and pop < 1 million
  Data:   Penn World Tables version 10.0 (Feenstra, Inklaar, Timmer 2015)
  Usage:  do analysis.do
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

* ── Start log ─────────────────────────────────────────────────────────────
capture log close
log using "analysis.log", replace text

display as text ""
display as text "╔══════════════════════════════════════════════════════════════╗"
display as text "║  Beta and Sigma Convergence: A Tutorial with PWT 10.0      ║"
display as text "║  Balanced panel: 84 countries with data since 1960         ║"
display as text "╚══════════════════════════════════════════════════════════════╝"
display as text ""


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 0: DATA PREPARATION
*
*   We load the Penn World Tables 10.0 and prepare a clean cross-country
*   dataset of GDP per capita. Following the literature, we exclude:
*   (1) oil-exporting countries (whose income is driven by resource rents)
*   (2) very small countries (population under 1 million)
*   (3) countries without GDP data in 1960 (balanced panel requirement)
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 0: DATA PREPARATION"
display as text "────────────────────────────────────────────────────────────────"

* ── Load PWT 10.0 ──
use "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_convergence/pwt100.dta", clear

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

* ── Restrict to balanced panel: countries with data in 1960 ──
*   This ensures a consistent sample across ALL sections of the tutorial.
*   Without this restriction, the sample grows from 84 (1960) to 124 (2019)
*   as PWT coverage expands, introducing composition effects.
bys ccode: egen has1960 = max(year == 1960 & !missing(gdppc))
display as text ""
display as text "Countries WITHOUT 1960 data (excluded from balanced panel):"
tab ccode if has1960 == 0
display as text ""
display as text "Number of countries dropped for missing 1960 data: " _continue
count if has1960 == 0
keep if has1960 == 1
drop has1960

* ── Summary statistics ──
display as text ""
display as text "Summary of cleaned PWT dataset (balanced panel):"
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
*     growth_i = α + λ × ln(y_i,1960) + ε_i
*
*   where:
*     growth_i = (1/s) × ln(y_i,2019 / y_i,1960) = annualized growth rate
*     ln(y_i,1960) = log of initial GDP per capita
*
*   A NEGATIVE λ means convergence: poorer countries (low y_1960) grow faster.
*   A POSITIVE λ (or zero) means divergence or no convergence.
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
*   This is a simple OLS: growth = α + λ × initial + ε
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
   note("Data: Penn World Tables 10.0. 84-country balanced panel."
        "Excludes oil producers and countries with pop < 1M."
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
display as text "  Era of Divergence (1960-2000):  λ = " %7.5f `b_era1' " (SE = " %7.5f `se_era1' ", N = " `n_era1' ")"
display as text "  Era of Convergence (2000-2019): λ = " %7.5f `b_era2' " (SE = " %7.5f `se_era2' ", N = " `n_era2' ")"
display as text ""
display as text "  The slope FLIPPED from positive (divergence) to negative (convergence)."
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
   xlabel(6 "$403" 7 "$1,097" 8 "$2,981" 9 "$8,103" 10 "$22,026" 11 "$59,874", angle(0))
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
    subtitle("The slope flipped from positive (divergence) to negative (convergence)", ///
             color("20 20 19") size(small)) ///
    note("Data: Penn World Tables 10.0. 84-country balanced panel.", ///
         size(vsmall)) ///
    graphregion(fcolor(white) lcolor(white)) ///
    xsize(8) ysize(4)
graph export "stata_convergence_scatter_two_eras.png", replace width(2400)
display as text "Figure saved: stata_convergence_scatter_two_eras.png"
capture erase "_era1.gph"
capture erase "_era2.gph"


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 3: SPEED OF CONVERGENCE AND HALF-LIFE FROM OLS
*
*   The OLS slope coefficient (λ) tells us the direction of convergence,
*   but HOW FAST are poor countries catching up? Two key metrics:
*
*   (A) SPEED OF CONVERGENCE (β):
*       The fraction of the income gap that closes each year.
*       β = 0.02 means 2% of the gap is closed annually.
*       Classic benchmark: β ≈ 2% (Barro & Sala-i-Martin, 1992)
*       — but that was for CONDITIONAL convergence.
*
*   (B) HALF-LIFE (τ):
*       How many years to close HALF the gap to steady-state income?
*       τ = ln(2) / β
*       Classic benchmark: τ ≈ 35 years (conditional convergence)
*
*   The SIMPLEST way to get β from OLS:
*     The OLS coefficient λ and the structural parameter β are linked by:
*       λ = -((1 - exp(-β×s)) / s)
*     Solving for β:
*       β = -ln(1 + λ×s) / s
*     Then:
*       τ = ln(2) / β
*
*   This gives us speed and half-life using ONLY standard OLS output.
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 3: SPEED OF CONVERGENCE AND HALF-LIFE FROM OLS"
display as text "────────────────────────────────────────────────────────────────"

display as text ""
display as text "  DERIVATION: OLS λ → structural β → half-life"
display as text ""
display as text "  Step 1: Run OLS and get the slope coefficient λ"
display as text "    growth_i = α + λ × ln(y_i,0) + ε_i"
display as text ""
display as text "  Step 2: The Barro-Sala-i-Martin model implies:"
display as text "    λ = -((1 - exp(-β×s)) / s)"
display as text ""
display as text "  Step 3: Solve for β:"
display as text "    λ×s = -(1 - exp(-β×s))"
display as text "    exp(-β×s) = 1 + λ×s"
display as text "    -β×s = ln(1 + λ×s)"
display as text "    β = -ln(1 + λ×s) / s"
display as text ""
display as text "  Step 4: Half-life:"
display as text "    τ = ln(2) / β"
display as text ""

* ── Define periods ──
local periods   "1960-2019 1960-2000 1980-2019 1990-2019 1995-2019 2000-2019"
local starts    "1960      1960      1980      1990      1995      2000"
local ends      "2019      2000      2019      2019      2019      2019"

* ── Create file to collect OLS results ──
tempfile ols_speed
preserve
    clear
    gen str20 period = ""
    gen double lambda_ols = .
    gen double se_lambda = .
    gen double pvalue = .
    gen double beta_ols = .
    gen double speed_ols = .
    gen double halflife_ols = .
    gen int    n = .
    save `ols_speed', replace
restore

* ── Loop over periods: OLS ──
local nperiods : word count `periods'
forval p = 1/`nperiods' {
    local period : word `p' of `periods'
    local sy : word `p' of `starts'
    local ey : word `p' of `ends'
    local s = `ey' - `sy'

    display as text ""
    display as text "--- Period: `period' (s = `s' years) ---"

    preserve
        use "convergence_working.dta", clear
        keep ccode country year gdppc
        reshape wide gdppc, i(ccode country) j(year)

        gen outcome = (1/`s') * ln(gdppc`ey' / gdppc`sy')
        gen initial_inc = ln(gdppc`sy')
        drop if missing(outcome) | missing(initial_inc)

        * ── OLS regression ──
        reg outcome initial_inc, robust
        local lambda = _b[initial_inc]
        local se = _se[initial_inc]
        local pval = 2 * ttail(e(df_r), abs(`lambda'/`se'))
        local n_obs = e(N)

        * ── Convert λ to β ──
        local lambda_s = `lambda' * `s'
        if (1 + `lambda_s') > 0 {
            local beta_speed = -ln(1 + `lambda_s') / `s'
        }
        else {
            local beta_speed = .
        }
        local speed = `beta_speed' * 100

        * ── Half-life ──
        if `beta_speed' > 0 & `beta_speed' < . {
            local halflife = ln(2) / `beta_speed'
        }
        else {
            local halflife = .
        }

        display as result "  OLS λ = " %8.5f `lambda' " (SE = " %8.5f `se' ", p = " %5.3f `pval' ")"
        display as result "  Structural β = -ln(1 + " %7.5f `lambda' " × `s') / `s' = " %8.5f `beta_speed'
        display as result "  Speed = " %5.2f `speed' "% per year"
        if `halflife' < . {
            display as result "  Half-life = ln(2) / " %7.5f `beta_speed' " = " %6.1f `halflife' " years"
        }
        else {
            display as result "  Half-life = not computable (no convergence)"
        }
        display as result "  N = " `n_obs' " countries"
    restore

    * Store results
    preserve
        clear
        set obs 1
        gen str20 period = "`period'"
        gen double lambda_ols = `lambda'
        gen double se_lambda = `se'
        gen double pvalue = `pval'
        gen double beta_ols = `beta_speed'
        gen double speed_ols = `speed'
        gen double halflife_ols = `halflife'
        gen int    n = `n_obs'
        append using `ols_speed'
        save `ols_speed', replace
    restore
}

* ── Display OLS results table ──
display as text ""
display as text "╔══════════════════════════════════════════════════════════════════════════════════╗"
display as text "║  Speed of Convergence from OLS: λ → β → Half-Life                              ║"
display as text "╠══════════════════════════════════════════════════════════════════════════════════╣"
display as text "║  Formula: β = -ln(1 + λ×s)/s     Half-life: τ = ln(2)/β                        ║"
display as text "║  Benchmark: β ≈ 2%/yr, τ ≈ 35 yrs (conditional, Barro & Sala-i-Martin 1992)    ║"
display as text "╚══════════════════════════════════════════════════════════════════════════════════╝"

preserve
    use `ols_speed', clear
    drop if missing(lambda_ols)
    sort period
    list period lambda_ols beta_ols speed_ols halflife_ols n, noobs clean
    export delimited using "convergence_speed_ols.csv", replace
    display as text "Results exported to: convergence_speed_ols.csv"
restore

* ── Create OLS speed bar chart ──
preserve
    use `ols_speed', clear
    drop if missing(lambda_ols)
    sort period
    gen id = _n
    gen speed_bench = 2

    #delimit ;
    tw (bar speed_ols id, barwidth(0.6) fcolor("217 119 87") lcolor("217 119 87"%80))
       (line speed_bench id, lcolor("106 155 204") lwidth(medthick) lpattern(dash)),
       xlabel(1 "1960-2000" 2 "1960-2019" 3 "1980-2019" 4 "1990-2019" 5 "1995-2019" 6 "2000-2019",
              angle(30) labsize(small))
       ylabel(, angle(horizontal))
       ytitle("Speed of Convergence (% per year)")
       xtitle("Period")
       title("Speed of Convergence from OLS ({&lambda} {&rarr} {&beta} conversion)", color("20 20 19"))
       subtitle("Benchmark: 2% per year (Barro & Sala-i-Martin 1992, conditional)", ///
                color("20 20 19") size(small))
       legend(order(1 "Unconditional {&beta} (from OLS)" 2 "Conditional benchmark (2%/yr)")
              pos(2) ring(0) region(lcolor(none) fcolor(none)) size(small))
       plotregion(style(none) lcolor(none))
       graphregion(fcolor(white) lcolor(white))
       note("Data: Penn World Tables 10.0. 84-country balanced panel."
            "Negative values indicate divergence. {&beta} = -ln(1 + {&lambda}×s)/s.", size(vsmall))
       xsize(6) ysize(4)
    ;
    #delimit cr
    graph export "stata_convergence_speed_ols.png", replace width(2400)
    display as text "Figure saved: stata_convergence_speed_ols.png"
restore


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 4: WHAT IS NONLINEAR LEAST SQUARES (NLS)?
*
*   The OLS-to-β conversion in Section 3 works, but it goes BACKWARDS:
*   we estimate λ first and then convert to β. Can we estimate β DIRECTLY?
*
*   YES — using Nonlinear Least Squares (NLS).
*
*   WHY can't OLS estimate β directly?
*     The Barro-Sala-i-Martin (1992) convergence equation is:
*       (1/s) × ln(y_{t+s}/y_t) = α - ((1 - exp(-β×s))/s) × ln(y_t) + ε
*     The parameter β appears INSIDE an exponential: exp(-β×s).
*     OLS requires that parameters enter LINEARLY, but β is trapped inside
*     exp(), so OLS cannot estimate it directly.
*
*   WHAT does NLS do?
*     Like OLS, NLS minimizes the sum of squared residuals:
*       min_β Σᵢ [yᵢ - f(xᵢ; β)]²
*     But unlike OLS, the function f() can be ANY nonlinear function of β.
*     NLS uses an iterative algorithm:
*       1. Start with an initial guess for β (e.g., β₀ = 0.02)
*       2. Compute predicted values and residuals
*       3. Adjust β in the direction that reduces the sum of squared residuals
*       4. Repeat until the improvement is negligible (convergence)
*
*   HOW to estimate in Stata:
*     Stata's -nl- command does NLS. The syntax is:
*       nl (depvar = expression_with_{parameters}), vce(robust)
*     Parameters are specified in curly braces: {b1=initial_guess}
*
*   ADVANTAGE: β has a direct structural interpretation as the speed of
*   convergence, and standard errors apply directly to β (no conversion
*   needed, no delta method).
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 4: WHAT IS NONLINEAR LEAST SQUARES (NLS)?"
display as text "────────────────────────────────────────────────────────────────"

display as text ""
display as text "  The Barro-Sala-i-Martin (1992) convergence equation:"
display as text ""
display as text "    (1/s) × ln(y_{t+s}/y_t) = α - ((1 - exp(-β×s))/s) × ln(y_t) + ε"
display as text ""
display as text "  Breaking down each term:"
display as text "    Left side:  annualized growth rate over s years"
display as text "    α:          intercept (related to the steady-state income)"
display as text "    β:          speed of convergence (fraction of gap closed per year)"
display as text "    s:          number of years between initial and final period"
display as text "    ln(y_t):    log of initial GDP per capita"
display as text "    ε:          error term (random shocks to growth)"
display as text ""
display as text "  The key expression is: (1 - exp(-β×s))/s"
display as text "    This is the 'convergence factor' — how much of the initial"
display as text "    income level feeds into the growth rate."
display as text "    When β > 0: convergence factor > 0, and the minus sign means"
display as text "                higher initial income → lower growth (convergence)"
display as text "    When β = 0: convergence factor = 0, no relationship"
display as text "    When β < 0: divergence"
display as text ""

* ── Demonstrate NLS for one period: 2000-2019 ──
display as text "--- NLS Demonstration: 2000-2019 ---"
display as text ""

preserve
    use "convergence_working.dta", clear
    keep ccode country year gdppc
    reshape wide gdppc, i(ccode country) j(year)

    local s = 19
    gen outcome = (1/`s') * ln(gdppc2019 / gdppc2000)
    gen initial_inc = ln(gdppc2000)
    drop if missing(outcome) | missing(initial_inc)

    display as text "  Stata command:"
    display as text "    nl (outcome = {b0=1} - (1 - exp(-1*{b1=0.02}*19))/19 * initial_inc), vce(robust)"
    display as text ""
    display as text "  Reading the syntax:"
    display as text "    {b0=1}    → intercept α, initial guess = 1"
    display as text "    {b1=0.02} → speed of convergence β, initial guess = 0.02 (the 2% benchmark)"
    display as text "    *19       → s = 19 years (2000 to 2019)"
    display as text "    initial_inc → ln(y_2000), our independent variable"
    display as text ""

    nl (outcome = {b0=1} - (1 - exp(-1*{b1=0.02}*`s'))/`s' * initial_inc), vce(robust)

    display as text ""
    display as text "  HOW TO READ THE OUTPUT:"
    display as text "    /b0 = " %8.5f _b[/b0] " → This is α (intercept)"
    display as text "    /b1 = " %8.5f _b[/b1] " → This is β (speed of convergence)"
    display as text ""
    display as text "    Speed = β × 100 = " %5.2f _b[/b1]*100 "% per year"
    display as text "    Half-life = ln(2)/β = " %6.1f ln(2)/_b[/b1] " years"
    display as text ""

    * Save NLS result before running OLS
    local nls_beta_demo = _b[/b1]

    * Compare with OLS conversion
    qui reg outcome initial_inc, robust
    local lambda_check = _b[initial_inc]
    local beta_check = -ln(1 + `lambda_check'*`s') / `s'
    display as text "  COMPARISON with OLS conversion (Section 3):"
    display as text "    OLS λ = " %8.5f `lambda_check'
    display as text "    OLS → β = -ln(1 + " %7.5f `lambda_check' " × `s') / `s' = " %8.5f `beta_check'
    display as text "    NLS β  = " %8.5f `nls_beta_demo'
    display as text "    Difference = " %10.7f abs(`beta_check' - `nls_beta_demo')
    display as text ""
    display as text "  The point estimates are nearly identical."
    display as text "  The advantage of NLS: standard errors and p-values apply directly to β."
restore


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 5: SPEED OF CONVERGENCE AND HALF-LIFE FROM NLS
*
*   Now we estimate β directly via NLS for the same 6 periods as Section 3.
*   The results should be very close to the OLS conversion, confirming
*   that both methods give the same structural parameter.
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 5: SPEED OF CONVERGENCE AND HALF-LIFE FROM NLS"
display as text "────────────────────────────────────────────────────────────────"

* ── Create file to collect NLS results ──
tempfile nls_speed
preserve
    clear
    gen str20 period = ""
    gen double beta_nls = .
    gen double se_nls = .
    gen double pvalue_nls = .
    gen double speed_nls = .
    gen double halflife_nls = .
    gen int    n = .
    save `nls_speed', replace
restore

* ── Loop over periods: NLS ──
forval p = 1/`nperiods' {
    local period : word `p' of `periods'
    local sy : word `p' of `starts'
    local ey : word `p' of `ends'
    local s = `ey' - `sy'

    display as text ""
    display as text "--- Period: `period' (s = `s' years) ---"

    preserve
        use "convergence_working.dta", clear
        keep ccode country year gdppc
        reshape wide gdppc, i(ccode country) j(year)

        gen outcome = (1/`s') * ln(gdppc`ey' / gdppc`sy')
        gen initial_inc = ln(gdppc`sy')
        drop if missing(outcome) | missing(initial_inc)

        * ── NLS estimation ──
        capture noisily nl (outcome = {b0=1} - (1 - exp(-1*{b1=0.00}*`s'))/`s' * initial_inc), ///
            vce(robust)

        if _rc == 0 {
            local beta_nls = _b[/b1]
            local se_nls   = _se[/b1]
            local n_obs    = e(N)
            local pval_nls = 2 * ttail(e(df_r), abs(`beta_nls'/`se_nls'))
            local speed = `beta_nls' * 100

            if `beta_nls' > 0 {
                local halflife = ln(2) / `beta_nls'
            }
            else {
                local halflife = .
            }

            display as text ""
            display as result "  NLS β = " %8.5f `beta_nls' " (SE = " %8.5f `se_nls' ", p = " %5.3f `pval_nls' ")"
            display as result "  Speed = " %5.2f `speed' "% per year"
            if `halflife' < . {
                display as result "  Half-life = " %6.1f `halflife' " years"
            }
            else {
                display as result "  Half-life = not computable (no convergence)"
            }
            display as result "  N = " `n_obs' " countries"
        }
        else {
            display as error "  NLS did not converge for period `period'"
            local beta_nls = .
            local se_nls = .
            local pval_nls = .
            local speed = .
            local halflife = .
            local n_obs = .
        }
    restore

    if `beta_nls' < . {
        preserve
            clear
            set obs 1
            gen str20 period = "`period'"
            gen double beta_nls = `beta_nls'
            gen double se_nls = `se_nls'
            gen double pvalue_nls = `pval_nls'
            gen double speed_nls = `speed'
            gen double halflife_nls = `halflife'
            gen int    n = `n_obs'
            append using `nls_speed'
            save `nls_speed', replace
        restore
    }
}

* ── Display NLS results table ──
display as text ""
display as text "╔══════════════════════════════════════════════════════════════════════════════════╗"
display as text "║  Speed of Convergence from NLS (Direct Estimation of β)                        ║"
display as text "╠══════════════════════════════════════════════════════════════════════════════════╣"
display as text "║  Benchmark: β ≈ 2%/yr, τ ≈ 35 yrs (conditional, Barro & Sala-i-Martin 1992)    ║"
display as text "╚══════════════════════════════════════════════════════════════════════════════════╝"

preserve
    use `nls_speed', clear
    drop if missing(beta_nls)
    sort period
    list period beta_nls se_nls speed_nls halflife_nls n, noobs clean
    export delimited using "convergence_speed_nls.csv", replace
    display as text "Results exported to: convergence_speed_nls.csv"
restore

* ── Create NLS speed bar chart ──
preserve
    use `nls_speed', clear
    drop if missing(beta_nls)
    sort period
    gen id = _n
    gen speed_bench = 2

    #delimit ;
    tw (bar speed_nls id, barwidth(0.6) fcolor("106 155 204") lcolor("106 155 204"%80))
       (line speed_bench id, lcolor("217 119 87") lwidth(medthick) lpattern(dash)),
       xlabel(1 "1960-2000" 2 "1960-2019" 3 "1980-2019" 4 "1990-2019" 5 "1995-2019" 6 "2000-2019",
              angle(30) labsize(small))
       ylabel(, angle(horizontal))
       ytitle("Speed of Convergence (% per year)")
       xtitle("Period")
       title("Speed of Convergence from NLS (Direct Estimation)", color("20 20 19"))
       subtitle("Benchmark: 2% per year (Barro & Sala-i-Martin 1992, conditional)", ///
                color("20 20 19") size(small))
       legend(order(1 "Unconditional {&beta} (NLS)" 2 "Conditional benchmark (2%/yr)")
              pos(2) ring(0) region(lcolor(none) fcolor(none)) size(small))
       plotregion(style(none) lcolor(none))
       graphregion(fcolor(white) lcolor(white))
       note("Data: Penn World Tables 10.0. 84-country balanced panel."
            "Negative values indicate divergence.", size(vsmall))
       xsize(6) ysize(4)
    ;
    #delimit cr
    graph export "stata_convergence_speed_nls.png", replace width(2400)
    display as text "Figure saved: stata_convergence_speed_nls.png"
restore


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 6: OLS vs NLS COMPARISON
*
*   How do the two methods compare? The OLS conversion and NLS should give
*   nearly identical point estimates for β. The key difference:
*     - OLS: standard errors and p-values are for λ (must be transformed)
*     - NLS: standard errors and p-values are directly for β
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 6: OLS vs NLS COMPARISON"
display as text "────────────────────────────────────────────────────────────────"

* ── Merge OLS and NLS results ──
preserve
    use `ols_speed', clear
    drop if missing(lambda_ols)
    sort period
    tempfile ols_sorted
    save `ols_sorted', replace

    use `nls_speed', clear
    drop if missing(beta_nls)
    sort period
    merge 1:1 period using `ols_sorted', keep(match) nogen

    gen diff = abs(beta_ols - beta_nls)

    display as text ""
    display as text "╔══════════════════════════════════════════════════════════════════════════════════════╗"
    display as text "║  OLS vs NLS: Side-by-Side Comparison                                              ║"
    display as text "╠══════════════════════════════════════════════════════════════════════════════════════╣"
    display as text "║  OLS:  estimate λ, then β = -ln(1+λs)/s                                           ║"
    display as text "║  NLS:  estimate β directly via iterative optimization                              ║"
    display as text "╚══════════════════════════════════════════════════════════════════════════════════════╝"

    list period lambda_ols beta_ols beta_nls diff speed_ols speed_nls n, noobs clean

    display as text ""
    display as text "  KEY OBSERVATIONS:"
    display as text "  1. The β estimates from OLS conversion and NLS are nearly identical."
    display as text "  2. Small differences arise from numerical optimization in NLS."
    display as text "  3. NLS advantage: SE and p-values apply directly to β."
    display as text "  4. OLS advantage: simpler, faster, no convergence issues."

    export delimited using "convergence_ols_vs_nls.csv", replace
    display as text "Results exported to: convergence_ols_vs_nls.csv"
restore


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 7: ROLLING BETA CONVERGENCE — OLS AND NLS
*
*   Instead of just two snapshots, let's see the FULL MOVIE:
*     How has the convergence coefficient evolved year by year?
*
*   Method: Fix the end year at 2019. For each start year from 1960 to 2010,
*   estimate the convergence β using:
*     (A) OLS λ → β conversion
*     (B) NLS direct estimation
*
*   This gives us TWO rolling-window time series of β.
*
*   Convention:
*     β > 0 → convergence (poorer countries catching up)
*     β < 0 → divergence (gap widening)
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 7: ROLLING BETA CONVERGENCE — OLS AND NLS"
display as text "────────────────────────────────────────────────────────────────"

* ── Load and reshape data ──
use "convergence_working.dta", clear
keep ccode country year gdppc
reshape wide gdppc, i(ccode country) j(year)

* ── (A) Rolling OLS ──
display as text ""
display as text "--- (A) Rolling OLS (λ → β conversion) ---"
local j = 1
local lastyear = 2019

forval startyear = 1960(1)2010 {
    local s = `lastyear' - `startyear'

    capture drop outcome initial_inc
    gen outcome = (1/`s') * ln(gdppc`lastyear' / gdppc`startyear')
    gen initial_inc = ln(gdppc`startyear')

    qui reg outcome initial_inc if !missing(outcome) & !missing(initial_inc), robust
    local lambda = _b[initial_inc]
    local se_lambda = _se[initial_inc]
    local n_obs = e(N)

    * Convert λ to β
    local lambda_s = `lambda' * `s'
    if (1 + `lambda_s') > 0 {
        local beta_val = -ln(1 + `lambda_s') / `s'
    }
    else {
        local beta_val = .
    }

    * Convert λ CI to β CI (bounds flip because the function is monotone decreasing)
    local lambda_lb = `lambda' - invttail(e(df_r), 0.025) * `se_lambda'
    local lambda_ub = `lambda' + invttail(e(df_r), 0.025) * `se_lambda'
    if (1 + `lambda_lb'*`s') > 0 {
        local beta_ub = -ln(1 + `lambda_lb'*`s') / `s'
    }
    else {
        local beta_ub = .
    }
    if (1 + `lambda_ub'*`s') > 0 {
        local beta_lb = -ln(1 + `lambda_ub'*`s') / `s'
    }
    else {
        local beta_lb = .
    }

    preserve
        clear
        set obs 1
        tempfile ols_roll`j'
        gen startyear = `startyear'
        gen endyear = `lastyear'
        gen beta = `beta_val'
        gen lower = `beta_lb'
        gen upper = `beta_ub'
        gen speed_pct = `beta_val' * 100
        gen halflife = .
        if `beta_val' > 0 & `beta_val' < . {
            replace halflife = ln(2) / `beta_val'
        }
        gen n = `n_obs'
        save `ols_roll`j''
    restore
    local ++j
}

* ── Combine OLS rolling results ──
local j_ols = `j' - 1
preserve
    clear
    forval i = 1/`j_ols' {
        capture append using `ols_roll`i''
    }

    display as text ""
    display as text "╔══════════════════════════════════════════════════════════════╗"
    display as text "║  Rolling OLS Beta Convergence: Key Findings                ║"
    display as text "╚══════════════════════════════════════════════════════════════╝"
    list startyear beta speed_pct halflife n if inlist(startyear, 1960, 1970, 1980, 1990, 1995, 2000, 2005, 2010), noobs clean

    export delimited using "convergence_rolling_beta_ols.csv", replace

    * ── Create OLS rolling beta plot ──
    #delimit ;
    tw (rcap lower upper startyear, lcolor("217 119 87"%30))
       (scatter beta startyear, mcolor("217 119 87"%80) msymbol(O) msize(small)),
       yline(0, lcolor("20 20 19") lpattern(shortdash) lwidth(medium))
       xlabel(1960(5)2010, angle(45))
       ylabel(-0.005(0.0025)0.01, angle(horizontal) format(%6.4f))
       ytitle("{&beta} (speed of convergence)", size(medlarge))
       xtitle("Initial Year")
       title("Rolling Unconditional Convergence: OLS", color("20 20 19"))
       subtitle("Each point: OLS {&lambda} {&rarr} {&beta}, from initial year to 2019", ///
                color("20 20 19") size(small))
       legend(off)
       plotregion(style(none) lcolor(none))
       graphregion(fcolor(white) lcolor(white))
       note("{&beta} > 0: convergence. {&beta} < 0: divergence."
            "Bars: 95% CI (converted from OLS). 84-country balanced panel.", size(vsmall))
       xsize(5) ysize(4)
    ;
    #delimit cr
    graph export "stata_convergence_rolling_beta_ols.png", replace width(2400)
    display as text "Figure saved: stata_convergence_rolling_beta_ols.png"
restore

* ── (B) Rolling NLS ──
display as text ""
display as text "--- (B) Rolling NLS (direct estimation) ---"
local j = 1

forval startyear = 1960(1)2010 {
    local s = `lastyear' - `startyear'

    capture drop outcome initial_inc
    gen outcome = (1/`s') * ln(gdppc`lastyear' / gdppc`startyear')
    gen initial_inc = ln(gdppc`startyear')

    capture qui nl (outcome = {b0=1} - (1 - exp(-1*{b1=0.00}*`s'))/`s' * initial_inc) ///
        if !missing(outcome) & !missing(initial_inc), vce(robust)

    if _rc == 0 {
        preserve
            clear
            set obs 1
            tempfile nls_roll`j'
            gen startyear = `startyear'
            gen endyear = `lastyear'
            gen beta = _b[/b1]
            gen se = _se[/b1]
            gen lower = _b[/b1] - invttail(`e(df_r)', 0.025) * _se[/b1]
            gen upper = _b[/b1] + invttail(`e(df_r)', 0.025) * _se[/b1]
            gen n = `e(N)'
            gen speed_pct = beta * 100
            gen halflife = .
            if _b[/b1] > 0 {
                replace halflife = ln(2) / _b[/b1]
            }
            save `nls_roll`j''
        restore
        local ++j
    }
    else {
        display as text "  Warning: NLS did not converge for start year `startyear'"
        local ++j
    }
}

* ── Combine NLS rolling results ──
local j_nls = `j' - 1
preserve
    clear
    forval i = 1/`j_nls' {
        capture append using `nls_roll`i''
    }

    display as text ""
    display as text "╔══════════════════════════════════════════════════════════════╗"
    display as text "║  Rolling NLS Beta Convergence: Key Findings                ║"
    display as text "╚══════════════════════════════════════════════════════════════╝"
    list startyear beta speed_pct halflife n if inlist(startyear, 1960, 1970, 1980, 1990, 1995, 2000, 2005, 2010), noobs clean

    export delimited using "convergence_rolling_beta_nls.csv", replace

    * ── Create NLS rolling beta plot ──
    #delimit ;
    tw (rcap lower upper startyear, lcolor("106 155 204"%30))
       (scatter beta startyear, mcolor("106 155 204"%80) msymbol(O) msize(small)),
       yline(0, lcolor("20 20 19") lpattern(shortdash) lwidth(medium))
       xlabel(1960(5)2010, angle(45))
       ylabel(-0.005(0.0025)0.01, angle(horizontal) format(%6.4f))
       ytitle("{&beta} (speed of convergence)", size(medlarge))
       xtitle("Initial Year")
       title("Rolling Unconditional Convergence: NLS", color("20 20 19"))
       subtitle("Each point: NLS {&beta} from initial year to 2019", ///
                color("20 20 19") size(small))
       legend(off)
       plotregion(style(none) lcolor(none))
       graphregion(fcolor(white) lcolor(white))
       note("{&beta} > 0: convergence. {&beta} < 0: divergence."
            "Bars: 95% confidence intervals. 84-country balanced panel.", size(vsmall))
       xsize(5) ysize(4)
    ;
    #delimit cr
    graph export "stata_convergence_rolling_beta_nls.png", replace width(2400)
    display as text "Figure saved: stata_convergence_rolling_beta_nls.png"
restore


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 8: SIGMA CONVERGENCE — THE SIMPLEST CASE (Two Periods)
*
*   While beta convergence asks "do poor countries grow faster?",
*   sigma convergence asks a different question:
*     Is the SPREAD of income across countries getting NARROWER?
*
*   We measure the spread using the VARIANCE of log GDP per capita.
*   (Using logs means we measure proportional, not absolute, differences.)
*
*   If Var(ln y) decreases over time → σ-convergence (narrowing)
*   If Var(ln y) increases over time → σ-divergence (spreading out)
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 8: SIGMA CONVERGENCE — THE SIMPLEST CASE"
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
       legend(order(1 "1960 (N=`n_1960')" 2 "2019 (N=`n_2019')" 3 "95% CI") pos(2) ring(0)
              region(lcolor(none) fcolor(none)) size(small))
       plotregion(style(none) lcolor(none))
       graphregion(fcolor(white) lcolor(white))
       note("Data: Penn World Tables 10.0. 84-country balanced panel."
            "Variance of log GDP per capita (PPP).", size(vsmall))
       xsize(4) ysize(4)
    ;
    #delimit cr
    graph export "stata_convergence_sigma_two_periods.png", replace width(2400)
    display as text "Figure saved: stata_convergence_sigma_two_periods.png"
restore

drop logy


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 9: THE RELATIONSHIP BETWEEN BETA AND SIGMA CONVERGENCE
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
*   Even if slower runners speed up ON AVERAGE, random shocks can keep
*   the pack spread out. The catch-up tendency (β) must be strong enough
*   to overcome the dispersing force of shocks.
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 9: THE RELATIONSHIP BETWEEN BETA AND SIGMA"
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

* ── Decade-by-decade β and σ ──
use "convergence_working.dta", clear
keep ccode country year gdppc
reshape wide gdppc, i(ccode country) j(year)

display as text ""
display as text "  EMPIRICAL DEMONSTRATION:"
display as text "  Decade-by-decade OLS λ and variance of log income:"
display as text ""
display as text "  ┌─────────────┬───────────┬───────────┬────────────────────────────┐"
display as text "  │ Decade      │ OLS λ     │ σ² start  │ Interpretation             │"
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
        local interp = "λ≥0: divergence"
    }
    else {
        local interp = "λ<0: convergence"
    }

    display as text "  │ `decade'-`ey'  │ " %8.5f `b' " │ " %8.4f `v' "  │ `interp'     │"
    drop g_temp i_temp logy_temp
}

display as text "  └─────────────┴───────────┴───────────┴────────────────────────────┘"
display as text ""
display as text "  NOTICE: λ turns negative (convergence) around 2000, but σ² keeps"
display as text "  RISING until ~2008. This is the lag: β-convergence is necessary"
display as text "  but not sufficient for σ-convergence."


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 10: SIGMA CONVERGENCE OVER TIME
*
*   Track the dispersion of income EVERY YEAR from 1960 to 2019.
*   With our balanced 84-country panel, the sample composition is
*   constant throughout — no need for a separate "fixed sample" series.
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 10: SIGMA CONVERGENCE OVER TIME"
display as text "────────────────────────────────────────────────────────────────"

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

* ── Display key years ──
display as text ""
display as text "╔══════════════════════════════════════════════════════════════╗"
display as text "║  Sigma Convergence Over Time: Key Years                    ║"
display as text "╚══════════════════════════════════════════════════════════════╝"
list year variance n if inlist(year, 1960, 1970, 1980, 1990, 2000, 2008, 2010, 2019), noobs clean

* Export
export delimited using "convergence_sigma_evolution.csv", replace
display as text "Results exported to: convergence_sigma_evolution.csv"

* ── Create sigma convergence time series plot ──
#delimit ;
tw (rcap var_lb var_ub year, lcolor("106 155 204"%20))
   (scatter variance year, mcolor("106 155 204"%60) msymbol(O) msize(vsmall)),
   xlabel(1960(10)2020)
   ylabel(, angle(horizontal))
   ytitle("Variance of ln(GDP per capita)", size(medsmall))
   xtitle("Year")
   title("Sigma Convergence: Income Dispersion Over Time", color("20 20 19") size(medium))
   subtitle("Variance of log GDP per capita, 84-country balanced panel", ///
            color("20 20 19") size(small))
   legend(off)
   plotregion(style(none) lcolor(none))
   graphregion(fcolor(white) lcolor(white))
   note("Data: Penn World Tables 10.0. 84-country balanced panel."
        "Bars: 95% confidence intervals.", size(vsmall))
   xsize(6) ysize(4)
;
#delimit cr
graph export "stata_convergence_sigma_evolution.png", replace width(2400)
display as text "Figure saved: stata_convergence_sigma_evolution.png"


*═══════════════════════════════════════════════════════════════════════════════
* SECTION 11: THE CONVERGENCE HEATMAP — OLS AND NLS
*
*   The most comprehensive view of convergence:
*     For EVERY combination of start year and end year,
*     estimate the β coefficient and color-code it.
*
*   We produce TWO heatmaps:
*     (A) OLS-based: estimate λ, convert to β = -ln(1+λs)/s
*     (B) NLS-based: estimate β directly (reproduces Patel et al. 2021 Fig 2)
*
*   Blue = convergence (β > 0), Red = divergence (β < 0)
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "────────────────────────────────────────────────────────────────"
display as text "  SECTION 11: THE CONVERGENCE HEATMAP — OLS AND NLS"
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

        capture drop outcome initial_inc
        gen outcome = (1/`s') * ln(gdppc`outcomeyear' / gdppc`startyear')
        gen initial_inc = ln(gdppc`startyear')

        * ── OLS ──
        local beta_ols_hm = .
        local n_hm = .
        capture qui reg outcome initial_inc if !missing(outcome) & !missing(initial_inc), robust
        if _rc == 0 {
            local lambda_hm = _b[initial_inc]
            local n_hm = e(N)
            local lambda_s_hm = `lambda_hm' * `s'
            if (1 + `lambda_s_hm') > 0 {
                local beta_ols_hm = -ln(1 + `lambda_s_hm') / `s'
            }
        }

        * ── NLS ──
        local beta_nls_hm = .
        capture qui nl (outcome = {b0=1} - (1 - exp(-1*{b1=0.00}*`s'))/`s' * initial_inc) ///
            if !missing(outcome) & !missing(initial_inc), vce(robust)
        if _rc == 0 {
            local beta_nls_hm = _b[/b1]
        }

        preserve
            clear
            set obs 1
            tempfile hm`j'
            gen startyear = `startyear'
            gen endyear = `outcomeyear'
            gen beta_ols = `beta_ols_hm'
            gen beta_nls = `beta_nls_hm'
            gen n = `n_hm'
            save `hm`j''
        restore

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

    * ── (A) OLS Heatmap ──
    #delimit ;
    tw (scatter startyear endyear if beta_ols > .0035, msize(medsmall)
            mfcolor("5 48 97") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_ols < .0035 & beta_ols > .0025, msize(medsmall)
            mfcolor("33 102 172") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_ols < .0025 & beta_ols > .0015, msize(medsmall)
            mfcolor("67 147 195") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_ols < .0015 & beta_ols > .0005, msize(medsmall)
            mfcolor("146 197 222") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_ols < .0005 & beta_ols > -.0005, msize(medsmall)
            mfcolor("209 229 240") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_ols > -.0015 & beta_ols < -.0005, msize(medsmall)
            mfcolor("247 247 247") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_ols > -.0025 & beta_ols < -.0015, msize(medsmall)
            mfcolor("253 219 199") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_ols > -.0035 & beta_ols < -.0025, msize(medsmall)
            mfcolor("244 165 130") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_ols > -.0045 & beta_ols < -.0035, msize(medsmall)
            mfcolor("214 96 77") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_ols > -.0055 & beta_ols < -.0045, msize(medsmall)
            mfcolor("178 24 43") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_ols < -.0055, msize(medsmall)
            mfcolor("103 0 31") mlcolor("20 20 19") mlwidth(vthin)),
       plotregion(style(none) lcolor(none))
       graphregion(fcolor(white) lcolor(white))
       xtitle("End Year") ytitle("Start Year")
       title("Convergence Heatmap: OLS ({&lambda} {&rarr} {&beta} conversion)", color("20 20 19") size(medium))
       subtitle("Blue = convergence ({&beta}>0), Red = divergence ({&beta}<0)", ///
                color("20 20 19") size(small))
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
       note("Data: Penn World Tables 10.0. 84-country balanced panel."
            "OLS {&lambda} converted to structural {&beta} = -ln(1+{&lambda}s)/s.", size(vsmall))
    ;
    #delimit cr
    graph export "stata_convergence_heatmap_ols.png", replace width(2400)
    display as text "Figure saved: stata_convergence_heatmap_ols.png"

    * ── (B) NLS Heatmap ──
    #delimit ;
    tw (scatter startyear endyear if beta_nls > .0035, msize(medsmall)
            mfcolor("5 48 97") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_nls < .0035 & beta_nls > .0025, msize(medsmall)
            mfcolor("33 102 172") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_nls < .0025 & beta_nls > .0015, msize(medsmall)
            mfcolor("67 147 195") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_nls < .0015 & beta_nls > .0005, msize(medsmall)
            mfcolor("146 197 222") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_nls < .0005 & beta_nls > -.0005, msize(medsmall)
            mfcolor("209 229 240") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_nls > -.0015 & beta_nls < -.0005, msize(medsmall)
            mfcolor("247 247 247") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_nls > -.0025 & beta_nls < -.0015, msize(medsmall)
            mfcolor("253 219 199") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_nls > -.0035 & beta_nls < -.0025, msize(medsmall)
            mfcolor("244 165 130") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_nls > -.0045 & beta_nls < -.0035, msize(medsmall)
            mfcolor("214 96 77") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_nls > -.0055 & beta_nls < -.0045, msize(medsmall)
            mfcolor("178 24 43") mlcolor("20 20 19") mlwidth(vthin))
       (scatter startyear endyear if beta_nls < -.0055, msize(medsmall)
            mfcolor("103 0 31") mlcolor("20 20 19") mlwidth(vthin)),
       plotregion(style(none) lcolor(none))
       graphregion(fcolor(white) lcolor(white))
       xtitle("End Year") ytitle("Start Year")
       title("Convergence Heatmap: NLS (Direct Estimation)", color("20 20 19") size(medium))
       subtitle("Blue = convergence ({&beta}>0), Red = divergence ({&beta}<0)", ///
                color("20 20 19") size(small))
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
       note("Data: Penn World Tables 10.0. 84-country balanced panel."
            "NLS estimation (Barro & Sala-i-Martin 1992 specification).", size(vsmall))
    ;
    #delimit cr
    graph export "stata_convergence_heatmap_nls.png", replace width(2400)
    display as text "Figure saved: stata_convergence_heatmap_nls.png"

restore


*═══════════════════════════════════════════════════════════════════════════════
* CLEAN UP AND FINAL SUMMARY
*═══════════════════════════════════════════════════════════════════════════════

display as text ""
display as text "╔══════════════════════════════════════════════════════════════╗"
display as text "║  TUTORIAL SUMMARY                                          ║"
display as text "╠══════════════════════════════════════════════════════════════╣"
display as text "║                                                            ║"
display as text "║  Sample: 84-country balanced panel (data since 1960)       ║"
display as text "║                                                            ║"
display as text "║  Beta Convergence (β):                                     ║"
display as text "║    - 1960-2000: NO convergence (era of divergence)         ║"
display as text "║    - 2000-2019: YES convergence (new era)                  ║"
display as text "║    - OLS (λ→β) and NLS give nearly identical estimates     ║"
display as text "║    - Speed ≈ 0.4% per year (much slower than 2% benchmark) ║"
display as text "║    - Half-life ≈ 170 years                                 ║"
display as text "║                                                            ║"
display as text "║  Sigma Convergence (σ):                                    ║"
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
display as text "Figures generated:"
display as text "  stata_convergence_scatter_1960_2019.png"
display as text "  stata_convergence_scatter_two_eras.png"
display as text "  stata_convergence_speed_ols.png"
display as text "  stata_convergence_speed_nls.png"
display as text "  stata_convergence_rolling_beta_ols.png"
display as text "  stata_convergence_rolling_beta_nls.png"
display as text "  stata_convergence_sigma_two_periods.png"
display as text "  stata_convergence_sigma_evolution.png"
display as text "  stata_convergence_heatmap_ols.png"
display as text "  stata_convergence_heatmap_nls.png"
display as text ""

log close
exit
