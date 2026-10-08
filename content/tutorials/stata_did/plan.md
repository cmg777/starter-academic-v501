SCOPE CONFIRMATION
==================

1. TOPIC: Difference-in-Differences (DiD) using simulated tutoring program data.
   Analysis question: "Does an after-school tutoring program improve GPA for low-income students?"

2. LANGUAGE: Stata — matches reference materials (Corral & Yang 2024 provide Stata code)

3. FIGURE THEME: Light — default for Stata graphs

4. SCRIPT SECTIONS:
   - 0. Install dependencies (diff_plot, diff, ftools, reghdfe, panelview, eventdd, matsort, outreg2)
   - 1. Data loading & exploration (tutoring_did.dta, 70 obs)
   - 2. Treatment visualization (panelview, 2x2)
   - 3. Interrupted Time Series -- Figure 1 (treated group only)
   - 4. Parallel trends & counterfactual -- Figure 2 (3 lines)
   - 5. DiD means table -- Table 1 (manual calculation)
   - 6. DiD plots (diff_plot + diff commands)
   - 7. DiD regression approaches (5 methods: reg, didregress, xtreg, reghdfe, reghdfe+covariate)
   - 8. Table 2 replication (3 specifications with outreg2)
   - 9. Event study data loading (tutoring_didevent.dta, 280 obs)
   - 10. Event study panel visualization (panelview)
   - 11. Event study estimation -- Figure 3 (eventdd)
   - 12. Table 4 replication (event study coefficients)
   - 13. Closing summary
   Estimated: 6 PNG figures, 2 Word tables

5. DELIVERABLES:
   - analysis.do
   - analysis.log
   - 6 PNG figures (stata_did_*.png)
   - 2 Word tables (table2.doc, table4.doc)
   - README.md
   - plan.md

6. FRAMING: Causal — ATT (Average Treatment Effect on the Treated).
   Observational/quasi-experimental context using DiD to exploit natural experiment.

7. No ambiguities — reference materials are comprehensive.

Proceed? CONFIRMED
