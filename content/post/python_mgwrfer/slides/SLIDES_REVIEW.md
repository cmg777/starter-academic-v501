# Review: python_mgwrfer Slide Deck

**Audited:** content/post/python_mgwrfer/slides/
**Source of truth:** content/post/python_mgwrfer/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** A faithful, well-paced deck: every number on every slide
traces cleanly to the source post (Table 2, Table 3, the α-recovery figures, the
bandwidths, the Georgia case study), the smoke test passes 15/15, branding is
byte-identical to the templates, and no raw LaTeX survives — math typesets across
all 25 slides. The strongest dimension is **source fidelity** (Dim 1, 10/10);
the weakest is **readability** (Dim 5), pulled down by two genuinely over-length
on-slide sentences (the 27-word Act-I hook and the 42-word Devil's-Advocate
response). Fixing those two sentences (move the prose to `::: {.notes}`, keep one
anchor line) promotes the deck to ACCEPT. The 8 "overflow" slides flagged by the
browser pass are a centered-layout artifact (a `.act`/`.bignum`/comment label
sitting a few px above the centered box top, `r.top < box.top`), not bottom
content-clipping — re-verified at 1280×720 with notes/hidden nodes excluded: zero
bottom-clip, no content lost.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers/figures/tables trace to index.md |
| 2  | Conceptual correctness        | 10         | 0       | estimand, identification, FE framing all correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; no `\_`/`\$` |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes             |
| 5  | Readability & simplicity      | 7          | 2 MED   | two over-length on-slide sentences      |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; consistent terms     |
| 7  | write-slides design adherence | 9          | 1 LOW   | strong 3-act arc; one underloaded "Where we're going" |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean (byte-identical)  |
| 9  | Accessibility & legibility    | 9          | 1 LOW   | overflow flags are centered-layout artifact, not clipping |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html`; files present; 56.7 KB |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slides.qmd:51 — Act-I hook        | 27-word sentence with two em-dash asides; over the 25-word floor | Split into two short lines (see rewrite) |
| 2  | 5   | MED      | slides.qmd:265 — "strongest objection" | 42-word Response packs the four assumptions into one sentence | Keep a one-line rebuttal; move the four assumptions to notes |
| 3  | 7   | LOW      | slides.qmd:69 — "Where we're going" | Roadmap slide is an agenda inside Act I; the hook + spoiler already do this work | Optional: cut or fold into notes (keeps Act I to a tighter 2 slides) |
| 4  | 9   | LOW      | slides 17–24 (browser pass)       | `slide-audit.cjs` flags 8 "overflow"; re-verify shows a label span a few px above the centered box top, not content clipping | No action — centered-layout artifact; no content lost |

Order: HIGH first, then MED, then LOW. (No HIGH issues.)

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "When place secretly drives both x and y" (slides.qmd:51)**

Before:
> If an unobserved attribute of place — geography, institutions, persistent norms — shifts the outcome *and* the levels of the covariates, MGWR's local slopes absorb that contamination.

After:
> An unobserved attribute of place shifts the outcome *and* the covariate levels.
> MGWR's local slopes then absorb that contamination.

Why: 27 words with two em-dash asides → two ~10-word lines; the examples
(geography, institutions, norms) move to the speaker notes where the speaker says
them aloud.

**Issue #2 — slide "The strongest objection" (slides.qmd:265)**

Before:
> [Response.]{.rebuttal} Correct, and the paper is candid: identification rests on four assumptions — time-invariant $sc$, strict exogeneity, no time-varying confounders, stable slopes. MGWFER removes one specific bias cleanly; it does not manufacture identification, and it cannot recover effects of time-invariant *measurable* covariates.

After:
> [Response.]{.rebuttal} True. MGWFER removes *time-invariant* confounding cleanly — and only that. It does not manufacture identification.

Why: 42 words → 17; the four-assumption list (time-invariant sc, strict
exogeneity, no time-varying confounders, stable slopes) belongs in notes as the
spoken caveat, not stacked on the slide.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                  | Value on slide       | Source location                  | Match |
|----------------------------------------------|----------------------|----------------------------------|-------|
| Confounder range                             | $sc_i$ ~2 to 52      | index.md:406 (2.07–51.55)        | ✓ (rounded) |
| Cor(x_k, sc); Cor(x_4, y)                    | 0.84; 0.84           | index.md:451-455                 | ✓     |
| Pooled OLS β₁ / FE β₁                        | 6.14*** / 1.57***    | index.md:504, 512               | ✓     |
| Pooled OLS β₃ / FE β₃                        | 5.79*** / 1.55***    | index.md:505                     | ✓     |
| Pooled OLS β₄ / FE β₄                        | 4.16*** / 0.02 n.s.  | index.md:506                     | ✓     |
| PMGWR R²; β₁ corr                            | 0.99; −0.46          | index.md:545, 562 (0.989, −0.4575) | ✓   |
| β₁ RMSE PMGWR → MGWFER                        | 2.30 → 0.18          | index.md:770 (2.3003 → 0.1793)   | ✓     |
| β₁ corr flip                                 | −0.46 → +0.82        | index.md:774 (−0.4575 → +0.8179) | ✓     |
| RMSE cut all coefficients                    | −92% to −96%         | index.md:770-773                 | ✓     |
| α̂ recovery corr; RMSE; scale                | 0.9996; 0.54; 2–52   | index.md:695, 698                | ✓     |
| α ranges: true / MGWFER / MGWR_cs / PMGWR    | —/[1.45,51.62]/[2,22]/[−11,10] | index.md:728-730       | ✓     |
| 225/225 units significant; df = 446          | 225/225; 446         | index.md:704, 717-718            | ✓     |
| Demeaning ranges: raw/demeaned/confounder    | [−4.07,57.41]/[−6.88,6.92]/[2.07,51.55] | index.md:607, 612 | ✓   |
| Bandwidths PMGWR / MGWFER                     | 44–50 / [50,91,116,62] | index.md:793-795              | ✓     |
| Georgia: intrinsic ±0.3 (±1.5%) → ±4 (±20%); 10× | as stated         | index.md:872, 878                | ✓     |
| Figure: true_coefficients / bias_pooled / recovery_fe / alpha_map / bandwidth_comparison | 5 ../*.png | all exist on disk | ✓ |

Every datum traces to the source post. No invented or mismatched numbers.

---

## Title sequence (assertion-title test)

1. When place secretly drives both x and y, MGWR maps the confounder, not the effect
2. One dataset, six estimators, and a coefficient surface that flips sign
3. The lab: 225 spatial units × 3 periods, with place wired into every covariate
4. Couple every covariate to place and x₄ correlates 0.84 with y — with zero causal effect
5. Wooldridge in one line: OLS recovers βₖ+δₖ, not βₖ
6. Six estimators, escalating discipline — only one removes the confounder
7. Globally, OLS overstates every slope ~4× and "detects" a null effect at p<10⁻¹³
8. PMGWR's local fit looks great (R²=0.99) but β̂₁ is anti-correlated with truth
9. MGWFER's one move: subtract each unit's mean, and the confounder vanishes exactly
10. Demeaning shrinks the outcome's range from 61 to 14 — the confounder *was* most of the signal
11. After demeaning, β̂₁'s correlation with truth flips from −0.46 to +0.82
12. RMSE falls 92–96% on every coefficient — and the sign flips on the worst one
13. Stage 2 hands back the confounder itself — recovered at correlation 0.9996
14. MGWFER reconstructs the confounder surface; PMGWR inverts it, MGWR_cs compresses it
15. Recovered α̂ᵢ correlates 0.9996 with the truth — every one of 225 units significant
16. Only MGWFER reads the true process scales — PMGWR collapses every bandwidth to 44–50
17. The strongest objection — does the within-transform make this causal?
18. On Georgia data, MGWFER flips poverty's sign and 10× the place effect
19. Let the within-transformation, not the bandwidth search, decide what place is doing.

**Verdict:** coherent abstract. The titles read alone tell the whole talk —
tension (1–2), lab setup (3–6), the bias on display (7–8), the one move (9–12),
the payoff (13–16), the steelman + stakes (17–18), the thesis (19). All
assertions, no label titles.

---

## Positive highlights

- Slide 9's title "MGWFER's one move: subtract each unit's mean, and the confounder vanishes exactly" states the entire method in twelve plain words — assertion title done right.
- Slide 12's `−92%` big-number slide is the Act-III hinge as a single figure; the body label gives the sign-flip in one line, the rest is in notes.
- Dimension 1 is flawless: all 25 slides' numbers (Table 2, Table 3, α-recovery, bandwidths, Georgia) round-trip to the post with correct signs and magnitudes.
- The Devil's-Advocate slide (17) is a genuine steelman ("Demeaning only removes time-invariant confounders — a one-trick pony") — exactly the design contract for a seminar/working deck.
- Closing slide 19 is one declarative sentence (the thesis), not "Questions?" / "Thank you".

---

## Priority action items

1. **[MED]** Split the 27-word Act-I hook (slides.qmd:51) into two short lines; move the geography/institutions/norms examples to notes.
2. **[MED]** Trim the 42-word Devil's-Advocate Response (slides.qmd:265) to one rebuttal line; move the four assumptions to notes.
3. **[LOW]** Consider folding the "Where we're going" roadmap (slides.qmd:69) into notes — the hook + spoiler figure already set up Act II.

---

## Screenshots (HIGH-severity visual issues only)

None — the browser-pass overflow flags are a centered-layout artifact, not content clipping (re-verified: zero bottom-clip at 1280×720).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_mgwrfer

To re-check just the dimension you fixed:

    /project:review-slides python_mgwrfer focus: readability

---

## Audit metadata

- Node version: (system node)
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs overflow counts are cumulative across vertical stacks + speaker-notes DOM (known artifact); re-verified per current slide at 1280×720 with notes/hidden excluded — no bottom-clip on any slide.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
