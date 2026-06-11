# Review: r_basic_synthetic_control Slide Deck

**Audited:** content/post/r_basic_synthetic_control/slides/
**Source of truth:** content/post/r_basic_synthetic_control/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** The deck is faithful to the source post — every number, table cell, figure, equation, and code snippet traces cleanly to `index.md`, and the smoke-test passes 15/15 with branding byte-identical to the canonical templates. The strongest dimension is **source fidelity** (every datum verified); the weakest is **readability/legibility**, where the browser pass flags 9 table-heavy slides as overflowing the 720 px box and several method slides stack a full prose sentence under the equation that belongs in speaker notes. No single fix is a blocker; tightening the equation-slide prose and the opening hook into anchor lines (moving the explanatory sentences to `::: {.notes}`) would promote it to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 20+ numbers/figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | ATT estimand explicit; no overclaim    |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders y; 0 raw LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 7          | 1M      | equation slides stack a body sentence  |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; terms consistent    |
| 7  | write-slides design adherence | 9          | 1L      | Devil's-Advocate present; arc clean    |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                   |
| 9  | Accessibility & legibility    | 6          | 2M      | 9 table slides overflow box (centered) |
| 10 | Deliverable completeness      | 10         | 0       | link ok (`slides/index.html`); files ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 9   | MED      | slides 13–21 (browser pass)       | 9 data/table slides overflow the 720 px box (table + heading + `.comment` line under `center:true`) | Trim the `.comment` gloss on the densest table slides to one short line; the tables themselves are correct and must stay |
| 2  | 5   | MED      | slide — "The estimand is the ATT…" (slides.qmd:87) | Full explanatory sentence on slide under the equation duplicates the speaker note | Keep a short gloss line; the long explanation already lives in `::: {.notes}` |
| 3  | 9   | MED      | slide — "The match is excellent…" (slides.qmd:184–198) | 5-row predictor table + heading + `.comment` is the tightest slide; flagged overflow | Tighten the `.comment` to a single 8–10 word line |
| 4  | 5   | LOW      | slide — "We never see the Basque economy…" (slides.qmd:50–56) | Opening hook stacks 3 sentences across two prose blocks | Acceptable Act-I hook; optionally shorten the second block to one anchor line |
| 5  | 7   | LOW      | slide — "Where we're going" (slides.qmd:70–77) | Act-I agenda list; design guide prefers a hook over an agenda in Act I | Keep — it follows the figure hook and the tension slide, so the agenda lands after the hook, not before |

Order: MED first, then LOW. Numbered consecutively.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide "The estimand is the ATT: the gap from the counterfactual we never see"**

Before:
> The treatment effect at year $t$ is actual Basque GDP $Y_{1t}$ minus the no-conflict counterfactual $Y_{1t}^{N}$.

After:
> Treatment effect = actual GDP minus the no-conflict counterfactual $Y_{1t}^{N}$.

Why: 18 words → 9; drops the redundant "at year $t$ … actual Basque GDP $Y_{1t}$" already shown in the equation above it.

**Issue #4 — slide "We never see the Basque economy *without* the conflict"**

Before:
> The Basque GDP path we *did* observe is only half the story. The path it *would* have followed without conflict — the counterfactual — was never recorded. *How do you measure a road not taken?*

After:
> The path we observed is only half the story. The path without conflict — the counterfactual — was never recorded. *How do you measure a road not taken?*

Why: trims "Basque GDP … *did* … *would* have followed"; keeps the rhetorical question that closes the hook.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                         | Value on slide | Source location          | Match |
|-------------------------------------|----------------|--------------------------|-------|
| ATT (headline)                      | −0.580         | index.md:482, 570        | ✓     |
| Peak gap year/value                 | −1.04 / −1.036 in 1989 | index.md:480–482   | ✓     |
| Active donors                       | 2 of 16        | index.md:395, 582        | ✓     |
| Catalonia weight                    | 0.851          | index.md:447, 454        | ✓     |
| Madrid weight                       | 0.149          | index.md:448, 454        | ✓     |
| Pre-treatment loss V                | 0.0089         | index.md:396             | ✓     |
| Pre-treatment loss W (MSPE)         | 0.2467         | index.md:397             | ✓     |
| Predictor GDP/capita treat/synth/donor | 5.28 / 5.27 / 3.58 | index.md:425       | ✓     |
| School (primary) %                  | 85.9 / 82.3 / 80.9 | index.md:420        | ✓     |
| Industry share %                    | 45.1 / 37.6 / 22.4 | index.md:428        | ✓     |
| Agriculture share %                 | 6.84 / 6.18 / 21.4 | index.md:426        | ✓     |
| Pop. density 1969                   | 247 / 196 / 99.4 | index.md:432          | ✓     |
| Catalonia placebo pre/post/ratio    | 0.006 / 0.391 / 64.7 | index.md:504–506  | ✓     |
| Basque own ratio                    | 60.1           | index.md:509, 556        | ✓     |
| In-space rank (trimmed)             | 2 of 8         | index.md:560             | ✓     |
| Pseudo p (trimmed)                  | 0.250          | index.md:560             | ✓     |
| Smallest possible pseudo p          | 0.125          | index.md:572             | ✓     |
| Panel dimensions                    | 18 regions, 43 yr, 13 predictors, 774 rows | index.md:286, 363 | ✓ |
| 8% income shortfall                 | 8%             | index.md:482, 570        | ✓     |
| Estimand equation                   | $\alpha_{1t}=Y_{1t}-Y_{1t}^{N}$ | index.md:335 | ✓     |
| Estimator equation                  | $\hat\alpha_{1t}=Y_{1t}-\sum_{j=2}^{18}w_j^* Y_{jt}$ | index.md:341 | ✓ |
| Figure 01 raw GDP paths             | ../r_basic_synthetic_control_01_raw_gdp_paths.png | index.md:325 | ✓ |
| Figure 02 actual vs synthetic       | ../r_basic_synthetic_control_02_basque_vs_synthetic.png | index.md:474 | ✓ |
| Figure 03 gap plot                  | ../r_basic_synthetic_control_03_gap_plot.png | index.md:480 | ✓ |
| Figure 04 in-space placebo          | ../r_basic_synthetic_control_04_inspace_placebo.png | index.md:564 | ✓ |

No ✗. Every slide datum has a matching source location.

---

## Title sequence (assertion-title test)

1. We never see the Basque economy *without* the conflict
2. One treated region, no clean comparison — until we build one
3. Where we're going
4. The estimand is the ATT: the gap from the counterfactual we never see
5. The estimator replaces the counterfactual with a weighted donor recipe
6. The lab: 18 regions, 43 years, 13 predictors, treatment in 1970
7. Two nested optimizations: inner picks the recipe, outer picks what matters
8. `dataprep()` then `synth()` — the whole estimation is two calls
9. The optimizer keeps just 2 of 16 donors — a sparse, readable recipe
10. The synthetic Basque is 85% Catalonia and 15% Madrid
11. The match is excellent where it matters — pre-1970 GDP and education
12. Before 1970 the lines are one; after 1970 they split apart
13. The gap is the cost — peaking at −1.04 thousand USD in 1989
14. The conflict cost the Basque Country −0.580 thousand USD per capita per year
15. A single placebo isn't enough — Catalonia's ratio is nearly as big
16. In the comparable-fit placebos, the Basque ranks 2 of 8
17. The placebo is suggestive, not decisive — read it with the donor weights
18. Match the pre-treatment, build the counterfactual, read the gap.

**Verdict:** coherent abstract. Titles read alone trace the full arc: problem → estimand → estimator → data → algorithm → code → recipe → fit → gap → ATT → falsification → caveat → thesis. "Where we're going" (slide 3) is the only label-style title, justified as the Act-I agenda after the figure hook.

---

## Positive highlights

- Slide 9's assertion title "The optimizer keeps just 2 of 16 donors — a sparse, readable recipe" states the finding and its interpretation in nine words, then the table proves it.
- The headline slide ("−0.580 … per year", slides.qmd:220) uses a dark `#141413` background with a single big number and a one-line gloss tying it to the 8% shortfall — exactly the Act-III headline pattern.
- The Devil's-Advocate slide ("The placebo is suggestive, not decisive", slides.qmd:252) is a genuine steelman: it names the Catalonia-dominance objection and answers it without dismissing it, with the rank-2-of-8 and pseudo-p = 0.125 caveats intact.
- The closing divider is one declarative sentence — "Match the pre-treatment, build the counterfactual, read the gap." — not "Questions?" / "Thank you".

---

## Priority action items

1. **[MED]** Trim the `.comment` gloss lines on the densest table slides (predictor-balance, donor-weights, diagnostics) to one short line so the centered table + heading clears the 720 px box (Issues #1, #3).
2. **[MED]** Shorten the explanatory sentence under the estimand equation; the long version is already in the speaker note (Issue #2).
3. **[LOW]** Optionally tighten the opening-hook second block to one anchor line (Issue #4).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_basic_synthetic_control

To re-check just the dimension you fixed:

    /project:review-slides r_basic_synthetic_control focus: readability

---

## Audit metadata

- Node version: (system node)
- Playwright: enabled
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: Browser pass per-slide word counts are cumulative across speaker notes (a known slide-audit artifact); the actionable signal is the 9 OVERFLOW flags on the table slides, not the raw word totals.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
