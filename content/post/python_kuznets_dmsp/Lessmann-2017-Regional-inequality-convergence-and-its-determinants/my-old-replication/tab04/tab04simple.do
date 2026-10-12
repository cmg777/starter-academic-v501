* Simplified Table 4: Determinants of sigma convergence, panel fixed effects regressions, 5-year averages

* Install packages
*ssc install outreg2

* Clean environment
clear all
cls
version 15

* Import dataset
use "https://github.com/quarcs-lab/data-open/raw/master/pGDP/Main_Data.dta", clear

* Collapse 5-year averages
gen p5year = 0
replace p5year = 1 if inrange(year,1990,1994)
replace p5year = 2 if inrange(year,1995,1999)
replace p5year = 3 if inrange(year,2000,2004)
replace p5year = 4 if inrange(year,2005,2009)
replace p5year = 5 if inrange(year,2010,2014)
collapse  (firstnm)  Country_NAME (mean) fedelupd2-COVW_pred_GDP_pc, by(Country_ISO p5year)

* Generate variables
gen log_GDP_pc_Country   = log(GDP_pc_Country)
gen log_GDP_pc_Country_2 = log_GDP_pc_Country*log_GDP_pc_Country
gen log_GDP_pc_Country_3 = log_GDP_pc_Country*log_GDP_pc_Country*log_GDP_pc_Country
gen aid_GDP = Aid/(GDP_pc_Country*Pop_Country)
replace Resources_rents_share_of_GDP = Resources_rents_share_of_GDP/100
replace School_enrollment_secondary  = School_enrollment_secondary/100
gen Area_X_price_gasoline = area*price_gasoline/10e+6
egen fedlup = mean(fedelupd2), by (Country_ISO)
gen log_GDP_pc_Country_X_fedlup = log_GDP_pc_Country*fedlup
gen log_GDP_pc_Country_2_fed    = log_GDP_pc_Country*log_GDP_pc_Country*fedlup
gen log_GDP_pc_Country_3_fed    = log_GDP_pc_Country*log_GDP_pc_Country*log_GDP_pc_Country*fedlup

*Set panel
encode Country_ISO, generate(Country_ISO_long)
xtset Country_ISO_long p5year

* Label variables for regression tables
label variable GINIW_pred_GDP_pc "Gini"
label variable log_GDP_pc_Country "Ln GPDpc"
label variable log_GDP_pc_Country_2 "Ln GDPpc2"
label variable log_GDP_pc_Country_3 "Ln GDPpc3"
label variable Resources_rents_share_of_GDP "Resources rents/GDP"
label variable Arable_land "Arable land (%)"
label variable Trade_GDP_share "Trade/GDP"
label variable FDI_share_of_GDP "FDI/GDP"
label variable price_gasoline "Price gasoline"
label variable Area_X_price_gasoline "Price gasoline X area"
label variable aid_GDP "Aid/GDP"
label variable School_enrollment_secondary "School enroll. secondary"
label variable GINIW_Eth_light "Ethnic inequality"

*Generate regression table
xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 Resources_rents_share_of_GDP Arable_land i.p5year, robust fe cluster(Country_ISO_long)
outreg2 using  tab04simple.tex, tex(fragment) replace addtext(Country FE, YES, Year FE, YES)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline  Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) dec(3) label nonotes

xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 Trade_GDP_share FDI_share_of_GDP					 i.p5year, robust fe cluster(Country_ISO_long)
outreg2 using  tab04simple.tex, tex(fragment) append addtext(Country FE, YES, Year FE, YES)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline  Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) dec(3) label nonotes

xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 area price_gasoline Area_X_price_gasoline  i.p5year, robust fe cluster(Country_ISO_long)
outreg2 using  tab04simple.tex, tex(fragment) append addtext(Country FE, YES, Year FE, YES)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline   Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) dec(3) label nonotes

*>>> NOTE: The regression below is not runned becuase lack of data about 	icrg_bureaucratic_qualitiy	
*xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 icrg_bureaucratic_qualitiy Polity2   fedlup log_GDP_pc_Country_X_fedlup log_GDP_pc_Country_2_fed log_GDP_pc_Country_3_fed  i.p5year, robust fe cluster(Country_ISO_long)
*outreg2 using  tab04simple.tex, tex(fragment) append addtext(Country FE, YES, Year FE, YES)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline  Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) dec(3) label nonotes
				
xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3  aid_GDP School_enrollment_secondary       i.p5year, robust fe cluster(Country_ISO_long)
outreg2 using  tab04simple.tex, tex(fragment) append addtext(Country FE, YES, Year FE, YES)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline   Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) dec(3) label nonotes

xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3  GINIW_Eth_light       										i.p5year, robust fe cluster(Country_ISO_long)
outreg2 using  tab04simple.tex, tex(fragment) append addtext(Country FE, YES, Year FE, YES)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline   Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) dec(3) label nonotes