# Review: r_estimateW Slide Deck

**Audited:** content/post/r_estimateW/slides/
**Source of truth:** content/post/r_estimateW/index.md + results_report.md
**Date:** 2026-08-04
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** skipped (--no-browser)

---

## Verdict: MAJOR REVISION

**Overall assessment.** Every number on every slide traces to the post — the fidelity ledger is 42 for 42, the smoke test passes 15 of 15, and both branding files are byte-identical to the canonical templates, so nothing here is wrong. The deck fails on the two dimensions `write-slides` weights most heavily: **readability (4/10)** and **design adherence (4/10)**. It is written as an essay set in slide frames rather than as visual anchors for speech — 18 content slides carry only 4 figures, no code, and zero `.takeaway` cards, while 10 of the 18 have no speaker notes at all and five stack three or four full prose sentences with nothing visual to anchor them. The single fix that would move the most: push the stacked prose into `::: {.notes}`, leave one anchor line per slide, and end each substantive slide on a `[…]{.takeaway .fragment}` card. Strongest dimensions are source fidelity (9), technical correctness (10) and branding (10).

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                              |
|----|-------------------------------|-----------:|--------:|----------------------------------------------------|
| 1  | Source fidelity               | 9          | 0/0/1   | all 42 ledger entries trace to source; 1 LOW        |
| 2  | Conceptual correctness        | 6          | 0/2/0   | causal verb + a dropped counter-finding             |
| 3  | Technical & render correctness| 10         | 0/0/0   | smoke-test PASS 15/15; math render `[~]` (no browser)|
| 4  | Title↔body consistency        | 9          | 0/0/1   | assertion-title test pass; sequence dips twice      |
| 5  | Readability & simplicity      | 4          | 0/5/3   | 4 walls of prose, 1 six-bullet slide, 1 27-word line |
| 6  | Typos & grammar               | 8          | 0/0/4   | no typos; 4 consistency nits                        |
| 7  | write-slides design adherence | 4          | 0/5/2   | arc inverted; 0 takeaway cards; 2 label titles      |
| 8  | Branding integrity            | 10         | 0/0/0   | scss/title-slide diff clean (byte-identical)        |
| 9  | Accessibility & legibility    | 7          | 0/1/1   | 4/4 figures uncaptioned; overflow `[~]` (no browser)|
| 10 | Deliverable completeness      | 10         | 0/0/0   | link ok (`slides/index.html`); files ok; 4/4 figures|

Skipped dimensions show `—` in the score column with `not audited` in Notes.

Browser-only checks marked `[~]` and excluded from the verdict: Dim 3 runtime math typesetting, Dim 9 960×700 overflow and rendered word/bullet density.

---

## Issues found

| #  | Dim | Severity | Location                                          | Issue                                                                                          | Suggested fix                                                              |
|---:|----:|----------|---------------------------------------------------|------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| 1  | 2   | MED      | slide 16 — "Same country beats shared border"     | Reports only the half of the finding that supports the title. index.md:1201 deliberately states the counterweight: restricted to the 33 links with P ≥ 0.5, 60.6% share a border (14.2× enrichment) against 75.8% same-country (10.6×) — "the post states both rather than reporting only the one that supports the headline" (results_report.md:307) | Add the refinement as a `.comment` gloss or, at minimum, to speaker notes |
| 2  | 2   | MED      | slide 19 — "Why that matters for policy" (slides.qmd:238) | "A region raising tertiary attainment **generates** roughly twice as much growth…" — index.md:894 says "**is associated with** about 0.049 percentage points"; slide also drops "measured" from "roughly a third of the **measured** return" | Restore associational framing — see rewrite below                         |
| 3  | 5   | MED      | slide 2 — "The seating chart you were handed" (slides.qmd:41–45) | Three stacked full prose sentences, no figure/table/equation to anchor the eye; the notes carry meta-advice ("Open with the analogy"), not the prose | Keep one anchor line on the slide; move sentences 2–3 to `::: {.notes}`   |
| 4  | 5   | MED      | slide 10 — "One link at a time" (slides.qmd:123–129) | Two distinct ideas: the Bernoulli conditional (statistical logic) and Sherman-Morrison rank-one updates (computational cost). Equation + three prose lines | Move the Sherman-Morrison line to notes, or split into a second slide     |
| 5  | 5   | MED      | slide 19 — "Why that matters for policy" (slides.qmd:238–246) | Four stacked prose sentences and no visual; nothing tells the eye where to land | Keep the ratio line; push the rest to notes                               |
| 6  | 5   | MED      | slide 20 — "What this cannot tell you" (slides.qmd:250) | 27-word sentence with a trailing subordinate clause                                             | Split into two short sentences — see rewrite below                        |
| 7  | 5   | MED      | slide 21 — "Honest limits" (slides.qmd:262–267)   | 6 bullets (cap is 5); bullets 1 and 4 are both about the 100-draw budget                       | Merge bullets 1+4 and 2+3 → 4 bullets                                     |
| 8  | 7   | MED      | deck-wide (rendered `index.html`: 0 matches for `class="takeaway"`) | Not one of the 18 content slides ends on a `[…]{.takeaway .fragment}` card — the convention every substantive slide is expected to follow | Add a one-sentence takeaway card to each substantive content slide       |
| 9  | 7   | MED      | slide 17 — "Look at the map"; slide 21 — "Honest limits" | Label/imperative titles, not assertions. "Look at the map" names no finding; "Honest limits" is a bare noun label | e.g. "Long arcs, not short ones, carry the network" / "26.5 effective draws bound what we can claim" |
| 10 | 7   | MED      | act dividers (slides.qmd:81, 159)                 | Act proportions inverted: Act II "The Investigation" holds 6 of 18 content slides (~33%, target 60–75%); Act III "The Resolution" holds 8 (target 2–4) — five evidence slides sit under a resolution divider | Move slides 14–18 under "The Investigation"; leave 19–21 in "The Resolution" |
| 11 | 7   | MED      | slides 7, 12, 14, 15, 16, 17, 18, 19, 21, 22      | 10 of 18 content slides have no `::: {.notes}` at all (8 note blocks deck-wide), while the prose those slides need sits on the slide face — the inverse of Law 3 | Add notes to every content slide; the prose being cut per issues 3/5 goes there |
| 12 | 7   | MED      | deck-wide                                         | No code slide anywhere, and the deck never names the tool: `estimateW`, `sarw()` and R appear zero times. The pedagogical movement stops before Codeblock, and a listener cannot act on the talk | Add one code slide showing the `W_priors(…)` + `sarw(…)` call (index.md:658–666, 787–791) |
| 13 | 9   | MED      | slides 9, 11, 15, 17 (slides.qmd:114, 137, 179, 207) | All four figures use bare `![](../r_estimateW_*.png)` — no caption, therefore no alt text; the post supplies a full caption for each (index.md:645, 743, 923, 1206) | Port the post's captions into the `![…]()` alt slot                       |
| 14 | 1   | LOW      | slide 8 — "The prior is not a technicality" (slides.qmd:98) | `p_{ij} \propto \omega_{ij} \times m(k_i)` drops the underbars of index.md:584 (`\underline{p}_{ij} \propto \underline{\omega}_{ij} \, \underline{m}(k_i)`), so the hyperparameters read as posterior quantities | Deliberate and disclosed in the notes; either restore the underbars or drop them consistently (see issue 21) |
| 15 | 4   | LOW      | title sequence, positions 17 and 21               | Read alone, the titles form a coherent abstract except at "Look at the map" and "Honest limits", which contribute no claim | Fixed by issue 9                                                          |
| 16 | 5   | LOW      | slide 8 (slides.qmd:104)                          | 25-word sentence at the length threshold                                                         | See rewrite below                                                         |
| 17 | 5   | LOW      | slide 5 (slides.qmd:75)                           | 22 words, passive ("must be patched", "are invisible")                                          | See rewrite below                                                         |
| 18 | 5   | LOW      | slide 16 (slides.qmd:200)                         | 21 words, two clauses joined by an em dash                                                       | See rewrite below                                                         |
| 19 | 6   | LOW      | slide 12 (slides.qmd:155)                         | "Sparsity biases the network sparse" — nonstandard construction; index.md:773 says "The sparsity prior recovers a slightly *sparser* network than the truth" | "The sparsity prior thins the network, and pulls $\rho$ down with it."   |
| 20 | 6   | LOW      | slide 5 (slides.qmd:72)                           | Mixed endonyms and English exonyms in one list: "Canarias", "Corse" beside "Aegean islands", "Ireland"; index.md:1175 uses English throughout ("the Canaries", "Corsica") | Use the post's English forms consistently                                 |
| 21 | 6   | LOW      | slide 8 notes (slides.qmd:107) vs slide 21 (slides.qmd:267) | Notation inconsistency: the notes state underbars were "dropped here for legibility", then `$\underline{k} = 7$` reappears on the last content slide | Pick one convention deck-wide                                            |
| 22 | 6   | LOW      | slide 8 (slides.qmd:100)                          | Double space either side of `×`: `links can be  ×  **how many**`                                | Single spaces                                                            |
| 23 | 7   | LOW      | slides 7, 12, 14, 16, 18 (5 tables)               | No `[…]{.key}` cell in any table (rendered `index.html`: 0 matches for `class="key"`); `**bold**` is used instead, which loses the brand orange the theme supplies | Tag the headline cell `[0.00153]{.key}` etc.                            |
| 24 | 7   | LOW      | slide 22 — "The map is a parameter" (slides.qmd:271–273) | Closing is two sentences plus a URL block, where the convention is one declarative sentence     | Merge: "Every spatial result you have read is conditional on a map somebody chose — and it does not have to be." |
| 25 | 9   | LOW      | slide 9 — "'Non-informative' means half of Europe" (slides.qmd:114) | Bare uncaptioned image; the grey-bell-at-44.5 vs teal-spike-at-7 reading exists only in the speaker notes, so the slide does not stand alone | Fixed by issue 13                                                        |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 2 "The seating chart you were handed"**

Before:
> You have the full transcript of a conference dinner: who laughed at which joke, who fell silent when.
>
> You do **not** have the seating chart.
>
> Spatial econometrics hands you the chart first — drawn from shared borders or straight-line distance — and asks you to trust it.

After (on slide):
> You have the transcript of the dinner.
>
> You do **not** have the seating chart.

After (in `::: {.notes}`):
> The transcript is who laughed at which joke and who fell silent when. Spatial econometrics hands you the chart first — drawn from shared borders or straight-line distance — and asks you to trust it.

Why: 47 on-slide words → 12; three stacked prose sentences → a two-line contrast, which is the acceptable structured form.

---

**Issue #4 — slide 10 "One link at a time"**

Before:
> Score both, normalise, flip a weighted coin. Repeat 8,010 times per sweep.
>
> Sherman-Morrison rank-one updates make each flip cheap instead of an $O(n^3)$ determinant.

After (on slide):
> Score both, normalise, flip a weighted coin. Repeat 8,010 times per sweep.

After (in `::: {.notes}`):
> Each flip changes W, which changes the determinant. Sherman-Morrison rank-one updates make that cheap instead of O(n cubed) — which is why 8,010 links take minutes, not weeks.

Why: removes the second idea (cost) from a slide whose one idea is the Bernoulli step; the gloss stays a single line under the equation.

---

**Issue #5 — slide 19 "Why that matters for policy"**

Before:
> A region raising tertiary attainment generates roughly **twice as much growth outside its borders as inside them**.
>
> Whoever funds the universities captures about a third of the return.
>
> Under contiguity that ratio is 1.20, not 2.11 — the difference between *"most of the return leaks away"* and *"about half does"*.
>
> Different co-funding decision.

After (on slide):
> **2.11** under the estimated map.  **1.20** under contiguity.
>
> [Most of the education return leaks across borders — or only about half does. Same data, different map.]{.takeaway .fragment}

After (in `::: {.notes}`):
> A region that raises tertiary attainment is associated with about twice as much growth outside its borders as inside them. Whoever funds the universities captures roughly a third of the measured return. Under contiguity that ratio is 1.20, not 2.11 — a materially different co-funding decision.

Why: 55 on-slide words → 20; four stacked sentences → a two-number contrast plus a takeaway card; also fixes issue #2's causal verb.

---

**Issue #6 — slide 20 "What this cannot tell you"**

Before:
> A posterior probability of 1.0 on Bulgaria → Czechia means residual co-movement is **better explained with that link than without it**, given a prior expecting seven neighbours.

After:
> Bulgaria → Czechia at probability 1.0 says one thing only: residual co-movement fits **better with that link than without it**.

Why: 27 words → 19; drops the trailing subordinate clause (the prior condition moves to notes, where the speaker says it).

---

**Issue #16 — slide 8 "The prior is not a technicality — it *is* the method"**

Before:
> The trap: a "non-informative" flat prior on the neighbour count implies an expectation of **44.5 neighbours per region** — every region wired to half of Europe.

After:
> The trap: a "non-informative" flat prior expects **44.5 neighbours per region**.
>
> Every region wired to half of Europe.

Why: 25 words → two lines of 11 and 7; the punchline gets its own line instead of trailing an em dash.

---

**Issue #17 — slide 5 "On this data, contiguity needs ten arbitrary decisions"**

Before:
> Each must be patched by hand before a contiguity model will even run — and those patches are invisible in the results table.

After:
> You patch each one by hand before the model will run.
>
> None of those patches appears in the results table.

Why: 22 words with two passives → two active sentences of 11 and 9 words.

---

**Issue #18 — slide 16 "Same country beats shared border"**

Before:
> Strongest estimated links average 921 km, against 1,331 km for a random pair — geography still matters, just far less than nationality.

After:
> The strongest links average 921 km; a random pair averages 1,331 km.
>
> Geography still matters — nationality matters more.

Why: 21 words in one clause chain → two lines of 12 and 7; the number and the interpretation stop competing.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                        | Value on slide                         | Source location                          | Match |
|----------------------------------------------------|----------------------------------------|------------------------------------------|-------|
| Key-result strip — links estimated                 | 8,010                                  | index.md:137; results_report.md:91        | ✓ |
| Key-result strip — spatial parameter               | ρ = 0.713                              | index.md:859; results_report.md:147       | ✓ |
| Key-result strip — spillover ratio                 | 2.1×                                   | index.md:888; results_report.md:363       | ✓ |
| Slide 4 — SAR equation                             | $y_t = \rho W y_t + Z_{t-1}\beta + \varepsilon_t$ | index.md:439                    | ✓ |
| Slide 5 — isolate count                            | 10 of 90                               | index.md:1171–1175; results_report.md:311 | ✓ |
| Slide 5 — named isolates                           | Cyprus…Ireland (10 items)              | index.md:1171 (CY0, EL4, ES7, FI2, FRM, IE0, ITG, MT0, PT2, PT3) | ✓ |
| Slide 7 — ρ, σ² count                              | 2 / 2                                  | index.md:478                              | ✓ |
| Slide 7 — slopes                                   | 4 / 4                                  | index.md:479                              | ✓ |
| Slide 7 — off-diagonal cells                       | 0 / 8,010                              | index.md:480                              | ✓ |
| Slide 7 — total unknowns                           | 6 / 8,016                              | index.md:481, 473                         | ✓ |
| Slide 7 — observations                             | 1,710 / 1,710                          | index.md:482                              | ✓ |
| Slide 7 — obs per unknown                          | 285 / 0.21                             | index.md:483                              | ✓ |
| Slide 7 — parameters per observation               | 4.7                                    | index.md:473, 511                         | ✓ |
| Slide 8 — prior factorisation equation             | $p_{ij} \propto \omega_{ij} \times m(k_i)$ | index.md:584 (underbars dropped)      | ~ |
| Slide 8 — flat-prior expectation                   | 44.5 neighbours                        | index.md:643; results_report.md:102       | ✓ |
| Slide 9 — figure                                   | `../r_estimateW_04_prior_k_n90.png`    | index.md:645 (same figure)                | ✓ |
| Slide 10 — Bernoulli conditional equation          | $p(\omega_{ij}\mid\Omega_{-ij},\cdot,\mathcal{D})\sim\text{Bernoulli}(\cdot)$ | index.md:543 | ✓ |
| Slide 10 — links per sweep                         | 8,010                                  | index.md:232                              | ✓ |
| Slide 10 — Sherman-Morrison vs $O(n^3)$            | rank-one updates                       | index.md:559                              | ✓ |
| Slide 11 — figure                                  | `../r_estimateW_18_sim_recovery.png`   | index.md:743 (same figure)                | ✓ |
| Slide 11 — AUC                                     | 0.976                                  | index.md:752, 767                         | ✓ |
| Slide 11 — classification accuracy / cells         | 95.3% of 1,560                         | index.md:755, 767                         | ✓ |
| Slide 12 — ρ true / est / interval                 | 0.600 / 0.528 / [0.509, 0.542]         | index.md:763, 771                         | ✓ |
| Slide 12 — σ² true / est / interval                | 0.050 / 0.064 / [0.056, 0.073]         | index.md:764                              | ✓ |
| Slide 12 — slope true / est / interval             | −1.000 / −1.032 / [−1.053, −1.009]     | index.md:762                              | ✓ |
| Slide 12 — coverage verdict                        | no / no / no                           | index.md:761–764 (`FALSE`), 771           | ✓ |
| Slide 14 — ρ paper / ours                          | 0.71322 / 0.71322                      | index.md:859                              | ✓ |
| Slide 14 — log initial GVA                         | −0.01692 / −0.016922                   | index.md:856; results_report.md:144       | ✓ |
| Slide 14 — share high education                    | 0.00044 / 0.000441                     | index.md:858                              | ✓ |
| Slide 14 — av. indirect, initial GVA               | −0.03972 / −0.039723                   | index.md:864                              | ✓ |
| Slide 14 — reproduction count                      | 12 of 12 exact                         | index.md:868; results_report.md:156       | ✓ |
| Slide 14 — reproduction conditions                 | seed, package version, RNG, BLAS       | index.md:868                              | ✓ |
| Slide 15 — figure                                  | `../r_estimateW_09_W_pip_heatmap.png`  | index.md:923 (same figure)                | ✓ |
| Slide 15 — within-country link mass                | 35.6%                                  | index.md:940                              | ✓ |
| Slide 15 — chance benchmark                        | 7.1%                                   | index.md:940                              | ✓ |
| Slide 15 — model inputs                            | growth, initial productivity, 2 education shares | index.md:944                    | ✓ |
| Slide 16 — AUC by comparator                       | 0.753 / 0.698 / 0.631                  | index.md:1190–1193                        | ✓ |
| Slide 16 — share of top links                      | 30.2% / 17.2% / 23.9%                  | index.md:1190–1193                        | ✓ |
| Slide 16 — mean link distances                     | 921 km vs 1,331 km                     | index.md:1194–1195, 1199                  | ✓ |
| Slide 17 — figure                                  | `../r_estimateW_17_map_arcs.png`       | index.md:1206 (same figure)               | ✓ |
| Slide 17 — named long arcs                         | Bulgaria–Czechia, Iberia–Baltic, Greece–Ireland | index.md:1209                    | ✓ |
| Slide 17 — teal/orange legend                      | shares a border / does not             | index.md:1206–1207                        | ✓ |
| Slide 18 — ρ across three maps                     | 0.713 / 0.607 / 0.719                  | index.md:1226                             | ✓ |
| Slide 18 — high education, total                   | 0.00153 / 0.00066 / 0.00074            | index.md:1232                             | ✓ |
| Slide 18 — indirect ÷ direct                       | 2.11 / 1.20 / 2.20                     | index.md:1233                             | ✓ |
| Slide 18 — "more than doubles"                     | qualitative claim                      | index.md:1240                             | ✓ |
| Slide 19 — spillover ≈ 2× own-region               | "twice as much … outside"              | index.md:894 (framing differs — issue #2) | ✓ |
| Slide 19 — funder's share                          | about a third                          | index.md:894 ("roughly a third of the measured return") | ✓ |
| Slide 19 — contiguity ratio                        | 1.20 vs 2.11                           | index.md:1240                             | ✓ |
| Slide 20 — BG→CZ posterior probability             | 1.0                                    | index.md:962, 969, 1273                   | ✓ |
| Slide 20 — panel length                            | T = 19                                 | index.md:1273                             | ✓ |
| Slide 21 — ESS(ρ)                                  | 26.5 of 100 retained                   | index.md:1057; results_report.md:128      | ✓ |
| Slide 21 — Geweke z                                | −3.74                                  | index.md:1057                             | ✓ |
| Slide 21 — link-probability quantization            | 0.01                                   | index.md:1059                             | ✓ |
| Slide 21 — practical ceiling                       | ~300 regions                           | index.md:1275                             | ✓ |
| Slide 21 — anchor is a researcher choice           | $\underline{k} = 7$, report a sweep    | index.md:677, 1275                        | ✓ |

Every ✗ is a HIGH issue listed above. No ✗ found; the single `~` is issue #14 (notation, not value).

---

## Title sequence (assertion-title test)

Read in order, the slide titles should form the talk's abstract:

1. Who Are My Neighbors? *(title)*
2. The seating chart you were handed
3. **The Tension** *(divider)*
4. Every spillover estimate is conditional on a matrix somebody chose
5. On this data, contiguity needs ten arbitrary decisions
6. **The Investigation** *(divider)*
7. Treat all 8,010 links as unknown parameters
8. The prior is not a technicality — it *is* the method
9. "Non-informative" means half of Europe
10. One link at a time
11. First, check it on a network we built ourselves
12. But the intervals are not calibrated
13. **The Resolution** *(divider)*
14. The published table reproduces exactly
15. The model reconstructed national borders
16. Same country beats shared border
17. Look at the map
18. Three maps, three answers
19. Why that matters for policy
20. What this cannot tell you
21. Honest limits
22. The map is a parameter *(closing)*

**Verdict:** coherent abstract — the sequence tells the whole argument, and no title claims anything its body fails to show. Two positions contribute nothing to the abstract: 17 ("Look at the map") and 21 ("Honest limits") are label titles (issue #9). Divider titles match their acts as named, though the act *boundaries* are drawn in the wrong place (issue #10).

---

## Positive highlights

- **Slide 5's title, "On this data, contiguity needs ten arbitrary decisions", is the deck's best assertion** — it converts index.md:1175 ("we made ten arbitrary modelling decisions before estimating anything, and they are invisible in the final table") into a seven-word claim, and the body proves it by naming all ten regions. The speaker note correctly identifies it as the most persuasive slide for a sceptical audience.
- **Slide 7 stages the whole problem as a single table** (slides.qmd:85–94): the assumed-vs-estimated columns land on 285 versus 0.21 observations per unknown, and the one-line closer "The likelihood alone cannot do this" earns the prior slides that follow. This is the cleanest example in the deck of a figure/table carrying the argument instead of bullets.
- **The deck reports its own negative result.** Slide 12 ("But the intervals are not calibrated") carries the three uncovered parameters and closes on "Trust the structure. Hedge the intervals." — a faithful compression of index.md:777 that most decks would have quietly dropped between the AUC 0.976 slide and the headline.
- **Slide 17 names its colours in text** — "**[Teal]{style=…}** — the pair also shares a border", "**[Orange]{…}** — it does not" — so the map figure does not rely on colour as its sole signal.
- **Branding is untouched.** `site-brand.scss` and `title-slide.html` are byte-identical to the canonical templates, every hex in `slides.qmd` (`#0f1729`, `#d97757`, `#6a9bcc`, `#00d4c8`, `#141413`) is on-palette, and the front matter keeps `center`, `chalkboard`, `menu` and `overview` at 1280×720 as the theme intends.

---

## Priority action items

1. **[MED]** Cut the walls of prose (issues #3, #4, #5) — slides 2, 10 and 19 each keep one anchor line; everything else moves to `::: {.notes}`. This is the single change that moves Dimension 5 most.
2. **[MED]** Add `[…]{.takeaway .fragment}` cards to the substantive content slides (issue #8) — currently zero deck-wide — and speaker notes to the 10 slides that have none (issue #11).
3. **[MED]** Fix the two content findings: restore "is associated with" and "measured return" on slide 19 (issue #2), and add the confident-links-tilt-geographic refinement to slide 16 (issue #1).
4. **[MED]** Redraw the act boundary (issue #10) — move slides 14–18 under "The Investigation" so Act II carries ~65% of the deck and Act III is the three closing slides.
5. **[MED]** Caption the four figures from the post's own captions (issue #13), and rewrite the two label titles on slides 17 and 21 as assertions (issue #9).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_estimateW

To re-check just the dimension you fixed:

    /project:review-slides r_estimateW focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: disabled (--no-browser)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean — `site-brand.scss` and `title-slide.html` both byte-identical to `.claude/skills/write-slides/references/templates/`
- Design/branding (browser pass): not run (--no-browser). Static substitutes: `background` = `#0f1729` declared on slides.qmd:39; `takeaway-cards` = 0 (grep of rendered `index.html`); `key` cells = 0; pipeline = none (numeric key-result strip, no `kr-arrow` — correct, arrows are only approved for word strips)
- Tooling notes: rendered `index.html` is 39,248 bytes with 25 `<section>` tags (22 logical slides + 3 divider wrappers) and 8 `.notes` blocks; all 18 `<h2>` titles and 3 `<h1>` dividers in `slides.qmd` are present in the render, so source and output are in sync

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
