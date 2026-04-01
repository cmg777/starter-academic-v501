---
name: review-infographic
description: Expert review of infographic instructions -- verifies accuracy against the source blog post, evaluates prompt quality and panel completeness, and suggests variant improvements. Use after write-infographic to ensure the prompt is accurate and effective. Read-only.
argument-hint: "<post slug, e.g. python_doubleml>"
disable-model-invocation: true
user-invocable: true
---

# Review Infographic: Verify Accuracy, Prompt Quality, and Panel Completeness

Single thorough review of an `infographic_instructions.md` file. Cross-checks
every number and claim against the source blog post, evaluates prompt structure
and quality, and suggests variant improvements. Produces an inline review
report with a verdict.

**What this skill does:**
- Cross-checks every number in the infographic prompt against `index.md`
- Verifies all 4 sections (A, B, C, D) are present and well-formed
- Evaluates Section A for flowing prose, spatial positions, and hex codes
- Checks all 6 panels for completeness (icon, mini-viz, callout, body text, connector)
- Validates Panel 4 comparison visual and teal highlight convention
- Assesses pedagogical coherence -- do the 6 panels tell a coherent story?
- Verifies correct template alignment (Causal / ML / Exploratory)
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
   - `references/panel-templates.md` -- panel templates and element rules

---

## Step 0.5 -- Confirm scope

Present a brief confirmation to the user:

1. **Files identified:** "Found `infographic_instructions.md` and `index.md`
   at `content/post/<slug>/`."

2. **Scope:** "Running full review of infographic instructions against source
   post across all 7 dimensions: accuracy, completeness, prompt quality, panel
   completeness, Panel 4 comparison visual, pedagogical coherence, and template
   alignment."

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
   - Section A -- Full flowing-prose image generation prompt
   - Section B -- Negative prompt
   - Section C -- Condensed prompt (under 400 words / 2500 characters)
   - Section D -- Panel reference data appendix

2. **Section A is flowing prose.** No bullet points, no numbered lists, no
   tables. The entire section reads as continuous paragraphs.

3. **Section B includes standard exclusions** plus topic-specific additions
   relevant to the post content.

4. **Section C word count.** Count the words in Section C. Flag if over 400
   words. Count characters. Flag if over 2500 characters.

5. **Section D has structured data** for all 6 panels. Each panel entry must
   include: title, icon, mini-viz, callout, body text (3 bullet sentences),
   and connector phrase.

---

## Step 3 -- Dimension 3: Prompt quality

Evaluate Section A for effective AI image generation:

1. **Flowing prose throughout.** No bullets, no tables, no markdown formatting
   that would confuse an image generation model.

2. **All 6 hex color codes mentioned inline.** The site color palette must
   appear in the prose: `#6a9bcc` (steel blue), `#d97757` (warm orange),
   `#141413` (near black), `#00d4c8` (teal), `#f0ece2` (chalk white), and
   the chalkboard background color.

3. **Spatial positions specified.** Each panel has a clear position description
   (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right).

4. **Sentence length.** Sentences should be 15-30 words each. Flag sentences
   that are too long (over 35 words) or too short (under 8 words) -- image
   generation models work best with medium-length, descriptive sentences.

5. **No emojis anywhere** in the entire file.

6. **Em dashes** (---) used for parenthetical breaks, not double hyphens (--).

---

## Step 4 -- Dimension 4: Panel completeness

For each of the 6 panels, verify the presence and quality of every required
element:

1. **Panel number and position.** Clearly stated (e.g., "top-left", "Panel 1").

2. **Descriptive title.** Not generic ("Results" or "Analysis") but specific
   to the content (e.g., "The Wage Penalty Question" or "Double Robustness
   Advantage").

3. **Icon description.** Concrete, specific, and visually distinct from the
   other 5 panels. Flag if two panels use similar icons.

4. **Mini-viz description.** Concrete chart type with specific data values
   from the source post. Not vague ("a chart showing results") but precise
   ("a grouped bar chart with three bars: OLS at 0.45, IV at 0.62, DML at
   0.58"). Flag generic or numberless descriptions.

5. **Callout.** A specific number or memorable phrase with rendering
   instructions (font size, color, position). The number must trace back to
   the source post.

6. **Body text.** Three bullet sentences in Section D that summarize the
   panel's message. Each sentence should be self-contained and informative.

7. **Connector arrow.** From the previous panel (except Panel 1) with a
   content-specific transition phrase -- not generic ("next" or "then") but
   tied to the analytical flow (e.g., "But does selection bias this estimate?"
   or "Adding controls reveals...").

---

## Step 5 -- Dimension 5: Panel 4 comparison visual

Panel 4 typically shows a methods comparison. Verify:

1. **Comparison visual present.** Panel 4 includes a side-by-side bars,
   overlapping confidence intervals, or comparison table description.

2. **Best method highlighted in teal** (`#00d4c8`). The winning or
   recommended method should be visually distinguished.

3. **Other methods in chalk white** (`#f0ece2`). Non-preferred methods use
   the neutral chalk color to create contrast.

4. **Comparison is accurate.** The relative ordering and values in the
   comparison match the source post's findings.

If the post does not compare multiple methods, note that Panel 4 may serve
a different purpose and evaluate accordingly based on the template.

---

## Step 6 -- Dimension 6: Pedagogical coherence

Evaluate whether the 6 panels tell a coherent story:

1. **Logical progression.** The panels follow a clear arc from problem
   statement to conclusion -- typically: problem, data, method, comparison,
   insight, bottom line.

2. **Template logic followed.** The panel purposes match the selected
   template (Causal / ML / Exploratory) from `references/panel-templates.md`.

3. **Connector phrases create transitions.** Reading just the connector
   phrases should produce a mini-narrative that makes sense on its own.

4. **Panel 6 answers the guiding question.** The title banner of the
   infographic poses a question. Panel 6 should provide the answer or
   key takeaway. Flag if Panel 6 is generic or disconnected from the
   opening question.

5. **No redundant panels.** Each panel contributes unique information.
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
   actual purpose against the template's prescribed purpose. Flag any panel
   that is off-topic or tangential.

3. **No mismatched template.** If the infographic uses a Causal template but
   the post is about exploratory analysis (or vice versa), flag as HIGH.

---

## Step 8 -- Produce review report

Deliver the review **inline in the conversation** using the format below.

### Severity definitions

| Level | Meaning |
| --- | --- |
| **HIGH** | Numbers do not match source post, missing sections (A/B/C/D), fabricated claims, wrong template. Must fix before using the prompt. |
| **MEDIUM** | Generic descriptions, missing panel elements, vague callouts, quality issues that reduce prompt effectiveness. Should fix. |
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

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|

## Variant Suggestions

1. <Alternative panel arrangement, ordering, or topic swap that would
   tell a clearer story>
2. <Better callouts -- more impactful numbers or phrases from the post>
3. <Better icons or mini-viz -- more visually distinctive options>

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
- [ ] Counted Section C words (must be under 400)
- [ ] Verified Section A is flowing prose (no bullets, no tables)
- [ ] Checked all 6 hex codes appear in Section A
- [ ] Verified spatial positions for all 6 panels
- [ ] Checked each panel for all 7 elements (position, title, icon, mini-viz, callout, body text, connector)
- [ ] Verified Panel 4 comparison visual with teal/chalk coloring
- [ ] Assessed pedagogical coherence across all 6 panels
- [ ] Verified correct template for the topic
- [ ] Generated 2-3 variant suggestions
- [ ] All HIGH issues have specific locations and correct values
- [ ] Priority action items ranked by impact

---

## Step 9 -- Follow-up

After delivering the review, offer the user next steps:

"Would you like me to:
- Fix the issues found and update `infographic_instructions.md`?
- Adjust specific panels (swap topics, improve callouts, change icons)?
- Regenerate the infographic prompt with a different template using `/project:write-infographic`?
- Elaborate on any specific finding or suggest additional variants?"
