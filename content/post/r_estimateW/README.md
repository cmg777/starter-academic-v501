# Who Are My Neighbors? Bayesian Estimation of Spatial Weight Matrices in R

**Status:** Script executed successfully
**Language:** R 4.5.2 (x86_64-apple-darwin20), `estimateW` 0.2.0
**Last run:** 2026-07-31

## Overview

Replication and extension of Krisztin & Piribauer (2026), *"estimateW: a Bayesian R
package for estimating spatial weight matrices, with an application to European
regional growth"*. The spatial weight matrix is treated as unknown: all 8,010
off-diagonal cells of the adjacency matrix for 90 European NUTS-1 regions are
estimated jointly with the spatial autoregressive parameter, the slopes and the
error variance, via Gibbs sampling with element-wise Bernoulli updates and a
griddy-Gibbs step for rho.

**All twelve quantities of the paper's Table 3 reproduce exactly** (to the five
decimal places the paper prints), using the paper's own seed 571 and its
200-iteration / 100-retained chain.

Beyond the paper: a ground-truth simulation showing the sampler recovers a known
network, a tour of the full model taxonomy, a benchmark of the estimated map
against queen-contiguity and 7-nearest-neighbour maps built from real GISCO
geometry, and multi-chain convergence diagnostics.

## Pipeline Progress

- [x] Script (`analysis.R`) -- executed
- [x] Script review (`script-review.md`)
- [x] Results report (`results_report.md`)
- [x] Blog post (`index.md`)
- [x] Quarto notebook (`tutorial.qmd`, `r_estimateW.zip`)
- [x] Slides (`slides/`)
- [x] Web app (`web_app/`)
- [x] Infographic (`infographic_instructions.md`)
- [x] AI slides PDF + Spotify podcast link (user-supplied)

## Reproduce

```bash
cd content/post/r_estimateW
Rscript analysis.R 2>&1 | tee execution_log.txt
```

Expensive MCMC fits are memoised into `cache/` under keys that encode seed, n, T,
niter, nretain and kbar, so a stale cache cannot be served silently. **The cache
is committed** (2.2 MB), so a fresh clone reproduces every figure and table in
about a minute rather than the ~40 minutes the three 90-region chains actually
cost. Delete `cache/` or set `ESTIMATEW_REFIT=TRUE` to force a genuine recompute;
`ESTIMATEW_BUDGET_SEC` (default 1600) steers how long the two robustness chains
are allowed to run.

Measured on the machine used for this post (R 4.5.2, reference BLAS):

| Fit | n | T | iterations | seconds |
|---|---:|---:|---:|---:|
| paper-exact `sarw` | 90 | 19 | 200 | 350 |
| robustness chain A | 90 | 19 | 400 | 847 |
| robustness chain B | 90 | 19 | 400 | 811 |
| ground-truth `sarw` | 40 | 20 | 2,000 | 431 |
| all six exogenous-W fits | 90 | 19 | 2,000 each | 39 total |

## Generated Figures

| # | File | Description |
|---|------|-------------|
| 1 | `r_estimateW_01_panel_overview.png` | Growth paths for all 90 regions, and the unconditional beta-convergence scatter |
| 2 | `r_estimateW_02_prior_spatial_cases.png` | Paper Figure 1: four stylized spatially structured priors on a 30-region linear city |
| 3 | `r_estimateW_03_prior_sparsity.png` | Paper Table 2: the three sparsity priors and the prior on the neighbour count each implies |
| 4 | `r_estimateW_04_prior_k_n90.png` | The same three priors at n = 90, showing the flat prior expects 44.5 neighbours |
| 5 | `r_estimateW_05_posterior_estimates.png` | Posterior means and 95% credible intervals for every reported quantity |
| 6 | `r_estimateW_06_trace_paper.png` | Paper Figure 3: trace plots of the 100 retained draws |
| 7 | `r_estimateW_07_trace_long.png` | Trace plots of the two independent robustness chains |
| 8 | `r_estimateW_08_convergence_diag.png` | Running means, effective sample sizes and Geweke z-scores |
| 9 | `r_estimateW_09_W_pip_heatmap.png` | 90x90 posterior probability that region i treats region j as a neighbour |
| 10 | `r_estimateW_10_W_degree.png` | Posterior mean number of neighbours per region, with credible intervals |
| 11 | `r_estimateW_11_network_W.png` | Paper Figure 2a: strongest 10% of estimated links as a network |
| 12 | `r_estimateW_12_network_multiplier.png` | Paper Figure 2b: strongest 10% of spatial multiplier entries |
| 13 | `r_estimateW_13_chord_W.png` | Paper Figure 2a: country-aggregated chord diagram of W |
| 14 | `r_estimateW_14_chord_multiplier.png` | Paper Figure 2b: country-aggregated chord diagram of the multiplier |
| 15 | `r_estimateW_15_exogenous_W.png` | The queen-contiguity and 7-nearest-neighbour matrices we would have assumed |
| 16 | `r_estimateW_16_W_vs_geography.png` | Link probability against distance, ROC against each assumed map, and link composition |
| 17 | `r_estimateW_17_map_arcs.png` | The estimated links drawn as arcs over the NUTS-1 map of Europe |
| 18 | `r_estimateW_18_sim_recovery.png` | Ground truth: recovering a known adjacency matrix from simulated data |
| 19 | `r_estimateW_19_three_maps_impacts.png` | The same SAR model under estimated, contiguity and 7-NN maps |

`featured.webp` is added manually by the site owner and is not produced by this script.

## Generated Tables (CSV)

| # | File | Description |
|---|------|-------------|
| 1 | `r_estimateW_panel_summary.csv` | Per-region growth and covariate summaries with country and group labels |
| 2 | `r_estimateW_geo_crosswalk.csv` | NUTS-1 code to GISCO geometry crosswalk, centroids, queen degree, kNN degree |
| 3 | `r_estimateW_prior_sparsity.csv` | The three sparsity priors at n = 30 and n = 90, with implied p(k) |
| 4 | `r_estimateW_posterior_params.csv` | Posterior mean, SD, quantiles, ESS, Geweke z and MCSE for every parameter and impact |
| 5 | `r_estimateW_table3_audit.csv` | Reproduction audit against the paper's Table 3, with per-row verdicts |
| 6 | `r_estimateW_chain_comparison.csv` | Paper chain vs two robustness chains: means, SDs, ESS, Gelman-Rubin |
| 7 | `r_estimateW_W_degree.csv` | Posterior degree and strength per region, against queen and kNN degrees |
| 8 | `r_estimateW_identification.csv` | The six De Paula-Rasul-Souza conditions, with what was tested vs assumed |
| 9 | `r_estimateW_W_posterior_long.csv` | All 8,010 directed pairs: link probability, weight, multiplier, distance, flags |
| 10 | `r_estimateW_top_links.csv` | The strongest 10% of links of W and of the multiplier, ranked |
| 11 | `r_estimateW_country_flows.csv` | The 26x26 country-aggregated flow matrices behind the chord diagrams |
| 12 | `r_estimateW_W_comparison_metrics.csv` | Estimated W against queen, kNN-7, same-country and same-group benchmarks |
| 13 | `r_estimateW_sim_recovery.csv` | Ground-truth recovery scorecard: AUC, precision, recall, parameter coverage |
| 14 | `r_estimateW_model_taxonomy.csv` | All ten model families fitted, with and without an estimated W |
| 15 | `r_estimateW_runtime.csv` | Per-fit runtime, seeds, R version, BLAS and RNG kind |

## Datasets

| Source | Rows | Cols | Description |
|--------|------|------|-------------|
| `estimateW::nuts1growth` | 1,710 | 6 | 90 NUTS-1 regions x 19 years (2001-2019); growth of GVA per worker, lagged log initial GVA per worker, low and high education shares. Built from Eurostat regional accounts and shipped with the package. |
| GISCO NUTS-1 2021, 20M, EPSG:3035 | 90 | 4 | Region boundaries fetched once from the Eurostat GISCO API and cached in `cache/`, so re-runs are fully offline. |

## Packages

- `estimateW` -- the samplers (`sarw`, `sdmw`, `semw`, `sdemw`, `slxw` and their fixed-W twins), the priors, `sim_dgp`, and the `nuts1growth` data
- `sf` -- NUTS-1 geometry, queen contiguity via `st_touches`, centroids, the map
- `coda` -- effective sample size, Geweke and Gelman-Rubin diagnostics
- `circlize` -- country-aggregated chord diagrams (optional; the script falls back to heatmaps)
- `ggplot2`, `patchwork`, `scales` -- figures
- `dplyr`, `tidyr`, `readr`, `tibble`, `purrr`, `glue` -- data wrangling and output

Deliberately **not** used: `spdep` (queen contiguity comes from `sf::st_touches`),
`igraph`/`ggraph` (network layout is classical MDS, drawn with `geom_curve`), and
`giscoR` (the GISCO GeoJSON is read directly by `sf::st_read`).

## Caveat

The headline chain retains 100 draws, which is the paper's own illustration
budget. Posterior means are stable at that budget -- they reproduce the published
table exactly -- but posterior standard deviations, credible intervals and
individual link rankings are not. With 100 retained draws a link probability is
quantized to 0.01, so a link seen in 3 draws cannot be distinguished from one seen
in 1. The robustness chains quantify the gap. `estimateW` is designed for
cross-sections up to roughly n = 300.
