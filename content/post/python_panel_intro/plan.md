# Plan: Introduction to Panel Data Methods (Python)

## Scope (approved)

- **Topic:** Introduction to panel data methods using wage_panel_bob4.dta
- **Question:** How does union membership affect log wages across panel estimators?
- **Language:** Python (pyfixest + linearmodels for RE)
- **Theme:** Dark navy
- **Framing:** Descriptive/econometric — comparing estimators under different assumptions

## Sections

0. Setup (packages, seed, colors, dark rcParams)
1. Data loading (pd.read_stata, filter 2010 & 2012) + CSV
2. Descriptive statistics (panel summary, between/within) + CSV
3. Pooled OLS (POLS)
4. First-Differencing FE (FDFE) — manual diff + OLS
5. Time-Demeaning FE (TDFE) — pf.feols with | ID
6. TDFE v2 (reghdfe-style) — clustered SE
7. Dummy Variable FE (DVFE) — explicit C(ID)
8. Random Effects (RE) — linearmodels
9. Correlated Random Effects (CRE/Mundlak) — group means + RE
10. Extended models (POLS, TWFE, RE, CRE + controls)
11. Summary comparison table + CSV

## Figures (~4)

1. panel_intro_variation.png — between vs within variation
2. panel_intro_coef_comparison.png — union coef across 6 methods
3. panel_intro_extended_models.png — extended model comparison
4. panel_intro_wage_trajectories.png — individual wage paths

## CSV (~6)

raw_data.csv, data_panel.csv, descriptive_stats.csv,
variation_decomposition.csv, basic_models_comparison.csv,
extended_models_comparison.csv
