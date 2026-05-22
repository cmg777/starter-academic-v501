# Review Checklist — 10 dimensions

Each dimension's checks are listed here with severity tags
(HIGH / MED / LOW) and the phase in which the check runs.

Severity definitions (full rubric in `scoring-and-criteria.md`):

- **HIGH** — ship-blocker. App misleads users, fails to load, or
  produces wrong outputs.
- **MED** — reduces clarity, pedagogy, or quality but app is still
  usable.
- **LOW** — style preference or future improvement.

---

## Dimension 1 — File completeness

**Phase:** 0.2 + Phase 2 (static).

| Check | Severity if failed |
|-------|--------------------|
| `index.html` exists | HIGH |
| `styles.css` exists | HIGH |
| `dgp.js` exists | HIGH |
| `lasso.js` exists | HIGH |
| `charts.js` exists | HIGH |
| `app.js` exists | HIGH |
| `data/results.json` exists | HIGH |
| No template-leakage filenames in folder (`*.tmpl`, `*-leftover*`) | MED |
| Bundle total size under 500 KB (excluding screenshots) | LOW |
| No `node_modules/`, no `.DS_Store`, no `*.bak` | LOW |

Floor for Dim 1: if any HIGH fails, max score = 3.

---

## Dimension 2 — HTML structure

**Phase:** Phase 2 (static).

| Check | Severity |
|-------|----------|
| Exactly 4 `<section class="tab-pane">` elements | HIGH |
| Exactly 4 `<button>` elements inside `nav.tab-strip` | HIGH |
| Each tab button's `data-pane` matches a section `id` | HIGH |
| Each tab pane has a `role="tabpanel"` and `aria-labelledby` | MED |
| Each tab button has `role="tab"` and an `aria-selected` attribute | MED |
| Heading hierarchy: one `<h1>` (header), `<h2>` per tab, `<h3>` for sub-cards | LOW |
| `<script src="https://d3js.org/d3.v7.min.js">` appears before `app.js` in source order | HIGH |
| `<script src="app.js">` appears AFTER `dgp.js`, `lasso.js`, `charts.js` | HIGH |
| Document has `<meta name="viewport" content="width=device-width, ...">` | MED |
| No literal `{{` substring remains in the rendered HTML | HIGH |

---

## Dimension 3 — JS correctness

**Phase:** Phase 2 (static) + Phase 3 (Node smoke test) + Phase 4.2
(browser console).

| Check | Severity |
|-------|----------|
| Node smoke test exits 0 | HIGH |
| All 7 smoke-test assertions pass (qnorm precision, λ_max bound, OLS recovery, perf, schema) | HIGH (per failed) |
| No literal `{{` substring in `app.js`, `charts.js` | HIGH |
| No `console.error` / `console.warn` during a tab cycle in headless browser | MED |
| No uncaught exceptions during a slider drag in headless browser | HIGH |
| `window.DGP`, `window.LASSO`, `window.CHARTS` are exported (smoke-test loads them) | HIGH |
| Each chart-builder function in `charts.js` returns an object with `update(...)` | MED (sample check on 1) |

---

## Dimension 4 — Data contract

**Phase:** Phase 2 (static) + cross-check vs CSVs in post folder.

| Check | Severity |
|-------|----------|
| `data/results.json` parses as valid JSON | HIGH |
| Top-level keys: `estimates` (array) + `selection` (array) OR documented empty stub | HIGH |
| Each `estimates` row has `method`, `outcome`, `estimate`, `se` (the minimum schema) | HIGH |
| Each `estimates` row has `ci_lo` + `ci_hi` (or both null) | MED |
| If Pattern A: at least one estimate value within 0.01 of a value found in the post's results_table*.csv | HIGH |
| All numeric values rounded to ≤ 4 decimal places | LOW |
| If `selection` is non-empty: each row has `n_Iy`, `n_Id`, `n_intersection`, `n_union` | MED |
| No `NaN`, `Infinity`, or unescaped Unicode surrogates | HIGH |

---

## Dimension 5 — Accessibility

**Phase:** Phase 2 (static) + Phase 4.2 (browser contrast).

| Check | Severity |
|-------|----------|
| Every `<input type="range">` has a non-empty `aria-label` | HIGH |
| Every `<button>` has a non-empty visible text label (no icon-only) | MED |
| All `<details class="gloss">` summaries are non-empty | LOW |
| Tab buttons cycle via keyboard (Tab/Enter) — smoke check by emulating Tab key in Playwright | MED |
| Body text contrast (`--text` on `--bg`) ≥ 4.5:1 — verified by reading hex values from CSS, no live measurement | HIGH |
| All `<img>` and `<svg>` chart titles or `aria-labels` for screen readers | LOW |
| Touch targets (buttons, sliders) ≥ 44×44 px on mobile viewport | MED |

---

## Dimension 6 — Performance

**Phase:** Phase 3 (Node smoke test) + Phase 4.2 (browser).

| Check | Severity |
|-------|----------|
| `lasso_path(n=500, p=100)` < 300 ms in Node smoke test | MED (HIGH if > 1000 ms) |
| Initial page paint < 3 s in headless browser (`page.waitForLoadState("load")` timing) | MED |
| A single slider drag does not block the main thread for > 300 ms (measured via `performance.now()` injected into a page script) | MED |
| No `setInterval` polling at > 30 Hz (grep for `setInterval` in `app.js` + `charts.js`) | LOW |
| `cv_lasso` is only invoked on demand (not at page load) | MED |

---

## Dimension 7 — Pedagogy

**Phase:** Phase 2 (static) + cross-read with the post.

See [`pedagogical-alignment.md`](pedagogical-alignment.md) for the
n-gram overlap algorithm. Additional structural checks here:

| Check | Severity |
|-------|----------|
| Tab 1 has a `<p class="lede">` of ≥ 80 characters | MED |
| Tab 1 lede covers ≥ 2 of the post's top 3 takeaways (n-gram alignment) | HIGH if 0/3 |
| Each interactive widget tab has a `<div class="pedagogy">` block | MED |
| Each pedagogy block has ≥ 2 `<li>` bullets | LOW |
| Glossary has ≥ 6 `<details class="gloss">` entries | MED |
| Glossary covers every term from the post's "Key concepts at a glance" section (if it exists) | MED |
| No STUB widget in user-facing tabs (cross-check vs widget-catalog) | MED (HIGH if all tabs are stubs) |
| Tab labels in the navigation are not generic ("Tab 2", "Untitled") | LOW |

---

## Dimension 8 — Hugo integration

**Phase:** Phase 4.1.

| Check | Severity |
|-------|----------|
| `index.md` has a `Web app` entry under `links:` | MED |
| The `url:` field is `web_app/index.html` (NOT `web_app/`) | HIGH |
| Rendered `<a>` href on the post page contains `/post/<slug>/web_app/index.html` exactly | HIGH |
| Hugo serves the app folder index at HTTP 200 | HIGH |
| Each of the 6 asset files (`styles.css` ... `app.js` + `data/results.json`) returns HTTP 200 | HIGH (per missing) |
| The post page itself still renders HTTP 200 (no Hugo build break) | HIGH |
| `index.md` front-matter is otherwise unchanged (no spurious diff vs git HEAD) | LOW |

---

## Dimension 9 — Visual design

**Phase:** Phase 2 (static CSS scan) + Phase 4.2 (browser screenshots).

| Check | Severity |
|-------|----------|
| `styles.css` uses CSS custom properties from `theme-tokens.css` (`var(--bg)`, `var(--steel)`, etc.) | MED |
| No off-palette hex colors in `styles.css` (other than the 7 documented tokens + greys/whites) | MED |
| Headless-browser screenshot of Tab 1 (desktop) shows a coherent dark page — no flash-of-unstyled-content blink | LOW |
| Charts use the same color encoding across tabs (orange = treatment, teal = selected, steel = primary) | MED |
| No text overflows its container at desktop viewport | MED |
| Footer is present and visible | LOW |

---

## Dimension 10 — Mobile responsiveness

**Phase:** Phase 4.2 only (mobile viewport).

| Check | Severity |
|-------|----------|
| Tab strip is reachable: either wraps or scrolls horizontally without clipping | HIGH |
| No horizontal page scrollbar on `<html>` (some component is forcing > 100 vw) | HIGH |
| Charts use `viewBox` + `preserveAspectRatio` and scale below 600 px width | MED |
| Sliders are ≥ 44 px tall on touch | MED |
| Glossary `<details>` are fully expandable on mobile | LOW |
| Mobile screenshot of Tab 2 shows the chart at least partially in view | MED |

---

## Default skipped dimensions

If `--no-browser` is set, Dim 9 and Dim 10 print
`[~] Not audited (browser pass skipped)` and contribute neither
positive nor negative to the verdict. Dim 5 keeps its CSS-readable
checks; only "keyboard cycling" and "touch target" sub-checks become
`[~]`.

If a `focus:` mode is set, all non-listed dimensions print `[~] Not
audited (focus subset)`.
