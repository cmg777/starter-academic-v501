# Review: stata_sdid Slide Deck

**Audited:** content/post/stata_sdid/slides/
**Source of truth:** content/post/stata_sdid/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT (pre-fix: MINOR REVISION)

**Overall assessment.** A strong, faithful, on-brand teaching deck. Every headline
number traces to the source post, math renders cleanly (27 MathJax spans, zero raw
LaTeX), no `\_`-in-math Goldmark bug, no literal-currency issue, branding files are
byte-identical to the canonical templates, and the smoke test passes 15/15. The
strongest dimension is title↔body consistency — the assertion titles read in
sequence as a complete abstract. The only finding worth acting on was a single LOW
arithmetic-rounding inconsistency in a slide gloss (−55.9 − (−28.5) ≠ −27.35),
which has been corrected to the post's exact figures (−55.86 − (−28.51) = −27.35),
promoting the deck to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                       |
|----|-------------------------------|-----------:|--------:|---------------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers + 7 figures trace to source     |
| 2  | Conceptual correctness        | 10         | 0       | ATT correct; observational framing kept     |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders; no raw LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes (full abstract) |
| 5  | Readability & simplicity      | 8          | 2 LOW   | a few two-sentence `.comment` glosses       |
| 6  | Typos & grammar               | 10         | 0       | em-dashes used; no `--`; consistent terms   |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate; 1-sentence close |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide byte-identical (clean)   |
| 9  | Accessibility & legibility    | 10         | 0       | no real overflow (≤2px); figures captioned  |
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html`; files present     |

---

## Issues found

| #  | Dim | Severity | Location                                    | Issue                                                                 | Suggested fix                                          |
|---:|----:|----------|---------------------------------------------|----------------------------------------------------------------------|--------------------------------------------------------|
| 1  | 1   | LOW      | slide 16 — "the 2×2 DiD says −27.35 packs"  | Gloss arithmetic used rounded −55.9 − (−28.5), which equals −27.4, not −27.35 | FIXED — use post's exact −55.86 − (−28.51) = −27.35 |
| 2  | 5   | LOW      | slide 9 — "Did Proposition 99 cut smoking?" | Fragment-revealed framing sentence is 27 words                       | Deferred — deliberate Act-I hook, one idea per fragment |
| 3  | 5   | LOW      | slides 7,9,11,12,13 — `.comment` glosses    | Several equation glosses run two sentences (~28–36 words)            | Deferred — intended math-decode gloss; rules say keep symbol-mapping prose |

Order: HIGH first, then MED, then LOW. (No HIGH or MED issues.)

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide 9 "Did Proposition 99 cut smoking? We can never observe the California that voted *no*"**

Before:
> To measure the effect we need California's smoking *without* the law — a counterfactual we never get to see. *Every method here is a different way to imagine it.*

After (optional — keep as is; it is a deliberate hook):
> We never see California *without* the law.
> Every method here imagines that missing world differently.

Why: 27 words → two ~8-word lines. Deferred because the line is a single
fragment-revealed Act-I framing beat, which the design rules permit; the rewrite
is offered only as an optional tightening.

**Issue #3 — slides 7, 11, 12, 13 (equation `.comment` glosses)**

Before (example, slide 11):
> $\alpha_i$ is a state fixed effect, $\beta_t$ a year fixed effect, $\tau$ the ATT. The two extra terms — $\hat{\omega}_i$ (unit weight) and $\hat{\lambda}_t$ (time weight) — are everything that separates SDID from ordinary regression.

After (optional):
> $\alpha_i$ state FE · $\beta_t$ year FE · $\tau$ the ATT.
> The two weights $\hat{\omega}_i$, $\hat{\lambda}_t$ are all that separates SDID from OLS.

Why: splits a 36-word two-sentence gloss into two short anchor lines. Deferred
because `readability-rules.md` explicitly says to KEEP symbol-mapping prose that
helps a listener decode on-slide math; the second sentence here is the payload of
the slide, not filler, so it stays on-slide by design.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                              | Value on slide        | Source location            | Match |
|------------------------------------------|-----------------------|----------------------------|-------|
| SDID ATT                                 | −15.60                | index.md:391, 395, 552     | ✓     |
| Synthetic control ATT                    | −19.48                | index.md:362, 365, 552     | ✓     |
| SC (unified, sdid framework)             | −19.62 / −19.620      | index.md:428, 431          | ✓     |
| Naive 2×2 DiD                            | −27.35                | index.md:328, 449, 552     | ✓     |
| DiD (unified) decimal                    | −27.349               | index.md:426, 431          | ✓     |
| DiD table `1.post`                       | −28.51 (SE 1.75)      | index.md:319 (−28.51142, 1.747208) | ✓ |
| DiD table `1.cal`                        | −14.36 (SE 6.79)      | index.md:318 (−14.359, 6.788699) | ✓ |
| DiD table `cal#post` SE                  | 10.91                 | index.md:322 (10.91131)    | ✓     |
| CA / control before-after drops          | −55.86 / −28.51 (post-fix) | index.md:328         | ✓     |
| Placebo SE                               | 9.88                  | index.md:497, 502, 554     | ✓     |
| Placebo 95% CI                           | [−35.0, 3.8]          | index.md:502, 554          | ✓     |
| Normal-approx p-value                    | 0.114                 | index.md:497, 502          | ✓     |
| Permutation p-value                      | 0.026                 | index.md:521, 554          | ✓     |
| Permutation rank                         | 1 of 38               | index.md:521               | ✓     |
| Pre-period RMSE / R²                     | 1.66 / 0.98           | index.md:348, 365          | ✓     |
| synth2 donors (Utah/Montana/Nevada)      | 0.39 / 0.23 / 0.21    | index.md:355-357, 365      | ✓     |
| SDID unit weights (Nevada/NH/Connecticut)| 0.12 / 0.11 / 0.08    | index.md:411               | ✓     |
| SDID time weights 1986–1988              | 0.37 / 0.21 / 0.43    | index.md:403               | ✓     |
| Panel size                               | 1,209 obs, 12 treated | index.md:300               | ✓     |
| Panel shape                              | 39 states, 1970–2000  | index.md:148               | ✓     |
| Figure: raw trends                       | ../stata_sdid_raw_trends.png  | index.md:201        | ✓     |
| Figure: SC path                          | ../stata_sdid_sc_path.png     | index.md:367        | ✓     |
| Figure: SC gap                           | ../stata_sdid_sc_gap.png      | index.md:371        | ✓     |
| Figure: SDID main                        | ../stata_sdid_sdid_main.png   | index.md:399        | ✓     |
| Figure: lambda weights                   | ../stata_sdid_lambda.png      | index.md:403        | ✓     |
| Figure: compare paths                    | ../stata_sdid_compare_paths.png | index.md:441      | ✓     |
| Figure: placebo histogram                | ../stata_sdid_placebo_hist.png  | index.md:519      | ✓     |

Every ✗ would be a HIGH issue. None present.

---

## Title sequence (assertion-title test)

1. Did Proposition 99 cut smoking? We can never observe the California that voted *no*
2. Three estimators, one dataset, three different answers — from −27 to −16
3. Where we're going
4. The lab: 39 states, 1970–2000, one outcome, one treated unit
5. The naive picture already warns us: California was on a different level *and* trend
6. The estimand is the ATT — the effect of the policy *on California*
7. SDID is one weighted two-way fixed-effects regression
8. Set both weights uniform and you get plain DiD; drop the time weights and unit FE and you get SC
9. Unit weights make the synthetic track California's pre-period path
10. Time weights are SDID's signature: which pre-years predict the post-period?
11. Against the simple 38-state average, the 2×2 DiD says −27.35 packs
12. A weighted donor pool fits the pre-period almost perfectly — and shrinks the estimate to −19.48
13. The gap hugs zero before 1989, then opens to about −27 by 2000
14. SDID matches the *trend*, not the level — and lands at −15.60
15. SDID puts *all* its pre-period weight on 1986–1988
16. One command, three estimators — change only `method()`
17. Stacked side by side, the ranking is transparent: DiD −27, SC −19.5, SDID −15.6
18. SDID is the preferred single number: −15.60 packs, ~20% fewer cigarettes
19. With one treated unit, placebo is the *only* valid inference
20. The placebo SE is 9.88 — honest about how hard one case is
21. The permutation test ranks California extreme: only 1 of 38 placebos is as large, p = 0.026
22. The strongest objection — and the answer
23. Let the estimator that leans *least* on parallel trends choose your number.

**Verdict:** coherent abstract. Read alone, the titles narrate the whole talk —
problem, data, estimand, the one-regression unification, each estimate, inference,
the objection, and the recommendation.

---

## Positive highlights

- Slide 16's title "One command, three estimators — change only `method()`" states
  the deck's central pedagogical payoff in seven words, and its body (three
  identical `sdid` lines differing only in `method()`) proves it directly.
- Slide 8's two-column DiD-vs-SC contrast ("ω, λ uniform / α kept" vs "ω optimized,
  no λ / α dropped") is the rare case that genuinely earns a two-column layout —
  the contrast is inseparable.
- Slide 19's title "placebo is the *only* valid inference" with a body that rules
  out jackknife (undefined with one treated unit) and bootstrap (needs many treated
  units) makes the identification-forced design choice crisp and correct.
- Equation glosses map every symbol to its Stata variable ($Y_{it}$ = packspercapita,
  $W_{it}$ = treated), keeping the math legible to a teaching audience.
- The closing slide is a single declarative sentence — no "Questions?" / "Thank you".

---

## Priority action items

1. **[LOW]** *(Done)* Slide 16 gloss — replace rounded −55.9/−28.5 with the post's
   exact −55.86/−28.51 so the displayed subtraction equals −27.35.
2. **[LOW]** *(Optional, deferred)* Consider splitting the longest two-sentence
   `.comment` equation glosses into two short anchor lines; keep the symbol-mapping
   payload on-slide per the readability rules.

---

## Screenshots (HIGH-severity visual issues only)

None — the audit's two OVERFLOW flags (cumulative-fragment artifact) did not
reproduce at 1280×720: per-current-slide overflow measured ≤ 2 px everywhere,
under the 8 px tolerance.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_sdid

To re-check just the dimension you fixed:

    /project:review-slides stata_sdid focus: fidelity

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical)
- Tooling notes: slide-audit.cjs reported 2 cumulative OVERFLOW flags; per-slide
  re-verification at 1280×720 showed ≤2px (no real overflow). Density counts are
  cumulative across vertical sub-slides + speaker notes (known artifact) and were
  not treated as load-bearing.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Note: this run also applied the one LOW fix above and re-rendered (per task
instruction); the only deck files changed were `slides.qmd` and the regenerated
`index.html` / `slides_files/`.*
