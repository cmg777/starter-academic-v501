#!/usr/bin/env python3
"""Write the data block of the sc-lab widget from sc101_results.json.

The interactive lab (`layouts/shortcodes/sc-lab.html` and `assets/js/sc-lab.js`)
rebuilds every synthetic path from two inputs: the cigarette sales of the 39
states and the donor weights of each fit. This script copies both inputs from
`sc101_results.json` into the block between the two marker comments
`// BEGIN GENERATED DATA` and `// END GENERATED DATA` of `assets/js/sc-lab.js`.
It uses only the Python standard library.

Usage, from the repository root:

    `python3 content/post/python_sc101/build_sc_lab_data.py`
    `python3 content/post/python_sc101/build_sc_lab_data.py --check`

The first command rewrites the block. The second command changes nothing; it
exits with status 1 when the block in the JavaScript file is stale.

Guards (each failure stops the script with exit status 1):

1. Every sales value v equals float32(k / 10) for the integer k = round(10 v),
   so the lab decodes it exactly with `Math.fround(k / 10)`.
2. The gap of every stored fit, rebuilt from its weights and the sales matrix,
   matches the gap in `sc101_results.json` to 1e-10. A fit that fails this test
   falls back to an embedded gap array, and the script reports it. The mixer
   presets store no gap, so their summary statistics must match the entries of
   `lab_scenarios` to 1e-9 instead.
3. The output is deterministic. A second run writes the same bytes, and the
   check mode compares the block in the file with a freshly built block.
"""
from __future__ import annotations

import argparse
import json
import math
import struct
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
RESULTS = HERE / "sc101_results.json"
TARGET = REPO / "assets" / "js" / "sc-lab.js"
BEGIN = "  // BEGIN GENERATED DATA: build_sc_lab_data.py"
END = "  // END GENERATED DATA"
GAP_TOL = 1e-10
STAT_TOL = 1e-9
PRESET_KEYS = ["mlsynth", "stata", "outcome", "equal_five", "utah_only"]
FITS_KEYS = {"mlsynth": "ml", "stata": "stata", "outcome": "outcome",
             "equal_five": "equal_five", "utah_only": "utah_only"}
WIDTH = 96


def fail(message: str) -> None:
    """Stop with a clear message and exit status 1."""
    print(f"build_sc_lab_data.py: {message}", file=sys.stderr)
    raise SystemExit(1)


def fround(x: float) -> float:
    """Round a double to the nearest float32, as Math.fround does."""
    return struct.unpack("f", struct.pack("f", x))[0]


def encode_sales(cigsale: list[list[float]]) -> list[list[int]]:
    """Guard 1: store sales times 10 as integers that decode exactly."""
    codes = []
    for row in cigsale:
        out = []
        for v in row:
            k = int(round(v * 10))
            if fround(k / 10) != v:
                fail(f"guard 1: the sales value {v!r} is not float32({k} / 10)")
            out.append(k)
        codes.append(out)
    return codes


def sparse(weights: list[float]) -> list[list[float]]:
    """Return the nonzero weights as [state index, weight] pairs."""
    return [[j, float(w)] for j, w in enumerate(weights) if w != 0.0]


def rebuild_gap(sales: list[list[float]], unit: int, pairs: list[list[float]]) -> list[float]:
    """Gap of one unit for a weight list, summed in the order of sc-lab.js."""
    periods = len(sales[0])
    synth = [0.0] * periods
    for j, w in sorted(pairs):
        for t in range(periods):
            synth[t] += w * sales[j][t]
    return [sales[unit][t] - synth[t] for t in range(periods)]


def summary(gap: list[float], t0: int) -> dict[str, float]:
    """Pre-period RMSPE, ATT, gap in the last year, and the MSPE ratio."""
    pre = sum(g * g for g in gap[:t0]) / t0
    post = sum(g * g for g in gap[t0:]) / (len(gap) - t0)
    return {"pre_rmspe": math.sqrt(pre), "att": sum(gap[t0:]) / (len(gap) - t0),
            "gap_2000": gap[-1], "ratio": post / pre}


def max_diff(a: list[float], b: list[float]) -> float:
    """Largest absolute difference between two equal-length lists."""
    if len(a) != len(b):
        return math.inf
    return max(abs(x - y) for x, y in zip(a, b))


def js_float(x: float) -> str:
    """Shortest text that JavaScript parses back to the same double."""
    text = repr(float(x))
    if not math.isfinite(float(x)):
        fail(f"non-finite number {text}")
    return text


def js_pairs(pairs: list[list[float]]) -> str:
    """Weight pairs as a JavaScript array literal."""
    return "[" + ", ".join(f"[{int(j)}, {js_float(w)}]" for j, w in pairs) + "]"


def wrap_items(items: list[str], indent: str) -> list[str]:
    """Join items with commas and wrap the result at WIDTH characters."""
    lines, line = [], indent
    for k, item in enumerate(items):
        piece = item + ("," if k < len(items) - 1 else "")
        if len(line) + len(piece) + 1 > WIDTH and line.strip():
            lines.append(line.rstrip())
            line = indent
        line += piece + " "
    if line.strip():
        lines.append(line.rstrip())
    return lines


def build_block(results: dict) -> tuple[str, list[str]]:
    """Return the generated block and the list of fits that fell back."""
    meta = results["meta"]
    states = results["states"]
    years = results["years"]
    sales = results["cigsale"]
    year0, periods, t0, ca = meta["first_year"], len(years), meta["t0"], meta["treated_index"]
    if states[ca] != meta["treated"] or meta["treated"] != "California":
        fail("the treated unit is not California at the stated index")
    if years != list(range(year0, year0 + periods)) or year0 + t0 != meta["treat_year"]:
        fail("the years do not run without gaps from the first year")
    if len(sales) != len(states) or any(len(r) != periods for r in sales):
        fail("the sales matrix does not have one row per state and one column per year")
    codes = encode_sales(sales)

    scenarios = results["lab_scenarios"]
    presets = {p["key"]: p for p in scenarios["mixer"]["presets"]}
    fits = results["fits"]
    gap_overrides: dict[str, list[float]] = {}
    fallbacks: list[str] = []

    def check_gap(key: str, unit: int, pairs: list[list[float]], stored: list[float]) -> None:
        diff = max_diff(rebuild_gap(sales, unit, pairs), stored)
        if diff > GAP_TOL:
            gap_overrides[key] = [float(v) for v in stored]
            fallbacks.append(f"{key} (max gap difference {diff:.2e})")

    # Mixer presets: weights only, checked against lab_scenarios
    preset_pairs = {}
    for key in PRESET_KEYS:
        weights = presets[key]["weights"]
        if weights != fits[FITS_KEYS[key]]:
            fail(f"the {key} preset differs from fits.{FITS_KEYS[key]}")
        pairs = sparse(weights)
        stats = summary(rebuild_gap(sales, ca, pairs), t0)
        for name, value in stats.items():
            ref = presets[key][name]
            if abs(value - ref) > STAT_TOL * max(1.0, abs(ref)):
                fail(f"guard 2: the {key} preset gives {name} {value!r}, not {ref!r}")
        preset_pairs[key] = pairs
    avg38 = sparse(fits["avg38"])
    if any(abs(w - 1 / 38) > 1e-15 for _, w in avg38) or len(avg38) != len(states) - 1:
        fail("fits.avg38 is not the equal-weight average of the 38 donors")
    check_gap("mlsynth", ca, preset_pairs["mlsynth"], results["baseline"]["gap"])
    check_gap("stata", ca, preset_pairs["stata"], results["baseline"]["stata_w"]["gap"])

    # Placebo fits: one per state, in the order of states
    units = results["placebo"]["units"]
    if [u["state"] for u in units] != states:
        fail("the placebo units do not follow the order of states")
    placebo_pairs = []
    for u, unit in enumerate(units):
        pairs = sparse(unit["weights"])
        if any(j == u for j, _ in pairs):
            fail(f"the placebo fit of {unit['state']} puts weight on the state itself")
        check_gap(f"placebo:{unit['state']}", u, pairs, unit["gap"])
        placebo_pairs.append(pairs)

    # In-time fits
    intime = results["intime"]
    fake_years = [f["fake_year"] for f in intime["fits"]]
    if fake_years != intime["fake_years"] or intime["default"] not in fake_years:
        fail("the in-time fits do not match the list of fake start years")
    intime_pairs = {}
    for f in intime["fits"]:
        pairs = sparse(f["weights"])
        check_gap(f"intime:{f['fake_year']}", ca, pairs, f["gap"])
        intime_pairs[f["fake_year"]] = pairs

    # Leave-one-out fits
    loo = results["loo"]
    dropped = [f["dropped"] for f in loo["fits"]]
    if dropped != loo["dropped"]:
        fail("the leave-one-out fits do not match the list of dropped donors")
    loo_pairs = {}
    for f in loo["fits"]:
        pairs = sparse(f["weights"])
        if any(states[j] == f["dropped"] for j, _ in pairs):
            fail(f"the refit without {f['dropped']} still uses that donor")
        check_gap(f"loo:{f['dropped']}", ca, pairs, f["gap"])
        loo_pairs[f["dropped"]] = pairs

    cut_values = scenarios["cutoff"]["values"]
    if scenarios["cutoff"]["default"] not in cut_values:
        fail("the default cutoff is not one of the cutoff stops")

    # Assemble the JavaScript text
    q = lambda s: "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"  # noqa: E731
    lines = [
        BEGIN,
        "  // Written from content/post/python_sc101/sc101_results.json. Do not edit",
        "  // this block by hand; rerun the generator named above after script.py changes.",
        f"  var YEAR0 = {year0}, T = {periods}, T0 = {t0}, CA = {ca};",
        "  var STATES = [",
        *wrap_items([q(s) for s in states], "    "),
        "  ];",
        "  // Cigarette sales times 10, one line per state; sales = Math.fround(k / 10).",
        "  var CIG10 = [",
    ]
    for s, row in enumerate(codes):
        sep = "," if s < len(codes) - 1 else ""
        lines.append("    " + ", ".join(str(k) for k in row) + sep + " // " + states[s])
    lines += [
        "  ];",
        "  // Donor weights of each fit as [state index, weight] pairs at full precision.",
        "  var FITS = {",
    ]
    for key in PRESET_KEYS:
        lines.append(f"    {key}: {js_pairs(preset_pairs[key])},")
    lines.append("    avg38: [")
    lines += wrap_items([f"[{j}, {js_float(w)}]" for j, w in avg38], "      ")
    lines.append("    ],")
    lines.append("    placebo: [")
    for u, pairs in enumerate(placebo_pairs):
        sep = "," if u < len(placebo_pairs) - 1 else ""
        lines.append(f"      {js_pairs(pairs)}{sep} // {states[u]}")
    lines.append("    ],")
    lines.append("    intime: {")
    for k, (year, pairs) in enumerate(intime_pairs.items()):
        sep = "," if k < len(intime_pairs) - 1 else ""
        lines.append(f"      {year}: {js_pairs(pairs)}{sep}")
    lines.append("    },")
    lines.append("    loo: {")
    for k, (name, pairs) in enumerate(loo_pairs.items()):
        sep = "," if k < len(loo_pairs) - 1 else ""
        lines.append(f"      {q(name)}: {js_pairs(pairs)}{sep}")
    lines.append("    }")
    lines.append("  };")
    if gap_overrides:
        lines.append("  // Fits whose gap could not be rebuilt from the weights (guard 2).")
        lines.append("  var GAP_OVERRIDES = {")
        items = list(gap_overrides.items())
        for k, (key, gap) in enumerate(items):
            sep = "," if k < len(items) - 1 else ""
            lines.append(f"    {q(key)}: [" + ", ".join(js_float(v) for v in gap) + "]" + sep)
        lines.append("  };")
    else:
        lines.append("  var GAP_OVERRIDES = {};")
    cuts = ", ".join("null" if c is None else f"{c:g}" for c in cut_values)
    lines += [
        f"  var CUT_STOPS = [{cuts}];",
        f"  var CUT_DEFAULT = {scenarios['cutoff']['default']:g};",
        "  var FAKE_YEARS = [" + ", ".join(str(y) for y in fake_years) + "];",
        f"  var FAKE_DEFAULT = {intime['default']};",
        "  var LOO_ORDER = [" + ", ".join(q(d) for d in dropped) + "];",
        END,
    ]
    return "\n".join(lines) + "\n", fallbacks


def split_target(text: str) -> tuple[str, str, str]:
    """Split the JavaScript file into the text before, inside, and after the block."""
    start = text.find(BEGIN)
    stop = text.find(END)
    if start < 0 or stop < 0 or stop < start:
        fail(f"the markers of the generated block are missing from {TARGET}")
    stop = text.index("\n", stop) + 1
    return text[:start], text[start:stop], text[stop:]


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Write the sc-lab data block.")
    parser.add_argument("--check", action="store_true",
                        help="exit with status 1 when the block is stale; write nothing")
    args = parser.parse_args(argv)

    results = json.loads(RESULTS.read_text(encoding="utf-8"))
    block, fallbacks = build_block(results)
    again, _ = build_block(results)
    if again != block:
        fail("guard 3: two builds of the block differ")
    for item in fallbacks:
        print(f"WARNING: guard 2 fallback, the gap of {item} is embedded")

    text = TARGET.read_text(encoding="utf-8")
    before, current, after = split_target(text)
    size = len(block.encode("utf-8"))
    if args.check:
        if current == block:
            print(f"OK: the data block in {TARGET.relative_to(REPO)} is up to date ({size:,} bytes).")
            return 0
        print(f"STALE: the data block in {TARGET.relative_to(REPO)} differs from "
              f"{RESULTS.name}. Run the generator without the check option.")
        return 1
    if current == block:
        print(f"Unchanged: {TARGET.relative_to(REPO)} already holds this block ({size:,} bytes).")
        return 0
    TARGET.write_text(before + block + after, encoding="utf-8")
    print(f"Wrote the data block to {TARGET.relative_to(REPO)} ({size:,} bytes, "
          f"{len(results['states'])} states, {len(fallbacks)} fallbacks).")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
