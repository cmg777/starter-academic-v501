# Data Science Post Skill

**Date:** 2026-03-10

## What was added

Created a Claude Code skill (`data-science-post`) that automates generating notebook-style data science blog posts for carlos-mendez.org.

**Skill file:** `.claude/skills/data-science-post/SKILL.md`

## What it does

When invoked via `/project:data-science-post <topic> dataset: <dataset> [references: <URLs>]`, the skill instructs Claude Code to:

1. Parse the topic, dataset, and optional references from user input
2. Fetch reference URLs to understand library APIs and dataset structure
3. Create a Hugo page bundle at `content/post/python_<topic-slug>/`
4. Write a full tutorial post (`index.md`) with YAML front matter, case-study framing, code blocks, figures, and interpretation paragraphs
5. Optionally create a standalone `script.py`
6. Generate at least 3 matplotlib figures using the site color palette

## Key design decisions

- **Flexible data sources** -- supports URLs, named datasets (scikit-learn, seaborn), DS4Bolivia, and user-described data
- **Sandwich pattern** -- every code block is preceded by a conceptual explanation and followed by an interpretation paragraph
- **Interpretation is the most important step** -- requires at least 8 paragraphs with specific numeric values, positioned as a dedicated review pass (Step 3) after the full draft is written
- **Site color palette enforced** -- steel blue (`#6a9bcc`), warm orange (`#d97757`), near black (`#141413`), teal (`#00d4c8`)
- **TOC enabled** -- `toc: true` in front matter activates the left-side table of contents
- **Reference post** -- `content/post/python_ml_random_forest/index.md` serves as the canonical example

## Structure (5 steps)

1. **Step 1: Front matter** -- YAML front matter following Wowchemy conventions
2. **Step 2: Write the post body** -- post structure, sandwich pattern, code blocks, figures, tables, references
3. **Step 3: Interpret results** -- review pass to ensure every output has a contextual interpretation
4. **Step 4: Create script.py** -- optional standalone script
5. **Step 5: Verify** -- check deliverables, run Hugo dev server, visual checks

## Documentation updated

- `CLAUDE.md` -- added Claude Code Skills section with usage instructions and conventions
- `README.md` -- added "New Data Science Post" subsection under Adding Content, updated Custom CSS section count

## Posts created

### Random Forest tutorial (`content/post/python_ml_random_forest/`)
- Predicting municipal development (IMDS) from satellite embeddings using Random Forest
- 7 figures, standalone script, Jupyter notebook
- Serves as the reference post for the skill

### Double Machine Learning tutorial (`content/post/python_doubleml/`)
- Estimating the causal effect of a cash bonus on unemployment duration using DML
- 4 matplotlib figures + Excalidraw visual summary as featured image
- Companion Jupyter notebook and standalone script
- Required three rounds of LaTeX math fixes (see "Lessons learned" below)

## Skill updates (post-DoubleML)

Based on lessons learned from the DoubleML post, the skill was updated with:

1. **LaTeX math escaping rules** (new section 2.4) -- complete Goldmark + KaTeX escaping guide with quick-reference table
2. **Output blocks** (updated section 2.2) -- four-layer sandwich pattern: explanation, code, output block (no language tag), interpretation
3. **Featured image guidance** (new Step 4c) -- save `featured.png` in page bundle
4. **Notebook companion guidance** (new Step 4b) -- `.ipynb` creation with note that notebooks use raw LaTeX
5. **Updated quality checklist** -- 5 new items covering math, outputs, featured image

## Lessons learned

### Hugo/Goldmark + KaTeX math escaping

Goldmark processes markdown BEFORE KaTeX renders math. The `\` + ASCII punctuation character combination is treated as an escape sequence (backslash stripped). This requires:

- `\_` for subscripts (Goldmark strips `\`, KaTeX sees `_`)
- `\\,` `\\;` `\\%` for LaTeX punctuation commands (Goldmark: `\\` -> `\`)
- `\theta` `\hat` `\text` need no escaping (`\` + letter is not an escape)
- `$$...$$` display math is NOT a protected block -- same rules apply
- Multiple `_` in one paragraph get paired as `<em>` -- always escape

### Code outputs are essential

Readers need to see what `print()` statements produce. Output blocks (fenced code with no language tag) should follow every code block that prints results.

## Built upon

- Source skill from `cmg777/claude4data` repo (`.claude/skills/data-science-tutorial/SKILL.md`) -- adapted from Jupyter/Quarto notebook format to Hugo blog post format
- Notebook-style CSS (sections 4-6 in `assets/scss/custom.scss`)
- Custom post layout with TOC sidebar (`layouts/post/single.html`)
