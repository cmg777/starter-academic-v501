# Review: stata_rct Slide Deck

**Audited:** content/post/stata_rct/slides/
**Source of truth:** content/post/stata_rct/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** A faithful, well-structured, on-brand deck: every headline
number (0.113, 0.116, 0.135, 0.137, 0.147, 0.117, the 0.12 truth, SMD 9.3%) traces
to the source post, math renders cleanly (no raw LaTeX), the 3-act arc and
assertion titles are excellent, and branding is byte-identical to the canonical
templates. The strongest dimension is source fidelity; the weakest is readability,
where several method slides stack a full prose sentence (or two) that belongs in
speaker notes, and a handful of bracketed `.comment` lines run past 25 words. The
one fidelity nuance: the balance table marks Education's SMD as `<0.05`, but the
post's `tebalance summarize` reports a raw SMD of 0.052 (just *above* 0.05). Fixing
that cell and trimming the over-length prose lines promotes this to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 7          | 0H/1M   | all headline numbers trace; edu SMD cell off |
| 2  | Conceptual correctness        | 10         | 0       | estimands (ATE/ATT/ITT) correct throughout |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders y |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 6          | 0H/4M/2L| 4 prose-in-body slides, 2 long comments |
| 6  | Typos & grammar                | 10         | 0       | clean; em-dashes used consistently     |
| 7  | write-slides design adherence | 9          | 0H/0M/1L| arc ok; closing ok; 2 Devil's-Advocate |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 9          | 0H/0M/1L| no resting overflow; one transient 18px build state |
| 10 | Deliverable completeness      | 10         | 0       | link ok (url: slides/index.html); files ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 1   | MED      | slides.qmd:123 — balance table "Education" | Slide marks Education SMD as `<0.05`; post `tebalance summarize` (index.md:548) reports raw SMD = 0.052 (above 0.05) | Change the Education SMD cell to `0.052` (matches the post) |
| 2  | 5   | MED      | slide "In an RCT, controls don't remove bias" (slides.qmd:192) | Two full prose sentences on slide (incl. 26-word italic sentence); belongs in notes | Keep one anchor line; move the rest to `::: {.notes}` (see rewrite) |
| 3  | 5   | MED      | slide "Doubly robust estimation…" (slides.qmd:225) | 24-word body sentence explaining the equation terms reads as a paragraph | Trim to a one-line gloss (see rewrite) |
| 4  | 5   | MED      | slide "Governments spend billions…" (slides.qmd:52,56) | Two stacked prose sentences + a 30-word second paragraph above the fold | Compress to one anchor + move detail to notes (see rewrite) |
| 5  | 5   | MED      | slide "DiD is a difference of differences" (slides.qmd:291) | 27-word two-clause body sentence under the equation | Split into two short lines (see rewrite) |
| 6  | 5   | LOW      | slide "Panel DiD recovers 0.135" comment (slides.qmd:307) | 24-word `.comment` line with a parenthetical | Shorten (see rewrite) |
| 7  | 5   | LOW      | slide "The only chance imbalance…" comment (slides.qmd:127) | 23-word `.comment` with a nested clause after the em-dash | Shorten (see rewrite) |
| 8  | 7   | LOW      | slides.qmd:277-281, 380-384 | Two Devil's-Advocate / objection-rebuttal slides (one per the convention is typical) | Acceptable for a seminar deck; optionally fold the Act-II objection into notes |
| 9  | 9   | LOW      | Act III dense table slide (transient build state) | During one `. . .` fragment reveal a slide momentarily measures 738px vs the 720px box (+18px, 2.5%); resting state fits | No action required; could drop one CI column if projecting very small |

Order: HIGH first, then MED, then LOW. None are HIGH.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide "In an RCT, controls don't remove bias — they buy precision"**

Before:
> Adding covariates (RA, IPW, doubly robust) does **not** fix confounding here — there is none. It soaks up residual variation, tightening the estimate. *In observational studies the same controls would be doing the heavy lifting of identification.*

After (on slide):
> No confounding here, so covariates don't fix bias — they tighten the estimate.

(Move the italic observational-studies sentence into `::: {.notes}`.)

Why: three stacked sentences → one 12-word anchor; the contrast with observational studies is a spoken aside, not slide text.

---

**Issue #3 — slide "Doubly robust estimation: one model can be wrong and the answer still holds"**

Before:
> The first two terms are the RA prediction; the last two are IPW-weighted residuals that cancel RA's bias when the propensity model is right.

After:
> First two terms: the RA prediction. Last two: IPW residuals that cancel RA's bias.

Why: 24 words → two 8-word fragments; the "when the propensity model is right" clause is already in the notes.

---

**Issue #4 — slide "Governments spend billions on cash transfers…"**

Before:
> Cash transfers are among the most common development interventions worldwide. The hard part is not sending the money — it is *proving* it worked.
>
> We sidestep the usual ambiguity with a simulation where the answer is known in advance: the program raises consumption by **12%** ($0.12$ log points). *Can a toolkit of estimators recover a number we already know?*

After (on slide):
> The hard part isn't sending the money — it's *proving* it worked.
>
> So we simulate a known truth: **+12%** ($0.12$ log points). Can the estimators recover it?

Why: drops the encyclopedic opener (move "most common intervention worldwide" to notes); the second paragraph shrinks 30 → 14 words.

---

**Issue #5 — slide "DiD is a difference of differences — the control trend is the counterfactual"**

Before:
> The treated change carries the effect *plus* the common time trend; the control change carries the trend *alone*. Subtract, and the trend cancels.

After (two lines):
> Treated change = effect + trend. Control change = trend alone.
> Subtract — the trend cancels.

Why: 27-word two-clause sentence → two short parallel lines that mirror the equation's two braces.

---

**Issue #6 — slide "Panel DiD recovers 0.135…" (`.comment`)**

Before:
> [0.135]{.key} sits a touch above the cross-sectional $0.113$, with a wider SE ($0.027$ vs $0.019$) — the price of differencing within households.

After:
> [0.135]{.key} sits just above the cross-sectional $0.113$ — wider SE ($0.027$ vs $0.019$) is the price of differencing.

Why: 24 → 18 words; cuts the redundant "within households" (the slide already says so).

---

**Issue #7 — slide "The only chance imbalance is female-headship…" (`.comment`)**

Before:
> [$p = 0.038$ for `female` — significant, but an SMD of $9.3\%$ is the right lens: large $n$ makes tiny gaps "significant."]{.comment}

After:
> [$p = 0.038$ flags `female`, but the SMD of $9.3\%$ is the right lens — large $n$ makes tiny gaps "significant."]{.comment}

Why: tightens the lead and removes the duplicated word "significant."

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide | Source location                  | Match |
|--------------------------------------|----------------|----------------------------------|-------|
| True effect                          | 0.12           | index.md:66, 1454                | ✓     |
| Cross-sectional convergence (RA/IPW/DR) | 0.113 (SE 0.019) | index.md:883, 937, 993, 1037 | ✓     |
| Simple diff-in-means                 | 0.116          | index.md:831, 1032               | ✓     |
| Diff-in-means 95% CI                 | [0.078, 0.154] | index.md:1032                    | ✓     |
| RA/IPW/DR 95% CI (ATE)               | [0.075, 0.150] | index.md:1033-1037               | ✓     |
| Basic DiD ATT                        | 0.135 (SE 0.027) | index.md:1144, 1296            | ✓     |
| Basic DiD 95% CI                     | [0.081, 0.188] | index.md:1296                    | ✓     |
| DR-DiD (drdid / xthdidregress)       | 0.137 (SE 0.027) | index.md:1248, 1276, 1297-98   | ✓     |
| DR-DiD 95% CI                        | [0.084, 0.191] | index.md:1297-1298               | ✓     |
| etregress receipt ATE                | 0.147          | index.md:1383, 1452              | ✓     |
| etregress 95% CI                     | [0.099, 0.195] | index.md:1452                    | ✓     |
| DR receipt (teffects ipwra + y0)     | 0.117          | index.md:1424, 1453              | ✓     |
| DR receipt 95% CI                    | [0.054, 0.180] | index.md:1453                    | ✓     |
| Baseline AIPW "effect"               | −0.024 (p 0.196) | index.md:507, 515              | ✓     |
| Overid test χ²(5), p                 | 3.22, 0.667    | index.md:527-528 (3.216/0.6670)  | ✓     |
| female SMD                           | 0.093          | index.md:543, 548                | ✓     |
| female p-value                       | 0.038          | index.md:431                     | ✓     |
| Balance table means (10.025/10.006, 35.34/34.93, 11.97/12.08, 0.484/0.531, 0.307/0.318) | as listed | index.md:428-432 | ✓ |
| **Education SMD cell**               | **<0.05**      | **index.md:548 → raw 0.052**     | **✗** |
| Compliance: 85% take-up              | 85%            | index.md:280, 1315               | ✓     |
| 51.8% offered / 46.15% received / 5.65pp | in notes   | index.md:148                     | ✓     |
| Receipt rebalance 999 vs 1,001       | in notes       | index.md:1432                    | ✓     |
| Propensity span 0.43–0.55            | 0.43–0.55      | index.md:564                     | ✓     |
| Figure: ../stata_rct_balance_plot.png | resolves      | index.md:479 (same figure)       | ✓     |
| Figure: ../stata_rct_density_y.png   | resolves       | index.md:554                     | ✓     |
| Figure: ../stata_rct_overlap_baseline.png | resolves  | index.md:562                     | ✓     |
| Figure: ../stata_rct_overlap_receipt.png | resolves   | index.md:1430                    | ✓     |

The single ✗ (Education SMD) is Issue #1 (MED): the post reports raw SMD 0.052,
which is fractionally above the 0.05 the slide claims.

---

## Title sequence (assertion-title test)

Read in order, the slide titles form the talk's abstract:

1. Governments spend billions on cash transfers — but does the money actually raise welfare?
2. One dataset, twelve estimates — and the spread already tells a story
3. Where we're going
4. The lab: 2,000 households, two waves, one known answer
5. Randomization worked: every covariate sits under the 10% balance threshold
6. The only chance imbalance is female-headship — and it is borderline, not broken
7. A formal balance check: AIPW on baseline data should — and does — find nothing
8. After weighting, the two groups' consumption distributions become indistinguishable
9. Propensities cluster near 0.5 — exactly the comfortable regime for weighting
10. What are we even estimating? ATE and ATT are different questions
11. In an RCT, controls don't remove bias — they buy precision
12. Three strategies, three things to model: outcome, treatment, or both
13. Doubly robust estimation: one model can be wrong and the answer still holds
14. The cross-sectional toolkit is six lines of teffects
15. The headline cross-sectional result: every method converges on 0.113
16. RA, IPW, and DR agree because randomization made every model approximately right
17. Panel data lets each household be its own control — differencing out the invisible
18. DiD is a difference of differences — the control trend is the counterfactual
19. Panel DiD recovers 0.135 — and it is structurally an ATT, not an ATE
20. Doubly robust DiD: Sant'Anna–Zhao bring the "either model" guarantee to panels
21. Two independent DR-DiD implementations agree exactly on 0.137
22. Cross-section vs. panel: different estimands, different data, same truth inside the bars
23. Offer vs. receipt: only 85% complied, so the per-recipient effect is larger
24. Receipt-model overlap holds too — the IV story rests on solid balance
25. Does any of this *make* the result causal? No — design does, methods only discipline
26. When the design is clean, every honest estimator finds the same truth — and that agreement is the point.

**Verdict:** coherent abstract. The titles alone narrate motivation → balance →
cross-section → panel → compliance → resolution. Every title is an assertion (a
claim), not a label, and several carry the key number ("converges on 0.113",
"recovers 0.135", "agree exactly on 0.137"). The closing title is a single
declarative sentence — not "Questions?" / "Thank you."

---

## Positive highlights

- Slide 15's assertion title "every method converges on 0.113" turns the Act-II
  payoff into a six-word claim, then proves it with a black bignum slide.
- Slide 11 "In an RCT, controls don't remove bias — they buy precision" nails the
  single most-muddled RCT concept in the title itself — the conceptual core of the
  whole post.
- The estimand discipline is exemplary: every method slide names ATE vs ATT (and
  the coda separates ITT/offer from receipt), exactly as the post insists.
- Source fidelity is near-perfect: 25+ distinct numbers and all four figures trace
  to specific lines in index.md, with only one fractional table-cell nuance.
- Branding is byte-identical to the canonical templates; smoke-test passes 15/15
  with zero raw LaTeX across 34 math spans.

---

## Priority action items

1. **[MED]** Change the balance-table Education SMD cell from `<0.05` to `0.052`
   (slides.qmd:123) so it matches the post's `tebalance summarize` output.
2. **[MED]** On the four prose-heavy slides (Issues #2–#5) keep one anchor line and
   move the explanatory sentences into `::: {.notes}` per the rewrites above.
3. **[LOW]** Trim the two over-length `.comment` lines (Issues #6, #7).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_rct

To re-check just the dimension you fixed:

    /project:review-slides stata_rct focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical)
- Tooling notes: cumulative slide-audit word/bullet counts and its 6 "overflow"
  flags are the known cumulative artifact (counts grow monotonically to 640 across
  vertical sub-slides + notes). Per-current-slide DOM measurement of all 31
  sections shows **zero resting overflow**; the only >720px reading (738px, +18px)
  occurs transiently during one Act-III fragment build, not in any slide's final
  state. Treated as LOW (Issue #9), not a blocker.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
