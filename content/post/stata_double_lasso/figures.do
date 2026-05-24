*! figures.do — regenerate the 3 post figures from the persisted CSVs.
*!
*! Reads results_table2.csv + selection_diagnostic.csv and writes:
*!   stata_double_lasso_estimates.png       (forest plot)
*!   stata_double_lasso_selection.png       (selection bars)
*!   stata_double_lasso_methods_compare.png (rigorous vs CV)
*!
*! Use this when you want to tweak figure styling without re-running the
*! ~10-minute LASSO pipeline in analysis.do. The estimator math and the
*! Stata-vs-R numeric comparison are unchanged; only the visuals are
*! regenerated from the on-disk CSVs.
*!
*! The LASSO-paths figure (Stata equivalent of R's r_double_lasso_paths.png)
*! is omitted — Stata's twoway does not overlay 284 lines as cleanly as
*! ggplot2 and the visualisation is not load-bearing for the post.

version 18
clear all
set more off
capture log close
log using "figures.log", replace text

* Site palette (dark theme, matches analysis.do)
global C_BG    "15 23 41"
global C_TEXT  "200 208 224"
global C_TXTHI "232 236 242"
global C_STEEL "106 155 204"
global C_ORG   "217 119 87"
global C_TEAL  "0 212 200"
global C_LTORG "232 149 106"
global DARKBG ///
    graphregion(fcolor("$C_BG") ifcolor("$C_BG") lcolor("$C_BG") ilcolor("$C_BG")) ///
    plotregion(fcolor("$C_BG") lcolor("$C_BG"))


* === Figure 1: forest plot of all five estimators ===
import delimited "results_table2.csv", clear varnames(1) case(preserve)
gen byte oid = .
qui replace oid = 1 if outcome == "Violent crime"
qui replace oid = 2 if outcome == "Property crime"
qui replace oid = 3 if outcome == "Murder"

gen byte method_id = .
qui replace method_id = 1 if method == "First diff"
qui replace method_id = 2 if method == "OLS (full)"
qui replace method_id = 3 if method == "PSL"
qui replace method_id = 4 if method == "DL (rigorous)"
qui replace method_id = 5 if method == "DL (CV)"

* Plot positions: invert so "First diff" is at top.
gen byte y = 6 - method_id

label define olab 1 "Violent crime" 2 "Property crime" 3 "Murder"
label values oid olab

twoway ///
    (rspike ci_lo ci_hi y if method_id==1, horizontal lcolor("$C_STEEL") lwidth(medthick)) ///
    (scatter y estimate if method_id==1, mcolor("$C_STEEL") msymbol(O) msize(medlarge)) ///
    (rspike ci_lo ci_hi y if method_id==2, horizontal lcolor("$C_TEXT") lwidth(medthick)) ///
    (scatter y estimate if method_id==2, mcolor("$C_TEXT") msymbol(O) msize(medlarge)) ///
    (rspike ci_lo ci_hi y if method_id==3, horizontal lcolor("$C_ORG") lwidth(medthick)) ///
    (scatter y estimate if method_id==3, mcolor("$C_ORG") msymbol(O) msize(medlarge)) ///
    (rspike ci_lo ci_hi y if method_id==4, horizontal lcolor("$C_TEAL") lwidth(medthick)) ///
    (scatter y estimate if method_id==4, mcolor("$C_TEAL") msymbol(O) msize(medlarge)) ///
    (rspike ci_lo ci_hi y if method_id==5, horizontal lcolor("$C_LTORG") lwidth(medthick)) ///
    (scatter y estimate if method_id==5, mcolor("$C_LTORG") msymbol(O) msize(medlarge)) ///
    , by(oid, cols(3) ///
          title("Treatment-effect estimates: abortion -> crime, 1985-1997", color("$C_TXTHI") size(medsmall)) ///
          subtitle("Each panel: 95% CIs from state-clustered SEs.", color("$C_TEXT") size(small)) ///
          note("Replication of Table 2 in Fitzgerald et al. (2026). Dashed line at zero.", color("$C_TEXT") size(vsmall)) ///
          legend(off) ${DARKBG}) ///
    subtitle(, fcolor("$C_BG") lcolor("$C_BG") size(small) color("$C_TXTHI")) ///
    ylabel(1 "DL (CV)" 2 "DL (rigorous)" 3 "PSL" 4 "OLS (full)" 5 "First diff", ///
           labcolor("$C_TEXT") angle(0) noticks nogrid) ///
    xlabel(, labcolor("$C_TEXT")) ///
    xtitle("alpha hat (effect of effective abortion rate)", color("$C_TEXT") size(small)) ///
    ytitle("") ///
    xline(0, lpattern(dash) lcolor("$C_TEXT")) ///
    ${DARKBG} ///
    name(fig_forest, replace)

graph export "stata_double_lasso_estimates.png", replace width(2400) height(1100)
di "Wrote stata_double_lasso_estimates.png"


* === Figure 2: selection-count bar chart ===
import delimited "selection_diagnostic.csv", clear varnames(1) case(preserve)
gen byte oid = .
qui replace oid = 1 if outcome == "Violent crime"
qui replace oid = 2 if outcome == "Property crime"
qui replace oid = 3 if outcome == "Murder"
gen byte mid = .
qui replace mid = 1 if method == "DL (rigorous)"
qui replace mid = 2 if method == "DL (CV)"
label define olab 1 "Violent crime" 2 "Property crime" 3 "Murder"
label values oid olab

* Reshape long: each row gets two metric values (n_Iy and n_Id).
preserve
keep oid mid n_Iy
rename n_Iy count
gen byte metric = 1
tempfile t_iy
save "`t_iy'"
restore
preserve
keep oid mid n_Id
rename n_Id count
gen byte metric = 2
tempfile t_id
save "`t_id'"
restore

use "`t_iy'", clear
append using "`t_id'"
label define mtlab 1 "|I_y|" 2 "|I_d|"
label values metric mtlab

* 4 grouped bars per outcome panel: rigorous-Iy, CV-Iy, rigorous-Id, CV-Id.
gen byte bar_id = (metric - 1) * 2 + mid
label define blab 1 "|Iy| rig" 2 "|Iy| CV" 3 "|Id| rig" 4 "|Id| CV"
label values bar_id blab

graph bar count, over(bar_id, label(angle(35) labcolor("$C_TEXT") labsize(small))) ///
    over(oid, label(labcolor("$C_TXTHI"))) asyvars ///
    bar(1, fcolor("$C_TEAL")  lcolor("$C_TEAL")) ///
    bar(2, fcolor("$C_LTORG") lcolor("$C_LTORG")) ///
    bar(3, fcolor("$C_TEAL")  lcolor("$C_TEAL")) ///
    bar(4, fcolor("$C_LTORG") lcolor("$C_LTORG")) ///
    blabel(bar, color("$C_TXTHI") size(small) format(%5.0f)) ///
    title("Variable selection: rigorous vs. CV penalty", color("$C_TXTHI") size(medsmall)) ///
    subtitle("Out of 284 candidate controls per outcome.", color("$C_TEXT") size(small)) ///
    note("Teal = rigorous penalty (rlasso). Orange = CV penalty (cvlasso); collapsed to 0 here, see post Section 10.", ///
         color("$C_TEXT") size(vsmall)) ///
    ytitle("Number of controls", color("$C_TEXT") size(small)) ///
    ylabel(, labcolor("$C_TEXT")) ///
    legend(off) ${DARKBG} ///
    name(fig_select, replace)

graph export "stata_double_lasso_selection.png", replace width(2400) height(1100)
di "Wrote stata_double_lasso_selection.png"


* === Figure 4: rigorous vs CV side-by-side ===
import delimited "results_table2.csv", clear varnames(1) case(preserve)
keep if method == "DL (rigorous)" | method == "DL (CV)"
gen byte oid = .
qui replace oid = 1 if outcome == "Violent crime"
qui replace oid = 2 if outcome == "Property crime"
qui replace oid = 3 if outcome == "Murder"
gen byte mid = .
qui replace mid = 1 if method == "DL (rigorous)"
qui replace mid = 2 if method == "DL (CV)"
label define olab 1 "Violent crime" 2 "Property crime" 3 "Murder"
label values oid olab

twoway ///
    (rspike ci_lo ci_hi mid if mid==1, lcolor("$C_TEAL") lwidth(medthick)) ///
    (rspike ci_lo ci_hi mid if mid==2, lcolor("$C_LTORG") lwidth(medthick)) ///
    (scatter estimate mid if mid==1, mcolor("$C_TEAL") msymbol(O) msize(large)) ///
    (scatter estimate mid if mid==2, mcolor("$C_LTORG") msymbol(O) msize(large)) ///
    , by(oid, cols(3) ///
          title("Rigorous vs cross-validated penalty: two flavours of Double LASSO", ///
                color("$C_TXTHI") size(medsmall)) ///
          subtitle("Same 3-step structure; they differ only in how lambda is chosen.", ///
                   color("$C_TEXT") size(small)) ///
          note("Bars: 95% CIs from state-clustered SEs. Dashed line at zero.", ///
               color("$C_TEXT") size(vsmall)) ///
          legend(off) ${DARKBG}) ///
    subtitle(, fcolor("$C_BG") lcolor("$C_BG") size(small) color("$C_TXTHI")) ///
    xlabel(1 "rigorous" 2 "CV", noticks labcolor("$C_TEXT")) ///
    ylabel(, labcolor("$C_TEXT")) ///
    yline(0, lpattern(dash) lcolor("$C_TEXT")) ///
    xtitle("Penalty rule", color("$C_TEXT") size(small)) ///
    ytitle("alpha hat", color("$C_TEXT") size(small)) ///
    ${DARKBG} ///
    name(fig_compare, replace)

graph export "stata_double_lasso_methods_compare.png", replace width(2400) height(1100)
di "Wrote stata_double_lasso_methods_compare.png"

di _n "=== All 3 figures regenerated ==="
log close
