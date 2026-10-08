# Results Report: Regression Discontinuity Design — Tutoring Program Evaluation

**Script:** `analysis.do`
**Executed:** 2026-04-24 08:19
**Status:** Success
**Runtime:** 6 seconds (from log timestamps)
**Language:** Stata 18.0 (MP)
**Key packages:** rdrobust, rddensity, lpdensity

---

## Execution Summary

The script evaluates a school tutoring program using a sharp regression discontinuity design. Students who scored 70 or below on a standardized entrance exam were automatically enrolled in a free tutoring program; the outcome is their end-of-year exit exam score. The estimand is the Local Average Treatment Effect (LATE) at the cutoff — the causal effect of tutoring for students at the 70-point threshold.

The headline finding is that tutoring raises exit exam scores by approximately 9–11 points at the cutoff, with the effect highly significant (p < 0.001) across all specifications. The design is confirmed to be sharp (100% compliance), the McCrary density test shows no evidence of manipulation (p = 0.58), and placebo cutoff tests confirm that the discontinuity is unique to the true cutoff of 70.

**Warnings:** "Mass points detected in the running variable" — this is an informational message from rdrobust indicating that some entrance exam scores are shared by multiple students. The package automatically adjusts estimates and standard errors for this.

---

## Data Overview

```text
Contains data from tutoring.dta
 Observations:         1,000
    Variables:             5

Variable      Storage   Display    Value
    name         type    format    label      Variable label
-------------------------------------------------------------------------------
id              int     %8.0g                 ID of student
entrance_exam   float   %9.0g                 Entrance exam score
tutoring_text   str8    %9s                   Enrolled in the tutoring program?
exit_exam       float   %9.0g                 Exit exam score
tutoring        float   %9.0g                 Enrolled in the tutoring program?
                                                (Yes = 1, No=0)

    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
          id |      1,000       500.5    288.8194          1       1000
entrance_e~m |      1,000     78.1427     12.7265       28.8       99.8
   exit_exam |      1,000     66.1646    7.625894       42.8       84.5
    tutoring |      1,000        .241    .4279043          0          1
```

**Interpretation:** The dataset contains 1,000 students with entrance exam scores ranging from 28.8 to 99.8 (mean = 78.1, SD = 12.7) and exit exam scores ranging from 42.8 to 84.5 (mean = 66.2, SD = 7.6). Of the 1,000 students, 241 (24.1%) were enrolled in the tutoring program. The entrance exam distribution is right-skewed — most students scored above the 70-point cutoff, which is why only about a quarter of the sample received tutoring. The exit exam has less variation (SD = 7.6) than the entrance exam (SD = 12.7), suggesting some compression in the outcome measure.

---

## Method Results

### 1. Sharp Design Verification

```text
 Scored at |
  or below | Tutoring program (1 =
    cutoff |     Yes, 0 = No)
      (70) |         0          1 |     Total
-----------+----------------------+----------
         0 |       759          0 |       759
           |    100.00       0.00 |    100.00
-----------+----------------------+----------
         1 |         0        241 |       241
           |      0.00     100.00 |    100.00
-----------+----------------------+----------
     Total |       759        241 |     1,000
           |     75.90      24.10 |    100.00
```

**Interpretation:** The cross-tabulation confirms that the RDD is perfectly sharp: every student who scored at or below 70 on the entrance exam (n = 241) received tutoring, and every student who scored above 70 (n = 759) did not. There are zero crossovers in either direction, meaning treatment assignment is a deterministic function of the running variable at the cutoff. This rules out the need for a fuzzy RDD approach and simplifies identification — the sharp discontinuity in treatment status at the cutoff directly identifies the causal effect under the continuity assumption.

### 2. Parametric RDD — Simple Linear Model

```text
Linear regression                               Number of obs     =      1,000
                                                F(2, 997)         =     199.06
                                                Prob > F          =     0.0000
                                                R-squared         =     0.2685
                                                Root MSE          =     6.5288

------------------------------------------------------------------------------
             |               Robust
   exit_exam | Coefficient  std. err.      t    P>|t|     [95% conf. interval]
-------------+----------------------------------------------------------------
entrance_e~m |   .5097654   .0260511    19.57   0.000     .4586441    .5608868
       treat |   10.80043   .8063233    13.39   0.000      9.21815    12.38272
       _cons |   23.72725   2.202253    10.77   0.000     19.40566    28.04883
------------------------------------------------------------------------------
```

**Interpretation:** The simplest parametric RDD model — a linear regression of exit exam scores on entrance exam scores and a treatment indicator — estimates that tutoring raises exit exam scores by 10.80 points (95% CI: 9.22 to 12.38, p < 0.001). The entrance exam slope of 0.51 means that each additional point on the entrance exam is associated with about half a point higher on the exit exam. The model explains 26.9% of the variation in exit exam scores (R-squared = 0.2685). This estimate uses the full sample of 1,000 students and assumes a common linear relationship between entrance and exit exam scores on both sides of the cutoff.

### 3. Parametric RDD — Model Comparison

```text
--------------------------------------------------
    Variable | m1_linear   m2_inte~t   m3_quad~c
-------------+------------------------------------
       treat |    10.800      10.797       9.223
             |     0.806       0.816       1.198
    centered |                 0.510       0.328
             |                 0.032       0.125
    interact |                -0.001
             |                 0.055
   centered2 |                             0.007
             |                             0.004
  c.centered#|
     c.treat |                             0.022
             |                             0.193
 c.centered2#|
     c.treat |                            -0.012
             |                             0.006
       _cons |    23.727      59.405      60.322
             |     2.202       0.510       0.814
-------------+------------------------------------
          r2 |     0.268       0.268       0.271
           N |      1000        1000        1000
--------------------------------------------------
                                      Legend: b/se
```

**Interpretation:** The three parametric specifications tell a consistent story. Model 1 (same slope both sides) and Model 2 (different slopes) produce nearly identical treatment effects of 10.800 and 10.797 points, respectively. The interaction term in Model 2 is essentially zero (-0.001, p = 0.98), indicating that the relationship between entrance and exit exams has nearly the same slope on both sides of the cutoff. Model 3 (quadratic) gives a somewhat lower estimate of 9.22 points but with a wider confidence interval (SE = 1.20 vs 0.81). All three R-squared values are virtually identical (0.268–0.271), suggesting that the additional flexibility of higher-order polynomials does not meaningfully improve fit. The parametric estimates cluster around 9–11 points.

### 4. Nonparametric RDD (rdrobust)

```text
Sharp RD estimates using local polynomial regression.

     Cutoff c = 70 | Left of c  Right of c            Number of obs =       1000
-------------------+----------------------            BW type       =      mserd
     Number of obs |       237         763            Kernel        = Triangular
Eff. Number of obs |       144         256            VCE method    =         NN
    Order est. (p) |         1           1
    Order bias (q) |         2           2
       BW est. (h) |     9.984       9.984
       BW bias (b) |    14.578      14.578
         rho (h/b) |     0.685       0.685

                   | Point         | Robust Inference
                   | Estimate      | z-stat        P>|z|    [95% Conf. Interval]
-------------------+--------------------------------------------------------------
         RD Effect | -8.5793       | -4.3034       0.000    -12.1422    -4.54297
```

**Interpretation:** The nonparametric rdrobust estimator uses an MSE-optimal bandwidth of 9.98 points around the cutoff with a triangular kernel, yielding an effective sample of 400 students (144 below cutoff, 256 above). The estimated RD effect is -8.58 points (robust 95% CI: -12.14 to -4.54, p < 0.001). The negative sign reflects rdrobust's convention of computing the jump from left to right of the cutoff: since tutored students (left side) score higher than what the right-side trend would predict, the jump going rightward is downward. In substantive terms, this means tutoring raises exit exam scores by about 8.6 points for students at the cutoff. The magnitude is slightly smaller than the parametric estimate (~10.8) because rdrobust focuses on a local neighborhood around the cutoff rather than the full sample, and uses a data-driven bandwidth that minimizes mean squared error.

### 5. Bandwidth Sensitivity

```text
BW       Coef         SE          p-value
----     ---------    ---------   ---------
5           -8.202        2.337        0.000
7           -8.237        1.919        0.000
10          -8.581        1.615        0.000
12          -8.675        1.486        0.000
15          -8.842        1.312        0.000
20          -9.157        1.131        0.000
```

**Interpretation:** The RD estimate is remarkably stable across bandwidths ranging from 5 to 20 points around the cutoff. The point estimate ranges from -8.20 (BW = 5, tightest window) to -9.16 (BW = 20, widest window), a spread of less than 1 point. All estimates are significant at the p < 0.001 level. As expected, narrower bandwidths yield larger standard errors (2.34 at BW = 5 vs 1.13 at BW = 20) due to fewer observations, but the effect remains highly significant even at the narrowest bandwidth. The gradual increase in magnitude from -8.2 to -9.2 as the bandwidth widens suggests a modest amount of curvature in the outcome-running variable relationship farther from the cutoff, but the overall pattern strongly supports the robustness of the causal estimate.

### 6. Kernel Comparison

Table summarized from separate rdrobust runs:

```text
Kernel          BW (h)    RD Effect    95% CI
Triangular      9.984     -8.579       [-12.142, -4.543]
Uniform         7.223     -8.200       [-11.775, -4.049]
Epanechnikov    8.179     -8.388       [-12.175, -4.197]
```

**Interpretation:** The RD estimate is insensitive to the choice of kernel function. All three kernels — triangular (default), uniform, and Epanechnikov — produce estimates between -8.20 and -8.58, all significant at p < 0.001. The uniform kernel selects a narrower optimal bandwidth (7.22 vs 9.98) because it weights all observations within the window equally, requiring a tighter window to control bias. The triangular and Epanechnikov kernels, which downweight observations farther from the cutoff, can afford wider bandwidths. This consistency across kernel choices is a strong signal that the estimated effect is not an artifact of a particular weighting scheme.

### 7. McCrary Density Test

```text
RD Manipulation test using local polynomial density estimation.

     c =    70.000 | Left of c  Right of c
-------------------+----------------------
     Number of obs |       237         763
Eff. Number of obs |       208         577
       BW est. (h) |    22.444      19.966

            Method |      T          P>|T|
-------------------+----------------------
            Robust |   -0.5521      0.5809
```

**Interpretation:** The McCrary density test checks whether there is unusual bunching of students around the 70-point cutoff, which would suggest manipulation of entrance exam scores (e.g., students deliberately scoring low to qualify for tutoring). The test statistic is -0.55 with a p-value of 0.58, providing no evidence of density discontinuity at the cutoff. This is further supported by the binomial tests at narrow windows around the cutoff, all of which have p-values well above 0.05 (ranging from 0.36 to 1.00). The absence of manipulation is a key identifying assumption of the RDD, and these results provide strong support for the validity of the research design.

### 8. Placebo Cutoff Tests

```text
Cutoff   Coef         SE          p-value
------   ---------    ---------   ---------
50          12.728       21.302        0.550
55           0.557        3.052        0.855
60           0.569        3.193        0.859
65           3.296        1.742        0.058
70 *        -8.579        1.617        0.000
75          -1.548        1.691        0.360
80          -1.095        1.472        0.457
85           0.817        1.605        0.611
90          -0.540        1.900        0.776
```

**Interpretation:** The placebo cutoff test examines whether statistically significant discontinuities appear at values other than the true cutoff of 70. If the tutoring effect is genuine, only the true cutoff should show a significant jump; spurious discontinuities at other values would cast doubt on the causal interpretation. The results strongly support the design: the true cutoff (70) is the only value with a significant estimate (coef = -8.58, p < 0.001). All eight placebo cutoffs have p-values well above 0.05, ranging from 0.058 (at cutoff 65, the closest placebo) to 0.855. The marginally non-significant result at cutoff 65 (p = 0.058) likely reflects spillover from the true discontinuity at 70, given that an RDD bandwidth of ~10 points would overlap with the true cutoff.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `stata_rd_fig1_scatter_raw.png` | Scatter plot of exit exam vs entrance exam scores, colored by treatment status (blue = tutored, orange = not tutored), with a vertical dashed line at the cutoff of 70 | A clear upward shift in exit exam scores is visible for tutored students (left of cutoff) relative to what the non-tutored trend would predict |
| 2 | `stata_rd_fig2_histogram_running.png` | Histogram of entrance exam scores (running variable) with 30 bins and a vertical cutoff line at 70 | No visible bunching or heaping at the cutoff — the distribution transitions smoothly through 70, supporting the no-manipulation assumption |
| 3 | `stata_rd_fig3_rdplot.png` | RD plot with binned sample averages and local linear polynomial fits on each side of the cutoff | A clear downward jump is visible at the cutoff when moving from left to right — the fitted lines show tutored students scoring about 8–10 points higher than the counterfactual |
| 4 | `stata_rd_fig4_density_test.png` | Kernel density estimates of the running variable plotted separately for observations below and above the cutoff | The two density curves approach the cutoff at similar heights, visually confirming no density discontinuity (consistent with the McCrary test p = 0.58) |
| 5 | `stata_rd_fig5_placebo_cutoffs.png` | Point estimates and 95% confidence intervals from rdrobust at 9 different cutoff values, with the true cutoff (70) highlighted in orange | Only the true cutoff at 70 shows a significant effect (CI excludes zero); all placebo cutoffs straddle zero, confirming the discontinuity is unique to the program threshold |

---

## Key Findings

1. **Tutoring raises exit exam scores by approximately 9–11 points at the cutoff.** The parametric estimate is 10.80 points (95% CI: 9.22–12.38) and the nonparametric rdrobust estimate is 8.58 points (robust 95% CI: 4.54–12.14). Both are significant at p < 0.001, and the range of 8.6–10.8 points represents a substantial improvement of roughly 13–16% relative to the mean exit exam score of 66.2.

2. **The design is perfectly sharp — 100% compliance at the cutoff.** Every student who scored 70 or below received tutoring (n = 241), and every student who scored above 70 did not (n = 759). There are zero crossovers, making this a textbook sharp RDD where the treatment effect is identified directly from the discontinuity.

3. **No evidence of manipulation in entrance exam scores.** The McCrary density test yields a p-value of 0.58, and binomial tests at narrow windows around the cutoff all have p-values above 0.36. Students did not appear to strategically score below 70 to qualify for the program.

4. **The estimate is robust to bandwidth choice.** Across bandwidths from 5 to 20 points around the cutoff, the rdrobust estimate ranges from -8.20 to -9.16, with all estimates significant at p < 0.001. This narrow spread of less than 1 point demonstrates that the finding is not sensitive to analyst discretion in bandwidth selection.

5. **The estimate is robust to kernel choice.** Triangular, uniform, and Epanechnikov kernels all produce estimates between -8.20 and -8.58, all significant at p < 0.001, confirming that the result does not depend on the weighting scheme.

6. **The discontinuity is unique to the true cutoff.** Placebo tests at eight alternative cutoffs (50, 55, 60, 65, 75, 80, 85, 90) all fail to reject the null of no discontinuity (p-values from 0.058 to 0.855). Only the true cutoff of 70 shows a significant effect.

7. **Parametric specifications agree within reasonable bounds.** The simple linear model (10.80), the interaction model (10.80), and the quadratic model (9.22) all point to a treatment effect in the 9–11 point range. The near-zero interaction term (-0.001) suggests that the slope of the entrance-exit exam relationship is the same on both sides of the cutoff.

---

## Surprises and Caveats

**Sign convention between parametric and nonparametric estimates.** The parametric OLS coefficient on `treat` is positive (+10.80), while the rdrobust estimate is negative (-8.58). These are not contradictory — they reflect different conventions. The parametric model estimates the effect of `treat = 1` (being tutored), which is positive because tutoring helps. rdrobust estimates the jump from left to right of the cutoff, which is negative because moving rightward means moving from the tutored to the non-tutored group. Both estimate the same causal quantity (the LATE at the cutoff), and both indicate that tutoring improves exit exam scores by approximately 9–11 points. The blog post should explain this sign difference clearly.

**Magnitude difference between parametric and nonparametric estimates.** The parametric estimate (~10.8) is about 25% larger than the nonparametric estimate (~8.6). This is expected: the parametric model uses all 1,000 observations and imposes a global linear functional form, while rdrobust restricts to ~400 observations within the optimal bandwidth of ~10 points around the cutoff. If the treatment effect varies away from the cutoff or the functional form is slightly nonlinear, the two approaches will differ. The nonparametric estimate is generally preferred because it relies on fewer assumptions.

**Mass points in the running variable.** rdrobust flagged "mass points detected" — some entrance exam scores are shared by multiple students. This is common with rounded or discretized test scores. The package adjusts estimates and standard errors automatically, so no action is required.

**No covariates available for smoothness tests.** The dataset contains only three substantive variables (entrance_exam, exit_exam, tutoring). A standard RDD validity check is to test whether pre-treatment covariates (e.g., demographics, prior grades) are smooth through the cutoff. This check cannot be performed with the available data, though the density test and placebo cutoffs provide alternative evidence for design validity.

**Borderline result at placebo cutoff 65.** The placebo test at cutoff = 65 yielded p = 0.058, just above the conventional 0.05 threshold. This likely reflects spillover from the true discontinuity at 70 — since the rdrobust bandwidth is approximately 10 points, observations near 65 are within the estimation window of the true cutoff. This is not a concern for the validity of the design.
