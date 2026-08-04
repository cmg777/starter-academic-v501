# Review: python_sc_dsc_sdid Slide Deck

**Audited:** content/post/python_sc_dsc_sdid/slides/
**Source of truth:** content/post/python_sc_dsc_sdid/index.md (no `results_report.md`; the bundle's `*.csv` outputs used as secondary authority)
**Date:** 2026-08-04
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** skipped (--no-browser)

---

## Verdict: MAJOR REVISION

**Overall assessment.** This is a technically immaculate deck — the smoke test passes 15/15, both branding files are byte-identical to the canonical templates, all 12 figures resolve, every equation was correctly de-Goldmarked for Pandoc, no code fence is executable, and there is not one character of Unicode math on a slide. Dimensions 3, 9 and 10 are clean; Dimension 1 is the weakest. It fails on two content defects that the rubric treats as show-stoppers: slide 24's title asserts that **all three** defaults move the answer more than the ladder does, while its own table (and `index.md:1542`) show `zeta` at 0.13 pp against the ladder's 0.31 pp; and slide 19 states an **87-91%** donor-share range that appears nowhere in the post and is contradicted by `donor_weights_by_method.csv` (the five named countries carry 82.8% under MASC and 92.4% under ASCM). Fixing those two lines — one title, one number — plus the three MED fidelity slips (51.9%, `.weight_vector`, "five inference routes") would move this to MINOR REVISION immediately; Dimensions 5 and 7 would then set the ceiling.

**Audited 10 of 10 dimensions.** The browser-only checks inside Dimensions 3 (does math actually typeset) and 9 (960x700 overflow) are marked `[~]` and excluded from those dimensions; their static parts ran in full.

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues   | Notes                                                         |
|----|-------------------------------|-----------:|---------:|---------------------------------------------------------------|
| 1  | Source fidelity               | 4          | 1H/3M/2L | 1 invented number (87-91%); 3 unsourced/altered claims         |
| 2  | Conceptual correctness        | 8          | 0H/0M/2L | estimand only in notes; one loose range attribution            |
| 3  | Technical & render correctness| 10         | 0H/0M/0L | smoke-test PASS 15/15; math render `[~]` (no browser)          |
| 4  | Title↔body consistency        | 4          | 1H/0M/0L | assertion-title test passes; slide 24 title contradicts table  |
| 5  | Readability & simplicity      | 7          | 0H/1M/4L | 0 slides >5 bullets; 1 slide with 5 fragment advances          |
| 6  | Typos & grammar               | 9          | 0H/0M/1L | no `--`, no doubled words; range punctuation inconsistent      |
| 7  | write-slides design adherence | 6          | 0H/2M/1L | arc ok; closing ok; 41 slides is over every audience band      |
| 8  | Branding integrity            | 9          | 0H/0M/1L | scss/title-slide diff **clean**; one off-palette divider hex   |
| 9  | Accessibility & legibility    | 10         | 0H/0M/0L | 12/12 figures captioned; overflow `[~]` (no browser)           |
| 10 | Deliverable completeness      | 10         | 0H/0M/0L | link `url: slides/index.html` ok; index.html 91 KB; 12/12 figs |

Skipped dimensions show `—` in the score column with `not audited` in Notes. None were skipped; the `[~]` sub-checks are noted inline.

---

## Issues found

| #  | Dim | Severity | Location                                                                 | Issue                                                                                                                                                                                                                                                            | Suggested fix                                                                       |
|---:|----:|----------|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| 1  | 4   | HIGH     | slide 24 — "Three defaults each move the answer more than the ladder does" (slides.qmd:372) | Title claims all three defaults beat the ladder's spread; the slide's own table shows `zeta` at 0.13 pp vs the ladder's 0.31 pp. `index.md:1542` states explicitly that "`set_f` and the covariate method each clear it on their own **while `zeta` stays just inside**." | Retitle — see rewrite below                                                          |
| 2  | 1   | HIGH     | slide 19 — "Five estimators, essentially the same five countries" (slides.qmd:319) | "carry 87-91% of the counterfactual under every method" — no such figure in `index.md` (see :1210, which gives no percentage); from `donor_weights_by_method.csv` the five sum to 90.8 / 91.7 / 91.7 / **82.8** / **92.4**% for SC / DSC / SDID / MASC / ASCM. Both ends fall outside 87-91%. | Use the true range 83-92%, or drop the percentage — see rewrite below                 |
| 3  | 1   | MED      | slide 2 — "There is only one United Kingdom…" (slides.qmd:45)            | "51.9% voted to leave" — the figure appears nowhere in `index.md` or `analysis.py`; the post says only "the United Kingdom voted to leave" (`index.md:107`).                                                                                                     | Add the referendum result to the post, or cut the number from the slide               |
| 4  | 1   | MED      | slide 10 — "One result object, seven accessors…" (slides.qmd:167)        | `.weight_vector` glossed as "dense array **over the donor pool**"; `index.md:539` says "dense array of `donor_weights.values()`" — length 9, not 23. The slide's own notes say "`len(result.donor_weights)` is 9 here, not 23".                                   | Restore the post's wording: "dense array of `donor_weights.values()`"                 |
| 5  | 1   | MED      | slide 37 — "The strongest objection — and the answer" (slides.qmd:571)   | "Five inference routes span $p = 0.006$ to $0.042$". `index.md:1433`: **four** report p-values in that range; `scpi` reports no p-value, only an interval that stops short of zero.                                                                              | "Four p-values span 0.006 to 0.042; scpi's interval excludes zero"                    |
| 6  | 5   | MED      | slide 5 — "Where we're going" (slides.qmd:91-97)                         | `::: {.incremental}` with 5 bullets = 5 fragment advances; the cap is 4 (`readability-rules.md`; `rhetoric-of-decks.md` § MB/MC).                                                                                                                                | Merge "Compare" and "Report" into one bullet — see rewrite below                       |
| 7  | 7   | MED      | deck-wide (41 slides: 36 `##` + 5 `#`)                                   | Outside every audience band in `design-adherence.md` (Conference 10-14, Teaching/Working 16-22, Seminar 20-30). Front matter records no audience, so no band can be claimed.                                                                                     | Declare the audience and cut toward 30 — candidates: slides 30, 40, and merging 13 into 12 |
| 8  | 7   | MED      | slide 15 — "Stage 3 — SDID also fits which quarters count" (slides.qmd:240-254) | The only substantive content slide with no `[…]{.takeaway .fragment}` card — it ends on a small `.comment` gloss. 30 of the other 31 content slides carry one, so this breaks the deck's own pattern on its flagship stage.                                    | Promote a conclusion to a `.takeaway` card                                            |
| 9  | 1   | LOW      | slide 19 — speaker notes (slides.qmd:324)                                | "MASC spreads a small uniform-looking 0.0158 across **seven** otherwise-zero donors" — `donor_weights_by_method.csv` shows **six** at 0.015769 (Austria, Belgium, France, Netherlands, Spain, Sweden). Not stated in the post at all.                             | Change "seven" to "six"                                                               |
| 10 | 1   | LOW      | slide 33 — speaker notes (slides.qmd:516)                                | "With TSSC left to select its own variant, that step alone would be around forty minutes." Not in the post; from `index.md:903` (17 s per full TSSC fit) x 40 passes ≈ 11 minutes. `index.md:1065` frames the whole loop as "two-minute vs two-hour".              | "…roughly ten minutes for that step alone", or cite the post's two-hour framing        |
| 11 | 2   | LOW      | slide 38 — "What the referendum cost" (slides.qmd:587)                   | "2.7 – 3.0% … **at every stage of the ladder**" — Stage 0 (DiD) is 4.98%, outside the range. The post shares this looseness at `index.md:1556`; `index.md:1206` is precise ("the excluding-DiD range").                                                          | "at every fitted stage of the ladder" (DiD fits nothing)                              |
| 12 | 2   | LOW      | deck-wide (estimand)                                                     | No slide names the estimand. It is correct and present in notes (slides.qmd:155 explains the truncate-and-renumber trick), but a causal deck should state it on a slide (`index.md:485-489` defines $\tau_t$ for the treated unit at one quarter).                | Add one line to slide 9: "Estimand: the ATT for the UK at one quarter."                |
| 13 | 5   | LOW      | slide 10 — takeaway (slides.qmd:170)                                     | 20-word single sentence on a takeaway card.                                                                                                                                                                                                                     | See rewrite below                                                                     |
| 14 | 5   | LOW      | slide 13 — takeaway (slides.qmd:216)                                     | 24-word sentence; a five-item list read as prose.                                                                                                                                                                                                               | See rewrite below                                                                     |
| 15 | 5   | LOW      | slide 17 — takeaway (slides.qmd:274)                                     | 23-word sentence with a trailing subordinate clause.                                                                                                                                                                                                            | See rewrite below                                                                     |
| 16 | 5   | LOW      | slide 31 — takeaway (slides.qmd:483)                                     | Three stacked sentences (25 words) on one takeaway card, including a rhetorical question.                                                                                                                                                                       | See rewrite below                                                                     |
| 17 | 6   | LOW      | slides.qmd:61, 319, 348, 360, 587                                        | Numeric ranges are punctuated two ways: hyphens ("1995-2020", "87-91%", "2.73-3.04%", "3.83-4.19%") and spaced en dashes ("2.7 – 3.0%", "3.8 – 4.2%").                                                                                                            | Pick one form (unspaced en dash) and apply it to all six ranges                        |
| 18 | 7   | LOW      | slide 5 (slides.qmd:89), slide 40 (slides.qmd:604); borderline slide 3 (slides.qmd:59) | Label titles rather than assertions: "Where we're going", "Materials", and the evocative-but-non-claiming "One line in a crowd". Agenda/resources labels are conventional, hence LOW not MED.                                                                    | Optional: "Five things to take from the next forty minutes" / "Everything here ships with the post" |
| 19 | 8   | LOW      | slide 38 (slides.qmd:583), slide 41 (slides.qmd:618)                     | `background-color="#1a3a8a"` is off the four-colour deck palette (`#d97757`, `#6a9bcc`, `#141413`, `#00d4c8`). It is the site's heading blue and appears in `index.md`'s own mermaid styles (:154), so this is drift, not tampering.                              | Accept as a documented fifth brand colour, or switch to `#141413`                      |

Order: HIGH first, then MED, then LOW. Numbering is consecutive across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #6 — slide 5 "Where we're going"**

Before:
> - **Read** one config dict and one result object — the entire API surface.
> - **Map** each stage of the ladder onto a specific `mlsynth` class.
> - **Identify** the three defaults that change the answer materially.
> - **Compare** the stages on a placebo tournament, and read the ranking sceptically.
> - **Report** a cloud of estimates rather than a point.

After:
> - **Read** one config dict and one result object — the whole API.
> - **Map** each stage of the ladder onto one `mlsynth` class.
> - **Identify** the three defaults that change the answer.
> - **Compare** the stages on a placebo tournament — then report a cloud, not a point.

Why: 5 fragment advances → 4 (the MB/MC cap); "Compare" and "Report" are one move, not two; "materially" and "sceptically" go without loss.

---

**Issue #13 — slide 10 "One result object, seven accessors that work everywhere"**

Before:
> Learn these seven and you can read the output of any effect estimator in the library without opening its documentation.

After:
> Learn these seven and you can read any estimator in the library — no docs needed.

Why: 20 words → 13; "without opening its documentation" → "no docs needed".

---

**Issue #14 — slide 13 "Indistinguishable until 2016, then persistently below"**

Before:
> The synthetic UK is roughly a fifth Hungary, a fifth the United States, a fifth Japan, a sixth Canada and an eighth Norway.

After:
> The synthetic UK: a fifth Hungary, a fifth the US, a fifth Japan — plus Canada and Norway.

Why: 24 words → 17; the repeated "a fifth" carries the shape, so the last two fractions can move to the speaker notes.

---

**Issue #15 — slide 17 "Flat before, negative after"**

Before:
> Pre-treatment effects average $+0.0021$, post-treatment $-0.0281$ — a falsification test the single ATT number cannot give you, for the cost of one extra line.

After:
> Before: $+0.0021$. After: $-0.0281$. A falsification test for one extra line of code.

Why: 23 words in one sentence → three short ones; the contrast lands before the caveat instead of after it.

---

**Issue #16 — slide 31 "A synthetic control estimate carries its solver's fingerprint"**

Before:
> Three languages, two camps — split by optimiser, not by author. Replicate a published number and land 0.02 away? Suspect the optimiser before the data.

After:
> Three languages, two camps — split by optimiser, not by author. Land 0.02 away? Suspect the solver first.

Why: 25 words and three sentences → 18 and two; "Replicate a published number and" is already implied by the slide's figure.

---

## HIGH-issue rewrites

**Issue #1 — Dimension 4 (title↔body) — slide 24 (slides.qmd:372)**

Before:
> ## Three defaults each move the answer more than the ladder does {.smaller}

After:
> ## Two of these three defaults outrun the whole ladder {.smaller}

The takeaway on the same slide (slides.qmd:381) already states the surviving claim correctly and should stay verbatim:
> [You can pick the wrong default and land further from the truth than if you had picked the wrong estimator.]{.takeaway .fragment}

Why: `index.md:1542` — "`set_f` and the covariate method each clear it on their own while `zeta` stays just inside". The table on the slide already proves the corrected title (0.47 pp and 1.76 pp vs the ladder's 0.31 pp; `zeta` at 0.13 pp). The current title is the one claim on the slide that its own body refutes — and slide 25's takeaway compounds it by correctly comparing `zeta`'s 0.13 pp to the SC/DSC/ASCM sub-spread (0.05 pp) rather than to the ladder.

---

**Issue #2 — Dimension 1 (source fidelity) — slide 19 (slides.qmd:319)**

Before:
> [Hungary, the United States, Japan, Canada and Norway carry 87-91% of the counterfactual under every method. Only ASCM ever goes negative.]{.takeaway .fragment}

After:
> [Five countries carry 83-92% of the counterfactual under every method. Only ASCM ever goes negative.]{.takeaway .fragment}

Why: `donor_weights_by_method.csv` — Hungary + United States + Japan + Canada + Norway sum to 0.908 (SC), 0.917 (DSC), 0.917 (SDID), **0.828** (MASC), **0.924** (ASCM). MASC's matching component pulls its share below 87% and ASCM's ridge pushes it above 91%, so the stated band excludes two of the five methods it claims to cover. The five countries are already named in the slide's figure caption, so the takeaway need not repeat them.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                              | Value on slide                     | Source location                                          | Match |
|----------------------------------------------------------|------------------------------------|----------------------------------------------------------|-------|
| Title strip — covariate spread                            | 1.76 pp                            | index.md:1364, :1542                                     | ✓     |
| Title strip — ladder spread                               | 0.31 pp                            | index.md:1542                                            | ✓     |
| Title strip — estimator count                             | 92                                 | index.md:355                                             | ✓     |
| s2 · referendum date                                      | 23 June 2016                       | index.md:107                                             | ✓     |
| s2 · leave share                                          | **51.9%**                          | *absent from index.md and analysis.py*                   | ✗     |
| s3 · figure                                               | ../..._01_gdp_paths.png            | index.md:450 (same figure)                               | ✓     |
| s3 · panel dimensions                                     | 24 / 23 / 86 / 2016Q3              | index.md:408                                             | ✓     |
| s4 · estimators behind the door                           | 92, "eighty-six more"              | index.md:355 (92 − 6 stages)                             | ✓     |
| s4 · version warning                                      | `__version__` = 1.0.0              | index.md:324, :354                                       | ✓     |
| s7 · weighted two-way regression                          | $(\hat\tau,\hat\mu,\hat\alpha,\hat\beta)=\arg\min\dots$ | index.md:625                        | ✓     |
| s8 · ladder table (6 rows: ω / λ / call)                   | all cells                          | index.md:653-660                                         | ✓     |
| s9 · `cfg` helper code                                    | 5 lines                            | index.md:473-476, :498                                   | ✓     |
| s10 · accessor table                                      | 6 of 7 rows                        | index.md:532-540                                         | ✓     |
| s10 · `.weight_vector` gloss                              | "dense array over the donor pool"  | index.md:539 ("of `donor_weights.values()`", len 9)      | ✗     |
| s11 · DiD estimate                                        | 4.98%                              | index.md:681                                             | ✓     |
| s11 · uniform weight                                      | $1/23 = 0.0435$                    | index.md:683 (0.043478)                                  | ✓     |
| s11 · DiD vs SC pre-RMSE                                  | 0.0217 vs 0.0056                   | index.md:687                                             | ✓     |
| s11 · notes — Forward DiD                                 | 4 donors, 0.0088, 2.42%            | index.md:698-702                                         | ✓     |
| s12 · SC simplex equation                                 | $\hat\omega=\arg\min\dots$         | index.md:708                                             | ✓     |
| s12 · SC estimate / nonzero weights / $R^2$               | 3.04% / 9 of 23 / 0.998            | index.md:728, :731, :730, :742                           | ✓     |
| s12 · notes — dropping the US                             | 3.04 → 3.06                        | index.md:1503                                            | ✓     |
| s13 · figure + donor shares                               | ..._04_sc_fit_gap.png; fifth/fifth/fifth/sixth/eighth | index.md:814, :742                    | ✓     |
| s13 · notes — 2018 / 2019 shortfall                       | 3.04% / 4.17%                      | index.md:728                                             | ✓     |
| s14 · DSC estimate / intercept                            | 2.99% / $+0.0024$                  | index.md:833, :834                                       | ✓     |
| s14 · notes — 17 s vs 0.01 s, ~1,700x, recommends SC      | as stated                          | index.md:903, :890                                       | ✓     |
| s15 · SDID bias-adjustment equation                       | $\hat\tau_t = \dots$               | index.md:1020                                            | ✓     |
| s15 · SDID estimate                                       | 2.80%                              | index.md:921                                             | ✓     |
| s15 · notes — SE / p-value                                | 0.0264 / 0.20                      | index.md:922-923                                         | ✓     |
| s16 · figure + peak time weight                           | ..._06_...png; 0.958 on 2016Q2     | index.md:980, :977                                       | ✓     |
| s16 · DiD uniform time weight                             | $1/86 \approx 0.012$               | index.md:982 (0.0116)                                    | ✓     |
| s16 · notes — 95.85 / 3.9 / 0.3%                          | as stated                          | index.md:975-977, :982                                   | ✓     |
| s17 · figure + event-study averages                       | ..._07_...png; $+0.0021$ / $-0.0281$ | index.md:1004, :1000-1001, :1006                       | ✓     |
| s18 · MASC equation / $m$ / $\phi$ / estimate             | eq; 10; 0.158; 2.73%               | index.md:1071, :1087, :1090, :1086                       | ✓     |
| s18 · ASCM negatives / estimate                           | 8 negative, $-0.009$; 3.04%        | index.md:1162, :1161                                     | ✓     |
| s19 · figure                                              | ..._09_donor_weights.png           | index.md:1208                                            | ✓     |
| s19 · five-country share                                  | **87-91%**                         | donor_weights_by_method.csv → 82.8-92.4%; index.md:1210 gives no % | ✗ |
| s19 · only ASCM goes negative                             | as stated                          | index.md:1210                                            | ✓     |
| s19 · notes — MASC uniform spread                         | 0.0158 across **7** donors         | donor_weights_by_method.csv → 6 donors                   | ✗     |
| s20 · figure                                              | ..._10_all_counterfactuals.png     | index.md:1212                                            | ✓     |
| s21 · ladder table (18 numbers + published column)        | all cells                          | index.md:1195-1201                                       | ✓     |
| s21 · notes — 2.9887 rounding boundary                    | as stated                          | index.md:1204, :855                                      | ✓     |
| s22 · figure + ranges                                     | ..._11_att_dotplot.png; 2.73-3.04 / 3.83-4.19 / 2.4% | index.md:1214, :1206                    | ✓     |
| s22 · notes — SDID flavours within 0.03 pp                | as stated                          | index.md:1052                                            | ✓     |
| s24 · defaults table — `zeta`                             | 2.67 / 2.80 / 0.13 pp              | index.md:937-941                                         | ✓     |
| s24 · defaults table — `set_f`                            | 3.19 / 2.73 / 0.47 pp              | index.md:1107-1112                                       | ✓     |
| s24 · defaults table — covariate method                   | 3.61 / 1.85 / 1.76 pp              | index.md:1359-1364                                       | ✓     |
| s24 · defaults table — ladder row                         | 2.73 / 3.04 / 0.31 pp              | index.md:1206, :1542                                     | ✓     |
| s24 · **title claim** ("each … more than the ladder")     | all three defaults                 | index.md:1542 (only two of three)                        | ✗     |
| s25 · zeta code comments / cross-language defaults        | 2.67% / 2.80%; R, Stata            | index.md:937-938, :943                                   | ✓     |
| s25 · notes — `1e-6` sentinel, `sdid.ado`                 | as stated                          | index.md:1250                                            | ✓     |
| s26 · figure + set_f contrast                             | ..._08_masc_cv.png; 2.73 / 43 / 3.19 / 0.47 pp | index.md:1141, :1107-1112                    | ✓     |
| s26 · notes — estimate wanders 2.73-3.23                  | as stated                          | index.md:1143                                            | ✓     |
| s27 · covariate-method table (3 rows)                     | all cells; "pass a bare list and it raises" | index.md:1338-1342, :1336                        | ✓     |
| s27 · notes — 0.998 → 0.636                               | as stated                          | index.md:1366                                            | ✓     |
| s28 · figure + three covariate estimates                  | ..._13_...png; 3.61 / 1.85 / 3.11 vs 2.80 | index.md:1396, :1359-1361                     | ✓     |
| s28 · notes — 1.32 → 1.11, v_agreement 0.055-0.083        | as stated                          | index.md:1390-1400                                       | ✓     |
| s29 · rounding-trap code                                  | $-0.03$ vs $-0.0298873295228968$   | index.md:853-854                                         | ✓     |
| s29 · notes — rmse_pre 0.006; variants 3.039/2.989/3.041/3.021 | as stated                     | index.md:856, :891-894                                   | ✓     |
| s30 · naming-hazard table (5 rows)                        | all cells                          | index.md:611-617                                         | ✓     |
| s31 · figure + solver values                              | ..._03_...png; 3.039% / 3.060%     | index.md:791, :784-788                                   | ✓     |
| s31 · notes — condition number; Stata 2.79 → 2.80         | $7.5\times10^5$; as stated         | index.md:1240, :1244                                     | ✓     |
| s33 · placebo loop code + 20 dates + 13 s                 | as stated                          | index.md:1277-1293, :1274                                | ✓     |
| s33 · notes — 140 fits                                    | 20 x 7                             | index.md:1293 (derived, consistent)                      | ✓     |
| s33 · notes — "around forty minutes"                      | 40 min                             | index.md:903 (17 s x 40 ≈ 11 min); :1065 ("two-hour loop") | ✗   |
| s34 · figure + RMSE contrast                              | ..._12_...png; 0.0066 vs 0.0086, 23% | index.md:1308, :1310, :1559                            | ✓     |
| s34 · notes — MASC 0.0080; stable ordering                | as stated                          | index.md:1304, :1330                                     | ✓     |
| s35 · RMSE table (21 cells, two `.key`)                   | all cells                          | index.md:1318-1326                                       | ✓     |
| s35 · notes — reproduces to within 0.0003                 | as stated                          | index.md:1328                                            | ✓     |
| s36 · figure + RMSPE ratio / rank / p                     | ..._14_...png; 5.85 / 1 of 24 / 0.042 | index.md:1475, :1467, :1477                           | ✓     |
| s36 · notes — Belgium 3.52, Finland 3.29                  | as stated                          | index.md:1468-1469                                       | ✓     |
| s37 · p-value floor with 24 units                         | 0.042                              | index.md:1477                                            | ✓     |
| s37 · "five inference routes span p = 0.006 to 0.042"     | five                               | index.md:1433 (four report p; scpi none)                 | ✗     |
| s37 · notes — `jackknife_plus` excluded                   | as stated                          | index.md:1430, :1433                                     | ✓     |
| s38 · headline ranges                                     | 2.7-3.0% / 3.8-4.2% / 2.4%         | index.md:1536, :1556                                     | ✓     |
| s39 · four takeaways                                      | ladder / defaults / commit / optimiser | index.md:1552, :1548, :1254                          | ✓     |
| s40 · pinned commit + timings                             | `15f168b`; 30 s / 20 s / 30 s      | index.md:331, :1565                                      | ✓     |

Every ✗ is a HIGH or MED issue listed above (Issues #1, #2, #3, #4, #5, #9, #10).

---

## Title sequence (assertion-title test)

Read in order, the slide titles should form the talk's abstract:

1. One Treated Unit *(divider, Act I)*
2. There is only one United Kingdom, and it voted to leave
3. One line in a crowd
4. Ninety-two estimators, one configuration dictionary
5. Where we're going
6. One Config, Six Stages *(divider, Act II)*
7. Every stage is the same regression, weighted differently
8. The ladder is two dials: who counts, and when
9. Five fields, one long panel — and one config dict
10. One result object, seven accessors that work everywhere
11. Stage 0 — DiD weights every country and every quarter the same
12. Stage 1 — Synthetic control fits who counts
13. Indistinguishable until 2016, then persistently below
14. Stage 2 — Demeaned SC allows a level gap
15. Stage 3 — SDID also fits which quarters count
16. And the time weights collapse onto one quarter
17. Flat before, negative after
18. Stages 4 and 5 — buy the trade-off, or drop the constraint
19. Five estimators, essentially the same five countries
20. The paths agree until the referendum, then fan apart
21. The whole ladder, side by side
22. Every stage exceeds the published 2.4%
23. The Defaults *(divider, Act III)*
24. Three defaults each move the answer more than the ladder does
25. `zeta` penalises the unit weights unless you pass a literal zero
26. `set_f` decides which folds MASC learns from
27. "Control for a covariate" means three different things
28. And they disagree by 1.76 percentage points
29. One estimator silently rounds the number you are most likely to quote
30. A name is a mnemonic, not a definition
31. A synthetic control estimate carries its solver's fingerprint
32. Which Stage? *(divider, Act IV)*
33. Score the stages on a task whose true answer is zero
34. The time weights earn their keep
35. But the published ranking was graded on a different exam
36. The UK's gap is deeper than any placebo's
37. The strongest objection — and the answer
38. What the referendum cost
39. What to take away
40. Materials
41. Fit the ladder, not a stage — and publish the cloud, not the point. *(closing divider)*

**Verdict:** coherent abstract — the sequence reads as a complete argument (one counterfactual is missing → six ways to build it → they agree → but the defaults do not → so publish the cloud), and the "And…" continuation titles at 16, 20 and 28 deliberately hand off from the slide before. Two label titles at 5 and 40 (Issue #18); title 24 is the one claim the sequence gets wrong (Issue #1). No duplicated titles; each divider names its act; the closing slide is a single declarative sentence that matches the thesis the deck argued (not "Questions?" / "Thank you").

---

## Positive highlights

- **Slide 7 (slides.qmd:107-115)** compresses the post's §7 into one frame: the weighted two-way regression, a 13-word `.comment` gloss ("but some countries and some quarters count more"), and the takeaway "The stages differ only in how $\omega$ and $\lambda$ are chosen." After that slide the whole six-stage ladder is legible — exactly the intuition-before-formalism movement `rhetoric-of-decks.md` prescribes.
- **Slide 35 "But the published ranking was graded on a different exam" (slides.qmd:533-545)** is a model assertion title: it names the artefact rather than labelling the table. The two mis-graded published cells are `[0.0134]{.key}`-highlighted *and* labelled in the takeaway ("Two rows were graded four quarters ahead"), so colour is never the sole signal — the Dimension 9 rule most decks miss.
- **Slide 37 (slides.qmd:565-575)** is a genuine Devil's-Advocate slide, not a strawman: it concedes the p-value floor and that SDID's own interval contains zero, answers with the five inference routes, then re-concedes ("the floor is real, and no estimator changes it") before landing on "which is why the deliverable is the cluster, not the point."
- **Speaker notes carry the prose everywhere** — 36 of 36 content slides have a `::: {.notes}` block, and every package gotcha (the cohort-object path for the time weights at :267, MASC's `summary_stats` location at :312, the `TSSC` rounding trap at :458) lives there instead of on the slide. Notes also stay plain-text: "7.5 times ten to the fifth" at :486 rather than LaTeX the speaker window cannot render.
- **Technical hygiene is flawless.** All 8 code fences are illustrative `{.python}` (zero executable `{python}`), all three `code-line-numbers` ranges point at lines that exist, every ported equation dropped its Goldmark escaping correctly for Pandoc (`\sum_{i,t}` not `\sum\_{i,t}`), and there is not one Unicode math character on any slide — the only non-ASCII outside the notes is the diacritics in "Müller" and "Sedláček".

---

## Priority action items

1. **[HIGH]** Retitle slide 24 (slides.qmd:372) to "Two of these three defaults outrun the whole ladder". Its own table shows `zeta` at 0.13 pp against the ladder's 0.31 pp, and `index.md:1542` says so explicitly. This is the deck's thesis slide, so the overclaim is its most damaging line.
2. **[HIGH]** Correct or drop the 87-91% donor share on slide 19 (slides.qmd:319). From `donor_weights_by_method.csv` the true range is 82.8% (MASC) to 92.4% (ASCM); the post states no percentage at all.
3. **[MED]** Fix the remaining fidelity slips in one pass: the unsourced 51.9% (slides.qmd:45), `.weight_vector`'s "over the donor pool" (slides.qmd:167), "five inference routes span p = 0.006 to 0.042" (slides.qmd:571), and the two speaker-note slips at :324 ("seven" → six donors) and :516 ("forty minutes").
4. **[MED]** Cut slide 5 to four incremental bullets (slides.qmd:91-97) and give slide 15 a `[…]{.takeaway .fragment}` card — e.g. `[DSC treats all 86 pre-quarters alike. SDID does not.]{.takeaway .fragment}` — so the deck's flagship stage ends the way every other stage does.
5. **[MED]** Declare the audience in the front matter and trim toward the band. At 41 slides the deck exceeds even the seminar ceiling of 30; slides 30 and 40, and merging 13 into 12, are the least load-bearing cuts.

---

## Screenshots (HIGH-severity visual issues only)

None found. (Browser pass skipped — `--no-browser`; no runtime visual issue could be detected.)

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_sc_dsc_sdid

To re-check just the dimension you fixed:

    /project:review-slides python_sc_dsc_sdid focus: fidelity

---

## Audit metadata

- Node version: v25.9.0
- Playwright: disabled (--no-browser)
- smoke-test.js: **PASS** — 15 of 15 checks (index.html, slides_files/, slides.qmd, reveal structure, title key-result strip with 3 stats, chalkboard, menu, notes, MathJax engine + 25 math spans using `\(…\)` delimiters, 6 brand dividers, 46 `<section>` tags, 12/12 figure paths resolve, no leaked `{{…}}`)
- Branding diff: **clean** — `site-brand.scss` and `title-slide.html` are both byte-identical to `.claude/skills/write-slides/references/templates/`. The key-result strip is numeric (1.76 pp / 0.31 pp / 92) and correctly uses **no** `kr-arrow` pipeline, so the approved `$sep$` exception neither applies nor is needed.
- Design/branding (browser pass): `[~]` not run — background / accent-rule / byline / pipeline unverified at runtime. Static substitutes: `$body-bg` inherits from the byte-identical `site-brand.scss`; front matter keeps `center: true`, `chalkboard: true`, `menu: true`, `overview: true`; takeaway-cards counted statically at **30** across 31 substantive content slides.
- Deliverables: `index.html` 91,103 bytes (> 30 KB); `slides_files/` present; `index.md:16-20` links the deck as `url: slides/index.html` with no trailing slash. The `icon: chalkboard-teacher` (rather than the skill's `person-chalkboard`) matches this site's convention — 63 of 67 decks use it, and it is the icon the Wowchemy v5 Font Awesome 5 build actually ships — so it is not a finding.
- Tooling notes: static audit only. Read `slides.qmd` (619 lines) and `index.md` (1,605 lines) in full, plus `donor_weights_by_method.csv` as the authority for the slide-19 donor shares; `analysis.py` was consulted for provenance only and never executed.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
