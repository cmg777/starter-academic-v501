# Sensitivity Analysis for Parallel Trends in DiD

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the breakdown value crossing zero at M-bar = 2 in the full-panel analysis. Teal (#00d4c8) marks positive results like the 2x2 DiD estimate of 6.18 percentage points surviving sensitivity analysis up to M-bar = 2. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "HOW ROBUST IS YOUR DIFF-IN-DIFF?" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "How large would violations of parallel trends need to be before your conclusion changes?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE PARALLEL TRENDS PROBLEM" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn pair of trend lines shows two groups moving in parallel, with a dashed line diverging from one of them and a large question mark hovering above the divergence, representing the untestable assumption. The phrase "Untestable with only 2 periods" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Every DiD estimate rests on parallel trends -- but with two periods, you cannot check whether groups were already diverging" and "Pre-trends tests have low power and create a false sense of security." A chalk arrow connects to Panel 2 with the phrase "Enter the Medicaid expansion" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "MEDICAID EXPANSION STUDY" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn outline of the United States with some states shaded in teal (#00d4c8) for treatment and others in chalk white (#f0ece2) for control represents the quasi-experiment. A small chalk table shows four cells with means: 61.9%, 68.4%, 65.4%, 78.1%. The phrase "DiD = 6.18 pp" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "22 states expanded Medicaid in 2014 vs 16 never-expanders -- 38 states across 8 years (2008--2015)" and "Insurance coverage rose 6.18 percentage points more in expanding states (t = 7.24, p < 0.001)." A chalk arrow connects to Panel 3 with the phrase "But how robust is this?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "RELATIVE MAGNITUDES (2x2)" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn sensitivity plot shows an x-axis labeled "M-bar" from 0 to 2 and a y-axis showing a confidence interval band that widens from left to right but stays above a zero reference line drawn in muted gray (#b0a89a). A chalk-drawn bridge icon appears next to the plot, representing the stress-test analogy. The phrase "Survives up to M-bar = 2" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Even allowing post-treatment violations twice the pre-treatment divergence, the lower bound stays positive at 0.003" and "The breakdown value is the safety margin -- like a stress test for your DiD estimate." A chalk arrow connects downward to Panel 4 with the phrase "Now with more pre-periods" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "RM vs SMOOTHNESS (FULL PANEL)" in steel blue small-caps chalk lettering. Inside the panel, two side-by-side chalk-drawn interval bars compare the two restrictions: one labeled "RM" with a bracket showing breakdown at M-bar approximately 1.5--2 in teal (#00d4c8), and one labeled "SD" with a bracket showing breakdown at M approximately 0.015--0.02 in chalk white (#f0ece2), with the SD bar annotated "tighter" in muted gray (#b0a89a). The phrase "Breakdown: M-bar ~ 1.5--2 (RM) vs M ~ 0.02 (SD)" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Relative magnitudes: post violation can be 1.5--2x the worst pre-period deviation before results break down" and "Smoothness: trend must accelerate by 1.5--2 pp per year to overturn the finding -- both confirm moderate robustness." A chalk arrow connects to Panel 5 with the phrase "What about staggered timing?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "STAGGERED DiD CONFIRMS" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn event study plot shows five pre-treatment dots clustered near zero and two post-treatment dots jumping upward, with the 2014 dot labeled "4.23 pp" and the 2015 dot labeled "6.87 pp" in warm orange (#e8956a). A small chalk checkmark in teal (#00d4c8) sits beside the plot. The phrase "TWFE and CS estimates agree" appears in large teal (#00d4c8) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Callaway-Sant'Anna staggered estimator yields the same breakdown value of M-bar ~ 1.5--2" and "Pre-trends F-test: F = 0.86, p = 0.518 -- but passing this test alone is not enough." A chalk arrow connects to Panel 6 with the phrase "So what should you report?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "REPORT THE BREAKDOWN VALUE" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn checklist shows three items: "1. Estimate DiD" with a teal (#00d4c8) checkmark, "2. Run honestdid" with a teal checkmark, and "3. Report breakdown" with a teal checkmark, each in chalk white (#f0ece2). A chalk-drawn badge or stamp icon in warm orange (#e8956a) represents the seal of credibility. The phrase "Every DiD should report a breakdown value" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The breakdown value replaces the binary pre-trends test with a continuous measure of robustness" and "honestdid works with reghdfe, csdid, and did_multiplegt -- even with just one pre-period."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "The pre-trends test is a smoke detector that only beeps for large fires -- report the breakdown value instead!" A hand-drawn chalk arrow points from the note toward Panel 5. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Robust effect / positive result", a warm orange (#e8956a) dot labeled "Breakdown threshold / caution", and a chalk white (#f0ece2) dot labeled "Data / estimation method."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "delta_post <= M-bar * max|delta_pre|" and "|(delta_t+1 - delta_t) - (delta_t - delta_t-1)| <= M" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of trend lines, parallel arrows, and sensitivity curves appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include medical or health insurance imagery (hospital icons, stethoscopes) -- keep the focus on methodology.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "HOW ROBUST IS YOUR DIFF-IN-DIFF?" in steel blue small-caps, subtitle: "How large would violations of parallel trends need to be before your conclusion changes?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE PARALLEL TRENDS PROBLEM" -- two chalk trend lines with diverging dashed line and question mark, orange "Untestable with only 2 periods." Panel 2 (top-center): "MEDICAID EXPANSION STUDY" -- chalk US map with shaded states, four-cell means table, orange "DiD = 6.18 pp" (t = 7.24). Panel 3 (top-right): "RELATIVE MAGNITUDES (2x2)" -- chalk sensitivity plot with CI band above zero, bridge icon, teal "Survives up to M-bar = 2." Panel 4 (bottom-left): "RM vs SMOOTHNESS (FULL PANEL)" -- two side-by-side interval bars comparing RM (M-bar ~ 1.5--2) and SD (M ~ 0.02), orange "Breakdown: M-bar ~ 1.5--2 vs M ~ 0.02." Panel 5 (bottom-center): "STAGGERED DiD CONFIRMS" -- event study dots near zero pre-treatment, jumping to 4.23 pp and 6.87 pp post, teal "TWFE and CS estimates agree." Panel 6 (bottom-right): "REPORT THE BREAKDOWN VALUE" -- chalk checklist (estimate, honestdid, report), badge icon, orange "Every DiD should report a breakdown value." Professor's margin note bottom-right: "The pre-trends test is a smoke detector that only beeps for large fires!" with arrow toward Panel 5. Color legend bottom-left: Robust effect: teal, Breakdown: orange, Data: white. Faint background formulas: delta_post <= M-bar * max|delta_pre|, |(delta_t+1 - delta_t) - (delta_t - delta_t-1)| <= M at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Parallel Trends Problem

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "Untestable with only 2 periods"
- **Key number**: N/A (conceptual panel)
- **Body sentences**:
  - Every DiD estimate rests on parallel trends -- but with two periods, you cannot check whether groups were already diverging.
  - Pre-trends tests have low power and create a false sense of security.
- **Icon**: Chalk-drawn pair of trend lines with a dashed divergence and hovering question mark
- **Mini-viz**: N/A (conceptual panel)
- **Connector to next**: "Enter the Medicaid expansion"

### Panel 2 -- Medicaid Expansion Study

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "DiD = 6.18 pp"
- **Key number**: 6.18 percentage point increase in insurance coverage (t = 7.24, p < 0.001)
- **Body sentences**:
  - 22 states expanded Medicaid in 2014 vs 16 never-expanders -- 38 states across 8 years (2008--2015).
  - Insurance coverage rose 6.18 percentage points more in expanding states (t = 7.24, p < 0.001).
- **Icon**: Chalk-drawn US map outline with treatment states shaded in teal and control states in chalk white
- **Mini-viz**: Small chalk table with four cells: control pre (61.9%), control post (68.4%), treated pre (65.4%), treated post (78.1%)
- **Connector to next**: "But how robust is this?"

### Panel 3 -- Relative Magnitudes (2x2)

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "Survives up to M-bar = 2"
- **Key number**: Lower bound = 0.003 at M-bar = 2 (still positive)
- **Body sentences**:
  - Even allowing post-treatment violations twice the pre-treatment divergence, the lower bound stays positive at 0.003.
  - The breakdown value is the safety margin -- like a stress test for your DiD estimate.
- **Icon**: Chalk-drawn bridge icon representing the stress-test analogy
- **Mini-viz**: Chalk sensitivity plot with x-axis M-bar (0 to 2), widening CI band that stays above the zero line
- **Connector to next**: "Now with more pre-periods"

### Panel 4 -- RM vs Smoothness (Full Panel)

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "Breakdown: M-bar ~ 1.5--2 (RM) vs M ~ 0.02 (SD)"
- **Key number**: RM breakdown at M-bar ~ 1.5--2; SD breakdown at M ~ 0.015--0.02
- **Body sentences**:
  - Relative magnitudes: post violation can be 1.5--2x the worst pre-period deviation before results break down.
  - Smoothness: trend must accelerate by 1.5--2 pp per year to overturn the finding -- both confirm moderate robustness.
- **Icon**: Two side-by-side interval bars (comparison visual)
- **Mini-viz**: Two horizontal bars: RM bar with bracket at M-bar ~ 1.5--2 in teal, SD bar with bracket at M ~ 0.02 in chalk white, SD annotated "tighter"
- **Connector to next**: "What about staggered timing?"

### Panel 5 -- Staggered DiD Confirms

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "TWFE and CS estimates agree"
- **Key number**: Post-treatment effects of 4.23 pp (2014) and 6.87 pp (2015); pre-trends F = 0.86, p = 0.518
- **Body sentences**:
  - Callaway-Sant'Anna staggered estimator yields the same breakdown value of M-bar ~ 1.5--2.
  - Pre-trends F-test: F = 0.86, p = 0.518 -- but passing this test alone is not enough.
- **Icon**: Chalk-drawn event study plot with pre-treatment dots near zero and post-treatment dots jumping up
- **Mini-viz**: Event study dots: five near-zero pre dots, then 4.23 pp (2014) and 6.87 pp (2015) post dots in warm orange, with checkmark in teal
- **Connector to next**: "So what should you report?"

### Panel 6 -- Report the Breakdown Value

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "Every DiD should report a breakdown value"
- **Key number**: Works with reghdfe, csdid, did_multiplegt -- even with just one pre-period
- **Body sentences**:
  - The breakdown value replaces the binary pre-trends test with a continuous measure of robustness.
  - honestdid works with reghdfe, csdid, and did_multiplegt -- even with just one pre-period.
- **Icon**: Chalk-drawn badge or stamp icon representing a seal of credibility
- **Mini-viz**: Chalk checklist with three items: "1. Estimate DiD", "2. Run honestdid", "3. Report breakdown" -- each with a teal checkmark
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "The pre-trends test is a smoke detector that only beeps for large fires -- report the breakdown value instead!" -- positioned bottom-right margin, with arrow toward Panel 5
- **Color legend**: Robust effect / positive result: teal, Breakdown threshold / caution: warm orange, Data / estimation method: chalk white
- **Background formulas**: delta_post <= M-bar * max|delta_pre|, |(delta_t+1 - delta_t) - (delta_t - delta_t-1)| <= M at 15-20% opacity
