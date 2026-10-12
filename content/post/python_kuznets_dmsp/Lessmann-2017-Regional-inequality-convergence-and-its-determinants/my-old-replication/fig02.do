clear

	* Figure 2: Regional inequality within countries (GINIW, mean (1992-2012))

		use "Data/Main_Data.dta", clear

		*Collapse to cross section
			collapse GINIW_pred_GDP_pc, by(Country_ISO)

		*Merge with NUTS 0 mape data
			* sort Country_ISO
			* merge Country_ISO using "Data\NODATA.dta", unique
			* drop if Country_ISO=="ATA"
		*Gen map
			* spmap GINIW_pred_GDP_pc using "Data\NOCORD" if id !=1 & id!=247, id(id) fcolor(Reds)
			* graph export "Figures\Figure_2.emf", as(emf) replace
