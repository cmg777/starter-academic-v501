*===========================================================================*
* Figure_3.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* FIGURE 3 - Change in regional inequality across the world, 1992-2001 vs
*            2002-2012. A DIVERGING world choropleth (map): for each country we
*            compute the difference between its average regional inequality in
*            the first sub-period and the second sub-period, then shade the map.
*              GREEN  = inequality FELL  (regional convergence within the country)
*              RED    = inequality ROSE  (regional divergence within the country)
*            The variable plotted, D_GINIW = GINIW_91_01 - GINIW_02_12, is
*            POSITIVE when later inequality is lower (a fall), so positive ->
*            green and negative -> red, matching the paper's colour scheme.
*
* SELF-CONTAINED: needs only data/Figure_3_data.csv (the inequality series) and
*   the shipped Natural Earth world shapefile data/worldmap_countries.{shp,dbf,
*   shx,prj}.
* SOFTWARE: Stata (R and Python twins included). The original paper drew this map in R; this is
*   a faithful Stata refactor producing the same diverging green/red choropleth.
* REQUIRED PACKAGES (install once):
*     ssc install spmap
*   plus spshape2dta, which ships with Stata 15+ (so we set version 15 below).
*
* HOW TO RUN: open Stata, `cd` into THIS folder, then:   do Figure_3.do
* OUTPUT: output/Figure_3.png  (and the on-screen graph)
*===========================================================================*

*--------------------------- 1. Setup --------------------------------------*
clear all
macro drop _all
capture log close
set more off
version 15                      // 15+ needed for spshape2dta (map folders)

global ROOT "`c(pwd)'"          // portable working directory (cd here first)
global DATA "$ROOT/data"
global OUT  "$ROOT/output"
capture mkdir "$OUT"

*--------------------------- 2. Packages -----------------------------------*
* spmap draws the choropleth from a Stata-format shapefile.
capture which spmap
if _rc ssc install spmap

*--------------------------- 3. Import the inequality series ----------------*
* import delimited reads the CSV. varnames(1)=first row holds names;
* case(preserve) keeps the EXACT upper/lower case of the column names
* (Country_ISO, year, GINIW_pred_GDP_pc).
import delimited "$DATA/Figure_3_data.csv", varnames(1) case(preserve) clear

*--------------------------- 4. Two sub-periods ----------------------------*
* p2year flags the SECOND sub-period (2002-2012); 0 = first sub-period
* (everything else, i.e. 1992-2001 in this trimmed series).
gen p2year = 0
replace p2year = 1 if inrange(year,2002,2012)

* id_t2_j is a country x sub-period key. We average GINIW within each key, then
* blank out the average in the "wrong" sub-period so each country ends up with
* one first-period mean and one second-period mean that survive the collapse.
gen id_t2_j = string(p2year)+Country_ISO

egen GINIW_91_01 = mean(GINIW_pred_GDP_pc), by(id_t2_j)   // 1st-period mean
replace GINIW_91_01 = . if p2year==1                      // keep only in 1st period

egen GINIW_02_12 = mean(GINIW_pred_GDP_pc), by(id_t2_j)   // 2nd-period mean
replace GINIW_02_12 = . if p2year==0                      // keep only in 2nd period

*--------------------------- 5. Collapse to one row per country ------------*
* (mean) ignores the blanks, so each country gets its single 1st- and 2nd-period
* averages on one row.
collapse GINIW_91_01 GINIW_02_12, by(Country_ISO)

* The plotted quantity: first-period minus second-period inequality.
* D_GINIW > 0  => inequality FELL  (convergence) -> green
* D_GINIW < 0  => inequality ROSE  (divergence)  -> red
gen D_GINIW = GINIW_91_01 - GINIW_02_12

* Rename to match the shapefile's country-code field so we can merge 1:1.
rename Country_ISO iso3
tempfile vals
save "`vals'"

*--------------------------- 6. Convert the shapefile to Stata format ------*
* spshape2dta reads worldmap_countries.{shp,dbf,...} and writes TWO datasets:
*   worldmap_countries.dta      (attributes: one row per polygon, incl. iso3, _ID)
*   worldmap_countries_shp.dta  (the polygon coordinates spmap draws from)
spshape2dta "$DATA/worldmap_countries", replace

*--------------------------- 7. Merge values onto the map ------------------*
use "$DATA/worldmap_countries.dta", clear
merge 1:1 iso3 using "`vals'", keep(master match) nogenerate
drop if iso3=="ATA"             // drop Antarctica so the map centres on land

*--------------------------- 8. Draw the diverging choropleth --------------*
* fcolor() lists 8 fill colours, dark->light cranberry (red) for the negative
* (rising-inequality) classes and light->dark dkgreen for the positive
* (falling-inequality) classes, so 0 sits at the red/green boundary.
* clmethod(custom) + clbreaks() = the EXACT 8 class breaks used in the paper.
* id(_ID) links each map polygon to its coordinates in the *_shp.dta file.
spmap D_GINIW using "$DATA/worldmap_countries_shp.dta", id(_ID) ///
    fcolor(cranberry*1 cranberry*.8 cranberry*.6 cranberry*.4 ///
           dkgreen*.4 dkgreen*.6 dkgreen*.8 dkgreen*1) ///
    clmethod(custom) ///
    clbreaks(-.036 -.006418 -.0027394 -.0010632 0 .0021963 .0046911 .0071508 .036) ///
    title("Figure 3: Change in regional inequality, 1992-2001 vs 2002-2012")

graph export "$OUT/Figure_3.png", replace width(2000)
graph save  "$OUT/Figure_3", replace

*--------------------------- 99. Done --------------------------------------*
* EXPECTED: a diverging green/red world choropleth with the 8 custom breaks from
* the paper. GREEN = falling inequality (within-country convergence); RED =
* rising inequality (divergence). Visual target: expected/Figure_3_original.jpg
* and expected/Figure_3_R_reference.png.
* CAVEAT: borders use Natural Earth boundaries and do not imply any endorsement
* of a particular territorial delimitation.
display as result "Figure 3 written to $OUT/Figure_3.png"
