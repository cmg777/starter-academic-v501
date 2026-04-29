# Treatment Effects in Stata: A Beginner's Tour of Six Estimators

Companion materials for the tutorial post `content/post/stata_matching/`.

## Topic

Six treatment-effects estimators applied to the maternal-smoking-and-birth-weight case study (`cattaneo2.dta` from Cattaneo, 2010).

## Methods

1. Regression Adjustment (RA)
2. Inverse-Probability Weighting (IPW)
3. Inverse-Probability-Weighted Regression Adjustment (IPWRA)
4. Augmented Inverse-Probability Weighting (AIPW)
5. Nearest-Neighbor Matching (NNM)
6. Propensity-Score Matching (PSM)

A naive (unadjusted) regression is included as a baseline foil.

## Pipeline progress

- [x] Script (`analysis.do`)
- [x] Script review (`script-review.md` — verdict ACCEPT)
- [x] Results report (`results_report.md`)
- [x] Results report review (`results_report_review.md` — verdict ACCEPT)
- [x] Blog post (`index.md`)
- [x] Post review (`post-review.md` — verdict ACCEPT)
- [x] Infographic (`infographic_instructions.md`)
- [x] Infographic review (`infographic_review.md` — verdict ACCEPT)

## Files

### Code & logs

| File | Description |
|---|---|
| `analysis.do` | Full Stata do-file (executes all six estimators + naive baseline) |
| `analysis.log` | Stata batch-mode log from the latest run |
| `execution_log.txt` | Copy of `analysis.log` (canonical name for downstream skills) |
| `plan.md` | Approved scope document for the entire pipeline |

### Figures

| File | Description |
|---|---|
| `stata_matching_density_bweight.png` | Kernel density of birth weight by smoking status (raw) |
| `stata_matching_propensity_distribution.png` | Histogram of estimated propensity scores by treatment group |
| `stata_matching_psm_logic.png` | Annotated scatter showing how PSM matches a smoker to nearest non-smoker(s) |
| `stata_matching_overlap.png` | `teffects overlap` diagnostic after PSM |
| `stata_matching_forest_plot.png` | Forest plot of seven ATE estimates with 95% CIs |

### Tables

| File | Description |
|---|---|
| `ate_estimates.csv` | ATE point estimates and 95% CIs for the seven specifications (machine-readable) |

### Reference materials

`references/` contains the source case-study notes (markdown + slides PDF + raw `cattaneo2.dta`). These are inputs to the tutorial and are not committed to the public repository.

## Stata environment

- Batch run: `"/Applications/Stata/StataSE.app/Contents/MacOS/stata-se" -b do analysis.do`
- Required user package: `coefplot` (installed via `capture ssc install coefplot, replace`)
- Stata version: 18 SE (also tested in older versions; uses `teffects`, `regress`, `kdensity`, `histogram`, `twoway`)
- Random seed: 42

## Headline result

| Estimator | ATE (grams) | 95% CI |
|---|---:|---|
| Naive (unadjusted) | −275.25 | (−316.83, −233.67) |
| 1. Regression Adjustment | −239.64 | (−286.33, −192.94) |
| 2. IPW | −230.91 | (−278.55, −183.26) |
| 3. IPWRA | −231.87 | (−281.17, −182.57) |
| 4. AIPW | −232.48 | (−281.15, −183.80) |
| 5. NNM | −210.06 | (−267.54, −152.57) |
| 6. PSM | −229.45 | (−280.19, −178.71) |

The six adjusted estimators agree that maternal smoking lowers birth weight by roughly 210–240 grams. The naive comparison overstates the gap by ~40–65 grams because mothers who smoke also differ from non-smokers in education, marital status, and prenatal care.
