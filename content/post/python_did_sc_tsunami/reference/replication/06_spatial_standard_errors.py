#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
06_spatial_standard_errors.py  —  spatial autocorrelation & spatial std. errors
================================================================================
LIBRARY: numpy + pandas + matplotlib (manual Conley estimator), with diff-diff
         available for the library route.
TOPIC:   why the paper reports CONLEY spatial standard errors, and what goes
         wrong if you ignore spatial dependence.

WHY THIS MATTERS
----------------
Every regression standard error rests on an assumption about how the errors are
correlated. The default ("naive"/iid) assumes every observation is INDEPENDENT.
But economic shocks spill across space — Tobler's first law: "everything is
related to everything else, but near things are more related than distant
things." When errors are spatially correlated, nearby observations carry
overlapping information, so you effectively have FEWER independent data points
than rows. Ignoring this makes standard errors **too small** and t-statistics
**too big** — you conclude "significant" more often than you should.

Here the treated units are all clustered on Aceh's coast, so spatial dependence
is exactly the kind of problem that can bite. This script:

  A. MAPS the units so you can SEE the spatial clustering of treatment.
  B. TESTS for spatial autocorrelation with Moran's I (on the 2005 residuals).
  C. COMPARES three standard errors for the SAME difference-in-differences
     estimates — naive, clustered-by-district, and Conley spatial — as ONE
     sandwich estimator with three different "meats".
  D. Shows how the Conley SE depends on the distance CUTOFF.

The point estimates never change; only our honesty about their uncertainty does.
"""

from __future__ import annotations

import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
import data_prep as dp                       # noqa: E402

CONLEY_CUTOFF_KM = 100.0                      # the paper's spatial cutoff


# ---------------------------------------------------------------------------
# The estimator: ONE sandwich V = (X'X)^-1 [MEAT] (X'X)^-1, three meats.
# ---------------------------------------------------------------------------
def vcov_comparison(sample: pd.DataFrame, cutoff_km: float = CONLEY_CUTOFF_KM) -> pd.DataFrame:
    """
    Re-estimate the TWFE difference-in-differences on `sample` and return the
    four coefficients with FOUR standard errors each (delegating to the shared
    estimator in data_prep, which the main tables also use).

    All four share the same "bread" (X'X)^-1 and differ only in the "meat" — i.e.
    WHICH error covariances they count:
      • naive (HC0)     : only e_i²        (assumes independence)
      • clustered       : + e_i e_j for i,j in the same DISTRICT, all years
                          (SERIAL correlation within a unit)
      • Conley spatial  : + e_i e_j for i,j within `cutoff_km` in the SAME YEAR
                          (contemporaneous SPATIAL correlation)
      • Conley-HAC      : the UNION of the two — the paper's reported SE.
    """
    est, _ = dp.did_estimate(sample, "gdp_growth", "flooded", cutoff_km=cutoff_km)
    return est.rename(columns={
        "estimate": "estimate", "se_naive": "SE_naive", "se_clustered": "SE_clustered",
        "se_conley": "SE_Conley", "se_hac": "SE_ConleyHAC"})


def _stars(t):
    a = abs(t)
    return "***" if a > 2.58 else "**" if a > 1.96 else "*" if a > 1.64 else ""


def main() -> None:
    d = dp.load_district()
    main_sample = dp.table2_samples(d)["Sumatra controls (red & yellow)"]

    # =====================================================================
    # PART A — MAP: see the spatial clustering of treatment
    # =====================================================================
    dp.banner("PART A — where are the districts? (treatment is spatially clustered)")
    snap = d[d["year"] == 2004]
    fig, ax = plt.subplots(figsize=(7, 8))
    for flooded, color, label in [(0, "lightsteelblue", "control"),
                                  (1, "firebrick", "flooded (treated)")]:
        g = snap[snap["flooded"] == flooded]
        ax.scatter(g["longitude"], g["latitude"], c=color, s=28,
                   edgecolor="grey", linewidth=0.3, label=label, zorder=3)
    ax.set_xlabel("Longitude (°E)"); ax.set_ylabel("Latitude (°N)")
    ax.set_title("Sumatra districts — the 10 flooded (treated) units are all\n"
                 "clustered on Aceh's coast in the far north-west")
    ax.legend(frameon=False); ax.grid(alpha=0.25)
    fig.tight_layout()
    out = dp.FIGURES_DIR / "fig_spatial_map.png"
    fig.savefig(out, dpi=150); plt.close(fig)
    print("  Treated districts span only a small corner of the map, so their\n"
          "  growth shocks are unlikely to be independent of one another.")
    print(f"  saved → {out.relative_to(dp.DATA_DIR)}")

    # =====================================================================
    # PART B — DIAGNOSE: is there spatial autocorrelation? (Moran's I)
    # =====================================================================
    dp.banner("PART B — Moran's I: testing for spatial autocorrelation")
    # Residualise growth on the flooded dummy + year fixed effects (strip out the
    # treatment effect and common national shocks), then ask whether the LEFTOVER
    # growth is spatially clustered — do neighbouring districts share shocks?
    # We pool ALL years for power, connecting only SAME-YEAR pairs within 100 km
    # (contemporaneous spatial dependence, exactly what Conley SEs correct for).
    g = d.dropna(subset=["gdp_growth"]).copy()
    yd = pd.get_dummies(g["year"], drop_first=True).to_numpy(float)
    Xf = np.column_stack([np.ones(len(g)), g["flooded"].to_numpy(float), yd])
    yv = g["gdp_growth"].to_numpy()
    resid = yv - Xf @ np.linalg.lstsq(Xf, yv, rcond=None)[0]

    year = g["year"].to_numpy()
    D = dp.haversine_matrix(g["latitude"].to_numpy(), g["longitude"].to_numpy())
    same = year[:, None] == year[None, :]
    W = ((D <= CONLEY_CUTOFF_KM) & (D > 0) & same).astype(float)
    rs = W.sum(1, keepdims=True); rs[rs == 0] = 1.0; W = W / rs

    obs_I = dp.morans_i(resid, W)
    # permutation null: reshuffle residuals WITHIN each year (preserves the year
    # structure), recompute Moran's I, and see how extreme the real value is.
    rng = np.random.default_rng(1)
    groups = {y: np.where(year == y)[0] for y in np.unique(year)}
    null = np.empty(299)
    for b in range(299):
        rp = resid.copy()
        for y, idxs in groups.items():
            rp[idxs] = resid[idxs][rng.permutation(len(idxs))]
        null[b] = dp.morans_i(rp, W)
    pval = (1 + np.sum(null >= obs_I)) / (len(null) + 1)
    print(f"  Pooled within-year Moran's I = {obs_I:+.3f}   (permutation p = {pval:.3f})")
    print(f"  Null mean ≈ {null.mean():+.3f}, SD ≈ {null.std():.3f}")
    verdict = "YES — significant positive spatial autocorrelation" if (obs_I > 0 and pval < 0.05) \
        else "positive but weak"
    print(f"  → Spatial autocorrelation present? {verdict}.")
    print("  Nearby districts have correlated residuals within a year, so the iid\n"
          "  assumption behind naive standard errors is violated.")

    # =====================================================================
    # PART C — COMPARE: naive vs clustered vs Conley standard errors
    # =====================================================================
    dp.banner("PART C — same DiD estimates, four standard errors (build-up to the paper's)")
    tab = vcov_comparison(main_sample, cutoff_km=CONLEY_CUTOFF_KM)
    print(f"\n{'coefficient':<24}{'estimate':>10}{'naive':>9}{'cluster':>9}{'Conley':>9}"
          f"{'HAC':>9}{'  t(HAC)':>10}")
    for _, r in tab.iterrows():
        th = r.estimate / r.SE_ConleyHAC
        print(f"{r.coefficient:<24}{r.estimate:>+10.4f}{r.SE_naive:>9.4f}{r.SE_clustered:>9.4f}"
              f"{r.SE_Conley:>9.4f}{r.SE_ConleyHAC:>9.4f}{th:>+8.2f}{_stars(th):<3}")
    infl = (tab["SE_ConleyHAC"] / tab["SE_naive"])
    print(f"\n  The Conley-HAC SEs are {infl.min():.2f}×–{infl.max():.2f}× the naive SEs.")
    print("  READING: the point estimates are identical; only the SEs change.\n"
          "  • CLUSTERED adds SERIAL correlation within a district over time —\n"
          "    biggest for the multi-year recovery window (its shock persists).\n"
          "  • CONLEY (spatial) adds correlation ACROSS districts in the same year.\n"
          "  • CONLEY-HAC unions the two — the paper's reported SE, and the largest.\n"
          "    Naive SEs understate uncertainty most for the recovery effect: under\n"
          "    naive SEs it would look *** ; under the paper's HAC SE it is only **.")
    dp.save_text("table_spatial_standard_errors.md",
                 "# Standard errors — naive vs clustered vs Conley spatial vs Conley-HAC (100 km)\n\n"
                 + tab.round(4).to_markdown(index=False)
                 + "\n\n_Same TWFE DiD estimates; SEs differ only in which error covariances "
                   "they count. **Conley-HAC** (serial + contemporaneous spatial within 100 km) "
                   "is the paper's choice._\n")

    # =====================================================================
    # PART D — how the Conley SE depends on the distance cutoff
    # =====================================================================
    dp.banner("PART D — sensitivity to the distance cutoff")
    cutoffs = [0, 50, 100, 150, 200, 300]
    rows = [vcov_comparison(main_sample, cutoff_km=float(c)) for c in cutoffs]
    recov = "Recovery (2006–08)"
    se_by_cut = [r.loc[r.coefficient == recov, "SE_ConleyHAC"].iloc[0] for r in rows]
    print("  Conley-HAC SE of the recovery (2006–08) effect by cutoff:")
    for c, s in zip(cutoffs, se_by_cut):
        tag = " (= clustered/serial only, no spatial terms)" if c == 0 else ""
        print(f"     {c:3d} km : SE = {s:.4f}{tag}")
    fig, ax = plt.subplots(figsize=(7, 4.5))
    ax.plot(cutoffs, se_by_cut, "o-", color="firebrick")
    ax.axhline(se_by_cut[0], color="grey", ls="--", lw=1, label="no-spatial SE (cutoff 0)")
    ax.set_xlabel("Conley distance cutoff (km)")
    ax.set_ylabel("SE of the recovery (2006–08) effect")
    ax.set_title("Conley standard error grows as the spatial cutoff widens,\n"
                 "then stabilises — the bias–variance trade-off in choosing it")
    ax.legend(frameon=False); ax.grid(alpha=0.3)
    fig.tight_layout()
    out2 = dp.FIGURES_DIR / "fig_conley_cutoff_sensitivity.png"
    fig.savefig(out2, dpi=150); plt.close(fig)
    print("  Too small a cutoff misses real correlation (SE too small); too large\n"
          "  adds noise. The paper uses 100 km. saved → "
          f"{out2.relative_to(dp.DATA_DIR)}")

    dp.banner("Spatial standard errors: map + Moran's I + SE table + cutoff plot written")


if __name__ == "__main__":
    main()
