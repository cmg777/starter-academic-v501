# Panel Templates and Element Rules

> This file is part of the `infographic-instructions` skill. If you update
> this content, also update the summary in SKILL.md. Read after template
> selection in Step 0.5.

## Template A -- Causal Inference

Use when post tags include "causal", or methods like DML/DoWhy/IV/RCT/partial
identification are central.

| Panel | Purpose | What to extract |
|-------|---------|-----------------|
| 1 | **The Problem** | Why this matters, what question it answers |
| 2 | **Case Study** | Dataset, sample size, treatment/outcome setup |
| 3 | **Core Method** | How the method works, key result with numbers |
| 4 | **Extensions / Comparisons** | Methods compared, which won and by how much |
| 5 | **Key Insight** | Most surprising takeaway -- the "aha" moment |
| 6 | **Bottom Line** | When to use this method, practical guidance |

## Template B -- ML / Prediction

Use when post focuses on prediction, classification, or model performance.

| Panel | Purpose | What to extract |
|-------|---------|-----------------|
| 1 | **The Question** | Prediction target, why it matters |
| 2 | **The Data** | Dataset, sample size, key features |
| 3 | **The Model** | Model architecture, baseline performance |
| 4 | **Tuning / Validation** | Tuning results, improvement over baseline |
| 5 | **Feature Insights** | Feature importance, what the model reveals |
| 6 | **Bottom Line** | Performance limits, what could improve it |

## Template C -- Exploratory / Descriptive

Use when post focuses on data patterns, spatial analysis, or descriptive
statistics.

| Panel | Purpose | What to extract |
|-------|---------|-----------------|
| 1 | **The Question** | Pattern investigated, why it matters |
| 2 | **The Data** | Dataset, scope, key variables |
| 3 | **Pattern 1** | First finding with specific numbers |
| 4 | **Pattern 2** | Second finding, contrast to Pattern 1 |
| 5 | **Synthesis** | How patterns connect, joint insight |
| 6 | **Implications** | Policy implications, next steps |

## Panel title rules

- Titles should be descriptive and specific to the post content
- Do NOT use generic titles like "Results" or "Analysis"
- Include the method name or key concept
- Examples: "MANSKI BOUNDS", "RANDOM FOREST VS. GRADIENT BOOSTING", "THE BACKDOOR CRITERION"

## Panel 4 comparison visual

Panel 4 (comparisons/extensions) must include a chalk-drawn comparison
visual as its mini-viz: side-by-side bars, overlapping intervals, or a
small check/cross table. Color-code the best method in teal (#00d4c8),
others in chalk white (#f0ece2).

## Icon rules

- Each panel's icon must be a concrete, specific chalk-drawn illustration
- Icons should be distinct across panels (no repeats)
- Examples: "chalk-drawn brackets [ ] flanking a question mark", "a chalk stick figure with a magnifying glass", "two overlapping interval bars"

## Mini-viz rules

- Each panel's mini-viz must describe a concrete chart type with specific data values from the post
- NOT generic (e.g., "a chart") -- always specific (e.g., "a chalk number line from -0.3 to 0.7 with bracket markers at the endpoints")
- Examples:
  - "A chalk number line from -0.3 to 0.7 with bracket markers at the bound endpoints"
  - "Two horizontal bars: a wide bar labeled 'Manski' (width 1.0) in chalk white and a narrow bar labeled 'Entropy' (width 0.68) highlighted in teal (#00d4c8)"
  - "A chalk bar chart with 4 bars for each method's estimate, the RF DML bar highlighted in teal"
  - "A chalk scatter plot with a trend line and residual arrows showing the partialling-out idea"

## Callout rules

- Exactly one callout per panel -- the single most impactful phrase
- Must contain a specific number or a memorable phrase
- Described with rendering instructions: size, color, chalk style

## Connector rules

- Each panel except Panel 1 gets a connector arrow from the previous panel
- The arrow carries a transition phrase (5-10 words) in muted gray chalk
- Phrases are specific to the post content
- Example: "A chalk arrow connects from Panel 2, with the phrase 'But what if confounders are hidden?' in small muted gray chalk along the arrow."
