# AhaSlides deck — Jamuna Bridge DiD

An interactive AhaSlides version of the post's Quarto reveal.js deck
(`../slides/slides.qmd`), built through the **AhaSlides MCP server**.

All 30 content slides of the Quarto deck are carried over 1:1 — same titles, same
order, same four acts — with 8 interactive slides inserted at the points where the
Quarto speaker notes already tell the presenter to work the room.

| | |
|---|---|
| **Public view link** | <https://presenter.ahaslides.com/share/1789007350719-n7drztywna> |
| **Editor** | <https://presenter.ahaslides.com/presentation/10040213> |
| **Audience join code** | `Q6U4S` (live sessions only) |
| Presentation ID | `10040213` |
| Theme | Meeting (`#000000` base, `#ffffff` text) |
| Total slides | 44 |
| Figures | 9, uploaded to the AhaSlides CDN |
| Language | English only |

The public view link is self-paced: anyone can page through the deck without a live
session. **Speaker notes are excluded from it** ("Include slide notes" is off) —
they are presenter-only and live in `deck.md`. Comments are enabled on that link.

## Slide inventory

| Type | Count | Used for |
|---|---|---|
| `content` | 6 | Cover, 4 act dividers, closing statement |
| `listing` | 21 | Every bulleted content slide, incl. the 4 former tables |
| `content_with_title_and_right_image` | 9 | The figure slides |
| `pick_answer_quiz` | 4 | Scored quizzes |
| `poll` | 1 | Opening prediction poll |
| `word_cloud` | 1 | Confounder brainstorm |
| `scale` | 1 | Confidence rating |
| `open_ended_survey` | 1 | Closing Q&A |

---

## Files

| File | What it is |
|---|---|
| `deck.md` | **Source of truth.** Every slide: title, bullets, image, speaker notes, and for interactive slides the options, correct answer and points. Edit this. |
| `deck.json` | Machine-readable form. **Generated — do not hand-edit.** |
| `build_deck_json.py` | Parses `deck.md` → `deck.json`. Run after any edit to `deck.md`. |

```bash
cd content/post/python_bridge_impact/ahaslides
python3 build_deck_json.py     # 44 slides: 30 content, 5 heading, 8 interactive, 1 title
```

---

## Setup

### 1. Register the MCP server

```bash
claude mcp add ahaslides --scope user --transport http https://mcp.ahaslides.com/mcp
```

`--scope user` keeps the server out of the site repo (this project ships no
`.mcp.json`). Then `/mcp` → **ahaslides** → **Authenticate**; a browser opens for
AhaSlides sign-in. **There is no API key** — it is OAuth 2.0. A restart of Claude
Code may be needed before the tools appear. Confirm with
`claude mcp list | grep ahaslides` (want `✔ Connected`).

---

## Building the deck — use the NATIVE slide types, not `content-v2`

This is the one hard-won lesson of the build, and it will save you an hour.

The MCP server's own instructions strongly push **`content-v2`**, a free-form
1280x720 canvas driven by a DSL. **Do not use it here.** Through the MCP,
`create_slides` and `update_slide_content` both *store* `slide_attributes.dsl`
faithfully, but the DSL is never compiled into `canvasBlocks` — the slide renders
**completely blank** for presenter and audience alike, with no error anywhere in
the API response or the browser console. It only renders after a human opens the
slide in the editor and applies a Layout by hand, which defeats the point of
automating it.

The **native types render server-side and work first time**. You can tell the
difference immediately: a successful create/update response contains a populated
`canvasBlocks` object (and a `canvasBlocksUrl`); a content-v2 one has
`canvasBlocks: null`. Use that as your check.

| Slide role | Type | Key fields |
|---|---|---|
| Title, dividers, closing | `content` | `heading`, `paragraphs` (array, **never** `body`) |
| Bulleted content | `listing` | `heading`, `items` (array of strings) |
| Figure slide | `content_with_title_and_right_image` | `heading`, `image_url`, `sub_heading`, `image_description` |
| Interactive | `poll`, `pick_answer_quiz`, `word_cloud`, `scale`, `open_ended_survey` | `heading`, `options` |

Every type also accepts `notes` for speaker notes. **`update_slide_content`
replaces the whole slide**, so resend `notes` with any update or they are wiped.

### Rebuilding from scratch

Ask Claude Code, with the ahaslides MCP connected:

> Build the AhaSlides deck from `content/post/python_bridge_impact/ahaslides/deck.json`
> using the ahaslides MCP and the NATIVE slide types (listing / content /
> content_with_title_and_right_image) — not content-v2. Create all 44 slides in `n` order.

Order matters: `create_slides` appends, so create in ascending `n`.

### Figures

Upload each with `upload_image` (it accepts a public `image_url` and rehosts it to
the AhaSlides CDN) and use the returned URL. Do **not** hot-link
carlos-mendez.org directly — the renderer blocks foreign image URLs.

| # | File | → Slide |
|---|---|---|
| 1 | `python_bridge_impact_01_hinterland_geography.png` | 11 |
| 2 | `python_bridge_impact_07_did_2x2.png` | 13 |
| 3 | `python_bridge_impact_10_event_study_nightlights.png` | 16 |
| 4 | `python_bridge_impact_09_covariate_balance.png` | 20 |
| 5 | `python_bridge_impact_12_heterogeneity_by_distance.png` | 27 |
| 6 | `python_bridge_impact_13_public_goods_placebo.png` | 31 |
| 7 | `python_bridge_impact_15_honest_did_sensitivity.png` | 32 |
| 8 | `python_bridge_impact_19_reproduction_audit.png` | 36 |
| 9 | `python_bridge_impact_18_trimL_forensics.png` | 38 |

`sub_heading` renders in a 564x96 box at 32px — **keep it under about 60
characters** or it clips silently. The nine captions are written to length in
`gen`-side `SUBS`; the same limit applies if you rewrite them.

---

## Free-plan limits actually observed on this account

These differ from what the AhaSlides marketplace page advertises, so check before
you rely on them:

- **Slide cap.** At 44 slides the editor shows *"You have reached the free slide
  limit. To remove the limit, please upgrade or delete some 👑 slides."* The deck is
  complete and every slide renders, but you cannot add more without upgrading.
- **Premium slide types.** Three of the eight interactive slides carry a 👑 badge and
  are premium: **Word Cloud (18)**, **Rating Scale (34)** and **Open Ended (44)**.
  `poll` and `pick_answer_quiz` are free. Expect the crowned three to be limited or
  blocked in a live session on the free plan — test before you teach.
- **Participants.** The editor's participant counter reads **0 / 3**, not the 50 the
  marketplace page advertises. Verify your own plan page before a large session.

If a live session must include all eight interactive slides, either upgrade or drop
the three crowned ones — the deck still works, losing the confounder word cloud, the
confidence rating and the closing Q&A.

---

## Running a live session

1. Open the editor and click **Present**.
2. The audience joins at `ahaslides.com/Q6U4S` — no account needed on their side.
3. Interactive slides advance only when you choose; results stay on screen.

Two slides need preparation:

- **Slide 5** is a prediction poll with no correct answer. Screenshot the result or
  keep it open in a second tab — **slide 25 calls back to it**, and the callback only
  works if you can show the room what it predicted earlier.
- **Slide 18** is the word cloud. Take the two most popular answers and ask aloud
  whether each one *stops at the Jamuna*. Almost none do — they are national shocks,
  which the Padma hinterland differences out. That is the identification argument,
  built by the room instead of asserted from the podium.

Speaker notes are attached to all 36 non-divider slides and show in the presenter
view; they are also in `deck.md` if you prefer a second screen.

## Getting the results back

> Using the ahaslides MCP, get the quiz scores and poll results from the most recent
> session of the Jamuna Bridge presentation.

Worth checking afterwards:

- **Slide 15** (parallel trends). Many picking A or B means the levels-vs-trends
  misconception survived — spend longer on slide 14 next time.
- **Slide 28** (distance terciles). A heavy majority on "nearest" is the *expected*
  result and makes slide 30 land harder.
- **Slide 5 vs slide 25.** The gap between what the room predicted and what the data
  say is the best single measure of whether the deck did its job.

---

## Known differences from the Quarto deck

- **No bold runs.** `listing` and `content` fields are plain text, so the `**bold**`
  emphasis in `deck.md` is stripped on the way in. `deck.md` keeps it for reference.
- **Tables became bullet lists** (slides 7, 22, 24, 29). `deck.json` records the
  original table shape in each slide's `sourceNote`.
- **Takeaway lines are prefixed `→`** rather than styled as a separate emphasised
  block, which is what `.takeaway` does in the Quarto deck.
- **No fragments.** Quarto reveals bullets one at a time; AhaSlides shows the list.
- **No MathJax.** Slides 12 and 14 carry the two formulas as Unicode plain text.
- **Figures sit in a right-hand column** (620x720), not full width.
- **Act divider colours are not reproduced.** The Quarto deck colours each divider
  from the site palette; AhaSlides applies one deck-wide theme, so all five dividers
  share the Meeting theme's background.

## Related

- Quarto deck: `../slides/slides.qmd` → `/post/python_bridge_impact/slides/`
- Post: <https://carlos-mendez.org/post/python_bridge_impact/>
- AhaSlides MCP: <https://ahaslides.com/marketplace/mcp-server/>
