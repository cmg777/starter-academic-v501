# Review: stata_bma_dsl Slide Deck

**Audited:** content/post/stata_bma_dsl/slides/
**Source of truth:** content/post/stata_bma_dsl/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled (per-current-slide overflow + math-render verification at 1280×720)

---

## Verdict: ACCEPT (after MINOR fixes applied)

**Overall assessment.** A faithful, well-paced, on-brand deck. Source fidelity is the strongest dimension — every number, figure, equation, and table cell traces cleanly to `index.md` (BMA −7.139 vs true −7.100, DSL FE −7.433, pooled −21.26 / −22.03, 6/8 predictors, zero false positives, Wald χ² = 53.15). The one real defect was a title↔body contradiction on the kitchen-sink slide (title claimed the coefficient "barely moves" while its own figure and the preceding slide show it shifting). That, plus one defensive currency-escape in a notes block, are now fixed. No fabricated numbers, no Goldmark `\_`-in-math bug (the deck correctly uses plain `_` for Pandoc), no overflow, no branding drift.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers/figures/tables trace to index.md |
| 2  | Conceptual correctness        | 10         | 0       | estimand framing correct; Devil's-Advocate slide present |
| 3  | Technical & render correctness| 9          | 1 L     | smoke-test PASS; math renders (raw-latex 0); 1 currency escape (fixed) |
| 4  | Title↔body consistency        | 9          | 1 M     | one contradictory title (fixed); assertion-title test passes |
| 5  | Readability & simplicity      | 9          | 1 L     | one 18-word question hook (acceptable); prose lives in notes |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; consistent terminology |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; assertion titles; closing is one sentence |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide byte-identical to templates |
| 9  | Accessibility & legibility    | 10         | 0       | all 6 figures captioned; no real overflow at 1280×720 |
| 10 | Deliverable completeness      | 10         | 0       | qmd + index.html (57.9 KB) + slides_files/; link relative |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 4   | MED      | slides.qmd:135 — "…the answer barely moves…" | Title claims the GDP coefficient "barely moves," but its own figure (`fig2_instability`, caption "coefficients shift… signature of model uncertainty") and the prior slide ("the linear term swings from −7.498 to −7.131") show it moving. Self-contradiction. | Retitle so the assertion matches the figure (applied — see below). |
| 2  | 3   | LOW      | slides.qmd:140 (notes)            | `~$2,000` uses a bare `$` (latent MathJax pairing risk in the rendered notes DOM). | Escape as `~\$2,000` (applied). |
| 3  | 5   | LOW      | slide 2 — "With 12 candidate controls, there are 4,096 ways to test the EKC — which one do you trust?" | 18-word question title (over the ~15-word guide). | Acceptable as a deliberate question hook; left unchanged. |

Order: HIGH first, then MED, then LOW. No HIGH issues.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 2 "With 12 candidate controls, there are 4,096 ways to test the EKC — which one do you trust?"**

Before:
> With 12 candidate controls, there are 4,096 ways to test the EKC — which one do you trust?

After (optional, if a shorter hook is preferred):
> 12 controls, 4,096 possible models — which one do you trust?

Why: 18 → 10 words; keeps the question hook and the two headline numbers. Left unchanged in the deck — a question hook of this length is acceptable per the readability rules ("a single concluding/hook sentence"), so this is a LOW style note, not a required change.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide        | Source location               | Match |
|--------------------------------------|-----------------------|-------------------------------|-------|
| Title strip: BMA β1                   | −7.139                | index.md:622 / abstract       | ✓     |
| Title strip: true β1                  | −7.100                | index.md:471 / abstract       | ✓     |
| Title strip: predictors flagged       | 6 / 8                 | index.md:1050                 | ✓     |
| Title strip: bias when FE dropped     | 2–3×                  | index.md:63 / 749             | ✓     |
| Model-uncertainty table (sparse/KS/true) | −7.498 / −7.131 / −7.100, 0.849/0.806/0.810, −0.031/−0.030/−0.030 | index.md:467–469 | ✓ |
| 2^12 = 4,096 models                   | 4,096                 | index.md:69                   | ✓     |
| Fig1 scatter (80 countries, N=1,600)  | ../…fig1_scatter.png  | index.md:368                  | ✓     |
| Fig2 instability                      | ../…fig2_instability.png | index.md:490               | ✓     |
| DGP equation                          | cubic in ln G + X + α_i + δ_t + ε | index.md:271       | ✓     |
| True predictors + coefs               | +0.015, −0.010, +0.007, −0.005, +0.010 | index.md:279–283 | ✓     |
| BMA Bayes-rule + PIP equations        | matches index.md:527, 539 | index.md                  | ✓     |
| BMA code (6 lines)                    | bmaregress … pipcutoff(0.8) | index.md:588–591        | ✓     |
| BMA bignum −7.139 / cubic −0.030      | −7.139, −0.030        | index.md:622                  | ✓     |
| Fig3 PIP / Fig4 coefdensity           | ../…fig3/fig4.png     | index.md:664 / 699            | ✓     |
| DSL union + LASSO equation            | matches index.md:786, 798 | index.md                  | ✓     |
| DSL (FE) table                        | −7.433 / 0.840 / −0.031; Wald χ²=53.15 | index.md:851–853, 843 | ✓ |
| Pooled bignum −21.26 / −22.03         | −21.26, −22.03        | index.md:733 / 916            | ✓     |
| Pooled PIP contrast (12/15; services/credit/pop_density = 1.000; 5 FP) | index.md:751 | index.md | ✓ |
| Fig5 EKC curves / Fig6 answer key     | ../…fig5/fig6.png     | index.md:1022 / 1048          | ✓     |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. With 12 candidate controls, there are 4,096 ways to test the EKC — which one do you trust?
2. The GDP coefficient moves with the controls you choose
3. A synthetic panel with an answer key lets us grade every method
4. The lab: 80 countries × 20 years, 5 true controls hidden among 7 decoys
5. The model uncertainty we are fighting, written as one equation
6. Adding all 12 controls shifts the GDP coefficient — yet still won't say which controls belong
7. BMA averages over all 4,096 models and weights each by how well it fits
8. The PIP is a democratic vote: what share of good models keep a variable?
9. Six lines of Stata run BMA with fixed effects always in the model
10. BMA recovers the GDP coefficient almost exactly — −7.139 vs true −7.100
11. BMA flags 6 of 8 true predictors and zero noise — the answer key confirmed
12. The posterior densities sit far from zero — strong evidence for all six robust variables
13. DSL takes a different road: select controls twice, then run a clean OLS
14. With fixed effects, DSL gives fast, valid estimates — −7.433 in seconds
15. Strip the fixed effects and the GDP coefficient explodes to −21.26
16. Worse, pooled BMA hands robust status to 5 noise variables
17. Both curves trace the same inverted-N — BMA and DSL agree on the shape
18. Does machine selection make this causal? No — it disciplines, it does not identify
19. The verdict: 6 of 8 true predictors recovered, zero false positives — with fixed effects
20. Choose the tool by the question — averaging vs fast valid inference
21. Tame model uncertainty with BMA or DSL — but absorb the fixed effects first.

**Verdict:** coherent abstract. Reads as a complete talk arc (tension → investigation → resolution). Slide 6's title previously contradicted slide 2; now consistent.

---

## Positive highlights

- Slide 15's assertion title "Strip the fixed effects and the GDP coefficient explodes to −21.26" delivers the deck's sharpest lesson in eleven words, with the bignum strip backing it (−21.26, true −7.100, pooled DSL −22.03).
- Slide 18 is a genuine Devil's-Advocate slide ("Does machine selection make this causal? No — it disciplines, it does not identify") — it steelmans the causal objection and answers it, exactly the design contract for a working/seminar deck.
- Source fidelity is flawless: the BMA bignum (−7.139), DSL FE table (−7.433/0.840/−0.031, Wald χ²=53.15), and pooled-vs-FE PIP contrast (12/15 vs 6, 5 false positives) all reproduce `index.md` to the decimal.
- No Goldmark `\_`-in-math defect: every subscript uses plain `_` (β_1, M_k, S_Y) and MathJax typesets all 30 math spans (raw-latex slides: 0).

---

## Priority action items

1. **[MED]** Retitle the kitchen-sink slide so the assertion matches its figure — *applied*: "Adding all 12 controls shifts the GDP coefficient — yet still won't say which controls belong."
2. **[LOW]** Escape the `~$2,000` in the kitchen-sink notes as `~\$2,000` — *applied*.
3. **[LOW]** Optionally shorten the slide-2 question hook to ~10 words — *deferred* (acceptable as a deliberate hook; no content invented).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_bma_dsl

To re-check just the dimension fixed:

    /project:review-slides stata_bma_dsl focus: consistency and render

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (chromium via npx cache)
- smoke-test.js: PASS (15/15)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: The vendored `slide-audit.cjs` reports CUMULATIVE word/bullet/overflow counts across vertical sub-slides + hidden speaker notes (known artifact). A per-current-slide pass via `Reveal.getCurrentSlide()` at 1280×720 confirmed **zero real overflow** (every slide scrollHeight == clientHeight) and **zero unrendered LaTeX**. Only the cumulative tool's 8 "overflow" flags were artifacts.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only audit; fixes were then applied to slides.qmd and the deck re-rendered.*
