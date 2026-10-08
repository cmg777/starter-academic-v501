# Results report — `python_sc_bayes_spatial`

**Script:** `analysis.py`
**Log:** `execution_log.txt` (446 lines, cold run)
**Run date:** 2026-08-04
**Environment:** Python 3.13.11 (x86_64, darwin) · scspill 0.2.1 · mlsynth 1.0.0 @ `15f168bb9048` · numpy 2.3.5 · pandas 3.0.1 · scipy 1.17.1 · matplotlib 3.10.8 · numba 0.62.1 · numpyro 0.19.0
**Backend:** requested `auto`, resolved **numba**. BLAS pinned to 1 thread; `JAX_ENABLE_X64=1`.
**Seed:** 20251022 (the R edition's seed, so the two are comparable)
**MCMC:** `m_iter = 500,000`, `burn = 250,000`, `max_effect_draws = 5,000`

## Execution summary

Exit status **0**. All **18 assertions passed**. 19 figures and 23 tables written.

Runtime, cold: roughly 60 minutes, dominated by three fits —
`SPILLSYNTH(sar)` at the headline budget inside the benchmark sweep (994 s),
the same estimator as the standalone cross-check (1,094 s), and the R-spec
headline fit (145 s). The corrected `scspill` headline fit is only 116 s
because it runs on the numba backend; `mlsynth`'s port is pure numpy. Warm
re-run: under 60 seconds.

**Warnings raised during the run:**

- `[WARN] ESS(rho) < 100` did **not** fire at the headline budget (ESS = 136.8). It fires at every smaller budget in section 14.
- No estimator errored. No benchmark row was skipped (`BENCH_TIER=full`).
- `prior_sensitivity` runs the *simplified* Step-2 kernel, so its ρ level is not comparable to the headline; the script prints this explicitly rather than letting the numbers be misread.

## Data overview

`scspill.data.load_california()` — the Abadie, Diamond & Hainmueller (2010)
Proposition 99 panel as exported from the `scspill` replication package.

| Property | Value |
|---|---|
| Rows × columns | 1,209 × 6 |
| Units | 39 states (California treated, 38 donors) |
| Period | 1970–2000 (31 years, balanced) |
| Pre / post | T₀ = 18, T₁ = 13 |
| Outcome | `cigsale`, packs per capita per year |
| Covariate | `retprice`, cents per pack |
| Missing values | 0 |
| Treated rows | 13 |

The shipped `treated` column was rebuilt from the stated rule and asserted
equal: `treated == (state == "California") & (year >= 1988)`. **1988, not
1989** — the replication package's convention, not the ADH one.

**Spatial structure.** `spatial_W` is 38 × 38 rook contiguity among donors
(symmetric, zero diagonal, degree 1–8, mean 3.95). `spatial_w` is each donor's
contiguity with California and has **exactly one non-zero entry: Nevada**.
Oregon and Arizona border California but are outside the donor pool. The
row-normalised W has a largest eigenvalue of exactly 1, so the sampler confines
ρ to |ρ| < 0.95.

## Method results

### Stage 1 — classical simplex synthetic control (`mlsynth.VanillaSC`)

```text
ATT                -18.4277 packs per capita per year
pre-treatment RMSE 1.5998   R^2 0.9735
weights sum        1.000000   active donors (>1e-4): 5
   Utah             0.3430
   Montana          0.2545
   Nevada           0.2423
   Connecticut      0.1457
   New Hampshire    0.0144
top-4 share        0.9856
bootstrap 95% CI   [-22.0784, -14.2954]  (2000 replicates)
```

Source: `stage1_weights.csv`, `stage1_gap.csv`. Figures 03, 04.

The estimate lands **0.032 packs** from the R edition's −18.46, which used
`tidysynth` and a different optimiser. The donor sets agree on four of five
states and on their ordering by magnitude; the fifth differs (New Hampshire
0.014 here, Idaho 0.005 there), which is within the noise of a constrained
optimiser at that scale. Pre-treatment RMSE of 1.60 against a pre-period mean
of 117.7 packs is a relative error of 1.4%.

**Nevada carries a weight of 0.242.** The one donor with a specific reason to
be suspected of contamination is carrying nearly a quarter of the
counterfactual — which is the entire motivation for Stage 3.

### Stage 2a — Bayesian synthetic control (`mlsynth.BSCM`, horseshoe)

```text
ATT             -18.8469  95% CrI [-26.4568, -9.9884]
pre-treatment RMSE 0.0514
weights sum     0.7576   active donors (|w|>0.01): 26
intercept       beta0 posterior mean = 16.8619
top donors: Tennessee -0.3406  Nevada +0.1922  Connecticut +0.1892
            West Virginia +0.1645  Montana +0.1324  Illinois +0.0704
[spike-and-slab] ATT -19.2441  [-33.2313, -2.9273]; 4 donors with P(gamma)>0.5
```

Source: `stage2_bscm_posterior.csv`. Figure 05.

The active donor pool goes from 5 to 26 and the weights no longer sum to one.
The pre-treatment RMSE collapses to 0.051 — a factor of 31 better than the
simplex — which is what removing a binding constraint buys, and is also a
warning that this fit is much closer to interpolation.

### Stage 2b — the ρ = 0 case, read off the Stage-3 fit

```text
ATT at rho = 0  -15.6816
ATT at rho-hat  -16.8680   (difference -1.1863)
```

Source: `stage2_comparison.csv`. Figure 06.

`SCSPILLConfig` has no `rho` field — ρ is estimated, not set — but the model
collapses exactly to a Bayesian horseshoe SCM at ρ = 0, and that case is
exposed as `result.effects_detail.att_scm`. **Stage 2b therefore costs no
additional MCMC.**

| Method | ATT | Intercept | Weight sum | Active | R edition |
|---|---:|---:|---:|---:|---:|
| Classical SC (simplex) | −18.4277 | 0 | 1.0000 | 5 | −18.46 |
| Bayesian SC (BSCM) | −18.8469 | **16.8619** | 0.7576 | 26 | — |
| Bayesian SC (scspill, ρ = 0) | −15.6816 | 0 | 0.8852 | 25 | −15.84 |
| Bayesian spatial SC | −16.8680 | 0 | 0.8852 | 25 | −16.59 |

The two Bayesian synthetic controls disagree by **3.17 packs**, and the reason
is diagnosable rather than mysterious: BSCM (Kim, Lee & Gupta 2020) fits an
explicit intercept whose posterior mean is 16.86 packs, so its weights are not
constrained to sum to one and are not term-by-term comparable with scspill's α.
scspill's ρ = 0 case reproduces the R edition's Stage 2 to **0.158 packs**,
using entirely separate code — which identifies BSCM, not scspill, as the model
answering a different question.

### Stage 3 — Bayesian spatial synthetic control (`scspill`, `method="sar"`)

```text
configuration   m_iter=500,000  burn=250,000  beta_prior=horseshoe  p_factors=1
ATT             -16.8680  95% CrI [-23.0450, -10.3316]  (width 12.71)
ATT (plug-in)   -16.8023   effect draws used: 5,000
ATT at rho = 0  -15.6816
rho             0.3161  95% CrI [0.2312, 0.4032]
ESS(rho)        136.8   acceptance 0.444 (target 0.44)   final step 0.00506
rho support     |rho| < 0.9500
pre-treatment RMSE 0.1859
active donors (|alpha| > 0.01): 25
```

Source: `stage3_summary.csv`, `stage3_gap.csv`, `stage2_alpha_posterior.csv`.
Figures 07, 08, 09.

**The 95% credible interval for ρ excludes zero**, which is the formal
rejection of the restriction that would collapse Stage 3 back to Stage 2.
SUTVA on the donor pool is not merely doubtful in this application — it is
rejected by the model that nests it.

The per-parameter diagnostics table is the single most informative output of
the run:

| Parameter | Mean | SD | ESS | R̂ (split) | Geweke z |
|---|---:|---:|---:|---:|---:|
| ρ | 0.3161 | 0.0430 | **136.8** | 1.0154 | −0.570 |
| σ² | 61.5905 | 3.4887 | 204,095 | 1.0000 | −0.297 |
| α[Tennessee] | −0.2505 | 0.1675 | 10,195 | 1.0000 | −0.442 |
| α[Connecticut] | 0.2296 | 0.1672 | 11,799 | 1.0000 | 0.057 |
| α[Nevada] | 0.1997 | **0.0370** | 25,855 | 1.0000 | 1.292 |
| α[Montana] | 0.1289 | 0.1299 | 11,047 | 1.0001 | 1.232 |
| α[West Virginia] | 0.1253 | 0.0954 | 12,239 | 1.0000 | −0.757 |
| α[Illinois] | 0.1049 | 0.1159 | 14,970 | 1.0000 | −0.675 |

Every parameter in this model has an effective sample size in the thousands
except ρ, which has 137 — **from the same chain**. That is the weak
identification the whole third stage lives with, and it is confined to exactly
one scalar because the effects cancel β, the latent factors and the error
variances (section 9.3 of the post). Nevada's weight is also the most precisely
estimated of all the donors, with a standard deviation of 0.037 against
0.13–0.17 for the others.

### Spillovers

```text
spillover_panel = Yc - Yc(0); negative = donor sold FEWER packs
panel shape (31, 38); post-1988 rows 13

Nevada           -5.4995
Idaho            -0.4929
Utah             -0.4917
Wyoming          -0.0590
Montana          -0.0466
Colorado         -0.0311
South Dakota     -0.0067
North Dakota     -0.0061
```

Source: `stage3_spillover_effects.csv`, `stage3_spillover_panel.csv`. Figures
10, 11.

Nevada absorbs **11.2 times** the next-largest effect. Idaho and Utah — one
step further out on the contiguity graph — pick up about half a pack each, and
the third ring is indistinguishable from zero. The R edition reported Nevada
−3.75 and Idaho −0.228 at a much shorter chain and a different specification;
the ordering and the concentration are the same.

**The sign is the surprise.** The prior hypothesis was cross-border shopping
*raising* Nevada's sales. The estimate says they fell.

### R reconciliation

Source: `r_reconciliation.csv`, `scspill_departures.csv`. Figure 12.

| Specification | Iterations | ATT | 95% CrI | Width | ρ̂ | ESS(ρ) | Accept |
|---|---:|---:|---|---:|---:|---:|---:|
| R edition (published) | 5,000 | −16.590 | [−16.78, −16.39] | 0.384 | 0.2226 | 2.9 | — |
| scspill, R spec | 5,000 | −16.286 | [−16.59, −16.11] | 0.482 | 0.2282 | 3.3 | 0.264 |
| scspill, R spec | 500,000 | −16.796 | [−17.16, −16.46] | 0.702 | 0.3134 | 66.9 | 0.254 |
| **scspill, corrected** | **500,000** | **−16.868** | **[−23.05, −10.33]** | **12.713** | **0.3161** | **136.8** | **0.444** |
| mlsynth `SPILLSYNTH(sar)` | 500,000 | −16.525 | [−16.93, −16.18] | 0.757 | 0.2476 | 135.2 | — |

Running the Python code *in the R specification at the R budget* reproduces
the R edition to 0.304 packs on the ATT, 0.0056 on ρ̂, 0.34 on ESS(ρ) and 0.028
on the Nevada spillover — **including the pathology**. An effective sample size
of 3.3 is not an accident to be explained away; it is what that sampler does.

The decisive row is the third. **A hundredfold increase in iterations widens
the R-specification interval only from 0.482 to 0.702.** Chain length was never
what made it narrow. `propagate_alpha` was: the R code varies ρ across draws
while holding α fixed at its posterior mean, so the reported interval contains
no uncertainty about which states make up synthetic California.

## Figure inventory

| # | File | Content | Key takeaway |
|---|---|---|---|
| 01 | `..._01_panel_paths.png` | 39 state paths, 1970–2000 | California is already falling faster than the pack before 1988 |
| 02 | `..._02_spatial_structure.png` | W heatmap, degree bars, spectrum of Wₙ | One donor borders California; ρ is bounded by 0.95 |
| 03 | `..._03_stage1_fit_gap.png` | Stage-1 observed vs synthetic, and the gap | Close pre-1988 fit, −26.7 packs by 2000 |
| 04 | `..._04_stage1_weights.png` | Simplex weights | 5 donors carry everything; 33 get exactly zero |
| 05 | `..._05_stage2_horseshoe_weights.png` | BSCM posterior weights with CrIs | Pool widens to 26; almost every interval straddles zero |
| 06 | `..._06_stage2_two_bayesian.png` | Four counterfactual paths + ATT dots | BSCM's path sits apart because of its intercept |
| 07 | `..._07_stage3_panel.png` | Package-native 3-panel summary | What `result.plot(kind="panel")` gives for free |
| 08 | `..._08_stage3_weights.png` | Package-native weights comparison | Horseshoe α against the simplex solution |
| 09 | `..._09_rho_posterior.png` | Package-native ρ density + trace | A visibly slow-moving chain — ESS 137 of 250,000 |
| 10 | `..._10_spillover_map.png` | Tile-grid cartogram, linear scale | One dark tile; the concentration is the finding |
| 11 | `..._11_spillover_bars.png` | Top-8 spillovers with CrIs | Nevada 11× Idaho; the rest is noise |
| 12 | `..._12_r_reconciliation.png` | Three ρ chains + ESS bars | Adaptation moves ESS from 3 to 137 |
| 13 | `..._13_prior_predictive.png` | 9 prior predictive statistics | 8 of 9 comfortable; `pve_pc1` in the tail |
| 14 | `..._14_geweke.png` | Geweke \|z\| at two chain lengths | Scores shrink → mixing artifact, not incoherence |
| 15 | `..._15_prior_sensitivity.png` | ρ across 6 prior settings | Only the support constraint binds |
| 16 | `..._16_benchmark.png` | 9 more estimators, comparable vs not | Teal is readable against the ladder; grey is not |
| 17 | `..._17_mc_bias.png` | Bias and coverage against true ρ | SCM/BSCM bias grows with \|ρ\|; SCSPILL stays flat |
| 18 | `..._18_att_ladder.png` | The whole ladder with R references | Sign agreement; spread 3.17 packs |
| 19 | `..._19_mcmc_budget.png` | ATT and ESS against chain length | Estimand settles early; nuisance parameter does not |

## Key findings

1. **The ATT is robust to every relaxation.** Across two libraries, four prior structures and one spatial layer, the estimate spans **−18.85 to −15.68 packs** per capita per year, a range of 3.17. Every credible interval excludes zero.

2. **Two independent implementations agree to 0.278 packs.** The maximum absolute disagreement between this post and the R edition across the four comparable stages is 0.278, or about 1.6%. Stage 1 agrees to 0.032.

3. **The composition of the donor pool is not robust at all.** Five active donors under the simplex, 25–26 under every prior. Statements of the form "synthetic California is mostly Utah, Nevada, Montana and Connecticut" are artefacts of the constraint, not findings.

4. **SUTVA is rejected.** ρ̂ = 0.316 with a 95% credible interval of [0.231, 0.403], excluding zero. The restriction that collapses Stage 3 to Stage 2 is rejected by the model that nests it.

5. **The spillover is concentrated in one state.** Nevada absorbs −5.50 packs per capita per year, 11.2 times Idaho's −0.49. Beyond the second contiguity ring nothing is distinguishable from zero.

6. **The leak runs toward the treatment, not against it.** The prior hypothesis was cross-border shopping raising Nevada's sales; the estimate says they fell. The classical estimate is therefore biased *toward zero* — it **understates** the effect by 1.19 packs.

7. **The bias identity holds numerically.** $\sum_j \alpha_j \xi_j = -1.1295$ against a purged-minus-contaminated difference of −1.1863, agreeing to 0.057 packs. Nevada alone contributes −1.098 of that, or 97%.

8. **The R edition's credible interval was 33 times too narrow, for two separable reasons.** Its effective sample size for ρ was 2.93, so its quantiles were not posterior summaries; and it held α at its posterior mean, so the interval contained no donor-weight uncertainty. **Running the same specification 100× longer fixes only the first** — the width goes from 0.482 to 0.702, not to 12.7.

9. **The estimand converges a hundred times faster than the nuisance parameter.** Across the budget ladder the ATT moves by 0.337 packs while ESS(ρ) moves from 2.8 to 136.8. The conventional floor of 100 is not reached until 500,000 draws.

10. **The Monte Carlo confirms the mechanism on planted truth.** SCM and BSCM are unbiased at ρ = 0 and nowhere else, with bias growing monotonically in |ρ| (reaching +0.29 for BSCM at ρ = 0.6). SCSPILL stays within 0.003 of zero throughout, with coverage of 0.90–0.98 against BSCM's ~0.00.

11. **The numba and numpy backends give identical results.** Verified at a small budget: both return `att = -17.3352`, with numba 5.6× faster. The backend is recorded in the cache key so a switch cannot silently serve stale numbers.

## Surprises and caveats

**Unexpected results.** The spillover sign is the headline surprise — negative,
not positive. The second is that `mlsynth.BSCM` and `scspill` at ρ = 0 disagree
by 3.17 packs despite both being "Bayesian synthetic control with a horseshoe
prior"; the intercept explains it entirely, and it took reading two papers to
see that.

**Data limitations.** The panel carries only `cigsale` and `retprice`, not the
income, youth-share and beer-consumption predictors of the original ADH
specification. This is the main reason the classical ATT here (−18.4) is
smaller in magnitude than the ≈ −27 usually quoted. Treatment is coded at 1988
rather than 1989, following the replication package.

**Assumption violations.** SUTVA is rejected, which is the point. The
identifying assumption that replaces the simplex — that some fixed
unconstrained combination of donors reproduces California *exactly* — is
strong and untestable. The contiguity graph is a researcher-supplied modelling
choice: a trade-based or distance-based W would give different spillovers.

**Numerical issues.** ESS(ρ) = 136.8 at half a million draws is reportable but
not comfortable; R̂ (split) for ρ is 1.0154, above the ideal but inside the
conventional band. `beta[retprice]` has ESS 388 and R̂ 1.0060 — the second-worst
mixing in the model. A run at one million iterations reaches ESS ≈ 164, so
returns flatten sharply.

**Convergence warnings.** The prior predictive check flags three of nine
statistics: `pve_pc1` at p = 0.028, and `ac1`/`ac2` at 0.996 and 0.9985 in the
opposite tail. Real state cigarette panels are more strongly persistent and more
strongly driven by a single common factor than the prior expects, suggesting
`p_factors = 1` may be too few. The R edition runs a coarser four-statistic
visual check at 1,000 draws and reads all four as compatible with the prior.

**Runtime.** About 60 minutes cold, dominated by two 500,000-iteration
`SPILLSYNTH(sar)` fits on the numpy backend (994 s and 1,094 s). These are the
same estimator run twice — once as the standalone cross-check and once inside
the benchmark sweep — which is redundant but keeps the two sections
independently cacheable.

**Reproducibility.** Both libraries are pinned; `scspill` is alpha-stage with
four releases in its history and `extra="forbid"` pydantic configs, so an
upstream field rename would raise rather than silently change an answer. The
cache key fingerprints Python, both library versions, the mlsynth commit, the
resolved backend and the seed, so a pin change invalidates every cached fit.
BLAS is pinned to one thread and `JAX_ENABLE_X64=1` is set before any import
that pulls jax.
