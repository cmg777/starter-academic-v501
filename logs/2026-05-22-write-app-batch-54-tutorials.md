# Batch web app generation — 54 tutorial posts

**Date:** 2026-05-22
**Scope:** Every eligible tutorial post in `content/post/` (23 Python +
12 R + 19 Stata = 54). `r_double_lasso` excluded as it already shipped
an app the previous day.

## Summary

After validating `/project:write-app` against `r_double_lasso/web_app/`
on 2026-05-21, the skill was driven across the full tutorial
back-catalog in **14 parallel batches of 4 agents each** (last batch
= 2). Every batch member ran in `--no-verify` autonomous mode: the
agent read the post + results CSVs, self-answered the skill's
interview questions choosing pedagogically-strongest defaults, wrote
the standard 7-file `web_app/` bundle, updated the post's YAML
`links:` to add a "Web app" button, and ran the Node `vm` smoke test
on `dgp.js` + `lasso.js` (8/8 across the board).

## Results

- **54 apps generated, 0 SKIP, 0 ERROR.**
- **53 posts** received their YAML "Web app" link (`url: web_app/index.html`,
  trailing-slash bug avoided per `references/render-and-fix.md`).
- **`content/post/*/web_app/` folder count:** 55 (54 new + 1 pre-existing
  `r_double_lasso`).

Per-post detail is in `logs/write-app-batch-2026-05-22.md` — one
table row per slug with widgets chosen, takeaway count, and a one-line
note. Quality is uneven by design (this was a bulk pass for review
later, not a polish pass); widget choice varied from straight READY
combos (concept-animation + penalty-slider + dgp-simulator +
forest-plot) to bespoke custom builders for spatial/SC/IV/CATE
topics where the 4 READY archetypes did not fit.

## Caveats

Two surfaced during the verification step:

1. **`r_dynamic_bma2`** has no `index.md` — it's a results-only folder
   (analysis.R + CSVs + results_report.md + a freshly-built web_app/)
   awaiting a publishable Hugo post. The YAML link cannot be injected
   until the post is created; the agent correctly skipped that step.
2. **`r_causalpolicy_workshop`** — the agent reported DONE on all
   steps but missed the YAML link injection. Fixed manually after
   the batch: link added at the top of the `links:` array.

No other gaps. The single ERROR rate is **0/54**; the missing-link
rate is **1/54** (excluding the legitimate-missing-index case).

## What's next

The user explicitly deferred review to a later session. The natural
follow-ups are:

- Spot-check 3 posts in Hugo dev server (one Python, one R, one Stata)
  to catch any post-specific render issues the smoke test would not
  see.
- `/project:review-app <slug>` across the batch — the 10-dimension
  audit will surface widget-quality, accessibility, and pedagogical-
  alignment issues that the autonomous interview could not weigh.
- Publish `r_dynamic_bma2` (create its `index.md`) so the web_app/
  folder can be linked.

## Skill versions used

- `/project:write-app` — the skill validated against `r_double_lasso`
  on 2026-05-21 (committed in `1fddeb1`). No skill edits this session.
- `/project:review-app` — not invoked this session.

The generated apps remain under `--no-verify` mode and have not been
opened in a browser; smoke-test pass is necessary but not sufficient
for "this app is good." Review pass is the next gate.
