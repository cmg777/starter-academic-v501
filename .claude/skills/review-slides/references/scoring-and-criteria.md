# Scoring and Criteria

How to convert per-check results into a 1–10 dimension score, then into an
overall verdict. Mirrors `review-app`'s rubric so the two reviewers agree.

---

## Severity definitions

- **HIGH** — Ship-blocker. The slide misleads the audience, states a wrong
  number/result, contradicts its own title, fails to render, shows raw LaTeX,
  tampers with the immutable brand theme, or breaks the deck link. Verdict
  cannot be ACCEPT.
- **MED** — Reduces clarity, simplicity, or fidelity but the deck is still
  usable: an over-long sentence, >5 bullets, undefined jargon, a label (not
  assertion) title, a missing speaker note, a figure with no caption. Verdict
  can still be ACCEPT only if every dimension remains ≥ 7.
- **LOW** — Style preference or optional polish. Never blocks ACCEPT.

---

## Per-dimension 1–10 score rubric

The score for a dimension is the maximum compatible with its issues:

| Score | Meaning                                                              |
|-------|---------------------------------------------------------------------|
| 10    | No issues raised in this dimension.                                 |
| 9     | One LOW issue.                                                      |
| 8     | Two or more LOW issues; no MED or HIGH.                             |
| 7     | One MED issue; no HIGH.                                             |
| 6     | Two or more MED issues; no HIGH.                                    |
| 5     | One HIGH issue + any number of MED/LOW.                            |
| 4     | One HIGH that also affects correctness or fidelity; OR ≥ 3 MEDs.   |
| 3     | Multiple HIGH issues OR a single HIGH that breaks the deck.        |
| 2     | ≥ 3 HIGH issues OR the dimension is "all broken".                 |
| 1     | Dimension is entirely non-functional / unverifiable.              |

Score floors imposed by specific checks:

- **Dim 1 (Source fidelity):** any wrong/invented number or result ⇒ max 4.
- **Dim 3 (Technical & render):** raw LaTeX visible on any slide (browser pass),
  or `smoke-test.js` exits non-zero ⇒ max 3.
- **Dim 4 (Title↔body):** any slide whose title claims something its body does
  not show ⇒ max 4.
- **Dim 8 (Branding integrity):** any non-empty diff against the canonical
  `site-brand.scss` / `title-slide.html` ⇒ max 4 (HIGH), unless the template
  legitimately advanced after generation (then LOW, no floor).
- **Dim 10 (Deliverables):** `index.md` deck link uses the trailing-slash
  `/slides/` form, or `index.html`/`slides_files/` missing ⇒ max 4.

These floors only set bounds — the issue count sets the actual score within.

---

## Overall verdict

### ACCEPT

All of:
- No HIGH issues anywhere.
- Every audited dimension scores ≥ 7.
- Titles read in sequence form a coherent abstract (assertion-title test passes).
- Closing slide is one declarative sentence (not "Questions?" / "Thank you").

### MINOR REVISION

Any of:
- Exactly one HIGH issue (and it is easy to fix).
- Any audited dimension scores 5 or 6.
- 3 or more MED issues with no HIGH.

### MAJOR REVISION

Any of:
- Two or more HIGH issues.
- Any audited dimension ≤ 4.
- A wrong/invented number or result on any slide (Dim 1).
- Raw LaTeX visible on any slide, or `smoke-test.js` non-zero (Dim 3).
- Branding files tampered (Dim 8 HIGH).
- Deck link broken — trailing-slash bug or 404 (Dim 10).

If multiple categories apply, the more severe wins.

---

## Verdict-changing rules summary

These override score arithmetic — the show-stoppers:

| Condition                                                  | Effect on verdict       |
|------------------------------------------------------------|-------------------------|
| A slide number/result does not match the source post       | MAJOR (Dim 1 ≤ 4)       |
| Raw `\hat`/`\(` visible on any slide (browser pass)        | MAJOR (Dim 3 ≤ 3)       |
| `smoke-test.js` exits non-zero                             | MAJOR (Dim 3 ≤ 3)       |
| Slide title contradicts its own body                       | MAJOR (Dim 4 ≤ 4)       |
| `site-brand.scss` / `title-slide.html` modified            | MAJOR (Dim 8 ≤ 4)       |
| `index.md` link uses `url: slides/` (trailing slash)       | MAJOR (Dim 10 ≤ 4)      |
| `index.html` or `slides_files/` missing                    | MAJOR (Dim 10 ≤ 3)      |
| A slide overflows and clips content (browser pass)         | MINOR (Dim 9 ≤ 5)       |
| A slide has > 5 bullets or a > ~25-word sentence           | MINOR (Dim 5 ≤ 6)       |
| Closing slide is "Questions?" / "Thank you"                | MINOR (Dim 7 ≤ 6)       |

---

## Skipped dimensions

A dimension reported `[~] not audited` (because of `--no-browser` or a `focus:`
subset) is **excluded from verdict computation**:

- It shows `—` in the score column with "not audited" in the Notes column.
- It does not block ACCEPT.
- The verdict reflects only the dimensions actually run.

The summary line states explicitly, e.g.: `Audited 4 of 10 dimensions
(focus: readability and fidelity)`.

When `--no-browser` is set, Dimensions 3 and 9 still run their static parts but
their browser-only checks (math-render, overflow) are marked `[~]` and do not
trigger their MAJOR/MINOR floors.

---

## Reviewer guidelines

1. **Cite locations precisely.** `slides.qmd:42`, or `slide 7 — "Double-LASSO
   restores −0.096"`. For a source mismatch, name both ends: `slide 9 says 0.12;
   index.md:212 / results_report.md report 0.096`.
2. **Quote the violation.** Paste the offending sentence, bullet, or title.
3. **Ship a fix someone else can apply.** For readability and HIGH issues, give a
   full `Before:` / `After:` rewrite. "Shorten this" is not a fix; the rewritten
   sentence is.
4. **Be specific about positives.** "Slide 4's assertion title 'The 10% WTO
   ceiling is a mechanical dose' previews the identification in six words" beats
   "good titles".
5. **Don't double-count.** A missing `index.html` is one Dim 10 issue; the
   browser-dependent dimensions then report `[~] Skipped (no rendered deck)` and
   exclude themselves — they are not separate issues.
6. **Mind the verdict-changing rules.** If any is true, the verdict is at least
   MINOR (often MAJOR) even when average scores look fine.
7. **Source post wins.** When the deck and the post disagree on a number, the
   post (and `results_report.md`) is correct by definition; the slide is the bug.
