# AhaSlides interactive decks

Turn an existing Quarto reveal.js deck into an **AhaSlides** presentation: the content
slides are images of the real Quarto slides, and AhaSlides supplies only the live
audience layer.

**Trigger:** "Make an AhaSlides deck for `<post slug>`" / "Add interactive slides to
`<post>`" / any request to put a deck on AhaSlides.

**Worked reference implementations** — their `README.md`s record each deck's specifics;
this file is the procedure:

- `content/post/python_bridge_impact/ahaslides/` (deck `10040213`) — the first build, with
  the full narrative of why the image architecture exists.
- `content/post/python_sc_bayes_spatial/ahaslides/` (deck `10042312`) — the second, built
  from this doc. Its generators add real validation, including a check that `deck.md`'s
  titles still match `slides.qmd`. Read its free-plan section before promising a cap.
- `content/post/python_fwl/ahaslides/` (deck `10198190`) — the third, and since 2026-10-06
  the **reference for paid-plan decks**: 35 interactive slides of 18 types, defined in
  `activities.py` (exact MCP bodies + settings + notes) and built by generators that read
  titles and notes straight from `slides.qmd`, validate every type, and letter and reverse
  the options (see *Hard constraints*). **Copy `activities.py` + its generators for new
  decks.**
- `content/post/python_panel_intro/ahaslides/` (deck `10245137`) — the fourth. Its
  "Before you look" cues were added to `slides.qmd` for the deck (mirroring the post's
  predict cards). Rebuilt for the paid plan on 2026-10-06 with the FWL generators (37
  interactive slides): the second example of the `activities.py` pattern, with the cue
  quizzes kept in a `CUE_QUIZZES` list and merged by page.
- `content/courses/slides/ahaslides/` (decks `10276514`, `10276515`, `10276516`) — the
  fifth, and the reference for **a deck that is not a Quarto deck**: a 75-page Canva PDF
  for a course, split into **three presentations** (one per lecture), with the Canva
  YouTube embeds rebuilt as **playable YouTube slides** and five more types (pin on image,
  photo share, interactive image, ranking, split the points). Its `pages.py` replaces
  `slides.qmd` as the page source. See *PDF-only decks, several parts, videos* below.
- `content/keynote/ahaslides/` (decks `10280670` EN, `10280671` ES, `10280672` JA) — the
  sixth: the homepage hero keynote in three languages, **self-paced for website
  visitors**, built from **captures of the public Canva view** (no PDF), with one
  activity list translated and anchored by topic. See *Canva capture, three languages,
  self-paced* below.

---

## The architecture — do not deviate

**Content slides = images. Interactivity = native AhaSlides types.**

AhaSlides cannot reproduce a Quarto deck through its API. Its content slide types strip
bold runs, flatten tables to bullets, drop LaTeX, lose the typography, and allow only
one deck-wide background colour (so per-act divider colours are impossible). Its actual
value is the audience layer. So render the deck to images and let AhaSlides do only what
it is good at.

| Layer | How |
|---|---|
| Content slides | render `slides.qmd` → PDF → **import through the editor UI** |
| Interactive slides | native types via MCP: quizzes (`pick_answer_quiz`, `short_answer_quiz`, `correct_order_quiz`, `match_pairs_quiz`, `categorise_quiz`, `marketplace/true-or-false`, `marketplace/fill-in-the-blanks`), opinion (`poll`, `word_cloud`, `scale`, `open_ended_survey`, `ideaBoard`, `q&a`, `marketplace/two-by-two-grid-v2`, `marketplace/draw-answer-v2`), and game/utility (`spinner_wheel`, `leaderboard`, `qr_code`, `marketplace/duck-race`); place- and image-based (`pinOnImage`, `marketplace/image-show`, `marketplace/interactive-images`) and priority (`ranking`, `marketplace/budget-allocation-v2`) |
| Videos | editor-only **YouTube** slide at the video page position (no MCP type) |

---

## Prerequisites

- The post already has a rendered Quarto deck at `content/post/<slug>/slides/` and it is
  **deployed** (render from the published URL — self-contained and guaranteed current).
  If there is no deck yet, run `/project:write-slides <slug>` first.
- The AhaSlides MCP is connected:
  `claude mcp add ahaslides --scope user --transport http https://mcp.ahaslides.com/mcp`,
  then `/mcp` → **ahaslides** → **Authenticate** (OAuth, no API key). A newly added
  server is invisible to the running session — the user must `claude --continue`.

---

## Procedure

### 1. Render the deck to PDF

Reveal's own print mode gives exactly one page per slide, fragments flattened to final
state. Work in the scratchpad, never in the repo:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw --virtual-time-budget=40000 \
  --print-to-pdf=deck.pdf \
  "https://carlos-mendez.org/post/<slug>/slides/?print-pdf&pdfSeparateFragments=false"
```

Use the **published** URL when the deck is deployed — self-contained and guaranteed to
match what readers see. A local `hugo server` URL
(`http://localhost:1313/post/<slug>/slides/?print-pdf&pdfSeparateFragments=false`) works
identically, and is the right choice immediately after `write-slides` when the deck has
not been pushed yet.

**Check `pdfinfo deck.pdf` page count equals the deck's `##` slide count + `#` dividers
+ 1 title.** (`Reveal.getTotalSlides()` in the browser is the authoritative number.)
This is the scriptable alternative to the in-browser Print → Save as PDF route; both are
listed in the `write-slides` skill's Phase 5 step 2.

### 2. Presentation + theme

Create with `create_presentation_tool`, or reuse an existing one (see *Rebuild in place*).
Themes are **official presets only** — no custom hex, and no per-slide colour. Since the
content is now images, the theme only affects the interactive slides: pick the preset
nearest the deck's background so they feel continuous. This site's decks are `#0f1729`
navy, so a dark preset ("Meeting", `#000000`) is right.

### 3. Import the PDF (browser, not MCP)

`upload_image` **rejects PDFs** (`content-type: application/pdf`). The PDF can only enter
through the editor UI:

1. Open `https://presenter.ahaslides.com/presentation/<id>` and **wait** — the editor is
   slow to boot; poll for the string `New slide` before acting.
2. Click the **Import** icon beside "New slide" (or the *Import — PPT, PPTX and PDF* card
   on an empty deck).
3. `read_page` → find `type="file"` → `file_upload` with the PDF path. Never click a file
   input; that opens a native dialog.
4. Select **"Import slides"**. **Not** "Import and generate slides with AI" or "Generate
   interactive slides" — those rewrite the content, defeating the entire purpose.
5. Click **Start**, wait for *"Your slides are ready!"* (about a minute, plus an AI pass
   adding alt-text). **Wait for the upload spinner to finish first** — the dialog
   re-renders when the upload completes, and a Start click during that transition is
   silently lost (no slides, no error). Click Start by element ref, then confirm the
   slide count with `get_presentation_detail_tool` before doing anything else.
6. **Spread the correct letters** across the quizzes before rendering the cue slides; a
   deck whose answers are mostly one letter teaches the room the pattern.

Limits on the free plan: **50 MB and 100 slides** per import. Each page becomes a slide
holding one Image block at exactly **1280×720** — genuinely edge to edge.

### 4. Author the interactive slides

Define them in `content/post/<slug>/ahaslides/activities.py` (copy the `python_fwl`
one): each activity holds its anchor page, a `core`/`opt` tier, a time estimate, the
exact `create_slides` body, its `update_slide_properties` settings and its notes.
`build_deck_json.py` reads titles and notes straight from `slides.qmd`, validates
everything and writes `deck.json` + `deck.md`; `build_payload.py` writes the MCP calls.

**Ask the author before designing the interaction**: class size and format, minutes
available for activities, competitive or low-stakes, names or anonymous, whether students
have laptops, and whether activities may go anywhere or only where the Quarto **speaker
notes already ask for audience work**. On the free plan, stay at the cue slides (see
*Plan behaviour*); on a paid plan, the author may want activities throughout (FWL).

Timers, points, poll single choice, word-cloud entries and spinner name fill are **not**
part of the create body: set them afterwards with `update_slide_properties` (see *Hard
constraints* for the type names).

### 5. Interleave

For an interactive slide at final deck position `P`, its anchor is image number
`count(non-interactive positions < P)`. `build_payload.py` computes this and prints the
plan. Two ways to apply it:

- **Better: `create_slides` takes `insert_after_slide_id`.** Call it once per interactive
  slide with the anchor image's ID and the slide is born in the right place — no move pass,
  and no risk of mismatching IDs. Costs one call per slide.
- `create_slides` for all of them in one batch (they append after the images), then one
  `move_slide` each. Fewer calls, but you must map the returned IDs back to your slides
  **by heading, not by array position** — the response does not preserve input order.

Either way the anchors are image slides, whose relative order never changes, so the
operations are independent and ascending order is not actually required.

When several slides share one anchor, create them in **one** call in display order —
they land in order. But a new slide inserted after an image goes *before* any slide
already sitting after that image: on FWL the review round landed ahead of the kept I7
quiz and needed one `move_slide`. Re-check the full order after every batch.

### 6. Verify

1. `get_presentation_detail_tool` → slide count; interactive positions match `deck.md`;
   every quiz has exactly one correct option and every poll none. Its output is large —
   it will be saved to a file, so parse that rather than reading it.
2. Open the editor **and** the share link; spot-check one image slide, one divider, one
   quiz. The editor renders lazily — reload before believing a blank slide.
3. **Reload the editor, then read the participant badge and the line under the canvas.**
   On the free plan, *"up to 50 live participants"* vs **0 / 3** + *"reached the free
   slide limit"* is the answer for this deck; note which slides carry a 👑. On a paid
   plan, expect the plan limit (FWL: **0 / 200**) and no crowns. Do this only after a
   fresh reload (see *Plan behaviour* — crowns are computed lazily).
4. `curl -o /dev/null -w "%{http_code}"` the share link.

### 7. Publish + clean up

Share → **"Share slides view link"**, leave *Include slide notes* **off**. Add to the
post's `links:` (absolute URL → opens in a new tab; see `post-resource-buttons.md`):

```yaml
- icon: poll
  icon_pack: fas
  name: "Interactive slides (AhaSlides)"
  url: https://presenter.ahaslides.com/share/<code>
```

`fa-poll` exists in Font Awesome Free **5.14.0**, which is what this site loads — check
any new icon against that version, **not FA6**. No i18n change: ES/JA post counterparts
are card-only stubs.

**Delete the rendered PDF and any PNGs afterwards.** They are large and regenerable.

---

## Rebuild an existing deck in place

The post links to the presentation's share URL, so never create a replacement deck —
rebuild the same ID.

1. `duplicate_presentation` → `rename_presentation` the copy as a dated backup (delete
   it once the rebuild is verified; see *Folders in the account*).
2. `get_presentation_detail_tool`, split slides into interactive vs content **by type**.
   **Slide IDs change when a slide's type is converted**, so never trust recorded IDs.
3. Soft-delete the content slides:
   `update_slide_properties_tool` with `{id, type: "staticContent", deleted: true}`.
4. Import the PDF (step 3), then interleave (step 5).

---

## Hard constraints — all tested, do not re-litigate

- **`content-v2` does not render.** The MCP's own instructions recommend it. It stores
  `slide_attributes.dsl` faithfully and nothing ever compiles it into `canvasBlocks`, so
  the slide is blank for presenter *and* audience with **no error in the API response or
  the browser console**. It renders only after a human applies a Layout by hand.
  **Diagnostic: `canvasBlocks` populated → renders; `null` → does not.**
- **No full-bleed image slide type exists.** `content_with_title_and_right_image` pins
  the image to a 620×720 right column; there is no background-image type or tool. This is
  why the PDF import route exists.
- **Speaker notes cannot be attached to imported slides.** `update_slide_content`
  requires `heading` + `paragraphs`, which would replace the image with a text slide.
  Notes live in `deck.md`; present from a second screen.
- **`get_presentation_detail_tool` never returns `notes`** — absence there proves
  nothing. `move_slide` and `update_slide_content` responses do return it.
- **`update_slide_content` replaces the whole slide** — resend `notes` or they are wiped.
- **Returned ID arrays are not in input order.** Match on `order`.
- **Option order is not kept — options display in REVERSE payload order.** The API gives
  successive options `order` 1, 0.5, 0.25, … and every view sorts ascending, so a payload
  of A, B, C shows as C, B, A (`get_presentation_detail_tool` lists yet another order —
  never verify option order from it; look at the editor). Letter every option
  ("A. …") so it always matches the cue slide and the notes, and send the lettered list
  reversed so it displays A, B, C. `python_fwl/ahaslides/build_payload.py` does both.
- **Inserted slides get fractional `order`** (e.g. 4.5 after image 4). Check interactive
  positions by rank in `slides_with_id_and_order`, not by the raw `order` value.
- Native text types, if ever needed: `content` takes `heading` + `paragraphs` (an array —
  **never** `body`); `listing` takes `heading` + `items`.
- **`update_slide_properties` type names:** `multipleChoiceQuizQuestion` (pick answer),
  `shortAnswerQuizQuestion`, `correctOrderQuizQuestion`, `matchPairsQuizQuestion`,
  `categoriseQuizQuestion`, `pollQuestion`, `wordCloudQuestion`, `scaleQuestion`,
  `openEndedQuestion`, `spinnerWheelQuestion`. Its response reports every quiz as
  `type: pickAnswer` with the real kind in `slideType` (`categorise`, `matchPairs`,
  `correctOrder`, `typeAnswer`) — that is normal, the slide was not converted.
  Soft-delete any slide, marketplace ones included, with `{id, type: <its type>,
  deleted: true}`.
- **Spinner wheels can fill themselves with the joined participants:**
  `{type: "spinnerWheelQuestion", metadata: {autoFillParticipantName: true}}`.
  `create_slides` accepts `options: []` for such a wheel.
- **Marketplace true/false keeps its scoring in `config`** (`maxPointsPerCorrect`,
  `minPoint`, `timeLimitSeconds`, `speedBonus`) as an off-host fallback; match the
  deck's quiz points (FWL: 100 max, 0 min).
- **`marketplace/escape-room-v2` is accepted by the API but may not exist in the
  account's editor.** On FWL (Education Large, 2026-10-06) the editor's slide-type search
  had no Escape Room, and the slide was blank in the editor, Preview and share view. Check
  the editor's *New slide* list for a marketplace type before building on it.
- **Marketplace slides render lazily** in the share view (fill-in-the-blanks showed only
  its title for a few seconds). Wait before calling one blank.
- **Do not click the editor's *New slide* button to look at the type list** — it opens
  a blank placeholder slide in the thumbnail rail. Closing the menu and reloading
  discards it (verify the slide count by API afterwards).
- **`pinOnImage` and `marketplace/interactive-images` need an image URL** the API can
  store. The imported page images already live on the AhaSlides CDN: read their `src`
  from `curated_slides[].canvasBlocks` in `get_presentation_detail` and reuse it (signed
  links valid about ten years). `upload_image` with base64 also works but is costly.
- **`marketplace/image-show`, `interactive-images` and `budget-allocation-v2` mirror the
  title into `config`** (`config.title`, `config.title`, `config.prompt`), like true/false
  and 2x2 mirror it into `config.question`. Hotspots: at most 8, x/y in percent, title at
  most 40 and description at most 150 characters.
- **A YouTube slide is editor-only.** New slide → Content → **YouTube**, paste the link
  (`&t=220s` start times are kept). The API then lists it as type `youtube` with
  `youtubeLink`, and `move_slide` moves it like any other slide; notes and the caption
  field cannot be set through the MCP, and captions typed in the editor did not persist.
- **The browser upload tool takes at most 10 MB per file.** Split a larger part PDF in two
  and import the halves one after the other, with the last slide of the first half
  selected; check the order by alt text afterwards.
- **Editor text input can trigger browser-extension shortcuts** (a Glasp sidebar opened
  on capitals typed into the YouTube fields, and one link was lost). Re-read each field
  by API after typing.

## PDF-only decks, several parts, videos (Regional Development, 2026-10-06)

When the source is a PDF export (Canva, PowerPoint) rather than `slides.qmd`:

1. **`pages.py` replaces `slides.qmd`.** Short labels per page, the part membership, and
   the video map (page → YouTube ID and start). Read embed IDs from the public view of the
   source (Canva: the `youtube.com/embed/<id>` strings in the page HTML), then confirm each
   title through `https://www.youtube.com/oembed?url=...`. The PDF itself only carries
   the few videos the author also linked.
2. **One presentation per lecture** when a deck is longer than a class. Each part gets
   its own join code, leaderboard and results; repeat the title and closing pages in
   every part.
3. **Video pages are left out of the part PDFs** (`make_part_pdfs.py`) and become YouTube
   slides at the same position. Create the YouTube slides first, record every page's slide
   ID (image or video) in `slide_ids.json`, then anchor the interactive slides to those
   IDs; `build_payload.py` resolves the anchors itself, so no position arithmetic is left.
4. **Moving a video into place:** anchor it to the slide of the page *before* it, by
   page, not by position in the image list (a skipped video page shifts the image index;
   that slip put two Part 1 videos one image late until `move_slide` fixed it).
5. **Animated GIFs freeze in the PDF.** Canva keeps GIF uploads as MP4 clips listed in
   the view page data (a `"J"` array: id, title such as `lasVegas.gif`, files with sizes);
   element boxes (top, left, width, height on a 1920x1080 page) sit next to the asset id.
   Rebuild each page as a full-slide GIF (`content/courses/slides/ahaslides/animate_pages.py`)
   and swap it in with the editor's **Change image** (GIF up to 15 MB; it animates in the
   editor and the share view). Restore page pixels only inside explicit boxes of elements
   drawn over the GIF: an automatic difference mask also freezes the clip's own changing
   labels. Hold nearly unchanged pixels between frames, or satellite clips exceed 10 MB.
   Chrome blocks a second scripted download from a site until the user allows "automatic
   downloads". After the swap, `get_presentation_detail` kept returning the old image URL;
   trust a reloaded editor or the share view, not that field.
6. **A non-post folder needs a Hugo exclusion.** Under a branch bundle such as
   `content/courses/`, `.md` files in a subfolder become pages; the courses deck folder is
   in `excludeFiles` in `config/_default/config.yaml`.

## Canva capture, three languages, self-paced (hero keynote, 2026-10-06)

1. **No PDF? Capture the public Canva view.** `content/keynote/ahaslides/capture.mjs`
   (global Playwright): viewport 1920x1080 at device scale 2, hide `header`, `footer` and
   the cookie banner with CSS (never accept it), pause every `<video>` at frame 0 (GIF
   pages then show their first frame, which the GIF builder needs), screenshot, press
   ArrowRight. A click on the page also advances it, so do not click to focus.
2. **Decks that differ by language** get a topic map (`pages.py`, `TOPICS`): every Canva
   page has one topic per language and each activity anchors to a topic, so one
   `activities.py` serves all three; a language without the page skips the activity.
3. **Website link = audience link.** `https://audience.ahaslides.com/<uniqueAccessCode>`
   (where `ahaslides.com/<join code>` redirects) is the interactive self-paced view. The
   share link `presenter.ahaslides.com/share/...` is a read-only viewer with a "Copy"
   button.
4. **Self-paced settings** (editor, Settings): *Who takes the lead* → *Audience
   (self-paced)*; *Collect audience info* off; *Presentation language* per deck
   (`create_presentation(lang=...)` does not set it; the field is a native select, set
   its option value — typing picks the wrong language). Scored quizzes still ask for a
   nickname before the first quiz; that cannot be turned off.
5. **YouTube slides in self-paced mode:** tick *Also show on audience's smartphones* on
   every YouTube slide, or visitors see "Please watch the video on the presenter's
   screen".
6. **Adding YouTube slides safely:** click *New slide* only once the editor has loaded
   the thumbnails; a type picked from the right-hand panel converts the selected slide
   (a Japanese page image became a video). Re-count the image slides by API afterwards,
   and place new or imported slides with `move_slide` (they land at the end when nothing
   is selected).

## Folders in the account (2026-10-07)

Every presentation lives in one of four top-level folders (no subfolders):

| Folder | ID | Holds |
|---|---|---|
| Regional Development | `141828` | the Regional Development class decks (Parts 1 to 3) and the spatial causal inference decks (Bayesian spatial SC, bridge impact) |
| Applied Econometrics | `141829` | the econometrics tutorial decks (FWL, panel data, DiD, synthetic control) |
| Website | `141830` | decks made only for the website (the hero keynote in EN, ES and JA) |
| Spanish Class | `141831` | decks for the Spanish language class (only those) |

- **File every new deck:** right after `create_presentation`, call
  `move_presentations_to_folder` with the folder of its use. A class deck goes to its
  class folder; a deck for a tutorial on an econometrics topic goes to Applied
  Econometrics. If a new deck fits none of them, ask before creating a folder.
- **Backups are temporary:** the dated backup made before a rebuild (see *Rebuild an
  existing deck in place*) is deleted with `delete_presentations` once the rebuild is
  verified (soft delete; `recover_presentations` restores it). The three backups from
  2026-09-30 and 2026-10-06 were deleted on 2026-10-07.
- Moving a deck does not change its join code, audience link or share link.

## Plan behaviour

### Paid plan (Education Large, measured on FWL 2026-10-06)

With 34 images and 35 interactive slides of 18 types, the editor reports **0 / 200**
and *"You can host up to 200 live participants"*, with no free-slide-limit notice and no
crowns. Interactivity is then a teaching decision, not a quota: FWL aims at about a third
of class time (about 28 core minutes in 90) with optional slides flagged in the notes.

Presentation settings that matter for a class are editor-only (Settings dialog), not
MCP: *Collect audience info* (ask for info before joining, Name → *Mark as required*),
*Q&A* (*On all slides*), and *Who takes the lead* (*Presenter* live, *Audience
(self-paced)* for review afterwards).

### Free plan

Import allows 50 MB / 100 slides.

**A free deck can hold only a small number of interactive slides — of ANY type — before
it is capped at 3 live participants.** Establish this with the user *before* designing
the interaction, because it decides whether the deck is presentable to a class.

Measured on `python_sc_bayes_spatial` (10042312), in this order:

| Deck state | Editor reports |
|---|---|
| 36 images, 0 interactive | *"you can host up to 50 live participants"*, no crowns |
| + 2 `poll` + 6 `pick_answer_quiz` | *"reached the free slide limit"*, **0 / 3**, quizzes crowned 👑 |
| all 6 quizzes converted to `poll` | **unchanged** — all 8 polls crowned, still 0 / 3 |

So the allowance is a **count of interactive slides**, not a list of premium types.
Word Cloud, Rating Scale and Open Ended are separately premium on top of that.

**Do not repeat this mistake:** an earlier version of this file claimed `poll` and
`pick_answer_quiz` were free, from a single reading of the editor in which the two polls
showed no crown. That reading was stale — **the editor recomputes crowns lazily, so a
freshly created slide can show no crown for several minutes.** Always reload the editor
and re-check before concluding anything about the crown state, and never conclude a *type*
rule from one deck's crown pattern.

Since the cap is the same either way, **prefer `pick_answer_quiz` over `poll` for anything
with a right answer** — it reveals the correct option and keeps a leaderboard, which a
poll does not. Use `poll` only for genuine opinion or prediction questions.

If the user needs the 50-participant cap, the only free route is to cut back to a very
small number of interactive slides; otherwise tell them plainly that the deck needs an
upgrade, and to test a live session before teaching from it.

## Related

- `/project:write-slides` — builds the Quarto deck this consumes.
- `post-resource-buttons.md` — the `links:` button rules.
- `content/post/python_bridge_impact/ahaslides/README.md` — worked example, incl. the
  interaction-design patterns worth reusing (prediction poll → callback quiz).
- `content/post/python_sc_bayes_spatial/ahaslides/` — second example.
- `content/post/python_fwl/ahaslides/` — the paid-plan reference; copy its
  `activities.py`, `build_deck_json.py` and `build_payload.py`.
- `content/courses/slides/ahaslides/` — PDF-only source, three parts, YouTube slides.
- `content/keynote/ahaslides/` — Canva view capture, three languages, self-paced.
