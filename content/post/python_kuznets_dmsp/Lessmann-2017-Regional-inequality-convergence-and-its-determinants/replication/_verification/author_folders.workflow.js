export const meta = {
  name: 'author-lessmann-folders',
  description: 'Author standalone Stata .do + README for the 14 remaining table/figure folders',
  phases: [{ title: 'Author', detail: 'one agent per folder writes .do + README' }],
}

const REPO = '/Users/carlosmendez/Documents/GitHub/00DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants'
const REP  = `${REPO}/replication`

// Shared rules every agent must follow.
const COMMON = `
You are authoring ONE self-contained replication folder for the paper
Lessmann & Seidel (2017) "Regional inequality, convergence, and its determinants
- A view from outer space" (European Economic Review 92:110-132).

LANGUAGE: Stata only (the user chose Stata; do NOT write R/Python). The code is a
FAITHFUL refactor of the original working scripts - keep the exact regression/plot
commands; only change (a) data loading to read the shipped CSV, (b) output paths,
(c) add heavy pedagogical annotation.

STYLE: You MUST read these exemplars first and match their header, numbered
sections, and inline-comment density EXACTLY:
  - ${REP}/Table_3/Table_3.do  and  ${REP}/Table_3/README.md     (table style)
  - ${REP}/Figure_4/Figure_4.do and ${REP}/Figure_4/README.md    (figure style)
Standard do-file header to reuse (portable working directory):
  clear all
  macro drop _all
  capture log close
  set more off
  version 13            // use 15 for map folders (spshape2dta)
  global ROOT "\`c(pwd)'"
  global DATA "$ROOT/data"
  global OUT  "$ROOT/output"
  capture mkdir "$OUT"

DATA LOADING: the original used  use "Data\\X.dta", clear . Replace with:
  import delimited "$DATA/<csvfile>", varnames(1) case(preserve) clear
CSV column names are CASE-SENSITIVE and exactly as listed in the spec (e.g.
Country_ISO, GINIW_pred_GDP_pc, satyear_1). The original wrote satellite dummies
as _satyear_1.._satyear_7; in the CSV they are satyear_1..satyear_7 (leading
underscore removed so Stata imports them) - use the CSV names and note this.

COLLAPSE: if the original used a dash-range like
  collapse (firstnm) Country_NAME (mean) fedelupd2-COVW_pred_GDP_pc, by(...)
REPLACE the dash range with an EXPLICIT variable list (the trimmed CSV would
break the range). List exactly the variables the models below need.

OUTPUT: write results into $OUT (output/). For tables use outreg2 (it writes both
.xls and a .txt). For figures use  graph export "$OUT/<name>.png", replace width(1600)
AND  saving("$OUT/<name>", replace)  for the .gph.

DELIVERABLES (write exactly these two files; do NOT touch data/ or expected/):
  1. <folder>/<DoName>     -- the annotated standalone do-file
  2. <folder>/README.md    -- same section structure as the exemplar README:
       1 What this shows (plain economics)
       2 Method, explained simply
       3 Data dictionary (a markdown table of EVERY column in the CSV; read the
         folder's existing data_dictionary.csv for names+labels)
       4 How to run (Stata; required ssc packages; cd then do)
       5 Expected result (the pinned numbers in this spec)
       6 Provenance (trimmed from which source; produced by 00_Main_Dataset)
The folder already contains data/<csv>, data_dictionary.csv, and expected/ targets
- reference them, do not overwrite them. Return a one-line status.
`

const SPECS = [
//============================ TABLES ====================================
{
  dir: 'Table_1', doName: 'Table_1.do', kind: 'table',
  title: 'Table 1 - Nighttime lights predict regional GDP (7 specifications)',
  csv: 'Table_1_data.csv',
  cols: 'code_Coutry_Region, Country_ISO, year, log_GDP_pc_Region, log_Light_ppix_Region, log_GDP_pc_Country, log_N_pix_top_cod_1_ppix, log_N_pix_low_cod_1_ppix, log_area, log_region, log_region_X_log_area, eap, eca, lac, mena, sa, ssa, satyear_1..satyear_7, country_dum1..country_dum81',
  packages: 'ssc install outreg2',
  notes: `Setup before models: tsset code_Coutry_Region year ; xtset code_Coutry_Region year ;
xi i.code_Coutry_Region (creates region dummies _Icode_Cout_2-_Icode_Cout_1504) ; set matsize 11000.
The 81 country dummies country_dum1-country_dum81 are SHIPPED in the CSV (used for country FE in cols 3-4).
Satellite dummies are satyear_1-satyear_7 in the CSV (original _satyear_1-_satyear_7).
Models (keep exactly; col1 & cols 3-7 are xtreg RE = default, col2 is plain reg/OLS):
 (1) xtreg log_GDP_pc_Region log_Light_ppix_Region , robust cluster(Country_ISO)
 (2) reg   log_GDP_pc_Region log_Light_ppix_Region _Icode_Cout_2-_Icode_Cout_1504 satyear_1-satyear_7 , robust cluster(Country_ISO)
 (3) xtreg log_GDP_pc_Region log_Light_ppix_Region country_dum1-country_dum81 satyear_1-satyear_7 , robust cluster(Country_ISO)
 (4) xtreg log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country country_dum1-country_dum81 satyear_1-satyear_7 , robust cluster(Country_ISO)
 (5) xtreg log_GDP_pc_Region log_Light_ppix_Region satyear_1-satyear_7 eap ssa mena lac eca sa , robust cluster(Country_ISO)
 (6) xtreg log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country satyear_1-satyear_7 eap ssa mena lac eca sa , robust cluster(Country_ISO)
 (7) xtreg log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_area log_region log_region_X_log_area satyear_1-satyear_7 eap ssa mena lac eca sa , robust cluster(Country_ISO)
After each: outreg2 using "$OUT/Table_1.xls", [replace for col1 | append] dec(3) ///
 keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_GDP_pc_Country log_region log_area log_region_X_log_area) ///
 addtext(Region FE, <NO/YES>, Country FE, <..>, Country Group FE, <..>, Satlite FE, <..>)
FE flags per column (Region/Country/Group/Satellite): (1)NO,NO,NO,NO  (2)YES,NO,NO,YES  (3)NO,YES,NO,YES  (4)NO,YES,NO,YES  (5)NO,NO,YES,YES  (6)NO,NO,YES,YES  (7)NO,NO,YES,YES.`,
  pins: 'log_Light_ppix_Region across cols = .399/.190/.153/.122/.232/.104/.102 (all ***); col4 log_GDP_pc_Country .864, col6 .901, col7 .889; col7 controls .004/-.007/.183/.396/-.041; N=5,258; 1,504 regions. Compare expected/Table_1.txt.',
},
{
  dir: 'Table_2', doName: 'Table_2.do', kind: 'table',
  title: 'Table 2 - Correlation of predicted / observed / light inequality measures',
  csv: 'Table_2_data.csv',
  cols: 'Country_ISO, year, pred_GDP_pc_Region, GDP_pc_Region, Light_Region, Light_Country, Pop_Region, Pop_Country',
  packages: 'ssc install ineqdeco',
  notes: `Steps (faithful to original lines 47-213): gen Light_pc_Region = Light_Region/Pop_Region ;
keep if year>2000 & year<2013. Then compute 5 population-weighted inequality indices
THREE times - for pred_GDP_pc_Region, for observed GDP_pc_Region, and for Light_pc_Region -
each via a loop over country-year groups calling: ineqdeco <var> [aw=Pop_Region] if group==i ,
harvesting r(gini),r(gem1),r(ge0),r(ge1),r(ge2); CV = sqrt(2*ge2). You MAY (encouraged)
write ONE generic loop over the three base variables and a list of the five return scalars
(see ${REP}/00_Main_Dataset/02_inequality_indices.do for that pattern) instead of copy-pasting
15 loops, but the result must be the same. Name vars GINIW_pred_GDP_pc, GINIW_GDP_pc,
GINIW_Light_pc (and GE_m1W_*, GE_0W_*, GE_1W_*, COVW_*). Then:
  collapse (mean) GINIW_pred_GDP_pc - COVW_Light_pc , by(Country_ISO)   [list explicitly]
Then five pairwise correlations comparing predicted vs observed vs light for each index:
  pwcorr GINIW_pred_GDP_pc GINIW_GDP_pc GINIW_Light_pc   (and the other four).
IMPROVEMENT over original: also write the correlations to output/Table_2.txt using e.g.
  log using "$OUT/Table_2.txt", text replace   ... pwcorr ...   log close
so the table is saved, not just shown.`,
  pins: 'Manuscript Table 2 (p.117), period 2001-2012, 78 countries. Correlation with predicted income: GINIW 0.50, GE(-1) 0.40, MLD 0.45, Theil 0.50, CV 0.52. Correlation with light density: 0.21 / 0.11 / 0.21 / 0.30 / 0.29. (There is no committed Table_2.txt; the manuscript is the authority.)',
},
{
  dir: 'Table_4', doName: 'Table_4.do', kind: 'table',
  title: 'Table 4 - Determinants of regional inequality with controls',
  csv: 'Table_4_data.csv',
  cols: 'Country_NAME, Country_ISO, year, GINIW_pred_GDP_pc, GDP_pc_Country, Pop_Country, Resources_rents_share_of_GDP, Arable_land, Trade_GDP_share, FDI_share_of_GDP, area, price_gasoline, Aid, School_enrollment_secondary, GINIW_Eth_light, Polity2, fedelupd2',
  packages: 'ssc install outreg2',
  notes: `Same 5-year-average panel setup as Table 3 (make p5year; collapse with EXPLICIT list;
gen cubic in log GDP; encode Country_ISO -> Country_ISO_long; xtset; xi i.p5year).
Generate controls exactly: aid_GDP = Aid/(GDP_pc_Country*Pop_Country) ;
replace Resources_rents_share_of_GDP = Resources_rents_share_of_GDP/100 ;
replace School_enrollment_secondary = School_enrollment_secondary/100 ;
gen Area_X_price_gasoline = area*price_gasoline/10e+6 ;
egen fedlup = mean(fedelupd2), by(Country_ISO) ; gen log_GDP_pc_Country_X_fedlup = log_GDP_pc_Country*fedlup.
FIVE reproducible models, all: xtreg GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 <controls> i.p5year, fe robust cluster(Country_ISO_long)
 (1) + Resources_rents_share_of_GDP Arable_land
 (2) + Trade_GDP_share FDI_share_of_GDP
 (3) + area price_gasoline Area_X_price_gasoline
 (4) + aid_GDP School_enrollment_secondary
 (5) + GINIW_Eth_light
outreg2 using "$OUT/Table_4.xls", [replace|append] dec(3) addtext(Country FE, YES, Year FE, YES) ///
  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP area price_gasoline Area_X_price_gasoline aid_GDP School_enrollment_secondary GINIW_Eth_light)
CRITICAL: the PUBLISHED Table 4 has a 6th column (between models 3 and 4) using icrg_bureaucratic_qualitiy,
Polity2 and the federal interaction. That variable (icrg_bureaucratic_qualitiy) is ABSENT from the data,
so it CANNOT be reproduced. Include the original commented-out block VERBATIM with an explanatory comment,
and document this prominently in the README (the reproduced table has 5 columns = published cols 1,2,3,5,6).`,
  pins: 'col1 rents 0.018***, arable -0.053*** (N=857); col2 trade 0.005***, FDI 0.009 (N=817); col3 gasoline 0.001, Area_X_gasoline 0.006** (N=676); col4(reproduced=published col5) aid_GDP 0.015**, school -0.014* (N=591); col5(=published col6) GINIW_Eth_light 0.071*** (N=845). Compare expected/Table_4.txt (its cols 1,2,3,5,6).',
},
{
  dir: 'Table_B4', doName: 'Table_B4.do', kind: 'table',
  title: 'Table B.4 - Spatial-HAC (Conley) robustness of the lights->GDP regression',
  csv: 'Table_B4_data.csv',
  cols: 'code_Coutry_Region, Country_ISO, year, Latitude, Longitude, log_GDP_pc_Region, log_Light_ppix_Region, satyear_1..satyear_7',
  packages: 'ols_spatial_HAC (NOT on SSC; see note) and the region-FE setup',
  notes: `Setup: tsset code_Coutry_Region year ; xtset code_Coutry_Region year ;
xi i.code_Coutry_Region (region dummies _Icode_Cout_2-_Icode_Cout_1504) ; set matsize 11000 ; gen const=1.
Three runs (radii 1000, 2500, 5000 km - the original CODE uses 2500 even though its comment says 2000; trust the code):
  ols_spatial_HAC log_GDP_pc_Region log_Light_ppix_Region _Icode_Cout_2-_Icode_Cout_1504 satyear_1-satyear_7 const , lat(Latitude) lon(Longitude) t(year) p(code_Coutry_Region) dist(<D>) lag(0) bartlett
  outreg2 using "$OUT/Table_B_4.xls", [replace|append] ctitle(r:<D> km) keep(log_Light_ppix_Region) addtext(Region FE, YES, Country FE, NO, Country Group FE, No, Satlite FE, YES) dec(3)
DEPENDENCY WARNING (put in README): ols_spatial_HAC is NOT on SSC. It is Solomon Hsiang's
spatial-HAC code (Hsiang 2010, PNAS). Install from his distribution (e.g. the GitHub/website
"ols_spatial_HAC.ado" + "Tdiff.ado","distance.ado", or the package commonly mirrored as
"ols_spatial_HAC"); the table will NOT run without it. The point estimate equals Table 1 col 2.`,
  pins: 'log_Light_ppix_Region = 0.190*** in all three columns; SEs 0.020 / 0.025 / 0.027; N=5,258; R-squared 1.000 (region FE saturate). Compare expected/Table_B_4.txt.',
},
//============================ FIGURES (scatter/line) =====================
{
  dir: 'Figure_5', doName: 'Figure_5.do', kind: 'figure',
  title: 'Figure 5 - Regional inequality vs personal inequality (5a) and conflict (5b)',
  csv: 'Figure_5_data.csv',
  cols: 'Country_ISO, Country_NAME, year, GINIW_pred_GDP_pc, Giniall',
  packages: 'none',
  notes: `5a (reproducible): keep if year>2000 & year<2013 ; collapse (firstnm) Country_NAME (mean) GINIW_pred_GDP_pc Giniall, by(Country_ISO) ;
gen GINIall_100 = Giniall/100 ;
tw (scatter GINIall_100 GINIW_pred_GDP_pc, msymbol(t) xlabel(0(0.5)0.16) ylabel(0.2(0.1)0.8, nogrid)) (lfit GINIall_100 GINIW_pred_GDP_pc, lcolor(blue)) , xtitle("Interregional inequality: GINIW") ytitle("Interpersonal inequality: GINI") xsize(3.1) ysize(2.8) legend(off) saving("$OUT/Figure_5_a", replace)
graph export "$OUT/Figure_5_a.png", replace width(1600).
5b (NOT reproducible): it needs icrg_risk_of_internal_conflict = (12-icrg_internal_conflict)/12,
and the ICRG variable is ABSENT from every dataset in this repo (licensed PRS Group data).
Include the original commented 5b block verbatim, and put a clear banner in the README:
"Figure 5b cannot be reproduced - ICRG internal-conflict data is licensed and not in the repo;
see manuscript.pdf p.127. To reproduce, obtain ICRG internal_conflict, merge on Country_ISO+year, uncomment."`,
  pins: 'Figure_5_a: ~144 countries; positive relationship; visual target expected/Figure_5_R_reference.png (and manuscript p.127).',
},
{
  dir: 'Figure_A1', doName: 'Figure_A1.do', kind: 'figure',
  title: 'Figure A.1 - Predicted vs observed regional GDP by national income tier',
  csv: 'Figure_A1_data.csv',
  cols: 'code_Coutry_Region, Region_NAME, Country_ISO, year, GDP_pc_Country, GDP_pc_Region, log_GDP_pc_Region, pred_log_GDP_pc_Region, pred_GDP_pc_Region, Pix_Region, Pop_Region',
  packages: 'none',
  notes: `keep if year>2000 & year<2011 ; collapse (firstnm) Region_NAME Country_ISO (mean) GDP_pc_Country GDP_pc_Region log_GDP_pc_Region pred_log_GDP_pc_Region pred_GDP_pc_Region Pix_Region Pop_Region, by(code_Coutry_Region).
Three overlaid scatters by World-Bank income tier of GDP_pc_Country plus a 45-degree line:
 (scatter log_GDP_pc_Region pred_log_GDP_pc_Region if GDP_pc_Country<4089, msymbol(t) scale(0.5))
 (... if GDP_pc_Country>4089 & GDP_pc_Country<12615, msymbol(+))
 (... if GDP_pc_Country>12615, msymbol(O))
 (function y=x, lcolor(black) range(5.5 12))
xtitle("log (predicted regional GDP per capita)") ytitle("log (observed regional GDP per capita)")
legend(order(1 "LIC" 2 "MIC" 3 "HIC") ring(0) pos(5)) saving("$OUT/figure_A_1", replace) ; graph export PNG.`,
  pins: 'Tight scatter along the 45-degree line (predictions track observed). Visual target expected/Figure_A1_R_reference.png (manuscript p.128).',
},
{
  dir: 'Figure_A2', doName: 'Figure_A2.do', kind: 'figure',
  title: 'Figure A.2 - Predicted vs observed regional GDP by regional output density',
  csv: 'Figure_A2_data.csv',
  cols: 'code_Coutry_Region, Region_NAME, Country_ISO, year, GDP_pc_Country, GDP_pc_Region, log_GDP_pc_Region, pred_log_GDP_pc_Region, pred_GDP_pc_Region, Pix_Region, Pop_Region',
  packages: 'none',
  notes: `Same collapse as A.1. Then gen GDP_dens_Region = (GDP_pc_Region*Pop_Region)/Pix_Region.
Three scatters by density cutoffs + 45-degree line:
 (... if GDP_dens_Region<168071.5, msymbol(t) scale(0.5)) (... if >168071.5 & <1478853, msymbol(+)) (... if >1478853, msymbol(O)) (function y=x, range(5.5 12)).
legend(order(1 "LDIR" 2 "MDIR" 3 "HDIR") ring(0) pos(5)) saving("$OUT/figure_A_2", replace) ; graph export PNG.`,
  pins: 'Scatter along 45-degree line. Visual target expected/Figure_A2_R_reference.png (manuscript p.129).',
},
{
  dir: 'Figure_A3', doName: 'Figure_A3.do', kind: 'figure',
  title: 'Figure A.3 - USA 2010 predicted vs observed regional GDP by regional price parity',
  csv: 'Figure_A3_data.csv',
  cols: 'Region_NAME, Country_ISO, year, log_GDP_pc_Region, pred_log_GDP_pc_Region, RPP',
  packages: 'none',
  notes: `keep if year==2010 ; keep if Country_ISO=="USA". Three scatters by Regional Price Parity (RPP) with state labels + 45-degree line:
 (scatter log_GDP_pc_Region pred_log_GDP_pc_Region if RPP<90.2, msymbol(t) scale(0.5) xlabel(10.2(0.2)11.1) ylabel(10.2(0.2)11.1) mlabel(Region_NAME))
 (... if RPP>90.2 & RPP<102.8, msymbol(+) mlabel(Region_NAME)) (... if RPP>102.8, msymbol(O) mlabel(Region_NAME)) (function y=x, range(10.2 11.1)).
legend(order(1 "LRPP" 2 "MRPP" 3 "HRPP") ring(0) pos(5)) saving("$OUT/figure_A_3", replace) ; graph export PNG.`,
  pins: '51 US states/regions in 2010. Visual target expected/Figure_A3_R_reference.png (manuscript p.130).',
},
{
  dir: 'Figure_A4', doName: 'Figure_A4.do', kind: 'figure',
  title: 'Figure A.4 - National predicted vs observed GDP per capita by data source',
  csv: 'Figure_A4_data.csv',
  cols: 'Country_ISO, year, GDP_pc_Country, pred_GDP_pc_Country, GDP_pc_Country_G',
  packages: 'none',
  notes: `keep if year>2000 & year<2011 ; collapse (mean) GDP_pc_Country pred_GDP_pc_Country GDP_pc_Country_G, by(Country_ISO).
gen log_GDP_pc_Country=log(GDP_pc_Country) ; gen log_pred_GDP_pc_Country=log(pred_GDP_pc_Country) ;
gen geroli_dum=1 ; replace geroli_dum=0 if GDP_pc_Country_G==.
Two scatters (observed vs predicted-only) with country labels + 45-degree line:
 (scatter log_GDP_pc_Country log_pred_GDP_pc_Country if geroli_dum==1, msymbol(t) mlabel(Country_ISO) scale(0.5))
 (... if geroli_dum==0, mlabel(Country_ISO) msymbol(o)) (function y=x, range(5.5 12)).
legend(order(1 "observed data" 2 "predicted data") ring(0) pos(5)) saving("$OUT/Figure_A_4", replace) ; graph export PNG.`,
  pins: '78 countries with Gennaioli observed data, 180 total; points near 45-degree line. Visual target expected/Figure_A4_R_reference.png (manuscript p.131).',
},
{
  dir: 'Figure_B3', doName: 'Figure_B3.do', kind: 'figure',
  title: 'Figure B.3 - Regional inequality (GINIW) in Germany 2000-2012',
  csv: 'Figure_B3_data.csv',
  cols: 'Country_ISO, year, GINIW_pred_GDP_pc',
  packages: 'none',
  notes: `keep if Country_ISO=="DEU" ; keep if year>1999 & year<2013.
tw (line GINIW_pred_GDP_pc year, xlabel(2000(2)2012) ylabel(0.025(0.002)0.035, nogrid)) , xtitle("Year") ytitle("Partial regional inequality (GINIW)") xsize(3.1) ysize(2.8) legend(off) saving("$OUT/Figure_B_3", replace) ; graph export PNG.`,
  pins: '13 yearly points for Germany 2000-2012. Visual target expected/Figure_B3_R_reference.png.',
},
//============================ MAPS =======================================
{
  dir: 'Figure_2', doName: 'Figure_2.do', kind: 'map_country',
  title: 'Figure 2 - Regional inequality within countries (GINIW world map)',
  csv: 'Figure_2_data.csv',
  cols: 'Country_ISO, year, GINIW_pred_GDP_pc',
  packages: 'ssc install spmap ; spshape2dta is built into Stata 15+ (else ssc install shp2dta)',
  notes: `MAP. The original used a GADM coordinate file that is no longer downloadable, so this folder
bundles a Natural Earth country shapefile keyed by ISO3: data/worldmap_countries.(shp|shx|dbf|prj).
Pattern:
  version 15
  import delimited "$DATA/Figure_2_data.csv", varnames(1) case(preserve) clear
  collapse (mean) GINIW_pred_GDP_pc, by(Country_ISO)
  rename Country_ISO iso3
  tempfile vals
  save "\`vals'"
  spshape2dta "$DATA/worldmap_countries", replace          // -> worldmap_countries.dta (+ _shp.dta), attribute field iso3, key _ID
  use "$DATA/worldmap_countries.dta", clear
  merge 1:1 iso3 using "\`vals'", keep(master match) nogenerate
  drop if iso3=="ATA"
  spmap GINIW_pred_GDP_pc using "$DATA/worldmap_countries_shp.dta", id(_ID) fcolor(Reds)
  graph export "$OUT/Figure_2.png", replace width(2000)
Notes for README: 180/180 countries match by ISO3; high inequality (dark red) clusters in Africa/Sahel.
If on Stata <15, replace spshape2dta with: shp2dta using "$DATA/worldmap_countries", database(...) coordinates(...) genid(_ID) replace.`,
  pins: 'World choropleth in Reds; pattern matches expected/Figure_2_original.jpg and expected/Figure_2_R_reference.png.',
},
{
  dir: 'Figure_3', doName: 'Figure_3.do', kind: 'map_country',
  title: 'Figure 3 - Change in regional inequality, 1992-2001 vs 2002-2012',
  csv: 'Figure_3_data.csv',
  cols: 'Country_ISO, year, GINIW_pred_GDP_pc',
  packages: 'ssc install spmap ; spshape2dta (Stata 15+)',
  notes: `MAP (diverging). Compute the change exactly as the original:
  import delimited "$DATA/Figure_3_data.csv", varnames(1) case(preserve) clear
  gen p2year = 0
  replace p2year = 1 if inrange(year,2002,2012)
  gen id_t2_j = string(p2year)+Country_ISO
  egen GINIW_91_01 = mean(GINIW_pred_GDP_pc), by(id_t2_j)
  replace GINIW_91_01 = . if p2year==1
  egen GINIW_02_12 = mean(GINIW_pred_GDP_pc), by(id_t2_j)
  replace GINIW_02_12 = . if p2year==0
  collapse GINIW_91_01 GINIW_02_12, by(Country_ISO)
  gen D_GINIW = GINIW_91_01 - GINIW_02_12
  rename Country_ISO iso3
  tempfile vals
  save "\`vals'"
  spshape2dta "$DATA/worldmap_countries", replace
  use "$DATA/worldmap_countries.dta", clear
  merge 1:1 iso3 using "\`vals'", keep(master match) nogenerate
  drop if iso3=="ATA"
  spmap D_GINIW using "$DATA/worldmap_countries_shp.dta", id(_ID) ///
     fcolor(cranberry*1 cranberry*.8 cranberry*.6 cranberry*.4 dkgreen*.4 dkgreen*.6 dkgreen*.8 dkgreen*1) ///
     clmethod(custom) clbreaks(-.036 -.006418 -.0027394 -.0010632 0 .0021963 .0046911 .0071508 .036)
  graph export "$OUT/Figure_3.png", replace width(2000)
README: green = falling inequality (convergence), red = rising (divergence). Same Natural Earth caveat.`,
  pins: 'Diverging green/red choropleth with the 8 custom breaks from the paper; matches expected/Figure_3_original.jpg and expected/Figure_3_R_reference.png.',
},
{
  dir: 'Figure_1', doName: 'Figure_1.do', kind: 'map_region',
  title: 'Figure 1 - Predicted regional income (subnational world map)',
  csv: 'Figure_1_region_income.csv',
  cols: 'Region_ISO, year, ssa, pred_GDP_pc_Region, pred_GDP_pc_Country',
  packages: 'ssc install spmap ; spshape2dta (Stata 15+)',
  notes: `MAP (subnational/NUTS-1). Bundles a Natural Earth admin-1 shapefile keyed by Region_ISO:
data/worldmap_regions.(shp|shx|dbf|prj) with attribute field regiso.
Pattern:
  version 15
  import delimited "$DATA/Figure_1_region_income.csv", varnames(1) case(preserve) clear
  keep if year>1991 & year<2013
  collapse (mean) ssa pred_GDP_pc_Region pred_GDP_pc_Country, by(Region_ISO)
  rename Region_ISO regiso
  tempfile vals
  save "\`vals'"
  spshape2dta "$DATA/worldmap_regions", replace
  use "$DATA/worldmap_regions.dta", clear
  merge 1:1 regiso using "\`vals'", keep(master match) nogenerate
  spmap pred_GDP_pc_Region using "$DATA/worldmap_regions_shp.dta", id(_ID) clnumber(9) fcolor(Blues2)
  graph export "$OUT/Figure_1.png", replace width(2000)
README: blue = higher predicted regional income. IMPORTANT LIMITATION: the bundled geometry is
Natural Earth admin-1, which matches ~90% of the paper's regions (the original GADM-3.6 file is no
longer downloadable); unmatched regions show as "no data". Document this clearly.`,
  pins: 'Subnational Blues choropleth; pattern matches expected/Figure_1_R_reference.png (manuscript p.116).',
},
{
  dir: 'Figure_B1', doName: 'Figure_B1.do', kind: 'map_region',
  title: 'Figure B.1 - Predicted regional income in Sub-Saharan Africa',
  csv: 'Figure_B1_region_income.csv',
  cols: 'Region_ISO, year, ssa, pred_GDP_pc_Region, pred_GDP_pc_Country',
  packages: 'ssc install spmap ; spshape2dta (Stata 15+)',
  notes: `MAP (same as Figure 1 but Sub-Saharan Africa only). Identical pipeline to Figure_1.do, but the
attribute carries ssa and the spmap is filtered to ssa==1:
  ... collapse (mean) ssa pred_GDP_pc_Region pred_GDP_pc_Country, by(Region_ISO) ... merge ...
  spmap pred_GDP_pc_Region using "$DATA/worldmap_regions_shp.dta" if ssa==1, id(_ID) clnumber(9) fcolor(Blues2)
  graph export "$OUT/Figure_B_1.png", replace width(2000)
Same Natural Earth ~90% coverage caveat in the README.`,
  pins: 'SSA-only Blues choropleth; matches expected/Figure_B1_R_reference.png.',
},
]

phase('Author')
const results = await parallel(SPECS.map(s => () => {
  const prompt = `${COMMON}

============================= THIS FOLDER =============================
FOLDER:   ${REP}/${s.dir}
DO FILE:  ${REP}/${s.dir}/${s.doName}
README:   ${REP}/${s.dir}/README.md
TITLE:    ${s.title}
KIND:     ${s.kind}
CSV:      data/${s.csv}
CSV COLUMNS (case-sensitive, exactly as in the CSV header):
  ${s.cols}
REQUIRED STATA PACKAGES: ${s.packages}

REFACTOR NOTES / EXACT MODEL OR PLOT LOGIC:
${s.notes}

PINNED EXPECTED RESULT (put in README section 5):
${s.pins}

Also read the original source for context if helpful:
  ${REPO}/Generation_Tables.do   and   ${REPO}/Generation_Figures.do
Read the existing ${REP}/${s.dir}/data_dictionary.csv to fill the README data dictionary.
Now write the two files and return a one-line status.`
  return agent(prompt, { label: s.dir, phase: 'Author' })
}))

log(`Authored ${results.filter(Boolean).length}/${SPECS.length} folders`)
return { authored: results.filter(Boolean).length, total: SPECS.length }
