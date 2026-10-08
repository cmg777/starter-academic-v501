*==============================================================================
* Introduction to Difference-in-Differences (DiD) in Python — Stata companion
*
* This do-file mirrors script.py section by section, so the Python and Stata
* implementations can be read side by side. Every number quoted in a comment
* is the one published in the post (and printed in execution_log.txt); every
* number and identity the post states is checked below with -assert-, so the
* do-file stops with an error the moment a claim fails.
*
* Companion post:  https://carlos-mendez.org/tutorials/python_did101/
* Companions:      script.py            (the Python original)
*                  cheatsheet_stata.do  cheatsheet_python.py  cheatsheet_R.R
*                  data/index.html      (the data dictionary)
*
* Data: the simulated case study of Corral and Yang (2024). 35 high schools,
* 10 of which (id 26-35) adopt an after-school tutoring program at the same
* time; gpa = average GPA of low-income students.
*   data/tutoring_did.csv       35 schools x 2 periods  (the 2x2 design)
*   data/tutoring_didevent.csv  35 schools x 8 periods  (event study, adoption
*                               in period 5; timeToTreat empty for comparison
*                               schools)
*
* Usage (batch):
*   "/Applications/Stata/StataSE.app/Contents/MacOS/stata-se" -b do analysis.do
*   The batch log starts with your license details: do not commit or share it.
* Run time: about 5 seconds. Besides the batch log, nothing is written to disk
*           unless EXPORT is 1 (then eight PNGs, did101_*_stata.png, and
*           did101_table2_stata.tex are written next to this file).
* Requires: Stata 17+ (etable). Nothing to install.
* Verified with: Python 3.11 (pyfixest 0.50.1) / R 4.5 / Stata 19 SE.
*==============================================================================

clear all
set more off
set linesize 100
set varabbrev off          // never let a scalar name resolve to a variable
version 17                 // etable needs 17+

global EXPORT 0            // 1 = export the figures and the LaTeX table

* Site palette (RGB) for the optional graphs
global BLUE   "106 155 204"   // #6a9bcc steel blue (comparison schools)
global ORANGE "217 119 87"    // #d97757 warm orange (treated schools)
global PEACH  "232 149 106"   // #e8956a treated schools before the program
global TEAL   "0 212 200"     // #00d4c8 teal (counterfactual, estimates)

global url "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/tutorials/python_did101/data/"

* Print "label ...... value" at the post's 4-decimal precision.
capture program drop show
program define show
    gettoken label 0 : 0
    display as text %-46s "`label'" as result %10.4f `0'
end

* Assert that an expression rounds to the value the post prints, e.g.
*   post_is %7.4f "25.3149" _b[txp]
* fails loudly if the estimate drifts. Format and printed value come first so
* the expression may contain spaces.
capture program drop post_is
program define post_is
    gettoken fmt 0 : 0
    gettoken printed 0 : 0
    if strtrim(string(`0', "`fmt'")) != "`printed'" {
        display as error "post says `printed', Stata gets " string(`0', "`fmt'")
        exit 9
    }
end

* Local copy first (the post folder keeps the CSVs under data/), then the
* raw GitHub URL. ALWAYS asdouble: without it gpa is stored as float and the
* coefficients drift in the 7th decimal.
capture program drop load_csv
program define load_csv
    args name
    local src "${url}`name'"
    capture confirm file "data/`name'"
    if !_rc local src "data/`name'"
    capture confirm file "`name'"
    if !_rc local src "`name'"
    quietly import delimited "`src'", clear asdouble case(preserve)
    display as text "Loaded: `src'"
end


*==============================================================================
* 3. DATA LOADING AND EXPLORATION          (script.py section 3; post section 3)
*==============================================================================
load_csv tutoring_did.csv
assert _N == 70 & c(k) == 7
describe, short
summarize id time treated post txp gpa female_share
list in 1/5, noobs abbreviate(12)

quietly summarize gpa, detail
post_is %5.2f "77.12" r(mean)
post_is %5.2f "10.88" r(sd)  
post_is %5.2f "59.39" r(min) 
post_is %5.2f "99.15" r(max) 

* Crosstab: 25 comparison and 10 treated schools, each observed twice.
tabulate treated post
quietly count if treated == 1 & post == 0
assert r(N) == 10
quietly count if treated == 0 & post == 1
assert r(N) == 25
xtset id time
assert "`r(balanced)'" == "strongly balanced"
assert txp == treated * post

* Figure 1: panel view (one square per school-period).
if $EXPORT {
    generate byte cell = cond(txp == 1, 3, cond(treated == 1, 2, 1))
    twoway (scatter id time if cell == 1, msymbol(S) msize(large) mcolor("$BLUE"))   ///
           (scatter id time if cell == 2, msymbol(S) msize(large) mcolor("$PEACH"))  ///
           (scatter id time if cell == 3, msymbol(S) msize(large) mcolor("$ORANGE")), ///
        yscale(reverse) xscale(range(0.5 2.5)) xlabel(1 "Pre (1)" 2 "Post (2)")       ///
        ylabel(1 6 11 16 21 26 31 35, angle(0))                                     ///
        xtitle("Time period") ytitle("School ID")                                    ///
        title("Panel structure: 35 schools x 2 periods")                             ///
        legend(order(1 "Comparison group" 2 "Treated (pre)" 3 "Treated (post)") rows(1) position(6))
    graph export "did101_panelview_stata.png", width(1600) replace
    drop cell
}


*==============================================================================
* 4. THE PROBLEM WITH NAIVE COMPARISONS                   (post section 4)
*==============================================================================
forvalues g = 0/1 {
    forvalues p = 0/1 {
        quietly summarize gpa if treated == `g' & post == `p', meanonly
        scalar m`g'`p' = r(mean)
    }
}
scalar naive = m11 - m10
show "Treated, pre-program mean"   m10              // 60.17
show "Treated, post-program mean"  m11              // 96.37
show "Naive before-after change"   naive            // 36.20
post_is %5.2f "60.17" m10  
post_is %5.2f "96.37" m11  
post_is %5.2f "36.20" naive

* Figure 2: the naive view (treated schools only).
if $EXPORT {
    preserve
    collapse (mean) gpa if treated == 1, by(post)
    twoway (connected gpa post, lcolor("$ORANGE") mcolor("$ORANGE") lwidth(thick)), ///
        xlabel(0 "Pre-program" 1 "Post-program") xscale(range(-0.3 1.3))            ///
        xline(0.5, lpattern(dash) lcolor(red)) ytitle("Average GPA") xtitle("")     ///
        title("Naive before-after: +36.20 points?") legend(off)
    graph export "did101_its_stata.png", width(1600) replace
    restore
}


*==============================================================================
* 5. THE DID DESIGN: USING A COMPARISON GROUP              (post section 5)
*    The post rounds the four means to two decimals before doing the arithmetic,
*    which is why it prints 10.88 and 25.32. Unrounded: 10.886 and 25.315.
*==============================================================================
scalar pre_c  = round(m00, .01)                     // 71.22
scalar post_c = round(m01, .01)                     // 82.10
scalar pre_t  = round(m10, .01)                     // 60.17
scalar post_t = round(m11, .01)                     // 96.37
scalar counterfactual = pre_t + (post_c - pre_c)
scalar did_rounded    = post_t - counterfactual
show "Comparison, pre"                pre_c
show "Comparison, post"               post_c
show "Counterfactual (rounded means)" counterfactual  // 71.05
show "DiD (rounded means)"            did_rounded     // 25.32
post_is %5.2f "71.22" pre_c         
post_is %5.2f "82.10" post_c        
post_is %5.2f "71.05" counterfactual
post_is %5.2f "25.32" did_rounded   
post_is %3.0f "43" 100*(naive/(m11 - m10 - (m01 - m00)) - 1)    // overstatement

* Figure 3: the counterfactual.
if $EXPORT {
    preserve
    clear
    quietly set obs 2
    generate post = _n - 1
    generate comp = cond(post == 0, pre_c, post_c)
    generate trt  = cond(post == 0, pre_t, post_t)
    generate cf   = cond(post == 0, pre_t, counterfactual)
    twoway (connected comp post, lcolor("$BLUE") mcolor("$BLUE") lwidth(thick))      ///
           (connected trt post, lcolor("$ORANGE") mcolor("$ORANGE") lwidth(thick))   ///
           (connected cf post, lcolor("$TEAL") mcolor("$TEAL") lpattern(dash)),      ///
        xlabel(0 "Pre-program" 1 "Post-program") xscale(range(-0.3 1.3))            ///
        ytitle("Average GPA") xtitle("") title("DiD: the counterfactual path")       ///
        legend(order(1 "Comparison" 2 "Treated" 3 "Counterfactual") rows(1) position(6))
    graph export "did101_counterfactual_stata.png", width(1600) replace
    restore
}


*==============================================================================
* 6. MANUAL DID CALCULATION                                 (post section 6)
*==============================================================================
scalar trend = m01 - m00
scalar did   = (m11 - m10) - trend
display as text _n "2x2 means (rounded):"
display as text "  Comparison (0)  " %6.2f pre_c "  " %6.2f post_c "  " %6.2f post_c - pre_c
display as text "  Treated (1)     " %6.2f pre_t "  " %6.2f post_t "  " %6.2f post_t - pre_t
show "DiD, unrounded means" did                     // 25.3149
post_is %5.2f "10.88" post_c - pre_c
post_is %6.3f "10.886" trend
post_is %7.4f "25.3149" did  

* Figure 4: the double difference.
if $EXPORT {
    preserve
    collapse (mean) gpa, by(treated post)
    twoway (connected gpa post if treated == 0, lcolor("$BLUE") mcolor("$BLUE") lwidth(thick)) ///
           (connected gpa post if treated == 1, lcolor("$ORANGE") mcolor("$ORANGE") lwidth(thick)), ///
        xlabel(0 "Pre (0)" 1 "Post (1)") xscale(range(-0.3 1.3)) ytitle("Average GPA")  ///
        xtitle("") title("DiD = 36.20 - 10.88 = 25.32")                                 ///
        legend(order(1 "Comparison (+10.88)" 2 "Treated (+36.20)") rows(1) position(6))
    graph export "did101_diff_plot_stata.png", width(1600) replace
    restore
}


*==============================================================================
* 7. DID VIA REGRESSION                                     (post section 7)
*==============================================================================
* 7.1 Classical OLS with interaction, HC1 (= vce(robust) after regress)
regress gpa treated post txp, vce(robust)
estimates store ols
assert reldif(_b[_cons],   m00)       < 1e-10        // comparison, pre
assert reldif(_b[treated], m10 - m00) < 1e-10        // baseline gap
assert reldif(_b[post],    trend)     < 1e-10        // common trend
assert reldif(_b[txp],     did)       < 1e-10        // the DiD
post_is %7.3f "71.215" _b[_cons]  
post_is %7.3f "-11.049" _b[treated]
post_is %7.3f "10.886" _b[post]   
post_is %7.3f "25.315" _b[txp]    
post_is %5.3f "0.615" _se[txp]   
post_is %5.3f "0.989" e(r2)      
post_is %4.2f "1.15" sqrt(e(rss)/e(N))               // pyfixest RMSE = sqrt(RSS/N)
scalar b_ols  = _b[txp]
scalar se_ols = _se[txp]

* 7.2 Two-way fixed effects, CRV1 by school. xtreg, fe absorbs the school FE,
* i.time adds the period FE, and its cluster df correction does not count FE
* nested in the clusters, exactly like pyfixest and fixest.
xtreg gpa txp i.time, fe vce(cluster id)
estimates store twfe
assert reldif(_b[txp], did) < 1e-10
post_is %7.3f "25.315" _b[txp] 
post_is %5.3f "0.585" _se[txp]
scalar b_twfe  = _b[txp]
scalar se_twfe = _se[txp]
quietly regress gpa txp i.id i.time                  // the same model as LSDV
post_is %5.3f "0.995" e(r2)
post_is %5.3f "0.788" sqrt(e(rss)/e(N))
scalar rss_twfe = e(rss)
* Within R2 as pyfixest/fixest define it: after removing BOTH sets of fixed
* effects. (xtreg's e(r2_w) keeps the period dummies as regressors: 0.995.)
bysort id:   egen double ybar_i = mean(gpa)
bysort time: egen double ybar_t = mean(gpa)
quietly summarize gpa
generate double yww = (gpa - ybar_i - ybar_t + r(mean))^2
quietly summarize yww
scalar tss_within = r(sum)
drop ybar_i ybar_t yww
post_is %5.3f "0.981" 1 - rss_twfe/tss_within

* 7.3 TWFE with a time-varying covariate
xtreg gpa txp female_share i.time, fe vce(cluster id)
estimates store twfe_cov
post_is %7.3f "25.328" _b[txp]         
post_is %5.3f "0.605" _se[txp]        
post_is %6.3f "-3.216" _b[female_share]
post_is %5.3f "8.700" _se[female_share]
post_is %5.3f "0.714" 2*ttail(e(df_r), abs(_b[female_share]/_se[female_share]))
scalar b_cov  = _b[txp]
scalar se_cov = _se[txp]
show "Shift from adding female_share" b_cov - b_twfe   // 0.0132

* 7.4 Programmatic access to results (the post's .coef(), .se(), .tstat(), ...)
estimates restore twfe
scalar t_twfe  = _b[txp] / _se[txp]
scalar p_twfe  = 2*ttail(e(df_r), abs(t_twfe))
scalar lo_twfe = _b[txp] - invttail(e(df_r), .025)*_se[txp]
scalar hi_twfe = _b[txp] + invttail(e(df_r), .025)*_se[txp]
show "Coefficient"  _b[txp]                           // 25.3149
show "Std. error"   _se[txp]                          // 0.5851
show "t-statistic"  t_twfe                            // 43.2655
show "p-value"      p_twfe                            // 0.0000
show "95% CI lower" lo_twfe                           // 24.13
show "95% CI upper" hi_twfe                           // 26.50
post_is %7.4f "25.3149" _b[txp] 
post_is %6.4f "0.5851" _se[txp]
post_is %7.4f "43.2655" t_twfe  
post_is %5.2f "24.13" lo_twfe 
post_is %5.2f "26.50" hi_twfe 

* 7.5 Comparison across specifications (the post's table)
display as text _n "Specification        Estimate   SE      95% CI"
foreach m in ols twfe twfe_cov {
    estimates restore `m'
    local df = cond("`m'" == "ols", e(df_r), e(df_r))
    display as text %-20s "`m'" as result %9.3f _b[txp] %8.3f _se[txp]    ///
        "   [" %5.2f _b[txp] - invttail(`df', .025)*_se[txp] ", "            ///
        %5.2f _b[txp] + invttail(`df', .025)*_se[txp] "]"
}
estimates restore ols
post_is %5.2f "24.09" _b[txp] - invttail(e(df_r), .025)*_se[txp]
post_is %5.2f "26.54" _b[txp] + invttail(e(df_r), .025)*_se[txp]
estimates restore twfe_cov
post_is %5.2f "24.10" _b[txp] - invttail(e(df_r), .025)*_se[txp]
post_is %5.2f "26.56" _b[txp] + invttail(e(df_r), .025)*_se[txp]


*==============================================================================
* 8. INFERENCE COMPARISON                                    (post section 8)
*    Same coefficient, 25.3149, four variance estimators.
*==============================================================================
quietly xtreg gpa txp i.time, fe                      // iid: df = 70 - 35 - 2 = 33
scalar se_iid = _se[txp]
quietly regress gpa txp i.id i.time, vce(robust)      // HC1 with all 37 parameters
scalar se_hc1 = _se[txp]
* NOT xtreg, fe vce(robust): after xtreg that silently means cluster.

* CRV3 as pyfixest computes it: drop one school, re-estimate, repeat 35 times;
* centre the 35 estimates on the FULL-sample estimate and multiply by the CRV1
* small-sample factor G/(G-1) x (N-1)/(N-K) = 35/34 x 69/67 (K = 3: txp, one
* period dummy, the constant). Stata's own xtreg, fe vce(jackknife) centres
* on the replicate mean with (G-1)/G and gives 0.6101 instead.
scalar ss = 0
forvalues g = 1/35 {
    quietly xtreg gpa txp i.time if id != `g', fe
    scalar ss = ss + (_b[txp] - did)^2
}
scalar se_crv3 = sqrt(35/34 * 69/67 * ss)

display as text _n "SE type   SE       t"
foreach v in iid hc1 twfe crv3 {
    display as text %-8s "`v'" as result %8.4f se_`v' %8.2f did/se_`v'
}
post_is %6.4f "0.6071" se_iid 
post_is %6.4f "0.5852" se_hc1 
post_is %6.4f "0.5851" se_twfe
post_is %6.4f "0.6373" se_crv3
post_is %5.2f "41.70" did/se_iid 
post_is %5.2f "43.26" did/se_hc1 
post_is %5.2f "43.27" did/se_twfe
post_is %5.2f "39.72" did/se_crv3
quietly xtreg gpa txp i.time, fe vce(jackknife)
post_is %6.4f "0.6101" _se[txp]                       // Stata's definition

* Figure 5: SE comparison.
if $EXPORT {
    preserve
    clear
    quietly set obs 4
    generate str4 type = ""
    generate se = .
    local i = 0
    foreach v in iid hc1 twfe crv3 {
        local ++i
        quietly replace type = word("iid HC1 CRV1 CRV3", `i') in `i'
        quietly replace se = se_`v' in `i'
    }
    generate order = _n
    graph hbar se, over(type, sort(order) descending) bar(1, color("$BLUE"))  ///
        blabel(bar, format(%6.4f)) yscale(range(0 0.75))                        ///
        ytitle("Standard error of the DiD estimate")                            ///
        title("Standard errors across inference methods")
    graph export "did101_se_comparison_stata.png", width(1600) replace
    restore
}


*==============================================================================
* 9. PUBLICATION-QUALITY TABLES                              (post section 9)
*    9.1-9.2: the two TWFE specifications side by side (pyfixest csw()).
*    9.3-9.4: the three specifications, text and LaTeX (Great Tables / etable).
*==============================================================================
etable, estimates(twfe twfe_cov) keep(txp female_share)                 ///
    stars(.05 "*" .01 "**" .001 "***", attach(_r_b)) showstarsnote       ///
    mstat(N) mstat(r2_w) cstat(_r_b, nformat(%7.3f)) cstat(_r_se, nformat(%7.3f))

etable, estimates(ols twfe twfe_cov) keep(treated post txp female_share _cons) ///
    stars(.05 "*" .01 "**" .001 "***", attach(_r_b)) showstarsnote             ///
    mstat(N) cstat(_r_b, nformat(%7.3f)) cstat(_r_se, nformat(%7.3f))           ///
    title("Table 2: DiD estimates across specifications")
if $EXPORT {
    quietly etable, estimates(ols twfe twfe_cov) keep(treated post txp female_share _cons) ///
        stars(.05 "*" .01 "**" .001 "***", attach(_r_b))                             ///
        mstat(N) export("did101_table2_stata.tex", replace)
}


*==============================================================================
* 10. COEFFICIENT COMPARISON                                (post section 10)
*==============================================================================
show "Range of the three estimates" b_cov - b_ols     // 0.013
post_is %5.3f "0.013" b_cov - b_ols
if $EXPORT {
    preserve
    clear
    quietly set obs 3
    generate y = 4 - _n
    generate b = .
    generate lo = .
    generate hi = .
    local i = 0
    foreach m in ols twfe twfe_cov {
        local ++i
        estimates restore `m'
        quietly replace b  = _b[txp] in `i'
        quietly replace lo = _b[txp] - invttail(e(df_r), .025)*_se[txp] in `i'
        quietly replace hi = _b[txp] + invttail(e(df_r), .025)*_se[txp] in `i'
    }
    twoway (rcap lo hi y, horizontal lcolor("$BLUE")) (scatter y b, mcolor("$TEAL") msize(large)), ///
        ylabel(3 "(1) OLS, HC1" 2 "(2) TWFE, CRV1" 1 "(3) TWFE + cov, CRV1", angle(0))            ///
        yscale(range(0.5 3.5)) ytitle("") xtitle("DiD estimate (txp coefficient)")                 ///
        title("Coefficient comparison across specifications") legend(off)
    graph export "did101_coefplot_stata.png", width(1600) replace
    restore
}


*==============================================================================
* 11. EVENT STUDY: DYNAMIC TREATMENT EFFECTS                (post section 11)
*==============================================================================
* 11.1 Load the event-study data
load_csv tutoring_didevent.csv
assert _N == 280 & c(k) == 8
xtset id time
assert "`r(balanced)'" == "strongly balanced"
tabulate timeToTreat, missing
quietly count if missing(timeToTreat)
assert r(N) == 200                                    // the 25 comparison schools
assert timeToTreat == time - 5 if treated == 1

* Figure 8: panel view for the event study.
if $EXPORT {
    generate byte cell = cond(txp == 1, 3, cond(treated == 1, 2, 1))
    twoway (scatter id time if cell == 1, msymbol(S) mcolor("$BLUE"))   ///
           (scatter id time if cell == 2, msymbol(S) mcolor("$PEACH"))  ///
           (scatter id time if cell == 3, msymbol(S) mcolor("$ORANGE")), ///
        yscale(reverse) xlabel(1(1)8) ylabel(1 6 11 16 21 26 31 35, angle(0))       ///
        xline(4.5, lpattern(dash) lcolor(red))                                      ///
        xtitle("Time period") ytitle("School ID")                           ///
        title("Panel structure: event study (35 schools x 8 periods)")       ///
        legend(order(1 "Comparison group" 2 "Treated (pre)" 3 "Treated (post)") rows(1) position(6))
    graph export "did101_panelview_event_stata.png", width(1600) replace
    drop cell
}

* 11.2-11.3 Estimation. pyfixest's i(timeToTreat, ref=-1) needs a placeholder
* for the comparison schools; Stata factor variables cannot be negative, so we
* build the seven event dummies by hand. (missing == k) is 0, so comparison
* schools get 0 on every dummy and stay in the sample.
local ev ""
foreach k in -4 -3 -2 0 1 2 3 {
    local nm = cond(`k' < 0, "lead" + string(-`k'), "lag" + string(`k'))
    generate byte `nm' = (timeToTreat == `k')
    local ev "`ev' `nm'"
}
xtreg gpa `ev' i.time, fe vce(cluster id)
estimates store event
assert e(N) == 280

* The post's numbers, period by period (estimate, SE, CI, p).
matrix POST = ( 0.342, 0.401, -0.47,  1.16 \  -0.322, 0.441, -1.22,  0.57 \ ///
                0.593, 0.423, -0.27,  1.45 \  25.028, 0.445, 24.12, 25.93 \ ///
               24.705, 0.559, 23.57, 25.84 \  24.768, 0.739, 23.27, 26.27 \ ///
               25.701, 0.797, 24.08, 27.32)
matrix PVAL = (0.400 \ 0.471 \ 0.170)                 // leads only
display as text _n "Event time  Estimate      SE   95% CI             p"
local i = 0
foreach nm of local ev {
    local ++i
    local t : word `i' of -4 -3 -2 0 1 2 3
    scalar lo = _b[`nm'] - invttail(e(df_r), .025)*_se[`nm']
    scalar hi = _b[`nm'] + invttail(e(df_r), .025)*_se[`nm']
    scalar p  = 2*ttail(e(df_r), abs(_b[`nm']/_se[`nm']))
    display as text "  t = " %2s "`t'" as result %10.3f _b[`nm'] %8.3f _se[`nm'] ///
        "   [" %6.2f lo ", " %6.2f hi "]   " %5.3f p
    local pb  = strtrim(string(POST[`i',1], "%7.3f"))
    local pse = strtrim(string(POST[`i',2], "%5.3f"))
    local plo = strtrim(string(POST[`i',3], "%6.2f"))
    local phi = strtrim(string(POST[`i',4], "%6.2f"))
    post_is %7.3f "`pb'"  _b[`nm']
    post_is %5.3f "`pse'" _se[`nm']
    post_is %6.2f "`plo'" lo
    post_is %6.2f "`phi'" hi
    if `i' <= 3 {
        local pp = strtrim(string(PVAL[`i',1], "%5.3f"))
        post_is %5.3f "`pp'" p
    }
    else assert p < 0.001
}
quietly regress gpa `ev' i.id i.time
post_is %5.3f "0.991" e(r2)
post_is %5.3f "1.134" sqrt(e(rss)/e(N))

* 11.4 Event-study plot and 11.5 coefficient table (Figures 9 and 10).
if $EXPORT {
    preserve
    clear
    quietly set obs 8
    generate t = _n - 5
    generate b = 0
    generate lo = 0
    generate hi = 0
    estimates restore event
    local r = 0
    forvalues i = 1/8 {
        if `i' == 4 continue                          // t = -1, the reference
        local ++r
        local nm : word `r' of `ev'
        quietly replace b  = _b[`nm'] in `i'
        quietly replace lo = _b[`nm'] - invttail(e(df_r), .025)*_se[`nm'] in `i'
        quietly replace hi = _b[`nm'] + invttail(e(df_r), .025)*_se[`nm'] in `i'
    }
    twoway (rarea lo hi t, color("$BLUE%25"))                                  ///
           (connected b t, lcolor("$TEAL") mcolor("$TEAL") lwidth(thick)),     ///
        yline(0, lcolor(gs8)) xline(-0.5, lpattern(dash) lcolor(red)) xlabel(-4(1)3) ///
        xtitle("Periods relative to treatment") ytitle("Estimated coefficient")  ///
        title("Event study: dynamic treatment effects") legend(off)
    graph export "did101_event_study_stata.png", width(1600) replace
    restore
}

display as text _n "analysis.do finished: every number the post quotes was reproduced."
