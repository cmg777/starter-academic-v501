/****************************************************************************
  File: 2.stata_2x2.do
  Project: JEL - DiD: A Practitioner's Guide
  Authors: Baker, Callaway, Cunningham, Goodman-Bacon, Sant'Anna
  Purpose: Replicates the 2x2 results in the JEL paper
             
  Data Required:
    • "did_jel_aca_replication_data" — created by 0.stata_Make_data.do

  Output format:
    • If possible (ie. run on a Mac): Figures saved as `.pdf` in the Figures/ directory, matching `ggsave()` in R
    • Else (ie. run on a PC): Figures saved as `.emf` in the Figures/ directory
	• Tables written as .tex files in the Tables/ directory
	
  Output:
	1. Table 2: weighted and unweighted averages for the simple 2x2 DiD ("tables/table2_stata.tex")
	2. Table 3: regression 2x2 DiD with balanced panel, no controls 	("tables/table3_stata.tex")
	3. Table 4: Covariate-balance table 								("tables/table4_stata.tex")	
	4. Table 5: Regression 2 x 2 DiD with Covariates 					("tables/table5_stata.tex")	
	5. Table 6: Outcome Regressions + Propensity Score Models			("tables/table6_stata.tex")	
	6. Table 7: 2x2 DiD with covariates (Sant'Anna and Zhao 2020)		("tables/table7_stata.tex")	
	7. Figure 1: Distribution of Propensity Scores						("figures/figure1_stata.tex")	
	
  Author: Scott Cunningham
  Last updated: Bacon, Oct 5, 2025
****************************************************************************/

***************************************************************
*1. Table 2: weighted and unweighted averages for the simple 2x2 DiD
***************************************************************
	*Read in data, keep 2013–2014 and 2014 expansion vs "non expansion" states
	use "data/did_jel_aca_replication_data", clear
	keep if inlist(year, 2013, 2014) & inlist(yaca,2014,2020,2021,2023,.)
	gen Treat = (yaca==2014)		// 1 = ACA in 2014
	gen Post = (year == 2014)     	// 1 = post-expansion year

	*Means
	*unweighted
	sum crude_rate if Treat==1 & year==2014
	global u12014 = r(mean)
	sum crude_rate if Treat==1 & year==2013
	global u12013 = r(mean)
	sum crude_rate if Treat==0 & year==2014
	global u02014 = r(mean)
	sum crude_rate if Treat==0 & year==2013
	global u02013 = r(mean)

	*weighted
	sum crude_rate if Treat==1 & year==2014 [aw=set_wt]
	global w12014 = r(mean)
	sum crude_rate if Treat==1 & year==2013  [aw=set_wt]
	global w12013 = r(mean)
	sum crude_rate if Treat==0 & year==2014  [aw=set_wt]
	global w02014 = r(mean)
	sum crude_rate if Treat==0 & year==2013 [aw=set_wt]
	global w02013 = r(mean)

	*Gaps, trends, DiDs 
	* Unweighted
	global Gap13_u = $u12013 - $u02013
	global Gap14_u = $u12014 - $u02014
	global DiD_u   = ( $u12014 - $u12013 ) - ( $u02014 - $u02013 )
	global Trend_T_u = $u12014 - $u12013
	global Trend_C_u = $u02014 - $u02013

	* Weighted
	global Gap13_w = $w12013 - $w02013
	global Gap14_w = $w12014 - $w02014
	global DiD_w   = ( $w12014 - $w12013 ) - ( $w02014 - $w02013 )
	global Trend_T_w = $w12014 - $w12013
	global Trend_C_w = $w02014 - $w02013


	*Rounding for the table
	foreach nm in u12013 u02013 u12014 u02014 ///
				 w12013 w02013 w12014 w02014 ///
				 Gap13_u Gap14_u DiD_u Trend_T_u Trend_C_u ///
				 Gap13_w Gap14_w DiD_w Trend_T_w Trend_C_w {
		local `nm' : display %6.1f ${`nm'}
		display("`nm'")
	}

	* Brick-red DiD cells
	local DiD_u_cell "\em{\em{\textcolor{BrickRed}{`DiD_u'}}}"
	local DiD_w_cell "\em{\em{\textcolor{BrickRed}{`DiD_w'}}}"

	*Write LaTeX file
	cap mkdir "tables"
	local outfile "tables/table2_stata.tex"

	file open fh using "`outfile'", write replace text

	file write fh ///
	"\begin{table}[!h]" _n ///
	"\centering" _n ///
	"\caption{\label{tab:two_by_two_ex}Simple 2 \$\\times\$ 2 DiD}" _n ///
	"\centering" _n ///
	"\fontsize{12}{14}\selectfont" _n ///
	"\begin{threeparttable}" _n ///
	"\begin{tabular}[t]{>{}c>{}c>{}c>{}c>{}c>{}c>{}c}" _n ///
	"\toprule" _n ///
	"\multicolumn{1}{c}{ } & \multicolumn{3}{c}{Unweighted Averages} & " ///
	"\multicolumn{3}{c}{Weighted Averages} \\\\" _n ///
	"\cmidrule(l{3pt}r{3pt}){2-4} \cmidrule(l{3pt}r{3pt}){5-7}" _n ///
	" & Expansion & No Expansion & Gap/DiD & Expansion & No Expansion & Gap/DiD\\\\" _n ///
	"\midrule" _n ///
	"\textcolor{black}{2013} & \textcolor{black}{`u12013'} & \textcolor{black}{`u02013'} & " ///
	"\em{`Gap13_u'} & \textcolor{black}{`w12013'} & \textcolor{black}{`w02013'} & \em{`Gap13_w'}\\\\" _n ///
	"\textcolor{black}{2014} & \textcolor{black}{`u12014'} & \textcolor{black}{`u02014'} & " ///
	"\em{`Gap14_u'} & \textcolor{black}{`w12014'} & \textcolor{black}{`w02014'} & \em{`Gap14_w'}\\\\" _n ///
	"\em{\textcolor{black}{Trend/DiD}} & \em{\textcolor{black}{`Trend_T_u'}} & " ///
	"\em{\textcolor{black}{`Trend_C_u'}} & `DiD_u_cell' & " ///
	"\em{\textcolor{black}{`Trend_T_w'}} & \em{\textcolor{black}{`Trend_C_w'}} & `DiD_w_cell'\\\\" _n ///
	"\bottomrule" _n ///
	"\end{tabular}" _n ///
	"\begin{tablenotes}[para]" _n ///
	"\item \\vspace{-4ex} \\singlespacing \\footnotesize{This table reports average county-level " _n ///
	"mortality rates (deaths among adults aged 20--64 per 100,000 adults) in 2013 (row~1) and 2014 (row~2) " _n ///
	"in states that expanded adult Medicaid eligibility in 2014 (columns~1 and~4) and states that have not expanded " _n ///
	"by 2019 (columns~2 and~5).  The first three columns present unweighted averages and the second three columns " _n ///
	"present population-weighted averages.  Columns~1, 2, 4, and~5 in the third row show time trends in mortality " _n ///
	"between 2013 and 2014 for each group of states.  The first two rows of columns~3 and~6 show the cross-sectional " _n ///
	"gap in mortality between expansion and non-expansion states in 2013 and 2014.  The entries in bold red text in " _n ///
	"row~3 show the simple 2 \$\\times\$ 2 difference-in-differences estimates without weights (column~3) and with them " _n ///
	"(column~6).}" _n ///
	"\end{tablenotes}" _n ///
	"\end{threeparttable}" _n ///
	"\end{table}" _n

	file close fh
	display "✓  LaTeX table written to `outfile'"


***************************************************************
*2. Table 3: regression 2x2 DiD with balanced panel, no controls
***************************************************************
	*Read in data, keep 2013–2014 and 2014 expansion vs "non expansion" states
	use "data/did_jel_aca_replication_data", clear	
	keep if inlist(year, 2013, 2014) & inlist(yaca,2014,2020,2021,2023,.)
	gen Treat = (yaca==2014)		// 1 = ACA in 2014
	gen Post = (year == 2014)     	// 1 = post-expansion year

	*Panel declaration (once)
	xtset county_code year

	*UNWEIGHTED regressions
	eststo clear
	* (1) Treat × Post, no FE
	reg crude_rate_20_64 c.Treat##c.Post, vce(cluster county_code)
	eststo m1
	estadd local countyfe "No"
	estadd local yearfe   "No"

	* (2) Treat × Post with county & year FE  (xtreg, fe → no constant)
	xtreg crude_rate_20_64 c.Treat#c.Post i.year, fe vce(cluster county_code)
	eststo m2
	estadd local countyfe "Yes"
	estadd local yearfe   "Yes"

	* (3) Long-difference, unweighted
	preserve
		keep county_code year crude_rate_20_64 Treat
		reshape wide crude_rate_20_64, i(county_code) j(year)
		gen diff = crude_rate_20_642014 - crude_rate_20_642013
		label variable diff "\$\\Delta\$"
		reg diff Treat, vce(cluster county_code)
	eststo m3
	estadd local countyfe "No"
	estadd local yearfe   "No"
	restore

	*WEIGHTED regressions
	* (4) Weighted, no FE
	reg crude_rate_20_64 c.Treat##c.Post [aw=set_wt], vce(cluster county_code)
	eststo m4
	estadd local countyfe "No"
	estadd local yearfe   "No"

	* (5) Weighted, county & year FE  (areg keeps _cons; we'll hide it)
	xtreg crude_rate_20_64 c.Treat#c.Post i.year [aw=set_wt], ///
		fe vce(cluster county_code)
	eststo m5
	estadd local countyfe "Yes"
	estadd local yearfe   "Yes"


	* (6) Weighted long-difference
	preserve
		keep county_code year crude_rate_20_64 Treat set_wt
		reshape wide crude_rate_20_64, i(county_code) j(year)
		gen diff = crude_rate_20_642014 - crude_rate_20_642013
		reg diff Treat [aw=set_wt], vce(cluster county_code)
	eststo m6
	estadd local countyfe "No"
	estadd local yearfe   "No"
	restore

	*Build the LaTeX table
	local labels ///
		_cons            "Constant" ///
		Treat            "Medicaid Expansion" ///
		Post             "Post" ///
		c.Treat#c.Post   "Medicaid Expansion × Post"

	* Add Treat as the interaction label in long-diff specs (m3 and m6)
	estimates restore m3
	estadd local intlabel "Medicaid Expansion × Post"
	estimates restore m6
	estadd local intlabel "Medicaid Expansion × Post"

	cap mkdir "tables"
	esttab m1 m2 m3 m4 m5 m6 using "tables/table3_stata.tex", replace ///
		b(%9.1f) se(%9.1f) star(* 0.10 ** 0.05 *** 0.01)               ///
		booktabs fragment                                             ///
		keep(_cons Treat Post c.Treat#c.Post)                         ///
		varlabels(_cons "Constant"                                   ///
				  Treat "Medicaid Expansion"                         ///
				  Post  "Post"                                       ///
				  c.Treat#c.Post "Medicaid Expansion × Post")        ///
		mgroups("Unweighted" "Weighted", pattern(1 1 1 1 1 1) span)   ///
		mtitles("Crude Mortality Rate" "Crude Mortality Rate" "$\\Delta$" ///
				"Crude Mortality Rate" "Crude Mortality Rate" "$\\Delta$") ///
		alignment(c)                                                  ///
		stats(N countyfe yearfe, fmt(%9.0g %9s %9s)                   ///
			  labels("Obs." "County fixed effects" "Year fixed effects")) ///
		addnotes("Standard errors clustered by county. Columns 1–3 unweighted; 4–6 weighted by 2013 county population.")	
		
	display "✓  LaTeX 2x2 regression table manually written to tables/table3_stata.tex"
		
		
***************************************************************
*3. Table 4: Covariate-balance table
*			 NB:the table construction is a lot of lines here...
***************************************************************
	*Read in data, keep 2013–2014 and 2014 expansion vs "non expansion" states
	use "data/did_jel_aca_replication_data", clear
keep if inlist(year, 2013, 2014) & inlist(yaca,2014,2020,2021,2023,.)
	gen Treat = (yaca==2014)		// 1 = ACA in 2014
	gen Post = (year == 2014)     	// 1 = post-expansion year

	*local with covariate names
	local covs perc_female perc_white perc_hispanic ///
			   unemp_rate_pc poverty_rate median_income_k

	*2013 levels — unweighted means, SDs, and normalized diff
	preserve
		keep if year == 2013

		*---- means and SDs in a single collapse -----------------------
		collapse (mean)  m_perc_female  			= perc_female       ///
						 m_perc_white   			= perc_white		///
						 m_perc_hispanic   			= perc_hispanic		///
						 m_unemp_rate_pc	  	 	= unemp_rate_pc 	///
						 m_poverty_rate 	     	= poverty_rate		///
						 m_median_income_k		 	= median_income_k 	///
				 (sd)    sd_perc_female  			= perc_female       ///
						 sd_perc_white   			= perc_white		///
						 sd_perc_hispanic  			= perc_hispanic		///
						 sd_unemp_rate_pc		   	= unemp_rate_pc 	///
						 sd_poverty_rate 	    	= poverty_rate		///
						 sd_median_income_k		 	= median_income_k, 	///
				 by(Treat)

		generate byte id = 1          // same value for both rows (Treat 0/1)

		*---- reshape into one wide row -------------------------------------
		reshape wide m* sd_*, i(id) j(Treat)
		drop id                       // no longer needed

		*---- normalized differences ----------------------------------
		foreach x in `covs'{
			gen nd_`x' = (m_`x'1 - m_`x'0) / ///
						 sqrt( (sd_`x'1^2 + sd_`x'0^2) / 2 )
		}

			keep m* nd_*                    // single-row dataset
			tempfile unwt_pre
			save `unwt_pre'
			list
	restore



	*2013 levels — weighted means, SDs, and normalized diff
	preserve
		keep if year == 2013

		*---- means and SDs in a single collapse -----------------------
		collapse (mean)  wm_perc_female  			= perc_female       ///
						 wm_perc_white   			= perc_white		///
						 wm_perc_hispanic   		= perc_hispanic		///
						 wm_unemp_rate_pc	  	 	= unemp_rate_pc 	///
						 wm_poverty_rate 	     	= poverty_rate		///
						 wm_median_income_k		 	= median_income_k 	///
				 (sd)    sd_perc_female  			= perc_female       ///
						 sd_perc_white   			= perc_white		///
						 sd_perc_hispanic  			= perc_hispanic		///
						 sd_unemp_rate_pc		   	= unemp_rate_pc 	///
						 sd_poverty_rate 	    	= poverty_rate		///
						 sd_median_income_k		 	= median_income_k 	///
						 [aw = set_wt], ///
				 by(Treat)

		generate byte id = 1          // same value for both rows (Treat 0/1)

		*---- reshape into one wide row -------------------------------------
		reshape wide wm* sd_*, i(id) j(Treat)
		drop id                       // no longer needed

		*---- normalized differences ----------------------------------
		foreach x in `covs'{
			gen wnd_`x' = (wm_`x'1 - wm_`x'0) / ///
						 sqrt( (sd_`x'1^2 + sd_`x'0^2) / 2 )
		}

			keep wm* wnd_*                    // single-row dataset
			tempfile wt_pre
			save `wt_pre'
			list
	restore


	* Differences - unweighted means, SDs, and normalized diff 
	preserve
		*create differences
		for var `covs': egen bX = total(X*(year==2013)), by(county_code)
		for var `covs': gen d_X = X-bX
		
		keep if year==2014

		*---- means and SDs in a single collapse -----------------------
		collapse (mean)  m_d_perc_female  			= d_perc_female         ///
						 m_d_perc_white   			= d_perc_white			///
						 m_d_perc_hispanic   		= d_perc_hispanic		///
						 m_d_unemp_rate_pc	  	 	= d_unemp_rate_pc 		///
						 m_d_poverty_rate 	     	= d_poverty_rate		///
						 m_d_median_income_k	 	= d_median_income_k 	///
				 (sd)    sd_perc_female  			= d_perc_female         ///
						 sd_perc_white   			= d_perc_white			///
						 sd_perc_hispanic  			= d_perc_hispanic		///
						 sd_unemp_rate_pc	   		= d_unemp_rate_pc 		///
						 sd_poverty_rate 	    	= d_poverty_rate		///
						 sd_median_income_k		 	= d_median_income_k, 	///
				 by(Treat)

		generate byte id = 1          // same value for both rows (Treat 0/1)

		*---- reshape into one wide row -------------------------------------
		reshape wide m* sd_*, i(id) j(Treat)
		drop id                       // no longer needed

		*---- normalized differences ----------------------------------
		foreach x in `covs'{
			gen nd_d_`x' = (m_d_`x'1 - m_d_`x'0) / ///
						 sqrt( (sd_`x'1^2 + sd_`x'0^2) / 2 )
		}

		keep m_d* nd_d*                    // single-row dataset
		tempfile unwt_diff
		save `unwt_diff'
		list	
	restore

	* Differences - weighted means, SDs, and normalized diff 
	preserve
		*create differences
		for var `covs': egen bX = total(X*(year==2013)), by(county_code)
		for var `covs': gen d_X = X-bX
		
		keep if year==2014

		*---- means and SDs in a single collapse -----------------------
		collapse (mean)  wm_d_perc_female  			= d_perc_female         ///
						 wm_d_perc_white   			= d_perc_white			///
						 wm_d_perc_hispanic   		= d_perc_hispanic		///
						 wm_d_unemp_rate_pc	  	 	= d_unemp_rate_pc 		///
						 wm_d_poverty_rate 	     	= d_poverty_rate		///
						 wm_d_median_income_k	 	= d_median_income_k 	///
				 (sd)    sd_perc_female  			= d_perc_female         ///
						 sd_perc_white   			= d_perc_white			///
						 sd_perc_hispanic  			= d_perc_hispanic		///
						 sd_unemp_rate_pc	   		= d_unemp_rate_pc 		///
						 sd_poverty_rate 	    	= d_poverty_rate		///
						 sd_median_income_k		 	= d_median_income_k 	///
						 [aw = set_wt], ///
				 by(Treat)

		generate byte id = 1          // same value for both rows (Treat 0/1)

		*---- reshape into one wide row -------------------------------------
		reshape wide wm* sd_*, i(id) j(Treat)
		drop id                       // no longer needed

		*---- normalized differences ----------------------------------
		foreach x in `covs'{
			gen wnd_d_`x' = (wm_d_`x'1 - wm_d_`x'0) / ///
						 sqrt( (sd_`x'1^2 + sd_`x'0^2) / 2 )
		}

		keep wm* wnd_*                    // single-row dataset
		tempfile wt_diff
		save `wt_diff'
		list	
	restore

	**table creation
	*Assemble the four blocks into one matrix
	use `unwt_pre',     clear
	merge 1:1 _n using `wt_pre',   nogen   // adds mw*  sw*  wnd_*
	merge 1:1 _n using `unwt_diff', nogen   // adds md*  nd_d*
	merge 1:1 _n using `wt_diff',  nogen   // adds mwd* swd* wnd_d_*

	de,f

		   
	* ---- row labels ----------------------------------------------------
	local rowlbl  "% Female" "% White" "% Hispanic" ///
				  "Unemployment Rate" "Poverty Rate" "Median Income"
	local outrows
	local i = 1
	foreach v in `covs' {
		local outrows `"`outrows' `"`:word `i' of `rowlbl''"'"'
		local ++i
	}

	/* ---- build the 12 × 6 matrix ----------------------------------- */
	matrix T = J(12,6,.)
	local r 0
	foreach v of local covs {
		local ++r
		* rows 1–6 : 2013 levels
		matrix T[`r',1] = m_`v'0[1]         // un-wtd mean, Non-adopt
		matrix T[`r',2] = m_`v'1[1]         // un-wtd mean, Adopt
		matrix T[`r',3] = nd_`v'[1]         // un-wtd norm-diff
		matrix T[`r',4] = wm_`v'0[1]        // wtd mean,  Non-adopt
		matrix T[`r',5] = wm_`v'1[1]        // wtd mean,  Adopt
		matrix T[`r',6] = wnd_`v'[1]        // wtd norm-diff
	}

	foreach v of local covs {
		local ++r
		* rows 7–12 : 2014–2013 long-differences
		matrix T[`r',1] = m_d_`v'0[1]        // un-wtd ∆, Non-adopt
		matrix T[`r',2] = m_d_`v'1[1]        // un-wtd ∆, Adopt
		matrix T[`r',3] = nd_d_`v'[1]        // un-wtd norm-diff
		matrix T[`r',4] = wm_d_`v'0[1]       // **underscore added**
		matrix T[`r',5] = wm_d_`v'1[1]       // **underscore added**
		matrix T[`r',6] = wnd_d_`v'[1]       // wtd norm-diff
	}

	matrix rownames T = `outrows' `outrows'
	matrix colnames T = "Non-Adopt" "Adopt" "Norm. Diff." ///
						"Non-Adopt" "Adopt" "Norm. Diff."
						
	*send to LaTeX via esttab
	/*Give the matrix nice, final row-names ------------------------ */
	matrix rownames T = ///
	"\% Female" "\% White" "\% Hispanic" ///
	"Unemployment Rate" "Poverty Rate" "Median Income" ///
	"\% Female $\Delta$" "\% White $\Delta$" "\% Hispanic $\Delta$" ///
	"Unemployment Rate $\Delta$" "Poverty Rate $\Delta$" "Median Income $\Delta$"

	local rowname : word `=`i'-6' of ///
	  "\% Female $\Delta$" "\% White $\Delta$" "\% Hispanic $\Delta$" ///
	  "Unemployment Rate $\Delta$" "Poverty Rate $\Delta$" "Median Income $\Delta$"
	  
	  
	/*LaTeX header / footer strings (single compound quote each) -- */
	local prehead  "\begin{tabular}{l*{6}{c}} \\hline\\hline " ///
				   "\multicolumn{7}{c}{\textit{2013 Covariate Levels}} \\\\"
	local posthead "\hline"
	local prefoot  "\hline \multicolumn{7}{c}{\textit{2014 -- 2013 Covariate Differences}} \\\\ \hline"
	local postfoot "\hline\hline \end{tabular}"

	/*esttab -------------------------------------------------------- */
	cap mkdir "tables"
	esttab matrix(T) using "tables/table4_stata.tex", replace           ///
		  title("Covariate Balance Statistics")                          ///
		  fragment booktabs nomtitles label                              ///
		  mgroups("Unweighted" "Weighted", pattern(1 1 1 1 1 1) span)    ///
		  cells("b(fmt(%6.2f))")                                         ///  <-- two decimals everywhere
		  nonumber noobs alignment(c) incelldelimiter("")                ///
		  prehead(`"`prehead'"')   posthead(`"`posthead'"')              ///
		  prefoot(`"`prefoot'"')   postfoot(`"`postfoot'"')

	display "✓  LaTeX covariate-balance table written to tables/table4_stata.tex"

	*Write LaTeX manually via file write
	* Open LaTeX file
	file open tableout using "tables/table4_stata.tex", write replace
	file write tableout "\begin{tabular}{l*{6}{c}} \\" _n
	file write tableout "\hline\hline" _n
	file write tableout "\multicolumn{7}{c}{\textit{2013 Covariate Levels}} \\" _n
	file write tableout "& \multicolumn{3}{c}{Unweighted} & \multicolumn{3}{c}{Weighted} \\" _n
	file write tableout "Variable & Non-Adopt & Adopt & Norm. Diff. & Non-Adopt & Adopt & Norm. Diff. \\" _n
	file write tableout "\hline" _n

	* Write first 6 rows (2013 Levels)
	forvalues i = 1/6 {
		local rowname : word `i' of ///
			"\% Female" "\% White" "\% Hispanic" ///
			"Unemployment Rate" "Poverty Rate" "Median Income"
		
		local line "`rowname'"
		
		forvalues j = 1/6 {
			local val = T[`i', `j']
			local val_fmt : display %4.2f `val'
			local line "`line' & `val_fmt'"
		}
		
		file write tableout "`line' \\" _n
	}

	file write tableout "\hline" _n
	file write tableout "\multicolumn{7}{c}{\textit{2014 -- 2013 Covariate Differences}} \\" _n

	* Write last 6 rows (Differences)
	forvalues i = 7/12 {
		local rowname : word `=`i'-6' of ///
			"\% Female ($\Delta$)" "\% White ($\Delta$)" "\% Hispanic ($\Delta$)" ///
			"Unemployment Rate ($\Delta$)" "Poverty Rate ($\Delta$)" "Median Income ($\Delta$)"
		
		local line "`rowname'"
		
		forvalues j = 1/6 {
			local val = T[`i', `j']
			local val_fmt : display %4.2f `val'
			local line "`line' & `val_fmt'"
		}

		file write tableout "`line' \\" _n
	}

	* Close table
	file write tableout "\hline\hline" _n
	file write tableout "\end{tabular}" _n
	file close tableout

	display "✓  LaTeX covariate-balance table manually written to tables/table4_stata.tex"



***************************************************************
*4. Table 5: Regression 2 x 2 DiD with Covariates 
***************************************************************
		*read data in again and restrict to 2013/2014
		use "data/did_jel_aca_replication_data", clear
		keep if inlist(year, 2013, 2014) & inlist(yaca,2014,2020,2021,2023,.)
		gen Treat = (yaca==2014)		// 1 = ACA in 2014
		gen Post = (year == 2014)     	// 1 = post-expansion year

		*local with covariate names
		local covs perc_female perc_white perc_hispanic ///
			   unemp_rate_pc poverty_rate median_income_k

		* Keep only relevant variables
		keep county_code year Treat set_wt crude_rate_20_64 `covs'

		* Reshape everything (outcome + covariates) at once
		reshape wide crude_rate_20_64 `covs', i(county_code) j(year)

		* Generate change in covariates
		foreach v of local covs {
			gen d_`v' = `v'2014 - `v'2013
		}

		* Generate outcome: change in crude mortality
		gen long_y = crude_rate_20_642014 - crude_rate_20_642013

		* Drop missing outcome
		drop if missing(long_y)


	eststo clear

	* (1) Unweighted: No covariates
	reg long_y Treat, vce(cluster county_code)
	eststo m1

	* (2) Unweighted: 2013 covariates
	reg long_y Treat ///
		perc_female2013 perc_white2013 perc_hispanic2013 ///
		unemp_rate_pc2013 poverty_rate2013 median_income_k2013, ///
		vce(cluster county_code)
	eststo m2

	* (3) Unweighted: Changes in covariates
	reg long_y Treat ///
		d_perc_female d_perc_white d_perc_hispanic ///
		d_unemp_rate_pc d_poverty_rate d_median_income_k, ///
		vce(cluster county_code)
	eststo m3

	* (4) Weighted: No covariates
	reg long_y Treat [aw=set_wt], vce(cluster county_code)
	eststo m4

	* (5) Weighted: 2013 covariates
	reg long_y Treat ///
		perc_female2013 perc_white2013 perc_hispanic2013 ///
		unemp_rate_pc2013 poverty_rate2013 median_income_k2013 ///
		[aw=set_wt], vce(cluster county_code)
	eststo m5

	* (6) Weighted: Changes in covariates
	reg long_y Treat ///
		d_perc_female d_perc_white d_perc_hispanic ///
		d_unemp_rate_pc d_poverty_rate d_median_income_k ///
		[aw=set_wt], vce(cluster county_code)
	eststo m6

	cap mkdir "tables"
	esttab m1 m2 m3 m4 m5 m6 using "tables/table5_stata.tex", replace ///
		title("Regression 2 \$\\times\$ 2 DiD with Covariates") ///
		keep(Treat) b(%6.2f) se(%6.2f) star(* 0.10 ** 0.05 *** 0.01) ///
		fragment booktabs label nomtitles ///
		alignment(c) collabels(none) ///
		mgroups("Unweighted" "Weighted", pattern(1 1 1 1 1 1) span) ///
		addnotes("Standard errors clustered by county. " ///
				 "Columns 1–3 are unweighted. Columns 4–6 are weighted by 2013 population. " ///
				 "Columns 2 & 5 include 2013 covariates; columns 3 & 6 include 2014–2013 covariate differences.")
				 
	display "✓  LaTeX 2x2 regression with covariates table manually written to tables/table5_stata.tex"
			 
***************************************************************
* Table 6: Outcome Regressions + Propensity Score Models
***************************************************************
	*read data in again and restrict to 2013/2014
	use "data/did_jel_aca_replication_data", clear
	keep if inlist(year, 2013, 2014) & inlist(yaca,2014,2020,2021,2023,.)
	gen Treat = (yaca==2014)		// 1 = ACA in 2014
	gen Post = (year == 2014)     	// 1 = post-expansion year

	*local with covariate names
	local covs perc_female perc_white perc_hispanic ///
		   unemp_rate_pc poverty_rate median_income_k

	* Keep only relevant variables
	keep county_code year Treat set_wt crude_rate_20_64 `covs'

	* Reshape everything (outcome + covariates) at once
	reshape wide crude_rate_20_64 `covs', i(county_code) j(year)

	* Generate change in covariates
	foreach v of local covs {
		gen d_`v' = `v'2014 - `v'2013
	}

	* Generate outcome: change in crude mortality
	gen long_y = crude_rate_20_642014 - crude_rate_20_642013

	* Drop missing outcome
	drop if missing(long_y)
	
	eststo clear

	** (1) Outcome Regression — Unweighted, Untreated Only
	reg long_y ///
		perc_female2013 perc_white2013 perc_hispanic2013 ///
		unemp_rate_pc2013 poverty_rate2013 median_income_k2013 if Treat==0, ///
		vce(robust)
	eststo or1

	** (2) Propensity Score Model — Unweighted Logit
	logit Treat ///
		perc_female2013 perc_white2013 perc_hispanic2013 ///
		unemp_rate_pc2013 poverty_rate2013 median_income_k2013, ///
		vce(robust)
	eststo ps1

	** (3) Outcome Regression — Weighted, Untreated Only
	reg long_y ///
		perc_female2013 perc_white2013 perc_hispanic2013 ///
		unemp_rate_pc2013 poverty_rate2013 median_income_k2013 if Treat==0 ///
		[aw = set_wt], vce(robust)
	eststo or2

	** (4) Propensity Score — Weighted Logit
	logit Treat ///
		perc_female2013 perc_white2013 perc_hispanic2013 ///
		unemp_rate_pc2013 poverty_rate2013 median_income_k2013 ///
		[iw = set_wt], vce(robust)
	eststo ps2

	cap mkdir "tables"
	*put results in a table
	esttab or1 ps1 or2 ps2 using "tables/table6_stata.tex", replace ///
		title("Outcome Regression and Propensity Score Models") ///
		b(%6.2f) se(%6.2f) star(* 0.10 ** 0.05 *** 0.01) ///
		fragment booktabs label alignment(c) ///
		coeflabels( ///
			perc_female "\% Female" ///
			perc_white "\% White" ///
			perc_hispanic "\% Hispanic" ///
			unemp_rate_pc "Unemployment Rate" ///
			poverty_rate "Poverty Rate" ///
			median_income_k "Median Income" ///
			perc_female2013 "\% Female" ///
			perc_white2013 "\% White" ///
			perc_hispanic2013 "\% Hispanic" ///
			unemp_rate_pc2013 "Unemployment Rate" ///
			poverty_rate2013 "Poverty Rate" ///
			median_income_k2013 "Median Income" ///
		) ///
		mtitles("Regression" "Propensity Score" "Regression" "Propensity Score") ///
		mgroups("Unweighted" "Weighted", pattern(1 1 1 1) span) ///
		addnotes("This table reports the outcome and propensity score models that enter the doubly robust estimator. " ///
				 "Outcome models regress long-difference mortality on 2013 covariates among untreated counties. " ///
				 "Propensity score models logit regress Medicaid expansion status on 2013 covariates. " ///
				 "Standard errors are clustered by county.")
	
		display "✓  LaTeX propensity score equation and outcome regression table manually written to tables/table6_stata.tex"

			 
***************************************************************
* Table 7: 2x2 DiD with covariates (Sant'Anna and Zhao 2020)
***************************************************************
	*read data in again and restrict to 2013/2014
	use "data/did_jel_aca_replication_data", clear
	keep if inlist(year, 2013, 2014) & inlist(yaca,2014,2020,2021,2023,.)
	gen Treat = (yaca==2014)		// 1 = ACA in 2014
	gen Post = (year == 2014)     	// 1 = post-expansion year

	*local with covariate names
	local covs perc_female perc_white perc_hispanic ///
		   unemp_rate_pc poverty_rate median_income_k

	*create baseline covariates (drdid would do this but we do it explicitly here)
	*drop the time-varying version of the covariate; not used here
	foreach x in `covs'{
		egen `x'2013 =total(`x'*(year==2013)),by(county_code)
		drop `x'
	}
	* rename the baseline covariates just created 
	rename (perc_female2013 perc_white2013 perc_hispanic2013 ///
			unemp_rate_pc2013 poverty_rate2013 median_income_k2013) ///
		   (perc_female perc_white perc_hispanic ///
			unemp_rate_pc poverty_rate median_income_k)

	* Set panel
	xtset county_code year

	* Unweighted DRDID Estimation
	*request all estimators in one shot (we only use reg, stdipw, and dripw)
	drdid crude_rate_20_64 `covs', ///
		  ivar(county_code) time(year) tr(Treat) ///
		  all ///
		  pscoretrim(0.995) ///
		  wboot(reps(25000) rseed(20240924) wbtype(rademacher)) ///
		  cluster(county_code) 

	* Extract point estimates
	scalar reg     = e(b)[1,3]
	scalar ipw     = e(b)[1,5]
	scalar dripw   = e(b)[1,1]

	* Extract standard errors
	scalar se_reg   = sqrt(e(V)[3,3])
	scalar se_ipw   = sqrt(e(V)[5,5])
	scalar se_dripw = sqrt(e(V)[1,1])

	* Format for LaTeX export
	local reg_str     : display %6.2f reg
	local ipw_str     : display %6.2f ipw
	local dripw_str   : display %6.2f dripw

	local se_reg_str     : display %6.2f se_reg
	local se_ipw_str     : display %6.2f se_ipw
	local se_dripw_str   : display %6.2f se_dripw


	* Weighted DRDID Estimation
	*request all estimators in one shot (we only use reg, stdipw, and dripw)
	drdid crude_rate_20_64 `covs' [iweight = set_wt], ///
		  ivar(county_code) time(year) tr(Treat) ///
		  all ///
		  pscoretrim(0.995) ///
		  wboot(reps(25000) rseed(20240924) wbtype(rademacher)) ///
		  cluster(county_code) 
		    
	* Extract point estimates
	scalar reg_w     = e(b)[1,3]
	scalar ipw_w     = e(b)[1,5]
	scalar dripw_w   = e(b)[1,1]

	* Extract standard errors
	scalar se_reg_w   = sqrt(e(V)[3,3])
	scalar se_ipw_w   = sqrt(e(V)[5,5])
	scalar se_dripw_w = sqrt(e(V)[1,1])

	* Format for LaTeX export
	local reg_w_str     : display %6.2f reg_w
	local ipw_w_str     : display %6.2f ipw_w
	local dripw_w_str   : display %6.2f dripw_w

	local se_reg_w_str     : display %6.2f se_reg_w
	local se_ipw_w_str     : display %6.2f se_ipw_w
	local se_dripw_w_str   : display %6.2f se_dripw_w



	*put results in a table
	cap mkdir Tables
	file open fh using "tables/table7_stata.tex", write replace

	file write fh "\begin{table}[htbp]\centering" _n
	file write fh "\caption{DiD Estimates with Covariates}" _n
	file write fh "\label{tab:2x2_csdid_sc}" _n
	file write fh "\begin{threeparttable}" _n
	file write fh "\begin{tabular}{l*{6}{c}}" _n
	file write fh "\toprule" _n
	file write fh " & \multicolumn{3}{c}{Unweighted} & \multicolumn{3}{c}{Weighted} \\\\" _n
	file write fh "\cmidrule(lr){2-4} \cmidrule(lr){5-7}" _n
	file write fh " & Regression & IPW & Doubly Robust & Regression & IPW & Doubly Robust \\\\" _n
	file write fh "\midrule" _n

	file write fh "Medicaid Expansion & `reg_str' & `ipw_str' & `dripw_str' & `reg_w_str' & `ipw_w_str' & `dripw_w_str' \\\\" _n
	file write fh " & (`se_reg_str') & (`se_ipw_str') & (`se_dripw_str') & (`se_reg_w_str') & (`se_ipw_w_str') & (`se_dripw_w_str') \\\\" _n

	file write fh "\bottomrule" _n
	file write fh "\end{tabular}" _n
	file write fh "\begin{tablenotes}[para]" _n
	file write fh "\footnotesize \singlespacing" _n
	file write fh "\item This table reports the 2 \$\\times\$ 2 DiD estimate comparing counties that expand Medicaid in 2014 to counties that do not expand Medicaid, adjusting for the inclusion of 2013 covariates using the methodologies from \citet{SantAnna2020} and \citet{Callaway2021}. Each panel reports regression adjustment (Column 1), inverse probability weighting (Column 2), and doubly robust estimators (Column 3). Standard errors in parentheses are clustered at the county level." _n
	file write fh "\end{tablenotes}" _n
	file write fh "\end{threeparttable}" _n
	file write fh "\end{table}" _n

	file close fh

	display "✓  LaTeX conditional 2x2 DiD table manually written to tables/table7_stata.tex"


*************************************************
** Figure 1: Distribution of Propensity Scores
*************************************************
	*read data in again and restrict to 2013/2014
	use "data/did_jel_aca_replication_data", clear	
	keep if inlist(year, 2013, 2014) & inlist(yaca,2014,2020,2021,2023,.)
	gen Treat = (yaca==2014)		// 1 = ACA in 2014
	gen Post = (year == 2014)     	// 1 = post-expansion year

	*local with covariate names
	local covs perc_female perc_white perc_hispanic ///
		   unemp_rate_pc poverty_rate median_income_k

	* Keep only relevant variables
	keep county_code year Treat set_wt crude_rate_20_64 `covs'

	* Reshape everything (outcome + covariates) at once
	reshape wide crude_rate_20_64 `covs', i(county_code) j(year)

	* Generate change in covariates
	foreach v of local covs {
		gen d_`v' = `v'2014 - `v'2013
	}

	* Generate outcome: change in crude mortality
	gen long_y = crude_rate_20_642014 - crude_rate_20_642013

	* Drop missing outcome
	drop if missing(long_y)
	
	
	*Unweighted p-score distributions
	eststo ps1: logit Treat ///
		perc_female2013 perc_white2013 perc_hispanic2013 ///
		unemp_rate_pc2013 poverty_rate2013 median_income_k2013, ///
		vce(cluster county_code)
	
	
	*estimates use ps1
	predict pscore_unw

	* Expansion counties
	summ pscore_unw if inlist(Treat,0,1)
	local min = r(min)
	local max = r(max)
	local w   = (`max' - `min')/30
	local s   = floor(`min'/`w')*`w'   // align start to a bin edge
	di `w'
	di `s'
	
	twoway 	histogram pscore_unw if Treat == 1 , width(`w') start(`s') fcolor(none) lcolor(red) || ///
			histogram pscore_unw if Treat == 0 , width(`w') start(`s') fcolor(none) lcolor(blue) ///
			ytitle("Density",angle(horizontal)) xtitle("") title("Unweighted") legend(off) ylabel(0(1)4.5) xlabel(,nogrid)

	cap mkdir "figures"		
	graph save "figures/pscore_uw.gph", replace
	

	*Weighted p-score distributions
	eststo ps2: logit Treat ///
		perc_female2013 perc_white2013 perc_hispanic2013 ///
		unemp_rate_pc2013 poverty_rate2013 median_income_k2013 [iw=set_wt], ///
		vce(cluster county_code)
	
	
	*estimates use ps2
	predict pscore_w

	* Define group for legend
	gen group = cond(Treat == 1, "Expansion", "Non-Expansion")

	* Expansion counties
	summ pscore_w if inlist(Treat,0,1)
	local min = r(min)
	local max = r(max)
	local w   = (`max' - `min')/30
	local s   = floor(`min'/`w')*`w'   // align start to a bin edge

	twoway 	histogram pscore_w if Treat == 1 [fw=set_wt], width(`w') start(`s') fcolor(none) lcolor(red) || ///
			histogram pscore_w if Treat == 0 [fw=set_wt], width(`w') start(`s') fcolor(none) lcolor(blue) ///
			ytitle("") xtitle("Propensity Score") title("Weighted") legend( rows(1)) ylabel(0(1)4.5) xlabel(, nogrid)

	graph save "figures/pscore_w.gph", replace

	*combine graphs and use only one legend and y-axis title
	**NB: differences between the Stata and R histograms are purely down to 
	*some arcane disagreement between histogram and ggplot; as can be seen from 
	*the actual p-score model estimates, the pscores themselves are identical
	grc1leg2 "figures/pscore_uw.gph" "figures/pscore_w.gph", ///
		title("") xtob1title xtitlefrom("figures/pscore_w.gph") ///
		legendfrom("figures/pscore_w.gph") position(6) ring(2) ///
		cols(2) imargin(4 4 4 4)
	graph display, xsize(10) ysize(5)

	*output to pdf if possible, if not do .emf (PC)
	cap graph export "figures/figure1_stata.pdf", replace
	if _rc~=0{
		cap graph export "figures/figure1_stata.emf", replace
	}

	*clean up figure panels
	cap erase "figures/pscore_uw.gph" 
	cap erase "figures/pscore_w.gph"










