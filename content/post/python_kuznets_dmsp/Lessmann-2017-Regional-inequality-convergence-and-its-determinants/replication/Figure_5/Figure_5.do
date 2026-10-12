*===========================================================================*
* Figure_5.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* FIGURE 5 - Regional inequality versus its social correlates (mean 2001-2012).
*   Panel (a) [REPRODUCIBLE]: cross-country scatter of INTERPERSONAL inequality
*              (household income Gini) against INTERREGIONAL inequality (GINIW),
*              with an OLS fit line. Are countries with large gaps BETWEEN regions
*              also the ones with large gaps BETWEEN people?
*   Panel (b) [NOT REPRODUCIBLE]: the same scatter against the risk of internal
*              conflict, built from the ICRG "internal conflict" rating. The ICRG
*              series is licensed PRS-Group data and is ABSENT from every dataset
*              in this repository, so 5b cannot be drawn here. The original block
*              is preserved verbatim (commented out) in Section 8 below.
*
* SELF-CONTAINED: needs only data/Figure_5_data.csv.
* SOFTWARE: Stata (R and Python twins included).  No external package required.
* HOW TO RUN: `cd` into this folder in Stata, then:  do Figure_5.do
* OUTPUT: output/Figure_5_a.(gph|png)
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
* The original did:  use "Data\Main_Data.dta", clear
* Here we read the shipped, trimmed CSV instead. Column names are CASE-SENSITIVE
* and imported exactly as they appear in the header (case(preserve)).
import delimited "$DATA/Figure_5_data.csv", varnames(1) case(preserve) clear

*--------------------------- 3. Collapse to a cross section ----------------*
* Restrict to the 2001-2012 window the paper averages over, then collapse the
* annual panel to ONE observation per country (the period mean).
*
* NOTE ON THE COLLAPSE: the original used a dash-RANGE
*     collapse (firstnm) Country_NAME (mean) fedelupd2-COVW_pred_GDP_pc, by(...)
* That range only works on the full Main_Data layout. The trimmed CSV ships
* just the columns Figure 5a needs, so we replace the range with an EXPLICIT
* variable list (GINIW_pred_GDP_pc and Giniall).
keep if year>2000 & year<2013
collapse (firstnm) Country_NAME (mean) GINIW_pred_GDP_pc Giniall, by(Country_ISO)

*--------------------------- 4. Normalization to [0,1] ---------------------*
* Giniall (the household-income Gini) is stored on a 0-100 scale; the regional
* index GINIW is on a 0-1 scale. Rescale Giniall to 0-1 so both axes are
* comparable. Countries without a household Gini drop out of the scatter here.
gen GINIall_100 = Giniall/100

*--------------------------- 5. Figure 5a (reproducible) -------------------*
* twoway overlays: a scatter (one marker per country) + an OLS fit line.
*   msymbol(t) = solid triangles; lfit draws the least-squares line in blue.
* The fit line slopes UP: interregional and interpersonal inequality move
* together across countries.
tw (scatter GINIall_100 GINIW_pred_GDP_pc, msymbol(t) ///
        xlabel(0(0.5)0.16) ylabel(0.2(0.1)0.8, nogrid)) ///
   (lfit GINIall_100 GINIW_pred_GDP_pc, lcolor(blue)) ///
   , xtitle("Interregional inequality: GINIW") ///
     ytitle("Interpersonal inequality: GINI") ///
     xsize(3.1) ysize(2.8) legend(off) ///
     title("Figure 5a: Regional vs personal inequality") ///
     saving("$OUT/Figure_5_a", replace)
graph export "$OUT/Figure_5_a.png", replace width(1600)

*--------------------------- 6. Done (5a) ----------------------------------*
display as result "Figure 5a written to $OUT/"

*===========================================================================*
* 7. WHY THERE IS NO FIGURE 5b OUTPUT HERE
*---------------------------------------------------------------------------*
* Panel (b) plots the RISK OF INTERNAL CONFLICT against GINIW. That risk is
* derived from the ICRG (International Country Risk Guide) "internal conflict"
* rating:
*     icrg_risk_of_internal_conflict = (12 - icrg_internal_conflict)/12
* The ICRG series is licensed PRS-Group data and is NOT distributed with this
* paper's replication package - it appears in NO dataset in this repository.
* We therefore cannot draw 5b. To reproduce it: obtain the ICRG
* `internal_conflict` series, merge it on Country_ISO + year, build the
* normalised variable above, and uncomment the block in Section 8.
* See manuscript.pdf p.127.
*===========================================================================*

*===========================================================================*
* 8. ORIGINAL FIGURE 5b BLOCK - PRESERVED VERBATIM (do not run as-is)
*---------------------------------------------------------------------------*
* Reproduced exactly from Generation_Figures.do (lines 130-144). It is kept
* commented out because icrg_internal_conflict is unavailable (see Section 7).
*---------------------------------------------------------------------------*
* 	*Normalization to [0,1]
* 		gen GINIall_100=Giniall/100
* 		*gen icrg_risk_of_internal_conflict=(12-icrg_internal_conflict)/12
*
* 	*Gen figures
* 		tw (scatter icrg_risk_of_internal_conflict GINIW_pred_GDP_pc ,  msymbol(t) xlabel(0[0.5]0.16) ylabel(0[0.1]0.7, nogrid) scale(1))  ///
* 		(lfit  icrg_risk_of_internal_conflict GINIW_pred_GDP_pc, lcolor(blue)) ///
* 		,xtitle("{stSerif:Interregional inequality: GINIW}", size(medlarge)) ytitle("{stSerif:Risk of internal conflict: ICRG}", size(medlarge)) xsize(3.1) ysize(2.8) legend(off) ///
* 		saving("Figures\Figure_5_b", replace)
*===========================================================================*

*--------------------------- 99. Notes -------------------------------------*
* EXPECTED (5a): ~144 countries (those with a household-income Gini in the
*   window), a clear POSITIVE relationship; visual target manuscript.pdf p.127
*   and expected/Figure_5_R_reference.png.
