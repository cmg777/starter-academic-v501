# Infographic Review Checklist

> This file is part of the `review-infographic` skill. Read this file
> when performing the review.

## Review dimensions

### 1. Accuracy (highest priority)

- [ ] Every number cited in the infographic appears in the source post
- [ ] Numbers are quoted correctly (no rounding errors or transpositions)
- [ ] Method names and technical terms match the source post
- [ ] Panel summaries accurately represent the post's content
- [ ] No claims in the infographic that are not supported by the post

### 2. Completeness

- [ ] All 4 sections present: A (full prompt), B (negative prompt), C (condensed prompt), D (panel reference data)
- [ ] Section A is flowing prose (no bullet points or numbered lists)
- [ ] Section A is under 1,200 words
- [ ] Section B includes standard exclusions plus "Do not render precise statistical charts"
- [ ] Section C is under 250 words
- [ ] Section D has structured data for all 6 panels
- [ ] Story Spine present in Section D

### 3. Prompt leanness

- [ ] Section A uses flowing prose throughout (no bullets, no tables)
- [ ] All 6 hex color codes are mentioned inline in Section A (#0e1545, #f0ece2, #8bb8e0, #e8956a, #00d4c8, #b0a89a)
- [ ] Spatial positions specified for each panel (top-left, top-center, etc.)
- [ ] Each panel description is 40-60 words (not 150+ as in old format)
- [ ] No body text or explanatory sentences in Section A panel descriptions
- [ ] Two-pass rendering note present at end of Section A
- [ ] No emojis anywhere

### 4. Storyboard format

For each of the 6 panels, verify:
- [ ] Panel title in steel blue small-caps (3-5 words, specific to content)
- [ ] Central sketch is a metaphorical illustration (NOT a precise chart)
- [ ] Callout in warm orange, under 8 words
- [ ] Exactly 3 of 6 callouts contain a BIG number
- [ ] Connector is visual only in Section A ("chalk arrow to Panel N")
- [ ] No extra elements (no body text, no mini-viz with data, no transition text on arrows)
- [ ] No two panels use the same metaphor type

### 5. Panel 4 comparison sketch

- [ ] Panel 4 uses a Comparison metaphor (balance scale, containers, side-by-side objects)
- [ ] Best method highlighted in teal (#00d4c8)
- [ ] Others in chalk white (#f0ece2)
- [ ] NOT a precise bar chart with exact values

### 6. Narrative arc coherence

- [ ] Story Spine captures the post's narrative arc in one sentence
- [ ] Dramatic functions assigned (Hook, Stakes, Attempt, Twist, Surprise, Resolution)
- [ ] Story beats form a beginning-middle-end arc
- [ ] The guiding question in the title banner is answered by Panel 6
- [ ] Transition phrases use dramatic moves (Escalation, Complication, Turn, Resolution)
- [ ] No redundant panels

### 7. Template alignment

- [ ] Correct template used for the post's topic (Causal / ML / Exploratory)
- [ ] Panel purposes match the template specification
- [ ] No panel is off-topic or tangential

## Variant suggestions

After completing the review, suggest 2-3 improvements:

1. **Alternative story beat** -- would a different narrative beat tell a clearer story?
2. **Better callouts** -- are there more impactful numbers or phrases from the post?
3. **Better central sketch** -- is there a more visually distinctive metaphor?

## Report format

Deliver the review inline:

```
# Infographic Review: <slug>

**Infographic:** `infographic_instructions.md`
**Source post:** `index.md`
**Reviewed:** <date>

## Verdict: <ACCEPT / MINOR REVISION / MAJOR REVISION>

## Accuracy Check
<summary of number verification -- list each number checked>

## Storyboard Check
- Story Spine: <present/missing>
- Section A word count: <N words>
- Panel description lengths: <range>
- BIG numbers: <N of 3>
- Sketch types: <all metaphorical / issues>

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|

## Variant Suggestions
1. <suggestion>
2. <suggestion>
3. <suggestion>

## Positive Highlights
- <what the infographic does well>

## Priority Action Items
1. **[HIGH]** <most critical>
```
