# Scoring and Criteria for Script Reviews

> This file is part of the `review-script` skill. Read at the start of the
> review (for calibration) and during report generation (for scoring).

## Severity Definitions

| Level | Meaning |
| --- | --- |
| **HIGH** | Script does not run, produces wrong results, has data leakage, uses deprecated APIs that will break, or has statistical errors. Must fix before using results. |
| **MEDIUM** | Code works but has quality issues: poor variable names, missing comments, no caching, missing seed, or suboptimal structure. Should fix. |
| **LOW** | Style preferences, minor improvements, optional enhancements. Nice to fix. |

## Verdict Criteria

| Verdict | Criteria |
| --- | --- |
| **ACCEPT** | No HIGH issues, at most 2 MEDIUM issues. Script is correct and clean. |
| **MINOR REVISION** | No HIGH issues but 3+ MEDIUM, or 1 HIGH that is easy to fix. Needs targeted improvements. |
| **MAJOR REVISION** | 2+ HIGH issues, or fundamental problems with correctness, structure, or reproducibility. Needs significant rework. |

## Reviewer Guidelines

- **Run the code first.** The single most valuable thing is verifying execution.
- **Check outputs match expectations.** Compare execution log against script claims.
- **Be specific:** Cite exact line numbers or section names.
- **Be actionable:** Every issue must include a concrete fix suggestion.
- **Think like a code reviewer:** Focus on correctness, readability, and maintainability.
- **Do not modify any files.** The review is advisory only.
