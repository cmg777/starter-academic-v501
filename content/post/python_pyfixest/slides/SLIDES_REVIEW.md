# Review: python_pyfixest Slide Deck

**Audited:** content/post/python_pyfixest/slides/
**Source of truth:** content/post/python_pyfixest/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT (after applied fixes)

**Overall assessment.** A strong, faithful, on-brand deck. Every number, figure, table cell, and equation traces cleanly to the source post; smoke-test passes 15/15; branding files are byte-identical to the canonical templates; no genuine overflow at 1280×720 and no raw LaTeX. The pre-fix state had no HIGH issues — its weakest point was Dimension 4 (one slide whose title asserted an R² story while the visible figure shows coefficients). That, plus three minor consistency nits, has been corrected; the deck is now ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 9          | 1 MED   | all numbers trace; SE attribution nit (fixed) |
| 2  | Conceptual correctness        | 10         | none    | estimand (ATT/LATE/ATE) correctly flagged in notes |
| 3  | Technical & render correctness| 10         | none    | smoke-test PASS; 0 raw-LaTeX slides    |
| 4  | Title↔body consistency        | 7          | 1 MED   | title-vs-figure mismatch on coef slide (fixed) |
| 5  | Readability & simplicity      | 10         | none    | prose lives in notes; slides are anchors |
| 6  | Typos & grammar               | 8          | 2 LOW   | F-stat rounding title↔body; γ verb (fixed/noted) |
| 7  | write-slides design adherence | 10         | none    | 3-act arc; assertion titles; Devil's-Advocate; declarative close |
| 8  | Branding integrity            | 10         | none    | scss + title diff clean                |
| 9  | Accessibility & legibility    | 10         | none    | 0 overflow per-slide at 1280×720; figures captioned |
| 10 | Deliverable completeness      | 10         | none    | link `url: slides/index.html`; files present |

---

## Issues found

| #  | Dim | Severity | Location                                            | Issue                                                                 | Suggested fix                                              |
|---:|----:|----------|-----------------------------------------------------|----------------------------------------------------------------------|-----------------------------------------------------------|
| 1  | 4   | MED      | slide — "Adding fixed effects … R-squared from 0.12 to 0.61" | Title asserts the R² jump, but the on-slide figure (`pyfixest_coef_comparison.png`) shows the **X1 coefficient**, not R². Title↔figure mismatch. | Retitle to assert what the figure shows (coefficient stability); keep R² in notes. **Applied.** |
| 2  | 1   | MED      | slide — bignum-label "Worker fixed effects cut … 7.8%" | `(was 18.3% in pooled OLS · SE 0.024)` places SE 0.024 next to "pooled OLS"; 0.024 is the **one-way FE** SE (index.md:939). Pooled OLS SE is 0.016 (index.md:911). | Reattribute: `(was 18.3% in pooled OLS; one-way FE SE 0.024)`. **Applied.** |
| 3  | 6   | LOW      | slide — "IV … recovers a strong first stage (F = 311)" | Title says `F = 311`; body says `F = 311.54`. Rounding mismatch within one slide (311.54 rounds to 312). | Drop the parenthetical number from the title; body carries the precise value. **Applied.** |
| 4  | 6   | LOW      | slides.qmd:218 — `.comment` on CRE slide             | "the time-invariant $\gamma$ become estimable again" — singular symbol γ with plural verb reads slightly off. | Acceptable (γ denotes the coefficient vector). Noted, not changed. |

Order: HIGH first, then MED, then LOW.

---

## Readability rewrites (Dimension 5)

None found. On-slide text is consistently anchor-only; all explanatory prose sits in `::: {.notes}`. The hook slide carries two short sentences plus a question fragment (acceptable Act-I device); result slides pair an equation/figure with a single gloss line. No sentence exceeds ~18 words; no slide exceeds 5 bullets; no passive constructions on slides.

---

## HIGH-issue rewrites

None found. (No HIGH issues in any dimension.)

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                              | Value on slide      | Source location                  | Match |
|------------------------------------------|---------------------|----------------------------------|-------|
| Union premium (raw)                      | 18.3%               | index.md:920, 53                 | ✓     |
| Union premium (one-way FE)               | 7.8%                | index.md:939, 946                | ✓     |
| One-way FE union SE                       | 0.024               | index.md:939                     | ✓     |
| Key-result: education return (CRE)        | 0.094               | index.md:1144, 1189              | ✓     |
| Key-result: R² one-way FE                 | 0.605               | index.md:943, 978                | ✓     |
| Demeaning slope                           | −1.019              | index.md:485, 518                | ✓     |
| Synthetic coefs No/1w/2w FE               | −1.000 / −0.949 / −0.919 | index.md:547, 559, 571      | ✓     |
| Synthetic R² progression                  | 0.123 → 0.609       | index.md:576 (notes)             | ✓     |
| Synthetic SE shrink                       | 0.082 → 0.060       | index.md:576 (notes)             | ✓     |
| SE table iid/HC1/CRV1/CRV3                | 0.0858 / 0.0833 / 0.1172 / 0.1247 | index.md:638–642       | ✓     |
| SE-table t-stats                          | −11.9 / −12.2 / −8.7 / −8.2 | index.md:638–642 (rounded) | ✓     |
| IV estimate / SE                          | −1.600 / 0.336      | index.md:724                     | ✓     |
| First-stage F                             | 311.54              | index.md:727                     | ✓     |
| Wage table union/married/educ/black/R²    | 0.183→0.078 / 0.141→0.115 / 0.106→dropped / −0.135→dropped / 0.175→0.605 | index.md:971–978 | ✓ |
| Within shares union/married               | 64% / 65%           | index.md:860, 1396               | ✓     |
| Education within share                    | 100% between / 0% within | index.md:860                | ✓     |
| Extended-FE union/R² (TWFE, 3-way)        | 7.3% / 0.631 ; 7.5% / 0.632 | index.md:1036, notes:229 | ✓     |
| Event study path                          | 1.3–1.4 → ≈2.8 by t=20 | index.md:1333                 | ✓     |
| CRE recovers educ + race; matches FE      | educ 0.094, union 0.078 | index.md:1156–1161, 1189     | ✓     |
| Mundlak spoiler figure (7 covariates)     | `../pyfixest_mundlak.png` | index.md:1165, 1187         | ✓     |
| Panel: 545 men, 8 yrs, 4,360 rows         | 545 / 8 / 4,360     | index.md:736, 746, 783           | ✓     |

Every datum traces to source. No ✗.

---

## Title sequence (assertion-title test)

1. Union members earn 18% more — but is that the union, or who joins it?
2. One control — worker fixed effects — cuts the union premium nearly in half
3. Where we're going
4. Groups sit at different levels — that between-group gap is the confounder
5. A fixed effect is just one extra intercept per group
6. Absorbing group FE is mathematically identical to demeaning
7. Demeaning collapses scattered clusters onto one clean within-group slope
8. PyFixest absorbs high-dimensional FE with one pipe in the formula
9. Adding fixed effects keeps the X1 effect near −1.0 as the CI narrows
10. Clustering standard errors inflates the X1 SE by 50% — same point estimate
11. IV through fixed effects recovers a strong first stage
12. The wage panel verdict: more than half the union premium was selection
13. Worker fixed effects cut the union premium from 18.3% to 7.8%
14. Why education vanishes: its demeaned column is all zeros
15. CRE swaps entity dummies for career averages and buys education back
16. More FE dimensions barely move anything — the action was one-way FE
17. TWFE event studies overstate the effect under staggered adoption
18. Does FE make this causal? No — it removes one class of confounder, not all
19. (Close) Let the data's within-group variation, not its levels, identify the effect.

**Verdict:** coherent abstract. Titles read alone narrate the talk; "Where we're going" (slide 3) is a standard Act-I roadmap, not a label gap. The fixed slide-9 title now matches its figure.

---

## Positive highlights

- Slide 13's "Worker fixed effects cut the union premium from 18.3% to 7.8%" is a dark `.bignum` hero slide whose single number is the deck's thesis — textbook MB/MC pacing after a dense table.
- Slide 18 "Does FE make this causal? No — it removes one class of confounder, not all" is a genuine Devil's-Advocate slide (objection/response), exactly as the seminar archetype prescribes.
- The closing divider "Let the data's within-group variation, not its levels, identify the effect." is one declarative sentence — not "Questions?"/"Thank you".
- All explanatory prose is correctly housed in `::: {.notes}`; on-slide text is anchor-only, and speaker notes keep Unicode math (α_i, γ) rather than LaTeX.

---

## Priority action items

1. **[MED]** Retitle the coefficient-comparison slide so the title matches its figure (coefficients, not R²). **Applied.**
2. **[MED]** Reattribute the bignum-label SE 0.024 to the one-way FE estimate, not pooled OLS. **Applied.**
3. **[LOW]** Remove the rounded `(F = 311)` from the IV title; the body states `F = 311.54`. **Applied.**

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow or unrendered math detected. (The vendored `slide-audit.cjs` flagged 8 "OVERFLOW" slides, but per-current-slide re-measurement at 1280×720 shows `scrollHeight == clientHeight` on every slide; the flag is the documented cumulative-measurement artifact across vertical sub-slides + hidden notes.)

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_pyfixest

To re-check just the dimension you fixed:

    /project:review-slides python_pyfixest focus: consistency and fidelity

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (Chromium via system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs word/overflow counts are cumulative across vertical sub-slides + speaker notes; only raw-LaTeX (0) and per-slide overflow (0 genuine) treated as load-bearing.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
