---
name: review-results-report
description: Expert review of a results report -- verifies accuracy against script output, checks interpretation quality, and validates completeness. Use after write-results-report to ensure the report is ready for the blog post writer. Read-only.
argument-hint: "<post slug, e.g. python_doubleml>"
disable-model-invocation: true
user-invocable: true
---

# Review Results Report: Verify Accuracy, Completeness, and Interpretation Quality

Single thorough review of a `results_report.md` file. Verifies every number
against the script output, checks that all results are captured, and evaluates
interpretation quality. Produces an inline review report with a verdict.

**What this skill does:**
- Cross-checks every number in the report against execution_log.txt
- Verifies the figure inventory matches actual PNG files in the directory
- Evaluates interpretation paragraphs for depth, specificity, and domain meaning
- Assesses key findings for accuracy, diversity, and actionability
- Produces a structured review with verdict, issues table, and priority fixes

**What this skill does NOT do:**
- Does NOT modify results_report.md or any other file
- Does NOT re-run the script
- Does NOT write or edit the blog post
- Does NOT create new files

---

## Example invocations

```
/project:review-results-report python_doubleml
/project:review-results-report python_dowhy
/project:review-results-report content/post/python_pyfixest/
```

---

## Step 0 -- Pre-flight

1. **Parse arguments.** Extract the post slug or path from `$ARGUMENTS`.
   - If a full path is given (e.g. `content/post/python_dowhy/`), use it directly.
   - If a slug is given (e.g. `python_doubleml`), resolve to `content/post/<slug>/`.

2. **Verify results_report.md exists.** Check for `results_report.md` in the
   resolved directory. If it does not exist, report the error and stop. Suggest
   running `write-results-report` first.

3. **Verify the script exists.** Look for the analysis script:
   - Python: `script.py`
   - Stata: `analysis.do`
   - R: `analysis.R`

   If no script is found, report the error and stop.

4. **Read all three files** (in parallel):
   - `results_report.md` -- the report under review
   - The script file -- to understand expected outputs and figure names
   - `execution_log.txt` -- the ground truth for all numbers

   If `execution_log.txt` does not exist, warn the user that accuracy
   verification will be limited to cross-checking the report against the
   script's code (not actual output). Proceed with the review but note
   this limitation prominently in the verdict.

5. **Read reference files** (in parallel):
   - `references/review-checklist.md` -- six review dimensions with checklists
   - `references/scoring-and-criteria.md` -- severity definitions, verdict
     criteria, and reviewer guidelines

6. **List PNG files** in the post directory to compare against the figure
   inventory in the report.

---

## Step 0.5 -- Confirm scope

Present a brief confirmation to the user:

1. **Report identified:** "Found `results_report.md` at
   `content/post/<slug>/results_report.md`."

2. **Script identified:** "Script: `<filename>` (<language>)."

3. **Execution log:** "Execution log: present / missing (accuracy checks
   will be limited)."

4. **Scope:** "Running full review across all 6 dimensions: accuracy,
   completeness, interpretation quality, figure descriptions, key findings,
   and structure."

**Do NOT wait for confirmation.** Proceed directly to the review. This is a
read-only operation with no risk of modification.

---

## Step 1 -- Dimension 1: Accuracy

This is the highest-priority dimension. Every number in the report must match
the actual script output.

1. **Extract all numbers** from interpretation paragraphs and key findings
   in results_report.md.

2. **Cross-reference each number** against execution_log.txt. For each:
   - Find the corresponding line in the execution log
   - Verify the number matches exactly (or within stated rounding)
   - Flag any number that cannot be traced to the log

3. **Verify the execution summary.** Does it correctly describe:
   - What the script does (dataset, method, research question)?
   - Whether execution was clean or had warnings?
   - The headline finding?

4. **Verify the data overview.** Does it match the actual dataset
   (shape, columns, descriptive stats)?

5. **Check for fabricated numbers.** Any number in the report that does
   not appear in the execution log or cannot be derived from logged
   output is a HIGH severity issue.

---

## Step 2 -- Dimension 2: Completeness

1. **All major outputs captured.** Compare the execution log section by
   section against the Method Results in the report. Are any major
   analysis steps missing?

2. **Figure inventory complete.** Compare the PNG files listed via `ls`
   against the Figure Inventory table in the report:
   - Every PNG in the directory must appear in the table
   - Every entry in the table must correspond to an actual file
   - Flag orphaned PNGs or phantom entries

3. **Minimum key findings.** Count the key findings. Must be at least 5.
   Each must include specific numbers.

4. **Surprises and Caveats section.** Must be present, even if it states
   "No unexpected results."

5. **Method Results coverage.** One subsection per major analysis step
   in the script. Flag any step that produced output but has no
   corresponding subsection.

---

## Step 3 -- Dimension 3: Interpretation quality

Evaluate each interpretation paragraph against six criteria:

1. **Quotes specific numbers** -- not vague ("the result was significant")
2. **Explains in plain language** -- accessible to a non-specialist
3. **Translates to domain meaning** -- what does it mean for the case study?
4. **Connects to the research question** -- advances understanding
5. **Is a single continuous paragraph** -- 2-4 sentences, no bullet points
6. **Flags uncertainty** -- confidence intervals, caveats, limitations

### Minimum counts

- At least **5 interpretation paragraphs** across all sections
- Each interpretation must meet at least 4 of 6 criteria to pass

### Common interpretation weaknesses to flag

- Restating output without adding domain meaning (MEDIUM)
- Using only statistical jargon without plain-language explanation (MEDIUM)
- Missing confidence intervals or uncertainty language (LOW)
- Disconnected from the research question or case study (MEDIUM)

---

## Step 4 -- Dimension 4: Figure descriptions

For each entry in the Figure Inventory table:

1. **Description present and specific.** Not generic ("a chart") but
   describes what the figure shows (axes, variables, method).

2. **Key takeaway present and specific.** States the main finding visible
   in the figure, ideally with a number.

3. **View each PNG** to verify:
   - The figure rendered correctly (not blank or corrupted)
   - The description matches what the figure actually shows
   - The takeaway accurately reflects the visual pattern

---

## Step 5 -- Dimension 5: Key findings quality

Evaluate each key finding:

1. **Specific** -- includes exact numbers, not vague qualitative statements
2. **Diverse** -- findings cover different aspects of the analysis, not
   repetitive variations of the same point
3. **Accurate** -- numbers verified against execution log
4. **Domain-meaningful** -- translates statistical results into what they
   mean for the case study, policy, or research question

Flag findings that are:
- Vague or lack numbers (MEDIUM)
- Repetitive / overlapping with other findings (LOW)
- Inaccurate (HIGH)
- Pure statistical jargon without domain translation (MEDIUM)

---

## Step 6 -- Dimension 6: Structure and format

1. **Follows template.** Report has all required sections: metadata,
   execution summary, data overview, method results, figure inventory,
   key findings, surprises and caveats.

2. **Metadata block complete.** Script filename, execution date, status,
   runtime, language, key packages.

3. **Raw output included.** Method Results subsections include the actual
   printed output from the execution log, not just summaries.

4. **Clear section dividers.** Sections use consistent heading levels.

5. **Saved correctly.** File is named `results_report.md` in the post
   directory.

---

## Step 7 -- Produce review report

Deliver the review inline using the format from `references/review-checklist.md`.

### Severity definitions

| Level | Meaning |
| --- | --- |
| **HIGH** | Numbers do not match script output, key results missing, interpretations factually wrong, figures misrepresented. Must fix before the post writer uses this report. |
| **MEDIUM** | Interpretations are shallow (restate without domain meaning), figure descriptions generic, key findings vague. Should fix for better post quality. |
| **LOW** | Formatting issues, minor wording improvements, optional additional findings. Nice to fix. |

### Report structure

```
# Results Report Review: <slug>

**Report:** `results_report.md`
**Script:** `<filename>`
**Reviewed:** <date>

## Verdict: <ACCEPT / MINOR REVISION / MAJOR REVISION>

<1-2 sentence summary of the verdict rationale.>

## Accuracy Check

<Summary of number verification. State how many numbers were checked,
how many matched, and list any mismatches with the correct values.>

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|

## Positive Highlights
- <what the report does well -- be specific>

## Priority Action Items
1. **[HIGH]** <most critical fix with exact location and correct value>
2. **[MED]** <important improvement>
3. **[LOW]** <nice to have>
```

### Verdict criteria

| Verdict | Criteria |
| --- | --- |
| **ACCEPT** | No HIGH issues, at most 2 MEDIUM issues. Report accurately captures script results with good interpretations. |
| **MINOR REVISION** | No HIGH issues but 3+ MEDIUM, or 1 HIGH that is easy to fix. Needs targeted improvements. |
| **MAJOR REVISION** | 2+ HIGH issues, or fundamental accuracy problems. Report cannot be trusted as a source for the blog post. |

---

## Step 8 -- Follow-up

After delivering the review, offer the user next steps:

"Would you like me to:
- Fix the issues found and update `results_report.md`?
- Run `/project:write-post <slug>` to draft the blog post using these results?
- Re-run `/project:write-results-report <slug>` to regenerate the report from scratch?
- Elaborate on any specific issue or finding?"
