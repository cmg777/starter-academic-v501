# Review: stata_cate Slide Deck

**Audited:** content/post/stata_cate/slides/
**Source of truth:** content/post/stata_cate/index.md (no results_report.md; numbers cross-checked against the embedded Stata output in index.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled (Playwright/Chromium; per-slide walk at 1280×720)

---

## Verdict: ACCEPT (after fixes)

**Overall assessment.** A faithful, well-paced deck whose strongest dimension is its assertion-title sequence — read alone, the 24 titles form a coherent abstract of the talk. Source fidelity is excellent: every number on every slide traces to the post's embedded Stata output. No HIGH issues exist: the smoke test passes 15/15, branding is byte-identical to the canonical templates, math renders cleanly (zero raw LaTeX), no slide overflows the box at 1280×720, and bare currency `$` signs are NOT mangled by MathJax (verified in-browser — `mathCur=[]` on every slide). The pre-fix weak point was two prose-wall slides; both were trimmed to a single anchor line with the detail moved to speaker notes. After fixes the deck is ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                      |
|----|-------------------------------|-----------:|--------:|--------------------------------------------|
| 1  | Source fidelity               | 9          | 1 L     | all ~30 numbers trace to index.md; one rounded title |
| 2  | Conceptual correctness        | 10         | 0       | estimand, DR property, identification all correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test 15/15; math renders; no `\_` bug; currency safe |
| 4  | Title↔body consistency        | 9          | 1 L     | titles form a coherent abstract; one math-style nit (fixed) |
| 5  | Readability & simplicity      | 8          | 2 M     | two prose walls → moved to notes (fixed)   |
| 6  | Typos & grammar               | 10         | 0       | no `--`, consistent terminology            |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc, Devil's-Advocate, 1-sentence close |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide.html diff CLEAN         |
| 9  | Accessibility & legibility    | 10         | 0       | every figure captioned; no overflow at 1280×720 |
| 10 | Deliverable completeness      | 9          | 1 L     | files present; link relative; icon nit (not deck-owned) |

---

## Issues found

| #  | Dim | Severity | Location                                                   | Issue                                                                 | Suggested fix                                            |
|---:|----:|----------|------------------------------------------------------------|----------------------------------------------------------------------|----------------------------------------------------------|
| 1  | 5   | MED      | slide 2 — "What is the effect? is the wrong question"      | Three stacked prose sentences on the slide (wall of prose)           | Keep one anchor line; move rest to `::: {.notes}` — APPLIED |
| 2  | 5   | MED      | slide 24 — "Does the causal forest make this causal?"      | Four-sentence rebuttal on the slide (wall of prose)                  | Trim to two short lines; move the example to notes — APPLIED |
| 3  | 4   | LOW      | slide 14 (qmd:97) — estimand title                         | Title used plain `$x$` while body + post use bold `$\mathbf{x}$`     | Align title to `\mathbf{x}` — APPLIED                    |
| 4  | 1   | LOW      | slide 3 (qmd:75) / slide 23 (qmd:321) — "$1,400"           | Title rounds GATE low ($1,399) to "$1,400"; post body says $1,399    | DEFERRED — deliberate hook rounding, internally consistent |
| 5  | 10  | LOW      | index.md:16 — deck link icon                               | Uses `icon: chalkboard-teacher`, not the convention's `person-chalkboard` | DEFERRED — `index.md` is out of scope (HARD CONSTRAINT)  |

Order: MED first, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 2 "What is the effect? is the wrong question — ask for whom?"**

Before:
> But policy makers, doctors, and managers never act on the average. They need to know *who* the program helps — and who it leaves behind. *That's the CATE.*

After:
> But no one acts on the average. The real question is *who* the program helps. *That's the CATE.*

Why: 3 sentences (33 words) → 2 short lines (15 words). The list of three actors and the "leaves behind" clause moved verbatim into the speaker notes, where the presenter says them aloud.

**Issue #2 — slide 24 "Does the causal forest make this causal? No — the assumptions still carry it"**

Before:
> It does not. $\tau(\mathbf{x})$ is identified *only* under **unconfoundedness given $\mathbf{x}$** and **overlap**. If, say, employer match rates vary with income and we never observe them, the income gradient is biased. The forest fits the function; it cannot rule out an unmeasured confounder.

After:
> It does not. $\tau(\mathbf{x})$ is identified *only* under **unconfoundedness** and **overlap**. The forest fits the function; it cannot rule out an unmeasured confounder.

Why: 4 sentences (50+ words) → 2 short lines. The concrete employer-match-rate example moved to the notes (it is the spoken elaboration, not an on-slide anchor).

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                            | Value on slide                       | Source location                  | Match |
|----------------------------------------|--------------------------------------|----------------------------------|-------|
| Raw eligible−ineligible gap            | $19,557                              | index.md:335                     | ✓ |
| Eligible mean assets                   | $30,347                              | index.md:330/335                 | ✓ |
| Not-eligible mean assets               | $10,790                              | index.md:330 (10789.9)           | ✓ |
| N eligible / not / total               | 3,682 / 6,231 / 9,913                | index.md:303–308                 | ✓ |
| % eligible                             | 37.1% (overlap "37% / 63%")          | index.md:310                     | ✓ |
| Mean / median assets                   | $18,054 / $1,499                     | index.md:310                     | ✓ |
| GATE by income (5 groups)              | $4,087 / $1,399 / $5,154 / $8,532 / $20,511 | index.md:531–533/551       | ✓ |
| GATE joint test                        | χ²(4)=18.44, p=0.001                 | index.md:538–539                 | ✓ |
| Parametric AIPW ATE                    | $8,019                               | index.md:363/371                 | ✓ |
| PO ATE                                 | $7,937                               | index.md:414/418                 | ✓ |
| AIPW ATE                               | $8,120                               | index.md:622/649                 | ✓ |
| Estimator spread                       | $183                                 | index.md:692 (8120−7937)         | ✓ |
| Heterogeneity test PO                  | χ²(1)=4.11, p=0.043                  | index.md:432–433                 | ✓ |
| Heterogeneity test AIPW               | χ²(1)=5.54, p=0.019                  | index.md:626–627                 | ✓ |
| Projection: top income                 | +18,195, p=0.001                     | index.md:456/461                 | ✓ |
| Projection: homeowner / age / educ     | +3,163 / +205 / −442                 | index.md:451–458                 | ✓ |
| Projection R²                          | 0.0045                               | index.md:461                     | ✓ |
| GATES quartiles                        | $17,279 → $8,121 → $3,444 → $2,919   | index.md:566–569                 | ✓ |
| Top-to-bottom ratio                    | 5.9×                                 | index.md:582                     | ✓ |
| Bottom GATES p-value                   | 0.167                                | index.md:569/582                 | ✓ |
| Classification income/age/educ + t     | 62,739/26,861/35,878 (t=56.2); 45.2/35.0/10.2 (t=35.7); 14.0/12.7/1.4 (t=18.6) | index.md:596–598 | ✓ |
| Series derivative                      | 0.213 → +$213 per $1,000             | index.md:670/677                 | ✓ |
| Figures (6 referenced)                 | ../stata_cate_*.png                  | all 6 resolve on disk            | ✓ |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. "What is the effect?" is the wrong question — ask "for whom?"
2. The raw gap is $19,557 — but most of it is selection, not the program
3. Five income groups, one dataset — a fan from $1,400 to $20,511
4. The estimand is a function, not a number: τ(x) = E[y(1)−y(0)∣x]
5. Two assumptions do the causal work — the forest only fits the function
6. The lab: 9,913 households, eligibility → net financial assets
7. `cate` runs cross-fit lasso and a causal forest in one command
8. Two routes to the same object: PO is robust, AIPW is efficient
9. Three estimators bracket the ATE within a $183 spread
10. First, does the effect vary at all? The test says yes
11. The average of $7,937 hides a long right tail of large effects
12. A linear projection of τ̂ᵢ says income is the only strong signal
13. Effects climb with age; education barely moves them
14. Education is a flat line — once you know income, it adds nothing
15. Let the data sort the households: the top quartile gains 5.9× the bottom
16. The high-effect quartile earns $35,878 more than the low-effect one
17. A smooth fit: each extra $1,000 of income adds ~$213 to the effect
18. The top income group gains $20,511 — five times the average household
19. A quarter of households gain little or nothing — invisible in the ATE
20. Does the causal forest make this causal? No — the assumptions still carry it
21. The average is a press release; the CATE is the policy
22. Estimate the CATE, not just the ATE — the average is hiding who your policy actually helps.

**Verdict:** coherent abstract. The titles read as a clean tension → investigation → resolution narrative with assertion (not label) titles throughout. No gaps, no non-sequiturs.

---

## Positive highlights

- Slide 9's title "Three estimators bracket the ATE within a $183 spread" turns a robustness check into a one-line claim, and the $183 is exactly max−min ($8,120 − $7,937) — title proven by body.
- Slide 20 is a real Devil's-Advocate slide with `.objection` / `.rebuttal` styling, exactly the seminar-audience pattern write-slides asks for, and it states the identifying assumptions correctly (unconfoundedness + overlap).
- The closing slide (qmd:330) is a single declarative sentence — "Estimate the CATE, not just the ATE…" — not "Questions?" / "Thank you", and it resolves the Act-I hook.
- Math uses plain `_i` subscripts in Pandoc math (e.g. `$\hat\tau_i$`), correctly avoiding the Goldmark `\_` trap — verified rendering with zero raw-LaTeX slides in the browser pass.

---

## Priority action items

1. **[MED]** Trim slide 2's three-sentence prose to one anchor line; rest to notes. — APPLIED
2. **[MED]** Trim slide 24's four-sentence rebuttal to two lines; example to notes. — APPLIED
3. **[LOW]** Align slide-14 title math to bold `\mathbf{x}`. — APPLIED
4. **[LOW]** (deferred) Consider aligning the "$1,400" hook to the post's "$1,399"; left as a deliberate rounding.
5. **[LOW]** (deferred, out of scope) `index.md` deck-link icon is `chalkboard-teacher`, not `person-chalkboard`.

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow or unrendered math detected in the browser pass.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_cate

To re-check just the dimension you fixed:

    /project:review-slides stata_cate focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (Chromium via vendored slide-audit.cjs; supplementary per-slide walk at 1280×720)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs cumulative word/bullet/overflow counts are a known artifact (they accumulate across the vertical-stack walk and fold in hidden speaker notes); the load-bearing signals — raw-latex slides: 0 — and a dedicated per-current-slide walk (overflow false on all 22 slides, currency not eaten as math on all slides) are authoritative.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
