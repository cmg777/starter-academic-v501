# Script Structure Templates

> This file is part of the `write-script` skill. Read this file when
> writing the script file.

## Python script template

```python
"""
<Tutorial Title>: <Topic> Case Study

<One-paragraph description of what the script does, what dataset it uses,
and what methods it applies.>

Usage:
    python script.py

Output:
    - <slug>_*.png figures saved to current directory
    - Console output with summary statistics and results

References:
    - <URL 1>
    - <URL 2>
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Site color palette
STEEL_BLUE = "#6a9bcc"
WARM_ORANGE = "#d97757"
NEAR_BLACK = "#141413"
TEAL = "#00d4c8"

# Data config
DATA_URL = "https://..."
CACHE_PATH = Path("data.csv")
TARGET = "outcome_column"
FEATURE_COLS = ["col1", "col2", "col3"]

# ── Data Loading ──────────────────────────────────────────────────

# ... load and cache data ...
# print(f"Dataset shape: {df.shape}")
# print(df.describe())

# ── Exploratory Data Analysis ─────────────────────────────────────

# ... EDA code with at least 1 figure ...

# ── Baseline / Simple Approach ────────────────────────────────────

# ... establish a benchmark ...

# ── Core Method ───────────────────────────────────────────────────

# ... main analysis ...

# ── Results and Comparison ────────────────────────────────────────

# ... summary table, comparison chart ...

# ── Robustness / Validation ───────────────────────────────────────

# ... sensitivity checks ...

print("\\n=== Script completed successfully ===")
```

## Stata script template

```stata
/*─────────────────────────────────────────────────────────────────
  <Tutorial Title>: <Topic> Case Study

  <One-paragraph description>

  Usage: do analysis.do
  Output: <slug>_*.png figures, analysis.log

  References:
    - <URL 1>
─────────────────────────────────────────────────────────────────*/

clear all
set more off
set seed 42

// ── Install dependencies (capture to avoid errors if installed) ──
capture ssc install <package1>
capture ssc install <package2>

// ── Start log ────────────────────────────────────────────────────
capture log close
log using "analysis.log", replace text

// ── Data loading ─────────────────────────────────────────────────
preserve
use "data.dta", clear
describe
summarize

// ── Analysis ─────────────────────────────────────────────────────

// ... analysis code ...

// ── Figures ──────────────────────────────────────────────────────

// graph export "<slug>_<name>.png", replace width(2400)

// ── Clean up ─────────────────────────────────────────────────────
restore
log close
```

## R script template

```r
# ══════════════════════════════════════════════════════════════════
# <Tutorial Title>: <Topic> Case Study
#
# <One-paragraph description of what the script does, what dataset
# it uses, and what methods it applies.>
#
# Usage:  Rscript analysis.R
# Output: <slug>_*.png figures + *.csv tables in current directory
#
# References:
#   - <URL 1>
#   - <URL 2>
# ══════════════════════════════════════════════════════════════════


# ── 0. Setup ─────────────────────────────────────────────────────

required_packages <- c("<pkg1>", "<pkg2>", "tidyverse", "scales")
missing <- required_packages[!sapply(required_packages, requireNamespace, quietly = TRUE)]
if (length(missing) > 0) {
  install.packages(missing, repos = "https://cloud.r-project.org")
}

library(<pkg1>)
library(tidyverse)
library(scales)

set.seed(42)

# Site color palette
STEEL_BLUE   <- "#6a9bcc"
WARM_ORANGE  <- "#d97757"
NEAR_BLACK   <- "#141413"
TEAL         <- "#00d4c8"

# Dark theme palette (if theme: dark)
DARK_BG      <- "#0f1729"
DARK_PANEL   <- "#1f2b5e"
LIGHT_TEXT   <- "#c8d0e0"
LIGHTER_TEXT <- "#e8ecf2"

# Variable labels for human-readable axis labels
VAR_LABELS <- c(
  var1 = "Descriptive Name 1",
  var2 = "Descriptive Name 2"
)

# Custom ggplot2 dark theme (if theme: dark)
theme_site <- function(base_size = 14) {
  theme_minimal(base_size = base_size) %+replace%
    theme(
      text             = element_text(color = LIGHTER_TEXT),
      plot.title       = element_text(color = LIGHTER_TEXT, face = "bold", size = rel(1.1)),
      plot.subtitle    = element_text(color = LIGHT_TEXT, size = rel(0.85)),
      plot.background  = element_rect(fill = DARK_BG, color = NA),
      panel.background = element_rect(fill = DARK_BG, color = NA),
      panel.grid.major = element_line(color = DARK_PANEL, linewidth = 0.3),
      panel.grid.minor = element_blank(),
      axis.text        = element_text(color = LIGHT_TEXT),
      legend.position  = "bottom",
      legend.background = element_rect(fill = DARK_BG, color = NA),
      legend.key       = element_rect(fill = DARK_BG, color = NA),
      legend.text      = element_text(color = LIGHT_TEXT),
      legend.title     = element_text(color = LIGHTER_TEXT),
      strip.text       = element_text(color = LIGHTER_TEXT, face = "bold")
    )
}


# ── 1. Data Loading ──────────────────────────────────────────────

cat("\n========================================\n")
cat("1. DATA LOADING\n")
cat("========================================\n")

# ... load data ...
# cat("Dimensions:", dim(df), "\n")
# print(head(df, 8))
# print(summary(df))

# Export source datasets
# write_csv(df, "<source_data>.csv")


# ── 2. Data Preparation ─────────────────────────────────────────

# ... transform, scale, demean ...
# Export processed dataset
# write_csv(data_prepared, "data_prepared.csv")


# ── 3. Baseline / Benchmark ─────────────────────────────────────

# ... simple model for comparison ...
# Export results
# write_csv(results_df, "<benchmark>_results.csv")


# ── 4. Core Method ───────────────────────────────────────────────

# ... main analysis ...
# Export results
# write_csv(main_results_df, "<method>_results.csv")


# ── 5. Results and Comparison ────────────────────────────────────

# ... summary table, comparison chart ...


# ── 6. Robustness / Sensitivity ──────────────────────────────────

# ... alternative specifications, sensitivity checks ...
# Export sensitivity table
# write_csv(sensitivity_df, "sensitivity.csv")


# ── 7. Visualizations ───────────────────────────────────────────

# ... custom ggplot2 figures ...
# ggsave("<slug>_<name>.png", plot, width = 9, height = 5.5, dpi = 300, bg = DARK_BG)


# ── 8. Summary ───────────────────────────────────────────────────

cat("\nGenerated PNG files:\n")
print(list.files(pattern = "\\.png$"))

cat("\nGenerated CSV files:\n")
print(list.files(pattern = "\\.csv$"))

cat("\n=== Script completed successfully ===\n")
```

### R-specific conventions

- **Package installation:** Use `required_packages` vector + `requireNamespace()` check (more robust than `pacman::p_load()` for scripts run via `Rscript`)
- **Dark theme:** Define `theme_site()` once at the top; apply to all ggplot2 figures; use `ggsave(..., bg = DARK_BG)` to set background
- **Variable labels:** Define `VAR_LABELS` named vector at the top for human-readable axis text; use `VAR_LABELS[var_name]` in plots
- **Section headers:** Use `cat("\n========================================\n")` with section names for clear execution log structure
- **CSV exports:** Export inline after each analysis section (not batched at the end)
- **Rplots.pdf cleanup:** R's `png()` function can leave an `Rplots.pdf` artifact; delete it in the verify step

## General conventions (all languages)

- **Docstring/header:** Always include title, description, usage, outputs, and references
- **Configuration block:** Define RANDOM_SEED, colors, data paths, and column names near the top
- **Section dividers:** Use comment dividers (`# ──`) to separate logical sections (numbered 0-N)
- **Print statements:** Print key results, shapes, and statistics for the execution log
- **Figure naming:** Use `<slug>_<descriptive_name>.png` pattern
- **CSV naming:** Use `<descriptive_name>.csv` — lowercase, underscores, no slug prefix for tables
- **No featured.png:** Do not generate featured images (user adds manually)
- **Variable labels:** Define a mapping from abbreviated variable names to human-readable labels (used in figures and tables)

## CSV export conventions

Export all intermediate and final outputs as CSV files in the post root directory (same location as PNGs). This makes downstream skills (write-results-report, write-post) more reliable — they read structured CSVs instead of parsing console output.

**What to export:**

| Category | When to export | Naming pattern | Example |
|----------|---------------|----------------|---------|
| Source datasets | After loading | `<dataset_name>.csv` | `economic_growth.csv` |
| Processed data | After final transformation | `data_prepared.csv` | `data_prepared.csv` |
| Regression results | After each model | `<method>_results.csv` | `fe_regression.csv` |
| Model comparison | After BMA/ensemble | `<method>_<prior>.csv` | `bma_binomial.csv` |
| Sensitivity tables | After sensitivity analysis | `<analysis>_sensitivity.csv` | `prior_sensitivity.csv` |
| Jointness/correlation | After pairwise analysis | `<measure>_matrix.csv` | `jointness_hcghm.csv` |

**Timing:** Export inline immediately after each analysis section produces results — not batched at the end. This ensures partial runs still produce usable output.

**Row names:** Use `rownames_to_column("variable")` (R) or `reset_index()` (Python) before exporting so row labels are preserved as a column.
