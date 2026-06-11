# Slide mapping (post → deck)

Heuristics that turn a post's `index.md` + figures + tables + `results_report.md`
into an assertion-titled, one-idea-per-slide, 3-act deck. Read this in Phase 1 (to
draft the outline) and Phase 3 (to assemble slides). It applies the principles in
`rhetoric-of-decks.md` using the HTML in `slide-archetypes.md`.

---

## Post element → slide → act

| Post element | Slide archetype | Act |
|---|---|---|
| `title:` + one-line `summary:` | Title (1) | — |
| Abstract / Overview hook | Narrative/Hook (4) | I |
| The "spoiler" figure (the post's money chart) | Figure (5) | I (tension), reuse in III (payoff) |
| Learning objectives | Agenda (2) — *teaching only* | I |
| "Why this method" / motivation | Narrative (4) | II |
| Each display equation `$$…$$` | Equation (8) — one each | II |
| Method-comparison prose | Two-column compare (9) | II |
| Code listing (`script.py` / `analysis.R` excerpt) | Code (7) | II |
| Each results figure (`SLUG_*.png`) | Figure (5), caption-as-assertion | II → III |
| Results table (Markdown) | Table (6), key cell highlighted | III |
| Headline interpretation / hero number | Headline-result (11) | III |
| Limitations / critique paragraph | Devil's-Advocate (10) | III (or late II) |
| Summary / Takeaways | Closing (12), single sentence | III |

Each act is preceded by a Divider (3).

---

## Principles applied

- **Figure-first, code-first.** A figure or code block is its *own* slide titled with
  its finding — never buried under bullets.
- **One idea per slide.** Split any source paragraph that carries two assertions into
  two slides; merge adjacent thin slides.
- **Assertion titles.** Every content slide's `<h2>` is a sentence stating the
  finding (see `rhetoric-of-decks.md` examples). Pull the claim from the post's
  interpretation paragraph for that figure/table.
- **Speaker notes carry the prose.** The post's interpretation text goes into
  `<aside class="notes">`, not onto the slide.

---

## Typical slide counts (audience-parameterised)

| Audience | Slides | Act II share |
|---|---|---|
| Conference | 10–14 | ~70% |
| Teaching / Working | 16–22 | ~65% |
| Seminar | 20–30 | ~75% |

A typical tutorial post → **~18 slides** (teaching default). If the mapping would
exceed the target by a lot, drop the least load-bearing figures (see capping) and
merge thin narrative slides.

---

## The MB/MC pacing pass (run before finalising `index.html`)

Walk every slide and every fragment; apply `rhetoric-of-decks.md` § MB/MC:
- Cut/merge **underloaded** slides (a word that wants a sentence; a point the
  audience already inferred).
- Split/simplify **overloaded** slides (> 5 bullets, two data series, a wall of
  prose). Push overflow to `<aside class="notes">`.
- No slide should need > 4 fragment advances.
- Allow one or two deliberate dense "jump scare" slides for effect — on purpose.

---

## Figures: selection, capping, and backgrounds

- **Inventory** all `SLUG_*.png` at the post-bundle root in Phase 1, each with its
  caption (from `![caption](SLUG_x.png)`), and whether the PNG is transparent/dark
  (alpha channel) → drives the dark-slide decision.
- **Cap at 12 on-slide figures.** If the post has more, keep the most load-bearing
  (one per distinct finding) and **log the dropped filenames** in the SCOPE block and
  the Phase-5 report — never silently drop.
- Reference each as `../SLUG_x.png` (relative up one level).

---

## Tables: Markdown → Quarto markdown

Reuse the post's Markdown table almost verbatim (archetype 6). Keep the 2–3 columns that
carry the argument; the rest → notes. Tag the headline cell `[…]{.key}` (renders orange). The
theme styles it booktabs-ish and right-aligns numbers (`tabular-nums`).

## Title slide: the key-result strip

Pull the **3 headline numbers** from `results_report.md` (or the confirmed Phase-2 numbers)
into the front-matter `key-results:` list — each a `{ num, cap }` (a value + a short caption).
The `title-slide.html` partial renders them as the centred brand-coloured strip. Choose the
deck's three most load-bearing numbers (e.g. the hero estimate, its contrast, and the scale).

---

## Porting equations (drop the Goldmark escaping)

The post's `index.md` is Goldmark + MathJax, so its math is escaped for *that* pipeline. The
deck's `.qmd` is **Pandoc + MathJax**, so **drop** that escaping when copying an equation in:

| In `index.md` | In the deck (`slides.qmd`) |
|---|---|
| `\\$1{,}736` (literal currency) | `$1{,}736` or `\$1{,}736` in prose |
| `x\_i` (escaped subscript) | `x_i` |
| `\\|y-X\beta\\|` (escaped norm) | `\|y-X\beta\|` |
| `\\,` `\\;` `\\%` | `\,` `\;` `\%` |
| `\theta`, `\hat`, `\sum` (already fine) | unchanged |

Inline math `$…$`, display `$$…$$`. Verify visually in the Hugo preview (MathJax errors render
visibly but the smoke test can't catch them — see `render-and-fix.md` §7 for unsupported macros).

## Math symbols → LaTeX (never literal Unicode)

`α̂` (alpha + combining circumflex) and other Unicode math render inconsistently. Convert
**all on-slide** math symbols to LaTeX `$...$`:

| Unicode | LaTeX | · | Unicode | LaTeX |
|---|---|---|---|---|
| `α̂` | `$\hat\alpha$` | · | `±` | `$\pm$` |
| `α` `β` `λ` `γ` | `$\alpha$` `$\beta$` `$\lambda$` `$\gamma$` | · | `≈` | `$\approx$` |
| `\|I_y\|` `\|I_d\|` | `$\|I_y\|$` `$\|I_d\|$` | · | `∑` `∈` `∪` | `$\sum$` `$\in$` `$\cup$` |

- **Mixed numbers:** in captions/bullets/comments/labels write the full expression
  (`violent α̂ = −0.096` → `violent $\hat\alpha = -0.096$`); but keep the orange `[…]{.key}`
  table cells and the giant `[…]{.bignum}` as **styled text** (math drops their colour/size).
  Plain standalone numbers (284, 143) stay text.
- **Notes stay Unicode.** The reveal speaker-notes window doesn't run the math renderer, so
  LaTeX source would show raw there — keep `α̂` etc. inside `::: {.notes}`.
- Engine: **MathJax** — Quarto revealjs's default, from a CDN (reveal.js is bundled locally; math
  needs a network). Do NOT set `html-math-method: katex` — it is broken in revealjs (why, and the
  static/browser guards that catch it → `render-and-fix.md §12`).

---

## Edge cases (full handling in `render-and-fix.md`)

- **No figures (landing-page posts):** lean on Narrative + Equation + Two-column +
  Closing; warn that the deck is text-heavy; do not auto-draw diagrams.
- **No `results_report.md`:** derive headline numbers from `index.md` prose/captions
  and make the user confirm them in Round 2; if none can be found, replace the
  Headline-result slide with a qualitative claim and flag `[~]`.
- **Very long code:** skeleton on-slide + full source in notes; if still overflowing,
  split into a vertical sub-slide stack.
- **Mixed-language posts:** pick the primary language for code slides; mention the
  other in notes.
