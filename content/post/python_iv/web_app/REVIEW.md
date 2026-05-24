# Review: python_iv Web App

**Audited:** content/post/python_iv/web_app/
**Date:** 2026-05-24
**Audit version:** review-app v1.0
**Focus:** all (10 dimensions)
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** All 10 dimensions ≥ 8. Smoke test 8/8 with
lasso_path at 104 ms. No console errors, no page errors, 4 tabs
activate cleanly, no horizontal mobile scroll. All 14 forest-plot
estimates match the post tables to three decimals. Two HIGH and one
MED chart-overlap issues were detected on the initial pass and have
been fixed in this revision: Tab 1's DAG forbidden arrow now arcs
ABOVE the node band (no longer crosses the X circle), and Tab 2's
"true β / OLS β̂ / IV β̂" legend has been moved OUTSIDE the plot area
into a row below the x-axis label, so it no longer overlaps the
regression lines under weak π or large γ.

---

## Dimension scores

| # | Dimension              | Score / 10 | Issues | Notes                                                    |
|---|------------------------|-----------:|-------:|----------------------------------------------------------|
| 1 | File completeness      | 10         | 0      | All 7 expected files present; bundle 124 KB              |
| 2 | HTML structure         | 10         | 0      | 4 tabs, 4 panes; script order correct; viewport meta set |
| 3 | JS correctness         | 10         | 0      | Smoke test 8/8; no console errors; perf 104 ms           |
| 4 | Data contract          | 10         | 0      | 14 estimates, schema valid; OLS-base = 0.522, IV-main = 0.944 match post |
| 5 | Accessibility          | 9          | 0      | Every slider has aria-label; tablist semantic            |
| 6 | Performance            | 10         | 0      | lasso_path 104 ms; sliders snappy                        |
| 7 | Pedagogy               | 10         | 0      | Tab 1 lede covers all 3 takeaways; 9 glossary entries    |
| 8 | Hugo integration       | 10         | 0      | YAML link uses `web_app/index.html`; all assets HTTP 200 |
| 9 | Visual design          | 9          | 0      | Legend overlap fixed; DAG arcs forbidden arrow above nodes |
|10 | Mobile responsiveness  | 9          | 0      | viewBox scales; no horizontal scroll; tab strip wraps    |

---

## Issues found

| #  | Dim | Severity | Location                | Issue                                                                                  | Status                                                                                                |
|---:|----:|----------|-------------------------|----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| 1  | 9   | HIGH     | charts.js (Tab 2)       | "true β / OLS β̂ / IV β̂" labels at x=w-6 INSIDE plot overlapped regression lines when IV slope went near-vertical (weak π / large γ). | **FIXED** — legend moved into a row OUTSIDE the plot at y=h+56, with line swatches + labels; SVG height grew from 360 to 400. |
| 2  | 9   | HIGH     | charts.js (Tab 1)       | "exclusion restriction: this arrow MUST NOT exist" text at y=178 plus the straight dashed-red line at y=184 crossed visually through the X-node circle (y=172-228). | **FIXED** — the forbidden Z→Y arrow is now a quadratic-Bézier ARC with apex at y=130 (well above the X-node top edge); label sits at y=122 outside any circle. |
| 3  | 9   | MED      | charts.js (Tab 1)       | "first stage (relevance ✓)" / "causal effect β" labels at y=190 sat in the node-circle vertical band, with descenders touching the horizontal arrows at y=200. | **FIXED** — labels moved to y=X.y+18 (=218), below the arrows and below the node circles.            |
| 4  | 9   | MED      | charts.js (Tab 3)       | Histogram "true β = 0.94" label at y=12 inside plot could overlap y-axis "0" tick.    | **FIXED** — label moved to y=-6 (in the top margin), text-anchor middle, centred on the vertical line. |

All four originally detected issues have been resolved. The
post-fix screenshot pass shows: (a) DAG arc cleanly above all
circles; (b) Tab 2 legend cleanly below the x-axis label even at
extreme slider settings (π = 0.05, γ = 1.5).

---

## Pedagogical alignment (Dim 7 deep-dive)

**Post takeaways extracted:**
1. IV recovers a 81% larger causal effect than OLS (0.944 vs 0.522), implying measurement error dominates the OLS bias.
2. First-stage F = 16.85 is borderline-strong; weak-IV specs (Tab 7 health channels) live in F < 5 territory.
3. The 0.944 is a LATE for compliers, not a population ATE; exclusion restriction is untestable in principle.

**App messaging extracted:**
- Tab 1 lede: "On the AJR 64-country sample, IV gives β̂ = 0.944 — 81% larger than the OLS slope of 0.522. The Wu-Hausman test rejects OLS at p < 0.0001. The first-stage F is 16.85 — borderline-strong..."
- Tab 2 heading: "Instrument strength — when IV works and when it breaks"
- Tab 3 heading: "OLS vs IV — bias and variance over many simulations"
- Tab 4 heading: "The post's headline estimates — 14 specifications interactively"

**Coverage:**
- Takeaway 1: ✓ covered verbatim in Tab 1 lede.
- Takeaway 2: ✓ covered in Tab 1 lede ("borderline-strong") and Tab 4 "What to look for".
- Takeaway 3: ✓ covered in the glossary entry "LATE vs ATE".

**Coverage score:** 3/3

**Glossary check:**
- Post lists 7 key concepts ("Key concepts at a glance"). App glossary covers 9 entries — all 7 post concepts plus "Exclusion restriction" and "Wu-Hausman".

---

## Widget catalog audit

| Tab | Widget archetype          | Status   | Notes                          |
|-----|---------------------------|----------|--------------------------------|
| 1   | iv-dag-animation (custom) | READY    | DAG with traveling particle + curved forbidden-arrow arc |
| 2   | dgp-simulator (live)      | READY    | OLS vs IV scatter w/ sliders; out-of-plot legend |
| 3   | dgp-simulator (MC)        | READY    | 100-sim histogram              |
| 4   | forest-plot               | READY    | 14 specs from results.json     |

---

## Positive highlights

- **All 14 forest-plot estimates match the post tables to 3 decimals** (results.json: IV-main 0.944, OLS-base 0.522, IV+malaria 0.687, IV+life-exp 0.629, IV:euro1900 0.870), demonstrating real data-contract integrity.
- **Tab 2 IV slope formula uses the closed-form cov(Y,Z)/cov(X,Z) ratio** (app.js:104), which exactly mirrors the post's pedagogical equation β_IV = β_RF / β_FS — same identity in code and prose.
- **Tab 3 uses an animation-frame-paced incremental loop** (app.js:269-289) so the 100-sim run never blocks the main thread, with live progress feedback.
- **Glossary covers exclusion restriction, Wu-Hausman, Hansen J, LATE/ATE** — every untestable / advanced term in the post body has a glossary card.
- **Smoke test 8/8 with lasso_path at 104 ms** — well under the 300 ms perf budget despite the IV app not using lasso machinery.

---

## Priority action items

None. All previously detected HIGH and MED visual-overlap issues
have been fixed in this revision.

---

## How to re-review

After applying the fixes, re-run:

    /project:review-app python_iv

To focus on the dimension you just fixed:

    /project:review-app python_iv focus: visual

---

## Audit metadata

- Hugo port used: 1326
- Node version: v25.9.0
- Playwright: enabled (1.60.0)
- Tooling notes: Browser pass succeeded twice (pre-fix and post-fix); full-page screenshots captured under /tmp/python_iv_screens/ confirm legend / DAG overlap eliminated at default and extreme slider settings.

---

*Generated by `/project:review-app`. Skill at
`.claude/skills/review-app/`. Verification rubric at
`references/scoring-and-criteria.md`.*
