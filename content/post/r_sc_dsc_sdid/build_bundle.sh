#!/usr/bin/env bash
# Build the downloadable Quarto project bundle r_sc_dsc_sdid.zip.
# Stages tutorial.qmd, analysis.R, cheatsheet.R, the estimation sample, a minimal
# _quarto.yml and a README into a top-level folder, then zips it.
# Re-run after editing any source.
#
#   bash content/post/r_sc_dsc_sdid/build_bundle.sh
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SLUG="r_sc_dsc_sdid"
STAGE="$(mktemp -d)"
DEST="$STAGE/$SLUG"
mkdir -p "$DEST"

cp "$HERE/tutorial.qmd"          "$DEST/tutorial.qmd"
cp "$HERE/analysis.R"            "$DEST/analysis.R"
cp "$HERE/cheatsheet.R"          "$DEST/cheatsheet.R"
cp "$HERE/brexit_analysis.csv"   "$DEST/brexit_analysis.csv"

cat > "$DEST/_quarto.yml" <<'YML'
project:
  type: default
YML

cat > "$DEST/README.md" <<'MD'
# r_sc_dsc_sdid — Quarto project

Executable companion to the blog post:

> **From DiD to SDID: A Ladder of Synthetic Control Estimators, and What Brexit Cost the UK**
> <https://carlos-mendez.org/post/r_sc_dsc_sdid/>

## Contents

| File | Purpose |
|------|---------|
| `tutorial.qmd` | Self-contained Quarto notebook — prose, code, output and figures inline. Climbs the whole ladder, hand-coding each estimator and then reproducing it with its package. |
| `analysis.R` | Canonical companion script — the full analysis (18 figures, 18 CSV tables, the placebo tournament, the robustness grid and permutation inference), runnable with `Rscript analysis.R`. |
| `cheatsheet.R` | The minimum code that produces every estimate, about 150 lines, runs in half a minute. |
| `brexit_analysis.csv` | The estimation sample: 24 OECD countries × 104 quarters (1995Q1–2020Q4), log real GDP plus six covariates, no missing values. |
| `_quarto.yml` | Minimal Quarto project marker so Positron / RStudio open this folder as a recognised project. |

## Requirements

- **R ≥ 4.2** and **Quarto ≥ 1.4**.
- CRAN: `quadprog`, `ggplot2`, `patchwork`. The notebook installs these if missing.
- Three packages are **not on CRAN**. The notebook renders without them (every
  estimate is also computed by hand), but `analysis.R` needs all three:

  ```r
  remotes::install_github("synth-inference/synthdid")
  remotes::install_github("ebenmichael/augsynth")
  ```

  `masc` declares a hard dependency on Gurobi, a commercial solver it never
  actually needs on the code path used here. Strip the dependency first:

  ```bash
  git clone --depth 1 https://github.com/maxkllgg/masc /tmp/masc_src
  sed -i '' 's/^    gurobi,$//' /tmp/masc_src/DESCRIPTION
  R CMD INSTALL /tmp/masc_src
  ```

- Verified with R 4.5.2, synthdid 0.0.9, augsynth 0.2.0, masc 0.1.1, Synth 1.1-10.

## How to render

1. Open this folder in **Positron** or **RStudio**.
2. Open `tutorial.qmd` and click **Render** (or run `quarto render tutorial.qmd`).
3. A full render takes under a minute — the notebook fits each estimator once on
   the headline specification.
4. Output is `tutorial.html` plus a `tutorial_files/` figure directory.

## Run the canonical script directly

```bash
Rscript analysis.R
```

This regenerates all 18 figures, every result CSV and `web_app/data/results.json`.
The first run takes roughly 25 minutes because `Synth`'s nested optimisation over
92 predictors is slow; results are cached to `cache/*.rds`, so later runs take
about two minutes. Set `FORCE_REFIT=1` to invalidate the cache.

## The data

`brexit_analysis.csv` is a re-encoding of the MATLAB file shipped with the
replication package of de Brabander, Juodis & Miyazato Szini (2025),
<https://doi.org/10.1080/07474938.2025.2530649>, which in turn builds on the
dataset of Born, Müller, Schularick & Sedláček (2019),
<https://doi.org/10.1093/ej/uez020>. Please cite both.
MD

( cd "$STAGE" && zip -r -X "$HERE/$SLUG.zip" "$SLUG" >/dev/null )
rm -rf "$STAGE"
echo "Built $HERE/$SLUG.zip"
unzip -l "$HERE/$SLUG.zip"
