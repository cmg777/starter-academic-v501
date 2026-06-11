# Review: stata_rd Slide Deck

**Audited:** content/post/stata_rd/slides/
**Source of truth:** content/post/stata_rd/index.md (no results_report.md)
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: MINOR REVISION

**Overall assessment.** A strong, faithful deck: every number, figure, table, and
equation traces cleanly to the source post, math renders correctly (no Goldmark
`\_`-in-subscript breakage — all subscripts are plain `_`), and the assertion
titles read as a coherent abstract. The strongest dimension is source fidelity
(10/10 — all 30+ slide data points verified). The weakest is readability: three
slides stack body prose that already lives verbatim in their speaker notes, so the
on-slide text can be trimmed to a single anchor line. No HIGH issues; the single
fix that promotes this to ACCEPT is moving the duplicated prose on slides
"You can't randomize tutoring…" and "Does machine-picking the bandwidth make this
causal? No." into `::: {.notes}`.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 30+ numbers/5 figures/3 tables trace to source |
| 2  | Conceptual correctness        | 10         | 0       | LATE/continuity/sharp-vs-fuzzy all correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; raw-latex 0 |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test passes; coherent abstract |
| 5  | Readability & simplicity      | 6          | 0H/3M/2L| 3 walls-of-prose; 2 borderline long lines |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; consistent terminology |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc ok; Devil's-Advocate present; closing = 1 sentence |
| 8  | Branding integrity            | 10         | 0       | scss + title diffs clean (byte-identical) |
| 9  | Accessibility & legibility    | 10         | 0       | no real overflow (all slides sh=ch=720); every figure captioned |
| 10 | Deliverable completeness      | 10         | 0       | link `url: slides/index.html` ok; index.html 55 KB; files ok |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | MED      | slide — "You can't randomize tutoring…" (slides.qmd:55) | 31-word, 3-sentence wall of prose; full text already in notes | Keep one anchor line; move the rest to `::: {.notes}` |
| 2  | 5   | MED      | slide — "Does machine-picking the bandwidth make this causal? No." (slides.qmd:295) | 50-word, 4-sentence rebuttal; detail already in notes | Trim to a two-sentence rebuttal; parenthetical to notes |
| 3  | 5   | MED      | slide — "The estimand is the LATE…" (slides.qmd:128) | 26-word, 2-sentence `.comment` gloss under the equation | Keep the continuity sentence; move "local" sentence to notes |
| 4  | 5   | LOW      | slide — "The estimate barely moves…" (slides.qmd:259) | 23-word single sentence (under 25, well-formed) | Optional: split at the em-dash |
| 5  | 5   | LOW      | slide — "Both methods agree…" (slides.qmd:309) | 21-word single sentence | Optional: drop "for a borderline student" |

Order: HIGH first, then MED, then LOW. Numbered consecutively across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "You can't randomize tutoring — so how do you prove it works?" (slides.qmd:55)**

Before:
> The struggling students who got help also started behind. *Compare raw outcomes and you measure the program plus the gap it was meant to close.* How do you separate the two?

After:
> The students who got help also started behind. *Compare raw outcomes and you measure the program plus the gap.*

Why: 31 words / 3 sentences → 21 words / 2 lines. The "How do you separate the two?" question and the "meant to close" clause are spoken, not read — they already sit in the notes.

**Issue #2 — slide "Does machine-picking the bandwidth make this causal? No." (slides.qmd:295)**

Before:
> [Response.]{.rebuttal} Correct — and we never claim they do. The LATE is identified only under **continuity** of potential outcomes at 70 (no manipulation, no other policy switching on at the same score). rdrobust just estimates the discontinuity flexibly; the McCrary test and placebos *defend* the assumption, they don't replace it.

After:
> [Response.]{.rebuttal} Correct — and we never claim they do. Identification rests on **continuity** at 70; `rdrobust` just estimates the jump. The density and placebo tests *defend* that assumption — they don't replace it.

Why: 50 words / 4 sentences → ~33 words / 3 short lines. The "(no manipulation, no other policy switching on…)" parenthetical is a spoken aside already in the notes.

**Issue #3 — slide "The estimand is the LATE — the jump in the CEF *at* the cutoff" (slides.qmd:128)**

Before:
> Identification rests on **continuity**: absent tutoring, potential outcomes would pass *smoothly* through 70. The estimate is local — it speaks only to students near the threshold.

After:
> Identification rests on **continuity**: absent tutoring, outcomes pass *smoothly* through 70.

Why: 26 words / 2 sentences → 11 words / 1 line. The "local … near the threshold" caveat repeats the notes and is restated on a later slide.

**Issue #4 — slide "The estimate barely moves from BW 5 to 20: −8.20 to −9.16" (slides.qmd:259)**

Before:
> A spread of less than one point across a 4× change in window — the result is not an artifact of bandwidth choice.

After:
> Less than one point across a 4× change in window — not a bandwidth artifact.

Why: 23 → 13 words; tightens the same claim.

**Issue #5 — slide "Both methods agree: rule-based tutoring lifts exit scores 9–11 points" (slides.qmd:309)**

Before:
> 9–11 points is ~13–16% of the mean exit score (66.2) — the difference between passing and failing for a borderline student.

After:
> 9–11 points is ~13–16% of the mean exit score (66.2) — passing vs failing for a borderline student.

Why: 21 → 18 words; "the difference between passing and failing for" → "passing vs failing for".

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                               | Value on slide        | Source location          | Match |
|-------------------------------------------|-----------------------|--------------------------|-------|
| Title key-result: parametric OLS          | +10.80                | index.md:413, 633        | ✓     |
| Title key-result: rdrobust LATE           | −8.58                 | index.md:505, 508        | ✓     |
| Title key-result: density-test p          | 0.58                  | index.md:577             | ✓     |
| N students                                | 1,000                 | index.md:289             | ✓     |
| Treated count / share                     | 241 (24.1%)           | index.md:292, 295        | ✓     |
| Entrance range / mean                     | 28.8–99.8, 78.1       | index.md:290, 295        | ✓     |
| Exit range / mean                         | 42.8–84.5, 66.2       | index.md:291, 295        | ✓     |
| Compliance cross-tab                      | 759 / 0 / 0 / 241     | index.md:326–331         | ✓     |
| OLS τ, SE, CI, p                          | 10.80, 0.81, 9.22–12.38, p<0.001 | index.md:413, 418 | ✓     |
| Models table τ                            | 10.800 / 10.797 / 9.223 | index.md:467–469       | ✓     |
| Models table SE                           | 0.806 / 0.816 / 1.198 | index.md:467–469         | ✓     |
| Models table R²                           | 0.268 / 0.268 / 0.271 | index.md:467–469         | ✓     |
| Interaction term                          | −0.001                | index.md:454, 463        | ✓     |
| rdrobust LATE, CI, p                       | −8.58, −12.14 to −4.54, p<0.001 | index.md:505, 508 | ✓     |
| MSE-optimal bandwidth                     | 9.98 (9.984)          | index.md:498, 508        | ✓     |
| Eff. obs (below/above) / 400 total        | 144 / 256 / 400       | index.md:508             | ✓     |
| Bandwidth table τ                         | −8.202/−8.581/−8.842/−9.157 | index.md:543–547   | ✓     |
| Bandwidth table SE                        | 2.337/1.615/1.312/1.131 | index.md:543–547       | ✓     |
| Density (McCrary) p                       | 0.58                  | index.md:574, 577        | ✓     |
| Placebo: only 70 significant; p 0.058–0.855 | 0.058–0.855         | index.md:607–615, 621    | ✓     |
| Cutoff 65 spillover p=0.058               | 0.058                 | index.md:621             | ✓     |
| Summary table (OLS lin/quad, rdrobust)    | +10.80 / +9.22 [6.87,11.57] / 8.58 [4.54,12.14] | index.md:633–635 | ✓     |
| 13–16% of mean 66.2                        | 13–16%, 66.2          | index.md:637             | ✓     |
| Figure 1 scatter (fig1_scatter_raw)       | ../stata_rd_fig1_scatter_raw.png | index.md:358    | ✓     |
| Figure rdplot (fig3_rdplot)               | ../stata_rd_fig3_rdplot.png | index.md:372         | ✓     |
| Figure density (fig4_density_test)        | ../stata_rd_fig4_density_test.png | index.md:581   | ✓     |
| Figure histogram (fig2_histogram_running) | ../stata_rd_fig2_histogram_running.png | index.md:588 | ✓     |
| Figure placebo (fig5_placebo_cutoffs)     | ../stata_rd_fig5_placebo_cutoffs.png | index.md:618  | ✓     |
| Equation: τ_RD limit definition           | $\tau_{RD}=\lim\dots$ | index.md:158, 480        | ✓     |
| Equation: OLS spec                        | exit = β0+β1·entrance+τ·treat | index.md:392     | ✓     |

Every datum traces; no ✗.

---

## Title sequence (assertion-title test)

1. You can't randomize tutoring — so how do you prove it works?
2. A sharp rule turns a threshold into a natural experiment
3. The spoiler: a clean downward jump in exit scores at 70
4. Where we're going
5. The lab: 1,000 students, one threshold, 24% treated
6. The estimand is the LATE — the jump in the CEF *at* the cutoff
7. Before estimating, prove the gate has no leaks: 100% compliance
8. See it before you estimate it: tutored students sit above the trend
9. Parametric OLS: regress exit on the score plus a treatment dummy
10. Parametric OLS says tutoring adds 10.80 points
11. More flexible specifications barely move the estimate: 9.2–10.8
12. Nonparametric rdrobust: drop the functional form, keep only the locals
13. With an MSE-optimal bandwidth of 9.98, the LATE is −8.58
14. Same finding, two conventions — both say tutoring helps by ~9–11
15. The estimate barely moves from BW 5 to 20: −8.20 to −9.16
16. The McCrary test finds no manipulation: density p = 0.58
17. The histogram confirms it: no spike or heaping at the cutoff
18. The discontinuity is unique to 70 — every placebo cutoff is null
19. Does machine-picking the bandwidth make this causal? No.
20. Both methods agree: rule-based tutoring lifts exit scores 9–11 points
21. Let the cutoff, not your model, do the identifying.

**Verdict:** coherent abstract — reads top-to-bottom as the talk's argument, hook → investigation → resolution → one-sentence thesis.

---

## Positive highlights

- Slide 13's assertion title "With an MSE-optimal bandwidth of 9.98, the LATE is −8.58" carries the method, the tuning choice, and the result in nine words.
- The sign-flip trap (+10.80 OLS vs −8.58 rdrobust) is handled explicitly on slide 14 ("Same finding, two conventions") with a notes paragraph that explains the left→right convention — a genuine teaching win.
- Math is Pandoc-clean: every subscript uses plain `_` (`\tau_{RD}`, `Y_i`, `X_i`, `\text{exit}_i`), so the deck dodges the Goldmark `\_`-in-math bug that breaks subscripts on other Stata decks; the browser pass reports raw-latex 0.
- The closing divider "Let the cutoff, not your model, do the identifying." is a single declarative thesis, not "Questions?" / "Thank you".

---

## Priority action items

1. **[MED]** Trim slide "You can't randomize tutoring…" (slides.qmd:55) to a two-line hook; move the rest to `::: {.notes}` (already there).
2. **[MED]** Shorten the Devil's-Advocate rebuttal (slides.qmd:295) from 50 → ~33 words; push the parenthetical to notes.
3. **[MED]** Cut the second sentence of the estimand gloss (slides.qmd:128) into notes.
4. **[LOW]** Tighten the bandwidth-stability `.comment` (slides.qmd:259).
5. **[LOW]** Tighten the summary `.comment` (slides.qmd:309).

---

## Screenshots (HIGH-severity visual issues only)

None — the slide-audit OVERFLOW flags on 8 slides are the known cumulative artifact (innerText sums hidden vertical sub-slides + `display:none` speaker notes). A per-current-slide check at 1280×720 shows every slide fits exactly (scrollHeight = clientHeight = 720); no clipping.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_rd

To re-check just the dimension you fixed:

    /project:review-slides stata_rd focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (resolved from npx cache via slide-audit auto-locator)
- smoke-test.js: PASS (15 of 15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs OVERFLOW/WORDS/BULLETS counts are cumulative across vertical sub-slides + hidden notes; re-verified per current slide at 1280×720 (no real overflow). raw-latex slides: 0.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
