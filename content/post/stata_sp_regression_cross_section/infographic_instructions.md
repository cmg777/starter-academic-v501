# The Spatial Model Taxonomy for Crime

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the OLS missing spatial dependence. Teal (#00d4c8) marks positive results like the SEM achieving the lowest AIC at 373. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "THE SPATIAL MODEL TAXONOMY FOR CRIME" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Which spatial model best captures neighborhood crime spillovers?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE QUESTION" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn cluster of small house icons represents 49 neighborhoods arranged in a rough grid, with curved arrows crossing between adjacent houses to depict crime spillovers, and a magnifying glass hovering over the cluster. The phrase "49 Columbus neighborhoods" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Crime does not stop at neighborhood borders -- displacement and diffusion spread criminal activity across boundaries" and "Standard regression treats each neighborhood as independent, ignoring these spatial spillovers entirely." A chalk arrow connects to Panel 2 with the phrase "What data do we have?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "THE DATA" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn 7x7 grid of dots represents the 49 neighborhoods, with thin lines connecting adjacent dots to illustrate the Queen contiguity weight matrix W. Next to the grid, three small chalk-drawn labels list the variables: a badge icon labeled "CRIME," a coin icon labeled "INC," and a house icon labeled "HOVAL." The phrase "Queen contiguity W with 4.8 avg neighbors" appears in large teal (#00d4c8) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Columbus crime dataset: burglaries and thefts per 1,000 households, income, and housing value" and "Row-standardized W matrix has 236 nonzero entries across 49 neighborhoods." A chalk arrow connects to Panel 3 with the phrase "Does OLS miss something?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "OLS MISSES SPATIAL DEPENDENCE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn scatter of residual dots forms a rough cluster pattern, with nearby dots shaded similarly in chalk white to suggest positive autocorrelation, and a dashed circle groups one cluster together with an arrow labeled "Moran's I." Next to the scatter, a small chalk-drawn bar shows "R-squared = 0.552" in chalk white (#f0ece2). The phrase "Moran's I = 0.222, p = 0.005" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "OLS explains 55% of crime variation but its residuals are positively spatially autocorrelated" and "Income coefficient of -1.60 may be biased because neighboring crime patterns are ignored." A chalk arrow connects downward to Panel 4 with the phrase "Which spatial model fits best?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "8 MODELS COMPARED" in steel blue small-caps chalk lettering. Inside the panel, eight horizontal bars are stacked vertically in a ranked bar chart, sorted from lowest to highest AIC. The top bar is labeled "SEM" with a value of "373" in teal (#00d4c8) and is highlighted with a teal fill, clearly standing out as the best model. The remaining bars in order are: "SAR 374" and "SAC 374" in steel blue (#8bb8e0), "SDM 375" and "SDEM 375" in chalk white (#f0ece2), "GNS 376" and "OLS 378" in chalk white, and "SLX 380" at the bottom in warm orange (#e8956a) as the worst-fitting model. A small chalk bracket groups the top three bars with a label "best fit zone." The phrase "SEM wins with AIC = 373" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The SEM captures spatial dependence through correlated errors and achieves the lowest AIC of all eight models" and "Adding more spatial channels in GNS or SDEM does not improve fit with only 49 observations." A chalk arrow connects to Panel 5 with the phrase "Can we simplify further?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "WALD TESTS CONFIRM" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn decision diagram shows "SDM" at the top in a rounded box, with three downward arrows pointing to three boxes below: "SAR" with a check mark in teal (#00d4c8) and "p = 0.17," "SEM" with a check mark in teal (#00d4c8) and "p = 0.35," and "SLX" with an X mark in warm orange (#e8956a) and "p = 0.005." The check marks indicate not rejected (adequate simplification) and the X mark indicates rejected (inadequate simplification). The phrase "SAR and SEM are adequate simplifications" appears in large teal (#00d4c8) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The spatial lags of X are jointly insignificant, so SAR captures the key structure without extra parameters" and "The SEM common factor restriction also holds -- spatial dependence is mainly in the errors." A chalk arrow connects to Panel 6 with the phrase "What does this mean for policy?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "POLICY IMPLICATIONS" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn diagram shows two neighboring house icons with a curved double arrow between them labeled "spillovers." From the left house, an upward arrow labeled "income +1K" points to a downward arrow labeled "-1.08 direct" in chalk white. From the connecting spillover arrow, a second downward arrow labeled "-0.68 indirect" appears in teal (#00d4c8). At the bottom, a bracket sums both arrows to "total = -1.76" in warm orange (#e8956a). The phrase "SAR total income effect is -1.76, exceeding OLS by 10%" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Neighborhood interventions that raise income reduce crime locally and generate positive spillovers for adjacent areas" and "Direct effects are robust across all models, but indirect spillover effects depend on which spatial model is chosen."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "Direct effects are robust -- indirect effects depend on getting the spatial model right!" A hand-drawn chalk arrow points from the note toward Panel 6. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Best model / spatial structure", a warm orange (#e8956a) dot labeled "Key statistics / diagnostics", and a chalk white (#f0ece2) dot labeled "Data / baseline."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "y = rho Wy + X beta + epsilon" and "y = X beta + u, u = lambda Wu + epsilon" and "I = (e'We)/(e'e)" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of small neighborhood grids, weight matrix patterns, and connecting arrows appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange or teal. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include real photographs of Columbus, Ohio or identifiable street maps. Do not include violent imagery, weapons, or depictions of criminal acts.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "THE SPATIAL MODEL TAXONOMY FOR CRIME" in steel blue small-caps, subtitle: "Which spatial model best captures neighborhood crime spillovers?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE QUESTION" -- chalk cluster of 49 house icons with spillover arrows, magnifying glass, teal "49 Columbus neighborhoods." Panel 2 (top-center): "THE DATA" -- 7x7 dot grid with contiguity lines, three variable labels (CRIME, INC, HOVAL), teal "Queen contiguity W with 4.8 avg neighbors." Panel 3 (top-right): "OLS MISSES SPATIAL DEPENDENCE" -- clustered residual dots with Moran's I arrow, R-squared = 0.552 bar, orange "Moran's I = 0.222, p = 0.005." Panel 4 (bottom-left): "8 MODELS COMPARED" -- eight ranked horizontal AIC bars: SEM 373 (teal, highlighted), SAR 374, SAC 374, SDM 375, SDEM 375, GNS 376, OLS 378, SLX 380 (orange), bracket around top three labeled "best fit zone," teal "SEM wins with AIC = 373." Panel 5 (bottom-center): "WALD TESTS CONFIRM" -- SDM box with three arrows to SAR (check, p=0.17), SEM (check, p=0.35), SLX (X, p=0.005), teal "SAR and SEM are adequate simplifications." Panel 6 (bottom-right): "POLICY IMPLICATIONS" -- two houses with spillover arrow, direct -1.08 and indirect -0.68 arrows summing to total -1.76, orange "SAR total income effect is -1.76, exceeding OLS by 10%." Professor's note bottom-right: "Direct effects are robust -- indirect effects depend on getting the spatial model right!" Color legend bottom-left: Best model: teal, Key statistics: orange, Data: white. Background formulas: y = rho Wy + X beta + epsilon, y = X beta + u, u = lambda Wu + epsilon, I = (e'We)/(e'e) at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Question

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "49 Columbus neighborhoods"
- **Key number**: 49 neighborhoods in Columbus, Ohio
- **Body sentences**:
  - Crime does not stop at neighborhood borders -- displacement and diffusion spread criminal activity across boundaries.
  - Standard regression treats each neighborhood as independent, ignoring these spatial spillovers entirely.
- **Icon**: Chalk-drawn cluster of house icons with curved spillover arrows and a magnifying glass
- **Mini-viz**: 49 small houses arranged in a rough grid with arrows crossing between adjacent houses
- **Connector to next**: "What data do we have?"

### Panel 2 -- The Data

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "Queen contiguity W with 4.8 avg neighbors"
- **Key number**: 236 nonzero entries in the 49x49 weight matrix (236/49 = 4.8 avg neighbors)
- **Body sentences**:
  - Columbus crime dataset: burglaries and thefts per 1,000 households, income, and housing value.
  - Row-standardized W matrix has 236 nonzero entries across 49 neighborhoods.
- **Icon**: 7x7 dot grid with contiguity lines connecting adjacent dots
- **Mini-viz**: Dot grid with connecting lines plus three variable labels (CRIME badge, INC coin, HOVAL house)
- **Connector to next**: "Does OLS miss something?"

### Panel 3 -- OLS Misses Spatial Dependence

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "Moran's I = 0.222, p = 0.005"
- **Key number**: Moran's I = 0.222 (z = 2.84, p = 0.005), OLS R-squared = 0.552
- **Body sentences**:
  - OLS explains 55% of crime variation but its residuals are positively spatially autocorrelated.
  - Income coefficient of -1.60 may be biased because neighboring crime patterns are ignored.
- **Icon**: Clustered residual dots with Moran's I dashed circle and arrow
- **Mini-viz**: Scatter of residual dots clustered by similarity, plus R-squared = 0.552 bar
- **Connector to next**: "Which spatial model fits best?"

### Panel 4 -- 8 Models Compared

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "SEM wins with AIC = 373"
- **Key number**: SEM AIC = 373 (lowest), SAR = 374, SAC = 374, SDM = 375, SDEM = 375, GNS = 376, OLS = 378, SLX = 380
- **Body sentences**:
  - The SEM captures spatial dependence through correlated errors and achieves the lowest AIC of all eight models.
  - Adding more spatial channels in GNS or SDEM does not improve fit with only 49 observations.
- **Icon**: Eight ranked horizontal bars (bar chart)
- **Mini-viz**: Ranked AIC bar chart: SEM 373 (teal highlight), SAR 374, SAC 374, SDM 375, SDEM 375, GNS 376, OLS 378, SLX 380 (orange); bracket around top three labeled "best fit zone"
- **Connector to next**: "Can we simplify further?"

### Panel 5 -- Wald Tests Confirm

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "SAR and SEM are adequate simplifications"
- **Key number**: SAR not rejected (chi2 = 3.51, p = 0.173), SEM not rejected (chi2 = 2.10, p = 0.350), SLX rejected (chi2 = 7.82, p = 0.005)
- **Body sentences**:
  - The spatial lags of X are jointly insignificant, so SAR captures the key structure without extra parameters.
  - The SEM common factor restriction also holds -- spatial dependence is mainly in the errors.
- **Icon**: Decision diagram with SDM box and three downward arrows to SAR, SEM, SLX
- **Mini-viz**: SDM at top, three arrows to: SAR (teal check, p=0.17), SEM (teal check, p=0.35), SLX (orange X, p=0.005)
- **Connector to next**: "What does this mean for policy?"

### Panel 6 -- Policy Implications

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "SAR total income effect is -1.76, exceeding OLS by 10%"
- **Key number**: Direct = -1.08, Indirect = -0.68, Total = -1.76 (vs OLS -1.60)
- **Body sentences**:
  - Neighborhood interventions that raise income reduce crime locally and generate positive spillovers for adjacent areas.
  - Direct effects are robust across all models, but indirect spillover effects depend on which spatial model is chosen.
- **Icon**: Two house icons with curved double arrow labeled "spillovers"
- **Mini-viz**: Left house with "income +1K" arrow, "-1.08 direct" downward arrow, spillover arrow to right house with "-0.68 indirect" in teal, bracket summing to "total = -1.76" in orange
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "Direct effects are robust -- indirect effects depend on getting the spatial model right!" -- positioned bottom-right margin, with arrow toward Panel 6
- **Color legend**: Best model / spatial structure: teal, Key statistics / diagnostics: warm orange, Data / baseline: chalk white
- **Background formulas**: y = rho Wy + X beta + epsilon, y = X beta + u, u = lambda Wu + epsilon, I = (e'We)/(e'e) at 15-20% opacity
