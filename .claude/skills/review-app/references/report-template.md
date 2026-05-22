# REVIEW.md Template

Canonical markdown skeleton for the audit report. Fields in
`<angle brackets>` are placeholders the skill substitutes in Phase 5.

```markdown
# Review: <slug> Web App

**Audited:** content/post/<slug>/web_app/
**Date:** <YYYY-MM-DD>
**Audit version:** review-app v1.0
**Focus:** <all | comma-separated dimension names>
**Browser pass:** <enabled | skipped (--no-browser)>

---

## Verdict: <ACCEPT | MINOR REVISION | MAJOR REVISION>

**Overall assessment.** <2–3 sentence synthesis. Name the strongest
dimension; name the weakest. If MAJOR, lead with the single most
important blocker. If MINOR, name the one fix that would promote it
to ACCEPT.>

---

## Dimension scores

| # | Dimension              | Score / 10 | Issues  | Notes                                                    |
|---|------------------------|-----------:|--------:|----------------------------------------------------------|
| 1 | File completeness      | <N>        | <H/M/L> | <one-line note>                                          |
| 2 | HTML structure         | <N>        | <H/M/L> | <one-line note>                                          |
| 3 | JS correctness         | <N>        | <H/M/L> | Smoke test <P>/7 passed; <perf> ms                       |
| 4 | Data contract          | <N>        | <H/M/L> | <one-line note>                                          |
| 5 | Accessibility          | <N>        | <H/M/L> | <one-line note>                                          |
| 6 | Performance            | <N>        | <H/M/L> | <one-line note>                                          |
| 7 | Pedagogy               | <N>        | <H/M/L> | Takeaway alignment <X>/3                                 |
| 8 | Hugo integration       | <N>        | <H/M/L> | <one-line note>                                          |
| 9 | Visual design          | <N>        | <H/M/L> | <one-line note>                                          |
|10 | Mobile responsiveness  | <N>        | <H/M/L> | <one-line note>                                          |

Skipped dimensions show `—` in the score column with `not audited` in
the Notes column.

---

## Issues found

| #  | Dim | Severity | Location                       | Issue                                                  | Suggested fix                                                       |
|---:|----:|----------|--------------------------------|--------------------------------------------------------|---------------------------------------------------------------------|
| 1  | 8   | HIGH     | content/post/<slug>/index.md:18 | YAML `url: web_app/` triggers Hugo trailing-slash bug | Change to `url: web_app/index.html` (see `render-and-fix.md` entry "Hugo trailing-slash URL rewrite") |
| 2  | 5   | MED      | index.html:122                  | Slider `lab-l` has no `aria-label`                    | Add `aria-label="penalty index"` to match the other 3 sliders        |
| …  | …   | …        | …                               | …                                                      | …                                                                   |

Order: HIGH first, then MED, then LOW. Number consecutively.

---

## Pedagogical alignment (Dim 7 deep-dive)

**Post takeaways extracted:**
1. <takeaway 1 from learning objectives / conclusion>
2. <takeaway 2>
3. <takeaway 3>

**App messaging extracted:**
- Tab 1 lede: "<verbatim lede text>"
- Tab 2 heading: "<verbatim heading>"
- Tab 3 heading: "<verbatim heading>"
- Tab 4 heading: "<verbatim heading>"

**Coverage:**
- Takeaway 1: <✓ covered in Tab 1 lede | ✗ absent>
- Takeaway 2: <✓ covered in Tab 3 heading | ✗ absent>
- Takeaway 3: <✗ absent — flagged as MED issue #N>

**Coverage score:** <X>/3

**Glossary check:**
- Post lists <N> key concepts; app glossary covers <M> of them.
- Missing: <list of missing terms, if any>.

---

## Widget catalog audit

| Tab | Widget archetype          | Status   | Notes                          |
|-----|---------------------------|----------|--------------------------------|
| 1   | concept-animation         | READY    | —                              |
| 2   | penalty-slider            | READY    | —                              |
| 3   | dgp-simulator             | READY    | —                              |
| 4   | forest-plot               | READY    | Real-data forest plot from Pattern A |

If a tab uses a STUB widget, mark it `STUB (MED)` and reference the
catalog entry.

---

## Positive highlights

- <Specific strength 1, with location. E.g.: "Tab 2's coefficient-path
  chart correctly highlights the treatment column in orange across all
  λ values (charts.js:160–175)."*>
- <Specific strength 2>
- <Specific strength 3>

3–5 items. Be specific. Generic praise ("good pedagogy") is not
useful.

---

## Priority action items

1. **[HIGH]** <Action #1 — what to change, where, why.>
2. **[HIGH]** <Action #2 if any.>
3. **[MED]** <Action #3.>
4. **[MED]** <Action #4.>
5. **[LOW]** <Action #5.>

≤ 5 items. If there's only one HIGH, list it first and stop.

---

## Screenshots (HIGH-severity visual issues only)

Only emit this section if a HIGH issue under Dim 9 or Dim 10 was
detected. Otherwise omit entirely.

- `REVIEW_pane-intro.png` — desktop view of Tab 1 (theme failure).
- `REVIEW_pane-lab-mobile.png` — Tab 2 on 375 px width; slider unreachable.

---

## How to re-review

After applying the fixes, re-run:

    /project:review-app <slug>

To focus on the dimension you just fixed:

    /project:review-app <slug> focus: <pedagogy|code|accessibility|data|hugo|visual>

---

## Audit metadata

- Hugo port used: <port>
- Node version: <vN.N.N>
- Playwright: <enabled/disabled/version>
- Tooling notes: <e.g. "Chromium installed via first-run bootstrap.">

---

*Generated by `/project:review-app`. Skill at
`.claude/skills/review-app/`. Verification rubric at
`references/scoring-and-criteria.md`.*
```

---

## Rules for the skill when filling the template

1. **Always emit every section header, even when empty.** Print "None
   found." rather than removing the section. Predictable structure
   beats compact reports.
2. **Round dimension scores to integers.** No 8.5 / 9.2. The rubric is
   discrete.
3. **Date format is `YYYY-MM-DD`**, not "today" or month names.
4. **Issue numbers are sequential across all dimensions.** Don't
   restart per dimension.
5. **Locations use file paths with line numbers** when known
   (`index.html:42`); otherwise the file path with no line
   (`data/results.json`).
6. **Suggested fix must be actionable.** A single sentence the
   user could paste into their editor.
7. **Don't reference yourself.** No "I observed", "my opinion", or
   "the reviewer feels". State the finding.
8. **The "How to re-review" snippet must use the actual slug**, not
   `<slug>` placeholder.
