# 2026-06-05 — Translate the remaining English-only pages + extend the i18n system

## Why

After the 2026-06-04 backfill, publications/events/projects/authors/post-stubs
were at full ES/JA parity, but a handful of **standalone pages were still
English-only** and not covered by the translation system, so a `/es/` or `/ja/`
visitor could still land on English: the **Courses** page (omitted from the es/ja
menus to avoid a 404), the **Alumni** page (the homepage Alumni link pointed at
the English `/alumni/`), the **Slides** demo deck, and the draft **Privacy/Terms**
pages. Goal: make the system cover **all page types except posts/tutorials**
(whose long bodies stay English via stub cards), and extend the tooling so the
new pages are tracked going forward.

## What changed

Branch `i18n-remaining-pages` (off `master`).

- **Courses** — `content/{es,ja}/courses/_index.md` (translated title/intro/course
  names/link text; external URLs, icons, `<style>` kept; `#posts` anchors
  localized to `/es/#posts` / `/ja/#posts`), `featured.webp` copied. Added a
  localized **Courses menu item** (`Cursos` / `コース`, weight 70 → `/es/courses/`,
  `/ja/courses/`) to `config/_default/languages.yaml` and refreshed the stale
  "menus omit Courses" comments.
- **Alumni** — `content/{es,ja}/alumni/{index.md,people.md}` (title `Egresados` /
  `修了生`; the four Alumni `user_groups` kept in **English** as query keys, which
  match the already-translated alumni author profiles). Fixed
  `content/{es,ja}/home/alumni-link.md` to link `/es/alumni/` and `/ja/alumni/`
  (were both pointing at the English `/alumni/`).
- **Slides** — `content/{es,ja}/slides/example/index.md` (prose/headings/notes
  translated; reveal.js front matter, code, math, and shortcodes kept verbatim).
- **Privacy/Terms** — `content/{es,ja}/{privacy,terms}.md` (title + placeholder
  body translated; `draft: true` and the rest of the front matter mirrored — they
  stay unpublished until `draft: false`).
- **Parity checker** (`scripts/i18n-parity.sh`) — added a `slides` row to
  `SECTION_CONFIG` and a new `SINGLETON_CONFIG` (courses/_index.md,
  alumni/index.md, alumni/people.md, privacy.md, terms.md) with a singleton loop
  reported under the pseudo-section `page`. Verified the MISSING branch fires
  (temporarily hid `content/es/terms.md` → exit 1 + correct TSV → restored).
- **Docs/rules** — `field-rules.md` (courses/alumni/slides/page entries),
  `glossary.md` (Courses/Alumni/Privacy/Terms terms; branded course names stay
  English), `SKILL.md` (`--type courses|alumni|slides|page`), and `CLAUDE.md`
  (REQUIRED rule extended; intro + menu notes updated).

## Result / verification

`bash scripts/i18n-parity.sh` → **0 gaps** for es and ja, now including
`slides 1/1` and the singleton pages. Hugo 0.111.3 `--gc --minify --buildFuture`
builds clean. Posts/tutorials unchanged (stub cards only). Spot-check: `/es/` and
`/ja/` navbars show Courses; the homepage Alumni callout links to the localized
alumni page; `/es/alumni/` lists the translated alumni author cards.

## Not changed

- Tutorial-post **bodies** stay English by design (stub-card approach kept).
- Privacy/Terms remain `draft: true` (translations prepared for when published).
