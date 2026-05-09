# Plan: AJR (2001) Replication — Stata IV Tutorial for Development Economics

## Context

Build a graduate-level Stata tutorial in `content/post/stata_iv/` that replicates **Acemoglu, Johnson & Robinson (2001) "The Colonial Origins of Comparative Development"** while teaching the **instrumental-variables method** to students of development economics.

**Why this post:** AJR is the canonical IV paper in development economics. The post folder already contains the full replication package (`AJR manuscript.md` + `maketable1`–`maketable8` data and do-files) but no analysis.do or tutorial yet. This plan implements **Phase 1 (script generation)** of the data-science-post pipeline. Downstream: `/project:write-results-report` then `/project:write-post`.

**Voice:** expert professor in causal inference; explains the *why* of IV (the three identification conditions, LATE interpretation, weak-instrument concerns) using AJR's institutions–GDP question as the running example.

**Confirmed scope (user-approved via 8 questions):**

| Decision | Choice |
|----------|--------|
| Replication scope | Full (Tables 1-8) |
| IV command | `ivreg2` (SSC) only |
| Result formatter | `esttab` + CSV |
| Theme | Dark navy figures |
| Audience | Grad / advanced undergrad |
| Data handling | Use each `references/maketableN/maketableN.dta` per section (mirror originals) |
| Diagnostics | Weak-IV F + Stock-Yogo, Hausman, Hansen J (Tab 8), Albouy (2012) callout, LATE vs ATE |
| Manuscript framing | Explore agent extracted intro + identification strategy (already done) |

## Approved scope block (from skill)

```
1. TOPIC: Instrumental Variables — replicating AJR (2001) "Colonial Origins of
   Comparative Development" using settler mortality as an instrument for
   institutions in a cross-section of ~64 ex-colonies.
   Analysis question: "Do better institutions cause higher GDP per capita?
   Identify the causal effect using settler mortality as an instrument."

2. LANGUAGE: Stata — required by the user; reference data are .dta files;
   audience is dev-econ grad students who use Stata.

3. FIGURE THEME: Dark navy — user-confirmed for visual consistency with
   python_fwl, python_pyfixest. Hex values converted to Stata RGB triplets
   in preamble (Stata color() takes "R G B" strings, not hex).

4. SCRIPT SECTIONS:
   - 0. Preamble (deps, log, globals, dark-theme color macros, estimand block)
   - 1. Table 1 — Summary statistics (whole world / base / quartiles)
   - 2. Table 2 — OLS regressions (motivation: why naive estimates fail)
   - 3. Table 3 — Determinants of institutions (preview of first stage)
   - 4. Figures 1 & 2 — first-stage and reduced-form scatters
   - 5. Table 4 — Main IV result + weak-IV F + Hausman endogeneity
   - 6. Table 5 — IV with colonial / legal / religion controls
   - 7. Table 6 — IV with geography / climate robustness
   - 8. Table 7 — Health channels (overidentified specs → first Hansen J)
   - 9. Table 8 — Alternative instruments + overidentification (Hansen J)
   - 10. Figure 3 — coefplot of `avexpr` across specifications (OLS vs IV)
   - 11. Closing summary
   Estimated: 3 PNG figures, ~10 CSV tables, ~9 dataset CSVs.

5. DELIVERABLES:
   - analysis.do
   - analysis.log
   - 3 PNG figures (stata_iv_first_stage / _reduced_form / _ols_vs_iv)
   - ~10 result CSVs + ~9 dataset CSVs
   - README.md (artifact inventory)
   - plan.md (this scope document)

6. FRAMING: Causal — point estimate is the LATE (Imbens-Angrist) for
   compliers under heterogeneous effects. Comment block in §0 states the
   estimand and the three IV conditions (relevance, exclusion, exogeneity).
   Albouy (2012) critique flagged in §9.

7. AMBIGUITY: None remaining after Q&A.

Proceed? Pending ExitPlanMode.
```

## Critical files

**Read before implementing:**
- `content/post/stata_iv/references/maketable1.do` … `maketable8.do` — original AJR replication (mirror their column ordering)
- `content/post/stata_iv/references/AJR manuscript.md` — already summarized; quotes available for §0 docstring
- `content/post/stata_rct/analysis.do` — reference Stata pattern (logging, sections, ssc installs, graph export)
- `.claude/skills/write-script/references/figure-conventions.md` — dark-theme palette
- `.claude/skills/write-script/references/script-templates.md` — Stata template (clear all / set seed / log using / sections)

**Will create:**
- `content/post/stata_iv/analysis.do`
- `content/post/stata_iv/analysis.log`
- `content/post/stata_iv/stata_iv_first_stage.png`
- `content/post/stata_iv/stata_iv_reduced_form.png`
- `content/post/stata_iv/stata_iv_ols_vs_iv.png`
- `content/post/stata_iv/tab1_summary.csv` … `tab8_overid.csv`
- `content/post/stata_iv/data_maketable1.csv` … `data_maketable8.csv`
- `content/post/stata_iv/README.md`
- `content/post/stata_iv/plan.md` (mirror of this plan, archived in post folder per skill protocol)

## Implementation sketch — `analysis.do`

### §0. Preamble
- `clear all`, `set more off`, `set seed 42`, `capture log close`
- `log using "analysis.log", text replace`
- `capture ssc install ivreg2`, `ranktest`, `estout`, `coefplot` (idempotent)
- Globals:
  - `global REF "references"` (relative; cd into post folder before running)
  - `global Y logpgp95`, `global X avexpr`, `global Z logem4`
- **Dark-theme color macros** (hex → Stata RGB):
  - `local DARK_NAVY  "15 23 41"`   (#0f1729)
  - `local GRID_LINE  "31 43 94"`   (#1f2b5e)
  - `local STEEL_BLUE "106 155 204"` (#6a9bcc)
  - `local WARM_ORANGE "217 119 87"` (#d97757)
  - `local TEAL       "0 212 200"`  (#00d4c8)
  - `local LIGHT_TEXT "200 208 224"` (#c8d0e0)
  - `local WHITE_TEXT "232 236 242"` (#e8ecf2)
- **Estimand block (comment + `di` echo):** state that 2SLS identifies a **LATE** (Imbens-Angrist 1994) for the subpopulation of country-pairs whose institutional quality would *change* in response to settler-mortality variation; under constant treatment effects LATE = ATE. List the **3 IV conditions**: (i) relevance — `cov(Z, X) ≠ 0`; (ii) exclusion — `Z` enters outcome only through `X`; (iii) exogeneity — `Z ⊥ U`.

### §1. Table 1 — Summary stats (`maketable1.dta`)
- `use "${REF}/maketable1/maketable1.dta", clear` (~163 obs world; ~64 base sample)
- `summarize logpgp95 loghjypl avexpr cons00a cons1 democ00a euro1900` for whole world; then for `baseco==1`; then by mortality quartile (replicate original `egen rank/count` block)
- `estpost summarize`; `esttab using tab1_summary.csv, csv replace cells("mean(fmt(2)) sd(fmt(2)) min max count")`
- `export delimited using data_maketable1.csv, replace`

### §2. Table 2 — OLS (`maketable2.dta`)
- 8 columns: OLS of `logpgp95` (and `loghjypl`) on `avexpr` with samples / latitude / continent dummies
- `regress … , robust` per col; `eststo m2_c1` … `m2_c8`
- `esttab m2_c* using tab2_ols.csv, csv replace b(3) se(3) star(* 0.10 ** 0.05 *** 0.01) stats(N r2)`
- Comment: OLS biased by reverse causality, omitted variables, measurement error → IV needed.

### §3. Table 3 — Determinants of institutions (`maketable3.dta`)
- `keep if excolony==1 & extmort4!=.`; `replace euro1900 = euro1900/100`
- Panel A (DV `avexpr`): 10 OLS cols. Panel B (DV `cons00a`/`democ00a`/`euro1900`): 10 cols.
- Store + export `tab3a_inst.csv`, `tab3b_inst.csv`. Pedagogical comment: previews first-stage relevance.

### §4. Figures 1 & 2 — first stage + reduced form (`maketable4.dta`, `baseco==1`)
- Inline dark-theme options on every `twoway`:
  - `graphregion(color("`DARK_NAVY'")) plotregion(color("`DARK_NAVY'"))`
  - `bgcolor("`DARK_NAVY'")`, axis label colors via `xlabel(, labcolor("`LIGHT_TEXT'"))`
- **Figure 1 — first stage:** `twoway (lfit avexpr logem4, lcolor("`WARM_ORANGE'")) (scatter avexpr logem4, mcolor("`STEEL_BLUE'") mlabel(shortnam) mlabcolor("`TEAL'") mlabsize(vsmall)) , title(...) → graph export "stata_iv_first_stage.png", replace width(2400)`
- **Figure 2 — reduced form:** same with `logpgp95` on y → `stata_iv_reduced_form.png`
- After scatter, run `ivreg2 logpgp95 (avexpr=logem4) if baseco==1, first robust` and `di "First-stage F: " e(widstat)` so the figure caption can quote it.

### §5. Table 4 — main IV (`maketable4.dta`) + modern diagnostics
- 9 IV cols using `ivreg2 logpgp95 [controls] (avexpr=logem4) [if …], first robust` (mirror AJR Cols 1-9 incl. base/no-Neo-Europes/no-Africa/continent-dummies/loghjypl)
- Generate `other_cont` (AUS/MLT/NZL) per original
- `eststo m4_iv_c1` … `m4_iv_c9`
- Run paired OLS for Panel C: `regress … , robust`; `eststo m4_ols_c1` … `m4_ols_c9`
- After Col 1 IV: **`estat firststage`** (Stock-Yogo crit values to log) + **`estat endogenous`** (Durbin-Wu-Hausman test of OLS consistency); echo `e(widstat)` and Stock-Yogo 10%-maximal-IV-size critical value (16.38) to log via `di`.
- Export: `esttab m4_iv_* m4_ols_* using tab4_iv_main.csv, csv replace stats(N r2 widstat) b(3) se(3)`

### §6. Table 5 — IV with colonial / legal / religion controls (`maketable5.dta`)
- 9 IV + 9 OLS specs with `f_brit f_french sjlofr catho80 muslim80 no_cpm80`. Store `m5_*`. Export `tab5_iv_controls.csv`.

### §7. Table 6 — Geography robustness (`maketable6.dta`)
- 9 IV + 9 OLS with `temp* humid* edes1975 avelf` and resource/landlock controls. Store `m6_*`. Export `tab6_iv_geo.csv`.

### §8. Table 7 — Health channels (`maketable7.dta`) — first overidentified specs
- IV with `malfal94`, `leb95`, `imr95`. Multi-endogenous specs (Cols 7-9) instrument `(avexpr healthvar = logem4 latabs lt100km meantemp)` — **here Hansen J is meaningful**; use `ivreg2 …, gmm2s robust` and capture `e(jp)`.
- Yellow-fever instrument variants (Cols 10-11). Store `m7_*`. Export `tab7_iv_health.csv` with J-stat column.

### §9. Table 8 — Alternative instruments + overidentification (`maketable8.dta`)
- Panels A/B: 10 IV cols using `euro1900`, `cons00a`, `democ00a`, `cons1`, `democ1` as alternative instruments
- **Panel C — overidentification:** for each alt instrument, run `ivreg2 logpgp95 (avexpr = altinst logem4), gmm2s robust` → Hansen J printed natively. Document the original `hausman consistent efficient` workflow as a commented block for pedagogical contrast.
- Panel D: second-stage with `logem4` as exogenous control (relaxes exclusion).
- Store `m8a_*`–`m8d_*`. Export `tab8_overid.csv` with J-stat + p-value columns.
- **Albouy (2012) critique callout:** `di` block summarizing that ~36% of mortality observations were imputed and that overid sensitivity reflects this measurement issue — followed by the LATE-interpretation reminder.

### §10. Figure 3 — `coefplot` of `avexpr` across specs
- Models: `m4_ols_c1`, `m4_iv_c1`, `m5_iv_c1`, `m6_iv_c1`, `m7_iv_c1`, `m8a_iv_c1` (one per table baseline column).
- `coefplot (m4_ols_c1, label("OLS (Tab 2)") mcolor("`WARM_ORANGE'")) (m4_iv_c1, label("IV: logem4 (Tab 4)") mcolor("`STEEL_BLUE'")) ..., keep(avexpr) xline(0, lcolor("`LIGHT_TEXT'")) ciopts(recast(rcap) lcolor("`TEAL'")) graphregion(color("`DARK_NAVY'")) plotregion(color("`DARK_NAVY'")) bgcolor("`DARK_NAVY'") title("Effect of institutions on log GDP: OLS vs IV", color("`WHITE_TEXT'")) xlabel(, labcolor("`LIGHT_TEXT'"))`
- `graph export "stata_iv_ols_vs_iv.png", replace width(2400)`
- Comment block: visual evidence that IV ≥ OLS (consistent with AJR's measurement-error story); note the LATE interpretation and Stock-Yogo F.

### §11. Closing
- `di _newline(2)` banner with key takeaways (paper headline: IV β ≈ 0.94, OLS β ≈ 0.5, F-stat reproducibility, Hansen J non-rejection)
- `estimates clear`; `log close`

## Final artifact inventory

**PNG figures (3):**
- `stata_iv_first_stage.png` — settler mortality vs expropriation risk, base sample
- `stata_iv_reduced_form.png` — settler mortality vs log GDP per capita, base sample
- `stata_iv_ols_vs_iv.png` — coefficient comparison plot across Tables 2/4/5/6/7/8

**CSV tables (~10):**
- `tab1_summary.csv`, `tab2_ols.csv`, `tab3a_inst.csv`, `tab3b_inst.csv`, `tab4_iv_main.csv`, `tab5_iv_controls.csv`, `tab6_iv_geo.csv`, `tab7_iv_health.csv`, `tab8_overid.csv`

**Dataset CSVs (8):**
- `data_maketable1.csv` … `data_maketable8.csv` (transparent dump of each input dataset)

**Generated docs:**
- `README.md` — artifact inventory + Stata package list (ivreg2, ranktest, estout, coefplot)
- `plan.md` — this plan

## Risks and mitigations

1. **`ivreg2` syntax**: differs from old `ivreg`. Use `ivreg2 y exog (endog = inst), first robust` and read the first-stage F from `e(widstat)` (Kleibergen-Paap rk Wald F by default). For overid specs use `gmm2s` so Hansen J appears.
2. **Just-identified J-stat is undefined**: Tables 4-6 have one instrument and zero overid degrees; `e(jp)` will be missing. The `esttab stats()` line must tolerate missing values (default behavior is a blank cell).
3. **`coefplot` namespace collisions**: prefix every stored estimate (`m4_iv_c1`, never `c1`) so rerunning sections doesn't clobber prior tables.
4. **Stata color() takes RGB triplets, not hex**: precompute and store in locals at the top of §0.
5. **No native dark scheme**: apply inline `graphregion(...) plotregion(...) bgcolor(...) xlabel(, labcolor(...))` etc. on every `twoway`/`coefplot` command. Don't rely on a custom .scheme file.
6. **`mlabel(shortnam)` overlap**: 64 country labels will overlap; use `mlabsize(vsmall) mlabposition(3)` and accept some overlap (this is a teaching figure, not publication-ready).
7. **Sample size 111 vs 110 in original**: documented quirk in `maketable2.do`; mirror in comments — do not silently drop one obs.
8. **Working directory**: `analysis.do` will use relative paths `${REF}/maketableN/maketableN.dta`; user must `cd` into `content/post/stata_iv/` before running, or the skill's execution wrapper does so (`cd content/post/stata_iv/ && stata-mp -b do analysis.do`).
9. **Stata binary path** (per skill): `/Applications/Stata 18.0/StataMP.app/Contents/MacOS/stata-mp`. Verified pattern in `content/post/stata_rct/`.

## Verification (end-to-end test)

1. `cd content/post/stata_iv/`
2. `"/Applications/Stata 18.0/StataMP.app/Contents/MacOS/stata-mp" -b do analysis.do`
3. Confirm `analysis.log` ends with the closing summary banner — no error messages
4. `ls *.png` returns exactly 3 files, all > 50 KB (non-empty)
5. `ls *.csv` returns ≥ 10 result tables + 8 dataset dumps
6. Spot-check `tab4_iv_main.csv`: IV coefficient on `avexpr` in the base-sample column should be ≈ 0.94 (matches AJR Table 4 Col 1); first-stage F (`widstat`) ≈ 22 — well above Stock-Yogo 10%-maximal-IV-size threshold of 16.38
7. Spot-check `tab2_ols.csv`: OLS coefficient ≈ 0.52 (matches AJR Table 2 Col 1)
8. Open all 3 PNGs visually: dark navy background, no white borders, country labels visible
9. Generate `README.md` with artifact inventory; archive a copy of this plan as `content/post/stata_iv/plan.md`

## Out of scope (handled by downstream skills)

- `index.md` blog post body — `/project:write-post`
- `results_report.md` interpretation document — `/project:write-results-report`
- Featured image (`featured.webp`) — user adds manually
- Mermaid DAG content (instrument → endogenous → outcome diagram) — added in `index.md` by `write-post`, not in `analysis.do`
- AI Podcast player — separate front-matter + body block; user requests on demand
