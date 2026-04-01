---
name: review-post
description: Comprehensive review of a data science blog post -- merges deep expert review with final proofreading into one thorough pass. Covers code execution, structure, equations, explanations, interpretations, writing, rigor, and deliverable consistency. Produces a scored report with priority action items. Read-only.
argument-hint: "<post slug, e.g. python_doubleml> [focus: code | structure | math | explanations | interpretations | writing | grammar | rigor | images]"
disable-model-invocation: true
user-invocable: true
---

# Review Post: Comprehensive Data Science Blog Post Review

Act as an **expert professor of data science and econometrics** reviewing a
tutorial blog post on this site. This skill merges the legacy `referee-post`
(11 deep review passes) and `proofread-post` (10 surface checks) into a single
comprehensive review with **12 non-overlapping dimensions**. Every check from
both legacy skills is covered exactly once -- nothing is duplicated, nothing is
dropped.

The review is **read-only** -- produce a scored report inline in the
conversation without modifying any files.

## Example invocations

```
/project:review-post python_doubleml
/project:review-post python_dowhy
/project:review-post content/post/python_ml_random_forest/
/project:review-post python_dowhy focus: code
/project:review-post python_doubleml focus: math and interpretations
```

---

## Focus keyword table

When `focus:` is provided, restrict the review to the matching dimensions only.
If omitted, run all 12 dimensions. Multiple keywords can be combined with
`and`: `focus: code and math`.

| Focus keyword | Dimensions run |
|---|---|
| `code` | 1 (Code execution), 4 (Code quality) |
| `structure` | 2 (Front matter and links), 3 (Markdown structure) |
| `math` | 7 (Mathematical equations) |
| `explanations` | 5 (Sandwich pattern), 6 (Beginner accessibility) |
| `interpretations` | 8 (Interpretations) |
| `writing` | 9 (Writing clarity and grammar) |
| `grammar` | 9 (grammar/spelling subset only) |
| `rigor` | 10 (Academic rigor), 11 (Narrative flow) |
| `images` | 12 (Images, Mermaid, and deliverables) |
| (omitted) | All 12 dimensions |

---

## Step 0 -- Pre-flight

1. **Parse arguments.** Extract the post slug or path from `$ARGUMENTS`.
   - If a full path is given (e.g. `content/post/python_dowhy/`), use it directly.
   - If a slug is given (e.g. `python_doubleml`), resolve to `content/post/<slug>/index.md`.
   - If `focus:` is present, extract the keywords and determine which dimensions to run.

2. **Verify the post exists.** Read `index.md` in the resolved directory. If it
   does not exist, report the error and stop.

3. **Inventory the page bundle.** List all files in the post directory (PNGs,
   script.py, notebook.ipynb, CSVs, etc.). Note which deliverables are present.

4. **Read calibration materials** (in parallel):
   - The write-post skill: `.claude/skills/write-post/SKILL.md`
     -- to understand all conventions the post should follow.
   - The reference post: `content/post/python_ml_random_forest/index.md`
     -- as a quality benchmark.
   - The scoring and criteria: `references/scoring-and-criteria.md`
     -- for severity levels, verdict criteria, and scoring guidelines.

5. **Read the full post under review** -- the entire `index.md`, plus
   `script.py` and `notebook.ipynb` if they exist.

---

## Step 0.5 -- Confirm review scope

Before starting the review, present the user with a brief confirmation:

1. **Post identified**: "I'll review **[POST TITLE]** at
   `content/post/<slug>/index.md`."

2. **Scope**: If `focus:` was provided: "Running focused review:
   [DIMENSION NAMES]."
   If no focus: "Running full review (all 12 dimensions including code
   execution). This is thorough and will take several minutes as I read
   the entire post, run the code, and check all dimensions."

3. **Deliverables found**: "Page bundle contains: [list of files].
   I'll cross-check script.py/notebook.ipynb if present."

**Handling responses:**
- "Proceed" / "yes" / brief acknowledgment: continue
- "Add focus on X": adjust scope and proceed
- "Skip code execution": note and proceed without Dimension 1

---

## Step 1 -- Review Dimensions

Read the post multiple times, each time through a different lens.
If `focus:` was provided, run only the relevant dimensions.

### Dimension 1: Code execution (highest priority)

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
6. **Check image freshness:** Compare numeric values shown in chart images
   (e.g., bar labels, axis values) against the output blocks in the post.
   If the chart shows different numbers than the output blocks, the images are
   stale and must be regenerated. This is a HIGH-severity issue.
7. **Check for orphaned images:** List all PNGs in the post directory and verify
   each is referenced in `index.md`. Flag any unreferenced PNGs for deletion
   (exception: `featured.png` which is auto-detected by Hugo).

If `script.py` exists, run it as-is. If not, assemble the script from code
blocks in `index.md`. If the code requires a dataset download, allow network
access.

---

### Dimension 2: Front matter and links

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
- [ ] `image.placement: 3` -- for full-width featured image above title
- [ ] `featured.png` or `featured.jpg` -- exists in the page bundle directory
- [ ] No emojis in front matter

### Links validation

If the front matter contains a `links:` section:

- [ ] Each relative `url:` (e.g. `script.py`, `analysis.R`, `notebook.ipynb`)
      corresponds to a file that exists in the page bundle directory
- [ ] Each external `url:` starts with `https://` (no bare `http://` or broken syntax)
- [ ] `icon_pack` values are valid: `fas` (Font Awesome solid), `fab` (brands),
      or `ai` (Academicons)

---

### Dimension 3: Markdown structure

Verify the markdown is well-formed:

- [ ] All code fences are properly paired (count opening and closing ```)
- [ ] No unclosed HTML tags (`<details>`, `<summary>`, `<em>`, `<br/>`, etc.)
- [ ] No broken markdown links `[text](url)` -- check for missing parentheses or brackets
- [ ] Heading hierarchy: `##` for sections, `###` for subsections -- no stray `#` or `####`
- [ ] No heading level jumps (e.g. `##` directly to `####` without an intervening `###`)
      -- jumps create confusing entries in the left-side TOC when `toc: true`

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

### Colab badge

If the front matter `links:` section contains a Google Colab URL:

- [ ] A Colab badge HTML block exists near the top of the post body
      (pattern: `<a href="..." target="_blank"><img src="...colab-badge.svg" ...></a>`)
- [ ] Badge `<img>` uses an `https://` URL
- [ ] Badge `<a>` includes `target="_blank"`

---

### Dimension 4: Code quality

Read every code block with the eyes of a **beginner student**:

- [ ] Each block performs a single logical step (flag blocks doing too many things)
- [ ] Variable names are descriptive and consistent throughout
- [ ] Comments explain "why", not just "what"
- [ ] Code uses the **simplest approach** -- flag unnecessary complexity, clever
      one-liners, or over-engineered abstractions
- [ ] `RANDOM_SEED = 42` (or similar) is set for reproducibility
- [ ] Imports are organized: stdlib, third-party, project
- [ ] Matplotlib plots use site colors: `#6a9bcc` (steel blue), `#d97757`
      (warm orange), `#141413` (near black), `#00d4c8` (teal)
- [ ] Figures saved with `dpi=300, bbox_inches="tight"`
- [ ] No deprecated APIs, bugs, or incorrect usage patterns
- [ ] No unused imports or dead code
- [ ] Could any block be simplified without losing clarity?

---

### Dimension 5: Sandwich pattern

For every code block that produces output, verify the four-layer sandwich:

1. **Pre-explanation paragraph** exists -- explains what the step does and why
   it matters. Accessible to a beginner. Connects to the case study question.
   Does not forward-reference results. Length: 2-4 sentences.
2. **Code block** is present and well-commented (`python` language tag).
3. **Output block** exists (fenced code with **`text` language tag**, not bare
   ` ``` ` or ` ```python `) for code that prints results via `print()`,
   `.describe()`, `.head()`, etc.
4. **Post-interpretation paragraph** exists with specific numbers from the output.

Flag any code blocks missing one or more layers. Count the number of complete
sandwiches. Figures should be placed immediately after the code block that
generates them.

---

### Dimension 6: Beginner accessibility

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

---

### Dimension 7: Mathematical equations

Every post that introduces a quantitative method should present its key
equations. Equations ground the intuition in formal notation and help the
reader connect the math to the code.

Read `references/latex-escaping.md` for full Goldmark/KaTeX escaping rules.

- [ ] **Equation coverage:** Every core method/model should have its key
      equation(s) presented. Flag sections that describe a method verbally but
      never show the math. **Minimum: 2 display-math equations** for any post
      that introduces a quantitative method.
- [ ] **Goldmark escaping correct:** Every `_` in math is escaped as `\_`.
      Every LaTeX punctuation command (`\,` `\;` `\%`) is double-escaped.
      Currency dollar signs use `\\$`.
- [ ] **Mathematical correctness:** Verify each equation is correct -- right
      subscripts, correct operators, standard notation for the field.
- [ ] **Notation consistency:** The same symbol must mean the same thing
      throughout the post. Flag if $Y$ becomes $y$, or $\beta$ becomes $b$.
- [ ] **Plain-language explanation:** Every display equation (`$$...$$`) must
      have at least one sentence explaining what it means in words. Inline math
      woven into explanatory prose does not need a separate companion sentence.
- [ ] **Variable mapping:** After key equations, the post should map math
      symbols to code variables (e.g. "$Y$ corresponds to the `outcome` column").
      Flag missing mappings.

If the post contains no math, mark this dimension as N/A.

---

### Dimension 8: Interpretations

Count all interpretation paragraphs (post-code). For each one check:

- [ ] Quotes specific numbers from the output (means, percentages, coefficients, CIs)
- [ ] Explains what those numbers mean in plain language
- [ ] Connects findings to the case study / real-world context
- [ ] Is a single continuous paragraph (no bullet points), 2-4 sentences
- [ ] Does not merely restate the output -- adds meaning
- [ ] Mentions limitations or caveats where appropriate

**Total count must be at least 8.** If fewer, identify where additional
interpretations are needed.

---

### Dimension 9: Writing clarity and grammar

#### Clarity and analogies

- [ ] **Analogy check:** For each complex concept introduced in the post,
      check if an analogy or concrete real-world example is provided. **Minimum:
      2 analogies** for posts introducing complex methods. If missing, suggest one.
- [ ] **Sentence length:** Flag any single sentence exceeding ~40 words.
      Flag paragraphs where the average sentence exceeds ~25 words.
- [ ] **Active voice:** Flag passive constructions that obscure who or what
      is doing the action. Suggest active rewrites.
- [ ] **Concrete before abstract:** Flag places where an abstract/formal
      definition is given before a concrete example.

#### Grammar, spelling, and typos

Scan all **prose paragraphs** for language errors. Skip code blocks, output
blocks, YAML front matter, URLs, and technical package/function names.

- [ ] **Spelling:** No misspelled words in prose. Exclude technical terms
      (e.g. "heteroscedasticity", "econometrics"), package names (e.g. "DoubleML",
      "scikit-learn"), and variable names that appear in code blocks.
- [ ] **Grammar:** No subject-verb agreement errors, article misuse ("a" vs "an"),
      or tense inconsistency within a section. Use present tense for explanations
      ("this method estimates...") and past tense for results ("the model achieved...").
- [ ] **Doubled or missing words:** No repeated words ("the the", "is is") or
      dropped words that make a sentence ungrammatical.
- [ ] **Wrong word usage:** Flag commonly confused words -- "effect" vs "affect",
      "compliment" vs "complement", "principle" vs "principal", "then" vs "than",
      "its" vs "it's", "lead" vs "led".
- [ ] **Capitalization consistency:** Technical terms are capitalized the same way
      throughout the post. Proper nouns and acronyms follow standard conventions.
- [ ] **Sentence completeness:** No sentence fragments or run-on sentences in
      prose paragraphs. Every sentence has a subject and a verb.

For each issue found, report the specific location (section heading and
approximate position) and suggest the correction.

---

### Dimension 10: Academic rigor

Higher-level review of the post as a whole:

- [ ] Case study question is clearly stated in the Overview
- [ ] The analysis actually answers the stated question
- [ ] Methods are appropriate for the data type and research question
- [ ] No statistical or methodological errors or misleading claims
- [ ] Assumptions of the methods are stated or acknowledged
- [ ] Limitations are honestly discussed (not buried or omitted)
- [ ] "Next steps" or extensions are reasonable and actionable

#### Causal inference-specific checks (apply when post uses causal methods)

- [ ] **Estimand precision:** Does the post clearly state which estimand
      (ATE, ATT, LATE, etc.) each method targets?
- [ ] **Estimand consistency:** If multiple methods are compared, flag any that
      target different estimands without explicit acknowledgment.
- [ ] **Randomized vs observational framing:** If the data is from a randomized
      experiment, flag language that implies covariate adjustment "removes
      confounding bias." In randomized settings, adjustment improves
      **precision**, not removes bias.
- [ ] **Confounding language:** Flag imprecise use of "confounder" in randomized
      settings. Pre-treatment covariates in RCTs are prognostic variables.

#### Takeaways quality

- [ ] Takeaways section exists and is **not** a restatement of section headings
- [ ] Each takeaway is a concrete, specific insight with numbers or actionable guidance
- [ ] At least 3-5 distinct takeaways covering: method insight, data insight,
      practical limitation, next step
- [ ] Takeaways connect back to the case study question and real-world implications

#### References quality

- [ ] Link to the **original method paper** (not just library docs)
- [ ] Dataset source properly cited (author, year, title)
- [ ] All `pip install` packages linked to their PyPI or documentation pages
- [ ] References numbered and in order of first mention
- [ ] Spot-check 2-3 URLs to verify they resolve

---

### Dimension 11: Narrative flow

Check the post as a *story*, not just a collection of sections:

- [ ] **Transitions:** Does each section flow logically to the next?
      Flag abrupt jumps where the reader would wonder "why are we doing this now?"
- [ ] **Question-answer arc:** Does the Discussion/Summary answer the question
      posed in the Overview?
- [ ] **Result ordering:** Are results presented in order of importance?
      The most impactful finding should come first.
- [ ] **"So what?" moment:** Is there a clear practical implication that a
      reader can take away?
- [ ] **Consistent terminology:** Are the same concepts referred to consistently
      throughout? Flag terminology drift (e.g. switching between "treatment effect"
      and "causal impact" without explanation).

---

### Dimension 12: Images, Mermaid, and deliverables

#### Images

- [ ] Every `![alt text](filename.png)` references a file that exists in the page bundle
- [ ] Every image has descriptive alt text (not empty `![]()`)
- [ ] `featured.png` (or `featured.jpg`) exists in the directory
- [ ] No orphaned PNGs -- every PNG in the directory is referenced in `index.md`
      (exception: `featured.png` which is auto-detected by Hugo)
- [ ] Images appear in logical positions (after the code that generates them)
- [ ] Figures have descriptive captions using italic text immediately after the
      image reference (pattern: `![alt](image.png)` followed by `*Caption text*`).
      The CSS (`custom.scss`) styles `img + em` as figure captions.

#### Mermaid diagrams (if present)

If the post contains Mermaid code blocks:

- [ ] `diagram: true` is set in the front matter
- [ ] Mermaid syntax is valid (`graph LR`, `graph TD`, etc.)
- [ ] Style directives use site palette colors: `#6a9bcc` (steel blue),
      `#d97757` (warm orange), `#141413` (near black), `#00d4c8` (teal)
- [ ] Unobserved/latent variables use dashed borders (`stroke-dasharray: 5 5`)
- [ ] Diagrams are properly closed (matching ``` fences)
- [ ] Every Mermaid diagram has an explanatory paragraph immediately before it
      (introducing what the diagram shows) AND immediately after it (interpreting
      the diagram). No "orphan" diagrams without surrounding prose.
- [ ] Overview/roadmap diagrams are placed at the END of the Overview section
      (after learning objectives), not in the middle

If no Mermaid blocks exist, mark Mermaid as N/A.

#### Deliverable consistency

If `script.py` or `notebook.ipynb` exist, verify consistency with `index.md`:

- [ ] Same imports and package versions
- [ ] Same `RANDOM_SEED` value
- [ ] Same data loading URL/path
- [ ] Same variable names and column selections
- [ ] Same output values (within rounding)
- [ ] `notebook.ipynb` uses raw LaTeX (no Goldmark escaping)
- [ ] `notebook.ipynb` is runnable end-to-end in Google Colab (if Colab link exists)
- [ ] Color palette constants -- same hex values in both files
- [ ] Chart labels and titles -- same text strings
- [ ] Save filenames -- `plt.savefig()` filenames match image references in `index.md`

If no companion files exist, mark deliverables as N/A.

#### Site conventions

- [ ] Em dashes (---) used in prose, not double hyphens (--)
- [ ] No emojis in front matter or body text
- [ ] Site color palette used in matplotlib code: `#6a9bcc`, `#d97757`, `#141413`, `#00d4c8`

---

## Step 2 -- Produce the Review Report

Read `references/report-template.md` for the full report template. Deliver
the report **inline in the conversation** using that template. Apply the
severity levels, verdict criteria, and scoring guidelines from
`references/scoring-and-criteria.md`.

Key report elements:

- **Overall Assessment** with 2-3 sentence summary
- **Verdict:** ACCEPT / MINOR REVISION / MAJOR REVISION
- **Scores:** Structure N/10 | Code N/10 | Equations N/10 | Explanations N/10 | Interpretations N/10 | Writing N/10 | Rigor N/10
- **One section per dimension** (if run), using the matching template section
- **Priority Action Items** ranked by impact (HIGH first, then MEDIUM, then LOW)
- **Full before/after rewrites** for every HIGH-severity issue
- **Positive Highlights** -- 2-3 things the post does particularly well

### Severity definitions

| Level | Meaning |
| --- | --- |
| **HIGH** | Errors that would mislead readers, incorrect results, code that doesn't run, missing required sections, methodological errors, broken rendering, or broken links. Must fix before publishing. |
| **MEDIUM** | Issues that reduce clarity or pedagogical value but do not produce wrong results. Unexplained jargon, missing sandwich layers, weak interpretations, inconsistencies, missing conventions. Should fix. |
| **LOW** | Style preferences, minor improvements, optional enhancements. Nice to fix. |

### Verdict criteria

| Verdict | Criteria |
| --- | --- |
| **ACCEPT** | No HIGH issues, at most 2 MEDIUM issues. Ready to publish. |
| **MINOR REVISION** | No HIGH issues but 3+ MEDIUM, or 1 HIGH that is easy to fix. Needs targeted improvements. |
| **MAJOR REVISION** | 2+ HIGH issues, or fundamental problems with methodology, narrative, or code correctness. Needs significant rework. |

### Scoring guidelines

Each dimension is scored 1-10:

| Score | Meaning |
| --- | --- |
| 9-10 | Excellent -- meets or exceeds the reference post standard |
| 7-8 | Good -- minor issues only |
| 5-6 | Adequate -- several issues that need attention |
| 3-4 | Weak -- significant problems |
| 1-2 | Needs complete rework |

---

## Quality checklist (internal, before delivering report)

- [ ] Read the **entire** `index.md`, not just the first few sections
- [ ] Ran the code and compared output (Dimension 1)
- [ ] Counted interpretation paragraphs (exact count vs. 8 minimum)
- [ ] Counted figures (exact count vs. 3 minimum)
- [ ] Counted display-math equations (exact count vs. 2 minimum)
- [ ] Checked every code block for sandwich pattern
- [ ] Scanned for unexplained jargon
- [ ] Verified front matter against all conventions
- [ ] Verified all relative URLs in `links:` point to existing files
- [ ] Checked heading hierarchy (no jumps)
- [ ] Verified learning objectives section exists (for `python_*` posts)
- [ ] Checked Colab badge exists if Colab link is in front matter
- [ ] Verified supporting files (CSVs, R/Stata scripts) exist if referenced
- [ ] Assessed whether post answers its case study question
- [ ] Checked narrative flow and transitions
- [ ] Cross-checked deliverables (script.py, notebook) if they exist
- [ ] Verified references include original papers
- [ ] Checked equation escaping, correctness, and plain-language companions
- [ ] Evaluated takeaways for concreteness and coverage
- [ ] Scanned all prose for grammar, spelling, typos (skipping code/output blocks)
- [ ] Checked for orphaned PNGs and image freshness
- [ ] Checked Mermaid style colors match site palette (if diagrams present)
- [ ] Verified site conventions (em dashes, no emojis, colors)
- [ ] All HIGH issues have full before/after rewrites
- [ ] All issues have specific locations and actionable suggestions
- [ ] Priority action items ranked by impact
- [ ] Scores assigned for all seven scoring dimensions
- [ ] If `focus:` was used, only ran the matching dimensions and marked others as SKIP

---

## Step 3 -- Follow-up

After delivering the report, offer the user next steps:

"Would you like me to:
- Elaborate on any specific finding or provide additional rewrites?
- Apply the HIGH-priority fixes directly to the post?
- Run a focused deep-dive on a specific dimension (e.g., `focus: math`)?
- Run `/project:write-infographic` to generate an infographic prompt for this post?"
