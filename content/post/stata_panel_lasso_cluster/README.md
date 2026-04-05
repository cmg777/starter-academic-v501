# Latent Group Structures in Panel Data (classifylasso)

Stata tutorial demonstrating the Classifier-LASSO method (Su, Shi, Phillips 2016) for identifying latent group structures in panel data. Instead of assuming all units share the same slope coefficients, C-LASSO discovers groups where parameters are homogeneous within groups but heterogeneous across groups.

## Pipeline Progress

- [x] Script (`analysis.do`)
- [ ] Results report (`results_report.md`)
- [ ] Blog post (`index.md`)
- [ ] Infographic (`infographic_instructions.md`)

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `refMaterials/saving.dta` | 840 | 6 | 56 countries x 15 years, savings behavior (Su, Shi, Phillips 2016) |
| `refMaterials/democracy.dta` | 4,018 | 7 | 98 countries x 41 years, democracy and growth (Acemoglu et al. 2019) |

## Figures

| File | Description |
|------|-------------|
| `stata_panel_lasso_cluster_fig1_savings_scatter.png` | Spaghetti plot of savings-to-GDP ratio across 56 countries showing heterogeneity |
| `stata_panel_lasso_cluster_fig2_group_selection_static.png` | Information criterion plot selecting K=2 groups (static savings model) |
| `stata_panel_lasso_cluster_fig3_coef_cpi.png` | CPI coefficient heterogeneity across 2 groups (dynamic savings model) |
| `stata_panel_lasso_cluster_fig4_coef_interest.png` | Interest rate coefficient heterogeneity across 2 groups |
| `stata_panel_lasso_cluster_fig5_democracy_selection.png` | Information criterion plot selecting K=2 groups (democracy model) |
| `stata_panel_lasso_cluster_fig6_democracy_coef.png` | Democracy coefficient polarization: positive in G1 (~57 countries), negative in G2 (~41 countries) |

## CSV Exports

| File | Description |
|------|-------------|
| `stata_panel_lasso_cluster_savings_groups.csv` | Country-group assignments from dynamic savings model (56 countries, 2 groups) |
| `stata_panel_lasso_cluster_democracy_groups.csv` | Country-group assignments from democracy model (98 countries, 2 groups) |
| `stata_panel_lasso_cluster_comparison.csv` | Coefficient comparison: Pooled FE vs C-LASSO groups |

## Key Results

- **Savings model**: IC selects 2 groups (31 vs 25 countries) with heterogeneous responses to CPI and interest rates
- **Democracy model**: IC selects 2 groups — ~57 countries where democracy promotes growth (coef ~2.2), ~41 where it hinders growth (coef ~-1.0)
- Pooled FE democracy coefficient (1.055) masks this fundamental heterogeneity

## Packages

- `classifylasso` (SSC) — Classifier-LASSO estimation
- `reghdfe` (SSC) — High-dimensional fixed effects
- `ftools` (SSC) — Fast tools for large datasets
- `outreg2` (SSC) — Export regression tables

## References

- Su, Shi, Phillips (2016). "Identifying latent structures in panel data." *Econometrica* 84: 2215-2264.
- Huang, Wang, Zhou (2024). "Identify latent group structures in panel data: The classifylasso command." *Stata Journal* 24: 173-203.
- Acemoglu et al. (2019). "Democracy does cause growth." *JPE* 127: 47-100.
