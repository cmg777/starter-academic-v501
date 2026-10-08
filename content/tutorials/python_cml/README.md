# Python CML Tutorial — Artifact Inventory

Topic: Causal Machine Learning (CML) for policy evaluation.
Dataset: synthetic Flanders-ALMP-style cohort (N = 5,000); true effects known.
Source paper: Lechner (2023); empirical illustration from Cockx, Lechner & Bollens (2023).

## Pipeline progress

- [x] Script (`script.py` + `execution_log.txt`)
- [x] Results report (`results_report.md`)
- [x] Blog post (`index.md`)
- [x] Infographic (`infographic_instructions.md`)
- [x] Colab notebook (`notebook.ipynb`)

## Notebook

| File | Description |
|------|-------------|
| notebook.ipynb | Self-contained Colab walk-through: 23 cells (12 markdown + 11 code), inline DGP, runs end-to-end in ~90 s on free Colab CPU |

## Figures

| File | Description |
|------|-------------|
| cml_overlap.png | Propensity-score overlap by treatment status |
| cml_gate_dutch.png | Estimated vs true GATE by Dutch proficiency |
| cml_iate_scatter.png | Estimated IATE vs true individual effect |
| cml_iate_distribution.png | Distribution of estimated IATEs by Dutch level |
| cml_method_comparison.png | Forest plot: Naive / DML / Causal Forest / Truth |
| cml_policy_welfare.png | Welfare under treat-none / treat-all / IATE / oracle |

## CSV tables

| File | Description |
|------|-------------|
| cml_data.csv | Observed columns of the synthetic cohort (X, D, Y) |
| cml_truth.csv | Hidden ground truth: Y0, Y1, individual effect tau, true propensity |
| true_parameters.csv | Analytic ATE and GATE-by-stratum |
| naive_estimate.csv | Naive difference-in-means ATE |
| dml_ate.csv | DoubleML ATE estimate with 95% CI |
| gate_by_dutch.csv | GATE estimate per Dutch-proficiency stratum |
| iate_estimates.csv | Causal Forest individual effects with 95% CIs |
| method_comparison.csv | Side-by-side comparison of methods vs truth |
| policy_welfare.csv | Welfare comparison across assignment rules |

## Packages used

- numpy, pandas, matplotlib, scikit-learn
- doubleml — `DoubleMLIRM`
- econml — `CausalForestDML`

The Modified Causal Forest (`mcf`) is the package used in the source case
study (Cockx et al. 2023). It is mentioned for reference only and is not a
runtime dependency of this tutorial.
