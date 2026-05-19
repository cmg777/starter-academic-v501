# Results Report Structure

> This file is part of the `write-results-report` skill. Read this file
> when writing `results_report.md`.

## Template

```markdown
# Results Report: <Topic>

**Script:** `script.py` (or `analysis.do` / `analysis.R`) (N lines)
**Executed:** <YYYY-MM-DD>
**Status:** Success / Success with warnings — <one-line warning summary>
**Runtime:** <X seconds>
**Language:** Python <version> / Stata <version> / R <version>
**Key packages:** <list with versions>

**Methodological reference (if applicable):** <Full citation with DOI/URL.
State that the script ports the paper's logic and acknowledges its
authorship.>

---

## Execution Summary

<1–2 paragraphs covering: what the script does (dataset, method, research
question); whether execution was clean or had warnings; and the headline
finding(s). When there are multiple estimators or stages, organize the
headline in a layered structure — for example: "(i) parametric estimator
gives X; (ii) sensitivity range gives Y; (iii) nonparametric gives Z".>

**Warnings (all non-fatal):**
- <category 1>: <count> × <one-line description>
- <category 2>: <count> × <one-line description>
- "none" if no warnings

---

## Data Overview

```text
<Paste the actual printed output from the script: shape, columns, head,
descriptive statistics.>
```

### Table — <Descriptive name> (`<csv_filename>.csv`)

| col1 | col2 | col3 |
|---|---:|---:|
| ... | ... | ... |

**Interpretation:** <What the data tells us — sample size, coverage,
variable ranges, any notable patterns in the descriptive stats. Include
specific numbers. 2–4 sentences.>

---

## Method Results

### 4.1  <Method/Step 1 name>

![One-sentence figure description](<slug>_NN_step1.png)

**Raw output:**

```text
<Paste the actual printed output from the script for this step.>
```

### Table — <Step 1 descriptive name> (`table_step1.csv`)

| col1 | col2 | col3 |
|---|---:|---:|
| ... | ... | ... |

**Interpretation:** <2–4 sentence paragraph translating the numbers into
domain meaning. Quote specific values from the raw output AND from the CSV.
Connect to the case-study question. Flag uncertainty (confidence intervals,
caveats).>

### 4.2  <Method/Step 2 name>

![One-sentence figure description](<slug>_NN_step2.png)

**Raw output:**

```text
<Paste the actual printed output.>
```

**Interpretation:** <Domain-meaningful interpretation with specific numbers.>

[... one subsection per major analysis step ...]

---

## Figure Inventory

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|
| 1 | `<slug>_01_*.png` | <what it shows> | <main finding visible in the figure> |
| 2 | `<slug>_02_*.png` | <what it shows> | <main finding> |
| ... | ... | ... | ... |

---

## Key Findings

At least **8** numbered findings, each with specific numbers:

1. **<Finding title>:** <Specific numbers and their domain meaning. 2–3 sentences.>
2. **<Finding title>:** <Specific numbers and their domain meaning.>
3. **<Finding title>:** <Specific numbers and their domain meaning.>
4. **<Finding title>:** <Specific numbers and their domain meaning.>
5. **<Finding title>:** <Specific numbers and their domain meaning.>
6. **<Finding title>:** <Specific numbers and their domain meaning.>
7. **<Finding title>:** <Specific numbers and their domain meaning.>
8. **<Finding title>:** <Specific numbers and their domain meaning.>

---

## Surprises and Caveats

Walk through every category in `interpretation-guide.md` § Surprises
checklist. Document each that applies; explicitly note "not applicable" for
any that does not. Categories:

- **Estimator non-determinism** — <bullet, or "not applicable">
- **Sample reductions from adjustment (FE singletons, dropped rows)** — <…>
- **Weighting / aggregation choices** — <…>
- **Effect concentration** — <…>
- **Cosmetic warnings** — <…>
- **Identification assumptions in force** — <…>
- **Pedagogical framing of the source paper** — <…>

---

## Appendix — Reproduction Audit (<Paper short cite>)

> Include this appendix only when the post replicates a paper (Step 2d
> sourced one). Otherwise omit.

| Stage | Our value | <Paper> value | Manuscript location | Notes |
|---|---|---|---|---|
| <Step 1> | <X.X> | <Y.Y> | line N, section/fig label | <direction matches; magnitude differs by ...> |
| <Step 2> | <X.X> | <Y.Y> | line N, section/fig label | <...> |
| ... | ... | ... | ... | ... |

<One-line verdict on overall fidelity of reproduction, e.g. "Reproduction
is faithful at every numerically verifiable point" or an honest accounting
of where it diverges and why.>
```

## Section guidelines

### Metadata block

- Always include the full citation of the methodological reference when the
  script reproduces a paper. Acknowledge the source script ports the
  paper's logic.
- "Status" should distinguish *categories* of warnings, not just count them
  ("Success with warnings: 2 binsreg informational notes, 4 fixest singleton
  drops").

### Execution Summary

- 1–2 paragraphs max. State the "what" clearly.
- For multi-estimator scripts, organize the headline in a **layered
  structure** so the reader sees the gradient of conclusions, not just one
  number.
- End with a categorized `**Warnings:**` bullet list (the equivalent of the
  Surprises checklist's "cosmetic warnings" category, restated as a
  high-level inventory).

### Data Overview

- Include the actual printed output, not a summary of it.
- If the script writes a descriptive-stats CSV (cell counts, frequency
  tables, etc.), include it as an inline markdown table.

### Method Results

- One subsection per major analysis step. Use numbered subsection headings
  (4.1, 4.2, …) so the inline embeds and inventory can refer back unambiguously.
- **Inline figure embed (mandatory if the step has a figure):**
  `![one-sentence description](<slug>_NN_*.png)` at the head of the
  subsection.
- **Raw output block:** fenced ```text block with the literal console output
  from execution_log.txt.
- **Per-section inline table (when results are structured):** below or
  above the raw output, a markdown table sourced from the corresponding CSV.
  Two parallel views — one for skimming (table), one for verification
  (raw output).
- **Interpretation paragraph:** 2–4 sentences, single paragraph, quotes
  specific numbers, translates to domain meaning. Never bullet-list an
  interpretation.

### Figure Inventory

- Every PNG in the directory appears here AND inline in §3d.
- Description is 1 sentence about what the figure shows; key takeaway is
  1 sentence about the main finding visible in the figure.
- Order rows by figure filename (PNG number prefix).

### Key Findings

- At least 8 findings. These become the foundation for the blog post's
  interpretation paragraphs.
- Each finding has a bold title summarizing the headline in five to ten
  words, followed by 2–3 sentences with specific numbers and domain meaning.
- Pull the numbers from the corresponding CSV when possible (full precision)
  instead of from the rounded console output.

### Surprises and Caveats

- The Surprises section is a checklist, not an open-ended bullet list.
- See `interpretation-guide.md` § Surprises checklist for the 7 categories.
- For each category, write a bullet if it applies. Explicitly note "not
  applicable" if it does not. Downstream reviewers should be able to tell
  that the writer considered every category.

### Appendix — Reproduction Audit

- Include only when the post folder contains a source paper (LaTeX preferred
  over PDF, since LaTeX is searchable for `grep`).
- One row per reproduced claim. Cite a specific line number (or section /
  figure label) in the paper.
- End the appendix with a one-line verdict on the fidelity of the
  reproduction.

## Worked example (excerpt from `r_did_ring/results_report.md`)

This is what a complete method subsection looks like in practice. Reproduce
the pattern in every report.

```markdown
### 4.10  Section 6.7 — Nonparametric ring DiD on Linden-Rockoff

![Nonparametric ring DiD: the treatment-effect curve over distance](r_did_ring_10_lr_nonparametric.png)

**Raw output:**

```text
[Section 6.7] Nonparametric ring on Linden-Rockoff
  Number of distance bins: 23
  Estimated TE averaged inside d <= 0.1 mi: -0.132  (-12.4%)
```

### Table — Nonparametric ring step function, first six bins (excerpt of `table_lr_nonparametric.csv`)

| Bin | Distance interval (mi) | τ̂ (log) | τ̂ (%) | SE | 95% CI (log) |
|---:|---|---:|---:|---:|---|
| 1 | [0.011, 0.053] | **−0.231** | **−20.6 %** | 0.056 | [−0.340, −0.121] |
| ... | ... | ... | ... | ... | ... |

**Interpretation:** `binsreg` carves the Linden-Rockoff sample inside 0.3
mi into **23 data-driven distance bins** … [full paragraph quotes specific
numbers from both the raw output and the CSV, translates to dollar / percent,
and flags the curve crossing zero between bins 3 and 4].
```

The four-part rhythm (`![embed]` → ```text block → markdown table → 2–4
sentence interpretation) is the canonical method-subsection shape.

## Worked example — Reproduction Audit row

```markdown
| Parametric ring DiD on LR at default rings (0.1 mi vs 0.3 mi) | **−5.78 %** (coef −0.0595, SE 0.0225, n = 9,029) | "homes between 0 and 0.1 miles decline in value by about **7.5%**" | `Rings.tex` line 263 | Direction matches; magnitude differs by ~1.7 pp. The paper's number is approximate ("about 7.5%"). |
```

Every audit row carries our value with full provenance (coefficient + SE +
n), the paper's quote in its own words, a precise location (filename + line
number), and a one-sentence "Notes" column explaining any gap.
