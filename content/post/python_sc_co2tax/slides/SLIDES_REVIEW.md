# Review: python_sc_co2tax Slide Deck

**Audited:** content/post/python_sc_co2tax/slides/
**Source of truth:** content/post/python_sc_co2tax/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is a strong, faithful deck. Every number on every
slide traces to the source post, math renders cleanly (zero raw LaTeX), the
branding files are byte-identical to the canonical templates, and prose lives in
speaker notes while slides carry assertion-title anchors plus single-line glosses.
The strongest dimension is source fidelity (all ~25 numeric claims verified); the
weakest was a single MathJax-safety nit — a bare `$233` in one slide title that
should be escaped `\$233` for consistency with the rest of the deck. That one MED
item was fixed. No blocker remained.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers/figures/equations trace to index.md |
| 2  | Conceptual correctness        | 10         | 0       | ATT named; convex-hull/no-parallel-trends correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); 0 raw-LaTeX slides |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes (coherent abstract) |
| 5  | Readability & simplicity      | 8          | 0H/0M/2L| 2 `.comment` glosses 22–24 words (LOW) |
| 6  | Typos & grammar               | 10         | 0       | consistent CO2 / optimiser / urbanisation |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc, Devil's-Advocate, 1-sentence close |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide diffs clean (byte-identical) |
| 9  | Accessibility & legibility    | 10         | 0       | every figure captioned; no genuine overflow |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html`; all files present |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 3   | MED      | slides.qmd:203 — "Was it just a recession?" | Bare `$233` in an on-slide title; MathJax-enabled DOM. Renders literally only because the slide has no second `$`, but it is fragile and inconsistent with the deck's own table (`\$233`, l.276) and the post (`\\$233`). | Escape to `\$233`. **(FIXED)** |
| 2  | 5   | LOW      | slides.qmd:92 — `.comment` gloss  | 24-word single sentence with a colon + relative clause. | Split into two short clauses. **(FIXED)** |
| 3  | 5   | LOW      | slides.qmd:217 — `.comment` gloss | 22-word gloss (already two short sentences). | Acceptable as-is; left unchanged. |

Order: HIGH first, then MED, then LOW.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide "The lab: 15 OECD economies…" (slides.qmd:92)**

Before:
> A long pre-period is a structural advantage: it lets us check the counterfactual *before* the policy, where we know the gap should be zero.

After:
> The long pre-period is a structural advantage. It lets us check the counterfactual *before* the policy — where the gap should be zero.

Why: 24-word single sentence with colon + "where" clause → two short statements; reads as natural speech.

**Issue #3 — slide "Pass-through is complete…" (slides.qmd:217)**

Before:
> If oil firms had absorbed the tax, the price signal never reaches drivers. They didn't — so the behavioural channel is real.

After:
> (no change — already two short sentences; the conditional is the point)

Why: 22 words but already split into two clean sentences; tightening would strip the cause-and-effect framing.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide | Source location            | Match |
|--------------------------------------|----------------|----------------------------|-------|
| Title-strip: synthetic gap / yr      | −11.3%         | index.md:491, 860          | ✓     |
| Title-strip: tax vs price            | 3×             | index.md:738, 891          | ✓     |
| Title-strip: donor countries         | 6              | index.md:450               | ✓     |
| Naive Sweden pre/post                | +0.55          | index.md:336 (0.5522)      | ✓     |
| DiD vs Denmark ATT                   | −0.140         | index.md:379 (−0.1399)     | ✓     |
| DiD vs Denmark SE / p                | 0.116 / 0.23   | index.md:372/381 (0.1157/0.2297) | ✓ |
| DiD vs OECD ATT / SE / p             | −0.214 / 0.083 / 0.02 | index.md:376/381 (−0.2137/0.0825/0.0214) | ✓ |
| Donor weights (DK .29 BE .27 NZ .15 GR .11 US .10 CH .08) | as listed | index.md:441–447 (0.289…0.079) | ✓ |
| Six donors = 100% of weight          | 100%           | index.md:450               | ✓     |
| 2005 gap                             | −0.36 t (−15%) | index.md:490               | ✓     |
| Average post gap                     | −0.27 t / −11.3% | index.md:491             | ✓     |
| "one ton every 3.7 years"            | 3.7 yr         | index.md:493               | ✓     |
| R-tutor cross-check                  | −10.9%         | index.md:493               | ✓     |
| In-space permutation p               | 0.067          | index.md:551 (0.0667)      | ✓     |
| "beats 14 of 15 placebos"            | 14 of 15       | index.md:861               | ✓     |
| Leave-one-out range                  | 8.8%–13%       | index.md:569               | ✓     |
| Drop Switzerland / Denmark           | 8.8% / 13%     | index.md:569               | ✓     |
| Synthetic-GDP weights (DK 61 NO 20 FI 10 US 9) | as listed | index.md:619–622 (.6131….0890) | ✓ |
| Synthetic-GDP gap by 2005            | < \$233/cap    | index.md:628               | ✓     |
| Pass-through coefficient / SE        | 1.15 / 0.15    | index.md:673               | ✓     |
| Pass-through 95% CI                  | [0.85, 1.45]   | index.md:673               | ✓     |
| Price semi-elasticity (OLS4)         | −0.060         | index.md:735               | ✓     |
| Tax semi-elasticity (OLS4)           | −0.186         | index.md:736               | ✓     |
| IV (oil) price elasticity            | −0.064         | index.md:789               | ✓     |
| IV tax elasticity (all specs)        | −0.186         | index.md:789               | ✓     |
| Carbon-tax-only 2005 wedge           | −0.57 t / ~75% | index.md:848               | ✓     |
| Avg carbon-tax-only effect           | 9.5%           | index.md:849               | ✓     |
| All 9 figures `../python_sc_co2tax_*.png` | resolve   | exist on disk + in post    | ✓     |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

1. Sweden's emissions *rose* 0.55 t/capita after the carbon tax — or did they?
2. The spoiler: Sweden flattens after 1990 while its synthetic twin keeps climbing
3. Where we're going
4. The lab: 15 OECD economies, 46 years, 30 of them before the reform
5. The estimand is the ATT: how much lower were Swedish emissions than a no-reform Sweden?
6. DiD against Denmark flips the naive sign — but parallel trends fail in the pre-period
7. Synthetic control chooses the donor weights by data, under two hard constraints
8. pysyncon picks the same six donors as Andersson's R code
9. Six donors carry 100% of the weight — Denmark and Belgium dominate
10. Pre-1990 the gap is near zero; post-1990 it widens monotonically to −0.36 t
11. The headline: −11.3% per year for 16 years
12. Falsification 1 — backdate the reform to 1980 and no fake gap appears
13. Falsification 2 — Sweden's gap beats 14 of 15 placebo countries, p = 0.067
14. Falsification 3 — drop any single donor and the effect stays in 8.8%–13%
15. Was it just a recession? Synthetic GDP overlaps actual GDP within \$233 by 2005
16. Pass-through is complete: consumers paid 1.15 of every tax krona at the pump
17. Consumers respond ~3× more strongly to a tax krona than to a price krona
18. IV barely moves OLS — and that itself is informative
19. The carbon tax alone explains ~75% of the 2005 reform wedge
20. One sentence: the tax cut CO2 ~11% a year, at no measurable cost to growth
21. The strongest objection — and the answer
22. A salient, persistent, fully passed-through carbon tax cut emissions — without cutting growth.

**Verdict:** coherent abstract — the titles read alone tell the entire Tension →
Investigation → Resolution story, each an assertion (not a label).

---

## Positive highlights

- Slide 5's title "The estimand is the ATT: how much lower were Swedish emissions
  than a no-reform Sweden?" names the estimand AND its plain-English meaning in the
  title — textbook assertion-title.
- The three falsification slides (12–14) carry the result IN the title
  ("no fake gap appears", "beats 14 of 15… p = 0.067", "stays in 8.8%–13%"), so a
  listener gets the robustness verdict at a glance.
- Prose discipline is exemplary: every explanatory paragraph sits in `::: {.notes}`;
  on-slide text is anchors, equations-with-one-line-glosses, and `.comment` lines.
- The Devil's-Advocate slide (21) steelmans the donor-pool p-floor and the
  stops-in-2005 limit, then answers with the convergence-of-evidence argument —
  exactly the design contract.
- Closing slide (22) is one declarative sentence resolving the Act-I hook; not
  "Questions?" / "Thank you".

---

## Priority action items

1. **[MED]** Escape the bare `$233` in the slide-203 title to `\$233`. **(DONE)**
2. **[LOW]** Tighten the 24-word `.comment` gloss on slide 4 (slides.qmd:92). **(DONE)**

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_sc_co2tax

To re-check just the dimension you fixed:

    /project:review-slides python_sc_co2tax focus: render

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs reported 8 "overflow" slides, but a per-current-slide
  re-check (scrollHeight vs clientHeight on `section.present` at 1280×720) found ZERO
  genuine overflow — the flags were the known cumulative-walk artifact. raw-latex
  slides: 0 (load-bearing signal — math typesets everywhere).

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only audit; fixes applied separately per the calling task.*
