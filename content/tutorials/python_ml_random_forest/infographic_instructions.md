# What Satellites Can — and Can't — See About Development

## Full Image Generation Prompt

Create a 1920x1080 landscape digital chalk illustration on a dark navy background (#0e1545). The style is academic chalkboard sketchnote: all lettering appears hand-drawn in chalk with slightly irregular strokes, chalk-dust particles float near text edges, and faint smudge marks add realism. The overall feel resembles a photograph of an expertly annotated university lecture chalkboard.

The composition features a title banner centered at the top and six rectangular panels arranged in a 3-column by 2-row grid below it, with generous dark navy space between panels. Each panel has a chalk-drawn rounded-rectangle border in steel blue (#8bb8e0) with slightly uneven hand-drawn edges. Panel numbers appear as small circled numerals in warm orange (#e8956a) in the top-left corner of each panel. Chalk arrows with faint dust particles connect the panels in reading order: left to right across the top row (1 to 2 to 3), a vertical arrow from Panel 3 down to Panel 4, then left to right across the bottom row (4 to 5 to 6).

Colors: Navy blue (#0e1545) fills the entire background. Chalk white (#f0ece2) is used for all body text and sketch outlines — never pure white (#ffffff), always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles and chalk-drawn borders. Warm orange (#e8956a) highlights the key numbers — the 339 by 64 data shape, the R-squared of 0.225, and the fold-to-fold swing from -0.03 to 0.45. Teal (#00d4c8) marks the satellite signal and the strongest feature. Muted chalk gray (#b0a89a) appears on connector arrows and background annotations.

The title banner reads "WHAT SATELLITES CAN — AND CAN'T — SEE ABOUT DEVELOPMENT" in large steel blue (#8bb8e0) chalk small-caps, centered above the grid. Below it in smaller chalk-white (#f0ece2) italic: "Can 64 numbers from orbit predict how a Bolivian town is doing — and how would we know?"

Panel 1 (top-left): Title "THE VIEW FROM ORBIT" in steel blue small-caps. A large chalk-drawn satellite hovers over a small map of hills and a village, casting a dotted scan-cone down onto the land — no surveyors, no clipboards, just the eye in the sky. Callout: "No survey — just pixels" in warm orange. Chalk arrow to Panel 2.

Panel 2 (top-center): Title "339 TOWNS, 64 NUMBERS" in steel blue small-caps. A chalk-drawn satellite photo pours through a funnel and comes out the bottom as a tall stack of small square tiles beside an outline map of Bolivia — an image compressed into a column of numbers. Callout: "339 × 64" in large warm orange chalk. Chalk arrow to Panel 3.

Panel 3 (top-right): Title "A FOREST, FAIRLY JUDGED" in steel blue small-caps. A cluster of small chalk trees feeds arrows into a single averaging circle, and a ring of five curved arrows loops around the whole cluster with one arc highlighted in teal (#00d4c8) — the rotating held-out fold. Callout: "R² = 0.225" in large warm orange chalk. Chalk arrow down to Panel 4.

Panel 4 (bottom-left): Title "FIVE EXAMS, FIVE GRADES" in steel blue small-caps. Five small chalk report cards are pinned in a row, each stamped with a wildly different grade — one a failing mark, one near the top of the class — all issued to the same model. Callout: "−0.03 to 0.45" in large warm orange chalk. Chalk arrow to Panel 5.

Panel 5 (bottom-center): Title "PREDICTIONS HUG THE MEAN" in steel blue small-caps. Two nested chalk bell-curve silhouettes share one centered peak: a wide chalk-white curve for the real towns, with a tall, narrow teal (#00d4c8) curve squeezed inside it for the predictions — the spread collapses inward. Callout: "Half the spread vanishes" in warm orange. Chalk arrow to Panel 6.

Panel 6 (bottom-right): Title "FILL THE BLIND SPOTS" in steel blue small-caps. Two chalk jigsaw pieces slide together over a half-shaded map — one piece labeled "pixels", the other "survey + admin" — completing a picture that neither finishes alone. Callout: "Space sees the average, not the edges" in warm orange.

In the bottom-right margin, outside the panel grid, two professor's handwritten-style annotations in smaller italic chalk white (#f0ece2) are stacked vertically, each with its own hand-drawn chalk arrow. The first reads "Grid, random, even Optuna tuning lift CV R-squared only 0.224 to 0.251 — less than the fold noise" and points toward Panel 4. The second reads "Predictions cluster near 51; the poorest and richest towns get smoothed away" and points toward Panel 5. In the bottom-left margin, a small color concept legend shows three entries: a teal (#00d4c8) dot labeled "Satellite signal / key feature", a warm orange (#e8956a) dot labeled "Key numbers / results", and a muted gray (#b0a89a) dot labeled "Unexplained variation / caveats."

Faint chalk-drawn equations are visible behind the panels on the navy background at approximately 15-20% opacity in muted gray (#b0a89a): the forest-average formula "y-hat = (1/B) Sigma T_b(x)", the variance formula "R^2 = 1 - SS_res/SS_tot", and "mtry = sqrt(64) = 8" are scattered across the background, alongside a tiny chalk ring of five arcs (the five folds) and a small chalk decision-tree silhouette. Subtle chalk dust particles float near text edges and panel borders, and faint smudge marks add tactile realism.

This prompt generates the base image. The AI should render clearly: the title banner, 6 panel titles in steel blue, 6 central sketch illustrations, 3 key numbers in large warm orange chalk (339 × 64, R² = 0.225, −0.03 to 0.45), and 3 callout phrases. All other text — body sentences, annotations, transition phrases — is provided in the panel reference data for the user to overlay manually in an image editor. Keep text elements minimal and large for legibility.

---

## Negative Prompt

Do not include: photorealistic rendering, glossy or reflective surfaces, drop shadows, gradient color fills, emojis or Unicode symbols, computer-generated sans-serif typography, neon glow effects, 3D perspective or depth, watermarks, stock photo elements, smooth vector curves, pure white (#ffffff) — all whites should be warm/creamy chalk white (#f0ece2). All lines should appear hand-drawn with varying weight and chalk texture. Do not use clean digital borders or perfectly straight lines. Do not render precise statistical charts, axis labels, tick marks, or data tables — the nested bell curves and report cards are loose chalk silhouettes, not plotted graphs. Do not attempt to render more than 3 text elements per panel. Do not include photographs of actual chalkboards, satellites, or classrooms.

---

## Condensed Prompt (~200 words)

Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545). Academic chalk sketchnote, chalk dust, faint formulas. Six panels in 3x2 grid with steel blue (#8bb8e0) chalk borders connected by chalk arrows. Title: "WHAT SATELLITES CAN — AND CAN'T — SEE ABOUT DEVELOPMENT" in steel blue small-caps, subtitle: "Can 64 numbers from orbit predict how a town is doing?" in italic chalk white (#f0ece2). Colors: chalk white (#f0ece2) body, orange (#e8956a) numbers, teal (#00d4c8) highlights, gray (#b0a89a) annotations. Panel 1 (top-left): "THE VIEW FROM ORBIT" — satellite scanning a village map, callout "No survey — just pixels" in orange. Panel 2 (top-center): "339 TOWNS, 64 NUMBERS" — satellite photo through a funnel into a stack of tiles, orange "339 × 64." Panel 3 (top-right): "A FOREST, FAIRLY JUDGED" — chalk trees averaging, ringed by five rotating fold-arcs (one teal), orange "R² = 0.225." Panel 4 (bottom-left): "FIVE EXAMS, FIVE GRADES" — five report cards with clashing grades, orange "−0.03 to 0.45." Panel 5 (bottom-center): "PREDICTIONS HUG THE MEAN" — narrow teal bell curve nested in a wide white one, orange "Half the spread vanishes." Panel 6 (bottom-right): "FILL THE BLIND SPOTS" — pixels + survey jigsaw pieces over a half-shaded map, "Space sees the average, not the edges." Professor's note: tuning adds less than the fold noise. Legend bottom-left: signal (teal), numbers (orange), caveats (gray). Faint formulas: y-hat = (1/B) Sigma T_b(x) at 15% opacity. No photorealism, no gradients, no precise charts, no pure white.

---

## Panel Reference Data

### Panel 1 — The View from Orbit

- **Position**: Row 1, Column 1 (top-left)
- **Dramatic function**: Hook
- **Story beat**: "Can a satellite predict development without ever landing?"
- **Callout**: "No survey — just pixels"
- **Key number**: N/A (conceptual panel)
- **Central sketch**: Chalk-drawn satellite over a small map of hills and a village, casting a dotted scan-cone onto the land
- **Body sentences** (for manual overlay):
  - Satellite imagery is a cheap, global proxy for development where surveys are sparse — and every Bolivian municipality is photographed from space.
  - A 2017 image of each town is compressed into 64 numbers; the question is whether those numbers know anything about human development.
- **Transition to next**: "Here's exactly what we feed the model"

### Panel 2 — 339 Towns, 64 Numbers

- **Position**: Row 1, Column 2 (top-center)
- **Dramatic function**: Stakes
- **Story beat**: "339 municipalities, each just 64 numbers"
- **Callout**: "339 × 64"
- **Key number**: 339 municipalities × 64-dimensional satellite embeddings (A00–A63)
- **Central sketch**: Satellite photo pouring through a funnel into a tall stack of 64 tiles beside an outline map of Bolivia
- **Body sentences** (for manual overlay):
  - The data cover all 339 municipalities with no missing values, pairing each with a 64-dimensional satellite embedding.
  - The target, IMDS, is tightly bunched — mean 51.05, standard deviation 6.77, ranging 35.70 to 80.20 — leaving little spread for a model to explain.
- **Transition to next**: "Now judge a forest honestly"

### Panel 3 — A Forest, Fairly Judged

- **Position**: Row 1, Column 3 (top-right)
- **Dramatic function**: First attempt
- **Story beat**: "Many trees, averaged — and every town tested fairly"
- **Callout**: "R² = 0.225"
- **Key number**: Pooled out-of-fold R² = 0.225 (RMSE 5.95, MAE 4.42)
- **Central sketch**: Cluster of small chalk trees feeding an averaging circle, encircled by a ring of five rotating arrows with one highlighted in teal — the held-out fold
- **Body sentences** (for manual overlay):
  - A Random Forest averages many decision trees; instead of one train/test split we use 5-fold cross-validation, giving every town an out-of-fold prediction from a model that never saw it.
  - Pooled over all 339 out-of-fold predictions, the forest explains about 22% of IMDS variation — real but limited signal.
- **Transition to next**: "But how stable is that score?"

### Panel 4 — Five Exams, Five Grades

- **Position**: Row 2, Column 1 (bottom-left)
- **Dramatic function**: Twist
- **Story beat**: "Same model, five folds, wildly different grades"
- **Callout**: "−0.03 to 0.45"
- **Key number**: Per-fold R² ranges −0.03 to 0.45; mean 0.224 ± 0.173
- **Central sketch**: Five chalk report cards pinned in a row, each stamped with a very different grade — one failing, one near the top — all from the same model (Comparison metaphor)
- **Body sentences** (for manual overlay):
  - The five folds disagree sharply: per-fold R² runs from −0.03 (worse than guessing the average) to 0.45, a mean of 0.224 with a standard deviation of 0.173.
  - A single train/test split would have shown just one of these grades — reporting the standard deviation is what keeps the performance claim honest.
- **Transition to next**: "And where do the predictions actually land?"

### Panel 5 — Predictions Hug the Mean

- **Position**: Row 2, Column 2 (bottom-center)
- **Dramatic function**: Surprise
- **Story beat**: "The model nails the average town and misses the edges"
- **Callout**: "Half the spread vanishes"
- **Key number**: Predicted SD 3.54 vs actual 6.77 (≈48% compression; KS test p < 0.001)
- **Central sketch**: A tall, narrow teal bell-curve silhouette nested inside a wide chalk-white one, both centered on the same peak
- **Body sentences** (for manual overlay):
  - Predictions match the centre almost exactly (mean 51.0) but reproduce only half the spread — predicted standard deviation 3.54 versus 6.77 actual, a 48% compression (KS test p < 0.001).
  - This variance compression is the expected behaviour of a low-R² model: it hedges toward the average and cannot flag the extreme towns, leaning on a few features (A30, A59, A26).
- **Transition to next**: "So where does that leave a policymaker?"

### Panel 6 — Fill the Blind Spots

- **Position**: Row 2, Column 3 (bottom-right)
- **Dramatic function**: Resolution
- **Story beat**: "Pixels plus paperwork — combine the data sources"
- **Callout**: "Space sees the average, not the edges"
- **Key number**: N/A (≈four-fifths of IMDS variation unexplained)
- **Central sketch**: Two chalk jigsaw pieces — "pixels" and "survey + admin" — sliding together over a half-shaded map
- **Body sentences** (for manual overlay):
  - Roughly four-fifths of IMDS variation is invisible from orbit — governance, migration, and informal economies leave no clear pixel signature.
  - The fix is data fusion: pair satellite embeddings with administrative or survey covariates rather than reaching for a fancier model.
- **Transition to next**: N/A (final panel)

### Story Spine

> Random Forest on satellite embeddings reveals that orbital imagery captures only the average town — explaining about 22% of Bolivia's development index, with cross-validated scores that swing from −0.03 to 0.45 across folds — challenging the assumption that a single accuracy number, or more hyperparameter tuning, tells you how well a model really predicts.

### Margin Elements

- **Professor's note 1**: "Grid, random, even Optuna tuning lift cross-validated R-squared only from 0.224 to 0.251 — less than the fold-to-fold noise. The ceiling is the data, not the model." — positioned bottom-right margin, arrow toward Panel 4
- **Professor's note 2**: "Predictions cluster near 51; the poorest and richest towns get smoothed away." — positioned bottom-right margin (stacked below note 1), arrow toward Panel 5
- **Color legend** (3 entries): Satellite signal / key feature: teal, Key numbers / results: warm orange, Unexplained variation / caveats: muted gray
- **Background formulas** (5 fragments): y-hat = (1/B) Sigma T_b(x), R^2 = 1 − SS_res/SS_tot, mtry = sqrt(64) = 8, a tiny ring of five arcs (the five CV folds), and a small chalk decision-tree silhouette — all at 15-20% opacity

### Three Concepts

- **Cross-validation (k-fold)** — rotate the held-out fold across five rounds so every town is tested exactly once; averages out the luck of a single split.
- **Out-of-fold (OOF) prediction** — each town's prediction from the round in which it was held out, giving one honest prediction for all 339 at once.
- **Variance compression** — a model with modest R² produces predictions narrower than the truth (predicted SD 3.54 vs actual 6.77), hugging the mean.

### Key Equations on Screen

- **y-hat = (1/B) Σ_b T_b(x)** (Panel 3 and background): the forest prediction is the average of B decision trees.
- **R² = 1 − SS_res/SS_tot** (background): the fraction of IMDS variance the model explains; negative on one fold means worse than the mean.
- **mtry = sqrt(64) = 8** (background): each split considers a random 8 of the 64 embedding features, decorrelating the trees.

### Message Inventory (promised vs delivered)

- **ON-IMAGE (6)**: (1) imagery predicts without a survey — Panel 1; (2) 339 × 64 data shape — Panel 2 BIG number; (3) 5-fold CV gives an out-of-fold prediction for every town, pooled R² 0.225 — Panel 3 BIG number; (4) the score swings −0.03 to 0.45 across folds, so report the SD — Panel 4 BIG number; (5) predictions compress to the mean — Panel 5; (6) combine pixels with survey data — Panel 6
- **MARGIN (2)**: tuning adds less than the fold noise, 0.224 → 0.251 (note 1 → Panel 4); predictions cluster near 51, extremes smoothed (note 2 → Panel 5)
- **REFERENCE**: top features A30/A59/A26; predicted SD 3.54 vs 6.77 and KS p < 0.001; per-fold metrics and mean ± SD; ~22% explained / four-fifths unexplained; the three concepts and key equations above
