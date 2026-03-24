---
name: proofread-post
description: Quick final QA before publishing a data science post. Checks front matter, markdown structure, math rendering, code/output pairing, images, Mermaid diagrams, references, site conventions, and grammar. Lighter and faster than referee-post. Use focus: to run only specific checks. Read-only.
argument-hint: "<post slug, e.g. python_partial_identification> [focus: frontmatter | markdown | math | code | images | mermaid | refs | style | grammar]"
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
/project:proofread-post python_dowhy focus: math
/project:proofread-post python_doubleml focus: code
/project:proofread-post python_partial_identification focus: grammar
/project:proofread-post python_dowhy focus: math and grammar
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

2. **Parse `focus:` argument (optional).** If `focus:` is present, extract the
   keyword and run only the matching step(s). If omitted, run all steps.

   | Focus keyword | Steps run |
   |---------------|-----------|
   | `frontmatter` | Step 1 |
   | `markdown` | Step 2 |
   | `math` | Step 3 |
   | `code` | Steps 4, 6 |
   | `images` | Step 5 |
   | `mermaid` | Step 7 |
   | `refs` | Step 8 |
   | `style` | Step 9 |
   | `grammar` | Step 10 |
   | (omitted) | All steps |

   Multiple keywords can be combined: `focus: math and code`.

3. **Verify the post exists.** Read `index.md` in the resolved directory. If it
   does not exist, report the error and stop.

4. **Inventory the page bundle.** List all files in the post directory (PNGs,
   script.py, notebook.ipynb, infographic_instructions.md, etc.).

5. **Read the full post** -- the entire `index.md`. If `script.py` exists, read
   it too (needed for consistency check in Step 6).

---

## Step 0.5 -- Announce scope

Before running checks, briefly announce what you will do. This is a fast QA
tool, so proceed immediately after displaying the message (do not wait for
confirmation -- the user invoked the skill, so intent is clear).

"Proofreading **[POST TITLE]** (`content/post/<slug>/index.md`).
Running: [all 10 checks / focused checks: LIST]."

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

### Links validation

If the front matter contains a `links:` section:

- [ ] Each relative `url:` (e.g. `script.py`, `analysis.R`, `notebook.ipynb`)
      corresponds to a file that exists in the page bundle directory
- [ ] Each external `url:` starts with `https://` (no bare `http://` or broken syntax)
- [ ] `icon_pack` values are valid: `fas` (Font Awesome solid), `fab` (brands),
      or `ai` (Academicons)

---

## Step 2 -- Markdown structure

Verify the markdown is well-formed:

- [ ] All code fences are properly paired (count opening and closing ```)
- [ ] No unclosed HTML tags (`<details>`, `<summary>`, `<em>`, `<br/>`, etc.)
- [ ] No broken markdown links `[text](url)` -- check for missing parentheses or brackets
- [ ] Heading hierarchy: `##` for sections, `###` for subsections -- no stray `#` or `####`
- [ ] No heading level jumps (e.g. `##` directly to `####` without an intervening `###`)
      -- jumps create confusing entries in the left-side TOC when `toc: true`
- [ ] No trailing whitespace issues that could cause display problems

### Shortcode and callout pairing

- [ ] `{{% callout note %}}` blocks have matching `{{% /callout %}}` closers
      (count openers vs. closers -- mismatch swallows the rest of the page)
- [ ] `{{< fullwidth-iframe >}}` shortcodes are properly formed (check `src=` and `height=`)
- [ ] Other Hugo shortcodes (if any) have matching open/close pairs

### Learning objectives (data science posts)

For posts with a `python_*` slug:

- [ ] A **Learning objectives** section exists after the Overview (either as a
      `###` heading or bold label `**Learning objectives:**`)
- [ ] Followed by a bulleted list with 3-6 items
- [ ] Items are action-oriented (start with verbs: "Understand", "Apply",
      "Evaluate", "Implement", "Compare", etc.)

This convention is styled by `custom.scss` (teal-accented background for
`h2 + p + ul` patterns). Missing or malformed lists lose this styling.

### Colab badge

If the front matter `links:` section contains a Google Colab URL:

- [ ] A Colab badge HTML block exists near the top of the post body
      (pattern: `<a href="..." target="_blank"><img src="...colab-badge.svg" ...></a>`)
- [ ] Badge `<img>` uses an `https://` URL
- [ ] Badge `<a>` includes `target="_blank"`

---

## Step 3 -- Math notation, correctness, and accessibility

### Rendering (LaTeX escaping for Goldmark)

- [ ] Subscripts use `\_` (Goldmark strips `\`, MathJax sees `_`)
- [ ] Multi-character subscripts use `\_{...}` (e.g. `\_{X=1}`)
- [ ] LaTeX punctuation commands use double backslash: `\\,` `\\;` `\\%` `\\!`
- [ ] LaTeX commands with backslash + letter need no escaping: `\theta`, `\hat`, `\text`, `\frac`
- [ ] Currency dollar signs use `\\$` (not bare `$` which triggers MathJax inline math)
- [ ] Display math `$$...$$` follows the same escaping rules
- [ ] No raw LaTeX visible as text (would indicate failed rendering)
- [ ] Multiple `_` in one paragraph are all escaped (unescaped pairs become `<em>`)

### Mathematical correctness

- [ ] Equations use correct operators, subscripts, and standard notation for the
      field (e.g. econometrics, statistics, machine learning). Flag obvious errors
      such as wrong signs, mismatched summation indices, or transposed terms.
- [ ] Notation is consistent throughout the post -- the same symbol means the
      same thing everywhere. Flag if $Y$ becomes $y$, or $D$ becomes $T$ for
      the treatment variable, without explicit explanation of the change.

### Accessible mathematical language

Every display equation (`$$...$$`) should be understandable to a student
encountering the method for the first time:

- [ ] **Plain-language companion:** Each display equation has at least one
      sentence explaining what it means in words (e.g. "In words, this equation
      says that the outcome equals the treatment effect times the treatment
      indicator, plus everything else that affects the outcome through the
      controls."). Inline math woven into explanatory prose does not need a
      separate companion sentence.
- [ ] **Variable mapping:** After key equations, math symbols are mapped to
      the corresponding code variables (e.g. "$Y$ corresponds to the `outcome`
      column, $D$ is the `treatment` indicator"). Without this mapping,
      beginners cannot connect the math to the code.

If the post contains no math, mark this step as N/A.

---

## Step 4 -- Code and output pairing

Verify every code block that produces output has a matching output block:

- [ ] Every code block containing `print()`, `.describe()`, `.head()`, `.info()`,
      `.value_counts()`, or similar output-producing calls has a corresponding
      output block immediately after it
- [ ] Output blocks use fenced code with the **`text` language tag** (not ````python` or bare ` ``` `)
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

### Image captions

- [ ] Figures have descriptive captions using italic text immediately after the
      image reference (pattern: `![alt](image.png)` followed by `*Caption text*`).
      The CSS (`custom.scss`) styles `img + em` as figure captions. Missing
      captions are LOW severity since alt text serves as a fallback.

---

## Step 6 -- Code consistency and supporting files

### index.md vs script.py

If `script.py` exists, spot-check that key parameters match between the two files:

- [ ] **Color palette constants** -- same hex values in both files
- [ ] **Legend positions** -- `loc=`, `bbox_to_anchor=` parameters match
- [ ] **Chart labels and titles** -- same text strings
- [ ] **Data-generating process constants** -- same numeric values (sample sizes, probabilities, seeds)
- [ ] **Save filenames** -- `plt.savefig()` filenames match image references in `index.md`
- [ ] **Random seed** -- same value in both files

Do NOT run the code -- just compare the source text.

### Supporting files

Verify that files referenced in code blocks or prose actually exist in the page bundle:

- [ ] CSV files referenced in `pd.read_csv()` or `read.csv()` calls exist in the
      page bundle directory
- [ ] R scripts (`.R`), Stata scripts (`.do`), or other analysis files referenced
      in the text, code comments, or front matter `links:` section exist
- [ ] Log files or supplementary outputs referenced in the post exist

---

## Step 7 -- Mermaid diagrams

If the post contains Mermaid code blocks:

- [ ] `diagram: true` is set in the front matter
- [ ] Mermaid syntax is valid (`graph LR`, `graph TD`, etc.)
- [ ] Style directives use site palette colors: `#6a9bcc` (steel blue),
      `#d97757` (warm orange), `#141413` (near black), `#00d4c8` (teal)
- [ ] Unobserved/latent variables use dashed borders (`stroke-dasharray: 5 5`)
      per the convention established in `python_partial_identification`
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

## Step 10 -- Grammar, spelling, and typos

Scan all **prose paragraphs** for language errors. Skip code blocks, output
blocks, YAML front matter, URLs, and technical package/function names.

- [ ] **Spelling:** No misspelled words in prose. Exclude technical terms
      (e.g. "heteroscedasticity", "econometrics"), package names (e.g. "DoubleML",
      "scikit-learn"), and variable names that appear in code blocks.
- [ ] **Grammar:** No subject-verb agreement errors, article misuse ("a" vs "an"),
      or tense inconsistency within a section. The post should use present tense
      for explanations ("this method estimates...") and past tense for results
      ("the model achieved...").
- [ ] **Doubled or missing words:** No repeated words ("the the", "is is") or
      dropped words that make a sentence ungrammatical ("we apply model" instead
      of "we apply the model").
- [ ] **Wrong word usage:** Flag commonly confused words -- "effect" vs "affect",
      "compliment" vs "complement", "principle" vs "principal", "then" vs "than",
      "its" vs "it's", "lead" vs "led".
- [ ] **Capitalization consistency:** Technical terms are capitalized the same way
      throughout the post (e.g. "Random Forest" vs "random forest" -- pick one
      and stick with it). Proper nouns and acronyms follow standard conventions.
- [ ] **Sentence completeness:** No sentence fragments or run-on sentences in
      prose paragraphs. Every sentence has a subject and a verb.

For each issue found, report the specific location (section heading and
approximate position) and suggest the correction.

---

## Step 11 -- Produce the report

Deliver the report **inline in the conversation** using this format.

If `focus:` was used, include only the rows for the steps that were run.
Mark skipped steps as "SKIP" in the checklist.

```
# Proofread Report: <Post Title>

**Post:** `content/post/<slug>/index.md`
**Date:** <current date>
**Status:** PASS / FAIL
**Focus:** <focus keyword, or "full" if all steps run>

---

## Checklist

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Front matter & links | PASS/FAIL/SKIP | <details if FAIL> |
| 2 | Markdown structure | PASS/FAIL/SKIP | <details if FAIL> |
| 3 | Math: rendering, correctness & accessibility | PASS/FAIL/N/A/SKIP | <details if FAIL> |
| 4 | Code/output pairing | PASS/FAIL/SKIP | <details if FAIL> |
| 5 | Images & captions | PASS/FAIL/SKIP | <details if FAIL> |
| 6 | Code consistency & files | PASS/FAIL/SKIP | <details if FAIL> |
| 7 | Mermaid diagrams | PASS/N/A/SKIP | <details if FAIL> |
| 8 | References & links | PASS/FAIL/SKIP | <details if FAIL> |
| 9 | Site conventions | PASS/FAIL/SKIP | <details if FAIL> |
| 10 | Grammar, spelling & typos | PASS/FAIL/SKIP | <details if FAIL> |

## Issues Found

<If any checks failed, list each issue:>

| # | Check | Severity | Location | Issue | Suggested fix |
|---|-------|----------|----------|-------|---------------|
| 1 | <check name> | HIGH/MED/LOW | <section/line> | <description> | <fix> |

## Summary

<1-2 sentences: Is the post ready to publish? Any blocking issues?>
```

### Status rules

- **PASS** -- All checks pass (run checks only), or only LOW-severity issues found. Ready to publish.
- **FAIL** -- Any HIGH or MEDIUM issue found. Fix before publishing.
- **SKIP** -- Step was not run because `focus:` excluded it.

---

## Severity definitions

| Level | Meaning |
| --- | --- |
| **HIGH** | Would cause display errors, broken rendering, broken links, or incorrect information. Must fix. |
| **MEDIUM** | Inconsistency, missing convention element, or quality issue. Should fix. |
| **LOW** | Minor style issue or observation. Optional to fix. |

---

## Quality checklist (internal, before delivering the report)

- [ ] Read the **entire** `index.md`, not just the first few sections
- [ ] Counted all code fence pairs (opening and closing)
- [ ] Checked every image reference against files in the directory
- [ ] Verified math escaping rules for Goldmark (not raw LaTeX rules)
- [ ] Checked equations for mathematical correctness and consistent notation
- [ ] Verified every display equation has a plain-language companion sentence
- [ ] Checked variable mapping from math symbols to code variables
- [ ] Compared key parameters between `index.md` and `script.py` (if exists)
- [ ] Checked front matter completeness including `links:` validation
- [ ] Verified all relative URLs in `links:` point to existing files
- [ ] Scanned for orphaned PNGs
- [ ] Checked for unclosed callout/shortcode pairs
- [ ] Verified learning objectives section exists (for `python_*` posts)
- [ ] Checked Colab badge exists if Colab link is in front matter
- [ ] Verified supporting files (CSVs, R/Stata scripts) exist if referenced
- [ ] Checked Mermaid style colors match site palette (if diagrams present)
- [ ] Verified site conventions (em dashes, no emojis, colors)
- [ ] Scanned all prose for spelling, grammar, and typo errors (skipping code/output blocks)
- [ ] If `focus:` was used, only ran the matching steps and marked others as SKIP
- [ ] Report uses the exact template format above
- [ ] All issues have specific locations and actionable suggestions

---

## Step 12 -- Follow-up

After delivering the report, offer the user next steps:

"Should I:
- Run a deeper check on any flagged area?
- Expand to the full 10-check pass (if focus was used)?
- Run `/project:referee-post` for a comprehensive expert review?
- Apply fixes for any HIGH-severity issues directly?"
