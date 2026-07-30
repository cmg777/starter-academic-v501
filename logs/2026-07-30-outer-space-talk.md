---
title: "Talk page: Predicting and monitoring local development from outer space (date/venue TBA)"
date: 2026-07-30
---

# Talk page for the Bolivia SDG / satellite-views presentation

Added a trilingual talk page for the deck published at
<https://quarcs-lab.github.io/project2026e-slides/> ("Predicting and monitoring local development
from outer space — Evidence from the Bolivian municipalities"). The underlying paper predicts
fifteen SDG indices for the 339 Bolivian municipalities from two satellite views (nighttime lights
and AlphaEarth daytime embeddings) with a Bayesian-tuned random forest, then combines both views for
spatial-dependence monitoring.

**The event name and date were not confirmed when this page was created**, so the page went live with
deliberate placeholders (see the checklist below).

## What was added

- `content/event/20261231TBA/index.md` — English event page.
- `content/es/event/20261231TBA/index.md` — full Spanish translation (neutral LatAm, formal *usted*).
- `content/ja/event/20261231TBA/index.md` — full Japanese translation (です・ます).
- `featured.jpg` (1600x900) in all three bundles — a screenshot of the deck's title slide, with the
  reveal.js controls/menu/progress bar hidden via injected CSS, cropped to 16:9.
- `content/cv/main.tex` — new first entry under `\section{Recent Presentations}`, plus recompiled
  `static/media/CV.pdf`.

## Placeholder choices (and why)

| Field | Placeholder | Rationale |
|---|---|---|
| Folder | `20261231TBA` | Keeps the repo's `YYYYMMDD<ABBREV>` folder convention; `TBA` makes the unconfirmed status obvious in the file tree. |
| `date` | `2026-12-31T00:00:00Z`, `all_day: true` | Events sort `ByDate.Reverse`, so this places the talk first on `/event/` and inside the homepage top-3 "Recent & Upcoming Presentations" widget. `all_day: true` suppresses a meaningless `00:00` time. |
| `slug` | `local-development-outer-space` | Permalinks are `event: '/talk/:slug/'`, so the URL is `/talk/local-development-outer-space/` instead of `/talk/20261231tba/`. **This slug must survive the folder rename** so the published link never breaks. |
| `event` | "Conference presentation — venue and date to be announced (2026)" | Honest to a reader rather than inventing a host institution. |
| `location` | "To be announced" | Renders as `December 31, 2026 · To be announced` in the card meta line. |
| `publishDate` | `2026-07-30` (today) | Now-or-earlier, so the page is visible in the production build. |

## Slides wiring

The deck lives in its own repo (GitHub Pages), so it is **not** vendored into the event bundle — the
opposite of `content/event/20260721GSID/`, whose Quarto deck is committed under `slides/`. Here
`url_slides` and the body iframe both point at the same absolute external URL, and — because there is
no local `slides/` bundle — the ES/JA bodies use that identical URL too (the GSID
relative-vs-absolute split does not apply).

## Checklist for when the venue and date are confirmed

1. Rename the folder in **all three** languages: `content/{,es/,ja/}event/20261231TBA/` →
   `<YYYYMMDD><ABBREV>/`. Keep `slug: "local-development-outer-space"` unchanged.
2. Set the real `date:`. If a start time is known, switch to `all_day: false` and optionally add
   `date_end:` (currently every other event keeps `date_end` commented out).
3. Replace the venue text in `event:`, `location:`, and `summary:` — **in EN, ES and JA**.
4. Fill `event_url:` if the conference has a page (identical in all three languages).
5. Update the `\cventry` in `content/cv/main.tex` (replace "Conference presentation (venue to be
   announced)" and `TBA`, and the `% Date TBA` comment), then
   `cd content/cv && latexmk -pdf main.tex && cp main.pdf ../../static/media/CV.pdf`.
6. Re-run `./scripts/i18n-parity.sh --strict-assets` and rebuild with `--buildFuture`.

## Possible follow-up (not done)

No `content/publication/` entry was created for the underlying article — worth adding once it has a
preprint URL or DOI, at which point `url_pdf`/`url_code` on this talk page could also be filled in.
