# Review: r_sc_dsc_sdid Slide Deck

**Audited:** content/post/r_sc_dsc_sdid/slides/
**Source of truth:** content/post/r_sc_dsc_sdid/index.md (no `results_report.md` in the bundle; `analysis.R` and the `*.csv` exports were read, never executed)
**Date:** 2026-08-04
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** skipped (--no-browser)

---

## Verdict: MINOR REVISION

**Overall assessment.** This is a technically clean, numerically faithful deck: the smoke test passes 15 of 15, `site-brand.scss` and `title-slide.html` are byte-identical to the canonical templates, and every one of the ~60 numbers, figures, table cells and equations on a slide traces to `index.md`. The strongest dimensions are technical/render correctness and branding integrity (both 10); the weakest are **source fidelity (6)**, **readability (6)** and **design adherence (6)** — none from bad data, all from presentation choices: the placebo table drops the row qualifier that its own next slide depends on, two slides carry stacked prose that belongs in speaker notes, and the deck ships **zero `[…]{.takeaway .fragment}` cards** across 26 content slides (only 4 of the site's 68 decks do this; the sibling `python_sc_dsc_sdid` deck has 31). The single fix that would most improve the argument is relabelling the placebo table row `SDID (i)` and restating the claim beneath it — right now the deck's sharpest contribution, the horizon audit, loses its setup.

**Audited 10 of 10 dimensions.** The browser-only checks inside Dimensions 3 and 9 (does math actually typeset; 960×700 overflow) are marked `[~]` and excluded from those dimensions' floors; their static parts ran in full.

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                                          |
|----|-------------------------------|-----------:|--------:|----------------------------------------------------------------|
| 1  | Source fidelity               | 6          | 0/2/5   | ~60 data points trace to index.md; 2 labelling/claim slips     |
| 2  | Conceptual correctness        | 7          | 0/1/2   | post's "marginal at best" caveat (index.md:888) absent         |
| 3  | Technical & render correctness| 10         | 0/0/0   | smoke-test PASS 15/15; math renders `[~]` (--no-browser)       |
| 4  | Title↔body consistency        | 7          | 0/1/1   | assertion-title test passes; 6 label titles (see Dim 7)        |
| 5  | Readability & simplicity      | 6          | 0/2/2   | 2 prose-wall slides, 4 sentences over 15 words, none over 25   |
| 6  | Typos & grammar               | 8          | 0/0/2   | no spelling errors; em-dashes correct; 2 consistency slips     |
| 7  | write-slides design adherence | 6          | 0/2/5   | arc is 4-act not 3; closing = Materials; 0 takeaway cards      |
| 8  | Branding integrity            | 10         | 0/0/0   | scss + title-slide diffs both empty; palette exact             |
| 9  | Accessibility & legibility    | 7          | 0/1/1   | all 7 figures use empty `![]()`; overflow `[~]`                |
| 10 | Deliverable completeness      | 10         | 0/0/0   | link `slides/index.html` ok; 42.9 KB html; 7/7 figures resolve |

Skipped dimensions show `—` in the score column with `not audited` in Notes.

---

## Issues found

| #  | Dim | Severity | Location                                          | Issue                                                                                  | Suggested fix                                                        |
|---:|----:|----------|---------------------------------------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| 1  | 1   | MED      | slides.qmd:281 — slide 24 "Which stage? A fire drill" | Row labelled `**SDID**`; index.md:1056 labels it `SDID (i)`. The two omitted rows, SDID (ii) and (iii), read 0.0134 — twice plain SC | Relabel the row `SDID (i)`; name the omitted variants in the notes   |
| 2  | 1   | MED      | slides.qmd:261 — slide 21 "Stages 4 and 5"        | "Both land inside the range the simpler stages already covered" — MASC's 2.73% is *below* SDID's 2.76%; index.md:936 calls it "the lowest on the ladder" | See rewrite below                                                    |
| 3  | 2   | MED      | deck-wide (no slide, no note)                     | The post's counterweight — SDID's gain over DSC is "marginal at best" and costs 85 extra parameters (index.md:888, 1316) — never appears | Add one line to the notes of slide 20 "Only one row is dark in both columns" |
| 4  | 4   | MED      | slides.qmd:287 — slide 24 "Which stage? A fire drill" | "The SDID family wins on every measure" is not proven by the 5-row table above it (one SDID row shown; as published, (ii)/(iii) rank last) | See rewrite below                                                    |
| 5  | 5   | MED      | slides.qmd:231-243 — slide 19 "The turkey"        | Five stacked prose sentences, one of 22 words                                          | See rewrite below                                                    |
| 6  | 5   | MED      | slides.qmd:70 — slide 3 "Build it out of the countries we do observe" | Three-sentence prose block trailing a four-bullet list                                 | See rewrite below                                                    |
| 7  | 7   | MED      | deck-wide (26 content slides)                     | Zero `[…]{.takeaway .fragment}` cards; `grep -c takeaway` returns 0 in both `slides.qmd` and `index.html` | Add the orange accent card to the ~12 substantive content slides     |
| 8  | 7   | MED      | slides.qmd:121, :144, :158, :229, :322, :341      | Label titles: "Stage 0 — Difference-in-differences", "Stage 1 — Synthetic control", "The rubber band", "The turkey", "What to take away", "Materials" | Convert to assertions (example in action item 5)                     |
| 9  | 9   | MED      | slides.qmd:74, :140, :160, :201, :247, :269, :318 | All seven figures use empty `![](…)` — no caption, therefore no alt text                | Reuse the post's alt text at index.md:389, 395, 540, 781, 858, 1014, 640 |
| 10 | 1   | LOW      | slides.qmd:10-11 — key-result strip               | "2.8%" appears nowhere else in the deck; index.md:1007 reports 2.76, and index.md:1232 uses "2.8%" as its own example of over-confident quoting — a warning this deck repeats in slides.qmd:338 | Use "2.76%", matching every other figure in the deck                 |
| 11 | 1   | LOW      | slides.qmd:253 — slide 21 "Stages 4 and 5"        | "Here it buys **16% matching**"; index.md:936 reports "15.8% matching and 84.2% synthetic control" | Write "15.8%", or say "about a sixth"                                |
| 12 | 1   | LOW      | slides.qmd:335 — slide 29 "And the answer, with its error bars" | "a 95% interval spans roughly 1% to 4.6%"; index.md:1232 says "roughly 0.9% to 4.6%"   | Restore 0.9%                                                          |
| 13 | 1   | LOW      | slides.qmd:121, :144, :166, :184, :251            | Deck numbers the stages 0-5; index.md §7-§13 numbers the same six estimators 1-6       | Match the post, or say once on-slide that DiD is "Stage 0, the ground floor" |
| 14 | 1   | LOW      | slides.qmd:146, :174                              | Sums run to $T_0$ (the `synthdid` convention); index.md:522, 681 run to $T_0-1$ (the paper convention). index.md §4.1 (:365-378) pins both down; the deck names neither | Add "$T_0 = 86$ pre-treatment quarters" to the slide or the notes    |
| 15 | 2   | LOW      | slides.qmd:307-311 — slide 26 "Covariates make it worse" | Omits index.md:1138 — MASC's placebo error *improves* with covariates (0.0080 → 0.0048) | One clause in the notes: "except MASC, which clearly benefits"       |
| 16 | 2   | LOW      | slides.qmd:335                                    | Permutation p-value and a 95% interval are merged in one sentence; index.md:1240 keeps randomisation inference and sampling error apart | Split into two lines, or draw the distinction in the notes           |
| 17 | 4   | LOW      | slides.qmd:309 — slide 26 "Covariates make it worse" | The first bullet ("reproduces the published 2.43% exactly") reconciles the literature; it is not evidence that covariates make anything worse | Move the 2.43% reconciliation to its own slide or to the notes       |
| 18 | 5   | LOW      | slides.qmd:223 — slide 18 "Two ways to be wrong"  | 21-word sentence with two subordinate clauses                                          | See rewrite below                                                    |
| 19 | 5   | LOW      | slides.qmd:82, :314                               | 23-word and 21-word sentences                                                          | See rewrite below                                                    |
| 20 | 6   | LOW      | slides.qmd:275 — slide 24 "Which stage? A fire drill" | "Move the treatment date back to twenty quarters when nothing happened" reads as a single move of twenty quarters; index.md:1034 means twenty separate fake dates | "Re-date the treatment to each of twenty quarters when nothing happened." |
| 21 | 6   | LOW      | slides.qmd:12 vs :204                             | The same quantity is "0.96" on the title strip and "**96%**" on the slide              | Pick one form (96% reads faster in both places)                      |
| 22 | 7   | LOW      | slides.qmd:39, :92, :209, :263                    | Four acts against the 3-act contract; Act IV ("The Verdict") runs 8 slides against the 2-4 resolution band | Fold "The Pivot" into Act II, or split Act IV's analysis from its resolution |
| 23 | 7   | LOW      | deck-wide                                         | No Devil's-Advocate slide (objection in orange, answer in teal); at 30 sections the deck sits in the seminar band, where one is expected | Add one: "A 0.03pp spread cannot rank estimators" → "True — which is why the placebo tournament, not the point estimate, does the ranking" |
| 24 | 7   | LOW      | slides.qmd:341 — slide 30 "Materials"             | The deck ends on a resources list; the thesis lands one slide earlier (slides.qmd:331) | Move Materials before "And the answer…", or close on a one-sentence thesis |
| 25 | 7   | LOW      | slides.qmd — 5 `::: {.notes}` blocks / 26 content slides | Notes are sparse; the prose the speaker would say sits on the slides instead           | Push the prose flagged in issues 5, 6, 18, 19 into notes             |
| 26 | 7   | LOW      | slides.qmd:125-128                                | One code block in the whole deck. `simplex_ls` — the post's "one solver, five jobs" (index.md:471-487, 1323) — never appears, though hand-coding is the post's stated method | Add one code slide showing `simplex_ls` solving both $\omega$ and $\lambda$ |
| 27 | 9   | LOW      | slides.qmd:174 — slide 13 "Stage 2 — Demeaned SC" | The $b^{dsc}$ equation ships without the plain-language gloss the post gives it (index.md:683), unlike the deck's other two equations | Add "the average gap over the 86 pre-referendum quarters" under the equation |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #5 — slide 19 "The turkey"** (slides.qmd:231-243)

Before:
> You are roasting a 3.4 kg bird. The chart lists 3 kg and 4 kg.
>
> **Extrapolation bias**: you misread the scale and look up 5 kg. Right chart, wrong row.
>
> **Interpolation bias**: you read both rows correctly and average the times. Right rows — but roasting time bends with weight, so the average of two times is not the time for the average bird.
>
> Two independent errors. Fixing one does nothing for the other.

After (on slide):
> A 3.4 kg bird. The chart lists 3 kg and 4 kg.
>
> **Extrapolation bias**: you look up 5 kg. Wrong row.
>
> **Interpolation bias**: you average the two rows. Right rows, curved chart.
>
> Fixing one does nothing for the other.

After (added to `::: {.notes}`):
> Roasting time bends with weight, so the average of the 3 kg and 4 kg times is not the time for a 3.4 kg bird. The two errors are independent — that is the whole point of the decomposition.

Why: a 22-word sentence becomes 5 words on the slide; five stacked prose sentences become four fragments; the explanation moves to where the speaker actually says it.

**Issue #6 — slide 3 "Build it out of the countries we do observe"** (slides.qmd:70)

Before:
> Give each donor a weight. Require the blend to track the real UK for twenty-one years. Read off the gap afterwards.

After (on slide):
> Weight the donors. Match the UK for twenty-one years. Read the gap.

After (added to `::: {.notes}`):
> Give each donor a weight, require the blend to track the real UK quarter by quarter through the two decades before the referendum, and whatever gap opens after 2016 is the estimate.

Why: 24 words → 11; three full sentences trailing a four-bullet list become three imperative fragments the eye takes in at once.

**Issue #18 — slide 18 "Two ways to be wrong"** (slides.qmd:223)

Before:
> **Interpolation bias** — they do match, but the outcome bends, so the average of outcomes is not the outcome at the average.

After:
> **Interpolation bias** — the blend matches, but the outcome curve bends.
>
> The average of outcomes is not the outcome at the average.

Why: 21 words with two subordinate clauses → two lines of 10 and 9; the contrast is the point, so it gets its own line.

**Issue #19 — slides 5 and 26** (slides.qmd:82, :314)

Before (slides.qmd:82):
> Born, Müller, Schularick and Sedláček (2019) estimated that the referendum had cost the UK about **2.4% of GDP** by the end of 2018.

After:
> Born et al. (2019): the referendum cost the UK **2.4% of GDP** by end-2018.

Before (slides.qmd:314):
> With 86 pre-treatment outcomes already in the matching set, the covariates are redundant (Kaul et al. 2022) and add only noise.

After:
> 86 pre-treatment outcomes already encode the covariates (Kaul et al. 2022).
>
> The six extra predictors add noise, not information.

Why: 23 words → 12, and 21 words → two lines of 10 and 7; the passive "are redundant" becomes the active "encode". The full author list belongs in the notes.

---

## HIGH-issue rewrites

None found.

*(No HIGH issues were raised. The two MED issues whose fix is a text change are given here for convenience.)*

**Issue #2 — Dimension 1 — slide 21 "Stages 4 and 5"** (slides.qmd:261)

Before:
> Both land inside the range the simpler stages already covered.

After:
> Neither moves the answer. MASC sets the floor at 2.73%; ASCM sits on SC's 3.04%.

**Issue #4 — Dimension 4 — slide 24 "Which stage? A fire drill"** (slides.qmd:287)

Before:
> The SDID family wins on every measure.

After:
> SDID (i) wins on every measure — and, as published, variants (ii) and (iii) look worst of all. Hold that thought.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                              | Value on slide                    | Source location                                | Match   |
|----------------------------------------------------------|-----------------------------------|------------------------------------------------|---------|
| Key-result strip — SDID shortfall end-2018               | 2.8%                              | index.md:1007 (2.76); index.md:1232            | ~ (#10) |
| Key-result strip — time weight on one quarter            | 0.96                              | index.md:763-764 (0.9585 on 2016Q2)            | ✓       |
| Key-result strip — donor countries                       | 23                                | index.md:353-358, 363                          | ✓       |
| Referendum date                                          | 23 June 2016                      | index.md:94                                    | ✓       |
| Panel scope                                              | 24 OECD, 1995Q1-2020Q4, log real GDP | index.md:336, 353                           | ✓       |
| Treated / donors / pre-periods / evaluation dates        | 1 / 23 / 86 / 2018Q4 + 2019Q4     | index.md:359-360, 363                          | ✓       |
| Tracking window                                          | twenty-one years                  | index.md:665                                   | ✓       |
| Figure: donor GDP paths                                  | ../…_01_gdp_paths.png             | index.md:389                                   | ✓       |
| Born et al. published estimate                           | 2.4% by end-2018                  | index.md:104, 1012                             | ✓       |
| Master weighted TWFE equation                            | argmin Σ Σ (y−α−β−wτ)² ω̂ λ̂       | index.md:423 (limits simplified for the slide) | ✓       |
| Dials table (DiD/SC/DSC/SDID × ω, λ, unit effect)        | 4 rows                            | index.md:429-435                               | ✓       |
| DiD code: `rep(1/23, 23)`, `mean(Z1 - Z0 %*% w_did)`     | 2 lines                           | index.md:501-502                               | ✓       |
| DiD estimate at 2018Q4                                   | 4.98%                             | index.md:508, 512, 1003                        | ✓       |
| DiD pre-treatment fit error                              | 0.0218, four times SC's           | index.md:509-512                               | ✓       |
| Figure: DiD counterfactual                               | ../…_02_did_counterfactual.png    | index.md:395                                   | ✓       |
| Pre-trend divergence start                               | 2013                              | index.md:397                                   | ✓       |
| SC objective equation                                    | Σ_{t=1}^{T_0}                     | index.md:522 (Σ_{t=1}^{T_0−1})                 | ~ (#14) |
| Synthetic Britain composition                            | ⅕ Hungary, ⅕ US, ⅕ Japan, ⅙ Canada | index.md:654-661                              | ✓       |
| SC estimate / pre-treatment fit error                    | 3.06% / 0.0057                    | index.md:610, 658, 665                         | ✓       |
| Figure: convex hull                                      | ../…_04_convex_hull.png           | index.md:540                                   | ✓       |
| DSC offset equation                                      | (1/T_0) Σ_t (…)                   | index.md:681 (1/(T_0−1))                       | ~ (#14) |
| DSC offset value and estimate move                       | +0.0024; 3.06% → 2.99%            | index.md:707, 715                              | ✓       |
| DSC flat averaging over pre-periods                      | 86 quarters                       | index.md:721                                   | ✓       |
| ω / λ transposition framing                              | 2 bullets                         | index.md:727-730, 738                          | ✓       |
| Figure: lambda weights                                   | ../…_09_lambda_weights.png        | index.md:781                                   | ✓       |
| Time-weight concentration                                | 96% on 2016Q2                     | index.md:763-764, 771                          | ✓       |
| SDID estimate                                            | 2.76%                             | index.md:768, 1007                             | ✓       |
| Random-walk explanation                                  | —                                 | index.md:783                                   | ✓       |
| Bias decomposition                                       | Bias = B^ext + B^int              | index.md:840                                   | ✓       |
| Extrapolation / interpolation definitions                | —                                 | index.md:233, 811-812                          | ✓       |
| Turkey analogy numbers                                   | 3.4 kg; 3 and 4 kg; 5 kg          | index.md:245                                   | ✓       |
| Figure: bias-target tile chart                           | ../…_11_bias_targets.png          | index.md:858                                   | ✓       |
| "SDID's time weights let one estimator target both"      | claim                             | index.md:884                                   | ✓       |
| MASC matching share                                      | 16%                               | index.md:936 (15.8%)                           | ~ (#11) |
| MASC estimate                                            | 2.73%                             | index.md:931, 936, 1010                        | ✓       |
| ASCM negative weights / estimate                         | 8 donors / 3.04%                  | index.md:975, 988, 991                         | ✓       |
| "Both land inside the range the simpler stages covered"  | claim                             | index.md:936 ("the lowest on the ladder")      | ✗ (#2)  |
| Figure: ATT dot plot                                     | ../…_15_att_dotplot.png           | index.md:1014                                  | ✓       |
| Ladder spread, end-2018 / end-2019                       | 2.73-3.06% / 3.83-4.20%           | index.md:1007-1011, 1016                       | ✓       |
| Placebo table — SC                                       | 0.0089 / 0.0055                   | index.md:1054                                  | ✓       |
| Placebo table — DSC                                      | 0.0087 / 0.0052                   | index.md:1055                                  | ✓       |
| Placebo table — SDID row label + values                  | "SDID" 0.0067 / 0.0016            | index.md:1056 (row is "SDID (i)")              | ~ (#1)  |
| Placebo table — MASC                                     | 0.0080 / 0.0045                   | index.md:1057                                  | ✓       |
| Placebo table — ASCM                                     | 0.0086 / 0.0051                   | index.md:1058                                  | ✓       |
| Number of artificial treatment dates                     | twenty                            | index.md:275, 1034                             | ✓       |
| "The SDID family wins on every measure"                  | claim                             | index.md:1059-1062 ((ii)/(iii) rank last as published) | ✗ (#4) |
| Horizon mismatch in the published table                  | 4 quarters vs 1 quarter ahead     | index.md:1066                                  | ✓       |
| Matched-horizon RMSE, h = 1                              | 0.0067 / 0.0066 / 0.0066          | index.md:1074-1076                             | ✓       |
| "The three variants are indistinguishable"               | claim                             | index.md:1082                                  | ✓       |
| SC(B) reproduces the published figure                    | 2.43%                             | index.md:1117, 1126                            | ✓       |
| Covariates raise placebo error, SC and DSC               | 0.0089→0.0092; 0.0087→0.0106      | index.md:1134-1135                             | ✓       |
| Kaul et al. redundancy citation                          | 2022                              | index.md:1142, 1364                            | ✓       |
| Figure: solver ladder                                    | ../…_07_solver_ladder.png         | index.md:640                                   | ✓       |
| Frank-Wolfe at 10,000 iterations vs true optimum         | 3.06% vs 3.04%                    | index.md:635-638, 642                          | ✓       |
| Four take-away claims                                    | 4 numbered items                  | index.md:1314, 1318, 1325-1327                 | ✓       |
| Headline answer                                          | ~3% end-2018, 4% end-2019         | index.md:1310, 1324                            | ✓       |
| Permutation p-value                                      | 0.042, smallest attainable        | index.md:1224, 1230, 1238                      | ✓       |
| 95% interval                                             | roughly 1% to 4.6%                | index.md:1232 ("roughly 0.9% to 4.6%")         | ~ (#12) |
| `analysis.R` figure count                                | 18 figures                        | 18 PNGs in the bundle; index.md:330            | ✓       |
| Cheat sheets, three languages                            | R / Stata / Python                | index.md:332                                   | ✓       |
| Data file loadable from GitHub                           | brexit_analysis.csv               | index.md:339-341                               | ✓       |
| Source-paper citation                                    | Econometric Reviews 44(10), 1617-1646 | index.md:1352                              | ✓       |
| Stage numbering                                          | Stage 0 … Stage 5                 | index.md §7-§13 (Stage 1 … Stage 6)            | ~ (#13) |

Every ✗ is a MED issue listed above (no HIGH). `~` marks a rounding, convention or labelling drift, each raised as a LOW or MED above.

---

## Title sequence (assertion-title test)

Read in order, the slide titles should form the talk's abstract:

1. *(divider)* The Problem — Act I
2. There is only one United Kingdom, and it voted to leave
3. Build it out of the countries we do observe
4. One line in a crowd
5. The previously published answer was 2.4%
6. *(divider)* The Ladder — Act II
7. Every estimator is the same regression
8. Four settings of the same dials
9. Stage 0 — Difference-in-differences
10. Parallel trends, failing in plain sight
11. Stage 1 — Synthetic control
12. The rubber band
13. Stage 2 — Demeaned SC: allow a level gap
14. The offset is tiny, and that is the finding
15. Stage 3 — SDID: choose which quarters to trust
16. And the time weights collapse
17. *(divider)* The Pivot — Act III
18. Two ways to be wrong
19. The turkey
20. Only one row is dark in both columns
21. Stages 4 and 5 — buy the trade-off, or drop the constraint
22. *(divider)* The Verdict — Act IV
23. Every stage beats 2.4%
24. Which stage? A fire drill
25. But check the exam before trusting the ranking
26. Covariates make it worse
27. And the optimiser matters more than you would think
28. What to take away
29. And the answer, with its error bars
30. Materials

**Verdict:** coherent abstract — the sequence reads as a complete argument (missing counterfactual → build it → each stage's complaint → the bias pivot → the verdict → the caveat), with no gaps or non-sequiturs. Label titles at 9, 11, 12, 19, 28, 30 (issue #8). The one real weakness is that titles 9 and 11 announce a rung without asserting what it buys, so a reader skimming titles alone learns the ladder's rungs but not what each rung fixes.

---

## Positive highlights

- **slides.qmd:176 — "The offset is tiny, and that is the finding."** A null result turned into the slide's assertion, exactly mirroring index.md:715 ("this is an anticlimax, and the anticlimax is the finding"). Very few decks title a slide with the absence of an effect.
- **slides.qmd:289-303 — "But check the exam before trusting the ranking."** The post's sharpest original contribution (§15.3) lands in three sentences and a three-cell table, with the h = 1 values 0.0067 / 0.0066 / 0.0066 matching index.md:1074-1076 exactly. This is the deck's best slide.
- **slides.qmd:190 — "The time-weight problem is the unit-weight problem, transposed."** The post's stated key structural insight (index.md:727) reduced to one bolded line plus a two-bullet ω/λ contrast: one idea, one visual anchor.
- **Fragment discipline (deck-wide).** 29 `. . .` advances across 26 content slides, with a maximum of 3 on any single slide — comfortably inside the ≤4 cap — and figure slides alternate with prose slides so the deck breathes.
- **Branding (slides/site-brand.scss, slides/title-slide.html).** `diff` against both canonical templates is empty; the four dividers use exactly `#d97757`, `#6a9bcc`, `#141413`, `#00d4c8`; the numeric key-result strip correctly ships **without** `kr-arrow` (arrows are for word pipelines only); `[Act I]{.act}` uses the theme-provided `.act` class rather than a per-deck override.

---

## Priority action items

1. **[MED]** Relabel the placebo row `SDID (i)` (slides.qmd:281) and rewrite the claim beneath it (slides.qmd:287). As written, the audience never learns that variants (ii) and (iii) *looked* worst as published — which is the setup the next slide's punchline needs.
2. **[MED]** Add `[…]{.takeaway .fragment}` cards to the ~12 substantive content slides. This deck is one of only 4 of the site's 68 decks with none; the sibling `python_sc_dsc_sdid` deck carries 31.
3. **[MED]** Fix "Both land inside the range the simpler stages already covered" (slides.qmd:261) — MASC's 2.73% is the ladder's floor, not an interior point (index.md:936).
4. **[MED]** Caption all seven figures (slides.qmd:74, 140, 160, 201, 247, 269, 318), reusing the post's own alt text at index.md:389, 395, 540, 781, 858, 1014, 640. They currently carry no caption and therefore no alt text.
5. **[MED]** Move the flagged prose into speaker notes (issues #5, #6, #18, #19) and convert the six label titles (issue #8) into assertions — e.g. "Stage 1 — Synthetic control" → "Letting the data pick the weights cuts the fit error four-fold".

---

## Screenshots (HIGH-severity visual issues only)

None — the browser pass was skipped (`--no-browser`), and no HIGH visual issue was detectable statically.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_sc_dsc_sdid

To re-check just the dimension you fixed:

    /project:review-slides r_sc_dsc_sdid focus: fidelity

---

## Audit metadata

- Node version: v25.9.0
- Playwright: disabled (--no-browser)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean — `site-brand.scss` and `title-slide.html` are both byte-identical to `.claude/skills/write-slides/references/templates/`
- Design/branding (browser pass): not run (--no-browser). Static substitutes: background — 4 `data-background-color` dividers on the exact brand palette; accent-rule / byline — theme-provided, template unmodified; pipeline — numeric strip, 3 `kr-num` + 3 `kr-cap`, no `kr-arrow` (correct for a numeric strip); takeaway-cards — **0**
- Tooling notes: `index.html` is 42,863 bytes with 35 `<section>` tags, and all 7 `../r_sc_dsc_sdid_*.png` paths resolve on disk. `slides.qmd` (16:42) and `index.html` (16:43) are in sync — spot-checked "Only one row is dark in both columns" and "Materials" in both. No `results_report.md` exists in this bundle, so `index.md` alone is the number authority.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
