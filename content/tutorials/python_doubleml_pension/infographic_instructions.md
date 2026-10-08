# Double Machine Learning: When Naive Savings Estimates Lie

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6).

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers like the $19,559 naive estimate and the 124% overstated bias. Teal (#00d4c8) marks the corrected DML estimates like the $8,730 ATE. Muted chalk gray (#b0a89a) appears on connector arrows and background annotations.

The title banner reads "DOUBLE ML: WHEN NAIVE SAVINGS ESTIMATES LIE" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Does 401(k) access cause more savings, or do savers just have more 401(k) access?"

Panel 1 (top-left): Title "THE SAVINGS ILLUSION" in steel blue small-caps. A large chalk-drawn magnifying glass hovers over two stick-figure groups -- one group with a dollar sign above their heads (eligible), one without -- revealing a hidden link labeled "income" between the groups that connects both to a piggy bank. Callout: "Correlation is not causation" in warm orange. Chalk arrow to Panel 2.

Panel 2 (top-center): Title "9,915 HOUSEHOLDS" in steel blue small-caps. A chalk-drawn cluster of tally marks in groups of five representing the sample, with a diagonal dividing line: 37% on one side highlighted in steel blue (eligible) and 63% on the other in chalk white (ineligible). Callout: "$19,559 naive gap" in large warm orange chalk. Chalk arrow to Panel 3.

Panel 3 (top-right): Title "PARTIALLING OUT BIAS" in steel blue small-caps. A chalk-drawn pair of noise-canceling headphones with wavy "confounding noise" lines on the outside being blocked, leaving a clean signal wave passing through the center. Callout: "ML strips the noise" in warm orange. Chalk arrow down to Panel 4.

Panel 4 (bottom-left): Title "NAIVE vs DEBIASED" in steel blue small-caps. Two chalk-drawn containers side by side at very different heights -- a tall wide beaker labeled "Naive" in warm orange reaching high and a shorter beaker labeled "DML" in teal at roughly half the height -- the dramatic size difference shows how much bias inflated the naive estimate. A dashed line at the DML height is labeled "~$8,500 ATE." Callout: "$8,730 true ATE" in large teal chalk. Chalk arrow to Panel 5.

Panel 5 (bottom-center): Title "COMPLIERS GAIN MORE" in steel blue small-caps. A chalk-drawn staircase with two steps: the lower step labeled "ATE" at one height, and a taller step labeled "LATE" reaching higher -- showing that compliers benefit more than the average household. Callout: "$11,746 for compliers" in large warm orange chalk. Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "DEBIASED POLICY ANSWERS" in steel blue small-caps. A chalk-drawn shield with a checkmark inside, with four small arrows bouncing off it -- each arrow labeled with a different ML learner name (Lasso, RF, Tree, XGB) -- showing the results are robust across methods. Callout: "Naive estimate: 124% inflated" in warm orange.

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "The naive estimate is more than double the true causal effect!" A hand-drawn chalk arrow points from the note toward Panel 4. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Causal effect (ATE)", a warm orange (#e8956a) dot labeled "Bias / naive estimate", and a chalk white (#f0ece2) dot labeled "Data / method."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "Y = theta * D + g(X) + epsilon" and "theta = E[D*Y/m(X) - (1-D)*Y/(1-m(X))]" are scattered across the background. Chalk-style silhouettes of dollar signs and bracket symbols appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks add tactile realism.

This prompt generates the base image. The AI should render clearly: the title banner, 6 panel titles in steel blue, 6 central sketch illustrations, 3 key numbers in large warm orange or teal chalk ($19,559, $8,730, $11,746), and 3 callout phrases. All other text -- body sentences, annotations, transition phrases -- is provided in the panel reference data for the user to overlay manually in an image editor. Keep text elements minimal and large for legibility.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not render precise statistical charts, axis labels, or data tables. Do not attempt to render more than 3 text elements per panel. Do not include photographs of actual retirement accounts, bank statements, or financial documents.

---

## Condensed Prompt (~200 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote, hand-lettered text, chalk dust, faint formula textures. Six panels in 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "DOUBLE ML: WHEN NAIVE SAVINGS ESTIMATES LIE" in steel blue small-caps, subtitle: "Does 401(k) access cause more savings, or do savers just have more 401(k) access?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body, warm orange (#e8956a) key numbers, teal (#00d4c8) highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE SAVINGS ILLUSION" -- magnifying glass over two groups revealing hidden income link, callout "Correlation is not causation" in orange. Panel 2 (top-center): "9,915 HOUSEHOLDS" -- tally marks split 37%/63%, orange "$19,559 naive gap." Panel 3 (top-right): "PARTIALLING OUT BIAS" -- noise-canceling headphones blocking confounding waves, orange "ML strips the noise." Panel 4 (bottom-left): "NAIVE vs DEBIASED" -- two containers at different heights (tall Naive in orange, short DML in teal), teal "$8,730 true ATE." Panel 5 (bottom-center): "COMPLIERS GAIN MORE" -- staircase with ATE step and taller LATE step, orange "$11,746 for compliers." Panel 6 (bottom-right): "DEBIASED POLICY ANSWERS" -- shield with checkmark, four arrows bouncing off, orange "Naive estimate: 124% inflated." Professor's note bottom-right: "The naive estimate is more than double the true causal effect!" Legend bottom-left: ATE (teal), bias (orange), data (white). Faint formulas: Y = theta*D + g(X) + epsilon at 15% opacity. No photorealism, no gradients, no precise charts, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Savings Illusion

- **Position**: Row 1, Column 1 (top-left)
- **Dramatic function**: Hook
- **Story beat**: "401(k) holders save more -- but is it the plan or the person?"
- **Callout**: "Correlation is not causation"
- **Key number**: N/A (conceptual panel)
- **Central sketch**: Chalk-drawn magnifying glass over two stick-figure groups, revealing a hidden "income" link between eligibility and savings
- **Body sentences** (for manual overlay):
  - Eligible households have $19,559 more in net financial assets -- but they also earn $15,368 more in income.
  - Income confounds the comparison, inflating the apparent benefit of 401(k) access.
- **Transition to next**: "Let's look at the data"

### Panel 2 -- 9,915 Households

- **Position**: Row 1, Column 2 (top-center)
- **Dramatic function**: Stakes
- **Story beat**: "9,915 households, one massive confounding problem"
- **Callout**: "$19,559 naive gap"
- **Key number**: $19,559 naive difference-in-means for eligibility
- **Central sketch**: Chalk-drawn tally marks divided diagonally -- 37% eligible (steel blue) vs 63% ineligible (chalk white)
- **Body sentences** (for manual overlay):
  - 1991 SIPP data: 9,915 U.S. households, 37% eligible for 401(k) plans.
  - The naive $19,559 gap conflates the causal effect with pre-existing income differences.
- **Transition to next**: "How does DML fix this?"

### Panel 3 -- Partialling Out Bias

- **Position**: Row 1, Column 3 (top-right)
- **Dramatic function**: Attempt
- **Story beat**: "DML uses ML to cancel confounding noise"
- **Callout**: "ML strips the noise"
- **Key number**: N/A (method panel)
- **Central sketch**: Chalk-drawn noise-canceling headphones with wavy confounding lines blocked outside and a clean signal wave passing through the center
- **Body sentences** (for manual overlay):
  - Double ML partials out confounders with flexible ML models, then estimates the causal effect on cleaned residuals.
  - Cross-fitting prevents overfitting: each fold's residuals come from a model that never saw that fold.
- **Transition to next**: "What do three different models find?"

### Panel 4 -- Three Models Agree

- **Position**: Row 2, Column 1 (bottom-left)
- **Dramatic function**: Twist
- **Story beat**: "DML cuts the naive estimate in half"
- **Callout**: "$8,730 true ATE"
- **Key number**: $8,730 PLR mean ATE (range $7,823--$9,371)
- **Central sketch**: Two chalk-drawn containers at very different heights -- tall wide "Naive" beaker in warm orange vs shorter "DML" beaker in teal, with dramatic size contrast
- **Body sentences** (for manual overlay):
  - PLR estimates ATE at $8,730 -- less than half the naive $19,559.
  - IRM confirms at $8,213 using propensity scores -- different method, same answer.
  - The $10,829 gap between naive and DML is pure confounding bias.
- **Transition to next**: "But compliers tell a different story"

### Panel 5 -- Compliers Gain More

- **Position**: Row 2, Column 2 (bottom-center)
- **Dramatic function**: Surprise
- **Story beat**: "Marginal participants benefit more than the average household"
- **Callout**: "$11,746 for compliers"
- **Key number**: $11,746 IIVM mean LATE
- **Central sketch**: Chalk-drawn staircase with two steps -- lower step labeled "ATE" and taller step labeled "LATE" reaching higher
- **Body sentences** (for manual overlay):
  - The IIVM identifies the LATE: $11,746 for compliers -- substantially larger than the ~$8,500 ATE.
  - Compliers are households who participate because eligible but would not otherwise -- marginal savers gain the most.
- **Transition to next**: "So what's the bottom line?"

### Panel 6 -- Debiased Policy Answers

- **Position**: Row 2, Column 3 (bottom-right)
- **Dramatic function**: Resolution
- **Story beat**: "Results hold across four ML learners"
- **Callout**: "Naive estimate: 124% inflated"
- **Key number**: 124% overstated by naive estimate
- **Central sketch**: Chalk-drawn shield with checkmark inside, four small arrows (Lasso, RF, Tree, XGB) bouncing off, showing robustness
- **Body sentences** (for manual overlay):
  - Four ML learners (Lasso, Random Forest, Decision Trees, XGBoost) all agree within $1,548 for PLR.
  - 401(k) eligibility genuinely boosts savings by ~$8,500 (ATE), while marginal participants gain ~$12,000 (LATE).
  - Expanding 401(k) access works -- but the effect is half what naive comparisons suggest.
- **Transition to next**: N/A (final panel)

### Story Spine

> Double Machine Learning reveals that 401(k) eligibility genuinely boosts savings by $8,730 -- not $19,559 -- by showing that income confounding inflates naive estimates by 124%, challenging the assumption that simple comparisons capture causal effects.

### Margin Elements

- **Professor's note**: "The naive estimate is more than double the true causal effect!" -- positioned bottom-right margin, with arrow toward Panel 4
- **Color legend**: Causal effect (ATE): teal, Bias / naive estimate: warm orange, Data / method: chalk white
- **Background formulas**: Y = theta * D + g(X) + epsilon, theta = E[D*Y/m(X) - (1-D)*Y/(1-m(X))] at 15-20% opacity
