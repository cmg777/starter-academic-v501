* Sebastian Kripfganz, www.kripfganz.de
* Vasilis Sarafidis, sites.google.com/view/vsarafidis

/*	Kripfganz, S., and V. Sarafidis (2025).
	Estimating spatial dynamic panel data models with unobserved common factors in Stata.
	Journal of Statistical Software 113 (6).		*/

*** replication file ***

** required packages ** (not needed if already installed; check for available updates by typing "adoupdate")
capture which xtivdfreg
if _rc {
	ssc install xtivdfreg
}
else {
	which xtivdfreg		// xtivdfreg version 1.4.2 or newer required
}
capture which reghdfe
if _rc {
	ssc install reghdfe
}
else {
	which reghdfe		// reghdfe version 6.12.3 required
}
capture which ftools
if _rc {
	ssc install ftools
}
else {
	which ftools		// ftools version 2.49.1 required
}

* data set *
clear all		// Attention: make sure any data currently in memory is saved before running this do-file
use v113i06.dta

* model with factors *
spxtivdfreg NPL INEFF CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, 	///
		absorb(ID) splag tlags(1) spmatrix("W.csv", import)		///
		iv(INTEREST CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, splags lag(1)) std		// coefficient estimates (Table 2, column 1)
estat impact, sr		// short-run effects (not shown in the manuscript)
estat impact, lr		// long-run effects (Table 4, columns 1-3)

* model without factors *
spxtivdfreg NPL INEFF CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY,		///
		absorb(ID) splag tlags(1) spmatrix("W.csv", import)		///
		iv(INTEREST CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, splags lag(1)) std factmax(0)		// coefficient estimates (Table 2, column 2)
estat impact, sr		// short-run effects (not shown in the manuscript)
estat impact, lr		// long-run effects (Table 4, columns 4-6)

* model without spatially lagged dependent variable *
spxtivdfreg NPL INEFF CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY,		///
		absorb(ID) tlags(1) spmatrix("W.csv", import)		///
		iv(INTEREST CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, lag(1)) std		// coefficient estimates (Table 2, column 3)
estat impact, sr		// short-run effects (not shown in the manuscript)
estat impact, lr		// long-run effects (not shown in the manuscript)
xtivdfreg NPL L.NPL INEFF CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, absorb(ID)		/// equivalent specification with xtivdfreg
		iv(INTEREST CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, lag(1)) std

* model with heterogeneous slopes *
spxtivdfreg NPL INEFF CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY,		///
		absorb(ID) splag tlags(1) spmatrix("W.csv", import)		///
		iv(INTEREST CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, splags lag(1)) std mg
estat impact, sr
estat impact, lr
