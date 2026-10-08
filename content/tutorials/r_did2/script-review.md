# Script Review: `r_did2`

**Script:** `analysis.R` (1,138 lines)
**Language:** R 4.5.2
**Executed:** 2026-05-18, clean re-run (`Rscript analysis.R`)
**Status:** All code runs

## Verdict: ACCEPT

The script reproduces the manuscript's flagship 2×2 sign-reversal numerically (≈ +0.122 unweighted vs ≈ −2.563 weighted, deaths per 100,000), runs cleanly end-to-end in ~140 seconds, and produces every promised artifact (8 PNGs + 14 CSVs + README). The pedagogical scaffolding — WHAT/WHY/HOW/WATCH-FOR headers on every section plus docstrings on every helper — makes it usable as the outline of the blog post directly. The remaining issues are stylistic and tunable; none affect correctness.

## Execution Results

- **Exit code:** 0
- **Execution time:** 140 s (4 bootstrap `did::att_gt()` calls dominate)
- **Figures generated:** 8 PNGs (`r_did2_01_*.png` … `r_did2_08_*.png`)
- **CSVs exported:** 14 (raw + processed panels, 11 result tables, summary)
- **README + plan + execution_log:** present
- **Reproducibility:** two clean runs produced identical headline numbers to ≥ 3 decimals (`set.seed(42)` is honored by both `did::att_gt` and `HonestDiD`)
- **Warnings:** 3 categories — see issues #2, #5, #7 below — all non-fatal

### Headline numbers (reproduced from run)

| Stage                                       | Unweighted | Weighted |
|---|---:|---:|
| 2×2 cell-means ATT(2014)                    | +0.122 | −2.56  |
| 2×2 TWFE long-difference                    | +0.122 | −2.56  |
| 2×2 DRDID (Callaway-Sant'Anna)              | −1.23  | −3.76  |
| 2×T dynamic ATT (avg `e ≥ 0`)               | +9.43  | −0.68  |
| G×T dynamic ATT (avg `e ≥ 0`)               | +7.92  | +0.27  |

The 2×2 cell-means values agree with the manuscript's flagship +0.1 / −2.6 (line 215 of `reference/manuscript.tex`) to three decimal places.

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|---|---|---|---|---|
| 1 | 7 Statistical correctness | **MEDIUM** | lines 623, 717, 725, 796, 804 | `biters = 1000` on every `att_gt()` call. The manuscript uses 25,000. Bootstrap SEs are noticeably noisier than the point estimates and may shift the third-significant figure of the CIs between runs. | Raise to `biters = 5000` (or 10,000) for the published version, or add a `BITERS` constant at the top of the script with a comment: `# 1000 for fast iteration; raise to >=5000 for production`. |
| 2 | 7 Statistical correctness | **MEDIUM** | `att_gt()` calls at lines 621, 716, 724, 795, 803 set `bstrap = TRUE, cband = TRUE`; figures use `±1.96·SE` pointwise CIs (lines 671, 753, 838, 873, 1018). | Uniform confidence bands are requested but never read — the pointwise CIs in the plots do not match the package output. | Either (a) drop `cband = TRUE` and rely on pointwise CIs, or (b) plot the uniform bands by reading `agg$crit.val.egt` and replacing `1.96` with that critical value in Figures 5, 7, 8. Option (a) is simpler for a tutorial. |
| 3 | 3 Code quality | **MEDIUM** | lines 610–632 (`cs_one`) | The helper still uses `do.call(did::att_gt, ...)` to assemble the call, even though the user-facing repetition is now explicit via six `cs_one(...)` calls. A beginner has to parse what `do.call()` does and what `c(common, list(...))` produces. | Replace the `common` list + `do.call` with two explicit `att_gt(...)` invocations inside an `if (weighted) {...} else {...}` block. Slightly more lines, no `do.call`. |
| 4 | 3 Code quality | **LOW** | line 70 | `patchwork` is loaded but never used. The comment `# combine plots (used implicitly via facets)` is incorrect — `facet_wrap()` is base ggplot2; patchwork combines independent plot objects. | Remove `patchwork` from `pacman::p_load()` and from the README's "R packages used" line (1133). |
| 5 | 5 Figure conventions | **LOW** | lines 461, 669 | `geom_errorbarh()` is deprecated in ggplot2 4.0.0. The plot still renders, but the warning clutters the log. | Replace with `geom_errorbar(aes(y = spec, xmin = lo95, xmax = hi95), orientation = "y", ...)`. |
| 6 | 1 Execution | **LOW** | Section 6 console output | The 6 × `No pre-treatment periods to test` lines come from `did::aggte(type = "simple")` on the 2×2-collapsed call inside `cs_one`. They are informational (the 2×2 design *has* no pre-period to test) but noisy. | Wrap the `aggte()` call in `suppressMessages()`, or add a one-line comment in `cs_one` explaining the message so readers don't mistake it for a problem. |
| 7 | 1 Execution | **LOW** | Section 9 final figure | `Removed 2 rows containing missing values` from `geom_ribbon()` (4 occurrences across the 2×T and G×T event-study plots). Cause: the reference period at `e = -1` has SE = NA by construction. | Either filter `e == -1` out of the plot data, or set `aes(ymin = lo95, ymax = hi95)` to `NA` only at the reference period and suppress the warning. Cosmetic only. |
| 8 | 7 Statistical correctness | **LOW** | Figure 8 (line 1033) and `table_honestdid.csv` | At `M̄ ≥ 1` the HonestDiD bounds saturate near ±66 because the search hits HonestDiD's default `grid.ub` / `grid.lb`. Not a bug, but a reader may misread it as a fact about the data rather than about the grid. | Either pass `grid.ub`, `grid.lb` explicitly inside `honest_did.AGGTEobj()` to widen the search range, or annotate the plot with `caption = "Bounds become uninformative beyond M̄ ≈ 0.5"`. |

No HIGH-severity issues.

## Positive Highlights

- **Exact reproduction of the manuscript's headline.** The 2×2 cell-means ATT(2014) reproduces the +0.1 / −2.6 sign-reversal to three decimal places. The cleaning pipeline (lines 188–230) faithfully implements the manuscript's inclusion criteria.
- **Pedagogical scaffolding throughout.** Every numbered section (0–10) opens with the four-line WHAT/WHY/HOW/WATCH-FOR header that doubles as a draft section opener for the blog post. Every helper function (`cell_means`, `att_2x2`, `wtd_var`, `extract_did`, `cs_one`, `honest_did.AGGTEobj`, `flatten_hd`) has a 3–6 line purpose docstring.
- **Estimand clarity.** The file header (lines 14–22) names the ATT explicitly and contrasts the two weighting interpretations; Section 6 (lines 570–587) restates the observational framing and clarifies that covariates serve confounding control, not precision. No "confounder" misuse, no post-treatment adjustment.
- **Type discipline that prevents a silent bug.** `treat_year` is deliberately stored as `double` because `did::att_gt()` writes `Inf` for never-treated rows; an integer column would coerce to `NA` and drop every control. The choice is documented inline (lines 218–222) and applied uniformly across Sections 6, 7, 8.
- **Faithful re-use of manuscript helpers, with attribution.** The custom `wtd_var()` (line 501) and the `honest_did.AGGTEobj` S3 method (line 928) are direct ports of the reference scripts at `reference/scripts/R/2_2x2.R` and `5_honestdid.R`, with provenance noted in the comment block.
- **Dark theme consistency.** All 8 figures use the site palette `#0f1729` / `#1f2b5e` / `#c8d0e0` / `#e8ecf2` with `#6a9bcc` (blue, unweighted) and `#d97757` (orange, weighted) as the encoding for the central comparison. Consistent encoding across figures is a quiet win.
- **Self-contained execution.** The script reads from `reference/data/` and writes a `raw_data.csv` copy at line 162 so any reader can re-run without descending into the reference folder. No network calls.
- **Deterministic.** `set.seed(42)` at line 47 plus two clean runs producing identical 6-decimal results.

## Priority Action Items

1. **[MED]** Resolve the bootstrap-iterations + CI-type story (issues #1 and #2). Either raise `biters` and switch to uniform bands using `crit.val.egt`, or keep `biters = 1000` and drop `cband = TRUE`. The current state is internally inconsistent.
2. **[MED]** Inline the `att_gt` call inside `cs_one` (issue #3) so the tutorial helper has no `do.call` left.
3. **[LOW]** Three quick stylistic cleanups: remove unused `patchwork` (issue #4), replace `geom_errorbarh()` with `geom_errorbar(orientation = "y")` (issue #5), and suppress or explain the verbose informational lines (#6, #7).

---

*Review generated by `/project:review-script`. The review is advisory only; `analysis.R` was not modified.*
