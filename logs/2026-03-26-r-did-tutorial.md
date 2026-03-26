# R DID Tutorial: Difference-in-Differences for Policy Evaluation

**Date:** 2026-03-26
**Status:** Complete

## What was done

Created a comprehensive R tutorial on the Difference-in-Differences method at `content/post/r_did/`, based on Brantly Callaway's (2022) chapter and LSU workshop materials.

## Deliverables

| File | Description |
|------|-------------|
| `index.md` | Full tutorial (578 lines, 12 sections) |
| `analysis.R` | Standalone R script generating all figures |
| `r_did_*.png` | 8 dark-theme figures with bracket-style CIs |
| `featured.webp` | Featured image (CS event study) |
| `infographic_instructions.md` | Chalkboard infographic prompt (6 panels) |

## Tutorial structure

1. Overview --- minimum wage and teen employment case study
2. Setup --- packages (did, fixest, twfeweights, HonestDiD, DRDID, pte)
3. Data Loading --- Callaway's county-level panel data (2003--2007)
4. Basic DID Framework --- parallel trends, TWFE regression, Mermaid diagram
5. Group-Time ATT --- Callaway-Sant'Anna att_gt(), event study, TWFE weight decomposition
6. Relaxing Parallel Trends --- doubly robust estimation, robustness checks
7. HonestDiD Sensitivity --- relative magnitude, breakdown at Mbar ~ 0.67
8. Treatment Dose Heterogeneity --- ATT per dollar via DRDID
9. Alternative Strategies --- lagged outcomes (pte package)
10. Discussion and Takeaways --- 5 numbered key takeaways
11. Exercises
12. References (10 entries)

## Key results

- TWFE coefficient: -0.038 (understates by ~33%)
- Callaway-Sant'Anna overall ATT: -0.057 (SE = 0.008)
- Doubly robust ATT: -0.065 (SE = 0.008)
- HonestDiD breakdown: Mbar ~ 0.67
- ATT per dollar: -0.055 after 1 year, -0.097 after 3 years

## Application context

- Dataset: `mw_data_ch2.RData` from github.com/bcallaway11/did_chapter
- Treatment groups: G=2004 (102 counties), G=2006 (226 counties)
- Never-treated: 1,417 counties
- Outcome: log teen employment (lemp)

## Referee review

Two rounds of review were conducted. Final verdict: MINOR REVISION (all fixes applied). Key improvements made:
- Added analogies for forbidden comparisons and negative weights
- Added formal equations for ATT(g,t) and ATT^O aggregation
- Added doubly robust explanation with belt-and-suspenders analogy
- Added 5-point numbered takeaways
- Fixed LaTeX escaping (t^* -> t^{ast})
- Changed CI plots from area ribbons to bracket-style errorbar
- Added Tutorial to categories, pte to setup block
