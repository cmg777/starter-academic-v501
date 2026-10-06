# AhaSlides decks — *Introduction to regional development* (three parts)

> **The procedure lives in [`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md).**
> This file records only what is specific to these decks: the first ones built from a
> **Canva PDF** (not a Quarto deck), split into **three lectures**, with **playable YouTube
> slides**. The generators follow the FWL pattern (`content/post/python_fwl/ahaslides/`).

| Part | Presentation | Join code | Share link | Slides |
|---|---|---|---|---|
| 1. Why study regional development | `10276514` | `X0CIY` | https://presenter.ahaslides.com/share/1791258453174-40as7c668g | 24 images + 5 videos + 34 interactive = **63** |
| 2. Studying regional development from outer space | `10276515` | `PWCXU` | https://presenter.ahaslides.com/share/1791258454027-jgdiqqybab | 13 images + 8 videos + 33 interactive = **54** |
| 3. Standing on the shoulders of geospatial data science | `10276516` | `ZTR2I` | https://presenter.ahaslides.com/share/1791258454264-rgy13rxpeh | 25 images + 4 videos + 30 interactive = **59** |

Editors: `https://presenter.ahaslides.com/presentation/<id>`. Plan: Education Large (0 / 200
participants). Theme: Meeting (`#000000`, theme id 18468). Linked from the Regional
Development card on `/courses/` (EN, ES, JA).

## Source and page split

- **Source:** `../intro-regional.pdf`, 75 pages exported from the Canva deck
  (https://canva.link/zjtenpul5tzhqp2). The PDF has no speaker notes, so the short page
  labels in `pages.py` stand in for slide titles in `deck_part*.md`.
- **One lecture per outline section.** Each part opens with the title page (p1) and its
  outline page and closes with the closing page (p75):
  Part 1 = p1 to p28 + p75; Part 2 = p1, p29 to p47, p75; Part 3 = p1, p48 to p75.
- **Video pages become YouTube slides.** The 17 pages that embed a video in Canva are left
  out of the imported PDFs and replaced, at the same position, by an AhaSlides **YouTube**
  slide (editor only: New slide → Content → YouTube; the MCP has no video type). The
  YouTube IDs were read from the public Canva view and checked by title; `pages.py` has
  the map, with start times for p13 (3:40), p36 (0:21) and p74 (1:52). `deck_part*.md`
  says for each video whether it is core or optional and how much to play.

## Teaching design (2026-10-06)

GSID master's students, under 30, in person, 90 minutes per part, English, laptops.

- **About half of each class in activities.** Core activities: Part 1 about 38 min,
  Part 2 about 42 min, Part 3 about 33 min (plus videos); optional slides add 8 to 11 min
  per part. Every note starts with `CORE` or `OPTIONAL: skip if behind` and a time.
- **Same scoring as FWL:** 30-second timers (review round 20 s), speed bonus, a halfway
  and a final leaderboard; names required on join; Q&A on all slides; spinner cold calls
  that fill themselves with joined names; a duck-race raffle at the end of each part.
- **Hands-on stops:** Part 1, the data portals (open-ended, 8 min); Part 2, the night
  lights app (photo share of a screenshot, 8 min) and the Howarth RGB app (open-ended,
  6 min); Part 3, the Bolivia Colab notebook (short answer **Poroma**, the municipality with
  the lowest imds, 35.7; checked against the notebook data on 2026-10-06).
- **New types on top of the FWL set:** pin on image (Rio photo, world at night, North
  Korea), photo share, interactive image (SDG page, five pins), ranking, split the points.
  Their backgrounds are the imported page images, reused by URL from `images.json`.
- **Facts checked before use:** Rosling pairs (Shanghai = Italy, Guizhou = Pakistan,
  rural west = Ghana), Pixels of Progress (more than 40,000 micro regions), the Howarth
  RGB legend (red 2013, green 2003, blue 1993, read from p41), GeoDa users (p56).

## Files

| File | What it is |
|---|---|
| `pages.py` | Page labels, part membership, YouTube map, tool links. |
| `activities.py` | **Source of truth** for the 97 interactive slides (A*, B*, C*). |
| `images.json` | AhaSlides CDN URLs of four page images reused as activity backgrounds. |
| `make_part_pdfs.py` | Writes `build/part{1,2,3}.pdf` (Part 3 split in two: the upload tool takes 10 MB). |
| `build_deck_json.py` | Validates and writes `deck_part{1,2,3}.json` and the presenter copies `deck_part{1,2,3}.md`. |
| `build_payload.py` | Writes `payload_part{1,2,3}.json`: `create_slides` calls with resolved anchors, then property updates. |
| `slide_ids.json` | AhaSlides IDs: every page slide and every interactive slide, per part. |

`build/` and `payload_part*.json` are gitignored. The whole folder is excluded from the
Hugo build (`config/_default/config.yaml`), so the `.md` presenter copies never become pages.

```bash
python3 make_part_pdfs.py                       # only to re-import the images
python3 build_deck_json.py && python3 build_payload.py
```

## Before each class

1. Two-device dry run: join with a name, answer one slide of each type, drop a pin,
   upload a photo, spin a wheel, play one video, run the duck race.
2. **Reset results** (Settings → Reset results).
3. After class: Settings → *Who takes the lead* → *Audience (self-paced)* for review.

## Build log

**2026-10-06 — first build.** Three presentations, 62 imported page images, 17 YouTube
slides, 97 interactive slides. Verified with `get_presentation_detail`: each part in
exactly the generated order, one correct option on every pick-answer quiz, timers and
spinner fill set; names required in all three; editor spot checks of the pin, ranking,
photo share and interactive-image slides; share links 200. YouTube captions typed in the
editor did not persist (the field stays empty), so the deck relies on the video titles.
See `logs/2026-10-06-regional-ahaslides.md`.
