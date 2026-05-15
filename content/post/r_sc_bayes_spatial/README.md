# Bayesian Spatial Synthetic Control — California Tobacco Replication

Replication of the California Proposition 99 tobacco-tax case study from
Sakaguchi & Tagawa, *"Identification and Bayesian Inference for Synthetic
Control Methods with Spillover Effects"*. Uses the 11 helper files the
package authors ship (R utils, two C++ MCMC kernels, the California panel
`.rda`) — copied into `helpers/` and fetched at runtime from this repo's
GitHub raw URLs. Wraps the California case study in a pedagogical
three-stage progression that adds one feature at a time (Classical SCM →
Bayesian Horseshoe → Bayesian Spatial SAR).

The full upstream replication-package (148 MB, third-party) is intentionally
gitignored.

## Pipeline progress

- [x] **Script** (`analysis.R` + `execution_log.txt`) — all 9 review fixes applied
- [x] **Script review** (`script-review.md`) — verdict: ACCEPT
- [x] **Results report** (`results_report.md`) — structured findings + interpretations
- [x] **Results report review** (`results_report_review.md`) — verdict: MINOR REVISION → ACCEPT after fixes applied 2026-05-15 (H1, L1, L2 applied; L3 deferred)
- [x] **Blog post** (`index.md`, 535 lines) — notebook-style three-stage tutorial; dark theme; 6 figures with italic captions, 3 display equations, 7 key concepts, 1 Mermaid pipeline diagram; date 2026-05-14. Post-review (multi-dimensional): MAJOR REVISION → ACCEPT after 5 fixes applied 2026-05-15 (E1, E2 LaTeX AVOID-list; C1 Xc_pre_arr construction; figure captions; W1 phrasing tightening).
- [ ] Infographic

## Reproducing locally

```bash
cd content/post/r_sc_bayes_spatial
R_MAKEVARS_USER="$PWD/.Makevars-rcpp" Rscript analysis.R 2>&1 | tee execution_log.txt
```

The `R_MAKEVARS_USER` override is needed on macOS systems where R's default
`Makeconf` points to the CRAN-distributed gfortran toolchain at
`/opt/gfortran/` (which expects `emutls_w`/`heapt_w`) but the machine has
Homebrew gcc instead. The local `.Makevars-rcpp` redirects `FLIBS` to the
Homebrew gfortran without the missing libs. If you have the CRAN toolchain
installed at `/opt/gfortran/`, you can omit the env var.

The script auto-installs `pacman` and `tidysynth` from CRAN if missing.

**Expected wall-clock:** 30–90 seconds (Rcpp compile is cached after first run).

## Methods

- **Stage 1 — Classical SCM:** Abadie (2010) constrained QP on the simplex,
  implemented via `tidysynth`.
- **Stage 2 — Bayesian SCM with horseshoe priors:** Gibbs sampler in C++
  (`hs_alpha_gibbs_cpp` from `helpers/20_mcmc.cpp`). 5,000 iterations,
  2,500 burn-in.
- **Stage 3 — Bayesian Spatial SCM:** unified pipeline via
  `sc_spillover()` in `helpers/10_sc_spillover.R`, which runs the
  horseshoe α-MCMC followed by a SAR ρ-MCMC and post-hoc direct/indirect
  effect decomposition.

## Dataset

`helpers/california_smoking.rda` — panel of 39 US states, 1970–2000.
Outcome: per-capita cigarette sales (`cigsale`). Covariate: real retail
price (`retprice`). Treated unit: California. Treatment boundary (per the
package): `year >= 1988`. Donor pool: 38 other states. Spatial weights:
`w` (38-vector, California's binary contiguity over donors) and `W`
(38×38 binary contiguity among donors). Row-normalized internally.

## Figures

| File | Description |
|------|-------------|
| `r_sc_bayes_spatial_01_classical_paths.png` | Stage 1 — California vs. tidysynth-synthetic; gap plot |
| `r_sc_bayes_spatial_02_horseshoe_weights.png` | Stage 2 — posterior mean and 95% CrI of donor weights under the horseshoe prior |
| `r_sc_bayes_spatial_03_spillover_effects.png` | Stage 3 — top-8 spillover-receiving donor states (SAR posterior) |
| `r_sc_bayes_spatial_04_prior_predictive.png` | Stage 2/3 — prior predictive check on 4 summary statistics |
| `r_sc_bayes_spatial_05_stage2_paths.png` | Stage 2 — California vs. horseshoe synthetic with 95% credible band on gap |
| `r_sc_bayes_spatial_06_stage3_paths.png` | Stage 3 — California vs. SAR-spillover synthetic; treatment-effect-over-time |

## CSV tables

| File | Rows × Cols | Description |
|------|-------------|-------------|
| `r_sc_bayes_spatial_source_data.csv` | 1209 × 6 | Full panel + treatment dummy |
| `r_sc_bayes_spatial_stage1_weights.csv` | 38 × 2 | Stage 1 donor weights (classical) |
| `r_sc_bayes_spatial_stage1_gap.csv` | 31 × 5 | Stage 1 observed / synthetic / gap over years |
| `r_sc_bayes_spatial_stage2_alpha_posterior.csv` | 38 × 4 | Stage 2 horseshoe weights: mean, 2.5%, 97.5% |
| `r_sc_bayes_spatial_stage2_gap.csv` | 31 × 7 | Stage 2 gap series with 95% credible band |
| `r_sc_bayes_spatial_stage3_rho_posterior.csv` | 1 × 7 | Stage 3 ρ posterior: mean/sd/quantiles/ESS |
| `r_sc_bayes_spatial_stage3_spillover_effects.csv` | 38 × 2 | Stage 3 per-donor average post-treatment spillover |
| `r_sc_bayes_spatial_stage3_gap.csv` | 13 × 4 | Stage 3 post-treatment gap series |
| `r_sc_bayes_spatial_att_comparison.csv` | 3 × 6 | Cross-stage ATT comparison (point + 95% interval + active-donor count) |

## Headline results

| Stage | ATT | 95% Interval | Active donors | Notes |
|-------|-----|--------------|--------------|-------|
| Classical SCM (tidysynth) | −18.46 | [−22.21, −14.45] | 4 | Bootstrap CI on post-period gaps |
| Bayesian HS (no spillovers) | −15.84 | [−21.76, −9.48] | 23 | Posterior credible interval |
| Bayesian Spatial SAR | −16.59 | [−16.78, −16.39] | 27 | ρ̂ = 0.223; SUTVA relaxed |

Top spillover-receiving donor state: **Nevada** (avg post-treatment effect
≈ −3.75 packs per capita), consistent with cross-border substitution after
California's tax hike.

## Caveat (tutorial MCMC)

This script uses **5,000 MCMC iterations** (2,500 burn-in) for tutorial
speed. The published paper uses **100,000 iterations**. As a result,
ESS(ρ) is small (≈3 in this run) and the Stage 3 credible interval is
artificially narrow. For inference-grade replication, set
`MCMC_ITER = 100000L`, `MCMC_BURN = 50000L` at the top of `analysis.R`
and expect ~30–90 minute runtime.

## Packages used

R (CRAN): `tidyverse`, `tidysynth`, `Rcpp`, `RcppArmadillo`, `Matrix`,
`glue`, `scales`, `patchwork`, `coda`, `pacman`.

C++ (Rcpp-sourced from `helpers/`): `20_mcmc.cpp`, `40_geweke_latest.cpp`.

R helpers (sourced from `helpers/`): `01_utils.R`, `02_utils_data_prep.R`,
`03_utils_plot.R`, `04_utils_diagnostics.R`, `10_sc_spillover.R`,
`21_mcmc_alpha.R`, `22_mcmc_sar.R`, `41_robustness_check.R`.

All eleven helper files are fetched at runtime by `analysis.R` from
this repo's GitHub raw URLs.
