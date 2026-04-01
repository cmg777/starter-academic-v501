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
blog post -- it translates terminal output into the findings and insights
that drive the narrative.

**What this skill does:**
- Runs the script from scratch and captures all console output
- Inventories every figure generated (PNGs with sizes)
- Extracts tables, statistics, and coefficients from the execution log
- Writes results_report.md with raw output AND interpretation paragraphs
- Produces at least 5 key findings with specific numbers and domain meaning

**What this skill does NOT do:**
- Does NOT modify the script (use `write-script` for that)
- Does NOT write or modify the blog post (use `write-post` for that)
- Does NOT create or edit `index.md`
- Does NOT generate new figures (it documents the ones the script produces)

---

## Example invocations

```
/project:write-results-report python_doubleml
/project:write-results-report python_dowhy
/project:write-results-report python_pyfixest
/project:write-results-report content/post/python_esda2/
```

---

## Deliverables

| Output | Path | Description |
|--------|------|-------------|
| Results report | `content/post/<slug>/results_report.md` | Structured report with raw output + interpretations |
| Execution log | `content/post/<slug>/execution_log.txt` | Full console output from the script run |

---

## Step 0 -- Pre-flight

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

3. **Read the script** to understand what it does -- data source, methods,
   expected outputs, figure names. Note the language and key packages.

4. **List directory contents.** Inventory all existing files in the post
   directory (PNGs, CSVs, index.md, etc.) to establish a baseline before
   execution.

5. **Check for existing execution_log.txt.** If one exists, note it. The
   script will be re-executed regardless to ensure fresh results.

6. **Read reference files** (in parallel):
   - `references/report-structure.md` -- template and section guidelines
     for results_report.md
   - `references/interpretation-guide.md` -- what makes a good interpretation,
     checklist, minimum counts

---

## Step 0.5 -- Confirm scope

Before executing anything, present the user with a brief confirmation:

1. **Script identified:** "I found `script.py` (Python) at
   `content/post/<slug>/script.py`."

2. **Language detected:** "Language: Python / Stata / R."

3. **Script summary:** "The script loads [DATASET], applies [METHOD(S)],
   and generates [N] figures."

4. **Plan:** "I'll execute the script fresh, capture all outputs to
   `execution_log.txt`, and produce `results_report.md` with structured
   interpretations of every result."

5. **Existing files:** If results_report.md already exists: "An existing
   results_report.md will be overwritten."

**Wait for user confirmation before proceeding.**

**Handling responses:**
- "Proceed" / "yes" / brief acknowledgment: continue to Step 1
- "Use existing log" / "don't re-run": skip Step 1, read existing
  execution_log.txt, proceed to Step 2
- "Fix the script first": stop and suggest `write-script`

---

## Step 1 -- Execute the script

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
2. **Do NOT fix the script** -- this skill does not modify code.
3. Report the error to the user clearly:
   - Error type (import error, data loading, runtime, convergence)
   - Line number if available
   - Suggest running `write-script` or `review-script` to fix it.
4. **Stop.** Do not proceed to Step 2 with a failed execution.

### Handle warnings

If the script succeeds but produces warnings (deprecation, convergence,
future warnings):

1. Note all warnings -- they go into the Execution Summary and Surprises
   sections of the report.
2. Proceed normally.

---

## Step 2 -- Inventory outputs

After successful execution, systematically collect everything the script
produced.

### 2a. Read execution_log.txt

Read the full execution log. Identify and extract:

- **Printed tables** (descriptive stats, regression results, model summaries)
- **Scalar statistics** (R-squared, coefficients, p-values, means, counts)
- **Comparison outputs** (method A vs method B, before vs after)
- **Runtime information** (if the script prints timing)
- **Warnings** (convergence, deprecation, data quality)

### 2b. List all PNG files

```bash
ls -la content/post/<slug>/*.png
```

Record each PNG with:
- Filename
- File size (as a sanity check -- very small files may indicate empty plots)
- Whether it existed before execution or is newly generated

### 2c. Identify orphaned or missing figures

- Compare PNGs in the directory against `plt.savefig()` calls in the script.
- Note any PNGs that the script did NOT generate (pre-existing, possibly stale).
- Note any `savefig()` calls whose output files are missing (execution may
  have failed silently for that figure).

---

## Step 3 -- Write results_report.md

Follow the template in `references/report-structure.md` exactly. Write the
report to `content/post/<slug>/results_report.md`.

### 3a. Metadata block

Fill in all metadata fields from the execution:

- **Script:** filename
- **Executed:** date and time of this run
- **Status:** Success or Success with warnings
- **Runtime:** if available from the log, otherwise "not recorded"
- **Language:** Python/Stata/R with version
- **Key packages:** list with versions (extract from import statements
  and any version-printing in the log)

### 3b. Execution Summary

Write 1-2 paragraphs covering:
- What the script does (dataset, method, research question)
- Whether execution was clean or had warnings
- The headline finding in one sentence

### 3c. Data Overview

- Paste the actual printed output from the script (shape, columns,
  `.head()`, `.describe()`, etc.)
- Write an **Interpretation** paragraph: sample size, geographic or
  temporal coverage, variable ranges, notable patterns in descriptive
  stats. Include specific numbers.

### 3d. Method Results

Create one subsection per major analysis step in the script. For each:

1. **Subsection heading:** descriptive name of the step
2. **Raw output:** paste the actual printed output from execution_log.txt
3. **Interpretation paragraph:** translate the numbers into domain meaning
   following `references/interpretation-guide.md`

Common subsections (adapt to the actual script):
- Exploratory analysis / correlations
- Baseline or naive model
- Core method results (main estimation)
- Robustness checks or alternative specifications
- Model comparison

### 3e. Figure Inventory

Build a table with one row per PNG file:

| # | Filename | Description | Key takeaway |
|---|----------|-------------|--------------|

- **Description:** 1 sentence about what the figure shows
- **Key takeaway:** 1 sentence about the main finding visible in the figure
- Infer descriptions from the script's plotting code and figure filenames
- View each PNG to verify it rendered correctly

### 3f. Key Findings

Write at least 5 key findings. Each must:

- Have a bold title
- Include specific numbers from the execution output
- Translate those numbers into domain-meaningful statements
- Connect to the research question or case study

These findings become the foundation for the blog post's interpretation
paragraphs. Make them concrete and actionable.

### 3g. Surprises and Caveats

Document anything the blog post writer should know:
- Unexpected results (sign, magnitude, significance)
- Convergence issues or optimizer warnings
- Sensitivity to parameters or random seeds
- Very low or very high R-squared values
- Large confidence intervals or standard errors
- Data quality issues discovered during execution
- Limitations of the method as applied to this data

If nothing surprising, state "No unexpected results" and note the key
assumptions underlying the analysis.

---

## Step 4 -- Review interpretations

After writing results_report.md, review it against
`references/interpretation-guide.md`. Verify that each interpretation
paragraph meets all six criteria:

1. **Quotes specific numbers** -- no vague "the result was significant"
2. **Explains in plain language** -- accessible to a non-specialist
3. **Translates to domain meaning** -- what does it mean for the case study?
4. **Connects to the research question** -- does it advance understanding?
5. **Is a single continuous paragraph** -- 2-4 sentences, no bullet points
6. **Flags uncertainty** -- confidence intervals, caveats, limitations

### Minimum counts

- At least **5 interpretation paragraphs** across all sections
- At least **5 key findings** with specific numbers
- Every figure in the inventory has both a description and a key takeaway

### Flag surprising results

Any result that is unexpected, counterintuitive, or unusually large/small
must be flagged prominently in:
- The interpretation paragraph where it appears
- The Surprises and Caveats section
- The Key Findings (if it is a major finding)

---

## Step 5 -- Verify

Before delivering, run a final verification pass:

1. **File saved:** `results_report.md` exists in the post directory.

2. **Numbers verified:** Spot-check at least 3 numbers quoted in
   interpretation paragraphs against the actual execution_log.txt.
   They must match exactly (or within stated rounding).

3. **Figure inventory complete:** Every PNG in the directory appears in
   the Figure Inventory table. No missing entries, no phantom files.

4. **Minimum key findings:** At least 5 key findings present, each with
   specific numbers.

5. **Minimum interpretations:** At least 5 interpretation paragraphs
   present across all sections.

6. **Execution log saved:** execution_log.txt is present and non-empty
   in the post directory.

7. **No script modifications:** Confirm that script.py / analysis.do /
   analysis.R was NOT modified during this process.

Report the verification results to the user:

```
Results report complete.
- Saved: content/post/<slug>/results_report.md
- Execution log: content/post/<slug>/execution_log.txt (N lines)
- Figures documented: N PNGs
- Key findings: N (minimum 5)
- Interpretation paragraphs: N (minimum 5)
- Numbers spot-checked: 3/3 verified against execution log
```

---

## Step 6 -- Follow-up

After delivering the report, offer the user next steps:

"Would you like me to:
- Run `/project:review-results-report <slug>` to quality-check the report?
- Run `/project:write-post <slug>` to draft the blog post using these results?
- Re-run the script with different parameters and update the report?
- Elaborate on any specific finding or adjust an interpretation?"
