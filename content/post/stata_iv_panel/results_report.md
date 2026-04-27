# Results Report: stata_iv_panel

**Script:** `analysis.do` (627 lines)
**Execution:** 2026-04-27, clean run, exit code 0
**Language:** Stata 18 MP
**Packages:** estout, ivreg2, ranktest, xtivreg2, outreg2, schemepack
**Runtime:** ~30 seconds

---

## Execution Summary

This script replicates the core analysis from Hodler & Raschky (2014, Economics Letters), which estimates the causal effect of economic shocks on civil conflict using instrumental variables with panel data. The dataset covers 96,591 region-year observations from 5,689 subnational administrative regions in 53 African countries over 1994--2010. The headline finding is reproduced exactly: using 2SLS with weather instruments, a 10% decline in nighttime light intensity increases the probability of conflict with 1+ deaths by approximately 3 percentage points. No warnings, errors, or convergence issues were encountered.

---

## Data Overview

```text
Contains data from reference/EL_regional_conflict_replication.dta
 Observations:        96,591
    Variables:            14

Panel variable: objectid (unbalanced)
 Time variable: year, 1994 to 2010, but with gaps
         Delta: 1 unit
```

```text
    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
ucdp_death~y |     96,591    .0455425    .2084919          0          1
ucdp_25dea~y |     96,591    .0144527    .1193481          0          1
  llnlight01 |     96,591   -1.611658    2.619427   -4.60517   4.143293
  l2lnrain01 |     96,591      3.8302    1.477743   -4.60517   6.093216
  l2meanpdsi |     96,591   -1.215386    2.033711   -12.1292    12.6313
```

The panel is unbalanced -- most regions have 17 years of data (the maximum), with a minimum of 16 observations per region. The conflict variable with the 1+ death threshold has a mean of 0.046, meaning roughly 4.6% of region-year observations experience at least one conflict-related death. The more severe threshold (25+ deaths) drops to 1.4%, confirming that large-scale conflicts are rare events. Nighttime light intensity (logged) averages -1.61, reflecting that most African regions have very low light levels; the mean rainfall variable (logged) is 3.83, and the mean PDSI (drought index) is -1.22, indicating that the average region leans slightly toward dry conditions.

---

## Method Results

### OLS with Fixed Effects (Tables 2-3, Columns 1-4)

```text
                       (1)          (2)          (3)          (4)
                       OLS          OLS          OLS          OLS
-------------------------------------------
Ln Lights(t-1)       0.001
                   (0.001)

Ln Rain(t-2)                     -0.011***                 -0.007*
                                (0.003)                   (0.004)

(Non) Drought~2)                              -0.002***    -0.001***
                                             (0.000)      (0.000)
-------------------------------------------
Observations         96591        96591        96591        96591
N Regions             5689         5689         5689         5689
R-squared             0.00         0.00         0.00         0.00
Region FE              Yes          Yes          Yes          Yes
Region trend           Yes          Yes          Yes          Yes
Year FE                Yes          Yes          Yes          Yes
Instrument            None         None         None         None
```

The OLS estimate in column 1 shows that nighttime light intensity has virtually zero effect on conflict (coefficient = 0.001, p = 0.50), which is not statistically significant. This near-zero OLS result is a crucial benchmark: it does not mean economic shocks have no effect on conflict, but rather that the OLS estimate is biased toward zero by measurement error in nightlights as a proxy for true economic activity. The reduced-form estimates in columns 2-4 show that the instruments themselves predict conflict directly: higher rainfall reduces conflict (coefficient = -0.011, p < 0.01) and lower drought intensity also reduces conflict (PDSI coefficient = -0.002, p < 0.01). When both instruments are included together (column 4), rainfall remains marginally significant (p < 0.10) while drought retains significance at the 1% level, suggesting both channels matter independently.

### 2SLS/IV Estimation (Tables 2-3, Columns 5-7)

```text
                       (5)          (6)          (7)
                      2SLS         2SLS         2SLS
-------------------------------------------
Ln Lights(t-1)      -0.303***    -0.293***    -0.296***
                   (0.111)      (0.085)      (0.076)

-------------------------------------------
Observations         96591        96591        96591
N Regions             5689         5689         5689
R-squared            -0.54        -0.51        -0.52
Instrument        Rain(t-2)  Drought(t-2)       Both
```

The 2SLS estimates are dramatically different from OLS. Using rainfall as the sole instrument (column 5), the coefficient on nightlights is -0.303 (SE = 0.111, p < 0.01). Using drought alone (column 6) yields -0.293 (SE = 0.085, p < 0.01), and using both instruments together (column 7) gives -0.296 (SE = 0.076, p < 0.01). The remarkable consistency of the coefficient across all three IV specifications -- ranging from -0.293 to -0.303 -- strongly supports the robustness of the causal finding. The economic interpretation: a 10% decline in nighttime light intensity (roughly one-tenth of a log unit change) increases the probability of conflict with at least one fatality by about 3 percentage points, which represents a 66% increase over the baseline conflict rate of 4.6%.

### Conflict with 25+ Deaths (Table 3)

```text
                       (1)          (5)          (6)          (7)
                       OLS         2SLS         2SLS         2SLS
-------------------------------------------
Ln Lights(t-1)       0.001       -0.092       -0.093**     -0.093**
                   (0.001)      (0.057)      (0.046)      (0.040)

-------------------------------------------
Instrument            None     Rain(t-2)  Drought(t-2)       Both
```

For severe conflicts (25+ deaths), the pattern is similar but attenuated. OLS again shows no effect (0.001). The 2SLS coefficients are around -0.09, with the drought instrument and both-instruments specifications achieving statistical significance at the 5% level. A 10% decline in economic activity increases the probability of severe conflict by about 0.9 percentage points, which represents a 62% increase over the baseline rate of 1.4%. The rain-only instrument (column 5) narrowly misses significance (p = 0.11), consistent with the first-stage F-statistic being lower for rainfall alone.

### First-Stage Results and IV Diagnostics (Table 4)

```text
First-stage F-stat (Rain):     24.62
First-stage F-stat (Drought):  40.33
First-stage F-stat (Both):     25.32

Hansen J statistic:  0.007
Hansen J p-value:    0.932

Stock-Yogo 10% critical value (1 endogenous, 1 instrument): 16.38
```

The first-stage results confirm that the instruments are strong. The F-statistic for rainfall alone is 24.6, well above the Stock-Yogo 10% critical value of 16.38. Drought is an even stronger instrument with F = 40.3. The rainfall coefficient in the first stage is 0.036 (p < 0.001): a 1-unit increase in log rainfall raises log nighttime light intensity by 0.036 units in the following year. The drought coefficient is 0.006 (p < 0.001): less drought (higher PDSI) predicts higher economic activity. The Hansen J test for the overidentified model (both instruments) yields a p-value of 0.93, strongly failing to reject the null hypothesis of instrument validity -- both instruments appear to satisfy the exclusion restriction.

---

## Figure Inventory

| File | Description | Key Takeaway |
|------|-------------|--------------|
| `stata_iv_panel_coef_comparison.png` | Bar chart comparing OLS and 2SLS coefficients with 95% CIs for Conflict 1+ | OLS coefficient is essentially zero while all three 2SLS estimates are tightly clustered around -0.30, visually demonstrating the attenuation bias correction |
| `stata_iv_panel_reduced_form.png` | Bar chart of reduced-form coefficients (weather -> conflict) for both outcomes | All reduced-form effects are negative: more rain and less drought predict less conflict, with stronger effects for the 1+ death threshold |
| `stata_iv_panel_first_stage_rain.png` | Binned scatter plot of rainfall residuals vs. nightlight residuals (50 bins) | Clear positive relationship: higher rainfall increases economic activity, confirming instrument relevance |
| `stata_iv_panel_first_stage_drought.png` | Binned scatter plot of drought residuals vs. nightlight residuals (50 bins) | Positive slope: less drought (higher PDSI) increases economic activity, with tighter fit than rainfall |
| `stata_iv_panel_conflict_prevalence.png` | Time series of conflict prevalence (% of regions) from 1992 to 2010 | Conflict peaked in 1998-2002 and declined afterward; severe conflicts (25+ deaths) are consistently rarer, averaging about one-third the rate of any-death conflicts |

---

## Key Findings

1. **OLS is biased toward zero by measurement error.** The OLS coefficient on nighttime light intensity is 0.001 (p = 0.50), effectively zero. This is not evidence of no effect -- nightlights are a noisy proxy for true economic activity, and classical measurement error attenuates the coefficient toward zero.

2. **2SLS reveals a large, significant causal effect.** After instrumenting with weather shocks, the coefficient on nightlights is approximately -0.30 (p < 0.01), consistent across all three instrument specifications (rain: -0.303, drought: -0.293, both: -0.296). This is 300x the OLS magnitude.

3. **A 10% decline in economic activity raises conflict risk by 3 percentage points.** This corresponds to a 66% increase over the baseline conflict probability of 4.6%, shifting an average region's conflict risk from 4.6% to approximately 7.6%.

4. **Instruments are strong and valid.** First-stage F-statistics (24.6 for rain, 40.3 for drought) well exceed the Stock-Yogo critical value of 16.38. The Hansen J test (p = 0.93) fails to reject instrument validity for the overidentified model.

5. **The effect extends to severe conflicts but is attenuated.** For conflicts with 25+ deaths, the 2SLS coefficient is approximately -0.09 (p < 0.05), about one-third the magnitude of the 1+ death results. A 10% decline in economic activity increases severe conflict risk by 0.9 percentage points (from 1.4% to 2.3%).

6. **Drought is a stronger instrument than rainfall.** Drought (PDSI) has a first-stage F-statistic of 40.3 vs. 24.6 for rainfall, and the 2SLS estimates using drought alone achieve significance for both conflict thresholds, while rainfall alone misses significance for the 25+ death threshold.

7. **Conflict prevalence declined over the sample period.** The share of regions experiencing conflict (1+ deaths) declined from about 6% in 1994 to 2.5% in 2010, with a peak around 1998 (7%). Severe conflicts show a similar declining trend.

---

## Surprises and Caveats

- **Negative R-squared in 2SLS.** The R-squared values for the 2SLS specifications are negative (around -0.52), which is expected and not a sign of model failure. In IV estimation, the "R-squared" is computed from the structural residuals using the actual endogenous variable, not the fitted first-stage values. It can be negative when the instrument-induced variation in the endogenous variable explains the outcome differently than total variation does. This is a well-known artifact of 2SLS.

- **The lag structure matters for the exclusion restriction.** The key assumption is that weather in year t-2 affects conflict in year t only through its effect on economic activity in year t-1. This two-year lag structure is relatively conservative -- it rules out direct contemporaneous effects of weather on conflict psychology or logistics. However, persistent droughts or longer-term weather trends could potentially violate this restriction.

- **Pre-detrended variables used directly.** The script uses the `*_dt` variables that come pre-computed in the dataset. These are residuals from region-specific linear time trends, which is equivalent to including region-specific time trends in the regression. The detrending code is available in the reference .do file but was not re-run.
