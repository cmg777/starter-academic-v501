# Isolating Causal Effects with Difference-in-Differences

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the 28.3% weight on forbidden comparisons that bias TWFE downward. Teal (#00d4c8) marks positive results like the Callaway-Sant'Anna corrected ATT of 2.41 and the HonestDiD breakdown at M = 12. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "ISOLATING CAUSAL EFFECTS WITH DIFFERENCE-IN-DIFFERENCES" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "How do you separate a policy's true impact from pre-existing trends?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE PROBLEM" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn city skyline with two groups of buildings is sketched -- one group labeled "Treated" and the other "Control," with parallel upward-sloping trend lines running through both groups and a large question mark hovering where the treated line diverges. A small chalk-drawn mirror icon sits between the groups, representing the control group as a mirror of what would have happened. The phrase "Parallel trends: untestable but essential" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "A government launches job training in some cities but not others -- did the program work, or were those cities already improving?" and "DiD uses the control group as a mirror: it shows what would have happened without the intervention." A chalk arrow connects to Panel 2 with the phrase "Let's estimate the effect" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "CLASSIC 2x2 DiD" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn 2x2 grid shows four cells labeled "Control Pre," "Control Post," "Treated Pre," and "Treated Post," with chalk arrows showing the two differences being subtracted. A small chalk-drawn counterfactual dashed line extends from the treated pre-treatment level, with the gap between it and the actual treated post-treatment outcome shaded lightly in teal (#00d4c8). The phrase "ATT = 5.12" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "100 units observed over 10 periods -- the estimator recovers the true effect of 5.0 within sampling error" and "95% CI: [4.64, 5.60] with a t-statistic of 20.86 -- highly significant." A chalk arrow connects to Panel 3 with the phrase "But what if timing varies?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "THE STAGGERED ADOPTION TRAP" in steel blue small-caps chalk lettering. Inside the panel, three chalk-drawn cohort lines diverge upward at different time points (periods 3, 5, and 7), each marked with a small vertical dashed line at its treatment onset, while a fourth flat line labeled "Never-treated" runs along the bottom. A chalk-drawn warning triangle with an exclamation mark sits near the forbidden comparison arrows that connect already-treated cohorts to newly-treated ones. The phrase "28.3% forbidden weight" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "TWFE uses already-treated units as controls for newly-treated ones -- the forbidden comparisons" and "300 units across 3 cohorts: Bacon decomposition reveals contamination dragging TWFE down to 2.18." A chalk arrow connects downward to Panel 4 with the phrase "How much bias does this cause?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "TWFE VS CALLAWAY-SANT'ANNA" in steel blue small-caps chalk lettering. Inside the panel, two chalk-drawn horizontal bars are placed side by side: the top bar labeled "TWFE = 2.18" in chalk white (#f0ece2) and the bottom bar labeled "CS = 2.41" highlighted in teal (#00d4c8), with the CS bar visibly longer. A small chalk check mark appears next to the CS bar and a chalk X next to the TWFE bar. The phrase "10% upward correction" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Callaway-Sant'Anna uses only never-treated units as controls -- eliminating all forbidden comparisons" and "CS event study reveals growing effects: from 1.97 at treatment onset to 3.27 six periods later." A chalk arrow connects to Panel 5 with the phrase "But how robust is this?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "HONESTDID SENSITIVITY" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn funnel or trumpet shape opens from left to right, representing the widening confidence interval as M increases. The narrow end at left is labeled "M = 0" with a tight CI band, and the wide end at right labeled "M = 12" where the band crosses a horizontal zero line. A chalk-drawn shield icon with a checkmark sits near the narrow end, representing robustness. The phrase "Breakdown at M = 12" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The ATT stays significant even if post-treatment violations are 12x worse than pre-treatment deviations" and "At M = 10 the lower bound barely holds at 0.06 -- at M = 12 it crosses zero to -0.44." A chalk arrow connects to Panel 6 with the phrase "So what should you do?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "BOTTOM LINE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn decision flowchart shows three branching nodes: "Single timing?" leads to "Classic DiD," "Staggered?" leads to "Callaway-Sant'Anna" (circled in teal #00d4c8), and "Always" leads to "Report HonestDiD breakdown" (underlined in warm orange #e8956a). A small chalk-drawn ascending staircase icon represents the growing treatment effects. The phrase "Effects grow from 1.97 to 3.27 over time" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Single treatment period? Use classic DiD. Staggered adoption? Use Callaway-Sant'Anna with never-treated controls" and "Always report the HonestDiD breakdown value -- a breakdown above M = 3 signals strong robustness."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "TWFE is not wrong -- it's just a weighted average with bad weights under staggered timing!" A hand-drawn chalk arrow points from the note toward Panel 3. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Causal effect / ATT," a warm orange (#e8956a) dot labeled "Bias / forbidden comparisons," and a chalk white (#f0ece2) dot labeled "Data / assumptions."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "Y_it = alpha + gamma Treated_i + lambda Post_t + delta (Treated x Post) + epsilon" and "ATT(g,t) = E[Y_t - Y_{g-1} | G=g] - E[Y_t - Y_{g-1} | G=inf]" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of trend lines, counterfactual dashed paths, and small 2x2 grids appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include real-world city photographs or maps.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "ISOLATING CAUSAL EFFECTS WITH DIFFERENCE-IN-DIFFERENCES" in steel blue small-caps, subtitle: "How do you separate a policy's true impact from pre-existing trends?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE PROBLEM" -- chalk city skyline with two groups and parallel trend lines, mirror icon, orange callout "Parallel trends: untestable but essential." Panel 2 (top-center): "CLASSIC 2x2 DiD" -- chalk 2x2 grid with counterfactual dashed line, teal shaded treatment gap, teal "ATT = 5.12." Panel 3 (top-right): "THE STAGGERED ADOPTION TRAP" -- three cohort lines diverging at periods 3, 5, 7, warning triangle, orange "28.3% forbidden weight." Panel 4 (bottom-left): "TWFE VS CALLAWAY-SANT'ANNA" -- two horizontal bars: TWFE 2.18 (white) vs CS 2.41 (teal), check/X marks, teal "10% upward correction." Panel 5 (bottom-center): "HONESTDID SENSITIVITY" -- widening funnel from M=0 to M=12, shield icon, orange "Breakdown at M = 12." Panel 6 (bottom-right): "BOTTOM LINE" -- decision flowchart (single timing? -> classic DiD, staggered? -> CS in teal, always -> report HonestDiD), teal "Effects grow from 1.97 to 3.27." Professor's margin note bottom-right: "TWFE is not wrong -- it's just a weighted average with bad weights under staggered timing!" with arrow toward Panel 3. Color legend bottom-left: Causal effect: teal, Bias: orange, Data: white. Faint background formulas: Y_it = alpha + gamma Treated + lambda Post + delta(Treated x Post) + epsilon, ATT(g,t) = E[Y_t - Y_{g-1} | G=g] - E[Y_t - Y_{g-1} | G=inf] at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Problem

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "Parallel trends: untestable but essential"
- **Key number**: N/A (conceptual panel)
- **Body sentences**:
  - A government launches job training in some cities but not others -- did the program work, or were those cities already improving?
  - DiD uses the control group as a mirror: it shows what would have happened without the intervention.
- **Icon**: Chalk-drawn city skyline with two groups of buildings (treated and control) and a mirror between them
- **Mini-viz**: Two parallel upward-sloping trend lines through the building groups with a question mark where the treated line diverges
- **Connector to next**: "Let's estimate the effect"

### Panel 2 -- Classic 2x2 DiD

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "ATT = 5.12"
- **Key number**: ATT = 5.12 (true effect = 5.0), 95% CI [4.64, 5.60], t = 20.86
- **Body sentences**:
  - 100 units observed over 10 periods -- the estimator recovers the true effect of 5.0 within sampling error.
  - 95% CI: [4.64, 5.60] with a t-statistic of 20.86 -- highly significant.
- **Icon**: Chalk-drawn 2x2 grid with four cells showing the double differencing arrows
- **Mini-viz**: Counterfactual dashed line extending from treated pre-treatment level with teal-shaded gap to actual post-treatment outcome
- **Connector to next**: "But what if timing varies?"

### Panel 3 -- The Staggered Adoption Trap

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "28.3% forbidden weight"
- **Key number**: 28.3% of TWFE weight on forbidden comparisons, TWFE estimate = 2.18
- **Body sentences**:
  - TWFE uses already-treated units as controls for newly-treated ones -- the forbidden comparisons.
  - 300 units across 3 cohorts: Bacon decomposition reveals contamination dragging TWFE down to 2.18.
- **Icon**: Chalk-drawn warning triangle with exclamation mark near forbidden comparison arrows
- **Mini-viz**: Three cohort lines diverging upward at periods 3, 5, and 7 with a flat never-treated line along the bottom
- **Connector to next**: "How much bias does this cause?"

### Panel 4 -- TWFE vs Callaway-Sant'Anna

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "10% upward correction"
- **Key number**: TWFE = 2.18 vs CS = 2.41, CS 95% CI [2.31, 2.52]
- **Body sentences**:
  - Callaway-Sant'Anna uses only never-treated units as controls -- eliminating all forbidden comparisons.
  - CS event study reveals growing effects: from 1.97 at treatment onset to 3.27 six periods later.
- **Icon**: Chalk check mark next to CS bar and chalk X next to TWFE bar
- **Mini-viz**: Two horizontal bars: top bar labeled "TWFE = 2.18" in chalk white and bottom bar labeled "CS = 2.41" highlighted in teal, CS bar visibly longer
- **Connector to next**: "But how robust is this?"

### Panel 5 -- HonestDiD Sensitivity

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "Breakdown at M = 12"
- **Key number**: M = 12 breakdown value; at M = 10 lower bound = 0.06, at M = 12 lower bound = -0.44
- **Body sentences**:
  - The ATT stays significant even if post-treatment violations are 12x worse than pre-treatment deviations.
  - At M = 10 the lower bound barely holds at 0.06 -- at M = 12 it crosses zero to -0.44.
- **Icon**: Chalk-drawn shield with checkmark representing robustness
- **Mini-viz**: Funnel/trumpet shape opening left to right, narrow end at M = 0 with tight CI band, wide end at M = 12 crossing a horizontal zero line
- **Connector to next**: "So what should you do?"

### Panel 6 -- Bottom Line

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "Effects grow from 1.97 to 3.27 over time"
- **Key number**: CS event study range: 1.97 (period 0) to 3.27 (period +6)
- **Body sentences**:
  - Single treatment period? Use classic DiD. Staggered adoption? Use Callaway-Sant'Anna with never-treated controls.
  - Always report the HonestDiD breakdown value -- a breakdown above M = 3 signals strong robustness.
- **Icon**: Chalk-drawn ascending staircase representing growing treatment effects
- **Mini-viz**: Decision flowchart with three branches: "Single timing?" -> "Classic DiD," "Staggered?" -> "Callaway-Sant'Anna" (circled in teal), "Always" -> "Report HonestDiD breakdown" (underlined in orange)
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "TWFE is not wrong -- it's just a weighted average with bad weights under staggered timing!" -- positioned bottom-right margin, with arrow toward Panel 3
- **Color legend**: Causal effect / ATT: teal, Bias / forbidden comparisons: warm orange, Data / assumptions: chalk white
- **Background formulas**: Y_it = alpha + gamma Treated_i + lambda Post_t + delta (Treated x Post) + epsilon, ATT(g,t) = E[Y_t - Y_{g-1} | G=g] - E[Y_t - Y_{g-1} | G=inf] at 15-20% opacity
