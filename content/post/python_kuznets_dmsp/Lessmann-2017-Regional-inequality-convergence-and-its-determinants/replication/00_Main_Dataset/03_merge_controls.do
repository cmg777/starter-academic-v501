*===========================================================================*
* 03_merge_controls.do  --  STEP 3: assemble the final analysis dataset
*---------------------------------------------------------------------------*
* WHAT IT DOES: merge the country-level control variables ($F_COUNTRY) with the
* regional-inequality measures from step 2, keeping only countries-years present
* in BOTH. The result, Main_Data, is the input for Tables 3-4 and Figures 2-5,
* A.4, B.3.
*
* INPUT : $F_COUNTRY, $OUT/Inequality_Data.csv
* OUTPUT: $OUT/Main_Data.csv   (open format)  and  $OUT/Main_Data.dta (labelled)
*===========================================================================*

clear all
set more off
do "config.do"

* Stata's `merge` needs the "using" file in .dta form, so load the inequality
* CSV first and stash it as a temporary .dta.
import delimited "$OUT/Inequality_Data.csv", varnames(1) case(preserve) clear
tempfile ineq
save "`ineq'"

* master = country controls; then 1:1 merge on country-year, keep matches only.
* (The original used the pre-Stata-11 syntax `merge ... using, unique` followed
*  by `keep if _merge==3`; `merge 1:1 ..., keep(match) nogenerate` is the modern
*  equivalent.)
import delimited "$F_COUNTRY", varnames(1) case(preserve) clear
merge 1:1 $ID_COUNTRY $TIME using "`ineq'", keep(match) nogenerate
sort $ID_COUNTRY $TIME

*--- variable labels (documentation; carried in the .dta output) ------------*
label variable Pix_Country          "Area of a country measured by the number of pixels"
label variable Pop_Country          "Country total population"
label variable pred_GDP_pc_Country  "Predicted GDP per capita, country"
label variable GDP_pc_Country_G     "GDP per capita country, Gennaioli et al. (2014)"
label variable n_Region             "Number of subnational regions of a country"
label variable GINIW_pred_GDP_pc    "Predicted regional inequality, population-weighted Gini coefficient"
label variable GE_m1W_pred_GDP_pc   "Predicted regional inequality, population-weighted generalized entropy a=-1"
label variable GE_0W_pred_GDP_pc    "Predicted regional inequality, population-weighted mean log deviation"
label variable GE_1W_pred_GDP_pc    "Predicted regional inequality, population-weighted Theil index"
label variable COVW_pred_GDP_pc     "Predicted regional inequality, population-weighted coefficient of variation"

export delimited "$OUT/Main_Data.csv", replace
save           "$OUT/Main_Data.dta", replace
display as result "STEP 3 done: wrote Main_Data.csv and Main_Data.dta"
