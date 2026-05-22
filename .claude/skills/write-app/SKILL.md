---
name: write-app
description: Generate an interactive, pedagogical web app for an existing post on carlos-mendez.org. The skill reads the post's content, data, and main results, then asks the user questions until 95% confident about scope before generating a static HTML/CSS/JS bundle that ships with the post on GitHub Pages / Netlify. Apps emphasise the post's key takeaways through 3–4 tabs of D3-driven sliders, simulators, and forest plots. Dark-themed; no backend; no build step.
argument-hint: "<post slug> [--no-link] [--no-verify]"
disable-model-invocation: true
user-invocable: true
---

# Write Interactive Web App: pedagogical companion for a published post

Produce an **interactive web app** that lives alongside an existing post
on carlos-mendez.org. The reader clicks a `Web app` button on the post
page, the app opens in a new tab, and they use sliders, buttons, and
charts to build intuition for the post's central concepts.

The skill's signature behaviour is **the interactive interview**. After
reading the post, the skill uses `AskUserQuestion` to confirm:

- Which 2–3 **key takeaways** the app should foreground,
- Which **tab archetypes** (from a fixed library of 10) the app should
  use,
- Which **data source** the app should bind to (precomputed CSVs from
  the post, the post's `data/` folder, or a simulated DGP),
- The **performance caps** for live JS computations.

Only after explicit user confirmation does the skill write any file.

The deliverable is the same shape as
[`content/post/r_double_lasso/web_app/`](../../content/post/r_double_lasso/web_app/) —
the first post to ship an interactive companion, which serves as the
reference implementation and the canonical test case for this skill.

---

## What this skill does NOT do

- **Does not modify post prose, equations, or sections.** `index.md` is
  the authoritative source of narrative content. The skill only edits
  `index.md` to inject one YAML `Web app` link entry (skippable with
  `--no-link`).
- **Does not run the post's R / Python / Stata pipeline.** If the
  post's `results_table*.csv` is stale, re-run
  `/project:write-results-report <slug>` first.
- **Does not screenshot or visually QA the app.** Verification is JS
  smoke-test + HTTP-200 only. No headless browser.
- **Does not commit, push, or open a PR.** Phase 5 prints
  copy-pasteable follow-ups; the user runs them.
- **Does not support standalone-topic invocation.** Apps require an
  existing post as the source of truth. To create a post first, use
  `/project:write-post`.
- **Does not generate light-mode themes.** The app uses the site's
  dark palette uniformly so it looks coherent embedded next to the
  post's dark figures.
- **Does not ship server-side components.** No Streamlit, no Plotly
  Dash, no Shiny. Pure static HTML/CSS/JS so the app lives on GitHub
  with the rest of the site.

---

## Example invocations

```
# Standard run: probe the post, ask the user 3–5 interview questions,
# write 7 files into web_app/, run Hugo + JS smoke-test verification,
# update index.md's links: with a Web app entry.
/project:write-app r_double_lasso
/project:write-app python_doubleml

# Skip the YAML link injection. The web_app/ folder is still written
# and verified, but index.md is left untouched. Useful when previewing
# before committing.
/project:write-app stata_dynamic_panel --no-link

# Skip verification (Hugo dev server + JS smoke test). Phases 1–3 and
# Phase 5 still run; the app is written but unverified. Use when
# Hugo or node is unavailable.
/project:write-app r_did --no-verify
```

---

## Deliverables

Every successful run produces:

| Path | Purpose |
|---|---|
| `content/post/<slug>/web_app/index.html` | 4-tab single-page app shell |
| `content/post/<slug>/web_app/styles.css` | Dark-theme styling (verbatim template) |
| `content/post/<slug>/web_app/dgp.js` | Seeded RNG + Box–Muller + standardise (verbatim template) |
| `content/post/<slug>/web_app/lasso.js` | Coordinate-descent LASSO + CV + rlasso + Cholesky OLS (verbatim template) |
| `content/post/<slug>/web_app/charts.js` | D3 chart-builder library, extended with widget-specific functions |
| `content/post/<slug>/web_app/app.js` | Tab routing + slider glue (assembled from `app.js.tmpl` + widget fragments) |
| `content/post/<slug>/web_app/data/results.json` | Post's actual numbers, parsed from results CSVs (empty stub if Pattern B/C) |

Plus the `index.md` update injecting the `Web app` YAML link, unless
`--no-link` is given.

The app is reachable at `/post/<slug>/web_app/index.html` once Hugo
builds.

---

## Site color palette (dark theme)

The app uses these tokens exclusively (sourced from
[`references/theme-tokens.css`](references/theme-tokens.css)):

| Token | Hex | Use |
|------|-----|-----|
| `--bg` | `#0f1729` | Page background |
| `--panel` | `#1f2b5e` | Card / panel backgrounds |
| `--steel` | `#6a9bcc` | Primary chart accent |
| `--orange` | `#d97757` | Treatment / highlight / CV penalty |
| `--teal` | `#00d4c8` | Rigorous penalty / "kept" / selected |
| `--text` | `#e8ecf2` | Body text |
| `--muted` | `#8b9dc3` | Secondary text |

---

## Phase 1: Pre-flight (read-only)

### 1.1 Parse arguments

Parse `$ARGUMENTS` into:

- **Slug** — the first positional token (e.g. `python_doubleml`).
  Mandatory.
- **`--no-link`** — skip the `index.md` YAML injection in Phase 3.7.
  Default: link is auto-added.
- **`--no-verify`** — skip Phase 4 (Hugo + JS smoke test). Default:
  verification is mandatory.

Reject any other argument or flag with a clear error.

### 1.2 Locate the post

The post directory is `content/post/<slug>/`. Hard-fail if it doesn't
exist with a clear message suggesting `/project:write-post` first.

### 1.3 Detect existing app

If `content/post/<slug>/web_app/` already exists, ask the user whether
to (a) overwrite (default), (b) cancel, or (c) generate into a
suffixed folder like `web_app_v2/`. Do not silently clobber.

### 1.4 Read the post

Read `content/post/<slug>/index.md` in full. Extract:

- **Title** (from front matter `title:`).
- **Language**: inferred from front-matter `categories:` plus presence
  of `analysis.R / script.py / *.do` in the post folder.
- **Tags + categories** (front-matter arrays).
- **Image theme** (`image.placement:` and `theme:` if present;
  defaults to dark).
- **Learning objectives**: the bulleted block under a "Learning
  objectives" heading, if it exists. (Common in causal-inference and
  ML posts.)
- **Key concepts at a glance**: glossary block with definition +
  example + analogy cards, if it exists.
- **Conclusion / takeaways**: the §-titled "Conclusion",
  "Takeaways", or final-section content.

### 1.5 Detect the data pattern

Use [`references/data-handling.md`](references/data-handling.md). The
three patterns:

- **Pattern A — Precomputed results CSV(s):** `results_table*.csv`,
  `*_diagnostic.csv`, or other tabular results sitting alongside
  `index.md`. Read the first ~5 KB of each to learn the schema (column
  names, row count).
- **Pattern B — Raw `data/` folder only:** a `data/` subfolder exists
  with raw CSVs but no precomputed result tables.
- **Pattern C — Landing page:** no local data; the post links to
  external Google Colab / RStudio Cloud / Streamlit URLs.

Record the detected pattern for the Phase 2 confirmation.

### 1.6 Classify the topic

Apply [`references/topic-detection.md`](references/topic-detection.md)
heuristics to classify the post into one of: `causal-inference`,
`ml`, `spatial`, `panel`, `bayesian`, `time-series`, or `mixed`.
Heuristics use slug prefix (`r_`, `python_`, `stata_`, `gee_`),
front-matter `tags`, and section-heading keywords.

### 1.7 Propose default tab structure

Cross-reference the topic family against
[`references/widget-catalog.md`](references/widget-catalog.md). The
catalog maps each topic family to a default subset of 3–4 archetypes.
For example:

- `causal-inference` → Concept animation + Forest plot + DGP simulator
  (+ optional Penalty slider if LASSO/shrinkage is involved).
- `ml` → Concept animation + Penalty slider + Feature importance +
  Train/test split.
- `spatial` → Concept animation + Moran's I scatter + Sensitivity
  heatmap.
- `panel` → Concept animation + DiD event-study + Forest plot.

The proposed tab list is a **starting point**, not a commitment — the
Phase-2 interview lets the user swap, drop, or add tabs.

### 1.8 Read the four "ready" widget fragments

The widget fragments in
[`references/templates/widgets/`](references/templates/widgets/) are
divided into:

- **Ready widgets** (fully implemented, validated against
  `r_double_lasso`): `concept-animation.js`, `penalty-slider.js`,
  `forest-plot.js`, `dgp-simulator.js`.
- **Stub widgets** (catalog entry + JS skeleton; not yet validated):
  the other 6.

If Phase 2 selects a stub widget, surface a warning that the widget
will render a placeholder block with a clear "to be implemented" note
and link back to the catalog entry. Phase-2 question wording should
make this trade-off visible.

---

## Phase 2: Interactive interview (MANDATORY)

The Phase-2 interview is the skill's signature feature. It uses
`AskUserQuestion` to clarify until 95% confident before writing any
file. Read
[`references/interview-questions.md`](references/interview-questions.md)
for canonical question templates; adapt wording to the specific post.

### 2.1 First-pass scope block

Print a short SCOPE block (no questions yet) summarising what
Phase 1 found:

```
SCOPE (PRELIMINARY — to be confirmed in interview)
==================================================
Post slug:        <slug>
Title:            <title>
Language:         <R | Python | Stata | mixed>
Data pattern:     <A: precomputed CSV | B: raw data only | C: landing page>
Topic family:     <causal-inference | ml | spatial | panel | bayesian | time-series | mixed>

Proposed tabs (you can change in the interview):
  1. <archetype 1>
  2. <archetype 2>
  3. <archetype 3>
  4. <archetype 4>   [optional, depending on data pattern]

Inferred key takeaways (you'll confirm next):
  - <takeaway 1>
  - <takeaway 2>
  - <takeaway 3>

Existing web_app/: <none | present — will overwrite | present — abort>
Flags:            --no-link=<true/false>  --no-verify=<true/false>
```

### 2.2 Interview questions (adaptive)

Ask `AskUserQuestion` rounds covering at minimum the four mandatory
topics below. The skill MUST keep asking until it can name every tab,
every chart, every data source, and every key takeaway without
guessing.

1. **Key takeaways.** Propose the 2–3 takeaways extracted from the
   post's overview/conclusion. Ask the user to confirm, drop, or add.
   These become the Tab-1 lede.
2. **Tab structure.** Present the proposed 3–4 archetypes
   (multiSelect=true). Let the user uncheck or swap.
3. **Data approach.** Confirm the detected pattern (A/B/C). For
   Pattern A, ask which specific CSV file should drive Tab N's
   forest-plot data. For Pattern C, ask whether the simulated DGP
   should mimic the post's setting or use a generic toy model.
4. **Performance caps.** Confirm slider caps so live JS stays under
   ~300 ms (default: `n ≤ 500`, `p ≤ 100`).

Conditional rounds (only when relevant):

5. **Widget-specific knobs:**
   - DiD event-study → pre/post window length.
   - Feature importance → number of top features to show.
   - Forest plot → which estimator rows to include.
   - DGP simulator → which parameter the slider controls.
6. **Stub-widget acknowledgement:** if the user picked a stub widget,
   confirm they accept the placeholder block.

### 2.3 Final confirmation

Print a final SCOPE block with all decisions resolved, then prompt:

```
Proceed to write the app? (y / explain change / cancel)
```

Wait for explicit `y`. On change requests, revise and re-print.

---

## Phase 3: Generate the app

### 3.1 Create folders

```
content/post/<slug>/web_app/
content/post/<slug>/web_app/data/
```

### 3.2 Copy verbatim templates

Copy these unchanged from `references/templates/`:

- `styles.css`
- `dgp.js`
- `lasso.js`
- `theme-tokens.css` (appended into `styles.css`'s `:root` block or
  imported via `@import`).

### 3.3 Compose `charts.js`

Start from `references/templates/charts.js` (the base chart-builder
library: l1_vs_l2_animation, coefficient_path, forest_plot,
selection_bars, alpha_compare, alpha_histograms). Append any extra
chart builders required by the chosen widget archetypes. (Today the
base covers all 4 "ready" widgets out of the box.)

### 3.4 Render `index.html` from template

Use `references/templates/index.html.tmpl` and substitute:

- `{{TITLE}}` ← post title.
- `{{LEDE}}` ← Tab-1 lede built from the confirmed key takeaways.
- `{{TAB_LABELS}}` ← chosen archetype names.
- `{{TAB_PANES}}` ← markup for each tab. For ready widgets, pull from
  the archetype's `html_pane` block in the catalog. For stub widgets,
  insert a placeholder `<div class="card stub">…</div>`.
- `{{GLOSSARY}}` ← 6–10 collapsible glossary cards built from the
  post's "Key concepts at a glance" section, or generated from the
  topic family if the post doesn't have that section.
- `{{POST_PATH}}` ← `../` (relative link back to the post page).

### 3.5 Compose `app.js`

Start from `references/templates/app.js.tmpl`. The template has named
mount points (`{{WIDGET_INIT}}`, `{{WIDGET_HANDLERS}}`). Each chosen
widget contributes one fragment from
`references/templates/widgets/<name>.js`. Insert in the order of the
tab list. Add the `tabs` array constant so `activateTab` knows which
tab IDs to switch between.

### 3.6 Bake `data/results.json`

- **Pattern A:** parse the user-confirmed CSV file(s) (or directories
  of them). The schema for forest-plot widgets is documented in
  [`references/templates/data/results.json.tmpl`](references/templates/data/results.json.tmpl).
  Round to 4 decimal places. Compute `ci_lo`/`ci_hi` from
  `estimate ± 1.96 * se` if not in the CSV.
- **Pattern B + C:** write a stub `results.json` of `{"estimates":
  [], "selection": []}`. The chosen widgets must be limited to those
  that run on the simulated DGP only.

### 3.7 Inject the YAML `Web app` link into `index.md`

Skip if `--no-link`. Otherwise, find the post's `links:` array and
insert this entry as the **first** entry of the array:

```yaml
- icon: laptop-code
  icon_pack: fas
  name: "Web app"
  url: web_app/index.html
```

**Idempotency:** if a `Web app` entry already exists (any prior
version), rewrite its `url` and `icon` in place rather than
duplicating. **Important Hugo quirk** (discovered with `r_double_lasso`):
use `web_app/index.html` not `web_app/`. A trailing-slash URL is
rewritten by the Wowchemy theme to an absolute `/web_app/` path that
breaks the link. The catalog entry in
[`references/render-and-fix.md`](references/render-and-fix.md)
documents the failure mode.

---

## Phase 4: Verification

Skip if `--no-verify` was given.

Run the checklist in
[`references/verification-checklist.md`](references/verification-checklist.md).

### 4.1 Static asset check

Start a Hugo dev server on a free port (≥ 1316; check before binding).
Hit each app resource and assert HTTP 200:

- `/post/<slug>/web_app/`
- `/post/<slug>/web_app/styles.css`
- `/post/<slug>/web_app/dgp.js`
- `/post/<slug>/web_app/lasso.js`
- `/post/<slug>/web_app/charts.js`
- `/post/<slug>/web_app/app.js`
- `/post/<slug>/web_app/data/results.json`

### 4.2 YAML link check

Unless `--no-link`. Hit `/post/<slug>/` and confirm the rendered HTML
contains an `<a>` whose `href` is exactly
`/post/<slug>/web_app/index.html` (catches the trailing-slash bug).

### 4.3 JS smoke test

Run `references/templates/smoke-test.js` under Node with
`vm.runInThisContext` to load `dgp.js + lasso.js` into a mock `window`
and assert:

- `LASSO.qnorm(0.975)` ≈ 1.96.
- `LASSO.qnorm(0.99975)` ≈ 3.4807.
- At `λ > λ_max`, `lasso_one` produces all-zero coefficients.
- At `λ ≈ 0`, `lasso_one` recovers OLS (every coefficient nonzero).
- `lasso_path(n=500, p=100)` completes in < 300 ms.

If any assertion fails, surface as `[✗]` and report.

### 4.4 Kill Hugo

Always stop the dev server before reporting. Use the PID captured at
start-up.

---

## Phase 5: Verification report + follow-ups

Print a structured `[✓]/[✗]/[~]` block:

```
VERIFICATION REPORT
===================
[✓] web_app/ created at content/post/<slug>/web_app/
[✓] 7 files written (index.html, styles.css, dgp.js, lasso.js, charts.js, app.js, data/results.json)
[✓] All assets return HTTP 200 from Hugo dev server
[✓] index.md "Web app" link points to /post/<slug>/web_app/index.html
[✓] JS smoke test: 5/5 assertions passed
[~] Stub widget(s) used: <list> — placeholder rendered, see catalog for implementation status
```

Offer 2–3 copy-pasteable follow-ups (the skill never auto-runs them):

```
NEXT STEPS (copy + paste)
=========================
1. Preview locally:
   "$HOME/Library/Application Support/Hugo/0.84.2/hugo" server --disableFastRender
   open http://localhost:1313/post/<slug>/web_app/

2. Review the post against the app:
   /project:review-post <slug>

3. Commit + push:
   git add content/post/<slug>/web_app/ content/post/<slug>/index.md
   git commit -m "<slug>: add interactive web app for the post

   Co-Authored-By: Claude Code <noreply@anthropic.com>"
   git push origin master
```

---

## Widget catalog

The 10 archetypes (4 ready, 6 stubs) and their data + JS contracts:
see [`references/widget-catalog.md`](references/widget-catalog.md).

## Interview question templates

Canonical `AskUserQuestion` blocks for Phase 2: see
[`references/interview-questions.md`](references/interview-questions.md).

## Topic-detection heuristics

Slug-prefix + tag + keyword rules mapping posts to topic families: see
[`references/topic-detection.md`](references/topic-detection.md).

## Data-pattern handling

Detection rules + JSON baking patterns for Patterns A / B / C: see
[`references/data-handling.md`](references/data-handling.md).

## Pedagogy conventions

Caption style, "what to look for" panels, glossary patterns,
accessibility, performance caps: see
[`references/pedagogy-conventions.md`](references/pedagogy-conventions.md).

## Verification checklist

Phase-4 go/no-go items + report template: see
[`references/verification-checklist.md`](references/verification-checklist.md).

## Failure modes catalog

Common errors + fixes (Hugo trailing-slash URL bug, missing CSV
headers, near-singular `X'X`, CDN failures, etc.): see
[`references/render-and-fix.md`](references/render-and-fix.md).

## Canonical test cases

The 3 posts used to validate the skill: see
[`references/test-cases.md`](references/test-cases.md).

---

## Acceptance tests (for the skill itself)

Run after editing this `SKILL.md` to confirm the contract still works.

1. **Reproduce `r_double_lasso`.** Move existing
   `content/post/r_double_lasso/web_app/` aside to `web_app.bak/`.
   Invoke `/project:write-app r_double_lasso`. Walk through the
   interview answering as Carlos did in the original session.
   Expect: templates byte-identical for `styles.css / dgp.js / lasso.js`;
   `data/results.json` numerically identical; `index.html` and `app.js`
   structurally equivalent. All Phase-4 assertions pass.

2. **Fresh causal-inference post.** Invoke on `python_doubleml`.
   Expect Phase 1 to detect language=Python, pattern=B (no
   `results_table*.csv`), topic=causal-inference. Phase 2 should
   propose Concept animation + Forest plot (with Pattern-B warning
   that no real numbers will populate it) + DGP simulator. After the
   interview confirms a Pattern-B fallback, Phase 3 writes the app
   with `results.json: {"estimates": []}` and the forest-plot tab
   shows a "real data unavailable — use simulator tab" notice.

3. **Pattern-C landing page.** Invoke on `r_convergence_clubs`.
   Phase 1 detects no `analysis.R` or `script.py` in the post root,
   no `data/` folder, but external Colab/RStudio URLs in `links:`.
   Phase 2 surfaces this and offers a simulated DGP that mimics the
   topic (convergence clubs). After confirmation, the app ships with
   only DGP-driven tabs (no forest plot).

4. **`--no-link` flag.** Invoke with `--no-link`. The skill writes
   the `web_app/` folder and runs Phase 4, but `index.md` must be
   bit-identical to before the run.

5. **`--no-verify` flag.** Invoke with `--no-verify`. Phases 1–3
   write the app; Phase 4 is skipped; Phase 5 reports
   `[~] Phase 4 skipped (--no-verify)`.

6. **Idempotent re-run.** Run the skill twice on the same slug. The
   second run must detect existing `web_app/` and ask before
   overwriting. On `y`, produce identical output (deterministic
   templates).

7. **Hugo URL quirk.** After Phase 3.7, fetch `/post/<slug>/` from
   the Hugo dev server. The rendered HTML must contain
   `href="/post/<slug>/web_app/index.html"` exactly — never
   `/web_app/` and never a 404 link.

8. **JS smoke-test failure surfaces correctly.** Manually corrupt
   `dgp.js` (e.g., change Mulberry32 constants). Re-run Phase 4. The
   smoke test should report `[✗]` and the report should name the
   failed assertion.
