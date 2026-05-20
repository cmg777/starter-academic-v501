# python_iv — Quarto project

Executable companion to the blog post:

> **Do Institutions Cause Prosperity? An IV Tutorial in Python**
> <https://carlos-mendez.org/post/python_iv/>

## What's inside

- `render.command` / `render.bat` — one-click wrapper (macOS / Windows). Runs setup and Quarto in order.
- `tutorial.qmd` — the executable Quarto notebook.
- `setup_env.py` — bootstraps a local `.venv/` with pinned packages on first render.
- `_quarto.yml` — wires `setup_env.py` to Quarto's pre-render hook.
- `script.py` — the canonical companion script, kept for reference.
- `README.md` — this file.

## Prerequisites

- Python 3.10–3.13 (any standard install: python.org, Homebrew, miniconda, miniforge).
- A working [Quarto](https://quarto.org/) install.
- [Positron](https://positron.posit.co/) is recommended; any terminal with `quarto` on PATH also works.

## How to use

### One-click (recommended)

1. Extract this ZIP anywhere on your machine.
2. **macOS:** double-click `render.command` in Finder. **Windows:** double-click `render.bat` in Explorer.

The wrapper runs `setup_env.py` (creates a hermetic `.venv/`, installs pinned packages, registers the Jupyter kernel `python_iv-tutorial`) and then `quarto render tutorial.qmd`, finally opening `tutorial.html` in your default browser. First run takes ~2 minutes; subsequent runs are instant.

### Manual (terminal users)

1. Extract this ZIP anywhere on your machine.
2. Open a terminal *in the extracted `python_iv/` folder* and run:

   ```bash
   python3 setup_env.py
   ```

   This creates the `.venv/`, installs pinned packages, and registers a Jupyter kernel named `python_iv-tutorial`. The script is idempotent on re-runs.
3. Open the same folder in Positron (`File → Open Folder...`).
4. Open `tutorial.qmd` and click **Render**. (Or, equivalently: `quarto render tutorial.qmd` from the same shell.)

Subsequent renders are instant — step 2 is only needed once per machine.

## Troubleshooting

- **Wrapper refuses to open on macOS (Gatekeeper):** the `render.command` is unsigned, so the first time you double-click it macOS may block it. Right-click → **Open** → confirm in the dialog. After that, double-clicking works normally. As a fallback, run `bash render.command` from a terminal.
- **Auto-relaunch:** if `python3` on your PATH is unsupported (e.g., Python 3.14 with no `numba` wheels, or 3.9 below the package minimum), `setup_env.py` scans your machine for a compatible Python 3.10–3.13 and relaunches itself with it. You'll see a `Note: ... Relaunching setup_env.py with it...` line — that's expected.
- **Windows:** if `python3` is not on PATH, use `python setup_env.py` instead.
- **Kernel not found:** if Render reports `Jupyter kernel 'python_iv-tutorial' not found`, you skipped the manual step — run `python3 setup_env.py` in a terminal and try again. The one-click wrapper avoids this entirely.
- **"This tutorial needs Python 3.10, 3.11, 3.12, or 3.13":** your `python3` is outside the supported range. Install a working Python (miniforge, python.org, or Homebrew `python@3.13`) and re-run.
- **`ImportError: ... pyexpat.cpython-3XX-darwin.so`:** your Python's `pyexpat` stdlib binding is broken — most often Homebrew `python@3.14` on macOS, whose `pyexpat.so` is linked against a newer `libexpat` than the system ships. Fix by switching to a different Python (`~/miniforge3/envs/<env>/bin/python3 setup_env.py`), installing from python.org, or `brew uninstall python@3.14 && brew install python@3.13`.

## Source

Online tutorial and full post: <https://carlos-mendez.org/post/python_iv/>
GitHub repo: <https://github.com/cmg777/starter-academic-v501>
