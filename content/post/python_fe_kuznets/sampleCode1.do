clear all

** Install packages 
*ssc install aaplot, replace 

* Import dataset
use "https://github.com/quarcs-lab/data-open/raw/master/pGDP/simpleTAB04.dta", clear

* Visually explore the data
aaplot gini lnGDPpc, name(fig1) 
aaplot gini lnGDPpc if year == 1, both name(fig2)
aaplot gini lnGDPpc				, both aformat(%04.3f) bformat(%04.3f) cformat(%04.3f) rmseformat(%04.3f) name(fig3) 

* Estimate linear relationship 
reg gini lnGDPpc if year == 1, robust cluster(id)
reg gini lnGDPpc			 , robust cluster(id)

* Estimate quadratic relationship 
reg  gini lnGDPpc lnGDPpc2 if year == 1, robust cluster(id)
reg  gini lnGDPpc lnGDPpc2			   , robust cluster(id)

* Estimate cubic relationship 
reg  gini lnGDPpc lnGDPpc2 lnGDPpc3 if year == 1, robust cluster(id)
reg  gini lnGDPpc lnGDPpc2 lnGDPpc3				, robust cluster(id)

* Estimate cubic relationship for all years using two-way fixed effects
xtset id year

  reg  gini lnGDPpc lnGDPpc2 lnGDPpc3 i.id i.year, robust cluster(id)
xtreg  gini lnGDPpc lnGDPpc2 lnGDPpc3      i.year, fe robust cluster(id)