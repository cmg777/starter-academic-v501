# Review: r_dynamic_bma Slide Deck

**Audited:** content/post/r_dynamic_bma/slides/
**Source of truth:** content/post/r_dynamic_bma/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** A faithful, well-paced teaching deck. Source fidelity is
the strongest dimension — every PIP, PMP, jointness value, and prior-sensitivity
figure traces cleanly to `index.md`; branding is byte-identical to the canonical
templates; the smoke test passes 15/15; and no slide actually overflows the
1280×720 box (the audit script's 7 "overflow" flags are the documented cumulative
`.reveal` artifact, not real clipping). The one blocker is on the closing
Resolution slide: its title claims "~5%" convergence per decade while the equation
directly beneath it shows `α ≈ 0.92 ⇒ 1 − α ≈ 0.08` (8%) — a title↔body
contradiction (and the arithmetically correct figure for α = 0.92 is 8%). Fixing
that one title promotes the deck to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 9          | 0H/0M/1L | all numbers trace; one post-internal ambiguity flagged |
| 2  | Conceptual correctness        | 10         | 0       | estimand/identification stated correctly; Devil's-Advocate present |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders; no raw LaTeX; no `\_`/`\$` issues |
| 4  | Title↔body consistency        | 5          | 1H      | resolution slide title 5% vs body equation 8% |
| 5  | Readability & simplicity      | 9          | 0H/0M/1L | one ~16-word title; no real density/overflow |
| 6  | Typos & grammar               | 10         | 0       | clean; em-dashes correct; consistent terms |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; assertion titles; closing = one sentence |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide diffs clean |
| 9  | Accessibility & legibility    | 10         | 0       | all figures captioned; no overflow; color not sole signal |
| 10 | Deliverable completeness      | 10         | 0       | qmd + index.html (55 KB) + slides_files/; link `url: slides/index.html` |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 4   | HIGH     | slide 23 — "GDP is highly persistent — only ~5% of the steady-state gap closes per decade" | Title says ~5%; the displayed equation says `1 − α ≈ 0.08` (8%). For α ≈ 0.92 the speed is 8%, so title and body disagree. | Change title figure to "~8%" to match the slide's own equation and §3.2 of the post. |
| 2  | 1   | LOW      | slide 23 — same                   | The post itself is internally inconsistent: the abstract pairs "0.92" with "5%", while §3.2 pairs "0.92" with "8%". The 5% derives from the best-model α = 0.954, the 8% from the BMA mean α ≈ 0.92. | Deck should use 8% (consistent with the 0.92 used in its own equation and key-result strip). No source change needed; this is a heads-up. |
| 3  | 5   | LOW      | slide 23 title                    | 16-word assertion title slightly over the ~15-word guide. | Optional trim (see rewrite). Not blocking. |

Order: HIGH first, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 23 "GDP is highly persistent — only ~5% of the steady-state gap closes per decade"**

Before:
> GDP is highly persistent — only ~5% of the steady-state gap closes per decade

After:
> GDP is highly persistent — only ~8% of the steady-state gap closes per decade

Why: 16 words is just over the ~15-word guide, but the title reads cleanly and the
edit here is the fidelity fix (5% → 8%), not a length cut; kept as-is otherwise.

---

## HIGH-issue rewrites

**Issue #1 — Dimension 4 (Title↔body) — slide 23**

Before (title):
> GDP is highly persistent — only ~5% of the steady-state gap closes per decade

After (title):
> GDP is highly persistent — only ~8% of the steady-state gap closes per decade

The body equation `$$\alpha \approx 0.92 \;\Rightarrow\; \text{convergence speed} = 1 - \alpha \approx 0.08 \text{ per decade}$$`
already states 0.08 = 8%; the title now agrees with it.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide      | Source location                | Match |
|--------------------------------------|---------------------|--------------------------------|-------|
| Population PIP (binomial)            | 0.990               | index.md:513 / 521             | ✓     |
| Life expectancy PIP                  | 0.864               | index.md:517 / 521             | ✓     |
| Investment share PIP                 | 0.773               | index.md:510 / 826             | ✓     |
| Best-model PMP                       | 8.9% (0.089)        | index.md:679 / 682             | ✓     |
| Kitchen-sink lag GDP coef            | 0.619               | index.md:468 / 486             | ✓     |
| Kitchen-sink trade openness          | 0.120, p=0.002      | index.md:474                   | ✓     |
| Kitchen-sink education               | 0.016, p=0.632      | index.md:470                   | ✓     |
| Kitchen-sink life expectancy         | 0.115, p=0.637      | index.md:476                   | ✓     |
| Kitchen-sink R²; N                   | 0.988; 292 (notes)  | index.md:481 / 480             | ✓     |
| BMA posterior mean lag GDP           | 0.919               | index.md:509 / 486             | ✓     |
| Expected size prior→post (binomial)  | 4.5 → 6.908         | index.md:651                   | ✓     |
| Expected size (binomial-beta)        | 8.556               | index.md:652                   | ✓     |
| Population coef histogram center     | ~0.12               | index.md:753                   | ✓     |
| Sensitivity: pop range               | 0.964–0.998         | index.md:824 / 1039 / 812      | ✓     |
| Sensitivity: lnlex range             | 0.637–0.974         | index.md:825 / 1043 / 812      | ✓     |
| Sensitivity: ish 0.773→0.483 (EMS2)  | 0.773 → 0.483       | index.md:840 / 897             | ✓     |
| Sensitivity: democracy EMS2          | 0.372               | index.md:902                   | ✓     |
| Dilution: expected size 6.91 → 6.53  | 6.91 → 6.53         | index.md:877                   | ✓     |
| Dilution: ish 0.773 → 0.718          | 0.773 → 0.718       | index.md:866 / 877             | ✓     |
| Jointness pop×lnlex                   | 0.711               | index.md:974 / 982             | ✓     |
| Jointness pop×ish; pop×opem           | 0.530; 0.517        | index.md:971 / 976 / 982       | ✓     |
| Jointness binomial-beta peak          | 0.944               | index.md:978 / 984             | ✓     |
| Findings table (4 rows)               | 0.990/0.998/0.964 … | index.md:895–902               | ✓     |
| Persistence α range (notes)           | 0.919–0.943         | index.md:509 / 1013 / 1035     | ✓     |
| Convergence speed (slide 23)          | 5% (title) / 8% (eq)| index.md:55 (5%) vs 274 (8%)   | ✗ (Issue #1) |
| All 7 figure paths `../r_*.png`       | resolve             | on disk (smoke-test 7/7)       | ✓     |

The single ✗ is Issue #1.

---

## Title sequence (assertion-title test)

1. A government asks: which of 9 levers actually accelerates growth?
2. With 9 candidates there are 512 models — and no reason to trust just one
3. Where we're going
4. Cross-sectional BMA assumes strict exogeneity — and growth data breaks it
5. The Solow model makes lagged GDP unavoidable, not optional
6. Weak exogeneity buys realism: past feedback allowed, current shock forbidden
7. Estimate all 512 models by marginal likelihood, not R-squared
8. Kitchen-sink FE finds 6 of 10 significant — but the verdict reshuffles
9. BMA grades each variable on a continuous PIP scale — population leads at 0.990
10. Population is the single most robust determinant: PIP = 0.990
11. The data concentrates posterior mass on a few large models
12. The posterior wants big models — expected size jumps from 4.5 to ~7
13. The best single model carries only 8.9% of the mass — no model is "the" model
14. Posterior coefficients: population and life expectancy clear zero cleanly
15. Population's coefficient is tight, positive, and centered near 0.12
16. A skeptical prior is the real test — only population and life expectancy survive it
17. A dilution prior penalizes redundant controls — the ranking holds
18. Population and life expectancy are complements, not substitutes — jointness 0.711
19. GDP is highly persistent — only ~8% of the steady-state gap closes per decade
20. Controlling for reverse causality leaves population and public health standing
21. Does dynamic panel BMA make these causal? No — it disciplines, it doesn't identify
22. Once reverse causality is handled, only population and public health hold up.

**Verdict:** coherent abstract. "Where we're going" (slide 3) is a permitted
teaching-audience agenda; every other title is a proven assertion. The sequence
reads as a complete, ordered summary of the talk.

---

## Positive highlights

- Slide 5's title "The Solow model makes lagged GDP unavoidable, not optional"
  states the identification claim in seven words — and the slide pairs the dynamic
  equation with the one-line consequence ("omitting it assumes α = 0").
- Slide 21 ("Does dynamic panel BMA make these causal? No — it disciplines, it
  doesn't identify") is a genuine Devil's-Advocate slide with objection/rebuttal,
  exactly what a Seminar/Working deck needs near the end.
- The two `{background-color="#141413"}` big-number slides (PIP 0.990; PMP 8.9%)
  give the deck rhythm — dense figure slides alternate with single-number anchors.
- All prose lives in `::: {.notes}`; on-slide text is one assertion + one comment,
  never a wall — the slide-serves-the-spoken-word law is well honored.
- Closing slide is one declarative sentence (not "Questions?"/"Thank you").

---

## Priority action items

1. **[HIGH]** Change slide 23's title from "~5%" to "~8%" so it agrees with its own
   displayed equation (`1 − α ≈ 0.08`) and with §3.2 of the post.

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow or unrendered-math issue detected in the browser pass.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_dynamic_bma

To re-check just the dimension you fixed:

    /project:review-slides r_dynamic_bma focus: consistency

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (npx cache; system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical)
- Tooling notes: per-current-slide overflow re-verified at 1280×720
  (`Reveal.getCurrentSlide().scrollHeight == clientHeight` on every slide); the
  slide-audit.cjs "7 overflow / 25 dense" counts are the cumulative `.reveal`
  traversal artifact, not real clipping.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
