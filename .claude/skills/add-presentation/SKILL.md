---
name: add-presentation
description: Turn a slide deck (PDF file, Canva / Google Slides / Quarto HTML link, or PowerPoint exported to PDF) into a complete presentation entry — the EN bundle in content/presentations/, the Slides button and embedded deck, a cover image from the first slide, a plain-language summary, the ES/JA translations, and the CV line — then build, verify, and commit on approval. Use when the user says "add this talk", "new presentation", or hands over slides.
argument-hint: "<slides PDF path or URL> [event, date, city/country if not on the slides]"
user-invocable: true
---

# Add a presentation from slides

These two skills are user-invoked only (`disable-model-invocation`), so read and follow their SKILL.md
files in place rather than calling them through the Skill tool.

| Step | Delegates to |
|---|---|
| ES/JA pages | `.claude/skills/translate-content` (`presentations/<folder> --lang all`) |
| CV line + CV.pdf | `.claude/skills/update-cv` (`--section presentations`) |
| Interactive AhaSlides version (optional) | `.claude/docs/ahaslides.md` |

Model bundles: `content/presentations/20260827ISEE/` (Canva link), `content/presentations/20261231TBA/`
(HTML deck embedded in the body), `content/presentations/20260721GSID/` (deck hosted inside the bundle).

## Phase 1 — Read the slides (read-only)

1. **PDF:** read the title slide and the outline/conclusion slides with `Read` (`pages: "1-3"`, then the
   last 2–3 pages). **URL:** open it in Chrome only if the user agrees; otherwise rely on what the user
   says. Never download files from unknown hosts without asking.
2. Extract: title, subtitle, authors/co-presenters, event name, event URL, date, venue, city, country,
   and the 3–5 main messages (for the summary and abstract).
3. Anything not on the slides (event, date, location, the talk role such as keynote or invited) → ask.
   Unknown date: use `date_tba: true` with a placeholder date (see the `20261231TBA` bundle).
4. **Duplicate check:** grep `content/presentations/*/index.md` for the title and the event. If the same
   talk was given before, ask whether this is a new entry (new event) or an update.
5. Related article? If the talk presents a paper already in `content/articles/`, note it so the abstract
   and summary can reuse its plain-language framing and a "Paper" link can be added.

## Phase 2 — Decide and confirm (one SCOPE message, wait for approval)

- **Folder:** `content/presentations/YYYYMMDDABBR/` (talk date + event acronym, no hyphen, e.g.
  `20260827ISEE`). No spaces. The page URL is `/presentations/<url-name>/`, where `<url-name>` is the
  folder name lowercased, or the `slug:` value when one is set (only used for a readable URL, e.g.
  `gsid-ai-2026`). Never change the URL of an existing talk without adding `aliases:`.
- **Front matter draft:** `title`, `subtitle`, `event`, `event_url`, `location` ("City, Country"),
  `date` (talk date; future dates are fine), `all_day: true`, `publishDate` (now or earlier — a future
  `publishDate` hides the talk), `authors: []`, `tags`, `featured: false`.
- **Plain-language `summary:`** — general audience, at most two sentences, no acronyms or jargon. Also an
  `abstract:` (one paragraph, single-line YAML).
- **Slides button and hosting:**
  - Hosted link (Canva, Google Slides, GitHub Pages) → `url_slides: "<link>"` and, for embeddable decks,
    the responsive iframe body used in `20261231TBA` (with `loading="lazy"` and an "Open the slides in full
    screen" link).
  - PDF the user wants public → copy into the bundle as `slides.pdf` and add the `links:` button
    "Slides (PDF)" (`fas file-pdf`, absolute `https://carlos-mendez.org/presentations/<url-name>/slides.pdf`,
    see `.claude/docs/post-resource-buttons.md`). Ask first; some decks are not for sharing.
  - Optional: `url_video`, `url_pdf` (paper), `url_code`, a "Paper" link to the related article.
- **Cover image:** default = the first slide rendered to a 16:9 `featured.jpg` (≥1280×720):
  `pdftoppm -f 1 -l 1 -r 150 -jpeg slides.pdf <scratchpad>/cover` then resize/crop to 16:9 (`sips` or
  Pillow). For a URL deck, ask for a screenshot or the PDF. No blur, overlays or tilt (design-system §5).
- **Homepage effect:** `#talks` shows the 3 newest talks by `date`; say whether this one will appear.
- **CV:** the `\cventry` that update-cv will draft (year, title, role + event, venue, city/country).
- **Finish:** commit and push to `master` (deploys) or leave uncommitted.

## Phase 3 — Write the English bundle

Write `index.md` following the model bundles (YAML, no emojis, em dashes, single-line `abstract`).
Keep the Wowchemy comment blocks that the model bundles keep. Add `featured.jpg` and `slides.pdf` only as
approved.

## Phase 4 — Translations, CV

1. Follow `.claude/skills/translate-content/SKILL.md` for `presentations/<folder> --lang all` (title, subtitle, event description,
   location, summary, abstract and body prose translated; URLs, dates, `featured`, `date_tba` copied
   byte-for-byte; `featured.jpg` copied; `slides.pdf` stays only in the EN bundle and the ES/JA buttons point
   to the EN absolute URL).
2. Follow `.claude/skills/update-cv/SKILL.md` with `--section presentations` (confirm the city/country split; it inserts at the top of
   Recent Presentations, then compiles and copies `static/media/CV.pdf`).

## Phase 5 — Verify, commit

```bash
H="$HOME/Library/Application Support/Hugo/0.111.3/hugo"
rm -rf public && "$H" --gc --minify --buildFuture
python3 scripts/audit-site.py          # RESULT: clean
bash scripts/i18n-parity.sh            # 0 missing
```

Check `public/presentations/<url-name>/index.html` (+ `es/`, `ja/`) for the title, the Slides
button and the embed; check `/presentations/` lists it under the right year; check the homepage `#talks`
if it is among the 3 newest. Commit (`presentations: add <ABBR> <year> talk (EN/ES/JA) + CV`) and push
only if the user chose to.

## Report

Folder, URL, buttons, cover image source, homepage effect, CV line, and anything the user still needs to
supply (event URL, video link after the talk, final date for a TBA talk).
