# Python EconML Tutorial: Resource Curse with CausalForestDML

**Date**: 2026-05-07
**Post**: `content/post/python_EconML/`
**Status**: Complete
**Companion**: `content/post/stata_cate2/` (Stata 19 version)

## What was done

Created a Python EconML tutorial that complements the Stata CATE2 tutorial. Two-phase workflow: (1) revised existing reference materials, (2) wrote the blog post from actual script output.

### Phase 1: Reference materials revised

- **`references/tutorial-econml-resource-curse.py`** -- Removed broken MCF dependency, added dark theme (site colors), fixed data URL, renamed all figures to `python_econml_*.png`, added individual GATE panels
- **`references/tutorial-econml-resource-curse.qmd`** -- Synced with .py: inline ground truth, dark theme, site colors, updated data URL
- **`references/tutorial-econml-resource-curse.ipynb`** -- Updated Colab badge (`cmg777/starter-academic-v501`), dark theme, site colors, data URL
- **`references/README.md`** -- Removed MCF references, updated data source and Colab badge

### Phase 2: Blog post

- `index.md` (~330 lines) -- notebook-style tutorial with sandwich pattern
- Methodology-focused narrative (DML framework, Neyman orthogonality, honest trees)
- 2 display-math equations (CATE definition, partial linear model)
- 1 Mermaid DML pipeline flowchart with site colors
- 11 interpretation paragraphs with specific numbers
- 9 dark-themed figures (300 dpi)
- 5 exercises, 6 references, 7 learning objectives

### Key results

Script runtime: 1.3 minutes. All three findings confirmed:
1. Mining increases NTL: ATE(1-0) = 0.240 (ground truth 0.250)
2. Non-linear prices: ATE(2-1) = 0.029 n.s., ATE(3-1) = 0.220** (ground truth 0.05 and 0.30)
3. Institutions moderate mining (GATE range 0.089) but NOT prices (GATE range 0.045)

### Figures generated (dark theme)

- `python_econml_treatment_dist.png` -- treatment distribution bar chart
- `python_econml_gate_ntl_1v0_exec.png` -- GATE mining effect by exec constraints
- `python_econml_gate_ntl_3v1_exec.png` -- GATE price effect by exec constraints
- `python_econml_gate_ntl_1v0_qog.png` -- GATE mining effect by quality of govt
- `python_econml_gate_ntl_3v1_qog.png` -- GATE price effect by quality of govt
- `python_econml_gate_exec.png` -- 4-panel composite (exec constraints)
- `python_econml_gate_qog.png` -- 4-panel composite (quality of govt)
- `python_econml_var_importance.png` -- feature importance
- `python_econml_cate_tree.png` -- CATE interpreter tree

### Design decisions

- **Self-contained**: No MCF dependency; ground-truth parameters defined inline
- **Dark theme**: Site colors (`#0f1729` bg, `#6a9bcc`, `#d97757`, `#00d4c8`)
- **Methodology emphasis**: DML framework, not economic narrative (Stata post carries the story)
- **Link only**: References Stata companion, no comparison section
- **Data**: GitHub URL with local fallback (URL pending upload to quarcs-lab/data-open)

### Review

12-dimension review completed. Verdict: MINOR REVISION.
- HIGH fix applied: LaTeX escaping for curly braces in CATE equation (`\{` -> `\\{`)
- Remaining MEDIUM: orphaned composite PNGs, missing analogies, no figure captions
- These can be addressed in a follow-up pass

### Technical notes

- EconML 0.16.0 installed in miniforge3/envs/sds (Python 3.11.6)
- `n_jobs=1` + `random_state=42` for reproducibility
- GroupKFold by district_id prevents data leakage but does NOT cluster SEs
- Data URL `quarcs-lab/data-open` returns 404; script falls back to local CSV from stata_cate2/
