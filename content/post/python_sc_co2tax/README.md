# Carbon Taxes and CO2 Emissions: A Synthetic-Control Analysis in Python

**Status:** Pipeline complete (script + report + post + infographic)
**Language:** Python 3.12
**Last run:** 2026-05-16
**Site URL:** <https://carlos-mendez.org/post/python_sc_co2tax/>

## Overview

Python replication of the RTutor problem set ["Carbon Taxes and CO2 Emissions"](https://github.com/TheresaGraefe/RTutorCarbonTaxesAndCO2Emissions) by Theresa Graefe (2020), which in turn replicates [Andersson (2019), *"Carbon Taxes and CO2 Emissions: Sweden as a Case Study"*](https://doi.org/10.1257/pol.20170144) (*AEJ: Economic Policy* 11(4)). Uses [`pysyncon`](https://sdfordham.github.io/pysyncon/) for Synthetic Sweden + placebos and [`pyfixest`](https://pyfixest.org/) for OLS / IV regressions, with Newey–West HAC standard errors via `statsmodels`. All five exercises covered (descriptive overview, DiD + SCM + placebos, GDP confounding, OLS / IV / disentangling). Dark-theme figures throughout.

## Pipeline progress

- [x] **Script** (`script.py`) — executed cleanly, 286-line `execution_log.txt`
- [x] **Results report** (`results_report.md`) — 8 key findings with specific numbers
- [x] **Blog post** (`index.md` + `notebook.ipynb`) — sandwich pattern, 17 figures referenced, ≥2 display-math equations, Mermaid roadmap diagram
- [x] **Infographic** (`infographic_instructions.md`) — 6-panel chalkboard storyboard with Story Spine and 3 BIG anchor numbers
- [x] **Hugo smoke test** — local build clean, TOC sidebar + featured-image both render

## Headline numbers (replicated from Andersson 2019)

| Quantity | Value |
|---|---|
| DiD (Sweden vs Denmark) on `Sweden_post` | **−0.140** t CO2 / capita |
| DiD (Sweden vs OECD, cluster SE) on `Sweden_post` | **−0.214** t CO2 / capita (p = 0.02) |
| Synthetic Sweden — average post-treatment % reduction | **−11.3 %** (1990 – 2005) |
| Permutation placebo p-value | **0.067** |
| OLS4 price semi-elasticity (β₁) | **−0.060** |
| OLS4 tax semi-elasticity (β₂) | **−0.186** |
| Tax pass-through coefficient | **1.15** (≈ 1, full pass-through) |
| GDP-Synth gap (Sweden vs Synth-GDP) in 2005 | < **$233** / capita — no growth penalty |

## Generated figures (17 PNGs, 300 dpi, dark theme)

| # | File | Description |
|---|---|---|
| 1 | `python_sc_co2tax_gasoline_price_components.png` | Sweden's real wholesale price + energy / carbon / VAT taxes, 1960–2005 |
| 2 | `python_sc_co2tax_retail_price.png` | Sweden's real retail price decomposed into wholesale + total tax |
| 3 | `python_sc_co2tax_co2_vs_consumption.png` | Sweden CO2 vs OECD mean + gasoline / diesel consumption |
| 4 | `python_sc_co2tax_co2_donor_pool.png` | Small-multiples of CO2 trajectories for 15 OECD countries |
| 5 | `python_sc_co2tax_did_sweden_denmark.png` | DiD visual — Sweden vs Denmark |
| 6 | `python_sc_co2tax_synth_sweden_fit.png` | Sweden actual vs Synthetic Sweden, 1960–2005 |
| 7 | `python_sc_co2tax_synth_weights.png` | Horizontal bar chart of donor country weights |
| 8 | `python_sc_co2tax_synth_gap.png` | Year-by-year treatment gap |
| 9 | `python_sc_co2tax_placebo_in_time.png` | In-time placebo, treatment backdated to 1980 |
| 10 | `python_sc_co2tax_placebo_in_space.png` | Sweden's gap overlaid on donor-pool placebos |
| 11 | `python_sc_co2tax_placebo_mspe_ratio.png` | Post/pre MSPE ratio per unit (permutation p = 0.067) |
| 12 | `python_sc_co2tax_placebo_leave_one_out.png` | Leave-one-out sensitivity across high-weight donors |
| 13 | `python_sc_co2tax_gdp_co2_levels.png` | Sweden GDP per capita + CO2 per capita |
| 14 | `python_sc_co2tax_gdp_co2_gaps.png` | GDP and CO2 gaps vs Synth(CO2) with recessions shaded |
| 15 | `python_sc_co2tax_gdp_synth.png` | Sweden actual GDP vs Synthetic-GDP Sweden |
| 16 | `python_sc_co2tax_iv_vs_ols_coefs.png` | Price and tax semi-elasticities — OLS4 vs 3 IV variants |
| 17 | `python_sc_co2tax_disentangling.png` | Three counterfactual CO2 paths — disentangling carbon tax from VAT |

## Generated tables (8 CSVs)

| File | Description |
|---|---|
| `tab_did_comparison.csv` | DiD coefficients (Sweden vs Denmark; Sweden vs OECD pool) |
| `tab_synth_sweden.csv` | Sweden vs Synthetic Sweden series + gap, 1960–2005 (46 rows) |
| `tab_synth_weights.csv` | Donor weights for Synthetic Sweden |
| `tab_placebo_mspe_ratios.csv` | Post/pre MSPE ratios for in-space placebos |
| `tab_ols_newey_west.csv` | Wide table of OLS1–4 coefficients + Newey–West HAC(16) SEs |
| `tab_iv_comparison.csv` | OLS4 vs three IV specifications (energy tax, oil price, both) |
| `tab_disentangling.csv` | Andersson's three counterfactual emission paths, 1970–2005 |
| `tab_headline_summary.csv` | Single-row table of all headline numbers above |

## Datasets

Read directly from `references/RTutorCarbonTax-master/inst/ps/CarbonTaxesAndCO2Emissions/material/`:

| File | Rows × Cols | Description |
|---|---|---|
| `carbontax_data.dta` | 690 × 9 | OECD panel 1960–2005, 15 countries — outcome + 4 SCM predictors |
| `disentangling_data.dta` | 46 × 6 | Sweden time series — Andersson's 3 counterfactual emission paths |
| `leave_one_out_data.dta` | 46 × 9 | Pre-computed leave-one-out synthetic series |
| `descr_Sweden.Rds` | 46 × 14 | Sweden gasoline-price components + CO2 / GDP gaps |
| `regression_data.Rds` | 46 × 17 | OLS / IV regression panel, 1970–2015 |
| `GDP_data.Rds` | 468 × 8 | 13-country GDP panel for the Synthetic-GDP exercise |

## Python packages

- `pysyncon` 1.5.1 — synthetic control + placebos (`Dataprep` → `Synth.fit()`)
- `pyfixest` 0.50.1 — OLS, IV, cluster / HC robust SEs via `feols()`
- `statsmodels` — Newey–West HAC standard errors (`maxlags = 16`)
- `pyreadr` 0.5.6 — read `.Rds` files without R
- `pandas`, `numpy`, `matplotlib` — core scientific-Python stack

## How to reproduce

```bash
cd content/post/python_sc_co2tax
pip install pyfixest pysyncon pyreadr statsmodels
python script.py 2>&1 | tee execution_log.txt
```

Runtime ~25 seconds (dominated by 15 in-space placebo SCM fits). All
figures and CSVs regenerate in place.
