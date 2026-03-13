# Infographic Skill AI Prompt Redesign, Dark Mode, and Proofread Expansion

**Date:** 2026-03-13

## Infographic skill rewrite (`.claude/skills/infographic-instructions/SKILL.md`)

Transformed the infographic-instructions skill output from a structured design specification (markdown tables, bullet points, tagged metadata) into a **copy-pasteable AI image generation prompt** optimized for Gemini, DALL-E, Midjourney, and Ideogram:

- **4-section output format**: (A) Full flowing-prose image generation prompt, (B) Negative prompt, (C) Condensed ~300-word prompt for token-limited tools, (D) Panel reference data appendix
- **Interactive confirmation step** (Step 0.5): asks user to confirm template, title, panel overview, target AI tool, and text rendering preference before generating
- **Text rendering options**: Option A (all text, Gemini/Ideogram), Option B (key text only, DALL-E), Option C (minimal text, Midjourney)
- **Prompt engineering best practices**: medium+style opening line, general-to-specific structure, spatial anchoring, inline hex codes, concrete visual language, consistent terminology
- Regenerated reference output (`content/post/python_partial_identification/infographic_instructions.md`) in new format

## Proofread skill expansion (`.claude/skills/proofread-post/SKILL.md`)

- Added `focus:` argument to run only specific checks (e.g., `focus: math`, `focus: code`)
- Expanded from 9-point to 10-point checklist: added grammar/spelling/typos check, enhanced math check (correctness + accessibility), enhanced front matter check (`links:` validation), enhanced markdown check (callout/shortcode pairing, learning objectives, Colab badge)

## Dark mode (`config/_default/params.yaml`, `data/themes/nightlights.toml`, `assets/scss/custom.scss`)

- Enabled day/night toggle in site params (`day_night: true`, `show_day_night: true`)
- Added `[dark]` section to nightlights theme with deep navy palette (`#0f1729` background, `#0e1545` navbar)
- Added ~165 lines of dark mode CSS overrides: code blocks, tables, figures, blockquotes, headings, TOC, lightbox, collapsible dashboards, callouts, search box

## Documentation updates

- `CLAUDE.md` — updated infographic-instructions and proofread-post skill descriptions
- `README.md` — mirrored same updates

## Other

- `content/post/python_partial_identification/featured.jpg` — updated featured image

## Files changed

- `.claude/skills/infographic-instructions/SKILL.md`
- `.claude/skills/proofread-post/SKILL.md`
- `CLAUDE.md`
- `README.md`
- `assets/scss/custom.scss`
- `config/_default/params.yaml`
- `data/themes/nightlights.toml`
- `content/post/python_partial_identification/infographic_instructions.md`
- `content/post/python_partial_identification/featured.jpg`
