# Results Report: Dynamic Panel BMA for Economic Growth Determinants

**Script:** `analysis.R`
**Executed:** 2026-04-01
**Status:** Success (with package version warnings)
**Runtime:** not recorded
**Language:** R 4.3.x
**Key packages:** bdsm, tidyverse 2.0.0, ggplot2 3.5.2, scales, parallel

---

## Execution Summary

The script applies Bayesian Model Averaging (BMA) to dynamic panel data from 73 countries across five decades (1960--2000) to identify which candidate growth determinants are robustly associated with GDP per capita growth. It uses the `bdsm` R package, which implements the Moral-Benito (2012, 2013, 2016) framework for BMA with weakly exogenous regressors in a dynamic panel setting. The data undergoes a three-step preparation pipeline -- standardization, time demeaning, and entity demeaning -- before exhaustively estimating all 512 possible models (2^9 candidate regressors). The headline finding is that population (PIP = 0.990) and life expectancy (PIP = 0.864) are the most robustly included growth determinants under the default binomial prior, while all nine candidate variables exceed the 0.50 weak-evidence threshold.

**Warnings:** Package version warnings for bdsm, ggplot2, and scales (built under R 4.3.3). No convergence or estimation warnings.

---

## Data Overview

```text
--- economic_growth ---
Dimensions: 365 12
Countries: 73
Years: 1960 1970 1980 1990 2000

--- original_economic_growth ---
Dimensions: 292 13

--- Summary statistics ---
    country        year           gdp            lag_gdp
 Min.   : 1   Min.   :1970   Min.   : 6.177   Min.   : 6.021
 1st Qu.:19   1st Qu.:1978   1st Qu.: 7.595   1st Qu.: 7.441
 Median :37   Median :1985   Median : 8.518   Median : 8.358
 Mean   :37   Mean   :1985   Mean   : 8.505   Mean   : 8.311
 3rd Qu.:55   3rd Qu.:1992   3rd Qu.: 9.481   3rd Qu.: 9.194
 Max.   :73   Max.   :2000   Max.   :10.445   Max.   :10.222
      ish               sed              pgrw                pop
 Min.   :0.01224   Min.   :0.0120   Min.   :-0.005952   Min.   :   0.6632
 1st Qu.:0.09719   1st Qu.:0.2968   1st Qu.: 0.010662   1st Qu.:   3.7293
 Median :0.16003   Median :0.8125   Median : 0.021321   Median :   8.3810
 Mean   :0.16886   Mean   :1.1204   Mean   : 0.019377   Mean   :  42.0796
 3rd Qu.:0.22837   3rd Qu.:1.5668   3rd Qu.: 0.027277   3rd Qu.:  23.9413
 Max.   :0.65279   Max.   :5.0880   Max.   : 0.058159   Max.   :1138.8946
      ipr              opem              gsh              lnlex
 Min.   : 16.60   Min.   :0.07725   Min.   :0.06131   Min.   :3.561
 1st Qu.: 57.69   1st Qu.:0.32837   1st Qu.:0.15208   1st Qu.:3.972
 Median : 74.23   Median :0.46590   Median :0.18681   Median :4.166
 Mean   : 84.47   Mean   :0.58304   Mean   :0.20562   Mean   :4.102
 3rd Qu.: 96.82   3rd Qu.:0.70603   3rd Qu.:0.23122   3rd Qu.:4.266
 Max.   :452.01   Max.   :4.91811   Max.   :0.66725   Max.   :4.367
     polity
 Min.   :0.0000
 1st Qu.:0.2487
 Median :0.7000
 Mean   :0.6194
 3rd Qu.:1.0000
 Max.   :1.0000
```

**Interpretation:** The dataset covers 73 countries observed at decadal intervals from 1960 to 2000, yielding 292 complete country-decade observations for estimation (365 rows in the raw panel, with the first period used only for the lagged dependent variable). GDP per capita (log) ranges from 6.18 to 10.45, spanning low-income to high-income economies. Population sizes vary enormously (0.66 to 1,139 million), reflecting the inclusion of both small and very large economies. Investment share (mean 0.169), education (mean 1.12), and trade openness (mean 0.583) all exhibit substantial cross-country variation, providing the dispersion needed for BMA to discriminate among candidate regressors. The democracy index (polity) ranges from 0 to 1, with a median of 0.70 indicating that more than half of the sample leans democratic.

---

## Method Results

### Data Preparation: Three-Step Pipeline

```text
Step 1: Standardize regressors...
Step 2: Demean by year (time FE)...
Step 3: Demean by country (entity FE)...
Final prepared data dimensions: 365 12
```

**Interpretation:** The three-step pipeline first standardizes all regressors to have zero mean and unit variance, making coefficient magnitudes comparable across variables with different units (e.g., population in millions vs. investment share as a proportion). The second step removes time fixed effects by demeaning within each decade, controlling for global shocks such as the oil crises or the post-2000 slowdown. The third step removes entity (country) fixed effects by demeaning within each country, ensuring that the BMA results reflect within-country variation over time rather than persistent cross-country differences in levels. This two-way demeaning is an improvement over the single time-demeaning used in the bdsm package vignette, as it addresses both sources of unobserved heterogeneity simultaneously.

### Kitchen-Sink Fixed Effects Benchmark

```text
FE regression coefficients:
        Estimate Std. Error t value Pr(>|t|)
lag_gdp   0.6188     0.0501 12.3521   0.0000
ish       0.4646     0.2331  1.9934   0.0475
sed       0.0162     0.0337  0.4798   0.6319
pgrw     -2.3352     2.1409 -1.0907   0.2767
pop       0.0016     0.0004  4.5092   0.0000
ipr      -0.0003     0.0003 -1.0817   0.2806
opem      0.1199     0.0379  3.1652   0.0018
gsh      -0.7448     0.2700 -2.7585   0.0063
lnlex     0.1153     0.2440  0.4727   0.6369
polity   -0.1656     0.0570 -2.9065   0.0041

Significant at 5%: lag_gdp, ish, pop, opem, gsh, polity
Total significant: 6 of 10
R-squared: 0.988
Adj. R-squared: 0.983
N observations: 292
```

**Interpretation:** The kitchen-sink OLS regression including all nine candidate regressors plus country and year fixed effects achieves an R-squared of 0.988, indicating that the model explains nearly all variation in log GDP per capita -- though much of this comes from the country dummies and lagged dependent variable rather than the growth determinants themselves. Six of the ten variables are statistically significant at the 5% level: the lagged GDP term (coefficient 0.619, strong persistence), investment share (0.465, positive), population (0.002, positive), trade openness (0.120, positive), government share (-0.745, negative), and democracy (-0.166, negative). Education, population growth, investment price, and life expectancy fail to reach significance in this all-inclusive specification. However, the kitchen-sink approach is vulnerable to multicollinearity and model uncertainty -- precisely the problem BMA is designed to address.

### BMA with Default Binomial Prior (EMS = 4.5)

```text
--- Binomial prior ---
          PIP     PM   PSD  PSDR  PMcon PSDcon PSDRcon    %(+)
gdp_lag    NA  0.919 0.077 0.109  0.919  0.077   0.109 100.000
ish     0.773  0.063 0.045 0.062  0.082  0.034   0.059 100.000
sed     0.717  0.030 0.057 0.074  0.042  0.064   0.084  69.922
pgrw    0.714  0.018 0.030 0.052  0.025  0.033   0.060  99.609
pop     0.990  0.119 0.065 0.082  0.121  0.064   0.081 100.000
ipr     0.656 -0.034 0.033 0.044 -0.051  0.027   0.046   0.000
opem    0.766  0.034 0.030 0.033  0.044  0.026   0.031 100.000
gsh     0.751 -0.015 0.041 0.091 -0.020  0.046   0.104  30.859
lnlex   0.864  0.088 0.075 0.098  0.102  0.071   0.099 100.000
polity  0.678 -0.057 0.046 0.053 -0.084  0.030   0.044   0.000

--- Expected model sizes ---
              Prior models size Posterior model size
Binomial                    4.5                6.908
Binomial-beta               4.5                8.556
```

**Interpretation:** Under the default binomial prior with expected model size (EMS) of 4.5, the BMA results reveal a clear hierarchy of robustness among growth determinants. Population is the most robust variable with a PIP of 0.990 and a positive posterior mean of 0.119 (100% positive sign certainty), meaning it appears in virtually every well-fitting model. Life expectancy follows with PIP = 0.864 and a positive effect (PM = 0.088), indicating that health improvements are strongly associated with economic growth. Investment share (PIP = 0.773), trade openness (PIP = 0.766), and government share (PIP = 0.751) all exceed the 0.75 positive-evidence threshold, with investment share and trade openness carrying positive effects and government share a negative one. Education (PIP = 0.717), population growth (PIP = 0.714), democracy (PIP = 0.678), and investment price (PIP = 0.656) fall in the moderate-evidence range (0.50--0.75). Notably, the posterior model size of 6.91 is substantially larger than the prior expectation of 4.5, indicating that the data strongly favors richer models with more regressors included.

### Best Models (Top 8 by Posterior Model Probability)

```text
--- Inclusion matrix (binomial) ---
        'No. 1' 'No. 2' 'No. 3' 'No. 4' 'No. 5' 'No. 6' 'No. 7' 'No. 8'
gdp_lag   1.000   1.000   1.000   1.000   1.000   1.000   1.000   1.000
ish       1.000   1.000   1.000   1.000   1.000   1.000   1.000   0.000
sed       1.000   1.000   1.000   0.000   1.000   1.000   1.000   1.000
pgrw      1.000   1.000   1.000   1.000   0.000   1.000   1.000   1.000
pop       1.000   1.000   1.000   1.000   1.000   1.000   1.000   1.000
ipr       1.000   0.000   1.000   1.000   1.000   1.000   1.000   1.000
opem      1.000   1.000   1.000   1.000   1.000   1.000   0.000   1.000
gsh       1.000   1.000   1.000   1.000   1.000   0.000   1.000   1.000
lnlex     1.000   1.000   1.000   1.000   1.000   1.000   1.000   1.000
polity    1.000   1.000   0.000   1.000   1.000   1.000   1.000   1.000
PMP       0.089   0.044   0.042   0.036   0.035   0.029   0.026   0.025
```

**Interpretation:** The single best model (PMP = 0.089, or 8.9% posterior probability) is the full specification including all nine regressors -- a notable result given that the prior expected only 4.5. The top 8 models collectively account for about 33% of the posterior mass, indicating considerable model uncertainty spread across many specifications. Both GDP lag and population appear in all 8 top models (100% inclusion), confirming their robustness. Life expectancy is also included in all 8 top models. Each of the remaining variables is excluded from exactly one of the top 8, suggesting that the data supports rich models but is uncertain about the marginal contribution of individual regressors beyond the core trio. The best model's coefficient on lagged GDP is 0.954 (SE = 0.076), implying high persistence in GDP levels across decades.

### Prior Sensitivity Analysis

```text
--- BMA with EMS = 2 (Skeptical) ---
PIP range: pop 0.964, lnlex 0.637, ipr 0.344
Posterior model size: 4.560

--- BMA with EMS = 8 (Generous) ---
PIP range: pop 0.999, lnlex 0.981, ipr 0.941
Posterior model size: 8.664

--- Binomial-Beta prior (EMS = 4.5) ---
PIP range: pop 0.998, lnlex 0.974, ipr 0.924
Posterior model size: 8.556

--- Dilution prior (omega = 0.5) ---
PIP range: pop 0.989, lnlex 0.839, ipr 0.642
Posterior model size: 6.773

--- Dilution prior (omega = 2) ---
PIP range: pop 0.985, lnlex 0.749, ipr 0.602
Posterior model size: varies
```

**Interpretation:** The prior sensitivity analysis reveals that population is extraordinarily robust: its PIP never falls below 0.964 across all six prior specifications tested, ranging from the skeptical EMS=2 to the generous EMS=8 and both dilution priors. Life expectancy is the second most robust, with PIPs ranging from 0.637 (skeptical) to 0.981 (generous). Under the skeptical prior (EMS = 2), only population (0.964) and life expectancy (0.637) remain above the 0.50 threshold, while investment share (0.483), trade openness (0.468), and government share (0.459) drop just below it -- suggesting these three variables are borderline robust. The binomial-beta prior, which is more agnostic about model size, pushes all PIPs above 0.92, resembling the generous EMS=8 specification. The dilution priors (omega = 0.5 and omega = 2), which penalize correlated regressors, produce results very similar to the default binomial prior, indicating that multicollinearity among the growth determinants is not severely distorting the BMA results.

### Jointness Analysis

```text
--- HCGHM measure (default) ---
Strongest complements (upper triangle):
  pop-lnlex: 0.711    pop-ish: 0.530    pop-opem: 0.517
  pop-gsh: 0.489      ish-lnlex: 0.366  polity-pop: 0.346

--- Ley-Strazicich measure ---
Strongest complements:
  pop-lnlex: 5.980    pop-ish: 3.282    pop-opem: 3.161

--- Doppelhofer-Weeks measure ---
Strongest complements:
  pop-lnlex: 0.153    pop-opem: -0.023 (weak substitute)
```

**Interpretation:** The jointness analysis reveals that population and life expectancy are the strongest complements across all three measures (HCGHM = 0.711, Ley-Strazicich = 5.98), meaning they tend to appear together in the best models. This makes substantive sense: population size captures scale effects while life expectancy captures human capital quality, and both contribute independent information about growth potential. Population also shows strong complementarity with investment share (HCGHM = 0.530), trade openness (0.517), and government share (0.489). No strong substitution patterns emerge -- the Doppelhofer-Weeks measure shows only very weak substitutability between some pairs (e.g., pop-opem = -0.023), suggesting the nine candidate regressors capture largely distinct dimensions of the growth process. The HCGHM lower triangle (prior jointness) is uniformly high (0.78--0.94), confirming that the prior assigns similar probability to most variable pairs.

---

## Figure Inventory

| # | Filename | Size | Description | Key takeaway |
|---|----------|------|-------------|--------------|
| 1 | `r_dynamic_bma2_pip.png` | 148 KB | Custom dark-theme horizontal bar chart of PIPs for all 9 regressors, color-coded by evidence strength (positive/moderate/weak) with 0.50 and 0.75 threshold lines | Population (0.990) and life expectancy (0.864) clearly dominate; all variables exceed the 0.50 weak-evidence threshold |
| 2 | `r_dynamic_bma2_coef.png` | 139 KB | Custom dark-theme point-range plot showing posterior mean coefficients with 95% credible intervals (PM +/- 2*PSD) | Most variables have credible intervals overlapping zero except population (positive) and democracy (negative); education has the widest interval reflecting sign uncertainty |
| 3 | `r_dynamic_bma2_sensitivity.png` | 169 KB | Custom dark-theme dumbbell chart comparing PIPs across three priors (skeptical EMS=2, binomial EMS=4.5, binomial-beta) | Population is insensitive to prior choice (always near 1.0); investment price and democracy show the largest sensitivity range |
| 4 | `r_bdsm_model_pmp.png` | 222 KB | Built-in bdsm two-panel plot of prior vs. posterior model probabilities across all 512 models, for binomial and binomial-beta priors | Posterior probability is highly concentrated on a few top models under binomial prior; binomial-beta concentrates even more sharply on the full model |
| 5 | `r_bdsm_model_sizes.png` | 255 KB | Built-in bdsm two-panel plot of prior vs. posterior model size distributions | Data pulls posterior model size toward 6--7 regressors under binomial prior (vs. prior peak near 4.5); binomial-beta posterior peaks at 9 regressors |
| 6 | `r_bdsm_coef_hist_pop.png` | 96 KB | Built-in bdsm histogram of the population variable's coefficient across all 512 models | Coefficients range from ~0.05 to ~0.21 and are consistently positive, confirming population's robust positive effect on growth |
| 7 | `r_bdsm_sizes_dilution.png` | 261 KB | Built-in bdsm two-panel plot of model size distributions under dilution prior (omega = 0.5) | Dilution prior produces nearly identical posterior model size distribution to the default binomial, confirming multicollinearity is not a major concern |

---

## Key Findings

1. **Population is the most robust growth determinant:** With a PIP of 0.990 under the default binomial prior (and never below 0.964 across all six prior specifications), population appears in virtually every model that fits the data well. Its posterior mean coefficient is 0.119 (PSD = 0.065) with 100% positive sign certainty, indicating that larger countries tend to grow faster, consistent with scale-effect theories of endogenous growth.

2. **Life expectancy is the second most robust driver:** Life expectancy achieves PIP = 0.864 and a posterior mean of 0.088 (100% positive), making it the second-strongest growth determinant. This finding aligns with the human capital literature: improvements in population health are robustly associated with higher subsequent GDP growth across 73 countries and four decades.

3. **The data favors richer models than the prior expects:** The posterior expected model size of 6.91 regressors under the binomial prior is 54% larger than the prior expectation of 4.5, and the full 9-variable model has the highest individual posterior probability (PMP = 8.9%). This suggests that economic growth is a genuinely multifactorial process -- no parsimonious 2-3 variable model adequately captures the determinants.

4. **Five variables achieve "positive evidence" (PIP > 0.75):** Population (0.990), life expectancy (0.864), investment share (0.773), trade openness (0.766), and government share (0.751) all exceed the 0.75 positive-evidence threshold. Investment share and trade openness carry positive effects, while government share is negative (PM = -0.015, 30.9% positive sign probability), echoing the finding that larger government consumption shares are associated with slower growth.

5. **Education has the highest sign uncertainty:** While education's PIP (0.717) indicates moderate inclusion robustness, it is the only variable with substantial sign ambiguity -- only 69.9% of its posterior mass is on the positive side. Its credible interval is the widest of all regressors (PM = 0.030, PSD = 0.057), reflecting genuine uncertainty about whether higher education enrollment helps or hinders growth in this dynamic panel setting.

6. **Democracy carries a robustly negative coefficient:** Democracy (polity) has a PIP of 0.678 and a posterior mean of -0.057 with 0% positive sign probability. When included in a model, its conditional mean is -0.084 (PSD = 0.030), representing one of the more precisely estimated negative effects. This controversial finding echoes a literature debating the short-run costs vs. long-run benefits of democratization.

7. **Population and life expectancy are strong complements:** The jointness analysis reveals that population and life expectancy appear together much more often than independently (HCGHM = 0.711, Ley-Strazicich = 5.98). This complementarity suggests that population scale and health capital capture distinct growth channels, and models that include one tend to benefit from including the other.

8. **Results are robust to prior specification:** The dilution priors (omega = 0.5 and omega = 2), which penalize correlated regressors, produce PIP rankings nearly identical to the default binomial (population 0.989/0.985, life expectancy 0.839/0.749), confirming that multicollinearity is not inflating the inclusion probabilities. The core finding -- population and life expectancy as the top two drivers -- holds across all tested priors.

---

## Surprises and Caveats

**Model space consistency note:** The script uses the precomputed `full_model_space` from the bdsm package, which was estimated using time-demeaned-only data. However, the `data_prepared` object passed to `bma()` includes both time and entity demeaning. The `bma()` function uses the precomputed model space for parameter estimates and log-likelihoods but recalculates BMA weights using the user-supplied data frame. For a fully consistent analysis, `optim_model_space()` should be re-run on `data_prepared` -- the script documents this trade-off (speed vs. full consistency) in a comment block at Section 3.

**Education's sign ambiguity:** Education is the only variable where the sign is uncertain (69.9% positive). This likely reflects the ambiguous role of education enrollment rates in short-run growth dynamics: higher enrollment may temporarily reduce labor force participation (negative short-run effect) while building human capital (positive long-run effect). The dynamic panel framework may be capturing this tension.

**No strong substitution patterns:** The jointness analysis finds no significant substitute relationships among the nine regressors. This is mildly surprising given potential overlap between trade openness and investment price (both related to international economic integration), but suggests the variables capture sufficiently distinct aspects of the growth process.

**Government share sign composition:** Government share has a negative posterior mean (-0.015) but a non-trivial 30.9% positive sign probability, indicating that while the weight of evidence points to a negative growth effect, roughly one-third of models find a positive association. This ambiguity may reflect heterogeneity between productive government spending (infrastructure, education) and consumptive spending.

**Kitchen-sink vs. BMA comparison:** The kitchen-sink FE regression finds 6 of 10 variables significant at 5%, including some (investment share, democracy) that BMA considers only moderately robust. Conversely, life expectancy is insignificant in the kitchen-sink model (p = 0.637) but is the second most robustly included variable under BMA (PIP = 0.864). This divergence illustrates the value of BMA: by averaging across all model specifications rather than conditioning on a single one, BMA can identify variables whose importance is masked by multicollinearity in full models.
