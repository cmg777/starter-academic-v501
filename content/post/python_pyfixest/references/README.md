# PyFixest Tutorial Bundle

A self-contained Quarto tutorial on high-dimensional fixed-effects regression in Python.

## What's inside

- `tutorial.qmd` — the executable Quarto notebook.
- `setup_env.py` — bootstraps a local `.venv/` with pinned packages on first render.
- `_quarto.yml` — wires `setup_env.py` to Quarto's pre-render hook.
- `script.py` — the original developer script, kept for reference.
- `README.md` — this file.

## Prerequisites

- Python 3.10+ (any standard install: python.org, Homebrew, miniconda, miniforge).
- A working [Quarto](https://quarto.org/) install.
- [Positron](https://positron.posit.co/) is recommended; any terminal with `quarto` on PATH also works.

## How to use

1. Extract this ZIP anywhere on your machine.
2. Open a terminal *in the extracted `python_pyfixest_tutorial/` folder* and run:

   ```bash
   python3 setup_env.py
   ```

   This creates a hermetic `.venv/` next to the notebook, pip-installs pinned packages, and registers a Jupyter kernel named `pyfixest-tutorial`. First run takes ~2 minutes; the script is idempotent on re-runs.
3. Open the same folder in Positron (`File → Open Folder...`).
4. Open `tutorial.qmd` and click **Render**.

Subsequent renders are instant — you only run step 2 once per machine.

## Troubleshooting

- **Auto-relaunch:** if `python3` on your PATH is unsupported (e.g., Python 3.14 with no `numba` wheels, or 3.9 below pyfixest's minimum), `setup_env.py` scans your machine for a compatible Python 3.10–3.13 and relaunches itself with it. You'll see a `Note: ... Relaunching setup_env.py with it...` line — that's expected.
- **Windows:** if `python3` is not on PATH, use `python setup_env.py` instead.
- **Kernel not found:** if Render reports `Jupyter kernel 'pyfixest-tutorial' not found`, you skipped step 2 — run `python3 setup_env.py` in a terminal and try again.
- **"This tutorial needs Python 3.10, 3.11, 3.12, or 3.13":** your `python3` is outside the supported range. The pinned `numba` and `llvmlite` releases only ship wheels for cp310–cp313. Install a working Python (miniforge, python.org, or Homebrew `python@3.13`) and re-run.
- **`ImportError: ... pyexpat.cpython-3XX-darwin.so`:** your Python's `pyexpat` stdlib binding is broken — most often Homebrew `python@3.14` on macOS, whose `pyexpat.so` is linked against a newer `libexpat` than the system ships. Fix by switching to a different Python (`~/miniforge3/envs/<env>/bin/python3 setup_env.py`), installing from python.org, or `brew uninstall python@3.14 && brew install python@3.13`.

## Source

Online tutorial and full post: <https://carlos-mendez.org/post/python_pyfixest/>
