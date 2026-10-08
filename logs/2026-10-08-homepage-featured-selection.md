# 2026-10-08 — Homepage: hand-picked featured articles and tutorials

## What changed
- **`featured: true` controls the homepage again.** It had been ignored since the 2026-10-03 redesign.
  - `layouts/index.html` lists flagged items first (newest `date` first) and fills the remaining slots (3 per section) with the previous automatic rule. For articles that is the newest papers of types 1–3; for tutorials it is the most recently committed.
- **Picks (satellite and big-data work)**, flagged in EN/ES/JA, 18 files in all:
  - Articles: `20241219-AE`, `20251006-SIR`, `20250605-EE`.
  - Tutorials: `python_kuznets_dmsp`, `python_did_sc_tsunami`, `python_monitor_regional_development` (replaced the same day by `python_bridge_impact`).
- **Old flags cleared:**
  - Articles `20200817-RSPP` and `20240417-REGION` (EN/ES/JA).
  - Tutorials `python_double_lasso`, `r_double_lasso` and `stata_double_lasso`.
  - Books and presentations keep their flags, which the homepage does not read.
- **Heading:** "Recent research" became "Featured articles" / "Artículos destacados" / "注目の論文" (`pubTitle` in `data/orbital.json`).
- **Plain-language summaries** (at most 2 sentences, EN/ES/JA) for AE, EE and the three tutorials. SIR got its summary earlier the same day.
- **Citations checked against Crossref:**
  - AE (*Applied Economics*) was online-first on 2024-12-19 and appeared in its final issue as vol 57(59), pp. 10677–10693, on 2025-12-20. `date:` is now 2025-12-20, so the site shows 2025. `publishDate` and the URL are unchanged.
  - `cite.bib` (EN/ES/JA) now carries volume, issue and pages for SIR 180(3):1593–1618, EE 69(2):735–754 and AE 57(59):10677–10693. The AE year changed from 2024 to 2025, and SIR's "Online first" note was removed.
  - The CV was not updated (`content/cv/main.tex`).

## Verified
- Production build. The order is AE, SIR, EE on `/`, `/es/` and `/ja/`, all shown as 2025. The tutorials show the 3 picks.
- `node --test tests/*.cjs` (22 pass); `scripts/i18n-parity.sh` (0 missing).
- Chrome desktop check: no overflow, and thumbnail filters are `none`.
