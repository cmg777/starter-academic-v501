# Skill System Redesign: 4 Skills to 8 Write/Review Pairs

**Date:** 2026-04-01

## Summary

Redesigned the Claude Code skill system from 4 monolithic skills to 8 focused Write/Review pairs organized across four artifact stages.

## Motivation

- `data-science-post` was a 756-line monolith writing both scripts AND blog posts
- Review capabilities were split across `referee-post` (deep) and `proofread-post` (surface) with overlapping concerns
- No way to iterate on scripts independently from posts
- No review capability for infographic instructions

## New Architecture

| Stage | Write | Review |
|-------|-------|--------|
| Script | `write-script` | `review-script` |
| Results report | `write-results-report` | `review-results-report` |
| Blog post | `write-post` | `review-post` |
| Infographic | `write-infographic` | `review-infographic` |

**Key design decisions:**
- Independent skills (not strict dependency chain)
- Results report = execution summary bridging script and post
- Single thorough review per artifact (no separate proofread)
- Script skill writes + executes + saves outputs
- Self-contained references per skill (no shared commons)
- `write-post` has two modes: consume existing materials OR standalone

## Files Created

- 8 SKILL.md files (total ~2,640 lines)
- 20 reference files across all skills
- Legacy skills preserved at `.claude/skills/legacy/`

## Changes to Documentation

- CLAUDE.md: replaced 4-skill section with 8-skill pipeline overview
- README.md: replaced individual skill sections with Write/Review pair table
