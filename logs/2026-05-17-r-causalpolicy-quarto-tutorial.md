# r_causalpolicy_workshop — Quarto tutorial for local execution

**Date:** 2026-05-17

## Motivation

Readers who wanted to run the workshop post locally had three friction
points: `index.md` is for Hugo rendering and cannot be executed,
`analysis.R` runs end-to-end but has no inline prose, and `notebook.ipynb`
is wired for Google Colab with IRkernel rather than Positron or RStudio.
This change adds a single self-contained Quarto file that fills the gap.
A reader can now open `tutorial.qmd` in Positron/RStudio, hit *Render*
(or *Run All*), and reproduce the whole tutorial — prose, code, output,
and figures — with no extra setup beyond a working R installation.

## tutorial.qmd

New 1,302-line file at
`content/post/r_causalpolicy_workshop/tutorial.qmd`. Conventions follow
the existing project precedents `r_demeaning_twfe/tutorial.qmd` and
`r_dynamic_bma/tutorial.qmd`.

- **YAML format**: `format: html` with `theme: darkly`, `toc: true`,
  `toc-depth: 3`, `code-fold: true`, `code-summary: "Show code"`,
  `fig-dpi: 300`, `fig-width: 9`, `fig-height: 5.5`, and `execute:
  warning: false, message: false`.
- **All 16 sections** of `index.md` preserved: overview, key concepts,
  the §2 potential-outcomes framework, all six method families, the
  §10 Synthetic Control deep-dive (eight subsections), the cross-method
  comparison, discussion, exercises, and references. Prose, headings,
  tables, math, and inline `[VERIFY]`-style numeric callouts are copied
  verbatim except for math-escape and link-rewrite passes (below).
- **Self-contained setup chunk** bootstraps `pacman` with
  `requireNamespace()` and then `pacman::p_load()` installs the 11
  required CRAN packages on a fresh machine: `tidyverse`, `sandwich`,
  `lmtest`, `tidysynth`, `fpp3`, `mice`, `ranger`, `CausalImpact`,
  `broom`, `glue`, `forcats`. `set.seed(42)` fixes the MICE imputation
  and CausalImpact MCMC.
- **Data download** pulls `proposition99.rds` from this project's
  GitHub raw URL on first run, then caches it locally. No external
  data dependency.
- **All 13 figures regenerated inline** — no `knitr::include_graphics()`
  calls and no dependency on the existing PNG files. Four native
  ggplot chunks (EDA, DiD trends, ITS-ARIMA, RDD piecewise), one
  custom V-matrix bar chart, one forest plot, plus the tidysynth
  built-in helpers `plot_trends()`, `plot_weights()`, `plot_differences()`,
  `plot_placebos()` (pruned and unpruned), and `plot_mspe_ratio()`,
  and `plot(impact_full)` for CausalImpact.
- **4 Mermaid diagrams** converted from ` ```mermaid ` to
  ` ```{mermaid} ` so Quarto renders them natively.
- **Math escaping** cleaned from Hugo/Goldmark's doubled-backslash form
  (`\\,`, `\\*`, `\\{`, `\\}`) to single backslashes for Quarto's
  MathJax pipeline. Display equations in §2 (potential outcomes) and
  §10 (Synthetic Control optimisation) verified.
- **Internal site links** rewritten from `/post/r_did/` and
  `/post/r_sc_bayes_spatial/` to absolute
  `https://carlos-mendez.org/post/...` URLs so they resolve from the
  rendered HTML when opened outside the Hugo site.

Expected render time on a warm machine: 1–3 minutes (the MICE
imputation and CausalImpact MCMC dominate). No chunk-level caching
added in this first pass.

## index.md changes

One YAML front-matter edit only: a new `links:` entry inserted between
the existing Google Colab and AI Podcast entries.

```yaml
- icon: file-code
  icon_pack: fas
  name: "Quarto (.qmd)"
  url: https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_causalpolicy_workshop/tutorial.qmd
```

The `file-code` icon comes from Font Awesome solid (`fas`), already
used elsewhere on the site. The button points readers at GitHub's raw
URL so they can right-click → Save As or curl the .qmd straight into
their working directory.

## Verification

- Quarto YAML and chunk-option style matches the existing project
  precedents (`r_demeaning_twfe/tutorial.qmd`,
  `r_dynamic_bma/tutorial.qmd`).
- Local Hugo build runs cleanly:
  `"$HOME/Library/Application Support/Hugo/0.84.2/hugo" --gc --minify
  --buildFuture` — zero errors, zero warnings. The `tutorial.qmd` is
  not a content format Hugo renders, so it is silently ignored by the
  build.
- The new "Quarto (.qmd)" link button appears in the post's link bar
  alongside the existing R script, Colab, AI Podcast, and MD-version
  buttons.
- Reader-side render flow (verified by spec, not by re-running every
  chunk in this commit): `quarto render tutorial.qmd` from the post's
  directory should complete in 1–3 minutes and produce `tutorial.html`
  with every figure inline and no missing-package errors on a fresh R
  installation.

## Files in this commit

- `content/post/r_causalpolicy_workshop/tutorial.qmd` — new (1,302 lines)
- `content/post/r_causalpolicy_workshop/index.md` — `links:` entry added
- `logs/2026-05-17-r-causalpolicy-quarto-tutorial.md` — this file
