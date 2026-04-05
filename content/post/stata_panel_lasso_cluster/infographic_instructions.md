# Latent Groups in Panel Data: When Averages Lie

> **Scope note:** Template A (Causal Inference) selected -- the post centers on identifying heterogeneous causal effects (democracy on growth, macro shocks on savings) using the Classifier-LASSO method, with explicit treatment/outcome framing and Simpson's paradox. Text rendering: Option A (all text). Target tool: Gemini / Ideogram.

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6). Breathing room surrounds the entire grid to accommodate margin elements in the bottom-left and bottom-right corners.

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights key numbers, bold callouts, and cautionary findings like the -0.936 negative democracy effect in 41 countries. Teal (#00d4c8) marks positive results like the +2.151 democracy effect found in 57 countries. Muted chalk gray (#b0a89a) appears on connector arrows, annotations, and de-emphasized labels.

The title banner reads "LATENT GROUPS IN PANEL DATA: WHEN AVERAGES LIE" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Does democracy universally promote growth -- or does the pooled estimate hide a sign reversal?"

The top-left panel (row 1, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "1" in warm orange (#e8956a) in its top-left corner. The title reads "THE PROBLEM: POOLED SLOPES" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn set of three overlapping country outlines is connected by a single straight regression line, with a large "=" sign crossed out in warm orange -- representing the false assumption that all countries share the same slope. A small chalk scatter of dots above and below the line suggests heterogeneous responses. The phrase "One slope for 98 countries?" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Standard fixed-effects models force all countries to share the same slope coefficients" and "If subgroups respond in opposite directions, the average coefficient can be qualitatively wrong." A chalk arrow connects to Panel 2 with the phrase "What does the data look like?" in small muted gray (#b0a89a) chalk along the arrow.

The top-center panel (row 1, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "2" in warm orange (#e8956a) in its top-left corner. The title reads "TWO CASE STUDIES" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn spaghetti plot shows tangled lines representing 56 country savings trajectories diverging over time, with a few lines going up and others going down. Below the spaghetti sketch, two small chalk labels read "56 countries x 15 yrs" and "98 countries x 41 yrs." The phrase "840 + 3,920 observations" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "Savings-to-GDP ratio across 56 countries (1995--2010) and democracy-growth across 98 countries (1970--2010)" and "Country trajectories diverge wildly -- motivating the search for latent groups." A chalk arrow connects to Panel 3 with the phrase "How does C-LASSO sort them?" in small muted gray (#b0a89a) chalk along the arrow.

The top-right panel (row 1, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "3" in warm orange (#e8956a) in its top-left corner. The title reads "CLASSIFIER-LASSO METHOD" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn sorting hat icon sits above two clusters of small chalk dots -- one cluster on the left labeled "G1" and one on the right labeled "G2" -- representing the algorithm assigning countries to latent groups. A small chalk formula sketch shows "min SSR + lambda x product penalty" in muted gray. The phrase "IC selects K = 2 in all specs" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The penalty shrinks each country toward its nearest group center -- a statistical sorting hat" and "Across static savings, dynamic savings, and democracy models, the information criterion consistently picks exactly 2 groups." A chalk arrow connects downward to Panel 4 with the phrase "What do the groups reveal?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-left panel (row 2, column 1) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "4" in warm orange (#e8956a) in its top-left corner. The title reads "POOLED VS GROUP-SPECIFIC" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn comparison visual shows three horizontal coefficient bars for the democracy effect: the top bar is labeled "Pooled +1.055" in chalk white (#f0ece2) and extends moderately to the right; the middle bar is labeled "G1: +2.151" in teal (#00d4c8) and extends further right; the bottom bar is labeled "G2: -0.936" in warm orange (#e8956a) and extends to the left past a dashed vertical zero line. A small "57 countries" label sits next to the teal bar and "41 countries" next to the orange bar. The phrase "+2.151 vs -0.936" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The pooled democracy coefficient of +1.055 describes neither group accurately" and "For 57 countries democracy boosts GDP; for 41 countries it hinders growth." A chalk arrow connects to Panel 5 with the phrase "Same pattern in savings?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-center panel (row 2, column 2) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "5" in warm orange (#e8956a) in its top-left corner. The title reads "CPI SIGN REVERSAL" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn coefficient plot shows two horizontal lines separated by a gap: the upper line at approximately +0.197 labeled "G2: +0.197" in teal (#00d4c8) with dashed confidence bands, and the lower line at approximately -0.160 labeled "G1: -0.160" in warm orange (#e8956a) with dashed confidence bands -- the bands clearly do not overlap, with a dashed zero line between them. The phrase "-0.160 vs +0.197" appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "The pooled CPI coefficient of +0.030 was insignificant -- an artifact of averaging opposite signs" and "Non-overlapping confidence bands confirm a statistically robust sign reversal across groups." A chalk arrow connects to Panel 6 with the phrase "What does this mean?" in small muted gray (#b0a89a) chalk along the arrow.

The bottom-right panel (row 2, column 3) has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with a circled "6" in warm orange (#e8956a) in its top-left corner. The title reads "SIMPSON'S PARADOX IN PANELS" in steel blue small-caps chalk lettering. Inside the panel, a chalk-drawn diagram shows a single arrow labeled "+1.055" pointing right that splits into two diverging arrows -- one pointing up-right labeled "+2.151" in teal (#00d4c8) and one pointing down-right labeled "-0.936" in warm orange (#e8956a) -- visually capturing how one average decomposes into opposing effects. A small chalk warning triangle icon appears next to the diverging arrows. The phrase "The average describes no one" appears in large warm orange (#e8956a) chalk with a chalk underline swoosh. In chalk white (#f0ece2), the text reads: "When subgroups have opposite-sign effects, pooled estimates do not just underestimate -- they mislead" and "C-LASSO recovers the hidden structure that standard panel methods assume away."

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "An insignificant pooled coefficient may be two significant effects canceling out!" A hand-drawn chalk arrow points from the note toward Panel 5. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Growth-promoting effect", a warm orange (#e8956a) dot labeled "Growth-hindering effect / bias", and a chalk white (#f0ece2) dot labeled "Pooled estimate / data."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "beta_i = alpha_k if i in G_k" and "Q = (1/NT) Sum(y_it - beta_i x_it)^2 + lambda/N Sum Prod ||beta_i - alpha_k||" are scattered across the background, partially obscured by the panels. Chalk-style illustrations of country outlines, sorting hats, and diverging arrows appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks appear where chalk has been partially erased, adding tactile realism.

Text rendering priorities: The title banner text and panel numbers must be clearly legible. Panel titles should be readable in steel blue small-caps. Key numbers and callout phrases must be prominent in warm orange. Body text sentences should be readable in chalk white. Connector phrases and annotations can be smaller but still legible. Background formulas should be barely visible at 15-20% opacity.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not include photographs of actual chalkboards or classrooms. Do not include world maps or globe imagery -- keep the focus on abstract data visualization.

---

## Condensed Prompt (~300 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust, and faint formula textures. Six panels in a 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "LATENT GROUPS IN PANEL DATA: WHEN AVERAGES LIE" in steel blue small-caps, subtitle: "Does democracy universally promote growth -- or does the pooled estimate hide a sign reversal?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE PROBLEM: POOLED SLOPES" -- chalk country outlines sharing one regression line crossed out, orange "One slope for 98 countries?" Panel 2 (top-center): "TWO CASE STUDIES" -- chalk spaghetti plot of diverging country trajectories, orange "840 + 3,920 observations." Panel 3 (top-right): "CLASSIFIER-LASSO METHOD" -- sorting hat icon above two dot clusters G1/G2, orange "IC selects K = 2 in all specs." Panel 4 (bottom-left): "POOLED VS GROUP-SPECIFIC" -- three horizontal bars: Pooled +1.055 (white), G1 +2.151 (teal), G2 -0.936 (orange) crossing zero line, orange "+2.151 vs -0.936." Panel 5 (bottom-center): "CPI SIGN REVERSAL" -- coefficient plot with non-overlapping confidence bands at -0.160 and +0.197, orange "-0.160 vs +0.197." Panel 6 (bottom-right): "SIMPSON'S PARADOX IN PANELS" -- single arrow +1.055 splitting into +2.151 (teal) up and -0.936 (orange) down, warning triangle, orange "The average describes no one." Professor's margin note bottom-right: "An insignificant pooled coefficient may be two significant effects canceling out!" with arrow toward Panel 5. Color legend bottom-left: Growth-promoting: teal, Growth-hindering: orange, Pooled/data: white. Faint background formulas: beta_i = alpha_k if i in G_k, Q = (1/NT) Sum(y - beta x)^2 + penalty at 15% opacity. No photorealism, no gradients, no emojis, no drop shadows, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Problem: Pooled Slopes

- **Position**: Row 1, Column 1 (top-left)
- **Callout**: "One slope for 98 countries?"
- **Key number**: 98 countries forced to share the same slope coefficients
- **Body sentences**:
  - Standard fixed-effects models force all countries to share the same slope coefficients.
  - If subgroups respond in opposite directions, the average coefficient can be qualitatively wrong.
- **Icon**: Chalk-drawn country outlines connected by a single regression line with a crossed-out "=" sign
- **Mini-viz**: Chalk scatter of dots above and below a single regression line, suggesting hidden heterogeneity
- **Connector to next**: "What does the data look like?"

### Panel 2 -- Two Case Studies

- **Position**: Row 1, Column 2 (top-center)
- **Callout**: "840 + 3,920 observations"
- **Key number**: 56 countries x 15 years (savings) and 98 countries x 41 years (democracy)
- **Body sentences**:
  - Savings-to-GDP ratio across 56 countries (1995--2010) and democracy-growth across 98 countries (1970--2010).
  - Country trajectories diverge wildly -- motivating the search for latent groups.
- **Icon**: Chalk-drawn spaghetti plot with tangled lines diverging over time
- **Mini-viz**: Spaghetti sketch with some lines trending up and others trending down, labels "56 x 15 yrs" and "98 x 41 yrs"
- **Connector to next**: "How does C-LASSO sort them?"

### Panel 3 -- Classifier-LASSO Method

- **Position**: Row 1, Column 3 (top-right)
- **Callout**: "IC selects K = 2 in all specs"
- **Key number**: K = 2 groups selected across all three specifications (static savings, dynamic savings, democracy)
- **Body sentences**:
  - The penalty shrinks each country toward its nearest group center -- a statistical sorting hat.
  - Across static savings, dynamic savings, and democracy models, the information criterion consistently picks exactly 2 groups.
- **Icon**: Chalk-drawn sorting hat above two clusters of dots labeled G1 and G2
- **Mini-viz**: Small formula sketch "min SSR + lambda x product penalty" with two dot clusters below
- **Connector to next**: "What do the groups reveal?"

### Panel 4 -- Pooled vs Group-Specific

- **Position**: Row 2, Column 1 (bottom-left)
- **Callout**: "+2.151 vs -0.936"
- **Key number**: Democracy coefficient: Pooled +1.055, Group 1 +2.151 (57 countries), Group 2 -0.936 (41 countries)
- **Body sentences**:
  - The pooled democracy coefficient of +1.055 describes neither group accurately.
  - For 57 countries democracy boosts GDP; for 41 countries it hinders growth.
- **Icon**: Three horizontal coefficient bars crossing a vertical zero line
- **Mini-viz**: Three bars: Pooled +1.055 (chalk white), G1 +2.151 (teal, extending right), G2 -0.936 (warm orange, extending left past zero line); labels "57 countries" and "41 countries"
- **Connector to next**: "Same pattern in savings?"

### Panel 5 -- CPI Sign Reversal

- **Position**: Row 2, Column 2 (bottom-center)
- **Callout**: "-0.160 vs +0.197"
- **Key number**: CPI coefficient: -0.160 in Group 1 (31 countries) vs +0.197 in Group 2 (25 countries); pooled = +0.030 (insignificant)
- **Body sentences**:
  - The pooled CPI coefficient of +0.030 was insignificant -- an artifact of averaging opposite signs.
  - Non-overlapping confidence bands confirm a statistically robust sign reversal across groups.
- **Icon**: Chalk-drawn coefficient plot with two horizontal lines and dashed confidence bands
- **Mini-viz**: Two horizontal lines at -0.160 and +0.197 with dashed confidence bands that do not overlap, a dashed zero line between them
- **Connector to next**: "What does this mean?"

### Panel 6 -- Simpson's Paradox in Panels

- **Position**: Row 2, Column 3 (bottom-right)
- **Callout**: "The average describes no one"
- **Key number**: Pooled +1.055 decomposes into +2.151 (58% of countries) and -0.936 (42% of countries)
- **Body sentences**:
  - When subgroups have opposite-sign effects, pooled estimates do not just underestimate -- they mislead.
  - C-LASSO recovers the hidden structure that standard panel methods assume away.
- **Icon**: Single arrow splitting into two diverging arrows with a warning triangle
- **Mini-viz**: Diagram of one arrow labeled "+1.055" splitting into an upward arrow "+2.151" (teal) and a downward arrow "-0.936" (warm orange)
- **Connector to next**: N/A (final panel)

### Margin Elements

- **Professor's note**: "An insignificant pooled coefficient may be two significant effects canceling out!" -- positioned bottom-right margin, with arrow toward Panel 5
- **Color legend**: Growth-promoting effect: teal, Growth-hindering effect / bias: warm orange, Pooled estimate / data: chalk white
- **Background formulas**: beta_i = alpha_k if i in G_k, Q = (1/NT) Sum(y_it - beta_i x_it)^2 + lambda/N Sum Prod ||beta_i - alpha_k|| at 15-20% opacity
