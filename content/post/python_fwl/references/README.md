# python_fwl — Quarto project

Executable companion to the blog post:

> **The FWL Theorem: Making Multivariate Regressions Intuitive**
> <https://carlos-mendez.org/post/python_fwl/>

The notebook reproduces every number in the post from the same 50 simulated fast-food restaurants (seed 42; January): the naive slope of −0.1059, the controlled slope of +0.2673, the omitted-variable-bias identity 0.3836 × (−0.9730) = −0.3732, the FWL steps and their standard errors, the figures, the solutions to all eight exercises, and the panel-data appendix (January + June). The interactive lab of section 16 runs only in the browser; the notebook links to it.

## What's inside

| File | What it is |
|---|---|
| `render.command` / `render.bat` | One-click wrapper (macOS / Windows). Runs `setup_env.py`, then `quarto render`, then opens the result. |
| `tutorial.qmd` | The executable Quarto notebook: the full post, with every code cell run by Quarto. |
| `setup_env.py` | Builds a local `.venv/` with the pinned packages and registers the Jupyter kernel `python_fwl-tutorial`. |
| `_quarto.yml` | Wires `setup_env.py` to Quarto's pre-render hook. |
| `README.md` | This file. |
| `fwl_store_data.csv` | The 50 restaurants used in the post, January (columns `sales` = monthly sales in thousands of dollars, `coupons` = redemption rate in % of the 100 coupons handed out, `income`, `dayofweek`). The notebook loads it and checks that it is identical to `simulate_store_data(seed=42)`; without it, the notebook simulates the same data. |
| `fwl_restaurant_panel.csv` | The January + June panel of the appendix: 100 rows, `restaurant_id` (1–50), `period` (1 = January, 2 = June), `sales`, `coupons`, `income`, `dayofweek`. Its January rows equal `fwl_store_data.csv`. The notebook simulates it with `simulate_restaurant_panel()`; the CSV is for use in other software. |
| `script.py` | The canonical script that produced the post's numbers and dark-theme figures. It also runs from this folder: it rewrites `fwl_results.json`, the five figures, `data/fwl_store_data.csv` (the same data as the CSV above), `data/fwl_restaurant_panel.csv` and the two interactive panel plots in `panel_plots/` (it needs expdpy). The web app's `results.json` is written only when the post's `web_app/data/` folder exists, so that step is skipped here. |
| `cheatsheet_python.py` | A one-page Python cheat sheet: FWL, the OVB identity and the standard-error checks on the same CSV. Standalone; its header lists the packages it needs. |
| `cheatsheet_R.R` | The R port of the cheat sheet (same sections, same comparison table). |
| `cheatsheet_stata.do` | The Stata port of the cheat sheet. |
| `analysis.do` | The full Stata port of `script.py`, section by section, with every identity checked by `assert`. |

The cheat sheets and `analysis.do` read `fwl_store_data.csv` from this folder, and fall back to the copy on GitHub if it is missing.

## Prerequisites

- **Python 3.10, 3.11, 3.12 or 3.13** (any standard install: python.org, Homebrew, miniconda, miniforge). Every pinned package ships a prebuilt wheel for all four versions on macOS (Intel and Apple Silicon), Windows and Linux. Python 3.14 is not supported, because numpy 2.2 has no wheel for it; if `python3` points at 3.14, `setup_env.py` looks for a supported Python on your machine and relaunches itself with it.
- A working [Quarto](https://quarto.org/) install (1.4 or newer).
- [Positron](https://positron.posit.co/) is recommended; any terminal with `quarto` on PATH also works.
- An internet connection for the first run only (to install the packages).

Pinned packages (installed into `.venv/`, not into your system Python): numpy 2.2.6, pandas 2.3.3, matplotlib 3.10.8, seaborn 0.13.2, statsmodels 0.14.6, wooldridge 0.5.0 (the `wage2` data for Exercise 8), jupyter 1.1.1 and ipykernel 7.2.0. Optional: expdpy 0.5.2, which brings pyfixest and provides `analyze_fwl_plot` for the panel-data appendix. pyfixest ships no macOS wheel for Python 3.10, so on a Mac with Python 3.10 `setup_env.py` warns and the appendix skips its `analyze_fwl_plot` lines; the statsmodels routes still run. Use Python 3.11+ on macOS to run everything.

## How to render

### One-click (recommended)

1. Extract this ZIP anywhere on your machine.
2. **macOS:** double-click `render.command` in Finder. **Windows:** double-click `render.bat` in Explorer.

The wrapper runs `setup_env.py` (creates a hermetic `.venv/`, installs the pinned packages, registers the Jupyter kernel `python_fwl-tutorial`) and then `quarto render tutorial.qmd`, finally opening `tutorial.html` in your default browser. The first run takes about two minutes; later runs take seconds.

### Manual (terminal users)

1. Extract this ZIP anywhere on your machine.
2. Open a terminal *in the extracted `python_fwl/` folder* and run:

   ```bash
   python3 setup_env.py
   ```

   This creates the `.venv/`, installs the pinned packages, and registers a Jupyter kernel named `python_fwl-tutorial`. The script is idempotent: re-running it is a fast no-op.
3. Render, either from the same shell:

   ```bash
   export QUARTO_PYTHON="$PWD/.venv/bin/python"     # Windows: set "QUARTO_PYTHON=%CD%\.venv\Scripts\python.exe"
   quarto render tutorial.qmd
   ```

   or by opening the folder in Positron (`File → Open Folder...`), opening `tutorial.qmd`, and clicking **Render**.

Step 2 is only needed once per machine.

## Troubleshooting

- **Wrapper refuses to open on macOS (Gatekeeper):** `render.command` is unsigned, so the first time you double-click it macOS may block it. Right-click → **Open** → confirm in the dialog. After that, double-clicking works normally. As a fallback, run `bash render.command` from a terminal.
- **Auto-relaunch:** if `python3` on your PATH is unsupported (for example Python 3.14, or 3.9 and older), `setup_env.py` scans your machine for a compatible Python 3.10–3.13, picks the newest one it finds, and relaunches itself with it. You'll see a `Note: ... Relaunching setup_env.py with it...` line — that's expected.
- **Windows:** if `python3` is not on PATH, use `python setup_env.py` instead.
- **Kernel not found:** Quarto looks for Jupyter kernels through a Python interpreter. `setup_env.py` therefore writes `_environment.local`, which points Quarto (`QUARTO_PYTHON`) at the `.venv/`, so `quarto render` works even when your default `python3` is unsupported. If Render still reports `Jupyter kernel 'python_fwl-tutorial' not found`, run `python3 setup_env.py` in a terminal and try again. If you move the folder, re-run `setup_env.py`, because `_environment.local` stores an absolute path.
- **"Kernel is running outside the tutorial .venv":** Quarto picked a different Python. Render with the wrapper, or set `QUARTO_PYTHON` as in step 3 of the manual route.
- **"This tutorial needs Python 3.10, 3.11, 3.12, or 3.13":** no supported Python was found. Install one (miniforge, python.org, or Homebrew `python@3.13`) and re-run.
- **`ImportError: ... pyexpat.cpython-3XX-darwin.so`:** your Python's `pyexpat` stdlib binding is broken — most often Homebrew `python@3.14` on macOS, whose `pyexpat.so` is linked against a newer `libexpat` than the system ships. Fix by switching to a different Python (`~/miniforge3/envs/<env>/bin/python3 setup_env.py`), installing from python.org, or `brew uninstall python@3.14 && brew install python@3.13`.
- **Start over:** delete the `.venv/` folder and run the wrapper again.

## Source

Online tutorial and full post: <https://carlos-mendez.org/post/python_fwl/>
Interactive web app (includes the lab): <https://carlos-mendez.org/post/python_fwl/web_app/index.html#lab>
GitHub repo: <https://github.com/cmg777/starter-academic-v501>
