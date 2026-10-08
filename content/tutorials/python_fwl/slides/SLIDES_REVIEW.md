# Review: python_fwl Slide Deck

**Audited:** content/tutorials/python_fwl/slides/
**Source of truth:** content/tutorials/python_fwl/index.md (+ fwl_results.json, the canonical numbers written by script.py; no results_report.md)
**Date:** 2026-09-28
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Update — 2026-09-28 (verification wave 5 fixes)

An independent verification pass raised four slide findings (two MED, two LOW). All four are fixed in `slides.qmd`, and `index.html` is re-rendered (Quarto 1.8.27). The `slides_files/` file set is unchanged, so no library file was orphaned.

| Finding | Severity | Fix |
|---|---|---|
| Cue C2 (slide 12) was answered before it appeared: slides 8–9 already say income → fewer coupons, and γ̂ plus the gap made δ̂ a division | MED | Reframed to test the OVB *direction*, the post's lesson and the ✓/✗ rows of slide 13. Title: "Before you look: which regression gives δ̂?". Body: "Gap: −0.1059 − 0.2673 = −0.3732 = γ̂ × δ̂" and γ̂ = 0.3836. Options: A. income on coupons (slope −0.97); B. coupons on income (slope −0.39); C. either one, the two slopes agree. Answer A (in the notes, with the reverse regression's −0.151 and the shared-covariance reason the slopes differ). The AhaSlides I2 poll must use these options and answer A. |
| Slide 29 title and slide 30 notes called +0.267 the effect / "the truth" | MED | Slide 29: "After partialling out income, the estimated effect is +0.267". Slide 30 notes: "right panel is the conditional relationship (slope +0.267, an estimate of the true +0.2)"; "the lie" became "the confounded raw slope". |
| Slide 14 notes gave away cue C3 (option C) three slides early | LOW | Notes now say full OLS and residualize-both agree and that the residualize-X-only shortcut is tested in a moment. The three-estimator sentence moved to slide 18's notes, after "The coefficient survives". |
| Slide 16 never showed the 0.2673 it claims to reproduce | LOW | Added line 6 to the code: `fwl.params["coupons_tilde"]   # 0.2673, same as full OLS` (line steps now 2 \| 3 \| 5–6). |

Also changed: slide 33 (DML) now says **cross-fitted** ML, and its takeaway adds that the estimate is causal only if no confounder is unmeasured. The notes spell out cross-fitting (fold-wise out-of-sample residuals) and the need for good-enough learners. The slide 30 caption drops the verb hyphen ("after partialling out income"), which closes issue 6 above.

Checks: `Reveal.getTotalSlides()` = 34 on the Hugo dev server. The six cue slides remain at 4, 12, 17, 20, 24, 26, each with 0 fragments and no answer on the slide. 0 MathJax errors, 0 raw-LaTeX slides, 0 overflow on the edited slides. The only console error is the dev server's `/favicon.ico` 404. `check_numbers.py` on slides.qmd and index.html: 0 near-misses.

---

## Verdict: ACCEPT

**Overall assessment.** The rebuilt 34-slide deck matches the restructured post. It carries the corrected OVB direction (income regressed on coupons, −0.9730), the intercept story for Step 1's standard error, the degrees-of-freedom story for Step 2, "uncorrelated, not independent", the partial-association reading of the two-control shift, and the treatment-versus-outcome nonlinearity caveat. All 75 numbers on slides and in notes appear verbatim in `index.md`, and `check_numbers.py` reports 0 near-misses against `fwl_results.json`. Source fidelity and branding are the strongest dimensions. The weakest are readability and technical polish, and only at LOW severity: a stacked Devil's-Advocate rebuttal, one dense two-control slide, and a per-deck MathJax font override that should move into the write-slides template.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | 75/75 numbers trace to index.md; T2 check: 0 near-misses |
| 2  | Conceptual correctness        | 10         | 0       | ATE named; OVB direction, SE ladder, df, linearity caveat all correct |
| 3  | Technical & render correctness| 8          | 0H/0M/2L | smoke-test PASS 15/15; math renders (0 raw, 0 MathJax errors) |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes; cue titles are questions by design |
| 5  | Readability & simplicity      | 8          | 0H/0M/3L | 2 dense table slides; 1 stacked rebuttal |
| 6  | Typos & grammar               | 9          | 1L      | em dashes correct; one hyphenation inconsistency |
| 7  | write-slides design adherence | 9          | 1L      | 3-act arc, Devil's-Advocate, one-sentence close; 13 takeaway cards |
| 8  | Branding integrity            | 10         | 0       | scss/title-slide diff clean; background/accent/byline ok |
| 9  | Accessibility & legibility    | 9          | 1L      | 0 overflow; 5/5 figures captioned and loading |
| 10 | Deliverable completeness      | 9          | 1L      | link `url: slides/index.html` ok; files ok; 5/5 figures resolve |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 3   | LOW      | slides.qmd:47 + slides/mathjax-fonts.html | Per-deck `include-in-header` sets MathJax 2 to TeX web fonts. Without it, MathJax picks the STIX fonts installed on macOS and misplaces every hat and tilde (β̂, γ̂, δ̂, x̃), including in the `?print-pdf` export used for AhaSlides. It works, but it is a deviation from the write-slides template. | Promote `mathjax-fonts.html` + the `include-in-header` line into `write-slides/references/templates/` so every deck gets it. Commit `mathjax-fonts.html` with this deck (the render needs it). |
| 2  | 3   | LOW      | browser pass (Hugo dev server)    | One console error: `404 /favicon.ico` at the dev-server root. This is the browser's automatic favicon request; the deck does not reference it. | None for the deck. |
| 3  | 5   | LOW      | slide 32 — "Does FWL make this causal?" (slides.qmd:422) | Rebuttal stacks three prose sentences on the slide | See rewrite below |
| 4  | 5   | LOW      | slide 27 — "A second control barely moves the coefficient" (slides.qmd:370) | Table + 18-word gloss + takeaway = 69 visible words (> 60 cap) | See rewrite below |
| 5  | 5   | LOW      | browser pass — slides 9, 12, 13, 14, 15, 16, 19, 21, 27, 31, 33 | `slide-audit.cjs` flags 11 "dense" slides, but its counts include MathJax's assistive-MathML duplicate text and code tokens. Without those, only four slides pass 60 words: 31 (summary table, 72), 27 (69), 33 (two-column contrast, 63) and 19 (SE-ladder table, 61). | None beyond issue 4. The summary table is a deliberate dense slide. |
| 6  | 6   | LOW      | slide 29 title (slides.qmd:382); slide 30 caption | "After partialling-out income" hyphenates the verb form; the post writes "partialling out income" for the verb | "After partialling out income, coupons raise sales by +0.267" |
| 7  | 7   | LOW      | whole deck                        | 34 slides against the Teaching band of 16–22. The deck has 23 content slides, 6 "Before you look" cue slides (anchors for the AhaSlides polls), a title and 4 dividers. | None. The cue slides are by design, and the content count is only one above the band. |
| 8  | 9   | LOW      | cue slides 4, 12, 17, 20, 24, 26  | Bold option letters are steel `#6a9bcc` on brand blue `#1a3a8a`, a contrast of about 3.6:1. That passes WCAG AA for large text only. | Acceptable at 34 px. To raise contrast, drop the `**…**` on the letters so they render in the light body color. |
| 9  | 10  | LOW      | ../index.md:16                    | The deck link uses `icon: chalkboard-teacher` (the FA5 name) instead of the checklist's `person-chalkboard`. It renders, and the url is correct. | Optional: switch to `person-chalkboard` when index.md is next edited. |

Order: HIGH first, then MED, then LOW. (No HIGH or MED issues.)

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 32 "Does FWL make this causal? No — it visualizes, it does not identify"**

Before:
> FWL is pure algebra — it only reproduces what OLS already computes. The causal reading needs one assumption: income is the only confounder. FWL pictures that adjustment; it cannot certify it.

After:
> FWL only reproduces what OLS computes. Causality needs one more assumption: income is the only confounder.

Why: three stacked sentences become two. The "pictures, cannot certify" line already sits in the title and the notes.

**Issue #4 — slide 27 "A second control barely moves the coefficient — and FWL still matches it"**

Before:
> 0.2673 → 0.2706: day of week's chance partial association with coupons, given income (partial corr. −0.021). Not a precision gain.

After:
> 0.2673 → 0.2706: a chance partial association, not a precision gain.

Why: 18 words become 10. The partial correlation (−0.021) and the OVB decomposition stay in the speaker notes.

**Issue #5 — density flags (browser pass)**

None needed beyond #4. Excluding MathJax assistive text, the only slide over 60 words besides #4 is the deliberate summary table (slide 31).

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                   | Value on slide | Source location                         | Match |
|-----------------------------------------------|----------------|-----------------------------------------|-------|
| Title strip                                   | +0.200 / +0.267 / 50 | index.md:357 (ATE 0.2), 472, 375   | ✓     |
| DGP code (incl. `dayofweek = rng.integers(1, 8, n)`, draw order) | slide 9 | index.md:360–373                 | ✓     |
| Naive coupon slope / SE / p                   | −0.1059 / 0.1158 / 0.365 | index.md:450, 1007            | ✓     |
| Full OLS coupon coef / SE / p; income coef     | +0.2673 / 0.1203 / 0.031; +0.3836 | index.md:472–473, 1008 | ✓     |
| OVB identity                                  | 0.2673 + 0.3836 × (−0.9730) = −0.1059 | index.md:511–515   | ✓     |
| Wrong direction (coupons on income)           | −0.3935 → −0.151 → +0.116 | index.md:517                  | ✓     |
| Cue C2 gap                                     | −0.1059 − 0.2673 = −0.3732 | index.md:486                 | ✓     |
| FWL by hand Cov / Var                         | 3.9380 / 14.7320 = 0.2673 | index.md:617–619              | ✓     |
| Residual-maker matrix form                    | M₂ = I − X₂(X₂ᵀX₂)⁻¹X₂ᵀ; x₁ᵀM₂y / x₁ᵀM₂x₁ | index.md:558, 634–642 | ✓ |
| Step 1 coef / SE / p                          | 0.2673 / 1.2715 / 0.834 | index.md:681, 1009               | ✓     |
| SE ladder SE / SSR / df                       | 1.2715, 0.1437, 0.1422, 0.1203 / 57,181, 715, 715, 491 / 49, 48, 49, 47 | index.md:706–709, 732 | ✓ |
| Share of SE gap closed by intercept           | 98%            | index.md:732                            | ✓     |
| Step 2 SE / df; ratio                         | 0.1178 / 49 vs 0.1203 / 47; √(47/49) = 0.9794 | index.md:764, 777–778 | ✓ |
| Scaled regression SE / p (notes)              | 0.119 / 0.029  | index.md:871, 894                       | ✓     |
| Two controls full / FWL                       | 0.2706, SE 0.1194, df 46 / 0.2706, SE 0.1157, df 49 | index.md:924, 943, 1013–1014 | ✓ |
| Partial corr.; OVB for day of week (notes)    | −0.021; 0.2673 = 0.2706 + 0.3195 × (−0.0101) | index.md:908, 949 | ✓ |
| Bignum label                                  | SE 0.1203; 95% CI [0.025, 0.509] | index.md:472, 1053             | ✓     |
| Linearity caveat (notes)                      | 0.200 / 0.127 / 0.200 | index.md:1046, 1337–1339           | ✓     |
| Summary table (7 rows)                        | coef / SE / df | index.md:1005–1014                      | ✓     |
| Figures                                       | ../fwl_naive_regression.png, fwl_residuals_income.png, fwl_partialled_out.png, fwl_scaled_residuals.png, fwl_comparison.png | index.md:437, 809, 833, 891, 984 | ✓ |
| statsmodels residualize code                  | slide 16       | index.md:670, 753–756                   | ✓     |

No ✗. A script checked all 75 numeric tokens in slides.qmd and found each one verbatim in index.md. `check_numbers.py` against fwl_results.json reports 0 near-misses.

---

## Title sequence (assertion-title test)

1. The FWL Theorem: Making Multivariate Regressions Intuitive *(title)*
2. The Tension *(Act I divider)*
3. We planted a +0.2 coupon effect in 50 stores — will a regression find it?
4. Before you look: what sign will the naive slope take? *(cue C1)*
5. Naive regression: coupons look like they reduce sales
6. Where we're going
7. The Investigation *(Act II divider)*
8. Income is a confounder that opens a backdoor from coupons to sales
9. A simulated lab with a known answer: the true effect is exactly +0.2
10. The naive slope is −0.106 — and points the wrong way (p = 0.365)
11. Add income as a control and the slope flips to +0.267 (p = 0.031)
12. Before you look: which regression gives δ̂? *(cue C2; retitled 2026-09-28)*
13. The OVB identity accounts for the whole gap, to the last digit
14. FWL: any multivariate coefficient is a univariate slope on residuals
15. FWL by hand: one covariance over one variance returns 0.2673
16. Three lines of statsmodels reproduce the multivariate coefficient
17. Before you look: does the Step 1 shortcut keep both numbers? *(cue C3)*
18. Step 1 keeps the coefficient, but its SE balloons to 1.2715
19. Step 1's SE explodes because the intercept is missing
20. Before you look: will Step 2's SE equal the full model's 0.1203? *(cue C4)*
21. Step 2 leaves the same residuals — only the degrees of freedom differ
22. Partialling-out, drawn: residuals are what a straight line in income leaves over
23. The hidden positive relationship the table couldn't show you
24. Before you look: does adding the means back change the slope? *(cue C5)*
25. Adding the means back keeps the slope but restores readable units
26. Before you look: does a second control move the coupon coefficient? *(cue C6)*
27. A second control barely moves the coefficient — and FWL still matches it
28. The Resolution *(Act III divider)*
29. After partialling out income, the estimated effect is +0.267 *(retitled 2026-09-28)*
30. Simpson's paradox, resolved: the slope flips from −0.106 to +0.267
31. Every FWL variant matches its full regression — only the SE moves
32. Does FWL make this causal? No — it visualizes, it does not identify
33. FWL is Double Machine Learning with a linear mop
34. Don't read the coefficient — read the partialled-out scatter.

**Verdict:** coherent abstract. Each "Before you look" question sits immediately before the slide that answers it. Cue slides show only the question and options A/B/C, with no fragments and no answer; the answer is in the speaker notes. Slide 6 is the teaching-deck agenda, which is acceptable for this audience.

---

## Positive highlights

- Slide 13 puts the OVB identity and its most common mistake side by side. The correct auxiliary regression (income ~ coupons, −0.9730) reproduces the observed −0.1059 exactly. The reversed one (coupons ~ income, −0.3935) implies +0.116 and reconciles nothing.
- Slides 18–21 separate the two standard-error effects. The dropped intercept accounts for 98% of Step 1's jump (SSR 57,181 → 715). The last gap to 0.1203 is income left in sales, and Step 2's 0.1178 differs only by √(47/49). The deck recommends reporting the full-model 0.1203 on slides 21, 29 and 31.
- The six cue slides use a uniform brand-blue full-bleed background and the "Before you look:" prefix, so they are easy to find in the overview and in the printed PDF (pages 4, 12, 17, 20, 24, 26). Each one's notes end with "(AhaSlides interactive I*n* follows)".
- The title strip no longer shows the naive slope, so the first cue ("what sign will the naive slope take?") is not spoiled on slide 1.
- The Devil's-Advocate notes now state the linearity caveat correctly. A curve in the treatment equation alone is harmless (0.200). A curve in the outcome equation that moves with the treatment biases the estimate (0.127), and adding income² restores 0.200.

---

## Priority action items

1. **[LOW]** Move the MathJax TeX-web-font include (`mathjax-fonts.html` + `include-in-header`) into the write-slides template so every deck prints hats and tildes correctly. Commit `slides/mathjax-fonts.html` with this deck.
2. **[LOW]** Trim the slide 27 gloss and the slide 32 rebuttal as rewritten above.
3. **[LOW]** Unhyphenate the verb "partialling out income" on slide 29 and in the slide 30 caption.

---

## Screenshots (HIGH-severity visual issues only)

No HIGH visual issue was found (0 raw-LaTeX slides, 0 overflow slides), so no screenshots were saved.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_fwl

To re-check just the dimension you fixed:

    /project:review-slides python_fwl focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel); deck traversed on the Hugo dev server (`http://127.0.0.1:1313/post/python_fwl/slides/index.html`) and from `file://`
- Quarto: 1.8.27; MathJax 2.7.9 (HTML-CSS output, TeX web fonts via `mathjax-fonts.html`)
- smoke-test.js: PASS (15/15 checks; 37 `<section>` tags; 5/5 figures resolve)
- math-check.cjs: PASS (34 slides, no raw LaTeX); independent pass: 0 MathJax errors, 0 overflow, 5/5 images loaded, `Reveal.getTotalSlides()` = 34
- Print-to-PDF (`?print-pdf&pdfSeparateFragments=false`, headless Chrome): 34 pages; cue slides on pages 4, 12, 17, 20, 24, 26
- check_numbers.py (fwl_results.json vs slides.qmd): 0 near-misses
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to the templates)
- Design/branding (browser pass): background ok; accent-rule ok; byline refined; pipeline none; takeaway-cards 13
- Tooling notes: slide-audit word counts include MathJax assistive-MathML text and code tokens, so its 11 "dense" flags overstate density (see issue 5). Console: only the dev server's `/favicon.ico` 404.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
