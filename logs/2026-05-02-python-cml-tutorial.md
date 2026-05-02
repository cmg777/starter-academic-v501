# Python CML Tutorial: Causal Machine Learning for Policy Evaluation

**Date:** 2026-05-02

## Post topic (`content/post/python_cml/`)

A beginner-friendly tutorial on Causal Machine Learning that walks through the full ATE → GATE → IATE → policy roadmap on a synthetic Flemish-ALMP-style cohort:

- **Dataset**: 5,000 jobseekers, six covariates (age, education, prior employment, Dutch proficiency, sex, migrant), binary training treatment, outcome = months employed in a 30-month window. Data are synthetic so the *true* individual treatment effect is known for every row and every estimator can be benchmarked against the truth.
- **Methods**: `DoubleMLIRM` for the ATE under unconfoundedness, doubly-robust pseudo-outcomes for the GATE by Dutch proficiency, `CausalForestDML` for individual effects, and a simple welfare-maximising assignment rule.
- **Source paper**: Lechner (2023); empirical illustration mirrors Cockx, Lechner & Bollens (2023) — training delivers the largest payoff to jobseekers furthest from the local-language labour market.
- **Headline result**: a "treat where IATE > cost" rule recovers 99.5% of oracle welfare and beats treat-all by 7.4% — the practical reason to estimate individual effects rather than stop at the average.

## Pipeline stages completed

The post was produced through the eight-skill data-science pipeline:

1. **`/project:write-script`** — `script.py` (652 lines, deterministic) + `execution_log.txt` + 6 PNG figures + 9 CSV outputs
2. **`/project:write-results-report`** + **`/project:review-results-report`** — `results_report.md`, ACCEPT verdict, 5 LOW-severity polish fixes applied (runtime provenance, GATE ratio anchoring, jargon softening, line-number reference removed, easy-overlap caveat)
3. **`/project:write-post`** + **`/project:review-post`** — `index.md` (493 lines, 6 figures, 5 display equations, Mermaid roadmap, 10+ interpretation paragraphs), ACCEPT verdict, 6 of 7 fixes applied (citation hygiene, link rename, table-formatter alignment, CSV-origin note, cross-fitting analogy, inline math tightened; user added `featured.webp`)
4. **`/project:write-infographic`** + **`/project:review-infographic`** — `infographic_instructions.md` (4 sections: full prompt, negative prompt, condensed prompt, panel reference data), ACCEPT verdict, 10 fixes total across two passes
5. **Colab notebook** — `notebook.ipynb` (23 cells, 12 markdown + 11 code), self-contained DGP inlined so it runs on a fresh Colab session with just `pip install doubleml econml`. Smoke-tested end-to-end: every number reproduces the post exactly (5.111 / 5.520 / 5.456 / GATEs 7.47/6.13/4.50/2.91 / corr 0.956 / welfare 1.749 vs 1.758).

## Notable design decisions

- **Synthetic DGP**: hidden from the post (the post treats the data as observational with known truths only via `cml_truth.csv`) but **inlined verbatim in the notebook** so a Colab learner sees the full data-generating process, including the selection-on-observables mechanism (caseworkers steer low-Dutch jobseekers — those with the largest effects — into training). This is the key pedagogical decision: post stays clean, notebook is hands-on.
- **Methodological subtlety preserved**: the CausalForestDML mean-of-IATEs CI [5.42, 5.50] is *too narrow* and does not cover the truth (5.628), even though the forest is well-calibrated overall. Flagged in three places (method comparison, discussion, takeaways) so a reader cannot mistake it for an ATE inference tool. **Practical rule: DoubleML for ATE, causal forest for ranking.**
- **Gemini-friendly infographic redesign**: all 6 panels rebuilt in two passes to favour chunky labelled elements over fine spatial alignment. Panel 4 swapped a vertical dashed truth line for a bold "TRUTH = 5.628" header + status-tag rows ("MISSES" / "COVERS" / "AVG OF IATEs"). Panel 3 replaced an interval-on-number-line layout with a side-by-side bias-gap layout. Panel 2 replaced a tally-marks + dial composition with three chunky stat cards. Panels 1, 5, 6 simplified inner pictograms, scatter inset, and outlined-vs-filled distinctions respectively. Same numbers, same colors, same callouts — just chunkier text-based encoding so text-rendering models like Gemini handle them reliably.
- **Citation order**: Athey-Tibshirani-Wager (2019) cited inline in Step 5 where `CausalForestDML` is introduced as the GRF implementation; Athey-Wager (2021) cited inline in Limitations under the policy-tree extension. Reference list ordered by first mention.

## Files added

### Post page bundle (`content/post/python_cml/`)

| Type | Files |
|---|---|
| Post | `index.md`, `notebook.ipynb`, `infographic_instructions.md`, `featured.webp`, `README.md`, `results_report.md` |
| Source + log | `script.py`, `execution_log.txt` |
| Figures | `cml_overlap.png`, `cml_gate_dutch.png`, `cml_iate_scatter.png`, `cml_iate_distribution.png`, `cml_method_comparison.png`, `cml_policy_welfare.png` |
| Datasets | `cml_data.csv`, `cml_truth.csv`, `true_parameters.csv` |
| Analysis tables | `naive_estimate.csv`, `dml_ate.csv`, `gate_by_dutch.csv`, `iate_estimates.csv`, `method_comparison.csv`, `policy_welfare.csv` |

### Logs

- `logs/2026-05-02-python-cml-tutorial.md` (this entry)

### Files intentionally NOT committed

- `content/post/python_cml/plan.md` — internal `/project:write-script` scoping doc
- `content/post/python_cml/script-review.md` — internal `/project:review-script` report
- `content/post/python_cml/results_report_review.md` — internal `/project:review-results-report` report

These are pipeline artifacts that informed development but don't belong in the published repo. Precedent: `content/post/python_dowhy/` and `content/post/python_doubleml/` carry no equivalent files.
