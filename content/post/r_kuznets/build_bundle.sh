#!/usr/bin/env bash
# Build the downloadable Quarto project bundle r_kuznets.zip.
# Stages tutorial.qmd, analysis.R, a minimal _quarto.yml and a README into a
# top-level r_kuznets/ folder, then zips it. Re-run after editing any source file.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

STAGE="$(mktemp -d)/r_kuznets"
mkdir -p "$STAGE"
cp tutorial.qmd analysis.R "$STAGE/"
printf 'project:\n  type: default\n' > "$STAGE/_quarto.yml"

cat > "$STAGE/README.md" <<'MD'
# Spatial Inequality and the Kuznets Curve — Quarto project

Synthetic R replication of **Lessmann (2013)**, "Spatial inequality and development —
Is there an inverted-U relationship?" (*Journal of Public Economics* 106, 35–51).

## Render
```bash
quarto render tutorial.qmd
```
Open `tutorial.html` in a browser.

## Requirements
R ≥ 4.4 and Quarto ≥ 1.4. The setup chunk installs the needed packages via `pacman`:
`dplyr, tidyr, ggplot2, scales, fixest, sandwich, lmtest, splines, np, modelsummary`.

## Files
- `tutorial.qmd` — the runnable notebook (DGP → WCV → cross-section OLS → fixest TWFE →
  turning points → Robinson semiparametric → sectoral channel).
- `analysis.R` — the full canonical script (all figures, tables and CSV exports).
- `_quarto.yml` — minimal project config.

There is no real data: regional GDP is simulated and the WCV is computed from it, with the
data-generating process calibrated to reproduce the paper's published estimates.
MD

OUT="$HERE/r_kuznets.zip"
rm -f "$OUT"
( cd "$(dirname "$STAGE")" && zip -r -X "$OUT" r_kuznets \
    -x '*.DS_Store' -x '__MACOSX*' >/dev/null )
rm -rf "$(dirname "$STAGE")"
echo "Built $OUT"
unzip -l "$OUT"
