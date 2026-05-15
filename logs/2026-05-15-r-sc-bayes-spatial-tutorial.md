# Bayesian Spatial Synthetic Control tutorial (`r_sc_bayes_spatial`)

**Date:** 2026-05-15
**Commit:** 58118b0

## Motivation

New R tutorial replicating the California Proposition 99 case study from
Sakaguchi & Tagawa, *"Identification and Bayesian Inference for
Synthetic Control Methods with Spillover Effects"*. The post walks
through a three-stage progression that adds one feature at a time:

1. **Stage 1 — Classical SCM** (Abadie 2010 baseline via `tidysynth`)
2. **Stage 2 — Bayesian SCM with horseshoe priors** (no SAR layer)
3. **Stage 3 — Bayesian Spatial SCM** with SUTVA-relaxing SAR
   spillovers

The pedagogical hook is what *moves* between the three estimates as we
relax simplex sparsity (Stage 1 → 2) and then relax SUTVA (Stage 2 → 3).

## Headline numbers

| Stage | ATT (packs per capita) | 95% interval | Active donors |
|-------|------------------------|--------------|--------------|
| Classical SCM (tidysynth)   | −18.46 | [−22.21, −14.45] | 4  |
| Bayesian HS (no spillovers) | −15.84 | [−21.76, −9.48]  | 23 |
| Bayesian Spatial SAR        | −16.59 | [−16.78, −16.39] | 27 |

Top spillover-receiving donor: **Nevada** (average post-treatment
effect ≈ −3.75 packs per capita), consistent with cross-border
substitution after California's tax hike. SAR posterior ρ̂ = 0.223.

**Caveat:** the script uses 5,000 MCMC iterations (2,500 burn-in) for
tutorial speed. The published paper uses 100,000. Stage-3 ESS(ρ) is
small (~3) in this run, so the Stage-3 credible interval is artificially
narrow — illustrative, not inference-grade.

## Replication-package handling (the decision worth recording)

The upstream Sakaguchi & Tagawa replication-package is **148 MB** and
includes a **129 MB raw CSV** (`data/raw/IMF_trade.csv`) that exceeds
GitHub's 100 MB per-file hard limit. Almost none of `data/raw/` is used
by the California tutorial — `analysis.R` only reads
`data/california_smoking.rda` (6 KB) and sources eight R helpers + two
C++ MCMC kernels from `R/` and `src/`.

Decision: **do not commit the replication-package.** Instead:

- Copy the **11 files** `analysis.R` actually needs into a new
  `helpers/` subdirectory inside the post.
- Rewrite `analysis.R` to fetch those 11 files at runtime from this
  repo's **GitHub raw URLs** (so the script is self-contained after
  this commit lands on master).
- Add `content/post/r_sc_bayes_spatial/replication-package/` to
  `.gitignore` (following the same pattern as
  `content/post/stata_iv/references/`, `python_iv/.venv/`, and
  `python_mgwrfer/mgwpr_repo/`).

The 11 helpers in `helpers/`:

| File | Source | Size |
|------|--------|------|
| `01_utils.R` … `41_robustness_check.R` (8 R files) | `replication-package/R/` | 5–17 KB each |
| `20_mcmc.cpp`, `40_geweke_latest.cpp` | `replication-package/src/` | 17 KB, 8 KB |
| `california_smoking.rda` | `replication-package/data/` | 6 KB |

R helpers are sourced via `source(url)`; the .cpp files are
`download.file()`d to a tempdir and then `Rcpp::sourceCpp()` is pointed
at the local copy (sourceCpp doesn't accept URLs); the .rda is
`load(url(...))`d.

## Files added in this commit

- `content/post/r_sc_bayes_spatial/index.md` — 535-line three-stage
  notebook-style tutorial; dark theme; 6 figures with italic captions,
  3 display equations, 7 key-concept cards, 1 Mermaid pipeline diagram.
- `content/post/r_sc_bayes_spatial/analysis.R` — the script, rewritten
  to fetch helpers from GitHub raw URLs.
- `content/post/r_sc_bayes_spatial/helpers/` — 11 helper files.
- `content/post/r_sc_bayes_spatial/README.md` — pipeline-status README.
- `content/post/r_sc_bayes_spatial/execution_log.txt` — last successful
  local run.
- `content/post/r_sc_bayes_spatial/.Makevars-rcpp` — local gfortran
  Makevars override (macOS workaround documented in README).
- `content/post/r_sc_bayes_spatial/featured.webp` — featured image.
- 6 PNG figures, 9 CSV outputs.
- `content/post/r_sc_bayes_spatial/{plan.md, script-review.md,
  results_report.md, results_report_review.md,
  infographic_instructions.md}` — workflow scaffolding from the
  data-science skill pipeline; kept as a public audit trail.
- `.gitignore` — one new line gitignoring the replication-package.

## Categories applied

The post's front matter sets `categories: [R, Synthetic Control, Spatial
Regression]` — which the recent method-based category overhaul
(`logs/2026-05-15-method-based-category-reorganization.md`) standardizes
to **R**, **Synthetic Control**, **Spatial Regression (SAR, SEM, SDM)**.
The post body adds tags `r, causal, spatial, bayesian, synthetic
control`.

## Verification

- Pre-push: edits to `analysis.R` reviewed; the path-based loading
  (lines 42-43, Section 1, Section 2) is now URL-based.
- Post-push: re-run `Rscript analysis.R` from a clean directory and
  confirm the URLs at
  `https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_sc_bayes_spatial/helpers/...`
  resolve and the script reproduces the headline numbers above.
