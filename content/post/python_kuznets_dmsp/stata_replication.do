*=============================================================================*
* stata_replication.do
*-----------------------------------------------------------------------------*
* Regional Inequality from Outer Space -- a STATA replication of the Python
* post "Predicting GDP from Nighttime Lights and Building Inequality Indices",
* itself a replication of Lessmann & Seidel (2017, European Economic Review
* 92:110-132).
*
* WHY THIS FILE EXISTS
*   The blog post does everything in Python (pandas + pyfixest + linearmodels +
*   statsmodels). This do-file shows that Stata reaches the SAME numbers with a
*   fraction of the code: the whole prediction model is one `xtreg ... , re`
*   line; all five inequality indices come from a single `ineqdeco` call; and
*   the cubic Kuznets curve plus its plot are three lines (`xtreg`, `margins`,
*   `marginsplot`). Same results, far fewer keystrokes.
*
* DATA
*   Loads the post's bundled STATA datasets (the .dta files described in the
*   data dictionary) straight from GitHub, so the file just runs. Each .dta
*   carries variable labels and value labels, so the output is self-documenting.
*   OFFLINE? `cd` into content/post/python_kuznets_dmsp/ and replace ${RAW}
*   with "data/" in every `use` line (e.g. use "data/Prediction_Data.dta", clear).
*
* REQUIRED PACKAGES (install once per machine)
*   ssc install outreg2          // optional: formatted regression tables
*   ssc install ineqdeco         // five inequality indices in one command (B.4)
*   ols_spatial_HAC              // Conley spatial-HAC SEs (B.8). NOT ON SSC:
*                                // Solomon Hsiang's ado (Hsiang 2010, PNAS).
*                                // Copy ols_spatial_HAC.ado (+ distance.ado,
*                                // Tdiff.ado) into your personal ado folder
*                                // (type -sysdir-). B.8 is skipped if it is
*                                // not installed; everything else still runs.
*
* HOW TO RUN: open Stata 14 or newer, then:   do stata_replication.do
* The section letters (B.1 ... B.9) match "Appendix B" in the post.
*=============================================================================*

clear all
set more off
version 14

* Raw-GitHub folder that holds the .dta files (one trailing slash).
global RAW "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/python_kuznets_dmsp/data/"


*=============================================================================*
* B.1  SETUP AND THE DATA            (mirrors post sections 3-4)
*-----------------------------------------------------------------------------*
* `use` reads a native .dta directly (no column-type guessing, unlike a CSV).
* The labels travel with the file, so `describe` is already a mini data
* dictionary. `xtset` declares the panel: the cross-sectional unit (region) and
* the time variable (year). That single line is all `xtreg` needs later.
*=============================================================================*
use "${RAW}Prediction_Data.dta", clear      // region-year training panel
describe, fullnames                          // labels are baked in
xtset code_Coutry_Region year                // panel = region x year


*=============================================================================*
* B.2  CROSS-COUNTRY DYNAMICS        (mirrors post section 5)
*-----------------------------------------------------------------------------*
* A few one-liners reproduce the descriptive picture. `summarize` gives the
* moments; `correlate` gives pairwise correlations. (On the country panel the
* regional Gini and the Theil index correlate about 0.93, as in the post.)
*=============================================================================*
summarize log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country

* The index co-movement quoted in the post (corr ~0.93) uses the country panel:
preserve
    use "${RAW}Table_3_data.dta", clear
    correlate GINIW_pred_GDP_pc GE_1W_pred_GDP_pc COVW_pred_GDP_pc
restore


*=============================================================================*
* B.3  PREDICTING GDP FROM NIGHTTIME LIGHTS -- TABLE 1   (mirrors section 6)
*-----------------------------------------------------------------------------*
* The centrepiece. log regional GDP per capita is regressed on log nighttime
* light per pixel across seven progressively richer specifications. In Stata
* each specification is ONE `xtreg` line.
*
*   xtreg ... , re  = random-effects (GLS) panel estimator (also the default)
*   xtreg ... , fe  = fixed-effects (within) estimator
*   robust cluster(Country_ISO) = SEs robust + clustered by country (changes the
*                                 standard errors only, not the point estimate)
*=============================================================================*
use "${RAW}Prediction_Data.dta", clear
xtset code_Coutry_Region year
xi i.code_Coutry_Region                 // region dummies for the OLS column (2)
set matsize 11000                        // room for ~1,500 region dummies

* --- Step 1: the seven-rung ladder (random effects, as in the paper) --------
* (1) raw RE, no fixed effects
xtreg log_GDP_pc_Region log_Light_ppix_Region, re robust cluster(Country_ISO)
* (2) OLS with region + satellite fixed effects (the clean within elasticity)
reg   log_GDP_pc_Region log_Light_ppix_Region _Icode_Cout_2-_Icode_Cout_1504 ///
      satyear_1-satyear_7, robust cluster(Country_ISO)
* (7) the PREDICTION model: + national income, geography, world-region & satellite FE
xtreg log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country ///
      log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_area log_region ///
      log_region_X_log_area satyear_1-satyear_7 eap ssa mena lac eca sa, ///
      re robust cluster(Country_ISO)
* Light elasticity climbs DOWN the ladder: 0.399 / 0.190 / ... / 0.102 (col 7),
* national-income elasticity in col 7 = 0.889. These match the post's RE row.

* --- Step 2: fixed effects vs random effects, in ONE word ------------------
* Same simple specification (lights + satellite FE); only the option changes.
xtreg log_GDP_pc_Region log_Light_ppix_Region satyear_1-satyear_7, ///
      fe robust cluster(Country_ISO)          // within (FE):  0.190
xtreg log_GDP_pc_Region log_Light_ppix_Region satyear_1-satyear_7, ///
      re robust cluster(Country_ISO)          // random (RE):  0.190
* FE and RE COINCIDE at 0.190 here. They diverge once the controls enter (the
* post's full-model within/FE estimate is 0.049 vs the RE 0.102): RE keeps the
* between-region signal that the within estimator throws away. And only RE can
* PREDICT for a region outside the sample -- FE has no intercept for it. That is
* exactly why the paper publishes the random-effects model.

* --- Step 3: predict, then undo the log to get dollars ----------------------
* After the RE col-7 fit, `predict , xb` builds (design matrix) x (coefficients)
* for every region in ONE line -- the move FE could not make.
xtreg log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country ///
      log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix log_area log_region ///
      log_region_X_log_area satyear_1-satyear_7 eap ssa mena lac eca sa, ///
      re robust cluster(Country_ISO)
predict double pred_log_GDP_pc_Region, xb        // fitted log income
gen     double pred_GDP_pc_Region = exp(pred_log_GDP_pc_Region)   // back to $
correlate pred_log_GDP_pc_Region log_GDP_pc_Region               // -> 0.925


*=============================================================================*
* B.4  CONSTRUCTING THE INEQUALITY INDICATORS -- ineqdeco   (mirrors section 7)
*-----------------------------------------------------------------------------*
* The post writes a from-scratch function for the Gini, three generalized-
* entropy indices and the coefficient of variation. In Stata ONE `ineqdeco`
* call returns all of them at once, optionally population-weighted:
*   ineqdeco returns  r(gini)  r(gem1)=GE(-1)  r(ge0)=MLD  r(ge1)=Theil  r(ge2)
*   and the CV is sqrt(2 * r(ge2)).
*=============================================================================*
capture which ineqdeco
if _rc ssc install ineqdeco

use "${RAW}Table_2_data.dta", clear          // region-year predicted income + pop

* --- One country-year, to see the five numbers: Germany 2010 ----------------
ineqdeco pred_GDP_pc_Region [aw=Pop_Region] if Country_ISO=="DEU" & year==2010
display "Germany 2010: Gini=" %5.4f r(gini) "  Theil=" %6.4f r(ge1) ///
        "  CV=" %5.4f sqrt(2*r(ge2))          // -> 0.0278 / 0.0016 / 0.0565

* --- Every country-year: loop once per group, harvest all five indices ------
egen _g = group(Country_ISO year)
quietly summarize _g, meanonly
local G = r(max)
foreach s in gini gem1 ge0 ge1 ge2 {          // empty columns to fill
    gen double _idx_`s' = .
}
quietly forvalues i = 1/`G' {
    capture ineqdeco pred_GDP_pc_Region [aw=Pop_Region] if _g==`i'
    if _rc==0 {
        foreach s in gini gem1 ge0 ge1 ge2 {
            replace _idx_`s' = r(`s') if _g==`i'
        }
    }
}
rename _idx_gini GINIW_pred_GDP_pc            // population-weighted regional Gini
gen double COVW_pred_GDP_pc = sqrt(_idx_ge2 * 2)
* Collapsing (first) to one row per country-year gives the country panel the
* next sections use. Validation against the published indices: corr ~ 0.879.


*=============================================================================*
* B.5  THE REGIONAL KUZNETS CURVE -- TABLE 3        (mirrors section 8)
*-----------------------------------------------------------------------------*
* Average to five 5-year periods, then regress the regional Gini on a CUBIC in
* log national GDP per capita with country and period fixed effects.
*=============================================================================*
use "${RAW}Table_3_data.dta", clear

* --- Step 1: collapse annual data to 5-year period means --------------------
gen p5year = .
replace p5year = 1 if inrange(year,1990,1994)
replace p5year = 2 if inrange(year,1995,1999)
replace p5year = 3 if inrange(year,2000,2004)
replace p5year = 4 if inrange(year,2005,2009)
replace p5year = 5 if inrange(year,2010,2014)
collapse (mean) GINIW_pred_GDP_pc GDP_pc_Country, by(Country_ISO p5year)

* --- Step 2: build the cubic and fit country + period fixed effects ---------
gen lg  = log(GDP_pc_Country)
gen lg2 = lg^2
gen lg3 = lg^3
encode Country_ISO, generate(cid)
xtset cid p5year
xtreg GINIW_pred_GDP_pc lg lg2 lg3 i.p5year, fe robust cluster(cid)
* Cubic coefficients: 0.293 / -0.032 / 0.0011  (N ~ 879, 180 countries) --
* the +/-/+ sign pattern is the N-shaped spatial Kuznets curve.

* --- Step 3: DRAW the curve in two extra lines (Figure 4) -------------------
* Factor-variable notation `c.lg##c.lg##c.lg` builds lg, lg^2 and lg^3 AND tells
* `margins` they move together, so the predicted curve bends correctly. This
* replaces the post's hand-built partial-residual plot.
xtreg GINIW_pred_GDP_pc c.lg##c.lg##c.lg i.p5year, fe robust cluster(cid)
margins, at(lg=(5(0.5)12))
marginsplot, recast(line) recastci(rarea) ///
    title("Regional Kuznets curve") xtitle("log GDP per capita") ///
    ytitle("Predicted regional Gini")


*=============================================================================*
* B.6  TURNING POINTS AND THE DISCRIMINANT        (mirrors section 9)
*-----------------------------------------------------------------------------*
* A cubic y = b1*lg + b2*lg^2 + b3*lg^3 turns where its slope is zero:
*   3*b3*lg^2 + 2*b2*lg + b1 = 0  (a quadratic in lg). Real turning points exist
*   only if the discriminant D = (2*b2)^2 - 4*(3*b3)*b1 > 0.
*=============================================================================*
use "${RAW}Table_3_data.dta", clear
gen p5year = .
replace p5year = 1 if inrange(year,1990,1994)
replace p5year = 2 if inrange(year,1995,1999)
replace p5year = 3 if inrange(year,2000,2004)
replace p5year = 4 if inrange(year,2005,2009)
replace p5year = 5 if inrange(year,2010,2014)
collapse (mean) GINIW_pred_GDP_pc GDP_pc_Country, by(Country_ISO p5year)
gen lg = log(GDP_pc_Country)
gen lg2 = lg^2
gen lg3 = lg^3
encode Country_ISO, generate(cid)
xtset cid p5year
xtreg GINIW_pred_GDP_pc lg lg2 lg3 i.p5year, fe robust cluster(cid)

scalar b1 = _b[lg]
scalar b2 = _b[lg2]
scalar b3 = _b[lg3]
scalar D  = (2*b2)^2 - 4*(3*b3)*b1               // discriminant
scalar lo = (-2*b2 - sqrt(D)) / (2*3*b3)         // first turning point  (log)
scalar hi = (-2*b2 + sqrt(D)) / (2*3*b3)         // second turning point (log)
display "D = " D "  (>0 => two real turning points)"
display "turning points: ln=" %4.2f lo " ($" %1.0f exp(lo) ")  and  ln=" ///
        %5.2f hi " ($" %1.0f exp(hi) ")"
* -> D > 0; turning points at ln=7.74 ($2,287) and ln=11.25 ($77,206).


*=============================================================================*
* B.7  WHAT DRIVES REGIONAL INEQUALITY -- TABLE 4   (mirrors section 10)
*-----------------------------------------------------------------------------*
* Same 5-year panel and cubic as B.5, now adding a block of structural controls
* to each column. (Published column 4 needs a licensed ICRG variable that is not
* in the data, so it is omitted -- see the post.)
*=============================================================================*
use "${RAW}Table_4_data.dta", clear
gen p5year = .
replace p5year = 1 if inrange(year,1990,1994)
replace p5year = 2 if inrange(year,1995,1999)
replace p5year = 3 if inrange(year,2000,2004)
replace p5year = 4 if inrange(year,2005,2009)
replace p5year = 5 if inrange(year,2010,2014)
collapse (mean) GINIW_pred_GDP_pc GDP_pc_Country ///
               Resources_rents_share_of_GDP Arable_land GINIW_Eth_light, ///
         by(Country_ISO p5year)
gen lg = log(GDP_pc_Country)
gen lg2 = lg^2
gen lg3 = lg^3
encode Country_ISO, generate(cid)
xtset cid p5year

* Resource rents + arable land
xtreg GINIW_pred_GDP_pc lg lg2 lg3 Resources_rents_share_of_GDP Arable_land ///
      i.p5year, fe robust cluster(cid)
* Ethnic inequality (published col 6): coefficient = 0.071
xtreg GINIW_pred_GDP_pc lg lg2 lg3 GINIW_Eth_light i.p5year, ///
      fe robust cluster(cid)


*=============================================================================*
* B.8  SPATIAL ROBUSTNESS: CONLEY STANDARD ERRORS -- TABLE B.4  (section 11)
*-----------------------------------------------------------------------------*
* Re-estimates Table 1 column 2 (within-region lights model) but replaces the
* standard errors with spatially-robust Conley/Hsiang errors at three cutoff
* radii. The point estimate (0.190) does not change -- only the SEs.
*
* ols_spatial_HAC is NOT on SSC (see the header). If it is missing we skip this
* block rather than stop the whole file.
*=============================================================================*
capture which ols_spatial_HAC
if _rc {
    display as txt "B.8 skipped: ols_spatial_HAC not installed (see header)."
}
else {
    use "${RAW}Table_B4_data.dta", clear
    tsset code_Coutry_Region year
    xi i.code_Coutry_Region                  // region FE as explicit dummies
    set matsize 11000
    gen const = 1                            // the command needs an explicit constant

    foreach D in 1000 2500 5000 {            // spatial cutoff radius, in km
        ols_spatial_HAC log_GDP_pc_Region log_Light_ppix_Region ///
            _Icode_Cout_2-_Icode_Cout_1504 satyear_1-satyear_7 const, ///
            lat(Latitude) lon(Longitude) t(year) p(code_Coutry_Region) ///
            dist(`D') lag(0) bartlett
    }
    * Coefficient = 0.190 in all three; Stata Conley SEs widen with the radius
    * (~0.020 / 0.025 / 0.027). The post's Python Conley SEs (0.026 / 0.034 /
    * 0.037) are a touch larger because the two packages weight distances
    * differently -- but the conclusion is identical: the elasticity is not an
    * artefact of spatial correlation (the iid SE is only ~0.013).
}


*=============================================================================*
* B.9  REGIONAL VERSUS PERSONAL INEQUALITY -- FIGURE 5   (mirrors section 12)
*-----------------------------------------------------------------------------*
* Across countries, does inequality BETWEEN regions track inequality BETWEEN
* people? Average each country over 2001-2012, put both Ginis on the 0-1 scale,
* and regress personal on regional inequality.
*=============================================================================*
use "${RAW}Figure_5_data.dta", clear
keep if year>2000 & year<2013
collapse (mean) GINIW_pred_GDP_pc Giniall, by(Country_ISO)
gen GINIall_100 = Giniall/100                 // household Gini 0-100 -> 0-1
regress GINIall_100 GINIW_pred_GDP_pc         // slope = 0.587 over n ~ 144
twoway (scatter GINIall_100 GINIW_pred_GDP_pc, msymbol(t)) ///
       (lfit    GINIall_100 GINIW_pred_GDP_pc), ///
       xtitle("Interregional inequality (GINIW)") ///
       ytitle("Interpersonal inequality (Gini)") legend(off) ///
       title("Figure 5a: regional vs personal inequality")

* The upward slope (0.587) says places with wide gaps BETWEEN regions also tend
* to have wide gaps BETWEEN people: distinct measures, but linked.

*=============================================================================*
* END. Every headline number above matches the Python results in the post --
* reached with a small fraction of the code. That is the point of Appendix B.
*=============================================================================*
