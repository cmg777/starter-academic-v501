# SLIDES_REVIEW.md Template

Canonical markdown skeleton for the audit. The same content is printed inline and
written to `content/post/<slug>/slides/SLIDES_REVIEW.md`. Fields in
`<angle brackets>` are placeholders the skill substitutes in Phase 3.

```markdown
# Review: <slug> Slide Deck

**Audited:** content/post/<slug>/slides/
**Source of truth:** content/post/<slug>/index.md<+ results_report.md>
**Date:** <YYYY-MM-DD>
**Audit version:** review-slides v1.0
**Focus:** <all | comma-separated dimension names>
**Browser pass:** <enabled | skipped (--no-browser)>

---

## Verdict: <ACCEPT | MINOR REVISION | MAJOR REVISION>

**Overall assessment.** <2–3 sentence synthesis. Name the strongest dimension and
the weakest. If MAJOR, lead with the single most important blocker (a wrong
number, broken render, branding tamper, broken link). If MINOR, name the one fix
that would promote it to ACCEPT.>

**Audited <N> of 10 dimensions<; focus: …>.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | <N>        | <H/M/L> | <e.g. all 14 numbers trace to source>  |
| 2  | Conceptual correctness        | <N>        | <H/M/L> | <one-line note>                        |
| 3  | Technical & render correctness| <N>        | <H/M/L> | smoke-test <P/F>; math renders <y/n>   |
| 4  | Title↔body consistency        | <N>        | <H/M/L> | assertion-title test <pass/fail>       |
| 5  | Readability & simplicity      | <N>        | <H/M/L> | <X> over-length, <Y> dense slides      |
| 6  | Typos & grammar               | <N>        | <H/M/L> | <one-line note>                        |
| 7  | write-slides design adherence | <N>        | <H/M/L> | arc <ok>; closing <ok>                 |
| 8  | Branding integrity            | <N>        | <H/M/L> | scss/title diff <clean/dirty>          |
| 9  | Accessibility & legibility    | <N>        | <H/M/L> | overflow <none/N slides>               |
| 10 | Deliverable completeness      | <N>        | <H/M/L> | link <ok>; files <ok>                  |

Skipped dimensions show `—` in the score column with `not audited` in Notes.

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 1   | HIGH     | slide 9 — "Effect is 0.12"        | Slide says 0.12; results_report.md reports 0.096 | Change to 0.096 to match the post              |
| 2  | 5   | MED      | slide 6 — "Identification"        | 27-word sentence; passive voice                | See rewrite below                              |
| …  | …   | …        | …                                 | …                                              | …                                              |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

Every readability finding ships a rewrite. One block per finding:

**Issue #<n> — slide <N> "<title>"**

Before:
> <verbatim on-slide sentence/bullet>

After:
> <shorter, simpler, active rewrite>

Why: <one line — e.g. "27 words → two 8-word lines; 'was estimated using' → active">

(Print "None found." if Dimension 5 raised no issues.)

---

## HIGH-issue rewrites

For each HIGH issue that is a text/content fix, give before/after:

**Issue #<n> — <dimension> — slide <N>**

Before:
> <current slide text / value>

After:
> <corrected slide text / value>

(Print "None found." if there are no HIGH issues.)

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                 | Value on slide | Source location               | Match |
|-----------------------------|----------------|-------------------------------|-------|
| Treatment coefficient        | −0.096         | results_report.md / index.md:212 | ✓     |
| Sample size N                | 3,140          | index.md:140                  | ✓     |
| Figure: coefficient path     | ../<slug>_path.png | index.md:188 (same figure)  | ✓     |
| <…>                          | <…>            | <…>                           | <✓/✗> |

Every ✗ is a HIGH issue listed above.

---

## Title sequence (assertion-title test)

Read in order, the slide titles should form the talk's abstract:

1. <title 1>
2. <title 2>
3. <…>

**Verdict:** <coherent abstract | gap after slide N | label titles at N, M>

---

## Positive highlights

- <Specific strength 1, with location. E.g. "Slide 4's title 'The 10% WTO ceiling
  is a mechanical dose' previews the identification in six words.">
- <Specific strength 2>
- <Specific strength 3>

3–5 items. Be specific; generic praise is not useful.

---

## Priority action items

1. **[HIGH]** <Action #1 — what to change, where, why.>
2. **[HIGH]** <Action #2 if any.>
3. **[MED]** <Action #3.>
4. **[MED]** <Action #4.>
5. **[LOW]** <Action #5.>

≤ 5 items. If there is only one HIGH, list it first and stop after the MEDs.

---

## Screenshots (HIGH-severity visual issues only)

Emit only if a HIGH overflow / unrendered-math issue was detected in the browser
pass. Otherwise omit entirely.

- `SLIDES_REVIEW_slide-09.png` — content overflows the slide box, clipping the last bullet.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides <slug>

To re-check just the dimension you fixed:

    /project:review-slides <slug> focus: <fidelity|correctness|readability|consistency|design|branding|accessibility|render>

---

## Audit metadata

- Node version: <vN.N.N>
- Playwright: <enabled vN | disabled (--no-browser) | missing>
- smoke-test.js: <PASS | FAIL (n checks)>
- Branding diff: <clean | site-brand.scss differs | title-slide.html differs (arrow-only OK)>
- Design/branding (browser pass): background <ok | MISMATCH>; accent-rule <ok | missing>; byline <refined | flat>; pipeline <none | word-ok | ARROWS-ON-NUMERIC>; takeaway-cards <N>
- Tooling notes: <e.g. "Chromium via system Chrome channel.">

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
```

---

## Rules for the skill when filling the template

1. **Always emit every section header, even when empty.** Print "None found."
   rather than removing the section. Predictable structure beats compact reports.
2. **Round dimension scores to integers.** The rubric is discrete.
3. **Date format is `YYYY-MM-DD`.** Use the current date from context.
4. **Issue numbers are sequential across all dimensions**, not restarted per dim.
5. **Locations are precise** — `slides.qmd:42` or `slide 7 — "assertion title"`.
   For a source mismatch, name both ends (slide value AND source line).
6. **Every readability finding has a rewrite; every HIGH text issue has a
   before/after.** A finding without a fix is incomplete.
7. **Don't reference yourself.** No "I observed" / "the reviewer feels". State the
   finding.
8. **The "How to re-review" snippet uses the actual slug**, not `<slug>`.
9. **Read-only reminder line stays** at the foot of the file.
