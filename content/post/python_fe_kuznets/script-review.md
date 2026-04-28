# Script Review: python_fe_kuznets

**Script:** `script.py` (1163 lines)
**Language:** Python
**Executed:** 2026-04-28
**Status:** All code runs

## Verdict: MINOR REVISION

Strong, well-structured script that successfully replicates the Lessmann & Seidel (2017) findings. Turning points ($2,287 / $77,205) and cubic TWFE coefficients (0.293 / -0.032 / 0.001) match the paper. Four MEDIUM issues to address: dead code, no data caching, a matplotlib warning, and a vestigial loop.

## Execution Results

- Exit code: 0
- Figures generated: 10 PNG files (8 figures + 2 Great Tables)
- CSV exports: 11 files
- Warnings (non-fatal):
  - `UnicodeWarning` from `pd.read_stata()` (latin-1 fallback) -- data-specific, harmless
  - Singleton FE warnings from pyfixest -- expected for unbalanced panel
  - `OMP: Info #276: omp_set_nested deprecated` -- internal to numba
  - `set_ticklabels()` warning at line 796 -- should use `set_ticks()` first

## Issues Found

| # | Dimension | Severity | Location | Issue | Suggested fix |
|---|-----------|----------|----------|-------|---------------|
| 1 | Code quality | MEDIUM | lines 106-157 | `build_reg_table()` helper function defined (52 lines) but never called anywhere. Tables are built inline in Sections 6 and 11 instead. | Remove the unused function or refactor Sections 6 and 11 to use it. |
| 2 | Reproducibility | MEDIUM | lines 168, 186 | Data is downloaded from GitHub on every run with no local caching. Adds ~2-3 seconds and creates a network dependency. | Add a local cache pattern: `if os.path.exists("simpleTAB03.dta"): df3 = pd.read_stata("simpleTAB03.dta") else: df3 = pd.read_stata(URL_TAB03); df3.to_stata("simpleTAB03.dta")` |
| 3 | Figures | MEDIUM | line 796 | `cbar.ax.yaxis.set_ticklabels()` called without prior `set_ticks()`, producing a matplotlib `UserWarning`. | Use `cbar.ax.tick_params(labelcolor=LIGHT_TEXT)` instead, which avoids the warning entirely. |
| 4 | Code quality | MEDIUM | lines 930-931 | Dead loop: `for i, model in enumerate(det_models): pass` does nothing. Statistics are computed in the subsequent loop (lines 937-942). | Remove lines 930-931. |
| 5 | Code quality | LOW | line 143 | Extremely long and complex lambda for "N Countries" statistic. Hard to read and relies on internal pyfixest attributes. | Extract to a named function `get_n_groups(model)` with a try/except. (Note: this is inside the unused `build_reg_table()`, so removing issue #1 removes this too.) |
| 6 | Code quality | LOW | line 388 | `gdp_mean = sub["log_GDPpc"].mean()` assigned but never used. | Remove the assignment. |
| 7 | Figures | LOW | all figures | Figure naming uses `kuznets_` prefix, not `fe_kuznets_` (the slug is `python_fe_kuznets`). Minor deviation from the `<slug>_<name>.png` convention. | Keep as-is -- `kuznets_` is clear and concise. The full slug prefix would be unnecessarily long. |
| 8 | Statistical | LOW | GT tables | R-squared within (reported by pyfixest in `.summary()`) not included in Great Tables regression tables. The paper's Table 3 also omits it, so this matches the replication target. | Optional: add an R-squared within row for pedagogical value. |

## Positive Highlights

- **Exact replication**: Cubic TWFE coefficients (0.293, -0.032, 0.001) and turning points ($2,287 / $77,205) closely match the paper's Table 3 (0.293 / -0.032 / 0.001, $2,288 / $77,128).
- **Pedagogical arc**: The progression from visual EDA (scatter + spaghetti) through pooled OLS to TWFE, with explicit "why FE?" motivation in Section 4, is excellent for first-time students.
- **Great Tables integration**: Professional regression tables (Table 3 and Table 4) look publication-ready with proper significance stars, clustered SE notes, and FE indicators.
- **Dark theme consistency**: All 8 figures use the site's dark navy palette with proper `fig.patch.set_linewidth(0)` and `SAVE_KWARGS`.
- **Turning point visualization** (Figure 4): The shaded regions, dual x-axis (log + USD), and annotated turning points make the N-shape immediately tangible.
- **Coefficient stability** (Figure 7): Showing the polynomial coefficients across 6 specifications is a smart robustness check not always included in tutorials.
- **Comprehensive CSV exports**: 11 CSV files allow downstream skills to consume results without re-running the script.
- **Country names available**: The dataset includes a `country` column, which could be leveraged in the spaghetti plot for labeled highlights.

## Priority Action Items

1. **[MED]** Remove `build_reg_table()` function (lines 106-157) -- it's 52 lines of dead code that also contains the complex lambda from issue #5.
2. **[MED]** Add local data caching to avoid re-downloading on each run (lines 168, 186).
3. **[MED]** Fix colorbar tick label warning by replacing line 796 with `cbar.ax.tick_params(labelcolor=LIGHT_TEXT)`.
4. **[MED]** Remove dead loop at lines 930-931.
5. **[LOW]** Remove unused `gdp_mean` variable at line 388.
6. **[LOW]** Consider using country names from the `country` column in the spaghetti plot legend instead of numeric IDs (e.g., "Afghanistan" instead of "Country 1").
