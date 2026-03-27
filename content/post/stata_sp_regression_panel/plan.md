# Plan: Stata Spatial Panel Regression Tutorial (Cigarette Demand)

**Approved:** 2026-03-27

## Scope

- **Topic:** Spatial panel regression with cigarette demand data
- **Language:** Stata
- **Dataset:** Baltagi cigarette demand (46 US states, 1963--1992)
- **Case study question:** Does cigarette consumption in one state depend on prices and income in neighboring states, and how do spatial spillovers change when we account for habit persistence?
- **Post type:** Spatial econometrics tutorial
- **Progression:** Non-spatial panels → SDM → Wald tests → Dynamic SDM

## Sections

1. Overview + learning objectives
2. Modeling pipeline (Mermaid)
3. Setup and data loading
4. Non-spatial panel models (Pooled OLS, Region FE, Time FE, Two-way FE, comparison)
5. Why spatial models? (SDM equation, nesting Mermaid diagram)
6. Spatial Durbin Model (SDM with two-way FE, Lee-Yu correction, comparison)
7. Wald specification tests (SAR, SLX, SEM, decision Mermaid diagram)
8. Dynamic spatial panels (3 variants + comparison)
9. Discussion
10. Summary and next steps
11. Exercises
12. References

## Deliverables

- `index.md` --- full tutorial
- `analysis.do` --- companion do-file
- `analysis.log` --- Stata log output

## Visuals

- 3 Mermaid diagrams (pipeline, SDM nesting, Wald decision)
- Markdown comparison tables
- Variables table
