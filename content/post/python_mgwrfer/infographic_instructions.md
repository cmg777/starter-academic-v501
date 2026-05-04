# Removing Hidden Spatial Confounders with Fixed Effects

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6).

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and the chalk-drawn borders, representing the spatial model framework. Warm orange (#e8956a) highlights key numbers like the 55% RMSE reduction and the 0.818 correlation -- these are the breakthrough results. Teal (#00d4c8) marks the fixed-effects correction and unbiased estimates. Muted chalk gray (#b0a89a) appears on connector arrows, background annotations, and the confounder pattern.

The title banner reads "REMOVING HIDDEN SPATIAL CONFOUNDERS WITH FIXED EFFECTS" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Can spatially varying coefficients survive unobserved confounders?"

Panel 1 (top-left): Title "THE HIDDEN CONFOUNDER" in steel blue small-caps. A large chalk-drawn magnifying glass hovers over a 4x4 grid of dots, revealing only a bold question mark where the confounder should be -- the glass finds nothing useful. Callout: "Every surface is contaminated" in warm orange. Chalk arrow to Panel 2.

Panel 2 (top-center): Title "225 UNITS, ONE TRAP" in steel blue small-caps. A chalk-drawn group of tally marks in sets of five represents the 225 spatial units, with a large exponential curve in muted gray towering over them -- the confounder dwarfs the true effects. Callout: "Confounder range: 2 to 52" in warm orange. Chalk arrow to Panel 3.

Panel 3 (top-right): Title "POOLED MGWR FAILS" in steel blue small-caps. A large chalk-drawn telescope pointed at a blurry dome shape -- the lens is smudged and the dome appears distorted, representing poor coefficient recovery despite high model fit. Callout: "R² = 0.977 but Corr = 0.459" in large warm orange chalk. Chalk arrow down to Panel 4.

Panel 4 (bottom-left): Title "SUBTRACT THE MEAN" in steel blue small-caps. A chalk-drawn balance scale with two pans: the left pan is weighed down heavily by a block labeled "alpha" in muted gray, while the right pan shows the same scale perfectly level with the block removed and "alpha = 0" in teal (#00d4c8) -- the within-transformation zeroes out the fixed effect. Callout: "55% RMSE reduction" in large teal chalk. Chalk arrow to Panel 5.

Panel 5 (bottom-center): Title "THE DOME EMERGES" in steel blue small-caps. A large chalk-drawn cracked surface with pieces falling away, revealing a smooth concentric dome pattern underneath in teal -- the true coefficient shape was hidden by the confounder crust all along. Callout: "Corr jumps to 0.818" in large warm orange chalk. Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "WHEN TO USE MGWRFER" in steel blue small-caps. A chalk-drawn fork in the road with three signpost arrows: one pointing to "No confounders" labeled "Pooled MGWR", one pointing to "Time-varying" labeled "Other methods", and one circled in teal pointing to "Time-invariant confounders" labeled "MGWRFER" -- the right tool for panel spatial data. Callout: "90% correct null detection" in warm orange.

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "Systematic bias is worse than random variance -- always prefer unbiased!" A hand-drawn chalk arrow points from the note toward Panel 4. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Bias-corrected", a warm orange (#e8956a) dot labeled "Biased / key numbers", and a chalk white (#f0ece2) dot labeled "Data / assumptions."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the formulas "y_it = alpha_i + beta(u,v) * x_it + epsilon" and "y_tilde = y_it - y_bar_i" are scattered across the background. Chalk-style silhouettes of grid dots, bracket symbols, and small dome shapes appear faintly in the background gaps. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks add tactile realism.

This prompt generates the base image. The AI should render clearly: the title banner, 6 panel titles in steel blue, 6 central sketch illustrations, 3 key numbers in large warm orange or teal chalk (55%, 0.818, 0.459), and 3 callout phrases. All other text -- body sentences, annotations, transition phrases -- is provided in the panel reference data for the user to overlay manually in an image editor. Keep text elements minimal and large for legibility.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not render precise statistical charts, axis labels, or data tables. Do not attempt to render more than 3 text elements per panel. Do not include photographs of actual chalkboards, classrooms, or geographic maps with country boundaries.

---

## Condensed Prompt (~200 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote, hand-lettered text, chalk dust, faint formula textures. Six panels in 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "REMOVING HIDDEN SPATIAL CONFOUNDERS WITH FIXED EFFECTS" in steel blue small-caps, subtitle: "Can spatially varying coefficients survive unobserved confounders?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body, warm orange (#e8956a) key numbers, teal (#00d4c8) highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "THE HIDDEN CONFOUNDER" -- magnifying glass over dot grid with question mark, orange "Every surface is contaminated." Panel 2 (top-center): "225 UNITS, ONE TRAP" -- tally marks under exponential curve, orange "Confounder range: 2 to 52." Panel 3 (top-right): "POOLED MGWR FAILS" -- blurry telescope aimed at dome, orange "R² = 0.977 but Corr = 0.459." Panel 4 (bottom-left): "SUBTRACT THE MEAN" -- balance scale leveling after removing block, teal "55% RMSE reduction." Panel 5 (bottom-center): "THE DOME EMERGES" -- cracked surface revealing dome in teal, orange "Corr jumps to 0.818." Panel 6 (bottom-right): "WHEN TO USE MGWRFER" -- fork in road with three signposts, orange "90% correct null detection." Professor's note bottom-right: "Systematic bias is worse than random variance!" Legend bottom-left: bias-corrected (teal), biased (orange), data (white). Faint formulas: y_it = alpha_i + beta(u,v)*x + epsilon at 15% opacity. No photorealism, no gradients, no precise charts, no pure white.

---

## Panel Reference Data

### Panel 1 -- The Hidden Confounder

- **Position**: Row 1, Column 1 (top-left)
- **Dramatic function**: Hook
- **Story beat**: "A hidden confounder distorts every coefficient surface"
- **Callout**: "Every surface is contaminated"
- **Key number**: N/A (conceptual panel)
- **Central sketch**: Chalk-drawn magnifying glass hovering over a 4x4 grid of dots, revealing only a question mark where the confounder should be
- **Body sentences** (for manual overlay):
  - Unobserved spatial confounders leak into every coefficient -- what looks like a local effect may be omitted variable bias.
  - Standard MGWR cannot separate the confounder from the slopes because both vary across space.
- **Transition to next**: "How bad is the contamination?"

### Panel 2 -- 225 Units, One Trap

- **Position**: Row 1, Column 2 (top-center)
- **Dramatic function**: Stakes
- **Story beat**: "225 units, 3 periods, one exponential trap"
- **Callout**: "Confounder range: 2 to 52"
- **Key number**: Alpha ranges from 2.07 to 51.55 (mean 23.29) -- dominates the outcome
- **Central sketch**: Chalk-drawn tally marks in groups of five (225 units) with a large exponential curve in muted gray towering over them
- **Body sentences** (for manual overlay):
  - The confounder alpha spans 2 to 52 -- a 50-unit range that dwarfs the true coefficients (range 0 to 2).
  - With 225 spatial units observed over 3 periods (675 obs), the panel structure enables within-transformation.
- **Transition to next**: "What happens if we ignore it?"

### Panel 3 -- Pooled MGWR Fails

- **Position**: Row 1, Column 3 (top-right)
- **Dramatic function**: First attempt
- **Story beat**: "Pooled MGWR: R²=0.977 but Corr=0.459"
- **Callout**: "R² = 0.977 but Corr = 0.459"
- **Key number**: Correlation 0.459 for beta_1 (should be close to 1.0)
- **Central sketch**: Chalk-drawn telescope pointed at a blurry, distorted dome shape -- the lens is smudged, representing poor coefficient recovery despite high apparent fit
- **Body sentences** (for manual overlay):
  - Pooled MGWR achieves R² = 0.977 by absorbing the confounder into the intercept -- but slope recovery is terrible.
  - The most-biased coefficient (beta_1) has RMSE = 0.395 and correlation with truth of only 0.459.
  - The null coefficient (beta_4, truly zero) shows RMSE = 0.253 -- widespread false significance.
- **Transition to next**: "Can we fix this?"

### Panel 4 -- Subtract the Mean

- **Position**: Row 2, Column 1 (bottom-left)
- **Dramatic function**: Twist
- **Story beat**: "Subtract the mean, erase the bias"
- **Callout**: "55% RMSE reduction"
- **Key number**: 54.6% RMSE reduction for beta_1 (0.395 to 0.179)
- **Central sketch**: Chalk-drawn balance scale -- left pan weighed down by a block labeled "alpha", right pan perfectly level with block removed and "alpha = 0" in teal
- **Body sentences** (for manual overlay):
  - The within-transformation subtracts each unit's temporal mean -- the confounder cancels exactly (alpha - alpha = 0).
  - After demeaning, outcome range shrinks from [-4, 57] to [-7, 7] -- the 50-unit confounder is gone.
  - MGWRFER then fits MGWR on the cleaned data with constant=False (no intercept needed).
- **Transition to next**: "How much did it actually help?"

### Panel 5 -- The Dome Emerges

- **Position**: Row 2, Column 2 (bottom-center)
- **Dramatic function**: Surprise
- **Story beat**: "55% RMSE drop -- the dome pattern emerges"
- **Callout**: "Corr jumps to 0.818"
- **Key number**: Correlation improves from 0.459 to 0.818 for beta_1
- **Central sketch**: Chalk-drawn cracked surface with pieces falling away, revealing a smooth concentric dome pattern in teal underneath
- **Body sentences** (for manual overlay):
  - Beta_1 correlation jumps from 0.459 to 0.818 -- the quadratic dome is now clearly recovered.
  - Beta_4 (null) RMSE drops 45% -- from widespread false positives to 90% correct identification.
  - Bandwidths shrink (x4: 223 to 62) -- the true surfaces are more local than the confounded ones appeared.
- **Transition to next**: "So when should you use this?"

### Panel 6 -- When to Use MGWRFER

- **Position**: Row 2, Column 3 (bottom-right)
- **Dramatic function**: Resolution
- **Story beat**: "Bias-variance tradeoff: when to use MGWRFER"
- **Callout**: "90% correct null detection"
- **Key number**: 202/225 = 89.8% correctly classified as not significant
- **Central sketch**: Chalk-drawn fork in the road with three signpost arrows -- "Pooled MGWR" (no confounders), "Other methods" (time-varying), "MGWRFER" circled in teal (time-invariant confounders)
- **Body sentences** (for manual overlay):
  - No confounders? Use pooled MGWR. Time-invariant spatial confounders? MGWRFER removes them exactly.
  - The tradeoff: beta_2 and beta_3 RMSE rise 18-25% (variance cost) but bias elimination is worth it in most applications.
- **Transition to next**: N/A (final panel)

### Story Spine

> MGWRFER reveals that fixed effects and spatial flexibility can coexist by showing that within-transformation cuts the most-biased coefficient's error by 55%, challenging the assumption that spatially varying models cannot handle unobserved confounders.

### Margin Elements

- **Professor's note**: "Systematic bias is worse than random variance -- always prefer unbiased!" -- positioned bottom-right margin, with arrow toward Panel 4
- **Color legend**: Bias-corrected: teal, Biased / key numbers: warm orange, Data / assumptions: chalk white
- **Background formulas**: y_it = alpha_i + beta(u,v) * x_it + epsilon, y_tilde = y_it - y_bar_i at 15-20% opacity
