# Scoring and Criteria

How to convert per-check results into a 1–10 dimension score, then
into an overall verdict.

---

## Severity definitions

- **HIGH** — Ship-blocker. App misleads users, fails to load, has
  wrong numerical outputs, breaks Hugo build, or has accessibility
  failures that prevent use. Verdict cannot be ACCEPT.
- **MED** — Reduces clarity, pedagogy, or quality but the app is
  still usable. Verdict can still be ACCEPT only if every dimension
  remains ≥ 7.
- **LOW** — Style preference, optional enhancement, or "nice to
  have". Never blocks ACCEPT.

---

## Per-dimension 1–10 score rubric

The score for a dimension is the maximum compatible with its issues:

| Score | Meaning                                                                 |
|-------|-------------------------------------------------------------------------|
| 10    | No issues raised in this dimension.                                     |
| 9     | One LOW issue.                                                          |
| 8     | Two or more LOW issues; no MED or HIGH.                                 |
| 7     | One MED issue; no HIGH.                                                 |
| 6     | Two or more MED issues; no HIGH.                                        |
| 5     | One HIGH issue + any number of MED/LOW.                                 |
| 4     | One HIGH that also affects pedagogy or correctness; OR ≥ 3 MEDs.        |
| 3     | Multiple HIGH issues OR a single HIGH that breaks core functionality.   |
| 2     | ≥ 3 HIGH issues OR the dimension is "all broken" (e.g. files missing).  |
| 1     | Dimension is entirely non-functional.                                   |

Score floors imposed by specific checks:

- **Dim 1 (File completeness):** if any required file is missing,
  max score = 3.
- **Dim 7 (Pedagogy):** the n-gram alignment in
  `pedagogical-alignment.md` sets a floor (≥ 2/3 → floor 8; 1/3 →
  floor 6; 0/3 → HIGH issue and max 4).
- **Dim 8 (Hugo integration):** trailing-slash YAML bug ⇒ max 4.
- **Dim 3 (JS correctness):** smoke test exit ≠ 0 ⇒ max 3.

These floors only set bounds — the issue count determines the actual
score within the bound.

---

## Overall verdict

The verdict is derived from the score table and issue list:

### ACCEPT

All of:
- No HIGH issues anywhere.
- Every audited dimension scores ≥ 7.
- No STUB widget in a user-facing tab (Dim 7).
- N-gram alignment in pedagogical-alignment ≥ 2/3.

### MINOR REVISION

Any of:
- Exactly one HIGH issue.
- Any dimension between 5 and 6 inclusive.
- STUB widget present (gets a MED flag in Dim 7).
- N-gram alignment exactly 1/3.

### MAJOR REVISION

Any of:
- Two or more HIGH issues.
- Any dimension ≤ 4.
- JS smoke test exits non-zero.
- YAML link broken (trailing-slash bug or 404).
- N-gram alignment 0/3.
- Hugo serves any required asset as non-200.

If multiple categories apply, the more severe wins.

---

## Verdict-changing rules summary

These rules override score arithmetic — they are the "show-stoppers":

| Condition                                       | Effect on verdict      |
|-------------------------------------------------|------------------------|
| `dgp.js`, `lasso.js`, or `app.js` missing       | MAJOR (Dim 1 ≤ 3)     |
| Smoke test exits non-zero                       | MAJOR (Dim 3 ≤ 3)     |
| YAML link uses `web_app/` (no `/index.html`)    | MAJOR (Dim 8 = 4)      |
| 0/3 takeaway alignment in Tab-1 lede            | MAJOR (Dim 7 ≤ 4)      |
| All four tabs are STUB widgets                  | MAJOR (Dim 7 ≤ 4)      |
| Console error during default page load          | MINOR (Dim 3 ≤ 6)      |
| Mobile horizontal scrollbar                     | MINOR (Dim 10 ≤ 5)     |
| Performance > 1000 ms on smoke test             | MINOR (Dim 6 ≤ 5)      |
| Performance 300–1000 ms                         | LOW (Dim 6 ≤ 8)        |

---

## Skipped dimensions

A dimension reported as `[~] Not audited` (because of `--no-browser`
or a `focus:` subset) is **excluded from verdict computation**.
Specifically:

- Skipped dimensions do not appear in the score table (or appear with
  `—` for the score and "not audited" in the notes).
- Skipped dimensions do not block ACCEPT.
- The overall verdict reflects only the dimensions actually run.

The summary line states explicitly: `Audited 6 of 10 dimensions
(focus: code and accessibility)`.

---

## Reviewer guidelines

A few rules to keep the audit useful and honest:

1. **Cite locations precisely.** Use `index.html:42` or
   `app.js:108`. If the issue is the JSON's structure, use
   `data/results.json:3` or "row 5 of `estimates`".
2. **Quote the violation.** When an issue says "missing aria-label",
   include the offending element's HTML excerpt in the location
   column.
3. **Suggest a fix that someone else can apply.** "Add `aria-label`"
   is OK; "Audit accessibility" is not. Reference the catalogued fix
   in `write-app/references/render-and-fix.md` by entry name when
   one matches.
4. **Be specific about positives.** "Pedagogy bullets are excellent"
   is weak; "Tab 2's three-bullet 'what to look for' panel explicitly
   names the post's §10 sign-flip finding" is good.
5. **Don't double-count.** A missing file is a single issue under
   Dim 1, not a separate issue under Dims 2/3 because those checks
   then can't run. The dependent dimensions report `[~] Skipped
   (depends on Dim 1)` and exclude themselves from verdict
   computation.
6. **Mind the verdict-changing rules.** If any are true, the verdict
   is MAJOR even if average dimension scores look fine.
