# AhaSlides deck — *Introduction to Difference-in-Differences in Python*

> **The procedure lives in [`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md)**
> — that is what a future session follows for any post. **This file records only what is
> specific to this deck.** The generators are copied from
> `content/post/python_panel_intro/ahaslides/` and adapted.

| | |
|---|---|
| **Presentation ID** | `10254213` |
| **Editor** | https://presenter.ahaslides.com/presentation/10254213 |
| **Public view link** | https://presenter.ahaslides.com/share/1790995456625-cj6th2dfd9 |
| **Join code** | `KYSMB` |
| **Theme** | Meeting (`#000000`, theme id 18468), the nearest preset to the deck's `#0f1729` navy |
| **Source deck** | `../slides/slides.qmd` → 33 printed pages |
| **Composition** | 33 image slides + 5 interactive = **38** |

## Architecture

Content slides are **images** of the real Quarto slides: `slides.qmd` rendered to a 33-page
PDF and imported through the editor UI with **"Import slides"** (not the AI options), so the
typography, tables, LaTeX, code, the `.takeaway` boxes and the divider colors survive exactly.
AhaSlides contributes only the audience layer.

Render the PDF with (published URL, once the deck is deployed):

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw --virtual-time-budget=40000 \
  --print-to-pdf=deck.pdf \
  "https://carlos-mendez.org/post/python_did101/slides/?print-pdf&pdfSeparateFragments=false"
```

Before a push, serve the post folder instead (`python3 -m http.server 1319` from
`content/post/python_did101/`) and print
`http://127.0.0.1:1319/slides/index.html?print-pdf&pdfSeparateFragments=false`; the deck only
needs its relative `../did101_*.png` figures. `pdfinfo deck.pdf` **must report 33 pages**:
1 title + 5 `#` dividers + 27 `##` slides. Work in a scratch directory and delete the PDF
afterwards.

## Free plan: capped at 3 live participants

The author accepted a 3-participant cap before the build, as for the four earlier decks
(seven or eight interactive slides capped those at **0 / 3**). **Observed on this deck
(2026-10-03):** with five quizzes, a fresh editor reload about ten minutes after they were
created still read **0 / 50** — *"As a free user, you can host up to 50 live participants"* —
with no crown on any quiz. A second check several hours later (same day, fresh editor load)
still read **0 / 50**. The doc warns that crowns are computed lazily, so treat this as two
readings, not a rule, and test a live session before teaching from it.

## Interactive slides

Five scored quizzes (`pick_answer_quiz`), each answering a **"Before you look" cue slide**
in the Quarto deck. The cues mirror the post's five predict cards; each cue's notes end with
*"(AhaSlides interactive In follows.)"* and the reveal slide's notes begin with
*"The answer to the vote"*. Each quiz repeats its cue's A/B/C options verbatim, and the
build fails if they drift.

| # | Slide | Follows source page | Question | Correct |
|---|---|---|---|---|
| I1 | 9 | 8 | What did the comparison schools do; where does DiD land? | B — rose ~11, DiD ≈ 25 |
| I2 | 16 | 14 | Fixed effects instead of `treated` and `post` | A — same 25.315, new SE |
| I3 | 19 | 16 | Adding `female_share` | C — moves 0.013 |
| I4 | 22 | 18 | Largest of four SEs | C — CRV3 (0.637) |
| I5 | 28 | 23 | What the event study should show | A — quiet leads, flat lags ≈ 25 |

Interactive `k` sits right after source page `p`, so its final position is `p + k`. The
correct letters are spread (A ×2, B ×1, C ×2).

**Options are lettered and sent reversed.** AhaSlides displays options in reverse payload
order, so `build_payload.py` letters every option and sends the list reversed; verified in
the editor that I1 displays A, B, C with B marked correct.

## Speaker notes live in `deck.md`

Notes cannot be attached to imported slides, so all of them are in `deck.md`, copied verbatim
from `slides.qmd`. Present from a second screen with `deck.md` open. The five quizzes *do*
carry their notes in AhaSlides, because they are created through the API.

## Files

| File | What it is |
|---|---|
| `make_deck_md.py` | `slides.qmd` + the quiz definitions → `deck.md`. **Edit the quizzes here.** Checks that each quiz's correct letter matches its cue's "Answer on the next slide". |
| `deck.md` | Generated source of truth for presenting: all 38 slides, all speaker notes, the quizzes in full. |
| `build_deck_json.py` | `deck.md` → `deck.json`, validating titles, notes and cue options against `slides.qmd`, the 33 image pages and the interactive positions `[9, 16, 19, 22, 28]`. |
| `deck.json` | Machine-readable deck. |
| `build_payload.py` | `deck.json` → `payload.json` (MCP bodies for the quizzes) + the interleave plan. |
| `payload.json` | Generated, gitignored (`../.gitignore`). |

```bash
python3 make_deck_md.py && python3 build_deck_json.py && python3 build_payload.py
```

## Building it (as done on 2026-10-03)

1. Render the PDF from a local server (above) and confirm 33 pages.
2. `create_presentation`, theme Meeting (18468); import the PDF through the editor UI,
   waiting for the upload spinner to finish before clicking **Start** (by element ref).
3. Map page → slide ID by rank in `slides_with_id_and_order`, and confirm the cue pages from
   the AI alt-text ("Before you look" appears on exactly pages 8, 14, 16, 18, 23).
4. One `create_slides` per quiz with `insert_after_slide_id` = its cue's image ID.
5. Verify: 38 slides, quizzes at `[9, 16, 19, 22, 28]`, one correct option each, the option
   display order in the editor, the badge after a reload, and `curl` the share link (200).
6. Share → *"Share slides view link"*, slide notes **off**; the post links it as
   *Interactive slides (AhaSlides)*.

## If you rebuild

The post links to the share URL, so **rebuild this presentation in place** — never create a
replacement. Follow the doc's *Rebuild an existing deck in place* section. Slide IDs change
when a slide's type is converted, so always re-fetch the slide list before deleting anything,
and match slides on `order`, never on position in a returned array.
