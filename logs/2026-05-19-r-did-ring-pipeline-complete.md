# r_did_ring — Full DiD-with-geocoded-microdata pipeline complete

**Date:** 2026-05-19
**Post slug:** `r_did_ring`
**Topic:** Difference-in-Differences with geocoded microdata — the "ring"
approach (parametric vs nonparametric estimators on Linden & Rockoff's
home-prices data, reproducing Butts 2023 *JUE Insight*)

## Summary

The `r_did_ring` post is the second full pass through the data-science
pipeline since `r_did2`, and the first to ship with **all five artefact
stages on the same day** plus an AI Podcast overlay. The empirical case
study takes Linden & Rockoff's (2008) sex-offender / home-price data —
the same data used by Butts (2023) to motivate the data-driven
nonparametric ring estimator — and threads the methodological argument
*"ring choice is part of the estimand"* through every section. The post
explicitly reconciles a parametric headline drop of **−5.78 %** at the
canonical 0.1-mile cutoff with a nonparametric closest-bin drop of
**−20.6 %** (a factor of ≈ 2.1×), and shows that the data-driven
treatment-effect curve crosses zero at $d \approx 0.094$ mile —
corroborating the eyeballed 0.1-mile cutoff *as an output of the
analysis*, not as an input.

## Deliverables

| # | Skill                              | Artefact                                       | Status                                  |
|---|------------------------------------|------------------------------------------------|-----------------------------------------|
| 1 | `/project:write-script`            | `analysis.R` (1,158 lines)                     | Clean run, 0 errors, 12.3 s wall clock  |
| 2 | `/project:review-script`           | `script-review.md`                             | **ACCEPT** (0 HIGH, 0 MED, 6 LOW)       |
| 3 | `/project:write-results-report`    | `results_report.md` (332 lines)                | 9 findings + 11 interp paragraphs + 7-category Surprises checklist + Butts 2023 reproduction audit |
| 4 | `/project:review-results-report`   | `results_report_review.md`                     | **ACCEPT** (0 HIGH, 0 MED, 0 LOW after fixes); 8/8 numbers spot-checked; dimension-7 all PASS |
| 5 | `/project:write-post`              | `index.md` (~6,500 tokens, 16 sections)        | Comprehensive: 10 figures embedded, 6 Key Concepts toggle-cards, Mermaid roadmap, 3 display equations, 21 interpretation paragraphs, italic captions, 3 Butts (2023) verbatim quotes, exercises |
| 6 | `/project:review-post`             | (inline 12-dimension report)                   | **ACCEPT**; 2 MED + 5 LOW resolved post-review |
| 7 | `/project:write-infographic`       | `infographic_instructions.md` (~3,559 tokens)  | Layered mode, 6 ON-IMAGE messages, Story Spine, balance-scale Panel 4, 3 BIG numbers |
| 8 | `/project:review-infographic`      | (inline 8-dimension report)                    | **ACCEPT** (28/28 numbers); coverage **FULL** after 2 LOW fixes |
| 9 | `/project:write-quarto-notebook`   | `tutorial.qmd` (907 lines, 22 chunks)          | Renders cleanly **first attempt**, no retries; 13 R packages pinned via `pak::pkg_install("pkg@x.y.z")` |
| 10| AI Podcast overlay                 | inlined audio player block in `index.md`       | https://files.catbox.moe/kaq4in.m4a (m4a, stream link) |

## Highlights

- **Three-number argument:** the post deliberately layers three
  headline figures — **−5.78 %** (parametric default), **−20.6 %**
  (nonparametric bin 1, the closest ~300 ft), and **52 %** (relative
  spread of the parametric ATT across the (0.05, 0.10, 0.15) cutoff
  triple) — so a reader walks away with the methodological lesson, not
  just a single number.
- **Cutoff corroboration framing:** the nonparametric estimator's
  step function crosses zero at $d \approx 0.094$ mi, strikingly close
  to Linden & Rockoff's eyeballed 0.1-mile cutoff. The Discussion
  positions the modern data-driven approach as *disciplining* the
  classical setup rather than overturning it.
- **Simulation-first arc:** Sections 5–8 use a known DGP $\tau(d) = 1.5
  \cdot \exp(-2.3 d) \cdot \mathbf{1}\{d \le 0.75\}$ to confirm the
  parametric estimator's unbiasedness under correct specification,
  document its bias under misspecification, and validate that
  `binsreg` recovers the *shape* of the curve. The simulation is the
  conceptual scaffolding that makes the −20.6 % bin-1 estimate on real
  data feel earned rather than implausible.
- **22 executable Quarto chunks, all rendered first attempt.** No
  auto-fix loop entries triggered. Pinned versions span `tidyverse@2.0.0`,
  `fixest@0.14.0`, `binsreg@2.0`, `sf@1.1.1`, `KernSmooth@2.23.26`,
  `lpridge@1.1.1`, `patchwork@1.3.2`, plus six others — all probed
  cleanly on R 4.5.2.
- **Reproduction audit vs Butts (2023):** the results report appendix
  lines our numbers up with the paper's. Direct matches on the
  "around 20 %" closest-bin claim (our −20.6 %) and the "centered at
  zero consistently" past-0.1-mile claim. The single quantitative gap
  is our parametric ATT (−5.78 %) vs the paper's "about 7.5 %" — well
  within the cluster-robust CI [−10.4 %, −1.5 %] and bracketed by our
  own ring-choice spread of −4.21 % to −6.40 %.

## Companion skill updates (also in this session)

The `r_did2` pipeline (committed 2026-05-18) exposed two gaps in the
results-report skills:

1. **`write-results-report`** was producing reports that were too
   light on figure embedding, lacked an explicit "Reproduction Audit"
   appendix when a source paper was present, and let the "Surprises"
   section drift into ad-hoc bullets rather than a checklist of named
   categories. Rewritten with five v2 gates: inline figure embeds per
   method subsection, per-section CSV pull-through tables, ≥ 8 Key
   Findings, mandatory Reproduction Audit when a source paper exists,
   and a 7-category Surprises checklist driven by an explicit
   `interpretation-guide.md` taxonomy.

2. **`review-results-report`** was not testing the new gates. Added
   **Dimension 7 — New-gates compliance** with five PASS/PARTIAL/FAIL
   sub-bullets, raised the minimum counts in dimensions 2 and 3, and
   added a verdict-tier escalation for failed sub-bullets in
   `scoring-and-criteria.md`. Includes a new `exemplars.md` reference
   that points the writer at `r_did_ring` and `r_did2` as the gold
   standard.

The `r_did_ring/results_report.md` was the first artefact to clear the
new gates from the start; the review found 0 HIGH / 0 MED / 3 LOW,
all resolved before this commit.

## Render artefacts (not committed)

`tutorial.html` (184 KB) and `tutorial_files/figure-html/` (≈ 10 MB)
are produced locally by `quarto render` but excluded from the commit
per the sibling-post convention. Readers re-render on demand from
`tutorial.qmd`. The 10 reproducible PNGs already in the bundle
(`r_did_ring_01_*.png` through `r_did_ring_10_*.png`) are the
authoritative versions for the published post body.

## Next steps

1. Add `featured.png` manually (per `feedback_featured_image.md`).
   The bundle currently ships `featured.webp`, which renders on the
   site but does not satisfy the Hugo auto-detection convention for
   the homepage "featured" widget.
2. Optional: regenerate the AI podcast from the latest `index.md` text
   if the audio gets out of sync with the post (the current
   `kaq4in.m4a` was generated from the pre-fix narrative).
3. Optional: write a single-image rendered version of
   `infographic_instructions.md` via Gemini and embed it under
   `featured-infographic.png` in the page bundle.
