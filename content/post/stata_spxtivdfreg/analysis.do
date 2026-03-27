****************************************************
* Spatial Dynamic Panels with Common Factors in Stata:
* Credit Risk in US Banking
*
* Companion do-file for the tutorial at:
*   carlos-mendez.org/post/stata_spxtivdfreg/
*
* Based on: Kripfganz & Sarafidis (2025), JSS 113(6)
*
* Dataset: 350 US banks, 2006:Q1--2014:Q4
*   Variables: NPL, INEFF, CAR, SIZE, BUFFER, PROFIT, QUALITY, LIQUIDITY
*   Instrument: INTEREST (for INEFF)
*   Weight matrix: Correlation-based (W.csv)
*
* Packages required: xtivdfreg (>= 1.4.2), reghdfe, ftools
*
* Usage:
*   1. Open Stata 14+
*   2. Run: do analysis.do
*   (Data and W matrix are loaded from GitHub automatically)
****************************************************

clear all
set more off

* Install packages (if needed)
capture ssc install xtivdfreg, replace
capture ssc install reghdfe, replace
capture ssc install ftools, replace

*---------------------------------------------------
* Section 3: Setup and data loading
*---------------------------------------------------

* 3.1 Load data from GitHub
use "https://github.com/cmg777/starter-academic-v501/raw/master/content/post/stata_spxtivdfreg/references/v113i06.dta", clear

* Download W matrix to current working directory
copy "https://github.com/cmg777/starter-academic-v501/raw/master/content/post/stata_spxtivdfreg/references/W.csv" "W.csv", replace

* 3.2 Panel setup
xtset ID TIME

* 3.3 Panel summary statistics
xtsum NPL INEFF CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY INTEREST

*---------------------------------------------------
* Section 4: Full model with common factors
*---------------------------------------------------

spxtivdfreg NPL INEFF CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, ///
    absorb(ID) splag tlags(1) spmatrix("W.csv", import) ///
    iv(INTEREST CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, splags lag(1)) std
estimates store full

* Short-run effects
estat impact, sr

* Long-run effects
estat impact, lr

*---------------------------------------------------
* Section 5: Without common factors
*---------------------------------------------------

spxtivdfreg NPL INEFF CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, ///
    absorb(ID) splag tlags(1) spmatrix("W.csv", import) ///
    iv(INTEREST CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, splags lag(1)) std factmax(0)
estimates store nofact

* Short-run effects
estat impact, sr

* Long-run effects
estat impact, lr

*---------------------------------------------------
* Section 6: Without spatial lag
*---------------------------------------------------

spxtivdfreg NPL INEFF CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, ///
    absorb(ID) tlags(1) spmatrix("W.csv", import) ///
    iv(INTEREST CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, lag(1)) std
estimates store nospat

* Equivalent xtivdfreg specification
xtivdfreg NPL L.NPL INEFF CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, ///
    absorb(ID) iv(INTEREST CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, lag(1)) std

*---------------------------------------------------
* Section 8: Heterogeneous slopes
*---------------------------------------------------

spxtivdfreg NPL INEFF CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, ///
    absorb(ID) splag tlags(1) spmatrix("W.csv", import) ///
    iv(INTEREST CAR SIZE BUFFER PROFIT QUALITY LIQUIDITY, splags lag(1)) std mg
estimates store hetero

* Short-run effects
estat impact, sr

* Long-run effects
estat impact, lr

*---------------------------------------------------
* Section 9: Model comparison
*---------------------------------------------------

estimates table full nofact nospat hetero, b(%7.3f) star(0.1 0.05 0.01)
