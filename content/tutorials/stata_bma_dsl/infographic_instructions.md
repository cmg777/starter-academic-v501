# Taming Model Uncertainty with BMA and Double-Selection LASSO

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the coefficient instability where b1 shifts from -7.498 to -7.131 depending on which controls are included. Teal (#00d4c8) marks positive results like BMA recovering 6 of 8 true predictors with zero false positives. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "TAMING MODEL UNCERTAINTY WITH BMA AND DOUBLE-SELECTION LASSO" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Which of 4,096 models should you trust?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE EKC HYPOTHESIS" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn curve traces an inverted-N shape across three labeled phases: a downward slope labeled "Phase 1" on the left, a rising hump labeled "Phase 2" in the center, and a falling slope labeled "Phase 3" on the right, with the x-axis labeled "Income" and the y-axis labeled "Pollution." The phrase "3 phases: fall, rise, fall again" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The Environmental Kuznets Curve predicts pollution first rises with industrialization, then falls as countries grow wealthy" and "A cubic polynomial tests for this inverted-N shape -- requiring b1 < 0, b2 > 0, b3 < 0." A chalk arrow connects to Panel 2 with the phrase "But which controls belong in the model?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "SYNTHETIC DATA WITH AN ANSWER KEY" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn grid of small rectangles represents the panel dataset, with a label "80 countries x 20 years" beneath it. To the right, a chalk-drawn checklist shows 12 rows, where 5 rows have checkmarks in teal (#00d4c8) labeled "True" and 7 rows have X marks in muted gray (#b0a89a) labeled "Noise." The phrase "12 controls, 4,096 possible models" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "N = 1,600 observations from a synthetic panel with a known DGP -- 5 true predictors and 7 noise variables" and "True DGP: b1 = -7.1, b2 = 0.81, b3 = -0.03 producing turning points at $1,895 and $34,647." A chalk arrow connects to Panel 3 with the phrase "What happens when we change controls?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "COEFFICIENT INSTABILITY" in steel blue small-caps chalk lettering. Inside the panel, two chalk-drawn vertical bars stand side by side representing the within R-squared: a short bar labeled "0.40" in chalk white (#f0ece2) and a tall bar labeled "0.73" in steel blue (#8bb8e0), with an upward arrow between them. Below, a chalk-drawn number line shows b1 shifting from -7.498 on the left to -7.131 on the right, with a wavy arrow connecting them. The phrase "b1 shifts from -7.498 to -7.131" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Adding all 12 controls raises within R-squared from 0.40 to 0.73 -- the controls carry real explanatory power" and "But coefficients shift depending on which controls are included -- this is model uncertainty." A chalk arrow connects downward to Panel 4 with the phrase "How do BMA and DSL handle this?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "BMA VS. DOUBLE-SELECTION LASSO" in steel blue small-caps chalk lettering. Inside the panel, two columns are drawn side by side. The left column is labeled "BMA" in steel blue (#8bb8e0) with chalk-drawn icons: a stack of model boxes labeled "4,096 models," a bar chart showing PIPs, and the text "Minutes" with a small clock icon. The right column is labeled "DSL" in teal (#00d4c8) with chalk-drawn icons: a funnel labeled "LASSO selects," the text "100/112 controls," and "Seconds" with a lightning bolt icon. Both columns converge at the bottom to a shared result: "b1 ~ -7.1, inverted-N confirmed" in chalk white. The phrase "Two roads to the same answer" appears in large teal (#00d4c8) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "BMA averages across models, weighting by fit -- PIPs flag fossil fuel (1.000), industry (0.999), renewable (0.959)" and "DSL runs in seconds, selecting 100 of 112 controls via LASSO penalty." A chalk arrow connects to Panel 5 with the phrase "Did they find the right variables?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "THE ANSWER KEY VERDICT" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn scorecard shows two rows: "True positives: 6/8" with a large checkmark in teal (#00d4c8), and "False positives: 0/7" with a circle-slash icon in teal (#00d4c8). Below, two small X marks in warm orange (#e8956a) appear next to "urban (0.007)" and "democracy (-0.005)" labeled "Weak signals missed." The phrase "6 of 8 recovered, zero false alarms" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "BMA correctly identifies 3 GDP terms plus fossil fuel, industry, and renewable energy -- all with PIP above 0.95" and "The two misses have tiny true coefficients: urban (0.007) and democracy (-0.005) -- genuinely hard to detect." A chalk arrow connects to Panel 6 with the phrase "So when should you use each method?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "BOTTOM LINE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn decision tree shows two branches: "Which variables matter?" leading to "BMA (PIPs, densities, variable maps)" in steel blue (#8bb8e0), and "Fast valid inference?" leading to "DSL (seconds, robust SEs)" in teal (#00d4c8). Below the tree, a chalk-drawn inverted-N curve with two turning point markers appears, labeled "$2,400 min" and "$27,000 max" in warm orange (#e8956a). The phrase "Method convergence: both confirm the inverted-N" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Use BMA when you need to know which variables matter -- PIPs give granular variable-level evidence" and "Use DSL for fast, valid coefficient estimates -- it runs in seconds with standard frequentist inference."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "With 4,096 models to choose from, the worst strategy is picking just one!" A hand-drawn chalk arrow points from the note toward Panel 2. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "True predictors / confirmed", a warm orange (#e8956a) dot labeled "Instability / misses", and a chalk white (#f0ece2) dot labeled "Data / methods."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "P(M_k|data) = P(data|M_k)P(M_k) / Sum P(data|M_l)P(M_l)", "PIP_j = Sum P(M_k|data)", and "min beta { RSS + lambda Sum |beta_j| }" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of stacked model boxes, a magnifying glass over a checklist, and a LASSO lariat appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "TAMING MODEL UNCERTAINTY WITH BMA AND DOUBLE-SELECTION LASSO" in steel blue small-caps, subtitle: "Which of 4,096 models should you trust?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE EKC HYPOTHESIS" -- chalk inverted-N curve with three labeled phases, orange "3 phases: fall, rise, fall again." Panel 2 (top-center): "SYNTHETIC DATA WITH AN ANSWER KEY" -- chalk grid for 80 countries x 20 years, checklist with 5 true and 7 noise, orange "12 controls, 4,096 models." Panel 3 (top-right): "COEFFICIENT INSTABILITY" -- two R-squared bars (0.40 vs 0.73), number line showing b1 shift, orange "b1 shifts from -7.498 to -7.131." Panel 4 (bottom-left): "BMA VS. DOUBLE-SELECTION LASSO" -- two columns comparing BMA (4,096 models, PIPs, minutes) and DSL (seconds, LASSO selects 100/112), teal "Two roads to the same answer." Panel 5 (bottom-center): "THE ANSWER KEY VERDICT" -- scorecard showing 6/8 true positives and 0/7 false positives, two orange X marks for urban and democracy, teal "6 of 8 recovered, zero false alarms." Panel 6 (bottom-right): "BOTTOM LINE" -- decision tree (which variables? -> BMA, fast inference? -> DSL), inverted-N curve with turning points $2,400 and $27,000, orange "Method convergence: both confirm the inverted-N." Professor's margin note bottom-right: "With 4,096 models to choose from, the worst strategy is picking just one!" with arrow toward Panel 2. Color legend bottom-left: True predictors: teal, Instability: orange, Data: white. Faint background formulas: P(M_k|data), PIP_j = Sum P(M_k|data), min beta {RSS + lambda Sum |beta_j|} at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The EKC Hypothesis

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "3 phases: fall, rise, fall again"
- **Key number**: N/A (conceptual panel)
- **Body sentences**:
  - The Environmental Kuznets Curve predicts pollution first rises with industrialization, then falls as countries grow wealthy.
  - A cubic polynomial tests for this inverted-N shape -- requiring b1 < 0, b2 > 0, b3 < 0.
- **Icon**: Chalk-drawn inverted-N curve with three labeled phases (fall, rise, fall) across an income axis
- **Mini-viz**: N/A (conceptual panel -- the icon serves as the visualization)
- **Connector to next**: "But which controls belong in the model?"

### Panel 2 -- Synthetic Data with an Answer Key

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "12 controls, 4,096 possible models"
- **Key number**: N = 1,600 (80 countries x 20 years), 5 true predictors, 7 noise variables
- **Body sentences**:
  - N = 1,600 observations from a synthetic panel with a known DGP -- 5 true predictors and 7 noise variables.
  - True DGP: b1 = -7.1, b2 = 0.81, b3 = -0.03 producing turning points at $1,895 and $34,647.
- **Icon**: Chalk-drawn grid of rectangles representing the panel dataset, labeled "80 countries x 20 years"
- **Mini-viz**: Checklist with 12 rows: 5 checkmarks in teal (true) and 7 X marks in gray (noise)
- **Connector to next**: "What happens when we change controls?"

### Panel 3 -- Coefficient Instability

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "b1 shifts from -7.498 to -7.131"
- **Key number**: Within R-squared jumps from 0.40 to 0.73; b1 shifts by 0.367
- **Body sentences**:
  - Adding all 12 controls raises within R-squared from 0.40 to 0.73 -- the controls carry real explanatory power.
  - But coefficients shift depending on which controls are included -- this is model uncertainty.
- **Icon**: Two vertical bars of different heights representing R-squared values (0.40 and 0.73)
- **Mini-viz**: Chalk number line with b1 shifting from -7.498 to -7.131, connected by a wavy arrow
- **Connector to next**: "How do BMA and DSL handle this?"

### Panel 4 -- BMA vs. Double-Selection LASSO

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "Two roads to the same answer"
- **Key number**: BMA: PIPs -- fossil_fuel = 1.000, industry = 0.999, renewable = 0.959; DSL: 100/112 controls selected in seconds
- **Body sentences**:
  - BMA averages across models, weighting by fit -- PIPs flag fossil fuel (1.000), industry (0.999), renewable (0.959).
  - DSL runs in seconds, selecting 100 of 112 controls via LASSO penalty.
- **Icon**: Two columns -- BMA with stacked model boxes and bar chart, DSL with funnel and lightning bolt
- **Mini-viz**: Side-by-side comparison: BMA column (4,096 models, PIPs, clock) vs DSL column (LASSO funnel, 100/112, lightning bolt), converging to "b1 ~ -7.1"
- **Connector to next**: "Did they find the right variables?"

### Panel 5 -- The Answer Key Verdict

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "6 of 8 recovered, zero false alarms"
- **Key number**: 6/8 true positives, 0/7 false positives, 2 misses (urban 0.007, democracy -0.005)
- **Body sentences**:
  - BMA correctly identifies 3 GDP terms plus fossil fuel, industry, and renewable energy -- all with PIP above 0.95.
  - The two misses have tiny true coefficients: urban (0.007) and democracy (-0.005) -- genuinely hard to detect.
- **Icon**: Chalk-drawn scorecard with checkmark and circle-slash icons
- **Mini-viz**: Two rows: "True positives: 6/8" with teal checkmark, "False positives: 0/7" with teal circle-slash, plus two orange X marks for urban and democracy
- **Connector to next**: "So when should you use each method?"

### Panel 6 -- Bottom Line

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "Method convergence: both confirm the inverted-N"
- **Key number**: Turning points near $2,400 (min) and $27,000 (max)
- **Body sentences**:
  - Use BMA when you need to know which variables matter -- PIPs give granular variable-level evidence.
  - Use DSL for fast, valid coefficient estimates -- it runs in seconds with standard frequentist inference.
- **Icon**: Chalk-drawn decision tree with two branches (BMA and DSL)
- **Mini-viz**: Inverted-N curve with two turning point markers labeled "$2,400 min" and "$27,000 max" in warm orange
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "With 4,096 models to choose from, the worst strategy is picking just one!" -- positioned bottom-right margin, with arrow toward Panel 2
- **Color legend**: True predictors / confirmed: teal, Instability / misses: warm orange, Data / methods: chalk white
- **Background formulas**: P(M_k|data) = P(data|M_k)P(M_k) / Sum P(data|M_l)P(M_l), PIP_j = Sum P(M_k|data), min beta {RSS + lambda Sum |beta_j|} at 15-20% opacity
