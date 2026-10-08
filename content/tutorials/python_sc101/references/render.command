#!/bin/bash
# One-click render wrapper for macOS. Double-click it in Finder, or run it from
# a terminal: bash render.command
#
# The order matters: setup_env.py creates the .venv and registers the Jupyter
# kernel BEFORE Quarto looks them up. QUARTO_PYTHON points the Jupyter discovery
# of Quarto at the .venv of this bundle, so Quarto finds the kernel whatever
# python3 the PATH points at.

set -e
cd "$(dirname "$0")"

python3 setup_env.py

export QUARTO_PYTHON="$PWD/.venv/bin/python"
quarto render tutorial.qmd

open tutorial.html
