# Web App Review — `stata_sdid`

**Audited:** 2026-06-07 · **Scope:** all 10 dimensions · **Browser pass:** enabled (headless Chromium 1208 via Playwright 1.60.0, desktop 1280×800 + mobile 375×667)

## Verdict: **ACCEPT**

A polished, fully-functional, pedagogically-aligned companion app. All four tabs render and interact with **zero console errors**; the mobile viewport has **no horizontal overflow**; data, accessibility, and visual design are clean. One LOW rounding inconsistency was found and **fixed** during the audit.

> **Architecture note (not a defect).** This app is a *data-driven Pattern-A* app: it loads the six CSVs the Stata script exported (`data/*.csv`) at runtime with `d3.csv`. It deliberately does **not** ship the LASSO reference app's `dgp.js` / `lasso.js` / `data/results.json` / `smoke-test.js` (those are specific to the `r_double_lasso` simulator). The corresponding template-specific checks in the checklist are therefore marked **N/A by architecture**, not failed.

## Dimension scores

| # | Dimension | Score | Notes |
|---|-----------|:----:|-------|
| 1 | File completeness | 9/10 | `index.html`, `styles.css`, `charts.js`, `app.js`, `data/` (6 CSVs); 92 KB total; no stray files. `dgp.js`/`lasso.js`/`results.json` N/A (CSV-driven). |
| 2 | HTML structure | 10/10 | 4 `tab-pane` + 4 `role="tab"` buttons, `data-pane`↔`id` matched, `aria-controls/selected`, viewport meta, `d3 → charts.js → app.js` order, no `{{` leakage. |
| 3 | JS correctness | 9/10 | `node --check` clean; `window.CHARTS` exported; **0 console errors / 0 uncaught exceptions** across all tabs + method toggles in headless Chromium. LASSO smoke-test N/A. |
| 4 | Data contract | 10/10 | 6 CSVs parse; schemas correct; values match the post exactly (Explorer −27.3/−19.5/−15.6, gap-2000 −26.6, placebo p 0.026); `NaN` guarded; leading-dot decimals parse. |
| 5 | Accessibility | 9/10 | `role=tablist/tab/tabpanel`, `aria-selected`, `aria-pressed` on method buttons, `aria-label`s on CTA cards with Enter/Space handlers; high contrast (`#e8ecf2` on `#0f1729`). No range sliders (segmented controls), so slider-aria N/A. |
| 6 | Performance | 10/10 | All numbers precomputed; no `setInterval`, no in-browser heavy compute; fast paint. |
| 7 | Pedagogy | 10/10 | Tab-1 lede foregrounds the counterfactual + three-method thesis; "What to look for" blocks on Tabs 2–4; 10-entry glossary covering every post key-concept; no STUB widgets; descriptive tab labels. Strong n-gram alignment with the post's takeaways. |
| 8 | Hugo integration | 10/10 | `links:` `Web app` `url: web_app/index.html` (no trailing-slash bug); Hugo 0.111.3 build serves app + all assets HTTP 200; post renders 200. |
| 9 | Visual design | 9/10 | Dark palette only (`#0f1729/#1f2b5e/#182447` navy, `#e8ecf2/#c8d0e0/#8b9dc3` text, `#6a9bcc` steel, `#d97757` orange, `#00d4c8` teal, `#141413` ink); consistent encoding (orange = California, teal = SDID, steel = synthetic); footer present. |
| 10 | Mobile responsiveness | 9/10 | 375×667: no horizontal overflow (`scrollW == innerW == 375`); tab strip reachable; charts render via `viewBox` + `preserveAspectRatio`; no page errors. |

## Issues

| Severity | Dim | Issue | Status |
|----------|-----|-------|--------|
| LOW | 4/9 | Explorer's live DiD readout rounded `-27.35` → `−27.4` (JS `toFixed(1)`), inconsistent with the `−27.3` shown on the headline cards, the post, and the infographic. | **FIXED** — `app.js` constant changed to `-27.349` (→ `−27.3`); the post's §10 range line aligned to `−27.3`. |
| INFO | 1/3/4 | App omits `dgp.js`/`lasso.js`/`results.json`/`smoke-test.js`. | Not a defect — by-design data-driven (CSV) architecture. |

## Positive highlights

- **Pedagogical alignment is exemplary.** The "one regression, three weighting schemes" card and the `−27.3 / −19.5 / −15.6` headline mirror the post's central thesis precisely; the Placebo tab's "two tests, two verdicts" card faithfully teaches the SE-vs-permutation tension (p = 0.026 vs CI [−35.0, 3.8]).
- **Robust runtime.** Zero console errors and zero uncaught exceptions across every tab and method toggle in a real headless browser; graceful data-load error handling with a file://-vs-HTTP hint.
- **Honest data contract.** The app reads the very CSVs `analysis.do` exported, so its numbers cannot drift from the Stata results; the SDID inference row is even re-read from `atts.csv` at load.
- **Mobile-clean and on-palette.** No horizontal overflow at 375 px; all hex values are site/dark-theme tokens.

## How to re-review

```
# Re-run the full audit after any change
/project:review-app stata_sdid
# or a focused pass
/project:review-app stata_sdid focus: pedagogy
```

*Read-only audit. The two LOW fixes above were applied because the parent task requested fixing review findings.*
