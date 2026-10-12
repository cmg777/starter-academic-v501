*===========================================================================*
* Figure_A4.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* FIGURE A.4 - National PREDICTED vs OBSERVED GDP per capita, by data source.
*   A validation plot. The authors predict national GDP per capita from night-
*   lights (pred_GDP_pc_Country) and check it against TWO observed series:
*     - GDP_pc_Country   : World Bank GDP pc, PPP constant 2005 US$ (all 180).
*     - GDP_pc_Country_G : observed GDP pc from Gennaioli et al. (2014),
*                          available for a 78-country subset.
*   Both series are plotted (in logs) against the prediction. If the model is
*   good, the points should lie near the 45-degree line y = x.
*
* The "geroli_dum" flag (kept verbatim from the original code, despite the
* typo - it tags the Gennaioli/Gennaioli-observed subset) splits the sample:
*   geroli_dum==1 -> country has Gennaioli observed data (msymbol triangle)
*   geroli_dum==0 -> country has only the predicted series (msymbol circle)
*
* SELF-CONTAINED: needs only data/Figure_A4_data.csv.
* SOFTWARE: Stata (R and Python twins included).  No external package required.
* HOW TO RUN: `cd` into this folder in Stata, then:  do Figure_A4.do
* OUTPUT: output/Figure_A_4.(gph|png)
*===========================================================================*

*--------------------------- 1. Setup --------------------------------------*
clear all
macro drop _all
capture log close
set more off
version 13
global ROOT "`c(pwd)'"
global DATA "$ROOT/data"
global OUT  "$ROOT/output"
capture mkdir "$OUT"

*--------------------------- 2. Import -------------------------------------*
* Original used:  use "Data\...dta", clear .  Here we read the shipped CSV.
* Column names are CASE-SENSITIVE; case(preserve) keeps them exactly as in the
* header (Country_ISO, year, GDP_pc_Country, pred_GDP_pc_Country, GDP_pc_Country_G).
import delimited "$DATA/Figure_A4_data.csv", varnames(1) case(preserve) clear

*--------------------------- 3. Restrict to 2001-2010 ----------------------*
* The figure is cross-sectional: keep the decade of overlap with the lights
* sample, then average each country over those years.
keep if year>2000 & year<2011

*--------------------------- 4. Collapse to one row per country ------------*
* One country-mean for each of the three GDP series. We list the variables
* EXPLICITLY (no dash-range) so the collapse is robust to the trimmed CSV.
collapse (mean) GDP_pc_Country pred_GDP_pc_Country GDP_pc_Country_G, by(Country_ISO)

*--------------------------- 5. Logs and the data-source flag --------------*
gen log_GDP_pc_Country      = log(GDP_pc_Country)        // log observed (WB)
gen log_pred_GDP_pc_Country = log(pred_GDP_pc_Country)   // log predicted (lights)

* geroli_dum: 1 if the country HAS Gennaioli observed data, 0 otherwise.
* (GDP_pc_Country_G is missing "." for the non-Gennaioli countries.)
gen geroli_dum=1
replace geroli_dum=0 if GDP_pc_Country_G==.

*--------------------------- 6. Figure A.4 ---------------------------------*
* Two scatters of log-observed vs log-predicted, split by data source, plus the
* 45-degree reference line y = x drawn over the data range [5.5, 12].
*   - triangles (t) = Gennaioli-observed subset (geroli_dum==1)
*   - circles  (o)  = predicted-only countries  (geroli_dum==0)
*   - mlabel(Country_ISO) puts the ISO code next to each marker.
*   - scale(0.5) shrinks the (dense) label/marker set so codes stay readable.
*   - legend ring(0) pos(5) places the key inside the plot, lower-right.
twoway (scatter log_GDP_pc_Country log_pred_GDP_pc_Country if geroli_dum==1, ///
            msymbol(t) mlabel(Country_ISO) scale(0.5)) ///
       (scatter log_GDP_pc_Country log_pred_GDP_pc_Country if geroli_dum==0, ///
            msymbol(o) mlabel(Country_ISO) scale(0.5)) ///
       (function y=x, range(5.5 12) lcolor(black)) ///
       , xtitle("log (predicted GDP per capita)") ///
         ytitle("log (observed GDP per capita)") ///
         legend(order(1 "observed data" 2 "predicted data") ring(0) pos(5)) ///
         title("Figure A.4: Predicted vs observed national GDP per capita") ///
         saving("$OUT/Figure_A_4", replace)
graph export "$OUT/Figure_A_4.png", replace width(1600)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED: 78 countries with Gennaioli observed data, 180 total; points cluster
* tightly around the 45-degree line (good prediction).
* Visual target: manuscript.pdf p.131 (and expected/Figure_A4_R_reference.png).
display as result "Figure A.4 written to $OUT/"
