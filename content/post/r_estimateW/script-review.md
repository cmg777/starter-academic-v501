# Script review — `analysis.R`

**Reviewed:** 2026-07-31 · **Script:** `analysis.R` (1,733 lines) · **Language:** R 4.5.2

## Verdict: ACCEPT

All issues below were found during development and **fixed before the final run**. The script
executes cleanly end to end, reproduces all twelve published quantities exactly, and leaves no
stray artifacts. This file records what went wrong on the way, because several of the bugs were
silent — they produced plausible output rather than errors.

## Execution results

```text
=== Script completed successfully ===
Artifacts: 19 PNG figures, 15 CSV tables, 19 cache objects
REPRODUCTION AUDIT: 12 exact, 0 within Monte Carlo noise, 0 differing (of 12 quantities)
```

No errors, no warnings, no `Rplots.pdf`. Runtime ~40 min cold, ~1 min with the committed cache.

## Issues found and fixed

| # | Dimension | Severity | Location | Issue | Fix |
|---|---|---|---|---|---|
| 1 | Correctness | **HIGH** | Table 3 audit | The `case_when()` building audit keys had no branch for the `total` block, so total rows fell through to the bare parameter name and collided with the `beta` rows. The `left_join` silently returned **15 rows instead of 12** and reported 3 spurious "differs". | Added an explicit `total` branch plus `stopifnot(!any(duplicated(...)))` and a row-count assertion. |
| 2 | Correctness | **HIGH** | `slim_fit()` / Section 6 | `degree_draws` is `(draw × region)`, but per-region mean degree was computed with `rowMeans()`, which averages **across regions within a draw** — a length-100 vector silently recycled against 90 regions. | Changed to `colMeans()` and added a comment naming the trap. |
| 3 | Correctness | **HIGH** | Section 10, Durbin family | `sdm()`/`sdem()`/`slx()` were called with the same variable in both `X` and `Z`. `estimateW` builds `U = [X, WX, Z]`, so the design was rank deficient — and the package does **not** error, it just returns collinear draws. | Made `X` and `Z` disjoint (`X_dur = Z[,2:4]`, `Z_dur = Z[,1]`), documented in a comment. |
| 4 | Correctness | MEDIUM | Sections 8, 9 | AUC was computed by trapezoid over a sorted score. Posterior link probabilities are quantized to 0.01 with 100 draws, so thousands of cells tie exactly and the result depended on tie order. | Replaced with the Mann-Whitney form on averaged ranks, which is exact under ties. Changed same-country AUC from 0.756 to 0.753. |
| 5 | Reproducibility | **HIGH** | `say()` helper | `glue()` resolved braces in `say()`'s own frame, so any interpolation referring to a **caller's local variable** failed. Crashed the first full run inside `get_nuts1_geometry()`. | Added `.envir = parent.frame()` and forwarded it. |
| 6 | Robustness | MEDIUM | Sections 7, 10 | Top-10%/20% link selection used a quantile threshold. `W` is sparse enough that the cut can land exactly on a tie and return far more links than intended. | Switched to rank-based `slice_max(n = ceiling(q * N))`. |
| 7 | Statistical | MEDIUM | `slim_fit()` | The spatial multiplier must be averaged over draws, not computed from the posterior mean `W` and mean `rho` — `(I − ρW)⁻¹` is nonlinear, so plugging in means is a Jensen-inequality error. | Computed per draw inside the slimming step; comment states why. |
| 8 | Robustness | MEDIUM | `chordDiagram()` | After thresholding, a country can be left with no surviving flow in either direction, which errors on an all-zero sector. | Drop zero sectors before drawing; `grid.col` indexed off the surviving rownames. |
| 9 | Presentation | LOW | Chain comparison print | `signif(., 4)` was applied to every numeric column, rendering seed `20260731` as `20260000` in the log. | Excluded `seed`/`niter`/`nretain` from the rounding. |
| 10 | Presentation | LOW | Figures 8, 15 | `geom_hline` break positions were not mirrored for a reversed discrete y-axis, so country separators sat on the wrong rows. | `yintercept = N + 1 - breaks`. |
| 11 | Presentation | LOW | Figures 2, 3 | Facet strip labels were clipped or wrapped mid-token by `label_wrap_gen()`. | Shortened case names and tuned wrap widths. |
| 12 | Performance | MEDIUM | `save_fig()` | At a uniform `dpi = 300` the 19 figures totalled **12 MB** — five to ten times any other post on this site — because the network, chord and map figures are alpha-blended line art that PNG cannot compress. | `save_fig()` gained a `dpi` argument; six graphics-dense figures now render at 150–200 dpi. Total 7.4 MB, no visible difference at display size. |

## Positive highlights

- **The reproducibility barrier works.** The two-point timing probe deliberately consumes RNG, so
  the script re-seeds immediately before the headline call with an assertion that `RNGkind()` is
  unchanged and a comment forbidding any RNG use in between. All twelve quantities reproduce exactly.
- **The audit is honest by construction.** It reports differences in units of our own Monte Carlo
  standard error alongside absolute differences, and caps agreement claims at the paper's five-decimal
  print precision, so a reader on a different BLAS can distinguish noise from a real discrepancy.
- **Cache keys encode every setting that changes the result** (seed, n, T, niter, nretain, kbar), so a
  stale cache cannot be served silently; the hit path prints the stored runtime.
- **The geometry join is asserted, not assumed.** Filter to 26 countries, drop `FRY`, assert exactly
  90 with zero unmatched in either direction, then reorder to panel order — because a silently
  mis-sorted geometry would produce a plausible but wrong map rather than a crash.
- **Dependency discipline.** `spdep`, `igraph`, `ggraph` and `giscoR` were all avoidable and avoided;
  the footprint is five small pure-R packages.
- **Degradation paths are real.** `HAS_CIRCLIZE` and `HAS_GEO` feature flags let the script complete
  with reduced output rather than failing when an optional package or the network is unavailable.

## Notes for a future reviewer

The three genuinely dangerous bugs (1, 2, 3) were all **silent**: each produced plausible numbers
rather than an error. They were caught by reading the printed output against expectations — 15 audit
rows where 12 were expected, a mean degree that did not match the prior anchor, and a Durbin fit
whose coefficients looked odd. Structural assertions (`stopifnot` on row counts, dimensions and join
completeness) now guard all three.
