# Double Machine Learning with 401(k) Pension Data

Estimates the causal effect of 401(k) eligibility and participation on net financial assets using three DoubleML models (PLR, IRM, IIVM) with four ML learners.

## Pipeline Progress

- [x] Script (`script.py`)
- [x] Results report (`results_report.md`)
- [x] Blog post (`index.md`)
- [x] Infographic (`infographic_instructions.md`)

## Dataset

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `pension_raw.csv` | 9,915 | 14 | 1991 SIPP household data |

## Figures

| File | Description |
|------|-------------|
| `pension_eda_outcome.png` | Distribution of net financial assets by 401(k) eligibility |
| `pension_eda_confounding.png` | Income distribution and scatter showing confounding |
| `pension_plr_comparison.png` | PLR estimates across 4 ML learners with CIs |
| `pension_irm_comparison.png` | IRM estimates across 4 ML learners with CIs |
| `pension_iivm_comparison.png` | IIVM estimates across 4 ML learners with CIs |
| `pension_grand_comparison.png` | All models + naive baselines side-by-side |

## CSV Tables

| File | Description |
|------|-------------|
| `pension_raw.csv` | Raw 401(k) pension dataset |
| `eda_summary.csv` | Summary statistics by eligibility status |
| `naive_estimates.csv` | Naive difference-in-means estimates |
| `plr_results.csv` | PLR results (4 learners) |
| `irm_results.csv` | IRM results (4 learners) |
| `iivm_results.csv` | IIVM results (4 learners) |
| `all_results.csv` | Combined results from all models |

## Packages

- doubleml, scikit-learn, xgboost, pandas, numpy, matplotlib
