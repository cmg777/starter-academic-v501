# Review: stata_fwl Slide Deck

**Audited:** content/post/stata_fwl/slides/
**Source of truth:** content/post/stata_fwl/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled (static slide-audit; per-slide overflow re-verified manually)

---

## Verdict: MINOR REVISION

**Overall assessment.** A strong, faithful deck: every number, figure, table, and equation traces to the source post, branding is byte-identical to the canonical templates, the smoke-test passes 15/15, and math renders cleanly (zero raw-LaTeX slides). The strongest dimension is source fidelity (all 16 ledger items match). The weakest is readability: four slides stack multiple prose sentences in on-slide `.comment` / `.rebuttal` spans that belong in speaker notes. Moving that prose to `::: {.notes}` and keeping a single anchor line on each promotes the deck to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 16 numbers/figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | estimand/causal caveat stated correctly|
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders; 0 raw-LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 6          | 4 MED   | 4 prose-wall slides → notes            |
| 6  | Typos & grammar               | 10         | 0       | terminology/em-dash consistent         |
| 7  | write-slides design adherence | 9          | 1 LOW   | arc ok; Devil's-Advocate present; closing ok |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 9          | 1 LOW   | figures captioned; no true overflow    |
| 10 | Deliverable completeness      | 10         | 0       | link ok (url: slides/index.html); files ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slide "A toy dataset…" (qmd:91)   | `.comment` stacks 3 sentences on slide (wall of prose) | Keep one anchor line; move rest to notes |
| 2  | 5   | MED      | slide "The FWL theorem…" (qmd:115)| 3 prose sentences below the equation (wall)    | Keep one anchor; move the two regress-steps to notes |
| 3  | 5   | MED      | slide "Does the scatter…causal?" (qmd:260) | rebuttal is a 4-sentence paragraph on slide | Trim to two short on-slide lines; rest to notes |
| 4  | 5   | MED      | slide ""Controlling for income"…" (qmd:56) | second on-slide sentence is ~25 words      | Split into two short lines                      |
| 5  | 7   | LOW      | slide "A toy dataset…" (qmd:85-91)| incremental bullets + a long `.comment` = two density modes on one slide | After fix #1 the slide is cleaner; no further action |
| 6  | 9   | LOW      | slide-audit reports 7 "overflow" slides | cumulative vertical+notes word counts (known artifact); no real per-slide clip | None — verified the figures/tables fit |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "A toy dataset built so income confounds the coupon–sales link"**

Before:
> The store targets promotions at lower-income areas, so coupons and income are negatively linked (−0.71). Income also lifts sales. That opens a backdoor path the naive slope never blocks.

After (on slide):
> Coupons and income are negatively linked (−0.71) — a backdoor the naive slope misses.

Why: three stacked sentences → one anchor line; the two explanatory sentences go to `::: {.notes}` where the speaker says them aloud.

**Issue #2 — slide "The FWL theorem: residualize first, then read one slope"**

Before:
> Regress $y$ on the controls $Z$ and keep the residual $\tilde y$. Regress $x_1$ on $Z$ and keep $\tilde x_1$. The simple slope of $\tilde y$ on $\tilde x_1$ **equals** the multiple-regression coefficient on $x_1$.

After (on slide):
> Residualize both axes on $Z$, then read one slope — it **equals** the multiple-regression coefficient on $x_1$.

Why: three prose sentences below an equation is a wall; one anchor line keeps the payoff. The two "Regress … keep the residual" steps move to notes.

**Issue #3 — slide "Does the scatter make this causal? No — it only makes the algebra visible"**

Before:
> It is not. FWL is an *algebraic identity* about a linear regression coefficient — it visualizes "holding Z fixed," nothing more. The +0.212 is causal here only because *we built* a known DGP; in real data, identification still rests on having the right controls in Z. FWL shows what a coefficient *is*, not whether it deserves a causal reading.

After (on slide):
> It is not. FWL is an algebraic identity — it visualizes "holding Z fixed," nothing more. The +0.212 is causal here only because *we built* the DGP.

Why: a four-sentence rebuttal paragraph is a wall; two short lines carry the steelman, the rest (real-data caveat + "what a coefficient is") move to notes where they already partly live.

**Issue #4 — slide ""Controlling for income" is the one move you can never draw on a scatter"**

Before:
> But "the effect of coupons, holding income fixed" lives in three dimensions. *How do you put that on two axes?*

After:
> "Holding income fixed" lives in three dimensions. *How do you put that on two axes?*

Why: trims the ~25-word setup to a tighter hook; same rhetorical question, fewer words.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                       | Value on slide | Source location               | Match |
|-----------------------------------|----------------|-------------------------------|-------|
| Naive slope                       | −0.093 / −0.0934 | index.md:330, 375           | ✓     |
| Controlled slope                  | +0.212 / 0.2123 | index.md:341, 375            | ✓     |
| income coefficient                | 0.3004 / 0.300 | index.md:375, 383            | ✓     |
| R² naive → controlled             | 0.028 → 0.32/0.321 | index.md:378-383          | ✓     |
| corr coupons·sales                | −0.17          | index.md:314 (−0.1664)        | ✓     |
| corr income·coupons               | −0.71          | index.md:314 (−0.7087)        | ✓     |
| corr income·sales                 | +0.50          | index.md:314 (0.5003)         | ✓     |
| OVB formula 0.300×(−0.494)        | −0.148         | index.md:410 (γ0.3004·δ−0.4937)| ✓    |
| Manual FWL slope                  | 0.212288       | index.md:435, 440             | ✓     |
| Three-panel progression           | −0.093→+0.212→+0.222 | index.md:475, 490       | ✓     |
| R² three panels                   | 0.028→0.32→0.37 | index.md:484, 490            | ✓     |
| Binned fit                        | β=0.21, R²=0.32 | index.md:514                 | ✓     |
| Flights air-time FE               | −0.005→−0.008→−0.032 | index.md:593            | ✓     |
| Flights N (singletons dropped)    | (notes) 4,994  | index.md:599, 603            | ✓     |
| Wage panel R²                     | 0.04 → 0.59    | index.md:688, 690             | ✓     |
| Within return to experience       | ≈ 7%           | index.md:690                  | ✓     |
| Fig 1–5 paths                     | ../stata_fwl_fig{1..5}_*.png | index.md figures 349-688 | ✓ (5/5 resolve) |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. "Controlling for income" is the one move you can never draw on a scatter
2. The same data, same slope, but one picture is honest and one is a lie
3. Where we're going
4. A toy dataset built so income confounds the coupon–sales link
5. The raw correlation lies: coupons and sales correlate −0.17
6. The FWL theorem: residualize first, then read one slope
7. One option turns the multiple regression into a partial-regression plot
8. Partialling out income flips the slope from −0.093 to +0.212
9. The omitted-variable-bias formula predicts the gap exactly
10. By hand, the residual-on-residual slope is 0.212288 — six matching decimals
11. The residual regression reproduces the coefficient to six decimals
12. Add controls progressively and watch the scatter tighten
13. For thousands of points, bin the scatter — the slope is unchanged
14. Fixed effects are just FWL on group dummies — and they reshape the cloud
15. In a wage panel, individual fixed effects lift R² from 0.04 to 0.59
16. One algebra, three languages — only the syntax changes
17. Does the scatter make this causal? No — it only makes the algebra visible
18. "Controlling for X" is a residual-on-residual slope you can finally draw.

**Verdict:** coherent abstract. Titles read alone tell the full story (hook → confounded toy → FWL identity → OVB → manual proof → fixed effects → panel → cross-language → causal caveat → one-sentence close). Slide 3 ("Where we're going") is the only label-style title, but it is a deliberate agenda preview inside Act I — acceptable.

---

## Positive highlights

- Slide 8's assertion title "Partialling out income flips the slope from −0.093 to +0.212" states the entire payoff in nine words with both real numbers.
- The Devil's-Advocate slide (17) is a genuine steelman ("A partial-regression plot looks like proof…") with a precise rebuttal — exactly the seminar pattern the design rubric asks for.
- The big-number slide (qmd:181-185, `0.212288` on dark `#141413`) is the right rhetorical beat for the Act-II identity payoff; on-brand and legible.
- Closing slide is a single declarative sentence ("'Controlling for X' is a residual-on-residual slope you can finally draw.") — not "Questions?" / "Thank you".
- Every figure carries a data-rich caption naming the panels, R² values, and what residualization does.

---

## Priority action items

1. **[MED]** Move the three-sentence `.comment` on the toy-dataset slide (qmd:91) to `::: {.notes}`; keep one anchor line (Issue #1 rewrite).
2. **[MED]** Collapse the three prose sentences under the FWL equation (qmd:115) to one anchor; push the two regress-steps to notes (Issue #2).
3. **[MED]** Trim the four-sentence rebuttal (qmd:260) to two on-slide lines; rest to notes (Issue #3).
4. **[MED]** Split the ~25-word hook line (qmd:56) into a tighter question (Issue #4).
5. **[LOW]** No action needed for the slide-audit "overflow" flags — they are the cumulative vertical+notes counting artifact; no slide clips at 1280×720.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_fwl

To re-check just the dimension you fixed:

    /project:review-slides stata_fwl focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: slide-audit.cjs ran (static walk); per-slide overflow re-verified by reading slide bodies
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit word/overflow counts are cumulative across vertical sub-slides + hidden notes (known artifact); only raw-LaTeX (0) and genuine per-slide clipping treated as load-bearing.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
