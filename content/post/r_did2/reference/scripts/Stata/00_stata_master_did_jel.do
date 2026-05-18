/********************************************************
  File: 00.stata_master_did_jel.do
  Project: JEL - DiD: A Practitioner's Guide
  Authors: Baker, Callaway, Cunningham, Goodman-Bacon, Sant'Anna
  Purpose: sets path names, installs packages, runs dofiles
  Run time: about 11 minutes on a 64G machine with 
			Intel(R) Xeon(R) Silver 4108 CPU @ 1.80GHz (1.79 GHz) (2 processors)
********************************************************/

global rootdir "your pathname here"
cd "$rootdir"

/* install any packages locally */
di "=== Redirecting where Stata searches for ado files ==="
capture mkdir "$rootdir/ado"
cap adopath - PERSONAL
cap adopath - OLDPLACE
cap adopath - SITE
sysdir set PLUS     "$rootdir/ado/plus"
sysdir set PERSONAL "$rootdir/ado"       // may be needed for some packages
sysdir

/*set packages to install and install them*/
global sscdate "2025-11-29"
global sscmirror "raw.githubusercontent.com/labordynamicsinstitute/ssc-mirror/$sscdate/"
local ssc_packages "csdid drdid honestdid regsave estout coefplot grc1leg2"


net install drdid, from(https://${sscmirror}fmwww.bc.edu/repec/bocode/d) replace
net install csdid, from(https://${sscmirror}fmwww.bc.edu/repec/bocode/c) replace
net install honestdid, from(https://${sscmirror}fmwww.bc.edu/repec/bocode/h) replace

* Result export and manipulation
net install regsave, from(https://${sscmirror}fmwww.bc.edu/repec/bocode/r) replace
net install estout, from(https://${sscmirror}fmwww.bc.edu/repec/bocode/e) replace

* Graphing utilities
net install coefplot, from(https://${sscmirror}fmwww.bc.edu/repec/bocode/c) replace
net install grc1leg2, from(https://${sscmirror}fmwww.bc.edu/repec/bocode/g) replace

/*Replication analysis in Stata	*/
do "scripts/Stata/0_stata_Make_data.do"
do "scripts/Stata/1_stata_adoption_table.do"
do "scripts/Stata/2_stata_2x2.do"
do "scripts/Stata/3_stata_2xT.do"
do "scripts/Stata/4_stata_GxT.do"
do "scripts/Stata/5_stata_honestdid.do"










