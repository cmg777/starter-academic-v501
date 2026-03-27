# R SDPDmod Tutorial: Spatial Dynamic Panel Data Modeling

**Date:** 2026-03-28
**Post:** `content/post/r_SDPDmod/`
**Status:** Complete, published. All R code verified end-to-end.

## What was created

A comprehensive R tutorial on the SDPDmod package (Simonovska, 2025) for spatial dynamic panel data modeling, applied to the classic Cigar dataset (cigarette consumption across 46 US states, 1963--1992). This is the R companion to the existing Stata spatial panel tutorial (`stata_sp_regression_panel`), using the same dataset for cross-software comparability.

**Key findings:**
- SDM overwhelmingly preferred by Bayesian comparison (99.89% with individual FE)
- Total price elasticity (-1.23) is 22% larger than the direct effect (-1.01), revealing spatial spillovers
- Habit persistence (tau = 0.86) dominates dynamics; static models overstate contemporaneous spatial effects
- Cross-border shopping effect (W*logp = 0.20, positive) emerges only in the dynamic SDM
- Short-run price elasticity (-0.26) is one-quarter of the static estimate (-1.01)

## Deliverables

| File | Description |
|------|-------------|
| `index.md` | Main tutorial (14 sections, 837 lines) |
| `analysis.R` | Companion R script (full reproducible pipeline) |
| `r_SDPDmod_fig1_weight_matrix.png` | Heatmap with state abbreviations |
| `r_SDPDmod_fig2_model_comparison.png` | Bayesian model probabilities |
| `r_SDPDmod_fig3_impact_decomposition.png` | Pointrange effect decomposition |
| `r_SDPDmod_fig4_eda_spaghetti.png` | EDA spaghetti plot of sales over time |
| `infographic_instructions.md` | AI image generation prompt (6-panel chalkboard) |
| `featured.webp` | Post thumbnail |

## Tutorial structure

1. Overview
2. Modeling pipeline (Mermaid diagram)
3. Setup and data preparation (EDA spaghetti plot, pimin correlation)
4. Visualizing the spatial weight matrix (heatmap, alternative 2nd-order W)
5. Bayesian model comparison (blmpSDPD: static/dynamic, individual/two-way FE)
6. Non-spatial baseline (plm two-way FE)
7. Static SAR estimation + impact decomposition
8. Static SDM with Lee-Yu correction + impact decomposition
9. Dynamic spatial panel models (SAR and SDM with temporal/spatiotemporal lags)
10. Effect decomposition summary (pointrange figure)
11. Discussion (robustness with 2nd-order W)
12. Summary and next steps
13. Exercises (4 hands-on exercises)
14. References (6 academic sources)

## Quality assurance

- Proofread (10-point checklist): all issues resolved
- Referee report: MINOR REVISION verdict, all issues addressed
- All numeric values cross-checked against R output
- Section cross-references verified after renumbering
- No orphaned images; all 4 PNGs referenced
- Hugo build successful (476 pages)

## Reference material

The SDPDmod package source code and paper are archived at `content/post/r_SDPDmod_reference/SDPDmod-master/` (not deployed to Netlify).
