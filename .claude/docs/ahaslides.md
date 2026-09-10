# AhaSlides interactive decks

Turn an existing Quarto reveal.js deck into an **AhaSlides** presentation: the content
slides are images of the real Quarto slides, and AhaSlides supplies only the live
audience layer.

**Trigger:** "Make an AhaSlides deck for `<post slug>`" / "Add interactive slides to
`<post>`" / any request to put a deck on AhaSlides.

**Worked reference implementation:** `content/post/python_bridge_impact/ahaslides/`
(deck `10040213`). Its `README.md` records that deck's specifics; this file is the
procedure.

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
| Interactive slides | native types via MCP (`poll`, `pick_answer_quiz`, `word_cloud`, `scale`, `open_ended_survey`) |

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
   adding alt-text).

Limits on the free plan: **50 MB and 100 slides** per import. Each page becomes a slide
holding one Image block at exactly **1280×720** — genuinely edge to edge.

### 4. Author the interactive slides

Keep them in a `deck.md` in `content/post/<slug>/ahaslides/`, generated to `deck.json`
and MCP payloads by the two scripts in the reference implementation (copy them). Create
with `create_slides`. Place interactive slides where the Quarto **speaker notes already
ask for audience work** — do not invent engagement points.

### 5. Interleave

`create_slides` appends, so the interactive slides land after the images. Because the
imported images are already in page order, **one `move_slide` per interactive slide** is
enough. For an interactive slide at deck position `P`, insert it after image number
`count(non-interactive positions < P)`.

### 6. Verify

1. `get_presentation_detail_tool` → slide count; interactive positions match `deck.md`.
2. Open the editor **and** the share link; spot-check one image slide, one divider, one
   quiz. The editor renders lazily — reload before believing a blank slide.
3. `curl -o /dev/null -w "%{http_code}"` the share link.

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

1. `duplicate_presentation` → `rename_presentation` the copy as a dated backup.
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
- Native text types, if ever needed: `content` takes `heading` + `paragraphs` (an array —
  **never** `body`); `listing` takes `heading` + `items`.

## Free-plan behaviour

Import allows 50 MB / 100 slides. **Word Cloud, Rating Scale and Open Ended are premium
(👑)**; `poll` and `pick_answer_quiz` are free. A deck of images alone reports *"up to 50
live participants"*; a deck containing the premium types reports **0 / 3** and *"You have
reached the free slide limit"* — that notice tracks **premium slide types, not slide
count** (it appears with only 8 slides present). The exact rule is undocumented: tell the
user to test a live session before teaching, and offer dropping the three crowned slides
to keep a poll + quizzes.

## Related

- `/project:write-slides` — builds the Quarto deck this consumes.
- `post-resource-buttons.md` — the `links:` button rules.
- `content/post/python_bridge_impact/ahaslides/README.md` — worked example, incl. the
  interaction-design patterns worth reusing (prediction poll → callback quiz).
