# 2026-06-13 — Random Forest tutorial re-engineered around cross-validation

Major content redesign of `content/post/python_ml_random_forest/` ("Introduction to
Machine Learning: Random Forest Regression"). The tutorial moved from an 80/20
train/test split + RandomizedSearchCV narrative to a **5-fold cross-validation**
narrative built on out-of-fold (OOF) predictions for all 339 Bolivian municipalities.

## What changed and why

The old post evaluated on a single 68-point test set and devoted a whole section to
hyperparameter tuning that barely moved the result. For a small sample (n=339) a single
split is noisy and wasteful, and the tuning detour distracted from the core lesson. The
redesign makes CV the spine and demotes the split and tuning to appendices.

### `index.md` (full rewrite)
- **All sections numbered** (`## 1.`, `### 1.1`; appendices `Appendix A` / `Appendix B`;
  Abstract & References unnumbered). Added `diagram: true` for mermaid.
- New **§2 Key learning objectives** section (was embedded in the old Overview).
- Two **mermaid diagrams**: the end-to-end workflow (§1.3) and the 5-fold rotation (§7.2).
  Verified they render via the theme's `.language-mermaid` JS (same wrapping as `stata_rct`).
- **§7 Cross-validation** introduces k-fold + `cross_val_predict` (OOF for every town).
- **§8** per-fold R²/RMSE/MAE table + the "why the standard deviation matters" figure;
  **§8.3** pooled-vs-averaged R² and a repeated-k-fold note.
- **§9** OOF scatter (all 339, colored by fold) + residuals; **§10** predicted-vs-actual
  distribution overlap + KS test (variance compression / regression to the mean).
- Feature importance / PDP recomputed on a baseline RF fit on all 339 rows.
- **Appendix A** — the demoted train/test split + a 200-seed variability demo.
- **Appendix B** — grid search vs random search vs **Optuna** (TPE), per the user's request.

### Key numbers (from the rerun, source of truth `ml_summary.json`)
- Per-fold R²: `[0.21, 0.12, −0.03, 0.45, 0.37]`, mean **0.224 ± 0.173**; pooled OOF R² **0.225**
  (RMSE 5.95, MAE 4.42).
- Distribution: actual SD 6.77 → predicted SD 3.54 (48% compression); KS 0.186, p < 0.001.
- Importance: **A30** dominates (perm ≈ 0.25), A59 second; PDP top-6 A30/A59/A26/A36/A13/A33.
- Tuning: baseline CV 0.224 → grid 0.244 → random 0.248 → Optuna 0.251 (gain < the fold SD).
- Appendix A: across 200 random 80/20 splits the test R² ranges −0.09 to 0.46.

### `script.py` (rewrite + rerun)
KFold(5) / `cross_validate` / `cross_val_predict`; per-fold metrics; pooled OOF; distribution
overlap + `ks_2samp`; importance/PDP on a full-data baseline; Appendix A split-variability
loop; Appendix B grid/random/Optuna. Regenerated 12 figures + 5 CSVs + `ml_summary.json`.
Runs clean in ~5 min on the modern stack (sklearn 1.8.0, optuna 4.7.0).

### Quarto bundle (`references/`)
`tutorial.qmd` rewritten to mirror the new structure (executable chunks). `setup_env.py`
**PINNED bumped** to the stack that produced the published numbers (numpy 2.4.3, pandas 3.0.1,
scikit-learn 1.8.0, scipy 1.17.1, matplotlib 3.10.8, optuna 4.7.0) so the bundle reproduces the
post; Python floor raised 3.10 → **3.11** (numpy 2.4 / pandas 3.0 dropped cp310) in
`setup_env.py` + `README.md`. Rebuilt `python_ml_random_forest.zip`. (A full Quarto render is a
multi-minute hermetic-venv build — recommended manual check before relying on the bundle.)

### Slides (`slides/slides.qmd`)
Rewrote the 3-act deck for the CV narrative (split slide → CV + OOF; "tuning buys 2 points" →
per-fold spread + distribution overlap + a single Appendix-B tuning slide). Re-rendered
`index.html` + `slides_files/`. Verified: all 9 figures referenced, CV numbers present, no stale
numbers. **The AI Slides PDF (`Mapping_Bolivian_Development_with_Satellites.pdf`) is externally
generated (NotebookLM/Gemini) and is now stale — needs manual regeneration.**

### Web app (`web_app/`)
Replaced the repurposed LASSO/double-lasso template (Sparsity Lab, L1-vs-L2, RF-vs-Linear
Showdown — tangential to this post) with a focused **4-tab CV app**: (1) cross-validation fold
diagram, (2) per-fold metrics with mean±SD, (3) OOF scatter colored by fold + distribution
overlay, (4) feature importance (MDI/permutation) + tuning comparison. New `data/results.json`
contract (model_summary, fold_metrics, oof[339], importance, tuning) generated from
`ml_summary.json`. Removed dead `dgp.js` / `lasso.js`. Headless-Chrome smoke test: all four tabs
render (25 / 6 / 339 / 24 SVG elements), no load errors, deep-link via `#pane-*` hash.

### i18n
ES/JA stub `summary` updated to the CV framing (title unchanged); stubs remain card-only
`_build: render: never` per convention. `scripts/i18n-parity.sh` unaffected (post stubs already
present).

## Outstanding / manual follow-ups
- **Colab notebook** (`~/GitHub/claude4data/notebooks/notebook-04.ipynb`, a separate repo): NOT
  yet updated. It is a jupytext-paired MyST notebook with 480 KB of embedded outputs; updating it
  correctly means rewriting `notebook-04.md` to the new CV structure (+ a `!pip install optuna`
  Colab cell) and regenerating the `.ipynb`, then re-executing in Colab to refresh outputs.
  Deferred to avoid shipping a notebook with new text but stale output figures.
- **AI Slides PDF** and **AI Podcast `.m4a`** (catbox) are externally generated and now stale —
  regenerate manually if desired.
