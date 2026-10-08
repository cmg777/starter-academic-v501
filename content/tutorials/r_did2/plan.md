# Approved Scope: `r_did2`

SCOPE CONFIRMATION
==================

1. **TOPIC:** A streamlined introduction to Difference-in-Differences for regional data,
   using Baker, Callaway, Cunningham, Goodman-Bacon & Sant'Anna's "DiD: A Practitioner's
   Guide" running example (ACA Medicaid expansion → county-level adult mortality, 2009-2019).
   Analysis question: *"How does choosing population weights vs equal weights change the
   target parameter and the estimated effect of Medicaid expansion on county adult mortality?"*

2. **LANGUAGE:** R — to use `did` / `DRDID` / `HonestDiD` / `fixest`, which is the
   canonical toolchain for the Callaway-Sant'Anna framework and matches the
   manuscript's reference replication scripts.

3. **FIGURE THEME:** Dark navy (`#0f1729` / `#1f2b5e` / `#c8d0e0` / `#e8ecf2`).
   Site palette accents: steel blue `#6a9bcc`, warm orange `#d97757`, teal `#00d4c8`.

4. **SCRIPT SECTIONS (10):**
   - 0. Setup (packages, seed, dark palette, custom theme)
   - 1. Data loading + raw CSV export
   - 2. Data preparation + analysis-panel CSV export
   - 3. 2×2 cell-means DiD (the headline weighted-vs-unweighted contrast)
   - 4. 2×2 TWFE regression (six `feols()` specifications)
   - 5. Covariate balance + propensity scores (logits, unweighted vs weighted)
   - 6. 2×2 with covariates: OR / IPW / DRDID (six specifications)
   - 7. 2×T event study for the 2014 expanders (`did::att_gt` + dynamic `aggte`)
   - 8. G×T staggered design (all expansion cohorts, full Callaway-Sant'Anna)
   - 9. HonestDiD M̄-restriction sensitivity (both weightings)
   - 10. Summary + README generation

   Estimated: ≥ 8 PNG figures, ≥ 8 CSV tables.

5. **DELIVERABLES:**
   - `analysis.R`
   - `execution_log.txt`
   - 8 PNG figures (`r_did2_01_*.png` … `r_did2_08_*.png`)
   - ≥ 8 CSV files (`raw_data.csv`, `data_prepared.csv`, `table_*.csv`, `summary.csv`)
   - `README.md` (auto-generated artifact inventory)
   - `plan.md` (this file)

6. **FRAMING:** **Causal**. Observational design, so covariate adjustment is for
   **confounding control** (not precision improvement). The target throughout is the
   ATT, but its definition shifts with the weight: equal weights → average effect across
   the typical treated county; population weights → average effect on the county where
   the typical treated adult lives. A comment block in the script states this explicitly.

7. **DATASET:** Reuse `reference/data/county_mortality_data.csv` (~50,600 rows;
   filters to 2,604 counties × 11 years after applying manuscript inclusion criteria:
   drop DC + pre-2014 adopters [`DE / MA / NY / VT`], require full 2013/2014
   covariates and full 2009–2019 mortality).

User adjustments confirmed via AskUserQuestion:

- Full pipeline through G×T (not 2×2-only).
- All three estimator families included.
- Full event study at both 2×T and G×T stages.
- HonestDiD included as the final section.
- County-level only (no state-level appendix).
- Positioning: streamlined intro / canonical regional-data tutorial; no cross-link to `r_did`.
- Dark theme.

Proceed: yes.
