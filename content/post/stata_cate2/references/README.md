# Stata 19 CATE Tutorial: Causal Machine Learning and the Resource Curse

Pedagogical tutorial replicating the main findings of [Hodler, Lechner & Raschky (2023)](https://doi.org/10.1371/journal.pone.0284968) "Institutions and the resource curse: New insights from causal machine learning" (*PLoS ONE*) using **Stata 19's `cate` command**.

## Overview

This tutorial uses Stata 19's native `cate` command suite to estimate Conditional Average Treatment Effects (CATEs) via generalized random forests. It replicates the paper's three key findings using simulated data with known ground-truth causal effects, runs in approximately **20--30 minutes**, and uses the same dataset as the companion [MCF tutorial](../MCF/README.md) and [EconML tutorial](../EconML/README.md).

## Three Key Findings Reproduced

| # | Finding | How It Appears |
|---|---------|---------------|
| 1 | Mining increases nighttime lights (NTL) and conflict | Positive ATEs for all mining-vs-no-mining comparisons |
| 2 | Mineral price effects are non-linear | ATE(2-1) ~ 0.05 (small, n.s.) vs ATE(3-1) ~ 0.30 (large, sig.) |
| 3 | Institutions moderate mining effects but NOT price effects | GATE(1-0) slopes upward with institutions; GATE(3-1) is flat |

## Requirements

- **Stata 19** (with `cate` command support)
- **nbstata** (Stata kernel for Jupyter/Quarto) --- for rendering the notebook
- **Quarto** (for HTML rendering)

No additional Stata packages or Python dependencies are required.

## How to Run

### Render the Quarto notebook

```bash
quarto render stataCATE/tutorial-cate-resource-curse.qmd
```

### Requirements for nbstata

```bash
pip install nbstata
python -m nbstata.install
```

Ensure `nbstata` is configured to use your Stata 19 installation.

## Stata 19 CATE Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Estimators | PO + AIPW | Both shown for robustness comparison |
| `xfolds` | 5 | Reduced from default 10; subsets have 300-1500 obs |
| `omethod` | rforest (key) / lasso (other) | Random forest for flexibility on key contrasts |
| `tmethod` | rforest (key) / lasso (other) | Matches outcome model specification |
| `cmethod` | rforest (default) | Nonparametric CATE estimation via GRF |
| `rseed` | 12345 | Reproducibility |
| `group()` | exec_constraints, quality_of_govt | Prespecified institutional moderators |
| `controls()` | i.country_id i.year | Panel FE as nuisance controls |

## Approach: Binary Pairwise Comparisons

Stata 19's `cate` requires a binary treatment variable. Since the original study uses a 4-level treatment (0=no mining, 1/2/3=mining at low/medium/high prices), we run **6 separate binary comparisons**:

| Contrast | Subsample | Finding |
|----------|-----------|---------|
| 1-0 | Mining vs No mining | Finding 1 |
| 2-0 | Medium price vs No mining | Finding 1 |
| 3-0 | High price vs No mining | Finding 1 |
| 2-1 | Medium vs Low prices | Finding 2 (small) |
| 3-1 | High vs Low prices | Finding 2 (large) |
| 3-2 | High vs Medium prices | Finding 2 |

## Stata 19 vs MCF vs EconML

| Feature | MCF (Python) | EconML (Python) | Stata 19 (this) |
|---------|:---:|:---:|:---:|
| Framework | Modified Causal Forest | Double Machine Learning | PO + AIPW |
| Treatment type | Multi-valued (native) | Multi-valued (native) | Binary (pairwise) |
| GATE computation | Built-in | Manual | Built-in (`group()`) |
| Formal tests | No | No | `estat heterogeneity`, `estat gatetest` |
| IATE visualization | No | CATE interpreter tree | `categraph iateplot` |
| Software | Python + mcf | Python + econml | Stata 19 (built-in) |
| Runtime | ~3-5 min | ~1-3 min | ~20-30 min |

## Directory Structure

```
stataCATE/
├── tutorial-cate-resource-curse.qmd    # Main Quarto notebook (nbstata)
├── data/
│   ├── sim_resource_curse.csv          # Simulated dataset (self-contained copy)
│   └── sim_resource_curse.dta          # Stata version (generated on first run)
├── tutorial_results/                   # Output folder (gitignored)
├── cate-stata19-manual.md              # Stata 19 CATE reference documentation
└── README.md                           # This file
```

## Simulated Data

The tutorial uses the same simulated dataset as the MCF and EconML tutorials (`MCF/data/sim_resource_curse.csv`), converted to Stata format on first run:

- **3,000 observations** = 300 districts × 10 years
- **8 countries** with varying institutional quality
- **4 treatment groups**: 0 (no mining, 85%), 1/2/3 (mining at low/med/high prices, ~5% each)
- **2 outcomes**: Log nighttime lights (continuous), Conflict (binary)
- **10 covariates**: Institutional, economic, and geographic variables

### Ground-Truth ATEs (from DGP)

| Contrast | NTL (log) | Interpretation |
|----------|:---------:|---------------|
| 1-0 | 0.25 | Mining effect at mean institutions |
| 2-0 | 0.30 | Mining + medium price premium |
| 3-0 | 0.55 | Mining + high price premium |
| 2-1 | 0.05 | Medium price premium (small) |
| 3-1 | 0.30 | High price premium (large) |
| 3-2 | 0.25 | High vs medium step |

## References

- Hodler, R., Lechner, M., & Raschky, P. A. (2023). Institutions and the resource curse: New insights from causal machine learning. *PLoS ONE*, 18(5), e0284968.
- Athey, S., Tibshirani, J., & Wager, S. (2019). Generalized random forests. *Annals of Statistics*, 47(2), 1148-1178.
- Nie, X., & Wager, S. (2021). Quasi-oracle estimation of heterogeneous treatment effects. *Biometrika*, 108(2), 299-319.
- Knaus, M. C. (2022). Double machine learning-based programme evaluation under unconfoundedness. *Econometrics Journal*, 25(3), 602-627.
- Kennedy, E. H. (2023). Towards optimal doubly robust estimation of heterogeneous causal effects. *Electronic Journal of Statistics*, 17(2), 3008-3049.
