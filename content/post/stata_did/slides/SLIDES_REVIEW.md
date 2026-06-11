# Review: stata_did Slide Deck

**Audited:** content/post/stata_did/slides/
**Source of truth:** content/post/stata_did/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** A faithful, on-brand, highly readable deck. Every number on every slide traces to the source post (Dimension 1 is the strongest dimension — a clean fidelity ledger). The weakest dimension is readability, where two Act-II comment lines pack three clauses and could be split for a faster glance; both are MED-at-most and neither blocks acceptance. The static smoke test passes 15/15, branding is byte-identical to the canonical templates, and per-current-slide browser measurement shows **zero real overflow** and **zero raw LaTeX** across all 23 slides. The one fix that most improves the deck: split the two three-clause comment lines on slides 2,8 and 2,9 into two short lines each.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | none    | all 30+ numbers/figures trace to source |
| 2  | Conceptual correctness        | 10         | none    | ATT estimand correct; PT/SUTVA stated correctly |
| 3  | Technical & render correctness| 10         | none    | smoke-test PASS (15/15); math renders; 0 raw-LaTeX |
| 4  | Title↔body consistency        | 10         | none    | assertion-title test passes (coherent abstract) |
| 5  | Readability & simplicity      | 8          | 2 MED, 1 LOW | 0 over-length titles; 2 dense comment lines |
| 6  | Typos & grammar               | 10         | none    | em-dashes used; consistent terminology |
| 7  | write-slides design adherence | 9          | 1 LOW   | 3-act arc; Devil's-Advocate present; closing one sentence |
| 8  | Branding integrity            | 10         | none    | scss/title diff clean (byte-identical)  |
| 9  | Accessibility & legibility    | 10         | none    | overflow: none (per-slide); figures captioned |
| 10 | Deliverable completeness      | 10         | none    | link ok (relative); index.html + slides_files present |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slide 2,8 — "The same number as a regression" | Comment line packs 3 clauses (constant, β1, β2) in one breath; ~28 words | Split into two short lines (see rewrite) |
| 2  | 5   | MED      | slide 2,9 — "TWFE absorbs school and time effects" | Comment line states two fixed-effect roles + result in one sentence | Split γ_i and ϑ_t into two lines (see rewrite) |
| 3  | 5   | LOW      | slide 1,3 — "Where we're going" | "The naive ITS trap: why before-after overstates the effect" mixes label + sub-clause | Trim to "The naive ITS trap: before-after overstates" |
| 4  | 7   | LOW      | slide 3,4 — "Leads near zero, lags near 25" | Event-study table drops lag 2 (24.768) silently while showing lag 0/1/3 | Add lag 2 row, or keep as-is (deliberate trim of 7→6 rows; defensible) |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 2,8 "The same number as a regression: the interaction `txp` IS the DiD"**

Before:
> $\hat\beta_3 = 25.31$ (SE 0.61). The constant 71.22 is the comparison pre-mean; $\hat\beta_1 = -11.05$ the baseline gap; $\hat\beta_2 = 10.89$ the common trend.

After:
> $\hat\beta_3 = 25.31$ (SE 0.61) — the DiD.
> The other coefficients are nuisance: constant 71.22 (comparison pre-mean), $\hat\beta_1=-11.05$ (baseline gap), $\hat\beta_2=10.89$ (common trend).

Why: lead with the one number that matters; demote the three building-block values to a single "nuisance" line the eye can skip.

**Issue #2 — slide 2,9 "TWFE absorbs school and time effects; the interaction survives unchanged"**

Before:
> Unit effects $\gamma_i$ wipe out permanent school differences; time effects $\vartheta_t$ wipe out common shocks. What remains is $\hat\beta_3 = 25.31$.

After:
> $\gamma_i$ wipes out permanent school differences.
> $\vartheta_t$ wipes out common shocks. What remains: $\hat\beta_3 = 25.31$.

Why: one fixed-effect role per line; the listener parses each absorb separately instead of two semicolon-joined clauses.

**Issue #3 — slide 1,3 "Where we're going" (first bullet)**

Before:
> The naive ITS trap: why before-after overstates the effect

After:
> The naive ITS trap: before-after overstates the effect

Why: drop the filler "why" — the bullet already promises the explanation.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                       | Value on slide | Source location          | Match |
|-----------------------------------|----------------|--------------------------|-------|
| Treated schools / total           | 10 of 35       | index.md:73, 52          | ✓     |
| Comparison schools                | 25             | index.md:73              | ✓     |
| Naive ITS jump                    | 36.20          | index.md:968, 1034       | ✓     |
| ITS pre / post means              | 60.17 / 96.37  | index.md:968, 1031–1034  | ✓     |
| Comparison pre / post / change    | 71.22 / 82.10 / 10.88 | index.md:1031–1034  | ✓     |
| Treated change                    | 36.20          | index.md:1033            | ✓     |
| DiD ATT (manual)                  | 25.32          | index.md:1034            | ✓     |
| Before Diff (T−C)                 | −11.049 (0.443)| index.md:1071            | ✓     |
| After Diff (T−C)                  | 14.266 (0.443) | index.md:1073            | ✓     |
| diff DiD                          | 25.315 (0.627), t=40.40 | index.md:1075, 156| ✓     |
| R-squared (diff)                  | 0.99           | index.md:1076            | ✓     |
| reg interaction txp               | 25.3149 (0.615)| index.md:1104, 1185      | ✓     |
| reg constant / β1 / β2            | 71.215 / −11.05 / 10.89 | index.md:1102–1105 | ✓     |
| didregress                        | 25.315 (0.834) | index.md:1120, 1186      | ✓     |
| xtreg / reghdfe TWFE              | 25.315 (0.585) | index.md:1144, 1158, 1187| ✓     |
| within R² (TWFE)                  | 0.9946         | index.md:1142, 1147      | ✓     |
| reghdfe + covariate               | 25.328 (0.605) | index.md:1172, 1189      | ✓     |
| Five-estimator SE spread          | 0.585–0.834    | index.md:1184–1189       | ✓     |
| Overstatement                     | 43%            | index.md:67, 75, 1327    | ✓     |
| Event N / periods / onset         | 280 / 8 / 5    | index.md:1249, 1256      | ✓     |
| lead 4 / 3 / 2                    | 0.342 / −0.322 / 0.593 | index.md:1304–1306 | ✓     |
| lead p-values                     | 0.40 / 0.47 / 0.17 | index.md:1291, 233   | ✓     |
| lag 0 / 1 / 3                     | 25.028 / 24.705 / 25.701 | index.md:1309–1312 | ✓  |
| lag SEs                           | 0.445 / 0.559 / 0.797 | index.md:1309–1312  | ✓     |
| Figure: ITS                       | ../stata_did_its.png | index.md:966 (same fig) | ✓ |
| Figure: panelview 2×2             | ../stata_did_panelview_2x2.png | index.md:944  | ✓     |
| Figure: counterfactual            | ../stata_did_counterfactual.png | index.md:1000 | ✓    |
| Figure: event study               | ../stata_did_event_study.png | index.md:1289   | ✓     |

Every datum on a slide matches the post. No invented or altered results. (Note: deck displays a 6-row event-study table that omits lag 2 = 24.768 from the post's 7-row Table 4 — a selection, not a mismatch; all shown values are correct.)

---

## Title sequence (assertion-title test)

Read in order, the content-slide titles form the talk's abstract:

1. A program lifts the treated group's GPA by 36 points — but is that the program?
2. The naive before-after answer is 36.20 — the credible answer is much smaller
3. Where we're going
4. The lab: 35 schools, 2 periods, a clean simultaneous rollout
5. All 10 treated schools switch on together — the ideal 2×2 setup
6. DiD rebuilds the counterfactual from the comparison group's drift
7. Parallel trends: absent treatment, the two groups would have moved together
8. The double difference: subtract the comparison group's trend from the treated group's
9. The means table makes the subtraction explicit: 36.20 − 10.88 = 25.32
10. The formal `diff` command: ATT = 25.315, SE 0.627, p < 0.001
11. The same number as a regression: the interaction `txp` IS the DiD
12. TWFE absorbs school and time effects; the interaction survives unchanged
13. Five estimators, one answer: 25.31–25.33 across the board
14. The credible ATT is 25.32 GPA points — and the naive number overstated it by 43%
15. Do the leads look like zero? The event study tests parallel trends directly
16. Flat pre-trends, then a sharp persistent jump — the identification check passes
17. Leads near zero, lags near 25 — the table behind the picture
18. Does passing the pre-trends test make the result causal? Not by itself
19. Let the comparison group, not the calendar, tell you what the program did.

**Verdict:** coherent abstract. Every title is an assertion (not a label); the one near-label, "Where we're going," is a deliberate roadmap slide in Act I and is acceptable. Reading the titles alone reconstructs the full argument: tension → 2×2 design → counterfactual/parallel-trends → five estimators → resolution → event study → caveat → thesis.

---

## Positive highlights

- Slide 1,1's title "A program lifts the treated group's GPA by 36 points — but is that the program?" is a textbook Act-I hook: a surprising statistic plus the doubt that drives the whole talk, in one line.
- Slide 2,10 "Five estimators, one answer: 25.31–25.33 across the board" turns a five-row table into a single memorable claim, and the comment correctly states the design (not covariates) does the work.
- Slide 3,5 is a genuine Devil's-Advocate slide (Objection/Response) that correctly states the ATT is identified only under parallel trends AND SUTVA, and that a passed pre-trend "only fails to refute" — no causal overclaiming.
- The closing divider "Let the comparison group, not the calendar, tell you what the program did." is exactly one declarative sentence — the thesis, not "Questions?"/"Thank you."
- Per-current-slide browser measurement: max content bottom is 637/720 px on the figure slides; nothing clips. The slide-audit.cjs OVERFLOW flags were the documented cumulative-walk artifact, not real overflow.

---

## Priority action items

1. **[MED]** Split the slide 2,8 comment into a "DiD first, nuisance second" two-line form (Issue #1 rewrite).
2. **[MED]** Split the slide 2,9 comment so each fixed-effect role is its own line (Issue #2 rewrite).
3. **[LOW]** Drop the filler "why" from the first "Where we're going" bullet (Issue #3).
4. **[LOW]** Optionally add the lag-2 row (24.768, 0.739) to the event-study table for a complete 7-row Table 4, or leave the deliberate 6-row trim.

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow clips content and no slide shows raw LaTeX.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_did

To re-check just the dimension you fixed:

    /project:review-slides stata_did focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (Chromium via system Chrome channel)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs overflow/word counts are cumulative across the fragment+notes walk (known artifact); re-verified with per-current-slide measurement via Reveal.getCurrentSlide() — 0 real overflow, 0 raw-LaTeX, ≤74 words and ≤4 bullets per current slide.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only audit; the fixes below were applied separately per the calling task.*
