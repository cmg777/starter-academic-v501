# Three Ways to Rebuild California

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6).

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines -- never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights the three key numbers -- the naive "-27 packs", the synthetic control "-19.5", and the SDID "-15.6". Teal (#00d4c8) marks the positive robustness result -- California standing out from the placebos. Muted chalk gray (#b0a89a) appears on connector arrows and background annotations.

The title banner reads "THREE WAYS TO REBUILD CALIFORNIA" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Did Proposition 99 cut smoking by 27 packs, 19, or 16?"

Panel 1 (top-left): Title "ONE STATE, ONE LAW, 1989" in steel blue small-caps. A large chalk-drawn magnifying glass hovers over a single US-state silhouette shaped like California with a tiny cigarette pack inside it; a bold question mark rises out of the lens. Callout: "One state, one law, one question" in warm orange. Chalk arrow to Panel 2.

Panel 2 (top-center): Title "THE MISSING TWIN" in steel blue small-caps. A solid chalk stick figure labeled "California" stands beside a translucent dashed-outline twin -- the California that never passed Proposition 99 -- with a small "38 controls" tag beneath them. Callout: "Every method imputes a ghost" in warm orange. Chalk arrow to Panel 3.

Panel 3 (top-right): Title "THE NAIVE COMPARISON" in steel blue small-caps. Two chalk-drawn playground slides side by side: California's slide plunges steeply downward while the gentle slide labeled "all 38 states" barely dips, and the wedge of space between their ends is lightly hatched. Callout: "-27 packs (naive DiD)" in large warm orange chalk. Chalk arrow down to Panel 4.

Panel 4 (bottom-left): Title "A WEIGHTED TWIN" in steel blue small-caps. A large chalk-drawn balance scale: the left pan holds a block labeled "California" and the right pan holds a small stack of labeled blocks -- "Utah", "Nevada", "Montana" -- and the beam sits perfectly level. Callout: "-19.5 (synthetic control)" in large warm orange chalk. Chalk arrow to Panel 5.

Panel 5 (bottom-center): Title "TREND, NOT LEVEL" in steel blue small-caps. Two parallel chalk railroad tracks run a constant distance apart from the left, then peel sharply apart just past a chalk crosstie marked "1989"; the three ties immediately before it glow faintly, tagged "1986-88". Callout: "-15.6 (SDID)" in large warm orange chalk. Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "ASK THE PLACEBOS" in steel blue small-caps. A loose crowd of faint muted-gray squiggle-lines bunches around a horizontal chalk zero-line, while one bold teal (#00d4c8) line plunges far below the pack; a small "p = 0.026" tag sits beside the lone line. Callout: "Only California breaks from the pack" in warm orange.

In the bottom-right margin, outside the panel grid, a professor's handwritten-style annotation in smaller italic chalk white (#f0ece2) reads: "One command runs all three -- DiD weights every state and year equally; SDID weights a chosen few, and only the years that rhyme with the present." A hand-drawn chalk arrow points from the note toward Panel 5. In the bottom-left margin, a small color concept legend shows three entries: a warm orange (#e8956a) dot labeled "California (observed)", a steel blue (#8bb8e0) dot labeled "Synthetic counterfactual", and a teal (#00d4c8) dot labeled "Placebo evidence".

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the weighted two-way fixed-effects objective "min Sigma (Y - mu - alpha_i - beta_t - W tau)^2 omega_i lambda_t", the simplex constraint "Sigma omega_i = 1, omega_i >= 0", the regularizer "zeta = (N_tr T_post)^1/4 sigma", and the interval "tau-hat +/- z sqrt(V)". A faint three-grid sketch -- one grid of evenly spaced dots, one with a few big dots, one with many small dots -- hints at the three weighting schemes. Chalk-style silhouettes of a cigarette pack and a US map appear faintly in the background gaps, with subtle chalk dust near text edges and panel borders.

This prompt generates the base image. The AI should render clearly: the title banner, 6 panel titles in steel blue, 6 central sketch illustrations, 3 key numbers in large warm orange chalk (-27, -19.5, -15.6), and 3 callout phrases. All other text -- body sentences, annotations, transition phrases -- is provided in the panel reference data for the user to overlay manually in an image editor. Keep text elements minimal and large for legibility.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not render precise statistical charts, axis labels, or data tables. Do not attempt to render more than 3 text elements per panel. Do not render precise line charts of cigarette sales with numeric axis ticks or year gridlines -- the trends are metaphorical slides and railroad tracks, not plots. Do not include photographs of actual chalkboards or classrooms.

---

## Condensed Prompt (~200 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk-drawn sketchnote, hand-lettered text, chalk dust, faint formula textures. Six panels in 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "THREE WAYS TO REBUILD CALIFORNIA" in steel blue small-caps, subtitle: "Did Proposition 99 cut smoking by 27 packs, 19, or 16?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body, warm orange (#e8956a) key numbers, teal (#00d4c8) highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left): "ONE STATE, ONE LAW, 1989" -- magnifying glass over California silhouette with cigarette pack and question mark, callout "One state, one law, one question" in orange. Panel 2 (top-center): "THE MISSING TWIN" -- solid figure beside dashed ghost twin, "Every method imputes a ghost." Panel 3 (top-right): "THE NAIVE COMPARISON" -- two slides, California's steep vs gentle "all 38 states", orange "-27 packs." Panel 4 (bottom-left): "A WEIGHTED TWIN" -- balance scale, California vs blocks (Utah, Nevada, Montana), orange "-19.5." Panel 5 (bottom-center): "TREND, NOT LEVEL" -- parallel railroad tracks splitting after "1989", glow on "1986-88", orange "-15.6." Panel 6 (bottom-right): "ASK THE PLACEBOS" -- faint gray crowd around zero, one bold teal line below, "Only California breaks from the pack", tag "p = 0.026." Professor's note bottom-right: "One command runs all three." Legend bottom-left: California (orange), synthetic (steel blue), placebo (teal). Faint formulas: weighted TWFE objective, Sigma omega = 1, at 15% opacity. No photorealism, no gradients, no precise charts, no pure white.

---

## Panel Reference Data

### Panel 1 -- One State, One Law, 1989

- **Position**: Row 1, Column 1 (top-left)
- **Dramatic function**: Hook
- **Story beat**: "Did Proposition 99 cut smoking?"
- **Callout**: "One state, one law, one question"
- **Key number**: N/A (conceptual panel; contextual tag "1989")
- **Central sketch**: Chalk magnifying glass over a California-shaped state silhouette containing a small cigarette pack, with a question mark rising from the lens
- **Body sentences** (for manual overlay):
  - In November 1988 California passed Proposition 99 -- a 25-cent-per-pack cigarette tax and a statewide anti-smoking campaign -- effective in 1989.
  - We want its causal effect on cigarette sales, but we can never observe the California that voted no.
- **Transition to next**: "And the catch is..."

### Panel 2 -- The Missing Twin

- **Position**: Row 1, Column 2 (top-center)
- **Dramatic function**: Stakes
- **Story beat**: "The California we can't observe"
- **Callout**: "Every method imputes a ghost"
- **Key number**: 38 control states (contextual)
- **Central sketch**: A solid chalk stick figure labeled "California" beside a translucent dashed-outline twin -- the unobserved no-policy California
- **Body sentences** (for manual overlay):
  - The data are a balanced panel: 39 US states, 1970-2000, one outcome -- cigarette packs sold per capita. California is the only treated unit.
  - Every estimator in the post is a recipe for the same dashed line: California's counterfactual outcome, Y(0), after 1989.
- **Transition to next**: "But the first attempt..."

### Panel 3 -- The Naive Comparison

- **Position**: Row 1, Column 3 (top-right)
- **Dramatic function**: First attempt
- **Story beat**: "Naive before/after overshoots"
- **Callout**: "-27 packs (naive DiD)"
- **Key number**: -27.35 packs per capita (raw 2x2 difference-in-differences)
- **Central sketch**: Two chalk playground slides -- California's plunging steeply, the gentle "all 38 states" slide barely dipping -- with the wedge between them hatched
- **Body sentences** (for manual overlay):
  - A raw 2x2 difference-in-differences compares California's drop to the average drop of all 38 control states: -27.35 packs.
  - But California was already sliding away from that average before 1989, so the equal-weighted comparison overstates the effect.
- **Transition to next**: "So build a better comparison..."

### Panel 4 -- A Weighted Twin

- **Position**: Row 2, Column 1 (bottom-left)
- **Dramatic function**: Twist
- **Story beat**: "Build a credible twin"
- **Callout**: "-19.5 (synthetic control)"
- **Key number**: -19.48 packs per capita (synthetic control via synth2)
- **Central sketch**: A chalk balance scale -- "California" in one pan, a small stack of blocks (Utah, Nevada, Montana) in the other -- sitting perfectly level (a Comparison metaphor)
- **Body sentences** (for manual overlay):
  - Synthetic control replaces the simple average with a weighted blend -- Utah 0.39, Montana 0.23, Nevada 0.21 -- that tracks California before 1989 (pre-fit RMSE 1.66).
  - That credible twin shrinks the estimate to -19.5 packs per capita, smaller than the naive -27.
- **Transition to next**: "The refinement is..."

### Panel 5 -- Trend, Not Level

- **Position**: Row 2, Column 2 (bottom-center)
- **Dramatic function**: Surprise
- **Story beat**: "Match the trend, weight the right years"
- **Callout**: "-15.6 (SDID)"
- **Key number**: -15.60 packs per capita (synthetic difference-in-differences)
- **Central sketch**: Two parallel chalk railroad tracks running a constant distance apart, then splitting just past a "1989" crosstie, with the three ties before it (tagged "1986-88") glowing faintly
- **Body sentences** (for manual overlay):
  - SDID adds two ideas to synthetic control: a constant level gap (a unit fixed effect, so it matches California's trend, not its level) and time weights that fall entirely on 1986-1988.
  - The result is the most conservative and most robust estimate: -15.6 packs per capita.
- **Transition to next**: "But is it real?"

### Panel 6 -- Ask the Placebos

- **Position**: Row 2, Column 3 (bottom-right)
- **Dramatic function**: Resolution
- **Story beat**: "One treated unit -> placebo inference"
- **Callout**: "Only California breaks from the pack"
- **Key number**: permutation p = 0.026 (placebo SE 9.88; 95% CI [-35.0, 3.8])
- **Central sketch**: A faint muted-gray crowd of placebo lines clustered at a chalk zero-line, with one bold teal line plunging far below, tagged "p = 0.026"
- **Body sentences** (for manual overlay):
  - With a single treated unit the jackknife is undefined and the bootstrap is unreliable, so inference uses placebo permutation.
  - Reassigning the treatment to each control state, only 1 of 38 placebos is as extreme as California: p = 0.026 -- significant, even though the normal-approximation interval [-35.0, 3.8] is wide.
- **Transition to next**: N/A (final panel)

### Story Spine

> Synthetic difference-in-differences reveals that California's Proposition 99 cut cigarette sales by about 16 packs per capita by building a credible weighted counterfactual, challenging the assumption that a simple before-and-after comparison -- which claims 27 -- tells the truth.

### Margin Elements

- **Professor's note**: "One command runs all three -- DiD weights every state and year equally; SDID weights a chosen few, and only the years that rhyme with the present." -- positioned bottom-right margin, with arrow toward Panel 5
- **Color legend**: California (observed): warm orange, Synthetic counterfactual: steel blue, Placebo evidence: teal
- **Background formulas** (4 fragments): "min Sigma (Y - mu - alpha_i - beta_t - W tau)^2 omega_i lambda_t", "Sigma omega_i = 1, omega_i >= 0", "zeta = (N_tr T_post)^1/4 sigma", "tau-hat +/- z sqrt(V)" at 15-20% opacity, plus a faint three-grid weighting sketch (uniform / sparse / spread dots)

### Tracked Estimators (all five ATTs the post compares)

- **Raw 2x2 DiD**: -27.35 -- compares California to the equal-weighted average of 38 states.
- **DiD via `sdid, method(did)`**: -27.35 -- identical to the hand-computed 2x2, proving the three methods are one weighted regression.
- **Synthetic control (`synth2`)**: -19.48 -- 6 donors (Utah, Montana, Nevada, Connecticut, New Hampshire, Colorado), pre-fit RMSE 1.66.
- **SC via `sdid, method(sc)`**: -19.62 -- matches `synth2` from inside the unified command.
- **SDID (recommended)**: -15.60 ✓ -- SE 9.88, permutation p = 0.026; matches Arkhangelsky et al. (2021).

### Message Inventory (Step 0.6)

- **ON-IMAGE (6, one per panel)**: Prop 99 / 1989 question (P1); the unobserved counterfactual (P2); naive DiD overshoots at -27 (P3); a weighted twin gives -19.5 (P4); SDID matches trend + weights 1986-88 -> -15.6 (P5); placebo says California is extreme, p = 0.026 (P6). Each panel carries exactly one ON-IMAGE message, so the **simple-storyboard** format applies (one metaphor per panel, 40-60 words, no sub-elements).
- **MARGIN (2)**: one command runs DiD/SC/SDID identically (professor's note); the three-color concept legend.
- **REFERENCE (2)**: `method(did)` reproduces the raw 2x2 exactly (Tracked Estimators); jackknife undefined / bootstrap needs many treated units, so placebo is the only valid option (Panel 6 body).
