---
name: review-app
description: Comprehensive audit of an interactive web app generated for a published post. Inspects 10 non-overlapping dimensions (file completeness, HTML structure, JS correctness, data contract, accessibility, performance, pedagogy, Hugo integration, visual design, mobile responsiveness). Runs the write-app smoke test under Node, a Hugo dev server for HTTP-200 checks, and a headless Chromium pass across all tabs in desktop + mobile viewports. Produces a verdict (ACCEPT / MINOR REVISION / MAJOR REVISION), 1-10 score per dimension, and an issues table written to web_app/REVIEW.md. Read-only.
argument-hint: "<post slug, e.g. r_double_lasso> [focus: pedagogy | code | accessibility | data | hugo | visual] [--no-browser]"
disable-model-invocation: true
user-invocable: true
---

# Review App: Comprehensive Interactive Web App Audit

Act as an **expert UX-meets-data-science reviewer** auditing a generated
interactive web app on this site. The app being audited lives at
`content/post/<slug>/web_app/` and was produced by
[`/project:write-app`](../write-app/SKILL.md). This skill checks that
the app is functioning correctly, complete, pedagogical, and easy to
work with — across 10 non-overlapping dimensions.

The review is **read-only**. It produces a scored report at
`content/post/<slug>/web_app/REVIEW.md` (plus a stdout summary) without
modifying the app, the post, or any other site file.

The skill is the sibling of `review-post`, `review-script`,
`review-results-report`, and `review-infographic`, and it matches their
phase structure verbatim. Like the others, it does **not** wait for
user confirmation — Phase 0.5 announces scope and the review proceeds.

---

## Example invocations

```
# Full audit (all 10 dimensions, browser pass, REVIEW.md written)
/project:review-app r_double_lasso
/project:review-app python_doubleml

# Targeted re-review after a fix
/project:review-app r_double_lasso focus: pedagogy
/project:review-app python_doubleml focus: code and accessibility

# Skip the Playwright pass (e.g. CI or offline)
/project:review-app r_did --no-browser
```

---

## Focus keyword table

When `focus:` is provided, restrict the review to the matching
dimensions only. If omitted, run all 10. Combine with `and` or `,`:
`focus: code and accessibility` ⇒ Dimensions 3, 4, 5.

| Focus keyword     | Dimensions run                |
|-------------------|-------------------------------|
| `pedagogy`        | 7                             |
| `code`            | 3, 4                          |
| `accessibility`   | 5                             |
| `data`            | 4                             |
| `hugo`            | 8                             |
| `visual`          | 9, 10                         |
| (omitted)         | All 10                        |

Full keyword → dimension map in
[`references/focus-modes.md`](references/focus-modes.md).

---

## What this skill does NOT do

- **Does not modify the web app, the post's `index.md`, or any
  reference file.** Read-only.
- **Does not run the post's R / Python / Stata pipeline.** That is
  `/project:review-script` and `/project:review-results-report`.
- **Does not auto-fix issues.** The report names the fix; the user
  applies it (or re-runs `/project:write-app`).
- **Does not commit or push.** Phase 5 prints copy-pasteable
  follow-ups; the user runs them.
- **Does not duplicate write-app's templates.** Phase 3 reuses
  [`.claude/skills/write-app/references/templates/smoke-test.js`](../write-app/references/templates/smoke-test.js)
  verbatim.

---

## The 10 review dimensions

Detailed per-dimension checks live in
[`references/review-checklist.md`](references/review-checklist.md).
Summary:

| # | Dimension              | What it verifies                                                                                  |
|---|------------------------|---------------------------------------------------------------------------------------------------|
| 1 | File completeness      | Every expected file exists at `web_app/`; no stray files; bundle size sensible                    |
| 2 | HTML structure         | 4 tabs with matching button/pane IDs; heading hierarchy; semantic roles; D3 loads before app.js   |
| 3 | JS correctness         | Smoke test passes 7/7; no `{{…}}` template-leakage; no console errors in browser                  |
| 4 | Data contract          | `results.json` parses; schema matches `data-handling.md`; values agree with post's CSVs           |
| 5 | Accessibility          | Every slider has `aria-label`; tabs use `role="tab"` + `aria-selected`; contrast ≥ 4.5:1          |
| 6 | Performance            | `lasso_path(n=500, p=100)` < 300 ms; one slider tick in browser < 300 ms                          |
| 7 | Pedagogy               | Post takeaways foregrounded in Tab-1 lede; "what to look for" panels; glossary ≥ 6 entries        |
| 8 | Hugo integration       | YAML link uses `web_app/index.html` (no trailing-slash bug); all assets HTTP 200                  |
| 9 | Visual design          | Dark palette tokens only; no off-palette hex colors; consistent typography                        |
|10 | Mobile responsiveness  | 375×667 viewport: tab strip works; sliders reachable; charts use viewBox                          |

---

## Scoring + verdict

Each dimension scored 1–10 per
[`references/scoring-and-criteria.md`](references/scoring-and-criteria.md):

- **10** — exemplary; no issues.
- **8–9** — minor stylistic gripes only.
- **6–7** — at least one MED issue.
- **4–5** — at least one HIGH issue but app still usable.
- **1–3** — broken; ship-blocker.

**Overall verdict** (matches the rest of the review-* family):

- **ACCEPT** — no HIGH issues; every dimension ≥ 7; no STUB widgets
  in user-facing tabs.
- **MINOR REVISION** — at most one HIGH; dimensions ≥ 5; STUB widgets
  acceptable with MED flag.
- **MAJOR REVISION** — multiple HIGH issues, any dimension ≤ 4, smoke
  test fails, YAML link broken, or post key-takeaways absent from
  Tab-1 lede.

---

## Phase 0 — Pre-flight

### 0.1 Parse arguments

Extract from `$ARGUMENTS`:

- **Slug** — first positional token. Mandatory. Accept either a slug
  (`r_double_lasso`) or a full path (`content/post/r_double_lasso/`).
- **`focus:`** — comma- or `and`-separated keywords from the focus
  table above. Apply
  [`references/focus-modes.md`](references/focus-modes.md) to resolve
  the active dimension set.
- **`--no-browser`** — boolean flag.

### 0.2 Verify inputs

- `content/post/<slug>/index.md` must exist.
- `content/post/<slug>/web_app/` must exist.
- The 7 expected app files are present (`index.html`, `styles.css`,
  `dgp.js`, `lasso.js`, `charts.js`, `app.js`,
  `data/results.json`).

If any of these is missing, log under Dimension 1 and continue —
do not abort. The report will still be useful.

If `web_app/` is missing entirely, abort with a message suggesting
`/project:write-app <slug>` first.

### 0.3 Probe tooling

- `node --version` (mandatory for the JS smoke test).
- If `--no-browser` is NOT set: `npx playwright --version`. If
  Playwright is absent, run `npx playwright install chromium`
  (logs "First-run bootstrap; downloading Chromium (~200 MB)…").
  On install failure (offline, disk full), surface clearly and
  proceed in `--no-browser` mode for this run.
- Locate Hugo binary at
  `$HOME/Library/Application Support/Hugo/0.84.2/hugo` or fall back
  to `hugo` on `$PATH`.

### 0.4 Read reference materials

Read these into memory so Phase 2+ can call them:

- [`references/review-checklist.md`](references/review-checklist.md)
- [`references/scoring-and-criteria.md`](references/scoring-and-criteria.md)
- [`references/pedagogical-alignment.md`](references/pedagogical-alignment.md)
- [`references/headless-browser.md`](references/headless-browser.md)
- [`references/report-template.md`](references/report-template.md)
- Cross-skill: read
  [`.claude/skills/write-app/references/widget-catalog.md`](../write-app/references/widget-catalog.md)
  so the audit knows which widgets are STUB vs READY.
- Cross-skill: read
  [`.claude/skills/write-app/references/render-and-fix.md`](../write-app/references/render-and-fix.md)
  so issues can suggest catalogued fixes.

---

## Phase 0.5 — Announce scope (no confirmation)

Print and proceed:

```
SCOPE
=====
Post slug:          <slug>
Web app folder:     content/post/<slug>/web_app/
Dimensions to run:  <list — all 10 or focus subset>
Browser pass:       enabled | SKIPPED (--no-browser)
Tooling:            node <v>, playwright <v|missing|installing>
Report path:        content/post/<slug>/web_app/REVIEW.md

Proceeding with audit (read-only)…
```

Per review-* convention, the skill does **not** wait for user `y`.

---

## Phase 1 — Inspect (gather facts; no checks yet)

Read everything once into in-memory state:

### 1.1 Post artefacts

- `content/post/<slug>/index.md` — extract title, language, tags,
  learning objectives (bulleted block under "Learning objectives"),
  conclusion / takeaways (final § with that heading), spoiler-figure
  caption (first `!\[...\](...)` after §1).
- Any `results_table*.csv`, `selection_diagnostic.csv`, or similarly
  named CSVs in the post folder — capture column schemas and a few
  representative numeric values for Dimension 4 ground-truth checks.

### 1.2 App artefacts

- `index.html` — parse with a tolerant HTML parser (or string regex if
  no parser available). Extract:
  - Every `<section class="tab-pane">` with its `id`, `<h2>`, and
    nested `<input type="range">` controls.
  - For each input: `id`, `min`, `max`, `step`, `aria-label`.
  - Every `<details class="gloss">` for glossary counts.
  - All `<script src=...>` and `<link rel="stylesheet">` declarations
    in source order.
- `app.js`, `charts.js`, `dgp.js`, `lasso.js`, `styles.css` — read but
  do **not** execute (Phase 3 handles execution under Node `vm`).
- `data/results.json` — JSON parse; capture top-level keys and
  per-row schema.

### 1.3 YAML link

Parse `index.md`'s `links:` array. Locate the `Web app` entry. Record
its `url` field exactly. (Phase 4's static-HTTP step will verify it
matches what Hugo serves.)

---

## Phase 2 — Static checks

Run dimension checks that need only files in memory. The full check
list per dimension is in
[`references/review-checklist.md`](references/review-checklist.md).
Each check emits a result row:

```
{ dimension: <N>, severity: HIGH|MED|LOW, location: <path:line|N/A>,
  issue: <one-sentence>, fix: <one-sentence> }
```

Static dimensions covered here: 1, 2, 4, 5, 7, 9 (partially).

---

## Phase 3 — JS smoke test

Skip if `--no-browser` AND no other reason to run Node (we still want
the smoke test even without a browser, so this phase runs by default).
Skip only if Node is missing (logged as a Dim-3 HIGH issue).

Run:

```bash
BASE=content/post/<slug>/web_app node \
  .claude/skills/write-app/references/templates/smoke-test.js
```

Capture stdout. Each `[✓]` line passes; each `[✗]` line is a Dim-3
HIGH-severity issue. Performance line populates Dim-6.

---

## Phase 4 — Hugo HTTP + Playwright pass

### 4.1 Hugo

Start the local Hugo binary on the first free port ≥ 1316:

```bash
"$HUGO" server --disableFastRender --port <port> --bind 127.0.0.1
```

Wait ~3 s for startup, then assert HTTP 200 for:

- `/post/<slug>/web_app/`
- `/post/<slug>/web_app/{styles.css,dgp.js,lasso.js,charts.js,app.js}`
- `/post/<slug>/web_app/data/results.json`
- `/post/<slug>/` (the post itself still renders)

Then fetch `/post/<slug>/` and scrape for the `Web app` `<a>` tag.
Confirm its `href` is exactly `/post/<slug>/web_app/index.html` (no
trailing-slash bug). Failures populate Dim-8.

### 4.2 Playwright

Skip if `--no-browser`. Otherwise run the script in
[`references/headless-browser.md`](references/headless-browser.md):

- Launch headless Chromium with desktop viewport (1280×800).
- Visit `http://localhost:<port>/post/<slug>/web_app/`.
- For each tab button (expect 4): click, wait for `.tab-pane.active`,
  capture console errors during the interaction. Move one
  `<input type="range">` per tab if any exist; confirm no uncaught
  exceptions. Screenshot to a tempdir.
- Switch to mobile viewport (375×667). Visit again. Confirm the tab
  strip is reachable (no horizontal overflow on a non-scrollable
  parent). Move one slider per tab. Screenshot Tab 2.

Cleanup:
- Kill Chromium.
- Kill the Hugo process.
- Delete temp screenshots UNLESS a HIGH-severity visual or mobile
  issue was detected, in which case copy the relevant screenshots to
  `content/post/<slug>/web_app/REVIEW_<tabid>.png` and reference them
  from the report.

Console errors populate Dim-3. Visual layout issues populate Dim-9.
Mobile issues populate Dim-10.

---

## Phase 5 — Compose report

### 5.1 Render `web_app/REVIEW.md`

Use the canonical template at
[`references/report-template.md`](references/report-template.md). Fill
in:

- Slug, audit date (`YYYY-MM-DD`), focus list, browser-pass status.
- Verdict (computed from issues + scores per
  `scoring-and-criteria.md`).
- Dimension score table (1–10 each).
- Issues table (HIGH first, then MED, then LOW).
- Positive highlights (3–5 specific things the app does well).
- Priority action items (≤ 5, each starts with `**[HIGH]**` /
  `**[MED]**` / `**[LOW]**`).
- Screenshot references (only if HIGH-severity visual/mobile issue
  was detected).
- "How to re-review" snippet.

Write to `content/post/<slug>/web_app/REVIEW.md`. This is the only
file the skill writes (besides the optional screenshots).

### 5.2 Print summary + follow-ups

```
REVIEW SUMMARY
==============
Slug:               <slug>
Verdict:            <ACCEPT | MINOR REVISION | MAJOR REVISION>
Total issues:       <H> HIGH, <M> MED, <L> LOW
Dimension scores:   1:10  2:9  3:10  4:10  5:8  6:10  7:9  8:10  9:9  10:8
Report written to:  content/post/<slug>/web_app/REVIEW.md

NEXT STEPS (copy + paste)
=========================
1. View the report:
   open content/post/<slug>/web_app/REVIEW.md

2. Re-review after fixes:
   /project:review-app <slug>
   # or focus on a single dimension:
   /project:review-app <slug> focus: <dim>
```

Skill never auto-opens, auto-commits, or auto-runs the follow-up.

---

## Pedagogical alignment (Dimension 7 deep-dive)

The post↔app cross-read is the most subtle dimension. The algorithm
lives in
[`references/pedagogical-alignment.md`](references/pedagogical-alignment.md);
summary:

1. Extract post takeaways from `index.md`'s learning-objectives
   bullets + final conclusion section.
2. Extract app messaging from the Tab-1 `<p class="lede">`, each
   tab's `<h2>` heading, and all `<div class="pedagogy">` bullets.
3. Build bag-of-key-phrases for both (3+ word n-grams, stopwords
   removed). Compute fraction-of-takeaways-covered.
4. Score floor for Dim-7 derives from the coverage fraction (≥ 2/3
   ⇒ floor 8; 1/3 ⇒ MED + floor 6; 0/3 ⇒ HIGH + verdict can't be
   ACCEPT).

---

## Cross-skill dependencies (no duplication)

This skill **reuses** rather than duplicates these write-app
references:

| Used for                                | File reused from write-app                                                                                                          |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| Phase 3 JS smoke test                   | [`templates/smoke-test.js`](../write-app/references/templates/smoke-test.js)                                                        |
| Dim-4 expected schema                   | [`data-handling.md`](../write-app/references/data-handling.md)                                                                      |
| Dim-7 STUB-vs-READY classification      | [`widget-catalog.md`](../write-app/references/widget-catalog.md)                                                                    |
| Issues table → catalogued fix suggestions| [`render-and-fix.md`](../write-app/references/render-and-fix.md)                                                                   |
| Dim-9 palette tokens                    | [`theme-tokens.css`](../write-app/references/theme-tokens.css)                                                                      |
| Dim-2 expected tab pattern              | [`templates/index.html.tmpl`](../write-app/references/templates/index.html.tmpl)                                                    |

If any cross-skill reference is missing, log under the corresponding
dimension and continue — never crash.

---

## References

| File                                                             | Used in                |
|------------------------------------------------------------------|------------------------|
| [`review-checklist.md`](references/review-checklist.md)          | Phase 2, 3, 4          |
| [`scoring-and-criteria.md`](references/scoring-and-criteria.md)  | Phase 5                |
| [`report-template.md`](references/report-template.md)            | Phase 5                |
| [`pedagogical-alignment.md`](references/pedagogical-alignment.md)| Phase 2 (Dim 7)        |
| [`headless-browser.md`](references/headless-browser.md)          | Phase 4.2              |
| [`focus-modes.md`](references/focus-modes.md)                    | Phase 0.1              |
| [`test-cases.md`](references/test-cases.md)                      | Skill self-validation  |

---

## Acceptance tests (for the skill itself)

Re-run these whenever this SKILL.md or any reference file changes.

1. **Reference app — no changes.** Run
   `/project:review-app r_double_lasso`. Expect verdict **ACCEPT**;
   every dimension ≥ 8; no HIGH issues;
   `content/post/r_double_lasso/web_app/REVIEW.md` written.

2. **Sabotage tests** (run each, observe, then revert):
   - Delete `dgp.js` ⇒ Dim 1 ≤ 3; verdict MAJOR REVISION.
   - Change YAML link's `url` to `web_app/` (trailing slash) ⇒ Dim 8
     HIGH; verdict MAJOR REVISION; fix suggestion cites
     `render-and-fix.md` entry "Hugo trailing-slash URL rewrite".
   - Remove `aria-label` from every slider ⇒ Dim 5 HIGH.
   - Replace the Tab-1 lede with Lorem Ipsum ⇒ Dim 7 score ≤ 4;
     pedagogical-alignment coverage 0/3 ⇒ HIGH.
   - Insert `console.error("oops")` at app.js start ⇒ Dim 3 HIGH
     (browser detects).
   - Bloat the LASSO inner loop until smoke-test runs > 300 ms ⇒ Dim
     6 MED (warn, not fail — math still correct).

3. **`--no-browser` flag.** Phase 4.2 skipped; Dims 9 + 10 report
   `[~] Not audited (Playwright skipped)`. Static HTTP + smoke test
   still run.

4. **Focus mode.** `focus: pedagogy and code` ⇒ only Dims 3, 4, 7 are
   audited; other dimensions show `[~] Not audited (focus subset)`.

5. **Idempotent re-run.** Running twice produces the same REVIEW.md
   (modulo timestamp). No flakiness in scoring.

6. **First-run Playwright bootstrap.** Uninstall Chromium
   (`npx playwright uninstall chromium`), then run the skill. Phase 0
   re-installs and proceeds; Phase 4.2 succeeds.

7. **Missing web_app/.** Run on a slug without an app ⇒ skill exits
   Phase 0 with a clear message suggesting `/project:write-app`
   first. No partial report is written.

A full self-validation log lives in
[`references/test-cases.md`](references/test-cases.md).
