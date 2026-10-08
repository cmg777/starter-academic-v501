# Web app review — stata_rd

**Date:** 2026-05-24
**Reviewer:** /project:review-app (manual execution)
**Verdict:** ACCEPT (after MED fixes applied in this pass)

## Summary

The RDD interactive lab is functionally complete, smoke-tests pass 8/8, all
HTTP assets serve 200, the Web app YAML link is correct
(`web_app/index.html`, no trailing-slash bug), and the four-tab structure
covers the post's takeaways well (Intro → Simulator → Bandwidth Lab →
Robustness Forest).

The pre-fix audit detected three label-vs-line overlap issues — all in the
"τ readout sits where a regression / sweep line passes through it" family.
A small dark-blue rounded backdrop rect (rgba(31,43,94,0.85), rx 3) is now
appended behind each τ label so the line visually passes *behind* the
readout instead of crossing through it.

## Dimension scores

| # | Dimension              | Score | Notes                                           |
|---|------------------------|-------|-------------------------------------------------|
| 1 | File completeness      | 10    | 7/7 files present; data/results.json valid       |
| 2 | HTML structure         |  9    | 4 tabs, matching IDs, roles, aria-selected       |
| 3 | JS correctness         | 10    | smoke 8/8; no console errors in Playwright pass |
| 4 | Data contract          | 10    | 22 rows match results_report.md                  |
| 5 | Accessibility          |  9    | every slider has aria-label; tablist semantics OK|
| 6 | Performance            | 10    | lasso_path 101 ms; slider tick instant           |
| 7 | Pedagogy               |  9    | takeaways foregrounded; 10 glossary entries     |
| 8 | Hugo integration       | 10    | YAML link uses index.html; all assets HTTP 200   |
| 9 | Visual design          |  9    | dark palette tokens only; backdrop fix improves  |
|10 | Mobile responsiveness  |  9    | viewBox + responsive controls; tab strip wraps   |

## Issues addressed in this pass

| Severity | Location              | Issue                                                  | Fix                                                            |
|----------|-----------------------|--------------------------------------------------------|----------------------------------------------------------------|
| MED      | charts.js (Tab 1)     | τ label crossed by orange right-side regression line   | append dark backdrop rect (rgba(31,43,94,0.85)) behind label  |
| MED      | charts.js (Tab 2)     | τ̂ label crossed by orange fit line in simulator       | same backdrop pattern in `rd_simulator_scatter` cutoff group  |
| LOW      | charts.js (Tab 3)     | bw-sweep cursor label could touch teal τ̂(h) line     | backdrop rect + right-edge anchor flip                         |

## Positive highlights

- Tab 1 intro animation cleanly shows the discontinuity growing/shrinking
  with τ, with a legend backdrop already in place.
- Tab 4 forest plot faceting is clean — no label collisions across the four
  outcome panels at 1280×800.
- Pedagogy is strong: every tab has a `<div class="pedagogy">` "what to
  look for" block with concrete numbers from the post.
- Sign conventions explained explicitly (parametric +; rdrobust -) in the
  Tab-4 narrative card — this is a common pitfall in RD posts.

## How to re-review

```
/project:review-app stata_rd
```
