# Results Report: Synthetic Control Method (SCM) Tutorial

**Script:** `analysis.do` (~540 lines)
**Executed:** 2026-04-27 13:29
**Status:** Success (zero errors)
**Runtime:** ~16 minutes
**Language:** Stata SE (running under Rosetta 2 on Apple Silicon)
**Key packages:** synth, synth2

---

## Execution Summary

The script applies the synthetic control method (Abadie, Diamond & Hainmueller, 2010) to evaluate whether California's Proposition 99 — a comprehensive tobacco control program enacted in January 1989 — reduced per capita cigarette sales. It uses a panel of 39 US states observed from 1970 to 2000 (1,209 observations) and constructs a synthetic California from a weighted combination of control states that best matches California's pre-treatment cigarette sales trajectory. The analysis proceeds in four stages: baseline SCM estimation, in-space placebo test (applying SCM to each control state as if it were treated), in-time placebo test (fake treatment in 1985), and leave-one-out robustness analysis (excluding each donor state one at a time).

The headline finding is an average treatment effect on the treated (ATT) of **-19.0 packs per capita** over the 12-year post-treatment period (1989-2000), meaning Proposition 99 reduced California's annual cigarette sales by approximately 19 packs per person relative to what would have occurred without the policy. The effect grew progressively larger, from -7.6 packs in the first year (1989) to -26.4 packs by 1999. The in-space placebo test confirms statistical significance (p = 0.05 using a cut-off filter, p = 0.026 using all controls), and the leave-one-out analysis demonstrates robustness across donor pool compositions.

**Warnings:** None. All four synth2 optimizations converged successfully.

---

## Data Overview

```
Observations: 1,209 (39 states x 31 years)
Variables: 7

    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
       state |      1,209          20    11.25929          1         39
        year |      1,209        1985    8.947973       1970       2000
     cigsale |      1,209    118.8932     32.7674       40.7      296.2
    lnincome |      1,014    9.861634    .1706769   9.397449   10.48662
        beer |        546     23.4304     4.22319        2.5       40.4
   age15to24 |        819     .175472    .0151589   .1294482   .2036753
    retprice |      1,209    108.3419    64.38199       27.3      351.2

Panel variable: state (strongly balanced)
Time variable: year, 1970 to 2000
```

**Interpretation:** The dataset is a strongly balanced panel of 39 US states observed annually from 1970 to 2000. Cigarette sales average 118.9 packs per capita (SD = 32.8) with a wide range from 40.7 to 296.2, reflecting substantial variation both across states and over time. The between-state variation in cigarette sales (SD = 26.5) exceeds the within-state variation (SD = 19.7), indicating meaningful cross-state differences in smoking patterns. Not all covariates are observed for the full panel: beer consumption is available for only 546 observations (14 years) and the age 15-24 share for 819 observations (21 years), but the synth2 command averages these over the specified xperiod (1980-1988) where data availability is good. California is encoded as state == 3, and the treatment onset is 1989, giving 19 pre-treatment years and 12 post-treatment years.

---

## Method Results

### Raw Trends: California vs. Donor Pool Average

Before 1989, California's cigarette sales broadly tracked the simple average of the 38 control states. After Proposition 99, California's sales diverge sharply downward while the donor pool average continues to decline more gradually.

**Interpretation:** The raw trends provide a first visual indication that California experienced an unusually large decline in cigarette consumption after 1989. However, a simple unweighted average of all 38 control states is a crude comparator because it includes states with very different smoking patterns (e.g., Kentucky at 213 packs vs. Utah at 64 packs per capita). The SCM improves on this by constructing a weighted combination of donor states that more closely matches California's pre-treatment trajectory, producing a more credible counterfactual. The raw trends figure motivates the need for the more rigorous SCM approach.

### Baseline SCM Estimate

```
Fitting results in the pretreatment periods:
 Treated Unit             : California     Treatment Time           : 1989
 Number of Control Units  =         38     Root Mean Squared Error  =    1.75567
 Number of Covariates     =          7     R-squared                =    0.97434

Covariate balance in the pretreatment periods:
   Covariate   |  V.weight    Treated    Synthetic Control     Average Control
               |                        Value          Bias   Value        Bias
---------------+----------------------------------------------------------------
      lnincome |   0.0000     10.0766      9.8588    -2.16%     9.8292    -2.45%
     age15to24 |   0.5459      0.1735      0.1735    -0.01%     0.1725    -0.59%
      retprice |   0.0174     89.4222     89.4108    -0.01%    87.2661    -2.41%
          beer |   0.0031     24.2800     24.2278    -0.21%    23.6553    -2.57%
 cigsale(1988) |   0.0049     90.1000     91.6677     1.74%   113.8237    26.33%
 cigsale(1980) |   0.0066    120.2000    120.5017     0.25%   138.0895    14.88%
 cigsale(1975) |   0.4221    127.1000    127.1112     0.01%   136.9316     7.74%

Optimal Unit Weights:
     Unit    |    U.weight
-------------+------------
        Utah |     0.3340
      Nevada |     0.2350
     Montana |     0.2020
    Colorado |     0.1610
 Connecticut |     0.0680

Prediction results in the posttreatment periods:
 Time | Actual Outcome  Synthetic Outcome  Treatment Effect
------+----------------------------------------------------
 1989 |       82.4000            89.9945           -7.5945
 1990 |       77.8000            87.5039           -9.7039
 1991 |       68.7000            82.1751          -13.4751
 1992 |       67.5000            81.6075          -14.1075
 1993 |       63.4000            81.1897          -17.7897
 1994 |       58.6000            80.7295          -22.1295
 1995 |       56.4000            78.5023          -22.1023
 1996 |       54.5000            77.4827          -22.9827
 1997 |       53.8000            77.7123          -23.9123
 1998 |       52.3000            74.3976          -22.0976
 1999 |       47.2000            73.5711          -26.3711
 2000 |       41.6000            67.3550          -25.7550
------+----------------------------------------------------
 Mean |       60.3500            79.3518          -19.0018
```

**Interpretation:** The synthetic control achieves an excellent pre-treatment fit with an R-squared of 0.9743 and RMSE of just 1.76 packs per capita, meaning the weighted combination of donor states reproduces 97.4% of the pre-treatment variation in California's cigarette sales. All seven predictors show very low bias between California and its synthetic counterpart: the largest discrepancy is log income at -2.16%, while cigarette sales in key years match within 1.74% or better. The two dominant V-weights are age 15-24 (0.546) and cigarette sales in 1975 (0.422), indicating these predictors drive the optimization. The synthetic California is composed of just five states: Utah (33.4%), Nevada (23.5%), Montana (20.2%), Colorado (16.1%), and Connecticut (6.8%), with all 33 remaining states receiving zero weight. After 1989, the treatment effect grows progressively from -7.6 packs in the first year to -26.4 packs by 1999, with the average ATT across the 12 post-treatment years equaling -19.0 packs per capita — a reduction of approximately 24% relative to the synthetic control's average of 79.4 packs.

### In-Space Placebo Test

```
In-space placebo test results using fake treatment units:
      Unit     |  Pre MSPE  Post MSPE   Post/Pre MSPE    Pre MSPE Ratio
    California |    3.1668   391.2533       123.5490           1.0000
       Georgia |    1.4610   116.8893        80.0074           0.4613
      Missouri |    1.2009    85.1794        70.9308           0.3792
      Virginia |    2.7825   219.8136        78.9994           0.8786
      Oklahoma |    5.7128   267.8078        46.8786           1.8040
         Texas |    4.6691   239.8559        51.3707           1.4744

Note: (1) Using all control units, the probability of obtaining a
      post/pretreatment MSPE ratio as large as California's is 0.0256.
      (2) Excluding control units with pretreatment MSPE 2 times larger than
      the treated unit, the probability is 0.0500.
      (4) There are total 19 units with pretreatment MSPE 2 times larger than
      the treated unit.

In-space placebo test results (continued, cutoff = 2):
 Time |  Treatment Effect      p-value of Treatment Effect
      |                     Two-sided   Right-sided   Left-sided
------+---------------------------------------------------------
 1989 |          -7.4201       0.0500       1.0000       0.0500
 1990 |          -9.5789       0.1000       0.9500       0.1000
 1991 |         -13.2182       0.1500       0.9000       0.1500
 1992 |         -13.9061       0.1000       0.9500       0.1000
 1993 |         -17.6228       0.0500       1.0000       0.0500
 1994 |         -21.9678       0.0500       1.0000       0.0500
 1995 |         -21.9083       0.0500       1.0000       0.0500
 1996 |         -22.8429       0.0500       1.0000       0.0500
 1997 |         -23.8174       0.0500       1.0000       0.0500
 1998 |         -21.8877       0.1000       0.9500       0.1000
 1999 |         -26.1950       0.0500       1.0000       0.0500
 2000 |         -25.5478       0.0500       1.0000       0.0500
```

**Interpretation:** The in-space placebo test applies the SCM to each of the 38 control states as if it were treated, generating a distribution of placebo effects. California's post/pre MSPE ratio of 123.5 dwarfs all other states — the next highest are Georgia (80.0), Virginia (79.0), and Missouri (70.9). Using all 39 states, the probability of obtaining a ratio as extreme as California's by chance is just 2.56% (p = 0.0256, equivalent to 1/39). After applying the cut(2) filter — which excludes 19 states with pre-treatment MSPE more than twice California's (3.17), ensuring only states with good pre-treatment fit are compared — the p-value rises to 0.05 (1/20 remaining states). The left-sided pointwise p-values (appropriate because the treatment effect is negative) equal 0.05 in 8 of 12 post-treatment years, with the remaining 4 years (1990, 1991, 1992, and 1998) showing p = 0.10--0.15, confirming that California's decline in cigarette sales is an outlier among states with comparable pre-treatment fit. The early years (1990-1992) show slightly weaker significance because the treatment effect is still building and smaller in magnitude.

### In-Time Placebo Test

```
Fitting results (fake treatment 1985):
 RMSE = 2.20530, R-squared = 0.95253, Covariates = 6

In-time placebo test results using fake treatment time 1985:
 Time | Actual Outcome  Synthetic Outcome  Treatment Effect
------+----------------------------------------------------
 1985 |      102.8000           106.1262           -3.3262
 1986 |       99.7000           103.2850           -3.5850
 1987 |       97.5000           106.1524           -8.6524
 1988 |       90.1000            98.4873           -8.3873
------+----------------------------------------------------
Real treatment period (1989-2000):
 1989 |       82.4000            96.5237          -14.1237
 ...
 2000 |       41.6000            67.1861          -25.5861
------+----------------------------------------------------
 Mean |       69.6437            85.2092          -15.5654
```

**Interpretation:** The in-time placebo test assigns a fake treatment date of 1985 — four years before the actual intervention — to check whether the model detects a spurious effect in a period when no policy change occurred. The fake treatment effects between 1985 and 1988 are -3.3 to -8.7 packs per capita (average -6.0), substantially smaller than the real post-1989 effects of -14.1 to -25.6 packs (average -17.7). The non-zero fake effects warrant some attention: they range from -3.3 packs at 1985 (a 3.1% discrepancy) to -8.7 packs at 1987 (8.2%), suggesting that the synthetic control's pre-treatment fit is imperfect when the training period is shortened to 1980-1984 (5 years instead of 9). This is reflected in the lower R-squared (0.9525 vs. 0.9743 for the baseline) and higher RMSE (2.21 vs. 1.76). Notably, the donor pool composition shifts: Montana drops out and New Mexico enters (5.0%), indicating the synthetic control is somewhat sensitive to the predictor window. Despite these caveats, the key finding holds: the real treatment effects after 1989 are 2-4 times larger than the fake effects, and the gap widens sharply at 1989, consistent with a genuine policy effect rather than a pre-existing trend.

### Leave-One-Out Robustness

```
Leave-one-out robustness test results in the posttreatment period:
 Time |         Outcome         Synthetic Outcome (LOO)
      |     Actual   Synthetic         Min         Max
------+------------------------------------------------
 1989 |    82.4000     89.7304     88.3892     92.3509
 1990 |    77.8000     87.3001     83.5373     89.2205
 1991 |    68.7000     81.8829     80.8905     82.4889
 1992 |    67.5000     81.4287     80.6239     81.8815
 1993 |    63.4000     81.0450     79.7801     82.0592
 1994 |    58.6000     80.6229     78.6141     83.3112
 1995 |    56.4000     78.4191     75.9901     81.3864
 1996 |    54.5000     77.4316     75.0801     80.5833
 1997 |    53.8000     77.7288     71.7877     84.4150
 1998 |    52.3000     74.3255     71.1668     79.0314
 1999 |    47.2000     73.4654     71.5421     77.5396
 2000 |    41.6000     67.2107     65.0850     69.9503

Treatment Effect LOO:
 Time |    Treatment Effect   Treatment Effect (LOO)
      |                              Min           Max
------+------------------------------------------------
 1989 |            -7.3304       -9.9509       -5.9892
 1994 |           -22.0229      -24.7112      -20.0141
 1997 |           -23.9288      -30.6150      -17.9877
 2000 |           -25.6107      -28.3503      -23.4850
```

**Interpretation:** The leave-one-out analysis re-estimates the SCM after excluding each of the five donor states with nonzero weight (Utah, Nevada, Montana, Colorado, Connecticut) one at a time. The treatment effect estimates remain qualitatively similar across all iterations: in every year, the LOO range stays negative and substantial. For the year 2000, the baseline effect is -25.6 packs and the LOO range is [-28.4, -23.5], a spread of 4.9 packs or about 19% of the baseline estimate. The widest variation occurs in 1997, where the LOO range spans from -30.6 to -18.0 (spread of 12.6 packs), likely driven by removing Nevada (which has the second-largest weight at 23.8% in this specification). In no year does any LOO iteration produce a treatment effect near zero, confirming that the finding of a large negative treatment effect is not driven by any single donor state. The overall LOO ATT is -18.87 packs per capita, very close to the baseline ATT of -19.00.

### LOO Frame Inspection

```
Contains data
 Observations: 1,209    Variables: 23

Key variables:
  pred-cigsale       - Baseline prediction
  tr-cigsale         - Baseline treatment effect
  pred-cigsale-rm*   - Prediction excluding [state]
  tr-cigsale-rm*     - Treatment effect excluding [state]
  pred-cigsale-min/max - Min/max LOO predictions
  tr-cigsale-loo-min/max - Min/max LOO treatment effects
```

**Interpretation:** The LOO results are stored in a Stata frame named "california" containing the original 1,209 observations augmented with 16 additional variables: two for the baseline prediction and treatment effect, ten for the five individual LOO iterations (prediction and treatment effect for each excluded state), and four for the minimum and maximum LOO predictions and treatment effects. This frame enables researchers to perform custom post-hoc analyses, such as plotting individual LOO trajectories or computing confidence bands, without re-running the computationally expensive optimization.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `stata_sc_raw_trends.png` | Line plot of California (solid steel blue) vs. donor pool average (dashed grey) cigarette sales, 1970-2000, with vertical dashed orange line at 1989 | California tracks the pool average before 1989, then diverges sharply downward — visual motivation for SCM |
| 2 | `stata_sc_pred.png` | California actual vs. synthetic California cigarette sales (packs per capita), 1970-2000 | Near-perfect pre-treatment overlap (R^2 = 0.974); post-1989, actual California falls well below synthetic, with the gap widening each year |
| 3 | `stata_sc_eff.png` | Treatment effect (actual minus synthetic) over time, with zero reference line | Effect starts at -7.6 packs (1989) and deepens to -26.4 (1999), showing the policy's impact grew stronger over the decade |
| 4 | `stata_sc_bias.png` | Pre-treatment mean squared prediction error (MSPE) visualization | Low pre-treatment MSPE (3.17) confirms the synthetic control closely reproduces California's pre-1989 sales trajectory |
| 5 | `stata_sc_weight_unit.png` | Bar chart of donor state weights in the synthetic control | Five states dominate: Utah (33.4%), Nevada (23.5%), Montana (20.2%), Colorado (16.1%), Connecticut (6.8%); all others zero |
| 6 | `stata_sc_weight_vars.png` | Bar chart of predictor (V-matrix) weights | Two predictors dominate: age 15-24 (V = 0.546) and cigsale(1975) (V = 0.422); log income receives near-zero weight |
| 7 | `stata_sc_eff_pboUnit.png` | Spaghetti plot of treatment effects for California (bold) and all placebo states (grey lines), 1970-2000 | California's effect line is a clear negative outlier; most placebo lines fluctuate near zero or show small positive/negative deviations |
| 8 | `stata_sc_ratio_pboUnit.png` | Bar chart ranking all states by post/pre MSPE ratio | California's ratio (123.5) is the highest among all states with comparable pre-treatment fit, far exceeding the next-highest (Georgia at 80.0) |
| 9 | `stata_sc_pvalTwo_pboUnit.png` | Two-sided Fisher exact p-values over the post-treatment period | p = 0.05 in 9 of 12 years, confirming California's effect is significant regardless of assumed direction |
| 10 | `stata_sc_pvalRight_pboUnit.png` | Right-sided p-values (tests for positive effect) over time | All p-values equal 0.95 or 1.00, confirming no evidence of a sales increase — as expected |
| 11 | `stata_sc_pvalLeft_pboUnit.png` | Left-sided p-values (tests for negative effect) over time | p = 0.05 in 9 of 12 years; the 3 weaker years (1990-1992, 1998) have p = 0.10-0.15, reflecting the smaller early-period effects |
| 12 | `stata_sc_pred_pboTime1985.png` | California actual vs. synthetic for the in-time placebo test, with fake treatment at 1985 | Lines remain relatively close during 1985-1988 (fake period), then diverge sharply after 1989 (real treatment) |
| 13 | `stata_sc_eff_pboTime1985.png` | Treatment effect for the in-time placebo, with fake 1985 treatment date marked | Small effects (-3 to -9 packs) during 1985-1988; large effects (-14 to -26 packs) after 1989, confirming no spurious pre-treatment effect |
| 14 | `stata_sc_loo_combined.png` | Combined multi-panel graph showing LOO synthetic control fits excluding each donor state | All five panels show similar predicted vs. actual patterns, confirming no single donor state drives the treatment effect estimate |

---

## Key Findings

1. **Proposition 99 reduced California's cigarette sales by an average of 19.0 packs per capita:** Over the 12-year post-treatment period (1989-2000), the ATT averaged -19.0 packs per capita, representing a 24% reduction relative to the synthetic control's average of 79.4 packs. By 2000, California's actual sales (41.6 packs) were 25.8 packs below the counterfactual (67.4 packs), a 38% gap.

2. **The treatment effect grew progressively stronger over the 1990s:** The effect started at -7.6 packs in 1989 and deepened to -26.4 packs by 1999, suggesting that the tobacco control program's impact compounded over time — consistent with cumulative behavioral change and declining social acceptability of smoking. The effect plateaued around -25 to -26 packs in 1999-2000.

3. **The synthetic control achieves excellent pre-treatment fit (R-squared = 0.974):** With an RMSE of just 1.76 packs per capita, the weighted combination of five donor states reproduces 97.4% of the pre-treatment variation in California's cigarette sales. All seven predictor biases are below 2.2%, with five below 0.3%.

4. **Only five states compose synthetic California, with Utah dominant at 33.4%:** The synthetic control is a sparse combination of Utah (33.4%), Nevada (23.5%), Montana (20.2%), Colorado (16.1%), and Connecticut (6.8%). All 33 other states receive zero weight. This reflects the SCM's tendency to select states with similar pre-treatment outcome trajectories rather than geographic proximity.

5. **California's effect is statistically significant (p = 0.026 using all controls, p = 0.05 with cut-off):** The in-space placebo test ranks California's post/pre MSPE ratio (123.5) as the highest among all 39 states. Using the full donor pool, the p-value is 0.026 (1/39); with the cut(2) filter excluding 19 states with poor pre-treatment fit, the p-value is 0.050 (1/20).

6. **The in-time placebo test confirms no spurious pre-treatment effect:** Assigning a fake treatment at 1985 produces small effects of -3.3 to -8.7 packs during 1985-1988, while the real post-1989 effects are 2-4 times larger (-14.1 to -25.6 packs). The fake-period effects are not exactly zero (averaging -6.0 packs), reflecting imperfect fit when the training window is shortened, but they are qualitatively different from the large post-1989 effects.

7. **Leave-one-out analysis shows robust estimates across donor pool compositions:** Excluding each of the five weighted donor states one at a time, the year-2000 treatment effect ranges from -23.5 to -28.4 packs (baseline: -25.6), a spread of 4.9 packs. No single state's exclusion eliminates or substantially diminishes the treatment effect. The overall LOO ATT (-18.87) is within 0.13 packs of the baseline ATT (-19.00).

---

## Surprises and Caveats

- **Borderline p-value with cut(2) filter:** The in-space placebo p-value is exactly 0.05 with the cut(2) filter — right at the conventional significance threshold. This is a mechanical consequence of having 20 states with acceptable pre-treatment fit: California ranks 1st, giving p = 1/20 = 0.05. The unfiltered p-value (0.026) is more conservative. The blog post should present both and note that SCM inference is inherently limited by the small number of comparison units.

- **Non-zero in-time placebo effects:** The fake treatment effects at 1985 are not negligible (-3.3 to -8.7 packs, average -6.0). While substantially smaller than the real effects, they suggest the synthetic control is sensitive to the predictor window length. The shortened training period (1980-1984 instead of 1980-1988) reduces R-squared from 0.974 to 0.953 and changes the donor composition (Montana drops out, New Mexico enters at 5.0%). The blog post should acknowledge this imperfection and emphasize that the key evidence is the sharp discontinuity at 1989, not the absolute magnitude of pre-1989 effects.

- **Sparse donor pool (5 of 38 states):** Only five states contribute to synthetic California, with 33 states receiving zero weight. This is typical of SCM but means the counterfactual depends heavily on a small number of states. Utah alone accounts for one-third of the synthetic control. If Utah's cigarette market experienced idiosyncratic shocks in the 1990s (e.g., due to its Mormon population's distinct smoking norms), the treatment effect estimate could be biased.

- **ATT varies slightly across specifications:** The baseline ATT is -19.00, the in-space placebo re-estimation gives -18.83, the in-time placebo gives -17.71, and the LOO gives -18.87. These differences (up to 1.3 packs) reflect variation in the optimization starting points and predictor sets (the in-time placebo drops cigsale(1988) and shortens xperiod). The consistency across specifications is reassuring but the blog post should note that SCM point estimates are not perfectly invariant to specification choices.

- **Widest LOO variation occurs in 1997:** The LOO treatment effect in 1997 ranges from -18.0 to -30.6 packs (spread of 12.6), compared to 4.9 packs in 2000. This suggests that mid-1990s estimates are more sensitive to donor composition than end-of-period estimates, possibly because individual donor states' cigarette markets diverged more during this period.

- **No standard errors or confidence intervals:** Unlike regression-based methods, the SCM does not produce standard errors or confidence intervals for the treatment effect. Inference relies entirely on the placebo-based permutation approach, which has limited statistical power with only 20 comparison units (after cut-off). The blog post should discuss this limitation and note that recent advances (e.g., conformal inference for SCM) offer more formal inference frameworks.
