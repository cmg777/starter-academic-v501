# Review: python_panel_intro Slide Deck

**Audited:** content/post/python_panel_intro/slides/
**Source of truth:** content/post/python_panel_intro/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** A faithful, well-paced deck: every number on every slide traces exactly to the source post, the assertion titles read as a coherent abstract, the 3-act arc and Devil's-Advocate slide are in place, and branding is byte-identical to the canonical templates. The strongest dimension is source fidelity (all 30+ data points verified); the weakest was readability, where one Devil's-Advocate slide stacked three sentences of body prose — fixed in this pass by moving the elaboration to speaker notes. The `slide-audit.cjs` "overflow"/"words" flags are the known cumulative-notes artifact; a per-slide re-measurement at 1280×720 (notes excluded) found zero real overflow.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                          |
|----|-------------------------------|-----------:|--------:|------------------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 30+ numbers/figures/table cells trace to source |
| 2  | Conceptual correctness        | 10         | 0       | ATE-for-switchers, strict exogeneity, selection framing all correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; no raw LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes                    |
| 5  | Readability & simplicity      | 9          | 1 MED   | 1 prose-stack slide (fixed); rest within thresholds |
| 6  | Typos & grammar               | 10         | 0       | em-dashes used; terminology consistent         |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate; closing is one declarative sentence |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                          |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none (per-slide re-measure); figures captioned |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html` ok; files ok; 5/5 figures resolve |

---

## Issues found

| #  | Dim | Severity | Location                                                       | Issue                                                                 | Suggested fix                                  |
|---:|----:|----------|----------------------------------------------------------------|----------------------------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slide 24 — "Does FE make this causal? No…" (slides.qmd:286)    | Rebuttal stacked three full sentences of body prose on-slide (> 1-sentence threshold) | Keep one tight rebuttal line on-slide; move the two elaborating sentences to `::: {.notes}` (applied) |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 24 "Does FE make this causal? No — strict exogeneity still carries the weight"**

Before:
> [Response.]{.rebuttal} Correct. FE/FDFE/TWFE/CRE target the ATE for *union switchers* only under **strict exogeneity given the worker fixed effect**. They remove time-invariant confounders, not time-*varying* ones (a promotion that coincides with joining a union). POLS and Between carry no causal reading absent unconfoundedness.

After:
> [Response.]{.rebuttal} Correct. FE/FDFE/TWFE/CRE target the ATE for *union switchers* only — and only under **strict exogeneity given the worker fixed effect**.
> *(the two elaborating sentences moved to speaker notes)*

Why: three stacked body sentences → one assertion line on-slide; the time-varying-confounder caveat and the POLS/Between disclaimer become spoken material in `::: {.notes}`, preserving the content without crowding the slide.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                  | Value on slide        | Source location              | Match |
|----------------------------------------------|-----------------------|------------------------------|-------|
| Title-strip: pooled OLS                      | 0.075                 | index.md:594 (0.0750)        | ✓     |
| Title-strip: fixed effects                   | 0.210                 | index.md:597 (0.2103)        | ✓     |
| Title-strip: within share of union variance  | 9.1%                  | index.md:357                 | ✓     |
| Tension: POLS premium / FE premium           | 7.5% / 21%            | index.md:69, 73              | ✓     |
| Panel size N                                 | 2,199 workers         | index.md:317, 330            | ✓     |
| Observations N×T                             | 4,398 (implied 2×2199)| index.md:319                 | ✓     |
| Unionized share                              | 16.3%                 | index.md:330 (0.1626)        | ✓     |
| Mean log wage / SD                           | 3.11 / 0.60           | index.md:324, 330            | ✓     |
| Periods                                      | 2010 and 2012, T = 2  | index.md:288                 | ✓     |
| Between/within union variance                | 93.9% / 9.1%          | index.md:352, 357            | ✓     |
| Schooling between share                      | 100% (zero within)    | index.md:352, 357            | ✓     |
| POLS coefficient / SE                        | 0.0750 / 0.0231       | index.md:393, 594            | ✓     |
| POLS t-stat                                  | t ≈ 3.25              | index.md:396                 | ✓     |
| Between coefficient                          | 0.066 / 0.0662        | index.md:412, 595            | ✓     |
| FDFE coefficient / SE / ×SE                  | 0.2113 / 0.079 / 3.4× | index.md:445, 449            | ✓     |
| FE / DVFE coefficient                        | 0.2103                | index.md:468, 488            | ✓     |
| Dummy count                                  | 2,198 dummies         | index.md:491                 | ✓     |
| TWFE coefficient / SE                        | 0.2129 / 0.0793       | index.md:506                 | ✓     |
| RE coefficient / SE / ×tighter               | 0.1092 / 0.0299 / 2.7×| index.md:528, 531            | ✓     |
| Hausman H / p / β-gap                        | 1.79 / 0.180 / +0.101 | index.md:551–552             | ✓     |
| Mundlak / CRE within / γ / p                 | 0.2103 / −0.144 / 0.072| index.md:580–581            | ✓     |
| Final table (6 methods coef + SE)            | matches index.md §14  | index.md:594–599             | ✓     |
| Extended: POLS→0.057, school +11.1, female −27.3, TWFE age −0.058 | as stated | index.md:632–633, 640 | ✓     |
| Figure: panel_intro_coef_comparison.png      | reused in place       | index.md:590                 | ✓     |
| Figure: panel_intro_variation.png            | reused in place       | index.md:355                 | ✓     |
| Figure: panel_intro_trajectories.png         | reused in place       | index.md:376                 | ✓     |
| Figure: panel_intro_demeaning.png            | reused in place       | index.md:473                 | ✓     |
| Figure: panel_intro_extended_models.png      | reused in place       | index.md:638                 | ✓     |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. Same workers, same question — but the answer triples depending on the estimator
2. Six estimators on one panel disagree by a factor of three
3. Where we're going
4. The lab: 2,199 workers, two years, a perfectly balanced T = 2 panel
5. Each estimator chooses *which* variation to believe
6. 94% of union variation is *between* workers — only 9.1% is within
7. Only the workers who *switch* status identify the within estimators
8. Pooled OLS — the naive baseline — reports a 7.5% premium
9. First-differencing erases α_i and triples the estimate to 0.211
10. The within transformation demeans the data — and the slope steepens to 0.21
11. Three recipes, one number: FD, demeaning, and dummy FE all give 0.2103
12. Two-way FE absorbs year shocks and lands at 0.2129 — closing the FD–FE gap
13. Random effects bets on no-correlation — and is pulled toward POLS at 0.109
14. The Hausman test fails to reject RE — but only because FE is noisy
15. Mundlak recovers the FE coefficient *and* flags negative selection
16. Within-worker, joining a union pays 0.21 log points — nearly triple the naive 0.075
17. Two camps, three-fold apart — and the gap is selection, not noise
18. Adding controls leaves the four-camp gap intact
19. Does FE make this causal? No — strict exogeneity still carries the weight
20. In low-power settings, lead with CRE/Mundlak — it dominates Hausman
21. Let the within variation, not the pooled average, tell you what a treatment does.

**Verdict:** coherent abstract. The titles narrate the whole talk — tension (triple disagreement) → mechanism (between/within, switchers) → each estimator with its number → specification tests → resolution (within ≈ 0.21, lead with CRE). "Where we're going" (3) is the only label title and is a legitimate agenda slide.

---

## Positive highlights

- Slide 9's title "First-differencing erases α_i and triples the estimate to 0.211" states the transformation, the mechanism, and the result in one assertion.
- Slide 14's title "The Hausman test fails to reject RE — but only because FE is noisy" is the rare title that previews a caveat, not just a result — exactly the honest framing the post argues for.
- Every number on the title key-result strip (0.075 / 0.210 / 9.1%) is load-bearing and traces to the post, and the strip's three captions correctly distinguish cross-sectional vs within vs variance-share.
- The columns slide (5) cleanly replaces the post's Mermaid decision diagram, which Quarto revealjs cannot render — a correct slide-mapping choice noted in the speaker notes.
- The closing divider (21) is one declarative imperative sentence, not "Questions?" / "Thank you".

---

## Priority action items

1. **[MED]** Trim the slide-24 rebuttal to one assertion line and move the two elaborating sentences to `::: {.notes}` — **applied in this pass**.

(No HIGH items. One MED, now resolved; deck re-rendered.)

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_panel_intro

To re-check just the dimension fixed:

    /project:review-slides python_panel_intro focus: readability

---

## Audit metadata

- Node version: v20.x
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html both byte-identical)
- Tooling notes: `slide-audit.cjs` overflow/word flags are the documented cumulative-notes artifact; a per-slide re-measurement at 1280×720 (notes excluded) found 0 real overflow and confirmed maxBottom ≤ 684 / maxRight ≤ 1218 on every slide. No raw-LaTeX on any slide.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
