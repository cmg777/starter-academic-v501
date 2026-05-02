****************************************************************
* Conditional Average Treatment Effects (CATE) with Stata 19
*
* A pedagogical tour of the new -cate- command for estimating
* heterogeneous treatment effects with machine learning.
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_cate/
*
* Dataset: assets3 (built into Stata 19, webuse)
*   9,913 households, observational
*   Outcome:   asset   (net financial assets, in dollars)
*   Treatment: e401k   (1 = eligible for a 401(k), 0 = not)
*   Question:  Does the treatment effect vary across households,
*              and if so, who benefits the most?
*
* Methods illustrated (all from Stata 19's -cate- command):
*   - PO   (partialing-out; partial-linear model)
*   - AIPW (augmented inverse-probability weighting; doubly robust)
*   - Causal forest for the individual-effect function tau(x)
*   - GATE  (group ATEs on prespecified groups)
*   - GATES (group ATEs on data-driven quantile groups)
*   - estat heterogeneity   -- formal H0: tau(x) is constant
*   - estat projection      -- linear summary of who responds
*   - estat classification  -- profile of high vs low responders
*   - estat series          -- nonparametric fit tau(x_j)
*
* Prerequisites:
*   - Stata 19 (the -cate- command does not exist in earlier
*     versions). Script aborts if the running Stata is older.
*
* Usage:
*   1. Open Stata 19 (or StataNow / MP / SE)
*   2. Run: do analysis.do
*   3. Outputs (analysis.log + 8 PNG figures + 2 CSVs) land in
*      this directory.
*
* Approximate runtime: 5--15 minutes (cross-fitting + causal
*   forest are CPU-intensive; MP build recommended).
****************************************************************

clear all
set more off
capture log close
log using "analysis.log", replace text


*================================================================
* Section 0: Stata 19 version gate
*================================================================
*
* The -cate- command is brand-new in Stata 19. There is NO
* equivalent in Stata 18 or earlier. We refuse to run on older
* Stata so that the user gets a clear error rather than a stream
* of "command cate is unrecognized" messages.
*----------------------------------------------------------------

if c(stata_version) < 19 {
    di as error ""
    di as error "============================================================"
    di as error "  ERROR: this script requires Stata 19 or later."
    di as error "  Detected Stata version: " c(stata_version)
    di as error "  The -cate- command was introduced in Stata 19."
    di as error "============================================================"
    log close
    exit 198
}

di as text "Stata version detected: " c(stata_version) "  -- OK."


*================================================================
* Section 1: Setup -- globals and reproducibility
*================================================================
*
* Two macros control the analysis:
*
*   $catecovars: the variables for which we want to know how the
*                effect varies. These are the inputs to tau(x).
*
*   $controls:  variables used by the nuisance functions (the
*               outcome model g(x,w) and the treatment model
*               f(x,w)). Often the same as catecovars, but you
*               can pass a richer set with interactions to soak
*               up confounding without overcomplicating tau(x).
*
* The seed makes cross-fitting and the random-forest internals
* reproducible. We use the same seed throughout.
*----------------------------------------------------------------

global catecovars age educ i.incomecat i.pension i.married i.twoearn i.ira i.ownhome
global controls   age educ i.incomecat i.pension i.married i.twoearn i.ira i.ownhome
global rseed      12345671


*================================================================
* Section 2: Data loading and exploration
*================================================================
*
* assets3 is shipped with Stata's example data. Each row is one
* household. e401k = 1 if the household is eligible for a 401(k)
* through their employer; 0 otherwise. asset is total net
* financial assets in dollars.
*----------------------------------------------------------------

webuse assets3, clear

* Quick variable description and sample size
describe asset e401k age educ income incomecat pension married twoearn ira ownhome

* Summary statistics
summarize asset e401k age educ income, detail

* Treatment-group sizes (raw counts and proportions)
tab e401k, missing

* Naive mean-difference (NOT a causal estimate -- groups differ
* in age, income, education, etc.). This is the "before doing
* anything sensible" benchmark.
tabstat asset, by(e401k) statistics(mean sd n)

* Export the raw dataset so the blog post / report skill can
* reference exact numbers without rerunning Stata.
export delimited asset e401k age educ income incomecat pension married ///
    twoearn ira ownhome using "assets3_raw.csv", replace


*================================================================
* Section 3: Baseline ATE -- the "single number" view
*================================================================
*
* Estimand:  ATE = E{y(1) - y(0)}
*
* Before estimating *heterogeneous* effects, we anchor with a
* good *average* effect. We use AIPW (doubly robust) so the ATE
* is consistent if EITHER the outcome model OR the propensity
* score model is correct.
*
* This is exactly the workhorse you might already know from
* Stata's -teffects- suite. It returns ONE number: the average
* effect across the whole sample.
*
* Why this isn't enough: the ATE could be $8,000 on average and
* still hide huge variation -- maybe high-income households gain
* $20,000 and low-income households gain almost nothing.
* Sections 4 onward open the hood.
*----------------------------------------------------------------

teffects aipw                                                                  ///
    (asset c.age c.educ i.incomecat i.pension i.married i.twoearn i.ira i.ownhome) ///
    (e401k c.age c.educ i.incomecat i.pension i.married i.twoearn i.ira i.ownhome)

* Quick "naive" subgroup table to motivate the rest of the
* tutorial: do raw mean differences look uniform across income
* categories? (Spoiler: no.)
table incomecat e401k, statistic(mean asset) nformat(%10.0f)


*================================================================
* Section 4: PO estimator on the partial-linear model
*================================================================
*
* Estimand: CATE  tau(x) = E{y(1) - y(0) | x = x}
*
* The partial-linear (PO = Partialing-Out) model assumes:
*
*   y = d * tau(x) + g(x,w) + epsilon
*   d = f(x,w) + u
*
* where g and f are flexible nuisance functions estimated by
* machine learning (lasso by default), and tau(x) is the object
* of interest.
*
* PO partials out g and f using cross-fitting (Robinson 1988;
* Chernozhukov et al. 2018), then fits a causal forest on the
* residuals. The output:
*   - "Average treatment effect" line (this is the ATE)
*   - And, behind the scenes, a function tau(x) we will probe
*     in the next sections.
*
* Why PO first: it is robust and uses the default settings the
* manual recommends. We compare with AIPW in Section 8.
*----------------------------------------------------------------

cate po (asset $catecovars) (e401k), rseed($rseed)

* Formal test of treatment-effect homogeneity
*   H0: tau(x) is constant -- i.e., there is NO heterogeneity.
* If we reject H0, the rest of this script is justified.
estat heterogeneity

* Linear projection: regress the (latent) tau_i on the catecovars.
* This gives an interpretable summary of WHICH covariates drive
* heterogeneity -- think of it as "an OLS view of the function
* tau(x)". Big positive coefficients = the variable raises the
* effect.
estat projection $catecovars

* Predict the individual treatment effects (IATEs) for use in
* CSV export below.  -iate- is the default option; we name it
* explicitly so the code reads pedagogically.
predict double iate_po, iate

* Export IATE predictions (one row per household). Wrapped in
* -capture- so a missing-variable issue does not derail the rest
* of the script.
capture {
    preserve
        keep iate_po e401k age educ income incomecat
        export delimited using "iate_predictions.csv", replace
    restore
}

* Figure 1: distribution of individual effects (PO).
* A wide spread = strong heterogeneity. A spike at one value =
* near-homogeneity. Look for a fat right tail in this dataset.
categraph histogram, ///
    title("Distribution of individual treatment effects (PO)")  ///
    xtitle("Estimated tau_hat_i (dollars)")                     ///
    note("Source: assets3, Stata 19 cate po")
graph export "stata_cate_iate_histogram_po.png", replace width(1200)


*================================================================
* Section 5: How does the effect vary with one variable?
*================================================================
*
* IATE plots show tau(x_j) varying ONE covariate at a time, with
* the other covariates fixed at their reference values. This is
* the most intuitive way to see "where does the effect peak?".
*
* Each plot includes confidence bands (from honest random-forest
* inference, the bootstrap-of-little-bags procedure).
*----------------------------------------------------------------

* Figure 2: effect as a function of age
categraph iateplot age, ///
    title("Estimated CATE by age")        ///
    ytitle("tau_hat (dollars)") xtitle("Age (years)")
graph export "stata_cate_iateplot_age.png", replace width(1200)

* Figure 3: effect as a function of education
categraph iateplot educ, ///
    title("Estimated CATE by years of education")  ///
    ytitle("tau_hat (dollars)") xtitle("Education (years)")
graph export "stata_cate_iateplot_educ.png", replace width(1200)


*================================================================
* Section 6: GATE on prespecified groups
*================================================================
*
* Estimand: GATE  tau(g) = E{Gamma_i | G_i = g}
*
* where Gamma_i is the AIPW orthogonal score for unit i. A GATE
* averages the individual effect within a prespecified group --
* here, the 5 income categories (incomecat).
*
* The trick: -reestimate- recycles the IATE function fitted in
* Section 4. We do NOT refit the (slow) causal forest. We just
* recompute group means.
*----------------------------------------------------------------

cate, group(incomecat) reestimate

* Joint test: are the GATEs equal across the 5 income groups?
* Reject H0 = effect is heterogeneous across income.
estat gatetest

* Figure 4: GATE bar chart with 95% CIs
categraph gateplot, ///
    title("GATE by income category")           ///
    ytitle("tau_hat (dollars)") xtitle("Income category (1 = low, 5 = high)")
graph export "stata_cate_gate_incomecat.png", replace width(1200)

* (The full GATE table -- estimates, SEs, CIs -- is in the log.
*  We do NOT export it as CSV because r(table) after a -cate-
*  reestimate does not preserve column names through svmat.)


*================================================================
* Section 7: GATES on data-driven quartiles
*================================================================
*
* GATES = "Group Average Treatment Effect Sorted". Stata sorts
* households by their *predicted* effect tau_hat_i and bins them
* into quartiles (or any quantile via group(#)). Then it reports
* the mean effect within each bin.
*
* This is the cleanest single picture of heterogeneity:
*   - Bin 1 = the top 25% of predicted effects
*   - Bin 4 = the bottom 25%
* If the bars look almost the same, there is little
* heterogeneity. If they fan out, there is a lot.
*
* Cross-fitting protects against p-hacking: the binning uses
* out-of-sample predictions, so a unit's bin is not informed by
* its own outcome.
*----------------------------------------------------------------

cate po (asset $catecovars) (e401k), rseed($rseed) group(4)

* Figure 5: GATES bar chart (Q1 vs Q4)
categraph gateplot, ///
    title("GATES by data-driven quartile of estimated effect") ///
    ytitle("tau_hat (dollars)") xtitle("Quartile (1 = highest tau_hat, 4 = lowest)")
graph export "stata_cate_gates_quartiles.png", replace width(1200)

* Profile of who's in each bin: -estat classification- runs a
* two-sample t-test comparing the mean of ONE variable between
* the highest-effect and lowest-effect rank groups. Only one
* variable per call; we sweep three.
estat classification age
estat classification educ
estat classification income


*================================================================
* Section 8: AIPW estimator -- a doubly-robust contrast
*================================================================
*
* The fully-interactive (AIPW) model fits separate outcome models
* for treated and untreated:
*   y(1) = g_1(x,w) + epsilon_1
*   y(0) = g_0(x,w) + epsilon_0
*
* The CATE then comes from the AIPW score:
*   Gamma_i = [y_hat(1) + d*(y - y_hat(1))/f]
*           - [y_hat(0) + (1-d)*(y - y_hat(0))/(1-f)]
*
* This is "doubly robust": consistent if EITHER the outcome
* models OR the propensity score is correct. It is more
* efficient (narrower CIs) than PO when both are well-specified,
* but more sensitive to propensity scores near 0 or 1 (the
* "overlap" issue).
*
* If PO and AIPW give similar pictures, you can trust the
* heterogeneity story. If they disagree wildly, dig into
* overlap and model specification.
*----------------------------------------------------------------

cate aipw (asset $catecovars) (e401k), rseed($rseed)

* Heterogeneity test under the AIPW spec
estat heterogeneity

* Figure 6: IATE distribution (AIPW). Compare with Figure 1.
categraph histogram, ///
    title("Distribution of individual treatment effects (AIPW)")  ///
    xtitle("Estimated tau_hat_i (dollars)")                       ///
    note("Source: assets3, Stata 19 cate aipw")
graph export "stata_cate_iate_histogram_aipw.png", replace width(1200)

* Figure 7: AIPW effect by education (compare with PO Figure 3)
categraph iateplot educ, ///
    title("Estimated CATE by education (AIPW)")  ///
    ytitle("tau_hat (dollars)") xtitle("Education (years)")
graph export "stata_cate_iateplot_educ_aipw.png", replace width(1200)


*================================================================
* Section 9: Nonparametric series -- a smooth view of tau(x_j)
*================================================================
*
* -estat series- fits a B-spline (or polynomial) of the IATE
* against one continuous covariate. Unlike -categraph iateplot-
* (which holds other covariates at reference values), this is
* a marginal smoother: it averages over the joint distribution
* of x.
*
* Practical use: tells you whether the relationship between
* tau(x) and x_j is monotone, U-shaped, etc. With knots(5) we
* let the spline have 5 internal knots -- enough flexibility for
* a single covariate.
*----------------------------------------------------------------

* Figure 8: nonparametric series of tau against income
estat series income if income <= 150000, graph knots(5)
graph export "stata_cate_series_income.png", replace width(1200)


*================================================================
* Closing summary
*================================================================

di _newline(2)
di "============================================================"
di "  CATE analysis complete."
di ""
di "  Section 3: ATE estimated by AIPW (single number)."
di "  Sections 4-5: PO + IATE plots reveal who responds most."
di "  Sections 6-7: GATE / GATES quantify the spread."
di "  Section 8: AIPW serves as a doubly-robust check."
di "  Section 9: nonparametric series shows how tau varies"
di "             smoothly with income."
di ""
di "  Figures saved: 8 PNGs (stata_cate_*.png)."
di "  CSVs saved:    assets3_raw.csv, iate_predictions.csv."
di "============================================================"

log close
