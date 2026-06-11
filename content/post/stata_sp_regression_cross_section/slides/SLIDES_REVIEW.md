# Review: stata_sp_regression_cross_section Slide Deck

**Audited:** content/post/stata_sp_regression_cross_section/slides/
**Source of truth:** content/post/stata_sp_regression_cross_section/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled (slide-audit.cjs)

---

## Verdict: MINOR REVISION

**Overall assessment.** A faithful, well-built deck: every number, table, and
parameter on a slide traces exactly to `index.md`, the assertion titles read as a
coherent abstract, branding is byte-clean, and the math renders (zero raw-LaTeX).
The strongest dimension is source fidelity (all values match); the weakest is
readability — one Devil's-Advocate slide carries a 51-word, three-clause sentence
on-slide that belongs in speaker notes. Fixing that one slide promotes the deck to
ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers/tables trace to index.md   |
| 2  | Conceptual correctness        | 10         | 0       | estimand framed as descriptive; causal claim disciplined |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); 0 raw-LaTeX   |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 7          | 1M/1L   | 1 over-length on-slide sentence        |
| 6  | Typos & grammar               | 10         | 0       | no `--`, terminology consistent        |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate; closing OK|
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 9          | 1L      | density artifact only; no genuine clip |
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html`; files OK     |

---

## Issues found

| #  | Dim | Severity | Location                                              | Issue                                                              | Suggested fix                                  |
|---:|----:|----------|-------------------------------------------------------|--------------------------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slide 21 — "Does the spillover make this causal?"     | 51-word Response sentence, 3 semicolon clauses, on-slide           | Anchor + move the three reasons to `::: {.notes}` (see rewrite) |
| 2  | 5   | LOW      | slide 1 — "Crime does not respect neighborhood…"      | 24-word opening sentence on-slide                                  | Tighten to a shorter hook (see rewrite)        |
| 3  | 9   | LOW      | slides 10–19 (`.incremental` / `.columns`)            | slide-audit reports cumulative overflow across vertical stacks/notes — a known artifact, not a real per-slide clip | None — no fix needed; noted for transparency   |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 21 "Does the spillover make this causal? No — it disciplines description, not identification"**

Before:
> [Response.]{.rebuttal} It is a robust *spatial pattern*, not a causal effect. $W$ is chosen, not estimated; $\rho$, $\theta$, $\lambda$ are weakly separable; and the SDM-vs-SDEM choice is *non-nested* — global vs local spillovers fit the data equally well but mean different things. Treat $-1.20$ as a well-measured association, not a treatment effect.

After (on slide):
> [Response.]{.rebuttal} It is a robust *spatial pattern*, not a causal effect.
>
> Treat $-1.20$ as a well-measured association, not a treatment effect.

(move the three reasons — chosen $W$, weakly separable parameters, non-nested SDM-vs-SDEM — into `::: {.notes}`.)

Why: 51-word, 3-clause sentence → a one-line claim plus a one-line caveat; the three supporting reasons become spoken notes, not on-slide prose.

**Issue #2 — slide 1 "Crime does not respect neighborhood boundaries — but OLS pretends it does"**

Before:
> In Columbus, Ohio, a tract's crime depends on its own income and housing — and on what happens *next door*: displacement, diffusion, shared risk.

After:
> A tract's crime depends on its own income and housing — and on what happens *next door*: displacement, diffusion, shared risk.

Why: drops the redundant "In Columbus, Ohio," (the lab is named two slides later); 24 words → 19, same content.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                        | Value on slide        | Source location          | Match |
|------------------------------------|-----------------------|--------------------------|-------|
| Moran's I / z / p                  | 0.222 / 2.84 / 0.005  | index.md:433,438,440     | ✓     |
| LM-error / LM-lag                  | 5.33 (.021) / 3.40 (.065) | index.md:459–465     | ✓     |
| Robust LM-error / -lag             | 2.19 (.139) / 0.26 (.612) | index.md:466         | ✓     |
| SAR ρ / z / p                      | 0.428 / 3.49 / <0.001 | index.md:526             | ✓     |
| SEM λ / z / p                      | 0.562 / 4.23 / <0.001 | index.md:587             | ✓     |
| SLX effects INC (D/I/T)            | −1.10 / −1.40 / −2.50 | index.md:660             | ✓     |
| SLX W·INC p / LR vs OLS            | 0.016 / 6.8           | index.md:648,654         | ✓     |
| SDM ρ / W·INC / p                  | 0.404 / −0.58 / 0.31  | index.md:698,694,703     | ✓     |
| SDM effects INC (D/I/T)            | −1.03 / −1.50 / −2.52 | index.md:713–715         | ✓     |
| Spec-test LR (SLX/SAR/SEM)         | 7.4 / 2.0 / 4.0       | index.md:745,756,767     | ✓     |
| SDEM W·INC / z / p ; λ / p         | −1.20 / −2.10 / 0.036 ; 0.404 / 0.014 | index.md:827,831,836 | ✓ |
| SDEM effects INC (D/I/T)           | −1.05 / −1.20 / −2.26 | index.md:842             | ✓     |
| Effects-comparison table (INC row) | matches table 9.2 (SAC col dropped) | index.md:980–982 | ✓     |
| GNS ρ / λ / W·INC (+p)             | 0.32(.74)/0.15(.88)/−0.69(.68) | index.md:934,935,930 | ✓ |
| Total effect vs OLS / % understatement | −2.3 to −2.5 vs −1.60 / 40–55% | index.md:1008,1021 | ✓ |
| CRIME/INC/HOVAL means              | 35.1 / 14.4 / 38.4    | index.md:373–375         | ✓     |
| Title-strip key results            | 0.428 / −1.20 / 40–55%| index.md:59 (abstract)   | ✓     |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. Crime does not respect neighborhood boundaries — but OLS pretends it does
2. OLS residuals cluster in space: Moran's I = 0.222, p = 0.005
3. Where we're going
4. The lab: 49 Columbus tracts linked by a Queen-contiguity matrix W
5. One W matrix, two lines of Mata, and the spatial lags are ready
6. Eight models, three switches: turn ρ, θ, λ on or off
7. LM tests point first to the error model — but it's only a hint
8. SAR: a tract's crime depends directly on its neighbours' crime, ρ = 0.428
9. SEM: spatial dependence hides in the errors, λ = 0.562
10. SLX: neighbours' income lowers your crime — a local spillover of −1.40
11. SDM: combine lag-of-y and lag-of-X — the general-purpose hub
12. In the SDM the income spillover swells to −1.50 once feedback is counted
13. Test down from the SDM: only the lag-of-y refuses to be dropped
14. A \$1,000 rise in neighbours' income cuts your crime by 1.20
15. The four θ-models agree: income spillovers are large and negative
16. Ignore spillovers and you understate income's total effect by 40–55%
17. Turn on all three channels and the GNS collapses into noise
18. Does the spillover make this causal? No — it disciplines description, not identification
19. Let the data choose the channel — but never forget your neighbours.

**Verdict:** coherent abstract. Titles read in sequence narrate the whole talk —
tension (OLS ignores space), investigation (the taxonomy, model by model),
resolution (the income spillover, the GNS collapse, the causal caveat).

---

## Positive highlights

- Slide 8's title "SAR: a tract's crime depends directly on its neighbours' crime,
  ρ = 0.428" states the mechanism AND the headline number in one line.
- Slide 17 "Turn on all three channels and the GNS collapses into noise" turns the
  overparameterization result into a vivid, accurate one-line assertion.
- The Devil's-Advocate slide correctly bounds the estimand: it names $W$ as chosen
  (not estimated) and the SDM-vs-SDEM choice as non-nested, preserving the post's
  descriptive (not causal) framing.
- Currency is correctly escaped (`\$1,000`, `\$1k`) on every on-slide use, so no
  stray MathJax math is triggered; all subscripts use plain `_` (no Goldmark `\_`
  bug).

---

## Priority action items

1. **[MED]** Trim the slide-21 Response to a two-line claim + caveat; move the three
   supporting reasons into `::: {.notes}` (Issue #1).
2. **[LOW]** Drop "In Columbus, Ohio," from the slide-1 opener (Issue #2).

---

## Screenshots (HIGH-severity visual issues only)

None — no genuine per-slide clip or unrendered math.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_sp_regression_cross_section

To re-check just the dimension you fixed:

    /project:review-slides stata_sp_regression_cross_section focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (slide-audit.cjs; system Chromium)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit per-slide word/bullet counts are cumulative across
  vertical sub-slides + speaker notes (known artifact); only raw-LaTeX (0) and
  per-slide reality were treated as load-bearing.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
