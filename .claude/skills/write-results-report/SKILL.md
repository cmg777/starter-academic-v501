---
name: write-results-report
description: Execute a data science script and produce a structured results report with interpretations. Bridges the gap between raw code output and the blog post. Use after write-script to capture and interpret all results.
argument-hint: "<post slug, e.g. python_doubleml>"
disable-model-invocation: true
user-invocable: true
---

# Write Results Report: Execute Script and Interpret Outputs

Execute a data science script fresh, capture all outputs, and produce a
structured **results_report.md** with domain-meaningful interpretations of
every number. This skill bridges the gap between raw code output and the
blog post — it translates terminal output into the findings and insights
that drive the narrative.

**What this skill does:**
- Runs the script from scratch and captures all console output
- Inventories every figure and every CSV the script writes (PNGs + tables)
- Extracts statistics from execution_log.txt **and from the exported CSVs**
- Writes results_report.md with raw output, inline tables, and interpretation
  paragraphs
- Produces at least 8 key findings with specific numbers and domain meaning
- Includes a Reproduction Audit appendix when the post replicates a paper

**What this skill does NOT do:**
- Does NOT modify the script (use `write-script` for that)
- Does NOT write or modify the blog post (use `write-post` for that)
- Does NOT create or edit `index.md`
- Does NOT generate new figures (it documents the ones the script produces)

## What "good" looks like

Before writing a single line, read both reference exemplars end to end. They
define the bar this skill is meant to clear:

- `content/post/r_did_ring/results_report.md` — 332 lines, 9 key findings,
  10 inline-embedded figures, full reproduction audit against Butts (2023)
- `content/post/r_did2/results_report.md` — 455 lines, 8 key findings,
  8 inline-embedded figures, reproduction audit against Baker et al. (2025)

A pointer summary with section-line ranges lives at
`.claude/skills/write-results-report/references/exemplars.md`. Read it before
Step 3 if you are uncertain about depth or shape.

---

## Example invocations

```
/project:write-results-report python_doubleml
/project:write-results-report python_dowhy
/project:write-results-report r_did_ring
/project:write-results-report content/post/python_esda2/
```

---

## Deliverables

| Output | Path | Description |
|--------|------|-------------|
| Results report | `content/post/<slug>/results_report.md` | Structured report with raw output + inline tables + interpretations |
| Execution log | `content/post/<slug>/execution_log.txt` | Full console output from the script run |

---

## Step 0 — Pre-flight

1. **Parse arguments.** Extract the post slug or path from `$ARGUMENTS`.
   - If a full path is given (e.g. `content/post/python_dowhy/`), use it directly.
   - If a slug is given (e.g. `python_doubleml`), resolve to `content/post/<slug>/`.

2. **Verify the script exists.** Look for the analysis script in the resolved
   directory:
   - Python: `script.py`
   - Stata: `analysis.do`
   - R: `analysis.R`

   If no script is found, report the error and stop. Suggest running
   `write-script` first.

3. **Read the script** to understand what it does — data source, methods,
   expected outputs, figure names. Note the language and key packages.

4. **List directory contents.** Inventory all existing files in the post
   directory: PNGs, `*.csv` tables, `index.md`, `plan.md`, `script-review.md`,
   any subfolders such as `references/`. The CSV inventory matters for Step 2.

5. **Check for an existing execution_log.txt.** If one exists, note it. The
   script will be re-executed regardless to ensure fresh results.

6. **Check for a source paper.** Look for `references/latex/` directories,
   `*.tex` files, or `*.pdf` files in the post folder. If a source paper
   exists, plan to source the **Reproduction Audit** appendix from it.

7. **Read the two reference exemplars** (in parallel) so you internalize the
   target shape, depth, and rhythm before writing:
   - `content/post/r_did_ring/results_report.md` (newer; recommended as
     primary reference)
   - `content/post/r_did2/results_report.md` (longer; richer audit appendix)

8. **Read the skill reference files** (in parallel):
   - `references/report-structure.md` — template and section guidelines for
     `results_report.md`, including inline-embed and audit-appendix patterns
   - `references/interpretation-guide.md` — what makes a good interpretation,
     checklist, minimum counts, surprises-section checklist
   - `references/exemplars.md` — annotated pointers to the two exemplars

---

## Step 0.5 — Confirm scope (with mid-pipeline exception)

**When to skip confirmation.** If a `plan.md` or `script-review.md` is
present in the post directory, the skill is being invoked sequentially after
`/write-script` and/or `/review-script` — proceed directly to Step 1 without
asking. The user already approved the scope upstream.

**When to ask.** If neither file is present, present the user with a brief
confirmation block before executing:

1. **Script identified:** "I found `script.py` (Python) at
   `content/post/<slug>/script.py`."
2. **Language detected:** "Language: Python / Stata / R."
3. **Script summary:** "The script loads [DATASET], applies [METHOD(S)],
   and generates [N] figures + [M] CSVs."
4. **Audit availability:** "A source paper at `references/latex/paper/X.tex`
   is available for the Reproduction Audit appendix." (or: "No source paper
   detected; audit appendix will be omitted.")
5. **Plan:** "I'll execute the script fresh, capture all outputs to
   `execution_log.txt`, read every exported CSV for full-precision values,
   and produce `results_report.md` with structured interpretations."
6. **Existing files:** If results_report.md already exists: "An existing
   results_report.md will be overwritten."

**Wait for user confirmation before proceeding.**

**Handling responses:**
- "Proceed" / "yes" / brief acknowledgment: continue to Step 1
- "Use existing log" / "don't re-run": skip Step 1, read existing
  execution_log.txt, proceed to Step 2
- "Fix the script first": stop and suggest `write-script`

---

## Step 1 — Execute the script

Run the script fresh from the post directory. Capture all output.

### Python

```bash
cd content/post/<slug>/ && python3 script.py 2>&1 | tee execution_log.txt
```

### Stata

```bash
cd content/post/<slug>/ && stata -b do analysis.do
```

The do-file writes its own `analysis.log`. Copy or rename it:

```bash
cp analysis.log execution_log.txt
```

### R

```bash
cd content/post/<slug>/ && Rscript analysis.R 2>&1 | tee execution_log.txt
```

### Handle execution errors

If the script fails (non-zero exit code):

1. Read the error message from execution_log.txt or stderr.
2. **Do NOT fix the script** — this skill does not modify code.
3. Report the error to the user clearly:
   - Error type (import error, data loading, runtime, convergence)
   - Line number if available
   - Suggest running `write-script` or `review-script` to fix it.
4. **Stop.** Do not proceed to Step 2 with a failed execution.

### Handle warnings

If the script succeeds but produces warnings (deprecation, convergence,
future warnings):

1. Note all warnings — they go into the Execution Summary and Surprises
   sections of the report.
2. Proceed normally.

---

## Step 2 — Inventory outputs

After successful execution, systematically collect everything the script
produced.

### 2a. Read execution_log.txt

Read the full execution log. Identify and extract:

- **Printed tables** (descriptive stats, regression results, model summaries)
- **Scalar statistics** (R-squared, coefficients, p-values, means, counts)
- **Comparison outputs** (method A vs method B, before vs after)
- **Runtime information** (if the script prints timing)
- **Warnings** (convergence, deprecation, data quality, package notes)

### 2b. List all PNG files

```bash
ls -la content/post/<slug>/*.png
```

Record each PNG with:
- Filename
- File size (a sanity check — very small files may indicate empty plots)
- Whether it existed before execution or is newly generated

### 2c. Open every exported CSV (mandatory)

The console log rounds; the CSVs do not. **Open every `table_*.csv` and
`summary.csv` the script writes** and quote full-precision floats in the
report when you need to source a numeric claim.

```bash
ls -la content/post/<slug>/*.csv
```

For each small CSV (< ~50 rows, < ~10 KB), read the full contents into
context with `cat`. For larger CSVs, read the header plus the relevant rows.
The report's per-section inline tables (Step 3) are sourced directly from
these CSVs, not re-typed from the log.

### 2d. Source the audit paper (optional, when present)

If `references/latex/` or any `*.pdf` is in the post folder, the report
should include a Reproduction Audit appendix that compares our values to the
paper's reported numbers with line citations.

Workflow:

1. Identify the `.tex` source (preferred over PDF — searchable).
2. `grep -n` the file for the headline numbers the script tries to reproduce
   (e.g., the parametric coefficient, the qualitative magnitude phrases like
   "around 20 %"). Record each hit with its line number.
3. Build the audit table for Step 3 with one row per reproduced claim.

If a PDF is the only source available, delegate the extraction to an
**Explore agent** (do not read large PDFs into the main context).

### 2e. Identify orphaned or missing figures

- Compare PNGs in the directory against `plt.savefig()` / `ggsave()` /
  `graph export` calls in the script.
- Note any PNGs that the script did NOT generate (pre-existing, possibly stale).
- Note any save calls whose output files are missing (execution may have
  failed silently for that figure).

---

## Step 3 — Write results_report.md

Follow the template in `references/report-structure.md` exactly. Write the
report to `content/post/<slug>/results_report.md`.

The four patterns from Step 0 are mandatory in every report:

1. **Inline figure embeds + Figure Inventory table.** Every PNG must be
   embedded at the head of its corresponding method subsection via
   `![alt text](file.png)` AND must appear as a row in the consolidated
   Figure Inventory table near the end.
2. **Per-section inline tables.** When a section quotes a structured numeric
   result, include a markdown table alongside the raw code-block output.
   Source the values from the corresponding CSV (Step 2c), not from the log.
3. **Raised minimum counts.** At least 8 Key Findings with specific numbers;
   at least one interpretation paragraph per method subsection (target 10+).
4. **Surprises checklist.** Walk through the categories in
   `references/interpretation-guide.md` § Surprises checklist; document every
   category that applies; explicitly note "none" for any that do not.

### 3a. Metadata block

Fill in all metadata fields from the execution:

- **Script:** filename and line count
- **Executed:** date of this run
- **Status:** Success / Success with warnings — be specific about warning
  categories
- **Runtime:** if available from the log, otherwise "not recorded"
- **Language:** Python/Stata/R with version
- **Key packages:** list with versions (extract from import statements and
  any version-printing in the log)
- **Methodological reference:** if the post replicates a paper, full citation
  with DOI/arXiv URL; acknowledge that the script ports its logic

### 3b. Execution Summary

Write 1–2 paragraphs covering:
- What the script does (dataset, method, research question)
- Whether execution was clean or had warnings
- The headline finding(s) — when there are multiple estimators or stages,
  state the **headline structure** (e.g., a three-layer headline:
  "parametric / sensitivity / nonparametric")

End the section with a **Warnings:** bullet list summarizing each category
of warning observed in the run.

### 3c. Data Overview

- Paste the actual printed output from the script (shape, columns,
  `.head()`, `.describe()`, etc.)
- Include any descriptive-stats CSV as an inline markdown table
- Write an **Interpretation** paragraph: sample size, geographic or temporal
  coverage, variable ranges, notable patterns in descriptive stats. Include
  specific numbers.

### 3d. Method Results

Create one subsection per major analysis step in the script. For each:

1. **Subsection heading:** numbered, descriptive name of the step
2. **Inline figure embed** (mandatory if the step has a figure):
   `![one-line description](r_did_ring_NN_*.png)`
3. **Raw output:** paste the actual printed output from execution_log.txt
   inside a fenced ```text block
4. **Optional inline table:** markdown table sourced from the corresponding
   CSV (use this whenever the result is structured)
5. **Interpretation paragraph:** translate the numbers into domain meaning
   following `references/interpretation-guide.md`

Common subsections (adapt to the actual script):
- Exploratory analysis / correlations
- Baseline or naive model
- Core method results (main estimation)
- Robustness checks or alternative specifications
- Model comparison

### 3e. Figure Inventory

Build a single consolidated table — one row per PNG file:

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|

- **Description:** 1 sentence about what the figure shows
- **Key takeaway:** 1 sentence about the main finding visible in the figure
- Every PNG that appears as an inline embed in §3d must also appear here.
- View each PNG (via Read) to verify it rendered correctly.

### 3f. Key Findings

Write **at least 8** key findings. Each must:

- Have a bold title
- Include specific numbers from the execution output or CSVs
- Translate those numbers into domain-meaningful statements
- Connect to the research question or case study

These findings become the foundation for the blog post's interpretation
paragraphs. Make them concrete and actionable.

### 3g. Surprises and Caveats

Walk through every category in
`references/interpretation-guide.md` § Surprises checklist:

1. Estimator non-determinism (random subsample, bootstrap seed, etc.)
2. Sample reductions from adjustment (FE singletons, missing-value drops, etc.)
3. Weighting / aggregation choices that affect the headline at the third
   significant figure
4. Effect concentration (whether the average is driven by a few extreme
   bins / cells / units)
5. Cosmetic warnings the reader might mistake for problems
6. Identification assumptions in force (no-anticipation, parallel trends,
   SUTVA, etc.)
7. Pedagogical framing — when the original paper explicitly disclaims
   definitiveness, say so

For each category, write a bullet if it applies. If a category does not
apply to this report, state so briefly so the writer (and downstream
reviewer) know it was considered.

### 3h. Appendix — Reproduction Audit (when source paper is available)

When Step 2d sourced a paper, include this appendix. Template:

```markdown
## Appendix — Reproduction Audit (<Paper short cite>)

| Stage | Our value | <Paper> value | Manuscript location | Notes |
|---|---|---|---|---|
| ... | ... | ... | line N, section / fig label | direction matches; magnitude differs by X pp |
```

One row per reproduced claim. Each row must cite a specific line number
(or section/figure label) in the source. End the appendix with a one-line
summary verdict: "Reproduction is faithful at every numerically verifiable
point" or, if not, an honest accounting of where it diverges and why.

---

## Step 4 — Review interpretations

After writing results_report.md, review it against
`references/interpretation-guide.md`. Verify that each interpretation
paragraph meets all seven criteria:

1. **Quotes specific numbers** — no vague "the result was significant"
2. **Explains in plain language** — accessible to a non-specialist
3. **Translates to domain meaning** — what does it mean for the case study?
4. **Connects to the research question** — does it advance understanding?
5. **Is a single continuous paragraph** — 2–4 sentences, no bullet points
6. **Flags uncertainty** — confidence intervals, caveats, limitations
7. **Anchors to a domain quantity** — dollars, percent, count of observations

### Minimum counts (raised gates)

- At least **10 interpretation paragraphs** across all sections (target: one
  per method subsection plus the header / data / surprises / appendix
  sections)
- At least **8 Key Findings** with specific numbers
- Every figure in the inventory has both a description and a key takeaway,
  AND is also embedded inline in its method subsection

### Flag surprising results

Any result that is unexpected, counterintuitive, or unusually large/small
must be flagged prominently in:
- The interpretation paragraph where it appears
- The Surprises and Caveats section (under the appropriate category)
- The Key Findings (if it is a major finding)

---

## Step 5 — Verify

Before delivering, run a final verification pass:

1. **File saved:** `results_report.md` exists in the post directory.

2. **Numbers verified:** Spot-check at least 5 numbers quoted in
   interpretation paragraphs against `execution_log.txt` AND the
   corresponding CSV. They must match (or within stated rounding).

3. **Figure inventory complete:** Every PNG in the directory appears in
   the Figure Inventory table AND is embedded inline in its method
   subsection. No missing entries, no phantom files.

4. **Minimum key findings:** At least 8 key findings present, each with
   specific numbers.

5. **Minimum interpretations:** At least 10 interpretation paragraphs
   present across all sections.

6. **Audit appendix present** (if a source paper exists in the post folder).

7. **Surprises checklist walked:** Each of the 7 categories appears in
   §3g — either with a substantive bullet or with an explicit "not
   applicable" note.

8. **Execution log saved:** `execution_log.txt` is present and non-empty
   in the post directory.

9. **No script modifications:** Confirm that `script.py` / `analysis.do` /
   `analysis.R` was NOT modified during this process.

10. **CSV pull-through honored:** Each per-section inline table matches the
    corresponding CSV's full-precision values (not log-rounded values).

Report the verification results to the user:

```
Results report complete.
- Saved: content/post/<slug>/results_report.md (N lines)
- Execution log: content/post/<slug>/execution_log.txt (N lines)
- Figures: N inline embeds + N inventory rows (must match)
- Key findings: N (minimum 8)
- Interpretation paragraphs: N (minimum 10)
- Surprises checklist: 7/7 categories walked
- Reproduction audit: present / not applicable
- Numbers spot-checked: N/N verified against execution log AND CSVs
```

---

## Step 6 — Follow-up

After delivering the report, offer the user next steps:

"Would you like me to:
- Run `/project:review-results-report <slug>` to quality-check the report?
- Run `/project:write-post <slug>` to draft the blog post using these results?
- Re-run the script with different parameters and update the report?
- Elaborate on any specific finding or adjust an interpretation?"

---

## Appendix — Reference exemplars

The two reports that define the quality bar for this skill:

| Exemplar | Lines | Strengths |
|---|---:|---|
| `content/post/r_did_ring/results_report.md` | 332 | Three-layer headline; 9 Key Findings; 10 inline-embedded figures; Butts (2023) audit with line citations |
| `content/post/r_did2/results_report.md` | 455 | Reproduces a flagship sign-reversal numerically to 3 decimals; 8 Key Findings; rich audit against Baker et al. (2025) |

See `references/exemplars.md` for section-by-section line ranges and
explicit "what to imitate" callouts.
