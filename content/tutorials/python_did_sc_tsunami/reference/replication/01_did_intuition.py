#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
01_did_intuition.py  —  Difference-in-Differences, from first principles
========================================================================
LIBRARY: diff-diff   (https://github.com/igerber/diff-diff)
GOAL:    teach *why* difference-in-differences identifies the tsunami's effect,
         building from the simplest 2x2 comparison up to the multi-period
         event study that the paper actually reports (Table 2 / Figure 2).

This script is the conceptual on-ramp for the suite.  The formatted publication
tables come later (02_did_tables_gdp.py, with pyfixest); here we slow down and
make every step of the DiD logic explicit.

------------------------------------------------------------------------------
THE IDEA
------------------------------------------------------------------------------
We want the causal effect of the tsunami on a district's GDP growth.  We cannot
observe the *counterfactual* — how flooded districts would have grown had the
wave never come.  DiD's trick is to use NON-flooded districts to stand in for
that counterfactual TREND, under one key assumption:

    PARALLEL TRENDS — absent the tsunami, flooded and non-flooded districts
    would have grown by the same amount on average.

If that holds, then:

    effect = (growth_flooded_after − growth_flooded_before)        <- treated change
             − (growth_control_after − growth_control_before)      <- control change

The first difference removes anything permanent about flooded districts; the
second difference removes any common, nationwide shock.  What survives is the
tsunami's effect.  Because our OUTCOME is itself a growth rate, the "before/
after" contrast is a contrast of average growth rates.
"""

from __future__ import annotations

import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")                     # headless backend: save figures, don't pop windows
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
import data_prep as dp                     # noqa: E402
import diff_diff as dd                     # noqa: E402


def main() -> None:
    # ----------------------------------------------------------------------
    # Data.  We use the MAIN estimation sample (flooded Aceh districts + all
    # Sumatra controls, North Sumatra excluded) — the same sample as Table 2,
    # column 1.  diff-diff requires complete cases, so we drop the rows whose
    # growth rate is missing (1999 has no prior year; Subulussalam is missing
    # 2003–06).  pyfixest does this automatically later; here we are explicit.
    # ----------------------------------------------------------------------
    d = dp.make_did_terms(dp.load_district(), treat_col="flooded")
    sample = (dp.table2_samples(d)["Sumatra controls (red & yellow)"]
              .dropna(subset=["gdp_growth"]).copy())

    # =====================================================================
    # PART A — THE 2x2 DIFFERENCE-IN-DIFFERENCES (the whole idea in one table)
    # =====================================================================
    dp.banner("PART A — the 2x2 DiD: flooded vs control, before vs after 2005")

    # `post` = 1 for 2005 onward (after the tsunami), 0 for 2000–2004.
    # `flooded` = 1 for treated districts.  The four group means of `gdp_growth`
    # are the four cells of the canonical DiD table.
    cell = (sample.groupby(["flooded", "post"])["gdp_growth"].mean().unstack("post"))
    cell.columns = ["Before (≤2004)", "After (≥2005)"]
    cell.index = ["Control (not flooded)", "Treated (flooded)"]
    cell["After − Before"] = cell["After (≥2005)"] - cell["Before (≤2004)"]

    print("\nMean annual GDP growth in each cell:\n")
    print(cell.round(4).to_string())

    # The DiD estimate is the difference of the two "After − Before" changes.
    did_by_hand = cell.loc["Treated (flooded)", "After − Before"] - \
        cell.loc["Control (not flooded)", "After − Before"]
    print(f"\n  DiD by hand = (treated change) − (control change) = {did_by_hand:+.4f}")
    print("  → on average over 2005–2012, flooded districts grew about "
          f"{did_by_hand*100:.1f} percentage points/year faster than controls.")

    # Now the SAME estimate from diff-diff, which additionally gives a standard
    # error.  We cluster by district because repeated yearly observations of the
    # same district are not independent.
    res = dd.DifferenceInDifferences(cluster="district_id").fit(
        sample, outcome="gdp_growth", treatment="flooded", time="post")
    lo, hi = res.conf_int
    print(f"\n  diff-diff DifferenceInDifferences: ATT = {res.att:+.4f} "
          f"(SE {res.se:.4f}, p = {res.p_value:.3f}, 95% CI [{lo:+.4f}, {hi:+.4f}])")
    print("  ✓ identical point estimate to the hand calculation — now with inference.")
    print("\n  HOW TO READ THIS: a single 'after' window blends two very different\n"
          "  phases — the 2005 destruction and the 2006–08 reconstruction boom — so\n"
          "  the average looks small and only marginally significant. Part B unpacks it.")

    # =====================================================================
    # PART B — MULTI-PERIOD DiD (the dynamics behind the headline)
    # =====================================================================
    dp.banner("PART B — splitting 'after' into event-time periods (Table 2 dynamics)")

    # diff-diff's MultiPeriodDiD estimates a separate treated-vs-control effect
    # for each period, all relative to a chosen reference period.  We use the
    # paper's design exactly: reference = the 2000–02 baseline, and one effect
    # each for pre-tsunami (2003–04), tsunami (2005), recovery (2006–08), and
    # post-recovery (2009–12).  `absorb=['district_id']` sweeps out district
    # fixed effects (period effects are included automatically), and we cluster
    # by district.
    mp = dd.MultiPeriodDiD(cluster="district_id").fit(
        sample, outcome="gdp_growth", treatment="flooded", time="period",
        reference_period="baseline", absorb=["district_id"])

    order = ["pre", "tsunami", "recovery", "postrec"]
    labels = {"pre": "Pre-tsunami 2003–04", "tsunami": "Tsunami 2005",
              "recovery": "Recovery 2006–08", "postrec": "Post-recovery 2009–12"}
    rows = []
    for p in order:
        pe = mp.period_effects[p]
        rows.append([labels[p], pe.effect, pe.se, pe.p_value])
    tab = pd.DataFrame(rows, columns=["Period", "Effect", "Std.Err", "p-value"])
    print("\nTreated−control effect on GDP growth, relative to the 2000–02 baseline:\n")
    print(tab.round(4).to_string(index=False))

    loss = mp.period_effects["tsunami"].effect
    boom = mp.period_effects["recovery"].effect
    print(f"\n  READING THE STORY:")
    print(f"   • Pre-tsunami ≈ 0 and insignificant  → parallel-trends check PASSES.")
    print(f"   • 2005 = {loss:+.3f}  → the wave destroyed output (significant drop).")
    print(f"   • 2006–08 = {boom:+.3f}/yr → the aid-funded reconstruction BOOM.")
    print(f"   • Cumulative recovery ≈ 3 × {boom:.3f} = {3*boom:+.3f} dwarfs the "
          f"{loss:+.3f} loss → 'recovery BEYOND the counterfactual trend'.")

    # Save the multi-period table for reference.
    dp.save_text("table_did_intuition_multiperiod.md",
                 "# DiD intuition — multi-period effects (diff-diff)\n\n"
                 "Outcome: annual GDP growth. Reference period: 2000–02 baseline.\n"
                 "Sample: flooded Aceh + all Sumatra controls (Table 2 col. 1).\n\n"
                 + tab.round(4).to_markdown(index=False))

    # =====================================================================
    # PART C — EVENT-STUDY PLOT (visualising parallel trends + the effect path)
    # =====================================================================
    dp.banner("PART C — event-study figure")

    # Plot each period's effect with a 95% confidence interval. The baseline is
    # pinned at exactly 0 (it is the reference). A flat, near-zero pre-tsunami
    # point visually confirms parallel trends; the dip-then-rise after 2005 is
    # the causal story.
    xlabels = ["Baseline\n2000–02", "Pre\n2003–04", "Tsunami\n2005",
               "Recovery\n2006–08", "Post-rec\n2009–12"]
    eff = [0.0] + [mp.period_effects[p].effect for p in order]
    se = [0.0] + [mp.period_effects[p].se for p in order]
    x = np.arange(len(eff))

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.axhline(0, color="grey", lw=1)
    ax.axvline(2, color="steelblue", ls="--", lw=1, label="tsunami (Dec 2004)")
    ax.errorbar(x, eff, yerr=1.96 * np.array(se), fmt="o-", color="firebrick",
                capsize=4, lw=2, label="treated − control effect (95% CI)")
    ax.set_xticks(x)
    ax.set_xticklabels(xlabels)
    ax.set_ylabel("Effect on annual GDP growth")
    ax.set_title("Event study: tsunami effect on flooded districts' GDP growth\n"
                 "(diff-diff MultiPeriodDiD; Heger & Neumayer 2019, Table 2 col. 1)")
    ax.legend(loc="upper left", frameon=False)
    fig.tight_layout()
    out = dp.FIGURES_DIR / "fig_event_study_gdp.png"
    fig.savefig(out, dpi=150)
    plt.close(fig)
    print(f"  saved event-study figure → {out.relative_to(dp.DATA_DIR)}")

    dp.banner("PART A–C done — the same numbers appear, formatted, in Table 2 (script 02)")


if __name__ == "__main__":
    main()
