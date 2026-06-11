# Review: stata_cate2 Slide Deck

**Audited:** content/post/stata_cate2/slides/
**Source of truth:** content/post/stata_cate2/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** A faithful, well-built deck. Every on-slide number, table cell, figure, and equation traces to the source post; the math renders cleanly (no Goldmark `\_`-in-math bug, no raw LaTeX); branding is byte-identical to the canonical templates; the assertion titles read as a coherent abstract and the closing is one declarative sentence. The strongest dimension is **source fidelity** (all 22 traced datums match). The weakest was **readability**: one Devil's-Advocate slide stacked a four-sentence wall of prose — fixed in this pass by splitting it and moving detail to notes. No blockers; the deck was already ACCEPT-grade and is now marginally cleaner.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 22 numbers/figures/tables trace to source |
| 2  | Conceptual correctness        | 10         | 0       | estimand (CATE/ATE/GATE/IATE) correct; honest-overlap framing right |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders; 0 raw LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 8          | 1M/1L   | 1 wall-of-prose (fixed); glosses within limits |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; no `--`; terminology consistent |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate present; closing declarative |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 9          | 1L      | overflow flags are the cumulative-fragment artifact, not real clipping |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html`; files present; 6/6 figs resolve |

---

## Issues found

| #  | Dim | Severity | Location                                            | Issue                                                              | Suggested fix                                  |
|---:|----:|----------|-----------------------------------------------------|-------------------------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slide — "A random forest chooses controls…" (qmd:213) | Rebuttal stacks 4 sentences (~58 words) of prose on one slide      | Split: keep the assertion + identifying-assumption anchor, move the elaboration to `::: {.notes}` (APPLIED) |
| 2  | 1/6 | LOW      | source post index.md:1463 (not the deck)            | Post's `iateplot_exec` caption says "upward"; its prose (1473/1338) and the GATE bars say "downward". Deck says "downward" — faithful to the dominant claim | No deck change. Flag the post's own caption typo for a future post edit (out of scope here) |
| 3  | 9   | LOW      | slides 17–24 (browser pass)                          | slide-audit.cjs reports 8 "overflow" slides                        | No change: cumulative-fragment artifact (caveat); direct per-slide measurement shows content height 132–533 px < 720; `center: true` slides do not clip |

Order: MED first, then LOW. Numbered consecutively.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "A random forest chooses controls — it cannot relax identification"**

Before:
> [Response.] Correct. $\tau(\mathbf{x})$ is identified only under **conditional independence given $\mathbf{X}$** (unconfoundedness) and adequate **overlap**. The forest just estimates $g$ and $f$ flexibly; it can't rule out an omitted confounder. The 3-vs-2 contrast even *failed* on overlap — a feature, not a bug, of honest estimation.

After:
> [Response.] Correct. $\tau(\mathbf{x})$ is identified only under **conditional independence given $\mathbf{X}$** (unconfoundedness) and adequate **overlap**.
>
> . . .
>
> The forest estimates $g$ and $f$ — it cannot rule out an omitted confounder. The 3-vs-2 contrast even *failed* on overlap: a feature of honest estimation.

Why: a 4-sentence wall became an anchor (the identifying assumption) + a fragment-revealed coda; the "flexibly" elaboration moved to notes; "a feature, not a bug, of" → "a feature of". APPLIED.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                               | Value on slide | Source location                  | Match |
|-------------------------------------------|----------------|----------------------------------|-------|
| Key-result strip: mining lifts NTL        | +0.149         | index.md:663, 671 (AIPW 1-0)     | ✓     |
| Key-result strip: high-price premium      | +0.405         | index.md:749, 757 (AIPW 3-1)     | ✓     |
| Key-result strip: GATE test               | 96.90          | index.md:1092 (chi2(5))          | ✓     |
| GATE 1-0 by exec: 0.275 weakest           | 0.275          | index.md:1077, 1098              | ✓     |
| GATE 1-0 by exec: 0.051 strongest         | 0.051          | index.md:1082, 1098              | ✓     |
| AIPW ATE 1-0 / SE                         | 0.149 / 0.011  | index.md:663, 671                | ✓     |
| PO ATE 1-0                                | 0.194          | index.md:625, 671                | ✓     |
| PO−AIPW gap                               | 0.045          | index.md:244 (model-disagreement) | ✓    |
| Conflict AIPW 1-0 / baseline / pp         | 0.066 / 10.7% / 6.5 | index.md:936, 940           | ✓     |
| Price 3-1 AIPW                            | +0.405         | index.md:749, 757                | ✓     |
| Price 2-1 (medium vs low)                 | −0.011, p=0.90 | index.md:849, 1039               | ✓     |
| GATE 1-0 by QoG: 0.298 / 0.073            | 0.298 / 0.073  | index.md:1183, 1186, 1201        | ✓     |
| GATE QoG chi2(3)                          | 69.19          | index.md:1195                    | ✓     |
| Price 3-1 by QoG chi2(3) / p              | 5.81 / 0.121   | index.md:1239–1240, 1245         | ✓     |
| Subpop ATE weak (exec≤2) / SE / N         | 0.297 / 0.022 / 558  | index.md:1420, 1412, 1424   | ✓     |
| Subpop ATE strong (exec≥4) / SE / N       | 0.092 / 0.016 / 1,526 | index.md:1407, 1399, 1424  | ✓     |
| Conflict GATE range / chi2(5) / p         | 0.033–0.106 / 5.00 / 0.416 | index.md:1270–1284, 1290 | ✓    |
| IATE estat heterogeneity chi2(1)          | 53.05          | index.md:1349                    | ✓     |
| Linear projection R²                      | 0.024          | index.md:1438 (0.0235)           | ✓     |
| Naive 1-0 / 3-1 / 2-1 diffs               | 0.109 / 0.414 / 0.099 | index.md:500–503            | ✓     |
| Ground truths 1-0 / 3-1 / 2-1             | 0.25 / 0.30 / 0.05 | index.md:513–518             | ✓     |
| Panel: 300 districts × 10 yrs, 8 countries, 2003–2012 | matches | index.md:334, 379       | ✓     |
| Figures: 6 `../stata_cate2_*.png`         | all resolve    | index.md §8–9 figures            | ✓     |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. One average effect hides who mining actually helps
2. Stronger institutions, weaker mining benefit — the slope is the whole story
3. Where we're going
4. The estimand is a function of **x**, not a single number
5. A 3,000-row lab with ground-truth effects we can check against
6. A 4-level treatment becomes six binary CATE comparisons
7. Two estimators residualize the nuisance, then read off the signal
8. Six lines estimate a heterogeneous mining effect in Stata 19
9. Raw means are biased: mining districts differ before any mine opens
10. With cross-fit AIPW, mining raises nighttime lights by 0.149
11. Price effects don't ramp — they jump only at the top
12. A random forest chooses controls — it cannot relax identification
13. Institutions moderate mining: the GATE test is decisive
14. A second institutional measure tells the identical story
15. Subpopulation ATEs make the moderation concrete: 0.297 vs 0.092
16. Prices behave oppositely — institutions do not bend the price premium
17. And mining's conflict effect is positive everywhere but flat across institutions
18. Heterogeneity isn't just group-level: every district gets its own effect
19. The IATE function slopes down smoothly in institutional quality
20. Same data, same command, opposite conclusions about moderation
21. Test for heterogeneity — don't average it away.

**Verdict:** coherent abstract. Slide 3 ("Where we're going") is a brief teaching roadmap — acceptable for a teaching deck — and every other title is a load-bearing assertion. The sequence reads as the talk's argument end to end.

---

## Positive highlights

- Slide 6's title "A 4-level treatment becomes six binary CATE comparisons" states the deck's central methodological pivot in eight words, then proves it with a clean two-column contrast.
- Slide 2 is a genuine "spoiler figure" hook (downward GATE bars) that Act III pays off — textbook 3-act tension/resolution wiring, reinforced in the speaker notes.
- Slide 20 ("Same data, same command, opposite conclusions about moderation") earns the resolution: a side-by-side of the mining vs price GATE tests (96.90 vs 5.81) that makes the paper's core asymmetry visible in one frame.
- Math fidelity is exemplary: subscripts use plain `_` inside `$…$` (correct for Pandoc/Quarto) — none of the Goldmark `\_`-in-math breakage that hit sibling Stata decks — and 0 raw-LaTeX slides in the browser pass.

---

## Priority action items

1. **[MED]** Split the Devil's-Advocate rebuttal wall (qmd:213) into anchor + fragment + notes. **APPLIED.**
2. **[LOW]** (Out of scope — post, not deck.) Fix the post's `stata_cate2_iateplot_exec.png` caption at index.md:1463 ("upward" → "downward") so it agrees with the surrounding prose and the GATE bars; the deck already states "downward" correctly.

---

## Screenshots (HIGH-severity visual issues only)

None — no real overflow or unrendered math detected.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_cate2

To re-check just the dimension you fixed:

    /project:review-slides stata_cate2 focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs overflow/word/bullet counts are cumulative across vertical sub-slides + hidden notes (known artifact); re-verified per-slide directly at 1280×720 (heights 132–533 px) — no real clipping. Re-rendered with Quarto after the fix; index.html = 54,642 bytes.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only intent: this file plus the one applied readability fix in slides.qmd are the only artifacts; the deck was re-rendered after the fix.*
