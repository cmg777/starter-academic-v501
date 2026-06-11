# 2026-06-11 — `review-slides` skill (slide-deck Review partner)

Added **`review-slides`**, the Review companion to `write-slides`. The slide deck was the only
Write skill with no Review partner; this closes that gap and makes the site's Write/Review pairing
complete across **six** artifact stages (script · results report · post · infographic · web app ·
slide deck). It lands right after the batch-slides work that gave every deckable tutorial a deck
(`logs/2026-06-11-batch-slides-complete.md`, 59 decks) — so a reviewer for that batch is now timely.

## What it does

Read-only audit of a generated deck at `content/post/<slug>/slides/`, scored across **10
non-overlapping dimensions** with a 1–10 score each and a verdict (ACCEPT / MINOR REVISION /
MAJOR REVISION). Mirrors the `review-app` conventions (severity HIGH/MED/LOW, verdict-changing
rules, saved report file, `focus:` subsets, `--no-browser`).

1. Source fidelity — every number/figure/table/equation/code snippet traces to the source post
2. Conceptual correctness — estimand, interpretation, identification, no causal overclaiming
3. Technical & render correctness — math typesets, fences illustrative, no leaked `{{…}}`
4. Title↔body consistency — assertion titles proven by their bodies; titles read as the abstract
5. **Readability & simplicity** *(primary emphasis)* — short sentences, ≤5 bullets, plain words
6. Typos & grammar
7. write-slides design adherence — Three Laws, 3-act arc, MB/MC pacing, closing-sentence rule
8. Branding integrity — `site-brand.scss`/`title-slide.html` byte-identical to the templates
9. Accessibility & legibility — captions, no overflow, projector-legible density
10. Deliverable completeness — bundle files present; `index.md` link uses `slides/index.html`

## Design decisions (confirmed with the user before building)

- **Ground truth = the source post.** Deck code is illustrative (`{.python}`, not executed) and
  figures are reused (`../<slug>_*.png`), so the audit cross-checks `index.md` + `results_report.md`
  and **never re-executes code**. The "code↔result consistency" check is: snippet, figure, and
  table on a slide all trace to the same thing in the post.
- **Static + headless browser pass.** Reuses `write-slides`'s `smoke-test.js` for static structure
  and diffs the two branding files; a vendored `slide-audit.cjs` (extends `math-check.cjs`) walks
  every slide for un-typeset LaTeX, overflow, and word/bullet density. `--no-browser` degrades to
  static (browser-only checks marked `[~]`, excluded from the verdict).
- **Readability is quantitative + qualitative.** Concrete thresholds (>~15-word sentences, >5
  bullets, complex words, passive voice, nested clauses, undefined jargon) plus holistic judgment;
  **every readability finding ships a `Before:`/`After:` rewrite**.
- **Strictly read-only.** Produces the inline report + `slides/SLIDES_REVIEW.md` and changes nothing
  else. Fixes are offered as a Phase-4 follow-up, delegated back to `write-slides`. No `--fix` flag.

## Files

```
.claude/skills/review-slides/
  SKILL.md                              # 5-phase spec, 10 dimensions, quality checklist
  references/review-checklist.md        # per-dimension working checks
  references/scoring-and-criteria.md    # 1–10 rubric, verdict + verdict-changing rules
  references/readability-rules.md       # thresholds + complex→simple table + rewrite patterns
  references/design-adherence.md        # condensed write-slides best-practices rubric
  references/report-template.md         # canonical SLIDES_REVIEW.md skeleton
  references/focus-modes.md             # focus: keyword → dimension subsets
  references/headless-browser.md        # browser-pass mechanics + Playwright fallback
  references/templates/slide-audit.cjs  # vendored browser walk (math render + overflow + density)
```

Also updated: `CLAUDE.md` (skill count 15→16, pipeline table, Skills index) and `README.md`
(architecture intro, pipeline table, fixed the write-slides "no review pair yet" note, added a
Review Slide Deck section).

## Verification

- `node --check slide-audit.cjs` → parses.
- `smoke-test.js` on the reference deck `r_double_lasso` → 15/15 checks pass.
- Branding diffs on `r_double_lasso` → both files CLEAN (byte-identical to templates).
- `slide-audit.cjs` on `r_double_lasso` → exits 3 with the `npx playwright install chromium` hint
  (Playwright not installed locally) — the documented graceful-degradation path, not a failure.

Full end-to-end browser verification (math-render + overflow per slide) requires Playwright, which
is not installed on this machine; the skill marks those checks `[~]` and falls back to static,
exactly as `write-slides`'s Layer C does.

## Not in this change

`content/post/python_dynamic_panel/` (an in-progress tutorial: script + results + plan, **no
`index.md` yet**) and its related `.gitignore` rule were already in the working tree from separate
work and are **not** part of this commit — they belong to that tutorial's own future commit.
