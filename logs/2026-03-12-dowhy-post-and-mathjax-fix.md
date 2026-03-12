# DoWhy Post, Referee Fixes, and MathJax Dollar-Sign Fix

**Date:** 2026-03-12

## What was added

### DoWhy causal inference post (`content/post/python_dowhy/`)

New notebook-style tutorial created via the `data-science-post` skill. Covers causal inference using DoWhy and the Lalonde/NSW dataset.

- `index.md` — full tutorial with 5 estimation methods (Regression Adjustment, IPW, Doubly Robust/AIPW, PS Stratification, PS Matching) and 3 refutation tests
- `script.py` — standalone Python script
- `notebook.ipynb` — companion Jupyter notebook
- 4 matplotlib figures + `featured.png` (estimate comparison chart)

### Referee-post skill (`.claude/skills/referee-post/SKILL.md`)

New Claude Code skill that reviews data science posts as an expert professor. Produces structured referee reports with severity-ranked issues and priority action items. Read-only — does not modify posts.

### Notebook-post archetype (`archetypes/notebook-post.md`)

Hugo archetype template for notebook-style data science posts.

## What was fixed

### MathJax dollar-sign rendering (site-wide)

Currency amounts like `$1,736` in prose were interpreted as MathJax inline math delimiters, causing garbled rendering.

**Root cause:** Wowchemy theme's MathJax config sets `processEscapes: false`, making it impossible to escape literal `$` signs.

**Fix:**
1. Created `assets/js/mathjax-config.js` to override the theme config with `processEscapes: true`
2. Used `\\$` in markdown source for currency amounts (Goldmark: `\\` -> `\`, MathJax: `\$` -> literal `$`)

**Note:** `&#36;` HTML entities do NOT work — the browser decodes them back to `$` before MathJax processes the DOM.

### Referee report fixes

Applied fixes from referee review to both the DoWhy and DoubleML posts:

**DoWhy post:**
- Fixed `estimate_lr` -> `estimate_ra` bug in 3 refutation code blocks
- Corrected PS Matching ATE value ($1,752 -> $1,736) throughout
- Removed unused `import seaborn as sns`
- Added Doubly Robust manual implementation note
- Added seminal references (Horvitz & Thompson, Robins et al.)
- Added next-step takeaway bullet

**DoubleML post (`content/post/python_doubleml/index.md`):**
- Various fixes from referee review

**Random Forest post (`content/post/python_ml_random_forest/index.md`):**
- Simplification edits for beginners

## Skill updates

- `.claude/skills/data-science-post/SKILL.md` — updated with LaTeX math escaping rules, output block conventions, featured image guidance, and notebook companion guidance (lessons from DoubleML post)

## Lessons learned

### MathJax currency escaping

- `&#36;` HTML entities do NOT work (browser decodes before MathJax)
- `\\$` in markdown + `processEscapes: true` in MathJax config is the correct fix
- Notebook `.ipynb` files use `\$` directly (no Goldmark processing)
- The override file `assets/js/mathjax-config.js` takes priority over the Wowchemy theme module version
