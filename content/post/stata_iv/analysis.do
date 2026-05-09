/*==================================================================
  Instrumental Variables in Development Economics
  Replicating Acemoglu, Johnson & Robinson (2001)
  "The Colonial Origins of Comparative Development"

  Tutorial companion file for: carlos-mendez.org/post/stata_iv/

  Audience: graduate / advanced-undergrad students in development
  economics. Estimand: 2SLS identifies the LATE (Imbens-Angrist 1994)
  for compliers — the subpopulation of countries whose institutional
  quality would change in response to settler-mortality variation.
  Under constant treatment effects, LATE = ATE.

  Three IV identification conditions (Wooldridge, Cameron-Trivedi):
    (i)   Relevance:    cov(Z, X) != 0  (logem4 predicts avexpr)
    (ii)  Exclusion:    Z affects Y only through X (mortality affects
                        modern GDP only via institutions)
    (iii) Exogeneity:   Z _||_ U  (mortality independent of unobserved
                        determinants of GDP, conditional on controls)

  Datasets: 8 .dta files (maketable1.dta … maketable8.dta) live at
  the post root. By default they are loaded from this site's GitHub
  raw URL (${DATA_URL} in §0) so any reader can replicate without
  cloning the repo. Set USE_GITHUB 0 in §0 to load from the local
  folder instead. Each section mirrors the original AJR do-file.

  Usage:
    cd content/post/stata_iv/
    /Applications/Stata\ 18.0/StataMP.app/Contents/MacOS/stata-mp -b do analysis.do

  Outputs:
    - analysis.log            : full text log
    - stata_iv_*.png          : 3 figures
    - tab[1-8]_*.csv          : 9 result tables
    - data_maketable*.csv     : 8 dataset dumps

  References:
    - Acemoglu, Johnson, Robinson (2001), AER 91(5): 1369-1401
    - Imbens & Angrist (1994), Econometrica 62(2): 467-475
    - Stock & Yogo (2005), in Andrews-Stock Festschrift
    - Albouy (2012), AER 102(6): 3059-3076 (settler-mortality critique)
==================================================================*/

clear all
set more off
set seed 42
capture log close
log using "analysis.log", text replace

di _newline(2)
di "================================================================"
di "  AJR (2001) IV Tutorial — Colonial Origins of Development"
di "  Estimand: LATE (compliers) under heterogeneous effects."
di "  Three IV conditions: relevance, exclusion, exogeneity."
di "================================================================"
di _newline

//──────────────────────────────────────────────────────────────────
// SSC dependencies (idempotent — capture handles re-runs)
//──────────────────────────────────────────────────────────────────
capture ssc install ivreg2
capture ssc install ranktest
capture ssc install estout
capture ssc install coefplot

//──────────────────────────────────────────────────────────────────
// Globals
//──────────────────────────────────────────────────────────────────
//── Data-loading mode ──────────────────────────────────────────────
// USE_GITHUB = 1 (default): load .dta files from this site's GitHub
//                           repo (replicability for any reader).
// USE_GITHUB = 0          : load from current folder (offline / dev).
//───────────────────────────────────────────────────────────────────
global USE_GITHUB 1

if $USE_GITHUB {
    global DATA_URL "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/stata_iv"
}
else {
    global DATA_URL "."
}
di "Data source: ${DATA_URL}"

global Y   logpgp95
global X   avexpr
global Z   logem4

//──────────────────────────────────────────────────────────────────
// Dark-theme colors — Stata color() takes "R G B" triplets, not hex
//   #0f1729 -> "15 23 41"   (dark navy / background)
//   #1f2b5e -> "31 43 94"   (grid line)
//   #6a9bcc -> "106 155 204" (steel blue / primary data)
//   #d97757 -> "217 119 87"  (warm orange / fit lines)
//   #00d4c8 -> "0 212 200"   (teal / highlights)
//   #c8d0e0 -> "200 208 224" (light text / axis labels)
//   #e8ecf2 -> "232 236 242" (white text / titles)
//──────────────────────────────────────────────────────────────────
global DARK_NAVY   "15 23 41"
global GRID_LINE   "31 43 94"
global STEEL_BLUE  "106 155 204"
global WARM_ORANGE "217 119 87"
global TEAL        "0 212 200"
global LIGHT_TEXT  "200 208 224"
global WHITE_TEXT  "232 236 242"


/*==================================================================
  SECTION 1: TABLE 1 — Summary Statistics
  Goal: describe outcomes, institutions, and instrument across the
  whole world, the AJR base sample (former colonies with mortality
  data), and quartiles of settler mortality.
==================================================================*/

di _newline(2)
di "================================================================"
di "  TABLE 1 — Summary Statistics"
di "================================================================"

use "${DATA_URL}/maketable1.dta", clear
export delimited using "data_maketable1.csv", replace

// 1.1 Whole world
di _newline "*** Column 1: whole world ***"
summarize logpgp95 loghjypl avexpr cons00a cons1 democ00a euro1900

// 1.2 Base sample (countries with valid settler-mortality data)
di _newline "*** Column 2: AJR base sample (baseco==1) ***"
preserve
    keep if baseco==1
    summarize logpgp95 loghjypl avexpr cons00a cons1 democ00a euro1900 logem4

    // Export base-sample summary as CSV
    estpost summarize logpgp95 loghjypl avexpr cons00a cons1 democ00a euro1900 logem4
    esttab using "tab1_summary.csv", ///
        csv replace ///
        cells("count(fmt(0)) mean(fmt(3)) sd(fmt(3)) min(fmt(3)) max(fmt(3))") ///
        label title("Table 1: Summary Statistics, AJR base sample")
restore

// 1.3 Mortality quartiles (replicates original AJR rank-based bins)
di _newline "*** Columns 3-6: quartiles of settler mortality ***"
egen rank  = rank(extmort4), track
egen count = count(extmort4)
gen  ptile = rank/count
gen  q     = .
replace q = 1 if ptile <= .25
replace q = 2 if ptile >  .25 & ptile <= .50
replace q = 3 if ptile >  .50 & ptile <= .75
replace q = 4 if ptile >  .75
tabulate q

bysort q: summarize logpgp95 avexpr logem4


/*==================================================================
  SECTION 2: TABLE 2 — OLS Regressions
  Goal: establish a naive benchmark. OLS is biased because
  institutions are correlated with unobserved determinants of GDP
  (reverse causality + omitted variables + measurement error).
  The IV estimates in §5 will reveal the magnitude of that bias.
==================================================================*/

di _newline(2)
di "================================================================"
di "  TABLE 2 — OLS Regressions of log GDP per capita"
di "================================================================"

use "${DATA_URL}/maketable2.dta", clear
export delimited using "data_maketable2.csv", replace

// Note: original do-file flags 111 vs 110 obs. We mirror the 111-obs spec.

// Col 1: whole world
regress logpgp95 avexpr, robust
eststo m2_c1

// Col 2: base sample
regress logpgp95 avexpr if baseco==1, robust
eststo m2_c2

// Col 3: + latitude
regress logpgp95 avexpr lat_abst, robust
eststo m2_c3

// Col 4: + latitude + continent dummies
regress logpgp95 avexpr lat_abst africa asia other, robust
eststo m2_c4

// Col 5: base sample + latitude
regress logpgp95 avexpr lat_abst if baseco==1, robust
eststo m2_c5

// Col 6: base sample + latitude + continents
regress logpgp95 avexpr lat_abst africa asia other if baseco==1, robust
eststo m2_c6

// Col 7: log output per worker (whole world)
regress loghjypl avexpr, robust
eststo m2_c7

// Col 8: log output per worker (base sample)
regress loghjypl avexpr if baseco==1, robust
eststo m2_c8

esttab m2_c1 m2_c2 m2_c3 m2_c4 m2_c5 m2_c6 m2_c7 m2_c8 ///
    using "tab2_ols.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) ///
    stats(N r2, fmt(0 3) labels("N" "R-squared")) ///
    title("Table 2: OLS Regressions of log GDP per capita")


/*==================================================================
  SECTION 3: TABLE 3 — Determinants of Institutions
  Panel A: today's institutions on early institutions / settlement
  Panel B: early institutions on settler mortality
  Together this panel previews the *first stage*: settler mortality
  shapes settlement, settlement shapes early institutions, and early
  institutions persist into modern institutions.
==================================================================*/

di _newline(2)
di "================================================================"
di "  TABLE 3 — Determinants of Institutions"
di "================================================================"

use "${DATA_URL}/maketable3.dta", clear
keep if excolony==1
keep if extmort4 != .
replace euro1900 = euro1900 / 100
export delimited using "data_maketable3.csv", replace

//── Panel A: DV = avexpr (current institutions) ──────────────────
di _newline "*** Panel A: DV = average expropriation risk 1985-95 ***"

regress avexpr cons00a if excolony==1 & extmort4!=.
eststo m3a_c1
regress avexpr lat_abst cons00a if excolony==1 & extmort4!=.
eststo m3a_c2
regress avexpr democ00a if excolony==1 & extmort4!=.
eststo m3a_c3
regress avexpr democ00a lat_abst if excolony==1 & extmort4!=.
eststo m3a_c4
regress avexpr indtime cons1 if excolony==1 & extmort4!=.
eststo m3a_c5
regress avexpr indtime cons1 lat_abst if excolony==1 & extmort4!=.
eststo m3a_c6
regress avexpr euro1900 if excolony==1 & extmort4!=.
eststo m3a_c7
regress avexpr euro1900 lat_abst if excolony==1 & extmort4!=.
eststo m3a_c8
regress avexpr logem4 if excolony==1 & extmort4!=. & logpgp95!=.
eststo m3a_c9
regress avexpr logem4 lat_abst if excolony==1 & extmort4!=. & logpgp95!=.
eststo m3a_c10

esttab m3a_c1 m3a_c2 m3a_c3 m3a_c4 m3a_c5 ///
       m3a_c6 m3a_c7 m3a_c8 m3a_c9 m3a_c10 ///
    using "tab3a_inst.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) ///
    stats(N r2, fmt(0 3) labels("N" "R-squared")) ///
    title("Table 3 Panel A: DV = current expropriation protection")

//── Panel B: DV = early institutions ─────────────────────────────
di _newline "*** Panel B: DV = early institutions (cons00a, democ00a, euro1900) ***"

regress cons00a euro1900 if excolony==1 & extmort4!=. & logpgp95!=.
eststo m3b_c1
regress cons00a euro1900 lat_abst if excolony==1 & extmort4!=. & logpgp95!=.
eststo m3b_c2
regress cons00a logem4 if excolony==1 & extmort4!=.
eststo m3b_c3
regress cons00a lat_abst logem4 if excolony==1 & extmort4!=.
eststo m3b_c4
regress democ00a euro1900 if excolony==1 & extmort4!=. & logpgp95!=.
eststo m3b_c5
regress democ00a lat_abst euro1900 if excolony==1 & extmort4!=. & logpgp95!=.
eststo m3b_c6
regress democ00a logem4 if excolony==1 & extmort4!=. & logpgp95!=.
eststo m3b_c7
regress democ00a lat_abst logem4 if excolony==1 & extmort4!=. & logpgp95!=.
eststo m3b_c8
regress euro1900 logem4 if excolony==1 & extmort4!=. & logpgp95!=.
eststo m3b_c9
regress euro1900 lat_abst logem4 if excolony==1 & extmort4!=. & logpgp95!=.
eststo m3b_c10

esttab m3b_c1 m3b_c2 m3b_c3 m3b_c4 m3b_c5 ///
       m3b_c6 m3b_c7 m3b_c8 m3b_c9 m3b_c10 ///
    using "tab3b_inst.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) ///
    stats(N r2, fmt(0 3) labels("N" "R-squared")) ///
    title("Table 3 Panel B: DV = early institutions")


/*==================================================================
  SECTION 4: FIGURES 1 & 2 — first-stage and reduced-form scatters
  These visualize the two pieces of any IV identification:
    Figure 1 (first stage):  Z -> X (settler mortality -> institutions)
    Figure 2 (reduced form): Z -> Y (settler mortality -> log GDP)
  The 2SLS coefficient is exactly the slope of the reduced form
  divided by the slope of the first stage.
==================================================================*/

di _newline(2)
di "================================================================"
di "  FIGURES 1 & 2 — First-stage and reduced-form scatters"
di "================================================================"

use "${DATA_URL}/maketable4.dta", clear
keep if baseco==1

// 4.1 Compute first-stage F-statistic for figure caption
ivreg2 logpgp95 (avexpr=logem4), robust
di _newline "*** First-stage Kleibergen-Paap rk Wald F: " %6.2f e(widstat)
di "*** Stock-Yogo (2005) 10% maximal IV size critical value: 16.38"
di "*** NOTE: 16.38 is the IID threshold for the Cragg-Donald F."
di "*** Under robust SEs (this run), use Olea & Pflueger (2013)"
di "*** effective F instead. Install: ssc install weakivtest."
di "*** Staiger-Stock (1997) weak-IV rule of thumb: F > 10."

// 4.2 Figure 1 — first stage: logem4 -> avexpr
twoway ///
    (scatter avexpr logem4, ///
        mcolor("${STEEL_BLUE}") msize(medsmall) ///
        mlabel(shortnam) mlabcolor("${TEAL}") ///
        mlabsize(vsmall) mlabposition(3) mlabgap(*0.5)) ///
    (lfit avexpr logem4, ///
        lcolor("${WARM_ORANGE}") lwidth(medthick)), ///
    title("Figure 1. First stage: settler mortality predicts institutions", ///
        color("${WHITE_TEXT}") size(medium)) ///
    subtitle("Base sample of 64 ex-colonies (AJR 2001 Table 4)", ///
        color("${LIGHT_TEXT}") size(small)) ///
    xtitle("Log settler mortality (logem4)", color("${LIGHT_TEXT}")) ///
    ytitle("Avg. protection from expropriation, 1985-95 (avexpr)", ///
        color("${LIGHT_TEXT}")) ///
    xlabel(, labcolor("${LIGHT_TEXT}") tlcolor("${LIGHT_TEXT}")) ///
    ylabel(, labcolor("${LIGHT_TEXT}") tlcolor("${LIGHT_TEXT}") angle(0)) ///
    graphregion(color("${DARK_NAVY}") margin(medlarge)) ///
    plotregion(color("${DARK_NAVY}") lcolor("${DARK_NAVY}")) ///
    bgcolor("${DARK_NAVY}") ///
    legend(off) ///
    scheme(s2color)

graph export "stata_iv_first_stage.png", replace width(2400)

// 4.3 Figure 2 — reduced form: logem4 -> logpgp95
twoway ///
    (scatter logpgp95 logem4, ///
        mcolor("${STEEL_BLUE}") msize(medsmall) ///
        mlabel(shortnam) mlabcolor("${TEAL}") ///
        mlabsize(vsmall) mlabposition(3) mlabgap(*0.5)) ///
    (lfit logpgp95 logem4, ///
        lcolor("${WARM_ORANGE}") lwidth(medthick)), ///
    title("Figure 2. Reduced form: settler mortality predicts log GDP", ///
        color("${WHITE_TEXT}") size(medium)) ///
    subtitle("Base sample of 64 ex-colonies (AJR 2001 Table 4)", ///
        color("${LIGHT_TEXT}") size(small)) ///
    xtitle("Log settler mortality (logem4)", color("${LIGHT_TEXT}")) ///
    ytitle("Log GDP per capita, PPP, 1995 (logpgp95)", ///
        color("${LIGHT_TEXT}")) ///
    xlabel(, labcolor("${LIGHT_TEXT}") tlcolor("${LIGHT_TEXT}")) ///
    ylabel(, labcolor("${LIGHT_TEXT}") tlcolor("${LIGHT_TEXT}") angle(0)) ///
    graphregion(color("${DARK_NAVY}") margin(medlarge)) ///
    plotregion(color("${DARK_NAVY}") lcolor("${DARK_NAVY}")) ///
    bgcolor("${DARK_NAVY}") ///
    legend(off) ///
    scheme(s2color)

graph export "stata_iv_reduced_form.png", replace width(2400)


/*==================================================================
  SECTION 5: TABLE 4 — Main IV result + modern weak-IV diagnostics
  This is AJR's headline finding: the 2SLS coefficient on avexpr
  (~0.94) is *larger* than the OLS coefficient (~0.52), suggesting
  measurement-error attenuation in OLS dominates other biases.

  Modern diagnostics layered on top:
   - First-stage Kleibergen-Paap F-stat (e(widstat))
   - Stock-Yogo critical values (printed in ivreg2 output)
   - Endogeneity test (Durbin-Wu-Hausman) via ivreg2's endog() option
==================================================================*/

di _newline(2)
di "================================================================"
di "  TABLE 4 — IV Regressions of log GDP per capita (main result)"
di "================================================================"

use "${DATA_URL}/maketable4.dta", clear
keep if baseco==1
export delimited using "data_maketable4.csv", replace

// Generate Neo-Europes "other continent" dummy (AUS, MLT, NZL)
gen other_cont = .
replace other_cont = 1 if shortnam=="AUS" | shortnam=="MLT" | shortnam=="NZL"
recode other_cont (.=0)

//── Panel B: 2SLS (IV) regressions ───────────────────────────────
di _newline "*** Panel B: 2SLS (IV with logem4) ***"

// Col 1: base sample (no controls)
ivreg2 logpgp95 (avexpr=logem4), robust first endog(avexpr)
eststo m4_iv_c1
estadd scalar firstF = e(widstat)

di _newline "*** First-stage F (KP rk Wald): " %6.2f e(widstat) " ***"
di "*** Stock-Yogo (2005) 10% maximal IV size threshold: 16.38 (IID) ***"
di "*** Under robust SEs, see Olea & Pflueger (2013) effective F.   ***"
di "*** Endogeneity test (Durbin-Wu-Hausman) chi2(1):  " %6.3f e(estat)
di "*** Endogeneity test p-value:                      " %6.4f e(estatp)
di "*** (small p-value -> reject OLS exogeneity -> IV is warranted) ***"

// Col 2: base sample + latitude
ivreg2 logpgp95 lat_abst (avexpr=logem4), robust first
eststo m4_iv_c2
estadd scalar firstF = e(widstat)

// Col 3: base sample minus Neo-Europes (USA/CAN/AUS/NZL)
ivreg2 logpgp95 (avexpr=logem4) if rich4!=1, robust first
eststo m4_iv_c3
estadd scalar firstF = e(widstat)

// Col 4: base sample minus Neo-Europes + latitude
ivreg2 logpgp95 lat_abst (avexpr=logem4) if rich4!=1, robust first
eststo m4_iv_c4
estadd scalar firstF = e(widstat)

// Col 5: base sample minus Africa
ivreg2 logpgp95 (avexpr=logem4) if africa!=1, robust first
eststo m4_iv_c5
estadd scalar firstF = e(widstat)

// Col 6: base sample minus Africa + latitude
ivreg2 logpgp95 lat_abst (avexpr=logem4) if africa!=1, robust first
eststo m4_iv_c6
estadd scalar firstF = e(widstat)

// Col 7: continent dummies
ivreg2 logpgp95 (avexpr=logem4) africa asia other_cont, robust first
eststo m4_iv_c7
estadd scalar firstF = e(widstat)

// Col 8: continent dummies + latitude
ivreg2 logpgp95 lat_abst (avexpr=logem4) africa asia other_cont, robust first
eststo m4_iv_c8
estadd scalar firstF = e(widstat)

// Col 9: log output per worker (loghjypl)
ivreg2 loghjypl (avexpr=logem4), robust first
eststo m4_iv_c9
estadd scalar firstF = e(widstat)

//── Panel C: OLS counterparts ────────────────────────────────────
di _newline "*** Panel C: OLS comparisons ***"

regress logpgp95 avexpr, robust
eststo m4_ols_c1
regress logpgp95 lat_abst avexpr, robust
eststo m4_ols_c2
regress logpgp95 avexpr if rich4!=1, robust
eststo m4_ols_c3
regress logpgp95 lat_abst avexpr if rich4!=1, robust
eststo m4_ols_c4
regress logpgp95 avexpr if africa!=1, robust
eststo m4_ols_c5
regress logpgp95 lat_abst avexpr if africa!=1, robust
eststo m4_ols_c6
regress logpgp95 avexpr africa asia other_cont, robust
eststo m4_ols_c7
regress logpgp95 lat_abst avexpr africa asia other_cont, robust
eststo m4_ols_c8
regress loghjypl avexpr, robust
eststo m4_ols_c9

esttab m4_iv_c1 m4_iv_c2 m4_iv_c3 m4_iv_c4 m4_iv_c5 ///
       m4_iv_c6 m4_iv_c7 m4_iv_c8 m4_iv_c9 ///
       m4_ols_c1 m4_ols_c2 m4_ols_c3 m4_ols_c4 m4_ols_c5 ///
       m4_ols_c6 m4_ols_c7 m4_ols_c8 m4_ols_c9 ///
    using "tab4_iv_main.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) ///
    stats(N r2 firstF, fmt(0 3 2) ///
        labels("N" "R-squared" "First-stage F (KP rk Wald)")) ///
    title("Table 4: 2SLS and OLS, log GDP per capita")


/*==================================================================
  SECTION 6: TABLE 5 — IV with colonial / legal / religion controls
  Robustness: do colonial-era variables (British/French ruler, French
  legal origin, dominant religion) confound the institutions-GDP
  link? Spoiler: the IV coefficient barely moves.
==================================================================*/

di _newline(2)
di "================================================================"
di "  TABLE 5 — IV with colonial, legal, and religious controls"
di "================================================================"

use "${DATA_URL}/maketable5.dta", clear
keep if baseco==1
export delimited using "data_maketable5.csv", replace

// Col 1-2: British/French dummies
ivreg2 logpgp95 (avexpr=logem4) f_brit f_french, robust first
eststo m5_iv_c1
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=logem4) f_brit f_french, robust first
eststo m5_iv_c2
estadd scalar firstF = e(widstat)

// Col 3-4: British colonies only
ivreg2 logpgp95 (avexpr=logem4) if f_brit==1, robust first
eststo m5_iv_c3
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=logem4) if f_brit==1, robust first
eststo m5_iv_c4
estadd scalar firstF = e(widstat)

// Col 5-6: French legal origin
ivreg2 logpgp95 (avexpr=logem4) sjlofr, robust first
eststo m5_iv_c5
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=logem4) sjlofr, robust first
eststo m5_iv_c6
estadd scalar firstF = e(widstat)

// Col 7-8: religion dummies
ivreg2 logpgp95 (avexpr=logem4) catho80 muslim80 no_cpm80, robust first
eststo m5_iv_c7
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=logem4) catho80 muslim80 no_cpm80, robust first
eststo m5_iv_c8
estadd scalar firstF = e(widstat)

// Col 9: kitchen-sink controls
ivreg2 logpgp95 lat_abst (avexpr=logem4) f_french sjlofr ///
    catho80 muslim80 no_cpm80, robust first
eststo m5_iv_c9
estadd scalar firstF = e(widstat)

esttab m5_iv_c1 m5_iv_c2 m5_iv_c3 m5_iv_c4 m5_iv_c5 ///
       m5_iv_c6 m5_iv_c7 m5_iv_c8 m5_iv_c9 ///
    using "tab5_iv_controls.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) ///
    stats(N r2 firstF, fmt(0 3 2) ///
        labels("N" "R-squared" "First-stage F (KP rk Wald)")) ///
    title("Table 5: 2SLS with colonial / legal / religion controls")


/*==================================================================
  SECTION 7: TABLE 6 — Geography and climate robustness
  Adds temperature, humidity, soil, resource, and ethnolinguistic
  controls. Geography matters for income, but the institutions
  channel survives.
==================================================================*/

di _newline(2)
di "================================================================"
di "  TABLE 6 — IV with geography and climate controls"
di "================================================================"

use "${DATA_URL}/maketable6.dta", clear
keep if baseco==1
export delimited using "data_maketable6.csv", replace

// Col 1-2: temperature + humidity
ivreg2 logpgp95 (avexpr=logem4) temp* humid*, robust first
eststo m6_iv_c1
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=logem4) temp* humid*, robust first
eststo m6_iv_c2
estadd scalar firstF = e(widstat)

// Col 3-4: % European descent in 1975
ivreg2 logpgp95 (avexpr=logem4) edes1975, robust first
eststo m6_iv_c3
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=logem4) edes1975, robust first
eststo m6_iv_c4
estadd scalar firstF = e(widstat)

// Col 5-6: soil quality, resources, landlocked
ivreg2 logpgp95 (avexpr=logem4) steplow deslow stepmid desmid drystep ///
    drywint goldm iron silv zinc oilres landlock, robust first
eststo m6_iv_c5
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=logem4) steplow deslow stepmid desmid ///
    drystep drywint goldm iron silv zinc oilres landlock, robust first
eststo m6_iv_c6
estadd scalar firstF = e(widstat)

// Col 7-8: ethnolinguistic fragmentation
ivreg2 logpgp95 (avexpr=logem4) avelf, robust first
eststo m6_iv_c7
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=logem4) avelf, robust first
eststo m6_iv_c8
estadd scalar firstF = e(widstat)

// Col 9: all controls
ivreg2 logpgp95 lat_abst (avexpr=logem4) temp* humid* edes1975 avelf ///
    steplow deslow stepmid desmid drystep drywint goldm iron silv zinc ///
    oilres landlock, robust first
eststo m6_iv_c9
estadd scalar firstF = e(widstat)

esttab m6_iv_c1 m6_iv_c2 m6_iv_c3 m6_iv_c4 m6_iv_c5 ///
       m6_iv_c6 m6_iv_c7 m6_iv_c8 m6_iv_c9 ///
    using "tab6_iv_geo.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) ///
    stats(N r2 firstF, fmt(0 3 2) ///
        labels("N" "R-squared" "First-stage F (KP rk Wald)")) ///
    title("Table 6: 2SLS with geography and climate controls")


/*==================================================================
  SECTION 8: TABLE 7 — Health channels (first overidentified specs)
  Cols 7-9 instrument BOTH avexpr AND a health variable using 4
  instruments (logem4, latabs, lt100km, meantemp). With 4 instruments
  and 2 endogenous regressors, the model is overidentified by 2
  degrees: Hansen J becomes a meaningful test of the joint exclusion
  restriction.
==================================================================*/

di _newline(2)
di "================================================================"
di "  TABLE 7 — Health-channel IV (with overidentification on Cols 7-9)"
di "================================================================"

use "${DATA_URL}/maketable7.dta", clear
keep if baseco==1
export delimited using "data_maketable7.csv", replace

// Col 1-2: malaria control (just-identified)
ivreg2 logpgp95 (avexpr=logem4) malfal94, robust first
eststo m7_iv_c1
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=logem4) malfal94, robust first
eststo m7_iv_c2
estadd scalar firstF = e(widstat)

// Col 3-4: life expectancy (just-identified)
ivreg2 logpgp95 (avexpr=logem4) leb95, robust first
eststo m7_iv_c3
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=logem4) leb95, robust first
eststo m7_iv_c4
estadd scalar firstF = e(widstat)

// Col 5-6: infant mortality (just-identified)
ivreg2 logpgp95 (avexpr=logem4) imr95, robust first
eststo m7_iv_c5
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=logem4) imr95, robust first
eststo m7_iv_c6
estadd scalar firstF = e(widstat)

// Col 7-9: instrument BOTH avexpr AND health (overidentified, GMM2S for J-test)
di _newline "*** Cols 7-9: 2 endogenous, 4 instruments => Hansen J meaningful ***"

ivreg2 logpgp95 (avexpr malfal94 = logem4 latabs lt100km meantemp), ///
    gmm2s robust first
eststo m7_iv_c7
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)

ivreg2 logpgp95 (avexpr leb95 = logem4 latabs lt100km meantemp), ///
    gmm2s robust first
eststo m7_iv_c8
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)

ivreg2 logpgp95 (avexpr imr95 = logem4 latabs lt100km meantemp), ///
    gmm2s robust first
eststo m7_iv_c9
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)

// Col 10-11: yellow fever instrument
gen other_cont7 = .
replace other_cont7 = 1 if shortnam=="AUS" | shortnam=="MLT" | shortnam=="NZL"
recode other_cont7 (.=0)

ivreg2 logpgp95 (avexpr = yellow), robust first
eststo m7_iv_c10
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 (avexpr = yellow) africa asia other_cont7, robust first
eststo m7_iv_c11
estadd scalar firstF = e(widstat)

esttab m7_iv_c1 m7_iv_c2 m7_iv_c3 m7_iv_c4 m7_iv_c5 m7_iv_c6 ///
       m7_iv_c7 m7_iv_c8 m7_iv_c9 m7_iv_c10 m7_iv_c11 ///
    using "tab7_iv_health.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) ///
    stats(N r2 firstF hansenJ hansenP, fmt(0 3 2 2 3) ///
        labels("N" "R-squared" "First-stage F (KP rk Wald)" ///
               "Hansen J statistic" "Hansen J p-value")) ///
    title("Table 7: 2SLS with health controls and overidentification")


/*==================================================================
  SECTION 9: TABLE 8 — Alternative instruments + overidentification
  Panels A/B: replace logem4 with alternative instruments
    (euro1900, cons00a, democ00a, cons1, democ1)
  Panel C (overid): pair each alt instrument WITH logem4 in a
    2-instrument GMM2S regression. Hansen J tests whether the two
    instruments give consistent estimates -- if both are valid, J
    should not reject.
  Panel D: include logem4 as exogenous control in second stage
    (relaxes exclusion to only the *excess* effect of mortality).

  Pedagogical aside (Albouy 2012): ~36% of AJR's settler-mortality
  observations are imputed or repeat values. Albouy argues this
  contamination weakens the first stage and biases the IV estimate.
  The Hansen J non-rejection in Panel C is sometimes interpreted as
  evidence against this concern; Albouy disagrees because alternative
  instruments share the same imputation problems.
==================================================================*/

di _newline(2)
di "================================================================"
di "  TABLE 8 — Alternative instruments + Hansen J overidentification"
di "================================================================"

use "${DATA_URL}/maketable8.dta", clear
keep if baseco==1
export delimited using "data_maketable8.csv", replace

//── Panels A/B: alt instruments (just-identified) ────────────────
di _newline "*** Panels A/B: each alternative instrument used alone ***"

ivreg2 logpgp95 (avexpr=euro1900), robust first
eststo m8a_c1
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=euro1900), robust first
eststo m8a_c2
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 (avexpr=cons00a), robust first
eststo m8a_c3
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=cons00a), robust first
eststo m8a_c4
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 (avexpr=democ00a), robust first
eststo m8a_c5
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=democ00a), robust first
eststo m8a_c6
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 (avexpr=cons1) indtime, robust first
eststo m8a_c7
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=cons1) indtime, robust first
eststo m8a_c8
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 (avexpr=democ1) indtime, robust first
eststo m8a_c9
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=democ1) indtime, robust first
eststo m8a_c10
estadd scalar firstF = e(widstat)

//── Panel C: 2 instruments per regression -> Hansen J meaningful ──
di _newline "*** Panel C: alt instrument + logem4 => Hansen J overid test ***"
di "*** Modern replacement for AJR's hausman consistent vs efficient ***"

ivreg2 logpgp95 (avexpr=euro1900 logem4), gmm2s robust first
eststo m8c_c1
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)
ivreg2 logpgp95 lat_abst (avexpr=euro1900 logem4), gmm2s robust first
eststo m8c_c2
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)
ivreg2 logpgp95 (avexpr=cons00a logem4), gmm2s robust first
eststo m8c_c3
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)
ivreg2 logpgp95 lat_abst (avexpr=cons00a logem4), gmm2s robust first
eststo m8c_c4
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)
ivreg2 logpgp95 (avexpr=democ00a logem4), gmm2s robust first
eststo m8c_c5
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)
ivreg2 logpgp95 lat_abst (avexpr=democ00a logem4), gmm2s robust first
eststo m8c_c6
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)
ivreg2 logpgp95 (avexpr=cons1 logem4) indtime, gmm2s robust first
eststo m8c_c7
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)
ivreg2 logpgp95 lat_abst (avexpr=cons1 logem4) indtime, gmm2s robust first
eststo m8c_c8
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)
ivreg2 logpgp95 (avexpr=democ1 logem4) indtime, gmm2s robust first
eststo m8c_c9
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)
ivreg2 logpgp95 lat_abst (avexpr=democ1 logem4) indtime, gmm2s robust first
eststo m8c_c10
estadd scalar firstF = e(widstat)
estadd scalar hansenJ = e(j)
estadd scalar hansenP = e(jp)

//── Panel D: include logem4 as exogenous control in 2nd stage ───
di _newline "*** Panel D: logem4 as exogenous control (relaxes exclusion) ***"

ivreg2 logpgp95 (avexpr=euro1900) logem4, robust first
eststo m8d_c1
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=euro1900) logem4, robust first
eststo m8d_c2
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 (avexpr=cons00a) logem4, robust first
eststo m8d_c3
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=cons00a) logem4, robust first
eststo m8d_c4
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 (avexpr=democ00a) logem4, robust first
eststo m8d_c5
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=democ00a) logem4, robust first
eststo m8d_c6
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 (avexpr=cons1) indtime logem4, robust first
eststo m8d_c7
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=cons1) indtime logem4, robust first
eststo m8d_c8
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 (avexpr=democ1) indtime logem4, robust first
eststo m8d_c9
estadd scalar firstF = e(widstat)
ivreg2 logpgp95 lat_abst (avexpr=democ1) indtime logem4, robust first
eststo m8d_c10
estadd scalar firstF = e(widstat)

esttab m8a_c1 m8a_c2 m8a_c3 m8a_c4 m8a_c5 ///
       m8a_c6 m8a_c7 m8a_c8 m8a_c9 m8a_c10 ///
       m8c_c1 m8c_c2 m8c_c3 m8c_c4 m8c_c5 ///
       m8c_c6 m8c_c7 m8c_c8 m8c_c9 m8c_c10 ///
       m8d_c1 m8d_c2 m8d_c3 m8d_c4 m8d_c5 ///
       m8d_c6 m8d_c7 m8d_c8 m8d_c9 m8d_c10 ///
    using "tab8_overid.csv", csv replace ///
    b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) ///
    stats(N r2 firstF hansenJ hansenP, fmt(0 3 2 2 3) ///
        labels("N" "R-squared" "First-stage F (KP rk Wald)" ///
               "Hansen J statistic" "Hansen J p-value")) ///
    title("Table 8: alt instruments (Panels A-B), overid (C), logem4 as control (D)")

di _newline
di "*** Albouy (2012) caveat: ~36% of mortality observations are"
di "*** imputed or repeats; Hansen J non-rejection here does not"
di "*** rule out shared imputation bias across instruments."


/*==================================================================
  SECTION 10: FIGURE 3 — coefplot of avexpr across specifications
  Visual summary of the AJR finding: across every IV specification,
  the institutional-quality coefficient sits around 0.9-1.0; OLS
  sits below at ~0.5. The IV > OLS gap is consistent with attenuation
  bias from measurement error in the institutions index.
==================================================================*/

di _newline(2)
di "================================================================"
di "  FIGURE 3 — OLS vs IV coefficient comparison"
di "================================================================"

coefplot ///
    (m4_ols_c1, label("OLS") ///
        mcolor("${WARM_ORANGE}") mfcolor("${WARM_ORANGE}") msize(medium) ///
        ciopts(lcolor("${WARM_ORANGE}"))) ///
    (m4_iv_c1, label("IV: settler mortality") ///
        mcolor("${STEEL_BLUE}") mfcolor("${STEEL_BLUE}") msize(medium) ///
        ciopts(lcolor("${STEEL_BLUE}"))) ///
    (m5_iv_c1, label("IV + colonial controls") ///
        mcolor("${STEEL_BLUE}") mfcolor("${STEEL_BLUE}") msize(medium) ///
        ciopts(lcolor("${STEEL_BLUE}"))) ///
    (m6_iv_c1, label("IV + geography controls") ///
        mcolor("${STEEL_BLUE}") mfcolor("${STEEL_BLUE}") msize(medium) ///
        ciopts(lcolor("${STEEL_BLUE}"))) ///
    (m7_iv_c1, label("IV + malaria control") ///
        mcolor("${STEEL_BLUE}") mfcolor("${STEEL_BLUE}") msize(medium) ///
        ciopts(lcolor("${STEEL_BLUE}"))) ///
    (m8a_c1, label("IV: alt instrument euro1900") ///
        mcolor("${TEAL}") mfcolor("${TEAL}") msize(medium) ///
        ciopts(lcolor("${TEAL}"))), ///
    keep(avexpr) coeflabels(avexpr = "avexpr") ///
    xline(0, lcolor("${LIGHT_TEXT}") lpattern(dash)) ///
    xtitle("Coefficient on avexpr (institutions)", ///
        color("${LIGHT_TEXT}") size(medsmall)) ///
    title("Effect of institutions on log GDP: OLS vs IV", ///
        color("${WHITE_TEXT}") size(medsmall)) ///
    subtitle("Six representative specs, 95% CI, AJR (2001) base sample", ///
        color("${LIGHT_TEXT}") size(small)) ///
    xlabel(, labcolor("${LIGHT_TEXT}") tlcolor("${LIGHT_TEXT}")) ///
    ylabel(, labcolor("${LIGHT_TEXT}") tlcolor("${LIGHT_TEXT}")) ///
    graphregion(color("${DARK_NAVY}") margin(large)) ///
    plotregion(color("${DARK_NAVY}") lcolor("${DARK_NAVY}") margin(medlarge)) ///
    legend(region(color("${DARK_NAVY}") lcolor("${DARK_NAVY}")) ///
           color("${LIGHT_TEXT}") cols(2) size(small) ///
           symxsize(*0.7)) ///
    xsize(9) ysize(6) ///
    scheme(s2color)

graph export "stata_iv_ols_vs_iv.png", replace width(3000)


/*==================================================================
  SECTION 11: Closing summary
==================================================================*/

di _newline(2)
di "================================================================"
di "  Analysis complete."
di ""
di "  Key takeaways:"
di "    - OLS coefficient on avexpr (Tab 2 Col 1):     ~0.52"
di "    - IV  coefficient on avexpr (Tab 4 Col 1):     ~0.94"
di "    - First-stage F (KP rk Wald):                  > 20"
di "    - Stock-Yogo 10% maximal IV size threshold:    16.38"
di "    - Hansen J p-values (Tab 8 Panel C):           > 0.10"
di ""
di "  Estimand: 2SLS identifies the LATE for compliers (Imbens-"
di "  Angrist 1994) -- not the ATE. Under constant treatment"
di "  effects, LATE = ATE."
di ""
di "  Outputs:"
di "    - 3 PNG figures: stata_iv_first_stage / _reduced_form /"
di "      _ols_vs_iv"
di "    - 9 result tables: tab1_summary, tab2_ols, tab3a_inst,"
di "      tab3b_inst, tab4_iv_main, tab5_iv_controls, tab6_iv_geo,"
di "      tab7_iv_health, tab8_overid"
di "    - 8 dataset dumps: data_maketable[1-8]"
di "================================================================"

estimates clear

di _newline "=== Script completed successfully ==="

log close
