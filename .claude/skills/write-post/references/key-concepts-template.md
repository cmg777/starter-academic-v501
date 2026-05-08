# Key Concepts Toggle-Card Pattern

> This file is part of the `write-post` skill. Read this file when the
> post introduces new vocabulary the rest of the tutorial leans on.

## When to use this section

Include a Key Concepts section when the tutorial introduces 5–8 vocabulary
terms that the body sections then reuse repeatedly. Skip it for posts that
do not introduce new jargon (e.g., a CSV-cleaning tutorial, a plotting
tutorial). Putting in fewer than 5 concepts feels token; more than 8 turns
the section into a glossary.

Place the section **after Learning objectives** and **before Setup and
imports**. The flow is: motivate the question (Overview) → state what the
reader will be able to do (Learning objectives) → pin down the vocabulary
(Key concepts) → start the analysis.

## Structure

Each concept has three parts:

1. **Bold term + math notation if any** (always visible). One line.
2. **Definition paragraph** (always visible). Multiple short sentences.
   The user has shown that median ~8 words per sentence, max ~20, scans
   far better than fewer long sentences.
3. **Two collapsible cards in a 2-column grid:**
   - Left (teal accent): **Example** — grounded in *this post's* data,
     with named variables and real numbers from the analysis. Not generic.
   - Right (warm-orange accent): **Analogy** — vivid familiar-domain
     comparison (drug + patient, jury, dark frame, self-righting boat,
     fork in the road, exam writer vs. exam taker, etc.).

Default state of both toggles: closed. Readers see the definitions when
scanning and open the toggles when they need the example or analogy.

## Preconditions

The pattern depends on infrastructure that is already in place site-wide;
do **not** modify these as part of writing a post:

- `markup.goldmark.renderer.unsafe: true` in `config/_default/config.yaml`
  (allows raw HTML in markdown)
- `assets/scss/custom.scss` section 20 — defines `.concept-pair`,
  `.concept-card`, `.concept-example`, `.concept-analogy`, the chevron
  toggle indicator, and the dark-theme variants

If those are missing, the section will render as plain text. Verify they
exist before relying on the pattern.

## Goldmark requirement (CRITICAL)

For Goldmark to process the body of each `<details>` as Markdown
(so `$math$`, **bold**, `code`, and emphasis all render correctly):

- A **blank line** must follow every `<summary>...</summary>` opening.
- A **blank line** must precede every closing `</details>`.

Without those blank lines, the inner content renders as **literal raw
text** including the `$` math delimiters. This is the single most common
breakage of the pattern. Always check after building.

## Math escaping inside cards

Math inside the cards follows the same rules as math elsewhere in the post
(see `latex-escaping.md`). Subscripts: `\_`. Greek letters: no escape.
Currency: `\\$`. AVOID list still applies — do not put `\text{var\_name}`,
`\big|`, `\underbrace`, `\\!`, or `\\;` inside cards either.

## Copy-paste template (one full concept)

This block is lifted verbatim from `content/post/python_EconML/index.md`
which ships on the live site. Use it as the canonical template; replace
the term, math, definition, example, and analogy text with the post's own
content. Keep the HTML structure, class names, and blank-line whitespace
exactly as shown.

````markdown
**1. Potential outcomes** $Y\_i(t)$.
The outcome unit $i$ **would** take under treatment value $t$. Each unit has one potential outcome per treatment level. We observe only one of them: the one matching the treatment actually received. The rest are *counterfactual*. They live in worlds we never see.

<div class="concept-pair">
<details class="concept-card concept-example">
<summary>Example</summary>

Take district 47 in 2008. Four potential NTL outcomes exist for it: $Y\_{47,2008}(0)$, $Y\_{47,2008}(1)$, $Y\_{47,2008}(2)$, and $Y\_{47,2008}(3)$. They correspond to no mining, low prices, medium prices, and high prices. Only one is in the dataset. It is the one matching whatever treatment that district-year actually had. The other three are forever invisible.

</details>

<details class="concept-card concept-analogy">
<summary>Analogy</summary>

Every life decision is a fork in the road. You took one fork. The parallel-universe versions of yourself took the other forks. Their lives are real conceptual objects. You just cannot directly observe them. Causal inference reconstructs those parallel universes. It does so by looking at people who *did* take the other forks.

</details>
</div>
````

## Quality bar

| Criterion | Target |
|-----------|--------|
| Concept count | 5–8 |
| Definition sentence length | Median ~8 words, max ~20 |
| Example grounding | Real variable names + real numbers from this post |
| Analogy domain | Familiar (medicine, courtroom, photography, sports, sailing — not technical jargon from another field) |
| Card class names | `concept-card concept-example` and `concept-card concept-analogy` exactly |
| Wrapper | `<div class="concept-pair">` around the two `<details>` blocks |
| Blank lines | After every `<summary>`, before every `</details>` |
| Math AVOID list | None of the five fragile constructs inside Definition, Example, or Analogy |

## Section intro paragraph

A short paragraph between the section header and the first concept tells
the reader how to use the section. The Python EconML post uses:

> The post leans on a small vocabulary repeatedly. The rest of the
> tutorial assumes you can move between these terms quickly. Each concept
> below has three parts. The **definition** is always visible. The
> **example** and **analogy** sit behind clickable cards: open them when
> you need them, leave them collapsed for a quick scan. If a later
> section mentions "[some term]" or "[another term]" and the term feels
> slippery, this is the section to re-read.

Adapt the [some term] / [another term] placeholders to the actual hardest
two concepts in the section.
