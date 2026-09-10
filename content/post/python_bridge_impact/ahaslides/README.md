# AhaSlides via MCP — build notes and playbook

This folder holds the AhaSlides version of the post's Quarto reveal.js deck
(`../slides/slides.qmd`), and — more usefully — **everything learned building it**,
so the next deck takes an hour instead of an afternoon.

Read **[Start a new deck](#start-a-new-deck-from-this-one)** if you are here to reuse
this for another project. Read **[The content-v2 trap](#the-content-v2-trap)** before
you change how slides are created; it is the one mistake that costs real time.

| | |
|---|---|
| **Public view link** | <https://presenter.ahaslides.com/share/1789007350719-n7drztywna> |
| **Editor** | <https://presenter.ahaslides.com/presentation/10040213> |
| **Audience join code** | `Q6U4S` (live sessions only) |
| Presentation ID | `10040213` |
| Theme | Meeting (`#000000` base, `#ffffff` text) |
| Slides | 44 — 1 cover, 5 act dividers, 30 content, 8 interactive |
| Figures | 9, uploaded to the AhaSlides CDN |

The public link is self-paced: anyone can page through without a live session.
**Speaker notes are excluded from it** ("Include slide notes" off) — they are
presenter-only. Comments are enabled on it.

---

## The five rules

Everything below is elaboration. If you remember only this:

1. **Never use `content-v2`.** It silently renders blank. Use `content`, `listing`,
   `content_with_title_and_right_image`.
2. **`canvasBlocks` in the API response is your proof.** Populated = the slide will
   render. `null` = it will not. Check it on every create.
3. **`create_slides` appends.** Create in ascending slide order, or spend the evening
   reordering.
4. **`update_slide_content` replaces the entire slide.** Resend `notes` or they vanish.
5. **Verify in the browser, twice** — editor *and* Preview — after a hard reload. The
   editor renders lazily and will lie to you.

---

## The pipeline

```
deck.md  ──build_deck_json.py──▶  deck.json  ──build_payload.py──▶  payload.json
(you edit)                        (validated)                       (feed to MCP)
                                                    images.json ───────┘
```

| File | Role |
|---|---|
| `deck.md` | **Source of truth.** Every slide: title, bullets, image, speaker notes; for interactive slides the options, correct answer, points. This is the only file you hand-edit. |
| `build_deck_json.py` | Parses `deck.md` → `deck.json`. Also a validator. |
| `deck.json` | Machine-readable deck. Generated — never hand-edit. |
| `images.json` | `{source filename: AhaSlides CDN url}`, from `upload_image`. |
| `build_payload.py` | `deck.json` + `images.json` → `payload.json`, the MCP call bodies. |
| `payload.json` | Generated, gitignored. |

```bash
cd content/post/python_bridge_impact/ahaslides
python3 build_deck_json.py     # 44 slides: 30 content, 5 heading, 8 interactive, 1 title
python3 build_payload.py       # wrote payload.json: 44 slides {...}
```

Why two steps: `deck.json` is the *content* (render-target agnostic, worth keeping if
AhaSlides ever changes or you port to another tool); `payload.json` is the *API shape*
(disposable, regenerate freely).

**The generators are also the tests.** `build_deck_json.py` fails loudly if a quiz has
no correct answer or a referenced figure is missing from disk; `build_payload.py`
reports any bullet over 175 characters. Both caught real bugs during this build — one
had silently stripped the bold from all 106 emphasised runs.

---

## Setup

```bash
claude mcp add ahaslides --scope user --transport http https://mcp.ahaslides.com/mcp
```

- `--scope user` keeps the server out of the site repo (this project ships no
  `.mcp.json`, and MCP config does not belong next to content).
- Then `/mcp` → **ahaslides** → **Authenticate**. A browser opens; sign in.
  **There is no API key** — OAuth 2.0 against your existing account.
- **A newly added server is not visible to the running session.** `claude mcp list`
  will see it while Claude Code does not. Exit and `claude --continue` to resume the
  same conversation with the tools loaded.
- Confirm: `claude mcp list | grep ahaslides` → `✔ Connected`.

---

## Build procedure

### 1. Discovery — three calls, before writing anything

```
list_slide_types()                       # what exists in this deployment
load_slide_type_specs(["listing","content","content_with_title_and_right_image",
                       "poll","pick_answer_quiz","word_cloud","scale",
                       "open_ended_survey"])
get_themes()                             # official presets only
```

Do this even if you have built a deck before — it is cheap, and the spec text is where
the real field names live (`paragraphs`, not `body`; that one is called out explicitly
in the spec because everyone gets it wrong).

### 2. Pick the theme before you write a slide

`get_themes` returns **official presets only** — no custom themes, no hex, and *no
per-slide background colour* through the native types. One theme covers the deck.

**Choose it from your figures' background, not your taste.** These figures are
`#0f1729` dark navy (`analysis.py` sets `savefig.facecolor = DARK_NAVY`), so a light
theme would have shown nine dark rectangles floating on white. "Meeting" (`#000000`)
was chosen so the figure edges disappear. If your next project's figures are on white,
invert this and pick a light preset.

Consequence: the Quarto deck's per-act divider colours (warm orange / steel blue /
teal / heading blue) **cannot be reproduced**. Don't design around them.

### 3. Upload figures

Use the MCP `upload_image` with the public URL of each figure; it fetches server-side
and rehosts to the AhaSlides CDN. **Do not hot-link your own domain** — the renderer
blocks foreign image URLs. Save the returned `url` per source filename into
`images.json`.

The returned URLs are signed and carry an `Expires` stamp. They work inside the
presentation indefinitely (AhaSlides re-signs internally); treat `images.json` as a
record of the mapping, and just re-upload if you ever rebuild from scratch.

### 4. Create slides in order, in batches

`create_slides` **appends**, so send ascending slide order. Batches of 6–10 work well:
big enough to be quick, small enough that one bad field doesn't cost the whole run.

**The returned ID array is not in your input order.** Do not zip your payload against
it by position — match on the `order` field in the response, or re-fetch. This will
bite you when you go to patch a specific slide later.

### 5. Verify (see [Verification](#verification))

---

## Slide types that work

Every type also accepts `notes` (speaker notes). All the field names below are the
real ones — copy them.

| Role | `slide_type` | Fields |
|---|---|---|
| Cover, act dividers, closing statement | `content` | `heading`, `paragraphs` — **an array of strings, never `body`** |
| Any bulleted slide | `listing` | `heading`, `items` (array of strings) |
| Figure slide | `content_with_title_and_right_image` | `heading`, `image_url`, `sub_heading`, `image_description` |
| Prediction poll (no right answer) | `poll` | `heading`, `options: [{text}]` |
| Scored quiz | `pick_answer_quiz` | `heading`, `options: [{text, correct}]` |
| Free-text cloud | `word_cloud` | `heading` |
| Rating | `scale` | `heading`, `options: [{text}]`, `scale_config` |
| Open question | `open_ended_survey` | `heading` |

### Layout boxes you cannot exceed

These are fixed by the type; text that overflows is **clipped silently**.

| Slide type | Element | Box | Practical limit |
|---|---|---|---|
| `listing` / `content` | heading | 1120px, 48px bold | ~2 lines |
| `listing` | items | 1120×450 | ~6–7 bullets, keep each under ~175 chars |
| `content_with_title_and_right_image` | heading | 564×136 @52px | ~3 lines |
| `content_with_title_and_right_image` | `sub_heading` | 564×96 @32px | **~60 characters** |
| `content_with_title_and_right_image` | image | 620×720, right column | wide charts stay legible |

The `sub_heading` limit is the one that catches you — it clips mid-word with no
warning. Write those captions to length rather than truncating prose; auto-truncated
notes read badly ("Every upazila plotted by its distance to each of the two…").

### What `pick_answer_quiz` does *not* expose

No points or timer fields. `deck.md` records `1000 points / 30 s`, but the MCP applies
AhaSlides defaults (25 s, 0–100 points). Adjust in the editor, or via
`update_slide_properties_tool` with `type: "multipleChoiceQuizQuestion"` and
`minPoint` / `maxPoint` / `timeToAnswer`.

---

## The content-v2 trap

**Symptom:** you create slides, the API says `"success": true`, the DSL round-trips
perfectly when you read it back — and every slide is **blank**. Presenter view, Preview
view, audience view. No error in the response. No error in the browser console.

**The MCP's own instructions tell you to use it.** They describe `content-v2` as the
preferred type for static slides, "professionally designed templates", "far better
looking". It has a documented DSL, a layouts catalogue, a grammar reference. All of
that machinery exists. Through the MCP it does not render.

**Cause:** `create_slides` and `update_slide_content` both persist
`slide_attributes.dsl` faithfully, but nothing ever compiles it into `canvasBlocks`.
The slide renders only after a human opens it in the editor and clicks a Layout, which
defeats the purpose of automating it.

**The one-line diagnostic:**

```
canvasBlocks: {...}   → the slide will render
canvasBlocks: null    → it will not
```

Native types come back with it populated on the very first `create_slides`. content-v2
never does.

### False leads — don't repeat these

Hours went into hypotheses that were all wrong. The DSL was never the problem:

- ❌ *Pixel `x=/y=/w=/h=` vs anchor `at=` positioning.* Rewrote the whole generator to
  anchor-only. No change.
- ❌ *`preset=title` unsupported.* Swapped to `preset=display`. No change.
- ❌ *Percentage vs pixel widths.* No change.
- ❌ *Multi-slide vs single-slide update calls.* No change.
- ❌ *Stale editor render.* Hard reloads, waits. No change.

The misleading moment: one divider slide **did** render, which made it look like a DSL
syntax difference. It rendered because it had been touched in the editor. Later, a
content slide rendered right after a Layout was clicked — that was the tell.

**If you ever need content-v2** (per-slide colours, custom layouts), the only reliable
path is to create the slide, then apply a Layout by hand in the editor per slide.
For a 44-slide deck that is not worth it.

---

## Other gotchas, in the order they bit

1. **`update_slide_content` replaces the whole slide.** Update a caption without
   resending `notes` and the notes are gone. Always send the complete object.
2. **Returned IDs are unordered** relative to your input array (see step 4 above).
3. **Markdown does not render in native fields.** `**bold**` appears as literal
   asterisks — strip it. `deck.md` keeps the emphasis for reference; `build_payload.py`
   strips it on the way out. Backticks too: `` `ln(0)` `` becomes a literal backtick.
4. **Bullet lists *do* render** — `items` becomes a real `<ul><li>`.
5. **Speaker notes accept plain text only** and are excluded from the public share
   link if you leave "Include slide notes" unchecked. Leave it unchecked: these notes
   contain presenter instructions ("Do not comment on the split"), not audience content.
6. **MCP responses are enormous.** A 10-slide `create_slides` response is tens of
   thousands of tokens because it echoes every field of every slide. Batch 6–10, and
   generate payloads with a script rather than composing them inline.
7. **A newly added MCP server needs a session restart** (see Setup).

---

## Verification

Do all four. Steps 3 and 4 are the ones that catch real defects.

1. **`canvasBlocks` populated** in every create/update response.
2. **`get_presentation_detail_tool`** — slide count, order, and that each quiz has
   exactly one `correct: true`.
3. **Editor, after a hard reload.** The editor renders lazily; a screenshot taken
   immediately after a write can show blank for a slide that is fine. Reload, wait,
   then click the slide.
4. **Preview** (the `?preview=true` view). This is what the audience sees and it is
   the authoritative check — a slide can look right in the editor and be empty here.

Spot-check at minimum: the cover, one divider, one dense bullet slide, one figure
slide, one quiz. That covers every layout in the deck.

---

## Free-plan limits actually observed

These **differ from what the AhaSlides marketplace page advertises**, so check your own
account rather than trusting the docs:

- **Slide cap.** At 44 slides the editor shows *"You have reached the free slide limit.
  To remove the limit, please upgrade or delete some 👑 slides."* The deck is complete
  and every slide renders — you just cannot add more.
- **Premium slide types.** Three of the eight interactive slides carry a 👑 badge:
  **Word Cloud (18)**, **Rating Scale (34)**, **Open Ended (44)**. `poll` and
  `pick_answer_quiz` are free.
- **Participants.** The counter reads **0 / 3**, not the 50 the marketplace page
  advertises.

**Test a live session before teaching from it.** If the cap really is 3, the
interactive slides will not work with a class, and the deck degrades to a linear
presentation. The public view link is unaffected.

If you must stay free and keep interaction: drop the three crowned slides and rely on
the poll plus four pick-answer quizzes, which is still five audience checkpoints.

---

## Design decisions worth reusing

The interaction design carried more weight than the layout work, and it ports directly:

- **Put interactive slides where the source deck's speaker notes already ask for
  audience work.** Three of the eight here came straight from Quarto `::: {.notes}`
  lines — slide 17's "Make the audience do the work here" became the word cloud. Don't
  invent engagement points; find the ones already in the talk.
- **Open with a prediction poll, before naming the theories.** The room commits before
  it has vocabulary to hide behind.
- **Close the loop.** Slide 5 asks what happens to the factories; slide 25 asks which
  outcome discriminates. Show the slide 5 bar chart again before revealing 25 — the
  room sees its own wrong answer next to the data. This is the single most effective
  thing in the deck.
- **Ask before you reveal, wherever the source deck says "ask the audience".** Slide 28
  makes the room commit to a distance tercile; slide 30's explanation lands much harder
  after they have been wrong.
- **Make a hedge into a number.** Slide 34 turns "the result is moderately robust" into
  a 1–5 rating the room owns.
- Ratio here is 8 interactive in 44 (18%). The MCP guidance suggests 30–50%; that is
  tuned for corporate workshops and would shred a technical argument. Judge by the
  material.

---

## Start a new deck from this one

1. **Copy the folder** to the new post: `deck.md`, `build_deck_json.py`,
   `build_payload.py`. Leave `deck.json`, `images.json`, `payload.json` behind — they
   regenerate.
2. **Rewrite `deck.md`.** Keep the structure exactly: the `## N — Kind` headings, the
   `**Title:** / **Bullets:** / **Notes:**` fields. The parser keys off them. Slide
   numbers must be contiguous from 1.
   - **Kind is decided in two places.** The heading picks cover and dividers: it must
     be exactly `## N — Title` for the cover, and must contain the word `divider` for
     an act divider. Everything else falls through to the `**Type:**` line, which must
     contain one of `poll`, `quiz`, `word cloud`, `rating`/`scale`, `open ended` — or
     none of them, which means an ordinary content slide.
   - Mark the closing line of a slide `**TAKEAWAY:**` to get the `→` treatment.
3. **Update the hardcoded bits in the generators** — both are small and obvious:
   `build_deck_json.py` has the presentation title/URLs; `build_payload.py` has `DIV`
   (divider titles), `SUBS` (figure captions, ≤60 chars) and `TABLES` (flattened
   tables). Delete what you don't need.
4. `python3 build_deck_json.py && python3 build_payload.py` — fix whatever they flag.
5. **Create the presentation, apply a theme, upload figures, write `images.json`.**
6. **Feed `payload.json` to `create_slides`** in ascending `_n`, batches of 6–10,
   stripping the `_n` key.
7. **Verify** (four steps above).
8. **Share slides view link** → add a `links:` entry to the post:
   ```yaml
   - icon: poll
     icon_pack: fas
     name: "Interactive slides (AhaSlides)"
     url: https://presenter.ahaslides.com/share/<code>
   ```
   Absolute URL so it opens in a new tab. `fa-poll` exists in Font Awesome Free 5.14.0,
   which is what this site loads — check any new icon against that version, not FA6.

**Realistic budget for deck two:** an hour or so. Most of this build was diagnosing
content-v2; with rules 1 and 2 that evaporates.

---

## Running a live session

1. Open the editor → **Present**. Audience joins at `ahaslides.com/Q6U4S`.
2. Interactive slides advance only when you choose; results stay on screen.

Two slides need preparation:

- **Slide 5**, the prediction poll: screenshot the bar chart or keep it in a second
  tab. **Slide 25 calls back to it** and the callback needs the original result.
- **Slide 18**, the word cloud: take the two most popular answers and ask aloud whether
  each one *stops at the Jamuna*. Almost none do — they are national shocks, which the
  Padma hinterland differences out. That is the identification argument, built by the
  room instead of asserted from the podium.

Afterwards:

> Using the ahaslides MCP, get the quiz scores and poll results from the most recent
> session of the Jamuna Bridge presentation.

- **Slide 15** — many picking A or B means the levels-vs-trends misconception survived;
  spend longer on slide 14 next time.
- **Slide 5 vs 25** — the gap between prediction and data is the best single measure of
  whether the deck did its job.

---

## Known differences from the Quarto deck

| Quarto | AhaSlides | Why |
|---|---|---|
| Bold emphasis on key terms | plain text | native fields don't parse markdown |
| 4 markdown tables | bullet lists | no table rendering; `deck.json` keeps the shape in `sourceNote` |
| `.takeaway` styled block | `→`-prefixed final bullet | no per-run styling |
| Fragments revealed one at a time | whole list at once | no fragment equivalent |
| LaTeX via MathJax (slides 12, 14) | Unicode plain text, first bullet | no MathJax |
| Figures full width | 620×720 right column | fixed by the slide type |
| 5 act dividers in site palette | one deck-wide theme | no per-slide colour |

## Related

- Quarto deck: `../slides/slides.qmd` → `/post/python_bridge_impact/slides/`
- Post: <https://carlos-mendez.org/post/python_bridge_impact/>
- AhaSlides MCP: <https://ahaslides.com/marketplace/mcp-server/>
