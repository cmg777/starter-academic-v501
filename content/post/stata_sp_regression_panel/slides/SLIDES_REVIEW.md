# Review: stata_sp_regression_panel Slide Deck

**Audited:** content/post/stata_sp_regression_panel/slides/
**Source of truth:** content/post/stata_sp_regression_panel/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** A faithful, well-paced 3-act deck whose assertion titles read as a coherent abstract and whose numbers all trace to the source post. The strongest dimension is source fidelity (every coefficient, SE, z, χ², and p-value matches `index.md`); the weakest, before fixing, was a single unsupported specific ("five neighboring states") in the opening title. After removing that count, no HIGH issues remain. The one fix that mattered to reach ACCEPT was deleting the invented "five".

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 9          | 1 MED (fixed) | all numbers trace to source; "five" removed |
| 2  | Conceptual correctness        | 10         | none    | estimand framing, nesting, decomposition correct |
| 3  | Technical & render correctness| 10         | none    | smoke-test PASS (15/15); math renders, raw-latex 0 |
| 4  | Title↔body consistency        | 10         | none    | assertion-title test passes            |
| 5  | Readability & simplicity      | 10         | none    | 0 real overflow; prose lives in notes  |
| 6  | Typos & grammar               | 10         | none    | em-dashes correct; terminology consistent |
| 7  | write-slides design adherence | 10         | none    | 3-act arc; Devil's-Advocate present; closing is one sentence |
| 8  | Branding integrity            | 10         | none    | scss/title-slide byte-identical (clean) |
| 9  | Accessibility & legibility    | 10         | none    | overflow none (all slides oflowY=0 @1280×720) |
| 10 | Deliverable completeness      | 10         | none    | link `url: slides/index.html` ok; files ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 1   | MED      | slide 2 — "When Virginia raises its cigarette tax, smokers in five neighboring states…" (slides.qmd:50) | Title states "five" neighboring states; the post (index.md:499) says only "bordering states" with no count. The number, though factually defensible (VA borders NC/TN/KY/WV/MD), is not in the source. | Remove "five" — APPLIED. |
| 2  | 1   | LOW      | slide 2 / slide 28 — "57% larger" (slides.qmd:66, 216, 220) | Exact ratio −0.627/−0.402 is 56.0%, not 57%. | No change — the post itself states "57%" (index.md:923, abstract); deck faithfully matches source. Informational only. |

Order: HIGH first, then MED, then LOW.

---

## Readability rewrites (Dimension 5)

None found.

The deck keeps every multi-sentence explanation inside `::: {.notes}`; on-slide bodies are single gloss lines or short two-fragment setups. Browser pass confirms zero real overflow at 1280×720 (the `slide-audit.cjs` OVERFLOW/WORD flags were the documented cumulative-across-vertical-subslides + speaker-notes artifact; per-current-slide measurement shows `oflowY=0` on all 41 fragment states).

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                         | Value on slide | Source location          | Match |
|-------------------------------------|----------------|--------------------------|-------|
| Title-strip: SDM total price effect | −0.627         | index.md:581, 590        | ✓     |
| Title-strip: rho                    | 0.265          | index.md:574, 588        | ✓     |
| Title-strip: tau                    | 0.65           | index.md:204 (0.654)     | ✓     |
| Two-way FE vs SDM elasticity        | −0.40 / −0.63  | index.md:479, 590        | ✓     |
| Panel: 46 states × 30 years, 1,380  | 46 / 30 / 1,380| index.md:295, 310        | ✓     |
| Between/within logc, logp (notes)   | .225/.125, .280/.193 | index.md:344       | ✓     |
| Pooled OLS logp / logy / R²         | −0.386 / 0.372 / 0.224 | index.md:372-374, 378 | ✓  |
| Region FE logp / logy / withinR²    | −0.231 / −0.015 / 0.406 | index.md:404-405, 415 | ✓ |
| Time FE logp / logy / R²            | −0.861 / 0.805 / 0.507 | index.md:437-438, 443 | ✓ |
| Two-way FE logp / logy / withinR²   | −0.402 / 0.119 / 0.789 | index.md:469-470, 479 | ✓ |
| SDM main logp / Wx logp / rho / z   | −0.307 / −0.206 / 0.265 / 8.08 | index.md:566,570,574 | ✓ |
| Decomposition direct/indirect/total | −0.313 / −0.314 / −0.627 | index.md:579-581 | ✓     |
| Total effect SE / z                 | 0.087 / −7.23  | index.md:581             | ✓     |
| Lee–Yu rho / logp / total           | 0.260 / −0.304 / −0.623 | index.md:625, 617, 632, 639 | ✓ |
| Wald SAR / SLX / SEM χ² + p         | 12.87/0.002, 61.04/<0.001, 8.49/0.014 | index.md:681-683, 699-700, 718-719 | ✓ |
| Dynamic: rho 0.265→0.080            | 0.265 / 0.080  | index.md:901             | ✓     |
| Static vs dynamic own price         | −0.307 / −0.150| index.md:897             | ✓     |
| tau (full dynamic) / z              | 0.639 / 33.33  | index.md:882 (0.639), 822 (z=33.33 for τ=0.654) | ✓ |
| psi insignificance (p=0.130)        | p = 0.130      | index.md:883, 887        | ✓     |
| Long-run = −0.150/(1−0.639) ≈ −0.42 | −0.42          | index.md:905, 913        | ✓     |

Every ✗ is a HIGH issue above. None.

---

## Title sequence (assertion-title test)

1. When Virginia raises its cigarette tax, smokers in neighboring states change their behavior
2. The two-way fixed effects price elasticity is −0.40. The spatial model says it is really −0.63
3. The lab: 46 states × 30 years, 1,380 rows, one contiguity weight matrix
4. Row-standardizing W turns the spatial lag into a neighbor average
5. Pooled OLS says price elasticity is −0.39 — but it assumes states are interchangeable
6. Fixed effects swing the elasticity from −0.23 to −0.86 depending on what you absorb
7. Two-way FE is the credible non-spatial benchmark: price elasticity −0.40
8. The Spatial Durbin Model lets neighbors' Y and neighbors' X both move local consumption
9. One xsmle line fits the full SDM with two-way fixed effects
10. ρ = 0.265: states with higher-consuming neighbors consume more
11. The coefficient is not the effect: price decomposes into direct −0.31 and indirect −0.31
12. The SDM total price effect is −0.63 — 57% larger than two-way FE
13. The Lee–Yu correction barely moves the estimates — small-sample bias is negligible
14. Three Wald tests say the SDM cannot collapse to a simpler model
15. All three restrictions are rejected — the full SDM is the right specification
16. Add habit persistence and ρ collapses from 0.265 to 0.080
17. Habit persistence is the dominant dynamic force: τ ≈ 0.65
18. Static models hide the timing: short-run elasticity −0.15, long-run −0.42
19. Does the spatial model identify a causal tax effect? No — it disciplines correlation
20. Coordinated regional taxation beats isolated state-level taxes — and takes years to bite.

**Verdict:** coherent abstract — the titles alone narrate the full Tension→Investigation→Resolution arc.

---

## Positive highlights

- Slide 2's title "The two-way fixed effects price elasticity is −0.40. The spatial model says it is really −0.63" plants the central gap in one line and earns the payoff bignum in Act II.
- Slide 11's title "The coefficient is not the effect" is the single most important conceptual correction in spatial econometrics, stated in six words before the decomposition equation.
- Slide 19 is a genuine Devil's-Advocate slide that correctly limits the estimand: the SDM disciplines correlation, it does not identify a causal tax effect — no causal overclaiming.
- Closing slide 20 is one declarative sentence with both the policy lesson and the timing lesson; not "Questions?"/"Thank you".
- Every interpretive paragraph is parked in `::: {.notes}`, leaving the slides scannable in two seconds.

---

## Priority action items

1. **[MED]** Remove the unsupported "five" from slide 2's title (slides.qmd:50). — APPLIED.

(Only one actionable item; no HIGH issues.)

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_sp_regression_panel

To re-check just the dimension fixed:

    /project:review-slides stata_sp_regression_panel focus: fidelity

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (Chromium via npx cache)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: per-slide overflow re-measured at 1280×720 (Reveal.getCurrentSlide) — all oflowY=0; slide-audit cumulative WORDS/BULLETS/OVERFLOW flags are the documented vertical-subslide + speaker-notes artifact.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only audit; this report plus the single applied "five" fix are the only changes — the branding theme, figures, and index.md were not touched.*
