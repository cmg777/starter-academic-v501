/****************************************************
  File:  1.stata_adoption_table.do                     
  Project: JEL - DiD: A Practitioner's Guide
  Authors: Baker, Callaway, Cunningham, Goodman-Bacon, Sant'Anna
  Purpose: 	Replicates Table 1 showing Medicaid Expansion    
			under ACA broken down by different population    
			shares (i.e., share of states, counties, adults) 

  Data Required:
    • "county_mortality_data.csv" — created by R Code
	
  Output:
	1. Just shows that the tabulation is the same

  Author: Scott Cunningham
  Last updated: Bacon, Oct 5, 2025
****************************************************/
clear
capture log close

******************************************************************************
* 1. Load original data to get states right (different from analysis sample)
******************************************************************************
	insheet using "data/county_mortality_data.csv", clear

	keep state county_code year yaca population_20_64
	
	*Define treatment timing
	gen treat_year = real(yaca)
	replace treat_year = 0 if missing(treat_year)
	tostring treat_year, gen(treat_str)
	destring yaca, replace force

	destring population_20_64, replace force
	
	* Drop DC as in JEL Table 1
	drop if state == "District of Columbia"

****************************************************
* 2. Create adoption category                      *
****************************************************
	gen adopt = ""
	replace adopt = "Pre2014" if inlist(state, "Delaware", "Massachusetts", "New York", "Vermont")
	replace adopt = string(yaca) if !missing(yaca) & adopt == ""
	replace adopt = "NonExpansion" if missing(yaca)

****************************************************
* 3. Get number of states and state share          *
****************************************************
	preserve
	keep state adopt
	replace state = strtrim(ustrupper(state))  // normalize before deduping
	drop if missing(state) | trim(state) == ""
	duplicates drop
	gen state_count = 1
	collapse (sum) state_count, by(adopt)
	gen state_share = state_count / 50
	tempfile state_summary
	save `state_summary'
	restore

****************************************************
* 4. Get county & adult pop share (year = 2013)    *
****************************************************
	preserve
	keep if year == 2013

	* Total county count and total 20–64 pop in 2013
	su population_20_64
	scalar total_pop = r(sum)

	su county_code
	scalar total_counties = r(N)

	collapse (count) county_count=county_code (sum) pop=population_20_64, by(adopt)

	gen county_share = county_count / total_counties
	gen pop_share = pop / total_pop

	tempfile county_summary
	save `county_summary'
	restore

****************************************************
* 5. Merge and order categories for display        *
****************************************************
	use `state_summary', clear
	merge 1:1 adopt using `county_summary', nogen

	* Order like JEL Table 1
	gen order = .
	replace order = 1 if adopt == "Pre2014"
	replace order = 2 if adopt == "2014"
	replace order = 3 if adopt == "2015"
	replace order = 4 if adopt == "2016"
	replace order = 5 if adopt == "2019"
	replace order = 6 if adopt == "2020"
	replace order = 7 if adopt == "2021"
	replace order = 8 if adopt == "2023"
	replace order = 9 if adopt == "NonExpansion"
	sort order

	* Round to match JEL formatting
	gen state_share_fmt = string(state_share, "%4.2f")
	gen county_share_fmt = string(county_share, "%4.2f")
	gen pop_share_fmt = string(pop_share, "%4.2f")

****************************************************
* 6. Preview table                                 *
****************************************************
	list adopt state_count state_share_fmt county_count county_share_fmt pop_share_fmt, sepby(order)

****************************************************
* 7. Write LaTeX table for ACA adoption            *
****************************************************
foreach g in Pre2014 2014 2015 2016 2019 2020 2021 2023 NonExpansion {

   summarize state_share if adopt=="`g'", meanonly
    local ss_`g': display %4.2f r(mean)

    summarize county_share if adopt=="`g'", meanonly
    local cs_`g': display %4.2f r(mean)

    summarize pop_share if adopt=="`g'", meanonly
    local ps_`g': display %4.2f r(mean)
}


di "`ss_Pre2014'"

* State lists
local states_Pre2014 "DE, MA, NY, VT"
local states_2014     "AR, AZ, CA, CO, CT, HI, IA, IL, KY, MD, MI, MN, ND, NH, NJ, NM, NV, OH, OR, RI, WA, WV"
local states_2015     "AK, IN, PA"
local states_2016     "LA, MT"
local states_2019     "ME, VA"
local states_2020     "ID, NE, UT"
local states_2021     "MO, OK"
local states_2023     "NC, SD"
local states_NonExpansion "AL, FL, GA, KS, MS, SC, TN, TX, WI, WY"


* Prepare LaTeX file
cap mkdir "tables"
local outfile "tables/table1_stata.tex"

capture file close fh
file open fh using "`outfile'", write replace text

file write fh ///
"\begin{table}[!h]" _n ///
"\centering" _n ///
"\caption{\label{tab:aca_adopt}Medicaid Expansion under the Affordable Care Act}" _n ///
"\fontsize{12}{14}\selectfont" _n ///
"\begin{threeparttable}" _n ///
"\begin{tabular}[t]{lp{8cm}ccc}" _n ///
"\toprule" _n ///
"Expansion Year & States & Share of States & Share of Counties & Share of Adults (2013)\\\\ " _n ///
"\midrule" _n ///
"Pre-2014 & `states_Pre2014' & `ss_Pre2014' & `cs_Pre2014' & `ps_Pre2014'\\\\ " _n ///
"2014 & `states_2014' & `ss_2014' & `cs_2014' & `ps_2014'\\\\ " _n ///
"2015 & `states_2015' & `ss_2015' & `cs_2015' & `ps_2015'\\\\ " _n ///
"2016 & `states_2016' & `ss_2016' & `cs_2016' & `ps_2016'\\\\ " _n ///
"2019 & `states_2019' & `ss_2019' & `cs_2019' & `ps_2019'\\\\ " _n ///
"2020 & `states_2020' & `ss_2020' & `cs_2020' & `ps_2020'\\\\ " _n ///
"2021 & `states_2021' & `ss_2021' & `cs_2021' & `ps_2021'\\\\ " _n ///
"2023 & `states_2023' & `ss_2023' & `cs_2023' & `ps_2023'\\\\ " _n ///
"Non-Expansion & `states_NonExpansion' & `ss_NonExpansion' & `cs_NonExpansion' & `ps_NonExpansion'\\\\ " _n ///
"\bottomrule" _n ///
"\end{tabular}" _n ///
"\begin{tablenotes}[para]" _n ///
"\item \\vspace{-4ex} \\singlespacing \\footnotesize{The table shows which states adopted the ACA's Medicaid expansion in each year as well as the share of all states, counties, and adults in each expansion year.}" _n ///
"\end{tablenotes}" _n ///
"\end{threeparttable}" _n ///
"\end{table}" _n

file close fh
display "✓  LaTeX table written to `outfile'"



