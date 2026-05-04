# Static Sections: Negative Prompt and Condensed Prompt

> This file is part of the `write-infographic` skill. Read during the core
> workflow when generating the output file.

## Section B: Negative Prompt

Separated from Section A by a `---` horizontal rule and labeled `## Negative Prompt`.

The negative prompt is mostly static with a few topic-specific additions:

```
Do not include: photorealistic rendering, glossy or reflective surfaces,
drop shadows, gradient color fills, emojis or Unicode symbols, computer-
generated sans-serif typography, neon glow effects, 3D perspective or
depth, watermarks, stock photo elements, smooth vector curves, pure white
(#ffffff) -- all whites should be warm/creamy chalk white (#f0ece2).
All lines should appear hand-drawn with varying weight and chalk texture.
Do not use clean digital borders or perfectly straight lines. Do not
render precise statistical charts, axis labels, or data tables. Do not
attempt to render more than 3 text elements per panel.
```

Add 1-2 topic-specific exclusions if relevant (e.g., "Do not include
photographs of actual chalkboards or classrooms").

## Section C: Condensed Prompt

Separated by `---` and labeled `## Condensed Prompt (~200 words)`.

A compressed version of Section A for token-limited tools (Midjourney ~6000
chars, DALL-E ~4000 chars). Write in telegram-style -- dense, no filler:

Structure:
1. Style + format + dimensions (1 sentence)
2. Layout (1 sentence)
3. Colors with hex codes (1 sentence listing all 6)
4. Title text (1 sentence)
5. One sentence per panel: position, title, central sketch, callout
6. Margin elements (1 sentence)
7. Atmosphere (1 sentence)
8. Negative prompt (1 sentence)

Target: under 250 words / 1800 characters.

**Example structure:**

```
Chalkboard infographic, 1920x1080 landscape, navy background (#0e1545).
Academic chalk-drawn sketchnote, hand-lettered text, chalk dust, faint
formula textures. Six panels in 3x2 grid with steel blue (#8bb8e0)
chalk borders connected by chalk arrows. Title: "[TITLE]" in steel blue
small-caps, subtitle: "[guiding question]" in italic chalk white
(#f0ece2). Colors: chalk white (#f0ece2) body, warm orange (#e8956a) key
numbers, teal (#00d4c8) highlights, muted gray (#b0a89a) annotations.
Panel 1 (top-left): "[TITLE]" -- [central sketch in 5 words], callout
"[phrase]" in orange. Panel 2 (top-center): ... [continue for all 6].
Professor's note bottom-right: "[note]". Legend bottom-left: [concept]:
teal, [concept]: orange. Faint formulas: [formula 1], [formula 2] at
15% opacity. No photorealism, no gradients, no precise charts, no small
text, no pure white.
```
