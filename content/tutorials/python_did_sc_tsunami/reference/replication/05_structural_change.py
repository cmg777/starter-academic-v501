#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
05_structural_change.py  —  did the tsunami change Aceh's economic STRUCTURE?
=============================================================================
LIBRARY: mlsynth (VanillaSC) + matplotlib
REPRODUCES: Figures 4, 5, 6, 7 of Heger & Neumayer (2019).

The earlier scripts ask whether the tsunami changed the LEVEL/growth of output.
This one asks whether it changed the COMPOSITION of the economy. The paper runs
the synthetic-control method at the PROVINCE level (GDP sub-components are only
available there), comparing Aceh's trajectory to a "synthetic Aceh" built from
other Sumatra provinces:

  Figure 4 — agriculture as a share of GDP   (expected: Aceh falls BELOW synthetic)
  Figure 5 — manufacturing share of GDP      (expected: Aceh falls below synthetic)
  Figure 6 — services share of GDP           (expected: Aceh rises ABOVE synthetic)
  Figure 7 — capital formation per capita    (expected: Aceh spikes above synthetic)

Together these say: the disaster + reconstruction pushed Aceh OUT of agriculture
and into services, with an investment boom — a structural transformation that
its synthetic counterfactual (no tsunami) did not undergo.

NOTE: at the province level there are only ~9 donor provinces, so the pre-period
fit is necessarily looser than the district-level synthetic control in script 04.
That is inherent to the data, not a bug — the qualitative divergence is the point.
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
from mlsynth import VanillaSC                 # noqa: E402


def province_scm(d: pd.DataFrame, outcome_col: str, fig_no: int,
                 title: str, ylabel: str, slug: str) -> None:
    """Run a province-level synthetic control for `outcome_col` and plot it."""
    dp.banner(f"FIGURE {fig_no} — {title}")

    # Treated unit = Aceh province aggregate; donors = the other Sumatra
    # provinces (population-weighted aggregates), treatment switching on in 2005.
    panel = dp.scm_structural_panel(d, outcome_col)
    res = VanillaSC({"df": panel, "outcome": "outcome", "treat": "treat",
                     "unitid": "unitid", "time": "time", "display_graphs": False}).fit()
    out = res.model_dump()
    ts, diag = out["time_series"], out["fit_diagnostics"]
    years = np.asarray(ts["time_periods"])
    treated = np.asarray(ts["observed_outcome"], dtype=float)
    synth = np.asarray(ts["counterfactual_outcome"], dtype=float)

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(years, treated, "-", color="firebrick", lw=2.4, label="Aceh (treated)")
    ax.plot(years, synth, "--", color="black", lw=1.8, label="Synthetic Aceh (no tsunami)")
    ax.axvline(2004.5, color="steelblue", ls="--", lw=1, label="tsunami (Dec 2004)")
    ax.fill_between(years, treated, synth, where=(years >= 2005),
                    color="firebrick", alpha=0.12)
    ax.set_xlabel("Year")
    ax.set_ylabel(ylabel)
    ax.set_title(f"Figure {fig_no} — {title}: Aceh vs synthetic Aceh")
    ax.legend(frameon=False, fontsize=8)
    fig.tight_layout()
    path = dp.FIGURES_DIR / f"{slug}.png"
    fig.savefig(path, dpi=150)
    plt.close(fig)

    # Report the 2004 (pre) and 2012 (end) values for treated vs synthetic.
    i04, i12 = np.where(years == 2004)[0][0], np.where(years == 2012)[0][0]
    print(f"  pre-fit RMSE = {diag['rmse_pre']:.3f}")
    print(f"  2004: Aceh {treated[i04]:.1f} vs synthetic {synth[i04]:.1f}   "
          f"(should be close — pre-tsunami match)")
    print(f"  2012: Aceh {treated[i12]:.1f} vs synthetic {synth[i12]:.1f}   "
          f"(gap = {treated[i12] - synth[i12]:+.1f} = the structural effect)")
    print(f"  saved → {path.relative_to(dp.DATA_DIR)}")


def main() -> None:
    d = dp.load_district()
    province_scm(d, "va_agri_share", 4, "Agriculture share of GDP",
                 "Agriculture VA (% of GDP)", "fig4_agriculture_share")
    province_scm(d, "va_manu_share", 5, "Manufacturing share of GDP",
                 "Manufacturing VA (% of GDP)", "fig5_manufacturing_share")
    province_scm(d, "va_serv_share", 6, "Services share of GDP",
                 "Services VA (% of GDP)", "fig6_services_share")
    province_scm(d, "capital_formation_pc_usd", 7, "Capital formation per capita",
                 "Capital formation per capita (USD)", "fig7_capital_formation")
    dp.banner("Figures 4–7 written to figures/  —  Aceh's structural transformation")


if __name__ == "__main__":
    main()
