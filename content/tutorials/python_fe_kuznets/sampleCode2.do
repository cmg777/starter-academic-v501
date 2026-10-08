** Install packages 
*ssc install estout, replace all

* Import dataset
use "https://github.com/quarcs-lab/data-open/raw/master/pGDP/simpleTAB03.dta", clear

*Set panel data
xtset id year

* Quietly estimate three regressions with two-way fixed effects
eststo mod1: quietly xtreg  gini log_GDPpc i.year, fe robust cluster(id)
quietly estadd local FE_country   "Yes", replace
quietly estadd local FE_year      "Yes", replace

eststo mod2: quietly xtreg  gini log_GDPpc log_GDPpc2 i.year, fe robust cluster(id)
quietly estadd local FE_country   "Yes", replace
quietly estadd local FE_year      "Yes", replace

eststo mod3: quietly xtreg  gini log_GDPpc log_GDPpc2 log_GDPpc3 i.year, fe robust cluster(id)
quietly estadd local FE_country   "Yes", replace
quietly estadd local FE_year      "Yes", replace

* Compile professional regression table
#delimit;
    esttab mod1 mod2 mod3,
    keep(log_GDPpc log_GDPpc2 log_GDPpc3)
    se
    label 
    stats(N N_g r2 FE_country FE_year, 
        fmt(0 0 2)
        label("Observations" "N Countries" "R-squared" "Country FE" "Year FE"))
    mtitles("Gini" "Gini" "Gini") 
    nonotes
    addnote("Notes: The dependent variable is the populuation weighted regional Gini index." 
            "Robusts standard errors are adjusted for clustering at the country level"
						"All models include a constant"
            "* p<0.10, ** p<0.05, *** p<0.01")
    star(* 0.10 ** 0.05 *** 0.01)  
    b(%7.3f)
    compress
    replace;
#delimit cr

* Export regression table to Latex
#delimit;
    esttab mod1 mod2 mod3 using "tab03.tex",
    keep(log_GDPpc log_GDPpc2 log_GDPpc3)
    se
    label 
    stats(N N_g r2 FE_country FE_year, 
        fmt(0 0 2)
        label("Observations" "N Countries" "R-squared" "Country FE" "Year FE"))
    mtitles("Gini" "Gini" "Gini") 
    nonotes
    addnote("Notes: The dependent variable is the population weighted regional Gini index." 
            "Robust standard errors are adjusted for clustering at the country level."
						"All models include a constant."
            "$* p<0.10, ** p<0.05, *** p<0.01$")
    star(* 0.10 ** 0.05 *** 0.01)  
    b(%7.3f)
    replace;
#delimit cr

* Note: After exporting the Latex table, change \multicolumn{4} to \multicolumn{3}