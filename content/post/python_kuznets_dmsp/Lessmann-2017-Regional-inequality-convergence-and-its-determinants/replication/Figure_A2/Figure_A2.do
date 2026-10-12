*===========================================================================*
* Figure_A2.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* FIGURE A.2 - Predicted vs observed regional GDP per capita, by REGIONAL
*   OUTPUT DENSITY (mean 2001-2010).
*
* This is a VALIDATION plot. The paper predicts regional GDP per capita from
* night-light intensity (the "view from outer space"). Here we check those
* predictions against the (sparser) directly observed regional GDP figures.
* Each dot is one region: x = log(predicted regional GDP pc), y = log(observed
* regional GDP pc). The black 45-degree line (y = x) is the perfect-prediction
* benchmark - the closer the cloud hugs it, the better the satellite proxy.
*
* The TWIST relative to Figure A.1 (which split regions by NATIONAL income
* group LIC/MIC/HIC) is that Figure A.2 splits the SAME regions by their own
* REGIONAL OUTPUT DENSITY - output per unit of lit area - into three tiers:
*   LDIR = low-density industrial regions   (GDP density <  168,071.5)
*   MDIR = medium-density industrial regions (168,071.5 - 1,478,853)
*   HDIR = high-density industrial regions   (GDP density >  1,478,853)
* Output density = total regional output / lit area = (GDP pc * population) /
* number of lit pixels. The split shows the satellite proxy works across the
* density spectrum, not only for dense, brightly-lit regions.
*
* SELF-CONTAINED: needs only data/Figure_A2_data.csv.
* SOFTWARE: Stata (R and Python twins included).  No external package required.
* HOW TO RUN: `cd` into this folder in Stata, then:  do Figure_A2.do
* OUTPUT: output/figure_A_2.(gph|png)
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
* The original read a Stata file:  use "Data\pred_GDP_pc_Region_G.dta", clear
* Here we read the shipped, trimmed CSV instead. case(preserve) keeps the
* exact (case-sensitive) header names listed in the data dictionary.
import delimited "$DATA/Figure_A2_data.csv", varnames(1) case(preserve) clear

*--------------------------- 3. Collapse to a cross section ----------------*
* Restrict to the 2001-2010 window, then average each region over those years
* down to ONE row per region. code_Coutry_Region is the unique region id.
*
* NOTE ON THE COLLAPSE LIST: the original used a dash-RANGE inside collapse and
* also averaged two helper variables (Country_ISO_long, GDP_pc_Country_G) that
* are NOT in this trimmed CSV. A dash-range would break here, so we list the
* EXACT variables this figure needs, explicitly. (firstnm) carries the labels
* through unchanged; (mean) averages the numeric series over 2001-2010.
keep if year>2000
keep if year<2011
collapse (firstnm) Region_NAME Country_ISO ///
         (mean) GDP_pc_Country GDP_pc_Region log_GDP_pc_Region ///
                pred_log_GDP_pc_Region pred_GDP_pc_Region Pix_Region Pop_Region, ///
         by(code_Coutry_Region)

*--------------------------- 4. Build regional output density --------------*
* Output density = total regional output / lit area
*               = (GDP per capita * population) / number of lit pixels.
* This is the variable that defines the three LDIR / MDIR / HDIR tiers below.
gen GDP_dens_Region = (GDP_pc_Region*Pop_Region)/Pix_Region

*--------------------------- 5. Figure A.2 ---------------------------------*
* Three overlaid scatters of observed (y) vs predicted (x) log regional GDP pc,
* one per density tier, plus the y = x reference line.
*   msymbol(t) scale(0.5) -> small triangles for the low-density (LDIR) tier
*   msymbol(+)            -> crosses for the medium-density (MDIR) tier
*   msymbol(O)            -> hollow large circles for the high-density (HDIR) tier
*   function y=x          -> the 45-degree perfect-prediction line, range 5.5-12
* legend ring(0) pos(5)   -> legend tucked INSIDE the plot, lower-right area.
* Cutoffs 168071.5 and 1478853 are the original fixed density thresholds.
twoway (scatter log_GDP_pc_Region pred_log_GDP_pc_Region ///
            if GDP_dens_Region<168071.5, msymbol(t) scale(0.5)) ///
       (scatter log_GDP_pc_Region pred_log_GDP_pc_Region ///
            if GDP_dens_Region>168071.5 & GDP_dens_Region<1478853, msymbol(+)) ///
       (scatter log_GDP_pc_Region pred_log_GDP_pc_Region ///
            if GDP_dens_Region>1478853, msymbol(O)) ///
       (function y=x, lcolor(black) range(5.5 12)) ///
       , xtitle("{stSerif:log (predicted regional GDP per capita)}", size(huge)) ///
         ytitle("{stSerif:log (observed regional GDP per capita)}", size(huge)) ///
         legend(order(1 "{stSerif:LDIR}" 2 "{stSerif:MDIR}" 3 "{stSerif:HDIR}") ///
                ring(0) pos(5) size(huge)) ///
         title("Figure A.2: Predicted vs observed regional GDP by output density") ///
         saving("$OUT/figure_A_2", replace)
graph export "$OUT/figure_A_2.png", replace width(1600)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED: the dot cloud should sit tightly along the 45-degree line across
* all three density tiers - confirming the night-lights proxy tracks observed
* regional GDP well. Visual target: manuscript p.129 (and the bundled R
* reference expected/Figure_A2_R_reference.png).
display as result "Figure A.2 written to $OUT/"
