# Interactive hero keynote on AhaSlides (EN, ES, JA)

**Date:** 2026-10-06

The homepage hero button "Keynote presentation" (`data/orbital.json`, `keynoteUrl`) now
opens an interactive AhaSlides version of the keynote in each language instead of the
Canva deck. The build sources are in `content/keynote/ahaslides/` (see its README).

## Decisions (from the author)

- Three decks, one per language, built from that language's Canva keynote; all pages kept.
- The hero link is replaced; the button labels stay the same.
- Used both on the website and live, so the default pace is *Audience (self-paced)* and
  the README says how to switch for a talk. No name field on join.
- Medium interactivity (10 to 14 activities), a mix of opinion slides and quizzes with
  30 s timers and a speed bonus; the deck ends with a leaderboard and an open question.
- Page images captured from the public Canva view (no PDF export).
- GIF pages animated as in the course decks.
- Spanish videos: the author uploaded the three Spanish-dubbed MP4s to YouTube.

## What was built

| Lang | Presentation | Audience link (hero) | Slides |
|---|---|---|---|
| EN | 10280670 | https://audience.ahaslides.com/qmvzg6qmgf | 38 |
| ES | 10280671 | https://audience.ahaslides.com/p6jnvvgxrb | 34 |
| JA | 10280672 | https://audience.ahaslides.com/1vzj8mb285 | 33 |

The hero uses the **audience** links, not the share links planned at first: a share link
(`presenter.ahaslides.com/share/...`) opens a read-only viewer with a "Copy" button,
while the audience link lets a visitor vote, pin and answer at their own pace.

- `capture.mjs` renders the Canva view headless (Playwright, 1920x1080 at scale 2), hides
  the viewer chrome and pauses the GIF videos on frame 0.
- `pages.py` maps the three decks by topic, because they differ in length and order (ES
  adds a data-sources infographic and a colors page; only EN has the BBC video, the
  poverty map and the appendix).
- `animate_pages.py` reuses the course clips and boxes; the overlay mask is limited to
  keep boxes (banners, McKinsey title and source line).
- Activities K1 to K12 plus K90 (leaderboard) and K91 (idea board); facts checked: Sao
  Paulo 2004 to 2021 (gap about the same), Howarth RGB legend, Togo in the BBC video
  (video description), more than 40,000 micro regions (McKinsey, also stated in the clip).

## Verification

- Each deck matches `deck_<lang>.json` slide for slide (`get_presentation_detail`); every
  quiz has exactly one correct option, a 30 s timer and the speed bonus.
- Japanese page images matched to the captures by image difference.
- GIFs animate in the editor and in the audience view.
- Audience view of each deck: self-paced navigation, no name on join, interface in the
  deck language; word cloud and pin slides answerable; videos play after ticking *Also
  show on audience's smartphones* on every YouTube slide (without it, self-paced visitors
  see "Please watch the video on the presenter's screen"). No test answers were
  submitted.
- Hugo production build passes; `/`, `/es/` and `/ja/` link to the new audience links.

## Gotchas found

- In the editor, picking a slide type while the editor is still loading can convert the
  selected slide instead of adding a new one (JA page 6 became a YouTube slide). After
  adding videos, check by API that the image count did not change.
- Imports and new slides land at the end of the deck when nothing is selected; place
  them with `move_slide`.
- `create_presentation(lang=...)` does not set the audience language; set it in
  Settings → *Presentation language* (a native select: typing into it picks the wrong
  language, set the option value instead).
- Scored quizzes ask for a nickname ("Join the game") even with *Collect audience info*
  off; it is the leaderboard name and cannot be disabled.
- The YouTube slide link is not returned in `curated_slides`; `move_slide` returns it
  (`youtubeLink`), or read it in the editor.
