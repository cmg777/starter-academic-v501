# Building a Development Index with PCA

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and critical findings like the correlation of -0.96 and the 98% variance captured. Teal (#00d4c8) marks positive results like the final Health Index scores. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "BUILDING A DEVELOPMENT INDEX WITH PCA" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "How do you compress multiple health indicators into a single country ranking?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE CHALLENGE" in steel blue small-caps chalk lettering. Inside the panel, two chalk-drawn rulers of different sizes represent the incompatible measurement units -- one labeled "Years" (tall) and one labeled "per 1,000" (short), with a large "+" sign between them crossed out in warm orange. The phrase "You cannot simply add years and rates" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "50 countries, 2 health indicators: Life Expectancy (years) and Infant Mortality (deaths per 1,000)" and "Different units, different directions -- higher LE is good, but higher IM is bad. We need a single number." A chalk arrow connects to Panel 2 with the phrase "First, fix the directions" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "ALIGN & STANDARDIZE" in steel blue small-caps chalk lettering. Inside the panel, two chalk-drawn arrows initially point in opposite directions (one up, one down) with a label "Before" in muted gray, then both point upward together with a label "After" in teal (#00d4c8), showing the polarity flip. The phrase "r flips from -0.96 to +0.96" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Step 1: Multiply Infant Mortality by -1 so higher always means better" and "Step 2: Z-scores remove units -- both variables become mean = 0, std = 1. Now they are comparable." A chalk arrow connects to Panel 3 with the phrase "How much do they overlap?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "THE COVARIANCE MATRIX" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn 2x2 grid shows the matrix entries: "1.00" on the diagonal in chalk white (#f0ece2) and "0.96" on the off-diagonal in warm orange (#e8956a), with light bracket marks around the matrix. The phrase "96% overlap between indicators" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The covariance matrix measures how much the two Z-scores move together" and "Off-diagonal of 0.96 means when one goes up by 1 SD, the other goes up by 0.96 SD -- almost lockstep." A chalk arrow connects downward to Panel 4 with the phrase "Now find the best direction" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "EIGEN-DECOMPOSITION" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn scatter cloud of dots forms a narrow diagonal band from lower-left to upper-right, with a long orange arrow (PC1) through its long axis and a short teal arrow (PC2) perpendicular to it. Two chalk bars stand side by side: a tall one labeled "PC1: 98%" in warm orange (#e8956a) and a tiny one labeled "PC2: 2%" in teal (#00d4c8). The phrase "PC1 captures 98% of all variation" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Eigenvectors find the direction of maximum spread -- the 'main highway' through the data cloud" and "Eigenvalues measure the spread: lambda-1 = 1.96 (PC1), lambda-2 = 0.04 (PC2). Weights: both 0.7071." A chalk arrow connects to Panel 5 with the phrase "Project onto the line" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "THE HEALTH INDEX" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn horizontal bar chart shows a gradient of bars from short orange at the bottom to long teal at the top, representing countries ranked by Health Index. The top bar is labeled "Country 12: 1.00" in teal (#00d4c8) and the bottom bar is labeled "Country 05: 0.00" in warm orange (#e8956a). The phrase "From 0 (worst) to 1 (best)" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "PC1 scores are projected onto a 0-1 scale using Min-Max normalization" and "Best country: LE = 84.7 yrs, IM = 3.8. Worst: LE = 54.9 yrs, IM = 53.8. The gap is stark." A chalk arrow connects to Panel 6 with the phrase "Can we automate this?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "BOTTOM LINE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn flowchart shows six small boxes labeled "1 Polarity", "2 Z-scores", "3 Covariance", "4 Eigen", "5 Score", "6 Normalize" connected by arrows, then a large equals sign, then a single box labeled "sklearn: 15 lines" circled in teal (#00d4c8). The phrase "Same pipeline, any dataset" appears in large teal (#00d4c8) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Six manual steps collapse into 15 lines of scikit-learn code" and "Change the CSV file and column names to build any composite index -- education, infrastructure, governance."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "Equal weights (0.707) are a special case -- with 3+ variables, PCA discovers unequal weights!" A hand-drawn chalk arrow points from the note toward Panel 4. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Health Index / results", a warm orange (#e8956a) dot labeled "Key numbers / findings", and a chalk white (#f0ece2) dot labeled "Data / formulas."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "Z = (X - mu) / sigma" and "Sigma v = lambda v" and "PC1 = w1 * Z_LE + w2 * Z_IM" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of rulers, scatter dots, and matrix brackets appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange or teal. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "BUILDING A DEVELOPMENT INDEX WITH PCA" in steel blue small-caps, subtitle: "How do you compress multiple health indicators into a single country ranking?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE CHALLENGE" -- two chalk rulers of different sizes with crossed-out "+" sign, orange callout "You cannot simply add years and rates," 50 countries, 2 indicators. Panel 2 (top-center): "ALIGN & STANDARDIZE" -- two arrows flipping from opposite to same direction, orange "r flips from -0.96 to +0.96," polarity adjustment and Z-scores. Panel 3 (top-right): "THE COVARIANCE MATRIX" -- chalk 2x2 matrix grid with 1.00 diagonal and 0.96 off-diagonal in orange, orange "96% overlap." Panel 4 (bottom-left): "EIGEN-DECOMPOSITION" -- chalk scatter cloud with long orange PC1 arrow and short teal PC2 arrow, two bars (98% vs 2%), orange "PC1 captures 98%." Panel 5 (bottom-center): "THE HEALTH INDEX" -- gradient bar chart from orange (0.00) to teal (1.00), teal "From 0 (worst) to 1 (best)," Country 12 = 1.00, Country 05 = 0.00. Panel 6 (bottom-right): "BOTTOM LINE" -- six small boxes collapsing into one "sklearn: 15 lines" box circled in teal, teal "Same pipeline, any dataset." Professor's margin note bottom-right: "Equal weights (0.707) are a special case -- with 3+ variables, PCA discovers unequal weights!" with arrow toward Panel 4. Color legend bottom-left: Health Index: teal, Key numbers: orange, Data: white. Faint background formulas: Z = (X - mu) / sigma, Sigma v = lambda v, PC1 = w1*Z_LE + w2*Z_IM at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Challenge

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "You cannot simply add years and rates"
- **Key number**: 50 countries, 2 indicators
- **Body sentences**:
  - 50 countries, 2 health indicators: Life Expectancy (years) and Infant Mortality (deaths per 1,000).
  - Different units, different directions -- higher LE is good, but higher IM is bad. We need a single number.
- **Icon**: Two chalk-drawn rulers of different sizes with a crossed-out "+" sign
- **Mini-viz**: N/A (conceptual panel)
- **Connector to next**: "First, fix the directions"

### Panel 2 -- Align & Standardize

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "r flips from -0.96 to +0.96"
- **Key number**: Correlation flips from -0.9595 to +0.9595
- **Body sentences**:
  - Step 1: Multiply Infant Mortality by -1 so higher always means better.
  - Step 2: Z-scores remove units -- both variables become mean = 0, std = 1. Now they are comparable.
- **Icon**: Two arrows initially pointing in opposite directions, then both pointing upward
- **Mini-viz**: Before/after arrow directions with "Before" in muted gray and "After" in teal
- **Connector to next**: "How much do they overlap?"

### Panel 3 -- The Covariance Matrix

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "96% overlap between indicators"
- **Key number**: Off-diagonal correlation r = 0.9595
- **Body sentences**:
  - The covariance matrix measures how much the two Z-scores move together.
  - Off-diagonal of 0.96 means when one goes up by 1 SD, the other goes up by 0.96 SD -- almost lockstep.
- **Icon**: Chalk-drawn 2x2 matrix grid with bracket marks
- **Mini-viz**: 2x2 grid with "1.00" on diagonal (chalk white) and "0.96" off-diagonal (warm orange)
- **Connector to next**: "Now find the best direction"

### Panel 4 -- Eigen-Decomposition

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "PC1 captures 98% of all variation"
- **Key number**: Eigenvalues 1.9595 (PC1) and 0.0405 (PC2), variance explained 97.97%
- **Body sentences**:
  - Eigenvectors find the direction of maximum spread -- the "main highway" through the data cloud.
  - Eigenvalues measure the spread: lambda-1 = 1.96 (PC1), lambda-2 = 0.04 (PC2). Weights: both 0.7071.
- **Icon**: Chalk scatter cloud with long orange PC1 arrow and short teal PC2 arrow
- **Mini-viz**: Two bars side by side: tall bar "PC1: 98%" (warm orange) and tiny bar "PC2: 2%" (teal)
- **Connector to next**: "Project onto the line"

### Panel 5 -- The Health Index

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "From 0 (worst) to 1 (best)"
- **Key number**: Country_12 = 1.00 (LE 84.7, IM 3.8), Country_05 = 0.00 (LE 54.9, IM 53.8)
- **Body sentences**:
  - PC1 scores are projected onto a 0-1 scale using Min-Max normalization.
  - Best country: LE = 84.7 yrs, IM = 3.8. Worst: LE = 54.9 yrs, IM = 53.8. The gap is stark.
- **Icon**: Horizontal bar chart with gradient from orange (bottom) to teal (top)
- **Mini-viz**: Gradient bar chart with top bar labeled "Country 12: 1.00" and bottom bar labeled "Country 05: 0.00"
- **Connector to next**: "Can we automate this?"

### Panel 6 -- Bottom Line

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "Same pipeline, any dataset"
- **Key number**: 6 manual steps = 15 lines of sklearn code
- **Body sentences**:
  - Six manual steps collapse into 15 lines of scikit-learn code.
  - Change the CSV file and column names to build any composite index -- education, infrastructure, governance.
- **Icon**: Six small boxes connected by arrows collapsing into one large box
- **Mini-viz**: Flowchart: six boxes -> equals sign -> single "sklearn: 15 lines" box circled in teal
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "Equal weights (0.707) are a special case -- with 3+ variables, PCA discovers unequal weights!" -- positioned bottom-right margin, with arrow toward Panel 4
- **Color legend**: Health Index / results: teal, Key numbers / findings: warm orange, Data / formulas: chalk white
- **Background formulas**: Z = (X - mu) / sigma, Sigma v = lambda v, PC1 = w1 * Z_LE + w2 * Z_IM at 15-20% opacity
