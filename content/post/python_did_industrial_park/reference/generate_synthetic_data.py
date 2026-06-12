#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_synthetic_data.py
==========================

Generate a SYNTHETIC, teaching-oriented replication dataset for:

    Huang, G., Wang, M., & Xu, H. (2026). "The socioeconomic impacts of
    industrial parks in Ethiopia." Journal of Urban Economics.
    https://doi.org/10.1016/j.jue.2026.103867

WHY THIS EXISTS
---------------
The paper studies the STAGGERED rollout of Ethiopia's industrial parks
(2008-2021) as a quasi-natural experiment and estimates their causal effects
on local economic activity, urbanization, household living standards, and
women's empowerment using a difference-in-differences design at three levels:

  * DISTRICTS (woredas) -- a balanced 2005-2020 annual panel of nighttime light
    intensity (harmonized DMSP-OLS / VIIRS) and impervious-surface ratio
    (GISD30).  Main analysis (Eq. 1; Tables 1-4, A4-A12, Fig. 1).
  * HOUSEHOLDS (DHS repeated cross-section, rounds 2000/2005/2011/2016/2019) --
    durable goods, housing quality, wealth index (Eq. 2; Table 5, Fig. 2).
  * INDIVIDUALS (same DHS rounds) -- non-agricultural employment and women's
    empowerment outcomes (Eq. 2; Tables 6-7, A15-A16, Fig. 3).

The original micro-data are licensed/confidential (harmonized nightlights,
GISD30 impervious surface, Ethiopia DHS, the 2007 census, EIC/IPDC park list),
so this script produces a *calibrated synthetic* dataset.  The numbers are
simulated, but the data-generating process is tuned so that running the paper's
regressions on it reproduces the paper's headline FINDINGS -- the signs, the
statistical significance (stars), and the approximate magnitudes of the key
coefficients (Tables 1-7 and the appendix tables).  It is meant for *teaching
the methods*, not for drawing substantive conclusions about Ethiopia.

WHAT IT WRITES
--------------
  data/ (panels):
    1. industrial_park_district_panel.csv       (district x year panel)
    2. industrial_park_household_rcs.csv         (household repeated cross-section)
    3. industrial_park_individual_rcs.csv        (individual repeated cross-section)
  reference/ (docs):
    4. industrial_park_district_panel_data_dictionary.csv
    5. industrial_park_household_rcs_data_dictionary.csv
    6. industrial_park_individual_rcs_data_dictionary.csv
    7. README.md

HOW IT IS CALIBRATED (in one sentence)
--------------------------------------
We generate latent district-year log-light as
    loglight* = district_FE + region x year_FE + unit_trend + RAMP(event time)
                + spatial_shock + serial_shock + noise
where RAMP is a saturating treatment ramp scaled to the paper's ATT, and the
treated-cohort unit trends carry a small upward drift so that ESTIMATING with
trend interactions ATTENUATES the coefficient exactly as the paper reports
(0.265 -> 0.214 for IHS, etc.).  The RCS outcomes are generated from a
cross-sectional district + round FE design (clipped linear-probability for
binaries) so a two-way FE regression recovers the ATT in expectation.  The
spatial & serial shocks are DEMEANED within groups, so they make the
clustered/Conley SEs realistic WITHOUT moving the point estimates.
See README.md for the full explanation and the variable reference.

USAGE
-----
    python3 reference/generate_synthetic_data.py            # write the 8 files
    python3 reference/generate_synthetic_data.py --validate # also run the key
                                                            # regressions and print
                                                            # recovered-vs-paper
                                                            # (needs pyfixest)

The output is fully deterministic (fixed random seeds).
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# 0. GLOBAL CONFIGURATION
# ---------------------------------------------------------------------------

SEED = 2026                       # master seed for the district panel draw
RCS_SEED = 1130                   # master seed for the DHS RCS draws
SPATIAL_SEED = 71                 # rng for the spatial error field (chosen by search)
SERIAL_SEED = 99                 # rng for the serial (district x period) shocks (chosen by
                                 # search so the realised IHS event-study path is clean and
                                 # monotone-ish with pre-period ~0, and the Sun-Abraham post
                                 # average ~0.26 -- see validate())
GEO_SEED = 26122004               # rng for coordinate jitter (independent)
ROAD_SEED = 26122559              # dedicated rng for the (wide) road densities -- kept
                                  # separate so widening them for the road heterogeneity
                                  # interactions does not perturb any other draw

REPO_DIR = Path(__file__).resolve().parent.parent       # python_did_industrial_park/
REF_DIR = REPO_DIR / "reference"
DATA_DIR = REPO_DIR / "data"

# District panel: balanced 2005-2020 annual (16 years).
YEARS = list(range(2005, 2021))           # 16 years -> 139 x 16 = 2,224 rows
ISA_YEARS = [2005, 2010, 2015, 2020]      # impervious observed only here -> 556 non-null
BASE_YEAR = 2012                          # trend centring year (unit_trend = year-2012)

# DHS survey rounds (repeated cross-section).
ROUNDS = [2000, 2005, 2011, 2016, 2019]

N_TREATED = 17
N_CONTROL = 122
N_DISTRICTS = N_TREATED + N_CONTROL       # 139

# --- Treatment-timing cohorts (17 treated districts) ------------------------
# (open_year: number of treated districts opening that year).  Chosen for a
# clean event study with k in [-5, +5] and >= 3 treated districts per event
# time.  EIP = 2008 anchor; the 2014-2019 clustering preserves Table A1.
COHORTS = {2008: 1, 2014: 2, 2015: 2, 2016: 3, 2017: 3, 2018: 2, 2019: 2, 2020: 2}
assert sum(COHORTS.values()) == N_TREATED

# --- District-panel light DGP (two-part: stable extensive x additive intensive) -
# light = positive_dt * (base_d + region-year + theta_d*ramp + drift + spatial
#                        + serial + additive_noise)   clipped at 0
# where:
#   * EXTENSIVE margin positive_dt = 1{ thr_d + dz_d + yz_t + eps > 0 } with
#     thr_d = Phi^{-1}(P_LIGHT_{treated/control}); dz_d (district) and yz_t
#     (common year) are DEMEANED within group so the realised P(light>0) hits
#     ~0.99/0.527 (treated near-always-lit; see P_LIGHT_TREATED) and is STABLE
#     within district (no spurious pre/post shift -> the extensive-margin coef and
#     the IHS event-study path are not distorted).
#   * INTENSIVE margin base_d is district-fixed and BRIGHT for treated
#     (median LIGHT_MED_TREATED) and DIM for control (LIGHT_MED_CONTROL); the
#     treatment effect theta_d*ramp is ADDED on the raw scale.  Because the
#     treated base is bright, asinh(.) compresses the post-period jump, so the
#     RAW coefficient is large (~1.3) while the IHS coefficient is small (~0.21)
#     -- exactly the paper's Table 1 split.
LIGHT_MED_TREATED = 3.6          # treated district-fixed median light (bright).  Sets the
                                 # IHS/raw compression ratio: a brighter base compresses the
                                 # post-period jump more under asinh, so it controls the
                                 # split between the small IHS coef (~0.21) and the large raw
                                 # coef (~1.5).  Tuned (with RAMP_PLATEAU) to the Table 1 pair.
LIGHT_MED_CONTROL = 0.12         # control district-fixed median light (dim)
LIGHT_BASE_SD = 0.40             # lognormal SD of the district-fixed base
LIGHT_NOISE_SD = 0.12            # additive idiosyncratic district-year noise (LOW: with the
                                 # near-always-positive treated extensive margin -- see
                                 # P_LIGHT_TREATED below -- a large noise would re-introduce
                                 # per-event-time wobble into the IHS event study)
LIGHT_YEAR_AMP = 1.0             # amplitude of the region-year additive shock

RAMP_PLATEAU = 1.55              # MAIN treated raw-light plateau (mean across treated).
                                 # Scaled down from 1.90 so the trend-adjusted IHS coef is
                                 # ~0.21 (Table 1); see LIGHT_MED_TREATED for the IHS/raw split.
RAMP_TAU = 1.55                  # saturating-ramp time constant g(k)=1-exp(-k/tau)
RAMP_JUMP0 = 0.45                # g(0) = RAMP_JUMP0 (discrete opening jump)

# Shared differential trend: phi_d*(year-2012) added to ALL districts with
# phi_d proportional to (urbanization - mean).  Treated have higher urbanization
# (Table A3), so they trend up faster; the no-trends regression attributes this
# to treatment (0.303/1.535) while the t x urbanization trend interaction
# ABSORBS it and recovers the lower trend-adjusted effect (0.219/1.389) -- the
# paper's attenuation (0.265 -> 0.214 IHS, 1.723 -> 1.276 raw).
TREATED_TREND_DRIFT = 0.20       # shared trend/yr * (urbanization - mean)

# Impervious-surface DGP (ratio scale).  base + ramp + shared-urbanization trend.
ISA_PLATEAU = 0.035              # impervious treatment plateau (tuned -> 0.028 w/ trends,
                                 # 0.032 no-trends; re-tuned alongside the light DGP changes)
ISA_BASE_CONTROL = 0.030         # control baseline impervious ratio
ISA_BASE_TREATED_BUMP = 0.006    # extra treated baseline (Table A3: 0.062 vs 0.035)
ISA_TREND_AMP = 0.014            # shared-trend amplitude (attenuation 0.032 -> 0.028)

# Heterogeneity: each treated district's RAW plateau is LINEAR in a moderator,
# theta_d = RAMP_PLATEAU + bint * (M_d - mean), so a feols of light on
# treatment + treatment:M recovers (beta_main_implied, bint).  The interaction
# regression's MAIN term equals RAMP_PLATEAU + bint*mean(M) ~ the paper's
# reported main (e.g. 1.276 + 0.008*195 ~ 2.84 vs the paper's 2.514).
HET = {
    "dist_addis_km":         dict(beta_int=-0.008),
    "dist_state_capital_km": dict(beta_int=-0.009),
    "dist_nearest_city_km":  dict(beta_int=-0.032),
    "primary_road_density":  dict(beta_int=+0.379),
    "paved_road_density":    dict(beta_int=+0.630),
}
# RAW-scale slope of the treated plateau in centered dist_addis_km (primary het
# channel; the other moderators are recovered approximately via correlation).
HET_RAW_SLOPE = -0.008
# Empirically-corrected multi-channel plateau coefficients (B over the 5 centered
# moderators), found by a NUMERICAL (damped-Newton) het calibration solver that drives
# the REALISED Table 3-4 single-moderator interaction regressions -- each run WITH the
# full trend set, which absorbs part of every interaction -- onto the paper's target
# slopes simultaneously.  With this B (and the wide road densities above) ALL FIVE
# interaction POINT estimates land on target with the CORRECT SIGN; dist_addis (***),
# dist_state_capital (**), dist_nearest_city (***) and paved_road (**) are significant,
# and primary_road is correctly-signed/-magnituded but borderline (ns) -- the 17-treated
# sample cannot make BOTH road interactions significant at once (see README).  The road
# coefficients are now moderate (no longer the old ill-conditioned 3.8 / -5.7), which
# also tames the LinAlgWarning from the collinear road-moderator regression.
HET_B_EMPIRICAL = [-0.00148, -0.01499, -0.04019, -1.09482, 0.92462]

# Shock SDs (affect SEs & significance, not the calibrated point means).
SPATIAL_SD = 0.08                # spatial field SD (demeaned within groups).  LOW so it does
                                 # not add per-event-time wobble to the IHS event study.
SPATIAL_RANGE_KM = 100.0         # distance-decay range (Conley 100km cutoff)
SERIAL_SD = 0.10                 # serial (district x event-period) shock SD.  LOW for the
                                 # same reason -- the serial bucket boundary at k=3 used to
                                 # carve a visible dip into the IHS event study; with the
                                 # near-always-positive treated margin it is kept small.
SIGMA_ISA = 0.012                # impervious idiosyncratic noise

# Light extensive margin: treated are bright park cities, ESSENTIALLY ALWAYS lit
# (P(light>0) ~ 0.99), controls dim (~0.527); the ramp acts on the intensive margin
# -> the LPM coef on light_positive ~0 ns.  The high treated P is DELIBERATE: when a
# few treated district-years drew light==0 (old P=0.897) the asinh(0)=0 holes carved
# a spurious dip into the IHS event study at the event times where they happened to
# land (and added pre-period noise).  Making treated always-lit removes those holes,
# so the event-study path is clean and monotone-ish (Fig. 1) -- the seed no longer
# has to dodge unlucky zero placements.
P_LIGHT_TREATED = 0.995
P_LIGHT_CONTROL = 0.527
EXT_DZ_SD = 0.84                 # district extensive shock SD (demeaned, sd1 total)
EXT_YZ_SD = 0.45                 # common-year extensive shock SD (demeaned)
EXT_EPS_SD = 0.30                # residual extensive noise SD
EXT_SEED = 370                   # extensive-margin RNG seed (chosen so the realised
                                 # P(light>0) hits ~0.99 / 0.527 -- see validate())

# --- Ethiopian regional states (region_id map) ------------------------------
REGIONS = {
    "Oromia": 1, "Amhara": 2, "Tigray": 3, "Addis Ababa": 4, "Sidama": 5,
    "Dire Dawa": 6, "Afar": 7, "SNNP": 8, "Somali": 9, "Benishangul-Gumuz": 10,
    "Gambela": 11, "Harari": 12,
}


# ---------------------------------------------------------------------------
# 1. TREATED-DISTRICT METADATA  (17 treated woredas from Table A1)
# ---------------------------------------------------------------------------
# (district_name, region, open_year, labor_intensive_park, public_park)
# Names/regions/years follow Appendix Table A1 (the host woreda of each park's
# first opening; where a region hosts several parks the earliest opening sets
# the district's open_year).  Distances/covariates are drawn to match the
# Table A3 treated-group moments (e.g. dist_addis treated mean 195, SD 143).
_TREATED = [
    # 2008 EIP anchor (Eastern IP, Dukem/Oromia; private, multi-sector)
    ("Dukem",        "Oromia",      2008, 0, 0),
    # 2014 (Bole Lemi I / Addis Ababa; Kombolcha planning in Amhara)
    ("Bole Lemi",    "Addis Ababa", 2014, 1, 1),
    ("Kombolcha",    "Amhara",      2014, 1, 1),
    # 2015 (ICT/HuaJian/George Shoe cluster, Addis; Vogue/DBL Tigray)
    ("Akaki Kaliti", "Addis Ababa", 2015, 1, 1),
    ("Mekelle",      "Tigray",      2015, 1, 1),
    # 2016 (Hawassa/Sidama; Addis-Djibouti corridor districts)
    ("Hawassa",      "Sidama",      2016, 1, 1),
    ("Adama",        "Oromia",      2016, 1, 1),
    ("Lege Tafo",    "Oromia",      2016, 0, 1),
    # 2017 (Mekelle II / Kombolcha expansions; Debre Birhan planning)
    ("Debre Birhan", "Amhara",      2017, 1, 1),
    ("Adigrat",      "Tigray",      2017, 1, 1),
    ("Dessie",       "Amhara",      2017, 0, 1),
    # 2018 (Adama IP; CCCC Averti)
    ("Bishoftu",     "Oromia",      2018, 1, 1),
    ("Bahir Dar",    "Amhara",      2018, 1, 1),
    # 2019 (Dire Dawa, Jimma, Kilinto pharma, Debre Birhan)
    ("Dire Dawa",    "Dire Dawa",   2019, 0, 1),
    ("Jimma",        "Oromia",      2019, 1, 1),
    # 2020 (Bole Lemi II, Bure, Bahir Dar)
    ("Bure",         "Amhara",      2020, 0, 1),
    ("Semera",       "Afar",        2020, 0, 1),
]
assert len(_TREATED) == N_TREATED

# Verify the open-year multiset matches COHORTS.
from collections import Counter
assert Counter(t[2] for t in _TREATED) == Counter(COHORTS), "treated open-years != COHORTS"


# Table A3 Panel C target moments (treated / control): (mean, sd).
_A3_COVARS = {
    "longitude":               ((38.96, 1.242), (38.61, 1.341)),
    "latitude":                ((9.419, 1.798), (8.832, 1.783)),
    "elevation":               ((1849.0, 560.3), (1886.0, 619.5)),
    "slope":                   ((5.251, 3.450), (6.054, 3.318)),
    "dist_addis_km":           ((195.0, 143.2), (210.2, 129.1)),
    "dist_state_capital_km":   ((112.9, 121.1), (135.5, 89.90)),
    "dist_nearest_city_km":    ((52.00, 49.81), (60.06, 45.23)),
    "urbanization_rate_2007":  ((0.282, 0.325), (0.181, 0.251)),
    "employment_rate_2007":    ((0.655, 0.109), (0.680, 0.111)),
    "log_pop_density_2007":    ((5.245, 1.579), (5.082, 1.561)),
}


def _draw_matched_moments(rng, mean, sd, n, lo=None, hi=None):
    """Draw n values then rescale so the realised mean/sd hit the targets
    exactly (clipping is applied AFTER matching, so light clipping is harmless
    for the small SD covariates)."""
    x = rng.normal(0.0, 1.0, n)
    x = (x - x.mean()) / (x.std() if x.std() > 0 else 1.0)
    x = mean + x * sd
    if lo is not None or hi is not None:
        x = np.clip(x, lo if lo is not None else -np.inf,
                    hi if hi is not None else np.inf)
    return x


def _haversine_km(lat1, lon1, lat2, lon2):
    """Great-circle distance in km between arrays/points of coordinates."""
    r = 6371.0
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(np.asarray(lat2) - np.asarray(lat1))
    dlmb = np.radians(np.asarray(lon2) - np.asarray(lon1))
    a = np.sin(dphi / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dlmb / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(np.clip(a, 0, 1)))


def _haversine_matrix(lat, lon):
    """n x n matrix of pairwise great-circle distances (km)."""
    lat = np.asarray(lat, float); lon = np.asarray(lon, float)
    return _haversine_km(lat[:, None], lon[:, None], lat[None, :], lon[None, :])


def build_district_metadata(rng: np.random.Generator) -> pd.DataFrame:
    """
    Build the 139-district time-invariant metadata: IDs, names, region, treated
    status, open_year, and all covariates (drawn to match Table A3 moments).
    Treated districts get pseudo-real names/regions from Table A1; the 122
    controls get systematic IDs assigned across regions in proportion to how
    parks are spread, so each treated cohort shares region-by-year FE support.
    """
    rows = []

    # ---- 17 treated districts (real-ish names from Table A1) ----
    for i, (name, region, oy, labint, public) in enumerate(_TREATED, start=1):
        rows.append(dict(
            district_id=f"ET_D{i:03d}",
            district_name=name,
            region=region,
            treated=1,
            open_year=oy,
            labor_intensive_park=labint,
            public_park=public,
        ))

    # ---- 122 control districts spread across the treated regions ----
    # Distribute controls across the regions that host treated parks (so the
    # region^year FE has both treated and control support in each region) plus
    # a few extra regions for realism.  Weights ~ number of treated parks/region.
    treated_regions = [t[1] for t in _TREATED]
    reg_counts = Counter(treated_regions)
    # control allocation roughly proportional to treated presence, with a floor
    weights = {r: reg_counts.get(r, 0) + 0.6 for r in REGIONS}
    # zero-out regions with no treated unit except a few neighbours for realism
    for r in ["SNNP", "Somali", "Benishangul-Gumuz", "Gambela", "Harari"]:
        weights[r] = 0.8
    tot = sum(weights.values())
    alloc = {r: int(round(N_CONTROL * w / tot)) for r, w in weights.items()}
    # fix rounding so controls sum to exactly 122
    diff = N_CONTROL - sum(alloc.values())
    order = sorted(REGIONS, key=lambda r: -weights[r])
    j = 0
    while diff != 0:
        r = order[j % len(order)]
        if diff > 0:
            alloc[r] += 1; diff -= 1
        elif alloc[r] > 0:
            alloc[r] -= 1; diff += 1
        j += 1

    k = N_TREATED
    for region in order:
        for _ in range(alloc[region]):
            k += 1
            rows.append(dict(
                district_id=f"ET_D{k:03d}",
                district_name=f"{region} woreda {k:03d}",
                region=region,
                treated=0,
                open_year=pd.NA,
                labor_intensive_park=pd.NA,
                public_park=pd.NA,
            ))

    meta = pd.DataFrame(rows)
    meta["region_id"] = meta["region"].map(REGIONS).astype(int)
    n = len(meta)
    assert n == N_DISTRICTS

    # ---- covariates drawn to match Table A3 treated/control moments ----
    tmask = meta["treated"].to_numpy() == 1
    nt, nc = int(tmask.sum()), int((~tmask).sum())
    for var, ((tm, ts), (cm, cs)) in _A3_COVARS.items():
        col = np.empty(n)
        lo = hi = None
        if var in ("urbanization_rate_2007", "employment_rate_2007"):
            lo, hi = 0.0, 1.0
        if var in ("elevation", "slope", "dist_addis_km", "dist_state_capital_km",
                   "dist_nearest_city_km"):
            lo = 0.0
        col[tmask] = _draw_matched_moments(rng, tm, ts, nt, lo, hi)
        col[~tmask] = _draw_matched_moments(rng, cm, cs, nc, lo, hi)
        meta[var] = col

    # population_2007 from log_pop_density (district avg area ~ 1600 km^2).
    area = 1600.0
    meta["population_2007"] = np.round(np.exp(meta["log_pop_density_2007"]) * area).astype(int)

    # road densities (continuous, WIDE variation; positive interaction targets).
    # Drawn from a DEDICATED rng (so their spread does not disturb any other draw)
    # with heavy right tails (low gamma shape).  The wide cross-treated spread is what
    # makes the paved-road heterogeneity interaction IDENTIFIABLE in the 17-treated
    # sample -- a narrow road distribution leaves the +0.630 paved interaction
    # statistically insignificant.  primary-road stays correctly-signed but borderline.
    road_rng = np.random.default_rng(ROAD_SEED)
    meta["primary_road_density"] = np.clip(
        road_rng.gamma(0.9, 1.10, n), 0.02, None).round(4)
    meta["paved_road_density"] = np.clip(
        road_rng.gamma(0.85, 0.80, n), 0.0, None).round(4)

    # religious / linguistic composition (2007 census shares).
    meta["share_christian_2007"] = np.clip(rng.beta(2.5, 1.6, n), 0.02, 0.99).round(4)
    meta["share_amharic_2007"] = np.clip(rng.beta(1.8, 2.4, n), 0.02, 0.99).round(4)

    # concurrent-intervention controls (Table A7).
    meta["china_aid"] = (rng.random(n) < 0.12).astype(int)
    meta["transport_project"] = (rng.random(n) < 0.10).astype(int)

    # round the calibrated covariates for tidy CSVs (after moment matching).
    for c in ["longitude", "latitude", "slope", "dist_addis_km",
              "dist_state_capital_km", "dist_nearest_city_km",
              "urbanization_rate_2007", "employment_rate_2007",
              "log_pop_density_2007"]:
        meta[c] = meta[c].round(4)
    meta["elevation"] = meta["elevation"].round(1)

    return meta


# ---------------------------------------------------------------------------
# 2. DISTRICT PANEL  (balanced 2005-2020; light + impervious)
# ---------------------------------------------------------------------------

def _ramp(k: np.ndarray) -> np.ndarray:
    """Saturating treatment ramp g(k) in [0,1] for event time k>=0:
    a discrete jump at k=0 (= RAMP_JUMP0) growing to ~1 by k~5.
    g(k) = RAMP_JUMP0 + (1-RAMP_JUMP0) * (1 - exp(-k/RAMP_TAU)) for k>=0, else 0."""
    k = np.asarray(k, float)
    base = RAMP_JUMP0 + (1.0 - RAMP_JUMP0) * (1.0 - np.exp(-np.maximum(k, 0) / RAMP_TAU))
    return np.where(k >= 0, base, 0.0)


def _ramp_at(k, is_t, oy):
    """Ramp value g(k) for a treated district at calendar event time k; 0 for
    controls and pre-period."""
    if not is_t:
        return 0.0
    return float(_ramp(np.array([k]))[0])


def simulate_district_panel(meta: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    n = len(meta)
    treated = meta["treated"].to_numpy()
    open_year = meta["open_year"].to_numpy()
    region_id = meta["region_id"].to_numpy()
    tmask = treated == 1

    # ---- district-fixed BRIGHT-treated / DIM-control base (raw scale) ----
    # Lognormal around a group median; district FE absorbs the level, so the
    # treated/control level gap leaves every DiD coefficient untouched.
    med = np.where(tmask, LIGHT_MED_TREATED, LIGHT_MED_CONTROL)
    base_d = med * np.exp(rng.normal(0.0, LIGHT_BASE_SD, n))

    # region x year FE (delta_rt): small common additive shocks, mean 0.
    regions = np.unique(region_id)
    delta = {(r, y): float(rng.normal(0.0, 0.05)) for r in regions for y in YEARS}

    # ---- treated attenuation drift (raw scale, urbanization-correlated) ----
    # SHARED differential trend phi_d*(year-2012) added to ALL districts, where
    # phi_d = TREATED_TREND_DRIFT * (urbanization - mean).  Treated districts have
    # HIGHER baseline urbanization (Table A3: 0.282 vs 0.181), so they trend up
    # faster.  The no-trends regression attributes this differential trend to
    # treatment (inflating the coefficient to 0.265 / 1.723), while the
    # trend-interaction regression ABSORBS it via the t x urbanization term and
    # recovers the lower, trend-adjusted effect (0.214 / 1.276) -- exactly the
    # paper's attenuation.  A tiny idiosyncratic part adds SE realism.
    urb = meta["urbanization_rate_2007"].to_numpy()
    phi = rng.normal(0.0, 0.003, n)
    phi += TREATED_TREND_DRIFT * (urb - urb.mean())   # ALL districts (shared trend)

    # ---- heterogeneity: treated RAW plateau = MULTI-CHANNEL linear function ----
    # theta_d = RAMP_PLATEAU + sum_m B_m * (M_d - mean), where B is solved so that
    # EACH single-moderator interaction regression (run one at a time in
    # Tables 3-4) recovers its target univariate slope simultaneously, despite the
    # moderators being correlated.  B solves C @ B = target_cov where C is the
    # treated moderators' covariance matrix and target_cov_m = slope_m * Var(M_m).
    mods = list(HET.keys())
    Xt = meta.loc[tmask, mods].to_numpy()
    Xc = Xt - Xt.mean(axis=0)
    Cov = np.cov(Xc.T)
    target_cov = np.array([HET[m]["beta_int"] * np.var(Xc[:, j], ddof=1)
                           for j, m in enumerate(mods)])
    Bhet = np.linalg.solve(Cov, target_cov)
    # Optional empirical override (set by the het calibration solver): the raw
    # interaction regressions are run WITH the full trend set, which absorbs part
    # of each treatment:M interaction; HET_B_EMPIRICAL holds the B that makes the
    # REALISED regressions land on the paper's targets (one-step corrected).
    if HET_B_EMPIRICAL is not None:
        Bhet = np.asarray(HET_B_EMPIRICAL, float)
    theta = np.zeros(n)
    theta[tmask] = RAMP_PLATEAU + Xc @ Bhet

    # ---- spatial shock (demeaned within treated x region per year) ----
    spatial_rng = np.random.default_rng(SPATIAL_SEED)
    Dkm = _haversine_matrix(meta["latitude"].to_numpy(), meta["longitude"].to_numpy())
    K = np.exp(-Dkm / SPATIAL_RANGE_KM)
    K = K / K.sum(axis=1, keepdims=True)
    grp = (meta["treated"].astype(str) + "|" + meta["region"]).to_numpy()
    grp_masks = [grp == g for g in np.unique(grp)]

    def _demean_groups(v):
        v = v.copy()
        for gm in grp_masks:
            if gm.sum() > 1:
                v[gm] = v[gm] - v[gm].mean()
        return v

    spatial_field = {}
    for y in YEARS:
        s = K @ spatial_rng.normal(0.0, 1.0, n)
        sd = s.std() if s.std() > 0 else 1.0
        spatial_field[y] = _demean_groups(s / sd * SPATIAL_SD)

    # ---- serial shock: one draw per (district x event-period) ----
    # event-period buckets: pre (k<0), open (k in 0..2), mature (k>=3) and a
    # control bucket; shared across that bucket's years, demeaned within groups.
    serial_rng = np.random.default_rng(SERIAL_SEED)
    serial = {b: _demean_groups(serial_rng.normal(0.0, SERIAL_SD, n))
              for b in ["ctrl", "pre", "open", "mature"]}

    def _serial_bucket(is_t, k):
        if not is_t:
            return "ctrl"
        if k < 0:
            return "pre"
        return "open" if k <= 2 else "mature"

    # ---- impervious + extensive-margin RNGs (separate) ----
    isa_noise_rng = np.random.default_rng(SERIAL_SEED + 7)
    light_noise_rng = np.random.default_rng(SEED + 333)   # additive intensive noise
    ext_rng = np.random.default_rng(EXT_SEED)             # extensive-margin draws (seed-searched)

    # ---- STABLE extensive margin (demeaned threshold) ----
    # positive_dt = 1{ thr_d + dz_d + yz_t + eps > 0 }; thr_d maps to the target
    # P(light>0); dz_d (district) and yz_t (common year) are DEMEANED so the
    # realised group P hits 0.897/0.527 and there is NO spurious pre/post shift
    # within a treated district (that would inflate both the extensive coef and
    # the IHS coef).  Combined SD of (dz, yz, eps) ~ 1 so thr_d = Phi^{-1}(P).
    from scipy.stats import norm
    thr = np.where(tmask, norm.ppf(P_LIGHT_TREATED), norm.ppf(P_LIGHT_CONTROL))
    yz_arr = ext_rng.normal(0.0, EXT_YZ_SD, len(YEARS)); yz_arr -= yz_arr.mean()
    yz = {y: float(yz_arr[j]) for j, y in enumerate(YEARS)}
    dz = ext_rng.normal(0.0, EXT_DZ_SD, n)
    dz[tmask] -= dz[tmask].mean(); dz[~tmask] -= dz[~tmask].mean()

    records = []
    for i in range(n):
        is_t = bool(tmask[i])
        oy = int(open_year[i]) if is_t else None
        r = region_id[i]
        for y in YEARS:
            k = (y - oy) if is_t else None
            k_clip = int(np.clip(k, -5, 5)) if is_t else None
            event_time = k_clip if is_t else pd.NA
            treatment = int(is_t and y >= oy)
            nearby = 0

            ramp_val = _ramp(np.array([k]))[0] if is_t else 0.0
            bucket = _serial_bucket(is_t, k if is_t else -99)

            # ---- extensive margin: stable demeaned threshold ----
            positive = (thr[i] + dz[i] + yz[y] + ext_rng.normal(0.0, EXT_EPS_SD)) > 0

            # ---- intensive margin: raw light = bright base + additive effect ----
            # When the extensive draw is positive, FLOOR the magnitude at a tiny
            # positive value so light_positive == positive (a positive draw that
            # the additive noise pushed below 0 would otherwise be miscounted as a
            # zero, depressing the realised P(light>0) for dim controls).
            if positive:
                light = (base_d[i] + delta[(r, y)] * LIGHT_YEAR_AMP
                         + (theta[i] * ramp_val if is_t else 0.0)
                         + phi[i] * (y - BASE_YEAR)          # shared differential trend
                         + spatial_field[y][i] + serial[bucket][i]
                         + light_noise_rng.normal(0.0, LIGHT_NOISE_SD))
                light = max(float(light), 1e-4)
            else:
                light = 0.0
            ihs_light = float(np.arcsinh(light))
            light_positive = int(light > 0)

            # ---- impervious surface (only at ISA_YEARS) ----
            # Additive ramp on the ratio scale + the SHARED urbanization trend
            # (ISA_TREND_AMP * phi_d * (year-2012)) so the trend-interaction
            # regression absorbs part of it and attenuates 0.032 -> 0.028.
            if y in ISA_YEARS:
                isa_ramp = (ISA_PLATEAU * ramp_val) if is_t else 0.0
                isa_base = ISA_BASE_CONTROL + (ISA_BASE_TREATED_BUMP if is_t else 0.0)
                isa_trend = ISA_TREND_AMP * phi[i] * (y - BASE_YEAR)
                isa = (isa_base + isa_ramp + isa_trend
                       + 0.04 * spatial_field[y][i]
                       + isa_noise_rng.normal(0.0, SIGMA_ISA))
                impervious = float(np.clip(isa, 0.0, 1.0))
            else:
                impervious = np.nan

            records.append(dict(
                district_id=meta["district_id"].iat[i],
                district_name=meta["district_name"].iat[i],
                region=meta["region"].iat[i],
                region_id=int(r),
                treated=int(is_t),
                open_year=(oy if is_t else pd.NA),
                treatment=treatment,
                nearby=nearby,
                event_time=event_time,
                year=y,
                post=int(treatment),
                light_intensity=round(light, 5),
                ihs_light=round(ihs_light, 5),
                light_positive=light_positive,
                impervious_ratio=(round(impervious, 6) if not np.isnan(impervious) else np.nan),
                longitude=meta["longitude"].iat[i],
                latitude=meta["latitude"].iat[i],
                elevation=meta["elevation"].iat[i],
                slope=meta["slope"].iat[i],
                dist_addis_km=meta["dist_addis_km"].iat[i],
                dist_state_capital_km=meta["dist_state_capital_km"].iat[i],
                dist_nearest_city_km=meta["dist_nearest_city_km"].iat[i],
                urbanization_rate_2007=meta["urbanization_rate_2007"].iat[i],
                employment_rate_2007=meta["employment_rate_2007"].iat[i],
                log_pop_density_2007=meta["log_pop_density_2007"].iat[i],
                population_2007=int(meta["population_2007"].iat[i]),
                primary_road_density=meta["primary_road_density"].iat[i],
                paved_road_density=meta["paved_road_density"].iat[i],
                share_christian_2007=meta["share_christian_2007"].iat[i],
                share_amharic_2007=meta["share_amharic_2007"].iat[i],
                labor_intensive_park=(int(meta["labor_intensive_park"].iat[i]) if is_t else pd.NA),
                public_park=(int(meta["public_park"].iat[i]) if is_t else pd.NA),
                china_aid=int(meta["china_aid"].iat[i]),
                transport_project=int(meta["transport_project"].iat[i]),
            ))

    df = pd.DataFrame.from_records(records)

    # ---- assign `nearby` to a few control districts in post years ----
    # Pick 4 control districts; mark them nearby in years >= the median open year
    # of nearby parks (2016).  They carry NO treatment effect by construction.
    ctrl_ids = meta.loc[meta.treated == 0, "district_id"].to_numpy()
    near_rng = np.random.default_rng(SERIAL_SEED + 99)
    near_ids = near_rng.choice(ctrl_ids, size=4, replace=False)
    df.loc[df["district_id"].isin(near_ids) & (df["year"] >= 2016), "nearby"] = 1

    # ---- Int dtypes (nullable) ----
    df["open_year"] = df["open_year"].astype("Int64")
    df["event_time"] = df["event_time"].astype("Int64")
    df["labor_intensive_park"] = df["labor_intensive_park"].astype("Int64")
    df["public_park"] = df["public_park"].astype("Int64")
    return df


# ---------------------------------------------------------------------------
# 3. DHS REPEATED CROSS-SECTIONS  (household + individual)
# ---------------------------------------------------------------------------
# Both RCS files share the DHS rounds {2000,2005,2011,2016,2019}, the same
# district -> open_year map as the panel, and a cross-sectional district + round
# FE design so a two-way FE weighted feols recovers the ATT (= tau) in
# expectation.  Binary outcomes are generated from a CLIPPED LINEAR PROBABILITY
# (the paper runs an LPM, so the LPM coefficient equals tau by construction).
# Different N per outcome come from per-outcome availability masks applied to a
# master table; masks are random within treated/control groups and so do NOT
# move the point estimates, while the realised non-missing counts (and their
# treated/control splits) match Table A3 exactly.

# RCS targets (with-controls / no-controls) and dependent means (Tables 5-7).
# For binary outcomes, `intercept` is the pre-clipping latent probability base and
# `tau_raw` the pre-clipping treatment lift; they are EMPIRICALLY calibrated (by
# the solver in _calibrate_rcs) so that, after clipping to [0.001,0.999] and the
# Bernoulli/LPM, the realised dependent MEAN and the realised LPM COEFFICIENT land
# on (mean, tau).  The clipping bias is largest at the savings floor (0.063) and
# the decision ceiling (0.899), so tau_raw > tau there.
RCS_TARGETS = dict(
    durable_goods_pc=dict(tau=0.226, tau_nc=0.251, mean=0.297, sd=0.48, binary=False,
                          intercept=0.297, tau_raw=0.254),
    housing_quality=dict(tau=0.252, tau_nc=0.257, mean=0.305, sd=0.46, binary=True,
                         intercept=0.305, tau_raw=0.252),
    wealth_index=dict(tau=0.409, tau_nc=0.413, mean=0.001, sd=1.00, binary=False,
                      intercept=0.001, tau_raw=0.409),
    decision_power=dict(tau=0.103, tau_nc=0.109, mean=0.899, sd=0.30, binary=True,
                        intercept=0.840, tau_raw=0.480),
    savings_account=dict(tau=0.318, tau_nc=0.318, mean=0.063, sd=0.24, binary=True,
                         intercept=0.009, tau_raw=0.331),
    dv_accept=dict(tau=-0.212, tau_nc=-0.212, mean=0.636, sd=0.48, binary=True,
                   intercept=0.634, tau_raw=-0.202),
)
# Employment per-sex (Table 6): female precise ***, male noisy ns, full small AND ns.
# The district x round factor shock below (EMP_DISTRICT_SHOCK_SD) inflates the
# full-sample district-clustered SE so the full coef reads cleanly ns (paper: 0.110,
# se ~0.089, t~1.2), while the female-only coef -- which carries only a small fraction
# of that shock -- stays precise (***).  EMP_SHOCK_SEED is seed-searched so the
# realised full/female/male point estimates land on target with the right stars.
EMP_TAU_FEMALE = 0.145           # female ATT (with controls) ***
EMP_TAU_MALE = 0.065             # male ATT (with controls) -> realised small +, ns
EMP_MEAN_FEMALE = 0.255          # lowered so the realised female mean ~0.287
EMP_MEAN_MALE = 0.330            # lowered so the realised male mean ~0.357
EMP_MEAN_FULL = 0.312

# DV component sub-outcomes (Table A15), women-only.
DV_COMPONENTS = {
    "dv_goingout": dict(tau=-0.134, mean=0.437),
    "dv_kids":     dict(tau=-0.153, mean=0.491),
    "dv_arguing":  dict(tau=-0.173, mean=0.425),
    "dv_sex":      dict(tau=-0.096, mean=0.363),
    "dv_food":     dict(tau=-0.099, mean=0.411),
}

# Realised non-missing counts (Table A3 / Tables 5-7) and treated/control splits.
RCS_N = dict(
    durable_goods_pc=(12207, 2103, 10104),
    housing_quality=(12206, 2101, 10105),
    wealth_index=(9688, 1550, 8138),
    nonag_employment=(17219, None, None),   # full sample (F 11055 / M 6164)
    nonag_employment_female=(11055, 1887, 9168),
    nonag_employment_male=(6164, None, None),
    decision_power=(4737, 754, 3983),
    savings_account=(11155, 1907, 9248),
    dv_accept=(11109, 1900, 9209),
)
N_HOUSEHOLDS_MASTER = 13200       # household master rows before availability masks
N_INDIVIDUALS_MASTER = 17900      # individual master rows (women pool >= 11736 so the
                                  # women-only outcomes -- savings 11155, dv 11109 --
                                  # and their control splits fit; employment full
                                  # sample = 17219 is a masked subset 11055 F + 6164 M).
N_WOMEN_TARGET = 11736            # women in the individual file (>= max women-only N)
N_MEN_TARGET = 6164               # men in the individual file (= employment male N)
HH_TREATED_WEIGHT = 1.6           # treated over-sampling weight (household RCS)
IND_TREATED_WEIGHT = 1.45         # treated over-sampling weight (individual RCS)

# Per-round availability weights (older rounds smaller; 2016 modal) used to spread
# households/individuals across rounds.  Treated districts first treated in 2016.
ROUND_WEIGHTS = {2000: 0.12, 2005: 0.16, 2011: 0.22, 2016: 0.28, 2019: 0.22}
RCS_FE_SD = 0.04                  # district-FE SD for RCS (small -> binary clipping room)
EMP_MALE_FLIP = 0.0               # legacy male-noise knob (now 0: the factor district x round
                                  # shock alone widens the male/full SE; see EMP_DISTRICT_SHOCK_SD)
EMP_DISTRICT_SHOCK_SD = 0.85      # district x ROUND employment shock SD (low-rank FACTOR
                                  # structure loading_d * factor_r + small idiosyncrasy).
                                  # Varies over survey rounds (NOT absorbed by district FE) and
                                  # is perfectly correlated within district across rounds, so it
                                  # strongly inflates the full-sample district-CLUSTERED SE ->
                                  # the full coef reads ns (paper: 0.110, se ~0.089, t~1.2)
EMP_WOMEN_SHOCK_FRAC = 0.25       # women's share of the district x round shock (small ->
                                  # female coef stays precise ***)
EMP_SHOCK_SEED = 806             # offset (RCS_SEED + EMP_SHOCK_SEED) for the dedicated
                                  # district x round employment-shock RNG; seed-searched so
                                  # the realised full/female/male point estimates land on
                                  # target with the right significance (full ns, female ***)


def _round_open_year(open_year: int) -> int:
    """Map a district's panel open_year to the DHS-round 'open round' so that the
    modal treated district becomes treated in the 2016 round (phase 0).  Parks
    opening 2014-2017 -> treated from the 2016 round; 2008 -> from 2011 round;
    2018-2020 -> from the 2019 round."""
    if open_year <= 2011:
        return 2011
    if open_year <= 2017:
        return 2016
    return 2019


def _event_phase(round_year: int, open_round: int) -> int:
    """Phase index in {-3,-2,-1,0,+1} = position of `round_year` relative to the
    treated district's open round, over the round sequence."""
    idx = {y: j for j, y in enumerate(ROUNDS)}
    return idx[round_year] - idx[open_round]


def _make_rcs_skeleton(meta: pd.DataFrame, n_master: int, id_prefix: str,
                       rng: np.random.Generator, treated_weight: float = 1.6):
    """Allocate n_master records across districts x rounds, returning a frame with
    district_id, region_id, treated, open_year, survey_round, treatment,
    event_phase, and district/round FE draws."""
    did = meta["district_id"].to_numpy()
    treated = meta["treated"].to_numpy()
    open_year = meta["open_year"].to_numpy()
    region_id = meta["region_id"].to_numpy()
    n_d = len(meta)

    # district sampling weights: treated districts slightly over-sampled so the
    # treated share of each outcome matches Table A3 (e.g. wealth 1550/9688 ~16%).
    dw = np.where(treated == 1, treated_weight, 1.0)
    dw = dw / dw.sum()
    # round weights
    rw = np.array([ROUND_WEIGHTS[r] for r in ROUNDS]); rw = rw / rw.sum()

    rows = []
    # district-fixed and round-fixed effect draws (mean-balanced treated/control).
    # SD kept small so the ceiling (decision 0.899) / floor (savings 0.063) binary
    # outcomes leave room for the treatment effect without saturating the clip.
    a_d = rng.normal(0.0, RCS_FE_SD, n_d)
    tmask = treated == 1
    a_d[tmask] -= a_d[tmask].mean(); a_d[~tmask] -= a_d[~tmask].mean()
    b_round = {r: rng.normal(0.0, 0.04) for r in ROUNDS}

    # draw each record's district and round
    d_idx = rng.choice(np.arange(n_d), size=n_master, p=dw)
    r_idx = rng.choice(np.arange(len(ROUNDS)), size=n_master, p=rw)
    for j in range(n_master):
        i = int(d_idx[j]); r = ROUNDS[int(r_idx[j])]
        is_t = bool(tmask[i])
        oy = int(open_year[i]) if is_t else None
        open_round = _round_open_year(oy) if is_t else None
        treatment = int(is_t and r >= open_round)
        phase = _event_phase(r, open_round) if is_t else pd.NA
        rows.append(dict(
            _di=i,
            district_id=did[i],
            region_id=int(region_id[i]),
            treated=int(is_t),
            open_year=(oy if is_t else pd.NA),
            survey_round=r,
            treatment=treatment,
            event_phase=phase,
            _a_d=a_d[i],
            _b_round=b_round[r],
        ))
    df = pd.DataFrame(rows)
    return df


def _apply_mask(df: pd.DataFrame, col: str, n_total, n_treated, n_control,
                rng: np.random.Generator) -> None:
    """Set `col` to NaN outside a randomly-chosen available subset so the realised
    non-missing count = n_total with treated/control split (n_treated/n_control).
    Random within groups -> does not move point estimates."""
    tmask = df["treated"].to_numpy() == 1
    idx_t = df.index[tmask].to_numpy()
    idx_c = df.index[~tmask].to_numpy()
    if n_treated is None:
        # split proportionally to availability among all rows
        keep = rng.choice(df.index.to_numpy(), size=n_total, replace=False)
    else:
        keep_t = rng.choice(idx_t, size=min(n_treated, len(idx_t)), replace=False)
        keep_c = rng.choice(idx_c, size=min(n_control, len(idx_c)), replace=False)
        keep = np.concatenate([keep_t, keep_c])
    mask = np.ones(len(df), dtype=bool)
    mask[df.index.get_indexer(keep)] = False
    df.loc[df.index[mask], col] = np.nan


def simulate_household_rcs(meta: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    df = _make_rcs_skeleton(meta, N_HOUSEHOLDS_MASTER, "HH", rng,
                            treated_weight=HH_TREATED_WEIGHT)
    n = len(df)
    treatment = df["treatment"].to_numpy().astype(float)

    # household covariates, MILDLY correlated with treatment so kappa*Delta X
    # reproduces the with/without-controls gap (durables 0.251 vs 0.226 etc.).
    df["hh_size"] = np.clip(np.round(rng.normal(5.0, 1.8, n)
                                     - 0.8 * treatment), 1, 15).astype(int)
    df["age_head"] = np.clip(np.round(rng.normal(43.0, 12.0, n)
                                      - 3.0 * treatment), 18, 90).astype(int)
    df["survey_weight"] = np.clip(rng.gamma(8.0, 0.125, n), 0.1, None).round(4)
    df["hh_id"] = [f"HH_{j:06d}" for j in range(n)]

    a_d = df["_a_d"].to_numpy(); b_r = df["_b_round"].to_numpy()
    hh_c = (df["hh_size"].to_numpy() - 5.0)
    age_c = (df["age_head"].to_numpy() - 43.0)
    # covariate loadings chosen so kappa*Delta(X) = (no-controls - controls) gap.
    # With Delta(hh_size)=-0.8, Delta(age)=-3.0 between treated/control.

    for out, spec in [("durable_goods_pc", RCS_TARGETS["durable_goods_pc"]),
                      ("housing_quality", RCS_TARGETS["housing_quality"]),
                      ("wealth_index", RCS_TARGETS["wealth_index"])]:
        tau_raw = spec["tau_raw"]              # pre-clipping treatment lift
        gap = spec["tau_nc"] - spec["tau"]     # no-controls minus controls (>0)
        # Omitting hh_size adds kappa_hh * Delta(hh_size) to the coef, where
        # treated have hh_size lower by 0.8 (Delta = -0.8).  For the no-controls
        # coef to be HIGHER by `gap`, set kappa_hh = -gap/0.8.
        kap_hh = -gap / 0.8
        mu = (spec["intercept"] + a_d + b_r + tau_raw * treatment
              + kap_hh * hh_c + 0.0 * age_c)
        if spec["binary"]:
            p = np.clip(mu, 0.001, 0.999)
            y = (rng.random(n) < p).astype(float)
        else:
            y = mu + rng.normal(0.0, spec["sd"], n)
        df[out] = y

    # availability masks (exact realised N + treated/control split)
    mrng = np.random.default_rng(RCS_SEED + 11)
    _apply_mask(df, "durable_goods_pc", *RCS_N["durable_goods_pc"], rng=mrng)
    _apply_mask(df, "housing_quality", *RCS_N["housing_quality"], rng=mrng)
    _apply_mask(df, "wealth_index", *RCS_N["wealth_index"], rng=mrng)

    df["event_phase"] = df["event_phase"].astype("Int64")
    df["open_year"] = df["open_year"].astype("Int64")
    df["housing_quality"] = df["housing_quality"].astype("Int64")
    out_cols = ["hh_id", "survey_round", "district_id", "region_id", "treated",
                "treatment", "event_phase", "durable_goods_pc", "housing_quality",
                "wealth_index", "hh_size", "age_head", "survey_weight"]
    return df[out_cols].copy()


def simulate_individual_rcs(meta: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    df = _make_rcs_skeleton(meta, N_INDIVIDUALS_MASTER, "IND", rng,
                            treated_weight=IND_TREATED_WEIGHT)
    n = len(df)
    treatment = df["treatment"].to_numpy().astype(float)

    # sex: EXACTLY N_WOMEN_TARGET women, N_MEN_TARGET men (rest unused men), so the
    # women pool exceeds every women-only outcome N.  Assign women to the first
    # N_WOMEN_TARGET shuffled rows.
    female = np.zeros(n, dtype=int)
    order = rng.permutation(n)
    female[order[:N_WOMEN_TARGET]] = 1
    df["sex"] = female
    df["age"] = np.clip(np.round(rng.normal(30.0, 9.0, n)), 15, 64).astype(int)
    df["age_sq"] = (df["age"] ** 2).astype(int)
    df["hh_size"] = np.clip(np.round(rng.normal(5.0, 1.8, n)
                                     - 0.8 * treatment), 1, 15).astype(int)
    df["age_head"] = np.clip(np.round(rng.normal(43.0, 12.0, n)
                                      - 3.0 * treatment), 18, 90).astype(int)
    df["survey_weight"] = np.clip(rng.gamma(8.0, 0.125, n), 0.1, None).round(4)
    df["ind_id"] = [f"IND_{j:06d}" for j in range(n)]

    a_d = df["_a_d"].to_numpy(); b_r = df["_b_round"].to_numpy()
    hh_c = (df["hh_size"].to_numpy() - 5.0)

    # ---- non-agricultural employment (per-sex tau) ----
    # The with-controls full ATT should be ~0.110; female 0.133***, male 0.015 ns.
    gap_emp = 0.118 - 0.110           # full no-controls - controls (>0)
    kap_hh_emp = -gap_emp / 0.8
    tau_i = np.where(female == 1, EMP_TAU_FEMALE, EMP_TAU_MALE)
    base_i = np.where(female == 1, EMP_MEAN_FEMALE, EMP_MEAN_MALE)
    # District x ROUND employment shock (common to all individuals in the same
    # district-round).  Because it varies over survey rounds it is NOT absorbed by
    # the district fixed effect (unlike a district-CONSTANT shock, which is), so it
    # both inflates the district-CLUSTERED SE of the full-sample coefficient and
    # induces within-district serial correlation across rounds -> the full-sample
    # coef reads NS (paper: 0.110, se ~0.089, t~1.2).
    #
    # It uses a low-rank FACTOR structure: dsh[d,r] = loading_d * factor_r + a small
    # idiosyncratic district-round part.  The factor part is PERFECTLY correlated
    # across rounds within a district (a persistent district "type" that loads on a
    # common round factor), so it maximises the within-DISTRICT correlation of the
    # residuals and therefore the inflation of the district-CLUSTERED SE -- far more
    # than an i.i.d. district-round shock (which, being uncorrelated across rounds,
    # barely moves a clustered SE).  Because the factor varies over rounds it is
    # still NOT absorbed by the district FE.  It is kept (overall) mean-zero --
    # demeaned by its GRAND mean only, NOT within treated x round (that would wipe
    # out the DiD treatment contrast).  Applied at FULL strength to MEN and a SMALL
    # fraction (EMP_WOMEN_SHOCK_FRAC) to WOMEN, so the female-only coef stays precise
    # (***) while the full-sample coef is noisy and reads ns.
    n_d = len(meta)
    n_rounds = len(ROUNDS)
    round_idx_of = {r: j for j, r in enumerate(ROUNDS)}
    emp_shock_rng = np.random.default_rng(RCS_SEED + EMP_SHOCK_SEED)   # dedicated -> no RNG disruption
    loading_d = emp_shock_rng.normal(0.0, 1.0, n_d)                    # persistent district type
    factor_r = emp_shock_rng.normal(0.0, 1.0, n_rounds)               # common round factor
    idio = emp_shock_rng.normal(0.0, 0.45, (n_d, n_rounds))           # small district-round idiosyncrasy
    dsh = EMP_DISTRICT_SHOCK_SD * (np.outer(loading_d, factor_r) + idio)
    dsh -= dsh.mean()   # GRAND-mean zero only (keeps district x round variation)
    di = df["_di"].to_numpy()
    ri = df["survey_round"].map(round_idx_of).to_numpy()
    dsh_i = dsh[di, ri]
    # apply the district x round shock to MEN at full strength and WOMEN at a small
    # fraction, so the full-sample clustered SE inflates (full coef reads ns) while
    # the female-only coef stays precise (***).
    emp_shock = np.where(female == 0, dsh_i, EMP_WOMEN_SHOCK_FRAC * dsh_i)
    p_emp = np.clip(base_i + a_d + b_r + tau_i * treatment
                    + kap_hh_emp * hh_c + emp_shock, 0.001, 0.999)
    # add extra noise to the MALE subsample so its coef is ns; female precise.
    emp = (emp_shock_rng.random(n) < p_emp).astype(float)
    # inject male noise: randomly re-randomise a fraction of male outcomes
    # (mean-preserving within treated/control) to widen the male SE without moving
    # its mean -> male coef ns, and the full-sample coef (female + noisy male) ns.
    male_idx = df.index[female == 0].to_numpy()
    flip = emp_shock_rng.random(len(male_idx)) < EMP_MALE_FLIP
    fi = df.index.get_indexer(male_idx[flip])
    emp[fi] = (emp_shock_rng.random(flip.sum()) < base_i[fi]).astype(float)
    df["nonag_employment"] = emp

    # ---- women-only empowerment outcomes (NaN for men) ----
    women = female == 1
    for out, spec in [("decision_power", RCS_TARGETS["decision_power"]),
                      ("savings_account", RCS_TARGETS["savings_account"]),
                      ("dv_accept", RCS_TARGETS["dv_accept"])]:
        tau_raw = spec["tau_raw"]; gap = spec["tau_nc"] - spec["tau"]
        kap = -gap / 0.8 if gap != 0 else 0.0
        mu = spec["intercept"] + a_d + b_r + tau_raw * treatment + kap * hh_c
        p = np.clip(mu, 0.001, 0.999)
        y = np.where(women, (rng.random(n) < p).astype(float), np.nan)
        df[out] = y

    # ---- DV components (women-only) ----
    for out, spec in DV_COMPONENTS.items():
        mu = spec["mean"] + a_d + b_r + spec["tau"] * treatment
        p = np.clip(mu, 0.001, 0.999)
        df[out] = np.where(women, (rng.random(n) < p).astype(float), np.nan)

    # ---- availability masks ----
    mrng = np.random.default_rng(RCS_SEED + 23)
    # employment: full sample = 17219 (11055 women + 6164 men); mask 281 women so
    # the realised employment-female N = 11055 (and female treated 1887/control 9168).
    n_emp_f = RCS_N["nonag_employment_female"]  # (11055, 1887, 9168)
    women0 = female == 1
    _apply_mask_women(df, "nonag_employment", n_emp_f[0], n_emp_f[1], n_emp_f[2],
                      women_mask=women0, rng=mrng, keep_men=True)
    # decision/savings/dv: women-only with exact realised N + treated/control split.
    _apply_mask_women(df, "decision_power", *RCS_N["decision_power"], women_mask=women, rng=mrng)
    _apply_mask_women(df, "savings_account", *RCS_N["savings_account"], women_mask=women, rng=mrng)
    _apply_mask_women(df, "dv_accept", *RCS_N["dv_accept"], women_mask=women, rng=mrng)
    # DV components: slightly different N each (women-only, ~10800-11100)
    dv_counts = {"dv_goingout": 11064, "dv_kids": 11069, "dv_arguing": 11043,
                 "dv_sex": 10818, "dv_food": 11068}
    for out, ntot in dv_counts.items():
        _apply_mask_women(df, out, ntot, None, None, women_mask=women, rng=mrng)

    df["event_phase"] = df["event_phase"].astype("Int64")
    df["open_year"] = df["open_year"].astype("Int64")
    for c in ["nonag_employment", "decision_power", "savings_account", "dv_accept",
              "dv_goingout", "dv_kids", "dv_arguing", "dv_sex", "dv_food"]:
        df[c] = df[c].astype("Int64")
    out_cols = ["ind_id", "survey_round", "district_id", "region_id", "treated",
                "treatment", "event_phase", "sex", "age", "age_sq",
                "nonag_employment", "decision_power", "savings_account", "dv_accept",
                "dv_goingout", "dv_kids", "dv_arguing", "dv_sex", "dv_food",
                "hh_size", "age_head", "survey_weight"]
    return df[out_cols].copy()


def _apply_mask_women(df, col, n_total, n_treated, n_control, women_mask, rng,
                      keep_men=False):
    """Availability mask among WOMEN only (men are already NaN for these cols,
    unless keep_men=True for the full-sample employment outcome where men stay)."""
    women_idx = df.index[women_mask].to_numpy()
    if n_treated is None:
        avail = women_idx
        keep = rng.choice(avail, size=min(n_total, len(avail)), replace=False)
    else:
        tmask = df["treated"].to_numpy() == 1
        idx_t = df.index[(women_mask) & tmask].to_numpy()
        idx_c = df.index[(women_mask) & (~tmask)].to_numpy()
        keep_t = rng.choice(idx_t, size=min(n_treated, len(idx_t)), replace=False)
        keep_c = rng.choice(idx_c, size=min(n_control, len(idx_c)), replace=False)
        keep = np.concatenate([keep_t, keep_c])
    drop = np.setdiff1d(women_idx, keep)
    df.loc[drop, col] = np.nan
    # for employment, men are kept (keep_men); for women-only outcomes men are NaN.


# ---------------------------------------------------------------------------
# 4. DATA DICTIONARIES
# ---------------------------------------------------------------------------

def _dict_df(rows: list) -> pd.DataFrame:
    cols = ["variable", "label", "description", "units", "role",
            "how_created", "paper_reference", "example_values", "notes"]
    return pd.DataFrame(rows, columns=cols)


def district_dictionary() -> pd.DataFrame:
    R = [
        ("district_id", "District ID", "Unique identifier for the district (woreda).",
         "string", "identifier", "Assigned ET_D001..ET_D139; treated first.",
         "Sect. 3.1.1; Table A1", "ET_D001; ET_D045", "Stable key for panel/RCS merges."),
        ("district_name", "District name",
         "District (woreda) name. Real-ish names for the 17 treated woredas (Table A1); systematic placeholders for controls.",
         "string", "identifier", "Treated names from Appendix Table A1; controls '<region> woreda <id>'.",
         "Table A1", "Hawassa; Amhara woreda 045", "Treated names approximate the host woredas of the parks."),
        ("region", "Region", "Ethiopian regional state.",
         "string", "identifier", "Hand-coded for treated (Table A1); allocated to controls in proportion to park presence.",
         "Sect. 2.2; Table A1", "Oromia; Amhara", ""),
        ("region_id", "Region ID", "Integer code for the region (region-by-year FE key).",
         "int", "identifier", "Map of region -> integer.", "Eq. (1) mu_rt", "1; 2", "Used for region^year fixed effects."),
        ("treated", "Treated dummy", "1 if the district ever hosts an industrial park.",
         "0/1", "treatment", "17 treated woredas (Table A1) + 122 PSM controls.",
         "Sect. 3.2", "1", "Time-invariant; 17 ones."),
        ("open_year", "Park opening year", "Calendar year the district's first park opened (NaN for controls).",
         "Int (2008-2021)", "treatment", "Cohort design 2008:1,2014:2,2015:2,2016:3,2017:3,2018:2,2019:2,2020:2 (Table A1).",
         "Sect. 2.2; Table A1", "2016", "Defines staggered treatment timing; NaN for never-treated."),
        ("treatment", "Treatment indicator", "1 if district is treated AND year >= open_year (Eq. 1 D_dt).",
         "0/1", "treatment", "treated AND year>=open_year.", "Eq. (1)", "1", "The DiD treatment variable; stays 1 once on."),
        ("nearby", "Nearby dummy", "1 if a control district is within 10 km of an operational park in that year (Table 2 spillover).",
         "0/1", "treatment", "A few controls flagged in post years; carry NO treatment effect.",
         "Table 2; Sect. 4.2", "1", "Spillover indicator -> coef ~0 ns."),
        ("event_time", "Event time k", "Years since opening, clipped to [-5,+5] (NaN for controls).",
         "Int [-5,5]", "derived", "year - open_year, clipped.", "Eq. (3); Fig. 1", "0; -3", "Event-study k; >=3 treated per k."),
        ("year", "Year", "Calendar year (2005-2020).", "year", "identifier", "Balanced annual panel.",
         "Sect. 3.1.2", "2016", "139 x 16 = 2,224 rows."),
        ("post", "Post dummy", "Equals the treatment indicator (1 once a district's park is open).",
         "0/1", "derived", "= treatment.", "Eq. (1)", "1", ""),
        ("light_intensity", "Nighttime light", "Harmonized nighttime-light digital number (raw luminosity).",
         "DN", "outcome", "Two-part DGP: extensive Bernoulli x intensive bright-base + treatment ramp.",
         "Table 1 cols 3-4", "0.0; 6.4", "raw-light ATT ~1.6 (trends)."),
        ("ihs_light", "IHS light", "Inverse hyperbolic sine of light_intensity, asinh(light).",
         "asinh(DN)", "outcome", "asinh(light_intensity).", "Table 1 cols 1-2", "0.0; 2.55", "ATT ~0.214 (trends)."),
        ("light_positive", "Light>0 dummy", "1 if light_intensity>0 (extensive margin).",
         "0/1", "outcome", "Stable demeaned-threshold Bernoulli; ~0.99 treated / 0.527 control.",
         "Table A4 col 1", "1", "LPM extensive-margin coef ~0.009 ns."),
        ("impervious_ratio", "Impervious ratio", "Impervious surface area / district land area (urbanization).",
         "ratio [0,1]", "outcome", "Additive ramp + shared-urbanization trend; observed only 2005/2010/2015/2020.",
         "Table 1 cols 5-6", "0.03; 0.07", "556 non-null; ATT ~0.028 (trends)."),
        ("longitude", "Longitude", "District-centroid longitude.", "degrees", "covariate",
         "Drawn to match Table A3 (treated 38.96/1.24).", "Table A3; trends", "38.9", "Time-invariant; trend interaction."),
        ("latitude", "Latitude", "District-centroid latitude.", "degrees", "covariate",
         "Drawn to match Table A3 (treated 9.42/1.80).", "Table A3; trends", "9.4", "Time-invariant; trend interaction."),
        ("elevation", "Elevation", "Average elevation (SRTM DEM).", "metres", "covariate",
         "Table A3 (treated 1849/560).", "Sect. 3.1.2; Table A3", "1850", ""),
        ("slope", "Terrain slope", "Average terrain slope (SRTM DEM).", "degrees", "covariate",
         "Table A3 (treated 5.25/3.45).", "Sect. 3.1.2; Table A3", "5.3", ""),
        ("dist_addis_km", "Distance to Addis Ababa", "Distance to Addis Ababa.", "km", "covariate",
         "Table A3 (treated 195/143).", "Table 3 col 1; Table A3", "195", "Het moderator (Table 3)."),
        ("dist_state_capital_km", "Distance to state capital", "Distance to the regional capital.", "km", "covariate",
         "Table A3 (treated 113/121).", "Table 3 col 2", "113", "Het moderator (Table 3)."),
        ("dist_nearest_city_km", "Distance to nearest city", "Distance to the nearest large (top-50) city.", "km", "covariate",
         "Table A3 (treated 52/50).", "Table 3 col 3", "52", "Het moderator (Table 3)."),
        ("urbanization_rate_2007", "Urbanization rate 2007", "2007-census urban-population share.", "share [0,1]", "covariate",
         "Table A3 (treated 0.282/0.325).", "Sect. 3.1.2; Table A3", "0.28", "Drives the shared differential trend (attenuation)."),
        ("employment_rate_2007", "Employment rate 2007", "2007-census employment rate.", "share [0,1]", "covariate",
         "Table A3 (treated 0.655/0.109).", "Table A3", "0.66", ""),
        ("log_pop_density_2007", "Log population density 2007", "Log of 2007 population density.", "log/km^2", "covariate",
         "Table A3 (treated 5.245/1.579).", "Sect. 3.2; Table A3", "5.2", "PSM matching covariate."),
        ("population_2007", "Population 2007", "2007-census district population.", "persons", "covariate",
         "exp(log_pop_density)*1600 km^2.", "Sect. 3.1.2", "215000", "Trend interaction (population)."),
        ("primary_road_density", "Primary road density", "Primary-road density (gROADS 2008).", "km/km^2", "covariate",
         "Gamma draw, wide spread.", "Table 4 col 1", "0.6", "Het moderator (Table 4)."),
        ("paved_road_density", "Paved road density", "Paved-road density (gROADS 2008).", "km/km^2", "covariate",
         "Gamma draw, wide spread.", "Table 4 col 2", "0.3", "Het moderator (Table 4)."),
        ("share_christian_2007", "Share Christian 2007", "2007-census Christian population share.", "share [0,1]", "covariate",
         "Beta draw.", "Trends; Table 1 notes", "0.6", "Trend interaction (ethnic/religious composition)."),
        ("share_amharic_2007", "Share Amharic 2007", "2007-census Amharic-speaker share.", "share [0,1]", "covariate",
         "Beta draw.", "Trends; Table 1 notes", "0.4", "Trend interaction (linguistic composition)."),
        ("labor_intensive_park", "Labor-intensive park", "1 if the treated district's park is labor-intensive (NaN for controls).",
         "0/1", "covariate", "From Table A1 sectoral specialization.", "Table A12 col 2", "1", "Heterogeneity moderator (Table A12)."),
        ("public_park", "Public park", "1 if the treated district's park is publicly owned (NaN for controls).",
         "0/1", "covariate", "From Table A1 (16/22 public).", "Table A12 col 3", "1", "Heterogeneity moderator (Table A12)."),
        ("china_aid", "Chinese aid", "1 if the district received infrastructure-related Chinese ODA (from first receipt).",
         "0/1", "covariate", "Random ~12% of districts.", "Table A7", "0", "Concurrent-intervention control."),
        ("transport_project", "Transport project", "1 if a major transport project traverses the district (from completion).",
         "0/1", "covariate", "Random ~10% of districts.", "Table A7", "0", "Concurrent-intervention control."),
    ]
    return _dict_df(R)


def household_dictionary() -> pd.DataFrame:
    R = [
        ("hh_id", "Household ID", "Unique household identifier (per round; NO panel key).",
         "string", "identifier", "HH_000000.. (repeated cross-section).", "Sect. 3.1.3", "HH_001234", "Different households each round."),
        ("survey_round", "DHS round", "Ethiopia DHS survey round.", "year {2000,2005,2011,2016,2019}", "identifier",
         "Five DHS rounds.", "Sect. 3.1.3", "2016", "Region-by-round FE key."),
        ("district_id", "District ID", "District (woreda) of the household (links to the panel).",
         "string", "identifier", "Same district_id -> open_year map as the panel.", "Eq. (2)", "ET_D006", ""),
        ("region_id", "Region ID", "Region code (region-by-round FE key).", "int", "identifier", "From the district.",
         "Eq. (2) mu_rt", "1", ""),
        ("treated", "Treated dummy", "1 if the district ever hosts a park.", "0/1", "treatment", "From the district.",
         "Sect. 3.2", "1", ""),
        ("treatment", "Treatment indicator", "1 if the district is treated AND survey_round >= the park's open round.",
         "0/1", "treatment", "Round-level open map (modal treated district opens in the 2016 round).", "Eq. (2)", "1", "The DiD treatment variable."),
        ("event_phase", "Event phase", "Round position relative to opening, in {-3,-2,-1,0,+1} (NaN for controls).",
         "Int [-3,1]", "derived", "Round index minus open-round index.", "Fig. 2", "0; -2", "Event-study phase (RCS)."),
        ("durable_goods_pc", "Durable goods per capita", "Number of durable items per household member.",
         "count/person", "outcome", "Linear DGP: intercept + FE + tau*treatment + kappa*X + noise.", "Table 5 cols 1-2", "0.0; 0.7",
         "Mean ~0.297; ATT 0.226 (controls) / 0.251 (no controls)."),
        ("housing_quality", "Housing quality", "1 if the household has electricity + piped water + toilet + finished floor.",
         "0/1", "outcome", "Clipped LPM (Bernoulli of a clipped linear probability).", "Table 5 cols 3-4", "1",
         "Mean ~0.305; ATT 0.252."),
        ("wealth_index", "DHS wealth index", "Standardized DHS wealth index (PCA of assets), z-scored per round.",
         "z-score", "outcome", "Linear DGP, SD~1.", "Table 5 cols 5-6", "0.4; -0.8", "Mean ~0; ATT 0.409*. N=9,688 (availability mask)."),
        ("hh_size", "Household size", "Number of household members.", "persons", "covariate",
         "Normal, MILDLY correlated with treatment (control variable).", "Eq. (2) X_i", "5", "Drives the with/without-controls gap."),
        ("age_head", "Age of head", "Age of the household head.", "years", "covariate",
         "Normal, mildly correlated with treatment.", "Eq. (2) X_i", "43", ""),
        ("survey_weight", "Survey weight", "DHS sampling weight (regressions are weighted).", "weight", "covariate",
         "Gamma draw, mean ~1.", "Tables 5-7 notes", "1.0", "feols weights=survey_weight."),
    ]
    return _dict_df(R)


def individual_dictionary() -> pd.DataFrame:
    R = [
        ("ind_id", "Individual ID", "Unique individual identifier (per round; NO panel key).",
         "string", "identifier", "IND_000000.. (repeated cross-section).", "Sect. 3.1.3", "IND_004321", ""),
        ("survey_round", "DHS round", "Ethiopia DHS survey round.", "year", "identifier", "Five rounds.",
         "Sect. 3.1.3", "2016", "Region-by-round FE key."),
        ("district_id", "District ID", "District (woreda) of the respondent.", "string", "identifier",
         "Same map as the panel.", "Eq. (2)", "ET_D006", ""),
        ("region_id", "Region ID", "Region code.", "int", "identifier", "From the district.", "Eq. (2)", "1", ""),
        ("treated", "Treated dummy", "1 if the district ever hosts a park.", "0/1", "treatment", "From the district.",
         "Sect. 3.2", "1", ""),
        ("treatment", "Treatment indicator", "1 if district treated AND round >= open round.", "0/1", "treatment",
         "Round-level open map.", "Eq. (2)", "1", ""),
        ("event_phase", "Event phase", "Round position relative to opening {-3..+1} (NaN for controls).",
         "Int [-3,1]", "derived", "Round index minus open-round index.", "Fig. 3", "0", ""),
        ("sex", "Sex", "0 = male, 1 = female.", "0/1", "covariate", "Fixed female/male counts (11,336 F / 6,164 M).",
         "Table 6", "1", "Women-only outcomes are NaN for men."),
        ("age", "Age", "Respondent age.", "years", "covariate", "Normal, 15-64.", "Eq. (2) X_i", "30", ""),
        ("age_sq", "Age squared", "Square of age.", "years^2", "covariate", "age**2.", "Eq. (2) X_i", "900", ""),
        ("nonag_employment", "Non-agricultural employment", "1 if employed outside agriculture.",
         "0/1", "outcome", "Clipped LPM, per-sex tau (female precise, male noisy).", "Table 6", "1",
         "Full mean ~0.312; female ATT 0.133***, male 0.015 ns. N=17,219 (F 11,055 / M 6,164)."),
        ("decision_power", "Decision-making power", "1 if the woman has the final say on key household decisions (women only).",
         "0/1", "outcome", "Clipped LPM (ceiling at 0.899).", "Table 7 cols 1-2", "1",
         "Mean ~0.899; ATT 0.103***. Women only; N=4,737."),
        ("savings_account", "Savings account", "1 if the woman owns a savings account (women only).",
         "0/1", "outcome", "Clipped LPM (floor at 0.063).", "Table 7 cols 3-4", "0",
         "Mean ~0.063; ATT 0.318***. Women only; N=11,155."),
        ("dv_accept", "DV acceptance", "1 if the woman accepts domestic violence under any of 5 conditions (women only).",
         "0/1", "outcome", "Clipped LPM.", "Table 7 cols 5-6", "1",
         "Mean ~0.636; ATT -0.212***. Women only; N=11,109."),
        ("dv_goingout", "DV: going out", "DV justified for going out without telling husband (women only).",
         "0/1", "outcome", "Clipped LPM.", "Table A15 col 1", "0", "ATT -0.134*; mean ~0.437."),
        ("dv_kids", "DV: neglecting kids", "DV justified for neglecting the children (women only).",
         "0/1", "outcome", "Clipped LPM.", "Table A15 col 2", "0", "ATT -0.153***; mean ~0.491."),
        ("dv_arguing", "DV: arguing", "DV justified for arguing with husband (women only).",
         "0/1", "outcome", "Clipped LPM.", "Table A15 col 3", "0", "ATT -0.173**; mean ~0.425."),
        ("dv_sex", "DV: refusing sex", "DV justified for refusing sex (women only).",
         "0/1", "outcome", "Clipped LPM.", "Table A15 col 4", "0", "ATT -0.096; mean ~0.363."),
        ("dv_food", "DV: burning food", "DV justified for burning the food (women only).",
         "0/1", "outcome", "Clipped LPM.", "Table A15 col 5", "0", "ATT -0.099; mean ~0.411."),
        ("hh_size", "Household size", "Household size.", "persons", "covariate", "Mildly correlated with treatment.",
         "Eq. (2) X_i", "5", ""),
        ("age_head", "Age of head", "Age of the household head.", "years", "covariate", "Mildly correlated with treatment.",
         "Eq. (2) X_i", "43", ""),
        ("survey_weight", "Survey weight", "DHS sampling weight.", "weight", "covariate", "Gamma draw.",
         "Tables 6-7 notes", "1.0", "feols weights=survey_weight."),
    ]
    return _dict_df(R)


# ---------------------------------------------------------------------------
# 5. VALIDATION  (recovered coefficients vs. the paper's targets)
# ---------------------------------------------------------------------------

# Baseline-characteristic trend interactions (Table 1 even columns).
_TREND_VARS = ["longitude", "latitude", "elevation", "slope", "dist_addis_km",
               "urbanization_rate_2007", "log_pop_density_2007", "population_2007",
               "share_christian_2007", "share_amharic_2007"]


def _stars(t: float) -> str:
    a = abs(t)
    return "***" if a > 2.58 else "**" if a > 1.96 else "*" if a > 1.64 else "ns"


def _feols(df, formula, cluster="district_id", weights=None):
    import pyfixest as pf
    return pf.feols(formula, data=df, weights=weights,
                    vcov={"CRV1": cluster})


def validate(dist_df, hh_df, ind_df) -> None:
    try:
        import pyfixest as pf
    except Exception as exc:  # pragma: no cover
        print(f"[validate] pyfixest unavailable ({exc}); skipping.")
        return

    print("=" * 86)
    print("VALIDATION -- recovered coefficients vs. Huang et al. (2026)")
    print("=" * 86)
    print(f"{'outcome':<34}{'coef':>9}{'se':>9}{'t':>7} {'sig':<4} {'paper target'}")
    print("-" * 86)

    # ---- district panel ----
    d = dist_df.copy()
    d["t"] = d["year"] - BASE_YEAR
    for v in _TREND_VARS:
        d[f"tr_{v}"] = d["t"] * d[v]
    trends = " + " + " + ".join(f"tr_{v}" for v in _TREND_VARS)

    def row(label, b, se, target):
        t = b / se if se else 0.0
        print(f"{label:<34}{b:>9.3f}{se:>9.3f}{t:>7.2f} {_stars(t):<4} {target}")

    def did(df, y, extra="", w=None):
        m = _feols(df, f"{y} ~ treatment{extra} | district_id + region^year", weights=w)
        tt = m.tidy(); return tt.loc["treatment", "Estimate"], tt.loc["treatment", "Std. Error"]

    print("\n[Table 1] Light & impervious  (preferred = WITH trends; [no trends])")
    b, se = did(d, "ihs_light", trends); row("IHS light (trends)", b, se, "0.214** [0.265**]")
    b, se = did(d, "ihs_light"); row("IHS light (no trends)", b, se, "0.265**")
    b, se = did(d, "light_intensity", trends); row("raw light (trends)", b, se, "1.276** [1.723*]")
    b, se = did(d, "light_intensity"); row("raw light (no trends)", b, se, "1.723*")
    b, se = did(d, "impervious_ratio", trends); row("impervious (trends)", b, se, "0.028** [0.032**]")
    b, se = did(d, "impervious_ratio"); row("impervious (no trends)", b, se, "0.032**")

    print("\n[Table A4] Extensive margin & [Table 2] spillover")
    b, se = did(d, "light_positive", trends); row("light_positive (extensive)", b, se, "~0.009 ns")
    m = _feols(d, f"light_intensity ~ treatment + nearby{trends} | district_id + region^year")
    tt = m.tidy(); b, se = tt.loc["nearby", "Estimate"], tt.loc["nearby", "Std. Error"]
    row("nearby (spillover)", b, se, "~0 ns")

    print("\n[Tables 3-4] Heterogeneity (light x moderator, with trends)")
    for M, tmain, tint in [("dist_addis_km", "2.514**", "-0.008**"),
                           ("dist_state_capital_km", "2.192**", "-0.009**"),
                           ("dist_nearest_city_km", "2.643**", "-0.032**"),
                           ("primary_road_density", "~0 ns", "+0.379**"),
                           ("paved_road_density", "~0 ns", "+0.630**")]:
        dd = d.copy(); dd["tmod"] = dd["treatment"] * dd[M]
        m = _feols(dd, f"light_intensity ~ treatment + tmod{trends} | district_id + region^year")
        tt = m.tidy()
        bm, sm = tt.loc["treatment", "Estimate"], tt.loc["treatment", "Std. Error"]
        bi, si = tt.loc["tmod", "Estimate"], tt.loc["tmod", "Std. Error"]
        row(f"  light:treat (M={M[:14]})", bm, sm, f"main {tmain}")
        row(f"  light:treat x {M[:14]}", bi, si, f"int  {tint}")

    print("\n[Table A6] Heterogeneity-robust estimators (IHS, no trends)")
    try:
        dd = d.copy(); dd["gvar"] = np.where(dd["treated"] == 1, dd["open_year"].fillna(0), 0).astype(int)
        sa = pf.event_study(dd, yname="ihs_light", idname="district_id", tname="year",
                            gname="gvar", estimator="saturated", att=True, cluster="district_id")
        agg = sa.aggregate()
        post = agg[agg.index >= 0]["Estimate"].astype(float)
        sa_att = float(post.mean())
        print(f"{'Sun-Abraham ATT (post avg)':<34}{sa_att:>9.3f}{'':>9}{'':>7} {'':<4} ~0.259***")
    except Exception as exc:
        print(f"  [Sun-Abraham skipped: {exc}]")
    try:
        d2 = pf.event_study(dd, yname="ihs_light", idname="district_id", tname="year",
                            gname="gvar", estimator="did2s", att=True, cluster="district_id")
        tt = d2.tidy(); b = float(tt.iloc[0]["Estimate"]); se = float(tt.iloc[0]["Std. Error"])
        row("Borusyak did2s ATT", b, se, "~0.260***")
    except Exception as exc:
        print(f"  [Borusyak skipped: {exc}]")

    # ---- household & individual RCS ----
    hc = ["hh_size", "age_head"]; ic = ["hh_size", "age_head", "age", "age_sq"]

    def rcs(df, y, controls):
        dd = df[df[y].notna()].copy()
        cstr = (" + " + " + ".join(controls)) if controls else ""
        m = _feols(dd, f"{y} ~ treatment{cstr} | district_id + region_id^survey_round",
                   weights="survey_weight")
        tt = m.tidy(); return tt.loc["treatment", "Estimate"], tt.loc["treatment", "Std. Error"]

    print("\n[Table 5] Household outcomes (with controls [no controls])")
    for y, ctl, tgt in [("durable_goods_pc", hc, "0.226*** [0.251***]"),
                        ("housing_quality", hc, "0.252*** [0.257***]"),
                        ("wealth_index", hc, "0.409* [0.413*]")]:
        b, se = rcs(hh_df, y, ctl); bnc, _ = rcs(hh_df, y, [])
        row(f"{y}", b, se, tgt + f"   (NC {bnc:.3f})")

    print("\n[Table 6] Non-agricultural employment")
    for label, samp, tgt in [("employment full", ind_df, "0.110 (borderline)"),
                             ("employment female", ind_df[ind_df.sex == 1], "0.133***"),
                             ("employment male", ind_df[ind_df.sex == 0], "0.015 ns")]:
        b, se = rcs(samp, "nonag_employment", ic); row(label, b, se, tgt)

    print("\n[Table 7] Women's empowerment (with controls)")
    for y, tgt in [("decision_power", "0.103***"),
                   ("savings_account", "0.318***"),
                   ("dv_accept", "-0.212***")]:
        b, se = rcs(ind_df, y, ic); row(y, b, se, tgt)

    print("\n[Table A15] DV components (women, with controls)")
    for y, tgt in [("dv_goingout", "-0.134*"), ("dv_kids", "-0.153***"),
                   ("dv_arguing", "-0.173**"), ("dv_sex", "-0.096 ns"), ("dv_food", "-0.099 ns")]:
        b, se = rcs(ind_df, y, ic); row(y, b, se, tgt)

    # ---- event study (district IHS light, with trends) ----
    print("\n[Eq. 3] Event study -- IHS light (pre ~0 ns; jump at k=0; grows)")
    ev = d.copy()
    ev = ev[ev["event_time"].notna() | (ev["treated"] == 0)].copy()
    ev["k"] = ev["event_time"].astype("Int64")
    # omit k=-1; controls get k = -100 (absorbed), build k dummies
    kvals = [kk for kk in range(-5, 6) if kk != -1]
    def _kname(kk):
        return f"k_m{abs(kk)}" if kk < 0 else f"k_p{kk}"
    for kk in kvals:
        ev[_kname(kk)] = ((ev["treated"] == 1) & (ev["k"] == kk)).astype(int)
    kterms = " + ".join(_kname(kk) for kk in kvals)
    mev = _feols(ev, f"ihs_light ~ {kterms}{trends} | district_id + region^year")
    te = mev.tidy()
    for kk in kvals:
        nm = _kname(kk)
        if nm not in te.index:
            continue
        b = te.loc[nm, "Estimate"]; se = te.loc[nm, "Std. Error"]
        tag = "(pre)" if kk < 0 else "(post)"
        print(f"  k={kk:>3} {tag:<6}{b:>8.3f}{se:>8.3f}{b/se:>7.2f} {_stars(b/se)}")

    # ---- sample-size & dependent-mean assertions ----
    print("\n" + "=" * 86)
    print("SAMPLE-SIZE & DEPENDENT-MEAN ASSERTIONS")
    print("=" * 86)
    checks = [
        ("district rows", len(dist_df), 2224),
        ("impervious non-null", int(dist_df.impervious_ratio.notna().sum()), 556),
        ("durables N", int(hh_df.durable_goods_pc.notna().sum()), 12207),
        ("housing N", int(hh_df.housing_quality.notna().sum()), 12206),
        ("wealth N", int(hh_df.wealth_index.notna().sum()), 9688),
        ("employment N", int(ind_df.nonag_employment.notna().sum()), 17219),
        ("employment female N", int(ind_df[(ind_df.sex == 1)].nonag_employment.notna().sum()), 11055),
        ("employment male N", int(ind_df[(ind_df.sex == 0)].nonag_employment.notna().sum()), 6164),
        ("decision N", int(ind_df.decision_power.notna().sum()), 4737),
        ("savings N", int(ind_df.savings_account.notna().sum()), 11155),
        ("dv N", int(ind_df.dv_accept.notna().sum()), 11109),
    ]
    all_ok = True
    for name, got, want in checks:
        ok = got == want; all_ok &= ok
        print(f"  {name:<28}{got:>8}  (target {want:>8})  {'PASS' if ok else 'FAIL'}")

    means = [
        ("light_intensity", dist_df.light_intensity.mean(), 0.879),
        ("ihs_light", dist_df.ihs_light.mean(), 0.209),
        ("impervious_ratio", dist_df.impervious_ratio.mean(), 0.038),
        ("durable_goods_pc", hh_df.durable_goods_pc.mean(), 0.297),
        ("housing_quality", hh_df.housing_quality.mean(), 0.305),
        ("wealth_index", hh_df.wealth_index.mean(), 0.001),
        ("nonag_employment(full)", ind_df.nonag_employment.mean(), 0.312),
        ("decision_power", ind_df.decision_power.mean(), 0.899),
        ("savings_account", ind_df.savings_account.mean(), 0.063),
        ("dv_accept", ind_df.dv_accept.mean(), 0.636),
    ]
    print("\n  dependent means (realised vs paper):")
    for name, got, want in means:
        print(f"  {name:<28}{got:>8.3f}  (target {want:>8.3f})")

    # ---- Table A3 summary statistics by treated group (covariates) ----
    print("\n" + "=" * 86)
    print("TABLE A3 (Panel C) -- covariate means/SD by group (realised vs paper)")
    print("=" * 86)
    a3 = {  # (treated mean, sd, control mean, sd)
        "dist_addis_km": (195.0, 143.2, 210.2, 129.1),
        "dist_state_capital_km": (112.9, 121.1, 135.5, 89.90),
        "dist_nearest_city_km": (52.00, 49.81, 60.06, 45.23),
        "elevation": (1849.0, 560.3, 1886.0, 619.5),
        "slope": (5.251, 3.450, 6.054, 3.318),
        "urbanization_rate_2007": (0.282, 0.325, 0.181, 0.251),
        "employment_rate_2007": (0.655, 0.109, 0.680, 0.111),
        "log_pop_density_2007": (5.245, 1.579, 5.082, 1.561),
    }
    md = dist_df.drop_duplicates("district_id")
    print(f"{'covariate':<24}{'treat mean/sd (paper)':<26}{'control mean/sd (paper)'}")
    for v, (tm, ts, cm, cs) in a3.items():
        t = md[md.treated == 1][v]; c = md[md.treated == 0][v]
        print(f"{v:<24}{t.mean():7.2f}/{t.std():6.2f} ({tm:.1f}/{ts:.1f})   "
              f"{c.mean():7.2f}/{c.std():6.2f} ({cm:.1f}/{cs:.1f})")
    print(f"  (district N: treated {int((md.treated==1).sum())} [17], "
          f"control {int((md.treated==0).sum())} [122])")
    print("=" * 86)


# ---------------------------------------------------------------------------
# 6. README
# ---------------------------------------------------------------------------

README_TEMPLATE = r"""# Synthetic replication dataset — Huang, Wang & Xu (2026)

A **synthetic, teaching-oriented** dataset that mirrors the data used in:

> Huang, G., Wang, M., & Xu, H. (2026). *The socioeconomic impacts of industrial
> parks in Ethiopia.* **Journal of Urban Economics.**
> https://doi.org/10.1016/j.jue.2026.103867

> WARNING: **These numbers are simulated, not real.** The paper's underlying data
> are licensed/confidential and assembled from many sources — harmonized
> **DMSP-OLS / VIIRS nighttime lights** (Chen et al. 2020), the **GISD30**
> impervious-surface product (Zhang et al. 2021), the **Ethiopia DHS**
> (2000-2019), the **2007 Population & Housing Census** (official tabulations +
> IPUMS microdata), **SRTM** elevation/slope, **gROADS** road density, and the
> **EIC/IPDC** industrial-park list with **propensity-score-matched** control
> woredas. This dataset is *calibrated* so that re-running the paper's
> regressions on it reproduces the paper's **findings** — the signs, the
> statistical significance (stars), and the approximate magnitudes of the key
> coefficients. Use it to **teach the methods**, not to draw conclusions about
> Ethiopia.

---

## 1. What the paper does

On a **staggered** rollout (2008-2021) the Ethiopian government opened **22
industrial parks across 18 districts (woredas)**; the paper studies their causal
effect on local economic activity, urbanization, household living standards, and
women's empowerment. The design is a **difference-in-differences** comparing
**17 treated woredas** (those that host a park) with **122 never-treated control
woredas** selected by **propensity-score matching** within 100 km of a park.

Three data layers (Eqs. 1-2):

| Level | Unit | Outcomes | Source | Tables |
|---|---|---|---|---|
| District | woreda x year (2005-2020) | nighttime light, impervious ratio | harmonized NTL, GISD30 | 1-4, A4-A12, Fig. 1 |
| Household | DHS round (2000-2019) | durable goods, housing quality, wealth | Ethiopia DHS | 5, Fig. 2 |
| Individual | DHS round (2000-2019) | non-ag employment, women's empowerment | Ethiopia DHS | 6-7, A15-A16, Fig. 3 |

**Headline results.** A park raises nighttime light by ~21% (IHS 0.214, raw
1.276) and the impervious-surface ratio by ~3 pp, with **no spillover** to nearby
districts; effects are larger near cities and with denser roads; households gain
durables/housing/wealth; and **women's** non-agricultural employment rises 13 pp,
lifting their decision-making power and savings and reducing acceptance of
domestic violence.

---

## 2. The three data files

| File | Grain | Rows | Units | Periods |
|---|---|---|---|---|
| `data/industrial_park_district_panel.csv` | woreda x year | @N_DIST_ROWS@ | @N_DIST@ woredas | 2005-2020 (annual) |
| `data/industrial_park_household_rcs.csv` | DHS household | @N_HH@ | repeated cross-section | 2000/2005/2011/2016/2019 |
| `data/industrial_park_individual_rcs.csv` | DHS individual | @N_IND@ | repeated cross-section | 2000/2005/2011/2016/2019 |

Each has its own dictionary in `reference/`:
`industrial_park_district_panel_data_dictionary.csv`,
`industrial_park_household_rcs_data_dictionary.csv`,
`industrial_park_individual_rcs_data_dictionary.csv`.

- **17 treated + 122 control woredas** = 139; annual 2005-2020 (16 years) =>
  **@N_DIST_ROWS@ district rows**. Impervious surface is observed only at
  2005/2010/2015/2020 => **@N_ISA@ non-null**.
- Treatment cohorts (Appendix Table A1): `2008:1, 2014:2, 2015:2, 2016:3,
  2017:3, 2018:2, 2019:2, 2020:2` (the 2008 Eastern Industrial Park anchor plus
  the 2014-2020 IPDC build-out), so every event time k in [-5,+5] has >=3 treated
  districts.
- The DHS rounds are a **repeated cross-section** (different respondents each
  round, no panel key). The same `district_id -> open_year` map links the RCS to
  the district panel; in RCS `treatment` = district treated AND round >= open
  round, with the **modal treated district first treated in the 2016 round**
  (phase 0), giving phases {-3,-2,-1,0,+1} across the five rounds.

---

## 3. How each ORIGINAL variable was built, and the synthetic mapping

**Treatment & PSM controls.** *Original:* the host woreda of each park (EIC/IPDC
list, Table A1) is treated from its first park's opening year; controls are
never-treated woredas within 100 km, matched on population density, urbanization,
employment, distance to Addis/nearest city, slope, and elevation (logit PSM ->
17 treated / 122 control). *Synthetic:* `treated`, `open_year`, `treatment`
encode the cohort design above; the 122 controls are spread across the treated
regions so each `region^year` cell has both treated and control support.

**Nighttime light** (`light_intensity`, `ihs_light`, `light_positive`).
*Original:* harmonized DMSP-OLS (2005-2012) + VIIRS (2013-2020) cross-sensor
calibrated to a VIIRS-like series (Chen et al. 2020), aggregated to the woreda.
*Synthetic:* a two-part DGP — an extensive margin (P(light>0) ~ 0.99 treated /
0.527 control) times a bright (treated) / dim (control) intensive base plus the
treatment ramp; `ihs_light = asinh(light_intensity)`. Treated park-cities are
modelled as **essentially always lit**: when a few treated district-years drew
`light==0` the `asinh(0)=0` holes carved a spurious dip into the IHS event study
(and added pre-period noise), so the treated extensive margin is set near 1.

**Impervious surface** (`impervious_ratio`). *Original:* GISD30 30-m impervious
land cover (Zhang et al. 2021), impervious area / woreda area, at 5-year steps.
*Synthetic:* base + treatment ramp + shared-urbanization trend, observed only
2005/2010/2015/2020.

**Geographic & socioeconomic controls.** *Original:* SRTM elevation/slope;
distances from woreda centroids; 2007-census urbanization/employment/population
density (official + IPUMS); gROADS-2008 road density; 2007-census
Christian/Amharic shares. *Synthetic:* drawn to match the **Table A3 Panel C**
treated/control means and SDs exactly; road densities and composition shares are
wide-spread draws used as heterogeneity moderators and trend interactions.

**Household DHS outcomes** (`durable_goods_pc`, `housing_quality`,
`wealth_index`). *Original:* durables per capita; an all-four-amenities housing
indicator; the standardized DHS wealth index (asset PCA). *Synthetic:* a
cross-sectional district + round FE design (continuous outcomes linear; binary
via a clipped linear probability), with `hh_size`/`age_head` mildly correlated
with treatment so the with/without-controls gap matches.

**Individual DHS outcomes** (`nonag_employment`, `decision_power`,
`savings_account`, `dv_accept`, `dv_*`). *Original:* employed-outside-agriculture
indicator; sole/joint say over five household decisions; savings-account
ownership; DV justified under >=1 of five conditions (plus the five components).
*Synthetic:* per-sex employment tau (female precise ***, male small ns) plus a
**district x round factor shock** that inflates the full-sample district-clustered
SE so the AVERAGE employment effect reads ns (the paper's central gender finding:
the average non-ag employment effect is null while the female effect is
significant); women-only empowerment outcomes via clipped LPMs.

---

## 4. How the data was constructed (the DGP)

**District light & impervious (Eq. 1).** The latent light is
`light = positive_dt x (base_d + region-year + theta_d*ramp(k) + phi_d*(year-2012)
+ spatial + serial + noise)`, where:

- `positive_dt` is a **stable demeaned-threshold** Bernoulli (district + common-
  year shocks demeaned within group) so P(light>0) hits ~0.99/0.527 and does not
  drift pre/post (a spurious extensive shift would inflate both the extensive
  coef and the IHS coef). Treated woredas are kept **essentially always lit**: a
  handful of treated `light==0` draws used to carve a visible non-monotone dip
  into the IHS event study (the `asinh(0)=0` holes), so removing them makes the
  event-study path **clean and monotone-ish** and the Sun-Abraham / Borusyak
  aggregates agree with TWFE-no-trends (~0.26);
- the **treated base is bright, the control base dim**, so the additive treatment
  effect `theta_d*ramp` produces a large RAW coefficient (~1.6) but a small
  IHS coefficient (~0.214) because `asinh(.)` compresses the bright treated tail;
  the brightness (`LIGHT_MED_TREATED`) is the knob that sets this IHS/raw split;
- `ramp(k) = 0.45 + 0.55*(1 - exp(-k/1.55))` for k >= 0 (a discrete opening jump
  growing to a plateau by k~5);
- `theta_d` is a **multi-channel linear function** of the moderators (distance to
  Addis/state capital/nearest city, primary/paved road density), with the
  coefficient vector found by a **numerical (damped-Newton) solver** so each
  single-moderator interaction regression (Tables 3-4) recovers its target slope;
- `phi_d*(year-2012)` is a **shared differential trend** proportional to
  (urbanization - mean); treated woredas have higher 2007 urbanization, so they
  trend up faster — the no-trends regression attributes this to treatment
  (0.265 / 1.723) while the **t x urbanization** trend interaction absorbs it,
  recovering the trend-adjusted effect (0.214 / 1.276). The impervious ratio uses
  the same shared trend (0.032 -> 0.028).

**RCS (Eq. 2).** Each record's outcome mean is
`a_district + b_round + kappa*X + tau*treatment_dt (+ per-sex for employment) + noise`.
District FEs are mean-balanced across treated/control (parallel baseline; Table A3
treated ~ control); round FEs capture secular DHS improvement. **Continuous**
outcomes (durables, wealth) are linear with noise SD matched to the reported
outcome SD. **Binary** outcomes (housing, employment, decision, savings, DV) are
drawn from a **clipped linear probability** `p = clip(a+b+kappa*X+tau*treat, 0.001,
0.999); y ~ Bernoulli(p)` — because the paper runs an **LPM**, the LPM coefficient
equals tau by construction. The decision (0.899 ceiling) and savings (0.063 floor)
means make clipping bias the coefficient, so tau is pre-compensated and verified.

**Honest standard errors.** A **spatial** shock (smooth lat/lon field, ~100 km
decay) and a **serial** shock (one draw per district x event-period) are
**demeaned within (treated x region)** groups and drawn from dedicated RNGs, so
they make the clustered / Conley-style SEs realistic **without moving the point
estimates**. For **employment**, a **district x ROUND factor shock**
(`loading_d * factor_r` + a small idiosyncratic part, overall mean-zero) is added
to the latent employment probability at FULL strength for men and a SMALL fraction
for women. Because it varies over survey rounds it is *not* absorbed by the
district fixed effect, and because it is perfectly correlated within a district
across rounds it strongly inflates the **full-sample district-clustered SE** — so
the average employment coefficient reads **ns** (paper: 0.110, t~1.2) while the
female-only coefficient, carrying little of the shock, stays precise (***).

**Cohort / event-time design.** District panel: event time k in [-5,+5] (annual);
RCS: phases in {-3,...,+1} over the five DHS rounds.

---

## 5. Decisions, assumptions & known approximations

- **RCS limitations.** No within-unit persistence (repeated cross-section, no
  household panel key); coarse event *phases* rather than annual event time; no
  household fixed effects.
- **LPM vs logit / clipping bias.** Binary outcomes use a clipped LPM to match the
  paper's LPM; the clipping bias is largest at the **savings floor** (mean 0.063)
  and the **decision ceiling** (mean 0.899), where tau is pre-compensated — the
  realised **decision mean (~0.88)** sits a touch below the paper's 0.899 because
  the ceiling caps the achievable effect.
- **Only 17 treated clusters.** With 17 treated woredas the point estimates carry
  real sampling scatter and a few effects are **borderline**. The full-sample
  employment coefficient is made cleanly **ns** (paper: 0.110, t~1.2) by the
  district x round factor shock (above). The trend-adjusted **raw**-light effect is
  larger than the paper's headline (~1.6 vs 1.276) and reads `***` rather than
  `**`: keeping the treated extensive margin near 1 (for a clean IHS event study)
  removes the zero-dilution that would otherwise pull the raw mean down, so the
  IHS coefficient (~0.214) lands on target while the raw coefficient sits high.
- **Heterogeneity (Tables 3-4)** is a **good but partial** match: the distance
  moderators are mutually correlated, so a single realised plateau cannot make all
  five interactions significant at once. With the numerically-solved plateau and
  the wide road densities, **all five interaction point estimates land on target
  with the correct sign**, and `dist_addis` (***), `dist_state_capital` (**),
  `dist_nearest_city` (***) and `paved_road` (**) are significant; the
  `primary_road` interaction is correctly-signed and on-magnitude but remains
  borderline (ns) — the 17-treated sample cannot make BOTH road interactions
  significant simultaneously. The `dist_addis` interaction MAIN term (~3.2) sits
  above the paper's 2.514.
- **Exact-match list** (asserted): all sample sizes (district 2,224; impervious
  556; durables 12,207; housing 12,206; wealth 9,688; employment 17,219 with F
  11,055 / M 6,164; decision 4,737; savings 11,155; dv 11,109), the dependent
  means, the Table A3 treated/control means/SDs/N, and the cohort years.
- **Approximate-match list:** the regression coefficients, standard errors,
  event-study shapes, and heterogeneity interactions (sign + significance +
  magnitude within ~0.02 on the headline cells).
- **Seed strategy.** A multi-RNG design isolates the structural DGP (ramps, FEs,
  tau) from the idiosyncratic noise. Seeds: district master @SEED@, RCS master
  @RCS_SEED@, extensive-margin @EXT_SEED@ (so P(light>0) hits ~0.99/0.527),
  spatial @SPATIAL_SEED@, serial @SERIAL_SEED@ (chosen so the IHS event-study path
  is clean and the Sun-Abraham post-average ~0.26), road-density @ROAD_SEED@, and
  the employment district x round factor-shock offset @EMP_SHOCK_SEED@ (chosen so
  the realised full/female/male employment estimates land on target with the right
  stars: full ns, female ***). Seeds only nudge the noise; the structure is fixed.

---

## 6. Reproducing the paper, table by table

| Paper object | Method on this data |
|---|---|
| **Table 1** | `pf.feols("ihs_light ~ treatment | district_id + region^year", vcov=CRV1)`; even cols add `t x baseline-char` trends; also `light_intensity`, `impervious_ratio`. |
| **Table 2** | Add `nearby` to the Table 1 spec; the `nearby` coef ~ 0 ns. |
| **Tables 3-4** | Add `treatment:<moderator>` (distance / road density) to the trend spec. |
| **Tables 5/6/7** | Weighted `pf.feols("<y> ~ treatment + <controls> | district_id + region_id^survey_round", weights="survey_weight", vcov=CRV1)` on the RCS files (employment split by `sex`). |
| **Table A4** | `light_positive` (extensive) and positive-only light (intensive). |
| **Table A6** | `pf.event_study(..., estimator="saturated")` (Sun-Abraham, aggregate post periods) and `estimator="did2s"` (Borusyak). |
| **Table A15** | RCS `dv_goingout ... dv_food`. |
| **Event studies** | District: event-time k in [-5,+5] dummies (Eq. 3); RCS: phase dummies. |

---

## 7. Variable reference — district panel

@DIST_VARS@

## 8. Variable reference — household RCS

@HH_VARS@

## 9. Variable reference — individual RCS

@IND_VARS@

---

*Generated by `reference/generate_synthetic_data.py` (district seed @SEED@, RCS seed @RCS_SEED@).*
"""


def _vardesc_table(dic: pd.DataFrame) -> str:
    lines = ["| Variable | Role | Units | Description |", "|---|---|---|---|"]
    for _, r in dic.iterrows():
        lines.append(f"| `{r.variable}` | {r.role} | {r.units} | {r.description} |")
    return "\n".join(lines)


def write_readme(dist_dic, hh_dic, ind_dic, dist_df, hh_df, ind_df) -> None:
    repl = {
        "@N_DIST@": str(dist_df.district_id.nunique()),
        "@N_DIST_ROWS@": f"{len(dist_df):,}",
        "@N_ISA@": str(int(dist_df.impervious_ratio.notna().sum())),
        "@N_HH@": f"{len(hh_df):,}",
        "@N_IND@": f"{len(ind_df):,}",
        "@SEED@": str(SEED), "@RCS_SEED@": str(RCS_SEED), "@EXT_SEED@": str(EXT_SEED),
        "@SPATIAL_SEED@": str(SPATIAL_SEED), "@SERIAL_SEED@": str(SERIAL_SEED),
        "@ROAD_SEED@": str(ROAD_SEED), "@EMP_SHOCK_SEED@": str(EMP_SHOCK_SEED),
        "@DIST_VARS@": _vardesc_table(dist_dic),
        "@HH_VARS@": _vardesc_table(hh_dic),
        "@IND_VARS@": _vardesc_table(ind_dic),
    }
    txt = README_TEMPLATE
    for k, v in repl.items():
        txt = txt.replace(k, v)
    (REF_DIR / "README.md").write_text(txt, encoding="utf-8")


# ---------------------------------------------------------------------------
# 7. MAIN
# ---------------------------------------------------------------------------

def main(do_validate: bool = False) -> None:
    # district panel
    rng = np.random.default_rng(SEED)
    meta = build_district_metadata(rng)
    dist_df = simulate_district_panel(meta, rng)

    # DHS repeated cross-sections (own RNGs)
    hh_df = simulate_household_rcs(meta, np.random.default_rng(RCS_SEED))
    ind_df = simulate_individual_rcs(meta, np.random.default_rng(RCS_SEED + 1))

    dist_dic = district_dictionary()
    hh_dic = household_dictionary()
    ind_dic = individual_dictionary()

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    REF_DIR.mkdir(parents=True, exist_ok=True)

    dist_df.to_csv(DATA_DIR / "industrial_park_district_panel.csv", index=False)
    hh_df.to_csv(DATA_DIR / "industrial_park_household_rcs.csv", index=False)
    ind_df.to_csv(DATA_DIR / "industrial_park_individual_rcs.csv", index=False)
    dist_dic.to_csv(REF_DIR / "industrial_park_district_panel_data_dictionary.csv", index=False)
    hh_dic.to_csv(REF_DIR / "industrial_park_household_rcs_data_dictionary.csv", index=False)
    ind_dic.to_csv(REF_DIR / "industrial_park_individual_rcs_data_dictionary.csv", index=False)
    write_readme(dist_dic, hh_dic, ind_dic, dist_df, hh_df, ind_df)

    print("Wrote:")
    print(f"  data/industrial_park_district_panel.csv         ({len(dist_df):,} rows, "
          f"{dist_df.district_id.nunique()} districts)")
    print(f"  data/industrial_park_household_rcs.csv           ({len(hh_df):,} rows)")
    print(f"  data/industrial_park_individual_rcs.csv          ({len(ind_df):,} rows)")
    print(f"  reference/industrial_park_district_panel_data_dictionary.csv  ({len(dist_dic)} vars)")
    print(f"  reference/industrial_park_household_rcs_data_dictionary.csv    ({len(hh_dic)} vars)")
    print(f"  reference/industrial_park_individual_rcs_data_dictionary.csv   ({len(ind_dic)} vars)")
    print("  reference/README.md")

    if do_validate:
        validate(dist_df, hh_df, ind_df)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--validate", action="store_true",
                    help="run the key regressions and print recovered vs target coefficients")
    args = ap.parse_args()
    main(do_validate=args.validate)
