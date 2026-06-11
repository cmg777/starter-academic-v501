# Review: python_pca2 Slide Deck

**Audited:** content/post/python_pca2/slides/
**Source of truth:** content/post/python_pca2/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is a clean, faithful, on-brand deck. The strongest
dimension is source fidelity — every number on every slide traces exactly to
`index.md` (72.42% variance, +0.1439 shift, 16/153 disagreement, the full weight
and R² ledger). The weakest is readability, and only marginally: two `.comment`
annotations stack two sentences where one anchor line plus speaker notes would
read cleaner. No HIGH issues, no wrong numbers, no raw LaTeX, branding
byte-identical, deck link correct. The one change that keeps it pristine is
trimming the two double-sentence comment lines into notes.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 30+ numbers + 11 figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | pooled vs per-period framing correct; weights/estimand right |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); MathJax renders; 0 raw-LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes; titles form the abstract |
| 5  | Readability & simplicity      | 8          | 2L      | 2 comment lines stack 2 sentences; otherwise short |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; no `--`; consistent terms |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate slide; 1-sentence close |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean (byte-identical) |
| 9  | Accessibility & legibility     | 10         | 0       | every figure captioned; no real content clipping |
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html`; index.html 53 KB; slides_files/ present |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | LOW      | slide — "The lab: 153 regions…" (qmd:91) | `.comment` stacks two full sentences on-slide | Keep one anchor line; move the `period`-metadata sentence to notes |
| 2  | 5   | LOW      | slide — "Pooled standardization…" (qmd:129) | `.comment` is a 2-clause sentence about the baseline change | Shorten to one clause; the analogy already lives in notes |

Order: HIGH first, then MED, then LOW. No HIGH or MED issues.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "The lab: 153 regions × 2 periods = a 306-row panel of three sub-indices"**

Before:
> All three indicators are positive-direction (higher = better), so no polarity flip is needed. The `period` column is metadata — it never enters the PCA.

After:
> All three indicators run higher = better — no polarity flip needed.

Why: two sentences → one anchor line; the `period`-is-metadata point is a speaker aside, not a slide line. Move it to `::: {.notes}`.

**Issue #2 — slide "Pooled standardization measures every region against one fixed ruler"**

Before:
> Per-period uses a different baseline each year; pooled uses one. The increase from 0.926 to 0.946 maps to a *genuine* z-score increase.

After:
> Per-period shifts the baseline each year; pooled fixes it — so 0.926 → 0.946 is a *real* z-score rise.

Why: two sentences → one; the children's-height analogy already carries the explanation in notes.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                 | Value on slide | Source location               | Match |
|-----------------------------|----------------|-------------------------------|-------|
| Variance captured by PC1     | 72.4%          | index.md:744 (72.42%)         | ✓     |
| Net development shift         | +0.144         | index.md:776 (+0.1439)        | ✓     |
| Direction-of-change disagreement | 16 / 153   | index.md:874                  | ✓     |
| Edu–Income correlation        | 0.68           | index.md:482                  | ✓     |
| Health–Income correlation     | 0.63           | index.md:484                  | ✓     |
| Edu–Health correlation        | 0.44           | index.md:483                  | ✓     |
| Period change edu/health/income | +0.0225 / +0.0134 / −0.0202 | index.md:433-435 | ✓ |
| Venezuela income collapse     | 0.782 → 0.630  | index.md:468                  | ✓     |
| Per-period weights 2013       | 0.583,0.510,0.632 | index.md:572               | ✓     |
| Per-period weights 2019       | 0.541,0.566,0.623 | index.md:573               | ✓     |
| Weight shift edu/health       | −0.043 / +0.056 | index.md:574 (−0.0427/+0.0556) | ✓   |
| Regions appearing to decline  | 43             | index.md:577                  | ✓     |
| Pooled eigenvalues            | 2.173,0.563,0.264 | index.md:739 (2.1726…)     | ✓     |
| Pooled PC1 weights            | 0.564,0.545,0.620 | index.md:741 (0.5642…)     | ✓     |
| sklearn weights / var / match | 0.5642,0.5448,0.6204 / 0.7242 / 2e-15 | index.md:1168-1174 | ✓ |
| Variance PC1/PC2/PC3          | 72.4/18.8/8.8  | index.md:744-746              | ✓     |
| Pooled PC1 mean 2013→2019     | −0.072 → +0.072 | index.md:774-775             | ✓     |
| Buenos Aires pooled HDI       | 0.946 → 0.965 (+0.019) | index.md:822          | ✓     |
| Buenos Aires per-period       | −0.040         | index.md:822                  | ✓     |
| Spearman ρ (improvement)      | 0.982 / 0.9818 | index.md:875                  | ✓     |
| Levels R²: pooled vs per-period | 0.9823 / 0.9750 | index.md:983-987           | ✓     |
| Changes R²: pooled vs per-period | 0.9964 / 0.9913 | index.md:1072-1076        | ✓     |
| r with official SHDI          | 0.991          | index.md:982                  | ✓     |
| Choropleth class transitions  | 40 up / 88 stayed / 25 down | index.md:1230-1232 | ✓ |
| Gini education 2013→2019      | 0.0655 → 0.0639 | index.md:1332-1333           | ✓     |
| Gini health / income change   | +0.0023 / +0.0036 | index.md:1334              | ✓     |
| Gini HDI 2013→2019            | 0.1712 → 0.1795 | index.md:1332-1333           | ✓     |
| PC1 discards 28% / PC2 ~19%   | 28% / 19%      | index.md:1521 (28% / PC2 18.77%) | ✓ |
| R² = 0.98 vs SHDI (rebuttal)  | 0.98           | index.md:983                  | ✓     |
| Figures: all 11 `../pca2_*.png` | —            | exist on disk (smoke-test 11/11) | ✓  |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. If the ruler changes between measurements, you cannot tell whether the object grew or the ruler shrank
2. Education and health rose, but income *fell* — a mixed signal a naive method erases
3. Where we're going
4. The lab: 153 regions × 2 periods = a 306-row panel of three sub-indices
5. Real development data is messier than simulation: PC1 will capture less
6. Per-period PCA re-fits the weights every period — the index formula itself drifts
7. Re-centring each period to zero erases the net signal — 43 regions appear to decline
8. Pooled standardization measures every region against one fixed ruler
9. One eigen-decomposition on the stacked data yields a single, fixed set of weights
10. scikit-learn confirms it: `fit_transform` on stacked data *is* pooled PCA
11. PC1 captures 72.4% of variance — strong, but real data is not one-dimensional
12. The fixed yardstick reveals a net development shift of +0.144 that per-period PCA zeroes out
13. With a fixed scale, the 2019 HDI bars consistently extend past 2013
14. The two methods disagree on the *direction* of change for 16 of 153 regions
15. High rank agreement, but consequential re-orderings: Spearman ρ = 0.982
16. Validated against the official SHDI, pooled PCA wins on both levels and dynamics
17. Pooled PCA reproduces the official benchmark across periods with almost no scatter
18. Tracking dynamics is the real test — pooled change fits the SHDI change almost exactly
19. A fixed classification makes the map honest: 40 regions climbed, 25 fell
20. Education converged, but income and health diverged — overall inequality rose
21. Does PCA make the index "true"? No — it makes it *comparable*
22. Fit the standardization and the weights on the stacked data, and the yardstick stops moving.

**Verdict:** coherent abstract. Read alone, the titles narrate the whole argument — problem (1–2), setup (3–5), the per-period failure (6–7), the pooled fix (8–13), the contrast and validation (14–20), the steelman (21), and the one-sentence takeaway (22).

---

## Positive highlights

- Slide 1's assertion title "If the ruler changes between measurements, you cannot tell whether the object grew or the ruler shrank" frames the entire identification problem in one vivid analogy before a single number appears.
- The fidelity is exemplary: the per-period weight vectors, pooled eigenvalues, both R² pairs, and the Gini table all carry the post's exact values — including the sklearn 2e-15 reproducibility check left correctly in speaker notes.
- Slide 21 "Does PCA make the index 'true'? No — it makes it *comparable*" is a genuine Devil's-Advocate slide that steelmans the 28%-variance-lost objection, exactly as the design contract asks for a teaching/seminar deck.
- The closing divider (slide 22) is a single declarative sentence — "Fit the standardization and the weights on the stacked data, and the yardstick stops moving." — not "Questions?"/"Thank you".

---

## Priority action items

1. **[LOW]** Trim the two `.comment` lines (qmd:91, qmd:129) to one anchor sentence each; push the second sentence to `::: {.notes}` (see rewrites above).

Only LOW items remain; the deck ships as-is if these are not applied.

---

## Screenshots (HIGH-severity visual issues only)

None — the 7 "OVERFLOW" flags from `slide-audit.cjs` are all figure-first slides whose single full-height image fills the 720 px box (scrollHeight == clientHeight == 720, word counts 21–37). Re-verified per current slide at 1280×720: no text is clipped on any slide.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_pca2

To re-check just the dimension you fixed:

    /project:review-slides python_pca2 focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs cumulative density/overflow counts are a known artifact across vertical sub-slides + hidden notes; overflow re-verified per current slide and found to be figure-fill, not clipping.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
