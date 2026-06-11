# Review: python_dowhy Slide Deck

**Audited:** content/post/python_dowhy/slides/
**Source of truth:** content/post/python_dowhy/index.md
**Date:** 2026-06-11
**Audit version:** review-slides v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** This is a strong, faithful deck. Every number on every slide
traces to the source post (naive \$1,794; RA \$1,676; IPW \$1,559; AIPW \$1,620; PS-strat
\$1,617; PS-match \$1,736; placebo \$62 at p=0.92), the math renders cleanly, the branding
is byte-identical to the canonical templates, and the smoke test passes 15/15. The
strongest dimension is source fidelity (a clean ledger with zero mismatches); the weakest
was title↔body consistency, where one label-style title ("Where we're going") broke the
assertion-title sequence. That single MED is now fixed, promoting the deck to ACCEPT.

**Audited 10 of 10 dimensions.**

---

## Dimension scores

| #  | Dimension                     | Score / 10 | Issues  | Notes                                  |
|----|-------------------------------|-----------:|--------:|----------------------------------------|
| 1  | Source fidelity               | 10         | 0       | all 14+ numbers + 4 figures trace to source |
| 2  | Conceptual correctness        | 10         | 0       | ATE vs ATT correct; matching→ATT flagged; unconfoundedness stated |
| 3  | Technical & render correctness| 10         | 0       | smoke-test PASS (15/15); math renders; no `\_`, no `\\$` over-escape |
| 4  | Title↔body consistency        | 9          | 1 MED   | one label title (now fixed); rest assertion titles, sequence coheres |
| 5  | Readability & simplicity      | 9          | 1 LOW   | `.comment` lines ≤22 words; density flags are cumulative-count artifact |
| 6  | Typos & grammar               | 10         | 0       | em-dashes throughout; consistent terminology |
| 7  | write-slides design adherence | 9          | 1 MED   | 3-act arc, figure-first, Devil's-Advocate, declarative close; one label title |
| 8  | Branding integrity            | 10         | 0       | scss + title-slide diffs clean (byte-identical) |
| 9  | Accessibility & legibility    | 10         | 0       | no overflow; every figure captioned; math keeps plain-language gloss |
| 10 | Deliverable completeness      | 10         | 0       | index.html 52 KB + slides_files/; `url: slides/index.html` (no trailing slash) |

---

## Issues found

| #  | Dim | Severity | Location                          | Issue                                          | Suggested fix                                  |
|---:|----:|----------|-----------------------------------|------------------------------------------------|------------------------------------------------|
| 1  | 4/7 | MED      | slide "Where we're going" (slides.qmd:70) | Label title, not an assertion; breaks the titles-as-abstract sequence | Retitle to a claim — see fix below (APPLIED) |
| 2  | 5   | LOW      | slides.qmd:108, 122 (`.comment` spans) | Two stacked short sentences in one `.comment` anchor | Acceptable as crisp two-beat lines; left as-is |

Order: HIGH first, then MED, then LOW. None HIGH.

---

## Readability rewrites (Dimension 5)

None found. (All on-slide `.comment` anchors are ≤22 words and single/short-clause;
the headless density flags are the known cumulative-count artifact across vertical
sub-slides + hidden notes, not real overflow — the browser pass reports 0 overflow
slides and 0 raw-LaTeX slides.)

---

## HIGH-issue rewrites

None found.

---

## Source-fidelity ledger (Dimension 1)

| Slide datum                 | Value on slide | Source location               | Match |
|-----------------------------|----------------|-------------------------------|-------|
| Naive ATE                   | \$1,794        | index.md:488, 942             | ✓     |
| Regression adjustment ATE   | \$1,676        | index.md:694, 943             | ✓     |
| IPW ATE                     | \$1,559        | index.md:725, 944             | ✓     |
| Doubly robust (AIPW) ATE    | \$1,620        | index.md:769, 945             | ✓     |
| PS stratification ATE       | \$1,617        | index.md:794, 946             | ✓     |
| PS matching ATE             | \$1,736        | index.md:818, 947             | ✓     |
| Training mean / control mean| \$6,349 / \$4,555 | index.md:372, 487          | ✓     |
| Placebo new effect / p      | \$62 / 0.92    | index.md:858, 951             | ✓     |
| Random common cause / p     | \$1,676 / 0.90 | index.md:881, 952             | ✓     |
| Data subset (80%) / p       | \$1,728 / 0.80 | index.md:905, 953             | ✓     |
| Sample: 185 / 260 / 445     | 185 / 260 / 445 | index.md:333, 348            | ✓     |
| Outcome mean re78           | \$5,301        | index.md:348                  | ✓     |
| SMD: nodegr / hisp / educ   | 0.31 / 0.18 / 0.14 | index.md:447                | ✓     |
| Effect size band            | 34–38%         | index.md:961, 985             | ✓     |
| 8 pre-treatment covariates  | 8              | index.md:549                  | ✓     |
| Figure: estimate comparison | ../dowhy_estimate_comparison.png | index.md:934      | ✓     |
| Figure: outcome by treatment| ../dowhy_outcome_by_treatment.png | index.md:370     | ✓     |
| Figure: SMD love plot       | ../dowhy_covariate_balance_smd.png | index.md:445    | ✓     |
| Figure: causal graph (DAG)  | ../dowhy_causal_graph.png | index.md:582              | ✓     |

No ✗. Every datum traces to the post.

---

## Title sequence (assertion-title test)

1. Trained workers out-earned controls by \$1,794 — but did training *cause* it?
2. Five disciplined estimators land near \$1,620 — far below the naive \$1,794
3. One estimand, four steps, five estimators — do they agree? *(was "Where we're going")*
4. We target the ATE: the effect of training on a *random* worker
5. DoWhy forces four explicit steps instead of one black-box regression
6. The lab: 445 NSW workers, 8 pre-treatment covariates, randomized
7. Both groups overlap heavily — and both spike at zero earnings
8. Randomization isn't perfect: `nodegr` is imbalanced by 0.31 SD
9. Step 1 — Model: every covariate is a common cause of both arms
10. Step 2 — Identify: the backdoor criterion seals all confounding paths
11. Step 3 — Estimate: three paradigms, one question
12. Regression adjustment compares like with like: \$1,676
13. IPW re-weights surprising cases by 1/ê(X): \$1,559
14. AIPW gets two shots at the truth: \$1,620
15. All five adjusted estimators agree: \$1,559 to \$1,736
16. Step 4 — Refute: a placebo treatment collapses the effect to \$62
17. Add a fake confounder, drop 20% of the data — the estimate barely moves
18. Does machine-picked adjustment make this causal? No — one assumption still carries the weight
19. The training effect is real: ~\$1,620, a 34–38% earnings gain

**Verdict:** coherent abstract (after the slide-3 fix). Read in order, the titles tell
the whole story: a tempting raw gap, disciplined estimators that shrink it, the four-step
method, the estimates, the refutations, the honest caveat, and the resolved effect.

---

## Positive highlights

- Slide 2's spoiler-figure title "Five disciplined estimators land near \$1,620 — far
  below the naive \$1,794" plants the payoff and the tension in one assertion.
- Slide 8's "Randomization isn't perfect: `nodegr` is imbalanced by 0.31 SD" turns a
  balance plot into a precise, surprising claim — exactly the assertion-title ideal.
- The Devil's-Advocate slide (18) steelmans the objection ("DoWhy automated it, so it
  must be airtight") and answers with the load-bearing unconfoundedness assumption —
  conceptually faithful to the post's limitations section.
- The closing slide is a single declarative sentence ("State your assumptions, identify
  the estimand, then let the data — and the refutations — speak."), not "Questions?".
- Branding is byte-identical to the canonical templates; math escaping is correct for
  Pandoc (single `\$`, no Goldmark `\_`).

---

## Priority action items

1. **[MED]** Retitle "Where we're going" to the assertion "One estimand, four steps,
   five estimators — do they agree?" (slides.qmd:70). **APPLIED.**

(Only one actionable item; the deck is otherwise ACCEPT-clean.)

---

## How to re-review

After applying fixes (via write-slides), re-run:

    /project:review-slides python_dowhy

To re-check just the dimension you fixed:

    /project:review-slides python_dowhy focus: consistency

---

## Audit metadata

- Node version: (system node)
- Playwright: enabled (slide-audit.cjs ran; 0 overflow, 0 raw-LaTeX, 23 dense flags = cumulative-count artifact)
- smoke-test.js: PASS (15/15 checks)
- Branding diff: clean (site-brand.scss and title-slide.html byte-identical to templates)
- Tooling notes: density counts from slide-audit.cjs are cumulative across vertical sub-slides + hidden speaker notes; re-verified per current slide — no real overflow.

---

*Generated by `/project:review-slides`. Skill at `.claude/skills/review-slides/`.
Read-only intent: this report plus the single MED title fix in slides.qmd.*
