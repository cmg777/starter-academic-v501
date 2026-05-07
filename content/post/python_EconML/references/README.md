# EconML Tutorial: Causal Machine Learning and the Resource Curse

Pedagogical tutorial replicating the main findings of [Hodler, Lechner & Raschky (2023)](https://doi.org/10.1371/journal.pone.0284968) "Institutions and the resource curse: New insights from causal machine learning" (*PLoS ONE*) using the **EconML** library.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/cmg777/starter-academic-v501/blob/master/content/post/python_EconML/references/tutorial-econml-resource-curse.ipynb)

## Overview

This tutorial uses **EconML's `CausalForestDML`** (Microsoft Research / PyWhy) to replicate the paper's three key findings using simulated data with known ground-truth causal effects. It runs in **under 5 minutes** and is fully self-contained --- data is loaded directly from GitHub.

## Three Key Findings Reproduced

| # | Finding | How It Appears |
|---|---------|---------------|
| 1 | Mining increases nighttime lights (NTL) and conflict | Positive ATEs for all mining-vs-no-mining comparisons |
| 2 | Mineral price effects are non-linear | ATE(2-1) ~ 0.05 (small, n.s.) vs ATE(3-1) ~ 0.30 (large, sig.) |
| 3 | Institutions moderate mining effects but NOT price effects | GATE(1-0) slopes with institutions; GATE(3-1) is flat |

## Tutorial Formats

| Format | File | Best For |
|--------|------|----------|
| **Google Colab** | [`tutorial-econml-resource-curse.ipynb`](tutorial-econml-resource-curse.ipynb) | Cloud execution, no local setup |
| **Quarto Notebook** | [`tutorial-econml-resource-curse.qmd`](tutorial-econml-resource-curse.qmd) | Local rendering to HTML |
| **Python Script** | [`tutorial-econml-resource-curse.py`](tutorial-econml-resource-curse.py) | Command-line execution |

## EconML Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `n_estimators` | 500 | Good balance of precision and speed |
| `discrete_treatment` | True | 4 treatment levels |
| `model_y` | GBM(200 trees) | Flexible nuisance model for outcome |
| `model_t` | GBM(200 trees) | Flexible nuisance model for propensity |
| `honest` | True | Honesty for valid inference |
| `inference` | True | BLB confidence intervals |
| `cv` | 5 | 5-fold cross-fitting |
| `min_samples_leaf` | 10 | Prevent overfitting |
| `groups` | district_id | GroupKFold respects panel structure |

## How to Run

### Google Colab (recommended)

Click the "Open in Colab" badge above. The notebook installs all dependencies and downloads the data automatically.

### Local

```bash
# Run the tutorial script (~3-8 minutes)
python tutorial-econml-resource-curse.py

# Or render the Quarto notebook
quarto render tutorial-econml-resource-curse.qmd
```

### Requirements

- Python 3.11+
- `econml` (v0.15+)
- `scikit-learn`, `pandas`, `numpy`, `matplotlib`

## Data

The simulated dataset (3,000 observations = 300 districts x 10 years) is loaded directly from GitHub:

```
https://github.com/quarcs-lab/data-open/raw/master/stata19/sim_resource_curse.csv
```

Ground-truth causal parameters are defined inline in each tutorial format --- no external dependencies required.

## Directory Structure

```text
references/
├── README.md                              # This file
├── tutorial-econml-resource-curse.ipynb    # Colab notebook
├── tutorial-econml-resource-curse.qmd     # Quarto notebook
├── tutorial-econml-resource-curse.py      # Standalone script
└── tutorial_results/                      # Output from script
    ├── ate-table.csv
    ├── descriptive-stats.csv
    └── python_econml_*.png                # Dark-themed figures
```

## References

- Hodler, R., Lechner, M., & Raschky, P.A. (2023). Institutions and the resource curse. *PLoS ONE*, 18(6), e0284968.
- Chernozhukov, V., et al. (2018). Double/Debiased Machine Learning. *Econometrica*, 86(1), 258-298.
- Athey, S. & Imbens, G. (2019). Machine Learning Methods That Economists Should Know About. *Annual Review of Economics*, 11, 685-725.
- EconML documentation: [pywhy.org/EconML](https://www.pywhy.org/EconML/)
