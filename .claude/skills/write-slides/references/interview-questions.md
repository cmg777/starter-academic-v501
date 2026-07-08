# Interview questions (Phase 2)

The Phase-2 interview ports `beautiful_deck`'s **Step-0 audience triage** and
**Step-2 outline checkpoint** into this project's confirm-scope step. Keep asking
`AskUserQuestion` rounds until you can name the audience, every takeaway, every
headline number, and every slide without guessing — then gate on a plain-text `y`.

**Cap each `AskUserQuestion` call at 4 questions, each with 2–4 options.** Run
multiple rounds in sequence. Adapt the wording to the specific post; the templates
below are scaffolds, not scripts.

---

## Round 1 (always): Audience triage

This single choice sets the ethos·pathos·logos balance, the target slide count, and
the MB/MC threshold (see `rhetoric-of-decks.md`).

```
Q: Who is the primary audience? This sets the rhetorical balance and how much
   technical depth the deck carries.

Header: Audience
Options (single-select):
  1. [Recommended] Teaching (students) — clarity > compression, intuition before
     formalism, recap allowed. ~16–22 slides.
  2. Seminar (peers) — full method depth, identification early, Devil's-Advocate
     required. ~20–30 slides.
  3. Conference (~15–20 min) — ruthless one-idea-per-slide, headline by slide 2,
     figure-first. ~10–14 slides.
  4. Working / External (collaborators, policy, general) — define jargon, lead with
     the picture, light derivation. ~16–22 slides.
```
Recommend **Teaching** for tutorial posts (the common case).

---

## Round 2 (always): Key takeaways + headline numbers

Open with: *"I read the post and pulled these takeaways and headline numbers. Act III
lands on them; confirm or amend."* Two questions in one call. (The confirmed takeaways
seed both the Resolution's assertion titles **and** the per-slide `.takeaway` cards — the
concluding orange accent card each content slide ends on; see `slide-archetypes.md`.)

```
Q1: Which assertions should the deck's Resolution land on? (these become the
    assertion titles of the headline-result + closing slides)

Header: Takeaways
multiSelect: true
Options:
  1. [Recommended] <takeaway from the post's Abstract/Conclusion>
  2. [Recommended] <takeaway from the spoiler figure caption>
  3. <takeaway from a Learning objective>
  4. <secondary result worth featuring>

Q2: The headline numbers I'll feature are <a>, <b>, <c>. Source:
    <results_report.md | index.md prose>. Confirm or correct.

Header: Numbers
Options:
  1. [Recommended] Use <a>, <b>, <c> as found
  2. Use only <a> (one hero number)
  3. I'll correct them in the final confirmation (free-form)
```
If the post had **no** `results_report.md`, Q2 is mandatory — do not invent numbers;
make the user supply or confirm them.

The title strip is usually 3 **numbers**, but it can be 3 **word** labels naming an arc/tools
(e.g. Learn / Explore / Research). Only a *word* strip is eligible for the optional
pipeline-arrow treatment (slide-archetypes archetype 1) — never a numeric one.

---

## Round 3 (always): Outline checkpoint — the gate before writing

This is the load-bearing checkpoint. Render the **full proposed outline** as plain
text (one line per slide: `archetype · assertion title`), THEN ask for approval.

```
PROPOSED OUTLINE (<N> slides) — approve before any file is written
──────────────────────────────────────────────────────────────────
 1  Title              "<deck title>"
 2  Divider · Act I    "The Tension"
 3  Narrative/Hook     "<hook assertion>"
 4  Figure (spoiler)   "<assertion>"
 5  Divider · Act II   "The Investigation"
 6  Equation           "<assertion>"
 7  Two-column compare "<assertion>"
 8  Code               "<assertion>"
 ...
N-2 Divider · Act III  "The Resolution"
N-1 Headline-result    "<assertion>"
 N  Closing            "<one-sentence thesis>"
```

```
Q: Approve this outline, or adjust?

Header: Outline
Options:
  1. [Recommended] Approve as-is
  2. Merge or split specific slides (I'll tell you which)
  3. Re-balance the acts (more/less Act II)
  4. Change the slide-count target
```
If the user picks 2–4, revise and re-render the outline, then re-ask. Do not write
slides until the outline is approved.

---

## Round 4 (conditional): Devil's-Advocate + button collision

Trigger when audience ∈ {seminar, working} OR a `slides.pdf` / Wowchemy `slides:`
page was detected in Phase 1.

```
Q1 (if seminar/working): Include a Devil's-Advocate slide? Which objection should it
   steelman?

Header: Devil's adv.
Options:
  1. [Recommended] Yes — steelman "<the strongest objection from the post's limitations>"
  2. Yes — a different objection (I'll state it)
  3. No — skip it

Q2 (if a PDF/Wowchemy slides page exists): This post already has <slides.pdf | a
   Wowchemy slides page>. The new HTML deck adds a separate "Slides (HTML)" button.
   Both can coexist — confirm?

Header: Buttons
Options:
  1. [Recommended] Keep both — "Slides (HTML)" + the existing one
  2. Only add the HTML deck button (leave the other as-is)
```

---

## Final confirmation (plain text — NOT AskUserQuestion)

Re-print the fully-resolved SCOPE block and the approved outline, then:

```
Proceed to write the deck? (y / explain change / cancel)
```
Wait for an explicit `y`. Use a plain-text wait so the user can type a free-form
"explain change". Never write before `y`.

---

## Anti-patterns (do not)

- **Do not ask "is the plan / outline ok?" as an extra question** — Round 3 + the
  final confirmation already do that.
- **Do not chain more than 4 `AskUserQuestion` rounds** before the final
  confirmation. If still uncertain past Round 4, state the ambiguity in prose and ask
  the user to clarify in free text.
- **Do not skip Round 1 (audience)** — every downstream default depends on it.
- **Do not skip Round 3 (outline checkpoint)** — writing slides before the arc is
  approved is the single most expensive mistake.
- **Do not invent headline numbers** for posts lacking a results report — make the
  user confirm them in Round 2.
