*============================================================================
* SYNTHETIC CONTROL METHOD (SCM) IN STATA WITH synth2: a one-page cheat sheet
*
* Companion to https://carlos-mendez.org/tutorials/python_sc101/
* Companions: cheatsheet_python.py, cheatsheet_R.R, script.py (post script)
*
* This file is the Stata port of cheatsheet_python.py. It uses the same data,
* the same specification, and the same sections, and it prints the same
* comparison table at the end. Its synth2 commands are those of the Stata
* edition of the post, https://carlos-mendez.org/tutorials/stata_sc/.
*
* Install (once):  ssc install synth, all
*                  ssc install synth2, all
*   These lines install the current SSC versions. This file was verified
*   with synth 0.0.7 and synth2 2.1.0. SSC now serves synth 0.0.8, so never
*   add the replace option on a machine that has 0.0.7 (trap 1).
*
* Usage: inside Stata,  . do cheatsheet_stata.do
*   or in batch mode,  stata-se -b do cheatsheet_stata.do > /dev/null
*   (on macOS the binary is in /Applications/Stata/StataSE.app/Contents/MacOS/).
*   In batch mode the synth plugin prints every iteration to the terminal,
*   which the redirection silences; all results still go to the log. The
*   batch log starts with the license details of the installation: do not
*   commit or share it.
* Run time: about 13 minutes, mostly the nested placebo fits of section 6.
*           Besides the batch log, the only file written is the figure, in
*           c(tmpdir).
* Verified with: Python 3.13 / R 4.5 / Stata 19
*                (synth2 2.1.0 and synth 0.0.7; mlsynth 1.0.0; tidysynth 0.2.1)
*
* Contents
*   0.  Vocabulary in thirty seconds
*   1.  Load the data (local copy, then URL)
*   2.  Prepare the panel
*   3.  Fit the synthetic control
*   4.  Weights, balance, fit, and ATT
*   5.  The rounded Stata weights reproduce −19.0018
*   6.  In-space placebo test
*   7.  In-time placebo test (fake start in 1985)
*   8.  Leave-one-out refits
*   9.  The plot (temporary folder only)
*   10. Traps that silently give wrong answers
*   11. Comparison table (identical in all three cheat sheets)
*============================================================================

clear all
set more off
set linesize 120
version 16               // synth2 stores its paths in frames (Stata 16+)


*-------------------------------------------------------------------------------
* 0. VOCABULARY IN THIRTY SECONDS
*
*   Synthetic control ....... a weighted average of donor states that tracks
*                             California before 1989. After 1989 the same
*                             average estimates sales without Proposition 99.
*   Donor pool .............. the 38 untreated states that may receive weight.
*   W (donor weights) ....... nonnegative weights that sum to one. Here five
*                             states receive positive weight.
*   Predictors .............. what W must match before 1989: four covariates
*                             averaged over 1980–1988 and sales in 1975, 1980,
*                             and 1988 (lagged outcomes).
*   V (predictor weights) ... how much each predictor counts in the match. V
*                             is chosen to fit sales before 1989, and it is not
*                             identified: very different V give the same W.
*   Gap ..................... observed minus synthetic sales in one year.
*   ATT ..................... the mean gap over 1989–2000, the average
*                             treatment effect on the treated unit, California.
*   RMSE .................... root mean squared gap over 1970–1988 (the fit).
*   MSPE ratio .............. mean squared gap after 1988 divided by the mean
*                             squared gap before 1989.
*   In-space placebo ........ refit with each state treated in turn; p is the
*                             share of the 39 units whose MSPE ratio is at
*                             least that of California.
*   cut(2) .................. keep the placebo states whose MSPE before 1989
*                             is at most twice that of California.
*   In-time placebo ......... move the start to a year without a program
*                             (1985); large fake gaps are a warning sign.
*   Leave-one-out ........... drop each positive-weight donor and refit.
*-------------------------------------------------------------------------------


*-------------------------------------------------------------------------------
* 1. LOAD THE DATA (LOCAL COPY, THEN URL)
*    Abadie, Diamond, and Hainmueller (2010) study cigarette sales in 39 US
*    states over 1970–2000. The panel has one row per state and year, 1,209
*    rows in all. California started Proposition 99 in 1989, and the other 38
*    states form the donor pool.
*      cigsale    cigarette sales per capita (packs), the outcome
*      lnincome   log GDP per capita (observed 1972–1997)
*      age15to24  share of the population aged 15–24 (observed 1970–1990)
*      retprice   average retail price of cigarettes
*      beer       beer consumption per capita (observed 1984–1997)
*    The loader tries the Stata copy of the post first, then its CSV copy,
*    and then the original file of quarcs-lab. The CSV is imported with
*    asdouble, so every value keeps full precision. A state stored as text is
*    encoded in alphabetical order, so California is again unit 3.
*-------------------------------------------------------------------------------
global DTA_URL "https://github.com/quarcs-lab/data-open/raw/master/isds/smoking_sc.dta"

capture program drop load_panel
program define load_panel
    local src ""
    foreach f in data/smoking_sc.dta smoking_sc.dta data/smoking_sc.csv smoking_sc.csv {
        if "`src'" == "" {
            capture confirm file "`f'"
            if !_rc local src "`f'"
        }
    }
    if "`src'" == "" local src "$DTA_URL"
    if substr("`src'", -4, .) == ".csv" {
        quietly import delimited "`src'", clear asdouble case(preserve) encoding(utf-8)
    }
    else {
        use "`src'", clear
    }
    capture confirm string variable state
    if !_rc {
        encode state, generate(id) label(state)     // alphabetical codes
        drop state
        rename id state
    }
    display as text "Loaded: `src' (" _N " rows)"
end

load_panel
assert _N == 1209
assert "`: label (state) 3'" == "California"         // unit 3, as in the post
xtset state year
assert "`r(balanced)'" == "strongly balanced"


*-------------------------------------------------------------------------------
* 2. PREPARE THE PANEL
*    The synth2 command needs a declared panel and nothing else. The treated
*    unit and the first treated year are options, and cigsale(1975) names a
*    lagged outcome. The covariates are averaged over xperiod(), and missing
*    years are skipped. The means of California below form the Treated column
*    of the balance table.
*-------------------------------------------------------------------------------
matrix TREATED = J(1, 7, .)
local j = 0
foreach v in lnincome age15to24 retprice beer {
    local ++j
    quietly summarize `v' if state == 3 & inrange(year, 1980, 1988), meanonly
    matrix TREATED[1, `j'] = r(mean)
}
foreach y in 1988 1980 1975 {
    local ++j
    quietly summarize cigsale if state == 3 & year == `y', meanonly
    matrix TREATED[1, `j'] = r(mean)
}
matrix colnames TREATED = lnincome age15to24 retprice beer cig1988 cig1980 cig1975
matrix list TREATED, format(%9.4f)
* 10.0766  0.1735  89.4222  24.2800  90.1000  120.2000  127.1000


*-------------------------------------------------------------------------------
* 3. FIT THE SYNTHETIC CONTROL
*    The nested option searches V and W together, and allopt tries three
*    starting points for V. The option trperiod(1989) sets the first treated
*    year, whereas tidysynth wants the last untreated year. The option
*    frame(base) keeps the paths for sections 4, 5, and 9, and nofigure skips
*    the graphs of synth2. This command takes less than a minute.
*-------------------------------------------------------------------------------
synth2 cigsale lnincome age15to24 retprice beer cigsale(1988) cigsale(1980) ///
    cigsale(1975), trunit(3) trperiod(1989) xperiod(1980(1)1988) nested allopt ///
    frame(base) nofigure
matrix W   = e(U_wt)          // positive donors only, rounded to three decimals
matrix BAL = e(bal)
scalar base_att  = e(att)     // not att: synth2 overwrites att (trap 8)
scalar base_rmse = e(rmse)
scalar base_r2   = e(r2)      // synth2 definition (trap 6)


*-------------------------------------------------------------------------------
* 4. WEIGHTS, BALANCE, FIT, AND ATT
*-------------------------------------------------------------------------------
matrix list W, format(%6.3f)
* Utah 0.334, Nevada 0.235, Montana 0.202, Colorado 0.161, Connecticut 0.068
matrix list BAL, format(%9.4f)

frame base {
    quietly ds pred*                         // pred·cigsale (trap 3)
    local pred `r(varlist)'
    quietly generate double gap = cigsale - `pred' if state == 3
    quietly generate double gap2 = gap^2
    quietly summarize gap2 if year < 1989
    scalar ssr = r(sum)
    quietly summarize cigsale if state == 3 & year < 1989
    scalar r2_usual = 1 - ssr / (r(Var) * (r(N) - 1))
    quietly summarize gap if year == 2000
    scalar gap2000 = r(mean)
    quietly summarize `pred' if state == 3 & year >= 1989
    scalar att_pct = 100 * base_att / r(mean)
}
display as text _n "ATT " %8.4f base_att " (" %5.1f att_pct " percent), RMSE " ///
    %6.4f base_rmse ", gap in 2000 " %6.2f gap2000
display as text "R-squared " %6.4f r2_usual " (usual) and " %6.4f base_r2 " (synth2)"
* ATT −19.0018 (−23.9 percent), RMSE 1.7557, gap in 2000 −25.76
* R-squared 0.9762 (usual) and 0.9743 (synth2)


*-------------------------------------------------------------------------------
* 5. THE ROUNDED STATA WEIGHTS REPRODUCE −19.0018
*    The synth2 command prints its weights rounded to three decimals and
*    predicts with those rounded weights. Rebuilding synthetic California from
*    e(U_wt) by hand therefore reproduces e(att) to every printed digit. The
*    small differences from the other two tools come from the optimizer, not
*    from the data.
*-------------------------------------------------------------------------------
preserve
decode state, generate(name)
quietly replace name = subinstr(name, " ", "", .)    // synth2 drops spaces
generate double w = 0
local names : rownames W
local k : word count `names'
forvalues j = 1/`k' {
    local s : word `j' of `names'
    quietly replace w = W[`j', 1] if name == "`s'"
}
generate double wy = w * cigsale
generate double y_ca = cigsale if state == 3
collapse (sum) synth = wy (max) y_ca, by(year)
generate double gap = y_ca - synth
generate double gap2 = gap^2
quietly summarize gap if year >= 1989
scalar att_hand = r(mean)
quietly summarize gap2 if year < 1989
scalar ssr_hand = r(sum)
quietly summarize synth if year < 1989
scalar r2_hand = 1 - ssr_hand / (r(Var) * (r(N) - 1))
display as text _n "Stata weights by hand: ATT " %8.4f att_hand ///
    ", R-squared " %7.5f r2_hand
assert string(att_hand, "%9.4f") == "-19.0018" & abs(att_hand - base_att) < 1e-5
assert string(r2_hand, "%9.5f") == "0.97434"
restore


*-------------------------------------------------------------------------------
* 6. IN-SPACE PLACEBO TEST
*    The option placebo(unit cut(2)) refits the model with each donor state
*    treated, and California stays in every placebo donor pool. The command
*    first refits California without allopt and with sigf(6) (trap 2). The
*    matrix e(mspe) holds the MSPE table with California in row 1, and e(pval)
*    holds the pointwise p-values. This command takes about eleven minutes.
*-------------------------------------------------------------------------------
synth2 cigsale lnincome age15to24 retprice beer cigsale(1988) cigsale(1980) ///
    cigsale(1975), trunit(3) trperiod(1989) xperiod(1980(1)1988) nested ///
    placebo(unit cut(2)) sigf(6) nofigure
matrix MSPE    = e(mspe)      // PreMSPE PostMSPE RatioPostPre RatioTrCtrl
matrix PVAL    = e(pval)      // effect, two-sided, right-sided, left-sided p
matrix W_REFIT = e(U_wt)      // weights of the refit of California (trap 2)
scalar att_refit = e(att)
scalar ratio_ca = MSPE[1, 3]
scalar n_units  = rowsof(MSPE)
scalar rank_ca  = 0
scalar kept     = 0
scalar kept_ge  = 0
forvalues i = 1/`=rowsof(MSPE)' {
    scalar rank_ca = rank_ca + (MSPE[`i', 3] >= ratio_ca)
    if MSPE[`i', 4] <= 2 {                               // cut(2)
        scalar kept    = kept + 1
        scalar kept_ge = kept_ge + (MSPE[`i', 3] >= ratio_ca)
    }
}
scalar p_all = rank_ca / n_units
scalar p_cut = kept_ge / kept
display as text _n "California: MSPE ratio " %5.1f ratio_ca ", rank " rank_ca ///
    " of " n_units ", p = " %5.3f p_all
display as text "cut(2): " kept " units kept, p = " %5.3f p_cut
* MSPE ratio 123.5, rank 1 of 39, p = 0.026; cut(2) keeps 20 units, p = 0.050

* Pointwise p-values: in each year, the left-sided p is the share of kept
* units whose gap is at most that of California. The effect is negative, so
* the left-sided test is the relevant one. With 20 kept units, the smallest
* attainable value is 1/20 = 0.05.
local line ""
forvalues i = 1/`=rowsof(PVAL)' {
    local line "`line' `: display %4.2f PVAL[`i', 4]'"
}
display as text "Left-sided p, 1989–2000:`line'"


*-------------------------------------------------------------------------------
* 7. IN-TIME PLACEBO TEST (FAKE START IN 1985)
*    We pretend that the program began in 1985. The covariates are averaged
*    over 1980–1984, and the 1988 lag is dropped because it lies after the
*    fake start. The command first prints this reduced model estimated at
*    1989, and only its second table belongs to the fake start (trap 4). We
*    read the gaps over 1985–1988 from frame(intime).
*-------------------------------------------------------------------------------
synth2 cigsale lnincome age15to24 retprice beer cigsale(1980) cigsale(1975), ///
    trunit(3) trperiod(1989) xperiod(1980(1)1984) nested placebo(period(1985)) ///
    frame(intime) nofigure
frame intime {
    quietly ds tr*1985                       // tr·cigsale·1985 (trap 3)
    local fake `r(varlist)'
    list year `fake' if state == 3 & inrange(year, 1985, 1988), noobs
    quietly summarize `fake' if state == 3 & inrange(year, 1985, 1988)
    scalar fake_mean = r(mean)
}
display as text "Mean fake gap, 1985–1988: " %6.2f fake_mean      // −5.99


*-------------------------------------------------------------------------------
* 8. LEAVE-ONE-OUT REFITS
*    The loo option drops each positive-weight donor in turn and refits the
*    model, after a first refit of California without allopt (trap 2). The
*    paths of the five refits and their minimum and maximum are stored in
*    frame(loo). Every refit keeps a large negative gap in 2000.
*-------------------------------------------------------------------------------
synth2 cigsale lnincome age15to24 retprice beer cigsale(1988) cigsale(1980) ///
    cigsale(1975), trunit(3) trperiod(1989) xperiod(1980(1)1988) nested loo ///
    frame(loo) nofigure
frame loo {
    display as text _n "Gap in 2000 without each donor:"
    foreach v of varlist tr*rmv* {
        quietly summarize `v' if state == 3 & year == 2000
        local who = substr("`v'", strpos("`v'", "rmv") + 3, .)
        display as text "  " %-12s "`who'" %8.2f r(mean)
    }
    quietly ds tr*loomin                     // tr·cigsale·loomin (trap 3)
    local vmin `r(varlist)'
    quietly ds tr*loomax
    local vmax `r(varlist)'
    quietly summarize `vmin' if state == 3 & year == 2000
    scalar loo_min = r(mean)
    quietly summarize `vmax' if state == 3 & year == 2000
    scalar loo_max = r(mean)
}
display as text "Range: " %6.2f loo_min " to " %6.2f loo_max     // −28.35 to −23.49


*-------------------------------------------------------------------------------
* 9. THE PLOT (TEMPORARY FOLDER ONLY)
*    The frame of section 3 holds the observed and synthetic paths. We draw
*    them with twoway and mark 1989 with a dotted line. The file goes to
*    c(tmpdir), never next to this file.
*-------------------------------------------------------------------------------
frame base {
    quietly ds pred*
    local pred `r(varlist)'
    twoway (line cigsale year if state == 3, lcolor("217 119 87") lwidth(medthick)) ///
           (line `pred' year if state == 3, lcolor("106 155 204") lpattern(dash)), ///
        xline(1989, lpattern(dot) lcolor(gs8))                                 ///
        ytitle("Cigarette sales (packs per capita)") xtitle("Year")           ///
        legend(order(1 "California" 2 "Synthetic California"))               ///
        title("Observed and synthetic California") name(sc101, replace)
}
local png = subinstr(c(tmpdir) + "/", "//", "/", .) + "sc101_cheatsheet_stata.png"
quietly graph export "`png'", name(sc101) width(1200) replace
display as text _n "Figure saved to" _n "  `png'"


*-------------------------------------------------------------------------------
* 10. TRAPS THAT SILENTLY GIVE WRONG ANSWERS
*
*  1. NEVER LET ssc REPLACE synth 0.0.7. SSC now serves synth 0.0.8, and the
*     replace option of ssc install upgrades it without asking. The numbers of
*     this file and of the post come from synth 0.0.7; check the version with
*     which synth. Demo below.
*
*  2. allopt AND sigf() CHANGE THE FIT. The baseline uses allopt with the
*     default sigf(7). The placebo command uses sigf(6) without allopt and
*     refits California first, so its weights and its MSPE ratio come from
*     that refit, not from the baseline. The loo command also refits without
*     allopt. Demo below.
*
*  3. FRAME VARIABLES CARRY A MIDDLE DOT. The synth2 command names its frame
*     variables pred·cigsale, tr·cigsale·1985, or tr·cigsale·loomin. Names
*     typed with an underscore or a period fail. Use wildcards such as
*     tr*loomin, as above, or add symbol(2) to get underscores.
*
*  4. THE IN-TIME COMMAND PRINTS TWO MODELS. Its first table is the reduced
*     model estimated at the real date, 1989 (RMSE 2.2053). Only the second
*     table and the tr·cigsale·1985 variable belong to the fake start.
*
*  5. W IS ROUNDED TO THREE DECIMALS. The command predicts with the rounded
*     weights (section 5). Compare weights across tools at three decimals and
*     effects at two.
*
*  6. R-SQUARED USES THE SYNTHETIC SERIES. The synth2 command divides by the
*     variance of the synthetic path, not of California. It reports 0.974
*     where the usual definition gives 0.976 (section 4).
*
*  7. e(U_wt) LISTS POSITIVE DONORS ONLY. An absent state has weight 0, and
*     the note under the weight table names the other 33 states. Read a
*     weight by row name, for example W[rownumb(W, "Utah"), 1].
*
*  8. synth2 OVERWRITES THE SCALARS att, rmse, r2, mse, AND mae. Each call
*     stores its results in global scalars with these names, so a later call
*     silently replaces a scalar of the same name that we saved earlier. Save
*     results under other names, such as base_att in section 3. Demo below.
*-------------------------------------------------------------------------------
display as text _n "Trap 1: installed versions"
which synth
which synth2
display as text "Trap 2: Utah gets " %5.3f W[rownumb(W, "Utah"), 1] ///
    " in the baseline and " %5.3f W_REFIT[rownumb(W_REFIT, "Utah"), 1] ///
    " in the placebo refit; ATT " %8.4f base_att " versus " %8.4f att_refit
display as text "Trap 8: the scalar att now holds " %8.4f scalar(att)            ///
    ", the ATT of the last synth2 call; base_att still holds " %8.4f base_att


*-------------------------------------------------------------------------------
* 11. COMPARISON TABLE (IDENTICAL IN ALL THREE CHEAT SHEETS)
*    The table lists one row per tool, and every file prints the same text.
*    Each file computes its own row live and checks it against the reference
*    row; this file requires equality to every printed decimal. The other two
*    rows are what cheatsheet_python.py and cheatsheet_R.R print.
*-------------------------------------------------------------------------------
* Columns: weights of Utah, Nevada, Montana, Colorado, and Connecticut; ATT;
* RMSE; MSPE ratio; p over 39 units; cut(2) units kept; cut(2) p.
matrix REF = (0.335, 0.236, 0.202, 0.160, 0.068, -18.98, 1.754, 129.0, 0.026, 20, 0.050 \ ///
              0.342, 0.238, 0.209, 0.149, 0.062, -18.85, 1.779, 123.9, 0.026,  7, 0.143 \ ///
              0.334, 0.235, 0.202, 0.161, 0.068, -19.00, 1.756, 123.5, 0.026, 20, 0.050)
* In-time 1985 mean fake gap; leave-one-out min and max gap in 2000.
matrix ROB = (-5.97, -27.15, -23.48 \ -5.98, -28.25, -24.07 \ -5.99, -28.35, -23.49)

capture program drop show_table
program define show_table
    local t1 "Python mlsynth 1.0.0"
    local t2 "R tidysynth 0.2.1"
    local t3 "Stata synth2 2.1.0"
    display as text _dup(78) "="
    display as text "Synthetic California in three languages: one specification, one panel"
    display as text _dup(78) "="
    display as text %-22s "Donor weights" %8s "Utah" %8s "Nevada" %9s "Montana" ///
        %10s "Colorado" %13s "Connecticut"
    forvalues i = 1/3 {
        display as text %-22s "`t`i''" %8.3f REF[`i', 1] %8.3f REF[`i', 2]   ///
            %9.3f REF[`i', 3] %10.3f REF[`i', 4] %13.3f REF[`i', 5]
    }
    display as text _dup(78) "-"
    display as text %-22s "Effect and inference" %8s "ATT" %8s "RMSE"         ///
        %12s "MSPE ratio" %8s "p (39)" %10s "cut(2) n" %8s "p"
    forvalues i = 1/3 {
        display as text %-22s "`t`i''" %8.2f REF[`i', 6] %8.3f REF[`i', 7]   ///
            %12.1f REF[`i', 8] %8.3f REF[`i', 9] %10.0f REF[`i', 10]         ///
            %8.3f REF[`i', 11]
    }
    display as text _dup(78) "-"
    display as text %-22s "Robustness" %14s "In-time 1985" %14s "LOO min 2000" ///
        %14s "LOO max 2000"
    forvalues i = 1/3 {
        display as text %-22s "`t`i''" %14.2f ROB[`i', 1] %14.2f ROB[`i', 2] ///
            %14.2f ROB[`i', 3]
    }
    display as text _dup(78) "="
    display as text "Notes. ATT: mean gap over 1989–2000, in packs per capita. RMSE: fit over"
    display as text "1970–1988. MSPE ratio: mean squared gap after 1988 over that before 1989."
    display as text "p (39): share of the 39 units with a ratio at least that of California."
    display as text "cut(2) n: units whose MSPE before 1989 is at most twice that of California,"
    display as text "and p is the same share among them. In-time 1985: mean fake gap over"
    display as text "1985–1988. LOO: smallest and largest gap in 2000 across the five refits."
    display as text "Why the rows differ: V is not identified, so each optimizer stops at its own"
    display as text "W. Stata rounds W to three decimals and takes its MSPE ratio from a refit"
    display as text "inside its placebo command. In tidysynth, every placebo fit reuses the V of"
    display as text "California, so its placebo fits are looser and fewer states pass cut(2)."
end

matrix LIVE = (W[rownumb(W, "Utah"), 1], W[rownumb(W, "Nevada"), 1],       ///
               W[rownumb(W, "Montana"), 1], W[rownumb(W, "Colorado"), 1],   ///
               W[rownumb(W, "Connecticut"), 1], base_att, base_rmse,        ///
               ratio_ca, p_all,                                               ///
               kept, p_cut)
matrix LIVE_ROB = (fake_mean, loo_min, loo_max)
local fmts "%9.3f %9.3f %9.3f %9.3f %9.3f %9.2f %9.3f %9.1f %9.3f %9.0f %9.3f"
forvalues j = 1/11 {
    local f : word `j' of `fmts'
    assert string(LIVE[1, `j'], "`f'") == string(REF[3, `j'], "`f'")
}
forvalues j = 1/3 {
    assert string(LIVE_ROB[1, `j'], "%9.2f") == string(ROB[3, `j'], "%9.2f")
}
assert rank_ca == 1
display as text _n "This run: " %5.3f LIVE[1, 1] " " %5.3f LIVE[1, 2] " "  ///
    %5.3f LIVE[1, 3] " " %5.3f LIVE[1, 4] " " %5.3f LIVE[1, 5]               ///
    " | ATT " %6.2f base_att " | RMSE " %5.3f base_rmse " | ratio " %5.1f ratio_ca ///
    " | p " %5.3f p_all " | cut(2) " kept ", p " %5.3f p_cut
display as text "          in-time " %5.2f fake_mean " | LOO " %6.2f loo_min ///
    " to " %6.2f loo_max "; equal to the Stata rows at every printed decimal"
display ""
show_table
