# <span class="s1">**Data and Code for "Difference-in-Differences Designs: A Practitioner’s Guide", Journal of Economic Literature**</span>

## <span class="s1">**Authors**</span>

<span class="s1">Andrew Baker, Brantly Callaway, Scott Cunningham,
Andrew Goodman-Bacon, and Pedro H. C. Sant’Anna</span>



## <span class="s1">**Abstract**</span>

<span class="s1">**Abstract from the paper:** Difference-in-differences
(DiD) is arguably the most popular quasi-experimental research design.
Its canonical form, with two groups and two periods, is well-understood.
However, empirical practices can be ad hoc when researchers go beyond
that simple case. This article provides an organizing framework for
discussing different types of DiD designs and their associated DiD
estimators. It discusses covariates, weights, handling multiple periods,
and staggered treatments. The organizational framework, however, applies
to other extensions of DiD methods as well.</span>

<span class="s1">**Replication Instructions**</span>

<span class="s1">**Overview:** To replicate the analysis and results,
users have two options: (1) use R, or (2) use Stata. Both approaches
will ultimately produce the same figures and tables. The simplest
approach is to use one environment throughout, but advanced users could
mix (for example, use R to rebuild data and Stata for analysis). We
outline both methods below. In all cases, start by unpacking the
replication archive and setting the working directory to the top-level
folder containing this README.</span>

<span class="s1">**Option 1: Replication using R**</span>

1.  <span class="s2"></span><span class="s1">Install R (version 4.x). It
    will also be convenient to use
    RStudio.<span class="Apple-converted-space"> </span></span>
2.  <span class="s2"></span><span class="s1">Open the provided
    </span><span class="s3">DiD_JEL.Rproj</span><span class="s1">
    RStudio project, which will set your working directory to the
    replication package folder. Alternatively, set your R working
    directory manually to the folder containing the
    </span><span class="s3">scripts/</span><span class="s1"> and
    </span><span class="s3">data/</span><span class="s1">
    directories.</span>
3.  <span class="s2"></span><span class="s1">Open
    </span><span class="s3">scripts/R/00_master_did_jel.R
    </span><span class="s1">in R (or RStudio) and run it. This master
    script will:</span>
    - <span class="s2"></span><span class="s1">Load required libraries.
      We use renv to create a fully reproducible package. In the master
      code it will call renv::restore() which will download and install
      the packages from the renv.lock file into the local
      environment.<span class="Apple-converted-space"> </span></span>
    - <span class="s2"></span><span class="s1">Execute the code
      </span><span class="s3">0_make_data.R</span><span class="s1">,
      which will read in the raw data and produce the combined dataset
      </span><span class="s3">county_mortality_data.csv</span><span class="s1">.
      (This step will also attempt to fetch data from the Census API for
      poverty and income – an internet connection is required for that
      step. If offline, the script will use the included final data from
      the archive, which already contains those variables. You can do
      this by commenting out the code from the master file (line 16 of
      </span><span class="s3">scripts/R/00_master_did_jel.R</span><span class="s1">)</span>
    - <span class="s2"></span><span class="s1">Execute the analysis
      scripts
      </span><span class="s3">1_Adoption_Table.R</span><span class="s1">
      through </span><span class="s3">4_GxT.R</span><span class="s1"> in
      sequence. These will perform all calculations and generate
      intermediate results, figures, and tables. As they run, you will
      see output in the R console and figures may briefly
      display.</span>
    - <span class="s2"></span><span class="s1">Execute
      </span><span class="s3">5_honestdid.R</span><span class="s1"> to
      run the sensitivity analysis and produce any additional outputs
      (e.g., adjusted estimates or plots for the appendix).</span>
4.  <span class="s2"></span><span class="s1">Once
    </span><span class="s3">00_master_did_jel.R</span><span class="s1">
    completes, check the
    </span><span class="s3">figures/</span><span class="s1"> and
    </span><span class="s3">tables/</span><span class="s1"> directories.
    They should now contain the replication results. You can open the
    PDF figures to compare with the paper’s figures, and open any table
    files (or the console output in R) to compare with the published
    tables. All numbers and graphs should match the article and its
    appendix.</span>

<span class="s1">*Note:* The R code is written to use relative paths via
the </span><span class="s3">here</span><span class="s1"> package, so as
long as the working directory is correctly set (by opening the RProj or
using </span><span class="s3">setwd</span><span class="s1"> to the
project root), no manual path edits are required. The entire R pipeline
should run automatically. Total runtime in R is expected to be around 10
minutes (depending on your system).</span>

<span class="s1">**Option 2: Replication using Stata**</span>

1.  <span class="s2"></span><span class="s1">Install Stata (version 15
    or higher recommended; the do-files were tested on Stata 17). Ensure
    you have an internet connection for the first run so that Stata can
    install any needed user-written commands.</span>
2.  <span class="s2"></span><span class="s1">Start Stata and change the
    working directory to the replication package folder. For example, in
    Stata’s command window, type:  
    </span><span class="s3">cd
    "C:\path\to\Difference-in-Differences-replication"</span>
3.  <span class="s2"></span><span class="s1">Open the file
    </span><span class="s3">scripts/Stata/00_stata_master_did_jel.do</span><span class="s1">
    in Stata’s do-file editor. Edit the line near the top that defines
    the global </span><span class="s3">root</span><span class="s1">
    directory: </span><span class="s3">global rootdir "your pathname
    here"  
    </span><span class="s1">Replace </span><span class="s3">"your
    pathname here"</span><span class="s1"> with the full path to the
    replication folder on your system (the folder containing the
    </span><span class="s3">data</span><span class="s1">,
    </span><span class="s3">scripts</span><span class="s1">, etc.). Save
    the changes.</span>
4.  <span class="s2"></span><span class="s1">In Stata, run the master
    do-file. You can do this by clicking “Do” in the editor or by typing
    </span><span class="s3">do
    scripts/Stata/00_stata_master_did_jel.do</span><span class="s1"> in
    the Stata command prompt. The master script will then:</span>
    - <span class="s2"></span><span class="s1">Install any missing Stata
      packages from SSC (you will see Stata connecting to net sites to
      install commands like
      </span><span class="s3">csdid</span><span class="s1">,
      </span><span class="s3">drdid</span><span class="s1">, etc.). This
      happens only once; subsequent runs will skip installations if the
      packages are already present.</span>
    - <span class="s2"></span><span class="s1">Execute
      </span><span class="s3">0_stata_Make_data.do</span><span class="s1">,
      which will load the provided
      </span><span class="s3">data/county_mortality_data.csv</span><span class="s1">
      and set up the analysis dataset in memory.</span>
    - <span class="s2"></span><span class="s1">Execute the analysis
      scripts 1 through 5 in order. You will see output in the Stata
      Results window: for example, the adoption table being printed,
      regression results, and graph generation. The do-files will save
      graphs to </span><span class="s3">figures/</span><span class="s1">
      (as PDF files) and tables to
      </span><span class="s3">tables/</span><span class="s1"> as they
      go.</span>
5.  <span class="s2"></span><span class="s1">When the master script
    finishes, verify the outputs against the paper’s tables and figures
    for confirmation.</span>
6.  <span class="s2"></span><span class="s1">Check the
    </span><span class="s3">figures/</span><span class="s1"> folder for
    newly created figure PDFs. Open them to ensure they correspond to
    the figures in the paper (titles, axes, and plotted values should
    match). For example, you should find figures illustrating the
    mortality trends for expansion vs. non-expansion states, event-study
    plots for multiple years, etc., as described in the paper.</span>
7.  <span class="s2"></span><span class="s1">Check the
    </span><span class="s3">tables/</span><span class="s1"> folder for
    any output tables. If LaTeX tables were saved (e.g.,
    </span><span class="s3">.tex</span><span class="s1"> files), you can
    compile them or open them in a text editor to verify the numbers
    align with the published tables.</span>

<span class="s1">*Troubleshooting:* If Stata stops with an error, read
the error message and refer to the corresponding do-file. Common issues
might include not having write permission in the directory (ensure that
Stata can create files in
</span><span class="s3">figures/</span><span class="s1"> and
</span><span class="s3">tables/</span><span class="s1">) or package
installation problems (if a network issue prevented downloading a
package, try installing it manually via </span><span class="s3">ssc
install \[pkg\]</span><span class="s1"> and re-run). Make sure the
</span><span class="s3">\$rootdir</span><span class="s1"> path was set
correctly; if it’s incorrect, Stata will not find the data or scripts.
If replication still fails, one can fall back to using R, as the R code
might be more self-contained for data assembly.</span>

<span class="s1">**Results Verification:** Both approaches should yield
the same substantive results. Differences will be due either to the use
of bootstrap standard errors or cosmetic details of software graphing
functionality (ie. histograms), but these should be small. The figures
and tables generated by the R code can be directly compared to the
figures and tables in the published article’s main text and
appendix.</span>

## <span class="s1">**Data Availability**</span>

<span class="s1">This replication package includes all data used in the
study. All datasets are from public sources and are provided in the
</span><span class="s3">data/</span><span class="s1"> directory of the
archive. The authors certify that they have legitimate access to these
data and permission to use them, and that they have the rights to
redistribute the included data for replication purposes. Details on each
data source are provided below. (All data are publicly available, so no
special access or confidentiality restrictions apply.)</span>

### <span class="s1">**Data Sources and Provenance**</span>

- <span class="s2"></span><span class="s1">**CDC Mortality and
  Population Data:** County-level mortality counts and population
  figures for various subgroups were obtained from publicly available
  CDC sources. Files in
  </span><span class="s3">data/cdc/</span><span class="s1"> include
  </span><span class="s3">mortality.csv</span><span class="s1"> (total
  deaths of adults 20-64 by county-year) and population files broken
  down by demographic groups
  (</span><span class="s3">female_pop.csv</span><span class="s1">,
  </span><span class="s3">white_pop.csv</span><span class="s1">,
  </span><span class="s3">hispanic_pop.csv</span><span class="s1">,
  etc.). These data were originally sourced from the CDC WONDER database
  and are in the public domain.<span class="Apple-converted-space"> 
  </span>Source =
  https://wonder.cdc.gov/deaths-by-underlying-cause.html.<span class="Apple-converted-space"> </span></span>
- <span class="s2"></span><span class="s1">**BLS Unemployment Data:**
  County-level unemployment rates and labor force data for years
  2009–2019 were obtained from the U.S. Bureau of Labor Statistics Local
  Area Unemployment Statistics (LAU). The files
  </span><span class="s3">laucnty09.xlsx</span><span class="s1"> through
  </span><span class="s3">laucnty19.xlsx</span><span class="s1">
  (located in </span><span class="s3">data/bls/</span><span class="s1">)
  contain annual county unemployment statistics for each year 2009–2019.
  These Excel files are directly from BLS (publicly available government
  data). Source = https://www.bls.gov/lau/tables.htm.</span>
- <span class="s2"></span><span class="s1">**Medicaid Expansion
  Status:** The file
  </span><span class="s3">expansion_status.csv</span><span class="s1">
  in </span><span class="s3">data/kff/</span><span class="s1"> was
  compiled from the Kaiser Family Foundation’s data on state Medicaid
  expansion decisions under the Affordable Care Act. It lists each U.S.
  state’s expansion status and the year of expansion (if applicable).
  This information is publicly available through KFF and included here
  for convenience. Source =
  https://www.kff.org/status-of-state-medicaid-expansion-decisions/.</span>
- <span class="s2"></span><span class="s1">**Socioeconomic Covariates:**
  County-level poverty rates and median household incomes for the
  relevant years were retrieved from the U.S. Census Bureau (American
  Community Survey). These variables are incorporated into the final
  dataset. The replication code uses the Census API to obtain these
  measures; however, the final compiled dataset (described below)
  already contains these variables for each county-year. Source =
  https://www2.census.gov/programs-surveys/saipe/datasets/</span>

<span class="s1"></span>  

### <span class="s1">**Compiled Analysis Dataset**</span>

<span class="s1">The above sources were merged to create a single
analysis dataset of county-level observations used in the paper’s
empirical analysis. This compiled dataset is provided in two formats for
convenience:</span>

- <span class="s4"></span><span class="s3">data/county_mortality_data.csv</span><span class="s1">
  – a CSV file containing the merged panel dataset of 3,143 U.S.
  counties over multiple years (2010–2019). It includes variables such
  as county identifiers, year, adult mortality counts, population (ages
  20–64), mortality rates, demographic population shares, unemployment
  rate, poverty rate, median income, and an indicator of Medicaid
  expansion status with the year of expansion.</span>
- <span class="s4"></span><span class="s3">data/did_jel_aca_replication_data.dta</span><span class="s1">
  – the same merged dataset in Stata
  </span><span class="s3">.dta</span><span class="s1"> format. This is
  provided for users replicating with Stata, to avoid any import issues.
  It contains the identical information as the CSV file above. (Note: In
  the scripts, the CSV version is used as input for the data
  construction step, and this Stata file is provided as a ready-to-use
  copy of the final data.)</span>

<span class="s1">*Rights and Licenses:* All data in this package are
publicly available and either in the public domain or provided under
terms that allow redistribution for research purposes. The authors have
verified that including these data in the replication archive does not
violate any usage agreements. If users reuse the data, please cite the
original data sources (e.g., CDC, BLS, KFF) as appropriate. No sensitive
or restricted data are used in this study.</span>

## <span class="s1">**Software and Computational Requirements**</span>

<span class="s1">**Supported Platforms:** The replication materials can
be run on any modern Windows, macOS, or Linux system. The code and data
are not platform-dependent. The analysis was originally run on a 64-bit
machine with 64 GB RAM and an Intel Xeon 1.8GHz processor, but such high
specifications are not strictly required. A typical desktop or laptop
(e.g., 8–16 GB RAM, multi-core CPU) should be sufficient to reproduce
the results, though runtime may vary.</span>

<span class="s1">**Software Required:** Two software environments are
provided for replication:</span>

- <span class="s2"></span><span class="s1">**Stata:** The Stata
  replication code was tested on Stata 16 and 17. It should run on Stata
  15 or higher, as it uses standard commands and user-written packages
  compatible with these versions. Stata is required if using the
  </span><span class="s3">.do</span><span class="s1"> files for
  replication.</span>
- <span class="s2"></span><span class="s1">**R:** The analysis can also
  be replicated in R (version 4.1 or higher recommended). An R Project
  file (</span><span class="s3">DiD_JEL.Rproj</span><span class="s1">)
  is included to facilitate using RStudio. The R scripts rely on several
  R packages (listed below).</span>

<span class="s1">**R Packages Needed:** To replicate in R, the following
R packages (with the versions used in the original replication) are
required:</span>

- <span class="s4"></span><span class="s3">tidyverse</span><span class="s1">
  (data manipulation and plotting; v2.0.0)</span>
- <span class="s4"></span><span class="s3">readxl</span><span class="s1">
  (reading Excel files; v1.4.5)</span>
- <span class="s4"></span><span class="s3">here</span><span class="s1">
  (for file paths, v1.0.2)</span>
- <span class="s4"></span><span class="s3">kableExtra</span><span class="s1">
  and </span><span class="s3">modelsummary</span><span class="s1"> (for
  formatting tables; v1.4.0 and v2.5.0)</span>
- <span class="s4"></span><span class="s3">did</span><span class="s1">
  (Difference-in-Differences estimation package by Callaway & Sant’Anna,
  v2.3.0)</span>
- <span class="s4"></span><span class="s3">HonestDiD</span><span class="s1">
  (for robustness checks, v0.2.6)</span>
- <span class="s4"></span><span class="s3">fixest</span><span class="s1">
  (for fixed effects regressions, v0.13.2)</span>
- <span class="s4"></span><span class="s3">ggthemes</span><span class="s1">
  and </span><span class="s3">patchwork</span><span class="s1"> (for
  plotting themes and combining plots, v5.2.0 and v.1.3.2)</span>

<span class="s1">All these packages are available on CRAN or
GitHub.<span class="Apple-converted-space"> </span></span>

<span class="s1">**Stata User-Written Packages:** The Stata do-files
will automatically attempt to install required user-contributed commands
(from SSC) if they are not already present. Specifically, the master
do-file uses:</span>

- <span class="s4"></span><span class="s3">csdid</span><span class="s1">
  (Callaway and Sant’Anna’s staggered DID estimation command,
  v.1.81)</span>
- <span class="s4"></span><span class="s3">drdid</span><span class="s1">
  (Doubly-Robust DID commands by Sant’Anna et al., v1.91)</span>
- <span class="s4"></span><span class="s3">honestdid</span><span class="s1">
  (Honest DiD sensitivity analysis, by Rambachan & Roth, wrapped for
  Stata)</span>
- <span class="s4"></span><span class="s3">regsave</span><span class="s1">
  and </span><span class="s3">estout</span><span class="s1"> (for saving
  regression results and outputting tables)</span>
- <span class="s4"></span><span class="s3">coefplot</span><span class="s1">
  and </span><span class="s3">grc1leg2</span><span class="s1"> (for
  plotting coefficients and combining graphs)</span>

<span class="s1">An active internet connection in Stata is required to
install these on the fly. If internet access is not available, the user
should install these packages beforehand or uncomment any provided
alternative steps. Once installed, the do-files will run offline. No
other proprietary tools are needed beyond Stata itself.</span>

<span class="s1">**Memory and Runtime:** The full replication (all
analyses and generating all figures and tables) completes in
approximately 10–15 minutes on a modern computer. Peak memory usage is
moderate; a machine with at least 4 GB of free RAM is recommended. Most
of the runtime is spent running estimations. There is no significant
randomness in the code (any random number generation for, e.g.,
bootstrap confidence intervals uses set seeds), so results should be
exactly reproducible across runs and platforms.</span>

## <span class="s1">**Structure of the Archive**</span>

<span class="s1">The replication package is organized into the following
files and folders:</span>

<span class="s4"></span><span class="s3">README.html</span><span class="s1">
– *(this document)* A detailed guide to the replication package,
including how to run the code and information on data and
software.</span>

<span class="s4"></span><span class="s3">LICENSE</span><span class="s1">
– License file for the code (MIT License). This covers the authors’ code
in the repository. (Data sources are public domain or similarly open;
see Data Availability above.)</span>

<span class="s4"></span><span class="s3">DiD_JEL.Rproj</span><span class="s1">
– R Project file for easy use with RStudio. Opening this project will
set the working directory to the replication package root, which helps
the R scripts find the data and output folders automatically.</span>

<span class="s2"></span><span class="s1">**Data Directory –**
</span><span class="s3">**data/**</span><span class="s1">: Contains all
datasets used or produced (poverty and median income read directly from
census.gov in /scripts/R/0_data_processing.R)</span>

<span class="s4"></span><span class="s3">data/bls/</span><span class="s1">
– raw unemployment data from BLS. Files
</span><span class="s3">laucnty09.xlsx</span><span class="s1"> ...
</span><span class="s3">laucnty19.xlsx</span><span class="s1"> are
yearly spreadsheets of county unemployment and labor force data (for
years 2009 through 2019 respectively).</span>

<span class="s4"></span><span class="s3">data/cdc/</span><span class="s1">
– raw mortality and population data from CDC sources. This includes
</span><span class="s3">mortality.csv</span><span class="s1">
(county-level deaths of age 20–64, by year), and population breakdowns
by demographic group:
</span><span class="s3">female_pop.csv</span><span class="s1">,
</span><span class="s3">white_pop.csv</span><span class="s1">,
</span><span class="s3">hispanic_pop.csv</span><span class="s1">,
</span><span class="s3">total_pop.csv</span><span class="s1"> (total
population aged 20–64). These were used to compute mortality rates and
demographic shares.</span>

<span class="s4"></span><span class="s3">data/kff/</span><span class="s1">
– contains
</span><span class="s3">expansion_status.csv</span><span class="s1">,
which lists each state’s Medicaid expansion status and year. Used to
assign treatment (expansion) timing to each state’s counties.</span>

<span class="s4"></span><span class="s3">data/county_mortality_data.csv</span><span class="s1">
– the merged analysis dataset (in CSV format) combining all of the above
sources plus additional covariates (poverty rate, median income). Each
row is a county-year observation. This is the main input data for
analysis scripts.</span>

<span class="s4"></span><span class="s3">data/did_jel_aca_replication_data.dta</span><span class="s1">
– the same merged dataset in Stata format. Provided for convenience to
Stata users (so they do not need to manually import the CSV). The Stata
code uses the CSV, but this file can be opened directly in Stata to
inspect the data.</span>

<span class="s4"></span><span class="s1"> The following files are
included in the archive under `data/`.</span>

| File name | Directory | Provided in archive? | Source | Notes |
|----|----|----|----|----|
| laucnty09.xlsx | data/bls | Yes | BLS LAU county unemployment (laucnty##.xlsx) | Original download; public data |
| laucnty10.xlsx | data/bls | Yes | BLS LAU county unemployment (laucnty##.xlsx) | Original download; public data |
| laucnty11.xlsx | data/bls | Yes | BLS LAU county unemployment (laucnty##.xlsx) | Original download; public data |
| laucnty12.xlsx | data/bls | Yes | BLS LAU county unemployment (laucnty##.xlsx) | Original download; public data |
| laucnty13.xlsx | data/bls | Yes | BLS LAU county unemployment (laucnty##.xlsx) | Original download; public data |
| laucnty14.xlsx | data/bls | Yes | BLS LAU county unemployment (laucnty##.xlsx) | Original download; public data |
| laucnty15.xlsx | data/bls | Yes | BLS LAU county unemployment (laucnty##.xlsx) | Original download; public data |
| laucnty16.xlsx | data/bls | Yes | BLS LAU county unemployment (laucnty##.xlsx) | Original download; public data |
| laucnty17.xlsx | data/bls | Yes | BLS LAU county unemployment (laucnty##.xlsx) | Original download; public data |
| laucnty18.xlsx | data/bls | Yes | BLS LAU county unemployment (laucnty##.xlsx) | Original download; public data |
| laucnty19.xlsx | data/bls | Yes | BLS LAU county unemployment (laucnty##.xlsx) | Original download; public data |
| female_pop.csv | data/cdc | Yes | CDC WONDER / Bridged-race population | Original download; public data |
| hispanic_pop.csv | data/cdc | Yes | CDC WONDER / Bridged-race population | Original download; public data |
| white_pop.csv | data/cdc | Yes | CDC WONDER / Bridged-race population | Original download; public data |
| total_pop.csv | data/cdc | Yes | CDC WONDER / Population totals | Original download; public data |
| mortality.csv | data/cdc | Yes | CDC WONDER / Mortality | Original download; public data |
| poverty and median income | N/A | No | Census/ SAIPE | read from census.gov in 0_data_processing.R |
| expansion_status.csv | data/kff | Yes | KFF Medicaid Expansion Status | Original download; public data |
| county_mortality_data.csv | data | Yes | Constructed dataset | Built by scripts from CDC+BLS+KFF |
| did_jel_aca_replication_data.dta | data | Yes | Constructed dataset (Stata) | Analysis-ready panel |

<span class="s2"></span><span class="s1">**Scripts Directory –**
</span><span class="s3">**scripts/**</span><span class="s1">: Contains
all code to reproduce the results. Two subfolders are provided for the
two software options:</span>

- <span class="s4"></span><span class="s3">scripts/R/</span><span class="s1">
  – R scripts for replication. These are numbered in the order they
  should be run:</span>
  - <span class="s4"></span><span class="s3">0_make_data.R</span><span class="s1">
    – Reads the raw data (BLS, CDC, KFF) and constructs the merged
    dataset. It also retrieves the Census poverty and income data via
    API and adds those. The final combined dataset is written to
    </span><span class="s3">data/county_mortality_data.csv</span><span class="s1">.</span>
  - <span class="s4"></span><span class="s3">1_Adoption_Table\>R</span><span class="s1">
    – Produces a summary table of Medicaid expansion adoption timing
    (e.g., how many states or counties expanded in 2014, 2015, etc.,
    versus not at all). This corresponds to a descriptive table in the
    paper.</span>
  - <span class="s4"></span><span class="s3">2_2x2.R</span><span class="s1">
    – Performs the basic 2x2 Difference-in-Differences analysis (two
    groups, two periods) using the example of Medicaid expansion vs.
    non-expansion pre- vs. post-2014. It generates results for the
    simplest DiD scenario.</span>
  - <span class="s4"></span><span class="s3">3_2XT.R</span><span class="s1">
    – Extends the analysis to a 2 x T setting (two groups, multiple
    periods). This script examines multiple periods of data (pre- and
    post-treatment) for treated vs. control groups, producing dynamic
    event-study style figures.</span>
  - <span class="s4"></span><span class="s3">4_GxT.R</span><span class="s1">
    – Generalizes to a G x T setting (multiple groups with staggered
    treatment timing across T periods). This script uses methods
    appropriate for staggered adoption (multiple treatment groups
    entering at different times) and produces the corresponding results
    (aggregate treatment effect estimates and/or figures). It leverages
    the “building block” approach described in the paper to compute
    aggregate effects from 2x2 comparisons.</span>
  - <span class="s4"></span><span class="s3">5_honestdid.R</span><span class="s1">
    – Conducts robustness and sensitivity checks, specifically the
    “Honest DiD” bias-adjustment and sensitivity analysis (following the
    approach of Rambachan and Roth). Computes how sensitive the results
    are to deviations from the parallel trends assumption and may output
    results or plots for an appendix.</span>
  - <span class="s4"></span><span class="s3">00_master_did_jel.R</span><span class="s1">
    – A master R script that sequentially runs all the above R scripts
    in the correct order. Running this one file will execute the entire
    analysis pipeline from data construction to final output. (Note:
    Before running, ensure the required R packages are installed as
    described above.)</span>
- <span class="s4"></span><span class="s3">scripts/Stata/</span><span class="s1">
  – Stata do-files for replication. The key files are:</span>
  - <span class="s4"></span><span class="s3">00_stata_master_did_jel.do</span><span class="s1">
    – Master do-file that sets up the environment and runs all analysis
    do-files. \*\*Important:\*\* This file contains a line to define the
    global path
    </span><span class="s3">\$rootdir</span><span class="s1">. The user
    should edit this line to point to the folder where the replication
    files are located on their system (or alternatively, launch Stata in
    that directory and define </span><span class="s3">global
    rootdir</span><span class="s1"> accordingly). Once the path is set,
    running this master script will call all other scripts in order. It
    also installs any needed Stata packages (via SSC) at the beginning.
    The master script estimates that the full run takes about 11 minutes
    on a high-end machine (as noted in comments).</span>
  - <span class="s4"></span><span class="s3">0_stata_Make_data.do</span><span class="s1">
    – Constructs the merged dataset for analysis (similar to the R
    script 0_data_processing.R). It reads in the
    </span><span class="s3">county_mortality_data.csv</span><span class="s1">
    provided in the data folder (which contains all needed variables)
    and performs any additional cleaning or variable transformations in
    Stata. The output is kept in memory for use by subsequent do-files
    (and could be saved as a Stata data file if needed).</span>
  - <span class="s4"></span><span class="s3">1_stata_adoption_table.do</span><span class="s1">
    – Replicates the generation of the adoption summary table using
    Stata. It produces counts of states/counties by expansion status and
    year, matching the results from the R script for Table 1 (Medicaid
    expansion timing breakdown).</span>
  - <span class="s4"></span><span class="s3">2_stata_2x2.do</span><span class="s1">
    – Runs the 2x2 DiD analysis in Stata, analogous to the R script.
    Computes the difference-in-differences estimate for the two-period,
    two-group case and stores or displays the results.</span>
  - <span class="s4"></span><span class="s3">3_stata_2xT.do</span><span class="s1">
    – Runs the multiple-period (event study) analysis in Stata,
    computing period-by-period treatment effects or dynamic effects for
    the treated vs. control comparison, and aggregates them if needed.
    Results should match those from the R version.</span>
  - <span class="s4"></span><span class="s3">4_stata_GxT.do</span><span class="s1">
    – Runs the staggered adoption (multiple group, multiple period)
    analysis in Stata. This uses the provided user-written commands
    (like </span><span class="s3">csdid</span><span class="s1"> or
    </span><span class="s3">drdid</span><span class="s1">) to estimate
    the proper aggregations of 2x2 comparisons across groups and time,
    reproducing the main empirical results in the paper.</span>
  - <span class="s4"></span><span class="s3">5_stata_honestdid.do</span><span class="s1">
    – Performs the Honest DiD sensitivity analysis in Stata, paralleling
    the R script. Uses the
    </span><span class="s3">honestdid</span><span class="s1"> package to
    calculate how robust the findings are to potential violations of the
    parallel trends assumption, and outputs the results (e.g.,
    bias-adjusted estimates or confidence intervals).</span>

<span class="s2"></span><span class="s1">**Output Directories –**
</span><span class="s3">**figures/**</span><span class="s1"> **and**
</span><span class="s3">**tables/**</span><span class="s1">: These
folders are placeholders for the results generated by the code.</span>

- <span class="s4"></span><span class="s3">figures/</span><span class="s1">
  – After running the replication scripts, this will contain the figures
  (graphs) produced by the analysis, in PDF or PNG format. Each figure
  corresponds to one in the paper or appendix (e.g., event-study plots
  of mortality rates, etc.). The R scripts use
  </span><span class="s3">ggsave()</span><span class="s1"> to save
  figures here, and the Stata scripts also output graphs (using
  </span><span class="s3">graph export</span><span class="s1">) to this
  folder with similar names.</span>
- <span class="s4"></span><span class="s3">tables/</span><span class="s1">
  – This will contain output tables (as LaTeX
  </span><span class="s3">.tex</span><span class="s1"> files, CSVs, or
  text) generated by the code, such as regression result tables or
  summary statistics tables. For example, the adoption summary table and
  regression tables are saved here. These files can be opened or
  compiled (if LaTeX) to verify that they match the tables in the
  published paper.</span>

<span class="s2"></span><span class="s1">*Note:* Initially,
</span><span class="s3">figures/</span><span class="s1"> and
</span><span class="s3">tables/</span><span class="s1"> are empty. They
will be populated when the code is run. The names and formats of outputs
are chosen to correspond with those referenced in the paper (for
instance, </span><span class="s3">adoptions.tex</span><span class="s1">
or </span><span class="s3">Figure3.pdf</span><span class="s1">,
etc.).<span class="Apple-converted-space"> </span></span>

<span class="s5"></span><span class="s6">**List of Programs and their
Outputs  **
</span><span class="s1">Each exhibit below lists the output file and the
script (with the line where it is written/exported).  
  
**R outputs**</span>

| Type   | Output file (relative path) | Generated by script          | Line no. |
|--------|-----------------------------|------------------------------|----------|
| Table  | tables/table1_R.tex         | scripts/R/1_Adoption_Table.R | 86       |
| Table  | tables/table2_R.tex         | scripts/R/2_2x2.R            | 173      |
| Table  | tables/table3_R.tex         | scripts/R/2_2x2.R            | 208      |
| Table  | tables/table4_R.tex         | scripts/R/2_2x2.R            | 426      |
| Table  | tables/table5_R.tex         | scripts/R/2_2x2.R            | 466      |
| Table  | tables/table6_R.tex         | scripts/R/2_2x2.R            | 514      |
| Table  | tables/table7_R.tex         | scripts/R/2_2x2.R            | 638      |
| Figure | figures/figure1_R.pdf       | scripts/R/2_2x2.R            | 673      |
| Figure | figures/figure2_R.pdf       | scripts/R/3_2XT.R            | 105      |
| Figure | figures/figure3_R.pdf       | scripts/R/3_2XT.R            | 199      |
| Figure | figures/figure4_R.pdf       | scripts/R/3_2XT.R            | 259      |
| Figure | figures/figure5_R.pdf       | scripts/R/4_GxT.R            | 100      |
| Figure | figures/figure6_R.pdf       | scripts/R/4_GxT.R            | 148      |
| Figure | figures/figure7_R.pdf       | scripts/R/4_GxT.R            | 173      |
| Figure | figures/figure8_R.pdf       | scripts/R/4_GxT.R            | 218      |
| Figure | figures/figure9_R.pdf       | scripts/R/4_GxT.R            | 280      |

  
**Stata outputs**

| Type | Output file (relative path) | Generated by script | Line no. |
|----|----|----|----|
| Table | tables/table1_stata.tex | scripts/Stata/1_stata_adoption_table.do | 146 |
| Table | tables/table2_stata.tex | scripts/Stata/2_stata_2x2.do | 93 |
| Table | tables/table3_stata.tex | scripts/Stata/2_stata_2x2.do | 212 |
| Table | tables/table4_stata.tex | scripts/Stata/2_stata_2x2.do | 477 |
| Table | tables/table5_stata.tex | scripts/Stata/2_stata_2x2.do | 614 |
| Table | tables/table6_stata.tex | scripts/Stata/2_stata_2x2.do | 688 |
| Table | tables/table7_stata.tex | scripts/Stata/2_stata_2x2.do | 805 |
| Figure | figures/figure1_stata.pdf | scripts/Stata/2_stata_2x2.do | 930 |
| Figure | figures/figure2_stata.pdf | scripts/Stata/3_stata_2xT.do | 57 |
| Figure | figures/figure3_stata.pdf | scripts/Stata/3_stata_2xT.do | 152 |
| Figure | figures/figure4_stata.pdf | scripts/Stata/3_stata_2xT.do | 277 |
| Figure | figures/figure5_stata.pdf | scripts/Stata/4_stata_GxT.do | 63 |
| Figure | figures/figure6_stata.pdf | scripts/Stata/4_stata_GxT.do | 194 |
| Figure | figures/figure7_stata.pdf | scripts/Stata/4_stata_GxT.do | 223 |
| Figure | figures/figure8_stata.pdf | scripts/Stata/4_stata_GxT.do | 320 |
| Figure | figures/figure9_stata.pdf | scripts/Stata/4_stata_GxT.do | 423 |

<span class="s2"></span><span class="s1">**Markdown Documentation –**
</span><span class="s3">**markdown/**</span><span class="s1">: This
folder contains supplementary documentation in Quarto/Markdown format
(and rendered HTML) for the code appendix:</span>

- <span class="s4"></span><span class="s3">markdown/Code_Appendix.qmd</span><span class="s1">
  and </span><span class="s3">Code_Appendix.html</span><span class="s1">
  – An appendix documenting the R and Stata code.</span>

<span class="s2"></span><span class="s1">These markdown files serve as a
readable “code appendix” and do not need to be executed by
replicators.</span>

<span class="s4"></span><span class="s3">.gitignore</span><span class="s1">
and </span><span class="s3">.DS_Store</span><span class="s1"> – Standard
housekeeping files (the former for git version control, the latter are
incidental Mac system files). They have no bearing on replication and
can be ignored.</span>

<span class="s8"></span><span class="s9">**Licenses and Permissions**  
</span><span class="s1">**Code License:** The authors have released the
code in this replication package under the MIT License (see the
</span><span class="s3">LICENSE</span><span class="s1"> file for full
terms). This means that users are free to use, modify, and distribute
the code, provided proper attribution is given. In short, the code is
open-source. If you reuse substantial portions of the code, please cite
the paper and give credit to the authors.  
**Data Usage:** All data included are from public sources as noted.
Government datasets (CDC, BLS, Census) are in the public domain and free
to use. The Kaiser Family Foundation data on expansion status is
publicly reported information. By including these files, we are
redistributing them for replication purposes. To the best of our
knowledge, this redistribution is allowed. Users should also cite the
original data sources in any new work. No proprietary or confidential
data are included, so no additional data licenses are required.  
**Authorizations:** We reaffirm that we have permission to share all
materials in this archive. If there are any questions about data
permissions or if any data provider has concerns, please contact the
authors (see the email above) or the AEA Data Editor’s office.  
</span><span class="s9">**Acknowledgments**  
</span><span class="s1">We thank the American Economic Association Data
Editor and staff for their guidance on preparing this replication
package. We also thank the providers of the public data used in this
study – specifically the CDC, BLS, Census Bureau, and Kaiser Family
Foundation – for making their data readily accessible. Their efforts in
data collection and dissemination made this research possible.  
The authors are grateful to colleagues and seminar participants who
provided feedback on earlier versions of the paper and its companion
code. Additionally, we acknowledge the contributors of the open-source
software and packages utilized (including R and Stata communities, and
the developers of the
</span><span class="s3">did</span><span class="s1">,
</span><span class="s3">csdid</span><span class="s1">, and related
packages). Their tools greatly facilitated our analysis.  
Any errors in the replication code or documentation are the sole
responsibility of the authors. Please report any issues or questions
about the replication package to the contact email provided, and we will
be happy to assist.</span>
