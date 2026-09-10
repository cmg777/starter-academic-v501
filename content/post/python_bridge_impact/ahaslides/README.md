# AhaSlides via MCP — build notes and playbook

The AhaSlides version of the post's Quarto reveal.js deck (`../slides/slides.qmd`),
and — more usefully — **everything learned building it**, so the next deck takes an
hour instead of two afternoons.

> **The canonical procedure lives in [`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md)**
> — that is what a future session follows for any post (`CLAUDE.md` points at it). **This
> file is the worked example**: the record of *this* deck, plus the reasoning, the
> measurements and the interaction-design patterns behind the procedure. If the two ever
> disagree, the `.claude/docs` file is the one to fix.

Read **[Start a new deck](#start-a-new-deck-from-this-one)** if you are here to reuse
this. Read **[Build the content slides](#build-the-content-slides-render-the-qmd-import-the-pdf)**
before changing how slides are made — the obvious API route is a trap.

| | |
|---|---|
| **Public view link** | <https://presenter.ahaslides.com/share/1789007350719-n7drztywna> |
| **Editor** | <https://presenter.ahaslides.com/presentation/10040213> |
| **Audience join code** | `Q6U4S` (live sessions only) |
| Presentation ID | `10040213` |
| Backup of the old text version | presentation `10041434` |
| Slides | 44 — 36 imported slide images + 8 native interactive |

The public link is self-paced: anyone can page through without a live session.
**Speaker notes are excluded from it** ("Include slide notes" off) and comments are on.

---

## The architecture that works

**Content slides are images of the real Quarto slides. Interactivity is native.**

That split is the whole design. AhaSlides' own content slide types cannot reproduce a
Quarto deck — you lose bold runs, tables, math, per-slide colour and all typography. But
AhaSlides is not a design tool; its value is the live audience layer. So render the
Quarto deck to images and let AhaSlides do only what it is good at.

What this preserves that the native types destroyed: the serif display titles, the
orange rules, the coloured emphasis on every number, the takeaway boxes, real tables
(not flattened bullets), the LaTeX, and the five act dividers in the site palette.

| Layer | How | Count |
|---|---|---|
| Content slides | PDF import of the rendered Quarto deck | 36 |
| Interactive slides | native types via MCP (`poll`, `pick_answer_quiz`, `word_cloud`, `scale`, `open_ended_survey`) | 8 |

---

## The five rules

1. **Content slides come from a PDF import, not from the API.** Render the qmd → PDF →
   import through the editor UI.
2. **Never use `content-v2`.** It stores its DSL and silently renders blank.
3. **`upload_image` rejects PDFs** (`image/*` only) — the PDF has to go through the
   editor's Import dialog, not the MCP.
4. **`create_slides` appends**, and the returned ID array is **not** in your input order.
   Match on `order`, never on array position.
5. **Verify in the browser, twice** — editor *and* Preview, after a hard reload.

---

## The pipeline

```
slides.qmd ──headless Chrome──▶ deck.pdf ──editor Import──▶ 36 image slides
deck.md ──build_deck_json.py──▶ deck.json ──build_payload.py──▶ 8 interactive slides (MCP)
```

| File | Role |
|---|---|
| `deck.md` | **Source of truth** for slide content and **all speaker notes**. Hand-edited. |
| `build_deck_json.py` | `deck.md` → `deck.json`, and validates. |
| `deck.json` | Machine-readable deck. Generated — never hand-edit. |
| `build_payload.py` | `deck.json` (+ `images.json`) → `payload.json`, the MCP call bodies. |
| `images.json` | Figure filename → AhaSlides CDN url. Only needed for the *native* image slides, which the current deck no longer uses. |
| `payload.json` | Generated, gitignored. |

`deck.md` still matters even though the content slides are now images: it holds the
speaker notes (which cannot be attached to imported slides — see below) and the exact
question/option/answer text for the 8 interactive slides.

**The generators are also the tests.** `build_deck_json.py` writes nothing and exits 1
on: non-contiguous slide numbers, a quiz without exactly one correct answer, a poll with
a correct answer, an interactive slide with no question, or a figure missing from disk.
Verified against a deliberately broken copy.

---

## Setup

```bash
claude mcp add ahaslides --scope user --transport http https://mcp.ahaslides.com/mcp
```

`--scope user` keeps the server out of the site repo. Then `/mcp` → **ahaslides** →
**Authenticate** (OAuth, **no API key**). A newly added server is invisible to the
running session — exit and `claude --continue` to resume with the tools loaded.

---

## Build the content slides: render the qmd, import the PDF

### 1. Render the deck to PDF

Reveal's own print mode gives exactly one page per slide, with fragments flattened to
their final state (`pdfSeparateFragments=false`):

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw --virtual-time-budget=40000 \
  --print-to-pdf=deck.pdf \
  "https://carlos-mendez.org/post/<slug>/slides/?print-pdf&pdfSeparateFragments=false"
```

Point it at the **published** URL — self-contained, and guaranteed to match what
readers see. Check the page count equals the slide count (`pdfinfo deck.pdf`). For this
deck: 36 pages, 1056×594 pt (16:9).

No screenshotting, no viewport arithmetic, no per-slide navigation. It is one command.

### 2. Import it

In the editor: the **Import** icon beside "New slide" (or the *Import — PPT, PPTX and
PDF* card on an empty deck) → drop the PDF → choose **"Import slides"**.

**Choose "Import slides", not "Import and generate slides with AI" or "Generate
interactive slides"** — those rewrite your content, which defeats the entire point.

Limits on the current plan: **50 MB and 100 slides** per import. This deck was 2.35 MB
/ 36 pages. Import takes about a minute, then runs an AI pass adding alt-text
descriptions.

Result: each page becomes a slide holding a single Image block at exactly
**1280×720** — genuinely edge to edge.

### 3. Interleave the interactive slides

Create the 8 interactive slides with the MCP, then position them with `move_slide`
(ID-based, one slide per call). Because the imported images are already in page order,
**you only need one move per interactive slide** — 8 calls, not 44.

For an interactive slide at deck position `P`, insert it after image number
`count(non-interactive positions < P)`. For this deck (interactive at 5, 15, 18, 23, 25,
28, 34, 44) that is images 4, 13, 15, 19, 20, 22, 27, 36.

### Rebuilding in place without losing the share link

The post links to the presentation's share URL, so rebuild in place rather than making
a new deck:

1. `duplicate_presentation` as a backup, then `rename_presentation` it clearly.
2. Fetch `get_presentation_detail_tool`, split slides into interactive vs content by
   type. **Do this rather than trusting recorded IDs — IDs change when a slide's type
   is converted.**
3. Soft-delete the content slides: `update_slide_properties_tool` with
   `{id, type: "staticContent", deleted: true}`.
4. Import the PDF (step 2 above).
5. Move the interactive slides into place (step 3 above).

---

## What the MCP cannot do

- **Full-bleed images.** The only native image type,
  `content_with_title_and_right_image`, pins the image to a 620×720 right column. There
  is no background-image slide type and no MCP tool that sets one. `content-v2` has the
  right primitive (`:::image at=full`) and doesn't render. Hence the PDF import.
- **Attach speaker notes to imported slides.** `update_slide_content` requires
  `heading` + `paragraphs`, which would replace the image with a text slide. Tested and
  refused. Notes live in `deck.md`; present from a second screen, or type them by hand
  in the editor.
- **Ingest a PDF.** `upload_image` returns
  `URL did not return an image (content-type: application/pdf)`.
- **Report notes back.** `get_presentation_detail_tool` omits the `notes` field
  entirely, so absence there is not evidence of loss — check a `move_slide` or
  `update_slide_content` response instead, which do return it.

### The content-v2 trap, in full

The MCP's instructions actively recommend `content-v2` for static slides. Through the
MCP it does not render: `create_slides` and `update_slide_content` persist
`slide_attributes.dsl` faithfully, but nothing compiles it into `canvasBlocks`. The
slide is blank in the editor, in Preview and for the audience, with **no error in the
API response or the browser console**. It renders only after a human opens it and
applies a Layout by hand.

**Diagnostic:** `canvasBlocks` populated → renders. `canvasBlocks: null` → does not.

False leads that cost hours, all wrong: pixel `x/y/w/h` vs anchor `at=` positioning;
`preset=title` vs `display`; percentage vs pixel widths; multi- vs single-slide update
calls; stale editor render. One divider slide *did* render, which looked like a DSL
difference — it had simply been touched in the editor.

### Native slide types (still needed for the interactive layer)

| Role | `slide_type` | Fields |
|---|---|---|
| Prediction poll | `poll` | `heading`, `options: [{text}]` |
| Scored quiz | `pick_answer_quiz` | `heading`, `options: [{text, correct}]` |
| Word cloud | `word_cloud` | `heading` |
| Rating | `scale` | `heading`, `options: [{text}]`, `scale_config` |
| Open question | `open_ended_survey` | `heading` |
| Text slide (unused now) | `content` / `listing` | `heading` + `paragraphs` (array, **never** `body`) / `items` |

All accept `notes`. `update_slide_content` **replaces the whole slide**, so resend
`notes` or they are wiped. `pick_answer_quiz` exposes no points/timer fields — set them
via `update_slide_properties_tool` with `type: "multipleChoiceQuizQuestion"`.

---

## Free-plan limits actually observed

- **Import** allows 50 MB / 100 slides — ample.
- **Premium slide types.** Word Cloud, Rating Scale and Open Ended carry a 👑 badge.
  `poll` and `pick_answer_quiz` are free.
- **Participants.** A deck of imported images alone reports **"up to 50 live
  participants"**. This deck, which holds the premium interactive slides, reports
  **0 / 3** and shows *"You have reached the free slide limit"* — the same message it
  showed with only 8 slides in it, so that message is about **premium slide types, not
  slide count**. The correlation is clear; the exact rule is not documented.

**Test a live session before teaching from it.** If the cap really is 3 participants,
the interactive slides will not work with a class and the deck degrades to a linear
presentation. The public view link is unaffected. To stay free with interaction, drop
the three crowned slides and keep the poll plus four pick-answer quizzes — still five
audience checkpoints.

---

## Design decisions worth reusing

- **Put interactive slides where the source deck's speaker notes already ask for
  audience work.** Three of the eight came straight from Quarto `::: {.notes}` lines —
  slide 17's "Make the audience do the work here" became the word cloud.
- **Open with a prediction poll before naming the theories**, so the room commits before
  it has vocabulary to hide behind.
- **Close the loop.** Slide 5 asks what happens to the factories; slide 25 asks which
  outcome discriminates. Show the slide 5 chart again before revealing 25 — the room
  sees its own wrong answer next to the data. The single most effective thing here.
- **Ask before you reveal** wherever the source says "ask the audience" (slide 28 before
  slide 30's explanation).
- **Make a hedge into a number** — slide 34 turns "moderately robust" into a 1–5 rating.
- 8 interactive in 44 is 18%. The MCP guidance suggests 30–50%, which is tuned for
  corporate workshops and would shred a technical argument. Judge by the material.

---

## Start a new deck from this one

1. **Copy** `deck.md`, `build_deck_json.py`, `build_payload.py`. Leave `deck.json`,
   `images.json`, `payload.json` — they regenerate.
2. **Rewrite `deck.md`**, keeping the structure: `## N — Kind` headings and the
   `**Title:** / **Bullets:** / **Notes:**` fields, contiguous from 1.
   - **Kind is decided in two places.** The heading picks cover and dividers: exactly
     `## N — Title` for the cover, and containing `divider` for an act divider.
     Everything else falls through to the `**Type:**` line, which must contain one of
     `poll`, `quiz`, `word cloud`, `rating`/`scale`, `open ended` — or none, meaning an
     ordinary content slide.
3. `python3 build_deck_json.py` — fix whatever it flags.
4. **Render the qmd to PDF** (one command above) and check the page count equals the
   number of non-interactive slides.
5. **Create the presentation**, import the PDF, then create the interactive slides with
   the MCP and `move_slide` them into position.
6. **Verify**: slide count, interactive positions, a spot-check of one image slide and
   one quiz in **Preview**.
7. **Share slides view link** → add to the post's `links:`:
   ```yaml
   - icon: poll
     icon_pack: fas
     name: "Interactive slides (AhaSlides)"
     url: https://presenter.ahaslides.com/share/<code>
   ```
   Absolute URL so it opens in a new tab. `fa-poll` exists in Font Awesome Free
   **5.14.0**, which is what this site loads — check any new icon against that version,
   not FA6.
8. **Delete the rendered PDF and any PNGs** when the import is done; they are
   regenerable and large.

**Realistic budget for deck two:** about an hour, most of it writing `deck.md`.

---

## Running a live session

1. Editor → **Present**. Audience joins at `ahaslides.com/Q6U4S`.
2. **Slide 5**, the prediction poll: screenshot the result or keep it in a second tab —
   **slide 25 calls back to it**.
3. **Slide 18**, the word cloud: take the two most popular answers and ask whether each
   *stops at the Jamuna*. Almost none do — they are national shocks, which the Padma
   hinterland differences out. The identification argument, built by the room.

Notes for the 8 interactive slides are attached and show in presenter view. Notes for
the 36 image slides are **only** in `deck.md` — have it open on a second screen.

Afterwards:

> Using the ahaslides MCP, get the quiz scores and poll results from the most recent
> session of the Jamuna Bridge presentation.

---

## Related

- Quarto deck: `../slides/slides.qmd` → `/post/python_bridge_impact/slides/`
- Post: <https://carlos-mendez.org/post/python_bridge_impact/>
- AhaSlides MCP: <https://ahaslides.com/marketplace/mcp-server/>
