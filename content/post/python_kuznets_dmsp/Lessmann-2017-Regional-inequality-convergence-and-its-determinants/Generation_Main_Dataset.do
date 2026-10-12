************************************************************************************************************
************************************************************************************************************
*********REGIONAL INEQUALITY, CONVERGENCE, AND ITS DETERMINANTS – A VIEW FROM OUTER SPACE*******************
************************************************************************************************************
***********************************By Christian Lessmann and André Seidel*********************************** 
************************************************************************************************************

************************************************************************************************************
**********Generation Main Data******************************************************************************
************************************************************************************************************

************************************************************************************************************
**********Step 1 REGIONAL INCOME PREDICTION*****************************************************************
************************************************************************************************************

/* REGIONAL INCOME PREDICTION (SUBSAMPLE WITH REGIO GDP) 
____________________________________________________________________________________________________________
*/			
		*For the source and definition of the Prediction_Data see Appendix B, table B.3.
			use  "Data\Prediction_Data.dta", clear
			tsset code_Coutry_Region year 
			xtset code_Coutry_Region year
			xi i.year
		
		*Store estimates from main specification reported in column (7) of table 1 
			xtreg log_GDP_pc_Region log_Light_ppix_Region log_GDP_pc_Country log_N_pix_top_cod_1_ppix  log_N_pix_low_cod_1_ppix  log_area log_region log_region_X_log_area   _satyear_1-_satyear_7  eap ssa  mena lac eca sa, robust  cluster(code_Coutry)
		
			predict pred_log_GDP_pc_Region_pix, xb						
			gen beta_1=_b[log_Light_ppix_Region]
			gen beta_2=_b[log_GDP_pc_Country]								
			gen beta_3=_b[log_N_pix_top_cod_1_ppix]					
			gen beta_4=_b[log_N_pix_low_cod_1_ppix]					
			gen beta_5=_b[_satyear_1]
			gen beta_6=_b[_satyear_2]
			gen beta_7=_b[_satyear_3]
			gen beta_8=_b[_satyear_4]
			gen beta_9=_b[_satyear_5]
			gen beta_10=_b[_satyear_6]
			gen beta_11=_b[_satyear_7]							
			gen beta_23=_b[eap]
			gen beta_24=_b[ssa]
			gen beta_25=_b[mena]
			gen beta_26=_b[lac]
			gen beta_27=_b[eca]
			gen beta_28=_b[sa]			
			gen beta_30=_b[log_area]
			gen beta_31=_b[log_region]
			gen beta_32=_b[log_region_X_log_area]							
			gen const_1=_b[_cons]			
			
		*Prediction regio of GDPs for robustness tests								
			gen pred_log_GDP_pc_Region= const_1 + beta_1*log_Light_ppix_Region 	+ beta_2*log_GDP_pc_Country + beta_3*log_N_pix_top_cod_1_ppix + beta_4*log_N_pix_low_cod_1_ppix + beta_5*_satyear_1 + beta_6*_satyear_2 + beta_7*_satyear_3 + beta_8*_satyear_4 + beta_9*_satyear_5 + beta_10*_satyear_6 + beta_11*_satyear_7 + beta_23*eap + beta_24*ssa + beta_25*mena + beta_26*lac + beta_27*eca + beta_28*sa + beta_30*log_area + beta_31*log_region + beta_32*log_region_X_log_area 
			gen pred_GDP_pc_Region=exp(pred_log_GDP_pc_Region)			
			gen pred_GDP_Region=pred_GDP_pc_Region*Pop_Region			
			
		*Prediction country GDPs for robustness tests			
			egen pred_GDP_Country=sum(pred_GDP_Region), by (id_t_j)
			gen pred_GDP_pc_Country=pred_GDP_Country/Pop_Country
			
		*Save GDP predictions for robustness tests		
			save "Data\pred_GDP_pc_Region_G", replace
			
		*Save estimated coefficients				
			rename GDP_pc_Country GDP_pc_Country_G			
			label variable GDP_pc_Country_G "GDP_pc_Country from Gennaioli et al 2014"				
			
			sort  id_t_j			
			collapse (first) Country_ISO  year    beta_1- beta_32  const_1  GDP_pc_Country_G, by(id_t_j)
			sort Country_ISO year
			
			save "Data\prediction_coefficients.dta", replace

/* REGIONAL INCOME PREDICTION (WORLD)
____________________________________________________________________________________________________________
*/
		*For the source and definition of the Regional_Data_SL see Appendix B, table B.3.
			use  "Data\Regional_Data_SL.dta",clear
		
		*Import estimated coefficients
			sort Country_ISO year		
			merge Country_ISO year using "Data\prediction_coefficients.dta"		
			drop _merge		
		
			egen b_1=mean(beta_1)
			egen b_2=mean(beta_2)
			egen b_3=mean(beta_3)
			egen b_4=mean(beta_4)
			egen b_5=mean(beta_5)
			egen b_6=mean(beta_6)
			egen b_7=mean(beta_7)
			egen b_8=mean(beta_8)
			egen b_9=mean(beta_9)
			egen b_10=mean(beta_10)
			egen b_11=mean(beta_11)
			egen b_23=mean(beta_23)
			egen b_24=mean(beta_24)
			egen b_25=mean(beta_25)
			egen b_26=mean(beta_26)
			egen b_27=mean(beta_27)
			egen b_28=mean(beta_28)					
			egen b_30=mean(beta_30)
			egen b_31=mean(beta_31)
			egen b_32=mean(beta_32)					
			egen c_1=mean(const_1)
			
		*Prediction of regional GDP	
			gen pred_log_GDP_pc_Region= c_1 + b_1*log_Light_ppix_Region + b_2*log_GDP_pc_Country + b_3*log_N_pix_top_cod_1_ppix + b_4*log_N_pix_low_cod_1_ppix + b_5*_satyear_1 + b_6*_satyear_2 + b_7*_satyear_3 + b_8*_satyear_4 + b_9*_satyear_5 + b_10*_satyear_6 + b_11*_satyear_7 + b_23*eap + b_24*ssa + b_25*mena + b_26*lac + b_27*eca + b_28*sa + b_30*log_area + b_31*log_region + b_32*log_region_log_area 
			drop if pred_log_GDP_pc_Region==.
			gen pred_GDP_pc_Region=exp(pred_log_GDP_pc_Region)		
			gen pred_GDP_Region=pred_GDP_pc_Region*Pop_Region

		*Prediction of country-level GDP			
			egen pred_GDP_Country=sum(pred_GDP_Region), by (id_t_j)
			gen pred_GDP_pc_Country=pred_GDP_Country/Pop_Country		
	 	
			sort Country_ISO year
			save "Data\pred_GDP_pc_Region.dta", replace 
		
************************************************************************************************************
**********Step 2 REGIONAL INEQUALITY MEASURES***************************************************************
************************************************************************************************************	

/* CALCULATIOIN OF REGIONAL INEQUALITY MEASURES
_____________________________________________________________________________________________________
*/
		use "Data\pred_GDP_pc_Region.dta", clear
		
		*Calculate inequality measures based on predicted GDPs
		*!Caution very time-consuming calculation 
								
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
		
		collapse (first)  Country_NAME Country_ISO year Pix_Country Pop_Country      pred_GDP_pc_Country GDP_pc_Country_G      n_Region GINIW_pred_GDP_pc - COVW_pred_GDP_pc , by(id_t_j)
		sort Country_ISO year 		
		drop id_t_j
					
		save "Data\Inequality_Data.dta", replace
		
/* GEN FINAL DATASET
______________________________________________________________________________________________________
*/			
	*For the source and definition of the Country_DATA see Appendix B, table B.3.
	
		use  "Data\Country_DATA.dta",clear
				
				sort Country_ISO year				
				merge Country_ISO year using "Data\Inequality_Data.dta", unique
				keep if _merge==3				
				drop _merge				
				sort Country_ISO year
				
				label variable Pix_Country "Area of a country measured by the number of pixel"
				label variable Pop_Country "Country total population"
				label variable pred_GDP_pc_Country "Predicted GDPper capita country"
				label variable GDP_pc_Country_G "GDP per capita country Gennaioli et al. (2014)"
				label variable n_Region "Number of subnational regions of a country"
				
				label variable GINIW_pred_GDP_pc "Predicted regional inequality population-weighted Gini coefficient"
				label variable GE_m1W_pred_GDP_pc "Predicted regional inequality population-weighted generalized entropy a=-1"
				label variable GE_0W_pred_GDP_pc "Predicted regional inequality population-weighted mean mogarithmic deviation"
				label variable GE_1W_pred_GDP_pc "Predicted regional inequality population-weighted theil index"
				label variable COVW_pred_GDP_pc "Predicted regional inequality population-weighted coefficient of variation"
				
		save "Data\Main_Data.dta", replace

