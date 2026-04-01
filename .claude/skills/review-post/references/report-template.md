# Review Report Template

> This file is part of the `review-post` skill. Read this file when
> producing the review report.

Deliver the report **inline in the conversation** using this template.
Do NOT save it to a file.

```
# Post Review: <Post Title>

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

## 1. Code Execution

**Status:** <All code runs successfully / Errors found>

<If errors:>

| # | Code block | Error type | Details |
|---|-----------|------------|---------|

<If output discrepancies:>

| # | Location | Post shows | Actual output | Severity |
|---|----------|-----------|---------------|----------|

<If image freshness issues:>

| # | Image file | Issue | Severity |
|---|-----------|-------|----------|

**Orphaned images:** <list any PNGs not referenced in index.md>

---

## 2. Front Matter and Links

| Check | Status | Notes |
|-------|--------|-------|
| Front matter complete | PASS/FAIL | |
| toc: true | PASS/FAIL | |
| Date set correctly | PASS/FAIL | |
| Summary single-line | PASS/FAIL | |
| featured.png exists | PASS/FAIL | |
| links: URLs valid | PASS/FAIL | |
| icon_pack values valid | PASS/FAIL | |
| No emojis | PASS/FAIL | |

---

## 3. Markdown Structure

| Check | Status | Notes |
|-------|--------|-------|
| Code fences paired | PASS/FAIL | |
| HTML tags closed | PASS/FAIL | |
| Heading hierarchy (no jumps) | PASS/FAIL | |
| Learning objectives section | PASS/FAIL | |
| Colab badge (if link exists) | PASS/FAIL | |
| Shortcodes paired | PASS/FAIL | |

---

## 4. Code Quality

**Strengths:**
- <what the code does well>

**Issues:**

| # | Location | Severity | Issue | Suggested fix |
|---|----------|----------|-------|---------------|

### Suggested rewrites (HIGH-severity only)

**Issue #N -- <brief description>**

Before:
```python
<current code>
```

After:
```python
<suggested replacement>
```

---

## 5. Sandwich Pattern

| Check | Status | Notes |
|-------|--------|-------|
| Pre-explanation for every code block | PASS/FAIL | <count missing> |
| Output blocks use `text` tag | PASS/FAIL | <count missing> |
| Post-interpretation for every output | PASS/FAIL | <count missing> |
| Figure placed after generating code | PASS/FAIL | |

**Missing sandwich layers:**
- <code blocks lacking pre-explanation, output, or interpretation>

---

## 6. Beginner Accessibility

**Unexplained jargon:**

| # | Term | First appears in | Suggested definition |
|---|------|------------------|---------------------|

**Assumed knowledge:**
- <steps that assume prior knowledge>

**Complexity jumps:**
- <locations where difficulty spikes>

---

## 7. Mathematical Equations

**Equation count:** N (minimum 2 for quantitative methods)

| Check | Status | Notes |
|-------|--------|-------|
| Goldmark escaping correct | PASS/FAIL | |
| Notation consistent | PASS/FAIL | |
| Plain-language explanations | PASS/FAIL | |
| Variable mapping (math -> code) | PASS/FAIL | |
| Currency signs use \\$ | PASS/FAIL | |

**Issues:**

| # | Location | Severity | Issue | Suggested fix |
|---|----------|----------|-------|---------------|

---

## 8. Interpretations

**Count:** N / 8 minimum

**Issues:**

| # | Location | Issue | Suggested improvement |
|---|----------|-------|----------------------|

**Missing interpretations:**
- <code blocks producing output but lacking interpretation>

### Suggested rewrites (HIGH-severity only)

---

## 9. Writing Clarity and Grammar

**Analogies:** N analogies for M complex concepts

**Missing analogies:**

| # | Concept | Section | Suggested analogy |
|---|---------|---------|-------------------|

**Clarity/grammar issues:**

| # | Location | Issue | Suggested fix |
|---|----------|-------|---------------|

---

## 10. Academic Rigor

**Methodology:** <appropriate / issues>
**Assumptions stated:** Yes/No
**Limitations discussed:** Yes/No

**References:**

| Check | Status | Notes |
|-------|--------|-------|
| Method paper cited | PASS/FAIL | |
| Dataset source cited | PASS/FAIL | |
| References numbered, ordered | PASS/FAIL | |

**Takeaways:**

| Check | Status | Notes |
|-------|--------|-------|
| Concrete with numbers | PASS/FAIL | |
| Covers method, data, limitation, next step | PASS/FAIL | |
| Not generic restatements | PASS/FAIL | |

**Causal inference (if applicable):**

| Check | Status | Notes |
|-------|--------|-------|
| Estimand stated per method | PASS/FAIL | |
| RCT/observational framing correct | PASS/FAIL | |

---

## 11. Narrative Flow

- **Transitions:** <smooth / issues>
- **Question-answer arc:** <Does Discussion answer Overview?>
- **Result ordering:** <most important first?>
- **"So what?" moment:** <present / missing>
- **Terminology consistency:** <consistent / flag drift>

---

## 12. Images, Mermaid, and Deliverables

**Images:**

| Check | Status | Notes |
|-------|--------|-------|
| All image refs valid | PASS/FAIL | |
| Alt text present | PASS/FAIL | |
| No orphaned PNGs | PASS/FAIL | |
| Captions present | PASS/FAIL | |

**Mermaid (if applicable):**

| Check | Status | Notes |
|-------|--------|-------|
| diagram: true in front matter | PASS/FAIL | |
| Valid syntax | PASS/FAIL | |
| Site palette colors | PASS/FAIL | |
| Pre/post paragraphs | PASS/FAIL | |

**Deliverable consistency (if script/notebook exist):**

| Check | Status | Notes |
|-------|--------|-------|
| Same imports/seed/data | PASS/FAIL | |
| Same output values | PASS/FAIL | |
| Notebook raw LaTeX | PASS/FAIL | |

**Site conventions:**

| Check | Status | Notes |
|-------|--------|-------|
| Em dashes (not --) | PASS/FAIL | |
| No emojis | PASS/FAIL | |
| Site color palette | PASS/FAIL | |

---

## Priority Action Items

1. **[HIGH]** <most critical issue -- location and fix>
2. **[HIGH]** <second most critical>
3. **[MED]** <important but not blocking>
4. **[LOW]** <nice to have>

---

## Positive Highlights

- <2-3 things the post does particularly well>
```
