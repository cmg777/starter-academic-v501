---
name: write-script
description: Write and execute a data science script (Python/Stata/R) for carlos-mendez.org. Produces script.py, execution_log.txt, and figures. Use when starting a new data science tutorial or analysis.
argument-hint: "<topic> dataset: <dataset name or URL> [references: <URLs>] [language: python|stata|r] [theme: light|dark]"
disable-model-invocation: true
user-invocable: true
---

# Write Script: Data Science Script Generator and Executor

Write, execute, and verify a data science script that produces figures and
printed results. This skill is the starting point for new tutorials -- it
produces the **computational backbone** (script, figures, execution log) that
downstream skills (`write-results-report`, `write-post`) consume.

**What this skill does:** writes the script, installs dependencies, executes it,
captures stdout/stderr to `execution_log.txt`, and verifies figure output.

**What this skill does NOT do:** write `index.md`, write `results_report.md`,
write front matter, write interpretation paragraphs, or generate `featured.png`.
Those are handled by separate skills.

## Example invocations

```
/project:write-script double machine learning dataset: DS4Bolivia references: https://docs.doubleml.org/stable/intro/intro.html
/project:write-script k-means clustering dataset: https://archive.ics.uci.edu/ml/datasets/Iris language: python theme: dark
/project:write-script spatial regression dataset: PySAL example data references: https://pysal.org/spreg/
/project:write-script RCT evaluation with panel data dataset: dataSIM4RCT.dta language: stata references: causal.pdf
```

## Site color palette

These colors must be used consistently in all generated figures.

| Name | Hex | Use in plots |
|------|-----|-------------|
| Steel blue | `#6a9bcc` | Primary data (bars, scatter, histograms) |
| Warm orange | `#d97757` | Reference lines, secondary series |
| Near black | `#141413` | Tertiary elements, text annotations |
| Teal | `#00d4c8` | Highlights (use sparingly) |

### Dark theme palette

For posts that use dark-background figures (requested via `theme: dark` or
confirmed during scope). Reference implementation: `content/post/python_fwl/script.py`.

| Name | Hex | Use in plots |
|------|-----|-------------|
| Dark navy | `#0f1729` | Figure + axes background (`facecolor`) |
| Grid line | `#1f2b5e` | Grid lines (subtle contrast on dark bg) |
| Light text | `#c8d0e0` | Axis labels, tick labels, legend text |
| White text | `#e8ecf2` | Titles, bold annotations |

## Deliverables

### Python (default)

| Output | Path |
|--------|------|
| Script | `content/post/python_<slug>/script.py` |
| Execution log | `content/post/python_<slug>/execution_log.txt` |
| Figures (>= 3) | `content/post/python_<slug>/<slug>_*.png` |

### Stata

| Output | Path |
|--------|------|
| Do-file | `content/post/stata_<slug>/analysis.do` |
| Stata log | `content/post/stata_<slug>/analysis.log` |
| Figures | `content/post/stata_<slug>/stata_<slug>_*.png` |

### R

| Output | Path |
|--------|------|
| Script | `content/post/r_<slug>/analysis.R` |
| Execution log | `content/post/r_<slug>/execution_log.txt` |
| Figures (>= 3) | `content/post/r_<slug>/<slug>_*.png` |

---

## Phase 1: Pre-flight

### 1.1 Parse arguments

Parse `$ARGUMENTS` to extract:

- **Topic** -- everything before `dataset:`
- **Dataset** -- everything between `dataset:` and the next keyword (`references:`, `language:`, `theme:`) or end of string
- **References** -- everything after `references:` (optional). URLs, paper titles, or filenames of PDFs in the post folder
- **Language** -- explicit `language:` argument, or infer from topic keywords, dataset extension (`.dta` = Stata, `.R` = R). Default: Python
- **Figure theme** -- explicit `theme:` argument (`light` or `dark`). Default: light
- **Topic slug** -- lowercase, underscores, no stopwords (e.g., "double machine learning" -> `doubleml`)

### 1.2 Fetch references

Use **WebFetch** to read each reference URL. Extract the library's API, key
classes/functions, recommended usage patterns, and default parameters. This is
critical for producing accurate, idiomatic code.

### 1.3 Fetch dataset information

If the dataset is a URL, use WebFetch to understand its structure (columns,
types, size). If it is a named dataset, look up the standard loading pattern.
Read `references/data-sources.md` for data loading patterns:

- URL download with local cache
- Named datasets (sklearn, seaborn, World Bank)
- DS4Bolivia joins on `asdf_id`
- Simulated DGP for method tutorials
- User-described data

### 1.4 Check pre-existing materials

If the post folder already exists, check for reference materials: markdown notes,
PDFs, datasets, code files, `plan.md`. These are the foundation for the script.
Read them to understand the intended content and scope.

### 1.5 Identify dependencies

Determine which packages the topic requires:

- **Python:** note `pip install` commands needed before execution
- **Stata:** note `ssc install` / `net install` commands with `capture` prefix
- **R:** note packages for `pacman::p_load()`

### 1.6 Read reference files

Load these reference files to guide script construction:

- `references/data-sources.md` -- data loading patterns
- `references/script-templates.md` -- language-specific script structure
- `references/figure-conventions.md` -- figure styling, dark theme setup, color families
- `references/causal-inference.md` -- **only if** the topic involves causal methods (ATE/ATT estimand precision, randomized vs observational framing)

### 1.7 Handling PDF reference materials

PDFs (academic papers, software manuals) are common reference inputs but can
be very large. **Mishandling them will exhaust the context window.** Follow
these rules strictly:

1. **Never read an entire PDF into the main conversation.** Large PDFs (>50
   pages) can consume 50,000+ tokens. Delegate PDF reading to an **Explore
   agent**, which has its own context window.
2. **Targeted extraction only.** Extract only the specific sections needed
   (typically 5--15 pages). Use the table of contents to find relevant pages
   first, then read only those pages.
3. **Preferred workflow:** Extract PDF outline -> search for keywords ->
   read 5--10 relevant pages -> summarize key equations and definitions.
4. **Use agents for PDF-heavy research.** Launch an Explore agent with a
   specific task: "Read pages 560--580 of causal.pdf and extract the formal
   equations for RA, IPW, and AIPW estimators."
5. **Clean up PDFs before committing.** Reference PDFs must NOT be committed
   to the git repository. Delete them from the post directory before
   committing, or add them to `.gitignore`.

---

## Phase 2: Confirm scope

**This step is MANDATORY.** Before writing any code, present the user with a
formatted confirmation block and **wait for their response**. Do NOT skip
this step. The confirmation must include all 7 items below:

```
SCOPE CONFIRMATION
==================

1. TOPIC: [TOPIC] using [DATASET].
   Analysis question: "[QUESTION]"

2. LANGUAGE: [Python / R / Stata] — [reasoning]

3. FIGURE THEME: [Light / Dark navy] — [reasoning]

4. SCRIPT SECTIONS:
   - 0. Setup (packages, seed, colors)
   - 1. Data loading + CSV export
   - 2. Data preparation + CSV export
   - 3. [Baseline / benchmark]
   - 4. [Core method]
   - 5. [Results / comparison]
   - 6. [Robustness / sensitivity]
   - 7. Custom visualizations
   - 8. Summary
   Estimated: ~N PNG figures, ~N CSV tables

5. DELIVERABLES:
   - analysis.R (or script.py / analysis.do)
   - execution_log.txt
   - ~N PNG figures
   - ~N CSV tables (source data + processed data + result tables)
   - README.md (auto-generated artifact inventory)
   - plan.md (this scope document)

6. FRAMING: [Causal / Predictive / Descriptive] — [reasoning].
   The script will include a comment block clarifying the estimand
   or stating the analysis is descriptive.

7. [AMBIGUITY] (if any): [question for the user]

Proceed? [yes / adjust]
```

**Handling responses:**
- "Looks good" / "proceed" / no changes: continue with stated defaults
- Specific adjustments: incorporate them and proceed
- Major reframing requested: revise the scope and re-present the summary

**Plan archival (MANDATORY):** After the user confirms, save the approved
scope as `plan.md` in the post directory. This documents the design decisions
for future reference and downstream skill consumption. The plan.md should
contain the confirmed scope block above plus any user adjustments.

---

## Phase 3: Core workflow

### Step 1: Create post directory and write script

Create the post directory if it does not exist:

```bash
mkdir -p content/post/<lang>_<slug>
```

Write the script file following `references/script-templates.md`. The script
must follow this structure:

1. **Docstring** -- title, description, usage, outputs, references
2. **Imports** -- all imports at the top, grouped by standard library / third-party / project
3. **Configuration block** -- `RANDOM_SEED = 42`, site color palette constants, data config (`DATA_URL`, `CACHE_PATH`, `TARGET`, `FEATURE_COLS`)
4. **Section dividers** -- use `# ── Section Name ──...` comment blocks to separate logical sections
5. **Data loading** -- with local cache pattern, print shape and basic stats
6. **EDA** -- at least 1 figure, print summary statistics
7. **Baseline** -- simple approach to establish a benchmark
8. **Core method** -- main analysis (1--3 sections depending on complexity)
9. **Results and comparison** -- summary table, comparison chart
10. **Robustness / validation** -- sensitivity checks, alternative specifications
11. **CSV exports** -- export all artifacts as CSV files (see export conventions below)
12. **README.md** -- generate a README documenting the project status and all outputs
13. **Final print** -- `print("\n=== Script completed successfully ===")`

**Language-specific conventions:**

**Python (`script.py`):**
- Use `np.random.seed(RANDOM_SEED)` for global seed
- Use `np.random.default_rng(seed)` inside DGP functions
- Print statements for all key results (shapes, stats, coefficients, metrics)
- `plt.savefig("<slug>_<name>.png", dpi=300, bbox_inches="tight")`
- `plt.show()` after every figure (allows visual inspection in interactive use)
- Dark theme: set `plt.rcParams` once at the top per `references/figure-conventions.md`

**Stata (`analysis.do`):**
- `clear all`, `set more off`, `set seed 42`
- `capture ssc install` / `capture net install` for dependencies
- `capture log close` then `log using "analysis.log", replace text`
- `preserve` / `restore` to manage data scope between sections
- `graph export "<slug>_<name>.png", replace width(2400)`
- `log close` at the end

**R (`analysis.R`):**
- `set.seed(42)`
- `if (!require("pacman")) install.packages("pacman")`
- `pacman::p_load(tidyverse, ggplot2, ...)`
- `ggsave("<slug>_<name>.png", width = 8, height = 6, dpi = 300)`

**Export conventions -- all scripts must export artifacts as files:**

Scripts must export all intermediate and final outputs so downstream skills
(write-results-report, write-post) can consume structured data instead of
parsing console output. All exports go to the post root directory (same
location as PNGs).

1. **Figures** → PNG files (already required, dpi=300)
2. **Tables** (descriptive stats, regression results, BMA tables, comparison
   tables) → CSV files using `write_csv()` / `pd.to_csv()` / `outsheet`
3. **Source datasets** → CSV export of every dataset loaded by the script
   (e.g., `write_csv(df, "raw_data.csv")`)
4. **Processed datasets** → CSV export of the final transformed data used
   in the analysis (e.g., `write_csv(data_prepared, "data_prepared.csv")`)

**README.md generation:**

After script execution, generate a `README.md` in the post directory that
documents the project status and all generated artifacts:

- Project title and overview (topic, dataset, methods)
- Pipeline progress checklist (script done, report/post/infographic pending)
- Table of generated figures (filename + description)
- Table of generated CSV files (filename + description)
- Table of datasets (filename + rows + cols + description)
- List of R/Python/Stata packages used

The README is updated by each downstream skill as the pipeline progresses.

**Causal inference scripts** (when applicable):
- Define the estimand (ATE/ATT) in a comment block before the estimation section
- Flag estimand shifts between methods (e.g., PS matching targets ATT, IPW targets ATE)
- Randomized data: frame covariate adjustment as **precision improvement**, not bias removal
- Observational data: frame adjustment as **confounding control**
- Use color families for multi-method comparison charts (see `references/figure-conventions.md`)

### Step 2: Execute the script

Follow `references/execution-protocol.md` for execution details.

**Install dependencies first** (if needed):

```bash
# Python
pip install <package1> <package2>

# R uses pacman::p_load() (auto-installs)
# Stata uses capture ssc install (idempotent)
```

**Execute and capture output:**

```bash
# Python
cd content/post/python_<slug>/ && python3 script.py 2>&1 | tee execution_log.txt

# Stata
cd content/post/stata_<slug>/ && "/Applications/Stata 18.0/StataMP.app/Contents/MacOS/stata-mp" -b do analysis.do

# R
cd content/post/r_<slug>/ && Rscript analysis.R 2>&1 | tee execution_log.txt
```

**Post-execution checks:**

1. Verify exit code 0 (script completed without errors)
2. List all `.png` files -- confirm at least 3 figures generated
3. Check that `execution_log.txt` (or `analysis.log`) contains the final
   "Script completed successfully" message
4. Scan for warnings: deprecation warnings, convergence warnings, data warnings
5. Verify no `featured.png` was generated (user adds manually)

**If the script fails:**

1. Read the error message from execution_log.txt or stderr
2. Diagnose the root cause (missing package, bad URL, deprecated API, memory)
3. Fix the script
4. Re-execute and verify again
5. **Never deliver a script that does not execute cleanly**

### Step 3: R-specific cleanup

For R scripts, check for and remove the `Rplots.pdf` artifact that R's
`png()` function can leave behind:

```bash
rm -f content/post/<lang>_<slug>/Rplots.pdf
```

### Step 4: Generate README.md

Read `references/readme-template.md` and generate `README.md` in the post
directory. Populate it with actual values from the execution:

- List every PNG file with a 1-sentence description
- List every CSV file with a 1-sentence description
- Include actual row/column counts for dataset CSVs
- Set pipeline progress: `[x] Script`, `[ ]` for all others

### Step 5: Post-execution verification and report

Run the verification checklist from `references/execution-protocol.md` and
**display the results to the user**. This report is MANDATORY -- do not skip.

```
VERIFICATION REPORT
-------------------
[PASS/FAIL] Script file exists (<filename>)
[PASS/FAIL] Execution log complete (N lines)
[PASS/FAIL] N PNG figures generated (>= 3 required)
[PASS/FAIL] N CSV files exported
[PASS/FAIL] No errors in log
[PASS/FAIL] Site colors used in custom figures
[PASS/FAIL] DPI = 300 on all custom figures
[PASS/FAIL] No featured.png generated
[PASS/FAIL] RANDOM_SEED = 42 set
[PASS/FAIL] Final success message present
[PASS/FAIL] README.md generated
[PASS/FAIL] plan.md saved
[WARN/OK]   R artifacts cleaned up (Rplots.pdf)
[WARN/OK]   Non-fatal warnings: N (version mismatch, masking)
```

If any check fails, describe the issue and fix it before delivering.

**Detailed deliverables summary:**

```
Script executed successfully at content/post/<lang>_<slug>/

DELIVERABLES:
- <script filename> (N lines)
- execution_log.txt (N lines)
- N PNG figures:
  - <file1>.png -- <description>
  - <file2>.png -- <description>
  - ...
- N CSV tables:
  - <file1>.csv -- <description>
  - <file2>.csv -- <description>
  - ...
- README.md (artifact inventory)
- plan.md (approved scope)
```

---

## Follow-up

After delivering the verification report, offer the user next steps:

"The script is ready at `content/post/<lang>_<slug>/`. Want me to:
- Run `/project:review-script` for a code quality review?
- Run `/project:write-results-report` to generate the interpretation report?
- Adjust the script (add sections, change figures, modify parameters)?
- Re-execute after manual edits?"
