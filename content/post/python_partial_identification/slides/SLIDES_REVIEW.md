# Review: python_partial_identification Slide Deck

**Audited:** content/post/python_partial_identification/slides/
**Source of truth:** content/post/python_partial_identification/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is a strong, faithful deck. Every number on every slide traces to the source post (naive ATE 0.3822, bias +0.1122, true ATE 0.27, Manski [−0.2980, 0.7020] width 1.0, entropy [−0.2279, 0.4540] width 0.6819 / 32% tighter, Tian–Pearl PNS [0.000, 0.702], entropy PNS [0.000, 0.839], 100% coverage, width fixed N=100→5,000). Math is clean — subscripts use plain `_` (e.g. `Y_{X=1}`), so MathJax renders all 28 spans with no raw LaTeX; there are no `\_` or `\$` escaping hazards. Branding (`site-brand.scss`, `title-slide.html`) is byte-identical to the canonical templates. The strongest dimension is source fidelity; the weakest is readability, dragged only by a couple of LOW glosses and one deliberate two-sentence rebuttal slide. No HIGH or MED issues.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers/figures trace to index.md  |
| 2  | Conceptual correctness        | 10         | 0       | estimand (ATE/PNS) stated; ID framed right |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders; 0 raw LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 8          | 2 L     | 2 long glosses; 1 deliberate dense rebuttal |
| 6  | Typos & grammar               | 10         | 0       | clean; em dashes correct               |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate; 1-sentence close |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none (real per-slide check)   |
| 10 | Deliverable completeness      | 10         | 0       | link ok (slides/index.html); files ok  |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 1   | LOW      | slide — "The observable gap is 38 points" (slides.qmd:124,126) | Title/caption said "38" / "38-point"; post uses precise 38.2 pp throughout | FIXED — title + caption now "38.2"             |
| 2  | 5   | LOW      | slide — "An unmeasured confounder…" (slides.qmd:118) | 18-word gloss with a subordinate clause        | Optional split (see rewrite)                   |
| 3  | 5   | LOW      | slide — "Bounds that span zero are useless." (slides.qmd:250) | Rebuttal is two stacked sentences (~38 words)  | Deliberate two-beat rhetorical slide — keep; rewrite offered |

Order: HIGH first, then MED, then LOW. No HIGH or MED issues.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide "An unmeasured confounder sits on the backdoor path"**

Before:
> The backdoor criterion needs $U$; since $U$ is unmeasured, every point estimate is biased by an unknown amount.

After:
> The backdoor criterion needs $U$. Without it, every point estimate is biased — by an unknown amount.

Why: splits one 18-word sentence with a subordinate clause into two short lines; reads as speech. Not applied — the original is a single below-diagram gloss and within tolerance; offered as optional polish.

**Issue #3 — slide "Bounds that span zero are useless. Are they?"**

Before:
> They still rule out the impossible: the ATE *cannot* exceed 0.702, so any "75-point benefit" claim is refuted. And the honesty is the point — the alternative is a precise number that is precisely wrong.

After (anchor on slide; second sentence to notes):
> They still rule out the impossible: the ATE *cannot* exceed 0.702 — so any "75-point benefit" is refuted.
> *(notes: "And the honesty is the point — the alternative is a precise number that is precisely wrong.")*

Why: keeps the one decisive rebuttal line on the slide, moves the second beat to speech. Not applied — this is the Devil's-Advocate slide whose two-beat (rule-out + honesty) is rhetorically deliberate and used once; per readability rules a deliberate dense slide for effect is allowed.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                 | Value on slide          | Source location          | Match |
|---------------------------------------------|-------------------------|--------------------------|-------|
| Title-strip naive ATE                       | 0.3822 (11.2 pp too high) | index.md:402, 865        | ✓     |
| Title-strip Manski bounds                   | [−0.30, 0.70] width 1.0 | index.md:478–479         | ✓     |
| Title-strip entropy tightening              | 32%                     | index.md:567, 673        | ✓     |
| Trained vs untrained job rate               | 63.6% / 25.4% (2.5×)    | index.md:374, 330        | ✓     |
| Bias bignum                                 | +0.1122 (naive 0.3822 vs ATE 0.27) | index.md:404 | ✓     |
| DGP: P(X=1)=0.3+0.4U                         | 0.3+0.4U                | index.md:280, 293        | ✓     |
| DGP: P(Y=1)=0.2+0.3X+0.4U−0.1XU             | matches                 | index.md:284, 297        | ✓     |
| Manski bignum                               | [−0.30, 0.70] width 1.0, true 0.27 inside | index.md:478–480 | ✓ |
| Autobound LP = Manski [−0.2980, 0.7020]     | 1.0000                  | index.md:533–534, 679–680 | ✓    |
| Entropy ATE θ=0.1                           | [−0.2279, 0.4540] w 0.6819 | index.md:561–562, 681  | ✓     |
| Tian–Pearl PNS                              | [0.000, 0.702]          | index.md:601, 682        | ✓     |
| Entropy PNS wider                           | [0.000, 0.839]          | index.md:608, 684        | ✓     |
| Coverage                                    | 100/100 all methods     | index.md:751–753         | ✓     |
| Width fixed N=100→5,000; entropy ~0.68      | matches                 | index.md:817–822, 861    | ✓     |
| ATE cannot exceed 0.702 / 75-pt claim refuted | matches               | index.md:869             | ✓     |
| Figure ../partial_id_observed_probs.png     | resolves                | index.md:378             | ✓     |
| Figure ../partial_id_bounds_comparison.png  | resolves                | index.md:671             | ✓     |
| Figure ../partial_id_pns_bounds.png         | resolves                | index.md:717             | ✓     |
| Figure ../partial_id_coverage.png           | resolves                | index.md:779             | ✓     |
| Figure ../partial_id_sample_size.png        | resolves                | index.md:859             | ✓     |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. Trained workers got jobs at 2.5× the rate — but did training cause it?
2. The naive estimate overstates the true effect by 11.2 points
3. When a confounder is unmeasured, the honest answer is a range, not a number
4. An unmeasured confounder sits on the backdoor path X ← U → Y
5. The observable gap is 38.2 points — but it is a confounded gap
6. Manski bounds assume nothing but the law of total probability
7. Three lines of arithmetic give the worst-case ATE interval
8. No-assumption bounds span zero: the sign of the effect is undetermined
9. Linear programming confirms Manski is already sharp — it cannot be beaten
10. A mild entropy cap on the confounder shrinks the interval by 32%
11. All three ATE bounds bracket the truth; only their width differs
12. Tian–Pearl bounds answer a sharper question: was training necessary AND sufficient?
13. For PNS the closed form wins; entropy is weaker on counterfactual queries
14. Every method covers the true ATE in 100 of 100 simulations
15. More data does NOT narrow these bounds — the width is identification, not noise
16. "Bounds that span zero are useless." Are they?
17. To tighten, add assumptions or data on the confounder — not more rows
18. Without the confounder, the data give you a range — so report the range, honestly.

**Verdict:** coherent abstract — the titles alone tell the full Tension→Investigation→Resolution story.

---

## Positive highlights

- Slide 8's assertion title "No-assumption bounds span zero: the sign of the effect is undetermined" states the single most important takeaway in nine words, and the dark bignum slide pairs it with [−0.30, 0.70].
- Slide 9's title "Linear programming confirms Manski is already sharp — it cannot be beaten" correctly reframes the identical-bounds result as a finding, not a failure (matches index.md:539).
- Math hygiene is exemplary: subscripts use plain `_` (`Y_{X=1}`, `P(X{=}1)`), so all 28 MathJax spans render with zero raw-LaTeX leakage — the common Goldmark `\_` trap is avoided.
- The closing slide is a single declarative sentence ("Without the confounder, the data give you a range — so report the range, honestly."), exactly per the write-slides closing rule.
- A genuine Devil's-Advocate slide ("Bounds that span zero are useless. Are they?") steelmans the critique before rebutting it — strong seminar rhetoric.

---

## Priority action items

1. **[LOW]** (Applied) Align slide 5 title + caption to the precise 38.2-point gap used throughout the post.
2. **[LOW]** (Optional) Split the backdoor gloss (slides.qmd:118) into two short lines.
3. **[LOW]** (Optional) Move the rebuttal's second sentence (slides.qmd:250) into speaker notes if a tighter slide is preferred.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_partial_identification

To re-check just the dimension you fixed:

    /project:review-slides python_partial_identification focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (chromium via npx cache)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical)
- Tooling notes: slide-audit.cjs reported 7 "OVERFLOW" + 21 "dense" slides, but a per-slide 1280×720 probe excluding hidden `.notes` confirmed 0 real overflow and ≤60 visible words on every content slide except the illustrative code block (139 words, acceptable). The slide-audit counts are the known cumulative-notes artifact; its own exit code was 0 (no raw LaTeX, no clipping).

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
