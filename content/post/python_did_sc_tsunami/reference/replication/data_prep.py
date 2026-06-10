#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
data_prep.py  —  shared data-loading & design utilities for the replication suite
=================================================================================

This module is imported by every replication script (``01_*`` … ``05_*``).  It
centralises three things so the analysis scripts stay short and readable:

    1. LOADING the two synthetic panels (district-level GDP, sub-district lights).
    2. BUILDING the difference-in-differences (DiD) design variables — the
       treatment × period interaction terms that the paper's Equation (1) uses.
    3. SELECTING the exact estimation samples behind each table column, and
       AGGREGATING the panel into the single "treated unit vs donors" shape that
       the synthetic-control library (mlsynth) expects.

------------------------------------------------------------------------------
THE EMPIRICAL DESIGN, IN ONE PARAGRAPH (read this first)
------------------------------------------------------------------------------
Heger & Neumayer (2019) treat the 26 December 2004 tsunami as a natural
experiment.  "Treated" units are districts/sub-districts that were FLOODED;
"control" units were not.  Because the flooding was geographically idiosyncratic,
treated and control units should have followed PARALLEL trends absent the
tsunami.  The DiD estimator compares the change (post − pre) in the treated
group to the change in the control group.  The paper does not use a single
"post" dummy; it splits the post period into three sub-periods so the *dynamics*
are visible:

    pre-tsunami 2003–04   (a placebo / parallel-trends check — should be ~0)
    tsunami     2005       (the immediate destruction — expected negative)
    recovery    2006–08    (the aid-fuelled reconstruction boom — expected +)
    post-recovery 2009–12  (after aid dried up — is the gain sustained?)

Each of these enters the regression as an interaction  D_i × 1[period = p],
where D_i = 1 for flooded units.  The omitted/reference period is the
**baseline (2000–02)**, so every coefficient reads as "treated-vs-control
growth in period p, relative to the pre-tsunami baseline."  Unit and year fixed
effects absorb permanent district differences and common national shocks.

The `period` column already exists in the CSVs with values
{baseline, pre, tsunami, recovery, postrec} (+ "(base year)" for 1999, which
has no growth rate and is dropped automatically because its growth is NaN).
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Paths.  Scripts live in <dataset>/replication/ ; the CSVs live one level up.
# ---------------------------------------------------------------------------
HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent
DISTRICT_CSV = DATA_DIR / "aceh_tsunami_district_panel.csv"
SUBDISTRICT_CSV = DATA_DIR / "aceh_tsunami_subdistrict_panel.csv"
TABLES_DIR = HERE / "tables"
FIGURES_DIR = HERE / "figures"
TABLES_DIR.mkdir(exist_ok=True)
FIGURES_DIR.mkdir(exist_ok=True)

# Treatment timing.  The tsunami struck in late December 2004, so 2005 is the
# first "treated" year; the reference period for the DiD dummies is 2000–02.
TREATMENT_YEAR = 2005

# Mapping from the `period` label in the data to (a) a tidy interaction-term
# column name and (b) a human-readable label for the regression tables.
PERIOD_TO_TERM = {
    "pre": "D_pre",        # 2003–2004
    "tsunami": "D_2005",   # 2005
    "recovery": "D_recov", # 2006–2008
    "postrec": "D_post",   # 2009–2012
}
DID_TERMS = ["D_pre", "D_2005", "D_recov", "D_post"]          # regressor order
TERM_LABELS = {
    "D_pre":   "Pre-tsunami (2003–04)",
    "D_2005":  "Tsunami (2005)",
    "D_recov": "Recovery (2006–08)",
    "D_post":  "Post-recovery (2009–12)",
}


# ---------------------------------------------------------------------------
# 1. LOADERS
# ---------------------------------------------------------------------------
def load_district() -> pd.DataFrame:
    """District × year GDP panel (125 districts, 1999–2012)."""
    return pd.read_csv(DISTRICT_CSV)


def load_subdistrict() -> pd.DataFrame:
    """Sub-district (Kecamatan) × year night-lights panel (276 units, 1999–2012)."""
    return pd.read_csv(SUBDISTRICT_CSV)


# ---------------------------------------------------------------------------
# 2. DiD DESIGN VARIABLES
# ---------------------------------------------------------------------------
def make_did_terms(df: pd.DataFrame, treat_col: str) -> pd.DataFrame:
    """
    Add the four treatment × period interaction columns used by Equation (1).

    For a treatment variable ``treat_col`` (a 0/1 dummy such as ``flooded`` or
    ``neighbour_of_flooded``, OR a continuous "dose" such as
    ``share_area_flooded``), this creates:

        D_pre   = treat × 1[period = "pre"      (2003–04)]
        D_2005  = treat × 1[period = "tsunami"  (2005)]
        D_recov = treat × 1[period = "recovery" (2006–08)]
        D_post  = treat × 1[period = "postrec"  (2009–12)]

    The baseline period (2000–02) gets no term and is therefore the reference,
    exactly as in the paper.  Using EXPLICIT interaction columns (rather than a
    formula short-cut) keeps the regression transparent for teaching: the four
    regressors map one-to-one onto the four rows of every results table.
    """
    out = df.copy()
    treat = out[treat_col].astype(float)
    for period_label, term in PERIOD_TO_TERM.items():
        out[term] = treat * (out["period"] == period_label).astype(float)
    return out


def did_formula(outcome: str, unit_fe: str, time_fe: str = "year") -> str:
    """
    Build the pyfixest two-way fixed-effects formula string, e.g.

        "gdp_growth ~ D_pre + D_2005 + D_recov + D_post | district_id + year"

    Left of "|": the four DiD interaction terms (the treated×period effects).
    Right of "|": the absorbed fixed effects (unit and year).
    """
    rhs = " + ".join(DID_TERMS)
    return f"{outcome} ~ {rhs} | {unit_fe} + {time_fe}"


# ---------------------------------------------------------------------------
# 3. ESTIMATION SAMPLES  (one per table column)
# ---------------------------------------------------------------------------
# The paper repeatedly re-estimates the same DiD on different CONTROL POOLS.
# These helpers return the exact rows behind each published column.  The
# observation counts they yield match the paper (e.g. Table 2: 1283 / 1118 /
# 295) once rows with a missing growth rate are dropped by the estimator.

def table2_samples(d: pd.DataFrame) -> dict[str, pd.DataFrame]:
    """Table 2 / 8 — MAIN analysis (North Sumatra excluded; 10 flooded Aceh treated)."""
    aceh_flooded = (d["flooded"] == 1) & (d["region_group"] == "Aceh")
    return {
        "Sumatra controls (red & yellow)": d[d["region_group"] != "North Sumatra"],
        "Rest of Sumatra (yellow)":        d[(d["region_group"] == "Rest of Sumatra") | aceh_flooded],
        "Aceh non-flooded (red)":          d[d["region_group"] == "Aceh"],
    }


def table5_samples(d: pd.DataFrame) -> dict[str, pd.DataFrame]:
    """Table 5 — robustness INCLUDING North Sumatra (12 flooded treated)."""
    return {
        "All Sumatra (red & yellow)":    d,
        "Rest of Sumatra (yellow)":      d[(d["region_group"] == "Rest of Sumatra") | (d["flooded"] == 1)],
        "Aceh & N. Sumatra (red)":       d[d["region_group"] != "Rest of Sumatra"],
    }


def table6_samples(d: pd.DataFrame) -> dict[str, pd.DataFrame]:
    """Table 6 — drop INLAND control districts (keep coastal only)."""
    return {name: s[s["coastal"] == 1] for name, s in table2_samples(d).items()}


def table7_samples(d: pd.DataFrame) -> dict[str, pd.DataFrame]:
    """
    Table 7 — split the MAIN sample into city (Kota) and rural (Kabupaten),
    each against the three control pools.  Returns six samples.
    """
    out: dict[str, pd.DataFrame] = {}
    for dtype, tag in [("Kota", "City"), ("Kabupaten", "Rural")]:
        for name, s in table2_samples(d).items():
            out[f"{tag} | {name}"] = s[s["district_type"] == dtype]
    return out


def table9_samples(d: pd.DataFrame) -> dict[str, pd.DataFrame]:
    """
    Table 9 — PLACEBO test.  Drop the actually-flooded districts and pretend the
    *neighbours* of flooded districts were treated (`neighbour_of_flooded`).
    A credible design should find NO effect here.
    """
    nonflooded = d[d["flooded"] == 0]
    return {
        "All Sumatra controls":        nonflooded,
        "Aceh & N. Sumatra controls":  nonflooded[nonflooded["region_group"] != "Rest of Sumatra"],
    }


# ---------------------------------------------------------------------------
# 4. SYNTHETIC-CONTROL RESHAPING
# ---------------------------------------------------------------------------
# mlsynth fits ONE treated unit against a pool of donor units, from a long panel
# with columns (unit id, time, outcome, 0/1 treatment).  The paper's synthetic
# controls are at an AGGREGATE level, so we collapse first.

def _wavg(df: pd.DataFrame, value: str, weight: str, by: list[str]) -> pd.DataFrame:
    """Population-weighted mean of `value` within each `by` group (version-robust)."""
    tmp = df[by + [value, weight]].copy()
    tmp["_num"] = tmp[value] * tmp[weight]
    g = tmp.groupby(by, as_index=False).agg(_num=("_num", "sum"), _den=(weight, "sum"))
    g[value] = g["_num"] / g["_den"]
    return g[by + [value]]


def scm_gdp_panel(d: pd.DataFrame) -> pd.DataFrame:
    """
    Figure 3 reshaping.  Treated unit = the AVERAGE GDP of the 10 flooded Aceh
    districts (the paper's "average of affected districts"); donor pool = every
    Rest-of-Sumatra district individually.  Returns long columns
    [unitid, time, outcome, treat] with treat=1 for the treated unit from 2005 on.
    """
    treated = (
        d[(d["flooded"] == 1) & (d["region_group"] == "Aceh")]
        .groupby("year", as_index=False)["gdp_const_usd_m"].mean()
        .assign(unitid="Aceh (flooded, treated)")
        .rename(columns={"year": "time", "gdp_const_usd_m": "outcome"})
    )
    donors = (
        d[d["region_group"] == "Rest of Sumatra"][["district_id", "year", "gdp_const_usd_m"]]
        .rename(columns={"district_id": "unitid", "year": "time", "gdp_const_usd_m": "outcome"})
    )
    panel = pd.concat([treated[["unitid", "time", "outcome"]], donors], ignore_index=True)
    panel["treat"] = ((panel["unitid"] == "Aceh (flooded, treated)") &
                      (panel["time"] >= TREATMENT_YEAR)).astype(int)
    return panel.sort_values(["unitid", "time"]).reset_index(drop=True)


def scm_structural_panel(d: pd.DataFrame, outcome_col: str) -> pd.DataFrame:
    """
    Figures 4–7 reshaping.  Treated unit = the Aceh PROVINCE aggregate of
    `outcome_col` (a sectoral value-added share or capital formation per capita);
    donor pool = every OTHER Sumatra province aggregated the same way.  Province
    aggregates are population-weighted.  Returns [unitid, time, outcome, treat].
    """
    agg = _wavg(d, outcome_col, "population", by=["province", "year"])
    agg = agg.rename(columns={"province": "unitid", "year": "time", outcome_col: "outcome"})
    agg["treat"] = ((agg["unitid"] == "Aceh") & (agg["time"] >= TREATMENT_YEAR)).astype(int)
    return agg.sort_values(["unitid", "time"]).reset_index(drop=True)


# ---------------------------------------------------------------------------
# 5b. SPATIAL HELPERS  (used by the spatial-standard-errors script)
# ---------------------------------------------------------------------------
def haversine_matrix(lat, lon) -> np.ndarray:
    """n×n matrix of great-circle distances (km) between unit centroids."""
    lat = np.radians(np.asarray(lat, float))
    lon = np.radians(np.asarray(lon, float))
    dphi = lat[None, :] - lat[:, None]
    dlmb = lon[None, :] - lon[:, None]
    a = np.sin(dphi / 2) ** 2 + np.cos(lat)[:, None] * np.cos(lat)[None, :] * np.sin(dlmb / 2) ** 2
    return 2 * 6371.0 * np.arcsin(np.sqrt(np.clip(a, 0, 1)))


def distance_band_weights(lat, lon, cutoff_km: float, row_standardize: bool = True) -> np.ndarray:
    """Binary spatial-weights matrix W: w_ij = 1 if 0 < dist(i,j) ≤ cutoff_km.
    Row-standardising (each row sums to 1) is the usual convention for Moran's I."""
    D = haversine_matrix(lat, lon)
    W = ((D <= cutoff_km) & (D > 0)).astype(float)
    if row_standardize:
        rs = W.sum(axis=1, keepdims=True)
        rs[rs == 0] = 1.0
        W = W / rs
    return W


def morans_i(x, W) -> float:
    """Global Moran's I — the spatial analogue of a correlation coefficient.
    I ≈ 0 → no spatial pattern; I > 0 → nearby units have SIMILAR values
    (positive spatial autocorrelation, the usual case for economic shocks)."""
    x = np.asarray(x, float)
    xc = x - x.mean()
    n = len(x)
    s0 = W.sum()
    return (n / s0) * (xc @ (W @ xc)) / (xc @ xc)


def morans_i_pvalue(x, W, n_perm: int = 999, seed: int = 0):
    """Permutation test for Moran's I: shuffle the values across locations many
    times and see how often a random arrangement is as clustered as the real one.
    Returns (observed I, one-sided p-value)."""
    rng = np.random.default_rng(seed)
    x = np.asarray(x, float)
    obs = morans_i(x, W)
    null = np.array([morans_i(rng.permutation(x), W) for _ in range(n_perm)])
    p = (1 + np.sum(null >= obs)) / (n_perm + 1)
    return obs, p


# ---------------------------------------------------------------------------
# 5c. CONLEY SPATIAL-HAC STANDARD ERRORS  (the paper's inference)
# ---------------------------------------------------------------------------
# The paper reports standard errors "adjusted for panel-specific serial
# correlation, heteroscedasticity and contemporaneous spatial correlation up to
# 100 km" (Conley 1999; Hsiang 2010).  That is the UNION of two ideas, computed
# as ONE sandwich estimator V = (X'X)^-1 [meat] (X'X)^-1:
#   * SERIAL  — errors of the SAME district in different years are correlated
#     (= clustering by district, all lags), and
#   * SPATIAL — errors of DIFFERENT districts in the SAME year within 100 km are
#     correlated (Conley).
# Two observations contribute a cross-term to the meat iff they share a district
# OR share a year and lie within `cutoff_km`.  Nesting the same machinery gives
# the four standard errors used throughout the suite (naive / clustered / Conley
# spatial / Conley-HAC), so script 06 can show them side by side.

def _two_way_within(Z: np.ndarray, unit, time, n_iter: int = 60) -> np.ndarray:
    """Absorb unit and year fixed effects by iterative demeaning (the 'within'
    transform) — identical to pyfixest's ``| unit + year`` but done by hand so
    the variance formula below is transparent."""
    Z = Z.astype(float).copy()
    for _ in range(n_iter):
        for g in (unit, time):
            tmp = pd.DataFrame(Z)
            tmp["_g"] = g
            Z = Z - tmp.groupby("_g").transform("mean").to_numpy()
    return Z


def did_estimate(sample: pd.DataFrame, outcome: str = "gdp_growth",
                 treat: str = "flooded", unit: str = "district_id",
                 cutoff_km: float = 100.0) -> tuple[pd.DataFrame, int]:
    """
    Estimate one TWFE difference-in-differences column and return the four DiD
    coefficients with FOUR standard errors each (naive / clustered / Conley
    spatial / Conley-HAC), plus the sample size N.  Point estimates are identical
    to pyfixest; the Conley-HAC column is the paper's reported SE.
    """
    terms = DID_TERMS
    df = make_did_terms(sample, treat).dropna(subset=[outcome]).copy()
    Z = df[[outcome] + terms].to_numpy(float)
    unit_arr = df[unit].to_numpy()
    year = df["year"].to_numpy()
    lat = df["latitude"].to_numpy()
    lon = df["longitude"].to_numpy()

    Zw = _two_way_within(Z, unit_arr, year)
    y, X = Zw[:, 0], Zw[:, 1:]
    XtXi = np.linalg.inv(X.T @ X)
    beta = XtXi @ (X.T @ y)
    e = y - X @ beta
    k = X.shape[1]

    def se(meat: np.ndarray) -> np.ndarray:
        # clamp tiny negative variances that a finite-sample spatial kernel can
        # produce (the Bartlett weighting below keeps this rare and small)
        return np.sqrt(np.maximum(np.diag(XtXi @ meat @ XtXi), 0.0))

    se_naive = se(X.T @ (X * (e ** 2)[:, None]))            # HC0 (independent)

    meat_clu = np.zeros((k, k))                              # clustered by district
    for u in np.unique(unit_arr):
        m = unit_arr == u
        s = X[m].T @ e[m]
        meat_clu += np.outer(s, s)
    se_clu = se(meat_clu)

    # Conley spatial: same-year pairs, BARTLETT-weighted by distance (1 at 0 km,
    # 0 at the cutoff) — the standard PSD-safe kernel; the diagonal weight is 1.
    meat_sp = np.zeros((k, k))
    for t in np.unique(year):
        m = year == t
        Wt = np.maximum(0.0, 1.0 - haversine_matrix(lat[m], lon[m]) / cutoff_km)
        Xt, et = X[m], e[m]
        meat_sp += Xt.T @ (Wt * np.outer(et, et)) @ Xt
    se_sp = se(meat_sp)

    # Conley-HAC (the paper's): SERIAL (cluster by district, all lags) UNION
    # SPATIAL (different districts, same year, Bartlett in distance).
    D = haversine_matrix(lat, lon)
    same_unit = unit_arr[:, None] == unit_arr[None, :]
    same_year = year[:, None] == year[None, :]
    W = same_unit.astype(float) + np.where(
        same_year & ~same_unit, np.maximum(0.0, 1.0 - D / cutoff_km), 0.0)
    se_hac = se(X.T @ (W * np.outer(e, e)) @ X)

    out = pd.DataFrame({
        "coefficient": [TERM_LABELS[t] for t in terms],
        "estimate": beta, "se_naive": se_naive, "se_clustered": se_clu,
        "se_conley": se_sp, "se_hac": se_hac,
    })
    return out, len(df)


def stars(t: float) -> str:
    """Significance stars from a t-stat, paper convention (10/5/1%)."""
    a = abs(t)
    return "***" if a > 2.576 else "**" if a > 1.960 else "*" if a > 1.645 else ""


def did_conley_table(samples: dict, outcome: str, title: str, slug: str,
                     paper_note: str, treat: str = "flooded",
                     unit: str = "district_id", se_kind: str = "se_hac") -> "pd.DataFrame":
    """
    Build ONE side-by-side DiD table across control-pool columns, reporting the
    paper's CONLEY SPATIAL-HAC standard errors (``se_hac``) beneath each
    coefficient.  Prints markdown to the console and saves markdown + LaTeX.

    Each column comes from :func:`did_estimate`, whose point estimates are
    identical to pyfixest's (script 02 prints a one-line pyfixest cross-check).
    """
    se_label = {"se_hac": "Conley spatial-HAC (100 km, + serial)",
                "se_clustered": "clustered by unit",
                "se_naive": "heteroskedasticity-robust"}[se_kind]
    rows = {t: [] for t in DID_TERMS}
    nobs, headers = [], list(samples.keys())
    for samp in samples.values():
        est, n = did_estimate(samp, outcome, treat, unit)
        nobs.append(n)
        for i, t in enumerate(DID_TERMS):
            b = est["estimate"].iloc[i]
            se = est[se_kind].iloc[i]
            star = stars(b / se) if se > 0 else ""
            rows[t].append(f"{b:+.4f}{star} ({se:.4f})")

    table = pd.DataFrame({TERM_LABELS[t]: rows[t] for t in DID_TERMS}).T
    table.columns = [f"({i})" for i in range(1, len(headers) + 1)]
    table.loc["Year & unit FE"] = ["Yes"] * len(headers)
    table.loc["Observations"] = [f"{n:,}" for n in nobs]

    banner(title)
    print(table.to_markdown())
    print("\nColumns:")
    for i, h in enumerate(headers, 1):
        print(f"   ({i}) {h}")
    print("\n" + paper_note)

    legend = "\n".join(f"- ({i}) {h}" for i, h in enumerate(headers, 1))
    md = (f"# {title}\n\n{table.to_markdown()}\n\n**Columns**\n\n{legend}\n\n{paper_note}\n\n"
          f"_Significance: *** p<0.01, ** p<0.05, * p<0.10 (paper convention). "
          f"Standard errors in parentheses: {se_label}._\n")
    save_text(f"{slug}.md", md)
    save_text(f"{slug}.tex", table.to_latex())
    print(f"\n   saved -> tables/{slug}.md  and  tables/{slug}.tex")
    return table


# ---------------------------------------------------------------------------
# 5. SMALL OUTPUT HELPERS
# ---------------------------------------------------------------------------
def save_text(filename: str, text: str) -> Path:
    """Write a table/string into the tables/ folder and return the path."""
    path = TABLES_DIR / filename
    path.write_text(text, encoding="utf-8")
    return path


def banner(title: str) -> None:
    """Print a labelled section banner to the console."""
    line = "=" * 78
    print(f"\n{line}\n{title}\n{line}")


# Star thresholds matching the paper: *** p<0.01, ** p<0.05, * p<0.10.
SIGNIF = [0.01, 0.05, 0.10]


def pyfixest_table(models, headers, title, slug, paper_note, labels=None):
    """
    Render a list of fitted pyfixest models as ONE side-by-side table: print a
    markdown version to the console and save markdown (.md) + LaTeX (.tex).

    In the `coef_fmt` string, "b*" prints the coefficient with significance stars
    and "(se)" the clustered standard error beneath it.  pyfixest is imported
    lazily so the diff-diff and mlsynth scripts (which never call this) do not
    need it loaded.
    """
    import pyfixest as pf  # lazy: only the table scripts need pyfixest here

    labels = labels or TERM_LABELS
    banner(title)
    pf.etable(models, coef_fmt="b* (se)", labels=labels, signif_code=SIGNIF, type="md")

    print("\nColumns:")
    for i, h in enumerate(headers, start=1):
        print(f"   ({i}) {h}")
    print("\n" + paper_note)

    df_tab = pf.etable(models, coef_fmt="b* (se)", labels=labels, signif_code=SIGNIF, type="df")
    # etable returns a MultiIndex (coef/fe/stats × label) on both axes; flatten to
    # the readable label level so the saved markdown isn't littered with tuples.
    df_clean = df_tab.copy()
    if isinstance(df_clean.index, pd.MultiIndex):
        df_clean.index = df_clean.index.get_level_values(-1)
    if isinstance(df_clean.columns, pd.MultiIndex):
        df_clean.columns = [f"({i})" for i in range(1, df_clean.shape[1] + 1)]
    legend = "\n".join(f"- ({i}) {h}" for i, h in enumerate(headers, 1))
    md = (f"# {title}\n\n{df_clean.to_markdown()}\n\n**Columns**\n\n{legend}\n\n{paper_note}\n\n"
          "_Significance: *** p<0.01, ** p<0.05, * p<0.10 (paper convention). "
          "SEs clustered._\n")
    save_text(f"{slug}.md", md)
    save_text(f"{slug}.tex",
              pf.etable(models, coef_fmt="b* (se)", labels=labels, signif_code=SIGNIF, type="tex"))
    print(f"\n   saved → tables/{slug}.md  and  tables/{slug}.tex")


if __name__ == "__main__":
    # Quick self-check when run directly: confirm the panels load and the design
    # variables / samples have the expected shapes.
    d = load_district()
    s = load_subdistrict()
    banner("data_prep self-check")
    print(f"district panel : {d.shape[0]} rows, {d['district_id'].nunique()} districts, "
          f"years {d['year'].min()}–{d['year'].max()}")
    print(f"subdistrict    : {s.shape[0]} rows, {s['kecamatan_id'].nunique()} kecamatans")
    dd = make_did_terms(d, "flooded")
    print("DiD terms added:", DID_TERMS)
    print("Table 2 sample sizes (rows with non-missing growth):")
    for name, samp in table2_samples(dd).items():
        print(f"   {name:34s} N = {samp['gdp_growth'].notna().sum()}")
    print("SCM (Fig 3) units:", scm_gdp_panel(d)["unitid"].nunique(),
          "| province SCM units:", scm_structural_panel(d, 'va_agri_share')['unitid'].nunique())
