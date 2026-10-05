# python_sc101: Quarto project

This bundle is the executable companion of the post [Introduction to the Synthetic Control Method in Python with mlsynth](https://carlos-mendez.org/post/python_sc101/). It renders the complete tutorial on a local machine, with the code of the post and the same pinned software. The rendered page therefore reproduces the numbers of the post, up to the small differences in placebo fits that Section 2 of the post explains.

## What is inside

- `render.command` and `render.bat`: one-click wrappers for macOS and Windows. Each runs the setup script and then Quarto, in that order.
- `tutorial.qmd`: the executable Quarto notebook, generated from the text and the code of the post.
- `setup_env.py`: builds a local `.venv/` with the pinned packages before the first render.
- `_quarto.yml`: connects `setup_env.py` to the pre-render hook of Quarto.
- `script.py`: the companion script of the post, which reproduces every number and every figure.
- `smoking_sc.csv`: the balanced panel of 39 US states over 1970–2000, with 1,209 rows and the columns `state`, `year`, `cigsale`, `lnincome`, `beer`, `age15to24`, and `retprice`. It holds the same values as the Stata file that the post loads, so the tutorial, the script, and the cheat sheets run without a download of the data.
- `cheatsheet_python.py`, `cheatsheet_R.R`, and `cheatsheet_stata.do`: one-page cheat sheets that run the synthetic control of the post in Python with mlsynth, in R with tidysynth, and in Stata with synth2. The header of each sheet lists the packages that it needs.
- `README.md`: this file.

## Prerequisites

- Python 3.11, 3.12, or 3.13, from any standard installation (python.org, Homebrew, miniconda, or miniforge).
- A working [Quarto](https://quarto.org/) installation.
- [Positron](https://positron.posit.co/) is recommended, but any terminal with `quarto` on the PATH also works.
- An internet connection for the first render, which downloads the pinned packages.

## How to use

### One click (recommended)

1. Extract this ZIP anywhere on your machine.
2. **macOS:** double-click `render.command` in Finder. **Windows:** double-click `render.bat` in Explorer.

The wrapper runs `setup_env.py`, which creates a hermetic `.venv/`, installs the pinned packages, and registers the Jupyter kernel `python_sc101-tutorial`. It then runs `quarto render tutorial.qmd` and opens `tutorial.html` in the default browser. The first run takes several minutes, because it installs the packages and fits every model, while later runs skip the installation but still fit the models.

### Manual (terminal users)

1. Extract this ZIP anywhere on your machine.
2. Open a terminal in the extracted `python_sc101/` folder, and run:

   ```bash
   python3 setup_env.py
   ```

   This command creates the `.venv/`, installs the pinned packages, and registers a Jupyter kernel named `python_sc101-tutorial`. A second run changes nothing and finishes within seconds. The step is therefore needed only once per machine.
3. Open the same folder in Positron (`File → Open Folder...`).
4. Open `tutorial.qmd`, and click **Render**. The command `quarto render tutorial.qmd` in the same terminal is equivalent.

## Troubleshooting

- **The wrapper does not open on macOS (Gatekeeper).** The file `render.command` is unsigned, so macOS may block it the first time. Right-click it, choose **Open**, and confirm in the dialog; later double-clicks then work normally. As a fallback, run `bash render.command` from a terminal.
- **Automatic relaunch.** When the `python3` on the PATH is unsupported, for example Python 3.14 or 3.10, `setup_env.py` searches the machine for a Python 3.11, 3.12, or 3.13 and relaunches itself with it. The line `Note: ... Relaunching setup_env.py with it...` is then expected.
- **Windows.** When `python3` is not on the PATH, use `python setup_env.py` instead.
- **Kernel not found.** Quarto looks for Jupyter kernels through a Python interpreter. The script `setup_env.py` therefore writes `_environment.local`, which points Quarto (`QUARTO_PYTHON`) at the `.venv/`, so `quarto render` works even when the default `python3` is unsupported. If Render still reports `Jupyter kernel 'python_sc101-tutorial' not found`, run `python3 setup_env.py` in a terminal, and try again. After a move of the folder, run `setup_env.py` again, because `_environment.local` stores an absolute path.
- **"This tutorial needs Python 3.11, 3.12, or 3.13."** The `python3` on the PATH is outside the supported range, and the setup found no supported version. Install one (miniforge, python.org, or Homebrew `python@3.13`), and run the setup again.
- **`ImportError: ... pyexpat.cpython-3XX-darwin.so`.** The `pyexpat` binding of the standard library is broken in that Python, most often in Homebrew `python@3.14` on macOS, whose `pyexpat.so` is linked against a newer `libexpat` than the one that the system ships. Switch to another Python (`~/miniforge3/envs/<env>/bin/python3 setup_env.py`), install one from python.org, or run `brew uninstall python@3.14 && brew install python@3.13`.
- **Slightly different placebo numbers.** The placebo fits of the donor states depend on the optimizer, so another software stack can move a few of them in the third decimal. The pins of `setup_env.py` rebuild the stack of the post, and the `setup-packages` chunk at the top of the tutorial reports any version mismatch.

## Running the companions

The script and the cheat sheets also run from a terminal in this folder. The Python files use the `.venv/` that `setup_env.py` builds, while the R and Stata sheets need their own installations. The commands below run each companion once.

```bash
.venv/bin/python script.py                # writes 12 figures, 18 CSV tables, and sc101_results.json here
.venv/bin/python cheatsheet_python.py
Rscript cheatsheet_R.R
stata -b do cheatsheet_stata.do           # or: do cheatsheet_stata.do in the Stata window
```

On Windows, the Python commands use `.venv\Scripts\python.exe` instead of `.venv/bin/python`. A Stata batch run writes a `.log` file whose header contains the license details of the user, so that log should stay private. The script, by contrast, saves its figures, tables, and results file in this folder.

## Source

- Online tutorial and full post: <https://carlos-mendez.org/post/python_sc101/>
- Stata edition of the post: <https://carlos-mendez.org/post/stata_sc/>
- Data dictionary: <https://carlos-mendez.org/post/python_sc101/data/index.html>
- GitHub repository: <https://github.com/cmg777/starter-academic-v501>
