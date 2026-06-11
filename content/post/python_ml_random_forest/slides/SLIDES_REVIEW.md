# Review: python_ml_random_forest Slide Deck

**Audited:** content/post/python_ml_random_forest/slides/
**Source of truth:** content/post/python_ml_random_forest/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** A clean, faithful, on-brand deck. Source fidelity is the
strongest dimension — every number on every slide traces exactly to `index.md`
(test R² 0.2297, baseline 0.2307, CV 0.2526 → 0.2721, RMSE 6.52, MAE 4.68/4.72,
271/68 split, A59/A42/A26). The weakest is readability: two on-slide comment
lines run slightly long and read as written prose rather than spoken anchors.
Both are LOW, neither blocks ACCEPT. Smoke test passes 15/15, branding files are
byte-identical to the templates, and no slide overflows the box at 1280×720.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 18 numbers trace to index.md       |
| 2  | Conceptual correctness        | 10         | 0       | estimand framing, bagging, leakage all correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders; raw-LaTeX 0 |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test: coherent abstract |
| 5  | Readability & simplicity      | 8          | 2 LOW   | 2 long-ish comment lines               |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; consistent terms    |
| 7  | write-slides design adherence | 9          | 1 LOW   | strong arc; Devil's-Advocate present; closing one sentence |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                   |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none (per-slide 1280×720)     |
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html` ok; files ok  |

---

## Issues found

| #  | Dim | Severity | Location                                       | Issue                                                            | Suggested fix                       |
|---:|----:|----------|------------------------------------------------|------------------------------------------------------------------|-------------------------------------|
| 1  | 5   | LOW      | slides.qmd:248 — slide "Did the forest overfit?" | ~30-word rebuttal line with semicolon + "and" reads as written prose | See rewrite below                   |
| 2  | 5   | LOW      | slides.qmd:126 — slide "Honesty first…"         | 19-word comment line, slightly over the ~15-word spoken-anchor target | See rewrite below                   |
| 3  | 7   | LOW      | slide 3 — "Where we're going"                   | Roadmap/agenda list early in Act I; acceptable for Teaching but note it lands after the hook + spoiler, so it does not violate the "no agenda opener" rule | Keep — placement is correct (after hook) |

Order: HIGH first, then MED, then LOW. No HIGH or MED issues.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "Did the forest overfit? No — and the gap to the data ceiling is the proof" (slides.qmd:248)**

Before:
> If it were overfitting, CV and test R-squared would diverge wildly; instead both sit near **0.23–0.27**, and bagging plus the $\sqrt{64}$ feature subset cap variance by design. The model is *under*-powered by the features, not over-fit to the rows.

After:
> Overfitting would split CV and test R-squared apart. Instead both sit near **0.23–0.27**. The model is *under*-powered by the features, not over-fit to the rows.

Why: 30-word lead sentence with two clauses → two short clauses; "cap variance by design" detail moves to the speaker notes (already covered there).

**Issue #2 — slide "Honesty first: split 339 into 271 train / 68 test before fitting anything" (slides.qmd:126)**

Before:
> Letting the model glimpse the test set during tuning is *data leakage* — it inflates the score and lies about generalization.

After:
> Let the model peek at the test set during tuning and you get *data leakage* — an inflated score that lies about generalization.

Why: 19 words but two stacked claims ("inflates" + "lies") → one active clause; trims to a tighter spoken anchor. (Optional — the line is already clear.)

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                         | Value on slide        | Source location            | Match |
|-------------------------------------|-----------------------|----------------------------|-------|
| Municipalities                      | 339                   | index.md:312               | ✓     |
| Embedding dimensions                | 64                    | index.md:62                | ✓     |
| Train / test split                  | 271 / 68              | index.md:373–374           | ✓     |
| ~1.5% of data per prediction        | ~1.5%                 | index.md:377               | ✓     |
| IMDS mean / median                  | 51.1 / 50.5           | index.md:337               | ✓     |
| IMDS std                            | 6.77                  | index.md:312               | ✓     |
| Most towns score                    | 47–55                 | index.md:337               | ✓     |
| Best correlations                   | 0.25–0.40             | index.md:358               | ✓     |
| sqrt(64)                            | 8                     | index.md:477               | ✓     |
| 5-fold CV scores                    | [0.152 0.187 0.270 0.308 0.345] | index.md:400 (rounded 3 dp) | ✓ |
| Mean CV R² (±)                      | 0.2526 (± 0.0728)     | index.md:401               | ✓     |
| Tuned best CV R²                    | 0.2721                | index.md:467               | ✓     |
| Best params                         | 500 trees, max_depth=30 | index.md:474             | ✓     |
| Tuned test R² / RMSE / MAE          | 0.2297 / 6.52 / 4.72  | index.md:506–508           | ✓     |
| Baseline test R² / RMSE / MAE       | 0.2307 / 6.52 / 4.68  | index.md:423–425           | ✓     |
| Summary table                       | 0.2307/0.2297, 6.52/6.52, 4.68/4.72 | index.md:629–631 | ✓     |
| Top features                        | A59, A42, A26         | index.md:636               | ✓     |
| MDI top                             | A30, A59              | index.md:579               | ✓     |
| Unexplained variance                | 77%                   | index.md:638               | ✓     |
| Key-result strip                    | 0.23 / 4.7 / 64       | index.md:58, 511, 62       | ✓     |
| Figure: actual vs predicted         | ../ml_actual_vs_predicted.png | index.md:533         | ✓     |
| Figure: target distribution         | ../ml_target_distribution.png | index.md:335         | ✓     |
| Figure: embedding correlations      | ../ml_embedding_correlations.png | index.md:356      | ✓     |
| Figure: permutation importance      | ../ml_feature_importance_permutation.png | index.md:600 | ✓  |
| Figure: partial dependence          | ../ml_partial_dependence.png | index.md:621          | ✓     |
| Figure: residuals                   | ../ml_residuals.png   | index.md:553               | ✓     |

No ✗ rows. Every slide datum matches the source post.

---

## Title sequence (assertion-title test)

1. Can a 64-number summary of a satellite photo tell you how a town is doing?
2. Predictions cluster near the mean — the model knows the middle, not the edges
3. Where we're going
4. The target is tightly bunched: most towns score between 47 and 55
5. No single embedding is a smoking gun — the best correlations are only 0.25–0.40
6. A Random Forest averages many decorrelated trees to cut variance
7. Honesty first: split 339 into 271 train / 68 test before fitting anything
8. Five rotating exams give a steadier read than one lucky split
9. Tuning buys 2 points of cross-validated R-squared: 0.2526 to 0.2721
10. A59, A42 and A26 carry the signal — but importance is spread thin
11. MDI and permutation disagree — trust the one measured on held-out data
12. The relationships are non-linear thresholds — which is why a tree beats a line
13. On unseen towns the tuned forest explains about 23% of the variation
14. The model is typically off by 4.7 IMDS points — and worst at the extremes
15. Tuning was a wash — proof the ceiling is the features, not the knobs
16. Did the forest overfit? No — and the gap to the data ceiling is the proof
17. The 77% it misses lives off-camera: pair the pixels with survey data
18. Satellite pixels know the middle of the distribution — for the edges, you still need the survey.

**Verdict:** coherent abstract — the titles read as a complete talk (only "Where we're going" is a label, and it is a deliberate Act-I roadmap after the hook).

---

## Positive highlights

- Slide 9's title "Tuning buys 2 points of cross-validated R-squared: 0.2526 to 0.2721" is a model assertion title: it states the gain *and* the numbers in one line, then slide 15 ("Tuning was a wash") delivers the twist on the held-out set.
- Source fidelity is flawless: the 5-fold CV vector, both R² values, RMSE, MAE, and the A59/A42/A26 ranking all match `index.md` exactly, including the subtle baseline-beats-tuned reversal (0.2307 vs 0.2297).
- The Devil's-Advocate slide (slides.qmd:242–252) steelmans the overfitting worry and answers it empirically with the CV-vs-test gap — exactly the seminar/teaching pattern `design-adherence.md` asks for.
- The closing divider (slides.qmd:266) is one declarative thesis sentence, not "Questions?"/"Thank you".
- Prose discipline is excellent: nearly all explanation sits in `::: {.notes}`, leaving the slides as clean visual anchors (one figure or one number each).

---

## Priority action items

1. **[LOW]** Trim the slides.qmd:248 rebuttal to two short clauses (see Issue #1 rewrite); move the "cap variance by design" clause to notes.
2. **[LOW]** Optionally tighten the slides.qmd:126 data-leakage comment to a single active clause (see Issue #2 rewrite).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_ml_random_forest

To re-check just the dimension you fixed:

    /project:review-slides python_ml_random_forest focus: readability

---

## Audit metadata

- Node version: system node
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical)
- Tooling notes: slide-audit.cjs OVERFLOW/word/bullet counts are cumulative across vertical sub-slides + hidden notes; re-verified per current slide via `Reveal.getCurrentSlide()` scrollHeight at 1280×720 — no slide exceeds the 720px box (max = 720, image slides fit exactly). raw-latex slides: 0.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
