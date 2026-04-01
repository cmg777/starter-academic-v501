---
name: referee-post
description: Expert review of a data science blog post -- use before publishing to catch code errors, pedagogical gaps, weak interpretations, and methodological issues. Runs up to 11 review passes covering code execution, sandwich pattern, equations, writing clarity, and academic rigor. Produces a scored report with severity-ranked action items. Read-only.
argument-hint: "<post slug, e.g. python_doubleml> [focus: code | explanations | equations | writing | interpretations | rigor]"
disable-model-invocation: true
user-invocable: true
---

# Referee Post: Expert Review of Data Science Blog Posts

Act as an **expert professor of data science and econometrics** reviewing a
tutorial blog post on this site. Evaluate the post across eight dimensions:
code quality, beginner accessibility, mathematical equations, pedagogical
explanations, result interpretations, writing clarity, narrative flow, and
academic rigor. The review is **read-only** -- produce an actionable referee
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
| (omitted) | Full review -- all passes |

Multiple keywords can be combined: `focus: code and interpretations`.

---

## Step 0 -- Pre-flight

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
   [PASS NAMES]."
   If no focus: "Running full review (all 11 passes including code
   execution). This is thorough and will take several minutes as I read
   the entire post, run the code, and check all dimensions."

3. **Deliverables found**: "Page bundle contains: [list of files].
   I'll cross-check script.py/notebook.ipynb if present."

**Handling responses:**
- "Proceed" / "yes" / brief acknowledgment: continue
- "Add focus on X": adjust scope and proceed
- "Skip code execution": note and proceed without Pass 1.5

---

## Step 1 -- Review Passes

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
- [ ] Heading hierarchy: `##` for sections, `###` for subsections -- no `#` or `####`
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
6. **Check image freshness:** Compare numeric values shown in chart images
   (e.g., bar labels, axis values) against the output blocks in the post.
   If the chart shows different numbers than the output blocks, the images are
   stale and must be regenerated. This is a HIGH-severity issue.
7. **Check for orphaned images:** List all PNGs in the post directory and verify
   each is referenced in `index.md`. Flag any unreferenced PNGs for deletion.

If `script.py` exists, run it as-is. If not, assemble the script from code
blocks in `index.md`. If the code requires a dataset download, allow network
access.

### Pass 2: Code quality

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

1. **Pre-explanation paragraph** exists -- explains what the step does and why
   it matters. Accessible to a beginner. Connects to the case study question.
   Does not forward-reference results. Length: 2-4 sentences.
2. **Code block** is present and well-commented (`python` language tag).
3. **Output block** exists (fenced code with **`text` language tag**) for code that
   prints results via `print()`, `.describe()`, `.head()`, etc.
4. **Post-interpretation paragraph** exists with specific numbers from the output.

Flag any code blocks missing one or more layers.

### Pass 3.5: Mathematical equations

Every post that introduces a quantitative method should present its key
equations. Equations ground the intuition in formal notation and help the
reader connect the math to the code.

- [ ] **Equation coverage:** Every core method/model should have its key
      equation(s) presented. Flag sections that describe a method verbally but
      never show the math. **Minimum: 2 equations** for any post that
      introduces a quantitative method.
- [ ] **Mathematical correctness:** Verify each equation is correct -- right
      subscripts, correct operators, standard notation for the field.
- [ ] **Notation consistency:** The same symbol must mean the same thing
      throughout the post. Flag if $Y$ becomes $y$, or $\beta$ becomes $b$.
- [ ] **Intuitive explanation:** Every equation must have a plain-language
      sentence explaining what it means conceptually.
- [ ] **Variable mapping:** After each equation, the post should map math
      symbols to code variables. Flag missing mappings.
- [ ] **Goldmark/LaTeX rendering:** Verify correct escaping -- `\_` for
      subscripts, `\\,` `\\;` `\\%` for LaTeX punctuation commands.

### Pass 4: Interpretations

Count all interpretation paragraphs (post-code). For each one check:

- [ ] Quotes specific numbers from the output (means, percentages, coefficients, CIs)
- [ ] Explains what those numbers mean in plain language
- [ ] Connects findings to the case study / real-world context
- [ ] Is a single continuous paragraph (no bullet points), 2-4 sentences
- [ ] Does not merely restate the output -- adds meaning
- [ ] Mentions limitations or caveats where appropriate

**Total count must be at least 8.** If fewer, identify where additional
interpretations are needed.

### Pass 4.5: Writing clarity and analogies

Read every explanation and interpretation paragraph for clarity. The target
reader is a student -- text should be clear, concrete, and intuitive.

- [ ] **Clarity scan:** Flag sentences that are dense, convoluted, or hard to
      parse on first reading. Suggest a clearer rewrite for each.
- [ ] **Analogy check:** For each complex concept introduced in the post,
      check if an analogy or concrete real-world example is provided. If
      missing, **suggest one**.
- [ ] **Sentence length:** Flag any single sentence exceeding ~40 words.
      Flag paragraphs where the average sentence exceeds ~25 words.
- [ ] **Concrete before abstract:** Flag places where an abstract/formal
      definition is given before a concrete example.
- [ ] **Active voice:** Flag passive constructions that obscure who or what
      is doing the action. Suggest active rewrites.

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
- [ ] LaTeX math (if present) is correctly escaped for Goldmark
- [ ] Currency dollar signs use `\\$` in `index.md`

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
- [ ] Takeaways capture the **most important lessons**
- [ ] Each takeaway is a concrete, specific insight with numbers or actionable guidance
- [ ] Takeaways connect back to the case study question and real-world implications
- [ ] At least 3-5 distinct takeaways covering: method insight, data insight,
      practical limitation, next step

#### References quality

- [ ] Link to the **original method paper** (not just library docs)
- [ ] Dataset source properly cited (author, year, title)
- [ ] All `pip install` packages linked to their PyPI or documentation pages
- [ ] References numbered and in order of first mention
- [ ] Spot-check 2-3 URLs to verify they resolve

### Pass 5.5: Flow and narrative

Check the post as a *story*, not just a collection of sections:

- [ ] **Transitions:** Does each section flow logically to the next?
- [ ] **Question-answer arc:** Does the Discussion answer the Overview question?
- [ ] **Result ordering:** Are results presented in order of importance?
- [ ] **"So what?" moment:** Is there a clear practical implication?
- [ ] **Consistent terminology:** Are the same concepts referred to consistently?

### Pass 6: Cross-check deliverables

If `script.py` or `notebook.ipynb` exist, verify consistency with `index.md`:

- [ ] Same imports and package versions
- [ ] Same `RANDOM_SEED` value
- [ ] Same data loading URL/path
- [ ] Same variable names and column selections
- [ ] Same output values (within rounding)
- [ ] `notebook.ipynb` uses raw LaTeX (no Goldmark escaping)
- [ ] `notebook.ipynb` is runnable end-to-end in Google Colab (if Colab link exists)

---

## Step 2 -- Produce the Referee Report

Read `references/report-template.md` for the full report template. Deliver
the report **inline in the conversation** using that template. Do NOT save
it to a file. Apply the severity levels, verdict criteria, and scoring
guidelines from `references/scoring-and-criteria.md`.

---

## Step 3 -- Follow-up

After delivering the report, offer the user next steps:

"Would you like me to:
- Elaborate on any specific finding or provide additional rewrites?
- Run a focused deep-dive on a specific area (e.g., `focus: equations`)?
- Apply the HIGH-priority fixes directly to the post?"
