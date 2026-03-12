---
name: referee-post
description: Review a data science blog post as an expert professor of data science and econometrics. Produces a structured referee report covering code correctness, pedagogical explanations, result interpretations, and references. Read-only — does not modify the post.
argument-hint: "<post slug, e.g. python_doubleml> [focus: code | explanations | equations | writing | interpretations | rigor]"
disable-model-invocation: true
user-invocable: true
---

# Referee Post: Expert Review of Data Science Blog Posts

Act as an **expert professor of data science and econometrics** reviewing a
tutorial blog post on this site. Evaluate the post across eight dimensions:
code quality, beginner accessibility, mathematical equations, pedagogical
explanations, result interpretations, writing clarity, narrative flow, and
academic rigor. The review is **read-only** — produce an actionable referee
report inline in the conversation without modifying any files.

## Example invocations

```
/project:referee-post python_doubleml
/project:referee-post python_dowhy
/project:referee-post content/post/python_ml_random_forest/
/project:referee-post python_dowhy focus: code
/project:referee-post python_dowhy focus: interpretations and rigor
```

### The `focus:` argument (optional)

When `focus:` is provided, restrict the review to the specified passes only:

| Focus keyword | Passes run |
| --- | --- |
| `code` | Pass 2 (Code quality) + Pass 1.5 (Run the code) |
| `explanations` | Pass 3 (Sandwich pattern) + Pass 2.5 (Beginner accessibility) |
| `equations` | Pass 3.5 (Mathematical equations) |
| `interpretations` | Pass 4 (Interpretations) |
| `writing` | Pass 4.5 (Writing clarity) + Pass 2.5 (Beginner accessibility) |
| `rigor` | Pass 5 (Academic rigor) + Pass 5.5 (Narrative flow) |
| `structure` | Pass 1 (Structural compliance) |
| (omitted) | Full review — all passes |

Multiple keywords can be combined: `focus: code and interpretations`.

---

## Step 0 — Pre-flight

1. **Parse arguments.** Extract the post slug or path from `$ARGUMENTS`.
   - If a full path is given (e.g. `content/post/python_dowhy/`), use it directly.
   - If a slug is given (e.g. `python_doubleml`), resolve to `content/post/<slug>/index.md`.
   - If `focus:` is present, extract the keywords and determine which passes to run.

2. **Verify the post exists.** Read `index.md` in the resolved directory. If it
   does not exist, report the error and stop.

3. **Inventory the page bundle.** List all files in the post directory (PNGs,
   script.py, notebook.ipynb, CSVs, etc.). Note which deliverables are present.

4. **Read calibration materials** (in parallel):
   - The data-science-post skill: `.claude/skills/data-science-post/SKILL.md`
     — to understand all conventions the post should follow.
   - The reference post: `content/post/python_ml_random_forest/index.md`
     — as a quality benchmark.

5. **Read the full post under review** — the entire `index.md`, plus
   `script.py` and `notebook.ipynb` if they exist.

---

## Step 1 — Review Passes

Read the post multiple times, each time through a different lens.
If `focus:` was provided, run only the relevant passes.

### Pass 1: Structural compliance

Mechanical check against the data-science-post skill's conventions:

- [ ] Front matter completeness: authors, categories, date, draft, featured,
      image, summary (single-line string), tags, title, `toc: true`
- [ ] Google Colab badge present (if a Colab link exists in front matter)
- [ ] Required sections present: Overview, Learning objectives, Setup/Imports,
      Data loading, Exploratory Data Analysis, Core method, Evaluation/Results,
      Discussion/Limitations, Summary, References
- [ ] Heading hierarchy: `##` for sections, `###` for subsections — no `#` or `####`
- [ ] At least 3 figures referenced in the body
- [ ] `featured.png` exists in the page bundle
- [ ] No emojis in content or front matter
- [ ] Summary field is a single-line string (no line breaks)

### Pass 1.5: Run the code

This is the single highest-impact check. A post with code that doesn't run
is worse than no post at all for a beginner following along.

1. **Extract all code blocks** from `index.md` in order. Concatenate them into
   a single script (or use `script.py` if it exists).
2. **Run the script** using the system Python:
   ```bash
   python3 script.py
   ```
   If dependencies are missing, install them first (`pip install ...`).
3. **Compare actual output** against the output blocks shown in the post.
   For each discrepancy, note:
   - Which code block / output block is affected
   - What the post says vs. what the code actually produces
   - Whether the discrepancy is cosmetic (rounding, formatting) or substantive
     (different numbers, errors, wrong variable names)
4. **Flag any errors:** syntax errors, runtime exceptions, deprecation warnings,
   or import failures. These are all HIGH-severity issues.
5. **Check figure generation:** do the saved PNGs match what the post references?
   Are any figure files missing?

If `script.py` exists, run it as-is. If not, assemble the script from code
blocks in `index.md`. If the code requires a dataset download, allow network
access.

### Pass 2: Code quality

Read every code block with the eyes of a **beginner student**:

- [ ] Each block performs a single logical step (flag blocks doing too many things)
- [ ] Variable names are descriptive and consistent throughout
- [ ] Comments explain "why", not just "what"
- [ ] Code uses the **simplest approach** — flag unnecessary complexity, clever
      one-liners, or over-engineered abstractions
- [ ] `RANDOM_SEED = 42` (or similar) is set for reproducibility
- [ ] Imports are organized: stdlib, third-party, project
- [ ] Matplotlib plots use site colors: `#6a9bcc` (steel blue), `#d97757`
      (warm orange), `#141413` (near black), `#00d4c8` (teal)
- [ ] Figures saved with `dpi=300, bbox_inches="tight"`
- [ ] No deprecated APIs, bugs, or incorrect usage patterns
- [ ] No unused imports or dead code
- [ ] Could any block be simplified without losing clarity?

### Pass 2.5: Beginner accessibility

Scan the entire post for places where a beginner would get lost:

- [ ] **Unexplained jargon:** Flag any technical term used without a plain-language
      definition on its first appearance (e.g., "heterogeneous treatment effects",
      "cross-fitting", "propensity score", "confounders"). For each flagged term,
      suggest a one-sentence definition to insert.
- [ ] **Assumed knowledge:** Flag steps that assume the reader already knows
      something that hasn't been explained in the post (e.g., "we use k-fold
      cross-validation" without explaining what it is or why).
- [ ] **Complexity jumps:** Flag places where the code or explanation suddenly
      becomes much more complex than the preceding material (e.g., simple
      pandas operations followed by a dense sklearn pipeline in one block).
- [ ] **Missing intuition:** Flag steps that explain *what* but not *why*.
      Every code block should have a sentence explaining why this step is needed,
      not just what it does mechanically.

### Pass 3: Sandwich pattern

For every code block that produces output, verify the four-layer sandwich:

1. **Pre-explanation paragraph** exists — explains what the step does and why
   it matters. Accessible to a beginner. Connects to the case study question.
   Does not forward-reference results. Length: 2-4 sentences.
2. **Code block** is present and well-commented (`python` language tag).
3. **Output block** exists (fenced code with **no language tag**) for code that
   prints results via `print()`, `.describe()`, `.head()`, etc.
4. **Post-interpretation paragraph** exists with specific numbers from the output.

Flag any code blocks missing one or more layers.

### Pass 3.5: Mathematical equations

Every post that introduces a quantitative method should present its key
equations. Equations ground the intuition in formal notation and help the
reader connect the math to the code.

- [ ] **Equation coverage:** Every core method/model should have its key
      equation(s) presented. Flag sections that describe a method verbally but
      never show the math (e.g., explaining OLS regression without showing
      $Y = X\beta + \epsilon$). **Minimum: 2 equations** for any post that
      introduces a quantitative method.
- [ ] **Mathematical correctness:** Verify each equation is correct — right
      subscripts, correct operators, standard notation for the field. Flag any
      errors (e.g., wrong sign, missing summation index, transposed matrices).
- [ ] **Notation consistency:** The same symbol must mean the same thing
      throughout the post. Flag if $Y$ becomes $y$, or $\beta$ becomes $b$,
      or $D$ becomes $T$ for the treatment variable without explanation.
- [ ] **Intuitive explanation:** Every equation must have a plain-language
      sentence explaining what it means conceptually — a "in words, this says..."
      sentence. Flag equations that are dropped in without interpretation.
      Good example: "In words, this equation says that the outcome $Y$ equals
      the treatment effect $\theta$ times the treatment $D$, plus everything
      else that affects $Y$ through the controls $X$."
- [ ] **Variable mapping:** After each equation, the post should map math
      symbols to code variables (e.g., "$Y$ corresponds to our `outcome` column,
      $D$ is the `treatment` indicator"). Flag missing mappings — without them,
      beginners cannot connect the math to the code.
- [ ] **Goldmark/LaTeX rendering:** Verify correct escaping — `\_` for
      subscripts, `\\,` `\\;` `\\%` for LaTeX punctuation commands. Check that
      equations render correctly (no raw LaTeX visible as text).

### Pass 4: Interpretations

Count all interpretation paragraphs (post-code). For each one check:

- [ ] Quotes specific numbers from the output (means, percentages, coefficients, CIs)
- [ ] Explains what those numbers mean in plain language
- [ ] Connects findings to the case study / real-world context
- [ ] Is a single continuous paragraph (no bullet points), 2-4 sentences
- [ ] Does not merely restate the output — adds meaning
- [ ] Mentions limitations or caveats where appropriate

**Total count must be at least 8.** If fewer, identify where additional
interpretations are needed.

### Pass 4.5: Writing clarity and analogies

Read every explanation and interpretation paragraph for clarity. The target
reader is a student — text should be clear, concrete, and intuitive.

- [ ] **Clarity scan:** Flag sentences that are dense, convoluted, or hard to
      parse on first reading. Suggest a clearer rewrite for each. Look for:
  - Long noun chains ("the double machine learning partially linear regression
    model nuisance parameter estimation step")
  - Nested clauses that force re-reading
  - Ambiguous pronouns ("it", "this", "they") where the referent is unclear
- [ ] **Analogy check:** For each complex concept introduced in the post
      (cross-reference with the jargon list from Pass 2.5), check if an analogy
      or concrete real-world example is provided. If missing, **suggest one**.
      Good analogies:
  - "Think of confounders like a hidden force that pushes both the treatment
    and the outcome — like temperature causing both ice cream sales and
    drowning rates to rise together."
  - "Cross-fitting is like grading exams: to avoid bias, we split the class
    into groups where each group grades a different group's work."
  - "A DAG is like a map of cause and effect — arrows show which variables
    influence which, so you can see where the causal paths flow."
- [ ] **Sentence length:** Flag any single sentence exceeding ~40 words.
      Flag paragraphs where the average sentence exceeds ~25 words. Suggest
      splitting long sentences into two shorter ones.
- [ ] **Concrete before abstract:** Flag places where an abstract/formal
      definition is given before a concrete example. The pedagogical pattern
      should be: concrete example or analogy first, then formal definition.
      Example — bad: "The propensity score is defined as $e(X) = P(D=1|X)$."
      Better: "Imagine you could predict how likely each person is to receive
      treatment based on their characteristics. That prediction is the
      propensity score: $e(X) = P(D=1|X)$."
- [ ] **Active voice:** Flag passive constructions that obscure who or what
      is doing the action. Suggest active rewrites:
  - Passive: "The model is estimated using cross-fitting."
  - Active: "We estimate the model using cross-fitting."

### Pass 5: Academic rigor and content

Higher-level review of the post as a whole:

- [ ] Case study question is clearly stated in the Overview
- [ ] The analysis actually answers the stated question
- [ ] Methods are appropriate for the data type and research question
- [ ] No statistical or methodological errors or misleading claims
- [ ] Assumptions of the methods are stated or acknowledged
- [ ] Limitations are honestly discussed (not buried or omitted)
- [ ] "Next steps" or extensions are reasonable and actionable
- [ ] Exercises (if present) are pedagogically valuable
- [ ] LaTeX math (if present) is correctly escaped for Goldmark:
  - `\_` for subscripts, `\\,` `\\;` `\\%` for LaTeX punctuation commands
  - `\theta`, `\hat`, `\text` need no escaping (backslash + letter)

#### Takeaways quality

The Summary/Takeaways section is what readers remember. It should distill the
post's most important lessons — not just summarize what was done.

- [ ] Takeaways section exists and is **not** a restatement of section headings
      or a generic summary ("we applied method X to dataset Y")
- [ ] Takeaways capture the **most important lessons** — what a reader should
      remember a week later
- [ ] Each takeaway is a concrete, specific insight with numbers or actionable
      guidance (not vague like "we learned about causal inference")
- [ ] Takeaways connect back to the case study question and real-world
      implications (why does this matter beyond the tutorial?)
- [ ] At least 3-5 distinct takeaways covering different dimensions:
  - A **method insight** (when to use this method, what it does better than alternatives)
  - A **data insight** (what the data revealed about the case study)
  - A **practical limitation** (when this approach breaks down or should not be used)
  - A **next step** (what the reader should try next to deepen understanding)

#### References quality

- [ ] Link to the **original method paper** (not just library docs) — e.g., for
      DoubleML, cite Chernozhukov et al. (2018), not just the Python package
- [ ] Dataset source properly cited (author, year, title — not just a raw URL)
- [ ] All `pip install` packages linked to their PyPI or documentation pages
- [ ] References numbered and in order of first mention in the post
- [ ] Spot-check 2-3 URLs to verify they resolve (flag any broken links)

### Pass 5.5: Flow and narrative

Check the post as a *story*, not just a collection of sections:

- [ ] **Transitions:** Does each section flow logically to the next? Flag any
      abrupt jumps where the reader would wonder "why are we doing this now?"
- [ ] **Question-answer arc:** Does the Discussion/Summary section directly
      answer the question posed in the Overview? If not, flag the disconnect.
- [ ] **Result ordering:** Are results presented in order of importance (most
      important finding first)? Or is the key result buried after less
      important preliminary checks?
- [ ] **"So what?" moment:** Is there a clear moment where the reader sees
      why this analysis matters — a practical implication, policy insight, or
      actionable takeaway? If missing, suggest where to add one.
- [ ] **Consistent terminology:** Are the same concepts referred to with the
      same terms throughout? (Flag if "treatment variable" becomes "intervention"
      becomes "policy" without explanation.)

### Pass 6: Cross-check deliverables

If `script.py` or `notebook.ipynb` exist, verify consistency with `index.md`:

- [ ] Same imports and package versions
- [ ] Same `RANDOM_SEED` value
- [ ] Same data loading URL/path
- [ ] Same variable names and column selections
- [ ] Same output values (within rounding)
- [ ] `notebook.ipynb` uses raw LaTeX (no Goldmark escaping) while `index.md`
      uses Goldmark-escaped LaTeX (`\_`, `\\,`, etc.)
- [ ] `notebook.ipynb` is runnable end-to-end in Google Colab (if Colab link exists)

---

## Step 2 — Produce the Referee Report

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

**Issue #N — <brief description>**

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
| Variable mapping (math symbols → code) | PASS/FAIL | <which lack mapping> |
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

**Issue #N — <brief description>**

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

**Issue #N — <brief description>**

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

**Limitations discussed:** Yes/No — <assessment of completeness>

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

- **Transitions:** <smooth / issues found — list any abrupt jumps>
- **Question-answer arc:** <Does Discussion answer the Overview question?>
- **Result ordering:** <most important first? or key result buried?>
- **"So what?" moment:** <present / missing — where to add if missing>
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

1. **[HIGH]** <most critical issue — location and fix>
2. **[HIGH]** <second most critical>
3. **[MED]** <important but not blocking>
4. **[LOW]** <nice to have>

---

## 10. Positive Highlights

- <2-3 things the post does particularly well>
```

---

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
| 9-10 | Excellent — meets or exceeds the reference post standard |
| 7-8 | Good — minor issues only |
| 5-6 | Adequate — several issues that need attention |
| 3-4 | Weak — significant problems |
| 1-2 | Needs complete rework |

---

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
