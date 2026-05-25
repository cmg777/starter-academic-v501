# Typography

All text is rendered as plain SVG `<text>` (not `<foreignObject>`), so it
rasterizes crisply through Playwright and stays selectable / editable when
the SVG is opened in a vector editor.

## Fonts (Google Fonts, loaded by the template)

| Class       | Font                 | Weight | Size in comparison template | Use for                          |
|-------------|----------------------|--------|------------------------------|----------------------------------|
| `.title`    | Caveat               | 700    | 56 (headline) / 42 (panel)   | Headlines, panel titles          |
| `.subtitle` | Caveat               | 500    | 30                           | Sub-headline                     |
| `.body`     | Kalam                | 400    | 22                           | Panel body lines                 |
| `.body-b`   | Kalam                | 700    | 22                           | Emphasised body                  |
| `.label`    | Architects Daughter  | 400    | 22                           | Ribbons, tags, captions          |

Caveat reads as a confident felt-tip; Kalam is a steadier handwriting that
sustains longer body lines; Architects Daughter is the most "blueprint /
notebook" of the three — good for short labels.

## Why three fonts and not one

Mixing two handwritten fonts is the cheapest way to fake the look of a real
mixed-media infographic (a marker headline + a notebook body). All three is
the upper limit before it starts to feel inconsistent rather than human.

## Loading & timing

The template waits for `document.fonts.ready` before drawing, so the SVG
always uses the right fonts. **If you fork the template**, keep that wait —
without it, the first paint can fall back to sans-serif and the PNG export
will not match what you see when you re-open the page.

## Offline fallback

If the render machine has no network, the Google Fonts request will fail
silently and text will render in the system sans-serif. Two options:

1. **Embed the fonts.** Download Caveat, Kalam, and Architects Daughter
   `.woff2` files into `templates/fonts/`, then replace the `<link>` tag
   with an inline `@font-face` block. Adds ~150 KB to the template.
2. **Accept the fallback.** For quick previews, the geometry is the point.
   Use online rendering for the final export.

The skill ships in mode (network) by default.

## Non-ASCII glyphs

Caveat, Kalam, and Architects Daughter cover the standard Latin block,
but they don't all carry every mathematical or arrow glyph. The fallback
example uses `⊥` (perpendicular), `≈` (approximately equal), and `→`
(rightwards arrow); these render fine on macOS via the system fallback
font cascade. On a bare Linux render box (e.g. CI), unsupported glyphs
fall back to whatever the system has — often a noticeably different
weight or, worst case, a tofu box. If you target a non-macOS render
environment, prefer ASCII (`perp`, `~`, `->`) or embed the fonts (see
"Offline fallback" above) and confirm the glyphs you need are in the
subset you bundle.
