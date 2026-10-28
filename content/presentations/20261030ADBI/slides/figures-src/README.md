# Figure sources for the ADBI 2026 talk

Everything the deck in `../` needs to redraw its data figures, kept here so the
deck does not depend on the chapter repository. Hugo does not publish this folder
(`excludeFiles` in `config/_default/config.yaml`); only the PNGs in `../img/` go online.

- `make_figures.py` draws all ten PNGs in `../img/` in the deck's dark theme.
  Run it from this folder: `python3 make_figures.py`, then
  `cd .. && quarto render slides.qmd`.
- `data/` holds extracts of the chapter's derived outputs (`data/derived/` of
  quarcs-lab/project2026i, commit `111def8`, 2026-10-28):
  SDGI access indicators and fits, Gini series and changes, the synthetic-control
  paths and placebos (annual and monthly), the monthly resilience summary, region
  brightness for 2014 and 2024, and the region boundaries simplified to 0.02°.
- `tables/` holds the chapter's code-emitted LaTeX tables. Every number typed on a
  slide (takeaways, backup tables, notes) was copied from these files or from the
  chapter outline built from them.
- `references.bib` is the chapter bibliography, for the sources cited on slides.

The Codex-generated images in `../img/` (`cover.webp`, `orbit-night.webp`,
`tohoku-coast.webp`) and `../../featured.webp` are decorative illustrations, not data.
