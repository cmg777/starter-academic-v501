---
name: infographic-instructions
description: Generate an AI-image-generation prompt that creates a chalkboard-style infographic summarizing a blog post into 6 panels. Produces a copy-pasteable prompt optimized for Gemini, DALL-E, Midjourney, or Ideogram, with a condensed variant and panel reference data.
argument-hint: "<post slug, e.g. python_partial_identification>"
disable-model-invocation: true
user-invocable: true
---

# Infographic Instructions: AI Image Prompt Generator

Read an existing blog post on this site and produce an `infographic_instructions.md`
file in the post's page bundle. The file is a **ready-to-paste AI image generation
prompt** that creates a chalkboard-style infographic summarizing the post into 6
panels. It contains four sections: (A) a full flowing-prose prompt with scene
description, composition, color system, panel-by-panel visual scenes, enrichment
elements, and text rendering guidance; (B) a negative prompt; (C) a condensed
~300-word prompt for token-limited tools; and (D) a structured panel reference
data appendix. The skill auto-selects a panel template (causal inference,
ML/prediction, or exploratory/descriptive) based on the post's content, and
asks the user to confirm key choices before generating.

## Example invocations

```
/project:infographic-instructions python_partial_identification
/project:infographic-instructions python_dowhy
/project:infographic-instructions python_doubleml
/project:infographic-instructions python_ml_random_forest
```

## Reference output

Use `content/post/python_partial_identification/infographic_instructions.md` as
the reference for tone, structure, and level of detail.

---

## Step 0 -- Pre-flight

1. **Parse arguments.** Extract the post slug from `$ARGUMENTS`.
   - If a full path is given (e.g. `content/post/python_dowhy/`), use it directly.
   - If a slug is given (e.g. `python_dowhy`), resolve to `content/post/<slug>/index.md`.

2. **Verify the post exists.** Read `index.md` in the resolved directory. If it
   does not exist, report the error and stop.

3. **Read the full post.** Read the entire `index.md` to understand the topic,
   case study, methods, key results, and takeaways.

4. **Read the reference output.** Read
   `content/post/python_partial_identification/infographic_instructions.md` to
   calibrate the scene description style and prompt structure.

5. **Extract key content.** Identify:
   - The post's core topic and method(s)
   - The case study / dataset (name, sample size, key variables)
   - 6-10 specific numbers (coefficients, bounds, sample sizes, percentages, p-values)
   - The most surprising or impactful finding
   - 2-3 topic-specific formulas for background texture
   - 2-3 topic-specific icon ideas

6. **Select the panel template.** Choose Causal Inference, ML/Prediction, or
   Exploratory/Descriptive based on the post's tags and content. Draft all six
   panel headlines, key numbers, and callout phrases internally.

---

## Step 0.5 -- User Confirmation

Before generating, present the user with a confirmation summary and wait for
their response. Display all items in a single formatted block:

1. **Template selected**: "[Causal Inference / ML-Prediction / Exploratory-Descriptive] -- based on [brief reasoning]. Change?"

2. **Title + guiding question**: "Proposed title: '[title]'. Guiding question: '*[question]*'. Modify?"

3. **Panel overview**: A compact 6-row summary:

   ```
   Panel 1: [Title] -- key number: [number]
   Panel 2: [Title] -- key number: [number]
   ...
   Panel 6: [Title] -- key number: [number]
   ```

4. **Target AI tool**: "Which tool will you use? [Gemini / DALL-E 3 / Midjourney / Ideogram / Other]. This affects prompt length and text rendering approach."

5. **Text rendering preference**:
   - "Option A: Include all text -- title, panel titles, body sentences, key numbers, annotations (best for Gemini / Ideogram)"
   - "Option B: Key text only -- title, panel titles, key numbers, callout phrases (best for DALL-E 3)"
   - "Option C: Minimal text -- visual layout with numbers only, body text shown as decorative wavy chalk lines (best for Midjourney)"

**Handling responses:**
- "Looks good" / "proceed" / no changes: continue with defaults (Option A text rendering)
- Specific adjustments: incorporate them and proceed
- Major changes requested: revise the draft and re-present the summary

---

## Step 1 -- Generate the prompt file

Write `infographic_instructions.md` in the post's page bundle directory
(e.g. `content/post/<slug>/infographic_instructions.md`).

The file has four sections (A, B, C, D). Use `---` horizontal rules to
separate them. Use `##` headers to label each section.

---

### Section A: Full Image Generation Prompt

This is the main deliverable -- a flowing prose prompt the user copies into
an AI image generation tool. Structure it as follows, using `##` for the
section header and no sub-headers within (the AI tool receives it as
continuous prose organized into labeled paragraphs).

#### A1. Opening line

Start with one sentence that sets the medium, style, format, and dimensions:

```
Create a 1920x1080 landscape digital chalk illustration on a dark navy
background (#0e1545). The style is academic chalkboard sketchnote: all
lettering appears hand-drawn in chalk with slightly irregular strokes,
chalk-dust particles float near text edges, and faint smudge marks add
realism. The overall feel resembles a photograph of an expertly annotated
university lecture chalkboard.
```

This opening line is identical for every post -- copy it exactly.

#### A2. Composition paragraph

Describe the full layout in one paragraph. Include:
- Title banner centered at the top, above the grid
- 6 panels in a 3-column x 2-row grid below the title
- Panel borders: chalk-drawn rounded rectangles in steel blue (#8bb8e0) with slightly uneven edges
- Panel numbers: small circled numerals in warm orange (#e8956a), top-left corner of each panel
- Connector arrows: chalk arrows with dust particles connecting panels in reading order (1->2->3 across top row, vertical arrow from 3 down to 4, then 4->5->6 across bottom row)
- Generous dark space between panels -- the navy background is a design element
- Breathing room around the entire grid for margin elements

#### A3. Color system paragraph

Describe all 6 colors as flowing prose (NOT a table). Each color gets its name,
hex code, and role. Include post-specific usage examples for warm orange and teal.

The 6 colors (always the same):

| Role | Color | Hex |
|------|-------|-----|
| Background | Navy blue | `#0e1545` |
| Body text / outlines | Chalk white | `#f0ece2` |
| Panel titles / headers | Steel blue (bright) | `#8bb8e0` |
| Accents / key numbers | Warm orange | `#e8956a` |
| Call-outs / positive emphasis | Teal | `#00d4c8` |
| Underlines / secondary accents | Muted chalk gray | `#b0a89a` |

In the output, render this as prose, e.g.:
```
Colors: Navy blue (#0e1545) fills the background. Chalk white (#f0ece2) is
used for all body text and sketch outlines -- never pure white (#ffffff),
always slightly warm and creamy. Steel blue (#8bb8e0) marks panel titles
and borders. Warm orange (#e8956a) highlights key numbers, bold callouts,
and cautionary findings like [cite a specific cautionary result from the
post]. Teal (#00d4c8) marks positive results like [cite a specific positive
result from the post]. Muted chalk gray (#b0a89a) appears on connectors,
annotations, and de-emphasized labels.
```

The bracketed examples MUST reference actual numbers or findings from the post.

#### A4. Title banner paragraph

Describe the title banner positioned at the top center, above the panel grid:
- Title text in large steel blue chalk small-caps
- Guiding question in smaller chalk-white italic below the title

**Title rules:**
- Do NOT use generic titles like "Infographic Instructions" or the post's full title
- Capture the core idea in under 12 words
- Frame it as what the reader will learn, not what the post does

**Guiding question rules:**
- Must be a genuine question the reader would ask
- Should create curiosity and motivate reading the panels

**Examples:**

```
The title banner reads "BOUNDING CAUSAL EFFECTS WHEN CONFOUNDERS ARE HIDDEN"
in large steel blue (#8bb8e0) chalk small-caps, centered above the grid.
Below it in smaller chalk-white (#f0ece2) italic: "What can we still learn
when key variables are unmeasured?"
```

```
The title banner reads "ESTIMATING CAUSAL EFFECTS WITH DOUBLE MACHINE
LEARNING" in large steel blue (#8bb8e0) chalk small-caps, centered above
the grid. Below it in smaller chalk-white (#f0ece2) italic: "Can machine
learning separate causal signals from confounding noise?"
```

#### A5. Panel descriptions (1 through 6)

Each panel is described as a **flowing paragraph** -- not bullet points. Each
paragraph weaves together all visual elements for that panel:

1. **Spatial position** -- e.g., "The top-left panel (row 1, column 1)"
2. **Border and number** -- chalk-drawn rounded rectangle, circled number in warm orange
3. **Title text** -- in steel blue small-caps chalk lettering, with exact wording
4. **Icon** -- a concrete chalk-drawn illustration woven into the scene (e.g., "A chalk-drawn magnifying glass hovers over a stick figure")
5. **Mini-viz** -- a small chalk-drawn chart or diagram with specific data values (e.g., "A chalk number line spans from -0.3 to 0.7 with bracket markers at the endpoints")
6. **Callout** -- the single most impactful phrase, described with rendering instructions: "The phrase '[text]' appears in large warm orange (#e8956a) chalk numerals with a chalk underline swoosh"
7. **Body text** -- the remaining 1-2 sentences, described according to the user's text rendering preference:
   - Option A: "In chalk white (#f0ece2), the text reads: '[sentence 1]' and '[sentence 2]'"
   - Option B: skip body text, only title + callout + key number
   - Option C: "Decorative wavy chalk lines in chalk white suggest body text"
8. **Connector arrow** -- chalk arrow to next panel with transition phrase: "A chalk arrow connects to Panel N with the phrase '[transition]' in small muted gray (#b0a89a) chalk along the arrow"

**Spatial position mapping (3x2 grid):**

```
Row 1: Panel 1 (top-left)    | Panel 2 (top-center)    | Panel 3 (top-right)
Row 2: Panel 4 (bottom-left) | Panel 5 (bottom-center) | Panel 6 (bottom-right)
```

**Panel templates** -- choose based on post content:

**Template A -- Causal Inference** (use when post tags include "causal", or
methods like DML/DoWhy/IV/RCT/partial identification are central)

| Panel | Purpose | What to extract |
|-------|---------|-----------------|
| 1 | **The Problem** | Why this matters, what question it answers |
| 2 | **Case Study** | Dataset, sample size, treatment/outcome setup |
| 3 | **Core Method** | How the method works, key result with numbers |
| 4 | **Extensions / Comparisons** | Methods compared, which won and by how much |
| 5 | **Key Insight** | Most surprising takeaway -- the "aha" moment |
| 6 | **Bottom Line** | When to use this method, practical guidance |

**Template B -- ML / Prediction** (use when post focuses on prediction,
classification, or model performance)

| Panel | Purpose | What to extract |
|-------|---------|-----------------|
| 1 | **The Question** | Prediction target, why it matters |
| 2 | **The Data** | Dataset, sample size, key features |
| 3 | **The Model** | Model architecture, baseline performance |
| 4 | **Tuning / Validation** | Tuning results, improvement over baseline |
| 5 | **Feature Insights** | Feature importance, what the model reveals |
| 6 | **Bottom Line** | Performance limits, what could improve it |

**Template C -- Exploratory / Descriptive** (use when post focuses on data
patterns, spatial analysis, or descriptive statistics)

| Panel | Purpose | What to extract |
|-------|---------|-----------------|
| 1 | **The Question** | Pattern investigated, why it matters |
| 2 | **The Data** | Dataset, scope, key variables |
| 3 | **Pattern 1** | First finding with specific numbers |
| 4 | **Pattern 2** | Second finding, contrast to Pattern 1 |
| 5 | **Synthesis** | How patterns connect, joint insight |
| 6 | **Implications** | Policy implications, next steps |

**Panel title rules:**
- Titles should be descriptive and specific to the post content
- Do NOT use generic titles like "Results" or "Analysis"
- Include the method name or key concept
- Examples: "MANSKI BOUNDS", "RANDOM FOREST VS. GRADIENT BOOSTING", "THE BACKDOOR CRITERION"

**Panel 4 comparison visual:**
Panel 4 (comparisons/extensions) must include a chalk-drawn comparison
visual as its mini-viz: side-by-side bars, overlapping intervals, or a
small check/cross table. Color-code the best method in teal (#00d4c8),
others in chalk white (#f0ece2).

**Icon rules:**
- Each panel's icon must be a concrete, specific chalk-drawn illustration
- Icons should be distinct across panels (no repeats)
- Examples: "chalk-drawn brackets [ ] flanking a question mark", "a chalk stick figure with a magnifying glass", "two overlapping interval bars"

**Mini-viz rules:**
- Each panel's mini-viz must describe a concrete chart type with specific data values from the post
- NOT generic (e.g., "a chart") -- always specific (e.g., "a chalk number line from -0.3 to 0.7 with bracket markers at the endpoints")
- Examples:
  - "A chalk number line from -0.3 to 0.7 with bracket markers at the bound endpoints"
  - "Two horizontal bars: a wide bar labeled 'Manski' (width 1.0) in chalk white and a narrow bar labeled 'Entropy' (width 0.68) highlighted in teal (#00d4c8)"
  - "A chalk bar chart with 4 bars for each method's estimate, the RF DML bar highlighted in teal"
  - "A chalk scatter plot with a trend line and residual arrows showing the partialling-out idea"

**Callout rules:**
- Exactly one callout per panel -- the single most impactful phrase
- Must contain a specific number or a memorable phrase
- Described with rendering instructions: size, color, chalk style

**Connector rules:**
- Each panel except Panel 1 gets a connector arrow from the previous panel
- The arrow carries a transition phrase (5-10 words) in muted gray chalk
- Phrases are specific to the post content
- Example: "A chalk arrow connects from Panel 2, with the phrase 'But what if confounders are hidden?' in small muted gray chalk along the arrow."

#### A6. Margin elements paragraph

After all 6 panels, describe the elements outside the panel grid:

**Professor's margin note:**
- Position: bottom-right margin, outside the panel grid
- Style: smaller italic chalk text with a hand-drawn arrow pointing toward the relevant panel
- Content: a specific, memorable insight from the post -- the kind of thing a professor would scribble in a student's paper margin. NOT a generic statement.

**Color concept legend:**
- Position: bottom-left margin, outside the panel grid
- Style: small chalk text with colored dots or swatches
- Content: 2-3 recurring concepts mapped to consistent colors across all panels

Legend entries must be adapted to the post. Examples:
- Causal posts: "Causal effect: teal dot, Bias/confounding: warm orange dot, Data: chalk white dot"
- ML posts: "Model performance: teal dot, Overfitting/error: warm orange dot, Features: chalk white dot"
- Exploratory posts: "Key pattern: teal dot, Outlier/anomaly: warm orange dot, Variables: chalk white dot"

#### A7. Texture and atmosphere paragraph

Describe the atmospheric details that make the chalkboard feel real:

- Chalk dust particles floating near text edges and panel borders
- Subtle smudge marks where chalk has been partially erased
- Faint chalk-drawn equations or formulas visible behind the panels on the navy background, at ~15-20% opacity in muted gray (#b0a89a)
- The specific formulas must be relevant to the post's topic

Formula examples per topic:
- Partial identification: `Y = f(T, U) + ε`, `P(Y|T) = Σ P(Y|T,U)P(U|T)`
- Random forest: `ŷ = (1/B) Σ fₖ(x)`, `MSE = (1/n) Σ(yᵢ - ŷᵢ)²`
- DoWhy: `E[Y|do(T)]`, `Y ⊥ T | X`
- DML: `θ₀ = E[ψ(W; θ₀, η₀)]`, `Y - g(X) = θ(D - m(X)) + ε`

Illustration suggestions must also be topic-specific:
- Partial identification: "stick figures for workers, magnifying glass for unmeasured, brackets for bounds"
- Random forest: "decision trees, forest of trees, feature importance bars"
- DoWhy: "DAG arrows, treatment/outcome nodes, refutation shields"
- DML: "decision trees for ML learners, crossed-out confounders, folded data blocks for cross-fitting"

#### A8. Text rendering guidance paragraph

Based on the user's choice in Step 0.5, add a paragraph specifying text
rendering priorities:

**Option A (all text):**
```
Text rendering priorities: The title banner text and panel numbers must be
clearly legible. Panel titles should be readable in steel blue small-caps.
Key numbers and callout phrases must be prominent in warm orange. Body text
sentences should be readable in chalk white. Connector phrases and annotations
can be smaller but still legible. Background formulas should be barely
visible at 15-20% opacity.
```

**Option B (key text only):**
```
Text rendering priorities: The title banner, panel numbers, panel titles,
key numbers, and callout phrases must be clearly legible. Body text should
be omitted or represented as faint chalk-white wavy lines suggesting
handwriting. Background formulas at 15-20% opacity.
```

**Option C (minimal text):**
```
Text rendering priorities: Only the title banner and panel numbers need to
be legible text. All other text -- panel titles, body sentences, annotations
-- should appear as decorative wavy chalk lines that suggest handwriting
without being readable. Key numbers should be the only other legible elements,
rendered large in warm orange. Background formulas at 10% opacity.
```

---

### Section B: Negative Prompt

Separated from Section A by a `---` horizontal rule and labeled `## Negative Prompt`.

The negative prompt is mostly static with a few topic-specific additions:

```
Do not include: photorealistic rendering, glossy or reflective surfaces,
drop shadows, gradient color fills, emojis or Unicode symbols, computer-
generated sans-serif typography, neon glow effects, 3D perspective or
depth, watermarks, stock photo elements, smooth vector curves, pure white
(#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2).
All lines should appear hand-drawn with varying weight and chalk texture.
Do not use clean digital borders or perfectly straight lines.
```

Add 1-2 topic-specific exclusions if relevant (e.g., "Do not include
photographs of actual chalkboards or classrooms").

---

### Section C: Condensed Prompt

Separated by `---` and labeled `## Condensed Prompt (~300 words)`.

A compressed version of Section A for token-limited tools (Midjourney ~6000
chars, DALL-E ~4000 chars). Write in telegram-style -- dense, no filler:

Structure:
1. Style + format + dimensions (1 sentence)
2. Layout (1 sentence)
3. Colors with hex codes (1 sentence listing all 6)
4. Title text (1 sentence)
5. One sentence per panel: position, title, key visual, key number
6. Margin elements (1 sentence)
7. Atmosphere (1 sentence)
8. Negative prompt (1 sentence)

Target: under 400 words / 2500 characters.

**Example structure:**

```
Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545).
Academic chalk-drawn sketchnote style with hand-lettered text, chalk dust,
and faint formula textures. Six panels in a 3x2 grid with steel blue
(#8bb8e0) chalk borders connected by chalk arrows. Title: "[TITLE]" in
steel blue small-caps, subtitle: "[guiding question]" in italic chalk
white. Colors: chalk white (#f0ece2) body text, warm orange (#e8956a) key
numbers, teal (#00d4c8) positive highlights, muted gray (#b0a89a)
annotations. Panel 1 (top-left): "[TITLE]" -- [icon description], [key
number in orange]. Panel 2 (top-center): ... [continue for all 6 panels].
Professor's margin note bottom-right: "[note text]". Color legend
bottom-left: [concept]: teal, [concept]: orange, [concept]: white. Faint
background formulas: [formula 1], [formula 2] at 15% opacity. No
photorealism, no gradients, no emojis, no drop shadows, no pure white.
```

---

### Section D: Panel Reference Data

Separated by `---` and labeled `## Panel Reference Data`.

This section is NOT part of the prompt -- it is a structured appendix the
user can reference when iterating or adjusting the generated image. Use
markdown formatting (headers, bullets) for readability.

For each panel, include:

```markdown
### Panel N -- [Title]

- **Position**: [row, column, spatial name]
- **Callout**: "[the callout phrase]"
- **Key number**: [the featured number with context]
- **Body sentences**:
  - [sentence 1]
  - [sentence 2]
  - [sentence 3, if applicable]
- **Icon**: [description of the chalk-drawn icon]
- **Mini-viz**: [description of the chalk chart/diagram with specific data]
- **Connector to next**: "[transition phrase]"
```

Also include at the end of Section D:

```markdown
### Margin Elements

- **Professor's note**: "[note text]" -- positioned [location], with arrow toward Panel [N]
- **Color legend**: [concept A]: teal, [concept B]: warm orange, [concept C]: chalk white
- **Background formulas**: [formula 1], [formula 2] at 15-20% opacity
```

**Sentence quality rules** (apply to callout phrases and body sentences in Section D):
- Each sentence must be **self-contained** -- readable without surrounding context
- Each sentence must be **infographic-ready** -- short, punchy, quotable
- Include **specific numbers** from the post (percentages, coefficients, sample sizes, bounds)
- Do NOT write vague summaries like "the method performed well"
- Use em dashes (--) not double hyphens
- Do NOT use emojis
- Target: 15-30 words per sentence
- Each panel should have exactly 2-3 body sentences

---

## Step 2 -- Verify

After writing the file:

1. **Read it back** to verify it was written correctly
2. **Check Section A opening**: starts with "Create a 1920x1080 landscape digital chalk illustration..."
3. **Check colors inline**: all 6 hex codes appear as flowing prose in Section A (no markdown tables)
4. **Check spatial positions**: each panel description includes its grid position (row, column)
5. **Check flowing prose**: each panel is a continuous paragraph (no bullet points or tagged metadata in Section A)
6. **Check rendering instructions**: key numbers include size/color/style instructions
7. **Check connector arrows**: chalk arrows with transition phrases described between all adjacent panels
8. **Check specific numbers**: at least 6 panels reference a specific number from the post
9. **Cross-check numbers**: for each number cited, verify it appears in the source post's `index.md`. Flag any that cannot be found.
10. **Check Section B**: negative prompt section exists
11. **Check Section C**: condensed prompt exists and is under 400 words
12. **Check Section D**: panel reference data preserves all callouts, icons, mini-viz, body sentences
13. **Check text rendering**: guidance paragraph matches the user's selected preference from Step 0.5
14. **Check background formulas**: topic-specific formulas cited in the atmosphere paragraph
15. **Check margin elements**: professor's note with spatial position and content; color concept legend with position and entries
16. **Check title banner**: positioned above grid with guiding question in italic
17. **Check Panel 4**: includes a comparison visual (side-by-side bars, intervals, or table)

---

## Quality checklist

**Prompt structure:**
- [ ] Section A starts with medium + style + dimensions opening line
- [ ] All content in Section A is flowing prose (no bullet points, no markdown tables, no tagged metadata)
- [ ] All 6 hex color codes appear inline with their names and roles
- [ ] Spatial positions (row, column) specified for every panel
- [ ] Consistent terminology throughout (panel, border, chalk arrow, chalk dust)

**Title & composition:**
- [ ] Title captures core idea in under 12 words, in steel blue small-caps
- [ ] Guiding question in italic chalk white below the title
- [ ] Composition describes 3x2 grid with connector arrow routing

**Panel descriptions:**
- [ ] Exactly 6 panels, each as a flowing scene paragraph
- [ ] Each panel includes: position, border, number, title, icon, mini-viz, callout, body text, connector
- [ ] Each callout contains a specific number or memorable phrase with warm orange rendering instructions
- [ ] Each icon is concrete and panel-specific (no repeats)
- [ ] Each mini-viz describes a specific chart type with data values from the post (not generic)
- [ ] Panel 4 includes a comparison visual (bars, intervals, or table)
- [ ] Correct panel template selected (Causal / ML / Exploratory)

**Enrichment elements:**
- [ ] Professor's margin note: specific insight, spatial position, arrow toward relevant panel
- [ ] Color concept legend: 2-3 concepts mapped to colors, spatial position
- [ ] Background formulas: topic-specific, described at 15-20% opacity
- [ ] Chalk dust, smudge effects, and atmosphere described

**Sections complete:**
- [ ] Section A: full image generation prompt (flowing prose)
- [ ] Section B: negative prompt
- [ ] Section C: condensed prompt under 400 words
- [ ] Section D: panel reference data with all structured details

**Content quality:**
- [ ] At least 6 body sentences contain specific numbers from the post
- [ ] All cited numbers verified against the source post
- [ ] Sentences are short, punchy, and self-contained (15-30 words)
- [ ] No emojis
- [ ] Em dashes (--) used, not double hyphens
- [ ] File saved as `infographic_instructions.md` in the post's page bundle
