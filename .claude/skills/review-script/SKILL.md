---
name: review-script
description: Expert review of a data science script -- use before generating a results report to catch code errors, reproducibility issues, and quality problems. Runs the code, checks output, and produces a scored review report. Read-only.
argument-hint: "<post slug, e.g. python_doubleml>"
disable-model-invocation: true
user-invocable: true
---

# Review Script: Expert Code Review for Data Science Scripts

Single thorough review of a data science script (Python, Stata, or R). Runs the
code, checks every dimension of quality, and produces an inline scored report
with verdict, issues table, and priority action items.

**What this skill does:**
- Runs the script fresh and verifies execution
- Reviews 8 quality dimensions (execution, structure, code quality,
  reproducibility, figures, data handling, statistical correctness, causal
  inference)
- Produces a scored review report with ACCEPT / MINOR REVISION / MAJOR REVISION
  verdict

**What this skill does NOT do:**
- Does NOT modify any files (read-only review)
- Does NOT review the blog post (`index.md`) -- use `referee-post` for that
- Does NOT write or modify `results_report.md` -- use `write-results-report`
  for that

---

## Example invocations

```
/project:review-script python_doubleml
/project:review-script python_fwl
/project:review-script stata_rct
```

---

## Phase 1: Pre-flight

### 1.1 Parse slug and locate script

Parse `$ARGUMENTS` to extract the post slug. Determine the language and script
path:

| Language | Slug pattern | Script path |
|----------|-------------|-------------|
| Python | `python_*` | `content/post/<slug>/script.py` |
| Stata | `stata_*` | `content/post/<slug>/analysis.do` |
| R | `r_*` | `content/post/<slug>/analysis.R` |

If the slug does not start with a language prefix, check the post directory for
whichever script file exists (`script.py`, `analysis.do`, `analysis.R`).

**If no script file is found, stop and tell the user.** Do not proceed without a
script to review.

### 1.2 Inventory the page bundle

List all files in the post directory. Note:

- Script file (required)
- Execution log (`execution_log.txt` or `analysis.log`)
- PNG figures (count and names)
- Data files (CSVs, cached datasets)
- Other deliverables (`results_report.md`, `plan.md`, `index.md`)

### 1.3 Read reference files

Load the review reference files to calibrate the review:

- `references/review-checklist.md` -- all 8 review dimensions with checklists
- `references/scoring-and-criteria.md` -- severity definitions, verdict criteria,
  reviewer guidelines

### 1.4 Read the full script

Read the entire script file into context. This is the primary artifact under
review. Note the total line count.

---

## Phase 2: Confirm scope

Before starting the review, announce what will happen:

"**Reviewing:** `<script path>` (<N> lines, <language>)
**Page bundle:** <list of other files found>
**Running full review including code execution.**"

Do NOT wait for user confirmation -- proceed directly to the review. This is a
single-pass skill; there is no scope to negotiate.

---

## Phase 3: Core workflow -- Review dimensions

Execute a single thorough pass through all 8 review dimensions from
`references/review-checklist.md`. For each dimension, check every item and
record issues with severity, location, and suggested fix.

### Dimension 1: Execution

Run the script fresh and capture output:

```bash
# Python
cd content/post/<slug>/ && python3 script.py 2>&1 | tee execution_log_review.txt

# Stata
cd content/post/<slug>/ && "/Applications/Stata 18.0/StataMP.app/Contents/MacOS/stata-mp" -b do analysis.do

# R
cd content/post/<slug>/ && Rscript analysis.R 2>&1 | tee execution_log_review.txt
```

Check:
- Exit code is 0 (script runs without errors)
- All expected figures are generated (list PNGs after execution)
- Printed output is complete (final success message present)
- No deprecation warnings, convergence warnings, or data warnings
- Execution log matches what the script claims to produce

After execution checks are complete, clean up the review log:
```bash
rm content/post/<slug>/execution_log_review.txt
```

### Dimension 2: Structure and organization

- Docstring/header present with title, description, usage, outputs, references
- Configuration block near the top (`RANDOM_SEED`, colors, data paths, column names)
- Section dividers (`# -- Section Name --...`) separate logical sections
- Logical flow: data loading -> EDA -> baseline -> core method -> results -> validation
- No dead code or commented-out experiments

### Dimension 3: Code quality

- Variable names are descriptive and consistent
- Comments explain "why" not "what" (no `# increment i by 1`)
- No overly clever one-liners -- prefer clarity over brevity
- Functions used for repeated logic (DRY principle)
- Imports at the top, organized (stdlib / third-party / local)
- No unused imports

### Dimension 4: Reproducibility

- `RANDOM_SEED` set at the top and used consistently
- Data is cached locally after download (no re-downloading on every run)
- `np.random.seed()` or `np.random.default_rng()` used appropriately
- Results are deterministic across runs (compare key numbers if re-running)

### Dimension 5: Figure conventions

- At least 3 figures saved as PNG
- `dpi=300, bbox_inches="tight"` on all `savefig()` calls
- Site color palette used: `#6a9bcc` (steel blue), `#d97757` (warm orange),
  `#141413` (near black), `#00d4c8` (teal)
- Color families for related method groups (if applicable)
- Dark theme (if used): `fig.patch.set_linewidth(0)`, matching facecolor/edgecolor,
  `pad_inches=0`, dark navy `#0f1729` background
- Figure naming follows `<slug>_<name>.png` pattern
- No `featured.png` generated by the script

### Dimension 6: Data handling

- Dataset loaded and cached correctly
- Shape and basic stats printed after loading
- Missing values handled appropriately (dropped, imputed, or flagged)
- Data types are correct (no silent string-to-float issues)

### Dimension 7: Statistical correctness

- Methods applied correctly (correct function calls, correct parameters)
- Train/test split (if applicable) done before any fitting
- No data leakage (test data never seen during training or feature engineering)
- Results are plausible (sanity check against known benchmarks)
- Confidence intervals or standard errors reported where appropriate

### Dimension 8: Causal inference (if applicable)

Skip this dimension if the script is not a causal inference analysis. Check:

- Estimand (ATE/ATT/LATE) stated in comments for each estimation method
- Randomized vs observational framing is correct throughout
- Covariates are pre-treatment only (no post-treatment variables in adjustment)
- "Confounder" used correctly (not in RCT contexts where it should be
  "precision covariate")

---

## Phase 4: Produce report

Deliver the review **both inline in the conversation AND saved as a file**.
Save the report as `script-review.md` in the post directory (e.g.,
`content/post/<slug>/script-review.md`). This file serves as a permanent
record of the review for downstream skills and future reference.

After saving, also update the post's `README.md` to add `script-review.md`
to the file inventory.

### Report structure

```
# Script Review: <slug>

**Script:** `<filename>` (<N> lines)
**Language:** <Python / Stata / R>
**Executed:** <date and time>
**Status:** <All code runs / Errors found>

## Verdict: <ACCEPT / MINOR REVISION / MAJOR REVISION>

<1-2 sentence summary of overall assessment>

## Execution Results

- Exit code: <0 / non-zero>
- Execution time: <N seconds>
- Figures generated: <N> PNG files
- Warnings: <none / list>

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | ...       | HIGH     | line N   | ...   | ...           |
| 2 | ...       | MEDIUM   | line N   | ...   | ...           |
| 3 | ...       | LOW      | line N   | ...   | ...           |

## Positive Highlights

- <what the script does well -- be specific>
- <good practices worth noting>

## Priority Action Items

1. **[HIGH]** <most critical fix>
2. **[MED]** <important improvement>
3. **[LOW]** <nice to have>
```

### Severity definitions

| Level | Meaning |
|-------|---------|
| **HIGH** | Script does not run, produces wrong results, has data leakage, uses deprecated APIs that will break, or has statistical errors. Must fix before using results. |
| **MEDIUM** | Code works but has quality issues: poor variable names, missing comments, no caching, missing seed, or suboptimal structure. Should fix. |
| **LOW** | Style preferences, minor improvements, optional enhancements. Nice to fix. |

### Verdict criteria

| Verdict | Criteria |
|---------|---------|
| **ACCEPT** | No HIGH issues, at most 2 MEDIUM issues. Script is correct and clean. |
| **MINOR REVISION** | No HIGH issues but 3+ MEDIUM, or 1 HIGH that is easy to fix. Needs targeted improvements. |
| **MAJOR REVISION** | 2+ HIGH issues, or fundamental problems with correctness, structure, or reproducibility. Needs significant rework. |

### Reviewer guidelines

- **Run the code first.** The single most valuable thing is verifying execution.
- **Check outputs match expectations.** Compare execution log against script claims.
- **Be specific:** Cite exact line numbers or section names.
- **Be actionable:** Every issue must include a concrete fix suggestion.
- **Think like a code reviewer:** Focus on correctness, readability, and maintainability.
- **Do not modify any files.** The review is advisory only.

---

## Follow-up

After delivering the report, offer the user next steps:

"Want me to:
- **Elaborate** on any specific issue or suggest detailed code changes?
- **Apply fixes** to address the issues found? (I will modify the script directly.)
- Run `/project:write-results-report` to generate the interpretation report from
  the current script output?"
