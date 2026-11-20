#!/usr/bin/env bash
# Package the Quarto tutorial bundle for python_sc_bayes_spatial.
#
#   bash content/tutorials/python_sc_bayes_spatial/build_bundle.sh
#
# Rerun and commit this in the SAME commit as any edit to references/* or to
# the runnable companions below, or the published .zip goes stale.
set -euo pipefail

POST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SLUG="$(basename "${POST_DIR}")"
REF_DIR="${POST_DIR}/references"
ZIP_PATH="${POST_DIR}/${SLUG}.zip"

STAGE="$(mktemp -d)"
trap 'rm -rf "${STAGE}"' EXIT
DEST="${STAGE}/${SLUG}"
mkdir -p "${DEST}"

# From references/: the Quarto project itself.
for f in tutorial.qmd setup_env.py _quarto.yml render.command render.bat README.md; do
  cp "${REF_DIR}/${f}" "${DEST}/${f}"
done

# From the post root: the runnable companions and the data the tutorial reads
# when scspill is unavailable.
# The result tables tutorial.qmd reads back (its `data()` helper finds them
# beside itself once unzipped).
for f in analysis.py cheatsheet_python.py source_data.csv spatial_W.csv \
         scspill_departures.csv stage2_alpha_posterior.csv \
         stage3_spillover_effects.csv att_ladder.csv; do
  cp "${POST_DIR}/${f}" "${DEST}/${f}"
done

# The figures. tutorial.qmd lives in references/ in the repository and points one
# level up (../python_sc_bayes_spatial_NN_*.png); in the bundle the figures sit
# beside it, so rewrite those paths in the bundled copy only.
cp "${POST_DIR}"/${SLUG}_[0-9][0-9]_*.png "${DEST}/"
sed -i.bak "s#(\.\./${SLUG}_#(${SLUG}_#g" "${DEST}/tutorial.qmd" && rm -f "${DEST}/tutorial.qmd.bak"

chmod +x "${DEST}/render.command"

# `zip -r` APPENDS to an existing archive, which silently keeps deleted entries
# alive across rebuilds. Remove first.
rm -f "${ZIP_PATH}"
( cd "${STAGE}" && zip -r -q -X "${ZIP_PATH}" "${SLUG}" -x '*.DS_Store' )

echo "built ${ZIP_PATH}"
unzip -l "${ZIP_PATH}"
