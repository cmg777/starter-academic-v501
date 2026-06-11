# Review: stata_spxtivdfreg Slide Deck

**Audited:** content/post/stata_spxtivdfreg/slides/
**Source of truth:** content/post/stata_spxtivdfreg/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** A faithful, on-brand, well-paced deck: every headline number traces to the source post, the assertion titles read as a coherent abstract, math typesets cleanly (no Goldmark `\_`-in-math bug — subscripts use plain `_`), and the closing slide is a single declarative sentence. The strongest dimension is source fidelity (every coefficient, z-statistic, J-test, and long-run multiplier matches `index.md`). The weakest is readability: the opening slide stacks two full prose sentences where one anchor line plus speaker notes would read better. One LOW rounding inconsistency (MG p-value `0.54` vs the post's `0.536`). No HIGH issues. The single fix that keeps it at ACCEPT is trimming the opening slide's second sentence into `::: {.notes}`.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                            |
|----|-------------------------------|-----------:|--------:|--------------------------------------------------|
| 1  | Source fidelity               | 9          | 1 L     | all numbers trace; one rounding inconsistency    |
| 2  | Conceptual correctness        | 10         | 0       | estimands/IV framing correct                     |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; 0 raw LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes                      |
| 5  | Readability & simplicity      | 7          | 1 M 1 L | 1 prose-stack slide; a few long glosses          |
| 6  | Typos & grammar               | 10         | 0       | clean; em-dashes correct                         |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc, devil's-advocate, declarative close   |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                            |
| 9  | Accessibility & legibility    | 10         | 0       | 0 real overflow @1280×720 (audit flag = artifact)|
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html` ok; files present       |

---

## Issues found

| #  | Dim | Severity | Location                                            | Issue                                                              | Suggested fix                                          |
|---:|----:|----------|-----------------------------------------------------|-------------------------------------------------------------------|--------------------------------------------------------|
| 1  | 5   | MED      | slide "When the crisis hit…" (slides.qmd:52,56)     | Two full prose sentences stacked on slide; 2nd ~30 words, 1 sub-clause | Keep the short anchor; move the explanatory 2nd sentence to `::: {.notes}` (see rewrite) |
| 2  | 1   | LOW      | slide "The strongest objection…" (slides.qmd:267)   | Slide shows MG `p = 0.54`; post reports `p = 0.536` (index.md:681) | Use `p = 0.536` to match the post exactly              |
| 3  | 5   | LOW      | slides.qmd:66, :93 (`.comment` glosses)             | A few equation/setup glosses run ~28–30 words                     | Acceptable as glosses; optionally tighten (kept as-is) |

Order: HIGH first, then MED, then LOW. None are HIGH.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "When the crisis hit, credit risk spread two ways — and standard tools saw only one"**

Before (on slide, after the `. . .`):
> Two channels did it: **spatial spillovers** between interconnected banks, and **common factors** — macro shocks that hit every bank together. *Stata's `xsmle` and `spxtregress` cannot model the second one.*

After (on slide):
> Two channels did it: **spatial spillovers** between banks, and **common factors** — macro shocks that hit every bank at once.
>
> *Stata's `xsmle` and `spxtregress` model only the first.*

(and add to `::: {.notes}`): "Spatial spillovers travel along lending relationships; common factors are aggregate shocks — interest-rate moves, the housing collapse — that hit every bank together. The standard Stata spatial-panel toolkit does spatial lags but cannot accommodate unobserved common factors. That gap is the whole deck."

Why: splits one 30-word, sub-claused sentence into two short anchor lines; the gloss detail moves to the spoken track.

**Issue #3 — long `.comment` glosses (slides.qmd:66, :93)**

Before (slides.qmd:66):
> Spatial lag $\psi W\,NPL$, temporal lag $\rho\,NPL_{i,t-1}$, endogenous covariates $x_{it}\beta$, bank effect $\alpha_i$, and the latent factors $\lambda_i' f_t$ — every term but $\alpha_i$ is a source of endogeneity.

After (optional, no change made):
> Five terms; every one but the bank effect $\alpha_i$ is a source of endogeneity.

Why: a single-clause label reads faster than a five-item inline enumeration. Left as-is because the enumeration mirrors the equation directly above it and aids the figure-first method slide — a deliberate, acceptable density, not a defect.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                              | Value on slide      | Source location            | Match |
|------------------------------------------|---------------------|----------------------------|-------|
| Banks / quarters / effective N           | 350 / 36 / 12,250   | index.md:328, 430          | ✓     |
| Network W size / nonzeros / neighbours   | 350×350 / 6,300 / ~18 | index.md:410–414         | ✓     |
| Spatial lag ψ (z)                        | 0.394 (4.65)        | index.md:455, 466          | ✓     |
| Temporal lag ρ (z)                       | 0.290 (5.33)        | index.md:443, 468          | ✓     |
| LIQUIDITY coef (z)                       | 2.452 (9.09)        | index.md:451, 470          | ✓     |
| INEFF coef (z)                           | 0.447 (4.28)        | index.md:445               | ✓     |
| BUFFER coef (z)                          | −0.055 (−4.59)      | index.md:448               | ✓     |
| Factors r_x, r_u                         | 2, 1                | index.md:434–435           | ✓     |
| Variance from factors / σ_f / σ_e        | 33.5% / 0.642 / 0.904 | index.md:457–459, 472    | ✓     |
| Hansen J χ²(19), p                       | 18.83, 0.468        | index.md:461, 474          | ✓     |
| No-factor: ρ / ψ / LIQUIDITY / J p       | 0.594 / 0.288 / 0.843 / 0.000 | index.md:492–502   | ✓     |
| SIZE with/without factors                | 0.223 (z=2.36) / 0.089 n.s. | index.md:496, 512    | ✓     |
| No-spatial: ρ / INEFF / SIZE / J p       | 0.323 / 0.638 / 0.346 / 0.226 | index.md:535–544   | ✓     |
| Long-run total LIQUIDITY                 | 7.765               | index.md:622, 765          | ✓     |
| LR direct / indirect (LIQUIDITY)         | 3.547 / 4.218       | index.md:622               | ✓     |
| Temporal mult 1/(1−ρ) / spatial 1/(1−ψ)  | 1.41 / 1.65         | index.md:565, 567          | ✓     |
| MG ψ / ρ / LIQUIDITY                     | 0.032 / 0.301 / 6.330 | index.md:670–678         | ✓     |
| MG ψ p-value                             | 0.54 (slide)        | index.md:681 reports 0.536 | ✗ (LOW, rounding) |

The one ✗ is Issue #2 (LOW rounding inconsistency).

---

## Title sequence (assertion-title test)

1. When the crisis hit, credit risk spread two ways — and standard tools saw only one
2. One equation must absorb four kinds of endogeneity at once
3. Where we're going
4. The lab: 350 US banks across the entire crisis, 12,250 observations
5. Defactored IV is a two-step trick: subtract the rainstorm, then read each pond
6. INEFF is endogenous, so INTEREST does the instrumenting
7. The estimator finds the factors itself: 2 in the regressors, 1 in the errors
8. With factors in, the spatial lag is real: a 0.39 contemporaneous spillover
9. LIQUIDITY dominates the covariates, and the J-test blesses the instruments
10. One-third of the residual variance is pure macro shock
11. Drop the factors and temporal persistence doubles while the J-test rejects
12. The no-factor model also masks a real effect: SIZE goes insignificant
13. The spatial lag earns its place: dropping it inflates the covariates
14. A permanent liquidity shock costs three times what the coefficient shows
15. Long-run impact = short-run effect, amplified twice
16. The strongest objection — and the answer
17. Four specifications, one verdict: factors stay, spatial lag stays
18. Model the common factors, or the spatial story you tell will be the wrong one.

**Verdict:** coherent abstract. The titles alone tell the full arc — tension (crisis, four endogeneities), investigation (lab, defactored IV, the full-model numbers), resolution (three stress tests, long-run amplification, the objection, the verdict, the takeaway).

---

## Positive highlights

- The closing title "Model the common factors, or the spatial story you tell will be the wrong one." is one declarative sentence that states the thesis — textbook write-slides close, not "Questions?".
- Slide 5's title "Defactored IV is a two-step trick: subtract the rainstorm, then read each pond" carries the post's rainstorm analogy into a six-word method preview.
- The devil's-advocate slide ("The strongest objection — and the answer") steelmans the MG result (ψ→0.032) before rebutting it with the √N-vs-√NT efficiency argument and the rock-stable ρ — exactly the seminar-audience move the skill prescribes.
- Math is bug-free: every subscript uses plain `_` inside `$…$` (no Goldmark `\_` corruption), and the browser pass found 0 raw-LaTeX slides.

---

## Priority action items

1. **[MED]** Trim the opening slide ("When the crisis hit…"): keep the short anchor, move the second explanatory sentence to `::: {.notes}` (Issue #1 rewrite).
2. **[LOW]** Change the MG p-value on the objection slide from `p = 0.54` to `p = 0.536` to match index.md:681 (Issue #2).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_spxtivdfreg

To re-check just the dimension you fixed:

    /project:review-slides stata_spxtivdfreg focus: readability and fidelity

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel; per-slide overflow re-verified at 1280×720)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to canonical templates)
- Tooling notes: `slide-audit.cjs` reported 11 "OVERFLOW" slides, but a per-current-slide re-check (`Reveal.getCurrentSlide()` at 1280×720) found 0 real overflow — the flag is the documented cumulative-walk artifact on `.incremental` slides. Treated as not load-bearing.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
