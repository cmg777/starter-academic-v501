# Review: python_mgwr Slide Deck

**Audited:** content/post/python_mgwr/slides/
**Source of truth:** content/post/python_mgwr/index.md (no results_report.md present)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** A faithful, well-paced, on-brand deck. Every number, figure, table cell, and equation traces cleanly to the source post; the 3-act Tension→Investigation→Resolution arc lands, the assertion titles read as a coherent abstract, and math renders correctly (MathJax v2, 28 typeset elements, no raw LaTeX). Strongest dimension is **source fidelity** (perfect ledger); weakest is **readability** — one slide stacks two prose sentences where one anchor line plus speaker notes would serve. Fixing that single MED promotes the deck from already-strong to clean.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 20+ numbers/5 figures trace to post|
| 2  | Conceptual correctness        | 10         | 0       | descriptive framing; no causal overclaim|
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders y         |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes             |
| 5  | Readability & simplicity      | 7          | 1 MED   | 1 prose-stack slide                     |
| 6  | Typos & grammar                | 10        | 0       | no typos; em-dashes; consistent terms   |
| 7  | write-slides design adherence | 10         | 0       | arc ok; closing ok; 2 devil's-advocate  |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                    |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none (per-slide 1280×720)      |
| 10 | Deliverable completeness      | 10         | 0       | link ok; files ok (51 KB)               |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slide — "GWR lets every district keep its own slope and intercept" (slides.qmd:119) | Two prose sentences on-slide; the second is a 23-word, two-clause sentence joined by a semicolon (two ideas: kernel weighting + bandwidth meaning). | Keep one anchor line on-slide; move the distance-decay/bandwidth detail to `::: {.notes}` (notes already cover it). See rewrite below. |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "GWR lets every district keep its own slope and intercept"**

Before:
> Now $\alpha$ and $\beta$ are **functions of location** $(u_i, v_i)$. A distance-decay kernel weights nearby districts more; a **bandwidth** $h$ sets how many neighbours each local regression listens to.

After (on slide):
> Now $\alpha$ and $\beta$ are **functions of location** $(u_i, v_i)$ — one regression per place.

(move to notes): "A distance-decay kernel weights nearby districts more. A bandwidth $h$ sets how many neighbours each local regression listens to."

Why: two stacked prose sentences → one 9-word anchor line; the 23-word semicolon sentence (two ideas) moves to the speaker's mouth, where the notes already explain bandwidth.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                        | Value on slide        | Source location               | Match |
|------------------------------------|-----------------------|-------------------------------|-------|
| Global convergence coefficient β    | −0.195                | index.md:406 (−0.1948)        | ✓     |
| Global R²                          | 0.214                 | index.md:478, 585             | ✓     |
| MGWR R²                            | 0.762                 | index.md:478, 585             | ✓     |
| Global Adj. R²                     | 0.212                 | index.md:577 (0.2120)         | ✓     |
| MGWR Adj. R²                       | 0.736                 | index.md:577 (0.7357)         | ✓     |
| Global AICc                        | 1341.25               | index.md:578                  | ✓     |
| MGWR AICc                          | 838.41                | index.md:578, 474 (838.405)   | ✓     |
| Bandwidth                          | 44 (both vars)        | index.md:478, 588–589         | ✓     |
| Bandwidth share                    | ~8.6% of sample       | index.md:478                  | ✓     |
| Intercept ENP_j                    | 26.81                 | index.md:464 (X0 26.805)      | ✓     |
| Slope ENP_j                        | 25.27                 | index.md:465 (X1 25.271)      | ✓     |
| Intercept Adj t(95%)               | 3.13                  | index.md:464 (3.127)          | ✓     |
| Slope Adj t(95%)                   | 3.11                  | index.md:465 (3.109)          | ✓     |
| Effective parameters               | 52 / 52.1             | index.md:470 (52.076), 478    | ✓     |
| Local slope range                  | −1.74 to +0.42        | index.md:524                  | ✓     |
| Local slope median / sd            | −0.085 / 0.553        | index.md:524                  | ✓     |
| Significant catching-up districts  | 149 / 514 (29%)       | index.md:543, 568             | ✓     |
| Not-significant districts          | 365 (71%)             | index.md:544, 568             | ✓     |
| Significant divergence             | 0 / none              | index.md:545, 568             | ✓     |
| Outcome g mean / range             | 0.39, −2.05 to +2.06  | index.md:325–328 (0.386, −2.0452, 2.0563) | ✓ |
| ln(y) range                        | 7.17 to 13.44         | index.md:327–328              | ✓     |
| Income range in $                  | $1,300 / $690,000     | index.md:331                  | ✓     |
| N districts / islands / span       | 514 / 17,000 / 5,000 km | index.md:300                | ✓     |
| Figure: global scatter             | ../mgwr_scatter_global.png | index.md:404             | ✓     |
| Figure: x/y choropleth             | ../mgwr_map_xy.png    | index.md:358                  | ✓     |
| Figure: intercept map              | ../mgwr_mgwr_intercept.png | index.md:504             | ✓     |
| Figure: slope map                  | ../mgwr_mgwr_slope.png | index.md:522                 | ✓     |
| Figure: significance map           | ../mgwr_mgwr_significance.png | index.md:566          | ✓     |
| Code: Sel_BW(... multi=True, spherical=True) | matches      | index.md:439–441              | ✓     |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. One national convergence number forces 514 different places onto a single line
2. The global fit is so weak it explains barely a fifth of growth
3. Where we're going
4. The lab: 514 districts, one outcome, one predictor, a 5,000-km archipelago
5. The naked-eye maps already show geography is organized, not random
6. β-convergence is one global slope on initial income
7. GWR lets every district keep its own slope and intercept
8. GWR's flaw: one bandwidth for all variables — MGWR removes it
9. Four lines fit MGWR on standardized variables in Python
10. MGWR picks a tight window of 44 districts — about 8.6% of the sample
11. The intercept reveals an east–west growth gradient
12. Catching-up is intense in western Sumatra, absent across most of the country
13. The local slope ranges from −1.74 to +0.42 — nowhere near a single −0.195
14. Going local triples the explained variance and slashes AICc by 500
15. Only 149 of 514 districts truly converge — and none diverge
16. Indonesia's apparent national convergence is concentrated in 29% of districts
17. Did MGWR just overfit its way to a high R²? No
18. MGWR does not identify causes — it maps where a relationship lives
19. (closing) Let geography, not a single national coefficient, tell you where catching-up happens.

**Verdict:** coherent abstract. Read alone, the titles narrate the full argument — tension (one number hides 514 places), investigation (data → global → GWR → MGWR → maps), resolution (fit triples, 29% converge), and two honest objections answered. "Where we're going" (slide 3) is the one near-label title but is a deliberate agenda card after the hook, which is acceptable.

---

## Positive highlights

- Slide "The local slope ranges from −1.74 to +0.42 — nowhere near a single −0.195" makes the heterogeneity visceral with one bignum and ties it directly back to the global estimate the deck is arguing against.
- Two Devil's-Advocate slides ("Did MGWR just overfit…? No" and "MGWR does not identify causes") steelman the natural objections — overfitting and causal overreach — with complexity-penalized fit stats and an explicit descriptive-scope caveat, matching the post's §8 and §9.
- The fidelity ledger is perfect: ENP (26.81/25.27) and adjusted t-values (3.13/3.11) are rounded faithfully from the post's 26.805/25.271 and 3.127/3.109, not invented.
- Currency in the speaker notes ("690,000 dollars", "1,300 dollars") is written as words, sidestepping any MathJax `$` collision — a deliberate, correct choice.

---

## Priority action items

1. **[MED]** Slim the "GWR lets every district…" slide to a single anchor line; move the distance-decay/bandwidth sentence into `::: {.notes}` (notes already explain bandwidth). See Issue #1 rewrite.

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow or unrendered math detected at 1280×720.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_mgwr

To re-check just the dimension you fixed:

    /project:review-slides python_mgwr focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs reported 6 "overflow" + 22 "dense" slides, but those are the known CUMULATIVE per-slide artifact (counts accrue across vertical sub-slides + hidden notes; titles all collapse to the act-divider name). Re-verified per current slide via `Reveal.getCurrentSlide()` at 1280×720: every slide's scrollHeight ≤ 720 (no real overflow), and a DOM-wide MathJax pass found 28 rendered `.MathJax`/`.MJXc` elements with 0 visible raw-LaTeX previews (MathJax v2 from CDN; `mjx-container` count is 0 only because that is a v3-only element).

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
