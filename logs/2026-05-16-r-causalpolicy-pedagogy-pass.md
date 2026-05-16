# r_causalpolicy_workshop — pedagogy pass + tidysynth deep-dive

**Date:** 2026-05-16

## Motivation

Carlos asked for a careful revision of `r_causalpolicy_workshop/index.md` with
two goals: (a) make it easier to learn from (shorter sentences, more scaffolding,
explicit method-rhythm), and (b) expand the Synthetic Control section using
[`edunford/tidysynth`](https://github.com/edunford/tidysynth) as the primary
reference, because SCM is the workshop's central tool.

## Index.md changes

Each method section now follows the same 4-part rhythm: **The idea →
The code → The output → What it means**, plus a final **Recap** sentence.
The Overview was rewritten with shorter sentences and gained a roadmap
section ("How to read this tutorial") and a master conceptual diagram
("The shared logic of every method") that names California's observed
series + the counterfactual + the gap as the universal three-ingredient
recipe.

Four Mermaid diagrams added (the post already had `diagram: true`):

| Diagram | Section | What it shows |
|---|---|---|
| Shared-logic flow | §1 (Overview) | All six methods feed different counterfactual constructions into the same `Effect = Observed − Counterfactual` skeleton |
| DiD 2×2 grid | §5 (DiD) | The CA/NV × Pre/Post arithmetic that produces the DiD interaction coefficient (CA: 99.0→72.0, NV: 143.1→121.8, DiD = −5.7) |
| SCM pipeline | §9 (Synthetic Control) | The five `synthetic_control() → generate_predictor() → generate_weights() → generate_control() → plot/grab_ helpers` stages |
| BSTS state-space | §10 (CausalImpact) | The three additive ingredients of `y_1t = μ_t + β·x_t + ε_t` |

Section §9 (Synthetic Control) grew from a single block to six subsections
(9.1 fit, 9.2 W and V weights, 9.3 estimate, 9.4 balance, 9.5 placebo,
9.6 MSPE ratio + Fisher exact p-value). The expansion is anchored on the
tidysynth README's helper functions:

- `grab_unit_weights()` and `grab_predictor_weights()` are now both shown
  with their tidy output. The V-matrix table shows that `cigsale_1975`
  (0.493) and `cigsale_1980` (0.392) absorb 88.5% of the predictor
  weight — making explicit that lagged outcomes do most of the matching
  work and behavioural covariates do little.
- `grab_balance_table()` is shown comparing California, synthetic
  California, and unweighted donor mean, demonstrating that the
  unweighted donor average sits at 114.2 packs in 1988 vs California's
  90.1, while synthetic California sits at 91.4.
- `grab_significance()` is shown with the MSPE-ratio Fisher rank test.
  California ranks 1 of 39 with MSPE ratio 120.5 and Fisher exact
  p = 0.026.

The Discussion gained a "Six counterfactuals at a glance" table that
lines up each method's identifying-assumption sentence next to its
estimate. A fourth Exercise was added that probes the V matrix by
dropping the three lagged-outcome predictors and observing what happens
to the pre-period fit.

## analysis.R changes

Added a tidysynth diagnostics block after the existing SCM section:

```r
grab_predictor_weights(prop99_syn)  # V matrix
grab_loss(prop99_syn)               # pre-period MSPE for treated + placebos
grab_significance(prop99_syn)       # Fisher exact p via MSPE ratio
plot_mspe_ratio(prop99_syn)         # bar chart of MSPE ratios
```

The MSPE-ratio plot is saved as `fig10_sc_mspe_ratio.png` with the
treated unit highlighted in warm orange to match the rest of the
dark-theme palette. Three new CSV exports: `table_sc_predictor_weights.csv`,
`table_sc_loss.csv`, `table_sc_significance.csv`.

The README-generation block at the end of the script is now smarter:
it ticks each pipeline stage based on whether the corresponding
artifact file (`results_report.md`, `index.md`,
`infographic_instructions.md`) actually exists on disk. Previously
the script always hard-coded "Stage 1 done, rest pending", which
forced the README pipeline-progress block out of sync with reality
on every re-run.

## Verification

- `Rscript analysis.R` exits 0; produces 10 PNGs + 13 CSV tables.
- `hugo --gc --minify --buildFuture` builds with zero errors or
  warnings.
- The Hugo dev server returns HTTP 200 for `/post/r_causalpolicy_workshop/`
  with all 10 figure references resolving and 4 Mermaid blocks
  marked with `class="language-mermaid"` (Wowchemy hydrates them
  client-side at page load).
- Internal cross-references (`§9`, `§10`, etc.) re-numbered to match
  the new section structure.
- All numbers in the post still cross-check against `execution_log.txt`.
- LaTeX math: subscripts escaped as `\_`, no `\big|`, no
  `\text{var\_name}`, no `\\!` / `\\;` — KaTeX-safe per the project
  escaping rules.
- Mermaid subgraph syntax converted from `subgraph ID["Title"]` to
  `subgraph "Title"` to match the convention used elsewhere on the
  site (e.g. `r_did/index.md`).

## Files in this commit

- `content/post/r_causalpolicy_workshop/index.md` — substantial rewrite
- `content/post/r_causalpolicy_workshop/analysis.R` — new SCM
  diagnostics + smarter README pipeline-progress detection
- `content/post/r_causalpolicy_workshop/execution_log.txt` — fresh run
- `content/post/r_causalpolicy_workshop/README.md` — auto-regenerated
- `content/post/r_causalpolicy_workshop/fig10_sc_mspe_ratio.png` — new
- `content/post/r_causalpolicy_workshop/table_sc_loss.csv` — new
- `content/post/r_causalpolicy_workshop/table_sc_predictor_weights.csv` — new
- `content/post/r_causalpolicy_workshop/table_sc_significance.csv` — new
- `logs/2026-05-16-r-causalpolicy-pedagogy-pass.md` — this file
