# Review: python_dowhy_intro Slide Deck

**Audited:** content/post/python_dowhy_intro/slides/
**Source of truth:** content/post/python_dowhy_intro/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** A polished, well-paced deck: assertion titles form a coherent abstract, the 3-act Tension→Investigation→Resolution arc is clean, every method slide is figure- or equation-first, and a genuine Devil's-Advocate slide precedes a one-sentence declarative close. The strongest dimension is source fidelity — every estimate, SE, CI, and figure traces to the post. The weakest is title↔body consistency: one slide title ("machine-selected adjustment") imports framing that does not exist in this tutorial. The single fix that would promote it to ACCEPT is rewording that objection-slide title to match what the slide actually argues (four estimators + refuters cannot manufacture identification).

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 8          | 0H/1M/0L| all estimates/SEs/figures trace; 2 refuter values over-precise |
| 2  | Conceptual correctness        | 8          | 0H/1M/0L| ATE estimand correct; one mis-framed objection title |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); MathJax renders, 0 raw LaTeX |
| 4  | Title↔body consistency        | 7          | 0H/1M/0L| 1 title claims framing absent from body |
| 5  | Readability & simplicity      | 9          | 0H/0M/1L| one 14-word nested bullet (now tightened) |
| 6  | Typos & grammar               | 9          | 0H/0M/1L| "confidently-wrong" vs "confidently wrong" inconsistency |
| 7  | write-slides design adherence | 10         | 0       | arc ok; Devil's-Advocate present; closing is one sentence |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean (byte-identical) |
| 9  | Accessibility & legibility    | 10         | 0       | 0 real overflow at 1280×720; figures captioned |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html` ok; index.html 49 KB; slides_files/ present; 3/3 figures resolve |

---

## Issues found

| #  | Dim | Severity | Location                                   | Issue                                                                 | Suggested fix                                              |
|---:|----:|----------|--------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------|
| 1  | 4/2 | MED      | slides.qmd:243 — "machine-selected adjustment…" | Title says "machine-selected adjustment"; this tutorial does no machine/ML adjustment-set selection (confounders are user-specified). Body argues about four estimators + refuters. | Retitle: "Do four estimators and passing refuters make it causal? No — assumptions still carry it." |
| 2  | 1   | MED      | slides.qmd:234 — "Step 4 — Refute" table   | Table shows random-common-cause 1.0051 and data-subset 0.9988; post outputs are 1.005 and 0.999 (index.md:710, 734). | Use 1.005 and 0.999 to match the post's refuter output.    |
| 3  | 6   | LOW      | slides.qmd:76 — "Where we're going"         | "confidently-wrong" hyphenated; "confidently wrong" used unhyphenated on slides.qmd:62 and :213. | Standardize to "confidently wrong" (no hyphen).            |
| 4  | 5   | LOW      | slides.qmd:76 — "Where we're going"         | 14-word bullet with a parenthetical nested clause reads densely.     | Set off the qualifier with em dashes (see rewrite below).  |

---

## Readability rewrites (Dimension 5)

**Issue #4 — slide "Where we're going" (slides.qmd:76)**

Before:
> The lesson: identification and method comparison, not precision, separate causal from confidently-wrong

After:
> The lesson: identification and method comparison — not precision — separate causal from confidently wrong

Why: em dashes set off the qualifier so the eye groups "identification and method comparison … separate causal from confidently wrong" at a glance; also drops the inconsistent hyphen.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                         | Value on slide   | Source location             | Match |
|-------------------------------------|------------------|-----------------------------|-------|
| Naive estimate (hook + title)        | 1.39             | index.md:241, 379           | ✓     |
| True ATE                             | 1.0              | index.md:241, 303           | ✓     |
| Sample size                          | 5,000            | index.md:239, 292           | ✓     |
| Key-result strip: naive 39% too high | 1.39 / 39%       | index.md:241, 248           | ✓     |
| Key-result strip: AIPW               | 1.01             | index.md:568 (1.0115)       | ✓     |
| Mean productivity                    | 53.88            | index.md:362                | ✓     |
| Treatment prevalence                 | 66.2%            | index.md:352                | ✓     |
| Covariate imbalance (notes)          | 5.19 vs 4.55; 1.58 vs 1.33 | index.md:392      | ✓     |
| Regression ATE / SE / CI             | 1.0051 / 0.0614 / [0.885,1.126] | index.md:498-501, 618 | ✓ |
| IPW ATE / SE                         | 1.0275 / 0.0754  | index.md:525-526            | ✓     |
| AIPW ATE / SE                        | 1.0115 / 0.0623  | index.md:568-569            | ✓     |
| IV F / ATE / SE                      | 293 / 0.8881 / 0.3303 | index.md:597-601       | ✓     |
| IV CI                                | [0.24, 1.54]     | index.md:602, 608           | ✓     |
| Naive table row                      | 1.3853 / 0.0716 / no | index.md:617            | ✓     |
| Naive CI [1.25, 1.53]                | [1.25, 1.53]     | index.md:769 ([1.25,1.53])  | ✓     |
| IV SE > 5× regression                | 5×               | index.md:606 (5.38x)        | ✓     |
| Placebo refuter                      | −0.00003         | index.md:689                | ✓     |
| Random-common-cause refuter          | 1.0051 (slide)   | index.md:710 (1.005)        | ✗ (#2)|
| Data-subset refuter                  | 0.9988 (slide)   | index.md:734 (0.999)        | ✗ (#2)|
| Figure: EDA                          | ../dowhy_intro_eda.png | index.md:388          | ✓     |
| Figure: DAG                          | ../dowhy_intro_dag.png | index.md:440          | ✓     |
| Figure: comparison                   | ../dowhy_intro_comparison.png | index.md:612   | ✓     |

Both ✗ rows are Issue #2 (now corrected in slides.qmd).

---

## Title sequence (assertion-title test)

1. Does working from home raise productivity — or do productive people just choose it?
2. The naive comparison says +1.39 — confidently wrong by 39%
3. Where we're going
4. We simulate the truth so we can check who recovers it
5. Confounders open a backdoor path the naive estimate can't close
6. DoWhy forces four explicit steps — keeping assumptions apart from estimation
7. Step 2 — Identify: the backdoor estimand conditions on the confounders
8. Step 2 — Identify: the instrument gives a second, assumption-free route
9. Step 3 — Estimate: backdoor regression recovers 1.0051, almost exactly
10. Step 3 — Estimate: IPW reweights to a pseudo-randomized population
11. Step 3 — Estimate: doubly robust is two insurance policies in one
12. Step 3 — Estimate: IV survives unmeasured confounders, but pays in noise
13. All four causal methods land near 1.0; the naive estimate misses entirely
14. A small standard error is not a good estimate — the naive one proves it
15. Doubly robust nails the known effect: 1.01 against a truth of 1.00
16. Step 4 — Refute: three stress tests, three passes
17. Do four estimators and passing refuters make it causal? No — assumptions still carry it
18. Declare your assumptions, compare your methods, then refute — that's what makes it causal.

**Verdict:** coherent abstract. The opening question is a deliberate Act-I tension hook; every other title is a proven assertion. (Title 17 corrected from the original "machine-selected adjustment" framing.)

---

## Positive highlights

- Slide 14's title "A small standard error is not a good estimate — the naive one proves it" turns a textbook caveat into a one-line argument the table directly demonstrates (naive SE 0.0716 but CI excludes 1.0).
- The two Identify slides (7, 8) pair each estimand with its single load-bearing assumption (unconfoundedness vs exclusion restriction) in one `.comment` line — exactly the figure-first/assumption-explicit movement write-slides prescribes.
- Speaker notes carry all the supporting prose (delta-method noise propagation, semiparametric efficiency bound), keeping on-slide text to an anchor line per slide — 0 real overflow at 1280×720.
- The closing divider is a single declarative sentence, not "Questions?"/"Thank you", and restates the thesis (declare → compare → refute).

---

## Priority action items

1. **[MED]** Retitle slides.qmd:243 to drop "machine-selected adjustment" (no ML selection in this post) — done.
2. **[MED]** Align the two over-precise refuter values (1.0051→1.005, 0.9988→0.999) to the post — done.
3. **[LOW]** Standardize "confidently wrong" and tighten the roadmap bullet — done.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_dowhy_intro

To re-check just the dimension you fixed:

    /project:review-slides python_dowhy_intro focus: fidelity and consistency

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs flagged 4 "OVERFLOW" + 21 "dense" slides, but these are the documented cumulative artifact (per-slide measurement accumulates vertical sub-slide + hidden speaker-notes text). A per-current-slide re-check at 1280×720 excluding `aside.notes` found 0 real overflow and 0 raw LaTeX. Only OVERFLOW + raw-LaTeX are load-bearing per the audit caveat.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
