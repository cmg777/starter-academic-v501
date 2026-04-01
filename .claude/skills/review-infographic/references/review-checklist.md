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
- [ ] Section B includes the standard exclusions plus topic-specific additions
- [ ] Section C is under 400 words / 2500 characters
- [ ] Section D has structured data for all 6 panels

### 3. Prompt quality

- [ ] Section A uses flowing prose throughout (no bullets, no tables)
- [ ] All 6 hex color codes are mentioned inline in Section A
- [ ] Spatial positions specified for each panel (top-left, top-center, etc.)
- [ ] Sentences are 15-30 words each (not too long, not too short)
- [ ] No emojis anywhere
- [ ] Em dashes (---) not double hyphens (--)

### 4. Panel completeness

For each of the 6 panels, verify:
- [ ] Panel number and position
- [ ] Descriptive title (not generic)
- [ ] Icon description (concrete, specific, distinct from other panels)
- [ ] Mini-viz description (concrete chart type with specific data values)
- [ ] Callout (specific number or memorable phrase, rendering instructions)
- [ ] Body text (3 bullet sentences in Section D)
- [ ] Connector arrow from previous panel (except Panel 1) with transition phrase

### 5. Panel 4 comparison visual

- [ ] Panel 4 includes a comparison visual (side-by-side bars, overlapping intervals, or table)
- [ ] Best method highlighted in teal (#00d4c8)
- [ ] Others in chalk white (#f0ece2)

### 6. Pedagogical coherence

- [ ] The 6 panels tell a coherent story from problem to conclusion
- [ ] Panel progression follows the template logic (problem -> data -> method -> comparison -> insight -> bottom line)
- [ ] Connector phrases create natural transitions between panels
- [ ] The guiding question in the title banner is answered by Panel 6

### 7. Template alignment

- [ ] Correct template used for the post's topic (Causal / ML / Exploratory)
- [ ] Panel purposes match the template specification
- [ ] No panel is off-topic or tangential

## Variant suggestions

After completing the review, suggest 2-3 improvements:

1. **Alternative panel arrangement** -- would a different panel topic or ordering tell a clearer story?
2. **Better callouts** -- are there more impactful numbers or phrases from the post?
3. **Better icons/mini-viz** -- are there more visually distinctive options?

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
