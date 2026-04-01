# Referee Report Template

> This file is part of the `referee-post` skill. If you update this content,
> also update the summary in SKILL.md. Read this file during Step 2 when
> producing the report.

Deliver the report **inline in the conversation** using this template.
Do NOT save it to a file.

```
# Referee Report: <Post Title>

**Post:** `content/post/<slug>/index.md`
**Date reviewed:** <current date>
**Reviewer perspective:** Expert professor of data science and econometrics

---

## Overall Assessment

<2-3 sentence summary: Is this post ready to publish? What is its main
strength? What is the single most important improvement needed?>

**Verdict:** <ACCEPT | MINOR REVISION | MAJOR REVISION>
**Scores:** Structure N/10 | Code N/10 | Equations N/10 | Explanations N/10 | Interpretations N/10 | Writing N/10 | Rigor N/10

---

## 0. Code Execution Results

**Status:** <All code runs successfully / Errors found>

<If errors were found, list each one:>

| # | Code block | Error type | Details |
|---|-----------|------------|---------|
| 1 | Section "X", block N | Runtime error / Wrong output / Missing import | <description> |

<If output discrepancies were found:>

| # | Location | Post shows | Actual output | Severity |
|---|----------|-----------|---------------|----------|
| 1 | After block N | "R² = 0.45" | "R² = 0.43" | HIGH/LOW |

<If image freshness issues were found:>

| # | Image file | Issue | Severity |
|---|-----------|-------|----------|
| 1 | comparison_chart.png | Chart shows $1,876 but output block says $1,736 | HIGH |

**Orphaned images:** <list any PNGs not referenced in index.md>

---

## 1. Structure and Compliance

| Check | Status | Notes |
|-------|--------|-------|
| Front matter complete | PASS/FAIL | <details> |
| toc: true | PASS/FAIL | |
| Required sections present | PASS/FAIL | <missing sections> |
| Heading hierarchy | PASS/FAIL | |
| >= 3 figures | PASS/FAIL | <count found> |
| featured.png exists | PASS/FAIL | |
| Output blocks present | PASS/FAIL | <count missing> |
| No emojis | PASS/FAIL | |

**Comments:** <any structural issues not in the table>

---

## 2. Code Quality

**Strengths:**
- <what the code does well>

**Issues:**

| # | Location | Severity | Issue | Suggested fix |
|---|----------|----------|-------|---------------|
| 1 | Section "X", code block N | HIGH/MED/LOW | <description> | <specific fix> |

**Simplification opportunities:**
- <blocks that could be simplified, with concrete suggestions>

### Suggested rewrites (HIGH-severity issues only)

For each HIGH-severity code issue, provide a full before/after rewrite:

**Issue #N -- <brief description>**

Before:
```python
<current code from the post>
```

After:
```python
<suggested replacement code>
```

<1-sentence explanation of what changed and why>

---

## 3. Beginner Accessibility

**Unexplained jargon:**

| # | Term/concept | First appears in | Suggested definition |
|---|-------------|------------------|---------------------|
| 1 | "<term>" | Section "X" | "<one-sentence plain-language definition>" |

**Assumed knowledge:**
- <steps that assume prior knowledge, with what should be explained>

**Complexity jumps:**
- <locations where difficulty spikes, with suggestions to bridge the gap>

---

## 3.5. Mathematical Equations

**Equation count:** N (minimum 2 for quantitative methods)

| # | Location | Severity | Issue | Suggested fix |
|---|----------|----------|-------|---------------|
| 1 | Section "X" | HIGH/MED/LOW | <e.g., incorrect subscript, missing equation, no explanation> | <specific fix> |

**Missing equations:**
- <methods/models described verbally but without formal notation>

| Check | Status | Notes |
|-------|--------|-------|
| Notation consistent throughout | PASS/FAIL | <flag symbol changes> |
| Every equation has plain-language explanation | PASS/FAIL | <which lack one> |
| Variable mapping (math symbols -> code) | PASS/FAIL | <which lack mapping> |
| LaTeX rendering correct | PASS/FAIL | <rendering issues> |

---

## 4. Explanations (Pre-code Paragraphs)

**Strengths:**
- <what the explanations do well>

**Issues:**

| # | Location | Issue | Suggested improvement |
|---|----------|-------|----------------------|
| 1 | Before section "X" | <e.g., too technical> | <rewrite suggestion> |

**Missing explanations:**
- <code blocks that lack a pre-explanation>

### Suggested rewrites (HIGH-severity issues only)

**Issue #N -- <brief description>**

Before:
> <current explanation text from the post>

After:
> <suggested replacement text>

---

## 5. Interpretations (Post-code Paragraphs)

**Count:** N / 8 minimum

**Strengths:**
- <what the interpretations do well>

**Issues:**

| # | Location | Issue | Suggested improvement |
|---|----------|-------|----------------------|
| 1 | After section "X" | <e.g., restates output without meaning> | <suggestion> |

**Missing interpretations:**
- <code blocks producing output but lacking interpretation>

### Suggested rewrites (HIGH-severity issues only)

**Issue #N -- <brief description>**

Before:
> <current interpretation text from the post>

After:
> <suggested replacement text>

---

## 5.5. Writing Clarity

**Analogies provided:** N analogies for M complex concepts

**Missing analogies:**

| # | Complex concept | Section | Suggested analogy |
|---|----------------|---------|-------------------|
| 1 | "<concept>" | "X" | "<concrete analogy to insert>" |

**Clarity issues:**

| # | Location | Issue | Suggested rewrite |
|---|----------|-------|-------------------|
| 1 | Section "X", paragraph N | <e.g., sentence too long, passive voice, abstract before concrete> | <clearer version> |

**Sentence length flags:**
- <paragraphs with avg > 25 words or sentences > 40 words>

---

## 6. Academic Rigor and Content

**Methodology assessment:**
- <Is the method appropriate for the question and data?>
- <Any statistical errors or misleading claims?>
- <Are method assumptions stated?>

**Limitations discussed:** Yes/No -- <assessment of completeness>

**References:**

| Check | Status | Notes |
|-------|--------|-------|
| Original method paper cited | PASS/FAIL | <what's missing> |
| Dataset source properly cited | PASS/FAIL | |
| Package docs linked | PASS/FAIL | |
| References numbered, in order | PASS/FAIL | |
| URLs resolve (spot-check) | PASS/FAIL | <any broken links> |

**LaTeX math:** <correct / issues / N/A>

**Takeaways quality:**

| Check | Status | Notes |
|-------|--------|-------|
| Takeaways section exists | PASS/FAIL | |
| Not just a summary of headings | PASS/FAIL | <flag generic restatements> |
| Concrete insights with numbers | PASS/FAIL | <flag vague takeaways> |
| Connects to case study & real world | PASS/FAIL | |
| Covers: method, data, limitation, next step | PASS/FAIL | <which are missing> |

**Suggested takeaways** (if current ones are weak or missing):
- <concrete takeaway suggestions based on the post's actual findings>

---

## 7. Flow and Narrative

- **Transitions:** <smooth / issues found -- list any abrupt jumps>
- **Question-answer arc:** <Does Discussion answer the Overview question?>
- **Result ordering:** <most important first? or key result buried?>
- **"So what?" moment:** <present / missing -- where to add if missing>
- **Consistent terminology:** <consistent / flag any term drift>

---

## 8. Deliverable Consistency

<Only include if script.py or notebook.ipynb exist>

| Check | Status | Notes |
|-------|--------|-------|
| Same imports | PASS/FAIL | <discrepancies> |
| Same RANDOM_SEED | PASS/FAIL | |
| Same data loading | PASS/FAIL | |
| Same variable names | PASS/FAIL | |
| Same output values | PASS/FAIL | |
| Notebook uses raw LaTeX | PASS/FAIL | |
| Notebook runs in Colab | PASS/FAIL | |

---

## 9. Priority Action Items

Ranked list of the most impactful changes, ordered by importance:

1. **[HIGH]** <most critical issue -- location and fix>
2. **[HIGH]** <second most critical>
3. **[MED]** <important but not blocking>
4. **[LOW]** <nice to have>

---

## 10. Positive Highlights

- <2-3 things the post does particularly well>
```
