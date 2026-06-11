# Review: r_did Slide Deck

**Audited:** content/post/r_did/slides/
**Source of truth:** content/post/r_did/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT (with two MINOR readability polishes applied)

**Overall assessment.** A faithful, well-paced deck: every number on every slide traces to the source post, the assertion titles read as a clean abstract, and the 3-act arc (Tension → Investigation → Resolution) with a Devil's-Advocate slide is textbook. The strongest dimension is **source fidelity** (all 24 traced numbers match `index.md`); the weakest is **readability**, where three equation slides stack a notation/gloss sentence under the formula. No HIGH issues. The single fix that earned the ACCEPT: moving slide 2.1's notation glossary ($D=1$/$D=0$/$\Delta Y$) from the on-slide `.comment` into speaker notes, leaving one anchor line.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 24 traced numbers match index.md   |
| 2  | Conceptual correctness        | 10         | 0       | ATT estimand stated; PT identification correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); MathJax renders, 0 raw LaTeX |
| 4  | Title↔body consistency        | 9          | 1 LOW   | assertion-title test passes; 1 roadmap label |
| 5  | Readability & simplicity      | 7          | 1 MED, 3 LOW | 3 equation slides ~80–98 prose words |
| 6  | Typos & grammar               | 10         | 0       | no `--`, consistent terminology         |
| 7  | write-slides design adherence | 9          | 1 LOW   | arc ok; closing 1 sentence; Devil's-Advocate present |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide diffs clean          |
| 9  | Accessibility & legibility    | 10         | 0       | per-slide overflow 0/24; every figure captioned |
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html`; all 7 figs resolve |

---

## Issues found

| #  | Dim | Severity | Location                                  | Issue                                                                 | Suggested fix                                              |
|---:|----:|----------|-------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------|
| 1  | 5   | MED      | slide 2.1 — "Identification rests on one assumption: parallel trends" | The `.comment` stacks two sentences (a claim + a $D=1$/$D=0$/$\Delta Y$ notation list), pushing on-slide prose to ~98 words. | Keep the estimand claim on-slide; move the notation glossary to `::: {.notes}`. **(APPLIED)** |
| 2  | 5   | LOW      | slide 1.2 — "A frozen federal floor of \$5.15…"  | ~81 rendered words after both fragments (body + cohort line + analogy comment). | Acceptable as an incremental build; no change. |
| 3  | 5   | LOW      | slide 2.3 — "The fix: estimate one clean effect…" | ~93 rendered words (equation + gloss + citation comment). | Acceptable; the comment is two short sentences. No change. |
| 4  | 4/7 | LOW      | slide 1.4 — "Where we're going"            | Roadmap title is a label, not an assertion (the only label title in the deck). | Acceptable: it is a 4-item Act-I roadmap after the hook, not the opener. Optional rename. |
| 5  | 5   | LOW      | slide 1.1 — "Same panel, same question…"   | Two rhetorical questions ("Which one is right?") read well but the second fragment is ~24 words. | Acceptable; the build paces it. No change. |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 2.1 "Identification rests on one assumption: parallel trends"**

Before (on-slide `.comment`):
> The estimand is the ATT — the effect on the counties that actually raised their wage. $D=1$ treated, $D=0$ untreated, $\Delta Y$ the pre-to-post change.

After (on-slide `.comment` keeps one line; notation moves to notes):
> The estimand is the ATT — the effect on the counties that actually raised their wage.

(notation line `$D=1$ treated, $D=0$ untreated, $\Delta Y$ the pre-to-post change.` relocated into `::: {.notes}`)

Why: two sentences on the slide → one anchor line; the symbol glossary is speaker material, not a read-at-a-glance line. Drops on-slide prose from ~98 to ~80 words.

(Issues #2–#5 are LOW and acceptable as incremental builds per `readability-rules.md` — "a slide that builds via `. . .` fragments is acceptable"; no rewrite forced.)

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                              | Value on slide | Source location                  | Match |
|------------------------------------------|----------------|----------------------------------|-------|
| TWFE estimate (hook + table)             | −0.038         | index.md:374 (−0.03812)          | ✓     |
| Modern / CS overall ATT (hook + table)   | −0.057         | index.md:438 (−0.0571)           | ✓     |
| Key-result strip #1                      | −0.057         | index.md:438                     | ✓     |
| Key-result strip #2 (doubly robust)      | −0.065         | index.md:539                     | ✓     |
| Key-result strip #3 (HonestDiD)          | 0.67           | index.md:216/629 ($\bar M≈0.67$) | ✓     |
| Frozen federal floor                     | \$5.15/hour    | index.md:58                      | ✓     |
| Cohorts G ∈ {0, 2004, 2006}              | 102 / 226 / 1,417 | index.md:296–298              | ✓     |
| Panel size (notes)                       | 8,725 obs, 1,745 counties, 2003–2007 | index.md:300       | ✓     |
| ATT(g,t) G=2004 path (notes)             | −0.033/−0.068/−0.123/−0.131 | index.md:411–414       | ✓     |
| Event study e=0..3 (caption/notes)       | −0.024/−0.067/−0.123/−0.131 | index.md:465–468       | ✓     |
| Bias split                               | 64% / 36%      | index.md:497–498 (64.2/35.8)     | ✓     |
| Total TWFE bias (notes)                  | 0.019          | index.md:496                     | ✓     |
| Covariate table (Unc/Reg/IPW/DR)         | −0.057/−0.064/−0.065/−0.065, SE 0.008 | index.md:536–539 | ✓     |
| DR event study pre-trend e=−3            | −0.034 → −0.022 | index.md:545                    | ✓     |
| DR post path (notes)                     | −0.027/−0.077/−0.135/−0.147 | index.md:545           | ✓     |
| Robustness (varying / not-yet / antic.)  | −0.065 / −0.065 / −0.040 | index.md:562/576/590   | ✓     |
| HonestDiD original CI (notes)            | [−0.040, −0.007] | index.md:616 ([−0.0404,−0.0066])| ✓     |
| Per-dollar effects                       | ~5% (yr 1) / ~9% (yr 3) | index.md:686 (5.3/9.2%) | ✓     |
| Per-dollar path (notes)                  | −0.028/−0.055/−0.091/−0.097 | index.md:678–681       | ✓     |
| `did::att_gt` code spec                  | yname/idname/gname/control_group/base_period | index.md:397–403 | ✓ |

Every datum traces. No ✗.

---

## Title sequence (assertion-title test)

1. Same panel, same question — but the answer depends on the estimator you trust
2. A frozen federal floor of \$5.15 turned the states into a natural experiment
3. TWFE understates the true effect by a third — that gap is the whole talk
4. Where we're going *(roadmap label)*
5. Identification rests on one assumption: parallel trends
6. TWFE silently uses already-treated counties as controls — a forbidden comparison
7. The fix: estimate one clean effect per cohort × period, then aggregate
8. Six lines of `did` replace the broken regression
9. Each cohort's effect deepens with exposure — dynamics TWFE flattens away
10. Aggregated cleanly, the true overall ATT is −0.057 — not TWFE's −0.038
11. The trajectory is clear: small on impact, large after three years
12. Where does TWFE's bias come from? 64% pre-trend contamination, 36% bad weights
13. Conditioning on covariates barely moves the answer: −0.065, three ways
14. Covariates also clean up the pre-trend — the early wobble shrinks and loses significance
15. −0.065 survives every researcher choice we throw at it
16. How fragile is this? The on-impact effect breaks only at $\bar M \approx 0.67$
17. A dose-response emerges: each extra \$1 cuts teen jobs ~5% at one year, ~9% at three
18. Does machine-disciplined DiD make this *causal*? Not by itself
19. What to take home: clean comparisons change the number *and* the story
20. Let the design, not the regression default, choose your comparisons.

**Verdict:** coherent abstract. The titles read alone tell the whole story (TWFE is wrong → why → the fix → the number → robustness → caveat → takeaway). Slide 4 ("Where we're going") is the one label title — acceptable as an Act-I roadmap that follows the hook.

---

## Positive highlights

- Slide 3's assertion title "TWFE understates the true effect by a third — that gap is the whole talk" frames the entire deck's stakes in one line and previews the −0.038-vs-−0.057 payoff.
- Slide 12's title "Where does TWFE's bias come from? 64% pre-trend contamination, 36% bad weights" puts the decomposition's two numbers directly in the title — the body figure then just confirms it.
- The Devil's-Advocate slide (18) steelmans the objection ("maybe minimum-wage states were just on a different employment path") and answers it honestly with the HonestDiD breakdown, exactly per the seminar-deck design rule.
- The closing slide is a single declarative sentence ("Let the design, not the regression default, choose your comparisons.") — not "Questions?" / "Thank you."
- Per-slide overflow is 0/24 at 1280×720; the cumulative-overflow flags from `slide-audit.cjs` are the known vertical-stack/fragment artifact, confirmed false by per-current-slide measurement.

---

## Priority action items

1. **[MED → APPLIED]** slide 2.1: move the $D=1$/$D=0$/$\Delta Y$ notation glossary from the on-slide `.comment` into `::: {.notes}`, keeping the one estimand-claim anchor line.
2. **[LOW]** slide 1.4: optionally rename the roadmap "Where we're going" to an assertion (e.g. "Four steps from a broken regression to an honest number") — deferred, optional.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_did

To re-check just the dimension you fixed:

    /project:review-slides r_did focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: `slide-audit.cjs` reports 10 cumulative-overflow + dense flags; these are the documented vertical-sub-slide + fragment + speaker-note accumulation artifact. Re-measured per-current-slide (current `Reveal.getCurrentSlide()` vs natural 1280×720 box) → 0 real overflow, max content height 720/720.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only origin; this run additionally applied the one unambiguous MED fix to slides.qmd per the calling task.*
