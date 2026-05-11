---
name: write-infographic
description: Generate a chalkboard infographic prompt for a blog post -- use after publishing a data science post to create a visual storyboard. Produces a copy-pasteable AI image prompt (Gemini, DALL-E, Midjourney, Ideogram) with 6 story-beat panels, negative prompt, condensed variant, and panel reference data. Confirms Story Spine, story beats, and key numbers before generating.
argument-hint: "<post slug, e.g. python_partial_identification>"
disable-model-invocation: true
user-invocable: true
---

# Write Infographic: Storyboard-First AI Image Prompt

Read an existing blog post on this site and produce an `infographic_instructions.md`
file in the post's page bundle. The file is a **ready-to-paste AI image generation
prompt** that creates a chalkboard-style infographic telling the post's story in 6
visual beats. The skill prioritizes **clear storytelling through simple sketch
metaphors** over precise statistical charts -- Gemini and similar tools draw
metaphorical sketches well but cannot render precise data visualizations.

The output contains four sections: (A) a lean flowing-prose prompt (~800-1,000
words) with scene description, composition, color system, and 6 focused panel
scenes; (B) a negative prompt; (C) a condensed ~200-word prompt for token-limited
tools; and (D) a structured panel reference data appendix with full text for
manual overlay.

## Example invocations

```
/project:write-infographic python_partial_identification
/project:write-infographic python_dowhy
/project:write-infographic python_doubleml
/project:write-infographic python_ml_random_forest
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

5. **Write the Story Spine.** Articulate the post's narrative arc in one sentence:

   > "[Subject/method] reveals that [key insight] by showing [evidence],
   > challenging the assumption that [conventional wisdom]."

6. **Inventory the post's main messages.** Read `index.md` and list 4-10
   main messages — each one a single-sentence claim the post wants the
   reader to walk away with. Tag each message:

   - **ON-IMAGE**: the message becomes a panel callout, sub-sketch,
     central metaphor, or background formula in Section A. These are
     the most visually prominent.
   - **MARGIN**: the message appears in a professor's note, colour
     legend, or right-margin sidebar — visible but secondary.
   - **REFERENCE**: the message appears only in Section D body
     sentences or Reference Subsections, for manual overlay.

   Target distribution: 5-7 ON-IMAGE messages (filling 6 panels plus
   margin), 1-3 MARGIN, the rest REFERENCE.

   The message count drives the panel-density decision (see Section A5
   below): **if ≥6 ON-IMAGE messages, use layered panels; if ≤4,
   stick to the simple-storyboard defaults**. The python_mgwrfer post
   is the layered-panel calibration example (8 ON-IMAGE messages,
   layered scenes, two professor's notes, right-margin sidebar). The
   python_partial_identification post is the simple-storyboard
   calibration example (4 ON-IMAGE messages, single-metaphor panels).

7. **Draft 6 story beats.** Write one phrase per panel that forms a
   beginning-middle-end arc. The beats should read like a story when spoken aloud.

   Example: "What if key confounders are hidden?" -- "1,000 workers, one unmeasured
   variable" -- "Manski bounds span the full range" -- "Entropy cuts the range by
   32%" -- "More data doesn't help at all" -- "Honest uncertainty beats false certainty"

8. **Identify 3 BIG numbers.** These are the anchor points the viewer remembers --
   rendered large in warm orange (#e8956a). Pick the most impactful: a key
   coefficient, a percentage improvement, a sample size, a bound width.

9. **Identify 3 contextual numbers.** These appear as small annotation labels on
   sketches (e.g., "N = 1,000" next to tally marks). Less prominent but grounding.

10. **Select the panel template.** Read `references/panel-templates.md`. Choose
    Causal Inference, ML/Prediction, or Exploratory/Descriptive based on the post's
    tags and content. Map each panel to a dramatic function (Hook, Stakes, First
    attempt, Twist, Surprise, Resolution).

11. **Select central sketches.** Read `references/visual-metaphor-vocabulary.md`.
    For each panel, choose ONE metaphor from the suggested categories. Ensure no
    two panels use the same metaphor. Panel 4 must use a Comparison metaphor.

---

## Step 0.5 -- User Confirmation

Before generating, present the user with a confirmation summary and wait for
their response. Display all items in a single formatted block:

1. **Story Spine**: The one-sentence narrative arc.

2. **Template selected**: "[Causal Inference / ML-Prediction / Exploratory-Descriptive] -- based on [brief reasoning]. Change?"

3. **Six story beats**: A compact 6-row summary:

   ```
   Panel 1 (Hook):      [beat phrase] -- sketch: [metaphor]
   Panel 2 (Stakes):    [beat phrase] -- sketch: [metaphor]
   Panel 3 (Attempt):   [beat phrase] -- sketch: [metaphor]
   Panel 4 (Twist):     [beat phrase] -- sketch: [comparison metaphor]
   Panel 5 (Surprise):  [beat phrase] -- sketch: [metaphor]
   Panel 6 (Resolution):[beat phrase] -- sketch: [metaphor]
   ```

4. **Main-message inventory**: list the ON-IMAGE / MARGIN / REFERENCE
   buckets from Step 0.6 so the user can re-categorise any message
   before drafting. If the ON-IMAGE bucket has ≥6 messages, flag that
   panel scenes will be **layered** (multi-element) and Section D
   body sentences will be expanded from the 2-3 default to 4-6 per
   panel. If 4 or fewer, confirm the simple-storyboard format.

5. **3 BIG numbers**: The warm orange callouts (e.g., "32% tighter", "11.2 pp bias", "Width: 1.0").

6. **Target AI tool**: "Which tool will you use? [Gemini / DALL-E 3 / Midjourney / Ideogram / Other]."

7. **Two-pass note**: "Section A generates the base image (sketches + key text). Section D provides all body text for manual overlay in an image editor."

**Handling responses:**
- "Looks good" / "proceed" / no changes: continue with defaults
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
an AI image generation tool. Target: **800-1,000 words total** for Section A.
Structure it as follows:

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
- Connector arrows: simple chalk arrows with dust particles connecting panels in reading order (1->2->3 across top row, vertical arrow from 3 down to 4, then 4->5->6 across bottom row)
- Generous dark space between panels -- the navy background is a design element

#### A3. Color system paragraph

Describe all 6 colors as flowing prose (NOT a table). Each color gets its name,
hex code, and role.

The 6 colors (always the same):

| Role | Color | Hex |
|------|-------|-----|
| Background | Navy blue | `#0e1545` |
| Body text / outlines | Chalk white | `#f0ece2` |
| Panel titles / headers | Steel blue (bright) | `#8bb8e0` |
| Accents / key numbers | Warm orange | `#e8956a` |
| Call-outs / positive emphasis | Teal | `#00d4c8` |
| Underlines / secondary accents | Muted chalk gray | `#b0a89a` |

In the output, render as prose with post-specific color usage examples.

#### A4. Title banner paragraph

Describe the title banner positioned at the top center, above the panel grid:
- Title text in large steel blue chalk small-caps
- Guiding question in smaller chalk-white italic below the title

**Title rules:**
- Capture the core idea in under 12 words
- Frame it as what the reader will learn, not what the post does

**Guiding question rules:**
- Must be a genuine question the reader would ask
- Should create curiosity and motivate reading the panels

#### A5. Panel descriptions (1 through 6) -- STORYBOARD FORMAT

Each panel is described as a **focused scene** in **40-90 words**,
depending on the content density of the post (see the message inventory
in Step 0.6). Two density modes:

- **Simple panel (40-60 words)**: 3-4 baseline elements. Use for posts
  with ≤5 ON-IMAGE messages. Calibration example:
  `python_partial_identification`.
- **Layered panel (60-90 words)**: baseline elements PLUS up to 3
  supporting sub-elements. Use only when the message inventory has ≥6
  ON-IMAGE entries. Calibration example: `python_mgwrfer`.

**Baseline elements (every panel):**

1. **Panel title** -- steel blue small-caps, 3-5 words.
2. **Central sketch** -- ONE *primary* metaphorical illustration
   described in 1-2 sentences. Choose from
   `references/visual-metaphor-vocabulary.md`. This is the hero
   visual -- large, clear, simple.
3. **Callout** -- warm orange, under 8 words. Exactly 3 of 6 panels
   must contain a BIG number. The other 3 use memorable phrases.
4. **Connector arrow** -- "Chalk arrow to Panel N" (visual only, no
   text on arrow).

**Optional sub-elements for layered panels (up to 3 of these per
panel, only when justified by the message inventory):**

- **Sub-sketch**: a small additional chalk illustration alongside
  the primary metaphor — e.g., a chalk-tally next to a metaphor, a
  split-scene composition with a vertical chalk divider, or a
  three-grid mini-comparison.
- **Sub-equation in chalk**: a one-line formula written *inside*
  the panel border (e.g., `β̂_k = β_k + δ_k`, `ỹ_it = y_it − ȳ_i`,
  `α̂_i = ȳ_i − Σ_k β̂_k x̄_k`). Distinct from the
  background-formula layer at 15-20% opacity — sub-equations sit at
  ~80% opacity, in-panel.
- **Sub-tag above the panel border**: a small steel-blue small-caps
  tag for stage-bifurcated algorithms (e.g., "STAGE 1", "STAGE 2")
  or named sections of the workflow.
- **Multiple annotation labels** (2-3 per sketch): allowed when the
  panel encodes more than one named quantity (e.g., labelling
  "true sc_i" and "MGWFER α̂_i" on a side-by-side fingerprints
  metaphor).

**What NOT to include in panel descriptions (still hard rules):**

- Body sentences or full explanatory paragraphs (these go in Section D).
- Precise statistical charts with exact numeric axis ticks or
  gridlines. Chalk-tally, stripe-hatching, and uneven hand-drawn
  grids are allowed; tick-marked bar charts and scatterplots are not.
- Transition phrases on connector arrows (these go in Section D).
- More than 3 sub-elements per panel — layered does not mean
  cluttered.

**Spatial position mapping (3x2 grid):**

```
Row 1: Panel 1 (top-left)    | Panel 2 (top-center)    | Panel 3 (top-right)
Row 2: Panel 4 (bottom-left) | Panel 5 (bottom-center) | Panel 6 (bottom-right)
```

**Example panel (new format):**

```
Panel 1 (top-left): Title "THE HIDDEN CONFOUNDER" in steel blue
small-caps. A large chalk-drawn magnifying glass hovers over a stick
figure, with a bold question mark where the confounder should be --
the glass reveals nothing. Callout: "Credible uncertainty over
incredible certainty" in warm orange. Chalk arrow to Panel 2.
```

#### A6. Margin elements paragraph

After all 6 panels, describe the elements outside the panel grid. Three
margin elements are available; use them as the post's content density
warrants.

**Professor's margin notes (1-2):**
- Position: bottom-right margin, outside the panel grid. For two notes,
  stack them vertically and aim them at different panels.
- Style: smaller italic chalk text, each with its own hand-drawn arrow
  pointing toward the relevant panel.
- Content: specific, memorable insights from the post -- the kind of
  thing a professor would scribble in a student's paper margin. NOT
  generic statements.
- Default: one note for simple posts. For content-dense posts (≥6
  ON-IMAGE messages), write two notes that elaborate different parts
  of the story.

**Color concept legend (2-4 entries):**
- Position: bottom-left margin, outside the panel grid.
- Style: small chalk text with colored dots.
- Content: recurring concepts mapped to consistent colors. Default 2-3
  entries; up to 4 for content-dense posts that distinguish e.g.
  confounder / covariate / slope / recovery.

**Right-margin sidebar (optional, content-dense posts only):**
- Position: right margin, running vertically the full height of the
  panel grid.
- Style: small chalk text in muted gray (#b0a89a), with a title in the
  same colour. Two columns of entries are typical; tick marks (or
  similar small symbols) flag the "winners" — the methods, models, or
  options the post recommends.
- Content: a compact reference list of multi-entry tracked quantities
  (e.g., a six-estimator legend "OLS_cs / OLS_pool / FE ✓ /
  MGWR_cs / PMGWR / MGWFER ✓" with a note "ticks = recovers truth").
- Use only when the post tracks ≥4 named entities of the same kind.
  Skip for posts that compare just two or three options — there a
  Panel 4 Comparison metaphor is enough.

#### A7. Texture and atmosphere paragraph

Describe the atmospheric details:
- Chalk dust particles floating near text edges and panel borders
- Subtle smudge marks where chalk has been partially erased
- Faint chalk-drawn equations and formula fragments visible behind the
  panels at 15-20% opacity in muted gray (#b0a89a). Provide **3-6
  topic-specific fragments**: default 3-4 for simple posts, up to 6 for
  content-dense posts with many key equations. Each fragment is one
  short line; include at least one diagrammatic element (e.g., a small
  DAG with three nodes, a vector sketch, a tiny tree-with-arrows).
- The specific formulas must be relevant to the post's topic.
- Topic-specific illustration fragments (stick figures, brackets, arrows) faintly in background gaps.

#### A8. Two-pass rendering note

Add a single paragraph explaining what the AI should render vs what the user
will add manually:

```
This prompt generates the base image. The AI should render clearly: the
title banner, 6 panel titles in steel blue, 6 central sketch illustrations,
3 key numbers in large warm orange chalk, and 3 callout phrases. All other
text -- body sentences, annotations, transition phrases -- is provided in
the panel reference data for the user to overlay manually in an image
editor. Keep text elements minimal and large for legibility.
```

---

### Sections B and C: Negative Prompt and Condensed Prompt

Read `references/static-sections.md` for the negative prompt template
(mostly static, add topic-specific exclusions) and the condensed prompt
structure (telegram-style, under 250 words, for token-limited tools).

---

### Section D: Panel Reference Data (for manual text overlay)

Separated by `---` and labeled `## Panel Reference Data`.

This section is NOT part of the AI prompt -- it is a structured appendix the
user references when overlaying text on the generated image or when iterating
on the prompt. Use markdown formatting (headers, bullets) for readability.

For each panel, include:

```markdown
### Panel N -- [Title]

- **Position**: [row, column, spatial name]
- **Dramatic function**: [Hook / Stakes / Attempt / Twist / Surprise / Resolution]
- **Story beat**: "[the beat phrase from Step 0]"
- **Callout**: "[the callout phrase]"
- **Key number**: [the featured number with context, or N/A]
- **Central sketch**: [description of the metaphor illustration; for
  layered panels, also list sub-sketches, sub-equations, sub-tags]
- **Body sentences** (for manual overlay):
  - [sentence 1]
  - [sentence 2]
  - [sentence 3, if applicable]
  - [optional sentences 4-6 for content-dense posts]
- **Transition to next**: "[narrative transition phrase]"
```

Also include at the end of Section D:

```markdown
### Story Spine

> [The one-sentence Story Spine from Step 0]

### Margin Elements

- **Professor's note 1**: "[note text]" -- positioned [location], with arrow toward Panel [N]
- **Professor's note 2** (optional, content-dense posts): "[note text]" -- positioned [location], arrow toward Panel [N]
- **Color legend** (2-4 entries): [concept A]: teal, [concept B]: warm orange, [concept C]: chalk white
- **Right-margin sidebar** (optional, ≥4 tracked entities): [title] -- [list of entries with tick marks]
- **Background formulas** (3-6 fragments): [formula 1], [formula 2], ... at 15-20% opacity
```

**Optional Reference Subsections (for content-dense posts):** when the
post tracks many entities, add structured subsections to Section D for
the manual-overlay user. Use 0-3 subsections; skip them for simple
posts.

```markdown
### Tracked Models / Tracked Estimators (use when the post compares ≥4 models)

- **[Model name 1]**: one-line summary with the headline number and a
  symbol or checkmark if it is among the recommended methods.
- **[Model name 2]**: ...

### Three Concepts / Three Channels (use when the post hinges on a
named typology of 2-4 categories)

- **[Concept 1]** -- one-sentence definition tied to the post.
- **[Concept 2]** -- ...

### Key Equations on Screen (use when the panels carry sub-equations)

- **[Equation in plain text]** (in-panel and/or background, paper
  Eq./Section X): one-line description of what it means.
- ...
```

**Sentence quality rules** (apply to callout phrases and body sentences in Section D):
- Each sentence must be **self-contained** -- readable without surrounding context
- Each sentence must be **infographic-ready** -- short, punchy, quotable
- Include **specific numbers** from the post (percentages, coefficients, sample sizes, bounds)
- Do NOT write vague summaries like "the method performed well"
- Use em dashes (--) not double hyphens
- Do NOT use emojis
- Target: 15-30 words per sentence
- **Body-sentence count per panel scales with content density: 2-3 for
  simple posts, 4-6 for content-dense posts (≥6 ON-IMAGE messages).**
  For content-dense posts, each panel should cite at least one source
  paper section, equation, table, or figure number.

---

## Step 2 -- Verify

After writing the file:

1. **Read it back** to verify it was written correctly
2. **Check Story Spine**: exists in Section D and captures the narrative arc
3. **Check Section A opening**: starts with "Create a 1920x1080 landscape digital chalk illustration..."
4. **Check Section A length**: under 1,200 words for simple posts; up to 1,300 words for content-dense posts with layered panels
5. **Check panel descriptions**: each panel is 40-90 words (40-60 for simple panels, 60-90 for layered panels)
6. **Check central sketches**: all 6 have ONE primary metaphorical illustration (not a precise chart), no two panels reuse the same primary metaphor
7. **Check layered-panel justification**: if any panel exceeds 60 words or has sub-elements, the message inventory must have ≥6 ON-IMAGE entries
8. **Check BIG numbers**: exactly 3 panels have a specific number in their warm orange callout
9. **Check narrative arc**: panels follow Hook -> Stakes -> Attempt -> Twist -> Surprise -> Resolution
10. **Check no body text in Section A**: body sentences appear only in Section D
11. **Check Section B**: negative prompt section exists
12. **Check Section C**: condensed prompt exists and is under 250 words
13. **Check Section D**: all panels have dramatic function, story beat, callout, body sentences (2-3 for simple, 4-6 for content-dense), transition phrase
14. **Cross-check numbers**: for each number cited, verify it appears in the source post's `index.md`. Flag any that cannot be found.
15. **Check background formulas**: 3-6 topic-specific formula fragments cited in the atmosphere paragraph
16. **Check margin elements**: 1-2 professor's notes, 2-4-entry colour legend, optional right-margin sidebar for content-dense posts
17. **Check title banner**: positioned above grid with guiding question in italic
18. **Check Panel 4**: uses a Comparison metaphor (balance scale, side-by-side objects, etc.)
19. **Check Reference Subsections (if used)**: each maps to at least one panel; no duplication with body sentences
20. **Check message inventory in Section D appendix**: list which messages went ON-IMAGE / MARGIN / REFERENCE, so the reviewer can compare what was promised vs delivered

---

## Quality checklist

**Storyboard structure:**
- [ ] Story Spine sentence captures the narrative arc
- [ ] Six story beats form a coherent beginning-middle-end arc
- [ ] Dramatic functions assigned: Hook, Stakes, Attempt, Twist, Surprise, Resolution
- [ ] Narrative tension builds through Panels 1-4 and resolves in 5-6

**Prompt structure:**
- [ ] Section A starts with medium + style + dimensions opening line
- [ ] Section A is under 1,200 words total
- [ ] All content in Section A is flowing prose (no bullet points, no markdown tables)
- [ ] All 6 hex color codes appear inline with their names and roles
- [ ] Spatial positions (row, column) specified for every panel

**Message inventory (Step 0.6):**
- [ ] Main messages from the source post listed and tagged ON-IMAGE / MARGIN / REFERENCE
- [ ] Density mode chosen consistently with the inventory (simple if ≤5 ON-IMAGE, layered if ≥6 ON-IMAGE)
- [ ] Inventory documented in Section D appendix or comment header

**Panel descriptions (Section A):**
- [ ] Exactly 6 panels, each 40-90 words (40-60 for simple panels, 60-90 for layered panels)
- [ ] Every panel has at least: title, central sketch, callout, connector
- [ ] Layered panels may add up to 3 sub-elements (sub-sketch, sub-equation, sub-tag, multi-label)
- [ ] NO body text in Section A, NO precise-chart mini-viz with axis ticks, NO transition text on arrows
- [ ] Each central sketch's primary metaphor is illustrative (not a precise chart)
- [ ] No two panels reuse the same primary metaphor
- [ ] Panel 4 uses a Comparison metaphor
- [ ] Exactly 3 callouts contain a BIG number; 3 use memorable phrases
- [ ] If any panel is layered, the message inventory has ≥6 ON-IMAGE entries

**Enrichment elements:**
- [ ] 1-2 professor's margin notes: specific insight(s), spatial position, arrow(s) toward relevant panel(s)
- [ ] Colour concept legend: 2-4 concepts mapped to colours, spatial position
- [ ] Right-margin sidebar (if used): justified by ≥4 tracked entities
- [ ] Background formulas: 3-6 topic-specific fragments at 15-20% opacity
- [ ] Chalk dust, smudge effects, and atmosphere described
- [ ] Two-pass rendering note included

**Sections complete:**
- [ ] Section A: storyboard image prompt (flowing prose, ≤1,200 words for simple, ≤1,300 for content-dense)
- [ ] Section B: negative prompt
- [ ] Section C: condensed prompt under 250 words
- [ ] Section D: panel reference data with body sentences, transitions, story beats
- [ ] Optional Reference Subsections only when content density warrants (Tracked Models, Three Concepts, Key Equations)

**Content quality (Section D):**
- [ ] Each panel has 2-6 body sentences (scaled to density) with specific numbers
- [ ] For content-dense posts, every panel cites at least one source-paper section/equation/table/figure
- [ ] All cited numbers verified against the source post
- [ ] Sentences are short, punchy, and self-contained (15-30 words)
- [ ] No emojis
- [ ] Em dashes (--) used, not double hyphens
- [ ] File saved as `infographic_instructions.md` in the post's page bundle

---

## Step 2.5 -- Follow-up

After verification, offer the user next steps:

"The infographic prompt is ready at `content/post/<slug>/infographic_instructions.md`.
Would you like me to:
- Adjust any story beat or sketch metaphor?
- Change the 3 BIG numbers?
- Regenerate with a different template?
- Create a variant for a different AI tool?
- Run `/project:review-infographic <slug>` to review the prompt quality?"
