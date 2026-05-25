# Layout schema

`render.js` consumes a JSON file describing the diagram. The `type` key
selects the template under `templates/<type>.html`. All other keys are
template-specific.

## Common keys

| Key       | Type     | Required | Default   | Notes |
|-----------|----------|----------|-----------|-------|
| `type`    | string   | yes      | —         | Must match a template stem (`comparison`, …). |
| `seed`    | integer  | no       | `42`      | Rough.js RNG seed. Same seed → same diagram, every render. |
| `width`   | integer  | no       | `1400`    | SVG viewBox width in px. |
| `height`  | integer  | no       | `900`     | SVG viewBox height in px. |
| `theme`   | string   | no       | `"paper"` | `"paper"` (cream background) or `"chalkboard"` (dark blue background, lifted accents). See **Themes** below. |
| `title`   | string   | no       | —         | Top headline (Caveat 56). Omit for no headline. |
| `subtitle`| string   | no       | —         | Sub-headline beneath the title (Caveat 30). |

## `type: "comparison"` (3-panel)

Designed for 2–4 panels arranged in a row. The defaults are tuned for **3**
panels — for 2 or 4, double-check that body text still fits.

```jsonc
{
  "type": "comparison",
  "seed": 42,
  "width": 1400,
  "height": 900,
  "theme": "paper",           // or "chalkboard" — see Themes below
  "title": "Optional headline",
  "subtitle": "Optional sub-headline",
  "arrows": true,             // false to suppress the down-arrows between panels
  "panels": [
    {
      "title":   "Panel title",        // required, rendered in Caveat 42
      "accent":  "blue",               // one of: blue, orange, teal, purple, green, red, ink
      "icon":    "target",             // REQUIRED — see references/icons.md for the 15-icon catalog
      "body":    ["paragraph 1", "paragraph 2"],  // each entry is a paragraph; renderer wraps to panel width
      "footnote": "tagline"            // optional ribbon at the bottom of the panel
    },
    /* … */
  ]
}
```

### Required per-panel fields

| Field    | Type     | Notes                                                                                  |
|----------|----------|----------------------------------------------------------------------------------------|
| `title`  | string   | Rendered in Caveat 42 above the body.                                                  |
| `accent` | string   | One of `blue`, `orange`, `teal`, `purple`, `green`, `red`, `ink`. Drives stroke + fill. |
| `icon`   | string   | Must match a name in [`icons.md`](icons.md) (e.g. `target`, `funnel`, `kitchen-sink`). Renderer exits 4 if absent. |
| `body`   | string[] | One or more paragraphs (wrapped to panel width).                                       |
| `footnote` | string | Optional ribbon at the bottom of the panel.                                            |

### Themes

Two themes ship: `paper` (default, light) and `chalkboard` (dark, designed
to fit posts that use the dark-theme figure palette from CLAUDE.md). The
theme drives the background, ink color, and the accent palette.

| `theme`      | background | ink color | accent palette                              |
|--------------|-----------|-----------|---------------------------------------------|
| `paper`      | `#fbf7ee` | `#141413` | Day-mode accents (saturated, dark on light) |
| `chalkboard` | `#0a1d3a` | `#e8ecf2` | Night-mode accents (lifted, light on dark). Deep navy aligned with site heading blue `#1a3a8a`. |

Use `paper` for blog posts that live alongside cream/paper figures
(`python_doubleml`, `python_dowhy`, `python_ml_random_forest`, …) and
`chalkboard` for posts that use the dark-theme figure palette
(`python_fwl`, `python_pyfixest`, …).

### Accent palette

Seven accents are available; the exact stroke / hachure-fill RGB depends
on the active theme.

| `accent` | paper stroke | paper fill | chalkboard stroke | chalkboard fill |
|----------|--------------|------------|--------------------|-----------------|
| `blue`   | `#1a3a8a`    | `#dbeafe`  | `#9ec3f0`          | `#1f3461`       |
| `orange` | `#b85a3a`    | `#fde6d8`  | `#f0a98a`          | `#5a3324`       |
| `teal`   | `#008c84`    | `#cff5f1`  | `#7be0d4`          | `#194a47`       |
| `purple` | `#6b3fa0`    | `#ece2f3`  | `#c8a8e8`          | `#3a2856`       |
| `green`  | `#2e7d4f`    | `#d8ecdf`  | `#9ad9af`          | `#1e4732`       |
| `red`    | `#a32d2d`    | `#f6d7d4`  | `#ee9b9b`          | `#5a2424`       |
| `ink`    | `#141413`    | `#e8e6df`  | `#e8ecf2`          | `#1c2540`       |

### Sizing guidance

- **Body lines**: each entry in the `body` array is a **paragraph**. The
  renderer measures the panel width and wraps each paragraph automatically,
  emitting one SVG `<text>` per visual line. Paragraphs are separated by an
  extra ~38 px of vertical gap. You no longer need to pre-break lines at
  ~48 characters — just write natural sentences.
- **Panel count**: 3 is the sweet spot. With 2 panels, lengthen body
  paragraphs and bump `width` to 1600+. With 4 panels, shorten titles to
  1 word and use 2 short paragraphs per panel.
- **Aspect ratio**: 1400 × 900 (≈ 16:10) reads well in a blog post. For
  slides, try 1920 × 1080.

### Determinism

The same `seed` produces the same drawing every time. Bumping the seed
gives the same diagram with different wobble — useful when one panel
happens to land an ugly hachure line.
