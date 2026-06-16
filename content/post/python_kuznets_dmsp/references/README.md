# Regional Inequality from Outer Space — reproducible Quarto tutorial

This bundle reproduces the analysis from the blog post
**"Regional Inequality from Outer Space: Predicting GDP from Nighttime Lights and
Building Inequality Indices in Python"** (a replication of Lessmann & Seidel, 2017).

Everything runs in a **hermetic local environment** that the bundle builds for you.
You do not need to install Python packages by hand.

## What you need first

1. **Python 3.10, 3.11, 3.12, or 3.13** on your machine
   (check with `python3 --version`). Python 3.9 and earlier will not work
   (PyFixest needs 3.10+).
2. **Quarto** — install from <https://quarto.org/docs/get-started/>.

That is all. The bundle installs everything else into a private `.venv/`.

## How to render (one click)

- **macOS:** double-click **`render.command`** in Finder
  (or run `bash render.command` in a terminal).
- **Windows:** double-click **`render.bat`** in Explorer
  (or run `render.bat` in a terminal).

The wrapper runs `setup_env.py` (which creates `.venv/`, installs the pinned
packages, and registers a Jupyter kernel), then `quarto render tutorial.qmd`, then
opens the resulting **`tutorial.html`** in your browser. The first render takes a
few minutes while packages download; later renders are fast.

## What is inside

| File | Purpose |
|------|---------|
| `tutorial.qmd` | The tutorial itself — narrative + runnable Python. |
| `setup_env.py` | Builds the hermetic `.venv/` and registers the Jupyter kernel. |
| `_quarto.yml` | Wires `setup_env.py` to Quarto's pre-render hook. |
| `render.command` | macOS one-click render wrapper. |
| `render.bat` | Windows one-click render wrapper. |
| `script.py` | The standalone analysis script (same code, no narrative). |

The tutorial downloads its small data CSVs from the post's public GitHub folder on
first run, so you need an internet connection the first time you render.

## Pinned packages

`pandas`, `numpy`, `matplotlib`, `scipy`, `statsmodels`, `linearmodels`, `pyfixest`
(plus `jupyter` + `ipykernel` for the kernel). Exact versions are pinned in
`setup_env.py` so the tutorial reproduces the same numbers shown in the post.

## Source

Lessmann, C., & Seidel, A. (2017). "Regional inequality, convergence, and its
determinants — A view from outer space." *European Economic Review*, 92, 110–132.
