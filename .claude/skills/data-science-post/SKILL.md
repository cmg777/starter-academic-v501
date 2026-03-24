---
name: data-science-post
description: Create a notebook-style data science blog post for carlos-mendez.org. Use when the user wants to write a Python tutorial, create a data science post, demonstrate a statistical or causal inference method, or produce content for the python_* post series. Produces a Hugo page bundle with case-study framing, sandwich-pattern code blocks, matplotlib figures, and interpretation paragraphs. Confirms topic scope and design choices before writing.
argument-hint: "<topic> dataset: <dataset name or URL> [references: <URLs, papers, or notes>]"
disable-model-invocation: true
user-invocable: true
---

# Data Science Post: Notebook-Style Blog Post Generator

Create a self-contained, pedagogical data science blog post framed as a
**case study** with a clear motivating problem. The user specifies the topic,
dataset, and (optionally) reference materials such as library documentation
URLs. The skill produces a Hugo blog post with conceptual explanations before
every code block and interpretation of results after every code block.

The post inherits notebook-style CSS styling (teal-accented code blocks, blue
headings, styled tables, left-side TOC) from `assets/scss/custom.scss`.

## Example invocations

```
/project:data-science-post double machine learning dataset: DS4Bolivia references: https://docs.doubleml.org/stable/intro/intro.html
/project:data-science-post k-means clustering dataset: https://archive.ics.uci.edu/ml/datasets/Iris
/project:data-science-post spatial regression dataset: PySAL example data references: https://pysal.org/spreg/
/project:data-science-post gradient boosting dataset: https://raw.githubusercontent.com/user/repo/main/housing.csv references: https://scikit-learn.org/stable/modules/ensemble.html#gradient-boosting
```

## Site color palette

These colors are used throughout the site and must be used consistently in
matplotlib plots, and are referenced in the CSS styling below.

| Name | Hex | Use in plots |
|------|-----|-------------|
| Steel blue | `#6a9bcc` | Primary data (bars, scatter, histograms) |
| Warm orange | `#d97757` | Reference lines, secondary series |
| Near black | `#141413` | Tertiary elements, text annotations |
| Teal | `#00d4c8` | Highlights (use sparingly) |
| Heading blue | `#1a3a8a` | CSS only -- headings, titles |

### Dark theme palette

For posts that use dark-background figures (e.g., to match the site's dark
navbar/footer), use this extended palette for figure backgrounds, grid lines,
and text. Reference post: `content/post/python_fwl/script.py`.

| Name | Hex | Use in plots |
|------|-----|-------------|
| Dark navy | `#0f1729` | Figure + axes background (`facecolor`) |
| Grid line | `#1f2b5e` | Grid lines (subtle contrast on dark bg) |
| Light text | `#c8d0e0` | Axis labels, tick labels, legend text |
| White text | `#e8ecf2` | Titles, bold annotations |

## Deliverables

| Output | Path |
|--------|------|
| Blog post | `content/post/python_<topic-slug>/index.md` |
| Python script (optional) | `content/post/python_<topic-slug>/script.py` |
| Jupyter notebook (optional) | `content/post/python_<topic-slug>/notebook.ipynb` |
| Figures (>= 3) | `content/post/python_<topic-slug>/<slug>_*.png` |

---

## Pre-flight

1. **Parse `$ARGUMENTS`:**
   - **Topic** -- everything before `dataset:`
   - **Dataset** -- everything between `dataset:` and `references:` (or end). Can be a URL, a dataset name, or a description
   - **References** -- everything after `references:` (optional)
   - **Topic slug** -- lowercase, underscores (e.g., "double machine learning" -> `doubleml`)
2. **Fetch reference URLs** -- use WebFetch to read each URL and understand the library's API, key classes/functions, and recommended usage patterns. Critical for producing accurate, idiomatic code
3. **Fetch dataset information** -- if the dataset is a URL, use WebFetch to understand its structure. If it's a named dataset, look up the standard loading pattern. Read `references/data-sources.md` for data loading patterns (URL download with cache, named datasets, DS4Bolivia joins, simulated DGP for method tutorials, user-described data)
4. **Check for conflicts** -- verify `content/post/python_<topic-slug>/` doesn't already exist
5. **Identify dependencies** -- determine which Python packages the topic requires. Note them in the setup code block so readers can install them:
   - DoubleML: `pip install doubleml`
   - Spatial: `pip install libpysal esda geopandas`
   - XGBoost: `pip install xgboost`
   - Time series: `pip install statsmodels`
6. **Read reference post** -- read `content/post/python_ml_random_forest/index.md` to confirm current conventions

---

## Step 0.5: Confirm scope and design choices

Before creating any files, present the user with a confirmation summary and
**wait for their response**. This step prevents rework by aligning on the
post's framing, scope, and deliverables upfront. Display all items in a
single formatted block:

1. **Topic understanding**: "I'll create a tutorial about [TOPIC] using the
   [DATASET]. The case study question will be: '[QUESTION]'. Does this
   capture your intent?"

2. **Post type**: "[Causal inference / ML prediction / Exploratory analysis /
   Statistical method tutorial] -- based on [brief reasoning]. Change?"

3. **Figure theme**: "Light background (default) or dark navy background?
   Dark theme matches the site's navbar/footer aesthetic and works well for
   scatter plots and line charts."

4. **Post scope** -- ask about optional sections based on the topic:
   - "Should I include a baseline comparison before the main method?"
   - "Should I include a robustness/sensitivity analysis section?"
   - "Should I include exercises for self-study?"

5. **Companion deliverables**: "Which deliverables should I create?
   - index.md (always)
   - script.py (standalone Python script)
   - notebook.ipynb (Jupyter notebook for Google Colab)"

6. **Ambiguity resolution** (conditional) -- if the topic could be framed
   as either causal or predictive, ask: "This topic could be framed as
   [causal estimation of X] or [prediction of Y]. Which framing do you
   prefer?"

**Handling responses:**
- "Looks good" / "proceed" / no changes: continue with stated defaults
- Specific adjustments: incorporate them and proceed
- Major reframing requested: revise the scope and re-present the summary

---

## Step 1: Create the post

Create `content/post/python_<topic-slug>/index.md` with YAML front matter:

```yaml
---
authors:
  - admin
categories:
  - Python
draft: false
featured: false
date: "<YYYY-MM-DDT00:00:00Z>"
external_link: ""
image:
  caption: ""
  focal_point: Smart
links:
- icon: open-data
  icon_pack: ai
  name: "[Python] Google Colab"
  url: <colab-url-if-available>
- icon: code
  icon_pack: fas
  name: "Python script"
  url: script.py
slides:
summary: <One sentence -- method, dataset, and finding>
tags:
- python
- <additional-relevant-tags>
title: "<Tutorial Title>"
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
toc: true
---
```

- Set `date` to the current date
- Omit Colab/script links if not applicable
- Choose tags from: `python`, `spatial`, `regional`, `causal`, `world`, `gee`
- `toc: true` enables the left-side table of contents sidebar

---

## Step 2: Write the post body

The post is a **case-study tutorial** that tells a coherent story: a real-world
question motivates the analysis, the method addresses that question, and the
results answer it. Every section uses `##` headings (subsections `###`) and
fenced Python code blocks.

### 2.1 Post structure

| Section | Content | Required |
|---------|---------|----------|
| **Colab badge** | `<a href="..." target="_blank"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"></a>` (if applicable) | If exists |
| **Overview** | 1-2 paragraphs: What question are we answering? Why does this method matter? Frame as: "We want to know X. Method Y can help because Z." | Yes |
| **Learning objectives** | 3-5 bullet points using strong action verbs (Understand, Implement, Estimate, Assess, Compare). Avoid vague verbs like "explore" or "see" | Yes |
| **Setup & imports** | Imports, config variables, seed, data URLs | Yes |
| **Data loading** | Load dataset, explain structure, print shape/stats | Yes |
| **EDA** | At least 1 figure, connected to case study question | Yes |
| **Data preparation** | Scaling, encoding, train/test split as needed | If needed |
| **Baseline** | Simple approach first (naive OLS, difference in means, basic model) to establish a benchmark and motivate the full method | Encouraged |
| **Core method** (1-3 sections) | Main technique with conceptual explanations. Each major step gets its own `##`. At least 1 figure | Yes |
| **Evaluation & results** | Metrics, comparison tables, at least 1 figure | Yes |
| **Validation & robustness** | At least one robustness check: learner comparison, refutation test, residual analysis, or sensitivity analysis | Encouraged |
| **Discussion** | What findings mean for the case study question. Connect to real-world context | Yes |
| **Summary and next steps** | Takeaways (concrete insights with numbers) + limitations + next steps | Yes |
| **Exercises** | 2-3 self-study challenges for the reader | Encouraged |
| **References** | Numbered list of clickable links to all sources | Yes |

**Narrative flow rules:**

- **Transitions.** End each section with a sentence that previews the
  next step or links back to the case study question. The reader should
  never wonder "why are we doing this now?"
- **Question-answer arc.** The Overview poses a question. The Discussion
  must explicitly answer it with specific findings. Check that these
  two sections mirror each other.
- **Result ordering.** Present the most important finding first in the
  Evaluation & Results section. Do not bury the key result after
  preliminary diagnostics.
- **"So what?" moment.** At least one paragraph (typically in Discussion)
  must state a clear practical implication -- what a policymaker,
  analyst, or practitioner would do with this finding.

**Takeaways requirements:**

- Takeaways must be concrete insights with numbers, not generic
  summaries. Bad: "We learned about Random Forest." Good: "Satellite
  embeddings explain 23% of development variation (R^2 = 0.23), with
  embedding A05 contributing 3x more than the median feature."
- Cover at least 4 dimensions: (1) a method insight (when to use this
  method), (2) a data insight (what the data revealed), (3) a practical
  limitation (when this approach fails), (4) a next step (what to try
  next).
- Do not restate section headings. Each takeaway should stand alone as
  something the reader remembers a week later.

**Narrative arc:**

Structure the post as a journey that follows this arc:
1. **Question** (Overview) -- pose the case study question
2. **Intuition** (EDA) -- show the data, build understanding
3. **Simple baseline** -- establish a benchmark with the simplest approach
4. **Full method** -- introduce and apply the main technique
5. **Validation** -- test whether results hold (robustness checks)
6. **Takeaways** -- answer the original question with specific findings

**Subsection structure:**

When a method has multiple conceptual steps (e.g., model fitting,
cross-validation, test evaluation), use `###` subsections to break them
up. This creates visual structure in the TOC and helps readers navigate.

### 2.2 The sandwich pattern

**Every code block that produces output** must follow a four-layer pattern:

**1. Explanation paragraph** (before):
- What technique/step this is and why it matters
- How it connects to the case study question
- Written generically (no output values -- they haven't been computed yet)

**Beginner accessibility rules (apply to all explanation paragraphs):**

- **Define jargon on first use.** The first time a technical term appears
  (e.g., "cross-fitting", "confounders", "regularization"), follow it
  immediately with a plain-language definition in the same sentence or
  the next sentence. Example: "...using *cross-fitting* -- a procedure
  that splits the data into folds so that the model never predicts on
  the same data it was trained on."
- **Explain why, not just what.** Every code block needs a sentence
  explaining *why* this step is needed for the analysis, not just what
  it does mechanically. Bad: "Next we scale the features." Good: "Next
  we scale the features so that variables with larger ranges do not
  dominate the distance calculations."
- **No complexity jumps.** If a code block is substantially more complex
  than the previous one, add a bridging paragraph that previews the new
  concept before the code.
- **Concrete before abstract.** When introducing a concept, give a
  real-world analogy or concrete example first, then the formal
  definition. Example: "Think of cross-validation as a rotating exam:
  the model takes turns training on different subsets and testing on the
  remainder, so no single lucky split determines the score."

**2. Code block** -- focused, well-commented, one logical step:

````
```python
# Clear comments explaining *why*, not just *what*
result = method(data)
print(result)
```
````

**3. Output block** -- shows expected printed output (required when code calls
`print()`, `.describe()`, `.head()`, `.summary()`, or displays a DataFrame repr).
Use a fenced code block with the **`text` language tag** (prevents highlight.js
from auto-detecting a language and applying unwanted syntax coloring):

````
```text
Dataset shape: (5099, 26)
Treatment groups:
0    3354
1    1745
Name: tg, dtype: int64
```
````

Output blocks are **not needed** for code that only saves figures (the figure
image reference serves as the visible output).

**4. Interpretation paragraph** (see Step 3 for detailed guidance):
- Quotes specific numbers from the output
- Explains what they mean in plain language
- Connects to the case study question
- 2-4 sentences, single continuous paragraph

### 2.2b Function documentation

The first time a Python function is used in the post, introduce it
properly so the reader understands what it does and can learn more.

**For each key function on first use:**

1. **Link to docs.** In the explanation paragraph before the code block,
   link the function name to its official documentation. Use markdown:
   `[train_test_split()](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html)`.
2. **State its purpose.** One plain-language sentence explaining what the
   function does. Example: "We use
   [DoubleMLPLR()](https://docs.doubleml.org/stable/api/generated/doubleml.DoubleMLPLR.html)
   to estimate the causal effect of the treatment while controlling for
   confounders using machine learning."
3. **Explain key arguments.** Briefly describe 2-3 arguments the reader
   needs to understand. Example: "`ml_l` sets the learner for the
   outcome model, `ml_m` sets the learner for the treatment model, and
   `n_folds` controls how many cross-fitting folds are used."

Not every function needs this treatment -- focus on the functions that
are central to the analysis (model constructors, key sklearn/statsmodels
calls, data transformation functions). Standard pandas/numpy operations
like `pd.read_csv()` or `np.mean()` can be skipped unless used in a
non-obvious way.

### 2.3 Code block conventions

- Use ` ```python ` fenced blocks (rendered by highlight.js with custom colors in `assets/scss/custom.scss`)
- One logical step per block -- keep focused
- First code block: imports + configuration

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

# Reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Configuration
TARGET = "<target-variable>"
FEATURE_COLS = [...]
DATA_URL = "<url-or-path>"
```

If the post has a companion notebook in the `claude4data` repo, use this instead:

```python
import sys
if "google.colab" in sys.modules:
    !git clone --depth 1 https://github.com/cmg777/claude4data.git /content/claude4data 2>/dev/null || true
    %cd /content/claude4data/notebooks
sys.path.insert(0, "..")
from config import set_seeds, RANDOM_SEED, IMAGES_DIR, TABLES_DIR, DATA_DIR

set_seeds()
```

### 2.4 LaTeX math and equations

For LaTeX math in Hugo, escape subscripts as `\_` and LaTeX punctuation
commands as `\\,`, `\\;`, etc. Letter commands like `\theta` need no
escaping. Currency dollar signs use `\\$` in `index.md`. Read
`references/latex-escaping.md` for the complete escaping guide, worked
examples, and equation requirements (plain-language explanations, variable
mapping, notation consistency). Minimum 2 display-math equations for
quantitative method posts.

### 2.5 Figures, diagrams, and color families

Save figures with `dpi=300, bbox_inches="tight"`, reference with
`![alt](slug_name.png)`. Place figure references immediately after the
generating code block, before the interpretation paragraph. At least 3
figures total. Read `references/figure-conventions.md` for dark theme
setup (rcParams, savefig options), Mermaid diagram guidance, and color
family design for multi-method comparison charts.

### 2.6 Tables

Write Markdown tables directly (styled by CSS section 11C -- teal header
underlines, hover effects):

```markdown
| Metric | Baseline | Tuned |
|--------|----------|-------|
| R^2    | 0.231    | 0.230 |
| RMSE   | 6.52     | 6.52  |
```

When comparing multiple estimation approaches or model configurations,
use a Markdown table to display key metrics side-by-side. This is one of
the most effective pedagogical tools -- readers can scan a table faster
than re-reading multiple paragraphs of results.

### 2.7 References section

Final section of every post:

```markdown
## References

1. [Library Name -- Documentation Title](https://full-url-to-docs)
2. [Author(s) (Year). Paper Title. Journal.](https://doi-or-url)
3. [Dataset Name -- Source](https://dataset-url)
```

Include at minimum:
- **Original method paper** -- cite the academic paper that introduced
  the method (not just library documentation). Example: for DoubleML,
  cite Chernozhukov et al. (2018), not just the Python package docs.
- **Dataset source** -- cite with author, year, and title (not just a
  raw URL). Example: `[DS4Bolivia -- QUARCS Lab (2021)](https://...)`.
- **Library documentation** -- link to the main library docs page.
- **Order:** Number references in order of first mention in the post.

### 2.8 Causal inference posts

For causal inference posts, explicitly state which estimand (ATE/ATT) each
method targets and use correct framing for randomized vs observational data.
Read `references/causal-inference.md` for full requirements on estimand
precision, confounding language, and framing guidelines.

### 2.9 Writing clarity

- **Sentence length.** Keep sentences under ~40 words. If a sentence
  needs re-reading, split it. Target ~25 words average per paragraph.
- **Active voice.** Prefer "We estimate the model" over "The model is
  estimated." Active voice is clearer and more engaging.
- **Analogies for complex concepts.** For each new technical concept,
  provide a real-world analogy or concrete example before the formal
  definition. At least 2 analogies per post.
- **Consistent terminology.** Pick one term for each concept and use it
  throughout. Do not alternate between "treatment variable",
  "intervention", and "policy" for the same concept without explanation.

### 2.10 Academic integrity and originality

Respecting copyrights and avoiding plagiarism is non-negotiable. Every
sentence in the post must be original writing.

- **Always paraphrase.** Never copy-paste text from references,
  documentation, tutorials, or any external source. Read the source,
  understand the idea, then rewrite it entirely in your own words while
  preserving the original meaning. Even short phrases should be
  rephrased -- do not reproduce verbatim passages, even with attribution.
- **Proper attribution.** When using ideas, methods, results, or data
  from another source, cite it explicitly in the text (e.g., "Following
  the approach introduced by Chernozhukov et al. (2018)...") and include
  the full reference in the References section.
- **Code attribution.** If code is adapted from documentation, tutorials,
  or other sources, add a comment in the code crediting the original
  source (e.g., `# Adapted from scikit-learn docs: <URL>`) and include
  the source in the References section.
- **Images and figures.** Only use self-generated figures produced by
  `script.py`. Never include images from external sources without
  explicit permission and proper attribution.
- **When in doubt, cite.** If you are unsure whether an idea is common
  knowledge or attributable to a specific source, err on the side of
  citing.

---

## Step 3: Interpret results -- THIS IS THE MOST IMPORTANT STEP

The interpretation paragraphs are what transform this post from a code demo
into a genuine case-study tutorial. Without them, a beginner sees numbers
and plots but has no idea what they mean. **Every code block that produces
output needs a paragraph immediately after it that explains the result in
plain language and connects it back to the case study question.**

### How to do it

After writing the full post draft (Step 2), review every code block that
produces output. For each one, ensure an interpretation paragraph follows.

If the post has a companion notebook or script that has been executed, read
the actual output and use the real numbers. If not, write realistic values
based on the dataset and method, and mark them for the user to verify.

### What good interpretation looks like

Each interpretation paragraph must:

1. **Quote specific numbers** (e.g., "R^2 = 0.23", "339 observations", "mean of 51.05")
2. **Explain what those numbers mean** in plain language a beginner can understand
3. **Translate to domain meaning** -- convert abstract metrics into
   real-world statements. Bad: "MAE = 4.72." Good: "Predictions are
   typically off by about 4.7 IMDS points -- meaningful uncertainty that
   would make targeting aid to specific municipalities difficult."
4. **Connect findings to the case study question** and real-world context
5. **Be a single continuous paragraph** (no bullet points, no hard line breaks)
6. **Be 2-4 sentences** -- concise but substantive

### Good vs bad

**Bad** (vague, no numbers):
> The model performed reasonably well on the test set.

**Good** (specific, contextual):
> The tuned model achieves R^2 = 0.2297, RMSE = 6.52, and MAE = 4.72 on the test set -- essentially identical to the baseline. In practical terms, predictions are typically off by about 4.7 IMDS points on a scale where most values fall between 47 and 55. Satellite embeddings capture real but limited predictive signal for municipal development.

**Bad** (restates output):
> The dataset has 339 rows and 88 columns.

**Good** (adds meaning):
> All 339 Bolivian municipalities loaded with no missing values, providing complete national coverage. The merged data has 88 columns: 64 satellite embedding features, SDG indices, and region identifiers. IMDS scores range from 35.70 to 80.20 with a mean of 51.05, meaning most municipalities cluster within about 7 points of the national average.

### Verification

Count interpretation paragraphs. There must be **at least 8** that reference
specific numeric values. Typical locations:

1. After data loading (shape, basic stats)
2. After EDA figure (distribution patterns, correlations)
3. After train/test split (set sizes, implications)
4. After baseline model (initial metrics)
5. After tuning/main method (changed metrics)
6. After evaluation figure (visual patterns)
7. After feature importance / key results
8. After summary table (overall takeaways)

If fewer than 8, go back and add more.

---

## Step 4: Create companion deliverables

If script.py or notebook.ipynb were confirmed in Step 0.5, read
`references/companion-deliverables.md` for the templates and conventions.
Key points: script.py includes a docstring header and mirrors the post's
analysis pipeline; notebook.ipynb uses raw LaTeX (no Goldmark escaping);
do NOT generate `featured.png` -- the user adds it manually.

---

## Step 5: Verify

1. **Check deliverables:**
   - `content/post/python_<slug>/index.md` with complete front matter
   - `toc: true` in front matter
   - At least 3 figure references
   - At least 8 interpretation paragraphs with specific numbers
   - References section at the end
   - Colab badge (if applicable)
2. **Run the code:**
   - If `script.py` exists, run it from the post directory:
     `cd content/post/python_<slug> && python3 script.py`
   - If not, assemble code blocks from `index.md` into a temporary script and run it
   - Compare actual printed output against the output blocks in `index.md`
   - Flag any discrepancies: different numbers, errors, deprecation warnings
   - Verify that all referenced PNG files were generated
   - If any output differs, update the output blocks in the post to match
     actual results
   - **Image freshness:** After ANY code or color change, re-run the script to
     regenerate ALL images. Stale PNGs (showing old values or colors) are a
     common and hard-to-detect bug. Compare chart values against output blocks.
   - **Orphaned images:** List all PNGs in the directory, cross-reference with
     `index.md` image references, and delete any PNGs not referenced in the post.
   - **External tool dependencies:** If the script depends on optional tools
     (e.g., graphviz for DAG rendering), wrap those calls in try/except so the
     rest of the script can still run.
   - **Floating-point drift:** Numeric output may vary slightly across runs.
     Always use the values from the LATEST run in output blocks and verify
     that rounded values in charts and summary tables are consistent.
3. **Run Hugo dev server:**
   ```bash
   "$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender
   ```
4. **Visual checks:**
   - Post renders at `http://localhost:1313/post/python_<slug>/`
   - Left-side TOC shows sections and subsections
   - Code blocks have syntax highlighting
   - Headings are blue (#1a3a8a)
   - Tables render with clean styling
   - **All LaTeX math renders correctly** (no raw text, no wrong symbols)
   - Output blocks appear after code that prints results
   - Featured image displays in post header and listings
5. **Run the full quality checklist** from `references/quality-checklist.md`.
   Key checks: sandwich pattern on every output block, at least 8
   interpretations with numbers, at least 3 figures, LaTeX rendering, no
   orphaned PNGs, original writing with proper attribution.
6. **Report** to user: what was created + local preview URL

---

## Step 5.5: Follow-up

After delivering the post and reporting results, offer the user next steps:

"The post is ready at `content/post/python_<slug>/`. Want me to:
- Adjust any section or add more figures?
- Run `/project:proofread-post` for a final QA check?
- Run `/project:referee-post` for a deep expert review?
- Create the infographic prompt with `/project:infographic-instructions`?"
