# Scoring and Criteria for Results Report Reviews

> This file is part of the `review-results-report` skill. Read at the start
> of the review for calibration.

## Severity Definitions

| Level | Meaning |
| --- | --- |
| **HIGH** | Numbers in the report do not match script output, key results are missing, interpretations are factually wrong, or figures are misrepresented. Must fix before the post writer uses this report. |
| **MEDIUM** | Interpretations are shallow (restate output without domain meaning), figure descriptions are generic, or key findings are vague. Should fix for better downstream post quality. |
| **LOW** | Formatting issues, minor wording improvements, optional additional findings. Nice to fix. |

## Verdict Criteria

| Verdict | Criteria |
| --- | --- |
| **ACCEPT** | No HIGH issues, at most 2 MEDIUM issues, AND zero dimension-7 FAILs (PARTIALs are tolerable as LOW items). Report accurately captures script results with good interpretations and clears the new-gates bar. |
| **MINOR REVISION** | No HIGH issues but 3+ MEDIUM, or 1 HIGH that is easy to fix, OR 1–2 dimension-7 sub-bullets FAIL. Needs targeted improvements. |
| **MAJOR REVISION** | 2+ HIGH issues, OR ≥ 3 dimension-7 sub-bullets FAIL, OR fundamental accuracy problems. Report cannot be trusted as a source for the blog post. |

### Dimension 7 (new gates) failure tiers

The five sub-bullets in dimension 7 are weighted equally for verdict
calculation. Count FAILs only (PARTIAL does not count toward the verdict
tier — it surfaces as a LOW item in the Issues table).

- 0 FAIL → no escalation from dimension 7 alone.
- 1–2 FAIL → MINOR REVISION recommendation, even if dimensions 1–6 would
  otherwise yield ACCEPT.
- ≥ 3 FAIL → MAJOR REVISION recommendation, regardless of dimensions 1–6.

A report can also fail dimension 7 in spirit by clearing the counts but
falling short on substance (e.g., 8 Key Findings that are 8 restatements
of the same number). Flag substance issues under the relevant other
dimension (3 for shallow interpretations, 5 for repetitive findings), not
under dimension 7.

## Reviewer Guidelines

- **Verify every number.** Re-run the script or read the execution log to confirm accuracy.
- **Check figure inventory against actual files.** Run `ls *.png` in the post directory.
- **Read interpretations critically.** They should add value beyond restating output.
- **Open the CSVs.** Spot-check at least 2 numbers in the report against
  full-precision CSV values, not just the rounded log values.
- **Walk the surprises checklist.** Verify each of the 7 categories from
  `interpretation-guide.md` is addressed (substantive bullet OR explicit
  "not applicable" note).
- **Be specific:** Cite exact section names and numbers that are wrong.
- **Be actionable:** Every issue must include the correct number or improved wording.
- **Do not modify any files.** The review is advisory only.
