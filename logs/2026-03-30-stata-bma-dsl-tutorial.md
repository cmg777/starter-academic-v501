# Stata BMA and Double-Selection LASSO Tutorial

**Date:** 2026-03-30 (initial), 2026-03-31 (revised with synthetic data)

## Summary

Stata tutorial (`content/post/stata_bma_dsl/`) comparing Bayesian Model Averaging (BMA) and Double-Selection LASSO (DSL) for the Environmental Kuznets Curve. Uses **synthetic panel data** (80 countries, 1995--2014) with a known answer key: 5 true predictors and 7 noise variables. This lets readers verify whether each method correctly recovers the ground truth.

**Revision (2026-03-31):** Replaced the original Gravina & Lanzafame (2025) dataset with fully synthetic data to address data rights, reduce complexity (12 controls instead of 24), and produce readable figures. Added DGP section, answer-key evaluation figure, color-coded PIP chart, and normalized EKC curves.

## Key files

- `content/post/stata_bma_dsl/index.md` -- full tutorial (9 sections, ~600 lines)
- `content/post/stata_bma_dsl/analysis.do` -- analysis script using macros throughout
- `content/post/stata_bma_dsl/generate_data.do` -- standalone DGP script
- `content/post/stata_bma_dsl/synthetic_ekc_panel.csv` -- synthetic dataset (1,600 obs)
- `content/post/stata_bma_dsl/analysis.log` -- full Stata 19 output
- `content/post/stata_bma_dsl/stata_bma_dsl_fig[1-7]*.png` -- 7 figures
- `content/post/stata_bma_dsl/infographic_instructions.md` -- AI image prompt

## Key results

- DGP: b1=-7.1, b2=0.81, b3=-0.03 (inverted-N), turning points at $1,895 and $34,647
- BMA: b1=-7.139, b2=0.808, b3=-0.030, turning points $2,411 and $27,269
- DSL: b1=-7.498, b2=0.849, b3=-0.031, turning points $2,478 and $25,656
- BMA correctly identifies 6/8 true predictors (misses urban and democracy, both weak signals)
- BMA makes 0 false positives: all 7 noise variables get PIP < 0.5
- PIPs for true controls: fossil_fuel=1.000, industry=0.999, renewable=0.959

## Technical notes

- Synthetic data generated with `set seed 20250330` for reproducibility
- Noise variables (globalization, services, trade, credit) correlated with GDP to make selection non-trivial
- PIP chart filters to 15 candidate variables only (excludes 100+ FE dummies from pip matrix)
- EKC curves normalized at sample-mean GDP for direct visual comparison
- Requires Stata 18+ (bmaregress, dsregress) plus reghdfe and labutil packages
