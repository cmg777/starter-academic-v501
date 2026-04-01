# Quality Checklist

> This file is part of the `write-post` skill. Read this file during
> the verify step before delivering the post.

Run through every item before delivering the post.

## Front matter and structure

- [ ] Front matter follows Wowchemy conventions (match reference post)
- [ ] `toc: true` is set
- [ ] Overview motivates the case study question
- [ ] Learning objectives present (3-5 bullets)
- [ ] Summary in front matter is a single line
- [ ] Date set to yesterday's date
- [ ] No emojis in post content
- [ ] `links:` only reference files that exist in the page bundle

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

## Narrative and writing

- [ ] Discussion connects findings to case study question
- [ ] Limitations and next steps section
- [ ] Exercises (2-3 challenges)
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
