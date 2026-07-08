# Review Checklist

The working list for the audit. Walk each dimension in order. For every failed
check, record: **severity · location · quoted violation · actionable fix**.
Locations are `slides.qmd:NN` or `slide N — "title"`. The source post
(`content/post/<slug>/index.md` + `results_report.md`) is ground truth.

---

## Dimension 1 — Source fidelity

Build a ledger: every datum on a slide must trace to the source post.

- [ ] **Numbers.** Each coefficient, p-value, N, R², percentage, and currency
      figure on a slide appears in `index.md` / `results_report.md` with the same
      value and rounding. A slide number with no source match → **HIGH** (invented).
- [ ] **Sign and magnitude.** Signs (−0.096 not 0.096) and orders of magnitude
      match. A flipped sign is **HIGH**.
- [ ] **Figures.** Each `![...](../<slug>_*.png)` reuses a figure the post
      actually contains; the caption matches what the figure shows. A figure that
      is not in the post, or a caption describing a different figure → **HIGH**.
- [ ] **Tables.** Cell values, row/column labels, and the highlighted (`.key`)
      cell match the post's table. Altered cells → **HIGH**.
- [ ] **Equations.** Each equation matches the post's (same variables,
      subscripts, operators). A dropped term or changed subscript → **HIGH/MED**.
- [ ] **Code snippets.** Illustrative code (`{.python}` / `{.r}`) matches the
      post's code (function names, arguments, model spec). Code that would produce
      a different result than the figure/table beside it → **HIGH** (the
      code↔result inconsistency check). Cosmetic trimming is fine.
- [ ] **Claims.** Every factual claim in a bullet or title is supported by the
      post body. Unsupported claim → **HIGH/MED**.
- [ ] **Key-result strip.** The three title-slide headline numbers come from
      `results_report.md` (or the post) and are the post's actual headline figures.

---

## Dimension 2 — Conceptual correctness

- [ ] **Estimand.** ATE vs ATT (and any LATE/CATE) is stated as in the post; not
      swapped or dropped. Causal posts must name the estimand.
- [ ] **Interpretation.** Coefficients are read correctly (direction, units,
      "holding X fixed"); elasticities vs level effects not confused.
- [ ] **Causal language.** No "causes/effect of" where the post is careful to say
      "associated with"; randomized vs observational framing preserved.
- [ ] **Identification.** The identifying assumption (parallel trends, exclusion
      restriction, unconfoundedness, overlap) is stated correctly, not garbled.
- [ ] **Method fit.** The method is described as solving the problem the post
      says it solves; no invented mechanism.
- [ ] **Limitations.** If the post states a caveat that changes the takeaway, the
      deck does not present the result as unconditional.

---

## Dimension 3 — Technical & render correctness

- [ ] `smoke-test.js` exits 0 (reveal structure, title strip, chalkboard+menu,
      notes, dividers, figure paths, MathJax delimiters, no `{{…}}`).
- [ ] **Math renders** (browser pass): no slide shows raw `\hat`, `\(`, `\)`,
      `\beta`, etc. Raw LaTeX visible → **HIGH**.
- [ ] **On-slide math is LaTeX `$…$`**, not literal Unicode (`$\hat\alpha$` not
      `α̂`). Unicode math on a slide → **MED**.
- [ ] **Speaker notes keep Unicode** math (speaker view does not render LaTeX);
      LaTeX inside `::: {.notes}` → **MED**.
- [ ] **Code fences** are illustrative `{.python}` / `{.r}`, not executable
      `{python}` / `{r}`; fences are paired; languages declared.
- [ ] No leaked template markers (`{{TITLE}}`, `{{…}}`).
- [ ] **Pandoc escaping dropped** correctly from ported equations: `$1{,}736`
      not `\\$1{,}736`; `x_i` not `x\_i` (the `.qmd` is Pandoc, not Goldmark).
- [ ] `code-line-numbers` highlight ranges (if used) reference lines that exist.

---

## Dimension 4 — Title↔body consistency

- [ ] Each slide's title is **proven by its body** — the figure/number/bullets on
      the slide support the claim in the title. Title says X, body shows Y → **HIGH**.
- [ ] **Assertion-title test:** read every title in order, ignoring bodies. They
      should form a coherent one-line-per-slide abstract of the talk. A gap or a
      non-sequitur → **MED**.
- [ ] No duplicated titles across different slides (unless a deliberate "part 2").
- [ ] Divider titles match the act/section they introduce.
- [ ] The closing slide's sentence matches the thesis the deck actually argued.

---

## Dimension 5 — Readability & simplicity (primary emphasis)

Apply `readability-rules.md`. **Every finding here ships a `Before:` / `After:`
rewrite.**

- [ ] **Sentence length.** Flag any on-slide sentence over ~15 words; rewrite
      shorter. Over ~25 words → **MED** (floor applies).
- [ ] **Bullet count.** > 5 bullets on a slide → **MED**; suggest splitting the
      slide or cutting bullets.
- [ ] **Complex words.** Flag words with a simpler everyday alternative
      (utilize→use, methodology→method, demonstrate→show); suggest the simpler word.
- [ ] **Passive voice.** Flag passive constructions on slides; rewrite active.
- [ ] **Nested clauses.** Flag sentences with multiple subordinate clauses;
      split into two short sentences.
- [ ] **Jargon.** Flag undefined technical terms used on a slide before the deck
      defines them (audience-dependent — stricter for Teaching/Working).
- [ ] **Walls of prose.** Multiple stacked prose sentences on one slide → move to
      speaker notes; the slide keeps a single anchor line. **MED**.
- [ ] **One idea.** If stating the slide's point needs the word "also" or two
      sentences, the slide carries two ideas → flag for splitting.
- [ ] **Numbers as words.** Long inline numbers are readable (`$1,736`, not
      `1736.0`); units present.

---

## Dimension 6 — Typos & grammar

- [ ] Spelling (titles, bullets, captions, notes).
- [ ] Subject–verb agreement and tense consistency.
- [ ] Punctuation; **em-dash (—) not `--`** in prose (site style).
- [ ] Consistent terminology and capitalization for the same concept across slides
      (e.g. "Double-LASSO" not also "double lasso" and "DoubleLasso").
- [ ] Consistent number formatting (decimal places, thousands separators).
- [ ] No doubled words ("the the"), no stray Markdown (`**` left showing).

---

## Dimension 7 — write-slides design adherence

See `design-adherence.md` for the full rubric.

- [ ] **One idea per slide** (two only for an inseparable contrast).
- [ ] **Assertion titles**, not labels ("Results", "Identification" → claims).
- [ ] **3-act arc:** Act I hook (not an agenda/definition) → Act II investigation
      (60–75% of deck) → Act III resolution; closing = one declarative sentence.
- [ ] **Figure-first** method slides; figures capped at ~12 on-slide.
- [ ] **Audience-appropriate density and slide count** (Teaching 16–22, Seminar
      20–30, Conference 10–14, Working 16–22).
- [ ] **MB/MC pacing:** dense and light slides alternate; no slide exceeds ~4
      fragment advances; underloaded slides (one word where a sentence belongs)
      flagged for merge.
- [ ] **Devil's-Advocate slide** present near the end for Seminar/Working decks.
- [ ] **Notes carry the prose**; slides are visual anchors, not documents.
- [ ] Closing slide is **not** "Questions?" / "Thank you".

---

## Dimension 8 — Branding integrity

- [ ] `diff` `slides/site-brand.scss` against
      `write-slides/references/templates/site-brand.scss` — must be empty.
- [ ] `diff` `slides/title-slide.html` against the template — must be empty, EXCEPT the one
      approved variation: a `$sep$` block emitting `<span class="kr-arrow">` to connect a *word*
      key-result strip as a pipeline (see design-adherence). A numeric strip must not use it.
- [ ] Title-strip stats use the three brand colors (orange `#d97757`, teal
      `#00d4c8`, steel `#6a9bcc`); no off-palette hex introduced in `slides.qmd`.
- [ ] Page background is the brand light-cool-gray `$body-bg: #eef1f6` (deliberate, not white).
- [ ] `center: true`, chalkboard, menu, overview still enabled in front matter.
- [ ] No per-deck font or theme override injected.

A non-empty diff is **HIGH** unless the canonical template legitimately advanced
after the deck was generated (then **LOW**, with the explanation).

---

## Dimension 9 — Accessibility & legibility

- [ ] Every figure has a caption (and meaningful alt text via the caption).
- [ ] Math that had a plain-language companion in the post keeps one on the slide
      or in notes (don't strip the intuition).
- [ ] Color is not the sole signal (the highlighted table cell is also labeled;
      the orange series is also named).
- [ ] **No overflow** (browser pass): content stays within the 960×700 slide box;
      clipped content → **HIGH**.
- [ ] **Not illegible-dense** (browser pass): word/bullet counts within the
      `headless-browser.md` caps for a projector.
- [ ] Contrast: body text on dark dividers uses the light palette.

---

## Dimension 10 — Deliverable completeness

- [ ] `slides/slides.qmd` present.
- [ ] `slides/index.html` present and > 30 KB.
- [ ] `slides/slides_files/` directory present.
- [ ] `index.md` links the deck with a **relative** `url: slides/index.html`
      (NOT `url: slides/` — that 404s) and `icon: person-chalkboard`,
      `icon_pack: fas`, `name: "Slides (HTML)"`.
- [ ] Every `../<slug>_*.png` referenced by the deck resolves on disk.
- [ ] The deck source `slides.qmd` and rendered output are consistent (no
      "edited qmd, forgot to re-render" — spot-check a known title appears in both).
