#!/usr/bin/env bash
# Build content/post/<SLUG>/<SLUG>.zip from the tutorial sources.
# Re-run whenever tutorial.qmd, setup_env.py, _quarto.yml, script.py, the
# render wrappers, or the bundle README.md changes, then commit the
# regenerated zip.

set -euo pipefail

POST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SLUG="$(basename "${POST_DIR}")"
STAGE_DIR="$(mktemp -d)/${SLUG}"
OUT_ZIP="${POST_DIR}/${SLUG}.zip"

mkdir -p "${STAGE_DIR}"
cp "${POST_DIR}/references/tutorial.qmd"   "${STAGE_DIR}/"
cp "${POST_DIR}/references/setup_env.py"   "${STAGE_DIR}/"
cp "${POST_DIR}/references/_quarto.yml"    "${STAGE_DIR}/"
cp "${POST_DIR}/references/README.md"      "${STAGE_DIR}/"
cp "${POST_DIR}/references/render.command" "${STAGE_DIR}/"
cp "${POST_DIR}/references/render.bat"     "${STAGE_DIR}/"
cp "${POST_DIR}/script.py"                 "${STAGE_DIR}/"
cp -R "${POST_DIR}/data"                   "${STAGE_DIR}/"   # bundle the synthetic panels (offline-capable)
chmod +x "${STAGE_DIR}/render.command"

rm -f "${OUT_ZIP}"
( cd "$(dirname "${STAGE_DIR}")" && zip -rq "${OUT_ZIP}" "$(basename "${STAGE_DIR}")" )
rm -rf "$(dirname "${STAGE_DIR}")"

echo "Built ${OUT_ZIP}"
unzip -l "${OUT_ZIP}"
