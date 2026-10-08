********** Section 6 An Empirical Illustration **********
******** (Extended from Acemoglu et al. (2019)) *********
** Estimation
sjlog using classifylasso6, replace
use democracy, clear
xtset country year
sjlog close, replace
forvalues i = 1/4 {
	classifylasso lnPGDP Democracy ly1-ly`i', group(1/5) rho(0.2) a(country year) cluster(country) dynamic optmaxiter(300)
	estimates save democracy`i', replace
}

** Figure 2: Heterogeneous Effects of Democracy on Economic Growth
estimates use democracy1.ster
set scheme sj
classogroup, export("classifylasso3.pdf")
classocoef Democracy, export("classifylasso4.pdf")

** Table 4: Heterogeneous Effects of Democracy on Economic Growth
loc tabopt dec(3) excel noaster
forvalues i = 1/4 {
	reghdfe lnPGDP Democracy ly1-ly`i', a(country year) cluster(country)
	if (`i' == 1) outreg2 using "coeftable.xls", replace `tabopt'
	else outreg2 using "coeftable.xls", append `tabopt'
	estimates use democracy`i'
	classoselect, group(2)
	estimates replay, outreg2("coeftable.xls", append `tabopt')
}

// Stop logging
log close empirical
