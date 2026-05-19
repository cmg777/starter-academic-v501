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
- [ ] **At least 8 key findings** with specific numbers (raised from 5 in
      write-results-report v2)
- [ ] Surprises and Caveats section present AND walks the 7 categories
      from `interpretation-guide.md` (see dimension 7)
- [ ] Method Results has one subsection per major analysis step

### 3. Interpretation quality

- [ ] **At least 10 interpretation paragraphs** (raised from 5)
- [ ] Each interpretation quotes specific numbers
- [ ] Each interpretation translates to domain meaning (not just restating output)
- [ ] Each interpretation connects to the research question
- [ ] Interpretations are single continuous paragraphs (2-4 sentences)
- [ ] Uncertainty and limitations are flagged where relevant
- [ ] Each interpretation anchors to a domain quantity (dollars, percent,
      count, deaths per 100k); log-coefficients and hazard ratios are
      translated (criterion 7)

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

### 7. New-gates compliance (write-results-report v2)

Five gates that every report should clear. Mark each PASS / PARTIAL / FAIL.

- [ ] **Inline figure embeds per method subsection** — every method
      subsection opens with `![alt](file.png)` AND every PNG appears in the
      Figure Inventory table.
- [ ] **Per-section inline tables** — method subsections with structured
      results include a markdown table alongside the raw output, sourced
      from the corresponding CSV (target ≥ 4 such tables across the report).
- [ ] **≥ 8 Key Findings.**
- [ ] **Reproduction Audit appendix** — present if and only if the post
      folder contains a source paper (`references/latex/`, `*.tex`, `*.pdf`).
      Each row cites a specific line number / section / figure label.
      Otherwise mark "not applicable".
- [ ] **Surprises walks 7 categories explicitly** — each of estimator
      non-determinism, sample reductions, weighting / aggregation, effect
      concentration, cosmetic warnings, identification assumptions, and
      pedagogical framing is addressed with a substantive bullet OR an
      explicit "not applicable" note. Implicit coverage (the category is
      addressed but not labeled) is PARTIAL.

### Severity mapping for dimension 7

- ≥ 3 sub-bullets FAIL → MAJOR REVISION recommendation, regardless of
  dimensions 1–6.
- 1–2 sub-bullets FAIL → MINOR REVISION recommendation.
- All PASS or only PARTIAL → no escalation; individual PARTIALs become
  LOW items in the Issues table.

## Report format

Deliver the review inline AND save to
`content/post/<slug>/results_report_review.md`:

```
# Results Report Review: <slug>

**Report:** `results_report.md`
**Script:** `<filename>`
**Reviewed:** <date>

## Verdict: <ACCEPT / MINOR REVISION / MAJOR REVISION>

<1-2 sentence verdict rationale.>

## Accuracy Check
<summary of number verification: N numbers spot-checked, N matched>

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|

## New-gates compliance (dimension 7)

| # | Gate | Status | Notes |
|---|------|--------|-------|
| 1 | Inline figure embeds per method subsection | PASS / PARTIAL / FAIL | … |
| 2 | Per-section inline tables (≥ 4) | PASS / PARTIAL / FAIL | … |
| 3 | ≥ 8 Key Findings | PASS / PARTIAL / FAIL | … |
| 4 | Reproduction Audit appendix | PASS / PARTIAL / FAIL / N/A | … |
| 5 | Surprises walks 7 categories explicitly | PASS / PARTIAL / FAIL | … |

## Positive Highlights
- <what the report does well>

## Priority Action Items
1. **[HIGH]** <most critical>
2. **[MED]** <important>
3. **[LOW]** <nice to have>
```
