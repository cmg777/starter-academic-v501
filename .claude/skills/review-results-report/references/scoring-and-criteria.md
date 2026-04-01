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
| **ACCEPT** | No HIGH issues, at most 2 MEDIUM issues. Report accurately captures script results with good interpretations. |
| **MINOR REVISION** | No HIGH issues but 3+ MEDIUM, or 1 HIGH that is easy to fix. Needs targeted improvements. |
| **MAJOR REVISION** | 2+ HIGH issues, or fundamental accuracy problems. Report cannot be trusted as a source for the blog post. |

## Reviewer Guidelines

- **Verify every number.** Re-run the script or read the execution log to confirm accuracy.
- **Check figure inventory against actual files.** Run `ls *.png` in the post directory.
- **Read interpretations critically.** They should add value beyond restating output.
- **Be specific:** Cite exact section names and numbers that are wrong.
- **Be actionable:** Every issue must include the correct number or improved wording.
- **Do not modify any files.** The review is advisory only.
