# Plan: Latent Group Structures in Panel Data (classifylasso)

## Scope (approved 2026-04-05)

1. **Topic**: Latent group structures in panel data using classifylasso
2. **Language**: Stata
3. **Figure theme**: Light (default Stata scheme)
4. **Datasets**: saving.dta (56 countries, 16 years) + democracy.dta (98 countries, 41 years)
5. **Framing**: Descriptive/Exploratory with causal interpretation context

## Script Sections

0. Setup (packages, seed, log)
1. Load & explore savings data
2. Baseline pooled & FE regressions
3. C-LASSO — savings, static model
4. C-LASSO — savings, dynamic model (replicates SSP 2016)
5. Load & explore democracy data
6. Pooled FE benchmark — democracy
7. C-LASSO — democracy application (two-way FE, clustered SEs, dynamic)
8. Comparison & CSV exports
9. Wrap-up

## Deliverables

- analysis.do, analysis.log
- 6 PNG figures, 3 CSV tables
- README.md, plan.md

## References

- Su, Shi, Phillips (2016). Econometrica 84: 2215-2264
- Huang, Wang, Zhou (2024). Stata Journal 24: 173-203
- Acemoglu et al. (2019). JPE 127: 47-100
