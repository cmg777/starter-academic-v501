*===========================================================================*
* Table_1.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* TABLE 1 - Nighttime lights predict regional GDP (the calibration step).
*           Regresses log regional GDP per capita on log average nighttime
*           light per pixel, across seven progressively richer specifications.
*           This is the FIRST-STAGE regression of the whole paper: it shows
*           lights are a strong, stable predictor of income, which justifies
*           using lights to "predict" GDP for the thousands of regions that
*           have no official income statistics.
*
* The seven columns add ever more fixed effects / controls:
*   (1) raw RE regression, no FE
*   (2) OLS with region FE + satellite FE
*   (3) RE with country FE + satellite FE
*   (4) (3) + national GDP per capita
*   (5) RE with country-GROUP (region-of-world) FE + satellite FE
*   (6) (5) + national GDP per capita
*   (7) (6) + geography/pixel controls (the prediction model actually used)
*
* SELF-CONTAINED: needs only data/Table_1_data.csv (shipped in this folder).
* SOFTWARE: Stata (R and Python twins included).
* REQUIRED PACKAGE (install once):   ssc install outreg2
*
* HOW TO RUN: open Stata, `cd` into THIS folder, then:   do Table_1.do
* OUTPUT: output/Table_1.xls and output/Table_1.txt
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
*
* NAMING NOTE: the original satellite dummies were _satyear_1.._satyear_7.
* A leading underscore is not a legal first character for a Stata variable
* imported from CSV, so in the shipped CSV they are satyear_1..satyear_7
* (the leading underscore was dropped). We therefore use the CSV names below.
* The 81 country dummies country_dum1..country_dum81 are SHIPPED in the CSV
* (used as country fixed effects in columns 3-4).
import delimited "$DATA/Table_1_data.csv", varnames(1) case(preserve) clear
describe
summarize log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country

*--------------------------- 4. Declare the panel --------------------------*
* The unit of observation is a region (code_Coutry_Region) over time (year).
* tsset/xtset declare the panel so xtreg knows the group and time variables.
* xi i.code_Coutry_Region creates region dummies _Icode_Cout_2-_Icode_Cout_1504
*   (1,504 regions -> 1,503 dummies), used as region FE in column (2).
* set matsize 11000 enlarges the coefficient matrix so the ~1,500-dummy OLS
*   in column (2) can be estimated.
tsset code_Coutry_Region year
xtset code_Coutry_Region year
xi i.code_Coutry_Region
set matsize 11000

*--------------------------- 5. Estimate the 7 columns ---------------------*
* xtreg ... (no option) = random effects (the package default) - used for
*   columns 1 and 3-7. Column 2 is a plain OLS `reg`.
* robust cluster(Country_ISO) = standard errors clustered by country.
* satyear_1-satyear_7 = satellite fixed effects (different satellites/sensors
*   read light intensity on slightly different scales).
* outreg2: replace starts the file; append adds a column; keep() selects which
*   coefficients to print; addtext() writes the FE "YES/NO" footer rows;
*   dec(3) = 3 decimals.

* (1) Random effects, no fixed effects, no controls
xtreg log_GDP_pc_Region log_Light_ppix_Region , robust cluster(Country_ISO)
outreg2 using "$OUT/Table_1.xls", replace dec(3) ///
    keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_GDP_pc_Country log_region log_area log_region_X_log_area) ///
    addtext(Region FE, NO, Country FE, NO, Country Group FE, NO, Satlite FE, NO)

* (2) OLS with REGION fixed effects + satellite FE
reg log_GDP_pc_Region log_Light_ppix_Region _Icode_Cout_2-_Icode_Cout_1504 satyear_1-satyear_7 , robust cluster(Country_ISO)
outreg2 using "$OUT/Table_1.xls", append dec(3) ///
    keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_GDP_pc_Country log_region log_area log_region_X_log_area) ///
    addtext(Region FE, YES, Country FE, NO, Country Group FE, NO, Satlite FE, YES)

* (3) RE with COUNTRY fixed effects + satellite FE
xtreg log_GDP_pc_Region log_Light_ppix_Region country_dum1-country_dum81 satyear_1-satyear_7 , robust cluster(Country_ISO)
outreg2 using "$OUT/Table_1.xls", append dec(3) ///
    keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_GDP_pc_Country log_region log_area log_region_X_log_area) ///
    addtext(Region FE, NO, Country FE, YES, Country Group FE, NO, Satlite FE, YES)

* (4) Column (3) + national GDP per capita
xtreg log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country country_dum1-country_dum81 satyear_1-satyear_7 , robust cluster(Country_ISO)
outreg2 using "$OUT/Table_1.xls", append dec(3) ///
    keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_GDP_pc_Country log_region log_area log_region_X_log_area) ///
    addtext(Region FE, NO, Country FE, YES, Country Group FE, NO, Satlite FE, YES)

* (5) RE with country-GROUP (region-of-world) FE + satellite FE
*     eap ssa mena lac eca sa = World Bank region dummies (the omitted group
*     is "rest", i.e. high-income/North America).
xtreg log_GDP_pc_Region log_Light_ppix_Region satyear_1-satyear_7 eap ssa mena lac eca sa , robust cluster(Country_ISO)
outreg2 using "$OUT/Table_1.xls", append dec(3) ///
    keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_GDP_pc_Country log_region log_area log_region_X_log_area) ///
    addtext(Region FE, NO, Country FE, NO, Country Group FE, YES, Satlite FE, YES)

* (6) Column (5) + national GDP per capita
xtreg log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country satyear_1-satyear_7 eap ssa mena lac eca sa , robust cluster(Country_ISO)
outreg2 using "$OUT/Table_1.xls", append dec(3) ///
    keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_GDP_pc_Country log_region log_area log_region_X_log_area) ///
    addtext(Region FE, NO, Country FE, NO, Country Group FE, YES, Satlite FE, YES)

* (7) THE PREDICTION MODEL: column (6) + geography & pixel-coding controls.
*     log_N_pix_top_cod_1_ppix / _low_ = share of saturated (top-coded) and
*       unlit (low-coded) pixels - corrects for sensor censoring.
*     log_area, log_region, log_region_X_log_area = region size, number of
*       subnational units, and their interaction. The fitted values of THIS
*       model are the "predicted GDP" used everywhere else in the paper.
xtreg log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_area log_region log_region_X_log_area satyear_1-satyear_7 eap ssa mena lac eca sa , robust cluster(Country_ISO)
outreg2 using "$OUT/Table_1.xls", append dec(3) ///
    keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_GDP_pc_Country log_region log_area log_region_X_log_area) ///
    addtext(Region FE, NO, Country FE, NO, Country Group FE, YES, Satlite FE, YES)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED RESULT (compare with expected/Table_1.txt):
*   log_Light_ppix_Region across cols (1)-(7):
*     .399 / .190 / .153 / .122 / .232 / .104 / .102   (all ***)
*   log_GDP_pc_Country: col(4) .864, col(6) .901, col(7) .889
*   col(7) controls: top-coded .004, low-coded -.007, log_area .183,
*                    log_region .396, log_region_X_log_area -.041
*   N = 5,258 region-years; 1,504 regions.
display as result "Table 1 written to $OUT/Table_1.xls and .txt"
