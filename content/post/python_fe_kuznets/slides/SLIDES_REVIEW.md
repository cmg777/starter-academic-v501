# Review: python_fe_kuznets Slide Deck

**Audited:** content/post/python_fe_kuznets/slides/
**Source of truth:** content/post/python_fe_kuznets/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** A faithful, on-brand, well-paced deck: every number on every slide traces to the source post, the 3-act Tension→Investigation→Resolution arc is clean, assertion titles read as a coherent abstract, and a Devil's-Advocate slide guards against causal overclaiming. Strongest dimension is source fidelity (all 24 audited values match the post); weakest is a single derived "16×" multiplier on one title that the post never states verbatim (a LOW, faithfully roundable from 0.142/0.009 = 15.8). Math renders on every slide (0 raw-LaTeX), smoke-test passes 15/15, branding files are byte-identical, and no slide overflows once hidden speaker-notes are excluded.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                       |
|----|-------------------------------|-----------:|--------:|---------------------------------------------|
| 1  | Source fidelity               | 9          | 0H/0M/1L| all 24 numbers/figures trace to source; one derived "16×" |
| 2  | Conceptual correctness        | 10         | 0       | estimand stated as within-country association, not ATE |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; 0 raw-LaTeX |
| 4  | Title↔body consistency        | 9          | 0H/0M/1L| assertion-title test passes; one-line-formula title slightly loose |
| 5  | Readability & simplicity      | 8          | 0H/0M/2L| dense slide-1 hook + table-row caption; both defensible |
| 6  | Typos & grammar               | 10         | 0       | em-dashes throughout; no double-hyphen prose |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc, Devil's-Advocate, one-sentence close all present |
| 8  | Branding integrity            | 10         | 0       | site-brand.scss + title-slide.html byte-identical |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none (notes-excluded recheck); every figure captioned |
| 10 | Deliverable completeness      | 10         | 0       | url: slides/index.html (no trailing slash); 6/6 figures resolve |

---

## Issues found

| #  | Dim | Severity | Location                                                        | Issue                                                                 | Suggested fix                                              |
|---:|----:|----------|-----------------------------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------|
| 1  | 1   | LOW      | slide — "The honest fit is the within-R², and it rises 16× from linear to cubic" (slides.qmd:178) | "16×" is a derived multiplier (0.142/0.009 = 15.8) not stated in the post; the post phrases it as 0.142 vs 0.009 | Reword the title to the two within-R² values the post and the slide's own table report |
| 2  | 4   | LOW      | slide — "Two-way FE in PyFixest is a one-line formula" (slides.qmd:154) | Body shows a formula that wraps to two visual lines; title says "one-line" | Acceptable (it is one logical line / one call); keep, or say "one-line call" |
| 3  | 5   | LOW      | slide 1 — "Does growth cut inequality…" (slides.qmd:52,56)      | Two prose sentences on the opening hook (180-country setup)           | Deliberate Act-I hook; acceptable. Optionally trim the second sentence to the question only |

Order: HIGH first, then MED, then LOW. No HIGH or MED issues.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 1 "Does growth cut inequality, or just move it around? Kuznets predicted an inverted-U"**

Before:
> But that curve was fitted on a handful of rich nations. With satellite-lights data on **180 countries**, does the inverted-U still hold? *Or does the story have a third act?*

After (keep one anchor question on the slide; move the setup to notes):
> With satellite-lights data on **180 countries**, does the inverted-U still hold — or is there a third act?

Why: two sentences → one; the "fitted on a handful of rich nations" context belongs in the speaker's mouth (notes), not on the slide. This is a deliberate Act-I hook, so the change is optional polish, not a blocker.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                  | Value on slide        | Source location                  | Match |
|----------------------------------------------|-----------------------|----------------------------------|-------|
| Within-R² (title strip)                      | 0.142                 | index.md:577                     | ✓     |
| First turning point (title strip)            | $2,287                | index.md:634                     | ✓     |
| Ethnic-Gini coefficient (title strip)        | 0.071                 | index.md:714,778                 | ✓     |
| Countries / periods / rows                   | 180 / 5 / 880         | index.md:354-358                 | ✓     |
| Panel unbalanced                             | 168 → 180             | index.md:357                     | ✓     |
| Income range                                 | $190 to $117,000      | index.md:360                     | ✓     |
| Mean Gini / SD                               | 0.064 / 0.033         | index.md:360                     | ✓     |
| Pooled OLS cubic terms                       | 0.241 / −0.028 / 0.001| index.md:493-494,498             | ✓     |
| Pooled OLS R²                                | 0.164 / 0.170 / 0.176 | index.md:495                     | ✓     |
| Pooled linear β₁                             | −0.011                | index.md:491 (−0.0108)           | ✓     |
| Cubic TWFE terms                             | 0.293 / −0.032 / 0.001| index.md:574-576                 | ✓     |
| Cubic TWFE p-values                          | all p < 0.001         | index.md:574-576                 | ✓     |
| Cubic TWFE within-R²                         | 0.142                 | index.md:577                     | ✓     |
| Overall R²                                   | 0.975                 | index.md:577                     | ✓     |
| Linear TWFE β₁ / p / within-R²               | −0.003 / 0.265 / 0.009| index.md:601-603                 | ✓     |
| OLS vs FE linear term                        | 0.293 vs 0.241        | index.md:581,668                 | ✓     |
| Turning points (USD)                         | $2,287 / $77,205      | index.md:634                     | ✓     |
| Turning points (log)                         | 7.735 / 11.254        | index.md:633                     | ✓     |
| Paper thresholds                             | $2,288 / $77,128      | index.md:637                     | ✓     |
| Ethnic coeff multiple                        | 3.9× next-largest     | index.md:758,778                 | ✓     |
| Arable land / school / rents / trade / aid   | −0.053 / −0.014 / 0.018 / 0.005 / 0.015 | index.md:714,716     | ✓     |
| Gasoline×area interaction                    | 0.006                 | index.md:718                     | ✓     |
| Ethnicity attenuation of linear term         | 0.293 → 0.149         | index.md:750,766                 | ✓     |
| Sign pattern across 6 specs                  | (+, −, +)             | index.md:750                     | ✓     |
| Within-R² range across specs                 | 0.01–0.28             | index.md:768                     | ✓     |
| Figure: scatter pooled                       | ../kuznets_scatter_pooled.png | index.md:424              | ✓     |
| Figure: spaghetti                            | ../kuznets_spaghetti.png      | index.md:541              | ✓     |
| Figure: OLS vs FE                            | ../kuznets_ols_vs_fe.png      | index.md:666              | ✓     |
| Figure: fitted curve                         | ../kuznets_fitted_curve.png   | index.md:641              | ✓     |
| Figure: determinants barplot                 | ../kuznets_determinants_barplot.png | index.md:756        | ✓     |
| Figure: coefficient stability                | ../kuznets_coefficient_stability.png | index.md:748       | ✓     |
| "16×" linear→cubic within-R² jump            | 16×                   | derived 0.142/0.009=15.8 (not verbatim) | ~ (LOW, issue #1) |

Every figure resolves on disk (smoke-test 6/6). The one `~` row is issue #1.

---

## Title sequence (assertion-title test)

1. Does growth cut inequality, or just move it around? Kuznets predicted an inverted-U
2. Pooled across 180 countries, the cloud bends twice — an N, not a single hump
3. The lab: 180 countries × 5 periods, 880 rows, a lights-based regional Gini
4. To bend twice, the model needs a cubic in log income
5. Pooled OLS sees the N-shape, but only barely — every term is near-insignificant
6. Each country walks its own path — the pooled curve is a mirage
7. Fixed effects compare a country to itself: wipe the lens twice
8. With both FE imposed, all three cubic terms turn highly significant
9. The honest fit is the within-R², and it rises 16× from linear to cubic
10. Fixed effects don't just sharpen the N — they tighten it
11. The fitted curve bends twice — peaking at $2,287, troughing at $77,205
12. Three development phases, one association — not a causal effect
13. Beyond income, ethnic inequality is the strongest driver — by far
14. The N survives every control set — its sign pattern never breaks
15. Does machine-assembled FE make this causal? No
16. Force a straight line through an N and you'll conclude growth does nothing — fit the cubic, fix the effects.

**Verdict:** coherent abstract — the titles alone tell the full story (problem → pooled hint → why FE → FE result → turning points → determinants → robustness → causal caveat → takeaway).

---

## Positive highlights

- Slide 7's assertion title "Fixed effects compare a country to itself: wipe the lens twice" previews the two-way FE identification in eight plain words, and the two-column α_i / γ_t layout maps each wipe to a concrete confounder set.
- Slide 12 "Three development phases, one association — not a causal effect" states the estimand (within-country conditional association) in the title itself, pre-empting the causal-overclaim trap before the Devil's-Advocate slide reinforces it.
- The title key-result strip (0.142 · $2,287 · 0.071) front-loads the three numbers a listener should leave with, and all three render cleanly (currency $ is literal, not broken math).
- Closing divider is a single declarative sentence ("Force a straight line through an N and you'll conclude growth does nothing — fit the cubic, fix the effects."), not "Questions?" / "Thank you".

---

## Priority action items

1. **[LOW]** Reword slide-9 title to cite the two within-R² values (0.009 → 0.142) instead of the derived "16×" multiplier, keeping it source-verbatim.
2. **[LOW]** Optionally trim the slide-1 hook to a single question line and let the "handful of rich nations" context live in the speaker notes.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_fe_kuznets

To re-check just the dimension you fixed:

    /project:review-slides python_fe_kuznets focus: fidelity

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical)
- Tooling notes: slide-audit.cjs reported 6 overflow + 22 dense slides, all confirmed to be the documented cumulative-traversal / hidden-speaker-notes artifact; a notes-excluded, fragment-forced re-check at 1280×720 found 0 real overflow. raw-latex = 0 (the only load-bearing browser signal) on every slide.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
