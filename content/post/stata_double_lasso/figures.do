*===============================================================*
*  figures.do                                                   *
*  Rebuild the three PNGs that accompany the Stata Double LASSO *
*  tutorial — figured as a small, self-contained exercise in    *
*  building R-style faceted plots in *base* Stata.              *
*===============================================================*
*
* WHAT THIS FILE PRODUCES
* -----------------------
*   stata_double_lasso_estimates.png       (forest plot, 3 panels)
*   stata_double_lasso_selection.png       (selection bars, 4 metrics x 2 methods)
*   stata_double_lasso_methods_compare.png (rigorous vs CV, with point labels)
*
* WHAT THIS FILE READS
* --------------------
*   results_table2.csv       (estimates, SEs, CIs for 5 methods x 3 outcomes)
*   selection_diagnostic.csv (|I_y|, |I_d|, |I_y U I_d| for DL rigorous and CV)
*
* WHY THIS FILE EXISTS (vs running analysis.do)
* ---------------------------------------------
* analysis.do runs the full LASSO pipeline (~10 minutes). figures.do
* reads the two persisted CSVs and rebuilds *only* the figures in
* seconds, so you can iterate on visual styling without re-fitting
* anything. The estimator math and the Stata-vs-R numeric comparison
* are unchanged here — this file only touches presentation.
*
* CENTRAL DESIGN IDEA (READ THIS BEFORE EDITING)
* ----------------------------------------------
* Each figure is built as 3 per-outcome panels and then stitched
* together with `graph combine`. We do NOT use `by(outcome_id)`.
*
* Why: Stata's `by()` forces every panel to share the *same* x-axis.
* In this dataset, OLS-Murder has a 95% CI of roughly [-3.1, +7.8] —
* an order of magnitude wider than any other estimate. With a shared
* axis, every other CI collapses to an invisible nub. R sidesteps
* this with `facet_wrap(scales = "free_x")`; in Stata, the equivalent
* is "build N independent graphs, then `graph combine`."
*
* Each figure section therefore follows the same template:
*       IMPORT  ->  WRANGLE  ->  PER-OUTCOME LOOP  ->  COMBINE  ->  EXPORT
* If you understand one section, you understand all three.
*
* The LASSO-paths figure (R's r_double_lasso_paths.png) is omitted —
* Stata's twoway does not overlay 284 lines as cleanly as ggplot2 and
* the visualisation is not load-bearing for the post.

version 18
clear all
set more off
capture graph drop _all

* Log-aware setup: figures.do can be run two ways —
*   (a) standalone (e.g. `do figures.do`), in which case we want
*       our own figures.log;
*   (b) as a subscript from analysis.do via `do figures.do`, in
*       which case analysis.log is already open and we MUST NOT
*       close it (Stata only allows one log at a time).
* We detect which mode we're in by inspecting `c(logname)` and only
* open + close figures.log when no other log is active.
local _prior_log = "`c(logname)'"
local _opened_local_log = 0
if "`_prior_log'" == "" {
    log using "figures.log", replace text
    local _opened_local_log = 1
}


*---------------------------------------------------------------*
* Site palette (dark theme — matches analysis.do)               *
*---------------------------------------------------------------*
* Colors are RGB triplets ("R G B") so they survive Stata's
* color-name handling unchanged.

global C_BG    "15 23 41"    // dark navy background
global C_TEXT  "200 208 224" // body text on dark background
global C_TXTHI "232 236 242" // titles / emphasis text
global C_STEEL "106 155 204" // First diff
global C_TEXTM "200 208 224" // OLS (full) — reuse C_TEXT
global C_ORG   "217 119 87"  // PSL
global C_TEAL  "0 212 200"   // DL (rigorous)
global C_LTORG "232 149 106" // DL (CV)

* DARKBG bundles the graph-region color overrides we want on EVERY
* twoway, graph bar, and graph combine call. Use as `${DARKBG}`.
global DARKBG ///
    graphregion(fcolor("$C_BG") ifcolor("$C_BG") lcolor("$C_BG") ilcolor("$C_BG")) ///
    plotregion(fcolor("$C_BG") lcolor("$C_BG"))


*---------------------------------------------------------------*
* Output dimensions (px). Match the R companion to keep the     *
* two posts looking like a matched pair when viewed side by     *
* side on the site.                                             *
*---------------------------------------------------------------*
local WIDE     = 3300   // shared width for all 3 figures
local TALL     = 1350   // estimates + methods_compare height
local TALL_SEL = 1560   // selection bars: a bit taller because 4 metrics need more horizontal space



*===============================================================*
* FIGURE 1 — Forest plot of all five estimators                 *
*===============================================================*
*
* The post's headline figure. Five estimators (rows) x three crime
* outcomes (panels), each row shows alpha-hat as a point and the
* 95% CI as a horizontal spike (rspike).
*
* The pedagogical point: LASSO methods (PSL, DL rigorous) land
* between the no-controls baseline and the kitchen-sink OLS — and
* you can SEE this only if each outcome panel has its own x-axis.
*
* Stata idiom: 3 independent `twoway` graphs (one per outcome),
* then `graph combine` into a 1x3 strip. Each per-outcome graph
* has 10 layers (5 methods x 2 plot types: rspike + scatter).

*-- 1a. IMPORT --------------------------------------------------
import delimited "results_table2.csv", clear varnames(1) case(preserve)

*-- 1b. WRANGLE -------------------------------------------------
* Encode outcome and method as small numeric codes so we can
* select them with `if oid==`o' & method_id==`m'` and have a
* stable color mapping across panels.

gen byte oid = .
qui replace oid = 1 if outcome == "Violent crime"
qui replace oid = 2 if outcome == "Property crime"
qui replace oid = 3 if outcome == "Murder"
label define olab 1 "Violent crime" 2 "Property crime" 3 "Murder"
label values oid olab

gen byte method_id = .
qui replace method_id = 1 if method == "First diff"
qui replace method_id = 2 if method == "OLS (full)"
qui replace method_id = 3 if method == "PSL"
qui replace method_id = 4 if method == "DL (rigorous)"
qui replace method_id = 5 if method == "DL (CV)"

* Y-axis trick: we want "First diff" (id=1) at the TOP of each
* panel and "DL (CV)" (id=5) at the BOTTOM. twoway plots increase
* y upward by default, so invert the ordinal:
*       y = 6 - method_id   ->   First diff at y=5, DL (CV) at y=1
* The ylabel() statement below then re-labels y=1..5 in the
* desired top-to-bottom reading order.
gen byte y = 6 - method_id

*-- 1c. PER-OUTCOME LOOP ----------------------------------------
* Build one twoway per outcome. The `if oid==`o'` clause on every
* layer restricts the panel to its own data so the x-axis range
* auto-fits that panel only (the "free x" behavior we want).

forvalues o = 1/3 {
    local oname : label olab `o'   // e.g. "Violent crime"

    twoway ///
        (rspike ci_lo ci_hi y if oid==`o' & method_id==1, ///
            horizontal lcolor("$C_STEEL") lwidth(medthick)) ///
        (scatter y estimate if oid==`o' & method_id==1, ///
            mcolor("$C_STEEL") msymbol(O) msize(medlarge)) ///
        (rspike ci_lo ci_hi y if oid==`o' & method_id==2, ///
            horizontal lcolor("$C_TEXTM") lwidth(medthick)) ///
        (scatter y estimate if oid==`o' & method_id==2, ///
            mcolor("$C_TEXTM") msymbol(O) msize(medlarge)) ///
        (rspike ci_lo ci_hi y if oid==`o' & method_id==3, ///
            horizontal lcolor("$C_ORG") lwidth(medthick)) ///
        (scatter y estimate if oid==`o' & method_id==3, ///
            mcolor("$C_ORG") msymbol(O) msize(medlarge)) ///
        (rspike ci_lo ci_hi y if oid==`o' & method_id==4, ///
            horizontal lcolor("$C_TEAL") lwidth(medthick)) ///
        (scatter y estimate if oid==`o' & method_id==4, ///
            mcolor("$C_TEAL") msymbol(O) msize(medlarge)) ///
        (rspike ci_lo ci_hi y if oid==`o' & method_id==5, ///
            horizontal lcolor("$C_LTORG") lwidth(medthick)) ///
        (scatter y estimate if oid==`o' & method_id==5, ///
            mcolor("$C_LTORG") msymbol(O) msize(medlarge)) ///
        , ///
        title("`oname'", color("$C_TXTHI") size(medsmall)) ///
        ylabel(1 "DL (CV)" 2 "DL (rigorous)" 3 "PSL" 4 "OLS (full)" 5 "First diff", ///
               labcolor("$C_TEXT") angle(0) noticks nogrid) ///
        xlabel(, labcolor("$C_TEXT")) ///
        ytitle("") xtitle("") ///
        xline(0, lpattern(dash) lcolor("$C_TEXT")) ///
        legend(off) ${DARKBG} ///
        name(fig_o`o', replace)
}

*-- 1d. COMBINE + 1e. EXPORT ------------------------------------
graph combine fig_o1 fig_o2 fig_o3, cols(3) ///
    title("Treatment-effect estimates: abortion -> crime, 1985-1997", ///
          color("$C_TXTHI") size(medsmall)) ///
    subtitle("Each panel is a different crime outcome; bars are 95% CIs from state-clustered SEs.", ///
             color("$C_TEXT") size(small) margin(t=4 b=2)) ///
    b1title("alpha hat (effect of effective abortion rate)", ///
            color("$C_TEXT") size(small)) ///
    note("Replication of Table 2 in Fitzgerald et al. (2026). Dashed line at zero. Per-panel x-axis.", ///
         color("$C_TEXT") size(vsmall)) ///
    imargin(small) ${DARKBG} ///
    name(fig_forest, replace)

graph export "stata_double_lasso_estimates.png", replace width(`WIDE') height(`TALL')
di "Wrote stata_double_lasso_estimates.png  (`WIDE' x `TALL')"



*===============================================================*
* FIGURE 2 — Variable-selection bar chart                       *
*===============================================================*
*
* For each outcome panel, four metrics on the x-axis:
*   |I_y|   selected in the y-equation LASSO
*   |I_d|   selected in the d-equation LASSO
*   Inter.  intersection (= |I_y \cap I_d|)
*   Union   union (the actual post-OLS support, |I_y U I_d|)
* Each metric is split into TWO bars (rigorous = teal, CV = orange).
* Mirrors R's faceted bar chart exactly.
*
* Why inclusion-exclusion?
*   The persisted selection_diagnostic.csv has |I_y|, |I_d|, and
*   |I_y U I_d| but NOT |I_y \cap I_d|. Rather than re-run the
*   10-minute analysis.do to add a column, we derive intersection
*   from the identity:
*           |A \cap B|  =  |A| + |B| - |A U B|
*   The math is exact (this is a set-counting identity, not an
*   approximation), and figures.do stays a pure presentation file.
*
* Stata idiom: 3 independent `graph bar`s (one per outcome) +
* `graph combine`. Within each bar chart we use the nested
* over(method) over(metric) pattern with `asyvars`, which tells
* graph bar to treat the inner over-group as separate y-series
* (so the two methods get distinct colors instead of identical bars).

*-- 2a. IMPORT --------------------------------------------------
import delimited "selection_diagnostic.csv", clear varnames(1) case(preserve)

*-- 2b. WRANGLE -------------------------------------------------
gen long n_int = n_Iy + n_Id - n_union   // inclusion-exclusion: |I_y \cap I_d|

gen byte oid = .
qui replace oid = 1 if outcome == "Violent crime"
qui replace oid = 2 if outcome == "Property crime"
qui replace oid = 3 if outcome == "Murder"
label define olab 1 "Violent crime" 2 "Property crime" 3 "Murder", replace
label values oid olab

gen byte mid = .
qui replace mid = 1 if method == "DL (rigorous)"
qui replace mid = 2 if method == "DL (CV)"
label define mthlab 1 "DL (rigorous)" 2 "DL (CV)", replace
label values mid mthlab

* Reshape long: each (outcome, method) row currently has 4 metric
* columns. After reshape, we get 4 rows per (outcome, method), one
* per metric. This is the shape `graph bar` needs for nested over().
keep oid mid n_Iy n_Id n_int n_union
reshape long n_, i(oid mid) j(metric_str) string
rename n_ count

gen byte metric = .
qui replace metric = 1 if metric_str == "Iy"
qui replace metric = 2 if metric_str == "Id"
qui replace metric = 3 if metric_str == "int"
qui replace metric = 4 if metric_str == "union"
label define mtlab 1 "|I_y|" 2 "|I_d|" 3 "Intersection" 4 "Union", replace
label values metric mtlab
drop metric_str

*-- 2c. PER-OUTCOME LOOP ----------------------------------------
forvalues o = 1/3 {
    local oname : label olab `o'

    * `asyvars` is the key option here: with over(mid) inside
    * over(metric), Stata would by default draw 8 identically-
    * colored bars. asyvars instead treats `mid` as separate
    * y-series, giving each method its own color (bar(1) = teal
    * = rigorous, bar(2) = orange = CV).
    *
    * ylabel(0(5)20) is forced shared across all three panels so
    * the bar heights are visually comparable (max rigorous count
    * across outcomes is 17 — Property Union — so 20 is a safe cap).
    graph bar count if oid==`o', ///
        over(mid, gap(20) label(labcolor("$C_TEXT") labsize(small))) ///
        over(metric, gap(70) label(angle(20) labcolor("$C_TXTHI") labsize(small))) ///
        asyvars ///
        bar(1, fcolor("$C_TEAL")  lcolor("$C_TEAL")) ///
        bar(2, fcolor("$C_LTORG") lcolor("$C_LTORG")) ///
        blabel(bar, color("$C_TXTHI") size(small) format(%5.0f)) ///
        title("`oname'", color("$C_TXTHI") size(medsmall)) ///
        ytitle("") ///
        ylabel(0(5)20, labcolor("$C_TEXT")) ///
        legend(off) ${DARKBG} ///
        name(fig_sel`o', replace)
}

*-- 2d. COMBINE + 2e. EXPORT ------------------------------------
graph combine fig_sel1 fig_sel2 fig_sel3, cols(3) ///
    title("Variable selection across the two Double LASSO penalties", ///
          color("$C_TXTHI") size(medsmall)) ///
    subtitle("Rigorous penalty (Belloni et al. 2012) vs. 3-fold CV (lambda.min) — out of 284 candidate controls.", ///
             color("$C_TEXT") size(small) margin(t=4 b=2)) ///
    l1title("Number of controls", color("$C_TEXT") size(small)) ///
    note("Teal = DL (rigorous). Orange = DL (CV)." ///
         "DL-CV bars are 0 because Stata's cvlasso was run with lcount(10) for runtime — see post §11.", ///
         color("$C_TEXT") size(vsmall) linegap(*5)) ///
    imargin(small) ${DARKBG} ///
    name(fig_select, replace)

graph export "stata_double_lasso_selection.png", replace width(`WIDE') height(`TALL_SEL')
di "Wrote stata_double_lasso_selection.png  (`WIDE' x `TALL_SEL')"



*===============================================================*
* FIGURE 3 — Rigorous vs CV side-by-side, with numeric labels   *
*===============================================================*
*
* Zooms in on the two Double LASSO flavours. Same 3-panel layout
* and same per-panel free axis. We annotate each point with its
* numeric alpha-hat estimate (formatted as "+0.019" / "-0.155")
* so the reader can read off the numbers without consulting the
* table.
*
* Stata idiom: scatter's `mlabel(varname)` pulls the marker label
* from a string variable; `mlabposition(12)` places the label at
* clock-face position 12 (north of the point); `mlabgap(*1.4)`
* lifts it a touch further so the CI cap doesn't run into the text.

*-- 3a. IMPORT --------------------------------------------------
import delimited "results_table2.csv", clear varnames(1) case(preserve)
keep if method == "DL (rigorous)" | method == "DL (CV)"

*-- 3b. WRANGLE -------------------------------------------------
gen byte oid = .
qui replace oid = 1 if outcome == "Violent crime"
qui replace oid = 2 if outcome == "Property crime"
qui replace oid = 3 if outcome == "Murder"
label define olab 1 "Violent crime" 2 "Property crime" 3 "Murder", replace
label values oid olab

gen byte mid = .
qui replace mid = 1 if method == "DL (rigorous)"
qui replace mid = 2 if method == "DL (CV)"

* Pre-format the point-label string. Unlike C's printf, Stata's
* `string(x, "%fmt")` does NOT support the `+` flag, so we build
* the leading sign by hand: negative numbers already carry "-",
* positives get an explicit "+" prepended. The sign matters here
* because DL-CV flips sign on violent crime in the R companion.
gen str20 estfmt = string(estimate, "%5.3f")
qui replace estfmt = "+" + estfmt if estimate > 0

*-- 3c. PER-OUTCOME LOOP ----------------------------------------
forvalues o = 1/3 {
    local oname : label olab `o'

    twoway ///
        (rspike ci_lo ci_hi mid if oid==`o' & mid==1, ///
            lcolor("$C_TEAL") lwidth(medthick)) ///
        (rspike ci_lo ci_hi mid if oid==`o' & mid==2, ///
            lcolor("$C_LTORG") lwidth(medthick)) ///
        (scatter estimate mid if oid==`o' & mid==1, ///
            mcolor("$C_TEAL") msymbol(O) msize(large) ///
            mlabel(estfmt) mlabcolor("$C_TXTHI") mlabsize(medsmall) ///
            mlabposition(3) mlabgap(*1.2)) ///
        (scatter estimate mid if oid==`o' & mid==2, ///
            mcolor("$C_LTORG") msymbol(O) msize(large) ///
            mlabel(estfmt) mlabcolor("$C_TXTHI") mlabsize(medsmall) ///
            mlabposition(3) mlabgap(*1.2)) ///
        , ///
        title("`oname'", color("$C_TXTHI") size(medsmall)) ///
        xlabel(1 "DL (rigorous)" 2 "DL (CV)", noticks labcolor("$C_TEXT")) ///
        xscale(range(0.5 2.5)) ///   /* pad x-axis so points don't sit on the edge */
        ylabel(, labcolor("$C_TEXT") nogrid) ///
        yline(0, lpattern(dash) lcolor("$C_TEXT")) ///
        ytitle("") xtitle("") ///
        legend(off) ${DARKBG} ///
        name(fig_cmp`o', replace)
}

*-- 3d. COMBINE + 3e. EXPORT ------------------------------------
graph combine fig_cmp1 fig_cmp2 fig_cmp3, cols(3) ///
    title("Rigorous vs cross-validated penalty: two flavours of Double LASSO", ///
          color("$C_TXTHI") size(medsmall)) ///
    subtitle("Both procedures share the same three-step structure; they differ only in how lambda is chosen.", ///
             color("$C_TEXT") size(small) margin(t=4 b=2)) ///
    l1title("alpha hat +/- 1.96 * SE", color("$C_TEXT") size(small)) ///
    note("Bars: 95% CIs from state-clustered SEs. Dashed line at zero." ///
         "Stata's DL-CV at lcount(10) collapses to the no-controls baseline; the R companion shows CV's true over-selection behavior.", ///
         color("$C_TEXT") size(vsmall) linegap(*5)) ///
    imargin(small) ${DARKBG} ///
    name(fig_compare, replace)

graph export "stata_double_lasso_methods_compare.png", replace width(`WIDE') height(`TALL')
di "Wrote stata_double_lasso_methods_compare.png  (`WIDE' x `TALL')"

di _n "=== All 3 figures regenerated ==="

* Only close the log if we opened it ourselves (standalone mode).
if `_opened_local_log' {
    log close
}
