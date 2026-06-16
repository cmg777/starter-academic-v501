# Regional Inequality from Outer Space — Python replication

A comprehensive Python replication of **Lessmann & Seidel (2017)**, "Regional inequality,
convergence, and its determinants — A view from outer space" (*European Economic Review*
92, 110–132). Nighttime lights are turned into predicted regional GDP, five
population-weighted inequality indices are built from scratch, and the regional Kuznets
curve, its determinants and a spatial robustness check are estimated.

**Methods:** PyFixest (panel fixed effects), linearmodels (random effects sidebar for
Table 1), a from-scratch Conley spatial-HAC variance, and inequality math from first
principles. No geospatial maps.

## Pipeline progress

- [x] Script (`script.py`, `execution_log.txt`, figures, CSVs)
- [x] Results report (`results_report.md`)
- [x] Blog post (`index.md`)
- [x] Jupyter notebook (`notebook.ipynb`)
- [x] Interactive web app (`web_app/`)
- [x] Slide deck (`slides/`)
- [x] Infographic prompt (`infographic_instructions.md`)
- [x] Quarto bundle (`python_kuznets_dmsp.zip`)
- [x] ES / JA stub cards

## Figures

| File | Description |
|------|-------------|
| `python_kuznets_dmsp_01_distributions.png` | Distributions of log lights, log regional GDP p.c., and GINIW |
| `python_kuznets_dmsp_02_time_trends.png` | Mean regional inequality and income, 1992–2012 |
| `python_kuznets_dmsp_03_by_wb_region.png` | Regional inequality (GINIW) across World Bank regions |
| `python_kuznets_dmsp_04_index_corr_heatmap.png` | Co-movement of the five inequality indices |
| `python_kuznets_dmsp_05_table1.png` | Table 1 — lights predict regional GDP (FE vs RE) |
| `python_kuznets_dmsp_06_predicted_vs_observed.png` | Predicted vs observed regional income (r = 0.925) |
| `python_kuznets_dmsp_07_population_weights.png` | Weighted vs unweighted Gini — the role of population weights |
| `python_kuznets_dmsp_08_table2_correlations.png` | Predicted/light vs observed inequality (Table 2) |
| `python_kuznets_dmsp_09_table3.png` | Table 3 — the regional Kuznets cubic |
| `python_kuznets_dmsp_10_kuznets_scatter.png` | Regional inequality vs development with fitted cubic (Fig 4) |
| `python_kuznets_dmsp_11_table4.png` | Table 4 — determinants of regional inequality |
| `python_kuznets_dmsp_12_conley_se.png` | Spatial robustness: Conley standard errors (Table B.4) |
| `python_kuznets_dmsp_13_regional_vs_personal.png` | Regional vs personal inequality (Fig 5a) |

## CSV result files

| File | Description |
|------|-------------|
| `python_kuznets_dmsp_eda_summary.csv` | By-region means of GINIW and log GDP per capita |
| `python_kuznets_dmsp_table1_results.csv` | Light elasticities (FE and RE) for the 7 specifications |
| `python_kuznets_dmsp_table2_indices.csv` | Five inequality indices per country-year (built from scratch) |
| `python_kuznets_dmsp_table2_correlations.csv` | Predicted/light vs observed correlations for 5 indices |
| `python_kuznets_dmsp_popweight_compare.csv` | Weighted vs unweighted Gini per country-year |
| `python_kuznets_dmsp_index_crosscheck.csv` | Training-subset vs published GINIW |
| `python_kuznets_dmsp_table3_results.csv` | Kuznets cubic coefficients (five indices) |
| `python_kuznets_dmsp_table4_results.csv` | Determinant coefficients (five blocks) |
| `python_kuznets_dmsp_tableB4_results.csv` | Point estimate + iid and Conley SEs |
| `python_kuznets_dmsp_fig4_cubic.csv` | Fitted cubic for the Kuznets scatter |
| `python_kuznets_dmsp_fig5_fit.csv` | OLS slope/intercept for regional vs personal inequality |

## Bundled data (`data/`)

| File | Rows | Description |
|------|------|-------------|
| `Prediction_Data.csv` | 5,258 | Region-year training set: lights, observed GDP, controls, region/satellite dummies |
| `Table_2_data.csv` | 5,258 | Region-year: predicted & observed GDP p.c., lights, populations (inequality inputs) |
| `Table_3_data.csv` | 3,675 | Country-year: national GDP p.c. and five precomputed inequality indices |
| `Table_4_data.csv` | 3,675 | Country-year: inequality + determinant controls |
| `Table_B4_data.csv` | 5,258 | Region-year: lights, GDP, latitude/longitude, satellite dummies |
| `Figure_5_data.csv` | 3,675 | Country-year: regional inequality (GINIW) and household-income Gini |

## Run

```bash
python script.py          # needs Python ≥ 3.10
# pip install pandas numpy matplotlib statsmodels scipy linearmodels pyfixest
```

## Packages

pandas, numpy, matplotlib, statsmodels, scipy, linearmodels, pyfixest.

## Source

Data and original Stata/R/Python code adapted from the authors' replication archive for
Lessmann & Seidel (2017). The 2 ICRG-dependent results (Table 4 column 4, Figure 5b)
require licensed data and are not reproduced.
