*Table 4: Determinants of sigma convergence, panel fixed effects regressions, 5-year averages
* Github Gist link: https://gist.github.com/cmg777/6ad6440b6c0efae9f5e8ad666bd0da64

		* Set working directory
			cd /Users/carlos/Github/00-DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants/tab04

		* Install packages
				*ssc install outreg2

		* Clean environment
				clear all
				cls
				version 15

		* Import dataset
				*use "Main_Data.dta", clear
				use "https://github.com/quarcs-lab/data-open/raw/master/pGDP/Main_Data.dta", clear

		* Collapse 5-year averages
				gen p5year = 0
				replace p5year = 1 if inrange(year,1990,1994)
				replace p5year = 2 if inrange(year,1995,1999)
				replace p5year = 3 if inrange(year,2000,2004)
				replace p5year = 4 if inrange(year,2005,2009)
				replace p5year = 5 if inrange(year,2010,2014)
				collapse  (firstnm)  Country_NAME (mean) fedelupd2-COVW_pred_GDP_pc, by(Country_ISO p5year)

		*Gen Controls
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
				tsset Country_ISO_long p5year
				xtset Country_ISO_long p5year
				xi i.p5year

		*Gen regression table
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   ///
				Resources_rents_share_of_GDP Arable_land  i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab04.xls, replace ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline  Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light)

				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
				Trade_GDP_share FDI_share_of_GDP i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab04.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline  Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light)


				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
				area price_gasoline Area_X_price_gasoline i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab04.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline   Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light)


				/*
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   ///
				 icrg_bureaucratic_qualitiy Polity2   fedlup log_GDP_pc_Country_X_fedlup log_GDP_pc_Country_2_fed log_GDP_pc_Country_3_fed  i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab04.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline  Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light)
				*/

				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3  ///
				aid_GDP School_enrollment_secondary      i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab04.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline   Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light)

				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3  ///
				GINIW_Eth_light     i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab04.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline   Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light)
