# Results Report: Staggered Synthetic Difference-in-Differences (Gender Quotas)

**Script:** `analysis.do` (≈ 320 lines)
**Executed:** 2026-06-08
**Status:** Success — all estimates reproduce Clarke et al. (2024); the only non-fatal notes are SSC-install messages and Stata's "(file … not found)" notices that precede each `replace`-write.
**Runtime:** ≈ 9–10 minutes on Stata/MP (the `covariates(lngdp, optimized)` bootstrap dominates).
**Language:** Stata 18.0 MP
**Key packages:** `sdid` (Clarke, Pailañir, Athey & Imbens), `sdid_event` (Ciccia, Clarke & Pailañir), `panelview` (Xu & Hua), `reghdfe`.

**Methodological reference:** Clarke, D., Pailañir, D., Athey, S., & Imbens, G. (2024). *On Synthetic Difference-in-Differences and Related Estimation Methods in Stata.* The Stata Journal, 24(4). DOI 10.1177/1536867X241297184. The script ports the paper's staggered-adoption logic (§4.2–4.4) and adds the modern `sdid_event` event study; all numbers are verified against the paper.

---

## Execution summary

The script estimates the effect of adopting a parliamentary gender quota on the share of women in the national parliament, using the `quota_example` panel (119 countries, 1990–2015). Treatment is staggered: 9 countries adopt across 7 cohorts. After a `panelview` EDA and a naive two-way fixed-effects (TWFE) benchmark, it runs staggered SDID with bootstrap inference, extracts the cohort-specific effects, adds the `lngdp` covariate two ways (optimized and projected), produces an `sdid_event` event study for the 2002 cohort, and compares bootstrap / placebo / jackknife inference on a two-cohort subsample.

The headline: an overall **ATT of +8.03 percentage points** (SE 3.74, *p* = 0.032), robust to the covariate (8.05 / 8.06), behind which the seven cohort effects range from **−3.5 to +21.8**. The event study shows flat pre-period placebos and a sustained post-adoption rise.

**Warnings (all benign):**
- SSC/`net install` messages for `sdid`, `sdid_event`, `panelview`, `reghdfe` (wrapped in `capture`).
- "(file … not found)" lines are Stata's normal notice before a `replace`-write creates a new file (figures, CSVs, tempfiles) — not errors.
- `panelview` renders its heatmap in its own blue/orange palette; it cannot take the exact site hex colors (cosmetic only; the brand-exact figures carry the palette).

---

## Data overview

```text
Variable    Obs Unique      Mean     Min       Max  Label
----------------------------------------------------------------------------
country    3094    119         .       .         .  Country
year       3094     26    2002.5    1990      2015  Year
quota      3094      2  .0303814       0         1  =1 if country has a quota
womparl    3094    449  14.96531       0      63.8  Women in parliament
lngdp      2990   2956  9.154291  5.8701  11.61789  log(GDP)
----------------------------------------------------------------------------
```

| Statistic | Value |
|---|---|
| Countries (units) | 119 (9 ever-treated, 110 never-treated) |
| Years | 26 (1990–2015) |
| Observations | 3,094 (balanced panel) |
| Outcome `womparl` mean | 14.97% (range 0–63.8) |
| Treated country-years | 94 (3.0% of observations) |
| `lngdp` missing | 104 observations (drop before covariate runs) |

**Interpretation.** The panel is balanced and outcome/treatment-complete, satisfying SDID's requirements. Treated country-years are scarce (3%), and `quota` is absorbing. The 104 missing `lngdp` values mean the covariate models run on a slightly smaller sample, so the covariate ATTs are not strictly nested in the no-covariate estimate.

**Adoption cohorts.**

```text
 firsttreat |      Freq.     Percent
------------+--------------------------
       2000 |          1        0.84
       2002 |          2        1.68
       2003 |          2        1.68
       2005 |          1        0.84
       2010 |          1        0.84
       2012 |          1        0.84
       2013 |          1        0.84
          . |        110       92.44
------------+--------------------------
      Total |        119      100.00
```

Nine countries adopt across seven cohorts; the 2002 and 2003 cohorts have two countries each. This is the staggered structure the rest of the analysis exploits.

---

## Method results

### 1. EDA (panelview + raw trends)

![Treatment-timing heatmap](stata_sdid_staggered_panelview_treat.png)
![Outcome trajectories by treatment status](stata_sdid_staggered_panelview_outcome.png)
![Mean outcome, ever- vs never-adopting](stata_sdid_staggered_raw_trends.png)

The `panelview` treatment heatmap (`bytiming`) shows the staggered "staircase," and the outcome plot overlays the 9 treated series (orange) on the 110 controls. The site-colored mean plot shows ever-adopting countries starting *below* never-adopting ones (≈ 4% vs 10% in 1990) and finishing *above* (≈ 23% vs 22% in 2015) — a crossing pattern a naive two-group DiD would misread, motivating cohort-specific synthetic controls.

### 2. Naive TWFE benchmark (biased foil)

```text
Static TWFE 'ATT' (biased foil) = 7.96  (cluster SE 3.77)
```

**Interpretation.** The static TWFE coefficient is +7.96 (cluster SE 3.77). It happens to land near the SDID estimate here, but under staggered timing with heterogeneous effects it is a contaminated, variance-weighted blend of all 2×2 comparisons (including forbidden ones using already-treated units as controls). It is reported only as a benchmark, not a credible ATT.

### 3. Staggered SDID — overall and by cohort

```text
-----------------------------------------------------------------------------
     womparl |     ATT     Std. Err.     t      P>|t|    [95% Conf. Interval]
-------------+---------------------------------------------------------------
       quota |   8.03410    3.74040     2.15    0.032     0.70305    15.36516
-----------------------------------------------------------------------------
```

| Cohort | τ̂ₐ (pp) | SE | Agg. weight |
|---|---|---|---|
| 2000 | 8.39 | 0.68 | 0.170 |
| 2002 | 6.97 | 0.64 | 0.298 |
| 2003 | 13.95 | 9.13 | 0.277 |
| 2005 | −3.45 | 0.76 | 0.117 |
| 2010 | 2.75 | 0.45 | 0.064 |
| 2012 | 21.76 | 0.92 | 0.043 |
| 2013 | −0.82 | 0.83 | 0.032 |

![Cohort-specific SDID effects](stata_sdid_staggered_cohort_taus.png)
![2002-cohort counterfactual](stata_sdid_staggered_cohort2002_path.png)
![2002-cohort time weights](stata_sdid_staggered_lambda.png)

**Interpretation.** The overall ATT is +8.03 pp (SE 3.74, *p* = 0.032; 95% CI [0.70, 15.37]) — quotas raise women's parliamentary share by about eight points in adopting countries. The cohort effects span −3.45 (2005) to +21.76 (2012); the 2003 cohort is essentially uninformative (SE 9.13). The aggregate is the treated-period-weighted average — verified in the log to reproduce 8.03 — and differs from the unweighted mean of the seven effects (≈ 7.0) because the formula up-weights the earlier, longer-exposed cohorts (2000/2002/2003 carry 75% of the weight).

### 4. Covariate adjustment (log GDP per capita)

```text
SDID + lngdp (optimized) ATT = 8.0515  SE = 3.0466
SDID + lngdp (projected) ATT = 8.0593  SE = 3.1191
```

**Interpretation.** Conditioning on log GDP per capita barely moves the estimate: 8.05 (optimized, *p* = 0.008) and 8.06 (projected, *p* = 0.010), versus 8.03 without. The two routes — joint optimization vs residualization on the untreated sample — agree to the second decimal, and income does not explain away the quota effect.

### 5. Event study (`sdid_event`, 2002 cohort)

```text
             |  Estimate         SE      LB CI      UB CI  Switchers
-------------+------------------------------------------------------
         ATT |  6.853472   3.372744   .2428928   13.46405          2
    Effect_1 |  4.086404   1.191517    1.75103   6.421778          2
    Effect_2 |  9.164442   1.522799   6.179756   12.14913          2
    Effect_3 |  7.938504   2.182572   3.660663   12.21635          2
       ...   |
   Placebo_1 | -.218417   0.470226   -1.14006    .703227          2
   Placebo_2 |  .242148   0.884557   -1.491584   1.975880          2
       ...   |
```

![Event-study SDID, 2002 cohort](stata_sdid_staggered_event_study.png)

**Interpretation.** All twelve pre-adoption placebo coefficients sit within a whisker of zero (range −0.22 to +0.76), so the parallel-(synthetic-)trends assumption is not rejected. The post-adoption effects appear immediately (+4.1 pp at event time 0), roughly double within a year (+9.2), and persist in the +6 to +9 range for over a decade — the dynamics the single cohort ATT (≈ +7) conceals. (`Effect_ℓ` = event time ℓ−1; `Placebo_ℓ` = event time −ℓ.)

### 6. Inference comparison (2002 & 2003 cohorts)

```text
method      att        se      ci_l     ci_u
bootstrap   10.33066   4.7291   1.0618   19.5995
placebo     10.33066   2.3404   5.7436   14.9178
jackknife   10.33066   6.0056  -1.4401   22.1014
```

![Inference comparison](stata_sdid_staggered_inference.png)

**Interpretation.** All three estimators share the same point estimate (10.33 pp on this subsample) and differ only in the standard error: jackknife is most conservative (6.01, CI crosses zero), placebo tightest (2.34), bootstrap in between (4.73). The subsample ATT exceeds the full-sample 8.03 because dropping the five single-country cohorts discards the negative 2005 and 2013 effects.

---

## Figure inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `stata_sdid_staggered_panelview_treat.png` | panelview treatment-timing heatmap | The staggered staircase: cohorts switch on 2000–2013 |
| 2 | `stata_sdid_staggered_panelview_outcome.png` | panelview outcome trajectories | Treated countries (orange) rise after their own adoption |
| 3 | `stata_sdid_staggered_raw_trends.png` | Mean womparl, ever- vs never-adopting | Treated start below, overtake controls — confounded by timing |
| 4 | `stata_sdid_staggered_cohort_taus.png` | Cohort τ̂ₐ ± 95% CI + aggregate line | Effects span −3.5 to +21.8 around an 8.0 aggregate |
| 5 | `stata_sdid_staggered_cohort2002_path.png` | 2002 treated vs anchored synthetic | Lines overlap pre-2002, diverge after (the effect) |
| 6 | `stata_sdid_staggered_event_study.png` | sdid_event dynamic effects, 2002 cohort | Flat placebos, sustained post-period rise |
| 7 | `stata_sdid_staggered_inference.png` | bootstrap/placebo/jackknife forest | Same ATT (10.3), jackknife widest, placebo tightest |
| 8 | `stata_sdid_staggered_lambda.png` | 2002-cohort time weights λ | Weight concentrates on years just before 2002 |

---

## Key findings

1. **Quotas raise women's representation by ~8 points.** Overall SDID ATT = +8.03 pp (SE 3.74, *p* = 0.032, 95% CI [0.70, 15.37]) against a sample mean of 15% — a large, statistically significant effect.
2. **Cohort effects are wildly heterogeneous.** From −3.45 pp (2005) to +21.76 pp (2012); two of seven cohorts are negative. The average is a summary of real spread.
3. **The aggregate is a weighted, not simple, average.** Treated-period weighting yields 8.03; the unweighted mean of the seven τ̂ₐ is ≈ 7.0. The 2000/2002/2003 cohorts carry 75% of the aggregation weight.
4. **One cohort is essentially uninformative.** The 2003 cohort's SE of 9.13 gives a CI from −4 to +32 — a fragile synthetic control from few controls.
5. **Income does not explain the effect.** Adding `lngdp` moves the ATT only to 8.05 (optimized) / 8.06 (projected); both *p* < 0.01.
6. **Pre-trends are flat.** Every pre-adoption placebo in the 2002-cohort event study lies in [−0.22, 0.76] pp — the parallel-trends assumption is not rejected.
7. **The effect is immediate and persistent.** Event time 0 effect = +4.1 pp; it roughly doubles by +1 (+9.2) and stays positive for 13 event-years.
8. **Inference method changes only the SE.** On the 2002+2003 subsample, ATT = 10.33 for all three; SEs are 4.73 (bootstrap), 2.34 (placebo), 6.01 (jackknife); jackknife's CI alone crosses zero.
9. **The naive TWFE foil is not trustworthy.** It returns 7.96 here but, under staggered timing, relies on forbidden already-treated-as-control comparisons.

---

## Surprises and caveats

1. **Estimator non-determinism** — Bootstrap and placebo SEs depend on `seed()`/`brep()`. Point estimates (ATT, cohort τ̂ₐ) are deterministic; SEs vary slightly with the seed/replication count (demo uses default 50 / 100).
2. **Sample reductions from adjustment** — `drop if missing(lngdp)` removes 104 observations before the covariate and event-study runs; the inference subsample drops 5 countries. The no-covariate main estimate uses the full balanced panel.
3. **Weighting / aggregation choices** — The aggregation weight is the treated unit-by-post-period share (N_tr·T_post); using the plain post-period share or an unweighted mean changes the headline at the first significant figure (8.0 → ~7.0 unweighted).
4. **Effect concentration** — The +8 aggregate leans on a few cohorts; the 2012 cohort alone (+21.8) and the early long-exposure cohorts drive it. Dropping 2012 lowers the aggregate noticeably.
5. **Cosmetic warnings** — SSC-install notes and "(file … not found)" pre-`replace` notices are informational, not errors. `panelview` cannot adopt the exact site hex palette.
6. **Identification assumptions in force** — Synthetic parallel trends per cohort, no anticipation, absorbing treatment, no cross-country spillovers (SUTVA), and adoption timing not driven by the outcome path. None is testable; the flat event-study placebos support but cannot prove the trends assumption.
7. **Pedagogical framing of the source** — `quota_example` is a teaching subset of Bhalotra et al. (2023). These numbers illustrate the *method*, not a final policy verdict; the paper itself frames them as a worked example.

---

## Appendix — Reproduction audit (vs Clarke et al. 2024)

| Stage | Our value | Paper value | Notes |
|---|---|---|---|
| Overall ATT | 8.034 (SE 3.740) | 8.034 (SE 3.740) | Exact (§4.2) |
| Cohort τ̂ (2000…2013) | 8.39, 6.97, 13.95, −3.45, 2.75, 21.76, −0.82 | identical | Exact, `e(tau)` |
| Covariate (optimized) | 8.051 (SE 3.05) | 8.051 (SE 3.09) | Point exact; SE differs by seed/reps |
| Covariate (projected) | 8.059 (SE 3.12) | 8.059 (SE 3.12) | Exact |
| Subsample ATT | 10.331 | 10.331 | Exact (§4.3) |
| Subsample SE (boot/plac/jack) | 4.729 / 2.340 / 6.006 | 4.729 / 2.340 / 6.006 | Exact |

**Verdict.** Reproduction is faithful at every numerically verifiable point; the only differences are third-significant-figure standard errors that depend on bootstrap seed/replication count. The `sdid_event` event study is a modern addition not in the original paper, grounded in the same staggered machinery.
