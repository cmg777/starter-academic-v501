# Results Report: Beta and Sigma Convergence Across Countries

**Script:** `analysis.do`
**Executed:** 2026-05-01
**Status:** Success
**Language:** Stata SE
**Sample:** 84-country balanced panel (countries with GDP data since 1960)

---

## Execution Summary

The script implements a comprehensive tutorial on economic convergence using Penn World Tables 10.0, restricted to a balanced panel of 84 countries with data available since 1960. The tutorial features a comparative OLS vs NLS approach: students first learn to extract the speed of convergence from standard OLS output via an algebraic conversion, then learn NLS as a direct estimation method. The script produces 10 PNG figures and 7 CSV files covering beta convergence, sigma convergence, rolling windows (OLS and NLS), and convergence heatmaps (OLS and NLS).

The headline finding: unconditional convergence since 2000 at a speed of 0.36% per year (beta = 0.00365, p = 0.023, half-life = 190 years). OLS conversion and NLS direct estimation give identical point estimates. Sigma convergence only emerged after 2008, approximately 8 years after beta convergence.

---

## Data Overview

```
Summary of cleaned PWT dataset (balanced panel):

             Real GDP per capita (PPP, 2017 US$)
-------------------------------------------------------------
Obs               5,040
Mean           10811.48
Std. dev.       14375.5
Median          4873.14
Min              368.27
Max           102937.70
Skewness         2.158
Number of unique countries: 84
```

**Interpretation:** The balanced panel contains 5,040 country-year observations (84 countries x 60 years). GDP per capita ranges from $368 to $102,938, with a median of $4,873. The dataset excludes oil producers (IMF classification), countries with population under 1 million, and countries without 1960 GDP data. The balanced panel eliminates composition effects that would arise if the sample grew over time.

---

## Method Results

### Section 1: Beta Convergence (OLS, 1960-2019)

- OLS lambda = 0.00057 (p = 0.661, R-squared = 0.0013)
- N = 84 countries
- **No convergence** over the full period

### Section 2: Structural Break

- Era of Divergence (1960-2000): lambda = +0.00437 (p = 0.007, N = 84) --- richer countries grew faster
- Era of Convergence (2000-2019): lambda = -0.00352 (p = 0.019, N = 84) --- poorer countries now grow faster
- Total swing: 0.0079

### Section 3: Speed and Half-Life from OLS

| Period | OLS lambda | Structural beta | Speed (%/yr) | Half-life (yrs) | N |
|--------|-----------|----------------|-------------|----------------|---|
| 1960-2000 | +0.00437 | -0.00402 | -0.40 | n/a (divergence) | 84 |
| 1960-2019 | +0.00057 | -0.00056 | -0.06 | n/a | 84 |
| 1980-2019 | +0.00113 | -0.00110 | -0.11 | n/a | 84 |
| 1990-2019 | -0.00008 | +0.00008 | 0.01 | 8,530 | 84 |
| 1995-2019 | -0.00178 | +0.00182 | 0.18 | 381 | 84 |
| 2000-2019 | -0.00352 | +0.00365 | 0.36 | 190 | 84 |

### Section 4: NLS Demonstration (2000-2019)

- NLS beta = 0.00365 (SE = 0.00157, p = 0.023)
- OLS-derived beta = 0.00365
- Difference: ~10^-17 (numerical precision)

### Section 5: Speed and Half-Life from NLS

Identical point estimates to OLS conversion for all 6 periods. NLS provides direct standard errors for beta.

### Section 6: OLS vs NLS Comparison

All 6 periods show differences on the order of 10^-17, confirming algebraic equivalence.

### Section 7: Rolling Beta Convergence

| Start Year | Beta (OLS = NLS) | Speed (%/yr) | Half-life (yrs) | N |
|-----------|-----------------|-------------|----------------|---|
| 1960 | -0.00056 | -0.06 | n/a | 84 |
| 1970 | -0.00097 | -0.10 | n/a | 84 |
| 1980 | -0.00111 | -0.11 | n/a | 84 |
| 1990 | +0.00008 | 0.01 | 8,530 | 84 |
| 1995 | +0.00182 | 0.18 | 381 | 84 |
| 2000 | +0.00365 | 0.36 | 190 | 84 |
| 2005 | +0.00441 | 0.44 | 157 | 84 |
| 2010 | +0.00309 | 0.31 | 224 | 84 |

Peak convergence: start year 2005 (beta = 0.00441, half-life = 157 years).

### Section 8: Sigma Convergence (Two Periods)

- 1960: Variance = 0.924 (SD = 0.96), N = 84
- 2019: Variance = 1.764 (SD = 1.33), N = 84
- Change: +0.839 (+90.8%) --- sigma DIVERGENCE

### Section 9: Beta vs Sigma (Decade-by-Decade)

| Decade | OLS lambda | Variance (start) | Interpretation |
|--------|-----------|-----------------|----------------|
| 1960-1970 | +0.00594 | 0.9244 | Divergence |
| 1970-1980 | +0.00555 | 1.0818 | Divergence |
| 1980-1990 | +0.00686 | 1.2893 | Divergence |
| 1990-2000 | +0.00882 | 1.5384 | Divergence |
| 2000-2010 | -0.00379 | 1.8937 | Convergence |
| 2010-2019 | -0.00305 | 1.8262 | Convergence |

~8-year lag between beta convergence (2000) and sigma convergence (2008).

### Section 10: Sigma Convergence Over Time

| Year | Variance | N |
|------|----------|---|
| 1960 | 0.924 | 84 |
| 1970 | 1.082 | 84 |
| 1980 | 1.289 | 84 |
| 1990 | 1.538 | 84 |
| 2000 | 1.894 | 84 |
| 2008 | 1.918 (peak) | 84 |
| 2010 | 1.826 | 84 |
| 2019 | 1.764 | 84 |

Variance increased 108% from 1960 to peak (2008), then declined 8.1% from peak to 2019.

### Section 11: Convergence Heatmaps

~1,770 regressions computed for both OLS and NLS. Both heatmaps show identical patterns: blue (convergence) dominates periods ending after 2010; red (divergence) dominates periods ending before 2000. The two heatmaps are virtually indistinguishable.

---

## Figures Generated

1. `stata_convergence_scatter_1960_2019.png` --- OLS scatter, full period
2. `stata_convergence_scatter_two_eras.png` --- Side-by-side divergence vs convergence
3. `stata_convergence_speed_ols.png` --- OLS speed bar chart
4. `stata_convergence_speed_nls.png` --- NLS speed bar chart
5. `stata_convergence_rolling_beta_ols.png` --- Rolling OLS beta
6. `stata_convergence_rolling_beta_nls.png` --- Rolling NLS beta
7. `stata_convergence_sigma_two_periods.png` --- Variance 1960 vs 2019
8. `stata_convergence_sigma_evolution.png` --- Year-by-year variance
9. `stata_convergence_heatmap_ols.png` --- OLS convergence heatmap
10. `stata_convergence_heatmap_nls.png` --- NLS convergence heatmap

---

## Key Differences from Previous Version

1. **Balanced panel:** All sections now use the same 84 countries (previously varied 84-124)
2. **OLS-first pedagogy:** Speed/half-life derived from OLS before introducing NLS
3. **OLS vs NLS comparison:** Explicit demonstration of algebraic equivalence
4. **Two rolling-window figures:** OLS and NLS separately (previously NLS only)
5. **Two heatmaps:** OLS and NLS separately (previously NLS only)
6. **Single sigma series:** Balanced panel eliminates need for fixed-sample robustness check
7. **Regional decomposition removed:** Not supported with 84-country sample
8. **Sigma divergence stronger:** 90.8% increase (vs 60.4% previously, due to consistent N=84 in both years)
9. **Convergence slightly slower:** beta = 0.00365, half-life = 190 years (vs 0.00425, 169 years with N=124)
