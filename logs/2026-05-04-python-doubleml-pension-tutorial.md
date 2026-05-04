# python_doubleml_pension Tutorial

**Date:** 2026-05-04
**Post:** `content/post/python_doubleml_pension/`
**Status:** Complete (all 8 pipeline stages)

## What was done

Created a comprehensive Double Machine Learning tutorial using the 401(k) pension dataset from the 1991 SIPP survey. The tutorial covers three DML models (PLR, IRM, IIVM) with four ML learners each (Lasso, Random Forest, Decision Trees, XGBoost).

## Pipeline stages completed

1. **write-script** -- Created `script.py` (730 lines). Produces 6 PNG figures, 7 CSV tables. Executes cleanly with no warnings.
2. **review-script** -- Fixed: mid-script imports moved to top, added `plt.close()`, improved comments. Re-executed.
3. **write-results-report** -- Created `results_report.md` with 8 key findings, 7 interpretation paragraphs.
4. **review-results-report** -- ACCEPT (59/60). No fixes needed.
5. **write-post** -- Created `index.md` (~700 lines). Mode A (with existing materials). 11 interpretation paragraphs, 4 equations, 2 Mermaid diagrams, 6 figures, 4 analogies.
6. **review-post** -- MINOR REVISION. Fixed: IRM/IIVM code blocks (undefined variables), pip language tag, Mermaid non-palette color, grand comparison empty code block, categories.
7. **write-infographic** -- Created `infographic_instructions.md` with 4 sections (A/B/C/D), Story Spine, 6 panels.
8. **review-infographic** -- MINOR REVISION. Fixed: Panel 4 comparison metaphor (naive vs DML instead of 3 models), derived percentage language.

## Key results

- **Naive estimate:** $19,559 (eligibility), $27,372 (participation)
- **PLR ATE:** $7,823--$9,371 (mean $8,730)
- **IRM ATE:** $7,924--$8,559 (mean $8,213)
- **IIVM LATE:** $11,215--$12,281 (mean $11,746)
- **Confounding bias:** 124% overstated by naive estimate

## Relationship to existing content

- Separate from `python_doubleml` (Pennsylvania Bonus, PLR only)
- This post is more advanced: observational data, 3 models, IV approach, LATE vs ATE distinction

## Still needed

- `featured.jpg` or `featured.png` -- user adds manually
- Optional: `notebook.ipynb` for Google Colab
