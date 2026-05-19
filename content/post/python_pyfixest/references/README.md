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

- **Windows:** if `python3` is not on PATH, use `python setup_env.py` instead.
- **Kernel not found:** if Render reports `Jupyter kernel 'pyfixest-tutorial' not found`, you skipped step 2 — run `python3 setup_env.py` in a terminal and try again.

## Source

Online tutorial and full post: <https://carlos-mendez.org/post/python_pyfixest/>
