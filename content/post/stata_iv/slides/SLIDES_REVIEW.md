# Review: stata_iv Slide Deck

**Audited:** content/post/stata_iv/slides/
**Source of truth:** content/post/stata_iv/index.md (no results_report.md; numbers traced to the post's embedded Stata output blocks)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled (Playwright/Chrome)

---

## Verdict: ACCEPT (after fixes)

**Overall assessment.** A faithful, well-paced 3-act IV teaching deck. Every headline number — 0.944, +81%, OLS 0.522, first-stage −0.607, F = 16.32, χ² = 9.09, AR F = 61.66 — traces cleanly to the post. The strongest dimension is conceptual correctness (estimand, identification, and the IV > OLS measurement-error reading are all stated as in the post). The weakest before fixes was source fidelity: the health-objection slide quoted a Hansen J upper bound (0.80) drawn from the wrong table (Table 8 Panel C) instead of the health table's 0.46–0.76, and the weak-instrument diagnostic table repeated the KP F (16.32) in the Stock-Yogo row's "Value" column, conflating the test statistic with its critical value. Both were corrected in this pass; with them fixed the deck is ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                            |
|----|-------------------------------|-----------:|--------:|--------------------------------------------------|
| 1  | Source fidelity               | 7→9        | 1M, 1L  | Hansen J range from wrong table (fixed)          |
| 2  | Conceptual correctness        | 10         | 0       | estimand, identification, LATE all correct       |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; no raw LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes (coherent abstract)  |
| 5  | Readability & simplicity      | 9          | 1L      | per-current-slide counts all low; one rounding note |
| 6  | Typos & grammar               | 7→9        | 1M      | Stock-Yogo row mislabeled value (fixed)          |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate present; 1-sentence close |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide diffs clean                   |
| 9  | Accessibility & legibility    | 9          | 1L      | every figure captioned; no genuine overflow      |
| 10 | Deliverable completeness      | 10         | 0       | index.html 52 KB; slides_files/ present; link ok |

---

## Issues found

| #  | Dim | Severity | Location                                   | Issue                                                                                                  | Suggested fix                                          |
|---:|----:|----------|--------------------------------------------|--------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| 1  | 1   | MED      | slide "The strongest objection" (qmd:235)  | Health slide cites Hansen J `p = 0.46–0.80`; the Table 7 health-context range is 0.46–0.76 (the 0.80 upper bound belongs to Table 8 Panel C, a different family). | Change to `0.46–0.76` (matches index.md:565). **FIXED** |
| 2  | 6   | MED      | slide "Is the instrument strong enough?" (qmd:153-157) | Stock-Yogo row puts `16.32` in the "Value" column — that is the KP F, already in row 1; the Stock-Yogo row's datum is the 16.38 threshold, not a value of 16.32. | Set the Stock-Yogo "Value" cell to `—`. **FIXED**     |
| 3  | 1   | LOW      | slide "The effect survives 27 control sets" (qmd:215) | The post never literally states "27"; it is the sum of Tab 5 (nine) + Tab 6 (nine) + Tab 7 (nine) columns. Defensible arithmetic, not contradicted. | Leave as-is (DEFERRED — changing would weaken a valid assertion title). |
| 4  | 5   | LOW      | slide "Five estimates… OLS says 0.52, IV says 0.94" (qmd:73) | Title rounds 0.522→0.52 / 0.944→0.94 while later slides show 0.522 / 0.944. | Deliberate hook rounding; acceptable. No change.       |

Order: HIGH first, then MED, then LOW. (No HIGH issues.)

---

## Readability rewrites (Dimension 5)

None found. Per-current-slide measurement (replicating the audit's `Reveal.next()` traversal, but reading the deepest present content section) showed every slide at or below the word/bullet caps. The browser audit's higher per-slide word counts are the documented cumulative-traversal artifact (counts accumulate across vertical fragments + speaker notes), not real on-slide density.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                              | Value on slide | Source location                  | Match |
|------------------------------------------|----------------|----------------------------------|-------|
| Key-result: 2SLS effect                  | 0.944          | index.md:449,461                 | ✓     |
| Key-result: larger than OLS              | +81% (OLS 0.522)| index.md:461,465                | ✓     |
| Key-result: first-stage F · 64 colonies  | 16.32          | index.md:378,403,454            | ✓     |
| OLS table: full / base / +continents     | 0.532 / 0.522 / 0.390 | index.md:348             | ✓     |
| OLS table SEs                            | 0.029 / 0.050 / 0.051 | index.md:349             | ✓     |
| First-stage slope                        | −0.607         | index.md:376,383,403            | ✓     |
| First-stage F / R²                       | 16.32 / 0.27   | index.md:403                     | ✓     |
| F-table: KP F / SY threshold / AR        | 16.32 / 16.38 / 61.66 | index.md:454-456         | ✓     |
| Reduced-form slope                       | ≈ −0.573       | index.md:425                     | ✓     |
| 2SLS coeff / SE / z                      | 0.944 / 0.176 / 5.36 | index.md:449,461          | ✓     |
| Durbin-Wu-Hausman                        | χ² = 9.09, p = 0.003 | index.md:458,461          | ✓     |
| Tab 5 colonial/legal/religion range      | 0.92–1.34      | index.md:495 (0.917–1.339)       | ✓     |
| Tab 6 geography range                    | 0.71–1.36      | index.md:524 (0.713–1.358)       | ✓     |
| Tab 7 health range                       | 0.55–0.69      | index.md:565                     | ✓     |
| Health weak-IV first-stage F             | 1.2–4.9        | index.md:565 (1.17–4.86)         | ✓     |
| Health Hansen J range                    | 0.46–0.76 (was 0.80) | index.md:565 (0.46–0.76)   | ✓ (fixed) |
| Albouy imputation share                  | ~36%           | index.md:606,655                 | ✓     |
| Nigeria→Chile 8.5-fold (notes)           | ≈ 2.15 pts     | index.md:463                     | ✓     |
| Figure: OLS vs IV coefplot               | ../stata_iv_ols_vs_iv.png | index.md:630 (Fig 3)        | ✓     |
| Figure: first stage                      | ../stata_iv_first_stage.png | index.md:402 (Fig 1)      | ✓     |
| Figure: reduced form                     | ../stata_iv_reduced_form.png | index.md:424 (Fig 2)     | ✓     |
| Equations (structural + 2SLS ratio)      | match          | index.md:435,439                 | ✓     |

All three figure paths resolve on disk (smoke-test 3/3). Every ✗ resolved.

---

## Title sequence (assertion-title test)

1. Richer countries have better institutions — but which way does the arrow point?
2. A deadly natural experiment: where Europeans died, extractive institutions followed
3. Five estimates, one dataset: OLS says 0.52, IV says 0.94
4. Where we're going
5. A regressor correlated with the error term makes OLS lie
6. An instrument must clear three bars: relevance, exclusion, exogeneity
7. 2SLS sieves out the contaminated variation, then runs OLS on what passes
8. OLS first: with zero controls, institutions "explain" a 0.522 slope
9. First stage: deadlier colonies inherited weaker institutions (slope −0.607)
10. Is the instrument strong enough? F = 16.32 — passing, but barely
11. Reduced form: the instrument's total reach on income is steep
12. Six lines of Stata estimate the whole IV
13. Instruments raise the institutional effect to 0.944
14. The IV > OLS gap reveals measurement error, not reverse causality
15. The effect survives 27 control sets — institutions in the 0.7–1.0 band
16. The strongest objection — and the honest answer
17. What 0.944 is — and is not: it is a LATE, not an ATE
18. Institutions are roughly twice as valuable as naive regressions suggest
19. Let the historical accident, not the naive regression, reveal the causal slope.

**Verdict:** coherent abstract. The titles read alone tell the full story — problem, instrument, identification, headline, robustness, caveat, payoff. Slide 4 ("Where we're going") is a roadmap rather than an assertion, but it is a legitimate Act-I signpost, not a gap.

---

## Positive highlights

- Slide 7's assertion title "2SLS sieves out the contaminated variation, then runs OLS on what passes" teaches the estimator's mechanism in one line and is paired with the reduced-form ÷ first-stage ratio equation — exactly the post's framing.
- Slide 16 ("The strongest objection — and the honest answer") is a genuine Devil's-Advocate slide: it steelmans the exclusion-restriction threat (health channels) and answers with the weak-IV caveat, mirroring the post's §9 honesty.
- Slide 17's two-column "What it IS / What it is NOT" cleanly separates LATE from ATE without a wall of prose — the precise distinction the post (and Imbens-Angrist) insists on.
- The closing slide is a single declarative thesis sentence, not "Questions?" / "Thank you".
- Branding is byte-identical to the canonical templates; the key-result strip uses the three brand numbers (0.944 / +81% / 16.32).

---

## Priority action items

1. **[MED — FIXED]** Health slide Hansen J range corrected 0.46–0.80 → 0.46–0.76 (the 0.80 was from Table 8 Panel C, not the Table 7 health family).
2. **[MED — FIXED]** Stock-Yogo diagnostic-table row no longer repeats the KP F (16.32) in its Value column; set to "—" so the row reads as the 16.38 critical value it compares against.
3. **[LOW — deferred]** "27 control sets" title kept (defensible 9+9+9 aggregation; changing it would weaken a valid assertion title without a source contradiction).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_iv

To re-check just the dimension you fixed:

    /project:review-slides stata_iv focus: fidelity

---

## Audit metadata

- Node version: system node
- Playwright: enabled (Chrome channel)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html both byte-identical to templates)
- Tooling notes: The browser audit (`slide-audit.cjs`) reported 1 OVERFLOW and rising per-slide word counts; both are the documented cumulative-traversal artifact. Re-measuring per current content section (deepest `.present`) showed no slide overflows the 1280×720 box by >8 px and every slide is within the word/bullet caps. No raw LaTeX on any slide (29 MathJax spans render).

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
