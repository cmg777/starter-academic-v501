#!/usr/bin/env bash
# Build content/post/python_sc_dsc_sdid/python_sc_dsc_sdid.zip
#
# Stages the bundle into a temp dir so the zip never picks up .venv/, caches,
# rendered HTML or macOS metadata. Re-run after editing tutorial.qmd,
# setup_env.py, analysis.py or cheatsheet_python.py, and commit the new zip in
# the same commit as the source change.
#
# Usage: bash content/post/python_sc_dsc_sdid/build_bundle.sh

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

# From the post root: the runnable companions and the data.
for f in analysis.py cheatsheet_python.py brexit_analysis.csv; do
  cp "${POST_DIR}/${f}" "${DEST}/${f}"
done

chmod +x "${DEST}/render.command"

# `zip -r` APPENDS to an existing archive, which silently keeps deleted entries
# alive across rebuilds. Remove first.
rm -f "${ZIP_PATH}"
( cd "${STAGE}" && zip -r -q -X "${ZIP_PATH}" "${SLUG}" -x '*.DS_Store' )

echo "built ${ZIP_PATH}"
unzip -l "${ZIP_PATH}"
