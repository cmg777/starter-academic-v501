# 2026-06-10 — New project: `indonesia514`

## Why

Add a new entry to the `content/projects/` gallery for **Indonesia514** — *"A Data Science
Repository to Study Regional Development across 514 Districts in Indonesia"* — built in the same
style as the `ds4bolivia` project. Info and the featured image were sourced from the upstream
repository and its GitHub Pages site:

- Website: <https://quarcs-lab.github.io/indonesia514/>
- GitHub: <https://github.com/quarcs-lab/indonesia514>

The user also required the project to appear **first** in the gallery and homepage showcase
(newest project), since it is the most recently created.

## What shipped

Three trilingual page bundles (EN + ES + JA), each with `index.md` + `featured.jpg`:

| File | Notes |
|------|-------|
| `content/projects/indonesia514/index.md` | English project page, ds4bolivia structure. |
| `content/es/projects/indonesia514/index.md` | Spanish (neutral LatAm, formal `usted`). Link name → "Sitio web". |
| `content/ja/projects/indonesia514/index.md` | Japanese (です・ます). Link name → "ウェブサイト". |
| `featured.jpg` (×3) | The repo's `images/cover.webp` (2818×1472) downloaded and converted to JPG via `sips`; copied into all three bundles. |

Front matter (all three): `date: "2026-06-10T00:00:00Z"`, `tags: [spatial, python, regional]`,
`links: Website (ai/open-data)`, `url_code` → GitHub. No slides/video (none exist upstream).

## Content fidelity decision

The upstream repo is an **early-stage draft**: district boundaries are complete in GeoJSON, the
bilingual website is live, but the GDP / GFCF / government-spending CSVs (2010–2022) currently ship
only a **16-district sample** of the eventual 514; dashboards and notebooks are *planned* with no
live URLs. Per the user's choice, the page is **accurate to the current state** — only real,
existing resources (the 4 datasets keyed on `districtID`, a quick-start `pandas` merge from the
README, APA + BibTeX citation, MIT license) plus a clearly-labelled "active development" status
note. No fabricated dashboard/notebook URLs and no speculative roadmap section. APA citation,
BibTeX block, and Python code are kept verbatim (English) in all three languages, matching the
`ds4bolivia` ES/JA treatment.

## Ordering

Both the `/projects/` gallery (`layouts/section/projects.html` → `.Pages.ByDate.Reverse`) and the
homepage showcase (`layouts/shortcodes/showcase.html` → `.ByDate.Reverse`) sort by **`date`
descending**. With `date: 2026-06-10` (> the previous newest, `ccm` 2026-05-17), `indonesia514` is
now the first card in the gallery and the lead card in the homepage Projects showcase on `/`,
`/es/`, and `/ja/`. No `weight` field is used anywhere in the projects section.

## Verification

- `bash scripts/i18n-parity.sh --section projects` → **0 gaps** (es 8/8, ja 8/8; was 7/7).
- Front matter validated as well-formed YAML for all three files; link names localized correctly.
- Date-ordering confirmed by script: `indonesia514` (2026-06-10) sorts ahead of all 7 existing projects.
- **Full local Hugo render could not be completed in this environment**: both the on-disk 0.89.4
  and the pinned 0.111.3 verification binary fail at config parse with
  `failed to resolve output format "headers" from site config` — the Wowchemy theme module's
  custom output formats are not merging locally. This fires even on `hugo config`/`hugo mod graph`
  with no content involved, so it is a pre-existing environment issue independent of this change
  (the change is purely additive content under `content/projects/`). Final render verification is
  via the Netlify build/deploy preview.
