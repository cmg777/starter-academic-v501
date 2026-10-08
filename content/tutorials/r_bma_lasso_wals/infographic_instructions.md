# Robust Variable Selection with Three Methods

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the 4,096 possible models that make naive specification searching unreliable. Teal (#00d4c8) marks positive results like the 5 triple-robust variables identified by all three methods with zero false positives. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "ROBUST VARIABLE SELECTION WITH THREE METHODS" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "When 4,096 models are possible, which variables truly matter?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE 4,096-MODEL PROBLEM" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn filing cabinet overflows with tiny pages labeled "Model 1", "Model 2", etc., spilling onto the floor -- representing the file drawer problem of specification searching. A small chalk formula "2^12 = 4,096" hovers above the cabinet. The phrase "4,096 possible models" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "With 12 candidate variables, each included or excluded, a researcher faces 4,096 possible regressions." and "Picking one model and reporting it as 'the answer' implicitly assumes the other 4,095 are wrong." A chalk arrow connects to Panel 2 with the phrase "What if we knew the truth?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "SYNTHETIC GROUND TRUTH" in steel blue small-caps chalk lettering. Inside the panel, chalk-drawn tally marks in groups of five represent the 120 countries, with a small chalk label "N = 120" beneath them. A chalk table shows two columns: a column of 7 check marks in teal (#00d4c8) labeled "True" and a column of 5 cross marks in warm orange (#e8956a) labeled "Noise," representing the known variable classification. The phrase "7 true + 5 noise" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Synthetic data with known ground truth -- 7 variables have real effects, 5 are pure noise." and "Noise variables are deliberately correlated with GDP, creating realistic multicollinearity." A chalk arrow connects to Panel 3 with the phrase "How does BMA handle this?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "BMA -- BAYESIAN VOTING" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn ballot box with small paper slips emerging from it represents the 4,096 models "voting" for which variables matter. A chalk bar chart shows a tall bar labeled "GDP" reaching PIP = 1.00 in teal (#00d4c8), a medium bar labeled "fossil fuel" at PIP = 0.997, and a short bar labeled "fdi" at PIP = 0.11 in warm orange (#e8956a). The phrase "GDP PIP = 1.00" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "BMA lets all 4,096 models vote -- variables in the best-fitting models earn high inclusion probabilities." and "PIP >= 0.80 means robust; all 5 noise variables scored below 0.20." A chalk arrow connects downward to Panel 4 with the phrase "Do other methods agree?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "THREE METHODS COMPARED" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn grid shows 12 rows (variables) and 3 columns (BMA, LASSO, WALS). The top 5 rows have teal (#00d4c8) check marks in all 3 columns, and the bottom 5 rows have warm orange (#e8956a) cross marks in all 3 columns, with 2 middle rows showing cross marks throughout. A small label "5/5 agree" in teal sits beside the top group. The phrase "83.3% accuracy -- all three" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "All three methods achieved identical 83.3% accuracy: 5 of 7 true predictors found, zero false positives." and "The 2 missed variables -- democracy and agriculture -- have true effects too small to detect with N = 120." A chalk arrow connects to Panel 5 with the phrase "A deeper connection..." in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "THE LASSO-LAPLACE CONNECTION" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn diamond shape (L1 constraint) is drawn on the left labeled "LASSO" in steel blue (#8bb8e0), with a double-headed arrow connecting it to a chalk-drawn peaked curve (Laplace density) on the right labeled "WALS" in teal (#00d4c8). The word "SAME PRIOR" appears between them in chalk white. The phrase "L1 penalty = Laplace prior" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "LASSO's L1 penalty is the negative log of a Laplace prior -- the same prior WALS uses for averaging." and "LASSO uses it for hard selection (exact zeros); WALS uses it for soft averaging (continuous weights)." A chalk arrow connects to Panel 6 with the phrase "So which should you use?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "BOTTOM LINE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn Venn diagram shows three overlapping circles labeled "BMA", "LASSO", and "WALS" in steel blue (#8bb8e0), with the center intersection region shaded in teal (#00d4c8) and labeled "5 robust vars" in chalk white. The phrase "Use all three -- convergence = confidence" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "When Bayesian, penalized likelihood, and frequentist methods all agree, the evidence is strong." and "GDP, fossil fuel, urbanization, trade network, and industry are the robust determinants of CO2 emissions."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "The disagreement is just as informative as the agreement -- investigate variables where methods diverge!" A hand-drawn chalk arrow points from the note toward Panel 4. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Robust variable / method agreement", a warm orange (#e8956a) dot labeled "Noise / model uncertainty", and a chalk white (#f0ece2) dot labeled "Data / assumptions."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "PIP_j = Sigma P(M_k|y)" and "beta_LASSO = argmin ||y - Xbeta||^2 + lambda ||beta||_1" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of ballot boxes, diamond shapes, and bar charts appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "ROBUST VARIABLE SELECTION WITH THREE METHODS" in steel blue small-caps, subtitle: "When 4,096 models are possible, which variables truly matter?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE 4,096-MODEL PROBLEM" -- chalk filing cabinet overflowing with model pages, formula "2^12 = 4,096", orange "4,096 possible models." Panel 2 (top-center): "SYNTHETIC GROUND TRUTH" -- chalk tally marks for 120 countries, table with 7 teal checks and 5 orange crosses, orange "7 true + 5 noise." Panel 3 (top-right): "BMA -- BAYESIAN VOTING" -- chalk ballot box, bar chart with GDP at PIP = 1.00 in teal, teal "GDP PIP = 1.00." Panel 4 (bottom-left): "THREE METHODS COMPARED" -- chalk grid 12 rows x 3 columns, top 5 rows all teal checks, bottom 5 all orange crosses, teal "83.3% accuracy -- all three." Panel 5 (bottom-center): "THE LASSO-LAPLACE CONNECTION" -- chalk diamond (L1) connected to peaked curve (Laplace) by double arrow, orange "L1 penalty = Laplace prior." Panel 6 (bottom-right): "BOTTOM LINE" -- chalk Venn diagram of BMA/LASSO/WALS with teal center "5 robust vars", orange "Use all three -- convergence = confidence." Professor's margin note bottom-right: "The disagreement is just as informative as the agreement!" with arrow toward Panel 4. Color legend bottom-left: Robust variable: teal, Noise/uncertainty: orange, Data: white. Faint background formulas: PIP_j = Sigma P(M_k|y), beta_LASSO = argmin ||y-Xb||^2 + lambda||b||_1 at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The 4,096-Model Problem

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "4,096 possible models"
- **Key number**: 2^12 = 4,096 possible models with 12 candidate variables
- **Body sentences**:
  - With 12 candidate variables, each included or excluded, a researcher faces 4,096 possible regressions.
  - Picking one model and reporting it as "the answer" implicitly assumes the other 4,095 are wrong.
- **Icon**: Chalk-drawn filing cabinet overflowing with tiny model pages, representing the file drawer problem
- **Mini-viz**: Chalk formula "2^12 = 4,096" hovering above the cabinet
- **Connector to next**: "What if we knew the truth?"

### Panel 2 -- Synthetic Ground Truth

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "7 true + 5 noise"
- **Key number**: 7 true predictors, 5 noise variables, 120 countries
- **Body sentences**:
  - Synthetic data with known ground truth -- 7 variables have real effects, 5 are pure noise.
  - Noise variables are deliberately correlated with GDP, creating realistic multicollinearity.
- **Icon**: Chalk tally marks in groups of five with "N = 120" label
- **Mini-viz**: Two-column chalk table: 7 teal check marks labeled "True" and 5 orange cross marks labeled "Noise"
- **Connector to next**: "How does BMA handle this?"

### Panel 3 -- BMA -- Bayesian Voting

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "GDP PIP = 1.00"
- **Key number**: GDP PIP = 1.00, fossil fuel PIP = 0.997, all noise PIPs below 0.20
- **Body sentences**:
  - BMA lets all 4,096 models vote -- variables in the best-fitting models earn high inclusion probabilities.
  - PIP >= 0.80 means robust; all 5 noise variables scored below 0.20.
- **Icon**: Chalk-drawn ballot box with paper slips emerging, representing model "voting"
- **Mini-viz**: Chalk bar chart with GDP bar at PIP = 1.00 (teal), fossil fuel at 0.997, and fdi at 0.11 (orange)
- **Connector to next**: "Do other methods agree?"

### Panel 4 -- Three Methods Compared

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "83.3% accuracy -- all three"
- **Key number**: 83.3% accuracy, 71.4% sensitivity, 100% specificity for all three methods
- **Body sentences**:
  - All three methods achieved identical 83.3% accuracy: 5 of 7 true predictors found, zero false positives.
  - The 2 missed variables -- democracy and agriculture -- have true effects too small to detect with N = 120.
- **Icon**: Chalk-drawn grid with 12 rows and 3 columns (BMA, LASSO, WALS)
- **Mini-viz**: Top 5 rows show teal check marks in all 3 columns; bottom 5 rows show orange cross marks in all 3 columns; 2 middle rows show crosses throughout
- **Connector to next**: "A deeper connection..."

### Panel 5 -- The LASSO-Laplace Connection

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "L1 penalty = Laplace prior"
- **Key number**: LASSO's L1 penalty is the negative log of the Laplace prior used by WALS
- **Body sentences**:
  - LASSO's L1 penalty is the negative log of a Laplace prior -- the same prior WALS uses for averaging.
  - LASSO uses it for hard selection (exact zeros); WALS uses it for soft averaging (continuous weights).
- **Icon**: Chalk diamond (L1 constraint) on left connected by double arrow to chalk peaked curve (Laplace density) on right
- **Mini-viz**: Labels "LASSO" in steel blue on the diamond, "WALS" in teal on the curve, "SAME PRIOR" between them
- **Connector to next**: "So which should you use?"

### Panel 6 -- Bottom Line

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "Use all three -- convergence = confidence"
- **Key number**: 5 triple-robust variables, 0 false positives across all methods
- **Body sentences**:
  - When Bayesian, penalized likelihood, and frequentist methods all agree, the evidence is strong.
  - GDP, fossil fuel, urbanization, trade network, and industry are the robust determinants of CO2 emissions.
- **Icon**: Chalk Venn diagram with three overlapping circles labeled BMA, LASSO, WALS
- **Mini-viz**: Center intersection region shaded in teal with "5 robust vars" label
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "The disagreement is just as informative as the agreement -- investigate variables where methods diverge!" -- positioned bottom-right margin, with arrow toward Panel 4
- **Color legend**: Robust variable / method agreement: teal, Noise / model uncertainty: warm orange, Data / assumptions: chalk white
- **Background formulas**: PIP_j = Sigma P(M_k|y), beta_LASSO = argmin ||y - Xbeta||^2 + lambda ||beta||_1 at 15-20% opacity
