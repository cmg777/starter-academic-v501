# r_did2 -- A streamlined introduction to DiD for regional data

**Source:** Baker, Callaway, Cunningham, Goodman-Bacon & Sant'Anna (2024),
*Difference-in-Differences Designs: A Practitioner's Guide* (manuscript in `reference/`).

**Pedagogical focus:** every estimator is reported population-weighted and unweighted,
side-by-side, to make clear that weighting changes the *target parameter* (not just
its variance) when the units of analysis are regions of very different sizes.

## Pipeline progress

- [x] Script (`analysis.R`)
- [x] Results report (`results_report.md`)
- [x] Blog post (`index.md`)
- [ ] Infographic (`infographic_instructions.md`)
- [x] Quarto notebook (`tutorial.qmd`)

## Figures

| File | Description |
|---|---|
| r_did2_01_headline_2x2.png   | 2x2 cell-means plot; unweighted vs weighted side-by-side. |
| r_did2_02_twfe_2x2.png       | Three TWFE specifications, two weighting choices. |
| r_did2_03_propensity.png     | Propensity-score densities by expansion status. |
| r_did2_04_drdid_forest.png   | OR / IPW / DRDID + TWFE baseline forest plot. |
| r_did2_05_event_2xT.png      | 2xT event study for 2014 expanders vs never-expanders. |
| r_did2_06_attgt_groups.png   | By-cohort ATT(g) under the full GxT design. |
| r_did2_07_event_gxt.png      | GxT dynamic event-study aggregation. |
| r_did2_08_honestdid.png      | HonestDiD relative-magnitudes sensitivity. |

## CSV tables

| File | Description |
|---|---|
| raw_data.csv                 | Copy of the curated source CSV (input). |
| data_prepared.csv            | Analysis-ready county-year panel after filtering. |
| table_adoption_cohorts.csv   | Expansion cohort counts and population shares. |
| table_2x2_means.csv          | 2x2 cell-means + DiD, unweighted and weighted. |
| table_2x2_twfe.csv           | Six TWFE specifications. |
| table_covariate_balance.csv  | Normalized differences for covariates in 2013. |
| table_propensity_models.csv  | Propensity-score logit coefficients. |
| table_2x2_drdid.csv          | OR / IPW / DRDID 2x2 estimates. |
| table_event_2xT.csv          | 2xT event-study ATT(e). |
| table_attgt_gxt.csv          | Raw group-by-time ATT(g,t). |
| table_attgt_gxt_grouped.csv  | Cohort-aggregated ATT(g). |
| table_event_gxt.csv          | GxT dynamic event-study ATT(e). |
| table_honestdid.csv          | HonestDiD bounds across Mbar values. |
| summary.csv                  | Headline estimates table (unweighted vs weighted). |

## Review reports

| File | Description |
|---|---|
| script-review.md             | Expert review of `analysis.R` across 8 quality dimensions. |

## Datasets

| county_mortality_data.csv (input) | 31843 rows x 22 cols | CDC county mortality 2009-2019 + ACA expansion timing. |
| data_prepared.csv                 | 28644 rows x 17 cols | Analysis panel: 2,604 counties x 11 years. |

## R packages used

tidyverse, fixest, did, DRDID, HonestDiD, broom, scales, here, pacman.

