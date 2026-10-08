#!/usr/bin/env python3
"""Rebuild web_app/data/results.json for the stata_sc post from analysis.log.

The Stata log is the single source of truth for the web app. This script
parses every table that synth2 prints in the four runs of analysis.do. It
also recomputes the 1970–1988 synthetic path, which the log does not print,
from the data and the rounded Stata weights. Each recomputed value is checked
against the log before the JSON file is written.

Usage (from any folder):

    `python build_web_app_data.py`
        Read the data from the quarcs-lab URL and write the JSON file.
    `python build_web_app_data.py --data smoking_sc.dta`
        Read a local copy of the data instead (.dta or .csv).
    `python build_web_app_data.py --log fresh_run.log`
        Parse another copy of the Stata log, such as a fresh run.
    `python build_web_app_data.py --check`
        Exit with status 1 when the JSON file differs from a fresh build.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
LOG_PATH = HERE / "analysis.log"
OUT_PATH = HERE / "web_app" / "data" / "results.json"
DATA_URL = "https://github.com/quarcs-lab/data-open/raw/master/isds/smoking_sc.dta"

TREATED = "California"
FIRST_YEAR, TREAT_YEAR, LAST_YEAR = 1970, 1989, 2000
FAKE_YEAR = 1985
CUTOFF = 2
# Stata prints four decimals, so a recomputed value may differ from the log
# by at most half a unit in the fourth decimal.
TOL_4DP = 5.0001e-5

NUM = r"-?\d*\.?\d+(?:[eE][-+]?\d+)?"
CHECKS: list[str] = []


# ---------------------------------------------------------------------------
# Small helpers
# ---------------------------------------------------------------------------
def check(name: str, value: float, ref: float, tol: float) -> None:
    """Raise an error when a value is not within tol of its reference."""
    if not abs(float(value) - float(ref)) <= tol:
        raise AssertionError(f"{name}: got {value!r}, expected {ref!r} (tol {tol})")
    CHECKS.append(name)


def require(name: str, condition: bool) -> None:
    """Raise an error when a logical condition fails."""
    if not condition:
        raise AssertionError(f"{name}: condition failed")
    CHECKS.append(name)


def cols(k: int) -> str:
    """Regular expression for k numeric columns separated by spaces."""
    return r"\s+".join([f"({NUM})"] * k)


def r4(x: float) -> float:
    """Round to four decimals, the precision of the Stata tables."""
    return float(round(float(x), 4))


# ---------------------------------------------------------------------------
# Reading the log
# ---------------------------------------------------------------------------
def read_log(path: Path) -> list[str]:
    """Return the log lines with the Stata line wraps undone.

    Stata breaks every line longer than the line size and starts the rest
    with "> ". Joining those pieces restores numbers such as 1989 and
    1.75567 that the wrap splits in two.
    """
    lines: list[str] = []
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if lines and (raw.startswith("> ") or raw == ">"):
            lines[-1] += raw[2:]
        else:
            lines.append(raw)
    if not any(re.match(r"^\s*closed on:", ln) for ln in lines[-12:]):
        raise SystemExit(
            "analysis.log has no closing line. Wait until Stata finishes, then rerun."
        )
    return lines


def find(lines: list[str], pattern: str, start: int = 0) -> int:
    """Index of the first line at or after start that matches pattern."""
    rx = re.compile(pattern)
    for i in range(start, len(lines)):
        if rx.search(lines[i]):
            return i
    raise ValueError(f"Pattern not found in analysis.log: {pattern}")


def table_rows(lines: list[str], start: int, row_pattern: str) -> list[tuple[str, ...]]:
    """Rows that match row_pattern in the first table after line start."""
    rx = re.compile(row_pattern)
    rows: list[tuple[str, ...]] = []
    for ln in lines[start + 1:]:
        m = rx.match(ln)
        if m:
            rows.append(m.groups())
        elif rows and ln.strip():
            break
    return rows


def note_text(lines: list[str], start: int) -> str:
    """Join a multi-line Stata note that ends at the next blank line."""
    parts: list[str] = []
    for ln in lines[start:]:
        if not ln.strip():
            break
        parts.append(ln.strip())
    return " ".join(parts)


def split_runs(lines: list[str]) -> dict[str, list[str]]:
    """Cut the log into the four synth2 runs and label each one.

    Each segment starts at the echo of a synth2 command and ends at the next
    one. The options of the command identify the run.
    """
    starts = [i for i, ln in enumerate(lines) if ln.startswith(". synth2 ")]
    runs: dict[str, list[str]] = {}
    for k, i in enumerate(starts):
        j = starts[k + 1] if k + 1 < len(starts) else len(lines)
        cmd = lines[i][2:]
        if "placebo(unit" in cmd:
            key = "placebo"
        elif "placebo(period(" in cmd:
            key = "intime"
        elif re.search(r"\bloo\b", cmd):
            key = "loo"
        else:
            key = "baseline"
        if key in runs:
            raise ValueError(f"Two synth2 runs of the same type: {key}")
        runs[key] = lines[i:j]
    missing = {"baseline", "placebo", "intime", "loo"} - set(runs)
    if missing:
        raise ValueError(f"Missing synth2 runs in analysis.log: {sorted(missing)}")
    return runs


# ---------------------------------------------------------------------------
# Parsers for the tables that synth2 prints
# ---------------------------------------------------------------------------
def parse_fit(seg: list[str]) -> dict:
    """Header of the fit: treated unit, year, donors, RMSE, and R-squared."""
    text = "\n".join(seg[: find(seg, r"^Covariate balance in the pretreatment periods:")])
    m1 = re.search(r"Treated Unit\s*:\s*(\S+)\s+Treatment Time\s*:\s*(\d{4})", text)
    m2 = re.search(rf"Number of Control Units\s*=\s*(\d+)\s+Root Mean Squared Error\s*=\s*({NUM})", text)
    m3 = re.search(rf"Number of Covariates\s*=\s*(\d+)\s+R-squared\s*=\s*({NUM})", text)
    if not (m1 and m2 and m3):
        raise ValueError("Could not parse the fit header of a synth2 run.")
    return {
        "treated_unit": m1.group(1),
        "treatment_year": int(m1.group(2)),
        "n_donors": int(m2.group(1)),
        "rmse_pre": float(m2.group(2)),
        "n_covariates": int(m3.group(1)),
        "r2_pre": float(m3.group(2)),
    }


def parse_balance(seg: list[str]) -> list[dict]:
    """Covariate balance table: V-weight, treated, synthetic, and average."""
    i = find(seg, r"^Covariate balance in the pretreatment periods:")
    pattern = rf"^\s*(\S+)\s*\|\s*({NUM})\s+({NUM})\s+({NUM})\s+({NUM})%\s+({NUM})\s+({NUM})%\s*$"
    rows = table_rows(seg, i, pattern)
    if not rows:
        raise ValueError("Empty covariate balance table.")
    return [
        {
            "predictor": r[0],
            "v_weight": float(r[1]),
            "treated": float(r[2]),
            "synthetic": float(r[3]),
            "bias_synthetic_pct": float(r[4]),
            "sample_mean": float(r[5]),
            "bias_sample_pct": float(r[6]),
        }
        for r in rows
    ]


def parse_unit_weights(seg: list[str]) -> tuple[dict[str, float], list[str]]:
    """Positive unit weights and the list of donors with a weight of zero."""
    i = find(seg, r"^Optimal Unit Weights:")
    rows = table_rows(seg, i, rf"^\s*(\S+)\s*\|\s*({NUM})\s*$")
    weights = {name: float(w) for name, w in rows}
    j = find(seg, r"^Note: The unit ", i)
    parts: list[str] = []
    for ln in seg[j:]:
        parts.append(ln.strip())
        if "weight of 0." in ln:
            break
    m = re.search(r"^Note: The unit (.+?) in the donor pool get a weight of 0\.", " ".join(parts))
    if not m:
        raise ValueError("Could not parse the list of donors with zero weight.")
    return weights, m.group(1).split()


def parse_prediction(seg: list[str], header: str) -> tuple[list[tuple[int, float, float, float]], float]:
    """Year rows (actual, synthetic, effect) of a prediction table and its ATT."""
    i = find(seg, header)
    rows = table_rows(seg, i, rf"^\s*(\d{{4}})\s*\|\s*{cols(3)}\s*$")
    n = find(seg, r"^Note: The average treatment effect over the posttreatment period is", i)
    m = re.search(rf"period is ({NUM})\.\s*$", seg[n])
    if not (rows and m):
        raise ValueError(f"Could not parse the prediction table after: {header}")
    out = [(int(y), float(a), float(s), float(e)) for y, a, s, e in rows]
    return out, float(m.group(1))


def parse_ereturn(lines: list[str]) -> dict[str, float]:
    """Scalars of the ereturn list that follows the baseline run."""
    i = find(lines, r"^\. ereturn list\s*$")
    scalars: dict[str, float] = {}
    for ln in lines[i + 1:]:
        m = re.match(rf"^\s*e\((\w+)\)\s*=\s*({NUM})\s*$", ln)
        if m:
            scalars[m.group(1)] = float(m.group(2))
        elif ln.strip().startswith("macros:"):
            break
    return scalars


def parse_matrix(lines: list[str], name: str) -> tuple[list[str], dict[str, list[float]]]:
    """Columns and rows of a matrix list output, with column blocks merged.

    Stata prints wide matrices in several column blocks, one below the
    other. Each block repeats the row labels, so the values are appended
    to the row with the same label.
    """
    i = find(lines, rf"^\. matrix list {re.escape(name)}\s*$")
    j = find(lines, rf"^{re.escape(name)}\[(\d+),(\d+)\]", i)
    n_rows, n_cols = map(int, re.match(rf"^{re.escape(name)}\[(\d+),(\d+)\]", lines[j]).groups())
    columns: list[str] = []
    rows: dict[str, list[float]] = {}
    for ln in lines[j + 1:]:
        if re.match(r"^\.(\s|$)", ln):
            break
        toks = ln.split()
        if not toks:
            continue
        if len(toks) > 1 and all(re.fullmatch(NUM, t) for t in toks[1:]):
            rows.setdefault(toks[0], []).extend(float(t) for t in toks[1:])
        else:
            columns.extend(toks)
    require(f"{name} has {n_cols} columns", len(columns) == n_cols)
    require(f"{name} has {n_rows} rows", len(rows) == n_rows)
    require(f"{name} rows are complete", all(len(v) == n_cols for v in rows.values()))
    return columns, rows


# ---------------------------------------------------------------------------
# Data
# ---------------------------------------------------------------------------
def load_outcome(source: str) -> pd.DataFrame:
    """Cigarette sales as a year by state table, stored as in Stata.

    The .dta file stores cigsale as a 4-byte float. Casting through float32
    keeps a CSV copy on the same values that Stata used.
    """
    if source.endswith(".csv"):
        raw = pd.read_csv(source)
    else:
        raw = pd.read_stata(source)
    df = pd.DataFrame({
        "state": raw["state"].astype(str),
        "year": raw["year"].astype(int),
        "cigsale": raw["cigsale"].astype(np.float32).astype(np.float64),
    })
    wide = df.pivot(index="year", columns="state", values="cigsale")
    require("panel has 31 years", list(wide.index) == list(range(FIRST_YEAR, LAST_YEAR + 1)))
    require("panel has 39 states", wide.shape[1] == 39)
    require("panel has no missing outcome", not wide.isna().any().any())
    return wide


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
def build(data_source: str, log_path: Path = LOG_PATH) -> dict:
    lines = read_log(log_path)
    runs = split_runs(lines)
    Y = load_outcome(data_source)
    # The log writes state names without spaces, for example NewHampshire.
    name = {s.replace(" ", ""): s for s in Y.columns}

    def nice(log_name: str) -> str:
        if log_name not in name:
            raise ValueError(f"Unknown state in analysis.log: {log_name}")
        return name[log_name]

    # ---- Baseline run (nested allopt) -------------------------------------
    base = runs["baseline"]
    fit = parse_fit(base)
    require("baseline treated unit", fit["treated_unit"] == TREATED)
    require("baseline treatment year", fit["treatment_year"] == TREAT_YEAR)
    require("baseline has 38 donors", fit["n_donors"] == 38)
    bal_table = parse_balance(base)
    w_table, zero_units = parse_unit_weights(base)
    post_rows, att_base = parse_prediction(base, r"^Prediction results in the posttreatment periods:")
    require("baseline post table has 12 years",
            [r[0] for r in post_rows] == list(range(TREAT_YEAR, LAST_YEAR + 1)))

    es = parse_ereturn(base)
    for key, ref in {"N": 1209, "T": 31, "T0": 19, "T1": 12, "K": 7, "J": 39}.items():
        check(f"e({key})", es[key], ref, 0)
    check("e(rmse) matches the fit header", es["rmse"], fit["rmse_pre"], 5.0001e-6)
    check("e(r2) matches the fit header", es["r2"], fit["r2_pre"], 5.0001e-6)
    check("e(att) matches the ATT note", es["att"], att_base, TOL_4DP)

    xcols, xrows = parse_matrix(base, "X_balance")
    prefixes = ["Vweight", "Treated", "ValueSynth", "BiasSynth", "ValueAvera", "BiasAvera"]
    require("X_balance column order",
            all(c.split("~")[0].startswith(p) or p.startswith(c.split("~")[0])
                for c, p in zip(xcols, prefixes)))
    _, wrows = parse_matrix(base, "W_weights")
    W = {u: v[0] for u, v in wrows.items()}

    # The full-precision matrix must agree with the printed balance table.
    require("balance rows agree", [b["predictor"] for b in bal_table] == list(xrows))
    for b in bal_table:
        x = xrows[b["predictor"]]
        for k, key in enumerate(["v_weight", "treated", "synthetic"]):
            check(f"X_balance {b['predictor']} {key}", x[k], b[key], TOL_4DP)
        check(f"X_balance {b['predictor']} sample_mean", x[4], b["sample_mean"], TOL_4DP)
        check(f"X_balance {b['predictor']} bias_synthetic_pct", x[3], b["bias_synthetic_pct"], 0.0050001)
        check(f"X_balance {b['predictor']} bias_sample_pct", x[5], b["bias_sample_pct"], 0.0050001)
    require("W_weights match the unit weight table", W == w_table)
    check("W sums to one", sum(W.values()), 1.0, 1e-9)

    donors = sorted(nice(u) for u in list(W) + zero_units)
    require("38 donors, all distinct", len(donors) == 38 and len(set(donors)) == 38)
    require("donors are the 38 states other than California",
            set(donors) == set(Y.columns) - {TREATED})

    # ---- Recompute the synthetic path with the rounded Stata weights ------
    synth = sum(w * Y[nice(u)] for u, w in W.items())
    actual = Y[TREATED]
    check("synthetic 1970 equals 117.1247", r4(synth[1970]), 117.1247, 1e-9)
    for year, ref in ((1975, 127.1112), (1980, 120.5017), (1988, 91.6677)):
        check(f"synthetic {year} equals {ref}", synth[year], ref, TOL_4DP)
        label = f"cigsale({year})"
        check(f"synthetic {year} equals X_balance", synth[year], xrows[label][2], TOL_4DP)
    for year, a, s, e in post_rows:
        check(f"actual {year} matches the log", actual[year], a, TOL_4DP)
        check(f"synthetic {year} matches the log", synth[year], s, TOL_4DP)
        check(f"gap {year} matches the log", actual[year] - synth[year], e, 2 * TOL_4DP)
    gap = actual - synth
    pre = gap.loc[FIRST_YEAR:TREAT_YEAR - 1]
    post = gap.loc[TREAT_YEAR:LAST_YEAR]
    check("recomputed ATT matches e(att)", post.mean(), es["att"], 1e-5)
    # synth2 divides the residual sum of squares by the variation of the
    # synthetic series; the conventional R-squared divides by the variation
    # of the treated series.
    syn_pre = synth.loc[FIRST_YEAR:TREAT_YEAR - 1]
    act_pre = actual.loc[FIRST_YEAR:TREAT_YEAR - 1]
    r2_synth2 = 1 - (pre ** 2).sum() / ((syn_pre - syn_pre.mean()) ** 2).sum()
    r2_conventional = 1 - (pre ** 2).sum() / ((act_pre - act_pre.mean()) ** 2).sum()
    check("synth2 R-squared formula reproduces e(r2)", r2_synth2, es["r2"], 1e-6)
    max_pre_year = int(pre.abs().idxmax())

    post_log = {y: (a, s, e) for y, a, s, e in post_rows}
    gap_series = []
    for year in range(FIRST_YEAR, LAST_YEAR + 1):
        if year >= TREAT_YEAR:
            a, s, e = post_log[year]
            gap_series.append({"year": year, "actual": a, "synthetic": s, "gap": e,
                               "period": "post", "source": "log"})
        else:
            gap_series.append({"year": year, "actual": r4(actual[year]), "synthetic": r4(synth[year]),
                               "gap": r4(gap[year]), "period": "pre", "source": "recomputed"})

    peak = min((r for r in gap_series if r["period"] == "post"), key=lambda r: r["gap"])
    syn_post_mean = float(np.mean([post_log[y][1] for y in post_log]))

    # ---- In-space placebo run ---------------------------------------------
    pbo = runs["placebo"]
    fit_p = parse_fit(pbo)
    bal_p = parse_balance(pbo)
    w_p, _ = parse_unit_weights(pbo)
    post_p, att_p = parse_prediction(pbo, r"^Prediction results in the posttreatment periods:")
    i = find(pbo, r"^In-space placebo test results using fake treatment units:")
    prow = table_rows(pbo, i, rf"^\s*(\S+)\s*\|\s*{cols(4)}\s*$")
    require("placebo table has 39 rows", len(prow) == 39)
    notes = note_text(pbo, find(pbo, r"^Note: \(1\) Using all control units", i))
    m1 = re.search(rf"Using all control units, the probability .*? is ({NUM})\.", notes)
    m2 = re.search(rf"MSPE ({NUM}) times larger than the treated unit, the probability .*? is ({NUM})\.", notes)
    m4 = re.search(rf"There are total (\d+) units with pretreatment MSPE {NUM} times larger than the treated unit, including (.+?)\.(?:\s|$)", notes)
    if not (m1 and m2 and m4):
        raise ValueError("Could not parse the notes of the placebo table.")
    p_full_log, cut_log, p_trim_log = float(m1.group(1)), float(m2.group(1)), float(m2.group(2))
    n_excl_log, excl_log = int(m4.group(1)), [nice(u) for u in m4.group(2).split()]
    check("cutoff equals 2", cut_log, CUTOFF, 0)

    placebos = []
    for unit, pre_m, post_m, ratio, rel in prow:
        placebos.append({"region": nice(unit), "pre_mspe": float(pre_m), "post_mspe": float(post_m),
                         "ratio": float(ratio), "pre_mspe_rel": float(rel),
                         "retained": float(rel) <= CUTOFF})
    kept = [p for p in placebos if p["retained"]]
    for p in placebos:
        p["rank"] = 1 + sum(q["ratio"] > p["ratio"] for q in placebos)
        p["rank_trimmed"] = (1 + sum(q["ratio"] > p["ratio"] for q in kept)) if p["retained"] else None
    placebos.sort(key=lambda p: (p["rank"], p["region"]))
    ca = next(p for p in placebos if p["region"] == TREATED)
    require("excluded units match the log note",
            sorted(p["region"] for p in placebos if not p["retained"]) == sorted(excl_log))
    require("19 units excluded", n_excl_log == 19 == len(placebos) - len(kept))
    require("20 units retained", len(kept) == 20)
    check("full p-value equals rank over N", ca["rank"] / len(placebos), p_full_log, TOL_4DP)
    check("trimmed p-value equals rank over N", ca["rank_trimmed"] / len(kept), p_trim_log, TOL_4DP)
    check("placebo pre-MSPE of California equals the squared re-fit RMSE",
          fit_p["rmse_pre"] ** 2, ca["pre_mspe"], 1e-3)

    j = find(pbo, rf"^In-space placebo test results using fake treatment units \(continued, cutoff = {NUM}\):", i)
    pw = table_rows(pbo, j, rf"^\s*(\d{{4}})\s*\|\s*{cols(4)}\s*$")
    require("pointwise table has 12 rows", [int(r[0]) for r in pw] == list(range(TREAT_YEAR, LAST_YEAR + 1)))
    pointwise = []
    for (year, eff, p2, pr, pl), (_, _, _, e_refit) in zip(pw, post_p):
        check(f"pointwise effect {year} equals the re-fit", float(eff), e_refit, 1e-9)
        pointwise.append({"year": int(year), "effect": float(eff), "p_two_sided": float(p2),
                          "p_right": float(pr), "p_left": float(pl)})

    # ---- In-time placebo run ----------------------------------------------
    itm = runs["intime"]
    fit_r = parse_fit(itm)
    require("reduced specification uses the real year 1989", fit_r["treatment_year"] == TREAT_YEAR)
    bal_r = parse_balance(itm)
    w_r, _ = parse_unit_weights(itm)
    post_r, att_r = parse_prediction(itm, r"^Prediction results in the posttreatment periods:")
    it_rows, att_it = parse_prediction(itm, rf"^In-time placebo test results using fake treatment time {FAKE_YEAR}:")
    require("in-time table covers 1985–2000",
            [r[0] for r in it_rows] == list(range(FAKE_YEAR, LAST_YEAR + 1)))
    intime = []
    for year, a, s, e in it_rows:
        check(f"in-time actual {year} matches the data", actual[year], a, TOL_4DP)
        intime.append({"year": year, "actual": a, "synthetic": s, "gap": e,
                       "window": "fake" if year < TREAT_YEAR else "real"})
    fake_mean = float(np.mean([r["gap"] for r in intime if r["window"] == "fake"]))
    real_mean = float(np.mean([r["gap"] for r in intime if r["window"] == "real"]))

    # ---- Leave-one-out run -------------------------------------------------
    loo = runs["loo"]
    fit_l = parse_fit(loo)
    bal_l = parse_balance(loo)
    w_l, _ = parse_unit_weights(loo)
    post_l, att_l = parse_prediction(loo, r"^Prediction results in the posttreatment periods:")
    k = find(loo, r"^Implementing leave-one-out robustness test that excludes one control unit with a nonzero weight")
    dropped = [nice(u.strip()) for u in re.split(r"\.\.\.", loo[k].split("nonzero weight", 1)[1]) if u.strip()]
    require("leave-one-out drops the five positive donors",
            sorted(dropped) == sorted(nice(u) for u in w_l))
    k1 = find(loo, r"^Leave-one-out robustness test results in the posttreatment period:", k)
    t1 = table_rows(loo, k1, rf"^\s*(\d{{4}})\s*\|\s*{cols(4)}\s*$")
    k2 = find(loo, r"Treatment Effect \(LOO\)", k1)
    t2 = table_rows(loo, k2, rf"^\s*(\d{{4}})\s*\|\s*{cols(3)}\s*$")
    years = list(range(TREAT_YEAR, LAST_YEAR + 1))
    require("leave-one-out tables cover 1989–2000",
            [int(r[0]) for r in t1] == years and [int(r[0]) for r in t2] == years)
    loo_series = []
    for (year, a, s, smin, smax), (_, e, emin, emax), (_, a_r, s_r, e_r) in zip(t1, t2, post_l):
        a, s, smin, smax, e, emin, emax = map(float, (a, s, smin, smax, e, emin, emax))
        check(f"leave-one-out synthetic {year} equals the re-fit", s, s_r, 1e-9)
        check(f"leave-one-out effect {year} equals the re-fit", e, e_r, 1e-9)
        require(f"leave-one-out bounds bracket the re-fit in {year}", smin <= s <= smax and emin <= e <= emax)
        loo_series.append({"year": int(year), "actual": a, "synthetic_refit": s,
                           "synthetic_min": smin, "synthetic_max": smax,
                           "effect_refit": e, "effect_min": emin, "effect_max": emax})

    # ---- V-weights across runs ---------------------------------------------
    v_p = {b["predictor"]: b["v_weight"] for b in bal_p}
    v_l = {b["predictor"]: b["v_weight"] for b in bal_l}
    v_r = {b["predictor"]: b["v_weight"] for b in bal_r}
    v_weights = [{"predictor": p, "weight": xrows[p][0], "placebo_refit": v_p.get(p),
                  "loo_refit": v_l.get(p), "reduced_spec": v_r.get(p)} for p in xrows]
    check("baseline V sums to one", sum(v["weight"] for v in v_weights), 1.0, 1e-6)

    def weight_list(w: dict[str, float]) -> list[dict]:
        return [{"region": nice(u), "weight": v} for u, v in sorted(w.items(), key=lambda kv: (-kv[1], kv[0]))]

    donor_weights = [{"region": d, "weight": W.get(d.replace(" ", ""), 0.0)} for d in donors]
    donor_weights.sort(key=lambda d: (-d["weight"], d["region"]))

    predictor_balance = []
    for p, x in xrows.items():
        predictor_balance.append({"predictor": p, "v_weight": x[0], "treated": x[1], "synthetic": x[2],
                                  "bias_synthetic_pct": x[3], "sample_mean": x[4], "bias_sample_pct": x[5]})

    headline = {
        "treated_unit": TREATED,
        "treatment_year": TREAT_YEAR,
        "pre_window": [FIRST_YEAR, TREAT_YEAR - 1],
        "post_window": [TREAT_YEAR, LAST_YEAR],
        "n_donors": len(donors),
        "n_donors_positive": len(W),
        "att_avg": att_base,
        "att_peak_year": peak["year"],
        "att_peak_value": peak["gap"],
        "gap_2000": post_log[LAST_YEAR][2],
        "pct_gap_2000": float(round(100 * post_log[LAST_YEAR][2] / post_log[LAST_YEAR][1], 2)),
        "pct_gap_avg": float(round(100 * att_base / syn_post_mean, 2)),
        "rmse_pre": float(round(es["rmse"], 6)),
        "r2_pre": float(round(es["r2"], 6)),
        "r2_pre_definition": "synth2 divides by the variation of the synthetic series",
        "r2_pre_conventional": r4(r2_conventional),
        "max_pre_gap": {"year": max_pre_year, "gap": r4(gap[max_pre_year])},
        "pre_mspe": ca["pre_mspe"],
        "post_mspe": ca["post_mspe"],
        "ratio": ca["ratio"],
        "mspe_source": "Placebo re-fit of California (nested sigf(6) without allopt), not the baseline fit",
        "placebo_refit": {"rmse_pre": fit_p["rmse_pre"], "r2_pre": fit_p["r2_pre"], "att": att_p},
        "rank_full": ca["rank"],
        "rank_full_n": len(placebos),
        "p_full": r4(ca["rank"] / len(placebos)),
        "rank_trimmed": ca["rank_trimmed"],
        "rank_trimmed_n": len(kept),
        "p_trimmed": r4(ca["rank_trimmed"] / len(kept)),
        "cutoff": CUTOFF,
        "n_excluded": len(placebos) - len(kept),
        "runner_up": {"region": placebos[1]["region"], "ratio": placebos[1]["ratio"]},
    }

    meta = {
        "title": "Proposition 99 and cigarette sales in California: synthetic control results from Stata",
        "post": "/post/stata_sc/",
        "generator": "build_web_app_data.py",
        "source_log": "analysis.log",
        "data_url": DATA_URL,
        "outcome": "cigsale",
        "outcome_label": "Cigarette sales in packs per capita",
        "treated_unit": TREATED,
        "n_states": int(es["J"]),
        "n_donors": len(donors),
        "n_years": int(es["T"]),
        "n_obs": int(es["N"]),
        "years": [FIRST_YEAR, LAST_YEAR],
        "predictors": list(xrows),
        "notes": [
            "Every value except the 1970–1988 synthetic path comes from analysis.log, at the precision that Stata prints.",
            "The log prints no synthetic values for 1970–1988. The generator recomputes them from the data with the rounded Stata weights and checks them against the log.",
            "The headline MSPE values and the ratio of 123.549 come from the placebo re-fit of California. That run uses sigf(6) without allopt, so its fit differs slightly from the baseline.",
            "The in-time run first prints a reduced specification estimated with the real year 1989. Its fit statistics describe that specification, not the model with the fake year 1985.",
            "The leave-one-out run re-fits the baseline before it drops each donor with positive weight. The series labeled refit come from that re-fit, not from the baseline fit.",
        ],
        "runs": {
            "baseline": {
                "label": "Baseline fit (nested allopt)",
                "rmse_pre": fit["rmse_pre"], "r2_pre": fit["r2_pre"], "att": att_base,
                "n_covariates": fit["n_covariates"], "weights": weight_list(W),
            },
            "placebo_refit": {
                "label": "Re-fit of California inside the in-space placebo run (nested sigf(6) without allopt)",
                "rmse_pre": fit_p["rmse_pre"], "r2_pre": fit_p["r2_pre"], "att": att_p,
                "n_covariates": fit_p["n_covariates"], "weights": weight_list(w_p),
            },
            "reduced_spec": {
                "label": "Reduced specification estimated with the real year 1989 (six predictors, covariate window 1980–1984), printed by the in-time placebo run",
                "rmse_pre": fit_r["rmse_pre"], "r2_pre": fit_r["r2_pre"], "att": att_r,
                "n_covariates": fit_r["n_covariates"], "weights": weight_list(w_r),
                "post": [{"year": y, "actual": a, "synthetic": s, "gap": e} for y, a, s, e in post_r],
            },
            "intime_1985": {
                "label": "In-time placebo with the fake treatment year 1985",
                "fake_year": FAKE_YEAR,
                "att_1985_2000": att_it,
                "mean_gap_1985_1988": r4(fake_mean),
                "mean_gap_1989_2000": r4(real_mean),
            },
            "loo_refit": {
                "label": "Re-fit of California inside the leave-one-out run (nested without allopt)",
                "rmse_pre": fit_l["rmse_pre"], "r2_pre": fit_l["r2_pre"], "att": att_l,
                "n_covariates": fit_l["n_covariates"], "weights": weight_list(w_l),
                "dropped_units": dropped,
            },
        },
    }

    return {
        "meta": meta,
        "headline": headline,
        "donor_weights": donor_weights,
        "predictor_balance": predictor_balance,
        "v_weights": v_weights,
        "gap_series": gap_series,
        "placebos": placebos,
        "pointwise_p": pointwise,
        "intime_placebo": intime,
        "loo_series": loo_series,
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Rebuild web_app/data/results.json from analysis.log.")
    ap.add_argument("--data", default=DATA_URL, help="Path or URL of smoking_sc (.dta or .csv).")
    ap.add_argument("--log", default=str(LOG_PATH), help="Path of the Stata log (default: analysis.log).")
    ap.add_argument("--check", action="store_true", help="Fail when the JSON file is stale.")
    args = ap.parse_args(argv)

    payload = build(args.data, Path(args.log))
    text = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    if args.check:
        current = OUT_PATH.read_text(encoding="utf-8") if OUT_PATH.exists() else ""
        if current != text:
            print("results.json is stale. Run build_web_app_data.py to refresh it.")
            return 1
        print(f"results.json is up to date ({len(CHECKS)} checks passed).")
        return 0
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(text, encoding="utf-8")
    h = payload["headline"]
    print(f"{len(CHECKS)} checks passed.")
    print(f"ATT {h['att_avg']}, RMSE {h['rmse_pre']}, ratio {h['ratio']}, "
          f"p {h['p_full']} (full) and {h['p_trimmed']} (trimmed).")
    print(f"First synthetic value: {payload['gap_series'][0]['synthetic']} in {payload['gap_series'][0]['year']}.")
    print(f"Wrote {OUT_PATH.relative_to(HERE)}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
