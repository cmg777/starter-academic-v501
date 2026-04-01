# Results Report Review Checklist

> This file is part of the `review-results-report` skill. Read this file
> when performing the review.

## Review dimensions

### 1. Accuracy (highest priority)

- [ ] Every number in the report matches the actual script output
- [ ] Execution summary correctly describes what the script does
- [ ] Data overview matches the actual dataset (shape, columns, stats)
- [ ] No numbers are fabricated or estimated -- all come from execution
- [ ] Warnings and caveats accurately reflect script behavior

### 2. Completeness

- [ ] All major script outputs are captured (not just selected results)
- [ ] Figure inventory lists every PNG in the directory
- [ ] At least 5 key findings with specific numbers
- [ ] Surprises and Caveats section present (even if "None")
- [ ] Method Results has one subsection per major analysis step

### 3. Interpretation quality

- [ ] At least 5 interpretation paragraphs
- [ ] Each interpretation quotes specific numbers
- [ ] Each interpretation translates to domain meaning (not just restating output)
- [ ] Each interpretation connects to the research question
- [ ] Interpretations are single continuous paragraphs (2-4 sentences)
- [ ] Uncertainty and limitations are flagged where relevant

### 4. Figure descriptions

- [ ] Every PNG has a description (what it shows)
- [ ] Every PNG has a key takeaway (main finding visible)
- [ ] Descriptions are specific (not generic like "a chart")
- [ ] Takeaways include specific numbers where applicable

### 5. Key findings quality

- [ ] Findings are specific with exact numbers (not vague)
- [ ] Findings cover different aspects of the analysis (not repetitive)
- [ ] Findings are accurate (verified against script output)
- [ ] Findings are domain-meaningful (not just statistical jargon)

### 6. Structure and format

- [ ] Follows the results_report.md template structure
- [ ] Metadata block complete (script, date, status, runtime, packages)
- [ ] Clear section dividers
- [ ] Raw output is included (not summarized away)
- [ ] Report is saved as `results_report.md` in the post directory

## Report format

Deliver the review inline:

```
# Results Report Review: <slug>

**Report:** `results_report.md`
**Script:** `<filename>`
**Reviewed:** <date>

## Verdict: <ACCEPT / MINOR REVISION / MAJOR REVISION>

## Accuracy Check
<summary of number verification>

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|

## Positive Highlights
- <what the report does well>

## Priority Action Items
1. **[HIGH]** <most critical>
2. **[MED]** <important>
```
