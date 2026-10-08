# Script Review — `python_did_sc_tsunami/script.py`

**Reviewed:** 2026-06-10 · **Reviewer:** review-script · **Verdict: ACCEPT**

Re-executed fresh (`python script.py`): **exit 0**, runtime ≈ 30 s, **0 warnings/errors**
in `execution_log.txt`, **11 PNG figures** + **16 result CSVs** produced, no
`featured.png`. All headline numbers reproduce the reference replication
(`reference/replication/`) exactly.

## Scores (1–10)

| # | Dimension | Score | Notes |
|---|-----------|:----:|-------|
| 1 | Execution | 10 | Exit 0; clean log; 11 figures + 16 CSVs emitted; `cutoff_km=0` divide-by-zero guarded (`_bartlett` returns identity). |
| 2 | Structure | 9 | Module docstring (purpose, usage, estimand, synthetic-data note), CONFIG block, `# ===` section banners, logical flow: load → describe → EDA → baseline → core methods → robustness → exports. |
| 3 | Code quality | 9 | Descriptive names; comments explain *why* (e.g. why share-of-area's coefficient is ~100× larger); helpers ported from `data_prep.py` with beginner comments; no dead code. |
| 4 | Reproducibility | 9 | `RANDOM_SEED=42`; Moran's permutation seeded (`default_rng(1)`); `mlsynth` deterministic; data loaded local-first with a GitHub-raw fallback (Colab-safe) + a pip self-bootstrap. |
| 5 | Figures | 10 | 11 figures, all `dpi=300, bbox_inches="tight"`, dark-navy theme + site palette (steel-blue=control, orange=treated, teal=highlight), `fig.patch.set_linewidth(0)`. Visually inspected: timeseries, boxplots, group-means, event study, night-lights, SC path/gap/weights, spatial map, Conley cutoff — all clean, no overlaps. |
| 6 | Data handling | 9 | Shapes/group sizes printed; NaN pattern documented and handled (`dropna` before every hand-rolled estimator; pyfixest drops internally); lat/lon sliced on the surviving index inside `conley_did_estimate`. |
| 7 | Statistical correctness | 9 | pyfixest TWFE point estimates cross-checked against the from-scratch within estimator; Conley spatial-HAC sandwich ported verbatim (Bartlett kernel, serial∪spatial union, negative-variance clamp); night-lights cluster on kecamatan only (paper fn. 10); 2×2 ATT matches the hand calc (+0.0125). |
| 8 | Causal inference | 9 | Estimand stated as **ATT on flooded districts** (docstring + comment block); framed as an **observational quasi-experiment** identified by **parallel trends** (checked by the ~0 `D_pre` coefficient and the event-study pre-period); placebo (neighbours) + Conley SEs are the guardrails. |

## Findings

**HIGH:** none.
**MEDIUM:** none.

**LOW (accepted, no change required):**
- `event_study_effects.csv` baseline row has an empty `p_value` — intentional: the
  2000–02 baseline is the pinned reference (effect = 0), so its p-value is undefined.
- `conley_did_estimate` recomputes the within-transform/haversine on each call,
  including 7× in the cutoff-sensitivity loop. Negligible at this panel size
  (≤1,283 rows); kept for readability over micro-optimization.
- `mlsynth` installs from GitHub (not on PyPI); the self-bootstrap handles Colab.
  Documented in the docstring and reproduced in the Quarto bundle's pinned env.

## Verification highlights (numbers reproduce the paper's findings)

- DiD GDP (col 1): 2005 **−0.0792\*\*\***, recovery **+0.0628\*\*** (Conley-HAC SE); N = 1,283.
- Event study: pre +0.0172 (ns, parallel-trends PASS), 2005 −0.0792, recovery +0.0628.
- Night-lights (share-of-pop): recovery **+0.0160\*\*\***; quintiles → only Q5 significant.
- Synthetic control: pre-RMSE **0.485**, ATT **+32.9 (+18.3%)**.
- Spatial: Moran's I **+0.065** (p = 0.003); recovery SE **0.0146 → 0.0244** (naive → Conley-HAC), turning a spurious *** into an honest **.

**Conclusion:** Clean, correct, reproducible, pedagogically structured. Ready for the
results-report stage.
