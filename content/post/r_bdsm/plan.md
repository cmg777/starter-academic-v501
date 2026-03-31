# Plan: Dynamic Panel BMA with the `bdsm` R Package

## Context

The site already has a cross-sectional BMA tutorial (`r_bma_lasso_wals`) using the `BMS` package with synthetic CO2 data. That post handles model uncertainty but assumes regressors are strictly exogenous. This new tutorial extends BMA to **dynamic panels with weakly exogenous regressors** using the `bdsm` R package (Moral-Benito 2012, 2013, 2016). The key advancement: it handles reverse causality --- GDP growth may cause higher investment/trade, not just the other way around.

## Approved scope

- **Topic:** Dynamic panel Bayesian Model Averaging for economic growth determinants
- **Language:** R
- **Dataset:** `economic_growth` (built-in to the `bdsm` package) --- cross-country panel with GDP and 9 regressors
- **Figure theme:** Light background (default)
- **Post type:** Statistical method tutorial (econometrics)
- **Post slug:** `r_bdsm`
- **Plots:** Built-in `bdsm` package plots only (base R) --- no custom ggplot recreations
- **Colab notebook:** No --- R script (`analysis.R`) only
- **Simulated data:** Yes --- add a brief validation section with simulated DGP before real data

## Case study question

"Which factors truly drive long-run economic growth across countries --- and can we trust our answers when today's GDP might itself be shaped by those same factors?"

## Section outline

### 1. Overview
- Case study question and policy motivation
- Why dynamic panel BMA matters vs. cross-sectional BMA
- Companion tutorial callout linking to `/post/r_bma_lasso_wals/`
- Learning objectives (5 bullets): endogeneity problem, data prep, BMA interpretation, prior sensitivity, jointness
- Mermaid diagram: methodological pipeline (Data Prep --> Model Space --> BMA --> Sensitivity --> Jointness)

### 2. Setup
- Install/load: `bdsm`, `tidyverse`, `scales`, `patchwork`, `ggrepel`
- Site color palette constants
- `set.seed()` and options

### 3. Why Dynamic Panel BMA?
- **3.1 The endogeneity problem** --- reverse causality analogy (runner/training program), why cross-sectional BMA fails
- **3.2 The dynamic panel solution** --- lagged DV (previous exam score analogy), entity FE (grading on a curve), time FE, weak exogeneity
- **3.3 Cross-sectional vs. dynamic panel BMA** --- Mermaid comparison diagram, link to predecessor

### 4. Validation with Simulated Data (~300 words + code)
- **4.1 Designing a known DGP** --- small panel (30 entities x 5 periods) with 4 regressors: 2 true (known coefficients) + 2 noise + lagged DV
- **4.2 Running bdsm on simulated data** --- `optim_model_space()` + `bma()` on the small simulated panel
- **4.3 Checking recovery** --- do PIPs correctly identify the true regressors? Does it recover approximate coefficients? Answer-key comparison table
- Interpretation paragraph: "The method correctly assigns PIP > X to the two true regressors and PIP < Y to the noise variables, confirming the machinery works before we apply it to real data."

### 5. The Dataset (real data)
- **5.1 Loading** --- `data("economic_growth")`, `head()`, `str()`
- **5.2 Variable descriptions** --- table with name, description, expected sign, rationale
- **5.3 Summary statistics** --- `summary()` + interpretation

### 6. Data Preparation
- **6.1 Lagged dependent variable** --- `join_lagged_col()`, before/after
- **6.2 Demeaning and scaling** --- `feature_standardization()`, entity + time demeaning analogy

### 7. Estimating the Full Model Space
- `optim_model_space()` --- 2^9 = 512 models, cooking competition analogy
- Output structure ($params, $stats)
- Note on computation time

### 8. Bayesian Model Averaging
- **8.1 Running BMA** --- `bma()` with default prior, full results table
- **8.2 Understanding BMA statistics** --- PIP, PM, PSD, %(+) explained with batting-average analogy
- **8.3 Interpreting PIPs** --- classify variables by Raftery thresholds (>0.75 strong, 0.50--0.75 moderate, <0.50 weak)

### 9. Visualizing Model Probabilities
- **9.1 Prior vs. posterior model probabilities** --- `model_pmp()` (built-in plot)
- **9.2 Model sizes** --- `model_sizes()` (built-in plot)

### 10. Examining Top Models
- `best_models()` for top 5--8 models
- Inclusion table showing which variables appear in each top model
- Estimation results with coefficient values

### 11. Coefficient Distributions
- `coef_hist()` for 2--3 key variables (built-in histograms + kernel densities)

### 12. Sensitivity to Prior Specification
- **12.1 Binomial vs. binomial-beta** --- side-by-side PIP comparison table
- **12.2 Varying EMS** --- EMS = 2, 4.5, 8; table of PIP shifts + `model_sizes()` plots
- **12.3 Dilution prior** --- handling multicollinearity, brief demonstration with `model_sizes()` comparison

### 13. Jointness Analysis
- **13.1 What is jointness?** --- peanut butter & jelly analogy
- **13.2 Three measures** --- HCGHM, LS, DW (interpretation scales, not math)
- **13.3 Jointness matrices** --- `jointness()` output for each measure

### 14. Summary of Findings
- Recap table: variable, PIP (binomial), PIP (binomial-beta), sign, verdict
- Connection to cross-sectional results from predecessor post

### 15. Conclusion
- 4 concrete takeaways with numbers
- Limitations (computation cost, weak exogeneity assumption)
- Further reading

### References
- Moral-Benito (2012, 2013, 2016), Wyszynski et al. (2024), Sala-i-Martin et al. (2004), Fernandez et al. (2001), Doppelhofer & Weeks (2009), Ley & Steel (2009), Hofmarcher et al. (2018)

## Figures (2 Mermaid + built-in bdsm plots)

| # | Type | Description |
|---|------|-------------|
| 1 | Mermaid (inline) | Methodological pipeline |
| 2 | Mermaid (inline) | Cross-sectional vs. dynamic panel comparison |
| 3 | `model_pmp()` built-in | Prior vs. posterior model probabilities (binomial, binomial-beta, combined) |
| 4 | `model_sizes()` built-in | Prior vs. posterior by model size |
| 5 | `best_models()` built-in | Top model inclusion table (gTree format) |
| 6 | `coef_hist()` built-in | Posterior coefficient histograms + kernel densities |
| 7 | `model_sizes()` built-in | EMS sensitivity comparison (EMS = 2 vs. default vs. 8) |
| 8 | `model_sizes()` built-in | Dilution prior comparison |

Note: Built-in `bdsm` plots use base R graphics. The `analysis.R` script will save these via `png()`/`dev.off()` for inclusion in the post. Exact filenames will follow `r_bdsm_*.png` pattern.

## Key analogies

| Concept | Analogy |
|---------|---------|
| Reverse causality | Runner's training program vs. race time |
| Lagged DV | Student's previous exam score |
| Entity demeaning | Grading on a curve within each classroom |
| Marginal likelihood | Cooking competition with 512 recipes |
| PIP | Batting average across 512 at-bats |
| Jointness | Peanut butter and jelly |
| Weak exogeneity | Past feedback allowed, current shocks not |

## Deliverables

- `content/post/r_bdsm/index.md` --- full tutorial (~1,200--1,500 lines)
- `content/post/r_bdsm/analysis.R` --- standalone R script generating all PNG figures via built-in bdsm plots
- PNG figures saved from built-in base R graphics (`r_bdsm_*.png`)
- `featured.webp` --- added manually by user

## Verification

1. Run `analysis.R` end-to-end in R and confirm all 7 PNGs are generated
2. Compare printed output against output blocks in `index.md`
3. Check LaTeX rendering (subscripts escaped as `\_`)
4. Check Mermaid diagrams render with `diagram: true`
5. Run Hugo dev server and verify at `http://localhost:1313/post/r_bdsm/`
6. Confirm at least 8 interpretation paragraphs with specific numbers
7. Confirm sandwich pattern on every code block with output

## Critical reference files

- `content/post/r_bma_lasso_wals/index.md` --- primary reference post (structure, conventions)
- `content/post/r_bma_lasso_wals/script.R` --- R script template (color palette, figure saving)
- `content/post/stata_bma_dsl/index.md` --- panel data BMA framing reference
- `.claude/skills/data-science-post/references/latex-escaping.md` --- LaTeX escaping rules
- `.claude/skills/data-science-post/references/quality-checklist.md` --- verification checklist
