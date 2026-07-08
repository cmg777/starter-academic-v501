# 2026-07-08 — GSID seminar (Jul 21 2026): "Data Science, Econometrics, and Research in the Age of AI"

A native Quarto reveal.js deck for Carlos's **July 21, 2026 seminar at GSID, Nagoya University**,
presented as an **event** (`content/event/20260721GSID/`) with an embedded deck.

## History of this deliverable

1. Built as a clean, **light-branded, tool-centric** deck via the `write-slides` machinery
   (Learn/Analyze/Research title strip; custom HTML/CSS diagrams — the production-vs-verification 2×2,
   the NotebookLM fan-out, the Bolivia flow, the Learn→Analyze→Research triad; a "how do we prove it's
   right?" ethos slide). Originally on a companion post.
2. Recast as an **event** and, per the user, **faithfully rebuilt** from the 34 exported Canva slides
   (dark, full-bleed images) — which the user then disliked (too close to the NUAL keynote).
3. **Final (current):** restored the clean tool-centric deck and **added 4 illustrative screenshots**
   cropped from the Canva slides. The companion post + the malformed `20260708GSID ` source folder were
   removed earlier.

## What exists now

- **Event** `content/event/20260721GSID/index.md` (+ full **ES/JA** translations). Title "Data Science,
  Econometrics, and Research in the Age of AI"; subtitle "Production, Verification, and Tool Integration";
  `event:` = Seminar, GSID, Nagoya University; `date` 2026-07-21, all-day; not featured. Body embeds the
  deck in a responsive iframe (English body relative `slides/index.html`; ES/JA absolute
  `/event/20260721GSID/slides/index.html`) + a full-screen link; `url_slides` set. Abstract matches the
  clean tool-centric deck. `featured.jpg` = the deck's **light** title slide.
- **Deck** `content/event/20260721GSID/slides/` — the clean deck (`theme: [default, site-brand.scss]` +
  `title-slide.html` key-result strip). **32 slides**: 3-act arc (trade-off → three tools → integrated
  workflow) with 4 custom CSS diagrams, plus **4 framed screenshot slides**:
  - `img/shot-notebooklm.png` — the metricsAI Spotify "NotebookLM Deep Dives" podcast (NotebookLM section)
  - `img/shot-colab.png` — the metricsAI Colab notebook w/ AI Summary (Colab section)
  - `img/shot-github-repo.png` — the `responsible-ai-assisted-research-101` repo (GitHub section)
  - `img/shot-github-verify.png` — 800-line dump vs 12-line bounded diff + commit history (GitHub section)
  Screenshots were **cropped from the Canva slides** (18/8/25/27.png) with Playwright `clip` to drop the
  purple-pill framing, and are framed as insets via a `.reveal .slides img` border/shadow rule.
  Bolivia keeps its custom flow diagram (no Canva screenshot exists for it).

## Verification

- `quarto render` clean → `index.html` (54 KB) + `slides_files/`; 32 slides; Learn/Analyze/Research strip;
  date "July 21, 2026"; all 4 `img/shot-*.png` resolve; no unresolved markers.
- Playwright eyeball: light title, the 4 diagrams, and all 4 screenshot slides (crops legible, framed,
  clean on white) — all good.
- i18n parity: events EN/ES/JA trio present (0 gaps).
- Full Hugo ≥0.96 serve not run locally (only 0.84.2); deck is a page-bundle resource served as-is
  (tutorial.html precedent); event URL preserves case → `/event/20260721GSID/slides/index.html`.

## Notes
- The 34 Canva source PNGs are no longer kept in the bundle (only the 4 crops); re-exportable from Canva.
- Screenshot picks are easily swapped (NotebookLM 18↔13 tutor; Colab 8↔10; add/drop the 2nd GitHub shot).
