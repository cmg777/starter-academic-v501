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
- [ ] Each panel description is 40-90 words: 40-60 for simple panels (≤5 ON-IMAGE messages); 60-90 for layered panels (≥6 ON-IMAGE messages). Flag panels under 35 or over 110 words.
- [ ] Section A word count: ≤1,200 for simple posts; ≤1,300 for content-dense posts
- [ ] No body text or full explanatory sentences in Section A panel descriptions (sub-equations and annotation labels are allowed for layered panels)
- [ ] Two-pass rendering note present at end of Section A
- [ ] No emojis anywhere

### 4. Storyboard format

For each of the 6 panels, verify:
- [ ] Panel title in steel blue small-caps (3-5 words, specific to content)
- [ ] Central sketch is ONE primary metaphorical illustration (NOT a precise chart with numeric axis ticks)
- [ ] Layered panels may add up to 3 sub-elements (sub-sketch, sub-equation in chalk inside the panel, sub-tag above the border, 2-3 annotation labels) — only when justified by ≥6 ON-IMAGE messages in the inventory
- [ ] Callout in warm orange, under 8 words
- [ ] Exactly 3 of 6 callouts contain a BIG number
- [ ] Connector is visual only in Section A ("chalk arrow to Panel N")
- [ ] No body text in Section A; no mini-viz with exact numeric axis ticks; no transition text on arrows
- [ ] No two panels use the same primary metaphor type

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

### 8. Message coverage

The single most important dimension when source posts are content-dense.
All seven preceding dimensions can pass while the infographic still
fails to carry the post's substance — that produces an "oversimplified"
storyboard. This is the dimension that catches it.

- [ ] Extracted 4-10 main messages from the source post (numbered key
      takeaways, paper-section replications, named typologies or
      frameworks, headline figures, the central conceptual contribution)
- [ ] Mapped each main message to its location in the infographic:
      panel scene, margin element, background formula, Section D body
      sentence, Reference Subsection, or **missing**
- [ ] Scored coverage as FULL (all messages mentioned somewhere; central
      contribution on-image), PARTIAL (1-2 missing — MEDIUM issue), or
      OVERSIMPLIFIED (3+ missing or central contribution absent —
      HIGH issue)
- [ ] If the post is content-dense (≥6 main messages) but the
      infographic uses only simple panels with thin Section D
      (2-3 body sentences per panel), flagged as MEDIUM even when
      every other dimension passes
- [ ] If the writer documented a message inventory in Section D
      (ON-IMAGE / MARGIN / REFERENCE tags), verified that every
      ON-IMAGE-tagged message actually landed on a panel

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
- Density mode: <simple / layered> (<N ON-IMAGE messages>)
- Section A word count: <N words> (cap <1200 / 1300>)
- Panel description lengths: <range>
- BIG numbers: <N of 3>
- Sketch types: <all metaphorical / issues>
- Margin elements: <N professor notes / M-entry legend / sidebar?>
- Reference Subsections: <present / none>

## Message Coverage

Source post main messages (extracted from `index.md`):
1. <message 1> -- represented in: <Panel N / margin / Section D / **missing**>
2. <message 2> -- ...
...

Coverage verdict: **<FULL / PARTIAL / OVERSIMPLIFIED>** — <one-sentence justification>

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
