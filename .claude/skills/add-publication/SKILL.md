---
name: add-publication
description: Turn a paper PDF (published article, accepted manuscript, working paper, book chapter, report or book) into a complete site entry — the EN bundle in content/articles/ (or content/books/), cite.bib, resource buttons, a plain-language summary, the ES/JA translations, and the CV line — then build, verify, and commit on approval. Reads metadata from the PDF and confirms it against Crossref when a DOI exists. Use when the user says "add this publication", "new paper", or hands over a paper PDF.
argument-hint: "<path to PDF> [--doi 10.xxxx/...] [extra links: podcast, video, code, data, slides]"
user-invocable: true
---

# Add a publication from a PDF

One PDF in, one finished trilingual entry out. This skill **orchestrates** existing pieces; it does not
replace them:

translate-content and update-cv are user-invoked only (`disable-model-invocation`), so read and follow
their SKILL.md files in place rather than calling them through the Skill tool.

| Step | Delegates to |
|---|---|
| ES/JA pages | `.claude/skills/translate-content` (`articles/<folder> --lang all`) |
| CV line + CV.pdf | `.claude/skills/update-cv` (`--section publications`) |
| Featured image (optional) | `.claude/skills/write-paper-infographic` |
| AI podcast (optional) | `.claude/docs/ai-podcast-player.md` |

Model bundle to copy the shape from: `content/articles/20260528-EM/` (front matter, `cite.bib`,
`working-paper.pdf`, plain-language explainer body, podcast). Archetype: `archetypes/publication/index.md`.

## Phase 1 — Read the PDF and gather facts (read-only)

1. Read the PDF with the `Read` tool (`pages: "1-3"` first; add the conclusion pages if needed for the
   explainer). Large PDFs: read only the pages you need (title page, abstract, introduction, conclusion).
2. Extract: title, all authors in order, journal / book / series, year, volume, issue, pages or article
   number, DOI, abstract (verbatim), keywords, and whether the PDF is the **publisher version**
   (journal header/footer, copyright line) or an **author version** (working paper, preprint,
   accepted manuscript).
3. **DOI present?** Confirm and complete the metadata with Crossref
   (`curl -s https://api.crossref.org/works/<DOI>`): container title, issued date, volume, issue, page,
   author list. Crossref wins over the PDF for citation fields; flag any disagreement to the user.
4. **Duplicate check:** grep `content/articles/*/index.md` and `content/books/*/index.md` for the DOI and
   the normalized title. If it exists (e.g., a working paper now published), switch to **update mode**:
   edit that bundle (type, publication, DOI, links, cite.bib, date) instead of creating a new one, and keep
   its folder and URL.

## Phase 2 — Decide and confirm (one SCOPE message, wait for approval)

Fill in and show:

- **Section and type:** `publication_types` 2 = journal article, 1 = conference paper, 3 = working paper /
  preprint, 4 = report, 6 = book chapter, 7 = thesis → `content/articles/`; 5 = book → `content/books/`
  (`type: publication`, `book_format: print|online`, follow an existing book bundle).
- **Folder:** `content/articles/YYYYMMDD-ABBR/` — date = publication date (online-first or issue date; for
  working papers the release date), ABBR = journal initials as used in existing folders (EM = Economic
  Modelling, SIR = Social Indicators Research, EE = Empirical Economics, AE = Applied Economics). No spaces.
- **Metadata** table (title, authors, journal, year/vol/issue/pages, DOI).
- **Plain-language `summary:`** draft — general audience, at most two sentences, no acronyms or jargon
  (see the homepage rule in CLAUDE.md). This text appears on the homepage and on /articles/.
- **Buttons** that will appear (order is fixed by `partials/orbital-paper-links.html` and the theme):
  - DOI → `doi:` (always when known) plus a `links:` "Published article" (`fas university`,
    `https://doi.org/<DOI>`).
  - PDF in the bundle → **only if the user may share it.** Publisher PDFs of closed-access articles are
    NOT hosted; ask. Author versions are saved as `working-paper.pdf` with a `links:` "Working paper"
    (`fas file-pdf`, relative `url: working-paper.pdf`). Open-access publisher PDFs may use `url_pdf`.
  - Optional, from the user: `url_preprint`, `url_code`, `url_dataset`, `url_slides`, `url_video`,
    "AI Podcast" (`fas podcast` → `/articles/<folder-lowercase>/#podcast-player`, built with the podcast recipe).
- **Featured on the homepage?** Ask. Explain the rule: `featured: true` items fill the 3 homepage slots
  first, newest first, and today all 3 slots are taken by featured papers — so a non-featured new paper
  will NOT show on the homepage until a flag is removed. If yes, propose which current featured item to
  unflag (all three languages).
- **Featured image:** none / user-supplied / `write-paper-infographic`. Needs a 16:9 `featured.webp`
  ≥1280×720 (design-system §5). Never generate one without asking.
- **Explainer body:** optional plain-language body like 20260528-EM (puzzle, approach, findings,
  takeaways). Default for journal articles: yes, short; mark descriptive vs causal correctly.
- **CV:** confirm the CV line will be added via `update-cv` and the PDF rebuilt.
- **Finish:** commit and push to `master` (deploys) or leave uncommitted.

Do not write files until the user approves (they can edit any item).

## Phase 3 — Write the English bundle

- `index.md` front matter (YAML, no emojis): `title`, `authors` (coauthors by full name, Carlos Mendez as
  `admin`, in paper order), `date` and `publishDate` (both the publication date, never in the future for
  `publishDate`), `doi` (bare), `publication_types: ["N"]`, `publication: "*Journal Name*"`,
  `abstract:` (single-line, verbatim; escape inner `"`), `summary:`, `tags` (5–8 from the keywords),
  `featured`, `links:`, the empty `url_*` fields, `image: {caption: '', alt_text: '<describe the image>',
  focal_point: "", preview_only: false}`; add `math: true` / `diagram: true` only if the body uses them.
- `cite.bib`: BibTeX from Crossref (`curl -sLH "Accept: application/x-bibtex" https://doi.org/<DOI>`),
  tidied to the house format of existing `cite.bib` files (key `AuthorsYear`, `title`, `author`, `journal`,
  `volume`, `number`, `pages`, `year`, `DOI`, `url`). Working papers: `@techreport` / `@unpublished`.
- Assets: copy the PDF in only as approved; prefer `.webp` for images; `featured.webp` only if approved.
- Body: the approved explainer (or empty). Use em dashes (—), `\\$` for literal dollars when `math: true`,
  ```` ```text ```` for output blocks, `loading="lazy"` on any iframe.

## Phase 4 — Translations, CV

1. Follow `.claude/skills/translate-content/SKILL.md` for `articles/<folder> --lang all` (full translation of title, abstract,
   summary, body, link names; DOI, URLs, tags, `featured`, dates copied byte-for-byte; `cite.bib` and
   `featured.*` copied). The ES/JA `summary` must stay plain-language too.
2. Follow `.claude/skills/update-cv/SKILL.md` with `--section publications` (Crossref coauthors, confirm the drafted line,
   compile, copy `static/media/CV.pdf`).

## Phase 5 — Verify, log, commit

```bash
H="$HOME/Library/Application Support/Hugo/0.111.3/hugo"
rm -rf public && "$H" --gc --minify --buildFuture
python3 scripts/audit-site.py          # must print RESULT: clean
bash scripts/i18n-parity.sh            # 0 missing
node --test tests/*.cjs
```

- Grep the built `public/articles/<folder-lowercase>/index.html`, `public/es/…`, `public/ja/…` for the title, the
  buttons and the summary; check `/articles/` lists it with the right year and type filter; check the
  homepage `#featured` if the item was featured.
- `featured: true` count stays as intended (`grep -rl "^featured: true" content/articles content/es/articles content/ja/articles`).
- Add a short entry to `logs/` only if something beyond a routine addition changed.
- Commit with a message like `articles: add <ABBR> <year> (<short title>) (EN/ES/JA) + CV`, then push only
  if the user chose to.

## Report

Folder, URL (`/articles/<folder-lowercase>/`), buttons shown, homepage effect, CV line added, anything unverified
(e.g., PDF and Crossref disagree, missing issue/pages for online-first articles — suggest re-running in
update mode once the issue is assigned).
