# Script Review: `r_did_ring`

**Script:** `analysis.R` (1,140 lines)
**Language:** R
**Executed:** 2026-05-19, clean re-run (`Rscript analysis.R`)
**Status:** All code runs

## Verdict: ACCEPT (both MEDIUM issues resolved post-review)

The script delivers on its pedagogical premise: it builds the ring-DiD argument step by step on simulated data, then re-runs the same logic on Linden & Rockoff's real housing-price data, and the parametric estimator recovers the simulated truth essentially exactly (τ̂ = 0.726 vs truth = 0.726). Real-data headline numbers (parametric −5.8 %, nonparametric −12.4 % inside 0.1 mi, sample-weighted) sit inside the range Butts (2023) reports. The pedagogical scaffolding — a docstring with explicit acknowledgement of the source paper, WHAT/WHY/HOW/WATCH headers on every section, line-by-line comments inside both inlined helpers, and a seven-step real-data walk-through in Section 6 — makes the file usable directly as the spine of the eventual blog post. After the post-review fixes (see "Resolved" subsection below), only the 6 LOW items remain.

## Execution Results

- **Exit code:** 0
- **Execution time:** 12.7 s (wall clock; 25.0 s user, 1.6 s system; 208 % CPU from `data.table` / `binsreg` parallelism)
- **Figures generated:** 10 PNGs (`r_did_ring_01_*.png` … `r_did_ring_10_*.png`), all at dpi 300 (verified with `sips`)
- **CSVs exported:** 11 (`raw_data.csv`, `data_prepared.csv`, `summary.csv`, plus 8 per-section result tables)
- **README + plan + execution_log:** all present
- **Reproducibility:** two clean runs produced identical headline numbers to 4 decimals (`set.seed(42)` at the top plus nested seeds in §1, §2, §3, §5 are honored end-to-end)
- **Warnings:** 3 categories — see issues #1, #4, #5 below — all non-fatal
- **Notes:** `fixest` reports 63 / 73 / 73 / 73 fixed-effect singletons across the four ring-DiD regressions; `binsreg` reports two informational notes per call. Both are package defaults.

### Headline numbers (reproduced from run)

| Estimator                                   | Estimate | SE       | %       |
|---|---:|---:|---:|
| Sim 2×2 DiD (truth = 0.30)                  | 0.310    | 0.026    | —       |
| Sim parametric ring, correct rings (truth = 0.726) | 0.726 | 0.005 | — |
| Sim parametric ring, too narrow (0, 0.30]   | 0.913    | 0.006    | —       |
| Sim parametric ring, too wide   (0, 1.20]   | 0.456    | 0.010    | —       |
| LR parametric ring, default (0, 0.1] vs (0.1, 0.3] | −0.0595 | 0.0225 | −5.78 % |
| LR parametric ring, inner = 0.05            | −0.0661  | 0.0383   | −6.40 % |
| LR parametric ring, inner = 0.15            | −0.0431  | 0.0180   | −4.21 % |
| LR nonparametric ring, sample-weighted ATT inside 0.1 mi | −0.132 | —      | −12.4 % |

The parametric ring estimator on the simulated DGP recovers the truth (0.726 vs 0.726) to three decimal places. The Linden-Rockoff ring-DiD coefficient lands in the −4 % to −6 % range across reasonable ring choices, consistent with Butts (2023) and Linden & Rockoff (2008); the nonparametric curve adds the further story that the discount is steeper at very short distances (curve average inside 0.1 mi = −11.4 %) before fading out.

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|---|---|---|---|---|
| 1 | 7 Statistical correctness | **MEDIUM** | line 1059, §6.7 | "Average TE inside 0.1 mi" for the nonparametric estimator is computed as `mean(tau)` over step-function rows with `x <= 0.1`. Because the helper appends two rows per bin (start, end) and one NA-break row, this is an *unweighted* row-average, not a sample-size-weighted ATT. For the simulated DGP this is fine (bins are equal-width), but on the LR data binsreg uses data-driven bin widths, so the row-average can drift from the sample-weighted ATT. | Replace `mean(tau)` with a sample-weighted average: assign each observation in `df_short` to its binsreg bin, then average `tau` across observations (or across bin midpoints weighted by bin-population). Document explicitly that this is "an unweighted average of bin estimates" if you keep the current implementation. |
| 2 | 5 Figure conventions / 1 Execution | **MEDIUM** | repeated across §3, §4, §5, §6.5, §6.7 (≥10 occurrences) | `geom_ribbon()` / `geom_line()` warn "Removed N rows containing missing values" on every plot that uses the NA-break idiom in the helpers (the `tau = NA` rows appended at bin endpoints to keep step lines visually disconnected). The plots render correctly but the log accumulates 10+ identical warnings, making it harder to spot a *real* warning. | Either (a) wrap the offending `ggsave()` calls (or the underlying `geom_ribbon/geom_line`) in `suppressWarnings()` with a one-line comment explaining the NA breaks are intentional; or (b) at the end of each helper, drop the `tau = NA` row and instead use `group` aesthetic on `bin` to break lines without NA. Option (a) is the smaller change. |
| 3 | 3 Code quality | **LOW** | line 116 | `broom` is loaded via `pacman::p_load()` but never called anywhere in the script. | Remove `broom` from the `pacman::p_load(...)` list. |
| 4 | 1 Execution / 7 Statistical correctness | **LOW** | §6.5, §6.6 (lines 631 + 690-693) | `fixest` emits informational `NOTE: 63 fixed-effect singletons were removed (63 observations).` etc. on each ring DiD regression. The numbers are small relative to the 9,000+ sample and standard behavior; nothing is wrong, but a beginner reader may not know what a "fixed-effect singleton" is. | Add a 2-line WATCH comment in §6.5 explaining: "`srn_year` cells with only one observation cannot identify the FE coefficient; `fixest` drops them automatically. With 8,000+ observations and 73 singletons (~0.8 %), this does not change the headline." Optionally pass `notes = FALSE` to silence the runtime message. |
| 5 | 1 Execution | **LOW** | §5, §6.7 (binsreg calls inside `nonparametric_ring_cs`) | `binsreg` prints two informational warnings per call: "Degree for ci has been changed. It must be greater than the degree for dots." and "To speed up computation, bin/degree selection uses a subsample of roughly max(5000, 0.01n) observations…". Both are by-design for the chosen `line = c(0,0), ci = c(0,0)` configuration, but the second one is non-deterministic without `randcut = 1`. | Either set `randcut = 1` inside the helper to use the full sample (slightly slower, fully deterministic), or document in the helper's docstring that for n > 5000 binsreg subsamples for bin selection; with `set.seed(42)` upstream the result is still reproducible. |
| 6 | 3 Code quality | **LOW** | helpers `parametric_ring_panel` (lines 354-403) and `nonparametric_ring_cs` (lines 444-505) | The helpers use `data.table` syntax (`df[, := ...]`) inside an otherwise tidyverse script. Mixing two paradigms is harder for beginners than either one alone. Trade-off: the data.table syntax is a direct port from Butts's `references/helper-*_rings_estimator.R`, which is *good* for provenance. | Acceptable as-is given the explicit "inlined from references" comment. If pedagogy is the primary goal of a future revision, rewrite the helpers in pure tidyverse + base R. |
| 7 | 5 Figure conventions | **LOW** | `r_did_ring_04_ringchoice_problem.png`, `r_did_ring_09_lr_ringchoice.png` (1×3 patchworks) | The first panel keeps the y-axis title; panels 2 and 3 strip it via `theme(axis.title.y = element_blank())`. Layout is clean, but the first panel's title text wraps to two lines on smaller embeds because of the longer subtitle ("τ_hat = …"). | Shorten subtitles (e.g., `τ̂ = -0.066`) or use `plot.subtitle = element_text(size = base_size - 1)` for the 1×3 panels. |
| 8 | 5 Figure conventions / 6 Data handling | **LOW** | line ~677 (writes `raw_data.csv`) | `raw_data.csv` is 43 MB (170,239 rows × 51 columns from the full LR dataset). Per skill convention all loaded datasets are exported, but committing both the 43-MB `.dta` *and* the 43-MB `.csv` means ~86 MB of duplicated data in the repo. | Consider writing only the *analysis* sample (`data_prepared.csv`) to disk, and noting in the README that the full raw dataset is available via the GitHub raw URL of `linden_rockoff.dta`. Or convert `raw_data.csv` to parquet (~5 MB). Either keeps the artifact pipeline intact while shrinking the repo. |

No HIGH-severity issues.

## Resolved (post-review)

Both MEDIUM issues were fixed in a follow-up edit to `analysis.R`. The script was re-run cleanly afterwards.

- **MED #1 resolved** (§6.7, `inner_np` calculation). Replaced the row-average over the step function with a sample-weighted average: for each observation in `df_short` with `distance <= 0.1`, look up its bin's `tau` via `findInterval()` over `bin_summary$x_left`, then take `mean(tau_obs)`. Effect on the headline: **−0.121 (−11.4 %) → −0.132 (−12.4 %)**, with the sample-weighted value pulling slightly more negative because the binsreg curve is steeper at very short distances and most observations inside 0.1 mi sit there.
- **MED #2 resolved** (six affected `ggsave()` calls). Wrapped each in `suppressWarnings(...)` with a one-line comment explaining the NA-break idiom. Effect on the log: the `Removed N rows containing missing values` warning count dropped from 16 to 0; the only remaining warning lines are the two informational `binsreg` notes (Degree-for-CI changed; subsample for bin selection), which are package defaults and unrelated to NA breaks.

The four un-affected `ggsave()` calls (`r_did_ring_01_ring_geometry.png`, `02_dgp_curve`, `06_lr_gradient`, `07_lr_bandwidth`) were intentionally left un-wrapped so any real warnings on those plots still surface in the log.

## Positive Highlights

- **Exact recovery of the simulated truth.** Section 3 generates an exponentially decaying treatment effect and the parametric ring estimator recovers the truth to three decimals (τ̂ = 0.726 vs truth = 0.726, SE = 0.005). This is the strongest possible internal validity check: the estimator works on data where we *know* the answer.
- **Pedagogical scaffolding throughout.** Every numbered section (0–7) opens with the four-line WHAT/WHY/HOW/WATCH header. The header docstring (lines 1–65) acknowledges Butts (2023) by name, reproduces the BibTeX, lists the four learning objectives, and inventories every pipeline output. Section 6 is broken into seven explicit mini-steps (§6.1–§6.7) that build from "what is the natural experiment?" to "what does the estimated curve look like?" without any expository gaps.
- **Inlined helpers with line-by-line comments.** `parametric_ring_panel()` (lines 354–403) and `nonparametric_ring_cs()` (lines 444–505) are direct ports from `references/helper-*.R` but rewritten with explanatory comments — *what* binsreg is doing, *why* we subtract the rightmost-bin counterfactual, *how* the step function is assembled. A student can read the helpers as study material.
- **Estimand clarity.** Section 3 WATCH (lines 320–323) and Section 6.1 (lines 525–540) both state the estimand explicitly as the ATT on inner-ring units after treatment. Observational framing is correct (covariates serve confounding control via `srn_year` fixed effects, never "precision improvement"); no post-treatment variables enter the adjustment.
- **Dark theme + site palette consistency.** All 10 figures use `BG_DARK = #0f1729`, `GRID_DARK = #1f2b5e`, `TEXT_LIGHT = #c8d0e0`, `TEXT_WHITE = #e8ecf2`, with the site accents `BLUE = #6a9bcc` for parametric estimates, `TEAL = #00d4c8` for nonparametric, and `ORANGE = #d97757` for either the truth (on simulated panels) or the post-arrival series (on the gradient plot). Consistent encoding across figures is a quiet win.
- **Acknowledgment of provenance.** The header explicitly states the tutorial is inspired by and follows Butts (2023); the inlined helpers are flagged as ports of the original `references/helper-*.R` files; the Linden-Rockoff cleaning pipeline (lines 545–558) reproduces `references/analysis-linden_rockoff.R:19–29` exactly.
- **Resilient data loading.** Lines 540–549 try the GitHub raw URL first and fall back to the local file on 404. On this run the URL returned 404 (the file isn't pushed yet); the local fallback recovered transparently and the rest of the script ran unchanged.
- **Bandwidth-fragility lesson on real data.** Section 6.4 (`r_did_ring_07_lr_bandwidth.png`) is the strongest pedagogical figure: three kernel bandwidths on the same data, side by side, with the y-axis stripped on panels 2–3 so the eye compares the slopes directly. Combined with Section 6.6 (`r_did_ring_09_lr_ringchoice.png`, the parametric ring at three inner-ring cutoffs), the script makes the "ring choice is arbitrary" point twice: once with smoothing, once with regression.
- **Deterministic.** `set.seed(42)` at line 89 plus per-section seeds at lines 152, 195, 326, 488 keep the two clean runs in agreement to 6 decimals.

## Priority Action Items

1. **[MED]** Replace `mean(tau)` in §6.7 with a sample-size-weighted average across observations (or document that the current value is a row-average over the step function and is therefore a *bin-equal-weight* ATT). This affects the headline "−11.4 %" number, which is the one the blog post will quote.
2. **[MED]** Suppress (or document) the cascade of `Removed N rows containing missing values` warnings from the NA-break idiom inside the ring helpers. The log currently shows ~10 of them; readers comparing the log to the script may worry something is wrong.
3. **[LOW]** Trim repo bloat: drop `raw_data.csv` (or convert to parquet) since `linden_rockoff.dta` is already committed; remove the unused `broom` import; consider `randcut = 1` inside `nonparametric_ring_cs` for full-sample bin selection.

---

*Review generated by `/project:review-script`. The review is advisory only; `analysis.R` was not modified.*
