# Who Benefits Most? Causal Machine Learning for Policy

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the naive estimator's 0.52-month downward bias and its 95% CI [4.93, 5.30] that fails to cover the true effect of 5.628. Teal (#00d4c8) marks positive results like DoubleML closing 79% of the bias, the causal forest's 0.956 correlation with truth, and the IATE policy rule recovering 99.5% of oracle welfare. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "WHO BENEFITS MOST? CAUSAL MACHINE LEARNING FOR POLICY" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Can we use individual treatment effects to assign training where it matters most?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE PROBLEM" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn stick figure jobseeker stands at a crossroads with three sign-posted paths labeled "Treat all", "Treat none", and "Targeted", with a large question mark hovering above. The phrase "ATE → GATE → IATE → POLICY" appears in large warm orange (#e8956a) chalk small-caps with a chalk underline swoosh, depicting the four-step CML roadmap. Below the callout, a small chalk-drawn flow chains four equally-sized boxes connected by short muted-gray (#b0a89a) chalk arrows; each box contains only its bold chalk-white (#f0ece2) label -- "ATE", "GATE", "IATE", and "POLICY" -- with no inner pictograms. In chalk white (#f0ece2), the text reads: "A government wants to know not just whether a job-training programme works, but for whom it works best." and "Causal Machine Learning estimates effects at the individual level so policy can target the people who benefit most." A chalk arrow connects to Panel 2 with the phrase "Let's see the data" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "THE CASE STUDY" in steel blue small-caps chalk lettering. Inside the panel, three chunky chalk-drawn stat cards are arranged in a single row, each a chalk-bordered rounded box containing one bold number and a short caption beneath it. The first card reads "N = 5,000" in large chalk-white (#f0ece2) numerals with the caption "JOBSEEKERS". The second card reads "52.8%" in large warm orange (#e8956a) numerals with the caption "TREATED". The third card reads "22.68 / 30" in large chalk-white (#f0ece2) numerals with the caption "MEAN MONTHS EMPLOYED". The phrase "True ATE = 5.628 months" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "5,000 jobseekers in a synthetic Flemish ALMP cohort -- 52.8% receive training, outcome is months employed in a 30-month window." and "Because the data are synthetic, the true individual effect is known for every row, so every estimator can be benchmarked against the truth." A chalk arrow connects to Panel 3 with the phrase "How biased is the naive comparison?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "THE NAIVE BASELINE" in steel blue small-caps chalk lettering. Inside the panel, a bold side-by-side bias-gap comparison is drawn directly. On the left, a large chalk-white (#f0ece2) numeral reads "NAIVE = 5.111" with a smaller chalk-white caption "[CI 4.93, 5.30]" beneath it. On the right, an equally large chalk-white numeral reads "TRUTH = 5.628" with a small warm orange (#e8956a) chalk star above it. A thick warm orange (#e8956a) chalk arrow runs between the two values from NAIVE on the left to TRUTH on the right, with the bold label "BIAS = -0.52 months (-9.2%)" written along the arrow. A small chalk "thumb-on-the-scale" pictogram sits in the upper-right corner of the panel as a visual reminder of selection bias. The phrase "Naive CI MISSES the truth" appears in large warm orange (#e8956a) chalk small-caps with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Difference-in-means estimates 5.111 months -- a downward bias of 0.52 months, or 9.2% of the truth." and "The 95% CI [4.93, 5.30] fails to cover the true 5.628: caseworkers steer the people with the largest effects into training, and the naive estimator cannot disentangle that selection." A chalk arrow connects downward to Panel 4 with the phrase "Can DoubleML fix this?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "METHOD COMPARISON" in steel blue small-caps chalk lettering. Inside the panel, three large horizontal chalk confidence-interval bars are stacked vertically and well separated, each one bold and clearly legible -- there are no thin vertical reference lines or small italic annotations. A bold chalk header above the stack reads "TRUTH = 5.628" in warm orange (#e8956a) chalk small-caps, anchored by a single large warm orange (#e8956a) chalk star. The first row, in gray, shows a short chalk interval labelled "NAIVE: 5.111 [4.93, 5.30]" with a warm orange (#e8956a) chalk tag to its right reading "MISSES". The second row, in teal (#00d4c8) and visibly the most prominent of the three, shows a wider chalk interval labelled "DoubleML: 5.520 [5.36, 5.68]" with a teal chalk tag to its right reading "COVERS" and a small chalk underline swoosh marking it as the recommended method. The third row, in chalk white (#f0ece2), shows a tight chalk interval labelled "Forest: 5.456 [5.42, 5.50]" with a small muted-gray (#b0a89a) chalk tag to its right reading "AVG OF IATEs". The phrase "DoubleML closes 79% of the bias" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh below the comparison stack. In chalk white (#f0ece2), the text reads: "DoubleML's cross-fitted, doubly-robust score collapses bias from 0.52 to 0.11 months and produces the only 95% CI that covers the truth." and "The causal forest's mean-of-IATEs CI is the tightest but is for the average of individual predictions, not the population ATE." A chalk arrow connects to Panel 5 with the phrase "And what about heterogeneity?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "HETEROGENEITY MATTERS" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn bar chart shows four bars descending from left to right with bold chalk-white (#f0ece2) numeric labels written above each bar reading "7.47", "6.13", "4.50", and "2.91" so the values are unambiguous regardless of how the bar heights render. The bars are labelled along the x-axis with Dutch-proficiency levels "0 (no)", "1 (low)", "2 (intermediate)", "3 (native)" -- the leftmost bar highlighted in teal (#00d4c8). A chalk-bordered stat tag sits in the upper-right corner of the panel reading "FOREST CORR = 0.956" in teal (#00d4c8) chalk small-caps. The phrase "2.6× more benefit for low-Dutch jobseekers" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Estimated GATEs decline monotonically -- 7.47, 6.13, 4.50, 2.91 months -- and every 95% CI covers its true target within 0.22 months." and "At the individual level, the causal forest matches the truth with correlation 0.956 and a mean absolute error of 0.40 months." A chalk arrow connects to Panel 6 with the phrase "Now turn it into policy" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "BOTTOM LINE: POLICY" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn bar chart of four ascending bars carries bold chalk-white (#f0ece2) numeric labels written above each bar -- "0.00", "1.63", "1.75", "1.76" -- so the near-tie between the IATE rule and the oracle reads clearly from the labels even when bar heights look almost identical. The bars are labelled along the x-axis "Treat none", "Treat all", "IATE rule", and "Oracle". The IATE-rule bar is filled in solid teal (#00d4c8); the Oracle bar is drawn with a dashed chalk-white (#f0ece2) outline, with a small chalk star and the caption "ORACLE (gold standard)" hovering above it. To the right of the bar chart, a chalk decision rule in plain English reads "Treat if estimated effect exceeds cost (4 months)". The phrase "99.5% of oracle welfare with no oracle" appears in large teal (#00d4c8) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "A simple 'treat where IATE_hat > 4 months' rule trains 83.9% of the cohort -- almost identical to the oracle's 83.8% -- and lifts welfare to 1.749 months per person." and "That's 99.5% of the oracle's 1.758 months and 7.4% above treating everyone, the practical reason to estimate individual effects in the first place."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "Use DoubleML for the ATE; the causal forest for ranking and policy -- never confuse the forest's tight CI on the average of IATEs with an ATE inference tool." A hand-drawn chalk arrow points from the note toward Panel 4. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Causal effect / GATE", a warm orange (#e8956a) dot labeled "Bias / confounding", and a chalk white (#f0ece2) dot labeled "Data / population".

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the doubly-robust pseudo-outcome "psi_i = g_1(X_i) - g_0(X_i) + D_i(Y_i - g_1)/m - (1-D_i)(Y_i - g_0)/(1-m)", the IATE definition "IATE(x) = E[Y(1) - Y(0) | X = x]", and the welfare objective "W(rule) = E[rule(X) (tau(X) - c)]" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of decision-tree branches, cross-fit fold blocks, stick-figure jobseekers with small "Dutch?" labels, and a faint causal-forest icon (a bundle of small trees with arrows pointing inward to a single τ̂) appear in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange and teal as specified. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include logos or brand marks of DoubleML, EconML, or any specific software package.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text and chalk dust. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "WHO BENEFITS MOST? CAUSAL MACHINE LEARNING FOR POLICY" in steel blue small-caps; subtitle: "Can we use individual treatment effects to assign training where it matters most?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) cautionary numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE PROBLEM" -- chalk stick figure jobseeker at a three-path crossroads (Treat all / Treat none / Targeted); orange callout "ATE → GATE → IATE → POLICY". Panel 2 (top-center): "THE CASE STUDY" -- three chunky chalk stat cards "N = 5,000" (jobseekers), "52.8%" orange (treated), "22.68 / 30" (mean months employed); orange callout "True ATE = 5.628 months". Panel 3 (top-right): "THE NAIVE BASELINE" -- side-by-side bias-gap "NAIVE = 5.111" → "TRUTH = 5.628" connected by a thick orange chalk arrow labelled "BIAS = -0.52 months (-9.2%)"; orange callout "Naive CI MISSES the truth". Panel 4 (bottom-left): "METHOD COMPARISON" -- orange "TRUTH = 5.628" header + chalk star, three stacked CIs: gray "NAIVE: 5.111 [4.93, 5.30]" tagged "MISSES", teal "DoubleML: 5.520 [5.36, 5.68]" tagged "COVERS" (recommended), white "Forest: 5.456 [5.42, 5.50]" tagged "AVG OF IATEs"; teal callout "DoubleML closes 79% of the bias". Panel 5 (bottom-center): "HETEROGENEITY MATTERS" -- bar chart with bold labels 7.47/6.13/4.50/2.91 above each bar across Dutch levels, leftmost bar teal; teal stat tag "FOREST CORR = 0.956" in upper-right; orange callout "2.6× more benefit for low-Dutch jobseekers". Panel 6 (bottom-right): "BOTTOM LINE: POLICY" -- welfare bars with bold labels 0.00/1.63/1.75/1.76, IATE rule solid teal, Oracle bar dashed with star "ORACLE (gold standard)"; rule "Treat if effect > cost (4 months)"; teal callout "99.5% of oracle welfare with no oracle". Professor's note bottom-right: "DoubleML for the ATE; causal forest for ranking -- don't confuse them" arrow to Panel 4. Color legend bottom-left: Causal effect teal, Bias orange, Data white. Background formulas at 15% opacity: psi_i = g_1 - g_0 + D(Y-g_1)/m - (1-D)(Y-g_0)/(1-m), IATE(x) = E[Y(1)-Y(0) | X], W = E[rule(tau-c)]. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Problem

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "ATE → GATE → IATE → POLICY"
- **Key number**: N/A (conceptual roadmap panel)
- **Body sentences**:
  - A government wants to know not just whether a job-training programme works, but for whom it works best.
  - Causal Machine Learning estimates effects at the individual level so policy can target the people who benefit most.
- **Icon**: Chalk-drawn stick figure jobseeker at a crossroads with three sign-posted paths ("Treat all", "Treat none", "Targeted") and a question mark hovering above
- **Mini-viz**: A small chalk-drawn 4-box flow chained by short muted-gray arrows; each box contains only its bold chalk-white label -- "ATE", "GATE", "IATE", "POLICY". No inner pictograms (Gemini-friendly)
- **Connector to next**: "Let's see the data"

### Panel 2 -- The Case Study

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "True ATE = 5.628 months"
- **Key number**: N = 5,000 jobseekers, treatment share 52.8%, mean outcome 22.68 months out of 30, true ATE 5.628
- **Body sentences**:
  - 5,000 jobseekers in a synthetic Flemish ALMP cohort -- 52.8% receive training, outcome is months employed in a 30-month window.
  - Because the data are synthetic, the true individual effect is known for every row, so every estimator can be benchmarked against the truth.
- **Icon**: Three chunky chalk-bordered stat cards arranged in a single row (Gemini-friendly chunky-text layout, no fine spatial alignment required)
- **Mini-viz**: Card 1: "N = 5,000" in chalk-white numerals with caption "JOBSEEKERS". Card 2: "52.8%" in warm orange with caption "TREATED". Card 3: "22.68 / 30" in chalk-white with caption "MEAN MONTHS EMPLOYED"
- **Connector to next**: "How biased is the naive comparison?"

### Panel 3 -- The Naive Baseline

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "Naive CI MISSES the truth"
- **Key number**: Naive 5.111, 95% CI [4.93, 5.30], bias -0.52 months (-9.2% of truth 5.628)
- **Body sentences**:
  - Difference-in-means estimates 5.111 months -- a downward bias of 0.52 months, or 9.2% of the truth.
  - The 95% CI [4.93, 5.30] fails to cover the true 5.628: caseworkers steer the people with the largest effects into training, and the naive estimator cannot disentangle that selection.
- **Icon**: Small chalk "thumb-on-the-scale" pictogram in the upper-right corner of the panel
- **Mini-viz**: Bold side-by-side bias-gap layout. Left: chalk-white "NAIVE = 5.111" with caption "[CI 4.93, 5.30]". Right: chalk-white "TRUTH = 5.628" with a small warm orange chalk star above it. Connecting arrow: thick warm orange chalk arrow from left to right labelled "BIAS = -0.52 months (-9.2%)". Designed without thin reference lines or fine spatial alignment so Gemini renders it reliably
- **Connector to next**: "Can DoubleML fix this?"

### Panel 4 -- Method Comparison

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "DoubleML closes 79% of the bias"
- **Key number**: Naive bias -0.517 / DoubleML bias -0.108 / Forest bias -0.172, with DoubleML 95% CI [5.36, 5.68] the only one to cover truth
- **Body sentences**:
  - DoubleML's cross-fitted, doubly-robust score collapses bias from 0.52 to 0.11 months and produces the only 95% CI that covers the truth.
  - The causal forest's mean-of-IATEs CI is the tightest but is for the average of individual predictions, not the population ATE.
- **Icon**: Chalk forest-plot icon (three horizontal CIs stacked)
- **Mini-viz**: Three large horizontal chalk confidence intervals stacked vertically with bold method labels and right-side status tags, under a bold chalk header "TRUTH = 5.628" anchored by a warm orange star. Row 1 (gray) -- "NAIVE: 5.111 [4.93, 5.30]" with orange tag "MISSES". Row 2 (teal #00d4c8, recommended) -- "DoubleML: 5.520 [5.36, 5.68]" with teal tag "COVERS" and a chalk underline swoosh. Row 3 (chalk white) -- "Forest: 5.456 [5.42, 5.50]" with muted-gray tag "AVG OF IATEs". Designed without thin vertical reference lines or small italic annotations so Gemini and similar models render the comparison reliably.
- **Connector to next**: "And what about heterogeneity?"

### Panel 5 -- Heterogeneity Matters

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "2.6× more benefit for low-Dutch jobseekers"
- **Key number**: Estimated GATEs 7.47 / 6.13 / 4.50 / 2.91 across Dutch proficiency levels 0--3, IATE correlation 0.956, MAE 0.40 months
- **Body sentences**:
  - Estimated GATEs decline monotonically -- 7.47, 6.13, 4.50, 2.91 months -- and every 95% CI covers its true target within 0.22 months.
  - At the individual level, the causal forest matches the truth with correlation 0.956 and a mean absolute error of 0.40 months.
- **Icon**: Four chalk bars descending from left to right (heights 7.47, 6.13, 4.50, 2.91)
- **Mini-viz**: Chalk bar chart of GATEs by Dutch level with bold chalk-white numeric labels "7.47", "6.13", "4.50", "2.91" above each bar (so values are unambiguous regardless of bar-height proportions); x-axis labels "0 (no)", "1 (low)", "2 (intermediate)", "3 (native)"; leftmost bar highlighted in teal (#00d4c8). A chalk-bordered stat tag in the upper-right corner reads "FOREST CORR = 0.956" in teal small-caps. No scatter inset (Gemini-friendly)
- **Connector to next**: "Now turn it into policy"

### Panel 6 -- Bottom Line: Policy

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "99.5% of oracle welfare with no oracle"
- **Key number**: IATE rule treats 83.9% of the cohort, welfare 1.749 vs oracle 1.758, beats treat-all (1.628) by 7.4%
- **Body sentences**:
  - A simple 'treat where IATE_hat > 4 months' rule trains 83.9% of the cohort -- almost identical to the oracle's 83.8% -- and lifts welfare to 1.749 months per person.
  - That's 99.5% of the oracle's 1.758 months and 7.4% above treating everyone, the practical reason to estimate individual effects in the first place.
- **Icon**: Plain-English chalk decision rule "Treat if estimated effect exceeds cost (4 months)"
- **Mini-viz**: Chalk bar chart with four ascending bars and bold chalk-white numeric labels "0.00", "1.63", "1.75", "1.76" written above each bar so the IATE-vs-Oracle near-tie reads from the labels. X-axis labels "Treat none", "Treat all", "IATE rule", "Oracle". IATE-rule bar in solid teal (#00d4c8). Oracle bar drawn with a dashed chalk-white outline; a small chalk star with caption "ORACLE (gold standard)" hovers above it
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "Use DoubleML for the ATE; the causal forest for ranking and policy -- never confuse the forest's tight CI on the average of IATEs with an ATE inference tool." -- positioned bottom-right margin, with arrow toward Panel 4
- **Color legend**: Causal effect / GATE: teal, Bias / confounding: warm orange, Data / population: chalk white
- **Background formulas**: psi_i = g_1(X_i) - g_0(X_i) + D_i(Y_i - g_1)/m - (1-D_i)(Y_i - g_0)/(1-m), IATE(x) = E[Y(1) - Y(0) | X = x], W(rule) = E[rule(X) (tau(X) - c)] at 15-20% opacity
