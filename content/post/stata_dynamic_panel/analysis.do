****************************************************
* Dynamic Panel Data Analysis: War & Economic Growth
* Reproducing Thies & Baum (2020), Cato Journal, Vol. 40, No. 1
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_dynamic_panel/
*
* Dataset: CatoJ.dta
*   1,333 country-years, 155 countries, every 5 years 1955-2015
*   Sources: Maddison (GDP), Fraser (Economic Freedom),
*            Systemic Peace (War, Coup), Freedom House (Polit. Freedom)
*
* Method: Arellano-Bond GMM via xtabond2 (Roodman 2009)
*
* Estimand: within-country dynamic effect of war intensity on
*           log GDP per capita.  Identification comes from first-
*           differencing (removes country fixed effects) plus deeper
*           lags of the endogenous regressors used as instruments.
*
* Original code by Prof. Christopher F. Baum (Boston College).
* This tutorial expands his code with EDA, visualisations, and
* beginner-friendly commentary.
*
* Usage:
*   1. Open Stata (or run in batch: stata-se -b do analysis.do)
*   2. The script auto-installs all required packages on first run.
*   3. All graphs are saved as PNG files.
****************************************************

*----------------------------------------------------
* Section 1: Setup
*----------------------------------------------------
clear all
set more off
set seed 42
capture log close
log using "analysis.log", replace text

*----------------------------------------------------
* Section 2: Install dependencies (idempotent)
*----------------------------------------------------
* xtabond2  - Arellano-Bond / Blundell-Bond GMM (Roodman)
* estout    - publication-quality regression tables
* outreg2   - alternative table exporter
* coefplot  - plot regression coefficients
capture which xtabond2
if _rc capture ssc install xtabond2, replace
capture which estout
if _rc capture ssc install estout, replace
capture which outreg2
if _rc capture ssc install outreg2, replace
capture which coefplot
if _rc capture ssc install coefplot, replace

*----------------------------------------------------
* Section 3: Import data
*----------------------------------------------------
* The CatoJ.dta panel is hosted on GitHub by quarcs-lab.
use "https://github.com/quarcs-lab/data-open/raw/master/panel/CatoJ.dta", clear

describe
sum
sum cty Year DemocIndxLag PolitFreeLag EconFreeLag

* NOTE: It looks like a full balanced panel, but it isn't.  Some
* missing observations are coded as 0, so we fix this next.

*----------------------------------------------------
* Section 4: Recode missing-as-zero codes to actual missing
*----------------------------------------------------
* The lag-prefixed variables encode unavailable observations as 0.
* mvdecode replaces those zeros with Stata's missing-value marker
* so they are correctly excluded from the regressions below.
mvdecode DemocIndxLag PolitFreeLag EconFreeLag, mv(0)
sum      DemocIndxLag PolitFreeLag EconFreeLag

*----------------------------------------------------
* Section 5: Label key variables
*----------------------------------------------------
lab var lnGDPpercapita  lnGDPpc
lab var EconFreeLag     L.EconFreedom
lab var PolitFreeLag    L.PolitFreedom

*----------------------------------------------------
* Section 6: Exploratory data analysis
*----------------------------------------------------

* 6.1 Descriptive statistics --------------------------
estpost summarize lnGDPpercapita War Coup EconFreeLag PolitFreeLag, detail
esttab using "summary_stats.csv", replace ///
    cells("count(label(N)) mean(label(Mean) fmt(3)) sd(label(SD) fmt(3)) min(label(Min) fmt(3)) p50(label(Median) fmt(3)) max(label(Max) fmt(3))") ///
    nomtitle nonumber noobs ///
    title("Descriptive statistics: dynamic panel dataset")

* 6.2 Figure: Mean War & Coup intensity over time ----
preserve
    collapse (mean) War Coup, by(Year)
    twoway (line War  Year, lcolor("106 155 204") lwidth(thick))      ///
           (line Coup Year, lcolor("217 119 87")  lwidth(thick)),     ///
           ytitle("Mean intensity (0 = none, 1 = max)")               ///
           xtitle("Year")                                             ///
           title("Mean war & coup intensity by year, 1955-2015")      ///
           legend(order(1 "War" 2 "Coup") position(6) cols(2))        ///
           graphregion(color(white)) plotregion(color(white))
    graph export "stata_dynamic_panel_war_coup_panel.png", replace width(2400)
restore

* 6.3 Figure: Number of countries with active war by year
preserve
    gen byte war_active = War > 0 & !missing(War)
    collapse (sum) war_active, by(Year)
    twoway bar war_active Year,                                       ///
           bcolor("106 155 204") barwidth(3.5)                        ///
           ytitle("Number of countries with War > 0")                 ///
           xtitle("Year")                                             ///
           title("Countries experiencing war by year, 1955-2015")     ///
           subtitle("Reproducing Figure 1 of Thies & Baum (2020)")    ///
           graphregion(color(white)) plotregion(color(white))
    graph export "stata_dynamic_panel_war_count_by_year.png", replace width(2400)
restore

* 6.4 Figure: Distribution of log GDP per capita -----
histogram lnGDPpercapita,                                             ///
    fcolor("106 155 204%70") lcolor("20 20 19") bin(40)               ///
    ytitle("Density")                                                 ///
    xtitle("log GDP per capita (lnGDPpercapita)")                     ///
    title("Distribution of log GDP per capita")                       ///
    graphregion(color(white)) plotregion(color(white))
graph export "stata_dynamic_panel_gdp_distribution.png", replace width(2400)

*----------------------------------------------------
* Section 7: Long-run effects program (ssta)
*----------------------------------------------------
* This program (original code by Prof. Baum) is preserved verbatim.
* After each xtabond2 regression we call `ssta` to compute the
* sum of the contemporaneous and lagged War coefficients (and Coup):
*
*   SSwar = b[War] + b[L.War] + b[L2.War]
*
* Economically, SSwar measures the *cumulative* impact of war over
* three quinquennia (15 years) following the shock.  We also store
* the standard error and t-statistic of the linear combination.
capture program drop ssta
program ssta, rclass
qui {
    nlcom (_b[War]+_b[L.War]+_b[L2.War])  // / (1-_b[L.lnGDPpercapita])
    mat b = r(b)
    mat v = r(V)
    estadd scalar SSwar   = b[1,1]
    estadd scalar SSwarSE = sqrt(v[1,1])
    estadd scalar SSwarT  = b[1,1]/sqrt(v[1,1])
    nlcom (_b[Coup]+_b[L.Coup])  // / (1-_b[L.lnGDPpercapita])
    mat b = r(b)
    mat v = r(V)
    estadd scalar SScoup   = b[1,1]
    estadd scalar SScoupSE = sqrt(v[1,1])
    estadd scalar SScoupT  = b[1,1]/sqrt(v[1,1])
}
end

local addss SSwar SSwarSE SSwarT SScoup SScoupSE SScoupT
mata: mata set matafavor speed, perm

*----------------------------------------------------
* Section 8: Declare panel structure (5-year intervals)
*----------------------------------------------------
xtset cty Year, delta(5)
xtdescribe

*----------------------------------------------------
* Section 9: Dynamic panel regressions (4 models)
*----------------------------------------------------
* Each model uses xtabond2 with:
*   gmm(...)     - which variables are endogenous; the lag(2 6) range
*                  picks lags 2 to 6 of the variable as INTERNAL
*                  instruments for the differenced equation.
*   iv(...)      - strictly exogenous instruments (used as-is).
*   noleveleq    - estimate the difference equation only (Arellano-
*                  Bond), do not add the level equation (which would
*                  be Blundell-Bond / system GMM).
*   robust       - heteroskedasticity-robust (cluster) standard errors.
*   twostep      - two-step efficient estimator.
*
* The dependent variable is lnGDPpercapita, and L.lnGDPpercapita
* enters the right-hand side, making this a dynamic panel.
*
* Two warnings will appear in the log after each xtabond2 call.
* Both are normal -- not errors:
*
*   "Two-step estimated covariance matrix of moments is singular."
*       The unadjusted two-step variance is degenerate, so xtabond2
*       falls back to the Windmeijer (2005) finite-sample correction
*       for cluster-robust standard errors.  This is exactly what
*       `robust twostep` is supposed to do; the reported SEs and
*       t-statistics use the corrected formula.
*
*   "Number of instruments may be large relative to number of
*    observations."
*       Roodman (2009) calls this "instrument proliferation":
*       too many moment conditions relative to N can over-fit the
*       endogenous regressors and weaken the Hansen J test.  Our
*       lag(2 6) range deliberately limits the GMM lag depth to
*       contain this risk; we also report Hansen J p-values below
*       so the reader can judge instrument validity.

eststo clear

* Model 1: War & Coup, no institutional controls -----
eststo: xtabond2 L(0/1).lnGDPpercapita L(0/2).War L(0/1).Coup i.Year, ///
        gmm(lnGDPpercapita War Coup, lag(2 6))                        ///
        iv(L(0/2).War L(0/1).Coup)                                    ///
        iv(i.Year)                                                    ///
        noleveleq robust twostep
ssta
estimates store m1

* Model 2: + lagged Economic Freedom -----------------
eststo: xtabond2 L(0/1).lnGDPpercapita EconFreeLag L(0/2).War         ///
        L(0/1).Coup i.Year,                                           ///
        gmm(lnGDPpercapita War Coup, lag(2 6))                        ///
        iv(L(0/2).War L(0/1).Coup)                                    ///
        iv(i.Year)                                                    ///
        iv(EconFreeLag)                                               ///
        noleveleq robust twostep
ssta
estimates store m2

* Model 3: + lagged Political Freedom ----------------
eststo: xtabond2 L(0/1).lnGDPpercapita PolitFreeLag L(0/2).War        ///
        L(0/1).Coup i.Year,                                           ///
        gmm(lnGDPpercapita War Coup, lag(2 6))                        ///
        iv(L(0/2).War L(0/1).Coup)                                    ///
        iv(i.Year)                                                    ///
        iv(PolitFreeLag)                                              ///
        noleveleq robust twostep
ssta
estimates store m3

* Model 4: full specification (both institutions) ----
eststo: xtabond2 L(0/1).lnGDPpercapita EconFreeLag PolitFreeLag       ///
        L(0/2).War L(0/1).Coup i.Year,                                ///
        gmm(lnGDPpercapita War Coup, lag(2 6))                        ///
        iv(L(0/2).War L(0/1).Coup)                                    ///
        iv(i.Year)                                                    ///
        iv(EconFreeLag PolitFreeLag)                                  ///
        noleveleq robust twostep
ssta
estimates store m4

*----------------------------------------------------
* Section 10: Publication-quality regression table
*----------------------------------------------------
esttab,                                                               ///
    lab star(* 0.1 ** 0.05 *** 0.01)                                  ///
    indicate(Quinquennia effects = *.Year)                            ///
    stat(N N_g `addss' hansen hansen_df hansenp,                      ///
         labels("N" "N. Countries" "Sum War coeff." "s.e. War" "t War" ///
                "Sum Coup coeff." "s.e. Coup" "t Coup"                ///
                "Hansen J" "J d.f." "J pvalue"))                      ///
    ti("Dynamic panel data estimates of log GDP per capita") nomti

* Rich-text file (preserved from original code) ------
esttab using catoj2.rtf, replace                                      ///
    lab star(* 0.1 ** 0.05 *** 0.01)                                  ///
    indicate(Quinquennia effects = *.Year)                            ///
    stat(N N_g `addss' hansen hansen_df hansenp,                      ///
         labels("N" "N. Countries" "Sum War coeff." "s.e. War" "t War" ///
                "Sum Coup coeff." "s.e. Coup" "t Coup"                ///
                "Hansen J" "J d.f." "J pvalue"))                      ///
    ti("Dynamic panel data estimates of log GDP per capita") nomti

* CSV version of the regression results --------------
esttab using "regression_results.csv", replace                        ///
    lab star(* 0.1 ** 0.05 *** 0.01)                                  ///
    indicate(Quinquennia effects = *.Year)                            ///
    stat(N N_g `addss' hansen hansen_df hansenp,                      ///
         labels("N" "N. Countries" "Sum War coeff." "s.e. War" "t War" ///
                "Sum Coup coeff." "s.e. Coup" "t Coup"                ///
                "Hansen J" "J d.f." "J pvalue"))                      ///
    ti("Dynamic panel data estimates of log GDP per capita") nomti

*----------------------------------------------------
* Section 11: Coefficient plot for War (across models)
*----------------------------------------------------
coefplot (m1, label("Model 1"))                                       ///
         (m2, label("Model 2"))                                       ///
         (m3, label("Model 3"))                                       ///
         (m4, label("Model 4")),                                      ///
    keep(War L.War L2.War)                                            ///
    xline(0, lcolor("217 119 87") lpattern(dash))                     ///
    xtitle("Coefficient on log GDP per capita")                       ///
    title("War coefficients across the four dynamic-panel models")    ///
    subtitle("Contemporaneous, lag-1, and lag-2 effects of War")      ///
    graphregion(color(white)) plotregion(color(white))                ///
    ciopts(lcolor("106 155 204") recast(rcap))                        ///
    mcolor("106 155 204")
graph export "stata_dynamic_panel_war_coef_plot.png", replace width(2400)

*----------------------------------------------------
* Section 12: Long-run sum-of-coefficients plot
*----------------------------------------------------
* Build a small dataset from the stored ssta scalars.
preserve
    clear
    set obs 4
    gen model     = _n
    gen str20 mname = ""
    gen sswar     = .
    gen sswar_se  = .
    gen sscoup    = .
    gen sscoup_se = .

    forvalues i = 1/4 {
        estimates restore m`i'
        replace mname     = "Model `i'" in `i'
        replace sswar     = e(SSwar)    in `i'
        replace sswar_se  = e(SSwarSE)  in `i'
        replace sscoup    = e(SScoup)   in `i'
        replace sscoup_se = e(SScoupSE) in `i'
    }

    gen sswar_lo  = sswar  - 1.96*sswar_se
    gen sswar_hi  = sswar  + 1.96*sswar_se
    gen sscoup_lo = sscoup - 1.96*sscoup_se
    gen sscoup_hi = sscoup + 1.96*sscoup_se

    export delimited using "longrun_effects.csv", replace

    twoway                                                            ///
        (bar sswar  model, fcolor("106 155 204%70") lcolor("106 155 204") barwidth(0.6)) ///
        (rcap sswar_lo sswar_hi model, lcolor("20 20 19")),           ///
        yline(0, lcolor("217 119 87") lpattern(dash))                 ///
        xlabel(1 "Model 1" 2 "Model 2" 3 "Model 3" 4 "Model 4")       ///
        ytitle("Sum of War coefficients (long-run effect)")           ///
        xtitle("")                                                    ///
        title("Long-run effect of War on log GDP per capita")         ///
        subtitle("Sum of contemporaneous + L1 + L2 War coefficients, 95% CI") ///
        legend(off)                                                   ///
        graphregion(color(white)) plotregion(color(white))
    graph export "stata_dynamic_panel_longrun_effects.png", replace width(2400)
restore

*----------------------------------------------------
* Section 13: Diagnostic test summary
*----------------------------------------------------
preserve
    clear
    set obs 4
    gen model     = _n
    gen str20 mname = ""
    gen ar2_p     = .
    gen hansen_p  = .
    gen hansen    = .
    gen hansen_df = .

    forvalues i = 1/4 {
        estimates restore m`i'
        replace mname     = "Model `i'" in `i'
        replace ar2_p     = e(ar2p)        in `i'
        replace hansen_p  = e(hansenp)     in `i'
        replace hansen    = e(hansen)      in `i'
        replace hansen_df = e(hansen_df)   in `i'
    }

    export delimited using "diagnostics.csv", replace

    * Dodge the two bar series so AR(2) and Hansen J appear side-by-side
    * rather than stacked at the same x-coordinate.
    gen ar2_x    = model - 0.2
    gen hansen_x = model + 0.2

    twoway                                                            ///
        (bar ar2_p    ar2_x,    fcolor("106 155 204%70") lcolor("106 155 204") barwidth(0.35)) ///
        (bar hansen_p hansen_x, fcolor("217 119 87%70")  lcolor("217 119 87")  barwidth(0.35)), ///
        yline(0.05, lcolor("20 20 19") lpattern(dash))                ///
        xlabel(1 "Model 1" 2 "Model 2" 3 "Model 3" 4 "Model 4")       ///
        ytitle("p-value")                                             ///
        xtitle("")                                                    ///
        title("Diagnostic tests: p-values by model")                  ///
        subtitle("AR(2) test (blue) and Hansen J test (orange); want p > 0.05") ///
        legend(order(1 "AR(2) p" 2 "Hansen J p") position(6) cols(2)) ///
        graphregion(color(white)) plotregion(color(white))
    graph export "stata_dynamic_panel_diagnostics.png", replace width(2400)
restore

*----------------------------------------------------
* End
*----------------------------------------------------
display _newline "=== Script completed successfully ==="
log close
