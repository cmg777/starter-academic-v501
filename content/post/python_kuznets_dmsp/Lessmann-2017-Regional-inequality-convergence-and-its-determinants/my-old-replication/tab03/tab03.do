

*Table 3: Determinants of sigma convergence, panel fixed effects regressions, 5-year averages

		use "Main_Data.dta", clear

		*Collapse to 5-year averages
				gen p5year = 0
				replace p5year = 1 if inrange(year,1990,1994)
				replace p5year = 2 if inrange(year,1995,1999)
				replace p5year = 3 if inrange(year,2000,2004)
				replace p5year = 4 if inrange(year,2005,2009)
				replace p5year = 5 if inrange(year,2010,2014)
				sum
				collapse  (firstnm)  Country_NAME (mean) fedelupd2-COVW_pred_GDP_pc, by(Country_ISO p5year)
				sum

		*Generate additional control variables
				gen log_GDP_pc_Country	 = log(GDP_pc_Country)
				gen log_GDP_pc_Country_2 = log_GDP_pc_Country*log_GDP_pc_Country
				gen log_GDP_pc_Country_3 = log_GDP_pc_Country*log_GDP_pc_Country*log_GDP_pc_Country

		*Set panel data
				encode Country_ISO, generate(Country_ISO_long)
				tsset Country_ISO_long p5year
				xtset Country_ISO_long p5year
				xi i.p5year

		*Generate panel regressions table using outreg2
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab03.xls, replace addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3)

				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2  i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab03.xls, append addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3)

				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab03.xls, append addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3)

				xtreg   COVW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab03.xls, append addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3)

				xtreg   GE_1W_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab03.xls, append addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3)

				xtreg   GE_0W_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab03.xls, append addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3)

				xtreg   GE_m1W_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, robust fe cluster(Country_ISO_long)
				outreg2 using  tab03.xls, append addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3)
