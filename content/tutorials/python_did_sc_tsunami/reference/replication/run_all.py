#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_all.py  —  run the entire replication suite in order
========================================================
Executes scripts 01 → 05, each in its own process (so one failure cannot
corrupt another's state), then reports the artifacts written to tables/ and
figures/.

    python run_all.py            # from inside the replication/ folder
    ../.venv/bin/python run_all.py

The suite reproduces every table and figure of Heger & Neumayer (2019) from the
synthetic dataset one directory up.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

# Pedagogical order: build the intuition first, then the formal tables, then the
# synthetic-control figures.
SCRIPTS = [
    ("01_did_intuition.py",      "DiD intuition (diff-diff): 2x2 + event study"),
    ("02_did_tables_gdp.py",     "GDP DiD tables 2,5,6,7,8,9 (pyfixest)"),
    ("03_nightlights_tables.py", "Night-lights tables 1,3,4 (pyfixest)"),
    ("04_synthetic_control.py",  "Figures 2-3: GDP dynamics + synthetic control (mlsynth)"),
    ("05_structural_change.py",  "Figures 4-7: structural change (mlsynth)"),
    ("06_spatial_standard_errors.py", "Spatial autocorrelation & Conley SEs (map + Moran's I)"),
]


def main() -> None:
    print("#" * 78)
    print("# REPLICATION SUITE — Heger & Neumayer (2019), Aceh tsunami")
    print("#" * 78)

    failures: list[str] = []
    for script, blurb in SCRIPTS:
        print(f"\n{'#' * 78}\n# RUNNING  {script}   —   {blurb}\n{'#' * 78}")
        result = subprocess.run([sys.executable, str(HERE / script)])
        if result.returncode != 0:
            failures.append(script)
            print(f"!! {script} exited with code {result.returncode}")

    tables = sorted((HERE / "tables").glob("*"))
    figures = sorted((HERE / "figures").glob("*"))
    print("\n" + "#" * 78)
    print(f"# DONE — {len(tables)} files in tables/, {len(figures)} figures in figures/")
    print("#" * 78)
    print("tables/ :", ", ".join(p.name for p in tables))
    print("figures/:", ", ".join(p.name for p in figures))

    if failures:
        print("\nFAILED scripts:", ", ".join(failures))
        sys.exit(1)
    print("\nAll scripts completed successfully.")


if __name__ == "__main__":
    main()
