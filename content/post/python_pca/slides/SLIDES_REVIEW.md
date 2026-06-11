# Review: python_pca Slide Deck

**Audited:** content/post/python_pca/slides/
**Source of truth:** content/post/python_pca/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** Source fidelity is excellent — every number, figure, equation, and code line on a slide traces cleanly to `index.md`, and the assertion-title sequence reads as a coherent abstract. The strongest dimension is source fidelity (Dim 1); the weakest is accessibility/legibility (Dim 9): five of the math-step slides stack an equation plus a full two-sentence prose paragraph plus a bracketed `.comment` line, which overflows the 720px slide box at projector size. The one fix that would promote this to ACCEPT is moving the second explanatory sentence on each Step slide into the speaker notes, leaving a single anchor line on the slide.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | every number/figure/equation traces to index.md |
| 2  | Conceptual correctness        | 10         | 0       | estimand-free; PCA framing correct, ATE n/a |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; 0 raw-LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes             |
| 5  | Readability & simplicity      | 7          | 1M      | 5 step-slides stack prose that belongs in notes |
| 6  | Typos & grammar               | 9          | 1L      | em-dash ok; one stray hyphen range form |
| 7  | write-slides design adherence | 9          | 1L      | arc ok; closing one sentence; Devil's-Advocate present |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                   |
| 9  | Accessibility & legibility    | 5          | 1H      | 5 slides overflow the box (browser pass)|
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html`; files ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 9   | HIGH     | slides 20–24 (Step 1–6 math slides) | Equation + 2-sentence prose paragraph + `.comment` overflows the 720px box at projector size (5 slides flagged OVERFLOW by the browser pass) | Keep one anchor line + the `.comment`; move the second explanatory sentence to `::: {.notes}` |
| 2  | 5   | MED      | slides.qmd:106, 118, 130, 142, 183, 206 | Each Step slide carries two stacked body sentences after the equation — more than one full sentence of on-slide prose | Reduce each to one short anchor sentence; the rest moves to notes |
| 3  | 6   | LOW      | slides.qmd:62 caption             | `$r = -0.96$` good, but caption is a full sentence inside the figure alt-text; fine — no change needed, flagged only for consistency | none required |
| 4  | 7   | LOW      | slide "Where we're going" + "Six steps…" | Two consecutive agenda/list slides early in Act I/II (the post's learning objectives + the six-step list overlap) | Acceptable for a Teaching deck; optionally merge — deferred |

Order: HIGH first, then MED, then LOW.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide 7 "Step 1 — flip infant mortality so 'up' always means 'better'"**

Before:
> Multiply the "more is bad" indicator by $-1$. Now a large value of $IM^{*}$ means *low* infant mortality — a good outcome.

After (one anchor line on slide; second sentence to notes):
> Multiply the "more is bad" indicator by $-1$ — now bigger always means healthier.

Why: two stacked sentences → one 12-word anchor; the "low infant mortality = good outcome" gloss is spoken, not read.

**Issue #2 — slide 8 "Step 2 — standardize so years and rates share one ruler"**

Before:
> Subtract each variable's mean, divide by the standard deviation. Both indicators now have **mean 0, SD 1** — unitless, directly comparable.

After:
> Subtract the mean, divide by the SD — both indicators become **mean 0, SD 1** and directly comparable.

Why: two sentences → one; "unitless" folded into the spoken note.

**Issue #2 — slide 9 "Step 3 — for standardized data, covariance *is* correlation"**

Before:
> Standardization guarantees **1s on the diagonal** (unit variance) and the **correlation $r$ off-diagonal**. With two variables, PCA only has to decompose this single $2 \times 2$ matrix.

After:
> Standardized data puts **1s on the diagonal** and the **correlation $r$ off-diagonal**.

Why: the second sentence ("PCA only has to decompose this $2\times2$") is a speaker point, not a read line.

**Issue #2 — slide 10/11 "Step 4 — eigen-decomposition finds the direction of maximum spread"**

Before:
> The **eigenvector** $\mathbf{v}$ is the direction of greatest spread — its components become the index weights. The **eigenvalue** $\lambda$ is the variance along that direction.

After:
> **Eigenvector** = direction of greatest spread (the index weights). **Eigenvalue** = variance along it.

Why: a clean two-item contrast replaces two full sentences; fits one line.

**Issue #2 — slide "Step 5 — project each country onto PC1 to get its score"**

Before:
> The eigenvector *is* the recipe: multiply each country's z-scores by the weights and sum. Two variables officially become one composite number.

After:
> The eigenvector *is* the recipe — multiply each z-score by its weight and sum.

Why: drops the redundant second sentence (the figure/code already shows "two become one").

**Issue #2 — slide "Step 6 — rescale to [0, 1] so a policymaker can read it"**

Before:
> Min-max scaling: the worst country maps to **0**, the best to **1**, everyone else proportionally between.

After:
> Min-max scaling: worst → **0**, best → **1**, everyone proportional between.

Why: one tighter line; already a single sentence, just shortened.

---

## HIGH-issue rewrites

**Issue #1 — Accessibility/overflow — slides 20–24 (the Step 1–6 math slides)**

Before (per slide, on-slide body):
> [equation] + two stacked explanatory sentences + a `.comment` bracket line

After:
> [equation] + ONE short anchor sentence + the `.comment` bracket line; the removed sentence is appended to that slide's `::: {.notes}` block so the speaker still says it.

This is the same edit as Issue #2's rewrites — shortening the on-slide prose removes the vertical overflow.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                 | Value on slide | Source location               | Match |
|-----------------------------|----------------|-------------------------------|-------|
| PC1 variance explained       | 97.97%         | index.md:594                  | ✓     |
| PC1 variance (rounded)       | 98.0% / 2.0%   | index.md:667–669              | ✓     |
| Eigenvector weights          | 0.7071 each    | index.md:590, 598             | ✓     |
| Eigenvalues λ₁, λ₂           | 1.9595, 0.0405 | index.md:587                  | ✓     |
| Closed form λ = 1±r          | 1+r, 1−r       | index.md:557                  | ✓     |
| Raw correlation              | −0.96 / +0.96  | index.md:391, 449             | ✓     |
| Off-diagonal r               | 0.96 (0.9595)  | index.md:540                  | ✓     |
| PC1 score range              | [−2.39, 2.37]  | index.md:715–716, 735         | ✓     |
| Health Index range           | [0.00, 1.00]   | index.md:798, 832             | ✓     |
| Mean Health Index            | 0.50           | index.md:802 (0.5017)         | ✓     |
| Country_01 z-scores          | 1.04, 0.76     | index.md:470                  | ✓     |
| Country_01 PC1               | 1.27 (1.2720)  | index.md:683                  | ✓     |
| Country_01 Health Index      | 0.77 (0.7687)  | index.md:769                  | ✓     |
| std 8.62 vs 8.53 (ddof)      | 8.62 / 8.53    | index.md:500, 510             | ✓     |
| infant_mort 18.6 → −18.6     | 18.6 / −18.6   | index.md:434, 453             | ✓     |
| manual vs sklearn gap        | 1.33e-15 / "1.3e-15" | index.md:981             | ✓     |
| correlation manual↔sklearn   | 1.000000       | index.md:982                  | ✓     |
| Bottom-10 below 0.16         | below 0.16     | index.md:832, 863             | ✓     |
| Mendez & Gonzales (2021)     | 339 municipalities | index.md:1027             | ✓     |
| Figure: pca_raw_scatter.png  | ../pca_raw_scatter.png | index.md:422 (same fig)   | ✓     |
| Figure: pca_standardized_eigenvectors.png | ../pca_standardized_eigenvectors.png | index.md:639 | ✓ |
| Figure: pca_variance_explained.png | ../pca_variance_explained.png | index.md:667 | ✓ |
| Figure: pca_pc1_scores.png   | ../pca_pc1_scores.png | index.md:757            | ✓     |
| Figure: pca_health_index.png | ../pca_health_index.png | index.md:861          | ✓     |
| Figure: pca_sklearn_comparison.png | ../pca_sklearn_comparison.png | index.md:1008 | ✓ |
| Code: w1,w2 projection       | eigenvectors[0,0]… | index.md:690–692          | ✓     |

No ✗. All 6 figures resolve on disk.

---

## Title sequence (assertion-title test)

1. How do you rank 50 countries when health has many faces?
2. The two indicators tell one story — in opposite directions
3. Where we're going
4. Six steps turn two raw indicators into one composite index
5. Step 1 — flip infant mortality so "up" always means "better"
6. Step 2 — standardize so years and rates share one ruler
7. Step 3 — for standardized data, covariance *is* correlation
8. Step 4 — eigen-decomposition finds the direction of maximum spread
9. With $r = 0.96$, PC1 absorbs almost all the variance: 97.97%
10. A single number keeps 98% of the information
11. Two standardized variables *always* get equal weights — 0.7071 each
12. Step 5 — project each country onto PC1 to get its score
13. PC1 scores rank every country on one health axis
14. Step 6 — rescale to [0, 1] so a policymaker can read it
15. The Health Index reveals a stark three-tier health divide
16. PC1 captures 97.97% of the variance — almost lossless compression
17. The manual pipeline matches scikit-learn to machine precision
18. The whole pipeline, end to end
19. Does an equal-weight average make PCA pointless here? No
20. The index measures *relative* performance — read it with care
21. Highly correlated indicators compress almost losslessly — but PCA earns its keep in high dimensions.

**Verdict:** coherent abstract — the assertion titles, read alone, tell the full story from tension to resolution.

---

## Positive highlights

- Slide 11's assertion title "Two standardized variables *always* get equal weights — 0.7071 each" states the deck's single most important teaching point in eight words and is backed by the weight table directly below it.
- Source fidelity is flawless: the title key-result strip (97.97%, 0.7071, 1.3e-15) and every in-slide number map to exact lines in `index.md`, including the subtle ddof=0 vs ddof=1 std distinction (8.53 vs 8.62).
- The Devil's-Advocate slide ("Does an equal-weight average make PCA pointless here? No") honestly steelmans the objection and answers it — exactly the design pattern the skill prescribes for a teaching/seminar deck.
- The closing divider is a single declarative thesis sentence, not "Questions?" / "Thank you."

---

## Priority action items

1. **[HIGH]** Shorten the on-slide prose on the six Step slides (Steps 1–6) to one anchor sentence each and move the dropped sentence into `::: {.notes}`. This clears the five overflow flags from the browser pass and lifts Dim 9 to ≥7.
2. **[MED]** Apply the Dim-5 rewrites above so each Step slide reads as a single short line a listener grasps at a glance.
3. **[LOW]** Optional: consider merging the "Where we're going" agenda with the "Six steps…" list to avoid two adjacent list slides at the Act I→II seam (deferred — both serve distinct pedagogical roles).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_pca

To re-check just the dimension you fixed:

    /project:review-slides python_pca focus: readability and accessibility

---

## Audit metadata

- Node version: system node
- Playwright: enabled (chromium)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: The browser pass's per-slide word counts are cumulative across `.incremental`/`.fragment` advances within an act (counts grow monotonically and all carry the divider's title), so the absolute word numbers are an upper-bound artifact; the OVERFLOW flags (5 slides) are the load-bearing signal and drive the Dim-9 finding.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
