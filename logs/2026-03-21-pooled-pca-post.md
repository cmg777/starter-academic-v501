# Pooled PCA Tutorial Post: Building Comparable Development Indicators Across Time

**Date:** 2026-03-21

## Summary

Added a sequel to the PCA tutorial (`content/post/python_pca2/`) demonstrating pooled PCA for constructing composite development indices that are directly comparable across time periods. Uses real Subnational Human Development Index data (153 regions, 12 South American countries, 2013 and 2019) from the Global Data Lab. Contrasts pooled vs per-period PCA, validates against the official SHDI, and includes spatial applications (choropleth maps, Gini inequality analysis).

## Key files

- `content/post/python_pca2/index.md` -- full tutorial (~1370 lines, 21 sections)
- `content/post/python_pca2/notebook.ipynb` -- Colab-ready Jupyter notebook (76 cells)
- `content/post/python_pca2/script.py` -- standalone Python script
- `content/post/python_pca2/infographic_instructions.md` -- chalkboard infographic AI prompt
- `content/post/python_pca2/data.csv` -- Subnational HDI dataset (153 regions, wide format)
- `content/post/python_pca2/data.geojson` -- sub-national boundaries for choropleth maps
- `content/post/python_pca2/hdi_panel_data.csv` -- reshaped panel data (306 rows)
- `content/post/python_pca2/pc1_index_results.csv` -- final pooled PCA results
- `content/post/python_pca2/*.png` -- 13 dark-theme figures (navy background palette)

## Post structure

1. Overview and learning objectives
2. Pooled PCA pipeline (Mermaid diagram, 7 steps)
3. Setup and imports
4. Loading the Subnational HDI data (reshape wide to long, 306 rows)
5. Exploring raw data (country means, correlations, period shift scatter)
6. The problem: per-period PCA (shifting weights, rank instability)
7. Pooled Step 1: Stacking
8. Pooled Step 2: Pooled standardization (children's height analogy)
9. Pooled Step 3: Covariance matrix
10. Pooled Step 4: Eigen-decomposition (72.4% variance explained)
11. Pooled Step 5: Scoring
12. Pooled Step 6: Normalization
13. The contrast: pooled vs per-period PCA (16/153 direction disagreements)
14. Validation against official SHDI (R^2 = 0.9823 levels, 0.9964 changes)
15. Replicating with scikit-learn
16. Application: Space-time analyses (choropleths + Gini inequality)
17. Summary results table
18. Discussion
19. Summary and next steps (takeaways, limitations)
20. Exercises (3 problems)
21. References (9 sources)

## Distinguishing features vs Part 1

- **Real data** (Subnational HDI) instead of simulated data
- **Three indicators** (education, health, income) producing unequal eigenvector weights
- **Temporal comparison** as the central problem -- pooled vs per-period PCA
- **Running example** (City of Buenos Aires) traced through all steps
- **Validation** against the official SHDI (geometric mean methodology)
- **Spatial applications**: choropleth maps with fixed Fisher-Jenks breaks, Gini inequality dynamics with population weighting
- **Additional libraries**: geopandas, mapclassify, contextily, inequality, scipy

## Referee review and revisions

A full referee review was conducted (MAJOR REVISION verdict, code scored 4/10 due to missing variable definitions). Revisions applied:

1. Added `run_single_period_pca()` function definition in Section 6 (was called but never defined)
2. Added `df_p1`/`df_p2` variable assignments after per-period PCA
3. Added `compare` DataFrame construction and `df_pooled_p1`/`df_pooled_p2` definitions in Section 13
4. Added `GDLcode` and `pop` columns to the data reshape (needed for choropleth and weighted Gini)
5. Fixed incomplete mean changes code block (missing computation lines)
6. Fixed column selection mismatch in top/bottom 5 print statements
7. Updated stale output blocks: Fisher-Jenks breaks (0.449/0.581/0.73 vs old 0.42/0.568/0.697), class transitions (40/88/25 vs old 49/67/24), sklearn columns (10 vs 8)
8. Fixed `np.float64` display in Fisher-Jenks breaks by casting to `float()`

Post-revision proofread passed all 10 checks (PASS status, only LOW-severity observations).

## Data sources

- **Subnational Human Development Index**: Global Data Lab (Smits & Permanyer, 2019)
- **Geographic boundaries**: GeoJSON for 153 sub-national regions
- Both files loaded from GitHub raw URLs for reproducibility

## Key results

- PC1 captures 72.4% of variance (vs 96% in Part 1's simulated data)
- Income carries the highest eigenvector weight (0.620), followed by Education (0.564) and Health (0.545)
- Pooled PCA correlates at r = 0.991 with the official SHDI
- Per-period PCA disagrees on direction of change for 16/153 regions (10%)
- Education converged (Gini -0.0016) while income diverged (+0.0036) between 2013 and 2019
- 40 regions moved up a Fisher-Jenks class, 88 stayed, 25 declined
