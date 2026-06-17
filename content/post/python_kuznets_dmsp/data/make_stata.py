#!/usr/bin/env python3
"""Build documented Stata datasets from the bundled CSVs.

Single source of truth for three artefacts, all generated from the COLUMNS / FILES
metadata below plus statistics computed live from the CSVs:

  1. <Base>.dta            one per CSV, same base name, Stata .dta v118 (Stata 14+),
                           carrying a dataset label, per-variable labels, and value
                           labels for every 0/1 dummy.
  2. README.md             a comprehensive human codebook (supersedes the post's
                           Appendix A): provenance, sources, usage snippets, a
                           cross-file variable index, construction formulas, a
                           per-dataset dictionary + computed-statistics table, and
                           a caveats section.
  3. stata_codebook.do     run once in Stata (`do stata_codebook.do`) to attach the
                           long-form `note _dta:` / `note <var>:` documentation to
                           each .dta and re-save (pyreadstat cannot write notes).

Usage:  python make_stata.py        (needs pandas + pyreadstat in the environment)

Definitions follow Lessmann & Seidel (2017) and the post's Appendix A data dictionary
(content/post/python_kuznets_dmsp/index.md). Re-run after any change to keep the .dta
labels, the README, and the .do notes perfectly in sync.
"""

import html
import math
import os
import re
import zipfile

import pandas as pd
import pyreadstat

BASE = os.path.dirname(os.path.abspath(__file__))

# pyreadstat version=14 -> .dta format release 118 (UTF-8, Stata 14 and newer).
STATA_VERSION = 14
DTA_FORMAT = 118

# GitHub locations so the README snippets / link tables load straight from the repo.
GH_REPO, GH_BRANCH = "cmg777/starter-academic-v501", "master"
GH_PATH = "content/post/python_kuznets_dmsp/data"
RAW_BASE = f"https://raw.githubusercontent.com/{GH_REPO}/{GH_BRANCH}/{GH_PATH}/"
BLOB_BASE = f"https://github.com/{GH_REPO}/blob/{GH_BRANCH}/{GH_PATH}/"

# On-site locations for the self-contained HTML data-dictionary page (no GitHub exposure).
SITE_POST = "https://carlos-mendez.org/post/python_kuznets_dmsp/"
SITE_DATA = SITE_POST + "data/"
ZIP_NAME = "python_kuznets_dmsp_data.zip"
STUDY_TITLE = "Regional Inequality from Outer Space"
STUDY_SUB = ("Predicting regional GDP from nighttime lights and building inequality indices in "
             "Python - a replication of Lessmann & Seidel (2017).")

# Columns that are 0/1 indicators -> get the yes/no value label.
DUMMIES = {
    "eap", "eca", "lac", "mena", "sa", "ssa",
    "satyear_1", "satyear_2", "satyear_3", "satyear_4",
    "satyear_5", "satyear_6", "satyear_7", "fedelupd2",
}
YESNO = {0: "No", 1: "Yes"}

# --------------------------------------------------------------------------------------
# Per-variable metadata. One entry per UNIQUE column name (columns shared across files
# are defined once). kind drives value labels and the statistics formatting:
#   id   = identifier (numeric stats suppressed)   str  = string identifier
#   year = calendar year (integer stats)           dummy= 0/1 indicator
#   cont = continuous / numeric measure
# label <= 80 chars (Stata limit). defn / constr / units / source / cov feed the README
# dictionary table and the .do notes.
# --------------------------------------------------------------------------------------
GADM = "GADM (Global Administrative Areas)"
GENN = "Gennaioli et al. (2014)"
NOAA = "NOAA/NGDC DMSP-OLS stable lights"
WDI = "World Bank WDI"
GPW = "GPW v3 (CIESIN)"
POLITY = "Polity IV (Center for Systemic Peace)"
GREG = "GREG (Weidmann et al. 2010) + NOAA/NGDC"
LS = "Lessmann & Seidel (2017)"
PAPER = "This study (derived)"
ARCH = "Authors' replication archive"

REGION_FRAME = "1992-2010 · 1,504 reg (81 ctry) · region frame"
COUNTRY_FRAME = "1992-2012 · 180 ctry · country frame"

COLUMNS = {
    # ---- identifiers & keys -----------------------------------------------------------
    "Country_ISO": dict(kind="str", units="string", source=GADM, cov="all files",
        label="Country code (ISO 3166-1 alpha-3)",
        defn="Three-letter country identifier",
        constr="Assigned per country"),
    "Country_NAME": dict(kind="str", units="string", source=GADM, cov="country/region files",
        label="Country name",
        defn="Country name (English)",
        constr="From GADM country attributes"),
    "Region_NAME": dict(kind="str", units="string", source=GADM, cov=REGION_FRAME,
        label="First-level administrative region name",
        defn="Name of the first-level admin unit (state/province/canton)",
        constr="GADM admin-1 name"),
    "code_Coutry_Region": dict(kind="id", units="integer", source=ARCH, cov=REGION_FRAME,
        label="Numeric region key (orig. spelling 'Coutry' kept)",
        defn="Numeric identifier for a region (unique within country)",
        constr="Region identifier carried verbatim from the authors' archive"),
    "id_t_j": dict(kind="str", units="string", source=ARCH, cov="region frame (Prediction)",
        label="Country-year key (year+ISO, e.g. 2010CHE)",
        defn="Concatenated year and ISO code",
        constr="year concatenated with Country_ISO"),
    "year": dict(kind="year", units="year", source="-", cov="per file (see summary)",
        label="Calendar year",
        defn="Year of observation",
        constr="-"),

    # ---- nighttime lights & income ----------------------------------------------------
    "log_Light_ppix_Region": dict(kind="cont", units="log DN", source=NOAA, cov=REGION_FRAME,
        label="Log avg nighttime light per pixel (region)",
        defn="Natural log of the region mean DMSP-OLS stable-lights digital number",
        constr="ln(mean DN); mean set to 0.01 when 0 so the log is defined; DN ranges 0-63"),
    "Light_Region": dict(kind="cont", units="summed DN", source=NOAA, cov="region frame (Table_2)",
        label="Regional total nighttime lights (summed DN)",
        defn="Sum of pixel digital numbers over the region",
        constr="Sum of DMSP-OLS stable-lights DN over the region's pixels"),
    "Light_Country": dict(kind="cont", units="summed DN", source=NOAA, cov="region frame (Table_2)",
        label="Country total nighttime lights (summed DN)",
        defn="Sum of pixel digital numbers over the whole country",
        constr="Sum of DMSP-OLS stable-lights DN over all country pixels"),
    "GDP_pc_Region": dict(kind="cont", units="US$ (2005 PPP)", source=GENN, cov=REGION_FRAME,
        label="Observed regional GDP per capita (2005 PPP US$)",
        defn="Observed regional GDP per capita (training target)",
        constr="Regional accounts, constant 2005 PPP US$"),
    "log_GDP_pc_Region": dict(kind="cont", units="log US$", source=GENN, cov=REGION_FRAME,
        label="Log observed regional GDP per capita",
        defn="Natural log of GDP_pc_Region",
        constr="ln(GDP_pc_Region)"),
    "pred_GDP_pc_Region": dict(kind="cont", units="US$ (2005 PPP)", source=PAPER, cov="region frame (Table_2)",
        label="Predicted regional GDP per capita (2005 PPP US$)",
        defn="Model-predicted regional GDP per capita",
        constr="Back-transformed fitted values of the eq.-1 random-effects model"),
    "GDP_pc_Country": dict(kind="cont", units="US$ (2005 PPP)", source=WDI, cov=COUNTRY_FRAME,
        label="National GDP per capita (2005 PPP US$)",
        defn="National GDP per capita",
        constr="World Bank WDI, constant 2005 PPP US$"),
    "log_GDP_pc_Country": dict(kind="cont", units="log US$", source=WDI, cov=REGION_FRAME,
        label="Log national GDP per capita",
        defn="Natural log of national GDP per capita",
        constr="ln(national GDP per capita)"),

    # ---- prediction-model regressors & fixed-effect dummies ---------------------------
    "log_N_pix_top_cod_1_ppix": dict(kind="cont", units="log count", source=NOAA, cov=REGION_FRAME,
        label="Log count of top-coded pixels (DN=63)",
        defn="Log number of saturated (top-coded) pixels in the region",
        constr="ln(count of DN=63 pixels) per region; controls for sensor saturation"),
    "log_N_pix_low_cod_1_ppix": dict(kind="cont", units="log count", source=NOAA, cov=REGION_FRAME,
        label="Log count of low-coded pixels (DN=0)",
        defn="Log number of dark (low-coded) pixels in the region",
        constr="ln(count of DN=0 pixels) per region; controls for sparse/rural area"),
    "log_area": dict(kind="cont", units="log km^2", source=GADM, cov=REGION_FRAME,
        label="Log region area (km^2)",
        defn="Natural log of the region polygon area",
        constr="ln(region area in km^2)"),
    "log_region": dict(kind="cont", units="log count", source=GADM, cov=REGION_FRAME,
        label="Log number of regions in the country",
        defn="Log count of first-level regions per country",
        constr="ln(number of regions in the country)"),
    "log_region_X_log_area": dict(kind="cont", units="-", source=PAPER, cov=REGION_FRAME,
        label="Interaction: log_region x log_area",
        defn="Product of log_region and log_area",
        constr="log_region * log_area"),
    "eap": dict(kind="dummy", units="0/1", source=WDI, cov=REGION_FRAME,
        label="World Bank region dummy: East Asia & Pacific",
        defn="1 if the country is in East Asia & Pacific (North America = reference)",
        constr="World Bank regional grouping indicator"),
    "eca": dict(kind="dummy", units="0/1", source=WDI, cov=REGION_FRAME,
        label="World Bank region dummy: Europe & Central Asia",
        defn="1 if the country is in Europe & Central Asia (North America = reference)",
        constr="World Bank regional grouping indicator"),
    "lac": dict(kind="dummy", units="0/1", source=WDI, cov=REGION_FRAME,
        label="World Bank region dummy: Latin America & Caribbean",
        defn="1 if the country is in Latin America & Caribbean (North America = reference)",
        constr="World Bank regional grouping indicator"),
    "mena": dict(kind="dummy", units="0/1", source=WDI, cov=REGION_FRAME,
        label="World Bank region dummy: Middle East & North Africa",
        defn="1 if the country is in Middle East & North Africa (North America = reference)",
        constr="World Bank regional grouping indicator"),
    "sa": dict(kind="dummy", units="0/1", source=WDI, cov=REGION_FRAME,
        label="World Bank region dummy: South Asia",
        defn="1 if the country is in South Asia (North America = reference)",
        constr="World Bank regional grouping indicator"),
    "ssa": dict(kind="dummy", units="0/1", source=WDI, cov=REGION_FRAME,
        label="World Bank region dummy: Sub-Saharan Africa",
        defn="1 if the country is in Sub-Saharan Africa (North America = reference)",
        constr="World Bank regional grouping indicator"),

    # ---- population & geography -------------------------------------------------------
    "Pop_Region": dict(kind="cont", units="persons", source=GPW, cov=REGION_FRAME,
        label="Regional total population (persons)",
        defn="Total population of the region",
        constr="Population density x region area, rounded up (min 1); 5-yr waves interpolated to annual"),
    "Pop_Country": dict(kind="cont", units="persons", source=GPW, cov="region & country frames",
        label="Country total population (persons)",
        defn="Total population of the country",
        constr="Sum of regional populations"),
    "area": dict(kind="cont", units="km^2", source=WDI, cov=COUNTRY_FRAME,
        label="Country land area (km^2)",
        defn="Total land area excluding inland water",
        constr="World Bank WDI land area"),
    "Latitude": dict(kind="cont", units="degrees", source=GADM, cov="region frame (Table_B4)",
        label="Region centroid latitude (degrees)",
        defn="Latitude of the region polygon centroid",
        constr="GADM polygon centroid"),
    "Longitude": dict(kind="cont", units="degrees", source=GADM, cov="region frame (Table_B4)",
        label="Region centroid longitude (degrees)",
        defn="Longitude of the region polygon centroid",
        constr="GADM polygon centroid"),

    # ---- inequality indices (all population-weighted, on predicted regional income) ---
    "GINIW_pred_GDP_pc": dict(kind="cont", units="0-1", source=PAPER, cov=COUNTRY_FRAME,
        label="Pop-weighted regional Gini (predicted income)",
        defn="Population-weighted Gini of predicted regional income within a country-year",
        constr="Gini of pred_GDP_pc_Region across regions, weighted by Pop_Region, per country-year"),
    "COVW_pred_GDP_pc": dict(kind="cont", units=">=0", source=PAPER, cov=COUNTRY_FRAME,
        label="Pop-weighted coefficient of variation (pred income)",
        defn="Population-weighted coefficient of variation of predicted regional income",
        constr="pop-weighted SD / pop-weighted mean of pred_GDP_pc_Region, per country-year"),
    "GE_1W_pred_GDP_pc": dict(kind="cont", units=">=0", source=PAPER, cov=COUNTRY_FRAME,
        label="Pop-weighted Theil index GE(alpha=1)",
        defn="Population-weighted Theil index of predicted regional income",
        constr="Generalized entropy GE(alpha=1) of pred_GDP_pc_Region, pop-weighted, per country-year"),
    "GE_0W_pred_GDP_pc": dict(kind="cont", units=">=0", source=PAPER, cov=COUNTRY_FRAME,
        label="Pop-weighted mean log deviation GE(alpha=0)",
        defn="Population-weighted mean log deviation of predicted regional income",
        constr="Generalized entropy GE(alpha=0) of pred_GDP_pc_Region, pop-weighted, per country-year"),
    "GE_m1W_pred_GDP_pc": dict(kind="cont", units=">=0", source=PAPER, cov=COUNTRY_FRAME,
        label="Pop-weighted generalized entropy GE(alpha=-1)",
        defn="Population-weighted GE(-1) of predicted regional income",
        constr="Generalized entropy GE(alpha=-1) of pred_GDP_pc_Region, pop-weighted, per country-year"),
    "Giniall": dict(kind="cont", units="0-100", source=LS, cov="1992-2012 · 153 ctry · N=1,330 (Figure_5)",
        label="National interpersonal income Gini (0-100)",
        defn="Household-survey interpersonal income Gini",
        constr="Reported household income Gini on a 0-100 scale (note: regional indices are 0-1)"),

    # ---- determinants (country frame, 1992-2012) --------------------------------------
    "Resources_rents_share_of_GDP": dict(kind="cont", units="% GDP", source=WDI, cov="177 ctry · N=3,620",
        label="Natural-resource rents (% of GDP)",
        defn="Total natural-resource rents as a share of GDP",
        constr="Oil + gas + coal + mineral + forest rents, % of GDP"),
    "Arable_land": dict(kind="cont", units="share", source=WDI, cov="178 ctry · N=3,603",
        label="Arable land (share of land area)",
        defn="Arable land as a share of land area (FAO definition)",
        constr="Arable land / total land area"),
    "Trade_GDP_share": dict(kind="cont", units="ratio", source=WDI, cov="176 ctry · N=3,509",
        label="Trade openness (exports+imports)/GDP",
        defn="Trade as a share of GDP",
        constr="(Exports + imports) / GDP"),
    "FDI_share_of_GDP": dict(kind="cont", units="ratio", source=WDI, cov="174 ctry · N=3,477",
        label="FDI openness: net FDI inflows / GDP",
        defn="Net foreign direct investment inflows as a share of GDP",
        constr="Net FDI inflows / GDP"),
    "price_gasoline": dict(kind="cont", units="US$/litre", source=WDI, cov="162 ctry · N=1,366",
        label="Gasoline pump price (2005 PPP US$/litre)",
        defn="Pump price for gasoline",
        constr="Pump price, PPP constant 2005 US$/litre; paper's transport cost = area x price_gasoline"),
    "Aid": dict(kind="cont", units="US$ (2011)", source=WDI, cov="155 ctry · N=2,964",
        label="Net official development assistance (2011 US$)",
        defn="Net official development assistance received",
        constr="Net ODA received, constant 2011 US$"),
    "School_enrollment_secondary": dict(kind="cont", units="% gross", source=WDI, cov="172 ctry · N=2,566",
        label="Gross secondary-school enrolment (% gross)",
        defn="Gross secondary-school enrolment ratio (>100% with over-age pupils)",
        constr="Secondary enrolment / age-eligible population"),
    "GINIW_Eth_light": dict(kind="cont", units="0-1", source=GREG, cov="173 ctry · N=3,528",
        label="Ethnic inequality: pop-weighted light Gini",
        defn="Population-weighted light-Gini computed across ethnic homelands",
        constr="Light Gini across ethnic homelands (method of Alesina et al. 2016)"),
    "Polity2": dict(kind="cont", units="-1..+1", source=POLITY, cov="157 ctry · N=3,158",
        label="Polity IV democracy-autocracy score (-1..+1)",
        defn="Rescaled Polity IV combined democracy-autocracy score",
        constr="Polity IV combined score rescaled -1 (autocracy) to +1 (democracy)"),
    "fedelupd2": dict(kind="dummy", units="0/1", source=ARCH, cov="1992-2009 · 154 ctry · N=2,724",
        label="Federal-state dummy (1=federal)",
        defn="1 if the country is federally organised",
        constr="Federalism indicator from the authors' archive"),
}

# Satellite/sensor-era dummies satyear_1..satyear_7 (one per DMSP sensor configuration era).
for _i in range(1, 8):
    COLUMNS[f"satyear_{_i}"] = dict(
        kind="dummy", units="0/1", source=NOAA, cov=REGION_FRAME,
        label=f"Satellite/sensor-era dummy {_i} (of 7)",
        defn=f"1 for DMSP satellite/sensor configuration era {_i}",
        constr="Sensor-era indicator; DMSP sensors change and age over 1992-2010")

# --------------------------------------------------------------------------------------
# Per-file metadata. file_label <= 80 chars (Stata dataset label). dataset_note is the
# long _dta note. Column order is read live from the CSV.
# --------------------------------------------------------------------------------------
FILES = {
    "Prediction_Data.csv": dict(
        label="Kuznets/DMSP region-year training panel (light->GDP, Table 1)",
        grain="region-year", rows="5,258", years="1992-2010",
        units_cov="1,504 regions in 81 countries", key="code_Coutry_Region x year",
        note=("Region-year training panel; 1,504 regions in 81 countries; 1992-2010; 5,258 rows. "
              "Training sample for the nighttime-light -> GDP prediction model (Table 1): regions "
              "with both observed GDP and DMSP-OLS lights, plus geographic, World Bank region, and "
              "satellite-era controls. Keyed by code_Coutry_Region x year (country = Country_ISO)."),
        purpose="Train the light->income prediction model (Table 1)."),
    "Table_2_data.csv": dict(
        label="Kuznets/DMSP region-year inputs for inequality-index validation",
        grain="region-year", rows="5,258", years="1992-2010",
        units_cov="same 1,504-region training frame", key="Country_ISO x year (region-year frame)",
        note=("Region-year frame (same 1,504-region training sample); 1992-2010; 5,258 rows. "
              "Pairs predicted and observed regional income with regional/country lights and "
              "population to validate the five inequality indices (Table 2). Has no explicit "
              "region-id column; rows are the training frame at region-year."),
        purpose="Validate the inequality indices (Table 2)."),
    "Table_3_data.csv": dict(
        label="Kuznets/DMSP country-year panel: GDP + 5 inequality indices (Table 3)",
        grain="country-year", rows="3,675", years="1992-2012",
        units_cov="180 countries", key="Country_ISO x year",
        note=("Country-year panel; 180 countries; 1992-2012; 3,675 rows. Core Kuznets dataset: "
              "national GDP per capita plus five population-weighted regional inequality indices "
              "built from predicted regional incomes. Used to estimate the spatial Kuznets curve "
              "(Table 3). Keyed by Country_ISO x year."),
        purpose="Kuznets curve: GDP + five indices (Table 3)."),
    "Table_4_data.csv": dict(
        label="Kuznets/DMSP country-year panel: inequality determinants (Table 4)",
        grain="country-year", rows="3,675", years="1992-2012",
        units_cov="180 countries (determinants sparser)", key="Country_ISO x year",
        note=("Country-year panel; 180 countries; 1992-2012; 3,675 rows. Regional Gini plus "
              "structural correlates of regional inequality (resource rents, arable land, trade, "
              "FDI, gasoline price, aid, schooling, ethnic inequality, democracy, federalism). "
              "Determinant coverage varies by country-year (see per-variable N). Keyed by "
              "Country_ISO x year."),
        purpose="Determinants of regional inequality (Table 4)."),
    "Table_B4_data.csv": dict(
        label="Kuznets/DMSP region-year panel: Conley spatial-HAC inputs + lat/lon",
        grain="region-year", rows="5,258", years="1992-2010",
        units_cov="1,504 regions in 81 countries", key="code_Coutry_Region x year",
        note=("Region-year frame; 1,504 regions in 81 countries; 1992-2010; 5,258 rows. Adds "
              "region-centroid coordinates so the light elasticity can be re-estimated with Conley "
              "spatial-HAC standard errors (spatial-correlation robustness check). Keyed by "
              "code_Coutry_Region x year."),
        purpose="Conley spatial-HAC standard errors (+ lat/lon)."),
    "Figure_5_data.csv": dict(
        label="Kuznets/DMSP country-year: regional vs interpersonal Gini (Figure 5)",
        grain="country-year", rows="3,675", years="1992-2012",
        units_cov="180 countries (Giniall: 153 ctry)", key="Country_ISO x year",
        note=("Country-year panel; 180 countries; 1992-2012; 3,675 rows. Pairs the population-"
              "weighted regional Gini with the national household-survey interpersonal income Gini "
              "(sparsely observed) to compare regional vs personal inequality (Figure 5). Keyed by "
              "Country_ISO x year."),
        purpose="Regional vs interpersonal inequality (Figure 5)."),
}
FILE_ORDER = list(FILES.keys())

# Data sources for the README sources table (token -> (used for, reference/URL)).
SOURCES = [
    (NOAA, "Nighttime lights (DMSP-OLS stable lights v4, DN 0-63)",
     "NOAA National Geophysical Data Center. https://www.ngdc.noaa.gov/eog/dmsp.html"),
    (GENN, "Observed regional GDP per capita (training target)",
     "Gennaioli, La Porta, Lopez-de-Silanes & Shleifer (2014), J. Economic Growth 19(3)."),
    (WDI, "National accounts, determinants (GDP, trade, FDI, rents, etc.)",
     "World Bank, World Development Indicators. https://databank.worldbank.org/source/world-development-indicators"),
    (GADM, "Administrative boundaries, region names, areas, centroids",
     "GADM database of Global Administrative Areas. https://gadm.org"),
    (GPW, "Gridded population (region and country totals)",
     "CIESIN, Gridded Population of the World v3. https://sedac.ciesin.columbia.edu"),
    (POLITY, "Democracy-autocracy score (Polity2)",
     "Center for Systemic Peace, Polity IV project. https://www.systemicpeace.org/inscrdata.html"),
    (GREG, "Ethnic homelands for the ethnic-inequality light Gini",
     "Weidmann, Rod & Cederman (2010), J. Peace Research 47(4)."),
    (LS, "Original study replicated here; interpersonal Gini (Giniall)",
     "Lessmann & Seidel (2017), 'Regional inequality, convergence, and its determinants - "
     "A view from outer space', European Economic Review 92: 110-132."),
]

CONSTRUCTION_FORMULAS = """\
All five inequality indices are computed **within each country-year, across that country's
regions**, on predicted regional income `y = pred_GDP_pc_Region`, weighted by the regional
population share `p_i = Pop_Region_i / Pop_Country`. Let `ybar = sum_i p_i * y_i` be the
population-weighted mean.

- **Population-weighted Gini** (`GINIW_pred_GDP_pc`, 0-1):
  `GINIW = ( sum_i sum_j p_i p_j |y_i - y_j| ) / (2 * ybar)`.
- **Coefficient of variation** (`COVW_pred_GDP_pc`, >=0):
  `COVW = sqrt( sum_i p_i (y_i - ybar)^2 ) / ybar`.
- **Generalized entropy** `GE(alpha)` (`GE_1W`, `GE_0W`, `GE_m1W`):
  for `alpha not in {0,1}`: `GE(alpha) = 1/(alpha(alpha-1)) * sum_i p_i [ (y_i/ybar)^alpha - 1 ]`;
  `GE(1)` = Theil = `sum_i p_i (y_i/ybar) ln(y_i/ybar)`;
  `GE(0)` = mean log deviation = `sum_i p_i ln(ybar/y_i)`;
  here `GE_m1W` uses `alpha = -1`.

Other constructed variables:

- **Log nighttime light** (`log_Light_ppix_Region`): `ln(meanDN)`, where the region mean DN is
  set to `0.01` when it equals 0 so the log is defined (DMSP DN range 0-63).
- **Prediction model** (eq. 1): a random-effects regression of `log_GDP_pc_Region` on
  `log_Light_ppix_Region`, the top-/low-coded pixel counts, `log_area`, `log_region`,
  `log_region_X_log_area`, the World Bank region dummies, the satellite-era dummies, and
  `log_GDP_pc_Country`. `pred_GDP_pc_Region` is the back-transformed fitted value.
- **Transport cost** (paper's proxy, not a stored column): `area * price_gasoline`.
"""

CAVEATS = """\
- **DMSP top-coding / saturation.** Sensor digital numbers are capped at 63, so the brightest
  city cores are censored; `log_N_pix_top_cod_1_ppix` controls for this.
- **Sensor drift across satellite eras.** Six+ DMSP sensors span 1992-2010 with differing
  calibration and aging; the `satyear_1`..`satyear_7` dummies absorb these era effects.
- **Sparse determinants.** Several Table 4 determinants are observed for far fewer country-years
  than the core panel (e.g. `price_gasoline` N=1,366; `School_enrollment_secondary` N=2,566), so
  determinant regressions run on shifting subsamples - compare columns descriptively, not as
  nested models. The authors' ICRG "bureaucratic quality" index is licensed and **not** included.
- **Scale of `Giniall`.** The interpersonal income Gini is on a **0-100** scale, whereas the
  regional indices (`GINIW_*`, etc.) are on a **0-1** scale - do not mix them without rescaling.
- **`code_Coutry_Region` spelling.** The misspelling "Coutry" is preserved deliberately so the
  key matches the authors' original replication archive.
"""

# ASCII replacements for the .do file (Stata .do is plain text; keep it ASCII-clean).
_ASCII = {"–": "-", "—": "-", "−": "-", "×": "x", "·": "-",
          "≥": ">=", "≤": "<=", "²": "^2", "→": "->",
          "‘": "'", "’": "'", "“": '"', "”": '"'}


def ascii_safe(s):
    for k, v in _ASCII.items():
        s = s.replace(k, v)
    return s.encode("ascii", "replace").decode("ascii")


def fnum(x):
    """Compact, readable formatting of a numeric statistic."""
    try:
        x = float(x)
    except (TypeError, ValueError):
        return "—"
    if math.isnan(x):
        return "—"
    ax = abs(x)
    if ax == 0:
        return "0"
    if ax < 1e-3:
        return f"{x:.2e}"
    if ax >= 1e4:
        return f"{x:,.0f}"
    if ax >= 100:
        return f"{x:,.1f}"
    if ax >= 1:
        return f"{x:.2f}"
    return f"{x:.3f}"


def stat_cells(series, kind):
    """Return [N, Miss%, Distinct, Min, Mean, Median, Max, SD] formatted for the README."""
    total = len(series)
    n = int(series.notna().sum())
    miss = 100.0 * (total - n) / total if total else 0.0
    distinct = int(series.nunique(dropna=True))
    head = [f"{n:,}", f"{miss:.1f}", f"{distinct:,}"]
    if kind in ("cont", "dummy", "year") and pd.api.types.is_numeric_dtype(series):
        vmin, vmean = series.min(), series.mean()
        vmed, vmax, vsd = series.median(), series.max(), series.std()
        if kind == "year":
            num = [str(int(vmin)), f"{vmean:.1f}", str(int(vmed)), str(int(vmax)), f"{vsd:.2f}"]
        else:
            num = [fnum(vmin), fnum(vmean), fnum(vmed), fnum(vmax), fnum(vsd)]
    else:
        num = ["—", "—", "—", "—", "—"]
    return head + num


def md_table(header, rows):
    out = ["| " + " | ".join(header) + " |",
           "|" + "|".join(["---"] * len(header)) + "|"]
    for r in rows:
        out.append("| " + " | ".join(str(c) for c in r) + " |")
    return "\n".join(out)


def links_table(ext):
    """GitHub view (blob) + raw (loadable) links for every dataset in one format."""
    rows = []
    for name in FILE_ORDER:
        fn = name[:-4] + ext
        rows.append([f"`{fn}`", f"[view]({BLOB_BASE}{fn})", f"[raw]({RAW_BASE}{fn})"])
    return md_table(["File", "View on GitHub", "Raw (load / download)"], rows)


def load_csv(name):
    df = pd.read_csv(os.path.join(BASE, name))
    # pyreadstat wants plain object dtype for string columns (pandas 3.x string dtype safe-guard).
    for c in df.columns:
        if not pd.api.types.is_numeric_dtype(df[c]):
            df[c] = df[c].astype(object)
    return df


def write_dta(name, df):
    base = name[:-4]
    out = os.path.join(BASE, base + ".dta")
    meta = FILES[name]
    labels = [COLUMNS[c]["label"] for c in df.columns]
    vvl = {c: YESNO for c in df.columns if c in DUMMIES}
    pyreadstat.write_dta(
        df, out,
        file_label=meta["label"],
        column_labels=labels,
        version=STATA_VERSION,
        variable_value_labels=vvl,
    )
    return out


def readme_section(name, df):
    meta = FILES[name]
    base = name[:-4]
    cols = list(df.columns)
    dict_rows, stat_rows = [], []
    for c in cols:
        m = COLUMNS[c]
        dict_rows.append([f"`{c}`", m["label"], m["defn"], m["constr"], m["units"], m["source"], m["cov"]])
        stat_rows.append([f"`{c}`"] + stat_cells(df[c], m["kind"]))
    lines = [
        f"### `{base}`",
        "",
        f"- **Grain:** {meta['grain']} &nbsp;|&nbsp; **Rows x Cols:** {df.shape[0]:,} x {df.shape[1]} "
        f"&nbsp;|&nbsp; **Years:** {meta['years']} &nbsp;|&nbsp; **Coverage:** {meta['units_cov']}",
        f"- **Panel key:** {meta['key']}",
        f"- **Purpose:** {meta['purpose']}",
        f"- **Columns (CSV order):** " + ", ".join(f"`{c}`" for c in cols),
        "",
        "**Variable dictionary**",
        "",
        md_table(["Variable", "Stata label", "Definition", "Construction", "Units", "Source", "Coverage"], dict_rows),
        "",
        "**Computed statistics** (from the CSV; dummies: Mean = share coded 1; identifiers/strings: numeric stats omitted)",
        "",
        md_table(["Variable", "N", "Miss%", "Distinct", "Min", "Mean", "Median", "Max", "SD"], stat_rows),
        "",
    ]
    return "\n".join(lines)


def build_readme(frames):
    # cross-file presence matrix
    var_files = {}
    for name in FILE_ORDER:
        for c in frames[name].columns:
            var_files.setdefault(c, set()).add(name)
    short = {n: n[:-4] for n in FILE_ORDER}
    matrix_rows = []
    for c in sorted(var_files):
        marks = ["●" if name in var_files[c] else "" for name in FILE_ORDER]
        matrix_rows.append([f"`{c}`"] + marks)

    summary_rows = []
    for name in FILE_ORDER:
        m, df = FILES[name], frames[name]
        summary_rows.append([f"`{name[:-4]}`", m["grain"], f"{df.shape[0]:,} x {df.shape[1]}",
                             m["years"], m["units_cov"], m["purpose"]])

    src_rows = [[s[0], s[1], s[2]] for s in SOURCES]

    parts = [
        "# Data dictionary - Regional Inequality from Outer Space",
        "",
        "Companion data for the post **\"Regional Inequality from Outer Space: Predicting GDP from "
        "Nighttime Lights and Building Inequality Indices in Python\"** "
        "(<https://carlos-mendez.org/post/python_kuznets_dmsp/>), a Python replication of Lessmann "
        "& Seidel (2017). Each dataset ships in two identical forms - **`.csv`** (plain) and "
        f"**`.dta`** (Stata v{DTA_FORMAT}, Stata 14+, with embedded variable labels and value "
        "labels). This file documents every dataset and every variable: definition, construction, "
        "units, source, coverage, and computed statistics. It is generated by `make_stata.py` and "
        "supersedes the post's Appendix A.",
        "",
        "> Values are byte-identical across the `.csv` and `.dta` forms; the `.dta` adds metadata "
        "only. Long-form Stata `notes` are attached by running `stata_codebook.do` in Stata (see "
        "**Using the data**).",
        "",
        "## Provenance",
        "",
        "- **Replicates:** Lessmann, C. & Seidel, A. (2017). \"Regional inequality, convergence, and "
        "its determinants - A view from outer space.\" *European Economic Review* 92: 110-132.",
        "- **Design:** predict regional GDP per capita from DMSP-OLS nighttime lights, build five "
        "population-weighted inequality indices, and estimate the spatial (regional) Kuznets curve "
        "and its determinants across up to 180 countries, 1992-2012.",
        "- **Panel structure:** *region files* are keyed by region x year over a 1,504-region / "
        "81-country training frame (1992-2010); *country files* are keyed by `Country_ISO` x year "
        "over 180 countries (1992-2012). The country-file inequality indices are built from the "
        "predicted regional incomes in the region files.",
        "",
        "## Data sources",
        "",
        md_table(["Source", "Provides", "Reference / URL"], src_rows),
        "",
        "## Dataset links (GitHub)",
        "",
        "Every dataset is available in both formats - identical data; the `.dta` adds embedded "
        "variable labels and value labels. Use a **raw** link to load or download a file in code; "
        "use **view** to browse it on GitHub.",
        "",
        "**Stata `.dta`**",
        "",
        links_table(".dta"),
        "",
        "**CSV `.csv`**",
        "",
        links_table(".csv"),
        "",
        "## Using the data",
        "",
        "Each snippet loads straight from GitHub (the **raw** base above) - no manual download "
        "needed, except `pyreadstat`, which reads local files only. Swap the file name to load any "
        "of the six datasets.",
        "",
        "```stata",
        "* Stata 14+ : `use` reads an http(s) URL directly",
        f'global BASE "{RAW_BASE}"',
        'use "${BASE}Table_3_data.dta", clear',
        "describe        // variable + value labels",
        "notes           // long-form documentation (after running stata_codebook.do)",
        "* one-time, in a local clone: attach the per-variable notes to every .dta",
        "do stata_codebook.do",
        "```",
        "",
        "```python",
        "# Python : pandas reads a .dta URL directly (values + variable labels)",
        "import pandas as pd",
        f'BASE = "{RAW_BASE}"',
        'df = pd.read_stata(BASE + "Table_3_data.dta")',
        "",
        "# load all six datasets at once",
        'files = ["Prediction_Data", "Table_2_data", "Table_3_data",',
        '         "Table_4_data", "Table_B4_data", "Figure_5_data"]',
        "data = {f: pd.read_stata(BASE + f + '.dta') for f in files}",
        "",
        "# pyreadstat exposes the richest metadata but reads LOCAL files -> download first",
        "import pyreadstat, urllib.request",
        'urllib.request.urlretrieve(BASE + "Table_3_data.dta", "Table_3_data.dta")',
        'df, meta = pyreadstat.read_dta("Table_3_data.dta")',
        "# meta.column_labels, meta.variable_value_labels, meta.file_label",
        "```",
        "",
        "```r",
        "# R : haven::read_dta auto-downloads an http(s) URL",
        "library(haven)",
        f'BASE <- "{RAW_BASE}"',
        'df <- read_dta(paste0(BASE, "Table_3_data.dta"))   # labels via attr(df$var, \"label\")',
        "```",
        "",
        "To regenerate every `.dta`, this README, and `stata_codebook.do` from the CSVs "
        "(in a local clone):",
        "",
        "```bash",
        "python make_stata.py",
        "```",
        "",
        "## The six datasets",
        "",
        md_table(["File", "Grain", "Rows x Cols", "Years", "Coverage", "Purpose"], summary_rows),
        "",
        "## Cross-file variable index",
        "",
        "Which file each variable appears in (● = present).",
        "",
        md_table(["Variable"] + [short[n] for n in FILE_ORDER], matrix_rows),
        "",
        "## Construction & formulas",
        "",
        CONSTRUCTION_FORMULAS,
        "",
        "## Per-dataset documentation",
        "",
    ]
    for name in FILE_ORDER:
        parts.append(readme_section(name, frames[name]))
    parts += [
        "## Known limitations & caveats",
        "",
        CAVEATS,
        "",
        "---",
        "",
        f"*Generated by `make_stata.py`. Stata format: .dta v{DTA_FORMAT} (Stata 14+). "
        "Definitions follow Lessmann & Seidel (2017) and the post's Appendix A.*",
        "",
    ]
    return "\n".join(parts)


def build_do(frames):
    lines = [
        "* ====================================================================",
        "* stata_codebook.do - attach long-form documentation to the .dta files",
        "* --------------------------------------------------------------------",
        "* pyreadstat writes variable labels and value labels but cannot write",
        "* Stata `notes`. Run this once in Stata to attach a dataset note and a",
        "* per-variable note (definition / construction / units / source) to each",
        "* .dta, then re-save. Generated by make_stata.py - do not edit by hand.",
        "* ====================================================================",
        "",
    ]
    for name in FILE_ORDER:
        base = name[:-4]
        meta = FILES[name]
        lines.append(f'* ---- {base}.dta ----')
        lines.append(f'use "{base}.dta", clear')
        lines.append(f'label data "{ascii_safe(meta["label"])}"')
        lines.append(f'note _dta: {ascii_safe(meta["note"])}')
        for c in frames[name].columns:
            m = COLUMNS[c]
            txt = f'{m["defn"]}. Construction: {m["constr"]}. Units: {m["units"]}. Source: {m["source"]}.'
            lines.append(f'note {c}: {ascii_safe(txt)}')
        lines.append(f'save "{base}.dta", replace')
        lines.append("")
    return "\n".join(lines)


# ======================================================================================
# Self-contained, interactive HTML data-dictionary page (+ ZIP bundle)
# ======================================================================================

def h(s):
    return html.escape(str(s))


_URL_RE = re.compile(r"(https?://[^\s)<]+)")


def linkify(text):
    return _URL_RE.sub(
        lambda m: f'<a href="{m.group(1)}" target="_blank" rel="noopener">{m.group(1)}</a>',
        h(text))


def html_table(headers, rows, raw_cols=(), sortable=False, tid=""):
    cls = ' class="sortable"' if sortable else ""
    idattr = f' id="{tid}"' if tid else ""
    out = [f'<div class="tbl-wrap"><table{cls}{idattr}>', "<thead><tr>"]
    out += [f"<th>{h(x)}</th>" for x in headers]
    out.append("</tr></thead><tbody>")
    for r in rows:
        out.append("<tr>")
        for i, cell in enumerate(r):
            out.append(f"<td>{cell if i in raw_cols else h(cell)}</td>")
        out.append("</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


_TYPE_LABEL = {"cont": "continuous", "dummy": "dummy", "id": "identifier",
               "str": "identifier", "year": "year"}
_TYPE_CLASS = {"cont": "b-cont", "dummy": "b-dummy", "id": "b-id",
               "str": "b-id", "year": "b-year"}
_TYPE_FILTER = {"cont": "cont", "dummy": "dummy", "id": "id", "str": "id", "year": "year"}


def type_badge(kind):
    return f'<span class="badge {_TYPE_CLASS[kind]}">{_TYPE_LABEL[kind]}</span>'


def missing_bar(series):
    total = len(series)
    n = int(series.notna().sum())
    pct = 100.0 * n / total if total else 0.0
    return (f'<span class="missbar" title="{n:,} of {total:,} non-missing ({pct:.1f}%)">'
            f'<span class="missfill" style="width:{pct:.1f}%"></span></span>'
            f'<span class="misspct">{pct:.0f}%</span>')


def sparkline_svg(series, kind):
    """Tiny inline-SVG distribution: histogram (continuous) or 0/1 bars (dummy)."""
    clean = pd.to_numeric(series, errors="coerce").dropna()
    if kind in ("id", "str", "year") or clean.empty:
        return '<span class="spark-na">&ndash;</span>'
    W, H, PAD = 96, 26, 1
    extra = ""
    if kind == "dummy":
        share1 = float(clean.mean())
        counts = [1.0 - share1, share1]
        title = f"share coded 1 = {share1:.3f}"
        extra = " spark-dummy"
    else:
        lo, hi = clean.quantile(0.02), clean.quantile(0.98)
        if not (hi > lo):
            lo, hi = clean.min(), clean.max()
        if not (hi > lo):
            return '<span class="spark-na">&ndash;</span>'
        cats = pd.cut(clean.clip(lo, hi), bins=24)
        counts = cats.value_counts(sort=False).tolist()
        title = f"min {clean.min():.3g} | median {clean.median():.3g} | max {clean.max():.3g}"
    mx = max(counts) or 1.0
    n = len(counts)
    bw = (W - 2 * PAD) / n
    bars = []
    for i, c in enumerate(counts):
        bh = (H - 2 * PAD) * (c / mx)
        bars.append(f'<rect x="{PAD + i * bw:.2f}" y="{H - PAD - bh:.2f}" '
                    f'width="{max(bw - 0.6, 0.6):.2f}" height="{bh:.2f}"></rect>')
    return (f'<svg class="spark{extra}" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
            f'preserveAspectRatio="none" role="img"><title>{h(title)}</title>'
            f'{"".join(bars)}</svg>')


def code_block(code):
    return ('<div class="code"><button class="copy" type="button" onclick="copyCode(this)">Copy</button>'
            f'<pre><code>{h(code)}</code></pre></div>')


# --- HTML twins of the two prose blocks (kept aligned with the markdown versions) ------
CONSTRUCTION_FORMULAS_HTML = """
<p>All five inequality indices are computed <strong>within each country-year, across that
country's regions</strong>, on predicted regional income <code>y = pred_GDP_pc_Region</code>,
weighted by the regional population share <code>p_i = Pop_Region_i / Pop_Country</code>. Let
<code>ybar = sum_i p_i * y_i</code> be the population-weighted mean.</p>
<ul class="tight">
<li><strong>Population-weighted Gini</strong> (<code>GINIW_pred_GDP_pc</code>, 0&ndash;1):
<code>GINIW = ( sum_i sum_j p_i p_j |y_i - y_j| ) / (2 * ybar)</code>.</li>
<li><strong>Coefficient of variation</strong> (<code>COVW_pred_GDP_pc</code>):
<code>COVW = sqrt( sum_i p_i (y_i - ybar)^2 ) / ybar</code>.</li>
<li><strong>Generalized entropy</strong> <code>GE(alpha)</code> (<code>GE_1W</code>,
<code>GE_0W</code>, <code>GE_m1W</code>): for alpha not in {0,1},
<code>GE(alpha) = 1/(alpha(alpha-1)) * sum_i p_i [ (y_i/ybar)^alpha - 1 ]</code>;
<code>GE(1)</code> = Theil = <code>sum_i p_i (y_i/ybar) ln(y_i/ybar)</code>;
<code>GE(0)</code> = mean log deviation = <code>sum_i p_i ln(ybar/y_i)</code>;
<code>GE_m1W</code> uses alpha = -1.</li>
</ul>
<p>Other constructed variables:</p>
<ul class="tight">
<li><strong>Log nighttime light</strong> (<code>log_Light_ppix_Region</code>):
<code>ln(meanDN)</code>, with the region mean DN set to <code>0.01</code> when it is 0 so the log
is defined (DMSP DN range 0&ndash;63).</li>
<li><strong>Prediction model</strong> (eq. 1): a random-effects regression of
<code>log_GDP_pc_Region</code> on <code>log_Light_ppix_Region</code>, the top-/low-coded pixel
counts, <code>log_area</code>, <code>log_region</code>, <code>log_region_X_log_area</code>, the
World Bank region dummies, the satellite-era dummies, and <code>log_GDP_pc_Country</code>;
<code>pred_GDP_pc_Region</code> is the back-transformed fitted value.</li>
<li><strong>Transport cost</strong> (paper's proxy, not stored): <code>area * price_gasoline</code>.</li>
</ul>
"""

CAVEATS_HTML = """
<ul class="tight">
<li><strong>DMSP top-coding / saturation.</strong> Digital numbers cap at 63, so the brightest
city cores are censored; <code>log_N_pix_top_cod_1_ppix</code> controls for this.</li>
<li><strong>Sensor drift.</strong> Six+ DMSP sensors span 1992&ndash;2010 with differing
calibration and aging; the <code>satyear_1</code>&hellip;<code>satyear_7</code> dummies absorb
era effects.</li>
<li><strong>Sparse determinants.</strong> Several Table&nbsp;4 determinants are observed for far
fewer country-years than the core panel (e.g. <code>price_gasoline</code> N=1,366,
<code>School_enrollment_secondary</code> N=2,566), so those regressions run on shifting
subsamples &mdash; compare descriptively. The licensed ICRG "bureaucratic quality" index is not
included.</li>
<li><strong>Scale of <code>Giniall</code>.</strong> The interpersonal income Gini is on a
<strong>0&ndash;100</strong> scale, whereas the regional indices are on a <strong>0&ndash;1</strong>
scale &mdash; do not mix them without rescaling.</li>
<li><strong><code>code_Coutry_Region</code> spelling.</strong> The misspelling "Coutry" is kept so
the key matches the authors' original replication archive.</li>
</ul>
"""

_PAGE_CSS = """
:root{--steel:#6a9bcc;--orange:#d97757;--ink:#141413;--teal:#00d4c8;
  --bg:#f6f7f9;--card:#fff;--line:#e4e6ea;--muted:#6b6f76;--dark:#0f1729;}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;color:var(--ink);background:var(--bg);line-height:1.6;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}
a{color:var(--steel);text-decoration:none}a:hover{text-decoration:underline}
.hero{background:linear-gradient(135deg,#0f1729 0%,#1f2b5e 55%,#2a4a7a 100%);color:#fff;
  padding:40px 20px 30px}
.wrap{max-width:1100px;margin:0 auto}
.hero .back{color:#aeb9d6;font-size:14px}
.hero .kicker{color:var(--teal);font-weight:700;text-transform:uppercase;letter-spacing:.1em;
  font-size:12px;margin:14px 0 6px}
.hero h1{margin:0;font-size:32px;font-weight:800;letter-spacing:-.02em}
.hero p.sub{margin:8px 0 0;color:#d7dcea;max-width:780px}
.kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:22px}
.kpi{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:12px;
  padding:12px 14px}
.kpi .n{font-size:24px;font-weight:800;color:#fff}
.kpi .l{font-size:12px;color:#aeb9d6;text-transform:uppercase;letter-spacing:.04em}
nav.toc{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.96);
  backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
nav.toc .wrap{display:flex;flex-wrap:wrap;gap:4px 18px;padding:11px 20px;font-size:14px}
nav.toc a{color:var(--ink);font-weight:500}
main{padding:0 20px}
section{padding:30px 0;border-bottom:1px solid var(--line)}
section:last-of-type{border-bottom:none}
h2{font-size:23px;margin:0 0 6px;padding-left:12px;border-left:4px solid var(--orange)}
h2 .hint{font-size:13px;font-weight:400;color:var(--muted);border:0;padding:0;margin-left:8px}
h3{font-size:17px;margin:22px 0 8px}h4{font-size:15px;margin:18px 0 6px;color:var(--muted)}
p.lead{color:#3b3f46;max-width:820px}
.btn{display:inline-block;background:var(--steel);color:#fff;padding:8px 14px;border-radius:9px;
  font-size:14px;font-weight:600;margin:4px 6px 4px 0;transition:.15s}
.btn:hover{background:var(--orange);text-decoration:none;transform:translateY(-1px)}
.btn.zip{background:var(--orange);font-size:15px;padding:11px 20px}
.btn.zip:hover{background:#c4623f}
.btn.ghost{background:#eef1f6;color:var(--ink)}.btn.ghost:hover{background:#e2e7f0;color:var(--ink)}
.btn.small{padding:5px 11px;font-size:13px}
.tbl-wrap{overflow-x:auto;margin:8px 0;border:1px solid var(--line);border-radius:10px}
table{border-collapse:collapse;width:100%;font-size:13.5px;background:var(--card)}
th,td{padding:8px 11px;text-align:left;border-bottom:1px solid var(--line);vertical-align:middle}
th{background:#eef2f8;color:#27324a;font-weight:700;white-space:nowrap;position:sticky;top:0}
table.sortable th{cursor:pointer}table.sortable th:hover{background:#e2e9f4}
table.sortable th::after{content:' \\2195';color:#9aa3b2;font-size:11px}
tbody tr:hover{background:#f3f7fc}
code{background:#eef1f6;padding:1px 6px;border-radius:5px;font-size:.88em;
  font-family:'SF Mono',Menlo,Consolas,monospace;color:#243}
.badge{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;
  color:#fff;letter-spacing:.02em;white-space:nowrap}
.b-cont{background:var(--steel)}.b-dummy{background:var(--orange)}
.b-id{background:#7a8699}.b-year{background:#1aa39a}.b-frame{background:#27324a}
.spark{display:block}.spark rect{fill:var(--steel)}.spark-dummy rect{fill:var(--orange)}
.spark-na{color:#b9bec7}
.missbar{display:inline-block;width:54px;height:8px;background:#e9ecf1;border-radius:5px;
  overflow:hidden;vertical-align:middle}
.missfill{display:block;height:100%;background:linear-gradient(90deg,#3fae8e,#00d4c8)}
.misspct{font-size:12px;color:var(--muted);margin-left:6px;vertical-align:middle}
.code{position:relative;margin:12px 0}
.code pre{background:#0f1729;color:#e8ecf2;padding:16px;border-radius:11px;overflow-x:auto;margin:0}
.code pre code{background:none;color:inherit;padding:0;font-size:13px;line-height:1.55}
.code .copy{position:absolute;top:9px;right:9px;background:#27324a;color:#c8d0e0;border:none;
  border-radius:7px;padding:4px 11px;font-size:12px;cursor:pointer}
.code .copy:hover{background:var(--steel);color:#fff}
.note{background:#eef6fb;border-left:4px solid var(--steel);padding:11px 15px;
  border-radius:0 9px 9px 0;margin:14px 0;font-size:14px}
ul.tight li{margin:5px 0}
.explorer-controls{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:6px 0 12px}
#varSearch{flex:1;min-width:240px;padding:9px 13px;border:1px solid var(--line);border-radius:9px;
  font-size:14px;background:#fff}
#varSearch:focus{outline:2px solid var(--steel);border-color:var(--steel)}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{background:#eef1f6;border:1px solid var(--line);color:#3b3f46;border-radius:20px;
  padding:6px 13px;font-size:13px;font-weight:600;cursor:pointer}
.chip.active{background:var(--steel);color:#fff;border-color:var(--steel)}
.varcount{font-size:13px;color:var(--muted)}
.tabs{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 14px}
.tab{background:#eef1f6;border:1px solid var(--line);border-radius:9px 9px 0 0;padding:8px 14px;
  font-size:13.5px;font-weight:600;cursor:pointer;color:#3b3f46}
.tab.active{background:var(--steel);color:#fff;border-color:var(--steel)}
.dl-grid td .btn{margin:2px 4px 2px 0}
footer{padding:26px 20px 60px;color:var(--muted);font-size:13px}
@media(max-width:760px){.kpis{grid-template-columns:repeat(2,1fr)}.hero h1{font-size:25px}
  h2{font-size:20px}}
"""

_PAGE_JS = """
function copyCode(b){var c=b.parentElement.querySelector('code').innerText;
 navigator.clipboard.writeText(c).then(function(){var t=b.textContent;b.textContent='Copied!';
  setTimeout(function(){b.textContent=t;},1400);});}
function showTab(i){document.querySelectorAll('.ds-panel').forEach(function(p,j){p.style.display=(i===j?'block':'none');});
 document.querySelectorAll('.tab').forEach(function(b,j){b.classList.toggle('active',i===j);});}
var _chip='all';
function setChip(b){_chip=b.getAttribute('data-k');
 document.querySelectorAll('.chip').forEach(function(c){c.classList.toggle('active',c===b);});filterVars();}
function filterVars(){var q=(document.getElementById('varSearch').value||'').toLowerCase();
 var rows=document.querySelectorAll('#varTable tbody tr');var s=0;
 rows.forEach(function(r){var nm=r.getAttribute('data-name'),lb=r.getAttribute('data-label'),k=r.getAttribute('data-kind');
  var okT=(!q||nm.indexOf(q)>-1||lb.indexOf(q)>-1),okK=(_chip==='all'||k===_chip);
  var v=okT&&okK;r.style.display=v?'':'none';if(v)s++;});
 var el=document.getElementById('varCount');if(el)el.textContent=s+' variable'+(s===1?'':'s')+' shown';}
function _num(v){var x=parseFloat(String(v).replace(/[,%$]/g,''));return isNaN(x)?null:x;}
document.addEventListener('click',function(e){var th=e.target.closest('table.sortable th');if(!th)return;
 var tbl=th.closest('table'),idx=Array.prototype.indexOf.call(th.parentNode.children,th);
 var tb=tbl.querySelector('tbody'),rows=Array.prototype.slice.call(tb.querySelectorAll('tr'));
 var asc=!(th.getAttribute('data-asc')==='1');th.setAttribute('data-asc',asc?'1':'0');
 rows.sort(function(a,b){var x=a.children[idx].innerText.trim(),y=b.children[idx].innerText.trim();
  var nx=_num(x),ny=_num(y);if(nx!==null&&ny!==null)return asc?nx-ny:ny-nx;
  return asc?x.localeCompare(y):y.localeCompare(x);});rows.forEach(function(r){tb.appendChild(r);});});
document.addEventListener('DOMContentLoaded',function(){if(document.getElementById('varSearch'))filterVars();showTab(0);});
"""


def _dataset_panel(name, df):
    m = FILES[name]
    base = name[:-4]
    dict_rows, stat_rows = [], []
    for c in df.columns:
        md = COLUMNS[c]
        dict_rows.append([f"<code>{h(c)}</code> {type_badge(md['kind'])}",
                          md["label"], md["defn"], md["constr"], md["units"], md["source"], md["cov"]])
        cells = stat_cells(df[c], md["kind"])  # [N, Miss%, Distinct, Min, Mean, Median, Max, SD]
        stat_rows.append([f"<code>{h(c)}</code>", sparkline_svg(df[c], md["kind"]), missing_bar(df[c]),
                          cells[0], cells[2], cells[3], cells[4], cells[5], cells[6], cells[7]])
    dict_tbl = html_table(["Variable", "Label", "Definition", "Construction", "Units", "Source", "Coverage"],
                          dict_rows, raw_cols={0})
    stat_tbl = html_table(["Variable", "Distribution", "Coverage", "N", "Distinct",
                           "Min", "Mean", "Median", "Max", "SD"],
                          stat_rows, raw_cols={0, 1, 2}, sortable=True)
    return (f'<div class="ds-panel" id="ds-{h(base)}">'
            f'<p class="meta"><span class="badge b-frame">{h(m["grain"])}</span> '
            f'&nbsp;{df.shape[0]:,} &times; {df.shape[1]} &middot; {h(m["years"])} &middot; '
            f'{h(m["units_cov"])}</p>'
            f'<p class="meta">Panel key: <code>{h(m["key"])}</code> &middot; {h(m["purpose"])}</p>'
            f'<h4>Variable dictionary</h4>{dict_tbl}'
            f'<h4>Distribution &amp; statistics <span style="font-weight:400;color:#6b6f76">'
            f'(click a header to sort)</span></h4>{stat_tbl}')


def _explorer(frames):
    var_files, sample = {}, {}
    for name in FILE_ORDER:
        for c in frames[name].columns:
            var_files.setdefault(c, []).append(name[:-4])
            sample.setdefault(c, frames[name][c])
    rows = []
    for c in sorted(var_files):
        md = COLUMNS[c]
        k = _TYPE_FILTER[md["kind"]]
        rows.append(
            f'<tr data-name="{h(c.lower())}" data-label="{h(md["label"].lower())}" data-kind="{k}">'
            f'<td><code>{h(c)}</code></td><td>{type_badge(md["kind"])}</td>'
            f'<td>{sparkline_svg(sample[c], md["kind"])}</td><td>{h(md["label"])}</td>'
            f'<td>{h(md["units"])}</td><td>{h(", ".join(var_files[c]))}</td>'
            f'<td>{h(md["source"])}</td></tr>')
    controls = ('<div class="explorer-controls">'
                '<input id="varSearch" type="search" oninput="filterVars()" '
                'placeholder="Search variables by name or label..." aria-label="Search variables">'
                '<div class="chips">'
                '<button class="chip active" data-k="all" onclick="setChip(this)">All</button>'
                '<button class="chip" data-k="cont" onclick="setChip(this)">Continuous</button>'
                '<button class="chip" data-k="dummy" onclick="setChip(this)">Dummy</button>'
                '<button class="chip" data-k="id" onclick="setChip(this)">Identifier</button>'
                '</div><span id="varCount" class="varcount"></span></div>')
    table = ('<div class="tbl-wrap"><table id="varTable" class="sortable"><thead><tr>'
             '<th>Variable</th><th>Type</th><th>Distribution</th><th>Label</th>'
             '<th>Units</th><th>In files</th><th>Source</th></tr></thead><tbody>'
             + "".join(rows) + "</tbody></table></div>")
    return controls + table


def build_html(frames):
    # KPI figures computed from the data
    all_cols = sorted({c for n in FILE_ORDER for c in frames[n].columns})
    n_countries = max(df["Country_ISO"].nunique() for df in frames.values() if "Country_ISO" in df)
    yrs = pd.concat([df["year"] for df in frames.values() if "year" in df])
    total_rows = sum(df.shape[0] for df in frames.values())
    kpis = [(len(FILE_ORDER), "datasets"), (len(all_cols), "variables"),
            (n_countries, "countries"), (f"{int(yrs.min())}–{int(yrs.max())}", "years"),
            (f"{total_rows:,}", "rows")]
    kpi_html = "".join(f'<div class="kpi"><div class="n">{v}</div><div class="l">{l}</div></div>'
                       for v, l in kpis)

    # downloads grid
    dl_rows = []
    for name in FILE_ORDER:
        base, df = name[:-4], frames[name]
        dl_rows.append([f"<code>{h(base)}</code>", h(FILES[name]["grain"]),
                        f"{df.shape[0]:,} &times; {df.shape[1]}",
                        f'<a class="btn small" href="./{base}.dta" download>{base}.dta</a>',
                        f'<a class="btn ghost small" href="./{base}.csv" download>{base}.csv</a>'])
    dl_tbl = html_table(["Dataset", "Grain", "Rows", "Stata", "CSV"], dl_rows, raw_cols={0, 2, 3, 4})

    # code snippets (on-site URLs)
    stata_code = (f'* Stata 14+ : `use` reads an https URL directly\n'
                  f'global BASE "{SITE_DATA}"\n'
                  f'use "${{BASE}}Table_3_data.dta", clear\n'
                  f'describe        // variable + value labels\n'
                  f'notes           // long-form documentation (after running stata_codebook.do)')
    python_code = (f'# Python : pandas reads a .dta URL directly (values + variable labels)\n'
                   f'import pandas as pd\n'
                   f'BASE = "{SITE_DATA}"\n'
                   f'df = pd.read_stata(BASE + "Table_3_data.dta")\n\n'
                   f'# load all six datasets at once\n'
                   f'files = ["Prediction_Data", "Table_2_data", "Table_3_data",\n'
                   f'         "Table_4_data", "Table_B4_data", "Figure_5_data"]\n'
                   f'data = {{f: pd.read_stata(BASE + f + ".dta") for f in files}}\n\n'
                   f'# pyreadstat exposes the richest metadata but reads LOCAL files -> download first\n'
                   f'import pyreadstat, urllib.request\n'
                   f'urllib.request.urlretrieve(BASE + "Table_3_data.dta", "Table_3_data.dta")\n'
                   f'df, meta = pyreadstat.read_dta("Table_3_data.dta")')
    r_code = (f'# R : haven::read_dta auto-downloads an https URL\n'
              f'library(haven)\n'
              f'BASE <- "{SITE_DATA}"\n'
              f'df <- read_dta(paste0(BASE, "Table_3_data.dta"))   # labels via attr(df$var, "label")')

    # sources + cross-file matrix
    src_tbl = html_table(["Source", "Provides", "Reference / URL"],
                         [[h(s[0]), h(s[1]), linkify(s[2])] for s in SOURCES], raw_cols={2})
    short = {n: n[:-4] for n in FILE_ORDER}
    var_files = {}
    for name in FILE_ORDER:
        for c in frames[name].columns:
            var_files.setdefault(c, set()).add(name)
    matrix_rows = [[f"<code>{h(c)}</code>"] + ["&#9679;" if n in var_files[c] else "" for n in FILE_ORDER]
                   for c in sorted(var_files)]
    matrix_tbl = html_table(["Variable"] + [short[n] for n in FILE_ORDER], matrix_rows, raw_cols=set(range(7)))

    tabs = "".join(f'<button class="tab" onclick="showTab({i})">{h(name[:-4])}</button>'
                   for i, name in enumerate(FILE_ORDER))
    panels = "".join(_dataset_panel(name, frames[name]) for name in FILE_ORDER)

    out = [
        "<!doctype html>", '<html lang="en"><head>', '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        f"<title>Data dictionary &middot; {h(STUDY_TITLE)}</title>",
        f'<meta name="description" content="Interactive data dictionary for {h(STUDY_TITLE)}: '
        'datasets, variables, distributions, and downloads.">',
        f"<style>{_PAGE_CSS}</style>", "</head><body>",
        '<header class="hero"><div class="wrap">',
        f'<a class="back" href="{SITE_POST}">&larr; Back to the post</a>',
        '<div class="kicker">Interactive data dictionary</div>',
        f"<h1>{h(STUDY_TITLE)}</h1>", f'<p class="sub">{h(STUDY_SUB)}</p>',
        f'<div class="kpis">{kpi_html}</div>', "</div></header>",
        '<nav class="toc"><div class="wrap">',
        '<a href="#downloads">Downloads</a><a href="#load">Load in code</a>',
        '<a href="#overview">Overview</a><a href="#explorer">Variable explorer</a>',
        '<a href="#index">Cross-file index</a><a href="#formulas">Formulas</a>',
        '<a href="#datasets">Datasets</a><a href="#caveats">Caveats</a>',
        "</div></nav>", '<main class="wrap">',

        '<section id="downloads"><h2>Downloads</h2>',
        '<p class="lead">All data are free to download. Each dataset comes in two identical forms &mdash; '
        'Stata <code>.dta</code> (with embedded variable and value labels) and plain <code>.csv</code>.</p>',
        f'<p><a class="btn zip" href="./{ZIP_NAME}" download>&#8681; Download all data (ZIP)</a>'
        f'<a class="btn ghost" href="./stata_codebook.do" download>stata_codebook.do</a></p>',
        f'<div class="dl-grid">{dl_tbl}</div>',
        '<p class="note">Run <code>stata_codebook.do</code> in Stata once to attach long-form '
        'per-variable notes to the <code>.dta</code> files.</p></section>',

        '<section id="load"><h2>Load directly in code</h2>',
        '<p class="lead">Every file loads straight from this site &mdash; no manual download needed '
        '(except <code>pyreadstat</code>, which reads local files). Swap the file name to load any of '
        'the six datasets.</p>',
        "<h3>Stata</h3>", code_block(stata_code),
        "<h3>Python</h3>", code_block(python_code),
        "<h3>R</h3>", code_block(r_code), "</section>",

        '<section id="overview"><h2>Overview &amp; sources</h2>',
        f'<p class="lead">Companion data for the post <a href="{SITE_POST}">{h(STUDY_TITLE)}</a>, a '
        'Python replication of Lessmann &amp; Seidel (2017): predict regional GDP per capita from '
        'DMSP-OLS nighttime lights, build five population-weighted inequality indices, and estimate '
        'the spatial (regional) Kuznets curve and its determinants across up to 180 countries, '
        '1992&ndash;2012.</p>',
        '<div class="note"><strong>Panel structure.</strong> Region files are keyed by region '
        '&times; year over a 1,504-region / 81-country training frame (1992&ndash;2010); country '
        'files are keyed by <code>Country_ISO</code> &times; year over 180 countries '
        '(1992&ndash;2012). The country-file inequality indices are built from the predicted '
        'regional incomes in the region files.</div>',
        "<h3>Data sources</h3>", src_tbl, "</section>",

        '<section id="explorer"><h2>Variable explorer '
        '<span class="hint">search &amp; filter all 53 variables</span></h2>',
        '<p class="lead">Type to filter by name or label, or use the chips to filter by type. Each '
        'row shows a mini distribution of the variable. Click a column header to sort.</p>',
        _explorer(frames), "</section>",

        '<section id="index"><h2>Cross-file variable index</h2>',
        '<p class="lead">Which file each variable appears in (&#9679; = present).</p>',
        matrix_tbl, "</section>",

        '<section id="formulas"><h2>Construction &amp; formulas</h2>',
        CONSTRUCTION_FORMULAS_HTML, "</section>",

        '<section id="datasets"><h2>The six datasets</h2>',
        '<p class="lead">Switch datasets with the tabs. Each shows the full variable dictionary plus '
        'a sortable statistics table with mini distributions and data coverage.</p>',
        f'<div class="tabs">{tabs}</div>{panels}', "</section>",

        '<section id="caveats"><h2>Known limitations &amp; caveats</h2>',
        CAVEATS_HTML, "</section>", "</main>",
        f'<footer class="wrap">Generated by <code>make_stata.py</code> &middot; Stata format '
        f'<code>.dta</code> v{DTA_FORMAT} (Stata 14+) &middot; definitions follow Lessmann &amp; '
        f'Seidel (2017) &middot; <a href="{SITE_POST}">Back to the post</a></footer>',
        f"<script>{_PAGE_JS}</script>", "</body></html>",
    ]
    return "\n".join(out)


def build_zip(frames):
    out = os.path.join(BASE, ZIP_NAME)
    members = []
    for name in FILE_ORDER:
        members += [name[:-4] + ".dta", name[:-4] + ".csv"]
    members += ["README.md", "stata_codebook.do"]
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for fn in members:
            z.write(os.path.join(BASE, fn), arcname=fn)
    return out


def main():
    frames = {}
    print(f"Reading CSVs from {BASE}")
    for name in FILE_ORDER:
        df = load_csv(name)
        frames[name] = df
        out = write_dta(name, df)
        print(f"  wrote {os.path.basename(out)}  ({df.shape[0]:,} x {df.shape[1]})")

    with open(os.path.join(BASE, "README.md"), "w") as f:
        f.write(build_readme(frames))
    print("  wrote README.md")
    with open(os.path.join(BASE, "stata_codebook.do"), "w") as f:
        f.write(build_do(frames))
    print("  wrote stata_codebook.do")
    zpath = build_zip(frames)  # needs README.md + .do written above
    print(f"  wrote {os.path.basename(zpath)}")
    with open(os.path.join(BASE, "index.html"), "w") as f:
        f.write(build_html(frames))
    print("  wrote index.html")

    # ---- self-check: re-read each .dta, confirm shape + metadata ----------------------
    print("Verifying .dta files ...")
    for name in FILE_ORDER:
        base = name[:-4]
        path = os.path.join(BASE, base + ".dta")
        rdf, meta = pyreadstat.read_dta(path)
        csv = frames[name]
        assert rdf.shape == csv.shape, f"{base}: shape {rdf.shape} != csv {csv.shape}"
        assert all(meta.column_labels), f"{base}: a column is missing a label"
        for c in csv.columns:
            if c in DUMMIES:
                assert meta.variable_value_labels.get(c) == YESNO, f"{base}: {c} value labels wrong"
        # the .dta format release lives in the file header (<release>NNN</release>)
        with open(path, "rb") as fh:
            header = fh.read(80)
        rel = int(header.split(b"<release>")[1].split(b"</release>")[0])
        assert rel == DTA_FORMAT, f"{base}: .dta release {rel} != {DTA_FORMAT}"
        print(f"  ok  {base}.dta  release={rel}  label='{meta.file_label}'")
    print("All datasets verified.")


if __name__ == "__main__":
    main()
