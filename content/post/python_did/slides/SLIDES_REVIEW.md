# Review: python_did Slide Deck

**Audited:** content/post/python_did/slides/
**Source of truth:** content/post/python_did/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is a strong, faithful, on-brand deck. Source fidelity
is the standout dimension: every number on every slide (5.12 / 2.18 / 2.41 / M=15,
the Bacon weights 0.433/0.284/0.283, the pre-trends t=1.05 p=0.29, the CS growth
1.97→3.27) traces cleanly to `index.md`. The weakest dimension is readability, and
only marginally: a few Act-II slides carry ~60–90 visible words, but they use
`.incremental` reveal and `.comment` asides so the at-a-glance load per fragment
stays low. The seven "OVERFLOW" flags from `slide-audit.cjs` are entirely the known
cumulative-vertical artifact — a per-horizontal-slide measurement at 1280×720 shows
every slide fits inside the 700 px box (max 639 px on figure slides). No fix is
required to ship; the LOW density notes are optional polish.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                       |
|----|-------------------------------|-----------:|--------:|---------------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers/figures/equations trace to source |
| 2  | Conceptual correctness        | 10         | 0       | ATT estimand correct; identification stated honestly |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders (28 spans) |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes                 |
| 5  | Readability & simplicity      | 8          | 0H/0M/3L| 3 slides marginally dense (mitigated by incremental) |
| 6  | Typos & grammar               | 10         | 0       | clean; em-dashes used throughout            |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc, Devil's-Advocate, 1-sentence close |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide byte-identical to templates |
| 9  | Accessibility & legibility    | 10         | 0       | no real overflow; figures captioned         |
| 10 | Deliverable completeness      | 10         | 0       | qmd + index.html (60 KB) + slides_files/; link ok |

---

## Issues found

| #  | Dim | Severity | Location                                   | Issue                                                        | Suggested fix                                  |
|---:|----:|----------|--------------------------------------------|-------------------------------------------------------------|------------------------------------------------|
| 1  | 5   | LOW      | slide 2.4 — "The lab: a 100-unit…"         | 69 visible words; the `.comment` line restates the bullets   | Trim the comment line (rewrite below)          |
| 2  | 5   | LOW      | slide 2.12 — "Real policies roll out…"     | 87 visible words; comment line packs two ideas                | Split the comment; push the formula to notes   |
| 3  | 5   | LOW      | slide 2.17 — "Theory vs naive…"            | 8 `<li>` total (4 + 4 across two columns)                     | Acceptable for a compare slide; optional trim  |

Order: HIGH first, then MED, then LOW. (No HIGH or MED issues found.)

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 2.4 "The lab: a 100-unit, 10-period panel built with a known true effect of 5.0"**

Before:
> Synthetic panel data with a built-in `true_effect` column — the benchmark that lets us check the estimator against the right answer.

After:
> A built-in `true_effect` column gives every estimate a known target to hit.

Why: 22 words → 12; drops "Synthetic panel data" (already in the title/bullets) and "the right answer" (redundant with "target").

**Issue #2 — slide 2.12 "Real policies roll out city by city — and that staggered timing breaks naive TWFE"**

Before:
> Two-Way Fixed Effects fits one pooled coefficient $\delta$ in $Y_{it} = \gamma_i + \lambda_t + \delta D_{it} + \varepsilon_{it}$ — a weighted average of many 2×2 comparisons, some of them poisoned.

After:
> TWFE fits one pooled $\delta$ — a weighted average of many 2×2 comparisons, some of them poisoned.

Why: moves the full TWFE equation into the speaker notes (it reappears verbatim there) and keeps the slide line to one idea; ~30 words → 16.

**Issue #3 — slide 2.17 "Theory vs naive: same data, but CS uses only valid comparisons"**

Before:
> (8 bullets total: "one pooled coefficient / 28.3% weight on forbidden comparisons / $\hat{\delta} = 2.18$ (biased low) / hides the dynamics" vs "clean group-time ATTs / never-treated controls only / overall $\widehat{\text{ATT}} = 2.41$ / recovers the growth path")

After:
> Keep as-is, or trim each column to 3 bullets (drop "hides the dynamics" and "recovers the growth path", which the next slide proves visually).

Why: a two-column compare is a sanctioned archetype, so 4+4 reads fine; the trim is purely optional tightening.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                         | Value on slide       | Source location                  | Match |
|-------------------------------------|----------------------|----------------------------------|-------|
| Title strip — classic 2×2 ATT       | 5.12 (true 5.0)      | index.md:560                     | ✓     |
| Title strip — CS / TWFE             | 2.41 / 2.18          | index.md:1215, 1007              | ✓     |
| Title strip — HonestDiD breakdown   | M = 15               | index.md:1337                    | ✓     |
| 2×2 design: 1,000 obs, 100 units    | 1,000 / 100 / 50-50  | index.md:371, 385                | ✓     |
| 2.5 pre means 10.61 / 11.11, +2.47/+7.59 | notes 10.61/11.11/+2.47/+7.59 | index.md:462, 137       | ✓     |
| 2.7 code result ATT, CI             | 5.1216, [4.6399,5.6034] | index.md:551, 554             | ✓     |
| 2.8 SE 0.25, t=20.9, CI [4.64,5.60] | SE 0.25, t=20.9      | index.md:551, 560                | ✓     |
| 2.9 pre-trends 0.5262 / 0.4047 / 0.1216 / SE 0.1158 | table values | index.md:623–626       | ✓     |
| 2.9 t=1.05, p=0.29                  | t=1.05, p=0.29       | index.md:627–628                 | ✓     |
| 2.11 leads −0.52..−0.28, lags 4.65..5.02, t>9 | notes        | index.md:685–701                 | ✓     |
| 2.12 3,000 obs, cohorts 3/5/7 (60/75/75), 90 never | bullets   | index.md:797–800                 | ✓     |
| 2.12 effects 2.0 → 3.2 earliest cohort | bullet            | index.md:856 (2.0…3.2)           | ✓     |
| 2.14 Bacon weights 0.433/0.284/0.283 | table .key 0.283    | index.md:1016–1018               | ✓     |
| 2.14 avg effects 2.37/2.20/1.60     | table                | index.md:1016–1018               | ✓     |
| 2.14/2.15 28.3% forbidden, TWFE 2.18 | bignum 2.18         | index.md:1007, 1023              | ✓     |
| 2.18 CS 2.41, CI [2.31,2.52], 1.97→3.27 | notes            | index.md:1185, 1202, 1208        | ✓     |
| 2.17 δ=2.18 vs ATT=2.41, 10% correction | columns + notes  | index.md:1215, 1393              | ✓     |
| 3.2 CI M=0 [2.53,2.66], M=15 [0.38,4.81] | comment         | index.md:1324, 1335              | ✓     |
| 3.2 notes M=10 lower 1.10           | notes 1.10           | index.md:1333                    | ✓     |
| 3.3/3.4 breakdown M=15              | bignum M = 15        | index.md:1337                    | ✓     |
| Figures (8): parallel_trends, outcome_distribution, treatment_effect, event_study, staggered_trends, bacon_decomposition, staggered_att, honest_sensitivity | `../did_*.png` | index.md (same captions) | ✓ (8/8 on disk) |

No ✗ entries — source fidelity is complete.

---

## Title sequence (assertion-title test)

1. An education ministry rolls out AI tutors in some cities — did it work, or were they already rising?
2. DiD uses the control group as a mirror for the treated group's missing counterfactual
3. DiD estimates the ATT — the effect on the units that actually got treated
4. Difference twice: kill the level gap, then kill the common trend
5. Parallel trends is about slopes, not levels — and it is fundamentally untestable
6. The classic estimator recovers 5.12 — within 2.4% of the true 5.0
7. A formal pre-trends test fails to reject parallel trends: slope gap 0.12, p = 0.29
8. Leads sit on zero, lags snap to ~5.0 — the visual signature of a clean DiD
9. Real policies roll out city by city — and that staggered timing breaks naive TWFE
10. The Goodman–Bacon decomposition shows 28.3% of TWFE's weight is on forbidden comparisons
11. Forbidden comparisons drag TWFE down to a biased 2.18
12. Callaway–Sant'Anna rebuilds the estimate from clean group-time ATTs only
13. CS recovers a clean 2.41, and the effect grows from 1.97 to 3.27
14. The CI stays above zero even when violations are 15× the worst pre-trend
15. Let the design — not the default regression — choose your comparisons.

**Verdict:** coherent abstract. Read in order, the assertion titles tell the full
talk: problem → DiD logic → ATT/parallel-trends → classic 5.12 recovery →
staggered breakage → Bacon diagnosis → CS correction → honest robustness →
one-sentence takeaway.

---

## Positive highlights

- **Slide 2.15 / 2.11 "Forbidden comparisons drag TWFE down to a biased 2.18"** —
  the dark-background bignum slides turn the two hero contrasts (5.12 recovery,
  2.18 bias) into a single number the audience cannot miss.
- **Slide 2.19 "Does machine-selecting comparisons make this causal? No"** — a genuine
  Devil's-Advocate slide that steelmans the objection (CS can't manufacture
  identification) and answers it honestly, exactly per the design contract.
- **Closing slide 4.0 "Let the design — not the default regression — choose your
  comparisons."** — one declarative sentence, no "Questions?"/"Thank you"; the
  single takeaway of the whole deck.
- **Math fidelity** — every display equation drops Goldmark escaping correctly
  (`Y_{it}`, `\sum_{k=-K+1}^{-2}`, `|\delta_t|`): no `\_`, no leftover `\\,`, and
  the browser pass confirms all 28 math spans render.

---

## Priority action items

1. **[LOW]** Trim slide 2.4's `.comment` line (Issue #1 rewrite) to drop the
   density restated from the bullets.
2. **[LOW]** Move the full TWFE equation on slide 2.12 into the speaker notes and
   shorten the `.comment` line (Issue #2 rewrite).
3. **[LOW]** Optionally trim slide 2.17's two columns to 3 bullets each.

(No HIGH or MED items. The deck is shippable as-is.)

---

## Screenshots (HIGH-severity visual issues only)

None — no raw LaTeX and no real (per-slide) overflow detected.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_did

To re-check just the dimension you fixed:

    /project:review-slides python_did focus: readability

---

## Audit metadata

- Node version: v20+ (project default)
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical)
- Tooling notes: `slide-audit.cjs` reported 7 OVERFLOW + 30 dense slides, but these
  are the documented cumulative-vertical artifact (the deck is 4 `#` dividers each
  holding `##` vertical sub-slides). A per-horizontal-slide remeasurement at
  1280×720 (excluding `aside.notes`) shows every slide ≤ 639 px inside the 700 px
  box — no real overflow.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
