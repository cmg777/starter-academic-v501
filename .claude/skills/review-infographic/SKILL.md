---
name: review-infographic
description: Expert review of infographic instructions -- verifies accuracy against the source blog post, evaluates storyboard coherence and sketch quality, and suggests variant improvements. Use after write-infographic to ensure the prompt is accurate and effective. Read-only.
argument-hint: "<post slug, e.g. python_doubleml>"
disable-model-invocation: true
user-invocable: true
---

# Review Infographic: Verify Accuracy, Storyboard Coherence, and Sketch Quality

Single thorough review of an `infographic_instructions.md` file. Cross-checks
every number and claim against the source blog post, evaluates storyboard
structure and prompt quality, and suggests variant improvements. Produces an
inline review report with a verdict.

**What this skill does:**
- Cross-checks every number in the infographic prompt against `index.md`
- Verifies all 4 sections (A, B, C, D) are present and well-formed
- Evaluates Section A for lean flowing prose (≤1,200 words simple; ≤1,300 content-dense)
- Checks all 6 panels for storyboard format (title, central sketch, callout, connector + optional sub-elements)
- Validates Panel 4 uses a Comparison metaphor with teal highlight
- Assesses narrative arc coherence -- do the 6 beats tell a story?
- **Evaluates message coverage** -- does the infographic carry the post's main messages, or is it oversimplified?
- Verifies Story Spine and dramatic functions in Section D
- Verifies correct template alignment (Causal / ML / Exploratory)
- Confirms central sketches are metaphorical (not precise charts)
- Suggests 2-3 variant improvements

**What this skill does NOT do:**
- Does NOT modify `infographic_instructions.md` or any other file
- Does NOT generate images or render the infographic
- Does NOT re-run the write-infographic skill
- Does NOT create new files

---

## Example invocations

```
/project:review-infographic python_doubleml
/project:review-infographic python_dowhy
/project:review-infographic content/post/python_partial_identification/
```

---

## Step 0 -- Pre-flight

1. **Parse arguments.** Extract the post slug or path from `$ARGUMENTS`.
   - If a full path is given (e.g. `content/post/python_dowhy/`), use it directly.
   - If a slug is given (e.g. `python_doubleml`), resolve to `content/post/<slug>/`.

2. **Verify infographic_instructions.md exists.** Check for
   `infographic_instructions.md` in the resolved directory. If it does not
   exist, report the error and stop. Suggest running `write-infographic` first.

3. **Verify index.md exists.** Check for `index.md` in the same directory.
   This is the source blog post against which all accuracy checks are
   performed. If it does not exist, report the error and stop.

4. **Read both files completely** (in parallel):
   - `infographic_instructions.md` -- the infographic prompt under review
   - `index.md` -- the source blog post (ground truth for all numbers and claims)

5. **Read reference files** (in parallel):
   - `references/review-checklist.md` -- seven review dimensions with checklists
   - `references/panel-templates.md` -- narrative arc templates and element rules

---

## Step 0.5 -- Confirm scope

Present a brief confirmation to the user:

1. **Files identified:** "Found `infographic_instructions.md` and `index.md`
   at `content/post/<slug>/`."

2. **Scope:** "Running full review of infographic instructions against source
   post across all 8 dimensions: accuracy, completeness, prompt leanness,
   storyboard format, Panel 4 comparison sketch, narrative arc coherence,
   template alignment, and message coverage."

**Do NOT wait for confirmation.** Proceed directly to the review. This is a
read-only operation with no risk of modification.

---

## Step 1 -- Dimension 1: Accuracy (highest priority)

Every factual claim in the infographic must trace back to the source post.

1. **Extract all numbers** from the infographic instructions -- callouts, body
   text in Section D, any numbers mentioned in Section A prose, and condensed
   prompt in Section C.

2. **Cross-reference each number** against `index.md`. For each:
   - Find the corresponding passage in the source post
   - Verify the number matches exactly (or within stated rounding)
   - Note the location in the infographic and the location in the source post

3. **Verify method names and technical terms.** Every method name, model name,
   dataset name, and technical term in the infographic must match the source
   post exactly. Flag any misspellings, abbreviation mismatches, or renamed
   concepts.

4. **Check panel summaries.** Does each panel accurately represent the content
   of the corresponding section in the source post? Flag any claim in the
   infographic that is not supported by the post.

5. **Check for fabricated numbers.** Any number in the infographic that does
   not appear in the source post or cannot be derived from it is a HIGH
   severity issue.

---

## Step 2 -- Dimension 2: Completeness

1. **All 4 sections present:**
   - Section A -- Lean flowing-prose image generation prompt (≤1,200 words simple posts; ≤1,300 content-dense posts)
   - Section B -- Negative prompt
   - Section C -- Condensed prompt (≤250 words)
   - Section D -- Panel reference data appendix with body sentences for overlay

2. **Section A is flowing prose.** No bullet points, no numbered lists, no
   tables. The entire section reads as continuous paragraphs.

3. **Section A word count.** Count the words in Section A. Flag if over the
   density-appropriate cap: 1,200 for simple posts (≤5 ON-IMAGE messages) or
   1,300 for content-dense posts (≥6 ON-IMAGE messages).

4. **Section B includes standard exclusions** plus topic-specific additions.
   Must include "Do not render precise statistical charts."

5. **Section C word count.** Count the words in Section C. Flag if over 250
   words.

6. **Section D has structured data** for all 6 panels. Each panel entry must
   include: dramatic function, story beat, callout, central sketch description
   (with sub-elements if the panel is layered), body sentences (2-3 for simple
   posts, 4-6 for content-dense posts), and transition phrase. For
   content-dense posts, each panel should cite at least one specific
   source-paper section, equation, table, or figure number.

7. **Story Spine present** in Section D with a one-sentence narrative arc.

8. **Optional Reference Subsections** (Tracked Models, Three Concepts, Key
   Equations on Screen) at the end of Section D are valid for content-dense
   posts that track multiple named entities. Verify each subsection maps to
   at least one panel and does not duplicate body-sentence content.

---

## Step 3 -- Dimension 3: Prompt leanness

Evaluate Section A for effective AI image generation with minimal text:

1. **Flowing prose throughout.** No bullets, no tables, no markdown formatting
   that would confuse an image generation model.

2. **All 6 hex color codes mentioned inline.** The chalkboard palette must
   appear: `#0e1545` (navy), `#f0ece2` (chalk white), `#8bb8e0` (steel blue),
   `#e8956a` (warm orange), `#00d4c8` (teal), `#b0a89a` (muted gray).

3. **Spatial positions specified.** Each panel has a clear position description
   (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right).

4. **Panel descriptions are 40-90 words each** (40-60 for simple panels, 60-90
   for layered panels). Flag panels over 110 words as too dense for the AI to
   render reliably; flag panels under 35 words as too thin to carry their
   message. If panels exceed 60 words, confirm the post is content-dense
   (≥6 ON-IMAGE messages per the writer's inventory).

5. **No body text in Section A.** Body sentences belong only in Section D.
   Flag any explanatory sentences or full-paragraph narratives in panel
   descriptions.

6. **Two-pass rendering note present.** Section A ends with a paragraph
   explaining what the AI renders vs what the user overlays.

7. **No emojis anywhere** in the entire file.

---

## Step 4 -- Dimension 4: Storyboard format

For each of the 6 panels, verify the presence and quality of every required
element:

1. **Panel title.** Steel blue small-caps, 3-5 words, specific to content
   (not generic like "Results" or "Analysis").

2. **Central sketch.** ONE *primary* metaphorical illustration described in
   1-2 sentences. Must be a visual metaphor (magnifying glass, balance scale,
   fork in road) -- NOT a precise statistical chart (bar chart with exact
   numeric axis ticks, scatter plot, number line with gridlines). Flag any
   precise data visualisations. Chalk-tally, stripe-hatching, and uneven
   hand-drawn grids are acceptable substitutes when the post needs to show
   data shape.

3. **Optional sub-elements (layered panels only).** A panel may carry up to
   3 supporting sub-elements: a sub-sketch (e.g., split-scene composition,
   chalk-tally next to the metaphor), a sub-equation in chalk inside the
   panel border (e.g., `β̂_k = β_k + δ_k`), a sub-tag above the panel
   ("STAGE 1" / "STAGE 2"), or 2-3 annotation labels naming specific
   quantities. These are *allowed* only when the writer's message inventory
   justifies them (≥6 ON-IMAGE messages). Flag layered panels on
   simple-message posts as over-engineered.

4. **Callout.** Warm orange, under 8 words. Exactly 3 of 6 panels must
   contain a BIG number; the other 3 use memorable phrases. Flag if all 6
   have numbers (too dense) or if none have numbers (too vague).

5. **Connector arrow.** Visual only in Section A (just "chalk arrow to
   Panel N"). Transition phrases belong in Section D only.

6. **No extra elements beyond the layered-panel allowances.** Flag full
   body sentences (they belong in Section D). Allow up to 3 sub-elements
   and 2-3 annotation labels per sketch when justified by the message
   inventory. Mini-viz with exact numeric axis ticks remain forbidden.

7. **Sketch diversity.** No two panels should use the same *primary*
   metaphor type. Flag repeats (e.g., two magnifying glasses, two forks
   in roads). Sub-sketches may overlap thematically across panels (e.g.,
   a small tree fragment as a sub-sketch in one panel and as the primary
   metaphor in another — flag only if the sub-sketch and primary metaphor
   share the same panel).

---

## Step 5 -- Dimension 5: Panel 4 comparison sketch

Panel 4 typically shows a methods comparison. Verify:

1. **Comparison metaphor present.** Panel 4 uses a Comparison-category
   sketch (balance scale, side-by-side containers, objects of different
   sizes) -- not a precise bar chart.

2. **Best method highlighted in teal** (`#00d4c8`). The winning or
   recommended method should be visually distinguished.

3. **Other methods in chalk white** (`#f0ece2`). Non-preferred methods use
   the neutral chalk color to create contrast.

4. **Comparison is accurate.** The relative ordering in the comparison
   matches the source post's findings.

If the post does not compare multiple methods, note that Panel 4 may serve
a different purpose and evaluate accordingly based on the template.

---

## Step 6 -- Dimension 6: Narrative arc coherence

Evaluate whether the 6 panels tell a coherent story:

1. **Story Spine present.** Section D includes a one-sentence Story Spine
   that captures the post's narrative arc.

2. **Dramatic functions assigned.** Each panel has a dramatic function
   (Hook, Stakes, Attempt, Twist, Surprise, Resolution) that matches its
   position in the narrative arc.

3. **Story beats form an arc.** Reading just the 6 story beats should
   produce a mini-narrative with beginning (tension), middle (action), and
   end (resolution). Flag if beats are disconnected or redundant.

4. **Panel 6 answers the guiding question.** The title banner poses a
   question. Panel 6 should provide the answer or key takeaway. Flag if
   Panel 6 is generic or disconnected from the opening question.

5. **Transition phrases drive narrative.** The transition phrases in
   Section D should use dramatic moves (Escalation, Complication, Turn,
   Resolution) -- not generic connectors ("next", "then").

6. **No redundant panels.** Each panel contributes unique information.
   Flag if two panels cover essentially the same content.

---

## Step 7 -- Dimension 7: Template alignment

1. **Correct template selected.** Based on the source post's topic and tags:
   - Causal Inference template: posts with causal methods (DML, DoWhy, IV,
     RCT, partial identification, DiD, etc.)
   - ML / Prediction template: posts focused on prediction, classification,
     model performance (random forest, XGBoost, etc.)
   - Exploratory / Descriptive template: posts focused on data patterns,
     spatial analysis, descriptive statistics (ESDA, LISA, etc.)

2. **Panel purposes match template specification.** Compare each panel's
   actual purpose against the template's prescribed purpose and dramatic
   function. Flag any panel that is off-topic or tangential.

3. **No mismatched template.** If the infographic uses a Causal template but
   the post is about exploratory analysis (or vice versa), flag as HIGH.

---

## Step 8 -- Dimension 8: Message coverage

This is the most important dimension when source posts are content-dense.
The previous seven dimensions can all pass while the infographic still
fails to carry the post's substance — that produces an "oversimplified"
storyboard. This dimension catches it.

1. **Extract main messages from the source post.** Read `index.md` and
   list 4-10 single-sentence claims the post wants readers to walk away
   with. Look for: numbered key takeaways, paper-section replications,
   named typologies or frameworks, headline figures with specific
   findings, and the central conceptual contribution.

2. **Map each main message to the infographic.** For each message,
   locate where (if anywhere) it appears:
   - Panel scene in Section A (most prominent placement).
   - Margin element (professor's note, sidebar) in Section A.
   - Background formula at 15-20% opacity.
   - Body sentence in Section D.
   - Reference Subsection in Section D (Tracked Models, Three Concepts,
     Key Equations).
   - **Missing** entirely from the infographic.

3. **Score message coverage:**
   - **FULL** — every headline message has at least a Section D
     mention; the central conceptual contribution is on-image (panel
     or margin).
   - **PARTIAL** — 1-2 headline messages missing entirely. Treat as a
     MEDIUM issue.
   - **OVERSIMPLIFIED** — 3+ headline messages missing, or the post's
     central conceptual contribution is absent from the infographic.
     Treat as a HIGH issue.

4. **Flag oversimplification on content-dense posts.** If the source
   post has ≥6 main messages (a content-dense post) and the
   infographic uses only simple panels (≤60 words each) with a thin
   Section D (only 2-3 body sentences per panel), flag as MEDIUM
   under this dimension even if every present number is accurate
   and every other dimension passes.

5. **Check writer's message-inventory documentation.** If Section D
   includes a message inventory (ON-IMAGE / MARGIN / REFERENCE tags),
   compare what the writer promised vs delivered. Flag any
   ON-IMAGE-tagged messages that did not actually make it onto a panel.

---

## Step 9 -- Produce review report

Deliver the review **inline in the conversation** using the format below.

### Severity definitions

| Level | Meaning |
| --- | --- |
| **HIGH** | Numbers do not match source post, missing sections (A/B/C/D), fabricated claims, wrong template, precise charts instead of sketches, **post's central conceptual contribution is missing from the infographic**, or 3+ headline messages missing. Must fix before using the prompt. |
| **MEDIUM** | Generic descriptions, missing panel elements, vague callouts, too many text elements per panel, Section A over the density-appropriate cap, 1-2 headline messages missing, **or content-dense post (≥6 main messages) uses only simple panels producing an oversimplified storyboard**. Should fix. |
| **LOW** | Style preferences, minor wording improvements, alternative suggestions, layered-panel sub-elements on a simple post. Nice to fix. |

### Report structure

```
# Infographic Review: <slug>

**Infographic:** `infographic_instructions.md`
**Source post:** `index.md`
**Reviewed:** <date>

## Verdict: <ACCEPT / MINOR REVISION / MAJOR REVISION>

<1-2 sentence summary of the verdict rationale.>

## Accuracy Check

<List each number verified. For each, state: the number, its location in
the infographic, its location in the source post, and match status
(MATCH / MISMATCH / NOT FOUND IN SOURCE).>

| # | Number | Infographic location | Source post location | Status |
|---|--------|---------------------|---------------------|--------|

## Storyboard Check

- **Story Spine**: <present/missing> -- <quote if present>
- **Dramatic functions**: <all assigned / missing for panels X>
- **Narrative arc**: <coherent / disconnected at panel X>
- **Density mode**: <simple / layered> (<N ON-IMAGE messages per the writer's inventory>)
- **Section A word count**: <N words> (<within / over> the <1,200 simple / 1,300 content-dense> cap)
- **Panel description lengths**: <range, e.g. "42-58 words each" or "86-101 words each">
- **BIG numbers**: <N of 3 expected> in callouts
- **Sketch types**: <all metaphorical / panels X use precise charts>
- **Sub-elements** (layered posts): <N sub-sketches, M sub-equations, K sub-tags / none>
- **Margin elements**: <N professor notes / M-entry colour legend / sidebar present?>
- **Reference Subsections** (content-dense posts only): <Tracked Models / Three Concepts / Key Equations / none>

## Message Coverage

Source post main messages (extracted from `index.md`):

1. <message 1> -- represented in: <Panel N / margin / background / Section D body / Reference Subsection / **missing**>
2. <message 2> -- ...
3. <message 3> -- ...
... (continue for every headline message identified)

Coverage verdict: **<FULL / PARTIAL / OVERSIMPLIFIED>**

<one-sentence justification of the coverage verdict>

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|

## Variant Suggestions

1. <Alternative story beat or sketch metaphor that would be clearer>
2. <Better callouts -- more impactful numbers or phrases from the post>
3. <Better central sketch -- more visually distinctive metaphor>

## Positive Highlights

- <What the infographic does well -- be specific>

## Priority Action Items

1. **[HIGH]** <most critical fix with exact location and correct value>
2. **[MED]** <important improvement>
3. **[LOW]** <nice to have>
```

### Verdict criteria

| Verdict | Criteria |
| --- | --- |
| **ACCEPT** | No HIGH issues, at most 2 MEDIUM issues. Infographic prompt is accurate and ready to use. |
| **MINOR REVISION** | No HIGH issues but 3+ MEDIUM, or 1 HIGH that is easy to fix. Needs targeted improvements. |
| **MAJOR REVISION** | 2+ HIGH issues, or fundamental accuracy problems. Prompt cannot be trusted as-is. |

---

## Quality checklist (internal, before delivering report)

- [ ] Read the **entire** `infographic_instructions.md`
- [ ] Read the **entire** `index.md` source post
- [ ] Extracted and verified every number in the infographic against the source
- [ ] Confirmed all 4 sections (A, B, C, D) are present
- [ ] Determined density mode (simple vs content-dense) from the writer's message inventory or message count in the post
- [ ] Counted Section A words (≤1,200 simple, ≤1,300 content-dense)
- [ ] Counted Section C words (≤250)
- [ ] Verified Section A is flowing prose (no bullets, no tables)
- [ ] Checked all 6 hex codes appear in Section A
- [ ] Verified spatial positions for all 6 panels
- [ ] Checked each panel for storyboard format (title, central sketch, callout, connector + optional sub-elements)
- [ ] Confirmed panel descriptions are 40-90 words each (40-60 simple, 60-90 layered)
- [ ] Confirmed sub-elements (sub-sketch, sub-equation, sub-tag, multi-label) appear only when message inventory justifies them
- [ ] Confirmed no body text in Section A
- [ ] Verified central sketches are metaphorical (not precise charts)
- [ ] Confirmed exactly 3 BIG numbers in callouts
- [ ] Verified Panel 4 uses a Comparison metaphor with teal/chalk coloring
- [ ] Verified margin elements: 1-2 professor's notes; 2-4-entry colour legend; right-margin sidebar present only for tracked-entity posts
- [ ] Verified Section D body sentences scale with density (2-3 simple, 4-6 content-dense)
- [ ] Verified Reference Subsections (if present) map to panels without duplication
- [ ] Checked Story Spine and dramatic functions in Section D
- [ ] Assessed narrative arc coherence across all 6 beats
- [ ] Verified correct template for the topic
- [ ] **Extracted main messages from the source post and mapped each to the infographic (Dimension 8)**
- [ ] **Scored message coverage as FULL / PARTIAL / OVERSIMPLIFIED**
- [ ] Generated 2-3 variant suggestions
- [ ] All HIGH issues have specific locations and correct values
- [ ] Priority action items ranked by impact

---

## Step 10 -- Follow-up

After delivering the review, offer the user next steps:

"Would you like me to:
- Fix the issues found and update `infographic_instructions.md`?
- Adjust specific story beats or sketch metaphors?
- Regenerate the infographic prompt with a different template using `/project:write-infographic`?
- Elaborate on any specific finding or suggest additional variants?"
