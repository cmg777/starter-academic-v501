# Review: python_did_industrial_park Slide Deck

**Audited:** content/post/python_did_industrial_park/slides/
**Source of truth:** content/post/python_did_industrial_park/index.md + results_report.md
**Date:** 2026-08-04
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** skipped (--no-browser)

---

## Verdict: MINOR REVISION

**Overall assessment.** This is a numerically immaculate deck: every one of the ~60 coefficients, standard errors, weights, and sample sizes on a slide traces exactly to `results_report.md` or `index.md`, the ATT estimand is named and carried correctly through all three data layers, the observational framing and the synthetic-data caveat survive intact, and the branding files are byte-identical to the canonical templates. The strongest dimensions are branding integrity (10) and title↔body consistency (10) — no title makes a claim its body fails to prove. The weakest are readability (6) and design adherence (6): three slides stack four to six full prose sentences where the speaker notes should carry them, two titles are topic labels rather than assertions, and four slides pin a figure and a table encoding the *same* numbers side by side. Nothing here misleads an audience; fixing the three prose slides (2, 4, 28) and promoting the two label titles would move this to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                            |
|----|-------------------------------|-----------:|--------:|--------------------------------------------------|
| 1  | Source fidelity               | 7          | 0/1/0   | ~60 numbers trace to source; 1 mislabeled period |
| 2  | Conceptual correctness        | 7          | 0/1/0   | ATT/observational framing exact; 1 SUTVA overclaim |
| 3  | Technical & render correctness| 9          | 0/0/1   | smoke-test PASS 15/15; math render `[~]`         |
| 4  | Title↔body consistency        | 10         | 0/0/0   | assertion-title test pass                        |
| 5  | Readability & simplicity      | 6          | 0/3/3   | 3 prose-wall slides, 3 over-length sentences     |
| 6  | Typos & grammar               | 8          | 0/0/2   | no typos; 2 consistency nits                     |
| 7  | write-slides design adherence | 6          | 0/2/4   | arc ok; closing ok; 2 label titles               |
| 8  | Branding integrity            | 10         | 0/0/0   | scss/title diff clean; palette on-brand          |
| 9  | Accessibility & legibility    | 9          | 0/0/1   | 13/13 captions; overflow `[~]`                   |
| 10 | Deliverable completeness      | 10         | 0/0/0   | link ok; files ok; 13/13 figures resolve         |

Skipped dimensions show `—` in the score column with `not audited` in Notes.

---

## Issues found

| #  | Dim | Severity | Location                                                        | Issue                                                                                                   | Suggested fix                                                        |
|---:|----:|----------|-----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| 1  | 1   | MED      | slide 26 — "Honest inference inflates the SE 2.4×" (slides.qmd:342) | Table row labeled `2008–2020`; the with-trends light ATT is estimated on the full 2005–2020 panel (results_report.md:37, index.md:386, N = 2,224). Also contradicts the deck's own "2008–2021" rollout span on slide 2 (slides.qmd:45). | Relabel the row `2005–2020` (the estimation window). See rewrite.     |
| 2  | 2   | MED      | slide 20 — "Net-new activity, not displacement" (slides.qmd:274) | Takeaway card asserts "SUTVA holds". The post says SUTVA is *plausible* (index.md:298, index.md:699); the slide's own notes (slides.qmd:277) also say "plausible". A null spillover test cannot establish SUTVA. | Soften to "SUTVA looks plausible". See rewrite.                       |
| 3  | 5   | MED      | slide 2 — "Governments spend billions fencing land…" (slides.qmd:45, 49) | Four stacked full prose sentences on the slide (threshold: > 1). The hook drowns in definition text.     | Cut to one anchor line + one contrast; move the rest to notes.        |
| 4  | 5   | MED      | slide 4 — "The government did not flip a coin…" (slides.qmd:71–77) | Six stacked prose sentences, one passive construction ("Parks were sited"), one 19-word sentence.        | Three short active lines; the caveat becomes a single clause.         |
| 5  | 5   | MED      | slide 28 — "Two design lessons…" (slides.qmd:367–372)           | Six prose sentences across an intro and two two-sentence bullets; densest text slide in the deck.        | One label per lesson + one short line each.                           |
| 6  | 7   | MED      | slide 6 — "Where the industrial parks are located"; slide 30 — "Five numbers to remember" (slides.qmd:106, 394) | Both titles are topic labels, not assertions the slide proves. design-adherence flags label titles as MED. | Rewrite as claims — see priority action 3.                            |
| 7  | 7   | MED      | slides 17, 18, 21, 23 (slides.qmd:233–240, 248–254, 282–288, 306–312) | Each pins a figure **and** a table encoding the same numbers, and slides 17/18 repeat them a third time in the figure caption. Two load-bearing visuals fight for one slide. | Keep the table (it is the precise artifact) and cut the figure, or vice versa. |
| 8  | 3   | LOW      | slide 19 (slides.qmd:264) vs slide 24 (slides.qmd:326) and slide 28 (slides.qmd:371) | Signed coefficients are LaTeX in one place (`$-0.0335$`) and bare Unicode minus in others (`−0.210`, `−0.0335`). Both render, but the treatment is inconsistent. | Pick one convention deck-wide; slide-mapping prefers `$…$` for signed coefficients. |
| 9  | 5   | LOW      | slide 3 — "The question has two halves…" (slides.qmd:57, 61)     | Three stacked prose sentences; the third runs 16 words.                                                  | Two short lines. See rewrite.                                         |
| 10 | 5   | LOW      | slide 26 — "Honest inference inflates the SE 2.4×" (slides.qmd:338) | 21-word compound sentence with two clauses joined by "so … —".                                           | Split into two short sentences. See rewrite.                          |
| 11 | 5   | LOW      | slide 30 — "Five numbers to remember" (slides.qmd:404)          | The takeaway card crams a five-item list (~20 words) onto a slide that already carries a five-row table — two ideas on one slide. | Cut the card to one lesson, or split into a second slide. See rewrite. |
| 12 | 6   | LOW      | slide 5 (slides.qmd:96) vs slides 17, 27 (slides.qmd:225, 233, 239, 354) | The estimator is "Borusyak" on slide 5, "Borusyak/Gardner" elsewhere, and "BG" in the title-slide strip — three names for one method. | Use "Borusyak/Gardner" everywhere on slides; keep "BG" only in the strip. |
| 13 | 6   | LOW      | slide 19 — speaker notes (slides.qmd:267)                        | "All three distance interactions are negative … and three are significant" — the second "three" reads as a subset. (Faithful to index.md:677, which has the same phrasing.) | "All three distance interactions are negative, and all three are significant." |
| 14 | 7   | LOW      | deck-wide (slides.qmd front matter, 1–37)                        | 27 content slides + 4 dividers = 31, the 3rd-longest of 68 decks on the site (median 19), above the Teaching/Working band (16–22) and at the top of Seminar (20–30). No audience is recorded in front matter. Act I has 5 slides and Act III has 5, where the arc calls for 2–4 each. | Record the audience; if Teaching, merge slides 2/3 and 17/18.          |
| 15 | 7   | LOW      | 13 of 27 content slides, notably slide 23 — "The climax…" (slides.qmd:304) and slide 14 (slides.qmd:201) | These slides carry no `[…]{.takeaway .fragment}` card. The deck's analytical climax ends on a table with no restated assertion. | Promote a concluding line to `.takeaway` on slide 23 at minimum.       |
| 16 | 7   | LOW      | slide 6 — "Where the industrial parks are located" (slides.qmd:110) | The orange `.takeaway` accent card carries a source citation ("Source: Appendix Figure A2 …"), not the slide's conclusion. The card is reserved for the assertion. | Move the citation to a `.comment` gloss or the notes.                  |
| 17 | 7   | LOW      | deck-wide                                                        | No code slide anywhere; `pyfixest` and `diff-diff` are never named on a slide, though they are the post's two star libraries (index.md:314–315) and two of its five learning objectives (index.md:93–94). The pedagogical movement skips its Codeblock step. | Add one code slide after slide 13 showing the `pf.feols(… \| district_id + region^year)` line. |
| 18 | 9   | LOW      | slide 17 — "Four estimators, one estimand" (slides.qmd:239)      | The `[+0.3022]{.key}` orange highlight marks Borusyak/Gardner — the largest estimate, not a headline the post singles out — and nothing labels why it is highlighted. Color is the sole signal. | Highlight the TWFE benchmark row instead, or drop the `.key` (the point of the slide is agreement, not any one row). |

Order: HIGH first, then MED, then LOW. Number consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 2 "Governments spend billions fencing land for factories — does anything grow outside the fence?"**

Before:
> An industrial park: serviced land, power, one-stop customs — rented to garment and leather factories. Ethiopia opened **20+ parks across 18 districts, 2008–2021**.
>
> The promise: jobs, a wage economy, a rural region pulled forward. The fear: a bright **enclave** behind a fence while the surrounding districts see nothing.

After:
> Ethiopia opened **20+ parks across 18 districts, 2008–2021**.
>
> The promise: a wage economy. The fear: a bright **enclave** behind a fence.

Why: four prose sentences → two short lines; the park definition and "a rural region pulled forward" go to notes, where the speaker already has them.

---

**Issue #4 — slide 4 "The government did not flip a coin — parks went where growth already was"**

Before:
> Parks were sited near cities and roads — districts that were **already growing faster**. So a naive treated-vs-control gap confounds the park with the place.
>
> We need a design that nets out pre-existing differences *and* handles a **staggered** rollout (parks opened in different years). That design is **difference-in-differences**.
>
> [A note on the data.]{.objection} **Synthetic, calibrated** data — tuned to Huang, Wang & Xu (2026)'s signs and magnitudes. Learn the *methods*, not facts about Ethiopia.

After:
> The government put parks near cities and roads — where growth **already was**.
>
> So a raw treated-vs-control gap confounds the park with the place. The fix is **difference-in-differences**, built for a **staggered** rollout.
>
> [A note on the data.]{.objection} **Synthetic and calibrated** to Huang, Wang & Xu (2026). Learn the *methods*.

Why: six sentences → three; "Parks were sited" → active "The government put parks"; the 19-word design sentence splits at the conjunction.

---

**Issue #5 — slide 28 "Two design lessons: follow the roads, and disaggregate by sex"**

Before:
> The lesson is **not** "build parks everywhere." It is that **where** and **for whom** decide whether place-based policy works.
>
> - **Site selection** — the effect fades −0.0335 per km to the nearest city and is amplified by paved roads. A park in a remote, poorly-connected woreda would do far less.
> - **Inclusion** — gains run through female-intensive sectors. An evaluation that measured only the *average* would conclude the parks failed on jobs and miss their largest social return.

After:
> Not "build parks everywhere." **Where** and **for whom** decide whether it works.
>
> - **Site selection** — the effect fades $-0.0335$ per km from the nearest city.
> - **Inclusion** — the gains run through women. Measure only the average and you call it a failure.

Why: six sentences → three short lines; the 20-word "An evaluation that measured…" clause becomes a 12-word active warning; the remote-woreda and textiles detail move to notes.

---

**Issue #9 — slide 3 "The question has two halves — *whether*, and *for whom*"**

Before:
> A park could raise satellite luminosity yet leave living standards flat. It could add jobs on average — yet only for men.
>
> So we ask both: **do parks raise local activity**, and **who inside the district actually benefits?**

After:
> Brighter satellites, flat living standards. More jobs — but only for men.
>
> So we ask both: **does activity rise**, and **who benefits?**

Why: three sentences → two lines; the 16-word question drops to 8 words with no loss of meaning.

---

**Issue #10 — slide 26 "Honest inference inflates the SE 2.4× — but the headline survives"**

Before:
> Treated woredas cluster in space, so a regional shock hits several at once — the naive SE assumes independence and is too small. The fix is a **Conley spatial-HAC** standard error; the point estimate never moves.

After:
> Treated woredas cluster in space. One regional shock hits several at once, so the naive SE is too small.
>
> The fix: a **Conley spatial-HAC** standard error. The estimate never moves.

Why: 21-word two-clause sentence → three sentences of 6, 13, and 5 words; the semicolon splice becomes a period.

---

**Issue #11 — slide 30 "Five numbers to remember"**

Before:
> [And five lessons: let evolving effects evolve · triangulate estimators · disaggregate by sex · place is first-order · honest inference, honest caveats.]{.takeaway .fragment}

After:
> [One lesson above the rest: the average hid the finding — disaggregate by sex.]{.takeaway .fragment}

Why: a five-item list on a slide that already holds a five-row table is two ideas; one memorable line is what a takeaway card is for. The other four lessons are already in the speaker notes (slides.qmd:407).

---

## HIGH-issue rewrites

None found.

For reference, the two MED content fixes read:

**Issue #1 — Source fidelity — slide 26**

Before:
> | With-trends light ATT | Estimate | Naive HC0 | Conley-HAC | $t$(HAC) |
> |---|---:|---:|---:|---:|
> | 2008–2020 | +0.2152 | 0.0329 | [0.0799]{.key} | +2.69 |

After:
> | With-trends light ATT | Estimate | Naive HC0 | Conley-HAC | $t$(HAC) |
> |---|---:|---:|---:|---:|
> | 2005–2020 | +0.2152 | 0.0329 | [0.0799]{.key} | +2.69 |

**Issue #2 — Conceptual correctness — slide 20**

Before:
> [`nearby` $= +0.0648$ ($t = 1.06$), insignificant — so the host's gain is net-new, and SUTVA holds.]{.takeaway .fragment}

After:
> [`nearby` $= +0.0648$ ($t = 1.06$), insignificant — so the host's gain is net-new, and SUTVA looks plausible.]{.takeaway .fragment}

---

## Source-fidelity ledger (Dimension 1)

| Slide datum | Value on slide | Source location | Match |
|---|---|---|---|
| Key-result strip 1 | +0.215*** IHS light per park | results_report.md:161 (0.21521, ***) | ✓ |
| Key-result strip 2 | 4 estimators agree (TWFE·SA·BG·CS) | results_report.md:231–236 | ✓ |
| Key-result strip 3 | +0.140*** female jobs, null on average | results_report.md:405–406 | ✓ |
| Slide 2 — park rollout | 20+ parks, 18 districts, 2008–2021 | index.md:80 | ✓ |
| Slide 4 — siting near cities/roads | "already growing faster" | index.md:82 | ✓ |
| Slide 4 — synthetic-data caveat | calibrated to Huang, Wang & Xu (2026) | index.md:86 | ✓ |
| Slide 5 — ATT equation | $E[Y_i(1)-Y_i(0) \mid D_i=1]$ | index.md:196 (Goldmark escaping correctly dropped) | ✓ |
| Slide 5 — treated units | 17 districts that got a park | results_report.md:41 | ✓ |
| Slide 6 — map figure | `../map_industrial_parks.png` | index.md:148 (same figure + caption) | ✓ |
| Slide 6 — source credit | Appendix Figure A2, Huang et al. (2026) | index.md:150 | ✓ |
| Slide 8 — panel shape | 139 woredas × 16 years (2,224 rows) | results_report.md:37 / index.md:386 | ✓ |
| Slide 8 — treated/control split | 17 treated vs 122 matched controls | results_report.md:41–42 | ✓ |
| Slide 8 — DHS sizes | 13,200 households · 17,900 individuals | results_report.md:38–39 | ✓ |
| Slide 8 — survey rounds | 5 rounds, fresh respondents | results_report.md:38 | ✓ |
| Slide 9 — figure 01 | `../python_did_industrial_park_01_parallel_trends.png` | index.md:449 (same figure) | ✓ |
| Slide 9 — notes: 2008 group means | treated −0.0018, control −0.0030 | results_report.md:101 | ✓ |
| Slide 10 — figure 02 | `..._02_cohort_staircase.png` | index.md:455 | ✓ |
| Slide 10 — cohort structure | 1 in 2008, 2–3/yr 2014–2020, 17 total | results_report.md:49–59 | ✓ |
| Slide 11 — figure 03 | `..._03_treatment_map.png` | index.md:459 | ✓ |
| Slide 12 — DiD equation | difference of group pre/post means | index.md:471–493 (same construction) | ✓ |
| Slide 12 — naive 2×2 ATT | +0.2011 (SE 0.0885, p = 0.023) | results_report.md:128, 137 (p = 0.0232) | ✓ |
| Slide 12 — notes: cell changes | treated +0.1929, control −0.0082 | results_report.md:135–136 | ✓ |
| Slide 13 — TWFE equation | $Y_{dt}=\beta D_{dt}+\alpha_d+\gamma_{r(d),t}+\varepsilon_{dt}$ | index.md:499 (escaping correctly dropped) | ✓ |
| Slide 13 — with-trends ATT | +0.2152 (SE 0.0833, t = 2.58, 1%) | results_report.md:161 (0.21521 / 0.08327 / 2.585) | ✓ |
| Slide 13 — luminosity reading | ~21% rise | index.md:529 / results_report.md:167 | ✓ |
| Slide 13 — notes: no-trends ATT | +0.270 → +0.215 with trends | results_report.md:160–161 | ✓ |
| Slide 14 — figure 05 | `..._05_twfe_forest.png` | index.md:527 | ✓ |
| Slide 14 — notes: raw light | +1.618 (vs paper's 1.276) | results_report.md:163, 534 | ✓ |
| Slide 14 — notes: impervious | +0.0263, t = 7.07, ~2.6 pp | results_report.md:165, 481 | ✓ |
| Slide 15 — figure 06 | `..._06_event_study.png` | index.md:563 | ✓ |
| Slide 15 — pre-trend | largest \|t\| = 2.17 | results_report.md:192, 210 | ✓ |
| Slide 15 — notes: lead range | −0.0275 to −0.0013 | results_report.md:199–202 | ✓ |
| Slide 15 — notes: post path | +0.1153 (k=0), +0.1928, +0.2187, +0.4844 (k=4) | results_report.md:203–207 | ✓ |
| Slide 16 — effect growth | +0.12 → +0.48 | index.md:569 | ✓ |
| Slide 17 — figure 07 | `..._07_estimator_comparison.png` | index.md:620 | ✓ |
| Slide 17 — TWFE ATT | +0.2699 *** | results_report.md:233 (0.26991) | ✓ |
| Slide 17 — Sun-Abraham ATT | +0.2991 *** | results_report.md:234 (0.29910) | ✓ |
| Slide 17 — Borusyak/Gardner ATT | +0.3022 *** (`.key`) | results_report.md:235 (0.30220) | ✓ |
| Slide 17 — Callaway-Sant'Anna ATT | +0.2561 *** | results_report.md:236 (0.25607) | ✓ |
| Slide 17 — spread | 0.046 IHS units | results_report.md:238 / index.md:622 | ✓ |
| Slide 18 — figure 08 | `..._08_bacon_weights.png` | index.md:646 | ✓ |
| Slide 18 — treated-vs-never | 95.42% weight, +0.2708 | results_report.md:253, 260 | ✓ |
| Slide 18 — earlier-vs-later | 3.38%, +0.3370 | results_report.md:251, 261 | ✓ |
| Slide 18 — later-vs-earlier | 1.21%, +0.0135 | results_report.md:252, 262 | ✓ |
| Slide 18 — notes: 64 comparisons | 64 underlying 2×2s | results_report.md:249 | ✓ |
| Slide 19 — figure 09 | `..._09_heterogeneity.png` | index.md:675 | ✓ |
| Slide 19 — nearest-city interaction | −0.0335 (t = −4.90) | results_report.md:281, 294 | ✓ |
| Slide 19 — paved roads | +0.6695 (t = 2.08) | results_report.md:285, 296 | ✓ |
| Slide 19 — notes: primary road ns | correctly signed, borderline | results_report.md:284, 298 | ✓ |
| Slide 20 — figure 10 | `..._10_spillover.png` | index.md:697 | ✓ |
| Slide 20 — `nearby` | +0.0648 (t = 1.06), ns | results_report.md:311, 320 | ✓ |
| Slide 20 — notes: host effect | +0.2712 | results_report.md:319 | ✓ |
| Slide 21 — figure 11 | `..._11_household_forest.png` | index.md:726 | ✓ |
| Slide 21 — durables | +0.2286 (~74%) *** (`.key`) | results_report.md:347, 353 | ✓ |
| Slide 21 — housing quality | +0.2480 *** | results_report.md:349 | ✓ |
| Slide 21 — wealth index | +0.3825 SD *** | results_report.md:351 | ✓ |
| Slide 22 — figure 12 | `..._12_household_event_study.png` | index.md:745 | ✓ |
| Slide 22 — phase −3 / −2 / 0 | −0.020 / +0.024 / +0.261 | results_report.md:371–374 (−0.019664 / +0.023555 / +0.260567) | ✓ |
| Slide 23 — figure 13 | `..._13_employment_empowerment.png` | index.md:791 | ✓ |
| Slide 23 — full sample | +0.0911 (ns), t = +1.57 | results_report.md:405 | ✓ |
| Slide 23 — women | +0.1404 *** (`.key`), t = +3.00 | results_report.md:406 | ✓ |
| Slide 23 — men | +0.0176 (ns), t = +0.19 | results_report.md:407 | ✓ |
| Slide 24 — bignum | +0.140 female non-ag employment, p < 0.01 | results_report.md:406 (t = 3.00, ***) | ✓ |
| Slide 24 — decision power | +0.110 *** | results_report.md:408 (0.10957) | ✓ |
| Slide 24 — savings account | +0.315 *** | results_report.md:409 (0.31533) | ✓ |
| Slide 24 — accepts DV | −0.210 *** | results_report.md:410 (−0.20961) | ✓ |
| Slide 24 — notes: savings base | 6.3% base | results_report.md:73, 412 | ✓ |
| Slide 24 — notes: DV base | ~21-point fall off 63.5% | results_report.md:74, 412 | ✓ |
| Slide 26 — ATT / HC0 / Conley-HAC / t | +0.2152 / 0.0329 / 0.0799 / +2.69 | results_report.md:429–430, 443–446 | ✓ |
| Slide 26 — SE inflation | 2.43× (title: 2.4×) | results_report.md:452 | ✓ |
| Slide 26 — sample-period row label | 2008–2020 | panel is 2005–2020 (results_report.md:37; index.md:386) | ✗ |
| Slide 26 — notes: cluster SE | 0.0792 ≈ Conley-HAC 0.0799 | results_report.md:428, 430 | ✓ |
| Slide 27 — activity bullet | +0.215 (~21%), +2.6 pp, no spillover | results_report.md:479, 481, 489 | ✓ |
| Slide 27 — staggered bullet | agree within 0.046, 95.4% clean weight | results_report.md:485, 487 | ✓ |
| Slide 27 — welfare bullet | durables +0.229, housing +0.248, wealth +0.383 SD | results_report.md:493 | ✓ |
| Slide 27 — gender bullet | +0.091 ns, female +0.140 | results_report.md:495 | ✓ |
| Slide 28 — distance decay | −0.0335 per km to nearest city | results_report.md:294 / index.md:844 | ✓ |
| Slide 29 — Devil's Advocate | synthetic, 17 treated, observational | index.md:846 / results_report.md:519–521 | ✓ |
| Slide 29 — audit reference | audited cell by cell in Section 13 | index.md:848–875 | ✓ |
| Slide 30 — Light ATT | +0.2152 *** (~21%) | index.md:881 | ✓ |
| Slide 30 — spread | 0.046 IHS units | index.md:882 | ✓ |
| Slide 30 — clean Bacon weight | 95.4% | index.md:883 | ✓ |
| Slide 30 — female employment | +0.140 *** (vs +0.091 ns) | index.md:885 | ✓ |
| Slide 30 — SE naive → Conley-HAC | 0.0329 → 0.0799 | index.md:886 | ✓ |
| Slide 31 — closing thesis | well-sited parks reshape a local economy and women's lives | index.md:76 (abstract's closing sentence) | ✓ |

Every ✗ is a HIGH issue listed above — **exception:** the single ✗ here (slide 26's `2008–2020` row label) is scored MED, not HIGH, because it mislabels the estimation window rather than altering any estimate; the ATT, both SEs, and the *t* on that row are all exact.

---

## Title sequence (assertion-title test)

Read in order, the slide titles should form the talk's abstract:

1. *[divider]* The Tension — Act I
2. Governments spend billions fencing land for factories — does anything grow outside the fence?
3. The question has two halves — *whether*, and *for whom*
4. The government did not flip a coin — parks went where growth already was
5. One estimand — the ATT — threads through everything
6. Where the industrial parks are located
7. *[divider]* The Investigation — Act II
8. One policy, measured at three grains — satellite, household, individual
9. Parallel before the rollout, then the treated woredas pull away
10. Staggered means there is no single "before" — each cohort has its own clock
11. Treatment is spatially clustered — which will matter for standard errors
12. A single "after" blends the slow start with the late surge — and understates the effect
13. The workhorse adds two-way fixed effects — and a park lifts light +0.215
14. Across all three satellite outcomes the park effect is positive
15. The event study shows *when* the effect arrives — flat before, rising after
16. The teaching moment: staggered TWFE can use already-treated units as controls
17. Four estimators, one estimand — they agree within 0.046 IHS units
18. And the Goodman-Bacon decomposition shows *why* — 95.4% clean weight
19. Where parks work: the effect fades with distance and is amplified by roads
20. Net-new activity, not displacement — no measurable spillover to neighbours
21. Households near a park gain durables, housing, and wealth
22. Clean timing in the survey data too — flat pre-phases, then a jump
23. The climax: average employment is null — but the female effect is large
24. Factory jobs cascade into agency — power up, savings up, DV-acceptance down
25. *[divider]* The Resolution — Act III
26. Honest inference inflates the SE 2.4× — but the headline survives
27. Four findings, one story: well-sited parks reshape activity — through women
28. Two design lessons: follow the roads, and disaggregate by sex
29. The strongest objection — and the answer
30. Five numbers to remember
31. *[closing]* Well-sited parks reshape a local economy — and women's lives — but only a sex-disaggregated look reveals it.

**Verdict:** coherent abstract — the sequence reads as a complete argument from tension (2–4) through identification (5, 9–11), the estimator ladder (12–18), heterogeneity and welfare (19–24), to inference and resolution (26–31), and every title is proven by its own body. Two label titles break the assertion pattern: slide 6 ("Where the industrial parks are located") and slide 30 ("Five numbers to remember") — issue #6. No duplicate titles; divider titles match their acts; the closing slide is one declarative sentence that restates the post's own abstract conclusion (index.md:76), not "Questions?" or "Thank you".

---

## Positive highlights

- **Slide 23's title — "The climax: average employment is null — but the female effect is large" — is the deck's whole argument in eleven words**, and the table beneath it (+0.0911 ns / [+0.1404]{.key}*** / +0.0176 ns) proves it cell for cell against `results_report.md:405–407`. The `.key` highlight lands on exactly the cell the post calls "the finding, not a footnote".
- **Slide 31's closing sentence is lifted from the post's own abstract** (index.md:76) — "Well-sited parks reshape a local economy — and women's lives — but only a sex-disaggregated look reveals it." One declarative sentence, thesis-matching, and the deck's argument actually earns it.
- **Equation porting from Goldmark to Pandoc is flawless.** Slide 13's `$$Y_{dt} = \beta \, D_{dt} + \alpha_d + \gamma_{r(d),t} + \varepsilon_{dt}$$` (slides.qmd:191) correctly drops index.md:499's `Y\_{dt}` / `\\,` escaping, and slide 5's ATT drops index.md:196's `Y\_i` — the single most common failure mode in this pipeline, avoided everywhere.
- **Speaker notes carry the prose the slides don't.** All 27 content slides have a `::: {.notes}` block, they contain zero LaTeX (correctly staying Unicode for the speaker window), and they hold the honest caveats — e.g. slide 15's note ends "never proof, since the assumption concerns the unobserved post-period counterfactual", preserving index.md:565's hedge verbatim in spirit.
- **The identification framing never slips.** Slide 4 states non-random placement, slide 5 names the ATT and parallel trends, slide 16 states the forbidden-comparison worry, slide 29 steelmans the objection, and the notes on slide 4 preserve the post's exact distinction — "confounding control, not the precision-only adjustment of an experiment" (index.md:846).

---

## Priority action items

1. **[MED]** Thin the three prose-wall slides — 2, 4, and 28 (slides.qmd:45–49, 71–77, 367–372) — to one anchor line plus one contrast each, moving the rest into the `::: {.notes}` blocks that already exist. Rewrites are supplied above; this is the single change that most improves the deck.
2. **[MED]** Fix the two factual/framing slips: relabel slide 26's table row `2005–2020` (slides.qmd:342) and soften slide 20's takeaway to "SUTVA looks plausible" (slides.qmd:274) so the card matches the post and the slide's own notes.
3. **[MED]** Promote the two label titles to assertions — slide 6 "Where the industrial parks are located" → *"Parks cluster near Addis and the road corridors — placement was deliberate"*; slide 30 "Five numbers to remember" → *"Five numbers carry the whole study"*.
4. **[MED]** On slides 17, 18, 21, and 23, drop either the figure or the table — each currently shows the same numbers twice (three times on 17 and 18, counting the figure caption).
5. **[LOW]** Add a `[…]{.takeaway .fragment}` card to slide 23, the deck's climax, which currently ends on a bare table; and move slide 6's source citation out of its takeaway card into a `.comment` gloss.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_did_industrial_park

To re-check just the dimension you fixed:

    /project:review-slides python_did_industrial_park focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: disabled (--no-browser)
- smoke-test.js: PASS (15 of 15 checks — reveal structure, 3-stat title strip, chalkboard, menu, notes, 25 MathJax spans with `\(…\)` delimiters, 4 brand dividers, 35 `<section>` tags, 13/13 figure paths resolve, no leaked `{{…}}`)
- Branding diff: clean — `site-brand.scss` and `title-slide.html` are both byte-identical to `.claude/skills/write-slides/references/templates/`; no `kr-arrow` block present, so the word/numeric-strip exception does not apply
- Design/branding (browser pass): `[~]` not run (--no-browser). Static substitutes: all four `data-background-color` dividers use brand hexes (`#d97757`, `#6a9bcc`, `#00d4c8`, `#141413`); no off-palette hex in `slides.qmd`; `center`, `chalkboard`, `menu`, `overview` all enabled in front matter; `width: 1280 / height: 720` matches all 68 other decks on the site; 14 `class="takeaway"` cards present in `index.html`, matching the 14 in `slides.qmd`
- Tooling notes: Dimension 3's math-render check and Dimension 9's 960×700 overflow check are `[~]` and excluded from the verdict; their static counterparts (raw `\hat`/`\(` in source and in `index.html`, `{python}` vs `{.python}` fences, leaked `{{…}}`, Unicode-vs-LaTeX on-slide math, figure captions, bullet/word density) all ran fully. `index.html` (68,643 bytes, > 30 KB) is consistent with the current `slides.qmd` — four spot-checked titles resolve in both, and both files carry the same 14 takeaway cards and the same modification time.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
