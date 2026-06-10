# python_did_sc_tsunami — Quarto project

Executable companion to the blog post:

> **Evaluating the Economic Impact of Natural Disasters: A Causal-Inference Case Study of the Aceh Tsunami in Python**
> <https://carlos-mendez.org/post/python_did_sc_tsunami/>

A beginner's replication of Heger & Neumayer (2019) on the 2004 Aceh tsunami, using
**synthetic, calibrated** teaching data: dynamic difference-in-differences (`pyfixest`),
an event study (`diff-diff`), a night-lights dose-response, synthetic control
(`mlsynth`), and Conley spatial standard errors.

## What's inside

- `render.command` / `render.bat` — one-click wrapper (macOS / Windows). Runs setup and Quarto in order.
- `tutorial.qmd` — the executable Quarto notebook.
- `setup_env.py` — bootstraps a local `.venv/` with pinned packages on first render (installs `mlsynth` from a pinned git commit, since it is not on PyPI).
- `_quarto.yml` — wires `setup_env.py` to Quarto's pre-render hook.
- `data/` — the two synthetic panels the tutorial loads (bundled, so it renders offline).
- `script.py` — the canonical companion script, kept for reference.
- `README.md` — this file.

## Prerequisites

- Python 3.11–3.13 (any standard install: python.org, Homebrew, miniconda, miniforge).
- A working [Quarto](https://quarto.org/) install.
- Internet access on the **first** render only (to download the pinned packages, including `mlsynth` from GitHub).
- [Positron](https://positron.posit.co/) is recommended; any terminal with `quarto` on PATH also works.

## How to use

### One-click (recommended)

1. Extract this ZIP anywhere on your machine.
2. **macOS:** double-click `render.command` in Finder. **Windows:** double-click `render.bat` in Explorer.

The wrapper runs `setup_env.py` (creates a hermetic `.venv/`, installs pinned packages, registers the Jupyter kernel `python_did_sc_tsunami-tutorial`) and then `quarto render tutorial.qmd`, finally opening `tutorial.html` in your default browser. First run takes ~3 minutes (the synthetic-control stack pulls in `jax`); subsequent runs are instant.

### Manual (terminal users)

1. Extract this ZIP anywhere on your machine.
2. Open a terminal *in the extracted `python_did_sc_tsunami/` folder* and run:

   ```bash
   python3 setup_env.py
   ```

   This creates the `.venv/`, installs pinned packages, and registers a Jupyter kernel named `python_did_sc_tsunami-tutorial`. The script is idempotent on re-runs.
3. Open the same folder in Positron (`File → Open Folder...`).
4. Open `tutorial.qmd` and click **Render**. (Or, equivalently: `quarto render tutorial.qmd` from the same shell.)

Subsequent renders are instant — step 2 is only needed once per machine.

## Troubleshooting

- **Wrapper refuses to open on macOS (Gatekeeper):** the `render.command` is unsigned, so the first time you double-click it macOS may block it. Right-click → **Open** → confirm in the dialog. As a fallback, run `bash render.command` from a terminal.
- **Auto-relaunch:** if `python3` on your PATH is unsupported (e.g., Python 3.14 with no `numba` wheels, or 3.9 below the package minimum), `setup_env.py` scans your machine for a compatible Python 3.11–3.13 and relaunches itself with it. You'll see a `Note: ... Relaunching setup_env.py with it...` line — that's expected.
- **macOS Intel:** the bundle pins `numba==0.62.1` + `llvmlite==0.45.0`, the last releases with Intel (x86_64) wheels, so the install never falls back to a slow LLVM source build.
- **`mlsynth` install fails:** it installs from a pinned GitHub commit, so the first render needs internet and `git`. If your network blocks GitHub, install it manually inside the venv: `.venv/bin/python -m pip install "git+https://github.com/jgreathouse9/mlsynth.git"`.
- **Windows:** if `python3` is not on PATH, use `python setup_env.py` instead.
- **Kernel not found:** if Render reports `Jupyter kernel 'python_did_sc_tsunami-tutorial' not found`, run `python3 setup_env.py` in a terminal and try again. The one-click wrapper avoids this entirely.

## Source

Online tutorial and full post: <https://carlos-mendez.org/post/python_did_sc_tsunami/>
GitHub repo: <https://github.com/cmg777/starter-academic-v501>
