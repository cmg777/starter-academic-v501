# What Does TWFE Actually Do to Your Data?

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and the central equivalence result. Teal (#00d4c8) marks positive results like the Adj. R-squared of 0.755 and the FWL proof. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "WHAT DOES TWFE ACTUALLY DO TO YOUR DATA?" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "How does subtracting means produce the same coefficients as fixed effects?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE QUESTION" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn grid icon shows rows of dots arranged in a rectangle pattern, representing a balanced panel, with a small label "150 x 8" beneath it. The phrase "150 countries, 8 periods, 1,200 obs" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "TWFE is the workhorse of applied economics -- but what is it actually doing to the data?" and "We use a balanced Barro convergence panel to find out by taking the estimator apart." A chalk arrow connects to Panel 2 with the phrase "The theorem behind it all" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "THE FWL THEOREM" in steel blue small-caps chalk lettering. Inside the panel, the chalk-drawn demeaning formula reads "x_tilde = x - x_bar_i - x_bar_t + x_bar" in chalk white (#f0ece2) with the plus sign for the grand mean correction circled in warm orange (#e8956a). A chalk-drawn pair of noise-canceling headphones icon represents the intuition. The phrase "Subtract the noise, keep the signal" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Like noise-canceling headphones: subtract country means and time means to isolate within-variation" and "The grand mean must be added back -- otherwise the overlap gets subtracted twice." A chalk arrow connects to Panel 3 with the phrase "Let's estimate the model" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "TWFE ESTIMATION" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn regression table shows five variable names in chalk white with their coefficients: "ln_y_init: -0.055***" in warm orange (#e8956a), "log_s_k: 0.020*", "log_n_gd: -0.050*", "log_hcap: 0.009", "gov_cons: -0.103*". The phrase "Convergence: -0.055 (t = -14.77)" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "feols() absorbs 150 country and 8 time fixed effects with clustered standard errors" and "Adj. R-squared 0.755 overall, but Within R-squared only 0.177 -- fixed effects absorb most variation." A chalk arrow connects downward to Panel 4 with the phrase "Can we replicate this by hand?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "MANUAL VS MACHINE" in steel blue small-caps chalk lettering. Inside the panel, two columns of numbers are drawn side by side in chalk white (#f0ece2): a column labeled "feols" and a column labeled "lm(demeaned)", with five coefficient values that match perfectly. Between them, a column labeled "Diff" shows values like "~10^-16" in teal (#00d4c8). A large chalk-drawn equals sign connects the two columns. The phrase "Max diff: 3.05 x 10^-16" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "all.equal() returns TRUE -- coefficients match to 12 significant digits" and "This is not an approximation: the FWL theorem guarantees exact algebraic equivalence." A chalk arrow connects to Panel 5 with the phrase "What does this look like visually?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "WHAT DEMEANING REMOVES" in steel blue small-caps chalk lettering. Inside the panel, two chalk-drawn scatter plots sit side by side: the left plot is labeled "Raw" with dots spread across a wide horizontal range (labeled "3 to 9") in chalk white (#f0ece2), and the right plot is labeled "Demeaned" with dots compressed into a tight cluster near zero (labeled "-0.5 to 0.3") highlighted in teal (#00d4c8). A large chalk arrow labeled "demeaning" connects the two plots. The phrase "Range collapses from 6 units to 0.8" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Between-country differences and common time trends are stripped away" and "Only within-variation remains -- the deviations that identify the TWFE coefficient." A chalk arrow connects to Panel 6 with the phrase "But there is a catch" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "THE SE CAVEAT" in steel blue small-caps chalk lettering. Inside the panel, three chalk-drawn bars of different heights are drawn side by side: a short bar labeled "Naive lm()" in chalk white (#f0ece2), a medium bar labeled "feols IID" in steel blue (#8bb8e0), and a tall bar labeled "feols Clustered" in teal (#00d4c8), illustrating that naive SEs are too small. A chalk-drawn warning triangle icon sits in the top-right. The phrase "Naive SEs understate by 7--22%" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "lm() ignores 157 absorbed degrees of freedom -- correct df is 1,038, not 1,195" and "Always use a dedicated panel estimator for inference, even though lm() gives correct point estimates."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "Same coefficients, wrong standard errors -- the demeaning trap!" A hand-drawn chalk arrow points from the note toward Panel 6. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "FWL equivalence / correct SEs", a warm orange (#e8956a) dot labeled "Key numbers / caveats", and a chalk white (#f0ece2) dot labeled "Data / formulas."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "x_tilde = x - x_bar_i - x_bar_t + x_bar" and "beta_TWFE = beta_OLS_demeaned" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of balanced grids, subtraction signs, and equals signs appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "WHAT DOES TWFE ACTUALLY DO TO YOUR DATA?" in steel blue small-caps, subtitle: "How does subtracting means produce the same coefficients as fixed effects?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE QUESTION" -- chalk grid icon of balanced panel, orange "150 countries, 8 periods, 1,200 obs." Panel 2 (top-center): "THE FWL THEOREM" -- chalk demeaning formula with grand mean circled in orange, headphones icon, orange "Subtract the noise, keep the signal." Panel 3 (top-right): "TWFE ESTIMATION" -- chalk regression table with five coefficients, orange "Convergence: -0.055 (t = -14.77)," Adj R2 0.755, Within R2 0.177. Panel 4 (bottom-left): "MANUAL VS MACHINE" -- two columns of matching coefficients with equals sign, teal diff column showing ~10^-16, teal "Max diff: 3.05 x 10^-16," all.equal = TRUE. Panel 5 (bottom-center): "WHAT DEMEANING REMOVES" -- two side-by-side scatter plots: raw (range 3-9) vs demeaned (range -0.5 to 0.3), orange "Range collapses from 6 to 0.8." Panel 6 (bottom-right): "THE SE CAVEAT" -- three bars (naive shortest, feols tallest), warning triangle, orange "Naive SEs understate by 7-22%," correct df 1,038 not 1,195. Professor's note bottom-right: "Same coefficients, wrong standard errors -- the demeaning trap!" with arrow toward Panel 6. Color legend bottom-left: FWL equivalence: teal, Key numbers: orange, Data: white. Faint background formulas: x_tilde = x - x_bar_i - x_bar_t + x_bar, beta_TWFE = beta_OLS at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Question

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "150 countries, 8 periods, 1,200 obs"
- **Key number**: 1,200 observations (150 x 8 balanced panel)
- **Body sentences**:
  - TWFE is the workhorse of applied economics -- but what is it actually doing to the data?
  - We use a balanced Barro convergence panel to find out by taking the estimator apart.
- **Icon**: Chalk-drawn grid of dots in a rectangle pattern with "150 x 8" label
- **Mini-viz**: N/A (conceptual panel)
- **Connector to next**: "The theorem behind it all"

### Panel 2 -- The FWL Theorem

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "Subtract the noise, keep the signal"
- **Key number**: N/A (conceptual -- formula panel)
- **Body sentences**:
  - Like noise-canceling headphones: subtract country means and time means to isolate within-variation.
  - The grand mean must be added back -- otherwise the overlap gets subtracted twice.
- **Icon**: Chalk-drawn noise-canceling headphones
- **Mini-viz**: Demeaning formula with the grand mean correction circled in warm orange
- **Connector to next**: "Let's estimate the model"

### Panel 3 -- TWFE Estimation

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "Convergence: -0.055 (t = -14.77)"
- **Key number**: -0.055 convergence coefficient, Adj R2 0.755, Within R2 0.177
- **Body sentences**:
  - feols() absorbs 150 country and 8 time fixed effects with clustered standard errors.
  - Adj. R-squared 0.755 overall, but Within R-squared only 0.177 -- fixed effects absorb most variation.
- **Icon**: Chalk-drawn regression table with 5 coefficient rows
- **Mini-viz**: Five variable names with coefficients, convergence highlighted in warm orange
- **Connector to next**: "Can we replicate this by hand?"

### Panel 4 -- Manual vs Machine

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "Max diff: 3.05 x 10^-16"
- **Key number**: 3.05 x 10^-16 maximum difference, all.equal() = TRUE
- **Body sentences**:
  - all.equal() returns TRUE -- coefficients match to 12 significant digits.
  - This is not an approximation: the FWL theorem guarantees exact algebraic equivalence.
- **Icon**: Large chalk-drawn equals sign connecting two coefficient columns
- **Mini-viz**: Two columns (feols vs lm) with matching values, difference column in teal showing ~10^-16
- **Connector to next**: "What does this look like visually?"

### Panel 5 -- What Demeaning Removes

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "Range collapses from 6 units to 0.8"
- **Key number**: Raw range 3-9 (6 units) collapses to -0.5 to 0.3 (0.8 units)
- **Body sentences**:
  - Between-country differences and common time trends are stripped away.
  - Only within-variation remains -- the deviations that identify the TWFE coefficient.
- **Icon**: Large chalk arrow labeled "demeaning" connecting two scatter plots
- **Mini-viz**: Two side-by-side scatter plots: wide spread (raw) vs tight cluster (demeaned)
- **Connector to next**: "But there is a catch"

### Panel 6 -- The SE Caveat

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "Naive SEs understate by 7--22%"
- **Key number**: Correct df = 1,038 vs naive df = 1,195 (157 absorbed)
- **Body sentences**:
  - lm() ignores 157 absorbed degrees of freedom -- correct df is 1,038, not 1,195.
  - Always use a dedicated panel estimator for inference, even though lm() gives correct point estimates.
- **Icon**: Chalk-drawn warning triangle
- **Mini-viz**: Three bars of increasing height: naive (short, white), feols IID (medium, steel blue), feols clustered (tall, teal)
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "Same coefficients, wrong standard errors -- the demeaning trap!" -- positioned bottom-right, arrow toward Panel 6
- **Color legend**: FWL equivalence / correct SEs: teal, Key numbers / caveats: warm orange, Data / formulas: chalk white
- **Background formulas**: x_tilde = x - x_bar_i - x_bar_t + x_bar, beta_TWFE = beta_OLS_demeaned at 15-20% opacity
