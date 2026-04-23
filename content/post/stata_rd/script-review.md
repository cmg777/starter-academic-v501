# Script Review: stata_rd

**Script:** `analysis.do` (387 lines)
**Language:** Stata
**Executed:** 2026-04-24 08:08
**Status:** All code runs

## Verdict: ACCEPT

The script is correct, well-structured, and produces all expected output. One medium-severity issue regarding sign convention clarity between parametric and nonparametric estimates should be addressed in comments or the blog post. Three low-severity code hygiene items are noted below.

## Execution Results

- Exit code: 0
- Execution time: ~6 seconds
- Figures generated: 5 PNG files
- Warnings: "Mass points detected in the running variable" (informational, handled correctly by rdrobust)
- Log: 945 lines, complete with `log close` at end

## Dimension Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| 1. Execution | PASS | Clean run, all 5 figures, log complete |
| 2. Structure | PASS | Header, section dividers, logical flow |
| 3. Code quality | PASS | Clean and readable; minor dead variable |
| 4. Reproducibility | PASS | `set seed 42`, deterministic results |
| 5. Figure conventions | PASS | 5 PNGs at width 2400, site colors, correct naming |
| 6. Data handling | PASS | Stats printed, sharp design cross-tabbed |
| 7. Statistical correctness | PASS | Methods correct; sign convention needs clarification |
| 8. Causal inference | PASS | LATE stated, sharp design verified, validity checks present |

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Statistical | MEDIUM | Sections 6--7 | Parametric estimate is +10.8 (coefficient on `treat`) while rdrobust gives -8.6 (jump from left to right of cutoff). Both are correct but the sign difference is confusing without explanation. | Add a comment in Section 7 explaining that rdrobust estimates the discontinuity as right-minus-left, so the negative sign means tutored students (left of cutoff) score higher. The absolute magnitudes also differ because the parametric model uses the full sample while rdrobust uses a local bandwidth (~10 points). |
| 2 | Code quality | LOW | line 159 | `interact2 = centered2 * treat` is created and labeled but never used in the regression (Model 3 uses factor notation `c.centered2#c.treat` instead). | Remove lines 159--160, or use `interact2` in the regression instead of factor notation. |
| 3 | Code quality | LOW | line 55 | `gen treat = tutoring` creates a redundant copy of a variable that already exists as numeric 0/1. | Use `clonevar treat = tutoring` (makes the duplication explicit) or simply use `tutoring` throughout the script. |
| 4 | Structure | LOW | lines 380--386 | The final success message (`di "Analysis complete."`) is placed after `log close`, so it appears in the console but not in the log file. | Move the success message block before `log close`, or add a second `di` summary after `log close` for console-only output. |

## Positive Highlights

- **Sharp design verification** (Section 2): The cross-tab confirming 100% compliance is an excellent pedagogical step that most RDD tutorials skip.
- **Comprehensive robustness** (Sections 8--10): Bandwidth sensitivity, McCrary density test, and placebo cutoffs provide three independent validity checks -- a thorough approach.
- **Placebo cutoff figure** (Section 10): The `postfile` approach to building the placebo dataset is clean Stata idiom, and the resulting figure clearly shows only the true cutoff (70) is significant.
- **Site color palette**: Consistent use of steel blue `"106 155 204"` and warm orange `"217 119 87"` across all custom figures.
- **Kernel comparison** (Section 7): Testing triangular, uniform, and Epanechnikov kernels shows estimate stability (-8.2 to -8.6), reinforcing robustness.

## Priority Action Items

1. **[MED]** Add a comment in Section 7 explaining the sign convention difference between parametric (+10.8) and rdrobust (-8.6) estimates, and why the magnitudes differ (full sample vs local bandwidth).
2. **[LOW]** Remove unused `interact2` variable (lines 159--160).
3. **[LOW]** Move final success message before `log close` so it appears in the log.
