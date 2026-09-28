# Quality Checklist

> This file is part of the `write-post` skill. Read this file during
> the verify step before delivering the post.

Run through every item before delivering the post.

## Front matter and structure

- [ ] Front matter follows Wowchemy conventions (match reference post)
- [ ] `toc: true` is set
- [ ] Abstract section present as the **first** section (before Overview): one paragraph ~150-250 words, six beats (motivation -> objective -> data -> methods -> results-with-real-numbers -> implication), no bold labels/bullets, numbers match the post body
- [ ] Overview motivates the case study question
- [ ] Learning objectives present (3-5 bullets)
- [ ] Summary in front matter is a single line
- [ ] Date set to yesterday's date
- [ ] No emojis in post content
- [ ] `links:` only reference files that exist in the page bundle
- [ ] `links:` ends with the **MD version** entry pointing to `https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/<slug>/index.md`
- [ ] All `links:` entries share the same indentation (no mixing column-0 and column-2 list items within the same list)

## Sandwich pattern and interpretations

- [ ] Every output-producing code block has the sandwich (explanation -> code -> output -> interpretation)
- [ ] Every `print()` / `.describe()` / `.head()` code block has an output block (`text` language tag)
- [ ] At least 8 interpretation paragraphs with specific numbers
- [ ] Interpretation paragraphs translate metrics into domain-meaningful statements
- [ ] Figure image references placed immediately after generating code block

## Figures

- [ ] At least 3 figures referenced with `![alt](filename.png)`
- [ ] Matplotlib uses site colors (`#6a9bcc`, `#d97757`, `#141413`, `#00d4c8`)
- [ ] `featured.png` is NOT generated (user adds it manually)
- [ ] Color families used for related method groups in comparison charts
- [ ] Dark theme conventions followed if applicable

## Math and equations

- [ ] All LaTeX math uses Goldmark-safe escaping (`\_` for subscripts, `\\` for punctuation commands)
- [ ] At least 2 display-math equations (for quantitative method posts)
- [ ] Each equation has plain-language explanation and variable mapping
- [ ] Notation consistent throughout (same symbol = same concept)
- [ ] Currency dollar signs use `\\$` in index.md
- [ ] None of the five AVOID-list constructs are used: `\text{var\_name}` with escaped `_`, `\text{-}`, `\big|/\Big|/\bigg|` + subscript, `\underbrace/\overbrace`, `\\!/\\;` in display math (see `latex-escaping.md` § *Constructs to avoid*)

## Key Concepts (if present)

- [ ] Section appears after Learning objectives, before Setup and imports
- [ ] 5-8 concepts, each with bold term and a short-sentences definition paragraph
- [ ] Each concept has both an Example card and an Analogy card inside `<div class="concept-pair">`
- [ ] Cards use exactly `class="concept-card concept-example"` and `class="concept-card concept-analogy"`
- [ ] Examples reference real variable names and numbers from this post (not hypothetical or generic)
- [ ] Analogies use vivid familiar-domain comparisons (medicine, courtroom, photography, sports, sailing)
- [ ] Blank line after every `<summary>...</summary>` and before every closing `</details>` (required for Goldmark to process inner content as Markdown)
- [ ] No fragile-math constructs (AVOID list) inside any card body

## Learning components (if present)

- [ ] `python3 .claude/skills/write-post/scripts/lint_learn_cards.py content/post/<slug>/index.md` exits 0
- [ ] Class names exact: `learn-card predict-card`, `learn-card solution-card`, `learn-card misconception-card`, `learn-card proof-card`, `learn-card-reveal`
- [ ] Blank line after the kicker `<p>` and every `<summary>...</summary>`, and before every `</details>`
- [ ] `<summary>` holds raw HTML only (no Markdown, backticks or `\_`; use `<code>`); no headings inside cards; no card inside `.concept-pair`
- [ ] 4-6 predict cards, each placed **before** the code block whose output answers it; each reveal cites that output's real numbers
- [ ] Every solution card's `text` output was produced by actually running its code (Mode B: `[VERIFY]`)
- [ ] 3-6 misconception cards in `## Common misconceptions` (after the results, before Discussion); each opens with **What is actually true.** and cites evidence from the post; the section opens with prose, not a list
- [ ] Proof card (if any) sits right after the theorem statement and uses `^\top` for transposes
- [ ] Interactive widget (if any) follows `.claude/docs/learning-components.md` § *Interactive widget pattern* (fingerprinted JS/CSS; no `pre`/`code`/`img`/`h2`/`h3`/`table`/`$` inside; works in light, dark and at 375px; clean console)
- [ ] Rendered check: `check_learn_cards.cjs` (run from a scratch dir against the dev-server URL) reports OK in light, dark and 375px

## Narrative and writing

- [ ] Discussion connects findings to case study question
- [ ] Limitations and next steps section
- [ ] Exercises: 3-8 graded Warm-up/Core/Stretch under `###` headings (one per exercise, or one per difficulty level with bold `**Exercise N — Title.**` lead-ins), each exercise followed by one solution card whose output came from running the code
- [ ] Technical jargon defined on first use
- [ ] At least 2 analogies for complex concepts
- [ ] No sentence exceeds ~40 words
- [ ] Active voice preferred
- [ ] Transitions between all sections
- [ ] Takeaways are concrete with numbers (not generic summaries)
- [ ] Takeaways cover: method insight, data insight, limitation, next step

## References

- [ ] References section with numbered clickable links
- [ ] References include original method paper (not just library docs)
- [ ] Dataset source cited with author/year/title
- [ ] References numbered in order of first mention

## Code blocks (standalone mode only)

- [ ] Code blocks are well-commented and focused
- [ ] Output values marked `[VERIFY]` if not from an executed script
- [ ] Key Python/R/Stata functions linked to docs on first use

## Companion deliverables

- [ ] Notebook (if created) uses raw LaTeX (no Goldmark escaping)
- [ ] Notebook matches post code blocks in order and content

## Causal inference (if applicable)

- [ ] Estimand (ATE/ATT) explicitly stated for each method
- [ ] Randomized vs observational framing is accurate

## Academic integrity

- [ ] All text is original (no copy-pasted passages)
- [ ] External ideas and methods properly attributed
- [ ] Code adapted from external sources credited
