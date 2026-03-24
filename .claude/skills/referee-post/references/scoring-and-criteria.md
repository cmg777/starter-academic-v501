# Scoring and Criteria

> This file is part of the `referee-post` skill. If you update this content,
> also update the summary in SKILL.md. Read at the start of the review
> (for calibration) and during report generation (for scoring).

## Severity Definitions

| Level | Meaning |
| --- | --- |
| **HIGH** | Errors that would mislead readers, incorrect results, code that doesn't run, missing required sections, or methodological errors. Must fix before publishing. |
| **MEDIUM** | Issues that reduce clarity or pedagogical value but do not produce wrong results. Unexplained jargon, missing sandwich layers, weak interpretations. Should fix. |
| **LOW** | Style preferences, minor improvements, optional enhancements. Nice to fix. |

## Verdict Criteria

| Verdict | Criteria |
| --- | --- |
| **ACCEPT** | No HIGH issues, at most 2 MEDIUM issues. Ready to publish. |
| **MINOR REVISION** | No HIGH issues but 3+ MEDIUM, or 1 HIGH that is easy to fix. Needs targeted improvements. |
| **MAJOR REVISION** | 2+ HIGH issues, or fundamental problems with methodology, narrative, or code correctness. Needs significant rework. |

## Scoring Guidelines

Each dimension is scored 1-10:

| Score | Meaning |
| --- | --- |
| 9-10 | Excellent -- meets or exceeds the reference post standard |
| 7-8 | Good -- minor issues only |
| 5-6 | Adequate -- several issues that need attention |
| 3-4 | Weak -- significant problems |
| 1-2 | Needs complete rework |

## Reviewer Guidelines

- **Be specific:** Always cite the exact section heading and approximate code
  block number where the issue occurs.
- **Be actionable:** Every issue must include a concrete suggestion for how to
  fix it. Vague feedback like "improve this section" is not acceptable.
- **Provide full rewrites for HIGH issues:** For every HIGH-severity issue,
  include a complete before/after text or code block in the "Suggested rewrites"
  subsection. Make it copy-pasteable so the author can apply it directly.
- **Be constructive:** Acknowledge what works well, not just what needs fixing.
- **Think like a beginner:** The target reader is a student encountering this
  method for the first time. Explanations and code should be accessible.
- **Prioritize simplicity:** Prefer simpler code and simpler explanations over
  technically sophisticated ones. Three clear lines beat one clever one-liner.
- **Do not modify any files.** The report is advisory only.

## Quality Checklist (internal, before delivering the report)

- [ ] Read the **entire** post, not just the first few sections
- [ ] Ran the code (or assembled it from code blocks) and compared output
- [ ] Counted all interpretation paragraphs (report exact count vs. 8 minimum)
- [ ] Counted all figures (report exact count vs. 3 minimum)
- [ ] Checked every code block for the sandwich pattern
- [ ] Scanned for unexplained jargon and assumed knowledge
- [ ] Verified front matter against site conventions
- [ ] Assessed whether the post answers its stated case study question
- [ ] Checked narrative flow and transitions between sections
- [ ] Cross-checked deliverables (script.py, notebook.ipynb) if they exist
- [ ] Verified references include original papers, not just library docs
- [ ] Spot-checked 2-3 reference URLs
- [ ] Counted equations (at least 2 for quantitative methods)
- [ ] Verified each equation is mathematically correct and matches code variables
- [ ] Checked that every equation has a plain-language explanation
- [ ] Scanned for missing analogies for complex concepts and suggested ones
- [ ] Evaluated takeaways for concreteness, specificity, and coverage (method, data, limitation, next step)
- [ ] Flagged sentences over 40 words and suggested splits
- [ ] Provided at least one positive highlight
- [ ] All HIGH issues have full before/after rewrites
- [ ] All issues have specific locations and actionable suggestions
- [ ] Priority action items are ranked by impact
- [ ] Scores assigned for all seven dimensions
- [ ] Checked image freshness (chart values match output blocks)
- [ ] Checked for orphaned PNGs not referenced in index.md
- [ ] Checked currency dollar signs use `\\$` in index.md (if math enabled)
- [ ] For causal posts: verified estimand labels (ATE/ATT) for each method
- [ ] For causal posts: verified randomized vs observational framing is accurate
