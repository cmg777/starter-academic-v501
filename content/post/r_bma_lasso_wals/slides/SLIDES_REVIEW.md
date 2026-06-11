# Review: r_bma_lasso_wals Slide Deck

**Audited:** content/post/r_bma_lasso_wals/slides/
**Source of truth:** content/post/r_bma_lasso_wals/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is a strong, faithful, on-brand deck. Source fidelity is the standout dimension — every number on every slide (PIPs, |t|-statistics, the Post-LASSO table, the sensitivity/specificity matrix, R² = 0.98, the 4,096-model count) traces exactly to `index.md`, with signs and rounding preserved. The smoke test passes 15/15, both branding files are byte-identical to the canonical templates, math renders cleanly (zero raw LaTeX), and no slide overflows its box at 1280×720. The weakest dimension is readability, and only marginally: a few speaker-note paragraphs run long and one assertion title carries inline math. None of these block ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers/figures/tables trace to source |
| 2  | Conceptual correctness        | 10         | 0       | estimands & "selection not identification" correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders y; no `\_`/`\$` |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 8          | 2L      | 0 over-length on-slide; 0 dense; minor note-length |
| 6  | Typos & grammar               | 9          | 1L      | consistent terms; one minor casing nit |
| 7  | write-slides design adherence | 9          | 1L      | arc ok; Devil's-Advocate present; closing ok |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none; every figure captioned  |
| 10 | Deliverable completeness      | 10         | 0       | link ok (relative); files ok; 12/12 figs resolve |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | LOW      | slide 21 — "At $\lambda_{1\text{se}}$, LASSO keeps six variables — all of them real" | Assertion title carries inline math ($\lambda_{1\text{se}}$); reads fine on screen but is slightly harder to grasp at a glance than a plain-word title | Optional: "At the parsimonious penalty, LASSO keeps six variables — all real" (math stays in body/notes) |
| 2  | 5   | LOW      | slide 23 notes (slides.qmd:216)   | Speaker note is a single ~70-word sentence chain ("Remarkable connection… near-instant.") | Optional: split into two shorter spoken sentences for delivery comfort (notes only; not on-slide) |
| 3  | 6   | LOW      | slide 24 — "WALS makes GDP tower: $|t|=34.62$ dwarfs everything else" | Mixed register: "dwarfs everything else" is colloquial against the formal inline math; purely stylistic | Optional: "WALS makes GDP tower: $|t|=34.62$, far above every other variable" |

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 21 "At $\lambda_{1\text{se}}$, LASSO keeps six variables — all of them real"**

Before:
> At $\lambda_{1\text{se}}$, LASSO keeps six variables — all of them real

After:
> At the parsimonious penalty, LASSO keeps six variables — all real

Why: moves the `\lambda` symbol out of the assertion title so a listener parses the claim instantly; the symbol still appears in the figure caption and notes. (LOW — current title renders correctly and is defensible; this is polish, not a fix the deck needs.)

**Issue #2 — slide 23 notes (slides.qmd:216)**

Before:
> Remarkable connection: LASSO's MAP estimate under a Laplace prior gives $\lambda=\sigma^2/\tau$. Same prior belief — most coefficients near zero — used two ways: LASSO for hard selection (zeros), WALS for soft averaging (continuous weights). WALS also orthogonalizes the auxiliaries so the 4,096-model problem decomposes into 12 independent ones — no MCMC, near-instant.

After:
> Remarkable connection: LASSO's MAP estimate under a Laplace prior gives $\lambda=\sigma^2/\tau$. Same prior, used two ways — LASSO zeros coefficients, WALS averages them. And WALS orthogonalizes the auxiliaries, so the 4,096-model problem becomes 12 independent ones — no MCMC, near-instant.

Why: speaker-note only; breaks one long chain into shorter spoken units. (LOW.)

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide | Source location                  | Match |
|--------------------------------------|----------------|----------------------------------|-------|
| $2^{12}$ candidate models            | 4,096          | index.md:64, 571                 | ✓     |
| Models assumed wrong (run one)       | 4,095          | index.md:64                      | ✓     |
| Kitchen-sink OLS $R^2$               | 0.98           | index.md:494 (0.9801)            | ✓     |
| OLS log_trade t-stat (note)          | −0.86          | index.md:497                     | ✓     |
| OLS corruption t-stat (note)         | 0.05           | index.md:497                     | ✓     |
| GDP PIP                              | 1.00 / 1.000   | index.md:850, 953                | ✓     |
| trade_network PIP                    | 0.986          | index.md:850, 954                | ✓     |
| fossil_fuel PIP                      | 0.948          | index.md:850, 955                | ✓     |
| industry PIP                         | 0.841          | index.md:850, 956                | ✓     |
| urban_pop PIP                        | 0.648          | index.md:850, 957                | ✓     |
| democracy PIP                        | 0.607          | index.md:850, 958                | ✓     |
| agriculture PIP / β                  | 0.087 / 0.005  | index.md:850, 961                | ✓     |
| toy PIP log_gdp / fossil_fuel / log_trade | 1.000/0.965/0.099 (note) | index.md:773–775   | ✓     |
| Post-LASSO log_gdp (key cell)        | 1.165          | index.md:1153 (1.1646)           | ✓     |
| LASSO log_gdp                        | 1.190          | index.md:1153 (1.1899)           | ✓     |
| Post-LASSO fossil_fuel / LASSO       | 0.012 / 0.007  | index.md:1154 (0.0118 / 0.0072)  | ✓     |
| Post-LASSO urban_pop / LASSO         | 0.008 / 0.004  | index.md:1156 (0.0078 / 0.0041)  | ✓     |
| Post-LASSO trade_network / LASSO     | 0.898 / 0.631  | index.md:1158 (0.8978 / 0.6309)  | ✓     |
| WALS GDP \|t\|                       | 34.62          | index.md:1298, 1339              | ✓     |
| WALS trade_network \|t\|             | 4.39           | index.md:1299, 1339              | ✓     |
| WALS industry \|t\|                  | 4.01           | index.md:1300                    | ✓     |
| WALS fossil_fuel \|t\|               | 3.26           | index.md:1301                    | ✓     |
| WALS urban_pop \|t\|                 | 3.11           | index.md:1302                    | ✓     |
| WALS democracy \|t\|                 | 2.58           | index.md:1303                    | ✓     |
| WALS agriculture \|t\| (note)        | 1.13           | index.md:1305, 1339              | ✓     |
| Sensitivity BMA / LASSO / WALS       | 57.1% / 85.7% / 85.7% | index.md:1441–1443          | ✓     |
| Specificity (all)                    | 100%           | index.md:1441–1443              | ✓     |
| Accuracy BMA / LASSO / WALS          | 75.0% / 91.7% / 91.7% | index.md:1441–1443          | ✓     |
| Triple-robust count                  | 4              | index.md:1390                    | ✓     |
| Title strip: 4 / 85.7% / 4,096       | 4 / 85.7% / 4,096 | index.md:58 (abstract)        | ✓     |
| Figures: 12 `../bma_lasso_wals_*.png`| —              | all referenced in index.md       | ✓ 12/12 |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. With 12 candidate drivers, $2^{12}=4{,}096$ models give 4,096 different answers
2. We built an answer key: 7 true predictors, 5 pure-noise impostors
3. Naive OLS already flirts with spurious significance
4. Where we're going
5. Three mechanically distinct answers to one question
6. BMA is just Bayes' rule applied to 4,096 models
7. A variable's PIP is a weighted democratic vote across models
8. BMA flags four robust drivers and zero false positives
9. The top models agree: the same four variables, every time
10. LASSO trades a little bias for a large cut in variance
11. The L1 diamond has corners — that is why LASSO selects
12. Noise dies first; GDP is the last variable standing
13. At $\lambda_{1\text{se}}$, LASSO keeps six variables — all of them real
14. Post-LASSO un-shrinks the coefficients back toward the truth
15. WALS averages with the *same* prior LASSO uses for selection
16. WALS makes GDP tower: $|t|=34.62$ dwarfs everything else
17. Four variables are triple-robust — the strongest claims the data supports
18. Three columns of agreement — and two honest splits
19. BMA and WALS line up — but BMA's bar is set higher
20. All three recover GDP almost exactly; small effects are harder
21. Same data, perfect specificity — but LASSO/WALS see more
22. Does triangulation make this causal? No — it disciplines selection, not identification
23. When three different methods agree, believe the variable — not any single model.

**Verdict:** coherent abstract. Read in sequence the titles tell the whole story — problem (model uncertainty), three tools, each tool's verdict, the convergence, the honest splits, the causal caveat, and the one-sentence takeaway. "Where we're going" (slide 4) is a roadmap label rather than an assertion, but it is a legitimate Act-I transition and the only non-assertion title.

---

## Positive highlights

- Slide 8's title "BMA flags four robust drivers and zero false positives" states the entire BMA result in seven words and is exactly proven by the PIP bar chart beside it.
- Slide 22 is a genuine Devil's-Advocate slide ("Does triangulation make this causal? No…") with a clean Objection/Response structure — it steelmans the critique and concedes the right limit (selection robustness, not identification), matching the post's §17.7 caveat.
- The closing slide is a single declarative sentence — "When three different methods agree, believe the variable — not any single model." — not "Questions?" or "Thank you", exactly per the design contract.
- Every Unicode math glyph (β, λ, ≥) lives only inside `::: {.notes}`; on-slide math is LaTeX `$…$`. This is the correct split (speaker view shows Unicode; slides render LaTeX) and is handled flawlessly throughout.
- The Post-LASSO table (slide 14) highlights the GDP cell with `.key` and pairs raw-vs-Post-LASSO-vs-true columns — a four-row, high-signal table that respects the readability caps.

---

## Priority action items

1. **[LOW]** Optionally de-math the slide 21 assertion title (move $\lambda_{1\text{se}}$ to the body/caption) for a faster glance-read.
2. **[LOW]** Optionally split the long slide-23 speaker note into two shorter spoken sentences.
3. **[LOW]** Optionally soften "dwarfs everything else" on slide 16 to match the formal register.

No HIGH or MED items. The deck is ship-ready as-is; all three actions are polish.

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow or unrendered math detected.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_bma_lasso_wals

To re-check just the dimension you fixed:

    /project:review-slides r_bma_lasso_wals focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs reported 11 "overflow" + 26 "dense" slides, but these are the documented cumulative-walk artifact (counts accumulate horizontal sub-slides + hidden speaker notes). A per-current-slide pass at 1280×720 (via Reveal.getCurrentSlide) found 0 genuine overflow and a max of 64 on-slide words. raw-latex slides: 0 (load-bearing signal) — math renders correctly.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
