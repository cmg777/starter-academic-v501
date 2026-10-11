# EJHE Quarto slides — October 12, 2026

Added an English 22-slide Quarto reveal.js presentation for the new EJHE paper and linked it from the EN, ES and JA article pages. The paper remains `featured: false` in every language; the existing homepage featured set and CV are unchanged.

The deck follows the repository tutorial/REGION format, with the canonical site theme/title partial plus the requested navy/blue/gold palette. It includes speaker notes, menu, overview, chalkboard, keyboard controls and a phone scroll layout with reflowing text and swipeable figures. Its HTML and full dependency bundle are committed because Netlify only builds Hugo.

Original SVG figures reconstruct Table 2 posterior-mean income components, locate Table 4 controlled-TWFE turning points and explain model averaging conceptually. All numerical claims are sourced in notes and `slides/EVIDENCE.md`. The deck distinguishes pooled OLS from the panel result, associations from causality, and point estimates from uncertainty. The printed Table 11 five-year-lag coefficients were checked against PDF page 19. No raw data, uncertainty bands, replication notebook or media links were invented. No PDF deck was generated.

Validation: Quarto render; repository static slide smoke test; all 22 desktop slides visually reviewed; phone title, menu, table and swipeable figure checked; math and geometry checks; production Hugo build, Node tests, translation parity and site link audit. Publishing follows the user's explicit commit/push authorization.

As in the REGION bundle, the chalkboard plugin is copied into ES/JA resource trees to avoid Hugo’s inherited-resource filename collision. All three article buttons target the single English deck.

Final checks: 15/15 slide smoke checks, 22/22 repository tests, translation parity 0 missing/stale/asset warnings, and 2,098 built HTML pages audited with 0 broken references/anchors/language links. All three homepage featured sets remain REGION / AE / SIR. Phone layouts checked at 360 and 390 px, desktop at 1440 px; all 22 slides reviewed, including rendered equations and figures. Next/previous, Start, menu, overview, chalkboard, speaker view and article-to-deck navigation verified.
