# 2026-06-11 — New skill: `write-slides` (Quarto reveal.js decks)

Added a fifteenth Claude Code skill, `write-slides`, that turns a published post into a
branded **Quarto reveal.js** slide deck, and shipped the first reference deck on
`r_double_lasso`. The skill adopts Scott Cunningham's `beautiful_deck` *philosophy* (the
"Rhetoric of Decks") but renders to HTML, not Beamer.

## Why

The goal was to adopt the upstream `beautiful_deck` skill
(github.com/scunning1975/MixtapeTools) — but that skill is Beamer-first (LaTeX → PDF) and
designs a new theme per deck, whereas the house preference is **HTML slides branded to the
site**. The skill was first built on hand-authored reveal.js (CDN), then **pivoted to Quarto
reveal.js** (`format: revealjs`) to get its built-in features: the reveal.js-menu plugin,
chalkboard, speaker view, preview-links, overview, and slide numbers.

## What shipped

- **`.claude/skills/write-slides/`** — `SKILL.md` + 7 references
  (`rhetoric-of-decks.md`, `slide-archetypes.md`, `interview-questions.md`,
  `quarto-revealjs-guide.md`, `slide-mapping.md`, `verification-checklist.md`,
  `render-and-fix.md`) + 4 templates (`slides.qmd.tmpl`, `site-brand.scss`,
  `title-slide.html`, `smoke-test.js`).
- **`content/post/r_double_lasso/slides/`** — the reference deck: `slides.qmd` +
  `site-brand.scss` + `title-slide.html` → `quarto render` → `index.html` + `slides_files/`.
  A "Slides (HTML)" button was added to the post's `index.md`.
- **Docs** — `CLAUDE.md` + `README.md` (skill count 14 → 15; a new "Slides (HTML) link
  button" convention beside the "Slides (PDF)" one).

## The engine

A deck is authored as `slides.qmd` (`format: revealjs`), themed by a site-branded
`site-brand.scss` (built from Quarto's own revealjs SCSS variables — Cinzel display, IBM Plex
Mono, the steel/orange/teal/ink palette), with a custom `title-slide.html` partial that
renders a **key-result number strip** from a front-matter `key-results:` list. `quarto render`
produces `index.html` + `slides_files/`. The skill keeps the engine-independent craft
(audience triage, 3-act arc, assertion titles, pedagogical movement, MB/MC pacing,
Devil's-Advocate, the outline-checkpoint interview).

## Key decisions

- **Quarto-only.** The raw-HTML engine (CDN reveal, `index.html.tmpl`/`deck.js`/`slides.css`)
  was retired; the rhetoric/archetype/interview references were re-expressed as Quarto markdown.
- **Not `embed-resources`.** A single self-contained file was the goal, but
  `RevealChalkboard is not compatible with self-contained output` — so the deck ships
  `index.html` + `slides_files/` (chalkboard kept). Hugo serves this like the existing
  `tutorial.html`.
- **Fixed site brand**, never a per-deck theme.
- **The four layout requests** (after reviewing the first deck): a key-result title strip;
  figures bounded to the slide via Quarto's `auto-stretch` + `fig-align: center` (the raw-HTML
  version overflowed because it sized images in viewport units); section dividers and content
  centered via `center: true`; centered captions/comments with bullet lists kept left.
- **English-only**, riding with the English post like `web_app/` (no ES/JA copies).
- **"Slides (HTML)" button** — `url: slides/index.html` (relative, no trailing slash).

## Verification

`quarto render` reproduces the deck from the committed sources (`index.html` 44 KB +
`slides_files/` 8 MB). The Node static smoke test passes 13/13 (title strip with the real
numbers, chalkboard + menu, speaker notes, brand dividers, figures resolve). Hugo 0.111.3
serves the deck dir, a reveal asset, all figures (via `../`), and the post page as 200, with
the button href exactly `/post/r_double_lasso/slides/index.html`.

## Notes / gotchas

- **The deck's rendered output is committed — opposite of tutorials.** `.gitignore` excludes
  `tutorial.html`/`tutorial_files/` (readers render those locally), but the deck's
  `index.html` + `slides_files/` are **production assets Netlify serves** (Netlify runs Hugo,
  not Quarto), so they must be in git. Added `content/post/*/slides/.quarto/` to ignore only
  Quarto's cache. Captured in the skill (`render-and-fix.md` §11, `SKILL.md` Deliverables).
- **~8 MB `slides_files/` per deck** — reveal.js + the menu/chalkboard plugins + libs. The
  cost of Quarto + chalkboard + no-CDN; unavoidable while chalkboard blocks `embed-resources`.
- `…/slides/index.html` returns a **301** canonical redirect to the directory (a pass; the
  browser follows it).
- **Remaining manual check:** a visual browser eyeball of the rendered deck (centering, figure
  bounds, the number-strip styling, and the live menu/chalkboard/speaker-view) — the one thing
  not verifiable headless.
