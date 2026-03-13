---
name: proofread-post
description: Final proofreading pass on a data science post -- checks correctness, display, and consistency before publication. Read-only -- produces a pass/fail checklist without modifying any files.
argument-hint: "<post slug, e.g. python_partial_identification>"
disable-model-invocation: true
user-invocable: true
---

# Proofread Post: Final QA Before Publication

Run a fast, surface-level quality check on a data science blog post. This is
**not** a deep review (use `referee-post` for that) -- it is a final proofreading
pass that verifies correctness, display, and consistency right before committing
or publishing. The check is **read-only** -- produce a pass/fail checklist inline
in the conversation without modifying any files.

## Example invocations

```
/project:proofread-post python_partial_identification
/project:proofread-post python_dowhy
/project:proofread-post content/post/python_ml_random_forest/
```

## When to use this vs. `referee-post`

| | proofread-post | referee-post |
| --- | --- | --- |
| Purpose | Final QA: correctness, display, consistency | Expert review: pedagogy, rigor, methodology |
| Output | Pass/fail checklist with issue list | Structured report with scores (1-10), verdict |
| Scope | Single fast pass, surface-level checks | 11 review passes, deep analysis |
| Speed | Fast (one read-through) | Thorough (multiple passes) |
| When | Before publication/commit | Before major revisions |

---

## Step 0 -- Pre-flight

1. **Parse arguments.** Extract the post slug or path from `$ARGUMENTS`.
   - If a full path is given (e.g. `content/post/python_dowhy/`), use it directly.
   - If a slug is given (e.g. `python_partial_identification`), resolve to
     `content/post/<slug>/index.md`.

2. **Verify the post exists.** Read `index.md` in the resolved directory. If it
   does not exist, report the error and stop.

3. **Inventory the page bundle.** List all files in the post directory (PNGs,
   script.py, notebook.ipynb, infographic_instructions.md, etc.).

4. **Read the full post** -- the entire `index.md`. If `script.py` exists, read
   it too (needed for consistency check in Step 6).

---

## Step 1 -- Front matter

Verify valid YAML front matter with all required fields:

- [ ] `title` -- present, not empty
- [ ] `authors` -- present, includes `admin` (Carlos Mendez)
- [ ] `date` -- valid date format
- [ ] `categories` -- present (typically `[Python, Tutorial]`)
- [ ] `tags` -- present, not empty
- [ ] `summary` -- present, single-line string (no line breaks)
- [ ] `toc: true` -- enables left-side table of contents
- [ ] `diagram: true` -- present if the post contains Mermaid diagrams
- [ ] `featured: true` or `false` -- present
- [ ] `draft: false` -- set to false for publication
- [ ] `featured.png` or `featured.jpg` -- exists in the page bundle directory

---

## Step 2 -- Markdown structure

Verify the markdown is well-formed:

- [ ] All code fences are properly paired (count opening and closing ```)
- [ ] No unclosed HTML tags (`<details>`, `<summary>`, `<em>`, `<br/>`, etc.)
- [ ] No broken markdown links `[text](url)` -- check for missing parentheses or brackets
- [ ] Heading hierarchy: `##` for sections, `###` for subsections -- no stray `#` or `####`
- [ ] No trailing whitespace issues that could cause display problems

---

## Step 3 -- Math notation

Verify LaTeX escaping for Goldmark markdown renderer:

- [ ] Subscripts use `\_` (Goldmark strips `\`, MathJax sees `_`)
- [ ] Multi-character subscripts use `\_{...}` (e.g. `\_{X=1}`)
- [ ] LaTeX punctuation commands use double backslash: `\\,` `\\;` `\\%` `\\!`
- [ ] LaTeX commands with backslash + letter need no escaping: `\theta`, `\hat`, `\text`, `\frac`
- [ ] Currency dollar signs use `\\$` (not bare `$` which triggers MathJax inline math)
- [ ] Display math `$$...$$` follows the same escaping rules
- [ ] No raw LaTeX visible as text (would indicate failed rendering)
- [ ] Multiple `_` in one paragraph are all escaped (unescaped pairs become `<em>`)

---

## Step 4 -- Code and output pairing

Verify every code block that produces output has a matching output block:

- [ ] Every code block containing `print()`, `.describe()`, `.head()`, `.info()`,
      `.value_counts()`, or similar output-producing calls has a corresponding
      output block immediately after it
- [ ] Output blocks use fenced code with **no language tag** (not ````python`)
- [ ] Output values in the blocks look reasonable (no placeholder text like "...")
- [ ] Code blocks use the `python` language tag

---

## Step 5 -- Images

Verify all image references and files:

- [ ] Every `![alt text](filename.png)` references a file that exists in the page bundle
- [ ] Every image has descriptive alt text (not empty `![]()`)
- [ ] `featured.png` (or `featured.jpg`) exists in the directory
- [ ] No orphaned PNGs -- every PNG in the directory is referenced in `index.md`
      (exception: `featured.png` which is auto-detected by Hugo)
- [ ] Images appear in logical positions (after the code that generates them)

---

## Step 6 -- Code consistency (index.md vs script.py)

If `script.py` exists, spot-check that key parameters match between the two files:

- [ ] **Color palette constants** -- same hex values in both files
- [ ] **Legend positions** -- `loc=`, `bbox_to_anchor=` parameters match
- [ ] **Chart labels and titles** -- same text strings
- [ ] **Data-generating process constants** -- same numeric values (sample sizes, probabilities, seeds)
- [ ] **Save filenames** -- `plt.savefig()` filenames match image references in `index.md`
- [ ] **Random seed** -- same value in both files

Do NOT run the code -- just compare the source text.

---

## Step 7 -- Mermaid diagrams

If the post contains Mermaid code blocks:

- [ ] `diagram: true` is set in the front matter
- [ ] Mermaid syntax is valid (`graph LR`, `graph TD`, etc.)
- [ ] Style directives use site colors where appropriate
- [ ] Diagrams are properly closed (matching ``` fences)

If no Mermaid blocks exist, mark this step as N/A.

---

## Step 8 -- References and links

- [ ] Internal links to other posts use correct paths (e.g. `/post/python_dowhy/`)
- [ ] External URLs are well-formed (no broken syntax, no missing `https://`)
- [ ] Reference list at the end is numbered
- [ ] PyPI/documentation links for key packages are present

Do NOT fetch URLs to verify they resolve -- just check syntax.

---

## Step 9 -- Site conventions

- [ ] Em dashes (---) used in prose, not double hyphens (--)
- [ ] No emojis in front matter or body text
- [ ] Summary/abstract is a single-line string in YAML
- [ ] Post slug follows naming convention (`python_<topic>` for Python tutorials)
- [ ] Site color palette used in matplotlib code: `#6a9bcc`, `#d97757`, `#141413`, `#00d4c8`
- [ ] Title color uses heading blue `#1a3a8a` in chart code

---

## Step 10 -- Produce the report

Deliver the report **inline in the conversation** using this format:

```
# Proofread Report: <Post Title>

**Post:** `content/post/<slug>/index.md`
**Date:** <current date>
**Status:** PASS / FAIL

---

## Checklist

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Front matter | PASS/FAIL | <details if FAIL> |
| 2 | Markdown structure | PASS/FAIL | <details if FAIL> |
| 3 | Math notation | PASS/FAIL | <details if FAIL> |
| 4 | Code/output pairing | PASS/FAIL | <details if FAIL> |
| 5 | Images | PASS/FAIL | <details if FAIL> |
| 6 | Code consistency | PASS/FAIL | <details if FAIL> |
| 7 | Mermaid diagrams | PASS/N/A | <details if FAIL> |
| 8 | References & links | PASS/FAIL | <details if FAIL> |
| 9 | Site conventions | PASS/FAIL | <details if FAIL> |

## Issues Found

<If any checks failed, list each issue:>

| # | Check | Severity | Location | Issue | Suggested fix |
|---|-------|----------|----------|-------|---------------|
| 1 | <check name> | HIGH/MED/LOW | <section/line> | <description> | <fix> |

## Summary

<1-2 sentences: Is the post ready to publish? Any blocking issues?>
```

### Status rules

- **PASS** -- All 9 checks pass, or only LOW-severity issues found. Ready to publish.
- **FAIL** -- Any HIGH or MEDIUM issue found. Fix before publishing.

---

## Severity definitions

| Level | Meaning |
| --- | --- |
| **HIGH** | Would cause display errors, broken rendering, or incorrect information. Must fix. |
| **MEDIUM** | Inconsistency or missing element that reduces quality. Should fix. |
| **LOW** | Minor style issue or observation. Optional to fix. |

---

## Quality checklist (internal, before delivering the report)

- [ ] Read the **entire** `index.md`, not just the first few sections
- [ ] Counted all code fence pairs (opening and closing)
- [ ] Checked every image reference against files in the directory
- [ ] Verified math escaping rules for Goldmark (not raw LaTeX rules)
- [ ] Compared key parameters between `index.md` and `script.py` (if exists)
- [ ] Checked front matter completeness
- [ ] Scanned for orphaned PNGs
- [ ] Verified site conventions (em dashes, no emojis, colors)
- [ ] Report uses the exact template format above
- [ ] All issues have specific locations and actionable suggestions
