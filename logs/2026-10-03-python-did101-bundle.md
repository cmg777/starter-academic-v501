# 2026-10-03 — python_did101: Quarto bundle brought in line with the post

Last step of bringing `content/post/python_did101/` up to the `python_fwl` feature set (after the
cheat sheets, data dictionary / `analysis.do` / lab, slides / AhaSlides, podcast / video and AI
slides entries of the same day). `references/tutorial.qmd`, `notebook.ipynb`, `build_bundle.sh`,
`references/README.md` and `python_did101.zip` changed; the post itself did not.

## `references/tutorial.qmd`

- **Stale "Key concepts" examples fixed.** A full prose diff against `index.md` found four examples in
  §1.3 that the audit had corrected in the post but not in the qmd: parallel trends (claimed the
  leads "prove" the assumption, with nonexistent `lead-1` names), TWFE (no staggered-adoption
  warning), event study (said the effect "grows modestly", against the flat 25.03 / 24.71 / 24.77 /
  25.70) and SUTVA ("testable concerns"). All four now match the post. The remaining differences
  are intentional (Quarto callouts instead of HTML cards, figures drawn inline, the etable note
  written for a Quarto render, the absolute link to the Stata post).
- **New §12 "Try it yourself: an interactive DiD lab"**, copied from the post, with a web-only note
  linking to the lab in the post (`#12-try-it-yourself-an-interactive-did-lab`, checked live) in
  place of the shortcode. Sections 12–15 renumbered 13–16, as in the post; "Section 14.2" now
  resolves.
- **Data: bundled CSV first, then the `.dta` on GitHub.** A `load_data()` helper reads
  `tutoring_did.csv` / `tutoring_didevent.csv` next to the notebook (round-trip float parsing)
  and otherwise downloads the quarcs-lab `.dta`. Checked that both sources give identical frames
  (`assert_frame_equal(check_exact=True)`). Exercise 2 uses the same helper.
- **Source files** list the cheat sheets, `analysis.do`, the CSVs, the data dictionary, the three
  slide formats, the podcast, the video overview and the web app.

## Bundle

- `build_bundle.sh` now also ships `cheatsheet_python.py`, `cheatsheet_R.R`, `cheatsheet_stata.do`,
  `analysis.do` and the two CSVs (flattened next to `tutorial.qmd`, where all four companions look
  first), and zips with `-X`, excluding `.DS_Store`. 14 files.
- `references/README.md` documents the new files, how to run the companions and the Stata batch-log
  license warning.
- `notebook.ipynb` rebuilt from the qmd (113 cells; the converter now turns the plain note callout
  into a blockquote and names the zip, since the notebook travels without the bundle).

## Verification

- From the unzipped bundle: `setup_env.py` built the `.venv/` (pins all `[OK]`) and
  `quarto render` (with `QUARTO_PYTHON` set, as `render.command` does) produced `tutorial.html`
  with 0 error cells, 8 figures, both CSVs loaded locally, and 25.3149 / 0.6373 / 25.028 present.
- `cheatsheet_python.py`, `cheatsheet_R.R`, `cheatsheet_stata.do` and `analysis.do` all ran from
  the unzipped folder on the local CSVs with every assertion passing (Stata 18 SE).
- The notebook executed end to end through the URL fallback (as in Colab): no errors, 8 figures,
  all event-study and SE values present.
- The test registered a `python_did101-tutorial` kernelspec in `~/Library/Jupyter` pointing at the
  scratch `.venv/`; it was removed afterwards.

**Known limitation, not changed:** running `quarto render` by hand without `QUARTO_PYTHON`, on a
machine whose `python3` is unsupported (here 3.14), fails with "kernel not found": `setup_env.py`
relaunches itself under a compatible Python, so the outer Python Quarto uses never gets
`jupyter_core`. The one-click wrappers set `QUARTO_PYTHON` and are unaffected. This is shared
`setup_env.py` behavior across posts.
