#!/usr/bin/env bash
# Package the Quarto tutorial bundle for python_fwl.
#
#   bash content/post/python_fwl/build_bundle.sh
#
# Rerun and commit this in the SAME commit as any edit to references/*, to the
# runnable companions, or to the data file below — otherwise the published .zip
# goes stale against the post.
set -euo pipefail

POST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SLUG="$(basename "${POST_DIR}")"
REF_DIR="${POST_DIR}/references"
DATA_DIR="${POST_DIR}/data"
ZIP_PATH="${POST_DIR}/${SLUG}.zip"

STAGE="$(mktemp -d)"
trap 'rm -rf "${STAGE}"' EXIT
DEST="${STAGE}/${SLUG}"
mkdir -p "${DEST}"

# From references/: the Quarto project itself.
for f in tutorial.qmd setup_env.py _quarto.yml render.command render.bat README.md; do
  cp "${REF_DIR}/${f}" "${DEST}/${f}"
done

# From the post root: the canonical script and the runnable companions.
for f in script.py cheatsheet_python.py cheatsheet_R.R cheatsheet_stata.do analysis.do; do
  cp "${POST_DIR}/${f}" "${DEST}/${f}"
done

# The dataset, flattened next to tutorial.qmd so the notebook (and the cheat
# sheets) find it locally once the archive is unzipped.
cp "${DATA_DIR}/fwl_store_data.csv" "${DEST}/fwl_store_data.csv"

chmod +x "${DEST}/render.command"

# `zip -r` APPENDS to an existing archive, which silently keeps deleted entries
# alive across rebuilds. Remove first.
rm -f "${ZIP_PATH}"
( cd "${STAGE}" && zip -r -q -X "${ZIP_PATH}" "${SLUG}" -x '*.DS_Store' )

echo "built ${ZIP_PATH}"
unzip -l "${ZIP_PATH}"
