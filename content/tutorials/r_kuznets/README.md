# r_kuznets — artifact inventory

Synthetic R replication of **Lessmann (2014)**, "Spatial inequality and development: Is there an inverted-U relationship?" (*J. Development Economics* 106, 35–51).

## Reproduce
```bash
Rscript analysis.R 2>&1 | tee execution_log.txt
```
Requires R ≥ 4.4 with `fixest, np, splines, modelsummary, gt, webshot2, ggplot2, dplyr, tidyr, scales, patchwork, sandwich, lmtest` (auto-installed via `pacman`). `gt` PNG export needs a Chrome/Chromium install. Runs in ~1 minute.

## Source
- `analysis.R` — canonical script (DGP → WCV → all regressions → figures → tables).
- `tutorial.qmd` — Quarto notebook version (in `r_kuznets.zip`).
- `index.md` — the published blog post.

## Datasets (`data/`)
| File | Rows | Description |
|---|---|---|
| `sim_regional_gdp.csv` | 820 | Region-level synthetic GDP p.c. + population shares (one snapshot year per country) |
| `sim_country_panel.csv` | 890 | Country×year analysis panel: WCV, ln(GDP), controls, sectoral share, Gini |

## Figures (300 dpi, dark theme)
`r_kuznets_01_wcv_explainer` · `02_wcv_by_region` · `03_gini_vs_wcv` (Fig 3) · `04_crosssection_polys` · `05_panel_spaghetti` · `06_twfe_fit` · `07_turning_points` · `08_robinson_partial` (Fig 4) · `09_baltagili_annual` / `10_baltagili_5yr` (Fig 5) · `11_sectoral` (Table 6) · `12_log_vs_level` (Fig 7) · `13_exclude_poorest`.

## Regression-table images
`r_kuznets_table2_crosssection` (Table 2) · `table3_panel` (Table 3) · `table4_5_semipar` (Tables 4/5) · `tableA3_summary` (Table A.3).

## Result tables (CSV)
`results_table2_crosssection` · `results_table3_panel` · `results_table4_semipar_cs` · `results_table5_semipar_panel` · `results_table6_sectoral` · `results_tableA3_summary` · `results_turning_points` · `results_gini_wcv_fit` · `results_robustness_subset`.

## Other
- `np_cs_bw.rds` — cached Robinson bandwidth object (regenerated if missing).
- `results_report.md` — structured interpretation + reproduction audit vs the paper.
- `Modeling_the_Williamson_Curve.pdf` → served as `slides.pdf`.
