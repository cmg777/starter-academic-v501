# 2026-10-03 — python_did101: revised slide deck and AhaSlides interactive deck

Third step of bringing `content/post/python_did101/` up to the `python_fwl` feature set. Still to
do: podcast/video embeds, the AI slides PDF and the Quarto bundle update.

## Slides (`slides/`)

Revised to the audited post as a teaching deck (outline approved by the author before writing):
21 → **33 printed pages** (1 title, 5 dividers, 27 `##` slides). Title strip unchanged
(25.32 · +43% · 0 significant pre-trends).

- **Five "Before you look" cue slides** (`#1a3a8a`), mirroring the post's five predict cards: what
  the comparison schools did (B), fixed effects vs `treated`/`post` (A), adding `female_share` (C),
  the largest of four SEs (C), what the event study should show (A). Each cue's notes say
  "Answer on the next slide: X … (AhaSlides interactive In follows.)"; each reveal's notes begin
  "The answer to the vote".
- **New "Five tempting misreadings" section** (divider + one myth/truth slide per misconception
  card in the post).
- Event-study panel slide moved before the event-study plot; notes updated for the 25.32 vs 25.315
  rounding, CRV3 as a jackknife, the 10 treated clusters, bad controls and staggered adoption.
- Theme refreshed to the current `site-brand.scss` template (adds the Mermaid edge-label rule) and
  `mathjax-fonts.html` added (TeX web fonts, as in `python_fwl`). The orphaned old theme CSS in
  `slides_files/` was removed.
- `slide-audit.cjs`: 33 slides, 0 raw LaTeX, 0 overflow, branding checks pass; 7 slides exceed 60
  words, all dominated by equations, tables or code. All 33 printed pages inspected.

## AhaSlides (`ahaslides/`, deck `10254213`)

Built per `.claude/docs/ahaslides.md`: the deck printed to a 33-page PDF from a local server,
imported through the editor ("Import slides"), theme Meeting (18468). Five scored quizzes
(`pick_answer_quiz`) created with `insert_after_slide_id` after the cue images (pages 8, 14, 16,
18, 23, confirmed from the AI alt-text), landing at positions 9, 16, 19, 22, 28 of 38. Generators
copied from `python_panel_intro` and adapted; they validate titles, notes, cue options and
positions against `slides.qmd`. Options lettered and sent reversed; the editor shows quiz 1 as
A, B, C with B correct. Share link (slide notes off) returns 200 and is linked from the post as
"Interactive slides (AhaSlides)". `payload.json` is gitignored (new `content/post/python_did101/.gitignore`).

**Free plan:** the author accepted a 3-participant cap in advance, but with five quizzes a fresh
reload about ten minutes after creating them still read 0 / 50 ("up to 50 live participants")
with no crowns. Recorded as one reading in `ahaslides/README.md`; check again before teaching.
