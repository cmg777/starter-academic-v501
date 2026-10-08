/****************************************************************************
  File: 3.stata_2xT.do
  Project: JEL - DiD: A Practitioner's Guide
  Authors: Baker, Callaway, Cunningham, Goodman-Bacon, Sant'Anna
  Purpose: Replicates the 2xT results in the JEL paper
             
  Data Required:
    • "did_jel_aca_replication_data" — created by 0.stata_Make_data.do

  Output format:
    • If possible (ie. run on a Mac): Figures saved as `.pdf` in the Figures/ directory, matching `ggsave()` in R
    • Else (ie. run on a PC): Figures saved as `.emf` in the Figures/ directory
	• Tables written as .tex files in the Tables/ directory
	
  Output:
	1. Figure 2: 2014 versus non-expansion mortality trends	("figures/figure2_stata.tex")
	2. Figure 3: 2xT event-study with no covariates 		("figures/figure3_stata.tex")
	3. Figure 4: 2xT event-study with covariates			("figures/figure4_stata.tex")

  Author: Scott Cunningham
  Last updated: Bacon, Oct 5, 2025
****************************************************************************/
	
	
***************************************************************
*1. Figure 2: 2014 versus non-expansion mortality trends
***************************************************************	
	*read data in again and restrict to 2013/2014
	use "data/did_jel_aca_replication_data", clear
	keep if inlist(yaca,2014,2020,2021,2023,.)
	gen Treat = (yaca==2014)		// 1 = ACA in 2014

	*Collapse to means by group × year
	gen expand = cond(Treat==1, "Expansion Counties", "Non-Expansion Counties")

	collapse (mean) crude_rate_20_64 [iw=set_wt], by(expand year)
	rename crude_rate_20_64 mortality

	* Create the plot
	twoway ///
	  (line mortality year if expand == "Expansion Counties",      lcolor(red)  lpattern(solid) lwidth(medium)) ///
	  (line mortality year if expand == "Non-Expansion Counties",  lcolor(blue) lpattern(solid)  lwidth(medium)) ///
	  (scatter mortality year if expand == "Expansion Counties",   msymbol(O)   mcolor(red)) ///
	  (scatter mortality year if expand == "Non-Expansion Counties", msymbol(Oh) mcolor(blue))  , ///
	  legend(order(1 "Expansion Counties" 2 "Non-Expansion Counties") ///
			 pos(6) ring(2) cols(2)) ///
	  xtitle("") ///
	  ytitle("Mortality (20–64)" "Per 100,000", orientation(horizontal)) ///
	  ysize(5) xsize(10) ///
	  xline(2013) ///
	  xlabel(2009(1)2019, nogrid) ///
	  graphregion(color(white)) ///
	  plotregion(style(none))

  	*output to pdf if possible, if not do .emf (PC)
	cap mkdir "figures"
	cap graph export "figures/figure2_stata.pdf", replace
	if _rc~=0{
			graph export "figures/figure2_stata.emf", replace
	}		




***************************************************************
*2. Figure 3: 2xT event-study with no covariates
***************************************************************	
	*read data in again and restrict to 2013/2014
	use "data/did_jel_aca_replication_data", clear
	keep if inlist(yaca,2014,2020,2021,2023,.)

	*Use csdid for simple ES estimation (uniform and non-uniform CIs); use long2!!
	csdid crude_rate_20_64 [iw=set_wt], ///
		ivar(county_code) time(year) gvar(treat_year) ///
		long2 ///
		wboot(reps(25000) rseed(20240924) wbtype(rademacher)) ///
		agg(event)
		
	*you do actually have to grab the uniform CIs from the posted output
	preserve
		clear
		matrix T  = r(table)
		local cn : colnames T
		matrix llu = T[5,1..colsof(T)]
		matrix ulu = T[6,1..colsof(T)]
		matrix uci = (llu', ulu')
		matrix colnames uci = uci_lower uci_upper
		svmat uci, names(col)
		gen var = ""
		local i = 0
		foreach r of local cn{
			local ++i
			replace var = "`r'" in `i'
		}
		save "testo", replace
	restore

	*save the posted output to a dataset and merge back on the uniform CIs
	regsave, ci
	merge 1:1 var using "testo"
	keep if _merge==3
	drop _merge
	
	*get average post coefficient, standard error, and CI
	qui sum coef if var=="Post_avg"
	local postcoef : display %03.2f r(mean)
	qui sum stderr if var=="Post_avg"
	local postse : display %03.2f r(mean)
	local postlci : display %03.2f `postcoef'-1.96*`postse'
	local postuci : display %03.2f `postcoef'+1.96*`postse'
	
	*now only keep the event-study estimates
	keep if substr(var,1,1)=="T"
	keep coef ci* uci* var
	
	*extract timing components from event aggregation notation in csdid
	gen pre = substr(var,2,1)=="m"
	gen post = substr(var,2,1)=="p"
	gen e = real(substr(var,3,.))
	replace e = -e if pre
	
	*add omitted period
	local obs = _N+1
	set obs `obs'
	replace coef = 0 in `obs'
	replace e = -1 in `obs'


	*plot the ATT(g,t) for g=2014
	twoway ///
		(rcap uci_lower uci_upper e, ///
		lcolor(red*1.2) msize(0)) ///
		(rcap ci_lower ci_upper e, ///
		lcolor(black) msize(0)) ///
		(scatter coef e, ///
		msym(O) mcolor(black) 	///
		), ///
		legend(off) ///
		xlabel(-5(1)5, nogrid) ///
		ylabel(-5(5)10) ///	
		yline(0, lpattern(dash)) ///
		xline(-1, lpattern(dash)) ///
		xtitle("Event-Time") ///
		ytitle("Treatment Effect" "Mortality Per 100,000", orientation(horizontal) size(small)) ///
		text(10.5 3 "Estimate e ∈ {0,5}=`postcoef'", size(small)) ///
		text(9 3 "Std. Error = `postse'" "Conf. Int = [`postlci',`postuci']", size(small))	///
		xsize(10) ysize(5)


	*output to pdf if possible, if not do .emf (PC)
	cap mkdir "figures"
	cap graph export "figures/figure3_stata.pdf", replace
	if _rc~=0{
			graph export "figures/figure3_stata.emf", replace
	}		

	*Sanity check: TWFE equivalence (point estimates only; CS reports bootstrapped SEs)
	*use "data/did_jel_aca_replication_data", clear
	*keep if inlist(yaca,2014,2020,2021,2023,.)
	*reg crude_rate_20_64 Treat##ib2013.year [iw=set_wt], cluster(county_code)



***************************************************************
*3. Figure 4: 2xT event-study with covariates
***************************************************************	
	*read data in again and restrict to 2013/2014
	use "data/did_jel_aca_replication_data", clear
	keep if inlist(yaca,2014,2020,2021,2023,.)
	
	*local with covariate names
	local covs perc_female perc_white perc_hispanic ///
		   unemp_rate_pc poverty_rate median_income_k

	*Estimate RA, IPW, and DR using csdid version 1.81 (Oct 2025)
	local reg_title "Regression"
	local stdipw_title "IPW"
	local dripw_title "Doubly Robust"
	foreach m in reg stdipw dripw{
		csdid crude_rate_20_64 `covs' [iw=set_wt], ///
			ivar(county_code) time(year) gvar(treat_year) ///
			method(`m') ///
			long2 ///
			never ///
			wboot(reps(25000) rseed(20240924) wbtype(rademacher)) ///
			pscoretrim(0.995) agg(event)

		*you do actually have to grab the uniform CIs from the posted output
		preserve
			clear
			matrix T  = r(table)
			local cn : colnames T
			matrix llu = T[5,1..colsof(T)]
			matrix ulu = T[6,1..colsof(T)]
			matrix uci = (llu', ulu')
			matrix colnames uci = uci_lower uci_upper
			svmat uci, names(col)
			gen var = ""
			local i = 0
			foreach r of local cn{
				local ++i
				replace var = "`r'" in `i'
			}
			save "testo", replace
		restore

		*save the posted output to a dataset and merge back on the uniform CIs
		preserve
			regsave, ci
			merge 1:1 var using "testo"
			keep if _merge==3
			drop _merge
			
			*get average post coefficient, standard error, and CI
			qui sum coef if var=="Post_avg"
			local postcoef : display %03.2f r(mean)
			qui sum stderr if var=="Post_avg"
			local postse : display %03.2f r(mean)
			local postlci : display %03.2f `postcoef'-1.96*`postse'
			local postuci : display %03.2f `postcoef'+1.96*`postse'
			
			*now only keep the event-study estimates
			keep if substr(var,1,1)=="T"
			keep coef ci* uci* var
			
			*extract timing components from event aggregation notation in csdid
			gen pre = substr(var,2,1)=="m"
			gen post = substr(var,2,1)=="p"
			gen e = real(substr(var,3,.))
			replace e = -e if pre
			
			*add omitted period
			local obs = _N+1
			set obs `obs'
			replace coef = 0 in `obs'
			replace e = -1 in `obs'


			*plot the ATT(g,t) for g=2014
			twoway ///
				(rcap uci_lower uci_upper e, ///
				lcolor(red*1.2) msize(0)) ///
				(rcap ci_lower ci_upper e, ///
				lcolor(black) msize(0)) ///
				(scatter coef e, ///
				msym(O) mcolor(black) 	///
				), ///
				legend(off) ///
				xlabel(-5(1)5, nogrid) ///
				ylabel(-20(10)20) ///	
				xline(-1, lpattern(dash)) ///
				yline(0, lpattern(dash)) ///
				xtitle("Event-Time") ///
				ytitle("") ///
				title("``m'_title'") ///
				xsize(10) ysize(5)
				
				graph save "figures/`m'.gph", replace
		restore
	}

	*combine graphs and use only one legend and y-axis title
	**NB: differences between the Stata and R come from the bootstrap uncertainty
	**analytic standard errors are identical
	grc1leg2 "figures/reg.gph" "figures/stdipw.gph" "figures/dripw.gph", ///
		title("") xtob1title xtitlefrom("figures/reg.gph") ///
		l1title("Treatment Effect" "Mortality Per 100,000", size(small) orientation(horizontal)) ///
		loff ///
		ycommon ///
		position(6) ring(2) ///
		cols(3) imargin(4 4 4 4)

	graph display, xsize(12) ysize(5)

	*output to pdf if possible, if not do .emf (PC)
	cap mkdir "figures"
	cap graph export "figures/figure4_stata.pdf", replace
	if _rc~=0{
			graph export "figures/figure4_stata.emf", replace
	}		

*clean up the temporary file
cap erase "testo.dta"

*clean up graph panels
cap erase "figures/reg.gph" 
cap erase "figures/stdipw.gph" 
cap erase "figures/dripw.gph"

exit






















/*
{

***************************************************************
***************************************************************
*   ALTERNATE GRAPHING SYNTAX USING POSTED MATRICES INSTEAD OF regsave
*2. Figure 3: 2xT event-study with no covariates
***************************************************************	
***************************************************************
	*read data in again and restrict to 2013/2014
	use "data/did_jel_aca_replication_data", clear
	keep if inlist(yaca,2014,2020,2021,2023,.)
	gen Treat = (yaca==2014)		// 1 = ACA in 2014use testo, clear

	*Use csdid for simple ES estimation (uniform and non-uniform CIs); use long2!!
	csdid crude_rate_20_64 [iw=set_wt], ///
		ivar(county_code) time(year) gvar(treat_year) ///
		long2 ///
		wboot(reps(25000) rseed(20240924) wbtype(rademacher)) ///
		agg(event)

	*grab uniform CIs right from the output 
	*(they can't be constructed from the pointwise SEs)
	matrix T  = r(table)
	matrix bu  = T[1,1..colsof(T)]
	matrix llu = T[5,1..colsof(T)]
	matrix ulu = T[6,1..colsof(T)]
	local cn : colnames T
	matrix colnames bu  = `cn'
	matrix colnames llu = `cn'
	matrix colnames ulu = `cn'


	* Create a fake coefficient at -1
	matrix b = e(b)
	matrix V = e(V)

	* Grab existing colnames
	local oldnames : colnames b
	di "`oldnames'"

	* Add a column for the omitted period
	matrix b = b, 0

	* Add the new colname at the end
	matrix colnames b = `oldnames' Tm1

	* Add variance = 0 for that coefficient
	local k = colsof(V) + 1
	matrix V = (V, J(`=rowsof(V)',1,0))
	matrix V = (V \ J(1,`k',0))
	matrix colnames V = `oldnames' Tm1
	matrix rownames V = `oldnames' Tm1

	* Re-post augmented results
	ereturn post b V

	*get average post coefficient, standard error, and CI
	matrix b = e(b)
	matrix V = e(V)
	local postcoef : display %03.2f b[1,2]
	local postse : display %03.2f sqrt(V[2,2])
	local postlci : display %03.2f `postcoef'-1.96*`postse'
	local postuci : display %03.2f `postcoef'+1.96*`postse'


	*Plot event-study (Figure 3)
	coefplot ///
		(matrix(bu`m'), ci((llu`m' ulu`m')) keep(Tm5 Tm4 Tm3 Tm2 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		   msymbol(none) ciopts(lcolor(red)) ///
		) ///
		(. , keep(Tm5 Tm4 Tm3 Tm2 Tm1 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		msymbol(O) mcolor(black) ciopts(lcolor(black)) ///
		), ///
		order(Tm5 Tm4 Tm3 Tm2 Tm1 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		vertical ///
		nooffset ///
		legend(off) ///
		xlabel(1 "-5" 2 "-4" 3 "-3" 4 "-2" 5 "-1" 6 "0" 7 "1" 8 "2" 9 "3" 10 "4" 11 "5", nogrid) ///
		ylabel(-5(5)10) ///	
		yline(0, lpattern(dash)) xline(5, lpattern(dash)) ///
		xtitle("Event Time") ///
		ytitle("Treatment Effect" "Mortality Per 100,000", orientation(horizontal)) ///
		text(10.5 9 "Estimate e ∈ {0,5}=`postcoef'", size(small)) ///
		text(9 9 "Std. Error = `postse'" "Conf. Int = [`postlci',`postuci']", size(small))	

	graph export "figures/event_study_2xT.pdf", replace

	
	
	
	
	
***************************************************************
***************************************************************
*   ALTERNATE GRAPHING SYNTAX USING POSTED MATRICES INSTEAD OF regsave
*2. Figure 3: 2xT event-study with no covariates
***************************************************************	
***************************************************************	
	*read data in again and restrict to 2013/2014
	use "data/did_jel_aca_replication_data", clear
	keep if inlist(yaca,2014,2020,2021,2023,.)
	gen Treat = (yaca==2014)		// 1 = ACA in 2014use testo, clear
	
	*local with covariate names
	local covs perc_female perc_white perc_hispanic ///
		   unemp_rate_pc poverty_rate median_income_k

	*Estimate RA, IPW, and DR using csdid version 1.81 (Oct 2025)
	foreach m in reg stdipw dripw{
		csdid crude_rate_20_64 `covs' [iw=set_wt], ///
			ivar(county_code) time(year) gvar(treat_year) ///
			method(`m') ///
			long2 ///
			never ///
			wboot(reps(25000) rseed(20240924) wbtype(rademacher)) ///
			pscoretrim(0.995) agg(event)

		*grab uniform CIs right from the output 
		*(they can't be constructed from the pointwise SEs)
		matrix T  = r(table)
		matrix bu`m'  = T[1,1..colsof(T)]
		matrix llu`m' = T[5,1..colsof(T)]
		matrix ulu`m' = T[6,1..colsof(T)]
		local cn : colnames T
		matrix colnames bu`m'  = `cn'
		matrix colnames llu`m' = `cn'
		matrix colnames ulu`m' = `cn'
				
		matrix b`m' = e(b)
		matrix V`m' = e(V)
	}
		
	*now build the 3 panels of the figure
	*Regression adjustment (RA)
	local m reg
	* Create a fake coefficient at -1
	* Grab existing colnames
	local oldnames : colnames b`m'
	di "`oldnames'"

	* Add a column for the omitted period
	matrix b`m' = b`m', 0

	* Add the new colname at the end
	matrix colnames b`m' = `oldnames' Tm1

	* Add variance = 0 for that coefficient
	local k = colsof(V`m') + 1
	matrix V`m' = (V`m', J(`=rowsof(V`m')',1,0))
	matrix V`m' = (V`m' \ J(1,`k',0))
	matrix colnames V`m' = `oldnames' Tm1
	matrix rownames V`m' = `oldnames' Tm1

	* Re-post augmented results
	ereturn post b`m' V`m'

	coefplot ///
		(matrix(bu`m'), ci((llu`m' ulu`m')) keep(Tm5 Tm4 Tm3 Tm2 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		   msymbol(none) ciopts(lcolor(red)) ///
		) ///
		(. , keep(Tm5 Tm4 Tm3 Tm2 Tm1 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		msymbol(O) mcolor(black) ciopts(lcolor(black)) ///
		), ///
		order(Tm5 Tm4 Tm3 Tm2 Tm1 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		vertical ///
		nooffset ///
		legend(off) ///
		xlabel(1 "-5" 2 "-4" 3 "-3" 4 "-2" 5 "-1" 6 "0" 7 "1" 8 "2" 9 "3" 10 "4" 11 "5") ///
		ylabel(-20(10)20) ///	
		yline(0, lpattern(dash)) xline(5, lpattern(dash)) ///
		xtitle("Event Time") ///
		ytitle("") ///
		title("Regression") 

	graph save ra.gph, replace

	*Inverse propensity score reweighting (IPW)
	local m stdipw
	* Create a fake coefficient at -1
	* Grab existing colnames
	local oldnames : colnames b`m'
	di "`oldnames'"

	* Add a column for the omitted period
	matrix b`m' = b`m', 0

	* Add the new colname at the end
	matrix colnames b`m' = `oldnames' Tm1

	* Add variance = 0 for that coefficient
	local k = colsof(V`m') + 1
	matrix V`m' = (V`m', J(`=rowsof(V`m')',1,0))
	matrix V`m' = (V`m' \ J(1,`k',0))
	matrix colnames V`m' = `oldnames' Tm1
	matrix rownames V`m' = `oldnames' Tm1

	* Re-post augmented results
	ereturn post b`m' V`m'

	coefplot ///
		(matrix(bu`m'), ci((llu`m' ulu`m')) keep(Tm5 Tm4 Tm3 Tm2 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		   msymbol(none) ciopts(lcolor(red)) ///
		) ///
		(. , keep(Tm5 Tm4 Tm3 Tm2 Tm1 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		msymbol(O) mcolor(black) ciopts(lcolor(black)) ///
		), ///
		order(Tm5 Tm4 Tm3 Tm2 Tm1 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		vertical ///
		nooffset ///
		legend(off) ///
		xlabel(1 "-5" 2 "-4" 3 "-3" 4 "-2" 5 "-1" 6 "0" 7 "1" 8 "2" 9 "3" 10 "4" 11 "5") ///
		ylabel(-20(10)20) ///	
		yline(0, lpattern(dash)) xline(5, lpattern(dash)) ///
		xtitle("Event Time") ///
		ytitle("") ///
		title("IPW") 

	graph save ipw.gph, replace
	

	*Doubly Robust (DR; SZ estimator)
	local m dripw
	* Create a fake coefficient at -1
	* Grab existing colnames
	local oldnames : colnames b`m'
	di "`oldnames'"

	* Add a column for the omitted period
	matrix b`m' = b`m', 0

	* Add the new colname at the end
	matrix colnames b`m' = `oldnames' Tm1

	* Add variance = 0 for that coefficient
	local k = colsof(V`m') + 1
	matrix V`m' = (V`m', J(`=rowsof(V`m')',1,0))
	matrix V`m' = (V`m' \ J(1,`k',0))
	matrix colnames V`m' = `oldnames' Tm1
	matrix rownames V`m' = `oldnames' Tm1

	* Re-post augmented results
	ereturn post b`m' V`m'

	coefplot ///
		(matrix(bu`m'), ci((llu`m' ulu`m')) keep(Tm5 Tm4 Tm3 Tm2 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		   msymbol(none) ciopts(lcolor(red)) ///
		) ///
		(. , keep(Tm5 Tm4 Tm3 Tm2 Tm1 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		msymbol(O) mcolor(black) ciopts(lcolor(black)) ///
		), ///
		order(Tm5 Tm4 Tm3 Tm2 Tm1 Tp0 Tp1 Tp2 Tp3 Tp4 Tp5) ///
		vertical ///
		nooffset ///
		legend(off) ///
		xlabel(1 "-5" 2 "-4" 3 "-3" 4 "-2" 5 "-1" 6 "0" 7 "1" 8 "2" 9 "3" 10 "4" 11 "5") ///
		ylabel(-20(10)20) ///	
		yline(0, lpattern(dash)) xline(5, lpattern(dash)) ///
		xtitle("Event Time") ///
		ytitle("") ///
		title("Doubly Robust")
		
	graph save dr.gph, replace

	*combine graphs and use only one legend and y-axis title
	**NB: differences between the Stata and R come from the bootstrap uncertainty
	**analytic standard errors are identical
	grc1leg2 ra.gph ipw.gph dr.gph, ///
		title("") xtob1title xtitlefrom("ra.gph") ///
		l1title("Treatment Effect" "Mortality Per 100,000", size(small) orientation(horizontal)) ///
		loff ///
		ycommon ///
		position(6) ring(2) ///
		cols(3) imargin(4 4 4 4)

	graph display, xsize(10) ysize(5)

graph export "figures/event_study_2xT_covs.pdf", replace
}

*/



