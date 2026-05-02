# Stata CATE Tutorial: Conditional Average Treatment Effects with Stata 19

**Date:** 2026-05-02

## Post topic (`content/post/stata_cate/`)

A pedagogical, beginner-friendly tour of Stata 19's brand-new `cate` command, applied to the canonical 401(k) eligibility study (`webuse assets3`, 9,913 households).

- **Dataset**: assets3 (Chernozhukov & Hansen 2004, shipped with Stata 19). Outcome `assets` (net total financial assets), treatment `e401k` (binary 401(k) eligibility), 8 demographic covariates (age, education, income, incomecat, pension, married, twoearn, ira, ownhome). 37.1% of households are eligible.
- **Methods**: `teffects aipw` (parametric ATE benchmark), `cate po` (partialing-out + lasso + causal forest), `cate aipw` (doubly robust + lasso + causal forest), GATE on prespecified income groups, GATES on data-driven quartiles, `estat heterogeneity / projection / classification / series`.
- **Source**: Stata 19 manual entry on `cate`; Athey-Tibshirani-Wager (2019) for generalized random forests; Chernozhukov et al. (2018) for double/debiased ML.
- **Headline result**: ATE ≈ \$8,000 across three estimators (parametric \$8,019 / PO \$7,937 / ML AIPW \$8,120 — \$183 spread) but the ATE hides a 6:1 fan of household-level effects. Top GATES quartile gains \$17,279; bottom quartile \$2,919 (not significant). Top income category gains \$20,511 vs only \$1,399 for income category 1. Heterogeneity tests reject homogeneity (p = 0.043 PO, p = 0.019 AIPW). Income is the dominant moderator: each \$1,000 of income raises the predicted effect by \$213 (B-spline derivative, p < 0.001).

## Pipeline stages completed

The post was produced through the eight-skill data-science pipeline:

1. **`/project:write-script`** — `analysis.do` (310 lines, heavy pedagogical comments) + `analysis.log` (1,060 lines) + 8 PNG figures + 2 CSV outputs (raw dataset + IATE predictions).
2. **`/project:review-script`** — `script-review.md` (8-dimension scored review), ACCEPT verdict. Two HIGH issues caught and fixed at runtime: `predict, te` (wrong option for `cate`) → `predict, iate`; `estat classification age educ income` (only one var allowed) → three single-var calls. Two MED documentation/dead-code fixes: docstring promised "3 CSVs" but only 2 were produced (the empty `gate_results.csv` was removed because `r(table)` after `cate, reestimate` does not preserve column structure through `svmat`); closing summary updated to match.
3. **`/project:write-results-report`** + **`/project:review-results-report`** — `results_report.md` (9 interpretation paragraphs, 7 key findings, 8 figures fully documented). All 12 spot-checked numbers verified exactly against `analysis.log`. ACCEPT verdict. Surprises section flags the non-monotonic GATE in income category 1 (\$1,399 with CI straddling zero), the bottom-quartile GATES being indistinguishable from zero (p = 0.167), and the wider AIPW IATE histogram tail (sensitivity to extreme propensities).
4. **`/project:write-post`** + **`/project:review-post`** — `index.md` (15 numbered sections, 5 display equations, 1 Mermaid PO/AIPW workflow diagram, 8 figures, 13 interpretation paragraphs). ACCEPT verdict. Two issue classes fixed: 5 unescaped math underscores (in `\Gamma_i`, `G_i`, `d_i`, `y_i`, `\hat{\tau}(x_i)`) → all escaped as `\_` so Goldmark passes them through to KaTeX; the Mermaid label originally contained raw `$\hat{\tau}(x_i)$` (which would have rendered as literal text since Mermaid does not run KaTeX) → changed to plain text `tau-hat(x_i)`.
5. **`/project:write-infographic`** + **`/project:review-infographic`** — `infographic_instructions.md` (4 sections: full prompt, negative prompt, condensed prompt, panel reference data). 6 panels: (1) raw gap vs causal effect, (2) histogram + heterogeneity test, (3) GATE by income, (4) GATES quartile ladder (the comparison-visual panel), (5) profile of high vs low responders, (6) three estimators converging. All 18 panel numbers verified against `analysis.log`. ACCEPT verdict.

## Notable design decisions

- **Stata 19 version gate at the top of the do-file**: `if c(stata_version) < 19 { di as error ... ; log close ; exit 198 }`. Refuses to run on Stata 18 or older with a clear error message instead of cryptic "command cate is unrecognized" output. Documented as a prerequisite in the post's Overview.
- **Folder name normalized**: original drop folder was `content/post/stata-cate/` (hyphen). Renamed to `content/post/stata_cate/` (underscore) to match the project convention established by `stata_rct/` and all `python_*` posts.
- **Single-dataset focus**: the Stata 19 manual entry covers two datasets (`assets3` for the 401(k) study and `lung` for the policy-evaluation vignette). Tutorial uses `assets3` only; `lung` and `estat policyeval` are mentioned as further reading in Section 13. Keeps the script and post tight for a beginner audience.
- **PO-first, AIPW-as-contrast**: tutorial introduces `cate po` first (more robust to small propensities, default causal-forest IATE) and then `cate aipw` as a doubly-robust check. The agreement on the ATE (\$7,937 vs \$8,120) across two fundamentally different specifications is the script's central robustness story.
- **Stata SE 19 (not StataNow MP)**: StataNow MP license expired 2025-10-19 on this machine, so execution used `/Applications/Stata/StataSE.app/Contents/MacOS/stata-se` (Stata 19 SE, fully licensed). Script runs in ~9 minutes wall-clock; MP would be ~3× faster. Documented in README.
- **`reestimate` for GATE**: Section 6 uses `cate, group(incomecat) reestimate` to recycle the Section 4 PO fit instead of re-running cross-fitting + causal forest. Saves ~2 minutes of compute. Section 7 (GATES on quartiles) needs a fresh `group(4)` fit and re-runs the full pipeline.
- **No `teffects overlap` diagnostic**: a propensity-score overlap plot would strengthen the post but was not added because it requires a re-run for one extra figure. Noted as a LOW-severity item in `script-review.md` and as a "diagnostic you might also try" in the post's Limitations.

## Files added

### Post page bundle (`content/post/stata_cate/`)

| Type | Files |
|---|---|
| Post | `index.md`, `infographic_instructions.md`, `README.md`, `results_report.md` |
| Source + log | `analysis.do`, `analysis.log` |
| Figures | `stata_cate_iate_histogram_po.png`, `stata_cate_iateplot_age.png`, `stata_cate_iateplot_educ.png`, `stata_cate_gate_incomecat.png`, `stata_cate_gates_quartiles.png`, `stata_cate_iate_histogram_aipw.png`, `stata_cate_iateplot_educ_aipw.png`, `stata_cate_series_income.png` |
| Datasets | `assets3_raw.csv` (9,913 rows), `iate_predictions.csv` (9,913 rows) |
| References | `references/cate-stata19.md` (195 KB Stata 19 manual entry that seeded the tutorial) |

### Logs

- `logs/2026-05-02-stata-cate-tutorial.md` (this entry)

### Files intentionally NOT committed

- `content/post/stata_cate/plan.md` — internal `/project:write-script` scoping doc
- `content/post/stata_cate/script-review.md` — internal `/project:review-script` report

These are pipeline artifacts that informed development but don't belong in the published repo. Precedent: `content/post/python_cml/` and other recent post bundles carry no equivalent files.

## Final post-header links

| Icon | Label | URL |
|---|---|---|
| `file-code` (fas) | Stata do-file | `analysis.do` |
| `file-alt` (fas) | Stata log | `analysis.log` |

(No Colab — Stata is not Python.)
