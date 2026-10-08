# Results Report: Double Machine Learning with 401(k) Pension Data

**Script:** `script.py`
**Executed:** 2026-05-04
**Status:** Success
**Runtime:** ~3 minutes
**Language:** Python 3
**Key packages:** doubleml 0.10.1, scikit-learn, xgboost 2.1.4, pandas, numpy, matplotlib

---

## Execution Summary

The script estimates the causal effect of 401(k) eligibility and participation on net total financial assets using three DoubleML models (PLR, IRM, IIVM) with four ML learners each (Lasso, Random Forest, Decision Trees, XGBoost). It uses the 1991 Survey of Income and Program Participation (SIPP) dataset with 9,915 household observations. The analysis compares naive difference-in-means estimates against debiased DML estimates to quantify confounding bias from income and other covariates.

The headline finding: naive comparisons overstate the eligibility effect by 124% ($19,559 vs. ~$8,730 ATE from DML). All three DML models and four ML learners converge on a consistent story: 401(k) eligibility genuinely increases savings, but the effect is roughly half of what naive comparisons suggest.

**Warnings:** None

---

## Data Overview

```
Dataset shape: (9915, 14)

Outcome summary (net_tfa):
count       9915.00
mean       18051.53
std        63522.50
min      -502302.00
25%         -500.00
50%         1499.00
75%        16524.50
max      1536798.00

Treatment rates:
  Eligible (e401=1): 3682 / 9915 (37.1%)
  Participating (p401=1): 2594 / 9915 (26.2%)

Summary by eligibility status:
                  n  mean_net_tfa  median_net_tfa  std_net_tfa   mean_income  mean_age  mean_educ
Eligibility
Not Eligible   6233  10788.040039           145.0     54518.38  31493.589844     40.81      12.88
Eligible       3682  30347.390625          9122.5     74800.21  46861.660156     41.48      13.76
```

**Interpretation:** The dataset contains 9,915 U.S. households from the 1991 SIPP survey. About 37% of households are eligible for 401(k) plans and 26% actually participate, meaning roughly 70% of eligible households choose to participate. Net total financial assets are highly skewed: the median is just $1,499 while the mean is $18,052, with values ranging from -$502,302 to $1,536,798. Crucially, eligible households have substantially higher income ($46,862 vs. $31,494) and more education (13.76 vs. 12.88 years), revealing the confounding structure: higher-income, more-educated households are both more likely to have 401(k) access and more likely to save regardless.

---

## Method Results

### Naive Baselines (Difference-in-Means)

```
Naive difference (eligibility): $19,559.34
  Eligible mean:     $30,347.39
  Not eligible mean: $10,788.05

Naive difference (participation): $27,371.58
  Participating mean:     $38,262.06
  Not participating mean: $10,890.48
```

**Interpretation:** Simple comparisons suggest that 401(k) eligibility is associated with $19,559 more in net financial assets, and participation with $27,372 more. However, these numbers conflate the genuine causal effect of 401(k) access with pre-existing differences between eligible and ineligible households. Since eligible households already earn $15,368 more in income on average, much of the observed savings gap is driven by income rather than by the 401(k) plan itself. These naive estimates serve as a biased upper bound that the DML methods will correct downward.

### Partially Linear Regression (PLR) -- ATE of Eligibility

```
PLR-Lasso:         coef=9,370.81, SE=1,326.47, 95% CI=[6,770.99, 11,970.64]
PLR-Random Forest: coef=8,835.46, SE=1,309.07, 95% CI=[6,269.74, 11,401.18]
PLR-Decision Tree: coef=7,822.51, SE=1,321.78, 95% CI=[5,231.87, 10,413.14]
PLR-XGBoost:       coef=8,892.39, SE=1,398.65, 95% CI=[6,151.09, 11,633.69]
```

**Interpretation:** After controlling for confounders via the Partially Linear Regression model, the average treatment effect (ATE) of 401(k) eligibility on net financial assets ranges from $7,823 (Decision Tree) to $9,371 (Lasso), with a mean of $8,730 across all four learners. This represents a dramatic reduction from the naive estimate of $19,559 -- DML reveals that roughly $10,829 (55%) of the naive gap was confounding bias, not a genuine causal effect. All four learner estimates are statistically significant (none of the 95% confidence intervals include zero), and the range across learners is reassuringly narrow ($1,548), demonstrating that DML results are robust to the choice of ML algorithm for nuisance function estimation. The Lasso estimate uses the flexible specification with polynomial features, while tree-based methods use the base specification with 9 raw covariates.

### Interactive Regression Model (IRM) -- ATE of Eligibility

```
IRM-Lasso:         coef=8,559.13, SE=1,261.16, 95% CI=[6,087.30, 11,030.97]
IRM-Random Forest: coef=7,924.39, SE=1,138.06, 95% CI=[5,693.82, 10,154.95]
IRM-Decision Tree: coef=7,985.58, SE=1,156.49, 95% CI=[5,718.90, 10,252.26]
IRM-XGBoost:       coef=8,381.57, SE=1,186.36, 95% CI=[6,056.34, 10,706.80]
```

**Interpretation:** The Interactive Regression Model, which allows fully heterogeneous treatment effects through propensity score reweighting, produces ATE estimates ranging from $7,924 (Random Forest) to $8,559 (Lasso), with a mean of $8,213. These are remarkably close to the PLR estimates ($8,730 mean), differing by only about $500 on average. The similarity between PLR and IRM suggests that treatment effect heterogeneity is limited in this setting -- the constant-effect assumption of PLR appears reasonable. The IRM standard errors are slightly smaller than PLR's (averaging $1,185 vs. $1,339), indicating that the propensity score approach is somewhat more efficient. All estimates remain strongly significant, with a trimming threshold of 0.01 handling extreme propensity scores.

### Interactive IV Model (IIVM) -- LATE of Participation

```
IIVM-Lasso:         coef=12,280.84, SE=1,712.63, 95% CI=[8,924.16, 15,637.53]
IIVM-Random Forest: coef=11,471.20, SE=1,646.56, 95% CI=[8,243.99, 14,698.40]
IIVM-Decision Tree: coef=11,215.10, SE=1,785.89, 95% CI=[7,714.82, 14,715.38]
IIVM-XGBoost:       coef=12,018.76, SE=1,648.62, 95% CI=[8,787.52, 15,250.00]
```

**Interpretation:** The IIVM model uses eligibility (e401) as an instrumental variable for the endogenous participation decision (p401), identifying the Local Average Treatment Effect (LATE) -- the causal effect of 401(k) participation on net financial assets for "compliers" (households who participate because they are eligible but would not participate otherwise). The LATE ranges from $11,215 to $12,281, with a mean of $11,746. This is substantially larger than the ATE estimates from PLR/IRM ($8,200-$8,700), which is expected: the LATE captures the effect on marginal participants -- those whose behavior changes with eligibility -- who may benefit more from 401(k) access than the average household. Standard errors are larger than PLR/IRM ($1,698 average vs. $1,185-$1,339), reflecting the efficiency loss inherent in IV estimation, but all estimates remain significant.

### Grand Comparison

```
Naive difference-in-means:
  Eligibility: $19,559.34
  Participation: $27,371.58

PLR (ATE of eligibility, 4 learners):
  Range: $7,822.51 to $9,370.81
  Mean:  $8,730.29

IRM (ATE of eligibility, 4 learners):
  Range: $7,924.39 to $8,559.13
  Mean:  $8,212.67

IIVM (LATE of participation, 4 learners):
  Range: $11,215.10 to $12,280.84
  Mean:  $11,746.48

Confounding bias (naive - mean PLR ATE):
  $10,829.05 (naive overstates by 124%)
```

**Interpretation:** The grand comparison reveals three layers of insight. First, the massive gap between naive ($19,559) and DML-adjusted ATE ($8,213-$8,730) quantifies the confounding bias from income and other covariates -- roughly $10,800, meaning the naive estimate is more than double the true causal effect. Second, the consistency between PLR ($8,730) and IRM ($8,213) provides strong evidence that the ATE is in the $8,000-$9,000 range regardless of whether we use a partially linear or a fully interactive model. Third, the higher IIVM estimates ($11,746) are not contradictory but reflect a different estimand: the LATE for compliers is larger because marginal participants stand to gain more from 401(k) access than the average household.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `pension_eda_outcome.png` | Histograms and box plots of net financial assets by 401(k) eligibility | Eligible households have substantially higher and more dispersed financial assets |
| 2 | `pension_eda_confounding.png` | Income distributions and scatter plot by eligibility status | Income is a key confounder: eligible households earn $15,000+ more on average |
| 3 | `pension_plr_comparison.png` | Horizontal bar chart of PLR estimates across 4 ML learners with naive baseline | All PLR estimates cluster around $8,000-$9,400, far below the $19,559 naive line |
| 4 | `pension_irm_comparison.png` | Horizontal bar chart of IRM estimates across 4 ML learners with naive baseline | IRM estimates ($7,900-$8,600) are even tighter than PLR, confirming the ATE |
| 5 | `pension_iivm_comparison.png` | Horizontal bar chart of IIVM estimates across 4 ML learners with naive baseline | IIVM LATE estimates ($11,200-$12,300) are higher than ATE, as expected for compliers |
| 6 | `pension_grand_comparison.png` | All 12 DML estimates + 2 naive baselines in a single comparison chart | Visual proof that DML debiasing cuts the naive estimate roughly in half |

---

## Key Findings

1. **Confounding bias is massive:** The naive eligibility estimate ($19,559) overstates the true ATE by 124%. After DML debiasing, the ATE drops to approximately $8,730 (PLR mean) or $8,213 (IRM mean). Income is the primary confounder, with eligible households earning $15,368 more on average.

2. **401(k) eligibility genuinely boosts savings:** Despite the bias reduction, the ATE remains economically and statistically significant at roughly $8,000-$9,400 across all PLR and IRM specifications. Every single confidence interval excludes zero. This confirms that 401(k) access causally increases household savings.

3. **PLR and IRM agree closely:** The PLR mean ATE ($8,730) and IRM mean ATE ($8,213) differ by only $518, suggesting limited treatment effect heterogeneity. The constant-effect assumption of PLR is a reasonable approximation for this application.

4. **LATE exceeds ATE for compliers:** The IIVM estimates ($11,215-$12,281, mean $11,746) identify the effect on compliers -- households induced to participate by eligibility. This is 35% larger than the ATE, indicating that marginal participants benefit more from 401(k) access than the average household.

5. **Results are robust across ML learners:** Within each model, the range across four ML learners is narrow: $1,548 for PLR, $635 for IRM, and $1,066 for IIVM. This demonstrates that DML estimates are insensitive to the specific ML algorithm used for nuisance estimation.

6. **Estimand distinction matters:** PLR and IRM both target the ATE (effect of eligibility on the entire population), while IIVM targets the LATE (effect of participation on compliers only). Comparing $8,700 to $11,700 without recognizing this estimand shift would be misleading.

7. **Propensity score trimming stabilizes IRM:** The IRM model uses a trimming threshold of 0.01 to exclude observations with extreme propensity scores. This produces tighter confidence intervals than PLR (average SE $1,185 vs. $1,339), suggesting the propensity score approach is more efficient in this setting.

8. **Dataset has extreme skewness:** Net financial assets range from -$502,302 to $1,536,798, with a median of just $1,499. The 75th percentile is $16,525 while the maximum is $1.5M. This right skew does not invalidate the analysis but means the ATE is driven substantially by effects in the upper tail of the distribution.

---

## Surprises and Caveats

**No major surprises.** Results align with the published DoubleML documentation and the original Poterba, Venti, and Wise (1995) findings.

**Minor differences from reference:** Our estimates differ slightly from the DoubleML docs reference (which uses `np.random.seed(123)` vs. our `RANDOM_SEED=42`), but the qualitative pattern is identical. PLR and IRM estimates are in the $8,000-$9,400 range; IIVM estimates are in the $11,000-$12,300 range.

**Key assumptions:**
- **Conditional exogeneity of eligibility:** The analysis assumes 401(k) eligibility is as good as randomly assigned after conditioning on income, age, education, and other covariates. If unobserved factors (e.g., financial literacy, savings motivation) affect both eligibility and savings, the estimates remain biased.
- **LATE interpretation:** The IIVM estimates apply only to compliers, not to always-takers or never-takers. Generalizing to the full population requires monotonicity and additional assumptions.
- **Cross-sectional data:** The 1991 SIPP is a single snapshot. Dynamic effects of 401(k) participation over time are not captured.
- **Extreme asset values:** The dataset contains households with net financial assets below -$500,000 and above $1.5M. These outliers influence the mean-based ATE estimates. Median or trimmed-mean analyses could provide complementary insights.
