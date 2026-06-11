# Review: python_cml Slide Deck

**Audited:** content/post/python_cml/slides/
**Source of truth:** content/post/python_cml/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** The deck is faithful, on-brand, and renders cleanly — every number on a slide traces to the source post, smoke-test passes 15/15, both branding files are byte-identical to the canonical templates, and a precise per-current-slide browser pass found zero real overflow and zero raw LaTeX. The strongest dimension is source fidelity (10); the weakest is readability (7), where two slides stack 26–27-word prose sentences that belong trimmed or in speaker notes. The single fix that promotes this to ACCEPT: shorten the two on-slide prose lines (slides 2 and 4 below). No HIGH issues.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all ~30 numbers + 6 figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | ATE/GATE/IATE estimands correct; identification framed as observational/unconfoundedness |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders (19 MathJax spans); raw-LaTeX 0 |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 7          | 2 MED   | 2 over-length on-slide prose sentences; 0 real overflow |
| 6  | Typos & grammar               | 10         | 0       | consistent terms; em-dashes used       |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate slide; closing = 1 declarative sentence |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none (per-slide re-verify); figures captioned |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html` ok; files ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slide 2 — "…the right one is 'for whom?'" (slides.qmd:56) | 26-word on-slide sentence with a sub-clause, stacked after a first prose sentence | Trim to two short lines; keep the long version in `::: {.notes}` |
| 2  | 5   | MED      | slide "Three estimands" `.comment` (slides.qmd:89) | 27-word on-slide sentence joining two ideas | Split into two short lines |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 2 "…the right one is 'for whom?'"**

Before:
> But caseworkers steer the *neediest* jobseekers into training, and a simple comparison cannot tell the programme's effect apart from *who got selected*. *Average is not enough.*

After:
> Caseworkers steer the *neediest* into training. A simple comparison then confuses *the programme* with *who was selected*. *Average is not enough.*

Why: 26-word sentence with a coordinating sub-clause → two ~9-word lines; "cannot tell … apart from" → "confuses … with"; the spoken detail moves to notes.

**Issue #2 — slide "Three estimands" `.comment` (slides.qmd:89)**

Before:
> Population average → subgroup average → one number *per person*. Skipping to the finest estimand without securing the average is the most common mistake in applied CML.

After:
> Population average → subgroup average → one number *per person*. Earn the coarse estimand before the fine one — the order is the discipline.

Why: 27-word second sentence with a nominalised subject ("Skipping … is the most common mistake") → a 17-word active imperative; the "most common mistake" framing stays available in the notes.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                         | Value on slide | Source location          | Match |
|-------------------------------------|----------------|--------------------------|-------|
| Key-result strip: DoubleML ATE      | 5.520          | index.md:449             | ✓     |
| Key-result strip: IATE corr         | 0.956          | index.md:528             | ✓     |
| Key-result strip: oracle welfare    | 99.5%          | index.md:614             | ✓     |
| Naive estimate / true               | +5.1 / +5.6 (5.628) | index.md:404, 396   | ✓     |
| Forest-plot fig + truth star 5.628  | ../cml_method_comparison.png | index.md:565   | ✓     |
| ATE / GATE / IATE estimand equations| E[Y(1)−Y(0)]…  | index.md:329,335,341     | ✓     |
| Unconfoundedness D⊥{Y(1),Y(0)}∣X    | (statement)    | index.md:345             | ✓     |
| Sample / treatment share / mean Y   | 5,000 / 52.8% / 22.7 | index.md:304-306,319 | ✓ (22.7≈22.68) |
| Overlap fig + propensity [0.21,0.81]| ../cml_overlap.png; 0.21/0.81 | index.md:379,381 | ✓   |
| Treated/untreated mean prop; gap    | 0.551/0.502/0.049 | index.md:376,381      | ✓     |
| Naive bias −0.52; CI [4.93,5.30]    | −0.52 / 5.111  | index.md:405,404         | ✓     |
| DoubleML ψ score equation           | g₁−g₀+IPW corr | index.md:416             | ✓     |
| DoubleML code (6 lines)             | DoubleMLIRM…   | index.md:423-434         | ✓     |
| DoubleML 5.520 [5.36,5.68]; bias→−0.11; 79%; SE 0.094→0.081 | all | index.md:449-454,645 | ✓ |
| GATE fig + 7.5→2.9; est 7.47/6.13/4.50/2.91; truth 7.63/6.12/4.61/3.13 | ../cml_gate_dutch.png | index.md:492-494 | ✓ |
| GATE within 0.22; n=725; ~2.6×      | (notes)        | index.md:494             | ✓     |
| IATE scatter fig; corr 0.956; MAE 0.40; mean 5.456; 0.17 | ../cml_iate_scatter.png | index.md:526-533 | ✓ |
| IATE distribution fig; ATE 5.63     | ../cml_iate_distribution.png | index.md:537   | ✓     |
| Compare cols: DoubleML [5.36,5.68]; forest [5.42,5.50] misses | (statement) | index.md:567 | ✓ |
| Welfare equation W=E[rule·(τ−c)]; c=4| index.md:575   | ✓     |
| IATE rule 1.749; oracle 1.758 (99.5%); treat-all 1.628 (+7.4%); 83.9/83.8% | all | index.md:608-609,614 | ✓ |
| Welfare bar fig                     | ../cml_policy_welfare.png | index.md:612    | ✓     |
| Devil's advocate: overlap [0.21,0.81] (notes) | index.md:628 | ✓        |

Every datum matches. No ✗.

Note (LOW, not a slide issue): slide 18 speaker notes say the forest uses "400 honest trees", which matches the executed code (`n_estimators=400`, index.md:507). The post *prose* at index.md:223 instead says "1,000 honest trees" — an internal inconsistency in the post, not the deck. The slide is correct; left unchanged.

---

## Title sequence (assertion-title test)

1. "Does training work?" is the wrong question — the right one is "for whom?"
2. A naive comparison says +5.1 months — but the true effect is +5.6
3. Where we're going
4. Three estimands, increasing granularity — and we must earn them in order
5. The identifying assumption: unconfoundedness, not randomisation
6. The lab: 5,000 jobseekers, six covariates, and a known ground truth
7. Overlap holds: propensities stay inside [0.21, 0.81], so no trimming bites
8. With zero adjustment, the naive estimate is biased down by half a month
9. DoubleML's doubly-robust score is correct if *either* nuisance is correct
10. Six lines of DoubleML, with random-forest nuisances and 5-fold cross-fitting
11. DoubleML closes 79% of the bias and its CI now covers the truth
12. The effect is not flat: GATE falls from 7.5 to 2.9 as Dutch proficiency rises
13. The causal forest goes one level deeper: one effect estimate per person
14. Individual effects shift left with proficiency — heterogeneity, person by person
15. Right tool, right job: DoubleML for the ATE, the forest for ranking
16. Welfare is the per-person sum of treated effects net of cost
17. A simple IATE rule recovers 99.5% of oracle welfare
18. The payoff in one panel: targeting beats treating everyone
19. Does LASSO-style flexibility make this causal? No — the assumption still carries it
20. Estimate the average, learn the individual, then assign by who benefits.

**Verdict:** coherent abstract. Read in order the titles narrate the full Tension→Investigation→Resolution arc. The only label-style title is "Where we're going" (slide 3), an accepted agenda preview.

---

## Positive highlights

- Slide 7's title "Overlap holds: propensities stay inside [0.21, 0.81], so no trimming bites" states the diagnostic *and* its consequence in one assertion — the listener gets the verdict before the figure.
- The Act-II big-number slides (8, 11, 17) externalise prose to `::: {.notes}` and keep only a `[.bignum]` + one label line on screen — exactly the write-slides "slide serves the spoken word" law.
- Slide 19 is a genuine Devil's-Advocate slide ("Does LASSO-style flexibility make this causal? No"), steelmanning the objection then separating *estimation* from *identification* — the design contract's required move for a seminar deck.
- Closing slide 20 is a single declarative sentence ("Estimate the average, learn the individual, then assign by who benefits."), not "Questions?"/"Thank you".
- Math is consistently LaTeX `$…$` on-slide (19 MathJax spans render), with no `\_` subscript hazard and no stray currency `$`.

---

## Priority action items

1. **[MED]** Shorten slide 2's second on-slide sentence (slides.qmd:56) to two ~9-word lines; push the detail to `::: {.notes}`.
2. **[MED]** Split slide "Three estimands" `.comment` (slides.qmd:89) into two short lines; replace the nominalised "Skipping … is the mistake" with an active imperative.

Only two MEDs; no HIGH. Both are quick on-slide trims.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_cml

To re-check just the dimension you fixed:

    /project:review-slides python_cml focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical)
- Tooling notes: slide-audit.cjs reported 5 "OVERFLOW" + 23 "dense" slides — both are the documented cumulative-measurement artifact (it measures `section.present`, which for stacked vertical sub-slides captures the parent stack + hidden speaker-notes). A per-`Reveal.getCurrentSlide()` re-check at 1280×720 found **0 real overflow** and **0 raw-LaTeX**, so neither the Dim-9 overflow floor nor the Dim-5 density floor fires.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
