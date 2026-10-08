# 2026-10-08 — Plain-language web app descriptions (EN/ES/JA)

Rewrote the `summary:` of every item listed on `/webapps/` for a general audience:

- 22 standalone apps in `content/webapps/` (15 Google Earth Engine apps previously said only "Interactive Google Earth Engine application.", plus the expdpy and geometrics Streamlit apps).
- 67 tutorials that ship a `web_app/index.html` (their summary is the app card text, and also appears on `/tutorials/`). The 3 featured tutorials (kuznets_dmsp, did_sc_tsunami, bridge_impact) kept their approved summaries.

Rules applied: at most three sentences; a plain question or purpose first; no acronyms or jargon (methods named at most once, in everyday words); no em dashes, possessives or contractions; we/you voice; the platform is stated (tutorial app in the browser, Google Earth Engine, or Streamlit). Earth Engine siblings are told apart in plain words (click a point vs choose a region, monthly vs yearly, split view, regional dynamics, older long series vs newer detailed series).

Spanish (usted) and Japanese (です・ます) stubs and pages were updated in the same change. Titles were not changed. Checks: production build, `node --test tests/*.cjs` (22 pass), `scripts/i18n-parity.sh` (0 missing), no generic "Interactive Google Earth Engine application" text left on `/webapps/`, `/es/webapps/`, `/ja/webapps/`.
