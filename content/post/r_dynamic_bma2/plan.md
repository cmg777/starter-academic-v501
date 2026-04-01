# Plan: Dynamic Panel BMA for Economic Growth (v2)

**Confirmed:** 2026-04-01
**Language:** R
**Theme:** Dark navy

## Topic

Dynamic panel Bayesian Model Averaging: identifying growth determinants in 73 countries across 4 decades (1970--2000) using the `bdsm` R package. Analysis question: "Which of 9 candidate growth determinants truly drive economic growth, accounting for reverse causality?"

## Framing

Descriptive/variable selection analysis (not causal estimation). BMA identifies robust determinants via posterior inclusion probabilities but does not estimate causal effects.

## Data Preparation Improvement

3-step pipeline (vs v1's 2-step):
1. Standardize regressors (scale)
2. Demean by year (time FE removal)
3. Demean by country (entity FE removal)

## Script Sections

- 0. Setup (packages, seed, colors, dark theme)
- 1. Data loading + CSV export
- 2. Data preparation (3-step) + CSV export
- 3. Model space (precomputed 2^9 = 512 models)
- 4. Benchmark: kitchen-sink FE regression + CSV export
- 5. BMA default prior (EMS = 4.5) + CSV export
- 6. Built-in bdsm visualizations (3 PNGs)
- 7. Best models (top 8) + CSV export
- 8. Prior sensitivity (EMS 2, 4.5, 8; dilution) + CSV export
- 9. Jointness analysis (HCGHM, LS, DW) + CSV export
- 10. Custom ggplot2 dark-theme figures (3 PNGs)
- 11. Summary

## Expected Outputs

- 7 PNG figures
- 10 CSV tables
- README.md
- plan.md (this file)
