# Plan: Introduction to Panel Data Methods (Python)

## Scope (approved)

- **Topic:** Comprehensive beginner-friendly introduction to panel data methods using wage_panel_bob4.dta
- **Question:** How does union membership affect log wages across panel estimators?
- **Language:** Python (pyfixest + linearmodels for RE + scipy for Hausman)
- **Theme:** Dark navy
- **Framing:** Descriptive/econometric — comparing estimators under different assumptions
- **Audience:** Beginners — short, commented sections; one regression per method

## Sections

0. Setup (packages, seed, palette, dark rcParams, helpers)
1. Data loading (pd.read_stata, filter 2010 & 2012, clean) + CSV
2. Panel structure (N, T, balance check, descriptive stats) + CSV
3. Between vs within variance decomposition + CSV → Figure 1: variation
4. Wage trajectories (motivation, moved up) → Figure 2: trajectories
5. Pooled OLS (POLS)
6. Between estimator (cross-sectional means)
7. First-Differences (FDFE)
8. Within / Fixed Effects (FE) — manual demeaning + pyfixest absorption + clustered-SE one-liner + DVFE one-liner → Figure 3: demeaning (raw vs demeaned scatter)
9. Two-Way Fixed Effects (TWFE)
10. Random Effects (RE)
11. Hausman test (FE vs RE) using scipy.stats.chi2
12. Correlated Random Effects (CRE / Mundlak)
13. Method comparison + CSV → Figure 4: coef comparison (with Hausman caption)
14. Extended models with controls + CSV → Figure 5: extended models
15. Summary table + key takeaways

## Figures (5)

1. `panel_intro_variation.png` — between vs within variance shares
2. `panel_intro_trajectories.png` — individual wage paths for 30 workers
3. `panel_intro_demeaning.png` — raw vs demeaned scatter (within transformation)
4. `panel_intro_coef_comparison.png` — six estimators with 95% CI; Hausman χ² in caption
5. `panel_intro_extended_models.png` — POLS / TWFE / RE / CRE for union, age, schooling, female

## CSV (6)

raw_data.csv, data_panel.csv, descriptive_stats.csv, variation_decomposition.csv, basic_models_comparison.csv, extended_models_comparison.csv
