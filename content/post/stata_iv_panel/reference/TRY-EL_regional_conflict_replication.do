** Setup
cls
clear all
macro drop _all
capture log close

set more off
version 15


** Install packages
* ssc install ivreg2, replace
* ssc install ranktest, replace
* ssc install xtivreg2, replace

log using "TRY-EL_regional_conflict_replication.txt", text replace

use  "EL_regional_conflict_replication", clear
tsset objectid year

** Construct year-specific indicators
quietly tab year, gen(Iyear)



** Table 1: Descriptive statistics
xtsum ucdp_death_dummy ucdp_25death_dummy llnlight01 l2lnrain01 l2meanpdsi
sum   ucdp_death_dummy ucdp_25death_dummy llnlight01 l2lnrain01 l2meanpdsi

eststo clear
generate y = uniform()
qui reg y ucdp_death_dummy ucdp_25death_dummy llnlight01 l2lnrain01 l2meanpdsi, noconstant
qui estadd summ
    esttab, label cells("mean(fmt(%8.2f)) sd(fmt(%8.2f)) min(fmt(%8.2f)) max(fmt(%8.2f))") collabels("Mean" "Std.Dev." "Min" "Max") addnote("Notes: Sample period is 1994–2010.")  nogap nomtitle nonumber  noobs compress 
eststo clear

** [Using estout] Table 2 (and Table 4):  Effects on regional conflicts with one or more conflict-related fatalities (first-stage results)
eststo clear

eststo mod1: qui xtreg ucdp_death_dummy_dt llnlight01_dt Iyear*, fe robust cluster(objectid)
qui estadd local FE_region    "Yes", replace
qui estadd local Trend_region "Yes", replace  
qui estadd local FE_year      "Yes", replace
qui estadd local Instrument   "None" , replace


eststo mod2: qui xtreg ucdp_death_dummy_dt l2lnrain01_dt Iyear*, fe robust cluster(objectid)
qui estadd local FE_region    "Yes", replace
qui estadd local Trend_region "Yes", replace  
qui estadd local FE_year      "Yes", replace
qui estadd local Instrument   "None" , replace

eststo mod3: qui xtreg ucdp_death_dummy_dt l2meanpdsi_dt Iyear*, fe robust cluster(objectid)
qui estadd local FE_region    "Yes", replace
qui estadd local Trend_region "Yes", replace  
qui estadd local FE_year      "Yes", replace
qui estadd local Instrument   "None" , replace

eststo mod4: qui xtreg ucdp_death_dummy_dt l2meanpdsi_dt l2lnrain01_dt Iyear*, fe robust cluster(objectid)
qui estadd local FE_region    "Yes", replace
qui estadd local Trend_region "Yes", replace  
qui estadd local FE_year      "Yes", replace
qui estadd local Instrument   "None" , replace

eststo mod5: qui xtivreg2 ucdp_death_dummy_dt (llnlight01_dt=l2lnrain01_dt) Iyear*, fe robust cluster(objectid) first /*Includes First Stage Estimates for Table 4, Column (1)*/
qui estadd local FE_region    "Yes", replace
qui estadd local Trend_region "Yes", replace  
qui estadd local FE_year      "Yes", replace
qui estadd local Instrument   "Rain(t-2)" , replace

eststo mod6: qui xtivreg2 ucdp_death_dummy_dt (llnlight01_dt=l2meanpdsi_dt) Iyear*, fe robust cluster(objectid) first /*Includes First Stage Estimates for Table 4, Column (1)*/
qui estadd local FE_region    "Yes", replace
qui estadd local Trend_region "Yes", replace  
qui estadd local FE_year      "Yes", replace
qui estadd local Instrument   "Drought(t-2)" , replace

eststo mod7: qui xtivreg2 ucdp_death_dummy_dt (llnlight01_dt=l2meanpdsi_dt l2lnrain01_dt) Iyear*, fe robust cluster(objectid) first /*Includes First Stage Estimates for Table 4, Column (1)*/
qui estadd local FE_region    "Yes", replace
qui estadd local Trend_region "Yes", replace  
qui estadd local FE_year      "Yes", replace
qui estadd local Instrument   "Both" , replace

#delimit;

    esttab mod1 mod2 mod3 mod4 mod5 mod6 mod7,
    keep(llnlight01_dt l2lnrain01_dt l2meanpdsi_dt)
    se
    label 
    stats(N N_g r2 FE_region Trend_region FE_year Instrument, 
        fmt(0 0 2)
        label("Observations" "N Regions" "R-squared" "Region FE" "Region trend" "Year FE" "Instrument"))
    mtitles("OLS" "OLS" "OLS" "OLS" "2SLS" "2SLS" "2SLS") 
    nonotes
    addnote("Notes: Sample period is 1994–2010. Standard errors are adjusted for clustering at the level of administrative regions." 
            "This is a second line below. Standard errors in parentheses"
            "* p<0.10, ** p<0.05, *** p<0.01")
    star(* 0.10 ** 0.05 *** 0.01)  
    b(%7.3f)
    compress
    replace;

#delimit cr

eststo clear


** [Using estout]  Table 3: Effects on regional conflicts with 25 or more conflict-related fatalities
eststo clear

eststo: qui xtreg ucdp_25death_dummy_dt llnlight01_dt Iyear*, fe robust cluster(objectid)
eststo: qui xtreg ucdp_25death_dummy_dt l2lnrain01_dt Iyear*, fe robust cluster(objectid)
eststo: qui xtreg ucdp_25death_dummy_dt l2meanpdsi_dt Iyear*, fe robust cluster(objectid)
eststo: qui xtreg ucdp_25death_dummy_dt l2meanpdsi_dt l2lnrain01_dt Iyear*, fe robust cluster(objectid)
eststo: qui xtivreg2 ucdp_25death_dummy_dt (llnlight01_dt=l2lnrain01_dt) Iyear*, fe robust cluster(objectid)
eststo: qui xtivreg2 ucdp_25death_dummy_dt (llnlight01_dt=l2meanpdsi_dt) Iyear*, fe robust cluster(objectid)
eststo: qui xtivreg2 ucdp_25death_dummy_dt (llnlight01_dt=l2meanpdsi_dt l2lnrain01_dt) Iyear*, fe robust cluster(objectid)

esttab, se stats(N N_g r2) star(* 0.10 ** 0.05 *** 0.01) drop(Iyear*) b(%7.3f)  replace
eststo clear



** Table 2 (and Table 4):  Effects on regional conflicts with one or more conflict-related fatalities (first-stage results)
xtreg ucdp_death_dummy_dt llnlight01_dt Iyear*, fe robust cluster(objectid)
outreg2 using table2_regconf_140710.tex, replace tex se drop(Iyear*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None) 

xtreg ucdp_death_dummy_dt l2lnrain01_dt Iyear*, fe robust cluster(objectid)
outreg2 using table2_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtreg ucdp_death_dummy_dt l2meanpdsi_dt Iyear*, fe robust cluster(objectid)
outreg2 using table2_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtreg ucdp_death_dummy_dt l2meanpdsi_dt l2lnrain01_dt Iyear*, fe robust cluster(objectid)
outreg2 using table2_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtivreg2 ucdp_death_dummy_dt (llnlight01_dt=l2lnrain01_dt) Iyear*, fe robust cluster(objectid) first /*Includes First Stage Estimates for Table 4, Column (1)*/
outreg2 using table2_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Rain)

xtivreg2 ucdp_death_dummy_dt (llnlight01_dt=l2meanpdsi_dt) Iyear*, fe robust cluster(objectid) first /*Includes First Stage Estimates for Table 4, Column (1)*/
outreg2 using table2_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Drought)

xtivreg2 ucdp_death_dummy_dt (llnlight01_dt=l2meanpdsi_dt l2lnrain01_dt) Iyear*, fe robust cluster(objectid) first /*Includes First Stage Estimates for Table 4, Column (1)*/
outreg2 using table2_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Rain and Drought)


** Table 3: Effects on regional conflicts with 25 or more conflict-related fatalities
xtreg ucdp_25death_dummy_dt llnlight01_dt Iyear*, fe robust cluster(objectid)
outreg2 using table3_regconf_140710.tex, replace tex se drop(Iyear*) addtext(Dependant, ucdp_25death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtreg ucdp_25death_dummy_dt l2lnrain01_dt Iyear*, fe robust cluster(objectid)
outreg2 using table3_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtreg ucdp_25death_dummy_dt l2meanpdsi_dt Iyear*, fe robust cluster(objectid)
outreg2 using table3_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtreg ucdp_25death_dummy_dt l2meanpdsi_dt l2lnrain01_dt Iyear*, fe robust cluster(objectid)
outreg2 using table3_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtivreg2 ucdp_25death_dummy_dt (llnlight01_dt=l2lnrain01_dt) Iyear*, fe robust cluster(objectid)
outreg2 using table3_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_25death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Rain)

xtivreg2 ucdp_25death_dummy_dt (llnlight01_dt=l2meanpdsi_dt) Iyear*, fe robust cluster(objectid)
outreg2 using table3_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_25death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Drought)

xtivreg2 ucdp_25death_dummy_dt (llnlight01_dt=l2meanpdsi_dt l2lnrain01_dt) Iyear*, fe robust cluster(objectid)
outreg2 using table3_regconf_140710.tex, append tex se drop(Iyear*) addtext(Dependant, ucdp_25death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Rain and Drought)


/* The data file  already contains the detrended variables (*_dt). In any case, the code to generate the detrended variables is below

gen ucdp_death_dummy_dt=.
gen ucdp_25death_dummy_dt=.
gen llnlight01_dt=.
gen l2lnrain01_dt=.
gen l2meanpdsi_dt=.

#delimit ;
qui tab objectid, gen(Iregcode);
local i=1;
while (`i'< 5690)
{;
reg ucdp_death_dummy year if Iregcode`i'==1;
predict ucdp_death_dummy_resid if e(sample), r;
replace ucdp_death_dummy_dt=ucdp_death_dummy_resid if e(sample);
reg ucdp_25death_dummy year if Iregcode`i'==1;
predict ucdp_25death_dummy_resid if e(sample), r;
replace ucdp_25death_dummy_dt=ucdp_25death_dummy_resid if e(sample);
reg llnlight01 year if Iregcode`i'==1;
predict llnlight01_resid if e(sample), r;
replace llnlight01_dt=llnlight01_resid if e(sample);
reg l2lnrain01 year if Iregcode`i'==1;
predict l2lnrain01_resid if e(sample), r;
replace l2lnrain01_dt=l2lnrain01_resid if e(sample);
reg l2meanpdsi year if Iregcode`i'==1;
predict l2meanpdsi_resid if e(sample), r;
replace l2meanpdsi_dt=l2meanpdsi_resid if e(sample);
drop ucdp_death_dummy_resid ucdp_25death_dummy_resid llnlight01_resid l2lnrain01_resid l2meanpdsi_resid;
local i = `i' + 1;
};
#delimit cr
drop I*


*/

** Close log file
log close