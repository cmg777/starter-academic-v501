# Plan — Bayesian Spatial Synthetic Control (California Tobacco)

Approved scope for `analysis.R` at `content/post/r_sc_bayes_spatial/`.

## Topic
Bayesian Spatial Synthetic Control — replication of the California Proposition 99 tobacco case study from Sakaguchi & Tagawa, *"Identification and Bayesian Inference for Synthetic Control Methods with Spillover Effects"*. Uses the `scspill` replication package shipped in `replication-package/` (R + Rcpp/C++ MCMC).

**Dataset:** `replication-package/data/california_smoking.rda` (panel of 39 US states, 1970–2000; outcome = per-capita cigarette sales; treated unit = California; treatment first year = 1989; W = 38×38 row-normalized control-only adjacency; w = 38-vector of California's spatial weights on controls).

**Question:** What is the ATT of Proposition 99 on California cigarette consumption, and how does the estimate change as we add (a) Bayesian horseshoe shrinkage on donor weights and (b) a SAR layer that models spillovers to neighboring donor states?

## Language
R — replication package is R + Rcpp; user-requested.

## Figure theme
Dark navy. `bg=#0f1729`, `grid=#1f2b5e`, `text=#c8d0e0`. Accents: `#6a9bcc` (steel blue), `#d97757` (warm orange), `#00d4c8` (teal).

## Pedagogical progression
Three stages, each producing an ATT estimate; final cross-stage table compares all three side-by-side.

1. **Stage 1 — Classical SCM** via `tidysynth` (Abadie-style baseline).
2. **Stage 2 — Bayesian SCM with horseshoe priors** via `hs_alpha_gibbs_cpp()` (pure Bayesian shrinkage; no SAR).
3. **Stage 3 — Bayesian Spatial SCM with SAR spillovers** via `sc_spillover()` (the package's unified entry point — returns α_draws, ρ_draws, effects, spillovers in one call).

## Framing
**Causal** — ATT estimand. Observational setting; the synthetic counterfactual substitutes for randomization. SUTVA (no interference) is relaxed in Stage 3 via the SAR layer.

## MCMC budget
5,000 iterations / 2,500 burn-in (paper uses 100,000). Tutorial-scale. Script prints an explicit warning at end of Stages 2 and 3.

## Script sections
- 0. Setup (packages, seed, palette, `theme_dark_site`)
- 1. Source helpers (`Rcpp::sourceCpp` + `source()` in dependency order)
- 2. Load `california_smoking.rda`; verify state ordering; export source CSV
- 3. Stage 1 — Classical SCM via `tidysynth`
- 4. Stage 2 — Bayesian SCM with horseshoe (incl. prior predictive check)
- 5. Stage 3 — Bayesian Spatial SCM with SAR spillovers
- 6. Cross-stage ATT comparison table
- 7. Summary + cleanup (Rplots.pdf, ESS check on ρ)

## Deliverables (in post root)

**Figures (6 PNG, 8×6 in @ 300 dpi):**
- `r_sc_bayes_spatial_01_classical_paths.png`
- `r_sc_bayes_spatial_02_horseshoe_weights.png`
- `r_sc_bayes_spatial_03_spillover_effects.png`
- `r_sc_bayes_spatial_04_prior_predictive.png`
- `r_sc_bayes_spatial_05_stage2_paths.png`
- `r_sc_bayes_spatial_06_stage3_paths.png`

**CSVs (9):**
- `r_sc_bayes_spatial_source_data.csv`
- `r_sc_bayes_spatial_stage1_weights.csv`
- `r_sc_bayes_spatial_stage1_gap.csv`
- `r_sc_bayes_spatial_stage2_alpha_posterior.csv`
- `r_sc_bayes_spatial_stage2_gap.csv`
- `r_sc_bayes_spatial_stage3_rho_posterior.csv`
- `r_sc_bayes_spatial_stage3_spillover_effects.csv`
- `r_sc_bayes_spatial_stage3_gap.csv`
- `r_sc_bayes_spatial_att_comparison.csv`

**Log:** `execution_log.txt`
**Inventory:** `README.md`

## Risks and edge cases
1. Alphabetic state ordering: derive `CA_IDX <- which(state_order == "California")` rather than hardcoding.
2. W dimension: 38×38 control-only (NOT 39×39); `w` is a separate 38-vector.
3. Treatment dummy: `state=="California" & year >= 1988` (per `01_california_main.R`).
4. Rcpp toolchain failure: `tryCatch` around `sourceCpp` with actionable error message.
5. `tidysynth` weights will not exactly match Abadie (2010) due to optimizer differences — flag in comment.
6. Spillover figure: top-8 donors by |posterior mean indirect|, group the rest as "Other".
7. ESS check on ρ via `coda::effectiveSize`; warn if ESS < 200.
8. Clean up `Rplots.pdf` at end.

## Verification
- All 6 PNGs and 9 CSVs present; `execution_log.txt` ends with `=== Script completed successfully ===`.
- All three stages report negative ATT.
- Classical ATT close to Abadie (2010) headline (~−27 packs per capita).
- Bayesian HS posterior α is sparse.
- SAR ρ posterior bounded in (−1, 1); ESS ≥ 200.
- Top spillover states are geographically proximate to California (e.g., Nevada, Oregon, Arizona).
