# Rough.js options cheat sheet

Defaults baked into `templates/comparison.html`. Tweak these in the template
itself (not in the layout JSON) when you need a different aesthetic.

## Stroke wobble

| Option       | Default | Range  | What it does |
|--------------|---------|--------|--------------|
| `roughness`  | `1.8`   | 0–10   | How shaky lines look. `0` = clean. `1.5–2.5` reads as confident hand-drawing; `>3` looks nervous. |
| `bowing`     | `1.4`   | 0–10   | How much straight lines curve. `0` = straight, `2` = visibly bowed. |
| `seed`       | from layout | int | RNG seed. Same seed → identical output. |
| `strokeWidth`| `2.4`   | px     | Stroke width. Sketchy ink reads well at 2–3 px. |

## Fills

| `fillStyle`  | Look |
|--------------|------|
| `hachure`    | Parallel diagonal hatching. The default — feels like marker. |
| `solid`      | Flat fill. Use for ribbons / labels where hachure would compete with text. |
| `zigzag`     | Back-and-forth lines, denser than hachure. |
| `cross-hatch`| Two perpendicular hachure passes. Dark. |
| `dots`       | Stippled. Subtle. |
| `dashed`     | Spaced strokes. |
| `zigzag-line`| Sparse zigzag. Lightest of the fills. |

Hachure parameters:

| Option          | Default | Notes |
|-----------------|---------|-------|
| `hachureAngle`  | `-35°`  | The comparison template varies this per panel so the three rectangles don't look stamped from the same press. |
| `hachureGap`    | `14`    | Larger = sparser fill, more paper showing through, easier to read body text on top. |
| `fillWeight`    | inherits `strokeWidth/2` | Hachure stroke thickness. |

## Accent palette

The comparison template ships seven accents per theme. Pick by name in the
layout JSON (`"accent": "purple"` etc.); the active `theme` (`paper` or
`chalkboard`) decides the exact RGBs. The full table lives in
`layout-schema.md` under **Accent palette**.

| `accent` | feel                                  |
|----------|----------------------------------------|
| `blue`   | primary / serious / gold-standard      |
| `orange` | warm / cautionary / observational      |
| `teal`   | technical / clever / specialty         |
| `purple` | exploratory / Bayesian / open question |
| `green`  | success / verified / positive          |
| `red`    | warning / failure / negative           |
| `ink`    | neutral / control / null condition     |

## Picking a recipe

| Use case | `roughness` | `bowing` | `fillStyle`  | `hachureGap` |
|----------|-------------|----------|--------------|--------------|
| Crisp diagram (papers, slides) | 1.2 | 1.0 | `solid` or `hachure` 18 | 18 |
| Friendly explainer (default)   | 1.8 | 1.4 | `hachure`     | 14 |
| Whiteboard / classroom feel    | 2.6 | 2.0 | `cross-hatch` | 10 |
| Concept sketch (very loose)    | 3.5 | 2.5 | `zigzag`      | 8  |

## Things Rough.js does NOT do

- **No handwritten text.** Text is plain SVG `<text>` styled with the
  Google handwritten fonts loaded in the template (`Caveat`, `Kalam`,
  `Architects Daughter`). The fonts do the hand-drawn job; Rough.js does
  the lines.
- **No character illustrations.** The robots / faces / mascots in
  illustrator-made infographics have to come from somewhere else (image
  generation, an actual illustrator, or pasted SVGs). This skill draws the
  *diagram scaffolding*, not the characters.
- **No automatic word-wrap.** Each body line in the layout JSON becomes
  one `<text>` element. Break long lines yourself.
