/****************************************************************************
  File: 5.stata_RR.do
  Project: JEL - DiD: A Practitioner's Guide
  Authors: Baker, Callaway, Cunningham, Goodman-Bacon, Sant'Anna
  Purpose: Calculates CI's under PT violations no worse than than the worst pre-period violation
			based on Rambachan and Roth (2020)
             
  Data Required:
    • "did_jel_aca_replication_data" — created by 0.stata_Make_data.do
	
  Output: No files, just the RR output 
	
  Last updated: Bacon, Oct 5, 2025
****************************************************************************/
************************************************
*1. read data in again and restrict to 2013/2014
************************************************
	use "data/did_jel_aca_replication_data", clear
	keep if inlist(yaca,2014,2020,2021,2023,.)
	
************************************************
*Estimate unconditional csdid version 1.81 (Oct 2025)
************************************************
	csdid crude_rate_20_64 [iw=set_wt], ///
		ivar(county_code) time(year) gvar(treat_year) ///
		long2 ///
		never ///
		wboot(reps(25000) rseed(20240924) wbtype(rademacher)) ///
		agg(event)

	estat event, window(-5,0) post
	
************************************************
*Honest DiD, relative magnitude only using M=1 for e=0
************************************************	
honestdid, type(relative_magnitude) pre(3/6) post(7) mvec(1)

exit


