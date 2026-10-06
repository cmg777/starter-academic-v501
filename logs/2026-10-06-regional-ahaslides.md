# Regional Development: three interactive AhaSlides decks

The author added the Canva PDF of the Regional Development introductory lecture
(`content/courses/slides/intro-regional.pdf`, 75 pages) and asked for AhaSlides decks with
as much interactivity as the topic allows. Decisions from the Q&A: GSID master's students,
in person, English, laptops; **three 90-minute lectures, one per outline section, as three
presentations**; about half of each class in activities; FWL scoring (30 s timers, speed
bonus, leaderboards, names required, spinner cold calls, duck race); videos playable; all
new slide types allowed; course-card links in EN/ES/JA.

## What was built

| Part | Presentation | Join | Slides |
|---|---|---|---|
| 1. Why study regional development | 10276514 | X0CIY | 24 images, 5 videos, 34 interactive (63) |
| 2. Studying regional development from outer space | 10276515 | PWCXU | 13 images, 8 videos, 33 interactive (54) |
| 3. Standing on the shoulders of geospatial data science | 10276516 | ZTR2I | 25 images, 4 videos, 30 interactive (59) |

- **Images:** each part PDF (video pages removed) imported through the editor with
  *Import slides*. Part 3 (12.8 MB) was split in two because the browser upload tool
  takes at most 10 MB.
- **Videos:** the 17 Canva YouTube embeds were read from the public Canva view, confirmed
  by title with YouTube oEmbed, and added as editor-only YouTube slides at their pages
  (start times 3:40, 0:21 and 1:52 where Canva used them).
- **Interactive layer (97 slides):** QR join, word cloud before and after, confidence
  scale before and after, Q&A, polls, pick-answer quizzes, match pairs, categorise,
  correct order, fill-in-the-blanks, true/false, spinners, idea boards, 2x2 grids,
  open-ended exit tickets, leaderboards, duck races, and five types new to this site: pin
  on image, photo share, interactive image, ranking and split the points. Four hands-on
  stops: data portals, the night lights app (screenshot photo share), the Howarth RGB app,
  and the Bolivia Colab notebook (answer Poroma, checked against the data).
- **Settings:** timers, speed bonus, single-choice polls, spinner name fill by MCP; names
  required on join in all three by the editor; Q&A on all slides is the default.

## Files

- `content/courses/slides/ahaslides/`: `pages.py`, `activities.py`, `images.json`,
  `make_part_pdfs.py`, `build_deck_json.py`, `build_payload.py`, `slide_ids.json`,
  generated `deck_part{1,2,3}.json/.md`, `README.md`, `.gitignore`.
- `content/courses/slides/intro-regional.pdf` committed (published at
  `/courses/slides/intro-regional.pdf`).
- `config/_default/config.yaml`: `courses/slides/ahaslides/**` excluded from the build.
- Course cards (`content/{,es/,ja/}courses/_index.md`): one line with the three links.
- `.claude/docs/ahaslides.md` (PDF-only decks, several parts, YouTube slides, the new
  types) and the AhaSlides bullet in `CLAUDE.md`.

## Verification

- `build_deck_json.py` passes; a broken copy failed on a bad letter, em dash,
  contraction, wrong-part page, duplicate ID and missing spinner fill.
- `get_presentation_detail` for each part: order identical to `deck_partN.json`, exactly
  one correct option on every pick-answer quiz, timers and spinner fill set. Part 1 first
  had two videos one image late (anchored by image index instead of page) and was fixed
  with `move_slide`.
- Editor: 0 / 200 participants; pin on image, ranking, photo share, interactive image and
  YouTube slides render. Share links return 200.

## Animated pages (follow-up, same day)

The author asked to use the GIFs of the Canva deck. Five animations (Las Vegas, Dubai,
Playa del Carmen, the McKinsey micro regions, the Awesome GEE Africa layers) on pages 8,
9, 14 and 25 were downloaded from the shared Canva view as the MP4 clips Canva keeps, and
`animate_pages.py` rebuilt those pages as full-slide GIFs (0.7 to 3.1 MB). They replaced
the static images on Part 1 slides 18, 19, 32 and 47 through the editor (Change image);
slide IDs and order are unchanged (re-verified), and the GIFs play in the editor and the
public share view. Parts 2 and 3 have no animated pages.

## Still to do before class

Two-device dry run per part (join, answer, pin, upload, spin, play a video, duck race),
then Reset results. YouTube captions typed in the editor did not persist; the slides show
the video title from YouTube instead.
