/*─────────────────────────────────────────────────────────────────────────────
  Beta and Sigma Convergence: A Minimal Tutorial (PWT 10.0)

  A stripped-down version of analysis.do covering only the two core ideas:
    - Beta convergence: do poorer countries grow faster?
    - Sigma convergence: is income dispersion narrowing over time?

  Sample: 84-country balanced panel, 1960–2019
          (excludes oil producers and pop < 1 million)
  Data:   Penn World Tables 10.0
  Usage:  do analysis_simple.do
─────────────────────────────────────────────────────────────────────────────*/

clear all
set more off
set scheme s2color

capture log close
log using "analysis_simple.log", replace text


*─── 1. Load and prepare the data ────────────────────────────────────────────

use "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_convergence/pwt100.dta", clear

rename countrycode ccode
keep country ccode year pop rgdpe

* GDP per capita (PPP, 2017 US$)
gen gdppc = rgdpe / pop
drop if missing(gdppc) | missing(pop)

* Drop oil producers (income driven by resource rents, not capital accumulation)
gen oil = inlist(ccode, "DZA", "AGO", "AZE", "BHR", "BRN", "TCD", "COG") | ///
          inlist(ccode, "ECU", "GNQ", "GAB", "IRN", "IRQ", "KAZ", "KWT") | ///
          inlist(ccode, "NGA", "OMN", "QAT", "RUS", "SAU", "TTO", "TKM") | ///
          inlist(ccode, "ARE", "VEN", "YEM", "LBY", "TLS", "SDN")
drop if oil == 1
drop oil

* Drop small countries and years before 1960
drop if pop < 1
drop if year < 1960

* Balanced panel: keep only countries with data in 1960
bys ccode: egen has1960 = max(year == 1960 & !missing(gdppc))
keep if has1960 == 1
drop has1960

save "convergence_working_simple.dta", replace


*─── 2. Beta convergence: 1960 vs 2019 ───────────────────────────────────────
*
*   growth_i = α + λ·ln(y_i,1960) + ε_i
*   λ < 0 → poorer countries grew faster (convergence).

use "convergence_working_simple.dta", clear
keep ccode country year gdppc
reshape wide gdppc, i(ccode country) j(year)

local s = 2019 - 1960
gen growth  = (1/`s') * ln(gdppc2019 / gdppc1960)
gen initial = ln(gdppc1960)
drop if missing(growth) | missing(initial)

display as text ""
display as text "Beta-convergence regression, 1960–2019:"
reg growth initial, robust

local lambda = _b[initial]
local s_yrs  = `s'

* Convert OLS slope λ to structural speed β and half-life τ
*   λ = -((1 - exp(-β·s))/s)  ⇒  β = -ln(1 + λ·s)/s,  τ = ln(2)/β
if (1 + `lambda'*`s_yrs') > 0 {
    local beta_speed = -ln(1 + `lambda'*`s_yrs') / `s_yrs'
    local halflife   = ln(2) / `beta_speed'
    display as result "  Speed β   = " %5.3f 100*`beta_speed' "% per year"
    display as result "  Half-life = " %5.1f `halflife' " years"
}

* Scatter with fitted line
#delimit ;
tw (lfitci growth initial, fcolor("106 155 204"%20) lcolor("106 155 204"))
   (scatter growth initial, mcolor("217 119 87"%70) msymbol(O) msize(small)
    mlabel(ccode) mlabsize(vsmall) mlabpos(0) mlabcolor("20 20 19"%60)),
   ytitle("Average annual growth (1960–2019)")
   xtitle("Log GDP per capita in 1960")
   title("Beta convergence: 1960 to 2019", color("20 20 19"))
   legend(off)
   plotregion(style(none) lcolor(none))
   graphregion(fcolor(white) lcolor(white))
   xsize(5) ysize(4)
;
#delimit cr
graph export "stata_convergence_simple_beta.png", replace width(2000)


*─── 3. Sigma convergence: dispersion across countries ───────────────────────
*
*   σ_t = SD across countries of ln(y_i,t).
*   σ falling over time = sigma convergence.

use "convergence_working_simple.dta", clear
gen log_gdppc = ln(gdppc)

* Standard deviation of log GDP per capita, by year
collapse (sd) sigma = log_gdppc (count) n = log_gdppc, by(year)

display as text ""
display as text "Sigma at endpoints:"
list year sigma n if inlist(year, 1960, 2000, 2019), noobs clean

* Time-series of sigma
#delimit ;
tw (line sigma year, lcolor("106 155 204") lwidth(medthick)),
   ytitle("σ = SD of log GDP per capita")
   xtitle("Year")
   title("Sigma convergence: dispersion of log GDP per capita", color("20 20 19"))
   xlabel(1960(10)2020)
   ylabel(, angle(horizontal))
   plotregion(style(none) lcolor(none))
   graphregion(fcolor(white) lcolor(white))
   note("Data: Penn World Tables 10.0. 84-country balanced panel.", size(vsmall))
   xsize(6) ysize(4)
;
#delimit cr
graph export "stata_convergence_simple_sigma.png", replace width(2000)

export delimited year sigma n using "convergence_simple_sigma.csv", replace


*─── Done ────────────────────────────────────────────────────────────────────

capture erase "convergence_working_simple.dta"
log close
display as text ""
display as text "Outputs:"
display as text "  stata_convergence_simple_beta.png"
display as text "  stata_convergence_simple_sigma.png"
display as text "  convergence_simple_sigma.csv"
display as text "  analysis_simple.log"
