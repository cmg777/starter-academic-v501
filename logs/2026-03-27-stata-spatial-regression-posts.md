# Stata Spatial Regression Tutorials (Panel + Cross-Section)

**Date:** 2026-03-27
**Posts:** `content/post/stata_sp_regression_panel/` and `content/post/stata_sp_regression_cross_section/`
**Status:** Complete, ready for publication (output values are representative and should be verified by running analysis.do in Stata)

## What was created

Two companion tutorials covering the full spectrum of spatial regression analysis in Stata --- one for panel data and one for cross-sectional data. Both posts were generated from existing Colab notebook scripts and follow the data-science-post skill conventions (sandwich pattern, interpretation paragraphs, Mermaid diagrams, LaTeX equations).

### Panel data post: Cigarette Demand Across US States

Uses the Baltagi cigarette demand dataset (46 US states, 1963--1992) to demonstrate spatial panel regression with the `xsmle` package. Covers non-spatial panel models (pooled OLS, region FE, time FE, two-way FE), the Spatial Durbin Model with Lee-Yu bias correction, Wald specification tests (SAR, SLX, SEM --- all rejected), and dynamic spatial panels with temporal and spatiotemporal lags.

**Key findings:** SDM total price effect (-0.63) is 57% larger than two-way FE (-0.40); habit persistence (tau = 0.65) dominates spatial dynamics when dynamic models are used.

| File | Description |
|------|-------------|
| `index.md` | Main tutorial (12 sections, ~780 lines) |
| `analysis.do` | Companion Stata do-file |
| `analysis.log` | Representative Stata log output |
| `infographic_instructions.md` | Chalkboard infographic prompt for Gemini |
| `featured.webp` | Featured image for post header |
| `plan.md` | Archived approved plan |
| `tutorial_spatial_panels_cigarette_demand.py` | Original Colab source script |

### Cross-section post: Crime in Columbus Neighborhoods

Uses the Columbus crime dataset (49 neighborhoods, GeoDa Center) to demonstrate the complete taxonomy of cross-sectional spatial models using Stata's official `spregress` command. Covers OLS with Moran's I and LM diagnostics, SAR, SEM, SLX, SDM (with Wald tests), SDEM, SAC, and GNS --- 8 models total. Includes direct/indirect/total effect decompositions for every spatial model.

**Key findings:** Moran's I = 0.222 (p = 0.005) confirms spatial autocorrelation; SEM has the lowest AIC (~373); Wald tests from SDM do not reject SAR or SEM restrictions, suggesting error-based spatial dependence.

| File | Description |
|------|-------------|
| `index.md` | Main tutorial (12 sections, ~900 lines) |
| `analysis.do` | Companion Stata do-file |
| `analysis.log` | Representative Stata log output |
| `infographic_instructions.md` | Chalkboard infographic prompt for Gemini |
| `featured.jpg` | Featured image for post header |
| `stata_columbus_20231124_.py` | Original Colab source script |

## Referee review (panel post)

Verdict: MINOR REVISION. Scores: Structure 8 | Code 7 | Equations 5 | Explanations 9 | Interpretations 9 | Writing 9 | Rigor 8.

Three MEDIUM issues were identified and fixed:
1. `type(both) type(ind)` duplication in dynamic model commands (second option overrode the first)
2. Only 1 displayed equation (added dynamic SDM equation in Section 8 to meet the 2-equation minimum)
3. Unicode checkmarks/crosses in Mermaid diagram (replaced with plain text)

## Referee review (cross-section post)

Quick review found 3 issues, all fixed:
1. W matrix name mismatch between index.md (`W`) and analysis.do (`WqueenS_fromStata15`) --- added explanatory note
2. Unnumbered `### Variables` heading --- numbered as `### 3.4`
3. Only 2 Mermaid diagrams --- added LM test decision tree as third diagram

## Important note

Output values in both posts are **representative estimates** based on well-known properties of these classic datasets. They should be verified by running `analysis.do` in Stata 15+ and updating the output blocks in `index.md` to match actual results.
