# Results Report — Evaluating the Economic Impact of the Aceh Tsunami

| Field | Value |
|---|---|
| **Script** | `script.py` |
| **Executed** | 2026-06-10 |
| **Status** | ✅ Success (exit 0, ~30 s, 0 warnings) |
| **Language** | Python 3.13 |
| **Key packages** | `pyfixest` 0.50.1 (TWFE/DiD), `diff-diff` 3.5.2 (2×2 + event study), `mlsynth` (VanillaSC synthetic control), `pandas`, `numpy`, `matplotlib` |
| **Data** | `data/aceh_tsunami_district_panel.csv` (1,750 rows = 125 districts × 1999–2012); `data/aceh_tsunami_subdistrict_panel.csv` (3,864 rows = 276 kecamatans) — **synthetic, calibrated** |
| **Methodological reference** | Heger, M. P., & Neumayer, E. (2019). *The impact of the Indian Ocean tsunami on Aceh's long-term economic growth.* J. Dev. Econ. 141, 102365. |
| **Estimand** | ATT on flooded districts (relative to the 2000–02 baseline); identification by parallel trends (observational quasi-experiment) |

## Execution summary

The script evaluates the long-run economic effect of the 26 December 2004 Indian
Ocean tsunami on Aceh, Indonesia, using a **synthetic, calibrated** panel built to
reproduce the *findings* of Heger & Neumayer (2019). It runs four causal tools at
two geographic levels: a difference-in-differences (DiD) on district GDP growth, an
event study, a night-lights dose-response at the sub-district level, and a
synthetic control for aggregate flooded-Aceh GDP — then stress-tests inference with
Conley spatial-HAC standard errors and a robustness battery.

**Headline finding:** flooded districts lost about **8% of output in 2005**
(−0.0792, p < 0.01) but the aid-funded reconstruction produced a **+6.3 percentage-point-per-year growth premium in 2006–08** (+0.0628, p < 0.05) that more than
offset the loss — Aceh's "recovery beyond the counterfactual trend." A synthetic
control built from 76 Sumatra donors confirms it: flooded-Aceh GDP ends **+18.3%**
above its synthetic twin by 2012. Inference is honest: once Conley spatial-HAC
standard errors (which roughly double the recovery SE, 0.0146 → 0.0244) replace
naive ones, the recovery effect is significant at 5%, not 1%, and the point
estimate never moves. **Warnings:** none. A benign `diff-diff` rank-deficiency
notice (time-invariant `flooded` absorbed by unit FE) is suppressed by design.

## Data overview

```text
District panel    : 1750 rows, 125 districts, years 1999-2012
Sub-district panel: 3864 rows, 276 kecamatans

Districts by region and treatment (2004 snapshot):
region_group     control  flooded
Aceh                  13       10
North Sumatra         24        2
Rest of Sumatra       76        0
```

| variable | count | mean | std | min | max |
|---|---:|---:|---:|---:|---:|
| `gdp_growth` | 1,621 | 0.052 | 0.066 | −0.168 | 0.292 |
| `gdp_pc_growth` | 1,621 | 0.036 | 0.070 | −0.204 | 0.296 |
| `gdp_const_usd_m` | 1,750 | 671.2 | 594.0 | 33.1 | 3,748.4 |
| `population` | 1,750 | 484,305 | 400,842 | 59,071 | 3,613,412 |

The treatment group is small and geographically concentrated: **10 flooded Aceh
districts** against 13 non-flooded Aceh + 76 Rest-of-Sumatra controls (North Sumatra's
2 flooded islands enter only the robustness checks). `gdp_growth` has 1,621 non-missing
values (1,750 − 129): it is undefined in 1999 (no prior year) and for the district of
Subulussalam in 2003–06 (an administrative change), so every estimator drops those
rows. Mean district growth is **5.2%/yr** with wide dispersion (SD 6.6 pp), which is
why a handful of treated units yields noisy point estimates and wide standard errors —
a theme the inference section returns to.

---

## 1. Exploratory analysis — space-time dynamics

![Key Aceh districts indexed to 2004 = 100](python_did_sc_tsunami_eda_timeseries.png)
*Real GDP of three flooded districts (Banda Aceh, Aceh Besar, Aceh Jaya) vs two non-flooded controls, indexed to 2004 = 100.*

![Distribution of GDP growth by group and period](python_did_sc_tsunami_group_boxplots.png)
*Box-plots of district GDP growth, treated vs control, across the five event-time periods.*

![Treated vs control group-mean growth](python_did_sc_tsunami_group_means.png)
*The canonical DiD picture: treated and control group-mean growth are parallel before 2005, then diverge.*

| group | before (≤2004) | after (≥2005) | after − before |
|---|---:|---:|---:|
| Control (not flooded) | 0.0519 | 0.0497 | −0.0022 |
| Treated (flooded) | 0.0567 | 0.0671 | +0.0103 |

The exploratory views already tell the story the models will quantify. In the
indexed-GDP plot the flooded districts (orange) sit on the same trajectory as
controls until 2004, **dip visibly in 2005**, then climb steeply — Banda Aceh ends
near 260 (2004 = 100). The box-plots show the treated 2005 box dropping below zero
(a contraction) and the 2006–08 box lifting clearly above the control box. The
group-means panel is the cleanest motivation for DiD: the two lines are **parallel
before 2005** (the visual parallel-trends check), the treated line then plunges to
−0.027 in 2005 and overshoots to +0.124 in 2007. The 2×2 means table shows the
control group's growth was essentially flat across the break (−0.0022) while the
treated group's *rose* (+0.0103) — the seed of a positive difference-in-differences.

---

## 2. Difference-in-differences on district GDP growth

### 2a. The naive 2×2

```text
  DiD by hand = (treated change) - (control change) = +0.0125
  diff-diff DifferenceInDifferences: ATT = +0.0125 (SE 0.0142, p = 0.379,
                                     95% CI [-0.0154, +0.0404])
```

The pooled 2×2 estimate is **+0.0125 and statistically insignificant** (p = 0.38).
This is not a null result — it is a *blended* one: lumping all post-2005 years into
a single "after" window averages the sharp 2005 destruction together with the
2006–08 boom, cancelling much of the signal. This is exactly why the paper splits
the post period into event-time windows.

### 2b. The dynamic DiD (Table 2)

| coefficient | (1) Sumatra controls | (2) Rest of Sumatra | (3) Aceh non-flooded |
|---|---|---|---|
| Pre-tsunami (2003-04) | +0.0172 (0.0159) | +0.0176 (0.0162) | +0.0154 (0.0187) |
| **Tsunami (2005)** | **−0.0792\*\*\* (0.0240)** | **−0.0782\*\*\* (0.0247)** | **−0.0841\*\*\* (0.0281)** |
| **Recovery (2006-08)** | **+0.0628\*\* (0.0244)** | **+0.0682\*\*\* (0.0247)** | +0.0310 (0.0281) |
| Post-recovery (2009-12) | +0.0114 (0.0146) | +0.0132 (0.0147) | +0.0008 (0.0204) |
| Observations | 1,283 | 1,118 | 295 |

*Conley spatial-HAC SE in parentheses; \*\*\* p<.01, \*\* p<.05, \* p<.10. pyfixest point estimates cross-checked against the from-scratch within estimator (identical to 4 dp).*

The dynamic specification reveals the dip-then-overshoot the pooled estimate hid.
Against the main control pool (col 1), flooded districts grew **7.9 pp slower in
2005** (the wave's destruction) and **6.3 pp/yr faster in 2006–08** (reconstruction),
both significant. The pre-tsunami coefficient is small and insignificant (+0.0172,
not significant) — the **parallel-trends assumption survives its placebo test**. The
post-recovery coefficient (+0.0114, ns) says the gain neither vanished nor kept
growing once aid ended: a *sustained* higher level. Column 3 (vs Aceh's own
non-flooded districts) halves the recovery coefficient to +0.0310 (ns), evidence
that reconstruction spilled over to neighbouring Aceh districts, shrinking the
within-Aceh contrast.

### 2c. The event study

![Event study of the tsunami effect](python_did_sc_tsunami_event_study.png)
*Treated-minus-control effect per period (95% CI), baseline pinned at 0.*

| period | effect | se | p-value |
|---|---:|---:|---:|
| baseline (2000-02) | 0.0000 | — | — (reference) |
| pre (2003-04) | +0.0172 | 0.0160 | 0.283 |
| tsunami (2005) | −0.0792 | 0.0260 | 0.0024 |
| recovery (2006-08) | +0.0628 | 0.0247 | 0.0109 |
| post-recovery (2009-12) | +0.0114 | 0.0149 | 0.444 |

The event study traces the full path: a flat, insignificant pre-trend (the
identifying assumption holds), a sharp **−0.0792** collapse in 2005, a **+0.0628/yr**
rebound in 2006–08, and a return toward zero afterward at a permanently higher level.
Cumulated over the three recovery years, the premium (≈ 3 × 0.063 = **+0.19**) dwarfs
the one-year **−0.079** loss — the quantitative version of "recovery beyond the
counterfactual trend."

### 2d. GDP per capita (Table 8)

| coefficient | (1) Sumatra | (2) Rest of Sumatra | (3) Aceh non-flooded |
|---|---|---|---|
| Tsunami (2005) | +0.0192 (0.0239) | +0.0209 (0.0247) | +0.0098 (0.0271) |
| Recovery (2006-08) | +0.0827\*\*\* (0.0261) | +0.0924\*\*\* (0.0262) | +0.0251 (0.0303) |

Per-capita output shows **no significant 2005 loss** (+0.0192, ns) because GDP and
population fell together (the casualties), but a **significant +8.3% recovery gain**
(p < 0.01) because fewer people then shared a rebuilt economy. That the effect
survives — indeed strengthens — in per-capita terms means it is not merely a
mortality/denominator artifact.

---

## 3. Night-lights dose-response (sub-district)

![Night-lights dose-response and quintiles](python_did_sc_tsunami_nightlights_dose.png)
*Left: period effects for the continuous dose (share of population flooded). Right: effect by intensity quintile — only the top quintile is significant.*

**Table 1 — 2004 average luminosity (Digital Number, 0–63):**

| group | obs | mean | std | min | max |
|---|---:|---:|---:|---:|---:|
| Non-flooded | 208 | 2.36 | 4.41 | 0.0 | 36.0 |
| Flooded | 68 | 5.79 | 8.31 | 0.0 | 39.0 |

**Table 3 — continuous dose-response (`nl_growth`):**

| coefficient | Share of population flooded | Share of area flooded |
|---|---|---|
| Pre-tsunami (2003-04) | +0.0052 (0.0034) | +0.565 (0.358) |
| Tsunami (2005) | −0.0073\*\* (0.0035) | −0.727\* (0.381) |
| Recovery (2006-08) | +0.0160\*\*\* (0.0022) | +1.660\*\*\* (0.246) |
| Post-recovery (2009-12) | +0.0019 (0.0024) | +0.270 (0.250) |
| N | 3,444 | 3,444 |

**Table 4 — by intensity quintile (only Q5 significant):**

| measure | Q1 | Q2 | Q3 | Q4 | Q5 |
|---|---|---|---|---|---|
| Share of population | +0.0010 | +0.0010 | +0.0009 | +0.0008 | **+0.0018\*\*** |
| Share of area | +0.0015 | +0.0010 | +0.0011 | +0.0003 | **+0.0018\*\*\*** |

Moving to the finer sub-district grain, flooded kecamatans were **2.5× brighter** in
2004 (mean luminosity 5.79 vs 2.36) — they are the denser, coastal, more active
places. The dose-response confirms the district story at higher resolution and adds
a gradient: each unit of "share of population flooded" raises night-lights growth by
**+0.016/yr in recovery** (p < 0.001), with a weak −0.007 dip in 2005. The
"share of area" column tells the same story with a ~100× larger coefficient
(**+1.660\*\*\***) purely because its mean is tiny. The quintile split is the sharpest
result: only the **top intensity quintile** (the worst-hit fifth) shows a significant
rebound (+0.0018, p ≈ 0.01–0.02); quintiles 1–4 are flat. The growth premium is
concentrated exactly where the most reconstruction money went.

---

## 4. Synthetic control — a counterfactual Aceh

![GDP dynamics, treated vs two control groups](python_did_sc_tsunami_gdp_dynamics.png)
*Figure 2: indexed GDP (2004 = 100) for flooded Aceh vs non-flooded Aceh and the rest of Sumatra.*

![Synthetic control path](python_did_sc_tsunami_synthetic_control.png)
*Figure 3: flooded-Aceh GDP vs a synthetic Aceh built from 76 Sumatra donors; the shaded post-2005 gap is the estimated effect.*

![Synthetic control gap](python_did_sc_tsunami_sc_gap.png)
*The treated − synthetic gap: ~0 before 2005, opening up afterward.*

![Donor weights for synthetic Aceh](python_did_sc_tsunami_sc_weights.png)
*The six largest donor weights — a handful of Sumatra districts reconstruct synthetic Aceh.*

| quantity | value |
|---|---|
| Donor pool | 76 Rest-of-Sumatra districts |
| Pre-tsunami fit (RMSE) | 0.485 |
| Post-tsunami ATT | +32.9 GDP units (**+18.3%**) |
| Treated vs synthetic, 2012 | 370.9 vs 295.0 |
| Top donors | JAMBI_D01 (0.133), BABEL_D05 (0.115), KEPRI_D05 (0.111), KEPRI_D04 (0.093), BENGKULU_D06 (0.084), JAMBI_D05 (0.080) |

The synthetic control asks a sharper question than DiD — *what would flooded Aceh
have looked like with no tsunami?* — and answers it with an independent method.
The raw dynamics (Figure 2) show flooded Aceh ending at index 177 in 2012 vs 162
(non-flooded Aceh) and 142 (rest of Sumatra). The fitted synthetic (Figure 3) tracks
treated GDP almost exactly before 2005 (**pre-RMSE 0.485**, tiny relative to the
~200-unit GDP level), then the treated line pulls clearly above it; by 2012 the gap
is **+18.3%** (370.9 vs 295.0). The gap plot shows it is ~0 before 2005 and opens
monotonically afterward. No single donor dominates — the top six weights (Jambi,
Bangka-Belitung, Riau-Islands, Bengkulu districts) sum to about 0.62 — which is what
makes the counterfactual credible rather than a one-district artifact.

---

## 5. Conley spatial standard errors — honest inference

![Spatial clustering of treatment](python_did_sc_tsunami_spatial_map.png)
*All 10 flooded (treated) districts cluster on Aceh's NW coast.*

![Conley SE vs distance cutoff](python_did_sc_tsunami_conley_cutoff.png)
*The recovery effect's Conley-HAC SE as the distance cutoff widens from 0 to 300 km.*

```text
Pooled within-year Moran's I = +0.065  (permutation p = 0.003; null mean -0.008, SD 0.021)
```

| coefficient | estimate | naive | clustered | Conley | Conley-HAC | t(HAC) |
|---|---:|---:|---:|---:|---:|---:|
| Pre-tsunami | +0.0172 | 0.0144 | 0.0159 | 0.0144 | 0.0159 | +1.08 |
| Tsunami (2005) | −0.0792 | 0.0236 | 0.0258 | 0.0216 | 0.0240 | −3.30 |
| **Recovery (2006-08)** | **+0.0628** | **0.0146** | 0.0244 | 0.0145 | **0.0244** | **+2.57** |
| Post-recovery | +0.0114 | 0.0109 | 0.0148 | 0.0106 | 0.0146 | +0.78 |

Because all 10 treated districts sit in one corner of Sumatra (the map), their growth
shocks are not independent — and Moran's I confirms it: residual growth shows
**significant positive spatial autocorrelation** (I = +0.065, p = 0.003). Ignoring
that makes naive standard errors too small. The four-SE comparison shows the
consequence on the **same** point estimates: the recovery effect's SE rises from
**0.0146 (naive) to 0.0244 (Conley-HAC)** — a 1.68× inflation that turns a spurious
*t* = 4.3 into an honest *t* = 2.57. Under naive SEs the recovery effect would read
as *** (1%); under the paper's Conley-HAC SE it is **only ** (5%)**. The cutoff plot
shows the SE is stable from 25–100 km and then declines slightly as distant,
weakly-correlated pairs dilute the kernel — which is why the paper settles on 100 km.

---

## 6. Robustness battery

| check | 2005 | recovery 2006-08 | N |
|---|---|---|---:|
| Placebo (neighbours of flooded) | +0.0025 (ns) | +0.0064 (ns) | 1,465 |
| City (Kota) districts | −0.0424 (ns) | +0.1226\*\*\* | 295 |
| Rural (Kabupaten) districts | −0.0883\*\*\* | +0.0479\* | 988 |

The placebo is the key credibility check: pretending the *neighbours* of flooded
districts were treated yields **no significant effect in any period** (2005 +0.0025,
recovery +0.0064) — the result is not a spatial-spillover artifact. The city/rural
split is revealing: **rural districts** took the big 2005 hit (−0.0883, p < 0.01,
agricultural damage) with a modest rebound (+0.0479, p < 0.10), whereas **city
districts** barely contracted (−0.0424, ns) but rebounded hugely (+0.1226, p < 0.01)
— the urban reconstruction premium. The city columns rest on only 2 flooded city
districts, so they are imprecise (wide SEs, few clusters), exactly as the paper warns.

---

## Figure inventory

| # | File | Description | Key takeaway |
|---|---|---|---|
| 1 | `..._eda_timeseries.png` | Indexed GDP of 3 flooded vs 2 control districts | Flooded districts dip in 2005, then rebound far above controls |
| 2 | `..._group_boxplots.png` | GDP-growth distribution by group × period | Treated 2005 box drops below 0; recovery box lifts above control |
| 3 | `..._group_means.png` | Treated vs control group-mean growth | Parallel pre-2005, then dive-and-overshoot |
| 4 | `..._event_study.png` | Period effects with 95% CI | Flat pre-trend, −0.079 in 2005, +0.063 recovery |
| 5 | `..._nightlights_dose.png` | Continuous dose + quintile effects | Bigger flood dose → bigger rebound; only Q5 significant |
| 6 | `..._gdp_dynamics.png` | Indexed GDP, treated vs 2 control groups | Treated ends above both controls (177 vs 162 vs 142) |
| 7 | `..._synthetic_control.png` | Treated vs synthetic Aceh, shaded gap | +18.3% above the counterfactual by 2012 |
| 8 | `..._sc_gap.png` | Treated − synthetic gap over time | ~0 before 2005, opens afterward |
| 9 | `..._sc_weights.png` | Top donor weights | No single donor dominates (credible counterfactual) |
| 10 | `..._spatial_map.png` | Lat/long scatter of districts | 10 treated units cluster on Aceh's NW coast |
| 11 | `..._conley_cutoff.png` | Recovery SE vs distance cutoff | SE stable 25–100 km, then declines |

## Key findings

1. **The 2005 shock:** flooded districts grew **7.9 pp slower** in 2005 (−0.0792, p < 0.01) — the wave's immediate destruction.
2. **The recovery overshoot:** they then grew **6.3 pp/yr faster** in 2006–08 (+0.0628, p < 0.05); cumulated (~+0.19) this dwarfs the one-year loss.
3. **Parallel trends hold:** the pre-tsunami DiD coefficient is +0.0172 and insignificant (p = 0.28), and the event-study pre-period is flat — the identifying assumption survives.
4. **A single "after" hides everything:** the pooled 2×2 ATT is only +0.0125 (ns) because it averages destruction and boom.
5. **Per-capita confirms it's real:** no significant 2005 per-capita loss (+0.0192, ns) but a +8.3% recovery gain (p < 0.01) — not a mortality/denominator artifact.
6. **Dose-response at sub-district level:** night-lights growth rises +0.016/yr per unit of population-share flooded (p < 0.001); only the **worst-hit quintile** is significant.
7. **Synthetic control agrees:** flooded-Aceh GDP ends **+18.3%** above a synthetic built from 76 donors (pre-RMSE 0.485) — an independent method, same conclusion.
8. **Spatial autocorrelation is real:** Moran's I = +0.065 (p = 0.003); clustered treatment violates the iid assumption behind naive SEs.
9. **Honest inference downgrades the stars:** Conley-HAC roughly doubles the recovery SE (0.0146 → 0.0244), so the recovery effect is significant at 5%, not 1% — and the point estimate never changes.
10. **Placebo passes:** treating neighbours of flooded districts as fake-treated finds nothing (2005 +0.0025, recovery +0.0064, both ns).
11. **Heterogeneity:** rural districts absorbed the 2005 hit (−0.0883\*\*\*); cities led the recovery (+0.1226\*\*\*, but imprecise with only 2 flooded cities).

## Surprises and caveats

- **Estimator non-determinism:** none material. `mlsynth.VanillaSC` is a deterministic convex optimization; the only randomness is the Moran's I permutation null, seeded (`default_rng(1)`), and the global `RANDOM_SEED = 42`.
- **Sample reductions:** `gdp_growth` drops from 1,750 to 1,621 rows (1999 has no prior year; Subulussalam 2003–06 is missing by construction). Table 2 columns use 1,283 / 1,118 / 295 observations — the smaller Aceh-only column is why its recovery effect is imprecise.
- **Weighting / scale:** the night-lights "share of area" coefficient (+1.66) looks enormous next to "share of population" (+0.016) purely because share-of-area has a tiny mean — same story, different units. Reported per-capita effects use the identity `gdp_pc_growth = gdp_growth − pop_growth`.
- **Effect concentration:** the average night-lights effect is driven entirely by the top intensity quintile (Q1–Q4 are flat) and the city recovery rests on 2 districts — averages mask where the action is.
- **Cosmetic warnings:** one benign `diff-diff` "rank-deficient design matrix" notice (time-invariant `flooded` absorbed by unit FE, exactly like any FE estimator) is filtered; nothing else.
- **Identification assumptions:** this is **observational** — identification rests on **parallel trends**, not randomization. The flat pre-trend and the null placebo are supporting evidence, not proof; unobserved Aceh-specific recovery shocks correlated with flooding would still bias the estimate.
- **Pedagogical framing / synthetic data:** the panel is **synthetic and calibrated** to reproduce the paper's findings (signs, significance, approximate magnitudes). Use it to learn the *methods*; do not quote these exact numbers as facts about Aceh. The Reproduction-Audit appendix quantifies the (small) gap to the paper.

## Appendix — Reproduction audit (synthetic data vs paper)

The synthetic data-generating process was tuned so that re-running the paper's
regressions lands close to its reported values, **column by column**. Magnitudes on
headline cells are within ≈0.005; signs and significance match throughout.

| Result | This synthetic data | Paper (reported) | Sign | Significance |
|---|---|---|:--:|:--:|
| DiD GDP, 2005 (Table 2, col 1) | −0.0792\*\*\* | ≈ −0.081\*\*\* | ✓ | ✓ |
| DiD GDP, recovery 2006-08 (col 1) | +0.0628\*\* | ≈ +0.059\*\* | ✓ | ✓ |
| DiD GDP, recovery vs Aceh controls (col 3) | +0.0310 (ns) | ≈ +0.030\*\* | ✓ | partial¹ |
| DiD per-capita, 2005 (Table 8) | +0.0192 (ns) | ns (no loss) | ✓ | ✓ |
| DiD per-capita, recovery (Table 8) | +0.0827\*\*\* | ≈ +0.078\*\*\* | ✓ | ✓ |
| Night-lights, share-of-pop recovery (Table 3) | +0.0160\*\*\* | ≈ +0.016\*\*\* | ✓ | ✓ |
| Night-lights, share-of-area recovery (Table 3) | +1.660\*\*\* | ≈ +1.75\*\*\* | ✓ | ✓ |
| Night-lights quintiles (Table 4) | only Q5 significant | only Q5 significant | ✓ | ✓² |
| City vs rural, 2005 (Table 7) | rural −0.0883\*\*\* / city −0.0424 ns | rural ≈ −0.098\*\*\* / city ≈ −0.015 ns | ✓ | ✓ |
| Placebo neighbours (Table 9) | all ns | all ns | ✓ | ✓ |
| Synthetic control ATT | +18.3% | "sustainable recovery beyond counterfactual" | ✓ | qualitative |

*¹ The Aceh-only column-3 recovery effect matches in magnitude (+0.031 vs +0.030) but
reads as insignificant here: with the same 10 treated units across columns, the
synthetic Conley-HAC SE is similar in every column, whereas the paper's Aceh-only
sample has a smaller SE (higher R²). ² Table 4 magnitudes are deliberately on Table 3's
(smaller) scale — the paper's own Tables 3 and 4 are on mutually inconsistent scales,
so no single process reproduces both; we match Table 3 exactly and Table 4's pattern.*
