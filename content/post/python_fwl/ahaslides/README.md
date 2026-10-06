# AhaSlides deck — *The FWL Theorem: Making Multivariate Regressions Intuitive*

> **The procedure lives in [`.claude/docs/ahaslides.md`](../../../../.claude/docs/ahaslides.md)**
> — that is what a future session follows for any post. **This file records only what is
> specific to this deck.** This is the first deck rebuilt for the paid plan with the full
> range of interactive types; copy its `activities.py` + generators for the next one.

| | |
|---|---|
| **Presentation ID** | `10198190` |
| **Editor** | https://presenter.ahaslides.com/presentation/10198190 |
| **Public view link** | https://presenter.ahaslides.com/share/1790567562708-72xqh62ban |
| **Join code** | `VSXHY` |
| **Plan** | Education Large (paid, from 2026-10-06): editor reports **0 / 200** participants, no crowns |
| **Backup** | `10274590`, *"BACKUP 2026-10-06 (free-plan 7-interactive version)"* |
| **Theme** | Meeting (`#000000`, theme id 18468) |
| **Source deck** | `../slides/slides.qmd` → 34 printed pages |
| **Composition** | 34 image slides + 35 interactive = **69** |

## Teaching design (2026-10-06)

Built for the first live class with this deck: GSID master's students, under 30, in
person, 90 minutes, English, laptops available. Decisions the author made:

- **About a third of class time in activities.** Core slides add up to about **28 min**;
  the slides marked **optional** add about **15.5 min** and are skipped live if the class
  runs late. Every presenter note starts with `CORE` or `OPTIONAL: skip if behind` and a
  time estimate.
- **Competitive and individual.** Quizzes have 30-second timers (the final review round
  has 20 seconds) and faster answers earn more points (0–100 per question). Leaderboards
  after Act II and at the end.
- **Names required on join** (Settings → Collect audience info; email stays optional),
  so the leaderboard, the spinners and the exit ticket carry real names.
- **Q&A open on every slide** (Settings → Q&A → On all slides), anonymous allowed.
- **Cold calls** use spinner wheels with `metadata.autoFillParticipantName: true`: the
  wheel fills itself with the names of the students who joined. The **duck race** at the
  end is a prize raffle among everyone who joined.
- **One Colab stop** (5-minute short answer): students run the post's notebook through
  Section 9 and type the printed `beta_1 = Cov / Var`, **0.2673**.
- **Self-paced review after class:** Settings → *Who takes the lead* → **Audience
  (self-paced)**. Leave it on *Presenter* for the live class and switch afterwards.

## Interactive slides

35 in total. Full text, options, answers, settings and presenter notes are in `deck.md`;
the source is `activities.py`.

| Phase | After page | Slides |
|---|---|---|
| Opening | 1 | N1 QR join · N2 word cloud · N3 confidence scale (pre) · N4 Q&A |
| Act I | 4 | I1 prediction poll (cue) |
| Act II | 7–27 | N5 draw the DAG *(opt)* · N6 categorise variables · N7 true/false on p = 0.365 *(opt)* · N8 spinner *(opt)* · I2 quiz (cue) · N9 fill-in OVB identity · N10 match symbols · N11 order the FWL steps · N12 **Colab stop** · I3 quiz (cue) · N14 true/false on the intercept SE *(opt)* · N13 spinner *(opt)* · I4, I5, I6 quizzes (cues) · N15 leaderboard |
| Act III | 28–33 | N16 order the estimates *(opt)* · N17 Simpson spinner *(opt)* · N18 2x2 threats *(opt)* · N19 idea board of own confounders *(opt)* · I7 DML quiz · R1–R4 rapid-fire review · N21 final leaderboard |
| Closing | 34 | N22 word cloud again *(opt)* · N23 confidence scale (post) · N24 exit ticket · N25 duck race |

I1–I7 are the seven slides of the first build, kept with their IDs; the six cue quizzes
repeat the A/B/C options of the "Before you look" slides verbatim (the build checks it).
I1 got new notes, a 30-second timer and single choice; the others got the timer and the
speed bonus only.

**Escape room removed.** An `escape-room-v2` slide (Space Station theme) was created as
the final review. The API accepted it, but this account's editor does not list the
type, and the editor, Preview and share view all showed it blank. It was soft-deleted
(slide `161234449`) and replaced by the R1–R4 round on the author's choice.

## Option order: lettered and sent reversed

AhaSlides displays poll and pick-answer options in **reverse payload order** (order
values 1, 0.5, 0.25, ...). `build_payload.py` letters each option ("A. ...") and sends the
list reversed so it displays A, B, C. Verified again on 2026-10-06 in the editor and the
share view (I1, I7). Categorise, match-pairs and correct-order slides shuffle for the
audience anyway, so they are sent in answer order.

## Speaker notes

The 34 image slides cannot carry notes in AhaSlides, so their notes live in `deck.md`
(read verbatim from `slides.qmd`). Every interactive slide carries its notes in
AhaSlides. Present from a second screen with `deck.md` open, or use the presenter notes.

## Files

| File | What it is |
|---|---|
| `activities.py` | **Source of truth** for the 35 interactive slides: placement, tier, minutes, the exact `create_slides` body, property settings and notes. |
| `build_deck_json.py` | `slides.qmd` + `activities.py` → `deck.json` + `deck.md`, with validation. Writes nothing on any failure. |
| `deck.md` | Generated presenter copy: run-of-show table with answers and timing, then all 69 slides with notes. Do not edit by hand. |
| `deck.json` | Generated machine-readable deck. |
| `build_payload.py` | `deck.json` → `payload.json`: one `create_slides` call per anchor page, the I1 content update, and all `update_slide_properties` bodies. |
| `payload.json` | Generated, gitignored (`../.gitignore`). |
| `slide_ids.json` | AhaSlides IDs of the 35 interactive slides, for later edits. |

```bash
python3 build_deck_json.py && python3 build_payload.py
```

**`build_deck_json.py` validates:** `slides.qmd` still has 34 pages; unique activity IDs
listed in page order; the six cue quizzes follow exactly the six "Before you look"
pages and repeat their options verbatim; one valid correct letter per quiz and none on a
poll; per-type shape rules (categorise items unique, 2–4 match pairs, correct-order
positions 1..n ≤ 7, fill-in markers equal blanks with drop-downs containing the answer,
true/false and 2x2 titles mirrored into `config.question`, 2x2 axis labels ≤ 30
characters, idea-board group IDs unique); every slide has notes and every scored quiz a
timer; and the author's writing rules on all new text (no em dashes, contractions or
possessives). Each check was confirmed to fire on a deliberately broken copy.

## Before class

1. **Dry run with two devices:** start the presentation, join from a phone with a name,
   answer one slide of each type, spin a wheel, run the duck race. Check in particular
   what the categorise, match-pairs and correct-order slides show on the big screen
   *before* the reveal (the share view shows them in their answer layout).
2. **Reset results** afterwards (Settings → Reset results) so the class starts clean.
3. Have the Colab link ready: the post's *[Python] Google Colab* button.

## Rebuild log

**2026-09-28 — first build** (free plan): 34 images + 7 interactive (1 poll, 6 quizzes),
capped at 3 live participants.

**2026-09-30 — fast-food reframe.** The post's story moved from a retail chain to a
fast-food chain with every number unchanged; the 34 images were re-imported in place
(backup `10220004`) and the notes of I5/I6 resent.

**2026-10-06 — paid-plan interactive rebuild.** Backup `10274590`. Added 28 interactive
slides (25 new types and positions, then the escape room swapped for R1–R4), retuned I1–I7,
set names-required, Q&A on all slides, spinner auto-fill. Verified: 69 slides in the
planned order, images in page order, one correct option per quiz, 0 / 200 participant
badge with no free-slide-limit notice, share link 200. See
`logs/2026-10-06-fwl-ahaslides-interactive.md`.
