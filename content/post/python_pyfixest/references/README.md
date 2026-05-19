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
2. Open the extracted `python_pyfixest_tutorial/` folder in Positron (`File → Open Folder...`).
3. Open `tutorial.qmd` and click **Render**.

The first render takes ~2 minutes while `setup_env.py` creates a hermetic `.venv/` next to the notebook and pip-installs the pinned packages. Subsequent renders are nearly instant.

## Troubleshooting

If the first render aborts with `python3: command not found` (some Windows installs lack the `python3` shim), open `_quarto.yml` and replace `python3` with `python`, then click Render again.

## Source

Online tutorial and full post: <https://carlos-mendez.org/post/python_pyfixest/>
