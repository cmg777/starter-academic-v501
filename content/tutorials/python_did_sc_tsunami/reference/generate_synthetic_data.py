#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_synthetic_data.py
==========================

Generate a SYNTHETIC, teaching-oriented replication dataset for:

    Heger, M. P., & Neumayer, E. (2019). "The impact of the Indian Ocean
    tsunami on Aceh's long-term economic growth."
    Journal of Development Economics, 141, 102365.
    https://doi.org/10.1016/j.jdeveco.2019.06.008

WHY THIS EXISTS
---------------
The paper studies the 2004 Indian Ocean tsunami as a quasi-natural experiment
and estimates its causal effect on local economic growth using
difference-in-differences (DiD) and the synthetic control method, at two
geographic levels:
  * DISTRICTS (Kabupaten/Kota) -- annual GDP (oil & gas excluded), from the
    World Bank's INDO-DAPOER database.  Main analysis.
  * SUB-DISTRICTS (Kecamatan) -- annual night-lights luminosity (DMSP-OLS),
    used to capture the *intensity* (dose) of the flooding.

The original micro-data are licensed/confidential, so this script produces a
*calibrated synthetic* dataset.  The numbers are simulated, but the data-
generating process is tuned so that running the paper's regressions on it
reproduces the paper's headline FINDINGS -- the signs, the statistical
significance, and the approximate magnitudes of the key coefficients
(Tables 1-9 and Figures 2-7).  It is meant for *teaching the methods*, not for
drawing substantive conclusions about Aceh.

WHAT IT WRITES (all into the folder this script lives in)
---------------------------------------------------------
  1. aceh_tsunami_district_panel.csv               (district x year GDP panel)
  2. aceh_tsunami_district_data_dictionary.csv     (dictionary for #1)
  3. aceh_tsunami_subdistrict_panel.csv            (kecamatan x year night-lights panel)
  4. aceh_tsunami_subdistrict_data_dictionary.csv  (dictionary for #3)
  5. README.md                                     (narrative documentation)

HOW IT IS CALIBRATED (in one sentence)
--------------------------------------
We generate annual GROWTH RATES as
    growth = district_FE + year_FE + treatment_increment(city/rural, period)
             + Aceh-control spill-over + spatial shock + serial shock + noise
where the increments are set to the paper's reported DiD coefficients (the
city/rural split from Table 7 averages to Table 2; an inland>coastal spill-over
to non-flooded Aceh reproduces the "Aceh non-flooded" columns).  We then cumulate
into consistent levels.  A two-way fixed-effects DiD recovers those increments
column by column; the spatial & serial shocks (demeaned within groups, so they
do not move the point estimates) reproduce the paper's Conley spatial-HAC SEs.
See README.md for the full explanation and the variable reference.

USAGE
-----
    python generate_synthetic_data.py            # write the five files
    python generate_synthetic_data.py --validate # also run the key
                                                 # regressions and print the
                                                 # recovered coefficients next
                                                 # to the paper's targets
                                                 # (needs statsmodels)

The output is fully deterministic (fixed random seed).
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# 0. GLOBAL CONFIGURATION
# ---------------------------------------------------------------------------

SEED = 114                            # chosen so this single realised sample
                                      # cleanly exhibits the calibrated effects
                                      # across every table (a representative draw;
                                      # the data-generating process itself is
                                      # tuned to the paper -- see README sec. 4)
OUT_DIR = Path(__file__).resolve().parent

YEARS = list(range(1999, 2013))       # 14 years of *levels*  (1999..2012)
GROWTH_YEARS = list(range(2000, 2013))  # 13 years of *growth* (2000..2012)
BASE_YEAR = 2004                      # index/normalisation year used by paper

# District whose growth rates are unreliable for 2003-2006 (paper footnote 3).
MISSING_GROWTH_DISTRICT = "Subulussalam"
MISSING_GROWTH_YEARS = {2003, 2004, 2005, 2006}

# --- DiD treatment increments for DISTRICT GDP growth ------------------------
# Percentage-point increments (as proportions) added to the growth rate of
# treated districts, relative to the 2000-2002 baseline.  We reproduce the
# paper's HETEROGENEITY directly instead of imposing one pooled effect:
#
#   * City (Kota) vs rural (Kabupaten) flooded districts get DIFFERENT effects,
#     taken straight from the paper's Table 7, column 2 (treated vs the
#     spill-over-free Rest-of-Sumatra controls).  Because the 10 treated are
#     2 city + 8 rural, the population-weighted average reproduces Table 2's
#     pooled column exactly:  2005 (2*-0.0135+8*-0.0979)/10 = -0.0810;
#     recovery (2*0.139+8*0.0445)/10 = +0.0634; pre +0.0207; post +0.0121.
#   * The 2 flooded North-Sumatra islands (Nias/Tanahbala) were also hit by the
#     March-2005 Nias earthquake and received far less aid, so they show a
#     bigger 2005 loss and essentially no reconstruction boom (Table 5).
#
GDP_DELTA_CITY = {   # 2 flooded Kota  (Banda Aceh, Sabang) — Table 7 col. 2, "city"
    "baseline": 0.0000,
    "pre":      0.0075,   # 2003-04  (ns)
    "tsunami": -0.0135,   # 2005     -> cities barely contracted (aid hubs)  (ns)
    "recovery": 0.1390,   # 2006-08  -> cities rebounded hugely  (*)
    "postrec":  0.0004,   # 2009-12  (ns)
}
GDP_DELTA_RURAL = {  # 8 flooded Kabupaten — Table 7 col. 2, "rural"
    "baseline": 0.0000,
    "pre":      0.0240,   # 2003-04  (ns/*)
    "tsunami": -0.0979,   # 2005     -> rural (agriculture) contracted hard  (***)
    "recovery": 0.0445,   # 2006-08  -> modest, gradual recovery  (**)
    "postrec":  0.0150,   # 2009-12  (ns)
}
GDP_DELTA_NS = {     # 2 flooded North-Sumatra islands — robustness (Table 5)
    "baseline": 0.0000,
    "pre":      0.0000,
    "tsunami": -0.1190,   # 2005  -> tsunami + Nias earthquake, severe loss
    "recovery": -0.0200,  # 2006-08 -> remote, aid-starved: no boom
    "postrec":  0.0000,
}

# --- Spill-over to NON-flooded Aceh control districts ------------------------
# The reconstruction effort spilled into neighbouring non-flooded Aceh districts
# (the paper's SUTVA discussion), MORE so inland than on the coast.  Adding this
# to the Aceh non-flooded CONTROLS attenuates the "Aceh non-flooded" column of
# Tables 2/6/8 relative to the Rest-of-Sumatra column, exactly as the paper finds:
#   Table 2 col.3 recovery 0.0634-0.0332 = +0.030;  Table 6 col.3 (coastal Aceh
#   controls only) 0.0634-0.0191 = +0.044.  The averages over the 10 coastal /
#   3 inland Aceh controls give 0.0332, matching both columns.
ACEH_CTRL_SPILL_GDP = {     # added to Aceh non-flooded controls' GDP growth
    "recovery_coastal": 0.0191,
    "recovery_inland":  0.0802,
    "tsunami":          0.0055,   # tiny: makes col.3 2005 ~ -0.086 (paper -0.0864)
}
ACEH_CTRL_SPILL_POP_RECOV = -0.0300  # their population grew slower (out/in-migration),
                                     # so their GDP-per-capita ALSO rose: this makes
                                     # Table 8 col.3 (per-capita vs Aceh controls) ~ +0.024 (ns)

# --- Population growth increments for FLOODED districts -----------------------
# GDP-PER-CAPITA growth = gdp_growth - pop_growth.  The 2005 death shock makes
# GDP and population fall together (no per-capita loss); the slower recovery-
# period population growth makes per-capita output rise MORE than total GDP.
POP_DELTA = {
    "baseline":  0.0000,  # 2000-2002
    "pre":       0.0000,  # 2003-2004
    "tsunami":  -0.0956,  # 2005  -> ~9.6% population fall from casualties (pc 2005 ~ ns)
    "recovery": -0.0237,  # 2006-2008 -> pc recovery 0.0634-(-0.0237)=+0.087 (Table 8 col.2)
    "postrec":   0.0000,  # 2009-2012
}
# The population shock is the same for flooded city and rural districts.

# --- Serially-correlated district error component (for honest standard errors)
# The paper reports Conley spatial-HAC standard errors adjusted for SERIAL
# correlation within a district over time.  The tell-tale sign is that the
# 2006-08 recovery SE (~0.025) is as large as the one-year 2005 SE (~0.028)
# DESPITE spanning three years — i.e. the reconstruction shock is strongly
# correlated across a district's recovery years, so averaging over them does not
# shrink the SE.  We reproduce this by adding one shock per (district x period),
# shared across the years of that period, drawn from a SEPARATE `serial_rng`.
# The shock is DEMEANED within each treatment/control group per period, so it
# inflates the standard errors WITHOUT moving the calibrated point estimates
# (the group means that the DiD compares are left untouched).  SDs are largest
# for the recovery and tsunami periods, matching the paper's SE pattern.
SERIAL_SEED = 2004
SERIAL_SD = {
    "baseline": 0.012,
    "pre":      0.033,   # 2003-04 SE target ~0.013
    "tsunami":  0.072,   # 2005    SE target ~0.028
    "recovery": 0.081,   # 2006-08 SE target ~0.025 (≈ the 2005 SE, the paper's pattern)
    "postrec":  0.040,   # 2009-12 SE target ~0.010
}
SERIAL_SD_POP = 0.018    # smaller serial component for population growth

# --- DiD treatment increments for SUB-DISTRICT night-lights growth -----------
# Added to FLOODED kecamatans, proportional to their flood "dose" in (0, 1].
# The paper's Table 3 regresses night-lights growth on the two CONTINUOUS
# intensity measures (share of population flooded, share of area flooded).  A
# regression of (theta*dose) on (scale*dose) recovers the coefficient theta/scale,
# so we set theta and the scales to reproduce Table 3's coefficients directly:
#   share-of-population: pre +0.005, 2005 -0.0077(*), 2006-08 +0.0160(***), post +0.002
#   share-of-area:       pre +0.46,  2005 -0.66(ns),  2006-08 +1.752(***), post +0.19
# (NB: theta ~ coef * SHARE_POP_SCALE.)  The right-skewed dose distribution makes
# the growth advantage concentrate in the most heavily-flooded sub-districts, so
# only the TOP intensity quintile is significant in Table 4.
NL_THETA = {
    "baseline":  0.0000,  # 2000-2002
    "pre":       0.0056,  # 2003-2004  -> share-pop ~ +0.005  (ns)
    "tsunami":  -0.0087,  # 2005       -> share-pop ~ -0.0077 (*) ; share-area ns
    "recovery":  0.0180,  # 2006-2008  -> share-pop ~ +0.016 (***); share-area ~ +1.75 (***)
    "postrec":   0.0022,  # 2009-2012  -> share-pop ~ +0.002  (ns)
}
# Scale factors turning the latent dose into the two continuous intensity
# regressors.  share_area is a TINY fraction (a tsunami floods a thin coastal
# strip), so its coefficient is ~110x the share-of-population coefficient,
# exactly as in the paper (1.752 vs 0.0160).
SHARE_POP_SCALE = 0.62
SHARE_AREA_SCALE = 0.00566        # = SHARE_POP_SCALE * 0.0160 / 1.752

# Night lights are generated from their OWN rng (so the sub-district draw can be
# seed-searched for a clean parallel-trends pattern independently of the GDP
# panel).  A fixed number of kecamatan-year growth observations are then dropped
# at random (sensor gaps / missing DMSP composites) to bring the night-lights
# regression N to the paper's 3,444 (from 276 * 13 = 3,588).
NL_SEED = 24                      # rng seed for the sub-district night-lights panel
NL_REG_N = 3444                   # target night-lights regression N (paper Tables 3-4)

# Noise levels (standard deviations) -- tuned so the SIGNIFICANCE pattern
# matches the paper.  Point estimates are fixed by the increments above; these
# only affect the standard errors and the point-estimate scatter.
SIGMA_GDP_GROWTH = 0.040
SIGMA_POP_GROWTH = 0.008
SIGMA_NL_GROWTH = 0.005   # low: night-lights intensity coefficients are precisely
                          # estimated in the paper (t~6) despite a low overall R^2

# Counts that pin down the panels (verified against the paper, see README).
N_SUBDISTRICTS = 276
N_SUBDISTRICTS_FLOODED = 68


def period_of(year: int) -> str:
    """Map a (growth) year to its DiD period label."""
    if year <= 2002:
        return "baseline"
    if year <= 2004:
        return "pre"
    if year == 2005:
        return "tsunami"
    if year <= 2008:
        return "recovery"
    return "postrec"


# ---------------------------------------------------------------------------
# 1. DISTRICT METADATA  (125 districts on Sumatra)
# ---------------------------------------------------------------------------
#   Aceh (23):           10 flooded (treated)  + 13 non-flooded (control)
#   North Sumatra (26):   2 flooded islands     + 24 non-flooded (robustness)
#   Rest of Sumatra (76): controls in 8 provinces
# The flood / Kota / coastal assignments reproduce the sample sizes the paper
# reports in Tables 2, 5, 7 and 8 (see README for the arithmetic).

# (name, type, flooded, coastal, neighbour_of_flooded)
_ACEH = [
    # --- 10 flooded (treated): 2 Kota + 8 Kabupaten, all coastal ---
    ("Banda Aceh",       "Kota",       1, 1, 0),
    ("Sabang",           "Kota",       1, 1, 0),
    ("Aceh Besar",       "Kabupaten",  1, 1, 0),
    ("Aceh Jaya",        "Kabupaten",  1, 1, 0),
    ("Aceh Barat",       "Kabupaten",  1, 1, 0),
    ("Nagan Raya",       "Kabupaten",  1, 1, 0),
    ("Aceh Barat Daya",  "Kabupaten",  1, 1, 0),
    ("Aceh Selatan",     "Kabupaten",  1, 1, 0),
    ("Simeulue",         "Kabupaten",  1, 1, 0),
    ("Aceh Singkil",     "Kabupaten",  1, 1, 0),
    # --- 13 non-flooded (control): 3 Kota + 10 Kabupaten ---
    ("Pidie",            "Kabupaten",  0, 1, 1),   # coastal, borders flooded
    ("Pidie Jaya",       "Kabupaten",  0, 1, 1),   # coastal, borders flooded
    ("Bireuen",          "Kabupaten",  0, 1, 1),   # coastal, borders flooded
    ("Aceh Utara",       "Kabupaten",  0, 1, 0),   # coastal
    ("Aceh Timur",       "Kabupaten",  0, 1, 0),   # coastal
    ("Aceh Tamiang",     "Kabupaten",  0, 1, 0),   # coastal
    ("Lhokseumawe",      "Kota",       0, 1, 0),   # coastal
    ("Langsa",           "Kota",       0, 1, 0),   # coastal
    ("Aceh Tengah",      "Kabupaten",  0, 0, 1),   # inland highland, borders flooded
    ("Bener Meriah",     "Kabupaten",  0, 0, 0),   # inland highland
    ("Gayo Lues",        "Kabupaten",  0, 0, 1),   # inland highland, borders flooded
    ("Aceh Tenggara",    "Kabupaten",  0, 1, 0),   # SE Alas valley; counted coastal to match the paper's Table-6 sample
    ("Subulussalam",     "Kota",       0, 1, 1),   # SW coastal plain; missing-growth district (paper footnote 3)
]

# Rest-of-Sumatra control provinces and how many districts each contributes
# (totals to 76; the exact split only needs to sum to 76).
_REST_PROVINCES = [
    ("Sumatera Barat",                "SUMBAR", 12),
    ("Riau",                          "RIAU",   10),
    ("Kepulauan Riau",                "KEPRI",   5),
    ("Jambi",                         "JAMBI",   9),
    ("Bengkulu",                      "BENGKULU", 9),
    ("Sumatera Selatan",              "SUMSEL", 13),
    ("Kepulauan Bangka Belitung",     "BABEL",   6),
    ("Lampung",                       "LAMPUNG", 12),
]
N_REST_KOTA = 18          # Table 7: 18 non-flooded city districts in rest of Sumatra
N_REST_COASTAL = 53       # Table 6: 53 coastal rest-of-Sumatra controls -> col2 = 63*13 = 819

# ---------------------------------------------------------------------------
# GEOGRAPHY  (added to enable Conley spatial standard errors)
# ---------------------------------------------------------------------------
# Coordinates are drawn from a SEPARATE rng so the main draw sequence — and thus
# the calibrated GDP/population/night-lights results — is left untouched.
GEO_SEED = 26122004          # rng for coordinate jitter (independent of the main rng)
SPATIAL_SEED = 44            # rng for the spatial error field on GDP growth (chosen by search)
# A spatially-correlated component is ADDED to GDP growth so that the data
# genuinely exhibits spatial autocorrelation — without it, Conley spatial SEs
# would (correctly) equal the naive SEs and the spatial-SE lesson would be empty.
# SPATIAL_SD is kept modest and SPATIAL_SEED=44 was chosen by a search so the
# difference-in-differences coefficients still reproduce the paper (2005 ≈ -0.081,
# recovery ≈ +0.05, pre/post ≈ 0) while Conley SEs are visibly larger than naive
# (the recovery-period SE inflates ~20%). The field is drawn from its own rng, so
# the night-lights and structural-change results are completely unaffected.
SPATIAL_SD = 0.020           # SD of the added spatial growth shock
SPATIAL_RANGE_KM = 130.0     # distance-decay range of the spatial field

# Real approximate centroids (lat, lon) for Aceh's 23 districts — coastal units on
# the coast, the Gayo highland districts inland, Simeulue/Sabang offshore.
_ACEH_COORDS = {
    "Banda Aceh": (5.55, 95.32),   "Sabang": (5.82, 95.32),
    "Aceh Besar": (5.45, 95.50),   "Aceh Jaya": (4.85, 95.55),
    "Aceh Barat": (4.45, 96.15),   "Nagan Raya": (4.15, 96.45),
    "Aceh Barat Daya": (3.85, 96.85), "Aceh Selatan": (3.15, 97.30),
    "Simeulue": (2.60, 96.10),     "Aceh Singkil": (2.35, 97.85),
    "Pidie": (5.10, 95.95),        "Pidie Jaya": (5.15, 96.20),
    "Bireuen": (5.20, 96.70),      "Aceh Utara": (5.00, 97.15),
    "Aceh Timur": (4.65, 97.70),   "Aceh Tamiang": (4.25, 98.00),
    "Lhokseumawe": (5.18, 97.15),  "Langsa": (4.47, 97.97),
    "Aceh Tengah": (4.55, 96.85),  "Bener Meriah": (4.75, 96.90),
    "Gayo Lues": (3.95, 97.40),    "Aceh Tenggara": (3.35, 97.70),
    "Subulussalam": (2.65, 97.95),
}
# Approximate bounding boxes (lat_min, lat_max, lon_min, lon_max) for the
# provinces that host the SYNTHETIC control districts.
_PROVINCE_BBOX = {
    "North Sumatra":              (1.2, 4.0, 97.7, 100.0),
    "Sumatera Barat":             (-3.2, 0.8, 98.7, 101.4),
    "Riau":                       (-1.1, 2.4, 100.2, 103.5),
    "Kepulauan Riau":             (-0.8, 4.3, 103.6, 108.5),
    "Jambi":                      (-2.7, -0.8, 101.2, 104.4),
    "Bengkulu":                   (-5.2, -2.3, 101.0, 103.4),
    "Sumatera Selatan":           (-4.8, -1.5, 102.2, 106.0),
    "Kepulauan Bangka Belitung":  (-3.6, -1.6, 105.2, 108.6),
    "Lampung":                    (-5.9, -3.8, 103.6, 105.9),
}
# The two flooded North-Sumatra island districts sit off the west coast.
_ISLAND_COORDS = {"Nias": (1.10, 97.50), "Tanahbala": (0.35, 98.40)}


def _haversine_km(lat1, lon1, lat2, lon2):
    """Great-circle distance in km between two arrays/points of coordinates."""
    r = 6371.0
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(np.asarray(lat2) - np.asarray(lat1))
    dlmb = np.radians(np.asarray(lon2) - np.asarray(lon1))
    a = np.sin(dphi / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dlmb / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(np.clip(a, 0, 1)))


def _haversine_matrix(lat, lon):
    """n×n matrix of pairwise great-circle distances (km)."""
    lat = np.asarray(lat, float); lon = np.asarray(lon, float)
    return _haversine_km(lat[:, None], lon[:, None], lat[None, :], lon[None, :])


def build_district_metadata(rng: np.random.Generator) -> pd.DataFrame:
    rows = []

    # ---- Aceh (23) ----
    for i, (name, dtype, flooded, coastal, nb) in enumerate(_ACEH, start=1):
        rows.append(dict(
            district_id=f"ACEH_D{i:02d}",
            district_name=name,
            province="Aceh",
            region_group="Aceh",
            district_type=dtype,
            coastal=coastal,
            flooded=flooded,
            neighbour_of_flooded=nb,
        ))

    # ---- North Sumatra (26): 2 flooded barrier islands + 24 controls ----
    ns_names = {1: "Nias", 2: "Tanahbala"}   # the two tsunami-struck island districts
    for i in range(1, 27):
        flooded = 1 if i <= 2 else 0
        name = ns_names.get(i, f"North Sumatra District {i}")
        dtype = "Kota" if (3 <= i <= 7) else "Kabupaten"   # a handful of cities
        coastal = 1 if (flooded or i % 2 == 0) else 0
        rows.append(dict(
            district_id=f"SUMUT_D{i:02d}",
            district_name=name,
            province="North Sumatra",
            region_group="North Sumatra",
            district_type=dtype,
            coastal=coastal,
            flooded=flooded,
            neighbour_of_flooded=1 if i in (3, 4) else 0,  # neighbours of Nias
        ))

    # ---- Rest of Sumatra (76): EXACTLY N_REST_KOTA Kota and N_REST_COASTAL
    # coastal, spread evenly across provinces (the counts pin Tables 6 & 7's N).
    rest_specs = [(prov_name, abbr, j)
                  for prov_name, abbr, count in _REST_PROVINCES
                  for j in range(1, count + 1)]
    n_rest = len(rest_specs)                         # 76

    def _spread(n_total: int, k: int) -> set:
        """k evenly-spaced, guaranteed-distinct indices in [0, n_total)."""
        return set(np.floor(np.linspace(0, n_total, k, endpoint=False)).astype(int).tolist())

    kota_pos = _spread(n_rest, N_REST_KOTA)          # 18 Kota
    inland_pos = _spread(n_rest, n_rest - N_REST_COASTAL)  # 23 inland -> 53 coastal
    for k, (prov_name, abbr, j) in enumerate(rest_specs):
        rows.append(dict(
            district_id=f"{abbr}_D{j:02d}",
            district_name=f"{prov_name} District {j}",
            province=prov_name,
            region_group="Rest of Sumatra",
            district_type="Kota" if k in kota_pos else "Kabupaten",
            coastal=0 if k in inland_pos else 1,
            flooded=0,
            neighbour_of_flooded=0,
        ))

    meta = pd.DataFrame(rows)

    # treatment-group label (handy for selecting each table's estimation sample)
    def _grp(r):
        if r.flooded:
            return "Treated (flooded)"
        return {
            "Aceh": "Control: Aceh non-flooded",
            "North Sumatra": "Control: North Sumatra",
            "Rest of Sumatra": "Control: Rest of Sumatra",
        }[r.region_group]
    meta["flood_treatment_group"] = meta.apply(_grp, axis=1)

    # ---- time-invariant economic size drawn once per district ----
    n = len(meta)
    # population in 1999 (persons); Aceh districts smaller, big mainland districts larger
    base_pop = np.where(meta.region_group.eq("Aceh"),
                        rng.lognormal(mean=np.log(160_000), sigma=0.55, size=n),
                        rng.lognormal(mean=np.log(380_000), sigma=0.60, size=n))
    base_pop = np.where(meta.district_type.eq("Kota"), base_pop * 0.7, base_pop)
    meta["_pop1999"] = np.round(base_pop).astype(int)

    # GDP per capita in 1999 (constant 2004 USD); cities richer, oil&gas excluded
    base_pc = rng.lognormal(mean=np.log(950.0), sigma=0.35, size=n)
    base_pc = np.where(meta.district_type.eq("Kota"), base_pc * 1.6, base_pc)
    meta["_gdppc1999"] = base_pc
    # GDP in 1999 (million constant 2004 USD)
    meta["_gdp1999"] = meta["_pop1999"] * meta["_gdppc1999"] / 1e6

    # ---- geographic coordinates (separate rng → main sequence untouched) ----
    geo_rng = np.random.default_rng(GEO_SEED)
    lats, lons = [], []
    for _, r in meta.iterrows():
        if r.region_group == "Aceh":
            la, lo = _ACEH_COORDS[r.district_name]                    # real centroid
        elif r.district_name in _ISLAND_COORDS:
            la, lo = _ISLAND_COORDS[r.district_name]                  # Nias / Tanahbala
        else:
            lo_min_la, hi_la, lo_lo, hi_lo = (_PROVINCE_BBOX[r.province][0],
                                              _PROVINCE_BBOX[r.province][1],
                                              _PROVINCE_BBOX[r.province][2],
                                              _PROVINCE_BBOX[r.province][3])
            la = geo_rng.uniform(lo_min_la, hi_la)
            lo = geo_rng.uniform(lo_lo, hi_lo)
            # nudge coastal units a touch toward the box edge (rough coastline)
            if r.coastal:
                lo = lo - 0.25 * (hi_lo - lo_lo) * geo_rng.uniform(0.2, 0.8)
        lats.append(round(float(la), 4))
        lons.append(round(float(lo), 4))
    meta["latitude"] = lats
    meta["longitude"] = lons

    return meta


# ---------------------------------------------------------------------------
# 2. DISTRICT GDP PANEL
# ---------------------------------------------------------------------------

def _year_effects(rng: np.random.Generator, gfc_year: int, gfc_dip: float,
                  sigma: float) -> dict:
    """Common (year fixed-effect) growth deviations, mean ~0, with a GFC dip."""
    eff = {y: float(rng.normal(0.0, sigma)) for y in GROWTH_YEARS}
    eff[gfc_year] += gfc_dip            # 2009 global financial crisis
    mean = np.mean(list(eff.values()))
    return {y: v - mean for y, v in eff.items()}   # recentre to mean 0


def simulate_district_panel(meta: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    n = len(meta)
    idx = {d: i for i, d in enumerate(meta.district_id)}

    # district fixed effects (average growth) and common year effects
    mu_gdp = rng.normal(0.050, 0.012, n)
    mu_pop = rng.normal(0.018, 0.004, n)
    # Equalise MEAN baseline growth across the treated and control groups so the
    # raw GDP paths share parallel pre-trends (a clean Fig. 2 / synthetic-control
    # Fig. 3).  District fixed effects absorb mu entirely, so this leaves every
    # DiD coefficient unchanged; it only removes a chance level gap between groups.
    grp = (meta.flooded.astype(str) + "|" + meta.region_group).to_numpy()
    for gname in np.unique(grp):
        gm = grp == gname
        mu_gdp[gm] = mu_gdp[gm] - mu_gdp[gm].mean() + 0.050
    yr_gdp = _year_effects(rng, gfc_year=2009, gfc_dip=-0.012, sigma=0.008)
    yr_pop = _year_effects(rng, gfc_year=2005, gfc_dip=0.000, sigma=0.002)

    flooded = meta.flooded.to_numpy()

    # ---- province-level structural-change & capital-formation targets ----
    struct = _structural_targets(meta, rng)

    # Treatment/control groups that the DiD compares (flooded x region x
    # city/rural).  We DEMEAN both error components below WITHIN these groups so
    # they inflate standard errors without shifting any DiD point estimate (which
    # compares group means).  Every table's control pool is a union of these
    # groups, so every coefficient is left exactly on its calibrated target.
    grp_key = (meta.flooded.astype(str) + "|" + meta.region_group + "|"
               + np.where(meta.district_type.eq("Kota"), "K", "R")).to_numpy()
    grp_masks = [grp_key == g for g in np.unique(grp_key)]

    def _demean_groups(v: np.ndarray) -> np.ndarray:
        v = v.copy()
        for gm in grp_masks:
            v[gm] = v[gm] - v[gm].mean()
        return v

    # ---- spatially-correlated GDP growth shock (separate rng) ----------------
    # Smooth a field of iid shocks over space with a distance-decay kernel so
    # NEARBY districts share growth shocks (Tobler's first law) — this is what
    # makes Conley spatial standard errors exceed the naive/clustered ones.  The
    # field is demeaned within groups EACH YEAR: the cross-district spatial
    # gradient survives (positive Moran's I, larger Conley SEs), but the treated
    # group's spatial mean — which would otherwise bias the clustered treated
    # coefficients — is removed.  Drawn from its own rng (calibration untouched).
    spatial_rng = np.random.default_rng(SPATIAL_SEED)
    _Dkm = _haversine_matrix(meta["latitude"].to_numpy(), meta["longitude"].to_numpy())
    _K = np.exp(-_Dkm / SPATIAL_RANGE_KM)
    _K = _K / _K.sum(axis=1, keepdims=True)
    spatial_field = {}
    for y in GROWTH_YEARS:
        s = _K @ spatial_rng.normal(0.0, 1.0, n)
        spatial_field[y] = _demean_groups(s / s.std() * SPATIAL_SD)

    # ---- serially-correlated (district x period) growth shocks (separate rng)
    # One shock per district per DiD period, shared across that period's years
    # (so it does NOT average away over the recovery window — the source of the
    # paper's inflated recovery-period standard error).  Also demeaned within
    # groups, so it inflates the (clustered / Conley-HAC) standard errors while
    # leaving every point estimate on target.  Separate rng -> night-lights and
    # structural calibration untouched.
    serial_rng = np.random.default_rng(SERIAL_SEED)
    PERIODS = ["baseline", "pre", "tsunami", "recovery", "postrec"]
    serial_gdp: dict[str, np.ndarray] = {}
    serial_pop: dict[str, np.ndarray] = {}
    for p in PERIODS:
        serial_gdp[p] = _demean_groups(serial_rng.normal(0.0, SERIAL_SD[p], n))
        serial_pop[p] = _demean_groups(serial_rng.normal(0.0, SERIAL_SD_POP, n))

    records = []
    for did, row in meta.iterrows():
        i = idx[row.district_id]
        is_f = int(row.flooded)
        region = row.region_group
        is_kota = (row.district_type == "Kota")
        is_coastal = int(row.coastal)
        # GDP treatment-increment schedule for this treated district (by type),
        # taken from Table 7 col. 2 (city/rural) so the pooled effect = Table 2.
        if is_f:
            sched = (GDP_DELTA_NS if region == "North Sumatra"
                     else GDP_DELTA_CITY if is_kota else GDP_DELTA_RURAL)

        # 1) annual growth rates (2000-2012).  Each district's growth = district
        #    FE + year FE + (treatment increment OR control spill-over) + spatial
        #    shock + serial shock + idiosyncratic noise.
        g_gdp, g_pop = {}, {}
        for y in GROWTH_YEARS:
            p = period_of(y)
            if is_f:                                   # treated districts
                inc_gdp = sched[p]
                inc_pop = POP_DELTA[p]
            else:                                      # control districts
                inc_gdp, inc_pop = 0.0, 0.0
                if region == "Aceh":                   # reconstruction spill-over
                    if p == "recovery":
                        inc_gdp = ACEH_CTRL_SPILL_GDP[
                            "recovery_coastal" if is_coastal else "recovery_inland"]
                        inc_pop = ACEH_CTRL_SPILL_POP_RECOV
                    elif p == "tsunami":
                        inc_gdp = ACEH_CTRL_SPILL_GDP["tsunami"]
            g_gdp[y] = (mu_gdp[i] + yr_gdp[y] + inc_gdp
                        + spatial_field[y][i] + serial_gdp[p][i]
                        + rng.normal(0.0, SIGMA_GDP_GROWTH))
            g_pop[y] = (mu_pop[i] + yr_pop[y] + inc_pop
                        + serial_pop[p][i]
                        + rng.normal(0.0, SIGMA_POP_GROWTH))

        # 2) cumulate to levels around the 1999 base
        gdp = {1999: row._gdp1999}
        pop = {1999: float(row._pop1999)}
        for y in GROWTH_YEARS:
            gdp[y] = gdp[y - 1] * (1.0 + g_gdp[y])
            pop[y] = pop[y - 1] * (1.0 + g_pop[y])

        # 3) covariates & structural composition for every year
        st = struct[row.district_id]
        for y in YEARS:
            gdp_pc = gdp[y] * 1e6 / pop[y]
            growth_missing = (row.district_name == MISSING_GROWTH_DISTRICT
                              and y in MISSING_GROWTH_YEARS)
            rec = dict(
                district_id=row.district_id,
                district_name=row.district_name,
                province=row.province,
                region_group=row.region_group,
                district_type=row.district_type,
                coastal=int(row.coastal),
                flooded=int(row.flooded),
                neighbour_of_flooded=int(row.neighbour_of_flooded),
                flood_treatment_group=row.flood_treatment_group,
                latitude=float(row.latitude),
                longitude=float(row.longitude),
                year=y,
                post=int(y >= 2005),
                period=(period_of(y) if y >= 2000 else "(base year)"),
                gdp_const_usd_m=round(gdp[y], 3),
                gdp_growth=(np.nan if (y == 1999 or growth_missing) else round(g_gdp[y], 5)),
                population=int(round(pop[y])),
                pop_growth=(np.nan if (y == 1999 or growth_missing) else round(g_pop[y], 5)),
                gdp_pc_usd=round(gdp_pc, 2),
                gdp_pc_growth=(np.nan if (y == 1999 or growth_missing)
                               else round(g_gdp[y] - g_pop[y], 5)),
                va_agri_share=round(st["agri"][y], 3),
                va_manu_share=round(st["manu"][y], 3),
                va_serv_share=round(st["serv"][y], 3),
                capital_formation_pc_usd=round(st["capform"][y], 2),
                poverty_rate=round(st["poverty"][y], 2),
                doctors_per_1000=round(st["doctors"][y], 3),
                water_access_pct=round(st["water"][y], 2),
                sanitation_access_pct=round(st["sanitation"][y], 2),
                electricity_access_pct=round(st["electricity"][y], 2),
                hdi=round(st["hdi"][y], 2),
            )
            records.append(rec)

    return pd.DataFrame.from_records(records)


def _structural_targets(meta: pd.DataFrame, rng: np.random.Generator) -> dict:
    """
    Province-level trajectories for sectoral value-added shares, capital
    formation and socio-economic covariates, disaggregated to districts so the
    province average returns the target.  Aceh (the treated province) shows the
    sharp post-2004 structural break of Figures 4-7; donor provinces evolve
    smoothly so a province-level synthetic control reproduces the counterfactual.
    """
    yrs = np.array(YEARS)
    t = yrs - BASE_YEAR                     # 0 in 2004
    post = np.clip(yrs - 2004, 0, None)     # years since the tsunami

    def aceh_series():
        agri = np.where(yrs <= 2004, 44.0 + (2004 - yrs) * 0.4, 44.0 - post * 1.5)
        manu = np.where(yrs <= 2004, 6.0 + (2004 - yrs) * 0.1, 6.0 - post * 0.31)
        serv = np.where(yrs <= 2004, 40.0 - (2004 - yrs) * 0.4, 40.0 + post * 1.9)
        # capital formation per capita (current USD): gradual pre, spike 2005-08
        capform = 15.0 + np.maximum(t, -5) * 0.0  # placeholder, filled below
        base = 60.0 + (yrs - 2004) * 12.0          # smooth underlying path
        # reconstruction investment surge: ZERO through 2004, then ramps from
        # 2005, peaks 2006, and fades — so the pre-tsunami years match donors
        # (clean synthetic-control pre-fit for Fig. 7).  Index 5 = 2004.
        spike = np.array([0, 0, 0, 0, 0, 0, 18, 110, 75, 40, 30, 28, 24, 22], float)
        capform = np.clip(base, 8, None) + spike
        return agri, manu, serv, capform

    def donor_series(level_shift, slope):
        agri = (44.0 + level_shift) - np.clip(yrs - 1999, 0, None) * (0.2 + slope)
        manu = np.clip(6.0 + level_shift * 0.3 - (yrs - 1999) * 0.05, 2, None)
        serv = 40.0 - level_shift + np.clip(yrs - 1999, 0, None) * (0.35 + slope)
        capform = np.clip(55.0 + (yrs - 2004) * 11.0 + level_shift, 8, None)
        return agri, manu, serv, capform

    # one trajectory per province
    prov_series = {}
    provinces = meta.province.unique().tolist()
    for p in provinces:
        if p == "Aceh":
            prov_series[p] = aceh_series()
        else:
            shift = rng.uniform(-12, 8)
            slope = rng.uniform(-0.05, 0.10)
            prov_series[p] = donor_series(shift, slope)

    out = {}
    for _, row in meta.iterrows():
        p = row.province
        agri, manu, serv, capform = prov_series[p]
        # district offset by type (cities: less agriculture, more services)
        if row.district_type == "Kota":
            d_off = -18.0
        else:
            d_off = +4.0
        d_off += rng.normal(0, 3.0)

        agri_d = np.clip(agri + d_off + rng.normal(0, 1.0, len(yrs)), 3, 80)
        serv_d = np.clip(serv - d_off + rng.normal(0, 1.0, len(yrs)), 10, 85)
        manu_d = np.clip(manu + rng.normal(0, 0.6, len(yrs)), 1, 40)
        capform_d = np.clip(capform * rng.uniform(0.8, 1.2)
                            + rng.normal(0, 4, len(yrs)), 2, None)

        # socio-economic covariates (levels; Aceh improves markedly after 2005)
        aceh_boost = 1.0 if p == "Aceh" else 0.0
        poverty = np.clip(
            (22 + 8 * aceh_boost) - (yrs - 1999) * 0.7
            - post * 0.6 * aceh_boost + rng.normal(0, 1.5, len(yrs)), 4, 45)
        doctors = np.clip(
            0.20 + (yrs - 1999) * 0.018 + post * 0.010 * aceh_boost
            + rng.normal(0, 0.02, len(yrs)), 0.05, 2.5)
        water = np.clip(
            58 + (yrs - 1999) * 1.4 + post * 0.8 * aceh_boost
            + rng.normal(0, 2, len(yrs)), 25, 99)
        sanitation = np.clip(
            48 + (yrs - 1999) * 1.6 + post * 0.9 * aceh_boost
            + rng.normal(0, 2, len(yrs)), 20, 99)
        electricity = np.clip(
            np.where(p == "Aceh",
                     84 + post * (13.0 / 8.0),               # 84 (2004) -> 97 (2012)
                     78 + (yrs - 1999) * 1.5)
            + rng.normal(0, 1.2, len(yrs)), 40, 100)
        hdi = np.clip(
            np.where(p == "Aceh",
                     67 + (yrs - 1999) * 0.3 + post * 0.25,   # ~69 -> ~73
                     66 + (yrs - 1999) * 0.45)
            + rng.normal(0, 0.6, len(yrs)), 55, 85)

        ymap = lambda arr: {y: float(v) for y, v in zip(YEARS, arr)}
        out[row.district_id] = dict(
            agri=ymap(agri_d), manu=ymap(manu_d), serv=ymap(serv_d),
            capform=ymap(capform_d), poverty=ymap(poverty), doctors=ymap(doctors),
            water=ymap(water), sanitation=ymap(sanitation),
            electricity=ymap(electricity), hdi=ymap(hdi),
        )
    return out


# ---------------------------------------------------------------------------
# 3. SUB-DISTRICT (KECAMATAN) NIGHT-LIGHTS PANEL
# ---------------------------------------------------------------------------

def build_subdistrict_metadata(meta_districts: pd.DataFrame,
                               rng: np.random.Generator) -> pd.DataFrame:
    """276 Aceh kecamatans, 68 of them flooded, each linked to a parent district."""
    aceh = meta_districts[meta_districts.region_group.eq("Aceh")].copy()
    # distribute 276 kecamatans across the 23 Aceh districts
    base = N_SUBDISTRICTS // len(aceh)
    counts = {d: base for d in aceh.district_name}
    for d in list(aceh.district_name)[: N_SUBDISTRICTS - base * len(aceh)]:
        counts[d] += 1

    # how many flooded kecamatans each district gets (more in flooded/coastal)
    weight = aceh.assign(
        w=lambda d: np.where(d.flooded == 1, 6.0,
                             np.where(d.coastal == 1, 1.6, 0.15)))
    w = weight.set_index("district_name")["w"]
    raw = {d: counts[d] * w[d] for d in counts}
    tot = sum(raw.values())
    flood_counts = {d: int(round(N_SUBDISTRICTS_FLOODED * raw[d] / tot)) for d in raw}
    # fix rounding so the flooded total is exactly 68 (and <= count per district)
    for d in flood_counts:
        flood_counts[d] = min(flood_counts[d], counts[d])
    diff = N_SUBDISTRICTS_FLOODED - sum(flood_counts.values())
    order = sorted(counts, key=lambda d: -w[d])
    j = 0
    while diff != 0:
        d = order[j % len(order)]
        if diff > 0 and flood_counts[d] < counts[d]:
            flood_counts[d] += 1; diff -= 1
        elif diff < 0 and flood_counts[d] > 0:
            flood_counts[d] -= 1; diff += 1
        j += 1

    rows = []
    k = 0
    abbr = lambda s: s.replace(" ", "")
    for d in aceh.district_name:
        nf = flood_counts[d]
        for j in range(1, counts[d] + 1):
            k += 1
            is_flooded = 1 if j <= nf else 0
            # latent flood "dose": most flooded kecamatans lightly hit, a few
            # devastated (right-skewed) -> the growth advantage concentrates in
            # the top quintile (reproduces Table 4).
            dose = float(np.clip(rng.beta(1.3, 3.4), 0.02, 1.0)) if is_flooded else 0.0
            area = float(np.clip(rng.lognormal(np.log(180), 0.6), 30, 1500))  # km^2
            rows.append(dict(
                kecamatan_id=f"KEC_{k:03d}",
                kecamatan_name=f"{abbr(d)}_Kec_{j:02d}",
                district_name=d,
                province="Aceh",
                flooded=is_flooded,
                _dose=dose,
                area_km2=round(area, 1),
                n_pixels=int(round(area / 0.86)),   # ~0.86 km^2 per 30-arcsec pixel
            ))
    sub = pd.DataFrame(rows)

    # continuous intensity measures derived from the latent dose.  share_area is
    # tiny, so its measurement noise is scaled down to match (else attenuation
    # would shrink the ~1.75 coefficient).
    noise_pop = rng.normal(0, 0.03, len(sub))
    noise_area = rng.normal(0, 0.0004, len(sub))
    sub["share_pop_flooded"] = np.where(
        sub.flooded == 1,
        np.clip(sub._dose * SHARE_POP_SCALE + noise_pop, 0.001, 1.0), 0.0).round(4)
    sub["share_area_flooded"] = np.where(
        sub.flooded == 1,
        np.clip(sub._dose * SHARE_AREA_SCALE + noise_area, 0.0001, 1.0), 0.0).round(5)

    # quintiles of the flooding-intensity distribution among flooded units
    sub["flood_intensity_quintile"] = 0
    fl = sub.flooded == 1
    sub.loc[fl, "flood_intensity_quintile"] = (
        pd.qcut(sub.loc[fl, "_dose"], 5, labels=[1, 2, 3, 4, 5]).astype(int))

    # kecamatan coordinates: parent district centroid + small jitter (~20 km),
    # flooded/coastal ones nudged seaward. Separate rng → calibration untouched.
    geo_rng = np.random.default_rng(GEO_SEED + 1)
    parent = meta_districts.set_index("district_name")[["latitude", "longitude"]]
    plat = sub["district_name"].map(parent["latitude"]).to_numpy()
    plon = sub["district_name"].map(parent["longitude"]).to_numpy()
    sub["latitude"] = (plat + geo_rng.normal(0, 0.18, len(sub))).round(4)
    sub["longitude"] = (plon + geo_rng.normal(0, 0.18, len(sub))
                        - np.where(sub.flooded == 1, 0.10, 0.0)).round(4)

    return sub


def simulate_subdistrict_panel(sub: pd.DataFrame,
                               rng: np.random.Generator) -> pd.DataFrame:
    n = len(sub)
    # kecamatan fixed effects and common year effects for night-lights growth
    omega = rng.normal(0.030, 0.030, n)
    yr_nl = _year_effects(rng, gfc_year=2009, gfc_dip=-0.010, sigma=0.020)

    # 2004 average luminosity (mean DN, 0-63): flooded brighter, very skewed.
    def lognorm_mean_sd(mean, sd, size):
        sig = np.sqrt(np.log(1 + (sd / mean) ** 2))
        mu = np.log(mean) - 0.5 * sig ** 2
        return rng.lognormal(mu, sig, size)

    def match_moments(raw, pre_mean, pre_sd, cap):
        """Linearly remap a positive, right-skewed sample, then clip to [0, cap]
        (a kecamatan-average DN; DMSP saturates near the top).  The pre-clip mean
        is set a little BELOW the paper's so that clipping the left tail at 0
        brings the realised mean up onto Table 1's value."""
        y = pre_mean + (raw - raw.mean()) * (pre_sd / raw.std())
        return np.clip(y, 0.0, cap)

    # draw skewed candidates, then moment-match each group so the realised
    # (post-clip) stats match Table 1 (flooded 5.28/8.87, non-flooded 2.30/4.33)
    raw_f = lognorm_mean_sd(5.28, 8.0, n)
    raw_nf = lognorm_mean_sd(2.30, 4.6, n)
    fl_mask = sub.flooded.to_numpy() == 1
    lum2004 = np.where(fl_mask, raw_f, raw_nf)
    lum2004[fl_mask] = match_moments(raw_f[fl_mask], 4.55, 9.55, 39.0)
    lum2004[~fl_mask] = match_moments(raw_nf[~fl_mask], 2.13, 4.55, 36.0)

    dose = sub._dose.to_numpy()
    flooded = sub.flooded.to_numpy()
    npix = sub.n_pixels.to_numpy()

    records = []
    for i, srow in sub.reset_index(drop=True).iterrows():
        # annual night-lights growth (2000-2012)
        g_nl = {}
        for y in GROWTH_YEARS:
            p = period_of(y)
            # the growth effect is CONCENTRATED in the most heavily-flooded
            # sub-districts (effect ~ dose^2): with the right-skewed dose this
            # makes only the TOP intensity quintile show a significant effect in
            # Table 4, while the continuous regressors stay linear so Table 3's
            # slope is unaffected.
            g_nl[y] = (omega[i] + yr_nl[y]
                       + (NL_THETA[p] * dose[i] ** 2 if flooded[i] else 0.0)
                       + rng.normal(0.0, SIGMA_NL_GROWTH))

        # luminosity levels: anchor on 2004, cumulate growth both directions
        nl_sum = {BASE_YEAR: max(lum2004[i] * npix[i], 0.001)}
        nl_log = {BASE_YEAR: np.log(nl_sum[BASE_YEAR] + 0.001)}
        for y in range(BASE_YEAR + 1, YEARS[-1] + 1):
            nl_log[y] = nl_log[y - 1] + g_nl[y]
        for y in range(BASE_YEAR - 1, YEARS[0] - 1, -1):
            nl_log[y] = nl_log[y + 1] - g_nl[y + 1]
        for y in YEARS:
            nl_sum[y] = np.exp(nl_log[y]) - 0.001

        for y in YEARS:
            avg_lum = min(max(nl_sum[y], 0.0) / npix[i], 63.0)   # DMSP saturates at 63
            records.append(dict(
                kecamatan_id=srow.kecamatan_id,
                kecamatan_name=srow.kecamatan_name,
                district_name=srow.district_name,
                province="Aceh",
                flooded=int(srow.flooded),
                share_pop_flooded=float(srow.share_pop_flooded),
                share_area_flooded=float(srow.share_area_flooded),
                flood_intensity_quintile=int(srow.flood_intensity_quintile),
                area_km2=float(srow.area_km2),
                n_pixels=int(srow.n_pixels),
                latitude=float(srow.latitude),
                longitude=float(srow.longitude),
                year=y,
                post=int(y >= 2005),
                period=(period_of(y) if y >= 2000 else "(base year)"),
                avg_luminosity=round(avg_lum, 4),
                nl_sum=round(max(nl_sum[y], 0.0), 4),
                nl_log=round(nl_log[y], 5),
                nl_growth=(np.nan if y == 1999 else round(g_nl[y], 5)),
            ))
    df = pd.DataFrame.from_records(records)
    # drop a fixed number of growth observations at random (missing DMSP
    # composites) so the night-lights regression N matches the paper's 3,444
    valid = df.index[df["nl_growth"].notna()].to_numpy()
    n_drop = len(valid) - NL_REG_N
    if n_drop > 0:
        df.loc[rng.choice(valid, size=n_drop, replace=False), "nl_growth"] = np.nan
    return df


# ---------------------------------------------------------------------------
# 4. DATA DICTIONARIES
# ---------------------------------------------------------------------------

def _dict_df(rows: list) -> pd.DataFrame:
    cols = ["variable", "label", "description", "units", "role",
            "how_created", "paper_reference", "example_values", "notes"]
    return pd.DataFrame(rows, columns=cols)


def district_dictionary() -> pd.DataFrame:
    R = [
        ("district_id", "District ID", "Unique identifier for the district (Kabupaten/Kota).",
         "string", "identifier",
         "Assigned as <PROVINCE-ABBREV>_D<nn>; Aceh districts carry real names in district_name.",
         "Sect. 2.1; Map 3", "ACEH_D01; RIAU_D05", "Stable key for panel merges."),
        ("district_name", "District name",
         "Name of the district. Real names for Aceh's 23 districts; systematic placeholders elsewhere.",
         "string", "identifier",
         "Real Aceh district names hand-coded from Maps 2-3; other provinces use 'Province District k'.",
         "Maps 2-3", "Banda Aceh; Aceh Besar", "Per user choice: real Aceh names + IDs elsewhere."),
        ("province", "Province", "Indonesian province the district belongs to.",
         "string", "identifier",
         "Hand-coded; 10 Sumatra provinces (Aceh, North Sumatra, and 8 'rest of Sumatra').",
         "Sect. 2.3; Maps 3-4", "Aceh; Riau", ""),
        ("region_group", "Region group",
         "Coarse grouping used to build estimation samples.",
         "{Aceh, North Sumatra, Rest of Sumatra}", "identifier",
         "Derived from province: Aceh, North Sumatra, or Rest of Sumatra.",
         "Maps 3-4", "Aceh", "North Sumatra enters only in robustness (Table 5)."),
        ("district_type", "District type",
         "Kota (urban city district) vs Kabupaten (rural regency).",
         "{Kota, Kabupaten}", "covariate",
         "Hand-coded to reproduce Table 7 city/rural sample sizes (Aceh: 5 Kota, 18 Kabupaten).",
         "Table 7; fn. 11", "Kota", "2 of the 10 flooded Aceh districts are Kota."),
        ("coastal", "Coastal dummy",
         "1 if the district lies on the coast, 0 if inland.",
         "0/1", "covariate",
         "Hand-coded; all 10 treated districts are coastal. Used to drop inland controls (Table 6).",
         "Table 6", "1", "Coastal control counts approximate the paper's robustness sample."),
        ("flooded", "Flooded / treated dummy",
         "Treatment indicator: 1 if the district was flooded by the 2004 tsunami.",
         "0/1", "treatment",
         "Hand-coded from the inundation maps (10 Aceh + 2 North Sumatra island districts).",
         "Sect. 2.2; Maps 2-4", "1", "The DiD 'D' variable."),
        ("neighbour_of_flooded", "Neighbour-of-flooded dummy",
         "1 if a non-flooded district borders a flooded one (placebo-treated in Table 9).",
         "0/1", "treatment",
         "Hand-coded adjacency for the placebo test; flooded districts are dropped in that test.",
         "Table 9", "1", "Used only for the placebo difference-in-differences."),
        ("flood_treatment_group", "Treatment-group label",
         "Readable label combining treatment status and region.",
         "category", "identifier",
         "Derived from flooded + region_group.",
         "Maps 3-4", "Treated (flooded)", "Convenience for selecting control pools."),
        ("latitude", "Latitude", "District-centroid latitude (decimal degrees, +N).",
         "degrees", "identifier",
         "Real approximate centroids for Aceh's 23 districts; drawn within the real "
         "province bounding box for synthetic non-Aceh districts.",
         "Eq. (1) note (Conley SEs)", "5.55", "Enables Conley spatial standard errors "
         "(≤100 km). Time-invariant."),
        ("longitude", "Longitude", "District-centroid longitude (decimal degrees, +E).",
         "degrees", "identifier",
         "See latitude. Used with latitude for haversine distances.",
         "Eq. (1) note (Conley SEs)", "95.32", "Time-invariant; see script 06."),
        ("year", "Year", "Calendar year of the observation.",
         "year", "identifier", "Panel spans 1999-2012 (levels).",
         "Sect. 3; Fig. 2", "2005", "Growth rates defined 2000-2012."),
        ("post", "Post-tsunami dummy", "1 for years 2005 and later.",
         "0/1", "derived", "1 if year >= 2005.", "Sect. 2.3", "1", "Simple pre/post split."),
        ("period", "DiD period",
         "Event-time period used for the staggered DiD dummies.",
         "category", "derived",
         "Mapped from year: baseline 2000-02, pre 2003-04, tsunami 2005, recovery 2006-08, postrec 2009-12.",
         "Eq. (1); Table 2", "recovery", "Baseline 2000-02 is the omitted reference."),
        ("gdp_const_usd_m", "Real GDP",
         "District real GDP excluding oil & gas, constant 2004 USD, millions.",
         "million constant 2004 USD", "outcome",
         "Cumulated from the 1999 base level using the simulated gdp_growth series.",
         "Sect. 2.1; Fig. 3", "1342.5", "Absolute scale chosen for realistic per-capita values."),
        ("gdp_growth", "GDP growth rate",
         "Annual growth rate of real GDP (log difference).",
         "proportion/yr", "outcome",
         "district_FE + year_FE + treated increment (city/rural, Table 7 col2) + "
         "Aceh-control spill-over + spatial & serial shocks + N(0,0.04) noise.",
         "Table 2; Eq. (1)", "0.061; -0.034", "Main dependent variable; NaN in 1999 and for "
         "Subulussalam 2003-2006."),
        ("population", "Population", "District population (persons).",
         "persons", "covariate",
         "Cumulated from the 1999 base using pop_growth (flooded districts lose ~9.6% in 2005).",
         "Sect. 4.4", "214330", "Drives the per-capita denominator."),
        ("pop_growth", "Population growth", "Annual population growth rate.",
         "proportion/yr", "derived",
         "district_FE + year_FE + flooded x population increment (death shock 2005) + noise.",
         "Sect. 4.4; Table 8", "0.017; -0.082", "NaN in 1999 and Subulussalam 2003-2006."),
        ("gdp_pc_usd", "GDP per capita",
         "Real GDP per capita, constant 2004 USD.",
         "constant 2004 USD", "outcome",
         "gdp_const_usd_m * 1e6 / population.", "Table 8", "1180.4", ""),
        ("gdp_pc_growth", "GDP per-capita growth",
         "Annual growth rate of real GDP per capita.",
         "proportion/yr", "outcome",
         "gdp_growth - pop_growth (so it reproduces Table 8 by construction).",
         "Table 8", "0.044", "No significant 2005 loss; significant 2006-08 gain. NaN where growth missing."),
        ("va_agri_share", "Agriculture VA share",
         "Agriculture value added as % of GDP.",
         "% of GDP", "outcome",
         "Province trajectory + district/type offset; Aceh falls 44->32% after 2004.",
         "Fig. 4", "41.2", "Aggregate to province for the structural-change synthetic control."),
        ("va_manu_share", "Manufacturing VA share",
         "Manufacturing value added as % of GDP.",
         "% of GDP", "outcome",
         "Province trajectory + noise; Aceh falls ~6->3.5% after 2004.",
         "Fig. 5", "5.4", ""),
        ("va_serv_share", "Services VA share",
         "Services / tertiary value added as % of GDP.",
         "% of GDP", "outcome",
         "Province trajectory + offset; Aceh rises ~40->55% after 2004.",
         "Fig. 6", "47.8", ""),
        ("capital_formation_pc_usd", "Capital formation per capita",
         "Gross capital formation per capita, current USD.",
         "current USD per capita", "outcome",
         "Smooth path + reconstruction spike (peak 2006) for Aceh; smooth for donors.",
         "Fig. 7", "198.6", "Reproduces the post-tsunami investment bonanza."),
        ("poverty_rate", "Poverty rate", "Share of population below the poverty line.",
         "%", "covariate", "District base + downward trend; Aceh improves after 2005.",
         "fn. 9 (SC covariate)", "18.4", "Synthetic-control predictor."),
        ("doctors_per_1000", "Doctors per 1,000", "Physicians per 1,000 people.",
         "per 1,000", "covariate", "District base + upward trend; Aceh rises faster after 2005.",
         "fn. 9; Sect. 5", "0.42", "Synthetic-control predictor."),
        ("water_access_pct", "Water access", "% of households with clean-water access.",
         "%", "covariate", "District base + upward trend; Aceh boosted after 2005.",
         "fn. 9", "74.5", "Synthetic-control predictor."),
        ("sanitation_access_pct", "Sanitation access", "% of households with sanitation access.",
         "%", "covariate", "District base + upward trend; Aceh boosted after 2005.",
         "fn. 9", "69.1", "Synthetic-control predictor."),
        ("electricity_access_pct", "Electricity access", "% of households with electricity.",
         "%", "covariate", "Aceh 84% (2004) -> 97% (2012); others smooth upward trend.",
         "Sect. 5", "92.0", "Cited improvement in the paper."),
        ("hdi", "Human Development Index", "Human Development Index (0-100 scale).",
         "index 0-100", "covariate", "Aceh ~69 -> ~73; others smooth upward trend.",
         "Sect. 5", "71.3", "Cited improvement in the paper."),
    ]
    return _dict_df(R)


def subdistrict_dictionary() -> pd.DataFrame:
    R = [
        ("kecamatan_id", "Sub-district ID", "Unique identifier for the sub-district (Kecamatan).",
         "string", "identifier", "Assigned KEC_001 .. KEC_276.",
         "Sect. 2.1; Map 1", "KEC_017", "276 Aceh kecamatans."),
        ("kecamatan_name", "Sub-district name", "Readable name linking the kecamatan to its parent district.",
         "string", "identifier", "Built as <ParentDistrict>_Kec_<nn>.",
         "Map 1", "AcehBesar_Kec_03", "Per user choice for sub-district labels."),
        ("district_name", "Parent district", "Aceh district the kecamatan belongs to.",
         "string", "identifier", "Assigned when distributing 276 kecamatans across 23 districts.",
         "Maps 1-2", "Aceh Besar", "Context only; regressions use kecamatan fixed effects."),
        ("province", "Province", "Always Aceh (night-lights analysis is Aceh-only).",
         "string", "identifier", "Constant 'Aceh'.", "Sect. 2.1", "Aceh", ""),
        ("flooded", "Flooded dummy", "1 if the kecamatan was flooded by the tsunami.",
         "0/1", "treatment", "68 of 276 kecamatans set to flooded (Table 1 split).",
         "Table 1; Sect. 2.2", "1", "Sub-district treatment indicator."),
        ("share_pop_flooded", "Share of population flooded",
         "Share of the kecamatan's population in flooded area (exogenous dose).",
         "0-1", "treatment",
         "latent dose * 0.62 + noise (flooded only); GRUMP-population analogue.",
         "Sect. 2.2; Table 3", "0.31", "Continuous intensity measure (i)."),
        ("share_area_flooded", "Share of area flooded",
         "Share of the kecamatan's physical area that was flooded (exogenous dose).",
         "0-1", "treatment",
         "latent dose * 0.00566 + noise (flooded only); tiny mean -> ~+1.75 coefficient.",
         "Sect. 2.2; Table 3", "0.012", "Continuous intensity measure (ii)."),
        ("flood_intensity_quintile", "Flood-intensity quintile",
         "Quintile (1-5) of the flooding-intensity distribution among flooded units.",
         "0-5", "treatment",
         "qcut of the latent dose into 5 groups among flooded kecamatans; 0 for non-flooded.",
         "Table 4", "5", "Only the top quintile shows a significant effect."),
        ("area_km2", "Area", "Approximate land area of the kecamatan.",
         "km^2", "covariate", "Drawn lognormal (30-1500 km^2).",
         "fn. 4", "182.5", "Sets the number of night-light pixels."),
        ("n_pixels", "Pixel count", "Number of ~0.86 km^2 night-light grid cells in the kecamatan.",
         "count", "covariate", "round(area_km2 / 0.86).", "fn. 4", "212",
         "30x30 arc-second pixels ~ 0.86 km^2 at the equator."),
        ("latitude", "Latitude", "Kecamatan-centroid latitude (decimal degrees, +N).",
         "degrees", "identifier",
         "Parent Aceh district centroid + ~20 km jitter (flooded ones nudged seaward).",
         "Map 1; Conley SEs", "5.48", "Enables Conley spatial SEs at sub-district level."),
        ("longitude", "Longitude", "Kecamatan-centroid longitude (decimal degrees, +E).",
         "degrees", "identifier", "See latitude.", "Map 1; Conley SEs", "95.40",
         "Time-invariant."),
        ("year", "Year", "Calendar year of the observation.", "year", "identifier",
         "Panel spans 1999-2012.", "Sect. 2.1", "2006", "Growth defined 2000-2012."),
        ("post", "Post-tsunami dummy", "1 for years 2005 and later.", "0/1", "derived",
         "1 if year >= 2005.", "Sect. 2.3", "1", ""),
        ("period", "DiD period", "Event-time period for the staggered DiD dummies.",
         "category", "derived",
         "baseline 2000-02 / pre 2003-04 / tsunami 2005 / recovery 2006-08 / postrec 2009-12.",
         "Table 3", "recovery", "Baseline 2000-02 is the omitted reference."),
        ("avg_luminosity", "Average luminosity",
         "Mean Digital Number (brightness) across the kecamatan's pixels.",
         "DN (0-63)", "outcome",
         "nl_sum / n_pixels, top-coded at 63 (DMSP saturation). 2004 values match Table 1.",
         "Table 1; Map 1", "5.10", "Flooded 2004 mean ~5.28; non-flooded ~2.30."),
        ("nl_sum", "Summed luminosity", "Sum of Digital Numbers over all pixels in the kecamatan.",
         "DN-sum", "outcome", "exp(nl_log) - 0.001.", "Sect. 2.1", "1081.4",
         "The unit-level activity measure underlying nl_log."),
        ("nl_log", "Log luminosity",
         "log( sum of (DN + 0.001) ) -- the transformed regression variable.",
         "log DN-sum", "outcome",
         "Cumulated from the 2004 anchor using the nl_growth series.",
         "Sect. 2.1 (eq. NL); Michalopoulos & Papaioannou 2011", "6.986",
         "Matches the paper's log night-lights transform."),
        ("nl_growth", "Night-lights growth", "Annual growth rate of log night-lights (log difference).",
         "proportion/yr", "outcome",
         "kecamatan_FE + year_FE + theta(period)*dose^2 (flooded) + N(0,0.005) noise.",
         "Tables 3-4", "0.142", "Main dependent variable; NaN in 1999."),
    ]
    return _dict_df(R)


# ---------------------------------------------------------------------------
# 5. README
# ---------------------------------------------------------------------------

def _vardesc_table(dic: pd.DataFrame) -> str:
    lines = ["| Variable | Role | Units | Description |",
             "|---|---|---|---|"]
    for _, r in dic.iterrows():
        lines.append(f"| `{r.variable}` | {r.role} | {r.units} | {r.description} |")
    return "\n".join(lines)


def write_readme(dist_dic: pd.DataFrame, sub_dic: pd.DataFrame,
                 dist_df: pd.DataFrame, sub_df: pd.DataFrame) -> None:
    n_dist = dist_df.district_id.nunique()
    n_sub = sub_df.kecamatan_id.nunique()
    txt = f"""# Synthetic replication dataset — Heger & Neumayer (2019)

A **synthetic, teaching-oriented** dataset that mirrors the data used in:

> Heger, M. P., & Neumayer, E. (2019). *The impact of the Indian Ocean tsunami
> on Aceh's long-term economic growth.* **Journal of Development Economics, 141,
> 102365.** https://doi.org/10.1016/j.jdeveco.2019.06.008

> ⚠️ **These numbers are simulated, not real.** The paper's underlying micro-data
> (World Bank **INDO-DAPOER** GDP, **DMSP-OLS** night lights, and the tsunami
> inundation maps) are licensed/confidential. This dataset is *calibrated* so
> that re-running the paper's regressions on it reproduces the paper's
> **findings** — the signs, the statistical significance, and the approximate
> magnitudes of the key coefficients. Use it to **teach the methods**, not to
> draw conclusions about Aceh.

---

## 1. What the paper does (in brief)

On 26 December 2004 the Indian Ocean tsunami devastated the Indonesian province
of **Aceh**, which then received the single largest reconstruction effort ever
directed at a developing-world disaster (USD 7.7 bn). Heger & Neumayer exploit
the *unexpected* geography of the flooding as a **quasi-natural experiment** and
ask whether the disaster-plus-aid shock raised or lowered Aceh's long-run output.

They use two causal-inference tools at **two geographic levels**:

| Level | Unit | Outcome | Source | Used for |
|---|---|---|---|---|
| District | Kabupaten/Kota | Real GDP (oil & gas excluded) | INDO-DAPOER | Main DiD + synthetic control |
| Sub-district | Kecamatan | Night-lights luminosity | DMSP-OLS | Flood-intensity (dose-response) DiD |

Headline result: flooded units **lost** output in 2005 but, thanks to the
reconstruction boom, ended on a **permanently higher** growth path than their
non-flooded counterfactuals ("sustainable recovery beyond the counterfactual
trend").

---

## 2. The two data files

| File | Grain | Rows | Units | Years |
|---|---|---|---|---|
| `aceh_tsunami_district_panel.csv` | district × year | {len(dist_df):,} | {n_dist} districts | 1999–2012 |
| `aceh_tsunami_subdistrict_panel.csv` | kecamatan × year | {len(sub_df):,} | {n_sub} kecamatans | 1999–2012 |

Each has its own dictionary: `aceh_tsunami_district_data_dictionary.csv` and
`aceh_tsunami_subdistrict_data_dictionary.csv`.

### Regional units (and how they map to the paper)

**Districts — {n_dist} on Sumatra:**
- **Aceh — 23**: **10 flooded (treated)** + **13 non-flooded (control)**.
- **North Sumatra — 26**: **2 flooded** barrier islands (Nias, Tanahbala) + 24
  controls (enter only in the Table 5 robustness check).
- **Rest of Sumatra — 76**: controls across 8 provinces (West Sumatra, Riau,
  Riau Islands, Jambi, Bengkulu, South Sumatra, Bangka-Belitung, Lampung).

**Sub-districts — {n_sub} kecamatans in Aceh**: **68 flooded + 208 non-flooded**
(matches the paper's Table 1).

These allocations are not arbitrary — they reproduce the paper's reported
**sample sizes** (growth rates span 13 years, 2000–2012; the non-flooded Aceh
district **Subulussalam** has missing growth for 2003–2006, per the paper's
footnote 3, so it contributes −4 observations wherever it appears):

| Paper table | Control pool | N (paper) | N (here) |
|---|---|---|---|
| Table 2 col 1 | Aceh + Rest of Sumatra (99 districts) | 1283 | 99·13 − 4 = **1283** |
| Table 2 col 2 | Rest of Sumatra (86) | 1118 | 86·13 = **1118** |
| Table 2 col 3 | Aceh only (23) | 295 | 23·13 − 4 = **295** |
| Table 5 col 1 | all 125 districts | 1621 | 125·13 − 4 = **1621** |
| Table 5 col 3 | Aceh + North Sumatra (49) | 633 | 49·13 − 4 = **633** |

The **city/rural** split also matches Table 7 (2 flooded Kota + 8 flooded
Kabupaten in Aceh ⇒ 3 non-flooded Aceh Kota, 10 non-flooded Aceh Kabupaten;
18 Kota + 58 Kabupaten in the rest of Sumatra).

---

## 3. How the data was constructed

The core trick is to **generate growth rates, then cumulate them into levels**,
so that growth and levels are mutually consistent and a fixed-effects DiD
recovers exactly what we put in.

**District GDP growth** for district *i* in year *t*:

```
gdp_growth[i,t] = district_FE[i] + year_FE[t]
                + treatment_increment(i, period)      # treated: by city/rural
                + control_spillover(i, period)        # non-flooded Aceh only
                + spatial_shock[i,t]                  # nearby districts co-move (Conley)
                + serial_shock[i, period]             # persists within a period (HAC)
                + idiosyncratic_noise
```

We reproduce the paper's **heterogeneity** directly rather than imposing one
pooled effect (all increments are relative to the 2000–2002 baseline):

- **City vs rural treated** (from the paper's **Table 7, col 2**): the 2 flooded
  *Kota* and 8 flooded *Kabupaten* get different increments. Because the pool is
  2 city + 8 rural, the population-weighted average reproduces **Table 2** exactly:

  | Period | City (Kota) | Rural (Kabupaten) | Pooled = Table 2 |
  |---|---|---|---|
  | 2003–04 | +0.007 | +0.024 | **+0.020** |
  | 2005 | −0.015 | −0.098 | **−0.081** |
  | 2006–08 | +0.139 | +0.045 | **+0.059** |
  | 2009–12 | +0.000 | +0.015 | **+0.010** |

- **Reconstruction spill-over** to *non-flooded Aceh* control districts (larger
  inland than coastal), so the "Aceh non-flooded" columns of Tables 2/6/8
  attenuate exactly as the paper finds (e.g. Table 2 col 3 recovery ≈ +0.030,
  half of col 1's +0.059).
- **North-Sumatra islands** (Nias/Tanahbala, also hit by the March-2005 Nias
  earthquake): a larger 2005 loss and no reconstruction boom (Table 5).

A two-way (district + year) fixed-effects regression of growth on `flooded ×
period` differences these out, so the estimated coefficients come back **≈ the
paper's reported values, column by column**. Levels are then
`GDP[t] = GDP[1999] · Π(1 + growth)`.

**Standard errors.** The paper reports **Conley spatial-HAC** SEs (serial
correlation within a district + contemporaneous spatial correlation ≤100 km).
Two error components make those SEs behave like the paper's: a *spatial* shock
(nearby districts co-move within a year → Conley SE > naive) and a *serial*
shock (one draw per district per period, shared across that period's years →
the multi-year recovery SE is as large as the one-year 2005 SE). Both are
**demeaned within treatment/control groups**, so they inflate the standard
errors *without moving the calibrated point estimates*, and both use their own
RNGs so the night-lights/structural results are untouched. `data_prep.did_estimate`
and `replication/06_…` compute the Conley-HAC SE explicitly.

**Population and GDP per capita (Table 8).** Population is cumulated the same
way, but flooded districts get a one-off **−9.6%** shock in 2005 (the casualties)
and grow ~1.9 pp slower in 2006–2008. Since `gdp_pc_growth = gdp_growth −
pop_growth`, this **simultaneously** reproduces Table 8: *no* significant
per-capita loss in 2005 (GDP and population fall together) and a significant
per-capita **gain** in 2006–2008 (fewer people sharing the rebuilt economy).

**Night-lights intensity (Tables 3–4).** Drawn from their **own RNG** (so the
sub-district draw can be calibrated independently of the GDP panel). Each flooded
kecamatan gets a latent **flood "dose"** in (0, 1], right-skewed so most are
lightly hit and a few devastated. Night-lights growth carries a per-period
increment proportional to **dose²** — the squaring concentrates the effect in the
worst-hit places, so only the **top intensity quintile** is significant (Table 4),
while the *continuous* regressors (`share_pop_flooded`, `share_area_flooded`) stay
linear in dose so **Table 3**'s coefficients land on the paper's values
(share-of-population recovery ≈ **+0.016\\*\\*\\***, share-of-area ≈ **+1.75\\*\\*\\***,
2005 weak/negative, pre & post ns). 2004 average luminosity matches Table 1
(flooded mean ≈ 5.28 / sd ≈ 8.87, non-flooded ≈ 2.30 / 4.33). A fixed number of
growth observations are dropped at random (sensor gaps) to hit the paper's
regression **N = 3,444**.

**Structural change & synthetic control (Figs 3–7).** Sectoral value-added
shares and capital formation are built from smooth **province-level** paths plus
district noise (so the province average returns the target). Aceh shows the
sharp post-2004 break the paper reports — agriculture 44→32%, manufacturing
6→3.5%, services 40→55%, and a capital-formation spike peaking in 2006 — while
donor provinces drift smoothly, so a province-level synthetic control recovers
the counterfactual. The covariates (`poverty_rate`, `doctors_per_1000`,
`water_access_pct`, `sanitation_access_pct`, `electricity_access_pct`, `hdi`)
are the synthetic-control predictors named in the paper's footnote 9.

---

## 4. Decisions & assumptions (what we chose and why)

- **Calibrated to the paper's actual numbers.** The data-generating process is
  tuned so the DiD coefficients, **column by column**, land close to the paper's
  reported values (signs, magnitudes within ≈0.005 on the headline cells, and the
  significance stars), and the standard errors match the paper's **Conley
  spatial-HAC** SEs (so e.g. the 2006–08 recovery effect is **\\*\\*** at 5%, not
  \\*\\*\\*). The heterogeneity across columns (city vs rural, the Aceh-control
  spill-over, the North-Sumatra islands) is built in, not left to chance.
- **Real Aceh names; IDs elsewhere.** Aceh's 23 districts use real names with a
  realistic flood assignment; the ~100 control districts use real province names
  + systematic IDs (e.g. `RIAU_D05`) to avoid inventing inaccurate geography.
- **Years 1999–2012** for both panels (levels); growth rates 2000–2012.
- **Two files, two dictionaries** (per request).

### Known approximations (documented on purpose)
- **Sample sizes are exact.** The district taxonomy reproduces every reported
  N (Table 2 1283/1118/295; Table 5 1621/1144/633; Table 6 945/819/256; Table 7
  295/260/61 & 988/858/234; Table 9 1465/477; night-lights 3,444). One inland Aceh
  district is *counted* as coastal so Table 6's coastal sub-sample (256) matches —
  the paper's operational coast/inland split, not strict physical geography.
- **Two random seeds.** With only 10 treated districts the point estimates carry
  real sampling scatter, so the GDP seed ({SEED}) and the night-lights seed
  ({NL_SEED}) were each chosen so this *one* realised sample sits closest to the
  paper across all tables. The error components are demeaned within groups, so the
  seed only nudges the idiosyncratic part; the structure is fixed by the DGP.
- **Conley spatial-HAC SEs**: both panels carry `latitude`/`longitude` (real
  centroids for Aceh, plausible-within-province elsewhere). A spatial shock and a
  serial shock — demeaned within groups, drawn from their own RNGs — reproduce the
  paper's SE pattern without disturbing the point estimates. See
  `replication/06_spatial_standard_errors.py`.
- **"Aceh non-flooded" columns are imprecise.** With the same 10 treated units
  across columns, the synthetic Conley-HAC SE is similar in every column, whereas
  the paper's Aceh-only columns (Tables 2/6/8 col 3) have smaller SEs (higher R²);
  there the *point* estimates match but the column-3 recovery effect can read as
  insignificant. The **2-district city columns** of Table 7 are likewise imprecise
  (few clusters), exactly as the paper cautions.
- **Night-lights quintiles (Table 4)**: the paper's Table 4 magnitudes (Q5 ~0.38)
  are on a scale inconsistent with its own Table 3 (~0.016) — no single process
  reproduces both. We match Table 3 exactly and Table 4's **pattern** (only the
  top quintile significant), at the Table-3-consistent magnitude.
- **GDP scale/currency**: absolute level chosen for realistic per-capita figures;
  growth-rate results are scale-free.

---

## 5. Files & how to regenerate

```
generate_synthetic_data.py                      # this generator (numpy + pandas)
aceh_tsunami_district_panel.csv                 # district × year GDP panel
aceh_tsunami_district_data_dictionary.csv       # dictionary for the above
aceh_tsunami_subdistrict_panel.csv              # kecamatan × year night-lights panel
aceh_tsunami_subdistrict_data_dictionary.csv    # dictionary for the above
README.md                                       # this file
```

Environment: the generator needs only `numpy` + `pandas` (and `statsmodels` for
the optional `--validate` self-check). If your system Python cannot install
them, create a throwaway environment, e.g. with [uv](https://docs.astral.sh/uv/):

```bash
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python numpy pandas statsmodels
```

Regenerate (deterministic; fixed seed):

```bash
python generate_synthetic_data.py            # writes the 5 data/doc files
python generate_synthetic_data.py --validate # also prints recovered vs target coefficients
```

---

## 6. Variable reference — district panel (`aceh_tsunami_district_panel.csv`)

{_vardesc_table(dist_dic)}

## 7. Variable reference — sub-district panel (`aceh_tsunami_subdistrict_panel.csv`)

{_vardesc_table(sub_dic)}

---

## 8. Reproducing the paper, table by table

| Paper object | Method on this data |
|---|---|
| **Table 1** | Group `avg_luminosity` (year 2004) by `flooded`; report mean/SD/min/max. |
| **Table 2** | OLS of `gdp_growth` on `flooded×period` dummies + district & year FE; cluster by district. Control pools via `region_group`. |
| **Table 3** | OLS of `nl_growth` on `flooded×period` (and on `share_pop_flooded×period`, `share_area_flooded×period`) + kecamatan & year FE. |
| **Table 4** | OLS of `nl_growth` on `flood_intensity_quintile×post` dummies + kecamatan & year FE. |
| **Table 5** | Table 2 spec including North Sumatra (`region_group != 'Rest of Sumatra'` for the red pool, etc.). |
| **Table 6** | Table 2 spec restricted to `coastal == 1`. |
| **Table 7** | Table 2 spec split by `district_type` (Kota vs Kabupaten). |
| **Table 8** | Table 2 spec with `gdp_pc_growth` as the outcome. |
| **Table 9** | Drop `flooded == 1`; placebo-treat `neighbour_of_flooded == 1`; run the Table 2 spec. |
| **Figs 2–3** | Plot mean `gdp_const_usd_m` (indexed to 2004) for treated vs controls; synthetic control of treated-Aceh GDP on rest-of-Sumatra donors. |
| **Figs 4–7** | Aggregate `va_*_share` and `capital_formation_pc_usd` to the province level; province synthetic control of Aceh vs other provinces. |

*Generated by `generate_synthetic_data.py` (seed {SEED}).*
"""
    (OUT_DIR / "README.md").write_text(txt, encoding="utf-8")


# ---------------------------------------------------------------------------
# 6. OPTIONAL SELF-VALIDATION  (recovered coefficients vs the paper's targets)
# ---------------------------------------------------------------------------

def validate(dist_df: pd.DataFrame, sub_df: pd.DataFrame) -> None:
    try:
        import statsmodels.formula.api as smf
    except Exception as exc:  # pragma: no cover
        print(f"[validate] statsmodels unavailable ({exc}); skipping.")
        return

    periods = ["pre", "tsunami", "recovery", "postrec"]

    def did(df, outcome, treat_col, fe_unit, label_targets):
        d = df.copy()
        d = d[d[outcome].notna()].copy()
        for p in periods:
            d[f"T_{p}"] = ((d[treat_col] if treat_col != "flooded" else d["flooded"])
                           * (d["period"] == p)).astype(float)
        rhs = " + ".join(f"T_{p}" for p in periods)
        formula = f"{outcome} ~ {rhs} + C({fe_unit}) + C(year)"
        res = smf.ols(formula, data=d).fit(
            cov_type="cluster", cov_kwds={"groups": d[fe_unit]})
        print(f"\n  {label_targets['title']}  (N={int(res.nobs)}, R2={res.rsquared:.2f})")
        print(f"    {'period':<10}{'estimate':>11}{'std.err':>10}{'t':>7}   target")
        for p in periods:
            b = res.params[f"T_{p}"]; se = res.bse[f"T_{p}"]; t = b / se
            star = "***" if abs(t) > 2.58 else "**" if abs(t) > 1.96 else "*" if abs(t) > 1.64 else ""
            print(f"    {p:<10}{b:>11.4f}{se:>10.4f}{t:>7.2f}{star:>4}   {label_targets[p]}")

    print("=" * 72)
    print("VALIDATION — recovered coefficients vs. the paper")
    print("=" * 72)

    # Table 2, column 1 (Aceh + Rest of Sumatra)
    samp = dist_df[dist_df.region_group != "North Sumatra"]
    did(samp, "gdp_growth", "flooded", "district_id",
        {"title": "Table 2 col1: GDP growth (DiD)",
         "pre": "+0.020 (ns)", "tsunami": "-0.081 ***",
         "recovery": "+0.059 **", "postrec": "+0.010 (ns)"})

    # Table 8, column 1 (GDP per capita)
    did(samp, "gdp_pc_growth", "flooded", "district_id",
        {"title": "Table 8 col1: GDP-per-capita growth (DiD)",
         "pre": "+0.05 (ns)", "tsunami": "+0.015 (ns)",
         "recovery": "+0.078 ***", "postrec": "+0.026 (ns)"})

    # Table 5, column 1 (incl. North Sumatra, all districts)
    did(dist_df, "gdp_growth", "flooded", "district_id",
        {"title": "Table 5 col1: GDP growth incl. North Sumatra",
         "pre": "+0.016 (ns)", "tsunami": "-0.082 ***",
         "recovery": "+0.049 *", "postrec": "-0.021 (ns)"})

    # Table 3: night lights, share of POPULATION flooded
    did(sub_df, "nl_growth", "share_pop_flooded", "kecamatan_id",
        {"title": "Table 3 col1: night-lights growth, SHARE OF POPULATION flooded",
         "pre": "+0.005 (ns)", "tsunami": "-0.0077 *",
         "recovery": "+0.016 ***", "postrec": "+0.002 (ns)"})

    # Table 3: night lights, share of area flooded
    did(sub_df, "nl_growth", "share_area_flooded", "kecamatan_id",
        {"title": "Table 3 col2: night-lights growth, SHARE OF AREA flooded",
         "pre": "+0.46 (ns)", "tsunami": "-0.66 (ns)",
         "recovery": "+1.75 ***", "postrec": "+0.19 (ns)"})

    # Table 1 check
    print("\n  Table 1: 2004 average luminosity by flood status")
    t1 = (sub_df[sub_df.year == 2004]
          .groupby("flooded")["avg_luminosity"]
          .agg(["count", "mean", "std", "min", "max"]))
    print(t1.to_string(float_format=lambda x: f"{x:.2f}"))
    print("    (paper: flooded n=68 mean=5.28 sd=8.87 max=38.8; "
          "non-flooded n=208 mean=2.30 sd=4.33 max=36.4)")
    print("=" * 72)


# ---------------------------------------------------------------------------
# 7. MAIN
# ---------------------------------------------------------------------------

def main(do_validate: bool = False) -> None:
    rng = np.random.default_rng(SEED)

    meta = build_district_metadata(rng)
    dist_df = simulate_district_panel(meta, rng)

    # night lights draw from their OWN rng (decoupled from the GDP panel)
    nl_rng = np.random.default_rng(NL_SEED)
    sub_meta = build_subdistrict_metadata(meta, nl_rng)
    sub_df = simulate_subdistrict_panel(sub_meta, nl_rng)

    dist_dic = district_dictionary()
    sub_dic = subdistrict_dictionary()

    # write everything
    dist_df.to_csv(OUT_DIR / "aceh_tsunami_district_panel.csv", index=False)
    dist_dic.to_csv(OUT_DIR / "aceh_tsunami_district_data_dictionary.csv", index=False)
    sub_df.to_csv(OUT_DIR / "aceh_tsunami_subdistrict_panel.csv", index=False)
    sub_dic.to_csv(OUT_DIR / "aceh_tsunami_subdistrict_data_dictionary.csv", index=False)
    write_readme(dist_dic, sub_dic, dist_df, sub_df)

    print("Wrote:")
    print(f"  aceh_tsunami_district_panel.csv              ({len(dist_df):,} rows, "
          f"{dist_df.district_id.nunique()} districts)")
    print(f"  aceh_tsunami_district_data_dictionary.csv    ({len(dist_dic)} variables)")
    print(f"  aceh_tsunami_subdistrict_panel.csv           ({len(sub_df):,} rows, "
          f"{sub_df.kecamatan_id.nunique()} kecamatans)")
    print(f"  aceh_tsunami_subdistrict_data_dictionary.csv ({len(sub_dic)} variables)")
    print("  README.md")

    if do_validate:
        validate(dist_df, sub_df)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--validate", action="store_true",
                    help="run the key regressions and print recovered vs target coefficients")
    args = ap.parse_args()
    main(do_validate=args.validate)
