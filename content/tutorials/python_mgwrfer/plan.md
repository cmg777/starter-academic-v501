# MGWRFER Tutorial: Approved Scope

## Topic
Multiscale Geographically Weighted Fixed Effects Regression (MGWRFER)

## Language
Python (dark theme figures)

## Dataset
Simulated panel data (DGP): 15x15 grid (225 units) x 3 time periods = 675 observations.
True spatially varying coefficients (quadratic, linear, constant, null) with a time-invariant spatial confounder.

## Script Sections
1. Configuration and setup (dark theme, constants)
2. Install custom MGWR package (GeoZhipengLi/MGWPR)
3. Simulate panel data with known DGP
4. Plot true coefficient surfaces
5. Pooled MGWR (naive, ignoring fixed effects)
6. MGWRFER (two-stage: within-transformation + MGWR)
7. Coefficient recovery comparison (scatter plots)
8. Spatial coefficient maps (true vs estimated)
9. Statistical significance analysis
10. Bandwidth comparison
11. Summary

## Deliverables
- script.py
- 6 PNG figures (DPI=300)
- 5 CSV exports
- execution_log.txt
- README.md
- plan.md

## Causal Framing
- Estimand: Local causal effects beta_k(u_i, v_i)
- Identification: Within-transformation removes time-invariant confounders
- Key assumption: No time-varying confounders (strict exogeneity | FE)

## Key Findings
- beta_1 RMSE reduced by 54.6% with MGWRFER
- beta_4 (null) RMSE reduced by 44.7%
- MGWRFER uses smaller, more localized bandwidths
- Within-transformation verified (max unit mean = 7.11e-15)
