# Publication: Okun's law and spatial regimes in Indonesia (Economic Modelling 2026)

**Date:** 2026-05-29
**Folder:** `content/publication/20260528-EM/`
**Type:** Journal article (publication_types `["2"]`)
**Citation:** Tifani Husna Siregar, Harry Aginta, Carlos Mendez (2026). "Okun's law and
spatial regimes in Indonesia: A machine learning approach." *Economic Modelling*, 107687.
DOI: [10.1016/j.econmod.2026.107687](https://doi.org/10.1016/j.econmod.2026.107687)

## Summary

Added a new publication entry for the *Economic Modelling* (2026) paper that uses C-Lasso
(machine learning) to discover latent growth–unemployment regimes across Indonesian districts,
then a Spatial Durbin Model to split each regime's response into direct (local) and indirect
(neighbor spillover) associations. The entry continues an established line of work alongside the
2023 *Applied Economics Letters* paper `20231012-AEL` ("Regional Okun's law and endogeneity…
Indonesian districts").

The front matter follows the recent multi-author journal-article convention (modeled on
`20260216-APJRS`): authors listed as plain strings with `admin` for Carlos Mendez, full abstract
on a single line, summary, DOI, a "Published article" link button, `featured: false`, and the
five paper keywords plus an `Indonesia` tag.

After the initial entry, the user added an explanatory body, which was then rewritten for
readability and presentation, and an AI Podcast player was attached.

## Deliverables

| # | Step | Artifact | Notes |
|---|------|----------|-------|
| 1 | Create entry | `index.md` front matter + `cite.bib` | BibTeX uses article number 107687 (volume/issue not yet assigned) |
| 2 | Featured image | `featured.webp` | Supplied by the user |
| 3 | Body rewrite | `index.md` body | Heavier rewrite for clarity; all facts/numbers preserved |
| 4 | AI Podcast | `index.md` (appended player block) | catbox `i3g2l3.m4a`, stream link |

## Body rewrite details

- Enabled `math: true` and `diagram: true` in front matter.
- Replaced the broken plain-text `│`/`▼` step diagram with a site-colored **Mermaid flowchart**
  (Step 1 C-Lasso → Step 2 Spatial Durbin Model).
- Kept the four-regime **Markdown table** (labor-absorbing / capital-intensive / transitional /
  peripheral) with example districts, with trimmed prose.
- Preserved every coefficient: −0.262, −0.033, ρ = 0.135, direct −0.112, indirect −0.077.
- Removed all emoji (clean academic headings and bullets); converted the Group-2 callout to a
  plain blockquote and the Q&A to concise prose.

## AI Podcast player

- Appended the self-contained `<style>` + overlay `<div>` + `<script>` player block (copied from
  `content/post/python_dowhy_intro/index.md`), customized with the catbox audio
  `https://files.catbox.moe/i3g2l3.m4a`, title "AI Podcast: Okun's Law and Spatial Regimes in
  Indonesia", and a stream (no-download) link.
- Added the `AI Podcast` front-matter link button → `/publication/20260528-em/#podcast-player`.
- **First use of the podcast player on a publication page** (previously only on `content/post/`).
  Verified that publication single pages render `links:` buttons with class `btn-page-header`, so
  the player's click handler (`a.btn-page-header` + "AI Podcast" text match) fires correctly; the
  `#podcast-player` hash also auto-opens the player.

## Verification

- `hugo --renderToMemory` (v0.84.2 Extended) built clean with no errors after each change.
- Visual checks (Mermaid render, MathJax coefficients, podcast button/overlay) require a browser
  via the dev server at `/publication/20260528-em/`.
