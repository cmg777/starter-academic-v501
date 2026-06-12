# What Satellites Can — and Can't — See About Development

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6).

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) draws all body text and sketch outlines — the trees, the map of Bolivia, the satellite — never pure white, always slightly warm and creamy. Steel blue (#8bb8e0) marks the six panel titles and the chalk-drawn borders. Warm orange (#e8956a) highlights the key numbers — "339 × 64", "R² = 0.23", and "0.2307 → 0.2297". Teal (#00d4c8) marks the satellite signal and the three important embedding dimensions that glow. Muted chalk gray (#b0a89a) appears on the connector arrows and the faint background formulas.

The title banner reads "WHAT SATELLITES CAN — AND CAN'T — SEE ABOUT DEVELOPMENT" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Can 64 numbers from space predict how a town is doing?"

Panel 1 (top-left): Title "THE VIEW FROM ORBIT" in steel blue small-caps. A large chalk-drawn satellite hovers in the upper corner, casting a wide cone of dashed scan-lines down onto a hand-drawn outline of Bolivia divided into many small regions; a bold warm-orange question mark glows inside the map — the satellite sees everything yet understands nothing yet. A tiny chalk village of two stick-huts sits untouched below, no surveyor in sight. Callout: "No survey — just pixels" in warm orange. Chalk arrow to Panel 2.

Panel 2 (top-center): Title "339 TOWNS, 64 NUMBERS" in steel blue small-caps. On the left a small chalk satellite photo flows through a funnel into a tall vertical column of many tiny chalk squares — the 64-dimension embedding — stacked like a punch-card. On the right, the same outline map of Bolivia with its regions lightly hatched. A small chalk annotation reads "271 / 68 train–test" beneath the column. Callout: "339 × 64" in large warm orange chalk. Chalk arrow to Panel 3.

Panel 3 (top-right): Title "A FOREST OF TREES" in steel blue small-caps. A row of small chalk decision-trees, each just a few branching forks, sends thin chalk arrows into a single circular "average" node on the right — many noisy trees, one steadier answer. A faint in-panel chalk equation "f̂ = (1/B) Σ f̂_b" runs along the lower border at about 80% opacity. Callout: "R² = 0.23" in large warm orange chalk. Chalk arrow down to Panel 4.

Panel 4 (bottom-left): Title "TUNING CHANGES NOTHING" in steel blue small-caps. A large chalk balance scale sits almost perfectly level: the left pan labelled "baseline" in chalk white, the right pan labelled "tuned · 500 trees" — the beam barely tilts, a hair's width. A small in-panel chalk note "mtry = √64 = 8" rests beneath the fulcrum. Callout: "0.2307 → 0.2297" in large warm orange chalk. Chalk arrow to Panel 5.

Panel 5 (bottom-center): Title "WHAT THE PIXELS SAY" in steel blue small-caps. A large chalk magnifying glass hovers over a grid of the 64 tiny squares; three squares glow teal and carry chalk labels "A59", "A42", "A26" — no single one dominates. Beside it a small chalk step-curve rises sharply then flattens, hinting at threshold effects. Callout: "No single pixel pattern wins" in warm orange. Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "FILLING THE BLIND SPOTS" in steel blue small-caps. Two large chalk jigsaw pieces slide toward each other: the left piece sketched with a satellite icon labelled "pixels", the right piece labelled "survey + admin data". Between them a chalk-white outline of Bolivia is only half shaded — the empty half waits for the second piece. Callout: "Space sees the average, not the extremes" in warm orange. This is the final panel, no outgoing arrow.

In the bottom-right margin, outside the panel grid, two professor's handwritten-style annotations in smaller italic chalk white (#f0ece2) are stacked vertically. The first reads "Same R² before and after 50 tuning rounds — the ceiling is the data, not the model," with a hand-drawn chalk arrow pointing toward Panel 4. The second reads "Predictions hug the mean (47–55); the poorest and richest towns get smoothed away," with an arrow pointing toward Panel 6. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Satellite signal", a warm orange (#e8956a) dot labeled "Key numbers", and a muted gray (#b0a89a) dot labeled "Unexplained variation."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): "f̂ = (1/B) Σ f̂_b", "R² = 1 − SS_res/SS_tot", "mtry = √64 = 8", and "D = D_train ∪ D_test" are scattered across the background, alongside a tiny chalk decision-tree with branching arrows and a small step-function curve. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks add tactile realism.

This prompt generates the base image. The AI should render clearly: the title banner, 6 panel titles in steel blue, 6 central sketch illustrations, 3 key numbers in large warm orange chalk (339 × 64, R² = 0.23, 0.2307 → 0.2297), and 3 callout phrases. All other text — body sentences, annotations, transition phrases — is provided in the panel reference data for the user to overlay manually in an image editor. Keep text elements minimal and large for legibility.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) — all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not render precise statistical charts, axis labels, or data tables. Do not render a real feature-importance bar chart, a real scatter plot of predicted-versus-actual, or partial-dependence curves with numbered axis ticks — use simple chalk metaphors instead. Do not attempt to render more than 3 text elements per panel. Do not include photorealistic satellites, NASA imagery, or photographs of actual chalkboards or classrooms.

---

## Condensed Prompt (~200 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk sketchnote, chalk dust, faint formulas. Six panels, 3x2 grid, steel blue (#8bb8e0) chalk borders linked by chalk arrows. Title: "WHAT SATELLITES CAN — AND CAN'T — SEE ABOUT DEVELOPMENT" in steel blue small-caps; subtitle "Can 64 numbers from space predict how a town is doing?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body, warm orange (#e8956a) key numbers, teal (#00d4c8) highlights, muted gray (#b0a89a) annotations. Panel 1 (top-left) "THE VIEW FROM ORBIT" — satellite scanning a map of Bolivia, question mark; orange "No survey — just pixels." Panel 2 (top-center) "339 TOWNS, 64 NUMBERS" — photo funneling into a column of 64 tiles; orange "339 × 64." Panel 3 (top-right) "A FOREST OF TREES" — decision-trees averaging into one node; orange "R² = 0.23." Panel 4 (bottom-left) "TUNING CHANGES NOTHING" — balance scale almost level, baseline vs tuned; orange "0.2307 → 0.2297." Panel 5 (bottom-center) "WHAT THE PIXELS SAY" — magnifying glass over 64 tiles, three glowing teal (A59, A42, A26); "No single pixel pattern wins." Panel 6 (bottom-right) "FILLING THE BLIND SPOTS" — two jigsaw pieces, "pixels" + "survey data"; "Space sees the average, not the extremes." Professor's note bottom-right: "Tuning changed nothing — the ceiling is the data." Legend bottom-left: signal (teal), numbers (orange), unexplained (gray). Faint formulas: f̂ = (1/B) Σ f̂_b, mtry = √64 = 8 at 15% opacity. No photorealism, no gradients, no precise charts, no small text, no pure white.

---

## Panel Reference Data

### Panel 1 — The View from Orbit

- **Position**: Row 1, Column 1 (top-left)
- **Dramatic function**: Hook
- **Story beat**: "Can a satellite predict development without ever landing?"
- **Callout**: "No survey — just pixels"
- **Key number**: N/A (conceptual panel)
- **Central sketch**: A chalk satellite casting a cone of scan-lines onto an outline map of Bolivia with a warm-orange question mark inside; a tiny untouched village below
- **Body sentences** (for manual overlay):
  - Satellite imagery is a low-cost proxy for development where survey data are sparse — but how much signal does it really carry?
  - This tutorial predicts Bolivia's Municipal Sustainable Development Index (IMDS), a 0–100 composite, from 2017 satellite image embeddings.
  - The question (Overview): can 64 numbers extracted from orbit stand in for a costly ground survey?
  - Data come from the DS4Bolivia repository — all 339 municipalities, complete coverage, no missing values.
- **Transition to next**: "Here's exactly what we feed the model"

### Panel 2 — 339 Towns, 64 Numbers

- **Position**: Row 1, Column 2 (top-center)
- **Dramatic function**: Stakes
- **Story beat**: "339 municipalities, each just 64 numbers"
- **Callout**: "339 × 64"
- **Key number**: 339 municipalities × 64-dimensional embeddings
- **Central sketch**: A satellite photo funneling into a tall column of 64 tiny chalk tiles, beside a hatched outline map of Bolivia; annotation "271 / 68 train–test"
- **Body sentences** (for manual overlay):
  - Each of the 339 municipalities is paired with a 64-dimensional embedding vector extracted from 2017 satellite imagery.
  - The target IMDS ranges from 35.70 to 80.20 with a mean of 51.05 and standard deviation 6.77 (target-distribution figure).
  - An 80/20 split yields 271 training and 68 test municipalities — the test set is the honest scorecard.
  - Embeddings compress visual cues about land use, urbanization, and terrain into numbers a model can learn from.
- **Transition to next**: "Now turn it loose on a Random Forest"

### Panel 3 — A Forest of Trees

- **Position**: Row 1, Column 3 (top-right)
- **Dramatic function**: First attempt
- **Story beat**: "Many trees, averaged, explain about a quarter"
- **Callout**: "R² = 0.23"
- **Key number**: Baseline test R² = 0.2307 (RMSE 6.52, MAE 4.68)
- **Central sketch**: A row of small chalk decision-trees feeding arrows into one averaging node; in-panel sub-equation "f̂ = (1/B) Σ f̂_b"
- **Body sentences** (for manual overlay):
  - A Random Forest grows many decision trees, each on a bootstrap resample, and averages them: f̂ = (1/B) Σ f̂_b.
  - At each split only √64 = 8 of the 64 dimensions are considered, decorrelating the trees.
  - The baseline model (100 default trees) reaches test R² = 0.2307, RMSE = 6.52, MAE = 4.68.
  - That R² means satellite embeddings explain only about 23% of the variation in municipal development.
  - Performance is checked with 5-fold cross-validation on the training set, leaving the test set untouched.
- **Transition to next**: "Surely careful tuning will push it higher?"

### Panel 4 — Tuning Changes Nothing

- **Position**: Row 2, Column 1 (bottom-left)
- **Dramatic function**: Twist
- **Story beat**: "Fifty tuning rounds, and the needle barely moves"
- **Callout**: "0.2307 → 0.2297"
- **Key number**: Tuned test R² = 0.2297 vs baseline 0.2307 — essentially identical
- **Central sketch**: A chalk balance scale almost perfectly level — "baseline" pan vs "tuned · 500 trees" pan barely tip; in-panel sub-equation "mtry = √64 = 8" (Comparison metaphor)
- **Body sentences** (for manual overlay):
  - RandomizedSearchCV searched 50 hyperparameter combinations under 5-fold cross-validation.
  - The best configuration uses 500 trees with max_depth = 30 — far heavier than the defaults.
  - Yet the tuned model lands at test R² = 0.2297, RMSE = 6.52, MAE = 4.72 — virtually identical to baseline.
  - When the signal in the data is limited, sophisticated tuning adds almost nothing.
- **Transition to next**: "If tuning won't help, what is the model actually seeing?"

### Panel 5 — What the Pixels Say

- **Position**: Row 2, Column 2 (bottom-center)
- **Dramatic function**: Surprise
- **Story beat**: "No single pixel pattern wins — and the effects bend"
- **Callout**: "No single pixel pattern wins"
- **Key number**: N/A (qualitative — top dimensions A59, A42, A26)
- **Central sketch**: A magnifying glass over the 64-tile grid with three tiles glowing teal, labelled "A59", "A42", "A26"; a small step-curve rising then flattening
- **Body sentences** (for manual overlay):
  - Permutation importance is spread broadly — A59, A42, and A26 rank highest, but none dominates (feature-importance figure).
  - No single visual pattern drives development; the predictive signal is diffuse across many embedding dimensions.
  - Partial dependence plots reveal non-linear threshold effects: predicted IMDS jumps at certain values then levels off (partial-dependence figure).
  - These non-linearities are exactly why Random Forest outperforms plain linear regression here.
- **Transition to next**: "So where does that leave a policymaker?"

### Panel 6 — Filling the Blind Spots

- **Position**: Row 2, Column 3 (bottom-right)
- **Dramatic function**: Resolution
- **Story beat**: "Pixels plus paperwork — combine the two data sources"
- **Callout**: "Space sees the average, not the extremes"
- **Key number**: N/A (≈77% of IMDS variation left unexplained — see body)
- **Central sketch**: Two chalk jigsaw pieces clicking together — a "pixels" satellite piece and a "survey + admin data" piece — completing a half-shaded map of Bolivia (Connection metaphor)
- **Body sentences** (for manual overlay):
  - Satellite embeddings capture real signal but leave about 77% of IMDS variation unexplained.
  - Governance, migration, and informal economies are largely invisible from space.
  - Predictions cluster in the 47–55 range, missing the most extreme municipalities (actual-vs-predicted figure).
  - A policymaker targeting aid by satellite alone would overlook the hardest cases.
  - Next step: combine satellite data with administrative or survey data to close the gap.
- **Transition to next**: N/A (final panel)

### Story Spine

> Random Forest on satellite embeddings reveals that orbital imagery captures only about a quarter of municipal development — explaining just 23% of Bolivia's development index even after tuning 500 trees — challenging the assumption that more pixels or heavier tuning can predict development on their own.

### Margin Elements

- **Professor's note 1**: "Same R² before and after 50 tuning rounds — the ceiling is the data, not the model." — positioned bottom-right margin, with arrow toward Panel 4
- **Professor's note 2**: "Predictions hug the mean (47–55); the poorest and richest towns get smoothed away." — positioned bottom-right margin (stacked below note 1), with arrow toward Panel 6
- **Color legend** (3 entries): Satellite signal / key features: teal, Key numbers / results: warm orange, Unexplained variation / caveats: muted gray
- **Background formulas** (5 fragments): f̂ = (1/B) Σ f̂_b, R² = 1 − SS_res/SS_tot, mtry = √64 = 8, D = D_train ∪ D_test, plus a tiny chalk decision-tree and a step-function curve — all at 15-20% opacity

### Key Equations on Screen

- **f̂ = (1/B) Σ_b f̂_b** (Panel 3 in-panel and background): bagging averages B bootstrap trees to cut variance — the core of the forest.
- **mtry = √64 = 8** (Panel 4 in-panel and background): each split considers a random 8-of-64 feature subset, decorrelating the trees.
- **R² = 1 − SS_res/SS_tot** (background): the fraction of IMDS variance the model explains — here ≈ 0.23, leaving ≈ 77% unexplained.
- **D = D_train ∪ D_test** (background): the 339 municipalities split 271 / 68 for honest, leakage-free evaluation.

### Message Inventory (promised vs delivered)

- **ON-IMAGE (6)**: (1) imagery predicts development with no ground survey — Panel 1 metaphor + callout; (2) 339 municipalities × 64-dim embeddings — Panel 2 BIG number "339 × 64"; (3) forest averages many trees, baseline explains ≈23% — Panel 3 BIG number "R² = 0.23"; (4) 50-combo tuning changed nothing — Panel 4 BIG number "0.2307 → 0.2297"; (5) importance broad (A59/A42/A26) plus non-linear thresholds — Panel 5 metaphor + labels; (6) satellites miss extremes, combine data sources — Panel 6 metaphor + callout.
- **MARGIN (2)**: tuning ceiling is the data, not the model (note 1 → Panel 4); predictions hug 47–55 and smooth out extremes (note 2 → Panel 6).
- **REFERENCE (Section D body only)**: IMDS distribution (mean 51.05, sd 6.77, range 35.70–80.20); 271/68 split and 5-fold CV; RMSE 6.52 with MAE 4.68 → 4.72; tuned config 500 trees / max_depth 30; ≈77% unexplained with governance, migration, and informal economies invisible from space.
