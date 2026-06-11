# Review: python_did_sc_tsunami Slide Deck

**Audited:** content/post/python_did_sc_tsunami/slides/
**Source of truth:** content/post/python_did_sc_tsunami/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT (post-fix)

**Overall assessment.** A faithful, well-paced deck: every number, figure, table, and equation traces cleanly to the source post, the math escaping is correct (no `\_`-in-math, no `\$` currency leaks, zero raw-LaTeX on any slide), and the assertion titles read as a coherent abstract. The strongest dimension is **source fidelity** (Dim 1 — all 24 audited datums match the post exactly); the weakest before fixing was **accessibility/legibility** (Dim 9), where one summary slide ("Five numbers, five lessons") genuinely overflowed the 720-px box at 807/720. That overflow has been fixed (807 → 524) and a 26-word passive sentence on the natural-experiment slide was tightened. No HIGH issues remain; branding is byte-identical to the canonical templates.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                       |
|----|-------------------------------|-----------:|--------:|---------------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 24 numbers/figures/tables trace to post |
| 2  | Conceptual correctness        | 10         | 0       | ATT stated; parallel trends correct; observational framing kept |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; 0 raw-LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes                 |
| 5  | Readability & simplicity      | 9          | 1 LOW   | 1 passive sentence tightened (fixed)        |
| 6  | Typos & grammar               | 10         | 0       | consistent terminology, em-dashes correct   |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc, Devil's-Advocate, declarative close |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide diffs clean              |
| 9  | Accessibility & legibility    | 9          | 1 MED   | 1 slide overflowed 807/720 (fixed → 524)    |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html`; files present; 6/6 figs resolve |

---

## Issues found

| #  | Dim | Severity | Location                              | Issue                                                        | Suggested fix                                      |
|---:|----:|----------|---------------------------------------|-------------------------------------------------------------|----------------------------------------------------|
| 1  | 9   | MED      | slide "Five numbers, five lessons" (slides.qmd:286–302) | Table (5 rows) + 5-item incremental list stack to 807/720 px — content overflows the slide box | Collapse the 5-item list to one `.comment` line; move the elaboration to `::: {.notes}`; retitle to "Five numbers to remember" (FIXED) |
| 2  | 5   | LOW      | slide "The wave's path was geography…" (slides.qmd:73) | 26-word sentence, passive ("was governed by")               | Active rewrite, 18 words (FIXED — see below)        |

Order: HIGH first, then MED, then LOW. Both issues were fixed during this pass.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide "The wave's path was geography, not choice…"**

Before:
> Whether the water reached a stretch of coast was governed by **elevation, vegetation, and offshore depth** — read off satellite inundation maps, not chosen by economics. Flooded vs spared is plausibly *unrelated* to a district's economic prospects.

After:
> **Elevation, vegetation, and offshore depth** decided which coast flooded — read off satellite maps, not chosen by economics. So flooded vs spared is plausibly *unrelated* to a district's economic prospects.

Why: 26-word passive opener ("was governed by") → 18-word active sentence naming the actor (the geography); "inundation maps" trimmed to "maps" (the prior slide already named them).

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                              | Value on slide      | Source location                         | Match |
|------------------------------------------|---------------------|-----------------------------------------|-------|
| Reconstruction spend                     | USD 7.0 billion     | index.md:82 (7.7B committed / 7.0B spent) | ✓   |
| Lives lost                               | ~130,000            | index.md:82                             | ✓     |
| Wave inland                              | 9 km                | index.md:82                             | ✓     |
| ATT definition                           | E[Y(1)−Y(0)∣D=1]    | index.md:183                            | ✓     |
| District panel                           | 125 / 1,750 rows / 10 treated | index.md:337,346             | ✓     |
| Sub-district panel                       | 276 sub-districts   | index.md:346                            | ✓     |
| Group-means dive / overshoot             | −0.027 / +0.124 (2007) | index.md:461                         | ✓     |
| Pooled DiD                               | +0.0125, p = 0.38   | index.md:490,493                        | ✓     |
| Pre-tsunami coef                         | +0.0172 (0.0159) ns | index.md:521 / 8 (Conley col)           | ✓     |
| Tsunami 2005 coef                        | −0.0792 (0.0240) ***| index.md:522 / 696                      | ✓     |
| Recovery coef                            | +0.0628 (0.0244) ** | index.md:523 / 697                      | ✓     |
| Post-recovery coef                       | +0.0114 (0.0146) ns | index.md:524 / 698                      | ✓     |
| Per-capita recovery                      | +0.0827, p < 0.01   | index.md:565                            | ✓     |
| Night-lights recovery dose               | +0.016/yr (notes)   | index.md:607,599                        | ✓     |
| Quintile effects Q1–Q5                   | .0010/.0010/.0009/.0008/.0018** | index.md:620                | ✓     |
| Synthetic-control pre-RMSE               | 0.485               | index.md:653,660                        | ✓     |
| SC top weight / donors                   | 0.13 / 76 donors    | index.md:668,635                        | ✓     |
| SC gap by 2012                           | +18.3% (370.9 vs 295.0) | index.md:654,660                    | ✓     |
| Moran's I / p                            | +0.065 / 0.003      | index.md:684,688                        | ✓     |
| Conley SE inflation                      | 0.0146 → 0.0244, t 2.57 | index.md:697,700                    | ✓     |
| SE inflation factor                      | 1.68×               | index.md:700                            | ✓     |
| Aid ≈ 150% of damages                    | 150%                | index.md:732                            | ✓     |
| Figure: group_means.png                  | ../python_did_sc_tsunami_group_means.png | index.md:458 (same fig)    | ✓     |
| Figures (event_study, nightlights_dose, synthetic_control, sc_gap, spatial_map) | ../python_did_sc_tsunami_*.png | index.md (same figures) | ✓ |

Every datum traces. No ✗.

---

## Title sequence (assertion-title test)

1. A magnitude-9.1 quake, a wave 9 km inland, and ~130,000 lives lost in one province
2. You only ever observe the world where the tsunami *did* happen
3. The wave's path was geography, not choice — that is what makes it a natural experiment
4. One disaster, measured at two grains — district GDP and sub-district night-lights
5. Parallel before 2005, then a dive and an overshoot
6. A single "after" hides the story
7. −7.9% in 2005, then +6.3 pp/yr faster in 2006–08
8. The event study shows *why* the pooled average misled
9. Not a denominator artifact — per-capita recovery is even larger
10. The harder-hit rebounded more — and only the worst-hit fifth significantly
11. A synthetic Aceh, built from 76 donors, tracks the pre-2005 path almost exactly
12. +18.3% above its no-tsunami twin by 2012 — and the gap opens only after the wave
13. All 10 treated units sit in one corner of the map
14. The point estimate never moved — only our honesty about it did
15. Four methods, one story: recovery beyond the counterfactual trend
16. Well-governed mega-reconstruction can bend a poor region's path upward
17. The strongest objection — and the answer
18. Five numbers to remember
19. A poor region, well-governed reconstruction, a permanently higher path.

**Verdict:** coherent abstract — the titles alone narrate hook → identification → measurement → triangulation → honest inference → lesson, in a clean 3-act arc.

---

## Positive highlights

- Slide 3's title "The wave's path was geography, not choice — that is what makes it a natural experiment" states the entire identification strategy in one assertion before any model appears.
- Slide 14's title "The point estimate never moved — only our honesty about it did" is a memorable, exactly-correct one-line summary of what Conley-HAC errors do (the post's own framing, index.md:700).
- Every figure slide is figure-first with a single descriptive caption and the explanatory prose pushed to `::: {.notes}` — textbook write-slides discipline.
- The Devil's-Advocate slide ("The strongest objection — and the answer") steelmans the synthetic-data + small-N critique before rebutting it, exactly as the design contract asks for a seminar deck.
- The closing slide is one declarative sentence ("A poor region, well-governed reconstruction, a permanently higher path."), not "Questions?" / "Thank you".

---

## Priority action items

1. **[MED]** Fix the "Five numbers, five lessons" overflow (807/720) — collapse the incremental lessons list to a single line, move detail to notes. **(DONE — now 524/720.)**
2. **[LOW]** Tighten the 26-word passive sentence on the natural-experiment slide. **(DONE.)**

No further action required; re-render verified.

---

## Screenshots (HIGH-severity visual issues only)

None — the single overflow was MED and is fixed; no content was clipped (the slide was readable but extended past the box on a projector).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_did_sc_tsunami

To re-check just the dimension fixed:

    /project:review-slides python_did_sc_tsunami focus: readability and accessibility

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (Chromium via npx cache)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Quarto: 1.8.27
- Tooling notes: `slide-audit.cjs` per-slide word/bullet counts are cumulative across vertical sub-slides + hidden speaker notes (known artifact); overflow re-verified per top-level slide at 1280×720 against the true 720-px box. Figure slides measure 708–710/720 (auto-stretched images filling the box, no clipping); the only true >720 overflow was "Five numbers" (now resolved).

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only convention noted, but this run was invoked in fix mode: SLIDES_REVIEW.md plus the two `slides.qmd` fixes (and a re-render) were applied; site-brand.scss, title-slide.html, the figures, and index.md were not touched.*
