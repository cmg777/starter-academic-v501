#!/usr/bin/env bash
# Independently re-run every R and Python replication script and report status.
# Usage: bash _verification/30_run_all_rpy.sh
set -u
REP="/Users/carlosmendez/Documents/GitHub/00DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants/replication"
PY="/tmp/lessmann-venv/bin/python"

declare -a FOLDERS=(00_Main_Dataset Table_1 Table_2 Table_3 Table_4 Table_B4 \
  Figure_1 Figure_2 Figure_3 Figure_4 Figure_5 Figure_A1 Figure_A2 Figure_A3 \
  Figure_A4 Figure_B1 Figure_B3)

printf "%-16s | %-6s | %-6s | %s\n" FOLDER R Python "headline"
printf -- "---------------------------------------------------------------\n"
for d in "${FOLDERS[@]}"; do
  cd "$REP/$d" || continue
  # base script name: run_all for pipeline, else the folder name
  if [ "$d" = "00_Main_Dataset" ]; then base="run_all"; else base="$d"; fi
  rstat="-"; pstat="-"; head=""
  if [ -f "$base.R" ]; then
    if out=$(Rscript "$base.R" 2>/tmp/rerr); then rstat="OK"; else rstat="FAIL"; fi
    head=$(echo "$out" | grep -iE "^R *\||cubic|countries=|matched=|beta\[|DONE R|corr|slope|points" | tail -1)
  fi
  if [ -f "$base.py" ]; then
    if out=$("$PY" "$base.py" 2>/tmp/pyerr); then pstat="OK"; else pstat="FAIL"; fi
  fi
  printf "%-16s | %-6s | %-6s | %s\n" "$d" "$rstat" "$pstat" "$head"
  [ "$rstat" = "FAIL" ] && echo "   R err: $(tail -2 /tmp/rerr | tr '\n' ' ')"
  [ "$pstat" = "FAIL" ] && echo "   PY err: $(tail -2 /tmp/pyerr | tr '\n' ' ')"
done
