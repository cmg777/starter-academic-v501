# Infographic Instructions: A Beginner's Guide to Causal Inference with DoWhy

**Story Spine:** Once upon a time, a company compared WFH vs office workers and found a +1.39 productivity gap. But one day, they discovered confounders inflated that number by 39%. Because of that, they used DoWhy's 4-step framework. Because of that, they applied 4 causal methods --- all recovering the true effect of 1.0. But the twist was that the naive estimate was *precisely wrong* (small SE, but its CI missed the truth), while IV traded precision for robustness (5.4x wider CI). Until finally, they learned that a good causal estimate needs both validity and precision.

**3 BIG numbers:** 39% (naive bias), 5.4x (IV SE amplification), 1.0 (true ATE recovered)

---

## A. Full AI Image Prompt (~900 words)

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. Six panels are arranged in a 3-column by 2-row grid, connected by flowing chalk arrows with dust trails. Use five colors: chalk white (#f0ece2) for body text and outlines, steel blue (#8bb8e0) for panel titles, warm orange (#e8956a) for BIG numbers and key accents, teal (#00d4c8) for positive emphasis and call-outs, and muted chalk gray (#b0a89a) for secondary elements and underlines.

**PANEL 1 (top-left) --- "THE QUESTION"**
Panel title in steel blue small-caps: "THE QUESTION." Central sketch: a large magnifying glass held over two groups of stick figures --- one group at office desks (left), one group at home desks with laptops (right). Between the groups, a large upward arrow with "Naive: +1.39" in warm orange. Through the magnifying glass lens, the arrow shrinks and a teal label reads "True: +1.0." Above the magnifying glass, bold chalk lettering asks: "Does Working from Home CAUSE Higher Productivity?" Warm orange callout at bottom: "+1.39" (the misleading naive number, circled). A chalk arrow with dust trail leads right to Panel 2.

**PANEL 2 (top-center) --- "THE HIDDEN VILLAINS"**
Panel title in steel blue small-caps: "HIDDEN VILLAINS." Central sketch: two ghost-like silhouettes --- one labeled "Introversion," one labeled "Children" --- lurking behind a house icon (WFH) and a rising chart icon (Productivity). From each ghost, two chalk arrows sweep outward, one pointing to the house and one to the chart, forming an X-shape of backdoor paths. The ghosts are pulling puppet strings that connect the two icons, inflating the apparent effect. A tipped balance scale sits below, with the WFH side heavier (labeled "5.19") and the Office side lighter ("4.55"). Warm orange callout: "39% bias" (the amount confounders inflate the estimate). A chalk arrow leads right to Panel 3.

**PANEL 3 (top-right) --- "DoWhy's 4 STEPS"**
Panel title in steel blue small-caps: "THE FRAMEWORK." Central sketch: four stepping stones crossing a chalk river, each stone a different color and labeled with one step. Stone 1 (steel blue): "MODEL --- Draw Your DAG." Stone 2 (warm orange): "IDENTIFY --- Find the Estimand." Stone 3 (teal): "ESTIMATE --- Compute the Effect." Stone 4 (muted gray with white text): "REFUTE --- Test Robustness." A stick figure walks across the stones from left to right. Above the river: "DoWhy forces TRANSPARENCY." Teal callout: "Assumptions first, estimates second." A chalk arrow curves down to Panel 4.

**PANEL 4 (bottom-left) --- "THE SHOWDOWN"**
Panel title in steel blue small-caps: "THE SHOWDOWN." Central sketch: a large chalk archery target with a bullseye labeled "True Effect = 1.0" in the center. Five groups of arrows are embedded in the target, each group a different color. (1) A cluster of gray arrows stuck far to the right of the bullseye, clearly off-center, with a big chalk "X" drawn over them and the label "Naive --- misses!" (2) A tight cluster of steel blue arrows right on the bullseye --- "Regression." (3) A tight cluster of warm orange arrows on the bullseye --- "IPW." (4) A tight cluster of teal arrows on the bullseye --- "Doubly Robust." (5) A loose, widely scattered group of purple arrows centered roughly on the bullseye but spread across a large area --- "IV (2SLS)." The visual contrast is clear: the naive arrows are precise but wrong (off-center), the backdoor arrows are precise and correct (tight on bullseye), and the IV arrows are correct but imprecise (centered but scattered). Warm orange callout: "5.4x wider" (pointing at IV's scatter). A chalk arrow leads right to Panel 5.

**PANEL 5 (bottom-center) --- "THE PRECISION TRAP"**
Panel title in steel blue small-caps: "PRECISION TRAP." Central sketch: two archery targets side by side. Left target: arrows tightly clustered but all hitting the wrong spot (off-center, labeled "Naive: SE = 0.07, precise but WRONG"). Right target: arrows loosely scattered but centered on the bullseye (labeled "IV: SE = 0.33, imprecise but VALID"). Between the targets, a diagonal chalk line divides "Precision" (left, narrow) from "Validity" (right, centered). Below the targets, a simple seesaw or balance beam with "Bias" on one end and "Variance" on the other, illustrating the tradeoff. Teal callout: "A small SE does not mean a good estimate." A chalk arrow leads right to Panel 6.

**PANEL 6 (bottom-right) --- "TWO ROADS"**
Panel title in steel blue small-caps: "TWO ROADS TO CAUSATION." Central sketch: a forking path diverging from a single starting point. The left path (steel blue) leads through a checklist gate labeled "Selection on Observables --- Measure ALL confounders" and is used by three figures carrying signs: "Regression," "IPW," "DR." The right path (teal) leads through a key-shaped gate labeled "Instrumental Variables --- Find an exogenous nudge" with one figure carrying "IV." Both paths converge at a single destination marker: a chalk circle labeled "TRUE ATE = 1.0" in warm orange. Below: "DoWhy: Model, Identify, Estimate, Refute. Be transparent about your assumptions." Teal callout: "Both paths reach the truth."

**Enrichment elements:** Bottom-left corner: a small color legend mapping steel blue = "Backdoor methods," teal = "IV method," warm orange = "Key numbers," gray = "Biased." Bottom-right corner: a professor's margin note with an arrow pointing toward Panel 5, reading: "Precision without validity is worthless." Background: faint chalk formulas at 15% opacity (ATE = E[Y(1)] - E[Y(0)], Wald ratio, propensity score formula). Chalk dust particles scattered across panel borders.

---

## B. Negative Prompt

Do not include: photographs, 3D renders, photorealistic elements, corporate clip art, pie charts, complex statistical formulas with many symbols, dense multi-row tables with numbers, logos, watermarks, blurry text, overlapping text, text smaller than caption size, gradients on the chalkboard background, neon colors, comic sans font, emojis, precise bar charts with exact axis values and tick marks, scatter plots, multi-variable regression tables.

---

## C. Condensed Prompt (~200 words)

1920x1080 landscape chalkboard sketchnote on dark navy (#0e1545). Chalk illustrations in white, steel blue, warm orange, teal, and gray. Six panels in a 3x2 grid connected by chalk arrows: (1) "The Question" --- magnifying glass over WFH vs office stick figures, naive +1.39 in orange crossed out, true +1.0 in teal. (2) "Hidden Villains" --- two ghost confounders (introversion, children) with puppet strings to WFH and productivity, tipped balance scale, "39% bias" callout. (3) "The Framework" --- 4 stepping stones crossing a river: Model, Identify, Estimate, Refute. (4) "The Showdown" --- archery target with bullseye at "True Effect = 1.0"; gray arrows off-center (naive, misses), blue/orange/teal arrows tight on bullseye (backdoor methods), purple arrows scattered widely but centered (IV); "5.4x wider" callout. (5) "Precision Trap" --- two archery targets: left = arrows clustered but off-center (naive, precise but wrong), right = arrows scattered around bullseye (IV, valid but imprecise); seesaw of bias vs variance. (6) "Two Roads" --- forking path: selection on observables (left, 3 methods) vs IV (right), converging at "TRUE ATE = 1.0." Professor's margin note: "Precision without validity is worthless."

---

## D. Panel Reference Data

### Panel 1: The Question
- **Position:** Top-left
- **Dramatic function:** Hook
- **Story beat:** A company compares WFH vs office workers and sees a big productivity gap.
- **Callout (warm orange):** "+1.39"
- **Key number:** Naive estimate = 1.39 (true ATE = 1.0, sample = 5,000 employees)
- **Central sketch:** Magnifying glass over two stick-figure groups, arrow shrinks through lens
- **Body text:** "A simple comparison shows WFH workers are 1.39 points more productive. But the true causal effect is only 1.0. Something is inflating the numbers."
- **Transition:** "What's hiding behind this gap?"

### Panel 2: The Hidden Villains
- **Position:** Top-center
- **Dramatic function:** Stakes
- **Story beat:** Confounders (introversion, children) create backdoor paths that inflate the naive estimate by 39%.
- **Callout (warm orange):** "39% bias"
- **Key number:** Introversion: WFH mean 5.19 vs Office 4.55. Bias = +0.39 (39% overestimate).
- **Central sketch:** Ghost confounders with puppet strings, tipped balance scale
- **Body text:** "Introverts self-select into WFH and are independently more productive. This confounding inflates the naive estimate by 39%. The WFH group has higher introversion (5.19 vs 4.55)."
- **Transition:** "How do we untangle cause from correlation?"

### Panel 3: DoWhy's 4-Step Framework
- **Position:** Top-right
- **Dramatic function:** First Attempt
- **Story beat:** DoWhy structures the analysis into 4 transparent steps.
- **Callout (teal):** "Assumptions first"
- **Key number:** 4 steps (Model, Identify, Estimate, Refute)
- **Central sketch:** Stepping stones across a river
- **Body text:** "Step 1: Model your assumptions as a DAG. Step 2: Identify the estimand. Step 3: Estimate the effect with 4 methods. Step 4: Refute with robustness checks."
- **Transition:** "What do the methods find?"

### Panel 4: The Showdown (with CIs)
- **Position:** Bottom-left
- **Dramatic function:** Twist / Comparison
- **Story beat:** All 4 causal methods recover the truth, but with very different precision. The naive CI misses the truth entirely.
- **Callout (warm orange):** "5.4x wider"
- **Key numbers:**

| Method | Estimate | Robust SE | 95% CI | Covers True? |
|--------|----------|-----------|--------|-------------|
| Naive | 1.385 | 0.072 | [1.25, 1.53] | NO |
| Regression | 1.005 | 0.061 | [0.88, 1.13] | Yes |
| IPW | 1.028 | 0.075 | [0.88, 1.18] | Yes |
| DR | 1.012 | 0.062 | [0.89, 1.13] | Yes |
| IV | 0.888 | 0.330 | [0.24, 1.54] | Yes |

- **Central sketch:** Archery target with bullseye at "True Effect = 1.0"; 5 groups of colored arrows: naive (gray, off-center, X), regression/IPW/DR (tight on bullseye), IV (scattered widely but centered)
- **Body text:** "All 4 causal methods cover the true ATE of 1.0. The naive CI [1.25, 1.53] misses it entirely. IV's CI is 5.4x wider than regression's --- the price of not needing observed confounders."
- **Transition:** "But is a narrow CI always better?"

### Panel 5: The Precision Trap
- **Position:** Bottom-center
- **Dramatic function:** Surprise
- **Story beat:** Being precise does not mean being right. The naive estimate is precisely wrong. IV is imprecise but valid. This is the bias-variance tradeoff.
- **Callout (teal):** "Precise =/= correct"
- **Key numbers:** Naive SE = 0.072 (small, but CI misses truth). IV SE = 0.330 (large, 5.4x regression's, but CI covers truth). Regression SE = 0.061 (reference).
- **Central sketch:** Two archery targets (clustered-off-center vs scattered-on-bullseye), bias-variance seesaw
- **Body text:** "The naive estimate has a small SE (0.07) but its CI misses the true ATE --- precisely wrong. IV has a large SE (0.33) but its CI covers the truth. A small standard error does not mean a good estimate."
- **Transition:** "So which road should you take?"

### Panel 6: Two Roads to Causation
- **Position:** Bottom-right
- **Dramatic function:** Resolution
- **Story beat:** Two identification strategies both reach the true effect, with different tradeoffs.
- **Callout (teal):** "Both reach the truth"
- **Key numbers:** Backdoor methods: SE 0.06--0.08, requires all confounders observed. IV: SE 0.33, works with unmeasured confounders.
- **Central sketch:** Forking path converging at TRUE ATE = 1.0
- **Body text:** "Selection on Observables: control for ALL confounders (Regression, IPW, DR). Instrumental Variables: find an exogenous nudge (IV). Both paths reach the true causal effect of 1.0."
- **Transition:** (none --- resolution)

### Body Text for Manual Overlay
- Title: "A Beginner's Guide to Causal Inference with DoWhy"
- Subtitle: "From Precisely Wrong to Credibly Right"
- Professor's note: "Precision without validity is worthless."
- URL: carlos-mendez.org
