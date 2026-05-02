# Conditional Average Treatment Effects (CATE) with Stata 19

A pedagogical tour of Stata 19's new `cate` command on the 401(k) eligibility study (`webuse assets3`, 9,913 households).

## Pipeline progress

- [x] Script (`analysis.do`, `analysis.log`, 8 figures, 2 CSVs)
- [x] Script review (`script-review.md`)
- [x] Results report (`results_report.md`)
- [x] Blog post (`index.md`)
- [x] Infographic (`infographic_instructions.md`)

## Headline numbers

- **Sample:** 9,913 households (assets3)
- **ATE (teffects aipw, parametric):** $8,019 (95% CI: $5,762 – $10,277)
- **ATE (cate po, lasso + causal forest):** $7,937 (95% CI: $5,677 – $10,197)
- **ATE (cate aipw, lasso + causal forest):** $8,120 (95% CI: $5,846 – $10,395)
- **Heterogeneity test (PO):** χ² = 4.11, p = 0.043 → reject homogeneity at 5%
- **Heterogeneity test (AIPW):** χ² = 5.54, p = 0.019 → reject homogeneity more strongly
- **GATE by income (test):** see `analysis.log` Section 6 (`estat gatetest`)

The three ATE point estimates agree to within $200, but the formal heterogeneity tests show the *single number* hides meaningful variation across households — which is the whole point of the tutorial.

## Files in this folder

### Script and log

| File | Description |
|------|-------------|
| `analysis.do` | The main do-file (~310 lines, heavy pedagogical comments) |
| `analysis.log` | Stata text log (1,060 lines) — all results echoed |
| `plan.md` | Approved scope document |
| `script-review.md` | Script review (8-dimension scored review) |
| `results_report.md` | Structured interpretation of every result with domain meaning |
| `index.md` | Blog-post tutorial (15 sections, 5 equations, 1 Mermaid diagram, 8 figures) |
| `infographic_instructions.md` | Chalkboard infographic AI prompt (4 sections: full prompt, negative prompt, condensed, panel reference) |

### Figures (8 PNGs, all width 1200)

| File | Description |
|------|-------------|
| `stata_cate_iate_histogram_po.png` | Distribution of individual treatment effects (PO estimator) |
| `stata_cate_iateplot_age.png` | Estimated CATE as a function of age (PO + causal forest) |
| `stata_cate_iateplot_educ.png` | Estimated CATE as a function of education (PO + causal forest) |
| `stata_cate_gate_incomecat.png` | GATE bar chart across the 5 prespecified income categories |
| `stata_cate_gates_quartiles.png` | GATES bar chart across data-driven quartiles of estimated effect |
| `stata_cate_iate_histogram_aipw.png` | Distribution of individual effects (AIPW, doubly-robust contrast) |
| `stata_cate_iateplot_educ_aipw.png` | AIPW CATE as a function of education (compare with PO version) |
| `stata_cate_series_income.png` | B-spline nonparametric fit of CATE against income (5 knots) |

### CSV exports

| File | Rows | Description |
|------|-----:|-------------|
| `assets3_raw.csv` | 9,913 | Raw assets3 dataset (asset, e401k, demographics) |
| `iate_predictions.csv` | 9,913 | Per-household predicted IATE plus key covariates |

## Methods illustrated

| Section | Topic | Key Stata 19 commands |
|---------|-------|----------------------|
| 0 | Stata 19 version gate | `if c(stata_version) < 19 { exit }` |
| 1 | Setup, globals, seed | `clear all`, `set more off` |
| 2 | Data loading, exploration | `webuse assets3`, `describe`, `summarize`, `tab` |
| 3 | Baseline ATE (motivation) | `teffects aipw`, naive subgroup table |
| 4 | PO estimator | `cate po`, `estat heterogeneity`, `estat projection`, `predict, iate` |
| 5 | IATE function plots | `categraph iateplot age`, `categraph iateplot educ` |
| 6 | GATE on prespecified groups | `cate, group(incomecat) reestimate`, `estat gatetest`, `categraph gateplot` |
| 7 | GATES on data-driven quartiles | `cate po ..., group(4)`, `estat classification` |
| 8 | AIPW estimator (DR contrast) | `cate aipw`, second `estat heterogeneity` |
| 9 | Nonparametric series | `estat series income, graph knots(5)` |

## Stata version requirement

This script requires **Stata 19 or later**. The `cate` command is brand-new in Stata 19; it does not exist in 18 or earlier. The script aborts at startup if `c(stata_version) < 19` so the user gets a clear error rather than `command cate is unrecognized`.

Tested with: Stata SE 19 (StataNow MP also compatible if license is current).

## Re-running

```bash
cd content/post/stata_cate/
"/Applications/Stata/StataSE.app/Contents/MacOS/stata-se" -b do analysis.do
```

Approximate runtime: 7–10 minutes (cross-fitting + causal forest are CPU-intensive; runtime scales roughly linearly with `xfolds()` and the random-forest tree count).
