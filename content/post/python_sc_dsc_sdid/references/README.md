# The Synthetic Control Ladder in Python — executable bundle

Companion Quarto project for
[carlos-mendez.org/post/python_sc_dsc_sdid](https://carlos-mendez.org/post/python_sc_dsc_sdid/).

Everything here runs offline once the packages are installed. The environment is
hermetic: a `.venv/` is created *inside this folder*, so nothing on your machine
is modified except one registered Jupyter kernel.

## Two clicks

**macOS** — double-click `render.command` in Finder.
**Windows** — double-click `render.bat` in Explorer.

The first run takes a few minutes while the virtual environment is built. Later
runs take seconds. When it finishes, `tutorial.html` opens in your browser.

## Prerequisites

| Tool | Version | Check with |
|---|---|---|
| [Quarto](https://quarto.org/docs/get-started/) | 1.4 or later | `quarto --version` |
| Python | 3.10–3.13 | `python3 --version` |

Nothing else. `setup_env.py` installs the rest into the bundle's own `.venv/`.

## What is in this bundle

| File | What it is |
|---|---|
| `tutorial.qmd` | The executable tutorial — the source of `tutorial.html` |
| `analysis.py` | The complete pipeline behind the post: every figure and result table |
| `cheatsheet_python.py` | One-page quick reference, all six rungs, ~25 seconds to run |
| `brexit_analysis.csv` | The estimation sample: 24 countries x 104 quarters |
| `setup_env.py` | Builds `.venv/`, installs pinned packages, registers the kernel |
| `_quarto.yml` | Wires `setup_env.py` to Quarto's `pre-render` hook |
| `render.command` / `render.bat` | One-click wrappers for macOS and Windows |

## Running the pieces separately

```bash
python3 setup_env.py            # build the environment (idempotent)
.venv/bin/python cheatsheet_python.py    # the six rungs, ~25 s
.venv/bin/python analysis.py             # the full pipeline, ~12 min cold
quarto render tutorial.qmd               # the tutorial
```

`analysis.py` caches expensive fits under `cache/`. Set `FORCE_REFIT=1` to
invalidate the cache and recompute everything from scratch.

## Pinned versions

`setup_env.py` pins **mlsynth to git commit `15f168b`**, the exact commit the
post was verified against, so the numbers you see will match the published ones.
`numpy`, `pandas` and `matplotlib` carry minimum-version specifiers rather than
exact pins, so the bundle builds on any Python from 3.10 to 3.13.

**Do not substitute `pip install mlsynth`.** The PyPI release numbered 1.0.0 is
*behind* git `main` at the same version number: it reports
`mlsynth.__version__ == "1.0.0"` but is missing `VanillaSCConfig.w_constr`,
which `tutorial.qmd` uses. Nothing in the version string warns you.

```bash
pip install -U "git+https://github.com/jgreathouse9/mlsynth.git@15f168b"  # this bundle
pip install -U "git+https://github.com/jgreathouse9/mlsynth.git"          # moving target
```

Note also that the mlsynth README's claim of Python 3.9 support is out of date —
`pyproject.toml` requires 3.10+.

## Troubleshooting

**"quarto: command not found"** — install Quarto from
<https://quarto.org/docs/get-started/> and reopen your terminal.

**"No such kernel named sc-dsc-sdid-tutorial"** — run `python3 setup_env.py`
directly and read its output. The kernel is registered at the end of that
script.

**The render uses the wrong Python** — `render.command` and `render.bat` set
`QUARTO_PYTHON` to the bundle's `.venv` for exactly this reason. If you are
calling `quarto render` by hand, set it yourself:

```bash
export QUARTO_PYTHON="$PWD/.venv/bin/python"
```

**A package fails to build on macOS Intel** — delete `.venv/` and re-run
`setup_env.py`. If a pinned version has no Intel wheel, relax that pin in
`setup_env.py`'s `PINNED` dict; the tutorial does not depend on the exact
patch versions of NumPy or pandas.

## Credit

`mlsynth` is by [Jared Greathouse](https://github.com/jgreathouse9/mlsynth).
The rung-to-class mapping used throughout follows
[mlsynth issue #312](https://github.com/jgreathouse9/mlsynth/issues/312).
The data come from the replication package of de Brabander, Juodis and
Miyazato Szini (2025), assembled originally by Born, Müller, Schularick and
Sedláček (2019).
