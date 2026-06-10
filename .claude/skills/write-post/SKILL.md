---
name: write-post
description: Write a notebook-style data science blog post for carlos-mendez.org. Produces index.md with case-study framing, sandwich-pattern code blocks, figures, and interpretation paragraphs. Can consume an existing script and results report, or work standalone. Confirms scope before writing.
argument-hint: "<topic> dataset: <dataset> [references: <URLs>] OR <post slug>"
disable-model-invocation: true
user-invocable: true
---

# Write Post: Notebook-Style Data Science Blog Post

Write a self-contained, pedagogical data science blog post framed as a
**case study** with a clear motivating problem. The post inherits notebook-style
CSS styling (teal-accented code blocks, blue headings, styled tables, left-side
TOC) from `assets/scss/custom.scss`.

**Supported languages:** Python (default), Stata, R.

## Two modes of operation

| Mode | Trigger | Input | Output |
|------|---------|-------|--------|
| **A -- With materials** | User provides a post slug where `script.py` and `results_report.md` already exist | Reads existing script, results report, and generated PNGs | `index.md` using real numbers and existing figures |
| **B -- Standalone** | User provides topic + dataset (no prior script) | Fetches references and dataset info | `index.md` with inline code blocks; output values marked `[VERIFY]` |

## What this skill does NOT do

- **Does not write scripts.** Use `/project:write-script` to create `script.py`.
- **Does not execute code.** Use `/project:review-script` to run and verify scripts.
- **Does not generate figures.** Figures come from an existing script (Mode A) or
  are marked for future generation (Mode B).
- **Does not create `featured.png`.** The user adds this manually.

---

## Example invocations

```
# Mode A -- post slug with existing materials
/project:write-post python_doubleml
/project:write-post python_esda2

# Mode B -- standalone with topic and dataset
/project:write-post double machine learning dataset: DS4Bolivia references: https://docs.doubleml.org/stable/intro/intro.html
/project:write-post k-means clustering dataset: https://archive.ics.uci.edu/ml/datasets/Iris
/project:write-post spatial regression in Stata dataset: dataSIM4spatial.dta references: https://pysal.org/spreg/
```

---

## Site color palette

These colors must be referenced when describing figures and used consistently
in any inline matplotlib/seaborn code blocks.

| Name | Hex | Use in plots |
|------|-----|-------------|
| Steel blue | `#6a9bcc` | Primary data (bars, scatter, histograms) |
| Warm orange | `#d97757` | Reference lines, secondary series |
| Near black | `#141413` | Tertiary elements, text annotations |
| Teal | `#00d4c8` | Highlights (use sparingly) |
| Heading blue | `#1a3a8a` | CSS only -- headings, titles |

### Dark theme palette

For posts with dark-background figures (set during scope confirmation):

| Name | Hex | Use in plots |
|------|-----|-------------|
| Dark navy | `#0f1729` | Figure + axes background (`facecolor`) |
| Grid line | `#1f2b5e` | Grid lines (subtle contrast on dark bg) |
| Light text | `#c8d0e0` | Axis labels, tick labels, legend text |
| White text | `#e8ecf2` | Titles, bold annotations |

---

## Deliverables

| Output | Path | Notes |
|--------|------|-------|
| Blog post | `content/post/<lang>_<slug>/index.md` | Always produced |
| Jupyter notebook | `content/post/<lang>_<slug>/notebook.ipynb` | Optional, if confirmed in scope |

The folder prefix matches the language: `python_`, `stata_`, or `r_`.

---

## Phase 1: Pre-flight

### 1.1 Parse arguments

Examine `$ARGUMENTS` to determine the mode:

- **If the argument is a post slug** (e.g., `python_doubleml` or
  `content/post/python_doubleml/`): this is **Mode A**. The post directory
  must already contain `script.py` (or `analysis.do` / `analysis.R`) and
  `results_report.md`.
- **If the argument contains `dataset:`**: this is **Mode B** (standalone).
  Parse topic, dataset, and optional references.

For Mode B, also extract:
- **Topic** -- everything before `dataset:`
- **Dataset** -- everything between `dataset:` and `references:` (or end)
- **References** -- everything after `references:` (optional)
- **Topic slug** -- lowercase, underscores (e.g., "double machine learning" -> `doubleml`)
- **Language** -- infer from topic, dataset extension, or explicit mention

### 1.2 Mode A: Read existing materials

1. Verify that `script.py` (or `analysis.do` / `analysis.R`) exists in the
   post directory. If missing, abort and suggest `/project:write-script`.
2. Verify that `results_report.md` exists. If missing, abort and suggest
   `/project:write-results-report`.
3. Read `script.py` to understand the analysis pipeline, variable names,
   and figure filenames.
4. Read `results_report.md` to extract all numeric results, table data,
   and interpretation notes.
5. List all PNG files in the directory. These are the figures to reference
   in the post.

### 1.3 Mode B: Fetch external materials

1. **Fetch reference URLs** -- use WebFetch to read each URL and understand
   the library's API, key classes/functions, and recommended usage patterns.
2. **Fetch dataset information** -- if the dataset is a URL, use WebFetch to
   understand its structure. If it is a named dataset, look up the standard
   loading pattern.
3. **Check for pre-existing materials** -- if the post folder already exists,
   check for reference materials (markdown notes, PDFs, datasets, code files).

### 1.4 Read reference files

Load the following reference files from `references/`:

- **Always:** `latex-escaping.md`, `figure-conventions.md`, `front-matter-templates.md`
- **If tutorial-style** (Learning objectives present, introduces new vocabulary): `key-concepts-template.md`
- **If causal inference topic:** `causal-inference.md`
- **Always:** `quality-checklist.md` (needed for verification step)

### 1.5 Read a reference post

Read one existing post for current conventions:

- Python: `content/post/python_ml_random_forest/index.md`
- Stata: `content/post/stata_rct/index.md`

### 1.6 PDF handling

PDFs (academic papers, software manuals) can be very large. **Never read an
entire PDF into the main conversation.** Delegate PDF reading to an Explore
agent with a specific extraction task (e.g., "Read pages 12--25 of paper.pdf
and extract the formal equations for the ATE estimator"). The agent processes
the PDF in its own context and returns only the distilled findings.

---

## Phase 2a: Confirm scope

Before creating any files, present the user with a confirmation summary and
**wait for their response**. Display all items in a single formatted block:

1. **Topic understanding**: "I'll write a tutorial about [TOPIC] using the
   [DATASET]. The case study question will be: '[QUESTION]'. Does this
   capture your intent?"

2. **Mode detected**: "Mode A -- I found script.py and results_report.md in
   the post directory, so I'll use real numbers and existing figures." OR
   "Mode B -- standalone. Code blocks will be written inline and output
   values will be marked [VERIFY] until a script is executed."

3. **Post type**: "[Causal inference / ML prediction / Exploratory analysis /
   Statistical method tutorial] -- based on [brief reasoning]. Change?"

4. **Figure theme**: "Light background (default) or dark navy background?
   Dark theme matches the site's navbar/footer aesthetic and works well for
   scatter plots and line charts."

5. **Language**: "[Python / Stata / R] based on [reasoning]. Change?"

6. **Companion deliverables**: "index.md (always). Create notebook.ipynb?
   [Yes/No]" (Mode A may already have a notebook from write-script.)

7. **Ambiguity resolution** (conditional): If the topic could be framed
   as either causal or predictive, ask: "This topic could be framed as
   [causal estimation of X] or [prediction of Y]. Which framing do you
   prefer?"

**Handling responses:**
- "Looks good" / "proceed" / no changes: continue with stated defaults
- Specific adjustments: incorporate them and proceed
- Major reframing requested: revise the scope and re-present the summary

---

## Phase 2b: Core workflow

### Step 1: Create index.md with YAML front matter

Use the template from `references/front-matter-templates.md` for the
detected language (Python / Stata / R).

**Front matter rules:**

- **date:** Set to **yesterday's date** (e.g., if today is 2026-04-01, use
  `2026-03-31T00:00:00Z`). Netlify production builds exclude future-dated
  posts.
- **image.placement: 3** -- full-width featured image above the title.
- **toc: true** -- activates the left-side sticky table of contents.
- **diagram: true** -- enables Mermaid diagram rendering.
- **summary:** Single-line string, no line breaks.
- **links:** Only include links to files that **actually exist** in the page
  bundle. In Mode A, check which companion files are present. In Mode B,
  include only `script.py` if it exists; omit notebook/Colab links unless
  confirmed.
- **No emojis** in any front matter field.

### Step 2: Write the post body

The post is a **case-study tutorial** that tells a coherent story: a
real-world question motivates the analysis, the method addresses that
question, and the results answer it.

#### 2.1 Post structure

| Section | Content | Required |
|---------|---------|----------|
| **Abstract** | One dense paragraph (~150-250 words), no headings/bullets/bold labels, flowing through six beats: motivation -> research objective -> data -> methods -> main results (with real numbers) -> main implication. Always the **first** section, immediately before Overview. See § 2.1a | Yes |
| **Overview** | 1-2 paragraphs: What question are we answering? Why does this method matter? Frame as "We want to know X. Method Y can help because Z." | Yes |
| **Learning objectives** | 3-5 bullets with strong action verbs (Understand, Implement, Estimate, Assess, Compare). Avoid vague verbs like "explore" or "see" | Yes |
| **Key concepts** | 5-8 vocabulary terms in toggle-card format: bold term + always-visible **Definition** paragraph (short sentences) + 2-column row with collapsible **Example** card (grounded in this post's data) and **Analogy** card (familiar-domain comparison). See `references/key-concepts-template.md` for the full HTML pattern, SCSS dependency, and copy-paste block | Encouraged for tutorials introducing new vocabulary |
| **Setup and imports** | Imports, config variables, seed, data URLs | Yes |
| **Data loading** | Load dataset, explain structure, print shape/stats | Yes |
| **EDA** | At least 1 figure, connected to case study question | Yes |
| **Data preparation** | Scaling, encoding, train/test split as needed | If needed |
| **Baseline** | Simple approach first (naive OLS, difference in means, basic model) to establish benchmark | Encouraged |
| **Core method** (1-3 sections) | Main technique with conceptual explanations. Each major step gets its own `##`. At least 1 figure | Yes |
| **Evaluation and results** | Metrics, comparison tables, at least 1 figure | Yes |
| **Validation and robustness** | At least one robustness check: learner comparison, refutation test, residual analysis, sensitivity analysis | Encouraged |
| **Discussion** | What findings mean for the case study question. Connect to real-world context | Yes |
| **Summary and next steps** | Takeaways (concrete with numbers) + limitations + next steps | Yes |
| **Exercises** | 2-3 self-study challenges for the reader | Encouraged |
| **References** | Numbered list of clickable links to all sources | Yes |

**Narrative arc:**

1. **Question** (Overview) -- pose the case study question
2. **Intuition** (EDA) -- show the data, build understanding
3. **Simple baseline** -- establish a benchmark with the simplest approach
4. **Full method** -- introduce and apply the main technique
5. **Validation** -- test whether results hold (robustness checks)
6. **Takeaways** -- answer the original question with specific findings

**Narrative flow rules:**

- **Transitions.** End each section with a sentence that previews the next
  step or links back to the case study question. The reader should never
  wonder "why are we doing this now?"
- **Question-answer arc.** The Overview poses a question. The Discussion must
  explicitly answer it with specific findings. Check that these two sections
  mirror each other.
- **Result ordering.** Present the most important finding first in the
  Evaluation and Results section.
- **"So what?" moment.** At least one paragraph (typically in Discussion)
  must state a clear practical implication -- what a policymaker, analyst,
  or practitioner would do with this finding.

**Takeaways requirements:**

- Takeaways must be concrete insights with numbers, not generic summaries.
  Bad: "We learned about Random Forest." Good: "Satellite embeddings explain
  23% of development variation (R^2 = 0.23), with embedding A05 contributing
  3x more than the median feature."
- Cover at least 4 dimensions: (1) a method insight, (2) a data insight,
  (3) a practical limitation, (4) a next step.
- Each takeaway should stand alone as something the reader remembers a week
  later.

#### 2.1a Abstract (the six-beat opener)

Every post opens with a `## Abstract` section: a single journal-style
paragraph that gives the reader the whole arc before they dive in. It is the
**first** section of the body — immediately after the YAML front matter and
**before** `## Overview`. Do **not** renumber existing sections (Overview stays
`## Overview` or `## 1. Overview`).

**Six beats, in this order, as one connected paragraph:**

1. **Motivation** -- why this question matters in the real world.
2. **Research objective** -- the specific question this post answers.
3. **Data** -- dataset name, units, sample size, time span, source.
4. **Methods** -- the technique(s) / package(s) used.
5. **Main results** -- the headline findings, **with real numbers** taken
   from this post's own output (effect sizes, R^2, counts, percentages).
6. **Main implication** -- the "so what?": what a practitioner or policymaker
   should take away.

**Rules:**

- One paragraph, ~150-250 words, third person, present tense.
- **No bold sub-labels** (do NOT write "**Motivation:**"), no bullets, no
  sub-headings -- the six beats are connected sentences in flowing prose.
- The results sentence must cite **numbers that already appear in the post**.
  Never invent or approximate a number that the analysis did not produce
  (in Mode B, mark any not-yet-computed figure `[VERIFY]` like the rest of the
  body).
- English body only -- the ES/JA stubs are card-only and are not affected.
- Math/escaping: follow the same rules as the rest of the post -- `\\$` for
  literal currency, `\_` for subscripts, em dashes (—) not `--`; keep LaTeX
  minimal. See `references/latex-escaping.md` (do not re-document it here).

**Skeleton (generic — replace every bracket with real content and numbers):**

```markdown
## Abstract

[Why the problem matters]. This tutorial [states the objective] by analyzing
[dataset: units, N, span, source] with [method(s)/package]. [Headline result
sentence with the real numbers], [secondary result]. These findings imply
[the practical takeaway].

## Overview
```

#### 2.2 The sandwich pattern (CRITICAL)

**Every code block that produces output** must follow this four-layer pattern:

**Layer 1 -- Explanation paragraph (before):**
- What technique/step this is and why it matters
- How it connects to the case study question
- Written generically (no output values -- they have not been computed yet)

**Beginner accessibility rules (apply to all explanation paragraphs):**

- **Define jargon on first use.** The first time a technical term appears
  (e.g., "cross-fitting", "confounders", "regularization"), follow it
  immediately with a plain-language definition. Example: "...using
  *cross-fitting* -- a procedure that splits the data into folds so that the
  model never predicts on the same data it was trained on."
- **Explain why, not just what.** Every code block needs a sentence explaining
  *why* this step is needed. Bad: "Next we scale the features." Good: "Next
  we scale the features so that variables with larger ranges do not dominate
  the distance calculations."
- **No complexity jumps.** If a code block is substantially more complex than
  the previous one, add a bridging paragraph that previews the new concept.
- **Concrete before abstract.** Give a real-world analogy or concrete example
  first, then the formal definition. Example: "Think of cross-validation as
  a rotating exam: the model takes turns training on different subsets and
  testing on the remainder."

**Layer 2 -- Code block:**

Focused, well-commented, one logical step.

````
```python
# Clear comments explaining *why*, not just *what*
result = method(data)
print(result)
```
````

**Layer 3 -- Output block:**

Shows expected printed output. Use a fenced code block with the **`text`
language tag** (prevents highlight.js from auto-detecting a language and
applying unwanted syntax coloring):

````
```text
Dataset shape: (5099, 26)
Treatment groups:
0    3354
1    1745
```
````

Output blocks are **not needed** for code that only saves figures (the figure
image reference serves as the visible output).

**Layer 4 -- Interpretation paragraph (after):**

- Quotes specific numbers from the output
- Explains what they mean in plain language
- Connects to the case study question
- 2-4 sentences, single continuous paragraph

**Function documentation (first use only):**

The first time a key function is used, introduce it in the explanation
paragraph: (1) link to official docs, (2) state its purpose in plain
language, (3) explain 2-3 key arguments. Standard pandas/numpy operations
can be skipped unless used in a non-obvious way.

#### 2.3 Mode-specific behavior

**Mode A (with materials):**

- Use **real numbers** from `results_report.md` in all output blocks and
  interpretation paragraphs. Do not fabricate or round values.
- Reference existing PNG files by their exact filename
  (e.g., `![Feature importance](doubleml_feature_importance.png)`).
- Refine the results report's interpretations for a beginner audience: add
  analogies, simplify technical language, connect to the case study question.
- Cross-check that every figure referenced in the post exists as a PNG in
  the directory.
- Cross-check that code blocks in `index.md` match the logic in `script.py`
  (same variable names, same parameters, same order of operations).

**Mode B (standalone):**

- Write code blocks inline with realistic but unverified output.
- Mark all output values as `[VERIFY]` in output blocks:
  ````
  ```text
  R-squared: [VERIFY: ~0.23]
  RMSE: [VERIFY: ~6.5]
  ```
  ````
- Include `plt.savefig()` calls in code blocks so a future script can
  generate the figures.
- Use placeholder figure references: `![Description](slug_name.png)` with a
  comment noting the figure does not yet exist.

#### 2.4 LaTeX math

Read `references/latex-escaping.md` for the complete escaping guide.

**Key rules:**

- Escape subscripts as `\_` (Goldmark strips `\`, KaTeX sees `_`)
- Escape LaTeX punctuation commands: `\\,` `\\;` `\\%` `\\!`
- Letter commands (`\theta`, `\hat`, `\text`, `\frac`) need no escaping
- Currency dollar signs: use `\\$` in `index.md` (MathJax-enabled)
- In notebook `.ipynb`: use raw LaTeX (no Goldmark escaping), `\$` for currency
- **Constructs to AVOID** (deployed-Hugo MathJax breakage on `\text{var\_name}`, `\big|`, `\underbrace`, `\\!`, `\\;`): see `references/latex-escaping.md` § *Constructs to avoid* for symptoms and safe replacements

**Equation requirements (minimum 2 display-math equations):**

For each equation:
1. **Plain-language explanation.** Immediately after the equation, write a
   sentence starting with "In words, this says..." or equivalent.
2. **Variable mapping.** Map math symbols to code variables so beginners can
   connect the formula to the implementation.
3. **Notation consistency.** Use the same symbol for the same concept
   throughout the entire post.

#### 2.5 Figures and diagrams

Read `references/figure-conventions.md` for dark theme setup, Mermaid
diagram guidance, and color family design.

**Key rules:**

- Save figures with `dpi=300, bbox_inches="tight"`
- Reference with `![Descriptive alt text](slug_name.png)`
- Place figure reference immediately after the generating code block, before
  the interpretation paragraph
- At least 3 figures total
- Use site color palette for all matplotlib plots
- Dark theme conventions if confirmed in scope

**Mermaid diagrams:**

- Require `diagram: true` in front matter
- Every Mermaid diagram must have an explanatory paragraph immediately before
  it (what the diagram shows) and an explanatory paragraph immediately after
  it (interpreting it and connecting to the narrative)
- Use site colors in `style` directives:
  `style A fill:#6a9bcc,stroke:#141413,color:#fff`
- Place methodological overview diagrams at the end of the Overview section

#### 2.6 Tables

Write Markdown tables for method comparisons, metric summaries, and data
descriptions. These are styled by CSS (teal header underlines, hover effects).

```markdown
| Metric | Baseline | Tuned |
|--------|----------|-------|
| R^2    | 0.231    | 0.230 |
| RMSE   | 6.52     | 6.52  |
```

#### 2.7 References section

Final section of every post. Include at minimum:

- **Original method paper** -- cite the academic paper that introduced the
  method (not just library documentation)
- **Dataset source** -- cite with author, year, and title
- **Library documentation** -- link to the main library docs page
- **Order:** Number references in order of first mention in the post

```markdown
## References

1. [Author(s) (Year). Paper Title. Journal.](https://doi-or-url)
2. [Dataset Name -- Source (Year)](https://dataset-url)
3. [Library Name -- Documentation](https://docs-url)
```

#### 2.8 Writing clarity

- **Sentence length.** Keep sentences under ~40 words. Target ~25 words
  average per paragraph.
- **Active voice.** Prefer "We estimate the model" over "The model is
  estimated."
- **Analogies.** At least 2 analogies per post for complex concepts.
- **Consistent terminology.** Pick one term for each concept and use it
  throughout. Do not alternate between "treatment variable", "intervention",
  and "policy" for the same concept without explanation.

#### 2.9 Academic integrity

- **Always paraphrase.** Never copy-paste text from references. Read the
  source, understand the idea, rewrite entirely in your own words.
- **Proper attribution.** Cite ideas, methods, results, or data from other
  sources explicitly in the text and in the References section.
- **Code attribution.** If code is adapted from documentation or tutorials,
  add a comment crediting the original source.
- **Images.** Only reference self-generated figures or figures from the
  existing script output.

### Step 3: Create companion notebook (if confirmed)

Only create `notebook.ipynb` if confirmed during scope. Key differences
from `index.md`:

- Uses raw LaTeX (no Goldmark escaping). Subscripts use `_` directly,
  commands use `\,` directly.
- Currency dollar signs use `\$` (not `\\$`).
- Must be runnable in Google Colab.
- Code cells match the post code blocks in order and content.
- Markdown cells contain the explanation and interpretation paragraphs.
- Include a Colab setup cell at the top if needed (pip installs, data
  downloads).

---

## Phase 3a: Verify

Run through the quality checklist from `references/quality-checklist.md`.

**Critical checks:**

| Check | Requirement |
|-------|-------------|
| Abstract | Present as the **first** section (before Overview); one paragraph ~150-250 words; six beats in order (motivation -> objective -> data -> methods -> results -> implication); no bold labels/bullets; numbers match the post body |
| Sandwich pattern | Every output-producing code block has explanation -> code -> output -> interpretation |
| Interpretations | At least 8 paragraphs with specific numeric values |
| Figures | At least 3 figure references (`![alt](file.png)`) |
| LaTeX escaping | All `_` in math escaped as `\_`, all `\,` as `\\,` |
| Math AVOID list | No `\text{var\_name}`, `\text{-}`, `\big|/\Big|/\bigg|` + subscript, `\underbrace/\overbrace`, or `\\!/\\;` in display math (see `references/latex-escaping.md`) |
| Key concepts (if present) | 5-8 concepts; each has bold term + Definition paragraph + `<div class="concept-pair">` with `<details class="concept-card concept-example">` and `<details class="concept-card concept-analogy">`; blank line after every `<summary>...</summary>` and before every `</details>` |
| Output blocks | Use ` ```text ` language tag (not bare ` ``` `) |
| Front matter | Complete, `toc: true`, `image.placement: 3`, date is yesterday |
| Links | Only reference files that exist in the page bundle |
| No emojis | No emojis anywhere in the post |
| Transitions | Every section ends with a sentence previewing the next step |
| Takeaways | Concrete with numbers, cover method/data/limitation/next-step |

**Mode-specific checks:**

- **Mode A:** All numbers match `results_report.md`. All PNGs referenced in
  the post exist in the directory. Code blocks match `script.py` logic.
- **Mode B:** All unverified output values are marked `[VERIFY]`. Figure
  references note that PNGs do not yet exist.

**Causal inference checks (if applicable):**

- Estimand (ATE/ATT) explicitly stated for each method
- Randomized vs observational framing is accurate
- Confounding language is precise

Report the checklist results to the user, noting any items that need
attention.

---

## Phase 3b: Follow-up

After delivering the post, offer the user next steps:

"The post is ready at `content/post/<lang>_<slug>/index.md`. Want me to:
- Adjust any section, add more figures, or refine interpretations?
- Run `/project:review-post` for a detailed review?
- Create the infographic prompt with `/project:write-infographic`?
- [Mode B only] Create the script with `/project:write-script` to generate
  real output and figures?"
