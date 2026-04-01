# Scoring and Criteria

> This file is part of the `review-post` skill. Read at the start of the
> review (for calibration) and during report generation (for scoring).

## Severity Definitions

| Level | Meaning |
| --- | --- |
| **HIGH** | Errors that would mislead readers, incorrect results, code that doesn't run, missing required sections, methodological errors, broken rendering, or broken links. Must fix before publishing. |
| **MEDIUM** | Issues that reduce clarity or pedagogical value but do not produce wrong results. Unexplained jargon, missing sandwich layers, weak interpretations, inconsistencies, missing conventions. Should fix. |
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

## Focus Keyword Mapping

| Focus keyword | Dimensions run |
|---|---|
| `code` | 1 (Code execution), 4 (Code quality) |
| `structure` | 2 (Front matter), 3 (Markdown structure) |
| `math` | 7 (Mathematical equations) |
| `explanations` | 5 (Sandwich pattern), 6 (Beginner accessibility) |
| `interpretations` | 8 (Interpretations) |
| `writing` | 9 (Writing clarity and grammar) |
| `grammar` | 9 (grammar/spelling subset only) |
| `rigor` | 10 (Academic rigor), 11 (Narrative flow) |
| `images` | 12 (Images, Mermaid, deliverables) |
| (omitted) | All 12 dimensions |

## Reviewer Guidelines

- **Run the code first.** The single most valuable thing is verifying execution.
- **Be specific:** Always cite the exact section heading and code block.
- **Be actionable:** Every issue must include a concrete suggestion.
- **Provide full rewrites for HIGH issues:** Complete before/after text or code.
- **Be constructive:** Acknowledge what works well.
- **Think like a beginner:** The target reader is encountering this method for the first time.
- **Prioritize simplicity:** Prefer simpler code and explanations.
- **Do not modify any files.** The report is advisory only.

## Quality Checklist (internal, before delivering report)

- [ ] Read the **entire** post
- [ ] Ran the code and compared output
- [ ] Counted interpretation paragraphs (exact count vs. 8 minimum)
- [ ] Counted figures (exact count vs. 3 minimum)
- [ ] Checked every code block for sandwich pattern
- [ ] Scanned for unexplained jargon
- [ ] Verified front matter against conventions
- [ ] Assessed whether post answers its case study question
- [ ] Checked narrative flow and transitions
- [ ] Cross-checked deliverables (script.py, notebook) if they exist
- [ ] Verified references include original papers
- [ ] Checked equation escaping, correctness, and plain-language companions
- [ ] Evaluated takeaways for concreteness and coverage
- [ ] Scanned all prose for grammar, spelling, typos
- [ ] Checked for orphaned PNGs and image freshness
- [ ] All HIGH issues have full before/after rewrites
- [ ] All issues have specific locations and actionable suggestions
- [ ] Priority action items ranked by impact
- [ ] Scores assigned for all seven dimensions
