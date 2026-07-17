****************************************************
* Covariates in Difference-in-Differences
* The LaLonde Test  (Stata companion do-file)
*
* Question:
*   Does adding baseline covariates to a diff-in-diff
*   recover the *right* treatment effect? On the famous
*   LaLonde / Dehejia-Wahba job-training data we estimate
*   the ATT eight different ways and compare each one to
*   the experimental benchmark of ~$1,794.
*
* The one lesson of this script:
*   Covariates rescue a diff-in-diff estimate ONLY when
*   they enter the control group's counterfactual *trend*
*   (X x post, or a saturated first difference).
*   Putting covariates in the *level* (additively) or in
*   the *effect* (interacted with treatment only) does
*   nothing — the naive $3,621 does not move.
*
* Companion to the tutorial at:
*   carlos-mendez.org/post/python_did_covariates_lalonde/
* Reproduces (in Stata) the Python post, which in turn
* reproduces Scott Cunningham's Mixtape essay:
*   "Covariates, diff in diff and LaLonde test" (2026).
*
* Data (loaded over the internet — no local files needed):
*   nsw_mixtape.dta  445 obs = 185 NSW trainees (treat=1)
*                              + 260 randomized controls
*   cps_mixtape.dta  15,992 CPS survey controls (treat=0)
*   Both from Cunningham's Mixtape GitHub repository.
*
* Non-experimental sample studied here:
*   185 treated trainees  +  15,992 CPS controls.
*   The 260 randomized controls are held out and used
*   ONLY to compute the experimental benchmark (the truth).
*
* Estimand: ATT (Average Treatment Effect on the Treated),
*   the earnings gain of the trainees from the program.
*
* Variables (all baseline / time-invariant):
*   treat     - 1 if in the NSW training program
*   age       - age in years   (agesq, agecube = powers)
*   educ      - years of schooling   (educsq = square)
*   black     - 1 if Black
*   hisp      - 1 if Hispanic
*   marr      - 1 if married
*   nodegree  - 1 if no high-school degree
*   re74/75/78- real earnings in 1974 / 1975 / 1978 ($)
*   u74       - 1 if unemployed in 1974 (re74 == 0)
*
* Usage:
*   1. Open Stata (17+ recommended) with an internet link
*   2. Run:  do analysis.do
*   3. Read the on-screen output; full log in analysis.log
*
* Required package (only for the final cross-check):
*   drdid   (Sant'Anna-Zhao doubly-robust estimator)
****************************************************

clear all
set more off
set seed 90210          // same seed as the Python bootstrap

* Install the one package used for the closing cross-check.
* Wrapped in -capture- so the script still runs if it is
* already installed (or if there is no internet at run time).
capture ssc install drdid, replace

* Start a log so the whole session is saved to analysis.log.
capture log close
log using "analysis.log", replace text


di _newline(2)
di "========================================================"
di "  SECTION 1: BUILD THE NON-EXPERIMENTAL SAMPLE"
di "========================================================"

*---------------------------------------------------
* Section 1.1: Load the trainees and the CPS controls
*---------------------------------------------------
* We keep only the 185 *treated* trainees from the NSW
* experiment and glue them onto the 15,992 CPS controls.
* This is the deliberately hard "observational" sample:
* the treated and the controls are NOT comparable.

use "https://github.com/scunning1975/mixtape/raw/master/nsw_mixtape.dta", clear
keep if treat == 1                 // 185 trainees only
tempfile trainees
save `trainees'

use "https://github.com/scunning1975/mixtape/raw/master/cps_mixtape.dta", clear
append using `trainees'            // 15,992 CPS + 185 trainees

*---------------------------------------------------
* Section 1.2: Build covariates and the outcome change
*---------------------------------------------------
* -ever_treated- is our treatment-group flag (D).
* -id- gives every person a unique number (used later
*  as the panel identifier and the bootstrap cluster).

gen ever_treated = treat
gen id = _n

* The canonical LaLonde covariate set. Note the polynomial
* terms in age/education and the "unemployed in 1974" dummy.
gen agesq   = age^2
gen agecube = age^3
gen educsq  = educ^2
gen u74     = (re74 == 0)

* First difference of earnings across the DiD window:
* pre = 1975, post = 1978. dy is the change we will model.
gen dy = re78 - re75

* Convenience macro holding the 11 covariates, so every
* specification below can reuse exactly the same X set.
global X "age agesq agecube educ educsq marr nodegree black hisp re74 u74"

* Save this one-row-per-person "wide" file. We reload it
* whenever a by-hand estimator needs one row per unit.
tempfile wide
save `wide'

di _newline(1)
di "Non-experimental sample:"
tab ever_treated       // 185 treated vs 15,992 CPS controls


di _newline(2)
di "========================================================"
di "  SECTION 2: THE EXPERIMENTAL BENCHMARK (the truth)"
di "========================================================"

*---------------------------------------------------
* Section 2.1: What the randomized experiment says
*---------------------------------------------------
* Because NSW randomized who got training, a plain
* comparison of 1978 earnings (treated vs the 260
* randomized controls) is already the honest ATT.
* This ~$1,794 is the number every estimate below is
* chasing. We compute it on the ORIGINAL experimental
* file (trainees + randomized controls), then set it
* aside — the rest of the script never uses it again.

use "https://github.com/scunning1975/mixtape/raw/master/nsw_mixtape.dta", clear
gen dy = re78 - re75

di _newline(1)
di "Experimental ATT, cross-section (re78 on treat):"
regress re78 treat, robust

di _newline(1)
di "Experimental ATT, diff-in-diff form (dy on treat):"
regress dy treat, robust

* Remember the target for the final summary table.
quietly regress re78 treat, robust
scalar benchmark = _b[treat]
di _newline(1) as txt "==> Benchmark ATT = " as res %6.0f benchmark as txt "  (the truth we want to recover)"


di _newline(2)
di "========================================================"
di "  SECTION 3: RESHAPE INTO A 2-PERIOD PANEL"
di "========================================================"

*---------------------------------------------------
* Section 3.1: One row per person-period
*---------------------------------------------------
* The level specifications need long data: two rows per
* person, one for 1975 (post=0) and one for 1978 (post=1),
* with the earnings in that year stored in -re-.

use `wide', clear
* reshape needs the two outcome columns to share a stub. We use the
* stub "earn" (NOT "re") on purpose: a stub of "re" would also grab
* the re74 covariate and turn it into a bogus third period. After the
* reshape we rename the stacked outcome back to -re-.
rename re75 earn0            // pre  period earnings
rename re78 earn1            // post period earnings
reshape long earn, i(id) j(post)   // post = 0 or 1
rename earn re

di _newline(1)
di "Panel cell counts (rows per group x period):"
tab ever_treated post              // 2x2 design, clearly visible

tempfile panel
save `panel'


di _newline(2)
di "========================================================"
di "  SECTION 4: EIGHT WAYS TO ESTIMATE THE SAME ATT"
di "========================================================"

*---------------------------------------------------
* Spec 0 - Naive TWFE (no covariates)
*---------------------------------------------------
* The plain 2x2 diff-in-diff. The DiD effect is the
* coefficient on the post # treated interaction. With no
* covariates it lands at ~$3,621 — roughly double the truth,
* because the CPS controls were on a different earnings path.

use `panel', clear
di _newline(1) as txt ">>> Spec 0: Naive TWFE (expect ~3,621, INERT)"
regress re i.post##i.ever_treated, robust
scalar s0 = _b[1.post#1.ever_treated]

*---------------------------------------------------
* Spec A - Additive covariates (X in the LEVEL)
*---------------------------------------------------
* Just adding the X's as extra regressors. Intuition:
* these covariates are time-invariant, so in a diff-in-diff
* they shift both periods equally and cancel out of the
* difference. The estimate does not budge from ~$3,621.

di _newline(1) as txt ">>> Spec A: Additive X in the level (expect ~3,621, INERT)"
regress re i.post##i.ever_treated $X, robust
scalar sA = _b[1.post#1.ever_treated]

*---------------------------------------------------
* Spec B - Covariates x POST (X in the TREND)
*---------------------------------------------------
* Now we let each covariate have its OWN time trend by
* interacting it with -post-. This lets the controls'
* counterfactual path bend to match the trainees, fixing
* the parallel-trends violation. The estimate SNAPS down
* to ~$1,711 — close to the truth. THIS is the fix.

di _newline(1) as txt ">>> Spec B: X x post, covariates in the trend (expect ~1,711, CORRECTED)"
regress re i.post##i.ever_treated $X c.post#(c.age c.agesq c.agecube c.educ c.educsq c.marr c.nodegree c.black c.hisp c.re74 c.u74), robust
scalar sB = _b[1.post#1.ever_treated]

*---------------------------------------------------
* Spec BT - Covariates x TREATMENT (X in the EFFECT)
*---------------------------------------------------
* A tempting but wrong "fix": interact X with the DiD
* switch T = post x treated (letting the *effect* vary
* with X) but WITHOUT giving controls a covariate-specific
* trend. Averaging the person-specific effects over the
* treated recovers ~$3,621 again — still INERT. Interacting
* with the effect is not the same as fixing the trend.

use `panel', clear
gen T = post * ever_treated                 // the DiD switch
* Fit levels with T and T#X, then read the ATT off with
* -margins-: the average change in prediction when T flips
* 0 -> 1, evaluated over the treated-post cells.
regress re i.post i.ever_treated T $X c.T#(c.age c.agesq c.agecube c.educ c.educsq c.marr c.nodegree c.black c.hisp c.re74 c.u74), robust
di _newline(1) as txt ">>> Spec BT: X x treatment in the effect (expect ~3,621, INERT)"
margins if ever_treated==1 & post==1, dydx(T)
scalar sBT = el(r(b),1,1)

*---------------------------------------------------
* Spec C - Saturated first difference (= HIT)
*---------------------------------------------------
* Model the earnings CHANGE dy directly, letting the
* effect of treatment depend fully on X (a saturated
* treated#X interaction). The ATT is the average predicted
* treated-minus-control change over the treated. This is
* algebraically the Heckman-Ichimura-Todd (1997) estimator
* and lands at ~$1,770 — corrected.

use `wide', clear
regress dy ever_treated $X c.ever_treated#(c.age c.agesq c.agecube c.educ c.educsq c.marr c.nodegree c.black c.hisp c.re74 c.u74), robust
* margins: average effect of switching ever_treated 0 -> 1,
* evaluated on the treated units only (the ATT).
di _newline(1) as txt ">>> Spec C: Saturated first difference (expect ~1,770, CORRECTED)"
margins if ever_treated==1, dydx(ever_treated)
scalar sC = el(r(b),1,1)

*---------------------------------------------------
* HIT (1997) - Heckman-Ichimura-Todd, by hand
*---------------------------------------------------
* The transparent version of Spec C. Fit the outcome-change
* model on the CONTROLS ONLY to learn their normal earnings
* trajectory, predict what each trainee's change "should"
* have been, and average the trainees' surprise (actual
* minus predicted). ~$1,770.

use `wide', clear
regress dy $X if ever_treated == 0          // controls' trend only
predict double dyhat, xb                     // predicted change for everyone
gen resid_hit = dy - dyhat
quietly summarize resid_hit if ever_treated == 1
scalar hit = r(mean)
di _newline(1) as txt ">>> HIT (1997) by hand: ATT = " as res %6.0f hit as txt " (expect ~1,770, CORRECTED)"

*---------------------------------------------------
* IPW (Abadie 2005) - inverse propensity weighting
*---------------------------------------------------
* Instead of modelling the outcome, model WHO gets treated.
* Fit a propensity score p(X) = P(treated | X), then reweight
* the earnings change so the reweighted controls look like
* the trainees. Weight w = (D - p)/(1 - p) / share_treated.
* ~$1,861.

logit ever_treated $X                       // propensity model
predict double phat, pr
quietly summarize ever_treated
scalar p_treat = r(mean)                     // share treated
gen w_ipw = (ever_treated - phat) / (1 - phat) / p_treat
gen contrib_ipw = w_ipw * dy
quietly summarize contrib_ipw
scalar ipw = r(mean)
di _newline(1) as txt ">>> IPW (Abadie 2005) by hand: ATT = " as res %6.0f ipw as txt " (expect ~1,861, PROPENSITY)"

*---------------------------------------------------
* DR (Sant'Anna-Zhao 2020) - doubly robust
*---------------------------------------------------
* The best of both worlds: combine the outcome model (dyhat
* from the controls, reused from HIT above) with the
* propensity weights (phat). It is "doubly robust" because
* it stays consistent if EITHER model is correct. ~$1,993.
*   dr_t = mean over treated of the residual
*   dr_c = IPW-weighted mean of the control residual
*   ATT  = dr_t - dr_c

* Use double precision throughout: the propensity odds phat/(1-phat)
* are large for units that look treated, so single precision loses
* accuracy in the weighted control term. (Note: the scalars below are
* named so they are NOT abbreviations of any variable name, otherwise
* Stata would read the variable instead of the scalar.)
gen double resid = dy - dyhat                 // same residual as HIT
* Treated piece: the average residual over the treated (equals HIT).
gen double drpieceT = ever_treated * resid / p_treat
quietly summarize drpieceT
scalar att_t = r(mean)
* Control piece: the propensity-odds-weighted residual over controls.
gen double drpieceC = (1 - ever_treated) * (phat/(1-phat)) * resid / p_treat
quietly summarize drpieceC
scalar att_c = r(mean)
scalar attDR = att_t - att_c
di _newline(1) as txt ">>> DR (Sant'Anna-Zhao 2020) by hand: ATT = " as res %6.0f attDR as txt " (expect ~1,993, PROPENSITY)"


di _newline(2)
di "========================================================"
di "  SECTION 5: CLUSTER-BOOTSTRAP STANDARD ERRORS"
di "========================================================"

*---------------------------------------------------
* Section 5.1: SEs for the by-hand estimators
*---------------------------------------------------
* The closed-form regressions above already report robust
* SEs. The by-hand HIT / IPW / DR estimators do not, so we
* bootstrap them: resample the units (one row per person in
* -wide-, so each person is its own cluster), re-estimate,
* and take the spread. 199 reps, seed 90210 — matching the
* Python post.

* Wrap the three by-hand estimators in a program that
* returns them, so -bootstrap- can call it repeatedly.
capture program drop hitipwdr
program define hitipwdr, rclass
    * -- HIT: outcome regression on controls, surprise on treated
    quietly regress dy $X if ever_treated == 0
    quietly predict double _dyhat, xb
    quietly gen double _res = dy - _dyhat
    quietly summarize _res if ever_treated == 1
    return scalar hit = r(mean)
    * -- IPW: Abadie weights
    quietly logit ever_treated $X
    quietly predict double _phat, pr
    quietly summarize ever_treated
    local p = r(mean)
    quietly gen double _wi = (ever_treated - _phat)/(1 - _phat)/`p' * dy
    quietly summarize _wi
    return scalar ipw = r(mean)
    * -- DR: outcome model + propensity weights
    quietly gen double _drt = ever_treated * _res / `p'
    quietly gen double _drc = (1-ever_treated) * (_phat/(1-_phat)) * _res / `p'
    quietly summarize _drt
    local t = r(mean)
    quietly summarize _drc
    local c = r(mean)
    return scalar dr = `t' - `c'
    drop _dyhat _res _phat _wi _drt _drc
end

use `wide', clear
bootstrap hit=r(hit) ipw=r(ipw) dr=r(dr), reps(199) seed(90210) nodots: hitipwdr


di _newline(2)
di "========================================================"
di "  SECTION 6: PACKAGE CROSS-CHECK (drdid)"
di "========================================================"

*---------------------------------------------------
* Section 6.1: Does an off-the-shelf command agree?
*---------------------------------------------------
* Sanity check: the community-standard -drdid- command
* should reproduce our by-hand doubly-robust number. We run
* it on the long panel. (If drdid is not installed and there
* is no internet, this section is skipped by -capture-.)

use `panel', clear
capture noisily drdid re $X, ivar(id) time(post) treatment(ever_treated) drimp
di _newline(1) as txt "Compare the drdid ATT above with our by-hand DR = " as res %6.0f attDR


di _newline(2)
di "========================================================"
di "  SECTION 7: SUMMARY — the covariate arc"
di "========================================================"
di as txt "  Spec  Estimator                         ATT     Class"
di as txt "  ----  --------------------------------  ------  -----------"
di as txt "  0     Naive TWFE (no covariates)      " as res %8.0f s0  as txt "  inert"
di as txt "  A     Additive X (level)              " as res %8.0f sA  as txt "  inert"
di as txt "  BT    X x treatment (effect)          " as res %8.0f sBT as txt "  inert"
di as txt "  B     X x post (trend)                " as res %8.0f sB  as txt "  CORRECTED"
di as txt "  C     Saturated first difference      " as res %8.0f sC  as txt "  CORRECTED"
di as txt "  --    HIT by hand (1997)              " as res %8.0f hit as txt "  CORRECTED"
di as txt "  --    IPW (Abadie 2005)               " as res %8.0f ipw as txt "  propensity"
di as txt "  --    DR (Sant'Anna-Zhao 2020)        " as res %8.0f attDR as txt "  propensity"
di as txt "  ----  --------------------------------  ------  -----------"
di as txt "        RCT benchmark (the truth)       " as res %8.0f benchmark
di _newline(1)
di as txt "Lesson: the estimate stays stuck near \$3,621 until the"
di as txt "covariates touch the control group's TREND (Spec B, C, HIT)"
di as txt "or its treatment probability (IPW, DR). Covariates in the"
di as txt "level (Spec A) or the effect (Spec BT) change nothing."

capture log close
* === End of do-file ===
