# DoWhy Post Updates: Causal Graph, Covariate Balance, and Doc Fixes

**Date:** 2026-03-13

## What changed

### Causal graph regenerated (`content/post/python_dowhy/dowhy_causal_graph.png`)

The old causal graph was a matplotlib figure that didn't match the `model.view_model(layout="dot")` code shown in the post. Regenerated using pydot + Graphviz with site colors:

- Steel blue rounded boxes for treatment (`treat`) and outcome (`re78`)
- Light gray ellipses for confounders
- Warm orange arrow for the causal effect (treat → re78)
- Gray arrows for confounder paths
- Top-down layout: confounders across top row, treatment/outcome below

**Prerequisite:** Installed Graphviz v14.1.3 via Homebrew (required accepting Xcode license first with `sudo xcodebuild -license accept`).

### Covariate balance plots split

Replaced single `dowhy_covariate_balance.png` with two focused plots:

- `dowhy_covariate_balance_categorical.png` — grouped bar chart for binary covariates
- `dowhy_covariate_balance_smd.png` — Love plot (standardized mean differences) for all covariates

### Documentation fixes

- **CLAUDE.md:** Corrected Hugo binary path from v0.109.0 (doesn't exist) to v0.84.2
- **CLAUDE.md / README.md:** Added Mermaid diagram support, MathJax escaping rules, causal post conventions, referee-post skill docs

### Other DoWhy post improvements (accumulated from prior sessions)

- Expanded estimation method explanations
- Added cross-validation report (Python vs R vs Stata)
- Referee report fixes (variable names, ATE values, references)
- Notebook-style CSS tweaks
- MathJax dollar-sign fix (`processEscapes: true`)
