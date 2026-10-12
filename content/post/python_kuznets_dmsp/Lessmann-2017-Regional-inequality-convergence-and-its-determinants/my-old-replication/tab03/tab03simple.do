*Table 3: Determinants of sigma convergence, panel fixed effects regressions, 5-year averages (Kuznets waves)

* Install packages
*ssc install outreg2

* Clean environment
clear all
cls
version 15

* Import dataset
*use "Main_Data.dta", clear
use "https://github.com/quarcs-lab/data-open/raw/master/pGDP/Main_Data.dta", clear

* Select main variables
keep Country_NAME Country_ISO year GINIW_pred_GDP_pc GDP_pc_Country

* Rename variables
rename Country_NAME 		country
rename Country_ISO 			iso_code
rename GDP_pc_Country 		GDPpc
rename GINIW_pred_GDP_pc 	gini

* Collapse to 5-year averages
gen p5year = 0
replace p5year = 1 if inrange(year,1990,1994)
replace p5year = 2 if inrange(year,1995,1999)
replace p5year = 3 if inrange(year,2000,2004)
replace p5year = 4 if inrange(year,2005,2009)
replace p5year = 5 if inrange(year,2010,2014)
sum
collapse  (firstnm)  country (mean) GDPpc-gini, by(iso_code p5year)
sum

*Generate additional control variables
gen log_GDPpc	= log(GDPpc)
gen log_GDPpc2 	= log_GDPpc*log_GDPpc
gen log_GDPpc3 	= log_GDPpc*log_GDPpc*log_GDPpc

* Write labels for main variables
label variable country "Country"
label variable GDPpc "GDPpc"
label variable gini "Gini"
label variable log_GDPpc "Ln GDPpc"
label variable log_GDPpc2 "Ln GDPpc2"
label variable log_GDPpc3 "Ln GDPpc3"

*Set panel data
 encode iso_code, generate(iso_code_n)
 xtset  iso_code_n p5year

*Generate panel regressions table using outreg2
 xtreg   gini log_GDPpc i.p5year, robust fe cluster(iso_code_n)
 outreg2 using  tab03simple.tex, replace tex(fragment) addtext(Country FE, YES, Year FE, YES) keep(log_GDPpc log_GDPpc2 log_GDPpc3) dec(3) label nonotes

 xtreg   gini log_GDPpc log_GDPpc2  i.p5year, robust fe cluster(iso_code_n)
 outreg2 using  tab03simple.tex, append  tex(fragment) addtext(Country FE, YES, Year FE, YES) keep(log_GDPpc log_GDPpc2 log_GDPpc3) dec(3) label nonotes

 xtreg   gini log_GDPpc log_GDPpc2 log_GDPpc3 i.p5year, robust fe cluster(iso_code_n)
outreg2  using  tab03simple.tex, append  tex(fragment) addtext(Country FE, YES, Year FE, YES) keep(log_GDPpc log_GDPpc2 log_GDPpc3) dec(3) label nonotes