# Review: stata_sdid_staggered Slide Deck

**Audited:** content/post/stata_sdid_staggered/slides/
**Source of truth:** content/post/stata_sdid_staggered/index.md (+ results_report.md, analysis.log)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is a faithful, well-paced, on-brand deck. Every number, table cell, figure, and equation on a slide traces exactly to the source post, its `results_report.md`, or `analysis.log` — including the five cohort-table rows and their aggregation weights (0.170/0.298/0.277/0.117/0.043), which match the log's `agg_weight` column to the rounding shown. The strongest dimensions are source fidelity and technical render correctness: math typesets cleanly (no `\_`-in-math Goldmark bug, no raw LaTeX, no literal-currency escaping defect), the smoke test passes 15/15, and branding is byte-identical to the canonical templates. The weakest dimension is readability, and only marginally: two LOW judgment-call items (an Act-I agenda slide and a two-sentence styled footnote). No fix is required to promote to ACCEPT — the deck is already there.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                       |
|----|-------------------------------|-----------:|--------:|---------------------------------------------|
| 1  | Source fidelity               | 10         | 0       | every number/table/figure/equation traces to source |
| 2  | Conceptual correctness        | 10         | 0       | ATT estimand stated; TWFE-vs-SDID framing correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS 15/15; math renders; 0 raw-LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes; titles = abstract |
| 5  | Readability & simplicity      | 9          | 1 LOW   | 0 over-length, 0 dense, 0 overflow (per-slide) |
| 6  | Typos & grammar               | 10         | 0       | no `--`, consistent terminology, no typos found |
| 7  | write-slides design adherence | 9          | 1 LOW   | 3-act arc, Devil's-Advocate, 1-sentence close OK |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide diffs clean                |
| 9  | Accessibility & legibility    | 10         | 0       | all figures captioned; 0 overflow at 1280×720 |
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html`; files present; 7/7 png |

---

## Issues found

| #  | Dim | Severity | Location                              | Issue                                                        | Suggested fix                                  |
|---:|----:|----------|---------------------------------------|-------------------------------------------------------------|------------------------------------------------|
| 1  | 5/7 | LOW      | slide 1.3 — "Where we're going"       | Act-I agenda slide; design prefers a hook over an agenda     | Acceptable — it follows two genuine hook slides (1.1, 1.2). No change. |
| 2  | 5   | LOW      | slide 2.1 — "The lab: 119 countries…" | `.comment` footnote stacks two sentences                     | Acceptable — single styled footnote, keeps the on-slide "3%" anchor. No change. |

Both items are deferred judgment calls (see below), not defects. Order: HIGH first, then MED, then LOW.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide 2.1 "The lab: 119 countries × 26 years, 9 adopters across 7 cohorts"**

Before:
> Balanced panel: $119 \times 26 = 3{,}094$ observations. Treated country-years are scarce — only 3% of the panel.

After (optional, if a stricter one-sentence-footnote rule is enforced):
> Balanced panel: $119 \times 26 = 3{,}094$ observations — only 3% treated.

Why: collapses two sentences into one footnote line. **Deferred** — the current two-sentence form is a single `.comment` element (not stacked body prose), reads fine at a glance, and the "3% scarce" framing is pedagogically load-bearing. Changing it is a style preference, not a correction; left as-is per the "defer ambiguous" rule.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide            | Source location                          | Match |
|--------------------------------------|---------------------------|------------------------------------------|-------|
| Overall ATT                          | +8.03 (SE 3.74, t 2.15, p 0.032) | index.md:406, 410                  | ✓     |
| 95% CI                               | [0.70, 15.37]             | index.md:406 (0.70305, 15.36516)         | ✓     |
| Cohort range                         | −3.5 to +21.8             | index.md:81, 428                         | ✓     |
| Key-result strip                     | +8.03 · −3.5 to +21.8 · 9/7 | index.md:73, 79                        | ✓     |
| Cohort 2000 τ̂/SE/weight             | 8.39 / 0.68 / 0.170       | analysis.log:348 (8.388868/.6828/.1702)  | ✓     |
| Cohort 2002 τ̂/SE/weight             | 6.97 / 0.64 / 0.298       | analysis.log:349 (6.9677/.641/.2979)     | ✓     |
| Cohort 2003 τ̂/SE/weight             | 13.95 / 9.13 / 0.277      | analysis.log:350 (13.9523/9.129/.2766)   | ✓     |
| Cohort 2005 τ̂/SE/weight             | −3.45 / 0.76 / 0.117      | analysis.log:351 (−3.4505/.756/.1170)    | ✓     |
| Cohort 2012 τ̂/SE/weight             | +21.76 / 0.92 / 0.043     | analysis.log:357 (21.7627/.916/.0426)    | ✓     |
| Unweighted mean ≈ 7.0; 75% weight    | ≈ 7.0; 0.745 (2000/02/03) | index.md:199, 428; results_report.md:114 | ✓     |
| Covariate: optimized 8.05 SE 3.05    | 8.05 / 3.05               | index.md:453 (8.0515 / 3.0466)           | ✓     |
| Covariate: projected 8.06 SE 3.12    | 8.06 / 3.12               | index.md:454 (8.0593 / 3.1191)           | ✓     |
| Event study Effect_1 / Effect_2      | +4.1 / +9.2               | index.md:484-485, 501                    | ✓     |
| Placebo range (2002 cohort)          | [−0.22, +0.76]            | analysis.log:800-811 (−0.218 … +0.758)   | ✓     |
| 2002 path: synth ≈ 9–10%, gap ≈ +7   | ≈ 9–10%; +7 (τ̂₂₀₀₂=6.97) | index.md:434                             | ✓     |
| Inference SEs (subsample)            | boot 4.73 / jack 6.01 / plac 2.34 | index.md:538 (4.7291/6.0056/2.3404) | ✓     |
| Subsample ATT                        | 10.33                     | index.md:538                             | ✓     |
| Bignum strip SEs                     | 4.7 · 6.0 · 2.3           | index.md:554                             | ✓     |
| Panel: 119×26=3,094; 3% treated      | 3,094; 3%                 | index.md:247; codebook                   | ✓     |
| Sample mean ≈ 15%                    | mean ≈ 15%                | index.md:242 (womparl mean 14.97)        | ✓     |
| 110 never-treated; 80 donors (2000)  | 110; 80                   | index.md:295, 149                        | ✓     |
| All 7 figures `../stata_sdid_staggered_*.png` | 7 referenced     | resolve 7/7 on disk (smoke-test)         | ✓     |

No ✗. Every slide datum is verified against the post, results report, or execution log.

---

## Title sequence (assertion-title test)

1. Most real policies don't arrive on a single clock
2. Do gender quotas raise women's share of parliament? +8 points — but it hides a wide range
3. Where we're going *(agenda)*
4. The lab: 119 countries × 26 years, 9 adopters across 7 cohorts
5. The staircase: cohorts switch on one column at a time
6. The naive two-group picture is confounded — treated start below, then overtake
7. SDID is a *weighted* two-way fixed-effects regression
8. Unit weights ω build a synthetic control that tracks the treated trend
9. Time weights λ pick the "before" years most like the "after"
10. Three cousins, one table: SDID optimizes *both* weight axes
11. Staggered SDID: do the single-cohort analysis once per cohort, then average
12. The overall ATT is a non-negative, treated-period-weighted average
13. One command runs the whole staggered procedure
14. Compared only to never-treated controls, quotas raise women's share: ATT = +8.03
15. Behind the average: cohort effects swing from −3.5 to +21.8
16. One cohort up close: treated and synthetic overlap before 2002, then diverge
17. Controlling for income does *not* explain away the effect
18. The event study: flat placebos before, an immediate and persistent rise after
19. The dynamic effect, in one definition
20. Nine treated units unlock three rulers — same estimate, different error bars
21. Report the bootstrap — but cross-check it when treated units are few
22. Does machine-built weighting make this causal? No — assumptions still carry the weight
23. A single headline number summarizes real heterogeneity — weight the cohorts transparently
24. When policies arrive on different clocks, estimate each cohort cleanly — then weight, don't average blindly.

**Verdict:** coherent abstract. Strong assertion titles throughout (the lone label-ish "Where we're going" is a deliberate agenda after the hook). The closing slide is one declarative sentence.

---

## Positive highlights

- Slide 14's title "Compared only to never-treated controls, quotas raise women's share: ATT = +8.03" states both the identification safeguard and the headline number in one assertion.
- The cohort table (slide 15) discloses in its notes that 2010 and 2013 were dropped *to fit the slide* and points to the full `e(tau)` in the post — transparent omission, not a fabricated subset.
- Math fidelity is exact: the deck uses plain `_` subscripts (e.g. `$Y_{it}$`, `$\hat\tau_a$`) — the Goldmark `\_`-in-math bug that breaks MathJax on other Stata decks is absent here; `slide-audit.cjs` reports 0 raw-LaTeX slides.
- The Devil's-Advocate slide (22) steelmans the objection ("machine-built weighting can't manufacture identification") and answers it with the exact assumption list from index.md:265/547.

---

## Priority action items

None required for ACCEPT. Optional polish only:

1. **[LOW]** Consider whether slide 2.1's two-sentence `.comment` should collapse to one line (deferred — current form is fine).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_sdid_staggered

To re-check just the dimension you fixed:

    /project:review-slides stata_sdid_staggered focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html both byte-identical)
- Tooling notes: `slide-audit.cjs` reported 11 "overflow" / 27 "dense" slides, but a per-slide re-measurement at 1280×720 via `Reveal.getCurrentSlide()` excluding hidden `.notes` found 0 overflow, 0 over-60-word slides, max 4 bullets — confirming those flags are the known cumulative-across-vertical-stack + speaker-notes artifact, not real findings. The load-bearing browser signal (`raw-latex slides: 0`) confirms math renders.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
