*===========================================================================*
* Figure_2.do
*---------------------------------------------------------------------------*
* Lessmann & Seidel (2017), "Regional inequality, convergence, and its
* determinants - A view from outer space" (European Economic Review 92:110-132)
*
* FIGURE 2 - Regional inequality within countries (world choropleth map).
*   For every country we compute the time-average of GINIW (the population-
*   weighted Gini of within-country regional income), then shade each country
*   on a world map from light (low inequality) to dark red (high inequality).
*   The headline pattern: a dark-red belt across Africa / the Sahel, i.e. the
*   poorest countries have the most UNEQUAL internal regional distributions.
*
* SELF-CONTAINED: needs data/Figure_2_data.csv (the GINIW values) AND a bundled
*   Natural Earth world shapefile keyed by ISO3:
*     data/worldmap_countries.(shp|shx|dbf|prj)
*   (The original paper used a GADM coordinate file that is no longer
*    downloadable, so we ship a drop-in Natural Earth equivalent.)
* SOFTWARE: Stata (R and Python twins included).  REQUIRES Stata 15+ for spshape2dta.
* REQUIRED PACKAGE (install once):   ssc install spmap
*
* HOW TO RUN: open Stata, `cd` into THIS folder, then:   do Figure_2.do
* OUTPUT: output/Figure_2.(gph|png)
*===========================================================================*

*--------------------------- 1. Setup --------------------------------------*
clear all
macro drop _all
capture log close
set more off
version 15                      // spshape2dta is built into Stata 15+
global ROOT "`c(pwd)'"          // portable working directory (cd here first)
global DATA "$ROOT/data"
global OUT  "$ROOT/output"
capture mkdir "$OUT"

*--------------------------- 2. Packages -----------------------------------*
* spmap draws the choropleth. spshape2dta (built-in, Stata 15+) converts the
* shapefile to the two .dta files spmap needs (attributes + coordinates).
capture which spmap
if _rc ssc install spmap

*--------------------------- 3. Import the GINIW values --------------------*
* import delimited reads a CSV. varnames(1)=first row holds names;
* case(preserve) keeps the original upper/lower case of the column names.
* CSV columns (case-sensitive): Country_ISO, year, GINIW_pred_GDP_pc.
import delimited "$DATA/Figure_2_data.csv", varnames(1) case(preserve) clear
describe
summarize

*--------------------------- 4. Collapse to one value per country ----------*
* The map shows ONE shade per country, so we average GINIW over all years.
* (mean) averages the inequality index within each country.
collapse (mean) GINIW_pred_GDP_pc, by(Country_ISO)

* The shapefile's join key is the lower-case field name `iso3`, so rename to
* match it before merging.
rename Country_ISO iso3

* Park the per-country values in a tempfile; we will merge them onto the map.
tempfile vals
save "`vals'"

*--------------------------- 5. Convert the shapefile ----------------------*
* spshape2dta writes two datasets next to the shapefile:
*   worldmap_countries.dta      -- attributes (field iso3) + key _ID
*   worldmap_countries_shp.dta  -- the polygon coordinates (also keyed by _ID)
spshape2dta "$DATA/worldmap_countries", replace

*--------------------------- 6. Merge values onto the map ------------------*
use "$DATA/worldmap_countries.dta", clear
* 1:1 merge on the ISO3 code. keep(master match) keeps every map polygon and
* attaches a GINIW value where one exists; nogenerate drops the _merge flag.
* All 180 countries in the CSV match a polygon (180/180).
merge 1:1 iso3 using "`vals'", keep(master match) nogenerate

* Antarctica carries no data and only stretches the colour scale / map frame,
* so drop it (matches the R reference, which also omits it).
drop if iso3=="ATA"

*--------------------------- 7. Draw the choropleth ------------------------*
* spmap shades polygons by GINIW_pred_GDP_pc; the coordinates come from the
* _shp.dta file; id(_ID) links attributes to polygons.
*   fcolor(Reds)  = sequential red ramp (light = low, dark = high inequality)
*   clmethod(quantile) clnumber(7) = 7 equal-count bins, like the R reference
*   ocolor/osize  = thin grey polygon borders
*   ndfcolor(gs14)= light grey for countries with NO data (missing GINIW)
spmap GINIW_pred_GDP_pc using "$DATA/worldmap_countries_shp.dta", ///
      id(_ID) fcolor(Reds) clmethod(quantile) clnumber(7) ///
      ocolor(gs8 ..) osize(0.02 ..) ndfcolor(gs14) ///
      legtitle("GINIW") legend(position(4)) ///
      title("Figure 2: Regional inequality within countries (mean GINIW)") ///
      saving("$OUT/Figure_2", replace)
graph export "$OUT/Figure_2.png", replace width(2000)

*--------------------------- 99. Done --------------------------------------*
* EXPECTED: world choropleth in Reds; 180/180 countries match by ISO3; dark-red
* (high inequality) clusters across Africa / the Sahel. Visual target:
* expected/Figure_2_original.jpg and expected/Figure_2_R_reference.png.
*
* STATA < 15 fallback: replace the spshape2dta line (section 5) with
*   shp2dta using "$DATA/worldmap_countries", ///
*       database("$DATA/worldmap_countries") ///
*       coordinates("$DATA/worldmap_countries_shp") genid(_ID) replace
* (first: ssc install shp2dta), then continue unchanged.
display as result "Figure 2 written to $OUT/"
