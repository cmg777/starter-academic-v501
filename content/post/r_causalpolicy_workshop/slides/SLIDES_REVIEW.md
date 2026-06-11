# Review: r_causalpolicy_workshop Slide Deck

**Audited:** content/post/r_causalpolicy_workshop/slides/
**Source of truth:** content/post/r_causalpolicy_workshop/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is a strong, faithful deck. Every number on every slide traces cleanly to the source post; math typesets via MathJax with no Goldmark-style `\_` escaping leaking in (the deck correctly uses plain `_` subscripts); the branding files are byte-identical to the canonical templates; and no slide overflows the 1280×720 box. The strongest dimension is source fidelity (all 21 numeric/figure data trace to `index.md`); the weakest is readability (two `.comment` lines run slightly long, both structured label-contrasts that the rules permit) — but neither rises above LOW. The assertion titles read in sequence as a coherent abstract, and the closing slide is a single declarative sentence. No fix is required to promote to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | none    | all 21 numbers/figures trace to source |
| 2  | Conceptual correctness        | 10         | none    | ATT named throughout; no overclaiming  |
| 3  | Technical & render correctness| 10         | none    | smoke-test PASS (15/15); math renders   |
| 4  | Title↔body consistency        | 10         | none    | assertion-title test passes            |
| 5  | Readability & simplicity      | 9          | 1 L     | 1 long comment line; all slides ≤71 words |
| 6  | Typos & grammar               | 10         | none    | em-dashes used; terminology consistent |
| 7  | write-slides design adherence | 10         | none    | 3-act arc, Devil's-Advocate, declarative close |
| 8  | Branding integrity            | 10         | none    | scss + title-slide diffs clean         |
| 9  | Accessibility & legibility    | 10         | none    | overflow none (per-slide @1280×720)    |
| 10 | Deliverable completeness      | 10         | none    | link ok (`slides/index.html`); files ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | LOW      | slides.qmd:172 — "ITS extrapolates…" | 22-word `.comment` line packs two ideas      | Optional split; see rewrite (deferred — acceptable as-is) |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "ITS extrapolates California's own pre-trend: a straight line gives −28 packs"**

Before:
> Identifying assumption: the pre-trend has the right *shape*. No comparison unit, so it can't separate policy from secular decline.

After:
> Assumption: the pre-trend has the right *shape*. No comparison unit — so it can't separate policy from the secular decline.

Why: 22 words across two sentences; the rewrite is a structured two-label contrast (permitted) and is marginally tighter. This is LOW and optional — the original is already a legitimate label-form contrast, so it was left unchanged.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                         | Value on slide | Source location                  | Match |
|-------------------------------------|----------------|----------------------------------|-------|
| Title-strip: SCM ATT                 | −18.9          | index.md:1362 (−18.85), :1423    | ✓     |
| Title-strip: ARIMA flip              | +4.5           | index.md:1362 (4.55), :1421      | ✓     |
| Title-strip: Fisher exact p          | 0.026          | index.md:1173, :1239             | ✓     |
| Smoking fell 48% / 116→60 packs      | 48% / 116 / 60 | index.md:68, :72, :541           | ✓     |
| Naive pre-post mean (1984–88)        | 98.98          | index.md:600, :604               | ✓     |
| Naive post-period shift              | −27.02 (SE 5.30)| index.md:602, :604              | ✓     |
| DiD vs Nevada                        | −5.7 (p=0.31)  | index.md:675 (−5.68), :678       | ✓     |
| ITS growth-curve estimate            | −28.3          | index.md:749 (−28.28), :752      | ✓     |
| ITS growth pre-trend slope / R²      | −1.78 / 0.74   | index.md:733, :736 (R²=0.735)    | ✓     |
| ITS ARIMA estimate                   | +4.5           | index.md:814 (4.55), :817        | ✓     |
| ARIMA order                          | (1,2,0)        | index.md:793, :802               | ✓     |
| RDD level break                      | −20.06 (SE 5.59, p=0.001) | index.md:868, :875     | ✓     |
| RDD slope change                     | −1.49 packs/yr | index.md:869, :876               | ✓     |
| RDD R²                               | 0.97           | index.md:878 (0.973), :198 fig   | ✓     |
| SCM ATT                              | −18.85         | index.md:1084, :1087             | ✓     |
| Donor weights (Utah 34/Nev 24/…)     | 34/24/21/15/6  | index.md:1029, :1236             | ✓     |
| V-matrix top predictors              | 0.468 / 0.412 (88%) | index.md:1018-1019, :1031   | ✓     |
| Balance: CA / synth / donor (1988)   | 90.1 / 91.4 / 114.2 | index.md:1109, :1112        | ✓     |
| MSPE ratio / next state              | 123.9 / 47.2 (>2.5×) | index.md:1166, :1173        | ✓     |
| CausalImpact ATT + posterior prob    | −13 / 92%      | index.md:1320-1326, :1331        | ✓     |
| Cross-method forest estimates        | −27/−5.7/−28.3/+4.5/−20.1/−18.9/−12.8 | index.md:1362, :1386-1392 | ✓ |

Every datum matches. Zero ✗.

Note: CausalImpact appears as "−13" on its method slide (matching the `summary()` printout, index.md:1320) and "−12.8" on the forest/Act-III table (matching the stored tibble value −12.82, index.md:1362). Both values are present in the source for those two distinct contexts, so each slide is individually faithful; the apparent −13/−12.8 split mirrors the post exactly and is not a defect.

---

## Title sequence (assertion-title test)

1. California's smoking fell 48% after Proposition 99 — but how much was the tax?
2. One dataset, six estimators — and they disagree from −28 to +4.5 packs
3. Where we're going
4. Causal inference is a missing-data problem: we never see Y(0) for treated California
5. The target is the ATT on California, not the population-wide ATE
6. The shared logic: effect = observed − counterfactual; only the counterfactual differs
7. Naive pre-post overstates the effect at −27 packs — it has no counterfactual at all
8. DiD against Nevada collapses to −5.7 packs — a single bad control destroys the contrast
9. ITS extrapolates California's own pre-trend: a straight line gives −28 packs
10. Swap the line for an AICc-chosen ARIMA and the effect flips sign to +4.5 packs
11. Why the ARIMA counterfactual misfires: it forecasts below what California actually did
12. RDD-on-time finds a −20 pack level break right at 1989
13. Synthetic control blends donors instead of picking one: −18.9 packs
14. Synthetic California is five states, anchored on lagged cigarette sales
15. Six lines fit synthetic control end-to-end with `tidysynth`
16. The matching works: synthetic California nails the pre-period the donor average misses
17. Inference without a standard error: California ranks 1st of 39, Fisher exact p = 0.026
18. CausalImpact hands the donors to a Bayesian model: −13 packs, 92% posterior probability
19. Five of six methods converge on a 13–20 pack reduction — the disagreement is informative
20. The synthetic-control ATT is −18.9 packs, robust where single comparisons fail
21. Does machine-selected matching make this causal? No — assumptions still carry the weight
22. The choice of counterfactual — not the data — is the design decision that moves the answer.

**Verdict:** coherent abstract — the titles alone narrate the puzzle, the six methods in escalating discipline, and the resolution. Every title is an assertion, not a label.

---

## Positive highlights

- Slide 7's title "Naive pre-post overstates the effect at −27 packs — it has no counterfactual at all" states the method's result *and* its flaw in one line — the assertion-title ideal.
- The math is correctly de-Goldmarked: the post writes `$Y\_{it}(0)$` (Goldmark-escaped), but the deck writes plain `$Y_{it}(0)$`, so MathJax renders the subscripts instead of breaking them. This is the single most common slide-deck render bug, and it is absent here.
- The 3-act arc is explicit (Tension / Investigation / Resolution dividers in brand orange/blue/teal), and the Devil's-Advocate slide (21) steelmans the objection rather than strawmanning it.
- The closing slide (22) is one declarative sentence — "The choice of counterfactual — not the data — is the design decision that moves the answer." — not "Questions?" / "Thank you".

---

## Priority action items

1. **[LOW]** Optionally tighten the slide-9 `.comment` line (Issue #1); the current label-form contrast is acceptable as-is, so no change is required.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_causalpolicy_workshop

To re-check just the dimension you fixed:

    /project:review-slides r_causalpolicy_workshop focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel) — per-slide walk at 1280×720 via `_perslide.cjs`
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: `slide-audit.cjs` reported 6 "overflow" + 25 "dense" slides, but these are the documented cumulative-across-vertical-substacks-and-notes artifact; the accurate per-current-slide walk at 1280×720 (notes stripped) shows 0 overflow and a max of 71 visible words per slide.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
