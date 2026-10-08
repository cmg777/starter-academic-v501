# Results Report — Covariates in Difference-in-Differences: the LaLonde Test in Python

| | |
|---|---|
| **Script** | `script.py` |
| **Execution date** | 2026-07-17 |
| **Language / runtime** | Python 3.13.12 (uv `.venv`) |
| **Key packages** | pyfixest 0.60.0, diff-diff 3.7.0, statsmodels 0.14.6, causaldata, numpy 2.5.1, pandas 3.0.3 |
| **Seed** | 90210 (matches Scott Cunningham's `set seed 90210`); 199 bootstrap reps |
| **Source replicated** | Cunningham (2026), *Covariates, diff in diff and LaLonde test* (Scott's Mixtape Substack) |

---

## 1. Execution summary

The script reproduces Scott Cunningham's "LaLonde test" in Python: it estimates the average treatment effect on the treated (ATT) of the National Supported Work (NSW) job-training program eight different ways on a non-experimental panel (185 NSW trainees + 15,992 CPS controls, pre = 1975, post = 1978), and compares each estimate to the experimental benchmark of **\$1,794**. The script ran cleanly (exit 0), with **0 failed bootstrap draws**, and produced 5 figures, a results CSV/markdown table, and a JSON payload for the web app.

The headline result is a clean, dollar-accurate replication of the reference. Three specifications that keep covariates **out of the counterfactual trend** — no covariates, additive covariates, and covariate×treatment interactions — all return the naive **\$3,621** (roughly twice the truth). The moment covariates are allowed to enter the trend (X×post, then first-difference saturation), the estimate snaps to the benchmark: **\$1,711**, **\$1,770**. Propensity-based estimators land nearby: IPW **\$1,861**, doubly robust **\$1,993**.

## 2. Data overview

- **Non-experimental sample:** 16,177 units (185 NSW treated, 15,992 CPS controls), reconstructed from the `causaldata` package (`nsw_mixtape` is already the Dehejia-Wahba subsample of 185 treated + 260 experimental controls; `cps_mixtape` supplies the 15,992 CPS controls). Expanding to a 2-period panel (post=0 → `re75`, post=1 → `re78`) gives 32,354 rows.
- **Covariates (`X`):** `age, agesq, agecube, educ, educsq, marr, nodegree, black, hisp, re74, u74` — Scott's canonical LaLonde set (has an age cube; `u74 = 1[re74 == 0]`).
- **Cell counts** (`ever_treated` × `post`): 185 treated and 15,992 controls in **each** period — a balanced 2-period panel.
- **Experimental benchmark:** on the 445-row experimental sample, `re78 ~ treat` gives the canonical Dehejia-Wahba cross-sectional ATT of **\$1,794** (SE \$671). (The experimental *DiD* form `Δre ~ treat` gives \$1,529, reflecting pre-treatment earnings differences; the cross-sectional \$1,794 is the standard published number and the target used for the benchmark line.)

## 3. Method results

### 3.1 Covariate imbalance (motivation)

![Covariate imbalance](did_covariates_lalonde_balance.png)

Standardized mean differences (SMD) between the 185 trainees and each control group reveal *why* the naive DiD is wrong. Against the **CPS** controls the imbalance is enormous — SMD of **+2.3** on `black`, **−1.6** on 1974/1975 earnings, **−1.3** on `married` — whereas against the **experimental** controls every SMD hugs zero. The CPS is a representative slice of America; the trainees are disadvantaged workers. When groups this different are on different earnings trends, conditional parallel trends fails, and that is the crack the covariates must fill.

### 3.2 Raw earnings trends

![Earnings trends](did_covariates_lalonde_trends.png)

The CPS control sits far above the trainees (\$14,017 in 1974 vs \$2,096) and drifts mildly upward, while the trainees and experimental controls start near \$1,300–2,100 and rise together into 1978. The randomized control tracks the trainees' pre-period path; the CPS control does not. A DiD that assumes the CPS and the trainees share a common counterfactual trend is therefore misspecified from the start.

### 3.3 The eight specifications

```text
Spec Estimator                           ATT      SE   class
--------------------------------------------------------------
0    No covariates (naive TWFE)        3,621     632   inert
A    Additive X (level)                3,621     672   inert
BT   X x treatment (effect)            3,621     652   inert
B    X x post (trend)                  1,711     704   corrected
C    Saturated FD = HIT                1,770     701   corrected
-    HIT by hand (1997)                1,770     701   corrected
-    IPW (Abadie 2005)                 1,861     816   propensity
-    DR (Sant'Anna-Zhao 2020)          1,993     794   propensity
--------------------------------------------------------------
     RCT benchmark (target)            1,794
```

| Spec | Estimator | ATT | SE | 95% CI | Class |
|---|---|---|---|---|---|
| 0 | No covariates (naive TWFE) | \$3,621 | 632 | [2,382, 4,860] | inert |
| A | Additive X (level) | \$3,621 | 672 | [2,305, 4,938] | inert |
| BT | X × treatment (effect) | \$3,621 | 652 | [2,343, 4,899] | inert |
| B | X × post (trend) | \$1,711 | 704 | [331, 3,092] | corrected |
| C | Saturated FD = HIT | \$1,770 | 701 | [396, 3,144] | corrected |
| — | HIT by hand (1997) | \$1,770 | 701 | [396, 3,144] | corrected |
| — | IPW (Abadie 2005) | \$1,861 | 816 | [261, 3,461] | propensity |
| — | DR (Sant'Anna-Zhao 2020) | \$1,993 | 794 | [436, 3,550] | propensity |
| — | **RCT benchmark** | **\$1,794** | 671 | | benchmark |

The **inert trio** (0, A, BT) is identical to the dollar at \$3,621. Adding time-invariant covariates additively (Spec A) cannot move a two-way-fixed-effects DiD — the within transformation deletes them and the DiD coefficient never depended on them. Interacting covariates with treatment (Spec BT) relaxes constant treatment effects but leaves the control group's counterfactual trend untouched, so it too returns \$3,621. Only when a covariate multiplies `post` (Spec B: \$1,711) or the first-differenced outcome is saturated on `D×X` (Spec C: \$1,770) does the estimate collapse onto the benchmark.

### 3.4 The forest plot (the payoff)

![Forest plot](did_covariates_lalonde_forest.png)

The whole argument in one image: the three grey (inert) estimators cluster at \$3,621; the blue (trend-corrected) and teal (propensity) estimators cluster around the crimson \$1,794 line. Grouping is the thesis — covariates are not a robustness knob, they are a correction, and only certain placements deliver it.

### 3.5 The spec ladder

![Spec ladder](did_covariates_lalonde_ladder.png)

Ordered as an argument, the ATT is flat at \$3,621 across the first three specs, then drops sharply to \$1,711 the instant covariates enter the trend and stays near the benchmark thereafter. The "cliff" between X×treatment and X×post is the single most important visual in the post.

### 3.6 diff-diff package cross-check

![Cross-check](did_covariates_lalonde_crosscheck.png)

```text
naive 2x2      by pyfixest $3,621  vs diff-diff $3,621
additive X     by pyfixest $3,621  vs diff-diff $3,621
doubly robust  by hand   $1,993    vs diff-diff CS $1,979
```

The `diff-diff` package agrees exactly on the naive and additive 2×2 (\$3,621 vs \$3,621) and lands within **\$14** of the by-hand doubly-robust estimate (\$1,993 vs Callaway-Sant'Anna \$1,979) — the small gap is the expected consequence of differing propensity/weight-normalization internals, exactly the caveat the reference makes about the DRDID package.

## 4. Figure inventory

| Filename | Description | Key takeaway |
|---|---|---|
| `did_covariates_lalonde_balance.png` | SMD of each covariate, treated vs CPS vs experimental controls | CPS controls are wildly imbalanced (Black +2.3); RCT controls are not |
| `did_covariates_lalonde_trends.png` | Mean earnings 1974/75/78 by group | CPS control is on a different level and slope than the trainees |
| `did_covariates_lalonde_forest.png` | 8 estimators + 95% CI vs the \$1,794 line | Inert trio at \$3,621; corrected/propensity cluster at the benchmark |
| `did_covariates_lalonde_ladder.png` | ATT across the ordered spec sequence | The estimate "snaps" to the benchmark only once covariates touch the trend |
| `did_covariates_lalonde_crosscheck.png` | By-hand vs diff-diff package | Independent package validation of the hand-coded estimators |

## 5. Key findings

1. **The reconstruction reproduces the reference to the dollar.** Spec 0 = \$3,621.2, matching Scott's Stata \$3,621 exactly, confirming the `causaldata` sample is the same Dehejia-Wahba subsample.
2. **Additive covariates are inert in TWFE.** Spec A = \$3,621.2, identical to Spec 0 — time-invariant controls cannot move a two-way-fixed-effects DiD.
3. **Level saturation is also inert.** Spec BT (X×treatment) = \$3,621.2 — relaxing constant treatment effects does nothing for conditional parallel trends.
4. **Trend interaction corrects the estimate.** Spec B (X×post) = \$1,711.1, an \$82.9 miss below the benchmark and a \$1,910 move from the naive number.
5. **First-difference saturation does two jobs at once.** Spec C = \$1,770.0 (only \$24 from the benchmark) and is numerically identical to the hand-built Heckman-Ichimura-Todd (1997) estimator (\$1,770.0), confirming the outcome-regression equivalence.
6. **Propensity methods land nearby.** IPW (Abadie 2005) = \$1,861.0 (+\$67); doubly robust (Sant'Anna-Zhao 2020) = \$1,993.2 (+\$199).
7. **The package agrees.** diff-diff matches the naive/additive numbers exactly and the DR estimate within \$14.
8. **The correction is real but uncertain.** Every corrected estimate's 95% CI (e.g., Spec C [396, 3,144]) contains \$1,794, but so is the benchmark itself estimated imprecisely (SE \$671) — stability across specifications, not any single dollar figure, is the trustworthy signal.
9. **Bootstrap was clean.** All 199 id-cluster resamples converged (0 failed propensity logits), so the reported SEs for BT/C/HIT/IPW/DR rest on the full replication set.

## 6. Surprises and caveats

- **Non-determinism:** point estimates are deterministic; only the bootstrap SEs depend on the seed (fixed at 90210). Re-running reproduces the table exactly.
- **Sample construction, not a prebuilt file:** we rebuild the panel from `causaldata` rather than loading Scott's `lalonde_nonexp_panel.dta`. It nonetheless matches to the dollar because `nsw_mixtape` *is* the Dehejia-Wahba subsample.
- **Benchmark definition:** the \$1,794 line is the experimental **cross-sectional** ATT (`re78 ~ treat`). The experimental DiD form is \$1,529; we report both and use the standard published \$1,794 for the benchmark line.
- **SE source for IPW/DR:** the reference used DRDID's analytic SEs in its forest plot; we substitute id-cluster bootstrap SEs (199 reps, seed 90210). This is annotated and is the only intentional deviation.
- **Package internals differ:** diff-diff's Callaway-Sant'Anna DR (\$1,979) differs from the by-hand DR (\$1,993) by \$14 due to propensity/weight-normalization defaults — expected, not an error.
- **Wide confidence intervals:** with only 185 treated units and heavy CPS imbalance, all CIs are wide; the post should foreground stability-across-specs rather than treating \$1,770 vs \$1,711 as a meaningful ranking (Diamond's comment on the original post).
- **Pedagogical framing:** the estimand is the **ATT** throughout, in an **observational** (non-experimental) design; the \$1,794 target is known only because a paired RCT exists — the luxury that makes LaLonde "the gift that keeps on giving."

## 7. Appendix — reproduction audit vs Cunningham (2026)

| Estimator | Scott (Stata/R) | This script (Python) | Match |
|---|---|---|---|
| Spec 0 naive | 3,621 | 3,621.2 | exact |
| Spec A additive | 3,621 | 3,621.2 | exact |
| Spec BT X×treatment | 3,621 | 3,621.2 | exact |
| Spec B X×post | 1,711 | 1,711.1 | exact |
| Spec C saturated = HIT | 1,770 | 1,770.0 | exact |
| HIT by hand | 1,770 | 1,770.0 | exact |
| IPW (Abadie 2005) | 1,861 | 1,861.0 | exact |
| DR (Sant'Anna-Zhao 2020) | 1,993 | 1,993.2 | exact |
| RCT benchmark | 1,794 | 1,794.3 | exact |

All eight estimators and the benchmark reproduce Scott's reported figures to the dollar. The Python port is faithful; the only methodological substitution is bootstrap (vs DRDID analytic) standard errors for the propensity-based rows.
