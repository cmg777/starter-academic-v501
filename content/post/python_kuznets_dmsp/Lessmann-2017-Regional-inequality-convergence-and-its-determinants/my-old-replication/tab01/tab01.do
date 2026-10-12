cls
**=====================================================
** Program Name: GDP vs NTL relationship
** Author: Carlos Mendez
** Date: 2021-11-20
** --------------------------------------------------------------------------------------------
** Inputs/Ouputs:
* Data files used:
				* Prediction_Data.dta

* Data files created as intermediate product:

* Data files created as final product:

**=====================================================


** 1. Setup
	* At home
*cd "/Users/carlos/Github/QuaRCS-lab/tutorial-lessmann/tab01"
	* At work
cd "/Users/carlosmendez/Documents/GitHub/00DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants/tab01"
clear all
macro drop _all
capture log close
set more off
version 15
*set matsize 11000

** 2. Open log file
log using "tab01logFILE.txt", text replace

** 3. Install modules
*ssc install estout, replace
*ssc install outreg2, replace
*net install tsg_schemes, from("https://raw.githubusercontent.com/asjadnaqvi/Stata-schemes/main/schemes/") replace
*set scheme white_tableau, permanently

** 4. Import data
use "Prediction_Data.dta", clear

describe
summarize

** Set panel dataset
xtset code_Coutry_Region year

** Generate year fixed effects
xi i.year

** Generate country-group (supra-national) fixed effects
xi i.code_Coutry_Region

** Generate table 1
	* Random effects Model (1): Use only ONE predictor (Lights per pixel) wit NO fixed effects (Note: Stata estimate a random effects model by defult)
xtreg log_GDP_pc_Region log_Light_ppix_Region, robust cluster(Country_ISO)
outreg2 using tab01.tex, tex(fragment) replace keep(log_Light_ppix_Region  log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country   log_region log_area  log_region_X_log_area  ) addtext(Region FE, NO, Country FE, NO, Country Group FE, NO, Satlite FE, NO) dec(3)

	* Pooled Model (2): Use only ONE predictor (Lights per pixel) with TWO fixed effects: Region FE and Satellite FE
reg log_GDP_pc_Region log_Light_ppix_Region    _Icode_Cout_2-_Icode_Cout_1504 _satyear_1-_satyear_7 , robust cluster(Country_ISO)
outreg2 using tab01.tex, tex(fragment) append  keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country    log_region log_area  log_region_X_log_area  ) addtext(Region FE, YES, Country FE, NO, Country Group FE, NO, Satlite FE, YES) dec(3)

	* Random effects Model (3): Use only ONE predictor (Lights per pixel) with TWO fixed effects: Country FE and Satellite FE
xtreg log_GDP_pc_Region log_Light_ppix_Region    country_dum1-country_dum81  _satyear_1-_satyear_7, robust  cluster(Country_ISO)
outreg2 using tab01.tex, tex(fragment) append  keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country    log_region log_area  log_region_X_log_area  ) addtext(Region FE, NO, Country FE, YES, Country Group FE, NO, Satlite FE, YES) dec(3)

	* Random effects Model (4): Use TWO predictors (Lights per pixel and country GDPpc) with TWO fixed effects: Country FE and Satellite FE
xtreg log_GDP_pc_Region log_Light_ppix_Region    log_GDP_pc_Country country_dum1-country_dum81  _satyear_1-_satyear_7, robust  cluster(Country_ISO)
outreg2 using tab01.tex, tex(fragment) append  keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix   log_GDP_pc_Country    log_region log_area  log_region_X_log_area ) addtext(Region FE, NO, Country FE, YES, Country Group FE, NO, Satlite FE, YES) dec(3)

	* Random effects Model (5): Use only ONE predictor (Lights per pixel) with TWO fixed effects: Satellite FE and Country group FE
xtreg log_GDP_pc_Region log_Light_ppix_Region     _satyear_1-_satyear_7 eap ssa  mena lac eca sa, robust cluster(Country_ISO)
outreg2 using tab01.tex, tex(fragment) append  keep(log_Light_ppix_Region  log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country    log_region log_area  log_region_X_log_area  ) addtext(Region FE, NO, Country FE, NO, Country Group FE, YES, Satlite FE, YES) dec(3)

	* Random effects Model (6):  Use TWO predictors (Lights per pixel and country GDPpc) with TWO fixed effects: Satellite FE and Country group FE
xtreg log_GDP_pc_Region log_Light_ppix_Region    log_GDP_pc_Country  _satyear_1-_satyear_7 eap ssa  mena lac eca sa, robust cluster(Country_ISO)
outreg2 using tab01.tex, tex(fragment) append  keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country     log_region log_area  log_region_X_log_area  ) addtext(Region FE, NO, Country FE, NO, Country Group FE, YES, Satlite FE, YES) dec(3)

	* Random effects Model (7): Use ALL predictors (Lights per pixel, country GDPpc, #TopCodPixels,  #LowCodPixels, country area, #regions, #regionsXarea) with TWO fixed effects: Satellite FE and Country group FE
xtreg log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country log_N_pix_top_cod_1_ppix  log_N_pix_low_cod_1_ppix  log_area log_region log_region_X_log_area _satyear_1-_satyear_7  eap ssa  mena lac eca sa , robust cluster(Country_ISO)
outreg2 using tab01.tex, tex(fragment) append  keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country      log_region log_area  log_region_X_log_area ) addtext(Region FE, NO, Country FE, NO, Country Group FE, YES, Satlite FE, YES) dec(3)



** 99. Close log file
log close

**====================END==============================
