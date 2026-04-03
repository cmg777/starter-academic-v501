# Script Review: r_demeaning_twfe

**Script:** `analysis.R` (525 lines)
**Language:** R
**Executed:** 2026-04-03
**Status:** All code runs

## Verdict: ACCEPT

Clean, well-structured pedagogical script that correctly demonstrates the FWL theorem equivalence between TWFE and manual demeaning. All 5 figures render correctly, 8 CSV tables exported, and the central result (`all.equal()` returns `TRUE`) is verified. No HIGH or MEDIUM issues found.

## Execution Results

- Exit code: 0
- Figures generated: 5 PNG files
- CSV files exported: 8
- Warnings: 3 non-fatal (package version mismatch for fixest, ggplot2, scales; object masking from tidyverse -- all expected)

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Code quality | LOW | line 30 | `patchwork` loaded but never used (switched to faceted approach in Section 6) | Remove `library(patchwork)` and from `required_packages` |
| 2 | Code quality | LOW | line 252 | Leading whitespace on `ols_results` (inconsistent indentation) | Remove leading space |
| 3 | Statistical | LOW | lines 134-135 | Manual p-value via `pt()` with custom df formula; could diverge subtly from fixest internal df | Use `pvalue(twfe_model)` instead for consistency with fixest output |
| 4 | Structure | LOW | line 180 | Commented formula `# x_tilde_it = x_it - x_bar_i - x_bar_t + x_bar_grand` flagged by linter | Acceptable as pedagogical annotation; optionally rewrite as plain comment |
| 5 | Style | LOW | 12 lines | Lines exceed 80 characters (flagged by lintr) | Wrap long ggplot and cat() lines; mostly in plot construction code |
| 6 | Style | LOW | lines 35-51 | SCREAMING_CASE constants flagged by `object_name_linter` | Acceptable -- project convention for site palette constants across all R scripts |

## Positive Highlights

- **Core result is bulletproof.** The coefficient equivalence test (`all.equal()`) returns `TRUE` with differences on the order of 10^-16 -- pure floating-point artifacts. The central pedagogical claim is verified.
- **Programmatic demeaning.** Uses a clean `for` loop over `VARS_TO_DEMEAN` instead of the 6 copy-paste blocks in the reference `.qmd`. More maintainable and less error-prone.
- **Excellent decomposition figure (Figure 4).** Shows observed, country mean, time mean, grand mean, and demeaned values for a single country on one plot with formula annotation using `expression()`. Makes the demeaning formula concrete.
- **Three-way SE comparison.** Goes beyond the reference material by comparing naive lm(), feols IID, and feols clustered SEs, with a clear explanation of why they differ (degrees of freedom and within-entity correlation).
- **Intercept verification.** Explicitly checks that the demeaned OLS intercept is ~0 (5.03e-16), confirming proper two-way demeaning.
- **Demeaned means verification.** Prints all 6 demeaned variable means to confirm they are ~0, validating the formula implementation.
- **Consistent CSV exports.** All intermediate and final outputs exported inline after each section, following the pipeline convention.

## Priority Action Items

1. **[LOW]** Remove unused `patchwork` from imports (lines 21, 30)
2. **[LOW]** Replace manual `pt()` p-value with `pvalue(twfe_model)` (line 134)
3. **[LOW]** Fix leading whitespace on line 252
