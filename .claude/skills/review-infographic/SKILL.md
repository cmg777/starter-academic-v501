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
- Evaluates Section A for lean flowing prose (under 1,200 words)
- Checks all 6 panels for storyboard format (title, central sketch, callout, connector)
- Validates Panel 4 uses a Comparison metaphor with teal highlight
- Assesses narrative arc coherence -- do the 6 beats tell a story?
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
   post across all 7 dimensions: accuracy, completeness, prompt leanness,
   storyboard format, Panel 4 comparison sketch, narrative arc coherence, and
   template alignment."

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
   - Section A -- Lean flowing-prose image generation prompt (under 1,200 words)
   - Section B -- Negative prompt
   - Section C -- Condensed prompt (under 250 words)
   - Section D -- Panel reference data appendix with body sentences for overlay

2. **Section A is flowing prose.** No bullet points, no numbered lists, no
   tables. The entire section reads as continuous paragraphs.

3. **Section A word count.** Count the words in Section A. Flag if over 1,200
   words -- the prompt should be lean enough for Gemini to process.

4. **Section B includes standard exclusions** plus topic-specific additions.
   Must include "Do not render precise statistical charts."

5. **Section C word count.** Count the words in Section C. Flag if over 250
   words.

6. **Section D has structured data** for all 6 panels. Each panel entry must
   include: dramatic function, story beat, callout, central sketch description,
   body sentences (2-3), and transition phrase.

7. **Story Spine present** in Section D with a one-sentence narrative arc.

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

4. **Panel descriptions are 40-60 words each.** Flag panels that are over 80
   words -- they contain too many elements for Gemini.

5. **No body text in Section A.** Body sentences belong only in Section D.
   Flag any explanatory sentences in panel descriptions.

6. **Two-pass rendering note present.** Section A ends with a paragraph
   explaining what the AI renders vs what the user overlays.

7. **No emojis anywhere** in the entire file.

---

## Step 4 -- Dimension 4: Storyboard format

For each of the 6 panels, verify the presence and quality of every required
element:

1. **Panel title.** Steel blue small-caps, 3-5 words, specific to content
   (not generic like "Results" or "Analysis").

2. **Central sketch.** ONE metaphorical illustration described in 1-2
   sentences. Must be a visual metaphor (magnifying glass, balance scale,
   fork in road) -- NOT a precise statistical chart (bar chart with exact
   values, scatter plot, number line with tick marks). Flag any precise
   data visualizations.

3. **Callout.** Warm orange, under 8 words. Exactly 3 of 6 panels must
   contain a BIG number; the other 3 use memorable phrases. Flag if all 6
   have numbers (too dense) or if none have numbers (too vague).

4. **Connector arrow.** Visual only in Section A (just "chalk arrow to
   Panel N"). Transition phrases belong in Section D only.

5. **No extra elements.** Flag if a panel description includes body
   sentences, mini-viz with data values, multiple annotation labels, or
   transition text on arrows.

6. **Sketch diversity.** No two panels should use the same metaphor type.
   Flag repeats (e.g., two magnifying glasses, two forks in roads).

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

## Step 8 -- Produce review report

Deliver the review **inline in the conversation** using the format below.

### Severity definitions

| Level | Meaning |
| --- | --- |
| **HIGH** | Numbers do not match source post, missing sections (A/B/C/D), fabricated claims, wrong template, precise charts instead of sketches. Must fix before using the prompt. |
| **MEDIUM** | Generic descriptions, missing panel elements, vague callouts, too many text elements per panel, Section A over 1,200 words. Should fix. |
| **LOW** | Style preferences, minor wording improvements, alternative suggestions. Nice to fix. |

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
- **Section A word count**: <N words> (<within / over> 1,200 limit)
- **Panel description lengths**: <range, e.g. "42-58 words each">
- **BIG numbers**: <N of 3 expected> in callouts
- **Sketch types**: <all metaphorical / panels X use precise charts>

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
- [ ] Counted Section A words (must be under 1,200)
- [ ] Counted Section C words (must be under 250)
- [ ] Verified Section A is flowing prose (no bullets, no tables)
- [ ] Checked all 6 hex codes appear in Section A
- [ ] Verified spatial positions for all 6 panels
- [ ] Checked each panel for storyboard format (title, central sketch, callout, connector)
- [ ] Confirmed panel descriptions are 40-60 words each
- [ ] Confirmed no body text in Section A
- [ ] Verified central sketches are metaphorical (not precise charts)
- [ ] Confirmed exactly 3 BIG numbers in callouts
- [ ] Verified Panel 4 uses a Comparison metaphor with teal/chalk coloring
- [ ] Checked Story Spine and dramatic functions in Section D
- [ ] Assessed narrative arc coherence across all 6 beats
- [ ] Verified correct template for the topic
- [ ] Generated 2-3 variant suggestions
- [ ] All HIGH issues have specific locations and correct values
- [ ] Priority action items ranked by impact

---

## Step 9 -- Follow-up

After delivering the review, offer the user next steps:

"Would you like me to:
- Fix the issues found and update `infographic_instructions.md`?
- Adjust specific story beats or sketch metaphors?
- Regenerate the infographic prompt with a different template using `/project:write-infographic`?
- Elaborate on any specific finding or suggest additional variants?"
