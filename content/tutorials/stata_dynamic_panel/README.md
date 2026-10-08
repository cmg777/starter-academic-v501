# Dynamic Panel Data Analysis: War & Economic Growth

Companion artifacts for the Stata tutorial reproducing **Thies & Baum (2020)**, *The Effect of War on Economic Growth* (Cato Journal 40:1).

The script estimates the within-country dynamic effect of war intensity on log GDP per capita using **Arellano-Bond GMM** (`xtabond2`) on a panel of 155 countries observed every 5 years from 1955 to 2015.

## How to run

From this directory:

```sh
stata-se -b do analysis.do
```

The do-file installs all required packages (`xtabond2`, `estout`, `outreg2`, `coefplot`) on first run and writes a full execution log to `analysis.log`.

## Artifacts

### Source

| File | Description |
|------|-------------|
| `index.md` | Notebook-style blog post (15 sections, 6 figures, 6 equations, 1 Mermaid diagram). |
| `infographic_instructions.md` | Chalkboard-style AI image-generation prompt (full prompt + negative prompt + 302-word condensed variant + 6-panel reference data). |
| `analysis.do` | Annotated Stata do-file. Section 1-13: setup, dependencies, import, clean, label, EDA, `ssta` long-run program, `xtset`, four `xtabond2` regressions, regression table, coefficient plot, long-run plot, diagnostic plot. |
| `analysis.log` | Full Stata execution log (text). Ends with `=== Script completed successfully ===`. |
| `execution_log.txt` | Copy of `analysis.log` consumed by the results report. |
| `plan.md` | Approved scope/design document. |
| `script-review.md` | Quality review of `analysis.do` against 8 dimensions (verdict, issues, action items). |
| `results_report.md` | Structured interpretation of every result with raw output blocks, 7 key findings, and surprises/caveats. |
| `results_report_review.md` | Quality review of `results_report.md` against 6 dimensions (verdict, accuracy spot-checks, issues, action items). |
| `references/` | Source materials: Prof. Baum's original `initialCode1.do` and the markdown of the Thies & Baum (2020) Cato Journal article. |

### Figures (PNG, width 2400)

| File | Description |
|------|-------------|
| `stata_dynamic_panel_war_count_by_year.png` | Number of countries with active war by year, 1955-2015 (analogue of paper's Figure 1). |
| `stata_dynamic_panel_war_coup_panel.png` | Mean War & Coup intensity by year, 1955-2015. |
| `stata_dynamic_panel_gdp_distribution.png` | Distribution of log GDP per capita across all country-years. |
| `stata_dynamic_panel_war_coef_plot.png` | War, L.War, L2.War coefficients with 95% CIs across the four models. |
| `stata_dynamic_panel_longrun_effects.png` | Sum of contemporaneous + L1 + L2 War coefficients (long-run effect) per model, with 95% CIs. |
| `stata_dynamic_panel_diagnostics.png` | AR(2) and Hansen J p-values per model; reference line at 0.05. |

### Tables (CSV / RTF)

| File | Description |
|------|-------------|
| `summary_stats.csv` | N, mean, SD, min, median, max for `lnGDPpercapita`, `War`, `Coup`, `EconFreeLag`, `PolitFreeLag`. |
| `regression_results.csv` | Coefficients, t-stats, significance, sum-of-coefficients statistics, Hansen J for all four models. |
| `longrun_effects.csv` | Per model: sum of War & Coup coefficients with standard errors and 95% CIs. |
| `diagnostics.csv` | Per model: AR(2) p-value, Hansen J statistic, df, p-value. |
| `catoj2.rtf` | Publication-quality RTF version of the regression table (preserved from Prof. Baum's original code). |

## Reproduction check

The estimates reproduce **Table 2** of Thies & Baum (2020):

| Model | War coef | L.lnGDPpc | N | N. countries | Sum War | s.e. War |
|-------|----------|-----------|---|--------------|---------|----------|
| 1 | -0.219*** | 0.679*** | 1,187 | 155 | -0.353 | 0.0787 |
| 2 | -0.239*** | 0.666*** | 987 | 137 | -0.271 | 0.0741 |
| 3 | -0.159*** | 0.632*** | 918 | 151 | -0.224 | 0.0751 |
| 4 | -0.160*** | 0.619*** | 821 | 137 | -0.166 | 0.0759 |

All four models pass the AR(2) and Hansen J overidentification tests (p > 0.05).

## Citation

Thies, C. F., and Baum, C. F. (2020). "The Effect of War on Economic Growth." *Cato Journal* 40 (1). DOI: 10.36009/CJ40.1.10
