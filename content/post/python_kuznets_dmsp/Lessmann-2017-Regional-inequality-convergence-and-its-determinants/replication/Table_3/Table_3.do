*===========================================================================*
* Table_3.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* TABLE 3 - Determinants of sigma-convergence: panel fixed-effects regressions
*           on 5-year averages. Regresses each of five regional-inequality
*           indices on a CUBIC polynomial in log national GDP per capita, with
*           country and period fixed effects. The hump-shaped (inverted-U-ish)
*           pattern is the paper's main "Kuznets curve" result for regions.
*
* SELF-CONTAINED: needs only data/Table_3_data.csv (shipped in this folder).
* SOFTWARE: Stata (R and Python twins included).
* REQUIRED PACKAGE (install once):   ssc install outreg2
*
* HOW TO RUN: open Stata, `cd` into THIS folder, then:   do Table_3.do
* OUTPUT: output/Table_3.xls and output/Table_3.txt
*===========================================================================*

*--------------------------- 1. Setup --------------------------------------*
clear all
macro drop _all
capture log close
set more off
version 13

global ROOT "`c(pwd)'"          // portable working directory (cd here first)
global DATA "$ROOT/data"
global OUT  "$ROOT/output"
capture mkdir "$OUT"

*--------------------------- 2. Packages -----------------------------------*
* outreg2 writes regression results to a formatted .xls/.txt table.
capture which outreg2
if _rc ssc install outreg2

*--------------------------- 3. Import & inspect ---------------------------*
* import delimited reads a CSV. varnames(1)=first row holds names;
* case(preserve) keeps the original upper/lower case of the column names.
import delimited "$DATA/Table_3_data.csv", varnames(1) case(preserve) clear
describe
summarize

*--------------------------- 4. Collapse to 5-year averages ----------------*
* The analysis is run on five non-overlapping 5-year periods (1990-94, ...,
* 2010-14). We label each year with its period, then average within country x
* period. (firstnm) keeps the (string) country name; (mean) averages the rest.
gen p5year = 0
replace p5year = 1 if inrange(year,1990,1994)
replace p5year = 2 if inrange(year,1995,1999)
replace p5year = 3 if inrange(year,2000,2004)
replace p5year = 4 if inrange(year,2005,2009)
replace p5year = 5 if inrange(year,2010,2014)

* NOTE: the original used a dash-range `collapse (mean) fedelupd2-COVW_pred_GDP_pc`.
* With a trimmed file that range would break, so we list the variables explicitly.
collapse (firstnm) Country_NAME ///
         (mean) GDP_pc_Country GINIW_pred_GDP_pc COVW_pred_GDP_pc ///
                GE_1W_pred_GDP_pc GE_0W_pred_GDP_pc GE_m1W_pred_GDP_pc, ///
         by(Country_ISO p5year)

*--------------------------- 5. Build the cubic in log GDP -----------------*
gen log_GDP_pc_Country   = log(GDP_pc_Country)
gen log_GDP_pc_Country_2 = log_GDP_pc_Country^2
gen log_GDP_pc_Country_3 = log_GDP_pc_Country^3

*--------------------------- 6. Declare the panel --------------------------*
encode Country_ISO, generate(Country_ISO_long)   // numeric country id for panel
tsset  Country_ISO_long p5year
xtset  Country_ISO_long p5year
xi i.p5year                                       // period dummies _Ip5year_*

*--------------------------- 7. Estimate the 7 columns ---------------------*
* xtreg ..., fe  = country fixed effects (within estimator).
* robust cluster(Country_ISO_long) = SEs clustered by country.
* i.p5year = period (year) fixed effects.
* outreg2: replace starts the file; append adds a column; keep() selects which
*          coefficients to print; addtext() writes the FE "YES/YES" footer rows;
*          dec(3) = 3 decimals.

* (1) GINIW, linear
xtreg GINIW_pred_GDP_pc log_GDP_pc_Country i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_3.xls", replace dec(3) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) ///
    addtext(Country FE, YES, Year FE, YES)

* (2) GINIW, quadratic
xtreg GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_3.xls", append dec(3) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) ///
    addtext(Country FE, YES, Year FE, YES)

* (3) GINIW, cubic  <- the headline specification
xtreg GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_3.xls", append dec(3) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) ///
    addtext(Country FE, YES, Year FE, YES)

* (4) COVW, cubic
xtreg COVW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_3.xls", append dec(3) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) ///
    addtext(Country FE, YES, Year FE, YES)

* (5) Theil GE(1), cubic
xtreg GE_1W_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_3.xls", append dec(3) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) ///
    addtext(Country FE, YES, Year FE, YES)

* (6) MLD GE(0), cubic
xtreg GE_0W_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_3.xls", append dec(3) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) ///
    addtext(Country FE, YES, Year FE, YES)

* (7) GE(-1), cubic
xtreg GE_m1W_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_3.xls", append dec(3) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) ///
    addtext(Country FE, YES, Year FE, YES)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED RESULT (compare with expected/Table_3.txt):
*   col (3) GINIW cubic: log_GDP .293***, ^2 -.032***, ^3 .001***
*   col (4) COVW  cubic: .402***, -.044***, .002**
*   N = 880 country-periods, 180 countries; R2 .126/.201/.244/.264/.210/.205/.196
display as result "Table 3 written to $OUT/Table_3.xls and .txt"
