*===========================================================================*
* Table_B4.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* TABLE B.4 - Spatial-HAC (Conley) robustness of the lights -> GDP regression.
*   Re-estimates the within-region nighttime-lights model of Table 1 column 2
*   (log regional GDP per capita on log regional light per pixel, with region
*   and satellite fixed effects) but replaces the standard errors with
*   spatially-AND-serially robust Conley/Hsiang standard errors. Three columns
*   widen the spatial-correlation cutoff radius: 1000, 2500 and 5000 km.
*
*   The point estimate (0.190) is IDENTICAL to Table 1 col 2 - only the
*   standard errors change. The exercise shows the lights->GDP elasticity is
*   not an artifact of cross-region spatial dependence in the errors.
*
* SELF-CONTAINED: needs only data/Table_B4_data.csv (shipped in this folder).
* SOFTWARE: Stata (R and Python twins included).
*
* REQUIRED PACKAGES:
*   ssc install outreg2                         // formatted table output
*   ols_spatial_HAC  <-- NOT ON SSC. This is Solomon Hsiang's spatial-HAC code
*       (Hsiang 2010, PNAS). Install the "ols_spatial_HAC.ado" distribution
*       (plus its helpers "distance.ado" / "Tdiff.ado") from Hsiang's website
*       or GitHub mirror, e.g. by copying the .ado files into your PERSONAL
*       ado folder (type  -sysdir-  in Stata to find it, usually ~/ado/personal).
*       The table will NOT run without it. See README section 4.
*
* HOW TO RUN: open Stata, `cd` into THIS folder, then:   do Table_B4.do
* OUTPUT: output/Table_B_4.xls and output/Table_B_4.txt
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

* ols_spatial_HAC is NOT on SSC (see header). Check it is reachable; if not,
* stop with a clear message rather than failing cryptically mid-regression.
capture which ols_spatial_HAC
if _rc {
    display as error ///
      "ols_spatial_HAC not found - install Hsiang's spatial-HAC ado files first (see README)."
    exit 199
}

*--------------------------- 3. Import & inspect ---------------------------*
* import delimited reads a CSV. varnames(1)=first row holds names;
* case(preserve) keeps the original upper/lower case of the column names.
* NOTE on satellite dummies: the original ran -xi i.year- and used the resulting
* dummies named _satyear_1.._satyear_7. In this shipped CSV the leading
* underscore was removed (so Stata imports them as valid names): the columns are
* satyear_1..satyear_7. We use the CSV names below.
import delimited "$DATA/Table_B4_data.csv", varnames(1) case(preserve) clear
describe
summarize

*--------------------------- 4. Declare the panel & region dummies ---------*
* The unit is a region (code_Coutry_Region); the time index is year.
tsset code_Coutry_Region year
xtset code_Coutry_Region year

* xi expands the region id into a full set of region dummies named
* _Icode_Cout_2 .. _Icode_Cout_1504 (one dropped as the base). These ARE the
* region fixed effects - ols_spatial_HAC has no -fe- option, so they enter as
* explicit regressors. matsize must be large enough for ~1503 dummies.
xi i.code_Coutry_Region
set matsize 11000

* ols_spatial_HAC needs an explicit constant column (it has no built-in cons).
gen const = 1

*--------------------------- 5. Estimate the 3 columns ---------------------*
* ols_spatial_HAC <depvar> <regressors> , lat() lon() t() p() dist(D) lag(0) bartlett
*   lat()/lon() = region centroid coordinates (for spatial distances)
*   t()         = time variable ; p() = panel (region) id
*   dist(D)     = spatial kernel cutoff radius in KM (errors of regions closer
*                 than D km are allowed to be correlated)
*   lag(0)      = no serial lag beyond the spatial structure
*   bartlett    = Bartlett (triangular) spatial kernel weights
* The coefficient is the same across columns; only the SEs change with dist().
*
* outreg2: replace starts the file; append adds a column; ctitle() names it;
*          keep() prints only the lights coefficient; addtext() writes the FE
*          footer rows; dec(3) = 3 decimals.
* NOTE: the original CODE used dist(2500) for the middle column even though its
*       header COMMENT said "2000km". We trust the code -> 1000 / 2500 / 5000.

* (1) radius = 1000 km
ols_spatial_HAC log_GDP_pc_Region log_Light_ppix_Region ///
    _Icode_Cout_2-_Icode_Cout_1504 satyear_1-satyear_7 const ///
    , lat(Latitude) lon(Longitude) t(year) p(code_Coutry_Region) ///
      dist(1000) lag(0) bartlett
outreg2 using "$OUT/Table_B_4.xls", replace ctitle(r:1000 km) ///
    keep(log_Light_ppix_Region) dec(3) ///
    addtext(Region FE, YES, Country FE, NO, Country Group FE, No, Satlite FE, YES)

* (2) radius = 2500 km
ols_spatial_HAC log_GDP_pc_Region log_Light_ppix_Region ///
    _Icode_Cout_2-_Icode_Cout_1504 satyear_1-satyear_7 const ///
    , lat(Latitude) lon(Longitude) t(year) p(code_Coutry_Region) ///
      dist(2500) lag(0) bartlett
outreg2 using "$OUT/Table_B_4.xls", append ctitle(r:2500 km) ///
    keep(log_Light_ppix_Region) dec(3) ///
    addtext(Region FE, YES, Country FE, NO, Country Group FE, No, Satlite FE, YES)

* (3) radius = 5000 km
ols_spatial_HAC log_GDP_pc_Region log_Light_ppix_Region ///
    _Icode_Cout_2-_Icode_Cout_1504 satyear_1-satyear_7 const ///
    , lat(Latitude) lon(Longitude) t(year) p(code_Coutry_Region) ///
      dist(5000) lag(0) bartlett
outreg2 using "$OUT/Table_B_4.xls", append ctitle(r:5000 km) ///
    keep(log_Light_ppix_Region) dec(3) ///
    addtext(Region FE, YES, Country FE, NO, Country Group FE, No, Satlite FE, YES)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED RESULT (compare with expected/Table_B_4.txt):
*   log_Light_ppix_Region = 0.190*** in ALL three columns (= Table 1 col 2).
*   SEs widen with the radius: (0.020) / (0.025) / (0.027).
*   N = 5,258 ; R-squared = 1.000 (the ~1500 region dummies saturate the fit).
display as result "Table B.4 written to $OUT/Table_B_4.xls and .txt"
