# GeoDevelopment Observatory of Bolivia — local review draft

Prepared a new Data portal entry at `/data/gdo-bolivia/`, with full Spanish and Japanese counterparts. No existing content, filters, layout, CV, or homepage configuration changed. Bolivia and portal filter values already exist.

The post introduces the observatory, compares dataset-specific coverage, links to the quickstart, tools, research insight and Discussions, and reproduces the project’s Mendez (2026) citation. Live homepage and SDG dataset documentation were reviewed on 2026-10-29. SDG indicators are reference-year observations, not a full annual panel; no newer municipality map or app functionality is claimed as tested.

The featured image is an actual live hero screenshot in the website’s Santa Cruz view, not generated artwork. Measured source viewport: 1512×982 CSS pixels; observed device pixel ratio 1.1. Local crop: 1496×842, with navigation/browser chrome excluded. Identical image bytes are stored in all three page bundles. Imagery attribution appears in each post.

Validation: Hugo extended 0.111.3 production-style build passed (existing .Path warning); language parity 0 missing/stale/asset warnings; ten unique new external URLs returned HTTP 200. Twelve card/detail views at measured widths 390 and 1440 CSS pixels loaded the new images, with no page overflow. Mobile coverage tables and Japanese emphasis were checked separately.

The site audit reports six legacy broken image references under `/post/python_dynamic_panel/referenceMaterials/`; a baseline build excluding only the new bundles reports the identical six findings. No broken anchors or language-switch links, and no audit findings in the new entry.

Prepared only: no commit, push or deployment. CV addition remains a separate candidate requiring approval. No homepage featured group changes.
