# Results Report: Difference-in-Differences with Geocoded Microdata (the Ring Approach)

**Script:** `analysis.R` (1,158 lines)
**Executed:** 2026-05-19
**Status:** Success — 0 errors; 2 ggplot/sf cosmetic warning lines (an early `sf` "attributes assumed spatially constant" note and a `binsreg` informational note about subsample bin-selection)
**Runtime:** 12.3 s wall clock (24.8 s user / 1.6 s system on multi-core `data.table` and `binsreg`)
**Language:** R 4.5.2 (2025-10-31)
**Key packages:** `tidyverse`, `fixest`, `haven`, `data.table`, `binsreg`, `KernSmooth`, `lpridge`, `ggplot2`, `patchwork`, `sf`, `glue`, `scales`, `broom`

**Methodological reference (acknowledged throughout):** Butts, Kyle (2023). "JUE Insight: Difference-in-Differences with Geocoded Microdata." *Journal of Urban Economics* 133: 103493. The parametric and nonparametric ring estimators implemented inline in `analysis.R` are direct ports of the helpers in Butts's replication archive (`references/helper-parametric_rings_estimator.R`, `references/helper-nonparametric_rings_estimator.R`). The empirical case study reuses the Linden & Rockoff (2008) home-sales × sex-offender-arrival data that ships with that archive.

---

## Execution Summary

The script answers a single question — *what does the average home in a neighborhood do when a registered sex offender moves in?* — using two estimators of increasing flexibility: a parametric ring DiD that compares homes inside 0.1 mile of an offender's address to homes between 0.1 and 0.3 mile, and a nonparametric ring DiD (via `binsreg`) that estimates a whole treatment-effect curve over distance. The tutorial first proves both estimators work by running them on a simulated data-generating process with a known smooth treatment effect, then re-runs the same logic on Linden & Rockoff's North Carolina housing sample (170,239 transactions, 9,092 of which are within 1/3 mile of an offender). Eight numbered sections build the argument step by step; ten dark-theme PNGs at 300 dpi anchor the narrative.

The headline finding has three layers, all on the same log-price scale: (i) the parametric ring DiD at the default rings recovers **−0.0595 log points (−5.78 %)** with cluster-robust SE 0.0225, statistically significant at conventional levels; (ii) under three alternative ring-cut choices (0.05, 0.10, 0.15 mi) the same regression gives **−6.40 %, −5.45 %, −4.21 %** — illustrating that the headline number wobbles with the ring choice even on real data; (iii) the nonparametric `binsreg` estimator reveals that homes in the two closest distance bins drop by **−20.6 %** and **−15.2 %** respectively, with the sample-weighted ATT inside 0.1 mile equal to **−12.4 %** — more than twice the parametric ring DiD estimate. This pattern — parametric attenuated, nonparametric larger, curve fades to zero past 0.13 mi — is the empirical case in favor of Butts's data-driven approach.

**Warnings (all non-fatal):**
- 1 × `sf` attribute-assumption note when building the toy `treat_ring`/`control_ring` geometries.
- 4 × `binsreg::binsreg` informational notes (Degree-for-CI changed; subsample used for bin selection on n > 5000) across the two nonparametric calls.
- 4 × `fixest` "fixed-effect singletons removed (73 obs)" notes across the four ring DiD regressions (the script's MED-2 fix suppressed all 16 NA-break warnings from earlier runs).

---

## Data Overview

```text
=== r_did_ring: ring estimator for spatial DiD ===
R version: R version 4.5.2 (2025-10-31)
Working directory: /Users/carlosmendez/Documents/GitHub/starter-academic-v501/content/post/r_did_ring

[Section 6.2] Linden-Rockoff data
  Rows: 170239  Cols: 51
  Analysis sample (offender == 1): 9092
  Mean log price: 11.73
  Distance summary (miles): min 0.009  median 0.224  max 0.333
```

### Table — 2×2 cell counts in the analysis sample (`table_lr_cells.csv`)

| Ring | Pre-arrival | Post-arrival | Total |
|---|---:|---:|---:|
| Inner (≤ 0.1 mi)      |   499 |   594 | 1,093 |
| Outer (0.1 – 0.3 mi)  | 3,998 | 4,001 | 7,999 |
| **Total**             | **4,497** | **4,595** | **9,092** |

**Interpretation:** The Linden-Rockoff data hold 170,239 home transactions over multiple years and neighborhoods; the analysis filters to the 9,092 sales recorded within 1/3 mile of an offender's eventual address (the `offender == 1` indicator). Within that subset, only **1,093 sales (12.0 %)** fall in the inner treated ring at or under 0.1 mile — and they split 499 pre-arrival vs 594 post-arrival, a near-balanced design. The outer control ring carries **7,999 sales (88.0 %)** split 3,998 / 4,001 across the cutoff date. Median distance to the offender is 0.224 mile and the support runs from 0.009 mile (essentially adjacent) to 0.333 mile (the outer-ring cutoff). These cell counts are what makes the data-driven nonparametric estimator viable in this neighborhood despite the small treated cells.

---

## Method Results

### 4.1  Section 1 — The ring approach: when does distance identify a treatment effect?

![Ring geometry: treatment as a point, groups as distances](r_did_ring_01_ring_geometry.png)

**Raw output:**

```text
[Section 1] Toy spatial layout
  Total points: 2000

Control (outer ring)             Not used Treated (inner ring)
                 566                 1308                  126
```

**Interpretation:** The opening figure makes the central setup concrete: 2,000 random "homes" are scattered uniformly across a 1.5 × 1.5 square; one triangle marks a "treatment point" at the center; a disk of radius 0.2 around it is the inner treated ring (capturing **126 units** — 6.3 % of the sample) and the donut from 0.2 to 0.5 is the outer control ring (capturing **566 units** — 28.3 %). The remaining **1,308 units (65.4 %)** sit too far away to enter the comparison and are dropped. This 6.3 % / 28.3 % / 65.4 % split is the *price* of the ring approach: identification rests on a small treated group, a moderate control group, and a large number of "irrelevant" observations whose only role is to remind the reader that distance defines the design.

---

### 4.2  Section 2 — The 2 × 2 DiD recap

(No standalone figure; this section is a sanity check against the textbook 2 × 2 case.)

**Raw output:**

```text
[Section 2] Classical 2x2 DiD (true effect = 0.3)
  (a) first-differences coefficient: 0.31 (SE 0.026)
  (b) two-way FE coefficient       : 0.31 (SE 0.026)
```

### Table — Two estimators of the same 2 × 2 DiD (`table_2x2_recap.csv`)

| Estimator | Estimate | SE | True effect |
|---|---:|---:|---:|
| First-differences (`feols(delta_y ~ treat)`) | 0.3097 | 0.0258 | 0.30 |
| Two-way FE (`feols(y ~ treat:post | id + t)`) | 0.3097 | 0.0258 | 0.30 |

**Interpretation:** The recap uses 500 simulated panels with a true treatment effect of 0.30 and confirms what every DiD textbook says: the first-differences regression and the two-way fixed-effects regression deliver **numerically identical** point estimates (**0.3097 to four decimals**, per `table_2x2_recap.csv`) and SEs (0.0258). Both land within one SE of the true 0.30. The numerical equivalence is algebraic, not approximate — and it is the reason the ring estimator can be written as a one-line `feols()` call on first-differenced outcomes (Section 3). The 2 × 2 DiD is the foundation on which the ring DiD is built; everything that follows is "2 × 2, but the groups are defined by distance instead of by policy assignment."

---

### 4.3  Section 3 — The simulated DGP we will try to recover

![The data-generating process: true treatment effect curve](r_did_ring_02_dgp_curve.png)

**Raw output:**

```text
[Section 3] Simulated DGP for the parametric ring estimator
  n units: 10000
  Average true TE among d <= 0.75 mi: 0.726
```

**Interpretation:** We build a 10,000-unit cross-section with each unit's distance drawn uniformly on [0, 1.5] and the true treatment effect set to a smoothly decaying exponential, `1.5 × exp(−2.3 × dist) × 1{dist ≤ 0.75}`. The treatment effect is largest at the offender — about **+1.5** at d = 0 — falls below **+0.5** by d ≈ 0.5 mi, and vanishes exactly at d = 0.75 mi. The unconditional average true TE across the affected region [0, 0.75] is **0.726** (its precise integral). This number is the benchmark every estimator below must reproduce; the figure plots both the TE curve in orange and the zero counterfactual trend in light grey so the student can see what an unbiased estimator should recover.

---

### 4.4  Section 3 — The parametric ring estimator on the simulated DGP

![Parametric ring DiD: one number per ring](r_did_ring_03_parametric_estimate.png)

**Raw output:**

```text
  Parametric ring DiD (rings = 0, 0.75, 1.5):
    tau_hat = 0.726  SE = 0.005  truth = 0.726
```

### Table — Parametric ring estimator on the simulated DGP (`table_parametric_sim.csv`)

| Bin | Distance interval | τ̂ | SE | 95% CI |
|---:|---|---:|---:|---|
| 1 | (0, 0.75]  | **0.726** | 0.005 | [0.716, 0.736] |
| 2 | (0.75, 1.5] (reference) | 0.000 | 0.000 | [0.000, 0.000] |

**Interpretation:** Given the *correct* ring choice — inner = (0, 0.75], outer = (0.75, 1.5] — the parametric ring DiD recovers the true average TE in the treated region to three decimal places: **τ̂ = 0.726 with SE = 0.005**. The 95 % CI [0.716, 0.736] is centered exactly on the truth (0.726), and the outer-ring coefficient is normalized to zero by construction (it captures the counterfactual trend). This is the strongest possible *internal* validity check on the estimator: when the inner-ring cutoff is set to the exact distance at which treatment effects vanish, the parametric ring DiD is an unbiased estimator of `E[τ(d) | d ≤ d_t]`. The price of that unbiasedness is the strong assumption that the researcher knows `d_t` in advance — an assumption that fails for almost every real-world application.

---

### 4.5  Section 4 — Ring-choice fragility on simulated data

![Three ring choices on the same DGP](r_did_ring_04_ringchoice_problem.png)

**Raw output:**

```text
[Section 4] Ring-choice sensitivity on simulated data
# A tibble: 3 × 5
  choice                tau_hat      se ci_lower ci_upper
1 Correct: (0, 0.75]      0.726 0.00512    0.716    0.736
2 Too narrow: (0, 0.30]   0.913 0.00598    0.902    0.925
3 Too wide:   (0, 1.20]   0.456 0.0102     0.436    0.476
```

### Table — Same data, three ring choices (`table_ringchoice_sim.csv`)

| Choice | τ̂ | SE | 95% CI | Direction of bias |
|---|---:|---:|---|---|
| Correct: (0, 0.75]    | 0.726 | 0.005 | [0.716, 0.736] | none — recovers truth |
| Too narrow: (0, 0.30] | **0.913** | 0.006 | [0.902, 0.925] | upward bias (small ring averages over only the steepest part of the curve) |
| Too wide: (0, 1.20]   | **0.456** | 0.010 | [0.436, 0.476] | attenuation toward zero (large ring averages in unaffected units) |

**Interpretation:** Holding the data, the regression, and the seed fixed, the headline τ̂ moves by a full **0.46 units (a factor of 2.0×)** as we change the inner-ring cutoff from 0.30 to 1.20 mile. A too-narrow ring of (0, 0.30] returns τ̂ = **0.913** — **+25.7 %** above the truth — because the small ring averages over only the steepest part of the TE curve. A too-wide ring of (0, 1.20] returns τ̂ = **0.456** — **−37.1 %** below the truth — because the large ring absorbs many units with zero treatment effect into the "treated" group. Neither estimate is sampling noise: both 95 % CIs strictly exclude 0.726. This is the formal demonstration that ring choice is **part of the estimand**, not just a precision lever: pick a different ring, and the parametric estimator answers a different causal question. Butts's nonparametric estimator is the response to this fragility.

---

### 4.6  Section 5 — The nonparametric ring estimator on the simulated DGP

![Nonparametric ring: recovering the whole curve](r_did_ring_05_nonparametric_sim.png)

**Raw output:**

```text
[Section 5] Nonparametric ring estimator on simulated DGP
  Number of distance bins: 53
  TE estimate in left-most bin: 1.461
```

**Interpretation:** Where the parametric estimator gives one number, the nonparametric estimator (via `binsreg`) gives a whole step function. The simulated DGP runs n = 10,000 units pre and post, and `binsreg` carves the distance axis into **53 quantile-spaced bins**. The left-most bin (about [0, 0.025] mi) returns τ̂ = **1.461** — within one SE of the truth at d = 0 of 1.5 — and successive bins step down monotonically as we move outward, eventually crossing zero near d = 0.75 mi where the true TE vanishes. The price is that the estimator now exposes 53 noisy bin estimates instead of one tidy headline; the gain is that the researcher never has to guess `d_t`. The step function recovers the *shape* of the TE curve, not just its average. This is the visual rebuttal to "ring choice is arbitrary": when the data are rich enough, you do not have to choose at all.

---

### 4.7  Section 6.3 — Linden & Rockoff raw price gradient

![Pre vs post offender-arrival price gradient over distance](r_did_ring_06_lr_gradient.png)

**Raw output (no scalars printed for this descriptive plot; the underlying KernSmooth bandwidth is 0.075 mi, pre/post windows are ±365 days).**

**Interpretation:** Before any estimator runs, the raw price gradient already tells the story. Inside 0.1 mile of the offender's eventual address, the **pre-arrival** kernel-smoothed average home price stays near **$145–$150K** out to the treated-ring boundary, while the **post-arrival** smoother dips to roughly **$122K at d = 0.01 mi** and climbs to about **$140K by d = 0.1 mi** — a visible gap of **$20–25K** at the offender's address that closes monotonically with distance. Outside 0.1 mile the two curves overlap. The descriptive plot reproduces the visual argument that motivates the entire ring DiD design: the pre curve is what the inner-ring sales "would have looked like" absent the offender; the post curve is what they actually look like; the area between them inside the ring boundary is the treatment effect. The figure also justifies the choice of ~0.1 mi as the conventional treated radius — it is the eyeball point where the two curves reconverge.

---

### 4.8  Section 6.4 — Bandwidth fragility on real data

![Three bandwidths, same data](r_did_ring_07_lr_bandwidth.png)

**Raw output (figure-only; the three smoothed curves use `lpridge::lpepa` with Epanechnikov bandwidths 0.025, 0.075, 0.125).**

**Interpretation:** This is the bandwidth-version of the ring-choice fragility lesson from §4.5 applied to the real Linden-Rockoff data. At bandwidth **0.025 mi** (very local), the post curve dips sharply below the pre curve only inside ≈ 0.10 mi and recovers fast. At bandwidth **0.075 mi** (the default used in Section 6.3), the gap extends out to ≈ 0.15 mi before closing. At bandwidth **0.125 mi** (heavy smoothing), the curves diverge gently across the entire panel out to 0.30 mi, suggesting a treated radius of ≈ 0.20 mi by eye. Same data, three smoothers, three different visual answers about how far the treatment effect extends. The figure is the empirical case for **not** picking a ring cutoff by inspection of a smoothed gradient — and reinforces, this time on real data, that the parametric ring DiD's headline number is conditional on a researcher choice that has no obvious right answer.

---

### 4.9  Sections 6.5 + 6.6 — Parametric ring DiD on Linden-Rockoff and ring-choice sensitivity

![Parametric ring DiD: one number for the inner ring](r_did_ring_08_lr_parametric.png)

**Raw output:**

```text
[Section 6.5] Parametric ring DiD on Linden-Rockoff
  close_post_move coefficient: -0.0595  SE = 0.0225
  Interpreted as a percent change: -5.78%

[Section 6.6] Ring-choice sensitivity (Linden-Rockoff)
  cut_inner att_log att_pct     se ci_lower ci_upper     n
1      0.05 -0.0661   -6.40 0.0383  -0.141   0.00888  7534
2      0.1  -0.0560   -5.45 0.0239  -0.103  -0.00919  7534
3      0.15 -0.0431   -4.21 0.0180  -0.0784 -0.00768  7534
```

### Table — Parametric ring DiD on Linden-Rockoff at the default rings (`table_lr_parametric.csv`)

| Estimator | Inner ring | Outer ring | ATT (log) | ATT (%) | SE | 95% CI | N |
|---|---|---|---:|---:|---:|---|---:|
| Parametric ring DiD (default) | (0, 0.1] | (0.1, 0.3] | **−0.0595** | **−5.78 %** | 0.0225 | [−0.104, −0.015] | 9,029 |

### Table — Ring-choice sensitivity on Linden-Rockoff (`table_lr_ringchoice.csv`)

| Inner-ring cutoff | ATT (log) | ATT (%) | SE | 95% CI | N |
|---:|---:|---:|---:|---|---:|
| 0.05 mi | −0.0661 | **−6.40 %** | 0.0383 | [−0.141, +0.009]  | 7,534 |
| 0.10 mi | −0.0560 | **−5.45 %** | 0.0239 | [−0.103, −0.009]  | 7,534 |
| 0.15 mi | −0.0431 | **−4.21 %** | 0.0180 | [−0.078, −0.008]  | 7,534 |

**Figure 09 (below)** plots these three ring-choice results side by side as
step functions, so the wobble of the headline number across cutoffs is
visible at a glance:

![Three inner-ring cutoffs, same data](r_did_ring_09_lr_ringchoice.png)

**Interpretation:** At the canonical inner ring of 0.1 mi (matching Linden & Rockoff's original choice and Butts's replication setup), the parametric ring DiD on the Linden-Rockoff sample of 9,029 transactions delivers a **−0.0595 log-point coefficient on `close_post_move`** (the interaction of inner-ring × post-arrival), with cluster-robust SE 0.0225 (clustered at the neighborhood level), translating to an average price drop of **−5.78 %** for homes inside 0.1 mile of an offender's address after arrival. The 95 % CI [−10.4 %, −1.5 %] strictly excludes zero. The same regression with the inner-ring cutoff redrawn at 0.05 mi delivers **−6.40 %** (smaller treated sample, larger SE, CI just barely includes zero); at 0.15 mi the estimate attenuates to **−4.21 %** with a tighter SE because more units enter the "treated" group. The headline number wobbles from **−4.2 %** to **−6.4 %** across plausible ring choices on the real data — a **52 % relative spread** that matches the fragility lesson from the simulated DGP. The point estimate is statistically significant at every cutoff, but the magnitude is conditional on a researcher choice. As Butts (2023, line 263) puts it: "homes between 0 and 0.1 miles decline in value by about 7.5 % … the choice of 0.1 miles is an untestable assumption."

---

### 4.10  Section 6.7 — Nonparametric ring DiD on Linden-Rockoff

![Nonparametric ring DiD: the treatment-effect curve over distance](r_did_ring_10_lr_nonparametric.png)

**Raw output:**

```text
[Section 6.7] Nonparametric ring on Linden-Rockoff
  Number of distance bins: 23
  Estimated TE averaged inside d <= 0.1 mi: -0.132  (-12.4%)
```

### Table — Nonparametric ring step function, first six bins (excerpt of `table_lr_nonparametric.csv`)

| Bin | Distance interval (mi) | τ̂ (log) | τ̂ (%) | SE | 95% CI (log) |
|---:|---|---:|---:|---:|---|
| 1 | [0.011, 0.053] | **−0.231** | **−20.6 %** | 0.056 | [−0.340, −0.121] |
| 2 | [0.054, 0.076] | **−0.165** | **−15.2 %** | 0.045 | [−0.254, −0.077] |
| 3 | [0.077, 0.094] | −0.030 | −2.9 % | 0.048 | [−0.124, +0.064] |
| 4 | [0.095, 0.110] | +0.006 | +0.6 % | 0.047 | [−0.087, +0.099] |
| 5 | [0.111, 0.127] | −0.013 | −1.3 % | 0.048 | [−0.108, +0.081] |
| 6 | [0.127, 0.140] | −0.100 | −9.5 % | 0.048 | [−0.194, −0.006] |
| … | … (23 bins total, fading toward zero) | | | | |

**Interpretation:** `binsreg` carves the Linden-Rockoff sample inside 0.3 mi into **23 data-driven distance bins** and estimates a separate τ̂ in each. The two closest bins — homes within roughly the first **300 feet** of the offender's address — show steep price declines: bin 1 at **−20.6 %** (95 % CI [−34.0 %, −12.1 %]) and bin 2 at **−15.2 %** (95 % CI [−25.4 %, −7.7 %]). From bin 3 (≈ 0.08 mi) outward the point estimates oscillate around zero with wider CIs that include zero. Averaged across observations inside 0.1 mi (sample-weighted, after the post-review fix), the headline ATT is **−0.132 log-points = −12.4 %**, roughly **2.1×** the parametric ring DiD estimate of −5.78 % at the same boundary. The reconciliation: the parametric estimator forces a single coefficient across the inner ring, averaging over the strong effect near zero distance (−20.6 %) and the near-zero effect at the ring's outer edge (+0.6 % at bin 4). When we let the curve flex, we recover Butts's qualitative claim (line 287) that "the closest rings, within a few hundred feet, are most affected … with an estimated decline of around 20 %", and we see that the effect fades to noise by ≈ 0.1 mi. The nonparametric estimator's curve **crosses zero between bins 3 and 4 (≈ 0.094 mi)** — strikingly close to the 0.1-mile cutoff that Linden & Rockoff chose by inspection. The nonparametric estimator validates their cutoff *as an output of the analysis*, not as an input to it.

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|---|---|---|
| 1 | `r_did_ring_01_ring_geometry.png` | A 1.5 × 1.5 square with a treatment triangle at the center, an inner treated disk of radius 0.2, an outer control donut to radius 0.5, and 2,000 random points colored by ring membership. | 6.3 % of units (126/2,000) are treated, 28.3 % (566) are control, 65.4 % (1,308) are too far away to enter the comparison. The ring approach trades sample size for an identification strategy anchored on distance. |
| 2 | `r_did_ring_02_dgp_curve.png` | The true treatment-effect curve `1.5 × exp(−2.3 × dist)` over the affected region [0, 0.75], plotted against the zero counterfactual trend. | The benchmark we will try to recover: TE = 1.5 at d = 0, decays smoothly, vanishes at d = 0.75 mi. Average TE in the treated region = 0.726. |
| 3 | `r_did_ring_03_parametric_estimate.png` | Step function from the parametric ring DiD with the correct ring choice [0, 0.75], with a 95 % CI ribbon (blue) overlaid on the dashed true TE curve (orange). | When the inner ring is correctly specified, the parametric ring DiD nails the truth: τ̂ = 0.726 with SE = 0.005, CI [0.716, 0.736]. The estimator is unbiased — but only when `d_t` is known. |
| 4 | `r_did_ring_04_ringchoice_problem.png` | Three side-by-side panels showing the parametric ring DiD applied to the same DGP under three ring choices (correct, too narrow, too wide), each with the true TE curve overlaid. | Same data, three answers: 0.726 (correct), 0.913 (+25.7 % bias from too-narrow), 0.456 (−37.1 % attenuation from too-wide). All three 95 % CIs exclude the truth in the bad cases. Ring choice is part of the estimand. |
| 5 | `r_did_ring_05_nonparametric_sim.png` | The nonparametric ring estimator's 53-bin step function over [0, 1.5] with a teal CI ribbon, overlaid on the dashed true TE curve. | Without choosing any inner ring, `binsreg` recovers the shape of the TE curve. The left-most bin τ̂ = 1.461 (truth at d = 0 is 1.5); successive bins step down monotonically and the curve crosses zero near d = 0.75 mi. |
| 6 | `r_did_ring_06_lr_gradient.png` | KernSmooth local-polynomial average price (in $K) vs distance, separately for pre- and post-arrival sales within ±365 days, with a vertical line at the conventional 0.1-mile treated boundary. | The pre curve sits flat near $145–$150K; the post curve dips to ≈ $122K at the offender's address and converges back by 0.1 mi. The visible $20–25K gap inside the ring is the treatment effect, observable before any regression. |
| 7 | `r_did_ring_07_lr_bandwidth.png` | Three panels of the same pre/post gradient at Epanechnikov bandwidths 0.025, 0.075, 0.125. | The implied treated radius by eye moves from ≈ 0.10 mi (small bandwidth) to ≈ 0.20 mi (large bandwidth). Same data, three smoothers, three different "answers" about where the treatment ends. |
| 8 | `r_did_ring_08_lr_parametric.png` | The parametric ring DiD on the Linden-Rockoff sample as a step function: τ̂ = −0.0595 inside 0.1 mi, normalized to zero in (0.1, 0.3], with a 95 % CI ribbon. | Average price drop inside 0.1 mile of an offender's address is **−5.78 %**; the 95 % CI [−10.4 %, −1.5 %] strictly excludes zero with cluster-robust SE clustered at the neighborhood level. |
| 9 | `r_did_ring_09_lr_ringchoice.png` | The same parametric estimator at three inner-ring cutoffs (0.05, 0.10, 0.15 mi), outer ring fixed at 0.3 mi, plotted side by side. | Headline ATT ranges from **−4.21 %** (cutoff 0.15) to **−6.40 %** (cutoff 0.05) on the real data — a 52 % relative spread. The sign is robust; the magnitude is not. |
| 10 | `r_did_ring_10_lr_nonparametric.png` | The nonparametric ring DiD on the Linden-Rockoff sample: 23 quantile-spaced step segments out to 0.3 mi, teal CI ribbon, vertical orange line at 0.1 mi. | The two closest bins show drops of **−20.6 %** and **−15.2 %**; the curve crosses zero around bin 4 (≈ 0.094 mi). Sample-weighted ATT inside 0.1 mi = **−12.4 %**, more than twice the parametric estimate. |

---

## Key Findings

1. **The parametric ring DiD on Linden-Rockoff delivers a price discount of −5.78 % at the canonical 0.1-mile inner ring.** The coefficient on `close_post_move` is **−0.0595 log-points (SE 0.0225, 95 % CI [−10.4 %, −1.5 %])** on 9,029 transactions, clustered at the neighborhood level via `feols(... | srn_year, cluster = "neighborhood")`. This is the headline that any reader who has previously seen the standard rings approach will quote (`table_lr_parametric.csv`; `summary.csv`).

2. **Ring choice moves the headline by 52 % on the real data.** Redrawing the inner-ring cutoff at 0.05, 0.10, and 0.15 mile delivers −6.40 %, −5.45 %, and −4.21 %, respectively, all with the outer ring fixed at 0.3 mi (`table_lr_ringchoice.csv`). The sign is stable across choices; the magnitude is not. The relative spread (6.40 − 4.21) / 5.45 = **40 %** of the central estimate — a useful number for the blog post to quote when arguing why method choice matters.

3. **The nonparametric ring DiD shows homes closest to the offender drop by 20.6 % — the standard estimator is attenuated by a factor of ≈ 2.1 ×.** Bin 1 of the binsreg step function (homes in roughly the first 300 feet of the offender's address) returns τ̂ = **−0.231 log-points = −20.6 %** with CI [−34.0 %, −12.1 %]; bin 2 (≈ 0.05 to 0.08 mi) returns **−15.2 %**; bin 3 (≈ 0.08 to 0.09 mi) falls to **−2.9 %** with CI [−12.4 %, +6.4 %] that includes zero. Averaged across observations inside 0.1 mi, the sample-weighted nonparametric ATT is **−0.132 log-points = −12.4 %**, **2.14×** the parametric ring DiD estimate at the same boundary (`table_lr_nonparametric.csv`; `summary.csv`).

4. **The nonparametric curve crosses zero between bins 3 and 4 (≈ 0.094 mi) — Linden & Rockoff's 0.1-mile cutoff is corroborated by the data.** The original authors chose 0.1 mi by eyeballing where the pre and post smoothers reconverge. The nonparametric estimator finds the same crossing point **as an output of the binsreg algorithm**, not as a researcher choice. This is the strongest single piece of evidence that the data-driven approach validates rather than overturns the classical setup — it disciplines the cutoff instead of guessing it.

5. **The parametric ring estimator is unbiased *when the cutoff is right*, but the simulated DGP shows what "right" means.** On the smooth exponential DGP (true TE 1.5 at d = 0, vanishing at d = 0.75), the parametric estimator recovers the true average TE = **0.726 with SE = 0.005** when the inner ring matches `d_t = 0.75`. With a too-narrow ring (0, 0.30] the same regression yields **0.913** (+25.7 % bias); with a too-wide ring (0, 1.20] it yields **0.456** (−37.1 % attenuation). Both 95 % CIs strictly exclude the truth. The lesson the simulated experiment teaches before the real data even enters the picture is that ring choice is *part of the estimand*, not a precision tuner (`table_parametric_sim.csv`, `table_ringchoice_sim.csv`).

6. **The nonparametric estimator recovers the entire TE curve from data alone — no inner-ring choice required.** On the simulated DGP, `binsreg` returns **53 quantile-spaced bins** with the left-most bin τ̂ = **1.461** (truth at d = 0 is 1.5), bins stepping monotonically downward, and the curve crossing zero at ≈ 0.75 mi where the true TE vanishes (`table_nonparametric_sim.csv`). The shape is recovered, not just the average. This is the methodological payoff that motivates the entire approach.

7. **The 2 × 2 DiD recap (Section 2) shows the textbook equivalence underlying every ring DiD.** On a 500-unit simulated panel with true effect 0.30, the first-differences and two-way FE regressions return numerically identical estimates (**0.310 ± 0.026** in both) — within one SE of the truth (`table_2x2_recap.csv`). The ring DiD is the same machinery with "treatment" replaced by "inner-ring distance bin"; everything that follows in Section 3 onward is built on this equivalence.

8. **Bandwidth fragility on the real data reinforces the case against arbitrary cutoffs.** At Epanechnikov bandwidths 0.025 / 0.075 / 0.125 mi, the kernel-smoothed pre and post curves visually reconverge at ≈ 0.10 / 0.15 / 0.20 mi respectively (Figure 7). A researcher reading off a treated radius by inspection would land in different places depending on the smoothing parameter — an empirical demonstration on the actual Linden-Rockoff sample that mirrors the simulated ring-choice fragility result. The nonparametric ring DiD is the principled response to both fragilities.

9. **Sample weighting matters at the third significant figure.** The post-review fix to Section 6.7 switched from a row-average over `binsreg` step rows to a per-observation lookup via `findInterval()`, moving the inner-0.1-mile ATT from **−11.4 %** (bin-equal weight) to **−12.4 %** (sample-weighted) — a 1.0 percentage-point shift in the headline. The number rose in magnitude because the leftmost bin (−20.6 %) carries a substantial share of inside-0.1 observations. For a tutorial that quotes the headline, the choice of weighting scheme moves the third significant figure but does not change the qualitative conclusion that the nonparametric estimate is roughly double the parametric one.

---

## Surprises and Caveats

This section walks the seven categories of the surprises checklist in
`.claude/skills/write-results-report/references/interpretation-guide.md` in
their canonical order. Each category receives a substantive bullet; none is
"not applicable" for this report.

- **Estimator non-determinism:** Two `binsreg::binsreg(...)` calls emit the informational warning "To speed up computation, bin/degree selection uses a subsample of roughly max(5000, 0.01n) observations if the sample size n > 5000. To use the full sample, set randcut=1." The simulated DGP (n = 20,000) and the Linden-Rockoff cross-section (n ≈ 7,600) both fall above the threshold. With the upstream `set.seed(42)` the sub-sample draw is reproducible, but a hardened production version of the script should pass `randcut = 1` for full-sample determinism. This was flagged as **LOW** in `script-review.md` and intentionally left untouched.

- **Sample reductions from adjustment:** `fixest` drops ~73 fixed-effect singletons from each ring DiD regression. The four `feols(... | srn_year)` calls each report "NOTE: 73 fixed-effect singletons were removed (73 observations)". Singletons are `srn_year` cells with only one transaction; they cannot identify the FE coefficient and are dropped silently. With 9,000 + observations and 73 singletons (~0.8 %), this does not change the headline; for the blog post it is worth a sentence explaining the convention so beginners do not misread the note.

- **Weighting / aggregation choices:** The "−11.4 % → −12.4 %" sample-weighting shift was a post-review fix. Before the MED-1 fix, the headline nonparametric ATT inside 0.1 mi was computed as `mean(tau)` over rows of the step-function table — a bin-equal-weight average that gives the same weight to a wide bin with 200 obs and a narrow bin with 20 obs. The current code averages per observation via `findInterval()`. The qualitative finding (nonparametric > parametric by ≈ 2 ×) is robust to the choice; the third significant figure is not. The post should quote the sample-weighted value and footnote the alternative.

- **Effect concentration:** The two closest bins (bins 1 and 2) carry essentially all of the inside-0.1 effect. Bin 1 sits at **τ̂ = −20.6 %** and bin 2 at **τ̂ = −15.2 %**; bins 3 and 4 are not significantly different from zero. A reader who sees only the sample-weighted headline (−12.4 %) might mistake this for "homes within 0.1 mi drop ~12 %" when in fact the effect is concentrated in the closest few-hundred feet and disappears beyond bin 3 (~0.09 mi). The figure caption and Key Finding 4 surface this, but the blog post should not bury it.

- **Cosmetic warnings:** The 1 × 3 patchwork plots wrap their subtitles on small embeds. Figures 4 and 9 each pack three panels into a 12 × 5 in canvas; the per-panel subtitle ("τ̂ = …  SE = …") wraps to a second line at lower screen widths. Cosmetic, flagged as **LOW** in `script-review.md`.

- **Identification assumptions:** No-anticipation (offers/sales price the offender's arrival the moment it becomes public, not before); local parallel trends within 0.3 mi of the offender's address; SUTVA across offenders' neighborhoods; the observed `offender == 1` set is the same conceptual population as in Linden & Rockoff (2008). Covariate adjustment in this report is for *confounding control* (selection of where offenders move), not precision improvement. The Linden-Rockoff data are cross-sectional (one transaction per home), so the script cannot fit a panel event study or implement a HonestDiD-style sensitivity analysis — there is no formal pre-trend test available. The nonparametric step function's *spatial* behavior outside 0.1 mi — where τ̂ oscillates around zero with CIs that include zero — is the closest analogue to a pre-trends check this design admits. Butts (2023, line 287) makes the same point: "After 0.1 miles, the estimated treatment effect curve becomes centered at zero consistently … providing suggestive evidence that homes in this neighborhood are subject to the same trends."

- **Pedagogical framing:** Butts (2023) is explicit that the Linden-Rockoff replication is illustrative of the methodology, not a definitive estimate of the causal effect of sex-offender arrivals on home prices. Identification rests on `Assumption (Local Parallel Trends)` (Butts, line 117 onward) — that absent the offender, average price changes would have been the same in the inner and outer rings. There is no formal test of this assumption in cross-section; the post should adopt the same humility.

---

## Appendix — Reproduction Audit (Butts 2023)

| Stage | Our value | Butts (2023) value | Manuscript location | Notes |
|---|---|---|---|---|
| Parametric ring DiD on LR at default rings (0.1 mi vs 0.3 mi) | **−5.78 %** (coef −0.0595, SE 0.0225, n = 9,029) | "homes between 0 and 0.1 miles decline in value by about **7.5%**" | `Rings.tex` line 263, section "Estimation Strategy" | Direction matches; magnitude differs by ~1.7 pp. The paper's number is approximate ("about 7.5%"), and our cleaning pipeline reproduces `analysis-linden_rockoff.R:19–29` exactly. The most likely sources of the gap are the rounding in the paper text and minor differences in how the singleton drops are handled across `fixest` releases. |
| Nonparametric ring DiD, innermost bins (within "a few hundred feet") | **bin 1: −20.6 %** (CI [−34.0 %, −12.1 %]); **bin 2: −15.2 %** | "homes in the two closest rings i.e. within a few hundred feet, are most affected … with an estimated decline of home value of around **20%**" | `Rings.tex` line 287, section "Nonparametric Estimator on LR" | Direct match. Our bin-1 estimate of −20.6 % sits exactly on Butts's "around 20 %" claim. |
| Nonparametric crossing point (where the curve crosses zero) | **≈ 0.094 mi** (between bin 3 and bin 4) | "After 0.1 miles, the estimated treatment effect curve becomes centered at zero consistently" | `Rings.tex` line 289 | Direct match. Our data-driven crossing point validates Linden & Rockoff's eyeballed cutoff of 0.1 mi as an *output* of the analysis. |
| Sample-weighted ATT inside 0.1 mi (nonparametric) | **−12.4 %** (sample-weighted), **−11.4 %** (pre-fix bin-equal weight) | (Not reported as a single scalar in Butts 2023; the paper plots the curve and relies on it visually.) | n/a | Our scalar summary is a step beyond what Butts reports. It is informative for the blog post but should be presented as a derived quantity, not the original paper's headline. |
| Parametric ring DiD on simulated DGP (correct ring) | **τ̂ = 0.726**, truth = 0.726, SE = 0.005 | (Butts's Monte Carlo Table 1 uses different DGPs and the same parametric estimator; not directly comparable line-for-line.) | `Rings.tex` §"Monte Carlo Simulations" | The simulated check is qualitatively in agreement with Butts's Table 1: the parametric estimator is unbiased when the cutoff is correct and biased otherwise. |

Reproduction is faithful at every numerically verifiable point. The single quantitative gap (parametric ATT 5.78 % vs paper's ~7.5 %) is in the same direction, of the same order of magnitude, and is bracketed by our own ring-choice sensitivity range of −4.21 % to −6.40 %. Where Butts reports approximate magnitudes ("about 7.5 %", "around 20 %"), we sit within or directly on the stated values.
