# Infographic Instructions

**Post:** Difference-in-Differences for Policy Evaluation: A Comprehensive Tutorial in R
**Template:** Causal Inference
**Target tool:** Gemini / DALL-E / Midjourney / Ideogram
**Text rendering:** Option A (all text rendered by AI)

---

## Section A: Full Image Generation Prompt

Create a single-image chalkboard-style infographic in academic sketchnote style. The image is landscape orientation, 1920 x 1080 pixels. The entire background is a deep navy chalkboard (#0e1545) with subtle chalk dust particles and faint mathematical notation at 15% opacity --- equations like $ATT(g,t) = E[Y_t(g) - Y_t(0) \mid G=g]$, $Y_{it} = \theta_t + \eta_i + \alpha D_{it} + v_{it}$, and $\bar{M} \approx 0.67$ scattered across the background like a professor's blackboard between lectures.

**Title block:** Centered across the top, the title "DIFFERENCE-IN-DIFFERENCES FOR POLICY EVALUATION" is hand-lettered in steel blue (#8bb8e0) small-caps chalk, roughly 2.5 cm tall. Beneath it, the subtitle "Can modern DID methods recover the true employment effect when states adopt policies at different times?" appears in italic chalk white (#f0ece2), slightly smaller. A thin chalk rule in muted gray (#b0a89a) separates the title from the panels below.

**Layout:** Six panels arranged in a 3 x 2 grid, each panel enclosed by a rounded rectangle drawn in steel blue (#8bb8e0) chalk with slightly irregular hand-drawn edges. Panels are separated by about 20 px of breathing room. Chalk arrows with transition phrases connect adjacent panels in reading order (Panel 1 to 2, 2 to 3, 3 to 4, 4 to 5, 5 to 6).

**Color system:**
- Chalk white (#f0ece2): body text, labels, generic lines
- Steel blue (#8bb8e0): panel borders, headers, primary data
- Warm orange (#e8956a): key numbers, treatment effects, emphasis
- Teal (#00d4c8): positive highlights, preferred method markers
- Muted gray (#b0a89a): annotations, arrows, transition phrases
- Near black (navy #0e1545): background only

---

### Panel 1 (top-left): "THE PARALLEL TRENDS ASSUMPTION"

**Icon:** A chalk-drawn pair of parallel upward-sloping lines (one solid steel blue, one dashed warm orange) that diverge after a vertical dotted line labeled "Treatment." The divergence forms a gap labeled "ATT."

**Mini-viz:** Two trend lines on a small chalk coordinate axis (x = Time, y = Outcome). Before the vertical dotted line, both lines run parallel. After it, the orange treated line drops while the blue control line continues upward. The gap between them is shaded with chalk hatching.

**Text:** "DID identifies causal effects by comparing how outcomes change for treated vs. untreated groups. The key assumption: both groups would have followed the same trend absent treatment."

**Callout:** "ATT = ΔY treated - ΔY control" in warm orange chalk, medium-large, positioned below the mini-viz.

---

A chalk arrow connects to Panel 2, with the phrase "But what happens with staggered adoption?" in small muted gray chalk along the arrow.

---

### Panel 2 (top-center): "TWFE & FORBIDDEN COMPARISONS"

**Icon:** A chalk-drawn regression equation $Y_{it} = \theta_t + \eta_i + \alpha D_{it}$ with a large chalk "X" drawn over $\alpha$, and a warning triangle beside it.

**Mini-viz:** A chalk diagram showing three timeline bars for groups G=2004, G=2006, and Never-Treated. Red chalk "X" marks appear where TWFE compares already-treated group G=2004 against newly-treated group G=2006 --- the "forbidden comparison." Green check marks appear where the comparison uses never-treated units.

**Text:** "TWFE uses already-treated units as controls --- 'forbidden comparisons' that bias the estimate. With heterogeneous effects, some weights turn negative."

**Callout:** "TWFE = -0.038" in warm orange chalk, large, with a small downward arrow showing "biased toward zero."

---

A chalk arrow connects to Panel 3, with the phrase "Group-time ATTs fix the comparison problem" in small muted gray chalk along the arrow.

---

### Panel 3 (top-right): "CALLAWAY-SANT'ANNA GROUP-TIME ATTs"

**Icon:** A chalk-drawn 2x5 grid representing ATT(g,t) cells, with the G=2004 row and G=2006 row labeled, and post-treatment cells filled with steel blue shading.

**Mini-viz:** A chalk event study plot with event time on the x-axis (-3 to +3) and ATT on the y-axis. Pre-treatment dots cluster near zero. Post-treatment dots descend steeply: -0.024 at e=0, -0.067 at e=1, -0.123 at e=2, -0.131 at e=3. A horizontal dashed line at zero in chalk white. Confidence bands shown as chalk hatching.

**Text:** "Estimate ATT(g,t) for each group-time pair, then aggregate. Clean comparisons only: treated vs. never-treated. Effects deepen over time."

**Callout:** "Overall ATT = -0.057" in warm orange chalk, large, positioned prominently.

---

A chalk arrow connects to Panel 4, with the phrase "Why does TWFE get a different answer?" in small muted gray chalk along the arrow.

---

### Panel 4 (bottom-left): "TWFE WEIGHT DECOMPOSITION"

**Icon:** A chalk-drawn balance scale, tilted, with "Good weights" on one side (heavier, in teal) and "Bad weights" on the other (lighter, with a minus sign, in warm orange).

**Mini-viz:** A chalk scatter plot with Weight on the x-axis and ATT(g,t) on the y-axis. Blue dots represent post-treatment cells, orange dots represent pre-treatment cells that should have zero weight but don't. Teal diamond shapes show the proper ATT^O weights. A vertical line at x=0 and horizontal line at y=0 divide the plot into quadrants. Some orange dots sit to the left of zero --- negative weights.

**Text:** "64.2% of TWFE bias comes from pre-treatment contamination. 35.8% from misweighting post-treatment cells. Proper weights (teal diamonds) differ sharply from TWFE weights."

**Callout:** "64% bias from pre-treatment" in warm orange chalk, large, circled with chalk for emphasis.

---

A chalk arrow connects to Panel 5, with the phrase "Can covariates improve the parallel trends?" in small muted gray chalk along the arrow.

---

### Panel 5 (bottom-center): "DOUBLY ROBUST ESTIMATION"

**Icon:** A chalk-drawn shield with "DR" inside, flanked by two smaller icons: a regression line (outcome model) on the left and a propensity score curve (treatment model) on the right.

**Mini-viz:** A chalk comparison table with four rows and two columns:

| Method | ATT |
|--------|-----|
| Unconditional | -0.057 |
| Regression adj. | -0.064 |
| IPW | -0.065 |
| Doubly robust | -0.065 |

The doubly robust row is highlighted in teal (#00d4c8). All other rows in chalk white.

**Text:** "Condition on log population and log average pay. Three methods converge: the result is robust. Pre-trends improve after covariate adjustment."

**Callout:** "DR ATT = -0.065" in teal chalk, large, with a small check mark.

---

A chalk arrow connects to Panel 6, with the phrase "But how robust is this to PT violations?" in small muted gray chalk along the arrow.

---

### Panel 6 (bottom-right): "HONESTDID SENSITIVITY ANALYSIS"

**Icon:** A chalk-drawn magnifying glass examining a confidence interval that is stretching and widening, with question marks around the edges.

**Mini-viz:** A chalk sensitivity plot with $\bar{M}$ on the x-axis (0 to 2) and the confidence interval on the y-axis. At $\bar{M}=0$, the CI is tightly below zero (shown in teal). As $\bar{M}$ increases, the CI band widens. At $\bar{M} \approx 0.67$, the upper bound crosses zero (marked with a dashed orange line). Beyond that, the band continues to widen into both positive and negative territory.

**Text:** "How large can PT violations be before results break down? The effect stays significant if post-treatment violations are less than 67% of pre-treatment deviations. Beyond that, we cannot rule out zero."

**Callout:** "Breakdown: M-bar = 0.67" in warm orange chalk, large, with an arrow pointing to the crossing point.

---

**Enrichment elements:**

- **Professor's margin note** (bottom-right corner, outside the grid): In muted gray italic chalk, slightly tilted as if scrawled: "TWFE is not just a regression --- it's an identification strategy that requires careful attention." Signed with a small chalk "B.C. 2022" (Brantly Callaway).

- **Color legend** (bottom-left corner, small): Three small color swatches with labels: "Treated" in warm orange, "Control" in steel blue, "Preferred" in teal.

- **Faint background formulas** (scattered at 15% opacity in chalk white): $ATT(g,t) = E[Y_t(g) - Y_t(0) \mid G=g]$, $Y_{it} = \theta_t + \eta_i + \alpha D_{it} + v_{it}$, $ATT^O = \sum w^O(g,t) \cdot ATT(g,t)$, $\bar{M} \approx 0.67$.

- **Chalk dust and eraser smudges:** Light chalk particles floating near panel borders, and one or two faint eraser smudges in the background suggesting a recently used chalkboard.

**Text rendering guidance:** All text should appear as hand-lettered chalk on the navy background. Titles in small-caps. Numbers in warm orange. Body text in chalk white. Use slight irregularity in letter spacing and baseline to maintain the hand-drawn feel. No clean digital typography.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) --- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include human figures or faces.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "DIFFERENCE-IN-DIFFERENCES FOR POLICY EVALUATION" in steel blue small-caps, subtitle: "Can modern DID methods recover the true employment effect when states adopt policies at different times?" in italic chalk white. Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations.

Panel 1 (top-left): "THE PARALLEL TRENDS ASSUMPTION" --- two parallel trend lines diverging after treatment, callout "ATT = delta-Y treated minus delta-Y control" in orange. Panel 2 (top-center): "TWFE & FORBIDDEN COMPARISONS" --- timeline bars with X marks on bad comparisons, callout "TWFE = -0.038" in orange with "biased" note. Panel 3 (top-right): "CALLAWAY-SANT'ANNA GROUP-TIME ATTs" --- chalk event study plot from e=-3 to e=+3 descending post-treatment, callout "Overall ATT = -0.057" in orange. Panel 4 (bottom-left): "TWFE WEIGHT DECOMPOSITION" --- scatter plot with blue post-treatment dots, orange pre-treatment dots, teal diamonds for proper weights, callout "64% bias from pre-treatment" in orange. Panel 5 (bottom-center): "DOUBLY ROBUST ESTIMATION" --- comparison table with 4 methods, DR row highlighted teal, callout "DR ATT = -0.065" in teal. Panel 6 (bottom-right): "HONESTDID SENSITIVITY" --- widening CI band crossing zero at Mbar=0.67, callout "Breakdown: M-bar = 0.67" in orange.

Professor's margin note bottom-right: "TWFE is not just a regression --- it's an identification strategy." Color legend bottom-left. Faint background formulas: ATT(g,t), TWFE equation, ATT^O aggregation at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Section D: Panel Reference Data Appendix

### Panel 1: The Parallel Trends Assumption
- **Title text:** "THE PARALLEL TRENDS ASSUMPTION"
- **Key equation:** ATT = E[ΔY | D=1] - E[ΔY | D=0]
- **Visual:** Two parallel trend lines diverging after treatment
- **Callout:** "ATT = ΔY treated - ΔY control"
- **Transition to Panel 2:** "But what happens with staggered adoption?"

### Panel 2: TWFE & Forbidden Comparisons
- **Title text:** "TWFE & FORBIDDEN COMPARISONS"
- **Key equation:** Y_it = theta_t + eta_i + alpha * D_it + v_it
- **Key number:** TWFE coefficient = -0.038 (SE = 0.008)
- **Visual:** Timeline bars with forbidden comparison X marks
- **Callout:** "TWFE = -0.038"
- **Transition to Panel 3:** "Group-time ATTs fix the comparison problem"

### Panel 3: Callaway-Sant'Anna Group-Time ATTs
- **Title text:** "CALLAWAY-SANT'ANNA GROUP-TIME ATTs"
- **Key numbers:** ATT(e=0) = -0.024, ATT(e=1) = -0.067, ATT(e=2) = -0.123, ATT(e=3) = -0.131
- **Overall ATT:** -0.057 (SE = 0.008)
- **Group effects:** G=2004: -0.089, G=2006: -0.043
- **Visual:** Event study plot descending post-treatment
- **Callout:** "Overall ATT = -0.057"
- **Transition to Panel 4:** "Why does TWFE get a different answer?"

### Panel 4: TWFE Weight Decomposition
- **Title text:** "TWFE WEIGHT DECOMPOSITION"
- **Key numbers:** 64.2% of bias from pre-treatment contamination, 35.8% from post-treatment misweighting
- **TWFE estimate:** -0.038 vs ATT^O = -0.057 (bias = 0.019)
- **Visual:** Scatter plot of weights vs ATT(g,t)
- **Callout:** "64% bias from pre-treatment"
- **Transition to Panel 5:** "Can covariates improve the parallel trends?"

### Panel 5: Doubly Robust Estimation
- **Title text:** "DOUBLY ROBUST ESTIMATION"
- **Key numbers:** Unconditional -0.057, Reg adj. -0.064, IPW -0.065, DR -0.065
- **Covariates:** log population, log average pay
- **Visual:** Comparison table with DR highlighted in teal
- **Callout:** "DR ATT = -0.065"
- **Transition to Panel 6:** "But how robust is this to PT violations?"

### Panel 6: HonestDiD Sensitivity Analysis
- **Title text:** "HONESTDID SENSITIVITY ANALYSIS"
- **Key numbers:** Original CI = [-0.040, -0.007], Breakdown at Mbar = 0.67
- **Interpretation:** Effect stays significant if post-treatment PT violations < 67% of pre-treatment deviations
- **Visual:** Widening CI band crossing zero at Mbar = 0.67
- **Callout:** "Breakdown: M-bar = 0.67"
