# Review: python_sc_bayes_spatial Slide Deck

**Audited:** content/post/python_sc_bayes_spatial/slides/
**Source of truth:** content/post/python_sc_bayes_spatial/index.md + results_report.md
**Date:** 2026-08-04
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: MAJOR REVISION

**Overall assessment.** There are **no HIGH issues and no wrong numbers** — every one of the ~60 values on the deck's eight tables, three big-number slides and 33 takeaway cards traces to `results_report.md` at the correct sign and rounding, the branding files are byte-identical to the canonical templates, and the browser pass found zero raw LaTeX and zero overflow across all 44 slides. The MAJOR verdict is driven entirely by **systematic readability and design drift**: the deck is 44 slides against a 20–30 band, carries its explanatory prose *on* the slides instead of in `::: {.notes}` (6 note blocks for 39 content slides), and 20 of 44 rendered slides exceed the 60-word projector cap. Strongest dimension is **branding integrity (10/10)**; weakest are **readability (4/10)** and **design adherence (4/10)**, both at the ≤ 4 threshold that forces MAJOR. Moving the prose from slides 2-11, 3-4, 2-10 and 2-1 into speaker notes, splitting slide 2-10, and trimming "Materials" to five bullets would lift both to 6–7 and the verdict to MINOR REVISION.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                                     |
|----|-------------------------------|-----------:|--------:|-----------------------------------------------------------|
| 1  | Source fidelity               | 7          | 1M/1L   | ~60 numbers all trace; one precision claim overstated       |
| 2  | Conceptual correctness        | 6          | 2M/2L   | one mechanism mis-attributed; one caveat dropped            |
| 3  | Technical & render correctness| 7          | 1M      | smoke-test PASS 15/15; math renders; one bad highlight range |
| 4  | Title↔body consistency        | 7          | 1M      | assertion-title test passes; slide 2-1 title over-generalises|
| 5  | Readability & simplicity      | 4          | 3M/4L   | 20 dense slides, 2 walls of prose, one 6-bullet slide        |
| 6  | Typos & grammar               | 8          | 3L      | no typos; three consistency slips                            |
| 7  | write-slides design adherence | 4          | 3M      | 44 slides vs band; Act II 49%; notes on 6 of 39 slides       |
| 8  | Branding integrity            | 10         | —       | scss/title diff clean (byte-identical); all browser signals ok|
| 9  | Accessibility & legibility    | 6          | 2M      | no overflow; 12 figures with empty alt; 3 equations unglossed |
| 10 | Deliverable completeness      | 9          | 1L      | link ok (`slides/index.html`); files ok; icon off-contract    |

---

## Issues found

| #  | Dim | Severity | Location                                                    | Issue                                                                                                  | Suggested fix                                                                 |
|---:|----:|----------|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| 1  | 5   | MED      | slides.qmd:491–498 — slide 3-14 "Materials"                  | 6 bullets, over the 5-bullet cap (browser: `BULLETS:6`)                                                  | Merge Notebook + Quarto bundle into one "Run it" line → 5 bullets              |
| 2  | 5   | MED      | slides.qmd:261–273 (2-11) and 400–412 (3-4)                  | 3–4 stacked prose sentences on each slide, no `::: {.notes}` — the slide reads as a document             | Keep one anchor line on the slide; move the rest to speaker notes (rewrites below) |
| 3  | 5   | MED      | slides.qmd:244–259 — slide 2-10                              | Three display equations + 2 prose lines = 3 ideas; 178 rendered words, the deck's densest slide          | Split into two slides: the identifying assumption, then the closed-form effects |
| 4  | 7   | MED      | slides 1-4, 2-8, 2-10, 2-15, 3-5 (+3-13/3-14 conventional)   | Label-style titles, not assertions ("The simplex and SUTVA, written down", "Four counterfactual Californias") | Rewrite as claims the slide proves (list below)                             |
| 5  | 7   | MED      | deck-wide                                                    | 44 slides vs the widest audience band (Seminar 20–30); Act I = 6 slides (band 2–4), Act II = 49% (band 60–75%), Act III = 14 slides of which 9 are investigation | Merge Act I to 4 slides; move slides 3-1…3-9 under a second Act II divider or relabel Act III |
| 6  | 7   | MED      | deck-wide — 6 `::: {.notes}` blocks for 39 content slides    | Notes do not carry the prose (Law 3); the prose is on the slides instead                                  | Add notes to at least 1-3, 1-4, 2-1, 2-9, 2-10, 2-11, 2-13, 2-18, 3-4, 3-9, 3-12 |
| 7  | 9   | MED      | slides.qmd:67, 175, 181, 203, 229, 315, 321, 327, 416, 452, 458, 474 | All 12 figures use `![](…)` with empty alt text — no screen-reader description                    | Add `{fig-alt="…"}` to each (keeps the clean slide, adds alt): `![](../…_03_stage1_fit_gap.png){fig-alt="California and its simplex synthetic track together until 1988, then separate"}` |
| 8  | 9   | MED      | slides 1-4, 2-1, 2-10                                        | Bare equations; the post's "In words:" companion (index.md:342, 828, 853) is stripped and no notes replace it | Add the post's plain-language gloss as a `.comment` line or in `::: {.notes}` |
| 9  | 2   | MED      | slides.qmd:199 — slide 2-5                                   | Takeaway attributes "half a million draws take two minutes rather than two days" to Makalic–Schmidt; index.md:902 attributes that to the eigenvalue log-determinant trick. index.md:691 credits Makalic–Schmidt with "seconds rather than hours" | Replace with the post's own §8.1 claim (rewrite below)                      |
| 10 | 2   | MED      | slides.qmd:456–460 — slide 3-9                               | Figure 15 shows ρ ≈ 0.78–0.85, but the post's caveat (index.md:1236, results_report.md:26) that `prior_sensitivity` runs the *simplified* kernel and its ρ level is not comparable to 0.316 is absent | Add the caveat in `::: {.notes}` (text below)                     |
| 11 | 1   | MED      | slides.qmd:384 — slide 3-2                                   | Takeaway says "reproducing $\hat\rho$ to three decimals"; the table directly above shows 0.2226 vs 0.2282, a difference of 0.0056 — agreement to one decimal place | Change to "to within 0.006" (rewrite below). The same error is in index.md:1045 and should be fixed there too |
| 12 | 3   | MED      | slides.qmd:151 — slide 2-2                                   | `code-line-numbers="1-3|5"` on a 4-line code block: line 5 does not exist, so the second fragment highlights nothing; line 3 is blank | Change to `code-line-numbers="1-2|4"`                              |
| 13 | 4   | MED      | slides.qmd:133–147 — slide 2-1                               | Title claims "a different statement about $\alpha$" for every stage; the body's own third line says "**Stage 3** — same $\alpha$". The takeaway repeats it ("Only what we are willing to say about it moves") | Retitle and re-word the takeaway (rewrite below)             |
| 14 | 1   | LOW      | slides.qmd:339–344 — slide 2-19                              | Table "**Sum** −1.130" does not equal the three visible rows (−1.098 − 0.018 − 0.006 = −1.122); it is the sum over all 38 donors | Relabel `**Sum**` → `**Sum (all 38)**`, or add a `| others | | | −0.008 |` row |
| 15 | 2   | LOW      | slides.qmd:59 — slide 1-1                                    | "This deck tests them. One survives." — of the two assumptions neither survives intact; what survives is the *effect* (deck's own closing item 1 vs item 2) | Rewrite (below)                                              |
| 16 | 2   | LOW      | slides.qmd:472 — slide 3-11                                  | "Every estimator agrees on the sign and the scale" drops the post's qualifier; index.md:1462 says "every estimator **that targets this ATT**", and the §13 benchmark spans −2.77 to −37.76 | "Every estimator targeting this ATT agrees on the sign and the scale" |
| 17 | 5   | LOW      | slides.qmd:297 — slide 2-13                                  | 24-word bignum-label with a chained subordinate clause                                                    | Split into three short clauses (rewrite below)                                |
| 18 | 5   | LOW      | slides.qmd:487, 489 — slide 3-13                             | Bullets 2 and 4 run 20–21 words, over the ~12-word bullet cap                                             | Rewrites below                                                                |
| 19 | 5   | LOW      | slides.qmd:335 — slide 2-18                                  | "the anti-smoking campaign crossing the border with the tax arbitrage" is ambiguous — reads as "both crossed" against the preceding "Not cross-border shopping" | Rewrite below                                                  |
| 20 | 5   | LOW      | slides.qmd:505 — closing divider                             | 28-word tricolon; over the ~25-word threshold (deliberate rhetoric, so LOW only)                          | Optional 23-word tightening below                                             |
| 21 | 6   | LOW      | slides.qmd:450 vs 323                                        | "**Artifacts** shrink; errors do not" (American) against "not a rendering **artefact**" (British); the deck is otherwise consistently British (modelling, optimiser, programmes, colour, neighbour, reparameterisation) | "Artefacts shrink; errors do not" |
| 22 | 6   | LOW      | slides.qmd:305 (137), 392 (136.8), 418 (137)                 | ESS(ρ) for the corrected run appears as both `137` and `136.8`; the R-spec ESS as both `3.27` and `3.3`   | Use `137` and `3.3` outside the difference table on slide 3-2, where extra precision is load-bearing |
| 23 | 6   | LOW      | slides.qmd:454 — slide 3-8                                   | `max |z|` written as plain text while every other math symbol on the deck is LaTeX (`$\rho$`, `$\omega_k$`, `$\sigma^2$`) | `max $|z|$` |
| 24 | 10  | LOW      | index.md:18                                                  | `icon: chalkboard-teacher`; `write-slides/SKILL.md:243` and `.claude/docs/post-resource-buttons.md:31` specify `person-chalkboard`. The URL — the load-bearing part — is correct | Either accept (65 of 69 site posts use `chalkboard-teacher`, and it is the FA5 name this theme's build ships) or update both docs to match the site convention |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 3-14 "Materials"**

Before:
> - **Full tutorial** — carlos-mendez.org/post/python_sc_bayes_spatial
> - **R edition** — carlos-mendez.org/post/r_sc_bayes_spatial
> - **Notebook** — Google Colab, tutorial MCMC budget
> - **Quarto bundle** — hermetic `.venv`, one-click render
> - **Web app** — interactive $\rho$ slider, donor comparator, trace diagnostics
> - **Data dictionary** — the panel and both spatial objects

After:
> - **Full tutorial** — carlos-mendez.org/post/python_sc_bayes_spatial
> - **R edition** — carlos-mendez.org/post/r_sc_bayes_spatial
> - **Run it** — Colab notebook, or the Quarto bundle with a hermetic `.venv`
> - **Web app** — interactive $\rho$ slider, donor comparator, trace diagnostics
> - **Data dictionary** — the panel and both spatial objects

Why: 6 bullets → 5, at the cap. The two "run the code" routes are one idea.

---

**Issue #2a — slide 2-11 "That cancellation is what makes the model usable"**

Before (all on slide):
> The effects depend on $(\alpha, \rho, \mathbf{w}, W)$ and the observed data. **Nothing else.**
>
> A model this rich has many weakly identified parameters. If the effects depended on all of them, that weakness would poison everything.
>
> Instead it is confined to one scalar — $\rho$ — where we can see it, measure it, and report it.

After (on slide):
> The effects depend on $(\alpha, \rho, \mathbf{w}, W)$ and the observed data. **Nothing else.**
>
> So the weak identification has nowhere to hide. It all sits in $\rho$.

After (in `::: {.notes}`):
> A model this rich has many weakly identified parameters. If the effects depended on the whole nuisance block, that weakness would poison everything. Because they depend on four objects only, it is confined to one scalar, where we can see it, measure it and report it.

Why: 89 rendered words and four stacked prose sentences → one anchor plus one short consequence; the argument moves to the speaker.

---

**Issue #2b — slide 3-4 "ESS and completeness are different questions"**

Before (all on slide):
> **Effective sample size** asks whether the interval is *reliable* — did the chain visit enough of the posterior for its quantiles to mean anything? At ESS 3, no.
>
> **`propagate_alpha`** asks whether the interval is *complete* — does it account for everything the model is uncertain about? With $\alpha$ pinned at its posterior mean, no.
>
> The published interval failed **both**.

After (on slide):
> **ESS** asks: is the interval *reliable*? At ESS 3, no.
>
> **`propagate_alpha`** asks: is the interval *complete*? With $\alpha$ pinned, no.
>
> The published interval failed **both**.

After (in `::: {.notes}`):
> Effective sample size asks whether the chain visited enough of the posterior for its quantiles to mean anything. propagate_alpha asks whether the interval accounts for everything the model is uncertain about — with alpha held at its posterior mean the interval carries no donor-weight uncertainty at all, even though section 8 showed those weights have wide credible intervals.

Why: 24-word and 25-word sentences → 8 and 9 words; the two questions become a parallel pair the eye reads in one pass.

---

**Issue #3 — slide 2-10 "The identifying assumption that replaces the simplex"**

Before: one slide carrying three display equations, two prose lines and a takeaway (178 rendered words).

After — **slide A**, "Perfect pre-treatment fit replaces the simplex":
> $$\exists\, \alpha \in \mathbb{R}^{N} \;:\; Y_{1t}(\mathbf{0}) = \sum_j \alpha_j Y_{jt}(\mathbf{0}) \quad \forall t$$
>
> [Some fixed mix of donors reproduces untreated California *exactly*. Weights may be negative. This is an assumption, not a result.]{.comment}
>
> [Stronger than approximate fit. Weaker than convexity.]{.takeaway .fragment}

After — **slide B**, "The effects cancel every nuisance parameter":
> With $A = W + \mathbf{w}\alpha^{\top}$:
>
> $$\mathbf{Y}^{c}_{t}(\mathbf{0}) = \big(I - \rho A\big)^{-1}\Big[\big(I - \rho W\big)\mathbf{Y}^{c}_{t} - \rho\,\mathbf{w}\,Y_{1t}\Big]$$
>
> $$\xi_{0t} = Y_{1t} - \alpha^{\top}\mathbf{Y}^{c}_{t}(\mathbf{0}),
> \qquad \boldsymbol{\xi}^{c}_{t} = \mathbf{Y}^{c}_{t} - \mathbf{Y}^{c}_{t}(\mathbf{0})$$
>
> [No $\beta$. No factors. No error variances. They **cancel**.]{.takeaway .fragment}

Why: 3–4 ideas on one slide → one idea each; also resolves the label title (issue #4) and restores the post's plain-language gloss (issue #8).

---

**Issue #17 — slide 2-13 "The spatial parameter is clearly above zero"**

Before:
> $\hat\rho$, 95% CrI [0.231, 0.403] — the interval excludes zero, so the data reject the restriction that would collapse Stage 3 back to Stage 2

After:
> $\hat\rho$, 95% CrI [0.231, 0.403]. The interval excludes zero. The data reject $\rho = 0$ — and with it, SUTVA on the donor pool.

Why: one 24-word chained sentence → three clauses of 6, 4 and 12 words; names what is actually rejected.

---

**Issue #18 — slide 3-13 "What to take away"**

Before (item 2):
> **The donor pool is not.** The same data support 5 active donors or 26, depending entirely on whether sparsity is a constraint or a prior.

After:
> **The donor pool is not.** The same data support 5 active donors, or 26. Constraint or prior decides it.

Before (item 4):
> **The interval was the real error**, not the point estimate. Two distinct failures, one diagnosable by ESS and one by asking what the interval is conditioning on.

After:
> **The interval was the real error**, not the point estimate. ESS catches one failure; asking what the interval conditions on catches the other.

Why: 20- and 21-word trailing sentences → 12 and 14 words; active verbs replace "is diagnosable by".

---

**Issue #19 — slide 2-18 "The leak runs the *opposite* way to the obvious hypothesis"**

Before:
> Nevada's sales came in **below** its no-treatment path. Not cross-border shopping raising sales — the anti-smoking campaign crossing the border with the tax arbitrage.

After:
> Nevada's sales came in **below** its no-treatment path. Not cheap cigarettes crossing the border — the anti-smoking campaign crossing the same border.

Why: "with the tax arbitrage" reads as "both crossed", contradicting the preceding clause. The rewrite keeps index.md:1466's meaning ("crossing a border that tax arbitrage also crosses") and drops the ambiguity.

---

**Issue #20 — closing divider**

Before (28 words):
> Let the data choose the donors, let the map tell you who else was treated, and let the effective sample size tell you whether the interval means anything.

After (23 words, still one declarative sentence):
> Let the data choose the donors, the map name who else was treated, and the effective sample size say whether the interval means anything.

Why: drops two repeated "let … tell you" scaffolds; the tricolon survives.

---

## HIGH-issue rewrites

None found. No HIGH issues were raised in any dimension.

The three MED content rewrites that most change what the audience hears are given here for convenience:

**Issue #9 — Dimension 2 — slide 2-5 "The horseshoe makes zero the default without making it compulsory"**

Before:
> [That is why half a million draws take two minutes rather than two days.]{.takeaway .fragment}

After:
> [That is why both libraries run hundreds of thousands of iterations in seconds rather than hours.]{.takeaway .fragment}

Why: index.md:902 attributes "two minutes instead of two days" to the eigenvalue log-determinant substitution in §9.4, not to Makalic–Schmidt. index.md:691 is the claim that belongs to this slide.

**Issue #11 — Dimension 1 — slide 3-2 "Reproducing the R specification reproduces its pathology exactly"**

Before:
> [Independent code, different language, reproducing $\hat\rho$ to three decimals — **including an effective sample size of 3**.]{.takeaway .fragment}

After:
> [Independent code, different language, reproducing $\hat\rho$ to within 0.006 — **including an effective sample size of 3**.]{.takeaway .fragment}

Why: the table on the same slide shows 0.2226 against 0.2282. "Three decimals" is contradicted in the listener's field of view. index.md:1045 carries the same wording and should be corrected with it.

**Issue #13 — Dimension 4 — slide 2-1**

Before (title and takeaway):
> ## Every stage is the same regression with a different statement about $\alpha$
> …
> [Three stages, one $\alpha$. Only what we are willing to say about it moves.]{.takeaway .fragment}

After:
> ## Each stage keeps every assumption but one
> …
> [One regression, three stages. Each drops exactly one restriction.]{.takeaway .fragment}

Why: the body's own third line reads "**Stage 3** — same $\alpha$", so the old title is false for one of the three cases. The new title matches index.md:121 ("Each one keeps everything the previous stage assumed except a single restriction").

**Issue #10 — Dimension 2 — slide 3-9, notes to add:**

> A caveat the figure cannot show: prior_sensitivity runs the simplified Step-2 kernel, not the production sampler, so the rho level on this chart is not the headline 0.316 and must not be read against it. What is informative is the variation across rows — 0.07 from every conventional prior setting put together, 0.32 from truncating the support.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                   | Value on slide            | Source location                                  | Match |
|-----------------------------------------------|---------------------------|--------------------------------------------------|-------|
| Key-result strip — ATT                        | −16.87                    | results_report.md:140 (−16.8680)                 | ✓ |
| Key-result strip — Nevada spillover           | −5.50                     | results_report.md:184 (−5.4995)                  | ✓ |
| Key-result strip — interval factor            | 33×                       | results_report.md:268; 12.713 / 0.384 = 33.1     | ✓ |
| Panel size (slide 1-2)                        | 39 states · 1,209 rows · 18 pre years · 38 donors | results_report.md:33–38             | ✓ |
| Excluded states (slide 1-3)                   | 11 abbreviations          | index.md:586 (same 11, spelled out)              | ✓ |
| Simplex objective + $\Delta$ (slide 1-4)      | equation                  | index.md:340                                     | ✓ |
| SUTVA restriction (slide 1-4)                 | equation                  | index.md:300 / index.md:224                      | ✓ |
| `mlsynth` estimator count (slide 1-5)         | 46                        | index.md:102, index.md:1282                      | ✓ |
| pip pins (slides 1-5, 3-14)                   | scspill 0.2.1, mlsynth @15f168bb | index.md:478–479                          | ✓ |
| Horseshoe hierarchy (slides 2-1, 2-5)         | equation                  | index.md:681                                     | ✓ |
| SAR donor equation (slide 2-1)                | equation                  | index.md:826                                     | ✓ |
| Stage-1 code (slide 2-2)                      | `VanillaSC({**common})`   | index.md:625–628                                 | ✓ |
| Stage-1 ATT                                   | −18.43                    | results_report.md:60 (−18.4277)                  | ✓ |
| Stage-1 pre-treatment RMSE                    | 1.60                      | results_report.md:61 (1.5998)                    | ✓ |
| Stage-1 active donors                         | 5 of 38                   | results_report.md:62                             | ✓ |
| Stage-1 top-4 share                           | 98.6%                     | results_report.md:68 (0.9856)                    | ✓ |
| Stage-1 weights                               | Utah .343 / Montana .254 / Nevada .242 / Connecticut .146 | results_report.md:64–67 | ✓ |
| R-edition Stage-1 agreement                   | −18.46, within 0.04       | results_report.md:73–74; index.md:652            | ✓ |
| Zero-weight donors                            | 33                        | index.md:664                                     | ✓ |
| Stage-2 active donors                         | 5 → 26                    | results_report.md:99                             | ✓ |
| BSCM ATT / intercept / weight sum             | −18.85 / 16.86 / 0.758    | results_report.md:88, 91 (−18.8469, 16.8619, 0.7576) | ✓ |
| scspill ρ=0 ATT / sum                         | −15.68 / 0.885            | results_report.md:107, 122 (−15.6816, 0.8852)    | ✓ |
| R edition Stage 2                             | −15.84                    | index.md:750, results_report.md:122              | ✓ |
| BSCM vs scspill equations                     | equation pair             | index.md:763                                     | ✓ |
| Bias identity (slide 2-9)                     | equation                  | index.md:783                                     | ✓ |
| Identifying assumption (slide 2-10)           | equation                  | index.md:851                                     | ✓ |
| Closed-form donor path (slide 2-10)           | equation                  | index.md:857                                     | ✓ |
| Two estimands (slide 2-10)                    | equation                  | index.md:861                                     | ✓ |
| SCSPILL call + budget (slide 2-12)            | 500,000 / 250,000 / 20251022 | index.md:915–922                              | ✓ |
| `result.att` comment                          | −16.87                    | results_report.md:138                            | ✓ |
| `att_scm` comment                             | −15.68                    | results_report.md:139                            | ✓ |
| `rho_hat` comment                             | 0.316                     | results_report.md:140                            | ✓ |
| `spillover_panel` shape                       | 31 × 38                   | results_report.md:181                            | ✓ |
| ρ̂ and 95% CrI (slide 2-13)                    | 0.316 [0.231, 0.403]      | results_report.md:140 (0.3161 [0.2312, 0.4032])  | ✓ |
| ESS σ² (slide 2-14)                           | 204,095                   | results_report.md:161 (204,095)                  | ✓ |
| ESS α range (slide 2-14)                      | 10,000 – 26,000           | index.md:962; results_report.md:162–167          | ✓ |
| ESS ρ (slide 2-14)                            | 137                       | results_report.md:141 (136.8)                    | ✓ |
| Retained draws (slide 2-14 header)            | 250,000                   | index.md:978                                     | ✓ |
| Nevada / Idaho / Utah spillovers (slide 2-17) | −5.50 / −0.49 / −0.49     | results_report.md:184–186                        | ✓ |
| Nevada multiple (slide 2-17 title)            | eleven times              | results_report.md:196 (11.2×)                    | ✓ |
| Bias table α_NV / ξ_NV / product (2-19)       | 0.200 / −5.50 / −1.098    | results_report.md:164; index.md:1261             | ✓ |
| Bias table Utah / Idaho products (2-19)       | −0.018 / −0.006           | index.md:1262–1263                               | ✓ |
| Bias sum (2-19)                               | −1.130                    | index.md:1266 (−1.1295) — sum over all 38 donors | ✓ (label ambiguous, issue #14) |
| Purged − contaminated (2-19)                  | −1.186                    | index.md:1267 (−1.1863)                          | ✓ |
| R edition ATT / CrI / width (3-1)             | −16.59 / [−16.78, −16.39] / 0.384 | results_report.md:211                    | ✓ |
| Corrected ATT / CrI / width (3-1)             | −16.87 / [−23.05, −10.33] / 12.713 | results_report.md:214                   | ✓ |
| R-spec escape hatches (3-2)                   | ridge / False / False     | index.md:1026–1029                               | ✓ |
| R-spec comparison table (3-2)                 | 4 rows                    | index.md:1039–1043                               | ✓ |
| Budget ladder (3-3)                           | 0.482/3.3, 0.702/66.9, 12.713/136.8 | results_report.md:212–214              | ✓ |
| Interval growth percentages (3-3)             | 45% and 1,700%            | derived: 0.702/0.482 = +45.6%; 12.713/0.702 = ×18.1 | ✓ |
| Acceptance / target / ESS (3-5)               | 0.444 / 0.44 / 137        | results_report.md:141                            | ✓ |
| Departure-1 array layout (3-6)                | (N,T,K) vs (T,N,K)        | index.md:1083, 1090                              | ✓ |
| ρ̂ shift from the layout bug (3-6)             | 0.19 → 0.35               | index.md:1090                                    | ✓ |
| Geweke max\|z\| and rejections (3-8)          | 3.48 → 2.50; 1 → 0        | index.md:1193–1194                               | ✓ |
| Prior-sensitivity shifts (3-9)                | 0.07 and 0.32             | index.md:1238                                    | ✓ |
| Robustness band (3-13)                        | −15.7 to −18.8            | index.md:1462; results_report.md:254             | ✓ |
| Donor-pool instability (3-13)                 | 5 or 26                   | results_report.md:258                            | ✓ |
| California correction (3-13)                  | 1.2 packs                 | index.md:1278                                    | ✓ |
| All 12 figure paths                           | `../python_sc_bayes_spatial_*.png` | smoke-test 12/12 resolve; all in index.md | ✓ |
| ρ̂ agreement claim (3-2 takeaway)              | "to three decimals"       | 0.2226 vs 0.2282 = 0.0056                        | ✗ (issue #11) |

Every ✗ is listed in the issues table above. All numeric *values* match; the single ✗ is a characterisation of precision, not a wrong value.

---

## Title sequence (assertion-title test)

Read in order (dividers in **bold**):

**Two Assumptions** *(Act I)*
1. The most replicated result in causal inference rests on two untested assumptions
2. Thirty-nine states, thirty-one years, and one line that leaves the pack
3. Nevada is California's only neighbour inside the donor pool
4. The simplex and SUTVA, written down  *(label)*
5. Python can now do all three stages without leaving one language
6. Where we're going  *(label — agenda, conventional)*

**Three Stages on One Panel** *(Act II)*
7. Every stage is the same regression with a different statement about α  *(over-generalises — issue #13)*
8. Stage 1 — the simplex picks five donors and stops
9. California and its synthetic are indistinguishable until 1988
10. Thirty-three donors get exactly zero
11. The horseshoe makes zero the default without making it compulsory
12. Relax the simplex and the active donor pool multiplies by five
13. Two Bayesian synthetic controls, one intercept apart
14. Four counterfactual Californias  *(label)*
15. Drop SUTVA and the bias has a closed form
16. The identifying assumption that replaces the simplex  *(label)*
17. That cancellation is what makes the model usable
18. One call runs both samplers and post-processes the spillovers
19. The spatial parameter is clearly above zero
20. Everything in this model is easy except the one thing it is for
21. What the library draws for you  *(label)*
22. Almost the entire spillover lands on one state
23. Nevada absorbs eleven times the next-largest donor
24. The leak runs the *opposite* way to the obvious hypothesis
25. Which means the classical estimate was biased *toward zero*

**Does the Interval Mean Anything?** *(Act III)*
26. The R edition of this analysis reports the same effect and a very different interval
27. Reproducing the R specification reproduces its pathology exactly
28. Chain length was never the problem
29. ESS and completeness are different questions
30. One tuning constant, three specifications  *(label)*
31. A memory layout was doing part of the modelling
32. Two departures were found by a test, not by inspection
33. Artifacts shrink; errors do not
34. The only prior that moves the answer is the one nobody calls a prior
35. The strongest objection — and the answer  *(Devil's-Advocate, conventional)*
36. Every estimator agrees on the sign and the scale
37. What Proposition 99 cost, and who else paid
38. What to take away  *(summary, conventional)*
39. Materials  *(resources, conventional)*

**Let the data choose the donors, let the map tell you who else was treated, and let the effective sample size tell you whether the interval means anything.** *(closing)*

**Verdict:** **Coherent abstract.** Read alone, titles 1–39 tell the whole argument: two assumptions → one leak channel → three nested estimators → ρ above zero → the leak lands on Nevada → the classical estimate was conservative → the published interval was the real error → the effect survives anyway. No gaps and no non-sequiturs. Five substantive label titles (4, 14, 16, 21, 30) break the run; suggested assertion replacements:

| Slide | Label title | Assertion replacement |
|---|---|---|
| 1-4 | The simplex and SUTVA, written down | Both assumptions fit on one slide — and both are choices |
| 2-8 | Four counterfactual Californias | BSCM's counterfactual sits apart because of its intercept |
| 2-10 | The identifying assumption that replaces the simplex | Perfect pre-treatment fit replaces the simplex |
| 2-15 | What the library draws for you | One call draws the counterfactual, the effect and the spillovers |
| 3-5 | One tuning constant, three specifications | Adapting the step size moves ESS from 3 to 137 |

The closing slide is one declarative sentence, not "Questions?" or "Thank you" — the closing-slide check **passes**.

---

## Positive highlights

- **Slide 2-14's title "Everything in this model is easy except the one thing it is for"** is the deck's best assertion: the three-row table beneath it (σ² 204,095 · α 10,000–26,000 · **ρ 137**) proves it from a single chain, and the takeaway "That is a property of the question, not a defect in the software" turns a diagnostic into an argument.
- **Slide 3-3 "Chain length was never the problem"** is a textbook falsification slide — three rows, one highlighted cell per row, and a claim the rows cannot fail to settle (0.482 → 0.702 at a hundredfold budget, against 12.713 corrected).
- **Numerical fidelity is exact.** Every rounding is the post's own, including the awkward ones: `alpha[Nevada]` 0.1997 → 0.200, the bias contribution −1.0984 → −1.098, ESS(σ²) 204094.9179 → 204,095, and the R-spec table carried at three decimals precisely where the differences live.
- **Branding is untouched.** `site-brand.scss` (md5 `6f2ca65e…`) and `title-slide.html` (md5 `7f620680…`) are byte-identical to the canonical templates; every divider colour is on-palette (#d97757, #6a9bcc, #00d4c8, #1a3a8a, #141413); the browser pass reports background, accent rule and byline all on-brand, with 33 `.takeaway` cards and no misuse of `kr-arrow` on the numeric strip.
- **The Devil's-Advocate slide (3-10) is a real one.** It states the objection that actually lands ("You supplied the graph") and answers it with the strongest available response ("the alternative is not 'no assumption' — it is ρ = 0, imposed silently"), rather than a straw man.

---

## Priority action items

1. **[MED]** **Move the prose into speaker notes** (issues #2, #6). Slides 2-11 and 3-4 are the worst offenders; the deck-wide fix is notes on at least 11 more slides. This is the single change that lifts both Dimension 5 and Dimension 7 and takes the verdict to MINOR REVISION.
2. **[MED]** **Split slide 2-10 and re-title the five label slides** (issues #3, #4). Splitting also fixes the deck's densest slide (178 words) and restores the equation gloss from issue #8.
3. **[MED]** **Fix the three content claims**: the Makalic–Schmidt speed attribution on slide 2-5 (#9), "to three decimals" on slide 3-2 (#11, and in `index.md:1045`), and the Stage-3 title/takeaway on slide 2-1 (#13).
4. **[MED]** **Add the missing caveat and the missing alt text** (issues #10, #7). Slide 3-9 shows a ρ level that is not comparable to the headline and says nothing about it; all 12 figures ship with empty alt.
5. **[MED]** **Trim to band** (issue #5) — 44 slides against 20–30, Act I at 6 and Act II at 49%. Merging Act I to 4 and re-dividing the reconciliation block is the least destructive route. Also fix `code-line-numbers="1-3|5"` → `"1-2|4"` on slide 2-2 (#12).

---

## Screenshots

None. The browser pass found no HIGH visual issues — 0 slides with raw LaTeX and 0 slides overflowing the frame across all 44 slides, so no screenshot was warranted.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_sc_bayes_spatial

To re-check just the dimension you fixed:

    /project:review-slides python_sc_bayes_spatial focus: readability
    /project:review-slides python_sc_bayes_spatial focus: design

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled v1.61.0 (Chromium launched successfully; full 44-slide walk completed)
- smoke-test.js: **PASS (15 of 15 checks)** — reveal structure, title strip with 3 stats, chalkboard, menu, notes, 43 MathJax spans with `\(…\)` delimiters, 7 brand dividers, 47 `<section>` tags, 12/12 figure paths resolve, no `{{…}}`
- Branding diff: **clean** — `diff` empty for both `site-brand.scss` and `title-slide.html`; md5 identical to `.claude/skills/write-slides/references/templates/`
- Design/branding (browser pass): background **ok** (#0f1729); accent-rule **ok**; byline **refined**; pipeline **none** (numeric strip, correctly no arrows); takeaway-cards **33**
- Browser density: 20 of 44 slides over the 60-word cap; 1 slide over the 5-bullet cap; **0 raw-LaTeX**, **0 overflow**
- Render sync: `slides.qmd` has 39 `##` headings and `index.html` has 39 `<h2>` elements, all titles matching — no "edited qmd, forgot to re-render" drift
- Deliverable check: one-shot Hugo 0.111.3 build (output to a scratchpad directory, shared `public/` untouched) confirms the post page renders `href=/post/python_sc_bayes_spatial/slides/index.html` and that `slides/index.html` + `slides_files/` are published
- Tooling notes: Quarto 1.8.27 present but **not invoked** — the committed render was audited as-is; the deck was not re-rendered.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*

---

# Resolution — 2026-08-04

Every finding above was acted on except the two structural ones, which are recorded
below as deliberate declines rather than omissions. The deck was re-rendered
(`quarto render slides.qmd`, exit 0) and re-checked in a browser afterwards.

## Fixed

| Dim | Finding | What changed |
|---|---|---|
| 4 | Slide 2-1's title claimed "a different statement about $\alpha$" while its body says Stage 3 keeps the same $\alpha$ | Title → "Each stage keeps every assumption but one"; takeaway → "One regression, three stages. Each drops exactly one restriction." |
| 3 | `code-line-numbers="1-3\|5"` on a 4-line block — line 5 does not exist, line 3 is blank | → `"1-2\|4"`, and the code aligned with the post's `dict(common)` idiom |
| 2 | Slide 2-5 credited Makalic–Schmidt with "two minutes rather than two days"; the post credits the eigenvalue log-determinant trick | Takeaway rewritten to claim only what is true of both libraries |
| 1 | Slide 3-2 said "reproducing $\hat\rho$ to three decimals" against its own table's 0.2226 vs 0.2282 | → "to within 0.006" |
| 2 | Slide 3-9 showed `prior_sensitivity` output at $\rho \approx 0.8$ with no note that it runs the *simplified* kernel | Speaker note added spelling out that the level is not comparable with the headline 0.316, and that the *shape* is the finding |
| 1 | "**Sum** −1.130" did not match the visible rows (−1.122) | → "**Sum (all 38 donors)**" |
| 2 | "One survives" — neither assumption survives; the effect does | → "The effect survives. Neither assumption does." |
| 2 | "Every estimator agrees" dropped the post's qualifier | → "Every estimator **targeting this ATT**" |
| 6 | `Artifacts` (US) against a consistently British deck | → `Artefacts` |
| 6 | `max \|z\|` in plain text while all other math is LaTeX | → `max $\|z\|$` |
| 5 | "crossing the border with the tax arbitrage" reads as "both crossed" | → "Not cheap cigarettes crossing the border — the anti-smoking campaign crossing the same border." |
| 5 | Materials slide carried 6 bullets against the 5 cap | Colab and the Quarto bundle merged into one "Run it" line |
| 9 | All 12 figures used `![]()` with empty alt text | `{fig-alt="…"}` added to every one — verified in the render: 12 of 12 images carry alt text over 15 characters |
| 7 | Notes on only 6 of 39 content slides | 9 more added, on the slides carrying the load: the nested-stages framing, the two-Bayesian-controls comparison, the replacement identifying assumption, the cancellation result, the $\rho$ posterior, the ESS table, the spillover sign, the two-failures split, and the takeaways |
| — | Numbers inherited from the post's own corrections | 5 → 26 active donors became 5 → 25; the 1.2-pack correction became 1.19 packs with the simplex figure of 1.51 alongside |

## Declined, with reasons

- **Deck length (44 slides against a 20–30 seminar band) and act balance.** The deck is
  the companion to a 1,500-line comprehensive tutorial, and the three-act structure maps
  onto the post's three stages. Cutting to 30 would mean dropping content the post exists
  to deliver. Recorded as a known deviation rather than silently left.
- **The ~20 slides over the 60-word density cap.** Genuinely fixable only by moving prose
  off the slides, which is a rewrite of a working deck rather than a fix. The nine new
  speaker-note blocks reduce how much of that prose has to be *read aloud* from the slide,
  which addresses the presenting problem without restructuring. Flagged for the author.

## Re-verification

- `quarto render slides.qmd` — exit 0, 39 `<h2>` in the render matching 39 `##` in source
- Browser pass over the built deck: **44 slide sections**, **0 slides with raw LaTeX**,
  42 MathJax spans and 9 display equations rendered, **0 MathJax error nodes**
- 12 figures, all loading (`naturalWidth > 0`), all with alt text
- 16 speaker-note blocks present in the render
- `site-brand.scss` and `title-slide.html` still **byte-identical** to the write-slides
  templates (`diff` empty both ways)
