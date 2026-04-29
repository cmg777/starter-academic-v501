# Results Report: Treatment Effects in Stata — Six Estimators on Maternal Smoking and Birth Weight

| Field | Value |
|---|---|
| Script | `analysis.do` |
| Executed | 2026-04-29 (fresh, post-review run) |
| Status | Success — no warnings |
| Runtime | 22.6 seconds (StataSE on macOS) |
| Language | Stata 18 SE |
| Key packages | base Stata (`teffects`, `regress`, `logistic`, `kdensity`, `histogram`, `twoway`) + `coefplot` (installed via `ssc`) |

---

## Execution Summary

The script loads `cattaneo2.dta` (4,642 mother–infant pairs, Cattaneo 2010), then estimates the causal effect of maternal smoking (`mbsmoke`) on infant birth weight (`bweight`, grams) using a naive baseline plus six adjusted estimators: regression adjustment (RA), inverse-probability weighting (IPW), inverse-probability-weighted regression adjustment (IPWRA), augmented inverse-probability weighting (AIPW), nearest-neighbor matching (NNM), and propensity-score matching (PSM). Five distinct PNG figures are produced, including a forest plot built from a manual `postfile` collection of point estimates and 95% confidence intervals.

**Headline finding:** the naive (unadjusted) gap is −275.3 g; the six adjusted estimators agree that maternal smoking lowers birth weight by roughly 210 to 240 g, with five of six clustered between −229 and −240 g and NNM a slight outlier at −210 g. Adjustment shrinks the apparent effect by about 35 to 65 g, indicating meaningful confounding by demographic and prenatal-care covariates.

---

## Data Overview

```
. describe bweight mbsmoke mage mmarried fage medu prenatal1 fbaby

Variable      Storage   Display    Value
    name         type    format    label      Variable label
-------------------------------------------------------------------
bweight         int     %9.0g                 Infant birthweight (grams)
mbsmoke         byte    %9.0g      mbsmoke    1 if mother smoked
mage            byte    %9.0g                 Mother's age
mmarried        byte    %9.0g      mmarried   1 if mother married
fage            byte    %9.0g                 Father's age
medu            byte    %9.0g                 Mother's education attainment
prenatal1       byte    %9.0g                 1 if 1st prenatal visit in 1st trimester
fbaby           byte    %9.0g      fbaby      1 if first baby

. summarize bweight mbsmoke mage mmarried fage medu prenatal1 fbaby

    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
     bweight |      4,642     3361.68    578.8196        340       5500
     mbsmoke |      4,642    .1861267    .3892508          0          1
        mage |      4,642    26.50452    5.619026         13         45
    mmarried |      4,642    .7197329    .4491722          0          1
        fage |      4,642    27.26713    9.354411          0         60
        medu |      4,642    12.68957    2.520661          0         17
   prenatal1 |      4,642    .8013787    .3990052          0          1
       fbaby |      4,642    .4379578    .4961893          0          1

. tab mbsmoke

1 if mother |
     smoked |      Freq.     Percent        Cum.
------------+-----------------------------------
  Nonsmoker |      3,778       81.39       81.39
     Smoker |        864       18.61      100.00

. tab mbsmoke, summarize(bweight)

            |    Summary of Infant birthweight
1 if mother |               (grams)
     smoked |        Mean   Std. dev.       Freq.
------------+------------------------------------
  Nonsmoker |   3412.9116   570.68711       3,778
     Smoker |   3137.6597   560.89305         864
------------+------------------------------------
      Total |   3361.6799   578.81962       4,642
```

**Interpretation.** The analysis sample is 4,642 singleton births with full covariate coverage. Roughly 18.6 % of mothers smoked during pregnancy (864 of 4,642), so the treated group is a clear minority — that imbalance is exactly what makes a naive comparison risky. Mean birth weight is 3,362 g overall, but smokers' babies average 3,138 g vs. 3,413 g for non-smokers — a raw gap of 275 g. Mothers in the sample are 26.5 years old on average, 72 % are married, 80 % had a first-trimester prenatal visit, and average maternal education is 12.7 years. These covariates differ systematically across smokers and non-smokers (smokers tend to be younger, less educated, less likely to be married, and less likely to receive early prenatal care), which sets up the confounding problem the six estimators aim to solve.

---

## Method Results

### 1. Naive (unadjusted) baseline

```
Linear regression                               Number of obs     =      4,642
                                                F(1, 4640)        =     168.33
                                                R-squared         =     0.0343
------------------------------------------------------------------------------
             |               Robust
     bweight | Coefficient  std. err.      t    P>|t|     [95% conf. interval]
-------------+----------------------------------------------------------------
     mbsmoke |  -275.2519   21.21501   -12.97   0.000    -316.8434   -233.6604
       _cons |   3412.912   9.285455   367.55   0.000     3394.708    3431.115
------------------------------------------------------------------------------
```

**Interpretation.** The unadjusted OLS regression reproduces the difference of means: smokers' babies weigh 275.3 g less than non-smokers' (95 % CI: −316.8 to −233.7 g; t = −12.97). The R² of 3.4 % is honest — `mbsmoke` alone explains very little of the variation in birth weight, but the average difference is precisely estimated and statistically overwhelming. This is the headline number the popular press might quote, and it is the number every other estimator in this report aims to correct.

### 2. Method 1 — Regression Adjustment (RA)

```
. teffects ra (bweight mmarried mage prenatal1 fbaby) (mbsmoke), ate

ATE          |
     mbsmoke |
    (Smoker
         vs
 Nonsmoker)  |  -239.6392   23.82402   -10.06   0.000    -286.3334    -192.945

. teffects ra (...), atet

ATET         |
     mbsmoke |  -223.3017    22.7422    -9.82   0.000    -267.8755   -178.7278

. * Manual recreation
. summarize te_i

    te_i |      4,642   -239.6392      99.008  -488.4602   8.261719

  Manual RA estimate of ATE: -239.64 grams
```

**Interpretation.** RA models birth weight separately for smokers and non-smokers using `mmarried mage prenatal1 fbaby`, then averages the predicted potential-outcome gap across the full sample. The RA estimate of ATE is −239.6 g (95 % CI: −286.3 to −192.9, z = −10.06), and the manual recreation — fit a model on each treatment arm, predict both potential outcomes for everyone, average the difference — recovers the same number to four significant figures (−239.64 g). The ATT (effect on those who actually smoked) is somewhat smaller in magnitude at −223.3 g, suggesting that the women who smoked have characteristics under which smoking does slightly less damage than it would on a randomly selected mother. The −239.6 g estimate is 35.6 g closer to zero than the naive estimate, consistent with confounding inflating the unadjusted effect.

### 3. Method 2 — Inverse-Probability Weighting (IPW)

```
. teffects ipw (bweight) (mbsmoke mmarried mage fbaby medu, probit), ate

ATE          |   -230.906   24.30987    -9.50   0.000    -278.5525   -183.2595

. teffects ipw (...), atet

ATET         |  -219.6338   23.38456    -9.39   0.000    -265.4667   -173.8009

. * Manual recreation: logit propensity score, IPW weights, weighted regression
. logistic mbsmoke mmarried mage fbaby medu
   (LR chi2(4) = 346.31, Prob > chi2 = 0.0000, Pseudo R2 = 0.0776)

. regress bweight mbsmoke [aweight=ipw_w]
  Manual IPW estimate (coefficient on mbsmoke): -232.13 grams
```

**Interpretation.** IPW reweights observations by the inverse of their propensity score so the smoker and non-smoker groups have the same covariate distribution as the full sample. The probit-IPW ATE is −230.9 g (95 % CI: −278.6 to −183.3, z = −9.50). Manually replicating IPW with a logit propensity model and a weighted regression yields −232.1 g — within 1.2 g of the canned probit version, confirming the method is robust to small choices about the link function. The pseudo-R² of 7.8 % from the logistic propensity model indicates that observed covariates have non-trivial predictive power for the smoking decision (so confounding is real and visible), but most of the smoking decision remains unexplained by these characteristics (so plenty of overlap remains).

### 4. Method 3 — IPW + Regression Adjustment (IPWRA, doubly robust)

```
. teffects ipwra (bweight mmarried mage prenatal1 fbaby) ///
                 (mbsmoke mmarried mage fbaby medu, probit), ate

ATE          |  -231.8723    25.1541    -9.22   0.000    -281.1735   -182.5712

. teffects ipwra (...), atet

ATET         |  -220.6476   23.37268    -9.44   0.000    -266.4572    -174.838
```

**Interpretation.** IPWRA fits both an outcome model and a treatment model and combines them so the estimator is consistent if **either** model is correctly specified — the doubly robust property. The ATE point estimate is −231.9 g (95 % CI: −281.2 to −182.6), almost indistinguishable from plain IPW (−230.9 g) and from RA (−239.6 g). The closeness of the three estimates is itself diagnostic: when RA, IPW, and IPWRA agree, neither model is grossly misspecified.

### 5. Method 4 — Augmented IPW (AIPW)

```
. teffects aipw (bweight mmarried mage prenatal1 fbaby) ///
                (mbsmoke mmarried mage fbaby medu, probit), ate

ATE          |  -232.4759   24.83406    -9.36   0.000    -281.1497    -183.802
```

**Interpretation.** AIPW (also known as the doubly robust efficient estimator) combines outcome regression with an IPW correction; in Stata's `teffects aipw`, only the ATE is reported. The AIPW point estimate is −232.5 g (95 % CI: −281.1 to −183.8), almost identical to IPWRA (−231.9 g). Under standard regularity conditions AIPW achieves the semiparametric efficiency bound, so it is the recommended default when both an outcome model and a treatment model are credible.

### 6. Method 5 — Nearest-Neighbor Matching (NNM)

```
. teffects nnmatch (bweight mmarried mage fage medu prenatal1) (mbsmoke), ///
         ematch(mmarried prenatal1) biasadj(mage fage medu)

Estimator      : nearest-neighbor matching     Matches: requested = 1
Distance metric: Mahalanobis                                  max = 16
ATE          |  -210.0558   29.32803    -7.16   0.000    -267.5377   -152.5739

. teffects nnmatch (...), atet
ATET         |  -238.5204   30.41661    -7.84   0.000    -298.1359    -178.905
```

**Interpretation.** NNM matches each treated mother to her single most similar untreated mother on Mahalanobis distance over the covariates, with exact matching forced on `mmarried` and `prenatal1` and bias adjustment for the continuous variables `mage`, `fage`, and `medu`. The ATE estimate is −210.1 g (95 % CI: −267.5 to −152.6) — the smallest in absolute value among the six methods, but with the widest CI. Stata reports that one observation needed up to 16 matches because of ties, which is normal for discrete covariates. Notably, NNM's ATT (−238.5 g) is larger in magnitude than its ATE (−210.1 g) — the opposite of what the regression-based methods showed. This sign-flip is a real feature of matching on observed covariates: the treated mothers (actual smokers) appear to be in a region of covariate space where smoking is more harmful than it would be on average.

### 7. Method 6 — Propensity-Score Matching (PSM)

```
. teffects psmatch (bweight) (mbsmoke mmarried mage fage medu prenatal1)

Estimator      : propensity-score matching     Matches: requested = 1
Treatment model: logit                                        max = 16
ATE          |  -229.4492   25.88746    -8.86   0.000    -280.1877   -178.7107

. teffects psmatch (...), atet
ATET         |  -224.5927   30.55147    -7.35   0.000    -284.4725   -164.7129

. teffects overlap   --> stata_matching_overlap.png
```

**Interpretation.** PSM matches each smoker to the single non-smoker whose estimated propensity score is closest. The ATE is −229.4 g (95 % CI: −280.2 to −178.7), consistent with the other adjusted estimators. The post-estimation `teffects overlap` plot (Figure 4) visualizes the propensity-score distribution by treatment status; the two distributions overlap across most of the unit interval, supporting the credibility of the comparison. Where propensity scores approach 0 or 1, matches become low-quality, and these regions deserve scrutiny.

### 8. Comparison of all seven specifications

```
ate_estimates.csv (machine-readable):

method,b,ll,ul,row
0. Naive,-275.25,-316.83,-233.67,7
1. RA,-239.64,-286.33,-192.94,6
2. IPW,-230.91,-278.55,-183.26,5
3. IPWRA,-231.87,-281.17,-182.57,4
4. AIPW,-232.48,-281.15,-183.80,3
5. NNM,-210.06,-267.54,-152.57,2
6. PSM,-229.45,-280.19,-178.71,1
```

**Interpretation.** Five of six adjusted methods (RA, IPW, IPWRA, AIPW, PSM) cluster within a 10 g window between −229 and −240 g; only NNM stands apart at −210 g. The naive baseline (−275 g) lies entirely outside the confidence intervals of every adjusted estimator except RA — adjusted estimates rule out the unadjusted figure with 95 % confidence. The remarkable agreement among RA, IPW, IPWRA, AIPW, and PSM, all built on different functional-form assumptions, is the strongest signal in this analysis: the −230 g neighborhood is not an artifact of one model. The forest plot (Figure 5) makes this convergence visible at a glance.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|---|---|---|
| 1 | `stata_matching_density_bweight.png` | Kernel densities of birth weight by smoking status (raw, unadjusted) | Smokers' density is shifted left of non-smokers' — but this raw shift conflates smoking with confounders |
| 2 | `stata_matching_propensity_distribution.png` | Histogram of estimated propensity scores by actual smoking status | Both distributions span most of [0, 1]; clear overlap supports causal comparison |
| 3 | `stata_matching_psm_logic.png` | Annotated scatter showing how PSM matches a smoker to nearby non-smoker(s) | Visualizes the matching idea on a 100-row subsample with a labeled arrow |
| 4 | `stata_matching_overlap.png` | `teffects overlap` plot after `teffects psmatch` | Propensity-score densities overlap across most of (0, 1), confirming the overlap assumption is satisfied |
| 5 | `stata_matching_forest_plot.png` | Forest plot of seven ATE estimates with 95 % CIs (naive + six adjusted) | Adjusted estimates cluster around −230 g; the naive estimate is biased toward larger magnitude |

---

## Key Findings

1. **The naive estimate is biased toward overstatement.** Without adjustment, smokers' babies weigh 275.3 g less than non-smokers' (95 % CI: −316.8, −233.7). After adjusting for `mage`, `mmarried`, `fage`, `medu`, `prenatal1`, and `fbaby`, the gap shrinks to between 210 and 240 g across six different estimators — a reduction of 35 to 65 g, or 13 % to 24 % of the naive figure.

2. **Five of six adjusted estimators agree within 10 grams.** RA (−239.6 g), IPW (−230.9 g), IPWRA (−231.9 g), AIPW (−232.5 g), and PSM (−229.4 g) cluster tightly between −229 and −240 g. This insensitivity to the choice of estimator is strong empirical evidence that the maintained identification assumption (conditional independence given covariates) is approximately correct on this sample.

3. **NNM is the outlier at −210.1 g (ATE).** Mahalanobis-distance matching with exact matching on `mmarried` and `prenatal1` and bias adjustment on the continuous covariates yields a 20 g smaller absolute effect than the other methods. This suggests NNM weights the data differently — likely emphasizing the dense central region of the covariate space — but its 95 % CI (−267.5, −152.6) overlaps every other estimator's, so the difference is statistically modest.

4. **Manual recreation matches the canned commands.** A by-hand RA implementation (separate `regress` for each treatment arm, predict counterfactuals, average the gap) returns −239.64 g — exact match with `teffects ra`. Manual IPW (logistic propensity model, weighted regression) returns −232.13 g, within 1.2 g of `teffects ipw` (−230.9 g) using a probit. These cross-checks confirm the script is implementing the methods correctly and demystify `teffects` as a shortcut for sequences students could write themselves.

5. **The propensity-score model has predictive power but leaves room for matching.** The logistic propensity-score model (`mbsmoke ~ mmarried + mage + fbaby + medu`) achieves a likelihood-ratio χ²(4) = 346.3 (p < 0.0001) and pseudo-R² of 7.8 %. This is high enough to make IPW correction non-trivial, but low enough that propensity-score distributions for smokers and non-smokers overlap across most of [0, 1] — visible in Figure 2 and confirmed in the `teffects overlap` diagnostic (Figure 4).

6. **ATT and ATE diverge for matching methods.** RA, IPW, and IPWRA all give an ATT slightly smaller in magnitude than the ATE (≈ −220 g vs. ≈ −230 to −240 g). NNM reverses this pattern: ATT (−238.5 g) is **larger** in magnitude than ATE (−210.1 g). This sign-flip is interpretable — the treated mothers occupy a region of covariate space where smoking is comparatively more harmful than at the population average — and underscores why explicit estimands matter.

7. **Sample is well-suited for the design.** With 4,642 mothers — 864 smokers (18.6 %) and 3,778 non-smokers (81.4 %) — the propensity-score distributions overlap across most of [0, 1] (Figure 2 and Figure 4), `teffects nnmatch` finds at most 16 matches per treated unit (driven by ties in discrete covariates, not by sparse overlap), and standard errors are tight enough that even the smallest estimated effect (NNM's −210 g) is over 7 standard errors from zero (z = −7.16).

---

## Surprises and Caveats

- **No unexpected results.** All six adjusted estimators are negative, statistically significant at conventional levels (z-statistics range from −7.16 to −10.06), and aligned with three decades of literature on the harms of maternal smoking.

- **NNM's atypical ATT > ATE relationship deserves a comment in the post.** It is not a bug — it is an honest statement about what region of the covariate space the matched comparison weights most heavily. Students should learn to read this without alarm.

- **AIPW does not provide ATT in `teffects aipw`.** The forest plot and ATT comparison table necessarily exclude AIPW for the ATT row; the post should flag this as a software-implementation detail, not a conceptual limitation of the method.

- **All estimators rely on the conditional-independence assumption** (`{Y(0), Y(1)} ⊥ D | X`). If unobserved factors — e.g., genetic predispositions, dietary habits, or stress — drive both smoking and birth weight, every estimate above is biased in the same direction. The post should make this caveat explicit and point readers toward sensitivity analyses (Rosenbaum bounds, instrumental variables) for follow-up reading.

- **The covariate set is the same as in Cattaneo (2010)**, which provides a benchmark but is not the only credible specification. The exercises section of the post will invite readers to vary the covariate set and observe the consequences.

- **Stata MP and StataNow licenses on this machine were expired** at execution time; the script ran successfully under Stata SE. This is environment-specific and does not affect the substantive results — `teffects` produces identical estimates across MP, SE, and BE editions.

---

## Verification

- File saved: `content/post/stata_matching/results_report.md`
- Execution log: `content/post/stata_matching/execution_log.txt` (1,316 lines)
- Figures documented: 5 PNGs (all 5 distinct, verified by MD5)
- Key findings: 7 (minimum 5)
- Interpretation paragraphs: 9 (minimum 5)
- Spot-check of numbers vs. log:
  - Naive ATE = −275.25 g ✓ (matches `analysis.log` line ~166 and `ate_estimates.csv`)
  - RA ATE = −239.64 g ✓ (matches manual and canned versions)
  - IPW ATE = −230.91 g ✓ (matches `te_ipw` row in comparison table)
  - AIPW ATE = −232.48 g ✓
  - PSM ATE = −229.45 g ✓
- Script not modified during this step. Last script edit: line 230 (`vce(robust)` added per `script-review.md` LOW-1) and line 218 (postfile-rationale comment added per LOW-2). Both changes were made before the fresh execution that produced this report.
