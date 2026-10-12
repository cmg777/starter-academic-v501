*===========================================================================*
* Figure_1.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* FIGURE 1 - Predicted regional income (subnational world map).
*   A choropleth (filled-area) world map drawn at the SUBNATIONAL (NUTS-1 /
*   admin-1) level. Each region is shaded by its predicted GDP per capita,
*   averaged over 1992-2012. Darker blue = higher predicted regional income.
*   This is the paper's headline picture of the night-lights-based income data:
*   it shows that income varies enormously WITHIN countries, not just between
*   them, which motivates the whole study of regional inequality.
*
* SELF-CONTAINED: needs data/Figure_1_region_income.csv plus the bundled
*   Natural Earth admin-1 shapefile data/worldmap_regions.(shp|shx|dbf|prj).
* SOFTWARE: Stata 15+ (R and Python twins included).  spshape2dta needs Stata 15.
* REQUIRED PACKAGE (install once):   ssc install spmap
*
* HOW TO RUN: open Stata, `cd` into THIS folder, then:   do Figure_1.do
* OUTPUT: output/Figure_1.(gph|png)
*===========================================================================*

*--------------------------- 1. Setup --------------------------------------*
clear all
macro drop _all
capture log close
set more off
version 15                       // 15+ required: spshape2dta + map handling
global ROOT "`c(pwd)'"           // portable working directory (cd here first)
global DATA "$ROOT/data"
global OUT  "$ROOT/output"
capture mkdir "$OUT"

*--------------------------- 2. Packages -----------------------------------*
* spmap draws choropleth maps from a Stata-format shapefile.
capture which spmap
if _rc ssc install spmap

*--------------------------- 3. Import the region income values ------------*
* import delimited reads the CSV. varnames(1)=first row holds names;
* case(preserve) keeps the original upper/lower case of the column names so
* "Region_ISO" stays exactly as written (Stata import is case-sensitive here).
import delimited "$DATA/Figure_1_region_income.csv", varnames(1) case(preserve) clear
describe
summarize

*--------------------------- 4. Collapse to a cross-section ----------------*
* The map is a single snapshot: average each region over 1992-2012. The
* original kept years 1992..2012 with `keep if year>1991 & year<2013`.
keep if year>1991 & year<2013
* (mean) averages the numeric columns within each region. We list the
* variables explicitly (the original used a bare collapse of these three).
collapse (mean) ssa pred_GDP_pc_Region pred_GDP_pc_Country, by(Region_ISO)

* The shapefile keys regions on a field called `regiso`; rename to match so the
* later merge lines up region-for-region.
rename Region_ISO regiso

* Stash the per-region values in a tempfile to merge onto the map geometry.
tempfile vals
save "`vals'"

*--------------------------- 5. Convert + load the shapefile ---------------*
* spshape2dta (Stata 15+) turns an ESRI shapefile into TWO Stata datasets:
*   worldmap_regions.dta      -> one row per region, with the `regiso` attribute
*   worldmap_regions_shp.dta  -> the polygon coordinates spmap draws from
* This replaces the original NODATA_2.dta / NOCORD_2 pair, which came from a
* GADM-3.6 shapefile that is no longer downloadable (see README limitation).
spshape2dta "$DATA/worldmap_regions", replace
use "$DATA/worldmap_regions.dta", clear

*--------------------------- 6. Merge values onto geometry -----------------*
* 1:1 on regiso. keep(master match): keep every map polygon, attaching income
* where we have it. Regions with no matching CSV value stay in the map but get
* a missing income, so spmap draws them as "no data" (uncoloured).
merge 1:1 regiso using "`vals'", keep(master match) nogenerate

*--------------------------- 7. Draw the choropleth ------------------------*
* spmap <var> using <coordinates> , id(_ID): shade each polygon by <var>.
*   clnumber(9)   -> 9 colour classes (quantile breaks), as in the original.
*   fcolor(Blues2)-> blue sequential palette; darker = higher predicted income.
* _ID is the polygon id that spshape2dta writes into BOTH files.
spmap pred_GDP_pc_Region using "$DATA/worldmap_regions_shp.dta", ///
      id(_ID) clnumber(9) fcolor(Blues2) ///
      title("Figure 1: Predicted regional income (mean 1992-2012)", size(*0.8)) ///
      legtitle("Predicted GDP p.c.")
graph save  "$OUT/Figure_1", replace
graph export "$OUT/Figure_1.png", replace width(2000)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED: a subnational Blues choropleth; the pattern matches
*   expected/Figure_1_R_reference.png (manuscript.pdf p.116).
* NOTE: the bundled Natural Earth admin-1 geometry matches ~90% of the paper's
* regions; unmatched regions appear as "no data". See README section 5.
display as result "Figure 1 written to $OUT/"
