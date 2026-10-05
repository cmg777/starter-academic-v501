# Static Sections: Negative Prompt and Condensed Prompt

> This file is part of the `write-infographic` skill. Read during the core
> workflow when generating the output file. Keep both sections consistent with
> Section A, including user overrides and source scientific color meanings.

## Section B: Negative Prompt

Separated from Section A by a `---` horizontal rule and labeled `## Negative Prompt`.

Use the following default, adapting topic-specific exclusions and explicit user
style choices. Do not ban clean typography or precise strokes merely to imitate
chalk. Mathematical signs and symbols needed for accurate labels are allowed.

```
No blurry or broken lettering, chalk dust over text, smudge haze, glow,
washed-out colors, low-contrast labels, global oversaturation, rainbow
accents, or decorative gradients. No photorealistic classroom, glossy
3D effects, watermarks, stock photos, or emojis. No cropped titles,
labels, legends, borders, or arrowheads; keep all content inside the
5% outer safe margin. No paragraphs, tiny filler text, or unrequested
annotations. Per panel: title, callout, at most one short annotation
(excluding panel numeral). No invented charts, data, units, or formulas.
Preserve scientific color scales and category meanings, including
meaningful map gradients. Keep minus signs, decimals, and labels exact.
```

Add 1-2 topic-specific exclusions when useful. If a precise figure is requested,
reserve it for a verified source/data-driven overlay rather than asking the image
model to invent its values. Adapt the style exclusions for an explicit override;
accuracy and complete framing still apply.

## Section C: Condensed Prompt

Separated by `---` and labeled `## Condensed Prompt (~200 words)`.

Compress Section A to **under 250 words** for tools with shorter prompt budgets.
Retain the constraints that determine the result; cut decorative wording first:

1. Crisp style, format, and native dimensions
2. Layout, safe margins, and dominant title/numeric anchors
3. Selected current website colors with roles; any scientific color exceptions
4. Exact short title and one compact scene/callout per panel, in reading order
5. Essential legend only if needed; longer explanations stay in Section D
6. Sharp-text and no-cropping exclusions, no invented values

**Example structure (adapt to the source post and any user override):**

```
1920x1080 academic infographic, crisp chalk-inspired strokes, clean bold
lettering. Near-black navy #050a12 background, deep navy #0a121d panels,
off-white #edf2f6 lettering/outlines, blue #88b9de headings, selective gold
#e9c184 callouts. Gray #9baaba only for secondary notes. Preserve source
scientific colors with labels/line styles. Six panels, 3x2 grid, generous
gutters, every element inside 5% margins on all edges. Sharp arrows link
1→2→3, route through the row gutter to 4, then 4→5→6.
Dominant title: "[SHORT TITLE]". Three numeric anchors large and bold.
P1 top-left "[HEADING]": [sketch]; "[CALLOUT]".
P2 top-center: ... P3 top-right: ... P4 bottom-left: ...
P5 bottom-center: ... P6 bottom-right: ...
[Essential semantic legend, if needed.] No paragraphs; at most one short
annotation per panel. Title/anchors lead at card size; detail is full-size.
No dusty text, haze, glow, washed-out colors, cropped labels, or invented
values. Copy signs/units exactly; longer text stays in Section D.
```
