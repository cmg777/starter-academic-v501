# Stata HonestDiD Sensitivity Analysis Tutorial

**Date:** 2026-03-26
**Post:** `content/post/stata_honestdid/`
**Status:** Complete, ready for publication

## What was created

A comprehensive tutorial on sensitivity analysis for the parallel trends assumption in difference-in-differences using the `honestdid` package in Stata. The post is structured in two self-contained parts: Part 1 covers the simple 2x2 DiD case where parallel trends cannot be tested, and Part 2 extends to multi-period event studies with both relative magnitudes and smoothness restrictions. Uses the Medicaid expansion dataset from the Mixtape Sessions Advanced-DID course.

### Files in the page bundle

| File | Description |
|------|-------------|
| `index.md` | Main tutorial (~800 lines, 14 sections) |
| `analysis.do` | Companion Stata do-file with all commands |
| `analysis.log` | Full Stata log from running analysis.do (Stata 18 MP) |
| `featured.webp` | Featured image for post header |
| `plan.md` | Archived approved plan documenting design decisions |
| `infographic_instructions.md` | AI image-generation prompt for chalkboard infographic |
| `stata_honestdid_2x2_means.png` | 2x2 group means with counterfactual trend |
| `stata_honestdid_2x2_rm.png` | Relative magnitudes sensitivity (2x2, 1 pre-period) |
| `stata_honestdid_event_study.png` | Event study coefficient plot (full panel) |
| `stata_honestdid_rm_full.png` | Relative magnitudes sensitivity (full panel, 5 pre-periods) |
| `stata_honestdid_sd_full.png` | Smoothness restriction sensitivity |
| `stata_honestdid_csdid.png` | Staggered DiD (csdid) sensitivity |

### Post structure

1. Overview and learning objectives (7 items)
2. Study context --- Medicaid expansion (variables table, ATT estimand)
3. Analytical roadmap (Mermaid diagram)
4. Setup --- data loading and packages

**Part 1: Simple 2x2 Difference-in-Differences**

5. The 2x2 DiD --- concept and estimation (collapse to pre/post, regression, parallel trends problem, counterfactual figure)
6. Sensitivity analysis for the 2x2 DiD (3-year event study, DeltaRM with numpre=1, sensitivity plot, honestdid workflow diagram)

**Part 2: Multi-period Difference-in-Differences**

7. From 2x2 to event study (full panel 2008--2015, event study plot, pre-trends F-test)
8. Why pre-trends tests are not enough (Roth 2022, low power, pre-test bias, Mermaid diagram)
9. Sensitivity analysis --- relative magnitudes (full panel RM, average effect with l_vec)
10. Sensitivity analysis --- smoothness restrictions (DeltaSD, RM vs SD comparison table, decision guide, how to report in a paper)
11. Extension --- staggered DiD with csdid + honestdid
12. Discussion and summary (comparison table across all 5 analyses, 5 key takeaways)
13. Exercises (3 items with starter code)
14. References (8 entries)

### Key results

| Analysis | Restriction | Breakdown Value |
|----------|-------------|-----------------|
| 2x2 (1 pre-period) | DeltaRM | > 2 |
| Full panel, first period | DeltaRM | ~1.5--2 |
| Full panel, average effect | DeltaRM | ~1--1.5 |
| Full panel, first period | DeltaSD | ~0.015--0.02 |
| Staggered (csdid) | DeltaRM | ~1.5--2 |

### Pedagogical features

- **4 analogies:** runner photograph (PT untestability), bridge stress test (breakdown value), smoke detector (pre-test power), driving rules / speed vs acceleration (RM vs SD)
- **4 Mermaid diagrams:** tutorial roadmap, 2x2 DiD structure, conventional vs HonestDiD approaches, honestdid workflow
- **5 equations:** 2x2 DiD regression, parallel trends, DeltaRM, event study specification, DeltaSD
- **6 figures** with CSS-styled captions
- **12+ interpretation paragraphs** with specific numeric values
- **Summary comparison table** across all 5 sensitivity analyses
- **"How to report in a paper" box** with manuscript-ready text
- **"When to choose RM vs SD" decision guide**
- **3 exercises** with starter code snippets

### Dataset

- **Source:** `ehec_data.dta` from Mixtape Sessions Advanced-DID
- **URL:** `https://raw.githubusercontent.com/Mixtape-Sessions/Advanced-DID/main/Exercises/Data/ehec_data.dta`
- **Sample:** 38 states (22 treated, 16 control), 8 years (2008--2015), 304 observations
- **Treatment:** Medicaid expansion in 2014
- **Outcome:** Insurance rate among low-income childless adults (`dins`)

### Quality assurance

- Full referee review: MINOR REVISION verdict (scores 8--9/10 across all dimensions)
- Proofread: PASS (all 10 checks)
- Deep correctness audit: 20 findings identified and fixed (DeltaRM true vs observed deviations, "denominator" correction, M-bar=0 precision, breakdown value ranges, DeltaSD units, bridging paragraph for 6.18 vs 4.23 pp, C-LF vs FLCI explanation, and more)
- Code execution: Clean run in Stata 18 MP, no errors, all 6 PNGs generated
- Infographic instructions: 6-panel chalkboard prompt using Causal template

### References

1. Rambachan & Roth (2023). A More Credible Approach to Parallel Trends. *Review of Economic Studies*.
2. Roth (2022). Pre-test with Caution. *AER: Insights*.
3. Callaway & Sant'Anna (2021). DiD with Multiple Time Periods. *Journal of Econometrics*.
4. HonestDiD Stata package (mcaceresb/stata-honestdid)
5. Mixtape Sessions --- Advanced DiD (dataset source)
