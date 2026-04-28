** Install packages 
*ssc install estout, replace all

* Import dataset
use "https://github.com/quarcs-lab/data-open/raw/master/pGDP/simpleTAB04.dta", clear

*Set panel data
xtset id year

* Quietly estimate  regressions with two-way fixed effects

eststo mod1: quietly xtreg  gini lnGDPpc lnGDPpc2 lnGDPpc3 rents land i.year, fe robust cluster(id)
quietly estadd local FE_country   "Yes", replace
quietly estadd local FE_year      "Yes", replace

eststo mod2: quietly xtreg  gini lnGDPpc lnGDPpc2 lnGDPpc3 trade fdi i.year, fe robust cluster(id)
quietly estadd local FE_country   "Yes", replace
quietly estadd local FE_year      "Yes", replace

eststo mod3: quietly xtreg  gini lnGDPpc lnGDPpc2 lnGDPpc3 gasoline areaXgasoline i.year, fe robust cluster(id)
quietly estadd local FE_country   "Yes", replace
quietly estadd local FE_year      "Yes", replace

eststo mod4: quietly xtreg  gini lnGDPpc lnGDPpc2 lnGDPpc3 aid school i.year, fe robust cluster(id)
quietly estadd local FE_country   "Yes", replace
quietly estadd local FE_year      "Yes", replace

eststo mod5: quietly xtreg  gini lnGDPpc lnGDPpc2 lnGDPpc3 ethnic_gini i.year, fe robust cluster(id)
quietly estadd local FE_country   "Yes", replace
quietly estadd local FE_year      "Yes", replace


* Compile professional regression table
#delimit;
    esttab mod1 mod2 mod3 mod4 mod5,
    keep(lnGDPpc lnGDPpc2 lnGDPpc3 rents land trade fdi gasoline areaXgasoline aid school ethnic_gini)
    se
    label 
    stats(N N_g r2 FE_country FE_year, 
        fmt(0 0 2)
        label("Observations" "N Countries" "R-squared" "Country FE" "Year FE"))
    mtitles("Gini" "Gini" "Gini" "Gini" "Gini") 
    nonotes
    addnote("Notes: The dependent variable is the population-weighted regional Gini index." 
            "Robust standard errors are adjusted for clustering at the country level"
            "All models include a constant"
            "* p<0.10, ** p<0.05, *** p<0.01")
    star(* 0.10 ** 0.05 *** 0.01)  
    b(%7.3f)
    compress
    replace;
#delimit cr

* Export regression table to Latex
#delimit;
    esttab mod1 mod2 mod3 mod4 mod5 using "tab04.tex",
    keep(lnGDPpc lnGDPpc2 lnGDPpc3 rents land trade fdi gasoline areaXgasoline aid school ethnic_gini)
    se
    label 
    stats(N N_g r2 FE_country FE_year, 
        fmt(0 0 2)
        label("Observations" "N Countries" "R-squared" "Country FE" "Year FE"))
    mtitles("Gini" "Gini" "Gini" "Gini" "Gini") 
    nonotes
    addnote("Notes: The dependent variable is the population-weighted regional Gini index." 
            "Robust standard errors are adjusted for clustering at the country level"
            "All models include a constant"
            "$* p<0.10, ** p<0.05, *** p<0.01$")
    star(* 0.10 ** 0.05 *** 0.01)  
    b(%7.3f)
    replace;
#delimit cr