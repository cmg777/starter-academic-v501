# Review: python_scpi Slide Deck

**Audited:** content/post/python_scpi/slides/
**Source of truth:** content/post/python_scpi/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is a strong, faithful deck. Every on-slide number,
table, figure, and equation traces cleanly to the source post; the math typesets
(0 raw-LaTeX slides); the branding files are byte-identical to the canonical
templates; and the smoke test passes 15/15. The strongest dimension is source
fidelity (all 30+ numbers verified). The weakest is conceptual correctness, pulled
down by a single MED in the speaker notes: a fabricated "Donohue-Levitt-style"
attribution for difference-in-differences that the source post does not make.
Fixing that one note (already applied) leaves a clean ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 30+ numbers/tables/figures trace to index.md |
| 2  | Conceptual correctness        | 7          | 1 MED   | spurious Donohue-Levitt DiD attribution (notes) |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders; 0 raw LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 9          | 1 LOW   | one 6-bullet two-column contrast slide |
| 6  | Typos & grammar               | 10         | 0       | no --, no spelling/agreement errors    |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate present; 1-sentence close |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 10         | 0       | no genuine overflow at 1280×720; figures captioned |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html`; files present; 5/5 figures resolve |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 2   | MED      | slides.qmd:57 — notes of slide 1.1 | "Donohue-Levitt-style difference-in-differences" — fabricated attribution; Donohue & Levitt is the abortion-and-crime study, not a canonical DiD reference. The post (index.md:746) says only "traditional difference-in-differences designs are not feasible," with no author attribution. | Remove the attribution; say "Standard difference-in-differences needs an untreated comparison" |
| 2  | 5   | LOW      | slide 2.9 — "The estimation error splits into two sources" | 6 `<li>` across a two-column In-sample / Out-of-sample contrast (3 each). Above the 5-bullet cap, but it is a deliberate two-item contrast (explicitly allowed by readability-rules). | Acceptable as structured contrast; no change required. Optionally trim each column to 2 lines. |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

**Note on the browser-pass output.** `slide-audit.cjs` reported "8 overflow slides /
10 bullets / 21 dense" — this is the **documented cumulative artifact**: the script
walks `Reveal.next()` and accumulates `.incremental` reveals plus hidden
`::: {.notes}` into its per-step measurement. A per-current-slide re-measurement at
1280×720 (`Reveal.getCurrentSlide()`, excluding notes) found **zero** genuine
overflow — every real slide's `scrollHeight ≤ clientHeight`. Per-slide bullet counts
are 5, 4, and 6 (the contrast slide above), never 10. These cumulative flags are
**not** load-bearing and are excluded from the verdict.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide 2.9 "The estimation error splits into two sources"**

Before:
> In-sample: Weights estimated from a *finite* pre-window / 31 years, 16 weights ⇒ sampling noise / Monte Carlo simulation
> Out-of-sample: Post-1990 shocks the model cannot foresee / Structural breaks, surprises / Gaussian concentration bound

After (optional trim — keep the contrast, drop one line each):
> In-sample: Weights from a *finite* pre-window (31 years, 16 weights) → Monte Carlo
> Out-of-sample: Post-1990 shocks the model never saw → Gaussian bound

Why: 6 `<li>` → 4; preserves the load-bearing two-source contrast. This is an
optional polish — the slide is already a legitimate structured contrast.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide | Source location          | Match |
|--------------------------------------|----------------|--------------------------|-------|
| ATT gap 2003                          | −$3,465        | index.md:543, 748        | ✓     |
| ~11% of predicted GDP                 | ~11%           | index.md:737             | ✓     |
| Years below 99% interval              | 7 of 13        | index.md:728             | ✓     |
| Years below 90% interval              | 9 of 13        | index.md:728             | ✓     |
| Pre-treatment RMSE (simplex)          | 0.072          | index.md:679, 748        | ✓     |
| Active donors                         | 6 of 16        | index.md:427, 502        | ✓     |
| Weights (AUT/USA/ITA/NLD/CHE/FRA)     | .291/.273/.191/.133/.081/.030 | index.md:505 | ✓     |
| Panel size                            | 748 obs, 17 countries, 44 yrs | index.md:339 | ✓     |
| Pre-treatment years                   | 31             | index.md:405             | ✓     |
| Gap table (1991/1995/2000/2003)       | +.502/−1.109/−2.757/−3.465 | index.md:528–540 | ✓ |
| Average gap 1991–2003                 | −$1,668        | index.md:542             | ✓     |
| PI 2003 (actual/synth/lower)          | 28.86/32.32/30.04 | index.md:600          | ✓     |
| Actual below lower bound 2003         | ~$1,180        | index.md:603             | ✓     |
| Robustness (Simplex/Lasso/Ridge/OLS)  | matches table  | index.md:689–692         | ✓     |
| 99% avg PI width                      | $3,298         | index.md:721             | ✓     |
| GDP 1960→1990                         | ~$2,300 → ~$20,500 | index.md:370         | ✓     |
| scpi args (sims=200, HC1, gaussian)   | matches        | index.md:568             | ✓     |
| Figure: prediction intervals          | ../scpi_prediction_intervals.png | index.md:645 | ✓ |
| Figure: gdp trajectories              | ../scpi_gdp_trajectories.png | index.md:368 | ✓     |
| Figure: weights                       | ../scpi_weights.png      | index.md:505     | ✓     |
| Figure: actual vs synthetic           | ../scpi_actual_vs_synthetic.png | index.md:476 | ✓ |

No ✗. Every slide datum is sourced.

---

## Title sequence (assertion-title test)

1. When a whole country is treated, there is no untreated twin to compare it to
2. Even with a counterfactual, a point estimate alone cannot tell us if the gap is real
3. The estimand is the ATT for one unit: West Germany's gap from its own counterfactual
4. The counterfactual is a weighted blend of donor countries — like mixing paints to a target
5. The lab: 17 countries, 44 years, 748 observations, 31 pre-treatment years
6. Before 1990 the upper cluster of rich economies moves together — then West Germany flattens
7. Six lines build the synthetic and its prediction intervals in scpi_pkg
8. The simplex keeps only 6 of 16 donors — Austria and the USA carry over half the weight
9. A near-perfect pre-1990 fit (RMSE 0.072) is what licenses trusting the post-1990 forecast
10. The point estimate: the gap turns negative by 1993 and reaches −$3,465 by 2003
11. The estimation error splits into two sources — and prediction intervals bound both
12. Foreground the band: actual GDP exits the 95% interval from 1997 on, and never returns
13. By 2003 West Germany was −$3,465 per capita poorer than its counterfactual
14. The negative effect survives all four weight constraints — magnitude moves, direction does not
15. Even at 99% confidence, actual GDP falls outside the band in 7 of 13 years
16. Does SCPI make the claim causal? No — it quantifies uncertainty, it does not buy identification
17. A point estimate says "the lines diverge"; a prediction interval says "and it is not noise."

**Verdict:** coherent abstract. The titles read in sequence tell the whole story —
problem, estimand, method, fit, point estimate, uncertainty decomposition,
significance, robustness, scope limit, thesis. Every title is an assertion, not a
label.

---

## Positive highlights

- Slide 17's closing — "A point estimate says 'the lines diverge'; a prediction interval says 'and it is not noise.'" — is a single declarative sentence that names the deck's entire contribution; a textbook one-sentence close (not "Questions?"/"Thank you").
- Slide 16 is a genuine Devil's-Advocate slide ("Does SCPI make the claim causal? No"), steelmanning the spillover/identification objection before answering — exactly what the seminar archetype requires.
- Source fidelity is flawless: the 2003 gap (−$3,465 = 32.32 − 28.86), the 99% "7 of 13" coverage, and the six donor weights all reconcile to the post to the displayed precision.
- The two repeated uses of `scpi_prediction_intervals.png` (Act-I hook at slide 1.2, earned payoff at slide 2.10) are a deliberate, effective rhetorical bookend, not a duplication error.

---

## Priority action items

1. **[MED]** Remove the fabricated "Donohue-Levitt-style" attribution in the slide 1.1 speaker notes (slides.qmd:57); the post makes no such attribution. (Applied.)
2. **[LOW]** Optionally trim the slide 2.9 In-sample/Out-of-sample contrast from 3 to 2 lines per column to drop under the 5-bullet cap; the slide is already an acceptable structured contrast.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_scpi

To re-check just the dimension you fixed:

    /project:review-slides python_scpi focus: correctness

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (Chromium, via npx cache)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs reported cumulative overflow/density flags; re-verified per-current-slide at 1280×720 (no genuine overflow, max 6 bullets on the contrast slide).

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only audit; this report plus the single applied notes fix are the only changes.*
