*===========================================================================*
* Figure_B3.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* FIGURE B.3 - Regional inequality (GINIW) in Germany, 2000-2012.
*   A simple time-series line plot of one country's within-country regional
*   inequality. It shows how Germany's partial regional inequality (the
*   population-weighted Gini of predicted regional income) evolves year by year.
*   This is an appendix sanity-check figure: it zooms into a single, well-known
*   country to make the satellite-based inequality series tangible.
*
* The plotted variable GINIW_pred_GDP_pc is the SAME predicted-income Gini used
* throughout the paper (built from night-lights -> predicted regional GDP). It
* is called "partial" because the underlying income is the part of regional GDP
* the model can predict from lights.
*
* SELF-CONTAINED: needs only data/Figure_B3_data.csv.
* SOFTWARE: Stata (R and Python twins included).  No external package required.
* HOW TO RUN: `cd` into this folder in Stata, then:  do Figure_B3.do
* OUTPUT: output/Figure_B_3.(gph|png)
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
* The original script did:  use "Data\Main_Data.dta", clear
* Here we read the shipped, trimmed CSV instead. Column names are CASE-SENSITIVE
* and preserved exactly as in the header (Country_ISO, year, GINIW_pred_GDP_pc).
import delimited "$DATA/Figure_B3_data.csv", varnames(1) case(preserve) clear

*--------------------------- 3. Subset to Germany 2000-2012 ----------------*
* Keep only the German country panel, then the 2000-2012 window. This leaves the
* 13 yearly observations that become the 13 points of the line.
keep if Country_ISO=="DEU"
keep if year>1999 & year<2013

*--------------------------- 4. Figure B.3 (line plot) ---------------------*
* twoway line of GINIW against year.
*   xlabel(2000(2)2012) ticks every 2 years on the x-axis;
*   ylabel(0.025(0.002)0.035, nogrid) fixes the y-range to the paper's window
*     and removes the horizontal grid lines (nogrid).
*   xsize/ysize keep the paper's small panel aspect ratio; legend(off) since a
*     single series needs no legend.
* (The original also passed msymbol()/mlabel() to a `line`; those affect markers
*  on a line plot only and are harmless - we keep the figure as a clean line.)
tw (line GINIW_pred_GDP_pc year, ///
        xlabel(2000(2)2012) ylabel(0.025(0.002)0.035, nogrid)) ///
   , xtitle("Year") ///
     ytitle("Partial regional inequality (GINIW)") ///
     xsize(3.1) ysize(2.8) legend(off) ///
     title("Figure B.3: Regional inequality in Germany, 2000-2012") ///
     saving("$OUT/Figure_B_3", replace)
graph export "$OUT/Figure_B_3.png", replace width(1600)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED: 13 yearly points for Germany, 2000-2012, with GINIW falling inside
* the 0.025-0.035 band (a gentle downward drift over the period).
* Visual target: expected/Figure_B3_R_reference.png.
display as result "Figure B.3 written to $OUT/"
