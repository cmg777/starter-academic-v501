# Visualizing What "Controlling For" Really Means

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the naive coefficient of -0.093 that wrongly suggests coupons hurt sales. Teal (#00d4c8) marks positive results like the corrected coefficient of +0.212 that recovers the true causal effect after residualization. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "VISUALIZING WHAT 'CONTROLLING FOR' REALLY MEANS" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "What happens to a scatter plot when you partial out a confounder?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE CONFOUNDING TRAP" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn scatter plot shows a downward-sloping regression line through a cloud of dots, with the slope labeled "-0.093" in large warm orange (#e8956a) numerals. A small chalk-drawn warning triangle icon with an exclamation mark sits in the upper-right area of the panel. The phrase "Naive slope: -0.093 (wrong sign!)" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Income confounds the coupon-sales relationship -- wealthier areas get fewer coupons but buy more" and "A naive regression wrongly concludes that coupons hurt sales." A chalk arrow connects to Panel 2 with the phrase "Where does the data come from?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "THE SIMULATED STORE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn DAG shows three nodes -- "Income" at the top in warm orange (#e8956a), "Coupons" at the bottom-left in steel blue (#8bb8e0), and "Sales" at the bottom-right in teal (#00d4c8) -- with arrows labeled -0.5 (Income to Coupons), +0.3 (Income to Sales), and +0.2 (Coupons to Sales) in chalk white. The phrase "3 paths, 200 obs, 1 hidden trap" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The true causal effect of coupons on sales is +0.2 -- but the backdoor path through income hides it" and "Income correlates -0.709 with coupons and +0.500 with sales, creating a strong negative bias." A chalk arrow connects to Panel 3 with the phrase "Can scatterfit reveal the truth?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "FWL RESIDUALIZATION" in steel blue small-caps chalk lettering. Inside the panel, two small chalk-drawn scatter plots sit side by side: the left scatter shows a downward-sloping line labeled "-0.093" in warm orange (#e8956a), and the right scatter shows an upward-sloping line labeled "+0.212" in teal (#00d4c8), with a curved reversal arrow between them and the word "controls(income)" written in small chalk white along the arrow. A chalk-drawn Stata command prompt icon sits near the top. The phrase "Slope reverses to +0.212" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "One option in scatterfit -- controls(income) -- residualizes both axes and reveals the true positive effect" and "R-squared jumps from 0.028 to 0.321 once the confounder is partialled out." A chalk arrow connects downward to Panel 4 with the phrase "Can we predict the bias?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "OVB FORMULA AND FIXED EFFECTS" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn comparison visual is split into two halves. On the left half, a formula reads "naive = full + gamma x delta" with the labeled values "gamma 0.3004 (income in full model), delta -1.0174 (income ON coupons)" below it, and two horizontal bars appear -- one labeled "Controlled: +0.2123" in teal (#00d4c8) and one dipping below zero labeled "Naive: -0.0934" in warm orange (#e8956a), with a bracket between them labeled "OVB = -0.3057." On the right half, two small bars compare "Pooled: 0.04" in chalk white (#f0ece2) and "Within: 0.067" in teal (#00d4c8), with a "~1.7x" annotation in warm orange between them. A chalk-drawn stick figure with a briefcase sits above the right half representing wage panel data. The phrase "-0.0934 = 0.2123 + (-0.3057)" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The OVB identity closes the gap exactly: gamma x delta, with delta the slope of income on coupons, equals naive minus controlled" and "In the wage panel, individual FE raises the experience slope from 0.04 to 0.067 and R-squared from 0.043 to 0.59." A chalk arrow connects to Panel 5 with the phrase "What about large datasets?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "BINNED SCATTERS" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn scatter plot on the left shows a dense blob of overlapping points (representing 5,000 observations), and on the right a cleaner version shows 20 evenly spaced bin-mean markers with a fitted line running through them. A chalk-drawn airplane icon sits in the upper-right area. The phrase "5,000 flights, 20 quantile bins" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Binned scatter plots replace thousands of overlapping points with quantile-bin means -- a Stata-specific advantage" and "The regression line is still estimated on all 5,000 observations; only the display is simplified." A chalk arrow connects to Panel 6 with the phrase "Does the algebra carry across languages?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "BOTTOM LINE" in steel blue small-caps chalk lettering. Inside the panel, three chalk-drawn code boxes are stacked vertically: "Stata (200 stores): 0.212288" at the top and "R (same 200 stores): 0.212288" in the middle, joined by a teal (#00d4c8) equals sign, and "Python (own 50-store draw): 0.2673" at the bottom, joined to the others by a muted gray (#b0a89a) chalk bracket labeled "same algebra, different sample." A chalk-drawn checkmark in teal sits to the right of the stack. The phrase "0.212288 -- six decimal places" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The FWL theorem is an exact algebraic identity -- not an approximation -- in every language and every sample" and "R and Stata load the same store data, so their numbers match; Python simulates its own 50 stores, so its estimates differ."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "Every multiple regression coefficient is secretly a bivariate scatter -- scatterfit just makes the secret visible!" A hand-drawn chalk arrow points from the note toward Panel 3. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "True / corrected effect", a warm orange (#e8956a) dot labeled "Bias / naive estimate", and a chalk white (#f0ece2) dot labeled "Data / controls."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "beta_1 = (X_1'M X_1)^-1 X_1'M Y" and "bias = gamma x delta" and "e_Y = Y - X_2 * beta_2" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of scatter plots with regression lines, small DAG fragments, and residual arrows appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include Stata interface elements or software logos.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "VISUALIZING WHAT 'CONTROLLING FOR' REALLY MEANS" in steel blue small-caps, subtitle: "What happens to a scatter plot when you partial out a confounder?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE CONFOUNDING TRAP" -- downward-sloping scatter with warning triangle, orange "Naive slope: -0.093 (wrong sign!)." Panel 2 (top-center): "THE SIMULATED STORE" -- chalk DAG with Income/Coupons/Sales nodes, arrows labeled -0.5, +0.3, +0.2, orange "3 paths, 200 obs, 1 hidden trap." Panel 3 (top-right): "FWL RESIDUALIZATION" -- two side-by-side scatters, left downward -0.093 (orange), right upward +0.212 (teal), reversal arrow labeled "controls(income)," teal "Slope reverses to +0.212." Panel 4 (bottom-left): "OVB FORMULA AND FIXED EFFECTS" -- left half: formula "naive = full + gamma x delta" (delta = slope of income on coupons) with comparison bars (Controlled +0.2123 teal, Naive -0.0934 orange) and bracket "OVB = -0.3057"; right half: pooled 0.04 vs within 0.067 bars with "~1.7x" annotation, orange "-0.0934 = 0.2123 + (-0.3057)." Panel 5 (bottom-center): "BINNED SCATTERS" -- dense blob vs. 20 bin-mean markers with fitted line, chalk airplane, orange "5,000 flights, 20 quantile bins." Panel 6 (bottom-right): "BOTTOM LINE" -- three stacked code boxes: Stata 0.212288 = R 0.212288 (same 200 stores, teal equals sign), Python 0.2673 (own 50-store draw, gray bracket "same algebra, different sample"), teal checkmark, teal "0.212288 -- six decimal places." Professor's margin note bottom-right: "Every coefficient is secretly a bivariate scatter -- scatterfit makes it visible!" with arrow toward Panel 3. Color legend bottom-left: True effect: teal, Bias: orange, Data: white. Faint background formulas: beta_1 = (X_1'M X_1)^-1 X_1'M Y, bias = gamma x delta at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Confounding Trap

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "Naive slope: -0.093 (wrong sign!)"
- **Key number**: -0.093 naive coefficient that wrongly suggests coupons hurt sales
- **Body sentences**:
  - Income confounds the coupon-sales relationship -- wealthier areas get fewer coupons but buy more.
  - A naive regression wrongly concludes that coupons hurt sales.
- **Icon**: Chalk-drawn warning triangle with exclamation mark
- **Mini-viz**: Downward-sloping scatter plot with regression line labeled "-0.093" in warm orange
- **Connector to next**: "Where does the data come from?"

### Panel 2 -- The Simulated Store

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "3 paths, 200 obs, 1 hidden trap"
- **Key number**: 200 observations with 3 confounding paths (income to coupons -0.5, income to sales +0.3, coupons to sales +0.2)
- **Body sentences**:
  - The true causal effect of coupons on sales is +0.2 -- but the backdoor path through income hides it.
  - Income correlates -0.709 with coupons and +0.500 with sales, creating a strong negative bias.
- **Icon**: Chalk-drawn DAG with three nodes (Income, Coupons, Sales) and directional arrows with coefficients
- **Mini-viz**: DAG with arrows labeled -0.5, +0.3, and +0.2 showing the confounding structure
- **Connector to next**: "Can scatterfit reveal the truth?"

### Panel 3 -- FWL Residualization

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "Slope reverses to +0.212"
- **Key number**: +0.212 coefficient after controlling for income with controls(income)
- **Body sentences**:
  - One option in scatterfit -- controls(income) -- residualizes both axes and reveals the true positive effect.
  - R-squared jumps from 0.028 to 0.321 once the confounder is partialled out.
- **Icon**: Chalk-drawn Stata command prompt
- **Mini-viz**: Two side-by-side scatter plots -- left with downward slope "-0.093" in orange, right with upward slope "+0.212" in teal, reversal arrow labeled "controls(income)"
- **Connector to next**: "Can we predict the bias?"

### Panel 4 -- OVB Formula and Fixed Effects

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "-0.0934 = 0.2123 + (-0.3057)"
- **Key number**: OVB = gamma_hat x delta_hat = -0.3057, exactly the naive-minus-controlled gap (gamma_hat 0.3004 = income in the full model; delta_hat -1.0174 = slope of income ON coupons, `regress income coupons`); 0.04 pooled vs. 0.067 within-person wage slope (Figure 5, 150-person sample)
- **Body sentences**:
  - The OVB identity closes the gap exactly: gamma x delta, with delta the slope of income on coupons, equals naive minus controlled.
  - In the wage panel, individual FE raises the experience slope from 0.04 to 0.067 and R-squared from 0.043 to 0.59.
- **Icon**: Chalk-drawn formula "naive = full + gamma x delta" with labeled values; stick figure with briefcase for wage panel
- **Mini-viz**: Left half: two horizontal bars (Controlled +0.2123 teal, Naive -0.0934 orange) with bracket "OVB = -0.3057." Right half: two bars (Pooled 0.04 white, Within 0.067 teal) with "~1.7x" annotation in orange
- **Connector to next**: "What about large datasets?"

### Panel 5 -- Binned Scatters

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "5,000 flights, 20 quantile bins"
- **Key number**: 5,000 flights from NYC's three airports summarized in 20 bins
- **Body sentences**:
  - Binned scatter plots replace thousands of overlapping points with quantile-bin means -- a Stata-specific advantage.
  - The regression line is still estimated on all 5,000 observations; only the display is simplified.
- **Icon**: Chalk-drawn airplane
- **Mini-viz**: Left: dense blob of overlapping scatter points. Right: 20 evenly spaced bin-mean markers with fitted regression line
- **Connector to next**: "Does the algebra carry across languages?"

### Panel 6 -- Bottom Line

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "0.212288 -- six decimal places"
- **Key number**: 0.212288 -- the manual residual-on-residual slope equals the full-regression coefficient to six decimals; the R edition reproduces it because it loads the same 200-store data. The Python edition simulates its own 50-store sample, so its controlled estimate is +0.2673 (same identity, different draw).
- **Body sentences**:
  - The FWL theorem is an exact algebraic identity -- not an approximation -- in every language and every sample.
  - R and Stata load the same store data, so their numbers match; Python simulates its own 50 stores, so its estimates differ.
- **Icon**: Three stacked code boxes with language names and teal checkmark
- **Mini-viz**: Three rows: "Stata (200 stores): 0.212288" and "R (same 200 stores): 0.212288" connected by a teal equals sign; "Python (own 50-store draw): 0.2673" attached by a muted gray bracket labeled "same algebra, different sample"
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "Every multiple regression coefficient is secretly a bivariate scatter -- scatterfit just makes the secret visible!" -- positioned bottom-right margin, with arrow toward Panel 3
- **Color legend**: True / corrected effect: teal, Bias / naive estimate: warm orange, Data / controls: chalk white
- **Background formulas**: beta_1 = (X_1'M X_1)^-1 X_1'M Y, bias = gamma x delta, e_Y = Y - X_2 * beta_2 at 15-20% opacity
