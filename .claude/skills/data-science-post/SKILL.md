---
name: data-science-post
description: Create a notebook-style data science blog post for carlos-mendez.org (Hugo/Wowchemy). The user provides a topic, dataset, and optional references. The skill produces a Hugo post with case-study framing, code blocks, figure references, and interpretation paragraphs.
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

## Deliverables

| Output | Path |
|--------|------|
| Blog post | `content/post/python_<topic-slug>/index.md` |
| Featured image | `content/post/python_<topic-slug>/featured.png` |
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
3. **Fetch dataset information** -- if the dataset is a URL, use WebFetch to understand its structure. If it's a named dataset, look up the standard loading pattern
4. **Check for conflicts** -- verify `content/post/python_<topic-slug>/` doesn't already exist
5. **Identify dependencies** -- determine which Python packages the topic requires. Note them in the setup code block so readers can install them:
   - DoubleML: `pip install doubleml`
   - Spatial: `pip install libpysal esda geopandas`
   - XGBoost: `pip install xgboost`
   - Time series: `pip install statsmodels`
6. **Read reference post** -- read `content/post/python_ml_random_forest/index.md` to confirm current conventions

---

## Data Source Handling

The user specifies the dataset. Design the data loading code to match.

### URL to a CSV or data file

```python
DATA_URL = "https://example.com/path/to/data.csv"
CACHE_PATH = Path("data.csv")

if CACHE_PATH.exists():
    df = pd.read_csv(CACHE_PATH)
else:
    df = pd.read_csv(DATA_URL)
    df.to_csv(CACHE_PATH, index=False)
```

### Named dataset from a well-known source

- **scikit-learn**: `from sklearn.datasets import load_iris; df = pd.DataFrame(...)`
- **Seaborn**: `df = sns.load_dataset("penguins")`
- **World Bank / FRED**: Use `pandas_datareader` or direct URL download
- **GitHub-hosted CSV**: Download via raw URL

### DS4Bolivia

**Base URL:** `https://raw.githubusercontent.com/quarcs-lab/ds4bolivia/master`

| Dataset | Path | Key columns |
|---------|------|-------------|
| SDG indices | `/sdg/sdg.csv` | `asdf_id`, `imds`, `sdg1`-`sdg15` |
| Satellite embeddings | `/satelliteEmbeddings/satelliteEmbeddings2017.csv` | `asdf_id`, `A00`-`A63` |
| Region names | `/regionNames/regionNames.csv` | `asdf_id`, municipality/department names |

Join on `asdf_id` (339 Bolivian municipalities). Select columns by topic:
supervised -> SDG target + embedding features; unsupervised -> embeddings;
causal -> SDG outcome + treatment; spatial -> add region identifiers.

### User-described dataset

If the user describes data without a URL or name, ask: format? access method? key variables?

### General principles

- Always cache downloaded data locally
- Print dataset shape and basic stats after loading
- Define `TARGET`, `FEATURE_COLS`, and config variables near the top
- Use `RANDOM_SEED = 42` for reproducibility

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
Use a fenced code block with **no language tag**:

````
```
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

### 2.4 LaTeX math in Hugo/Goldmark

Hugo's Goldmark renderer processes markdown **before** KaTeX renders math.
Goldmark treats `\` + any ASCII punctuation character as an escape sequence,
stripping the backslash. This breaks LaTeX commands that use punctuation.

**Escaping rules:**

- **Subscripts** (`_`): Write `\_` -- Goldmark strips `\`, KaTeX sees `_`
- **LaTeX punctuation commands** (`\,` `\;` `\%` `\!`): Write `\\,` `\\;` `\\%` `\\!` -- Goldmark converts `\\` to `\`, preserving the LaTeX command
- **LaTeX letter commands** (`\theta` `\hat` `\text` `\frac` `\sum`): No escaping needed -- Goldmark only escapes `\` + punctuation, not `\` + letter
- **Display math** (`$$...$$`): Same escaping rules apply -- Goldmark does NOT treat `$$` as a protected block
- **Multiple underscores**: Goldmark pairs `_` across an entire paragraph for emphasis. Even separate inline math like `$\theta_0$` and `$g_0(X)$` on the same line can have their underscores paired as `<em>` tags. Always escape every `_` in math as `\_`
- **Currency dollar signs**: MathJax treats `$...$` as inline math. Use `\\$` for literal dollar signs in prose (Goldmark outputs `\$`, MathJax treats as literal thanks to `processEscapes: true` in `assets/js/mathjax-config.js`). Do NOT use `&#36;` -- it does not work. In notebook `.ipynb`, use `\$` instead (no Goldmark layer)

**Quick reference:**

| Want | Write in markdown | Goldmark produces | KaTeX sees |
|------|-------------------|-------------------|------------|
| Subscript `x_i` | `$x\_i$` | `$x_i$` | subscript |
| Thin space | `$D \\, \theta\_0$` | `$D \, \theta_0$` | thin space |
| Percent `95%` | `$\text{CI}\_{95\\%}$` | `$\text{CI}_{95\%}$` | percent |
| Thick space | `$[-0.14, \\; -0.00]$` | `$[-0.14, \; -0.00]$` | thick space |

**Worked example -- a full equation with all escaping applied:**

What you want rendered:
$$Y_i = \theta_0 \, D_i + g_0(X_i) + U_i, \quad E[U_i | D_i, X_i] = 0$$

What you write in `index.md`:
```
$$Y\_i = \theta\_0 \\, D\_i + g\_0(X\_i) + U\_i, \\quad E[U\_i | D\_i, X\_i] = 0$$
```

Key escaping applied: every `_` → `\_`, every `\,` → `\\,`, every `\quad` is fine (letter command).

**WARNING:** Always visually verify math rendering in the Hugo dev server.
LaTeX errors are silent -- broken math renders as raw text or wrong symbols.

### 2.4b Equation requirements

Every post that introduces a quantitative method must present its key
equations. Equations ground intuition in formal notation and connect
the math to the code.

**Minimum:** 2 display-math equations for any post introducing a
quantitative method.

**For each equation:**

1. **Plain-language explanation.** Immediately after the equation, write
   a sentence starting with "In words, this says..." or equivalent.
   Example: "In words, this equation says that the outcome $Y$ equals
   the treatment effect $\theta$ times the treatment $D$, plus
   everything else that affects $Y$ through the controls $X$."

2. **Variable mapping.** Map math symbols to code variables so beginners
   can connect the formula to the implementation. Example: "$Y$
   corresponds to our `inuidur1` column, $D$ is the `tg` treatment
   indicator, and $X$ includes the 15 covariate columns."

3. **Notation consistency.** Use the same symbol for the same concept
   throughout the entire post. Do not switch between $Y$ and $y$, or
   $D$ and $T$, without explicit explanation.

### 2.5 Figure conventions

In code blocks, save figures with:

```python
plt.savefig("<slug>_<name>.png", dpi=300, bbox_inches="tight")
plt.show()
```

After the code block, reference the figure with:

```markdown
![Descriptive alt text.](<slug>_<name>.png)
```

Hugo resolves images from the page bundle, so use just the filename. Use the
site color palette (see top of this document) for all matplotlib plots.
At least 3 figures total.

**Figure placement:** Place the figure image reference (`![alt](file.png)`)
immediately after the code block that generates it, before the
interpretation paragraph. The figure serves as visual output; the
interpretation paragraph then explains what the reader is seeing.

### 2.5b Diagrams

If the method has a causal, structural, or multi-step framework, include
at least one diagram to visualize the structure. Examples: a DAG for
causal inference, a flowchart for a multi-step pipeline, an architecture
diagram for an ensemble model.

**Options for diagrams:**

- **Mermaid diagrams** (preferred for flowcharts and DAGs) -- Hugo supports
  Mermaid natively. Add `diagram: true` to front matter, then use fenced
  code blocks with the `mermaid` language tag. Use site colors in `style`
  directives (e.g., `style A fill:#6a9bcc,stroke:#141413,color:#fff`).
- **Matplotlib** -- for quantitative diagrams that need precise layout.
- **Pre-made image** -- include in the page bundle.

### 2.5c Color families for related methods

When comparing multiple related methods (e.g., propensity score variants,
ensemble methods, regularization approaches), use a **color family** to
visually group them in comparison charts. This makes it immediately clear
which methods belong together.

**Example from the DoWhy post (6 estimation methods):**

| Method | Color | Rationale |
|--------|-------|-----------|
| Naive (baseline) | `#999999` (gray) | Distinct: not a causal method |
| Regression Adjustment | `#6a9bcc` (steel blue) | Outcome modeling paradigm |
| IPW | `#d97757` (warm orange) | Treatment modeling paradigm |
| AIPW | `#00d4c8` (teal) | Doubly robust paradigm |
| PS Stratification | `#e8956a` (light orange) | Treatment modeling -- warm orange family |
| PS Matching | `#c4623d` (dark orange) | Treatment modeling -- warm orange family |

The warm orange family (`#d97757`, `#e8956a`, `#c4623d`) groups all three
propensity score methods visually, while distinct paradigms get distinct colors.

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

### 2.8 Causal inference posts: estimand precision

When a post compares **multiple causal estimation methods**, explicitly state
which **estimand** each method targets. This is a common source of confusion
and errors.

**Required elements:**

1. **Define the estimand(s) early** -- before the estimation section, add a
   subsection explaining the target estimand (e.g., ATE vs ATT) with formal
   notation and a plain-language policy question each answers.
2. **Flag estimand shifts** -- if any method targets a different estimand than
   the others (e.g., PS matching targets ATT while IPW targets ATE), state
   this explicitly in both the method explanation and the comparison discussion.
3. **Randomized vs observational framing** -- in randomized experiments, the
   naive difference-in-means is **unbiased in expectation**. Do NOT claim
   covariate adjustment "removes confounding bias" -- instead frame it as
   **improving precision** by accounting for finite-sample covariate imbalances.
   In observational studies, confounding bias is a genuine concern and should
   be described as such.

**Example (from DoWhy post):**

> **In this tutorial, we estimate the ATE** --- the average effect across the
> entire study population. Four of our five methods target the ATE directly.
> The exception is **propensity score matching**, which discards unmatched
> controls and therefore shifts the estimand toward the ATT.

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

## Step 4: Create script.py (optional)

If the post warrants a standalone script, create
`content/post/python_<topic-slug>/script.py`:

```python
"""
<Tutorial Title>: <Topic> Case Study

<One-paragraph description>

Usage:
    python script.py

References:
    - <URL 1>
    - <URL 2>
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# ... full analysis pipeline ...
```

Include in front matter links:

```yaml
- icon: code
  icon_pack: fas
  name: "Python script"
  url: script.py
```

---

## Step 4b: Create notebook.ipynb (optional)

If the post would benefit from a companion Jupyter notebook, create
`content/post/python_<topic-slug>/notebook.ipynb` (nbformat 4, Python 3 kernel).

Structure the notebook as alternating markdown cells (explanations) and code
cells (matching the blog post code blocks). The notebook should be runnable
end-to-end in Google Colab.

**IMPORTANT:** LaTeX in Jupyter notebooks does **NOT** need Goldmark escaping.
Use raw `_` for subscripts, `\,` for thin space, `\%` for percent, etc.
The escaping rules in section 2.4 apply only to `index.md`.

Include the notebook in front matter links:

```yaml
- icon: book
  icon_pack: fas
  name: "Jupyter notebook"
  url: notebook.ipynb
```

If the notebook is pushed to the GitHub repo, add a Colab link:

```yaml
- icon: open-data
  icon_pack: ai
  name: "[Python] Google Colab"
  url: https://colab.research.google.com/github/cmg777/starter-academic-v501/blob/master/content/post/python_<topic-slug>/notebook.ipynb
```

---

## Step 4c: Create featured image

Save a `featured.png` in the page bundle. Hugo auto-detects this file as the
post's thumbnail (no need to set `featured: true` in front matter). Options:

- **Results chart** -- save the most informative figure (e.g., coefficient
  comparison, model performance summary) as `featured.png`
- **Visual summary** -- create an infographic using Excalidraw or matplotlib
  that captures the key workflow and results in one image

The featured image appears in post listings, social sharing previews, and the
post header. Choose whichever best represents the post at a glance.

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
     rest of the script can still run. Example:
     ```python
     try:
         model.view_model(layout="dot")
     except Exception as e:
         print(f"Skipping (tool not available): {e}")
     ```
   - **Floating-point drift:** Numeric output may vary slightly across runs
     (e.g., `$1,559.41` vs `$1,559.47`) due to floating-point non-determinism.
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
5. **Report** to user: what was created + local preview URL

---

## Quality checklist

- [ ] Front matter follows Wowchemy conventions (match reference post)
- [ ] `toc: true` is set
- [ ] Overview motivates the case study question
- [ ] Learning objectives present (3-5 bullets)
- [ ] Every output-producing code block has the sandwich (explanation -> code -> output -> interpretation)
- [ ] Every `print()` / `.describe()` / `.head()` code block has an output block (no language tag)
- [ ] At least 8 interpretation paragraphs with specific numbers
- [ ] At least 3 figures with `dpi=300, bbox_inches="tight"`
- [ ] Matplotlib uses site colors (`#6a9bcc`, `#d97757`, `#141413`)
- [ ] All LaTeX math uses Goldmark-safe escaping (`\_` for subscripts, `\\` for punctuation commands)
- [ ] Math rendering visually verified in Hugo dev server
- [ ] `featured.png` exists in the page bundle
- [ ] Summary table compares key metrics
- [ ] Discussion connects findings to case study question
- [ ] Limitations and next steps section
- [ ] Exercises (2-3 challenges, encouraged)
- [ ] References section with numbered clickable links
- [ ] No emojis in post content
- [ ] Summary in front matter is a single line
- [ ] Date set to current date
- [ ] Data loading matches user-specified dataset
- [ ] Notebook companion (if created) uses raw LaTeX (no Goldmark escaping)
- [ ] Technical jargon defined on first use (no unexplained terms)
- [ ] At least 2 display-math equations (for quantitative method posts)
- [ ] Each equation has plain-language explanation and variable mapping
- [ ] Notation consistent throughout (same symbol = same concept)
- [ ] At least 2 analogies or concrete examples for complex concepts
- [ ] No sentence exceeds ~40 words
- [ ] Active voice preferred throughout
- [ ] Transitions between all sections (no abrupt jumps)
- [ ] Discussion answers the Overview question explicitly
- [ ] "So what?" practical implication stated
- [ ] Takeaways are concrete with numbers (not generic summaries)
- [ ] Takeaways cover: method insight, data insight, limitation, next step
- [ ] References include original method paper (not just library docs)
- [ ] Dataset source cited with author/year/title
- [ ] References numbered in order of first mention
- [ ] Code executed and output blocks match actual results
- [ ] All PNGs regenerated after any code/color changes (no stale images)
- [ ] No orphaned PNGs in page bundle (every PNG referenced in post)
- [ ] Currency dollar signs use `\\$` in index.md, `\$` in notebook.ipynb
- [ ] Causal posts: estimand (ATE/ATT) explicitly stated for each method
- [ ] Causal posts: randomized vs observational framing is accurate
- [ ] External tool dependencies wrapped in try/except (graphviz, etc.)
- [ ] Color families used for related method groups in comparison charts
- [ ] `diagram: true` in front matter if Mermaid diagrams are used
- [ ] Key Python functions linked to docs and explained on first use
- [ ] Simple baseline established before the full method
- [ ] At least one robustness/validation check included
- [ ] Comparison summary table for multiple approaches or configurations
- [ ] Diagram included for causal/structural/multi-step methods
- [ ] Learning objectives use strong action verbs (Understand, Implement, Estimate, Assess, Compare)
- [ ] Interpretation paragraphs translate metrics into domain-meaningful statements
- [ ] Figure image references placed immediately after generating code block
- [ ] Narrative follows arc: Question → Intuition → Baseline → Method → Validation → Takeaways
