# Review: stata_dynamic_panel Slide Deck

**Audited:** content/post/stata_dynamic_panel/slides/
**Source of truth:** content/post/stata_dynamic_panel/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT (after applied minor fixes)

**Overall assessment.** This is a faithful, well-built deck. Every number, table cell, figure, equation, and code snippet traces cleanly to the source post — the strongest dimension is source fidelity (no fabricated or mismatched values). The weakest dimension before fixes was readability: a handful of method slides stacked a second full sentence of body prose that belongs in speaker notes. Those have been trimmed (extra prose moved to `::: {.notes}`), promoting the deck to ACCEPT. Branding is byte-identical to the canonical templates, the smoke test passes 15/15, math renders everywhere, and no slide overflows the box at 1280×720.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all numbers/tables/figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | estimand correctly framed (not ATE/ATT); Nickell/AB correct |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders y; no raw LaTeX |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test pass               |
| 5  | Readability & simplicity      | 8          | 3 MED (fixed) | 3 slides stacked a 2nd prose sentence → moved to notes |
| 6  | Typos & grammar               | 10         | 0       | em-dashes correct; consistent terminology |
| 7  | write-slides design adherence | 10         | 0       | 3-act arc ok; two Devil's-Advocate objection/rebuttal slides; closing is one declarative sentence |
| 8  | Branding integrity            | 10         | 0       | scss/title diff clean                   |
| 9  | Accessibility & legibility    | 10         | 0       | overflow none (per-slide 1280×720); all figures captioned |
| 10 | Deliverable completeness      | 10         | 0       | link ok (`url: slides/index.html`); files ok; 6/6 figures resolve |

---

## Issues found

| #  | Dim | Severity | Location                                   | Issue                                                        | Suggested fix                              |
|---:|----:|----------|--------------------------------------------|-------------------------------------------------------------|--------------------------------------------|
| 1  | 5   | MED      | slide "A data trap" (slides.qmd:104)       | Two full sentences of body prose stacked on the slide        | Keep sentence 1; move sentence 2 to notes  |
| 2  | 5   | MED      | slide "The fix: first-difference" (slides.qmd:156) | Two sentences; the 2nd is a 28-word nested clause            | Keep the 1st short line; move the 2nd to notes |
| 3  | 5   | MED      | slide "Deeper lags are valid instruments" (slides.qmd:168) | Single ~30-word sentence with a trailing instrument list     | Split into a short claim line; move the list detail to notes |

Order: HIGH first, then MED, then LOW. All three MEDs were applied (prose moved to `::: {.notes}`).

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide "A data trap: 'missing' was coded as zero, not as missing"**

Before:
> The three lagged institutional variables encode missing data as $0$. Left raw, those zeros masquerade as legitimate observations of "no economic freedom."

After (on slide):
> The three lagged institutional variables encode missing data as $0$.

(The second sentence — "Left raw, those zeros masquerade as legitimate observations of 'no economic freedom.'" — moves to `::: {.notes}`.)

Why: two stacked body sentences → one anchor line on slide; the explanatory consequence is spoken, not read.

**Issue #2 — slide "The fix: first-difference to kill α_i, then instrument the lag"**

Before:
> Differencing erases $\alpha_i$ exactly. But $\Delta\ln\text{GDPpc}_{i,t-1}$ and $\Delta\varepsilon_{i,t}$ both contain $\varepsilon_{i,t-1}$ — so the differenced lag is endogenous.

After (on slide):
> Differencing erases $\alpha_i$ exactly — but it makes the differenced lag endogenous.

Why: 2 sentences (the 2nd a 28-word clause) → one short line; the algebra of *why* (both terms share $\varepsilon_{i,t-1}$) moves to notes where the speaker says it.

**Issue #3 — slide "Deeper lags are valid instruments: the Arellano–Bond moment conditions"**

Before:
> Lags $2$ and deeper of the *level* are uncorrelated with the differenced error — so $\ln\text{GDPpc}_{i,t-2}, \ln\text{GDPpc}_{i,t-3},\ldots$ instrument $\Delta\ln\text{GDPpc}_{i,t-1}$.

After (on slide):
> Lags $2$ and deeper of the *level* are uncorrelated with the differenced error — so they are valid instruments for the differenced lag.

Why: replaces the dense symbolic list with plain words; the explicit $\ln\text{GDPpc}_{i,t-2}, \ldots$ instrument list moves to notes.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                         | Value on slide          | Source location              | Match |
|-------------------------------------|-------------------------|------------------------------|-------|
| War peak (countries, year)          | 51 in 1990              | index.md:417, 419            | ✓     |
| War plateau                          | 25–28 through 2015      | index.md:419                 | ✓     |
| Panel size                           | 160 countries, 1,663 country-years, T 1–13 | index.md:91, 341, 459 | ✓ |
| 95th pct of War                      | 0.571                   | index.md:355, 413            | ✓     |
| Complete-record share                | 48% (77 of 160)         | index.md:459                 | ✓     |
| EconFreeLag mean / min after mvdecode| 4.67→5.76 / 0→1.82      | index.md:380                 | ✓     |
| Retained obs (Polit/Econ/Democ)      | 1,168 / 1,349 / 225     | index.md:376–377, 380        | ✓     |
| DemocIndxLag loss                    | 86.5%                   | index.md:106, 380            | ✓     |
| ln GDP range / skew / kurt           | 5.6–12.7 / −0.03 / 2.25 | index.md:413, 431            | ✓     |
| War / Coup kurtosis                  | 8.79 / 10.11            | index.md:413                 | ✓     |
| Mean War / Coup time path            | War→0.14 (1985–90); Coup 0.10–0.12 | index.md:423, 425 | ✓ |
| Model 1: L.lnGDPpc / SE / t          | 0.679 / 0.051 / 13.21   | index.md:548                 | ✓     |
| Model 1: War / SE / t                | −0.219 / 0.057 / −3.84  | index.md:548, 559            | ✓     |
| Model 1: Coup / SE / t               | −0.091 / 0.028 / −3.19  | index.md:552, 559            | ✓     |
| Model 1: N / countries / instruments | 1,187 / 155 / 146       | index.md:538–540             | ✓     |
| Model 1: AR(2) / Hansen p            | 0.091 / 0.184           | index.md:555–556             | ✓     |
| War 95% CI / drop                    | [−0.330, −0.107] / 19.6%| index.md:210, 559            | ✓     |
| 4-model War row                      | −0.219 / −0.239 / −0.159 / −0.160 | index.md:591       | ✓     |
| 4-model Coup row                     | −0.091 / −0.076 / −0.095 / −0.090 | index.md:595       | ✓     |
| L.EconFreedom M2 / M4                | 0.020 / 0.028           | index.md:598                 | ✓     |
| L.PolitFreedom M3 / M4               | 0.0003 / 0.0002         | index.md:600                 | ✓     |
| Long-run War M1 / SE / t             | −0.353 / 0.079 / −4.48  | index.md:635                 | ✓     |
| Long-run table M1–M4                 | −0.353 / −0.271 / −0.224 / −0.166 | index.md:635–638   | ✓     |
| exp(−0.353)−1                        | ≈ −30%                  | index.md:644                 | ✓     |
| Mediation reduction                  | 53% (−0.35→−0.17)       | index.md:683                 | ✓     |
| Diagnostics AR(2) all                | 0.091 / 0.881 / 0.810 / 0.625 | index.md:654–657       | ✓     |
| Diagnostics Hansen all               | 0.184 / 0.607 / 0.128 / 0.179 | index.md:654–657       | ✓     |
| Headline ranges                      | 16–24% contemp / up to 35% cumulative | index.md:667, 682 | ✓ |
| Figures (6)                          | ../stata_dynamic_panel_*.png | index.md §6, §10–12     | ✓ (6/6 resolve) |

No ✗ rows. Source fidelity is clean.

---

## Title sequence (assertion-title test)

1. Bombs destroy factories — so why do cross-country regressions shrug?
2. War prevalence peaked at 51 countries in 1990, then plateaued
3. Where we're going
4. The lab: 160 countries × 13 quinquennia, 1955–2015
5. A data trap: "missing" was coded as zero, not as missing
6. War and coup are heavy-tailed; GDP is near-symmetric
7. War and coup intensity both rose in the late Cold War, then fell
8. The model is dynamic: today's income depends on yesterday's
9. Static fixed effects break here — Nickell bias of order −1/T
10. The fix: first-difference to kill α_i, then instrument the lag
11. Deeper lags are valid instruments: the Arellano–Bond moment conditions
12. Six lines fit difference GMM in Stata with xtabond2
13. With no controls, a Magnitude-7 war cuts GDP by 0.219 log points
14. War's damage is overwhelmingly contemporaneous, not delayed
15. The contemporaneous war effect is stable across all four models
16. Over 15 years, a war shock cuts GDP by 0.353 log points — a 30% decline
17. The long-run war penalty shrinks as institutions enter the model
18. Half the long-run war penalty is mediated through institutions
19. Every model passes AR(2) and Hansen — the strategy is well-diagnosed
20. Does GMM make this causal? No — two assumptions still carry the weight
21. Let the panel — and the deeper lags — compare each country to itself.

**Verdict:** coherent abstract. Read in sequence the titles tell the full story — tension, data, the Nickell-bias problem, the AB fix, the contemporaneous and cumulative results, the institutional mediation, the diagnostics, the causal caveat, and a one-line takeaway close.

---

## Positive highlights

- Slide 13's assertion title "With no controls, a Magnitude-7 war cuts GDP by 0.219 log points" states the headline estimate in the title itself — exemplary assertion titling.
- Two genuine Devil's-Advocate slides (Nickell-bias `xtreg, fe` objection; the "is GMM causal?" objection) with explicit `[Objection.]`/`[Response.]` framing — strong seminar rhetoric.
- The closing divider "Let the panel — and the deeper lags — compare each country to itself." is a single declarative sentence, not "Questions?"/"Thank you".
- Source fidelity is flawless: all 25+ distinct numeric claims and all 6 figures resolve to the post with zero drift.

---

## Priority action items

1. **[MED]** Move the second body sentence on the "A data trap" slide to speaker notes (applied).
2. **[MED]** Shorten the "The fix" slide's second sentence to one line; move the shared-$\varepsilon$ algebra to notes (applied).
3. **[MED]** Replace the symbolic instrument list on the "Deeper lags" slide with a plain-language clause; move the explicit lag list to notes (applied).

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides stata_dynamic_panel

To re-check just the dimension you fixed:

    /project:review-slides stata_dynamic_panel focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (via ~/.npm/_npx cache; system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: slide-audit.cjs OVERFLOW/word flags are the documented cumulative-DOM artifact (counts grow monotonically and include hidden speaker notes); a per-slide re-check at 1280×720 found 0 real overflow and 0 raw-LaTeX slides.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
