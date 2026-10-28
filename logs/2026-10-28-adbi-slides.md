# ADBI workshop talk: "Visible from Outer Space?" (2026-10-28)

New presentation for the ADBI Authors' Workshop (online, 30 October 2026, 10:20 JST,
15 minutes + Q&A), built with the `write-slides` skill adapted to a presentation bundle
(precedent: `20260721GSID`).

## What was added

- `content/presentations/20261030ADBI/` (slug `adbi-2026`): EN entry with the embedded deck,
  "Slides (HTML)" and "Slides (PDF)" buttons, `attendance: online`, and a Codex-generated
  `featured.webp` cover. ES/JA entries are full translations that link to the English deck.
- `slides/`: Quarto reveal.js deck (`slides.qmd` + verbatim `site-brand.scss` /
  `title-slide.html` + `deck.css`). It has 16 main slides (three messages, with the Tohoku
  section the longest; the counterfactual is called the "synthetic control" throughout),
  speaker notes with a running clock, a closing slide with one card per author, and 6 backup
  slides for Q&A. `slides.pdf` is a 23-page export made with headless Chrome `?print-pdf`.
- `slides/figures-src/`: data extracts (2.7 MB) from the chapter repository
  quarcs-lab/project2026i at `111def8`, the chapter's LaTeX tables, and `make_figures.py`,
  which redraws all 10 data figures in the deck's dark theme. The deck therefore does not
  depend on the source folder, which was 4 GB and is to be deleted.
- `config/_default/config.yaml`: content mount excludes `presentations/*/slides/figures-src/**`,
  so only the PNGs are published.
- `.gitignore`: `content/presentations/*/slides/.quarto/` and the temporary source folder.
- CV: new line in Recent Presentations; `static/media/CV.pdf` recompiled.

## Verification

- The deck renders, and the figures regenerate, with `project2026i/` moved out of the tree.
- Skill smoke test 13/13. Screenshots of all 23 slides at 1280×720 show no overflow.
- Hugo 0.111.3 production build: EN/ES/JA pages, deck, PDF and figures return 200;
  `figures-src/` returns 404. The list line reads
  `30 Oct 2026 / Asian Development Bank Institute (ADBI) Authors' Workshop / Japan (online)`.
- `i18n-parity.sh`: 0 missing. `audit-site.py`: 0 new problems (the 6 pre-existing broken
  references are in `python_dynamic_panel` reference materials).

## Note for local builds

While `content/presentations/20261030ADBI/project2026i/` still exists, **local** Hugo builds
fail: Hugo parses its Markdown files (`style_guide_carlos.md`: shortcode "embed" not found).
Netlify is unaffected because the folder is git-ignored. The verification build above ran
with the folder moved out of `content/`. Delete it as planned, then drop its `.gitignore` line.
