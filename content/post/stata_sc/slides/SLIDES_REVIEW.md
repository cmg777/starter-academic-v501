# Review: stata_sc Slide Deck

**Audited:** content/post/stata_sc/slides/
**Source of truth:** content/post/stata_sc/index.md (+ analysis.log / analysis.do)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** The deck is faithful to the post's headline numbers and follows the write-slides 3-act arc cleanly, with strong assertion titles. Its weakest dimension is **technical render correctness (Dim 3)**: the two equation slides carry Goldmark-style `\_` escapes (`\min\_{W}`, `w\_j`, `X\_{1m}`, `\hat{\tau}\_t`) that Pandoc/MathJax renders as literal underscores, breaking every subscript. The strongest dimension is **source fidelity (Dim 1)**: all on-slide numbers trace to the post. The one fix that promotes this to ACCEPT is replacing `\_` with plain `_` throughout the math (a one-pass edit); a fabricated speaker-note statistic (−18.87) should also be removed.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 7          | 0H/1M   | all on-slide numbers trace; 1 invented note number (−18.87) |
| 2  | Conceptual correctness        | 10         | 0       | ATT vs ATE correct; identification stated right |
| 3  | Technical & render correctness| 3          | 1H/0M   | smoke-test PASS; `\_` escapes break subscripts in 2 eqn slides |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 6          | 0H/2M   | 2 prose-wall slides; 1 over-25-word gloss |
| 6  | Typos & grammar               | 9          | 0H/1L   | one inconsistent term spelling         |
| 7  | write-slides design adherence | 10         | 0       | arc ok; Devil's-Advocate present; closing = 1 sentence |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 9          | 0H/1L   | no real overflow; every figure captioned |
| 10 | Deliverable completeness      | 10         | 0       | link ok (url: slides/index.html); files ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 3   | HIGH     | slides.qmd:99,101,111,113 — equation slides | Goldmark `\_` escapes (`\min\_{W}`, `w\_j`, `X\_{1m}`, `\hat{\tau}\_t`) render as literal underscores in Pandoc/MathJax; subscripts break | Replace every `\_` with plain `_` (Pandoc passes `$…$` to MathJax verbatim) |
| 2  | 1   | MED      | slides.qmd:243 — slide 22 notes "leave-one-out stays negative" | "The overall LOO ATT (−18.87) is within 0.13 packs of the baseline (−19.0)" — −18.87 is not in index.md; log shows −18.8261 / −18.8659, and the post reports only per-year LOO ranges | Drop the invented parenthetical; keep the verifiable "no iteration approaches zero" claim |
| 3  | 5   | MED      | slide 16 — "The treatment effect is the gap between actual and synthetic California" | Three stacked body sentences (wall of prose) | Keep one anchor line on slide; move the rest to notes (see rewrite) |
| 4  | 5   | MED      | slide 15 — "SCM builds a counterfactual by matching pre-treatment predictors" | 28-word gloss sentence with semicolon | Split into two short lines (see rewrite) |
| 5  | 6   | LOW      | slides.qmd:113,52,56,103 | "Prop 99" (3×) vs "Proposition 99" (1×) — inconsistent shorthand | Standardize to "Prop 99" on slides (post uses full form; either is fine if consistent) |
| 6  | 5   | LOW      | slide 2 — "Smoking was falling everywhere…" | Three body sentences; middle sentence belongs in notes | Move the confound sentence to notes (see rewrite) |
| 7  | 9   | LOW      | slide-audit.cjs flagged 7 "OVERFLOW" slides | Artifact of the cumulative vertical-subslide counter; per-current-slide remeasurement shows 0 genuine overflow (all fit 1280×720) | No action — confirmed false positive |

Order: HIGH first, then MED, then LOW.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 16 "The treatment effect is the gap between actual and synthetic California"**

Before:
> In year $t$, the effect is California's actual sales minus the synthetic's prediction. A negative $\hat{\tau}_t$ means Prop 99 *lowered* sales. The **ATT** is the mean of $\hat{\tau}_t$ over 1989–2000.

After (on slide):
> The effect in year $t$ = California's actual sales − synthetic prediction. A negative gap means Prop 99 lowered sales.

(move to notes: "The ATT is the mean of these yearly gaps over 1989–2000.")

Why: three stacked sentences → one anchor sentence + one short clause; the averaging detail is speaker-track, not anchor text.

**Issue #4 — slide 15 "SCM builds a counterfactual by matching pre-treatment predictors"**

Before:
> Choose donor weights $w_j \ge 0$ summing to one so the weighted donors match California's predictors $X_{1m}$; predictor weights $v_m$ set how much each covariate matters.

After (two lines):
> Pick donor weights $w_j \ge 0$ that sum to one and match California's predictors $X_{1m}$.
> The weights $v_m$ set how much each covariate matters.

Why: one 28-word semicolon sentence → two short sentences, one idea each.

**Issue #6 — slide 2 "Smoking was falling everywhere — so did the tax change anything?"**

Before (on slide):
> But national smoking was already in decline. A simple before-and-after comparison confounds the policy with a trend pushing sales down *everywhere*. *What would California have done without the law?*

After (on slide):
> But national smoking was already falling. *What would California have done without the law?*

(move to notes: "A simple before-and-after comparison confounds the policy with the nationwide downward trend.")

Why: three sentences → one short setup + the rhetorical question; the confound mechanism is speaker-track.

---

## HIGH-issue rewrites

**Issue #1 — Dim 3 — equation slides (slides.qmd:99,101,111,113)**

Before:
> `$$\min\_{W} \sum\_{m=1}^{M} v\_m \left( X\_{1m} - \sum\_{j=2}^{J+1} w\_j X\_{jm} \right)^2$$`
> `… donor weights $w\_j \ge 0$ … California's predictors $X\_{1m}$ … predictor weights $v\_m$ …`
> `$$\hat{\tau}\_t = Y\_{1t} - \sum\_{j=2}^{J+1} w\_j^* Y\_{jt}$$`
> `… A negative $\hat{\tau}\_t$ … the mean of $\hat{\tau}\_t$ …`

After:
> `$$\min_{W} \sum_{m=1}^{M} v_m \left( X_{1m} - \sum_{j=2}^{J+1} w_j X_{jm} \right)^2$$`
> `… donor weights $w_j \ge 0$ … California's predictors $X_{1m}$ … predictor weights $v_m$ …`
> `$$\hat{\tau}_t = Y_{1t} - \sum_{j=2}^{J+1} w_j^* Y_{jt}$$`
> `… A negative $\hat{\tau}_t$ … the mean of $\hat{\tau}_t$ …`

Why: `.qmd` is Pandoc, not Goldmark — `\_` passes through to MathJax as a literal underscore and kills the subscript. Plain `_` is the subscript operator. Matches the post's escaped Goldmark source intent (`index.md` uses `\_` correctly *for Goldmark*; the slides must use plain `_` for Pandoc).

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                       | Value on slide | Source location               | Match |
|-----------------------------------|----------------|-------------------------------|-------|
| Key-result: ATT                   | −19.0          | index.md:498 (−19.0018), :661 | ✓     |
| Key-result: pre-treatment R²      | 0.974          | index.md:453, :689            | ✓     |
| Key-result: in-space p-value      | 0.026          | index.md:554, :667            | ✓     |
| Prop 99 tax                        | 25¢/pack       | index.md:63, :274             | ✓     |
| Panel size                         | 39 states × 31 yr, 1,209 obs | index.md:322, :339 | ✓     |
| Pre/post split                     | 19 pre / 12 post yr | index.md:453, :558       | ✓     |
| V-weights age15–24 / cigsale(1975) | 0.546 / 0.422  | index.md:468                  | ✓     |
| Donor weights Utah…Connecticut     | 33.4/23.5/20.2/16.1/6.8 | index.md:484         | ✓     |
| 2000 actual / synthetic / gap / %  | 41.6 / 67.4 / 25.8 / 38% | index.md:501, :663   | ✓     |
| Yearly ATT 1989 / 1999             | −7.6 / −26.4   | index.md:501, :661            | ✓     |
| MSPE ratio CA / GA / VA / MO       | 123.5/80.0/79.0/70.9 | index.md:541            | ✓     |
| cut(2): p=0.05, 1/20, 19 removed   | 0.05 / 20 / 19 | index.md:554                  | ✓     |
| In-time fake −3.3…−8.7, real −14.1…−25.6 | as stated | index.md:612                  | ✓     |
| In-time R² drop                    | 0.953          | index.md:612                  | ✓     |
| In-time ATT shift                  | −19.0 → −17.7  | index.md:704                  | ✓     |
| LOO 2000 range / spread / %        | [−28.4,−23.5] / 4.9 / ~19% | index.md:649, :677 | ✓     |
| Predictor bias < 2.2%, avg off 26% | as stated      | index.md:468                  | ✓     |
| p = 0.05 in 8 of 12 years          | 8 of 12        | index.md:558                  | ✓     |
| **"overall LOO ATT (−18.87)"**     | −18.87         | NOT in index.md; log: −18.8261/−18.8659 | ✗ |

The single ✗ is Issue #2 (MED — speaker-note only, near a real log value but absent from and mislabeled relative to the authoritative post).

---

## Title sequence (assertion-title test)

1. Smoking was falling everywhere — so did the tax change anything?
2. A raw comparison hints at an effect — but the comparator is crude
3. Where we're going
4. The lab: 39 states × 31 years, one treated unit, the ATT
5. SCM builds a counterfactual by matching pre-treatment predictors
6. The treatment effect is the gap between actual and synthetic California
7. One `synth2` call fits the baseline synthetic control
8. Synthetic California reproduces 97.4% of the pre-1989 path
9. Two predictors carry the match: age 15–24 and 1975 sales
10. Synthetic California is just five states — one-third Utah
11. By 2000, real California sold 38% fewer packs than its synthetic twin
12. The gap deepens steadily through the 1990s
13. California's signal-to-noise ratio is the most extreme of all 39 states
14. Run the placebo on every state — California is the lone outlier
15. Across all 39 states, a gap this large appears 2.6% of the time
16. Significance holds in most post-treatment years
17. A fake 1985 treatment produces no comparable gap
18. The effect snaps on at the real date, not the fake one
19. No single donor drives the result — leave-one-out stays negative
20. Does choosing controls by fit make this causal? Not by itself
21. Let the pre-treatment fit — not a parallel-trends assumption — earn your counterfactual.

**Verdict:** coherent abstract. The titles read alone tell the whole story: the problem (single-unit confounding), the build (synth2, fit, weights), the effect (38% / −19.0), and the three-pronged inference defense, closing on a one-sentence thesis. "Where we're going" (3) is a roadmap label, acceptable as an Act-I preview.

---

## Positive highlights

- Slide 11's assertion title "By 2000, real California sold 38% fewer packs than its synthetic twin" turns a number into a sentence the audience can repeat — exemplary write-slides practice.
- Slide 20 is a textbook Devil's-Advocate: "Does choosing controls by fit make this causal? Not by itself" steelmans the critique and concedes the no-standard-errors limitation, exactly as the rubric asks for seminar decks.
- The 3-act arc is clean and color-coded to the brand palette (orange Tension → steel Investigation → teal Resolution), and the dark `#141413` big-number slides (−19.0, 0.026) land the two headline results as visual anchors.
- The closing divider is a single declarative thesis sentence, not "Questions?" / "Thank you" — adherence to the closing rule.

---

## Priority action items

1. **[HIGH]** Replace every `\_` with plain `_` in the two equation slides (slides.qmd:99,101,111,113) so MathJax renders the subscripts. This is the only ship-blocker.
2. **[MED]** Remove the fabricated "overall LOO ATT (−18.87)" parenthetical from slide 22's notes (slides.qmd:243); keep the verifiable "no iteration approaches zero" claim.
3. **[MED]** Trim slide 16's three-sentence prose to one anchor line + notes.
4. **[MED]** Split slide 15's 28-word gloss into two short lines.
5. **[LOW]** Standardize "Prop 99" vs "Proposition 99" on slides; move slide 2's confound sentence to notes.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_sc

To re-check just the dimension you fixed:

    /project:review-slides stata_sc focus: render

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (chromium via npx cache)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs reported 7 OVERFLOW + 24 dense slides, but these are the documented cumulative vertical-subslide artifact; per-current-slide remeasurement (1280×720) confirmed 0 genuine overflow and 0 raw-LaTeX (the `\_` escape bug is inside MathJax spans, which the raw-LaTeX detector does not catch — caught by static source inspection instead).

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
