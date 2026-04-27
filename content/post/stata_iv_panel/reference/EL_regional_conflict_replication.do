clear matrix 
clear mata
clear
set matsize 11000
set maxvar 30000
set more off
capture log close


*global path "[PATH]" /*Define input path*/

cd ${path}

use  $path\EL_regional_conflict_replication", clear

tsset objectid year

qui tab year, gen(Iyear)



/*
*Code to generate detrended (*_dt) variables

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

tsset objectid year

*Table 1
xtsum ucdp_death_dummy ucdp_25death_dummy llnlight01 l2lnrain01 l2meanpdsi
sum ucdp_death_dummy ucdp_25death_dummy llnlight01 l2lnrain01 l2meanpdsi 

*Table 2 (and Table 4)
xtreg ucdp_death_dummy_dt llnlight01_dt Iyear*, fe r cluster(objectid)  
outreg2 using table2_regconf_140710.tex, replace tex se drop(y*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None) 

xtreg ucdp_death_dummy_dt l2lnrain01_dt Iyear*, fe r cluster(objectid)  
outreg2 using table2_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtreg ucdp_death_dummy_dt l2meanpdsi_dt Iyear*, fe r cluster(objectid)  
outreg2 using table2_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtreg ucdp_death_dummy_dt l2meanpdsi_dt l2lnrain01_dt Iyear*, fe r cluster(objectid)  
outreg2 using table2_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtivreg2 ucdp_death_dummy_dt (llnlight01_dt=l2lnrain01_dt) Iyear*, fe r cluster(objectid) first /*Includes First Stage Estimates for Table 4, Column (1)*/
outreg2 using table2_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Rain)

xtivreg2 ucdp_death_dummy_dt (llnlight01_dt=l2meanpdsi_dt) Iyear*, fe r cluster(objectid) first /*Includes First Stage Estimates for Table 4, Column (1)*/
outreg2 using table2_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Drought)

xtivreg2 ucdp_death_dummy_dt (llnlight01_dt=l2meanpdsi_dt l2lnrain01_dt) Iyear*, fe r cluster(objectid) first /*Includes First Stage Estimates for Table 4, Column (1)*/
outreg2 using table2_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Rain and Drought)


*Table 3
xtreg ucdp_25death_dummy_dt llnlight01_dt Iyear*, fe r cluster(objectid)  
outreg2 using table3_regconf_140710.tex, replace tex se drop(y*) addtext(Dependant, ucdp_25death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtreg ucdp_25death_dummy_dt l2lnrain01_dt Iyear*, fe r cluster(objectid)  
outreg2 using table3_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtreg ucdp_25death_dummy_dt l2meanpdsi_dt Iyear*, fe r cluster(objectid)  
outreg2 using table3_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtreg ucdp_25death_dummy_dt l2meanpdsi_dt l2lnrain01_dt Iyear*, fe r cluster(objectid)  
outreg2 using table3_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, None)

xtivreg2 ucdp_25death_dummy_dt (llnlight01_dt=l2lnrain01_dt) Iyear*, fe r cluster(objectid)  
outreg2 using table3_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_25death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Rain)

xtivreg2 ucdp_25death_dummy_dt (llnlight01_dt=l2meanpdsi_dt) Iyear*, fe r cluster(objectid)  
outreg2 using table3_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_25death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Drought)

xtivreg2 ucdp_25death_dummy_dt (llnlight01_dt=l2meanpdsi_dt l2lnrain01_dt) Iyear*, fe r cluster(objectid)  
outreg2 using table3_regconf_140710.tex, append tex se drop(y*) addtext(Dependant, ucdp_25death_dummy, Year and region fixed effects, Yes, Regional time trends, Yes, Instrumental variables, Rain and Drought)
