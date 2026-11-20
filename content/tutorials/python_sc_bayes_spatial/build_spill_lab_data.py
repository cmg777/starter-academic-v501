"""Write the generated data block of assets/js/spill-lab.js.

The spill-lab shortcode (section 9.7 of index.md) evaluates the closed form

    xi_c = (I - rho * Wn)^{-1} rho * wn * xi0

live in the browser. This script copies everything it needs from the outputs
of analysis.py into the block between `// BEGIN GENERATED DATA` and
`// END GENERATED DATA`, and prints the Python reference values that
tests/spill-lab.test.cjs checks the JavaScript against.

    python content/tutorials/python_sc_bayes_spatial/build_spill_lab_data.py          # rewrite the block
    python content/tutorials/python_sc_bayes_spatial/build_spill_lab_data.py --check  # exit 1 if stale

Sources (all written by analysis.py): spatial_W.csv (raw 0/1 donor
contiguity), stage2_alpha_posterior.csv (posterior mean weights, the
`alpha_hat` that scspill uses), stage3_summary.csv (ATT and rho with its
interval) and stage3_spillover_effects.csv (posterior mean spillovers, shown
beside the plug-in values). The exposure vector puts weight 1 on Nevada, the
only donor that borders California (`panel.spatial_w`).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

POST = Path(__file__).resolve().parent
REPO = POST.parents[2]
JS = REPO / "assets" / "js" / "spill-lab.js"
REF = REPO / "tests" / "spill-lab.reference.json"
BEGIN, END = "// BEGIN GENERATED DATA", "// END GENERATED DATA"

# Tile-grid layout (row, col), the same as STATE_TILES in analysis.py.
TILES = {
    "Maine": (0, 10), "Vermont": (1, 9), "New Hampshire": (1, 10),
    "Washington": (2, 0), "Idaho": (2, 1), "Montana": (2, 2), "North Dakota": (2, 3),
    "Minnesota": (2, 4), "Illinois": (2, 5), "Wisconsin": (2, 6), "Michigan": (2, 7),
    "New York": (2, 8), "Rhode Island": (2, 9), "Massachusetts": (2, 10),
    "Oregon": (3, 0), "Nevada": (3, 1), "Wyoming": (3, 2), "South Dakota": (3, 3),
    "Iowa": (3, 4), "Indiana": (3, 5), "Ohio": (3, 6), "Pennsylvania": (3, 7),
    "New Jersey": (3, 8), "Connecticut": (3, 9),
    "California": (4, 0), "Utah": (4, 1), "Colorado": (4, 2), "Nebraska": (4, 3),
    "Missouri": (4, 4), "Kentucky": (4, 5), "West Virginia": (4, 6),
    "Virginia": (4, 7), "Maryland": (4, 8), "Delaware": (4, 9),
    "Arizona": (5, 1), "New Mexico": (5, 2), "Kansas": (5, 3), "Arkansas": (5, 4),
    "Tennessee": (5, 5), "North Carolina": (5, 6), "South Carolina": (5, 7),
    "Oklahoma": (6, 3), "Louisiana": (6, 4), "Mississippi": (6, 5),
    "Alabama": (6, 6), "Georgia": (6, 7),
    "Texas": (7, 3), "Florida": (7, 8),
}
POSTAL = {
    "Alabama": "AL", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL",
    "Georgia": "GA", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN",
    "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA",
    "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI",
    "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT",
    "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
    "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
    "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR",
    "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
    "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
    "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
}


def load():
    W = pd.read_csv(POST / "spatial_W.csv", index_col=0)
    donors = list(W.index)
    assert list(W.columns) == donors, "spatial_W.csv must be square in donor order"
    alpha = (pd.read_csv(POST / "stage2_alpha_posterior.csv")
             .set_index("state")["alpha_hat"].reindex(donors))
    summ = pd.read_csv(POST / "stage3_summary.csv").set_index("quantity")
    post_sp = (pd.read_csv(POST / "stage3_spillover_effects.csv")
               .set_index("state")["avg_spillover"].reindex(donors))
    assert alpha.notna().all() and post_sp.notna().all()
    return donors, W, alpha, summ, post_sp


def spill(Wn, wn, rho, xi0, rounds=None):
    """Spillover on every donor; `rounds` truncates the Neumann series."""
    if rounds is None:
        return np.linalg.solve(np.eye(len(wn)) - rho * Wn, rho * wn) * xi0
    x = rho * wn * xi0
    acc = x.copy()
    for _ in range(rounds - 1):
        x = rho * Wn @ x
        acc = acc + x
    return acc


def build():
    donors, W, alpha, summ, post_sp = load()
    Wr = W.to_numpy(dtype=float)
    adj = [[int(j) for j in np.nonzero(Wr[i])[0]] for i in range(len(donors))]
    deg = Wr.sum(axis=1)
    Wn = Wr / deg[:, None]
    wn = np.array([1.0 if s == "Nevada" else 0.0 for s in donors])

    att = float(summ.loc["att", "value"])
    rho = float(summ.loc["rho_hat", "value"])
    rho_lo = float(summ.loc["rho_hat", "lo95"])
    rho_hi = float(summ.loc["rho_hat", "hi95"])
    att_scm = float(summ.loc["att_scm", "value"])

    data = {
        "donors": donors,
        "adj": adj,                                   # donor contiguity lists
        "alpha": [float(a) for a in alpha],
        "postMean": [float(v) for v in post_sp],
        "att": att, "attScm": att_scm,
        "rho": rho, "rhoLo": rho_lo, "rhoHi": rho_hi,
        "tiles": {s: [r, c] for s, (r, c) in TILES.items()},
        "postal": POSTAL,
    }

    # Python reference values for the tests, at the defaults and a few other points.
    def ref(r, x0, rounds=None):
        xi = spill(Wn, wn, r, x0, rounds)
        bias = -float(alpha.to_numpy() @ xi)
        return {"rho": r, "xi0": x0, "rounds": rounds,
                "nevada": float(xi[donors.index("Nevada")]),
                "idaho": float(xi[donors.index("Idaho")]),
                "utah": float(xi[donors.index("Utah")]),
                "wyoming": float(xi[donors.index("Wyoming")]),
                "total": float(xi.sum()), "bias": bias, "naive": x0 + bias}

    cases = [ref(rho, att)] + [ref(rho, att, k) for k in (1, 2, 3, 4)] + [
        ref(rho_lo, att), ref(rho_hi, att), ref(0.0, att), ref(0.8, -25.0), ref(0.5, -10.0, 2)]
    return data, cases


def block(data) -> str:
    body = json.dumps(data, separators=(",", ":"), ensure_ascii=False)
    return (f"{BEGIN}\n  // Written by content/tutorials/python_sc_bayes_spatial/"
            f"build_spill_lab_data.py. Do not edit by hand.\n  var DATA = {body};\n  {END}")


def main():
    data, cases = build()
    src = JS.read_text(encoding="utf-8")
    i, j = src.index(BEGIN), src.index(END) + len(END)
    new = src[:i] + block(data) + src[j:]
    ref_text = json.dumps(cases, indent=1) + "\n"
    if "--check" in sys.argv:
        stale = new != src or not REF.exists() or REF.read_text() != ref_text
        print("spill-lab data block is", "STALE" if stale else "up to date")
        sys.exit(1 if stale else 0)
    JS.write_text(new, encoding="utf-8")
    REF.write_text(ref_text, encoding="utf-8")
    d = cases[0]
    print(f"wrote {JS.relative_to(REPO)} and {REF.relative_to(REPO)}")
    print(f"defaults: rho {d['rho']:.4f}  xi0 {d['xi0']:.3f}  Nevada {d['nevada']:.4f}  "
          f"bias {d['bias']:+.4f}  naive {d['naive']:.4f}")


if __name__ == "__main__":
    main()
