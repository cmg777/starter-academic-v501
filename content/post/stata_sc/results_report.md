# Results Report: Synthetic Control Method (SCM) Tutorial

- **Script:** `analysis.do` (about 555 lines)
- **Executed:** 2026-04-27 13:29 (original run); rerun on 2026-10-05 12:01 after the text corrections, with every estimate identical
- **Status:** success, with no errors
- **Runtime:** about 15 minutes
- **Language:** Stata 19 SE (machine type: Macintosh, Intel 64-bit)
- **Key packages:** synth 0.0.7 and synth2 2.1.0

---

## Execution Summary

The script applies the synthetic control method of Abadie, Diamond, and Hainmueller (2010) to Proposition 99 in California. This comprehensive tobacco control program took effect in January 1989, and the question is whether it reduced per capita cigarette sales. The data form a panel of 39 US states observed from 1970 to 2000, for a total of 1,209 observations. The script builds a synthetic California as the weighted combination of the 38 other states that best reproduces the pre-treatment predictors of California. The analysis proceeds in four stages. The first stage estimates the baseline synthetic control. The second stage runs an in-space placebo test, which treats each control state as if it had adopted the policy. The third stage runs an in-time placebo test with a fake treatment date of 1985. The fourth stage is a leave-one-out analysis, which drops each of the five donor states with positive weight, one at a time.

The headline estimate is an average treatment effect on the treated (ATT) of **−19.00 packs per capita** over the 12 post-treatment years, 1989–2000. In other words, annual sales in California were about 19 packs per person below the synthetic counterfactual, which approximates sales without the policy. The gap widens from −7.59 packs in 1989 to −26.37 packs in 1999, although it does not widen in every year. In the in-space placebo test, California ranks first in the placebo distribution. This rank gives p = 0.026 with all 39 units and p = 0.050 with the 20 units that pass the cut(2) filter. In the leave-one-out analysis, every yearly gap stays negative when any one of the five positive-weight donors is removed.

**Warnings:** The run produced no warnings. All four synth2 calls ended with the message "Finished." The log also reports no errors.

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

**Interpretation:** The dataset is a strongly balanced panel of 39 US states observed annually from 1970 to 2000. Cigarette sales average 118.9 packs per capita (SD = 32.8). They range from 40.7 to 296.2 packs, so they vary widely across states and over time. The between-state standard deviation of sales (26.5) exceeds the within-state standard deviation (19.7), which indicates persistent differences in smoking across states. Not all covariates cover the full panel. Beer consumption is observed only from 1984 to 1997 (546 observations, 14 years). The share of the population aged 15–24 is observed only from 1970 to 1990 (819 observations, 21 years). Log GDP per capita is observed from 1972 to 1997 (1,014 observations, 26 years). The synth2 command averages each covariate over the years in which it is observed within the 1980–1988 window. The beer average therefore rests on 1984–1988 alone. California is encoded as state == 3. Treatment begins in 1989, which leaves 19 pre-treatment years and 12 post-treatment years.

---

## Method Results

### Raw Trends: California vs. Donor Pool Average

California sold slightly more cigarettes per capita than the simple average of the 38 control states in 1970, but less in every year from 1971 onward. The gap reached 9.83 packs in 1975 and 17.89 packs in 1980. It then stayed near 20 packs for most of the 1980s and reached 23.72 packs in 1988. After Proposition 99, sales in California fall even faster, while the donor average continues a more gradual decline.

**Interpretation:** The raw trends give a first indication that California experienced an unusually large decline in cigarette consumption after 1989. However, the unweighted average of the 38 control states is a crude comparator. It matches neither the level nor the trend of sales in California before 1989. It also mixes states with very different smoking levels. Average sales over 1970–2000 range from 213 packs per capita in New Hampshire to 64 packs in Utah. The SCM improves on this comparison by weighting the donor states so that their combination matches the pre-treatment predictors of California. The raw trends therefore motivate the more rigorous SCM approach.

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

**Interpretation:** The synthetic control reproduces the pre-treatment path of California closely, with a root mean squared error (RMSE) of 1.756 packs per capita. The synth2 command reports an R-squared of 0.974, but its formula divides by the variation of the synthetic series rather than the actual series. The conventional R-squared, computed with the same weights, is 0.976. The fit is close but not exact, because the largest pre-treatment gap is 5.88 packs, in 1970. Because synth2 prints no synthetic values before 1989, the conventional R-squared and the 1970 gap come from recomputing the 1970–1988 synthetic path with the five rounded weights. The script `build_web_app_data.py` in the post folder performs this calculation and checks it against the values that the log reports.

Six of the seven predictors are closely matched, and the three lagged sales values differ from those of California by at most 1.74%. Log GDP per capita is the exception. Its −2.16% bias compares logarithms, so synthetic California falls short by 0.22 log points (9.8588 against 10.0766). This shortfall implies a GDP per capita about 20% lower. The simple donor average misses by 0.25 log points. The SCM thus barely improves the income match, because income receives almost no V-weight. The largest predictor weights (V) go to the share of the population aged 15–24 (0.546) and to sales in 1975 (0.422). These V-weights are poorly identified: the placebo refit of the same model assigns 0.002 and 0.768 to the same two predictors.

Synthetic California combines just five states: Utah (33.4%), Nevada (23.5%), Montana (20.2%), Colorado (16.1%), and Connecticut (6.8%). The remaining 33 states receive zero weight. After 1989, the gap widens from −7.59 packs in 1989 to −26.37 packs in 1999. The path is not monotonic, however, since the gap narrows from −23.91 packs in 1997 to −22.10 packs in 1998. Over the 12 post-treatment years, the ATT is −19.00 packs per capita. This effect equals about 24% of the average synthetic value of 79.4 packs.

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

**Note on the excerpt:** The table above abridges the log, and its rows are not sorted by the MSPE ratio. Sorted by ratio, the six units are California (123.5), Georgia (80.0), Virginia (79.0), Missouri (70.9), Texas (51.4), and Oklahoma (46.9). The log labels the last column as the pre-treatment MSPE of each unit divided by that of California. The excerpt shortens this label to Pre MSPE Ratio.

**Interpretation:** The in-space placebo test applies the SCM to each of the 38 control states as if it had been treated. This exercise yields a distribution of placebo effects. California has the largest ratio of post-treatment to pre-treatment MSPE, 123.5, well above Georgia (80.0), Virginia (79.0), and Missouri (70.9). This ratio comes from the placebo run, which refits California with sigf(6) and without allopt. That refit has an RMSE of 1.780 and a pre-treatment MSPE of 3.17, against 1.756 and 3.08 in the baseline. Because California ranks first among all 39 units, the permutation p-value is 0.026, or 1/39. The cut(2) filter removes the 19 states whose pre-treatment MSPE exceeds twice that of California (3.17), so that only well-fitted placebos remain. California still ranks first among the 20 remaining units, and the p-value rises to 0.050 (1/20).

The pointwise left-sided p-values are the relevant ones here, because the estimated effect is negative. They equal 0.050 in 8 of the 12 post-treatment years and 0.100–0.150 in the other four years (1990, 1991, 1992, and 1998). In those four years, one or two retained placebos show a gap at least as negative as that of California. Three of the four weaker years fall early in the period, when the gaps are smaller. Effect size alone does not explain the pattern, however, because 1989 has the smallest gap and still reaches p = 0.050.

### In-Time Placebo Test

```
Fitting results (reduced specification estimated with the real year 1989):
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

**Interpretation:** The in-time placebo test assigns a fake treatment date of 1985, four years before the actual intervention. It checks whether the model finds an effect in years when no policy change occurred. The fake-date gaps for 1985–1988 range from −3.33 to −8.65 packs per capita, with an average of −5.99. In the same run, the gaps for 1989–2000 range from −13.97 to −25.59 packs, with an average of −18.76. This average is about three times the fake-date average. The Mean row of the excerpt, −15.57, averages all 16 years from 1985 to 2000. It therefore mixes the two windows and is not an in-time ATT.

The fake-date gaps are not zero: they equal 3.1% of the synthetic value in 1985 and 8.2% in 1987. The synthetic control built on the shorter 1980–1984 predictor window therefore does not track California perfectly after 1984. The gap then steps down by 5.74 packs, from −8.39 in 1988 to −14.12 in 1989, and it reaches −25.59 packs in 2000. A step of similar size, 5.07 packs, already occurs in 1987, from −3.59 to −8.65. The pattern therefore supports a policy effect that begins in 1989 only in part. The test shows much smaller effects at the fake date, rather than no effect.

The fit statistics in this output require careful attribution. The synth2 command does not print the fit of the fake-1985 model. The statistics that it prints first are an RMSE of 2.205, an R-squared of 0.953, and six covariates. They belong to a reduced specification estimated with the real treatment year, 1989. This specification drops the 1988 sales lag and averages the covariates over 1980–1984 instead of 1980–1988. Its fit is weaker than that of the baseline (R-squared 0.953 against 0.974, and RMSE 2.205 against 1.756). Its donors also shift: Montana drops out, and New Mexico enters with a weight of 5.0%. The ATT of this reduced specification, −17.71 packs, is an estimate for the real date with fewer predictors, not a placebo result.

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

**Interpretation:** The leave-one-out analysis reestimates the SCM five times. Each run excludes one of the five donor states with positive weight: Utah, Nevada, Montana, Colorado, and Connecticut. Before the exclusions, synth2 refits the baseline without allopt. The reference values in this table come from that refit. The refitted gap in 2000 is −25.61 packs, for example, against −25.76 packs in the baseline run. In 2000, the leave-one-out gaps range from −28.35 to −23.49 packs. This spread of 4.87 packs is about 19% of the refitted gap.

The widest spread occurs in 1997, when the gaps range from −30.62 to −17.99 packs, a spread of 12.63 packs. The log does not report which excluded donor produces each minimum or maximum. The table alone therefore cannot attribute the 1997 spread to a particular state. Across all years and exclusions, the gaps stay between −5.74 and −30.62 packs. No single donor reverses the sign of the estimated effect. The refitted ATT of this run is −18.87 packs, close to the baseline ATT of −19.00. It is not an average over the leave-one-out fits.

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

**Interpretation:** The leave-one-out results are stored in a Stata frame named `california`. The frame holds the original 1,209 observations and 16 additional variables. Two variables store the refitted baseline prediction and treatment effect, and ten store the prediction and effect for each of the five exclusions. The remaining four store the minimum and maximum predictions and effects across the exclusions. The descriptions in the summary above are ours, not the variable labels of the log. The log labels the first two variables "prediction of cigsale" and "treatment effect on cigsale," and both refer to this refit, not to the main baseline estimate. With this frame, researchers can run further analyses without repeating the slow optimization. For example, they can plot each leave-one-out trajectory or identify the excluded donor behind the extreme gap in each year.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `stata_sc_raw_trends.png` | Line plot of cigarette sales in California (solid steel blue) and the donor pool average (dashed gray), 1970–2000, with a vertical dashed orange line at 1989 | California already lies below the donor average before 1989 (by 23.72 packs in 1988) and falls faster afterward, which motivates the SCM |
| 2 | `stata_sc_pred.png` | Actual and synthetic cigarette sales in California (packs per capita), 1970–2000 | Close pre-treatment fit (synth2 R-squared 0.974; largest gap 5.88 packs, in 1970); after 1989, actual sales fall well below the synthetic series |
| 3 | `stata_sc_eff.png` | Treatment effect (actual minus synthetic) over time, with a zero reference line | The effect starts at −7.59 packs (1989) and reaches −26.37 packs (1999); it deepens over the decade, though not in every year |
| 4 | `stata_sc_bias.png` | Covariate balance: the percent difference of each comparison group from California for every predictor, which Stata labels "Standardized % Bias" | Synthetic California matches six of the seven predictors within 1.74%, whereas the simple donor average overstates sales in 1988, 1980, and 1975 by 26.3%, 14.9%, and 7.7%; log GDP per capita is the exception, since its −2.16% bias is a shortfall of 0.22 log points, or about 20% |
| 5 | `stata_sc_weight_unit.png` | Bar chart of donor state weights in the synthetic control | Five states receive positive weight: Utah (33.4%), Nevada (23.5%), Montana (20.2%), Colorado (16.1%), and Connecticut (6.8%); all others receive zero |
| 6 | `stata_sc_weight_vars.png` | Bar chart of predictor (V-matrix) weights | The largest weights go to the population share aged 15–24 (V = 0.546) and cigsale(1975) (V = 0.422), while log GDP per capita receives almost none; the placebo refit gives 0.002 and 0.768 to the first two, so these weights are fragile |
| 7 | `stata_sc_eff_pboUnit.png` | Spaghetti plot of the gaps for California (purple line) and the 19 placebo states retained by cut(2) (gray lines), 1970–2000 | After 1989, the California gap is the most negative of the 20 lines in 8 of the 12 years; the placebo gaps spread in both directions |
| 8 | `stata_sc_ratio_pboUnit.png` | Bar chart ranking all 39 units by the ratio of post-treatment to pre-treatment MSPE | California has the highest ratio of all 39 units (123.5, from the placebo refit), far above Georgia, the next highest (80.0) |
| 9 | `stata_sc_pvalTwo_pboUnit.png` | Two-sided permutation p-values (also called Fisher exact p-values) over the post-treatment period | p = 0.050 in 8 of 12 years and 0.100–0.150 in the other four; the values equal the left-sided p-values in every year |
| 10 | `stata_sc_pvalRight_pboUnit.png` | Right-sided p-values (test for a positive effect) over time | The p-values range from 0.900 to 1.000, so the test finds no evidence of a sales increase, as expected |
| 11 | `stata_sc_pvalLeft_pboUnit.png` | Left-sided p-values (test for a negative effect) over time | p = 0.050 in 8 of 12 years; the four weaker years (1990, 1991, 1992, and 1998) have p = 0.100–0.150 |
| 12 | `stata_sc_pred_pboTime1985.png` | Actual and synthetic sales for the in-time placebo, with the fake treatment in 1985 | The series separate modestly in 1985–1988 (gaps of −3.33 to −8.65 packs) and far more after 1989 (gaps of −13.97 to −25.59 packs) |
| 13 | `stata_sc_eff_pboTime1985.png` | Treatment effect for the in-time placebo, with dotted lines at 1984 and 1988, the last years before the fake and real treatment dates | Small effects (−3.33 to −8.65 packs) in 1985–1988 and large effects (−13.97 to −25.59 packs) after 1989: the effects are much smaller at the fake date |
| 14 | `stata_sc_loo_combined.png` | Seven-panel graph from the leave-one-out run: covariate balance, predictor weights, unit weights, actual and synthetic outcomes, treatment effects, and two leave-one-out panels with five gray lines each | The five leave-one-out paths follow the refitted baseline, with the largest deviations in 1997 and 1998, and every gap stays negative after 1989; the note on the deployed graph, "Each panel excludes one donor state," is inaccurate; this figure comes from the original run, and the corrected do-file now writes an accurate note |

---

## Key Findings

1. **Proposition 99 reduced cigarette sales in California by an average of 19.00 packs per capita:** Over the 12 post-treatment years (1989–2000), the ATT was −19.00 packs per capita. This effect represents a 24% reduction relative to the average synthetic value of 79.4 packs. By 2000, actual sales (41.6 packs) were 25.76 packs below the counterfactual (67.4 packs), a gap of 38%.

2. **The effect grew over the 1990s, though not in every year:** The gap started at −7.59 packs in 1989 and deepened to −26.37 packs by 1999, with temporary narrowing in some years, such as 1998. One possible explanation is cumulative behavioral change, but the analysis does not test this mechanism. The gap stood at −25.76 packs in 2000. Both late years follow Proposition 10, which raised the state cigarette tax by a further 50 cents per pack in January 1999. They therefore do not isolate the effect of Proposition 99.

3. **Synthetic California fits the pre-treatment path closely (synth2 R-squared = 0.974):** The RMSE is 1.756 packs per capita over 1970–1988. The synth2 R-squared divides by the variation of the synthetic series, and the conventional R-squared with the same weights is 0.976. The fit is close but not exact, because the largest pre-treatment gap is 5.88 packs, in 1970. Six of the seven predictor differences are at most 1.74%, and five are below 0.3%. Log GDP per capita is the exception, because its −2.16% bias is a shortfall of 0.22 log points, or a GDP per capita about 20% lower.

4. **Only five states form synthetic California, and Utah has the largest weight (33.4%):** The synthetic control is a sparse combination of Utah (33.4%), Nevada (23.5%), Montana (20.2%), Colorado (16.1%), and Connecticut (6.8%). The other 33 states receive zero weight. The weights reflect the match on predictors rather than geography, since Nevada is the only donor that borders California.

5. **The effect in California is statistically significant, although the filtered p-value is borderline (p = 0.026 with all units, p = 0.050 with the cut(2) filter):** The in-space placebo test ranks the post/pre MSPE ratio of California (123.5, from the placebo refit) first among all 39 units. With all units, the p-value is 0.026 (1/39). With the cut(2) filter, which drops the 19 states with poor pre-treatment fit, the p-value is 0.050 (1/20).

6. **The in-time placebo test shows much smaller effects at the fake date:** A fake treatment date of 1985 produces gaps of −3.33 to −8.65 packs in 1985–1988. In the same run, the gaps for 1989–2000 range from −13.97 to −25.59 packs. Their average (−18.76) is about three times the fake-date average (−5.99). The fake-date gaps are not zero. They may reflect prediction error of the reduced model, which has a shorter fit period (1970–1984) and one predictor fewer. Genuine changes in California before 1989 could also produce them, and these data cannot separate the two explanations. They remain much smaller, however, than the gaps after 1989.

7. **The leave-one-out analysis shows that no single donor drives the sign of the estimate:** When each of the five positive-weight donors is excluded in turn, the gap in 2000 ranges from −23.49 to −28.35 packs. The refitted baseline of this run gives −25.61. Every gap stays negative in every year, and the largest spread occurs in 1997 (−17.99 to −30.62 packs). The run refits the baseline ATT at −18.87 packs, close to the −19.00 of the main estimate. This value is not an average over the leave-one-out fits.

---

## Surprises and Caveats

- **Borderline p-value with the cut(2) filter:** The in-space placebo p-value is exactly 0.050 with the cut(2) filter, right at the conventional significance threshold. This value is a mechanical consequence of the 20 units that pass the filter. California ranks first, so p = 1/20 = 0.050, the smallest value attainable with 20 units. All 19 excluded states have ratios below that of California, and the highest, for Indiana, is 32.6. The filter therefore cannot change this rank. It only shrinks the reference set from 39 to 20 units. The unfiltered p-value (0.026) is the less conservative of the two. The blog post should present both values and note that SCM inference is inherently limited by the small number of comparison units.

- **Nonzero in-time placebo effects:** The fake-date gaps for 1985–1988 are not negligible (−3.33 to −8.65 packs, with an average of −5.99). They are much smaller than the gaps after 1989. They may reflect prediction error of the reduced model, which has a shorter fit period (1970–1984) and one predictor fewer. Genuine changes in California before 1989 could also produce them, and these data cannot separate the two explanations. The reduced specification estimated with the real date 1989 uses the 1980–1984 window and drops the 1988 lag. It lowers the synth2 R-squared from 0.974 to 0.953. It also changes the donors: Montana drops out, and New Mexico enters at 5.0%. The synth2 command does not print the fit of the fake-1985 model itself. The blog post should acknowledge this imperfection. It should emphasize that the gaps from 1989 onward average about three times the fake-window gaps. It should also note that a step of similar size already occurs in 1987.

- **Sparse donor pool (5 of 38 states):** Only five states contribute to synthetic California, and 33 states receive zero weight. Such sparsity is typical of the SCM, but it makes the counterfactual depend heavily on a few states. Utah alone accounts for one-third of the synthetic control. The cigarette market in Utah reflects the distinct smoking norms of its large Latter-day Saint population. If that market experienced idiosyncratic shocks in the 1990s, the estimate could be biased.

- **The ATT varies slightly across runs:** The baseline ATT is −19.00. The refit in the in-space placebo run gives −18.83, and the refit in the leave-one-out run gives −18.87. The reduced specification of the in-time run, estimated with the real date 1989, gives −17.71. The two refits differ from the baseline by at most 0.18 packs, which reflects the optimizer settings (allopt and sigf). The reduced specification differs by 1.29 packs, mainly because it has one predictor fewer and a shorter covariate window. The consistency across runs is reassuring, but the blog post should note that SCM point estimates are not perfectly invariant to specification choices.

- **Widest leave-one-out variation in 1997:** In 1997, the leave-one-out gap ranges from −17.99 to −30.62 packs, a spread of 12.63 packs, against 4.87 packs in 2000. The estimates for 1997 and 1998 are therefore more sensitive to the donor composition than those for 1999 and 2000. One possible reason is that the cigarette markets of individual donor states diverged more during this period. The log does not test this explanation, however.

- **No standard errors or confidence intervals:** Unlike regression-based methods, the SCM does not produce standard errors or confidence intervals for the treatment effect. Inference relies entirely on the placebo-based permutation approach, which has limited power. With 20 units after the cut(2) filter, the smallest attainable p-value is 0.050. The blog post should discuss this limitation. It should also note that recent advances, such as conformal inference for the SCM, offer more formal inference frameworks.
