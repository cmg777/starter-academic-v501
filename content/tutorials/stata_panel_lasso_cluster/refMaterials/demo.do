******** Section 3.4 & 4.6 Implementation Example ********
***** (Replication of Su, Shi, and Phillips (2016)) ****** 
** Section 3.4: Estimation
clear all
sjlog using classifylasso1, replace
use saving
xtset code year
classifylasso savings lagsavings cpi interest gdp, group(1/5) lambda(1.5485) tol(1e-4) dynamic 
sjlog close, replace
sjlog using classifylasso2, replace
estimates save ssp2016
sjlog close, replace

** Section 4.6: Post-Estimation
sjlog using classifylasso3, replace
estimates use ssp2016
sjlog close, replace
classoselect, group(2) postselection
sjlog using classifylasso4, replace
predict gid
predict yhat, xb
sjlog close, replace


** Figure 1: Visualization of the Implementation Example
sjlog using classifylasso5, replace
set scheme sj
classogroup, export("classifylasso1.pdf")
classocoef cpi, export("classifylasso2.pdf")
sjlog close, replace

