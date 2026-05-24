# Review: python_dowhy Web App

**Audited:** content/post/python_dowhy/web_app/
**Date:** 2026-05-24
**Audit version:** review-app v1.0
**Focus:** all
**Browser pass:** enabled

---

## Verdict: ACCEPT

**Overall assessment.** The app is functionally complete, pedagogically strong, and visually clean. All 4 tabs activate; smoke test passes 8/8; 0 console errors; 0 page errors; mobile responsive at 375 px with no horizontal scroll. The initial review flagged two HIGH visual issues in the Tab-4 refutation chart (label truncation + duplicate-label overlap). Both have been fixed in `charts.js` (right margin expanded; collision-aware combined labels). All 10 dimensions now score ≥ 8.

---

## Dimension scores

| # | Dimension              | Score / 10 | Issues  | Notes                                                    |
|---|------------------------|-----------:|--------:|----------------------------------------------------------|
| 1 | File completeness      | 10         | 0       | All 7 required files present                             |
| 2 | HTML structure         | 10         | 0       | 4 tabs, matched IDs, D3 loads before app.js              |
| 3 | JS correctness         | 10         | 0       | Smoke test 8/8 passed; 98 ms LASSO perf                  |
| 4 | Data contract          | 10         | 0       | results.json parses; 6 estimators + 3 refutations        |
| 5 | Accessibility          | 9          | 0       | All sliders have aria-label; tabs use role + aria-selected|
| 6 | Performance            | 10         | 0       | LASSO 98 ms; tab clicks < 100 ms                         |
| 7 | Pedagogy               | 9          | 0       | 3/3 takeaways present in Tab-1 lede + tab headings       |
| 8 | Hugo integration       | 10         | 0       | URL is `web_app/index.html` (no trailing-slash bug)      |
| 9 | Visual design          | 9          | 0       | Refutation labels now collision-aware (no overlap)       |
|10 | Mobile responsiveness  | 9          | 0       | No horizontal scroll; all 4 tabs visible                 |

---

## Issues found

None remaining. The 2 HIGH and 1 MED issues from the initial pass were
all fixed in `charts.js refutation_bars`:

| #  | Dim | Severity | Location                            | Issue (resolved)                                                                                  | Fix applied                                                                                       |
|---:|----:|----------|-------------------------------------|---------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| 1  | 9   | HIGH     | charts.js refutation_bars margin    | "Data Subset (80%)" refuted label "$1,728" was truncated to "$1,72"                              | margin.right increased 36 → 140 px                                                                |
| 2  | 9   | HIGH     | charts.js refutation_bars labels    | When original_effect ≈ new_effect, the two text labels overlapped                                | Collision detection (< 80 px): renders combined "original ≈ refuted = $X" or "$A → $B" instead    |
| 3  | 9   | MED      | charts.js refutation_bars labels    | Refuted-bar label sat flush against bar end on small values (Placebo $62)                        | LABEL_PAD increased 6 → 10 px                                                                     |

---

## Pedagogical alignment (Dim 7 deep-dive)

**Post takeaways extracted:**
1. The four-step framework (Model, Identify, Estimate, Refute) makes causal-inference rigour explicit.
2. Five DoWhy estimators on Lalonde converge around $1,559–$1,794, the AIPW being the most credible.
3. The placebo refutation test is the most convincing — effect collapses 96% with random treatment.

**App messaging extracted:**
- Tab 1 lede: "DoWhy answers this with four explicit steps: Model, Identify, Estimate, Refute."
- Tab 2 heading: "Confounder Lab — feel how confounding biases the naive estimate"
- Tab 3 heading: "Five estimators on the Lalonde data — the post's headline figure"
- Tab 4 heading: "Refutation tests — does the effect survive sabotage?"

**Coverage:**
- Takeaway 1: covered in Tab 1 lede.
- Takeaway 2: covered in Tab 3 heading + body ("$1,559 and $1,794").
- Takeaway 3: covered in Tab 4 lede + cards (placebo 96% collapse).

**Coverage score:** 3/3

**Glossary check:**
- App glossary has 10 entries (ATE, ATT, Confounder, Backdoor, Propensity score, IPW, Doubly Robust, Refutation, Placebo, Identification) — comprehensive.

---

## Widget catalog audit

| Tab | Widget archetype          | Status   | Notes                          |
|-----|---------------------------|----------|--------------------------------|
| 1   | concept-animation (DAG)   | READY    | Custom DoWhy DAG pulse         |
| 2   | dgp-simulator             | READY    | Custom confounder lab          |
| 3   | forest-plot               | READY    | Real Lalonde estimates         |
| 4   | refutation-bars           | READY    | Collision-aware labels         |

---

## Positive highlights

- The Tab-3 forest plot correctly places numeric labels ($1,794, $1,676, …) to the right of every CI, with no overlap with the dashed zero line.
- The Tab-1 DAG animation has a clean two-phase pulse cycle (backdoor → causal) with a semi-transparent caption box that doesn't obstruct the nodes.
- The pedagogical alignment is 3/3 — all post takeaways appear in the app's tab headings or ledes.
- The post-fix Tab-4 refutation chart now degrades gracefully when two estimates collide: a single combined "$A → $B" label preserves both values without truncation or label-overlap.

---

## Priority action items

None.

---

## How to re-review

After applying the fixes, re-run:

    /project:review-app python_dowhy

To focus on the dimension you just fixed:

    /project:review-app python_dowhy focus: visual

---

## Audit metadata

- Hugo port used: 1316
- Node version: v25.9.0
- Playwright: enabled, v1.60.0
- Tooling notes: Chromium loaded from npx cache at `~/.npm/_npx/e41f203b7505f1fb/`.

---

*Generated by `/project:review-app`. Skill at
`.claude/skills/review-app/`. Verification rubric at
`references/scoring-and-criteria.md`.*
