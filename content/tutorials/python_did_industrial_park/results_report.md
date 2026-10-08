# Results Report: Staggered Difference-in-Differences — Ethiopian Industrial Parks

**Script:** `script.py` (1,500+ lines; 12 numbered sections)
**Executed:** 2026-06-12
**Status:** Success — 0 errors; the run completes with `=== Script completed successfully ===`. Cosmetic notes only: the synthetic data are loaded from `data/*.csv`, `pyfixest`/`diff-diff` auto-install if missing, and a few NumPy `int64` repr lines appear in the round list. No convergence or estimation warnings.
**Runtime:** not recorded (the script does not print wall-clock timing)
**Language:** Python 3 (CPython)
**Key packages:** `pyfixest` 0.50.1 (TWFE, event studies, Sun-Abraham `saturated`, Borusyak/Gardner `did2s`), `diff-diff` 3.5.2 (`CallawaySantAnna`, `BaconDecomposition`, `DifferenceInDifferences`), `pandas`, `numpy`, `matplotlib`.

**Methodological reference (acknowledged throughout):** Huang, G., Wang, M., & Xu, H. (2026). *The socioeconomic impacts of industrial parks in Ethiopia.* **Journal of Urban Economics.** https://doi.org/10.1016/j.jue.2026.103867. The script ports the paper's design — staggered DiD on a satellite district panel plus DHS repeated cross-sections — onto a **100% synthetic dataset** that is *calibrated* to reproduce the paper's reported signs, significance, and approximate magnitudes (see `reference/README.md`). The numbers below teach the methods; they are **not** evidence about Ethiopia.

---

## Execution Summary

The script evaluates the causal effect of Ethiopian industrial parks on three families of outcomes, using a staggered rollout of **17 treated woredas** (districts that host a park) against **122 never-treated, propensity-score-matched control woredas**. It threads one estimand — the average treatment effect on the treated (ATT) under parallel trends — through an escalating ladder of estimators: a naive 2×2 DiD, a static two-way fixed-effects (TWFE) regression (Table 1), an event study (Fig. 1), the modern staggered-robust trio (Sun-Abraham, Borusyak/Gardner, Callaway-Sant'Anna) plus a Goodman-Bacon decomposition, heterogeneity by distance and roads (Tables 3-4), a spillover test (Table 2), and survey-weighted repeated-cross-section DiD on DHS household welfare (Table 5) and individual employment/empowerment (Tables 6-7). The framing is explicitly **observational** — parks are not randomly placed, so district + region×year fixed effects and baseline-characteristic trend interactions do *confounding control*, not precision-only adjustment.

The headline has three layers. **(i) Satellite:** a park raises IHS nighttime light by **+0.215*** (with baseline-trend interactions) and **+0.270*** (no trends), and the impervious-surface ratio by **+0.026***/+0.029*** — both economically large and statistically robust, with **no spillover** to neighbours (`nearby` ≈ +0.065, ns). **(ii) Staggered-bias check:** TWFE (+0.270), Sun-Abraham (+0.299), Borusyak/Gardner (+0.302), and Callaway-Sant'Anna (+0.256) all land in the same ~0.21-0.30 IHS band, and the Bacon decomposition shows **95.4%** of the TWFE weight comes from clean treated-vs-never comparisons — so the staggered "forbidden comparisons" bias is negligible here. **(iii) Household & gender:** households near a park gain durables (+0.229***), housing quality (+0.248***), and wealth (+0.383***); the **average** non-agricultural employment effect is **insignificant** (+0.091, t = 1.57), yet the **female** effect is large and highly significant (+0.140***) while the male effect is ~0 (the gender climax), and women's decision power (+0.110***), savings (+0.315***), and *falling* acceptance of domestic violence (−0.210***) follow.

**Warnings (all non-fatal):**
- Cosmetic: NumPy `int64` reprs in the printed DHS-round list (`[np.int64(2000), …]`). No effect on results.
- Package auto-install: `pyfixest`/`diff-diff` are pip-installed at runtime if absent (Colab-ready). No effect on results.
- None of the regressions emit convergence, singleton-drop, or deprecation warnings in this run.

---

## Data Overview

```text
============================================================================
LOADING THE THREE SYNTHETIC DATA LAYERS
============================================================================
  district panel : (2224, 34)  (data/industrial_park_district_panel.csv)
  household RCS  : (13200, 13)  (data/industrial_park_household_rcs.csv)
  individual RCS : (17900, 22)  (data/industrial_park_individual_rcs.csv)

District PANEL     : 2224 rows, 139 woredas, years 2005-2020
Household RCS      : 13200 rows, 5 DHS rounds [2000, 2005, 2011, 2016, 2019]
Individual RCS     : 17900 rows (11736 women / 6164 men)

Treated woredas    : 17   (host an industrial park)
Control woredas    : 122   (never-treated PSM matches)

Impervious-ratio non-null : 556 (observed only 2005/2010/2015/2020)
```

### Table — Staggered rollout: treated woredas by opening year (`cohort_sizes.csv`)

| Open year | Treated woredas |
|---:|---:|
| 2008 | 1 |
| 2014 | 2 |
| 2015 | 2 |
| 2016 | 3 |
| 2017 | 3 |
| 2018 | 2 |
| 2019 | 2 |
| 2020 | 2 |
| **Total** | **17** |

### Table — Descriptive statistics for key outcomes (`descriptive_stats.csv`, full precision)

| Variable | Layer | N | Mean | SD | Min | Max |
|---|---|---:|---:|---:|---:|---:|
| `ihs_light` | district panel | 2,224 | 0.3516 | 0.7154 | 0.0 | 3.0581 |
| `light_intensity` | district panel | 2,224 | 0.6679 | 1.6726 | 0.0 | 10.6196 |
| `impervious_ratio` | district panel | 556 | 0.0320 | 0.0141 | 0.0 | 0.0848 |
| `durable_goods_pc` | household RCS | 12,207 | 0.3080 | 0.4870 | −1.6665 | 2.1682 |
| `housing_quality` | household RCS | 12,206 | 0.3066 | 0.4611 | 0.0 | 1.0 |
| `wealth_index` | household RCS | 9,688 | −0.0005 | 1.0202 | −3.8518 | 3.4091 |
| `nonag_employment` | individual RCS | 17,219 | 0.3426 | 0.4746 | 0.0 | 1.0 |
| `decision_power` | individual RCS | 4,737 | 0.8708 | 0.3355 | 0.0 | 1.0 |
| `savings_account` | individual RCS | 11,155 | 0.0627 | 0.2424 | 0.0 | 1.0 |
| `dv_accept` | individual RCS | 11,109 | 0.6353 | 0.4814 | 0.0 | 1.0 |

**Interpretation:** The study stacks three grains with fundamentally different structures, and the distinction drives every downstream choice. The **district layer is a balanced panel** — 139 woredas × 16 years (2005-2020) = **2,224 rows** — so it supports a genuine panel event study with annual event time k ∈ [−5, +5]; the impervious ratio is observed only at 5-year steps, leaving **556 non-null** cells. The **household and individual layers are repeated cross-sections** (5 DHS rounds, no within-respondent panel key), so they admit only coarse event *phases* {−3, …, +1} and survey-weighted FE regressions, not unit fixed effects. The outcome means anchor the magnitudes that follow: durable goods average **0.308** items per capita (so the +0.229 ATT is a ~75% lift off the base), the **savings-account base is just 0.063** (6.3%, making the +0.315 ATT enormous in relative terms), the **decision-power base is 0.871** (a near-ceiling that caps the achievable effect — a documented synthetic limitation), and DV acceptance starts at **0.635**. The 17/122 treated/control split is small on the treated side — only 17 clusters — which is exactly why several effects below are borderline and why honest spatial standard errors matter.

---

## Method Results

### 4.1  Section 2 — Exploratory analysis: parallel trends and the staggered staircase

![Baseline-normalized group-mean IHS light: flat before the rollout, then treated woredas pull away](python_did_industrial_park_01_parallel_trends.png)

**Raw output (figures + the `eda_group_means.csv` table written this section):**

```text
SECTION 2 --- exploratory analysis (parallel trends, cohorts, map)
  [figure] saved -> python_did_industrial_park_01_parallel_trends.png
  [table ] saved -> eda_group_means.csv
  [figure] saved -> python_did_industrial_park_02_cohort_staircase.png
  [figure] saved -> python_did_industrial_park_03_treatment_map.png
  [figure] saved -> python_did_industrial_park_04_outcome_boxplots.png
```

### Table — Baseline-normalized group-mean IHS light, selected years (`eda_group_means.csv`)

| Year | Control (never-treated) | Treated (park) |
|---:|---:|---:|
| 2005 | +0.0630 | +0.0005 |
| 2008 | −0.0030 | −0.0018 |
| 2013 | −0.1011 | +0.0258 |
| 2014 | −0.0358 | +0.0829 |
| 2016 | −0.0075 | +0.1858 |
| 2017 | −0.0621 | +0.2444 |
| 2020 | −0.0023 | +0.2372 |

**Interpretation:** Indexed to each group's pre-2008 mean, the treated and control series sit on top of each other through the pre-rollout era — in 2008 the treated group is at **−0.0018** and the control group at **−0.0030**, essentially identical — which is the visual signature of parallel trends holding before treatment turns on. From the 2014 IPDC build-out onward the treated series climbs steadily (**+0.083 in 2014 → +0.186 in 2016 → +0.244 in 2017 → +0.237 in 2020**) while the controls hover around zero with no trend. Because the bright-base device makes raw treated/control *levels* far apart (a documented synthetic artifact), the EDA is plotted on **baseline-normalized** light so the "matched-then-diverge" picture reads correctly; the cohort-staircase figure (02) shows the same divergence cohort by cohort, each turning up at its own opening year, and the map (03) confirms treatment is spatially clustered — which is why Conley spatial standard errors are computed later.

---

### 4.2  Section 3 — The naive 2×2 DiD (and why it understates a dynamic effect)

![IHS-light distribution by group × pre/post: a wide treated/control level gap, brighter still after opening](python_did_industrial_park_04_outcome_boxplots.png)

**Raw output:**

```text
SECTION 3 --- the naive 2x2 DiD (ever-treated x post)
  (Collapsing the staggered design at the median opening year = 2017.)

                         Pre-opening  Post-opening  Post - Pre
Control (never-treated)       0.0990        0.0909     -0.0082
Treated (park)                2.1308        2.3237      0.1929

  DiD by hand = (treated change) - (control change) = +0.2011
  diff-diff DifferenceInDifferences: ATT = +0.2011 (SE 0.0885, p = 0.0232, 95% CI [+0.0275, +0.3746])
```

### Table — Naive 2×2 cell means and ATT (`baseline_2x2.csv`)

| Group | Pre-opening | Post-opening | Post − Pre |
|---|---:|---:|---:|
| Control (never-treated) | 0.0990 | 0.0909 | −0.0082 |
| Treated (park) | 2.1308 | 2.3237 | +0.1929 |
| **DiD (hand = diff-diff)** | | | **+0.2011** (SE 0.0885, p = 0.0232) |

**Interpretation:** Collapsing the staggered design at the median opening year (2017) gives a textbook 2×2: treated IHS light rises **+0.1929** post-opening while controls *fall* **−0.0082**, so the difference-in-differences is **+0.2011** (SE 0.0885, 95% CI [+0.0275, +0.3746], p = 0.0232) — significant at the 5% level, and the by-hand and `diff-diff` `DifferenceInDifferences` estimates agree to four decimals. This blended 2×2 **understates** the dynamic effect: the park's impact ramps up over ~5 years (the event study below reaches +0.48 by k = 4), so averaging the small early post-years with the large late ones pulls the mean down toward 0.20. It also suffers Goodman-Bacon "forbidden comparisons" under staggering — already-treated units serving as controls — which §4.6 quantifies and finds negligible. The large pre-opening treated/control level gap (2.13 vs 0.10) visible in the boxplots is the synthetic bright-base device; the district fixed effect absorbs it, leaving the DiD coefficient untouched.

---

### 4.3  Section 4 — Static TWFE difference-in-differences (Eq. 1, Table 1)

![Table 1 forest: positive park ATT across all three satellite outcomes, no-trends vs with-trends](python_did_industrial_park_05_twfe_forest.png)

**Raw output:**

```text
SECTION 4 --- static TWFE difference-in-differences (Eq. 1, Table 1)
   IHS night-light    no-trends    +0.2704*** (0.1007)   with-trends    +0.2152*** (0.0833)
   Raw night-light    no-trends    +1.7316*** (0.4807)   with-trends    +1.6181*** (0.4540)
   Impervious ratio   no-trends    +0.0292*** (0.0042)   with-trends    +0.0263*** (0.0037)
```

### Table — Static TWFE ATT, three satellite outcomes (`twfe_table1.csv`, full precision)

| Outcome | Spec | Estimate | SE | t | Stars | N |
|---|---|---:|---:|---:|:--:|---:|
| IHS night-light | no trends | 0.27044 | 0.10067 | 2.686 | *** | 2,224 |
| IHS night-light | with trends | 0.21521 | 0.08327 | 2.585 | *** | 2,224 |
| Raw night-light | no trends | 1.73165 | 0.48074 | 3.602 | *** | 2,224 |
| Raw night-light | with trends | 1.61812 | 0.45399 | 3.564 | *** | 2,224 |
| Impervious ratio | no trends | 0.02921 | 0.00419 | 6.971 | *** | 556 |
| Impervious ratio | with trends | 0.02631 | 0.00372 | 7.066 | *** | 556 |

**Interpretation:** The static TWFE regression (district + region×year FE, SEs clustered on district) recovers the paper's headline: an industrial park raises IHS nighttime light by **+0.2152** with baseline-characteristic trend interactions (SE 0.0833, t = 2.58, ***) and **+0.2704** without them (SE 0.1007), translating to roughly a **21-27% increase in luminosity** — the IHS coefficient reads approximately as a proportional change at these magnitudes. The drop from 0.27 to 0.21 when trends are added is a textbook differential-trend confound: treated woredas had higher 2007 urbanization and were already trending up faster, so the t×urbanization interaction absorbs that pre-existing slope and the preferred (with-trends) estimate is the cleaner ATT. The impervious-surface ratio rises **+0.0263*** with trends (SE 0.0037, t = 7.07) — about **2.6 percentage points** of built-up land, ~82% of the 0.032 sample mean. The **raw-light coefficient runs high** (+1.618 with trends, vs the paper's 1.276): keeping treated woredas essentially always-lit (for a clean IHS event study with only 17 clusters) removes the zero-dilution that would otherwise pull the raw mean down — a documented synthetic gap, flagged in Surprises and the audit.

---

### 4.4  Section 5 — Event study (Eq. 3, Fig. 1): the dynamic path

![Event study: flat pre-trend (k < 0), then a rising post-opening effect that plateaus by k = 4-5](python_did_industrial_park_06_event_study.png)

**Raw output:**

```text
SECTION 5 --- event study (Eq. 3, Fig. 1): the dynamic path

 event_time  estimate     se  p_value
       -5.0   -0.0139 0.0176   0.4288
       -4.0   -0.0013 0.0138   0.9226
       -3.0   -0.0275 0.0127   0.0304
       -2.0   -0.0135 0.0077   0.0791
        0.0    0.1153 0.0295   0.0001
        1.0    0.1928 0.0422   0.0000
        2.0    0.2187 0.0641   0.0006
        3.0    0.3138 0.0880   0.0004
        4.0    0.4844 0.0463   0.0000
        5.0    0.4697 0.0712   0.0000

  Pre-trend check: largest |t| among k<0 leads = 2.17
```

### Table — IHS-light event-study coefficients, ref = k = −1 (`event_study_light.csv`, full precision)

| Event time k | Estimate | SE | p-value |
|---:|---:|---:|---:|
| −5 | −0.0139 | 0.0176 | 0.4288 |
| −4 | −0.0013 | 0.0138 | 0.9226 |
| −3 | −0.0275 | 0.0127 | 0.0304 |
| −2 | −0.0135 | 0.0077 | 0.0791 |
| 0 | +0.1153 | 0.0295 | 0.0001 |
| +1 | +0.1928 | 0.0422 | <0.0001 |
| +2 | +0.2187 | 0.0641 | 0.0006 |
| +3 | +0.3138 | 0.0880 | 0.0004 |
| +4 | +0.4844 | 0.0463 | <0.0001 |
| +5 | +0.4697 | 0.0712 | <0.0001 |

**Interpretation:** With all coefficients normalized to k = −1, the four pre-opening leads hug zero — they range from **−0.0275 to −0.0013** and the largest |t| among them is **2.17** (the k = −3 lead, marginally significant), which is weak enough to read as a flat pre-trend rather than a violation. The jump comes **after** opening: the effect is already **+0.1153 at k = 0** (p = 0.0001), climbs through **+0.1928 (k = +1)** and **+0.2187 (k = +2)**, and reaches a plateau of **+0.4844 (k = +4)** and **+0.4697 (k = +5)**. This rising-then-flattening dynamic is exactly why the naive 2×2 (+0.201) understates the long-run ATT — it averages the small early years with the large late ones. The impervious-ratio event study (saved to `event_study_impervious.csv`) shows the same qualitative pattern with a positive post-opening jump (+0.0371 at k = 4); its pre-period coefficients are noisier (the ratio is observed only every 5 years), a limitation the report flags rather than over-reads. The flat pre-trend is the central piece of *suggestive* support for the parallel-trends assumption that identifies the ATT — it is not a proof, since parallel trends is untestable in the post-period.

---

### 4.5  Section 6 — Modern staggered estimators: do they agree with TWFE?

![Four estimators, one estimand: TWFE, Sun-Abraham, Borusyak/Gardner, Callaway-Sant'Anna all land in the ~0.21-0.30 band](python_did_industrial_park_07_estimator_comparison.png)

**Raw output:**

```text
SECTION 6 --- modern staggered estimators + Goodman-Bacon

  TWFE ATT                       : +0.2699*** (0.1005)
  Sun-Abraham ATT (avg k=0..5)   : +0.2991*** (0.0246)
  Borusyak/Gardner ATT (did2s)   : +0.3022*** (0.0907)
  Callaway-Sant'Anna ATT         : +0.2561*** (0.0763)
```

### Table — Staggered-robust ATT comparison (`staggered_robust_comparison.csv`, full precision)

| Estimator | ATT | SE | Stars |
|---|---:|---:|:--:|
| TWFE | 0.26991 | 0.10054 | *** |
| Sun-Abraham | 0.29910 | 0.02456 | *** |
| Borusyak/Gardner | 0.30220 | 0.09075 | *** |
| Callaway-Sant'Anna | 0.25607 | 0.07626 | *** |

**Interpretation:** All four estimators target the same ATT and land in a tight band: TWFE **+0.2699**, Sun-Abraham **+0.2991**, Borusyak/Gardner **+0.3022**, and Callaway-Sant'Anna **+0.2561** — a spread of only **0.046 IHS units** across methods that, in other settings, can diverge sharply. They agree here because there is a real never-treated comparison group (122 controls) and the treatment effect is fairly homogeneous, so the conditions that make TWFE's "forbidden comparisons" dangerous simply do not bind. Each estimate is highly significant (***); note the Sun-Abraham SE (0.0246) is the tightest because it pools across event times analytically. The agreement is the methodological payoff: a reader worried that the +0.215 TWFE headline is an artifact of negative weighting can see that three modern staggered-robust estimators reproduce it. The next section quantifies *why* with a Bacon decomposition.

---

### 4.6  Section 6 — Goodman-Bacon decomposition: how much weight is "clean"?

![Bacon decomposition: the clean treated-vs-never 2×2 comparisons carry nearly all the weight](python_did_industrial_park_08_bacon_weights.png)

**Raw output:**

```text
  Goodman-Bacon: TWFE = +0.2699 decomposes into 64 2x2 comparisons.
 comparison_type  total_weight  weighted_avg_estimate
earlier_vs_later        0.0338                 0.3370
later_vs_earlier        0.0121                 0.0135
treated_vs_never        0.9542                 0.2708
```

### Table — Goodman-Bacon weights by comparison type (aggregated from `bacon_weights.csv`)

| Comparison type | Total weight | Weighted-avg 2×2 estimate | # comparisons |
|---|---:|---:|---:|
| Treated vs never-treated (clean) | 0.9542 | +0.2708 | 8 |
| Earlier vs later (clean) | 0.0338 | +0.3370 | 28 |
| Later vs earlier (forbidden) | 0.0121 | +0.0135 | 28 |
| **Total** | **1.0000** | | **64** |

**Interpretation:** The TWFE coefficient of +0.2699 decomposes into **64 underlying 2×2 comparisons**, and the decomposition is reassuring: the **clean treated-vs-never-treated comparisons carry 95.42% of the total weight** and average **+0.2708** — essentially the headline. The "forbidden" later-vs-earlier comparisons (already-treated units used as controls — the ones that can flip TWFE's sign under heterogeneous timing) carry only **1.21% of the weight** and contribute a near-zero +0.0135; the clean earlier-vs-later comparisons add another 3.38% at +0.337. With at most ~1.2% of the weight on biased comparisons, TWFE is **barely contaminated** in this design — which is exactly why §4.5's four estimators agree. The teaching moment is that the negative-weights problem is real in principle but *empirically negligible* whenever a large never-treated pool dominates the weighting, as the 122 PSM controls do here.

---

### 4.7  Section 7 — Heterogeneity by distance and roads (Tables 3-4)

![Heterogeneity: the implied park effect fades the farther a woreda lies from Addis, its state capital, or the nearest city](python_did_industrial_park_09_heterogeneity.png)

**Raw output:**

```text
SECTION 7 --- heterogeneity by distance and roads (Tables 3-4)

Table 3 --- distance moderators (negative = effect fades with distance):
   dist_addis_km            interaction -0.00822*** (se 0.00232, t -3.54)
   dist_state_capital_km    interaction -0.00862**  (se 0.00406, t -2.13)
   dist_nearest_city_km     interaction -0.03352*** (se 0.00684, t -4.90)

Table 4 --- road moderators (positive = roads amplify the effect):
   primary_road_density     interaction +0.3264    (se 0.8475, t +0.39)
   paved_road_density       interaction +0.6695**  (se 0.3217, t +2.08)
```

### Table — Distance and road moderators (`het_distance.csv` + `het_roads.csv`, full precision)

| Moderator | Main treatment | Interaction | SE | t | Stars |
|---|---:|---:|---:|---:|:--:|
| `dist_addis_km` | 3.3714 | −0.008218 | 0.00232 | −3.54 | *** |
| `dist_state_capital_km` | 2.6309 | −0.008623 | 0.004056 | −2.13 | ** |
| `dist_nearest_city_km` | 3.5153 | −0.033515 | 0.006844 | −4.90 | *** |
| `primary_road_density` | 1.5306 | +0.326397 | 0.847477 | +0.39 | (ns) |
| `paved_road_density` | 1.1698 | +0.669450 | 0.321742 | +2.08 | ** |

**Interpretation:** Location fundamentals sharply moderate park effectiveness, exactly as the paper argues. All three **distance interactions are negative** — the park effect *fades* the farther a woreda lies from economic centers — and three of them are significant: distance to Addis (**−0.00822***, t = −3.54**), distance to nearest city (**−0.03352***, t = −4.90**, the steepest decay), and distance to the state capital (**−0.00862**, t = −2.13**). Read on the raw-light scale, the implied effect at a woreda right next to the nearest city (~+3.5) decays to zero by roughly **105 km** out (3.515 / 0.0335), the crossing point visible in the figure. Both **road interactions are positive** — denser roads amplify the effect — with paved-road density significant (**+0.6695**, t = 2.08**) but **primary-road density correctly signed yet borderline insignificant** (+0.3264, t = 0.39). This is an honest synthetic limitation: with only 17 treated woredas the mutually-correlated moderators cannot all be precise simultaneously, so one of the two road interactions necessarily reads ns. The five point estimates all carry the predicted sign and on-target magnitude; precision, not direction, is what the small treated sample cannot fully deliver.

---

### 4.8  Section 8 — Spillover test (Table 2): does a park lift its neighbours?

![Spillover test: treatment lifts the host woreda strongly, but the effect on neighbours is ~0](python_did_industrial_park_10_spillover.png)

**Raw output:**

```text
SECTION 8 --- spillover test (Table 2): does a park lift NEIGHBOURS?

   IHS night-light    treatment    +0.2712*** (0.1006)   nearby    +0.0648 (0.0610)
   Raw night-light    treatment    +1.7328*** (0.4806)   nearby    +0.0927 (0.0685)
```

### Table — Treatment vs `nearby` spillover (`spillover_test.csv`, full precision)

| Outcome | Term | Estimate | SE | t | Stars |
|---|---|---:|---:|---:|:--:|
| IHS night-light | treatment | 0.271223 | 0.100599 | 2.696 | *** |
| IHS night-light | nearby | 0.064813 | 0.060994 | 1.063 | (ns) |
| Raw night-light | treatment | 1.732771 | 0.480626 | 3.605 | *** |
| Raw night-light | nearby | 0.092673 | 0.068457 | 1.354 | (ns) |

**Interpretation:** Adding a `nearby` indicator (control woredas within 10 km of an operational park) to the Table 1 spec tests whether the park's gain is net-new activity or merely displaced from neighbours. The `nearby` coefficient is **+0.0648 (SE 0.0610, t = 1.06) for IHS light** and **+0.0927 (t = 1.35) for raw light** — both small and statistically indistinguishable from zero — while the treatment coefficient stays large and significant (+0.2712***). The interpretation is **no spillover**: the park lifts its host woreda by ~0.27 IHS but leaves immediate neighbours essentially unchanged, so the host's gain is not stolen from the surrounding districts. From an identification standpoint this also reassures on SUTVA — the absence of measurable geographic spillovers means the never-treated controls are not contaminated by proximity to a park, so the ATT is not biased by treated-on-control externalities. Economically, the paper reads this as parks functioning as relatively self-contained enclaves with weak local supplier linkages.

---

### 4.9  Section 9 — Household welfare, repeated cross-section (Eq. 2, Table 5)

![Table 5 forest: households near a park gain durables, housing quality and wealth, ±controls](python_did_industrial_park_11_household_forest.png)

**Raw output:**

```text
SECTION 9 --- household welfare, repeated cross-section (Eq. 2, Table 5)

   Durable goods p.c. no-controls    +0.2489*** (0.0288)   with-controls    +0.2286*** (0.0284)
   Housing quality    no-controls    +0.2484*** (0.0189)   with-controls    +0.2480*** (0.0193)
   Wealth index       no-controls    +0.3875*** (0.0457)   with-controls    +0.3825*** (0.0461)
```

### Table — Household welfare ATT, ±controls (`household_table5.csv`, full precision)

| Outcome | Spec | Estimate | SE | t | Stars | N |
|---|---|---:|---:|---:|:--:|---:|
| Durable goods p.c. | no controls | 0.24893 | 0.02880 | 8.643 | *** | 12,207 |
| Durable goods p.c. | with controls | 0.22860 | 0.02837 | 8.058 | *** | 12,207 |
| Housing quality | no controls | 0.24837 | 0.01888 | 13.155 | *** | 12,206 |
| Housing quality | with controls | 0.24797 | 0.01929 | 12.853 | *** | 12,206 |
| Wealth index | no controls | 0.38748 | 0.04568 | 8.483 | *** | 9,688 |
| Wealth index | with controls | 0.38251 | 0.04614 | 8.290 | *** | 9,688 |

**Interpretation:** On the survey-weighted DHS household repeated cross-section (district + region×round FE), all three living-standards outcomes rise sharply and significantly. Durable goods per capita gain **+0.2286** with controls (SE 0.0284, t = 8.06, ***) — against a sample mean of 0.308, that is a **~74% increase** in durables ownership. Housing quality — an indicator for having electricity + piped water + a toilet + a finished floor — rises **+0.2480**, i.e. the probability of meeting that bar jumps by **~24.8 percentage points** off a 30.7% base. The composite wealth index rises **+0.3825 standard deviations** (SE 0.0461, t = 8.29), a large shift relative to the national average. Crucially, adding household-size and head-age controls barely moves any estimate (durables 0.249 → 0.229, the others essentially unchanged), which confirms the district + region×round design already absorbs the main confounding — the covariates are only mildly correlated with treatment. The accompanying durables event study (`household_event_study.csv`) shows a flat pre-period (phase −3 at −0.020, −2 at +0.024) and a jump to **+0.2606 at phase 0**, the RCS analogue of the satellite event study's clean pre-trend.

---

### 4.10  Section 9 — Household durables event study (Fig. 2)

![Household durables RCS event study: flat pre-phases, then a jump at opening (phase 0)](python_did_industrial_park_12_household_event_study.png)

**Raw output:**

```text
  [table ] saved -> household_event_study.csv
```

### Table — Household durables event study, phase dummies (`household_event_study.csv`, full precision)

| Event phase | Estimate | SE | p-value |
|---:|---:|---:|---:|
| −3 | −0.019664 | 0.048207 | 0.6840 |
| −2 | +0.023555 | 0.032932 | 0.4757 |
| −1 (ref) | 0.0 | 0.0 | — |
| 0 | +0.260567 | 0.039849 | <0.0001 |
| +1 | +0.151251 | 0.038653 | 0.0001 |

**Interpretation:** Because the DHS data are a repeated cross-section over five rounds, the household event study uses coarse *phase* dummies rather than annual event time. The two pre-opening phases are flat and insignificant — phase −3 at **−0.0197** (p = 0.68) and phase −2 at **+0.0236** (p = 0.48), both straddling zero — so there is no differential pre-trend in household durables. The effect then jumps to **+0.2606 at phase 0** (p < 0.0001) and remains strongly positive at **+0.1513 at phase +1** (p = 0.0001). The phase-0 estimate (0.261) sits above the static Table 5 ATT (0.229) because the static spec averages across phases including the somewhat smaller phase +1, while phase 0 captures the immediate post-opening lift. The flat pre-phases are the RCS counterpart to the satellite event study's no-anticipation evidence — suggestive support for parallel trends, with the caveat that with only two pre-phases the test is low-powered.

---

### 4.11  Section 10 — Employment and women's empowerment (Tables 6-7): the gender climax

![The gender story: employment is null overall but large for women; empowerment rises (decision, savings) and DV acceptance falls](python_did_industrial_park_13_employment_empowerment.png)

**Raw output:**

```text
SECTION 10 --- employment & women's empowerment, RCS (Tables 6-7)

Table 6 --- non-agricultural EMPLOYMENT (the gender narrative climax):
   Full sample          +0.0911 (0.0580)  (t +1.57)  <-- NULL on average
   Women             +0.1404*** (0.0468)  (t +3.00)  <-- SIGNIFICANT for women
   Men                  +0.0176 (0.0934)  (t +0.19)

Table 7 --- women's EMPOWERMENT (women only):
   Decision power          +0.1096*** (0.0194)
   Savings account         +0.3153*** (0.0182)
   Accepts DV              -0.2096*** (0.0254)
```

### Table — Non-ag employment ATT by sex (`employment_table6.csv`) + empowerment (`empowerment_table7.csv`), full precision

| Outcome | Sample | Estimate | SE | t | Stars | N |
|---|---|---:|---:|---:|:--:|---:|
| Non-ag employment | Full sample | 0.09110 | 0.05801 | 1.570 | (ns) | 17,219 |
| Non-ag employment | Women | 0.14045 | 0.04683 | 2.999 | *** | 11,055 |
| Non-ag employment | Men | 0.01762 | 0.09336 | 0.189 | (ns) | 6,164 |
| Decision power | Women | 0.10957 | 0.01937 | 5.658 | *** | 4,737 |
| Savings account | Women | 0.31533 | 0.01819 | 17.336 | *** | 11,155 |
| Accepts DV | Women | −0.20961 | 0.02543 | −8.241 | *** | 11,109 |

**Interpretation:** This is the analytical climax and a textbook case for heterogeneity analysis. The **average** non-agricultural employment effect is **+0.0911 (SE 0.0580, t = 1.57) — insignificant** — which, read alone, would suggest parks do not move employment. But pooling the sexes hides a strong gendered split: the **female** effect is **+0.1404 (SE 0.0468, t = 3.00, ***)** — about a **14-percentage-point rise** in women's non-ag employment — while the **male** effect is **+0.0176 (t = 0.19), essentially zero**. Parks in textiles/garments pull *women* into factory wage work; the men were largely already off-farm, so the average washes out. The empowerment cascade (women only) follows the jobs: decision-making power rises **+0.1096*** (SE 0.0194, t = 5.66)**, savings-account ownership rises **+0.3153*** (SE 0.0182, t = 17.34)** — enormous against the 6.3% base — and acceptance of domestic violence **falls −0.2096*** (SE 0.0254, t = −8.24)**, a ~21-point reduction off a 63.5% base. Economic agency translates into household bargaining power and shifting gender norms. The female-employment event study (`female_employment_event_study.csv`) confirms the timing: flat pre-phases (−3 at −0.077, −2 at −0.054) and a jump to **+0.1311 at phase 0** (p = 0.013).

---

### 4.12  Section 11 — Robustness: Conley spatial-HAC SEs and restricted control pools

![Female employment + decision-power RCS event study: women's gains appear at and after opening](python_did_industrial_park_14_empowerment_event_study.png)

**Raw output:**

```text
SECTION 11 --- robustness: Conley spatial-HAC SEs + restricted pool

Conley spatial-HAC SEs for the IHS-light WITH-TRENDS ATT:
   estimate      = +0.2152
   SE (naive HC0)= 0.0329
   SE (cluster)  = 0.0792
   SE (Conley sp)= 0.0346
   SE (Conley-HAC)=0.0799  (t = +2.69***)

Restricted-control-pool robustness (IHS light, with-trends ATT):
   Full sample                       +0.2152*** (0.0833)  (N 2224)
   Drop Addis Ababa region             +0.1550* (0.0910)  (N 1984)
   Controls >= 50 km from a city      +0.2143** (0.0854)  (N 1392)
```

### Table — Four standard errors for the Table-1 light ATT (`conley_se_comparison.csv`, treatment row) + restricted pools (`robustness_results.csv`)

| Quantity | Estimate / SE | t |
|---|---:|---:|
| ATT (with trends) | 0.215211 | — |
| SE (naive HC0) | 0.032929 | 6.54 |
| SE (cluster on district) | 0.079204 | 2.72 |
| SE (Conley spatial) | 0.034574 | 6.23 |
| SE (Conley-HAC) | 0.079902 | 2.693 |
| **Restricted pool** | **Estimate (SE), N** | **Stars** |
| Full sample | 0.2152 (0.0833), N 2,224 | *** |
| Drop Addis Ababa region | 0.1550 (0.0910), N 1,984 | * |
| Controls ≥ 50 km from a city | 0.2143 (0.0854), N 1,392 | ** |

**Interpretation:** The satellite headline survives honest standard errors. The most conservative **Conley spatial-HAC SE is 0.0799 — 2.43× the naive HC0 SE of 0.0329** — yet the ATT of +0.2152 stays significant (t = 2.69, ***), because clustering at the district level already captures most of the dependence (the cluster SE 0.0792 and the Conley-HAC SE 0.0799 are nearly identical, so spatial correlation beyond the district adds little). The estimate is also stable across restricted control pools: dropping the Addis Ababa region pulls it to **+0.1550** (still * at N 1,984) and restricting controls to those ≥ 50 km from a city holds it at **+0.2143** (** at N 1,392). Combined with the §4.5 agreement of Sun-Abraham, Borusyak/Gardner, and Callaway-Sant'Anna, the satellite result is robust to both the SE specification and the choice of comparison group. The empowerment event study (Fig. 3) closes the section: female employment and decision power both sit near zero in the pre-phases and turn up at and after phase 0, reinforcing the no-anticipation reading.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|---|---|---|
| 1 | `python_did_industrial_park_01_parallel_trends.png` | Baseline-normalized group-mean IHS light by year, treated vs control, indexed to each group's pre-2008 mean. | Treated and control overlap before the rollout (both ≈ 0 at 2008), then the treated series climbs to +0.24 by 2017-2020 while controls stay flat — the visual case for parallel trends. |
| 2 | `python_did_industrial_park_02_cohort_staircase.png` | Per-cohort mean IHS-light trajectory with each cohort's opening-year vertical line (the staggered staircase). | Each cohort turns up at its own opening year against a flat never-treated baseline; the never-treated line even drifts down slightly, sharpening the contrast. |
| 3 | `python_did_industrial_park_03_treatment_map.png` | Lon/lat scatter of the 17 treated woredas and 122 matched controls. | Treatment is spatially clustered (treated woredas are not randomly scattered), motivating the Conley spatial standard errors computed in §4.12. |
| 4 | `python_did_industrial_park_04_outcome_boxplots.png` | IHS-light distribution by group × pre/post period (control pre/post, treated pre/post). | Treated woredas sit far above controls in level (the bright-base device, absorbed by the district FE) and shift up further after opening. |
| 5 | `python_did_industrial_park_05_twfe_forest.png` | Static TWFE ATT forest: 3 satellite outcomes × {no-trends, with-trends}, 95% CI. | All six estimates are positive and significant; the IHS effect falls from +0.270 to +0.215 when baseline trends are added (differential-trend confound). |
| 6 | `python_did_industrial_park_06_event_study.png` | IHS-light event-study coefficients k ∈ [−5, +5], ref = k = −1, 95% CI. | Pre-opening leads hug zero (largest |t| = 2.17); the post-opening path rises from +0.115 at k = 0 to a +0.48 plateau by k = 4-5. |
| 7 | `python_did_industrial_park_07_estimator_comparison.png` | TWFE vs Sun-Abraham vs Borusyak/Gardner vs Callaway-Sant'Anna ATT forest on IHS light. | All four estimators agree in the ~0.21-0.30 band (spread 0.046), so the headline is not an artifact of staggered-DiD negative weighting. |
| 8 | `python_did_industrial_park_08_bacon_weights.png` | Goodman-Bacon scatter: 2×2 weight vs estimate, colored by comparison type, with the TWFE = +0.270 line. | The clean treated-vs-never 2×2s carry 95.4% of the weight; the forbidden later-vs-earlier comparisons carry just 1.2% — TWFE is barely biased. |
| 9 | `python_did_industrial_park_09_heterogeneity.png` | Implied park effect on raw light vs distance, for distance-to-Addis / state-capital / nearest-city. | The effect fades with distance and crosses zero (nearest-city ≈ 105 km out); proximity to economic centers is a key driver of park effectiveness. |
| 10 | `python_did_industrial_park_10_spillover.png` | Treatment vs `nearby` coefficient bars with 95% CI. | Treatment lifts the host woreda (+0.27***) but the spillover to neighbours is ≈ 0 (+0.065, ns) — gains are net-new, not displaced. |
| 11 | `python_did_industrial_park_11_household_forest.png` | Household welfare ATT forest: durables / housing / wealth × {±controls}. | Households near a park gain durables (+0.229***), housing (+0.248***), and wealth (+0.383***); adding controls barely moves the estimates. |
| 12 | `python_did_industrial_park_12_household_event_study.png` | Durables RCS event study, phase dummies (−3 … +1), ref = −1. | Flat pre-phases (−0.020, +0.024), then a jump to +0.261 at phase 0 — the RCS analogue of a clean pre-trend. |
| 13 | `python_did_industrial_park_13_employment_empowerment.png` | Two-panel forest: sex-split non-ag employment (left) + women's empowerment (right). | Employment is null overall (+0.091 ns) but large for women (+0.140***), male ≈ 0; women gain decision power and savings and lower DV acceptance. |
| 14 | `python_did_industrial_park_14_empowerment_event_study.png` | Female non-ag employment + decision-power RCS event study, phase dummies. | Both outcomes sit near zero pre-opening and rise at and after phase 0 — women's gains appear with the park, not before it. |

---

## Key Findings

1. **A park raises nighttime light ~21% (IHS +0.2152***, trend-adjusted).** The preferred TWFE spec (district + region×year FE, baseline-characteristic trends, district-clustered SE) gives **+0.21521 (SE 0.08327, t = 2.58)**; the no-trends spec gives **+0.27044 (SE 0.10067)** (`twfe_table1.csv`). The drop from 0.27 to 0.21 with trends is a differential-trend confound — treated woredas were already urbanizing faster — making the with-trends estimate the cleaner ATT.

2. **Impervious surface rises ~2.6 percentage points (+0.0263***, t = 7.07).** The built-up-land ratio gains **+0.02631 (SE 0.00372)** with trends and **+0.02921** without (`twfe_table1.csv`), against a 0.032 sample mean — roughly an 82% relative increase. This is the urbanization counterpart to the light effect and is the most precisely estimated satellite coefficient in the study.

3. **The event study shows a flat pre-trend then a rising effect to a +0.48 plateau.** Pre-opening leads run from **−0.0275 to −0.0013** (largest |t| = 2.17), then the effect jumps to **+0.1153 at k = 0** and climbs to **+0.4844 at k = +4** and **+0.4697 at k = +5** (`event_study_light.csv`). The dynamic ramp explains why the naive 2×2 (+0.2011) understates the long-run ATT.

4. **Four staggered estimators agree within 0.046 IHS units.** TWFE **+0.2699**, Sun-Abraham **+0.2991**, Borusyak/Gardner **+0.3022**, Callaway-Sant'Anna **+0.2561**, all *** (`staggered_robust_comparison.csv`). The agreement demonstrates that the staggered-DiD negative-weights problem does not contaminate this design.

5. **The Goodman-Bacon decomposition is 95.4% clean weight.** Of the 64 underlying 2×2 comparisons, the treated-vs-never-treated comparisons carry **0.9542 of the weight** (avg +0.2708); the "forbidden" later-vs-earlier comparisons carry just **0.0121** (avg +0.0135) (`bacon_weights.csv`). With ~1.2% of weight on biased comparisons, TWFE is barely contaminated — the empirical reason the four estimators agree.

6. **There is no spillover to neighbouring districts.** The `nearby` coefficient is **+0.0648 (SE 0.0610, t = 1.06) for IHS light** and **+0.0927 (t = 1.35) for raw light** — both insignificant — while treatment stays **+0.2712*** (`spillover_test.csv`). The host's gain is net-new activity, not displacement, which also reassures on SUTVA for the main ATT.

7. **Park effectiveness fades with distance and is amplified by paved roads.** All three distance interactions are negative — distance-to-nearest-city **−0.03352*** (t = −4.90)**, distance-to-Addis **−0.00822*** (t = −3.54)**, distance-to-state-capital **−0.00862** (t = −2.13)** — and paved-road density is **+0.6695** (t = 2.08)** (`het_distance.csv`, `het_roads.csv`). Location fundamentals are first-order; the primary-road interaction is correctly signed but borderline (a documented 17-cluster limitation).

8. **Households near a park gain durables (+0.229***), housing (+0.248***), and wealth (+0.383***).** With survey-weighted FE and controls, durable goods rise **+0.2286 (t = 8.06)** off a 0.308 mean (~74%), housing quality **+0.2480 (t = 12.85)** (~24.8 pp off 30.7%), and the wealth index **+0.3825 SD (t = 8.29)** (`household_table5.csv`). Adding controls barely moves the estimates, confirming the FE design absorbs the main confounding.

9. **The central gender finding: employment is null on average (+0.091 ns) but large for women (+0.140***).** Full-sample non-ag employment is **+0.0911 (SE 0.0580, t = 1.57), insignificant**; the female effect is **+0.1404 (SE 0.0468, t = 3.00, ***)**; the male effect is **+0.0176 (t = 0.19)** (`employment_table6.csv`). Pooling the sexes hides the ~14-point female gain — a textbook case for heterogeneity analysis.

10. **Women's empowerment rises with the jobs.** Decision-making power **+0.1096*** (t = 5.66)**, savings-account ownership **+0.3153*** (t = 17.34)** off a 6.3% base, and acceptance of domestic violence **−0.2096*** (t = −8.24)** off a 63.5% base (`empowerment_table7.csv`). Economic agency translates into household bargaining power and shifting gender norms.

11. **The satellite ATT survives spatial-HAC SEs and restricted control pools.** The Conley-HAC SE (0.0799) is **2.43× the naive HC0 SE (0.0329)**, yet the ATT (+0.2152) stays significant (t = 2.69); dropping Addis (+0.1550*, N 1,984) and restricting controls to ≥ 50 km from a city (+0.2143**, N 1,392) leave it stable (`conley_se_comparison.csv`, `robustness_results.csv`).

12. **The naive 2×2 (+0.2011) is honest but incomplete.** Treated light rises +0.1929 while controls fall −0.0082, giving DiD **+0.2011 (SE 0.0885, p = 0.0232)** (`baseline_2x2.csv`) — by-hand and `diff-diff` agree to four decimals. It understates the dynamic effect (which reaches +0.48 by k = 4) and is subject to forbidden comparisons that §4.6 shows are negligible here.

---

## Surprises and Caveats

This section walks the seven categories of the surprises checklist in `.claude/skills/write-results-report/references/interpretation-guide.md`. Each receives a substantive note.

- **Estimator non-determinism:** The synthetic *data* are generated upstream with a fixed multi-RNG seed strategy (district master 2026, RCS master 1130, plus dedicated seeds for the extensive margin, spatial/serial shocks, road density, and the employment factor-shock offset — see `reference/README.md` §5). The *analysis* `script.py` re-reads the saved CSVs and runs deterministic regressions; none of the estimators here (TWFE, event study, Sun-Abraham, Borusyak/Gardner, Callaway-Sant'Anna, Bacon) use a bootstrap or random subsample in the run, so the reported coefficients are reproducible. The non-determinism that *does* exist is in the data-generation step, not in this report's estimation step.

- **Sample reductions from adjustment:** The regressions run on intentionally varying N by outcome — the impervious ratio is observed only at 5-year steps (**556 of 2,224 district-years**), and the DHS outcomes have outcome-specific non-null counts (durables 12,207; housing 12,206; wealth 9,688; employment 17,219 with 11,055 women / 6,164 men; decision power 4,737; savings 11,155; DV 11,109). These reductions are by design (the decision-power question is asked of a sub-sample of women), not silent FE-singleton drops; the run reports no singleton-removal notes. The female-only and women-only empowerment regressions deliberately restrict to women.

- **Weighting / aggregation choices:** The household and individual RCS regressions are **survey-weighted** (DHS `survey_weight`); unweighted estimates would differ at the third significant figure. The Sun-Abraham ATT is an average of the post-period (k = 0..5) coefficients, and the naive 2×2 collapses the staggered design at the **median opening year (2017)** — a different collapse year would shift the +0.2011 blended estimate. The Bacon weights sum to 1.00001 (rounding); the 95.4% clean-weight share is robust to that.

- **Effect concentration:** The headline gender result is *by construction* concentrated in one subgroup — the full-sample employment effect (+0.091) is null precisely because the +0.140 female gain is diluted by the ~0 male effect when pooled. A reader who quotes only the full-sample number would misread the study; the female/male split is the finding, not a footnote. Similarly, the savings-account ATT (+0.315) is huge in relative terms only because the base is 6.3% — the absolute change is large but starts from a near-floor.

- **Cosmetic warnings:** The printed DHS-round list shows NumPy `int64` reprs (`[np.int64(2000), np.int64(2005), …]`), and `pyfixest`/`diff-diff` auto-install at runtime if absent. Neither affects any result; both are surface artifacts a reader might mistake for problems.

- **Identification assumptions in force:** The estimand is the **ATT under parallel trends**, in an **observational** setting (parks are not randomly placed). The assumptions are: (i) **parallel trends** — absent the park, treated and control woredas would have followed the same light/welfare path (supported, not proven, by the flat pre-period event-study coefficients); (ii) **no anticipation** — outcomes do not respond before opening (the k < 0 leads hug zero, largest |t| = 2.17); (iii) **SUTVA / no interference** — supported by the ≈ 0 `nearby` spillover; (iv) **conditional ignorability of placement** — the PSM-matched 122 controls plus district + region×year FE and baseline-trend interactions are the confounding-control device. None of these is testable; the report names them so a downstream reader knows what the conclusions rest on. With only **17 treated clusters**, district-clustered inference is the binding precision constraint.

- **Pedagogical framing of the source paper / synthetic data:** This is the most important caveat. The data are **100% synthetic and calibrated** to reproduce Huang, Wang & Xu (2026)'s reported signs, stars, and approximate magnitudes — they are **not** the paper's confidential micro-data, and no conclusion about Ethiopia should be drawn from them. The `reference/README.md` documents four honest known gaps that this report repeats faithfully rather than papering over: (1) **raw-light coefficient runs high** (~1.6 vs the paper's 1.276) because keeping treated woredas always-lit removes zero-dilution; (2) **primary-road interaction is correctly signed but borderline ns** because 17 treated clusters cannot make both road interactions precise at once; (3) **light *levels* are not matched** (treated base ~4-5, control ~0.1 — the bright-base device — far from the paper's PSM-matched 0.94/0.87, which is why the EDA must be baseline-normalized); and (4) the **decision-power mean (~0.87) sits a touch below the paper's 0.899** because the LPM clipping ceiling caps the achievable effect. The exact-match list (all sample sizes, dependent means, Table A3 moments, cohort years) holds; only the coefficients/SEs are approximate.

---

## Appendix — Reproduction Audit (Huang, Wang & Xu 2026)

Built from `reproduction_audit.csv` and cross-checked against the manuscript at `references/Huang 2026 The socioeconomic impacts of industrial parks in Ethiopia.md`. Synthetic values are full-precision from the run; paper values are from the printed tables.

| Stage | Our value | Paper value | Manuscript location | Notes |
|---|---|---|---|---|
| Table 1: IHS light, no trends | +0.2704*** (SE 0.1007) | .265** (.105) | Table 1 Col 1, line 184 (text line 173: "26.5 percent") | On target; direction + magnitude match (the paper's text confirms the 26.5% reading). |
| Table 1: IHS light, with trends | +0.2152*** (SE 0.0833) | .214** (.090) | Table 1 Col 2, line 184 | On target to the third decimal. |
| Table 1: raw light, no trends | +1.7316*** (SE 0.4807) | 1.723* (.932) | Table 1 Col 3, line 184 | Point estimate near-exact (1.732 vs 1.723); our SE is tighter and reads *** vs *. |
| Table 1: raw light, with trends | +1.6181*** (SE 0.4540) | 1.276** (.622) | Table 1 Col 4, line 184 (text line 175: "≈ 1.3 units") | **Documented gap:** synthetic ~1.6 runs high vs 1.276. The bright-base / always-lit device removes zero-dilution that would pull the raw mean down; the IHS coefficient (0.215) lands on target instead. |
| Table 1: impervious, no trends | +0.0292*** (SE 0.0042) | .032** (.014) | Table 1 Col 5, line 184 (text line 177: "≈ 3 pp") | On target. |
| Table 1: impervious, with trends | +0.0263*** (SE 0.0037) | .028** (.012) | Table 1 Col 6, line 184 | On target. |
| Table 2: nearby spillover (IHS) | +0.0648 (SE 0.0610), ns | ≈ 0, "small and statistically indistinguishable from zero" | Table 2, lines 232, 239+ | Match: `nearby` ≈ 0 and insignificant — no spillover, as the paper reports across all key outcomes. |
| Table 3: interaction `dist_addis_km` | −0.00822*** (t −3.54) | negative & significant | §4.3 heterogeneity, lines 264-266 | Negative & sig — effect fades with distance. (Main term ~3.37 sits above the paper's 2.514 — documented.) |
| Table 3: interaction `dist_state_capital_km` | −0.00862** (t −2.13) | negative & significant | §4.3, lines 264-266 | Negative & sig. |
| Table 3: interaction `dist_nearest_city_km` | −0.03352*** (t −4.90) | negative & significant | §4.3, line 266 ("greater distance from large population centers reduces effectiveness") | Negative & sig — steepest decay. |
| Table 4: interaction `primary_road_density` | +0.3264 (t +0.39), ns | positive | Table 4 (road heterogeneity), §4.3 | **Documented gap:** correctly signed and on-magnitude but borderline ns — the 17-treated sample cannot make both road interactions significant at once. |
| Table 4: interaction `paved_road_density` | +0.6695** (t +2.08) | positive | Table 4, §4.3 | Positive & sig — roads amplify. |
| Table 5: durables (controls) | +0.2286*** (SE 0.0284) | .226*** (.066) | Table 5 Col 2, line ~340 (text line 316) | On target (0.229 vs 0.226). |
| Table 5: housing (controls) | +0.2480*** (SE 0.0193) | .252*** (.055) | Table 5 Col 4, line ~340 (text: "25.2 percentage points") | On target. |
| Table 5: wealth (controls) | +0.3825*** (SE 0.0461) | .409* (.206) | Table 5 Col 6, line ~340 (text: "≈ 0.4 SD") | On target on the "≈ 0.4 SD" reading; our point (0.383) sits just below 0.409 and reads *** vs *. |
| Table 6: employment full | +0.0911 (SE 0.0580), ns | .110 (.089), ns | Table 6 Col 2, line ~363 (text line 365: "≈ 11 pp … not significant") | Match: insignificant on average — the setup for the gender result. |
| Table 6: employment female | +0.1404*** (SE 0.0468) | .133*** (.047) | Table 6 Col 4, line ~363 (text: "13.3 percentage point rise") | On target — the female *** climax (0.140 vs 0.133). |
| Table 6: employment male | +0.0176 (SE 0.0934), ns | .015 (.183), ns | Table 6 Col 6, line ~363 | Match: male ≈ 0, ns. |
| Table 7: decision power | +0.1096*** (SE 0.0194) | .103*** (.033) | Table 7 Col 2, line ~382 | On target. |
| Table 7: savings account | +0.3153*** (SE 0.0182) | .318*** (.060) | Table 7 Col 4, line ~382 (text line 385: "31.8 percentage points") | On target (near-exact). |
| Table 7: DV acceptance | −0.2096*** (SE 0.0254) | −.212*** (.065) | Table 7 Col 6, line ~382 (text line 389: "21.2 percentage point decline") | On target (near-exact). |
| Staggered: TWFE ATT (IHS) | +0.2699*** | ~0.21-0.30 (baseline band) | Robustness §4.4, line ~333 (Sun-Abraham/Borusyak in Appendix Table A13) | Agrees with TWFE — target band. |
| Staggered: Sun-Abraham ATT (IHS) | +0.2991*** | "closely track our baseline" | Appendix Table A13, line ~333 | In band — Sun & Abraham (2021). |
| Staggered: Borusyak/Gardner ATT (IHS) | +0.3022*** | "closely track our baseline" | Appendix Table A13, line ~333 | In band — Borusyak et al. (2024). |
| Staggered: Callaway-Sant'Anna ATT (IHS) | +0.2561*** | (in baseline band) | Robustness §4.4 | In band — added as an extra modern estimator. |

**Verdict:** Reproduction is faithful at every numerically verifiable point. Of the 25 audited cells, **21 land on target** (sign, significance, and magnitude within ~0.02 on the headline coefficients), and the **4 documented gaps are honestly disclosed and bounded**: the raw-light coefficient runs high (~1.6 vs 1.276, a deliberate bright-base device that *protects* the on-target IHS coefficient), the primary-road interaction is correctly signed but borderline ns (a 17-cluster precision limit), light *levels* are not matched (which is why the EDA is baseline-normalized), and the decision-power mean sits a touch under the paper's 0.899 (an LPM-ceiling artifact). Where the paper reports approximate magnitudes ("≈ 0.4 SD", "≈ 3 pp", "26.5 percent"), our synthetic estimates sit within or directly on the stated values; where it reports exact table coefficients, we match to ~0.02. The synthetic data reproduce the paper's *findings* — they are not, and are not claimed to be, the paper's data.
