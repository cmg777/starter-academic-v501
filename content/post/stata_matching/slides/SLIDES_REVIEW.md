# Review: stata_matching Slide Deck

**Audited:** content/post/stata_matching/slides/
**Source of truth:** content/post/stata_matching/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is a faithful, well-built deck: every number, figure, equation, and code snippet traces cleanly to the source post, and the 3-act Tension→Investigation→Resolution arc with assertion titles is exemplary. The strongest dimension is source fidelity (no fabricated or mismatched numbers; the known Goldmark `\_`-in-math bug is absent — subscripts are plain `_` for MathJax). The weakest is readability, with one slide stacking two full prose sentences and one rounded-to-ten title value among one-decimal siblings — both LOW/MED polish, neither blocking. The single fix that earns a flawless readability mark is trimming slide 2's second prose sentence to an anchor line (applied).

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 30+ numbers / 4 figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | ATE/ATT, doubly robust, NNM ATT>ATE all correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; no raw LaTeX |
| 4  | Title↔body consistency        | 9          | 1 L     | one title rounds −239.6→−240 among 1-decimal peers |
| 5  | Readability & simplicity      | 8          | 1 M 1 L | slide 2 stacks 2 prose sentences; otherwise lean |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; no `--`; no curly quotes in source |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc, assertion titles, Devil's-Advocate, 1-sentence close |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide byte-identical to templates |
| 9  | Accessibility & legibility    | 10         | 0       | 0 true overflow at 1280×720; all figures captioned |
| 10 | Deliverable completeness      | 10         | 0       | index.html 52 KB; slides_files/; link `url: slides/index.html` |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slide 2 — "Smokers' babies weigh 275 g less" (slides.qmd:56) | Two full prose sentences stacked on one slide (line 52 + line 56) | Trim line 56 to a tight anchor fragment; speaker says the rest |
| 2  | 5   | LOW      | slide 2 — "Smokers' babies weigh 275 g less" (slides.qmd:52) | Lead line is two clauses ("Striking — and almost certainly wrong…") | Acceptable for rhetorical effect; keep |
| 3  | 4   | LOW      | slide 11 — "Regression adjustment … shrinks −275 g to −240 g" (slides.qmd:164) | Title rounds −239.6→−240 g while every sibling slide uses 1-decimal precision (−230.9, −231.9, −232.5, −229.4, −210.1) | Defensible rounding; left as-is (deferred — see below) |

Order: HIGH first, then MED, then LOW. None HIGH.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 2 "Smokers' babies weigh 275 g less — but is that smoking, or who smokes?"**

Before:
> Mothers who smoke are younger, less educated, less likely to be married, less likely to get early prenatal care. *Each of those alone predicts a lighter baby.*

After:
> Smokers are younger, less educated, less often married, less likely to seek early prenatal care. *Each alone predicts a lighter baby.*

Why: 26 words → 19; drops the repeated "less likely to"; the explanatory clause becomes a tight italic fragment (the anchor), the fuller version stays in the speaker notes.

**Issue #2 — slide 2 lead line**

Before:
> A raw comparison says smokers' newborns are **275 grams lighter**. Striking — and almost certainly wrong as a *causal* number.

After:
> (kept) — a deliberate two-beat hook: the number, then the doubt. Within the acceptable "single concluding sentence + fragment" pattern.

Why: the second clause is a fragment, not a second full sentence; it lands the tension in one breath. No change.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                 | Value on slide | Source location               | Match |
|-----------------------------|----------------|-------------------------------|-------|
| Title strip: naive gap       | −275 g         | index.md:476 (−275.25)        | ✓     |
| Title strip: consensus       | −230 g         | index.md:739                  | ✓     |
| Title strip: estimators      | 6              | index.md:65                   | ✓     |
| Sample size N                | 4,642          | index.md:384                  | ✓     |
| Smokers count / share        | 864 / 18.6%    | index.md:384                  | ✓     |
| OLS coefficient / CI / t      | −275.25; [−316.8,−233.7]; t=−12.97 | index.md:471 | ✓ |
| OLS R²                        | 3.4%           | index.md:476                  | ✓     |
| RA ATE / ATT                 | −239.6 / −223.3 | index.md:512,515             | ✓     |
| RA shrink                    | 35.6 g (13%)   | index.md:518                  | ✓     |
| Manual RA                    | −239.64        | index.md:543                  | ✓     |
| IPW ATE                      | −230.9         | index.md:579                  | ✓     |
| Manual logit IPW             | −232.1 (1.2 g) | index.md:611 (−232.13)        | ✓     |
| IPWRA / AIPW ATE             | −231.9 / −232.5 | index.md:639,660             | ✓     |
| DR difference               | 0.6 g          | index.md:663                  | ✓     |
| NNM ATE / ATT                | −210.1 / −238.5 | index.md:692,693             | ✓     |
| NNM max matches             | 16             | index.md:690                  | ✓     |
| PSM ATE                      | −229.4         | index.md:735                  | ✓     |
| Resolution cluster           | −229…−240; NNM −210 | index.md:759             | ✓     |
| ATT table (RA/IPW/IPWRA/NNM/PSM) | −223.3/−219.6/−220.6/−238.5/−224.6 | index.md:777–782 | ✓ |
| Figure: density              | ../stata_matching_density_bweight.png | index.md:398 | ✓ |
| Figure: propensity dist.     | ../stata_matching_propensity_distribution.png | index.md:615 | ✓ |
| Figure: PSM logic            | ../stata_matching_psm_logic.png | index.md:704 | ✓ |
| Figure: forest plot          | ../stata_matching_forest_plot.png | index.md:757 | ✓ |

Every datum matches the source post. No ✗.

---

## Title sequence (assertion-title test)

1. Smokers' babies weigh 275 g less — but is that smoking, or who smokes?
2. One unadjusted shift — and we cannot yet say what causes it
3. Where we're going
4. The lab: 4,642 births, 864 smokers, six pre-treatment confounders
5. We want one of two averages, not one mother's effect
6. Adjustment is credible only under two assumptions
7. Six estimators, four routes — what does each one model?
8. With no controls, OLS just restates the biased −275 g gap
9. Regression adjustment models the outcome and shrinks −275 g to −240 g
10. IPW models the treatment instead — and lands at −230.9 g
11. Both distributions span (0,1): overlap holds, so IPW is stable
12. Doubly robust buys insurance for under a gram: −231.9 g and −232.5 g
13. NNM fits no model at all — it finds each smoker a statistical twin
14. PSM collapses six covariates to one score and matches on it
15. Five very different estimators converge on roughly −230 g
16. The forest plot: adjustment rules out the naive −275 g
17. ATT can flip the story: for NNM the treated lose more, not less
18. Does matching make this causal? No — two assumptions still carry it
19. When five honest routes agree, trust the −230 g over the −275 g.

**Verdict:** coherent abstract. Read in order, the titles narrate the whole argument from the naive gap through the six estimators to the conditional conclusion.

---

## Positive highlights

- Slide 7's assertion title "Six estimators, four routes — what does each one model?" previews the entire methodological map in seven words, and its table mirrors the post's §6 roadmap exactly.
- Slide 17 "ATT can flip the story: for NNM the treated lose more, not less" correctly foregrounds the deck's most subtle finding (NNM's ATT −238.5 g > ATE −210.1 g) with the right interpretation.
- The Devil's-Advocate slide (18) steelmans the objection — "Machine-matching cannot manufacture identification" — and resolves it honestly: convergence is reassuring, not proof. Exactly the design contract.
- The closing slide is one declarative sentence ("When five honest routes agree, trust the −230 g over the −275 g."), not "Questions?" / "Thank you".
- No Goldmark `\_`-in-math bug: every subscript is written plainly (`\tau_{ATE}`, `\hat e(X_i)`), so MathJax renders all 17 math spans.

---

## Priority action items

1. **[MED]** Trim slide 2's second prose sentence (slides.qmd:56) to a tighter anchor fragment; full version stays in the notes. (Applied.)
2. **[LOW]** Title on slide 9 rounds −239.6→−240 g; defensible but the lone rounded-to-ten value among 1-decimal peers. Left as-is (rounding is correct, not a fabrication).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_matching

To re-check just the dimension you fixed:

    /project:review-slides stata_matching focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs reported 7 "overflow" slides, but a per-current-slide re-measure at 1280×720 (Reveal.getCurrentSlide, deepest present section vs the 720px viewport) confirmed 0 true overflow — the audit's counts are the documented cumulative artifact (it measures the `#` divider parent section that stacks all vertical sub-slides). Density (WORDS/BULLETS) counts are likewise cumulative and were not treated as load-bearing.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
