# Choosing Standard Errors in Panel Data

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the pooled OLS coefficient of 1.03 being double the true 0.5 and time-clustered SEs over-rejecting at 9.0%. Teal (#00d4c8) marks positive results like entity-clustered SEs rejecting at just 6.6% near the nominal 5%. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "CHOOSING STANDARD ERRORS IN PANEL DATA" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Which standard error estimator actually controls your false positive rate?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE PROBLEM" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn cluster of dots represents a group of observations from one firm, with curved correlation lines connecting them to show within-cluster dependence -- a small label reads "same firm, correlated errors." A chalk-drawn thermometer icon with a cracked gauge next to it suggests a broken measurement tool. The phrase "Wrong SEs = illusory precision" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Panel data breaks the independence assumption -- firm 1 in 2015 is correlated with firm 1 in 2016" and "Conventional SEs ignore within-cluster correlation and overstate precision." A chalk arrow connects to Panel 2 with the phrase "How do we build the test case?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "THE SIMULATED PANEL" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn grid of tiny squares represents the panel: 10 columns (years 2010--2019) and several rows (firms), with a label "100 firms x 10 years." A small chalk equation reads "true beta = 0.5" with the 0.5 circled in teal (#00d4c8). The phrase "N = 1,000 obs, true beta = 0.5" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Firm ability drives both R&D and performance -- creating omitted variable bias by design" and "AR(1) errors with rho = 0.5 inject within-firm serial correlation." A chalk arrow connects to Panel 3 with the phrase "What happens without fixed effects?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "THE BIAS TRAP" in steel blue small-caps chalk lettering. Inside the panel, two chalk-drawn horizontal bars sit side by side: a long bar labeled "Pooled OLS: 1.03" in warm orange (#e8956a) and a shorter bar labeled "True: 0.5" in teal (#00d4c8), with a gap arrow between them labeled "2x too high." A chalk-drawn warning triangle icon with an exclamation mark hovers above the bars. The phrase "Coefficient = 1.03 vs true 0.5" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Pooled OLS attributes to R&D what is actually driven by unobserved firm ability" and "No SE correction can rescue a biased estimator -- fixed effects are needed first." A chalk arrow connects downward to Panel 4 with the phrase "Now compare the SE estimators" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "SIX SE ESTIMATORS COMPARED" in steel blue small-caps chalk lettering. Inside the panel, six chalk-drawn horizontal bars of varying lengths are stacked vertically, representing the six SE estimates. The bars are labeled from top to bottom: "Entity-clustered: 0.062" (longest bar, highlighted in teal #00d4c8), "Two-way: 0.053" in chalk white (#f0ece2), "White: 0.036" in chalk white, "Conventional: 0.035" in chalk white, "Time-clustered: 0.017" in warm orange (#e8956a), and "Driscoll-Kraay: 0.016" in warm orange (#e8956a). The phrase "Entity-clustered SE is 80% larger" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Entity-clustered SEs (0.062) properly reflect within-firm correlation that conventional SEs (0.035) ignore" and "Time-clustered SEs (0.017) are misleadingly small with only 10 year-clusters." A chalk arrow connects to Panel 5 with the phrase "But which ones get the rejection rate right?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "MONTE CARLO VERDICT" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn bar chart shows rejection rates for four key estimators as vertical bars: "Entity: 6.6%" near a dashed line at 5% in teal (#00d4c8), "Conv: 6.0%" in chalk white, "White: 6.4%" in chalk white, and "Time: 9.0%" as a taller bar crossing well above the dashed line in warm orange (#e8956a). The dashed line at 5% is labeled "nominal" in muted gray (#b0a89a). A chalk-drawn microscope icon represents the 500-simulation experiment. The phrase "Time-clustered: 9.0% rejection" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Across 500 simulations, entity-clustered SEs reject at 6.6% -- close to the nominal 5%" and "Time-clustered SEs nearly double the false positive rate because 10 clusters are too few." A chalk arrow connects to Panel 6 with the phrase "What should you do in practice?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "THE RELIABLE DEFAULT" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn two-step flowchart shows "Step 1: Fixed Effects" in a box connected by an arrow to "Step 2: Entity-Clustered SEs" in a second box, both outlined in teal (#00d4c8). Below the flowchart, a chalk-drawn rule-of-thumb note reads "Cluster on the dimension with 40+ groups." The phrase "FE + entity-clustered = correct inference" appears in large teal (#00d4c8) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Fixed effects remove bias (0.48 vs 1.03), entity-clustered SEs ensure correct coverage" and "Two-way clustering adds insurance when both dimensions have enough groups."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "SEs fix inference, not bias -- always fix the model first!" A hand-drawn chalk arrow points from the note toward Panel 3. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Correct inference / FE estimates", a warm orange (#e8956a) dot labeled "Bias / over-rejection", and a chalk white (#f0ece2) dot labeled "SE estimators / data."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "y_it = alpha + beta * x_it + mu_i + lambda_t + epsilon_it" and "SE_clustered = (X'X)^{-1} (Sum X_g' e_g e_g' X_g) (X'X)^{-1}" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of small data grids, regression lines, and confidence interval brackets appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include computer screenshots or software interfaces.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "CHOOSING STANDARD ERRORS IN PANEL DATA" in steel blue small-caps, subtitle: "Which standard error estimator actually controls your false positive rate?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE PROBLEM" -- chalk cluster of correlated dots within a firm, cracked thermometer icon, orange callout "Wrong SEs = illusory precision." Panel 2 (top-center): "THE SIMULATED PANEL" -- chalk grid of 100 firms x 10 years, orange "N = 1,000, true beta = 0.5." Panel 3 (top-right): "THE BIAS TRAP" -- two horizontal bars (Pooled 1.03 in orange vs True 0.5 in teal), warning triangle, orange "Coefficient = 1.03 vs true 0.5." Panel 4 (bottom-left): "SIX SE ESTIMATORS COMPARED" -- six stacked bars from entity-clustered 0.062 (teal, longest) to Driscoll-Kraay 0.016 (orange, shortest), teal "Entity-clustered SE is 80% larger." Panel 5 (bottom-center): "MONTE CARLO VERDICT" -- bar chart with rejection rates, dashed line at 5%, entity 6.6% near line (teal), time 9.0% above line (orange), orange "Time-clustered: 9.0% rejection." Panel 6 (bottom-right): "THE RELIABLE DEFAULT" -- two-step flowchart (FE then entity-clustered) in teal, teal "FE + entity-clustered = correct inference." Professor's margin note bottom-right: "SEs fix inference, not bias -- always fix the model first!" with arrow toward Panel 3. Color legend bottom-left: Correct inference: teal, Bias/over-rejection: orange, SE estimators: white. Faint background formulas: y_it = alpha + beta*x_it + mu_i + epsilon_it, clustered SE sandwich formula at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Problem

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "Wrong SEs = illusory precision"
- **Key number**: N/A (conceptual panel)
- **Body sentences**:
  - Panel data breaks the independence assumption -- firm 1 in 2015 is correlated with firm 1 in 2016.
  - Conventional SEs ignore within-cluster correlation and overstate precision.
- **Icon**: Chalk-drawn cluster of correlated dots within a firm, plus a cracked thermometer gauge
- **Mini-viz**: Curved correlation lines connecting dots within one cluster, with label "same firm, correlated errors"
- **Connector to next**: "How do we build the test case?"

### Panel 2 -- The Simulated Panel

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "N = 1,000 obs, true beta = 0.5"
- **Key number**: 100 firms x 10 years = 1,000 observations; true beta = 0.5
- **Body sentences**:
  - Firm ability drives both R&D and performance -- creating omitted variable bias by design.
  - AR(1) errors with rho = 0.5 inject within-firm serial correlation.
- **Icon**: Chalk-drawn grid of tiny squares (10 columns for years, rows for firms)
- **Mini-viz**: Panel grid labeled "100 firms x 10 years" with "true beta = 0.5" circled in teal
- **Connector to next**: "What happens without fixed effects?"

### Panel 3 -- The Bias Trap

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "Coefficient = 1.03 vs true 0.5"
- **Key number**: Pooled OLS = 1.03, true beta = 0.5 (more than 2x too high)
- **Body sentences**:
  - Pooled OLS attributes to R&D what is actually driven by unobserved firm ability.
  - No SE correction can rescue a biased estimator -- fixed effects are needed first.
- **Icon**: Chalk-drawn warning triangle with exclamation mark
- **Mini-viz**: Two horizontal bars: long bar "Pooled OLS: 1.03" in warm orange vs short bar "True: 0.5" in teal, gap arrow labeled "2x too high"
- **Connector to next**: "Now compare the SE estimators"

### Panel 4 -- Six SE Estimators Compared

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "Entity-clustered SE is 80% larger"
- **Key number**: Entity-clustered SE = 0.062 vs conventional SE = 0.035 (80% larger)
- **Body sentences**:
  - Entity-clustered SEs (0.062) properly reflect within-firm correlation that conventional SEs (0.035) ignore.
  - Time-clustered SEs (0.017) are misleadingly small with only 10 year-clusters.
- **Icon**: Six stacked horizontal bars of varying lengths
- **Mini-viz**: Six bars labeled with SE values: entity-clustered 0.062 (teal, longest), two-way 0.053, White 0.036, conventional 0.035, time-clustered 0.017 (orange), Driscoll-Kraay 0.016 (orange)
- **Connector to next**: "But which ones get the rejection rate right?"

### Panel 5 -- Monte Carlo Verdict

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "Time-clustered: 9.0% rejection"
- **Key number**: Entity-clustered rejects at 6.6% (near 5% nominal); time-clustered at 9.0% (nearly double)
- **Body sentences**:
  - Across 500 simulations, entity-clustered SEs reject at 6.6% -- close to the nominal 5%.
  - Time-clustered SEs nearly double the false positive rate because 10 clusters are too few.
- **Icon**: Chalk-drawn microscope (representing 500-simulation experiment)
- **Mini-viz**: Bar chart with dashed line at 5%: entity 6.6% near line (teal), conventional 6.0%, White 6.4%, time 9.0% above line (warm orange)
- **Connector to next**: "What should you do in practice?"

### Panel 6 -- The Reliable Default

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "FE + entity-clustered = correct inference"
- **Key number**: FE coefficient = 0.48 (vs pooled 1.03); entity-clustered rejection rate = 6.6%
- **Body sentences**:
  - Fixed effects remove bias (0.48 vs 1.03), entity-clustered SEs ensure correct coverage.
  - Two-way clustering adds insurance when both dimensions have enough groups.
- **Icon**: Two-step flowchart: "Step 1: Fixed Effects" arrow to "Step 2: Entity-Clustered SEs"
- **Mini-viz**: Flowchart with two boxes outlined in teal, plus rule-of-thumb note "Cluster on the dimension with 40+ groups"
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "SEs fix inference, not bias -- always fix the model first!" -- positioned bottom-right margin, with arrow toward Panel 3
- **Color legend**: Correct inference / FE estimates: teal, Bias / over-rejection: warm orange, SE estimators / data: chalk white
- **Background formulas**: y_it = alpha + beta * x_it + mu_i + lambda_t + epsilon_it, SE_clustered = (X'X)^{-1} (Sum X_g' e_g e_g' X_g) (X'X)^{-1} at 15-20% opacity
