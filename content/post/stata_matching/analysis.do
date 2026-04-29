****************************************************
* Treatment Effects in Stata: Six Estimators
* Maternal Smoking and Birth Weight Case Study
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_matching/
*
* Dataset: cattaneo2.dta (Cattaneo 2010)
*   ~4,642 mother-infant pairs
*   Outcome:   bweight (infant birth weight, grams)
*   Treatment: mbsmoke (1 = mother smoked during pregnancy)
*   Covariates: mage, mmarried, fage, medu, prenatal1, fbaby
*
* Six estimators compared:
*   1. Regression Adjustment (RA)
*   2. Inverse-Probability Weighting (IPW)
*   3. Inverse-Probability-Weighted Regression Adjustment (IPWRA)
*   4. Augmented Inverse-Probability Weighting (AIPW)
*   5. Nearest-Neighbor Matching (NNM)
*   6. Propensity-Score Matching (PSM)
*   + Naive (unadjusted) baseline as a foil
*
* Usage:
*   1. Open Stata
*   2. cd into this folder
*   3. Run: do analysis.do
*   4. All graphs are saved as PNG files
****************************************************

clear all
set more off
set seed 42

*---------------------------------------------------
* 0. Install dependencies
*---------------------------------------------------

capture ssc install coefplot, replace

*---------------------------------------------------
* 0.1 Start log
*---------------------------------------------------

capture log close
log using "analysis.log", replace text

di _newline(2)
di "================================================================"
di "  Treatment Effects in Stata: Six Estimators"
di "  Maternal Smoking and Birth Weight Case Study"
di "================================================================"

*---------------------------------------------------
* 1. Data loading and exploration
*---------------------------------------------------

di _newline(2) "=== 1. DATA LOADING AND EXPLORATION ==="

use "https://github.com/quarcs-lab/data-open/raw/master/ametrics/cattaneo2.dta", clear

* Describe the variables we will use
describe bweight mbsmoke mage mmarried fage medu prenatal1 fbaby

* A peek at the data
list bweight mbsmoke mmarried mage fage medu prenatal1 fbaby in 40/49, noobs

* Summary statistics
summarize bweight mbsmoke mage mmarried fage medu prenatal1 fbaby

* Treatment prevalence
tab mbsmoke

* Sample size by treatment
tab mbsmoke, summarize(bweight)

*---------------------------------------------------
* 2. Naive comparison and descriptive plot
*---------------------------------------------------

di _newline(2) "=== 2. NAIVE COMPARISON (UNADJUSTED) ==="

* Naive difference in means: this is the BIASED comparison
regress bweight mbsmoke, vce(robust)
estimates store te_naive

* Save the naive estimate so we can compare later
scalar naive_b  = _b[mbsmoke]
scalar naive_se = _se[mbsmoke]
di "Naive (unadjusted) gap: " %7.2f naive_b " grams (SE = " %5.2f naive_se ")"

* Figure 1: kernel density of bweight by smoking status
twoway ///
    (kdensity bweight if mbsmoke==0, lcolor("106 155 204") lwidth(medthick)) ///
    (kdensity bweight if mbsmoke==1, lcolor("217 119 87")  lwidth(medthick)) ///
    , ///
    title("Birth Weight by Maternal Smoking Status", size(medium)) ///
    subtitle("Raw, unadjusted distributions", size(small)) ///
    xtitle("Infant birth weight (grams)") ytitle("Density") ///
    legend(order(1 "Non-smokers" 2 "Smokers") position(6) rows(1)) ///
    graphregion(color(white)) plotregion(color(white)) ///
    note("Smokers' distribution is shifted left of non-smokers' --- but is this causal?", size(vsmall))
graph export "stata_matching_density_bweight.png", replace width(2400)

*---------------------------------------------------
* 3. Method 1: Regression Adjustment (RA)
*---------------------------------------------------

di _newline(2) "=== 3. METHOD 1: REGRESSION ADJUSTMENT (RA) ==="

* teffects ra: potential-outcome means, ATE, ATT
teffects ra (bweight mmarried mage prenatal1 fbaby) (mbsmoke), pomeans nolog
teffects ra (bweight mmarried mage prenatal1 fbaby) (mbsmoke), ate    nolog
estimates store te_ra
teffects ra (bweight mmarried mage prenatal1 fbaby) (mbsmoke), atet   nolog
estimates store te_ra_att

* Manual recreation: regress separately for D=0 and D=1, then average
preserve
    di _newline "--- Manual recreation of RA ---"
    regress bweight mmarried mage prenatal1 fbaby if mbsmoke==0
    predict y0_hat, xb
    regress bweight mmarried mage prenatal1 fbaby if mbsmoke==1
    predict y1_hat, xb
    generate te_i = y1_hat - y0_hat
    summarize te_i
    di "Manual RA estimate of ATE: " %7.2f r(mean) " grams"
restore

*---------------------------------------------------
* 4. Method 2: Inverse-Probability Weighting (IPW)
*---------------------------------------------------

di _newline(2) "=== 4. METHOD 2: INVERSE-PROBABILITY WEIGHTING (IPW) ==="

* teffects ipw: probit treatment model, POMs, ATE, ATT
teffects ipw (bweight) (mbsmoke mmarried mage fbaby medu, probit), pomeans nolog
teffects ipw (bweight) (mbsmoke mmarried mage fbaby medu, probit), ate    nolog
estimates store te_ipw
teffects ipw (bweight) (mbsmoke mmarried mage fbaby medu, probit), atet   nolog
estimates store te_ipw_att

* Manual recreation: estimate propensity scores, build IPW weights, weighted regression
di _newline "--- Manual recreation of IPW ---"
logistic mbsmoke mmarried mage fbaby medu, nolog
predict ps, p
generate ipw_w = 1/ps        if mbsmoke==1
replace  ipw_w = 1/(1-ps)    if mbsmoke==0
list bweight mbsmoke ps ipw_w in 40/49

regress bweight mbsmoke [aweight=ipw_w]
di "Manual IPW estimate (coefficient on mbsmoke): " %7.2f _b[mbsmoke] " grams"

* Figure 2: propensity-score distribution by treatment status
twoway ///
    (histogram ps if mbsmoke==0, fcolor("106 155 204%50") lcolor("106 155 204") width(0.025)) ///
    (histogram ps if mbsmoke==1, fcolor("217 119 87%50")  lcolor("217 119 87")  width(0.025)) ///
    , ///
    title("Estimated Propensity Scores", size(medium)) ///
    subtitle("Probability of smoking, by actual smoking status", size(small)) ///
    xtitle("Estimated propensity score, e(X)") ytitle("Density") ///
    legend(order(1 "Non-smokers (D=0)" 2 "Smokers (D=1)") position(6) rows(1)) ///
    graphregion(color(white)) plotregion(color(white)) ///
    note("Where the two distributions overlap, we can credibly compare smokers and non-smokers.", size(vsmall))
graph export "stata_matching_propensity_distribution.png", replace width(2400)

*---------------------------------------------------
* 5. Method 3: Inverse-Probability-Weighted Regression Adjustment (IPWRA)
*---------------------------------------------------

di _newline(2) "=== 5. METHOD 3: IPWRA ==="

* IPWRA: combines outcome model + treatment model (doubly robust)
teffects ipwra (bweight mmarried mage prenatal1 fbaby) ///
               (mbsmoke mmarried mage fbaby medu, probit), pomeans aequations nolog
teffects ipwra (bweight mmarried mage prenatal1 fbaby) ///
               (mbsmoke mmarried mage fbaby medu, probit), ate    nolog
estimates store te_ipwra
teffects ipwra (bweight mmarried mage prenatal1 fbaby) ///
               (mbsmoke mmarried mage fbaby medu, probit), atet   nolog
estimates store te_ipwra_att

*---------------------------------------------------
* 6. Method 4: Augmented Inverse-Probability Weighting (AIPW)
*---------------------------------------------------

di _newline(2) "=== 6. METHOD 4: AIPW ==="

* AIPW: efficient and doubly robust; in Stata, ATE only.
teffects aipw (bweight mmarried mage prenatal1 fbaby) ///
              (mbsmoke mmarried mage fbaby medu, probit), pomeans aequations nolog
teffects aipw (bweight mmarried mage prenatal1 fbaby) ///
              (mbsmoke mmarried mage fbaby medu, probit), ate    nolog
estimates store te_aipw

*---------------------------------------------------
* 7. Method 5: Nearest-Neighbor Matching (NNM)
*---------------------------------------------------

di _newline(2) "=== 7. METHOD 5: NEAREST-NEIGHBOR MATCHING (NNM) ==="

* Basic NNM (one nearest neighbor on Mahalanobis distance)
teffects nnmatch (bweight mmarried mage fage medu prenatal1) (mbsmoke), nolog

* NNM with exact matching on discrete covariates and bias adjustment on continuous covariates
teffects nnmatch (bweight mmarried mage fage medu prenatal1) (mbsmoke), ///
         ematch(mmarried prenatal1)  biasadj(mage fage medu) nolog
estimates store te_nnmatch
teffects nnmatch (bweight mmarried mage fage medu prenatal1) (mbsmoke), ///
         ematch(mmarried prenatal1)  biasadj(mage fage medu) atet nolog
estimates store te_nnmatch_att

*---------------------------------------------------
* 8. Method 6: Propensity-Score Matching (PSM)
*---------------------------------------------------

di _newline(2) "=== 8. METHOD 6: PROPENSITY-SCORE MATCHING (PSM) ==="

* Visualize the matching idea on a small subsample (Figure 3)
* Using the propensity score we already computed (ps)
preserve
    keep if _n < 100
    #delimit ;
    twoway
        (scatter mbsmoke ps if mbsmoke==0,
            msize(medium) msymbol(circle_hollow) mcolor("106 155 204"))
        (scatter mbsmoke ps if mbsmoke==1,
            msize(medium) msymbol(circle_hollow) mcolor("217 119 87"))
        (pcarrowi 0.92 0.09 0.08 0.09,
            recast(pcbarrow) lcolor("20 20 20") lwidth(medium)
            mcolor("20 20 20") msize(medium) barbsize(medium))
        ,
        title("How Propensity-Score Matching Works", size(medium))
        subtitle("Match a smoker with the most similar non-smoker(s)", size(small))
        text(0.50 0.20
             "Match each smoker with the nearest non-smoker(s) {&rarr}"
             "in propensity-score space",
             color("20 20 20") just(left) placement(e) size(small))
        ytitle("")
        yscale(range(-0.1 1.1))
        ylabel(0 "Non-smoker" 1 "Smoker", angle(horizontal))
        xtitle("Estimated propensity score, e(X)") xlabel(0(0.1)1)
        legend(off)
        graphregion(color(white)) plotregion(color(white))
    ;
    #delimit cr
    graph export "stata_matching_psm_logic.png", replace width(2400)
restore

* PSM estimation
teffects psmatch (bweight) (mbsmoke mmarried mage fage medu prenatal1), nolog
estimates store te_psmatch
teffects psmatch (bweight) (mbsmoke mmarried mage fage medu prenatal1), atet nolog
estimates store te_psmatch_att

* Overlap diagnostic (Figure 4)
teffects psmatch (bweight) (mbsmoke mmarried mage fage medu prenatal1), nolog
teffects overlap, ///
    ptlevel(0) ///
    title("Overlap of Propensity Scores", size(medium)) ///
    subtitle("Required for valid causal comparison", size(small)) ///
    legend(order(1 "Non-smokers (D=0)" 2 "Smokers (D=1)") position(6) rows(1)) ///
    graphregion(color(white)) plotregion(color(white))
graph export "stata_matching_overlap.png", replace width(2400)

*---------------------------------------------------
* 9. Comparison of all six methods
*---------------------------------------------------

di _newline(2) "=== 9. COMPARISON OF ALL SIX METHODS ==="

* ATE comparison table for the six teffects estimators
di _newline "--- ATE estimates from teffects estimators ---"
estimates table te_ra te_ipw te_ipwra te_aipw te_nnmatch te_psmatch ///
                , b(%9.2f) se(%7.2f) stats(N) varwidth(16) modelwidth(11)

* Naive baseline shown separately (different coefficient name in regress)
di _newline "--- Naive (unadjusted) baseline ---"
estimates table te_naive, b(%9.2f) se(%7.2f) stats(N) varwidth(16) modelwidth(11)

* ATT comparison table (note: AIPW does not provide ATT in Stata)
di _newline "--- ATT estimates (five methods) ---"
estimates table te_ra_att te_ipw_att te_ipwra_att te_nnmatch_att te_psmatch_att ///
                , b(%9.2f) se(%7.2f) stats(N) varwidth(16) modelwidth(11)

* Figure 5: forest plot of ATE estimates
* coefplot's rename + keep doesn't span regress (mbsmoke) and teffects
* (r1vs0.mbsmoke) cleanly, so we collect ATE and 95% CI manually via postfile.
* Collect b, ll, ul, and a row index manually from each stored estimate
tempfile fp_data
capture postclose fp
postfile fp str20 method double(b ll ul) byte row using `fp_data', replace

estimates restore te_naive
post fp ("0. Naive")  (_b[mbsmoke])             (_b[mbsmoke] - 1.96*_se[mbsmoke])             (_b[mbsmoke] + 1.96*_se[mbsmoke])             (7)

estimates restore te_ra
post fp ("1. RA")     (_b[r1vs0.mbsmoke])       (_b[r1vs0.mbsmoke] - 1.96*_se[r1vs0.mbsmoke]) (_b[r1vs0.mbsmoke] + 1.96*_se[r1vs0.mbsmoke]) (6)

estimates restore te_ipw
post fp ("2. IPW")    (_b[r1vs0.mbsmoke])       (_b[r1vs0.mbsmoke] - 1.96*_se[r1vs0.mbsmoke]) (_b[r1vs0.mbsmoke] + 1.96*_se[r1vs0.mbsmoke]) (5)

estimates restore te_ipwra
post fp ("3. IPWRA")  (_b[r1vs0.mbsmoke])       (_b[r1vs0.mbsmoke] - 1.96*_se[r1vs0.mbsmoke]) (_b[r1vs0.mbsmoke] + 1.96*_se[r1vs0.mbsmoke]) (4)

estimates restore te_aipw
post fp ("4. AIPW")   (_b[r1vs0.mbsmoke])       (_b[r1vs0.mbsmoke] - 1.96*_se[r1vs0.mbsmoke]) (_b[r1vs0.mbsmoke] + 1.96*_se[r1vs0.mbsmoke]) (3)

estimates restore te_nnmatch
post fp ("5. NNM")    (_b[r1vs0.mbsmoke])       (_b[r1vs0.mbsmoke] - 1.96*_se[r1vs0.mbsmoke]) (_b[r1vs0.mbsmoke] + 1.96*_se[r1vs0.mbsmoke]) (2)

estimates restore te_psmatch
post fp ("6. PSM")    (_b[r1vs0.mbsmoke])       (_b[r1vs0.mbsmoke] - 1.96*_se[r1vs0.mbsmoke]) (_b[r1vs0.mbsmoke] + 1.96*_se[r1vs0.mbsmoke]) (1)

postclose fp

preserve
    use `fp_data', clear
    list method b ll ul, sep(0) noobs
    export delimited using "ate_estimates.csv", replace

    * Build the forest plot
    twoway ///
        (rcap ll ul row, horizontal lcolor("106 155 204") lwidth(medthick)) ///
        (scatter row b, msymbol(D) mcolor("217 119 87") msize(large)) ///
        , ///
        xline(0, lcolor("20 20 20") lpattern(dash)) ///
        ylabel(7 "0. Naive" 6 "1. RA" 5 "2. IPW" 4 "3. IPWRA" 3 "4. AIPW" ///
               2 "5. NNM" 1 "6. PSM", angle(horizontal) labsize(small) nogrid) ///
        ytitle("") ///
        xtitle("ATE on birth weight (grams)") ///
        title("Estimated Effect of Maternal Smoking on Birth Weight", size(medium)) ///
        subtitle("Six estimators + naive baseline, with 95% confidence intervals", size(small)) ///
        legend(off) ///
        graphregion(color(white)) plotregion(color(white)) ///
        note("Negative values: smoking lowers birth weight. The naive estimate is biased; the six estimators move the answer closer to the truth.", size(vsmall))
    graph export "stata_matching_forest_plot.png", replace width(2400)
restore

*---------------------------------------------------
* 10. End of analysis
*---------------------------------------------------

di _newline(2)
di "============================================================"
di "  Analysis complete."
di ""
di "  Six teffects estimators compared on cattaneo2.dta:"
di "    Naive    : " %7.2f naive_b " grams"
di "    RA, IPW, IPWRA, AIPW, NNM, PSM: see comparison table"
di ""
di "  Outputs:"
di "    - analysis.log"
di "    - stata_matching_density_bweight.png"
di "    - stata_matching_propensity_distribution.png"
di "    - stata_matching_psm_logic.png"
di "    - stata_matching_overlap.png"
di "    - stata_matching_forest_plot.png"
di ""
di "  Script completed successfully"
di "============================================================"

log close
