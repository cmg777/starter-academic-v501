# 2026-06-10 — New tutorial: Aceh tsunami (DiD + synthetic control)

Built `content/post/python_did_sc_tsunami/` end-to-end through the data-science
pipeline (write/review pairs) plus the three optional artifacts.

## What it is

A beginner causal-inference case study on **evaluating the economic impact of a
localized natural disaster**, inspired by and based on **Heger & Neumayer (2019)**
on the 2004 Indian Ocean tsunami in Aceh. Runs on **synthetic, calibrated** data
(the paper's real micro-data is licensed) — signs/significance match the paper;
magnitudes are close (a reproduction-audit table in §11 of the post is explicit
about the small gaps). Source material lives in the **gitignored** `reference/`
folder (paper PDF + replication code + the two synthetic panels + data dicts).

## Methods covered (pedagogically simplified from the replication)

- Dynamic 4-period **difference-in-differences** on district GDP growth (`pyfixest`):
  2005 = −0.0792\*\*\*, recovery 2006–08 = +0.0628\*\* (Conley-HAC SE).
- **Event study** (`diff-diff`): flat pre-trend, the dip-then-overshoot path.
- **Night-lights dose-response** (sub-district): +0.016\*\*\* recovery; only the top
  intensity quintile significant.
- **Synthetic control** (`mlsynth.VanillaSC`): pre-RMSE 0.485, ATT +18.3%.
- **Conley spatial-HAC standard errors** + Moran's I (+0.065, p 0.003): recovery SE
  0.0146→0.0244, turning a spurious *** into an honest **.
- Robustness: placebo (neighbours, null), city vs rural, GDP per capita.

## Deliverables (all in the post bundle)

- `script.py` (dark theme, seed 42) → 11 figures + 16 result CSVs + `execution_log.txt`.
- `results_report.md` (reproduction-audit appendix), `index.md` (notebook-style,
  4 display equations, 7 toggle-card concepts, Mermaid), `notebook.ipynb` (Colab).
- Review reports: `script-review.md`, `results_report_review.md`, `post-review.md`.
- **Quarto bundle** `python_did_sc_tsunami.zip` (hermetic `setup_env.py`, pins 3.11–3.13,
  installs `mlsynth` from a pinned git commit; bundles `data/` for offline render).
- **Interactive web app** `web_app/` — 4 D3 tabs: parallel-trends animation, forest plot
  of the real estimates, a tsunami DGP simulator (small-N fragility), and a
  naive-vs-Conley SE explorer. All four tabs verified rendering (headless Chrome).
- **ES/JA stub cards** (`content/es|ja/post/python_did_sc_tsunami/`); `i18n-parity.sh`
  reports 87/87 posts, 0 gaps.
- **Slides (PDF)** button → `Natural_Disaster_Causal_Inference.pdf` (deck shipped in the
  bundle; absolute-URL `links:` entry so it opens in a new tab).
- **AI Podcast** player appended to `index.md` (audio `https://files.catbox.moe/z33l1y.m4a`),
  with a `#podcast-player` `links:` entry — verified opening with the correct title.
- A featured chalkboard infographic was added for the header (image-first `placement: 3`).

## Status

Built, verified, and **committed + pushed to `master`** on 2026-06-10 (Netlify auto-deploys
the post to carlos-mendez.org). The copyrighted `reference/` folder stayed gitignored.

## Notes / gotchas

- Local Hugo builds needed the Wowchemy modules re-fetched (`go mod download all`)
  and, because the on-machine Go (1.25) is newer than Hugo 0.111 expects, a one-off
  `_vendor/` of the cached theme modules so Hugo didn't shell out to `go`. The
  `_vendor/` was removed after verification (production builds on Netlify are
  unaffected). Verified clean build with `/tmp/hugo-verify/hugo` (0.111.3) + `--buildFuture`.
- `mlsynth` is git-only and pulls `jax`; `numba`/`llvmlite` pinned to the last Intel
  (x86_64) wheels (0.62.1 / 0.45.0). No `featured.png` (Carlos adds it manually) —
  add it to all three language bundles when ready.
- Nothing committed; changes left in the working tree for review.
