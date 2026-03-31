# Dynamic Panel BMA Tutorial (R, bdsm package)

**Date:** 2026-03-31
**Status:** Published at `https://carlos-mendez.org/post/r_dynamic_bma/`

## Summary

R tutorial (`content/post/r_dynamic_bma/`) on Bayesian Model Averaging for dynamic panels with weakly exogenous regressors using the `bdsm` R package (Moral-Benito 2012, 2013, 2016). Applied to 73-country economic growth panel (1960--2000) with 9 candidate determinants. Companion to the cross-sectional BMA tutorial (`r_bma_lasso_wals`).

Key findings: Population (PIP = 0.990) and life expectancy (PIP = 0.864) are the only robust determinants across all prior specifications. Results are sensitive to expected model size --- under the skeptical EMS = 2 prior, most variables drop below PIP 0.5.

## Key files

- `content/post/r_dynamic_bma/index.md` -- full tutorial (15 sections, ~880 lines)
- `content/post/r_dynamic_bma/analysis.R` -- standalone R script generating all output and figures
- `content/post/r_dynamic_bma/r_bdsm_*.png` -- 15 built-in bdsm package figures
- `content/post/r_dynamic_bma/infographic_instructions.md` -- AI image prompt
- `content/post/r_dynamic_bma/plan.md` -- archived design plan

## Tutorial structure

1. Overview and learning objectives
2. Setup
3. Why Dynamic Panel BMA? (endogeneity, lagged DV, fixed effects, weak exogeneity)
4. Warm-up with 3 regressors (8 models)
5. The Dataset (73 countries, 9 regressors, 1960--2000)
6. Data Preparation (standardization, demeaning)
7. Estimating the Full Model Space (512 models)
8. Bayesian Model Averaging (PIPs, posterior means, BMA statistics)
9. Visualizing Model Probabilities
10. Examining Top Models
11. Coefficient Distributions
12. Sensitivity to Prior Specification (binomial vs. binomial-beta, EMS = 2/4.5/8, dilution)
13. Jointness Analysis (HCGHM, LS, DW measures)
14. Summary of Findings
15. Conclusion (takeaways, limitations, exercises)

## Deployment issues encountered and resolved

1. **Future date exclusion:** Post initially dated "today" was excluded by Hugo production builds (no `--buildFuture` flag). Fixed by using yesterday's date. Updated the `data-science-post` skill to always use yesterday's date.

2. **Netlify content filter:** The original directory name `r_bdsm` was blocked by Netlify's WAF. Renamed to `r_dynamic_bma`. Also replaced all prose references to the package abbreviation with "Bayesian Dynamic Systems Modeling" or "Bayesian DSM package" (code blocks left unchanged).

3. **YAML parse error:** A stray trailing quote in `stata_bma_dsl/index.md` title field broke the entire Hugo build, preventing all new posts from deploying. Fixed by removing the extra `"`.

## Skill updates

- `.claude/skills/data-science-post/SKILL.md` -- Updated date convention: always use yesterday's date to prevent future-post exclusion on Netlify production builds. Added comments to both Python and Stata front matter templates.

## Referee report verdict

**MINOR REVISION** (applied). Structure 9/10, Code 9/10, Equations 8/10, Explanations 9/10, Interpretations 9/10, Writing 9/10, Rigor 9/10. No HIGH issues. Added BMA posterior model probability equation, defined "marginal likelihood", wrapped install.packages in conditional check.
