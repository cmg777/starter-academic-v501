# Script Review: r_sc_bayes_spatial

**Script:** `analysis.R` (611 lines)
**Language:** R (with Rcpp/C++ kernels sourced from `replication-package/src/`)
**Executed:** 2026-05-14 (clean re-run for this review)
**Status:** All code runs — exit code 0, deterministic across runs.

## Verdict: **ACCEPT**

The script is correct, reproducible, well-organized, and faithfully follows
the upstream replication package's calling pattern. The pedagogical three-stage
structure (Classical → Bayesian HS → Bayesian Spatial SAR) is implemented
cleanly with shared utilities and consistent dark-theme figures. Two
MEDIUM-severity polish items are flagged below; nothing blocks downstream
use of the results.

## Execution Results

- **Exit code:** 0
- **Execution time:** ~30 seconds (Rcpp compile cached after first run; ~60 s cold)
- **Figures generated:** 6 PNG files (all 300 dpi, slug-prefixed, dark palette)
- **CSVs exported:** 9 (source data + per-stage outputs + cross-stage comparison)
- **Warnings:** 1 deprecation warning (`geom_errorbarh()`, ggplot2 4.0.0). The script's own ESS-low warning fires as designed (ESS[ρ]=3 at tutorial scale).
- **Final success message present:** Yes — `=== Script completed successfully ===`
- **Determinism:** Re-run produced bit-identical numerical results (seed 20251022 + R `set.seed()` propagation to C++ via `R::rgamma`).

Headline numbers from this run (per-capita cigarette sales, ATT on California):

| Stage | ATT | 95% interval | Active donors |
|-------|-----|--------------|---------------|
| Classical SCM (tidysynth) | −18.46 | [−22.21, −14.45] | 4 |
| Bayesian HS | −15.84 | [−21.76, −9.48] | 23 |
| Bayesian Spatial SAR | −16.59 | [−16.78, −16.39]† | 27 |

† Stage 3 CrI is artificially narrow — ESS(ρ) = 3 at tutorial-scale MCMC. See issue M1.

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| M1 | Statistical correctness | **MEDIUM** | lines 392–394, 569–581 | The Stage 3 95% CrI is computed from a posterior with `ESS(ρ) = 3` and ends up visibly narrower than the Classical and HS intervals in the comparison table. The script warns separately (line 393) but the `att_table` and the printed headline (Section 7) reuse the raw quantiles, which can mislead a reader skimming the comparison. | Either: (a) replace `lo95`/`hi95` for the SAR row with `NA` when `ess_rho < 200` (and add an explanatory note column); or (b) add an `ess_rho` column to `att_table` so the reader sees the divergent ESS at a glance. The current `notes` column is a reasonable place to embed `ESS=3` literally. |
| M2 | Statistical correctness | **MEDIUM** | lines 142–143 | The comment attributes the divergence between the classical ATT (−18.46) and Abadie (2010)'s headline (~−27) to the `tidysynth` optimizer alone. The dominant cause is actually the predictor set: the available data has only `cigsale` and `retprice`, while Abadie (2010) uses log income, youth share, and beer sales as additional predictors. Without naming this, the divergence looks like a bug. | Extend the comment to read: "`tidysynth` uses a slightly different optimizer than Abadie's `Synth`, and—more importantly—the data shipped in `california_smoking.rda` only includes `cigsale` and `retprice`, whereas Abadie (2010) used additional predictors (ln income, youth share, beer sales). Both factors shift recovered weights and the ATT relative to the paper." |
| L1 | Figures | **LOW** | line 314 | `geom_errorbarh()` is deprecated in ggplot2 4.0.0; emits a warning on every run. | Replace with `geom_errorbar(aes(xmin = lo95, xmax = hi95), orientation = "y", height = 0, colour = STEEL, alpha = 0.7)`. |
| L2 | Code quality | **LOW** | lines 81–82, 130–134, 184–186, 220, 288–291, 326, 356, 390–391, 400–401, 453, 496, 559, 589–598 | `cat(glue("…\n"))` strips the trailing newline before `cat()` sees it, producing concatenated log lines like `replicationSeed:` (visible in `execution_log.txt`). | Replace with `cat(glue("…"), "\n", sep = "")` or use `sprintf()` / explicit `\n` outside `glue()`. Alternative: `glue::glue("…\n", .trim = FALSE)`. |
| L3 | Code quality | **LOW** | line 53 | `BLACK <- "#141413"` is defined but never used (the dark-theme figures use `BG`, not `BLACK`). | Remove the unused binding. |
| L4 | Code quality | **LOW** | line 163 | `rename(state = unit, weight = weight)` includes the no-op `weight = weight`. | Drop the redundant rename; keep only `rename(state = unit)`. |
| L5 | Code quality | **LOW** | lines 156–158 | The `tidysynth` predictors hardcode `time_window = 1975` and `1980` while everything else flows through `TREAT_YEAR`. If a reader tries a different `TREAT_YEAR`, only the lag-immediate-pre predictor follows. | Either parameterize as `c(1975, 1980, TREAT_YEAR - 1)`-driven loop, or add a 1-line comment that these calibration years are tied to the 1988 boundary and would need adjustment for a different treatment year. |
| L6 | Code quality | **LOW** | lines 237–238, 245–246 | `arrange(state, year)` before `pivot_wider(id_cols = year, names_from = state, values_from = cigsale)` is redundant; `pivot_wider` sorts by `names_from`. The subsequent `select(all_of(donors))` is what actually guarantees donor ordering. | Drop the `arrange()`. Keep the `select(all_of(donors))` explicit guarantee. |
| L7 | Reproducibility | **LOW** | line 75–78 | `save_fig()` is good DRY abstraction but the `w = 8, h = 6` defaults are overridden case-by-case (`w = 9, h = 8` for paths; `w = 8, h = 9` for the donor weight column). Slightly noisy. | Either make the defaults match the most common case (`w = 9, h = 6`), or document the per-figure rationale in a single comment block above the function. |

## Positive Highlights

- **Header docstring** (lines 1–19) is exemplary: explicit estimand (ATT), framing (observational, synthetic counterfactual), SUTVA-relaxation note for Stage 3, MCMC budget caveat, and inputs/outputs all in one place. This is the cleanest causal-framing comment in the repo's R posts.
- **`tryCatch` around `Rcpp::sourceCpp`** (lines 97–105) with an actionable error message ("Install Xcode CLT / Rtools and retry") — exactly the right defensive pattern for a non-trivial toolchain dependency.
- **Defensive `stopifnot()` checks** at lines 126–128, 243, 257–258 verify state ordering, donor-pool size, and post-burn matrix dimensions. Catches the most common silent-bug class for SCM panels (donor-vs-W ordering mismatch).
- **DRY helpers**: `save_fig()` (line 75) and `clean_names()` (line 528) avoid repeated boilerplate without becoming opaque.
- **Posterior credible bands on the gap** (Stage 2, lines 276–281) are computed by propagating draws through `Y0 − Yc @ α'` rather than just taking the gap-of-means — the statistically correct construction.
- **Bootstrap CI for the classical ATT** (lines 178–182) — 2,000 bootstrap reps on the post-period gap series, makes Stage 1 comparable to the Bayesian intervals in the comparison table.
- **ESS check with conditional warning** (lines 388–394) self-flags the low-ESS regime; the issue is that the comparison table downstream doesn't act on this flag (see M1).
- **Cross-stage comparison table** with `active_donors_n` column (lines 569–581) cleanly shows how horseshoe shrinkage produces more diffuse, less sparse weights than the classical simplex constraint.
- **Top-8 spillover filtering** (lines 428–434) avoids dumping all 38 donor states onto one bar chart; falls back to `slice_max(abs_eff, n = 8)` with sign-coloring (teal positive / orange negative).
- **`Rplots.pdf` cleanup** (lines 606–609) — a small thing that keeps the post bundle clean.

## Reproducibility verification

- `set.seed(20251022)` at line 35 + reseeding at stage boundaries (lines 177, 253) + `seed = SEED` passed to `sc_spillover` (line 379).
- R's `set.seed()` propagates to the C++ Gibbs kernels because they use `R::rgamma` (not `arma::arma_rng`), verified by bit-identical output across two runs.
- Two consecutive `Rscript analysis.R` runs produced identical headline ATTs (−18.46 / −15.84 / −16.59) and identical posterior summaries to all printed decimals.

## Priority Action Items

1. **[MED]** Address M1: flag the Stage 3 row's low-ESS in the comparison table (either NA the CrI or add an `ess_rho` column).
2. **[MED]** Address M2: extend the line-142 comment to name the predictor-set limitation as the dominant cause of the classical-paper divergence.
3. **[LOW]** Sweep up L1 (`geom_errorbarh` deprecation) and L2 (`cat(glue("…\n"))` newline stripping) in one pass — these are the only items that affect the visible log/run experience.

## Files written by this review

- `script-review.md` (this file)
- `README.md` updated to add this review to the file inventory
- Temporary review log `execution_log_review.txt` removed after review
