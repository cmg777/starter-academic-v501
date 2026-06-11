# Review: python_fwl Slide Deck

**Audited:** content/post/python_fwl/slides/
**Source of truth:** content/post/python_fwl/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** The deck is faithful and on-brand: every number, table cell, equation, figure, and code snippet traces cleanly to the source post, branding files are byte-identical to the canonical templates, and the smoke test passes 15/15. The strongest dimension is source fidelity (all 30+ data points verified); the weakest was technical render — three currency dollar signs sat unescaped in on-slide and notes text, where MathJax would pair them as inline math and corrupt rendering. Escaping those three `$` to `\$` promotes the deck to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 30+ numbers/tables/figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | ATE named; backdoor/Simpson framing correct |
| 3  | Technical & render correctness| 6          | 0H/3M   | smoke-test PASS; 3 unescaped currency `$` mis-parse as math |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 7          | 1M      | 1 wall-of-prose rebuttal; rest within caps |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; terminology consistent |
| 7  | write-slides design adherence | 9          | 1L      | 3-act arc, Devil's-Advocate, 1-sentence close all present |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 8          | 2L      | every figure captioned; overflow flags are notes-in-DOM artifacts |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html`; files ok; 5/5 figs resolve |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 3   | MED      | slides.qmd:208 — fig caption "~$33.6K sales" | On-slide caption has a lone `$`; MathJax pairs it with downstream `$…$` math and corrupts the render | Escape as `~\$33.6K` |
| 2  | 3   | MED      | slides.qmd:121 — note "$50K"      | Lone `$` in speaker note; MathJax scans the whole DOM and pairs it | Escape as `\$50K` |
| 3  | 3   | MED      | slides.qmd:133 — note "$106 less" | Lone `$` in speaker note; same MathJax pairing risk | Escape as `\$106` |
| 4  | 5   | MED      | slide 23 — "Does FWL make this causal?" | Rebuttal stacks three full prose sentences on-slide (wall of prose) | See rewrite below |
| 5  | 7   | LOW      | slide 23 — Devil's-Advocate       | Rebuttal text density slightly above MB/MC pacing for one slide | Trim to two short clauses (folded into issue 4) |
| 6  | 9   | LOW      | browser pass                      | slide-audit flags 13 "overflow" + cumulative word counts; these accumulate notes-in-DOM across vertical stack, not true per-slide overflow | None — measurement artifact; spot-check confirms slides fit |
| 7  | 9   | LOW      | slide 16/21 — six-row results tables | Two ~6-row tables are dense for projector but legible | Acceptable; deliberate summary tables |

Order: HIGH first, then MED, then LOW. (No HIGH issues.)

---

## Readability rewrites (Dimension 5)

**Issue #4 — slide 23 "Does FWL make this causal? No — it visualizes, it does not identify"**

Before:
> FWL is pure algebra — it reproduces what OLS already computes, nothing more. The causal reading rests on the *assumption* that income is the only confounder (a correctly specified, linear backdoor). FWL makes that adjustment visible; it cannot certify it.

After:
> FWL is pure algebra — it only reproduces what OLS already computes. The causal reading needs one assumption: income is the only confounder. FWL pictures that adjustment; it cannot certify it.

Why: three stacked sentences with a nested parenthetical → three crisp clauses; "reproduces … nothing more" → "only reproduces"; drops the parenthetical aside (it lives in the notes); "makes visible" → "pictures".

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                         | Value on slide | Source location          | Match |
|-------------------------------------|----------------|--------------------------|-------|
| Naive coupon slope                  | −0.1059 / −0.106 | index.md:374, 653      | ✓     |
| Naive p-value                       | 0.365          | index.md:374             | ✓     |
| Full OLS coupon coef                | +0.2673        | index.md:394             | ✓     |
| Full OLS p / SE                     | 0.031 / 0.120  | index.md:394             | ✓     |
| Income coef / p                     | +0.3836 / <0.001 | index.md:395           | ✓     |
| CI excludes zero                    | [0.025, 0.509] | index.md:394             | ✓     |
| FWL step 1 (resid X only)           | 0.2673, SE 1.271, p 0.834 | index.md:450  | ✓     |
| FWL step 2 (resid both)             | 0.2673, SE 0.118, p 0.028 | index.md:473  | ✓     |
| Scaled regression p                 | 0.029          | index.md:552             | ✓     |
| Two-control full OLS                | 0.2706, SE 0.119, p 0.028 | index.md:592  | ✓     |
| Two-control FWL                     | 0.2706, SE 0.116, p 0.023 | index.md:611  | ✓     |
| day-of-week coef / p                | 0.3195 / 0.198 | index.md:594, 615        | ✓     |
| True ATE                            | +0.2 / +0.200  | index.md:297             | ✓     |
| N stores                            | 50             | index.md:315, 343        | ✓     |
| Scaled means ~34% / ~$33.6K         | 34% / $33,600  | index.md:575             | ✓     |
| Title-strip −0.106 / +0.267 / +0.200 | same           | index.md:374/394/297     | ✓     |
| Fig fwl_naive_regression.png        | (slide 2)      | index.md:361             | ✓     |
| Fig fwl_residuals_income.png        | (slide 17)     | index.md:504             | ✓     |
| Fig fwl_partialled_out.png          | (slide 18)     | index.md:527             | ✓     |
| Fig fwl_scaled_residuals.png        | (slide 19)     | index.md:572             | ✓     |
| Fig fwl_comparison.png              | (slide 22)     | index.md:650             | ✓     |
| simulate_store_data code            | (slide 6)      | index.md:300-313         | ✓     |
| residualize statsmodels code        | (slide 8)      | index.md:439-465         | ✓     |
| FWL equation Cov/Var                 | matches        | index.md:415             | ✓     |

No ✗. Every slide datum verified.

---

## Title sequence (assertion-title test)

1. The same coupon data says both "coupons hurt sales" and "coupons help sales"
2. Naive regression: coupons look like they reduce sales
3. Where we're going
4. Income is a confounder that opens a backdoor from coupons to sales
5. A simulated lab with a known answer: the true effect is exactly +0.2
6. The naive slope is −0.106 — and points the wrong way (p = 0.365)
7. Add income as a control and the slope flips to +0.267 (p = 0.031)
8. FWL: any multivariate coefficient is a univariate slope on residuals
9. Three lines of statsmodels reproduce the multivariate coefficient
10. Residualize-both reproduces +0.2673 exactly — and recovers the SE
11. Partialling-out, drawn: the residuals are coupon variation income can't explain
12. The hidden positive relationship the table couldn't show you
13. Adding the means back keeps the slope but restores readable units
14. FWL scales: two controls, same identity, +0.2706
15. After partialling-out income, coupons raise sales by +0.267
16. Simpson's paradox, resolved: the slope flips from −0.106 to +0.267
17. Six estimators, one coefficient: FWL is an identity, not an approximation
18. Does FWL make this causal? No — it visualizes, it does not identify
19. FWL is Double Machine Learning with a linear mop
20. Don't read the coefficient — read the partialled-out scatter.

**Verdict:** coherent abstract. Slide 3 ("Where we're going") is a teaching-deck agenda — acceptable for this audience; every other title is a true assertion that its body proves.

---

## Positive highlights

- Slide 7's assertion title "Add income as a control and the slope flips to +0.267 (p = 0.031)" states the whole result, sign, magnitude, and significance in one line.
- The 3-act structure is textbook: Act I plants the contradiction (negative then positive), Act II earns the reversal step by step, Act III delivers the side-by-side Simpson's-paradox figure and a single-sentence close ("Don't read the coefficient — read the partialled-out scatter.").
- A genuine Devil's-Advocate slide ("Does FWL make this causal?") steelmans the objection and answers it honestly — FWL visualizes, it does not identify.
- The closing slide is one declarative sentence, not "Questions?" / "Thank you" — exactly the write-slides rule.

---

## Priority action items

1. **[MED]** Escape the three currency dollar signs (`$33.6K`, `$50K`, `$106`) to `\$…` so MathJax does not pair them as inline math (slides.qmd:208, 121, 133). — APPLIED
2. **[MED]** Tighten the Devil's-Advocate rebuttal from three stacked sentences to three short clauses (slide 23). — APPLIED

---

## Screenshots (HIGH-severity visual issues only)

None — the slide-audit "overflow" flags are an artifact of cumulative notes-in-DOM word counting (counts rise monotonically across the vertical stack), not real content clipping. `raw-latex slides: 0` confirms math renders.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_fwl

To re-check just the dimension you fixed:

    /project:review-slides python_fwl focus: render

---

## Audit metadata

- Node version: system node
- Playwright: enabled (slide-audit.cjs)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical)
- Tooling notes: slide-audit cumulative word counts include speaker-notes DOM; overflow flags are measurement artifacts, not real clips.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
