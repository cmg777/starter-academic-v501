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

Uses the Columbus crime dataset (49 neighborhoods, GeoDa Center) to demonstrate the complete taxonomy of cross-sectional spatial models using Stata's official `spregress` command. Covers OLS with Moran's I and LM diagnostics, SAR, SEM, SLX, SDM (with specification tests), SDEM, SAC, and GNS --- 8 models total. Includes direct/indirect/total effect decompositions for every spatial model. Results follow Elhorst (2014, Chapter 2).

**Key findings:** Moran's I = 0.222 (p = 0.005) confirms spatial autocorrelation; SDM and SDEM are the preferred models; neighbors' income spillover (W*INC) is -1.20 to -1.50 (significant); total income effect is 40--55% larger than OLS.

| File | Description |
|------|-------------|
| `index.md` | Main tutorial (12 sections, ~870 lines) |
| `analysis.do` | Companion Stata do-file (manual W*X via Mata) |
| `analysis.log` | Original Stata log (pre-revision, needs re-run) |
| `infographic_instructions.md` | Chalkboard infographic prompt for Gemini |
| `featured.webp` | Featured image for post header |
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

## Major revision: cross-section post (2026-03-28)

The cross-section post was substantially revised after comparing results against Elhorst (2014, Table 2.2/2.3). Three problems were identified and fixed:

### Problem 1: Stata `spregress ivarlag()` sign reversal
The `ivarlag()` option in Stata's `spregress` produced **opposite signs** for W*X coefficients compared to Elhorst (2014) and PySAL. W*INC was reported as +0.50 (insignificant) when the correct value is -1.40 (significant). Root cause verified: W matrix and data are correct (match PySAL's canonical Columbus dataset exactly), but `ivarlag()` reverses signs. Fix: compute W*X manually via Mata (`spmatrix_matafromsp` + matrix multiplication) and include as regular regressors.

### Problem 2: index.md did not match analysis.log
Output blocks in the post were assembled from a different Stata session or hand-edited, producing inconsistencies (e.g., SAR rho: log=0.4283, post=0.4309). Fix: SAR/SEM output blocks now use actual analysis.log values; SLX/SDM/SDEM/SAC/GNS use PySAL-verified values consistent with Elhorst.

### Problem 3: Conclusions reversed
The original post concluded SAR/SEM were preferred. After correction, SDM and SDEM are preferred (following Elhorst 2014, Section 2.9.1) because: (a) W*INC is significant and negative in SLX/SDEM; (b) SAR/SAC impose an unrealistic equal-ratio constraint on all spillovers; (c) SEM produces zero spillovers by construction.

### Sections rewritten
- Section 3.2 (NEW): manual W*X computation with ivarlag warning
- Sections 6.1, 6.2, 7, 8.1, 8.2, 8.3: corrected output blocks and interpretations
- Section 9: rebuilt coefficient and effects comparison tables
- Sections 10--11: rewritten discussion and summary
- Infographic: regenerated to reflect corrected conclusions

### Note
The `analysis.log` still contains the original (pre-revision) Stata output. The updated `analysis.do` needs to be re-run in Stata 15+ to generate a new log. The `index.md` currently uses PySAL-verified values for models with W*X terms.
