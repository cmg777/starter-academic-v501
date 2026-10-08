# Infographic review — `infographic_instructions.md` (`python_sc_bayes_spatial`)

**Reviewed:** 2026-08-04 · **Verdict on review: MAJOR REVISION → rewritten, all findings resolved**
**Method:** `/project:review-infographic`, cross-checking every number against
`results_report.md`, `execution_log.txt` and the 23 CSVs rather than against the post's
prose. Every flagged number was independently recomputed before the rewrite.

## Scores (before the rewrite)

| # | Dimension | Score | Assessment |
|---|---|---:|---|
| 1 | Accuracy | 2/5 | 21 of 23 numbers exact, but two were wrong and one claim was false |
| 2 | Completeness | 2/5 | the section labelled "D" was a four-bullet render note, not a panel-reference appendix — so the two-pass workflow had no text to overlay |
| 3 | Prompt leanness | 3/5 | all six hex codes and six positions present; no two-pass note, no margin elements, no background formulas |
| 4 | Storyboard format | 2/5 | six distinct non-chart metaphors (the hardest constraint, fully met) but no panel titles, no connector arrows, callouts over the 8-word cap |
| 5 | Panel 4 comparison | 4/5 | balance scale is the right metaphor; the supporting justification was wrong |
| 6 | Narrative arc | 3/5 | all six dramatic functions present, but Panel 6 did not answer the banner's question |
| 7 | Template alignment | 4/5 | Causal Inference template correctly selected |
| 8 | Message coverage | 1/5 | **oversimplified** — six of twelve headline messages absent, including the post's central conceptual contribution |

## Findings and outcomes

### HIGH

| # | Issue | Verification | Outcome |
|---|---|---|---|
| 1 | The BIG-numbers table assigned **−16.87** to Panel 1, but Panel 1 renders **−18** on the seal. The post's headline result therefore appeared in no rendered panel. | — | **fixed** — −16.87 now lands in Panel 5 (beneath the map, as −15.68 → −16.87) and again in Panel 6, written large across the corrected interval |
| 2 | "Donor mean 2000: roughly 68" — wrong. 68.3 is *synthetic California*; the 38-donor mean is **92.13**. | recomputed from `source_data.csv` | **fixed** — both numbers now stated and correctly labelled |
| 3 | "Pre-treatment fit is comparable" — false, and load-bearing, since it was the stated justification for the level balance beam. | RMSE **1.5998** simplex, **0.0514** BSCM, **0.1859** spatial (`execution_log.txt:64,86,117`) — a factor of 31 | **fixed** — the panel now says the scales balance because the *answer* is stable, not because the fits are equal, and gives all three RMSEs |
| 4 | Panel 6's hourglass metaphor attributed the 33×-too-narrow interval **entirely to chain length** — the one explanation the post explicitly rules out twice. | `index.md:1057` and `:1357`; `r_reconciliation.csv` row 3: 100× the iterations moves the width only 0.482 → 0.702 | **fixed** — the metaphor is now a measuring tape comparing the two interval widths, and the two separable causes are stated with the numbers |
| 5 | Section "D" was a render note, not the required panel-reference appendix: no body sentences, no callout field, no key-number field, no transitions, no message inventory. | — | **fixed** — a full Section D now carries position, dramatic function, callout, key numbers, body copy and a transition for all six panels, plus a story spine, tracked-estimator list and an ON-IMAGE / MARGIN / REFERENCE inventory |
| 6 | **Oversimplified.** The central conceptual contribution — that the classical estimate is biased *toward zero* and therefore **understates** the effect — appeared nowhere, on-image or in reference text. | — | **fixed** — Panel 5 now carries the consequence, both bias figures (1.19 packs on horseshoe weights, 1.51 on simplex weights) and Nevada's 97% share |

### MEDIUM

| # | Issue | Outcome |
|---|---|---|
| 7 | Panel 5's arrow "pools into a dark shaded basin over Nevada" — *pooling* reads visually as something arriving, i.e. the naive cross-border-shopping story the prose correctly negates. | **fixed** — now a hatched sinkhole scooped *out of* Nevada. The arrow direction (California → Nevada) is correct as causal influence and is kept, with a render note explaining why both are right |
| 8 | Subtitle "the state that **paid for** a law it never passed" nudges toward tax arbitrage. | **fixed** — "the state that quit smoking for a law it never passed" |
| 9 | "26 of 38 donors" attributed to the horseshoe. 26 is **BSCM**; scspill's horseshoe is **25** — and the panel's own caption says "multiplies by five", which only works at 25. | **fixed** — 25 throughout, with BSCM's 26 and its 16.86 intercept explained in the reference text |
| 10 | "−18 is the number everyone quotes" is unsupported; `results_report.md` says the quoted figure is ≈ **−27**, and the difference is the predictor set. | **fixed** — Panel 1 reference now states this explicitly |
| 11 | No panel titles, no connector arrows, callouts over the 8-word cap, and 0 of 3 BIG numbers in callouts. | **fixed** — six steel-blue small-caps titles, chalk arrows in reading order, six callouts all ≤8 words, three carrying a BIG number |
| 12 | No two-pass rendering note, no margin elements, no background formula layer. | **fixed** — all three added, including two professor's notes and a colour legend |
| 13 | Section B omitted the mandatory "no precise statistical charts" exclusion. | **fixed** |
| 14 | Panel 6 answered a different question from the title banner. | **fixed** — the banner is now "WHO ELSE WAS TREATED — AND HOW SURE ARE WE?", which both Panel 5 and Panel 6 answer |
| 15 | No transition phrases between panels. | **fixed** — Escalation / Complication / Turn / Complication / Resolution |

### LOW

Applied: reference subsections for the five tracked estimators; the A1 atmosphere
boilerplate restored (chalk-dust particles, smudge marks); steel-blue panel borders and
warm-orange circled numerals per the skill; the left balance pan given an explicit chalk
white; Panel 2's thirty-nine-thread bundle — the deck's only near-chart — replaced with a
fan of index cards; the story spine moved into Section D; "the interval everyone quotes"
softened to what it actually was.

## Verification after the rewrite

- **26/26 numeric claims** re-verified against the CSVs, exact to the stated precision
- Bias identities recomputed: $\sum \alpha_j \xi_j = -1.1295$ (horseshoe), $-1.5132$ (simplex), Nevada's contribution $-1.0984$
- Interval ratio 33.1×; 1,209 observations = 39 states × 31 years
- No stale text from the previous version survives (checked by string search)
- Section A is flowing prose within the word band; Section C is under 250 words
- No emojis; em dashes throughout; U+2212 minus signs

## What was already right, and worth keeping

The counter-intuitive spillover sign was handled correctly and defensively in the original
— stated in the panel reference *and* repeated as a render note warning against inverting
the arrow. This is the single most likely place for an infographic on this post to go
wrong, and it did not. The six distinct non-chart metaphors and the Panel 4 level-beam
instinct also survived the rewrite intact.

---

*Produced by `/project:review-infographic`. This file records the resolution of each
finding as well as the finding; the brief itself was rewritten rather than patched.*
