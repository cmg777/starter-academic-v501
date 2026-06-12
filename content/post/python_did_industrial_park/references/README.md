# python_did_industrial_park — Quarto project

Executable companion to the blog post:

> **Do Industrial Parks Work? Evaluating Place-Based Policy in Ethiopia with Difference-in-Differences**
> <https://carlos-mendez.org/post/python_did_industrial_park/>

A staggered difference-in-differences evaluation of Ethiopian industrial parks on synthetic, calibrated data: a static TWFE DiD and an event study with `pyfixest`, cross-checked against the Sun-Abraham, Borusyak/Gardner and Callaway-Sant'Anna estimators plus a Goodman-Bacon decomposition with `diff-diff`, survey-weighted repeated-cross-section DiD on DHS household welfare and women's empowerment, and Conley spatial standard errors.

## What's inside

- `render.command` / `render.bat` — one-click wrapper (macOS / Windows). Runs setup and Quarto in order.
- `tutorial.qmd` — the executable Quarto notebook.
- `setup_env.py` — bootstraps a local `.venv/` with pinned packages on first render.
- `_quarto.yml` — wires `setup_env.py` to Quarto's pre-render hook.
- `script.py` — the canonical companion script, kept for reference (regenerates every figure and table at full dpi).
- `data/` — the three synthetic, calibrated CSVs (`industrial_park_district_panel.csv`, `industrial_park_household_rcs.csv`, `industrial_park_individual_rcs.csv`), so the tutorial runs **offline**. The notebook prefers these local copies and falls back to the GitHub raw URL if the folder is missing.
- `README.md` — this file.

## Prerequisites

- Python 3.10–3.13 (any standard install: python.org, Homebrew, miniconda, miniforge).
- A working [Quarto](https://quarto.org/) install.
- [Positron](https://positron.posit.co/) is recommended; any terminal with `quarto` on PATH also works.

## How to use

### One-click (recommended)

1. Extract this ZIP anywhere on your machine.
2. **macOS:** double-click `render.command` in Finder. **Windows:** double-click `render.bat` in Explorer.

The wrapper runs `setup_env.py` (creates a hermetic `.venv/`, installs pinned packages, registers the Jupyter kernel `python_did_industrial_park-tutorial`) and then `quarto render tutorial.qmd`, finally opening `tutorial.html` in your default browser. First run takes ~2–3 minutes (it installs `pyfixest`, `diff-diff`, `numba`/`llvmlite`, and friends); subsequent runs are instant.

### Manual (terminal users)

1. Extract this ZIP anywhere on your machine.
2. Open a terminal *in the extracted `python_did_industrial_park/` folder* and run:

   ```bash
   python3 setup_env.py
   ```

   This creates the `.venv/`, installs pinned packages, and registers a Jupyter kernel named `python_did_industrial_park-tutorial`. The script is idempotent on re-runs.
3. Open the same folder in Positron (`File → Open Folder...`).
4. Open `tutorial.qmd` and click **Render**. (Or, equivalently: `quarto render tutorial.qmd` from the same shell.)

Subsequent renders are instant — step 2 is only needed once per machine.

## Troubleshooting

- **Wrapper refuses to open on macOS (Gatekeeper):** the `render.command` is unsigned, so the first time you double-click it macOS may block it. Right-click → **Open** → confirm in the dialog. After that, double-clicking works normally. As a fallback, run `bash render.command` from a terminal.
- **Auto-relaunch:** if `python3` on your PATH is unsupported (e.g., Python 3.14 with no `numba` wheels, or 3.9 below the package minimum), `setup_env.py` scans your machine for a compatible Python 3.10–3.13 and relaunches itself with it. You'll see a `Note: ... Relaunching setup_env.py with it...` line — that's expected.
- **Windows:** if `python3` is not on PATH, use `python setup_env.py` instead.
- **Kernel not found:** if Render reports `Jupyter kernel 'python_did_industrial_park-tutorial' not found`, you skipped the manual step — run `python3 setup_env.py` in a terminal and try again. The one-click wrapper avoids this entirely.
- **Slow `numba`/`llvmlite` build on macOS Intel:** the pins (`numba==0.62.1`, `llvmlite==0.45.0`) are the last releases that ship prebuilt macOS Intel wheels. If you change them to newer versions on an Intel Mac, pip falls back to a slow source build that needs LLVM headers.
- **"This tutorial needs Python 3.10, 3.11, 3.12, or 3.13":** your `python3` is outside the supported range. Install a working Python (miniforge, python.org, or Homebrew `python@3.13`) and re-run.
- **`ImportError: ... pyexpat.cpython-3XX-darwin.so`:** your Python's `pyexpat` stdlib binding is broken — most often Homebrew `python@3.14` on macOS. Fix by switching to a different Python (`~/miniforge3/envs/<env>/bin/python3 setup_env.py`), installing from python.org, or `brew uninstall python@3.14 && brew install python@3.13`.

## A note on the data

The three CSVs are **synthetic and calibrated for teaching**. They reproduce the *findings* of Huang, Wang & Xu (2026) — the signs, the significance stars, and the approximate magnitudes — not the paper's restricted real inputs. See Section 13 of the tutorial for the full reproduction audit.

## Source

Online tutorial and full post: <https://carlos-mendez.org/post/python_did_industrial_park/>
GitHub repo: <https://github.com/cmg777/starter-academic-v501>
