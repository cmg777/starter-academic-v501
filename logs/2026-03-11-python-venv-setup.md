# Python Virtual Environment Setup

**Date:** 2026-03-11

## What was added

Set up a Python virtual environment using `uv` for running data science scripts locally.

## Files added

- `pyproject.toml` — project metadata and dependencies
- `uv.lock` — pinned dependency versions
- `.python-version` — Python 3.13 pin
- `.venv/` — virtual environment (gitignored)

## Dependencies

numpy, pandas, matplotlib, seaborn, scipy, scikit-learn, doubleml

These cover the packages used by existing data science posts (`python_ml_random_forest`, `python_doubleml`) and future posts created with the `data-science-post` skill.

## Usage

```bash
# Activate
source .venv/bin/activate

# Add a package
uv add <package>

# Sync environment from lockfile
uv sync

# Run a script
uv run python content/post/python_ml_random_forest/script.py
```

## Other changes in this commit

- `.gitignore` — added `.venv/`
- `content/post/python_ml_random_forest/index.md` — editorial improvements (hook question, additional learning objective, em dash fixes, output blocks)
