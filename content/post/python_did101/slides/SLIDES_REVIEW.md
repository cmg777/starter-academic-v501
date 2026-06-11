# Review: python_did101 Slide Deck

**Audited:** content/post/python_did101/slides/
**Source of truth:** content/post/python_did101/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** A clean, well-built Teaching deck with strong assertion titles, a coherent 3-act arc, correct Pandoc math escaping, and numbers that all trace to the post. The single ship-blocker is a copy-paste leak on the Devil's-Advocate slide: its title asks "Does LASSO-style flexibility make this causal?" — but there is no LASSO anywhere in this DiD deck or post, and the slide body is correctly about precision vs. identification. Source fidelity (Dim 1) is the strongest dimension; title↔body consistency (Dim 4) is the weakest, dragged down solely by that one leaked title. Fixing that title (and aligning the slide-17 question to its DiD body) promotes the deck to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 9          | 0H/0M/1L| every number/figure/table traces to index.md |
| 2  | Conceptual correctness        | 7          | 0H/1M/0L| estimand (ATT) correct; one leaked-method title |
| 3  | Technical & render correctness| 10         | 0H/0M/0L| smoke-test PASS (15/15); math renders; 0 raw LaTeX |
| 4  | Title↔body consistency        | 5          | 1H/0M/0L| slide 17 title contradicts its body    |
| 5  | Readability & simplicity      | 9          | 0H/0M/1L| no overflow; titles concise; one label title |
| 6  | Typos & grammar               | 10         | 0H/0M/0L| no `--`; consistent terminology        |
| 7  | write-slides design adherence | 9          | 0H/0M/1L| 3-act arc ok; Devil's-Advocate present; one label title |
| 8  | Branding integrity            | 10         | 0H/0M/0L| scss + title-slide diffs CLEAN         |
| 9  | Accessibility & legibility    | 10         | 0H/0M/0L| every figure captioned; no real overflow |
| 10 | Deliverable completeness      | 10         | 0H/0M/0L| link `slides/index.html` ok; files present |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 4   | HIGH     | slide 17 — slides.qmd:231         | Title "Does LASSO-style flexibility make this causal? No — assumptions still carry it" references LASSO, which appears nowhere in this DiD deck/post; the body is about precision vs. identification. Leaked from another template. | Retitle to match the body: "Does precision make this causal? No — the assumptions still carry it" |
| 2  | 2   | MED      | slide 17 — slides.qmd:231         | Same leak: "LASSO-style flexibility" is conceptually wrong for a DiD/TWFE method slide. | Same fix as #1 (drop the LASSO framing). |
| 3  | 1   | LOW      | slide 5 — slides.qmd:92           | Title rounds 10.88 to "11-point trend" (acceptable for a title; exact value is in the table below). | Keep; rounding in a title is fine. |
| 4  | 5/7 | LOW      | slide 3 — slides.qmd:70           | "Where we're going" is a label (agenda) title, not an assertion. Acceptable for a Teaching deck, but it breaks the assertion-title sequence. | Optional: "The plan: from naive before-after to an 8-period event study". |

Order: HIGH first, then MED, then LOW. Numbered consecutively across dimensions.

---

## Readability rewrites (Dimension 5)

No readability HIGH/MED findings. On-slide sentences are short, active, and figure-first; no slide overflows the box (verified excluding hidden speaker-notes text). One optional LOW polish:

**Issue #4 — slide 3 "Where we're going"**

Before:
> Where we're going

After:
> The plan: from naive before-after to an 8-period event study

Why: converts a label/agenda title into a short assertion so the title sequence reads as a coherent abstract. Optional (a label agenda slide is allowed in a Teaching deck).

---

## HIGH-issue rewrites

**Issue #1 — Title↔body — slide 17 (slides.qmd:231)**

Before:
> ## Does LASSO-style flexibility make this causal? No — assumptions still carry it

After:
> ## Does precision make this causal? No — the assumptions still carry it

Why: There is no LASSO in this deck or the source post. The body objection ("the estimate is precise and the pre-trends are flat — surely DiD has proven tutoring caused the gain") and rebuttal ("Precision is not identification … valid only under parallel trends and SUTVA") are about precision, not LASSO. The new title is proven by the body verbatim.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide   | Source location                  | Match |
|--------------------------------------|------------------|----------------------------------|-------|
| Treated schools / total              | 10 of 35         | index.md:76, 78                  | ✓     |
| Treated pre→post GPA                 | 60.17 → 96.37    | index.md:76, 1034                | ✓     |
| Naive change                         | 36.20            | index.md:76, 1034                | ✓     |
| Comparison pre→post GPA              | 71.22 → 82.10    | index.md:78, 1109                | ✓     |
| Comparison change (secular trend)    | +10.88           | index.md:1109, 1064              | ✓     |
| DiD double-difference                | 36.20−10.88=25.32| index.md:1119                    | ✓     |
| Counterfactual post mean             | 71.05            | index.md:1074                    | ✓     |
| ATT                                  | 25.32            | index.md:78, 1075                | ✓     |
| Naive overstatement                  | +43%             | index.md:1078                    | ✓     |
| OLS coefs (71.22, −11.05, +10.89, 25.32) | as listed    | index.md:1167–1170               | ✓     |
| TWFE estimate                        | 25.315           | index.md:1195                    | ✓     |
| TWFE+cov estimate                    | 25.328           | index.md:1222                    | ✓     |
| Estimate range                       | 25.315–25.328    | index.md:1272                    | ✓     |
| SE range (CRV1 0.585 … CRV3 0.637)   | 0.585 / 0.637    | index.md:1306–1308               | ✓     |
| Event-study leads                    | 0.34, −0.32, 0.59| index.md:1601, 1609–1611         | ✓     |
| Lead p-values                        | p > 0.17         | index.md:1601                    | ✓     |
| Event table t=0 / t=3                | 25.03 / 25.70    | index.md:1613, 1616              | ✓     |
| Event treatment onset                | period 5         | index.md:1547                    | ✓     |
| R² near 0.995                        | ~0.995           | index.md:1197, 1225              | ✓     |
| Figure: did101_its.png               | naive before-after | index.md:1039 (same figure)    | ✓     |
| Figure: did101_panelview.png         | 2×2 panel        | index.md:1015                    | ✓     |
| Figure: did101_counterfactual.png    | 3-line counterfactual | index.md:1080               | ✓     |
| Figure: did101_coefplot.png          | coefficient plot | index.md:1506                    | ✓     |
| Figure: did101_se_comparison.png     | SE comparison    | index.md:1315                    | ✓     |
| Figure: did101_event_study.png       | event-study plot | index.md:1597                    | ✓     |
| Figure: did101_panelview_event.png   | event panel      | index.md:1547                    | ✓     |

All numbers, tables, equations, and 7/7 figures trace to the source post. No invented or altered results.

---

## Title sequence (assertion-title test)

1. Tutored schools' GPA jumped 36 points — case closed?
2. The naive before-after attributes the entire 36-point rise to the program
3. Where we're going  *(label — minor)*
4. A clean 2×2 lab: 35 schools, 2 periods, simultaneous treatment
5. The comparison group reveals an 11-point trend the program never caused
6. DiD is a double difference: 36.20 minus 10.88 equals 25.32
7. The counterfactual: where treated schools would have landed without tutoring
8. DiD identifies the ATT, not the ATE, under parallel trends
9. A treated×post interaction recovers the same 25.32 — with every coefficient a group mean
10. Two-way fixed effects absorb school and time — leaving only the interaction
11. Three specifications, one answer: 25.315 to 25.328
12. Inference flavours barely move the needle when the signal is this strong
13. The program raises GPA by 25.32 points — not 36.20
14. Pre-trends are flat and effects jump immediately — a textbook event study
15. The numbers behind the picture: silent leads, loud lags
16. Event-study panel confirms the design: treatment switches on at period 5
17. Does LASSO-style flexibility make this causal? No — assumptions still carry it  *(BROKEN — LASSO leak)*
18. (closing) A credible comparison group, not the variance estimator, is what makes the effect causal.

**Verdict:** coherent abstract except slide 17, whose title references LASSO (a different method). With slide 17 retitled to a precision-vs-identification assertion, the sequence reads as a complete one-line-per-slide abstract.

---

## Positive highlights

- Slide 6's title "DiD is a double difference: 36.20 minus 10.88 equals 25.32" teaches the entire identification idea in one arithmetic line, then proves it with the two stacked equations below.
- Slide 8 names the estimand explicitly — "DiD identifies the ATT, not the ATE, under parallel trends" — exactly as the post is careful to do; the rebuttal slide later reinforces that flat pre-trends are supportive, not proof.
- Pandoc math escaping is correct throughout (`$Y_{it}$`, `$\gamma_i$`, not the Goldmark `\_` form), and the browser pass found 0 raw-LaTeX slides.
- The closing divider is a single declarative thesis sentence (not "Questions?"/"Thank you"), and a genuine Devil's-Advocate slide precedes it.

---

## Priority action items

1. **[HIGH]** Retitle slide 17 (slides.qmd:231) from the LASSO leak to "Does precision make this causal? No — the assumptions still carry it" so the title matches its DiD body and the assertion-title sequence stays coherent.
2. **[LOW]** Optionally convert slide 3's label title "Where we're going" to an assertion.

---

## Screenshots (HIGH-severity visual issues only)

None — the browser pass found 0 real overflow and 0 unrendered-math slides (the raw audit's overflow/density flags were artifacts of counting hidden `.notes` text and off-screen stacked vertical sub-slides).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_did101

To re-check just the dimension you fixed:

    /project:review-slides python_did101 focus: consistency

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: The vendored slide-audit.cjs reports word counts that include hidden speaker-notes text and treats `#`-divider vertical stacks unevenly, inflating its WORDS/OVERFLOW flags; a notes-excluding re-check confirmed no slide overflows the 1280×720 box.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
