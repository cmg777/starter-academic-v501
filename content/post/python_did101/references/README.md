# python_did101 — Quarto project

Executable companion to the blog post:

> **Introduction to Difference-in-Differences (DiD) in Python**
> <https://carlos-mendez.org/post/python_did101/>

## What's inside

- `render.command` / `render.bat` — one-click wrapper (macOS / Windows). Runs setup and Quarto in order.
- `tutorial.qmd` — the executable Quarto notebook.
- `setup_env.py` — bootstraps a local `.venv/` with pinned packages on first render.
- `_quarto.yml` — wires `setup_env.py` to Quarto's pre-render hook.
- `script.py` — the canonical companion script, kept for reference. To run it on its own (`.venv/bin/python script.py`), also `pip install selenium` into the `.venv/` and have Chrome installed: Great Tables needs both to save its two tables as PNG files.
- `tutoring_did.csv` — the 2×2 panel: 35 schools × 2 periods, 70 rows (`id`, `time`, `treated`, `post`, `txp`, `gpa`, `female_share`). Treated schools are ids 26–35.
- `tutoring_didevent.csv` — the event-study panel: 35 schools × 8 periods, 280 rows (the same columns plus `timeToTreat` = time − 5 for treated schools, empty for comparison schools). A separate simulation, not an extension of the 2×2 file.
  Both CSVs are written at full precision and are identical to the `.dta` files on GitHub that the post loads. The notebook, the cheat sheets and `analysis.do` read them from this folder, so no internet connection is needed; without them, each falls back to a download.
- `cheatsheet_python.py`, `cheatsheet_R.R`, `cheatsheet_stata.do` — one-page cheat sheets that run the whole tutorial in Python, R and Stata on the CSVs and print the same twelve estimates (2×2 and event study), with the reference values asserted. Each header lists the packages it needs (Python: the `.venv/` from `setup_env.py` has all of them; R: `fixest`; Stata: none beyond official commands).
- `analysis.do` — the Stata port of `script.py`, section by section; it asserts every number the post prints. Set `global EXPORT 1` to also write its figures and the LaTeX table.
- `README.md` — this file.

## Prerequisites

- Python 3.10–3.13 (any standard install: python.org, Homebrew, miniconda, miniforge).
- A working [Quarto](https://quarto.org/) install.
- [Positron](https://positron.posit.co/) is recommended; any terminal with `quarto` on PATH also works.

## How to use

### One-click (recommended)

1. Extract this ZIP anywhere on your machine.
2. **macOS:** double-click `render.command` in Finder. **Windows:** double-click `render.bat` in Explorer.

The wrapper runs `setup_env.py` (creates a hermetic `.venv/`, installs pinned packages, registers the Jupyter kernel `python_did101-tutorial`) and then `quarto render tutorial.qmd`, finally opening `tutorial.html` in your default browser. First run takes ~2 minutes; subsequent runs are instant.

### Manual (terminal users)

1. Extract this ZIP anywhere on your machine.
2. Open a terminal *in the extracted `python_did101/` folder* and run:

   ```bash
   python3 setup_env.py
   ```

   This creates the `.venv/`, installs pinned packages, and registers a Jupyter kernel named `python_did101-tutorial`. The script is idempotent on re-runs.
3. Open the same folder in Positron (`File → Open Folder...`).
4. Open `tutorial.qmd` and click **Render**. (Or, equivalently: `quarto render tutorial.qmd` from the same shell.)

Subsequent renders are instant — step 2 is only needed once per machine.

## Troubleshooting

- **Wrapper refuses to open on macOS (Gatekeeper):** the `render.command` is unsigned, so the first time you double-click it macOS may block it. Right-click → **Open** → confirm in the dialog. After that, double-clicking works normally. As a fallback, run `bash render.command` from a terminal.
- **Auto-relaunch:** if `python3` on your PATH is unsupported (e.g., Python 3.14 with no `numba` wheels, or 3.9 below the package minimum), `setup_env.py` scans your machine for a compatible Python 3.10–3.13 and relaunches itself with it. You'll see a `Note: ... Relaunching setup_env.py with it...` line — that's expected.
- **Windows:** if `python3` is not on PATH, use `python setup_env.py` instead.
- **Kernel not found:** Quarto looks for Jupyter kernels through a Python interpreter. `setup_env.py` therefore writes `_environment.local`, which points Quarto (`QUARTO_PYTHON`) at the `.venv/`, so `quarto render` works even when your default `python3` is unsupported. If Render still reports `Jupyter kernel 'python_did101-tutorial' not found`, run `python3 setup_env.py` in a terminal and try again. If you move the folder, re-run `setup_env.py`, because `_environment.local` stores an absolute path.
- **"This tutorial needs Python 3.10, 3.11, 3.12, or 3.13":** your `python3` is outside the supported range. Install a working Python (miniforge, python.org, or Homebrew `python@3.13`) and re-run.
- **`ImportError: ... pyexpat.cpython-3XX-darwin.so`:** your Python's `pyexpat` stdlib binding is broken — most often Homebrew `python@3.14` on macOS, whose `pyexpat.so` is linked against a newer `libexpat` than the system ships. Fix by switching to a different Python (`~/miniforge3/envs/<env>/bin/python3 setup_env.py`), installing from python.org, or `brew uninstall python@3.14 && brew install python@3.13`.

## Running the companions

From a terminal in this folder:

```bash
.venv/bin/python cheatsheet_python.py      # after setup_env.py has built .venv/
Rscript cheatsheet_R.R
stata -b do cheatsheet_stata.do             # or: do cheatsheet_stata.do from the Stata window
stata -b do analysis.do
```

A Stata batch run writes a `.log` file whose header contains your Stata license details; do not share it.

## Source

Online tutorial and full post: <https://carlos-mendez.org/post/python_did101/>
Data dictionary: <https://carlos-mendez.org/post/python_did101/data/index.html>
GitHub repo: <https://github.com/cmg777/starter-academic-v501>
