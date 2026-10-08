#!/usr/bin/env bash
# Build content/tutorials/python_sc101/python_sc101.zip from the tutorial sources.
# Run it again whenever tutorial.qmd, setup_env.py, _quarto.yml, script.py, the
# render wrappers, the bundle README.md, the cheat sheets, or the CSV in data/
# change, and then commit the new zip. Run regen_companions.py first, so that
# tutorial.qmd matches index.md.

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
# The runnable cheat sheets, and the data flattened next to tutorial.qmd, so the
# notebook, the script, and the cheat sheets all find it without a download.
for f in cheatsheet_python.py cheatsheet_R.R cheatsheet_stata.do; do
  cp "${POST_DIR}/${f}" "${STAGE_DIR}/"
done
cp "${POST_DIR}/data/smoking_sc.csv"       "${STAGE_DIR}/"
chmod +x "${STAGE_DIR}/render.command"

rm -f "${OUT_ZIP}"
( cd "$(dirname "${STAGE_DIR}")" && zip -rq -X "${OUT_ZIP}" "$(basename "${STAGE_DIR}")" -x '*.DS_Store' )
rm -rf "$(dirname "${STAGE_DIR}")"

echo "Built ${OUT_ZIP}"
unzip -l "${OUT_ZIP}"
