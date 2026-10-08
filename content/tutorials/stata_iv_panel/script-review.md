# Script Review: stata_iv_panel

**Script:** `analysis.do` (627 lines)
**Language:** Stata
**Executed:** 2026-04-27 14:55
**Status:** All code runs

## Verdict: ACCEPT

Excellent replication script. All regression coefficients match the published
tables exactly. IV diagnostics are thorough, figures are clean and informative,
and the code is well-structured with clear section dividers and comments.

## Execution Results

- Exit code: 0
- Figures generated: 5 PNG files
- CSV files exported: 7
- Warnings: None (standard collinearity notes for omitted Iyear17 are expected)
- Final success message: Present

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Code quality | LOW | Lines 119-177, 319-332, 553-583 | Models re-estimated 3 times (estout display, figure data, CSV export). Redundant computation. | Could store scalars from first estimation pass, but this is a clarity-vs-efficiency tradeoff and the script runs fine. |
| 2 | Data handling | LOW | Line 99 | `table1_summary_stats.csv` exports via `collapse` which produces a single-row CSV. Less useful than a variable-per-row format. | Consider `tabstat` with `save` option, or reshape the collapsed data to long format before export. |

## Positive Highlights

- **Exact replication verified:** OLS coef = 0.001, 2SLS coefs = -0.303, -0.293, -0.296 for Conflict 1+ -- all match Hodler & Raschky (2014) Table 2 exactly.
- **Correct estimand framing:** Line 185 explicitly states "Causal effect of economic shocks on conflict probability" with exclusion restriction logic (lines 186-187).
- **IV diagnostics thorough:** First-stage F-stats (24.6, 40.3, 25.3) all exceed Stock-Yogo 10% critical value (16.38). Hansen J p-value = 0.93 for overidentification test -- instruments are valid.
- **Binned scatter plots** (Figures 3a-3b) are a creative addition beyond the original paper, clearly showing the first-stage relationship.
- **Site color palette** consistently applied (steel blue for primary, warm orange for secondary).
- **Clean preserve/restore** usage throughout -- original data never contaminated.
- **Idempotent package installation** with `capture ssc install`.
- **All 5 figures** use `width(2400)` and follow `<slug>_<name>.png` naming convention.
- **No `featured.png` generated** -- correct.

## Priority Action Items

1. **[LOW]** Consider consolidating the 3 estimation passes into 1 by storing scalars after the first pass. Not critical -- the redundancy improves readability.
2. **[LOW]** Reshape `table1_summary_stats.csv` to long format (one row per variable) for downstream consumption.
