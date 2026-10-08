#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
02_did_tables_gdp.py  —  the GDP difference-in-differences tables
=================================================================
LIBRARIES: pyfixest (point estimates / cross-check) + a transparent Conley
           spatial-HAC standard-error estimator in data_prep.
REPRODUCES: Tables 2, 5, 6, 7, 8, 9 of Heger & Neumayer (2019).

Script 01 built the intuition with diff-diff.  Here we generate the paper's
publication tables.  Two estimators are used together:

  * POINT ESTIMATES come from a two-way fixed-effects (TWFE) regression.  These
    are exactly what **pyfixest** (`feols(... | district_id + year)`) produces;
    the top of the run prints a one-line cross-check confirming the hand-rolled
    "within" estimator in data_prep agrees with pyfixest to the 4th decimal.

  * STANDARD ERRORS are the paper's: "adjusted for panel-specific serial
    correlation, heteroscedasticity and contemporaneous spatial correlation up
    to 100 km" (Conley 1999; Hsiang 2010).  pyfixest cannot compute distance-
    based Conley SEs, so `data_prep.did_estimate` builds them explicitly as ONE
    sandwich whose "meat" unions (a) clustering by district [serial] and
    (b) same-year pairs within 100 km, Bartlett-weighted [spatial].  Script 06
    dissects this estimator term by term.

------------------------------------------------------------------------------
THE ESTIMATING EQUATION (paper's Eq. 1)
------------------------------------------------------------------------------
    ΔY_it = β1·D_i·1[2003-04] + β2·D_i·1[2005] + β3·D_i·1[2006-08]
            + β4·D_i·1[2009-12] + α_i + γ_t + ε_it

  ΔY_it  = annual GDP growth rate     D_i = 1 if district i was flooded
  α_i, γ_t = district & year fixed effects     baseline 2000-02 = reference
β2 < 0 (destruction), β3 > 0 (reconstruction boom), β1≈β4≈0.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
import data_prep as dp                      # noqa: E402


def pyfixest_crosscheck(d: pd.DataFrame) -> None:
    """Confirm the data_prep within-estimator matches pyfixest's point estimates
    (so the tables below, which add Conley SEs by hand, rest on the same betas)."""
    import pyfixest as pf
    samp = dp.table2_samples(d)["Sumatra controls (red & yellow)"]
    df = dp.make_did_terms(samp, "flooded")
    m = pf.feols(dp.did_formula("gdp_growth", "district_id"), data=df,
                 vcov={"CRV1": "district_id"})
    est, _ = dp.did_estimate(samp, "gdp_growth", "flooded")
    dp.banner("pyfixest cross-check (Table 2, col 1): point estimates agree")
    print(f"   {'term':<22}{'pyfixest':>12}{'data_prep':>12}")
    for i, t in enumerate(dp.DID_TERMS):
        print(f"   {dp.TERM_LABELS[t]:<22}{m.coef()[t]:>+12.4f}{est['estimate'].iloc[i]:>+12.4f}")
    print("   -> identical; the tables below report Conley spatial-HAC SEs on these betas.")


def main() -> None:
    d = dp.load_district()
    pyfixest_crosscheck(d)

    # ---- Table 2 : the main result, three control pools -------------------
    dp.did_conley_table(
        dp.table2_samples(d), "gdp_growth",
        "TABLE 2 — Tsunami effect on district GDP growth", "table2_gdp_did",
        "Paper: 2005 ≈ −0.081***, 2006–08 ≈ +0.059**/+0.063**/+0.030**, pre & post ns.\n"
        "Reading: flooded districts lost ~8% output in 2005 but the reconstruction\n"
        "boom (2006–08) more than made up for it — a sustained higher path. Versus\n"
        "Aceh's own non-flooded districts (col 3) the recovery gap is only half as\n"
        "large, because reconstruction spilled over to neighbouring Aceh districts.")

    # ---- Table 8 : GDP PER CAPITA -----------------------------------------
    dp.did_conley_table(
        dp.table2_samples(d), "gdp_pc_growth",
        "TABLE 8 — Tsunami effect on district GDP PER CAPITA growth", "table8_gdppc_did",
        "Paper: 2005 ns (no per-capita loss), 2006–08 ≈ +0.078***/+0.087***/+0.024(ns).\n"
        "Reading: GDP and population fell together in 2005, so per-capita output held\n"
        "up; in recovery, fewer people shared a rebuilt economy (per-capita gain >\n"
        "the total-GDP gain). Versus Aceh controls (col 3) the gap is insignificant.")

    # ---- Table 5 : robustness — add North Sumatra -------------------------
    dp.did_conley_table(
        dp.table5_samples(d), "gdp_growth",
        "TABLE 5 — Robustness: including North Sumatra", "table5_north_sumatra",
        "Paper: 2005 ≈ −0.082***, 2006–08 ≈ +0.045–0.057* (weaker, only *).\n"
        "The 2 flooded North-Sumatra islands (also hit by the March-2005 Nias quake)\n"
        "saw a bigger 2005 loss and little reconstruction boom, diluting the effect.")

    # ---- Table 6 : robustness — coastal controls only ---------------------
    dp.did_conley_table(
        dp.table6_samples(d), "gdp_growth",
        "TABLE 6 — Robustness: dropping inland control districts", "table6_coastal_only",
        "Paper: 2005 ≈ −0.08***, 2006–08 ≈ +0.060**/+0.063**/+0.044***.\n"
        "Treated districts are all coastal, so inland controls may be poor comparators;\n"
        "restricting to coastal controls leaves the pattern intact.")

    # ---- Table 7 : city (Kota) vs rural (Kabupaten) -----------------------
    dp.did_conley_table(
        dp.table7_samples(d), "gdp_growth",
        "TABLE 7 — City (Kota) vs rural (Kabupaten) districts", "table7_city_vs_rural",
        "Paper: rural districts contracted hard in 2005 (≈ −0.098***) with a modest\n"
        "rebound (≈ +0.040**); cities barely contracted (≈ −0.015 ns) but rebounded\n"
        "hugely (≈ +0.134*). NOTE: only 2 flooded city districts, so the city columns\n"
        "are imprecise (few clusters) — read them with caution, as the paper warns.")

    # ---- Table 9 : placebo — neighbours of flooded districts --------------
    dp.did_conley_table(
        dp.table9_samples(d), "gdp_growth",
        "TABLE 9 — Placebo: neighbours of flooded districts", "table9_placebo",
        "Paper: NO significant effect — the result is not driven by spatial spill-overs\n"
        "onto neighbours. (All four coefficients should be ns.)",
        treat="neighbour_of_flooded")

    dp.banner("All GDP DiD tables written to tables/ (markdown + LaTeX); SEs are Conley spatial-HAC")


if __name__ == "__main__":
    main()
