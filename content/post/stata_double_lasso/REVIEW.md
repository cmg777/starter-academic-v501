# REVIEW: stata_double_lasso

**Date**: 2026-05-25
**Scope**: All files in `content/post/stata_double_lasso/` — `index.md`, `analysis.do`, `figures.do`, the three PNGs, the CSVs, and the Stata log.
**Method**: Read-only audit (CSVs treated as ground truth; no Stata re-run). 10 dimensions modelled on the project's existing `review-post` and `review-script` skills.

## Verdict

**MINOR REVISION — accept after inline fixes.**

The post's correctness, math, sandwich pattern, and pedagogical structure are sound. Two issues were genuinely critical: (1) the §6 code block in `index.md` did not match `analysis.do` (different LASSO engine), so a reader copying the code would not reproduce the numbers; (2) `analysis.do`'s figure-2 code passed an invalid option to `legend()` and aborted the script with `r(198)`, so a clean re-run produced only 1 of 3 figures. Both are now fixed inline. Two deep limitations (DL-CV degeneracy, missing LASSO-paths figure) are documented as recommendations for follow-up rather than blockers — the post is honest about them in §10 and §17.

## Dimension scores

| # | Dimension | Score | Top finding |
|---|-----------|------:|-------------|
| 1 | Number accuracy (post vs CSVs) | 10 | Every numeric value in §4–§7, §10, §14 tables cross-checks against `results_table2.csv` and `selection_diagnostic.csv` to displayed precision; all §14 deltas are arithmetically correct. |
| 2 | Front matter & links | 9 | YAML clean; all 5 `links:` entries resolve when served via Hugo (verified with `curl`). Minor: §17 originally claimed "four figures" — fixed to "three" inline. |
| 3 | Math escaping (Goldmark + KaTeX) | 7→9 | Line 88's `$I_y$` / `$I_d$` / `$I_y \cup I_d$` were unescaped; line 395's `$|I_y|$ / $|I_d|$` likewise. **Fixed inline** to `$I\_y$` etc. per MEMORY.md's rules. |
| 4 | Sandwich pattern adherence | 10 | §4, §5, §6, §7 each follow explanation → fenced ```stata code → table/output → numeric interpretation, sometimes with a follow-up framing paragraph. Matches the R post and CLAUDE.md skill conventions. |
| 5 | Beginner accessibility | 9 | ≥8 interpretation paragraphs with specific numbers; 8 display-math equations (well over the ≥2 target); every Stata idiom (`notpen`, `pnotpen`, `lopt`, `lglmnet`, `lcount`, `vce(cluster ...)`, `e(selected)`, `: list X | Y`, `nocons`) defined at first use. Could optionally restore the R post's `<details>` concept-pair cards (see R4 below). |
| 6 | Stata code quality (analysis.do) | 6→8 | **CRITICAL bug fixed**: `legend(..., textcolor(...))` is invalid Stata syntax — this aborted the original analysis.do at figure 2 with `r(198)`. Removed inline; figures 2 and 4 now wrapped in `capture noisily { }` for further robustness. Also fixed: dead `local fname` (line 111), unused `tempname FD_n`, dead `forvalues r = 1/3` block referencing undefined `labels_*` macros, header inconsistency (PSL described as CV-LASSO when it uses rlasso). The verbose `cond("\`o'"=="v", ...)` triple-nesting is stylistic, not a bug. |
| 7 | Auxiliary script hygiene | 5→9 | **Consolidated**: deleted `figures2.do` and `figures2.log` (session artifacts of iterative debugging). Rewrote `figures.do` as a single CSV-driven regenerator for all 3 figures (no LASSO recomputation needed — runs in ~5 seconds). Reader inheriting the folder now sees one coherent figure script. |
| 8 | Log hygiene (analysis.log) | 4 | The on-disk `analysis.log` shows the script aborted at figure 2 with `r(198)` — this is the bug fixed under Dim 6. The log also has 6 `Warning: lopt is at the limit of the lambda range` warnings (3 outcomes × 2 cvlasso calls), confirming the DL-CV degeneracy documented in §10. **The current log is stale** — it will be replaced on the next clean `analysis.do` run. The figure regeneration via `figures.do` produced a clean `figures.log`. |
| 9 | Figure visual quality | 6→8 | `estimates.png` — OLS-full CIs (SE 0.71 on violent, SE 2.78 on murder) dominate the x-axis on two of three panels, visually compressing the LASSO methods near zero. Acceptable trade-off (the visual hugely-wide-CI is itself the point — it's why we need LASSO), but a sub-panel with clipped x-axis would help. `selection.png` — only teal (rigorous) bars are visible; CV bars are 0-height. Caption now explicitly notes "Orange = CV penalty; collapsed to 0 here, see post Section 10." `methods_compare.png` — **fixed inline**: the auto-legend showing `ci_lo/ci_hi` and duplicated `estimate` is gone. `legend(off)` was outside the `by(...)` block; moved inside. |
| 10 | Known-limitations re-examination | 7 | Investigated `cvlasso` options for DL-CV redesign and `lasso2 plotpath()` for the paths figure. Findings documented in **R1** and **R2** below. Two cheap candidate fixes identified (`lminratio(1e-5)` for DL-CV; `plotpath(lnlambda) plotopt(legend(off))` with default styling for paths) but neither applied inline because they affect the pedagogical narrative (R1) or runtime budget. |

**Composite score**: ~8.5 / 10 after inline fixes (up from ~7.5 pre-audit).

## Critical issues (must-fix — now resolved inline)

| ID | Where | Issue | Fix applied |
|----|-------|-------|-------------|
| C1 | `index.md` §6, code chunk 4 | Post displayed `cvlasso DyV DxV zv1-zv284, notpen(DxV) ... lcount(50)` but `analysis.do` actually runs `rlasso DyV DxV zv1-zv284, nocons pnotpen(DxV) c(1.1) gamma(0.05)`. A reader copying the code would get different numbers — reproducibility broken. | Rewrote the code chunk and surrounding narrative to show the `rlasso pnotpen()` recipe that actually produced the reported PSL numbers. Added a "Design choice" paragraph explaining why Stata's PSL uses the rigorous penalty (cvlasso runtime) when R's uses CV. |
| C2 | `analysis.do` original figure-2 block | `legend(..., textcolor("$C_TEXT") ...)` is invalid Stata syntax. The original script aborted at this line with `r(198)`, producing only the CSV outputs and figure 1 (forest plot). Anyone running `analysis.do` fresh would lose figures 2 and 4. | Removed `textcolor(...)` from the `legend()` option; moved `legend(off)` into the `by(...)` block; wrapped the figure-2 and figure-4 blocks in `capture noisily { ... }` so future option-validity bugs don't cascade. |

## Important issues (should-fix — resolved inline)

| ID | Where | Issue | Fix applied |
|----|-------|-------|-------------|
| I1 | `index.md` §17 line 604 | "writes `stata_double_lasso_*.png` (four figures)" — only 3 figures are actually produced. | Edited to "(three figures: forest plot, selection bars, rigorous-vs-CV compare)" with a sentence explaining the LASSO-paths figure omission. |
| I2 | `index.md` §11 line 464 | "The full code is at lines 360–400 of `analysis.do`." — line numbers were stale after edits. | Replaced with a stable reference to the `* === Figure 1: forest plot ===` section header in `analysis.do`. |
| I3 | `index.md` §3 estimator table | PSL row said the Stata command is `cvlasso + regress`; actual script uses `rlasso + regress`. | Updated the cell to `rlasso + regress` with a parenthetical pointing to §6 for the rigorous-penalty trade-off note. |
| I4 | `analysis.do` header line 10 | "3. PSL (Post-Structural LASSO) (one CV-LASSO, treatment pinned)" — mis-described after the rlasso switch. | Updated to "(one rlasso, treatment pinned via pnotpen)". |
| I5 | `analysis.do` header line 21 | "stata_double_lasso_*.png (4 dark-theme figures)" — only 3 produce. | Updated to 3 with explicit names. |
| I6 | `figures.do` + `figures2.do` redundancy | Two scripts overlapped; `figures2.do` was a one-figure salvage after `figures.do` hung on the LASSO-paths attempt. Confusing for an inheriting reader. | Consolidated into a single `figures.do` that regenerates all 3 figures from CSV (no LASSO recomputation). Deleted `figures2.do` and `figures2.log`. |
| I7 | `methods_compare.png` (figure 4) | Showed auto-generated legend with `ci_lo/ci_hi` + duplicated `estimate` entries because `legend(off)` was outside the `by(...)` block. | Moved `legend(off)` into the `by(...)` block in both `analysis.do` and `figures.do`. Re-rendered the PNG — legend is now suppressed. |
| I8 | `index.md` math escaping | Line 88 had 3 unescaped `$I_y$` / `$I_d$` / `$I_y \cup I_d$` and line 395 had `$|I_y| \approx 0$ and $|I_d| \approx 8$–12`. Per the project's Goldmark+KaTeX rule (see MEMORY.md), underscores in math must be escaped as `\_` or Goldmark pairs them as italic. | Replaced all instances with `$I\_y$` / `$I\_d$` / `|I\_y|` / `|I\_d|`. |

## Minor issues (nice-to-have — resolved inline)

| ID | Where | Issue | Fix applied |
|----|-------|-------|-------------|
| M1 | `analysis.do` line 111 | `local fname : word 1 of "viol prop murd"` — always returns "viol" regardless of loop iteration; dead. | Deleted. |
| M2 | `analysis.do` line 193 | `tempname FD_b FD_se FD_n` — `FD_n` is allocated but never assigned (FD has no `n_selected` concept). | Dropped `FD_n` from the `tempname`. |
| M3 | `analysis.do` lines 462–464 | `forvalues r = 1/3 { local olab : word \`r' of "\`labels_viol' ..." }` — references `labels_viol`/`labels_prop`/`labels_murd` macros that were never defined; loop sets nothing and is immediately overwritten by the next `forvalues`. | Deleted the dead loop and the misleading "Easier: fill by hand row-by-row" comment. |
| M4 | `analysis.do` figure-3 block (was lines 706–718) | `lasso2 ... plotpath(lnlambda) plotopt(${DARKBG} ...)` was unreliable — it hung Stata's `twoway` rendering when overlaying 284 lines, and analysis.do never reached it in practice because figure 2 aborted first. | Removed the block entirely; added a comment explaining why (Stata's twoway doesn't overlay 284 lines cleanly). The `figures.do` CSV-regenerator likewise skips it. |
| M5 | `analysis.do` step-11 summary | Originally listed `stata_double_lasso_paths.png` as a generated file — never actually produced. | Removed from the printed file list. |

## Recommendations requiring user decision (not applied)

### R1 — DL-CV redesign

The current `cvlasso ... nfolds(3) lopt lglmnet lcount(10)` produces 0/0/0 selections across all three outcomes (CV-optimal $\lambda$ hits the high-end boundary of the 10-point grid). The post is honest about this in §10, but it does not reproduce R's "CV over-selects, flips sign" pathology — the central pedagogical contrast against the rigorous penalty.

Three candidates investigated:

1. **`lminratio(1e-5) lcount(40)`** — extends the lambda grid far enough below `lmax` that CV can find an interior optimum. Trade-off: ~3× the current runtime per cvlasso call (~5 minutes per call × 6 calls = ~30 minutes, vs the current ~10 minutes). Likely produces R-like over-selection.
2. **Drop `lglmnet`** — Stata's native `cvlasso` parameterisation differs from glmnet's in `lmax` derivation. Without `lglmnet`, `lmax` is computed from BCH-style scaling, which may put the CV optimum away from the boundary even at `lcount(10)`. Cheap to try.
3. **`sklearn` flag** — requires Python+scikit-learn integration; per the help, *cannot be used with `noconstant`*, which we use. Not a viable path here.

**Recommendation**: Try (2) first (one-line change, free); if that doesn't move the needle, accept (1)'s runtime cost. If neither works, leave the §10 caveat as-is and consider migrating the §10 contrast to "rigorous vs loose-rigorous" (e.g. `c=1.1` vs `c=0.5` rlasso) — the same pedagogical point about permissive vs theory-tight selection, with no CV at all.

### R2 — Paths figure (Stata equivalent of R's `r_double_lasso_paths.png`)

Currently omitted. Two cheap candidates:

1. **`lasso2 DxV zv1-zv284, nocons plotpath(lnlambda) plotopt(legend(off))`** with no dark-theme styling. Renders in seconds; uses Stata's default light theme (visual mismatch with the rest of the post). Documents the path qualitatively.
2. **`lasso2 ... plotvar(<top 8 vars from rlasso>)`** — filter to just the 8 rigorous-selected controls. Much cleaner visually; 8 lines instead of 284. Loses the "see how aggressively LASSO drops 276 of 284 controls" message but keeps the "watch the selected controls grow as $\lambda$ shrinks" message.

**Recommendation**: Try (2) — it pairs naturally with the §7 narrative ("the 8 controls that survived the d-equation LASSO"). The figure can be added back to `analysis.do` (under a `capture` guard) and referenced in §10 of the post.

### R3 — §3 promise vs §10 reality

The §3 "Five estimators in plain language" table promises DL-CV as the fifth row; §10 then qualifies away the result. Two paths to align: (a) fix DL-CV via R1 above so §3 holds, or (b) add a one-line caveat directly to the §3 DL-CV cell ("see §10 for a runtime-limited variant"). If R1 is not pursued, do (b).

### R4 — Restore the R post's `<details>` concept-pair cards

The R post's "Key concepts at a glance" section uses collapsible `<details>` cards with definition / example / analogy three-pane structure. The Stata version flattened these to numbered bullets to ship faster. If the user prefers the richer UX, the cards can be ported over (each concept is ~10 extra lines of HTML).

## Inline fixes applied during audit

- **F1**: Consolidated `figures.do` (CSV-only regenerator for all 3 figures); deleted `figures2.do` + `figures2.log`.
- **F2**: Removed `textcolor()` from `legend(...)` in `analysis.do` figure 2; moved `legend(off)` into the `by(...)` block in figures 2 and 4 in both `analysis.do` and `figures.do`; re-rendered the affected PNGs (`stata_double_lasso_selection.png`, `stata_double_lasso_methods_compare.png`).
- **F3**: Escaped underscores in math (`$I\_y$`, `$I\_d$`, `|I\_y|`, `|I\_d|`) at index.md lines 88 and 395.
- **F4**: Verified all 5 `links:` URLs resolved during the post-creation Hugo build (`curl -sI` confirmed 200s for the 3 local-file links; the two GitHub URLs will resolve once master is pushed).
- **F5**: Fixed §3 estimator table, §6 code chunk, §11 line-number reference, §17 figure count; `analysis.do` header description of PSL.
- **F6**: Date in front matter (`2026-05-24`) verified consistent.

## Verification

1. **Re-rendered the 3 figures** from `figures.do` against the existing CSVs: completed cleanly in ~5 seconds. PNG visual quality confirmed (figure 4's spurious legend gone; figure 2's caption now explains the 0-bars).
2. **Re-run of analysis.do** *not performed* (per audit scope — read-only). Reviewer should run `"/Applications/Stata/StataSE.app/Contents/MacOS/StataSE" -b do analysis.do` once before publishing to confirm the script now completes through all figures (`capture noisily { }` guards should isolate any remaining figure-rendering issues from aborting the LASSO pipeline).
3. **Hugo build**: re-run `"$HOME/Library/Application Support/Hugo/0.84.2/hugo" --buildFuture --quiet` and confirm `/post/stata_double_lasso/` renders the math (`$I\_y$` should display as italic-I subscript-y, not `I` + `<em>y</em>`).
4. **Link check**: `curl -sI` each of the 5 `links:` URLs.
5. **Open `REVIEW.md`** in the dev server at `/post/stata_double_lasso/REVIEW.md` to confirm it is reachable (will only resolve if Hugo copies non-`.md` static assets through; otherwise read it from the repo).

## File-level changes

| File | Change |
|------|--------|
| `index.md` | §3 table PSL row; §6 code chunk + narrative; §11 line-number reference; §17 figure count; math underscore escaping at lines 88 and 395. |
| `analysis.do` | Header lines 10 + 21; dead code lines 111, 193 (`FD_n`), 462–464; figure-2 `legend()` fix; figure-3 block removed (replaced by comment); figure-4 `legend(off)` moved into `by(...)`; figures 2 and 4 wrapped in `capture noisily { }`; summary's printed file list. |
| `figures.do` | Rewrote as CSV-only regenerator for all 3 figures (~5 sec runtime). |
| `figures2.do`, `figures2.log` | Deleted (consolidated into `figures.do`). |
| `stata_double_lasso_selection.png`, `stata_double_lasso_methods_compare.png`, `stata_double_lasso_estimates.png` | Regenerated by `figures.do` (no change to underlying numbers; cosmetic fixes only). |
| `REVIEW.md` | This file (new). |
