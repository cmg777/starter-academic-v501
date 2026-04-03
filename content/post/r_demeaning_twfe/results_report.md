# Results Report: Manual Demeaning and Two-Way Fixed Effects

**Script:** `analysis.R` (521 lines)
**Executed:** 2026-04-03
**Status:** Success
**Runtime:** not recorded
**Language:** R 4.3.x
**Key packages:** fixest 0.12.1, tidyverse 2.0.0, ggplot2 3.5.2, scales

---

## Execution Summary

The script demonstrates the algebraic equivalence between two-way fixed effects (TWFE) estimation and ordinary least squares (OLS) on manually demeaned data, using the Frisch-Waugh-Lovell (FWL) theorem. It loads a balanced panel of 150 countries over 8 time periods from the Barro convergence dataset, estimates a growth regression with entity and time fixed effects using `fixest::feols()`, then replicates the exact same coefficients by manually subtracting country means, time means, and adding back the grand mean before running `lm()`.

The headline result is that `all.equal()` confirms the two sets of coefficients are identical to machine precision (maximum difference: 3.05 x 10^-16). The script also demonstrates why standard errors from naive `lm()` on demeaned data are incorrect, and compares three SE types: naive, IID-corrected, and clustered.

**Warnings:** 3 non-fatal (package version mismatch for fixest, ggplot2, scales; object masking between scales and fixest). All expected and harmless.

---

## Data Overview

```text
Countries: 150
Time periods: 8
Total observations: 1200
Balanced panel: TRUE

Summary of key variables:
     growth           ln_y_initial      log_s_k          log_n_gd
 Min.   :-0.238451   Min.   :1.923   Min.   :-2.387   Min.   :-2.900
 1st Qu.:-0.157869   1st Qu.:4.047   1st Qu.:-1.722   1st Qu.:-2.704
 Median :-0.121765   Median :5.159   Median :-1.537   Median :-2.656
 Mean   :-0.124364   Mean   :5.364   Mean   :-1.570   Mean   :-2.657
 3rd Qu.:-0.091247   3rd Qu.:6.538   3rd Qu.:-1.393   3rd Qu.:-2.606
 Max.   :-0.003983   Max.   :9.874   Max.   :-1.021   Max.   :-2.427
    log_hcap          gov_cons
 Min.   :0.02165   Min.   :0.0704
 1st Qu.:0.56623   1st Qu.:0.1261
 Median :0.68201   Median :0.1454
 Mean   :0.66457   Mean   :0.1461
 3rd Qu.:0.79619   3rd Qu.:0.1666
 Max.   :1.09248   Max.   :0.2201
```

**Interpretation:** The dataset is a perfectly balanced panel of 150 countries observed across 8 time periods, yielding 1,200 total observations. The dependent variable `growth` (annualized GDP per capita growth) has a mean of -0.124 and ranges from -0.238 to -0.004, indicating that all growth rates in this simulated dataset are negative -- consistent with a convergence exercise where initial income declines over successive periods. Log initial income (`ln_y_initial`) spans from 1.92 to 9.87, reflecting substantial cross-country income heterogeneity. The covariates (investment share, population growth, human capital, government consumption) show moderate variation within plausible economic ranges.

### Panel Structure

![Panel structure heatmap](r_demeaning_twfe_panel_structure.png)

**Interpretation:** The heatmap confirms that the panel is perfectly balanced -- every one of the 150 countries is observed in all 8 time periods, with no missing cells. This is the ideal setting for demonstrating the demeaning formula, as balanced panels allow the simple closed-form two-way demeaning (subtract country mean, subtract time mean, add grand mean) without the iterative projection that unbalanced panels require.

---

## Method Results

### TWFE Estimation with fixest

```text
OLS estimation, Dep. Var.: growth
Observations: 1,200
Fixed-effects: id: 150,  time: 8
Standard-errors: Clustered (id)
              Estimate Std. Error    t value  Pr(>|t|)
ln_y_initial -0.055286   0.003744 -14.765156 < 2.2e-16 ***
log_s_k       0.019725   0.007583   2.601311  0.010223 *
log_n_gd     -0.049614   0.022168  -2.238117  0.026696 *
log_hcap      0.009081   0.014564   0.623549  0.533877
gov_cons     -0.102795   0.046398  -2.215501  0.028243 *

RMSE: 0.020517     Adj. R2: 0.755103
                 Within R2: 0.176777
```

**Interpretation:** The TWFE model with country and time fixed effects reveals strong conditional beta-convergence: the coefficient on log initial income is -0.055 (t = -14.77, p < 2.2e-16), meaning that a 1% higher initial income is associated with 0.055 percentage points slower subsequent growth, after controlling for investment, population growth, human capital, and government consumption. Investment has the expected positive effect (0.020, p = 0.010), population growth has the expected negative effect (-0.050, p = 0.027), and government consumption is significantly negative (-0.103, p = 0.028). Human capital is positive but not statistically significant (0.009, p = 0.534). The overall model explains 75.5% of total variation (Adj. R-squared = 0.755), though only 17.7% of the within-variation (Within R-squared = 0.177), which is typical for panel models where fixed effects absorb most cross-country heterogeneity.

### Manual Demeaning Step-by-Step

```text
Step 3a: Computing country means...
Step 3b: Computing time means...
Step 3c: Computing grand means...
      growth ln_y_initial      log_s_k     log_n_gd     log_hcap     gov_cons
  -0.1243637    5.3643127   -1.5699117   -2.6569021    0.6645657    0.1461335

Step 3d: Applying the demeaning formula...
Formula: x_tilde_it = x_it - x_bar_i. - x_bar_.t + x_bar_..

Mean of demeaned variables (should be ~0):
  growth_dm           : -8.114169e-17
  ln_y_initial_dm     : 8.295170e-15
  log_s_k_dm          : -1.482923e-15
  log_n_gd_dm         : 1.599953e-15
  log_hcap_dm         : 5.384582e-17
  gov_cons_dm         : 1.832302e-16
```

**Interpretation:** The demeaning procedure works in three stages: first computing the time-average for each country (150 means), then the cross-sectional average for each period (8 means), and finally the overall grand mean (one scalar per variable). After applying the two-way demeaning formula -- subtracting the country mean, subtracting the time mean, and adding back the grand mean to correct for the double-subtraction -- all demeaned variables have means that are effectively zero (on the order of 10^-15 to 10^-17). This confirms that the demeaning formula is implemented correctly: the within-variation that remains is purely the deviation from both entity-specific and time-specific patterns.

### OLS on Demeaned Data

```text
Coefficients:
                  Estimate Std. Error t value Pr(>|t|)
(Intercept)      5.035e-16  5.938e-04   0.000  1.00000
ln_y_initial_dm -5.529e-02  3.618e-03 -15.282  < 2e-16 ***
log_s_k_dm       1.972e-02  6.846e-03   2.881  0.00403 **
log_n_gd_dm     -4.961e-02  1.820e-02  -2.726  0.00651 **
log_hcap_dm      9.081e-03  1.370e-02   0.663  0.50751
gov_cons_dm     -1.028e-01  4.411e-02  -2.331  0.01994 *

Residual standard error: 0.02057 on 1194 degrees of freedom
Multiple R-squared:  0.1768

Intercept value: 5.034944e-16 (should be ~0)
Intercept is effectively zero: TRUE
```

**Interpretation:** Running plain OLS via `lm()` on the demeaned variables produces slope coefficients that are visually indistinguishable from the TWFE estimates: -0.0553 for log initial income, 0.0197 for investment, -0.0496 for population growth, 0.0091 for human capital, and -0.1028 for government consumption. The intercept is 5.03 x 10^-16 -- effectively zero, confirming that the demeaned variables are properly centered. The R-squared of 0.177 matches the Within R-squared from `feols()`, which makes sense because both are measuring explained variation after removing entity and time effects. Note that `lm()` reports 1,194 degrees of freedom (1200 - 6 parameters), while the correct df accounting for absorbed fixed effects is 1,038 (1200 - 150 - 8 + 1 - 5).

### Coefficient Comparison and Equivalence Proof

```text
Side-by-side coefficient comparison:
      variable                  label      feols_TWFE      manual_OLS      difference
1 ln_y_initial     Log Initial Income -0.055286009819 -0.055286009819 -4.163336342e-17
2      log_s_k   Log Investment Share  0.019724899416  0.019724899416  3.469446952e-18
3     log_n_gd         Log(n + g + d) -0.049613972524 -0.049613972524 -2.775557562e-16
4     log_hcap      Log Human Capital  0.009081150621  0.009081150621  3.469446952e-17
5     gov_cons Gov. Consumption Share -0.102795317426 -0.102795317426 -3.053113318e-16

Maximum absolute difference: 3.053113e-16
all.equal() test: TRUE
```

**Interpretation:** The coefficient comparison is the central result of this tutorial. All five slope coefficients from `feols()` TWFE and from `lm()` on manually demeaned data are identical to at least 12 significant digits. The largest difference is 3.05 x 10^-16 -- on the order of IEEE 754 double-precision machine epsilon (~2.2 x 10^-16). R's `all.equal()` function confirms equality within its default tolerance of 1.5 x 10^-8. This is not a coincidence or an approximation: it is an exact algebraic identity guaranteed by the Frisch-Waugh-Lovell theorem. Including a full set of entity and time dummies in a regression is mathematically equivalent to first projecting out those effects by subtracting group means.

![Coefficient comparison](r_demeaning_twfe_coef_comparison.png)

**Interpretation:** The dot plot makes the equivalence visually concrete. For each of the five covariates, the steel blue circle (feols TWFE) and warm orange triangle (manual demeaning OLS) overlap perfectly -- they are literally the same point. Government consumption has the largest coefficient in magnitude at -0.103, followed by the convergence parameter (log initial income) at -0.055. The zero reference line (dashed) helps identify which variables have positive versus negative effects.

### Visualizing What Demeaning Does

![Before vs after demeaning](r_demeaning_twfe_scatter_before_after.png)

**Interpretation:** The faceted scatter plot provides the most intuitive visualization of what TWFE actually does to the data. The left panel shows raw data for 10 countries: log initial income spans roughly 3 to 9, and each country's observations form a distinct cluster at different income levels. The right panel shows the same data after two-way demeaning: the wide cross-country spread collapses to a narrow range of approximately -0.5 to 0.3 around zero. The between-country income differences and common time trends have been stripped away, leaving only the within-variation that identifies the TWFE coefficient.

![Demeaning decomposition](r_demeaning_twfe_decomposition.png)

**Interpretation:** The decomposition figure traces the demeaning formula for Country 1's growth rate across all 8 periods. The observed values (blue line) decline from about -0.18 to -0.07. The country mean (orange dashed line) is a flat horizontal at -0.127. The time means (teal dot-dash line) capture the common cross-country trend, declining from -0.189 to -0.076. The grand mean (gray dotted) sits at -0.124. The demeaned series (black line) is what remains after applying the formula -- it fluctuates around zero, capturing only the within-country, within-period deviations that TWFE uses for identification.

### Standard Error Comparison

```text
Standard error comparison:
      variable                  label se_naive_lm se_feols_iid se_feols_cluster
1 ln_y_initial     Log Initial Income  0.00361766   0.00388000       0.00374436
2      log_s_k   Log Investment Share  0.00684559   0.00734199       0.00758268
3     log_n_gd         Log(n + g + d)  0.01820117   0.01952104       0.02216773
4     log_hcap      Log Human Capital  0.01369872   0.01469209       0.01456365
5     gov_cons Gov. Consumption Share  0.04410809   0.04730660       0.04639822

Why SEs differ:
- Naive lm() uses df = N*T - K = 1195
- Correct df = N*T - N - T + 1 - K = 1038
- feols() clustered SEs also account for within-entity correlation
```

![Standard error comparison](r_demeaning_twfe_se_comparison.png)

**Interpretation:** While the coefficients are identical, the standard errors diverge meaningfully across the three approaches. Naive `lm()` SEs are systematically too small because they use 1,195 degrees of freedom instead of the correct 1,038 -- ignoring the 157 degrees of freedom consumed by estimating 150 country effects and 8 time effects (minus 1 for the normalization). The feols IID SEs correct for this df adjustment, inflating the SEs by roughly 7% on average. The feols clustered SEs (the default, clustering by the first fixed effect, `id`) further adjust for within-entity serial correlation, which can either inflate or deflate the SEs depending on the correlation structure. For log initial income, clustering actually produces slightly smaller SEs (0.00374) than IID (0.00388), while for log(n+g+d), clustering produces noticeably larger SEs (0.0222 vs 0.0195). The practical lesson is stark: using naive `lm()` SEs would lead to overstated significance and potentially incorrect inference.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `r_demeaning_twfe_panel_structure.png` | Heatmap showing 150 countries x 8 time periods with data availability | The panel is perfectly balanced -- every country appears in every period, yielding 1,200 complete observations |
| 2 | `r_demeaning_twfe_coef_comparison.png` | Dot plot with feols TWFE (blue circles) and manual demeaning OLS (orange triangles) coefficients side by side | The two sets of coefficients overlap perfectly -- visually indistinguishable, confirming FWL theorem equivalence |
| 3 | `r_demeaning_twfe_scatter_before_after.png` | Two-panel faceted scatter plot showing raw and demeaned ln_y_initial vs growth for 10 countries | Demeaning collapses the wide cross-country spread (raw x-axis range ~3-9) into a tight cluster around zero (demeaned range ~-0.5 to 0.3), stripping between-country variation |
| 4 | `r_demeaning_twfe_decomposition.png` | Time series for Country 1 showing observed growth, country mean, time mean, grand mean, and demeaned growth with formula annotation | The demeaned series (black) is the residual after removing the flat country mean (orange dashed), the declining time trend (teal dot-dash), and adding back the grand mean (gray dotted) |
| 5 | `r_demeaning_twfe_se_comparison.png` | Grouped bar chart comparing naive lm(), feols IID, and feols clustered standard errors for all 5 variables | Naive SEs are systematically smaller than both feols variants; the gap is most visible for gov_cons and log(n+g+d), where naive SEs understate uncertainty by 7-22% |

---

## Key Findings

1. **Exact coefficient equivalence confirmed.** The TWFE coefficients from `feols()` and the OLS coefficients from `lm()` on manually demeaned data are identical to machine precision. The maximum absolute difference across all 5 coefficients is 3.05 x 10^-16 -- less than double-precision machine epsilon. `all.equal()` returns `TRUE`. This directly verifies the Frisch-Waugh-Lovell theorem: absorbing fixed effects via dummies is algebraically equivalent to subtracting group means.

2. **Strong conditional beta-convergence.** The convergence coefficient on log initial income is -0.0553 (t = -14.77, p < 2.2e-16), the most precisely estimated parameter in the model. This means that, conditional on investment, population growth, human capital, and government consumption, countries with 1% higher initial income grow 0.055 percentage points slower per period -- strong evidence of conditional convergence within this panel.

3. **Demeaning zeros out the intercept.** After proper two-way demeaning, the OLS intercept is 5.03 x 10^-16 -- effectively zero. This confirms that the demeaning formula correctly removes both entity-specific levels and time-specific trends, leaving variables centered at zero. If the grand mean correction were omitted, the intercept would be non-zero, and the equivalence would break.

4. **Naive standard errors are too optimistic.** Naive `lm()` SEs understate uncertainty because they assume 1,195 degrees of freedom instead of the correct 1,038. For government consumption, the naive SE is 0.0441 versus 0.0464 (feols clustered) -- a 5% understatement. For log(n+g+d), the gap is larger: 0.0182 (naive) vs 0.0222 (clustered), a 22% understatement. Using naive SEs in applied work would produce artificially narrow confidence intervals and inflate test statistics.

5. **Within R-squared is modest despite high overall R-squared.** The TWFE model has an Adjusted R-squared of 0.755, meaning 75.5% of total variation in growth is explained. But the Within R-squared is only 0.177, meaning that after absorbing country and time fixed effects, the regressors explain only 17.7% of the remaining within-variation. This is typical and informative: most cross-country growth differences are captured by the fixed effects (persistent country characteristics and common time shocks), while the covariates add modest additional explanatory power for within-country, within-period deviations.

6. **Time means reveal a convergence trend.** The time-period means of growth decline monotonically from -0.189 (period 1) to -0.076 (period 8), while time-period means of log initial income decline from 7.96 to 3.36. This reflects the convergence dynamics in the simulated data: as countries converge over time, their initial income levels fall (by construction, each period's "initial" income is lower) and growth rates become less negative (closer to steady state).

7. **Demeaning visually collapses the data.** The before/after scatter (Figure 3) shows raw log initial income spanning roughly 3 to 9 across countries, but after two-way demeaning, the same variable is compressed to approximately -0.5 to 0.3. This dramatic compression illustrates what fixed effects identification means in practice: the TWFE coefficient is identified entirely from within-country, within-period deviations, not from the large cross-country income differences visible in the raw data.

---

## Surprises and Caveats

No unexpected results. All findings align with theoretical expectations:

- Coefficient equivalence is guaranteed by the FWL theorem, not an empirical finding.
- The SE divergence between naive and correct approaches is well-documented in the econometrics literature.
- The dataset is simulated (generated by a Barro convergence tutorial), so all parameter signs and magnitudes are by construction.

**Key assumptions and limitations:**

- The tutorial uses a **simulated dataset**, not real-world data. The convergence parameters and variable relationships are set by the data-generating process, so the coefficient values should not be interpreted as empirical estimates of real-world growth dynamics.
- The **balanced panel** assumption simplifies the demeaning formula. With an unbalanced panel, the demeaning formula is the same algebraically, but the iterative algorithm used by `fixest` becomes more practically important (simple mean subtraction may not converge in one pass).
- The **SE comparison** focuses on the df adjustment and clustering. Other SE corrections (heteroskedasticity-robust, Driscoll-Kraay for cross-sectional dependence) are not covered but may be relevant in applied work.
- Human capital is **not statistically significant** (p = 0.534). This is a feature of the simulated data, not a substantive finding about human capital's role in growth.
