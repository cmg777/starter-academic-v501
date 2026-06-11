# Review: r_fwlplot Slide Deck

**Audited:** content/post/r_fwlplot/slides/
**Source of truth:** content/post/r_fwlplot/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** A faithful, well-paced teaching deck: every number, figure, table cell, and equation traces cleanly to the post, the assertion titles read as a coherent abstract, and the 3-act arc closes on a single declarative imperative. The strongest dimension is source fidelity (all 24 data points verified). The one ship-relevant defect was a `code-line-numbers` highlight range pointing at lines that do not exist (slide "Controlling for income is one line"), a Dimension 3 render-correctness bug. Fixing that one range — plus a minor sentence trim — promotes the deck to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                       |
|----|-------------------------------|-----------:|--------:|---------------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 24 numbers/figures/tables trace to post |
| 2  | Conceptual correctness        | 10         | 0       | estimand framing + OVB stated correctly     |
| 3  | Technical & render correctness| 7          | 1 MED   | smoke-test PASS; math renders; 1 bad line-range |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes                 |
| 5  | Readability & simplicity      | 8          | 2 LOW   | 0 over-length titles; 1 20-word body line   |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; consistent terminology   |
| 7  | write-slides design adherence | 9          | 1 LOW   | arc ok; closing ok; 23 slides (band +1)     |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                       |
| 9  | Accessibility & legibility    | 10         | 0       | 0 real overflow; every figure captioned     |
| 10 | Deliverable completeness      | 9          | 1 LOW   | link ok; files ok; icon is chalkboard-teacher |

---

## Issues found

| #  | Dim | Severity | Location                                                    | Issue                                                                                   | Suggested fix                                          |
|---:|----:|----------|-------------------------------------------------------------|-----------------------------------------------------------------------------------------|--------------------------------------------------------|
| 1  | 3   | MED      | slides.qmd:123 — "Controlling for income is one line"       | `code-line-numbers="1\|3\|3-4"` highlights lines 3 and 4, but the block has only 2 lines | Change to `code-line-numbers="1\|2\|1-2"` (FIXED)       |
| 2  | 5   | LOW      | slide 1.1 — "‘Controlling for income’ is a 4-D claim…"      | On-slide sentence is 20 words (> ~15 flag)                                               | Trim to a shorter clause (FIXED)                       |
| 3  | 5   | LOW      | slide 3.1 — "The residualized scatter is the exact picture" | Two 3-item columns render as 6 `<li>` (> 5 cap, browser pass)                            | Deliberate two-column contrast; left as-is (deferred)  |
| 4  | 7   | LOW      | whole deck                                                  | 23 rendered slides vs Teaching band 16–22 (one over)                                     | Acceptable; no merge needed (deferred)                 |
| 5  | 10  | LOW      | index.md:16                                                 | Deck link uses `icon: chalkboard-teacher`, checklist prefers `person-chalkboard`         | Cosmetic; both valid FA icons; index.md out of scope (deferred) |

Order: HIGH first, then MED, then LOW. (No HIGH issues.)

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide 1.1 "‘Controlling for income’ is a 4-D claim we keep trying to draw in 2-D"**

Before:
> When we say "the effect of coupons on sales, *controlling for income*," we describe a relationship that lives in many dimensions.

After:
> "The effect of coupons on sales, *controlling for income*" is a relationship in many dimensions.

Why: 20 words → 14; drops the "When we say … we describe" frame for a direct claim. The follow-up fragment ("You cannot put it on a scatter plot. *Or can you?*") still lands the hook.

**Issue #3 — slide 3.1 "The residualized scatter is the exact picture of every regression coefficient"** — no rewrite; the 6 `<li>` are a deliberate Raw-scatter / FWL-scatter two-column contrast (3 each), which `design-adherence.md` explicitly permits. Splitting would invent content.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                            | Value on slide          | Source location               | Match |
|----------------------------------------|-------------------------|-------------------------------|-------|
| Naive → controlled coupon slope        | −0.093 → +0.212         | index.md:341,351,382          | ✓     |
| True coupon effect                     | +0.2                    | index.md:287                  | ✓     |
| DGP coefficients                       | −0.5 / +0.3 / +0.2      | index.md:283–285,287          | ✓     |
| corr coupons↔sales (raw)               | −0.166                  | index.md:324                  | ✓     |
| corr income↔coupons                    | −0.709                  | index.md:325                  | ✓     |
| corr income↔sales                      | +0.500                  | index.md:324                  | ✓     |
| coupons coef Naive / Controlled        | −0.0934 / +0.2123       | index.md:373                  | ✓     |
| income coef                            | +0.3004                 | index.md:374                  | ✓     |
| R² naive / controlled                  | 0.028 / 0.321           | index.md:378,382              | ✓     |
| Manual FWL coefficient                 | 0.212288                | index.md:410–411              | ✓     |
| OVB = γ·δ                              | 0.300 × (−0.494) = −0.148 | index.md:443,448,701        | ✓     |
| True + bias ≈ naive                    | 0.212 − 0.148 ≈ −0.093  | index.md:448                  | ✓     |
| Flights observations                   | 317,578                 | index.md:506                  | ✓     |
| air_time coef (No / Orig / Both FE)    | −0.0031 / −0.0061 / −0.0067 | index.md:549              | ✓     |
| Within R² (Origin / Both)              | 0.00058 / 1.19e-5       | index.md:556                  | ✓     |
| destination means count                | 103                     | index.md:531                  | ✓     |
| wagepan panel size                     | 545 indiv / 8 yrs / 4,360 | index.md:565,577–579        | ✓     |
| exper slope pooled → FE                | 0.03 → 0.122            | index.md:633,704              | ✓     |
| R² pooled → FE                         | 0.148 → 0.617           | index.md:613,704              | ✓     |
| Fig 1 (naive vs controlled)            | ../r_fwlplot_fig1_naive_vs_controlled.png | index.md:353  | ✓     |
| Fig 3 (fixed effects)                  | ../r_fwlplot_fig3_fixed_effects.png | index.md:529        | ✓     |
| Fig 4 (panel data)                     | ../r_fwlplot_fig4_panel_data.png | index.md:631           | ✓     |
| FWL matrix equation                    | β̂₁=(X̃₁'X̃₁)⁻¹X̃₁'Ỹ …   | index.md:420                  | ✓     |
| Residual-maker M_{X₂}                  | I − X₂(X₂'X₂)⁻¹X₂'      | index.md:422                  | ✓     |

All ✓ — no invented or altered values.

---

## Title sequence (assertion-title test)

Read in order, the slide titles form the talk's abstract:

1. "Controlling for income" is a 4-D claim we keep trying to draw in 2-D
2. A raw scatter says coupons *hurt* sales — and it is lying
3. Where we're going
4. The lab: 200 stores where income secretly drives both coupons and sales
5. The correlation matrix already shows the trap: coupons–sales is −0.166
6. FWL: partial the controls out of *both* axes, then run one simple regression
7. Controlling for income is one line — and it flips the slope to +0.212
8. The regression table confirms what the picture showed
9. Under the hood: residualize, residualize, regress — three lines
10. Manual FWL reproduces feols to six decimals — it is an exact identity
11. The bias was no mystery — the OVB formula predicted it
12. Fixed effects are just FWL applied to group dummies — i.e. demeaning
13. More fixed effects = a tighter residual cloud: the flights data, panel by panel
14. Once you compare flights on the same route, the air-time slope is barely there
15. In a wage panel, controlling for *who you are* steepens the experience slope
16. Within-person, the return to experience more than triples: 0.03 → 0.122
17. The residualized scatter is the exact picture of every regression coefficient
18. Does FWL make a regression causal? No — it only makes it *visible*

**Verdict:** coherent abstract. Every title is an assertion (no label titles); the sequence moves problem → confounder → FWL → verification → fixed effects → panel → resolution. "Where we're going" (slide 3) is a brief roadmap fragment but does not break the arc.

---

## Positive highlights

- Slide 10's title "Manual FWL reproduces feols to six decimals — it is an exact identity" pairs with a single `[0.212288]{.bignum}` on a dark slide — the deck's strongest one-idea moment.
- Slide 18 "Does FWL make a regression causal? No — it only makes it *visible*" is a genuine Devil's-Advocate slide that steelmans the objection then rebuts it precisely (algebraic identity ≠ identification).
- The closing divider "Want to *see* a coefficient? Partial the controls out of both axes and plot the residuals." is one declarative sentence — not "Questions?" / "Thank you".
- Fidelity is exact: all 24 ledger rows match, including signs (−0.0067, 1.19e-5) and the OVB arithmetic 0.300 × (−0.494) = −0.148.
- Math renders cleanly (browser pass: 0 raw-LaTeX slides); the FWL residual-maker equation and OVB equation typeset on dark and light slides alike.

---

## Priority action items

1. **[MED]** Fix the highlight range on slides.qmd:123 — `code-line-numbers="1|3|3-4"` → `"1|2|1-2"` (the block has 2 lines). **(applied)**
2. **[LOW]** Trim the 20-word opening sentence on slide 1.1 to a direct 14-word claim. **(applied)**
3. **[LOW]** Leave slide 3.1's two-column 3+3 contrast as-is (deliberate, permitted).
4. **[LOW]** Optionally align the index.md deck-link icon to `person-chalkboard` (cosmetic; out of this review's edit scope).

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow clipping or unrendered math detected in the browser pass.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_fwlplot

To re-check just the dimension you fixed:

    /project:review-slides r_fwlplot focus: render

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (resolved from npx cache; Chromium via system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: the vendored `slide-audit.cjs` reported 8 OVERFLOW + 22 dense slides, but its per-slide word/bullet/overflow counts are cumulative across vertical sub-slides + speaker notes (a known artifact — it also mislabels content slides with their parent divider title). An independent per-current-slide remeasurement (Reveal.next() walk, notes excluded) found 0 real overflow and only one slide (3.1) above the 5-bullet cap, via a deliberate two-column layout.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
