# Review: stata_iv_panel Slide Deck

**Audited:** content/post/stata_iv_panel/slides/
**Source of truth:** content/post/stata_iv_panel/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled (Chrome channel + per-current-slide overflow re-verification)

---

## Verdict: MINOR REVISION

**Overall assessment.** The deck is numerically faithful — every coefficient, SE, F-statistic, and percentage on a slide traces cleanly to `index.md`, and the title-slide key-result strip (−0.296 / 0.001 / 40.3) uses the post's actual headline figures. Branding is byte-identical to the canonical templates and the smoke test passes 15/15. The weakest dimension is title clarity: one slide title carries a stray "Two LASSO" copy-paste artifact (LASSO never appears in this IV deck), and one reduced-form title says weather predicts conflict "directly," which clashes with the exclusion-restriction slide two slides earlier. Fixing those two titles plus trimming one prose-heavy hook slide promotes the deck to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 18 numbers/figures trace to index.md |
| 2  | Conceptual correctness        | 10         | 0       | LATE estimand named; exclusion correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders (20 .MathJax) |
| 4  | Title↔body consistency        | 7          | 2 M     | "Two LASSO" stray; "directly" clash    |
| 5  | Readability & simplicity      | 7          | 1 M 1 L | 1 prose-heavy hook; 1 long comment line |
| 6  | Typos & grammar               | 9          | 1 L     | stray "48-" in a speaker note          |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc; Devil's-Advocate present; closing is one sentence |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide diffs clean         |
| 9  | Accessibility & legibility    | 10         | 0       | overflow: none (per-slide re-verified); figures captioned |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html`; files present; 5/5 figs resolve |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 4   | MED      | slide "Two LASSO... no — two stages" (slides.qmd:160) | "Two LASSO" is a copy-paste artifact from a double-LASSO deck; LASSO never appears in this IV tutorial — confuses the listener | Retitle to a clean 2SLS assertion (see rewrite) |
| 2  | 4   | MED      | slide "Both weather instruments predict conflict directly" (slides.qmd:190) | "directly" clashes with the exclusion slide ("Weather ↛ Conflict (directly)") two slides earlier; risks reading as an exclusion violation | Reword to "in the reduced form" (see rewrite) |
| 3  | 5   | MED      | slide "Does poverty cause violence?" (slides.qmd:52,56) | Two stacked prose sentences; the lead is 33 words with three sub-clauses — too dense to read at a glance | Keep one anchor line on slide; move the threat list to notes (see rewrite) |
| 4  | 5   | LOW      | slide "The lab:" comment (slides.qmd:105) | 25-word single-sentence comment line under the bullets | Split into two short clauses (see rewrite) |
| 5  | 6   | LOW      | notes (slides.qmd:108) | "A 48-... no — 5,689-region" — the "48" has no referent (the post has 53 countries / 5,689 regions); reads as a stray number | Drop the "48-..." false start |

Order: MED first, then LOW. Numbered consecutively across dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide "Does poverty cause violence? Regress conflict on income and you get nothing"**

Before:
> Poor regions see more conflict. But correlation is not causation: unobserved institutions, reverse causality, and a noisy income proxy all contaminate the regression.

After (on slide):
> Poor regions see more conflict — but correlation is not causation.

(in notes): "Three things contaminate the regression: unobserved institutions, reverse causality, and a noisy income proxy."

Why: 33-word sentence with three sub-clauses → one 8-word anchor on the slide; the threat list moves to speech.

**Issue #4 — slide "The lab: 96,591 region-years, 5,689 regions, 53 countries, 1994–2010"**

Before:
> Region fixed effects, region-specific time trends, and year effects are absorbed via pre-detrended variables; SEs clustered on 5,689 regions.

After:
> Region effects, region trends, and year effects are pre-absorbed. SEs clustered on 5,689 regions.

Why: 25-word semicolon sentence → two short clauses; "are absorbed via pre-detrended variables" → "pre-absorbed".

---

## HIGH-issue rewrites

None found.

(MED title rewrites, for the apply pass:)

**Issue #1 — Dim 4 — slide "Two LASSO... no — two stages..."**

Before:
> Two LASSO... no — two stages: fit lights from weather, then conflict from fitted lights

After:
> Two stages: fit lights from weather, then conflict from fitted lights

**Issue #2 — Dim 4 — slide "Both weather instruments predict conflict directly — the reduced form holds"**

Before:
> Both weather instruments predict conflict directly — the reduced form holds

After:
> Both weather instruments move conflict in the reduced form — the IV numerator is real

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                       | Value on slide | Source location          | Match |
|-----------------------------------|----------------|--------------------------|-------|
| Key-result: 2SLS (both)           | −0.296         | index.md:491,508,510     | ✓     |
| Key-result: OLS                   | 0.001          | index.md:437,440         | ✓     |
| Key-result: first-stage F (drought)| 40.3          | index.md:585,613         | ✓     |
| Sample: region-years / regions / countries / years | 96,591 / 5,689 / 53 / 1994–2010 | index.md:319 | ✓ |
| Conflict rarity (any / severe)    | 4.6% / 1.4%    | index.md:385,108         | ✓     |
| OLS coefficient (SE, p)           | 0.001 (0.001, p=0.50) | index.md:437,440  | ✓     |
| 2SLS Rain / Drought / Both        | −0.303 / −0.293 / −0.296 | index.md:491,508 | ✓     |
| 2SLS SEs                          | 0.111 / 0.085 / 0.076 | index.md:492,508   | ✓     |
| First-stage F (Rain)              | 24.62          | index.md:560,568         | ✓     |
| First-stage F (Drought)           | 40.33          | index.md:585             | ✓     |
| First-stage rain coef             | 0.036          | index.md:557,568         | ✓     |
| Reduced form: rain→conflict       | −0.011 (p=0.001) | index.md:453,459       | ✓     |
| Reduced form: drought→conflict    | −0.002 (p<0.001) | index.md:456,459       | ✓     |
| Hansen J / p-value                | 0.007 / 0.93   | index.md:602,606         | ✓     |
| 10% drop → effect / baseline jump | 3 pts / 66% (4.6%→7.6%) | index.md:510,643 | ✓     |
| Severe effect ≈ one-third         | ~−0.09         | index.md:531,538         | ✓     |
| Stock-Yogo 10% threshold          | 16.38          | index.md:564,568         | ✓     |
| Prevalence: 1998 peak ~7% → ~2.5% | 7% / 2.5%      | index.md:413             | ✓     |
| Code: xtivreg2 spec               | matches do-file | index.md:473–482         | ✓     |
| Figure: coef_comparison           | ../stata_iv_panel_coef_comparison.png | index.md:512 | ✓ |
| Figure: first_stage_rain          | ../stata_iv_panel_first_stage_rain.png | index.md:619 | ✓ |
| Figure: first_stage_drought       | ../stata_iv_panel_first_stage_drought.png | index.md:621 | ✓ |
| Figure: reduced_form              | ../stata_iv_panel_reduced_form.png | index.md:461 | ✓ |
| Figure: conflict_prevalence       | ../stata_iv_panel_conflict_prevalence.png | index.md:411 | ✓ |

No ✗ — every slide datum is sourced. (Minor: the deck's note quotes first-stage F "both" as 25.32 implicitly via the post; the deck's headline F uses 40.3/24.62 single-instrument values, which is the post's framing.)

---

## Title sequence (assertion-title test)

1. Does poverty cause violence? Regress conflict on income and you get nothing
2. OLS says zero; 2SLS says −0.30 — same data, a 300-fold gap
3. Where we're going
4. Three threats make the OLS slope uninterpretable
5. The lab: 96,591 region-years, 5,689 regions, 53 countries, 1994–2010
6. Weather two years back drives income, then income drives conflict
7. The structural equation: δ is the causal effect we want
8. 2SLS identifies a LATE — the effect for weather-driven compliers
9. Two LASSO... no — two stages: fit lights from weather, then conflict from fitted lights
10. Rainfall moves economic activity: a clean positive first stage
11. Drought is the stronger instrument — a tighter first stage
12. Both weather instruments predict conflict directly — the reduced form holds
13. Conflict is rare and declining — context for a binary outcome
14. Throw out the instruments and OLS reads exactly zero
15. Instrument the lights and the effect snaps to −0.296
16. Three instrument choices, one answer: −0.293 to −0.303
17. A 10% income drop raises conflict risk by 3 points — a 66% jump
18. Strong and valid: every diagnostic clears its threshold
19. Does IV manufacture causality? No — two assumptions still carry the weight
20. When measurement is noisy, the instrument — not OLS — tells the truth.

**Verdict:** Coherent abstract, with two snags — title 9 ("Two LASSO") is a stray artifact and title 12 ("directly") risks an exclusion clash. Fixing both leaves a clean read-through.

---

## Positive highlights

- Slide 2's title "OLS says zero; 2SLS says −0.30 — same data, a 300-fold gap" states the whole puzzle and the punchline in one line, then earns it in Act II.
- Slide 8 ("2SLS identifies a LATE — the effect for weather-driven compliers") names the estimand in the title — exactly what a causal deck owes its audience — and the body's objection/rebuttal pair (LATE may exceed ATE, but the gap is small) mirrors the post's §9 faithfully.
- The Devil's-Advocate slide 19 ("Does IV manufacture causality? No...") correctly separates testable relevance (F = 24–40) from untestable exclusion, and the closing divider is a single declarative sentence — not "Questions?".

---

## Priority action items

1. **[MED]** Retitle slide 9 to drop the irrelevant "Two LASSO" artifact → "Two stages: fit lights from weather, then conflict from fitted lights" (slides.qmd:160).
2. **[MED]** Reword slide 12's title so "directly" no longer clashes with the exclusion slide → "Both weather instruments move conflict in the reduced form — the IV numerator is real" (slides.qmd:190).
3. **[MED]** Trim the slide-1 hook to one anchor line; move the three-threat list to speaker notes (slides.qmd:52,56).
4. **[LOW]** Split the 25-word "The lab:" comment into two short clauses (slides.qmd:105).
5. **[LOW]** Drop the stray "48-..." false start in the slide-5 speaker note (slides.qmd:108).

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow or unrendered math. (The `slide-audit.cjs` OVERFLOW flags on the Act-II stack are the known cumulative-vertical-slide artifact; per-current-slide re-measurement at 1280×720 shows all content within the box.)

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_iv_panel

To re-check just the dimension you fixed:

    /project:review-slides stata_iv_panel focus: consistency and readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html both byte-identical)
- Tooling notes: per-current-slide overflow re-verified with a `section.present`-scoped measurement; `slide-audit.cjs` cumulative OVERFLOW flags ruled out.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
