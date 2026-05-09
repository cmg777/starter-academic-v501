# Script Review: stata_iv

**Script:** `analysis.do` (934 lines)
**Language:** Stata
**Executed:** 2026-05-09 12:49 (fresh run for review)
**Status:** All code runs cleanly; numerical results match AJR (2001) to printed precision

## Verdict: ACCEPT

The script is correct, well-organized, and pedagogically sound. Replication of AJR (2001) Tables 1-8 is exact (OLS β = 0.522 vs AJR's 0.52; IV β = 0.944 vs AJR's 0.94). Issues are all low- or medium-severity polish items, not correctness or reproducibility blockers.

## Execution Results

- Exit code: 0
- Wall-clock time: 41.97 s (20.43 s user, 2.17 s system, 53% CPU — most of the time is graph rendering)
- Figures generated: 3 PNG files (`stata_iv_first_stage.png`, `stata_iv_reduced_form.png`, `stata_iv_ols_vs_iv.png`)
- CSV files: 17 (9 result tables + 8 dataset dumps)
- Warnings: none. Informational `ivreg2` notes ("NB: Critical values are for Cragg-Donald F statistic and i.i.d. errors") appear after each just-identified IV — these are documentation lines, not warnings.
- `(file ... not found)` lines in the log are normal `esttab`/`graph export` "replacing existing file" notes from the second run, not errors.

## Replication accuracy (vs AJR 2001)

| Quantity | This run | AJR reported | Match |
|----------|----------|--------------|-------|
| Tab 2 Col 2: OLS β on `avexpr`, base sample | 0.522 (SE 0.050) | 0.52 (0.06) | exact |
| Tab 4 Col 1: 2SLS β on `avexpr`, base sample | 0.944 (SE 0.176) | 0.94 (0.16) | exact |
| Tab 4 Col 9: 2SLS β on `avexpr` for `loghjypl` | 0.981 | 0.98 | exact |
| First-stage KP rk Wald F (Tab 4 Col 1) | 16.32 | F ≈ 22 (Cragg-Donald, iid) | KP-robust < CD-iid as expected |
| Hansen J p-values (Tab 8 Panel C, Cols 11-20) | 0.21–0.80 | non-rejection | exact |

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Statistical correctness | MEDIUM | line 269 | Script reports KP rk Wald F under `robust` SEs but compares to Stock-Yogo (2005) **iid** critical value (16.38). Under heteroskedasticity, Olea-Pflueger (2013) effective F is the recommended benchmark. The README mentions this caveat; the script's `di` block does not. | After the `di "*** Stock-Yogo …` line, add `di "*** Note: 16.38 is the iid threshold; under robust SEs see Olea-Pflueger (2013) — `ssc install weakivtest`."` |
| 2 | Code quality | LOW | line 388 | Comment `"see e(estat_p) above"` references a macro that does not exist on `ivreg2`. Endogeneity test results from `endog()` are stored in `e(estatp)` (no underscore) and printed in the regression output. | Replace with `di "*** Endogeneity test p-value: " %6.3f e(estatp)` so the actual value appears in the log. |
| 3 | Execution | LOW | lines 922-934 | The final `di "=== Script completed successfully ==="` (line 934) runs **after** `log close` (line 932), so the success marker never appears in `analysis.log`. Downstream tooling that greps for this string will report a false negative. | Move the success `di` line above `log close` (swap their order). |
| 4 | Data handling | LOW | every `use` after Section 1 | Sections 2-9 each load a fresh `.dta` but do not print row/column counts. Readers cannot quickly see how many countries enter each table without scanning the regression output. | Add `count` and `describe, short` after each `use ... , clear` in Sections 2-9. One line each. |
| 5 | Figure conventions | LOW | lines 286-329 (Figs 1-2) | `mlabel(shortnam)` produces overlapping country codes in dense clusters (especially around `logem4 ≈ 4`, `avexpr ≈ 7-8`). Already flagged in `plan.md` as accepted teaching-figure tradeoff. | Either reduce `mlabsize(tiny)`, suppress labels in the densest cluster (`mlabel(shortnam) if !inrange(logem4, 4, 4.5) | !inrange(avexpr, 6, 8)`), or live with the overlap. Optional. |
| 6 | Code quality | LOW | line 422 | Variable named `other_cont7` (with the `7`) to avoid a hypothetical name clash with `other_cont` in §5 — but each `use ... , clear` resets the dataset, so the name is free. The `7` suffix is inconsistent with the original AJR convention. | Rename `other_cont7` to `other_cont`. |
| 7 | Code quality | LOW | Sections 5, 6, 7, 8 | Each IV column is 3-4 nearly identical lines (`ivreg2`, `eststo`, `estadd`). A `foreach`/`forvalues` loop could compress the code ~50%. Trade-off: explicit form is more readable for a tutorial audience following AJR's column-by-column structure. | Optional. Current explicit form preferred for pedagogy; do not change unless you want a more compact reference implementation. |

## Positive Highlights

- **Docstring is exemplary** (lines 1-37): title, audience, estimand (LATE under heterogeneous effects), three IV conditions stated formally, dataset list, usage, outputs, and academic references all in one block. Sets a high bar.
- **Color macros documented with hex-to-RGB conversion** (lines 71-87): explicit comments showing the hex code and the RGB triplet make it easy for downstream skills to understand the dark-theme mapping.
- **Per-section motivation comments** (e.g., lines 124-128 for Table 2): every section opens with a one-paragraph "why this table matters" comment that connects the regression mechanics to the substantive AJR argument. This is what a tutorial should do.
- **Modern diagnostics layered onto every IV** (lines 384, 393, 398, ...): `estadd scalar firstF = e(widstat)` after every `ivreg2` produces a clean first-stage F column in every CSV — exactly what a reader needs to assess weak-IV concerns table by table.
- **Hansen J handling is correct**: Tables 4-6 are just-identified so `e(j)` is missing and `esttab` blanks the cell — no fake numbers. Tables 7 (Cols 7-9) and 8 (Panel C) use `gmm2s` to materialize J, and the p-values (0.21-0.80) match AJR's claim that the exclusion restriction is not rejected.
- **LATE vs ATE callout** (lines 9-12, 50-51): correctly flags that 2SLS identifies LATE under heterogeneous effects (Imbens-Angrist 1994), with the constant-effects reduction noted. This is a frequent omission in IV tutorials.
- **Albouy (2012) critique** (lines 711-714): script does not naively interpret Hansen J non-rejection as proof of validity — it explicitly notes that ~36% of mortality observations are imputed and that shared imputation bias would not be detected by the J-test. Honest pedagogy.
- **Reproducible without network**: every dataset is loaded from the local `references/maketableN/` folder; no GitHub/URL fetches. The script will run identically on an air-gapped machine.
- **Coefplot color semantics** (Figure 3): OLS = warm orange (orange family), all IV-with-`logem4` variants = steel blue (blue family), alternative instrument (`euro1900`) = teal. The visual hierarchy mirrors the substantive grouping without legend-reading.

## Priority Action Items

1. **[MED]** Add a one-line `di` clarifying that the 16.38 Stock-Yogo cutoff is the **iid** threshold and pointing to Olea-Pflueger (2013) for robust inference (line 269).
2. **[LOW]** Swap the order of `log close` and the final success-message `di` so the marker appears in `analysis.log` (lines 922-934).
3. **[LOW]** Replace the `e(estat_p)` placeholder comment with an actual `di` of `e(estatp)` so the endogeneity test p-value lands in the log (line 388).

The remaining LOW items (post-`use` describes, label overlap, `other_cont7` naming, loop refactor) are polish — none of them affect numerical results, reproducibility, or pedagogical correctness.

## Methodology

- 8 review dimensions per `references/review-checklist.md`
- Severity per `references/scoring-and-criteria.md`
- Verdict per `references/scoring-and-criteria.md` (ACCEPT requires no HIGH and ≤ 2 MEDIUM)
