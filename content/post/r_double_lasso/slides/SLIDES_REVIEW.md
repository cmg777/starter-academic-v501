# Review: r_double_lasso Slide Deck

**Audited:** content/post/r_double_lasso/slides/
**Source of truth:** content/post/r_double_lasso/index.md (no results_report.md in bundle; referenced by post)
**Date:** 2026-07-08
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled (Playwright 1.61.0 / Chromium)

---

## Verdict: ACCEPT

**Overall assessment.** A faithful, well-paced, technically clean deck: every headline number, table, selection count, and figure traces to the source post, math renders on every slide, and the branding files are byte-identical to the canonical (now dark-navy) template. The strongest dimensions are conceptual correctness and title↔body consistency — the assertion titles read in sequence as a coherent abstract and each is proven by its body. The weakest is design adherence (7): after the `.comment`→`.takeaway` conversion, only 3 of ~14 content slides end on a summary card, so the "summary sentence at the bottom of every slide" goal is only partially met. No HIGH issues; nothing blocks acceptance.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                       |
|----|-------------------------------|-----------:|--------:|---------------------------------------------|
| 1  | Source fidelity               | 9          | 1L      | ~25 numbers/figures trace to source; one unverbatim value |
| 2  | Conceptual correctness        | 10         | 0       | estimand + identification stated correctly; no overclaim |
| 3  | Technical & render correctness| 10         | 0       | smoke-test 15/15 PASS; math renders on all slides |
| 4  | Title↔body consistency        | 10         | 0       | assertion-title test PASS                   |
| 5  | Readability & simplicity      | 8          | 2L      | 2 borderline-long lines; browser "dense" flags are artifacts |
| 6  | Typos & grammar               | 10         | 0       | em dashes correct; terminology consistent   |
| 7  | write-slides design adherence | 7          | 1M 1L   | arc ok; closing ok; incomplete takeaway coverage |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide.html diff CLEAN (identical) |
| 9  | Accessibility & legibility    | 10         | 0       | 0 overflow; figures captioned; color not sole signal |
| 10 | Deliverable completeness      | 10         | 0       | link `slides/index.html` ok; all files + figures present |

---

## Issues found

| #  | Dim | Severity | Location                                             | Issue                                                                 | Suggested fix                                              |
|---:|----:|----------|------------------------------------------------------|-----------------------------------------------------------------------|------------------------------------------------------------|
| 1  | 7   | MED      | deck-wide (only slides at qmd:91, 111, 133 have a card) | Only 3 of ~14 content slides end on a `.takeaway`; list/figure/bignum slides ("Where we're going", "Five estimators ask…") have no concluding summary line | Add a one-line `[…]{.takeaway .fragment}` to the content slides that lack one (see action items) |
| 2  | 5   | LOW      | slides.qmd:91 — "The lab: 48 states…"                | Takeaway card is two sentences (~30 words); cards read best as one line | Split — keep one sentence on the card, move the FWL detail to notes |
| 3  | 5   | LOW      | slides.qmd:131 — "Double LASSO selects…"             | 30-word gloss with two parenthetical inserts                          | See rewrite below                                          |
| 4  | 1   | LOW      | slides.qmd:203 — "…restores a sensible −0.096"       | Label cites "the paper's −0.104"; index.md:141 says only "within 0.01 of its point estimate" — the value −0.104 is not stated verbatim in the post | Soften to "within 0.01 of the paper's estimate", or cite the paper's Table 2 value explicitly |
| 5  | 7   | LOW      | slides.qmd:93 — "Five estimators ask…"               | 5 `.incremental` bullets = ~5 fragment advances (guide is ≤4)          | Acceptable as a roster slide; optionally reveal as one list |

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide "The lab: 48 states × 12 years…"**

Before:
> State fixed effects absorbed by first-differencing; year effects partialled out (Frisch–Waugh–Lovell). $p/n \approx 0.49$ — the high-dimensional regime where Double LASSO is meant to help.

After:
> $p/n \approx 0.49$ — the high-dimensional regime where Double LASSO is meant to help.

Why: A takeaway card is one memorable line. Move "state FE by first-differencing; year effects partialled out (FWL)" to `::: {.notes}` — the speaker says it; the card keeps the one claim that sticks.

**Issue #3 — slide "Double LASSO selects on the outcome and the treatment…"**

Before:
> Run it twice — once for $y$ on $X$ (set $I_y$), once for $d$ on $X$ (set $I_d$) — then OLS of $y$ on $d$ and the **union** $I_y\cup I_d$.

After:
> Run two LASSOs: $y$ on $X$ → $I_y$, and $d$ on $X$ → $I_d$.
> Then OLS of $y$ on $d$ and the **union** $I_y\cup I_d$.

Why: 30 words with nested parentheticals → two short lines a listener parses at a glance.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                                   | Value on slide | Source location                     | Match |
|-----------------------------------------------|----------------|-------------------------------------|-------|
| Title strip — rigorous DL (violent)           | −0.096         | index.md:432 (−0.0964)              | ✓     |
| Title strip — CV sign flip (violent)          | +0.019         | index.md:520 (+0.0193)             | ✓     |
| Candidate controls                            | 284            | index.md:219                        | ✓     |
| Panel dimensions                              | 48 × 12 = 576  | index.md:217                        | ✓     |
| $p/n$ ratio                                   | ≈ 0.49         | 284/576 = 0.493 (index.md:252)      | ✓     |
| First-diff table (violent/property/murder α)  | −0.152 / −0.108 / −0.204 | index.md:286–288          | ✓     |
| First-diff SEs                                | 0.034 / 0.022 / 0.067 | index.md:286–288             | ✓     |
| Kitchen-sink OLS murder bignum                | +2.34 (234%)   | index.md:302 (+2.3426)             | ✓     |
| Kitchen-sink OLS violent sign flip            | +0.014         | index.md:300 (+0.0135)             | ✓     |
| Rigorous DL restore bignum (violent)          | −0.096, SE 0.051 | index.md:432 (−0.0964, 0.0514)    | ✓     |
| Selection: rigorous 8 vs CV 150 (violent)     | 8 / 150        | index.md:432, 520                   | ✓     |
| Rigorous union range                          | 8–12           | index.md:432–434 (8/12/9)          | ✓     |
| CV union range                                | 109–161        | index.md:520–522 (150/109/161)     | ✓     |
| CV murder α (explodes)                        | −1.11          | index.md:522 (−1.1128)             | ✓     |
| CV paths: controls surviving                  | 143 of 284     | index.md:510                        | ✓     |
| Figures (estimates, selection, paths)         | ../r_double_lasso_*.png | index.md:74, 542, 512        | ✓     |
| Paper's point estimate                        | −0.104         | index.md:141 ("within 0.01"; value not stated verbatim) | ~ (Issue #4) |

Every ✓ traces to the source; the single `~` is Issue #4 (unverbatim, but consistent — not a wrong/invented number).

---

## Title sequence (assertion-title test)

1. With 284 candidate controls, the answer depends on which ones you keep
2. Five estimators, three crimes — wildly different answers from one dataset
3. The lab: 48 states × 12 years, 576 rows, 284 candidate controls
4. With zero controls, more abortion tracks less crime: −0.152
5. Throw in all 284 controls and OLS claims abortion raises murder by 234%
6. Double LASSO selects on the outcome *and* the treatment, then runs OLS
7. Theory keeps 8 controls; cross-validation keeps 150
8. Theory-tuned λ protects the causal signal; prediction-tuned λ flips it
9. Cross-validation's λ is so small that 143 of 284 controls survive
10. Rigorous Double LASSO restores a sensible −0.096 for violent crime
11. Does LASSO make this causal? No — two assumptions still carry the weight

**Verdict:** coherent abstract — the titles alone narrate the whole argument (problem → disagreement → data → baseline → failure → method → penalty contrast → resolution → caveat).

---

## Positive highlights

- Slide "Throw in all 284 controls and OLS claims abortion raises murder by 234%" turns a failure mode into a memorable dark bignum slide (+2.34) — the cautionary hook that motivates the whole method.
- Slide "Theory keeps 8 controls; cross-validation keeps 150" is a perfect assertion title: it states the paper's central finding in seven words and the figure proves it.
- The Devil's-advocate slide ("Does LASSO make this causal? No…") correctly refuses to overclaim — it names conditional independence + parallel trends and says the paper evaluates a *method*, matching index.md:610.
- The tables and takeaway cards read cleanly on the new dark navy canvas; inline math inside a takeaway ($p/n \approx 0.49$) typesets correctly.
- Closing slide is a single declarative thesis ("Let the theory, not the cross-validator, choose your controls.") — not "Questions?"/"Thank you".

---

## Priority action items

1. **[MED]** Extend takeaway coverage (Issue #1): add a one-line `[…]{.takeaway .fragment}` to the content slides that currently end without one — e.g. "Where we're going", "Five estimators ask…", the DL equation slide, and the two figure slides — so the "summary at the bottom of every slide" goal is met deck-wide.
2. **[LOW]** Trim the "The lab" takeaway to one sentence, move the FWL detail to notes (Issue #2 rewrite).
3. **[LOW]** Split the 30-word gloss on the DL equation slide into two lines (Issue #3 rewrite).
4. **[LOW]** Reconcile the "−0.104" label with the post — soften to "within 0.01 of the paper's estimate" or cite the paper's Table 2 value (Issue #4).

---

## Screenshots (HIGH-severity visual issues only)

None — no overflow or unrendered math detected in the browser pass.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides r_double_lasso

To re-check just the dimension you fixed:

    /project:review-slides r_double_lasso focus: design

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled v1.61.0 (Chromium)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean — site-brand.scss and title-slide.html byte-identical to `write-slides/references/templates/`
- Design/branding (browser pass): background reported MISMATCH (#0f1729 vs the tool's hard-coded #eef1f6) — **not a deck defect**: the canonical template moved to dark navy on 2026-07-08 and the deck matches it exactly; accent-rule ok; byline refined; pipeline none; takeaway-cards 3
- Tooling notes: `slide-audit.cjs` still expects the retired light `#eef1f6` background and measures word/bullet density cumulatively across fragment advances (reported 18 "dense" slides that are not dense per-slide) — both are stale-tool artifacts, not deck findings. The review-slides skill + audit script should be updated to the dark theme.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
