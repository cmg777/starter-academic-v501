*===========================================================================*
* Figure_4.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* FIGURE 4 - Regional inequality and development.
*   Panel (a): all countries; partial-residual scatter of regional inequality
*              (GINIW) against log GDP per capita, with the fitted cubic curve.
*   Panel (b): the same, showing only a labelled set of example countries.
*
* The points are PARTIAL RESIDUALS: regional inequality after removing the
* estimated period (year) fixed effects, so the picture isolates the GDP
* relationship from column (3) of Table 3.
*
* SELF-CONTAINED: needs only data/Figure_4_data.csv.
* SOFTWARE: Stata (R and Python twins included).  No external package required.
* HOW TO RUN: `cd` into this folder in Stata, then:  do Figure_4.do
* OUTPUT: output/Figure_4_a.(gph|png) and output/Figure_4_b.(gph|png)
*===========================================================================*

*--------------------------- 1. Setup --------------------------------------*
clear all
macro drop _all
set more off
version 13
global ROOT "`c(pwd)'"
global DATA "$ROOT/data"
global OUT  "$ROOT/output"
capture mkdir "$OUT"

*--------------------------- 2. Import -------------------------------------*
import delimited "$DATA/Figure_4_data.csv", varnames(1) case(preserve) clear

*--------------------------- 3. Collapse to 5-year averages ----------------*
gen p5year = 0
replace p5year = 1 if inrange(year,1990,1994)
replace p5year = 2 if inrange(year,1995,1999)
replace p5year = 3 if inrange(year,2000,2004)
replace p5year = 4 if inrange(year,2005,2009)
replace p5year = 5 if inrange(year,2010,2014)
collapse (firstnm) Country_NAME (mean) GINIW_pred_GDP_pc GDP_pc_Country, by(Country_ISO p5year)

*--------------------------- 4. Build the cubic + panel --------------------*
gen log_GDP_pc_Country   = log(GDP_pc_Country)
gen log_GDP_pc_Country_2 = log_GDP_pc_Country^2
gen log_GDP_pc_Country_3 = log_GDP_pc_Country^3
encode Country_ISO, generate(Country_ISO_long)
xtset Country_ISO_long p5year
xi i.p5year                                       // period dummies _Ip5year_2.._5

*--------------------------- 5. Estimate (= Table 3 col 3) -----------------*
xtreg GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
      _Ip5year_2-_Ip5year_5, fe robust cluster(Country_ISO_long)

* PARTIAL RESIDUAL: subtract ONLY the estimated period (year) effects, leaving
* the GDP (cubic) relationship + country effects + noise to be plotted.
* We read the coefficients with _b[...] (NOT hard-coded numbers as the original
* did), so this stays correct if the data are updated.
gen yhat_period = _b[_Ip5year_2]*_Ip5year_2 + _b[_Ip5year_3]*_Ip5year_3 ///
                + _b[_Ip5year_4]*_Ip5year_4 + _b[_Ip5year_5]*_Ip5year_5
gen GINIW_temp  = GINIW_pred_GDP_pc - yhat_period

*--------------------------- 6. Figure 4a (all countries) ------------------*
* twoway overlays: a scatter of partial residuals + the fitted cubic curve.
*   msymbol(Oh) = hollow circles; function y=... draws the cubic using _b[...].
twoway (scatter GINIW_temp log_GDP_pc_Country, msymbol(Oh) mlabsize(small) ///
            xlabel(5(1)12) ylabel(0(0.02)0.16, nogrid)) ///
       (function y = _b[_cons] + _b[log_GDP_pc_Country]*x ///
              + _b[log_GDP_pc_Country_2]*x^2 + _b[log_GDP_pc_Country_3]*x^3, ///
              lcolor(black) range(5 12)) ///
       , xtitle("log (GDP per capita)") ///
         ytitle("Partial regional inequality (GINIW)") ///
         xsize(3.1) ysize(2.8) legend(off) ///
         title("Figure 4a: Regional inequality and development") ///
         saving("$OUT/Figure_4_a", replace)
graph export "$OUT/Figure_4_a.png", replace width(1600)

*--------------------------- 7. Figure 4b (labelled subset) ----------------*
* NOTE: the original labelled-country list contained two TYPOS, "ITL" and "IRE",
* which do not exist in the data, so Italy and Ireland silently never appeared.
* We use the correct ISO codes "ITA" and "IRL". (inlist takes <=10 string args,
* so we split the 13 countries across two inlist() calls.)
twoway (scatter GINIW_temp log_GDP_pc_Country ///
            if inlist(Country_ISO,"POL","AUS","SWE","PRY","BGD","CHN","IRN") ///
             | inlist(Country_ISO,"MOZ","LBR","ITA","IRL","ARE","THA"), ///
            msymbol(t) mlabel(Country_ISO) mlabsize(small) ///
            xlabel(5(1)12) ylabel(0(0.02)0.16, nogrid)) ///
       (function y = _b[_cons] + _b[log_GDP_pc_Country]*x ///
              + _b[log_GDP_pc_Country_2]*x^2 + _b[log_GDP_pc_Country_3]*x^3, ///
              lcolor(black) range(5 12)) ///
       , xtitle("log (GDP per capita)") ///
         ytitle("Partial regional inequality (GINIW)") ///
         xsize(3.1) ysize(2.8) legend(off) ///
         title("Figure 4b: Selected countries") ///
         saving("$OUT/Figure_4_b", replace)
graph export "$OUT/Figure_4_b.png", replace width(1600)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED: the fitted cubic coefficients equal Table 3 col (3):
*   log GDP .2931, (log GDP)^2 -.0320, (log GDP)^3 .00112, _cons -.7985.
* Visual target: manuscript.pdf p.124 (and expected/Figure_4_R_reference.png).
display as result "Figure 4 written to $OUT/"
