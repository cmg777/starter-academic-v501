# Review: r_demeaning_twfe Slide Deck

**Audited:** content/post/r_demeaning_twfe/slides/
**Source of truth:** content/post/r_demeaning_twfe/index.md (+ results_report.md, coefficient_comparison.csv, se_comparison.csv)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled (Playwright/Chromium)

---

## Verdict: MINOR REVISION

**Overall assessment.** A faithful, well-paced teaching deck: every on-slide number, figure, equation, and code snippet traces cleanly to the source post, the assertion titles form a coherent abstract, and the 3-act arc lands on a single-sentence thesis. The strongest dimension is source fidelity (all 14 slide data trace to the post); the weakest is typos & grammar, dragged down by two garbled lines on the "grand mean" slide. No HIGH issues — no wrong numbers, no raw LaTeX, no overflow, branding byte-identical, smoke test 15/15. The one fix that would promote it to ACCEPT is repairing the ungrammatical title and body on slide 8 ("Why add the grand mean back?").

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                          |
|----|-------------------------------|-----------:|--------:|------------------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers/figures/equations trace to source  |
| 2  | Conceptual correctness        | 10         | 0       | estimand, FWL, df logic all correct            |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; 0 raw   |
| 4  | Title↔body consistency        | 7          | 1 MED   | assertion-title test passes; one broken title  |
| 5  | Readability & simplicity      | 6          | 2 MED 1 LOW | 1 garbled sentence, 1 long sentence, 8-bullet contrast |
| 6  | Typos & grammar               | 6          | 2 MED   | broken title + garbled body on slide 8         |
| 7  | write-slides design adherence | 9          | 1 LOW   | arc ok; closing one sentence; minor agenda note |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide diffs clean                  |
| 9  | Accessibility & legibility    | 9          | 1 LOW   | every figure captioned; no real overflow        |
| 10 | Deliverable completeness      | 10         | 0       | link ok (url: slides/index.html); all files present |

---

## Issues found

| #  | Dim | Severity | Location                                   | Issue                                                            | Suggested fix                                      |
|---:|----:|----------|--------------------------------------------|------------------------------------------------------------------|----------------------------------------------------|
| 1  | 4/6 | MED      | slide 8 — title (slides.qmd:121)           | "Why add the grand mean back? Or you subtract the overlap twice" — "Or you subtract" is an ungrammatical sentence fragment | "Why add the grand mean back? Miss it and you subtract the overlap twice" |
| 2  | 5/6 | MED      | slide 8 — body (slides.qmd:123)            | "...and the **grand mean leaves twice** — once inside each" reads as garbled grammar | See rewrite below                                  |
| 3  | 5   | MED      | slide 19 — "The strongest objection" (slides.qmd:262) | 38-word Response sentence with three clauses on-slide | See rewrite below                                  |
| 4  | 5   | LOW      | slide 9 — "Two routes" (slides.qmd:143–162)| 8 bullets total (two 4-bullet columns) exceeds the 5-bullet cap | Acceptable as an inseparable two-column contrast; no change needed (note only) |
| 5  | 1   | LOW      | slide 17 — notes (slides.qmd:229)          | Notes say "t = −14.8"; the post reports t = −14.77 (index.md:362) | Change to "t = −14.77" to match the post           |
| 6  | 7   | LOW      | slide 3 — "Where we're going" (slides.qmd:70)| Act I includes an agenda slide before the investigation | Acceptable for a Teaching deck (agenda allowed); note only |

Order: MED first, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide 8 "Why add the grand mean back?"**

Before:
> Subtract both the country mean and the time mean and the **grand mean leaves twice** — once inside each. Add $\bar{x}_{\cdot\cdot}$ back once to restore it.

After:
> Subtract both the country mean and the time mean, and you remove the **grand mean twice** — it hides inside each. Add $\bar{x}_{\cdot\cdot}$ back once to undo that.

Why: "the grand mean leaves twice" is garbled; "remove the grand mean twice / it hides inside each" names the actor and the mechanism in plain words.

**Issue #3 — slide 19 "The strongest objection — and the answer"**

Before:
> Because correct points $\neq$ correct inference. `lm()` understates SEs by 7–22%, giving artificially narrow CIs and inflated $t$-stats. `feols()` makes the df correction *and* offers clustering for serial correlation — use a dedicated panel estimator for any hypothesis test.

After:
> Because correct points $\neq$ correct inference. `lm()` understates SEs by 7–22% — narrow CIs, inflated $t$-stats. `feols()` fixes the df *and* clusters for serial correlation. Use a panel estimator for any test.

Why: the third sentence ran 38 words with three clauses; split into three short lines, each one idea.

---

## HIGH-issue rewrites

None found. (No HIGH issues — no wrong on-slide numbers, no broken render, no branding tamper, no broken link.)

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                   | Value on slide      | Source location                          | Match |
|-----------------------------------------------|---------------------|------------------------------------------|-------|
| Title-strip: same coefficient                 | −0.055286           | index.md:68, 97, 230; coef CSV           | ✓     |
| Title-strip: max difference                   | 3.05e−16            | index.md:499, 503; coef CSV (gov_cons)   | ✓     |
| Title-strip: panel size                       | 1,200 (150 × 8)     | index.md:315–319                         | ✓     |
| Panel structure (balanced, 1,200 rows)        | 150 × 8, balanced   | index.md:315–319, 328                    | ✓     |
| TWFE equation $y_{it}=\alpha_i+\lambda_t+\beta x_{it}+u_{it}$ | as shown | index.md:90                              | ✓     |
| Within transformation formula                 | $\tilde{x}_{it}=x_{it}-\bar{x}_{i\cdot}-\bar{x}_{\cdot t}+\bar{x}_{\cdot\cdot}$ | index.md:252 | ✓     |
| FWL identity                                  | $\hat\beta_{TWFE}=\hat\beta_{OLS\,demeaned}$ | index.md:269                  | ✓     |
| Demeaned-means table: growth_dm               | −8.1e−17 (.key)     | index.md:433                             | ✓     |
| Demeaned-means table: ln_y_initial_dm         | 8.3e−15             | index.md:434                             | ✓     |
| Demeaned-means table: gov_cons_dm             | 1.8e−16             | index.md:438                             | ✓     |
| Coef table: ln_y_initial feols/manual/diff    | −0.055286 / −0.055286 / −4.2e−17 | index.md:493; coef CSV       | ✓     |
| Coef table: log_s_k                           | 0.019725 / 0.019725 / 3.5e−18 | index.md:494; coef CSV          | ✓     |
| Coef table: gov_cons                          | −0.102795 / −0.102795 / −3.1e−16 | index.md:497; coef CSV (−3.05e−16) | ✓ |
| all.equal() TRUE; max gap 3.05e−16 ≈ ε        | as shown            | index.md:499–503                         | ✓     |
| Bignum                                         | −0.055286           | index.md:230, 503                        | ✓     |
| Decomposition: observed −0.18 to −0.07        | as captioned        | index.md:526                             | ✓     |
| Decomposition notes: country mean −0.127, grand −0.124, time means −0.189→−0.076 | matches | index.md:526                  | ✓     |
| SE notes: df 1,195 vs 1,038; 157 df; 7–22%    | as shown            | index.md:548                             | ✓     |
| SE notes: log(n+g+d) 0.0182 vs 0.0222         | as shown            | index.md:553; se CSV                     | ✓     |
| Within R² 0.177 vs adj R² 0.755               | as shown            | index.md:359, 362, 575                   | ✓     |
| 6-line code skeleton (aggregate / demean / lm)| illustrative `{.r}` | index.md:407–426, 447–451 (algebra match)| ✓     |
| Bignum notes: t = −14.8                        | −14.8               | index.md:362 (post says −14.77)          | ✗ (LOW — notes only, see Issue #5) |

The single ✗ is in speaker notes (not on-slide), reported as a LOW (Issue #5).

---

## Title sequence (assertion-title test)

Read in order, the slide titles form the talk's abstract:

1. `feols(y ~ x | id + time)` gives you an answer — but what did it *do* to the data?
2. Two completely different R commands return the *same* coefficient
3. Where we're going
4. The lab: 150 countries, 8 periods, every cell filled
5. TWFE is OLS with a country intercept *and* a period intercept
6. The within transformation: subtract two means, add one back
7. Why add the grand mean back? Or you subtract the overlap twice
8. Frisch–Waugh–Lovell: residualize-then-regress equals the full regression
9. Two routes to the slope — climb roped-up, or strip the ropes first
10. Six lines reproduce TWFE by hand
11. The demeaned columns are centred at zero — to 15 decimal places
12. The two routes agree to 12 significant digits — max gap is machine epsilon
13. One number, two methods, zero disagreement
14. Demeaning *is* the picture: wide spread collapses to within-variation
15. Inside one country: observed minus two means, plus the grand mean
16. The catch: identical coefficients, but `lm()` standard errors are too small
17. The strongest objection — and the answer
18. What demeaning teaches: FE identifies *within* variation, nothing else
19. TWFE is just OLS on two-way-demeaned data — agree on β, never trust its naive SE.

**Verdict:** Coherent abstract. Strong assertion titles throughout (slides 5, 8, 12 each state a claim, not a label). The only blemish is the broken grammar of title 7 ("Or you subtract the overlap twice") — flagged as Issue #1, not a coherence gap.

---

## Positive highlights

- Slide 12's title "The two routes agree to 12 significant digits — max gap is machine epsilon" states the central result and its precision in nine words, then proves it in the table beside it.
- Act I opens with a genuine puzzle hook — slide 1 asks "what did it *do* to the data?" rather than an agenda — and slide 2 plants the spoiler figure before any derivation, exactly the write-slides Tension pattern.
- The closing divider (slide 19) is a single declarative thesis sentence — "TWFE is just OLS on two-way-demeaned data — agree on β, never trust its naive SE." — not "Questions?" / "Thank you".
- Speaker notes carry the prose load throughout, keeping the on-slide text to anchors; the Devil's-Advocate objection slide (17) is present and steelmans the lm()-only argument before rebutting it.
- Branding is byte-identical to the canonical templates (site-brand.scss and title-slide.html both diff clean) and the deck link uses the correct relative `url: slides/index.html`.

---

## Priority action items

1. **[MED]** Fix the slide-8 title (slides.qmd:121) — replace "Or you subtract the overlap twice" with "Miss it and you subtract the overlap twice" (Issue #1).
2. **[MED]** Rewrite the garbled slide-8 body sentence (slides.qmd:123) per the Dimension 5 rewrite (Issue #2).
3. **[MED]** Split the 38-word Response sentence on slide 17 (slides.qmd:262) into three short lines (Issue #3).
4. **[LOW]** Change the speaker-note t-stat from "−14.8" to "−14.77" to match the post (slides.qmd:229, Issue #5).

---

## Screenshots (HIGH-severity visual issues only)

None — no raw-LaTeX or clipping-overflow slide was detected. (The slide-audit.cjs OVERFLOW/word-count flags on the stacked divider sections are a measurement artifact of `section.present` aggregating vertical sub-slides; per-current-slide remeasurement showed 0 overflow and no on-slide content over the caps except the deliberate two-column contrast and the code slide.)

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_demeaning_twfe

To re-check just the dimensions fixed here:

    /project:review-slides r_demeaning_twfe focus: readability and grammar

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (Chromium via system Chrome channel)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs reported 5 "overflow" + climbing word counts; per-current-slide remeasurement (Reveal.getCurrentSlide) confirmed these are stacked-section aggregation artifacts, not real overflow.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
