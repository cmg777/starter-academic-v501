# Design Adherence

Condensed checklist for Dimension 7 — does the deck honor the `write-slides`
design plan? This restates the load-bearing rules from
`write-slides/references/rhetoric-of-decks.md` and `slide-mapping.md` in
audit form. When in doubt, read those sources; this is the checklist, they are
the law.

---

## The Three Laws

1. **Beauty is function.** Every element earns its place. Decoration without
   function is noise. Flag busy slides where the eye does not know where to go.
2. **Cognitive load is the enemy.** One idea per slide (two only for an
   inseparable contrast). If the slide needs the word "also", it holds two ideas.
   Test: state the slide's point in one sentence — if it takes two, it should be
   two slides.
3. **The slide serves the spoken word.** A slide is a visual anchor, not a script
   read aloud. Prose belongs in `::: {.notes}`.

---

## Assertion titles (not labels)

A title is a **claim the slide proves**, not a topic label. Read the titles alone:
they should be the talk's abstract.

| Weak (label)        | Strong (assertion)                                   |
|---------------------|------------------------------------------------------|
| "Results"           | "Double-LASSO restores a sensible −0.096"            |
| "Identification"    | "The 10% WTO tariff ceiling is a mechanical dose"    |
| "Data"              | "30 years of panel data, 140 countries"              |
| "Method"            | "Partialling out the controls removes the bias"      |

Flag every label-style title as **MED**. The assertion-title sequence test is
also a Dimension 4 check (titles read alone must cohere).

---

## The 3-act arc

- **Act I — Tension (2–4 slides).** Title → a hook (provocative question,
  surprising statistic, or concrete problem — **never** an agenda or a
  definition) → the stakes. Flag an Act I that opens with an agenda/definition.
- **Act II — Investigation (60–75% of the deck).** Method and evidence;
  identification early; one idea per slide; dense and light slides alternate so
  the deck breathes. A Devil's-Advocate slide near the end (Seminar/Working).
- **Act III — Resolution (2–4 slides).** Headline result (a claim + one figure or
  one number) → implications → a closing slide that is **one declarative
  sentence** (the thesis). Flag "Questions?" / "Thank you." closings as **MED**.

---

## Pedagogical movement (within a method section)

Intuition before formalism: Narrative → Application → Picture → Codeblock →
Technical. Flag sections that open with the equation before any intuition,
especially for Teaching/Working audiences.

---

## Audience density and slide count

| Audience           | Slides  | Act II share | Notes                                  |
|--------------------|---------|--------------|----------------------------------------|
| Conference         | 10–14   | ~70%         | Ruthless one-idea; headline by slide 2 |
| Teaching           | 16–22   | ~65%         | Slow build; intuition first; Agenda ok |
| Working / External | 16–22   | ~65%         | Define jargon; lead with the picture   |
| Seminar            | 20–30   | ~75%         | Sparse; Devil's-Advocate required      |

The deck's audience is recorded in its `slides.qmd` front matter / the original
SCOPE. Flag a deck far outside its band (e.g. a 35-slide conference talk, or a
6-slide seminar) as **MED**.

---

## MB/MC pacing pass

- **Overloaded** (split/simplify): > 5 bullets, two data series on one slide, a
  wall of prose, > 4 fragment advances. → MED, cross-listed with Dim 5.
- **Underloaded** (cut/merge): one word where a sentence belongs; a point the
  audience already inferred; a slide that repeats the previous one. → LOW/MED.
- No slide should exceed ~4 fragment advances; 1–2 deliberate dense slides for
  effect are allowed.

---

## Figure handling

- Figures reused in place via relative `../<slug>_*.png` (not copied).
- Cap ~12 on-slide figures; a deck that crams 20 figures is overloaded.
- Figure-first on method/evidence slides; the picture leads, the text supports.

---

## Branding is immutable (cross-check with Dim 8)

The theme is fixed: `site-brand.scss` + `title-slide.html` are copied verbatim
every run. Any per-deck theming, off-palette color, or font override is a design
violation **and** a branding-integrity (Dim 8) finding. Do not double-count —
record it under Dim 8 and reference it from Dim 7.

---

## Quick design verdict heuristics

- Titles read alone = abstract? If not → MED (Dim 4 + Dim 7).
- One idea per slide throughout? Count multi-idea slides.
- Hook in Act I (not agenda)? Closing one declarative sentence?
- Deck breathes (dense/light alternation)? Or a wall of dense slides?
- Devil's-Advocate present for Seminar/Working?
