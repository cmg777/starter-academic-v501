# Infographic Review: `r_sc_dsc_sdid`

**Brief:** `infographic_instructions.md` · **Source post:** `index.md` (1,255 lines)
**Reviewed:** 2026-08-02 · all 8 dimensions

## Verdict: MAJOR REVISION → rewritten and now ACCEPT

The brief was factually impeccable and structurally wrong. Every number in it traced to the post,
but it was not the artifact this site's pipeline produces: it was a hand-written design memo with
eight panels, prose instructions and the *website's* dark-navy palette, where `write-infographic`
specifies a four-section AI image prompt with six panels and a distinct chalkboard palette. No image
generator could have been driven from it, which is the document's entire purpose.

It has been rewritten to the template. The content survived almost intact — the ladder, the turkey,
the fire drill and the dartboard are all still there — but they are now expressed as a storyboard a
model can render.

## Dimension results

| # | Dimension | Before | After |
|---|---|---|---|
| 1 | Accuracy | PASS | PASS — all 22 decimal figures verified against the post |
| 2 | Completeness | **FAIL** — no Sections A/B/C/D, no Story Spine | PASS — all four sections plus Story Spine and beats |
| 3 | Prompt leanness | **FAIL** — bullets and tables throughout, no hex codes, no spatial positions | PASS — 900-word Section A, flowing prose, all six hex codes inline, every panel positioned |
| 4 | Storyboard format | **FAIL** — 8 panels, no callout discipline | PASS — 6 panels, exactly 3 BIG-number callouts and 3 phrase callouts |
| 5 | Panel 4 comparison sketch | **FAIL** — Panel 4 was a mixing desk | PASS — balance scale weighing the two bias types |
| 6 | Narrative arc coherence | PARTIAL | PASS — Hook → Stakes → Attempt → Twist → Surprise → Resolution |
| 7 | Template alignment | **FAIL** — wrong palette, wrong section structure | PASS — Template A (Causal Inference), layered panels |
| 8 | Message coverage | PARTIAL | PASS — see below |

## Issues found and fixed

| # | Dim | Severity | Issue | Fix |
|---|---|---|---|---|
| 1 | 2, 7 | **HIGH** | No Section A / B / C / D structure. The file was a design memo, not an image prompt — nothing to paste into a generator, no negative prompt, no condensed variant, no panel reference data for manual overlay. | Rewritten to the four-section template with Story Spine and six-beat arc. |
| 2 | 7 | **HIGH** | Wrong palette. The brief specified the site's *web* colours (`#0f1729`, `#6a9bcc`, `#d97757`, `#00d4c8`) instead of the chalkboard palette the skill mandates (`#0e1545`, `#f0ece2`, `#8bb8e0`, `#e8956a`, `#00d4c8`, `#b0a89a`). Only teal overlapped. | All six chalkboard hex codes now named inline in Section A. |
| 3 | 4 | **HIGH** | Eight panels against the template's six, with no dramatic-function assignment and no callout discipline. | Consolidated to six panels on Template A. The dropped material (the mixing-desk faders panel and the two-traps strip) folded into Panels 2 and 5 as body sentences. |
| 4 | 3 | MEDIUM | Section A was bulleted lists and markdown tables. The skill requires flowing prose, because bullets confuse image models. | Rewritten as prose; zero bullets in Section A. |
| 5 | 5 | MEDIUM | Panel 4 was a mixing desk with two banks of faders — a control metaphor, not a comparison. The template reserves Panel 4 for comparison. | Panel 4 is now a balance scale weighing extrapolation bias (a roast turkey and the wrong row) against interpolation bias (a curve and its chord). |
| 6 | 3 | MEDIUM | No spatial positions, no connector arrows, no two-pass rendering note. | All six panels positioned, arrows specified in reading order, rendering note added. |
| 7 | 3 | LOW | Section C at 262 words against the 250 cap. | Trimmed to 238. |

## Accuracy check (Dimension 1 — passed before and after)

Every decimal figure in the brief appears in the source post:

| Number | In brief | In post | Status |
|---|---|---|---|
| 4.98 | 1 | 3 | PASS |
| 3.06 / 2.99 / 2.76 / 2.73 / 3.04 | 2/1/1/2/2 | 15/5/7/7/12 | PASS |
| 2.40 | 1 | 2 | PASS |
| 0.0067 / 0.0089 | 1 / 1 | 7 / 6 | PASS |
| 0.0080 / 0.0086 / 0.0087 | 1 each | 4 / 4 / 4 | PASS |
| 0.042 | 1 | present | PASS |
| 0.96 (lambda mass) | 1 | present | PASS |
| 23 / 24 / 86 donors, countries, quarters | 4 / 3 / 3 | 32 / 27 / 32 | PASS |

**Result: 22/22 decimal figures verified. No fabrication.**

## Message coverage (Dimension 8)

| # | Message from the post | Coverage |
|---|---|---|
| 1 | There is one UK; the counterfactual must be built | FULL — Panel 1 |
| 2 | 23 donors, weights on the simplex | FULL — Panel 2 with sub-equation |
| 3 | Six estimators forming a ladder, each fixing the last | FULL — Panel 3 |
| 4 | Extrapolation vs interpolation bias; SDID targets both | FULL — Panel 4 |
| 5 | The in-sample placebo tournament ranks SDID first | FULL — Panel 5 |
| 6 | Every stage exceeds the previously published 2.4% | FULL — Panel 6 |
| 7 | Covariates make the counterfactual worse | PARTIAL — Panel 6 body sentence, no on-image element |
| 8 | The horizon artefact in the published SDID ranking | PARTIAL — Panel 5 body sentence, no on-image element |
| 9 | The solver stopped early; the published SC number is an artefact | OMITTED — deliberately |

Messages 7 and 8 are carried as overlay text rather than sketch elements: both need a sentence of
setup that a chalk metaphor cannot supply, and forcing them on-image would break the three-anchor-
number discipline. Message 9 is omitted on purpose — the solver-convergence story is the post's most
technical point and needs the iteration ladder to land. Recorded so the omission is a decision, not
an oversight.

## Variant suggestions

1. **Lead with the turkey.** Panel 4's metaphor is the most memorable thing in the material and
   currently sits in the second row. A variant that opens with it — reordering to Hook: two ways to
   be wrong → Stakes: the UK → … — would trade narrative logic for immediate intrigue.
2. **A seventh anchor number.** The 0.13858 ridge parameter and the 3.9e-06 hand-vs-package
   agreement are the kind of specificity that signals real work, but neither fits the three-anchor
   rule. A "methods appendix" strip below the grid could carry them without competing with the
   orange.
3. **Drop Panel 1.** If the audience already knows what Brexit is, Panel 1 is scene-setting that
   Panel 2 subsumes. A five-panel variant would give every remaining panel more room.

## Positive highlights

- **The metaphor set is genuinely non-repeating**: splitting island, blending cauldron, stepladder,
  balance scale, row of smoke detectors, dartboard. The template asks that no two panels share a
  metaphor type and this clears it comfortably.
- **The turkey survives the rewrite intact.** It was the best thing in the original brief and it is
  the one element that makes the post's hardest idea land without notation.
- **The dartboard resolves the story numerically.** Seven darts clustered to the right of a dotted
  "2.4%" line says the headline finding without a chart.

## Priority action items

All applied. Nothing outstanding.
