****************************************************
* Synthetic Control Method (SCM) Tutorial
* Effect of Proposition 99 on Cigarette Sales
* in California
*
* Based on: Abadie, A., Diamond, A., and Hainmueller, J.
*   (2010). Synthetic control methods for comparative
*   case studies: Estimating the effect of California's   [style-allow: cited title]
*   tobacco control program.
*   Journal of the American Statistical Association,
*   105(490), 493–505.
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_sc/
*
* Dataset:
*   smoking_sc.dta (39 states, 31 years, 1970–2000)
*
* Setting:
*   In 1988, California voters approved Proposition 99,
*   a comprehensive tobacco control initiative that
*   raised taxes on cigarettes and funded antismoking
*   programs. The law took effect in January 1989.
*   This do-file estimates its effect on cigarette sales.
*
* Estimand: ATT (average treatment effect on the treated)
*   The effect of Proposition 99 on cigarette sales in
*   California, the only treated state
*
* Variables:
*   state       - State identifier (numeric)
*   year        - Year (1970–2000)
*   cigsale     - Cigarette sales (packs per capita)
*   lnincome    - Log of state GDP per capita
*   age15to24   - Share of the population aged 15–24 (a fraction)
*   retprice    - Average retail price of cigarettes
*   beer        - Beer consumption per capita
*
* Usage:
*   1. Open Stata (version 17 or later is recommended).
*   2. Run: do analysis.do
*   3. The do-file saves all graphs as stata_sc_*.png.
*   4. The full output is in analysis.log.
*
* Required packages:
*   synth and synth2, both from SSC
*
* Package versions:
*   The published log was produced with synth 0.0.7 and
*   synth2 2.1.0. The two ssc lines in Section 0 must not
*   upgrade these packages, because SSC now distributes a
*   newer synth. Comment out those lines when both versions
*   are already installed.
*
* Note: On Macs with Apple Silicon, the synth optimization
*   plugin requires Rosetta 2. Section 0 prints the machine
*   type and the steps to enable Rosetta. The rest of the
*   do-file needs no change.
****************************************************

clear all
set more off
set seed 42


*---------------------------------------------------
* Section 0: Install the packages and start the log
*---------------------------------------------------

* Comment out the next two lines to keep synth 0.0.7 and synth2 2.1.0
capture ssc install synth, all replace
capture ssc install synth2, all replace

* Start the log
capture log close
log using "analysis.log", replace text

di _newline(2)
di "============================================"
di "  Synthetic Control Method (SCM) Tutorial"
di "  Abadie, Diamond, and Hainmueller (2010)"
di "  $S_DATE $S_TIME"
di "============================================"

* Apple Silicon compatibility check
di _newline
di "Machine type:"
display c(machine_type)
di _newline
di "Note: On Macs with Apple Silicon, the synth plugin needs Rosetta 2."
di "Right-click Stata, choose Get Info, and check Open using Rosetta."
di "The machine type above shows the architecture that Stata uses."


*===================================================
*  PART 1: DATA AND BASELINE SCM
*  Dataset: smoking_sc.dta (39 states x 31 years)
*===================================================


*---------------------------------------------------
* Section 1: Load and explore the dataset
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 1: DATA LOADING AND EXPLORATION"
di "========================================"

use "https://github.com/quarcs-lab/data-open/raw/master/isds/smoking_sc.dta", clear

* Inspect variable labels and storage types
describe

* Check means, standard deviations, minimums, and maximums
summarize

* Show the first six observations
list in 1/6

* Declare the panel: state is the unit, and year is the time variable
xtset state year

* Summarize the between and within variation of each variable
xtsum

* Identify the state code of California
label list

di _newline
di "Panel: 39 states over 31 years (1970–2000), 1,209 observations"
di "Treatment unit: California (state == 3)"
di "Treatment period: 1989, the first year with Proposition 99 in effect"
di "Donor pool: 38 control states"
di _newline
di "Variables:"
di "  cigsale    - Cigarette sales per capita (packs)"
di "  lnincome   - Log of state GDP per capita"
di "  age15to24  - Share of the population aged 15–24 (a fraction)"
di "  retprice   - Average retail price of cigarettes"
di "  beer       - Beer consumption per capita"


*---------------------------------------------------
* Section 2: Visualize raw trends
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 2: RAW TRENDS"
di "  California vs. Donor Pool Average"
di "========================================"

preserve

* Create an indicator for California
gen california = (state == 3)

* Collapse to mean sales by year and group
collapse (mean) cigsale, by(year california)

twoway (connected cigsale year if california==1, ///
        msymbol(O) mcolor("106 155 204") lcolor("106 155 204") ///
        lwidth(medthick)) ///
       (connected cigsale year if california==0, ///
        msymbol(T) mcolor("128 128 128") lcolor("128 128 128") ///
        lwidth(medium) lpattern(dash)), ///
    xline(1989, lcolor("217 119 87") lpattern(dash) lwidth(medium)) ///
    ytitle("Cigarette Sales (packs per capita)") xtitle("Year") ///
    legend(order(1 "California" 2 "Donor Pool Average") ///
        position(6)) ///
    title("Cigarette Sales: California vs. Donor Pool") ///
    note("Source: Abadie, Diamond, and Hainmueller (2010)." ///
        "The vertical line marks Proposition 99 (1989).") ///
    graphregion(color(white)) plotregion(color(white)) ///
    name(raw_trends, replace)

graph export "stata_sc_raw_trends.png", replace width(2400)

restore

di "Figure saved: stata_sc_raw_trends.png"
di _newline
di "Sales in California started near the donor average in 1970."
di "By 1988, they were about 24 packs per capita below that average."
di "After Proposition 99, the gap widened further."
di "A simple average is therefore a poor counterfactual for California."
di "The SCM instead weights the control states to match the path of"
di "sales in California before 1989."


*---------------------------------------------------
* Section 3: Baseline synthetic control estimate
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 3: BASELINE SCM ESTIMATE"
di "========================================"

di _newline
di "Command: synth2 with nested optimization and allopt"
di _newline
di "Predictors:"
di "  lnincome    - Log GDP per capita (a demand factor)"
di "  age15to24   - Share of the population aged 15–24 (demographic)"
di "  retprice    - Retail price of cigarettes (a price factor)"
di "  beer        - Beer consumption per capita (a complementary good)"
di "  cigsale(1988), cigsale(1980), cigsale(1975)"
di "              - Cigarette sales in three pre-treatment years"
di _newline
di "Options:"
di "  trunit(3)         - Treated unit: California (state==3)"
di "  trperiod(1989)    - Treatment onset: January 1989"
di "  xperiod(1980(1)1988) - Covariate averaging window: 1980–1988"
di "  nested            - Nested optimization over V and W"
di "  allopt            - Three starting points for the nested search"
di _newline
di "Running baseline SCM... (this may take a few minutes)"

synth2 cigsale lnincome age15to24 retprice beer cigsale(1988) cigsale(1980) cigsale(1975), trunit(3) trperiod(1989) xperiod(1980(1)1988) nested allopt savegraph(stata_sc, replace)

* Display stored results
ereturn list

* Save matrices before graph operations clear e()
matrix X_balance = e(bal)
matrix W_weights = e(U_wt)

* Convert .gph files to .png (batch mode compatible)
foreach g in pred eff bias weight_unit weight_vars {
    capture confirm file "stata_sc_`g'.gph"
    if _rc == 0 {
        graph use "stata_sc_`g'.gph"
        graph export "stata_sc_`g'.png", replace width(2400)
        erase "stata_sc_`g'.gph"
        di "Figure saved: stata_sc_`g'.png"
    }
}


*---------------------------------------------------
* Section 4: Interpret predictor balance and weights
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 4: PREDICTOR BALANCE AND WEIGHTS"
di "========================================"

* Predictor balance: California vs. Synthetic California
di _newline
di "Predictor Balance (California vs. Synthetic California):"
di "-------------------------------------------------------"
matrix list X_balance

di _newline
di "The balance table compares the predictors of California with those"
di "of synthetic California, and close values indicate a good match."
di "The weights W minimize the V-weighted gap in these predictors."
di "The nested search chooses V to minimize the pre-1989 error in sales."
di "V is poorly identified, so its values are not measures of importance."

* Unit weights: which states form synthetic California
di _newline
di "Unit Weights (Donor Pool Contributions):"
di "-----------------------------------------"
matrix list W_weights

di _newline
di "The unit weights show which control states form synthetic California."
di "Five states receive positive weights, and the other 33 receive zero."
di "The weights are nonnegative and sum to one."
di "No single donor needs to resemble California on its own."
di "Only the weighted combination must match California before 1989."


*---------------------------------------------------
* Section 5: Interpret treatment effects
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 5: TREATMENT EFFECTS"
di "========================================"

di _newline
di "Treatment Effect Interpretation:"
di "================================"
di _newline
di "The 'pred' graph plots actual and synthetic sales in California."
di "Before 1989, the series are close, with the largest gap in 1970."
di "This close fit supports the synthetic path as a counterfactual."
di "A good fit is necessary for credibility, but it is not sufficient."
di _newline
di "After 1989, actual sales fall well below the synthetic path."
di "The synthetic path estimates sales in California without the law."
di "The difference is the estimated effect of Proposition 99 on sales."
di _newline
di "The 'eff' graph plots this gap, actual minus synthetic, by year."
di "The gap grows more negative through the 1990s, but not in every year."
di "Its average over 1989–2000 is the ATT reported in the table above."
di _newline
di "The estimand is the ATT, the average effect on the treated unit."
di "The treated unit is California, so the estimate applies to it alone."
di "It is not an average effect across all states."


*===================================================
*  PART 2: INFERENCE AND ROBUSTNESS
*  Placebo tests and leave-one-out analysis
*===================================================


*---------------------------------------------------
* Section 6: In-space placebo test
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 6: IN-SPACE PLACEBO TEST"
di "========================================"

di _newline
di "The in-space placebo test applies the SCM to each control state."
di "Each run treats one control state as if it had adopted the law."
di "The placebo gaps show how large a gap can be without any treatment."
di "A gap for California that is unusual among them is evidence of"
di "a real effect rather than a statistical artifact."
di _newline
di "Options:"
di "  placebo(unit) - Run the SCM for each control state"
di "  cut(2)        - Keep placebos with a pre-MSPE at most twice"
di "                  that of California (drops poorly fitted ones)"
di "  sigf(6)       - Six significant figures (default 7) for convergence"
di "  The placebo run omits allopt to save computation time."
di _newline
di "Running in-space placebo test... (this takes several minutes)"

synth2 cigsale lnincome age15to24 retprice beer cigsale(1988) cigsale(1980) cigsale(1975), trunit(3) trperiod(1989) xperiod(1980(1)1988) nested placebo(unit cut(2)) sigf(6) savegraph(stata_sc, replace)

* Convert placebo .gph files to .png
foreach g in eff_pboUnit ratio_pboUnit pvalTwo_pboUnit pvalRight_pboUnit pvalLeft_pboUnit {
    capture confirm file "stata_sc_`g'.gph"
    if _rc == 0 {
        graph use "stata_sc_`g'.gph"
        graph export "stata_sc_`g'.png", replace width(2400)
        erase "stata_sc_`g'.gph"
        di "Figure saved: stata_sc_`g'.png"
    }
}

di _newline
di "In-Space Placebo Results:"
di "========================="
di _newline
di "eff_pboUnit: Gaps of California and of the 19 retained placebos."
di "  The line of California is purple, and the placebo lines are gray."
di "  A real effect should make the purple line an outlier after 1989."
di _newline
di "ratio_pboUnit: Ranks all 39 units by the post/pre MSPE ratio."
di "  A high ratio means a large post-1989 gap relative to the fit"
di "  before 1989. A real effect should place California at or near"
di "  the top."
di _newline
di "pvalTwo/Right/Left: Placebo-based p-values by year."
di "  Two-sided: tests for an effect of either sign"
di "  Right-sided: tests for a positive effect on sales"
di "  Left-sided: tests for a negative effect, the relevant case here"
di "  With California and 19 retained placebos, p cannot fall below 0.05."
di "  The left-sided p-value of California is 0.05 in 8 of 12 years."


*---------------------------------------------------
* Section 7: In-time placebo test
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 7: IN-TIME PLACEBO TEST"
di "========================================"

di _newline
di "The in-time placebo test moves the treatment date back to 1985."
di "This fake date falls four years before the real policy."
di "A sound design should show small gaps between 1985 and 1988."
di "Large gaps in those years would signal a problem with the design."
di _newline
di "Key changes from the baseline:"
di "  - cigsale(1988) is dropped from the predictors, because 1988"
di "    falls after the fake treatment date."
di "  - xperiod(1980(1)1984) replaces 1980(1)1988, so the covariate"
di "    averages end before the fake treatment date."
di "  - placebo(period(1985)) sets the fake treatment year."
di _newline
di "Running in-time placebo test..."

synth2 cigsale lnincome age15to24 retprice beer cigsale(1980) cigsale(1975), trunit(3) trperiod(1989) xperiod(1980(1)1984) nested placebo(period(1985)) savegraph(stata_sc, replace)

* Convert in-time placebo .gph files to .png
foreach g in pred_pboTime1985 eff_pboTime1985 {
    capture confirm file "stata_sc_`g'.gph"
    if _rc == 0 {
        graph use "stata_sc_`g'.gph"
        graph export "stata_sc_`g'.png", replace width(2400)
        erase "stata_sc_`g'.gph"
        di "Figure saved: stata_sc_`g'.png"
    }
}

di _newline
di "In-Time Placebo Results:"
di "========================"
di _newline
di "pred_pboTime1985: Actual and synthetic sales with the fake 1985 date."
di "  The fit statistics printed first belong to the reduced model at"
di "  the real date, 1989. The command does not print the fit of the"
di "  1985 model, and the in-time table lists its yearly gaps."
di _newline
di "eff_pboTime1985: Gaps of the 1985 model over time."
di "  Gaps in 1985–1988 measure effects at the fake date, before the law."
di "  They should be small relative to the gaps after 1989."
di "  Gaps after 1989 should stay large, as in the baseline results."
di _newline
di "Large gaps at the fake date would signal a problem with the design."
di "They could reflect overfitting or shocks that hit California early."
di "Small gaps, in contrast, support the timing of the estimated effect."


*---------------------------------------------------
* Section 8: Leave-one-out robustness check
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 8: LEAVE-ONE-OUT ROBUSTNESS"
di "========================================"

di _newline
di "The leave-one-out (LOO) test re-estimates the SCM five times."
di "Each run drops one of the five donors with a positive weight."
di "Results that change sharply without one state would be fragile."
di "Stable results suggest that no single donor drives the estimate."
di _newline
di "Options:"
di "  loo                          - Drop each weighted donor in turn"
di "  frame(california)            - Store the results in a Stata frame"
di "  savegraph(california, replace) - Save each graph as a .gph file"
di _newline
di "Running leave-one-out test... (this takes several minutes)"

synth2 cigsale lnincome age15to24 retprice beer cigsale(1988) cigsale(1980) cigsale(1975), trunit(3) trperiod(1989) xperiod(1980(1)1988) nested loo frame(california) savegraph(california, replace)

* Combine the seven graphs of the LOO run into one figure
graph combine `e(graph)', cols(2) altshrink ///
    title("Leave-One-Out Robustness: Synthetic California") ///
    note("The last two panels add the five leave-one-out fits in gray.") ///
    graphregion(color(white)) ///
    name(loo_combined, replace)

graph export "stata_sc_loo_combined.png", replace width(2400)
di "Figure saved: stata_sc_loo_combined.png"

di _newline
di "Leave-One-Out Results:"
di "======================"
di _newline
di "The combined graph has seven panels from this run."
di "The first five show the fit with all 38 donors."
di "The last two add the five leave-one-out fits as gray lines."
di _newline
di "Similar gaps across the five refits indicate robust results."
di "A large change after dropping one state would reveal that the"
di "synthetic control relies heavily on that state."
di "The min and max tables above summarize the range by year."


*---------------------------------------------------
* Section 9: Inspect leave-one-out frame
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 9: LOO FRAME INSPECTION"
di "========================================"

di _newline
di "The LOO results are stored in a Stata frame named 'california'."
di "A frame holds an additional dataset in memory."
di "Frames require Stata 16 or later."

frame change california
describe
frame change default

di _newline
di "The frame stores predictions and effects for the full-pool fit and"
di "for each refit, and variable labels name the excluded donor."
di "Four more variables hold the minimum and maximum across refits."
di "Researchers can use these variables for further analysis."


*---------------------------------------------------
* Section 10: Closing summary
*---------------------------------------------------

di _newline(2)
di "============================================"
di "  ANALYSIS COMPLETE"
di "============================================"
di _newline
di "  Estimand: ATT (average treatment effect on the treated)"
di "  Treated unit: California (state==3)"
di "  Treatment: Proposition 99 (effective January 1989)"
di _newline
di "  Key Findings:"
di "  1. Five control states form a synthetic California that"
di "     closely matches its sales before 1989."
di "  2. After 1989, actual sales fall well below the synthetic"
di "     path, which indicates a substantial reduction in"
di "     cigarette sales per capita."
di "  3. California has the largest post/pre MSPE ratio of all"
di "     39 units, so its gap is unusual among the placebos"
di "     (permutation p-value 1/39 = 0.026)."
di "  4. The in-time placebo test finds smaller gaps at the"
di "     fake 1985 date than after 1989, but not zero gaps."
di "  5. Dropping any one of the five weighted donors keeps"
di "     every post-1989 gap negative."
di _newline
di "  Figures:"
di "    stata_sc_raw_trends.png"
di "    stata_sc_pred.png"
di "    stata_sc_eff.png"
di "    stata_sc_bias.png"
di "    stata_sc_weight_unit.png"
di "    stata_sc_weight_vars.png"
di "    stata_sc_eff_pboUnit.png"
di "    stata_sc_ratio_pboUnit.png"
di "    stata_sc_pvalTwo_pboUnit.png"
di "    stata_sc_pvalRight_pboUnit.png"
di "    stata_sc_pvalLeft_pboUnit.png"
di "    stata_sc_pred_pboTime1985.png"
di "    stata_sc_eff_pboTime1985.png"
di "    stata_sc_loo_combined.png"
di _newline
di "  Reference:"
di "    Abadie, A., Diamond, A., and Hainmueller, J. (2010)."
di "    Synthetic control methods for comparative case studies."
di "    Journal of the American Statistical Association 105(490):"
di "    493–505. https://doi.org/10.1198/jasa.2009.ap08746"
di "============================================"
di _newline
di "=== Script completed successfully ==="

log close
