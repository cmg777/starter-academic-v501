# Stata DiD Tutorial Post

**Date:** 2026-04-26
**Post:** `content/post/stata_did/`
**Status:** Complete, ready for publication

## What was created

A comprehensive tutorial on Difference-in-Differences (DiD) in Stata, based on Corral and Yang (2024). The post evaluates a fictitious after-school tutoring program across 35 high schools using the 2x2 DiD design, five equivalent TWFE regression approaches, and an event study extension.

### Files in the page bundle

| File | Description |
|------|-------------|
| `index.md` | Main tutorial (~600 lines, 10 sections) |
| `analysis.do` | Companion Stata do-file with all commands |
| `analysis.log` | Full Stata log from running analysis.do |
| `featured.webp` | Featured image for post header |
| `infographic_instructions.md` | AI image-generation prompt for chalkboard infographic |
| `results_report.md` | Structured results report with interpretations |
| `results_report_review.md` | Review of results report accuracy |
| `script-review.md` | Review of analysis.do quality |
| `execution_log.txt` | Script execution log |
| `stata_did_its.png` | Interrupted Time Series (naive comparison) |
| `stata_did_counterfactual.png` | DiD design with counterfactual trend |
| `stata_did_diff_plot.png` | DiD plot with labeled group means |
| `stata_did_panelview_2x2.png` | Treatment timing heatmap (2x2 dataset) |
| `stata_did_panelview_event.png` | Treatment timing heatmap (event study dataset) |
| `stata_did_event_study.png` | Event study dynamic treatment effects |

### Post structure

1. Overview -- case study setup, learning objectives, Mermaid study design diagram
2. Setup and packages -- Stata package installation
3. Data loading and exploration -- panel data summary, treatment visualization
4. The problem with naive comparisons -- ITS approach, 36.20-point naive gain
5. The DiD design -- counterfactual construction, parallel trends assumption, SUTVA
6. Manual DiD calculation -- 2x2 means table, DiD = 25.32, diff_plot visualization
7. DiD via regression -- five equivalent approaches (diff, reg, didregress, xtreg, reghdfe)
8. Table 2 -- three regression specifications following Corral and Yang (2024)
9. Event study -- 8-period dataset, dynamic treatment effects, parallel pre-trends validation
10. Discussion and summary -- policy implications, caveats, exercises

### Key results

- **ATT estimate:** 25.32 GPA points (p < 0.001), robust across all 5 estimation methods
- **Naive ITS overstatement:** 36.20 points (43% overstatement, 10.88 points from natural time trends)
- **Event study pre-trends:** Coefficients of 0.34, -0.32, 0.59 (all p > 0.10) -- parallel trends hold
- **Post-treatment effects:** 24.71 to 25.70 with no fade-out pattern
- **Five methods converge:** diff, reg, didregress, xtreg, reghdfe all produce 25.31-25.33

### Infographic

Chalkboard-style infographic prompt generated for Gemini (Option A -- all text). Six panels following the Causal Inference template: The Problem, The Case Study, The DiD Design, Five Methods One Answer, Parallel Trends Hold, Bottom Line. Reviewed and accepted with all numbers verified against source post.
