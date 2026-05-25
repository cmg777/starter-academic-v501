# Verification checklist

Run after every render. Most failures are caught by item 1 or 2.

## 1. Exit status

`scripts/render.js` exits non-zero on:

- **2** — bad arguments / layout JSON malformed / template missing
- **3** — Playwright not installed (run `npx playwright install chromium`)
- **4** — template did not set `window.READY = true` within `--timeout-ms`
          (usually a JS error in the template; the stderr dump lists them)

Anything non-zero means **do not ship the SVG/JPEG** — it will be empty or
half-drawn.

## 2. Eyeball the output

Open the SVG (or JPEG) and check:

| Symptom                                       | Likely cause                                      | Fix |
|-----------------------------------------------|---------------------------------------------------|-----|
| Text is sans-serif, not handwritten           | Google Fonts didn't load before `render()` ran    | Confirm network; or embed fonts per `typography.md` |
| Panels overlap / clip                         | Too many panels for the width                     | Bump `width` or trim to 3 panels |
| Body text overflows the footnote ribbon       | Paragraph too long; auto-wrap can't fit it        | Shorten the paragraph in the layout JSON, or split into two entries. The renderer logs `console.warn` when this happens — visible in stderr on exit-code-4. |
| Hachure overlaps text and makes it unreadable | Hachure too dense                                 | In the template, bump `hachureGap` from 14 to 18–22 |
| Two adjacent panels look identical            | Same hachure angle / seed                         | The template already varies angle per panel — only an issue if you removed that |
| JPEG hachure strokes look soft / blocky       | JPEG quality too low for fine strokes             | Re-render with `--quality 92` (default is 85) |

## 3. Determinism

Re-run the exact same command. The output bytes for the SVG should be
**identical** (modulo timestamps if you add any). If they differ, the seed
isn't being propagated — check that the layout JSON has a `seed` key.

## 4. Provenance

When committing a rendered diagram into a blog post, commit the layout
JSON alongside it (e.g. `content/post/<slug>/figures/foo.layout.json`
next to `foo.svg`). That makes the diagram reproducible — a future edit
just needs the JSON, not the chat that produced it.
