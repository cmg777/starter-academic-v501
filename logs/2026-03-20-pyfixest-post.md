# PyFixest Post: High-Dimensional Fixed Effects Regression

**Date:** 2026-03-20

## Summary

Added a comprehensive data science tutorial post on fixed effects regression using PyFixest (`content/post/python_pyfixest/`). The post covers OLS through two-way FE, instrumental variables, a real wage panel case study (Vella & Verbeek 1998), CRE/Mundlak estimation, and event study designs with staggered treatment adoption.

## Key files

- `content/post/python_pyfixest/index.md` -- full tutorial (~1265 lines, 18 sections)
- `content/post/python_pyfixest/script.py` -- standalone Python script
- `content/post/python_pyfixest/infographic_instructions.md` -- chalkboard infographic AI prompt
- `content/post/python_pyfixest/*.png` -- dark-theme figures (navy background palette)

## Post structure

1. Overview and learning objectives
2. Setup and imports
3. Synthetic data generation
4. OLS baseline
5. One-way fixed effects (absorption syntax)
6. Manual demeaning (reproducing FE by hand)
7. Stepwise specification comparison (`csw0`)
8. Standard error comparison (iid, HC1, CRV1, CRV3)
9. Two-way fixed effects
10. Instrumental variables (2SLS)
11. Wage panel case study (Sections 11.1--11.8):
    - Panel exploration and within-between decomposition
    - Mincer equation framework
    - Pooled OLS vs one-way FE
    - Two-way and three-way FE
    - Group-specific time trends
    - CRE/Mundlak approach (expanded with full pedagogical treatment)
    - Mermaid diagram of FE absorption
12. Event studies: TWFE vs DID2S
13. Wald test
14. Wild bootstrap inference
15. Discussion
16. Summary and next steps
17. Exercises (6 problems)
18. References (10 entries)

## Changes in this session

### CRE/Mundlak section expansion (Section 11.7)

Expanded from ~57 lines to ~93 lines with four pedagogical components:
- Motivating paragraph with worker "type" analogy and FE-vs-OLS tradeoff
- Full equation treatment with "In words" companion and variable-to-code mapping
- Interpretation of CRE correction terms (union_mean = 0.179 as selection evidence)
- Hausman test connection (joint test of correction terms, link to Exercise 6)

### CRE terminology standardization

Renamed "Mundlak approach" to "CRE" throughout the post:
- Table/figure labels: "Mundlak" -> "CRE"
- Chart code: `label="CRE"`, `title="...vs CRE"`
- Prose: "CRE model" / "CRE coefficients" instead of "Mundlak approach"
- All paired references standardized to "CRE/Mundlak" (CRE first)
- Code variable names (`fit_mundlak`) kept unchanged

### Output block highlighting fix

Changed all 21 output code blocks from bare ` ``` ` to ` ```text ` to prevent highlight.js from auto-detecting a language and applying unwanted syntax coloring.

### Infographic instructions

Generated `infographic_instructions.md` with 6-panel chalkboard infographic prompt:
1. The Selection Problem (18.3% raw union premium)
2. Absorbing Unobserved Bias (18.3% -> 7.8%)
3. Within vs Between (education: 0% within variation)
4. CRE vs One-Way FE (education recovered: 9.4%/year)
5. Stress-Testing Assumptions (union premium stable 7.3--7.8%)
6. Event Studies: TWFE vs DID2S

## Skill and documentation updates

- **data-science-post skill:** Updated output block convention from "no language tag" to ` ```text ` language tag; added pyfixest as reference post
- **referee-post skill:** Updated output block convention to ` ```text `
- **proofread-post skill:** Updated output block convention to ` ```text `
- **CLAUDE.md:** Added output block convention note; added pyfixest as reference post
- **README.md:** Added pyfixest to reference posts list
