# Causal Policy Evaluation Workshop replication (`r_causalpolicy_workshop`)

**Date:** 2026-05-16

## Motivation

New R tutorial replicating the one-day workshop at
<https://causalpolicy.nl/> (ODISSEI Social Data Science team,
CC-BY-4.0). The workshop applies four families of estimators to the
same dataset (California's 1988 Proposition 99 cigarette tax,
`proposition99.rds`, 39 states × 31 years) so participants can compare
them head-to-head. The new post runs *six* estimators and places all
six on a single forest plot.

Differentiation vs the two existing related R posts:

- [`r_did`](/post/r_did/) is a deep dive on staggered DiD with
  Callaway–Sant'Anna and HonestDiD on a minimum-wage panel —
  cross-linked from the new post's Overview as the "go deeper on DiD"
  reference.
- [`r_sc_bayes_spatial`](/post/r_sc_bayes_spatial/) replicates the same
  Proposition 99 case study but extends synthetic control with
  horseshoe-prior Bayesian SCM and SAR spillovers. The new post uses
  *classical* `tidysynth` and cross-links the Bayesian post as the
  "go deeper on SCM" reference.

Coverage gaps the new post fills: **no ITS** post existed in any
language; **no CausalImpact** post existed in any language; **no R**
post existed for RDD.

## Headline numbers (six-estimator forest plot)

| # | Method | Estimate (packs/capita) | 95% interval | Estimand |
|---|--------|------------------------:|--------------|----------|
| 1 | Naive pre-post (1984–1993)        | −27.0 | [−37.4, −16.6] | Descriptive (biased) |
| 2 | DiD vs Nevada                      | −5.7  | [−16.3,  +4.9] | ATT (CA, 1989–1993) |
| 3 | ITS growth-curve                   | −28.3 | [−31.7, −24.9] | Mean post-period gap |
| 4 | ITS ARIMA(1,2,0)                   | +4.5  | [ −0.0,  +9.1] | Mean post-period gap |
| 5 | RDD on time (segmented)            | −20.1 | [−31.0,  −9.1] | Level jump at 1989 |
| 6 | Synthetic Control (`tidysynth`)    | −18.7 | [−22.3, −15.2] | ATT (CA, 1989–2000) |
| 7 | CausalImpact (full covariates)     | −12.8 | [−31.6,  +6.0] | ATT (CA, 1989–2000); 92% posterior probability |

Lesson the post is built around: **5/6 causal estimators agree on a
−13 to −20 pack reduction**, while single-control DiD collapses to
noise (Nevada falling in parallel) and auto-AICc ITS-ARIMA flips sign
(double-differencing over-extrapolates the late-1980s decline).
Synthetic California is a five-state blend: Utah 34.3%, Nevada 23.6%,
Montana 18.2%, Colorado 17.5%, Connecticut 6.2%.

## Pipeline run

All four stages of the data-science post pipeline produced their
artifacts. Plan archived at
`/Users/carlos/.claude/plans/using-my-data-science-moonlit-gem.md`.

| Stage | Skill | Deliverable |
|---|---|---|
| 1 | `write-script` | `analysis.R` (767 lines), `execution_log.txt`, 9 PNG figures (dark navy `#0f1729`), 10 CSV tables |
| 2 | `write-results-report` | `results_report.md` (7 method subsections, 6 key findings, 7 caveats) |
| 3 | `write-post` | `index.md` (646 lines, 15 sections, 9 figures, 6 toggle-card key concepts, 2 display equations) |
| 4 | `write-infographic` | `infographic_instructions.md` (6-panel Hook→Resolution storyboard; Panel 4 = comparison forest plot; BIG numbers 47.9% / +5 to −28 / −18.7) |

## Files added in this commit

- `content/post/r_causalpolicy_workshop/analysis.R`
- `content/post/r_causalpolicy_workshop/index.md`
- `content/post/r_causalpolicy_workshop/results_report.md`
- `content/post/r_causalpolicy_workshop/infographic_instructions.md`
- `content/post/r_causalpolicy_workshop/plan.md`
- `content/post/r_causalpolicy_workshop/README.md`
- `content/post/r_causalpolicy_workshop/execution_log.txt`
- `content/post/r_causalpolicy_workshop/proposition99.rds` (59 KB cached)
- `content/post/r_causalpolicy_workshop/proposition99.csv` (mirror)
- `content/post/r_causalpolicy_workshop/data_california.csv`,
  `data_california_tsibble.csv`, `data_imputed.csv`
- 9 PNG figures: `fig1_raw_series.png` … `fig9_cross_method_forest.png`
- 6 result CSVs: `table_cross_method.csv`,
  `table_sc_unit_weights.csv`, `table_sc_balance.csv`,
  `table_sc_placebo_aces.csv`,
  `table_causalimpact_series.csv`,
  `table_eda_california_prepost.csv`
- `logs/2026-05-16-r-causalpolicy-workshop-tutorial.md` (this file)

## Categories applied

Front matter sets `categories: [R, Policy Evaluation]` and tags
`r, causal, causal inference, policy evaluation, did, its, rdd,
synthetic control, causalimpact, panel data`.

## Verification

- `Rscript analysis.R` exits 0 in ~90 s; produces all 9 PNGs and 10
  CSVs; only cosmetic `fpp3` package-import notices in the log.
- Hugo dev server (0.89.4) builds the post at
  `/post/r_causalpolicy_workshop/`; HTTP 200, all 9 figure references
  resolve, title renders, post appears on `/post/` listing.
- Spot-checked numbers in `index.md` against `execution_log.txt`:
  27.02, 5.68, 28.28, 4.55, 20.06, 18.72, 12.82, 47.9 all present.
- **TODO (manual):** add `featured.png` (or `.webp`) to the post folder
  before this commit ships to Netlify production; the data-science
  skills do not generate it.
