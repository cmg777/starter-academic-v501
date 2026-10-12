*===========================================================================*
* Figure_A3.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* FIGURE A.3 - USA 2010: predicted vs observed regional GDP per capita, split
*   by Regional Price Parity (RPP).
*
*   The horizontal axis is the night-lights PREDICTED log GDP per capita of each
*   US state; the vertical axis is the OBSERVED (official) log GDP per capita.
*   A perfect prediction would put every state exactly on the 45-degree line
*   (y = x).  Points are split into three groups by the state's Regional Price
*   Parity (RPP) - the BEA cost-of-living index where 100 = US average:
*     - LRPP (low  price level): RPP < 90.2
*     - MRPP (mid  price level): 90.2 < RPP < 102.8
*     - HRPP (high price level): RPP > 102.8
*   The check: do cheap (LRPP) vs expensive (HRPP) states fall systematically
*   off the 45-degree line?  If so, regional price differences - not just
*   measurement error - drive the gap between predicted and observed income.
*
* SELF-CONTAINED: needs only data/Figure_A3_data.csv.
* SOFTWARE: Stata (R and Python twins included).  No external package required.
* HOW TO RUN: `cd` into this folder in Stata, then:  do Figure_A3.do
* OUTPUT: output/figure_A_3.(gph|png)
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
* Original code read a .dta file:  use "Data\X.dta", clear
* Here we read the shipped, trimmed CSV.  Column names are CASE-SENSITIVE and
* are kept exactly as in the header via case(preserve).
import delimited "$DATA/Figure_A3_data.csv", varnames(1) case(preserve) clear

*--------------------------- 3. Keep the USA in 2010 -----------------------*
* Figure A.3 is a single cross-section: US states in the year 2010.  RPP (the
* BEA cost-of-living index) is only populated for US states, so this filter
* also drops every row with a missing RPP.
keep if year==2010
keep if Country_ISO=="USA"

* Sanity check: the manuscript figure shows 51 US states/regions (50 states +
* District of Columbia) in 2010.
count
display as result "USA states/regions in 2010 = " r(N)

*--------------------------- 4. Figure A.3 ---------------------------------*
* Four overlaid twoway plots:
*   (1) LRPP  - low  price level (RPP < 90.2)              -> hollow triangle msymbol(t)
*   (2) MRPP  - mid  price level (90.2 < RPP < 102.8)      -> plus sign      msymbol(+)
*   (3) HRPP  - high price level (RPP > 102.8)             -> hollow circle  msymbol(O)
*   (4) the 45-degree reference line  function y = x  over the plotted range.
* Each scatter labels its points with the state name via mlabel(Region_NAME).
* The cut-offs 90.2 and 102.8 split the states into roughly equal thirds.
* The legend is placed inside the plot (ring(0)) at the 5 o'clock position.
twoway (scatter log_GDP_pc_Region pred_log_GDP_pc_Region if RPP<90.2, ///
            msymbol(t) mlabel(Region_NAME) ///
            xlabel(10.2(0.2)11.1) ylabel(10.2(0.2)11.1)) ///
       (scatter log_GDP_pc_Region pred_log_GDP_pc_Region if RPP>90.2 & RPP<102.8, ///
            msymbol(+) mlabel(Region_NAME)) ///
       (scatter log_GDP_pc_Region pred_log_GDP_pc_Region if RPP>102.8, ///
            msymbol(O) mlabel(Region_NAME)) ///
       (function y=x, range(10.2 11.1) lcolor(black)) ///
       , xtitle("log (predicted regional GDP per capita)") ///
         ytitle("log (observed regional GDP per capita)") ///
         legend(order(1 "LRPP" 2 "MRPP" 3 "HRPP") ring(0) pos(5)) ///
         title("Figure A.3: USA 2010 - predicted vs observed regional GDP") ///
         saving("$OUT/figure_A_3", replace)
graph export "$OUT/figure_A_3.png", replace width(1600)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED: 51 US states/regions plotted in 2010, split LRPP/MRPP/HRPP, with a
* 45-degree line.  Visual target: manuscript.pdf p.130 (and the R reference in
* expected/Figure_A3_R_reference.png).
display as result "Figure A.3 written to $OUT/"
