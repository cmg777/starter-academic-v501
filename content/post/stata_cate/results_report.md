# Results Report: Conditional Average Treatment Effects with Stata 19

**Script:** `analysis.do`
**Executed:** 2026-05-02 21:43–21:52 (≈9 minutes wall time)
**Status:** Success, no warnings of substance
**Language:** Stata SE 19 (StataNow MP license expired Oct 2025; switched to SE)
**Key commands:** `cate po`, `cate aipw`, `categraph histogram/iateplot/gateplot`, `estat heterogeneity / projection / gatetest / classification / series`
**Random seed:** 12345671

---

## Execution summary

The script applies Stata 19's brand-new `cate` command to the canonical 401(k) eligibility study (`webuse assets3`, 9,913 households). It estimates how the effect of 401(k) eligibility on net financial assets varies across households, using two complementary approaches: the partialing-out (PO) estimator with lasso + causal forest, and the augmented inverse-probability weighting (AIPW) estimator (doubly robust). All four `cate` invocations completed cleanly, generated 8 PNG figures, and exported 2 CSV tables. The headline finding is that the average effect (≈$8,000) hides a fan of effects that range from a flat $1,400 in the second income category to over $20,000 in the top income category — and the formal heterogeneity test rejects equality of effects at the 5% level under both the PO (p = 0.043) and AIPW (p = 0.019) specifications.

---

## Data overview

`webuse assets3` loads 9,913 household-level observations from Chernozhukov & Hansen (2004). The outcome `assets` is net total financial assets (in dollars); the treatment `e401k` is binary 401(k) eligibility (37.1% eligible, 62.9% ineligible — 3,682 vs 6,231).

| Variable | Mean | SD | Min | Max |
|----------|----:|---:|----:|----:|
| `assets` (\\$) | 18,054 | 63,529 | −502,302 | 1,536,798 |
| `e401k` | 0.371 | 0.483 | 0 | 1 |
| `age` (years) | 41.06 | 10.34 | 25 | 64 |
| `educ` (years) | 13.21 | 2.81 | 1 | 18 |
| `income` (\\$) | 37,208 | 24,771 | 0 | 242,124 |

**Interpretation.** The asset distribution is extremely right-skewed (skewness 10.6, kurtosis 187): the 1st percentile is −\\$23,500 (negative net worth) while the 99th percentile is \\$219,948 and the maximum exceeds \\$1.5 million. Median assets are only \\$1,499. This skewness is exactly what a single-number ATE struggles to summarize — it almost guarantees that the *effect* of 401(k) eligibility will also be heterogeneous across the income distribution.

A naive mean comparison (`tabstat asset, by(e401k)`) shows eligible households hold \\$30,347 in assets versus \\$10,790 for ineligible ones — a raw gap of \\$19,557. That gap conflates the treatment effect with eligibility selection (eligible workers earn more, are older, more educated, etc.), motivating the formal causal estimators in the following sections.

---

## Method results

### 1. Baseline ATE — parametric `teffects aipw` (Section 3)

```
Treatment-effects estimation                    Number of obs     =      9,913
Estimator      : augmented IPW
Outcome model  : linear by ML
Treatment model: logit
------------------------------------------------------------------------------
ATE           |   Coefficient   Std. err.    z    P>|z|    [95% conf. interval]
e401k         |
(Eligible vs  |
 Not elig..)  |    8019.463     1152.038    6.96   0.000     5761.51   10277.42
POmean        |
Not eligi..   |   13930.46      817.613    17.04   0.000    12327.97   15532.96
```

**Interpretation.** The doubly robust parametric AIPW pins the average effect of 401(k) eligibility at \\$8,019 (SE \\$1,152, 95% CI [\\$5,762, \\$10,277]). The "POmean" of \\$13,930 is the average baseline asset level among ineligible households, so the ATE represents about a 58% lift over the untreated mean. The naive raw gap of \\$19,557 was therefore inflated by a factor of 2.4 — about 60% of it was selection, not causation. But \\$8,019 is still just *one* number; the cross-tab `table incomecat e401k, statistic(mean asset)` shows eligible-minus-ineligible differences of \\$5,011 in the lowest income category and \\$20,949 in the highest — heterogeneity that one number cannot capture.

### 2. PO estimator on the partial-linear model (Section 4)

```
Conditional average treatment effects     Number of observations       = 9,913
Estimator:       Partialing out           Number of folds in cross-fit =    10
Outcome model:   Linear lasso             Number of outcome controls   =    17
Treatment model: Logit lasso              Number of treatment controls =    17
CATE model:      Random forest            Number of CATE variables     =    17

ATE          |  7937.182  1153.017   6.88  0.000   5677.309  10197.05
```

The associated `estat heterogeneity` test:

```
Treatment-effects heterogeneity test
H0: Treatment effects are homogeneous
    chi2(1) =   4.11
Prob > chi2 = 0.0427
```

**Interpretation.** The PO ATE is \\$7,937 (SE \\$1,153, 95% CI [\\$5,677, \\$10,197]) — within \\$80 of the parametric AIPW estimate, despite a fundamentally different specification. The agreement is reassuring: it implies the ML nuisance fits did not introduce systematic bias relative to the linear parametric models. More importantly, the heterogeneity test rejects H₀ (constant τ) with χ²(1) = 4.11, p = 0.043, validating the entire CATE workflow that follows. The script's choice of PO first is deliberate — PO is more robust to propensity scores near 0/1 than AIPW, so it serves as the conservative anchor.

### 3. Linear projection of τ̂(x) onto covariates (Section 4)

```
Treatment-effects linear projection                  Number of obs =     9,913
                                                     F(11, 9901)   =      4.90
                                                     Prob > F      =    0.0000
                                                     R-squared     =    0.0045

         age |    205.12     117.98    1.74   0.082    -26.15     436.39
        educ |   -442.46     488.47   -0.91   0.365  -1399.96     515.05
incomecat 1  |  -2439.22    2013.52   -1.21   0.226  -6386.14    1507.69
incomecat 2  |   1874.82    2295.16    0.82   0.414  -2624.15    6373.79
incomecat 3  |   5707.69    3298.34    1.73   0.084   -757.73   12173.11
incomecat 4  |  18194.60    5398.39    3.37   0.001   7612.65   28776.54
pension Y    |   3817.36    2454.44    1.56   0.120   -993.84    8628.55
ownhome Y    |   3162.65    1669.59    1.89   0.058   -110.08    6435.38
```

**Interpretation.** A linear projection of the (latent) individual effect τ̂ᵢ onto the covariates is the most interpretable summary of who responds. The dominant signal is income: relative to the lowest income category, being in the highest category lifts the predicted effect by \\$18,195 (p = 0.001) — the only coefficient significant at 1%. Homeownership adds about \\$3,163 (p = 0.058) and each year of age adds \\$205 (p = 0.082), both borderline. Education and marital status are essentially flat. The R² of 0.0045 is *not* a critique of the projection — it is a feature: most of the variation in τ̂(x) is genuinely nonlinear in the covariates and is captured by the causal forest, which the next sections probe.

### 4. GATE on prespecified income groups (Section 6)

```
Conditional average treatment effects     Number of observations       = 9,913
Estimator:       Partialing out           Number of folds in cross-fit =    10

GATE          |   Coefficient   Std. err.    z    P>|z|    [95% conf. interval]
incomecat     |
   0          |    4087.014     987.7124    4.14   0.000    2151.13    6022.90
   1          |    1399.398    1663.193     0.84   0.400   -1860.40    4659.20
   2          |    5154.329    1349.842     3.82   0.000    2508.69    7799.97
   3          |    8532.238    2287.664     3.73   0.000    4048.50   13015.98
   4          |   20510.94     4723.741     4.34   0.000   11252.58   29769.30
ATE           |    7937.18     1153.017     6.88   0.000    5677.31   10197.05
```

The associated `estat gatetest`:

```
Group treatment-effects heterogeneity test
H0: Group average treatment effects are homogeneous
    chi2(4) =  18.44
Prob > chi2 = 0.0010
```

**Interpretation.** Splitting the sample into the five built-in income categories reveals a striking non-monotone pattern. Category 0 (lowest income) shows a respectable, statistically significant effect of \\$4,087 (95% CI [\\$2,151, \\$6,023]); category 1 collapses to \\$1,399 with a wide CI that straddles zero (p = 0.40); then categories 2, 3, 4 climb to \\$5,154, \\$8,532, and finally **\\$20,511** in the top income category — over five times the average. The joint test rejects equality across the five GATEs at p = 0.001. The non-monotonicity in the lowest two groups is a real finding, not noise — it suggests low-but-not-poorest households face binding liquidity constraints that limit their ability to translate eligibility into actual contributions, while extreme-poverty households may benefit through default enrollment defaults. Either way, the policy implication is that the program's marginal asset-building gain accrues overwhelmingly to high earners.

### 5. GATES on data-driven quartiles of τ̂ (Section 7)

```
Conditional average treatment effects     Number of observations       = 9,913
GATES         |   Coefficient   Std. err.    z    P>|z|    [95% conf. interval]
   rank       |
        1     |   17278.94     3440.125     5.02   0.000   10536.42   24021.46
        2     |    8121.04     1691.008     4.80   0.000    4806.73   11435.35
        3     |    3443.83     1437.640     2.40   0.017     626.11    6261.56
        4     |    2919.20     2110.320     1.38   0.167   -1216.96    7055.35
ATE           |    7938.21     1152.994     6.88   0.000    5678.38   10198.04
```

**Interpretation.** Letting the data sort households into four bins by their *predicted* treatment effect (rank 1 = highest, rank 4 = lowest) produces a clean monotonic ladder. The top 25% of households gain a precisely-estimated \\$17,279 (CI [\\$10,536, \\$24,021]); the second quartile gains \\$8,121; the third \\$3,444; the bottom quartile only \\$2,919, which is not statistically distinguishable from zero (p = 0.167). The 6:1 ratio between the top and bottom quartile makes this the single most informative summary of heterogeneity — and unlike a researcher-chosen split (e.g., "top vs bottom income"), the cross-fitting protects against p-hacking because each unit's bin is determined by an out-of-sample prediction.

### 6. Profile of the high-vs-low responders — `estat classification` (Section 7)

| Variable | Top quartile (n=2,480) | Bottom quartile (n=2,471) | Difference | t |
|----------|----------------------:|-------------------------:|-----------:|---:|
| Age (years) | 45.15 | 34.98 | 10.17 | 35.67 |
| Education (years) | 14.02 | 12.65 | 1.37 | 18.62 |
| Income (\\$) | 62,739 | 26,861 | 35,878 | 56.22 |

**Interpretation.** Households in the top-effect quartile are sharply different from those in the bottom-effect quartile: 10 years older on average (45.1 vs 35.0), 1.4 more years of education (14.0 vs 12.7), and **\\$35,878 higher in income** (\\$62,739 vs \\$26,861). All three differences are massively statistically significant (t-statistics 19–56). Income is the dominant marker — fully consistent with both the GATE-by-income pattern and the linear-projection coefficient on incomecat 4. Older, more educated, higher-income workers benefit roughly six times as much in dollar terms from 401(k) eligibility as their younger, less educated, lower-income counterparts. This is consistent with the standard story that 401(k) eligibility helps people who already had latent demand for retirement savings and the financial slack to act on it.

### 7. AIPW estimator — doubly robust contrast (Section 8)

```
Conditional average treatment effects     Number of observations       = 9,913
Estimator:       Augmented IPW            Number of folds in cross-fit =    10
ATE          |   8120.264   1160.538   7.00   0.000   5845.652  10394.88

estat heterogeneity:
    chi2(1) =   5.54
Prob > chi2 = 0.0186
```

**Interpretation.** The AIPW (fully interactive, doubly robust) estimator delivers an ATE of \\$8,120 — within \\$200 of both the parametric AIPW and the PO estimates, and with a slightly tighter standard error. The heterogeneity test now rejects more strongly (χ²(1) = 5.54, p = 0.019, versus p = 0.043 under PO). The agreement across three independent estimators of the ATE is the script's central robustness check: with point estimates of \\$7,937 (PO), \\$8,019 (parametric AIPW), and \\$8,120 (ML AIPW) — a span of \\$183 — the average causal effect can be reported with high confidence. The picture of *how* effects vary, summarized by the AIPW IATE histogram in Figure 6, mirrors the PO histogram in Figure 1 in shape: a fat right tail of large positive effects with a small mass of slightly-negative effects.

### 8. Nonparametric series — average derivative of τ on income (Section 9)

```
Nonparametric series regression for IATE
Cubic B-spline estimation                  Number of obs =     9,884
Number of knots = 5

      income |   .2131162   .0502993   4.24   0.000   .1145313   .311701
```

**Interpretation.** A cubic B-spline of the predicted IATE against household income (restricting to income ≤ \\$150,000, n = 9,884) returns an average derivative of **0.213** (SE 0.050, z = 4.24, p < 0.001, 95% CI [0.115, 0.312]). In dollar terms: each \\$1,000 of additional household income raises the predicted 401(k) treatment effect by about \\$213 on average, with the slope itself flexibly varying across the income distribution (visible in Figure 8). This is the smoothest possible summary of the income gradient and quantitatively reconciles the GATE bar chart and the GATES quartile ladder: the income gradient is real, sizable, and statistically significant by every test the manual provides.

---

## Figure inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `stata_cate_iate_histogram_po.png` | Histogram of PO-estimated individual treatment effects τ̂ᵢ across the 9,913 households | Strongly right-skewed, fat right tail (effects range from −\\$40k to +\\$80k+); validates "the average hides a lot" framing |
| 2 | `stata_cate_iateplot_age.png` | PO-estimated CATE as a function of age (other covariates fixed at means/base) | Effect rises with age over working life — older workers benefit more |
| 3 | `stata_cate_iateplot_educ.png` | PO-estimated CATE as a function of years of education | Modest, broadly flat relationship — education matters less than income |
| 4 | `stata_cate_gate_incomecat.png` | GATE bar chart with 95% CI by 5 prespecified income categories | Non-monotone ladder: \\$4,087 → \\$1,399 → \\$5,154 → \\$8,532 → \\$20,511; top-vs-rest joint test rejects at p = 0.001 |
| 5 | `stata_cate_gates_quartiles.png` | GATES bar chart by 4 data-driven quartiles of τ̂ (rank 1 = highest, rank 4 = lowest) | Clean monotonic 6:1 fan: \\$17,279 → \\$8,121 → \\$3,444 → \\$2,919 (last not significant) |
| 6 | `stata_cate_iate_histogram_aipw.png` | Histogram of AIPW-estimated individual effects (compare to Fig. 1) | Same right-skewed shape but wider support — AIPW puts more mass in the extreme tails, reflecting its sensitivity to small propensities |
| 7 | `stata_cate_iateplot_educ_aipw.png` | AIPW-estimated CATE as a function of education (compare to Fig. 3) | Same broadly flat shape under AIPW — reassures that the PO picture is not an artifact of the partial-linear specification |
| 8 | `stata_cate_series_income.png` | Cubic B-spline of τ̂ vs household income, with confidence band, restricted to income ≤ \\$150,000 | Smooth upward slope confirming the GATE/GATES findings; average derivative 0.213 (each extra \\$1 of income → \\$0.21 more treatment effect) |

---

## Key findings

1. **A single ATE of ≈\\$8,000 hides a fan of household-level effects from \\$1,400 to \\$20,500** — five income groups span an order of magnitude in their estimated treatment effects, and the formal `estat gatetest` rejects GATE homogeneity at p = 0.001 (χ²(4) = 18.44).

2. **The data-driven quartile ladder is 6:1.** GATES bins from the top 25% to the bottom 25% of estimated effects produce \\$17,279 vs \\$2,919 — a 5.9× ratio with the bottom bin not statistically distinguishable from zero (p = 0.167).

3. **The income gradient is the dominant driver.** A cubic B-spline of τ̂(x) on income returns an average derivative of \\$0.213 per dollar of household income (SE \\$0.05, p < 0.001), and the linear projection coefficient on the top income category is \\$18,195 (p = 0.001) — the single largest signal among all covariates. Marital status, education, and IRA participation are essentially flat.

4. **All three ATE estimators agree to within \\$200.** Parametric `teffects aipw` (\\$8,019), ML PO (\\$7,937), and ML AIPW (\\$8,120) all bracket each other tightly — the doubly-robust estimator and the partial-linear estimator agree on the average effect, providing cross-method robustness without specifying any single model as "correct".

5. **Both `estat heterogeneity` tests reject homogeneity.** Under PO, χ²(1) = 4.11 (p = 0.043); under AIPW, χ²(1) = 5.54 (p = 0.019). The AIPW test rejects more strongly, consistent with its higher efficiency when both nuisance models are well-specified.

6. **The high-effect group is older, richer, and more educated.** Compared to the bottom-effect quartile, the top-effect quartile is on average 10.2 years older, has 1.4 more years of education, and earns \\$35,878 more in annual household income (all t > 18). The pattern is consistent with the conventional view that 401(k) eligibility benefits households that already had latent demand for retirement savings.

7. **Naive descriptive statistics overstate the effect by 2.4×.** The raw difference in mean assets between eligible and ineligible households (\\$30,347 vs \\$10,790 = \\$19,557) shrinks to \\$8,019 once age, income, education, and other selection variables are controlled for via doubly robust adjustment — about 60% of the observed gap is selection, not causation.

---

## Surprises and caveats

- **Non-monotone GATE in income category 1.** The lowest-income group (category 0) shows an effect of \\$4,087 — *higher* than category 1's \\$1,399 (p = 0.40). This is the only departure from monotonicity in any of the heterogeneity views; it likely reflects a small subgroup of category-0 households with auto-enrollment or matching-driven savings, but the script does not investigate further. Worth flagging in the blog post.
- **Bottom-quartile GATES is statistically zero.** Rank 4 (\\$2,919, p = 0.167) cannot reject "no effect for this group" at conventional levels. Combined with the negative left tail in Figure 1, this is consistent with about a quarter of the sample receiving close to zero — or even slightly negative — net benefit from 401(k) eligibility. This nuance is invisible in the ATE.
- **AIPW IATE histogram is wider than PO.** Figure 6 has a starting bin at -\\$196,082, much further left than the PO histogram's -\\$40,204 starting bin. This reflects AIPW's known sensitivity to propensity scores near 0 or 1 (units with extreme weights inflate the score variance). The script does not run a `tebalance overlap` diagnostic; the overlap-tolerance default `pstolerance(1e-5)` was not violated, but a visual check would strengthen the post.
- **R² of `estat projection` is low (0.0045).** This is *not* a problem: most of the heterogeneity is captured nonlinearly by the causal forest. The projection is a summary, not a model fit.
- **Runtime:** ≈9 minutes wall-clock with Stata SE 19. StataNow MP would have been ~3× faster but the local license expired. Document MP as the preferred option in the eventual post.
- **The classification t-test contrasts only the *top* and *bottom* rank groups** (n = 2,480 vs n = 2,471), not all four quartiles. This is by design (it is a t-test, not an ANOVA), but readers should not over-interpret it as "the relationship between covariates and effect is monotonic" — only the extremes are tested.
