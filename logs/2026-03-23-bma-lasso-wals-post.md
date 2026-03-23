# BMA, LASSO, and WALS Tutorial Post

**Date:** 2026-03-23

## Summary

Added an R-based tutorial post (`content/post/r_bma_lasso_wals/`) covering three principled approaches to variable selection---Bayesian Model Averaging, LASSO, and Weighted Average Least Squares---applied to synthetic cross-country CO2 emissions data with 12 candidate variables (7 true predictors, 5 noise). Uses known ground truth to evaluate each method's ability to distinguish signal from noise.

## Key files

- `content/post/r_bma_lasso_wals/index.md` -- full tutorial (17 sections)
- `content/post/r_bma_lasso_wals/script.R` -- standalone R script generating all figures
- `content/post/r_bma_lasso_wals/notebook.ipynb` -- Google Colab notebook (R kernel)
- `content/post/r_bma_lasso_wals/synthetic-co2-cross-section.csv` -- synthetic dataset (120 countries, 14 variables)
- `content/post/r_bma_lasso_wals/tutorial-public.qmd` -- Quarto source
- `content/post/r_bma_lasso_wals/tutorial-public.html` -- rendered HTML
- `content/post/r_bma_lasso_wals/bma_lasso_wals_*.png` -- 15 dark-theme figures
- `content/post/r_bma_lasso_wals/infographic_instructions.md` -- chalkboard infographic AI prompt

## Key results

- BMA identifies 3 robust variables (PIP >= 0.80): log_gdp (1.00), fossil_fuel (1.00), urban_pop (0.97)
- LASSO selects 5 variables at lambda.1se: log_gdp, fossil_fuel, urban_pop, industry, fdi
- WALS flags 6 variables with |t| >= 2: log_gdp, fossil_fuel, urban_pop, fdi, industry, log_trade
- Triple-robust variables (all 3 methods agree): log_gdp, fossil_fuel, urban_pop, fdi
- FDI is a false positive identified by all three methods (true coefficient = 0)
- BMA: sensitivity 0.43, specificity 0.80; LASSO: 0.57, 0.80; WALS: 0.57, 0.60

## Technical notes

- First R-language tutorial post on the site (previous tutorials use Python)
- Dark navy background figures (`#0f1729`) consistent with site palette
- script.R includes tryCatch fallback for CSV loading (local file when GitHub URL not yet available)
- R packages: BMS, glmnet, WALS, tidyverse, corrplot, patchwork, ggrepel
- Mermaid flowchart in index.md for method overview; `diagram: true` in front matter
- Front matter includes Google Colab (R kernel) and R script links
