*===========================================================================*
* Figure_A1.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* FIGURE A.1 - Predicted vs observed regional GDP per capita, by national
*              World-Bank income tier.
*
*   A simple validation / "goodness-of-fit" scatter for the night-lights income
*   model. Each point is one region (averaged over 2001-2010). The HORIZONTAL
*   axis is the model's PREDICTED log regional GDP per capita (built from
*   satellite light intensity), the VERTICAL axis is the OBSERVED log regional
*   GDP per capita. A 45-degree line (y = x) marks perfect prediction: the
*   tighter the cloud hugs that line, the better the lights model recovers the
*   true regional income distribution.
*
*   The three overlaid scatters split regions by the income tier of their
*   COUNTRY (GDP_pc_Country), using the World Bank fixed-dollar cutoffs of the
*   period: low income (LIC, < $4,089), middle income (MIC, $4,089-$12,615)
*   and high income (HIC, > $12,615). This shows the fit holds across the whole
*   development range, not just for rich countries.
*
* SELF-CONTAINED: needs only data/Figure_A1_data.csv.
* SOFTWARE: Stata (R and Python twins included).  No external package required.
* HOW TO RUN: `cd` into this folder in Stata, then:  do Figure_A1.do
* OUTPUT: output/figure_A_1.(gph|png)
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
* Original loaded a .dta with  use "Data\...dta", clear .  Here we read the
* shipped CSV. case(preserve) keeps the exact (case-sensitive) header names,
* including the source's typo "code_Coutry_Region".
import delimited "$DATA/Figure_A1_data.csv", varnames(1) case(preserve) clear

*--------------------------- 3. Window + collapse to region means ----------*
* Keep the decade 2001-2010 (the original window was  year>2000 & year<2011 ),
* then average every region to a single point so each region appears once.
keep if year>2000 & year<2011

* The original used a dash-range in collapse; we list the variables EXPLICITLY
* because the trimmed CSV would break a dash range. (firstnm) carries the
* string identifiers; (mean) averages the numeric series over the decade.
collapse (firstnm) Region_NAME Country_ISO ///
         (mean) GDP_pc_Country GDP_pc_Region log_GDP_pc_Region ///
                pred_log_GDP_pc_Region pred_GDP_pc_Region Pix_Region Pop_Region ///
         , by(code_Coutry_Region)

*--------------------------- 4. Figure A.1 ---------------------------------*
* Three scatters split by the COUNTRY income tier (World-Bank cutoffs), plus
* the 45-degree reference line  function y = x .
*   msymbol(t) = small triangle (LIC), + = plus (MIC), O = hollow circle (HIC).
*   scale(0.5) shrinks the LIC markers so the dense clouds stay readable.
*   legend(... ring(0) pos(5)) places the key INSIDE the plot, lower-right.
twoway (scatter log_GDP_pc_Region pred_log_GDP_pc_Region ///
            if GDP_pc_Country<4089, msymbol(t) scale(0.5)) ///
       (scatter log_GDP_pc_Region pred_log_GDP_pc_Region ///
            if GDP_pc_Country>4089 & GDP_pc_Country<12615, msymbol(+)) ///
       (scatter log_GDP_pc_Region pred_log_GDP_pc_Region ///
            if GDP_pc_Country>12615, msymbol(O)) ///
       (function y=x, lcolor(black) range(5.5 12)) ///
       , xtitle("log (predicted regional GDP per capita)") ///
         ytitle("log (observed regional GDP per capita)") ///
         legend(order(1 "LIC" 2 "MIC" 3 "HIC") ring(0) pos(5)) ///
         title("Figure A.1: Predicted vs observed regional GDP") ///
         saving("$OUT/figure_A_1", replace)
graph export "$OUT/figure_A_1.png", replace width(1600)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED: a tight cloud of points along the 45-degree line - the lights model
* tracks observed regional GDP across all three income tiers (LIC/MIC/HIC line
* up from the lower-left to the upper-right).
* Visual target: manuscript p.128 (and expected/Figure_A1_R_reference.png).
display as result "Figure A.1 written to $OUT/"
