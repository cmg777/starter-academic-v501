# AhaSlides deck: Introduction to the Synthetic Control Method in Python with mlsynth

> **The procedure lives in [`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md).**
> A future session follows that file for any post. This file records only what is specific to
> this deck. The generators are adapted from `content/tutorials/python_did101/ahaslides/`.

| | |
|---|---|
| **Presentation ID** | `10267450` |
| **Editor** | https://presenter.ahaslides.com/presentation/10267450 |
| **Public view link** | https://presenter.ahaslides.com/share/1791196372251-qpgn4k0rq1 |
| **Join code** | `KROUI` |
| **Theme** | Meeting (`#000000`, theme id 18468), the nearest preset to the `#0f1729` navy of the deck |
| **Source deck** | `../slides/slides.qmd`, rendered to 36 printed pages |
| **Composition** | 36 image slides plus 5 interactive slides, for a total of **41** |

## Architecture

The content slides are images of the real Quarto slides. The deck was printed to a 36-page PDF and imported through the editor with **"Import slides"**, not with either AI option. This route keeps the typography, the equations, the code, the takeaway boxes, and the divider colors exactly as they appear in the Quarto deck.

AhaSlides contributes only the audience layer. The five scored quizzes are native `pick_answer_quiz` slides created through the MCP tools. Each one sits directly after the image of its "Before you look" cue slide, so the vote happens before the reveal.

The PDF came from the post folder, served locally before the first push. The commands below start a local server and print the deck with headless Chrome. The print mode of reveal.js yields exactly one page per slide, with every fragment shown in its final state:

```bash
cd content/tutorials/python_sc101 && python3 -m http.server 1363
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw --virtual-time-budget=40000 \
  --print-to-pdf=deck.pdf \
  "http://127.0.0.1:1363/slides/index.html?print-pdf&pdfSeparateFragments=false"
```

After the deck is deployed, print from `https://carlos-mendez.org/tutorials/python_sc101/slides/?print-pdf&pdfSeparateFragments=false` instead. `pdfinfo deck.pdf` must report 36 pages, which equals `Reveal.getTotalSlides()`. Work in a scratch directory and delete the PDF afterwards.

## Free plan: no participant cap observed yet

The account is on the free plan. A fresh editor load on 2026-10-05, about ten minutes after the five quizzes were created, read **0 / 50** with the line "As a free user, you can host up to 50 live participants". No quiz carried a crown at that moment. The procedure document warns that crowns are computed lazily, so this reading is evidence rather than a rule, and a live test should precede any class session.

## Interactive slides

The five quizzes answer the five cue slides of the Quarto deck, and the cues mirror the five predict cards of the post. Each quiz repeats the options of its cue verbatim, and `build_deck_json.py` fails if they drift apart. The table lists each quiz with its final position, its source page, and its correct option.

| # | Final slide | Follows source page | Question (short form) | Correct |
|---|---|---|---|---|
| I1 | 5 | 4 | How large is the gap between California and the donor average in 1988? | C, far larger |
| I2 | 14 | 12 | How much of synthetic California does Utah supply? | B, about one third |
| I3 | 17 | 14 | What will mlsynth report for the predictor weights? | A, very different V, same W |
| I4 | 24 | 20 | Which states rank just below California in the placebo test? | C, well-fitted states |
| I5 | 30 | 25 | What happens when Utah is dropped and the model is refit? | A, New Mexico takes over |

The correct letters are spread across the options: A twice, B once, and C twice. This spread keeps the audience from guessing a pattern in the answers. Interactive slide `k` sits right after source page `p`, so its final position is `p + k`.

**Options are lettered and sent in reverse.** AhaSlides displays options in reverse payload order, so `build_payload.py` letters every option and sends the list reversed. A check in the editor confirmed that I1 displays A, B, C in that order, with C marked correct.

## Speaker notes live in `deck.md`

Notes cannot be attached to imported image slides, so every note is kept in `deck.md`, copied verbatim from `slides.qmd`. The presenter can therefore run the deck from a second screen with `deck.md` open. The five quizzes do carry their own notes in AhaSlides, because they were created through the API.

## Rebuilding the quiz layer

The three generators run in order: `python3 make_deck_md.py`, then `python3 build_deck_json.py <path to deck.pdf>`, then `python3 build_payload.py`. The first writes `deck.md` from `slides.qmd` and the quiz definitions, and the second validates titles, notes, cue options, and positions against the deck and the PDF. The third writes `payload.json`, which is gitignored and holds one `create_slides` body per quiz with its anchor page.

## Import gotcha observed on this deck

The first Start click in the import dialog was silently lost, and the deck stayed empty with no error. The dialog had re-rendered after the upload, so the recorded reference to the Start button had gone stale. Reopening the dialog, uploading the PDF again, waiting until the file row was stable, and clicking Start through a fresh reference imported all 36 pages within about a minute.
