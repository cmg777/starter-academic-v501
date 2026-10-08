# Script Review: stata_matching

**Script:** `analysis.do` (~280 lines)
**Language:** Stata 18 SE
**Executed:** 2026-04-29 (fresh re-run for review)
**Status:** All code runs

## Verdict: ACCEPT

The script executes cleanly end-to-end (exit code 0, 22.6 s wall time), all five PNG figures are generated and visually distinct, every `teffects` model is correctly stored, and the manual recreation block for Regression Adjustment recovers the canned `teffects ra` ATE to two decimal places (−239.64 g). No HIGH issues; a small handful of LOW polish items.

## Execution Results

- **Exit code:** 0
- **Execution time:** 22.6 seconds (StataSE on macOS)
- **Figures generated:** 5 PNGs (`stata_matching_density_bweight.png`, `stata_matching_propensity_distribution.png`, `stata_matching_psm_logic.png`, `stata_matching_overlap.png`, `stata_matching_forest_plot.png`) — all distinct (verified by MD5)
- **Stored estimates:** te_naive, te_ra, te_ra_att, te_ipw, te_ipw_att, te_ipwra, te_ipwra_att, te_aipw, te_nnmatch, te_nnmatch_att, te_psmatch, te_psmatch_att (12 total)
- **CSV export:** `ate_estimates.csv` (forest-plot data, 7 rows × 5 cols)
- **Warnings:** None. No deprecation, convergence, or data warnings.

### Headline numbers (reproduced fresh)

| Method | ATE (g) | 95% CI | ATT (g) |
|---|---:|---|---:|
| Naive | −275.25 | (−317.30, −233.20) | — |
| 1. RA | −239.64 | (−286.33, −192.95) | −223.30 |
| 2. IPW | −230.91 | (−278.55, −183.26) | −219.63 |
| 3. IPWRA | −231.87 | (−281.17, −182.57) | −220.65 |
| 4. AIPW | −232.48 | (−281.15, −183.80) | not provided |
| 5. NNM | −210.06 | (−267.54, −152.57) | −238.52 |
| 6. PSM | −229.45 | (−280.19, −178.71) | −224.59 |

The manual RA recreation (line 308–310) prints `Manual RA estimate of ATE: -239.64 grams` — exact match with `teffects ra`.

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|---|---|---|---|---|
| 1 | Statistical correctness | LOW | line 230 (naive section) | The naive `regress bweight mbsmoke` does not include `, robust` for heteroskedasticity-robust SEs. The downstream `naive_b` / `naive_se` scalars are slightly conservative under homoskedasticity. | Add `, vce(robust)` to make the naive comparison statistically apples-to-apples with the `teffects` defaults. |
| 2 | Code quality | LOW | line 218–276 (forest-plot block) | `coefplot` was originally attempted but failed because `rename()` interacts awkwardly with `keep()` across mixed `regress` / `teffects` estimates. The `postfile`-based workaround works but lacks a comment explaining why. | Add a 1-line comment above the `postfile` block: `* coefplot's rename + keep doesn't span regress and teffects, so we collect ATE/CIs manually.` |
| 3 | Reproducibility | LOW | line 32 (top of script) | No explicit `version` statement. Cattaneo's `teffects nnmatch` random tie-breaking is seeded by `set seed 42`, but Stata-version differences can change defaults. | Optional: add `version 17.0` near the top so future Stata users get identical behavior. |
| 4 | Figure conventions | LOW | line 838 (overlap plot) | The `teffects overlap` legend `order(1 "Non-smokers (D=0)" 2 "Smokers (D=1)")` may be ignored by some Stata versions because `teffects overlap` builds its own legend. | Cosmetic only — the produced figure is fine. Skip unless Stata complains. |

No HIGH and no MEDIUM issues.

## Positive Highlights

- **Reproducibility is solid:** `set seed 42` at line 32; manual RA decomposition matches the canned `teffects` estimate to 6 significant figures, confirming determinism.
- **Pedagogical scaffolding:** the script doesn't just call `teffects` — it shows the manual decomposition for RA and IPW so a student can see what's happening under the hood. This will translate beautifully into the blog post.
- **Estimand discipline:** every method explicitly stores both ATE (`te_*`) and ATT (`te_*_att`), and the script honestly notes that AIPW reports ATE only in Stata.
- **Naive baseline included:** `te_naive` is stored alongside the six estimators, which makes the forest plot pedagogically powerful — the visual gap between naive and adjusted estimates is the entire point of the post.
- **Colors and conventions:** RGB triplets in the figures (`"106 155 204"` = steel blue `#6a9bcc`; `"217 119 87"` = warm orange `#d97757`; `"20 20 20"` = near-black) match the site palette. Width = 2400 px (~300 dpi at typical content widths). Light theme throughout.
- **Section dividers and a final success message:** every section is delimited by `* ─── N. Section ───`, and the script ends with a visible "Script completed successfully" banner — easy to spot in the log.
- **CSV export:** `ate_estimates.csv` is created for the forest plot, which `write-results-report` and `write-post` can consume directly.

## Priority Action Items

1. **[LOW]** Add `, vce(robust)` to the naive `regress` so the naive baseline's SE is comparable to the `teffects` robust default. (1-line edit.)
2. **[LOW]** Add a one-line comment above the `postfile` forest-plot block explaining why we don't use `coefplot`. (1-line edit, improves maintainability.)
3. **[LOW] (optional)** Add `version 17.0` near the top of the script to lock the Stata behavior baseline.

None of these block the downstream pipeline (`/write-results-report`, `/write-post`, `/write-infographic`). Recommend applying #1 and #2 inline before continuing — both are trivial.
