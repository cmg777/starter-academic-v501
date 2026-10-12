*===========================================================================*
* 02_inequality_indices.do  --  STEP 2: regional inequality, per country-year
*---------------------------------------------------------------------------*
* WHAT IT DOES: for every country-year, measure how unequally PREDICTED income
* is distributed ACROSS that country's regions, weighting each region by its
* population. We compute five population-weighted inequality indices and keep
* one row per country-year.
*
* INPUT : $OUT/pred_GDP_pc_Region.csv     OUTPUT: $OUT/Inequality_Data.csv
* Requires:  ssc install ineqdeco
*
* NOTE: this is the slow step (one `ineqdeco` call per country-year group).
*===========================================================================*

clear all
set more off
do "config.do"

* ineqdeco computes decomposable inequality indices for a variable, optionally
* with weights. Install once per machine:
capture which ineqdeco
if _rc ssc install ineqdeco

import delimited "$OUT/pred_GDP_pc_Region.csv", varnames(1) case(preserve) clear

*---------------------------------------------------------------------------*
* One inequality value per group (country-year).
* The ORIGINAL repeated an 8-line loop five times (once per index). Here we run
* ineqdeco ONCE per group and harvest all five returned scalars together, so
* changing $INEQ_VAR / $INEQ_WEIGHT / $INEQ_GROUP is all you need for new data.
*---------------------------------------------------------------------------*
egen _g = group($INEQ_GROUP)
quietly summarize _g, meanonly
local G = r(max)

* placeholders for the five raw ineqdeco return scalars
foreach s in gini gem1 ge0 ge1 ge2 {
    gen double _idx_`s' = .
}

* ineqdeco returns: r(gini), r(gem1)=GE(-1), r(ge0)=MLD, r(ge1)=Theil, r(ge2)
quietly forvalues i = 1/`G' {
    capture ineqdeco $INEQ_VAR [aw=$INEQ_WEIGHT] if _g==`i'
    if _rc==0 {
        foreach s in gini gem1 ge0 ge1 ge2 {
            replace _idx_`s' = r(`s') if _g==`i'
        }
    }
}

* rename to the paper's variable names; CV = sqrt(2 * GE(2))
rename _idx_gini GINIW_pred_GDP_pc
rename _idx_gem1 GE_m1W_pred_GDP_pc
rename _idx_ge0  GE_0W_pred_GDP_pc
rename _idx_ge1  GE_1W_pred_GDP_pc
gen double COVW_pred_GDP_pc = sqrt(_idx_ge2 * 2)
drop _idx_ge2 _g

*---------------------------------------------------------------------------*
* Collapse to ONE row per country-year (the indices are constant within group).
*---------------------------------------------------------------------------*
collapse (first) Country_NAME Country_ISO year Pix_Country Pop_Country         ///
                 pred_GDP_pc_Country GDP_pc_Country_G n_Region                  ///
                 GINIW_pred_GDP_pc GE_m1W_pred_GDP_pc GE_0W_pred_GDP_pc         ///
                 GE_1W_pred_GDP_pc COVW_pred_GDP_pc, by($ID_CTRYYEAR)
sort Country_ISO year
drop $ID_CTRYYEAR

export delimited "$OUT/Inequality_Data.csv", replace
display as result "STEP 2 done: wrote Inequality_Data.csv"
