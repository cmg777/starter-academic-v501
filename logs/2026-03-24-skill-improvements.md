# Skill Improvements for Agentic Workflows

**Date:** 2026-03-24
**Scope:** All four Claude Code skills

## What changed

Applied Anthropic skill-creator best practices to improve all four project skills for agentic workflows.

### Three improvements across all skills

1. **Interactive questioning** -- every skill now confirms intent before executing and offers follow-up actions after delivery (confirm -> execute -> follow-up pattern)
2. **Progressive disclosure** -- extracted self-contained reference material into `references/` subdirectories loaded on demand, reducing total SKILL.md lines from 2,643 to 1,809 (32% reduction)
3. **Pushy descriptions** -- rewritten description fields to explicitly mention trigger contexts for reliable skill activation

### Skill-by-skill changes

| Skill | Before | After | Reference files | Key additions |
|-------|--------|-------|----------------|---------------|
| data-science-post | 972 lines | 605 lines | 6 files | Step 0.5 (confirm scope), Step 5.5 (follow-up) |
| referee-post | 720 lines | 337 lines | 2 files | Step 0.5 (confirm review scope), Step 3 (follow-up) |
| infographic-instructions | 549 lines | 442 lines | 2 files | Step 2.5 (follow-up) |
| proofread-post | 402 lines | 425 lines | 0 files | Step 0.5 (announce scope), Step 12 (follow-up) |

### New reference files (10 total)

**data-science-post/references/:**
- `latex-escaping.md` -- Goldmark/KaTeX escaping rules, equation requirements
- `figure-conventions.md` -- dark theme setup, Mermaid diagrams, color families
- `causal-inference.md` -- estimand precision, ATE/ATT, framing guidelines
- `data-sources.md` -- data loading patterns (URL, named, DS4Bolivia, simulated DGP)
- `companion-deliverables.md` -- script.py, notebook.ipynb templates
- `quality-checklist.md` -- full 65-item verification checklist

**referee-post/references/:**
- `report-template.md` -- full report template with all section formats
- `scoring-and-criteria.md` -- severity definitions, verdict criteria, scoring rubric

**infographic-instructions/references/:**
- `panel-templates.md` -- three panel templates (Causal, ML, Exploratory) and element rules
- `static-sections.md` -- negative prompt template, condensed prompt structure

## Files modified

- `.claude/skills/data-science-post/SKILL.md`
- `.claude/skills/referee-post/SKILL.md`
- `.claude/skills/infographic-instructions/SKILL.md`
- `.claude/skills/proofread-post/SKILL.md`
- `CLAUDE.md`
- `README.md`

## Motivation

Based on best practices from https://github.com/anthropics/skills/tree/main/skills/skill-creator. The main user request was adding question-asking capability for complex tasks, which led to the broader three-improvement approach.
