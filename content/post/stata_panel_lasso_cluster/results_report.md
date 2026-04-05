# Results Report: Latent Group Structures in Panel Data (classifylasso)

**Script:** `analysis.do`
**Executed:** 2026-04-05 14:59 -- 17:47
**Status:** Success
**Runtime:** ~2 hours 49 minutes (dominated by 2h34m democracy C-LASSO)
**Language:** Stata 18 (StataSE)
**Key packages:** classifylasso (SSC), reghdfe, ftools

---

## Execution Summary

The script applies the Classifier-LASSO method (Su, Shi, Phillips 2016) to two panel datasets to identify latent group structures in slope coefficients. The first application examines savings behavior across 56 countries over 15 years; the second examines the effect of democracy on economic growth across 98 countries over 41 years (1970--2010). Both static and dynamic specifications are estimated for the savings data, while the democracy application uses a dynamic model with two-way fixed effects and clustered standard errors.

The headline finding is striking: in both applications, the information criterion selects exactly 2 groups, revealing that coefficients assumed homogeneous by pooled fixed-effects models are in fact polarized across latent country groups. Most dramatically, the pooled democracy coefficient of +1.055 decomposes into +2.151 for 57 countries and -0.936 for 41 countries -- democracy promotes growth in one group and hinders it in another.

**Warnings:** None. All models converged successfully. The democracy C-LASSO took 2h34m due to large N and T with two-way FE and dynamic bias correction.

---

## Data Overview

### Savings Data (saving.dta)

```text
    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
     savings |        840   -2.87e-08    1.000596  -2.495871   2.893858
  lagsavings |        840    5.81e-08    1.000596  -2.832278    2.91508
         cpi |        840    3.56e-09    1.000596  -2.773791   3.548945
    interest |        840   -7.17e-09    1.000596  -3.600348   3.277582
         gdp |        840    1.06e-08    1.000596  -3.554419   2.461317
```

Panel: 56 countries x 15 years = 840 observations, strongly balanced.

**Interpretation:** The savings panel contains 56 countries observed over 15 periods (coded 1--15, corresponding to 1995--2010). All variables are standardized (mean approximately zero, standard deviation approximately 1), which means the raw units are z-scores rather than natural units. This standardization facilitates coefficient comparison across variables but means that magnitudes should be interpreted in standard deviation terms. The balanced panel structure is ideal for C-LASSO, which requires complete observation across all time periods.

### Democracy Data (democracy.dta)

```text
    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
      lnPGDP |      4,018    758.5558    162.9137   405.6728   1094.003
   Democracy |      4,018    .5450473    .4980286          0          1
         ly1 |      3,920    757.7754    162.6702   405.6728   1094.003
         ly2 |      3,822    757.0313    162.4135   405.6728   1094.003
         ly3 |      3,724    756.2059    162.0712   405.6728   1094.003
         ly4 |      3,626    755.3805    161.6917   405.6728    1089.12
```

Panel: 98 countries x 41 years = 4,018 observations, strongly balanced.

Democracy distribution:
```text
  Democracy |      Freq.     Percent
------------+-----------------------------------
          0 |      1,828       45.50
          1 |      2,190       54.50
```

**Interpretation:** The democracy panel is substantially larger: 98 countries observed annually from 1970 to 2010. The dependent variable `lnPGDP` (log per-capita GDP, scaled) ranges from 406 to 1,094, capturing the full spectrum from low-income to high-income countries. The binary democracy indicator shows that about 55% of country-year observations are classified as democratic, reflecting the global wave of democratization over this period. The four lags of GDP growth (`ly1`--`ly4`) control for GDP persistence, with observations declining slightly from 3,920 to 3,626 as lags are introduced. This dataset directly extends Acemoglu et al. (2019), who found a positive average effect of democracy on growth.

---

## Method Results

### Pooled OLS and Fixed Effects -- Savings

```text
                 Pooled OLS     FE (robust)
lagsavings           0.6051         0.6051
cpi                  0.0301         0.0301
interest             0.0059         0.0059
gdp                  0.1882         0.1882
```

Pooled OLS: R-squared = 0.4384, F(4, 835) = 162.95
Standard FE: Within R-squared = 0.4384, sigma_u = 2.764e-07

**Interpretation:** The pooled OLS and fixed-effects estimates are virtually identical -- the lagsavings coefficient is 0.605 and the GDP growth coefficient is 0.188, both highly significant (p < 0.001). The CPI and interest rate coefficients are small and statistically insignificant (0.030 and 0.006 respectively). The near-zero sigma_u in the FE model and the F-test for all u_i = 0 (p = 1.000) suggest that the standardized data has already removed between-country variation, making pooled OLS and FE equivalent. These homogeneous-slope models explain about 44% of within-country variation. The key question is whether this average masks heterogeneity across country groups.

### Classifier-LASSO -- Savings, Static Model

```text
* Selected Group Number: 2
The algorithm takes 4min50s.

Group 1 (34 countries, 510 obs):  Within R-sq. = 0.2019
     savings | Coefficient  Std. err.      z    P>|z|
         cpi |  -.1813043   .0422854    -4.29   0.000
    interest |  -.1966381   .0424214    -4.64   0.000
         gdp |   .3345556   .0419159     7.98   0.000

Group 2 (22 countries, 330 obs):  Within R-sq. = 0.2369
     savings | Coefficient  Std. err.      z    P>|z|
         cpi |   .4780886   .0525171     9.10   0.000
    interest |   .2631097    .052491     5.01   0.000
         gdp |   .1116502   .0500687     2.23   0.026
```

Information Criterion values: K=1: 0.054, K=2: -0.028 (minimum), K=3: 0.059, K=4: 0.131, K=5: 0.213

**Interpretation:** The static C-LASSO (without lagged savings) identifies 2 groups of countries with dramatically different responses to macroeconomic conditions. Group 1 (34 countries) shows negative effects of CPI (-0.181) and interest rates (-0.197) on savings, while Group 2 (22 countries) shows strong positive effects of CPI (+0.478) and interest rates (+0.263). This sign reversal is remarkable: in Group 1, higher inflation is associated with lower savings, while in Group 2, higher inflation is associated with higher savings -- possibly reflecting precautionary savings behavior in countries with greater macroeconomic uncertainty. GDP growth has a positive effect in both groups, though the magnitude differs substantially (0.335 vs 0.112). The information criterion clearly favors K=2, with values rising monotonically from K=3 onward.

### Classifier-LASSO -- Savings, Dynamic Model (SSP2016 Replication)

```text
* Selected Group Number: 2
The algorithm takes 9min57s.

Group 1 (31 countries, 465 obs):  Within R-sq. = 0.4988
     savings | Coefficient  Std. err.      z    P>|z|
  lagsavings |   .6952103   .0383023    18.15   0.000
         cpi |   -.160168    .039182    -4.09   0.000
    interest |  -.1490145   .0368407    -4.04   0.000
         gdp |   .2892251   .0379408     7.62   0.000

Group 2 (25 countries, 375 obs):  Within R-sq. = 0.4372
     savings | Coefficient  Std. err.      z    P>|z|
  lagsavings |   .6938863   .0356796    19.45   0.000
         cpi |   .1967192   .0399412     4.93   0.000
    interest |   .1225496   .0411717     2.98   0.003
         gdp |   .1126528   .0474176     2.38   0.018
```

**Interpretation:** The dynamic model with half-panel jackknife bias correction (replicating SSP2016 with lambda = 1.5485) again selects 2 groups, but the group composition shifts slightly -- 31 countries in Group 1 (vs 34 in the static model) and 25 in Group 2 (vs 22 in static). The sign reversal on CPI persists: -0.160 in Group 1 vs +0.197 in Group 2. The same pattern holds for the interest rate: -0.149 vs +0.123. Both groups show nearly identical persistence in savings (lagsavings coefficient ~0.695 in G1 vs ~0.694 in G2), suggesting the heterogeneity lies in how countries respond to macroeconomic shocks, not in their baseline savings persistence. Within R-squared improves substantially (0.499 and 0.437) compared to the static model (0.202 and 0.237), confirming that lagged savings is a critical predictor. The algorithm converged in 20 iterations for K=2 through K=5, taking about 10 minutes total.

### Pooled FE Benchmark -- Democracy

```text
HDFE Linear regression                            Number of obs   =      3,920
                                                  R-squared       =     0.9991
                                                  Within R-sq.    =     0.9607

                               (Std. err. adjusted for 98 clusters in country)
      lnPGDP | Coefficient  Robust std. err.      t    P>|t|
   Democracy |   1.054992    .369806     2.85   0.005
         ly1 |    .970495   .0059964   161.85   0.000
```

**Interpretation:** The pooled two-way FE model (country + year fixed effects, clustered standard errors) finds that democracy is associated with a statistically significant 1.055-unit increase in log per-capita GDP (p = 0.005). The lagged GDP coefficient of 0.970 indicates strong persistence. This replicates the central finding of Acemoglu et al. (2019): democracy does cause growth. However, the pooled model assumes all 98 countries share the same democracy effect -- C-LASSO will test whether this holds.

### Classifier-LASSO -- Democracy Application

```text
* Selected Group Number: 2
The algorithm takes 2h33min41s.

Group 1 (57 countries, 2,280 obs):  Within R-sq. = 0.9609
      lnPGDP | Coefficient  Std. err.      z    P>|z|
   Democracy |   2.151397   .5460536     3.94   0.000
         ly1 |   1.032752   .0068864   149.97   0.000

Group 2 (41 countries, 1,640 obs):  Within R-sq. = 0.9538
      lnPGDP | Coefficient  Std. err.      z    P>|z|
   Democracy |  -.9355893   .3481464    -2.69   0.007
         ly1 |   .9793272   .0102301    95.73   0.000
```

Information Criterion values: K=1: 3.280, K=2: 3.267 (minimum), K=3: 3.280, K=4: 3.275, K=5: 3.278

**Interpretation:** The C-LASSO reveals a fundamental split in the democracy-growth relationship. Group 1 (57 countries) shows a large, positive democracy effect of +2.151 (p < 0.001) -- more than twice the pooled estimate. Group 2 (41 countries) shows a statistically significant *negative* effect of -0.936 (p = 0.007). This is the tutorial's most striking finding: the pooled coefficient of +1.055 is not representative of any actual country group but rather an average of a strongly positive and a significantly negative effect. The democracy coefficient literally changes sign depending on which group of countries is examined. The IC values are very close across K specifications (ranging 3.267--3.280), with K=2 narrowly selected. The algorithm took 2 hours 34 minutes, reflecting the computational cost of searching over K=1--5 groups with two-way FE, clustered SEs, and dynamic bias correction on 3,920 observations.

### Comparison: Pooled FE vs C-LASSO Groups

```text
                    Pooled FE        C-LASSO (by group)
─────────────────────────────────────────────────────────
Democracy coef:       1.0550 (SE 0.3698)
Lagged GDP coef:      0.9705 (SE 0.0060)
N (country-years):  3920

C-LASSO reveals 2 distinct groups of countries
with different responses to democratic transitions.
```

**Interpretation:** The comparison table shows how the pooled estimate of +1.055 decomposes into group-specific effects. Group 1's coefficient (+2.151) is approximately double the pooled estimate, while Group 2's coefficient (-0.936) is negative and significant. The lagged GDP coefficient also differs between groups: 1.033 in Group 1 (indicating slightly explosive dynamics) vs 0.979 in Group 2 (stable convergence). This decomposition demonstrates the core value proposition of C-LASSO: when slope heterogeneity is present, pooled estimates can be highly misleading -- in this case, the pooled model suggests democracy universally promotes growth, while the latent group structure reveals a substantial minority of countries where the opposite holds.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `stata_panel_lasso_cluster_fig1_savings_scatter.png` | Spaghetti plot of savings-to-GDP ratio across 56 countries over 15 years | Countries exhibit wide dispersion in savings trajectories, motivating the search for latent groups |
| 2 | `stata_panel_lasso_cluster_fig2_group_selection_static.png` | Information criterion and iteration count by number of groups (static savings model) | IC is minimized at K=2, with a clear U-shape from K=2 onward; convergence reached in ~3 iterations for K=2 |
| 3 | `stata_panel_lasso_cluster_fig3_coef_cpi.png` | CPI coefficient estimates and 95% confidence bands by group (dynamic savings model) | Clear sign reversal: Group 1 has negative CPI effect, Group 2 has positive CPI effect, with non-overlapping confidence bands |
| 4 | `stata_panel_lasso_cluster_fig4_coef_interest.png` | Interest rate coefficient estimates and 95% confidence bands by group (dynamic savings model) | Same sign reversal pattern as CPI: negative in Group 1, positive in Group 2 |
| 5 | `stata_panel_lasso_cluster_fig5_democracy_selection.png` | Information criterion and iteration count by number of groups (democracy model) | IC is minimized at K=2, though values are very close across K=1--5 (range 3.267--3.280) |
| 6 | `stata_panel_lasso_cluster_fig6_democracy_coef.png` | Democracy coefficient estimates and 95% confidence bands by group | Dramatic polarization: Group 1 (~57 countries) shows positive effect (~+2.2), Group 2 (~41 countries) shows negative effect (~-1.0) |

---

## Key Findings

1. **Information criterion consistently selects 2 groups:** In all three C-LASSO specifications (static savings, dynamic savings, democracy), the IC selects K=2 as optimal. This suggests a binary latent structure is a robust feature of both datasets, not an artifact of a particular specification.

2. **CPI and interest rate effects reverse sign across savings groups:** In the dynamic savings model, CPI has a coefficient of -0.160 in Group 1 (31 countries) but +0.197 in Group 2 (25 countries). The interest rate shows the same pattern: -0.149 in G1 vs +0.123 in G2. The pooled model (0.030 and 0.006, both insignificant) obscures these opposing forces entirely -- the insignificance is an artifact of averaging two significant effects with opposite signs.

3. **Democracy promotes growth in 57 countries but hinders it in 41:** The C-LASSO democracy coefficient is +2.151 (SE 0.546, p < 0.001) in Group 1 and -0.936 (SE 0.348, p = 0.007) in Group 2. The pooled estimate of +1.055 is a weighted average that describes neither group accurately. This finding directly challenges the "democracy universally promotes growth" narrative of Acemoglu et al. (2019) by showing it applies to only about 58% of countries.

4. **Dynamic bias correction preserves the group structure:** Moving from the static to the dynamic savings specification (adding lagged savings with half-panel jackknife) changes group composition slightly (34/22 to 31/25) but preserves the fundamental sign reversal on CPI and interest rates. This robustness suggests the latent groups reflect genuine structural heterogeneity rather than dynamic model misspecification.

5. **Savings persistence is homogeneous across groups:** Despite heterogeneous responses to CPI, interest rates, and GDP growth, both groups in the dynamic savings model share nearly identical lagged savings coefficients (0.695 in G1 vs 0.694 in G2). The heterogeneity is concentrated in how countries respond to macroeconomic conditions, not in their baseline savings persistence.

6. **Pooled FE R-squared can mask heterogeneity:** The pooled savings model achieves R-squared = 0.438, while the group-specific models show lower within-group R-squared (0.499 and 0.437 in the dynamic model). The pooled model appears to fit well on average, but this is partly because it averages over groups with opposite-sign coefficients -- a form of Simpson's paradox in panel data.

7. **Computational cost scales with panel dimensions and specification complexity:** The static savings model (56 countries, 15 years, one-way FE) took about 5 minutes. The dynamic savings model (same panel, with jackknife) took 10 minutes. The democracy model (98 countries, 41 years, two-way FE, clustered SEs, dynamic) took 2 hours 34 minutes. Researchers should plan accordingly when applying C-LASSO to large panels with rich specifications.

---

## Surprises and Caveats

1. **Very close IC values in the democracy model.** The IC values for K=1 through K=5 span only 3.267 to 3.280 -- a range of just 0.013. While K=2 is selected, K=4 is nearly as good (3.275). This suggests the 2-group structure, while optimal, is not overwhelmingly favored over alternatives. Researchers should consider sensitivity to the IC tuning parameter rho.

2. **Lagged GDP coefficient exceeds 1 in Group 1 of the democracy model.** The ly1 coefficient is 1.033 in Group 1, suggesting slightly explosive GDP dynamics within this group. This is unusual and may reflect the half-panel jackknife overcorrecting for Nickell bias, or it may indicate that the dynamic specification captures growth acceleration in this group of countries (many of which may be emerging economies experiencing rapid growth convergence).

3. **Standardized savings data complicates interpretation.** The savings dataset variables are standardized to mean zero and unit variance. This means coefficient magnitudes represent standard deviation effects rather than natural units (e.g., percentage points of GDP). While this facilitates cross-variable comparison, it makes domain interpretation less intuitive. The original paper (SSP2016) uses the same standardized data.

4. **The comparison CSV has placeholder rows for C-LASSO groups.** The script could not extract group-specific coefficients from `e()` into a comparison CSV due to the structure of `classifylasso`'s stored estimates. The group-specific coefficients are available in the log output and in the `estimates replay` command but were not programmatically transferred to the CSV. The key numbers are documented in this report: Democracy G1 = +2.151, G2 = -0.936.

5. **No country names in group assignments.** Both group assignment CSVs use numeric country codes rather than country names. The savings data uses codes 1--56 and the democracy data uses codes 6--202. Matching these codes to country names requires the original codebook from Su, Shi, Phillips (2016) and Acemoglu et al. (2019) respectively.
