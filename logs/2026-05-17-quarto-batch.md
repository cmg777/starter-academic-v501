# Batch-generated Quarto notebooks for R posts

**Date:** 2026-05-17
**Skill:** `/project:write-quarto-notebook`
**Scope:** all R posts under `content/post/` eligible for an executable companion notebook

## Summary

| Metric                                | Value                |
|---------------------------------------|----------------------|
| R posts surveyed                      | 17                   |
| In-scope (processed)                  | 9                    |
| Out-of-scope (skipped, see below)     | 8                    |
| Successfully written `tutorial.qmd`   | 9 / 9                |
| Rendered (`--no-render` flag NOT set) | 5 / 9                |
| Render passed on first attempt        | 3 / 5                |
| Render passed after auto-fix retries  | 2 / 5                |
| Render failed                         | 0 / 5                |
| `index.md` link button added/updated  | 9 / 9                |

Execution model: 3 parallel `general-purpose` subagents, each in its own git
worktree with a worktree-local `R_LIBS_USER` to prevent `pak::pkg_install()`
write contention. The 3 worktrees were merged back into `master` after all
slots completed and then removed.

## Per-post results

| # | Post slug                     | Render flag    | Status                          | Render time | Retries | Notable auto-fixes                                                       |
|---|-------------------------------|----------------|---------------------------------|-------------|---------|--------------------------------------------------------------------------|
| 1 | `r_causalpolicy_workshop`     | render         | PASS (regenerated, no diff)     | 102 s       | 0/3     | —                                                                        |
| 2 | `r_did`                       | `--no-render`  | SKIP (intentional)              | n/a         | n/a     | Several deps (`did`, `twfeweights`, `HonestDiD`, `DRDID`, …) unpinned    |
| 3 | `r_fwlplot`                   | render         | PASS                            | 29 s        | 0/3     | —                                                                        |
| 4 | `r_demeaning_twfe`            | render         | PASS (overwrote existing qmd)   | 107 s       | 0/3     | —                                                                        |
| 5 | `r_basic_synthetic_control`   | `--no-render`  | SKIP (intentional)              | n/a         | n/a     | —                                                                        |
| 6 | `r_sc_bayes_spatial`          | render         | PASS                            | 42 s        | 3/3     | gfortran/FLIBS Makevars override, version-string `-` vs `.` normalization, tibble size typo |
| 7 | `r_dynamic_bma`               | `--no-render`  | SKIP (intentional, overwrote)   | n/a         | n/a     | Setup chunk reworked to probe-then-install pattern                       |
| 8 | `r_bma_lasso_wals`            | render         | PASS                            | 34 s        | 1/3     | pak dependency conflict → probe-then-install pattern                     |
| 9 | `r_SDPDmod`                   | `--no-render`  | SKIP (intentional)              | n/a         | n/a     | Surprise: `SDPDmod` is on CRAN as `0.0.7` (not GitHub-only as assumed)   |

### File output

| Post slug                    | `tutorial.qmd` lines | `index.md` link update                                  |
|------------------------------|----------------------|--------------------------------------------------------|
| r_causalpolicy_workshop      | 1313                 | unchanged (link already present)                       |
| r_did                        | 864                  | inserted after "R script", before "MD version"         |
| r_fwlplot                    | 622                  | inserted after "R script", before "Datasets (CSV)"     |
| r_demeaning_twfe             | 634                  | upgraded existing entry to "Quarto (.qmd)" + raw URL   |
| r_basic_synthetic_control    | 682                  | inserted between Colab and "R note"                    |
| r_sc_bayes_spatial           | 829                  | inserted after "R script", before "MD version"         |
| r_dynamic_bma                | 877                  | upgraded existing entry to "Quarto (.qmd)" + raw URL   |
| r_bma_lasso_wals             | 1581                 | inserted after Colab                                   |
| r_SDPDmod                    | 783                  | inserted after "R script"                              |

## Out-of-scope posts (not processed)

These 8 R posts were explicitly excluded after exploration. Documented here so
future runs do not re-attempt them by accident.

| Post slug                       | Reason                                                                  |
|---------------------------------|-------------------------------------------------------------------------|
| `r_basic_did`                   | Link-only wrapper — zero executable R code blocks in `index.md`         |
| `r_our_world_in_data`           | Link-only wrapper                                                       |
| `r_staggered_did`               | Link-only wrapper                                                       |
| `r_staggered_did1`              | Link-only wrapper                                                       |
| `r_two_stage_did`               | Link-only wrapper                                                       |
| `r_causal_effects_of_co2_tax`   | Only ~1 R block in `index.md` and no companion script                   |
| `r_convergence_clubs`           | Text-mostly, no companion script                                        |
| `r_dynamic_bma2`                | No `index.md` at all (only `analysis.R`); skill requires `index.md`     |

## Cross-cutting learnings (worth folding back into the skill)

1. **Bare `pak::pkg_install(c("a@x", "b@y", ...))` is brittle on machines where
   the exact pinned versions are already installed.** Both Slot B (`r_sc_bayes_spatial`)
   and Slot C (`r_bma_lasso_wals`) hit this; both rewrote the setup chunk to
   probe each package and only install when the installed version differs from
   the pin. This pattern should become the default in
   `references/language-conventions.md`.
2. **R version-string normalization.** `RcppArmadillo` reports as `15.2.3.1`
   via `packageVersion()` but pak treats its CRAN tarball version as
   `15.2.3-1`; naïve `==` comparison loops triggers unnecessary source
   rebuilds. Probe-then-install logic must normalize `-` → `.` (or vice versa).
3. **macOS + Homebrew gfortran.** When `/opt/gfortran/` is missing (CRAN's
   path), source builds of `RcppArmadillo` and `Rcpp::sourceCpp()` calls
   fail. The Slot B fix writes a temp `Makevars` overriding `FLIBS` to point
   at the local Homebrew gcc and sets `R_MAKEVARS_USER`. Worth promoting to
   an auto-fix recipe in `references/render-and-fix.md`.
4. **Source-of-truth drift.** `SDPDmod` was tagged "GitHub-only" in the plan
   but is actually on CRAN. Scope checks should always re-confirm via
   `available.packages()` rather than relying on prior assumptions.

## Next actions for the user

- **Review the four `--no-render` posts** locally with `quarto render` from
  inside each post directory to confirm reproducibility on your default
  R library (not the worktree-isolated ones):
  - `content/post/r_did/tutorial.qmd`
  - `content/post/r_basic_synthetic_control/tutorial.qmd`
  - `content/post/r_dynamic_bma/tutorial.qmd`
  - `content/post/r_SDPDmod/tutorial.qmd`
- **Inspect changes** before committing — 9 `index.md` files and 9
  `tutorial.qmd` files are modified or added.
- **Commit** with a single message such as
  `r posts: add Quarto tutorial for local execution (batch of 9)`.
- **Consider promoting** the probe-then-install pattern and the
  Homebrew-gfortran Makevars trick into the skill's reference files.
