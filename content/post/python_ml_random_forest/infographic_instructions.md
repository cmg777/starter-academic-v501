# Predicting Municipal Development from Satellite Imagery

## Design Style

- **Sketchnote aesthetic**: hand-drawn feel with informal lettering, doodle-style icons, and hand-sketched arrows connecting ideas
- Use simple illustrations: decision trees branching into a forest, satellite beaming down data, bar charts for feature importance, scatter plot for predictions
- Panels flow top-to-bottom or left-to-right with visual connectors (arrows, dotted lines)
- Key numbers should be large and bold; supporting text should be compact

## Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary / headers | Steel blue | `#6a9bcc` |
| Accents / highlights | Warm orange | `#d97757` |
| Text / outlines | Near black | `#141413` |
| Call-outs / emphasis | Teal | `#00d4c8` |
| Panel titles | Heading blue | `#1a3a8a` |

- Use steel blue for panel borders and section headers
- Use warm orange for key numbers and warning highlights (e.g., bias)
- Use teal for positive emphasis (e.g., "32% tighter")
- Use near black for body text and sketch outlines

## Panel Content (6 Panels)

### Panel 1 -- The Question

- Can satellite imagery predict how well a municipality is developing -- without ever visiting it?
- Random Forest regression takes 64 embedding dimensions extracted from satellite photos and predicts a composite development index for each of Bolivia's 339 municipalities.

### Panel 2 -- The Dataset

- 339 municipalities, each described by a 64-dimensional satellite embedding vector from 2017 imagery.
- Target: IMDS (Municipal Sustainable Development Index), ranging from 35.70 to 80.20 on a 0--100 scale, with a mean of 51.05.
- 80/20 split gives 271 training and 68 test municipalities.

### Panel 3 -- Random Forest Baseline

- Each tree sees a random subset of rows and features; the final prediction averages all 100 trees -- errors cancel out.
- Baseline with default hyperparameters: R² = 0.2307, RMSE = 6.52, MAE = 4.68 -- the model explains about 23% of IMDS variation.

### Panel 4 -- Tuning vs. Baseline

- RandomizedSearchCV tested 50 hyperparameter combinations with 5-fold cross-validation -- best config uses 500 trees with max_depth = 30.
- Tuned model: R² = 0.2297, RMSE = 6.52, MAE = 4.72 -- virtually identical to the baseline.
- When the signal in the data is limited, sophisticated tuning adds little.

### Panel 5 -- What the Satellites See

- Feature importance is distributed broadly -- A59, A42, and A26 rank highest, meaning no single visual pattern dominates.
- Partial dependence plots reveal non-linear threshold effects: predicted IMDS jumps sharply at certain embedding values then levels off.
- These non-linearities justify Random Forest over linear regression.

### Panel 6 -- Bottom Line

- Satellite embeddings capture real development signal but leave 77% of IMDS variation unexplained -- governance, migration, and informal economies are invisible from space.
- Predictions cluster in the 47--55 range, missing the most extreme municipalities -- a policymaker targeting aid would overlook the hardest cases.
- Next step: combine satellite data with administrative or survey data to close the gap.
