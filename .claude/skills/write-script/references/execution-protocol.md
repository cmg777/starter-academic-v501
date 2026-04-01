# Script Execution Protocol

> This file is part of the `write-script` skill. Read this file when
> executing the script and capturing outputs.

## Execution steps

### 1. Pre-execution checks

- Verify the script file exists and has no syntax errors
- Check that required data files are accessible (URLs reachable, local files exist)
- Identify required Python packages and verify they are installed

### 2. Execute the script

**Python:**
```bash
cd content/post/<slug>/ && python3 script.py 2>&1 | tee execution_log.txt
```

**Stata:**
```bash
cd content/post/<slug>/ && stata -b do analysis.do
# Log is written to analysis.log by the do-file itself
```

**R:**
```bash
cd content/post/<slug>/ && Rscript analysis.R 2>&1 | tee execution_log.txt
```

### 3. Capture and verify outputs

After execution, verify:

1. **Exit code:** Script completed without errors (exit code 0)
2. **Figures generated:** List all `.png` files in the directory
   ```bash
   ls -la *.png
   ```
3. **Figure count:** At least 3 PNG files (excluding featured.png)
4. **Log completeness:** execution_log.txt contains the final "Script completed successfully" message
5. **No warnings:** Check for deprecation warnings, convergence warnings, or other issues in the log

### 4. Handle execution errors

If the script fails:

1. **Read the error message** from execution_log.txt or stderr
2. **Fix the script** -- common issues:
   - Missing package: add `pip install` or `import` fix
   - Data URL unavailable: switch to cached data or alternative URL
   - Memory error: reduce dataset size or use chunked processing
   - Deprecated API: update to current API
3. **Re-execute** and verify again
4. **Do not deliver a script that does not execute cleanly**

### 5. Post-execution summary

After successful execution, report to the user:

```
Script executed successfully.
- Execution time: X seconds
- Figures generated: N PNG files
  - <slug>_eda.png
  - <slug>_results.png
  - ...
- Log saved: execution_log.txt (N lines)
- Warnings: none / [list warnings]
```

## R-specific post-execution cleanup

R's `png()` function can leave an `Rplots.pdf` artifact in the working
directory. After execution, check for and remove it:

```bash
rm -f content/post/<slug>/Rplots.pdf
```

## R warning classification

R scripts commonly produce warnings that are NOT errors. Classify them:

| Warning | Severity | Action |
|---------|----------|--------|
| "package X was built under R version Y" | Non-fatal | Ignore (version mismatch) |
| "object masked from package:X" | Expected | Ignore (normal with tidyverse) |
| "NAs introduced by coercion" | Investigate | Check if data loss occurred |
| "convergence warning" | Report | Flag in execution summary |
| "Error in ..." / "r(NNN)" | Fatal | Fix and re-execute |

## Verification report

After execution, display a clean verification checklist to the user:

```
VERIFICATION REPORT
-------------------
[PASS] Script file exists (<filename>)
[PASS] Execution log complete (N lines)
[PASS] N PNG figures generated (>= 3 required)
[PASS] N CSV files exported
[PASS] No errors in log
[PASS] Site colors used in custom figures
[PASS] DPI = 300 on all custom figures
[PASS] No featured.png generated
[PASS] RANDOM_SEED = 42 set
[PASS] Final success message present
[WARN] Rplots.pdf found -- cleaned up
[WARN] N non-fatal warnings (version mismatch, masking)
```

Report `[FAIL]` for any check that does not pass. If any check fails,
describe the issue and suggest a fix before delivering.

## Package installation

If the script requires packages not in the standard environment:

**Python:** Install via pip before execution
```bash
pip install <package1> <package2>
```

**R:** The script template uses `requireNamespace()` + `install.packages()` for missing packages

**Stata:** The script template uses `capture ssc install` which is idempotent
