"""Build brexit_panel_wide.csv: the full 36-country OECD panel, one column per concept.

The R edition of this tutorial publishes the full source panel in long format
(one row per country-quarter-variable). Long format is tidy but hard to read
and hard to document, so this script pivots it to one row per country-quarter
with one column per concept. No value is changed: every number in the wide file
is the number in the long file, and the script asserts that.

It also adds one derived column, in_estimation_sample, equal to 1 for the 24
countries kept in brexit_analysis.csv and 0 for the 12 dropped ones. With it,
`wide[wide.in_estimation_sample == 1]` reproduces the donor-pool filter.

Usage (from this folder):
    python make_wide_panel.py
Input:  ../../r_sc_dsc_sdid/brexit_panel_long.csv (or its raw GitHub URL)
        brexit_analysis.csv (this folder; used for the sample flag and checks)
Output: brexit_panel_wide.csv
"""

from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
LOCAL_LONG = HERE.parent.parent / "r_sc_dsc_sdid" / "brexit_panel_long.csv"
URL_LONG = ("https://raw.githubusercontent.com/cmg777/starter-academic-v501/"
            "master/content/tutorials/r_sc_dsc_sdid/brexit_panel_long.csv")

# The 12 concepts, in the order prepare_data.R defines them.
CONCEPTS = ["real_gdp", "real_gdp_raw", "real_con_raw", "real_inv_raw",
            "real_exp_raw", "real_imp_raw", "real_gov_raw", "tot_emp_raw",
            "tot_emp_pc_raw", "lab_prod_raw", "unemp_rate_raw", "pop_quarterly"]
KEYS = ["country", "year", "quarter", "quarter_label", "date_dec"]

long = pd.read_csv(LOCAL_LONG if LOCAL_LONG.exists() else URL_LONG)
analysis = pd.read_csv(HERE / "brexit_analysis.csv")

assert set(long["variable"]) == set(CONCEPTS), "unexpected concept names"
assert not long.duplicated(KEYS + ["variable"]).any(), "duplicate long keys"

# A full country x quarter grid, so quarters with no data appear as empty cells
# instead of vanishing. 36 countries x 244 quarters (1960Q1-2020Q4).
quarters = (long[["year", "quarter", "quarter_label", "date_dec"]]
            .drop_duplicates().sort_values("date_dec"))
assert len(quarters) == 244, f"expected 244 quarters, found {len(quarters)}"
countries = sorted(long["country"].unique())
assert len(countries) == 36, f"expected 36 countries, found {len(countries)}"
grid = (pd.DataFrame({"country": countries}).merge(quarters, how="cross")
        .sort_values(["country", "date_dec"]).reset_index(drop=True))

values = long.pivot(index=["country", "date_dec"], columns="variable", values="value")
wide = grid.merge(values[CONCEPTS].reset_index(), on=["country", "date_dec"], how="left")

kept = set(analysis["country"])
wide.insert(5, "in_estimation_sample", wide["country"].isin(kept).astype(int))
wide = wide[KEYS + ["in_estimation_sample"] + CONCEPTS]

# ── Checks ───────────────────────────────────────────────────────────────────
# 1. Every long value lands in exactly one wide cell, unchanged.
back = wide.melt(id_vars=["country", "date_dec"], value_vars=CONCEPTS,
                 var_name="variable", value_name="value").dropna()
check = long.merge(back, on=["country", "date_dec", "variable"], suffixes=("", "_w"))
assert len(back) == len(long) == len(check), "pivot lost or added values"
assert (check["value"] == check["value_w"]).all(), "pivot changed a value"

# 2. The flag marks exactly the 24 countries of the estimation sample.
assert wide.groupby("country")["in_estimation_sample"].first().sum() == 24

# 3. log(real_gdp) reproduces the outcome of brexit_analysis.csv. The match is
#    to ~1e-9, not exact, because prepare_data.R rounds the long file to 10
#    significant digits while brexit_analysis.csv keeps the log at full precision.
est = wide[(wide.in_estimation_sample == 1) & wide.date_dec.between(1995, 2020.75)]
m = analysis.merge(est[["country", "date_dec", "real_gdp"]], on=["country", "date_dec"])
assert len(m) == len(analysis) == 2496
gap = np.abs(np.log(m["real_gdp"]) - m["log_rgdp"]).max()
assert gap < 1e-9, f"log(real_gdp) differs from log_rgdp by {gap:.2e}"

wide.to_csv(HERE / "brexit_panel_wide.csv", index=False)
print(f"wrote brexit_panel_wide.csv: {wide.shape[0]} rows x {wide.shape[1]} columns")
print(f"  long values carried over: {len(long)} (all identical)")
print(f"  max |log(real_gdp) - log_rgdp| on the estimation sample: {gap:.2e}")
print("  non-missing cells per concept:")
for c in CONCEPTS:
    n = wide[c].notna().sum()
    k = wide.loc[wide[c].notna(), "country"].nunique()
    print(f"    {c:<15s} {n:5d} cells, {k:2d} countries")
