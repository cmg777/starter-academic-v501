# Panel-data AhaSlides deck: paid-plan interactive rebuild

The author asked for the `python_panel_intro` AhaSlides deck (presentation 10245137,
join code V62EU) to be rebuilt the same way as the FWL deck earlier the same day (see
`2026-10-06-fwl-ahaslides-interactive.md`). The deck was rebuilt in place, so the post's
*Interactive slides (AhaSlides)* button and share link are unchanged. The 33 slide
images were not touched.

## What changed

- **Backup first:** presentation 10274743, *"BACKUP 2026-10-06 (free-plan 7-quiz
  version)"*.
- **Deck:** 33 image slides + 37 interactive = 70 slides, up from 40. The seven cue
  quizzes keep their IDs, text and notes; they gained 30-second timers and the speed
  bonus.
- **30 new interactive slides:** QR join, word cloud before and after, confidence scale
  before and after, Q&A, an opening and closing poll on which premium to report (0.075,
  0.21 or both), draw a joiner's wage path, three true/false checks (schooling under FE,
  POLS significance, the gender gap under two-way FE), three spinner cold calls,
  fill-in-the-blanks on first differences, matching the FE recipes, a Colab stop
  (Section 10, fixed-effects union coefficient 0.2103), categorising the two estimator
  camps, ordering the estimates, a 2x2 threat map, an idea board, a four-question review
  round, two leaderboards, an exit ticket and a duck race.
- **Timing:** about 28 core minutes and 17.5 optional.
- **Editor settings (Chrome):** participant name required (email optional), Q&A on all
  slides; *Who takes the lead* left on *Presenter*.
- No escape room, because the FWL build showed that type is unavailable in this
  account's editor.

## Files

- `activities.py` (new) holds the interactive layer; the seven cue quizzes were copied
  programmatically from the old `deck.json` into `CUE_QUIZZES`.
- `build_deck_json.py` and `build_payload.py` were adapted from the FWL generators, and
  `slide_ids.json` was added.
- `make_deck_md.py` was removed, because `build_deck_json.py` now writes `deck.md`.
- Updated the deck `README.md` and its entry in `.claude/docs/ahaslides.md`.

## Verification

- `python3 build_deck_json.py && python3 build_payload.py` pass. The cue options match
  `slides.qmd` verbatim.
- `get_presentation_detail`: 70 slides in exactly the generated order, the 33 images in
  page order, and exactly one correct option on all 11 pick-answer quizzes.
- Editor: **0 / 200**. I1 displays A, B, C with a 30-second timer. Share view: the poll
  and the R1 review quiz display A, B, C; the fill-in passage and both categorise camps
  render.
- The share link returns 200.

## Still to do before class

Run a two-device dry run (one slide of each type, a spinner, the duck race, and the
Colab install on a fresh session), then use **Reset results**.
