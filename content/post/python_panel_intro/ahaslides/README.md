# AhaSlides deck — *Introduction to Panel Data Methods*

> **The procedure lives in [`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md)**
> — that is what a future session follows for any post. **This file records only what is
> specific to this deck.** It was rebuilt for the paid plan with the same design as
> `content/post/python_fwl/ahaslides/` (the paid-plan reference), whose generators these are.

| | |
|---|---|
| **Presentation ID** | `10245137` |
| **Editor** | https://presenter.ahaslides.com/presentation/10245137 |
| **Public view link** | https://presenter.ahaslides.com/share/1790911128481-t7x8a80cw2 |
| **Join code** | `V62EU` |
| **Plan** | Education Large (paid, from 2026-10-06): editor reports **0 / 200** participants |
| **Backup** | `10274743`, *"BACKUP 2026-10-06 (free-plan 7-quiz version)"* |
| **Theme** | Meeting (`#000000`, theme id 18468) |
| **Source deck** | `../slides/slides.qmd` → 33 printed pages |
| **Composition** | 33 image slides + 37 interactive = **70** |

## Architecture

Content slides are **images** of the real Quarto slides: `slides.qmd` rendered to a
33-page PDF and imported through the editor UI with **"Import slides"** (not the AI
options). AhaSlides contributes only the audience layer. Render the PDF with (published
URL, once the deck is deployed):

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw --virtual-time-budget=40000 \
  --print-to-pdf=deck.pdf \
  "https://carlos-mendez.org/post/python_panel_intro/slides/?print-pdf&pdfSeparateFragments=false"
```

Before a push, serve the post folder instead (`python3 -m http.server 1319` from
`content/post/python_panel_intro/`) and print
`http://127.0.0.1:1319/slides/index.html?print-pdf&pdfSeparateFragments=false`.
`pdfinfo deck.pdf` **must report 33 pages**: 1 title + 4 `#` dividers + 28 `##` slides.
The images were not re-imported on 2026-10-06; only the interactive layer changed.

## Teaching design (2026-10-06)

Same class design as the FWL deck: GSID master's students, under 30, in person,
90 minutes, English, laptops available.

- **About a third of class time in activities.** Core slides add up to about **28 min**;
  the slides marked **optional** add about **17.5 min** and are skipped live if the class
  runs late. Every new presenter note starts with `CORE` or `OPTIONAL: skip if behind`
  and a time estimate.
- **Competitive and individual.** Quizzes have 30-second timers (the review round has
  20 seconds) and faster answers earn more points (0–100). Leaderboards after Act II and
  at the end.
- **Names required on join** (Settings → Collect audience info; email optional) and
  **Q&A on all slides**, both set in the editor.
- **Cold calls** use three spinner wheels with `autoFillParticipantName`; the **duck
  race** at the end is a prize raffle.
- **Opening and closing poll.** The room commits to a number (0.075, 0.21, or both)
  before any method, and votes again at the end; the lecture argues for reporting both
  with their estimands.
- **One Colab stop** (5-minute short answer) after the three-recipes slide: run the
  notebook through Section 10 and type the fixed-effects union coefficient, **0.2103**.
  The notebook installs `pyfixest` and `linearmodels` first, so the QR-slide notes ask
  students to start the install at the beginning of class.
- **Self-paced review after class:** Settings → *Who takes the lead* → **Audience
  (self-paced)**. Leave it on *Presenter* for the live class.

## Interactive slides

37 in total. Full text, options, answers, settings and presenter notes are in `deck.md`;
the source is `activities.py`.

| Phase | After page | Slides |
|---|---|---|
| Opening | 1 | N1 QR join · N2 word cloud · N3 confidence scale (pre) · N4 Q&A |
| Act I | 3 | N5 gut-call poll: which premium would you report? |
| Act II | 6–24 | N6 draw a joiner's wage path *(opt)* · I1 within share (cue) · N7 true/false on schooling *(opt)* · N8 spinner on the teal lines *(opt)* · N9 true/false on POLS significance *(opt)* · I2 FD vs POLS (cue) · N10 fill-in on first differences · I3 FE vs FD (cue) · N11 match the FE recipes · N12 **Colab stop** · I4 two-way FE (cue) · N13 true/false on the gender gap *(opt)* · N14 spinner on RE *(opt)* · I5 robust Hausman (cue) · I6 CRE (cue) · N15 categorise the two camps · N16 leaderboard |
| Act III | 25–32 | N17 order the estimates *(opt)* · N18 spinner on within SEs *(opt)* · I7 age under two-way FE (cue) · N19 2x2 threats to the within estimate *(opt)* · N20 idea board of own panel questions *(opt)* · R1–R4 rapid-fire review · N21 final leaderboard |
| Closing | 33 | N22 the poll again *(opt)* · N23 word cloud again *(opt)* · N24 confidence scale (post) · N25 exit ticket · N26 duck race |

I1–I7 are the seven cue quizzes of the first build, kept with their IDs, text and notes;
only their timers and speed bonus changed. Each repeats its "Before you look" cue's
options verbatim, and the build fails if they drift. Their correct letters are spread
(A ×3, B ×3, C ×1); the review round adds B, C, A, B.

**Options are lettered and sent reversed** (AhaSlides displays them in reverse payload
order); verified on 2026-10-06 that the polls, I1 and R1 display A, B, C.

## Speaker notes

The 33 image slides cannot carry notes in AhaSlides, so their notes live in `deck.md`
(read verbatim from `slides.qmd`). Every interactive slide carries its notes in
AhaSlides.

## Files

| File | What it is |
|---|---|
| `activities.py` | **Source of truth** for the 37 interactive slides: placement, tier, minutes, the exact `create_slides` body, property settings and notes. The cue quizzes were copied verbatim from the first build. |
| `build_deck_json.py` | `slides.qmd` + `activities.py` → `deck.json` + `deck.md`, with validation. Writes nothing on any failure. |
| `deck.md` | Generated presenter copy: run-of-show table with answers and timing, then all 70 slides with notes. Do not edit by hand. |
| `deck.json` | Generated machine-readable deck. |
| `build_payload.py` | `deck.json` → `payload.json`: one `create_slides` call per anchor page plus all `update_slide_properties` bodies. |
| `payload.json` | Generated, gitignored (`../.gitignore`). |
| `slide_ids.json` | AhaSlides IDs of the 37 interactive slides, for later edits. |

```bash
python3 build_deck_json.py && python3 build_payload.py
```

`make_deck_md.py` (the 2026-10-02 generator) was removed: `build_deck_json.py` now writes
`deck.md` itself. The validation is the FWL set: page count, cue placement and verbatim
cue options, one valid correct letter per quiz, per-type shape rules, notes and timers
on every slide, and the no-em-dash, no-contraction, no-possessive rules on new text.

## Before class

1. **Dry run with two devices:** start the presentation, join from a phone with a name,
   answer one slide of each type, spin a wheel, run the duck race, and run the Colab stop
   once on a fresh Colab session to time the install.
2. **Reset results** afterwards (Settings → Reset results).

## Rebuild log

**2026-10-02 — first build** (free plan): 33 images + 7 cue quizzes, capped at 3 live
participants.

**2026-10-06 — paid-plan interactive rebuild.** Backup `10274743`. Added 30 interactive
slides in one pass (no escape room: that type is not available in this account's editor;
see the doc), retimed I1–I7, set names-required and Q&A on all slides. Verified: 70 slides
in the planned order, images in page order, one correct option on all 11 pick-answer
quizzes, 0 / 200 participant badge, spot checks of the poll, fill-in, categorise and
review slides in the share view, share link 200. See
`logs/2026-10-06-panel-ahaslides-interactive.md`.
