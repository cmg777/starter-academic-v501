# Panel Templates: Narrative Arc Structure

> This file is part of the `write-infographic` skill. Read after template
> selection in the confirm scope step.

## Content density: simple vs layered panels

Choose simple panels by default: 40-60 words describing one primary metaphor,
one callout, and a connector. A dense post may use layered panels (60-90 words,
up to three supporting elements) only when ≥6 ON-IMAGE messages and the available
space justify them. The main skill's text budget still applies: title, callout,
and at most one short annotation, excluding the panel numeral. Sub-tags and
in-panel equations count as annotations and must use full contrast. Move extra
labels and equations to Section D before shrinking text or safe margins.

`content/post/python_partial_identification/infographic_instructions.md` and
`content/post/python_mgwrfer/infographic_instructions.md` are narrative examples
for simple and layered scenes respectively, not current palette/texture defaults.
The dramatic function of each panel is independent of its density.

---

## Story Spine

Before designing panels, write a one-sentence Story Spine that captures
the narrative arc of the post:

> "[Subject/method] reveals that [key insight] by showing [evidence],
> challenging the assumption that [conventional wisdom]."

Then draft six story beats -- one phrase per panel -- that form a
beginning-middle-end arc with tension and resolution. The beats should
read like a story when spoken aloud.

**Example (partial identification):**
> "Partial identification reveals that honest bounds beat false precision
> by showing that even 5,000 observations cannot narrow Manski bounds,
> challenging the assumption that more data always means better answers."
>
> Beats: "What if key confounders are hidden?" -- "1,000 workers, one
> unmeasured variable" -- "Manski bounds span the full range" -- "Entropy
> cuts the range by 32%" -- "More data doesn't help at all" -- "Honest
> uncertainty beats false certainty"

---

## Template A -- Causal Inference

Use when post tags include "causal", or methods like DML/DoWhy/IV/RCT/
partial identification are central.

| Panel | Dramatic function | Content label | What to extract |
|-------|------------------|---------------|-----------------|
| 1 | **Hook** | The Problem | Why this matters -- the question or puzzle |
| 2 | **Stakes** | Case Study | Dataset, sample, treatment/outcome -- what's at risk |
| 3 | **First attempt** | Core Method | How the method works, baseline result |
| 4 | **Twist** | Comparisons | Methods compared -- which won and by how much |
| 5 | **Surprise** | Key Insight | Most counterintuitive finding -- the "aha" |
| 6 | **Resolution** | Bottom Line | When to use this, practical guidance |

**Story Spine pattern:** "[Method] reveals that [causal finding] by
showing [evidence from case study], challenging the assumption that
[conventional causal reasoning]."

## Template B -- ML / Prediction

Use when post focuses on prediction, classification, or model performance.

| Panel | Dramatic function | Content label | What to extract |
|-------|------------------|---------------|-----------------|
| 1 | **Hook** | The Question | Prediction target, why it matters |
| 2 | **Stakes** | The Data | Dataset, features, scope |
| 3 | **First attempt** | The Model | Architecture, baseline performance |
| 4 | **Twist** | Tuning / Validation | What improved and by how much |
| 5 | **Surprise** | Feature Insights | What the model reveals about the problem |
| 6 | **Resolution** | Bottom Line | Performance limits, when to use |

**Story Spine pattern:** "[Model/approach] reveals that [prediction
insight] by showing [model evidence], challenging the assumption that
[conventional ML reasoning]."

## Template C -- Exploratory / Descriptive

Use when post focuses on data patterns, spatial analysis, or descriptive
statistics.

| Panel | Dramatic function | Content label | What to extract |
|-------|------------------|---------------|-----------------|
| 1 | **Hook** | The Question | Pattern investigated, why it matters |
| 2 | **Stakes** | The Data | Dataset, scope, key variables |
| 3 | **First pattern** | Pattern A | First finding with key number |
| 4 | **Second pattern** | Pattern B | Contrasting or complementary finding |
| 5 | **Synthesis** | Connection | How patterns relate, joint insight |
| 6 | **Resolution** | Implications | Policy implications, next steps |

**Story Spine pattern:** "[Analysis] reveals that [pattern insight] by
showing [data evidence], challenging the assumption that [conventional
descriptive reasoning]."

---

## Central sketch rules

Each panel gets ONE large central sketch -- a visual metaphor that
communicates the story beat without precise statistical detail. See
`visual-metaphor-vocabulary.md` (in this reference directory) for the full vocabulary.

**Selection rules:**
- Choose from the suggested metaphor categories for each panel position
  (see the vocabulary file's template-to-metaphor mapping)
- The sketch must be drawable in 5 seconds on a napkin
- No two panels should use the same metaphor
- Panel 4 (Twist/Comparison) should always use a Comparison metaphor
  (balance scale, side-by-side objects, containers at different levels)
- Describe the sketch in 1-2 sentences of flowing prose
- Include at most one annotation label on the sketch (e.g., "32% tighter"
  on the smaller container)

**What NOT to do:**
- No precise bar charts, scatter plots, or number lines with tick marks
- No multi-row tables or axis labels
- No more than one text label per sketch
- Put complex statistical notation in Section D; a short, source-verified
  equation may use the single annotation slot in a justified layered panel

## Callout rules

- Exactly one callout per panel in website gold (#e9c184), unless the user overrides the palette
- Under 8 words -- punchy, memorable, quotable
- 3 of the 6 callouts must contain a BIG number from the post
- The other 3 can be memorable phrases
- Described with size/color instructions: "in large, sharp gold lettering"

## Connector rules

- Sharp arrows connect 1→2→3, route through the inter-row gutter from 3 back to
  4 at bottom-left, then 4→5→6. Keep arrowheads within the safe area.
- Arrows are visual only in Section A -- just "sharp chalk-inspired arrow"
- Transition phrases (the narrative thread) go in Section D only
- The transition phrases should use dramatic moves:
  - **Escalation** (Panels 1->2): "And the stakes are..."
  - **Complication** (Panels 2->3): "But the first attempt..."
  - **Turn** (Panels 3->4, 4->5): "The surprise is..."
  - **Resolution** (Panel 5->6): "So the lesson is..."

## Panel title rules

- 3-5 words in website blue, bold clean lettering
- Specific to the post content -- never generic ("Results", "Analysis")
- Include the method name or key concept
- Examples: "MANSKI BOUNDS", "ENTROPY CUTS THE RANGE", "THE SELECTION PROBLEM"
