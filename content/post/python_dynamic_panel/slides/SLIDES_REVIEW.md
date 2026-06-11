# Review: python_dynamic_panel Slide Deck

**Audited:** content/post/python_dynamic_panel/slides/
**Source of truth:** content/post/python_dynamic_panel/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** A faithful, on-brand, well-paced seminar deck. Every number, table, equation, and figure on a slide traces to the source post (strongest dimension: source fidelity). The weakest dimension is readability, and only marginally: one on-slide equation gloss ran ~37 words and was split. The assertion-title sequence reads as a coherent abstract, the closing slide is a single declarative sentence, and a Devil's-Advocate (objection/rebuttal) slide is present. Math is plain-Pandoc (no Goldmark `\_` leakage), branding is byte-identical to the canonical theme, and the smoke test passes 15/15.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | none    | all ~30 numbers + 4 figures trace to post |
| 2  | Conceptual correctness        | 10         | none    | persistence (not causal) framed correctly; estimand absence stated |
| 3  | Technical & render correctness| 10         | none    | smoke-test PASS; math renders; no `\_`/`\$` |
| 4  | Title↔body consistency        | 10         | none    | assertion-title test passes; closing is one sentence |
| 5  | Readability & simplicity      | 9          | 1 LOW   | one 37-word gloss split; rebuilt to 2 sentences |
| 6  | Typos & grammar               | 10         | none    | em-dashes used; terminology consistent |
| 7  | write-slides design adherence | 9          | 1 LOW   | one label/agenda title ("Where we're going") |
| 8  | Branding integrity            | 10         | none    | scss + title-slide diffs clean         |
| 9  | Accessibility & legibility    | 10         | none    | 0 real overflow at 1280×720; figures captioned |
| 10 | Deliverable completeness      | 10         | none    | qmd + index.html (61.8 KB) + slides_files/; link OK |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 5   | LOW      | slides.qmd:78 — slide 4 "…the one sin…" | 37-word `.comment` gloss with colon + sub-clause | Split into two short sentences (APPLIED)       |
| 2  | 7   | LOW      | slide 5 — "Where we're going"     | Label/agenda title, not an assertion           | Deferred — agenda roadmap is an accepted Act-I pattern; rewriting needs invented framing |
| 3  | 5   | LOW      | slides.qmd:295 — slide 22 rebuttal | ~45-word list-sentence in the rebuttal         | Deferred — deliberate steelman density on the Devil's-Advocate slide; acceptable |

Order: HIGH first, then MED, then LOW. Number consecutive across all dimensions.

---

## Readability rewrites (Dimension 5)

**Issue #1 — slide 4 "The model commits the one sin ordinary panel methods cannot forgive"**

Before:
> A *lagged dependent variable* on the right-hand side while the firm effect $\alpha_i$ sits in the error: $n_{i,t-1}$ depends on $\alpha_i$ by construction, so the regressor is correlated with the error no matter how many controls we add.

After:
> A *lagged dependent variable* sits on the right while the firm effect $\alpha_i$ sits in the error. By construction $n_{i,t-1}$ depends on $\alpha_i$ — so the regressor is correlated with the error, no matter how many controls we add.

Why: one 37-word sentence (colon + sub-clause) → two sentences (~14 and ~22 words); each carries one idea. APPLIED.

**Issue #3 — slide 22 rebuttal (deferred)**

Before:
> All true — which is why the claim is the *point estimate and its lower bound*, never "employment is stationary." The estimate survives the bracket check, a 6-cell proliferation grid (range 0.921–0.956), clean AR(2)/Hansen, and an exact replication — and the mean-stationarity price is stated out loud, not hidden.

After (suggested, not applied):
> All true. So the claim is the *point estimate and its lower bound*, never "employment is stationary." The estimate survives four checks — the bracket, a 6-cell proliferation grid (0.921–0.956), clean AR(2)/Hansen, and an exact replication — with the mean-stationarity price stated out loud.

Why: deferred — the long list-sentence is a deliberate steelman on the Devil's-Advocate slide, where density is rhetorically intended. Trimming is optional polish, not a defect.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                          | Value on slide | Source location          | Match |
|--------------------------------------|----------------|--------------------------|-------|
| Three headline ρ̂ (FE/sys/OLS)        | 0.626, 0.927, 0.962 | index.md:76, 82, 138 | ✓     |
| Shock half-lives                     | 1.5, 9, 18 years | index.md:82, 1025       | ✓     |
| Pooled OLS ρ̂ (SE)                    | 0.962 (0.008)  | index.md:603 (0.9617/0.0084) | ✓ |
| Fixed effects ρ̂ (SE)                 | 0.626 (0.052)  | index.md:604 (0.6262/0.0515) | ✓ |
| Bias bracket                         | [0.626, 0.962] | index.md:607            | ✓     |
| Anderson-Hsiao ρ̂ / SE / CI / width   | 1.233 / 0.478 / [0.296, 2.170] / 1.87 | index.md:681–682, 685 | ✓ |
| Diff GMM ρ̂ / SE / instr / AR2 / Hansen | 0.679 / 0.089 / 91 / 0.866 / 0.211 | index.md:723, 729–734 | ✓ |
| "0.679 is 0.053 above 0.626"         | 0.053          | index.md:737            | ✓     |
| System GMM ρ̂ / SE / instr           | 0.927 / 0.079 / 32 | index.md:775, 786       | ✓     |
| System GMM AR1/AR2/Hansen            | 0.000 / 0.994 / 0.462 | index.md:782–784      | ✓     |
| Headline CI                          | [0.773, 1.081] | index.md:790            | ✓     |
| 0.927^5 ≈ 0.68                       | 0.68           | index.md:138, 790       | ✓     |
| Wage / capital elasticity (notes)    | −0.816 (0.276) / 0.589 (0.172) | index.md:776, 778 | ✓ |
| Long-run wage / 1−ρ (notes)          | −2.5 / 0.073   | index.md:790            | ✓     |
| Proliferation grid (5 rows shown)    | 68/0.956/0.035 … 32/0.927/0.462 | index.md:853–858 | ✓ |
| Uncollapsed vs collapsed SE (notes)  | 0.0274 / 0.0785 | index.md:857–858, 896  | ✓     |
| Replication L1.n / Hansen χ² / instr | 0.2710675 / 32.666 / 42 | index.md:925, 930, 934 | ✓ |
| Variance decomposition (notes)       | 1.339 / 0.195 (×7) | index.md:482–483, 486 | ✓     |
| Panel size                           | 140 firms / 1,031 firm-years | index.md:462, 486 | ✓ |
| 4 figures (trajectories/bracket/proliferation/forest) | ../python_dynamic_panel_*.png | index.md:515, 642, 894, 1019 | ✓ |

Every ✗ is a HIGH issue. None found.

---

## Title sequence (assertion-title test)

1. Same regression, same data — and shock half-lives of 1.5, 9, or 18 years
2. Firms orbit their own levels — a fixed effect and persistence at once
3. The model commits the one sin ordinary panel methods cannot forgive
4. Where we're going  *(label/agenda — Issue #2)*
5. Pooled OLS and fixed effects fail in opposite, known directions
6. Two wrong answers bracket the truth: any consistent estimate must land in [0.626, 0.962]
7. Anderson-Hsiao IV is consistent — and useless: 1.233 with a CI 1.87 wide
8. Arellano-Bond: every lag dated t−2 or earlier is a valid instrument
9. Two command strings run the whole GMM ladder in pydynpd
10. Difference GMM passes every printed test — and still gives a suspect 0.679
11. Blundell-Bond flips the logic: lagged differences instrument the levels
12. Ninety-three percent of an employment shock survives into next year
13. The headline's diagnostics are textbook-clean
14. The diagnostics decoder: two of the three tests are read backwards
15. The Hansen p-value responds to the instrument count, not just validity
16. More instruments is not better — proliferation disarms the test that guards you
17. The toolchain replicates the published benchmark digit for digit
18. Seven estimators, one parameter — only the workflow identifies the winner
19. "Your own CI includes the unit root — why believe 0.927?"
20. The dynamic-panel checklist you take home
21. (closing) No single p-value separates 0.927 from 0.679 — the bracket-plus-diagnostics workflow does.

**Verdict:** coherent abstract; one label title at slide 4 ("Where we're going") is the only non-assertion.

---

## Positive highlights

- Slide 10's title "Difference GMM passes every printed test — and still gives a suspect 0.679" states the deck's central pedagogical twist in one line — the assertion and its tension live in the title.
- The closing divider "No single p-value separates 0.927 from 0.679 — the bracket-plus-diagnostics workflow does." is exactly one declarative sentence and restates the thesis the deck argued, not "Questions?"/"Thank you".
- Every long explanation lives in `::: {.notes}`; on-slide bodies are short anchors (figure + one-line gloss, or a compact table), so real visible word counts stay ≤ ~80 (code slides ~133, acceptable).
- The Devil's-Advocate slide (objection/rebuttal) honestly steelmans the unit-root-in-CI critique and answers it — a design requirement for seminar decks.
- Math is authored as plain Pandoc `$…$` with bare `_` subscripts (no Goldmark `\_` leakage) and no escaped currency — math typesets cleanly (35 MathJax spans, 0 raw LaTeX).

---

## Priority action items

1. **[LOW]** Split the slide-4 equation gloss into two short sentences (APPLIED).
2. **[LOW]** (Deferred) Consider an assertion title for slide 4 "Where we're going" (e.g. "The estimator ladder: each rung fails informatively"). Optional; the roadmap pattern is acceptable.
3. **[LOW]** (Deferred) Optionally tighten the slide-22 rebuttal list-sentence. Deliberate density on a steelman slide; polish only.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_dynamic_panel

To re-check just the dimension you fixed:

    /project:review-slides python_dynamic_panel focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (Chromium via npx cache)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss + title-slide.html byte-identical)
- Tooling notes: slide-audit.cjs cumulative word/bullet/overflow counts confirmed as the known fragment+notes artifact; a per-current-slide pass at 1280×720 (notes excluded) found 0 real overflow on all 25 slides.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
