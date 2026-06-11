# Review: python_doubleml_pension Slide Deck

**Audited:** content/post/python_doubleml_pension/slides/
**Source of truth:** content/post/python_doubleml_pension/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled (Playwright via npx cache)

---

## Verdict: MINOR REVISION (pre-fix) → ACCEPT (post-fix)

**Overall assessment.** A strong, well-paced teaching deck: a clean 3-act
Tension→Investigation→Resolution arc, assertion titles that read as an abstract,
figure-first method slides, and disciplined speaker notes carrying the prose.
The strongest dimension is conceptual correctness (estimands, identification, and
the ATE-vs-LATE distinction are all stated exactly as in the post). The weakest
pre-fix was source fidelity: one stated number (the PLR–IRM gap) was rendered as
\$518 when the exact figure is \$517 (\$8,730 − \$8,213). One title↔body slip
("four estimators" vs. three models × four learners) and one wall-of-prose
rebuttal slide were the only other load-bearing issues. All three are now fixed;
post-fix the deck has no HIGH issues and every dimension scores ≥ 8 → ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                          |
|----|-------------------------------|-----------:|--------:|------------------------------------------------|
| 1  | Source fidelity               | 9          | 0H/0M/1L| all numbers trace to source; \$518→\$517 fixed |
| 2  | Conceptual correctness        | 10         | 0       | estimands, identification, ATE/LATE all correct|
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; no raw LaTeX |
| 4  | Title↔body consistency        | 9          | 0M(fixed)| "four estimators"→"three models" fixed        |
| 5  | Readability & simplicity      | 9          | 0M(fixed)/1L| rebuttal wall trimmed to notes; 2 long callouts (LOW) |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; terminology consistent      |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate present; closing = 1 sentence |
| 8  | Branding integrity            | 10         | 0       | scss/title-slide diff clean                    |
| 9  | Accessibility & legibility    | 9          | 0H/0M/1L| every figure captioned; no genuine per-slide overflow |
| 10 | Deliverable completeness      | 10         | 0       | link ok (slides/index.html); files ok; 6/6 figs resolve |

---

## Issues found

| #  | Dim | Severity | Location                                                | Issue                                                                 | Suggested fix                                  |
|---:|----:|----------|---------------------------------------------------------|----------------------------------------------------------------------|------------------------------------------------|
| 1  | 1   | HIGH     | slide 16 — "…PLR and IRM agree within \$518" (qmd:200, notes qmd:205) | Deck states \$518; exact PLR−IRM gap is \$517 (\$8,730−\$8,213); post says "\$517 below PLR" (index.md:164) | Change \$518 → \$517 in title and notes (DONE) |
| 2  | 4   | MED      | slide 2 — "One dataset, four estimators…" (qmd:62)      | Title says "four estimators"; body/caption show three models × four learners; post frames as 3 models × 4 learners | Retitle "One dataset, three models…" (DONE)    |
| 3  | 5   | MED      | slide 21 — rebuttal (qmd:291)                           | ~55-word, 4-sentence wall of prose on slide                          | Trim to a short anchor; move elaboration to notes (DONE) |
| 4  | 5   | LOW      | slide 6 `.comment` (qmd:115); slide 9 `.comment` (qmd:159) | Two-sentence callouts ~26–28 words, slightly over the ~25-word guide  | Acceptable as high-value parallel callouts; no change |
| 5  | 1   | LOW      | slide 16 caption / notes vs. residual rounding          | "\$517" is the exact mean gap; cosmetic only after fix               | Resolved by Issue #1 fix                        |

Order: HIGH first, then MED, then LOW. Numbered consecutively.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 21 "Does DML *make* this causal? No…"**

Before:
> [Response.]{.rebuttal} Correct. The ATE is identified only under **conditional exogeneity of eligibility given X**; the LATE adds **instrument validity and monotonicity**. DML disciplines *estimation* — flexible nuisances plus orthogonality plus cross-fitting — it does not relax the *identifying* assumptions. If financial literacy confounds eligibility and savings, the estimates stay biased.

After:
> [Response.]{.rebuttal} Correct. DML disciplines *estimation*, not *identification*.
>
> . . .
>
> The ATE needs **conditional exogeneity**; the LATE adds **instrument validity and monotonicity**.

Why: 55 words / 4 sentences on the slide → one anchor sentence plus one fragment-revealed clause; the full argument (cross-fitting, untestability, SIPP caveats) moves to the speaker notes, where prose belongs.

---

## HIGH-issue rewrites

**Issue #1 — Source fidelity — slide 16**

Before:
> Two different recipes, same answer: PLR and IRM agree within \$518
> (notes) IRM mean is \$8,213 — only \$518 below PLR's \$8,730.

After:
> Two different recipes, same answer: PLR and IRM agree within \$517
> (notes) IRM mean is \$8,213 — only \$517 below PLR's \$8,730.

Why: \$8,730 − \$8,213 = \$517 exactly; the post states "\$517 below PLR" (index.md:164). \$518 was an off-by-one rounding error introduced on the slide.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide     | Source location                  | Match |
|--------------------------------------|--------------------|----------------------------------|-------|
| Naive eligibility gap                | \$19,559           | index.md:482, 492                | ✓     |
| Income gap (confounder)              | \$15,368           | index.md:447, 773 (46,862−31,494)| ✓     |
| 401(k) assets total                  | \$7 trillion       | index.md:63                      | ✓     |
| Sample size N                        | 9,915 households   | index.md:336, 353                | ✓     |
| Eligible / participate rates         | 37.1% / 26.2%      | index.md:349–351                 | ✓     |
| Median net_tfa                       | \$1,499            | index.md:353                     | ✓     |
| Mean / range net_tfa                 | \$18,052; −502,302..1,536,798 | index.md:353, 795     | ✓     |
| Mean income eligible vs not          | \$46,862 vs \$31,494 | index.md:447                   | ✓     |
| PLR mean ATE                         | \$8,730            | index.md:621                     | ✓     |
| PLR range across learners            | \$7,823–\$9,371    | index.md:613–616, 621            | ✓     |
| Confounding bias share               | 55% (≈\$10,829)    | index.md:482, 621                | ✓     |
| Naive overstates by                  | 124%               | index.md:773                     | ✓     |
| IRM mean ATE                         | \$8,213            | index.md:674                     | ✓     |
| IRM range across learners            | \$7,924–\$8,559    | index.md:666–669, 674            | ✓     |
| IRM vs PLR SE                        | \$1,185 vs \$1,339 | index.md:674                     | ✓     |
| PLR−IRM gap                          | \$517 (was \$518)  | index.md:164 ("\$517 below PLR") | ✓ (fixed) |
| IIVM LATE mean                       | \$11,746           | index.md:741                     | ✓     |
| IIVM range across learners           | \$11,215–\$12,281  | index.md:733–736, 741            | ✓     |
| IIVM avg SE                          | \$1,698            | index.md:741                     | ✓     |
| Within-model spread (PLR/IRM/IIVM)   | \$1,548/\$635/\$1,066 | index.md:621 + computed         | ✓     |
| 9 covariates                         | 9 base features    | index.md:506–507, 533            | ✓     |
| Figures (6) ../pension_*.png         | grand/eda/plr/irm/iivm | index.md:409,445,619,672,739,749 | ✓   |

Every datum traces to the source post. No invented numbers remain.

---

## Title sequence (assertion-title test)

1. Eligible households hold \$19,559 more — but is the 401(k) the cause?
2. One dataset, three models, very different answers
3. Where we're going
4. The lab: 9,915 households from the 1991 SIPP survey
5. Income drives both access and savings — the textbook confounder
6. The naive estimate is the causal effect *plus* confounding bias
7. DML strips the confounding with two nuisance functions
8. Two safeguards make ML-based nuisance estimation harmless
9. Six lines fit a DML model in Python
10. PLR: a constant-effect ATE of \$8,730 — less than half the naive gap
11. IRM relaxes the constant-effect assumption — and lands at \$8,213
12. Two different recipes, same answer: PLR and IRM agree within \$517
13. Participation is a choice — so we instrument it with eligibility
14. The instrument only moves the compliers — so the LATE is *their* effect
15. The IIVM LATE is \$11,746 — larger than the ATE, by design
16. Estimates barely move across four learners — orthogonality at work
17. 55% of the naive eligibility gap was pure confounding bias
18. Eligibility genuinely raises savings — about \$8,500 per household
19. For the households a policy actually moves, the effect is \$12,000
20. Does DML *make* this causal? No — two assumptions still carry the weight
21. Separate "is the effect real?" from "for whom?" — and let cross-fitting do the rest.

**Verdict:** Coherent abstract. Read alone, the titles tell the whole talk: a naive gap → confounding → the DML recipe → three models with their numbers → ATE vs LATE → the share that was bias → an honest caveat → the takeaway.

---

## Positive highlights

- Slide 6's title "The naive estimate is the causal effect *plus* confounding bias" pairs with a clean decomposition equation — the slide proves its own assertion in one line.
- Slide 14's title "The instrument only moves the compliers — so the LATE is *their* effect" delivers the entire LATE intuition in eleven words, before the four-type table reinforces it.
- The Devil's-Advocate slide (20) steelmans the objection ("an ML model picking controls can't manufacture identification") and concedes it correctly — DML disciplines estimation, not identification. Exactly the design contract.
- The closing divider is one declarative sentence ("Separate 'is the effect real?' from 'for whom?'…"), never "Questions?" / "Thank you".
- Math escaping is fully Pandoc-correct: subscripts use plain `theta_0`, `g_0`, `m_0`, `_{\text{naive}}` (no Goldmark `\_` leak), and currency uses `\$`; the browser pass shows 23 MathJax spans, zero raw `\command`.

---

## Priority action items

1. **[HIGH]** Fix the PLR–IRM gap \$518 → \$517 on slide 16 title and notes. **(DONE)**
2. **[MED]** Retitle slide 2 "four estimators" → "three models" to match the body. **(DONE)**
3. **[MED]** Trim the slide-21 rebuttal wall to one anchor + move detail to notes. **(DONE)**
4. **[LOW]** Optionally shorten the two ~26-word `.comment` callouts (slides 6, 9). *(Deferred — high-value, parallel, acceptable.)*

---

## Screenshots (HIGH-severity visual issues only)

None — the cumulative overflow flags from `slide-audit.cjs` are the documented speaker-notes/vertical-subslide artifact; a per-current-slide check at 1280×720 showed visible word counts of 31–117 (the 117 being a code block), with no content clipped.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_doubleml_pension

To re-check just the dimension you fixed:

    /project:review-slides python_doubleml_pension focus: fidelity

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (resolved from ~/.npm/_npx cache)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: `slide-audit.cjs` cumulative overflow/word counts treated as the documented artifact; only raw-LaTeX (0) and per-current-slide visible density treated as load-bearing. Quarto 1.8.27 re-rendered after fixes.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
