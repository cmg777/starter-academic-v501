# Review: python_iv Slide Deck

**Audited:** content/post/python_iv/slides/
**Source of truth:** content/post/python_iv/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** A faithful, on-brand, and unusually readable deck: every on-slide number traces to the post, the 3-act arc is clean, the titles read alone as a coherent abstract, and the closing slide is a single declarative thesis. The strongest dimension is source fidelity (all numbers verified); the weakest is conceptual correctness, dragged down by one speaker-note leak ("LASSO-free…") copied from a LASSO-deck template into an IV tutorial. Fixing that one note promotes the deck to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers/figures trace to index.md  |
| 2  | Conceptual correctness        | 7          | 1 MED   | "LASSO-free" note irrelevant to IV     |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders  |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 9          | 1 LOW   | 0 over-length on-slide; 0 dense (real) |
| 6  | Typos & grammar               | 10         | 0       | clean; em-dashes; no `--`              |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate; closing ok|
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none; figures captioned       |
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html`; files ok     |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 2   | MED      | slides.qmd:258 — notes, slide "0.944 is a LATE" | Speaker note opens "LASSO-free but assumption-bound" — a copy-paste leak from a LASSO/double-LASSO deck template; IV has nothing to do with LASSO | Drop the "LASSO-free but " clause; start the note at "2SLS recovers a complier effect…" |
| 2  | 5   | LOW      | slides.qmd:56 — slide "Richer countries…arrow points" | Three stacked prose sentences in the hook fragment; slightly document-like | Optional: trim to two short lines (see rewrite) |

Order: HIGH first, then MED, then LOW. None HIGH.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide 1 "Richer countries have better institutions…"**

Before:
> But maybe rich countries simply *afford* better courts. Maybe geography drives both. *The slope is correlation; it cannot prove cause.*

After:
> But maybe rich countries simply *afford* better courts — or geography drives both.
> *The slope is correlation; it cannot prove cause.*

Why: collapses three sentences into two short lines; one hook idea per line. (LOW — the original is already short and punchy; this is polish, not a defect.)

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                         | Value on slide          | Source location               | Match |
|-------------------------------------|-------------------------|-------------------------------|-------|
| OLS slope (base sample)             | 0.522 (SE 0.050)        | index.md §4 Table 2 Col 2 / §6 | ✓     |
| 2SLS effect                         | 0.944                   | index.md §6 / Abstract        | ✓     |
| 2SLS SE / 95% CI                    | 0.176 / [0.60, 1.29]    | index.md §6                   | ✓     |
| IV > OLS gap                        | +81%                    | index.md §6 / §13             | ✓     |
| First-stage slope                   | −0.607                  | index.md §5 Fig 1 caption     | ✓     |
| First-stage F                       | 16.85                   | index.md §5                   | ✓     |
| First-stage R²                      | 0.27                    | index.md Fig 1 caption        | ✓     |
| Reduced-form slope                  | ≈ −0.573                | index.md §5 Fig 2 caption     | ✓     |
| Ratio identity                      | −0.573/−0.607 = 0.944   | index.md §5 / §6              | ✓     |
| Wu-Hausman F / p                    | 24.22 / < 0.0001        | index.md §6                   | ✓     |
| Stock-Yogo threshold (in notes)     | 16.38                   | index.md §5                   | ✓     |
| Reduced-form GDP gap                | ~30× poorer; 3.4 log pts| index.md §5                   | ✓     |
| Mortality span                      | ~6 log points / 5.8     | index.md §3 / §5              | ✓     |
| Sample size                         | 64 ex-colonies          | index.md §3                   | ✓     |
| Income range                        | \$450–\$27,400; 60-fold | index.md §3                   | ✓     |
| Health-control coefficient          | 0.55–0.69               | index.md §9                   | ✓     |
| Hansen J p-values                   | 0.18–0.79               | index.md §10                  | ✓     |
| Albouy imputation share             | ~36%                    | index.md §10 / §13            | ✓     |
| Mean institutions shift (notes)     | 6.99 → 6.52             | index.md §3                   | ✓     |
| European-settler share (notes)      | 30% → 16%               | index.md §3                   | ✓     |
| Universe size                       | ~163-country world      | index.md Abstract / §3        | ✓     |
| Figure: first stage                 | ../python_iv_first_stage.png | index.md §5 (same figure)  | ✓     |
| Figure: reduced form                | ../python_iv_reduced_form.png | index.md §5 (same figure) | ✓     |
| Figure: OLS vs IV                   | ../python_iv_ols_vs_iv.png | index.md §11 (same figure)  | ✓     |

No ✗. Every slide datum traces to the source post.

---

## Title sequence (assertion-title test)

1. Richer countries have better institutions — but a correlation cannot tell us which way the arrow points
2. Across every specification, the causal effect lives near 0.9 — well above the OLS slope of 0.5
3. Where we're going
4. Institutions are endogenous, so OLS does not estimate the causal effect
5. The structural model: the error is correlated with the regressor — that is the whole problem
6. A valid instrument must clear three bars: relevance, exclusion, exogeneity
7. The lab: AJR's base sample of 64 ex-colonies, one instrument, a 60-fold income range
8. Relevance holds: a one-log-point rise in mortality cuts institutions by 0.607, F = 16.85
9. The reduced form confirms it: deadlier colonies are about 30 times poorer today
10. 2SLS is just one division: the reduced-form slope over the first-stage slope
11. Two libraries, one formula: pyfixest gives the estimate, linearmodels the diagnostics
12. Naive OLS sees only half the story: a slope of 0.522
13. The strongest objection — and the answer
14. Instrumenting institutions recovers a causal effect of 0.944 — Wu-Hausman confirms OLS was biased
15. The causal effect is 81% larger than OLS — measurement error, not endogeneity, dominated the bias
16. The 0.944 is a LATE for compliers, and it leans on assumptions only partly testable
17. Let the disease environment of 1700, not the regression of 1995, identify the effect of institutions.

**Verdict:** coherent abstract. "Where we're going" (3) is an acceptable teaching agenda; "The strongest objection — and the answer" (13) is a Devil's-Advocate frame. Both read naturally in sequence.

---

## Positive highlights

- Slide 10's title "2SLS is just one division: the reduced-form slope over the first-stage slope" turns the whole IV machinery into one memorable idea, then proves it with $-0.573/-0.607 = 0.944$ on the same slide.
- Slide 8's assertion title "Relevance holds: a one-log-point rise in mortality cuts institutions by 0.607, F = 16.85" states the claim and its evidence in the title — figure-first method slide done right.
- The closing slide (slides.qmd:261) is a single declarative thesis — "Let the disease environment of 1700, not the regression of 1995, identify the effect of institutions." — never "Questions?" / "Thank you".
- A genuine Devil's-Advocate slide (slides.qmd:199, Objection/Response) steelmans the health-channel threat and answers it with the 0.55–0.69 survival range — the strongest write-slides design move.
- Math is correctly plain `_` (e.g. `$Y_i$`, `$\hat\beta_{2SLS}$`) — no Goldmark `\_` artifacts — and currency uses `\$` for MathJax `processEscapes`; the browser pass confirms 0 raw-LaTeX slides.

---

## Priority action items

1. **[MED]** Remove the "LASSO-free but " template leak from the speaker note at slides.qmd:258 — it is irrelevant to an IV tutorial.
2. **[LOW]** Optionally tighten the slide-1 hook prose (slides.qmd:56) from three sentences to two short lines.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_iv

To re-check just the dimension you fixed:

    /project:review-slides python_iv focus: correctness

---

## Audit metadata

- Node version: (system node)
- Playwright: enabled (slide-audit.cjs browser pass ran)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit word/bullet counts are cumulative across vertical sub-slides + hidden notes (known artifact); load-bearing flags — 0 raw-latex, 0 overflow — both clean.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
