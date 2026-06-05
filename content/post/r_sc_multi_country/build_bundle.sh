#!/usr/bin/env bash
# Build the downloadable Quarto project bundle r_sc_multi_country.zip.
# Stages tutorial.qmd, analysis.R, the EMU dataset, a minimal _quarto.yml and a
# README into a top-level folder, then zips it. Re-run after editing any source.
#
#   bash content/post/r_sc_multi_country/build_bundle.sh
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SLUG="r_sc_multi_country"
STAGE="$(mktemp -d)"
DEST="$STAGE/$SLUG"
mkdir -p "$DEST/reference"

cp "$HERE/tutorial.qmd"                      "$DEST/tutorial.qmd"
cp "$HERE/analysis.R"                         "$DEST/analysis.R"
cp "$HERE/reference/dataset_revision_1.dta"  "$DEST/reference/dataset_revision_1.dta"

cat > "$DEST/_quarto.yml" <<'YML'
project:
  type: default
YML

cat > "$DEST/README.md" <<'MD'
# r_sc_multi_country — Quarto project

Executable companion to the blog post:

> **Augmented Synthetic Control for Many Countries: A Tutorial with augsynth**
> <https://carlos-mendez.org/post/r_sc_multi_country/>

## Contents

| File | Purpose |
|------|---------|
| `tutorial.qmd` | Self-contained Quarto notebook — prose, code, output and figures inline. The render-and-read version of the tutorial. |
| `analysis.R` | Canonical companion script — the full analysis (16 figures + CSVs), runnable with `Rscript analysis.R`. |
| `reference/dataset_revision_1.dta` | The Papaioannou (2021) EMU panel used in Part 2 (36 countries, 1980-2017). |
| `_quarto.yml` | Minimal Quarto project marker so Positron / RStudio open this folder as a recognised project. |

## Requirements

- **R ≥ 4.2** and **Quarto ≥ 1.4**.
- The `augsynth` package is **not on CRAN**. The `setup` chunk installs it from GitHub,
  pinned to commit `7a90ea4`, only if it is missing:
  `remotes::install_github("ebenmichael/augsynth@7a90ea4")`.
  This requires an internet connection and a working compiler toolchain on first run.
  Verified with R 4.5.2, augsynth 0.2.0, Synth 1.1.10.

## How to render

1. Open this folder in **Positron** or **RStudio**.
2. Open `tutorial.qmd` and click **Render** (or run `quarto render tutorial.qmd` from a
   terminal in this folder).
3. First render installs `augsynth` + `Synth` (a few minutes); later renders reuse them.
4. Output is `tutorial.html` plus a `tutorial_files/` figure directory.

## Run the canonical script directly

```bash
Rscript analysis.R
```

This regenerates all 16 figures, the reusable `synthetic_panel_multicountry.csv`, the
result CSVs, and `web_app/data/results.json`.
MD

( cd "$STAGE" && zip -r -X "$HERE/$SLUG.zip" "$SLUG" >/dev/null )
rm -rf "$STAGE"
echo "Built $HERE/$SLUG.zip"
unzip -l "$HERE/$SLUG.zip"
