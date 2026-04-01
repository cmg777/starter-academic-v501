# README Template

> This file is part of the `write-script` skill. Read this file when
> generating the README.md in the post directory after script execution.

## Template

Generate a `README.md` in the post directory with this exact structure.
Replace placeholders `<...>` with actual values from the execution.

```markdown
# <Post Title>

**Status:** Script executed successfully
**Language:** <Python / R / Stata>
**Last run:** <YYYY-MM-DD>

## Overview

<1-2 sentences: topic, dataset, methods, key improvement or novelty>

## Pipeline Progress

- [x] Script (`<script filename>`) -- executed
- [ ] Results report (`results_report.md`) -- pending
- [ ] Blog post (`index.md`) -- pending
- [ ] Infographic (`infographic_instructions.md`) -- pending

## Generated Figures

| # | File | Description |
|---|------|-------------|
| 1 | `<filename>.png` | <1-sentence description> |
| 2 | `<filename>.png` | <1-sentence description> |
| ... | ... | ... |

## Generated Tables (CSV)

| # | File | Description |
|---|------|-------------|
| 1 | `<filename>.csv` | <1-sentence description> |
| 2 | `<filename>.csv` | <1-sentence description> |
| ... | ... | ... |

## Datasets

| File | Rows | Cols | Description |
|------|------|------|-------------|
| `<source_data>.csv` | <N> | <M> | <Raw data from package/URL> |
| `<processed_data>.csv` | <N> | <M> | <Final processed dataset used in analysis> |

## Packages

- `<package1>` -- <purpose>
- `<package2>` -- <purpose>
```

## Guidelines

- **Status** reflects the most recent pipeline step completed
- **Pipeline Progress** uses `[x]` for completed steps, `[ ]` for pending
- **Figures table** lists every PNG in the directory (except `featured.png`/`featured.webp`)
- **Tables table** lists every CSV in the directory
- **Datasets table** lists only data CSVs (source + processed), with actual row/column counts
- **Packages** lists only primary packages (not transitive dependencies)

## Downstream skill updates

Each downstream skill updates the README when it runs:
- `write-results-report`: marks `[x] Results report`, adds results_report.md to files
- `write-post`: marks `[x] Blog post`, adds index.md to files
- `write-infographic`: marks `[x] Infographic`, adds infographic_instructions.md to files
