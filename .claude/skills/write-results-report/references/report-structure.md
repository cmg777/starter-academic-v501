# Results Report Structure

> This file is part of the `write-results-report` skill. Read this file
> when writing results_report.md.

## Template

```markdown
# Results Report: <Topic>

**Script:** `script.py` (or `analysis.do` / `analysis.R`)
**Executed:** <YYYY-MM-DD HH:MM>
**Status:** Success / Errors found
**Runtime:** <X seconds>
**Language:** Python <version> / Stata <version> / R <version>
**Key packages:** <list with versions>

---

## Execution Summary

<1-2 paragraphs: What the script does, what dataset it uses, what method
it applies, and what the main finding is.>

**Warnings:** <any deprecation or convergence warnings, or "None">

---

## Data Overview

<Paste the actual printed output from the script: shape, columns, head,
descriptive statistics.>

**Interpretation:** <What the data tells us -- sample size, coverage,
variable ranges, any notable patterns in the descriptive stats. Include
specific numbers.>

---

## Method Results

### <Method/Step 1 name>

<Paste the actual printed output from the script.>

**Interpretation:** <What these numbers mean in context. Quote specific
values and translate them into domain-meaningful statements. Connect to
the case study question.>

### <Method/Step 2 name>

<Paste the actual printed output.>

**Interpretation:** <Domain-meaningful interpretation with specific numbers.>

[... one subsection per major analysis step ...]

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `<slug>_eda.png` | <what it shows> | <main finding visible in the figure> |
| 2 | `<slug>_results.png` | <what it shows> | <main finding> |
| ... | ... | ... | ... |

---

## Key Findings

At least 5 key findings, each with specific numbers:

1. **<Finding title>:** <Specific numbers and their domain meaning.>
2. **<Finding title>:** <Specific numbers and their domain meaning.>
3. **<Finding title>:** <Specific numbers and their domain meaning.>
4. **<Finding title>:** <Specific numbers and their domain meaning.>
5. **<Finding title>:** <Specific numbers and their domain meaning.>

---

## Surprises and Caveats

<Any unexpected results, convergence issues, sensitivity to parameters,
very low/high R-squared, huge confidence intervals, or limitations
discovered during execution. If nothing surprising, state "No unexpected
results" and note key assumptions.>
```

## Section guidelines

- **Execution Summary:** 1-2 paragraphs max. State the "what" clearly.
- **Data Overview:** Include the actual printed output, not a summary of it.
- **Method Results:** One subsection per major analysis step. Always include
  the raw output AND an interpretation paragraph.
- **Figure Inventory:** Every PNG in the directory must appear here. Description
  is 1 sentence about what the figure shows. Key takeaway is 1 sentence about
  the main finding visible in the figure.
- **Key Findings:** These become the foundation for the blog post's interpretation
  paragraphs. Make them specific, numeric, and domain-meaningful.
- **Surprises and Caveats:** Flag anything the blog post writer should know about.
  This prevents the post from overclaiming or missing important nuances.
