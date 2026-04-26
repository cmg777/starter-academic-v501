# Evaluating Programs with Difference-in-Differences

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the naive before-after overestimate of 36.20 GPA points. Teal (#00d4c8) marks positive results like the robust DiD estimate of 25.32 GPA points. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "EVALUATING PROGRAMS WITH DIFFERENCE-IN-DIFFERENCES" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "How do we separate a program's true effect from natural time trends?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE PROBLEM" in steel blue small-caps chalk lettering. Inside the panel, two chalk-drawn stick-figure runners race along a track, one wearing a stopwatch around its neck, representing the naive before-after comparison that ignores natural improvement. A chalk-drawn upward arrow from 60.17 to 96.37 is drawn next to the runners, showing the raw GPA jump. The phrase "Naive gain: 36.20 -- overstated by 43%" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "A before-after comparison attributes the entire 36.20-point GPA increase to the tutoring program," "But 10.88 points come from natural time trends -- students improve even without the program," and "The comparison group improved by 10.88 points naturally -- proving the raw gain confounds treatment with time." A chalk arrow connects to Panel 2 with the phrase "What does the study look like?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "THE CASE STUDY" in steel blue small-caps chalk lettering. Inside the panel, two small chalk school-building icons stand side by side, one with a star above it representing the tutoring program. Below the icons, a chalk-drawn grouped bar chart shows two pairs of bars: the treated group's pre-GPA at 60.17 in warm orange (#e8956a) next to the comparison group's pre-GPA at 71.22 in steel blue (#8bb8e0), with a gap bracket labeled "11.05 gap" in muted gray (#b0a89a) between them. A small chalk label "35 schools, N = 70 obs" sits beneath the bars. The phrase "10 of 35 schools received the program" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "A government rolls out after-school tutoring in 10 high schools to boost low-income students' GPA," "The remaining 25 schools serve as the comparison group -- same region, same time, no program," and "Treated schools started 11.05 points below comparison schools at baseline." A chalk arrow connects to Panel 3 with the phrase "How does DiD isolate the effect?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "THE DiD DESIGN" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn double-difference symbol -- two stacked subtraction signs with an equals sign -- sits in the upper-left corner of the panel as a compact icon. Below it, a chalk-drawn mini line chart shows three lines: a solid line rising sharply from 60.17 to 96.37 labeled "Treated" in warm orange (#e8956a), a line rising gently from 71.22 to 82.10 labeled "Comparison" in steel blue (#8bb8e0), and a dashed line from 60.17 to 71.05 labeled "Counterfactual" in muted gray (#b0a89a). A vertical gap arrow between 71.05 and 96.37 is labeled "ATT" in teal (#00d4c8). The phrase "ATT = 25.32 GPA points" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The counterfactual asks: what would treated schools look like without the program?," "DiD subtracts the comparison group's 10.88-point gain to isolate the causal effect of 25.32 points," and "Treated schools reversed from 11.05 points below the comparison group to 14.27 points above it." A chalk arrow connects downward to Panel 4 with the phrase "Is this estimate robust?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "FIVE METHODS, ONE ANSWER" in steel blue small-caps chalk lettering. Inside the panel, five horizontal bars are drawn side by side in a comparison layout: each bar represents one estimation method (diff, reg, didregress, xtreg, reghdfe), all ending at approximately the same point near 25.3. The bars are labeled in chalk white (#f0ece2) with their method names on the left, and the bar endpoints are marked with small vertical ticks. The top bar is highlighted in teal (#00d4c8) to show the preferred clustered estimate, while the others are in chalk white (#f0ece2). A bracket annotation to the right reads "25.31-25.33" in teal (#00d4c8). The phrase "All five converge on 25.3" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "OLS interaction, Stata's didregress, xtreg FE, and reghdfe all produce the same DiD estimate," "Adding a covariate shifts the estimate by only 0.01 points -- the research design does the heavy lifting," and "Standard errors range from 0.585 (clustered) to 0.834 -- precise estimation across all methods." A chalk arrow connects to Panel 5 with the phrase "But can we trust the assumptions?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "PARALLEL TRENDS HOLD" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn event study plot shows the x-axis labeled from -4 to +3 (time to treatment) and the y-axis from -10 to 30. A horizontal dashed line at zero in muted gray (#b0a89a) serves as the reference. Eight dots are plotted: period -4 at 0.34, period -3 at -0.32, period -2 at 0.59, period -1 at exactly 0 (the benchmark, marked with a small hollow circle in teal (#00d4c8) and a tiny chalk annotation "ref" beneath it), then a sharp jump at period 0 to 25.0, period +1 at 24.7, period +2 at 24.8, and period +3 at 25.7. Each dot has a chalk-drawn vertical whisker extending above and below it representing the 95% confidence interval -- the pre-treatment whiskers are short and centered on zero, while the post-treatment whiskers are also short but centered high around 25, confirming tight estimation. The pre-treatment dots and the benchmark are connected by a nearly flat line hugging zero, then the line jumps sharply upward to the post-treatment plateau. A chalk-drawn magnifying glass hovers over the flat pre-trend region, emphasizing that all pre-treatment coefficients are indistinguishable from the zero benchmark. The phrase "Pre-trends: 0.34, -0.32, 0.59 -- all p > 0.10" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The event study confirms treated and comparison schools followed the same GPA trajectory before the program," "Period -1 is the benchmark -- set to zero by definition, all other effects are measured relative to it," and "Post-treatment effects range from 24.71 to 25.70 with no fade-out -- the benefit is sustained." A chalk arrow connects to Panel 6 with the phrase "What's the takeaway?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "BOTTOM LINE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn decision flowchart shows three nodes: "Random assignment?" leading to "RCT", "Same-time treatment?" leading to "Standard DiD", and "Staggered timing?" leading to "Modern DiD" -- with the Standard DiD node circled in teal (#00d4c8) and an annotation "This tutorial" beneath it. A chalk-drawn checkmark in teal sits next to the Standard DiD node. The phrase "DiD corrected a 43% overstatement" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Without the comparison group, the naive estimate overstates the program's effect by 10.88 GPA points," "DiD is the workhorse of program evaluation -- but always test parallel trends with an event study," and "For staggered treatment timing, modern estimators like Callaway and Sant'Anna (2021) address TWFE limitations."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "The comparison group's change is the counterfactual -- without it, you're just measuring time, not treatment!" A hand-drawn chalk arrow points from the note toward Panel 3. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Causal effect (ATT)", a warm orange (#e8956a) dot labeled "Bias / naive estimate", and a chalk white (#f0ece2) dot labeled "Data / assumptions."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "DiD = (Y_treat,post - Y_treat,pre) - (Y_ctrl,post - Y_ctrl,pre)" and "Y_it = alpha + beta_1 Treat_i + beta_2 Post_t + beta_3 (Treat x Post) + epsilon_it" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of school buildings, parallel trend lines, and subtraction symbols appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include photographs of real students or teachers.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "EVALUATING PROGRAMS WITH DIFFERENCE-IN-DIFFERENCES" in steel blue small-caps, subtitle: "How do we separate a program's true effect from natural time trends?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE PROBLEM" -- two chalk stick-figure runners with stopwatch, upward arrow from 60.17 to 96.37, orange "Naive gain: 36.20 -- overstated by 43%." Panel 2 (top-center): "THE CASE STUDY" -- chalk school-building icons, grouped bar chart showing treated pre-GPA 60.17 (orange) vs comparison 71.22 (steel blue) with gap bracket, orange "10 of 35 schools received the program." Panel 3 (top-right): "THE DiD DESIGN" -- double-difference symbol icon, three-line chart (treated rising sharply, comparison rising gently, dashed counterfactual), vertical gap arrow labeled ATT, teal "ATT = 25.32 GPA points." Panel 4 (bottom-left): "FIVE METHODS, ONE ANSWER" -- five horizontal bars all ending at ~25.3, top bar teal, others white, teal "All five converge on 25.3." Panel 5 (bottom-center): "PARALLEL TRENDS HOLD" -- event study plot with 8 dots from period -4 to +3, period -1 at zero (benchmark, teal hollow circle), vertical CI whiskers on each dot, flat pre-trends then sharp jump to ~25, magnifying glass over pre-trend, orange "Pre-trends: 0.34, -0.32, 0.59 -- all p > 0.10." Panel 6 (bottom-right): "BOTTOM LINE" -- decision flowchart (RCT / Standard DiD / Modern DiD), Standard DiD circled in teal, orange "DiD corrected a 43% overstatement." Professor's margin note bottom-right: "The comparison group's change is the counterfactual -- without it, you're just measuring time!" with arrow toward Panel 3. Color legend bottom-left: Causal effect: teal, Bias: orange, Data: white. Faint background formulas: DiD = (Y_treat,post - Y_treat,pre) - (Y_ctrl,post - Y_ctrl,pre), Y_it = alpha + beta_1 Treat + beta_2 Post + beta_3(Treat x Post) + epsilon at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Problem

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "Naive gain: 36.20 -- overstated by 43%"
- **Key number**: 36.20 GPA points (raw before-after increase), 43% overstatement
- **Body sentences**:
  - A before-after comparison attributes the entire 36.20-point GPA increase to the tutoring program.
  - But 10.88 points come from natural time trends -- students improve even without the program.
  - The comparison group improved by 10.88 points naturally -- proving the raw gain confounds treatment with time.
- **Icon**: Two chalk-drawn stick-figure runners racing along a track, one wearing a stopwatch
- **Mini-viz**: Chalk upward arrow from 60.17 to 96.37 showing the raw GPA jump
- **Connector to next**: "What does the study look like?"

### Panel 2 -- The Case Study

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "10 of 35 schools received the program"
- **Key number**: 35 schools total, 10 treated, 25 comparison, 70 observations
- **Body sentences**:
  - A government rolls out after-school tutoring in 10 high schools to boost low-income students' GPA.
  - The remaining 25 schools serve as the comparison group -- same region, same time, no program.
  - Treated schools started 11.05 points below comparison schools at baseline.
- **Icon**: Two chalk school-building icons, one with a star above it (tutoring program)
- **Mini-viz**: Grouped bar chart showing treated pre-GPA (60.17, warm orange) next to comparison pre-GPA (71.22, steel blue), with gap bracket labeled "11.05 gap"
- **Connector to next**: "How does DiD isolate the effect?"

### Panel 3 -- The DiD Design

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "ATT = 25.32 GPA points"
- **Key number**: 25.32 GPA points (Average Treatment Effect on the Treated)
- **Body sentences**:
  - The counterfactual asks: what would treated schools look like without the program?
  - DiD subtracts the comparison group's 10.88-point gain to isolate the causal effect of 25.32 points.
  - Treated schools reversed from 11.05 points below the comparison group to 14.27 points above it.
- **Icon**: Chalk-drawn double-difference symbol -- two stacked subtraction signs with an equals sign
- **Mini-viz**: Solid line 60.17 to 96.37 (treated), line 71.22 to 82.10 (comparison), dashed line 60.17 to 71.05 (counterfactual), vertical gap arrow labeled "ATT" in teal
- **Connector to next**: "Is this estimate robust?"

### Panel 4 -- Five Methods, One Answer

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "All five converge on 25.3"
- **Key number**: 25.31-25.33 across diff, reg, didregress, xtreg, reghdfe
- **Body sentences**:
  - OLS interaction, Stata's didregress, xtreg FE, and reghdfe all produce the same DiD estimate.
  - Adding a covariate shifts the estimate by only 0.01 points -- the research design does the heavy lifting.
  - Standard errors range from 0.585 (clustered) to 0.834 -- precise estimation across all methods.
- **Icon**: Five chalk arrows converging to a single point
- **Mini-viz**: Five horizontal bars labeled with method names, all ending at ~25.3, top bar in teal, bracket annotation "25.31-25.33"
- **Connector to next**: "But can we trust the assumptions?"

### Panel 5 -- Parallel Trends Hold

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "Pre-trends: 0.34, -0.32, 0.59 -- all p > 0.10"
- **Key number**: Pre-treatment coefficients near zero; post-treatment lags 24.71 to 25.70
- **Body sentences**:
  - The event study confirms treated and comparison schools followed the same GPA trajectory before the program.
  - Period -1 is the benchmark -- set to zero by definition, all other effects are measured relative to it.
  - Post-treatment effects range from 24.71 to 25.70 with no fade-out -- the benefit is sustained.
- **Icon**: Chalk-drawn magnifying glass hovering over the flat pre-trend region
- **Mini-viz**: Event study plot with x-axis -4 to +3; dots at -4 (0.34), -3 (-0.32), -2 (0.59), -1 (0, benchmark in teal hollow circle with "ref" label), 0 (25.0), +1 (24.7), +2 (24.8), +3 (25.7); each dot has vertical whiskers for 95% CIs; dashed zero reference line
- **Connector to next**: "What's the takeaway?"

### Panel 6 -- Bottom Line

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "DiD corrected a 43% overstatement"
- **Key number**: 43% overstatement (10.88 of 36.20 points attributable to time trends)
- **Body sentences**:
  - Without the comparison group, the naive estimate overstates the program's effect by 10.88 GPA points.
  - DiD is the workhorse of program evaluation -- but always test parallel trends with an event study.
  - For staggered treatment timing, modern estimators like Callaway and Sant'Anna (2021) address TWFE limitations.
- **Icon**: Chalk-drawn decision flowchart with three branches (RCT / Standard DiD / Modern DiD)
- **Mini-viz**: Decision tree: "Random assignment?" -> "RCT", "Same-time treatment?" -> "Standard DiD" (circled in teal), "Staggered timing?" -> "Modern DiD"
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "The comparison group's change is the counterfactual -- without it, you're just measuring time, not treatment!" -- positioned bottom-right margin, with arrow toward Panel 3
- **Color legend**: Causal effect (ATT): teal, Bias / naive estimate: warm orange, Data / assumptions: chalk white
- **Background formulas**: DiD = (Y_treat,post - Y_treat,pre) - (Y_ctrl,post - Y_ctrl,pre), Y_it = alpha + beta_1 Treat_i + beta_2 Post_t + beta_3 (Treat x Post) + epsilon_it at 15-20% opacity
