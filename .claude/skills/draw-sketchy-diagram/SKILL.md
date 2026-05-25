---
name: draw-sketchy-diagram
description: Generate a hand-drawn / whiteboard-style diagram (SVG + PNG) from a short description -- use when the user asks for a "sketchy", "hand-drawn", "Excalidraw-style", or "whiteboard" diagram, especially for explainer figures in blog posts or slides. Renders deterministically through Rough.js with handwritten Google Fonts (Caveat, Kalam, Architects Daughter), exported via headless Chromium. Ships one template (3-panel comparison); confirms layout with the user before rendering.
argument-hint: "<short description> [out: <path>] [type: comparison] [seed: <int>]"
disable-model-invocation: true
user-invocable: true
---

# Draw Sketchy Diagram

Produce a **hand-drawn-looking diagram** as an SVG (and PNG sibling) from a
short description. The skill confirms structure with the user, writes a
layout JSON, and renders it through a Playwright-driven HTML template that
uses Rough.js for sketchy strokes and Google handwritten fonts for the
text.

The output is the **diagram scaffolding** (panels, boxes, arrows,
sketchy fills, handwritten labels). It does **not** generate character
illustrations / mascots / faces — for those, the work is illustration, not
code. See `references/rough-options.md` for the rationale.

## Example invocations

```
/project:draw-sketchy-diagram three ways to estimate a causal effect
/project:draw-sketchy-diagram RCT vs matching vs IV  out: figures/methods.svg  seed: 7
/project:draw-sketchy-diagram supervised vs unsupervised vs reinforcement learning
```

## What this skill does NOT do

- **Does not draw characters, robots, faces, or mascots.** Pure-code
  sketchy rendering covers diagram geometry and handwritten text, not
  illustrated figures.
- **Does not modify any existing post.** It writes a layout JSON, an
  SVG, and (optionally) a PNG to a path you choose, and stops. No
  front-matter edits, no link injection.
- **Does not auto-discover what to draw.** It asks the user for the
  panel titles, accent colors, and body text. The user is the source of
  truth.
- **Does not pick the diagram type for you.** Currently only one
  template ships (`comparison`, the 3-panel layout). New types
  (`flowchart`, `concept_map`) are scaffolded by adding files to
  `templates/` and documenting the schema in `references/layout-schema.md`.

## Deliverables

For each invocation:

1. `<out>.layout.json` — the layout the renderer consumed. Commit this
   alongside the image so the diagram is reproducible.
2. `<out>.svg` — the rendered diagram, with selectable text.
3. `<out>.jpg` — web-optimised raster (JPEG quality 85, ~150–400 KB for a
   1400×900 diagram). Rendered at 2× device scale so it stays crisp on
   retina displays. Requested with `--jpeg`, or implied when
   `out: …jpg`/`…jpeg`.

---

## Workflow

### Phase 0 — Parse arguments

Extract from `$ARGUMENTS`:

- **Description** (free text): what the diagram is about.
- **`out:`** (optional): output path. Default
  `figures/sketchy/<slug-of-description>.svg` in the current working
  directory. Both `.svg` and `.jpg` are written; pick whichever
  extension you prefer for the path.
- **`type:`** (optional): template name. Default `comparison`. Validate
  against `templates/<type>.html`.
- **`seed:`** (optional, int): Rough.js RNG seed. Default `42`.

If no description is provided, ask for one and stop.

### Phase 1 — Propose a layout, then confirm

Read `references/layout-schema.md` for the schema. From the description,
draft a layout JSON in your head (do not write to disk yet) following the
chosen template's schema. For `comparison`, that means:

- 2–4 **panels**, each with: `title`, `accent` (blue / orange / teal /
  purple / green / red / ink), **required `icon`** from the catalog in
  `references/icons.md`, one or more `body` paragraphs (renderer wraps
  to panel width), optional `footnote`.
- Optional top-level `title` + `subtitle`.
- Optional `theme`: `"paper"` (default) or `"chalkboard"` (deep navy
  `#0a1d3a`, lifted accents) — pick `chalkboard` for posts whose other
  figures use the site dark-theme palette.
- Optional `texture` (default `true`): background dot-grid + vignette. Set
  `false` for a flat background. Optional `arrowLabels` (e.g. `["then",
  "then"]`, one per gap) to caption the connector arrows.

The renderer also applies depth/flourish automatically — panel drop-shadows,
accent-tinted icon badges, a title highlighter swipe (paper) / underline
(chalkboard), and vertically centered body text. See
`references/layout-schema.md` → **Depth & texture** for what's automatic vs.
controllable.

Use **`AskUserQuestion`** to confirm the structure before writing
anything. One block, at most four questions:

1. **Headline.** Confirm the proposed title (and subtitle, if any), or
   accept "no headline."
2. **Panels.** Show the proposed panel titles + accent colors + **icon
   per panel** (e.g. `target`, `funnel`, `scale`) as one joined preview.
   The user picks "looks good" or "let me edit" — if they edit, follow
   up in chat to nail down the changes.
3. **Body paragraphs per panel.** Show the proposed bullets and confirm.
4. **Theme + output path.** Confirm `paper` vs `chalkboard` and the
   resolved path from Phase 0 (or let the user override).

Skip any question whose answer is unambiguous from `$ARGUMENTS`.

### Phase 2 — Write the layout JSON

Write the confirmed layout to `<out>.layout.json`. Match the schema in
`references/layout-schema.md` exactly. Always include `seed` so the
output is reproducible.

A canonical example lives at `examples/comparison-example.json` — match
its formatting (2-space indent, one panel per object).

### Phase 3 — Render

Run:

```
node .claude/skills/draw-sketchy-diagram/scripts/render.js \
     <out>.layout.json \
     --out <out>.svg --jpeg --scale 2
```

`render.js` returns:

- `0` — success. SVG (and JPEG if requested) written.
- `2` — bad input. Re-check args.
- `3` — Playwright not installed. Tell the user:
  ```
  npx playwright install chromium
  ```
  (the `playwright` Node package is also required; the review-app skill
  already pulls it in for this repo, so usually no install is needed.)
- `4` — the template's JS errored before signalling READY. The stderr
  dump includes the JS errors; fix the layout (or the template) and
  retry. The most common cause is a panel missing the required `icon`
  field — error message names the offending panel.

### Phase 4 — Verify

Apply `references/verification-checklist.md`:

1. Exit status is `0`.
2. Open the rendered SVG (or JPEG) and eyeball the typography (handwritten,
   not sans-serif fallback), panel spacing, and body line wrapping.
3. Determinism — re-running with the same layout and seed produces the
   same SVG bytes.

If any check fails, fix and re-render before Phase 5.

### Phase 5 — Report

Print to the user:

- The three deliverable paths (`.layout.json`, `.svg`, `.jpg`).
- One sentence per deliverable on what it's for.
- If a Hugo post might consume the figure, suggest the standard image
  block:
  ```markdown
  ![Alt text](figures/sketchy/<slug>.jpg)
  ```
- Two follow-up offers:
  1. Re-render with a different `seed` if a hachure happens to land
     awkwardly.
  2. Tweak any panel's text by editing `<out>.layout.json` and re-running
     `scripts/render.js` — or adjust the look with `texture: false` (flat
     background) or `arrowLabels` (caption the connectors).

Do **not** auto-commit, push, or open a PR.

---

## Adding a new template

To support a new diagram type (e.g. `flowchart`):

1. Add `templates/flowchart.html` that:
   - Loads Rough.js and the Google handwritten fonts from
     `templates/comparison.html` (copy the `<head>` block verbatim).
   - Reads `window.LAYOUT`.
   - Draws into `<svg id="stage">`.
   - Sets `window.READY = true` after `document.fonts.ready`.
2. Document the type's schema in `references/layout-schema.md` under a
   new `## type: "flowchart"` section.
3. Add `examples/flowchart-example.json`.
4. Bump the description in this file's front matter to list the new
   template under `[type: comparison | flowchart]`.

No change to `scripts/render.js` is needed — it dispatches on the layout's
`type` key.
