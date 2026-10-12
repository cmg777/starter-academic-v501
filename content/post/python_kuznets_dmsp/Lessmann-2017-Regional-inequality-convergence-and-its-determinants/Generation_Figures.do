************************************************************************************************************
************************************************************************************************************
*********REGIONAL INEQUALITY, CONVERGENCE, AND ITS DETERMINANTS – A VIEW FROM OUTER SPACE*******************
************************************************************************************************************
***********************************By Christian Lessmann and André Seidel*********************************** 
************************************************************************************************************

************************************************************************************************************
**********Figures ******************************************************************************************
************************************************************************************************************				
				
/*Figure 1: Predicted regional income (mean 1992-2012) and Figure B.1: Predicted regional GDP p.c. in Sub-Saharan Africa
____________________________________________________________________________________________________________
*/	
		use "Data\pred_GDP_pc_Region.dta", clear
		
		*Collapse to cross section 	
			keep if year>1991
			keep if year<2013				
			collapse  ssa  pred_GDP_pc_Region pred_GDP_pc_Country, by(Region_ISO)
			
		*Merge with NUTS 1 mape data 					
			sort Region_ISO				
			merge Region_ISO using "Data\NODATA_2.dta", unique
			
		*Gen maps		
			spmap pred_GDP_pc_Region using "Data\NOCORD_2" if id !=1 & id!=3301, id(id) clnumber(9) fcolor (Blues2)
			graph export "Figures\Figure_1.emf", as(emf) replace
							
			spmap pred_GDP_pc_Region using "Data\NOCORD_2" if ssa==1, id(id) clnumber(9) fcolor (Blues2)
			graph export "Figures\Figure_B_1.emf", as(emf) replace
			
/* Figure 2: Regional inequality within countries (GINIW, mean (1992-2012)) 
______________________________________________________________________________________________________
*/
		use "Data\Main_Data.dta", clear
			
		*Collapse to cross section 		
			collapse GINIW_pred_GDP_pc, by(Country_ISO)				
			
		*Merge with NUTS 0 mape data 				
			sort Country_ISO
			merge Country_ISO using "Data\NODATA.dta", unique
			drop if Country_ISO=="ATA"
		*Gen map	
			spmap GINIW_pred_GDP_pc using "Data\NOCORD" if id !=1 & id!=247, id(id) fcolor(Reds)  
			graph export "Figures\Figure_2.emf", as(emf) replace
		
/* Figure 3: Changes of regional inequality within countries [GINIW (mean 1992-2001)—GINIW (mean 2002-2012)]
______________________________________________________________________________________________________
*/		
		use "Data\Main_Data.dta", clear
		
		*Gen GINIW (mean 1992-2001)—GINIW (mean 2002-2012)		
			gen p2year = 0 
			replace p2year = 1 if inrange(year,2002,2012)
			gen id_t2_j=string(p2year)+Country_ISO
	
			egen GINIW_Lights_ppix_91_01=  mean(GINIW_pred_GDP_pc), by (id_t2_j)
			replace GINIW_Lights_ppix_91_01 = . if p2year==1
			egen GINIW_Lights_ppix_02_12=  mean(GINIW_pred_GDP_pc), by (id_t2_j)
			replace GINIW_Lights_ppix_02_12 = . if p2year==0
						
			collapse GINIW_Lights_ppix_91_01 - GINIW_Lights_ppix_02_12 , by(Country_ISO)
			
		*Gen Changes								
			gen D_GINIW=GINIW_Lights_ppix_91_01-GINIW_Lights_ppix_02_12
		
		*Merge with NUTS 0 mape data	
			sort Country_ISO							
			merge Country_ISO using "Data\NODATA.dta", unique				
			drop if Country_ISO=="ATA"
			
		*Gen map		
			spmap D_GINIW using "Data\NOCORD" if id !=1 & id!=247, id(id) fcolor(cranberry*1 cranberry*.8 cranberry*.6 cranberry*.4  dkgreen*.4 dkgreen*.6 dkgreen*.8 dkgreen*1 ) clmethod(custom) clbreaks(-.036000 -.006418 -.0027394 -.0010632 0 .0021963 .0046911 .0071508 .036000)
			graph export "Figures\Figure_3.emf", as(emf) replace
		
/*Figure 4: Regional inequality and development
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
	
		*Gen log_GDPs		
			gen log_GDP_pc_Country=log(GDP_pc_Country)
			gen log_GDP_pc_Country_2=log_GDP_pc_Country*log_GDP_pc_Country
			gen log_GDP_pc_Country_3=log_GDP_pc_Country*log_GDP_pc_Country*log_GDP_pc_Country

		*Gen partial residuals
		*The points in the graph are partial residuals for spatial inequality the inequality measure has been adjusted for the effects of the other explanatory variables in the model as specified in column (3) Table 3.
			encode Country_ISO, generate(Country_ISO_long)
			tsset Country_ISO_long p5year 
			xtset Country_ISO_long p5year
			xi i.p5year				
			xtreg   GINIW_pred_GDP_pc log_GDP_pc_Country log_GDP_pc_Country_2 log_GDP_pc_Country_3 i.p5year, robust fe cluster(Country_ISO_long)					
			predict temp, xb
			gen GINIW_temp_fix=temp-(.2931121 *log_GDP_pc_Country-.0319694*log_GDP_pc_Country_2+.0011224*log_GDP_pc_Country_3-.0020906 *_Ip5year_2-.0029051*_Ip5year_3-.0013659*_Ip5year_4-.0043752*_Ip5year_5-.798523)
			drop temp 
			gen GINIW_temp=GINIW_pred_GDP_pc-(-.0020906 *_Ip5year_2-.0029051*_Ip5year_3-.0013659*_Ip5year_4-.0043752*_Ip5year_5+GINIW_temp_fix)
		
		*Gen figures
			tw (scatter GINIW_temp log_GDP_pc_Country,  msymbol(Oh)  mlabsize(small) scale(1) xlabel(5[1]12) ylabel(0[0.02]0.16, nogrid))  ///
			(function y= -.798523+.2931121*x -.0319694*x^2+.0011224*x^3, lcolor(black) range(5 12))	///
			,xtitle("{stSerif:log (GDP per capita)}", size(medlarge)) ytitle("{stSerif: Partial regional inequality (GINIW)}", size(medlarge)) xsize(3.1) ysize(2.8) legend(off) ///
			saving("Figures\Figure_4_a", replace) 
			
			tw (scatter GINIW_temp log_GDP_pc_Country  if Country_ISO=="POL" | Country_ISO=="AUS" | Country_ISO=="SWE" | Country_ISO=="PRY" | Country_ISO=="BGD" | Country_ISO=="CHN" | Country_ISO=="IRN" | Country_ISO=="MOZ" | Country_ISO=="LBR" | Country_ISO=="ITL" | Country_ISO=="IRE" | Country_ISO=="ARE"  | Country_ISO=="THA",  msymbol(t) mlabel(Country_ISO) mlabsize(small) scale(1) xlabel(5[1]12) ylabel(0[0.02]0.16, nogrid) )  ///
			(function y= -.798523+.2931121*x -.0319694*x^2+.0011224*x^3, lcolor(black) range(5 12))	///
			,xtitle("{stSerif:log (GDP per capita)}", size(medlarge)) ytitle("{stSerif: Partial regional inequality (GINIW)}", size(medlarge)) xsize(3.1) ysize(2.8) legend(off) ///
			saving("Figures\Figure_4_b", replace) 
	
/* Figure 5: Regional inequality versus personal inequality and the risk of internal conflict (mean 2001-2012)
______________________________________________________________________________________________________
*/	
		use "Data\Main_Data.dta", clear
		
		*Collapse to cross section 	
			keep if year>2000
			keep if year<2013
			collapse (firstnm)  Country_NAME (mean) fedelupd2-COVW_pred_GDP_pc  , by(Country_ISO)
		
		*Normalization to [0,1]
			gen GINIall_100=Giniall/100
			*gen icrg_risk_of_internal_conflict=(12-icrg_internal_conflict)/12
			
		*Gen figures
			tw (scatter GINIall_100 GINIW_pred_GDP_pc,  msymbol(t) xlabel(0[0.5]0.16) ylabel(0.2[0.1]0.8, nogrid) scale(1))  ///
			(lfit  GINIall_100 GINIW_pred_GDP_pc , lcolor(blue)) ///
			,xtitle("{stSerif:Interregional inequality: GINIW}", size(medlarge)) ytitle("{stSerif:Interpersonal inequality: GINI}", size(medlarge)) xsize(3.1) ysize(2.8) legend(off) ///
			saving("Figures\Figure_5_a", replace)
		/*
			tw (scatter icrg_risk_of_internal_conflict GINIW_pred_GDP_pc ,  msymbol(t) xlabel(0[0.5]0.16) ylabel(0[0.1]0.7, nogrid) scale(1))  ///
			(lfit  icrg_risk_of_internal_conflict GINIW_pred_GDP_pc, lcolor(blue)) ///
			,xtitle("{stSerif:Interregional inequality: GINIW}", size(medlarge)) ytitle("{stSerif:Risk of internal conflict: ICRG}", size(medlarge)) xsize(3.1) ysize(2.8) legend(off) ///
			saving("Figures\Figure_5_b", replace)
		*/
/*Figure A.1: Predicted regional GDP per capita, measured regional GDP per capita (mean 2001—2010), and national income level
____________________________________________________________________________________________________________
*/		
		use  "Data\pred_GDP_pc_Region_G.dta", clear	
		
		*Collapse to cross section 					
			keep if year>2000
			keep if year<2011															
			collapse  (firstnm) Region_NAME Country_ISO (mean)  Country_ISO_long GDP_pc_Country GDP_pc_Region log_GDP_pc_Region pred_log_GDP_pc_Region  pred_GDP_pc_Region Pix_Region Pop_Region, by(code_Coutry_Region)
		*Gen figure
			tw (scatter log_GDP_pc_Region pred_log_GDP_pc_Region if GDP_pc_Country<4089 ,  msymbol(t) scale(0.5))  ///
			(scatter log_GDP_pc_Region pred_log_GDP_pc_Region if GDP_pc_Country>4089 & GDP_pc_Country<12615,  msymbol(+))  ///
			(scatter log_GDP_pc_Region pred_log_GDP_pc_Region if GDP_pc_Country>12615,  msymbol(O))  ///
			(function y=x, lcolor(black) range(5.5 12)) ///
			,xtitle("{stSerif:log (predicted regional GDP per capita)}", size(huge)) ytitle("{stSerif:log (observed regional GDP per capita)}", size(huge)) legend( order(1 "{stSerif:LIC}" 2 "{stSerif:MIC}" 3 "{stSerif:HIC}") ring(0) pos(5) size(huge)) ///
			saving("Figures\figure_A_1", replace)
		
/*Figure A.2: Predicted regional GDP per capita and measured regional GDP per capita (mean 2001—2010) and regional output density.
____________________________________________________________________________________________________________
*/	
		use  "Data\pred_GDP_pc_Region_G.dta", clear	
		
		*Collapse to cross section 					
			keep if year>2000
			keep if year<2011																
			collapse  (firstnm) Region_NAME Country_ISO (mean)  Country_ISO_long GDP_pc_Country GDP_pc_Region log_GDP_pc_Region pred_log_GDP_pc_Region  pred_GDP_pc_Region Pix_Region Pop_Region, by(code_Coutry_Region)
		
		*Gen GDP density
			gen GDP_dens_Region=(GDP_pc_Region*Pop_Region)/Pix_Region
			
		*Gen figure	
			tw (scatter log_GDP_pc_Region pred_log_GDP_pc_Region if GDP_dens_Region<168071.5,  msymbol(t) scale(0.5))  ///
			(scatter log_GDP_pc_Region pred_log_GDP_pc_Region if GDP_dens_Region>168071.5 & GDP_dens_Region< 1478853,  msymbol(+))  ///
			(scatter log_GDP_pc_Region pred_log_GDP_pc_Region if GDP_dens_Region> 1478853,  msymbol(O))  ///
			(function y=x, lcolor(black) range(5.5 12)) ///
			,xtitle("{stSerif:log (predicted regional GDP per capita)}", size(huge)) ytitle("{stSerif:log (observed regional GDP per capita)}", size(huge)) legend( order(1 "{stSerif:LDIR}" 2 "{stSerif:MDIR}" 3 "{stSerif:HDIR}") ring(0) pos(5) size(huge)) ///
			saving("Figures\figure_A_2", replace)
		
/*Figure A.3: Predicted regional GDP per capita and measured regional GDP per capita USA 2010 and regional price parity.
____________________________________________________________________________________________________________
*/
		use  "Data\pred_GDP_pc_Region_G.dta", clear
		
		*Collapse to USA 2010 subsample 
		*Source: Regional Price Parities (RPP)= USA Bureau of Economic Analysis
			keep if year==2010
			keep if Country_ISO=="USA"
			
		*Gen figure											
			tw (scatter log_GDP_pc_Region pred_log_GDP_pc_Region  if RPP< 90.2 ,  msymbol(t) scale(0.5) xlabel(10.2[0.2]11.1) ylabel(10.2[0.2]11.1) mlabel(Region_NAME) )  ///
			(scatter log_GDP_pc_Region pred_log_GDP_pc_Region if RPP> 90.2  & RPP<102.8 ,  msymbol(+) mlabel(Region_NAME))  ///
			(scatter log_GDP_pc_Region pred_log_GDP_pc_Region if RPP> 102.8  ,  msymbol(O) mlabel(Region_NAME))  ///
			(function y=x, range(10.2 11.1) lcolor(black) ) ///
			,xtitle("{stSerif:log (predicted regional GDP per capita)}", size(huge)) ytitle("{stSerif:log (observed regional GDP per capita)}", size(huge)) legend( order(1 "{stSerif:LRPP}" 2 "{stSerif:MRPP}" 3 "{stSerif:HRPP}") ring(0) pos(5) size(huge))	///
			saving("Figures\figure_A_3", replace)
	
/*Figure A.4: All countries: Predicted versus observed GDP per capita at the national level (mean 2001-2010) 
______________________________________________________________________________________________________
*/			
		use "Data\Main_Data.dta", clear		
				
		*Collapse to cross section 					
			keep if year>2000
			keep if year<2011						 
			collapse   GDP_pc_Country pred_GDP_pc_Country GDP_pc_Country_G, by(Country_ISO)
		
		*Gen log GDPs					
			gen log_GDP_pc_Country=log(GDP_pc_Country)
			gen log_pred_GDP_pc_Country=log(pred_GDP_pc_Country)				
			gen log_GDP_pc_Country_geroli=log(GDP_pc_Country_G)
			
		*Gen observed GDP identifier
			gen geroli_dum=1
			replace geroli_dum = 0 if GDP_pc_Country_G==.
			
		*Gen figure					
			tw (scatter log_GDP_pc_Country log_pred_GDP_pc_Country if geroli_dum==1 ,  msymbol(t) mlabel(Country_ISO) scale(0.5))  ///
			(scatter log_GDP_pc_Country log_pred_GDP_pc_Country if geroli_dum==0 , mlabel(Country_ISO) msymbol(o))  ///
			(function y=x, lcolor(black) range(5.5 12)) ///
			,xtitle("{stSerif:log (predicted national GDP per capita)}", size(huge)) ytitle("{stSerif:log (observed national GDP per capita)}", size(huge)) legend( order(1 "{stSerif:observed data}" 2 "{stSerif:predicted data}") ring(0) pos(5) size(huge)) ///
			saving("Figures\Figure_A_4", replace) 
				
/*Figure B.3: Predicted regional inequality (GINIW) in Germany 2000-2012
______________________________________________________________________________________________________
*/		
		use "Data\Main_Data.dta", clear
		
		*Collapse to DEU subsample
			keep if Country_ISO=="DEU"
			keep if year>1999
			keep if year<2013		
		*Gen figure					
			tw (line GINIW_pred_GDP_pc year ,  msymbol(t) mlabel(Country_ISO) mlabsize(small) scale(1) xlabel(2000[2]2012) ylabel(0.025[0.002]0.035, nogrid) )  ///
			,xtitle("{stSerif:Year}", size(medlarge)) ytitle("{stSerif: Partial regional inequality (GINIW)}", size(medlarge)) xsize(3.1) ysize(2.8) legend(off) ///
			saving("Figures\Figure_B_3", replace)	
		
		