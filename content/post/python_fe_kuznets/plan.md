# Plan: Python Script for Regional Inequality & Kuznets Curve Tutorial

## Context

Carlos has a research paper (Lessmann & Seidel) and three Stata `.do` scripts that analyze the relationship between regional inequality (Gini) and national development (GDP per capita) across 180 countries (1992-2012). The goal is to create a comprehensive Python tutorial script that:

1. Replicates the Stata analysis using **PyFixest** for fixed effects estimation
2. Uses **Great Tables** for publication-quality regression tables
3. Teaches first-time econometrics students about panel data and fixed effects
4. Follows the site's write-script skill conventions (dark theme, site colors, sandwich pattern)

**Research finding:** The relationship is N-shaped (not inverted-U): inequality rises with early development, falls during middle-income growth, then rises again at very high incomes.

---

## Datasets

Two Stata `.dta` files from `https://github.com/quarcs-lab/data-open/raw/master/pGDP/`:

| File | Variables | Purpose |
|------|-----------|---------|
| `simpleTAB03.dta` | gini, log_GDPpc, log_GDPpc2, log_GDPpc3, year, id | Kuznets curve (Table 3) |
| `simpleTAB04.dta` | gini, lnGDPpc, lnGDPpc2, lnGDPpc3, rents, land, trade, fdi, gasoline, areaXgasoline, aid, school, ethnic_gini, year, id | Determinants (Table 4) |

Note: Variable naming differs between datasets (`log_GDPpc` vs `lnGDPpc`). Panel: ~180 countries, 5-year period averages, unbalanced, clustered SEs at country level.

---

## Script Structure (`content/post/python_fe_kuznets/script.py`)

### Section 0: Setup
- Docstring, imports (`pyfixest`, `great_tables`, `pandas`, `numpy`, `matplotlib`)
- Color palette (STEEL_BLUE, WARM_ORANGE, NEAR_BLACK, TEAL + dark theme)
- `RANDOM_SEED = 42`, `plt.rcParams` dark theme block
- Follow `python_pyfixest/script.py` setup pattern exactly

### Section 1: Data Loading & Exploration
- Load both `.dta` files via `pd.read_stata()` from GitHub URLs
- Print shape, dtypes, `.describe()`, missing values, panel structure
- Print balance check (obs per year, countries per year)
- **CSV:** `kuznets_summary_stats.csv`

### Section 2: Visual Exploration
- **Figure 1** `kuznets_scatter_pooled.png`: Scatter of gini vs log_GDPpc (all obs pooled), with 3 overlaid fit lines (linear dashed, quadratic dashed, cubic solid) to visually introduce the Kuznets hypothesis
- **Figure 2** `kuznets_scatter_by_period.png`: Faceted scatter by time period showing the pattern is stable across periods
- **CSV:** `kuznets_period_means.csv`

### Section 3: Pooled OLS — Linear, Quadratic, Cubic
- 3 pooled OLS models using `pf.feols()` with `vcov={"CRV1": "id"}`
- Print summaries for each
- **Pedagogical focus:** Explain polynomial regression intuitively — "What if the relationship bends? What if it bends twice?"
- **CSV:** `kuznets_pooled_ols.csv`

### Section 4: Why Fixed Effects? — Omitted Variable Bias
- **Figure 3** `kuznets_spaghetti.png`: Line plot of 15-20 selected country trajectories (gini vs log_GDPpc over time) showing within-country variation differs from cross-sectional pattern
- Explain: pooled OLS mixes between-country and within-country variation; FE isolates the within-country story

### Section 5: Two-Way Fixed Effects — Table 3 Replication
- 3 TWFE models using `pf.feols("gini ~ ... | id + year", vcov={"CRV1": "id"})`
- Demonstrate PyFixest's stepwise `csw0()` syntax as an alternative
- Print summaries, compare with pooled OLS
- **CSV:** `kuznets_twfe_results.csv`

### Section 6: Publication Table 3 (Great Tables)
- Build professional regression table matching Stata `esttab` output from `sampleCode2.do`
- Use `GT()` with `.tab_header()`, `.fmt_number()`, `.tab_source_note()`, significance stars
- **Table** `kuznets_table3.png`
- **CSV:** `kuznets_table3_data.csv`

### Section 7: Interpreting the N-Shaped Curve — Turning Points
- Compute turning points from cubic coefficients: solve d(gini)/d(ln_GDP) = 0
- Use `np.roots([3*b3, 2*b2, b1])` then `np.exp()` to convert to USD
- Expected: peak ~$2,288, trough ~$77,128
- **Figure 4** `kuznets_fitted_curve.png`: Fitted N-shaped polynomial with turning points marked, shaded regions (rising/falling/rising), USD annotations on secondary x-axis, country labels at representative positions
- **CSV:** `kuznets_turning_points.csv`

### Section 8: Pooled OLS vs TWFE Comparison
- **Figure 5** `kuznets_ols_vs_fe.png`: Coefficient plot comparing pooled OLS vs TWFE cubic model with 95% CI
- **CSV:** `kuznets_ols_vs_fe_comparison.csv`

### Section 9: Determinants Dataset EDA
- Load `simpleTAB04.dta`, print summary stats
- **Figure 6** `kuznets_correlation_heatmap.png`: Correlation matrix for all determinant variables
- **CSV:** `kuznets_determinants_summary.csv`

### Section 10: Determinants of Regional Inequality — Table 4 Replication
- 5 TWFE models, each adding a different group of determinants (replicating `sampleCode3.do`):
  1. Resources: `rents`, `land`
  2. Trade: `trade`, `fdi`
  3. Mobility: `gasoline`, `areaXgasoline`
  4. Aid/Education: `aid`, `school`
  5. Ethnicity: `ethnic_gini`
- All include cubic polynomial terms + country/year FE + clustered SEs
- **CSV:** `kuznets_determinants_results.csv`

### Section 11: Publication Table 4 (Great Tables)
- Professional regression table for 5 determinant models
- **Table** `kuznets_table4.png`
- **CSV:** `kuznets_table4_data.csv`

### Section 12: Coefficient Stability Across Specifications
- **Figure 7** `kuznets_coefficient_stability.png`: Show how the 3 polynomial coefficients remain stable (or not) across all 6 specifications (baseline + 5 determinants)
- Reinforces robustness of the N-shaped finding

### Section 13: Determinants Summary
- **Figure 8** `kuznets_determinants_barplot.png`: Horizontal bar chart of determinant coefficients, color-coded by sign (increases vs decreases inequality)
- **CSV:** `kuznets_determinants_effects.csv`

### Section 14: Script Completion
- Print artifact inventory (all figures, tables, CSVs)
- `print("\n=== Script completed successfully ===")`

---

## Output Inventory

### Figures (8 PNGs, dark theme, dpi=300)
| # | Filename | Content |
|---|----------|---------|
| 1 | `kuznets_scatter_pooled.png` | Scatter + 3 polynomial fits |
| 2 | `kuznets_scatter_by_period.png` | Per-period scatter facets |
| 3 | `kuznets_spaghetti.png` | Country trajectories |
| 4 | `kuznets_fitted_curve.png` | N-shaped curve with turning points |
| 5 | `kuznets_ols_vs_fe.png` | Pooled OLS vs TWFE coefficients |
| 6 | `kuznets_correlation_heatmap.png` | Determinant correlations |
| 7 | `kuznets_coefficient_stability.png` | Polynomial stability |
| 8 | `kuznets_determinants_barplot.png` | Determinant effects bar chart |

### Tables (2 PNGs via Great Tables)
| # | Filename | Content |
|---|----------|---------|
| 1 | `kuznets_table3.png` | 3-model Kuznets curve (linear/quad/cubic TWFE) |
| 2 | `kuznets_table4.png` | 5-model determinants |

### CSVs (inline after each section)
`kuznets_summary_stats.csv`, `kuznets_period_means.csv`, `kuznets_pooled_ols.csv`, `kuznets_twfe_results.csv`, `kuznets_table3_data.csv`, `kuznets_turning_points.csv`, `kuznets_ols_vs_fe_comparison.csv`, `kuznets_determinants_summary.csv`, `kuznets_determinants_results.csv`, `kuznets_table4_data.csv`, `kuznets_determinants_effects.csv`

---

## Key Pedagogical Decisions

1. **Eyes before equations**: Sections 1-2 are pure visual exploration — students see the Kuznets pattern before any regression
2. **Build complexity gradually**: Linear -> Quadratic -> Cubic, then OLS -> FE -> TWFE
3. **Motivate FE with a real problem** (Section 4): The spaghetti plot is the "aha moment" — pooled OLS conflates between/within variation
4. **Concrete turning points** (Section 7): $2,288 and $77,128 are memorable anchors that make the N-shape tangible
5. **Policy-relevant determinants** (Sections 10-13): "What can governments actually do?" — trade, education, infrastructure matter
6. **Robustness** (Section 12): Coefficient stability shows the N-shape isn't an artifact of specification

## Potential Challenges

1. **Country labels in spaghetti plot**: Dataset uses numeric `id`, not names. May need to identify countries by their GDP range or create a manual mapping for key examples
2. **Great Tables PNG rendering**: Requires Chrome/webdriver. Add try/except fallback to CSV if rendering fails (following `python_did101` pattern)
3. **Turning point edge cases**: If cubic coefficients yield complex roots in some specs, wrap in try/except
4. **Do NOT generate `featured.png`** — user adds this manually (per project memory)

## Critical Reference Files

- `content/post/python_fe_kuznets/sampleCode1.do` — EDA and model progression
- `content/post/python_fe_kuznets/sampleCode2.do` — Table 3 (Kuznets curve TWFE)
- `content/post/python_fe_kuznets/sampleCode3.do` — Table 4 (determinants)
- `content/post/python_fe_kuznets/references/manuscript0.tex` — Full paper
- `content/post/python_pyfixest/script.py` — PyFixest patterns and dark theme setup
- `content/post/python_did101/script.py` — Great Tables patterns

## Verification

1. Run `cd content/post/python_fe_kuznets/ && python3 script.py 2>&1 | tee execution_log.txt`
2. Confirm exit code 0 and "Script completed successfully" in log
3. Verify 8+ PNG figures generated (dark theme, dpi=300)
4. Verify 2 GT table PNGs generated
5. Verify all CSV files exported
6. Verify no `featured.png` generated
7. Spot-check turning points against paper values (~$2,288 and ~$77,128)
8. Spot-check Table 3 coefficients against Stata output
