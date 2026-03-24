# Quality Checklist

> This file is part of the `data-science-post` skill. If you update this
> content, also update the summary in SKILL.md. Read this file during
> Step 5 (Verify).

Run through every item before delivering the post.

## Front matter and structure

- [ ] Front matter follows Wowchemy conventions (match reference post)
- [ ] `toc: true` is set
- [ ] Overview motivates the case study question
- [ ] Learning objectives present (3-5 bullets)
- [ ] Summary in front matter is a single line
- [ ] Date set to current date
- [ ] No emojis in post content

## Sandwich pattern and interpretations

- [ ] Every output-producing code block has the sandwich (explanation -> code -> output -> interpretation)
- [ ] Every `print()` / `.describe()` / `.head()` code block has an output block (`text` language tag)
- [ ] At least 8 interpretation paragraphs with specific numbers
- [ ] Interpretation paragraphs translate metrics into domain-meaningful statements
- [ ] Figure image references placed immediately after generating code block

## Figures

- [ ] At least 3 figures with `dpi=300, bbox_inches="tight"`
- [ ] Matplotlib uses site colors (`#6a9bcc`, `#d97757`, `#141413`)
- [ ] `featured.png` is NOT generated (user adds it manually)
- [ ] Color families used for related method groups in comparison charts
- [ ] Dark theme figures (if used): `fig.patch.set_linewidth(0)` after every `plt.subplots()`
- [ ] Dark theme figures (if used): savefig includes `facecolor`, `edgecolor`, `pad_inches=0`
- [ ] Dark theme figures (if used): scatter `edgecolors` match background color

## Math and equations

- [ ] All LaTeX math uses Goldmark-safe escaping (`\_` for subscripts, `\\` for punctuation commands)
- [ ] Math rendering visually verified in Hugo dev server
- [ ] At least 2 display-math equations (for quantitative method posts)
- [ ] Each equation has plain-language explanation and variable mapping
- [ ] Notation consistent throughout (same symbol = same concept)
- [ ] Currency dollar signs use `\\$` in index.md, `\$` in notebook.ipynb

## Narrative and writing

- [ ] Discussion connects findings to case study question
- [ ] Limitations and next steps section
- [ ] Exercises (2-3 challenges, encouraged)
- [ ] Technical jargon defined on first use (no unexplained terms)
- [ ] At least 2 analogies or concrete examples for complex concepts
- [ ] No sentence exceeds ~40 words
- [ ] Active voice preferred throughout
- [ ] Transitions between all sections (no abrupt jumps)
- [ ] Discussion answers the Overview question explicitly
- [ ] "So what?" practical implication stated
- [ ] Takeaways are concrete with numbers (not generic summaries)
- [ ] Takeaways cover: method insight, data insight, limitation, next step
- [ ] Narrative follows arc: Question -> Intuition -> Baseline -> Method -> Validation -> Takeaways

## References

- [ ] References section with numbered clickable links
- [ ] References include original method paper (not just library docs)
- [ ] Dataset source cited with author/year/title
- [ ] References numbered in order of first mention

## Code and deliverables

- [ ] Data loading matches user-specified dataset
- [ ] Notebook companion (if created) uses raw LaTeX (no Goldmark escaping)
- [ ] Summary table compares key metrics
- [ ] Key Python functions linked to docs and explained on first use
- [ ] Simple baseline established before the full method
- [ ] At least one robustness/validation check included
- [ ] Comparison summary table for multiple approaches or configurations
- [ ] Diagram included for causal/structural/multi-step methods
- [ ] Learning objectives use strong action verbs (Understand, Implement, Estimate, Assess, Compare)

## Code execution and verification

- [ ] Code executed and output blocks match actual results
- [ ] All PNGs regenerated after any code/color changes (no stale images)
- [ ] No orphaned PNGs in page bundle (every PNG referenced in post)
- [ ] External tool dependencies wrapped in try/except (graphviz, etc.)
- [ ] Simulated DGP (if used): true parameters documented in docstring, verified against estimates
- [ ] `diagram: true` in front matter if Mermaid diagrams are used

## Causal inference (if applicable)

- [ ] Causal posts: estimand (ATE/ATT) explicitly stated for each method
- [ ] Causal posts: randomized vs observational framing is accurate

## Academic integrity

- [ ] All text is original -- no copy-pasted passages from references, docs, or tutorials
- [ ] External ideas and methods properly attributed in-text and in References
- [ ] Code adapted from external sources credited with comments and references
