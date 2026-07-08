# Slide archetypes (Quarto markdown)

The 12 slide layouts a deck is built from, expressed as **Quarto markdown** (the deck is
authored as `slides.qmd` and rendered with `quarto render`). Each entry is a copy-paste
skeleton — substitute the ALL-CAPS placeholders. Read this in Phase 3 while writing the
`.qmd` body. The visual styling lives in `site-brand.scss`; the engine config lives in the
`.qmd` front matter (see `slides.qmd.tmpl`).

Conventions:
- `##` (h2) = a **content slide**; its heading is the **assertion title** (auto-underlined
  orange by the theme). `#` (h1) = a **section/divider slide**.
- `center: true` (front matter) vertically centers every slide — dividers land in the middle,
  content blocks use the white space.
- Speaker notes: `::: {.notes} … :::` (press **S**). Fill from the post's interpretations.
- Reveal one step at a time: `. . .` (a pause between blocks), `::: {.incremental}` (a list),
  or `{.fragment}` on a span/element.
- Figures use a relative path up to the post bundle: `![caption](../<slug>_fig.png)`.
- **Math: write LaTeX, never literal Unicode** (`α̂ → $\hat\alpha$`, `± → $\pm$`). The full rules
  — the Unicode→LaTeX table, **mixed numbers** (keep `[…]{.key}`/`[…]{.bignum}` as styled text),
  and **notes stay Unicode** — are the canonical `slide-mapping.md §Math symbols → LaTeX`. (MathJax
  is the engine; no Goldmark escaping here — this is a `.qmd`, not `index.md`.)

---

## 1. Title  — front matter only (no body slide)

Quarto builds the title slide from the front matter via the custom `title-slide.html` partial,
which renders — in order — the title, subtitle, the **key-result number strip**, then the
**hyperlinked author**, the **university**, and the **date**. Fill the front matter:
```yaml
title: "DECK TITLE"
subtitle: "ONE-LINE FRAMING"
deck-author: "Carlos Mendez"                   # author name (rendered as a link)
deck-author-url: "https://carlos-mendez.org"   # author homepage
institute: "Nagoya University (GSID)"          # the university line
date: today                                    # auto-stamps the render/update date
date-format: long                              # renders "June 11, 2026"
key-results:                 # 3 headline numbers → the centred brand-coloured strip
  - { num: "−0.096", cap: "rigorous Double-LASSO" }
  - { num: "+0.019", cap: "cross-validated · sign flip" }
  - { num: "284",    cap: "candidate controls" }
```
**Use:** always. No `#`/`##` for it — it is the rendered title slide. (`deck-author` /
`deck-author-url` are custom fields the partial reads; Quarto's structured `author:` schema
doesn't expose name+url cleanly in the revealjs title-slide partial, so we bypass it.)

**Automatic polish (theme).** The title slide gets a thin orange **accent rule** under the title
and a **refined byline** (author name larger/primary; institute + date smaller/grey) for free —
no markup needed; both live in `site-brand.scss`.

**Optional — connect a WORD strip as a pipeline.** When the three `key-results` are *word*
labels that form an arc (e.g. `Learn` → `Explore` → `Research`), you can render them as a
connected flow. Add Pandoc's `$sep$` between the loop items in this deck's `title-slide.html`
(the strip's colors already use `:nth-of-type`, so they survive the interleaved spans, and the
theme ships a dormant `.kr-arrow` style):
```
$for(key-results)$
    <div class="kr"><span class="kr-num">$key-results.num$</span><span class="kr-cap">$key-results.cap$</span></div>
$sep$
    <span class="kr-arrow" aria-hidden="true">&rarr;</span>
$endfor$
```
Optionally tighten the strip in this deck (`.title-result-strip { gap: 0.9em; }`).
**Word strips only — never numeric key-results** (arrows between `−0.096` / `+0.019` / `284`
are nonsense). Reference: `content/event/20260721GSID/slides/`.

---

## 2. Agenda (optional)

```markdown
## Where we're going

::: {.incremental}
- ROADMAP ITEM 1
- ROADMAP ITEM 2
- ROADMAP ITEM 3
:::
```
**Use:** teaching decks > ~15 slides only. Build from the post's *Learning objectives*.

---

## 3. Section divider

```markdown
# ACT TITLE {.divider background-color="#d97757"}

[Act I]{.act}
```
**Use:** one before each act. Per-act colour: **Act I → `#d97757`** (orange), **Act II →
`#6a9bcc`** (steel), **Act III → `#00d4c8`** (teal). The `.divider` class gives white centred
Cinzel; `center: true` puts it in the middle of the slide.

---

## 4. Narrative / Hook

```markdown
## ONE-SENTENCE PROVOCATION OR STAKE

A single concrete line — a named person, place, number, or tension.

. . .

The turn or the question that opens the investigation. *Italic for emphasis.*

::: {.notes}
The story you tell aloud; the slide only anchors it.
:::
```
**Use:** open Act I (and to re-engage mid-Act II). Minimal text, high pathos.

---

## 5. Figure slide

```markdown
## WHAT THE FIGURE SHOWS, AS A CLAIM

![One-line reading aid — never "Figure 3".](../SLUG_FIGURE.png)

::: {.notes}
Walk the audience through what to look at first.
:::
```
**Use:** the deck's backbone — figure-first. Quarto's **`auto-stretch`** (on by default)
bounds the image to the slide and `fig-align: center` centres it — no overflow, no manual
sizing. One figure, one message. The alt/caption is the reading aid; the `##` is the finding.

---

## 6. Table slide

```markdown
## WHAT THE TABLE PROVES

| COL A | $\hat\alpha$ | SE | Sig.? |
|---|---:|---:|:--:|
| ROW 1 | [HEADLINE NUMBER]{.key} | 0.034 | yes |
| ROW 2 | −0.108 | 0.022 | yes |

[One-line takeaway under the table.]{.takeaway .fragment}
```
**Use:** Act III, where the payoff lands. Trim to the 2–3 load-bearing columns; tag the
headline cell `[…]{.key}` (renders orange). The theme styles it booktabs-ish (no vertical
rules, teal head rule). Close with the takeaway card (see the **Takeaway card** component below).

---

## 7. Code slide

```markdown
## WHAT THESE LINES DO, IN ONE CLAIM

``` {.r code-line-numbers="2-3|4|5"}
mod <- rlasso(y ~ d + Z, post = TRUE)   # rigorous penalty
beta_hat <- coef(mod)["d"]
summary(mod)
```

::: {.notes}
Full script lives in the post; here we show the load-bearing lines.
:::
```
**Use:** when the deck teaches code. `{.r}` (or `.python`/`.stata`) highlights without
executing; `code-line-numbers="a|b|c"` reveals groups as fragments (the reveal equivalent of
Beamer `\onslide`). Keep ≤ ~10 lines; long listings → skeleton here, full source in notes.

---

## 8. Equation slide

```markdown
## WHAT THE EQUATION SAYS, IN WORDS

$$\hat\beta(\lambda)=\arg\min_\beta \tfrac{1}{2n}\|y-X\beta\|_2^2+\lambda\sum_j|\beta_j|$$

[The L1 penalty $\lambda\sum_j|\beta_j|$ shrinks weak controls to exactly zero — that's the
selection.]{.comment}
```
**Use:** one equation per slide with a plain-language gloss (`.comment`, small/centred — it
*explains* the equation). If the closing line is instead the slide's **concluding takeaway**
(not a gloss of the math), use `[…]{.takeaway .fragment}` (the **Takeaway card** component
below). Plain LaTeX — Pandoc/MathJax render it; no `\\$`/`\_` gymnastics.

---

## 9. Two-column compare

```markdown
## A VS B — THE LOAD-BEARING CONTRAST

:::: {.columns}
::: {.column width="50%"}
### OPTION A
- point
- point
:::
::: {.column width="50%"}
### OPTION B
- point
- point
:::
::::
```
**Use:** the one place two ideas may share a slide — an *inseparable* contrast (rigorous vs
CV; ATE vs ATT). Column `###` headers get a steel underline.

---

## 10. Devil's-Advocate

```markdown
## The strongest objection — and the answer

[Objection.]{.objection} THE BEST CASE AGAINST THE CLAIM.

. . .

[Response.]{.rebuttal} WHY THE RESULT STILL STANDS.
```
**Use:** late Act II / early Act III. Required for seminar + collaborator decks. Steelman the
objection (orange), then answer (teal).

---

## 11. Headline-result

```markdown
## THE RESULT, AS A SENTENCE {background-color="#1a3a8a"}

[−0.096]{.bignum}

[$\hat\alpha$ on the treatment, rigorous Double-LASSO (SE 0.034)]{.bignum-label}
```
**Use:** the Act-III payoff. One giant number + one line on a full-bleed brand-blue slide that
lifts off the navy canvas (`has-dark-background` keeps text light; the theme makes `.bignum` teal
there). The number must match `results_report.md`.

---

## 12. Closing

```markdown
# THE ONE SENTENCE YOU WANT THEM TO REMEMBER. {.divider background-color="#1a3a8a"}
```
**Use:** always, the final slide. A declarative thesis (the resolution of the Act-I hook) as a
centred `#` section slide on a full-bleed brand colour (brand blue, or `$orange` to bookend an
Act-I orange divider). **Never** "Questions?", "Thank you", or a contact list.

---

## Takeaway card — the concluding line of a content slide

Not a full archetype — a **component** most content slides (Narrative, Figure, Table) should
end with: the slide's assertion restated as one memorable sentence, rendered as a prominent
brand **accent card** (soft orange fill, bold orange left bar, larger semibold text) that
**rises + fades in** as the final fragment.

```markdown
[One-sentence takeaway — the point, stated so it sticks.]{.takeaway .fragment}
```

- **`.takeaway` vs `.comment`.** `.takeaway` is the prominent card — the slide's conclusion.
  `.comment` stays the small grey caption/gloss that *explains* a figure/table/equation. Don't
  swap them: a takeaway is a claim you want remembered; a gloss is a reading aid.
- **Always a `.fragment`** so it lands last, after the evidence above it. It counts as one
  fragment advance (keep the slide's total ≤ ~4).
- Sits on white content slides (never on a `.divider`); the styling lives in `site-brand.scss`.
- This is the per-slide takeaway — distinct from the single **Closing** divider (archetype 12),
  which is the deck's one final thesis.

---

## Assembly notes

- Order follows the approved Phase-2 outline: front-matter title → Act I divider → … →
  Closing. The auto title slide is first; the body starts at the Act I `#` divider.
- Prefer ending each substantive content slide with a `[…]{.takeaway .fragment}` — the
  assertion title states the claim; the takeaway card restates it as the memorable line.
- Prefer horizontal slides; use a vertical sub-stack only when one idea genuinely needs
  sub-steps (Quarto: nest with `##` under a `#`, or use `. . .`).
- Every content slide gets a `##` assertion; only the title, dividers, and closing use `#`
  or the front matter.
- Put `::: {.notes}` on any slide whose spoken content exceeds what's shown — most of them.
