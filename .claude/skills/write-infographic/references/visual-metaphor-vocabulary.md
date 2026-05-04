# Visual Metaphor Vocabulary

> This file is part of the `write-infographic` skill. Use when selecting
> the central sketch for each panel. Choose metaphors Gemini can draw
> reliably: simple shapes, clear silhouettes, minimal detail.

## Metaphors by communicative purpose

### Comparison

Use when a panel contrasts two or more methods, groups, or outcomes.

- **Balance scale** -- two pans at different heights, heavier side wins
- **Tug-of-war** -- two stick figures pulling a rope, one side gaining
- **Containers at different levels** -- two beakers or buckets, one fuller
- **Side-by-side objects** -- big vs small version of the same shape (e.g., wide bar vs narrow bar)
- **Podium** -- first/second/third place stand with labels

### Narrowing / Precision

Use when bounds tighten, uncertainty shrinks, or estimates get sharper.

- **Funnel** -- wide top narrowing to a focused stream
- **Telescope focusing** -- blurry circle sharpening to a clear image
- **Brackets closing in** -- large [ ] squeezing to smaller [ ]
- **Net tightening** -- a net drawing closed around a target
- **Calipers** -- measuring tool closing around an object

### Surprise / Reversal

Use when results defy expectations or reveal a counterintuitive finding.

- **Lightning bolt** -- striking a conventional-wisdom statement
- **Flipped hourglass** -- time/expectation inverted
- **Broken chain** -- a link snapping, assumption failing
- **Cracked surface** -- a solid block with a visible crack
- **Exclamation in a speech bubble** -- a stick figure reacting

### Decision / Choice

Use when the panel presents a decision framework, policy rule, or method selection.

- **Fork in the road** -- path splitting into 2-3 labeled directions
- **Signpost with arrows** -- each arrow pointing to a different option
- **Doorways** -- 2-3 doors with labels, one highlighted
- **Crossroads** -- intersection with directional arrows
- **Flowchart** -- 2-3 nodes with simple yes/no branches

### Growth / Trend

Use when showing improvement, accumulation, or progression over time.

- **Staircase** -- steps ascending left to right with labels
- **Mountain path** -- winding trail from base to summit
- **Ascending arrows** -- arrow stepping up in stages
- **Seedling to tree** -- growth stages left to right
- **Ladder** -- rungs with milestones

### Investigation / Discovery

Use when the panel introduces a question, explores data, or examines evidence.

- **Magnifying glass** -- hovering over a target, enlarging detail
- **Flashlight beam** -- cone of light illuminating a hidden area
- **Key in lock** -- unlocking a mystery or dataset
- **Map with X** -- treasure map with a marked destination
- **Binoculars** -- looking toward the horizon / future

### Connection / Synthesis

Use when the panel links findings, combines patterns, or shows how parts relate.

- **Puzzle pieces fitting** -- 2-3 interlocking pieces
- **Bridge between cliffs** -- spanning a gap labeled with the connection
- **Gears meshing** -- 2-3 interlocking gears with labels
- **Knot tying** -- strands coming together
- **Venn diagram overlap** -- two circles with a shared center

### Protection / Robustness

Use when showing that results survive sensitivity checks, falsification, or stress tests.

- **Shield** -- blocking incoming arrows (threats to validity)
- **Umbrella in rain** -- sheltering results from bias
- **Anchor** -- holding steady despite waves
- **Fortress wall** -- standing firm against attacks
- **Checkmark on a clipboard** -- passing a checklist

---

## Template-to-metaphor mapping

Suggested metaphor categories for each panel position. These are defaults --
override when a post's content clearly fits a different category.

### Template A -- Causal Inference

| Panel | Dramatic function | Suggested metaphors |
|-------|------------------|---------------------|
| 1 | Hook | Investigation, Decision |
| 2 | Stakes | Growth, Connection |
| 3 | First attempt | Narrowing, Investigation |
| 4 | Twist | Comparison (strongly preferred) |
| 5 | Surprise | Surprise, Reversal |
| 6 | Resolution | Decision, Protection |

### Template B -- ML / Prediction

| Panel | Dramatic function | Suggested metaphors |
|-------|------------------|---------------------|
| 1 | Hook | Investigation, Decision |
| 2 | Stakes | Growth, Connection |
| 3 | First attempt | Narrowing, Growth |
| 4 | Twist | Comparison (strongly preferred) |
| 5 | Surprise | Surprise, Investigation |
| 6 | Resolution | Decision, Protection |

### Template C -- Exploratory / Descriptive

| Panel | Dramatic function | Suggested metaphors |
|-------|------------------|---------------------|
| 1 | Hook | Investigation, Decision |
| 2 | Stakes | Growth, Connection |
| 3 | First pattern | Connection, Narrowing |
| 4 | Second pattern | Comparison (strongly preferred) |
| 5 | Synthesis | Connection, Surprise |
| 6 | Resolution | Decision, Growth |

---

## What Gemini draws well vs poorly

**Draws well:** Simple silhouettes, stick figures, single objects with
clear outlines, large text, chalk textures, icons with 1-2 elements,
metaphorical scenes, contrasting sizes.

**Draws poorly:** Precise bar charts with exact values, number lines with
labeled tick marks, scatter plots, multi-row tables, small text labels,
more than 3 distinct text strings per region, statistical notation,
axis labels, legends with many entries.

**Rule of thumb:** If you need a ruler to draw it on paper, Gemini
cannot draw it. If you can sketch it in 5 seconds on a napkin, Gemini
can draw it.
