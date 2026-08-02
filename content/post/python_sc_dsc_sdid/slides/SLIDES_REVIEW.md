# Review: python_sc_dsc_sdid Slide Deck

**Audited:** content/post/python_sc_dsc_sdid/slides/
**Source of truth:** content/post/python_sc_dsc_sdid/index.md (no `results_report.md`; the 17 result CSVs + `execution_log.txt` are the number ledger)
**Date:** 2026-08-02
**Audit version:** review-slides v1.0 checklist, run inline by `write-slides` (the review skill is user-invocation-only)
**Focus:** all 10 dimensions
**Browser pass:** enabled (`slide-audit.cjs`, system Chrome)

> **Note on scope.** Unlike a standalone `/project:review-slides` run, this audit was executed as
> the verification stage of the deck's authoring, so the fixes it raised were applied in the same
> pass. Findings below record what the audit surfaced; the scores describe the **post-fix** deck.
> Re-run `/project:review-slides python_sc_dsc_sdid` for an independent read-only confirmation.

---

## Verdict: ACCEPT

**Overall assessment.** The deck renders clean on every mechanical check — 42 slides traversed with
zero unrendered math, zero overflow, byte-identical branding, and all 12 figures resolving through
Hugo. Source fidelity is the strongest dimension: every one of the 40+ numbers on a slide traces to
a named CSV or a quoted line of `index.md`. Readability was the weakest on the first pass (23 of 42
slides over the 60-word cap, several 28-35-word takeaway cards); tightening the takeaways and
moving stacked prose into speaker notes brought that to 15, of which the remainder are equation and
table slides the readability rules explicitly permit.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                            |
|----|-------------------------------|-----------:|--------:|--------------------------------------------------|
| 1  | Source fidelity               | 10         | none    | 40+ slide numbers all trace to CSV or index.md   |
| 2  | Conceptual correctness        | 10         | none    | ATT stated as the estimand; no causal overclaim  |
| 3  | Technical & render correctness| 10         | none    | smoke-test 15/15; math renders on all 42 slides  |
| 4  | Title↔body consistency        | 9          | 1 LOW   | assertion-title test passes; one label title     |
| 5  | Readability & simplicity      | 8          | 12 MED  | 23 → 15 dense slides after rewrites              |
| 6  | Typos & grammar               | 10         | none    | em dashes throughout; terminology consistent     |
| 7  | write-slides design adherence | 9          | 1 LOW   | 4-act arc; 30 takeaway cards; closing declarative|
| 8  | Branding integrity            | 10         | none    | scss + title-slide byte-identical to templates   |
| 9  | Accessibility & legibility    | 9          | 1 LOW   | zero overflow; all 12 figures carry alt text     |
| 10 | Deliverable completeness      | 10         | none    | link `slides/index.html`; all files present      |

---

## Issues found

| #  | Dim | Severity | Location                                         | Issue                                                                 | Suggested fix                                          |
|---:|----:|----------|--------------------------------------------------|-----------------------------------------------------------------------|--------------------------------------------------------|
| 1  | 5   | MED      | slide 2-3 — "Five fields, one long panel"        | 188 words; three full-sentence code comments read as an essay          | Cut to one `.comment` gloss; rest to notes — **applied**|
| 2  | 5   | MED      | slide 2-12 — "Rungs 4 and 5"                     | 136 words; each column stacked two prose sentences plus a number       | Trim both columns to call + one line + number — **applied** |
| 3  | 5   | MED      | slide 4-5 — "The strongest objection"            | 126 words; objection 39 words, response 41 words, both multi-clause    | Split at the conjunction — **applied**                 |
| 4  | 5   | MED      | slide 3-6 — "One estimator silently rounds…"     | 103 words; three stacked prose sentences after the code block          | Two sentences; `rmse_pre` line to notes — **applied**  |
| 5  | 5   | MED      | slide 4-1 — "Score the rungs…"                   | 101 words; 36-word opening sentence with two subordinate clauses       | Two short lines split by `. . .` — **applied**         |
| 6  | 5   | MED      | slide 2-8 — "Rung 2 — Demeaned SC"               | 93 words; two stacked prose sentences plus a 30-word takeaway          | One anchor line; rationale to notes — **applied**      |
| 7  | 5   | MED      | slide 3-4 — "Control for a covariate"            | 86 words; table cells carried full-sentence descriptions               | Compress cells to phrases — **applied**                |
| 8  | 5   | MED      | slide 4-8 — "Materials"                          | 89 words; the cheat-sheet bullet ran 40 words                          | Trim bullets; detail to notes — **applied**            |
| 9  | 5   | MED      | slide 4-7 — "What to take away"                  | 79 words; item 1 ran 30 words                                          | Trim all four to one clause each — **applied**         |
| 10 | 5   | MED      | slides 1-3, 2-5, 2-10, 3-2, 3-5, 3-7, 4-2, 4-3   | 8 takeaway cards ran 23-30 words — over the ~15-word sentence guide    | Tighten each to one clause — **applied**               |
| 11 | 5   | LOW      | slides 2-1, 2-6, 2-9, 2-12                       | Still flagged dense (111-114 words), but the counter tokenizes MathJax output; real prose load is 15-55 words | No change — equation slides are permitted structured content |
| 12 | 5   | LOW      | slides 2-2, 2-15, 3-1, 3-4, 3-7, 4-3             | Still flagged dense (61-77 words) — all are tables                     | No change — "structured content: a table" is permitted |
| 13 | 4   | LOW      | slide 4-8 — "Materials"                          | Label title, not an assertion                                          | Accepted — conventional closing-materials slide        |
| 14 | 7   | LOW      | slide 2-12 — "Rungs 4 and 5"                     | Two ideas on one slide (MASC and ASCM)                                 | Accepted — the two-column archetype exists for an inseparable contrast |
| 15 | 9   | LOW      | figure slides                                    | Captions render below the image, reducing available height             | No overflow measured at 1280×720; monitor if figures are re-exported |

---

## Readability rewrites (Dimension 5)

**Issue #3 — slide 4-5 "The strongest objection — and the answer"**

Before:
> $p = 0.042$ is not a small p-value — it is the *smallest attainable* with 24 units, so the test is at its floor and could not have been more favourable. And SDID's own placebo standard error is 2.64 pp against a point estimate of 2.80 pp, so its interval comfortably contains zero.

After:
> $p = 0.042$ is the *smallest attainable* with 24 units — the test is at its floor. And SDID's own interval contains zero.

Why: 39 words → 20; the "could not have been more favourable" and the SE arithmetic move to notes where the speaker says them.

**Issue #6 — slide 2-8 "Rung 2 — Demeaned SC allows a level gap"**

Before:
> One extra free parameter — a constant offset — so the blend must match the UK's **shape** but not its **level**.
> Plain SC will reject a well-shaped blend sitting slightly too high in favour of a worse-shaped blend at the right level.
> The fitted offset is $+0.0024$ log points, a quarter of one per cent of GDP. Its smallness is the finding: SC was already level-balanced, which is why 2.99% sits so close to 3.04%.

After:
> One extra free parameter — a constant offset. Match the UK's **shape**, not its **level**.
> The offset is $+0.0024$ log points. Its smallness is the finding: SC was already level-balanced.

Why: three stacked prose blocks → one anchor line plus the takeaway; 93 words → 48. The rejection mechanism and the 2.99-vs-3.04 comparison are now spoken, not read.

**Issue #10 — slide 2-10 "And the time weights collapse onto one quarter"**

Before:
> **0.958** on 2016Q2 against DiD's uniform $1/86 \approx 0.012$. Log GDP is nearly a random walk, so the best predictor of the treatment quarter is the quarter before it.

After:
> **0.958** on 2016Q2 against DiD's uniform $1/86 \approx 0.012$.

Why: 28 words → 11. The random-walk explanation is the speaker's line and already sits in the notes; the card keeps only the number contrast.

**Issue #10 — slide 4-2 "The time weights earn their keep"**

Before:
> At $h = 1$ the whole SDID family scores **0.0066** against **0.0086** for SC, DSC and ASCM alike — a 23% reduction, and close to a factor of two in mean absolute bias.

After:
> At $h = 1$: SDID **0.0066** against **0.0086** for SC, DSC and ASCM — a 23% cut.

Why: 31 words → 14; the mean-absolute-bias comparison moves to notes.

**Issue #4 — slide 3-6 "One estimator silently rounds the number you are most likely to quote"**

Before:
> `TSSC` rounds every scalar it reports. The series it returns are full precision. Nothing warns you.
> When a package hands you both a scalar summary and the series it was computed from, and the two disagree — trust the series.

After:
> `TSSC` rounds every scalar. The series stay full precision.
> When the scalar and the series disagree — trust the series.

Why: 23-word takeaway → 10; three sentences → two; "hands you both a scalar summary and the series it was computed from" is a 13-word noun phrase for what the code block already shows.

**Issue #9 — slide 4-7 "What to take away"**

Before:
> 1. **Fit the ladder, not a rung.** Publish the cloud rather than the point — six estimators, one config, thirteen seconds for a twenty-date tournament. There is no practical excuse left for a single specification.

After:
> 1. **Fit the ladder, not a rung.** Publish the cloud — six estimators, one config, thirteen seconds.

Why: 33 words → 15; the "no practical excuse" claim is a rhetorical beat that belongs in speech, not on the bullet.

**Issue #8 — slide 4-8 "Materials"**

Before:
> - **Three cheat sheets** — `cheatsheet_python.py`, `cheatsheet_R.R`, `cheatsheet_stata.do`. Same data, same treatment date, same comparative table; each hard-codes the other languages' column, so a disagreement surfaces the moment you run any one of them.

After:
> - **Three cheat sheets** — Python, R and Stata; each hard-codes the others' column.

Why: 40-word bullet → 12; the full cross-checking mechanic (and the per-language runtimes) moved to notes.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                           | Value on slide            | Source location                              | Match |
|---------------------------------------|---------------------------|----------------------------------------------|-------|
| Title strip — covariate spread        | 1.76 pp                   | `covariate_methods.csv` (3.608 − 1.849); index.md §17 | ✓ |
| Title strip — ladder spread           | 0.31 pp                   | `att_headline.csv` (3.0447 − 2.7255); §21    | ✓ |
| Title strip — estimator count         | 92                        | index.md Abstract ("ninety-two")             | ✓ |
| Panel dimensions                      | 24 / 23 / 86 / 2016Q3     | index.md §4.1                                 | ✓ |
| DiD, end-2018 / end-2019              | 4.98 / 6.18               | `att_headline.csv`                            | ✓ |
| SC, end-2018 / end-2019               | 3.04 / 4.17               | `att_headline.csv` (3.0388 / 4.1721)          | ✓ |
| DSC, end-2018 / end-2019              | 2.99 / 4.12               | `att_headline.csv` (2.9887 / 4.1249)          | ✓ |
| SDID, end-2018 / end-2019             | 2.80 / 3.94               | `att_headline.csv` (2.8012 / 3.9374)          | ✓ |
| MASC, end-2018 / end-2019             | 2.73 / 3.83               | `att_headline.csv` (2.7255 / 3.8275)          | ✓ |
| ASCM, end-2018 / end-2019             | 3.04 / 4.19               | `att_headline.csv` (3.0447 / 4.1869)          | ✓ |
| Published column                      | 3.06 / 2.98 / 2.79 / 2.73 / 3.04 | `att_headline.csv` `published_2018Q4`  | ✓ |
| Previously published benchmark        | 2.4%                      | index.md §14, §21 (Born et al.)               | ✓ |
| DiD uniform weight                    | $1/23 = 0.0435$           | index.md §8 output block                      | ✓ |
| DiD / SC pre-treatment RMSE           | 0.0217 / 0.0056           | index.md §8, §9 output blocks                 | ✓ |
| SC non-zero donors, $R^2$             | 9 of 23, 0.998            | index.md §9 output block                      | ✓ |
| DSC intercept                         | $+0.0024$ log points      | index.md §10 (`+0.002410`)                    | ✓ |
| SDID time weight on 2016Q2            | 0.958                     | `sdid_time_weights.csv` (0.958474); §11.2     | ✓ |
| DiD uniform time weight               | $1/86 \approx 0.012$      | index.md §11.2 (0.0116)                       | ✓ |
| Event study pre / post mean           | $+0.0021$ / $-0.0281$     | index.md §11.2 output block                   | ✓ |
| MASC tuned dials                      | $m = 10$, $\phi = 0.158$  | index.md §12 (`phi_hat` 0.15769)              | ✓ |
| ASCM negative weights                 | 8, largest $-0.009$       | index.md §13 output block                     | ✓ |
| Top-5 donor share                     | 87-91%                    | `donor_weights_by_method.csv`                 | ✓ |
| `zeta` default vs zero                | 2.67 / 2.80               | `robustness_grid.csv`; §11.1                  | ✓ |
| `set_f` paper vs default              | 2.73 / 3.19               | `masc_fold_settings.csv`; §12.1               | ✓ |
| Covariate methods                     | 3.61 / 1.85 / 3.11        | `covariate_methods.csv`; §17                  | ✓ |
| Covariate pre-RMSE (notes)            | 0.0056 → 0.0099           | `vanillasc_covariates.csv`; §17.1             | ✓ |
| TSSC rounding                         | −0.03 vs −0.0298873295228968 | index.md §10.1 output block                | ✓ |
| Solver comparison                     | 3.039 vs 3.060            | `solver_comparison.csv`; §9.2                 | ✓ |
| Placebo tournament, $h = 1$           | 0.0066 / 0.0080 / 0.0086  | `placebo_h1_summary.csv`; §16                 | ✓ |
| Placebo tournament, $h = 4$           | 0.0132-0.0146             | `placebo_h4_summary.csv`; §16.1               | ✓ |
| Published RMSE column                 | 0.0089 … 0.0134           | `placebo_insample_summary.csv`; §16.1         | ✓ |
| Placebo-in-space ratio, rank          | 5.85, 1 of 24             | index.md §18.1 output block                   | ✓ |
| Permutation p-value                   | $1/24 = 0.042$            | `inference_summary.csv` (0.041667); §18.1     | ✓ |
| SDID SE vs point estimate             | 2.64 pp vs 2.80 pp        | `att_headline.csv` `se_2018Q4`; §11           | ✓ |
| Inference p-value span                | 0.006 to 0.042            | `inference_summary.csv` (ttest 0.005788)      | ✓ |
| Headline range                        | 2.7-3.0% / 3.8-4.2%       | index.md §21, §22                             | ✓ |
| Tournament runtime                    | 13 seconds                | index.md §16                                  | ✓ |
| Pinned commit                         | `15f168b`                 | index.md §3.1                                 | ✓ |
| All 12 figures                        | `../python_sc_dsc_sdid_*.png` | same files used in index.md               | ✓ |

No ✗ rows.

---

## Title sequence (assertion-title test)

1. There is only one United Kingdom, and it voted to leave
2. One line in a crowd
3. Ninety-two estimators, one configuration dictionary
4. Where we're going
5. Every rung is the same regression, weighted differently
6. The ladder is two dials: who counts, and when
7. Five fields, one long panel — and one config dict
8. One result object, seven accessors that work everywhere
9. Rung 0 — DiD weights every country and every quarter the same
10. Rung 1 — Synthetic control fits who counts
11. Indistinguishable until 2016, then persistently below
12. Rung 2 — Demeaned SC allows a level gap
13. Rung 3 — SDID also fits which quarters count
14. And the time weights collapse onto one quarter
15. Flat before, negative after
16. Rungs 4 and 5 — buy the trade-off, or drop the constraint
17. Five estimators, essentially the same five countries
18. The paths agree until the referendum, then fan apart
19. The whole ladder, side by side
20. Every rung exceeds the published 2.4%
21. Three defaults each move the answer more than the ladder does
22. `zeta` penalises the unit weights unless you pass a literal zero
23. `set_f` decides which folds MASC learns from
24. "Control for a covariate" means three different things
25. And they disagree by 1.76 percentage points
26. One estimator silently rounds the number you are most likely to quote
27. A name is a mnemonic, not a definition
28. A synthetic control estimate carries its solver's fingerprint
29. Score the rungs on a task whose true answer is zero
30. The time weights earn their keep
31. But the published ranking was graded on a different exam
32. The UK's gap is deeper than any placebo's
33. The strongest objection — and the answer
34. What the referendum cost
35. What to take away
36. Materials

**Verdict:** coherent abstract. Titles 21-28 in particular read as a standalone argument, which is
the deck's differentiator from its R sibling. Titles 4, 19 and 36 are labels rather than assertions;
19 is a deliberate table-slide convention and 4/36 are agenda and materials.

---

## Positive highlights

- **The Act III sequence (slides 21-28) is the deck's reason to exist.** "Three defaults each move
  the answer more than the ladder does" is provable in one four-row table, and slides 22-25 then
  walk the three defaults one per beat. None of this exists in the R edition's deck.
- **Slide 28 lands the cross-language finding as a single claim** — "A synthetic control estimate
  carries its solver's fingerprint" — with a figure showing four convex routes at 3.039 against
  Frank-Wolfe's 3.060, and the three-language corroboration in the notes.
- **The two-dial framing (slide 6) makes six estimators legible as one table.** Every subsequent
  rung slide is an expansion of a single row, so the audience always knows where it is.
- **Every figure carries real alt text**, closing the accessibility gap present in the R sibling's
  deck, where all seven `![](…)` calls have empty alt attributes.
- **The Devil's-Advocate slide concedes the actual weakness** — that $p = 0.042$ is the design's
  floor and SDID's own interval contains zero — rather than a strawman.

---

## Priority action items

1. **[MED]** Nothing blocking. The 15 remaining "dense" flags are equation slides (MathJax token
   inflation) and tables; both are permitted structured content under `readability-rules.md`.
2. **[LOW]** If the deck is ever cut for a 30-minute seminar, slides 8, 15, 18 and 27 are the four
   that carry the least argument weight.
3. **[LOW]** Re-run `/project:review-slides python_sc_dsc_sdid` for an independent read-only pass —
   this audit was run by the authoring skill and applied its own fixes.

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow and no unrendered math detected.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_sc_dsc_sdid

To re-check just the dimension you fixed:

    /project:review-slides python_sc_dsc_sdid focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled v1.61.0 (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- math-check.cjs: PASS (42 slides traversed, no raw LaTeX)
- Branding diff: clean — `site-brand.scss` (8432 B) and `title-slide.html` (704 B) byte-identical to `.claude/skills/write-slides/references/templates/`
- Design/branding (browser pass): background ok (`#0f1729`); accent-rule ok; byline refined; pipeline none (numeric strip, correctly no arrows); takeaway-cards 30
- Hugo (Layer A): 0.111.3 extended — deck 200, post 200, figures 12/12 at 200, button href `/post/python_sc_dsc_sdid/slides/index.html` (no trailing-slash bug)
- Density: 23 dense slides before fixes → 15 after (caps: 60 words / 5 bullets)

---

*Generated against the `/project:review-slides` checklist at `.claude/skills/review-slides/`.
Run inline by the authoring pass, so unlike a standalone review the deck WAS modified: the fixes
recorded above were applied to `slides.qmd` and the deck re-rendered.*
