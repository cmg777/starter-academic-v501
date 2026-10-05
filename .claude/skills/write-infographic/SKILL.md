---
name: write-infographic
description: Write a crisp, website-coherent infographic prompt for an existing data science post. Produces a six-panel chalk-inspired storyboard, negative prompt, condensed variant, and source-grounded panel reference data. Writes instructions only; does not generate images or publish.
argument-hint: "<post slug, e.g. python_partial_identification>"
disable-model-invocation: true
user-invocable: true
---

# Write Infographic: Storyboard-First AI Image Prompt

Read an existing blog post on this site and produce an `infographic_instructions.md`
file in the post's page bundle. The file is a **ready-to-paste AI image generation
prompt** for a chalk-inspired infographic telling the post's story in 6
visual beats. Default to crisp lettering, strong contrast, and the website's
near-black navy, blue, and gold palette. User-specified style, palette, format,
and destination override these defaults; preserve scientific color meanings.
This skill writes prompt text only: it does not authorize image generation,
asset conversion, commits, pushes, or deployment.

The skill prioritizes **clear storytelling through simple sketch
metaphors** over precise statistical charts -- Gemini and similar tools draw
metaphorical sketches well but should not be trusted to invent precise data visualizations.

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

Inspect `content/post/python_sc101/featured.webp` as the approved visual reference:
strong blue headings, bright strokes against dark navy, separated panels, clear
callouts, and complete edge labels. Read its `infographic_instructions.md` for
storytelling and source mapping, not as an authoritative palette or layout spec.
Its older colors, dust/smudge effects, and claim that cards crop are superseded
by the defaults below and current site files. `assets/css/orbital-palette.css`
is the color source of truth. The successful sharpening batch is recorded in
commit `6f31cec4a7e7b0b010d62901efedce61efcf03bd`; it is context, not a requirement
to modify images. Other example posts calibrate narrative structure only.

---

## Step 0 -- Pre-flight

1. **Parse arguments.** Extract the post slug from `$ARGUMENTS`.
   - If a full path is given (e.g. `content/post/python_dowhy/`), use it directly.
   - If a slug is given (e.g. `python_dowhy`), resolve to `content/post/<slug>/index.md`.

2. **Verify the post exists.** Read `index.md` in the resolved directory. If it
   does not exist, report the error and stop.

3. **Read the full post.** Read the entire `index.md` to understand the topic,
   case study, methods, key results, and takeaways.

4. **Inspect the reference and current palette.** Use the two Python synthetic
   control reference files above and read `assets/css/orbital-palette.css`.
   For website delivery guidance, inspect `layouts/partials/orbital-card.html`
   and `.card-image` rules in `assets/css/orbital.css` for actual card size and
   image fitting. Do not copy stale crop claims from example instructions.

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

   Aim to tell the main story across 6 panels, with 0-1 short MARGIN note
   if space permits. Keep supporting detail in REFERENCE.

   Use simple panels by default. **≥6 ON-IMAGE messages permits layered
   panels only if they still meet the hierarchy and text budget in A5.**
   Move lower-priority material to REFERENCE rather than shrinking lettering.
   The python_mgwrfer post
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
   rendered large in website gold (#e9c184) by default. Pick the most impactful: a key
   coefficient, a percentage improvement, a sample size, a bound width.

9. **Identify 3 contextual numbers.** Record them with units and source locations
   in Section D. Include a short sketch label only if it fits the A5 text budget;
   do not turn every useful number into tiny on-image text.

10. **Select the panel template.** Read `references/panel-templates.md`. Choose
    Causal Inference, ML/Prediction, or Exploratory/Descriptive based on the post's
    tags and content. Map each panel to a dramatic function (Hook, Stakes, First
    attempt, Twist, Surprise, Resolution).

11. **Select central sketches.** Read `references/visual-metaphor-vocabulary.md`.
    For each panel, choose ONE metaphor from the suggested categories. Ensure no
    two panels use the same metaphor. Panel 4 must use a Comparison metaphor.

---

## Step 0.5 -- User Confirmation

Before drafting, present the summary below for confirmation unless the user
already approved the scope or asked you to proceed with defaults. Honor that
authorization without asking again. This confirms prompt content only. If input
is needed, wait for a response; silence is not approval.

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
   buckets from Step 0.6 so the user can re-categorise any message. Explain
   any layered panels and which details stay in Section D to keep the image clear.

5. **3 BIG numbers**: The gold callouts (e.g., "32% tighter", "11.2 pp bias", "Width: 1.0").

6. **Target AI tool**: "Which tool will you use? [Gemini / DALL-E 3 / Midjourney / Ideogram / Other]."

7. **Two-pass note**: "Section A generates the base image (sketches + key text). Section D provides all body text for manual overlay in an image editor."

**Handling responses:**
- "Looks good" / "proceed" / explicit no changes: continue with defaults
- Specific adjustments: incorporate them and proceed
- Major changes requested: revise the draft and re-present the summary

---

## Step 1 -- Generate the prompt file

Write `infographic_instructions.md` in the post's page bundle directory
(e.g. `content/post/<slug>/infographic_instructions.md`), unless the user specifies
a different destination, such as an isolated scratch location for a dry run.

The file has four sections (A, B, C, D). Use `---` horizontal rules to
separate them. Use `##` headers to label each section.

---

### Section A: Full Image Generation Prompt

This is the main deliverable -- a flowing prose prompt the user copies into
an AI image generation tool. Target: **800-1,000 words total** for Section A.
Structure it as follows:

#### A1. Opening line

Use this default, adapting it for an explicit user override:

```
Create a 1920x1080 landscape academic infographic on a near-black navy
background (#050a12), with crisp chalk-inspired illustrations, bold clean
lettering, and restrained blue and gold accents. Keep strokes solid and
sharp; any hand-drawn character must not break letterforms or soften edges.
```

#### A2. Composition paragraph

Describe the full layout in one paragraph. Include:
- Title banner centered above 6 panels in a 3-column x 2-row grid
- Deep navy panels (#0a121d) with clear, restrained blue borders (#88b9de)
- Small gold panel numbers; sharp arrows connecting 1→2→3, then routed through
  the inter-row gutter from the right of Panel 3 to the left of Panel 4, then
  4→5→6 (not a vertical arrow pointing to Panel 6)
- At least **5% clear outer margin on every edge** (96 px horizontally and
  54 px vertically at 1920x1080), with all labels, notes, arrowheads, and borders
  inside it; generous gutters and internal padding; no clipping or edge bleed
- Current tutorial cards show the complete image with `object-fit: contain`.
  Keep safe margins regardless of image fitting; never request a crop to fill.

Specify a hierarchy that survives downsampling: short dominant title, three
large numeric anchors, simple recognizable silhouettes, then panel headings
and secondary annotations. At 1920x1080, aim for a title around 90–110 px and
numeric anchors around 64–80 px, adjusting layout rather than squeezing type.
Review the planned hierarchy at the actual homepage card width (currently about
380 CSS px desktop and viewport minus 40 px on mobile; also consider 280 px).
The title and main visual/number anchors should remain identifiable. Panel detail,
notes, and paragraphs are for the full-size view; do not promise that they will
all be readable in a tiny thumbnail. Shorten or move text to Section D if crowded.

#### A3. Color system paragraph

Use current tokens from `assets/css/orbital-palette.css`. Describe the selected
colors as prose with names, hex codes, and post-specific roles:

| Role | Default | Hex |
|------|---------|-----|
| Background | Near-black navy | `#050a12` |
| Panel fill | Deep navy | `#0a121d` |
| Primary lettering / outlines | Bright off-white | `#edf2f6` |
| Headings / structural accents | Website blue | `#88b9de` |
| Key numbers / selective emphasis | Website gold | `#e9c184` |
| Secondary annotations | Cool gray | `#9baaba` |
| Nonessential separators only | Dark border | `#22303e` |

Use off-white, blue, or gold at full opacity for essential text on navy. Gray
is for secondary text; the dark border token is never text or a critical line.
Keep blue and gold selective: no rainbow decoration, global oversaturation,
colored wash, glow, or gradient behind labels. Aim for text/background contrast
of at least 4.5:1 for normal lettering and 3:1 for large lettering; use a solid
backing if a label crosses an illustration. Do not reduce text opacity.

**Scientific color meaning takes precedence over branding.** Retain established
series/category colors, diverging sign/zero scales, sequential map scales, risk
colors, and legends from source figures. Add labels, line styles, or hatching
so meaning does not rely on hue alone. Do not automatically color a positive
coefficient as a good outcome. Apply website colors to the surrounding artwork;
do not recolor scientific evidence merely to match. If an exact chart/map is
needed, specify reuse or a verified data-driven overlay, not an invented sketch
with authoritative-looking values. Record any user palette override in Section D.

#### A4. Title banner paragraph

Describe the title banner positioned at the top center, above the panel grid:
- Title text in large bold website blue lettering with clean, open letterforms
- Guiding question in smaller off-white italic below the title

**Title rules:**
- Capture the core idea in under 12 words; prefer 4-8 for thumbnail recognition
- Frame it as what the reader will learn, not what the post does

**Guiding question rules:**
- Must be a genuine question the reader would ask
- Should create curiosity and motivate reading the panels

#### A5. Panel descriptions (1 through 6) -- STORYBOARD FORMAT

Each panel is described as a **focused scene** in **40-90 words**,
depending on the content density of the post (see the message inventory
in Step 0.6). Two density modes:

- **Simple panel (40-60 words)**: 3-4 baseline elements. Use by default,
  including dense posts whose extra detail can stay in Section D. Calibration example:
  `python_partial_identification`.
- **Layered panel (60-90 words)**: baseline elements PLUS up to 3
  supporting sub-elements. Consider only when the message inventory has ≥6
  ON-IMAGE entries and these fit without reducing text size or safe margins. Calibration example: `python_mgwrfer`.

**Baseline elements (every panel):**

1. **Panel title** -- website blue small-caps, 3-5 words.
2. **Central sketch** -- ONE *primary* metaphorical illustration
   described in 1-2 sentences. Choose from
   `references/visual-metaphor-vocabulary.md`. This is the hero
   visual -- large, clear, simple.
3. **Callout** -- gold, under 8 words. Exactly 3 of 6 panels
   must contain a BIG number. The other 3 use memorable phrases.
4. **Connector arrow** -- "Chalk arrow to Panel N" (visual only, no
   text on arrow); omit the outgoing connector for Panel 6.

**Optional sub-elements for layered panels (up to 3 of these per
panel, only when justified by the message inventory):**

- **Sub-sketch**: a small additional chalk illustration alongside
  the primary metaphor — e.g., a chalk-tally next to a metaphor, a
  split-scene composition with a vertical chalk divider, or a
  three-grid mini-comparison.
- **Sub-equation in chalk**: a one-line formula written *inside*
  the panel border (e.g., `β̂_k = β_k + δ_k`, `ỹ_it = y_it − ȳ_i`,
  `α̂_i = ȳ_i − Σ_k β̂_k x̄_k`). Distinct from the
  optional decorative layer — meaningful sub-equations use full opacity and
  a clear backing, in-panel.
- **Sub-tag inside the panel padding**: a small website-blue small-caps
  tag for stage-bifurcated algorithms (e.g., "STAGE 1", "STAGE 2")
  or named sections of the workflow.
- **Comparison annotation**: one short label explaining the comparison;
  use a shared legend for series names instead of repeating labels on each object.

**Text budget:** Default to a title, one callout, and at most one short
annotation per panel, excluding the panel numeral. Sub-tags and equations
count as annotations. Move extra labels to Section D before shrinking text.

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
Panel 1 (top-left): Title "THE HIDDEN CONFOUNDER" in website blue
small-caps. A large chalk-drawn magnifying glass hovers over a stick
figure, with a bold question mark where the confounder should be --
the glass reveals nothing. Callout: "Credible uncertainty over
incredible certainty" in gold. Chalk arrow to Panel 2.
```

#### A6. Margin elements paragraph

Margin content is optional and must stay inside the 5% outer safe area. Include
one short, source-grounded note only when it qualifies the visible claim and
fits comfortably below the grid. Use a compact 2-4-entry legend if semantic
colors need explanation. Omit a right-margin sidebar by default; keep multi-entry
reference lists in Section D. Never shrink the six panels to make room for
optional notes. List full notes and omitted legends in Section D for the large
version or a separate caption, not as required thumbnail text.

#### A7. Texture and atmosphere paragraph

Keep the navy ground quiet and nearly flat. Optional fine chalk texture belongs
inside broad sketch strokes or empty outer background only. No floating dust,
erasure haze, blur, glow, or smudges on lettering, numbers, borders, or charts.
Omit decorative background formulas by default. If requested, use a few verified
topic-specific fragments very faintly in empty gaps, never behind text or as
substitutes for explanatory content. Meaningful equations belong at full contrast
in a panel or in Section D; scientific maps may retain meaningful color gradients.

#### A8. Two-pass rendering note

Add a paragraph tailored to the exact content selected above:

```
This is the base-image prompt. Render the title, six panel headings and
sketches, three large gold numeric callouts, and three short phrase callouts.
Render only explicitly specified short annotations or essential legends.
Keep all lettering sharp and solid. Longer explanations and transitions
stay in Section D for optional full-size overlay or a separate caption;
do not pack them into the thumbnail. Copy signs, decimals, units, and
labels exactly. Any uncertain glyphs need manual typesetting before use.
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
- **Source in the post**: [section, table, figure, or equation supporting this claim and its numbers]
- **Transition to next**: "[narrative transition phrase, or none for Panel 6]"
```

Also include at the end of Section D:

```markdown
### Story Spine

> [The one-sentence Story Spine from Step 0]

### Margin Elements

- **Notes**: [full text, source, and whether rendered or reference-only]
- **Color legend** (if needed): [concept]: [source semantic color and redundant label/line style]
- **Background formulas**: none by default; if requested, [fragments, sources, placement]
- **User overrides**: [style/palette/format choices, or none]
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

Add a short **Delivery and size checks** subsection to Section D for later use:
- Recommend a native 16:9 master at 1920x1080 or larger; 1280x720 is the minimum.
  Do not upscale a small compressed thumbnail as a substitute for a sharp master.
- For a website image, recommend `featured.webp`; start near quality 90 and compare
  at full size and actual card size. Reduce bytes only while thin strokes, labels,
  and color boundaries stay clean; consider lossless WebP if lossy text artifacts
  persist. No arbitrary file-size target takes priority over legibility.
- State the inspected card sizes/fitting and keep the complete composition visible.
  A future authorized renderer should check about 380 px and 280 px wide previews
  for title/anchor recognition, clean colors, and unclipped edge content, plus a
  full-size check for exact labels. Prompt-only work cannot certify rendered quality.
- These are delivery instructions, not permission to render, convert, replace an
  image, commit, or publish. No image generation is part of this skill.

**Sentence quality rules** (apply to callout phrases and body sentences in Section D):
- Each sentence must be **self-contained** -- readable without surrounding context
- Each sentence must be **infographic-ready** -- short, punchy, quotable
- Include **specific numbers** from the post (percentages, coefficients, sample sizes, bounds)
- Do NOT write vague summaries like "the method performed well"
- Use em dashes (—) not double hyphens
- Do NOT use emojis
- Target: 15-30 words per sentence
- **Body-sentence count: 2-3 per panel by default; expand to 4-6 only
  when useful reference detail warrants it, independently of image density.**
  Every panel cites a source location, including conceptual panels. Preserve
  units, signs, time windows, estimands, uncertainty, and the source's causal
  limits; do not turn an association or a sensitivity check into proof.

---

## Step 2 -- Verify

After writing the file:

1. **Read it back** to verify it was written correctly
2. **Check Story Spine**: exists in Section D and captures the narrative arc
3. **Check style and palette**: crisp default opening and current website colors (or documented user override); semantic scientific colors retained
4. **Check Section A length**: under 1,200 words for simple posts; up to 1,300 words for content-dense posts with layered panels
5. **Check panel descriptions**: each panel is 40-90 words (40-60 for simple panels, 60-90 for layered panels)
6. **Check central sketches**: all 6 have ONE primary metaphorical illustration (not a precise chart), no two panels reuse the same primary metaphor
7. **Check layered-panel justification**: ≥6 ON-IMAGE messages plus sufficient space within the text budget; otherwise simplify and move detail to Section D
8. **Check BIG numbers**: exactly 3 panels have a specific number in their gold callout
9. **Check narrative arc**: panels follow Hook -> Stakes -> Attempt -> Twist -> Surprise -> Resolution
10. **Check no body text in Section A**: body sentences appear only in Section D
11. **Check Section B**: negative prompt section exists
12. **Check Section C**: condensed prompt exists and is under 250 words
13. **Check Section D**: all panels have dramatic function, story beat, callout, body sentences (2-3 by default, up to 6 when useful), transition phrase
14. **Cross-check claims and numbers**: verify each against the source post and record its location in Section D. Preserve signs, units, precision, time windows, and caveats; explain any rounding. Flag unsupported claims rather than inventing them.
15. **Check texture**: no blur, dusty text, smudge haze, glow, or decorative formulas behind content
16. **Check margins and size hierarchy**: ≥5% on all edges, no crowded labels, optional notes fit, full-size versus thumbnail expectations explicit
17. **Check title banner**: positioned above grid with guiding question in italic
18. **Check Panel 4**: uses a Comparison metaphor (balance scale, side-by-side objects, etc.)
19. **Check Reference Subsections (if used)**: each maps to at least one panel; no duplication with body sentences
20. **Check message inventory in Section D appendix**: list which messages went ON-IMAGE / MARGIN / REFERENCE, so the reviewer can compare what was promised vs delivered
21. **Check Sections B/C agree with A**: same palette, sharpness, safe margins, semantic exceptions, and text budget; no legacy defaults reintroduced
22. **Check delivery guidance**: native resolution, optimized WebP, real card-size review, and prompt-only scope stated; no claim of visual QA without rendering

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
- [ ] Selected current palette tokens appear with roles; scientific semantic colors and user overrides are preserved
- [ ] Spatial positions (row, column) specified for every panel

**Message inventory (Step 0.6):**
- [ ] Main messages from the source post listed and tagged ON-IMAGE / MARGIN / REFERENCE
- [ ] Simple density by default; layered panels justified by both content and available space
- [ ] Inventory documented in Section D appendix or comment header

**Panel descriptions (Section A):**
- [ ] Exactly 6 panels, each 40-90 words (40-60 for simple panels, 60-90 for layered panels)
- [ ] Every panel has title, central sketch, callout; Panels 1-5 have an outgoing connector
- [ ] Layered panels may add up to 3 sub-elements (sub-sketch, sub-equation, sub-tag, multi-label)
- [ ] NO body text in Section A, NO precise-chart mini-viz with axis ticks, NO transition text on arrows
- [ ] Each central sketch's primary metaphor is illustrative (not a precise chart)
- [ ] No two panels reuse the same primary metaphor
- [ ] Panel 4 uses a Comparison metaphor
- [ ] Exactly 3 callouts contain a BIG number; 3 use memorable phrases
- [ ] If any panel is layered, the message inventory has ≥6 ON-IMAGE entries

**Clarity and optional enrichment:**
- [ ] Main title and numeric anchors dominate at card size; paragraphs reserved for full size
- [ ] Essential text uses solid high-contrast strokes, with no haze or background interference
- [ ] All content stays within 5% safe margins; gutters and panel padding stay clear
- [ ] Optional notes/legends fit without shrinking the panels; background formulas omitted by default
- [ ] Two-pass rendering note matches exactly what Section A asks to render

**Sections complete:**
- [ ] Section A: storyboard image prompt (flowing prose, ≤1,200 words for simple, ≤1,300 for content-dense)
- [ ] Section B: negative prompt
- [ ] Section C: condensed prompt under 250 words
- [ ] Section D: panel reference data with body sentences, transitions, story beats
- [ ] Optional Reference Subsections only when content density warrants (Tracked Models, Three Concepts, Key Equations)

**Content quality (Section D):**
- [ ] Each panel has 2-6 body sentences with source-specific detail and relevant numbers
- [ ] Every panel cites a supporting source location; units, estimands, and caveats preserved
- [ ] All cited numbers verified against the source post
- [ ] Sentences are short, punchy, and self-contained (15-30 words)
- [ ] No emojis
- [ ] Em dashes (—) used, not double hyphens
- [ ] File saved in the requested destination (post bundle by default); no images or publishing actions performed

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
