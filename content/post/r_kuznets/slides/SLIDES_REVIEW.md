# Review: r_kuznets Slide Deck

**Audited:** content/post/r_kuznets/slides/
**Source of truth:** content/post/r_kuznets/index.md + results_report.md
**Date:** 2026-08-04
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** skipped (--no-browser)

---

## Verdict: MAJOR REVISION

**Overall assessment.** The deck is factually clean and technically sound — every number, figure, equation and claim traces to `index.md` / `results_report.md`, both branding files are byte-identical to the canonical templates, and the smoke test passes 15/15. The weakness is entirely **Dimension 7 (write-slides design adherence, score 4)**: the deck ships **zero `[…]{.takeaway .fragment}` cards** across 16 content slides, closes on **"Thank you"**, uses three **label titles** instead of assertions, and leaves **7 of 16 content slides with no speaker notes** — four MED design deviations that together trip the "any dimension ≤ 4" rule. Nothing here is a content error; the fixes are mechanical. Restoring the takeaway cards and replacing the "Thank you" closing with a thesis sentence would lift Dimension 7 out of the MAJOR band on its own.

**Audited 10 of 10 dimensions.** Because `--no-browser` is set, the browser-only sub-checks — whether the LaTeX actually typesets (Dim 3) and whether any slide overflows the 960×700 box (Dim 9) — are marked `[~]`, excluded from those dimensions' floors, and excluded from the verdict. The static halves of both dimensions ran in full.

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                                    |
|----|-------------------------------|-----------:|--------:|----------------------------------------------------------|
| 1  | Source fidelity               | 8          | 0/0/2   | all 48 slide data trace to source; 2 rounding/spec nits   |
| 2  | Conceptual correctness        | 7          | 0/1/1   | synthetic-data caveat dropped from the summary slide      |
| 3  | Technical & render correctness| 7          | 0/1/0   | smoke-test PASS (15/15); math render `[~]` not audited    |
| 4  | Title↔body consistency        | 9          | 0/0/1   | assertion-title test: pass with 3 label-title gaps        |
| 5  | Readability & simplicity      | 6          | 0/2/2   | 2 walls of prose; 1 slide at 5 fragment advances          |
| 6  | Typos & grammar               | 8          | 0/0/3   | no typos; 3 consistency nits (naming, decimals, units)    |
| 7  | write-slides design adherence | 4          | 0/4/3   | 0 takeaway cards; "Thank you" closing; 3 label titles     |
| 8  | Branding integrity            | 10         | 0/0/0   | scss diff clean; title-slide.html diff clean              |
| 9  | Accessibility & legibility    | 9          | 0/0/1   | 9/9 figures captioned; overflow `[~]` not audited         |
| 10 | Deliverable completeness      | 9          | 0/0/1   | link `slides/index.html` ok; files ok; stale slides.pdf   |

Skipped dimensions show `—` in the score column with `not audited` in Notes.

---

## Issues found

| #  | Dim | Severity | Location                                              | Issue                                                                                                   | Suggested fix                                                                 |
|---:|----:|----------|-------------------------------------------------------|---------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| 1  | 2   | MED      | slide 19 — "What we learned" (slides.qmd:170–175)     | Presents the synthetic results as unconditional findings ("Inverted-U **confirmed**"; "Wide regional gaps are largely a **transitional** feature of development"). `results_report.md:137` warns the numbers are *engineered* to match the paper and "are not independent evidence for the Kuznets hypothesis." | Add a closing bullet or a card: "On synthetic data calibrated to Lessmann (2014) — a method demo, not new evidence." |
| 2  | 3   | MED      | slide 10 — "Where does the curve turn?" (slides.qmd:105) | On-slide math is literal Unicode, not LaTeX: `∂WCV/∂ln(GDP) = β₁ + 2β₂Y + 3β₃Y² = 0`. `slide-mapping.md §Math symbols → LaTeX` forbids Unicode math on slides (it renders inconsistently across browsers/fonts). | Replace with `$\partial \mathrm{WCV}/\partial \ln(\mathrm{GDP}) = \beta_1 + 2\beta_2 Y + 3\beta_3 Y^2 = 0$` |
| 3  | 5   | MED      | slide 3 — "Why do some countries have huge regional gaps…" (slides.qmd:45, 49) | Wall of prose: four stacked sentences (~55 on-slide words), including a 19-word and a 17-word sentence.  | See rewrite below (Issue #3)                                                   |
| 4  | 5   | MED      | slide 7 — "We *compute* inequality, not assume it" (slides.qmd:81, 85) | Wall of prose: a display equation plus three prose sentences, including a 17-word data sentence.         | See rewrite below (Issue #4)                                                   |
| 5  | 7   | MED      | deck-wide (all 16 content slides)                     | **Zero `[…]{.takeaway .fragment}` cards.** `grep -c 'class="[^"]*takeaway' index.html` returns **0**. The write-slides convention is that substantive content slides end on the orange takeaway card restating the slide's assertion. | Add one takeaway card per content slide (see the rewrites for four worked examples). |
| 6  | 7   | MED      | slide 20 — "Thank you" (slides.qmd:177–179)           | The closing slide is "Thank you" — explicitly forbidden by `rhetoric-of-decks.md §Act III` and `design-adherence.md`; the closing must be one declarative sentence stating the thesis. | See rewrite below (Issue #6)                                                   |
| 7  | 7   | MED      | slides 5, 14, 19 (slides.qmd:63, 140, 168)            | Three label titles, not assertions: "Where we're going", "The within-country inverted-U", "What we learned". A title must be a claim the slide proves. | See rewrite below (Issue #7)                                                   |
| 8  | 7   | MED      | slides 5, 7, 11, 13, 14, 18, 19                       | **7 of 16 content slides carry no `::: {.notes}` block** (only 9 notes blocks exist). The Third Law puts the prose in the notes; these slides leave the speaker with nothing. | Add a notes block to each; move the on-slide prose flagged in Dim 5 into them. |
| 9  | 1   | LOW      | slide 11 — "Significant ≠ a genuine bend" (slides.qmd:117) | Slide says `$D=+0.006>0$`; `index.md:487` and `results_report.md:49` both report **+0.0055**, and `index.md:461` prints `0.005519`. Correct 3-dp rounding, but a different figure from the one the post states everywhere. | Use `$D=+0.0055>0$` to match the post verbatim.                                |
| 10 | 1   | LOW      | slide 13 — "Fixed effects change the story" (slides.qmd:132) | The on-slide spec `feols(wcv ~ lnGDP + I(lnGDP^2) \| country + year, vcov = "hetero")` traces to the concept card at `index.md:165`, but the coefficients printed beside it (+0.39\*\*/−0.021\*\*) come from the fuller spec at `index.md:379–380`, which also includes `trade_gdp + urbanization`. Running the slide's code would not reproduce the slide's numbers. | Add `+ trade_gdp + urbanization` to the displayed formula.                     |
| 11 | 2   | LOW      | slide 17 — "Structural change is the mechanism" (slides.qmd:156) | Asserts a causal mechanism. `results_report.md:141` classes the study as "descriptive/associational — no causal claim", though `index.md:565` does use "mechanism"/"because". Faithful to the post, stronger than the report. | Soften to "Structural change tracks the curve" or add "(association, not identification)" in the notes. |
| 12 | 4   | LOW      | slides 5, 14, 19                                       | Read alone, the title sequence is a coherent abstract **except** at the three label titles, which contribute no claim. Act III also opens on the mechanism (slide 17) rather than on the headline result, so the titles alone never state the deck's hero finding. | Fixed by Issue #7; consider re-ordering slides 17–18 after the headline.       |
| 13 | 5   | LOW      | slide 11 — "Significant ≠ a genuine bend" (slides.qmd:113) | Two stacked prose sentences (22 words) before the bullet list; the first duplicates the title's claim. | See rewrite below (Issue #13)                                                  |
| 14 | 5   | LOW      | slide 5 — "Where we're going" (slides.qmd:65–71)      | Five `::: {.incremental}` bullets = **5 fragment advances**, over the ~4 cap in `readability-rules.md` / `design-adherence.md §MB-MC`. | See rewrite below (Issue #14)                                                  |
| 15 | 6   | LOW      | slides 13, 14, 19 (slides.qmd:130, 140, 171)          | Three names for one concept across three slides: "Fixed effects" / "the two-way FE quadratic" / "fixest TWFE". "TWFE" is never expanded on any slide. | Pick one on-slide form ("two-way fixed effects", then "TWFE" after first use). |
| 16 | 6   | LOW      | slide 13 (slides.qmd:135)                             | Mixed decimal precision inside one bullet: "**+0.39\*\* / −0.021\*\***" (2 dp vs 3 dp).                  | Use "+0.394\*\* / −0.021\*\*" or "+0.39\*\* / −0.02\*\*".                      |
| 17 | 6   | LOW      | title strip (slides.qmd:12) vs slides 10, 19          | The same two numbers are formatted two ways: "$2.1k / $31k" on the title strip, "\$2,100 / \$31,000" on slides 10 and 19. | Use "\$2,100 / \$31,000" on the strip for consistency.                         |
| 18 | 7   | LOW      | deck-wide                                              | No Devil's-Advocate slide. The post carries a strong objection (§11.4: the upturn is a measurement artefact of the log transform; `results_report.md:137`: synthetic data). Offered-not-required for a teaching deck, but the material is already written. | Add one before slide 19: objection in orange, answer in teal.                  |
| 19 | 7   | LOW      | act structure                                          | Act II runs slides 6–15 = **10 of 20 slides (50%)**; the teaching target in `design-adherence.md` is ~65%. Act III carries 4 slides for 2 findings. | Move one Act-III figure slide into Act II, or add the Devil's-Advocate slide there. |
| 20 | 7   | LOW      | slides.qmd (no fenced code anywhere)                   | The post is an R tutorial ("…Estimates in R"), but the deck has **no `{.r}` code slide** — `grep -n '\`\`\`' slides.qmd` returns nothing. The only code is an inline backtick line on slide 13, which renders at inline-text size. | Promote slide 13's `feols` call to a ` ```{.r} ` block, optionally with `code-line-numbers`. |
| 21 | 9   | LOW      | slide 9 — "Cross-section: the inverted-U emerges…" (slides.qmd:97) | The load-bearing evidence is a 5-column regression table shipped as a PNG at `width="62%"` — the smallest text in the deck and no text alternative beyond the caption. | Widen to ~80%, or crop to the 3 income rows, or restate the two headline coefficients on-slide. |
| 22 | 10  | LOW      | content/post/r_kuznets/index.md:30–33                 | The "Slides (PDF)" link points at `slides.pdf` (2.5 MB, dated Jun 15) while this HTML deck was rendered Jul 8 — two different decks are published side by side under the same post. | Re-export this deck via `?print-pdf` and replace `slides.pdf`, or drop the PDF link. |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 3 "Why do some countries have huge regional gaps and others almost none?"**

Before:
> Kuznets (1955) and Williamson (1965) had an answer: as countries develop, spatial inequality first **rises**, then **falls** — an inverted-U.
>
> . . .
>
> But the data to test it — regional accounts for poor *and* rich countries — barely exist. Lessmann (2014) assembled them. We rebuild the exercise on **synthetic** data so the whole pipeline is open.

After:
> Kuznets and Williamson had an answer: **rise, then fall**.
>
> . . .
>
> Nobody could test it — the regional data barely exist.
>
> [Lessmann (2014) built them. We rebuild the whole exercise on **synthetic** data.]{.takeaway .fragment}

Why: 55 on-slide words → 27; four stacked sentences → three short lines; the dates, the "regional accounts for poor and rich countries" gloss and the open-pipeline rationale move to `::: {.notes}`; the slide gains its missing takeaway card.

**Issue #4 — slide 7 "We *compute* inequality, not assume it"**

Before:
> Population-weighted spread of regional GDP per capita. A populous poor region counts; a tiny rich enclave barely moves it.
>
> . . .
>
> We simulate regions for **56 countries**, 1980–2009, and compute the WCV from them — 890 annual observations.

After:
> Population-weighted spread of regional GDP per capita.
>
> . . .
>
> **56 countries · 1980–2009 · 890 annual observations**
>
> [A populous poor region counts; a tiny rich enclave barely moves it.]{.takeaway .fragment}

Why: three prose sentences → one gloss line, one data line, one takeaway card. The "we simulate regions and compute the WCV from them" narrative belongs in the notes — the slide keeps only the counts.

**Issue #13 — slide 11 "Significant ≠ a genuine bend — check the discriminant"**

Before:
> All three cubic terms can be significant and the curve still **not** bend in range. The test is the discriminant $D=\beta_2^2-3\beta_1\beta_3$:

After:
> The test: $D=\beta_2^2-3\beta_1\beta_3$

Why: 22 words in two sentences → a 3-word labeled setup. The first sentence restates the title, so it is pure duplication on-slide; move it verbatim to `::: {.notes}` where the speaker says it aloud.

**Issue #14 — slide 5 "Where we're going" (also fixes Issue #7's label title)**

Before (5 fragment advances):
> ## Where we're going
>
> ::: {.incremental}
> - **Measure** spatial inequality: the weighted coefficient of variation (WCV)
> - **Cross-section** OLS — the inverted-U and a high-income upturn
> - **Panel** two-way fixed effects with `fixest` — a *clean* inverted-U
> - **Semiparametric** checks — Robinson and Baltagi–Li
> - The twist: the upturn is **between** countries, not **within** them
> :::

After (4 advances, assertion title):
> ## Four estimators, one question — and they don't all agree
>
> ::: {.incremental}
> - **Measure** it — the weighted coefficient of variation (WCV)
> - **Estimate** it — cross-section OLS, panel fixed effects, two semiparametric checks
> - **The twist** — the upturn is **between** countries, not **within** them
> :::
>
> [Same data, three shapes. Fixed effects settle which one is real.]{.takeaway .fragment}

Why: 5 advances → 3 bullets + 1 takeaway card = 4, at the cap; the three "how" bullets merge into one because they carry one idea (we estimate it several ways); the label title becomes a claim the slide proves.

---

## HIGH-issue rewrites

None found.

---

## Design rewrites (Dimension 7 MEDs #6 and #7)

Recorded here because both are text fixes even though neither is HIGH.

**Issue #6 — slide 20 closing**

Before:
> ## Thank you
>
> Full tutorial, code, data and web app: **carlos-mendez.org/post/r_kuznets**

After:
> ## Wide regional gaps are a transitional stage of development — not a destination
>
> The high-income upturn lives **between** countries, not **within** them.
>
> Full tutorial, code, data and web app: **carlos-mendez.org/post/r_kuznets**

Why: the closing must be one declarative sentence stating the thesis the deck argued (`index.md:597–599, 605`). The resource line can stay beneath it.

**Issue #7 — remaining label titles (slide 5 is covered by the Issue #14 rewrite)**

Before (slide 14):
> ## The within-country inverted-U

After:
> ## Within a country, inequality peaks near \$18,000 and then falls

Before (slide 19):
> ## What we learned

After:
> ## Four estimators agree on the inverted-U — and disagree only on the upturn

Why: both titles become claims the slide's own body proves (slide 14's figure peaks at ~\$18,000, `index.md:395`; slide 19's four bullets are exactly that agreement/disagreement, `index.md:603–605`).

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                        | Value on slide                    | Source location                                  | Match |
|----------------------------------------------------|-----------------------------------|--------------------------------------------------|-------|
| Title strip 1 — headline shape                     | "inverted-U"                      | results_report.md:14; index.md:70                | ✓     |
| Title strip 2 — turning points                     | "$2.1k / $31k"                    | results_report.md:44 (\$2,146 / \$31,443)        | ✓ (rounded) |
| Title strip 3 — panel cubic                        | "cubic n.s."                      | results_report.md:54; index.md:391               | ✓     |
| Slide 3 — attribution                              | Kuznets (1955), Williamson (1965) | index.md:70                                      | ✓     |
| Slide 3 — data provenance                          | "Lessmann (2014) assembled them"  | index.md:74                                      | ✓     |
| Slide 3 — synthetic framing                        | "synthetic data"                  | index.md:70, 74                                  | ✓     |
| Slide 4 — figure                                   | ../r_kuznets_04_crosssection_polys.png | index.md:356 (same figure)                  | ✓     |
| Slide 4 — caption claim                            | line / quadratic / cubic upturn   | index.md:358                                     | ✓     |
| Slide 5 — WCV named                                | "weighted coefficient of variation (WCV)" | index.md:80                              | ✓     |
| Slide 5 — semiparametric names                     | Robinson, Baltagi–Li              | index.md:84                                      | ✓     |
| Slide 7 — WCV equation                             | `\mathrm{WCV} = \frac{1}{\bar{y}}[\sum_j p_j(\bar{y}-y_j)^2]^{1/2}` | index.md:286 | ✓ (i,t and j=1..n subscripts dropped) |
| Slide 7 — country count                            | 56 countries                      | index.md:280; results_report.md:18               | ✓     |
| Slide 7 — period                                   | 1980–2009                         | index.md:280                                     | ✓     |
| Slide 7 — sample size                              | 890 annual observations           | index.md:280; results_report.md:18               | ✓     |
| Slide 8 — figure                                   | ../r_kuznets_03_gini_vs_wcv.png   | index.md:324                                     | ✓     |
| Slide 8 — Gini intercept                           | 0.31                              | index.md:321 (0.311)                             | ✓ (rounded) |
| Slide 8 — Gini slope                               | 0.21                              | index.md:321 (0.208)                             | ✓ (rounded) |
| Slide 8 — t statistic                              | t = 2.5                           | index.md:321 (t = 2.45)                          | ✓ (rounded) |
| Slide 8 — correlation                              | r = 0.32                          | index.md:326 (0.316)                             | ✓ (rounded) |
| Slide 9 — figure                                   | ../r_kuznets_table2_crosssection.png | index.md:352                                  | ✓     |
| Slide 9 notes — col 4 coefficients                 | +0.34\* / −0.02\*\*               | index.md:354 (+0.338\*, −0.020\*\*)              | ✓ (rounded) |
| Slide 9 notes — col 5 verdict                      | "cubic significant — the N-shape" | index.md:354                                     | ✓     |
| Slide 10 — figure                                  | ../r_kuznets_07_turning_points.png| index.md:425                                     | ✓     |
| Slide 10 — derivative equation                     | β₁ + 2β₂Y + 3β₃Y² = 0             | index.md:409                                     | ✓ (Unicode, see Issue #2) |
| Slide 10 — peak                                    | ≈ \$2,100                         | index.md:427; results_report.md:44 (\$2,146)     | ✓     |
| Slide 10 — trough                                  | ≈ \$31,000                        | index.md:427; results_report.md:44 (\$31,443)    | ✓     |
| Slide 11 — discriminant formula                    | $D=\beta_2^2-3\beta_1\beta_3$     | index.md:433                                     | ✓     |
| Slide 11 — three regimes                           | D>0 / D=0 / D<0                   | index.md:437–441 (table)                         | ✓     |
| Slide 11 — cross-section discriminant              | $D=+0.006>0$                      | index.md:487 / results_report.md:49 (**+0.0055**)| ✗ (Issue #9) |
| Slide 11 — both turning points in range            | "both turning points in range"    | index.md:487                                     | ✓     |
| Slide 11 — panel verdict                           | insignificant; TP far outside data| index.md:488                                     | ✓     |
| Slide 12 — figure                                  | ../r_kuznets_14_discriminant_regimes.png | index.md:464                              | ✓     |
| Slide 12 notes — BMA/PIP aside                     | "high PIP ≠ a genuine bend" (Mendez 2026) | index.md:494                             | ✓     |
| Slide 13 — feols spec                              | `wcv ~ lnGDP + I(lnGDP^2) \| country + year, vcov="hetero"` | index.md:165 (concept card) | ✓ (but see Issue #10 vs index.md:379) |
| Slide 13 — panel quadratic                         | +0.39\*\* / −0.021\*\*            | index.md:391 (+0.394\*\*, −0.0211\*\*)           | ✓ (rounded) |
| Slide 13 — cubic term                              | "insignificant"                   | index.md:391 (−0.0008, t = −0.26)                | ✓     |
| Slide 13 — between-country claim                   | "a *between*-country artefact"    | index.md:391; results_report.md:54               | ✓     |
| Slide 14 — figure                                  | ../r_kuznets_06_twfe_fit.png      | index.md:393                                     | ✓     |
| Slide 14 — TWFE peak                               | near \$18,000                     | index.md:395 (ln GDP ≈ 9.8, ~\$18,000)           | ✓     |
| Slide 15 — figure                                  | ../r_kuznets_08_robinson_partial.png | index.md:522                                  | ✓     |
| Slide 15 — caption                                 | Robinson (1988), 90% band, upturn | index.md:524; results_report.md:63               | ✓     |
| Slide 15 notes — Baltagi–Li agreement              | "B-spline FE agrees within countries" | index.md:547                                 | ✓     |
| Slide 17 — figure                                  | ../r_kuznets_11_sectoral.png      | index.md:563                                     | ✓     |
| Slide 17 — sectoral claim                          | non-agricultural share → inverted-U | index.md:565 (+0.0165\*\*\*, −0.00014\*\*\*)   | ✓     |
| Slide 18 — figure                                  | ../r_kuznets_12_log_vs_level.png  | index.md:585                                     | ✓     |
| Slide 18 — fragility claim                         | levels yes, logs no               | index.md:587                                     | ✓     |
| Slide 19 — estimator list                          | OLS, fixest TWFE, 2 semiparametric| index.md:603                                     | ✓     |
| Slide 19 — turning points restated                 | ~\$2,100 and ~\$31,000            | index.md:427                                     | ✓     |
| Slide 19 — between vs within                       | "upturn is between-country"       | index.md:605                                     | ✓     |
| Slide 19 — policy line                             | "transitional feature"            | index.md:599                                     | ✓     |
| Slide 20 notes — reference                         | Lessmann 2014, JDE 106, 35–51     | index.md:618                                     | ✓     |
| Figure paths on disk                               | 9 referenced                      | smoke-test: 9/9 resolve                          | ✓     |

Every ✗ is an issue listed above (Issue #9). No invented or contradicted value was found.

---

## Title sequence (assertion-title test)

Read in order, the slide titles should form the talk's abstract:

1. Spatial Inequality and the Kuznets Curve *(title slide)*
2. The Tension *(Act I divider)*
3. Why do some countries have huge regional gaps and others almost none?
4. Two pictures of the same question — and they disagree
5. Where we're going *(label)*
6. The Investigation *(Act II divider)*
7. We *compute* inequality, not assume it
8. Spatial inequality is related to personal inequality — but not the same
9. Cross-section: the inverted-U emerges with controls, and a cubic adds the upturn
10. Where does the curve turn? Set the derivative to zero
11. Significant ≠ a genuine bend — check the discriminant
12. The discriminant decides the shape
13. Fixed effects change the story, not just the standard errors
14. The within-country inverted-U *(label)*
15. Semiparametric, no polynomial assumed — same shape
16. The Resolution *(Act III divider)*
17. Structural change is the mechanism
18. The high-income upturn is real but fragile
19. What we learned *(label)*
20. Thank you *(not a thesis)*

**Verdict:** coherent abstract with label-title gaps at slides 5, 14 and 19, and a non-declarative closing at slide 20. Titles 7–13 are the strongest run in the deck — read alone they carry the measurement → cross-section → turning-point → discriminant → fixed-effects argument without a gap. Dividers match their acts (Tension / Investigation / Resolution). No duplicated titles.

---

## Positive highlights

- **Slide 11 — "Significant ≠ a genuine bend — check the discriminant"** turns §7.3, the post's subtlest and most transferable lesson (`index.md:468–492`), into a six-word title and four checkable bullets, including the in-range check that most write-ups omit.
- **Branding is untouched.** `diff` against both canonical templates in `write-slides/references/templates/` is empty for `site-brand.scss` *and* `title-slide.html`, and the only three hex values in `slides.qmd` are the brand dividers `#d97757` / `#6a9bcc` / `#00d4c8` (slides.qmd:39, 73, 152). No per-deck theming drift at all.
- **Slide 13 — "Fixed effects change the story, not just the standard errors"** states the post's central methodological contrast (`index.md:395`) in nine words, and its three bullets deliver the between-vs-within resolution the whole deck builds toward.
- **Every one of the 9 figures carries a finding as its caption, not a label** — e.g. slides.qmd:166 "It appears in income levels, vanishes in logs (and within countries)" and slides.qmd:158 "Replace income with the non-agricultural share of output — the inverted-U returns." All 9 `../r_kuznets_*.png` paths resolve on disk.
- **Numbers are faithful throughout.** The title strip, both turning points, the panel coefficients, the TWFE peak and the Gini regression all trace to `results_report.md` / `index.md` with correct signs, correct magnitudes and sensible slide-level rounding — 48 traced data points, one rounding nit.

---

## Priority action items

1. **[MED]** Add a `[…]{.takeaway .fragment}` card to each of the 16 content slides — `index.html` currently contains **zero**. This is the single change that most improves Dimension 7, and four worked examples are in the rewrites above.
2. **[MED]** Replace slide 20's "Thank you" with one declarative thesis sentence (rewrite for Issue #6), keeping the resource URL as a sub-line.
3. **[MED]** Convert the three label titles (slides 5, 14, 19) to assertions and split the two walls of prose (slides 3, 7) — rewrites for Issues #3, #4, #7, #14.
4. **[MED]** Add `::: {.notes}` to the seven content slides that have none (5, 7, 11, 13, 14, 18, 19), using the prose removed from the slides in item 3.
5. **[MED]** Convert slide 10's caption from Unicode to LaTeX — `$\partial \mathrm{WCV}/\partial \ln(\mathrm{GDP}) = \beta_1 + 2\beta_2 Y + 3\beta_3 Y^2 = 0$` — and, while re-rendering, correct `$D=+0.006$` to `$D=+0.0055$` on slide 11 (Issue #9).

---

## Screenshots (HIGH-severity visual issues only)

None found. (Browser pass skipped — `--no-browser`.)

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_kuznets

To re-check just the dimension you fixed:

    /project:review-slides r_kuznets focus: design

---

## Audit metadata

- Node version: v25.9.0
- Playwright: disabled (--no-browser)
- smoke-test.js: **PASS** (15 of 15 checks; exit 0) — index.html · slides_files/ · slides.qmd · reveal structure · title key-result strip (3 stats) · chalkboard · menu · speaker notes · MathJax referenced (6 math spans) · MathJax `\(…\)` delimiters · 3 brand dividers · 23 `<section>` tags (in 6..60) · 9/9 figure paths resolve · no leaked `{{…}}`
- Branding diff: **clean** — `site-brand.scss` diff empty; `title-slide.html` diff empty (no `$sep$`/`kr-arrow` variation present, and none needed: the title-slide.html partial is byte-identical to the template)
- Design/branding (browser pass): not audited (`--no-browser`). Static substitutes: background/accent-rule/byline are theme-provided by the unmodified `site-brand.scss` + `title-slide.html`; pipeline `none` (no `kr-arrow` in the partial, correct for the mixed word/number strip); **takeaway-cards 0** via `grep -c 'class="[^"]*takeaway' index.html`.
- Tooling notes: `index.html` is 34,439 bytes (> 30 KB floor); `slides_files/libs/` present; rendered `<h2>` titles match `slides.qmd` one-for-one, so source and output are in sync (index.html Jul 8 22:14 > slides.qmd Jul 8 20:21). `index.md:21` links the deck as `url: slides/index.html` — no trailing-slash bug. Deck contains no executable or fenced code blocks.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
