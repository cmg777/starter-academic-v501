*===========================================================================*
* 00_run_all.do  --  run the whole main-dataset pipeline end to end
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017). Reproduces, from the raw nighttime-lights panels:
*     STEP 1  lights  -> predicted regional GDP        (01_predict_gdp.do)
*     STEP 2  predicted GDP -> inequality indices       (02_inequality_indices.do)
*     STEP 3  + country controls -> Main_Data           (03_merge_controls.do)
*
* HOW TO RUN
*   1. In Stata, change directory into THIS folder:   cd "<path>/00_Main_Dataset"
*   2. Install the one required package (once):        ssc install ineqdeco
*   3. Run this file:                                  do 00_run_all.do
*
* TO RE-RUN ON A NEW NIGHTTIME-LIGHTS DATASET: edit only config.do (file paths
* and the $LIGHTS variable name), then run this script again. Nothing else.
*===========================================================================*

clear all
set more off

do "config.do"        // sanity-load macros and confirm ROOT prints correctly

display as text _n "==================== STEP 1: predict GDP ===================="
do "01_predict_gdp.do"

display as text _n "============ STEP 2: regional inequality indices ============"
do "02_inequality_indices.do"

display as text _n "=============== STEP 3: assemble Main_Data =================="
do "03_merge_controls.do"

display as result _n "PIPELINE COMPLETE. Final dataset: $OUT/Main_Data.csv"
