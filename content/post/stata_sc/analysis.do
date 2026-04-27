****************************************************
* Synthetic Control Method (SCM) Tutorial
* Effect of California's Proposition 99
* on Cigarette Sales
*
* Based on: Abadie, A., Diamond, A. & Hainmueller, J.
*   (2010). Synthetic control methods for comparative
*   case studies: Estimating the effect of California's
*   tobacco control program.
*   Journal of the American Statistical Association,
*   105(490), 493-505.
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_sc/
*
* Dataset:
*   smoking_sc.dta (39 states x 31 years, 1970-2000)
*
* Setting:
*   In 1988, California voters approved Proposition 99,
*   a comprehensive tobacco control initiative that
*   raised taxes on cigarettes and funded anti-smoking
*   programs. The law went into effect in January 1989.
*
* Estimand: ATT (Average Treatment Effect on Treated)
*   Treatment effect on California's cigarette sales
*
* Variables:
*   state       - State identifier (numeric)
*   year        - Year (1970-2000)
*   cigsale     - Cigarette sales (packs per capita)
*   lnincome    - Log of personal income per capita
*   age15to24   - % population aged 15-24
*   retprice    - Average retail cigarette price
*   beer        - Beer consumption per capita
*
* Usage:
*   1. Open Stata (17+ recommended)
*   2. Run: do analysis.do
*   3. All graphs saved as stata_sc_*.png
*   4. See analysis.log for full output
*
* Required packages:
*   synth, synth2
*
* Note: Apple Silicon Macs require Rosetta 2 mode
*   for the synth optimization plugin. See Section 0.
****************************************************

clear all
set more off
set seed 42


*---------------------------------------------------
* Section 0: Install dependencies + start log
*---------------------------------------------------

capture ssc install synth, all replace
capture ssc install synth2, all replace

* Start log
capture log close
log using "analysis.log", replace text

di _newline(2)
di "============================================"
di "  Synthetic Control Method (SCM) Tutorial"
di "  Abadie, Diamond & Hainmueller (2010)"
di "  $S_DATE $S_TIME"
di "============================================"

* Apple Silicon compatibility check
di _newline
di "Machine type:"
display c(machine_type)
di _newline
di "NOTE: If you are using a Mac with Apple Silicon,"
di "the synth optimization plugin requires Rosetta 2."
di "Right-click Stata > Get Info > Open Using Rosetta."


*===================================================
*  PART 1: DATA AND BASELINE SCM
*  Dataset: smoking_sc.dta (39 states x 31 years)
*===================================================


*---------------------------------------------------
* Section 1: Load and explore the dataset
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 1: DATA LOADING & EXPLORATION"
di "========================================"

use "https://github.com/quarcs-lab/data-open/raw/master/isds/smoking_sc.dta", clear

* Inspect variable labels and storage types
describe

* Check means, SD, min, max
summarize

* Show first few observations
list in 1/6

* Declare panel structure: state = unit, year = time
xtset state year

* Panel summary: within/between variance
xtsum

* Identify California's state code
label list

di _newline
di "Panel: 39 states x 31 years (1970-2000) = 1,209 observations"
di "Treatment unit: California (state == 3)"
di "Treatment period: 1989 (Proposition 99 went into effect)"
di "Donor pool: 38 control states"
di _newline
di "Variables:"
di "  cigsale    - Cigarette sales per capita (packs)"
di "  lnincome   - Log personal income per capita"
di "  age15to24  - % population aged 15-24"
di "  retprice   - Average retail cigarette price"
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

* Create California indicator
gen california = (state == 3)

* Collapse to year x group means
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
    note("Source: Abadie, Diamond & Hainmueller (2010)." ///
        "Vertical line = Proposition 99 (1989).") ///
    graphregion(color(white)) plotregion(color(white)) ///
    name(raw_trends, replace)

graph export "stata_sc_raw_trends.png", replace width(2400)

restore

di "Figure saved: stata_sc_raw_trends.png"
di _newline
di "Before 1989, California's cigarette sales broadly tracked"
di "the donor pool average. After Proposition 99, California's"
di "sales diverge sharply downward, suggesting a treatment effect."
di "However, a simple average is not the best comparison --"
di "the SCM constructs a weighted combination of control states"
di "that better matches California's pre-treatment trajectory."


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
di "  lnincome    - Log income (economic demand factor)"
di "  age15to24   - Young population share (demographic)"
di "  retprice    - Retail price (price elasticity)"
di "  beer        - Beer consumption (complementary goods)"
di "  cigsale(1988), cigsale(1980), cigsale(1975)"
di "              - Pre-treatment cigarette sales at key years"
di _newline
di "Options:"
di "  trunit(3)         - Treated unit: California (state==3)"
di "  trperiod(1989)    - Treatment onset: January 1989"
di "  xperiod(1980(1)1988) - Predictor averaging: 1980-1988"
di "  nested            - Nested optimization for better weights"
di "  allopt            - Multiple starting values for robustness"
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
di "  SECTION 4: PREDICTOR BALANCE & WEIGHTS"
di "========================================"

* Predictor balance: California vs. Synthetic California
di _newline
di "Predictor Balance (California vs. Synthetic California):"
di "-------------------------------------------------------"
matrix list X_balance

di _newline
di "The predictor balance table compares California's actual"
di "predictor values with those of the synthetic California."
di "Close values indicate a good pre-treatment match."
di "The SCM optimizes predictor weights (V matrix) to"
di "minimize this discrepancy."

* Unit weights: which states form synthetic California
di _newline
di "Unit Weights (Donor Pool Contributions):"
di "-----------------------------------------"
matrix list W_weights

di _newline
di "The unit weights show which control states contribute"
di "to the synthetic California. Most states receive zero"
di "or near-zero weight. The key contributors are states"
di "with similar pre-treatment cigarette sales trajectories."
di "Weights are non-negative and sum to 1."


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
di "The 'pred' graph shows California's actual cigarette"
di "sales vs. the synthetic California's predicted sales."
di "Pre-1989: the two lines closely track each other,"
di "indicating a good pre-treatment fit."
di _newline
di "Post-1989: California's actual sales fall sharply below"
di "the synthetic control, indicating that Proposition 99"
di "reduced cigarette consumption."
di _newline
di "The 'eff' graph shows the gap (treatment effect) over"
di "time. The negative gap widens through the 1990s,"
di "suggesting the policy's effect grew stronger over time."
di _newline
di "Estimand: ATT (Average Treatment Effect on Treated)"
di "The estimated effect is on California specifically --"
di "not a general population parameter."


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
di "In-space placebo test: apply the SCM to each control"
di "state as if IT were the treated unit. If California's"
di "estimated effect is unusually large compared to these"
di "placebo effects, we have evidence of a real treatment"
di "effect rather than a statistical artifact."
di _newline
di "Options:"
di "  placebo(unit) - Run SCM for each control state"
di "  cut(2)        - Keep states with pre-MSPE <= 2x CA's"
di "                  (filters out poor-fit placebos)"
di "  sigf(6)       - 6 significant figures for convergence"
di "  (allopt dropped to save computation time)"
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
di "eff_pboUnit: Spaghetti plot of treatment effects for all"
di "  states. California's line (bold) should stand out as an"
di "  outlier among the grey placebo lines."
di _newline
di "ratio_pboUnit: Ranks states by post/pre MSPE ratio."
di "  A high ratio means the post-treatment gap is large"
di "  relative to pre-treatment fit. California should rank"
di "  at or near the top."
di _newline
di "pvalTwo/Right/Left: Fisher exact p-values over time."
di "  Two-sided: tests for any effect (positive or negative)"
di "  Right-tail: tests for a negative effect on sales"
di "  Left-tail: tests for a positive effect on sales"
di "  If California's p-value is below 0.05, the effect is"
di "  statistically significant at the 5% level."


*---------------------------------------------------
* Section 7: In-time placebo test
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 7: IN-TIME PLACEBO TEST"
di "========================================"

di _newline
di "In-time placebo test: pretend the treatment happened"
di "in 1985 (4 years before the actual intervention)."
di "If the model is valid, there should be NO significant"
di "effect at this fake treatment date."
di _newline
di "Key changes from baseline:"
di "  - Dropped cigsale(1988) from predictors"
di "    (would be post-fake-treatment)"
di "  - xperiod(1980(1)1984) instead of 1980(1)1988"
di "    (predictor averaging ends before fake treatment)"
di "  - placebo(period(1985)) specifies fake treatment year"
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
di "pred_pboTime1985: Shows California vs. Synthetic California"
di "  with the fake 1985 treatment date. The two lines should"
di "  remain close between 1985 and 1989, confirming no spurious"
di "  pre-treatment effect."
di _newline
di "eff_pboTime1985: Shows the gap (effect) over time with the"
di "  fake treatment. Between 1985 and 1989, the gap should be"
di "  near zero. After 1989 (the real treatment), the gap should"
di "  widen, consistent with the baseline results."
di _newline
di "If a large effect appears at the fake treatment date, it"
di "would suggest the model is overfitting or that unobserved"
di "confounders are driving the results."


*---------------------------------------------------
* Section 8: Leave-one-out robustness check
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 8: LEAVE-ONE-OUT ROBUSTNESS"
di "========================================"

di _newline
di "Leave-one-out (LOO) test: re-estimate the SCM"
di "removing one donor state at a time. If the results"
di "are sensitive to any single state, it raises concerns"
di "about the robustness of the synthetic control."
di _newline
di "Options:"
di "  loo                          - Enable LOO iterations"
di "  frame(california)            - Store results in Stata frame"
di "  savegraph(california, replace) - Save individual .gph graphs"
di _newline
di "Running leave-one-out test... (this takes several minutes)"

synth2 cigsale lnincome age15to24 retprice beer cigsale(1988) cigsale(1980) cigsale(1975), trunit(3) trperiod(1989) xperiod(1980(1)1988) nested loo frame(california) savegraph(california, replace)

* Combine all LOO graphs into a single display
graph combine `e(graph)', cols(2) altshrink ///
    title("Leave-One-Out Robustness: Synthetic California") ///
    note("Each panel excludes one donor state.") ///
    graphregion(color(white)) ///
    name(loo_combined, replace)

graph export "stata_sc_loo_combined.png", replace width(2400)
di "Figure saved: stata_sc_loo_combined.png"

di _newline
di "Leave-One-Out Results:"
di "======================"
di _newline
di "The combined graph shows predicted vs. actual cigarette"
di "sales for California when each donor state is excluded"
di "from the pool one at a time."
di _newline
di "If the treatment effect estimate remains similar across"
di "all LOO iterations, the results are robust. Substantial"
di "changes when a specific state is removed would indicate"
di "over-reliance on that state in the synthetic control."


*---------------------------------------------------
* Section 9: Inspect leave-one-out frame
*---------------------------------------------------

di _newline(2)
di "========================================"
di "  SECTION 9: LOO FRAME INSPECTION"
di "========================================"

di _newline
di "The LOO results are stored in a Stata frame named"
di "'california'. Frames allow multiple datasets in memory"
di "(available in Stata 16+)."

frame change california
describe
frame change default

di _newline
di "The 'california' frame contains variables for each LOO"
di "iteration: predicted values, treatment effects, and the"
di "identity of the excluded state. Researchers can use this"
di "frame for further custom analysis."


*---------------------------------------------------
* Section 10: Closing summary
*---------------------------------------------------

di _newline(2)
di "============================================"
di "  ANALYSIS COMPLETE"
di "============================================"
di _newline
di "  Estimand: ATT (Average Treatment Effect on Treated)"
di "  Treated unit: California (state==3)"
di "  Treatment: Proposition 99 (effective January 1989)"
di _newline
di "  Key Findings:"
di "  1. The SCM constructs a weighted combination of control"
di "     states that closely matches California pre-1989."
di "  2. After 1989, actual California cigarette sales fall"
di "     well below the synthetic control, indicating a"
di "     substantial reduction in cigarette consumption."
di "  3. The in-space placebo test shows California's effect"
di "     is an outlier among control states, supporting"
di "     statistical significance."
di "  4. The in-time placebo test confirms no spurious effect"
di "     at the fake 1985 treatment date."
di "  5. Leave-one-out analysis shows robust results across"
di "     different donor pool compositions."
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
di "    Abadie, A., Diamond, A. & Hainmueller, J. (2010)."
di "    Synthetic control methods for comparative case"
di "    studies: Estimating the effect of California's"
di "    tobacco control program. JASA, 105(490), 493-505."
di "============================================"
di _newline
di "=== Script completed successfully ==="

log close
