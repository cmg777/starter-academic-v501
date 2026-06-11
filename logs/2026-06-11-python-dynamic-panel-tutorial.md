# 2026-06-11 — New tutorial: Dynamic Panel Data Models in Python (`python_dynamic_panel`)

Full data-science pipeline run (all write/review skill pairs + every companion artifact) for a
beginner-friendly, professor-voice tutorial on dynamic panel GMM, built from the pydynpd package
repo the user dropped at `content/post/python_dynamic_panel/referenceMaterials/` (gitignored —
never committed or published).

## What shipped

- **Post** `content/post/python_dynamic_panel/index.md` (~1,200 lines): the full arc on the
  Arellano-Bond (1991) panel of 140 UK firms — pooled OLS (ρ̂ = 0.9617, biased up) vs fixed
  effects (0.6262, Nickell bias down) forming the Bond (2002) bracket → Anderson-Hsiao IV
  (1.2327, SE 0.4782, consistent but useless) → Arellano-Bond difference GMM (0.6788, 91
  instruments — hugs the FE bound, the weak-instrument symptom) → Blundell-Bond system GMM
  headline (ρ̂ = 0.9270, SE 0.0785, Hansen p = 0.462, AR(2) p = 0.994, 32 collapsed
  instruments) → diagnostics decoder → instrument-proliferation grid → digit-exact replication
  of the pydynpd README benchmark (L1.n = 0.2710675). 13 interpretation blocks, 8 concept
  toggle-cards, Mermaid roadmap, 5 display equations.
- **Script** `script.py` + `execution_log.txt` (byte-reproducible) + 4 dark-theme figures +
  9 result CSVs + `abdata.csv` (cleaned 10-col Arellano-Bond data). pydynpd 0.2.2 needs a
  6-line NumPy 2.x compat shim (np.in1d alias + float/math.sqrt wrappers injected into
  `pydynpd.specification_tests`); the shim is version-guarded and validated by a hard
  replication assertion.
- **Results report** `results_report.md` (409 lines, every number verified against the log/CSVs).
- **Infographic prompt** `infographic_instructions.md` (6-panel chalkboard storyboard).
- **Web app** `web_app/` — 4-tab "Dynamic Panel Explorer" (bias-bracket simulator with live
  OLS/FE DGP, estimator-ladder forest plot, diagnostics decoder + quiz, method-chooser decision
  tree). Playwright-audited.
- **Quarto bundle** `python_dynamic_panel.zip` (8 files incl. `abdata.csv`; hermetic venv,
  Python floor 3.11–3.13 — pyfixest 0.50.1 has no macOS cp310 wheel; numpy pinned 2.3.5 for
  numba 0.62.1) + `references/` sources + `build_bundle.sh`. End-to-end fresh-student render
  verified. CLAUDE.md bundle list updated.
- **Colab notebook** `notebook.ipynb` (46 cells, executed with outputs; GitHub-raw data URL with
  local fallback; replication check embedded). NOTE: site-wide `ignoreFiles` excludes `.ipynb`
  from Hugo builds, so the "Jupyter notebook" button uses the GitHub raw URL (the relative
  `notebook.ipynb` URL used by older posts like python_fwl/python_doubleml_pension renders as
  `/notebook.ipynb` and 404s — pre-existing issue on those posts, not fixed here).
- **Slides (HTML)** `slides/` — 25-slide Quarto reveal.js deck (write-slides skill), figures
  reused in place, chalkboard/menu/speaker view; verified via Hugo + Node + Playwright layers.
- **Slides (PDF)** `slides.pdf` (user-provided AI deck, renamed from
  Python_Dynamic_Panel_Models.pdf) with the absolute-URL "Slides (PDF)" button.
- **AI Podcast** player block (user-provided https://files.catbox.moe/6h3ivr.m4a) appended per
  the CLAUDE.md recipe + links entry.
- **Featured image**: user-provided `featured.webp` (the pipeline's auto `featured.png` was
  removed to avoid the `featured.*` ambiguity).
- **i18n**: ES + JA stub cards (`content/{es,ja}/post/python_dynamic_panel/index.md`);
  `scripts/i18n-parity.sh` → 0 gaps (88/88 post stubs).

## Reviews

Every stage passed its review skill with verdict ACCEPT: review-script (2 MEDIUM fixed),
review-results-report (2 LOW fixed), review-post (2 MEDIUM + LOWs fixed), review-infographic
(LOWs fixed), review-app (1 MED slider touch-target + label fixes applied).

## Build verification

Hugo 0.111.3 extended (`/tmp/hugo-verify/hugo`), `--gc --minify --buildFuture`: clean build,
all 10 link buttons render, podcast player present, slides/web_app/zip/pdf/csv resources
emitted, ES/JA homepage cards link to the English post.

## Gotchas for future sessions

- `content/post/python_dynamic_panel/referenceMaterials/` (pydynpd source) and
  `references/.venv` are gitignored; a leftover `references/.venv` BREAKS local Hugo builds
  (Hugo walks gitignored dirs) — delete or park it before building locally. Netlify unaffected.
- pydynpd 0.2.2 + NumPy ≥2 requires the compat shim (see script.py section 0a); re-test if
  pydynpd ever updates.
