#!/bin/bash
# One-click render wrapper for macOS. Double-click in Finder, or run from
# a terminal: bash render.command
#
# Order matters: setup_env.py creates the .venv and registers the Jupyter
# kernel BEFORE Quarto looks them up. QUARTO_PYTHON pins Quarto's Jupyter
# discovery to the bundle's .venv so it sees the kernel regardless of what
# python3 the user's PATH points at.

set -e
cd "$(dirname "$0")"

python3 setup_env.py

export QUARTO_PYTHON="$PWD/.venv/bin/python"
quarto render tutorial.qmd

open tutorial.html
