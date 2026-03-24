# Stata RCT Tutorial Post

**Date:** 2026-03-24
**Post:** `content/post/stata_rct/`
**Status:** Complete, ready for publication

## What was created

A comprehensive tutorial on evaluating a cash transfer program RCT with panel data in Stata. The post covers the full analytical workflow from baseline balance checks through advanced doubly robust difference-in-differences estimation.

### Files in the page bundle

| File | Description |
|------|-------------|
| `index.md` | Main tutorial (~1,300 lines, 14 sections) |
| `analysis.do` | Companion Stata do-file with all commands |
| `analysis.log` | Full Stata log from running analysis.do (Stata 18 MP) |
| `dataSIM4RCT.dta` | Simulated dataset (2,000 households, panel 2021--2024) |
| `featured.webp` | Featured image for post header |
| `plan.md` | Archived approved plan documenting design decisions |
| `infographic_instructions.md` | AI image-generation prompt for chalkboard infographic |
| `stata_rct_balance_plot.png` | Standardized mean differences plot |
| `stata_rct_density_y.png` | AIPW baseline density plot |
| `stata_rct_overlap_baseline.png` | Propensity score overlap (baseline) |
| `stata_rct_density_y0_receipt.png` | Density plot for receipt analysis |
| `stata_rct_overlap_receipt.png` | Propensity score overlap (receipt) |

### Post structure

1. Overview and learning objectives
2. Study design (Mermaid diagram, variable table)
3. Analytical roadmap (Mermaid diagram)
4. Data loading and exploration
5. Baseline balance checks (t-tests, iebaltab, balanceplot, AIPW diagnostics)
6. ATE vs. ATT --- estimand definitions with equations
7. Three strategies for causal estimation (RA, IPW, DR) --- expanded conceptual section with equations, analogies, Mermaid diagrams, mini examples, and "what can go wrong"
8. Cross-sectional estimation (RA, IPW, DR --- ATE and ATT for each)
9. Difference-in-Differences (why panel data, why ATT, basic DiD, DRDID with Sant'Anna & Zhao 2020 equations)
10. Endogenous treatment / compliance (advanced, with IV analogy)
11. Comprehensive comparison table (12 methods, all with 95% CIs)
12. Summary and key takeaways
13. Exercises
14. References

### Key pedagogical features

- 7 Mermaid diagrams with site color palette
- 13+ display equations with plain-language companions
- 4 analogies (exam scores for RA, opinion polling for IPW, backup power for DR, prescriptions for IV)
- 16+ interpretation paragraphs with specific numeric values
- 3 comparison tables with 95% CIs and "Contains true effect?" column
- All output verified against actual Stata 18 MP log

### Methods covered

- Simple difference in means
- Regression Adjustment (ATE, ATT)
- Inverse Probability Weighting (ATE, ATT)
- Doubly Robust IPWRA (ATE, ATT)
- Doubly Robust AIPW (ATE)
- Basic Difference-in-Differences (ATT)
- Doubly Robust DiD via `drdid` (ATT)
- Doubly Robust DiD via `xthdidregress aipw` (ATT)
- Endogenous treatment regression `etregress` (ATE/ATT of receipt)
- Doubly Robust receipt effect via `teffects ipwra` (ATE of receipt)

### Quality checks performed

- **Proofread** (`/project:proofread-post`): 2 HIGH + 6 MEDIUM issues found and fixed
- **Referee report** (`/project:referee-post`): Verdict MINOR REVISION. 8 issues found and fixed. Scores: Structure 9/10, Code 8/10, Equations 10/10, Explanations 10/10, Rigor 10/10
- **Hugo build**: Passes with no errors
- **Stata execution**: analysis.do runs end-to-end with no errors (885-line log)

### Skill updates

- Added plan-archival requirement to `data-science-post` skill: save approved plan as `plan.md` in post directory

### Reference materials used

- Stata `teffects` documentation (`causal.pdf`, pages 560--586)
- Sant'Anna & Zhao (2020). Doubly Robust Difference-in-Differences Estimators. *Journal of Econometrics*
- Stata blog: Introduction to Treatment Effects (2015)
- YouTube lecture on RCT analysis with panel data
