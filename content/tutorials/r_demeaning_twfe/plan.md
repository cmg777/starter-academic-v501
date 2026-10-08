# Plan: Manual Demeaning and Two-Way Fixed Effects

**Approved:** 2026-04-03

## Scope

- **Topic:** The meaning of panel data demeaning in the TWFE model
- **Dataset:** barro_convergence_panel.csv (1,200 obs; ~150 countries × 8 periods)
- **Language:** R
- **Figure theme:** Light (standard site palette)
- **Framing:** Descriptive/Pedagogical — FWL theorem equivalence demonstration
- **Reference:** referenceMaterials/manual_demeaning_twfe_tutorial.qmd

## Script Sections

0. Setup (packages, seed, colors, variable labels)
1. Data loading + panel structure exploration
2. TWFE estimation with fixest::feols()
3. Manual demeaning step-by-step (country means, time means, grand mean, formula)
4. OLS on demeaned data with lm()
5. Coefficient comparison and equivalence proof
6. Visualizing what demeaning does to the data
7. Standard error comparison and degrees of freedom
8. Summary

## Deliverables

- analysis.R
- execution_log.txt
- ~5 PNG figures
- ~8 CSV tables
- README.md
- plan.md
