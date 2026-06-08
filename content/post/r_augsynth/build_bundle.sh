#!/usr/bin/env bash
# Build the downloadable Quarto project bundle r_augsynth.zip.
# Stages tutorial.qmd, analysis.R, the Kansas dataset, a minimal _quarto.yml and a
# README into a top-level folder, then zips it. Re-run after editing any source.
#
#   bash content/post/r_augsynth/build_bundle.sh
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SLUG="r_augsynth"
STAGE="$(mktemp -d)"
DEST="$STAGE/$SLUG"
mkdir -p "$DEST"

cp "$HERE/tutorial.qmd" "$DEST/tutorial.qmd"
cp "$HERE/analysis.R"   "$DEST/analysis.R"
cp "$HERE/kansas.csv"   "$DEST/kansas.csv"

cat > "$DEST/_quarto.yml" <<'YML'
project:
  type: default
YML

cat > "$DEST/README.md" <<'MD'
# r_augsynth — Quarto project

Executable companion to the blog post:

> **The Augmented Synthetic Control Method: A Beginner's Tutorial with the Kansas Tax Cuts**
> <https://carlos-mendez.org/post/r_augsynth/>

## Contents

| File | Purpose |
|------|---------|
| `tutorial.qmd` | Self-contained Quarto notebook — prose, code, output and figures inline. The render-and-read version of the tutorial. |
| `analysis.R` | Canonical companion script — the full analysis (10 figures + CSVs + results.json), runnable with `Rscript analysis.R`. |
| `kansas.csv` | The Kansas panel (50 states, 1990 Q1–2016 Q1) shipped with the `augsynth` package, written to CSV so the notebook runs offline. |
| `_quarto.yml` | Minimal Quarto project marker so Positron / RStudio open this folder as a recognised project. |

## Requirements

- **R ≥ 4.2** and **Quarto ≥ 1.4**.
- The `augsynth` package is **not on CRAN**. The `setup` chunk installs it from GitHub
  only if it is missing: `remotes::install_github("ebenmichael/augsynth")`.
  This requires an internet connection and a working compiler toolchain on first run.
  Verified with R 4.5.2 and augsynth 0.2.0.

## How to render

1. Open this folder in **Positron** or **RStudio**.
2. Open `tutorial.qmd` and click **Render** (or run `quarto render tutorial.qmd` from a
   terminal in this folder).
3. First render installs `augsynth` (a few minutes); later renders reuse it. The
   inference chunks refit the model ~150 times, so a full render takes a couple of minutes.
4. Output is `tutorial.html` plus a `tutorial_files/` figure directory.

## Run the canonical script directly

```bash
Rscript analysis.R
```

This regenerates all 10 figures, the result CSVs, and `web_app/data/results.json`.
MD

( cd "$STAGE" && zip -r -X "$HERE/$SLUG.zip" "$SLUG" >/dev/null )
rm -rf "$STAGE"
echo "Built $HERE/$SLUG.zip"
unzip -l "$HERE/$SLUG.zip"
