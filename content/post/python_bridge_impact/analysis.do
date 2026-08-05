*==============================================================================
* Evaluating the Impact of Infrastructure:
* Difference-in-Differences with the Jamuna Bridge -- Stata companion
*
* This do-file mirrors analysis.py so that readers can compare the two
* implementations line by line. It is a cleaned, commented rewrite of the
* replication package of:
*
*   Blankespoor, Emran, Shilpi & Xu (2021), "Bridge to bigpush or backwash?
*   Market integration, reallocation and productivity effects of Jamuna Bridge
*   in Bangladesh", Journal of Economic Geography.
*
* Companion post: https://carlos-mendez.org/post/python_bridge_impact/
*
* The four original do-files (employment_2021.do, nite_2021.do, yield_2021.do,
* DHS_hh_village.do) are the authoritative source. This file consolidates them,
* fixes the $trimL scoping bug documented in section 18.1 of the post, and
* drops the paths and output plumbing that are specific to the authors' machine.
*
* Requires: outreg2 (ssc install outreg2) only if you want the exported tables.
*==============================================================================

clear all
set more off
version 14

* Point this at the folder holding the tidy CSVs that ship with the post.
global data "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/python_bridge_impact/data"

* The propensity-score trim, as a percentile. In the original nite_2021.do this
* global was never defined, so `r(p$trimL)` expanded to the non-existent `r(p)`,
* every cutoff was missing, and `p < .` was TRUE for every comparison unit --
* which silently dropped the entire comparison group. Define it once, globally.
global trimL 5


*------------------------------------------------------------------------------
* Program: build the two doubly-robust weight vectors
*
*   ipw1 / ipw3  LWDR  -- propensity-odds ATT weights (3 = trimmed)
*   ipw2 / ipw4  KOBDR -- Kline (2011) Oaxaca-Blinder reweighting (4 = trimmed)
*
* Both put weight 1 on every treated unit: these are ATT weights, so the treated
* distribution is the target and only the comparison group is reshaped.
*------------------------------------------------------------------------------
capture program drop build_weights
program define build_weights
    syntax , [TRIM]

    * Step 1: propensity score on characteristics fixed before the bridge.
    logit treat lpop91 lmdist if smp1 != .
    keep if e(sample) == 1
    predict p

    summarize p, detail
    if "`trim'" != "" {
        local cut = r(p$trimL)
    }
    else {
        local cut = -1              // no trimming (the yield panel)
    }

    quietly summarize treat
    local pi = r(mean)
    local N1 = r(sum)

    * Step 2: LWDR -- odds of treatment, rescaled to mean one on the controls.
    gen wlogit = p/(1-p) * (1-`pi')/`pi' if treat == 0

    * Step 3: KOBDR -- the reweighting implied by an Oaxaca-Blinder decomposition.
    * Solve the treated covariate mean onto the comparison design; the resulting
    * per-unit weights are not guaranteed positive, and negatives are dropped.
    gen one = 1
    gen w   = .
    gen nD  = 1 - treat
    mata: X  = st_data(., ("one", "lpop91", "lmdist"))
    mata: D  = st_data(., "treat")
    mata: nD = st_data(., "nD")
    mata: w  = D' * X * invsym(quadcross(X, nD, X)) * X' / `N1'
    mata: w  = w' :* nD
    mata: st_store(., "w", w)

    gen wplot = w * `N1'                     // renormalise to mean one
    replace wplot = . if wplot < 0           // negative OB weights are not interpretable

    gen ipw2 = wplot
    replace ipw2 = 1 if treat == 1
    replace ipw2 = 1 if treatd == 1

    rename wlogit ipw1
    replace ipw1 = 1 if treat == 1
    replace ipw1 = 1 if treatd == 1

    gen ipw3 = ipw1
    gen ipw4 = ipw2
    if "`trim'" != "" {
        replace ipw3 = . if p < `cut' & treat == 0
        replace ipw4 = . if p < `cut' & treat == 0
    }

    label var ipw1 "LWDR weight"
    label var ipw2 "KOBDR weight"
    label var ipw3 "LWDR weight, trimmed"
    label var ipw4 "KOBDR weight, trimmed"

    drop if ipw2 == .
end


*==============================================================================
* PANEL 1 -- NIGHTTIME LIGHTS (the running example)
* 359 upazilas x 7 three-year periods, 1992-2013. Bridge opens inside period 3.
*==============================================================================

import delimited "$data/bridge_nightlights.csv", clear

* Distance to the RELEVANT bridge foot: Jamuna for treated, Padma site for
* comparison. `year` is the integer period index 1..7, NOT a calendar year --
* this matters because the controls interact baseline traits with it.
gen mdist   = min(jamuna_m, padma_m)/1000
gen lmdist  = ln(mdist + 1)
gen lpop91  = ln(pop91)

preserve
    build_weights, trim
    keep geocode year ipw1 ipw2 ipw3 ipw4 p
    tempfile nlw
    save `nlw'
restore
merge 1:1 geocode year using `nlw', nogenerate

* Outcome. Luminosity is bottom-coded at 1.0, hence the +1.
gen lmn = ln(mn + 1)
xtset geocode year
gen D_lmn = D.lmn

* NOTE: ln(rainm + 1) here, but plain ln(rainm) in the census and yield panels.
* The original do-files differ on this and the difference is not cosmetic.
gen lrainm  = ln(rainm + 1)
gen lrainsd = ln(rainsd)

* Initial conditions interacted with the trend. Unit fixed effects already
* absorb lpop91 and lmdist, so entering them alone would do nothing; the
* interaction lets an upazila that was large or remote IN 1991 sit on a
* permanently different trajectory.
gen lpop91_t = lpop91 * year
gen lmdist_t = lmdist * year
global xvec "lpop91_t lrainm lrainsd lmdist_t"

* Timing
gen yr  = (year > 2)                        // post-bridge
gen yr1 = (year >= 3 & year <= 4)           // short run, 1998-2004
gen yr2 = (year > 4)                        // long run,  2005-2013
gen treat_yr  = treat * yr
gen treat_yr1 = treat * yr1
gen treat_yr2 = treat * yr2

* --- Table 1: mean effect. Published: 0.088 / 0.106 / 0.109, all se 0.022 ---
di _n "=== Nightlights, mean effect ==="
xtreg lmn treat_yr yr $xvec i.year if smp1 != ., fe robust cluster(geocode)
xtreg lmn treat_yr yr $xvec i.year if smp1 != . [aw=ipw3], fe robust cluster(geocode)
xtreg lmn treat_yr yr $xvec i.year if smp1 != . [aw=ipw4], fe robust cluster(geocode)

* --- Table 2: short run vs long run. Published: 0.049/0.112 (KOBDR) ---
di _n "=== Nightlights, short run and long run ==="
xtreg lmn treat_yr1 treat_yr2 yr1 yr2 $xvec i.year if smp1 != ., fe robust cluster(geocode)
xtreg lmn treat_yr1 treat_yr2 yr1 yr2 $xvec i.year if smp1 != . [aw=ipw4], ///
      fe robust cluster(geocode)

* --- Table 4: heterogeneity by distance tercile ---
* IMPORTANT: xtile runs on the merged data BEFORE rows are lost to missing
* controls. employment_2021.do drops first; this one does not. Getting the order
* wrong moves every coefficient below in the third decimal.
xtile nq1 = lmdist if smp1 != ., nq(3)
tab nq1, gen(dm)
forvalues i = 1/3 {
    gen treat_yr1_`i' = treat_yr1 * dm`i'
    gen treat_yr2_`i' = treat_yr2 * dm`i'
    gen yr1_`i' = yr1 * dm`i'
    gen yr2_`i' = yr2 * dm`i'
}
di _n "=== Nightlights by distance band (i.year INCLUDED here) ==="
xtreg lmn treat_yr1_* treat_yr2_* treat yr1_* yr2_* $xvec i.year ///
      if smp1 != . [aw=ipw4], fe robust cluster(geocode)


*==============================================================================
* PANEL 2 -- POPULATION CENSUS: density and employment shares
* 351 upazilas x 3 census years (1991, 2001, 2011).
*==============================================================================

import delimited "$data/bridge_employment.csv", clear

gen mdist  = min(jamuna_m, padma_m)/1000
gen lmdist = ln(mdist + 1)
gen lpop91 = ln(pop91)

preserve
    build_weights, trim
    collapse (first) ipw1 ipw2 ipw3 ipw4 p, by(geocode)   // weights are time-invariant
    tempfile empw
    save `empw'
restore
merge m:1 geocode using `empw', nogenerate

gen ldensity = ln(density)
gen sind     = pop_ind  / emp
gen sserv    = pop_serv / emp
gen sagr     = pop_agr  / emp
gen lrainm   = ln(rainm)          // no +1 here, unlike the nightlights panel
gen lrainsd  = ln(rainsd)
gen lpop91_t = lpop91 * year
gen lmdist_t = lmdist * year
global xvec "lpop91_t lrainm lrainsd lmdist_t"

* Drop rows with missing controls BEFORE the terciles are cut (see the note above).
foreach x of global xvec {
    drop if `x' == .
}

gen yr  = (year > 1)
gen yr1 = (year == 2)             // short run: 2001
gen yr2 = (year == 3)             // long run:  2011
gen treat_yr  = treat * yr
gen treat_yr1 = treat * yr1
gen treat_yr2 = treat * yr2

xtset geocode year

di _n "=== Census outcomes, mean effect ==="
foreach y of varlist ldensity sind sserv sagr {
    xtreg `y' treat_yr $xvec i.year if smp1 != ., fe robust cluster(geocode)
    xtreg `y' treat_yr $xvec i.year if smp1 != . [aw=ipw4], fe robust cluster(geocode)
}

* THE DISCRIMINATING TEST. Backwash needs manufacturing DOWN and density DOWN.
* Published (KOBDR): density -0.025 short run, +0.059 long run; industry -0.012
* long run. Manufacturing falls, but density RISES -- backwash is rejected.
di _n "=== Census outcomes, short run and long run ==="
foreach y of varlist ldensity sind sserv sagr {
    xtreg `y' treat_yr1 treat_yr2 $xvec i.year if smp1 != . [aw=ipw4], ///
          fe robust cluster(geocode)
}

xtile nq1 = lmdist if smp1 != ., nq(3)
tab nq1, gen(dm)
forvalues i = 1/3 {
    gen treat_yr1_`i' = treat_yr1 * dm`i'
    gen treat_yr2_`i' = treat_yr2 * dm`i'
    gen yr1_`i' = yr1 * dm`i'
    gen yr2_`i' = yr2 * dm`i'
}
* NOTE: NO i.year in the census heterogeneity spec -- the band-specific post
* dummies absorb the time effects. The nightlights spec above DOES include them.
di _n "=== Census outcomes by distance band (no i.year) ==="
foreach y of varlist ldensity sind sserv sagr {
    xtreg `y' treat_yr1_* treat_yr2_* treat yr1_* yr2_* $xvec ///
          if smp1 != . [aw=ipw4], fe robust cluster(geocode)
}


*==============================================================================
* PANEL 3 -- BORO RICE YIELD
* 16 former districts x 8 periods, 1988-2013. Only 11 districts enter the
* estimation and 9 survive the negative-weight drop, so every standard error
* here rests on a very small number of clusters.
*==============================================================================

import delimited "$data/bridge_yield.csv", clear

gen mdist  = min(jamuna_m, padma_m)/1000
gen lmdist = ln(mdist + 1)/10     // the authors' log rescales here; harmless for treat_*
gen lpop91 = ln(pop91)

preserve
    build_weights                 // NOTE: no trim option -- the yield panel is untrimmed
    keep dist year ipw1 ipw2 p
    tempfile yldw
    save `yldw'
restore
merge 1:1 dist year using `yldw', nogenerate

gen lyld    = ln(yld)
gen lrainm  = ln(rainm)
gen lrainsd = ln(rainsd)
gen lpop91_t = lpop91 * year
gen lmdist_t = lmdist * year
global xvec "lpop91_t lrainm lrainsd lmdist_t"

xtset dist year
gen D_lyld = D.lyld

gen yr  = (year >= 4)
gen yr1 = (year >= 4 & year <= 5)
gen yr2 = (year > 5)
gen treat_yr  = treat * yr
gen treat_yr1 = treat * yr1
gen treat_yr2 = treat * yr2

* Published: mean 0.049 / 0.059 / 0.063; long run 0.079 (KOBDR).
* The yield columns use ipw1 and ipw2 (untrimmed), not ipw3/ipw4.
di _n "=== Rice yield ==="
xtreg lyld treat_yr $xvec i.year if smp1 != ., fe robust cluster(dist)
xtreg lyld treat_yr $xvec i.year if smp1 != . [aw=ipw1], fe robust cluster(dist)
xtreg lyld treat_yr $xvec i.year if smp1 != . [aw=ipw2], fe robust cluster(dist)
xtreg lyld treat_yr1 treat_yr2 $xvec i.year if smp1 != . [aw=ipw2], ///
      fe robust cluster(dist)


*==============================================================================
* PANEL 4 -- PUBLIC GOODS PLACEBO (DHS and HIES)
*
* The rival explanation is political: a prime minister with roots in the Jamuna
* hinterland might simply have sent more schools, clinics and electricity there.
* If so, the "bridge effect" would really be a public-spending effect.
*
* Note that these regressions use NO weights and NO smp1 filter -- the DHS files
* have no core region to exclude.
*==============================================================================

import delimited "$data/bridge_dhs_household.csv", clear
gen mdist    = min(jamuna_m, padma_m)/1000
gen lmdist   = ln(mdist + 1)
gen lmdist_t = lmdist * year
gen yr1 = (year == 4)
gen yr2 = (year >= 5)
gen treat_yr1 = treat * yr1
gen treat_yr2 = treat * yr2
xtset district

di _n "=== Household electricity access (published: -0.057 / +0.036) ==="
xtreg electricity treat_yr1 treat_yr2 lmdist_t rural i.year, fe robust cluster(district)

import delimited "$data/bridge_dhs_village.csv", clear
gen mdist    = min(jamuna_m, padma_m)/1000
gen lmdist   = ln(mdist + 1)
gen lmdist_t = lmdist * year
gen yr1 = (year == 4)
gen yr2 = (year >= 5)
gen treat_yr1 = treat * yr1
gen treat_yr2 = treat * yr2
xtset district

di _n "=== Village public goods: 21 estimates, none significant at 5% ==="
foreach x of varlist dist_thana dist_district dist_satellite_clinic dist_hos ///
                     primary_school high_school madrassa_school ///
                     grameen_bank cinema post_office co_operative_soc ngo {
    xtreg `x' treat_yr1 treat_yr2 lmdist_t i.year, fe robust cluster(district)
}

di _n "=== done ==="
