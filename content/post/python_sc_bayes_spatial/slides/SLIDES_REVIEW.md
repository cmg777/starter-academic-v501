# Review: python_sc_bayes_spatial Slide Deck

**Audited:** content/post/python_sc_bayes_spatial/slides/
**Source of truth:** content/post/python_sc_bayes_spatial/index.md + results_report.md
**Date:** 2026-08-04
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** skipped (--no-browser)

---

## Verdict: MAJOR REVISION

**Overall assessment.** There are **no HIGH issues and no wrong numbers**: every value, table cell, equation and code fragment on a slide traces to `results_report.md`, `index.md` or a bundled CSV — including derived quantities such as Utah's $\alpha_j = 0.036$ and the +45% / +1,700% interval-width changes — the smoke test passes 15 of 15, and `site-brand.scss` and `title-slide.html` are byte-identical to the canonical templates. The MAJOR verdict is driven by a single dimension: **design adherence scores 4** because three separate MED triggers fire at once — the deck runs to 44 displayed slides against a 20–30 seminar band with Act III carrying 14 slides of investigation material, five titles are labels rather than assertions, and **24 of 39 content slides carry no speaker notes at all**, including all three reconciliation tables and 10 of the 12 figure slides. Strongest dimensions are **branding integrity (10/10)** and **technical/render correctness (10/10)**; weakest are **design adherence (4/10)** and, jointly, **conceptual correctness and readability (6/10)**. Cutting ~10 slides, writing notes for the note-less slides and converting the five label titles would lift Dimension 7 to 7 and the verdict to ACCEPT-adjacent.

**Audited 10 of 10 dimensions.** The browser-only checks — runtime math typesetting (Dim 3) and 960×700 overflow (Dim 9) — are marked `[~]`, do not trigger their floors, and are excluded from those specific checks.

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                                        |
|----|-------------------------------|-----------:|--------:|--------------------------------------------------------------|
| 1  | Source fidelity               | 9          | 0H/0M/1L | ~60 slide numbers all trace to source; one alt-text conflation |
| 2  | Conceptual correctness        | 6          | 0H/2M/0L | mechanism overclaimed; donor-interval caveat dropped          |
| 3  | Technical & render correctness| 10         | 0H/0M/0L | smoke-test PASS (15/15); math renders `[~]` (no browser)      |
| 4  | Title↔body consistency        | 9          | 0H/0M/1L | assertion-title test passes; one over-broad title             |
| 5  | Readability & simplicity      | 6          | 0H/2M/5L | 1 sentence >25 words; 1 wall of prose; 3 over-long bullets    |
| 6  | Typos & grammar               | 9          | 0H/0M/1L | one comma splice; spelling and terminology consistent         |
| 7  | write-slides design adherence | 4          | 0H/3M/2L | 44 slides vs 20–30 band; 5 label titles; notes on 15 of 39    |
| 8  | Branding integrity            | 10         | 0H/0M/0L | scss/title-slide diff clean; numeric strip, no arrows         |
| 9  | Accessibility & legibility    | 9          | 0H/0M/1L | 12 figures, 0 captions (alt text present); overflow `[~]`     |
| 10 | Deliverable completeness      | 9          | 0H/0M/1L | link `slides/index.html` ok; files ok; icon name deviates     |

Skipped dimensions show `—` in the score column with `not audited` in Notes. None skipped.

---

## Issues found

| #  | Dim | Severity | Location                                                        | Issue                                                                                                                                                   | Suggested fix                                                                                                                                                    |
|---:|----:|----------|-----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1  | 2   | MED      | slide 27 — "The leak runs the *opposite* way…" (`slides.qmd:384`) | Slide names the mechanism flatly: "Not cheap cigarettes crossing the border — the anti-smoking campaign crossing the same border." `index.md:98` hedges ("it *looks like* the anti-smoking campaign travelling across the border") and `index.md:1584` explicitly declines to identify the dominant channel ("Whatever mechanism dominates — advertising, media, social norms…"). | Restore the hedge: "Nevada's sales came in **below** its no-treatment path. That looks like the campaign crossing the border, not the cigarettes — but the estimate cannot name the mechanism." |
| 2  | 2   | MED      | slides 26–27 (`slides.qmd:374–384`)                              | The post's stated limitation never reaches a slide or a note. `index.md:1042–1044`: "nothing in this pipeline puts an interval around Nevada's −5.50. Statements … about which donors are 'distinguishable from zero' are therefore statements about relative magnitude, not about posterior tail probability." Slide 26's takeaway says "everything else is noise" and slide 27 shows −5.50 as a `.bignum` with no qualifier. | Add to slide 26's `::: {.notes}`: "`scspill` returns the effects panel as posterior means, so no donor-level spillover has a credible interval. 'Noise' here means relative magnitude, not a tail probability. The interval evidence is on $\rho$, not on Nevada." |
| 3  | 5   | MED      | slide 35 — "A memory layout was doing part of the modelling" (`slides.qmd:498`) | 31-word sentence with two subordinate clauses: "It is also the one departure with **no escape hatch worth using**: dropping the covariates entirely is the only way to sidestep it, and that trades one specification error for another." | See rewrite below (Issue #3).                                                                                                                                     |
| 4  | 5   | MED      | slide 20 — "That cancellation is what makes the model usable" (`slides.qmd:293–303`) | Wall of prose: five body sentences across three fragments plus a two-sentence takeaway — and the `::: {.notes}` block at `slides.qmd:284–291` already carries the same argument in full. The slide is the notes, printed twice. | See rewrite below (Issue #4).                                                                                                                                     |
| 5  | 7   | MED      | deck-wide (`slides.qmd:1–592`)                                   | 44 displayed slides (1 title + 4 dividers + 39 content) against the widest band in `design-adherence.md` (Seminar 20–30). Act II carries 19 of 39 content slides (49%; band 60–75%); Act III carries 14 (band: 2–4 resolution slides). Slides 30–38 — R reconciliation, the six departures, Geweke, prior sensitivity — are investigation material sitting behind the Act III divider. | Cut ~10 slides. Candidates: merge 30+31 (R spec + reproduction), merge 32+33 (chain length + ESS/completeness), drop 24 ("What the library draws for you" duplicates 25/26), drop 17 (figure 06 restates slide 16's table), fold 36 into 35. Then move the Act III divider to open at slide 39/40. |
| 6  | 7   | MED      | slides 8, 17, 24, 42, 43                                         | Label titles, not assertions: "Where we're going" (`:119`), "Four counterfactual Californias" (`:240`), "What the library draws for you" (`:362`), "What to take away" (`:562`), "Materials" (`:579`). `design-adherence.md` forbids bare nouns and topic labels. | Suggested assertions: "Five relaxations, in the order they arrive"; "The intercept is what separates the four paths"; "The package hands you the fit for free"; "Four things survive this deck"; "Everything here is runnable today". |
| 7  | 7   | MED      | slides 5, 6, 8, 12, 13, 14, 15, 17, 18, 21, 24, 25, 26, 27, 30, 31, 32, 34, 35, 37, 39, 40, 41, 43 | **24 of 39 content slides have no `::: {.notes}` block** (15 present in `slides.qmd`, 15 `class="notes"` in `index.html`). The gap includes all three reconciliation tables (30, 31, 32), 10 of the 12 figure slides, both closed-form equation slides (6, 18) and the Devil's-Advocate slide (39). `rhetoric-of-decks.md` Law 3 and archetype 5 both require the prose to live in the notes and the figure slide to carry a "walk the audience through what to look at first" note. Where the notes are absent, the argument has migrated onto the slide (see Issues #3, #4, #10). | Write a 2–4 sentence note for each. Priority: 30/31/32 (the tables are unreadable without a spoken path through them), 39 (the objection/response needs delivery guidance), and the 10 figure slides (name what to look at first). |
| 8  | 1   | LOW      | slide 15 — fig-alt (`slides.qmd:211`)                            | Alt text says "26 of the 38 donors exceed 0.01 in absolute value, and only Nevada's interval clears zero." The "only Nevada's interval excludes zero" claim belongs to the 25-donor `scspill` fit (`index.md:217`); for the BSCM figure the post says only that "Most of them straddle zero comfortably" (`index.md:747`). | Trim the alt text to "…26 of the 38 donors exceed 0.01 in absolute value, and most credible intervals straddle zero."                                              |
| 9  | 4   | LOW      | slide 40 — "Every estimator targeting this ATT agrees on the sign and the scale" (`slides.qmd:550`) | The title claims *every* comparable estimator; the figure (`..._18_att_ladder.png`) shows only the five ladder rows plus the R references. The six comparable benchmark estimators spanning −16.3 to −26.3 (`index.md:1398`) are not on this slide. | Narrow to what the figure proves: "Every stage of the ladder agrees on the sign and the scale."                                                                    |
| 10 | 5   | LOW      | slide 42 — "What to take away" (`slides.qmd:564–567`)            | Four numbered items, each a bold lead plus an explanatory sentence; item 2 runs 22 words and item 4 runs 24, against a ~12-word-per-bullet cap. ~90 words of body text on the penultimate slide. Rated LOW rather than MED because a ≤5-item list is explicitly acceptable content and the words-per-bullet severity is a documented LOW→MED range. | See rewrite below (Issue #10).                                                                                                                                    |
| 11 | 5   | LOW      | slide 5 — "Nevada is California's only neighbour…" (`slides.qmd:77`) | 20-word sentence: "Oregon and Arizona border California too — but both ran their own tobacco programmes, so **neither is in the donor pool.**" | See rewrite below (Issue #11).                                                                                                                                    |
| 12 | 5   | LOW      | slide 28 — "Which means the classical estimate…" (`slides.qmd:407`) | 20-word sentence packing two independent explanations after an em dash: "The identity holds to 0.06 packs — the plug-in decomposition uses $\widehat{\alpha}$ alone, the purged ATT averages over paired $(\alpha, \rho)$ draws." | See rewrite below (Issue #12).                                                                                                                                    |
| 13 | 5   | LOW      | slide 19 — "The identifying assumption that replaces the simplex" (`slides.qmd:257–280`) | Three display equations, an interstitial gloss and a takeaway on one slide — the identifying assumption and its closed-form solution are two ideas sharing a slide. | See rewrite below (Issue #13).                                                                                                                                    |
| 14 | 5   | LOW      | slide 44 — closing divider (`slides.qmd:592`)                    | 28-word closing sentence. A single concluding sentence is explicitly acceptable, so this is not over-flagged — but it is long to read at projector distance. | See rewrite below (Issue #14).                                                                                                                                    |
| 15 | 5   | LOW      | slide 11 (`slides.qmd:174`) and slide 23 (`slides.qmd:349`)      | Undefined abbreviations on slides: "ATT" first appears in a table on slide 11 and is never expanded anywhere in the deck; "ESS" first appears as a table header on slide 23 but is only expanded on slide 33 ("**Effective sample size** asks whether…"). | Expand once on first use: slide 11's table row → "ATT (effect on California)"; slide 23's header → "Effective sample size (from 250,000 draws)".                    |
| 16 | 6   | LOW      | slide 28 (`slides.qmd:407`)                                      | Comma splice: "…the plug-in decomposition uses $\widehat{\alpha}$ alone, the purged ATT averages over paired $(\alpha, \rho)$ draws." Two independent clauses joined by a comma. | Split into two sentences or use a semicolon (see Issue #12's rewrite).                                                                                             |
| 17 | 7   | LOW      | slide 8 — "Where we're going" (`slides.qmd:121–127`)             | `::: {.incremental}` with five items = 5 fragment advances, above the ~4 cap in `rhetoric-of-decks.md` § MB/MC.                                          | Drop the `.incremental` wrapper (reveal the roadmap at once) or merge "Reconcile" and "Diagnose" into one line.                                                    |
| 18 | 7   | LOW      | slide 12 — "California and its synthetic are indistinguishable until 1988" (`slides.qmd:185`) | The `.takeaway` card introduces a different idea from the title — cross-implementation agreement ("Reproduces the R edition's −18.46 to within 0.04 packs") rather than the pre-treatment fit the title asserts. `design-adherence.md` expects the card to restate *that slide's* assertion. | Either retitle to "Two packages, two optimisers, the same −18.4", or change the card to "Zero gap before 1988; −26.7 packs by 2000" and move the R comparison to the notes. |
| 19 | 9   | LOW      | all 12 figure slides (4, 12, 13, 15, 17, 24, 25, 26, 34, 37, 38, 40) | No figure carries a visible caption: every image is `![](../python_sc_bayes_spatial_NN_*.png){fig-alt="…"}` and the rendered `index.html` contains 12 `<img>` elements and zero `<figcaption>`. Archetype 5 expects a one-line reading aid under the figure. Rated LOW rather than MED because all 12 carry substantive `fig-alt` (screen-reader accessible) and each figure slide ends on a `.takeaway` card that supplies the reading aid. | Optional: add a reading aid where the figure needs orientation, e.g. slide 34 → `![Left: three ρ chains. Right: what each buys in ESS.](../python_sc_bayes_spatial_12_r_reconciliation.png)`. |
| 20 | 10  | LOW      | `content/post/python_sc_bayes_spatial/index.md:17`               | Deck link uses `icon: chalkboard-teacher`; `review-checklist.md` Dim 10 names `icon: person-chalkboard`. | **No change recommended.** `chalkboard-teacher` is the Font Awesome 5 name the pinned Wowchemy v5 theme ships, and it is what every other deck-bearing post on this site uses (`stata_sdid`, `stata_spxtivdfreg`, `stata_sp_regression_panel`, …). The checklist entry is the stale one. |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions. **0 HIGH · 7 MED · 13 LOW.**

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 35 "A memory layout was doing part of the modelling"** (`slides.qmd:498`)

Before:
> It is also the one departure with **no escape hatch worth using**: dropping the covariates entirely is the only way to sidestep it, and that trades one specification error for another.

After (two lines):
> It is also the one departure with **no escape hatch worth using**.
>
> The only way out is to drop the covariates — one specification error for another.

Why: 31 words and two subordinate clauses → two lines of 12 and 13 words; the colon-plus-"and that" chain becomes a claim and its consequence.

---

**Issue #4 — slide 20 "That cancellation is what makes the model usable"** (`slides.qmd:293–303`)

Before (on slide, five sentences across three fragments):
> The effects depend on $(\alpha, \rho, \mathbf{w}, W)$ and the observed data. **Nothing else.**
>
> A model this rich has many weakly identified parameters. If the effects depended on all of them, that weakness would poison everything.
>
> Instead it is confined to one scalar — $\rho$ — where we can see it, measure it, and report it.

After (on slide — one anchor plus the existing takeaway):
> The effects depend on $(\alpha, \rho, \mathbf{w}, W)$ and the observed data. **Nothing else.**
>
> So the model's weak identification has exactly one address: $\rho$.

(The three sentences removed are already in this slide's `::: {.notes}` at `slides.qmd:284–291` — nothing is lost.)

Why: five stacked body sentences → two short lines; the deleted prose is verbatim duplication of the speaker notes, which is the definition of a slide read aloud.

---

**Issue #10 — slide 42 "What to take away"** (`slides.qmd:564–567`)

Before:
> 1. **The effect is robust.** Every relaxation lands between −15.7 and −18.8 packs.
> 2. **The donor pool is not.** The same data support 5 active donors or 25–26, depending entirely on whether sparsity is a constraint or a prior.
> 3. **SUTVA is false here** — and the correction is only 1.19 packs for California (1.51 on the simplex weights). It is 5.50 for Nevada.
> 4. **The interval was the real error**, not the point estimate. Two distinct failures, one diagnosable by ESS and one by asking what the interval is conditioning on.

After:
> 1. **The effect is robust** — −15.7 to −18.8 packs, every relaxation.
> 2. **The donor pool is not** — 5 donors or 26, depending on the constraint.
> 3. **SUTVA is false here** — 1.19 packs for California, 5.50 for Nevada.
> 4. **The interval was the real error**, not the point estimate.

Why: ~90 words → ~45; every item fits one line. The "two distinct failures" gloss and the 1.51-on-simplex-weights detail move to the notes at `slides.qmd:570`, which already exist on this slide.

---

**Issue #11 — slide 5 "Nevada is California's only neighbour inside the donor pool"** (`slides.qmd:77`)

Before:
> Oregon and Arizona border California too — but both ran their own tobacco programmes, so **neither is in the donor pool.**

After (two lines):
> Oregon and Arizona border California too.
>
> Both ran their own tobacco programmes, so **neither is a donor.**

Why: 20 words with a "too — but … so" chain → two lines of 6 and 12 words; the causal step gets its own beat.

---

**Issue #12 — slide 28 "Which means the classical estimate was biased *toward zero*"** (`slides.qmd:407`)

Before:
> Purged minus contaminated: **−1.186**. The identity holds to 0.06 packs — the plug-in decomposition uses $\widehat{\alpha}$ alone, the purged ATT averages over paired $(\alpha, \rho)$ draws.

After:
> Purged minus contaminated: **−1.186**. The identity holds to 0.06 packs.
>
> The residual is bookkeeping: the plug-in uses $\widehat{\alpha}$; the purged ATT averages over paired draws.

Why: fixes the comma splice (Issue #16) and splits a 20-word explanation into a result and its footnote.

---

**Issue #13 — slide 19 "The identifying assumption that replaces the simplex"** (`slides.qmd:257–280`)

Before (one slide): the existence assumption $\exists\,\alpha \in \mathbb{R}^{N}$, then the closed-form donor solution $\mathbf{Y}^{c}_{t}(\mathbf{0}) = (I-\rho A)^{-1}[\ldots]$, then both estimands $\xi_{0t}$ and $\boldsymbol{\xi}^{c}_{t}$, plus a gloss and a takeaway.

After (split in two):
> **Slide A — "The simplex is gone; something took its place"**
> $$\exists\, \alpha \in \mathbb{R}^{N} \;:\; Y_{1t}(\mathbf{0}) = \sum_j \alpha_j Y_{jt}(\mathbf{0}) \quad \forall t$$
> [Weaker than convexity, stronger than approximate fit — and untestable, because it leaves no RMSE behind.]{.takeaway .fragment}
>
> **Slide B — "The donors' untreated path solves in closed form"**
> $$\mathbf{Y}^{c}_{t}(\mathbf{0}) = \big(I - \rho A\big)^{-1}\Big[\big(I - \rho W\big)\mathbf{Y}^{c}_{t} - \rho\,\mathbf{w}\,Y_{1t}\Big]$$
> [No $\beta$. No factors. No error variances. They **cancel**.]{.takeaway .fragment}

Why: one idea per slide — "here is the assumption I traded the simplex for" and "here is what it buys me" are two claims, and the second is the one slide 20 then builds on.

---

**Issue #14 — slide 44, closing divider** (`slides.qmd:592`)

Before:
> Let the data choose the donors, let the map tell you who else was treated, and let the effective sample size tell you whether the interval means anything.

After:
> Let the data choose the donors, let the map say who else was treated, and let the ESS say whether the interval means anything.

Why: 28 words → 23, and the tricolon survives intact. Apply only if Issue #15 is also applied and "ESS" has been expanded earlier in the deck; otherwise keep the full phrase.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                          | Value on slide                            | Source location                                                       | Match |
|------------------------------------------------------|-------------------------------------------|-----------------------------------------------------------------------|-------|
| Key-result strip #1                                  | −16.87, "packs per capita, leak modelled" | results_report.md:137 (ATT −16.8680)                                  | ✓     |
| Key-result strip #2                                  | −5.50, "Nevada, from a law it never passed" | results_report.md:183 (−5.4995)                                       | ✓     |
| Key-result strip #3                                  | 33×, "how much too narrow the interval was" | index.md:1052; results_report.md:268                                  | ✓     |
| Prop 99 tax (slide 3)                                | 25-cent cigarette tax, 1988               | index.md:89                                                           | ✓     |
| Simplex + SUTVA statements (slide 3)                 | non-negative, sum to one; no donor absorbs | index.md:93–94                                                        | ✓     |
| Figure (slide 4)                                     | `..._01_panel_paths.png`                  | index.md:330 (Figure 1)                                               | ✓     |
| Panel dimensions (slide 4)                           | 39 states · 1,209 rows · 18 pre-years · 38 donors | results_report.md:34–41; index.md:626                          | ✓     |
| Excluded states (slide 5)                            | AK, AZ, FL, HI, MD, MA, MI, NJ, NY, OR, WA (11) | index.md:597                                                     | ✓     |
| `spatial_w` one non-zero entry (slide 5)             | Nevada only                               | index.md:584–597; results_report.md:48–50                             | ✓     |
| Simplex objective + $\Delta$ (slide 6)               | $\arg\min_{\alpha\in\Delta}\sum(Y_{1t}-\alpha^\top\mathbf{Y}^c_t)^2$ | index.md:344                                | ✓     |
| SUTVA equation (slide 6)                             | $Y_{jt}(\mathbf{D}) = Y_{jt}(D_j)$        | index.md:228, 304                                                     | ✓     |
| Install lines (slides 7, 43)                         | `scspill[numba]==0.2.1`; mlsynth @ `15f168bb` | index.md:484–485 (SHA truncated to 8 chars — valid git ref)        | ✓     |
| "46 estimators" (slide 7)                            | 46                                        | index.md:106                                                          | ✓     |
| Horseshoe hierarchy (slides 10, 14)                  | $\mathcal{N}(0,\lambda_j^2)$, $\mathcal{C}^+(0,\tau)$, $\mathcal{C}^+(0,\sigma)$ | index.md:692 (post adds a 4th level $\sigma\sim\mathcal{C}^+(0,10)$; trimmed) | ✓ |
| SAR donor equation (slide 10)                        | $\mathbf{Y}^c_t=\rho(\mathbf{w}Y_{1t}+W\mathbf{Y}^c_t)+X_t\beta+\mathbf{u}_t$ | index.md:846                              | ✓     |
| Stage-1 code (slide 11)                              | `mlsynth.VanillaSC(dict(common)).fit()`   | index.md:636–639                                                      | ✓     |
| Stage-1 ATT (slide 11)                               | −18.43                                    | results_report.md:60 (−18.4277)                                       | ✓     |
| Stage-1 pre-RMSE (slide 11)                          | 1.60                                      | results_report.md:61 (1.5998)                                         | ✓     |
| Stage-1 active donors (slide 11)                     | 5 of 38                                   | results_report.md:62                                                  | ✓     |
| Stage-1 top-4 share (slide 11)                       | 98.6%                                     | results_report.md:68 (0.9856)                                         | ✓     |
| Stage-1 weights (slide 11)                           | Utah 0.343 · Montana 0.254 · Nevada 0.242 · Connecticut 0.146 | index.md:201 (post's own rounding of 0.2545 → 0.254) | ✓ |
| Figure (slide 12)                                    | `..._03_stage1_fit_gap.png`               | index.md:667 (Figure 3)                                               | ✓     |
| R-edition Stage 1 gap (slide 12)                     | −18.46, within 0.04 packs                 | index.md:663; results_report.md:74 (0.032)                            | ✓     |
| Gap at 2000 (slide 12 fig-alt)                       | −26.7 packs                               | index.md:671                                                          | ✓     |
| Figure (slide 13)                                    | `..._04_stage1_weights.png`               | index.md:673 (Figure 4)                                               | ✓     |
| 33 zero-weight donors (slide 13)                     | 33                                        | index.md:675                                                          | ✓     |
| New Hampshire weight (slide 13 fig-alt)              | 0.01                                      | results_report.md:67 (0.0144)                                         | ✓     |
| Makalic–Schmidt claim (slide 14)                     | exact reparameterisation, not approximate | index.md:702                                                          | ✓     |
| Figure (slide 15)                                    | `..._05_stage2_horseshoe_weights.png`     | index.md:743 (Figure 5)                                               | ✓     |
| BSCM active donors (slide 15)                        | 5 → 26                                    | results_report.md:90; index.md:738                                    | ✓     |
| "only Nevada's interval clears zero" (slide 15 fig-alt) | attributed to the BSCM figure          | index.md:217 attaches it to the 25-donor `scspill` fit; index.md:747 says only "most straddle zero" for BSCM | ✗ (Issue #8, LOW) |
| BSCM row (slide 16)                                  | −18.85 / 16.86 / 0.758                    | results_report.md:88–91 (−18.8469, 16.8619, 0.7576)                   | ✓     |
| `scspill` at $\rho=0$ row (slide 16)                 | −15.68 / 0 / 0.885                        | results_report.md:107, 122 (−15.6816, 0.8852)                         | ✓     |
| R edition Stage 2 row (slide 16)                     | −15.84                                    | index.md:768, 787                                                     | ✓     |
| BSCM vs scspill equations (slide 16)                 | with / without $\beta_0$                  | index.md:783                                                          | ✓     |
| Blend ≈100 vs 118 (slide 16 notes)                   | 100 / 118                                 | index.md:785 (≈100 vs pre-period mean 117.7)                          | ✓     |
| Figure (slide 17)                                    | `..._06_stage2_two_bayesian.png`          | index.md:789 (Figure 6)                                               | ✓     |
| Bias decomposition (slide 18)                        | $Y_{1t}-\sum\alpha_jY_{jt}=\xi_{0t}-\sum\alpha_j\xi^c_{jt}$ | index.md:803                                        | ✓     |
| Identifying assumption (slide 19)                    | $\exists\,\alpha\in\mathbb{R}^N$, exact fit $\forall t$ | index.md:872                                             | ✓     |
| Closed-form donor solution (slide 19)                | $(I-\rho A)^{-1}[(I-\rho W)\mathbf{Y}^c_t-\rho\mathbf{w}Y_{1t}]$ | index.md:878                                | ✓     |
| Both estimands (slide 19)                            | $\xi_{0t}$, $\boldsymbol{\xi}^c_t$        | index.md:882                                                          | ✓     |
| "No $\beta$, no factors, no error variances" (slide 19) | they cancel                            | index.md:884                                                          | ✓     |
| Effects depend on $(\alpha,\rho,\mathbf{w},W)$ only (slide 20) | nothing else                    | index.md:884–886                                                      | ✓     |
| SCSPILL call (slide 21)                              | `m_iter` 500,000, `burn` 250,000, `seed` 20251022 | index.md:944–951; results_report.md:9                          | ✓     |
| `result.att` comment (slide 21)                      | −16.87                                    | index.md:962                                                          | ✓     |
| `att_scm` comment (slide 21)                         | −15.68                                    | index.md:963                                                          | ✓     |
| `rho_hat` comment (slide 21)                         | 0.316                                     | index.md:964                                                          | ✓     |
| `spillover_panel` shape (slide 21)                   | 31 × 38                                   | results_report.md:181                                                 | ✓     |
| $\widehat{\rho}$ bignum (slide 22)                   | 0.316, CrI [0.231, 0.403]                 | index.md:964; results_report.md:140                                   | ✓     |
| ESS table (slide 23)                                 | $\sigma^2$ 204,095 · $\alpha$ 10,000–26,000 · $\beta$ 388 · $\rho$ 137 | index.md:982–989; results_report.md:160–167     | ✓     |
| $\rho$ posterior SD / support (slide 23)             | SD 0.043 on a support 1.9 wide            | index.md:994; results_report.md:142 (\|ρ\| < 0.95)                     | ✓     |
| Figure (slide 24)                                    | `..._07_stage3_panel.png`                 | index.md:998 (Figure 7)                                               | ✓     |
| Figure (slide 25)                                    | `..._10_spillover_map.png`                | index.md:1034 (Figure 10)                                             | ✓     |
| Linear colour scale claim (slide 25)                 | concentration is the finding              | index.md:1038                                                         | ✓     |
| Figure (slide 26)                                    | `..._11_spillover_bars.png`               | index.md:1040 (Figure 11)                                             | ✓     |
| Spillover ranking (slide 26)                         | Nevada −5.50 · Idaho −0.49 · Utah −0.49   | index.md:1022–1027; results_report.md:183–185                         | ✓     |
| "eleven times" (slide 26)                            | 11×                                       | index.md:1030 (11.2×)                                                 | ✓     |
| Nevada bignum (slide 27)                             | −5.50, sales came in below                | index.md:98; results_report.md:202–203                                | ✓     |
| Bias table $\alpha_j$ (slide 28)                     | Nevada 0.200 · Utah 0.036 · Idaho 0.012   | stage2_alpha_posterior.csv (0.19972, 0.036156, 0.012215)              | ✓     |
| Bias table $\xi^c_j$ (slide 28)                      | −5.50 · −0.49 · −0.49                     | results_report.md:183–185                                             | ✓     |
| Bias table products (slide 28)                       | −1.098 · −0.018 · −0.006                  | index.md:1318–1321                                                    | ✓     |
| Bias sum (slide 28)                                  | −1.130                                    | index.md:1323 (−1.1295)                                               | ✓     |
| Purged − contaminated (slide 28)                     | −1.186; identity holds to 0.06            | index.md:1324, 1327 (0.057)                                           | ✓     |
| Nevada 0.242 on simplex weights (slide 28 notes)     | 1.51 packs                                | index.md:1333                                                         | ✓     |
| R-vs-Python interval table (slide 30)                | −16.59 [−16.78,−16.39] w 0.384; −16.87 [−23.05,−10.33] w 12.713 | index.md:1050; results_report.md:211, 214    | ✓     |
| "A factor of 33" (slide 30)                          | 33                                        | index.md:1052                                                         | ✓     |
| Six departures, three escape hatches (slide 30)      | 6 / 3                                     | index.md:1054, 1131–1138                                              | ✓     |
| R-spec flags (slide 31)                              | `beta_prior="ridge"`, `propagate_alpha=False`, `adapt_rho=False` | index.md:1065–1067                            | ✓     |
| R-spec reconciliation table (slide 31)               | ATT −16.590 / −16.286 / 0.304; $\widehat\rho$ 0.2226 / 0.2282 / 0.0056; ESS 2.93 / 3.27 / 0.34; NV −3.750 / −3.778 / 0.028 | index.md:1084–1089 | ✓ |
| Budget ladder table (slide 32)                       | 5,000 w 0.482 ESS 3.3; 500,000 w 0.702 ESS 66.9; corrected w 12.713 ESS 136.8 | index.md:1098–1100; results_report.md:212–214 | ✓ |
| "+45%" and "1,700%" (slide 32)                       | 0.482→0.702 = +45.6%; 0.702→12.713 = ×18.1 | derived from index.md:1098–1100; index.md:1105 ("factor of 18")       | ✓     |
| ESS-3 / pinned-$\alpha$ contrast (slide 33)          | reliable vs complete; failed both         | index.md:1109–1112                                                    | ✓     |
| 0.48 → 0.70, "factor of eighteen" (slide 33 notes)   | matches                                   | index.md:1103–1105                                                    | ✓     |
| Figure (slide 34)                                    | `..._12_r_reconciliation.png`             | index.md:1114 (Figure 12)                                             | ✓     |
| Acceptance 0.444 vs 0.44; ESS 137 (slide 34)         | matches                                   | index.md:931, 965; results_report.md:141                              | ✓     |
| Departure 1, $(N,T,K)$ vs $(T,N,K)$ (slide 35)       | matches                                   | index.md:1133, 1140                                                   | ✓     |
| Geweke joint-distribution logic (slide 36)           | marginal-conditional vs successive-conditional | index.md:1146                                                    | ✓     |
| $\omega_k$ variance-vs-precision bug (slide 36)      | matches                                   | index.md:1148                                                         | ✓     |
| Figure (slide 37)                                    | `..._14_geweke.png`                       | index.md:1253 (Figure 14)                                             | ✓     |
| Geweke max \|z\| 3.48 → 2.50; 1 → 0 rejections (slide 37) | tenfold chain growth (20,000 → 200,000) | index.md:1245–1246                                                  | ✓     |
| Figure (slide 38)                                    | `..._15_prior_sensitivity.png`            | index.md:1299 (Figure 15)                                             | ✓     |
| Prior sweep 0.07 vs truncation 0.32 (slide 38)       | matches                                   | index.md:1295                                                         | ✓     |
| Simplified-kernel caveat (slide 38 notes)            | ρ near 0.8, not comparable to 0.316       | index.md:1293; results_report.md:26                                   | ✓     |
| Devil's-Advocate objection/response (slide 39)       | graph is researcher-supplied; alternative is $\rho=0$ imposed silently | index.md:1588, 1570                       | ✓     |
| Figure (slide 40)                                    | `..._18_att_ladder.png`                   | index.md:1544 (Figure 19)                                             | ✓     |
| "Two libraries, four prior structures…" (slide 40)   | matches                                   | index.md:1580; results_report.md:254                                  | ✓     |
| Headline bignums (slide 41)                          | −16.87 and −5.50                          | results_report.md:137, 183                                            | ✓     |
| Takeaway 1 (slide 42)                                | −15.7 to −18.8                            | index.md:1580                                                         | ✓     |
| Takeaway 2 (slide 42)                                | 5 vs 25–26 active donors                  | index.md:1582; results_report.md:258                                  | ✓     |
| Takeaway 3 (slide 42)                                | 1.19 (1.51 simplex), 5.50 Nevada          | index.md:1333                                                         | ✓     |
| Takeaway 4 (slide 42)                                | interval, not point estimate; two failures | index.md:1595; results_report.md:268                                  | ✓     |
| Materials links (slide 43)                           | post, R edition, Colab, Quarto bundle, web app, data dictionary | index.md:16–60 (all six exist in the bundle)         | ✓     |

One ✗ — Issue #8, a LOW alt-text conflation. No on-slide number, table cell, equation or code fragment is unverifiable or invented.

---

## Title sequence (assertion-title test)

Read in order (D = divider, C = closing):

1. *(title slide)* Who Else Was Treated? — Three synthetic controls, one policy, and the interval that was 33 times too narrow
2. **[D]** Two Assumptions — Act I
3. The most replicated result in causal inference rests on two untested assumptions
4. Thirty-nine states, thirty-one years, and one line that leaves the pack
5. Nevada is California's only neighbour inside the donor pool
6. The simplex and SUTVA, written down
7. Python can now do all three stages without leaving one language
8. Where we're going
9. **[D]** Three Stages on One Panel — Act II
10. Each stage drops exactly one restriction from the stage before
11. Stage 1 — the simplex picks five donors and stops
12. California and its synthetic are indistinguishable until 1988
13. Thirty-three donors get exactly zero
14. The horseshoe makes zero the default without making it compulsory
15. Relax the simplex and the active donor pool multiplies by five
16. Two Bayesian synthetic controls, one intercept apart
17. Four counterfactual Californias
18. Drop SUTVA and the bias has a closed form
19. The identifying assumption that replaces the simplex
20. That cancellation is what makes the model usable
21. One call runs both samplers and post-processes the spillovers
22. The spatial parameter is clearly above zero
23. The two parameters leaning on one contiguity channel are the hard ones
24. What the library draws for you
25. Almost the entire spillover lands on one state
26. Nevada absorbs eleven times the next-largest donor
27. The leak runs the *opposite* way to the obvious hypothesis
28. Which means the classical estimate was biased *toward zero*
29. **[D]** Does the Interval Mean Anything? — Act III
30. The R edition of this analysis reports the same effect and a very different interval
31. Reproducing the R specification reproduces its pathology exactly
32. Chain length was never the problem
33. ESS and completeness are different questions
34. One tuning constant, three specifications
35. A memory layout was doing part of the modelling
36. Two departures were found by a test, not by inspection
37. Artefacts shrink; errors do not
38. The only prior that moves the answer is the one nobody calls a prior
39. The strongest objection — and the answer
40. Every estimator targeting this ATT agrees on the sign and the scale
41. What Proposition 99 cost, and who else paid
42. What to take away
43. Materials
44. **[C]** Let the data choose the donors, let the map tell you who else was treated, and let the effective sample size tell you whether the interval means anything.

**Verdict:** coherent abstract, with label titles at 8, 17, 24, 42, 43. Read alone, titles 3 → 44 tell the whole argument — two assumptions named, one leak channel isolated, three nested relaxations, the sign surprise, the interval post-mortem, and a thesis. The five label titles interrupt the sequence without breaking it (Issue #6); title 40 over-reaches slightly against its own figure (Issue #9). The closing is one declarative sentence, not "Questions?" or "Thank you."

---

## Positive highlights

- **Fidelity is exact, including the derived numbers.** Slide 28's bias table quotes $\alpha_{\text{Utah}} = 0.036$ and $\alpha_{\text{Idaho}} = 0.012$, which appear nowhere in `index.md` prose — they resolve to `stage2_alpha_posterior.csv` (0.036156, 0.012215) and reproduce the post's contribution figures exactly. Slide 32's "+45%" and "1,700%" are correct arithmetic on the post's own widths (0.482 → 0.702 → 12.713).
- **Slide 38 handles a genuinely dangerous number correctly.** The `prior_sensitivity` axis shows $\rho \approx 0.8$, which is *not* comparable to the headline 0.316. The takeaway reports only the comparable quantity ("Sweeping $a_0$, $b_0$ and the step size moves $\rho$ by 0.07. Truncating the **support** moves it by 0.32") and the speaker note carries the post's simplified-kernel caveat verbatim (`index.md:1293`). The level cannot be misread off the slide.
- **The LaTeX/Unicode split is exactly right.** All 47 math spans in `index.html` use MathJax `\(…\)` delimiters, while every `::: {.notes}` block spells symbols out in words ("Sigma-squared has 204,000", "rho-equals-zero case", "beta-zero at 16.86") — the split `slide-mapping.md` § "Math symbols → LaTeX" prescribes, so speaker view stays readable.
- **Slide 10 — "Each stage drops exactly one restriction from the stage before"** — sets the deck's entire comparison logic on one slide: a hard constraint, a prior, a SAR equation, and the takeaway "One regression, not three models. When a number moves, we know which restriction moved it." Everything after it is legible because of it.
- **Component contract fully honoured.** 33 `.takeaway` cards across 39 content slides, a Devil's-Advocate slide (39), a one-sentence declarative closing, three `.act` labels, an `.objection`/`.rebuttal` pair, three `.bignum` slides — with `site-brand.scss` and `title-slide.html` byte-identical to the canonical templates and a numeric key-result strip correctly carrying **no** `kr-arrow` pipeline.

---

## Priority action items

1. **[MED]** Write speaker notes for the 24 content slides that have none (Issue #7), starting with the three reconciliation tables (30, 31, 32), the Devil's-Advocate slide (39) and the 10 note-less figure slides. This is the root cause of most of the readability drift — where the notes are missing, the prose has moved onto the slide.
2. **[MED]** Cut ~10 slides to land inside the 20–30 band and rebalance the acts: merge 30+31 and 32+33, drop 24 and 17, fold 36 into 35, then move the Act III divider forward so resolution is 2–4 slides rather than 14.
3. **[MED]** Add the donor-level-interval caveat to slide 26's notes (`index.md:1042–1044` calls it "a real limitation and worth stating plainly rather than burying") and restore the post's hedge on the Nevada mechanism at `slides.qmd:384`.
4. **[MED]** Apply the rewrites for Issues #3 and #4 — split slide 35's 31-word sentence and move slide 20's body prose into its own already-complete notes.
5. **[MED]** Convert the five label titles (slides 8, 17, 24, 42, 43) to assertions using the suggestions in Issue #6.

---

## Screenshots (HIGH-severity visual issues only)

None — the browser pass was skipped (`--no-browser`) and no HIGH visual issue was detected statically.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_sc_bayes_spatial

To re-check just the dimension you fixed:

    /project:review-slides python_sc_bayes_spatial focus: design

---

## Audit metadata

- Node version: v25.9.0
- Playwright: disabled (--no-browser)
- smoke-test.js: PASS (15 of 15 checks — reveal structure, title key-result strip with 3 stats, chalkboard, menu, speaker notes, 47 math spans on MathJax `\(…\)` delimiters, 7 brand dividers, 47 `<section>` tags, 12/12 figure paths resolve, no leaked `{{…}}`)
- Branding diff: clean — `site-brand.scss` and `title-slide.html` both byte-identical to `.claude/skills/write-slides/references/templates/`
- Design/branding (browser pass): not measured (--no-browser). Static equivalents: background `$body-bg: $navy` = `#0f1729` (`site-brand.scss:23`) ok; accent rule and byline theme-provided (`title-slide.html` unmodified); pipeline `none` — a numeric strip with no `kr-arrow`, which is the correct choice; takeaway-cards **33** (counted in `index.html`)
- Tooling notes: `--no-browser` set, so runtime math typesetting (Dim 3) and 960×700 overflow (Dim 9) were not verified and their MAJOR/MINOR floors were not applied. `index.html` (72 KB, 18:09) is newer than `slides.qmd` (18:06) and contains the closing title verbatim — source and render are in sync.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
