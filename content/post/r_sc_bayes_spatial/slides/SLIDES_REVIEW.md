# Review: r_sc_bayes_spatial Slide Deck

**Audited:** content/post/r_sc_bayes_spatial/slides/
**Source of truth:** content/post/r_sc_bayes_spatial/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** The deck is faithful and well-built: every number, figure, table cell, and equation traces cleanly to `index.md`, the smoke test passes 15/15, branding is byte-identical, and the three-act arc with assertion titles reads as a coherent abstract. The single blocker is one HIGH typo on the Devil's-Advocate slide — the phrase "the abortion-style causal claim" — which has no basis in the post, baffles the audience, and reads as a generation artifact. Fixing that one phrase (to "a naive causal claim") promotes the deck to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 18 data points trace to index.md   |
| 2  | Conceptual correctness        | 9          | 1 L     | ATT/estimand stated; SUTVA framing correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders, 0 raw-LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes            |
| 5  | Readability & simplicity      | 8          | 2 L     | prose mostly in notes; 2 Act-I sentences >15 words |
| 6  | Typos & grammar               | 5          | 1 H     | "abortion-style causal claim" (fabricated phrase) |
| 7  | write-slides design adherence | 9          | 1 L     | arc ok; closing is one declarative sentence; Devil's-Advocate present |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none (per-section verified); figures captioned |
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html` ok; files ok  |

---

## Issues found

| #  | Dim | Severity | Location                                   | Issue                                                                 | Suggested fix                                          |
|---:|----:|----------|--------------------------------------------|----------------------------------------------------------------------|--------------------------------------------------------|
| 1  | 6   | HIGH     | slides.qmd:285 — "Does the SAR layer make this causal?" | "the abortion-style causal claim" — fabricated phrase, no source basis, distracting | Change to "a naive causal claim"                       |
| 2  | 2   | LOW      | slides.qmd:285 (same slide)                | Rebuttal compresses "conditional independence given X and parallel trends" without unpacking either on-slide | Acceptable for seminar audience; keep, gloss in notes  |
| 3  | 5   | LOW      | slide 2 — "Two assumptions decide whether you trust…" | Opening on-slide sentence is 23 words; second prose sentence stacks a second idea | See rewrite below (split / move to notes)              |
| 4  | 5   | LOW      | slide — "Same data, three estimators…" (figure caption) | Caption sentence 24 words with embedded "4 → 23 → 27" aside           | See rewrite below (trim caption)                       |

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 2 "Two assumptions decide whether you trust the most-studied policy in econometrics"**

Before:
> California's 1988 Proposition 99 raised the cigarette tax 25 cents. The classical synthetic control answer — a 25–30 pack drop — has been quoted for two decades.

After (keep first line as anchor; move the rest to notes):
> Prop 99 raised California's cigarette tax 25 cents in 1988.
> The classic answer: a 25–30 pack drop, quoted for 20 years.

Why: two short spoken lines replace one 14-word + one 17-word sentence; the "quoted for two decades" detail reads better as a clipped phrase. (LOW — the `. . .` reveal already paces this; optional polish.)

**Issue #4 — slide "Same data, three estimators, one ATT — but the donor pool quadruples" (figure caption)**

Before:
> ATT for classical SCM, Bayesian horseshoe, and Bayesian spatial SAR — robust at −18 to −16 packs/capita while active donors climb 4 → 23 → 27.

After:
> ATT stays −18 to −16 packs/capita across all three estimators; active donors climb 4 → 23 → 27.

Why: 24 → 17 words; drops the estimator list (already in the title sequence) and leads with the takeaway. (LOW.)

---

## HIGH-issue rewrites

**Issue #1 — Typos & grammar — slide "Does the SAR layer make this causal? No — two assumptions still carry the weight"**

Before:
> We evaluate a *method*, not the abortion-style causal claim.

After:
> We evaluate a *method*, not a naive causal claim.

Why: "abortion-style" appears nowhere in the source post and is conceptually unrelated to synthetic control, SUTVA, or tobacco policy — it is a fabricated phrase that would confuse any audience. The sentence's intent is to contrast evaluating a *method* against making a strong/naive causal claim. "a naive causal claim" preserves the meaning and matches the post's framing (Discussion §9: the contribution is showing SUTVA is testable, not asserting identification).

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                        | Value on slide          | Source location           | Match |
|------------------------------------|-------------------------|---------------------------|-------|
| Cigarette tax increase             | 25 cents                | index.md:60               | ✓     |
| Classical ATT                      | −18.46                  | index.md:316 / 331        | ✓     |
| Classical 95% boot CI              | [−22.21, −14.45]        | index.md:316              | ✓     |
| Classical weight concentration     | 97.5% on four states    | index.md:331              | ✓     |
| Top-4 weights (Utah/Nevada/Montana/Conn) | 0.327/0.255/0.245/0.148 | index.md:322–324    | ✓     |
| Horseshoe ATT                      | −15.84                  | index.md:380              | ✓     |
| Horseshoe 95% CrI                  | [−21.76, −9.48]         | index.md:380              | ✓     |
| Active donors (HS)                 | 23 of 38                | index.md:381 / 396        | ✓     |
| Connecticut posterior mean         | 0.218                   | index.md:387 / 131        | ✓     |
| Nevada CrI excludes zero           | [0.081, 0.266]          | index.md:131 / 396        | ✓     |
| Spatial autocorrelation ρ          | 0.223                   | index.md:437 / 442        | ✓     |
| ρ 95% CrI                          | [0.168, 0.272]          | index.md:163 / 540        | ✓     |
| ESS(ρ)                             | 3                       | index.md:437 / 444        | ✓     |
| SAR ATT                            | −16.59                  | index.md:439 / 442        | ✓     |
| SAR 95% CrI                        | [−16.78, −16.39]        | index.md:439 / 522        | ✓     |
| Active donors (SAR)                | 27                      | index.md:522              | ✓     |
| Nevada spillover                   | −3.75                   | index.md:471 / 484        | ✓     |
| Idaho spillover / "16×"            | −0.228 / 16×            | index.md:472 / 482        | ✓     |
| North Dakota / "2,900×"            | −0.00126 / >2,900×      | index.md:478 / 484        | ✓     |
| Effect path −5 (1988) → −27 (2000) | −5 → −27                | index.md:447 / 449        | ✓     |
| Panel size                         | 39 states, 1,209 rows, 1970–2000 | index.md:268 / 272 | ✓     |
| Pre/post split                     | 18 pre / 13 post years  | index.md:272              | ✓     |
| ATT equation                       | $E[Y_i(1)-Y_i(0)\mid D_i=1]$ | index.md:78           | ✓     |
| Simplex objective equation         | argmin ‖…‖² s.t. simplex | index.md:280             | ✓     |
| Horseshoe hierarchy equation       | N(0,τ²λ²), C⁺(0,1)      | index.md:339              | ✓     |
| SAR equation                       | ρWY + Xβ + Yᶜˡᵃᵍα + ε   | index.md:411              | ✓     |
| 6 figures (`../r_sc_bayes_spatial_*.png`) | all 6 present     | index.md figs 1–6         | ✓     |

No ✗ rows. Source fidelity is clean.

---

## Title sequence (assertion-title test)

1. Two assumptions decide whether you trust the most-studied policy in econometrics
2. Same data, three estimators, one ATT — but the donor pool quadruples
3. The estimand is the ATT for one treated unit: California
4. The lab: a balanced 39-state panel, 1970–2000, 1,209 rows
5. Three estimators relax one assumption at a time
6. With zero substantive controls, the simplex picks just four donors
7. Classical SCM concentrates 97.5% of the weight on four states
8. Classical SCM lands the ATT at −18.46 packs per capita
9. The horseshoe prior keeps zero overwhelmingly likely — yet lets a few donors escape
10. Relax the simplex and the donor pool jumps from 4 to 23 active states
11. Propagating weight uncertainty widens the band but never reaches zero
12. Drop SUTVA: each donor's sales depend on its neighbours' sales
13. The Gibbs pipeline runs both MCMCs and the spillovers in one call
14. The posterior puts spatial autocorrelation at rho = 0.223, clearly above zero
15. The posterior effect path widens linearly from −5 in 1988 to −27 by 2000
16. Almost the entire spillover lands on one state: Nevada
17. Before trusting the posterior, the prior must be compatible with the data
18. All three estimators agree on sign and scale: Prop 99 worked
19. Does the SAR layer make this causal? No — two assumptions still carry the weight
20. SUTVA is empirically false here — and that widens Prop 99's true reach
21. (closing) Let the data, not the simplex, choose your donors — and let the map tell you who else was treated.

**Verdict:** coherent abstract. The titles alone narrate the full talk: tension (two assumptions) → estimand → three nested estimators with their moving numbers → the spillover → resolution → one-sentence takeaway.

---

## Positive highlights

- Slide 19's assertion title "Does the SAR layer make this causal? No — two assumptions still carry the weight" is an exemplary Devil's-Advocate slide: it states the objection, concedes it, and re-anchors on identification in one breath.
- Source fidelity is flawless — every one of ~22 distinct numeric claims, all six figures, and all four display equations trace to a specific line in `index.md`; the deck never invents or rounds away a result.
- The closing slide is a single declarative sentence ("Let the data, not the simplex, choose your donors — and let the map tell you who else was treated.") — not "Questions?" or "Thank you" — and doubles as the talk's thesis.
- Math is written as plain `$…$`/`$$…$$` with bare `_` subscripts (e.g. `Y_i`, `\alpha_j`) — correct for Quarto/MathJax revealjs; no Goldmark `\_` and no stray currency `\$`, so nothing breaks at typeset time (browser pass: 0 raw-LaTeX slides).
- Branding is byte-identical to the canonical templates (both diffs empty); the title key-result strip carries the three headline numbers (−18.46, −3.75, 0.223).

---

## Priority action items

1. **[HIGH]** Replace "the abortion-style causal claim" with "a naive causal claim" on the Devil's-Advocate slide (slides.qmd:285). This is the only blocker to ACCEPT.
2. **[LOW]** Optionally trim the slide-2 opening prose and the Fig-1 caption per the Dimension-5 rewrites (both already paced acceptably; pure polish).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_sc_bayes_spatial

To re-check just the dimension fixed:

    /project:review-slides r_sc_bayes_spatial focus: correctness

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html both byte-identical)
- Tooling notes: slide-audit.cjs reported 3 OVERFLOW + 25 dense slides, but these are the known cumulative-walk artifact (`Reveal.next()` stacks fragment text into `section.present`); a per-section re-measurement at each slide's final fragment state (1280×720) found 0 real overflow and 0 raw-LaTeX. Density counts are likewise cumulative and not load-bearing.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
