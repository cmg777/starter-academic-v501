# AhaSlides deck — *Who Else Was Treated?*

> **The procedure lives in [`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md)**
> — that is what a future session follows for any post. **This file records only what is
> specific to this deck.** The first worked example, with the full build narrative, is
> `content/post/python_bridge_impact/ahaslides/README.md`.

| | |
|---|---|
| **Presentation ID** | `10042312` |
| **Editor** | https://presenter.ahaslides.com/presentation/10042312 |
| **Public view link** | https://presenter.ahaslides.com/share/1789021577046-xkh2lwuly9 |
| **Join code** | `2PVGU` |
| **Theme** | Meeting (`#000000`) — nearest preset to the deck's `#0f1729` navy |
| **Source deck** | `../slides/slides.qmd` → 36 printed pages |
| **Composition** | 36 image slides + 8 interactive = **44** |

## Architecture

Content slides are **images** of the real Quarto slides: `slides.qmd` rendered to a
36-page PDF and imported through the editor UI, so typography, tables, LaTeX, the
`.takeaway` boxes and the act-divider colours survive exactly. AhaSlides contributes only
the audience layer. Nothing is built with the API's own text slide types — see the doc for
why that fails.

Rebuild the PDF with:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw --virtual-time-budget=40000 \
  --print-to-pdf=deck.pdf \
  "https://carlos-mendez.org/post/python_sc_bayes_spatial/slides/?print-pdf&pdfSeparateFragments=false"
```

`pdfinfo deck.pdf` **must report 36 pages** before importing — every interleave offset
depends on it. Work in a scratch directory and delete the PDF afterwards.

## Free plan: this deck is capped at 3 live participants

**Tested on this deck, in this order — the result is not what the marketing pages imply:**

1. 36 images, **no** interactive slides → *"As a free user, you can host up to 50 live
   participants."* No slides crowned.
2. Added 2 `poll` + 6 `pick_answer_quiz` → *"You have reached the free slide limit"*,
   participant badge **0 / 3**, the six quizzes crowned (👑).
3. Converted all six quizzes to `poll`, on the theory that quizzes were the premium type
   → **no change.** All eight polls crowned, still 0 / 3.

So the free allowance is a small count of **interactive slides of any type** — not a rule
about which types are premium. Step 3 was reverted, because the cap is identical either
way and quizzes are the better mechanic (automatic correct-answer reveal plus a
leaderboard). Word Cloud, Rating Scale and Open Ended are separately premium and are not
used here.

**Practical consequence:** run this deck as-is for a demo or a small group, or upgrade to
lift the cap. Do not promise a lecture hall without testing a live session first.

## Interactive slides

Eight, all placed where the Quarto speaker notes already tell the presenter to work the
room — none invented. Full text, options, correct answers and notes are in `deck.md`.

| # | Slide | Type | Follows |
|---|---|---|---|
| I1 | 6 | poll | 5 — Nevada is California's only neighbour |
| I2 | 13 | quiz | 11 — Stage 1 picks five donors and stops |
| I3 | 17 | quiz | 14 — Relax the simplex, 5 → 26 donors |
| I4 | 20 | quiz | 16 — Drop SUTVA, the bias has a closed form |
| I5 | 25 | quiz | 20 — ρ is clearly above zero (0.316) |
| I6 | 29 | quiz | 23 — The leak runs the opposite way (−5.50) |
| I7 | 32 | quiz | 25 — The R interval is 33× too narrow |
| I8 | 42 | poll | 34 — Four things survive this deck |

**The callback pair is the design.** I1 asks the room to predict the sign of the Nevada
spillover while cross-border shopping is still the obvious story; I6 cashes it in, after
the −5.50 reveal, by asking what a *negative* spillover on a *positively weighted* donor
does to the classical estimate. Screenshot I1's bar chart, or leave it open in a second
tab — the callback only works if you can show the room what it originally said.

I8 is a poll standing in for the open-ended closer the free plan does not offer.

## Speaker notes live here, not in AhaSlides

Notes cannot be attached to imported slides, so **all 31 are in `deck.md`**, carried over
verbatim from `slides.qmd`. Present from a second screen with `deck.md` open. The eight
interactive slides *do* carry their notes in AhaSlides, because they were created through
the API.

## Files

| File | What it is |
|---|---|
| `deck.md` | **Source of truth.** All 44 slides, all 31 speaker notes, the 8 interactive slides in full. Edit this, then regenerate. |
| `build_deck_json.py` | `deck.md` → `deck.json`, with validation. Refuses to write on any failure. |
| `deck.json` | Machine-readable deck. |
| `build_payload.py` | `deck.json` → `payload.json` (MCP call bodies for the interactive slides) + the `move_slide` interleave plan. |
| `payload.json` | Generated, gitignored. |

```bash
python3 build_deck_json.py && python3 build_payload.py
```

**`build_deck_json.py` validates, and each check exists because it caught something:**
contiguous slide numbers; exactly one correct answer per quiz and none on a poll; a
question on every interactive slide; image pages running 1…36 with no gaps or duplicates;
interactive slides at exactly `[6, 13, 17, 20, 25, 29, 32, 42]`; and **every content
slide's title still matching the corresponding page of `../slides/slides.qmd`** — so if
the Quarto deck is edited and re-rendered, the build fails instead of silently leaving
`deck.md` describing images that no longer exist.

**No `images.json`.** The bridge deck ships one, holding signed CDN URLs for nine
individually uploaded figures — an artifact of the pre-image architecture, and the
signatures expire. Under the image architecture the PDF carries every figure, so nothing
is uploaded separately and there is nothing to record.

## If you rebuild

The post links to the share URL above, so **rebuild presentation `10042312` in place** —
never create a replacement. The doc's *Rebuild an existing deck in place* section has the
sequence. Slide IDs change when a slide's type is converted, so always re-fetch the
authoritative list before deleting anything, and match slides on `order`, never on
position in a returned array — `create_slides` does not return IDs in input order.
