# FWL AhaSlides deck: paid-plan interactive rebuild

The author upgraded to the AhaSlides Education Large plan and asked for the FWL deck
(`content/post/python_fwl/ahaslides/`, presentation 10198190, join code VSXHY) to be as
interactive as possible for its first live class: GSID master's students, under 30, in
person, 90 minutes, English, laptops available. The deck was rebuilt in place, so the
post's *Interactive slides (AhaSlides)* button and share link are unchanged.

## What changed

- **Backup first:** presentation 10274590, *"BACKUP 2026-10-06 (free-plan 7-interactive
  version)"*.
- **Deck:** 34 image slides (unchanged) + 35 interactive = 69 slides, up from 41. The
  seven original slides (one prediction poll, six cue quizzes) keep their IDs. I1 got
  new notes, a 30-second timer and single choice. All quizzes got 30-second timers and
  the speed bonus.
- **28 new interactive slides** across 18 types: QR join, word cloud before and after,
  confidence scale before and after, Q&A, draw-the-DAG, categorise, two true/false,
  three spinner cold calls with participant names filled in automatically,
  fill-in-the-blanks, match pairs, two correct-order quizzes, a five-minute Colab
  short-answer stop (0.2673), two leaderboards, a 2x2 threat map, an idea board for
  the students' own confounders, a four-question rapid-fire review round, an exit
  ticket and a duck-race raffle.
- **Timing:** about 28 minutes of core activity and 15.5 more on optional slides.
  Every presenter note starts with `CORE` or `OPTIONAL: skip if behind`.
- **Editor settings (Chrome):** participant name required on join (email optional),
  Q&A on all slides. *Who takes the lead* stays on *Presenter*; switch it to
  *Audience (self-paced)* after class for review.
- **Escape room dropped.** `marketplace/escape-room-v2` was accepted by the API, but
  the editor's slide-type search has no Escape Room, and the slide was blank in the
  editor, Preview and share view. It was soft-deleted and replaced by review round R1–R4
  at the author's choice.

## Files

- New `activities.py` is the source of truth for the interactive layer (MCP bodies,
  settings, tiers, minutes, notes). `slide_ids.json` records the AhaSlides IDs.
- `build_deck_json.py` was rewritten. It now reads titles and notes from `slides.qmd`,
  validates every slide type and the no-em-dash, no-contraction writing rules, and
  generates `deck.json` and `deck.md`, the presenter copy with the run-of-show.
- `build_payload.py` was rewritten to emit per-anchor `create_slides` calls plus the
  content and property updates.
- Updated the deck `README.md`, `.claude/docs/ahaslides.md` (paid-plan behaviour, the
  `activities.py` pattern, and new constraints: property type names, spinner auto-fill,
  the escape-room gap, lazy marketplace rendering, insertion order behind existing
  slides) and the AhaSlides bullet in `CLAUDE.md`.

## Verification

- `python3 build_deck_json.py && python3 build_payload.py` pass. A broken scratch copy
  caught each of these: a bad answer letter, cue-option drift, an em dash, a
  contraction, a blank-count mismatch and an out-of-range page.
- `get_presentation_detail`: 69 slides in exactly the generated order, the 34 images in
  page order, and exactly one correct option on every pick-answer quiz.
- Editor after reload: **0 / 200** and "You can host up to 200 live participants", no
  free-slide-limit notice. I1 and I7 options display A, B, C. Spot-checked the draw,
  categorise, true/false, spinner, fill-in, match, order, short-answer, 2x2, idea-board
  and duck-race slides in the share view. The Preview join form shows the name as
  required.
- The share link returns 200.

## Still to do before class

Run a two-device dry run from the presenter view: join with a name, answer one of each
type, spin a wheel and run the duck race. Then use **Reset results**. During the dry run,
check what the categorise, match-pairs and correct-order slides show on the big screen
before the reveal.
