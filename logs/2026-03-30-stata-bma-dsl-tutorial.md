# Stata BMA and Double-Selection LASSO Tutorial

**Date:** 2026-03-30

## Summary

Added a Stata tutorial post (`content/post/stata_bma_dsl/`) comparing Bayesian Model Averaging (BMA) and Double-Selection LASSO (DSL) for testing the Environmental Kuznets Curve hypothesis using panel data from 84 countries (1995--2015). Complements the R BMA/LASSO/WALS tutorial (`r_bma_lasso_wals/`) by using real panel data with country and year fixed effects, and replacing WALS with DSL --- a method designed for causal inference with many controls.

## Key files

- `content/post/stata_bma_dsl/index.md` -- full tutorial (11 sections + references, ~700 lines)
- `content/post/stata_bma_dsl/analysis.do` -- Stata do-file with baseline FE, BMA, DSL, and comparison
- `content/post/stata_bma_dsl/analysis.log` -- full Stata 19 output log
- `content/post/stata_bma_dsl/AFG_ML_master_dataset.dta` -- dataset from Gravina & Lanzafame (2025)
- `content/post/stata_bma_dsl/stata_bma_dsl_fig[1-6]*.png` -- 6 figures
- `content/post/stata_bma_dsl/stata_bma_dsl_comparison.csv` -- coefficient comparison table
- `content/post/stata_bma_dsl/infographic_instructions.md` -- chalkboard infographic AI prompt

## Key results

- All four methods (sparse FE, kitchen-sink FE, BMA, DSL) find inverted-N EKC shape (b1 < 0, b2 > 0, b3 < 0)
- BMA turning points: $1,275 (min) and $41,561 (max) GDP per capita
- DSL turning points: $557 (min) and $35,743 (max) GDP per capita
- Baseline FE coefficient instability: b1 shifts 29% (from -5.67 to -7.34) between sparse and kitchen-sink specs
- BMA: 15 of 27 variables have PIP > 0.5; all 3 GDP terms have PIP = 1.00
- DSL: 107 of 132 controls selected by LASSO; all GDP terms significant at 1%
- BMA sampled 2,162 models with sampling correlation 0.96
- Key robust controls: fossil fuel share, tourism, private credit, alternative energy, forest cover, industry VA, Gini index

## Pedagogical features

- Starts with standard FE regressions to motivate model uncertainty before introducing BMA/DSL
- Concept-then-estimation split: BMA theory (Section 5) then results (Section 6), DSL theory (Section 7) then results (Section 8)
- 4 Mermaid diagrams: tutorial pipeline, EKC shapes, BMA workflow, DSL workflow
- 5 display-math equations with plain-language explanations and variable mappings
- 20 interpretation paragraphs with specific numbers (2.5x the minimum of 8)
- 4 analogies: horse race (BMA), smart research assistant (DSL), strictness dial (lambda), flickering (low-PIP variables)
- Cross-reference to the R BMA/LASSO/WALS tutorial
- `bmagraph varmap` and `bmagraph coefdensity` BMA diagnostics included

## Technical notes

- Requires Stata 18+ for `bmaregress` and `dsregress` (run with Stata 19 SE)
- BMA runtime: ~2 minutes with mcmcsize(50000) on Stata 19 SE
- Dataset loaded from GitHub URL for reproducibility
- `reghdfe` used for baseline two-way FE regressions
- `wdi_trade_gdp` dropped by `reghdfe` due to collinearity with imports + exports
