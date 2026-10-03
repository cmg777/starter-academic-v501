# 2026-10-03 — Remaining python_did101 items, and two script fixes site-wide

## python_did101

- **GPA scale.** GPA is described as a 0–100 score, but 27 of the 280 event-study school-periods
  exceed 100 (maximum 107.68). All 27 belong to the 10 treated schools after adoption, because the
  simulation does not cap the score. The 2×2 file stays below 100 (maximum 99.15). Changes:
  - The Abstract and the variable list now say "nominal 0–100" (post, tutorial, notebook).
  - A new paragraph in §11.1 explains the values above 100, in the same academic style as the rest
    of the post.
  - The three cheat-sheet headers note the 107.68 maximum.
  - The data dictionary already documented it.
- **AhaSlides cap.** A second editor check, several hours after the build, still reads **0 / 50**
  ("host up to 50 live participants"). Recorded in `ahaslides/README.md`; a live test is still
  advised.

## Site-wide fix 1: a bare `quarto render` now finds the kernel

- **Problem.** Quarto finds Jupyter kernels through `QUARTO_PYTHON`, or else through `python3` on
  PATH. When that `python3` is unsupported (3.14 here), `setup_env.py` relaunches itself under a
  compatible Python. The outer `python3` then never gets Jupyter, and a bare `quarto render`
  fails with "Jupyter kernel ... not found". Only the one-click wrappers set `QUARTO_PYTHON`.
- **Fix.** New `write_quarto_environment()`, called at the end of `main()`, writes
  `_environment.local` with `QUARTO_PYTHON=<abs path to .venv python>`. Quarto loads this file for
  every project render. The file is rewritten if it changes (e.g. after the folder moves) and is
  gitignored (`content/post/*/references/_environment.local`).
- **Test** (python_did101, fresh unzip, `python3` = 3.14, no `QUARTO_PYTHON`):
  - First bare `quarto render`: works. The pre-render hook writes the file before the kernel lookup.
  - A second bare render works, and so does `render.command`.
  - Output: 8 figures, 0 error cells, all pins `[OK]`.
- **Applied to:** all 32 `references/setup_env.py` copies, the skill template
  `setup_env.py.template`, the "Kernel not found" troubleshooting line in 28 bundle READMEs plus
  `README.md.template` (each keeps its own kernel name; 4 READMEs never had that line), and
  `render-and-fix.md`.
- **Zips.** Only `setup_env.py` and `README.md` were swapped inside each committed zip; every other
  entry and its permissions are unchanged. A full rebuild was not used because most bundles were
  already out of date (see below). `python_did101.zip` was fully rebuilt, since this session
  changed its sources. The zipped `setup_env.py` of `static/uploads/python_pyfixest_tutorial.zip`
  had never received the committed uv broken-venv probe; it now ships the current source, which
  includes that probe.

## Site-wide fix 2: data-dictionary CSV precision

- `build_data_dictionary.py` now reads CSVs with `float_precision="round_trip"` (with a comment), in
  the skill template and all 43 post copies. pandas' default fast parser can be off in the last
  binary digit, so the `.dta` files were not byte-faithful to the CSVs.
- 21 posts have CSVs that parse differently (relative error about 1e-16); the other 22 are
  unaffected. The 20 affected posts other than python_did101 were regenerated; python_did101
  already had the fix.
  - Every regenerated `.dta` now equals its CSV exactly (float columns compared with
    `array_equal`).
  - Mostly only the `.dta` files and the data zip changed. In 4 posts (`python_mgwrfer`,
    `r_causalpolicy_workshop`, `r_demeaning_twfe`, `r_double_lasso`) the page or README also
    changed: a few histogram bars where values sit on bin edges, and near-zero means in the 17th
    decimal. Running the unpatched renderer in place reproduces the committed files, so these
    changes come from the fix itself.
- **Not regenerated: `stata_convergence`.** Its committed README and page are already out of date:
  the unpatched renderer also produces different numbers (e.g. `i_cig` N 10,399 → 12,810). Only the
  code patch is committed there; regenerating it is a separate decision.

## Found, not changed: stale tutorial bundles

A full rebuild of each bundle would change files other than `setup_env.py` and `README.md` in 23
zips. Most often the zipped `tutorial.qmd` predates later commits to `references/tutorial.qmd`.
`python_did_industrial_park` and `python_did_sc_tsunami` also bundle out-of-date data folders, and
`python_sc_dsc_sdid` has an older `analysis.py`. These bundles do not match their committed
sources. Rebuilding them is a separate decision for the author.
