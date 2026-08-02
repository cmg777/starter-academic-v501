# Slides Review — r_sc_dsc_sdid

**Deck:** `slides/slides.qmd` → `slides/index.html` (31 slides, 5 acts)
**Source of truth:** `../index.md`, `../analysis.R`, `../execution_log.txt`
**Dimensions audited:** all 10 · **Date:** 2026-08-02 · **Browser pass:** yes (Playwright/Chromium)

## Verdict: ACCEPT (2 HIGH and 1 MED fixed during the review)

The deck was factually sound and on-brand from the start — every number traces to the post, the
brand files are byte-identical to the canonical templates, and math renders on every slide. Two
slides physically overflowed their box, which is a presentation defect a reader of the `.qmd` cannot
see. Both are fixed. The remaining density flags are largely a measurement artefact; see below.

## Dimension scores (1–10)

| # | Dimension | Score | Note |
|---|---|---|---|
| 1 | Source fidelity | 10 | Every figure in the deck traces to `index.md`; spot-checked 10 headline numbers, all match |
| 2 | Conceptual correctness | 10 | The ladder, the bias decomposition and the horizon caveat are stated as in the post |
| 3 | Technical & render correctness | 10 | 15/15 smoke test; 0 raw-LaTeX slides; MathJax renders throughout |
| 4 | Title↔body consistency | 9 | Assertion titles throughout; the new split slides inherit the pattern |
| 5 | Readability & simplicity | 8 | Was 6 — two overflows and two genuinely dense slides, now fixed |
| 6 | Typos & grammar | 10 | None found |
| 7 | write-slides design adherence | 10 | Four `.divider` act slides, `. . .` fragments, speaker notes present |
| 8 | Branding integrity | 10 | `site-brand.scss` and `title-slide.html` byte-identical to canonical |
| 9 | Accessibility & legibility | 9 | Key-result strip populated; figures carry the post's alt text |
| 10 | Deliverable completeness | 10 | `slides.qmd`, `index.html`, `slides_files/`, both brand files present |

## Tooling results

```text
smoke test  : 15 of 15 checks passed
brand diff  : site-brand.scss  identical
              title-slide.html identical
slide-audit : slides traversed: 31
              raw-latex slides: 0   overflow slides: 0   dense slides: 8
              design/branding: background, accent rule, byline, pipeline all on-brand
```

## Issues

### HIGH — both fixed

**H1. Slide 1-2 "Build it out of the countries we do observe" overflowed the box.**
Four bullets, a paragraph and a full-width figure on one slide. Content ran past the bottom edge.

*Fix, applied.* Split the figure onto its own slide, "One line in a crowd", following the pattern
already used successfully by "The rubber band" and "And the time weights collapse". The observation
about the synchronised 2008-09 collapse moved into speaker notes, where it belongs.

**H2. Slide 2-2 "Stage 0 — Difference-in-differences" overflowed the box.**
A code block, two reveal fragments and a full-width figure.

*Fix, applied.* Split into "Stage 0" (code + result) and "Parallel trends, failing in plain sight"
(the figure, with the one-line reading beneath it).

### MED — fixed

**M1. Two slides carried a genuine reading load, independent of LaTeX.**

- `Every estimator is the same regression` — the master equation plus a four-row table.
- `What to take away` — five numbered takeaways plus a fragment on uncertainty.

*Fix, applied.* The first is split into the equation ("Every estimator is the same regression") and
the table ("Four settings of the same dials"), which is better presentation regardless of the word
count. The second drops to four takeaways, with the headline number and its error bars promoted to
their own slide, "And the answer, with its error bars" — the uncertainty caveat was the most easily
skipped line in the deck and now has a slide to itself.

### LOW — accepted, not changed

**L1. Eight slides remain above the 60-word density cap.** Six of them are equation slides:

| Slide | Words counted | Actual prose |
|---|---|---|
| Every estimator is the same regression | 112 | ~22 |
| Stage 1 — Synthetic control | 97 | ~35 |
| Stage 2 — Demeaned SC | 85 | ~40 |
| Two ways to be wrong | 85 | ~45 |
| The turkey | 76 | ~76 |

`slide-audit.cjs` counts LaTeX tokens as words, so a slide carrying one display equation starts
about 90 "words" into its budget before any prose is written. Splitting the equation away from its
own explanation would make these slides worse, not better. The two remaining flags (66 and 63 words)
are marginal and both use `. . .` fragments, so the audience never sees the full text at once.

Recorded rather than fixed, so a future reviewer does not re-litigate it.

## Source-fidelity ledger (spot checks — all PASS)

| Value | In deck | In post | Status |
|---|---|---|---|
| DiD 4.98% | ✓ | ✓ | PASS |
| SC 3.06% | ✓ | ✓ | PASS |
| DSC 2.99% | ✓ | ✓ | PASS |
| SDID 2.76% | ✓ | ✓ | PASS |
| MASC 2.73% | ✓ | ✓ | PASS |
| ASCM 3.04% | ✓ | ✓ | PASS |
| Placebo RMSE 0.0067 / 0.0089 | ✓ | ✓ | PASS |
| Born et al. 2.4% | ✓ | ✓ | PASS |
| Matched-horizon 0.0067 / 0.0066 / 0.0066 | ✓ | ✓ | PASS |
| 96% of lambda on one quarter | ✓ | ✓ | PASS |

## Positive highlights

- **The four-act structure earns itself.** Problem → Ladder → Pivot → Verdict maps onto the post's
  own argument, and the act dividers use the brand colours in a meaningful order (orange for the
  problem, steel for the method, black for the theory, teal for the conclusion).
- **The turkey slide.** The extrapolation/interpolation distinction is the hardest idea in the
  material and the deck lands it with a roasting chart before any notation appears.
- **The deck reports the correction, not just the result.** "But check the exam before trusting the
  ranking" carries the horizon finding into the talk rather than leaving it buried in the post.
- **Speaker notes are substantive**, not restatements of the slide.

## Browser pass

Chromium, all 31 slides traversed. Math renders on every slide; no overflow; no raw LaTeX; title
slide background, accent rule and byline all on-brand. No screenshots were needed — no HIGH visual
issue survived the fixes.

## How to re-review

```bash
BASE=content/post/r_sc_dsc_sdid/slides \
  node .claude/skills/write-slides/references/templates/smoke-test.js
node .claude/skills/review-slides/references/templates/slide-audit.cjs \
  "$PWD/content/post/r_sc_dsc_sdid/slides/index.html"
```

## Follow-ups (not auto-run)

- The deck has no `pipeline` or `takeaway-cards` title-slide elements. Both are optional in
  `write-slides` and the three-stat key-result strip already carries the headline numbers.
- Re-render after any change to `../index.md` that touches a quoted number.
