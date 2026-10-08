# Script Review: `r_sc_dsc_sdid`

**Script:** `analysis.R` (1,405 lines) · **Language:** R 4.5.2 · **Reviewed:** 2026-08-02
**Companions reviewed:** `cheatsheet.R` (172 lines), `prepare_data.R` (280 lines)
**Status:** All code runs. Exit code 0.

## Verdict: MINOR REVISION — all findings applied

Three MEDIUM and two LOW issues, no HIGH. The script was already correct — every headline
estimate reproduced the published table before this review and still does after it. What the
review caught was one place where an arbitrary constant was hiding an exact result, one unused
dependency, and 40 lines of avoidable log noise. All five are fixed.

## Execution Results

| | |
|---|---|
| Exit code | 0 |
| Runtime | ~2 min warm (`cache/` populated), ~22 min cold |
| Figures generated | 18 PNG |
| Tables generated | 18 CSV + `web_app/data/results.json` |
| Warnings | none |
| `Rplots.pdf` left behind | no (removed by the script) |
| Built-in assertions | 9/9 passed |

**Determinism verified from scratch.** The script memoises expensive fits to `cache/*.rds`, which
means a normal run never recomputes them — so a cached run proves nothing about reproducibility.
Running with `FORCE_REFIT=1` recomputed every cached fit (the `Synth` nested optimisation over 92
predictors, the 20-window placebo tournament, the MASC cross-validations and the placebo-in-space
sweep) and produced a log **byte-identical** to the cached run apart from the line that echoes the
flag itself. The cache is faithful; the numbers are not an artefact of stale state.

## Issues found and fixed

| # | Dimension | Severity | Location | Issue | Fix |
|---|---|---|---|---|---|
| 1 | 3 Code quality, 7 Statistical correctness | MEDIUM | `analysis.R` §11 | `ascm_hand(0.01)` hard-coded an arbitrary ridge parameter. The script printed hand 3.059 against package 3.045 with no explanation, and ASCM was the only stage of seven that omitted a hand-vs-package agreement metric — so a reader had no way to tell whether the gap was method or mistake. | Pass `ascm_fit$lambda` (augsynth's own leave-one-period-out CV choice, 0.13858) into `ascm_hand()` and print `max(abs(hand - package))`. The two now agree to **3.9e-06**, and the hand-coded loss is 3.045 — identical to the package. The arbitrary constant had been masking an exact result. |
| 2 | 3 Code quality | MEDIUM | `analysis.R` §0 | `dplyr` was attached but never used — no `%>%`, `mutate`, `filter`, `bind_rows` or `select` anywhere in 1,403 lines. | Removed from `required` and from the `library()` block. `tidyr` (`pivot_longer`, `pivot_wider`) and `readr` (`read_csv`) are genuinely used and stay. |
| 3 | 1 Execution, 2 Structure | MEDIUM | `analysis.R` §13 | On a cold cache the placebo loop calls `augsynth()` 40 times, and each call emits `One outcome and one treatment time found. Running single_augsynth.` — 40 lines of noise in `execution_log.txt`, roughly a tenth of the file. Invisible on a warm run, which is why it survived the first build. | Wrapped the call in `suppressMessages()`. Verified against a live `augsynth()` call that the chatter is a `message()` and is genuinely silenced (it would have survived `capture.output()`). |
| 4 | 2 Structure | LOW | `analysis.R` §0 | `HALF_Q3 <- 44` was defined and never referenced — a leftover from the "half of the pre-treatment periods" specification that was descoped before the first build. | Deleted. |
| 5 | 3 Code quality | LOW | `analysis.R` §3 | `simplex_fw()`'s `zeta` argument is never passed a non-zero value; the penalised runs in §14c let `synthdid` apply its own default instead. A reader would hunt for the call site. | Kept the argument — removing it would stop the function being a faithful port of `sc.weight.fw` — and added a comment saying exactly that. |

### Downstream corrections

Finding 1 had propagated. The same arbitrary `0.01` appeared in `cheatsheet.R` and
`tutorial.qmd`, where it produced 3.06 / 4.31 against the package's 3.04 / 4.19 and 7 negative
weights against the package's 8. Both now use the CV-selected value and reproduce the package
exactly. `cheatsheet.R`'s `augsynth` call also picked up `suppressMessages()`.

## Positive highlights

- **The script asserts its own replication.** §16 runs nine `stopifnot()` checks against the
  published table — every estimator's 2018Q4 value within 0.02 pp, the placebo RMSE for SDID(i)
  and SC within 0.0004, MASC's tuning parameters exactly, and the structural invariant that the
  exact QP must never have a worse fit than Frank–Wolfe. A regression cannot pass silently.
- **Two solvers carried deliberately.** `simplex_ls` (exact, `quadprog`) and `simplex_fw` (a
  line-for-line port of `synthdid`'s internal Frank–Wolfe) are both kept so §5 can demonstrate
  that the published SC estimate is where the optimiser stopped rather than where the optimum is.
  That is a design decision, documented in the header, not an accident.
- **One helper reused five times.** `simplex_ls` solves the SC unit weights, the DSC demeaned
  weights, the SDID time weights (called on the transpose) and both arms of the MASC
  cross-validation. The ladder is genuinely one problem with different inputs.
- **Estimand stated once, precisely,** in the header block, including the sign convention and the
  fact that the source paper reports no inference at all.
- **Every figure goes through one `save_fig()` wrapper** at dpi 300 on the dark-navy background,
  and all 20 `ggplot()` objects apply `theme_site()`. No figure escapes the house style.
- **A documented trap is guarded.** The `masc` fold-set gotcha — where the package's own
  `min_preperiods` argument silently yields 5 folds instead of 80 and changes the estimate by a
  third of a percentage point — is both worked around and explained in a comment at the call site.

## Priority action items

All applied during this review. Nothing outstanding.

1. **[MED]** ASCM ridge parameter — now taken from `augsynth`'s CV rather than invented.
2. **[MED]** `dplyr` — removed.
3. **[MED]** `augsynth` log chatter — suppressed.
4. **[LOW]** `HALF_Q3` — deleted.
5. **[LOW]** `simplex_fw`'s unused `zeta` — explained in place.

## Notes for a future reviewer

- A plain `Rscript analysis.R` **does not** test reproducibility, because `cache/` short-circuits
  every expensive fit. Use `FORCE_REFIT=1` and budget ~22 minutes.
- `masc` will not install from GitHub as published: it declares a hard `Imports: gurobi`, and its
  own `nogurobi = TRUE` fallback references an object it never assigns. The install note in the
  script header documents the DESCRIPTION patch, and the script routes around the broken branch by
  passing its own solver through `masc`'s documented `sc_est` hook.
- The residual 3.9e-06 in the ASCM hand-vs-package check is the difference between `quadprog` and
  the `osqp` solver `augsynth` uses internally for the underlying SC weights. It is not worth
  chasing.
