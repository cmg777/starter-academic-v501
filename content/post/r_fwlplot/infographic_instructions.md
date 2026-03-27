# Visualizing Regression with the FWL Theorem

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the naive coefficient of -0.093 that wrongly suggests coupons hurt sales. Teal (#00d4c8) marks positive results like the corrected coefficient of +0.212 that recovers the true causal effect. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "VISUALIZING REGRESSION WITH THE FWL THEOREM" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "What does 'controlling for' a variable actually look like?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE CONFOUNDING TRAP" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn DAG shows three nodes -- "Income" at the top in warm orange, "Coupons" at the bottom-left in steel blue, and "Sales" at the bottom-right in teal -- with arrows from Income to both Coupons (-0.5) and Sales (+0.3), and an arrow from Coupons to Sales (+0.2), representing the backdoor path that confounds the naive estimate. The phrase "True effect: +0.2 but hidden" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Income confounds the coupon-sales relationship -- wealthier areas get fewer coupons but have higher baseline sales" and "A naive regression sees coupons and lower sales together, producing a misleading negative slope." A chalk arrow connects to Panel 2 with the phrase "What does the naive analysis show?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "NAIVE VS. CONTROLLED" in steel blue small-caps chalk lettering. Inside the panel, two small chalk-drawn scatter plots sit side by side: the left scatter shows a downward-sloping line through a cloud of dots labeled "-0.093" in warm orange (#e8956a), and the right scatter shows an upward-sloping line through a cloud of dots labeled "+0.212" in teal (#00d4c8), with a curved reversal arrow between them. The phrase "Slope flips from -0.093 to +0.212" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "One line of code -- fwl_plot() -- residualizes both axes on income, revealing the true positive effect" and "R-squared jumps from 0.028 to 0.321 once the confounder is controlled." A chalk arrow connects to Panel 3 with the phrase "How does it work under the hood?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "THE THREE-STEP RECIPE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn vertical sequence of three numbered steps appears: "1. Regress Y on controls" with a small arrow pointing to "residuals," "2. Regress X on controls" with a small arrow pointing to "residuals," and "3. Regress residuals on residuals" with the final arrow pointing to a boxed coefficient. A small chalk equals sign connects two numbers: "feols: 0.212288" and "manual: 0.212288" with a teal (#00d4c8) checkmark between them. The phrase "Match to 6 decimal places" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Partial out the controls from both Y and X, then run simple OLS on the leftovers" and "This is not an approximation -- it is an exact algebraic identity that every regression implicitly performs." A chalk arrow connects downward to Panel 4 with the phrase "Can we predict the bias?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "OMITTED VARIABLE BIAS" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn comparison visual shows two side-by-side elements: on the left, a small formula "bias = gamma x delta" with the values "0.300 x (-0.494)" written below, and on the right, two horizontal bars -- a taller bar labeled "True: +0.212" in teal (#00d4c8) and a shorter bar dipping below zero labeled "Naive: -0.093" in warm orange (#e8956a), with a bracket between them labeled "OVB = -0.148." The phrase "0.300 x -0.494 = -0.148" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The OVB formula predicts the exact direction and magnitude of confounding bias" and "If you know how the confounder affects both treatment and outcome, you know which way the naive estimate errs." A chalk arrow connects to Panel 5 with the phrase "What about high-dimensional controls?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "FIXED EFFECTS AS FWL" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn progression of three small scatter clouds appears left to right, each progressively tighter and more compact: the first labeled "No FE" with a wide cloud, the second labeled "Origin FE" with a medium cloud, and the third labeled "+ Dest FE" with a tight narrow cloud, connected by small arrows. A chalk-drawn airplane icon in chalk white sits above the scatter progression. The phrase "317,578 flights demeaned" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Fixed effects are FWL applied to group dummies -- demeaning subtracts each group's average" and "Adding origin + destination FE collapses the scatter to within-route variation only." A chalk arrow connects to Panel 6 with the phrase "What about panel data?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "WITHIN-PERSON RETURNS" in steel blue small-caps chalk lettering. Inside the panel, two chalk-drawn scatter plots sit side by side: the left scatter shows a shallow upward line labeled "Pooled: 0.03" in chalk white (#f0ece2), and the right scatter shows a steep upward line labeled "Within: 0.122" in teal (#00d4c8), with a large "4x" annotation in warm orange between them. A chalk-drawn stick figure with a briefcase icon represents the worker panel. The phrase "Slope jumps from 0.03 to 0.122" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "545 individuals over 8 years -- individual FE strips away unobserved ability differences" and "The within-person return to experience is four times larger than the naive pooled estimate."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "Every multiple regression coefficient can be visualized as a bivariate scatter -- just partial out the controls first!" A hand-drawn chalk arrow points from the note toward Panel 3. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "True / corrected effect", a warm orange (#e8956a) dot labeled "Bias / naive estimate", and a chalk white (#f0ece2) dot labeled "Data / controls."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "beta_1 = (X_1'M X_1)^-1 X_1'M Y" and "bias = gamma x delta" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of scatter plots with regression lines, residual arrows, and small DAG fragments appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include R or RStudio logos or interface elements.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "VISUALIZING REGRESSION WITH THE FWL THEOREM" in steel blue small-caps, subtitle: "What does 'controlling for' a variable actually look like?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE CONFOUNDING TRAP" -- chalk DAG with Income/Coupons/Sales nodes and backdoor path arrows, orange "True effect: +0.2 but hidden." Panel 2 (top-center): "NAIVE VS. CONTROLLED" -- two side-by-side scatter plots, left with downward slope -0.093 (orange), right with upward slope +0.212 (teal), reversal arrow between them, orange "Slope flips from -0.093 to +0.212." Panel 3 (top-right): "THE THREE-STEP RECIPE" -- three numbered steps with residual arrows leading to boxed coefficient, teal checkmark between feols and manual values, teal "Match to 6 decimal places." Panel 4 (bottom-left): "OMITTED VARIABLE BIAS" -- formula "0.300 x -0.494 = -0.148" with two comparison bars (True +0.212 in teal, Naive -0.093 in orange), orange "0.300 x -0.494 = -0.148." Panel 5 (bottom-center): "FIXED EFFECTS AS FWL" -- three progressively tighter scatter clouds (No FE, Origin FE, +Dest FE) with chalk airplane, orange "317,578 flights demeaned." Panel 6 (bottom-right): "WITHIN-PERSON RETURNS" -- two scatters, shallow pooled 0.03 vs steep within 0.122 with "4x" annotation, teal "Slope jumps from 0.03 to 0.122." Professor's margin note bottom-right: "Every coefficient can be visualized as a bivariate scatter -- just partial out the controls!" with arrow toward Panel 3. Color legend bottom-left: True effect: teal, Bias: orange, Data: white. Faint background formulas: beta_1 = (X_1'M X_1)^-1 X_1'M Y, bias = gamma x delta at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Confounding Trap

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "True effect: +0.2 but hidden"
- **Key number**: +0.2 true causal effect masked by confounding
- **Body sentences**:
  - Income confounds the coupon-sales relationship -- wealthier areas get fewer coupons but have higher baseline sales.
  - A naive regression sees coupons and lower sales together, producing a misleading negative slope.
- **Icon**: Chalk-drawn DAG with three nodes (Income, Coupons, Sales) and backdoor path arrows with coefficients
- **Mini-viz**: DAG with arrows labeled -0.5, +0.3, and +0.2 showing the confounding structure
- **Connector to next**: "What does the naive analysis show?"

### Panel 2 -- Naive vs. Controlled

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "Slope flips from -0.093 to +0.212"
- **Key number**: -0.093 naive coefficient reverses to +0.212 after controlling for income
- **Body sentences**:
  - One line of code -- fwl_plot() -- residualizes both axes on income, revealing the true positive effect.
  - R-squared jumps from 0.028 to 0.321 once the confounder is controlled.
- **Icon**: Two side-by-side scatter plots with a curved reversal arrow between them
- **Mini-viz**: Left scatter with downward slope labeled "-0.093" in orange, right scatter with upward slope labeled "+0.212" in teal
- **Connector to next**: "How does it work under the hood?"

### Panel 3 -- The Three-Step Recipe

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "Match to 6 decimal places"
- **Key number**: 0.212288 -- feols and manual FWL coefficients match exactly
- **Body sentences**:
  - Partial out the controls from both Y and X, then run simple OLS on the leftovers.
  - This is not an approximation -- it is an exact algebraic identity that every regression implicitly performs.
- **Icon**: Chalk-drawn vertical three-step sequence with arrows and residual labels
- **Mini-viz**: Two numbers "feols: 0.212288" and "manual: 0.212288" connected by a teal checkmark
- **Connector to next**: "Can we predict the bias?"

### Panel 4 -- Omitted Variable Bias

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "0.300 x -0.494 = -0.148"
- **Key number**: -0.148 predicted bias from the OVB formula
- **Body sentences**:
  - The OVB formula predicts the exact direction and magnitude of confounding bias.
  - If you know how the confounder affects both treatment and outcome, you know which way the naive estimate errs.
- **Icon**: Chalk-drawn formula "bias = gamma x delta" with numerical substitution
- **Mini-viz**: Two horizontal bars -- "True: +0.212" in teal and "Naive: -0.093" in warm orange, with bracket labeled "OVB = -0.148"
- **Connector to next**: "What about high-dimensional controls?"

### Panel 5 -- Fixed Effects as FWL

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "317,578 flights demeaned"
- **Key number**: 317,578 observations across 3 origins and 103 destinations
- **Body sentences**:
  - Fixed effects are FWL applied to group dummies -- demeaning subtracts each group's average.
  - Adding origin + destination FE collapses the scatter to within-route variation only.
- **Icon**: Chalk-drawn airplane
- **Mini-viz**: Three progressively tighter scatter clouds labeled "No FE," "Origin FE," and "+ Dest FE" connected by small arrows
- **Connector to next**: "What about panel data?"

### Panel 6 -- Within-Person Returns

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "Slope jumps from 0.03 to 0.122"
- **Key number**: 0.03 pooled slope vs 0.122 within-person -- a 4x increase
- **Body sentences**:
  - 545 individuals over 8 years -- individual FE strips away unobserved ability differences.
  - The within-person return to experience is four times larger than the naive pooled estimate.
- **Icon**: Chalk-drawn stick figure with briefcase representing the worker panel
- **Mini-viz**: Two scatter plots -- left with shallow line "Pooled: 0.03," right with steep line "Within: 0.122," with "4x" annotation in warm orange
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "Every multiple regression coefficient can be visualized as a bivariate scatter -- just partial out the controls first!" -- positioned bottom-right margin, with arrow toward Panel 3
- **Color legend**: True / corrected effect: teal, Bias / naive estimate: warm orange, Data / controls: chalk white
- **Background formulas**: beta_1 = (X_1'M X_1)^-1 X_1'M Y, bias = gamma x delta at 15-20% opacity
