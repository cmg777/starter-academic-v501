# R fwlplot Tutorial: Visualizing Regression with the FWL Theorem

**Date:** 2026-03-28
**Post:** `content/post/r_fwlplot/`
**Status:** Complete, published. All R code verified end-to-end.

## What was created

An R tutorial on the fwlplot package (Butts & McDermott, 2024) for visualizing the Frisch-Waugh-Lovell theorem. Progresses from simulated confounding (where truth is known) through fixed effects on flights data to panel wage data. Complements the existing Python FWL post with R-specific tools (fwl_plot, fixest, patchwork).

**Key results:**
- Naive coupon coefficient -0.093 reverses to +0.212 after controlling for income (true: +0.2)
- OVB formula predicts bias exactly: 0.300 x -0.494 = -0.148
- FWL manual verification matches feols to 6 decimal places (0.212288)
- Flights: air time coefficient -0.003 (no FE) to -0.007 (origin + dest FE)
- Wages: bivariate experience slope 0.03 triples to 0.122 with individual FE

## Deliverables

| File | Description |
|------|-------------|
| `index.md` | Main tutorial (13 sections) |
| `analysis.R` | Companion R script (fwl_plot + patchwork figures) |
| `featured.webp` | Post thumbnail |
| `infographic_instructions.md` | AI image generation prompt (6-panel chalkboard) |
| `store_data.csv` | Simulated retail data (200 rows) |
| `flights_sample.csv` | Cleaned NYC flights sample (5,000 rows) |
| `wagepan.csv` | Wooldridge wage panel (4,360 rows, 545 individuals, 8 years) |
| 5 PNG figures | fwl_plot() output with patchwork side-by-side layouts |

## Tutorial structure

1. Overview
2. Modeling pipeline (Mermaid)
3. Setup and data (confounding DAG Mermaid, simulated DGP)
4. fwl_plot() in action: naive vs. controlled
5. Under the hood: manual FWL verification, OVB formula with numbers
6. Visualizing fixed effects (nycflights13, progressive FE)
7. Panel data: returns to experience (wooldridge wagepan)
8. Customization, ggplot2 integration, quick reference recipe box
9. Discussion
10. Summary and next steps
11. Exercises
12. Datasets (3 CSVs for reuse)
13. References

## Beginner-friendly improvements applied

- fwl_plot() used as the primary tool throughout (not manual residualization)
- Confounding DAG (Mermaid) showing income backdoor path
- OVB formula with concrete numbers (bias = gamma x delta)
- Intuition-first ordering: 3-step recipe before formal matrix equation
- "Unobserved ability" scaffolded with concrete explanation
- Copy-paste recipe box with 6 fwl_plot() patterns

## Datasets saved for reuse

Three CSV files saved in the post directory for use in future tutorials:
- `store_data.csv`: simulated retail data (sales, coupons, income, dayofweek)
- `flights_sample.csv`: 5,000-row cleaned NYC flights (dep_delay, arr_delay, air_time, origin, dest, carrier, month, day, hour)
- `wagepan.csv`: Wooldridge wage panel (545 individuals x 8 years, 44 variables including lwage, exper, educ, nr, year)
