# Python DiD101 Tutorial Post

**Date:** 2026-04-27
**Post:** `content/post/python_did101/`
**Status:** Complete, ready for publication

## What was created

A comprehensive tutorial on Difference-in-Differences (DiD) in Python using PyFixest and Great Tables, based on Corral and Yang (2024). This is the Python companion to the Stata DiD tutorial (`content/post/stata_did/`). The post evaluates a fictitious after-school tutoring program across 35 high schools using the 2x2 DiD design, three TWFE regression specifications, four inference methods, and an event study extension.

### Files in the page bundle

| File | Description |
|------|-------------|
| `index.md` | Main tutorial (~1200 lines including podcast/video players) |
| `script.py` | Standalone Python script generating all figures and output |
| `notebook.ipynb` | Self-contained Google Colab notebook (70 cells: 42 markdown + 28 code) |
| `infographic_instructions.md` | AI image-generation prompt for chalkboard infographic (4 sections) |
| `plan.md` | Implementation plan used during development |
| `execution_log.txt` | Script execution log with all printed output |
| `featured.webp` | Featured image for post header |
| `did101_panelview.png` | Panel structure heatmap (2x2 design) |
| `did101_its.png` | Naive before-after comparison (treated only) |
| `did101_counterfactual.png` | DiD design with counterfactual path |
| `did101_diff_plot.png` | Manual DiD calculation with annotated differences |
| `did101_se_comparison.png` | Standard errors across 4 inference methods |
| `did101_table2.png` | Great Tables regression comparison (3 specs) |
| `did101_coefplot.png` | Coefficient comparison with 95% CIs |
| `did101_panelview_event.png` | Panel structure heatmap (event study, 8 periods) |
| `did101_event_study.png` | Event study dynamic treatment effects |
| `did101_event_table.png` | Great Tables event study coefficients |

## Key results

- **DiD estimate:** 25.32 GPA points (ATT), consistent across all specifications (25.32--25.33)
- **Naive overstatement:** 43% (36.20 naive vs 25.32 DiD)
- **Secular trend:** 10.88 GPA points (comparison group improvement)
- **Event study:** Pre-treatment coefficients near zero (0.34, -0.32, 0.59), post-treatment immediate and sustained (24.71--25.70)
- **Inference:** SE range 0.585--0.637 across iid/HC1/CRV1/CRV3, all overwhelmingly significant

## Key differences from Stata version

| Aspect | Stata | Python |
|--------|-------|--------|
| Estimation | 5 commands (diff, reg, didregress, xtreg, reghdfe) | 3 `feols()` calls with unified formula syntax |
| Tables | outreg2 -> .doc | `etable()` + Great Tables -> inline HTML / .png |
| SE comparison | Mentioned briefly | Dedicated section with 4 types + bar chart figure |
| Multi-spec | Separate commands | `csw0()` operator in one call |
| Event study plot | eventdd package | Manual matplotlib from `.tidy()` coefficients |
| Tidy output | Not available | `.coef()`, `.se()`, `.tidy()` methods |
| Colab notebook | Not available | Full self-contained notebook with `!pip install` |

## Review status

Post reviewed across 12 dimensions per `review-post` skill. Verdict: **ACCEPT** after fixing float32 arithmetic inconsistency (rounding group means before manual DiD calculation) and two MEDIUM issues (heading count, event study output disclosure). Infographic reviewed across 7 dimensions: **ACCEPT** (29/29 numbers verified against source post).
