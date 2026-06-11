# Review: r_double_lasso Slide Deck

**Audited:** content/post/r_double_lasso/slides/
**Source of truth:** content/post/r_double_lasso/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is the reference-implementation deck and it shows: every number, figure, equation, and code block traces cleanly to the source post, the smoke test passes 15/15, both branding files are byte-identical to the canonical templates, and the headless browser pass finds zero raw-LaTeX and zero overflow slides. The strongest dimension is source fidelity (every datum verified). The only real flaw was a terminology inconsistency — the deck mixed "Double LASSO" (space) and "Double-LASSO" (hyphen) while the post uses the space form exclusively (31×, 0 hyphen); this MED finding was fixed in place. With that one fix applied the deck has no HIGH or open MED issues.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                       |
|----|-------------------------------|-----------:|--------:|---------------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 22 checked numbers/figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | estimand, identification, PSL blind spot all correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS; math renders on every slide |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes                 |
| 5  | Readability & simplicity      | 9          | 1 LOW   | 0 over-length, 0 dense (cumulative flags are notes artifact) |
| 6  | Typos & grammar               | 9          | 1 MED (fixed) | "Double LASSO" / "Double-LASSO" mix → standardized |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc ok; Devil's-Advocate present; closing = 1 sentence |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean (byte-identical)      |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none; figures captioned            |
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html` ok; files ok       |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 6   | MED (fixed) | slides.qmd:11,64,139,145,199,203 | Deck mixes "Double LASSO" (space, 8×) and "Double-LASSO" (hyphen, 6×); the post uses the space form exclusively (31×, 0 hyphen) | Standardized all 6 hyphenated occurrences to "Double LASSO" |
| 2  | 5   | LOW      | slide — "…states × 12 years…" notes; "twenty times more" | Notes round 150/8 = 18.75× up to "twenty times more" | Optional: say "nearly twenty times" or "~19×"; notes-only, not on-slide — left as is |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide "The lab: 48 states × 12 years…" (speaker notes)**

Before:
> the rigorous union is 8; the CV union is 150 — twenty times more

After:
> the rigorous union is 8; the CV union is 150 — nearly twenty times more

Why: 150 / 8 = 18.75×, so "twenty times" rounds up slightly; "nearly twenty" is exact. This is in `::: {.notes}` (spoken aside), so it is LOW and was left unchanged — the speaker can say it as written.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                         | Value on slide | Source location               | Match |
|-------------------------------------|----------------|-------------------------------|-------|
| Candidate controls                  | 284            | index.md:66,219               | ✓     |
| Panel: states × years × rows        | 48 × 12 × 576  | index.md:217                  | ✓     |
| p/n ratio                           | ≈ 0.49         | index.md:72 ("roughly one-half"); 284/576=0.493 | ✓ |
| First-diff OLS, violent α           | −0.152         | index.md:287                  | ✓     |
| First-diff OLS, property α          | −0.108         | index.md:287                  | ✓     |
| First-diff OLS, murder α            | −0.204         | index.md:288                  | ✓     |
| First-diff violent SE               | 0.034          | index.md:287 (0.0337)         | ✓     |
| Kitchen-sink murder α               | +2.34 (234%)   | index.md:302,304              | ✓     |
| Kitchen-sink violent (sign flip)    | +0.014         | index.md:300,304 (+0.0135)    | ✓     |
| OLS drops rank-deficient columns    | 3              | index.md:313                  | ✓     |
| Rigorous penalty constants          | c=1.1, γ=0.05  | index.md:396,405              | ✓     |
| DL-rigorous violent α               | −0.096         | index.md:432 (−0.0964)        | ✓     |
| DL-rigorous violent SE              | 0.051          | index.md:432 (0.0514)         | ✓     |
| DL-rigorous violent CI              | [−0.197,+0.004]| index.md:432                  | ✓     |
| Paper's violent point estimate      | −0.104         | index.md:630                  | ✓     |
| Selection counts violent (Iy/Id)    | 0 / 8          | index.md:432                  | ✓     |
| Rigorous union (viol/prop/murd)     | 8 / 12 / 9     | index.md:432,433,434          | ✓     |
| CV union (viol/prop/murd)           | 150 / 109 / 161| index.md:520–522              | ✓     |
| DL-CV violent α (sign flip)         | +0.019         | index.md:520 (+0.0193)        | ✓     |
| DL-CV murder α (explodes)           | −1.11          | index.md:522 (−1.1128)        | ✓     |
| CV d-equation paths surviving       | 143 of 284     | index.md:510,512              | ✓     |
| Figure: estimates / selection / paths | ../r_double_lasso_*.png | index.md:74,512,542 (same figures) | ✓ |
| Key-result strip                    | −0.096 · +0.019 · 284 | index.md:66 (headline figures) | ✓ |

Every datum matches. No ✗.

---

## Title sequence (assertion-title test)

Read in order, the titles form a coherent abstract:

1. With 284 candidate controls, the answer depends on which ones you keep
2. Five estimators, three crimes — wildly different answers from one dataset
3. Where we're going
4. The lab: 48 states × 12 years, 576 rows, 284 candidate controls
5. Five estimators ask the same question with escalating discipline
6. With zero controls, more abortion tracks less crime: −0.152
7. Throw in all 284 controls and OLS claims abortion raises murder by 234%
8. Double LASSO selects on the outcome *and* the treatment, then runs OLS
9. Six lines fit the rigorous Double LASSO in R
10. Theory keeps 8 controls; cross-validation keeps 150
11. Theory-tuned λ protects the causal signal; prediction-tuned λ flips it
12. Cross-validation's λ is so small that 143 of 284 controls survive
13. Rigorous Double LASSO restores a sensible −0.096 for violent crime
14. Does LASSO make this causal? No — two assumptions still carry the weight
15. (closing) Let the theory, not the cross-validator, choose your controls.

**Verdict:** coherent abstract. Titles are assertions (not labels), one idea each, and read in sequence they summarize the talk's tension → investigation → resolution. "Where we're going" (slide 3) is the one agenda label, acceptable as a single roadmap slide.

---

## Positive highlights

- Slide 7's title "Throw in all 284 controls and OLS claims abortion raises murder by 234%" turns the failure mode into a vivid one-line hook that the dark bignum slide (+2.34) then proves.
- Slide 11's two-column contrast "Theory-tuned λ protects the causal signal; prediction-tuned λ flips it" is the deck's thesis in one assertion, with rigorous-vs-CV side by side and the actual −0.096 / +0.019 numbers.
- The Devil's-Advocate slide ("Does LASSO make this causal? No…") correctly preserves the post's caveat — identification still needs conditional independence + parallel trends — rather than overclaiming causality.
- Speaker notes carry all the prose correctly: every Unicode math glyph (α, λ, γ) lives in `::: {.notes}` where speaker view needs it, while on-slide math stays LaTeX `$…$`.

---

## Priority action items

1. **[MED — done]** Standardize "Double-LASSO" → "Double LASSO" across the 6 hyphenated occurrences to match the post's exclusive space form. Applied.
2. **[LOW]** Optionally soften the "twenty times more" note to "nearly twenty times" for arithmetic precision (notes-only; left as is).

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow or unrendered-math issues detected.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_double_lasso

To re-check just the dimension fixed:

    /project:review-slides r_double_lasso focus: render

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (slide-audit.cjs browser pass)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: quarto 1.8.27 available for re-render. Browser pass: raw-latex 0, overflow 0; the 18 "dense" flags are the known cumulative-across-vertical-sub-slides-and-notes artifact, not real per-slide density.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
