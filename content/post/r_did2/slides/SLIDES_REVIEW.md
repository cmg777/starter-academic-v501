# Review: r_did2 Slide Deck

**Audited:** content/post/r_did2/slides/
**Source of truth:** content/post/r_did2/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is a strong, source-faithful, on-brand deck. Every number on every slide traces to the post (all 30+ checked data points match to the rounding shown), the smoke test passes 15/15, branding is byte-identical to the canonical templates, math typesets cleanly (0 raw-LaTeX slides, 67 MathJax spans), and there is no real content clipping. The strongest dimension is Source fidelity (every figure, table cell, and coefficient verified); the weakest is Readability, where three assertion titles run 13–15 words and one Act-I hook stacks three sentences — all LOW polish, none blocking. The one fix that most improves the deck is tightening the two longest titles (slides 5 and 1).

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers/figures/tables trace to index.md |
| 2  | Conceptual correctness        | 10         | 0       | ATT estimand correct; weighting-as-estimand framing preserved |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; 0 raw LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes; coherent abstract |
| 5  | Readability & simplicity      | 8          | 0H/0M/3L| 3 long titles + 1 multi-sentence hook  |
| 6  | Typos & grammar               | 10         | 0       | clean; em-dashes correct                |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate present; 1-sentence close |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide diffs clean          |
| 9  | Accessibility & legibility    | 10         | 0       | every figure captioned; no clipping (worst=0px) |
| 10 | Deliverable completeness      | 10         | 0       | link ok (slides/index.html); files present |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | LOW      | slide 5 — "A switch in weights silently moves 11 points of mass between the two biggest cohorts" | 15-word title; "11 points of mass" is jargon for the lede | Tighten to "Weighting shifts 11 points of mass between the two biggest cohorts" |
| 2  | 5   | LOW      | slide 1 — "Same data, opposite answers — and the only thing that changed was the weights" | 13-word title with a trailing clause | Tighten to "Same data, opposite answers — only the weights changed" |
| 3  | 5   | LOW      | slide 1 (body, slides.qmd:56)     | Hook stacks three sentences on one slide       | Acceptable as the fragment-revealed Act-I hook; left as-is (deliberate) |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 5 "A switch in weights silently moves 11 points of mass between the two biggest cohorts"**

Before:
> A switch in weights silently moves 11 points of mass between the two biggest cohorts

After:
> Weighting shifts 11 points of mass between the two biggest cohorts

Why: 15 words → 10; drops "A switch in / silently" filler; the `.comment` gloss below already carries the nuance.

**Issue #2 — slide 1 "Same data, opposite answers — and the only thing that changed was the weights"**

Before:
> Same data, opposite answers — and the only thing that changed was the weights

After:
> Same data, opposite answers — only the weights changed

Why: 13 words → 7; "the only thing that changed was" → "only … changed" (active, shorter); the punch lands faster.

**Issue #3 — slide 1 body (slides.qmd:56)**

Before:
> In the simplest four-cell DiD, *unweighted* says $+0.12$ deaths per 100,000 (no help). *Population-weighted* says $-2.56$ (lives saved). *Which number is the answer?*

After:
> (left as-is)

Why: Three short sentences, but they are the deliberate fragment-revealed Act-I hook (unweighted → weighted → the question), the one place the rules explicitly permit a dense "jump-scare" line for rhetorical effect. Not changed.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                              | Value on slide        | Source location          | Match |
|------------------------------------------|-----------------------|--------------------------|-------|
| 2x2 ATT unweighted                       | $+0.122$ / $+0.12$    | index.md:378, 68, 1080   | ✓     |
| 2x2 ATT weighted                         | $-2.563$ / $-2.56$    | index.md:379, 68, 1080   | ✓     |
| Pre-period gap (unw/wt)                  | $-54.77$ / $-53.68$   | index.md:392, 423        | ✓     |
| Cohort table (1,222/978/404 counties)    | 46.9/37.6/15.6%; 38.2/49.5/12.4% | index.md:329–333 | ✓ |
| TWFE SEs (unw/wt)                         | 3.75 / 1.49           | index.md:499             | ✓     |
| Weighted CI                              | $[-5.48, +0.36]$      | index.md:499             | ✓     |
| Norm-diff (white/income/poverty/unemp)   | +0.586/+0.427/−0.423/+0.503/+0.685 | index.md:561–571 | ✓ |
| DRDID table (6 cells)                     | −1.615…−3.756         | index.md:682–687         | ✓     |
| 2xT ATT(e) at e=5 + CI                    | $+16.96$; [+6.83,+27.09] | index.md:788, 811     | ✓     |
| 2xT aggregate (unw/wt)                    | $+9.43$ / $-0.68$     | index.md:811             | ✓     |
| By-cohort (2014/2015/2016)                | +9.43→−0.68; +4.94→+10.04; −12.57 (93 cty) | index.md:874–877, 898 | ✓ |
| GxT aggregate + gaps                      | $+7.92$ / $+0.27$; 10.1→7.7 | index.md:976, 1084  | ✓     |
| HonestDiD bounds at M̄=0                   | [+2.01,+14.09]; [−6.07,+6.07] | index.md:1034, 1042 | ✓ |
| Summary-table gaps                        | 2.69/2.53/10.11/7.65  | index.md:1080–1084       | ✓     |
| DRDID weighted point ± se                 | $-3.76 \pm 3.29$      | index.md:1094            | ✓     |
| Figures r_did2_01…08 (7 used)             | all present on disk   | smoke-test 7/7 resolve   | ✓     |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. Same data, opposite answers — only the weights changed
2. The 2x2 DiD flips sign when you weight by population
3. Where we're going *(Teaching agenda — permitted)*
4. The estimand: an ATT whose weight *is* the question
5. Weighting shifts 11 points of mass between the two biggest cohorts
6. On a balanced 2x2, Levels = TWFE = Long-difference — they are one estimator
7. Three TWFE specs collapse onto two points — the form is interchangeable, the weight is not
8. Expansion counties were whiter, richer, and worse-overlapping — so adjust
9. Doubly robust DRDID is consistent if *either* model is right
10. Covariate adjustment nudges the point but the weighting gap survives intact
11. The 2x2 throws away nine years — the event study uses them all
12. After expansion, the unweighted path climbs to +16.96 while the weighted stays flat
13. Callaway–Sant'Anna uses *all* the timing — one ATT(g,t) per cohort-year cell
14. Four cohorts, four stories — the 2014 cohort flips sign with weighting
15. Pool the cohorts and the weighted dynamic path still hugs zero
16. The headline: weighting moves the answer by −2.56 deaths per 100,000
17. Across five stages, the weighting gap dwarfs the method gap
18. HonestDiD: every conclusion collapses by M̄ = 0.25
19. Does the staggered machinery make this causal? No — assumptions still carry the weight
20. Underpowered data, two estimands — not better and worse answers to one question
21. When units differ in size, choosing the weight *is* choosing the causal question.

**Verdict:** coherent abstract. Read alone, the titles narrate the whole talk: a sign-flip puzzle → the weighting-is-the-estimand thesis → method invariance → covariate adjustment → staggered estimators → sensitivity → a one-sentence thesis. No gaps, no label titles.

---

## Positive highlights

- Slide 6's title "On a balanced 2x2, Levels = TWFE = Long-difference — they are one estimator" states the manuscript's algebraic Result 1 as an assertion the code chunk then proves — exemplary figure/code-serves-title design.
- Slide 19 is a genuine Devil's-Advocate ("Does the staggered machinery make this causal? No"), steelmanning the objection before the rebuttal — exactly the Seminar/Working requirement.
- The unweighted-vs-weighted contrast is carried as a single thread across all 8 method stages, and the closing slide ("choosing the weight *is* choosing the causal question") names the thesis in one declarative sentence.
- Every prose explanation lives in `::: {.notes}`; the slide bodies are figures, one equation with a one-line `.comment` gloss, or a short table — the slide-serves-the-spoken-word law is honored throughout.

---

## Priority action items

1. **[LOW]** Shorten slide 5's title to "Weighting shifts 11 points of mass between the two biggest cohorts" (15→10 words).
2. **[LOW]** Shorten slide 1's title to "Same data, opposite answers — only the weights changed" (13→7 words).

≤ 5 items.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_did2

To re-check just the dimension you fixed:

    /project:review-slides r_did2 focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs cumulative word/bullet/overflow counts are a known vertical-stack + speaker-notes artifact; per-slide re-measurement at 1280×720 (notes excluded) found 0 real overflow (worst child overhang = 0px on every slide) and 0 raw-LaTeX slides.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
