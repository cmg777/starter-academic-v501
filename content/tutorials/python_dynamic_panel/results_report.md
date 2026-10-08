# Results Report: Dynamic Panel Data Models in Python — Employment Persistence

**Script:** `script.py` (548 lines)
**Executed:** 2026-06-11
**Status:** Success — 0 errors, 0 warnings printed (one cosmetic matplotlib "non-interactive backend" warning is filtered at the top of the script; the replication check's hard assertion passed)
**Runtime:** not recorded in the log (a few seconds wall clock; all estimators are closed-form GMM/OLS/2SLS — no simulation or bootstrap)
**Language:** Python 3.11.1 (hermetic venv at `/tmp/venv_pydynpd`)
**Key packages:** `pydynpd` 0.2.2 (difference/system GMM), `pyfixest` 0.50.1 (OLS/FE/IV benchmarks), `numpy` 2.4.6, `pandas` 3.0.3, `matplotlib` 3.10.9, `scipy` 1.17.1. The script carries a 6-line NumPy-2 compatibility shim for `pydynpd` 0.2.2 (`np.in1d` alias + scalar-conversion wrappers injected into `pydynpd.specification_tests`).

**Methodological references (acknowledged throughout):** Arellano, M. & Bond, S. (1991). "Some Tests of Specification for Panel Data: Monte Carlo Evidence and an Application to Employment Equations." *Review of Economic Studies* 58(2): 277–297 (the data and the difference-GMM estimator). Blundell, R. & Bond, S. (1998). "Initial Conditions and Moment Restrictions in Dynamic Panel Data Models." *Journal of Econometrics* 87(1): 115–143 (the system-GMM estimator and the AR(1) labor-demand specification the script adopts as its running model). Bond, S. (2002). "Dynamic Panel Data Models: A Guide to Micro Data Methods and Practice." *Portuguese Economic Journal* 1(2): 141–162 (the OLS–FE bracket diagnostic). Roodman, D. (2009). "How to Do xtabond2." *Stata Journal* 9(1): 86–136 (instrument-proliferation guidance). GMM estimation uses Wu, D., Hua, L. & Xu, J. (2023). "pydynpd: A Python package for dynamic panel model." *Journal of Open Source Software* 8(83): 4416, https://doi.org/10.21105/joss.04416; Section 8 replicates the package's published README example verbatim.

**Estimand framing (descriptive/structural — not ATE/ATT):** the parameter of interest is ρ, the autoregressive coefficient of the dynamic labor-demand equation n_it = ρ·n_i,t−1 + β₁w_it + β₂w_i,t−1 + β₃k_it + β₄k_i,t−1 + α_i + δ_t + ε_it — how persistent firm employment is after conditioning on wages and capital. Identification rests on sequential exogeneity of the lagged instruments and no serial correlation in ε_it, tested via AR(2) and Hansen.

---

## Execution Summary

The script estimates the persistence of firm-level employment on the classic Arellano–Bond (1991) panel of 140 UK manufacturing firms observed 1976–1984 (1,031 firm-years, unbalanced: 7–9 years per firm), walking the full beginner-to-practitioner arc: pooled OLS and the within estimator establish the bias bracket, Anderson–Hsiao IV shows that one instrument is consistent but hopelessly imprecise, Arellano–Bond difference GMM uses all available lags but hugs the biased FE bound (the Bond 2002 weak-instrument symptom), and Blundell–Bond system GMM with collapsed instruments delivers the headline estimate with clean diagnostics. An instrument-proliferation grid and an exact replication of the pydynpd documentation example round out the analysis. Execution was completely clean — no errors, no warnings printed, and the Section 8 replication assertion (`Exact match: True`) passed.

The headline has four layers, all on the same ρ scale: (i) the two naive estimators bracket the truth — pooled OLS gives **ρ̂ = 0.9617 (SE 0.0084)**, biased up by the omitted firm effect, and fixed effects gives **ρ̂ = 0.6262 (SE 0.0515)**, biased down by Nickell bias, so a consistent estimate must land in **[0.626, 0.962]**; (ii) Anderson–Hsiao IV gives **ρ̂ = 1.2327 (SE 0.4782)** — consistent in theory but with a 95 % CI of [0.296, 2.170] that swallows the entire bracket and the unit root; (iii) two-step difference GMM with 91 instruments gives **ρ̂ = 0.6788 (SE 0.0891)** — only 0.053 above the FE lower bound, within one SE of it, the textbook signature of weak instruments when the series is persistent; (iv) two-step system GMM with 32 collapsed instruments gives the headline **ρ̂ = 0.9270 (SE 0.0785)**, inside the bracket, with AR(2) p = 0.994 and Hansen p = 0.462 — comfortably away from both 0.05 and the p ≈ 1 overfitting red flag. Substantively: roughly **93 % of an employment shock survives into the next year**, an implied half-life of about nine years.

**Warnings (all non-fatal):**
- none printed. The script pre-filters one cosmetic matplotlib warning ("FigureCanvasAgg is non-interactive") that would otherwise appear when `plt.show()` runs under `MPLBACKEND=Agg`.
- The AR(1) rejections (p ≈ 0.000) in every GMM table are *expected and mechanical*, not warnings — see Surprises § Cosmetic warnings.

---

## Data Overview

```text
Dataset shape: (1031, 10)
Firms: 140, years: 1976-1984

Observations per firm (unbalanced panel):
                n_firms
years_observed
7                   103
8                    23
9                    14

Summary statistics (log variables used in estimation):
              n         w         k        ys
count  1031.000  1031.000  1031.000  1031.000
mean      1.056     3.143    -0.442     4.638
std       1.342     0.263     1.514     0.094
min      -2.263     2.082    -4.431     4.465
25%       0.166     3.027    -1.510     4.576
50%       0.827     3.178    -0.658     4.611
75%       1.949     3.314     0.406     4.706
max       4.687     3.812     3.852     4.855

Between-firm SD of log employment: 1.339
Within-firm SD of log employment:  0.195
```

**Interpretation:** The panel holds **1,031 firm-year observations on 140 UK manufacturing firms** over 1976–1984 — short and wide (large N, T between 7 and 9), exactly the geometry dynamic-panel GMM was designed for, and exactly where Nickell bias (order 1/T) bites hardest. The panel is unbalanced: 103 firms appear for 7 years, 23 for 8, and 14 for all 9. Log employment `n` spans −2.26 to 4.69 (firms from about 0.1 to over 100 thousand employees), and the variance decomposition is lopsided: the between-firm SD of log employment (**1.339**) is nearly **seven times** the within-firm SD (**0.195**), meaning employment differences live mostly *across* firms — precisely the situation where an unobserved firm effect α_i dominates and pooled OLS will load it onto the lagged dependent variable.

---

## Method Results

### 4.1 Panel structure — employment trajectories

![Log-employment paths for 40 sample firms with the median path and one example firm](python_dynamic_panel_trajectories.png)

**Raw output:**

```text
Between-firm SD of log employment: 1.339
Within-firm SD of log employment:  0.195
Employment differences are mostly BETWEEN firms - exactly the
situation where unobserved firm effects alpha_i loom large.

Saved figure: python_dynamic_panel_trajectories.png
```

**Interpretation:** Figure 1 plots 40 randomly sampled firms' log-employment paths (seed-pinned, `default_rng(42)`) in translucent steel blue, the median across all 140 firms in orange, and one example firm in teal. Each firm orbits its own level — paths are roughly parallel and rarely cross — which is the visual signature of a firm fixed effect plus high persistence, the two ingredients that make ρ hard to estimate. The orange median drifts gently downward after 1980, consistent with the early-1980s UK manufacturing recession that the year dummies δ_t will absorb in every model below. This figure is the "why" of the whole tutorial: any estimator that ignores α_i (pooled OLS) or mangles it (within demeaning with T ≈ 7–9) will get ρ wrong in a predictable direction.

### 4.2 Data preparation — lags and first differences

**Raw output:**

```text
Full panel rows: 1031
Estimation sample after requiring one lag: 891 rows (140 firms)
Each lag costs the first year(s) of every firm - with T as small as
7-9, observations are precious. Keep this in mind for GMM later.

Exported: data_prepared.csv
```

**Interpretation:** Constructing one lag of n, w, and k within each firm costs each firm its first observed year, shrinking the estimation sample from **1,031 to 891 rows (−13.6 %)** while keeping all 140 firms. This is the first lesson in dynamic-panel frugality: with T as small as 7, each additional lag or difference burns a meaningful share of the data — the GMM estimators below will run on as few as 751 (main spec) or 611 (two-lag replication spec) observations. The exported `data_prepared.csv` (1,031 rows × 20 columns) carries all firm-level lags and first differences used by every estimator, so each method is run on identically constructed variables.

### 4.3 The bias bracket — pooled OLS vs fixed effects

![Pooled OLS (biased up) and fixed effects (Nickell bias, down) bracket the credible range for rho](python_dynamic_panel_bias_bracket.png)

**Raw output:**

```text
Pooled OLS (year dummies, SEs clustered by firm):
             Estimate  Std. Error   t value  Pr(>|t|)    2.5%   97.5%
Coefficient
n_lag1         0.9617      0.0084  115.0717    0.0000  0.9452  0.9782
w             -0.4147      0.1600   -2.5915    0.0106 -0.7311 -0.0983
w_lag1         0.3556      0.1559    2.2803    0.0241  0.0473  0.6639
k              0.3997      0.0565    7.0710    0.0000  0.2879  0.5114
k_lag1        -0.3675      0.0565   -6.4990    0.0000 -0.4793 -0.2557

Fixed effects / within (firm + year dummies, clustered SEs):
             Estimate  Std. Error  t value  Pr(>|t|)    2.5%   97.5%
Coefficient
n_lag1         0.6262      0.0515  12.1510    0.0000  0.5243  0.7281
w             -0.5035      0.1450  -3.4729    0.0007 -0.7902 -0.2169
w_lag1         0.2308      0.1077   2.1420    0.0339  0.0178  0.4438
k              0.4078      0.0566   7.2024    0.0000  0.2959  0.5198
k_lag1        -0.1648      0.0547  -3.0100    0.0031 -0.2730 -0.0565

  rho_OLS = 0.9617 (se 0.0084)   <- upper bound (biased up)
  rho_FE  = 0.6262 (se 0.0515)   <- lower bound (biased down)
```

### Table — The bracket endpoints (`ols_results.csv`, `fe_results.csv`)

| Estimator | ρ̂ (n_lag1) | SE | 95 % CI | Direction of bias |
|---|---:|---:|---|---|
| Pooled OLS (year FE, clustered by firm) | **0.961721** | 0.008358 | [0.945197, 0.978246] | up — L1.n positively correlated with omitted α_i |
| Fixed effects (firm + year FE, clustered) | **0.626229** | 0.051537 | [0.524331, 0.728127] | down — Nickell bias, order 1/T with T ≈ 7–9 |

**Interpretation:** The two "wrong" estimators disagree by **0.336** — pooled OLS says ρ̂ = 0.9617 (so close to a unit root that the implied shock half-life is ≈ 18 years) while fixed effects says ρ̂ = 0.6262 (half-life ≈ 1.5 years). Neither is right, but both errors have *known sign*: OLS loads the omitted firm effect onto L1.n and biases ρ upward, while the within transformation creates a mechanical negative correlation between demeaned L1.n and the demeaned error (Nickell 1981) and biases ρ downward by order 1/T. Bond's (2002) practical diagnostic follows: any consistent estimator should land inside **[0.626, 0.962]**, and the two cluster-robust CIs do not even overlap, so the bracket is sharply identified. The control coefficients are economically sensible in both columns — the contemporaneous wage elasticity is negative (−0.41 OLS, −0.50 FE) and the capital elasticity positive (≈ 0.40) — but the headline lesson of this section is that the *same regression* delivers half-lives of 18 versus 1.5 years depending on how it treats α_i.

### 4.4 Anderson–Hsiao IV — consistent but imprecise

**Raw output:**

```text
Anderson-Hsiao 2SLS (differences, year dummies, clustered SEs):
             Estimate  Std. Error  t value  Pr(>|t|)    2.5%   97.5%
Coefficient
d_w           -0.5243      0.2135  -2.4556    0.0153 -0.9465 -0.1021
d_w_lag1       0.5808      0.3128   1.8566    0.0655 -0.0377  1.1992
d_k            0.2463      0.0777   3.1693    0.0019  0.0927  0.4000
d_k_lag1      -0.2925      0.1964  -1.4890    0.1388 -0.6808  0.0959
d_n_lag1       1.2327      0.4782   2.5781    0.0110  0.2873  2.1781

  rho_AH = 1.2327 (se 0.4782)
  95% CI: [0.296, 2.170]
```

### Table — Anderson–Hsiao headline (`anderson_hsiao_results.csv`)

| Coefficient | Estimate | SE | 95 % CI |
|---|---:|---:|---|
| d_n_lag1 (= ρ̂) | **1.232717** | 0.478156 | [0.287318, 2.178116] |
| d_w | −0.524300 | 0.213516 | [−0.946458, −0.102141] |
| d_k | 0.246330 | 0.077724 | [0.092655, 0.400004] |

*(The CSV's 2.5 %/97.5 % columns are pyfixest's t-based CIs; the script's printed CI [0.296, 2.170] uses ±1.96·SE — both are correct quotes of their sources.)*

**Interpretation:** First-differencing eliminates α_i, and instrumenting the now-endogenous Δn_i,t−1 with the level n_i,t−2 restores consistency — but with **exactly one instrument**, the point estimate ρ̂ = **1.2327 (SE 0.4782)** lands *above* the unit root, outside the bracket, and its 95 % CI **[0.296, 2.170]** is 1.87 units wide: it contains the entire OLS–FE bracket, the unit root, and explosive dynamics all at once. Taken literally, the estimate says every employment shock *amplifies* over time, which no one believes; taken correctly, it says one instrument extracts far too little information from a persistent series to be useful. This is the motivating failure for GMM: if n_i,t−2 is a valid instrument, then so is every deeper lag — Arellano–Bond's insight is to use them all and weight them optimally.

### 4.5 Difference GMM (Arellano–Bond 1991)

**Raw output (two-step, Windmeijer-corrected SEs; one-step table also in `execution_log.txt`):**

```text
 Dynamic panel-data estimation, two-step difference GMM
 Group variable: id                               Number of obs = 751
 Time variable: year                              Min obs per group: 5
 Number of instruments = 91                       Max obs per group: 7
 Number of groups = 140                           Avg obs per group: 5.36
+-----------+------------+---------------------+------------+-----------+-----+
|     n     |   coef.    | Corrected Std. Err. |     z      |   P>|z|   |     |
+-----------+------------+---------------------+------------+-----------+-----+
|    L1.n   | 0.6787867  |      0.0890781      | 7.6201324  | 0.0000000 | *** |
|     w     | -0.7198296 |      0.1221408      | -5.8934431 | 0.0000000 | *** |
|    L1.w   | 0.4626914  |      0.1134755      | 4.0774568  | 0.0000455 | *** |
|     k     | 0.4539046  |      0.1275537      | 3.5585358  | 0.0003729 | *** |
|    L1.k   | -0.1914923 |      0.1044671      | -1.8330393 | 0.0667967 |     |
+-----------+------------+---------------------+------------+-----------+-----+
Hansen test of overid. restrictions: chi(79) = 88.797 Prob > Chi2 = 0.211
Arellano-Bond test for AR(1) in first differences: z = -4.46 Pr > z =0.000
Arellano-Bond test for AR(2) in first differences: z = -0.17 Pr > z =0.866

  one-step: rho = 0.7075 (se 0.0842)
  two-step: rho = 0.6788 (se 0.0891), 91 instruments
```

### Table — Difference GMM headline rows (`diff_gmm_results.csv`, `estimates_summary.csv`)

| Estimator | ρ̂ (L1.n) | SE | 95 % CI | Instruments | Hansen p | AR(2) p |
|---|---:|---:|---|---:|---:|---:|
| Diff GMM, one-step | 0.707470 | 0.084179 | [0.542480, 0.872461] | 91 | 0.211322 | 0.891264 |
| Diff GMM, two-step (Windmeijer) | **0.678787** | 0.089078 | [0.504194, 0.853380] | 91 | 0.211322 | 0.865995 |

**Interpretation:** Using all available lags (t−2 and deeper) of n, w, and k as instruments for the differenced equation — 91 instruments across 751 usable observations on 140 firms — the two-step Arellano–Bond estimator returns **ρ̂ = 0.6788 (SE 0.0891)**. The formal diagnostics all pass: AR(1) in differences rejects as it mechanically must (z = −4.46, p = 0.000), AR(2) is far from rejecting (z = −0.17, p = 0.866), validating the t−2 instruments, and Hansen accepts the overidentifying restrictions (χ²(79) = 88.80, p = 0.211). Yet the *informal* Bond (2002) diagnostic fails loudly: ρ̂ sits only **0.053 above the FE lower bound of 0.626** — well within one standard error of it and in the bottom sixth of the bracket. When the true series is persistent (ρ near 1), lagged *levels* barely predict future *differences*, so the instruments are weak and difference GMM inherits a downward drag toward the within estimator. The point estimate passes every printed test and is still not to be trusted — the single most valuable lesson of the tutorial.

### 4.6 System GMM (Blundell–Bond 1998) — the headline model

**Raw output (two-step, collapsed instruments; one-step table also in `execution_log.txt`):**

```text
 Dynamic panel-data estimation, two-step system GMM
 Group variable: id                               Number of obs = 751
 Time variable: year                              Min obs per group: 5
 Number of instruments = 32                       Max obs per group: 7
 Number of groups = 140                           Avg obs per group: 5.36
+-----------+------------+---------------------+------------+-----------+-----+
|     n     |   coef.    | Corrected Std. Err. |     z      |   P>|z|   |     |
+-----------+------------+---------------------+------------+-----------+-----+
|    L1.n   | 0.9269913  |      0.0785085      | 11.8075341 | 0.0000000 | *** |
|     w     | -0.8155041 |      0.2763832      | -2.9506278 | 0.0031713 |  ** |
|    L1.w   | 0.6331152  |      0.3327639      | 1.9025958  | 0.0570933 |     |
|     k     | 0.5894690  |      0.1715356      | 3.4364236  | 0.0005894 | *** |
|    L1.k   | -0.4888581 |      0.1969821      | -2.4817381 | 0.0130743 |  *  |
|    _con   | 0.6404202  |      0.4628017      | 1.3837897  | 0.1664229 |     |
+-----------+------------+---------------------+------------+-----------+-----+
Hansen test of overid. restrictions: chi(19) = 18.918 Prob > Chi2 = 0.462
Arellano-Bond test for AR(1) in first differences: z = -4.49 Pr > z =0.000
Arellano-Bond test for AR(2) in first differences: z = -0.01 Pr > z =0.994

  two-step: rho = 0.9270 (se 0.0785), 32 instruments
  one-step: rho = 0.9025 (se 0.0634)

DIAGNOSTICS for the headline model (two-step system GMM):
  AR(1) in differences: p = 0.000  -> should REJECT (mechanical)
  AR(2) in differences: p = 0.994  -> must NOT reject (validates t-2 instruments)
  Hansen J overidentification: p = 0.462 -> comfortably
  away from both 0.05 (instruments invalid) and 1.0 (too many
  instruments, test losing power). rho = 0.927 sits INSIDE the
  OLS-FE bracket [0.626, 0.962] - all checks pass.
```

### Table — System GMM headline rows (`sys_gmm_results.csv`, `estimates_summary.csv`)

| Estimator | ρ̂ (L1.n) | SE | 95 % CI | Instruments | Hansen p | AR(2) p |
|---|---:|---:|---|---:|---:|---:|
| Sys GMM, one-step, collapsed | 0.902460 | 0.063430 | [0.778137, 1.026784] | 32 | 0.462104 | 0.949193 |
| Sys GMM, two-step, collapsed (**headline**) | **0.926991** | 0.078508 | [0.773115, 1.080868] | 32 | 0.462104 | 0.994396 |

**Interpretation:** System GMM stacks the differenced equation (instrumented by lagged levels) with the levels equation (instrumented by lagged differences), buying identification strength from the extra mean-stationarity assumption — and with collapsed instruments holding the count to 32 (well under Roodman's N = 140 ceiling), the two-step estimate is **ρ̂ = 0.9270 (SE 0.0785)**: inside the bracket, 0.25 above the weak-instrument difference-GMM estimate, with textbook diagnostics (AR(1) p = 0.000 rejecting mechanically; AR(2) p = 0.994 clean; Hansen p = 0.462, comfortably away from both 0.05 and the p ≈ 1 overfitting flag). Substantively, **about 93 % of an employment shock survives into the next year** — an implied half-life of roughly nine years (0.927⁵ ≈ 0.68 after five years) — versus the 1.5-year half-life FE would have implied. One honest caveat belongs next to the headline: the 95 % CI **[0.773, 1.081] includes 1.0**, so a unit root in employment cannot be rejected at the 5 % level; the point estimate, not the boundary, is the deliverable. The short-run wage elasticity sharpens to **−0.816 (SE 0.276)** and the capital elasticity to **0.589 (SE 0.172)**; the implied long-run wage elasticity (β₁+β₂)/(1−ρ) ≈ −2.5 is mechanically explosive in magnitude precisely because the (1−ρ) denominator is near zero, and should be quoted only with that warning attached.

### 4.7 Instrument proliferation — lag windows vs collapse

![Instrument count vs Hansen p-value across lag windows, full vs collapsed instrument matrix](python_dynamic_panel_instrument_proliferation.png)

**Raw output:**

```text
  lags 2:3   collapse=False ->  68 instruments, rho = 0.956, Hansen p = 0.035
  lags 2:3   collapse=True  ->  17 instruments, rho = 0.921, Hansen p = 0.096
  lags 2:5   collapse=False ->  95 instruments, rho = 0.935, Hansen p = 0.186
  lags 2:5   collapse=True  ->  23 instruments, rho = 0.937, Hansen p = 0.255
  lags 2:99  collapse=False -> 113 instruments, rho = 0.930, Hansen p = 0.235
  lags 2:99  collapse=True  ->  32 instruments, rho = 0.927, Hansen p = 0.462
```

### Table — System GMM across the lag-window × collapse grid (`proliferation_grid.csv`)

| Lag window | Collapsed | Instruments | ρ̂ | SE | Hansen p | AR(2) p |
|---|---|---:|---:|---:|---:|---:|
| 2:3 | no | 68 | 0.955517 | 0.032188 | **0.034769** | 0.763072 |
| 2:3 | yes | 17 | 0.921058 | 0.100070 | 0.095711 | 0.934311 |
| 2:5 | no | 95 | 0.935397 | 0.033514 | 0.185905 | 0.734343 |
| 2:5 | yes | 23 | 0.937411 | 0.098227 | 0.254564 | 0.908363 |
| 2:99 | no | 113 | 0.929638 | 0.027392 | 0.234878 | 0.805161 |
| 2:99 | yes | 32 | **0.926991** | 0.078508 | 0.462104 | 0.994396 |

**Interpretation:** Across all six specifications ρ̂ barely moves — the range is **0.921 to 0.956**, a spread of 0.035 — but the *machinery around it* changes dramatically: the uncollapsed instrument count climbs from 68 to 113 (approaching Roodman's N = 140 ceiling) and the Hansen p-value drifts upward (0.035 → 0.186 → 0.235) even though the underlying model never changes, the overfitting trajectory whose endpoint is the notorious "Hansen p ≈ 1.0" red flag. The grid also catches proliferation distorting the test in the *other* tail: the uncollapsed 2:3 specification is **rejected by Hansen (p = 0.0348 < 0.05)** while its collapsed twin passes (p = 0.0957) — same lag window, same data, different verdicts driven purely by instrument count. The practical takeaway the figure makes visible: collapsed specifications (teal diamonds) buy nearly identical point estimates with a quarter of the instruments, at the honest price of larger SEs (0.0785 collapsed vs 0.0274 uncollapsed at 2:99 — uncollapsed precision that is exactly the overfitting one should distrust).

### 4.8 Replication check — the pydynpd documentation example

**Raw output:**

```text
 Dynamic panel-data estimation, two-step difference GMM
 Group variable: id                               Number of obs = 611
 Number of instruments = 42                       Number of groups = 140
+-----------+------------+---------------------+------------+-----------+-----+
|    L1.n   | 0.2710675  |      0.1382542      | 1.9606462  | 0.0499203 |  *  |
|    L2.n   | -0.0233928 |      0.0419665      | -0.5574151 | 0.5772439 |     |
|     w     | -0.5668527 |      0.2092231      | -2.7093219 | 0.0067421 |  ** |
|     k     | 0.3613939  |      0.0662624      | 5.4539824  | 0.0000000 | *** |
+-----------+------------+---------------------+------------+-----------+-----+
Hansen test of overid. restrictions: chi(32) = 32.666 Prob > Chi2 = 0.434
Arellano-Bond test for AR(1) in first differences: z = -1.29 Pr > z =0.198
Arellano-Bond test for AR(2) in first differences: z = -0.31 Pr > z =0.760

  Published vignette values: L1.n = 0.2710675, Hansen chi2 = 32.666,
  42 instruments.
  Our run:                   L1.n = 0.2710675, Hansen chi2 = 32.666, 42 instruments.
  Exact match: True
```

### Table — Replication spec headline rows (`ab_replication_results.csv`)

| Variable | Coefficient | SE | p-value |
|---|---:|---:|---:|
| L1.n | **0.271068** | 0.138254 | 0.049920 |
| L2.n | −0.023393 | 0.041966 | 0.577244 |
| w | −0.566853 | 0.209223 | 0.006742 |
| k | 0.361394 | 0.066262 | 0.000000 |

**Interpretation:** Running the pydynpd README's exact command string (`n L(1:2).n w k | gmm(n, 2:4) gmm(w, 1:3) iv(k) | timedumm nolevel` — the original Arellano–Bond two-lag specification, a *different* model from our running spec) reproduces the package's published output **to all printed digits**: L1.n = 0.2710675, Hansen χ²(32) = 32.666 (p = 0.434), 42 instruments, 611 observations — and the script's hard assertion confirms `Exact match: True`. This verifies the toolchain (including the NumPy-2 compatibility shim) against the package's own published benchmark, which the pydynpd authors in turn validated against Stata's `xtabond2`. The much lower ρ̂ here (0.271) is *not* a contradiction of our headline 0.927: this is difference GMM (subject to the same weak-instrument drag as Section 4.5), on a two-lag dynamic specification, with a restricted 2:4 lag window — a deliberate reminder that "the" persistence estimate is always joint with the specification and estimator that produced it.

### 4.9 Synthesis — seven estimators on one axis

![Forest plot of rho-hat across all seven estimators with the OLS-FE bracket band](python_dynamic_panel_estimates_forest.png)

**Raw output:**

```text
                    estimator   rho1     se  ci_lo  ci_hi  hansen_p  ar1_p  ar2_p  n_instruments
                   Pooled OLS 0.9617 0.0084 0.9453 0.9781       NaN    NaN    NaN            NaN
                Fixed effects 0.6262 0.0515 0.5252 0.7272       NaN    NaN    NaN            NaN
            Anderson-Hsiao IV 1.2327 0.4782 0.2955 2.1699       NaN    NaN    NaN            1.0
          Diff GMM (one-step) 0.7075 0.0842 0.5425 0.8725    0.2113    0.0 0.8913           91.0
          Diff GMM (two-step) 0.6788 0.0891 0.5042 0.8534    0.2113    0.0 0.8660           91.0
Sys GMM (one-step, collapsed) 0.9025 0.0634 0.7781 1.0268    0.4621    0.0 0.9492           32.0
Sys GMM (two-step, collapsed) 0.9270 0.0785 0.7731 1.0809    0.4621    0.0 0.9944           32.0
```

### Table — All seven estimators (`estimates_summary.csv`, full precision)

| Estimator | ρ̂ | SE | 95 % CI | Instruments | Hansen p | AR(2) p |
|---|---:|---:|---|---:|---:|---:|
| Pooled OLS | 0.961721 | 0.008358 | [0.945340, 0.978102] | — | — | — |
| Fixed effects | 0.626229 | 0.051537 | [0.525216, 0.727242] | — | — | — |
| Anderson–Hsiao IV | 1.232717 | 0.478156 | [0.295531, 2.169903] | 1 | — | — |
| Diff GMM (one-step) | 0.707470 | 0.084179 | [0.542480, 0.872461] | 91 | 0.211322 | 0.891264 |
| Diff GMM (two-step) | 0.678787 | 0.089078 | [0.504194, 0.853380] | 91 | 0.211322 | 0.865995 |
| Sys GMM (one-step, collapsed) | 0.902460 | 0.063430 | [0.778137, 1.026784] | 32 | 0.462104 | 0.949193 |
| Sys GMM (two-step, collapsed) | **0.926991** | 0.078508 | [0.773115, 1.080868] | 32 | 0.462104 | 0.994396 |

**Interpretation:** The forest plot is the tutorial in one image: the grey OLS (0.962) and FE (0.626) markers define the shaded credible band; Anderson–Hsiao's enormous whisker (CI width 1.87) straddles everything including the dashed unit-root line; both difference-GMM estimates (orange) sit in the bottom of the band hugging the FE bound; and the two system-GMM estimates (teal, 0.902 and 0.927) land in the upper half of the band with usable precision. The estimator you choose moves the implied employment-shock half-life from **1.5 years (FE) to 18 years (OLS)**, with the diagnosed-and-defended system-GMM answer at **about 9 years** — and only the bracket logic plus the AR(2)/Hansen/proliferation diagnostics, not any single printed p-value, separates the defensible estimate from the four seductive wrong ones.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `python_dynamic_panel_trajectories.png` | Log-employment paths for 40 sample firms (steel blue) with the all-140-firm median (orange) and one example firm (teal), 1976–1984. | Paths are persistent and roughly parallel — each firm orbits its own level, the visual signature of a firm fixed effect α_i; between-firm SD (1.339) is ~7× the within-firm SD (0.195). |
| 2 | `python_dynamic_panel_bias_bracket.png` | Error-bar plot of ρ̂ from pooled OLS (0.962, blue) and fixed effects (0.626, orange) with the shaded credible bracket between them and the unit-root line at 1.0. | Two wrong answers with known bias directions bracket the truth: any consistent estimate must land in [0.626, 0.962]; the two CIs do not overlap. |
| 3 | `python_dynamic_panel_instrument_proliferation.png` | Scatter of Hansen p-value vs instrument count for system GMM across lag windows {2:3, 2:5, 2:99}, full matrix (blue circles) vs collapsed (teal diamonds), with the p = 0.05 line and Roodman's N = 140 ceiling. | More instruments inflate the Hansen p mechanically (0.035 → 0.235 uncollapsed) while ρ̂ barely moves; the uncollapsed 2:3 spec is rejected (p = 0.035) while its collapsed twin passes — proliferation distorts the test in both tails. |
| 4 | `python_dynamic_panel_estimates_forest.png` | Forest plot of ρ̂ with 95 % CIs for all seven estimators, the OLS–FE bracket band shaded, and the unit-root line dashed. | System GMM (0.927) is the only estimator that lands in the upper half of the bracket while passing both the printed diagnostics and the Bond weak-instrument check; Anderson–Hsiao's CI swallows the axis and difference GMM hugs the biased FE bound. |

---

## Key Findings

1. **The two naive estimators disagree by 0.336 and bracket the truth with known bias directions.** Pooled OLS gives ρ̂ = **0.961721 (SE 0.008358)** because the lagged dependent variable absorbs the omitted firm effect (bias up); the within estimator gives ρ̂ = **0.626229 (SE 0.051537)** because of Nickell bias of order 1/T with T ≈ 7–9 (bias down). Their cluster-robust 95 % CIs ([0.945, 0.978] vs [0.525, 0.727], normal-based, `estimates_summary.csv`) do not overlap, so the Bond (2002) bracket [0.626, 0.962] is sharply identified before any GMM is run (`ols_results.csv`, `fe_results.csv`).

2. **Anderson–Hsiao IV is consistent and useless at the same time.** With the single instrument n_i,t−2 for Δn_i,t−1, the 2SLS estimate is ρ̂ = **1.232717 (SE 0.478156)** — above the unit root — with a 95 % CI of **[0.296, 2.170]** that is 1.87 units wide and contains the entire OLS–FE bracket, the unit root, and explosive dynamics (`anderson_hsiao_results.csv`). The fix is not a better instrument but *more* of them: every deeper lag is also valid.

3. **Difference GMM passes every printed test and still gives a suspect answer — the Bond (2002) diagnostic in action.** Two-step Arellano–Bond with 91 instruments on 751 observations returns ρ̂ = **0.678787 (SE 0.089078)** with clean diagnostics (Hansen χ²(79) = 88.797, p = 0.211; AR(2) z = −0.17, p = 0.866) — yet the estimate sits only 0.053 above the FE lower bound, within one SE of it. With ρ near 1, lagged levels barely predict future differences; weak instruments drag difference GMM toward the biased within estimator (`diff_gmm_results.csv`).

4. **System GMM is the headline: ρ̂ = 0.926991 (SE 0.078508), inside the bracket, all diagnostics clean.** Two-step Blundell–Bond with 32 collapsed instruments gives AR(1) p ≈ 0.000 (mechanical, expected), AR(2) p = **0.994396**, and Hansen p = **0.462104** — comfortably away from both the 0.05 rejection region and the p ≈ 1 overfitting flag. About **93 % of an employment shock survives into the next year** (`sys_gmm_results.csv`, `estimates_summary.csv`).

5. **The estimator choice moves the implied shock half-life from 1.5 to 18 years.** FE's ρ̂ = 0.626 implies a half-life of ln(0.5)/ln(0.626) ≈ **1.5 years**; OLS's 0.962 implies ≈ **18 years**; the defended system-GMM estimate of 0.927 implies ≈ **9 years** (0.927⁵ ≈ 0.68 of a shock still present after five years). For a manager or policymaker, the "same regression" delivers utterly different pictures of labor-market adjustment depending on the estimator — the substantive stake of the whole exercise.

6. **The system-GMM CI includes the unit root.** The headline 95 % CI is **[0.773115, 1.080868]**: employment persistence is high and precisely *bounded below* (well above the FE bound), but ρ = 1 cannot be rejected at the 5 % level. The point estimate of 0.927 — not "stationarity" — is the claim the post can defend (`estimates_summary.csv`).

7. **Instrument proliferation inflates the Hansen p-value mechanically and distorts the test in both tails.** Holding the model fixed, uncollapsed instrument counts of 68 → 95 → 113 push Hansen p from **0.0348 → 0.1859 → 0.2349**; the uncollapsed 2:3 spec is *rejected* (p = 0.0348 < 0.05) while its collapsed twin *passes* (p = 0.0957). Across all six grid cells ρ̂ stays in the narrow range **[0.921, 0.956]** — the point estimate is robust, but the *test* one would use to defend it is not (`proliferation_grid.csv`).

8. **Collapsing buys honesty at the price of precision.** At the 2:99 window, the collapsed spec uses 32 instruments (SE 0.0785) versus 113 (SE 0.0274) uncollapsed — the uncollapsed SE is ~2.9× smaller, but that precision is exactly the overfitting Roodman warns against (113 instruments vs N = 140 firms). The tutorial's headline deliberately takes the larger, more honest SE (`proliferation_grid.csv`).

9. **The toolchain replicates the pydynpd published example exactly, digit for digit.** The README's Arellano–Bond two-lag command reproduces L1.n = **0.2710675**, Hansen χ²(32) = **32.666** (p = 0.434), **42 instruments**, 611 observations — `Exact match: True` under the script's hard assertion, validating the NumPy-2 compatibility shim against the package's own benchmark (which the authors validated against Stata's `xtabond2`) (`ab_replication_results.csv`).

10. **Short-run factor demands are economically sensible in the headline model.** System GMM gives a contemporaneous wage elasticity of **−0.8155 (SE 0.2764)** and capital elasticity of **+0.5895 (SE 0.1715)**: a 10 % real-wage increase is associated with roughly an 8 % same-year employment reduction, conditional on capital and firm/year effects. The implied long-run wage elasticity (β₁+β₂)/(1−ρ) ≈ −2.5 should be quoted only with the warning that its (1−ρ) ≈ 0.073 denominator makes it extremely fragile (`sys_gmm_results.csv`).

---

## Surprises and Caveats

This section walks the seven categories of the surprises checklist in
`.claude/skills/write-results-report/references/interpretation-guide.md` in
canonical order.

- **Estimator non-determinism:** not applicable in substance — every estimator (OLS, FE, 2SLS, one-/two-step GMM) is closed-form with no simulation, bootstrap, or random subsampling, so the run is byte-exact reproducible. The only random draw in the script is the choice of 40 firms to display in Figure 1, and it is seed-pinned (`np.random.default_rng(42)`); it affects only which blue lines are drawn, never any number.

- **Sample reductions from adjustment:** substantial and worth a sentence in the post. Requiring one lag cuts the panel from **1,031 to 891 rows (−13.6 %)** for OLS/FE; the differenced GMM equations use **751 observations** (min 5, max 7 per firm); the two-lag replication spec drops to **611**. Anderson–Hsiao additionally requires the t−2 level and lagged differences (its exact n is not printed in the log). No estimator drops firms entirely — all 140 firms remain in every model — but each transformation burns the early years of every firm, which is why T-hungry specifications are expensive here.

- **Weighting / aggregation choices:** the one-step vs two-step GMM weighting choice moves ρ̂ visibly — 0.7075 → 0.6788 for difference GMM and 0.9025 → 0.9270 for system GMM (both with Windmeijer-corrected two-step SEs) — and the lag-window × collapse grid moves it within [0.921, 0.956]. None of these flips any qualitative conclusion, but the post should present the headline (two-step, collapsed, 2:99) as one defensible cell of a grid, not as "the" number.

- **Effect concentration:** not applicable in the usual bins/cells sense — ρ is a single pooled coefficient, not an average over heterogeneous bins. The mirror-image caveat is worth stating instead: the model imposes one common ρ on all 140 firms, and no firm-level heterogeneity in persistence is explored.

- **Cosmetic warnings:** the **AR(1) test rejections (p ≈ 0.000) in every GMM table are expected and mechanical** — first-differencing makes Δε_it and Δε_i,t−1 share ε_i,t−1, so AR(1) *must* reject when the model is right; a beginner who reads it as a failure has it exactly backwards (the test that must *not* reject is AR(2)). Likewise, a **high Hansen p-value is not automatically good news**: the proliferation grid shows p drifting up mechanically with instrument count, so p ≈ 1 is a red flag. The only literal warning in the run is a matplotlib "non-interactive backend" message that the script filters; `pydynpd` also lacks a `__version__` attribute, so the script's version guard falls back to its default — cosmetic, but worth knowing when re-pinning the environment.

- **Identification assumptions in force:** sequential exogeneity of the instruments (lagged levels for the differenced equation; lagged differences for the levels equation) and **no serial correlation in ε_it** — partially testable via AR(2) (p = 0.994, clean) and Hansen (p = 0.462, clean), but the tests have low power with N = 140. System GMM adds the untestable **mean-stationarity** (initial-conditions) assumption: firms' 1976 deviations from their steady-state employment paths must be uncorrelated with α_i. The framing is **descriptive/structural — ρ is a persistence parameter of a dynamic labor-demand equation, not an ATE/ATT** — and no causal claim about wages or capital is licensed beyond conditional elasticities.

- **Pedagogical framing:** the Arellano–Bond panel is the canonical *teaching* dataset of this literature — the same data Arellano & Bond (1991), Blundell & Bond (1998), Roodman (2009), and the pydynpd documentation all use to illustrate the estimators, with Blundell & Bond explicitly using it to demonstrate the weak-instrument failure of difference GMM that our Section 5 reproduces. The numbers are a faithful methods demonstration on 1970s–80s UK manufacturing, not a current estimate of employment dynamics; the post should frame them accordingly.

---

## Appendix — Reproduction Audit (pydynpd README/vignette; Wu et al. 2023)

The post folder ships the pydynpd source tree (`referenceMaterials/`), whose README publishes the package's benchmark run of the original Arellano–Bond two-lag specification on this same dataset (the output the authors validated against Stata's `xtabond2`). Section 8 of the script replicates it under a hard assertion. The pinned pre-script verification numbers in `plan.md` are audited as a second layer.

| Stage | Our value | Published value | Source location | Notes |
|---|---|---|---|---|
| Replication: L1.n coefficient | **0.2710675** (SE 0.1382542) | 0.2710675 (SE 0.1382542) | `referenceMaterials/README.md` line 54 | Exact to all 7 printed digits, SE included. |
| Replication: instrument count | **42** | 42 | `README.md` line 50 | Exact. |
| Replication: Hansen test | **χ²(32) = 32.666, p = 0.434** | chi(32) = 32.666, Prob > Chi2 = 0.434 | `README.md` line 65 | Exact. |
| Replication: AR(1) / AR(2) tests | **z = −1.29 (p = 0.198) / z = −0.31 (p = 0.760)** | z = −1.29, Pr > z = 0.198 / z = −0.31, Pr > z = 0.760 | `README.md` lines 66–67 | Exact. |
| Replication: sample | **611 obs, 140 groups** | Number of obs = 611, Number of groups = 140 | `README.md` lines 48–49 | Exact. |
| Headline numbers vs pre-pinned plan | OLS 0.9617 (0.0084); FE 0.6262 (0.0515); AH 1.2327 (0.4782); diff GMM 0.6788 (0.089, Hansen 0.211, AR(2) 0.866, 91 instr.); sys GMM 0.9270 (0.079, Hansen 0.462, AR(2) 0.994, 32 instr.) | identical table | `plan.md`, "Verified numbers" table | All match the values pinned before the script was written. |

Reproduction is faithful at every numerically verifiable point: the package's published benchmark is matched digit-for-digit (the script enforces this with an assertion that would abort the run otherwise), confirming that the NumPy-2 compatibility shim does not perturb any estimate, and every headline number matches the independently pinned verification table in `plan.md`.
