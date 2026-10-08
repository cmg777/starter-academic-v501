# Results Report: Regional Inequality and the Kuznets Curve

**Script:** `script.py`
**Executed:** 2026-04-28
**Status:** Success (non-fatal warnings only)
**Runtime:** ~30 seconds
**Language:** Python 3.13 (miniforge3/quantecon)
**Key packages:** pyfixest 0.50.1, great_tables 0.21.0, pandas, numpy, matplotlib

---

## Execution Summary

The script loads two panel datasets (180 countries, 5-year period averages from 1992-2012) and tests whether the relationship between regional inequality (population-weighted Gini) and national development (log GDP per capita) follows a classic inverted-U (Kuznets hypothesis) or an N-shaped curve. The analysis progresses from pooled OLS through two-way fixed effects, computes turning points of the fitted polynomial, and then investigates what determinants---resources, trade, mobility, aid/education, and ethnicity---drive regional inequality beyond the Kuznets curve. All results replicate Lessmann & Seidel (2017), European Economic Review.

The headline finding is that the relationship is **N-shaped, not inverted-U**: regional inequality peaks at about $2,287 GDP per capita, falls through middle-income levels, and begins rising again beyond $77,205. All three polynomial terms are individually significant at the 1% level in the cubic TWFE specification. Among determinants, ethnic income inequality is by far the strongest predictor of regional inequality (coefficient 0.071, p < 0.001).

**Warnings:** UnicodeWarning from `pd.read_stata()` (latin-1 fallback, harmless for numeric variables). Singleton fixed effects dropped in several TWFE models (1 to 6 singletons, standard pyfixest behavior for unbalanced panels). OMP deprecation notice (internal to numba). All warnings are non-fatal and do not affect results.

---

## Data Overview

### Table 3 dataset (Kuznets curve)

```
Shape: (880, 7)
Columns: ['id', 'year', 'country', 'gini', 'log_GDPpc', 'log_GDPpc2', 'log_GDPpc3']

Descriptive statistics:
             id      year      gini  log_GDPpc  log_GDPpc2  log_GDPpc3
count  880.0000  880.0000  880.0000   880.0000    880.0000    880.0000
mean    89.9932    3.0318    0.0641     8.7599     78.2732    712.3774
std     51.9770    1.4090    0.0332     1.2403     21.6226    288.5019
min      1.0000    1.0000    0.0019     5.2458     27.5184    144.3558
25%     45.0000    2.0000    0.0381     7.7617     60.2448    467.6052
50%     89.5000    3.0000    0.0605     8.8514     78.3474    693.4843
75%    134.0000    4.0000    0.0847     9.7595     95.2473    929.5637
max    180.0000    5.0000    0.1601    11.6716    136.2253   1589.9617

Panel structure:
  Countries: 180
  Time periods: [1.0, 2.0, 3.0, 4.0, 5.0]

Observations per period:
  Period 1: 168 | Period 2: 175 | Period 3: 178 | Period 4: 179 | Period 5: 180
```

**Interpretation:** The dataset contains 880 country-period observations spanning 180 countries across 5 time periods (approximately 1992-2012 in 4-year intervals). The panel is slightly unbalanced, with 168 countries observed in the first period growing to 180 by the last. The mean regional Gini is 0.064 with substantial variation (SD = 0.033, range 0.002 to 0.160), indicating that some countries have highly equal regional income distributions while others show pronounced disparities. Log GDP per capita ranges from 5.25 (about $190, the poorest nations) to 11.67 (about $117,000, oil-rich Gulf states), capturing the full development spectrum. The polynomial terms (log_GDPpc2, log_GDPpc3) are pre-computed in the dataset, which ensures consistency with the original Stata analysis.

### Table 4 dataset (Determinants)

```
Shape: (880, 21)
Key variables: gini, lnGDPpc (+ squared/cubed), rents, land, trade, fdi,
               gasoline, areaXgasoline, aid, school, ethnic_gini

Notable missing values:
  aid:         711 / 880 (19% missing)
  school:      748 / 880 (15% missing)
  ethnic_gini: 845 / 880 (4% missing)
```

**Interpretation:** The determinants dataset includes the same 880 observations but adds 14 covariates capturing resources, trade, mobility, governance, and ethnicity. Missing data is most pronounced for foreign aid (19% missing) and school enrollment (15% missing), which reduces sample sizes in Models 4 and 5 of the determinants analysis (585 and 844 observations respectively). The ethnic Gini has the largest coefficient range (0 to 0.81) and the highest mean (0.27), reflecting that many countries have substantial ethnic income inequality. Trade openness, resource rents, and FDI show high variance, consistent with the diverse country sample.

---

## Method Results

### Pooled OLS: Linear, Quadratic, and Cubic

```
Pooled OLS Coefficient Comparison:
Variable           Linear    Quadratic      Cubic
------------------------------------------------
log_GDPpc         -0.0108       0.0148     0.2405
log_GDPpc2            ---      -0.0015    -0.0279
log_GDPpc3            ---          ---     0.0010

R-squared:         0.164        0.170      0.176
```

**Interpretation:** The pooled OLS results establish an important baseline. The linear model shows a significant negative association between development and inequality (coefficient -0.011, p < 0.001), but explains only 16.4% of the variation. Adding the quadratic term barely improves fit (R-squared rises to 0.170) and neither the linear nor quadratic term is individually significant, suggesting the simple inverted-U does not hold in the pooled data. The cubic specification reveals the N-shaped pattern (coefficients: 0.241, -0.028, 0.001) with all terms marginally significant (p-values 0.066, 0.070, 0.088), but these are pooled estimates that confound between-country and within-country variation. The low R-squared (0.176) confirms that cross-sectional variation dominates and country-specific factors are not controlled.

### Two-Way Fixed Effects: Replicating Table 3

```
TWFE Cubic Model (Model 3):
  log_GDPpc:   0.293 (SE 0.078, p < 0.001) ***
  log_GDPpc2: -0.032 (SE 0.009, p < 0.001) ***
  log_GDPpc3:  0.001 (SE 0.000, p = 0.001) ***
  R-squared: 0.975 | R-squared Within: 0.142
  Observations: 879

Pooled OLS vs TWFE (cubic):
  log_GDPpc:   0.2405  vs  0.2931
  log_GDPpc2: -0.0279  vs -0.0320
  log_GDPpc3:  0.0010  vs  0.0011
```

**Interpretation:** Adding country and year fixed effects transforms the results dramatically. All three polynomial terms become highly significant (p < 0.001 for each), confirming the N-shaped relationship within countries over time. The overall R-squared of 0.975 indicates that country fixed effects absorb the vast majority of cross-sectional variation in inequality---97.5% of total variation is explained once we account for which country and which period we are observing. The within-R-squared of 0.142 tells us that the cubic polynomial explains about 14.2% of the within-country variation in inequality, which is substantial given the short time dimension (5 periods). Compared to pooled OLS, the TWFE coefficients are slightly larger in magnitude (e.g., 0.293 vs 0.241 for the linear term), and---crucially---the significance improves from marginal (p ~ 0.07) to highly significant (p < 0.001), underscoring how fixed effects resolve omitted variable bias.

### The Linear TWFE Model is Uninformative

```
Linear TWFE:
  log_GDPpc: -0.003 (SE 0.003, p = 0.265)
  R-squared Within: 0.009
```

**Interpretation:** The linear TWFE model yields a coefficient of -0.003 that is statistically insignificant (p = 0.265) with a within-R-squared of only 0.009. This is an important pedagogical finding: a researcher who only estimates the linear specification would conclude that development has no relationship with inequality within countries. The result is misleading because the true relationship is nonlinear---inequality rises with early development and falls later, so the linear approximation averages out to roughly zero. This demonstrates why polynomial specifications are essential when testing the Kuznets hypothesis.

### Turning Points of the N-Shaped Curve

```
Cubic TWFE coefficients: b1 = 0.293112, b2 = -0.031969, b3 = 0.001122

First derivative: d(Gini)/d(ln GDP) = 0.2931 + (-0.0639)*x + 0.0034*x^2
Turning points (log scale): [7.735, 11.254]
Turning points (USD PPP):   [$2,287, $77,205]
```

**Interpretation:** Setting the first derivative of the cubic polynomial to zero and solving yields two turning points that define three development phases. The first turning point at $2,287 GDP per capita marks where regional inequality peaks: below this threshold (very poor countries like Liberia and the DRC), development initially concentrates income in a leading region, widening the gap. Between $2,287 and $77,205 (the vast majority of countries, from Kenya through most of Europe), further development is associated with falling regional inequality as lagging regions catch up. The second turning point at $77,205 suggests that the richest nations (essentially Qatar, Luxembourg, and similar outliers) may see inequality rise again as knowledge-economy agglomeration re-concentrates activity. These values closely replicate the paper's reported thresholds of approximately $2,288 and $77,128, with minor differences attributable to rounding in the original Stata analysis.

### Determinants of Regional Inequality (Table 4)

```
Determinant Effects Summary:
Variable                Coefficient  Significant
------------------------------------------------
Resource rents               0.0183      Yes ***
Arable land                 -0.0529      Yes ***
Trade openness               0.0051      Yes ***
FDI                          0.0094           No
Gasoline price               0.0006           No
Area x Gasoline              0.0060      Yes ***
Foreign aid                  0.0152      Yes ***
School enrollment           -0.0141      Yes ***
Ethnic Gini                  0.0709      Yes ***
```

**Interpretation:** Seven of nine determinants are statistically significant at the 10% level. Ethnic income inequality is the single strongest driver (coefficient 0.071, p < 0.001): a one-unit increase in the ethnic Gini is associated with a 7.1-percentage-point increase in regional inequality, holding the Kuznets curve constant. This is economically large given that the mean regional Gini is only 0.064. Arable land has the second-largest effect in absolute value but with the opposite sign (-0.053, p < 0.001), indicating that agricultural economies tend toward more equal regional development, likely because farming activity is geographically dispersed.

Resource rents increase inequality (0.018, p = 0.008), consistent with the "resource curse" concentrating extractive income in specific regions. Trade openness modestly increases inequality (0.005, p = 0.007), suggesting that internationally connected regions pull ahead. Foreign aid increases inequality (0.015, p = 0.028), possibly because aid flows concentrate in capital cities. School enrollment reduces inequality (-0.014, p = 0.053), consistent with human capital diffusion promoting convergence.

FDI and gasoline price alone are not significant, though the interaction of gasoline price with country area is (0.006, p = 0.049), indicating that transport costs matter more in geographically large countries.

### Coefficient Stability Across Specifications

```
Specification       ln(GDP)    ln(GDP)^2    ln(GDP)^3
----------------------------------------------------
Baseline (Table 3)     0.2931      -0.0320       0.0011
Resources              0.3498      -0.0380       0.0013
Trade                  0.2054      -0.0222       0.0008
Mobility               0.1711      -0.0186       0.0007
Aid/Educ.              0.2264      -0.0232       0.0007
Ethnicity              0.1492      -0.0153       0.0005
```

**Interpretation:** The sign pattern (+, -, +) for the three polynomial terms is preserved across all six specifications, confirming the robustness of the N-shaped Kuznets curve. However, the magnitudes attenuate noticeably when ethnic inequality is included: the linear term drops from 0.293 to 0.149, and the cubic term halves from 0.0011 to 0.0005. This suggests that part of what appears as a "development effect" on regional inequality is actually driven by ethnic income disparities that correlate with development levels. The Resources specification actually strengthens the polynomial coefficients (0.350, -0.038, 0.001), indicating that controlling for resource rents and arable land sharpens the Kuznets curve rather than weakening it. The cubic term remains positive in all specifications but loses statistical significance in the Aid/Education model (p = 0.180), where the smaller sample (N = 585) reduces power.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `kuznets_scatter_pooled.png` | Scatter of Gini vs log GDP per capita with linear, quadratic, and cubic fit lines overlaid | The cubic (N-shaped) fit captures the data pattern better than the linear or quadratic alternatives, showing inequality peaking at low income and declining thereafter |
| 2 | `kuznets_scatter_by_period.png` | Five-panel faceted scatter showing the Gini-GDP relationship separately for each time period | The N-shaped pattern is stable across all 5 periods, ruling out that the result is driven by a single unusual time window |
| 3 | `kuznets_spaghetti.png` | Individual country trajectories (Liberia, Kenya, Republic of Congo, Algeria, Bahamas, Qatar highlighted) overlaid with the pooled cubic fit | Countries follow their own distinct trajectories that deviate from the pooled cross-sectional pattern, motivating the need for fixed effects |
| 4 | `kuznets_fitted_curve.png` | Fitted N-shaped polynomial with shaded rising/falling regions, turning points annotated at $2,287 and $77,205, and dual x-axis (log + USD) | The three development phases are visually clear: rising inequality for the poorest nations, convergence through middle income, and a secondary upturn at very high income |
| 5 | `kuznets_ols_vs_fe.png` | Horizontal bar chart comparing pooled OLS and TWFE coefficients for the cubic specification with 95% confidence intervals | TWFE coefficients are slightly larger than OLS, and confidence intervals are tighter, demonstrating that fixed effects both correct bias and improve precision |
| 6 | `kuznets_correlation_heatmap.png` | 10x10 correlation matrix of Gini and all determinant variables with annotated coefficients | Ethnic Gini has the strongest positive correlation with regional Gini (r = 0.49); school enrollment has the strongest negative correlation (r = -0.41) |
| 7 | `kuznets_coefficient_stability.png` | Three-panel dot plot showing the linear, quadratic, and cubic coefficients across 6 specifications with 95% CIs | The sign pattern (+, -, +) is preserved everywhere; magnitudes attenuate most when ethnic inequality is controlled |
| 8 | `kuznets_determinants_barplot.png` | Horizontal bar chart of determinant coefficients, color-coded by direction (orange = increases inequality, blue = decreases), with significance indicated by opacity | Ethnic Gini dominates all other determinants; arable land and school enrollment are the only factors that significantly reduce inequality |
| 9 | `kuznets_table3.png` | Great Tables publication-quality regression table for the 3-model Kuznets curve (linear/quadratic/cubic TWFE) | Clean replication of the paper's Table 3 with significance stars, clustered SEs, and FE indicators |
| 10 | `kuznets_table4.png` | Great Tables publication-quality regression table for the 5-model determinants analysis | Clean replication of the paper's Table 4 showing how each determinant group relates to regional inequality |

---

## Key Findings

1. **The Kuznets curve is N-shaped, not inverted-U.** The cubic TWFE model yields coefficients of 0.293 (p < 0.001), -0.032 (p < 0.001), and 0.001 (p = 0.001) for ln(GDP pc), its square, and its cube respectively. All three terms are individually significant at the 1% level, rejecting both the linear and quadratic specifications in favor of a polynomial that bends twice. The within-R-squared improves from 0.009 (linear) to 0.095 (quadratic) to 0.142 (cubic).

2. **Peak inequality occurs at $2,287 GDP per capita.** The first turning point of the cubic polynomial corresponds to roughly $2,287 in PPP-adjusted US dollars. Below this threshold---countries like Liberia, the DRC, and Afghanistan---regional inequality rises as initial development concentrates economic activity in a single leading region. Most countries in Africa and South Asia are near or below this threshold.

3. **The convergence zone spans $2,287 to $77,205.** Between the two turning points, regional inequality falls as development proceeds. This is the "convergence" story: lagging regions catch up as infrastructure, education, and market access spread. The vast majority of the world's countries (including China, India, Brazil, and most of Europe) fall in this range. The paper notes that approximately 67-70% of countries exhibit sigma-convergence, consistent with this broad middle zone of the N-shape.

4. **Ethnic income inequality is the strongest determinant.** The ethnic Gini coefficient of 0.071 (p < 0.001) is 3.9 times larger than the next biggest positive effect (resource rents at 0.018) and 1.3 times larger than the largest effect in absolute value (arable land at -0.053). When ethnic inequality is included, the Kuznets polynomial attenuates substantially (linear term drops from 0.293 to 0.149), suggesting that part of the apparent development-inequality relationship is actually driven by ethnic income disparities. This model also achieves the highest within-R-squared of any determinant specification (0.282).

5. **Arable land and school enrollment reduce regional inequality.** These are the only two variables with significant negative effects on regional inequality. Arable land (-0.053, p < 0.001) suggests that agricultural economies distribute activity more evenly across regions. School enrollment (-0.014, p = 0.053) indicates that human capital diffusion promotes regional convergence, though the effect is marginally significant.

6. **Resource rents, trade openness, and foreign aid increase inequality.** Natural resource rents (0.018, p = 0.008) concentrate extractive income in specific regions. Trade openness (0.005, p = 0.007) benefits internationally connected regions disproportionately. Foreign aid (0.015, p = 0.028) may channel through capital cities rather than reaching lagging regions---a finding with direct policy implications for aid distribution.

7. **Transport costs matter in large countries.** The gasoline price alone is not significant (p = 0.783), but its interaction with country area is (0.006, p = 0.049). In geographically large countries, higher transport costs impede factor mobility between regions, preventing equalization of incomes. This is consistent with the theoretical argument that factor mobility is a key mechanism of regional convergence.

8. **Fixed effects are essential for the Kuznets curve.** The linear TWFE model yields a coefficient of -0.003 (p = 0.265) with within-R-squared of 0.009---a researcher who stops at the linear specification would conclude development has no effect on inequality. Only the cubic specification reveals the true nonlinear relationship. Moreover, pooled OLS cubic coefficients are marginally significant (p ~ 0.07) while TWFE coefficients are highly significant (p < 0.001), demonstrating that controlling for country heterogeneity both corrects bias and improves precision.

---

## Surprises and Caveats

1. **Singleton fixed effects dropped.** PyFixest automatically drops 1 singleton fixed effect in TWFE models (879 vs 880 observations), and up to 6 in some determinant models. This is expected behavior for unbalanced panels and does not affect coefficient interpretation, but it means sample sizes vary slightly across specifications.

2. **The second turning point ($77,205) is beyond most of the data.** Only a handful of countries (Qatar, Luxembourg, Norway, Singapore) have GDP per capita near or above this threshold. The N-shape's second upturn is therefore estimated from very few observations and should be interpreted with caution. The paper itself notes this limitation.

3. **Missing data reduces sample size for aid and education.** The Aid/Education model drops to 585 observations (from 880) due to missing aid and school enrollment data. This is a 33% sample reduction. In this specification, the cubic polynomial term loses significance (p = 0.180), which may reflect genuine attenuation or simply reduced statistical power.

4. **Ethnic Gini substantially attenuates the Kuznets curve.** When ethnic inequality is controlled, the polynomial coefficients roughly halve. This raises an interpretation question: is the Kuznets curve a "development" phenomenon, or is it partly an artifact of ethnic composition correlating with income levels? The paper does not fully resolve this, and it is an important caveat for the blog post.

5. **R-squared is very high (0.97+) but within-R-squared is modest (0.01-0.28).** The high overall R-squared is almost entirely driven by country fixed effects---countries have persistent inequality levels that the Gini measures well. The within-R-squared captures how much the covariates explain inequality changes over time within a country, and these values (4-28%) are more informative about model fit.

6. **No causal claims.** The analysis is descriptive/correlational. Fixed effects control for time-invariant unobserved heterogeneity but cannot address time-varying confounders. The "determinants" should be interpreted as associations conditional on the Kuznets curve and country/year fixed effects, not as causal effects.
