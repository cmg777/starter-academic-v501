# Learning Components Pattern (predict / solution / misconception / proof cards)

> This file is part of the `write-post` skill. Read this file when writing
> a tutorial-style post. The full recipe, the interactive-widget pattern and
> the helper scripts are documented in `.claude/docs/learning-components.md`.

## When to use this section

Tutorial posts should make the reader *do* something, not only read.
Four card types, all pure HTML `<details>` with no JavaScript:

| Card | Purpose | Placement | Count |
|------|---------|-----------|-------|
| **Predict** | Reader commits to an answer, then reveals it | Just **before** the code block whose output answers it (between sandwich layers 1 and 2) | 4–6, encouraged |
| **Solution** | Worked solution to one exercise | Right after each exercise prompt (under its `###` exercise or difficulty-level heading) | Exactly one per exercise |
| **Misconception** | A tempting myth and what is actually true | `## Common misconceptions`, after the results, before `## Discussion` | 3–6, encouraged |
| **Proof** | Collapsible derivation of the main result | Right after the theorem statement and its "In words" sentence | Optional, usually 1 |

Exercises become **3–8 graded items** (Warm-up → Core → Stretch) under `###`
headings — either one `###` per exercise, or one `###` per difficulty level
(Warm-up / Core / Stretch) holding 1–3 exercises that open with a bold
`**Exercise N — Title.**` lead-in (the python_fwl §22 layout). Each exercise
is followed by exactly one solution card whose output came from actually
running the code.

Skip predict cards on posts with no surprising or decisive outputs (pure
data-cleaning or plotting walkthroughs). Skip the proof card when the post
has no theorem or closed-form result to derive.

## Preconditions

The pattern depends on infrastructure that is already in place site-wide;
do **not** modify these as part of writing a post:

- `markup.goldmark.renderer.unsafe: true` in `config/_default/config.yaml`
  (allows raw HTML in markdown)
- `assets/scss/custom.scss` section 24 — defines `.learn-card`,
  `.predict-card`, `.solution-card`, `.misconception-card`, `.proof-card`,
  `.learn-card-kicker`, `.learn-card-reveal`, the chevron toggle indicator,
  the `:focus-visible` ring, and the dark-theme variants
- Interactive widgets are **not** styled in `custom.scss`: each keeps its
  own `assets/css/<name>.css` + `assets/js/<name>.js` (the `fwl-lab`
  widget uses `assets/css/fwl-lab.css`)
- `.claude/skills/write-post/scripts/lint_learn_cards.py` (source lint) and
  `check_learn_cards.cjs` (rendered-page check in light/dark/375px)

If §24 is missing, the cards render as unstyled `<details>`. Verify it
exists before relying on the pattern.

## Goldmark requirement (CRITICAL)

For Goldmark to process the body of each card as Markdown (so `$math$`,
**bold**, code fences and emphasis all render):

- A **blank line** must follow the predict card's `<p class="learn-card-kicker">…</p>` line.
- A **blank line** must follow every `<summary>...</summary>` line.
- A **blank line** must precede every closing `</details>`.

Without them the body renders as **literal raw text**, including `**` and
the `$` math delimiters. In addition:

- `<summary>` content is raw HTML: no Markdown, no backticks, no `\_`
  escapes — use `<code>` / `<em>`.
- No `##`/`###` headings (or `<h2>`/`<h3>`) inside a card.
- Never nest a learn-card inside `<div class="concept-pair">`.
- Math in the body follows `latex-escaping.md`: `\_` subscripts, `\\$`
  currency, AVOID list applies; transposes are written `^\top`.

## Copy-paste templates

Keep the HTML structure, class names, and blank-line whitespace exactly as
shown. Replace the placeholder text with the post's own content and numbers.

### Predict card

````markdown
<div class="learn-card predict-card">
<p class="learn-card-kicker">Predict first</p>

Question in Markdown (math like $\hat\beta\_1$ allowed). Commit to an answer before scrolling.

<details class="learn-card-reveal">
<summary>Reveal the answer</summary>

**Answer.** Two to four sentences citing the post's real numbers.

</details>
</div>
````

### Solution card

````markdown
<details class="learn-card solution-card">
<summary><span class="learn-card-kicker">Solution</span> Show the code and the numbers</summary>

```python
# solution code
```

```text
output produced by ACTUALLY running the code above
```

One to three sentences interpreting the output.

</details>
````

### Misconception card

````markdown
<details class="learn-card misconception-card">
<summary><span class="learn-card-kicker">Misconception</span> "Short myth."</summary>

**What is actually true.** The correction, with the evidence from this post (a number, a figure, an output block).

</details>
````

### Proof card

````markdown
<details class="learn-card proof-card">
<summary><span class="learn-card-kicker">Proof</span> Title</summary>

Body in Markdown, with display math:

$$\hat\beta = (X^\top M\_Z X)^{-1} X^\top M\_Z y$$

</details>
````

### Exercise heading + solution

````markdown
### 1. Warm-up: Recover the slope by hand

One or two sentences stating the task and what to report.

<details class="learn-card solution-card">
<summary><span class="learn-card-kicker">Solution</span> Show the code and the numbers</summary>

...

</details>
````

Alternative layout — one `###` per difficulty level, several exercises under
it, each opening with a bold lead-in (used by python_fwl §22):

````markdown
### 22.1 Warm-up

**Exercise 1 — Uncorrelated is not independent.** One or two sentences
stating the task and what to report.

<details class="learn-card solution-card">
<summary><span class="learn-card-kicker">Solution</span> Show the code and the numbers</summary>

...

</details>

**Exercise 2 — Next title.** ...
````

Filled examples with real numbers (from `content/post/python_fwl/`) are in
`.claude/docs/learning-components.md` § *Filled examples*.

## Section intro paragraph (Common misconceptions)

Open `## Common misconceptions` with prose, **not** a list (custom.scss §11F
styles a `ul` directly after an `h2`, or after `h2` + one `p`, as a teal
Learning-objectives box). For example:

> Each claim below sounds reasonable and each is wrong in a way this post's
> numbers can show. Try to say why before opening the card.

## Quality bar

| Criterion | Target |
|-----------|--------|
| Card class names | `learn-card predict-card`, `learn-card solution-card`, `learn-card misconception-card`, `learn-card proof-card`, `learn-card-reveal` exactly |
| Blank lines | After the kicker `<p>`, after every `<summary>`, before every `</details>` |
| Predict placement | Before the code block whose output answers it — never after the output |
| Predict question | Answerable before running the code (direction, rough size, same/different) |
| Predict answer | 2–4 sentences citing the output's real numbers |
| Solution output | Pasted verbatim from actually running the solution code |
| Exercises | 3–8, graded Warm-up → Core → Stretch under `###` headings (one per exercise, or one per difficulty level with bold `**Exercise N — Title.**` lead-ins); each exercise followed by exactly one solution card |
| Misconception body | Opens with `**What is actually true.**` and cites evidence shown in the post |
| Proof | Short (two-minute read), `^\top` transposes, placed right after the theorem statement |
| `<summary>` | Raw HTML only — no Markdown, backticks, or `\_` |
| Headings in cards | None |
| Lint | `python3 .claude/skills/write-post/scripts/lint_learn_cards.py content/post/<slug>/index.md` exits 0 |
