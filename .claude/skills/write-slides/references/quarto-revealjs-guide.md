# Quarto reveal.js guide

How a deck is built and what every knob does. The deck is authored as a `.qmd` and rendered
by the **Quarto CLI** (`/Applications/quarto/bin/quarto`, 1.8.27+) to a reveal.js HTML deck
that Hugo serves from the post bundle. Read this in Phase 3.

---

## The files and the render

| File | Role | Per-run |
|---|---|---|
| `slides.qmd` | The deck source (`format: revealjs`). Front matter = engine config; body = the slides. | **Composed per post** from `slides.qmd.tmpl` + the archetypes. |
| `site-brand.scss` | The revealjs theme (brand palette/fonts/archetype styling). | **Copied verbatim** from `templates/site-brand.scss`. |
| `title-slide.html` | A Quarto title-slide **partial** that renders the key-result number strip. | **Copied verbatim** from `templates/title-slide.html`. |

Render (from the `slides/` dir):
```bash
/Applications/quarto/bin/quarto render slides.qmd
```
→ `index.html` + `slides_files/` (reveal.js + plugins + libs, ~8 MB). Figures are referenced
in place as `../<slug>_*.png` (Quarto keeps the relative ref; Hugo resolves it). The `.qmd`,
`.scss`, and `.html` partial ride along in the bundle as inert resources (like the existing
`tutorial.qmd`/`tutorial_files/`).

---

## Why NOT embed-resources (single file)

`embed-resources: true` would inline everything into one `index.html`, BUT **RevealChalkboard
is incompatible with self-contained output** (`quarto render` errors out). Because chalkboard
is a core feature, the deck ships **`index.html` + `slides_files/`** instead. This is proven
to serve correctly by the `content/post/r_double_lasso/tutorial.html` precedent. (If a deck
ever drops chalkboard, `embed-resources: true` becomes available again.)

---

## Front-matter config (in `slides.qmd`)

The validated block lives in `templates/slides.qmd.tmpl`. Key options:
- `output-file: index.html` — render to `index.html` (not `slides.html`).
- `theme: [default, site-brand.scss]` — light reveal base + the brand layer.
- `template-partials: [title-slide.html]` — the custom title slide (number strip).
- `center: true` — **vertical-centers every slide** → centred dividers + strategic white space.
- `slide-number: c/t`, `progress: true`, `transition: fade`, `width: 1280`, `height: 720`.
- `fig-align: center` + `auto-stretch: true` — centre + bound figures (no overflow).
- `highlight-style: github` — light code highlighting.

---

## Features (all on by default) and their keys

| Feature | Front matter | Key |
|---|---|---|
| reveal.js-menu plugin | `menu: true` | **M** |
| Chalkboard (draw on slides) | `chalkboard: true` | **B** (board), **C** (chalk) |
| Speaker view (notes window) | (notes plugin always on) | **S** |
| Overview (slide grid) | `overview: true` | **O** / **Esc** |
| Slide number | `slide-number: c/t` | — |
| Preview-links (open external links inline) | `preview-links: auto` | — |
| Fullscreen | (built in) | **F** |
| Help (all shortcuts) | (built in) | **?** |

---

## Authoring mechanics

- **Slides:** `##` = a content slide (its heading is the assertion title); `#` = a section
  divider. See `slide-archetypes.md`.
- **Math:** write **LaTeX, never literal Unicode** (`$\hat\alpha$` not `α̂`). Rendered by
  **MathJax** (Quarto revealjs's default — no `html-math-method`; reveal.js is local but math
  needs a network; why not KaTeX → `render-and-fix.md §12`). **No Goldmark** here, so `index.md`
  escaping (`\\$`, `\_`) does **not** apply. The Unicode→LaTeX table + mixed-numbers +
  notes-stay-Unicode rules are the canonical `slide-mapping.md §Math symbols → LaTeX`.
- **Code:** ` ``` {.r code-line-numbers="2-3|5"} ` highlights (without executing) and reveals
  line-groups as fragments. Use `.r` / `.python` / `.stata`.
- **Figures:** `![caption](../<slug>_fig.png)` — `auto-stretch` bounds, `fig-align` centres.
- **Columns:** `:::: {.columns} ::: {.column width="50%"} … ::: ::::`.
- **Speaker notes:** `::: {.notes} … :::`.
- **Reveals:** `. . .` (pause), `::: {.incremental}` (list), `{.fragment}` (element).
- **Title slide:** the partial renders title → subtitle → the **key-result strip** (front-matter
  `key-results:`, a list of `{num, cap}`; theme colours the three numbers orange/teal/steel) →
  the **hyperlinked author** (`deck-author` + `deck-author-url`) → the **university**
  (`institute`) → the **date** (`date: today`, `date-format: long`).
- **Dividers / dark slides:** `{.divider background-color="#…"}` (white centred) or
  `{background-color="#141413"}` (reveal auto-adds `has-dark-background`; the theme flips text
  to light).

---

## The 4 layout requirements → how they're met

| Requirement | Mechanism |
|---|---|
| Title slide has a key visual | `title-slide.html` partial + `key-results` → the number strip |
| Figures respect slide margins | Quarto **`auto-stretch`** (default) + `fig-align: center` + a `max-width:100%` SCSS guard — **no viewport units** |
| Section dividers centred (middle of slide) | `center: true` + `.divider` class on the `#` heading |
| Strategic white space; centred figures/tables/captions | `center: true` (block centred) + SCSS centres `figcaption` and makes `.comment` a centred **`display:block`** (a `[…]{.comment}` span is inline, so it needs block to centre); lists stay left |

---

## PDF export (manual, not built)

The skill does not generate a PDF. reveal.js exports one in the browser: open the deck, append
**`?print-pdf`** to the URL, then Print → Save as PDF (Chrome headless is installed, so this
works). The deck's chalkboard/menu don't interfere with print mode.

---

## Hugo serving

Hugo serves the page-bundle resources as-is: `/post/<slug>/slides/` → `index.html`;
`/post/<slug>/slides/slides_files/…` → the reveal assets; `../<slug>_*.png` → the post's
figures at `/post/<slug>/`. The button uses `url: slides/index.html` (relative, **no trailing
slash** — a trailing slash 404s; see `render-and-fix.md`). Note `…/slides/index.html` returns
a **301** canonical redirect to the directory (which 200s) — that's a pass.
