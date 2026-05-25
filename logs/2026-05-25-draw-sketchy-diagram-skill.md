# Draw-sketchy-diagram skill + python_double_lasso application

**Date:** 2026-05-25
**Scope:** New Claude Code skill at `.claude/skills/draw-sketchy-diagram/`; first application to `content/post/python_double_lasso/`

## What changed

Added a new user-invocable skill for generating hand-drawn / whiteboard-style
diagrams as SVG + JPEG. The skill drives a Playwright-controlled headless
Chromium against a Rough.js template, uses Google handwritten webfonts
(Caveat / Kalam / Architects Daughter), and ships one template (`comparison`,
the 3-panel layout). It does **not** draw character illustrations / mascots
/ faces — that's illustration work, not pure code rendering.

The skill was iterated three times in one session:

1. **Initial scaffolding** — `SKILL.md`, four reference docs (`layout-schema.md`,
   `rough-options.md`, `typography.md`, `verification-checklist.md`),
   `scripts/render.js`, `templates/comparison.html`, `examples/comparison-example.json`.
2. **Audit + polish** — fixed five stale `render.py` references (the script
   is `render.js`); reconciled default `seed` to `42` everywhere; added
   genuine word-wrap inside panels (was per-line `<text>` with no wrap);
   extended palette from 4 to 7 accents (`blue`, `orange`, `teal`, **`purple`**,
   **`green`**, **`red`**, `ink`); added `theme: "chalkboard"` for dark-mode
   rendering; swapped PNG output for JPEG@85 (~56 % smaller files at the
   same 2× device scale).
3. **Icons + deeper blue** — added a required `icon` field per panel
   (renderer exits 4 with a panel-naming error if missing); authored a
   hand-drawn icon catalog of 15 Rough.js mini-illustrations across four
   families (selection / chart / verdict / modeling); deepened the
   chalkboard background from `#0f1729` to **`#0a1d3a`** so it aligns with
   the site's heading blue `#1a3a8a`.

## Icon catalog

| Family               | Icons                                                                                              |
|----------------------|----------------------------------------------------------------------------------------------------|
| Selection            | `kitchen-sink`, `funnel`, `double-funnel`                                                          |
| Data / chart         | `bar-chart`, `scatter`, `line-chart`, `histogram`                                                  |
| Decision / verdict   | `check`, `x-mark`, `exclamation`, `target`                                                         |
| Modeling             | `tree`, `brain`, `gears`, `scale`                                                                  |

All icons are drawn from Rough.js primitives (`rc.line`, `rc.rectangle`,
`rc.circle`, `rc.ellipse`, `rc.path`) using the panel's accent stroke and
no fills — so they read on both `paper` and `chalkboard` themes. Adding a
new icon is one `case` branch in `templates/comparison.html`'s `drawIcon()`
dispatcher plus one row in `references/icons.md`.

## First application: python_double_lasso

`content/post/python_double_lasso/figures/sketchy/methods.{svg,jpg,layout.json}`
illustrates the post's three core estimators using the new `chalkboard`
theme:

| Panel | Accent | Icon            | Body story                                       |
|-------|--------|-----------------|--------------------------------------------------|
| 1     | red    | `kitchen-sink`  | All 284 controls thrown in → +234 % on murder    |
| 2     | orange | `funnel`        | One LASSO + post-OLS — simple but fragile        |
| 3     | blue   | `double-funnel` | Two LASSOs + union of selections — recommended   |

JPEG output: 707 KB at 2× scale (under the 1 MB target for blog-post imagery).
The `methods.layout.json` is committed alongside the rendered files so the
diagram is reproducible — any future edit just needs the JSON and the same
`scripts/render.js` invocation.

## Skill architecture

```
.claude/skills/draw-sketchy-diagram/
├── SKILL.md
├── scripts/
│   └── render.js                    # Playwright + Chromium headless renderer (deterministic)
├── templates/
│   └── comparison.html              # Rough.js + webfonts; reads window.LAYOUT
├── examples/
│   └── comparison-example.json
└── references/
    ├── layout-schema.md             # JSON schema (themes, accents, required fields)
    ├── rough-options.md             # Rough.js tuning cheat sheet
    ├── typography.md                # Webfont + non-ASCII glyph notes
    ├── verification-checklist.md    # 4-step post-render checks
    └── icons.md                     # 15-icon catalog with semantic gloss
```

The skill follows the project-wide three-phase pattern: (1) confirm scope
via `AskUserQuestion`, (2) write layout JSON + render, (3) report
deliverables with two follow-up offers (re-render with different seed,
edit JSON + re-run).

## Determinism

Same `seed` produces byte-identical SVG on every render (`render.js`
propagates the seed into Rough.js's RNG). Verified by re-rendering
`methods.layout.json` twice and diffing — identical. Bumping the seed
gives the same diagram with different wobble, useful when one panel's
hachure happens to land an ugly line.

## Files added

```
.claude/skills/draw-sketchy-diagram/
├── SKILL.md
├── scripts/render.js
├── templates/comparison.html
├── examples/comparison-example.json
└── references/
    ├── icons.md
    ├── layout-schema.md
    ├── rough-options.md
    ├── typography.md
    └── verification-checklist.md

content/post/python_double_lasso/figures/sketchy/
├── methods.layout.json
├── methods.svg
└── methods.jpg
```

## Caveats

- `brain` and `gears` icons read weakly at 56 px (brain → twin circles;
  gears → stylized sun). Functional in context but candidates for a
  future visual refinement.
- The fallback layout in `comparison.html` uses `⊥`, `≈`, `→` glyphs —
  these render fine on macOS via the system fallback cascade but may
  tofu on a bare Linux render box. Documented in
  `references/typography.md` under "Non-ASCII glyphs."
- Online-only fonts by default (Google Fonts CDN). For offline /
  hermetic-CI rendering, embed the woff2 files in `templates/fonts/` per
  the "Offline fallback" section of `typography.md`.

## Next steps (not done in this session)

- Paste the diagram into `python_double_lasso/index.md` (§3 or §11) using
  the suggested Hugo image block — left to the user since the skill is
  intentionally standalone.
- Optional second template (`flowchart`, `concept-map`, or `timeline`) —
  scaffolded by adding `templates/<type>.html` + an `examples/` entry +
  a section in `layout-schema.md`. The renderer dispatches on `type`
  with no code changes.
