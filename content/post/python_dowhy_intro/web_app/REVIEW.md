# Review — `python_dowhy_intro/web_app/`

**Audit date:** 2026-05-24
**Focus:** all 10 dimensions
**Browser pass:** enabled (headless Chromium via Playwright)

---

## Verdict: **ACCEPT**

The app is functioning correctly, complete, pedagogical, and easy to use across all four tabs (Intro DAG · Methods Showdown · Confounding Simulator · Refutation Lab). After two rounds of fixes the SVG charts no longer contain legend / annotation / value-label overlaps with data marks.

---

## Dimension scores

| # | Dimension              | Score | Notes |
|---|------------------------|------:|-------|
| 1 | File completeness      | 10 | All 7 required files present at `web_app/` (`index.html`, `styles.css`, `dgp.js`, `lasso.js`, `charts.js`, `app.js`, `data/results.json`). No stray files. |
| 2 | HTML structure         | 10 | 4 tab buttons with matching pane IDs. Heading hierarchy correct. `role="tab"` / `role="tabpanel"` / `aria-selected` set. D3 v7 loads before `app.js`. |
| 3 | JS correctness         | 10 | Smoke test 8/8 pass (last run 123 ms). 0 page errors, 0 console errors across all four tabs in headless Chromium. |
| 4 | Data contract          | 10 | `results.json` parses; schema matches `data-handling.md`. Headline numbers (Naive 1.3853 with CI [1.245, 1.526]; LR 1.0051; IPW 1.0275; DR 1.0115; IV 0.8881) agree with `estimation_results.csv`. |
| 5 | Accessibility          |  9 | All 4 sliders have `aria-label`. Tabs use `role="tab"` + `aria-selected`. Dark-mode contrast within tokens. |
| 6 | Performance            | 10 | `lasso_path(n=500, p=100) = 123 ms` (< 300 ms budget). Slider response on Tab 3 = 154 ms in browser. |
| 7 | Pedagogy               | 10 | Tab-1 lede surfaces the headline numbers (+1.39 naive vs +1.00 truth; 39% bias). Each tab has a "What to look for" pedagogy block. Glossary has 10 entries. Tabs 1–4 map cleanly to DoWhy's Model → Identify → Estimate → Refute. |
| 8 | Hugo integration       | 10 | YAML link uses `web_app/index.html` (no trailing-slash bug). All assets HTTP 200 on the local Hugo dev server. |
| 9 | Visual design          | 10 | Dark palette tokens only (`#0f1729`, `#1f2b5e`, `#6a9bcc`, `#d97757`, `#00d4c8`). DAG node tags + outside labels are clean. Forest / confounding / refutation charts have annotations positioned ABOVE the plot area so they never cross row labels or data lines. |
| 10 | Mobile responsiveness | 9 | 375×667: tab strip scrolls horizontally with no page overflow. All four sliders reachable. Charts use `viewBox` + `preserveAspectRatio` and scale down cleanly. |

---

## Issues found and resolved

### HIGH (fixed)

| # | Dim | Location | Issue | Fix |
|---|-----|----------|-------|-----|
| H1 | 9 | `charts.js: confounder_dag_animation` | DAG node labels ("Subway disruption" 160px, "Productivity" 106px, "Num. Children" 123px, "Work from home" 142px) rendered INSIDE 76px-diameter circles, overflowing the circle boundary and in one case overlapping the orange T→Y causal arrow. The "Productivity" label also visually overran the SVG right edge at the rendered width. | Widened SVG (W: 720→820, H: 360→440). Put a single-letter tag (I/C/Z/T/Y) INSIDE each circle and rendered the full name + role-tag OUTSIDE the circle with per-node `labelPos` (above / below / left / right). Shifted Y left and Z down so its `labelPos: "below"` "Subway disruption" label fits cleanly. |
| H2 | 9 | `charts.js: confounding_chart` (Tab 3) | "true ATE = 1.00" annotation rendered at `y = -8` (just above the plot) AND the value labels (e.g. "1.305", "1.096") sat to the right of their markers with no flip logic, so when the marker landed near the right edge or on the true-ATE vertical line the value overlapped the line. The naive bar's value label overlapped the true-ATE annotation. | Increased top margin (24→44) so the annotation lives well above the plot. Added a dashed connector tick from annotation down to the line. Right margin widened (24→70). Value labels now flip to the LEFT of the marker when the marker is within 46 px of the right edge, and gain a semi-transparent `var(--panel)` background rect for readability. |
| H3 | 9 | `charts.js: refutation_chart` (Tab 4) | Three reference-line annotations ("0", "original α̂ = 1.005", "true ATE = 1.00") sat on the same `y = -8` row and crowded each other when the lines were close on the x-axis. Value labels for Random Common Cause (1.0051) and Data Subset (0.9988) sat ON TOP of the original-α̂ vertical line. PASS badges at `x = w + 4` overlapped the value labels of rows whose marker was near the right edge. | Top margin 30→56 to host a two-row staggered annotation strip (row 0: "0" + "true ATE"; row 1: "original α̂"). Each annotation gets a dashed connector tick down to its line. Right margin 30→80 so PASS badges sit at `x = w + 12`, well outside the value-label zone. Value labels flip to the LEFT of the marker when within 40 px of the original-α̂ line, and gain a semi-transparent background rect. |

### MED / LOW

None outstanding.

---

## Positive highlights

1. **Smoke test 8/8 + zero console errors** across all four tabs in headless Chromium (desktop and mobile viewports).
2. **Pedagogical narrative is tight.** Tab-1 lede surfaces the +1.39 vs +1.00 headline (39% bias). All three CTA cards (Methods Showdown / Confounding Simulator / Refutation Lab) preview the matching tab. Each tab has a "What to look for" / "How to read these tests" block.
3. **Confounding simulator is interactive and stable** — sliders for n / β_outcome / β_treatment / IV strength all repaint the bar chart within ~150 ms, including the live first-stage F display for weak-IV pedagogy.
4. **Refutation lab pairs the visual marker chart with three per-test cards** (Placebo / Random Common Cause / Data Subset), each citing the post's actual numbers (-0.00003, 1.0051, 0.9988).
5. **Mobile layout** survives a 375×667 viewport with no horizontal page scroll; charts scale to viewport width via `viewBox`.

---

## How to re-review

```bash
# Static + JS smoke test only:
BASE=content/post/python_dowhy_intro/web_app node \
  .claude/skills/write-app/references/templates/smoke-test.js

# Browser pass: start Hugo, then re-run /project:review-app:
/project:review-app python_dowhy_intro

# Focused re-review (visual + mobile only):
/project:review-app python_dowhy_intro focus: visual
```
