# 2026-10-03 — python_did101: academic readability rewrite

The author asked for the post to be rewritten in the voice of an academic writer in development
economics. Goals: clearer punctuation, grammar and flow, short sentences, a topic, support and
concluding sentence in each paragraph, at least three sentences per paragraph, formal language, no
possessive apostrophes or contractions, and no em dashes, with the meaning unchanged. Scope and
conventions were agreed before the work began.

## Scope

- **Rewritten:** the Abstract and every narrative prose paragraph in §1–§16, including the lab
  introduction and conclusion and the exercise prompts. Short sentences, formal register, American
  spelling. Teaching devices are kept (runner/rooster analogies, predict prompts, direct address).
  Colloquialisms are removed ("staggering", "Case closed? Not quite.", "heavy lifting", "textbook
  pattern"). Paragraphs could be split or merged, keeping the order of ideas.
- **Mechanical fixes only:** learning cards (predict/reveal, misconception, solution, the §1.3
  definition/example/analogy cards), figure alt text, lists, table cells and the lab experiment
  steps. Their wording is kept; em dashes become commas, colons or semicolons, and possessives are
  rephrased ("the program's effect" → "the effect of the program"). The "—" placeholder in the
  event-study table became "n/a".
- **Untouched:** code, printed outputs, equations, headings and anchors, references, links, front
  matter (so the ES/JA stubs need no change).
- Mirrored into `references/tutorial.qmd` (77 of 86 changed paragraphs automatically; the 9 qmd
  variants by hand). The qmd-only prose (render instructions, setup note, dark-theme note, CSV
  loading paragraph) got the same treatment. `notebook.ipynb` and `python_did101.zip` were rebuilt.

## Measures (post prose, outside code, equations and references)

| | Before | After |
|---|---|---|
| Em dashes | 39 | 0 |
| Possessive apostrophes | 32 | 0 (proper name Sant'Anna exempt) |
| Contractions / British spellings | 0 / 1 | 0 / 0 |
| Sentences in prose paragraphs | 324 | 381 |
| Mean words per sentence | 15.6 | 14.0 |
| Longest sentence in rewritten prose | 77 words | 31 words |
| Prose paragraphs with fewer than 3 sentences | 40 | 0 (16 exempt card bodies and list lead-ins remain) |

## Verification

- Fidelity script (before vs after, post and qmd): code blocks, display equations, headings and
  URLs are byte-identical. The number multiset changed only where "(1)/(2)/(3)" became
  "First/Second/Third" and one sentence gained a "2×2" mention. No estimate changed.
- Learn-card lint OK (5 predict, 5 misconception, 4 solution). Hugo production build clean.
  Headless render: 0 MathJax errors, 0 page errors, 0 em dashes on the page, the lab works.
- The tutorial renders from the rebuilt bundle (all pins `[OK]`, 0 error cells, 8 figures); the
  test kernelspec was removed afterwards.
