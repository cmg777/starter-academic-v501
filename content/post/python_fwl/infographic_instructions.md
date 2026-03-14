# Making Multivariate Regressions Visible

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the naive coefficient of -0.106 that points in the wrong direction. Teal (#00d4c8) marks positive results like the true conditional coefficient of +0.267 recovered after partialling out income. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "MAKING MULTIVARIATE REGRESSIONS VISIBLE" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "What is regression really doing when it controls for a confounder?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE HIDDEN PROBLEM" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn scatter plot shows two crossing trend lines -- one sloping downward labeled "naive" in warm orange (#e8956a) and one sloping upward labeled "conditional" in teal (#00d4c8), representing the sign reversal. The phrase "The sign flips from negative to positive" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Regress sales on coupons and the coefficient says coupons hurt sales -- a negative slope of -0.106." and "But the true causal effect is +0.200. The confounder hides the real relationship behind a misleading trend." A chalk arrow connects to Panel 2 with the phrase "What's behind this reversal?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "THE CASE STUDY" in steel blue small-caps chalk lettering. Inside the panel, chalk-drawn storefront icons -- three small shop outlines with coupon tickets floating nearby -- represent the retail scenario. A chalk-drawn DAG shows three nodes: "Income" in warm orange (#e8956a) at the top with arrows pointing down to "Coupons" in steel blue (#8bb8e0) and "Sales" in teal (#00d4c8), plus a direct arrow from Coupons to Sales labeled "+0.200." The phrase "True ATE = +0.200" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "50 retail stores -- treatment: coupon usage, outcome: daily sales, confounder: neighborhood income." and "Wealthier neighborhoods use fewer coupons but spend more, creating a backdoor path that masks the true effect." A chalk arrow connects to Panel 3 with the phrase "How does FWL untangle this?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "THE PARTIALLING-OUT PROCEDURE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn eraser icon wipes the word "income" off two variables, leaving behind clean residual squiggles in chalk white. A chalk scatter plot shows vertical dashed residual arrows from data points to a fitted line, labeled "residuals = cleaned signal" in muted gray (#b0a89a). The phrase "Coefficient = 0.2673 exactly" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Regress coupons on income, extract residuals. Regress sales on income, extract residuals. Then regress cleaned sales on cleaned coupons." and "The coefficient matches the full multivariate regression to four decimal places -- not an approximation, an algebraic identity." A chalk arrow connects downward to Panel 4 with the phrase "See the reversal visually" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "NAIVE VS CONDITIONAL" in steel blue small-caps chalk lettering. Inside the panel, two side-by-side chalk-drawn mini scatter plots are the comparison visual: the left plot shows a downward-sloping line with data points in chalk white (#f0ece2) labeled "Naive" below, and the right plot shows an upward-sloping line with data points in teal (#00d4c8) labeled "FWL" below. Between the two plots, a large chalk arrow curves from the left plot to the right plot. The phrase "Simpson's paradox in action" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The naive scatter shows a downward slope -- coupons appear to hurt sales with a coefficient of -0.106." and "After partialling out income, the scatter reveals an upward slope of +0.267 -- coupons genuinely boost sales by $267 per percentage point." A chalk arrow connects to Panel 5 with the phrase "But there's a subtlety..." in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "RESIDUALIZE BOTH OR PAY THE PRICE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn warning triangle with an exclamation mark represents the danger of incomplete residualization. Two chalk bars stand side by side: a short bar labeled "Full FWL: 0.118" highlighted in teal (#00d4c8) and a very tall bar labeled "Partial: 1.271" in warm orange (#e8956a), the tall bar roughly 10 times the height of the short one, illustrating the standard error explosion. The phrase "SE explodes 10.6x" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Residualizing only coupons gives the right coefficient (0.2673) but the standard error balloons from 0.120 to 1.271." and "Residualizing both variables restores correct inference -- SE drops to 0.118, p-value from 0.834 to 0.028." A chalk arrow connects to Panel 6 with the phrase "Why does all this matter?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "BOTTOM LINE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn bridge connects two cliff edges: the left cliff is labeled "FWL" in steel blue (#8bb8e0) and the right cliff is labeled "DML" in teal (#00d4c8), with the bridge labeled "replace OLS with ML" in muted gray (#b0a89a). Below the bridge, a chalk flowchart shows two paths: "Linear confounders?" leading to "FWL + OLS" in chalk white (#f0ece2), and "Nonlinear confounders?" leading to "FWL + ML = DML" circled in teal (#00d4c8). The phrase "FWL is the engine inside Double Machine Learning" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "FWL turns any multivariate regression into a visualizable bivariate scatter -- powerful for communicating causal results." and "Replace OLS with random forests or lasso in the partialling-out step, and you get Double Machine Learning."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "The coefficient is always exact -- FWL is an identity, not an approximation. Only the standard errors depend on residualizing both sides!" A hand-drawn chalk arrow points from the note toward Panel 5. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Causal effect", a warm orange (#e8956a) dot labeled "Confounding / bias", and a chalk white (#f0ece2) dot labeled "Data / method."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "y = beta-1 x-1 + beta-2 x-2 + epsilon" and "beta-hat-1 = Cov(y-tilde, x-tilde-1) / Var(x-tilde-1)" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of scatter plots with trend lines, eraser marks, and residual arrows appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include real retail product imagery or brand logos.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "MAKING MULTIVARIATE REGRESSIONS VISIBLE" in steel blue small-caps, subtitle: "What is regression really doing when it controls for a confounder?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE HIDDEN PROBLEM" -- chalk scatter with two crossing trend lines (naive down, conditional up), orange callout "The sign flips from negative to positive." Panel 2 (top-center): "THE CASE STUDY" -- chalk storefronts and DAG (Income -> Coupons, Income -> Sales, Coupons -> Sales), teal "True ATE = +0.200." Panel 3 (top-right): "THE PARTIALLING-OUT PROCEDURE" -- chalk eraser wiping "income" off variables, residual arrows on scatter, orange "Coefficient = 0.2673 exactly." Panel 4 (bottom-left): "NAIVE VS CONDITIONAL" -- two side-by-side mini scatters, left downward slope (white) vs right upward slope (teal), orange "Simpson's paradox in action." Panel 5 (bottom-center): "RESIDUALIZE BOTH OR PAY THE PRICE" -- warning triangle, two bars: short teal "Full FWL: 0.118" vs tall orange "Partial: 1.271", orange "SE explodes 10.6x." Panel 6 (bottom-right): "BOTTOM LINE" -- chalk bridge from "FWL" to "DML", flowchart: linear -> FWL+OLS, nonlinear -> FWL+ML=DML (teal circle), orange "FWL is the engine inside Double Machine Learning." Professor's margin note bottom-right: "The coefficient is always exact -- only the SEs depend on residualizing both sides!" with arrow toward Panel 5. Color legend bottom-left: Causal effect: teal, Confounding: orange, Data: white. Faint background formulas: y = beta-1 x-1 + beta-2 x-2 + epsilon, beta-hat-1 = Cov(y-tilde, x-tilde-1)/Var(x-tilde-1) at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Hidden Problem

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "The sign flips from negative to positive"
- **Key number**: Sign reversal: -0.106 (naive) vs +0.267 (conditional)
- **Body sentences**:
  - Regress sales on coupons and the coefficient says coupons hurt sales -- a negative slope of -0.106.
  - But the true causal effect is +0.200. The confounder hides the real relationship behind a misleading trend.
- **Icon**: Chalk-drawn scatter plot with two crossing trend lines -- one downward (naive, warm orange) and one upward (conditional, teal)
- **Mini-viz**: Two trend lines crossing in a scatter plot: downward line labeled "naive" in warm orange, upward line labeled "conditional" in teal
- **Connector to next**: "What's behind this reversal?"

### Panel 2 -- The Case Study

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "True ATE = +0.200"
- **Key number**: +0.200 (true causal effect of coupons on sales)
- **Body sentences**:
  - 50 retail stores -- treatment: coupon usage, outcome: daily sales, confounder: neighborhood income.
  - Wealthier neighborhoods use fewer coupons but spend more, creating a backdoor path that masks the true effect.
- **Icon**: Chalk-drawn storefront icons (three small shop outlines) with coupon tickets floating nearby
- **Mini-viz**: Chalk DAG with three nodes: Income (warm orange) at top with arrows to Coupons (steel blue) and Sales (teal), plus direct arrow from Coupons to Sales labeled "+0.200"
- **Connector to next**: "How does FWL untangle this?"

### Panel 3 -- The Partialling-Out Procedure

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "Coefficient = 0.2673 exactly"
- **Key number**: 0.2673 (FWL coefficient, identical to full OLS)
- **Body sentences**:
  - Regress coupons on income, extract residuals. Regress sales on income, extract residuals. Then regress cleaned sales on cleaned coupons.
  - The coefficient matches the full multivariate regression to four decimal places -- not an approximation, an algebraic identity.
- **Icon**: Chalk-drawn eraser wiping the word "income" off two variables, leaving clean residual squiggles
- **Mini-viz**: Chalk scatter with vertical dashed residual arrows from data points to a fitted line, labeled "residuals = cleaned signal"
- **Connector to next**: "See the reversal visually"

### Panel 4 -- Naive vs Conditional

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "Simpson's paradox in action"
- **Key number**: Slope reversal from -0.106 to +0.267
- **Body sentences**:
  - The naive scatter shows a downward slope -- coupons appear to hurt sales with a coefficient of -0.106.
  - After partialling out income, the scatter reveals an upward slope of +0.267 -- coupons genuinely boost sales by $267 per percentage point.
- **Icon**: Two side-by-side chalk mini scatter plots with contrasting slopes
- **Mini-viz**: Left plot: downward-sloping line with data points in chalk white, labeled "Naive." Right plot: upward-sloping line with data points in teal, labeled "FWL." Large curved arrow between them.
- **Connector to next**: "But there's a subtlety..."

### Panel 5 -- Residualize Both or Pay the Price

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "SE explodes 10.6x"
- **Key number**: Standard error: 0.118 (full FWL) vs 1.271 (partial), a 10.6x increase
- **Body sentences**:
  - Residualizing only coupons gives the right coefficient (0.2673) but the standard error balloons from 0.120 to 1.271.
  - Residualizing both variables restores correct inference -- SE drops to 0.118, p-value from 0.834 to 0.028.
- **Icon**: Chalk-drawn warning triangle with exclamation mark
- **Mini-viz**: Two chalk bars side by side: short bar labeled "Full FWL: 0.118" in teal and very tall bar labeled "Partial: 1.271" in warm orange, tall bar roughly 10x the height
- **Connector to next**: "Why does all this matter?"

### Panel 6 -- Bottom Line

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "FWL is the engine inside Double Machine Learning"
- **Key number**: FWL + ML = DML (the modern extension)
- **Body sentences**:
  - FWL turns any multivariate regression into a visualizable bivariate scatter -- powerful for communicating causal results.
  - Replace OLS with random forests or lasso in the partialling-out step, and you get Double Machine Learning.
- **Icon**: Chalk-drawn bridge connecting two cliff edges: "FWL" (steel blue) on the left and "DML" (teal) on the right
- **Mini-viz**: Chalk flowchart: "Linear confounders?" -> "FWL + OLS" in chalk white, "Nonlinear confounders?" -> "FWL + ML = DML" circled in teal
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "The coefficient is always exact -- FWL is an identity, not an approximation. Only the standard errors depend on residualizing both sides!" -- positioned bottom-right margin, with arrow toward Panel 5
- **Color legend**: Causal effect: teal, Confounding / bias: warm orange, Data / method: chalk white
- **Background formulas**: y = beta-1 x-1 + beta-2 x-2 + epsilon, beta-hat-1 = Cov(y-tilde, x-tilde-1) / Var(x-tilde-1) at 15-20% opacity
