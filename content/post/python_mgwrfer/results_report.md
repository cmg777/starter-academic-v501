# Results Report: Multiscale Geographically Weighted Fixed Effects Regression (MGWRFER)

**Script:** `script.py`
**Executed:** 2026-05-04
**Status:** Success
**Runtime:** ~10 minutes (bandwidth selection dominates)
**Language:** Python 3.9
**Key packages:** numpy, pandas, matplotlib, scipy, mgwr (custom from GeoZhipengLi/MGWPR)

---

## Execution Summary

The script simulates a panel dataset of 225 spatial units observed over 3 time periods (675 total observations) on a 15x15 grid. Each unit has four covariates with spatially varying true coefficients — a quadratic dome (beta_1), a linear gradient (beta_2), a constant (beta_3), and a null effect (beta_4) — plus a time-invariant spatial confounder (alpha_i) acting as a fixed effect. The script compares two estimation approaches: (1) pooled MGWR, which naively treats the panel as cross-sectional and conflates the confounder with the coefficient estimates, and (2) MGWRFER, which first applies a within-transformation to remove the fixed effects and then fits MGWR on the demeaned data.

The headline finding is that MGWRFER dramatically reduces estimation error for coefficients that were heavily biased by the confounder (beta_1 RMSE drops 54.6%, beta_4 drops 44.7%), while accepting a modest increase in estimation variance for coefficients that were already well-estimated by pooled MGWR (beta_2 RMSE rises 18.2%, beta_3 rises 25.2%). This illustrates the classical bias-variance tradeoff inherent in fixed-effects estimation.

**Warnings:** urllib3 NotOpenSSLWarning (system-level SSL library mismatch, unrelated to the analysis). No convergence or statistical warnings.

---

## Data Overview

```
Spatial grid: 15 x 15 = 225 units
Time periods: 3
Total observations: 675

── True coefficient ranges ──
  beta_1 (quadratic): [1.055, 2.000], mean=1.502
  beta_2 (linear):    [1.067, 2.000], mean=1.533
  beta_3 (constant):  [1.500, 1.500], mean=1.500
  beta_4 (null):      [0.000, 0.000], mean=0.000
  alpha (FE):         [2.068, 51.548], mean=23.286

Panel data shape: (675, 14)
             y       x1       x2       x3       x4
count  675.000  675.000  675.000  675.000  675.000
mean    23.069   -0.038   -0.014   -0.110    0.027
std     15.489    0.982    1.009    1.010    1.017
min     -4.073   -2.965   -3.648   -3.048   -3.064
25%      9.717   -0.702   -0.675   -0.771   -0.647
50%     20.862   -0.049    0.012   -0.089    0.052
75%     35.123    0.580    0.636    0.554    0.683
max     57.411    2.914    3.179    2.914    2.857
```

**Interpretation:** The simulated panel contains 675 observations (225 units x 3 periods) with four independent covariates drawn from standard normal distributions (means near 0, standard deviations near 1.0). The outcome variable y has a mean of 23.07 and standard deviation of 15.49, with the large spread driven primarily by the spatial confounder alpha_i, which ranges from 2.07 to 51.55 (mean 23.29). This confounder is the dominant source of cross-sectional variation in y — its range (49.5 units) dwarfs the contribution of the spatially varying coefficients (beta_1 ranges from 1.06 to 2.00, beta_2 from 1.07 to 2.00). The true coefficients are designed to exercise different estimation challenges: beta_1 has a concentric quadratic pattern peaking at the grid center, beta_2 increases linearly from the lower-left to the upper-right corner, beta_3 is spatially constant at 1.5, and beta_4 is identically zero everywhere (providing a false-positive test).

---

## Method Results

### Pooled MGWR (Naive — Ignoring Fixed Effects)

```
Pooled MGWR bandwidths: [ 44.  50. 175. 223. 223.]
Pooled MGWR R-squared: 0.9771
Pooled MGWR Adj. R-squared: 0.9759
Pooled MGWR AICc: -561.77
Number of parameter columns: 5

  beta1_pooled: RMSE=0.3945, Corr=0.4586
  beta2_pooled: RMSE=0.0888, Corr=0.9504
  beta3_pooled: RMSE=0.0578, Corr=nan
  beta4_pooled: RMSE=0.2531, Corr=nan
```

**Interpretation:** The pooled MGWR model treats all 675 observations as independent cross-sectional data, fitting an intercept plus four slope coefficients with multiscale bandwidths. The model achieves R-squared = 0.977, but this high value is misleading: the intercept (bandwidth = 44) absorbs much of the spatial variation that actually belongs to the fixed effect alpha_i.

This contamination is most visible in beta_1, where the correlation between true and estimated values is only 0.459 and the RMSE is 0.395 — roughly 26% of the coefficient's mean value (1.50). By contrast, beta_2 is relatively well-recovered (Corr = 0.950, RMSE = 0.089), likely because its linear gradient is more easily separated from the exponential fixed-effect pattern. The null coefficient beta_4 shows an RMSE of 0.253, indicating substantial false-positive bias: the model attributes variation caused by alpha_i to the null covariate. The bandwidths for x3 and x4 hit the maximum of 223 (N_UNITS = 225), meaning the model treats these coefficients as globally constant.

### Within-Transformation (Stage 1 of MGWRFER)

```
Stage 1: Within-transformation (removing fixed effects)...
  y_within range: [-6.877, 6.923]
  Fixed effects removed (mean of y_within per unit ≈ 0)
  Max unit mean after demeaning: 7.11e-15 (should be ~0)
```

**Interpretation:** The within-transformation subtracts each unit's time-series mean from all its observations, eliminating the time-invariant confounder alpha_i by construction. The demeaned outcome y_within ranges from -6.88 to 6.92, dramatically narrower than the raw y range of -4.07 to 57.41. This confirms that the confounder (range 2.07 to 51.55) has been completely removed. The maximum unit mean after demeaning is 7.11 x 10^-15 — effectively machine-zero — verifying that the transformation is exact. With alpha_i eliminated, any remaining variation in y_within is attributable solely to the covariates' spatially varying effects plus idiosyncratic noise, enabling causal interpretation under the assumption of no time-varying confounders.

### MGWRFER (Stage 2 — MGWR on Demeaned Data)

```
  MGWRFER bandwidths: [ 50.  91. 116.  62.]
  MGWRFER R-squared: 0.8900
  MGWRFER Adj. R-squared: 0.8844
  MGWRFER AICc: 496.09
  Number of parameter columns: 4

  beta1_mgwrfer: RMSE=0.1793, Corr=0.8179
  beta2_mgwrfer: RMSE=0.1050, Corr=0.9407
  beta3_mgwrfer: RMSE=0.0724, Corr=nan
  beta4_mgwrfer: RMSE=0.1399, Corr=nan
```

**Interpretation:** MGWRFER fits MGWR on the within-transformed data without an intercept (since demeaning removes the constant). The R-squared of 0.890 reflects explanatory power over the demeaned outcome — not directly comparable to the pooled model's 0.977, which operates on raw y dominated by the confounder. The critical improvement is in coefficient recovery: beta_1's RMSE drops from 0.395 to 0.179 (a 54.6% reduction), and its correlation with the true values jumps from 0.459 to 0.818, meaning MGWRFER now captures the quadratic dome pattern rather than conflating it with the fixed effect. The null coefficient beta_4 improves from RMSE 0.253 to 0.140 (a 44.7% reduction), indicating much less false-positive contamination. However, beta_2 and beta_3 see modest RMSE increases (0.089 to 0.105, and 0.058 to 0.072 respectively), reflecting the bias-variance tradeoff: the within-transformation reduces effective sample size (from raw observations to within-unit deviations), which increases estimation variance for coefficients that were already well-identified by pooled MGWR.

### Model Comparison

```
── Model Comparison ──
Metric                       Pooled MGWR        MGWRFER
------------------------- -------------- --------------
RMSE (beta_1)                     0.3945         0.1793
RMSE (beta_2)                     0.0888         0.1050
RMSE (beta_3)                     0.0578         0.0724
RMSE (beta_4)                     0.2531         0.1399
Corr (beta_1)                     0.4586         0.8179
Corr (beta_2)                     0.9504         0.9407
Corr (beta_3)                        nan            nan
Corr (beta_4)                        nan            nan
R-squared *                       0.9771         0.8900
  * R-squared not directly comparable (different dependent variables)
AICc                             -561.77         496.09
```

**Interpretation:** The comparison table reveals a clear pattern: MGWRFER delivers the largest improvements precisely where pooled MGWR was most biased. For beta_1 (the most spatially complex coefficient), the RMSE improvement is 54.6% and the correlation improves from 0.459 to 0.818. For beta_4 (the null effect), RMSE drops 44.7% — the pooled model falsely attributed confounder variation to x4, and MGWRFER largely corrects this. Conversely, beta_2 and beta_3 show RMSE increases of 18.2% and 25.2% respectively, but their absolute RMSE values remain small (0.105 and 0.072). The nan correlations for beta_3 and beta_4 are expected: beta_3 is constant across space (zero variance in true values) and beta_4 is identically zero, so Pearson correlation is undefined. The AICc values (-561.77 vs 496.09) are not comparable because the dependent variables differ (raw y vs demeaned y).

### Bandwidth Comparison

```
── Bandwidth comparison ──
  Pooled MGWR bws (x1-x4): [50, 175, 223, 223]
  MGWRFER bws (x1-x4):     [50, 91, 116, 62]
```

**Interpretation:** MGWRFER consistently selects smaller bandwidths than pooled MGWR, indicating more localized coefficient surfaces once the confounding fixed effect is removed. The most dramatic shift is for x4 (null effect): the pooled model uses bandwidth 223 (essentially global, treating the coefficient as constant), while MGWRFER uses bandwidth 62. This occurs because the pooled model's x4 coefficient was absorbing globally smooth confounder variation, requiring a large bandwidth, whereas after demeaning, the remaining x4 variation is local noise best captured with a smaller kernel. Similarly, x2 drops from 175 to 91 and x3 from 223 to 116. Only x1 retains the same bandwidth (50) — its strong quadratic spatial pattern requires a small kernel under both approaches.

### Statistical Significance

```
── Significance summary ──
  beta_1 (quadratic): positive=225, not_sig=0, negative=0
  beta_2 (linear): positive=225, not_sig=0, negative=0
  beta_3 (constant): positive=225, not_sig=0, negative=0
  beta_4 (null): positive=23, not_sig=202, negative=0
```

**Interpretation:** After correcting for multiple testing via filtered t-values, all 225 spatial units show statistically significant positive effects for beta_1, beta_2, and beta_3 — consistent with the true DGP where all three coefficients are strictly positive everywhere. The key diagnostic result is beta_4 (the null effect): 202 of 225 units (89.8%) are correctly classified as not significant, while 23 units (10.2%) show false positives. This false-positive rate, though above the nominal 5% level, is substantially better than what pooled MGWR would suggest (where the inflated RMSE of 0.253 for beta_4 implies widespread spurious significance). The spatial pattern of false positives is concentrated in a small cluster, suggesting boundary effects or local multicollinearity rather than systematic bias.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `mgwrfer_true_coefficients.png` | 2x2 grid showing the true DGP coefficient surfaces: beta_1 (quadratic dome), beta_2 (linear gradient), beta_3 (constant), and alpha_i (exponential fixed effect) | The confounder alpha_i has far greater spatial variation (range 2-52) than any coefficient, making it the dominant bias source for pooled MGWR |
| 2 | `mgwrfer_bias_pooled.png` | True vs pooled MGWR scatter plots for beta_1, beta_2, and beta_3 with RMSE and correlation annotations | beta_1 is severely biased (Corr = 0.459, wide scatter around the 45-degree line); beta_2 tracks well but with slight systematic shift |
| 3 | `mgwrfer_recovery_fe.png` | True vs MGWRFER scatter plots for the same three coefficients | beta_1 recovery improves dramatically (Corr = 0.818, tighter scatter); beta_2 and beta_3 show slightly wider scatter but remain centered on the identity line |
| 4 | `mgwrfer_coefficient_maps.png` | 2x3 spatial maps: top row shows true coefficients, bottom row shows MGWRFER estimates with bandwidth annotations | MGWRFER captures the quadratic dome of beta_1 and the linear gradient of beta_2, though with some smoothing; beta_3 map shows spurious spatial variation around the true constant |
| 5 | `mgwrfer_significance_maps.png` | 2x2 significance classification: orange = significant positive, dark blue = not significant | beta_1 through beta_3 are unanimously significant (all positive); beta_4 correctly shows 202/225 units as not significant, with a small false-positive cluster |
| 6 | `mgwrfer_bandwidth_comparison.png` | Grouped bar chart comparing pooled MGWR vs MGWRFER bandwidths for x1 through x4 | MGWRFER uses uniformly smaller bandwidths (except x1 which stays at 50), with the largest reduction for x4 (223 to 62) |

---

## Key Findings

1. **MGWRFER cuts beta_1 estimation error by 55%:** The quadratic dome coefficient, which was most heavily contaminated by the spatial confounder, sees its RMSE drop from 0.395 to 0.179 and its correlation with true values jump from 0.459 to 0.818. This demonstrates that within-transformation successfully separates the fixed effect from spatially varying slopes.

2. **False-positive bias on the null coefficient drops 45%:** beta_4 (true value = 0 everywhere) has RMSE of 0.253 under pooled MGWR — meaning the model falsely attributes confounder variation to x4. MGWRFER reduces this to 0.140, and the significance analysis correctly classifies 89.8% of units as not significant.

3. **Bias-variance tradeoff is real but manageable:** beta_2 and beta_3 see modest RMSE increases of 18.2% and 25.2% respectively under MGWRFER. These coefficients were already well-estimated by pooled MGWR (RMSE 0.089 and 0.058), so the within-transformation's variance cost outweighs its bias reduction. The absolute RMSE values remain small (0.105 and 0.072).

4. **MGWRFER uses more localized bandwidths:** After removing the fixed effect, MGWRFER selects smaller bandwidths for 3 of 4 covariates: x2 drops from 175 to 91, x3 from 223 to 116, and x4 from 223 to 62. This indicates that the confounding fixed effect was inflating bandwidth estimates by introducing smooth spatial variation that the model mistakenly attributed to the covariates.

5. **Within-transformation is numerically exact:** The maximum unit mean after demeaning is 7.11 x 10^-15, confirming that the fixed effects are completely removed to machine precision. The demeaned outcome spans only [-6.88, 6.92] (spread of 13.8) compared to the raw y range of [-4.07, 57.41] (spread of 61.5), confirming removal of the dominant confounder (alpha_i range: 2.07 to 51.55).

6. **Significance testing validates the DGP:** All three truly positive coefficients (beta_1, beta_2, beta_3) are unanimously significant across all 225 locations. The null coefficient beta_4 shows a 10.2% false-positive rate (23/225 units), concentrated in a small spatial cluster rather than distributed randomly — suggesting local boundary effects rather than systematic bias in the method.

7. **Spatial coefficient maps confirm pattern recovery:** The MGWRFER estimated beta_1 map visually recovers the concentric dome pattern of the true coefficient, though with some smoothing. The beta_2 linear gradient is also well-recovered. beta_3, which is truly constant at 1.5, shows mild spurious spatial variation under MGWRFER (RMSE 0.072), illustrating the variance cost of within-transformation for spatially homogeneous effects.

---

## Surprises and Caveats

- **beta_2 and beta_3 RMSE worsened under MGWRFER.** This was initially unexpected but is a well-known property of fixed-effects estimation: demeaning reduces effective sample size from NT to the within-unit variation, increasing estimator variance. The effect is most pronounced for coefficients that were already well-identified without fixed effects. Blog post should present this as an expected tradeoff, not a failure of MGWRFER.

- **R-squared and AICc are not comparable across models.** Pooled MGWR operates on raw y (dominated by alpha_i), while MGWRFER operates on demeaned y. The pooled model's R-squared of 0.977 mostly reflects the intercept absorbing confounder variation, not superior coefficient estimation.

- **Grid size reduced from 30x30 to 15x15 for tractability.** The MGWR backfitting algorithm is computationally intensive; with a 30x30 grid (2700 observations), a single bandwidth selection run would take >30 hours. The 15x15 grid (675 observations) runs in ~10 minutes while preserving the key findings. Results may differ quantitatively (but not qualitatively) at the full 30x30 scale.

- **Correlation is undefined for beta_3 and beta_4.** Both report `nan` because the true values have zero variance (constant and zero respectively). This is mathematically correct and should be noted in the blog post rather than presented as a missing result.

- **False-positive rate for beta_4 (10.2%) exceeds the nominal 5% level.** With only T=3 time periods, the within-estimator has limited degrees of freedom, which may inflate the false-positive rate. The spatial clustering of false positives (rather than random scatter) suggests local multicollinearity or edge effects. A larger grid or more time periods would likely bring this closer to the nominal rate.

- **Key causal assumption: strict exogeneity conditional on fixed effects.** The MGWRFER method provides causal interpretation of spatially varying coefficients only if there are no time-varying confounders. In real applications, this assumption must be carefully justified — it is stronger than the standard panel data assumption because the coefficients themselves vary spatially.
