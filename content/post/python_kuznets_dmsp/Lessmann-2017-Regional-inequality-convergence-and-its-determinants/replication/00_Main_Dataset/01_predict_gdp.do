*===========================================================================*
* 01_predict_gdp.do   --  STEP 1: predict regional GDP from nighttime lights
*---------------------------------------------------------------------------*
* WHAT IT DOES (this is the heart of Lessmann & Seidel 2017):
*   1. Estimate, on the SUBSAMPLE of regions that have OBSERVED regional GDP
*      (Gennaioli et al. 2014), the relationship between log regional GDP and
*      log nighttime lights + controls. This is column (7) of Table 1.
*   2. Use those coefficients to PREDICT log regional GDP for (a) the training
*      regions (used by the validation figures) and (b) EVERY region in the
*      world (used to build the inequality measures in step 2).
*
* WHY A SEPARATE, CONFIG-DRIVEN SCRIPT: when you bring a new nighttime-lights
* dataset you only edit config.do. The prediction below loops over the macro
* lists, so adding/removing a control variable needs NO change here.
*
* INPUT : $F_TRAIN, $F_WORLD          OUTPUT: $OUT/pred_GDP_pc_Region_G.csv
*                                              $OUT/pred_GDP_pc_Region.csv
* Requires: no external packages for this step.
*===========================================================================*

clear all
set more off
do "config.do"                   // load all macros (paths, variable names, model)

*===========================================================================*
* PART A -- ESTIMATE THE PREDICTION MODEL ON THE OBSERVED-GDP SUBSAMPLE
*===========================================================================*
import delimited "$F_TRAIN", varnames(1) case(preserve) clear
describe
encode $ID_COUNTRY, generate(cid)        // numeric country id, needed by cluster()
xtset $ID_REGION $TIME                     // declare the region-year panel

* --- the regression: column (7) of Table 1 -------------------------------- *
* xtreg ... , re   = random-effects (GLS) panel estimator (the xtreg default).
* robust cluster() = standard errors robust to heteroskedasticity and clustered
*                    by country. (Clustering changes SEs only, NOT the point
*                    estimates we use for prediction.)
xtreg $DEPVAR $LIGHTS $X_CORE $X_INTER $FE_SAT $FE_GROUP, re robust cluster(cid)

* --- store the estimated coefficients in scalars --------------------------- *
* We save b_<var> for every regressor plus the constant. Scalars SURVIVE a
* later `import` of a new dataset, so we can apply the SAME coefficients to the
* world sample. Looping over the macro lists keeps this generic: change the
* model in config.do and this loop still picks up exactly the right variables.
scalar b_cons = _b[_cons]
foreach v of varlist $LIGHTS $X_CORE $X_INTER $FE_SAT $FE_GROUP {
    scalar b_`v' = _b[`v']
}
* [Original code did this by hand as `gen beta_1=_b[log_Light_ppix_Region]`, ...,
*  23 lines. The loop above is the generalized equivalent.]

*===========================================================================*
* PART B -- PREDICT ON THE TRAINING SAMPLE (used by validation Figures A.1-A.3)
*===========================================================================*
* Reconstruct the linear prediction b'x as an explicit sum (robust to any
* coefficients Stata may have omitted for collinearity).
gen double pred_log_GDP_pc_Region = b_cons
foreach v of varlist $LIGHTS $X_CORE $X_INTER $FE_SAT $FE_GROUP {
    replace pred_log_GDP_pc_Region = pred_log_GDP_pc_Region + b_`v'*`v'
}
gen double pred_GDP_pc_Region = exp(pred_log_GDP_pc_Region)        // back to levels
gen double pred_GDP_Region    = pred_GDP_pc_Region * $POP_REGION   // region total
* aggregate predicted region totals up to the country, then per capita
egen double pred_GDP_Country  = sum(pred_GDP_Region), by($ID_CTRYYEAR)
gen  double pred_GDP_pc_Country = pred_GDP_Country / $POP_COUNTRY

* the OBSERVED national GDP of the training countries (Gennaioli sample marker).
* log_GDP_pc_Country is log(GDP_pc_Country), so exp() recovers the level.
gen double GDP_pc_Country_G = exp(log_GDP_pc_Country)
label variable GDP_pc_Country_G "GDP per capita country, Gennaioli et al. (2014) sample"

export delimited "$OUT/pred_GDP_pc_Region_G.csv", replace

* keep a tiny country-year lookup so the world step can flag training countries
preserve
    keep $ID_CTRYYEAR GDP_pc_Country_G
    bysort $ID_CTRYYEAR: keep if _n==1
    tempfile gennaioli
    save "`gennaioli'"
restore

*===========================================================================*
* PART C -- PREDICT ON THE WHOLE WORLD
*===========================================================================*
import delimited "$F_WORLD", varnames(1) case(preserve) clear

* reconcile the one differently-named column so the SAME b_<var> scalars apply
if "$WORLD_INTER" != "" rename $WORLD_INTER $X_INTER

* same explicit-sum prediction as Part B, reusing the stored scalars
gen double pred_log_GDP_pc_Region = b_cons
foreach v of varlist $LIGHTS $X_CORE $X_INTER $FE_SAT $FE_GROUP {
    replace pred_log_GDP_pc_Region = pred_log_GDP_pc_Region + b_`v'*`v'
}
drop if pred_log_GDP_pc_Region == .                      // regions missing inputs
gen double pred_GDP_pc_Region = exp(pred_log_GDP_pc_Region)
gen double pred_GDP_Region    = pred_GDP_pc_Region * $POP_REGION
egen double pred_GDP_Country   = sum(pred_GDP_Region), by($ID_CTRYYEAR)
gen  double pred_GDP_pc_Country = pred_GDP_Country / $POP_COUNTRY

* attach observed national GDP for the training countries (missing elsewhere)
merge m:1 $ID_CTRYYEAR using "`gennaioli'", keep(master match) nogenerate

export delimited "$OUT/pred_GDP_pc_Region.csv", replace
display as result "STEP 1 done: wrote pred_GDP_pc_Region_G.csv and pred_GDP_pc_Region.csv"
