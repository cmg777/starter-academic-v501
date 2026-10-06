# AhaSlides decks — the hero keynote (EN, ES, JA)

> **The procedure lives in [`.claude/docs/ahaslides.md`](../../../.claude/docs/ahaslides.md).**
> This file records only what is specific to these decks: the interactive version of the
> Canva keynote behind the homepage hero button "Keynote presentation", in three
> languages, built from **captures of the public Canva view** (no PDF export), with
> playable YouTube slides and animated GIF pages.

| Lang | Presentation | Join code | Audience link (hero `keynoteUrl`) | Slides |
|---|---|---|---|---|
| EN | `10280670` | `UY4MG` | https://audience.ahaslides.com/qmvzg6qmgf | 20 images + 4 videos + 14 interactive = **38** |
| ES | `10280671` | `5E2PJ` | https://audience.ahaslides.com/p6jnvvgxrb | 18 images + 3 videos + 13 interactive = **34** |
| JA | `10280672` | `S28S9` | https://audience.ahaslides.com/1vzj8mb285 | 17 images + 3 videos + 13 interactive = **33** |

Editors: `https://presenter.ahaslides.com/presentation/<id>`. Theme: Meeting. The hero
button (`data/orbital.json`, `keynoteUrl` per locale) links to the **audience** links
(where `ahaslides.com/<join code>` redirects): only there can a visitor vote and answer.
The share links (`presenter.ahaslides.com/share/...`, in `slide_ids.json`) open a
read-only slide viewer with a "Copy" button, which is not interactive. The Canva
originals are listed in `pages.py`.

## Two uses: website and live talks

- **Default: self-paced** (Settings → *Who takes the lead* → *Audience (self-paced)*).
  A visitor from the website clicks through alone; polls show results after voting and
  quizzes reveal the answer. No name is asked on join (Settings → *Collect audience
  info* off). Before the first scored quiz AhaSlides itself asks for a nickname ("Join
  the game") for the leaderboard; that prompt belongs to the quiz and cannot be turned
  off. The audience language is set per deck (Settings → *Presentation language*:
  English, Español, 日本語); `create_presentation` ignores its `lang` argument. *Filter
  profanity* (same panel) is on in all three decks, because the word cloud and the idea
  board are open to anyone on the web.
- **Videos play on the visitor device:** every YouTube slide has *Also show on
  audience's smartphones* ticked (editor, YouTube panel). Without it a self-paced visitor
  sees "Please watch the video on the presenter's screen".
- **Before a live talk:** Settings → *Who takes the lead* → *Presenter*, then Settings →
  *Reset results* if the website answers should not show. Present as usual (join code
  above). **After the talk, switch back to *Audience (self-paced)*,** or the website link
  only shows the slide the presenter left open.

## Source and pages

- **Source:** the three Canva decks (EN 24 pages, ES 21, JA 20). They differ in length and
  order, so `pages.py` names every page by **topic** (`TOPICS`), and each activity anchors
  to a topic; a deck without that page skips the activity (the BBC quiz exists only in
  English).
- **Capture, not export:** `capture.mjs` (Playwright, globally installed) opens the public
  view at 1920x1080 with device scale 2, hides the header, footer and cookie banner, pauses
  every video on frame 0 (so the GIF pages show their first frame), and saves one
  3840x2160 PNG per page into `build/<lang>/` with the page text in `text.json`.
  Navigation is the ArrowRight key: a click on the page also advances it.
- **Video pages become YouTube slides.** EN and JA use the Canva YouTube embeds; ES plays
  dubbed MP4 uploads in Canva, so the author uploaded them to YouTube (`6_ZhisUyDR4`,
  `1pgcTBuY1qg`, `39or8GgZgaU`). The fifth EN embed (`ki-hoy-3ea8`) and three JA embeds
  are in the design data but on no page, so they were left out.
- **GIF pages** (Las Vegas, Dubai and Playa del Carmen, McKinsey micro regions) are
  animated full-slide GIFs in all three decks (`animate_pages.py`, 2.3 to 3.1 MB each),
  built from the course clips in `content/courses/slides/ahaslides/build/clips/`.

## Activities (`activities.py`)

Fourteen in English, thirteen in Spanish and Japanese, written once and translated (ES
formal *usted*, JA です・ます; presenter notes in English):

| ID | After | Type | Answer |
|---|---|---|---|
| K1 | title | word cloud: what development means | |
| K2 | Sao Paulo photo | pin on image: the poorest part | |
| K3 | Sao Paulo photo | prediction poll: the gap by 2021 | (B, about the same, revealed next page) |
| K4 | outer space | scale: use of satellite data | |
| K5 | South Asia video | true/false: lights measure income directly | False |
| K6 | lights quiz page | pin on image: North Korea | |
| K7 | Howarth RGB app | quiz: why some lights are red | D, lit only in 2013 |
| K8 | WorldCover (ES: daytime) | quiz: what daytime images add | A, land cover |
| K9 | SDGs | ranking: goals that need small-region data | |
| K10 | combining data | poll: data to combine first | |
| K11 | BBC video (EN only) | quiz: which country sent cash | B, Togo |
| K12 | McKinsey GIF | quiz: number of micro regions | C, more than 40,000 |
| K90, K91 | Big Data and AI | leaderboard, then idea board (open question) | |

Quizzes: 30 s, faster answers score more. Polls have no timer. True/false sides are
renamed in ES (Verdadero/Falso) and JA (正しい/間違い); the default labels are English.

## Files

| File | What it is |
|---|---|
| `capture.mjs` | Canva view to `build/<lang>/pNN.png` + `text.json`. |
| `pages.py` | Canva links, topic map per language, YouTube map, GIF pages. |
| `activities.py` | **Source of truth** for the interactive slides, in three languages. |
| `animate_pages.py` | `build/animated/<lang>_p<N>.gif` from the captures and the course clips. |
| `make_pdfs.py` | `build/<lang>.pdf` (image pages only) for the editor import. |
| `build_deck_json.py` | Validates and writes `deck_<lang>.json` and the presenter copies `deck_<lang>.md`. |
| `build_payload.py` | Writes `payload_<lang>.json`: `create_slides` calls with resolved anchors. |
| `slide_ids.json` | AhaSlides IDs of every page, video and interactive slide, per language. |
| `images.json` | CDN URLs of the page images reused as pin backgrounds. |

`build/` and `payload_*.json` are gitignored; the folder is excluded from the Hugo build
(`config/_default/config.yaml`).

```bash
node capture.mjs https://canva.link/<id> build/<lang>   # only to recapture
python3 animate_pages.py && python3 make_pdfs.py         # only to re-import
python3 build_deck_json.py && python3 build_payload.py
```

## Build log

**2026-10-06 — first build.** Three presentations, 55 imported page images, 10 YouTube
slides, 40 interactive slides, 9 animated GIF pages. Verified with
`get_presentation_detail`: each deck in exactly the generated order, one correct option
and a 30 s timer on every quiz; the Japanese page images matched to the captures by image
difference (the import had no alt text yet). Two editor slips, both fixed: a YouTube pick
made while the editor was still loading converted the selected JA page 6 image into a
video slide (page 6 was re-imported as a one-page PDF and moved back with `move_slide`),
and imported or new slides land at the end when nothing is selected (moved with
`move_slide`). See `logs/2026-10-06-keynote-ahaslides.md`.
