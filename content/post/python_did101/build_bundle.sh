#!/usr/bin/env bash
# Build content/post/<SLUG>/<SLUG>.zip from the tutorial sources.
# Re-run whenever tutorial.qmd, setup_env.py, _quarto.yml, script.py, the
# render wrappers, the bundle README.md, the cheat sheets, analysis.do or the
# CSVs in data/ change, then commit the regenerated zip.

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
# The runnable companions, and the two CSVs flattened next to tutorial.qmd so
# the notebook, the cheat sheets and analysis.do all find them locally.
for f in cheatsheet_python.py cheatsheet_R.R cheatsheet_stata.do analysis.do; do
  cp "${POST_DIR}/${f}" "${STAGE_DIR}/"
done
cp "${POST_DIR}/data/tutoring_did.csv"      "${STAGE_DIR}/"
cp "${POST_DIR}/data/tutoring_didevent.csv" "${STAGE_DIR}/"
chmod +x "${STAGE_DIR}/render.command"

rm -f "${OUT_ZIP}"
( cd "$(dirname "${STAGE_DIR}")" && zip -rq -X "${OUT_ZIP}" "$(basename "${STAGE_DIR}")" -x '*.DS_Store' )
rm -rf "$(dirname "${STAGE_DIR}")"

echo "Built ${OUT_ZIP}"
unzip -l "${OUT_ZIP}"
