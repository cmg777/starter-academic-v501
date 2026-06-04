# Per-type field rules

For each content type, the **Translate** column lists front-matter keys (and
body) to translate; the **Keep verbatim** column lists keys that are query
keys / IDs / URLs / proper data and MUST be copied byte-for-byte. When in
doubt, keep. Always apply `glossary.md` (register, number localization, term
table, DO-NOT-translate list).

Comments in the source front matter (`# ...`) may be translated when they are
reader-facing notes (the existing ES/JA files translate the People-widget and
stub comments), but never alter a comment that documents a query-key contract.

---

## publication — FULL translation
- Path: `content/<lang>/publication/<slug>/index.md`
- **Translate:** `title`, `abstract`, `summary`, each `links[].name` (incl.
  commented-out entries — keep them commented but translate the `name`), full
  body (prose + `##`/`###` headings, preserving any emoji prefix).
- **Keep verbatim:** `authors`, `date`, `publishDate`, `doi`,
  `publication_types`, `publication`, `publication_short`, `tags`, all
  `links[].url`/`icon`/`icon_pack`, all `url_*`, `featured`, the `image:` block,
  `projects`, `slides`, and raw HTML/iframe blocks.
- **Assets to copy:** `featured.*` (jpg/png), `cite.bib`, any other non-`.md`
  file in the bundle. Do NOT copy notebooks/scripts/`.zip` (those are posts).

## event — FULL translation
- Path: `content/<lang>/event/<slug>/index.md`
- **Translate:** `title`, `subtitle`, `event` (conference name), `location`,
  `summary`, `abstract`, body prose, and trailing slide-link anchor text
  (`Slides` → `Diapositivas`/`スライド`; `by` → `por`/`：`, name kept).
- **Keep verbatim:** `event_url`, `date`, `date_end`, `all_day`, `publishDate`,
  `authors`, `tags`, `featured`, the `image:` block, all `url_*`, `slides`,
  `projects` (e.g. `- spatial`), `math`, and the Canva/YouTube iframe HTML block.

## projects — FULL translation
- Path: `content/<lang>/projects/<slug>/index.md` (note: `projects`, not `project`)
- **Translate:** `title`, `summary`, each `links[].name`, body prose + headings,
  and the **visible text** of internal cross-references
  (`[Mastering Causal Metrics](/project/intro2causal/)` → translate the bracketed
  text, keep the path).
- **Keep verbatim:** `date`, `external_link`, the `image:` block, `tags`, each
  `links[].url`/`icon`/`icon_pack`, `url_pdf`/`url_slides`/`url_video`, and every
  internal-link **path**. `GitHub` as a link name stays `GitHub`.
- **Assets to copy:** `featured.*`, any gallery images.

## authors — FULL translation
- Path: `content/<lang>/authors/<Folder>/_index.md` (leaf bundle uses `_index.md`)
- **Translate:** `bio`, `role`, `interests[]`, `organizations[].name`,
  `education.courses[].course`, `education.courses[].institution`, the body
  prose, the "Download my CV" sentence (keep the `{{< staticref … >}}` shortcode
  and the `CV` link text), and reader-facing front-matter comments.
- **`user_groups` (special):** for the four student groups, replace with the
  glossary's localized form so it matches `content/<lang>/home/people.md`; for
  `Principal Investigators` / `Alumni *`, keep English.
- **`title` (special):** keep the Latin-script name. For JA only, transliterate
  the PI display name (`Carlos Mendez` → `カルロス・メンデス`) and localize a
  trailing country parenthetical (`(Indonesia)` → `（インドネシア）`).
- **Keep verbatim:** `email`, every `social[]` entry (`icon`/`icon_pack`/`link`),
  `education.courses[].year`, `organizations[].url`, `superuser`,
  `highlight_name`, `_build`.
- **Assets to copy:** the author's own `avatar.*` if present in the EN bundle.
  Normalize the target name to `avatar.<ext>` (do not reproduce `avatar.jpg.png`).

## post — STUB CARD only (NOT a full translation)
- Path: `content/<lang>/post/<slug>/index.md`
- Use `stub-template.md`. **Translate** `title` + `summary` only. **Keep
  verbatim** English `categories[]` and `date`. Add `card_url: "/post/<slug>/"`,
  `featured: false`, `_build: {render: never, list: always, publishResources:
  false}`. Empty body. **Never** emit the reserved `url:` key.
- **Assets:** none (figures would leak harmlessly; `publishResources: false`
  keeps them out).
