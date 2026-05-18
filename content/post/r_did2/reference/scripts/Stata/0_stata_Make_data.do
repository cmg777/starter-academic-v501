/****************************************************************************
  File: 0.stata_Make_data.do
  Project: JEL - DiD: A Practitioner's Guide
  Authors: Baker, Callaway, Cunningham, Goodman-Bacon, Sant'Anna
  Purpose: Creates a single dataset to use for the subsequent replication
             
  Data Required:
    • `county_mortality_data_sc.dta` — Cleaned version of the R CSV

  Output:
    • Figures saved as `.pdf` in the Figures/ directory, matching `ggsave()` in R
  
  Sections:
    1. Load and prepare data
    2. Clean sample: drop early/partial adopters, check panel balance
    3. Construct timing, treatment, and weight variables
    4. Generate each figure

  Last updated: Bacon, Oct 5, 2025
****************************************************************************/
cd "$root"
	
********************************
* 1. Load and prepare data
********************************
	clear all
	set more off
	capture log close

	insheet using "data/county_mortality_data.csv", clear

********************************
* 2. Prepare timing groups
********************************
	*Drop early and mid adopters
	drop if inlist(state, "District of Columbia", "Delaware", "Massachusetts", "New York", "Vermont")

	*Define treatment timing
	gen treat_year = real(yaca)
	replace treat_year = 0 if missing(treat_year)
	tostring treat_year, gen(treat_str)
	destring yaca, replace force

********************************
* 3. Prepare covariates
********************************
	*destring covariates
	destring deaths population_20_64 crude_rate_20_64 population_total population_20_64_hispanic population_20_64_female population_20_64_white unemployed labor_force unemp_rate poverty_rate median_income, replace force
	ren population_total total_population

	*Drop counties with missing covariates
	gen perc_white    = population_20_64_white   / population_20_64 * 100
	gen perc_hispanic = population_20_64_hispanic/ population_20_64 * 100
	gen perc_female   = population_20_64_female  / population_20_64 * 100
	gen unemp_rate_pc = unemp_rate * 100
	gen median_income_k = median_income/1000
	drop if missing(crude_rate_20_64, population_20_64, ///
					perc_white, perc_hispanic, perc_female, ///
					unemp_rate_pc, poverty_rate, median_income_k)

********************************
* 4. Sample construction
********************************				
	*Keep counties with full 11-year panel
	bys county_code (year): gen panel_n = _N
	bys county_code: keep if panel_n == 11
	drop panel_n 
	replace treat_year=0 if treat_year>2019

********************************
* 5. Construct population weight
********************************
	bys county_code: egen set_wt = max(cond(year==2013, population_20_64, .))

********************************
* 6. Label variables
********************************
	label variable crude_rate_20_64 "Crude Mortality Rate"

	
	
save "data/did_jel_aca_replication_data", replace

exit



