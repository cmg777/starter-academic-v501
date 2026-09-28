# AhaSlides deck — *The FWL Theorem: Making Multivariate Regressions Intuitive*

> **The procedure lives in [`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md)**
> — that is what a future session follows for any post. **This file records only what is
> specific to this deck.** The worked examples are
> `content/post/python_bridge_impact/ahaslides/README.md` (the full build narrative) and
> `content/post/python_sc_bayes_spatial/ahaslides/README.md` (whose generators these are).

| | |
|---|---|
| **Presentation ID** | `10198190` |
| **Editor** | https://presenter.ahaslides.com/presentation/10198190 |
| **Public view link** | https://presenter.ahaslides.com/share/1790567562708-72xqh62ban |
| **Join code** | `VSXHY` |
| **Theme** | Meeting (`#000000`, theme id 18468) — nearest preset to the deck's `#0f1729` navy |
| **Source deck** | `../slides/slides.qmd` → 34 printed pages |
| **Composition** | 34 image slides + 7 interactive = **41** |

## Architecture

Content slides are **images** of the real Quarto slides: `slides.qmd` rendered to a
34-page PDF and imported through the editor UI, so typography, tables, LaTeX, the
highlighted code, the `.takeaway` boxes and the act-divider colors survive exactly.
AhaSlides contributes only the audience layer. Nothing is built with the API's own text
slide types — see the doc for why that fails.

Render the PDF with:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw --virtual-time-budget=40000 \
  --print-to-pdf=deck.pdf \
  "https://carlos-mendez.org/post/python_fwl/slides/?print-pdf&pdfSeparateFragments=false"
```

Use the published URL once the deck is deployed. Until then, point the same command at a
local `hugo server`
(`http://localhost:1313/post/python_fwl/slides/?print-pdf&pdfSeparateFragments=false`).

`pdfinfo deck.pdf` **must report 34 pages** before importing — every interleave anchor
depends on it. That is 1 title page + 4 `#` dividers + 29 `##` slides; the two `# `
comment lines inside the statsmodels code block are not slides, and the generator skips
fenced code for exactly that reason. Work in a scratch directory and delete the PDF
afterwards.

## Free plan: this deck is capped at 3 live participants

**Confirmed on this deck (2026-09-28), after a fresh editor reload:** with the 34 imported
images alone the badge read **0 / 50**; with the seven interactive slides it reads
**0 / 3** and *"You have reached the free slide limit"*, and the interactive slides carry
the crown. The author accepted this in advance. It matches the earlier decks:
`python_bridge_impact` (10040213) and `python_sc_bayes_spatial` (10042312) both report
*"You have reached the free slide limit"* and **0 / 3** with eight interactive slides
each. On the second, the same 36 images with no interactive slides reported *"up to 50
live participants"*, and converting every quiz to a poll changed nothing. The free
allowance is a small count of **interactive slides of any type**, so this deck's seven
land in the same place.

So the deck uses the better mechanic rather than chasing the cap: six scored quizzes
(automatic correct-answer reveal plus a leaderboard) and one genuine prediction poll.
Word Cloud, Rating Scale and Open Ended are separately premium and are not used. After
any rebuild, reload the editor and read the participant badge again — crowns are
computed lazily, so never trust a first reading.

**Practical consequence:** run this deck as-is for a demo or a small group, or upgrade to
lift the cap. Do not promise a lecture hall without testing a live session first.

## Interactive slides

Seven. Six answer a **"Before you look" cue slide already in the Quarto deck** — each
cue's notes end with *"(AhaSlides interactive In follows.)"* — so none is invented. Each
repeats its cue's A/B/C options verbatim, and the build fails if they drift. The seventh
is a recap quiz on the Double Machine Learning bridge slide. Full text, options, correct
answers and presenter notes are in `deck.md`.

| # | Slide | Type | Follows source page | Correct |
|---|---|---|---|---|
| I1 | 5 | poll | 4 — naive slope's sign | none (prediction) |
| I2 | 14 | quiz | 12 — which regression gives δ̂ | A — income on coupons |
| I3 | 20 | quiz | 17 — the Step 1 shortcut | B — same coefficient, much larger SE |
| I4 | 24 | quiz | 20 — Step 2's SE vs 0.1203 | B — slightly smaller (0.1178) |
| I5 | 29 | quiz | 24 — adding the means back | A — slope unchanged |
| I6 | 32 | quiz | 26 — a second control | B — slightly (0.2673 → 0.2706) |
| I7 | 40 | quiz | 33 — FWL is DML with a linear mop | A — the two OLS partialling-out regressions |

Interactive `k` sits right after source page `p`, so its final position is `p + k`.

**In the room:** show the cue image, advance to the interactive slide to open voting,
and the next image is the reveal. **I1 is a pure prediction poll** — the room commits to a
sign for the naive slope before seeing the scatter. The Simpson's paradox side-by-side
(slide 36) puts that naive −0.106 next to the conditioned +0.267, so screenshot I1's bar
chart or keep it open in a second tab and show it again there.

## Option order: lettered and sent reversed

**AhaSlides does not keep the option order of the payload.** The API gives successive
options `order` values 1, 0.5, 0.25, … and the editor, the presenter view and the share
view sort them ascending, so the options display in **reverse** payload order
(`get_presentation_detail_tool` lists them in yet another order — do not trust it for
this). First build: every slide showed C, B, A. Two safeguards, both in
`build_payload.py`:

1. Every option carries its letter ("A. income on coupons"), so the audience can match
   it to the cue slide and the notes ("Answer: B") whatever the display order.
2. The lettered options are sent **reversed** (C, B, A), so they display A, B, C.

Verified after `update_slide_content` (IDs unchanged, notes resent): the editor and the
share view show A, B, C on all seven slides, each quiz with exactly one correct option.

## Speaker notes live here, not in AhaSlides

Notes cannot be attached to imported slides, so **all 30 are in `deck.md`**, carried over
verbatim from `slides.qmd` (29 content slides plus the closing divider). Present from a
second screen with `deck.md` open. The seven interactive slides *do* carry their notes in
AhaSlides, because they are created through the API.

## Files

| File | What it is |
|---|---|
| `deck.md` | **Source of truth.** All 41 slides, all 30 speaker notes, the 7 interactive slides in full. Edit this, then regenerate. |
| `build_deck_json.py` | `deck.md` → `deck.json`, with validation. Refuses to write on any failure. |
| `deck.json` | Machine-readable deck. |
| `build_payload.py` | `deck.json` → `payload.json` (MCP call bodies for the interactive slides) + the interleave plan. |
| `payload.json` | Generated, gitignored (`../.gitignore`). |

```bash
python3 build_deck_json.py && python3 build_payload.py
```

**`build_deck_json.py` validates:** contiguous slide numbers; exactly one correct answer
per quiz and none on a poll; a question on every interactive slide; image pages running
1…34 with no gaps or duplicates; interactive slides at exactly
`[5, 14, 20, 24, 29, 32, 40]`; and, against `../slides/slides.qmd`, **every content
slide's title and speaker notes** plus **every cue-answering slide's options**. If the
Quarto deck is edited and re-rendered, the build fails instead of silently leaving
`deck.md` describing images that no longer exist. Each check was confirmed to fire on a
deliberately broken copy.

**No `images.json`.** Under the image architecture the PDF carries every figure, so
nothing is uploaded separately and there is nothing to record.

## Building it

1. Render the PDF (above) and confirm 34 pages.
2. `create_presentation_tool`, theme Meeting; import the PDF through the editor UI with
   **"Import slides"** (not the AI options).
3. For each entry in `payload.json`, strip `_n` / `_after_image` and call `create_slides`
   with `insert_after_slide_id` = the ID of image `_after_image` (map page → ID with
   `slides_with_id_and_order`; inserted slides get fractional `order` values such as 4.5,
   so check positions by rank). The payload's options are already lettered and reversed
   (see *Option order*).
4. Verify per the doc's step 6: 41 slides, interactive at the positions above, one
   correct option per quiz, none on the poll.
5. Record the presentation ID, editor URL, share link and join code in the table above,
   the header of `deck.md` and the `presentation` block in `build_deck_json.py`; then
   regenerate.
6. Share → *"Share slides view link"* with slide notes **off**, and add the
   `Interactive slides (AhaSlides)` button to the post's `links:`.

## If you rebuild

Once the post links to the share URL, **rebuild that presentation in place** — never
create a replacement. The doc's *Rebuild an existing deck in place* section has the
sequence. Slide IDs change when a slide's type is converted, so always re-fetch the
authoritative list before deleting anything, and match slides on `order`, never on
position in a returned array — `create_slides` does not return IDs in input order.
