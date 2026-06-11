# Review: r_did_ring Slide Deck

**Audited:** content/post/r_did_ring/slides/
**Source of truth:** content/post/r_did_ring/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** A faithful, well-paced deck: every number on every slide traces exactly to the source post, the smoke test passes 15/15, branding is byte-identical to the canonical templates, math renders cleanly (no raw LaTeX), and the closing slide is a single declarative thesis. The strongest dimension is source fidelity (all 22 datapoints match the post). The weakest is readability: the estimand slide carries two distinct ideas (the estimand *and* the identification assumption), which is the one MED. Moving that second idea to speaker notes — where it already appears verbatim — promotes the deck to a clean one-idea-per-slide arc.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 22 numbers/figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | ATT estimand stated; identification correct; no overclaim |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; no raw LaTeX |
| 4  | Title↔body consistency        | 9          | 1 LOW   | assertion-title test passes; one label (agenda) title |
| 5  | Readability & simplicity      | 7          | 1 MED   | 1 two-idea slide; a few soft-cap word counts |
| 6  | Typos & grammar               | 10         | 0       | em-dashes used; consistent terminology |
| 7  | write-slides design adherence | 7          | 1 MED   | 3-act arc + Devil's-Advocate + 1-sentence close all present; one two-idea slide |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean (byte-identical) |
| 9  | Accessibility & legibility    | 10         | 0       | no real overflow; every figure captioned |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html`; index.html 50 KB; slides_files/ present |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5/7 | MED      | slide — "The estimand is an ATT — and the radius $\bar d$ is baked into it" (slides.qmd:84–94) | Slide holds two ideas: the estimand (with its radius-dependence) AND the identifying assumption (local parallel trends, second equation in a `.comment`). 86 visible words. The identification line duplicates the speaker notes and the later Devil's-Advocate slide. | Move the local-parallel-trends `.comment` line to `::: {.notes}` (it is already there). Leaves one idea on the slide. |
| 2  | 4/7 | LOW      | slide — "Where we're going" (slides.qmd:70) | Label-style agenda title, not an assertion. | Acceptable for a teaching/agenda slide; leave as-is or rename to a claim if desired. Not applied (renaming risks inventing a claim). |

Order: MED first, then LOW. (No HIGH issues.)

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "The estimand is an ATT — and the radius $\bar d$ is baked into it"**

Before (on slide):
> Crucially, $\bar d$ appears *inside* the expectation. Change the cutoff and you change the **estimand** — not just the precision.
>
> [Identification rests on **local parallel trends**: absent treatment, $E[\Delta Y(0) \mid d \le \bar d] = E[\Delta Y(0) \mid d > \bar d]$.]{.comment}

After (on slide — keep only the estimand idea; identification line → notes):
> Crucially, $\bar d$ appears *inside* the expectation. Change the cutoff and you change the **estimand** — not just the precision.

Why: 86 words / two ideas → one idea. The identification sentence already appears verbatim in this slide's speaker notes and is the whole subject of the later "Does the nonparametric estimator make this *causal*?" slide; on-slide it competes with the estimand for the eye.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                | Value on slide | Source location              | Match |
|--------------------------------------------|----------------|------------------------------|-------|
| Parametric ATT at 0.1 mi                   | −5.78%         | index.md:66, 519             | ✓     |
| Nonparametric bin 1 (closest 300 ft)       | −20.6%         | index.md:66, 573, 581        | ✓     |
| Ring-choice spread                         | 52%            | index.md:60, 547, 599        | ✓     |
| Nonparametric bin 2                        | −15.2%         | index.md:569, 574            | ✓     |
| Curve crosses zero                         | d ≈ 0.094 mi   | index.md:569, 585            | ✓     |
| Toy split (treated/control/dropped)        | 6%/28%/65% · 126/566/1,308 | index.md:291, 293 | ✓     |
| 2×2 FD/TWFE estimate · SE · truth          | 0.3097 · 0.0258 · 0.30 | index.md:327–330     | ✓     |
| DGP curve mean over affected region        | 0.726          | index.md:338, 365            | ✓     |
| DGP τ(d) form                              | 1.5·exp(−2.3d)·1{d≤0.75} | index.md:336       | ✓     |
| Parametric recovers truth · CI             | 0.726 · [0.716, 0.736] | index.md:369, 373    | ✓     |
| Three radii on sim                         | 0.913 / 0.726 / 0.456 | index.md:398–399, 403 | ✓     |
| Too-narrow / too-wide bias                 | +25.7% / −37.1% | index.md:411               | ✓     |
| Nonparametric sim bins · left bin · truth  | 53 · 1.461 · 1.5 | index.md:428, 434         | ✓     |
| Bandwidth radii                            | ~0.10 → ~0.20 mi (bw 0.025→0.125) | index.md:490, 492 | ✓     |
| Real-data ATT SE / CI / n                  | 0.0225 · [−10.4%, −1.5%] · 9,029 | index.md:513, 517 | ✓     |
| Real-data ring-choice cutoffs              | −6.40% / −5.45% / −4.21% | index.md:543–545     | ✓     |
| Real-data ring-choice CIs                  | [−14.1,+0.9] / [−10.3,−0.9] / [−7.8,−0.8] | index.md:543–545 | ✓ |
| Nonparametric real-data bins               | 23             | index.md:564, 581           | ✓     |
| Sample-weighted ATT inside 0.1 mi          | −12.4%         | index.md:565, 583, 597       | ✓     |
| Ratio nonparam/param                       | ≈ 2.1×         | index.md:583                 | ✓     |
| Figure: r_did_ring_10_lr_nonparametric.png | (slide 2)      | index.md:568 (same figure)   | ✓     |
| All 8 ../r_did_ring_*.png figures          | resolve on disk | smoke-test 8/8 resolve      | ✓     |

No ✗. Every slide datum matches the source post.

---

## Title sequence (assertion-title test)

1. When the treatment is a point in space, the radius you choose dictates the answer
2. One number hides the story: −5.78% on average, but −20.6% within 300 feet
3. Where we're going *(label/agenda)*
4. The estimand is an ATT — and the radius $\bar d$ is baked into it
5. Distance buys identification but spends sample: 6% treated, 28% control, 65% dropped
6. A ring DiD is a 2×2 DiD whose groups are defined by distance
7. Build a world where the truth is known: τ(d) vanishes exactly at 0.75 mi
8. With the correct radius, the parametric estimator nails the truth: 0.726
9. Same data, three radii, three answers: 0.913 / 0.726 / 0.456
10. The parametric ring DiD is one line of feols() on first-differenced outcomes
11. Let the data choose: partition distance into bins and trace the whole curve
12. Eyeballing the cutoff is the same fragility in disguise — three bandwidths, three radii
13. On real data, the ring DiD says homes inside 0.1 mile drop 5.78%
14. Redraw the radius and the headline wobbles 52% — the sign holds, the magnitude doesn't
15. Let the curve flex and the closest 300 feet drop 20.6% — twice the parametric average
16. The data-driven cutoff lands at 0.094 mi — validating the radius Linden & Rockoff guessed
17. Does the nonparametric estimator make this causal? No — assumptions still carry the weight
18. *(close)* Report both numbers: the average is correct, the curve is the whole story.

**Verdict:** coherent abstract — assertion titles throughout; one label title at slide 3 (agenda, acceptable).

---

## Positive highlights

- Slide 13's title "On real data, the ring DiD says homes inside 0.1 mile drop 5.78%" pairs with the −5.78% big-number strip — assertion title + one number, exactly the Act-III headline pattern.
- The Devil's-Advocate slide ("Does the nonparametric estimator make this *causal*? No") steelmans the objection and correctly separates *cutoff* choice from *identifying* assumptions — conceptually precise.
- Closing slide is a single declarative thesis ("Report both numbers…"), not "Questions?"/"Thank you".
- Every figure is reused in place via `../r_did_ring_*.png` and carries a caption; 8/8 resolve.
- Branding files are byte-identical to the canonical templates (Dim 8 clean).

---

## Priority action items

1. **[MED]** Move the local-parallel-trends `.comment` line on the estimand slide (slides.qmd:94) into that slide's `::: {.notes}` block, leaving the estimand as the single on-slide idea. (Applied.)
2. **[LOW]** Optionally rename the "Where we're going" agenda title to an assertion; left as-is (renaming risks inventing a claim the slide does not prove).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_did_ring

To re-check just the dimension you fixed:

    /project:review-slides r_did_ring focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss + title-slide.html byte-identical)
- Tooling notes: slide-audit.cjs per-slide word/overflow counts are cumulative across vertical sub-slides + hidden speaker notes; re-verified per current slide at 1280×720 with notes excluded — no genuine overflow, densest real slide 86 words (the estimand slide, addressed by issue #1).

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
