*===========================================================================*
* Table_2.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* TABLE 2 - Correlation between PREDICTED-income, OBSERVED-income and
*           LIGHT-density measures of regional inequality, in the cross-section
*           mean of the period 2001-2012. For each of FIVE inequality indices
*           (Gini, GE(-1), MLD GE(0), Theil GE(1), CV) we compute, per country,
*           three versions: one from satellite-PREDICTED regional GDP per capita,
*           one from OBSERVED regional GDP per capita, and one from raw regional
*           LIGHT per capita. We then correlate the three across countries to
*           show how well the night-lights proxy tracks real regional inequality.
*
* SELF-CONTAINED: needs only data/Table_2_data.csv (shipped in this folder).
* SOFTWARE: Stata (R and Python twins included).
* REQUIRED PACKAGE (install once):   ssc install ineqdeco
*
* HOW TO RUN: open Stata, `cd` into THIS folder, then:   do Table_2.do
* OUTPUT: output/Table_2.txt (the five pwcorr matrices, logged to file)
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
* ineqdeco computes decomposable inequality indices (Gini + Generalized
* Entropy class) for a variable, with optional analytic weights.
capture which ineqdeco
if _rc ssc install ineqdeco

*--------------------------- 3. Import & inspect ---------------------------*
* import delimited reads a CSV. varnames(1)=first row holds names;
* case(preserve) keeps the original upper/lower case of the column names.
import delimited "$DATA/Table_2_data.csv", varnames(1) case(preserve) clear
describe
summarize

*--------------------------- 4. Sample & light-per-capita ------------------*
* Light per capita per region (the raw nightlight proxy for income density).
gen Light_pc_Region = Light_Region/Pop_Region

* Restrict to the manuscript's cross-section window: years 2001-2012.
keep if year>2000 & year<2013

*--------------------------- 5. Five inequality indices x THREE bases ------*
* The ORIGINAL copy-pasted an 8-line loop FIFTEEN times (5 indices x 3 base
* variables), running `ineqdeco` once per index. Here we follow the pattern in
* 00_Main_Dataset/02_inequality_indices.do: loop over the THREE base variables,
* call ineqdeco ONCE per country-year group, and harvest all five returned
* scalars together. The numbers produced are identical.
*
* ineqdeco returns: r(gini), r(gem1)=GE(-1), r(ge0)=MLD, r(ge1)=Theil, r(ge2).
* The coefficient of variation is CV = sqrt(2 * GE(2)).
*
* Each base variable maps to a suffix used in the output variable names:
*   pred_GDP_pc_Region -> pred_GDP_pc  (satellite-predicted income)
*   GDP_pc_Region      -> GDP_pc       (observed income)
*   Light_pc_Region    -> Light_pc     (raw light density)

* Numeric country-year group id (constant within a country-year).
egen group = group(Country_ISO year)
quietly summarize group, meanonly
local G = r(max)

* Loop over the three base variables paired with their output suffix.
local bases "pred_GDP_pc_Region GDP_pc_Region Light_pc_Region"
local sufs  "pred_GDP_pc       GDP_pc        Light_pc"
local nb : word count `bases'

forvalues b = 1/`nb' {
    local var : word `b' of `bases'
    local suf : word `b' of `sufs'

    * placeholders for the four "raw" indices + a temp for GE(2)->CV
    gen double GINIW_`suf'  = .
    gen double GE_m1W_`suf' = .
    gen double GE_0W_`suf'  = .
    gen double GE_1W_`suf'  = .
    gen double _ge2_`suf'   = .

    * one ineqdeco call per country-year group; harvest all five scalars
    quietly forvalues i = 1/`G' {
        capture ineqdeco `var' [aw=Pop_Region] if group==`i'
        if _rc==0 {
            replace GINIW_`suf'  = r(gini) if group==`i'
            replace GE_m1W_`suf' = r(gem1) if group==`i'
            replace GE_0W_`suf'  = r(ge0)  if group==`i'
            replace GE_1W_`suf'  = r(ge1)  if group==`i'
            replace _ge2_`suf'   = r(ge2)  if group==`i'
        }
    }

    * CV (population-weighted coefficient of variation) from GE(2)
    gen double COVW_`suf' = sqrt(_ge2_`suf'*2)
    drop _ge2_`suf'
}
drop group

*--------------------------- 6. Collapse to the cross-section --------------*
* One row per country: the mean of each index over 2001-2012 (the indices are
* constant within a country-year, so this just averages across the years).
* NOTE: the original used a dash-range `collapse (mean) GINIW_pred_GDP_pc -
* COVW_Light_pc`. With a trimmed file that range would break, so we list all
* fifteen index variables explicitly.
collapse (mean) ///
    GINIW_pred_GDP_pc GE_m1W_pred_GDP_pc GE_0W_pred_GDP_pc GE_1W_pred_GDP_pc COVW_pred_GDP_pc ///
    GINIW_GDP_pc      GE_m1W_GDP_pc      GE_0W_GDP_pc      GE_1W_GDP_pc      COVW_GDP_pc      ///
    GINIW_Light_pc    GE_m1W_Light_pc    GE_0W_Light_pc    GE_1W_Light_pc    COVW_Light_pc,   ///
    by(Country_ISO)

*--------------------------- 7. Pairwise correlations ----------------------*
* For each index, correlate the three versions (predicted vs observed vs light)
* across countries. The manuscript's Table 2 reports the off-diagonal
* correlations of PREDICTED-vs-? and LIGHT-vs-? against OBSERVED income.
* IMPROVEMENT over the original (which only displayed results): we also LOG the
* five correlation matrices to output/Table_2.txt so the table is saved.
log using "$OUT/Table_2.txt", text replace

display as result "=== Gini ============================================="
pwcorr GINIW_pred_GDP_pc  GINIW_GDP_pc  GINIW_Light_pc

display as result "=== GE(-1) ==========================================="
pwcorr GE_m1W_pred_GDP_pc GE_m1W_GDP_pc GE_m1W_Light_pc

display as result "=== MLD GE(0) ========================================"
pwcorr GE_0W_pred_GDP_pc  GE_0W_GDP_pc  GE_0W_Light_pc

display as result "=== Theil GE(1) ======================================"
pwcorr GE_1W_pred_GDP_pc  GE_1W_GDP_pc  GE_1W_Light_pc

display as result "=== CV ==============================================="
pwcorr COVW_pred_GDP_pc   COVW_GDP_pc   COVW_Light_pc

log close

*--------------------------- 99. Done --------------------------------------*
* EXPECTED RESULT (manuscript Table 2, p.117; 2001-2012, 78 countries):
*   correlation of PREDICTED with OBSERVED income:
*     GINIW .50, GE(-1) .40, MLD .45, Theil .50, CV .52
*   correlation of LIGHT density with OBSERVED income:
*     GINIW .21, GE(-1) .11, MLD .21, Theil .30, CV .29
* (There is no committed Table_2.txt target; the manuscript is the authority.)
display as result "Table 2 written to $OUT/Table_2.txt"
