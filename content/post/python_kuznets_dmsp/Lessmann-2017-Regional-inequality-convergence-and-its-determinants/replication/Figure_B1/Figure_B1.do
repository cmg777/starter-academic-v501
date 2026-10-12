*===========================================================================*
* Figure_B1.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* FIGURE B.1 - Predicted regional income in Sub-Saharan Africa.
*   A choropleth (filled) map of PREDICTED regional GDP per capita, averaged
*   over 1992-2012, shown for Sub-Saharan African (SSA) regions only. It is the
*   SAME map as Figure 1 of the paper, but masked to the SSA subsample so the
*   continent's internal income geography is legible at full zoom.
*
* PIPELINE (identical to Figure_1.do, but the attribute carries the SSA flag
* and spmap is filtered to ssa==1):
*   spshape2dta -> collapse to cross-section -> merge to map -> spmap if ssa==1.
*
* SELF-CONTAINED: needs data/Figure_B1_region_income.csv and the Natural Earth
* regions shapefile (worldmap_regions.shp/.shx/.dbf/.prj) in data/.
* SOFTWARE: Stata (R and Python twins included).  NEEDS Stata 15+ for spshape2dta.
* PACKAGES: ssc install spmap   (spshape2dta ships with Stata 15+).
* HOW TO RUN: `cd` into this folder in Stata, then:  do Figure_B1.do
* OUTPUT: output/Figure_B_1.(gph|png)
*===========================================================================*

*--------------------------- 1. Setup --------------------------------------*
clear all
macro drop _all
capture log close
set more off
version 15                          // spshape2dta requires Stata 15 or later
global ROOT "`c(pwd)'"
global DATA "$ROOT/data"
global OUT  "$ROOT/output"
capture mkdir "$OUT"

*--------------------------- 2. Build the map (.dta) from the shapefile -----*
* The original used pre-converted "NODATA_2.dta" (region attributes, key = id)
* and "NOCORD_2.dta" (the polygon coordinates). We ship the raw Natural Earth
* shapefile instead and convert it on the fly with spshape2dta, which writes:
*   worldmap_regions.dta       <- attribute file, holds the new id var _ID and
*                                 the region-code field "regiso"
*   worldmap_regions_shp.dta   <- coordinate file used by spmap's using() option
* spshape2dta refuses to overwrite, so we clear any previous run first.
capture erase "$DATA/worldmap_regions.dta"
capture erase "$DATA/worldmap_regions_shp.dta"
spshape2dta "$DATA/worldmap_regions", replace saving("$DATA/worldmap_regions")

*--------------------------- 3. Import the region income panel -------------*
* CASE-SENSITIVE column names exactly as in the CSV header:
*   Region_ISO, year, ssa, pred_GDP_pc_Region, pred_GDP_pc_Country
* The CSV is already restricted to 1992-2012 (the cross-section window used in
* the paper), so no additional year filtering is needed here.
import delimited "$DATA/Figure_B1_region_income.csv", varnames(1) case(preserve) clear

*--------------------------- 4. Collapse to a cross-section ----------------*
* Average each region over 1992-2012 to a single value per region. We keep the
* SSA dummy (ssa, constant within a region) so we can mask the map later.
* NOTE: the original collapsed a dash range; we list variables EXPLICITLY so the
* trimmed CSV cannot break the range.
collapse (mean) ssa pred_GDP_pc_Region pred_GDP_pc_Country, by(Region_ISO)

*--------------------------- 5. Merge income onto the map ------------------*
* The shapefile attribute file keys regions by "regiso"; our data key is
* "Region_ISO". Rename so the 1:1 merge lines up, then attach _ID (the polygon
* id spmap needs). Unmatched map polygons stay (income = .) and simply paint
* as "no data"; unmatched data rows would signal a code mismatch.
rename Region_ISO regiso
merge 1:1 regiso using "$DATA/worldmap_regions.dta"
* _merge==3 matched; ==2 map polygon with no income (drawn empty); ==1 would be
* income with no polygon (should not happen with the shipped files).

*--------------------------- 6. Draw Figure B.1 (SSA only) -----------------*
* spmap paints polygons by pred_GDP_pc_Region. The "if ssa==1" mask restricts
* the drawing to Sub-Saharan Africa (the only change versus Figure 1).
*   id(_ID)        : links each row to its polygon
*   clnumber(9)    : 9 colour classes (quantile-style breaks, spmap default)
*   fcolor(Blues2) : sequential blue ramp (darker = higher income)
spmap pred_GDP_pc_Region using "$DATA/worldmap_regions_shp.dta" if ssa==1, ///
      id(_ID) clnumber(9) fcolor(Blues2) ///
      title("Figure B.1: Predicted regional income, Sub-Saharan Africa (1992-2012)", size(small))
graph save  "$OUT/Figure_B_1", replace
graph export "$OUT/Figure_B_1.png", replace width(2000)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED: an SSA-only sequential-blue choropleth (darker = richer regions),
* matching expected/Figure_B1_R_reference.png.
* CAVEAT: the Natural Earth regions layer covers ~90% of the world's first-level
* administrative units; a handful of regions present in the income data have no
* matching polygon and therefore do not appear on the map.
display as result "Figure B.1 written to $OUT/"
