# Jamuna Bridge — difference-in-differences tutorial bundle

Runnable companion to
**[Evaluating the Impact of Infrastructure: A Beginner's Guide to Difference-in-Differences with
the Jamuna Bridge](https://carlos-mendez.org/post/python_bridge_impact/)**.

Everything needed to reproduce the analysis is inside this folder. There is no `pip install` step
to run by hand and no environment to configure — the render script builds a private one for you.

---

## Two clicks

**macOS** — double-click `render.command`.
**Windows** — double-click `render.bat`.

The first render takes a few minutes: it creates a private `.venv/` next to these files, installs
the pinned packages into it, registers a Jupyter kernel called `bridge-impact-tutorial`, and then
renders `tutorial.qmd` to `tutorial.html`. Every render after that takes seconds, because each step
short-circuits once the desired state is already in place.

If macOS refuses to open `render.command`, right-click it and choose **Open**, or run
`chmod +x render.command` in Terminal first.

### From a terminal instead

```bash
cd path/to/python_bridge_impact
quarto render tutorial.qmd
```

---

## What is in here

| File | What it is |
|---|---|
| `tutorial.qmd` | The executable tutorial. Start here. |
| `analysis.py` | The full script behind the published post — goes well beyond the tutorial. |
| `cheatsheet_python.py` | One-page reference for difference-in-differences in Python. |
| `analysis.do` | Stata companion, so you can compare the two implementations line by line. |
| `bridge_*.csv` | The five datasets. |
| `setup_env.py` | Builds the private environment. Called automatically by Quarto. |
| `_quarto.yml` | Wires `setup_env.py` into Quarto's pre-render hook. |
| `render.command` / `render.bat` | One-click render for macOS and Windows. |

### `tutorial.qmd` versus `analysis.py`

The tutorial teaches the method on one outcome — nighttime lights — and then applies it to
population density and the employment shares. It covers the 2x2, two-way fixed effects, the event
study, both doubly-robust estimators, the spatial heterogeneity and the HonestDiD sensitivity
analysis. It runs in well under a minute.

`analysis.py` is the complete replication: all four outcome families, every published table, the
balance and pre-trend tests, a three-engine estimator-agreement check, a reproduction of a bug in
the original Stata package, and an audit of all 122 published coefficients. Run it with:

```bash
python analysis.py
```

It takes about 95 seconds and writes 21 figures and 21 result tables into the working directory.

---

## Requirements

- **Quarto 1.4 or newer** — <https://quarto.org/docs/get-started/>
- **Python 3.10 to 3.13**

`setup_env.py` searches for a usable interpreter if the one Quarto found is unsuitable, and tells
you plainly what it did. It never modifies your system Python or any environment you already use;
everything lands in `.venv/` beside these files, and deleting that folder undoes all of it.

Packages installed into the private environment: `numpy`, `pandas`, `scipy`, `matplotlib`,
`statsmodels`, [`diff-diff`](https://github.com/igerber/diff-diff) and
[`pyfixest`](https://py-econometrics.github.io/pyfixest/), plus `jupyter` and `ipykernel`.

---

## About the data

Five tidy CSVs derived from the replication package of Blankespoor, Emran, Shilpi & Xu (2021),
*"Bridge to bigpush or backwash? Market integration, reallocation and productivity effects of
Jamuna Bridge in Bangladesh"*, *Journal of Economic Geography*. Values are unchanged from the
authors' original Stata files; only the format and the column selection differ.

**One thing to know before you start:** the `year` column is an integer *period index* (1, 2, 3…),
not a calendar year. Annual satellite and yield data are averaged into three-year blocks. Because
the control variables interact baseline characteristics with this index, substituting real years
changes every coefficient. The mapping is printed in section 2 of the tutorial and documented in
full in the [data dictionary](https://carlos-mendez.org/post/python_bridge_impact/data/).

Please cite the original authors for the data.

---

## Troubleshooting

**"quarto: command not found"** — install Quarto from the link above and reopen your terminal.

**The kernel is not found on the first render** — run `python setup_env.py` once by hand from this
folder, then render again. This happens when Quarto and your Python installation disagree about
where user kernels live.

**A package fails to install** — usually a transient network problem; `setup_env.py` retries once
on its own. If it persists, delete `.venv/` and render again.

**You want to start completely clean** — delete `.venv/`, `.quarto/` and `tutorial.html`, then
render again.
