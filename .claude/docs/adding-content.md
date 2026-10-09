# Adding new items — intake guide

What the user hands over, and what a finished addition must contain. Every addition is trilingual
(EN + ES + JA in the same change) and ends with a production build, `scripts/audit-site.py`
(RESULT: clean) and `scripts/i18n-parity.sh` (0 missing). Commit and push only when the user says so.

| The user gives… | Use | Result |
|---|---|---|
| A paper PDF (article, working paper, chapter, report, book) | skill `add-publication` | `content/articles/YYYYMMDD-ABBR/` (books → `content/books/<slug>/`) with `cite.bib`, buttons, plain summary, ES/JA, CV line |
| Slides (PDF or Canva / Google Slides / Quarto link) | skill `add-presentation` | `content/presentations/YYYYMMDDABBR/` with Slides button or embed, cover from slide 1, ES/JA, CV line |
| A working paper that is now published | skill `add-publication` (update mode) | the existing bundle is updated in place (type, journal, DOI, buttons, `cite.bib`); the URL is kept |
| A web app URL + title | `.claude/docs/webapps.md` | `content/webapps/<slug>/` + ES/JA + screenshot card |
| A software package (repo / PyPI / docs URL) | this guide, below | `content/software/<slug>/` + ES/JA |
| A data repository or portal | this guide, below | `content/data/<slug>/` + ES/JA |
| An analysis idea or dataset for a tutorial | `write-script` → `write-post` pipeline (CLAUDE.md, Skills) | `content/tutorials/<slug>/` + ES/JA stubs |
| An AI podcast audio or Spotify link for a post | `.claude/docs/ai-podcast-player.md` | inline player + "AI Podcast" button |
| Slides or a `.zip` for a tutorial | `.claude/docs/post-resource-buttons.md` | resource button in `links:` |
| A co-author or student | skill `update-author-profile` | `content/authors/<name>/` in three languages |

## Rules that apply to every item

- **Plain-language `summary:`** for a general audience: no acronyms or jargon. Articles and talks use
  at most two sentences, web app cards at most three, and the summary names the platform.
- **Images:** 16:9 `featured.*` at least 1280×720 (design-system §5). Never generate a featured image
  without asking; the user often supplies their own.
- **Filters:** a new value (region, topic, data type, book format) needs its option in the section
  `_index.md` of all three languages.
- **Homepage effects** (say them in the report):
  - Articles: featured flags fill the 3 slots first, then the newest fill the rest.
  - Talks: the 3 newest by `date`.
  - Software: the 3 most recently committed.
  - Tutorials: featured first, then the most recently committed.
- **CV** (`content/cv/main.tex`, English only): follow `.claude/skills/update-cv/SKILL.md`. Its
  `--section` options are publications, presentations and software. Software, data and app entries
  are proposed as candidates and need the user's approval.

## Software package

1. Read the repository README, PyPI or CRAN page, and docs site.
2. Copy `content/software/geometrics/index.md` as the model:
   - `title` is the package name.
   - `date` is today.
   - `summary` is a plain question and answer of 1–2 sentences.
   - `tags` come from the topic filter values in `content/software/_index.md`.
   - `links:` holds Website, PyPI/CRAN, a Colab quick start, and the Streamlit apps
     (`fas laptop-code`).
3. Add a `featured.webp` (16:9). Use a screenshot of the docs site or app, with the user's okay.
4. Add the ES/JA bundles by following `.claude/skills/translate-content/SKILL.md`.
5. If the package has Streamlit apps, add each one with `.claude/docs/webapps.md`.

## Data resource

1. Copy an existing `content/data/<slug>/index.md`, setting `data_type: repository|portal` and
   `region`. A new region needs its filter option in all three `_index.md` files.
2. Give the links: the repository or portal, a DOI if any, and a data dictionary if any.
3. Add the ES/JA bundles with translate-content.
4. Offer a CV candidate.
