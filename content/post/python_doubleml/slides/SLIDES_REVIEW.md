# Review: python_doubleml Slide Deck

**Audited:** content/post/python_doubleml/slides/
**Source of truth:** content/post/python_doubleml/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** This is a strong, faithful deck: every headline number traces to the post, the math escaping is correct for Pandoc, branding is byte-identical to the canonical theme, and the assertion titles read as a coherent abstract. The strongest dimension is source fidelity (1) — all 24 numeric data and 4 figures match `index.md` exactly. The weakest is readability (5): three `.comment`/`.rebuttal` lines run long (22–40 words with stacked clauses) and belong as a shorter anchor with the prose moved to notes. One small fidelity nit (the Lasso p-value rounds to `0.045` while the post reports `0.0445`) and one consistency nit (em-dash spacing in a title). No HIGH issues; fixing the three long lines and the p-value would promote this to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 8          | 0H/0M/2L | all numbers/figures trace; 1 rounding nit |
| 2  | Conceptual correctness        | 10         | 0       | ATE named; RCT-vs-observational kept right |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders (MathJax) |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 6          | 0H/3M/0L | 3 over-length clause-stacked lines     |
| 6  | Typos & grammar               | 9          | 0H/0M/1L | 1 em-dash spacing nit                  |
| 7  | write-slides design adherence | 9          | 0H/0M/1L | arc ok; closing ok; 1 agenda-label title (allowed) |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 8          | 0H/0M/1L | overflow flags are audit-walk artifacts (see note) |
| 10 | Deliverable completeness      | 10         | 0       | link ok (`slides/index.html`); files ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slides.qmd:237 — slide 16 "Does flexible ML *make* this causal?" | ~40-word rebuttal, 3 stacked clauses, on-slide | Shorten on-slide anchor; move detail to notes (see rewrite) |
| 2  | 5   | MED      | slides.qmd:114 — slide 6 "In an RCT, covariates can't fix bias" | 22-word `.comment`, one subordinate clause | Split into two short lines (see rewrite)        |
| 3  | 5   | MED      | slides.qmd:62 — slide 2 title     | 15-word title with two data points; slightly busy | Trim to the assertion + one number (see rewrite) |
| 4  | 1   | LOW      | slides.qmd:207 — slide 13 table, Lasso `$p$` | Slide shows `0.045`; post reports `0.0445`     | Use `0.044` (round-half-to-even of 0.0445, matching RF's `0.038`) or `0.0445` |
| 5  | 1   | LOW      | slides.qmd:209 — slide 13 `.comment` | "under 7%" vs post "less than 7%"             | Cosmetic; keep — both are faithful to 0.0024/0.0354 |
| 6  | 6   | LOW      | slides.qmd:62 — slide 2 title     | Colon + long clause reads as two ideas         | Folded into issue #3 rewrite                    |
| 7  | 7   | LOW      | slides.qmd:70 — slide 3 "Where we're going" | Label/agenda title, not an assertion          | Acceptable for a Teaching deck (Agenda ok); keep |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 16 "Does flexible ML *make* this causal? No — the RCT does"**

Before:
> The identification comes from **randomization**, not from DML. ML only partials out $X$ flexibly and delivers valid inference. On observational data, $\hat\theta_0$ is causal only under conditional independence given $X$ — DML disciplines *adjustment*, it cannot manufacture *identification*.

After (on slide):
> Identification comes from **randomization**, not DML. ML only partials out $X$ and delivers valid inference. DML disciplines *adjustment* — it cannot manufacture *identification*.

Why: 40 words → 27 across three short lines; the observational-data caveat moves to notes (it already is there). The slide keeps the punchline.

**Issue #2 — slide 6 "In an RCT, covariates can't fix bias — but they *can* sharpen precision"**

Before:
> If the true $X \to Y$ map is *nonlinear*, a linear $X_i'\gamma$ leaves predictable variation in the residual — wider standard errors than necessary.

After:
> A linear $X_i'\gamma$ can miss nonlinear structure in $X \to Y$. The leftover variation widens the standard errors.

Why: 22 words, one nested clause → two ~10-word sentences; active and direct.

**Issue #3 — slide 2 title**

Before:
> The raw gap is real but small: control 2.057 vs bonus 1.971 in log duration

After:
> The raw gap is real but small: bonus duration sits ~0.09 log points lower

Why: keeps the assertion and one number; drops the busy two-number colon clause (the per-group means stay in the figure caption and notes).

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                 | Value on slide | Source location               | Match |
|-----------------------------|----------------|-------------------------------|-------|
| Key-result strip θ (RF)     | −0.0736        | index.md:458/485              | ✓     |
| Key-result strip θ (Lasso)  | −0.0712        | index.md:520                  | ✓     |
| Key-result strip N          | 5,099          | index.md:253                  | ✓     |
| Control N                   | 3,354          | index.md:259                  | ✓     |
| Bonus N                     | 1,745          | index.md:260                  | ✓     |
| Outcome mean / sd           | 2.028 / 1.215  | index.md:265–266              | ✓     |
| Control vs bonus mean       | 2.057 / 1.971  | index.md:298                  | ✓     |
| Covariate count             | 15             | index.md:325                  | ✓     |
| Naive OLS coef              | −0.0855        | index.md:359                  | ✓     |
| Covariate OLS coef          | −0.0717        | index.md:360                  | ✓     |
| DML-RF SE / t / p           | 0.0354 / −2.077 / 0.0378 | index.md:458/461   | ✓     |
| DML-RF 95% CI               | [−0.143, −0.004] | index.md:458 ([−0.1430,−0.0041]) | ✓ |
| DML-Lasso coef / p          | −0.0712 / 0.0445 | index.md:520                | ✓ (slide rounds p to 0.045 — issue #4) |
| DML-Lasso 95% CI            | [−0.141, −0.002] | index.md:520 ([−0.1406,−0.0018]) | ✓ |
| RF–Lasso gap                | 0.0024 (<7% SE) | index.md:523                 | ✓     |
| RF config                   | 500 trees, depth 5, sqrt | index.md:427        | ✓     |
| Folds K                     | 5              | index.md:450                  | ✓     |
| Effect size                 | 7.4% (≈7.1% proportional) | index.md:497      | ✓     |
| Fig: outcome by treatment   | ../doubleml_outcome_by_treatment.png | index.md:296 | ✓ |
| Fig: covariate balance      | ../doubleml_covariate_balance.png | index.md:323 | ✓ |
| Fig: coefficient comparison | ../doubleml_coefficient_comparison.png | index.md:551 | ✓ |
| Fig: confidence intervals   | ../doubleml_confint.png | index.md:581         | ✓     |

Every datum traces to the source post. The only deviation is the Lasso p-value's third-decimal rounding (issue #4) — a LOW, not a fidelity break.

---

## Title sequence (assertion-title test)

Read in order, the titles form the talk's abstract:

1. Did the bonus *cause* faster reemployment — or did different people get it?
2. The raw gap is real but small: control 2.057 vs bonus 1.971 in log duration
3. Where we're going
4. The lab: 5,099 claimants, randomly split 3,354 control vs 1,745 bonus
5. Randomization worked: covariate means line up almost exactly across groups
6. In an RCT, covariates can't fix bias — but they *can* sharpen precision
7. Linear adjustment already pulls the naive −0.0855 toward −0.0717
8. DML splits the outcome into a linear treatment term plus a flexible nuisance
9. Partial out both sides, then regress the residuals — that's the whole trick
10. Cross-fitting computes each residual out-of-sample to kill regularization bias
11. Six lines in `doubleml`: wrap the data, pick a learner, cross-fit, read θ
12. The bonus offer shortens log unemployment duration by 7.4%
13. Swap Random Forest for Lasso and the answer barely moves: −0.0712
14. All four roads lead to ~−0.07: the methods agree on sign and size
15. Both DML intervals exclude zero — but only just
16. Does flexible ML *make* this causal? No — the RCT does
17. On a clean experiment, Double ML sharpens the answer — it doesn't change it.

**Verdict:** coherent abstract. Slide 3 ("Where we're going") is the only label/agenda title — acceptable for a Teaching deck. The closing (17) is one declarative sentence matching the thesis.

---

## Positive highlights

- Slide 6's title "In an RCT, covariates can't fix bias — but they *can* sharpen precision" states the entire conceptual hinge of the talk in twelve words and keeps the precision-not-bias framing the post insists on.
- Slide 16 is a genuine Devil's-Advocate slide with an explicit Objection/Response pair, correctly locating identification in the RCT rather than the ML — exactly the steelman the design rubric asks for.
- The key-result strip (−0.0736 / −0.0712 / 5,099) uses the three brand colors and surfaces the two learner estimates side by side, previewing the robustness story before a single slide.
- Math escaping is correct Pandoc throughout (`\,`, `X_i'\gamma`, `\hat\theta_0`) — none of the post's Goldmark `\\,` / `\_` over-escaping leaked in; the browser pass found zero raw-LaTeX slides.

---

## Priority action items

1. **[MED]** Shorten the three over-length lines on slides 16, 6, and 2 (issues #1–#3); move the explanatory prose to `::: {.notes}`.
2. **[LOW]** Reconcile the Lasso p-value rounding on the slide-13 table (`0.045` → `0.044` or `0.0445`) for consistency with the RF row's `0.038` (issue #4).

---

## Screenshots (HIGH-severity visual issues only)

None emitted. The browser pass flagged 5 "overflow" slides (16–20) and rising word counts, but these are artifacts of the `slide-audit.cjs` `Reveal.next()` walk on a `center: true` deck: the counter accumulates content across the vertically-stacked Investigation sub-slides (counts climb monotonically 71→416 and every sub-slide reports the divider `<h1>` "The Investigation"). The real per-slide content is one display equation + one short gloss, or a 6–7-line code block — well within the 960×700 box. No real clipping was observed; `auto-stretch` + `fig-align: center` bound the four images.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_doubleml

To re-check just the dimension you fixed:

    /project:review-slides python_doubleml focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (headless Chromium via slide-audit.cjs)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: browser word/overflow counts are cumulative across `center` sub-slides — treated as a known walk artifact, not a per-slide measurement.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
