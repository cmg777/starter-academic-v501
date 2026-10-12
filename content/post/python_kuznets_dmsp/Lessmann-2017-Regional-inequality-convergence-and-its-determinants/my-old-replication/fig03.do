clear

* Figure 3: Changes of regional inequality within countries [GINIW (mean 1992-2001) - GINIW (mean 2002-2012)]
		use "Data/Main_Data.dta", clear

		*Gen GINIW (mean 1992-2001)- GINIW (mean 2002-2012)
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
			* sort Country_ISO
			* merge Country_ISO using "Data\NODATA.dta", unique
			* drop if Country_ISO=="ATA"

		*Gen map
			* spmap D_GINIW using "Data\NOCORD" if id !=1 & id!=247, id(id) fcolor(cranberry*1 cranberry*.8 cranberry*.6 cranberry*.4  dkgreen*.4 dkgreen*.6 dkgreen*.8 dkgreen*1 ) clmethod(custom) clbreaks(-.036000 -.006418 -.0027394 -.0010632 0 .0021963 .0046911 .0071508 .036000)
			* graph export "Figures\Figure_3.emf", as(emf) replace
