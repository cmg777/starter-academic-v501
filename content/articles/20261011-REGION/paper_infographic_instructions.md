# REGION 2026 — publication infographic

Mode: install. Final publisher version, verified October 11, 2026.
Destination: `content/{,es/,ja/}articles/20261011-REGION/featured.webp`.

Question: **How fast is India catching up?**
Evidence: intact published luminosity map alongside a deterministic comparison of Model 4 convergence speeds.
Answer: **Faster estimated catch-up.**
Visible qualifier: **Model estimates, not causal policy effects.**

## Evidence ledger

| Claim / mark | Published source | Value and meaning | Uncertainty / transformation |
| --- | --- | --- | --- |
| Study scope | Sections 1–2; pp. 174–175 (PDF 2–3) | 520 districts in India, 1996–2010; nighttime lights per capita as an economic-activity proxy | One 14-year growth period, not a panel estimate |
| Map | Figure 1, p. 179 (PDF 7); `https://quarcs-lab.github.io/project2025s-py/images/luminosity_map.png` | Luminosity in 1996 and 2010; radiance-calibrated DMSP-OLS digital numbers, original legend 2–16 | Reused intact; no geography, color, legend or data changes; resized proportionally |
| Blue bar | Table 3, Model 4, p. 184 (PDF 12); interpretation §3.3 pp. 183–184 | OLS implied annual convergence speed 3.0% | Reported rounded value; no intervals reported for speed in this table |
| Gold bar | Same table, SDM speed column | Spatial Durbin total-effect implied annual convergence speed 5.2% | Reported rounded value; no intervals inferred; same linear 0–6% scale |
| Half-lives | Same table, OLS and SDM half-life columns | 23 years and 13 years, respectively | Reported rounded values; not recomputed from rounded coefficients |
| Estimand and caution | §2.3 p. 176 (PDF 4); §3.3 p. 184 (PDF 12); §4.1 p. 187 (PDF 15) | Speed transforms the initial-luminosity coefficient (OLS) or total effect (SDM); Model 4 includes controls and state fixed effects | Half-life is time to close half the initial gap to the steady state. Reduced-form associations do not establish causal interdistrict transmission or policy effects |

Publisher: `https://openjournals.wu.ac.at/ojs/index.php/region/article/view/676`.
PDF: `https://openjournals.wu.ac.at/ojs/index.php/region/article/download/676/542`.
Citation: Mendez, Carlos; Kabiraj, Sujana; Li, Jiaqi (2026). REGION 13(2), 173–196. DOI: 10.18335/region.v13i2.676. Published October 11, 2026. CC BY 4.0.
The landing page's `citation_date` and visible publication date identify the article date. `DC.Date.issued` July 22 is the issue date. The DOI resolved successfully; Crossref's works endpoint returned 404 during verification. The replication README still contains prepublication metadata; the published article controls citation and estimates.

## Production

Actual reference images inspected: `20260528-EM/featured.webp` and `20260216-APJRS/featured.webp`. Reference and current site agree on the question → evidence → answer hierarchy.
Verified website CSS tokens: navy #050a12, panel #0a121d, ink #edf2f6, secondary #9baaba, line #22303e, blue #88b9de, gold #e9c184. The source map retains its original palette and legend. Blue and gold distinguish models, not a good/bad ranking. The main evidence uses a common zero origin and 110 pixels per percentage point.

1920×1080 native SVG/PNG master, deterministic drawing and exact source-map embedding. No generative redrawing. Source builder: `scripts/figures/region2026-infographic.py`; pass the downloaded source map through `--map` and a scratch path through `--output-dir`. The layout and comparison chart are adaptations, credited on the article page; map pixels are only proportionally resampled. WebP quality 92, method 6. Site thumbnail pipeline remains 320×180 q88 and 640×360 q92 with lazy loading and async decoding.

Same WebP bytes in EN/ES/JA, with fully localized `image.alt_text` and article prose. The alt descriptions explain the comparison, sample, units, half-lives and interpretation limit. Fine labels and the map legend are intended for the enlarged view; the research row uses 160 CSS px on desktop and 96 CSS px on mobile.

Validation receipt is recorded in `logs/2026-10-11-region-publication.md`; do not infer build, viewer, or deployment success from this brief alone.
