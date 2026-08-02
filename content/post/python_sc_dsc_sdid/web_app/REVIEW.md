# Review: python_sc_dsc_sdid Web App

**Audited:** content/post/python_sc_dsc_sdid/web_app/
**Date:** 2026-08-02
**Audit version:** review-app v1.0
**Focus:** all 10 dimensions
**Browser pass:** enabled (Chrome, desktop 1280×920 + headless 500 px + 360 px container test)

---

## Verdict: ACCEPT

**Overall assessment.** No HIGH issues; every dimension scores 7 or above. The strongest
dimensions are accessibility (10) and mobile responsiveness (10) — every slider carries both
an `aria-label` and a `<label for>`, all fifteen SVGs carry `role="img"` plus a description,
every palette pair clears WCAG AA at 5.17:1 or better, and at a 360 px container fourteen of
fifteen chart wrappers scroll inside themselves while the page never does. The weakest are
the data contract (7) and pedagogy (7), for the same underlying reason: `results.json`
carries 3.3 KB no panel reads, and one of the unread keys is the time weights the post's
third learning objective explicitly promises. Fixing issue 2 — either drawing `lambda` or
dropping it — would take both to 9.

---

## Dimension scores

| # | Dimension              | Score / 10 | Issues  | Notes                                                                 |
|---|------------------------|-----------:|--------:|-----------------------------------------------------------------------|
| 1 | File completeness      | 10         | 0       | 5 files, 156 KB; the two "missing" files are lasso-app artefacts (below) |
| 2 | HTML structure         | 10         | 0       | Scrolling panels, not a tab strip, by design; script order correct     |
| 3 | JS correctness         | 8          | 2 LOW   | Smoke test N/A (below); hand-audited; 0 console errors over 20 controls |
| 4 | Data contract          | 7          | 1 MED   | 1332 values verified against the CSVs; 3.3 KB of the payload unread    |
| 5 | Accessibility          | 10         | 0       | All contrast ≥ 5.17:1; every control labelled; all SVGs described      |
| 6 | Performance            | 9          | 1 LOW   | 26–44 ms per interaction, 3 ms slider tick, 2.18 s load                |
| 7 | Pedagogy               | 7          | 1 MED   | Takeaway alignment 4/6 full, 2 partial (well above the 2/3 floor)      |
| 8 | Hugo integration       | 9          | 1 LOW   | All assets 200; `href` exact; one unrelated concurrent front-matter edit |
| 9 | Visual design          | 8          | 2 LOW   | Site palette throughout; three colours outside write-app's token file  |
|10 | Mobile responsiveness  | 10         | 0       | No page overflow at 360 px or 500 px; splits stack; table scrolls      |

---

## Issues found

| #  | Dim | Severity | Location | Issue | Suggested fix |
|---:|----:|----------|----------|-------|---------------|
| 1  | 7   | MED  | `index.html:17`, `index.html:148` | The app and the post count a **different three defaults**. The hero says "three of the library's default settings each move the answer around as much as the choice of estimator does" and panel 6 says "Three of the four capsules are wider than the band" — both true of `set_f` (0.47pp), `w_constr` (0.40pp) and covariates (2.29pp) against a 0.32pp ladder spread. The post (§1, §21, §22) names `zeta`, `set_f` and the covariate method. `zeta` spans 0.13pp at the package default and does **not** clear the band; panel 6 draws it in steel for exactly that reason, but no text says so. | Name the three in panel 6's intro and add one clause: "`zeta` is the exception — it moves the estimate 0.13pp, less than the ladder's own 0.32pp." (The post's own sentence is the root error; see the note below the table.) |
| 2  | 4   | MED  | `data/results.json` | Four top-level keys are shipped and never read: `variants` (501 B), `lambda` (1,337 B), `tssc` (623 B), `masc_cv` (854 B), plus `meta.slug` and `meta.ladder_spread`. `tssc` duplicates values already in `anatomy.rounding`; `ladder_spread` duplicates a figure `app.js` recomputes from `D.results`. `lambda` is the one that matters — the post's learning objective 3 lists "the time weights" among the five things a reader should be able to extract, and it is the only one of the five with no panel. | Either add a time-weights panel (the data are already there and `Charts.hbars` would not fit — it needs a stem plot) or delete the four keys from `analysis.py`'s section 17 payload so the file carries nothing dead. |
| 3  | 3   | LOW  | `app.js:520` | The `zeta-slider` `input` listener is attached at module evaluation, before `fetch("data/results.json")` resolves. `renderDial()` dereferences `D.zeta_sweep`, so dragging the slider during the load window throws `TypeError: Cannot read properties of null`. The window is ~600 ms locally and longer on a cold CDN with a 68 KB payload. | Add `if (!D) return;` as the first line of the listener body. |
| 4  | 3   | LOW  | `charts.js:640`, `charts.js:72` | `METHOD_COLOUR` is exported on `global.Charts` but `app.js` never reads it (it is used internally by `ladder()`). `catAxis(g, y, ih)` declares `ih` and never uses it. | Drop `METHOD_COLOUR` from the export list and the third parameter from `catAxis`. |
| 5  | 9   | LOW  | `app.js:513` | Panel 12's note reads "…and stops at 3.06%. Stata's `sdid` inherits that solver and stops in the same place" — after naming 3.06%, "the same place" reads as Stata also returning 3.06% for synthetic control. The post's Stata figure is the SDID drift from 2.79% to 2.80%. | Rephrase to "inherits that solver and stops early in the same way; tighten its convergence and its SDID estimate drifts from 2.79% to 2.80%." |
| 6  | 9   | LOW  | `charts.js:430` | The `zeta = 0 — the paper` marker line is drawn at x = 0, which coincides with the y-axis, so the dashed rule is invisible. Only its label is visible. | Offset the label or draw the axis-coincident marker as a thicker tick below the axis. |
| 7  | 6   | LOW  | `app.js` (`render`) | Every control click re-renders all fifteen charts, so switching the placebo horizon redraws the 24-series spaghetti in panel 9. Measured 26–44 ms, well inside budget, but the work is wasted. | Split `render()` into per-panel functions, as `renderDial()` already is, and have each button group call only its own. |
| 8  | 9   | LOW  | `styles.css:11`, `:9`, `:15` | `#16203a` (`--panel`), `#c8d0e0` (`--dim`) and `#e8b04b` (`--gold`) are not among the eight colours in `write-app/references/theme-tokens.css`. All three are site palette values in use elsewhere (`--gold` is `GOLD` in `analysis.py`; `--dim` is the dark-figure label colour in `CLAUDE.md`), and the R companion makes the same three substitutions. | No change to the app. Add the three to `theme-tokens.css` so the token file matches what both companions actually use. |
| 9  | 8   | LOW  | `content/post/python_sc_dsc_sdid/index.md:17-20` | The front matter carries an unrelated uncommitted change from a concurrent session (a `Slides (HTML)` entry for a Quarto deck under `slides/`). The two edits do not conflict, but a `git diff` on `index.md` is not attributable to the app alone. | Stage the `Web app` link change separately from the slides entry. |

**Root of issue 1 is in the post, not the app.** `index.md` §1 ("three separate defaults, each of
which moves the headline estimate by more than the spread across the entire six-rung ladder"),
§21 and §22 all assert that all three clear the ladder, then give `zeta` as 0.13pp against a
0.31pp spread. The individual figures are correct; the summarising sentence is not. The app is
the more accurate of the two documents. Correcting the post is outside this skill's scope.

---

## Pedagogical alignment (Dim 7 deep-dive)

**Post takeaways extracted** (from §1.1 Learning objectives):

1. Install `mlsynth` and read its one-config-dict, one-result-object interface, including the
   Pydantic validation that turns a typo into an exception.
2. Map each rung onto a specific class and configuration field, and explain why `mlsynth.DSC`
   is not the DSC on this ladder.
3. Extract the ATT, the donor weights, the time weights, the counterfactual path and the event
   study from a fitted result.
4. Identify the three defaults — `zeta`, `set_f` and the covariate method — that change the
   answer materially, and set each one deliberately.
5. Compare estimators on a common in-sample placebo tournament and read the ranking with
   scepticism.
6. Choose among the wider catalogue when the design is not the canonical one-treated-unit case.

**App messaging extracted:**

- Hero lede: "`mlsynth` puts the whole ladder of single-treated-unit estimators behind one
  interface. That makes it easy to fit six of them on the Brexit referendum, and it makes
  something else easy to miss: three of the library's default settings each move the answer
  around as much as the choice of estimator does."
- Panel headings: 1 The counterfactual · 2 Who is in the blend? · 3 The ladder, side by side ·
  4 Anatomy of a fit · 5 A name that means two things · 6 The defaults dial ·
  7 Three meanings of "control for" · 8 The fire drill · 9 Placebo in space ·
  10 The event study · 11 The inference menu · 12 The solver's fingerprint

**Coverage:**

- Takeaway 1: ~ partial — panel 4 lays out the config and result contracts field by field with
  live values, but Pydantic validation and the four exception types (post §4.2) are absent.
- Takeaway 2: ✓ covered — every rung's exact call is in panel 1's blurb and panel 3's tooltip,
  and panel 5 is devoted to the `mlsynth.DSC` clash.
- Takeaway 3: ~ partial — ATT (panel 1), donor weights (panel 2), counterfactual (panel 1) and
  event study (panel 10) are all drawn; **time weights are not** (issue 2).
- Takeaway 4: ✓ covered, and more accurately than the post — panels 6 and 7.
- Takeaway 5: ✓ covered — panel 8's three-horizon toggle plus panel 9's permutation floor.
- Takeaway 6: ✗ absent — the post's §20 catalogue of ~60 further estimators has no counterpart.
  Judged non-interactive material rather than a gap; not raised as an issue.

**Coverage score:** 4/6 full, 2/6 partial. Well above the 2/3 floor that `pedagogical-alignment.md`
requires for ACCEPT.

**Glossary check:** the app has no `<details class="gloss">` glossary. Panels 4 and 5 carry the
definitional load instead: panel 4 defines seven config fields and eight result accessors inline,
panel 5 disambiguates `DSC`, `SCD`, `DRSC`, `DSCAR` and `MEDSC`. The post's "Key concepts at a
glance" (§2) has eight concepts; six are addressed somewhere in the app (donor pool, simplex,
unit vs time weights, the config/result contract, the solver fingerprint, the DSC clash), two are
not (extrapolation vs interpolation bias, the intercept). Not raised as an issue — the concepts
belong to the post's derivations, which are the R edition's job.

---

## Widget catalog audit

The catalog's ten archetypes describe a 4-tab lasso-style app. This app uses none of them; it is
a twelve-panel scrolling companion matching `r_sc_dsc_sdid/web_app/`. Mapping by intent:

| Panel | Nearest archetype        | Status | Notes                                                        |
|-------|--------------------------|--------|--------------------------------------------------------------|
| 1–3   | forest-plot / custom     | READY  | Shared chart builders with the R companion                   |
| 4–5   | (none — static)          | READY  | Code-explorer and hazard cards; no D3, no stub               |
| 6     | penalty-slider           | READY  | 15-point precomputed sweep, not a live solver                |
| 7     | forest-plot              | READY  | Dual encoding: estimate and pre-treatment RMSE               |
| 8–9   | (none — custom)          | READY  | Placebo tournament and permutation distribution              |
| 10    | did-event-study          | READY  | Real `SDIDResults.event_study` output                        |
| 11    | forest-plot              | READY  | Real intervals from five inference methods                   |
| 12    | (none — custom)          | READY  | Zoomed dot plot across implementations                       |

**No STUB widgets.** Every panel renders real, verified data.

---

## Dimensions 1 and 3 — recorded N/A in part, deliberately

The checklist requires seven files and hard-codes a smoke test beginning:

```js
load("dgp.js");
load("lasso.js");
```

Those belong to the **lasso reference app**, which runs a data-generating process and solves a
lasso in the browser. This app has no simulation layer by design: every number it draws was
computed by `analysis.py` and shipped in `data/results.json`. There is nothing for `dgp.js` to
generate and nothing for `lasso.js` to solve. Running the smoke test verbatim confirms this — it
aborts on its first `load()` with `ENOENT: dgp.js`, exactly as it does against
`r_sc_dsc_sdid/web_app/`, whose own review recorded the same finding.

No stub files were created to satisfy the checker. Shipping dead JavaScript to make a template
pass would be a real defect introduced to hide a fake one.

**Dimension 3 was audited by hand instead:** both modules open with `"use strict"` inside an
IIFE, the only global written is `window.Charts`, there is no `console.log`/`warn`/`error`, no
`{{` template leakage in any of the four files, `fetch` has an explicit `!r.ok` branch and a
`.catch` that builds its error node with `createElement`/`textContent`, and every one of the 20
control pills plus the slider was exercised in the browser with no uncaught exception. Two LOW
issues were found this way (3 and 4).

**Dimension 4's smoke test was replaced by a data-contract check:** `1332` values across all 22
top-level keys were compared against the committed CSVs at 8 significant figures with no
mismatch, and the file contains no `NaN`, `Infinity` or `undefined`.

---

## Positive highlights

- **Nothing is estimated in the browser, and the pipeline enforces it.** `analysis.py`'s guarded
  section 17 writes `data/results.json` directly and refuses to run when the script's own
  assertion block failed, so the app cannot publish numbers from a broken run. All 1332 values
  trace to a committed CSV.
- **Panel 6 is more honest than the post it accompanies.** The ladder's spread is drawn as a
  shaded band and each option's range as a capsule, coloured orange only when it genuinely
  clears the band. `zeta` renders in steel because it does not — a distinction the post's prose
  loses (issue 1).
- **Panel 12 refuses to flatter itself.** The finding is a 0.02-point gap between solvers, and
  `Charts.hbars`'s `zoom: true` mode drops the zero baseline so the gap is visible, with the
  axis caption saying plainly that it does not start at zero (`charts.js:293–302`).
- **Panel 7 pairs every estimate with its fit error.** The two covariate routes that land nearest
  the published 2.4% are the two with the worst pre-treatment RMSE, and the second chart makes
  that impossible to miss rather than leaving it in a caption.
- **Panel 4 shows a real fit, not an illustration.** Every accessor value — `res.att -0.030388`,
  `res.pre_rmse 0.005589`, `method_name "VanillaSC[outcome-only]"` — is read from the same fit
  panel 1 draws, so the two cannot drift apart.

---

## Priority action items

1. **[MED]** Reconcile the "three defaults" count. Name `set_f`, `w_constr` and covariates in
   panel 6's intro (`index.html:148`) and add one clause stating that `zeta` moves the estimate
   0.13pp and stays inside the ladder's 0.32pp band. Separately, correct `index.md` §1, §21 and
   §22, where the same claim originates.
2. **[MED]** Resolve the dead payload. Either add a time-weights panel — `lambda` is already in
   `results.json` and the post's learning objective 3 names it — or drop `variants`, `lambda`,
   `tssc`, `masc_cv`, `meta.slug` and `meta.ladder_spread` from `analysis.py` section 17.
3. **[LOW]** Guard the slider: `if (!D) return;` as the first line of the `input` listener at
   `app.js:520`.
4. **[LOW]** Fix panel 12's Stata sentence at `app.js:513` so "the same place" is not read as
   3.06%.
5. **[LOW]** Add `#16203a`, `#c8d0e0` and `#e8b04b` to
   `write-app/references/theme-tokens.css`, which both this app and the R companion already use.

---

## Screenshots (HIGH-severity visual issues only)

None found. No HIGH-severity visual or mobile issue was detected, so no screenshots are retained.

---

## How to re-review

After applying the fixes, re-run:

    /project:review-app python_sc_dsc_sdid

To focus on the dimension you just fixed:

    /project:review-app python_sc_dsc_sdid focus: data
    /project:review-app python_sc_dsc_sdid focus: pedagogy

The generic write-app smoke test will not run against this app. Use the data-contract check
instead: parse `data/results.json` and compare every array against its source CSV in the post
folder at 8 significant figures.

---

## Audit metadata

- Hugo port used: 1320 (binary `$HOME/Library/Application Support/Hugo/0.111.3/hugo`)
- Node version: v25.9.0
- Playwright: not used — the browser pass ran against the live Chrome session plus a headless
  Chromium screenshot at 500 px and a deterministic 360 px container measurement
- Tooling notes: headless Chrome clamps its layout viewport to a 500 px floor, so the narrow
  layout was additionally verified by constraining `main` to 360 px and measuring, which
  reproduces the same condition without the capture artefact. The R companion's review logged
  the 500 px floor as a reproducible false positive for horizontal overflow.
- Files written by this review: `web_app/REVIEW.md` only.

---

*Generated by `/project:review-app`. Skill at `.claude/skills/review-app/`. Verification rubric
at `references/scoring-and-criteria.md`.*
