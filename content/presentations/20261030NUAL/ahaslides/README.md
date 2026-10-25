# AhaSlides deck — NUAL keynote (2026-10-30)

> **The procedure lives in [`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md).**
> This file records only what is specific to this deck: the interactive version of the
> keynote "AI-Assisted Learning and Research" at the Annual Meeting of the Nagoya
> University Alumni Association, Thailand Branch (Thammasat University, Bangkok).

| Presentation | Join code | Audience link (site button) | Slides |
|---|---|---|---|
| `10482865` (folder Website, `141830`) | `MKY1F` | https://audience.ahaslides.com/mcro9daa2x | 30 images + 4 YouTube + 6 interactive = **40** |

Editor: https://presenter.ahaslides.com/presentation/10482865. Theme: Meeting. Language:
English. The slide order and the presenter notes are in [`deck.md`](deck.md).

## Two uses: live talk, then the website

- **Live on 2026-10-30 (current setting):** Settings → *Who takes the lead* →
  *Presenter*. The audience joins at `ahaslides.com/MKY1F` or through the QR slide
  (slide 2). No names are collected; Q&A is open on all slides, anonymous, with the
  profanity filter on. Plan limit: 200 live participants.
- **After the talk:** Settings → *Who takes the lead* → *Audience (self-paced)*, so the
  website button lets visitors click through alone. Keep or clear the live answers with
  Settings → *Reset results*. Until the switch, a website visitor sees only the slide
  the presenter left open.
- YouTube slides have *Also show on audience's smartphones* ticked (the default for
  new YouTube slides on 2026-10-25), so they play on visitor devices in self-paced mode.

## Source and pages

- **Source:** `../slides.pdf`, the 34-page Canva export (1440x810) of
  https://carlos-mendez.my.canva.site/ai-assisted-learning-and-research-tool-integration-and-verification.
  `make_pdf.py` writes `build/import.pdf` (30 pages, video pages removed), imported with
  the editor's *Import slides*.
- **Videos** (`pages.py`, `VIDEOS`): pages 10, 17, 20 and 32 are YouTube slides at the
  same positions. IDs were read from the links on the Canva site and confirmed through
  YouTube oEmbed. Page 16 is a screenshot of the metricsAI video page, not an embed, so
  it stays an image.
- `slide_ids.json` maps every page and activity to its slide ID.

## Activities (`activities.py`)

Light, anonymous and untimed (about six minutes in total): a join QR (after the
title), a word cloud (after the agenda), a poll on the production and verification
trade-off (after page 4), a two-statement rating scale (closing the learning section,
after page 21), and an open-ended take-away plus Q&A (after the concluding remarks).

`python3 build.py` validates the wording, writes `deck.json`, `deck.md` and
`payload.json` (one `create_slides` call per anchor, with anchor IDs from
`slide_ids.json`).

**Found while building (2026-10-25):** `poll` now rejects plain-string options and
needs `{"text": ...}` objects, and those options **display in payload order**. The
reverse-order rule in `.claude/docs/ahaslides.md` did not hold for this deck. The first
poll was sent reversed, displayed backwards, and was soft-deleted and recreated.
