# Partial Identification Post and New Claude Code Skills

**Date:** 2026-03-13

## What was added

### Partial identification post (`content/post/python_partial_identification/`)

New notebook-style tutorial created via the `data-science-post` skill. Covers partial identification and causal bounding methods using the CausalBoundingEngine package with a simulated job training case study.

- `index.md` — full tutorial with Manski bounds, Tian-Pearl bounds, autobound (LP), and entropy bounds for ATE and PNS estimands
- `script.py` — standalone Python script that generates all figures
- 5 matplotlib figures + `featured.png` (ATE bounds comparison chart)
- `infographic_instructions.md` — sketchnote-style infographic summary (6 panels)
- 2 Mermaid diagrams (causal DAG, decision flowchart)
- Coverage simulation (100 runs) and sample size sensitivity analysis

### Infographic-instructions skill (`.claude/skills/infographic-instructions/SKILL.md`)

New Claude Code skill that generates sketchnote-style infographic instructions summarizing a blog post into 6 panels with the site color palette.

### Proofread-post skill (`.claude/skills/proofread-post/SKILL.md`)

New Claude Code skill for final proofreading before publication. Runs a 9-point checklist (front matter, markdown structure, math notation, code/output pairing, images, code consistency, Mermaid diagrams, references, site conventions). Read-only — produces a pass/fail report without modifying files.

### Random Forest post infographic (`content/post/python_ml_random_forest/infographic_instructions.md`)

Infographic instructions generated for the existing Random Forest post.

## What was fixed

### Partial identification post — referee review

Applied fixes from referee review:

- Regenerated causal DAG as Mermaid diagram with site colors
- Added decision flowchart (when to use partial identification vs point identification)
- Fixed legend positions: ATE bounds chart uses `bbox_to_anchor=(0.5, -0.12)` below the chart; sample size chart uses `loc="center right"` in the gap between data lines
- Added interpretation paragraphs with specific numeric values throughout
- Added PNS (Probability of Necessity and Sufficiency) analysis section
- Added coverage simulation and sample size sensitivity analysis

### Random Forest featured image

Replaced `featured.png` with `featured.jpg` (Excalidraw visual summary).

## Documentation updates

- **CLAUDE.md:** Added documentation for infographic-instructions and proofread-post skills
- **README.md:** Added documentation for infographic-instructions and proofread-post skills
