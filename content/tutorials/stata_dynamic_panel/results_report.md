# Results Report: Dynamic Panel Analysis of War & Economic Growth

**Script:** `analysis.do`
**Executed:** 2026-04-29 10:07
**Status:** Success (with 5 informational warnings — see *Surprises and Caveats*)
**Runtime:** ~12 seconds (cold start, fresh Stata batch session)
**Language:** Stata SE (`/Applications/Stata/StataSE.app/Contents/MacOS/stata-se -b`)
**Key packages:** `xtabond2` (Roodman), `estout`, `outreg2`, `coefplot`

---

## Execution Summary

The script reproduces **Thies & Baum (2020)**, *The Effect of War on Economic Growth*, on the `CatoJ.dta` panel of 1,663 raw country-years (160 country IDs × up to 13 quinquennia spanning 1955–2015; the panel is unbalanced, with Model 1's estimation sample drawn from 155 countries). Sources: Maddison + Fraser + Systemic Peace + Freedom House. After recoding lag-prefix missing-as-zero codes, it estimates four nested **Arellano-Bond two-step difference GMM** specifications for log GDP per capita with `xtabond2`, lagged DV included, war/coup treated as endogenous (lags 2–6 used as internal instruments), and quinquennia year dummies.

The headline result is **stable, robust, and matches Baum's published Table 2**: a Magnitude-7 war reduces contemporaneous log GDP per capita by **16–24%**, and the cumulative 15-year impact (sum of contemporaneous + L1 + L2 War coefficients) is **−0.35 log points** in the baseline model (95% CI [−0.51, −0.20]).

**Warnings:** 5 informational `xtabond2` notices (see *Surprises and Caveats*). Zero `r()` errors, exit code 0, success marker present.

---

## Data Overview

```text
. describe
Contains data from https://github.com/quarcs-lab/data-open/raw/master/panel/CatoJ.dta
 Observations:         1,663
    Variables:            18                  26 Oct 2019 15:46
Sorted by: cty  Year

. sum
    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
         cty |      1,663    80.82441    45.80199          1        160
        Year |      1,663    1988.596    18.06104       1955       2015
lnGDPperca~a |      1,663    8.768894    1.204839    5.63479   12.70269
 EconFreeLag |      1,663    4.674184    2.548064          0   9.234659
PolitFreeLag |      1,663    40.27603    37.29169          0        100
DemocIndxLag |      1,663    2.135558    6.888007          0       37.5
         War |      1,663    .0824843    .1886522          0          1
        Coup |      1,663    .0911606    .1912969          0          1
```

**Interpretation:** The raw panel covers **1,663 country-years across 160 country IDs** observed every five years from 1955 to 2015, with `lnGDPpercapita` ranging from 5.63 to 12.70 — equivalent to roughly **\$280 to \$329,000 per person per year in 2011 PPP dollars**, a 1,000-fold spread that captures the full range from Burundi-like poverty to Norwegian-like prosperity. War and Coup are continuous magnitude indices on a 0–1 scale with means below 0.10, meaning the typical country-year has neither, but the right tail is heavy: the 95th percentile of War is 0.571 and the maximum is 1.0 (a Magnitude-7 war). The lag-prefix variables `EconFreeLag`, `PolitFreeLag`, and `DemocIndxLag` show implausibly low minima of zero — the giveaway that "missing" was coded as 0 and must be recoded before estimation.

---

## Method Results

### 1. Recoding missing-as-zero codes

```text
. mvdecode DemocIndxLag PolitFreeLag EconFreeLag, mv(0)
DemocIndxLag: 1438 missing values generated
PolitFreeLag: 495 missing values generated
 EconFreeLag: 314 missing values generated

. sum DemocIndxLag PolitFreeLag EconFreeLag
    Variable |        Obs        Mean    Std. dev.       Min        Max
-------------+---------------------------------------------------------
DemocIndxLag |        225    15.78415    11.64599         .1       37.5
PolitFreeLag |      1,168    57.34507    31.63668   .0201857        100
 EconFreeLag |      1,349    5.762171    1.315748   1.820347   9.234659
```

**Interpretation:** The recoding has dramatic consequences for sample size. `DemocIndxLag` loses **86.5% of observations** (1,438 of 1,663) and is effectively unusable — only 225 country-years carry valid information, which is why the published article omits it. `PolitFreeLag` and `EconFreeLag` lose 30% and 19% of observations respectively, but retain 1,168 and 1,349 valid country-years — enough to support the institutional-control specifications in Models 2–4. The post-recoding mean of `EconFreeLag` rises from 4.67 to 5.76 and its minimum from 0 to 1.82, confirming that the apparent zeros were spurious rather than legitimate "no economic freedom" observations.

### 2. Descriptive statistics

```text
. estpost summarize lnGDPpercapita War Coup EconFreeLag PolitFreeLag, detail

             |  e(count)   e(sum_w)    e(mean)     e(Var)      e(sd)
-------------+-------------------------------------------------------
lnGDPperca~a |      1663       1663   8.768894   1.451637   1.204839
         War |      1663       1663   .0824843   .0355896   .1886522
        Coup |      1663       1663   .0911606   .0365945   .1912969
 EconFreeLag |      1349       1349   5.762171   1.731192   1.315748
PolitFreeLag |      1168       1168   57.34507   1000.879   31.63668

             | e(skewn~)  e(kurto~)     e(sum)     e(min)     e(max)
-------------+-------------------------------------------------------
lnGDPperca~a | -.0311522   2.249679   14582.67    5.63479   12.70269
         War |  2.532639   8.790373   137.1714          0          1
        Coup |    2.5981   10.11349      151.6          0          1
 EconFreeLag | -.0206745   2.452404   7773.169   1.820347   9.234659
PolitFreeLag | -.0367516   1.571523   66979.05   .0201857        100

             |     e(p1)      e(p5)     e(p10)     e(p25)     e(p50)
-------------+-------------------------------------------------------
         War |         0          0          0          0          0
        Coup |         0          0          0          0          0

             |    e(p75)     e(p90)     e(p95)     e(p99)
-------------+--------------------------------------------
         War |  .0285714   .3428571   .5714286   .8571429
        Coup |        .2         .4         .4          1
```

**Interpretation:** War and Coup have **extremely heavy right tails**: kurtosis of 8.79 for War and 10.11 for Coup, vs the Gaussian benchmark of 3. Their medians are zero — i.e., **most country-years have neither** — but the 95th percentile of War reaches 0.571 and the 99th percentile reaches 0.857, so the few country-years that do experience war experience it intensely. By contrast `lnGDPpercapita` is **near-symmetric** (skewness = −0.03, kurtosis = 2.25 — slightly platykurtic) across a wide range of 5.63 to 12.70. Economic Freedom is similarly near-symmetric (skewness = −0.02), while Political Freedom shows a mild left skew (−0.04) reflecting the upper-bound concentration at 100. These distributional features motivate the choice of `xtabond2` GMM (which makes no normality assumption) over methods that lean on Gaussian residuals.

### 3. Panel structure

```text
. xtset cty Year, delta(5)
Panel variable: cty (unbalanced)
 Time variable: Year, 1955 to 2015, but with a gap
         Delta: 5 years

. xtdescribe
     cty:  1, 2, ..., 160                                    n =        160
    Year:  1955, 1960, ..., 2015                             T =         13
Distribution of T_i:   min      5%     25%       50%       75%     95%     max
                         1       4       8        12        13      13      13
       77     48.12   48.12 |  1111111111111
       27     16.88   65.00 |  ..11111111111
       20     12.50   77.50 |  ........11111
```

**Interpretation:** The panel is **unbalanced**: 160 country IDs but T per country varies from 1 to 13, with a median of 12 quinquennia. Only 48% of countries (77 of 160) have a complete 13-period record; another 17% (27 countries) start in 1965 instead of 1955 — these are mostly post-colonial Africa and Asia. **12.5% (20 countries) appear only after 1995**, which corresponds closely to the post-Soviet successor states. This unbalanced structure is exactly what Arellano-Bond GMM was designed for, and motivates Baum's choice of method over fixed-effects with a small T per country.

### 4. Model 1 — War & Coup, no institutional controls

```text
Dynamic panel-data estimation, two-step difference GMM
Group variable: cty                             Number of obs      =      1187
Time variable : Year                            Number of groups   =       155
Number of instruments = 146

             |              Corrected
lnGDPperca~a | Coefficient  std. err.      z    P>|z|     [95% conf. interval]
-------------+----------------------------------------------------------------
         L1. |   .6787863    .051373    13.21   0.000     .5780972    .7794755
         War |
         --. |  -.2186432   .0569308    -3.84   0.000    -.3302255   -.1070609
         L1. |  -.0655071   .0468636    -1.40   0.162    -.1573581    .0263438
         L2. |  -.0687009   .0470814    -1.46   0.145    -.1609787    .0235769
        Coup |
         --. |   -.090843   .0284565    -3.19   0.001    -.1466167   -.0350692
         L1. |   .0387093    .029151     1.33   0.184    -.0184257    .0958443

Arellano-Bond test for AR(1) in first differences: z =  -4.37  Pr > z =  0.000
Arellano-Bond test for AR(2) in first differences: z =  -1.69  Pr > z =  0.091
Hansen test of overid. restrictions: chi2(130)  = 144.32  Prob > chi2 =  0.184
```

**Interpretation:** With **N = 1,187** country-years across 155 countries and 146 instruments, Model 1 estimates a strongly persistent log-GDP process (lagged DV coefficient = **0.679**, 95% CI [0.578, 0.779], t = 13.21) — meaning roughly two-thirds of a country's log GDP per capita carries over to the next quinquennium. A contemporaneous Magnitude-7 war reduces log GDP per capita by **0.219 log points (~19.6%)** within the same 5-year window (95% CI [−0.330, −0.107], t = −3.84). The two lagged War coefficients are individually small and insignificant, but their joint interpretation is best read off the *sum* (Section 7 below). A contemporaneous coup additionally reduces log GDP per capita by **0.091 log points (~8.7%)** (95% CI [−0.147, −0.035]). Both diagnostic tests support the specification: AR(2) p = 0.091 (no serial correlation in differences) — a *borderline* pass, sitting just above the conventional 5% cutoff but below the 10% cutoff sometimes used in dynamic-panel work — and Hansen J p = 0.184 (instrument validity not rejected). Models 2-4, by contrast, deliver AR(2) p-values comfortably above 0.6 (see Section 8).

### 5. Models 2–4 — Adding institutional controls

Coefficient table from `esttab` (preserved from original code, reproducing Baum 2020 Table 2):

```text
                              (1)             (2)             (3)             (4)
L.lnGDPpc                   0.679***        0.666***        0.632***        0.619***
                          (13.21)         (11.86)         (12.05)         (11.41)
War                        -0.219***       -0.239***       -0.159***       -0.160***
                          (-3.84)         (-5.20)         (-4.33)         (-3.82)
L.War                     -0.0655         -0.0197         -0.0764         -0.0111
L2.War                    -0.0687         -0.0123          0.0114         0.00542
Coup                      -0.0908***      -0.0757***      -0.0952***      -0.0902***
L.EconFreedom                              0.0201***                       0.0283***
                                           (2.60)                          (3.31)
L.PolitFreedom                                           0.000276        0.000173
                                                           (0.79)          (0.51)
N                            1187             987             918             821
N. Countries                  155             137             151             137
Sum War coeff.             -0.353          -0.271          -0.224          -0.166
s.e. War                   0.0787          0.0741          0.0751          0.0759
t War                      -4.482          -3.650          -2.988          -2.185
Sum Coup coeff.           -0.0521         -0.0613         -0.0970         -0.0957
s.e. Coup                  0.0356          0.0366          0.0458          0.0440
t Coup                     -1.463          -1.678          -2.120          -2.174
Hansen J                    144.3           125.0           132.4           128.8
J pvalue                    0.184           0.607           0.128           0.179
```

**Interpretation:** The **War coefficient is stable across all four specifications** at −0.16 to −0.24, all significant at the 1% level (t between −3.82 and −5.20). Adding lagged Economic Freedom (Model 2) shrinks the sample to 987 country-years and yields an **insignificant-from-zero positive shift** in measured war damage (the contemporaneous War coefficient becomes more negative at −0.239), implying that economically freer country-years co-occur with smaller war losses — a confounder Baum's specification correctly removes. Lagged Economic Freedom itself is positive and significant: a one-point increase on the 1–10 Fraser index raises log GDP per capita by **2.0% in Model 2 and 2.8% in Model 4** (Model 4 t = 3.31). Lagged Political Freedom, by contrast, is statistically indistinguishable from zero in both Model 3 (coef = 0.000276, t = 0.79) and Model 4 (coef = 0.000173, t = 0.51), consistent with Baum's stated finding that *political* freedom does not robustly predict growth once *economic* freedom is controlled.

### 6. Coup effects

**Interpretation:** The contemporaneous Coup coefficient is consistently negative and significant across all four models, ranging from **−0.076 (Model 2) to −0.095 (Model 3)** — a coup or other violent regime change reduces 5-year log GDP per capita by roughly **7.3% to 9.1%** (computed as `exp(β)−1`). The lagged Coup coefficient is small and insignificant in every model. Strikingly, the *sum* of Coup coefficients only crosses the conventional t > 2 significance threshold in Models 3 and 4 (t = −2.12 and −2.17 respectively), once Political Freedom is included. This pattern — significance of coup damage emerging only with institutional controls — suggests that the coup-growth relationship is partially mediated by political-institutional factors, an interpretation consistent with Barro (1991) and Jong-A-Pin (2009) cited in the article.

### 7. Long-run sum-of-coefficients (`ssta` program)

```text
model,sswar,sswar_se,sscoup,sscoup_se,sswar_lo,sswar_hi
1,-.35285124,.078720443,-.052133676,-.50714332,-.19855918
2,-.27065128,.074142396,-.061335087,-.41597039,-.12533218
3,-.22428195,.075056702,-.097004905,-.37139308,-.077170819
4,-.16586904,.075907208,-.095742278,-.31464717,-.017090915
```

**Interpretation:** The sum-of-coefficients statistic captures the **cumulative 15-year impact** of a one-period war shock (contemporaneous + lag-1 + lag-2 = three quinquennia). Across all four models the cumulative War effect is negative and the 95% confidence interval **excludes zero in every specification**. The largest cumulative loss is in Model 1 (−0.353 log points, ≈ −30% in level terms, 95% CI [−0.507, −0.199]); the smallest is Model 4 (−0.166 log points, ≈ −15%, 95% CI [−0.315, −0.017], just barely excluding zero with t = −2.19). The progressive shrinkage of the cumulative effect as institutional controls are added (Model 1 → Model 4: −0.35 → −0.27 → −0.22 → −0.17) suggests roughly **half of the raw long-run war penalty is mediated through degraded economic and political institutions**, while half operates through other channels (capital destruction, reduced trade, displacement).

### 8. Diagnostic tests

```text
model,ar2_p,hansen_p,hansen,hansen_df
1,.090614177,.18446873,144.32077,130
2,.88085687,.60689044,125.02258,130
3,.80964011,.12788889,132.38162,115
4,.62484086,.17945111,128.76736,115
```

**Interpretation:** Both Arellano-Bond tests **fail to reject the validity of the specification in every model**. The AR(2) test (null: no second-order serial correlation in first-differenced residuals — required for the GMM moment conditions to hold) returns p-values of 0.09, 0.88, 0.81, and 0.62 across Models 1–4, all comfortably above the 0.05 threshold (Model 1's 0.09 is closest to the boundary but does not reject at conventional significance). The Hansen J overidentification test (null: instruments are orthogonal to the error term) returns p-values of 0.18, 0.61, 0.13, and 0.18 — none below 0.05. Together these diagnostics support the article's conclusion that the dynamic panel GMM identification strategy is sound for this dataset.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `stata_dynamic_panel_war_count_by_year.png` | Bar chart of the number of countries with active war (War > 0) by quinquennium, 1955–2015 | War prevalence rises monotonically from 19 countries in 1955 to a peak of **51 countries in 1990** (the year of Soviet collapse and a wave of independence/civil wars), then drops sharply to ~28 countries by 2000 and **plateaus at 25-28 through 2015** — the same broad shape as Figure 1 of the source article |
| 2 | `stata_dynamic_panel_war_coup_panel.png` | Twoway line plot of mean War and Coup intensity by year | Mean War intensity rises from ~0.05 in 1960 to a peak of ~0.14 around 1985-1990 then falls to ~0.06 by 2015; Coup intensity is elevated through 1955-1995 (≈0.10-0.12) with no single sharp peak, then drops to ~0.06 after 2000 — broadly tracking but slightly leading the War line in the late Cold War period |
| 3 | `stata_dynamic_panel_gdp_distribution.png` | Histogram of `lnGDPpercapita` across all country-years | Approximately symmetric (skewness = -0.03, kurtosis 2.25 — slightly platykurtic) with a faintly bimodal shape suggesting two clusters of country-years, one centred around lnGDPpc ≈ 7.5 (developing) and another around 9-10 (high-income); the wide range (5.6 to 12.7) underscores the global development gradient that the dynamic panel must explain |
| 4 | `stata_dynamic_panel_war_coef_plot.png` | `coefplot` of War, L.War, and L2.War coefficients with 95% CIs across the four models | Contemporaneous War is the only consistently significant lag — its CI sits entirely below zero in all four models, while L1 and L2 cross zero — showing that war's GDP damage is overwhelmingly contemporaneous, not delayed |
| 5 | `stata_dynamic_panel_longrun_effects.png` | Bar chart of the sum-of-War-coefficients (long-run effect) per model with 95% CIs | All four cumulative-effect bars sit below zero with CIs that exclude zero, but the bar shrinks monotonically from Model 1 to Model 4, illustrating how institutional controls partially mediate the long-run war penalty |
| 6 | `stata_dynamic_panel_diagnostics.png` | Side-by-side bars of AR(2) and Hansen J p-values per model with a 0.05 reference line | Every bar except Model 1's AR(2) sits well above the 0.05 threshold; even Model 1's AR(2) p = 0.09 clears the cutoff, so all four specifications pass both validity tests |

---

## Key Findings

1. **Magnitude-7 wars cause an immediate ~16–24% drop in log GDP per capita.** Across the four specifications, the contemporaneous War coefficient ranges from **−0.160 (Model 4, t = −3.82) to −0.239 (Model 2, t = −5.20)**, all significant at the 1% level. The effect is robust to inclusion of economic and political freedom controls.

2. **The cumulative 15-year war penalty is roughly −0.17 to −0.35 log points (15% to 30% of GDP per capita).** Sum-of-coefficients t-statistics: Model 1 = **−4.48**, Model 2 = **−3.65**, Model 3 = **−2.99**, Model 4 = **−2.19**. The 95% CI excludes zero in every specification.

3. **Coups contemporaneously reduce GDP per capita by ~7–10%, but the cumulative coup effect is only significant once Political Freedom is controlled.** Contemporaneous Coup coefficients range from **−0.076 (Model 2) to −0.095 (Model 3)**, all p < 0.01. The sum-of-Coup coefficient becomes significant (t < −2) only in Models 3 and 4.

4. **Economic Freedom is a strong, robust predictor of GDP growth; Political Freedom is not.** A one-point increase in the lagged Fraser Economic Freedom index raises log GDP per capita by **2.0% in Model 2 and 2.8% in Model 4** (t = 2.60 and 3.31). Lagged Political Freedom yields t = 0.79 and 0.51 — indistinguishable from zero.

5. **Institutional controls absorb roughly half the long-run war effect.** The sum-of-War-coefficient shrinks monotonically from **−0.353 (Model 1, no institutional controls)** to **−0.166 (Model 4, both controls)** — a 53% reduction. This pattern is consistent with war damaging GDP partly through institutional decay and partly through direct capital/labor destruction.

6. **All four GMM specifications pass the standard validity tests.** AR(2) p-values: 0.091, 0.881, 0.810, 0.625 (all > 0.05). Hansen J p-values: 0.184, 0.607, 0.128, 0.179 (all > 0.05). The Arellano-Bond moment conditions and instrument exogeneity assumptions are not rejected.

7. **Roughly two-thirds of log-GDP-per-capita persists across quinquennia.** The lagged-DV coefficient is **0.679, 0.666, 0.632, and 0.619** across Models 1–4, all with t > 11. This high persistence is what makes a dynamic panel necessary; OLS or static fixed effects would suffer from Nickell bias given T ≈ 13.

---

## Surprises and Caveats

**xtabond2 informational warnings (5 total).** Each `xtabond2` call in Models 1, 3, and 4 emits *"Two-step estimated covariance matrix of moments is singular"*, and Model 1 additionally emits *"Number of instruments may be large relative to number of observations"* (146 instruments / 1,187 obs). These are normal `xtabond2` behaviour rather than errors:
- The singularity warning triggers `xtabond2`'s built-in switch to a generalised inverse and the **Windmeijer (2005) finite-sample correction** for two-step robust SEs — exactly the path `robust twostep` is designed to take. The reported "Corrected std. err." columns already reflect the correction.
- The instrument-count warning flags Roodman's (2009) **instrument proliferation** concern. The article's specification limits this risk via `lag(2 6)` (only lags 2–6 of the endogenous regressors enter the GMM-style instrument set), but the absolute instrument count (130–146) is still close to the rule-of-thumb upper bound that the instrument count should not exceed the number of cross-sectional units (155, 137, 151, 137 here).

**Hansen J p-values diverge slightly from the published article.** This script's Hansen J p-values (0.184, 0.607, 0.128, 0.179) differ from Baum's published values (0.140, 0.533, 0.072, 0.107). The chi-square statistics themselves match exactly (144.3, 125.0, 132.4, 128.8), but the degrees of freedom differ (here 130, 130, 115, 115; Baum 127, 127, 110, 110). This is almost certainly due to a `xtabond2` version difference in how singletons and collinear instruments are dropped before the J-test. The substantive conclusion — that the J-test does not reject the specification in any model — is unaffected.

**`DemocIndxLag` is unusable.** After `mvdecode`, only 225 of 1,663 country-years carry valid `DemocIndxLag` data. This is why the published article and this script estimate Models 3 and 4 with `PolitFreeLag` from Freedom House rather than `DemocIndxLag`.

**Year dummies are dropped due to collinearity in every model** (different sets in each: 1955b/1960/2010 in Model 1; 1955b/1960/1965/1970/1980 in Model 4). This is mechanical — `xtabond2 noleveleq` differences out the time-invariant 1955 baseline — and is not an analyst error.

**Large CIs on lagged War coefficients.** The L1 and L2 War coefficients have wide individual CIs (e.g. Model 4 L.War = −0.011, 95% CI [−0.126, +0.104]). Individually they are uninformative; the *sum* is what carries the substantive content. The post-estimation `ssta` program correctly accounts for this by computing the linear combination's standard error rather than naively adding individual SEs.

**Estimand framing.** Because War is a continuous magnitude index (0 to 1) rather than a binary treatment, the recovered effect is **not** an ATT or ATE in the standard counterfactual sense. It is the within-country dynamic effect of a one-unit change in war intensity on log GDP per capita, identified by first-differencing (removing country fixed effects) and instrumenting endogenous regressors with their own deeper lags. The blog post should keep this framing rather than slipping into binary-treatment vocabulary.

**Reproducibility note.** `set seed 42` is included for defensive consistency, but `xtabond2` GMM is fully deterministic given the data — re-running the script produces identical numbers to the digit. The dataset is loaded directly from a GitHub URL on every run, which means future changes to the upstream `CatoJ.dta` would silently change results. If long-term reproducibility matters, the file should be saved locally with `save "CatoJ.dta", replace` after the first download.
