# Infographic Skill: Storyboard-First Redesign

**Date:** 2026-05-04
**Scope:** write-infographic skill, review-infographic skill, reference output

## Problem

The write-infographic skill generated dense AI image prompts (~3,000 words in Section A) with precise statistical charts, 2-3 body sentences per panel, and 6+ specific numbers. Gemini cannot render precise data visualizations, resulting in cluttered, noisy images. Panel descriptions were 150+ words each with 8 elements.

## Solution: Storyboard-First Approach

Redesigned the skill around storytelling through simple sketch metaphors instead of precise charts.

### Key changes

1. **Story Spine** -- New narrative arc step before panel design. One-sentence story spine + six story beats that form a beginning-middle-end arc with tension and resolution.

2. **Central sketch replaces mini-viz** -- Each panel gets ONE large metaphorical illustration (magnifying glass, balance scale, fork in road) instead of precise charts with exact data values.

3. **Lean panel descriptions** -- Cut from 150+ words to 40-60 words per panel. Each panel has exactly: title, central sketch, callout, connector. No body text in Section A.

4. **3 BIG numbers** -- Instead of 6+ numbers scattered everywhere, exactly 3 anchor numbers rendered large in warm orange. Other numbers are contextual annotations.

5. **Two-pass rendering model** -- Section A is what the AI generates (sketches + key text). Section D provides body text for manual overlay in an image editor.

6. **Visual metaphor vocabulary** -- New reference file with ~25 sketch concepts organized by communicative purpose (Comparison, Narrowing, Surprise, Decision, etc.) with template-to-metaphor mappings.

7. **Narrative arc templates** -- Panel templates reframed with dramatic function labels (Hook, Stakes, Attempt, Twist, Surprise, Resolution) instead of just content categories.

### Files modified

- `.claude/skills/write-infographic/SKILL.md` -- Major rewrite
- `.claude/skills/write-infographic/references/panel-templates.md` -- Narrative arcs
- `.claude/skills/write-infographic/references/static-sections.md` -- Leaner targets
- `.claude/skills/write-infographic/references/visual-metaphor-vocabulary.md` -- NEW
- `.claude/skills/review-infographic/SKILL.md` -- Aligned with new format
- `.claude/skills/review-infographic/references/review-checklist.md` -- Updated checks
- `.claude/skills/review-infographic/references/panel-templates.md` -- Updated
- `content/post/python_partial_identification/infographic_instructions.md` -- Reference output rewritten
- `CLAUDE.md` -- Skill descriptions updated

### Metrics

| Metric | Before | After |
|--------|--------|-------|
| Section A word count | ~3,000 | ~850 |
| Panel description length | 150+ words | 40-60 words |
| Elements per panel | 8 | 3-4 |
| Numbers in image | 6+ | 3 BIG + 3 contextual |
| Condensed prompt target | ~400 words | ~250 words |
