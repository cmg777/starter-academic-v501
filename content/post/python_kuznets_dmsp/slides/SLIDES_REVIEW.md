# Review: python_kuznets_dmsp Slide Deck

**Audited:** content/post/python_kuznets_dmsp/slides/
**Source of truth:** content/post/python_kuznets_dmsp/index.md + results_report.md (+ script.py, execution_log.txt, python_kuznets_dmsp_table*.csv)
**Date:** 2026-08-04
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** skipped (--no-browser)

---

## Verdict: MAJOR REVISION

**Overall assessment.** The deck is unusually strong on branding and on number-level fidelity — every coefficient, standard error, correlation, and sample size on a slide traces cleanly to `index.md` / `results_report.md`, and both theme files are byte-identical to the canonical templates (Dimension 8 = 10/10). The blocker is a single broken deliverable: slide 13 renders `../python_kuznets_dmsp_11_table4.png`, a figure that does not exist anywhere in the post bundle (the post presents Table 4 as `table4_determinants.html`), so `smoke-test.js` exits 1 and the slide will show a broken-image box under an assertion title it can no longer prove. The weakest scored dimension is readability (4/10): six on-slide sentences run 26–38 words, including two `.takeaway` cards that carry two sentences each. Fix the figure and cut the six long sentences and the deck is close to ACCEPT.

**Audited 10 of 10 dimensions.** Browser-only checks (does math actually typeset; 960×700 overflow) are marked `[~]` and excluded.

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                                        |
|----|-------------------------------|-----------:|--------:|--------------------------------------------------------------|
| 1  | Source fidelity               | 4          | 1H/0M/2L | 47 of 48 slide data trace to source; 1 figure has no source  |
| 2  | Conceptual correctness        | 7          | 0H/1M/2L | estimand stated correctly; effect-size framing loose          |
| 3  | Technical & render correctness| 3          | cross-listed #1 | smoke-test FAIL (14/15); math render `[~]` (no browser) |
| 4  | Title↔body consistency        | 7          | 0H/1M/0L | assertion-title test: passes except slide 3                   |
| 5  | Readability & simplicity      | 4          | 0H/6M/2L | 8 over-length lines; 2 walls of prose                         |
| 6  | Typos & grammar               | 9          | 0H/0M/1L | no typos; mixed -ise/-ize spelling                            |
| 7  | write-slides design adherence | 6          | 0H/2M/1L | arc: Act III over-extended; closing ok; no code slide         |
| 8  | Branding integrity            | 10         | none    | scss/title-slide diff clean; numeric strip, no arrows          |
| 9  | Accessibility & legibility    | 9          | 0H/0M/1L | all 5 figures captioned; overflow `[~]` (no browser)          |
| 10 | Deliverable completeness      | 5          | cross-listed #1 | link ok (`slides/index.html`); 4/5 figure paths resolve |

Skipped dimensions show `—` in the score column with `not audited` in Notes.

---

## Issues found

| #  | Dim | Severity | Location                                                        | Issue                                                                                                        | Suggested fix                                                                                 |
|---:|----:|----------|-----------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| 1  | 1   | HIGH     | slides.qmd:211 — slide 13 "Ranked side by side: ethnicity towers…" | `![…](../python_kuznets_dmsp_11_table4.png)` does not exist. Post bundle has no `_11_table4.png`; the post renders Table 4 as `table4_determinants.html` (index.md:1493). Smoke test fails on this path. | Replace the figure with an on-slide Markdown table of the five determinants (see rewrite below), or generate the missing PNG in `script.py` before re-rendering. Cross-listed: Dim 3, Dim 10. |
| 2  | 5   | MED      | slides.qmd:57 — slide 1 "Almost every country reports one GDP number…" | 27-word sentence; three prose sentences stacked on one slide (wall of prose).                                  | Keep one anchor line; move the rest to `::: {.notes}`. See rewrite.                            |
| 3  | 5   | MED      | slides.qmd:65 — slide 2 "The idea: let satellites do the accounting…" | 28-word sentence with two subordinate clauses.                                                                 | Split into two short sentences. See rewrite.                                                   |
| 4  | 5   | MED      | slides.qmd:112 — slide 5 "Light becomes income through a calibrated elasticity…" | `.takeaway` card is 38 words plus a second sentence — a term-by-term reading of the equation, not a conclusion. | Move the term-by-term gloss to notes; leave one conclusion on the card. See rewrite.            |
| 5  | 5   | MED      | slides.qmd:146 — slide 8 "Five inequality indices, built from scratch…" | 31-word `.takeaway` card listing all five index names inline.                                                  | Shorten to the conclusion; the names are already in the notes. See rewrite.                    |
| 6  | 5   | MED      | slides.qmd:223 — slide 14 "Allowing neighbours to share shocks…"  | 36-word caption sentence carrying four SE values that the table directly below repeats.                        | Cut the caption to its finding; the table holds the numbers. See rewrite.                      |
| 7  | 5   | MED      | slides.qmd:243 — slide 15 "Does machine-assembled satellite data make this causal? No" | Three-sentence rebuttal (middle sentence 30 words) — a paragraph on a slide.                                   | Two short clauses on the slide, the rest to notes. See rewrite.                                |
| 8  | 4   | MED      | slides.qmd:81 — slide 3 "Where we're going"                       | Label (agenda) title, not an assertion; breaks the titles-as-abstract sequence between slides 2 and 4.         | Retitle to the claim the slide makes, e.g. "Four steps: calibrate, construct, curve, drivers". |
| 9  | 7   | MED      | slides.qmd:197 and 219 — dividers "The Drivers" / "Robustness"    | Act III spans 3 dividers and 6 content slides; the arc prescribes 2–4 resolution slides and 60–75% of the deck in Act II. Act II holds only 6 of 15 content slides (40%). | Relabel "The Drivers" and "Robustness" as `[Act II]`; keep "The Result" + closing as Act III.  |
| 10 | 7   | MED      | deck-wide (no code fence in slides.qmd)                           | A Python tutorial deck contains zero code slides; `slide-mapping.md` maps `script.py` excerpts → Code archetype (7). The two headline code moves (`pf.feols` ladder, the from-scratch Gini) never appear. | Add one `{.python}` code slide for `ineq_indices` (index.md:1051–1057), the deck's most transferable artefact. |
| 11 | 2   | MED      | slides.qmd:203 — slide 12 "Beyond income, ethnic inequality is the strongest driver" | `.bignum-label` sets the ethnic-Gini **coefficient** 0.071 beside "a mean regional Gini of 0.064" — a slope and a level in the same comparison. A 1-unit move in a 0–1 index is not a realistic contrast. | State a realistic dose: "a 0.1 higher ethnic Gini ⇒ +0.007 regional Gini, ~11% of the 0.064 mean". |
| 12 | 5   | LOW      | slides.qmd:130 — slide 7 caption                                  | 25-word caption sentence.                                                                                      | Trim to the finding. See rewrite.                                                              |
| 13 | 5   | LOW      | slides.qmd:154 — slide 9 caption                                  | 23-word caption sentence carrying two parenthetical numbers.                                                   | Trim to the finding. See rewrite.                                                              |
| 14 | 1   | LOW      | slides.qmd:102 — slide 4 takeaway                                 | "Mean regional Gini $= 0.064$ (SD $0.033$, max $0.163$)" — mean and max are the pooled values (index.md:574), but 0.033 is the **2012 cross-sectional** SD from `summary_country.html` (1992 SD = 0.0348). Three statistics of different scope read as one distribution. | Drop the SD, or label it "SD 0.033 in 2012".                                                   |
| 15 | 1   | LOW      | slides.qmd:214 — slide 13 speaker notes                           | "The sample size drifts across columns (857 down to 585)"; index.md:1504 reports the drift as 879 → 573 (`table4_results.csv`: 857 / 817 / 672 / 573 / 585 / 844).                              | Change to "879 down to 573" to match the post.                                                 |
| 16 | 2   | LOW      | slides.qmd:118 — slide 6 title                                    | "regional income tracking national income one-for-one"; the post says "almost one-for-one" for 0.889 (index.md:896).                                                                             | Add "almost": "…tracking national income almost one-for-one".                                  |
| 17 | 2   | LOW      | slides.qmd:199 — slide 12 title                                   | "strongest driver" is causal wording; `results_report.md:45` calls it the "strongest correlate" and the deck's own slide 15 insists these are associations.                                       | "…ethnic inequality is the strongest correlate — by far".                                      |
| 18 | 6   | LOW      | slides.qmd:206, 211 vs 178, 130                                   | Mixed British/American suffixes: "equalizes"/"equalizing" (-ize) against "generalises"/"industrialisation" (-ise). The post is consistently -ise.                                                  | Change to "equalises"/"equalising".                                                            |
| 19 | 7   | LOW      | slides 7, 11, 13 (slides.qmd:130, 189, 211)                       | Three substantive content slides end without a `[…]{.takeaway .fragment}` card (5 cards across 15 content slides); slide 11's incremental list ends the slide with no conclusion.                 | Promote each slide's concluding line to a `.takeaway` card.                                    |
| 20 | 9   | LOW      | slides.qmd:223 + 225–229 — slide 14                               | The caption states SE 0.013 / 0.026 / 0.034 / 0.037 and the table immediately below repeats 0.013 / 0.026 / 0.037 — duplicated numbers on an already dense slide.                                 | Let the table carry the numbers; the caption carries the finding.                              |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide 1 "Almost every country reports one GDP number — and nothing about its insides"**

Before:
> A government can tell you its national GDP, but rarely the income of each province inside it.
>
> Two countries with the *same* national income can look completely different on the inside — one a single booming capital ringed by poor hinterlands, the other broadly shared. **Without subnational data, that gap is invisible.**

After (on slide):
> Every country reports one GDP number.
>
> Almost none report the income of each province inside it.
>
> **That gap is invisible without subnational data.**

(move to `::: {.notes}`): "Two countries with the same national income can look completely different inside — one a booming capital ringed by poor hinterlands, the other broadly shared."

Why: 27-word sentence and three stacked prose sentences → three lines of 6, 11 and 7 words; the contrast becomes speech, not text.

---

**Issue #3 — slide 2 "The idea: let satellites do the accounting — brighter places are, on average, richer"**

Before:
> Lessmann and Seidel (2017) use **nighttime light** as a stand-in for income: electricity, roads, and activity all glow, so brightness correlates with output where statistics do not exist.

After:
> Lessmann and Seidel (2017) use **nighttime light** as a stand-in for income.
>
> Electricity, roads and activity all glow — so brightness tracks output where statistics do not.

Why: 28 words with two subordinate clauses → two sentences of 12 and 15 words; "correlates with" → "tracks".

---

**Issue #4 — slide 5 "Light becomes income through a calibrated elasticity, net of national income and geography"**

Before:
> [A region's log income $y_r$ = baseline, plus elasticity $\beta_1$ on its log light $\ell_r$, plus a near-one-for-one adjustment $\beta_2$ for its country's income $g_c$, plus geography $X_r$, world-region $\mu_g$ and satellite $\tau_s$ effects. The number we care about is $\beta_1$.]{.takeaway .fragment}

After (on slide):
> [Everything except light is a control. The number we care about is $\beta_1$.]{.takeaway .fragment}

(move to `::: {.notes}`): "Read the equation term by term: log regional income equals a baseline, plus the light elasticity β1 on log light, plus a near-one-for-one adjustment β2 for the country's income, plus geography, world-region and satellite effects."

Why: 38-word takeaway carrying a second sentence → one 13-word conclusion; the term-by-term reading is what the speaker says aloud.

---

**Issue #5 — slide 8 "Five inequality indices, built from scratch and weighted by population"**

Before:
> [Each country's regional incomes $y_i$ and populations $w_i$ collapse to one number: the Gini, three generalized-entropy indices GE($-1$)/GE($0$)/GE($1$), and the coefficient of variation — every region counting in proportion to its people.]{.takeaway .fragment}

After:
> [One function turns a country's regions into five indices — each region counting its people.]{.takeaway .fragment}

Why: 31 words → 14; the five index names are already spelled out in the speaker notes.

---

**Issue #6 — slide 14 "Allowing neighbours to share shocks doubles the standard error — the elasticity still holds"**

Before:
> Conley spatial-HAC standard errors for the clean light elasticity ($\beta = 0.190$). The confidence interval widens with the radius — SE rises from 0.013 (iid) to 0.026/0.034/0.037 at 1,000/2,500/5,000 km — while the point estimate stays fixed and far from zero.

After:
> Conley spatial-HAC standard errors for the clean light elasticity ($\beta = 0.190$). The interval widens with the radius; the estimate does not move.

Why: 36-word caption sentence → 11 words; the four SE values live in the table directly below (also resolves issue #20).

---

**Issue #7 — slide 15 "Does machine-assembled satellite data make this causal? No"**

Before:
> [Response.]{.rebuttal} No. The lights→GDP step is a *prediction* model, not a structural relationship; the Kuznets and determinant regressions are within-country **associations** conditional on the FE, not causal effects. The income figures are predictions — accurate on average, wrong for any single unusual region.

After (on slide):
> [Response.]{.rebuttal} No. Lights→GDP is a **prediction** model, not a structural one.
>
> The Kuznets and determinant results are **associations**, not causal effects.

(move to `::: {.notes}`): "And every income figure here is a prediction — accurate on average, wrong for any single unusual region."

Why: three sentences (middle one 30 words) → two lines of 11 and 10 words; the caveat about single regions is a spoken aside.

---

**Issue #12 — slide 7 "The predictions hug the 45° line across four orders of magnitude of income"**

Before:
> Predicted vs observed log regional GDP per capita, 5,258 region-years. The scatter tracks the 45° line from the poorest regions to the richest — the calibration generalises rather than fitting one income band ($r = 0.925$).

After:
> Predicted vs observed log regional GDP per capita, 5,258 region-years ($r = 0.925$). The fit holds from the poorest regions to the richest.

Why: 25-word second sentence → 10 words; "generalises rather than fitting one income band" is the speaker's line, not the caption's.

---

**Issue #13 — slide 9 "Population weights are not cosmetic — they correlate only 0.75 with equal weights"**

Before:
> Population-weighted vs equal-weight Gini across country-years. Most points sit below the 45° line: weighting lowers measured inequality (mean gap $-0.0034$) because tiny income-extreme regions lose influence (corr $= 0.75$).

After:
> Population-weighted vs equal-weight Gini across country-years (corr $= 0.75$). Most points sit below the 45° line: weighting lowers measured inequality by $0.0034$ on average.

Why: 23-word second sentence → 17 words; the mechanism ("tiny income-extreme regions lose influence") is already the first line of the speaker notes.

---

## HIGH-issue rewrites

**Issue #1 — Dimension 1 — slide 13 "Ranked side by side: ethnicity towers; farmland pulls the other way"**

Before (slides.qmd:211):
> `![Determinants of regional inequality. Ethnic inequality (0.071) dwarfs resource rents (+0.018), aid (+0.015), and trade (+0.005); arable land (−0.053) is the largest equalizing force.](../python_kuznets_dmsp_11_table4.png)`

After (no PNG exists; render the same content as a table, matching index.md:1495–1500 and `python_kuznets_dmsp_table4_results.csv`):
> ```
> | Determinant (on top of the cubic + FE) | Coefficient | Direction |
> |---|---:|:--|
> | Ethnic inequality | [$+0.071$]{.key} | concentrates |
> | Resource rents | $+0.018$ | concentrates |
> | Aid / GDP | $+0.015$ | concentrates |
> | Trade openness | $+0.005$ | concentrates |
> | Arable-land share | $-0.053$ | equalises |
>
> [Ethnic division concentrates; broad-based farming spreads.]{.takeaway .fragment}
> ```

Why: the referenced PNG is absent from the post bundle (the post itself uses the HTML table `table4_determinants.html`), so the slide renders a broken image and `smoke-test.js` exits 1. The table carries the identical, source-verified numbers and simultaneously closes issue #19 for this slide. The alternative fix is to add a Table-4 bar chart to `script.py` and regenerate.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum | Value on slide | Source location | Match |
|---|---|---|---|
| Title strip stat 1 | 0.102 light elasticity | results_report.md:13; index.md:888 | ✓ |
| Title strip stat 2 | 0.925 predicted vs observed | results_report.md:18; index.md:941 | ✓ |
| Title strip stat 3 | 0.071 ethnic Gini | results_report.md:47; index.md:1495 | ✓ |
| Slide 4 — calibration sample | 5,258 region-years | index.md:375, 383 | ✓ |
| Slide 4 — regions / countries | 1,504 regions, 81 countries | index.md:383 | ✓ |
| Slide 4 — country panel | 180 countries, 1992–2012 | index.md:386 | ✓ |
| Slide 4 — mean regional Gini | 0.064 | index.md:574, 581 | ✓ |
| Slide 4 — SD | 0.033 | summary_country.html via index.md:488 (2012 column; 1992 = 0.0348) | ⚠ scope mismatch (issue #14) |
| Slide 4 — max regional Gini | 0.163 | index.md:574 | ✓ |
| Slide 5 — calibration equation | $y_r=\beta_0+\beta_1\ell_r+\beta_2 g_c+\gamma'X_r+\mu_g+\tau_s+\varepsilon_r$ | index.md:702 (Goldmark `\_` escaping correctly dropped) | ✓ |
| Slide 6 — bignum | 0.102 | index.md:888; table1_results.csv `col7_light_RE` | ✓ |
| Slide 6 — national-GDP elasticity | 0.889 | index.md:889; table1_results.csv `col7_natgdp_RE` | ✓ |
| Slide 6 — notes, FE col 7 | 0.049 | index.md:793; table1_results.csv | ✓ |
| Slide 6 — notes, col 2 FE=RE | 0.190 | index.md:799; results_report.md:13 | ✓ |
| Slide 7 — figure | `../python_kuznets_dmsp_06_predicted_vs_observed.png` | index.md:955 (same figure) | ✓ |
| Slide 7 — correlation | $r = 0.925$ | index.md:941 | ✓ |
| Slide 8 — three ingredient equations | $\bar y$, $p_i$, $r_i$ | index.md:977–979 | ✓ |
| Slide 8 — notes, Germany 2010 | 16 regions, Gini 0.028 | index.md:1086–1091 | ✓ |
| Slide 9 — figure | `../python_kuznets_dmsp_07_population_weights.png` | index.md:1123 (same figure) | ✓ |
| Slide 9 — weighted vs equal corr | 0.75 | index.md:1119 | ✓ |
| Slide 9 — mean gap | −0.0034 | index.md:1120 | ✓ |
| Slide 9 — notes, Table 2 gap | 0.49 vs 0.21 | index.md:1152–1153 | ✓ |
| Slide 10 — Kuznets equation | GINIW cubic with $\alpha_c+\delta_t$ | index.md:1177 | ✓ |
| Slide 10 — table cell $\beta_1$ `[.key]` | 0.293 | index.md:1215; table3_results.csv | ✓ |
| Slide 10 — table cell $\beta_2$ | −0.032 | index.md:1216; table3_results.csv | ✓ |
| Slide 10 — table cell $\beta_3$ | 0.001 | index.md:1217 (0.0011 exact) | ✓ |
| Slide 10 — N / countries | 879 / 180 | index.md:1218 | ✓ |
| Slide 11 — figure | `../python_kuznets_dmsp_10_kuznets_scatter.png` | index.md:1298 (same figure) | ✓ |
| Slide 11 — peak income | ≈ \$3,000 per capita | index.md:1300–1301 | ✓ |
| Slide 12 — bignum | 0.071 | index.md:1495; table4_results.csv (0.0709) | ✓ |
| Slide 12 — p-value | $p < 0.001$ | index.md:1495; table4_results.csv | ✓ |
| Slide 12 — N | 844 | results_report.md:47; execution_log.txt:79 | ✓ |
| Slide 12 — comparison value | mean regional Gini 0.064 | index.md:581 | ✓ (framing flagged, issue #11) |
| Slide 12/13 — resource rents | +0.018 | index.md:1497; table4_results.csv (0.0183) | ✓ |
| Slide 12/13 — arable land | −0.053 | index.md:1498; table4_results.csv (−0.0529) | ✓ |
| Slide 12/13 — trade openness | +0.005 | index.md:1499; table4_results.csv (0.0051) | ✓ |
| Slide 12/13 — aid / GDP | +0.015 | index.md:1500; table4_results.csv (0.0152) | ✓ |
| Slide 12 — notes, ICRG omitted | "cannot be reproduced and is omitted" | index.md:1502; results_report.md:154 | ✓ |
| **Slide 13 — figure** | `../python_kuznets_dmsp_11_table4.png` | **no such file; post uses `table4_determinants.html` (index.md:1493)** | **✗ (issue #1)** |
| Slide 13 — notes, N drift | "857 down to 585" | index.md:1504 says 879 → 573 | ⚠ (issue #15) |
| Slide 14 — figure | `../python_kuznets_dmsp_12_conley_se.png` | index.md:1533 (same figure) | ✓ |
| Slide 14 — point estimate | $\beta = 0.190$ | index.md:1511; tableB4_results.csv | ✓ |
| Slide 14 — table cell, iid SE | 0.013 | index.md:1530; tableB4_results.csv (0.0128) | ✓ |
| Slide 14 — table cell, Conley 1,000 km | 0.026 | index.md:1527 | ✓ |
| Slide 14 — caption, Conley 2,500 km | 0.034 | index.md:1528 | ✓ |
| Slide 14 — table cell `[.key]`, 5,000 km | 0.037 | index.md:1529 | ✓ |
| Slide 14 — t-statistics | 14 / 7 / 5 | derived 0.190 ÷ SE; "t above 5" at index.md:1537 | ✓ |
| Slide 15 — prediction-not-structural claim | "prediction model, not a structural relationship" | index.md:1583–1585; results_report.md:156–158 | ✓ |
| Closing — notes, headline recap | 0.102 · 0.925 · "twice as well" | index.md:1571–1573 | ✓ |
| Code blocks on slides | none present | — (see issue #10) | n/a |

Every ✗ is a HIGH issue listed above.

---

## Title sequence (assertion-title test)

Read in order, the slide titles should form the talk's abstract:

1. The Problem *(divider, Act I)*
2. Almost every country reports one GDP number — and nothing about its insides
3. The idea: let satellites do the accounting — brighter places are, on average, richer
4. Where we're going
5. The Calibration *(divider, Act II)*
6. The lab: 5,258 region-years calibrate the model; 180 countries get measured
7. Light becomes income through a calibrated elasticity, net of national income and geography
8. The calibrated light elasticity is 0.102, with regional income tracking national income one-for-one
9. The predictions hug the 45° line across four orders of magnitude of income
10. The Construction *(divider, Act II)*
11. Five inequality indices, built from scratch and weighted by population
12. Population weights are not cosmetic — they correlate only 0.75 with equal weights
13. The Result *(divider, Act III)*
14. With country and period fixed effects, the regional Kuznets curve is an N — not a single hump
15. Three development phases, one descriptive association
16. The Drivers *(divider, Act III)*
17. Beyond income, ethnic inequality is the strongest driver — by far
18. Ranked side by side: ethnicity towers; farmland pulls the other way
19. Robustness *(divider, Act III)*
20. Allowing neighbours to share shocks doubles the standard error — the elasticity still holds
21. Does machine-assembled satellite data make this causal? No
22. You can now see inequality inside a country with no statistical office. *(closing divider)*

**Verdict:** coherent abstract with one label title at slide 3 ("Where we're going"). Read without slide 3, titles 2 → 22 state the whole argument: problem → idea → calibration → validation → construction → weighting → curve shape → phases → drivers → robustness → causal caveat → thesis. Slide 11's title is descriptive rather than a claim but still advances the sequence. No title contradicts its body (slide 18 will, once rendered, be un-proven by a broken image — that is issue #1, not a separate title defect). Closing slide is one declarative sentence, not "Questions?" / "Thank you" — passes.

---

## Positive highlights

- **Slide 20's title does the whole robustness section in one line** — "Allowing neighbours to share shocks doubles the standard error — the elasticity still holds" (slides.qmd:221) names the threat, the cost, and the verdict before the audience sees a single number.
- **The estimand discipline is exemplary and consistent.** Slide 15's notes (slides.qmd:192) state "within-country conditional association, not a causal effect", slide 21 restates it as the Devil's-Advocate rebuttal, and the closing notes repeat both cautions. Nothing in the deck overclaims causality — a rare pass for a satellite-data talk.
- **Branding is untouched.** `site-brand.scss` and `title-slide.html` are byte-identical to the canonical templates; the numeric key-result strip (0.102 / 0.925 / 0.071) correctly uses no `kr-arrow` pipeline, and every divider colour (`#d97757`, `#6a9bcc`, `#00d4c8`, `#141413`) is on-palette.
- **Every equation is correctly re-escaped for Pandoc.** The calibration model (slides.qmd:110), the three inequality ingredients (slides.qmd:142–144) and the Kuznets cubic (slides.qmd:166–167) drop `index.md`'s Goldmark `\_` escaping and use plain `$…$` / `$$…$$` — exactly the `slide-mapping.md` porting rule, and the smoke test confirms 43 MathJax spans with correct `\(…\)` delimiters.
- **Fragment pacing is disciplined throughout.** No slide exceeds 4 advances (slide 2's `. . .` + 3 incremental items and slide 4's 4-item list are the maximum), and no slide carries more than 4 bullets.

---

## Priority action items

1. **[HIGH]** Fix slide 13 (slides.qmd:211): the referenced `../python_kuznets_dmsp_11_table4.png` does not exist. Replace it with the determinants table given in the HIGH-issue rewrite (numbers already verified against `table4_results.csv`), or add the figure to `script.py` and regenerate. Re-run `smoke-test.js` until it exits 0.
2. **[MED]** Apply the eight Dimension-5 rewrites (issues #2–#7, #12, #13): six sentences of 26–38 words and two multi-sentence `.takeaway` cards become one-line anchors, with the explanatory prose moved to `::: {.notes}`.
3. **[MED]** Retitle slide 3 from the agenda label "Where we're going" to an assertion, and relabel the "The Drivers" and "Robustness" dividers `[Act II]` so Act III is the 2–4-slide resolution the arc prescribes (issues #8, #9).
4. **[MED]** Add one `{.python}` code slide for `ineq_indices` (index.md:1051–1057) — the deck's most transferable artefact and the post's own headline "coding trap" — and restate the 0.071 effect size at a realistic dose on slide 12 (issues #10, #11).
5. **[LOW]** Sweep the small fidelity/wording items: SD-scope on slide 4, "857 down to 585" → "879 down to 573" in slide 13's notes, "almost one-for-one" on slide 6, "correlate" for "driver" on slide 12, `-ise` spelling, and `.takeaway` cards on slides 7, 11, 13 (issues #14–#19).

---

## Screenshots (HIGH-severity visual issues only)

None found. (Browser pass skipped with `--no-browser`; no screenshots captured.)

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_kuznets_dmsp

To re-check just the dimension you fixed:

    /project:review-slides python_kuznets_dmsp focus: fidelity

---

## Audit metadata

- Node version: v25.9.0
- Playwright: disabled (--no-browser)
- smoke-test.js: FAIL — 14 of 15 checks passed, exit 1. Failing assertion: `[✗] every figure ../ path exists on disk (4/5 resolve; missing: ../python_kuznets_dmsp_11_table4.png)`. All other assertions passed, including reveal structure, title key-result strip (3 stats), chalkboard, menu, speaker notes, MathJax engine + `\(…\)` delimiters (43 spans), 9 brand dividers, 29 `<section>` tags, and no leaked `{{…}}`.
- Branding diff: clean — `site-brand.scss` and `title-slide.html` are both byte-identical to `.claude/skills/write-slides/references/templates/`.
- Design/branding (browser pass): not measured (`--no-browser`). Static equivalents: page background `#0f1729` inherited from the unmodified theme; key-result strip renders 3 `kr-num`/`kr-cap` pairs with **no** `kr-arrow` (correct for a numeric strip); takeaway-cards 5 (matches the 5 `.takeaway` spans in `slides.qmd`).
- Tooling notes: 23 slides (title + 7 dividers + 15 content) rendered as 29 `<section>` tags; `index.html` 47,592 bytes; `slides_files/` present; `index.md:20` links the deck as `url: slides/index.html` (no trailing-slash bug). Values cross-checked against `execution_log.txt` and `python_kuznets_dmsp_table{1,3,4,B4}_results.csv`. No file in the deck bundle other than this report was modified.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
