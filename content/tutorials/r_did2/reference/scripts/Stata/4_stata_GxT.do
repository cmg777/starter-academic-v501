/****************************************************************************
  File: 4.stata_2xT.do
  Project: JEL - DiD: A Practitioner's Guide
  Authors: Baker, Callaway, Cunningham, Goodman-Bacon, Sant'Anna
  Purpose: Replicates the GxT results in the JEL paper
             
  Data Required:
    • "did_jel_aca_replication_data" — created by 0.stata_Make_data.do

  Output format:
    • If possible (ie. run on a Mac): Figures saved as `.pdf` in the Figures/ directory, matching `ggsave()` in R
    • Else (ie. run on a PC): Figures saved as `.emf` in the Figures/ directory
	• Tables written as .tex files in the Tables/ directory
	
  Output:
	1. Figure 5: Mortality Trends by Timing Group	("figures/figure5_stata.tex")
	2. Figure 6: ATT(g,t) by Calendar Time 			("figures/figure6_stata.tex")
	3. Figure 7: ATT(g,t) in event-time				("figures/figure7_stata.tex")
	4. Figure 8: Event study without covariates		("figures/figure8_stata.tex")
	5. Figure 9: Event study with covariates		("figures/figure9_stata.tex")

  Author: Scott Cunningham
  Last updated: Bacon, Oct 5, 2025
****************************************************************************/


**************************************************************************
*1. Figure 5: Mortality Trends by Timing Group
**************************************************************************
	*read data in again and relabel treatment groups, specifically the "non-expansion" group
	use "data/did_jel_aca_replication_data", clear
	
	*Define treatment timing labels
	replace treat_str = "Non-Expansion Counties" if inlist(treat_str, "0", "2020", "2021", "2022", "2023")

	*Collapse to group × year means (checked baker's numbers against mine and they're the same)
	collapse (mean) crude_rate [aw = set_wt], by(treat_str year)

	* Plot trends by Timing Group
	twoway ///
		(connected crude_rate year if treat_str == "Non-Expansion Counties", ///
			lcolor(purple*0.35) lwidth(medthick) mcolor(purple*0.35) msymbol(O)) ///
		(connected crude_rate year if treat_str == "2014", ///
			lcolor(gray*1.2) lwidth(medthick) mcolor(gray*1.2) msymbol(O)) ///
		(connected crude_rate year if treat_str == "2015", ///
			lcolor(red*1.5) lwidth(medthick) mcolor(red*1.5) msymbol(O)) ///
		(connected crude_rate year if treat_str == "2016", ///
			lcolor(brown) lwidth(medthick) mcolor(brown) msymbol(O)) ///
		(connected crude_rate year if treat_str == "2019", ///
			lcolor(navy) lwidth(medthick) mcolor(navy) msymbol(O)), ///
		///
		legend(order(2 "2014" 3 "2015" 4 "2016" 5 "2019" 1 "Non-Expansion Counties") ///
				pos(6) ring(2) rows(1) region(lcolor(none)) size(small)) ///
		ytitle("Mortality (20–64)" "per 100,000", size(small) orientation(horizontal)) ///
		ylabel(350 400 450, angle(0) labsize(small) nogrid) ///
		xtitle("") xlabel(2009(1)2019, labsize(small)) ///
		graphregion(color(white)) 

		graph display, xsize(10) ysize(5)

	*output to pdf if possible, if not do .emf (PC)
	cap mkdir "figures"
	cap graph export "figures/figure5_stata.pdf", replace
	if _rc~=0{
			graph export "figures/figure5_stata.emf", replace
	}		



**************************************************************************
*2.   Figure 6: ATT(g,t) by Calendar Time
**************************************************************************
	*read data in 
	use "data/did_jel_aca_replication_data", clear

	*Estimate group × time effects
	csdid crude_rate [iw=set_wt], ///
		ivar(county_code) ///
		time(year) ///
		gvar(treat_year) ///
		long2 ///
		notyet ///
		wboot(reps(25000) rseed(20240924) wbtype(rademacher)) 
	
	*adding the omitted category to every g is very annoying ni the matrix style, so do the graphs using regsave	
	regsave
	
	*extract timing components from csdid
	gen g = real(substr(var,2,4))
	gen t1 = real(substr(var,9,4))	
	gen t2 = real(substr(var,14,4))	
	gen t = (t1)*(t2==g-1) + (t2)*(t1==g-1)
	
	*add omitted period 
	preserve
		keep g
		duplicates drop
		gen t = g-1
		gen coef = 0
		save testo, replace
	restore
	append using testo
	
	*make CIs
	gen lci = coef - 1.96*stderr
	gen uci = coef + 1.96*stderr	
	keep coef lci uci g t
	sort g t
	
	*plot the ATT(g,t) for g=2014
	twoway ///
		(rcap lci uci t if g==2014, ///
		lcolor(gray*1.2) msize(0)) ///
		(scatter coef t if g==2014, ///
		msym(O) mcolor(gray*1.2) 	///
		c(l) lcolor(gray*1.2) 		///
		), ///
		legend(off) ///
		xlabel(2009(2)2019, nogrid) ///
		ylabel(-40(20)20) ///	
		xline(2013, lpattern(dash)) ///
		title("2014") ///
		xtitle("") ///
		ytitle("", orientation(horizontal)) ///
		xsize(10) ysize(5)
		
		graph save "figures/g2014.gph", replace

	*plot the ATT(g,t) for g=2015
	twoway ///
		(rcap lci uci t if g==2015, ///
		lcolor(red*1.5) msize(0)) ///
		(scatter coef t if g==2015, ///
		msym(O) mcolor(red*1.5) 	///
		c(l) lcolor(red*1.5) 		///
		), ///
		legend(off) ///
		xlabel(2009(2)2019, nogrid) ///
		ylabel(-40(20)20) ///	
		xline(2014, lpattern(dash)) ///
		title("2015") ///
		xtitle("") ///
		ytitle("", orientation(horizontal)) ///
		xsize(10) ysize(5)
		
		graph save "figures/g2015.gph", replace

	*plot the ATT(g,t) for g=2016
	twoway ///
		(rcap lci uci t if g==2016, ///
		lcolor(brown) msize(0)) ///
		(scatter coef t if g==2016, ///
		msym(O) mcolor(brown) 	///
		c(l) lcolor(brown) 		///
		), ///
		legend(off) ///
		xlabel(2009(2)2019, nogrid) ///
		ylabel(-40(20)20) ///	
		xline(2015, lpattern(dash)) ///
		title("2016") ///
		xtitle("") ///
		ytitle("", orientation(horizontal)) ///
		xsize(10) ysize(5)		
		
		graph save "figures/g2016.gph", replace
		
	*plot the ATT(g,t) for g=2019
	twoway ///
		(rcap lci uci t if g==2019, ///
		lcolor(navy) msize(0)) ///
		(scatter coef t if g==2019, ///
		msym(O) mcolor(navy) 	///
		c(l) lcolor(navy) 		///
		), ///
		legend(off) ///
		xlabel(2009(2)2019, nogrid) ///
		ylabel(-40(20)20) ///	
		xline(2018, lpattern(dash)) ///
		title("2019") ///
		xtitle("") ///
		ytitle() ///
		xsize(10) ysize(5)		
		
		graph save "figures/g2019.gph", replace
				
	graph combine "figures/g2014.gph" "figures/g2015.gph" "figures/g2016.gph" "figures/g2019.gph", ///
		title("Treatment Effect" "Mortality per 100,000", size(small) orientation(horizontal) pos(9) ring(2))  ///
		cols(2) imargin(4 4 4 4)  
		
	graph display, xsize(10) ysize(5)

	*output to pdf if possible, if not do .emf (PC)
	cap mkdir "figures"
	cap graph export "figures/figure6_stata.pdf", replace
	if _rc~=0{
			graph export "figures/figure6_stata.emf", replace
	}		

	

**************************************************************************
*3.   Figure 7: ATT(g,t) in event-time
**************************************************************************
	gen e = t-g
	keep g e coef
	keep if g<.
	reshape wide coef, i(e) j(g)
	twoway ///
		scatter coef2014 coef2015 coef2016 coef2019 e, ///
		msym(o o o o) mcolor(gray*1.2 red*1.5 brown navy) ///
		c(l l l l) lcolor(gray*1.2 red*1.5 brown navy) lwidth(medthick medthick medthick medthick) ///
		legend(order(1 "2014" 2 "2015" 3 "2016" 4 "2019") rows(1) pos(6) ring(2) size(small)) ///
		xlabel(-10(1)5, nogrid) ///
		ylabel(-20(10)20) ///	
		xline(-1, lpattern(dash)) ///
		title("") ///
		xtitle("") ///
		ytitle() ///
		xsize(10) ysize(5)	
	
	*output to pdf if possible, if not do .emf (PC)
	cap mkdir "figures"
	cap graph export "figures/figure7_stata.pdf", replace
	if _rc~=0{
			graph export "figures/figure7_stata.emf", replace
	}		




/**************************************************************************
4. Figure 8: Event study without covariates
**************************************************************************/
	*read data in 
	use "data/did_jel_aca_replication_data", clear

	*Use csdid for simple ES estimation (uniform and non-uniform CIs); use long2!!
	csdid crude_rate_20_64 [iw=set_wt], ///
		ivar(county_code) time(year) gvar(treat_year) ///
		long2 ///
		notyet ///
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

	*plot only -5 to 5
	keep if inrange(e,-5,5)

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
	cap graph export "figures/figure8_stata.pdf", replace
	if _rc~=0{
			graph export "figures/figure8_stata.emf", replace
	}		


	

/**************************************************************************
5. Figure 9: Event study with covariates
**************************************************************************/
	*read data in 
	use "data/did_jel_aca_replication_data", clear

	*local with covariate names
	local covs perc_female perc_white perc_hispanic ///
		   unemp_rate_pc poverty_rate median_income_k
	
	*Use csdid for simple ES estimation (uniform and non-uniform CIs); use long2!!
	csdid crude_rate_20_64 `covs' [iw=set_wt], ///
		ivar(county_code) time(year) gvar(treat_year) ///
		method(dripw) ///
		long2 ///
		notyet ///
		pscoretrim(0.995) ///
		wboot(reps(25000) rseed(20240924) wbtype(rademacher)) 	///
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

	*plot only -5 to 5
	keep if inrange(e,-5,5)

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
		yline(0, lpattern(dash)) ///
		xline(-1, lpattern(dash)) ///
		xtitle("Event-Time") ///
		ytitle("Treatment Effect" "Mortality Per 100,000", orientation(horizontal) size(small)) ///
		text(19.4 3 "Estimate e ∈ {0,5}=`postcoef'", size(small)) ///
		text(15.5 3 "Std. Error = `postse'" "Conf. Int = [`postlci',`postuci']", size(small))	///
		xsize(10) ysize(5)


	*output to pdf if possible, if not do .emf (PC)
	cap mkdir "figures"
	cap graph export "figures/figure9_stata.pdf", replace
	if _rc~=0{
			graph export "figures/figure9_stata.emf", replace
	}		


*clean up the temporary file
cap erase "testo.dta"

*clean up graph panels
cap erase "figures/g2014.gph"
cap erase "figures/g2015.gph"
cap erase "figures/g2016.gph"
cap erase "figures/g2019.gph"
