# AhaSlides deck for `python_sc_bayes_spatial`

**Date:** 2026-09-10
**Post:** `content/post/python_sc_bayes_spatial/` — *Who Else Was Treated?*
**Presentation:** `10042312` · https://presenter.ahaslides.com/share/1789021577046-xkh2lwuly9

Second application of the AhaSlides workflow, and the first time it ran from
`.claude/docs/ahaslides.md` as documentation rather than discovery. The procedure held;
one documented claim did not.

## What was built

44 slides: the Quarto deck's 36 pages imported as full-bleed images, plus 8 interactive
slides interleaved at `[6, 13, 17, 20, 25, 29, 32, 42]` — 6 scored quizzes and 2 polls,
each placed where the `slides.qmd` speaker notes already tell the presenter to work the
room. The design's spine is a callback pair: slide 6 asks the audience to predict the sign
of the Nevada spillover while cross-border shopping is still the obvious story; slide 29
cashes it in after the −5.50 reveal.

Content slides are images, so all 31 speaker notes live in `ahaslides/deck.md` — notes
cannot be attached to imported slides.

## The correction that mattered

`.claude/docs/ahaslides.md` stated that `poll` and `pick_answer_quiz` were free and only
Word Cloud / Rating Scale / Open Ended were premium. **That was wrong**, and it was acted
on before it was caught: the user had chosen "free types only" specifically to keep the
50-participant cap.

Measured on this deck, in order:

| Deck state | Editor reports |
|---|---|
| 36 images, 0 interactive | *"up to 50 live participants"*, no crowns |
| + 2 polls + 6 quizzes | *"reached the free slide limit"*, **0 / 3**, quizzes crowned 👑 |
| all 6 quizzes → polls | **unchanged** — all 8 polls crowned, still 0 / 3 |

The free allowance is a **count of interactive slides of any type**, not a set of premium
types. The original wrong reading came from one look at the editor in which the two polls
showed no crown — the editor recomputes crowns lazily, so a freshly created slide can look
free for several minutes.

The conversion to polls was reverted (it bought nothing, and quizzes reveal the correct
answer and keep a leaderboard). The doc now carries the measured table, an explicit
warning about stale crown state, and a reload-and-check step in *Verify*.

## Also fixed

- **Silent field truncation in `build_deck_json.py`.** A wrapped `**Title:**` or
  `**Question:**` lost everything after the first line — the parser had no continuation
  branch for scalar fields. It shipped one truncated quiz question before being caught.
  Latent in the bridge deck's copy too, where `deck.md` was hand-written unwrapped.
- **`images.json` is not carried forward.** The bridge deck's copy holds expiring signed
  CDN URLs for nine separately uploaded figures — an artifact of the pre-image
  architecture. Under the image architecture the PDF carries every figure.
- **AhaSlides' AI alt-text confabulates.** Four imported slides were described as having
  "cropped, shifted repetitions" and "large white space". Rendering those PDF pages showed
  all four are clean. The alt-text is not evidence about the render.

## Validation added

`build_deck_json.py` refuses to write on any failure, and every check was negative-tested:
contiguous slide numbers; exactly one correct answer per quiz and none on a poll; image
pages running 1…36 with no gaps or duplicates; interactive slides at the expected
positions; and **every content slide's title still matching the corresponding page of
`../slides/slides.qmd`**, so editing the Quarto deck without re-importing fails the build
instead of silently leaving `deck.md` describing images that no longer exist.

## Files

- `content/post/python_sc_bayes_spatial/ahaslides/` — `deck.md`, `deck.json`,
  `build_deck_json.py`, `build_payload.py`, `README.md` (`payload.json` gitignored)
- `content/post/python_sc_bayes_spatial/index.md` — `links:` entry after "Slides (HTML)"
- `.claude/docs/ahaslides.md` — free-plan section rewritten; `insert_after_slide_id`
  documented as the better interleave route; second worked example referenced

## Known limitation

The deck is capped at **3 live participants** on the free plan. Fine for a demo or a small
group; a class needs an upgrade. Test a live session before teaching from it.
