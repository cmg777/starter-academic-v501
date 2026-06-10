#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
04_synthetic_control.py  —  GDP dynamics and the synthetic control
==================================================================
LIBRARY: matplotlib (Figure 2) + mlsynth (Figure 3)
REPRODUCES: Figures 2 & 3 of Heger & Neumayer (2019).

DiD answers "did flooded districts grow faster than controls?" The SYNTHETIC
CONTROL method answers a sharper question: "how would the flooded districts have
evolved with NO tsunami?" — by building a single bespoke counterfactual ("the
synthetic Aceh") as a weighted average of donor districts chosen to match the
treated group's PRE-tsunami trajectory. After 2004 the two lines are allowed to
diverge; the gap is the estimated effect.

  Figure 2 = raw description: average GDP (indexed to 2004 = 100) of the flooded
             districts vs the two control groups. No model — just group means.
  Figure 3 = the synthetic control: treated flooded-Aceh average vs a synthetic
             counterfactual built (with mlsynth's VanillaSC, the classic
             Abadie–Diamond–Hainmueller estimator) from Rest-of-Sumatra donors.
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


def figure2(d: pd.DataFrame) -> None:
    """Figure 2 — GDP index (2004 = 100): treated vs two control groups."""
    dp.banner("FIGURE 2 — GDP dynamics: flooded districts vs counterfactual groups")

    def index_100(mask: pd.Series) -> pd.Series:
        # Aggregate GDP across the group's districts, then normalise to 2004.
        g = d[mask].groupby("year")["gdp_const_usd_m"].sum()
        return g / g.loc[2004] * 100.0

    treated = index_100((d["flooded"] == 1) & (d["region_group"] == "Aceh"))
    aceh_ctrl = index_100((d["flooded"] == 0) & (d["region_group"] == "Aceh"))
    rest_ctrl = index_100(d["region_group"] == "Rest of Sumatra")

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(treated.index, treated, "-", color="firebrick", lw=2.4,
            label="Tsunami-flooded Aceh districts (treated, n=10)")
    ax.plot(aceh_ctrl.index, aceh_ctrl, "--", color="black", lw=1.8,
            label="Non-flooded Aceh districts (control, n=13)")
    ax.plot(rest_ctrl.index, rest_ctrl, ":", color="darkorange", lw=1.8,
            label="Rest of Sumatra (control, n=76)")
    ax.axvline(2004.5, color="steelblue", ls="--", lw=1, label="tsunami (Dec 2004)")
    ax.axvline(2008, color="grey", ls="--", lw=1, label="most aid spent (2008)")
    ax.set_xlabel("Year")
    ax.set_ylabel("GDP index (2004 = 100)")
    ax.set_title("Figure 2 — GDP dynamics in Aceh's flooded districts vs counterfactuals")
    ax.legend(frameon=False, fontsize=8, loc="upper left")
    fig.tight_layout()
    out = dp.FIGURES_DIR / "fig2_gdp_dynamics.png"
    fig.savefig(out, dpi=150)
    plt.close(fig)

    print(f"  2012 index — treated {treated.loc[2012]:.0f},  "
          f"Aceh control {aceh_ctrl.loc[2012]:.0f},  rest {rest_ctrl.loc[2012]:.0f}")
    print("  Reading: parallel before 2005; the treated line dips at the tsunami,\n"
          "  then climbs ABOVE both control groups — output ended higher than its\n"
          "  counterfactual would suggest.")
    print(f"  saved → {out.relative_to(dp.DATA_DIR)}")


def figure3(d: pd.DataFrame) -> None:
    """Figure 3 — synthetic control of the flooded-Aceh GDP average (mlsynth)."""
    dp.banner("FIGURE 3 — synthetic control: treated Aceh vs synthetic Aceh")

    # Reshape to mlsynth's long format: one treated unit (the average GDP of the
    # 10 flooded Aceh districts) + 76 Rest-of-Sumatra donor districts, with a 0/1
    # `treat` column that switches on for the treated unit from 2005.
    panel = dp.scm_gdp_panel(d)
    config = {
        "df": panel, "outcome": "outcome", "treat": "treat",
        "unitid": "unitid", "time": "time", "display_graphs": False,
    }
    # VanillaSC = the classic Abadie–Diamond–Hainmueller synthetic control:
    # donor weights are non-negative and sum to one, chosen to best match the
    # treated unit's pre-2005 GDP path.
    res = VanillaSC(config).fit()
    out = res.model_dump()
    ts, eff, diag = out["time_series"], out["effects"], out["fit_diagnostics"]

    years = np.asarray(ts["time_periods"])
    observed = np.asarray(ts["observed_outcome"], dtype=float)
    synthetic = np.asarray(ts["counterfactual_outcome"], dtype=float)

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(years, observed, "-", color="firebrick", lw=2.4,
            label="Treated: flooded-Aceh average GDP")
    ax.plot(years, synthetic, "--", color="black", lw=1.8,
            label="Synthetic Aceh (weighted donors)")
    ax.axvline(2004.5, color="steelblue", ls="--", lw=1, label="tsunami (Dec 2004)")
    ax.fill_between(years, observed, synthetic, where=(years >= 2005),
                    color="firebrick", alpha=0.12, label="estimated effect (gap)")
    ax.set_xlabel("Year")
    ax.set_ylabel("GDP (constant USD, millions)")
    ax.set_title("Figure 3 — Synthetic control: Aceh's flooded districts vs synthetic Aceh")
    ax.legend(frameon=False, fontsize=8, loc="upper left")
    fig.tight_layout()
    fig_out = dp.FIGURES_DIR / "fig3_synthetic_control.png"
    fig.savefig(fig_out, dpi=150)
    plt.close(fig)

    # Report the diagnostics that make a synthetic control credible.
    weights = out["weights"]["donor_weights"]
    top = sorted(weights.items(), key=lambda kv: -abs(kv[1]))[:6]
    print(f"  Pre-tsunami fit  : RMSE = {diag['rmse_pre']:.3f}  (small ⇒ synthetic "
          "tracks the treated well before 2005)")
    print(f"  Post-tsunami ATT : +{eff['att']:.1f} GDP units  "
          f"(≈ +{eff['att_percent']:.1f}% above the counterfactual)")
    print("  Biggest donor weights (the 'recipe' for synthetic Aceh):")
    for name, w in top:
        print(f"      {name:14s} {w:5.3f}")
    print(f"  saved → {fig_out.relative_to(dp.DATA_DIR)}")
    print("\n  Reading: the synthetic counterfactual matches treated GDP almost\n"
          "  exactly until 2004, then treated pulls clearly above it — the same\n"
          "  'recovery beyond the counterfactual' the DiD tables quantify.")

    # Save a tiny text summary alongside the tables.
    dp.save_text("fig3_synthetic_control_summary.md",
                 "# Figure 3 — synthetic control summary\n\n"
                 f"- Treated unit: flooded-Aceh average GDP (10 districts)\n"
                 f"- Donor pool: {len(out['additional_outputs']['donor_names'])} "
                 "Rest-of-Sumatra districts\n"
                 f"- Pre-tsunami RMSE: {diag['rmse_pre']:.3f}\n"
                 f"- Post-tsunami ATT: +{eff['att']:.1f} ( +{eff['att_percent']:.1f}% )\n\n"
                 "| Top donor | Weight |\n|---|---|\n"
                 + "\n".join(f"| {n} | {w:.3f} |" for n, w in top) + "\n")


def main() -> None:
    d = dp.load_district()
    figure2(d)
    figure3(d)
    dp.banner("Figures 2–3 written to figures/")


if __name__ == "__main__":
    main()
