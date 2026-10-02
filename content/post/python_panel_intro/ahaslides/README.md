# AhaSlides deck — *Introduction to Panel Data Methods*

> **The procedure lives in [`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md)**
> — that is what a future session follows for any post. **This file records only what is
> specific to this deck.** The closest worked example is
> `content/post/python_fwl/ahaslides/README.md`, whose generators these are.

| | |
|---|---|
| **Presentation ID** | `10245137` |
| **Editor** | https://presenter.ahaslides.com/presentation/10245137 |
| **Public view link** | https://presenter.ahaslides.com/share/1790911128481-t7x8a80cw2 |
| **Join code** | `V62EU` |
| **Theme** | Meeting (`#000000`, theme id 18468) — nearest preset to the deck's `#0f1729` navy |
| **Source deck** | `../slides/slides.qmd` → 33 printed pages |
| **Composition** | 33 image slides + 7 interactive = **40** |

## Architecture

Content slides are **images** of the real Quarto slides: `slides.qmd` rendered to a
33-page PDF and imported through the editor UI with **"Import slides"** (not the AI
options), so typography, tables, LaTeX, code, the `.takeaway` boxes and the act-divider
colors survive exactly. AhaSlides contributes only the audience layer.

Render the PDF with (published URL, once the deck is deployed):

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw --virtual-time-budget=40000 \
  --print-to-pdf=deck.pdf \
  "https://carlos-mendez.org/post/python_panel_intro/slides/?print-pdf&pdfSeparateFragments=false"
```

Before a push, serve the post folder instead (`python3 -m http.server 1319` from
`content/post/python_panel_intro/`) and print
`http://127.0.0.1:1319/slides/index.html?print-pdf&pdfSeparateFragments=false`; the deck
only needs its relative `../panel_intro_*.png` figures. `pdfinfo deck.pdf` **must report 33
pages**: 1 title + 4 `#` dividers + 28 `##` slides. Work in a scratch directory and delete
the PDF afterwards.

## Free plan: capped at 3 live participants

**Confirmed on this deck (2026-10-02), after a fresh editor reload:** the badge reads
**0 / 3** with *"You have reached the free slide limit"*, and the seven quizzes carry the
crown. The author accepted this before the build (same outcome as the three earlier decks).
Run it as-is for a demo or a small group, or upgrade to lift the cap; test a live session
before teaching from it.

## Interactive slides

Seven scored quizzes (`pick_answer_quiz`), each answering a **"Before you look" cue slide
added to the Quarto deck for this purpose**. The cues mirror the post's seven predict
cards, and each cue's notes end with *"(AhaSlides interactive In follows.)"*; the reveal
slide's notes begin with *"The answer to the vote"*. Each quiz repeats its cue's A/B/C
options verbatim, and the build fails if they drift.

| # | Slide | Follows source page | Question | Correct |
|---|---|---|---|---|
| I1 | 10 | 9 | Within share of union's variance | A — less than 10% (6.1%) |
| I2 | 15 | 13 | FD vs POLS 0.075 | C — larger, with a larger SE (0.2113) |
| I3 | 19 | 16 | FE vs FD's 0.2113 | B — slightly different (0.2103) |
| I4 | 22 | 18 | Where two-way FE lands | A — exactly FD, 0.2113 |
| I5 | 26 | 21 | Robust SEs in the Hausman formula | B — H falls enough to flip the verdict |
| I6 | 29 | 23 | CRE union coefficient | A — equals FE, 0.2103 |
| I7 | 35 | 28 | Two-way FE age coefficient | B — changes sign (−0.0576) |

Interactive `k` sits right after source page `p`, so its final position is `p + k`. The
correct letters are deliberately spread (A ×3, B ×3, C ×1): the first draft had five C
answers, and the cue options were reordered before the final import so the room cannot
learn a pattern.

**Options are lettered and sent reversed.** AhaSlides displays options in reverse payload
order, so `build_payload.py` letters every option and sends the list reversed; verified in
the editor that I1 displays A, B, C with A marked correct.

## Speaker notes live in `deck.md`

Notes cannot be attached to imported slides, so all of them are in `deck.md`, copied
verbatim from `slides.qmd`. Present from a second screen with `deck.md` open. The seven
quizzes *do* carry their notes in AhaSlides, because they are created through the API.

## Files

| File | What it is |
|---|---|
| `make_deck_md.py` | `slides.qmd` + the quiz definitions → `deck.md`. **Edit the quizzes here.** Checks that each quiz's correct letter matches its cue's "Answer on the next slide". |
| `deck.md` | Generated source of truth for presenting: all 40 slides, all speaker notes, the quizzes in full. |
| `build_deck_json.py` | `deck.md` → `deck.json`, validating titles, notes and cue options against `slides.qmd`, the 33 image pages and the interactive positions `[10, 15, 19, 22, 26, 29, 35]`. |
| `deck.json` | Machine-readable deck. |
| `build_payload.py` | `deck.json` → `payload.json` (MCP bodies for the quizzes) + the interleave plan. |
| `payload.json` | Generated, gitignored (`../.gitignore`). |

```bash
python3 make_deck_md.py && python3 build_deck_json.py && python3 build_payload.py
```

## Building it (as done on 2026-10-02)

1. Render the PDF (above) and confirm 33 pages.
2. `create_presentation`, theme Meeting (18468); import the PDF through the editor UI.
   Wait for the upload to finish before clicking **Start** — a click during the upload
   transition was silently lost on the first attempt.
3. Map page → slide ID by rank in `slides_with_id_and_order` (IDs are not in page order),
   and confirm the cue pages from the AI alt-text ("Before you look" appears on exactly
   pages 9, 13, 16, 18, 21, 23, 28).
4. One `create_slides` per quiz with `insert_after_slide_id` = its cue's image ID.
5. Verify: 40 slides, quizzes at the positions above, one correct option each, the badge
   after a reload, and `curl` the share link (200).
6. Share → *"Share slides view link"*, slide notes **off**; the post links it as
   *Interactive slides (AhaSlides)*.

## If you rebuild

The post links to the share URL, so **rebuild this presentation in place** — never create a
replacement. Follow the doc's *Rebuild an existing deck in place* section. Slide IDs change
when a slide's type is converted, so always re-fetch the slide list before deleting
anything, and match slides on `order`, never on position in a returned array.
