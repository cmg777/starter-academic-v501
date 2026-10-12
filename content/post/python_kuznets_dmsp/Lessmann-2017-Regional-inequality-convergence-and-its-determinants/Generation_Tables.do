************************************************************************************************************
************************************************************************************************************
*********REGIONAL INEQUALITY, CONVERGENCE, AND ITS DETERMINANTS - A VIEW FROM OUTER SPACE*******************
************************************************************************************************************
***********************************By Christian Lessmann and Andre Seidel*********************************** 
************************************************************************************************************

************************************************************************************************************
**********Tables *******************************************************************************************
************************************************************************************************************

/*Table 1: Regression results of equation [1] 
____________________________________________________________________________________________________________
*/	
	
		use  "Data\Prediction_Data.dta",clear
		
		*Set panel	
			tsset code_Coutry_Region year 
			xtset code_Coutry_Region year
			xi i.year
			xi i.code_Coutry_Region
			set matsize 11000
			
		*Gen tabel
			xtreg log_GDP_pc_Region log_Light_ppix_Region   , robust cluster(Country_ISO)
			outreg2 using Tables\Table_1.xls, replace keep(log_Light_ppix_Region  log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country log_region log_area  log_region_X_log_area  ) addtext(Region FE, NO, Country FE, NO, Country Group FE, NO, Satlite FE, NO) dec(3)
			
			reg log_GDP_pc_Region log_Light_ppix_Region    _Icode_Cout_2-_Icode_Cout_1504 _satyear_1-_satyear_7 , robust cluster(Country_ISO) 
			outreg2 using Tables\Table_1.xls, append keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country    log_region log_area  log_region_X_log_area  ) addtext(Region FE, YES, Country FE, NO, Country Group FE, NO, Satlite FE, YES) dec(3)
			
			xtreg log_GDP_pc_Region log_Light_ppix_Region    country_dum1-country_dum81  _satyear_1-_satyear_7, robust  cluster(Country_ISO)
			outreg2 using Tables\Table_1.xls, append keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country    log_region log_area  log_region_X_log_area  ) addtext(Region FE, NO, Country FE, YES, Country Group FE, NO, Satlite FE, YES) dec(3)
			
			xtreg log_GDP_pc_Region log_Light_ppix_Region    log_GDP_pc_Country country_dum1-country_dum81  _satyear_1-_satyear_7, robust  cluster(Country_ISO)
			outreg2 using Tables\Table_1.xls, append keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix   log_GDP_pc_Country    log_region log_area  log_region_X_log_area ) addtext(Region FE, NO, Country FE, YES, Country Group FE, NO, Satlite FE, YES) dec(3)
					
			xtreg log_GDP_pc_Region log_Light_ppix_Region     _satyear_1-_satyear_7 eap ssa  mena lac eca sa, robust cluster(Country_ISO)
			outreg2 using Tables\Table_1.xls, append keep(log_Light_ppix_Region  log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country    log_region log_area  log_region_X_log_area  ) addtext(Region FE, NO, Country FE, NO, Country Group FE, YES, Satlite FE, YES) dec(3)

			xtreg log_GDP_pc_Region log_Light_ppix_Region    log_GDP_pc_Country  _satyear_1-_satyear_7 eap ssa  mena lac eca sa, robust cluster(Country_ISO)
			outreg2 using Tables\Table_1.xls, append keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country  log_region log_area  log_region_X_log_area  ) addtext(Region FE, NO, Country FE, NO, Country Group FE, YES, Satlite FE, YES) dec(3)
			
			xtreg log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country log_N_pix_top_cod_1_ppix  log_N_pix_low_cod_1_ppix  log_area log_region log_region_X_log_area _satyear_1-_satyear_7  eap ssa  mena lac eca sa , robust cluster(Country_ISO)
			outreg2 using Tables\Table_1.xls, append keep(log_Light_ppix_Region log_N_pix_top_cod_1_ppix log_N_pix_low_cod_1_ppix  log_GDP_pc_Country  log_region log_area  log_region_X_log_area) addtext(Region FE, NO, Country FE, NO, Country Group FE, YES, Satlite FE, YES) dec(3)

/*Table 2: Correlation between observed predicted and light weighted inequality measures in the cross-section mean of period 2001�2012
____________________________________________________________________________________________________________
*/	
		use  "Data\pred_GDP_pc_Region_G.dta", clear	
		
		gen Light_pc_Region=Light_Region/Pop_Region
		gen Light_pc_Country=Light_Country/Pop_Country
		
		keep if year>2000
		keep if year<2013 
		
		*Calculate inequality measures based on predicted GDPs						
				*GINIW
					gen GINIW_pred_GDP_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco pred_GDP_pc_Region [aw=Pop_Region]  if group == `i'
					replace GINIW_pred_GDP_pc = r(gini) if group == `i'	
					} 
					drop group		
				*Generalized Entropy class -1 
					gen GE_m1W_pred_GDP_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco pred_GDP_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_m1W_pred_GDP_pc = r(gem1) if group == `i'	
					} 
					drop group
				*Generalized Entropy class  0 (mean logarithmic deviation)
					gen GE_0W_pred_GDP_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco pred_GDP_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_0W_pred_GDP_pc = r(ge0) if group == `i'	
					} 
					drop group
				*Generalized Entropy class  1 (Theil index)
					gen GE_1W_pred_GDP_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco pred_GDP_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_1W_pred_GDP_pc = r(ge1) if group == `i'	
					} 
					drop group
				*COVW GE(2) is half the square of the coefficient of variation.
					gen GE_2w_pred_GDP_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco pred_GDP_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_2w_pred_GDP_pc = r(ge2) if group == `i'	
					} 
					drop group
					gen COVW_pred_GDP_pc=sqrt(GE_2w_pred_GDP_pc*2)
					drop GE_2w_pred_GDP_pc		
			
		*Calculate inequality measures based on observed GDPpc								
				*GINIW
					gen GINIW_GDP_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco GDP_pc_Region [aw=Pop_Region]  if group == `i'
					replace GINIW_GDP_pc = r(gini) if group == `i'	
					} 
					drop group	
				*Generalized Entropy class -1 
					gen GE_m1W_GDP_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco GDP_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_m1W_GDP_pc = r(gem1) if group == `i'	
					} 
					drop group
				*Generalized Entropy class  0 (mean logarithmic deviation)
					gen GE_0W_GDP_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco GDP_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_0W_GDP_pc = r(ge0) if group == `i'	
					} 
					drop group
				*Generalized Entropy class  1 (Theil index)
					gen GE_1W_GDP_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco GDP_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_1W_GDP_pc = r(ge1) if group == `i'	
					} 
					drop group		
				*COVW GE(2) is half the square of the coefficient of variation.
					gen GE_2w_GDP_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco GDP_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_2w_GDP_pc = r(ge2) if group == `i'	
					} 
					drop group
					gen COVW_GDP_pc=sqrt(GE_2w_GDP_pc*2)
					drop GE_2w_GDP_pc
					
		*Calculate inequality measures based on light pher capita
				*GINIW
					gen GINIW_Light_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco Light_pc_Region [aw=Pop_Region]  if group == `i'
					replace GINIW_Light_pc = r(gini) if group == `i'	
					} 
					drop group
				*Generalized Entropy class -1 
					gen GE_m1W_Light_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco Light_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_m1W_Light_pc = r(gem1) if group == `i'	
					} 
					drop group
				*Generalized Entropy class  0 (mean logarithmic deviation)
					gen GE_0W_Light_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco Light_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_0W_Light_pc = r(ge0) if group == `i'	
					} 
					drop group
				*Generalized Entropy class  1 (Theil index)
					gen GE_1W_Light_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco Light_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_1W_Light_pc = r(ge1) if group == `i'	
					} 
					drop group		
				*COVW GE(2) is half the square of the coefficient of variation.
					gen GE_2w_Light_pc=.
					egen group = group(Country_ISO year)
					su group, meanonly
					qui forval i = 1/`r(max)' {
					qui ineqdeco Light_pc_Region [aw=Pop_Region]  if group == `i'
					replace GE_2w_Light_pc = r(ge2) if group == `i'	
					} 
					drop group
					gen COVW_Light_pc=sqrt(GE_2w_Light_pc*2)
					drop GE_2w_Light_pc							
		
	*Collapse to cross section 	
		collapse (mean)    GINIW_pred_GDP_pc - COVW_Light_pc   , by(Country_ISO)						
	
	*Correlations		
			pwcorr  GINIW_pred_GDP_pc 		GINIW_GDP_pc 		GINIW_Light_pc			
			pwcorr  GE_m1W_pred_GDP_pc 		GE_m1W_GDP_pc 		GE_m1W_Light_pc
			pwcorr  GE_0W_pred_GDP_pc 		GE_0W_GDP_pc 		GE_0W_Light_pc
			pwcorr  GE_1W_pred_GDP_pc 		GE_1W_GDP_pc 		GE_1W_Light_pc
			pwcorr  COVW_pred_GDP_pc 		COVW_GDP_pc 		COVW_Light_pc	
			
		
/*Table 3: Determinants of sigma convergence, panel fixed effects regressions, 5-year averages
______________________________________________________________________________________________________
*/			
		use "Data\Main_Data.dta", clear
		 
		*Collapse 5-year averages		
				gen p5year = 0 
				replace p5year = 1 if inrange(year,1990,1994)
				replace p5year = 2 if inrange(year,1995,1999)
				replace p5year = 3 if inrange(year,2000,2004)
				replace p5year = 4 if inrange(year,2005,2009)
				replace p5year = 5 if inrange(year,2010,2014)				
				collapse  (firstnm)  Country_NAME (mean) fedelupd2-COVW_pred_GDP_pc, by(Country_ISO p5year)
	
		*Gen controls		
				gen log_GDP_pc_Country=log(GDP_pc_Country)
				gen log_GDP_pc_Country_2=log_GDP_pc_Country*log_GDP_pc_Country
				gen log_GDP_pc_Country_3=log_GDP_pc_Country*log_GDP_pc_Country*log_GDP_pc_Country
		*Set panel
				encode Country_ISO, generate(Country_ISO_long)
				tsset Country_ISO_long p5year 
				xtset Country_ISO_long p5year
				xi i.p5year 
				
		*Gen tabel		
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_3.xls, replace ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) 
				
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2  i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_3.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) 
					
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_3.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) 
				
				xtreg   COVW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_3.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) 
				
				xtreg   GE_1W_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_3.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) 
										
				xtreg   GE_0W_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_3.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) 
							
				xtreg   GE_m1W_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_3.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3) 
				
					
/*Table 4: Determinants of sigma convergence, panel fixed effects regressions, 5-year averages
______________________________________________________________________________________________________
*/	
		use "Data\Main_Data.dta", clear
		 
		* Collapse 5-year averages		
				gen p5year = 0 
				replace p5year = 1 if inrange(year,1990,1994)
				replace p5year = 2 if inrange(year,1995,1999)
				replace p5year = 3 if inrange(year,2000,2004)
				replace p5year = 4 if inrange(year,2005,2009)
				replace p5year = 5 if inrange(year,2010,2014)				
				collapse  (firstnm)  Country_NAME (mean) fedelupd2-COVW_pred_GDP_pc, by(Country_ISO p5year)
		
		*Gen Controls		
				gen log_GDP_pc_Country=log(GDP_pc_Country)
				gen log_GDP_pc_Country_2=log_GDP_pc_Country*log_GDP_pc_Country
				gen log_GDP_pc_Country_3=log_GDP_pc_Country*log_GDP_pc_Country*log_GDP_pc_Country
				gen aid_GDP=Aid/(GDP_pc_Country*Pop_Country)
				replace Resources_rents_share_of_GDP=Resources_rents_share_of_GDP/100
				replace School_enrollment_secondary=School_enrollment_secondary/100
				gen Area_X_price_gasoline=area*price_gasoline/10e+6
				egen fedlup=mean(fedelupd2), by (Country_ISO)
				gen log_GDP_pc_Country_X_fedlup=log_GDP_pc_Country*fedlup
				gen log_GDP_pc_Country_2_fed=log_GDP_pc_Country*log_GDP_pc_Country*fedlup
				gen log_GDP_pc_Country_3_fed=log_GDP_pc_Country*log_GDP_pc_Country*log_GDP_pc_Country*fedlup
		*Set panel		
				encode Country_ISO, generate(Country_ISO_long)
				tsset Country_ISO_long p5year 
				xtset Country_ISO_long p5year
				xi i.p5year 
		
		*Gen Tabele							
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   ///
				Resources_rents_share_of_GDP Arable_land  i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_4.xls, replace ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline  Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) 
								
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
				Trade_GDP_share FDI_share_of_GDP i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_4.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline  Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) 
									
								
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 ///
				area price_gasoline Area_X_price_gasoline i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_4.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline   Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) 				
				/*
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   ///
				 icrg_bureaucratic_qualitiy Polity2   fedlup log_GDP_pc_Country_X_fedlup log_GDP_pc_Country_2_fed log_GDP_pc_Country_3_fed  i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_4.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline  Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) 
				*/			
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3  ///
				aid_GDP School_enrollment_secondary      i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_4.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline   Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) 
			
				xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3  ///
				GINIW_Eth_light     i.p5year, robust fe cluster(Country_ISO_long)					
				outreg2 using  Tables\Table_4.xls, append ///
				addtext(Country FE, YES, Year FE, YES) dec(3)  keep(GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3   Resources_rents_share_of_GDP Arable_land Trade_GDP_share FDI_share_of_GDP aid_GDP School_enrollment_secondary area price_gasoline Area_X_price_gasoline   Polity2 log_GDP_pc_Country_X_fedlup GINIW_Eth_light) 


/*Table B.4: OLS Estimation results for model (2) with standard error adjustment for serial correlation and spatial correlation using radiuses of 1000km, 2000km and 5000km
____________________________________________________________________________________________________________
*/						
		use  "Data\Prediction_Data.dta",clear
		
		*Set panel	
			tsset code_Coutry_Region year 
			xtset code_Coutry_Region year
			xi i.year
			xi i.code_Coutry_Region
			set matsize 11000
		
		*Gen Tabele	
			gen const=1
			ols_spatial_HAC log_GDP_pc_Region log_Light_ppix_Region _Icode_Cout_2-_Icode_Cout_1504 _satyear_1-_satyear_7  ///
			const , lat(Latitude) lon(Longitude) t(year) p(code_Coutry_Region) dist(1000) lag(0) bartlett  
			outreg2 using Tables\Table_B_4.xls, replace ctitle(r:1000 km) keep(log_Light_ppix_Region  ) addtext(Region FE, YES, Country FE, NO, Country Group FE, No, Satlite FE, YES) dec(3)
			
			ols_spatial_HAC log_GDP_pc_Region log_Light_ppix_Region _Icode_Cout_2-_Icode_Cout_1504 _satyear_1-_satyear_7  ///
			const , lat(Latitude) lon(Longitude) t(year) p(code_Coutry_Region) dist(2500) lag(0) bartlett  
			outreg2 using Tables\Table_B_4.xls, append ctitle(r:2500 km) keep(log_Light_ppix_Region ) addtext(Region FE, YES, Country FE, NO, Country Group FE, No, Satlite FE, YES) dec(3)
			
			ols_spatial_HAC log_GDP_pc_Region log_Light_ppix_Region _Icode_Cout_2-_Icode_Cout_1504 _satyear_1-_satyear_7  ///
			const , lat(Latitude) lon(Longitude) t(year) p(code_Coutry_Region) dist(5000) lag(0) bartlett  
			outreg2 using Tables\Table_B_4.xls, append ctitle(r:5000 km) keep(log_Light_ppix_Region ) addtext(Region FE, YES, Country FE, NO, Country Group FE, No, Satlite FE, YES) dec(3)
					

		
		