*===========================================================================*
* config.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017) - "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* THIS IS THE ONLY FILE YOU NEED TO EDIT TO RE-RUN THE PIPELINE ON NEW DATA
* (for example, a new nighttime-lights product). Everything downstream reads
* these macros (`global` = a named text macro that lives for the whole Stata
* session), so the three stage scripts never hard-code a variable or filename.
*
* HOW TO USE: this file is `do`-ne automatically by 00_run_all.do and by each
* stage script, so you normally never run it by itself.
*===========================================================================*

version 13                      // pin the Stata language version (reproducibility)

*---------------------------------------------------------------------------*
* 1. FOLDER PATHS (portable: based on the current working directory)
*    `c(pwd)' is Stata's built-in macro for the current working directory.
*    The README tells the user to `cd` into this folder before running, so
*    these resolve correctly on ANY computer with no editing.
*---------------------------------------------------------------------------*
global ROOT "`c(pwd)'"
global DATA "$ROOT/data"          // input CSVs live here
global OUT  "$ROOT/output"        // the pipeline writes its results here
capture mkdir "$OUT"              // `capture' = run quietly, ignore "already exists"

*---------------------------------------------------------------------------*
* 2. INPUT FILES  (open CSV format; Stata reads them with `import delimited`)
*---------------------------------------------------------------------------*
global F_TRAIN   "$DATA/Prediction_Data.csv"    // TRAINING set: regions that HAVE observed GDP
global F_WORLD   "$DATA/Regional_Data_SL.csv"   // ALL world regions (we predict GDP here)
global F_COUNTRY "$DATA/Country_DATA.csv"        // country-level control variables

*---------------------------------------------------------------------------*
* 3. IDENTIFIERS
*---------------------------------------------------------------------------*
global ID_REGION   code_Coutry_Region    // numeric region id (the panel unit)
global ID_COUNTRY  Country_ISO           // country code, ISO 3166-1 alpha-3
global ID_CTRYYEAR id_t_j                // country-year id (used to aggregate regions->country)
global TIME        year

*---------------------------------------------------------------------------*
* 4. THE NIGHTTIME-LIGHTS REGRESSOR  <<< CHANGE THIS FOR A NEW LIGHTS PRODUCT
*    The whole point of the paper: predict regional GDP from satellite lights.
*    If your new dataset names the lights variable differently, edit it here
*    (and make sure that column exists in BOTH $F_TRAIN and $F_WORLD).
*---------------------------------------------------------------------------*
global LIGHTS      log_Light_ppix_Region

*---------------------------------------------------------------------------*
* 5. PREDICTION MODEL  (this is column (7) of Table 1)
*    DEPVAR  = the thing we predict (log regional GDP per capita)
*    X_CORE  = the non-lights controls
*    X_INTER = the area x #regions interaction, AS NAMED IN THE TRAINING FILE
*    FE_SAT  = satellite-generation dummies (listed explicitly so we can loop)
*    FE_GROUP= World-Bank region-group dummies (USA & Canada are the omitted base)
*---------------------------------------------------------------------------*
global DEPVAR      log_GDP_pc_Region
global X_CORE      log_GDP_pc_Country log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_area log_region
global X_INTER     log_region_X_log_area
global FE_SAT      satyear_1 satyear_2 satyear_3 satyear_4 satyear_5 satyear_6 satyear_7
global FE_GROUP    eap ssa mena lac eca sa

* The world file calls the interaction term differently (no "_X_"). We rename it
* to $X_INTER inside 01_predict_gdp.do so the SAME coefficient name applies to
* both samples. If your new world file already matches, leave WORLD_INTER empty.
global WORLD_INTER log_region_log_area

*---------------------------------------------------------------------------*
* 6. POPULATION (used to turn per-capita region GDP into totals, then country GDP)
*---------------------------------------------------------------------------*
global POP_REGION  Pop_Region
global POP_COUNTRY Pop_Country

*---------------------------------------------------------------------------*
* 7. INEQUALITY MEASUREMENT  (Step 2 of the pipeline)
*    INEQ_VAR    = the per-capita variable whose dispersion we measure
*    INEQ_WEIGHT = analytic weights (population) -> "population-weighted" indices
*    INEQ_GROUP  = produce ONE set of indices per country per year
*---------------------------------------------------------------------------*
global INEQ_VAR    pred_GDP_pc_Region
global INEQ_WEIGHT Pop_Region
global INEQ_GROUP  Country_ISO year

display as result "config.do loaded. ROOT = $ROOT"
