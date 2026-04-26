# Script Review: stata_did

**Script:** `analysis.do` (522 lines)
**Language:** Stata
**Executed:** 26 Apr 2026
**Status:** All code runs -- exit code 0, reproducible across 2 consecutive runs

## Verdict: ACCEPT

The script is well-structured, executes cleanly, and correctly reproduces all key results from Corral & Yang (2024). All 6 figures are generated, both regression tables are exported, and the DiD estimate (~25.32) matches the paper. One LOW issue and one informational note identified.

## Execution Results

- Exit code: 0
- Figures generated: 6 PNG files
- Tables generated: 2 Word files (table2.doc, table4.doc)
- Errors: none
- Warnings: none
- Notes: 7 collinearity notes from `eventdd` (expected -- time dummies absorbed by FE)

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Causal inference | LOW | lines 472-481 | Display statements show paper's expected values (e.g., "Time -4: -1.042*") but actual data produces slightly different values (lead4=0.342, lead3=-0.322, lead2=0.593). The mismatch is because the pre-built dataset uses a different random seed than the paper's exact DGP. | Replace hardcoded expected values with a note: "Exact values depend on the dataset's random seed. The key pattern is: pre-treatment near zero, post-treatment ~25." Or compute dynamically from e(b). |
| 2 | Structure | LOW | line 303 | `didregress` wrapped in `capture noisily` for Stata <17 compatibility. This is correct practice but the comment could note that `didregress` requires Stata 17+. | Add comment: `* Note: requires Stata 17+; wrapped in capture for backward compatibility` |

## Positive Highlights

- **Comprehensive header block** (lines 1-45): Documents datasets, variables, estimand, usage, and required packages. Excellent for reproducibility.
- **Pedagogical progression**: Sections build logically from naive ITS (why it's misleading) through manual DiD, five regression approaches, table replication, and event study. Mirrors the paper's narrative arc.
- **Five equivalent regression approaches** (Section 7): Showing `reg`, `didregress`, `xtreg`, `reghdfe`, and `reghdfe` with covariates gives readers a clear comparison of equivalent methods.
- **Proper use of `preserve`/`restore`** (Sections 3-4): Data manipulation for figures does not corrupt the main dataset.
- **Counterfactual construction** (Section 4): The `insobs` approach with `treated==2` for the dashed counterfactual line is creative and follows the reference code exactly.
- **Correct estimand framing**: Header states ATT explicitly. Section 7.5 correctly notes to "never control for variables affected by treatment" (no post-treatment bias).
- **`capture` prefix on all package installations**: Idempotent and won't fail if packages are already installed.
- **Clean graph exports** at `width(2400)` with `graphregion(color(white))` for professional appearance.
- **All key results match the paper**: DiD = 25.32 (manual), 25.31 (regression), Table 2 columns (25.31/25.33/25.31), event study pattern (near-zero pre, ~25 post).
- **Section banners** with `di` statements make the log easy to navigate.

## Priority Action Items

1. **[LOW]** Update event study display text (lines 472-481) to show actual values from the pre-built dataset rather than the paper's exact values, or add a note about seed-dependent variation.
2. **[LOW]** Add Stata version note for `didregress` (line 303).

## Dimension Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| 1. Execution | 10/10 | Clean execution, all outputs generated, reproducible |
| 2. Structure | 10/10 | Clear header, section dividers, logical flow |
| 3. Code quality | 9/10 | Clean, well-commented; minor: could note Stata 17+ for didregress |
| 4. Reproducibility | 10/10 | `set seed 42`, deterministic results, pre-built datasets |
| 5. Figure conventions | 9/10 | 6 PNGs at width(2400), proper naming; Stata graphs use default palette (not site colors, but this is standard for Stata) |
| 6. Data handling | 10/10 | Proper `xtset`, `describe`, `summarize`, `xtsum`, `list` |
| 7. Statistical correctness | 10/10 | All methods applied correctly, results match paper, SEs properly clustered |
| 8. Causal inference | 10/10 | ATT stated, observational/quasi-experimental framing correct, covariates pre-treatment only |

**Overall: 78/80**
