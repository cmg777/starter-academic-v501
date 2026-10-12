export const meta = {
  name: 'author-r-python-replications',
  description: 'Add R + Python scripts and a README comparison to the 13 remaining table/figure folders',
  phases: [{ title: 'Author', detail: 'one agent per folder: write+run <name>.R and <name>.py, append README comparison' }],
}

const REPO = '/Users/carlosmendez/Documents/GitHub/00DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants'
const REP  = `${REPO}/replication`
const PY   = '/tmp/lessmann-venv/bin/python'   // working Python 3.13 (system python3.14 is broken)

const COMMON = `
You add an R script and a Python script to ONE replication folder of Lessmann &
Seidel (2017), then document a Stata/R/Python comparison in that folder's README.

GROUND RULES
- The Stata .do in the folder is the reference; your R and Python must reproduce
  the SAME result from the SAME data/*.csv. Read the folder's <name>.do and its
  data_dictionary.csv first to learn the exact logic and column names (columns are
  case-sensitive; the .do reads them via import delimited, case(preserve)).
- MATCH THE EXEMPLAR STYLE EXACTLY (header banner, numbered sections, an inline
  comment on every non-obvious call/argument/library, an install line at top, a
  portable working-directory line, write outputs to output/, and write a small
  output/<base>_results_R.csv / _py.csv of key numbers). Read these exemplars:
    TABLE  : ${REP}/Table_3/Table_3.R    ${REP}/Table_3/Table_3.py
    FIGURE : ${REP}/Figure_4/Figure_4.R  ${REP}/Figure_4/Figure_4.py
    MAP    : ${REP}/Figure_2/Figure_2.R  ${REP}/Figure_2/Figure_2.py
  and copy their README comparison section format (a "## Cross-language comparison
  (Stata · R · Python)" section with: a tool table; a numbers table with columns
  Stata | R | Python; and tolerance/difference notes).
- Image outputs MUST be suffixed _R / _py (e.g. Figure_X_R.png, Figure_X_py.png)
  so they never overwrite the Stata outputs.

YOU MUST RUN BOTH SCRIPTS and put the ACTUAL numbers in the README:
    cd "<folder>" && Rscript <name>.R
    cd "<folder>" && ${PY} <name>.py
(Use ${PY} for Python — the system python3 is broken in this environment. The
deliverable scripts still document plain "pip install ..." for end users.)
If a script errors, FIX IT and re-run until both succeed; then read the
output/*_results_*.csv you wrote and fill the README table from them.

PORTABLE PATHS: R header -> args<-commandArgs(trailingOnly=FALSE); fa<-sub("^--file=","",args[grep("^--file=",args)]); if(length(fa)==1) setwd(dirname(normalizePath(fa))).
Python header -> import os; os.chdir(os.path.dirname(os.path.abspath(__file__))).

DELIVERABLES (exactly): write <folder>/<name>.R and <folder>/<name>.py; APPEND a
new comparison section to <folder>/README.md. Do NOT touch data/ or expected/.
Return one line: folder + the headline numbers you reproduced in R and Python.
`

const SPECS = [
//============================ TABLES ====================================
{
  dir: 'Table_1', base: 'Table_1', kind: 'table',
  note: `Seven columns of log_GDP_pc_Region on log_Light_ppix_Region (+ controls/FE). See Table_1.do for the exact 7 models.
Estimators: column (1) and (3)-(7) are Stata RANDOM-EFFECTS (xtreg default); column (2) is OLS with region FE.
R: use plm::plm(..., model="random", index=c("code_Coutry_Region","year")) for the RE columns, and fixest::feols(log_GDP_pc_Region ~ log_Light_ppix_Region + satyear_1+..+satyear_7 | code_Coutry_Region) for col 2. Cluster by Country_ISO where applicable.
Python: linearmodels.RandomEffects for the RE columns (entity=code_Coutry_Region, time=year), linearmodels.PanelOLS(EntityEffects) for col 2.
Report the log_Light_ppix_Region coefficient for all 7 columns + N. Note: RE variance-component estimators differ slightly across Stata/plm/linearmodels, so tiny deviations are expected -> document per the tolerance rule.
install: R install.packages(c("readr","plm","fixest")); Python pip install pandas linearmodels.`,
  pins: `Stata committed (expected/Table_1.txt) log_Light_ppix_Region by column: .399 / .190 / .153 / .122 / .232 / .104 / .102 ; col7 log_GDP_pc_Country .889 ; N=5,258 ; 1,504 regions.`,
},
{
  dir: 'Table_2', base: 'Table_2', kind: 'table',
  note: `Correlations of five population-weighted inequality indices computed three ways (predicted, observed, light) per country-year, then averaged per country over 2001-2012, then correlated.
There is NO Stata regression package needed here in R/Python: implement the weighted indices from first principles (they match ineqdeco for GE(-1),MLD,Theil,CV; the weighted GINI may differ from ineqdeco's algorithm - DOCUMENT that).
Formulas with population weights w on values y, weighted mean mu, p=w/sum(w), r=y/mu:
  Gini = sum_i sum_j w_i w_j |y_i-y_j| / (2 (sum w)^2 mu)
  GE(-1)=0.5*(sum p * r^-1 -1) ; GE(0)=MLD=sum p*(-log r) ; GE(1)=Theil=sum p*r*log r ; GE(2)=0.5*(sum p*r^2 -1) ; CV=sqrt(2*GE(2)).
Compute for pred_GDP_pc_Region, GDP_pc_Region, and Light_pc_Region(=Light_Region/Pop_Region), weight=Pop_Region, group by Country_ISO+year, keep 2001-2012, collapse mean by Country_ISO, then correlate predicted-vs-observed and light-vs-observed for each of the 5 indices.
Report those 10 correlations. install: R readr only; Python pip install pandas numpy.`,
  pins: `Manuscript Table 2 (p.117), 78 countries. predicted-vs-observed: GINIW .50, GE(-1) .40, MLD .45, Theil .50, CV .52. light-vs-observed: .21/.11/.21/.30/.29. (R/Python should match GE(-1),MLD,Theil,CV closely; the GINI row may differ from ineqdeco - document.)`,
},
{
  dir: 'Table_4', base: 'Table_4', kind: 'table',
  note: `Five FE columns (country + period FE, cluster by country) of GINIW on cubic log GDP + control blocks (rents+arable / trade+FDI / area+gas+interaction / aid+school / ethnic). 5-year averages. Build the SAME derived controls as Table_4.do (aid_GDP, /100 rescales, Area_X_price_gasoline). Published col 4 (icrg_bureaucratic_qualitiy) is NOT reproducible - skip it in all languages and note it.
R: fixest::feols(GINIW_pred_GDP_pc ~ ...controls | Country_ISO + p5, cluster=~Country_ISO). Python: linearmodels.PanelOLS EntityEffects+TimeEffects (entity=country code, time=p5), cluster_entity. Use per-variable na.rm collapse (groupby.mean / aggregate) - NOT listwise.
Report each block's key control coefficient(s) + N per column. install: R readr,fixest; Python pandas,numpy,linearmodels.`,
  pins: `expected/Table_4.txt cols (1,2,3,5,6): rents .018/arable -.053 (N857); trade .005/FDI .009 (N817); gasoline .001/Area_X_gasoline .006 (N676); aid_GDP .015/school -.014 (N591); ethnic .071 (N845).`,
},
{
  dir: 'Table_B4', base: 'Table_B4', kind: 'table',
  note: `OLS of log_GDP_pc_Region on log_Light_ppix_Region with region FE (xi i.code_Coutry_Region) + satellite dummies; Stata adds Conley spatial-HAC SEs at radii 1000/2500/5000 km. The POINT ESTIMATE equals Table 1 col 2 (0.190) and is trivially reproducible by OLS with region FE in R (fixest::feols(... | code_Coutry_Region)) and Python (linearmodels PanelOLS EntityEffects=code_Coutry_Region). The Conley SE is the hard part: implement a small Conley spatial-HAC if feasible (R: distance from Latitude/Longitude, Bartlett kernel; or note conleyreg is not installed), else report the OLS point estimate and clearly DOCUMENT that the spatial-HAC SE is the Stata-specific part. Report the light point estimate (should be 0.190 in all three).
install: R readr,fixest; Python pandas,numpy,linearmodels.`,
  pins: `expected/Table_B_4.txt: log_Light_ppix_Region = 0.190 in all 3 columns; Stata Conley SEs 0.020/0.025/0.027. Point estimate is what must match across languages; SE differences are expected and documented.`,
},
//============================ SCATTER / LINE FIGURES =====================
{
  dir: 'Figure_5', base: 'Figure_5', kind: 'figure',
  note: `5a (reproducible): keep year 2001-2012, collapse mean by Country_ISO of GINIW_pred_GDP_pc and Giniall, gen GINIall_100=Giniall/100, scatter GINIall_100 vs GINIW with an OLS fit line. Report n countries and the OLS slope. 5b is NOT reproducible (ICRG data absent) - note it; do not attempt. R ggplot2; Python matplotlib + numpy.polyfit for the line. install: R readr,ggplot2; Python pandas,numpy,matplotlib.`,
  pins: `~144 countries with both measures; positive slope. Visual target expected/Figure_5_R_reference.png + manuscript p.127.`,
},
{
  dir: 'Figure_A1', base: 'Figure_A1', kind: 'figure',
  note: `keep 2001-2010, collapse mean by code_Coutry_Region. Scatter log_GDP_pc_Region (y, observed) vs pred_log_GDP_pc_Region (x) split into 3 income tiers by GDP_pc_Country (<4089, 4089-12615, >12615) + a 45-degree line y=x. Report n regions and the correlation between observed and predicted log GDP. R ggplot2; Python matplotlib.`,
  pins: `Tight scatter along the 45-degree line; corr(obs,pred) high (~0.9). Visual target expected/Figure_A1_R_reference.png.`,
},
{
  dir: 'Figure_A2', base: 'Figure_A2', kind: 'figure',
  note: `Same collapse as A.1; gen GDP_dens_Region=(GDP_pc_Region*Pop_Region)/Pix_Region; 3 density tiers (<168071.5, 168071.5-1478853, >1478853) + 45-degree line. Report n regions + corr(obs,pred). R ggplot2; Python matplotlib.`,
  pins: `Scatter along the 45-degree line. Visual target expected/Figure_A2_R_reference.png.`,
},
{
  dir: 'Figure_A3', base: 'Figure_A3', kind: 'figure',
  note: `keep Country_ISO=="USA" & year==2010; scatter log_GDP_pc_Region vs pred_log_GDP_pc_Region split by RPP (<90.2, 90.2-102.8, >102.8) with state labels (Region_NAME) + 45-degree line. Report n (=51) + corr. R ggplot2; Python matplotlib.`,
  pins: `51 US states/regions in 2010. Visual target expected/Figure_A3_R_reference.png.`,
},
{
  dir: 'Figure_A4', base: 'Figure_A4', kind: 'figure',
  note: `keep 2001-2010, collapse mean by Country_ISO of GDP_pc_Country, pred_GDP_pc_Country, GDP_pc_Country_G. gen logs; geroli_dum=1 if GDP_pc_Country_G nonmissing else 0. Scatter log(GDP_pc_Country) vs log(pred_GDP_pc_Country) with country labels, two groups (observed vs predicted) + 45-degree line. Report n countries and n with observed (Gennaioli) data. R ggplot2; Python matplotlib.`,
  pins: `~180 countries, 78 with Gennaioli observed data; points near 45-degree line. Visual target expected/Figure_A4_R_reference.png.`,
},
{
  dir: 'Figure_B3', base: 'Figure_B3', kind: 'figure',
  note: `keep Country_ISO=="DEU" & year 2000-2012; line plot of GINIW_pred_GDP_pc vs year. Report n points (=13) and the 2000 vs 2012 values. R ggplot2; Python matplotlib. install: R readr,ggplot2; Python pandas,matplotlib.`,
  pins: `13 yearly points for Germany 2000-2012. Visual target expected/Figure_B3_R_reference.png.`,
},
//============================ MAPS =======================================
{
  dir: 'Figure_3', base: 'Figure_3', kind: 'map_country',
  note: `COUNTRY MAP (diverging). Follow the Figure_2 map exemplar but compute D_GINIW first (as in Figure_3.do): p2year=1 if 2002-2012 else 0; period means; D_GINIW = mean(1992-2001) - mean(2002-2012). Merge by iso3 onto data/worldmap_countries.shp; drop ATA; draw a diverging green(positive=falling inequality)/red(negative=rising) choropleth. R sf+ggplot2 (scale_fill_gradient2, low=firebrick, mid=white, high=darkgreen OR match the sign: positive D=green); Python geopandas+matplotlib (cmap RdYlGn or a diverging map centered at 0). Report n countries matched + D_GINIW range. install: R readr,sf,ggplot2; Python pandas,geopandas,matplotlib.`,
  pins: `Diverging map; matches expected/Figure_3_original.jpg + expected/Figure_3_R_reference.png. 180 countries.`,
},
{
  dir: 'Figure_1', base: 'Figure_1', kind: 'map_region',
  note: `REGION (subnational) MAP. Like Figure_2 exemplar but with the REGION shapefile data/worldmap_regions.shp (key field regiso) and Blues. Steps: read data/Figure_1_region_income.csv, keep year 1992-2012, collapse mean of pred_GDP_pc_Region and ssa by Region_ISO, rename Region_ISO->regiso, merge onto worldmap_regions.shp, draw a Blues choropleth of pred_GDP_pc_Region (log scale optional, as in the reference). Report n regions with data and n matched to the map (~90% expected). R sf+ggplot2; Python geopandas+matplotlib. install: R readr,sf,ggplot2; Python pandas,geopandas,matplotlib.`,
  pins: `Subnational Blues map; ~90% of data regions match the Natural Earth admin-1 geometry; matches expected/Figure_1_R_reference.png.`,
},
{
  dir: 'Figure_B1', base: 'Figure_B1', kind: 'map_region',
  note: `REGION MAP, Sub-Saharan Africa only. Identical to Figure_1 but filter to ssa==1 before drawing (the CSV carries ssa). Use worldmap_regions.shp (regiso), Blues. Report n SSA regions matched. R sf+ggplot2; Python geopandas+matplotlib.`,
  pins: `SSA-only Blues map; matches expected/Figure_B1_R_reference.png.`,
},
]

phase('Author')
const results = await parallel(SPECS.map(s => () => {
  const prompt = `${COMMON}

============================= THIS FOLDER =============================
FOLDER:  ${REP}/${s.dir}
WRITE:   ${s.base}.R  and  ${s.base}.py   (+ append to README.md)
KIND:    ${s.kind}   (use the ${s.kind.startsWith('map') ? 'MAP' : (s.kind === 'table' ? 'TABLE' : 'FIGURE')} exemplar)
RUN R:   cd "${REP}/${s.dir}" && Rscript ${s.base}.R
RUN PY:  cd "${REP}/${s.dir}" && ${PY} ${s.base}.py

METHOD / LOGIC:
${s.note}

PINNED STATA RESULT (for the README comparison's Stata column):
${s.pins}

Read ${REP}/${s.dir}/${s.base}.do and ${REP}/${s.dir}/data_dictionary.csv for exact
columns/logic. Write both scripts, RUN them with the commands above, fix until both
pass, then APPEND the "## Cross-language comparison (Stata · R · Python)" section to
${REP}/${s.dir}/README.md filled with the ACTUAL numbers you produced. Return one
line with the folder and your reproduced headline numbers.`
  return agent(prompt, { label: s.dir, phase: 'Author' })
}))

log(`Authored R+Python for ${results.filter(Boolean).length}/${SPECS.length} folders`)
return { authored: results.filter(Boolean).length, total: SPECS.length }
