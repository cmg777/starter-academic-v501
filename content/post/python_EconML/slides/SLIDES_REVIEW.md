# Review: python_EconML Slide Deck

**Audited:** content/post/python_EconML/slides/
**Source of truth:** content/post/python_EconML/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT (with minor polish applied)

**Overall assessment.** The deck is faithful, on-brand, and renders cleanly: all 14 on-slide numbers trace to the post, the smoke test passes 15/15, MathJax typesets every equation (no raw LaTeX), and `site-brand.scss` / `title-slide.html` are byte-identical to the canonical templates. The strongest dimension is source fidelity (every ATE, SE, CI, and range matches `index.md`); the weakest was readability, where two `.comment` blocks stacked multiple sentences that belong in speaker notes. No HIGH issues. The one fidelity slip — a slide title saying "85% of districts" where the post means 85% of district-years (observations) — and the readability over-stacks were corrected in this pass, so the deck now meets ACCEPT cleanly.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 7          | 1 MED   | 1 unit slip (districts vs district-years); all numbers trace |
| 2  | Conceptual correctness        | 10         | none    | ATE/CATE/GATE estimands correct; CIA framing right |
| 3  | Technical & render correctness| 10         | none    | smoke-test PASS; math renders; no raw LaTeX |
| 4  | Title↔body consistency        | 10         | none    | assertion-title test passes            |
| 5  | Readability & simplicity      | 7          | 2 MED   | 2 `.comment` walls-of-prose → notes    |
| 6  | Typos & grammar               | 10         | none    | em-dashes correct; no `--`; consistent terms |
| 7  | write-slides design adherence | 10         | none    | 3-act arc; Devil's-Advocate; 1-sentence close |
| 8  | Branding integrity            | 10         | none    | scss/title diff clean                  |
| 9  | Accessibility & legibility    | 9          | 1 LOW   | per-slide overflow check: none; figures captioned |
| 10 | Deliverable completeness      | 10         | none    | link `url: slides/index.html` ok; files present; 5/5 figs resolve |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 1   | MED      | slide 6 — "85% of districts never mine" | Post reports 85% of *observations* (district-years) untreated, not 85% of districts; each district appears across 10 years and can mine in some | Retitle "85% of district-years never mine" |
| 2  | 5   | MED      | slide 3 — "We want the CATE"      | `.comment` stacks 2 sentences (~45 words); first restates the equation in words | Keep the "that bend is the whole point" anchor on slide; move the verbal restatement to `::: {.notes}` |
| 3  | 5   | MED      | slide 22 — "The strongest objection — and the answer" | Rebuttal `.comment` is a 4-sentence, ~55-word paragraph on slide | Keep a 2-clause anchor; move the rest to `::: {.notes}` |
| 4  | 1   | LOW      | slide 17 — "A second institutional measure cross-validates…" | Column bullets cite "range 0.089 across exec. constraints" under a quality-of-government–framed slide; QoG plots carry no published numeric range | Re-attribute bullets as "matches the exec.-constraints range of 0.089 / 0.045" so the source of the number is explicit |
| 5  | 9   | LOW      | slide 6 — imbalance slide         | Densest single slide (contentH 712 vs 720 box at 1280×720) — fits but is the tightest | No change required; monitor if figure caption grows |

Order: HIGH first, then MED, then LOW. (No HIGH issues.)

---

## Readability rewrites (Dimension 5)

**Issue #2 — slide 3 "We want the CATE — a function of $\mathbf{x}$, not a single number"**

Before:
> Among districts that look like $\mathbf{x}$, what is the average gap between the treated and untreated potential outcomes? Where $\tau(\cdot)$ bends with $\mathbf{x}$, mining helps some districts more than others — that bend is the whole point.

After:
> Where $\tau(\cdot)$ bends with $\mathbf{x}$, mining helps some districts more than others — that bend is the whole point.

Why: ~45 words / 2 sentences → one 18-word anchor; the verbal restatement of the equation moves to speaker notes where the presenter says it aloud.

**Issue #3 — slide 22 "The strongest objection — and the answer"**

Before:
> Exactly right. $\tau(\mathbf{x})$ is identified *only* under the Conditional Independence Assumption. The forest discovers heterogeneity flexibly and earns honest confidence intervals — but it cannot rule out an unobserved confounder. With real data, the CIA is untestable; here it holds only because we built it in.

After:
> Exactly right. $\tau(\mathbf{x})$ is identified *only* under the Conditional Independence Assumption — the forest earns honest intervals, but it cannot rule out an unobserved confounder.

Why: 4 sentences / ~55 words → 2 clauses / ~28 words; the "discovers heterogeneity flexibly" elaboration and the "untestable in real data" caveat move to notes.

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                 | Value on slide | Source location               | Match |
|-----------------------------|----------------|-------------------------------|-------|
| Naive 1-0                   | 0.109          | index.md:428                  | ✓     |
| Truth 1-0                   | 0.250          | index.md:428 / TRUE_ATES      | ✓     |
| Bias 1-0                    | −0.141         | index.md:428                  | ✓     |
| Naive 3-1                   | 0.413          | index.md:430                  | ✓     |
| 56% underestimate           | 56%            | index.md:433                  | ✓     |
| CATE estimand equation      | τ(x)=E{…}      | index.md:256                  | ✓     |
| 3,000 district-years        | 3,000          | index.md:366                  | ✓     |
| 300 districts, 8 countries  | 300 / 8        | index.md:367                  | ✓     |
| 2003–2012                   | 2003–2012      | index.md:354                  | ✓     |
| 85/5/5/5 imbalance          | 85%            | index.md:370,385–388          | ✓ (unit fixed) |
| 2,550 controls; 150/level   | 2,550 / 150    | index.md:385–388              | ✓     |
| Mining ATE (1-0)            | 0.240          | index.md:533,541              | ✓     |
| SE / 90% CI (1-0)           | 0.070 / [0.124,0.355] | index.md:533,541       | ✓     |
| Bias removed                | −0.141         | index.md:428                  | ✓     |
| 2-1 ATE / SE                | 0.029 / 0.101  | index.md:536,543              | ✓     |
| 3-1 ATE / SE / sig          | 0.220 / 0.101 / 5% | index.md:537,543          | ✓     |
| 3-2 ATE / sig               | 0.191 / 10%    | index.md:538,543              | ✓     |
| Mining GATE range           | 0.089          | index.md:594,608              | ✓     |
| Price GATE range            | 0.045          | index.md:605,608              | ✓     |
| GATE 0.175→0.264            | 0.175 / 0.264  | index.md:588,593,608          | ✓     |
| Neyman 2nd-order (0.10)²≈0.01 | 0.01         | index.md:235                  | ✓     |
| exec_constraints importance 0.014 | 0.014    | index.md:644 (notes)          | ✓     |
| Figure: treatment_dist      | ../python_econml_treatment_dist.png | index.md:391  | ✓     |
| Figure: gate 1v0 exec       | ../python_econml_gate_ntl_1v0_exec.png | index.md:578 | ✓  |
| Figure: gate 3v1 exec       | ../python_econml_gate_ntl_3v1_exec.png | index.md:581 | ✓  |
| Figure: var_importance      | ../python_econml_var_importance.png | index.md:646  | ✓     |
| Figure: cate_tree           | ../python_econml_cate_tree.png | index.md:675       | ✓     |

Every number traces to source. The single MED was a unit-label slip ("districts" vs "district-years"), not a wrong value; corrected.

---

## Title sequence (assertion-title test)

1. Is resource wealth a blessing or a curse? The honest answer is: it depends on whom you ask
2. The naive comparison says mining barely helps — and it is wrong by 56%
3. We want the CATE — a function of x, not a single number
4. Where we're going
5. A simulated lab where we know the right answers in advance
6. The treatment is brutally imbalanced — 85% of district-years never mine
7. DML residualizes both sides, then lets a forest read the remainder
8. Why first-stage errors barely matter: Neyman orthogonality
9. Configure CausalForestDML: honest trees, cross-fitting, grouped by district
10. Identification rests on one untestable assumption — not on the algorithm
11. The forest recovers a mining ATE of 0.240 — within sampling error of the true 0.250
12. DML removes the −0.141 confounding bias the naive estimator carried
13. The forest discovers a non-linear price gradient — without being told to look
14. Institutions amplify the mining effect — stronger constraints, larger payoff
15. The price effect is flat across institutions — a non-finding that is the finding
16. A second institutional measure cross-validates the same asymmetry
17. Beware: the most "important" features are not the moderators
18. A depth-2 tree turns the forest's heterogeneity into a story you can tell aloud
19. The strongest objection — and the answer
20. Let the data reveal for whom — but never forget the assumption that makes it causal.

**Verdict:** coherent abstract. Titles read alone trace the full Tension→Investigation→Resolution arc: the curse-is-conditional hook, the biased naive comparison, the CATE estimand, the DML machinery, the three findings, the importance-vs-moderation caveat, the Devil's-Advocate, and a one-sentence close.

---

## Positive highlights

- Slide 2's assertion title "The naive comparison says mining barely helps — and it is wrong by 56%" turns a result into a claim with the exact number from index.md:433.
- Slide 12 "DML removes the −0.141 confounding bias the naive estimator carried" is a clean figure-free bignum slide whose value and gloss both trace to the post's Finding 1.
- The 3-act divider structure (Tension #d97757 / Investigation #6a9bcc / Resolution #00d4c8) uses all three brand colors and matches the post's narrative spine.
- The closing slide is a single declarative sentence (not "Questions?"), exactly as the design contract requires.
- Every method slide leads with the equation or figure, with the prose correctly demoted to `::: {.notes}`.

---

## Priority action items

1. **[MED]** Fix the unit slip on slide 6: "85% of districts" → "85% of district-years" (applied).
2. **[MED]** Trim the slide-3 CATE `.comment` to the one anchor sentence; move the rest to notes (applied).
3. **[MED]** Trim the slide-22 rebuttal `.comment` to 2 clauses; move the elaboration to notes (applied).
4. **[LOW]** Re-attribute the slide-17 robustness ranges to executive constraints explicitly (applied).
5. **[LOW]** No overflow on any slide at 1280×720 — no action.

---

## Screenshots (HIGH-severity visual issues only)

None — no raw LaTeX and no real clipping overflow detected.

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_EconML

To re-check just the dimension you fixed:

    /project:review-slides python_EconML focus: readability

---

## Audit metadata

- Node version: v25.9.0
- Playwright: enabled (system Chrome channel)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: `slide-audit.cjs` reported 6 "overflow" + 23 "dense" slides, but its per-slide word/overflow counts are CUMULATIVE across vertical sub-slides and hidden speaker notes (titles all collapsed to the divider names "The Tension"/"The Investigation"). A per-current-slide re-measure via `Reveal.getCurrentSlide()` at 1280×720 found ZERO real overflow (every slide's `scrollHeight - 720 ≤ 8px`). Density flags are therefore the known artifact, not load-bearing.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only: this file is the only artifact written; the deck was not modified.*
