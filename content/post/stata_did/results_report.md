# Results Report: Difference-in-Differences (DiD) Tutorial

**Script:** `analysis.do` (525 lines)
**Executed:** 2026-04-26 11:26
**Status:** Success
**Runtime:** ~11 seconds
**Language:** Stata 18 MP
**Key packages:** diff_plot, diff, ftools, reghdfe, panelview, eventdd, matsort, outreg2

---

## Execution Summary

The script introduces the Difference-in-Differences (DiD) research design through a case study from Corral & Yang (2024): evaluating an after-school tutoring program's effect on low-income students' GPA. It uses two pre-built simulated datasets (2x2 and event study) to demonstrate the full DiD workflow: from naive before-after comparison through regression-based TWFE estimation to dynamic event study analysis. The script runs five distinct regression approaches, replicates two publication tables, and generates six figures.

The headline finding is a DiD estimate of approximately 25.32 GPA points (ATT), meaning the after-school program increased treated schools' average GPA by about 25 points on a 0-100 scale. This result is robust across all estimation methods and confirmed by the event study's dynamic treatment effects.

**Warnings:** 7 collinearity notes from `eventdd` (expected -- `i.time` dummies absorbed by time fixed effects in reghdfe). No errors.

---

## Data Overview

### 2x2 DiD Dataset (`tutoring_did.dta`)

```
Observations: 70 (35 schools x 2 periods)
Variables: 7

    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
          id |         70          18    10.17243          1         35
        time |         70         1.5    .5036102          1          2
     treated |         70    .2857143    .4550158          0          1
         gpa |         70    77.11754    10.87694   59.39085   99.15061
female_share |         70    .5279242    .0265513   .4712442   .5695165

Panel variable: id (strongly balanced)
Time variable: time, 1 to 2
```

### Event Study Dataset (`tutoring_didevent.dta`)

```
Observations: 280 (35 schools x 8 periods)
Variables: 8

    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
          id |        280          18    10.11759          1         35
        time |        280         4.5     2.29539          1          8
     treated |        280    .2857143    .4525628          0          1
         gpa |        280    80.14277    12.19731   60.07783    107.677
 timeToTreat |         80         -.5    2.305744         -4          3

Panel variable: id (strongly balanced)
Time variable: time, 1 to 8
```

**Interpretation:** The 2x2 dataset covers 35 schools observed at two time points, with 10 treated schools (28.6%) receiving the after-school tutoring program and 25 comparison schools. The panel is strongly balanced with no missing data. GPA ranges from 59.4 to 99.2 (mean 77.1, SD 10.9), reflecting substantial variation. The between-school GPA variation (SD = 1.12) is much smaller than the within-school variation (SD = 10.82), indicating that most GPA variation comes from the treatment effect over time rather than baseline differences across schools. The female share averages 52.8% with very low variation (SD = 2.7%), making it a weak predictor of GPA. The event study dataset extends this to 8 time periods (4 pre, 4 post), with `timeToTreat` ranging from -4 to +3 relative to treatment onset, defined only for the 10 treated schools (80 observations).

---

## Method Results

### Interrupted Time Series (ITS) -- Naive Comparison

The treated group's average GPA jumped from approximately 60.17 (pre-program) to 96.37 (post-program), a raw increase of about 36.20 GPA points.

**Interpretation:** A naive before-after comparison for the treated group alone suggests a 36-point GPA improvement. However, this estimate is biased because it ignores secular time trends -- students' GPA may naturally improve over time (maturation) regardless of the intervention. Without a comparison group, we cannot distinguish the program's causal effect from these confounding time trends. The DiD design addresses this by using the comparison group's change to net out the natural time trend.

### 2x2 DiD Means Table (Table 1)

```
                               |     Pre         Post        Diff
-----------------------------------------------+-------------------
  Control (25 schools)         |    71.22        82.10       10.88
  Treated (10 schools)         |    60.17        96.37       36.20
-----------------------------------------------+-------------------
  DiD estimate                 |                             25.32
```

**Interpretation:** The comparison group's GPA also increased, from 71.22 to 82.10 (a gain of 10.88 points), reflecting the natural time trend that would have occurred even without the program. Subtracting this secular trend from the treated group's 36.20-point gain yields the DiD estimate of 25.32 GPA points -- the causal effect attributable to the after-school program. This is about 30% lower than the naive ITS estimate (36.20), demonstrating that roughly one-third of the treated group's raw improvement was due to natural maturation captured by the comparison group. The treated schools started with a lower baseline GPA (60.17 vs. 71.22), suggesting the program targeted schools with greater academic need.

### DiD via diff Command

```
DIFFERENCE-IN-DIFFERENCES ESTIMATION RESULTS
--------------------------------------------
Number of observations in the DIFF-IN-DIFF: 70
            Before         After    
   Control: 25             25          50
   Treated: 10             10          20

 Outcome var.   | gpa     | S. Err. |   |t|   |  P>|t|
----------------+---------+---------+---------+---------
Before
   Diff (T-C)   | -11.049 | 0.443   | -24.94  | 0.000***
After
   Diff (T-C)   | 14.266  | 0.443   | 32.20   | 0.000***

Diff-in-Diff    | 25.315  | 0.627   | 40.40   | 0.000***
R-square:    0.99
```

**Interpretation:** The `diff` command confirms the manual calculation with a DiD estimate of 25.315 (SE = 0.627, t = 40.40, p < 0.001). The effect is highly statistically significant and precisely estimated. Before the program, treated schools' GPA was 11.05 points lower than control schools (p < 0.001), but after the program, treated schools' GPA was 14.27 points higher than control schools (p < 0.001). This reversal from a significant deficit to a significant advantage represents one of the most compelling patterns in the data. The R-squared of 0.99 indicates that the DiD model explains virtually all variation in GPA, expected in simulated data with a strong treatment effect and low residual noise.

### Classical DiD Regression (OLS with Interaction)

```
Y = alpha + B1*Treat + B2*Post + B3*(Treat x Post) + e

         gpa | Coefficient  std. err.      t    P>|t|     [95% conf. interval]
-------------+----------------------------------------------------------------
     treated |  -11.04936   .2878309   -38.39   0.000    -11.62404   -10.47469
        post |   10.88589   .3389564    32.12   0.000     10.20915    11.56264
         txp |    25.3149   .6149733    41.16   0.000     24.08706    26.54273
       _cons |   71.21514   .2183689   326.12   0.000     70.77915    71.65113
```

**Interpretation:** The classical regression decomposes the DiD into its constituent parts. The constant (71.22) is the control group's pre-period mean GPA. The `treated` coefficient (-11.05) shows that treated schools started with 11 fewer GPA points than control schools at baseline. The `post` coefficient (10.89) captures the natural time trend -- both groups' GPA increased by about 11 points over time. The interaction term `txp` (25.31, SE = 0.61, 95% CI: [24.09, 26.54]) is the DiD estimate, showing that the program caused an additional 25.31-point improvement on top of the natural trend. All coefficients are highly significant (p < 0.001), and the tight 95% CI (width of 2.46 points) indicates precise estimation.

### Stata Built-in DiD (`didregress`, Stata 17+)

```
Difference-in-differences regression                        Number of obs = 70
Data type: Repeated cross-sectional

ATET
   txp (1 vs 0)  |    25.3149   .8337103    30.36   0.000     23.62059     27.0092
```

**Interpretation:** Stata's built-in `didregress` command produces an identical point estimate (25.31) but with a slightly larger standard error (0.83 vs. 0.61 from OLS) because it automatically clusters standard errors at the school level (35 clusters). The estimate is explicitly labeled as ATET (Average Treatment Effect on the Treated), confirming the estimand. The wider 95% CI [23.62, 27.01] still excludes zero by a large margin, confirming statistical significance even with the more conservative clustered inference.

### Two-Way Fixed Effects (TWFE) -- xtreg and reghdfe

```
--- xtreg (standard TWFE, clustered SEs) ---
         txp |    25.3149   .5851062    43.27   0.000     24.12582    26.50398

--- reghdfe (high-dimensional TWFE, clustered SEs) ---
         txp |    25.3149   .5851062    43.27   0.000     24.12582    26.50398
```

**Interpretation:** Both TWFE implementations -- `xtreg` (classic within estimator) and `reghdfe` (high-dimensional FE, faster for large datasets) -- produce identical results: a DiD estimate of 25.31 with clustered SEs of 0.585 and a 95% CI of [24.13, 26.50]. The TWFE approach replaces the explicit `treated` and `post` dummies with unit and time fixed effects, which absorb all time-invariant school characteristics and common time shocks. The within R-squared of 0.9814 indicates that the treatment interaction alone explains 98.1% of the within-school variation in GPA after removing fixed effects. The `xtreg` output also shows that 95.2% of GPA variance (rho = 0.9525) is due to between-school differences (sigma_u = 5.14) rather than within-school residual variation (sigma_e = 1.15).

### TWFE with Covariate (female_share)

```
         txp |   25.32806   .6047651    41.88   0.000     24.09903    26.55709
female_share |  -3.216239   8.700428    -0.37   0.714    -20.89764    14.46516
```

**Interpretation:** Adding the share of female students as a control variable has virtually no effect on the DiD estimate, which shifts from 25.31 to 25.33 (a change of ~0.01 points). The female_share coefficient itself is not statistically significant (coeff = -3.22, p = 0.71), confirming it is not a meaningful predictor of GPA in this simulated dataset. This is expected because female_share has very low variation (SD = 2.7%) and is exogenous to the treatment. The result demonstrates that in well-designed DiD settings, adding covariates that are unrelated to treatment assignment does not change the estimate but may slightly increase standard errors by consuming degrees of freedom.

### Table 2 Replication (3 Specifications)

```
Specification     | Coefficient | SE     | Controls | Clustered SEs
------------------+-------------+--------+----------+--------------
(1) Baseline TWFE |    25.31*** | 0.607  | No       | No
(2) + Covariate   |    25.33*** | 0.615  | Yes      | No
(3) + Clustered   |    25.31*** | 0.585  | No       | Yes

All: N=70, R-squared = 0.9947
```

**Interpretation:** The three specifications in Table 2 demonstrate the robustness of the DiD estimate across modeling choices. The point estimate is remarkably stable at 25.31-25.33 regardless of whether covariates are included or standard errors are clustered. In this simulated dataset, clustering at the school level actually reduces the standard error slightly (from 0.607 to 0.585), which is unusual -- in real-world applications, clustering typically inflates SEs because it accounts for within-school correlation of errors. The consistency across specifications strengthens the causal interpretation: the treatment effect is not sensitive to model specification.

### Event Study -- Dynamic Treatment Effects (Table 4)

```
Pre-treatment coefficients (leads):
    lead4 =   0.342  (SE = 0.401)  p = 0.400
    lead3 =  -0.322  (SE = 0.441)  p = 0.471
    lead2 =   0.593  (SE = 0.423)  p = 0.170

Post-treatment coefficients (lags):
    lag0  =  25.028  (SE = 0.445)  p = 0.000
    lag1  =  24.705  (SE = 0.559)  p = 0.000
    lag2  =  24.768  (SE = 0.739)  p = 0.000
    lag3  =  25.701  (SE = 0.797)  p = 0.000

N = 280, 35 schools, R-squared = 0.9913
```

**Interpretation:** The event study provides the strongest evidence for the causal effect of the tutoring program. All three pre-treatment coefficients (leads) are small in magnitude (ranging from -0.32 to 0.59) and statistically insignificant (all p > 0.10), providing compelling evidence that the parallel trends assumption holds -- treated and control schools were following similar GPA trajectories before the program began. In contrast, all four post-treatment coefficients (lags) are large (24.71 to 25.70) and highly significant (all p < 0.001), indicating an immediate and sustained effect of approximately 25 GPA points beginning at treatment onset. The consistency of the post-treatment coefficients (range of only 1.0 point across 4 periods) suggests a constant treatment effect with no fade-out or ramp-up, implying the program delivered its full benefit from the first period and maintained it throughout the observation window.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `stata_did_panelview_2x2.png` | Treatment timing heatmap for the 2x2 dataset showing 10 treated schools (IDs 26-35) switching from pre to post at time 2 | Clean treatment design: all treated schools receive the program simultaneously with no staggering |
| 2 | `stata_did_its.png` | Figure 1: Interrupted time series showing the treated group's GPA jumping from ~60 to ~96 across the red treatment line | Naive before-after comparison overstates the effect at ~36 points because it ignores natural time trends |
| 3 | `stata_did_counterfactual.png` | Figure 2: Three-line plot with treated (solid), comparison, and counterfactual (dashed) trends showing the DiD gap | The gap between the actual treated outcome (96.37) and the counterfactual (~71.05) visually represents the 25.32-point DiD estimate |
| 4 | `stata_did_diff_plot.png` | DiD plot from `diff_plot` showing both groups with labeled mean values (60.17, 71.22, 96.37, 82.10) and parallel trend dashed line | Intervention effect of 25.31 clearly labeled; the parallel trend line from treated pre to counterfactual post visualizes the assumption |
| 5 | `stata_did_panelview_event.png` | Treatment timing heatmap for the event study dataset showing treatment starting at period 5 across 8 time periods | Same 10 treated schools, now observed over 8 periods, enabling pre-trend assessment (periods 1-4) and dynamic effect estimation (periods 5-8) |
| 6 | `stata_did_event_study.png` | Figure 3: Event study plot with point estimates and 95% CIs for each lead and lag relative to treatment | Pre-treatment coefficients cluster around zero (supporting parallel trends); post-treatment coefficients jump to ~25 with tight CIs (confirming the causal effect) |

---

## Key Findings

1. **The after-school program increased GPA by 25.32 points (ATT):** The manual 2x2 DiD calculation shows that treated schools gained 36.20 points compared to the control group's 10.88-point gain, yielding a net treatment effect of 25.32 GPA points on a 0-100 scale. This represents a transformative improvement equivalent to moving from a D average (60) to nearly an A (96) for low-income students.

2. **The naive before-after comparison overstates the effect by 43%:** The simple ITS approach attributes the entire 36.20-point increase to the program, but 10.88 points (30% of the raw gain) are attributable to natural time trends captured by the comparison group. Without the DiD design, policymakers would overestimate the program's effectiveness by 10.88 GPA points.

3. **Five regression approaches produce identical estimates (25.31-25.33):** Classical OLS interaction, Stata's built-in `didregress`, standard TWFE (`xtreg`), high-dimensional TWFE (`reghdfe`), and TWFE with covariate all converge on the same DiD estimate, demonstrating the equivalence of these approaches in the standard 2x2 setting and confirming the robustness of the result.

4. **The parallel trends assumption is supported by the event study:** Pre-treatment coefficients (lead4 = 0.34, lead3 = -0.32, lead2 = 0.59) are all small and statistically insignificant (p = 0.40, 0.47, 0.17), providing evidence that treated and control schools followed similar GPA trajectories before the program. This strengthens the causal interpretation of the DiD estimate.

5. **The treatment effect is constant across post-treatment periods:** Event study lags range from 24.71 (lag1) to 25.70 (lag3), a span of less than 1 GPA point over four post-treatment periods. There is no evidence of fade-out (declining effect) or ramp-up (increasing effect), suggesting the program delivered its full benefit immediately and maintained it consistently.

6. **Adding covariates does not change the estimate:** Controlling for the share of female students shifts the DiD estimate by only 0.01 points (from 25.31 to 25.33), and the covariate itself is insignificant (p = 0.71). In this setting, the fixed effects already absorb all relevant confounding, making additional covariates unnecessary for identification.

7. **Clustering standard errors has minimal impact in this dataset:** School-level clustering changes the standard error from 0.607 (conventional) to 0.585 (clustered) -- a slight decrease. In practice, clustering typically increases SEs, but with only 35 schools and a very large effect size (t > 40), the inference is insensitive to the choice of standard error estimator.

---

## Surprises and Caveats

No unexpected results were found. The analysis uses simulated data with a known treatment effect of approximately 25 GPA points, and all estimation methods recover this effect precisely. Key caveats for the blog post:

- **Simulated data caveat:** The extremely high R-squared (0.99) and perfectly parallel pre-trends reflect the synthetic nature of the data. Real-world DiD applications typically show noisier data, imperfect parallel trends, and lower R-squared values. The blog post should note that this clean example is pedagogical -- real applications require more careful assumption checking.

- **Effect size caveat:** A 25-point GPA increase on a 100-point scale is unrealistically large for most educational interventions. Real after-school programs typically produce effect sizes of 0.1-0.3 standard deviations. The large effect makes the DiD mechanics easy to see visually but should not be taken as a realistic policy estimate.

- **Clustering note:** The finding that clustering decreases SEs is an artifact of the data simulation. In real panel data with school-level clustering, standard errors almost always increase when clustering is applied, sometimes substantially. The blog post should emphasize that clustering is essential in practice even when it appears to have little effect in this example.

- **Staggered treatment timing not covered:** The script focuses on the clean 2x2 case and the event study extension. It does not demonstrate staggered DiD (where treatment timing varies across units), which is a critical extension for real-world applications. The blog post should discuss this as a direction for future learning and reference the Callaway & Sant'Anna (2021) and Goodman-Bacon (2021) estimators.

- **SUTVA assumed but not tested:** The analysis assumes no spillovers between treated and control schools and consistent treatment across all 10 treated schools. In practice, students could transfer between schools or tutors could be shared, violating SUTVA. The blog post should discuss these assumptions explicitly.
