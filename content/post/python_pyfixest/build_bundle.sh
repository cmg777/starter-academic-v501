#!/usr/bin/env bash
# Build static/uploads/python_pyfixest_tutorial.zip from the tutorial sources.
# Re-run whenever tutorial.qmd, setup_env.py, _quarto.yml, script.py, or the
# bundle README.md changes, then commit the regenerated zip.

set -euo pipefail

POST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${POST_DIR}/../../.." && pwd)"
STAGE_DIR="$(mktemp -d)/python_pyfixest_tutorial"
OUT_ZIP="${REPO_ROOT}/static/uploads/python_pyfixest_tutorial.zip"

mkdir -p "${STAGE_DIR}" "$(dirname "${OUT_ZIP}")"
cp "${POST_DIR}/references/tutorial.qmd"   "${STAGE_DIR}/"
cp "${POST_DIR}/references/setup_env.py"   "${STAGE_DIR}/"
cp "${POST_DIR}/references/_quarto.yml"    "${STAGE_DIR}/"
cp "${POST_DIR}/references/README.md"      "${STAGE_DIR}/"
cp "${POST_DIR}/references/render.command" "${STAGE_DIR}/"
cp "${POST_DIR}/references/render.bat"     "${STAGE_DIR}/"
cp "${POST_DIR}/script.py"                 "${STAGE_DIR}/"
chmod +x "${STAGE_DIR}/render.command"

rm -f "${OUT_ZIP}"
( cd "$(dirname "${STAGE_DIR}")" && zip -rq "${OUT_ZIP}" "$(basename "${STAGE_DIR}")" )
rm -rf "$(dirname "${STAGE_DIR}")"

echo "Built ${OUT_ZIP}"
unzip -l "${OUT_ZIP}"
