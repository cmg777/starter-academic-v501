# Data-card description consistency — local review draft

Expanded only the summary fields of Indonesia514, DS4Bolivia and GDO-Cambodia in EN/ES/JA. Introductions were reviewed and retained; their existing detail is already fuller than the card summaries. No URLs, citations, thumbnails, dates, layout, CV or other post content changed. GDO-Bolivia remains byte-identical to the published multiple-scale wording.

English summaries now have 22–25 words (Bolivia benchmark: 21). Spanish summaries have 26 words (benchmark: 27). Japanese summaries have 59–67 characters (benchmark: 52).

| Project | Language | Words before → after | Characters before → after |
|---|---|---|---|
| indonesia514 | en | 13 → 25 | 89 → 189 |
| indonesia514 | es | 17 → 26 | 105 → 195 |
| indonesia514 | ja | 1 → 1 | 42 → 63 |
| ds4bolivia | en | 10 → 23 | 68 → 170 |
| ds4bolivia | es | 13 → 26 | 85 → 193 |
| ds4bolivia | ja | 1 → 1 | 35 → 67 |
| gdo-cambodia | en | 16 → 22 | 117 → 175 |
| gdo-cambodia | es | 19 → 26 | 127 → 193 |
| gdo-cambodia | ja | 1 → 1 | 47 → 59 |

Sources reviewed: existing project introductions, current Indonesia514 and DS4Bolivia GitHub READMEs, the Indonesia GDP CSV, and the Cambodia project page. Indonesia514’s README still calls the GDP file a 16-row sample, but its current CSV has 514 distinct district IDs; no current coverage count or planned tool is claimed in the new summary. Its detailed status note was left outside this focused summary edit.

Validation: pinned Hugo 0.111.3 build passed with the existing .Path warning; language parity has zero missing/stale/asset warnings; 18 filtered card views at measured 390px/1440px widths passed with images loaded and no overflow. All nine detail-page meta descriptions match their revised summaries. A source comparison confirms all other post bytes are unchanged. The site audit has the same six known legacy image-reference findings in python_dynamic_panel reference materials; no new broken anchors or language links.

Prepared locally only. No commit, push or deployment. No homepage featured-group effect.
