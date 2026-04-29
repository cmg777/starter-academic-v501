# Plan: Stata Dynamic Panel Tutorial (Baum 2020 Case Study)

## Context

The user wants a **comprehensive, beginner-friendly Stata tutorial** demonstrating dynamic panel data methods through the **Thies & Baum (2020)** case study on the effect of war on economic growth. This is the **script stage** (`/project:write-script`) of the four-stage pipeline — it produces the executable do-file, log, figures, CSV exports, and supporting docs. A follow-up `/project:write-post` invocation can later turn these into the published `index.md` blog post.

**Why this case study is valuable for teaching dynamic panels:**
- A canonical applied example by Christopher F. Baum (the developer of `xtabond2`)
- Real-world unbalanced panel: 1,333 country-years (155 countries × 13 quinquennia, 1955-2015)
- Demonstrates the full Arellano-Bond GMM machinery: lagged dependent variable, multi-equation specifications, internal instruments, Hansen J / AR(2) diagnostics, long-run sum-of-coefficients post-estimation
- Substantive economic question (does war hurt GDP?) with strong policy relevance

**Two reference materials that must drive the script:**
1. `references/initialCode1.do` — Prof. Baum's original code; **every line must appear** (or be expanded) in the tutorial
2. `references/Baum 2020 The effect of war on economic growth.md` — full article text including Table 2 (the target results to reproduce) and Figure 1 (war counts over time)

The user has explicitly requested: *"use at least all of the code that is also available in the reference materials."* The plan below preserves the full 4-model `xtabond2` specification and the `ssta` long-run-effects program verbatim, then **adds** EDA, visualizations, and beginner explanations around it.

---

## Estimand & Framing

This is **observational** panel data, not an RCT. War magnitude is a continuous 0-1 scale, not a binary treatment, so ATE/ATT vocabulary does not apply directly. The estimand is:

> The **within-country dynamic effect** of war intensity on log GDP per capita, identified by Arellano-Bond GMM (first-differencing removes country fixed effects; `L(2/6)` lags of the endogenous variables serve as internal instruments).

The script will frame the methodology as:
- **Confounding control via differencing** — country-specific unobserved heterogeneity (institutions, geography, history) is removed by the first-difference transform
- **Endogeneity correction via GMM** — the lagged dependent variable is correlated with the differenced error, so deeper lags are used as instruments
- **Nickell bias avoidance** — fixed-effects regression is biased when T is small (here T ≈ 13 quinquennia per country), so Arellano-Bond is preferred

The two diagnostic tests (AR(2), Hansen J) will be presented as the validity checks the methodology requires.

---

## Deliverables

All paths under `content/post/stata_dynamic_panel/`:

| File | Purpose |
|------|---------|
| `analysis.do` | The annotated Stata script (expanded from `initialCode1.do`) |
| `analysis.log` | Full execution log produced by `log using` |
| `stata_dynamic_panel_war_count_by_year.png` | Wars per year, 1955-2015 (reproducing Figure 1 of paper) |
| `stata_dynamic_panel_war_coup_panel.png` | War & coup intensity over time (means by year) |
| `stata_dynamic_panel_gdp_distribution.png` | Log GDP per capita distribution |
| `stata_dynamic_panel_war_coef_plot.png` | War coefficients (and CIs) across the 4 models |
| `stata_dynamic_panel_longrun_effects.png` | Sum-of-War-coefficients (long-run impact) across 4 models |
| `stata_dynamic_panel_diagnostics.png` | AR(2) and Hansen J p-values for each model |
| `summary_stats.csv` | Descriptive statistics of all key variables |
| `regression_results.csv` | Coefficient table for all 4 models |
| `longrun_effects.csv` | Long-run sum-of-coefficients (point + SE + t) per model |
| `diagnostics.csv` | AR(2), Hansen J, J p-value per model |
| `catoj2.rtf` | Publication-quality `esttab` table (preserved from original code) |
| `README.md` | Auto-generated artifact inventory |
| `plan.md` | This approved scope document |

≥ 3 PNG requirement is exceeded (6 figures planned).

---

## Script Structure: `analysis.do`

The do-file follows the `stata_rct` template (header → numbered sections → end summary) and **strictly preserves every command** from `initialCode1.do`. New material is interleaved as additional numbered subsections.

```
****************************************************
* Dynamic Panel Data Analysis: War & Economic Growth
* Reproducing Thies & Baum (2020), Cato Journal
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_dynamic_panel/
*
* Dataset: CatoJ.dta (Maddison + Fraser + Systemic Peace + Freedom House)
*   1,333 country-years, 155 countries, every 5 years 1955-2015
*
* Method: Arellano-Bond GMM via xtabond2 (Roodman 2009)
* Original code by Prof. Christopher F. Baum.
****************************************************

*--- Section 1: Setup --------------------------------
clear all
set more off
set seed 42
capture log close
log using "analysis.log", replace text
cls

*--- Section 2: Install dependencies -----------------
capture ssc install xtabond2
capture ssc install estout
capture ssc install outreg2
capture ssc install coefplot
capture net install tsg_schemes, from("...") replace

*--- Section 3: Import data --------------------------
use "https://github.com/quarcs-lab/data-open/raw/master/panel/CatoJ.dta", clear
describe
sum
sum cty Year DemocIndxLag PolitFreeLag EconFreeLag

*--- Section 4: Clean missing-as-zero codes ----------
* Reason: lag-prefixed variables encode unavailable obs as 0
mvdecode DemocIndxLag PolitFreeLag EconFreeLag, mv(0)
sum DemocIndxLag PolitFreeLag EconFreeLag

*--- Section 5: Label key variables ------------------
lab var lnGDPpercapita lnGDPpc
lab var EconFreeLag    L.EconFreedom
lab var PolitFreeLag   L.PolitFreedom

*--- Section 6: Exploratory data analysis ------------
* 6.1 Descriptive statistics (export to CSV)
estpost sum lnGDPpercapita War Coup EconFreeLag PolitFreeLag, detail
esttab using "summary_stats.csv", replace cells(...) 

* 6.2 Figure: war prevalence over time
preserve
collapse (mean) War Coup, by(Year)
twoway (line War Year, lcolor("106 155 204") lwidth(thick)) ///
       (line Coup Year, lcolor("217 119 87") lwidth(thick)), ///
       title("Mean War & Coup Intensity by Year, 1955-2015") ...
graph export "stata_dynamic_panel_war_coup_panel.png", replace width(2400)
restore

* 6.3 Figure: count of countries with war > 0 by year (paper Figure 1 analogue)
preserve
gen war_active = War > 0 & !missing(War)
collapse (sum) war_active, by(Year)
twoway bar war_active Year, fcolor("106 155 204") ...
graph export "stata_dynamic_panel_war_count_by_year.png", replace width(2400)
restore

* 6.4 Figure: log GDP per capita distribution
histogram lnGDPpercapita, fcolor("106 155 204%70") ...
graph export "stata_dynamic_panel_gdp_distribution.png", replace width(2400)

*--- Section 7: Long-run effects program (ssta) ------
* PRESERVED VERBATIM from initialCode1.do lines 36-51
prog ssta, rclass
qui {
nlcom (_b[War]+_b[L.War]+_b[L2.War])
mat b = r(b)
mat v = r(V)
estadd scalar SSwar   = b[1,1]
estadd scalar SSwarSE = sqrt(v[1,1])
estadd scalar SSwarT  = b[1,1]/sqrt(v[1,1])
nlcom (_b[Coup]+_b[L.Coup])
mat b = r(b)
mat v = r(V)
estadd scalar SScoup   = b[1,1]
estadd scalar SScoupSE = sqrt(v[1,1])
estadd scalar SScoupT  = b[1,1]/sqrt(v[1,1])
}
end
loc addss SSwar SSwarSE SSwarT SScoup SScoupSE SScoupT
mata: mata set matafavor speed, perm

*--- Section 8: Declare panel structure --------------
xtset cty Year, delta(5)
xtdescribe

*--- Section 9: Dynamic panel regressions (4 models) -
* PRESERVED VERBATIM from initialCode1.do lines 60-76
eststo clear
* Model 1: war + coup, no institutional controls
eststo: xtabond2 L(0/1).lnGDPpercapita L(0/2).War L(0/1).Coup i.Year, ///
        gmm(lnGDPpercapita War Coup, lag(2 6)) iv(L(0/2).War L(0/1).Coup) ///
        iv(i.Year) noleveleq robust twostep
ssta
* Model 2: + economic freedom
eststo: xtabond2 ... EconFreeLag ... 
ssta
* Model 3: + political freedom
eststo: xtabond2 ... PolitFreeLag ...
ssta
* Model 4: full specification
eststo: xtabond2 ... EconFreeLag PolitFreeLag ...
ssta

*--- Section 10: Publication table -------------------
* PRESERVED VERBATIM from initialCode1.do lines 79-82
esttab, lab star(* 0.1 ** 0.05 *** 0.01) ///
        indicate(Quinquennia effects = *.Year) ///
        stat(N N_g `addss' hansen hansen_df hansenp, ...) ///
        ti("Dynamic panel data estimates of log GDP per capita") nomti
esttab using catoj2.rtf, replace ...
* Also export coefficients as CSV
esttab using "regression_results.csv", replace ...

*--- Section 11: Coefficient and long-run plots ------
coefplot (est1, label("Model 1")) (est2, label("Model 2")) ///
         (est3, label("Model 3")) (est4, label("Model 4")), ///
         keep(War L.War L2.War) xline(0, lcolor("217 119 87")) ...
graph export "stata_dynamic_panel_war_coef_plot.png", replace width(2400)

* Long-run effects bar chart (extract from e(SSwar), e(SSwarSE) per model)
* Build small dataset from stored estimates -> twoway bar with rcap CIs
graph export "stata_dynamic_panel_longrun_effects.png", replace width(2400)

*--- Section 12: Diagnostic test summary -------------
* Extract AR(2) and Hansen J p-values from each model
graph export "stata_dynamic_panel_diagnostics.png", replace width(2400)

*--- Section 13: Export tabular results --------------
* longrun_effects.csv, diagnostics.csv

*--- End ---------------------------------------------
display "=== Script completed successfully ==="
log close
```

**Key preservation guarantees:**
- The `ssta` program (lines 36-51 of `initialCode1.do`) is copied verbatim
- All 4 `xtabond2` specifications (lines 63, 67, 71, 75) are copied verbatim — same lags, same instrument blocks (`gmm(... lag(2 6)) iv(...) noleveleq robust twostep`), same variable order
- The `esttab` to `catoj2.rtf` (line 82) is preserved verbatim
- The `mvdecode` recoding step (line 27) is preserved
- The `xtset cty Year, delta(5)` step (line 57) is preserved
- The `lab var` block (lines 31-33) is preserved

Beginner-friendly **additions** (not in the original):
- A pre-section comment block explaining the **estimand** and what Arellano-Bond actually does
- Inline comments before each `xtabond2` option explaining what `gmm()`, `iv()`, `noleveleq`, `twostep`, and `robust` mean
- A pre-`ssta` comment explaining why the long-run sum is `_b[War]+_b[L.War]+_b[L2.War]` (the post-shock total impact across the three quinquennia)
- EDA section (entirely new) with descriptive stats and 3 visualizations
- Diagnostic interpretation section (extracts AR(2) and Hansen J into a digestible plot)
- CSV exports for downstream consumption (none in original)

---

## Critical Files to Read/Reuse

- **Reference materials** (must drive content):
  - `content/post/stata_dynamic_panel/references/initialCode1.do` — lift verbatim
  - `content/post/stata_dynamic_panel/references/Baum 2020 The effect of war on economic growth.md` — Table 2 is the target output, Figure 1 is the analogue for `war_count_by_year`
- **Style template** (mirror header, section dividers, end-banner, link-block):
  - `content/post/stata_rct/analysis.do`
- **Skill convention reference**:
  - `.claude/skills/write-script/SKILL.md`
- **Site palette** (used in all `twoway` graphs):
  - Steel blue `106 155 204` (rgb of `#6a9bcc`)
  - Warm orange `217 119 87` (rgb of `#d97757`)
  - Near black `20 20 19` (rgb of `#141413`)
  - Teal `0 212 200` (rgb of `#00d4c8`)

---

## Execution & Verification

**Execution command** (from inside `content/post/stata_dynamic_panel/`):
```
stata-mp -b do analysis.do
# or, if stata-se is available:
stata-se -b do analysis.do
```

The `-b` flag runs in batch mode and writes a `analysis.log`. If Stata is not on PATH, the user will be told to run the do-file manually and report back.

**Verification checklist (post-run):**
1. `analysis.log` ends with `=== Script completed successfully ===`
2. No `r(####)` errors in the log (grep for `^r(`)
3. All 6 PNG files exist with width 2400
4. All 4 CSVs exist (`summary_stats.csv`, `regression_results.csv`, `longrun_effects.csv`, `diagnostics.csv`)
5. `catoj2.rtf` exists
6. Coefficients in `regression_results.csv` reproduce **Table 2** of Baum (2020) within rounding tolerance:
   - Model 1: War coef ≈ -0.219, L.lnGDPpercapita ≈ 0.679, N=1,187, N_g=155
   - Model 4: War coef ≈ -0.160, L.lnGDPpercapita ≈ 0.619, N=821, N_g=137
7. Long-run War sum-effect in Model 1 ≈ -0.353 (s.e. 0.0787)
8. AR(2) and Hansen J p-values fall in the ranges Baum reports (Hansen p > 0.07 for all four)
9. `README.md` lists every artifact

If any coefficient deviates by more than ~5% from Baum's published Table 2, the script is broken — investigate before reporting completion.

---

## Out of Scope (for this `/write-script` invocation)

- The blog-post `index.md` (would be produced by a follow-up `/project:write-post`)
- A results report (`/project:write-results-report`)
- An infographic (`/project:write-infographic`)
- Featured image (`featured.webp`) — per skill convention, no `featured.png` is generated by `write-script`
