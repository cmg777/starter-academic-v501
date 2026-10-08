** Program: Dynamic panel data example about the relationship between economic growth and war


* NOTE: For this code to work, you have to run it in the official DO file editor of Stata
* Thank you to Prof. Baum for sharing this code with us.

** 1. Install modules
*ssc install estout, replace
*ssc install outreg2, replace
*net install tsg_schemes, from("https://raw.githubusercontent.com/asjadnaqvi/Stata-schemes/main/schemes/") replace
*set scheme white_tableau, permanently

** 2. Clean the environment
set more off
clear all
cls
capt log close

** 3. Import data
use "https://github.com/quarcs-lab/data-open/raw/master/panel/CatoJ.dta", clear
sum 
sum cty Year DemocIndxLag PolitFreeLag EconFreeLag
 * NOTE: It looks like a full balanced panel dataset, but it isn't.  Some missing observations were code as 0, so we need to fix this problem


** 4. Change numeric values (0) to missing values
mvdecode DemocIndxLag PolitFreeLag EconFreeLag, mv(0)
sum      DemocIndxLag PolitFreeLag EconFreeLag

** 5. Label key variables
lab var lnGDPpercapita  lnGDPpc
lab var EconFreeLag     L.EconFreedom
lab var PolitFreeLag    L.PolitFreedom

** 6. Create function `ssta`' to compute long-run effects (Orginal code from Prof. Baum)
prog ssta,rclass
qui {
nlcom (_b[War]+_b[L.War]+_b[L2.War])  // / (1-_b[L.lnGDPpercapita])
mat b = r(b)
mat v = r(V)
estadd scalar SSwar = b[1,1]
estadd scalar SSwarSE = sqrt(v[1,1])
estadd scalar SSwarT= b[1,1]/sqrt(v[1,1])
nlcom (_b[Coup]+_b[L.Coup])  // / (1-_b[L.lnGDPpercapita])
mat b = r(b)
mat v = r(V)
estadd scalar SScoup = b[1,1]
estadd scalar SScoupSE = sqrt(v[1,1])
estadd scalar SScoupT= b[1,1]/sqrt(v[1,1])
}
end

loc addss SSwar SSwarSE SSwarT SScoup SScoupSE SScoupT
mata: mata set matafavor speed, perm

** 7. Set up panel data for 5 year intervals
xtset cty Year, delta(5)

** 8. Run dynamic panel regressions
eststo clear

* Model 1
eststo: xtabond2 L(0/1).lnGDPpercapita  L(0/2).War L(0/1).Coup  i.Year, gmm(lnGDPpercapita War Coup, lag(2 6)) iv(L(0/2).War L(0/1).Coup)  iv(i.Year) noleveleq robust twostep
ssta

* Model 2
eststo: xtabond2 L(0/1).lnGDPpercapita EconFreeLag  L(0/2).War L(0/1).Coup i.Year, gmm(lnGDPpercapita War Coup, lag(2 6)) iv(L(0/2).War L(0/1).Coup) iv(i.Year) iv(EconFreeLag ) noleveleq robust twostep
ssta

* Model 3
eststo: xtabond2 L(0/1).lnGDPpercapita PolitFreeLag  L(0/2).War L(0/1).Coup i.Year, gmm(lnGDPpercapita War Coup, lag(2 6)) iv(L(0/2).War L(0/1).Coup) iv(i.Year) iv(PolitFreeLag ) noleveleq robust twostep
ssta

* Model 4
eststo: xtabond2 L(0/1).lnGDPpercapita EconFreeLag PolitFreeLag L(0/2).War L(0/1).Coup i.Year, gmm(lnGDPpercapita War Coup, lag(2 6)) iv(L(0/2).War L(0/1).Coup)  iv(i.Year) iv(EconFreeLag PolitFreeLag ) noleveleq robust twostep
ssta

** 9. Construct professional regression table
esttab,  lab star(* 0.1 ** 0.05 *** 0.01) indicate(Quinquennia effects = *.Year) stat(N N_g `addss' hansen hansen_df hansenp, labels("N" "N. Countries" "sum War coeff." "s.e. War" "t War" "sum Coup coeff." "s.e. Coup" "t Coup" "Hansen J" "J d.f." "J pvalue")) ti("Dynamic panel data estimates of log GDP per capita") nomti

** 10. Generate rich text file for the regressio results
esttab using catoj2.rtf, replace  lab star(* 0.1 ** 0.05 *** 0.01) indicate(Quinquennia effects = *.Year) stat(N N_g `addss' hansen hansen_df hansenp, labels("N" "N. Countries" "Sum War coeff." "s.e. War" "t War" "sum Coup coeff." "s.e. Coup" "t Coup"  "Hansen J" "J d.f." "J pvalue")) ti("Dynamic panel data estimates of log GDP per capita") nomti