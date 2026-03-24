# Evaluating an RCT with Panel Data in Stata

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the 9.3% gender SMD imbalance at baseline. Teal (#00d4c8) marks positive results like all confidence intervals containing the true effect of 0.12. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "EVALUATING AN RCT WITH PANEL DATA" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "How many methods does it take to trust a treatment effect?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE STUDY DESIGN" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn flowchart shows a group of stick figures splitting into two branches -- one labeled "Treatment" and one labeled "Control" -- with a funnel icon above labeled "Stratified Randomization." A chalk timeline beneath shows two dots connected by a dashed line, labeled "2021 Baseline" and "2024 Endline." The phrase "2,000 households, 2 waves" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "A cash transfer RCT tracks 2,000 households across baseline and endline surveys" and "Imperfect compliance: 85% of treated received the transfer, 5% of controls did too." A chalk arrow connects to Panel 2 with the phrase "Did randomization work?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "BASELINE BALANCE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn dot plot shows five horizontal lines representing covariates (y, age, edu, female, poverty), with dots clustered near the zero line and a dashed vertical threshold at 10%. The dot for "female" sits near the threshold, highlighted with a small warm orange circle. A small chalk-drawn scale icon (balanced scale with pans level) appears in the corner. The phrase "SMD = 9.3% for gender" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "T-tests and balance plots confirm all SMDs below the 10% rule of thumb" and "AIPW baseline test: ATE = -0.024, p = 0.196 -- no pre-treatment difference." A chalk arrow connects to Panel 3 with the phrase "Three ways to estimate effects" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "RA vs. IPW vs. DOUBLY ROBUST" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn Venn-style diagram shows two overlapping circles: one labeled "Outcome Model (RA)" in steel blue (#8bb8e0) and one labeled "Treatment Model (IPW)" in warm orange (#e8956a), with the overlap region labeled "DR" in teal (#00d4c8). A small chalk-drawn shield icon with a checkmark appears beside the DR label, representing the doubly robust "insurance" property. The phrase "Insurance against misspecification" appears in large teal (#00d4c8) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "RA models the outcome, IPW models treatment assignment, DR models both" and "DR is consistent if either model is correct -- you only need one to be right." A chalk arrow connects downward to Panel 4 with the phrase "What do the numbers say?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "CROSS-SECTIONAL RESULTS" in steel blue small-caps chalk lettering. Inside the panel, three horizontal bars are drawn side by side, each representing a method's ATE estimate: the first labeled "RA" in steel blue (#8bb8e0), the second labeled "IPW" in warm orange (#e8956a), and the third labeled "DR" in teal (#00d4c8), all at approximately the same height with a dashed horizontal reference line at 0.12 labeled "True effect" in muted gray (#b0a89a). All three bars are highlighted in teal (#00d4c8) because they all converge. The phrase "All three converge at ~0.113" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "RA = 0.113, IPW = 0.113, DR = 0.113 -- all within 0.007 of the true 0.12" and "ATE and ATT are nearly identical, confirming homogeneous treatment effects." A chalk arrow connects to Panel 5 with the phrase "Can panel data do better?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "DiD AND DOUBLY ROBUST DiD" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn parallel trends diagram shows two lines: a solid line rising from a lower-left point labeled "Treated" and a dashed line rising at the same slope from a higher-left point labeled "Control," with a vertical gap between them at the endline labeled with a delta symbol. A small chalk-drawn clock icon represents the two time periods. The phrase "ATT = 0.135 to 0.137" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "DiD compares each household to itself over time, absorbing unobservable fixed effects" and "DRDID extends doubly robust logic to the panel setting -- ATT = 0.137, CI [0.084, 0.191]." A chalk arrow connects to Panel 6 with the phrase "What did we learn?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "KEY TAKEAWAYS" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn checklist shows three items with chalk checkmarks in teal (#00d4c8): the first reads "All CIs contain 0.12," the second reads "DR = insurance," and the third reads "DiD controls unobservables." A small chalk-drawn trophy or ribbon icon represents the successful recovery of the true effect. The phrase "11--14% consumption increase across all methods" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Every confidence interval contains the true effect of 0.12 -- all methods succeed" and "Doubly robust methods provide the safest bet when model correctness is uncertain."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "In an RCT, covariates improve precision, not reduce bias -- that is a crucial distinction!" A hand-drawn chalk arrow points from the note toward Panel 3. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Treatment effect / convergence", a warm orange (#e8956a) dot labeled "Imbalance / key numbers", and a chalk white (#f0ece2) dot labeled "Data / assumptions."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "ATE = E[Y(1) - Y(0)]" and "tau_DiD = (Y_treat,post - Y_treat,pre) - (Y_ctrl,post - Y_ctrl,pre)" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of stick figures, balanced scales, and shield icons appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include Stata software screenshots or terminal windows.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "EVALUATING AN RCT WITH PANEL DATA" in steel blue small-caps, subtitle: "How many methods does it take to trust a treatment effect?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE STUDY DESIGN" -- chalk stick figures splitting into treatment/control branches, timeline with 2021/2024, orange "2,000 households, 2 waves." Panel 2 (top-center): "BASELINE BALANCE" -- chalk dot plot with five covariates near zero line, "female" dot near 10% threshold, balanced scale icon, orange "SMD = 9.3% for gender." Panel 3 (top-right): "RA vs. IPW vs. DOUBLY ROBUST" -- Venn diagram with RA circle (blue), IPW circle (orange), DR overlap (teal), shield icon, teal "Insurance against misspecification." Panel 4 (bottom-left): "CROSS-SECTIONAL RESULTS" -- three horizontal bars (RA, IPW, DR) at same height, dashed line at true effect 0.12, teal "All three converge at ~0.113." Panel 5 (bottom-center): "DiD AND DOUBLY ROBUST DiD" -- parallel trends diagram with treated/control lines, clock icon, orange "ATT = 0.135 to 0.137." Panel 6 (bottom-right): "KEY TAKEAWAYS" -- checklist with three teal checkmarks, trophy icon, orange "11--14% consumption increase across all methods." Professor's margin note bottom-right: "In an RCT, covariates improve precision, not reduce bias!" with arrow toward Panel 3. Color legend bottom-left: Treatment effect: teal, Imbalance: orange, Data: white. Faint background formulas: ATE = E[Y(1) - Y(0)], tau_DiD = (Y_treat,post - Y_treat,pre) - (Y_ctrl,post - Y_ctrl,pre) at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Study Design

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "2,000 households, 2 waves"
- **Key number**: 2,000 households across baseline (2021) and endline (2024)
- **Body sentences**:
  - A cash transfer RCT tracks 2,000 households across baseline and endline surveys.
  - Imperfect compliance: 85% of treated received the transfer, 5% of controls did too.
- **Icon**: Chalk-drawn stick figures splitting into two branches (treatment/control) with a funnel labeled "Stratified Randomization"
- **Mini-viz**: Timeline with two dots connected by a dashed line, labeled "2021 Baseline" and "2024 Endline"
- **Connector to next**: "Did randomization work?"

### Panel 2 -- Baseline Balance

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "SMD = 9.3% for gender"
- **Key number**: 9.3% standardized mean difference for the female variable
- **Body sentences**:
  - T-tests and balance plots confirm all SMDs below the 10% rule of thumb.
  - AIPW baseline test: ATE = -0.024, p = 0.196 -- no pre-treatment difference.
- **Icon**: Chalk-drawn balanced scale with level pans
- **Mini-viz**: Dot plot with five horizontal lines (y, age, edu, female, poverty), dots near zero, dashed 10% threshold, "female" dot highlighted in warm orange
- **Connector to next**: "Three ways to estimate effects"

### Panel 3 -- RA vs. IPW vs. Doubly Robust

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "Insurance against misspecification"
- **Key number**: DR is consistent if either of two models is correct
- **Body sentences**:
  - RA models the outcome, IPW models treatment assignment, DR models both.
  - DR is consistent if either model is correct -- you only need one to be right.
- **Icon**: Chalk-drawn shield with a checkmark (doubly robust "insurance")
- **Mini-viz**: Venn diagram with two overlapping circles: "Outcome Model (RA)" in steel blue and "Treatment Model (IPW)" in warm orange, overlap labeled "DR" in teal
- **Connector to next**: "What do the numbers say?"

### Panel 4 -- Cross-Sectional Results

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "All three converge at ~0.113"
- **Key number**: RA = 0.113, IPW = 0.113, DR = 0.113 (true effect = 0.12)
- **Body sentences**:
  - RA = 0.113, IPW = 0.113, DR = 0.113 -- all within 0.007 of the true 0.12.
  - ATE and ATT are nearly identical, confirming homogeneous treatment effects.
- **Icon**: Three horizontal bars at the same height (convergence)
- **Mini-viz**: Three bars labeled RA (steel blue), IPW (warm orange), DR (teal), all at ~0.113, with a dashed reference line at 0.12 labeled "True effect"
- **Connector to next**: "Can panel data do better?"

### Panel 5 -- DiD and Doubly Robust DiD

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "ATT = 0.135 to 0.137"
- **Key number**: Basic DiD ATT = 0.135, DRDID ATT = 0.137, CI [0.084, 0.191]
- **Body sentences**:
  - DiD compares each household to itself over time, absorbing unobservable fixed effects.
  - DRDID extends doubly robust logic to the panel setting -- ATT = 0.137, CI [0.084, 0.191].
- **Icon**: Chalk-drawn clock (two time periods)
- **Mini-viz**: Parallel trends diagram with solid "Treated" line and dashed "Control" line at same slope, vertical gap at endline labeled with delta symbol
- **Connector to next**: "What did we learn?"

### Panel 6 -- Key Takeaways

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "11--14% consumption increase across all methods"
- **Key number**: Range 0.113 to 0.137 across all methods, true effect 0.12
- **Body sentences**:
  - Every confidence interval contains the true effect of 0.12 -- all methods succeed.
  - Doubly robust methods provide the safest bet when model correctness is uncertain.
- **Icon**: Chalk-drawn trophy or ribbon (successful recovery of true effect)
- **Mini-viz**: Checklist with three teal checkmarks: "All CIs contain 0.12", "DR = insurance", "DiD controls unobservables"
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "In an RCT, covariates improve precision, not reduce bias -- that is a crucial distinction!" -- positioned bottom-right margin, with arrow toward Panel 3
- **Color legend**: Treatment effect / convergence: teal, Imbalance / key numbers: warm orange, Data / assumptions: chalk white
- **Background formulas**: ATE = E[Y(1) - Y(0)], tau_DiD = (Y_treat,post - Y_treat,pre) - (Y_ctrl,post - Y_ctrl,pre) at 15-20% opacity
