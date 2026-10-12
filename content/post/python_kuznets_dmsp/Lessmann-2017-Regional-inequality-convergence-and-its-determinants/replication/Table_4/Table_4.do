*===========================================================================*
* Table_4.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* TABLE 4 - Determinants of regional inequality WITH CONTROLS. Panel
*           fixed-effects regressions on 5-year averages. Each column keeps the
*           CUBIC polynomial in log national GDP per capita from Table 3 (the
*           spatial "Kuznets curve") and adds a different block of structural
*           controls - natural resources & farming, openness, geography &
*           transport cost, foreign aid & schooling, and ethnic inequality -
*           to ask whether the hump-shaped GDP pattern survives.
*
* SELF-CONTAINED: needs only data/Table_4_data.csv (shipped in this folder).
* SOFTWARE: Stata (R and Python twins included).
* REQUIRED PACKAGE (install once):   ssc install outreg2
*
* HOW TO RUN: open Stata, `cd` into THIS folder, then:   do Table_4.do
* OUTPUT: output/Table_4.xls and output/Table_4.txt
*
* IMPORTANT - 5 COLUMNS, NOT 6: the PUBLISHED Table 4 has a 6th specification
* (printed as published column 4) that uses `icrg_bureaucratic_qualitiy`,
* `Polity2` and a federal x GDP interaction. That ICRG bureaucratic-quality
* variable is NOT in the shipped data, so that column CANNOT be reproduced. It
* was ALSO already commented out in the authors' original do-file. We keep that
* block here VERBATIM but commented out (section 8), so the reproduced table has
* 5 columns = published columns 1, 2, 3, 5, 6.
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
* NOTE: the original stored satellite dummies as _satyear_1.._satyear_7; in any
* shipped CSV a leading underscore is dropped on import. Table 4 does not use
* those dummies, but follow the same case-sensitive CSV-name convention here.
import delimited "$DATA/Table_4_data.csv", varnames(1) case(preserve) clear
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
* With a trimmed file that range would break, so we list the variables explicitly
* (exactly the columns the five models below need).
collapse (firstnm) Country_NAME ///
         (mean) GINIW_pred_GDP_pc GDP_pc_Country Pop_Country ///
                Resources_rents_share_of_GDP Arable_land ///
                Trade_GDP_share FDI_share_of_GDP ///
                area price_gasoline Aid School_enrollment_secondary ///
                GINIW_Eth_light Polity2 fedelupd2, ///
         by(Country_ISO p5year)

*--------------------------- 5. Build the cubic in log GDP -----------------*
gen log_GDP_pc_Country   = log(GDP_pc_Country)
gen log_GDP_pc_Country_2 = log_GDP_pc_Country^2
gen log_GDP_pc_Country_3 = log_GDP_pc_Country^3

*--------------------------- 6. Build the control variables ----------------*
* aid_GDP : aid as a share of national GDP (Aid is a level; GDP_pc x Pop = GDP).
gen aid_GDP = Aid/(GDP_pc_Country*Pop_Country)
* Rescale percentages to shares so coefficients are comparable.
replace Resources_rents_share_of_GDP = Resources_rents_share_of_GDP/100
replace School_enrollment_secondary  = School_enrollment_secondary/100
* Area x fuel price (transport-cost proxy), scaled by 10e+6 = 1e7 to keep units small.
gen Area_X_price_gasoline = area*price_gasoline/10e+6
* fedlup : country-constant "is this a federation?" flag (mean over the panel).
egen fedlup = mean(fedelupd2), by(Country_ISO)
* GDP x federalism interaction (used only in the un-reproducible block, kept for fidelity).
gen log_GDP_pc_Country_X_fedlup = log_GDP_pc_Country*fedlup

*--------------------------- 7. Declare the panel --------------------------*
encode Country_ISO, generate(Country_ISO_long)   // numeric country id for panel
tsset  Country_ISO_long p5year
xtset  Country_ISO_long p5year
xi i.p5year                                       // period dummies _Ip5year_*

*--------------------------- 8. Estimate the 5 reproducible columns --------*
* xtreg ..., fe  = country fixed effects (within estimator).
* robust cluster(Country_ISO_long) = SEs clustered by country.
* i.p5year = period (year) fixed effects.
* outreg2: replace starts the file; append adds a column; keep() selects which
*          coefficients to print; addtext() writes the FE "YES/YES" footer rows;
*          dec(3) = 3 decimals.

* (1) + natural-resource rents and arable land  [= published col 1]
xtreg GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
      Resources_rents_share_of_GDP Arable_land i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_4.xls", replace dec(3) ///
    addtext(Country FE, YES, Year FE, YES) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
         Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP ///
         area price_gasoline Area_X_price_gasoline aid_GDP School_enrollment_secondary ///
         GINIW_Eth_light)

* (2) + trade openness and FDI  [= published col 2]
xtreg GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
      Trade_GDP_share FDI_share_of_GDP i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_4.xls", append dec(3) ///
    addtext(Country FE, YES, Year FE, YES) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
         Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP ///
         area price_gasoline Area_X_price_gasoline aid_GDP School_enrollment_secondary ///
         GINIW_Eth_light)

* (3) + geography & transport cost (area, fuel price, their interaction)  [= published col 3]
xtreg GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
      area price_gasoline Area_X_price_gasoline i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_4.xls", append dec(3) ///
    addtext(Country FE, YES, Year FE, YES) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
         Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP ///
         area price_gasoline Area_X_price_gasoline aid_GDP School_enrollment_secondary ///
         GINIW_Eth_light)

*---------------------------------------------------------------------------*
* PUBLISHED COLUMN 4 - NOT REPRODUCIBLE (institutions / federalism).
* This block requires `icrg_bureaucratic_qualitiy`, which is ABSENT from the
* shipped data; it was ALSO already commented out in the authors' original
* do-file. Kept here VERBATIM for fidelity. Do NOT uncomment - it will error
* on the missing variable.
*---------------------------------------------------------------------------*
/*
xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   ///
 icrg_bureaucratic_qualitiy Polity2   fedlup log_GDP_pc_Country_X_fedlup log_GDP_pc_Country_2_fed log_GDP_pc_Country_3_fed  i.p5year, robust fe cluster(Country_ISO_long)
outreg2 using  Tables\Table_4.xls, append ///
addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline  Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light)
*/

* (4) + foreign aid and secondary schooling  [= published col 5]
xtreg GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
      aid_GDP School_enrollment_secondary i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_4.xls", append dec(3) ///
    addtext(Country FE, YES, Year FE, YES) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
         Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP ///
         area price_gasoline Area_X_price_gasoline aid_GDP School_enrollment_secondary ///
         GINIW_Eth_light)

* (5) + ethnic inequality  [= published col 6]
xtreg GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
      GINIW_Eth_light i.p5year, fe robust cluster(Country_ISO_long)
outreg2 using "$OUT/Table_4.xls", append dec(3) ///
    addtext(Country FE, YES, Year FE, YES) ///
    keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
         Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP ///
         area price_gasoline Area_X_price_gasoline aid_GDP School_enrollment_secondary ///
         GINIW_Eth_light)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED RESULT (compare with expected/Table_4.txt cols 1,2,3,5,6):
*   col 1 (rents/arable):  rents 0.018***,  arable -0.053***   (N=857)
*   col 2 (trade/FDI):     trade 0.005***,  FDI    0.009       (N=817)
*   col 3 (geography):     gasoline 0.001,  Area_X_gasoline 0.006**  (N=676)
*   col 4 (=pub col 5):    aid_GDP 0.015**, school -0.014*     (N=591)
*   col 5 (=pub col 6):    GINIW_Eth_light 0.071***            (N=845)
* The reproduced table has 5 columns; published column 4 (ICRG bureaucratic
* quality) is omitted because that variable is not in the data.
display as result "Table 4 (5 reproducible columns) written to $OUT/Table_4.xls and .txt"
