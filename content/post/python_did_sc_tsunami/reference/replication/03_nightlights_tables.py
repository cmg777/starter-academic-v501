#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
03_nightlights_tables.py  —  the sub-district night-lights tables
=================================================================
LIBRARY: pandas (Table 1) + pyfixest (Tables 3 & 4)
REPRODUCES: Tables 1, 3, 4 of Heger & Neumayer (2019).

Why night lights?  District GDP is too coarse to measure how INTENSELY a place
was hit.  Satellite night-time luminosity is available for the much finer
sub-districts (Kecamatans), so the paper moves down a level to exploit variation
in the flooding "dose."  The outcome is the growth rate of log-summed luminosity
(`nl_growth`); the design is the SAME staggered DiD as the GDP tables, but the
fixed effects and clustering are now at the Kecamatan level.

Intensity is measured two ways (Table 3), both plausibly exogenous (geography
decided them, not economics):
  • share_pop_flooded  — fraction of the population in the flooded zone
  • share_area_flooded — fraction of land area flooded (mean is tiny ⇒ its
                         coefficient is large, ≈ +1.75 vs ≈ +0.016)
Because the flooding dose is right-skewed (most flooded sub-districts only
lightly, a few devastated), the growth effect concentrates in the most-hit
units — which Table 4 shows by splitting EACH intensity measure into quintiles
(only the top quintile is significant).

CAVEAT (documented): the paper's Table 3 (continuous coefficients ~0.016/1.75)
and Table 4 (quintile coefficients ~0.38) are on mutually inconsistent scales —
no single data-generating process reproduces both magnitudes.  We reproduce
Table 3's magnitudes exactly and Table 4's PATTERN (only the top quintile
significant); the quintile magnitudes here are on Table 3's (smaller) scale.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
import data_prep as dp                      # noqa: E402
import pyfixest as pf                       # noqa: E402


def table1_summary(s: pd.DataFrame) -> None:
    """Table 1 — descriptive: 2004 average luminosity, flooded vs non-flooded."""
    dp.banner("TABLE 1 — average 2004 luminosity in Aceh's 276 sub-districts")
    snap = s[s["year"] == 2004]
    tab = (snap.groupby("flooded")["avg_luminosity"]
           .agg(Obs="count", Mean="mean", Std="std", Min="min", Max="max"))
    tab.index = ["Non-flooded", "Flooded"]
    print(tab.round(2).to_string())
    print("\nPaper: Flooded  n=68  mean=5.28  sd=8.87  max=38.8 ;"
          "  Non-flooded n=208 mean=2.30 sd=4.33 max=36.4.")
    print("Reading: flooded coastal sub-districts are brighter (denser, more"
          " economically active) — and their lights are what we track over time.")
    dp.save_text("table1_luminosity_summary.md",
                 "# Table 1 — 2004 average luminosity (mean Digital Number, 0–63)\n\n"
                 + tab.round(2).to_markdown()
                 + "\n\n_Paper: Flooded n=68 mean=5.28 sd=8.87 max=38.8; Non-flooded "
                   "n=208 mean=2.30 sd=4.33 max=36.4._\n")


def nl_fit(s: pd.DataFrame, treat: str):
    """One night-lights DiD column: nl_growth on treat×period, Kecamatan + year FE.
    The paper clusters night-lights SEs on the sub-district (serial correlation);
    no spatial term is used (the night-lights regressions do not converge with
    Conley SEs, as the paper notes in its footnote 10)."""
    df = dp.make_did_terms(s, treat_col=treat)
    return pf.feols(dp.did_formula("nl_growth", unit_fe="kecamatan_id"),
                    data=df, vcov={"CRV1": "kecamatan_id"})


def table3_intensity(s: pd.DataFrame) -> None:
    """Table 3 — dose-response: night-lights growth vs the two continuous intensity
    measures (the paper's two columns; the flood dummy is not a column here)."""
    measures = ["share_pop_flooded", "share_area_flooded"]
    models = [nl_fit(s, m) for m in measures]
    dp.pyfixest_table(
        models,
        headers=["Share of population flooded", "Share of area flooded"],
        title="TABLE 3 — Tsunami intensity and sub-district night-lights growth",
        slug="table3_nightlights_intensity",
        paper_note=("Paper: 2006–08 strongly POSITIVE for both measures "
                    "(share-of-pop ≈ +0.016***, share-of-area ≈ +1.75***);\n"
                    "2005 weak/negative (share-of-pop ≈ −0.008*, share-of-area ns),"
                    " pre & post ns.\nReading: the more flooded a sub-district, the"
                    " stronger its luminosity rebound during\nreconstruction. The two"
                    " columns share coefficient NAMES but measure different 'doses'\n"
                    "(share-of-area is a tiny fraction, hence its ~100× larger"
                    " coefficient)."))


def _quintile_dummies(s: pd.DataFrame, measure: str) -> tuple[pd.DataFrame, dict]:
    """Add Q1..Q5 × post-2005 dummies for the quintiles of `measure` (computed
    among flooded sub-districts; non-flooded units are the reference)."""
    df = s.copy()
    fl_units = (df[df["flooded"] == 1].drop_duplicates("kecamatan_id")
                .set_index("kecamatan_id")[measure])
    q = pd.qcut(fl_units, 5, labels=[1, 2, 3, 4, 5]).astype(int)
    df["_Q"] = df["kecamatan_id"].map(q).fillna(0).astype(int)
    labels = {}
    for qq in range(1, 6):
        col = f"Q{qq}_post"
        df[col] = ((df["_Q"] == qq) & (df["post"] == 1)).astype(float)
        labels[col] = f"Quintile {qq}{' (most flooded)' if qq == 5 else ''} × post-2005"
    return df, labels


def table4_quintiles(s: pd.DataFrame) -> None:
    """Table 4 — effect by quintile of intensity, for BOTH intensity measures
    (the paper's two panels). Only the top quintile is significant."""
    models, labels = [], None
    for measure in ["share_pop_flooded", "share_area_flooded"]:
        df, labels = _quintile_dummies(s, measure)
        rhs = " + ".join(f"Q{q}_post" for q in range(1, 6))
        models.append(pf.feols(f"nl_growth ~ {rhs} | kecamatan_id + year",
                               data=df, vcov={"CRV1": "kecamatan_id"}))
    dp.pyfixest_table(
        models,
        headers=["Quintiles of share-of-population flooded",
                 "Quintiles of share-of-area flooded"],
        title="TABLE 4 — Night-lights growth by quintile of flooding intensity",
        slug="table4_nightlights_quintiles",
        paper_note=("Paper: only the TOP quintile (most heavily flooded) shows a\n"
                    "significant positive effect for either measure; quintiles 1–4\n"
                    "are insignificant. Reading: the growth advantage is driven by the\n"
                    "worst-hit places, where the largest reconstruction effort went.\n"
                    "(Magnitudes are on Table 3's scale — see the caveat in the header.)"),
        labels=labels)


def main() -> None:
    s = dp.load_subdistrict()
    table1_summary(s)
    table3_intensity(s)
    table4_quintiles(s)
    dp.banner("Night-lights tables written to tables/ (markdown + LaTeX)")


if __name__ == "__main__":
    main()
