# 2026-06-04 — i18n auto-translation workflow + full ES/JA backfill

## Why

The site is trilingual (EN `/`, ES `/es/`, JA `/ja/`) with **no English fallback**:
a `/es/` or `/ja/` homepage widget only shows items that have an explicit
counterpart under `content/<lang>/…`. Previously the translated trees were tiny
and had drifted from English (publications 3/40, events 5/30, projects 5/7,
authors 13/42, post-stubs 6/82), and there was no tooling — translations were
done by hand. Every new paper/talk/event/project silently failed to reach
`/es/` and `/ja/`. Goal: make trilingual upkeep sustainable for future
additions **and** backfill the entire existing English-only backlog.

## What was built (infrastructure)

Branch: `i18n-auto-translate` (off `master`). Commit `d3e2e22`.

- **`.claude/skills/translate-content/`** — a user-invocable skill
  (`/project:translate-content <slug> [--lang es|ja|all] [--all-missing]
  [--type …] [--force]`) that translates a bundle into ES+JA (full translation
  for publication/event/project/author; stub card for posts), keeps query keys
  /URLs/DOIs/tags verbatim, copies non-md assets, localizes numbers, and
  verifies the build. References: `glossary.md` (register + number rules +
  seeded EN|ES|JA term table + DO-NOT-translate list), `field-rules.md`
  (per-type Translate-vs-Keep tables + `user_groups` special case),
  `stub-template.md`, `scope-and-verify.md`.
- **`scripts/i18n-parity.sh`** — reports EN items lacking an ES/JA counterpart,
  grouped by lang+section, with a summary and exit codes (0 none, 1 missing,
  2 stale w/ `--strict-stale`, 3 asset w/ `--strict-assets`). `--list` emits a
  TSV worklist that drives `--all-missing`. Mode (full vs stub) is declared per
  section; authors use `_index.md`, others `index.md`.
- **`scripts/hooks/pre-commit`** — runs the checker on commit in report-only
  mode (enable via `git config core.hooksPath scripts/hooks`). Flip `GATE=1`
  now that the backlog is clear to make it an enforced gate.
- **CLAUDE.md** — two new bullets in the Internationalization section: a
  REQUIRED "translate new content" rule and the mechanism/glossary pointer.

## Backfill (full) — 338 files, ES+JA

Done on the feature branch, cheapest→heaviest, parallelized with subagents,
each batch reading the same glossary + field rules. Per-phase: write → copy
assets centrally → `git status` safety check (only `content/{es,ja}/**`
changed) → `scripts/i18n-parity.sh` → Hugo 0.111.3 build → commit.

| Phase | Section | Each lang | Commit |
|------|---------|-----------|--------|
| 1 | projects (`ds4ds`, `gdo-cambodia`) | 2 full | `fa9a8a3` |
| 2 | authors (all Alumni-group profiles) | 29 full + avatars | `0485bc7` |
| 3 | post stubs | 76 card stubs | `0c1fa8f` |
| 4 | events | 25 full + featured img | `70642a8` |
| 5 | publications | 37 full + featured/cite.bib | `4c55122` |

Heaviest items handled by dedicated subagents: `20260528-EM` (461-line research
summary with a Mermaid diagram, a Markdown table, blockquotes, and an embedded
AI-podcast player) and `20250401-SEA` (SoundCloud embed + replication-notebook
list). Mermaid structure/IDs/style directives, table separators, iframes, and
the podcast player's JS were kept verbatim; only human-readable text translated.

## Result / verification

`scripts/i18n-parity.sh` → **0 gaps** for every section, both languages
(publications 40/40, events 30/30, projects 7/7, authors 42/42, post 82/82).
Hugo 0.111.3 `--gc --minify --buildFuture` builds clean (exit 0; only the
pre-existing `.Path` deprecation warning). `/es/` and `/ja/` homepages render
translated featured publications, talks, projects, tutorials, and 13 student
cards; stub posts emit no standalone page but appear as teaser cards linking to
the English tutorial; events match English (list page only — the site emits no
per-event standalone pages by design).

## Conventions confirmed (for future translations)

- Register: ES = neutral Latin American Spanish, formal `usted`; JA = です・ます.
- Numbers (prose only): ES decimal comma + space thousands for 5+ digits + space
  before `%`; JA Western numerals. Never reformat front matter/DOIs/URLs/dates.
- `user_groups`: only the four student groups are localized (to match
  `content/<lang>/home/people.md`); `Principal Investigators`/`Alumni *` stay
  English (People widget doesn't filter them). All 29 backfilled authors are
  Alumni-group, so their `user_groups` stayed English.
- Known EN-source gaps were translated faithfully, not "fixed": placeholder
  student bios, and the mis-copied "north-eastern China" dissertation title on
  SuleimanHussein/MinhThu (noted in CLAUDE.md) carried through into ES/JA.

## Follow-ups (not done)

- Push `i18n-auto-translate` and open a PR / merge to `master` (user decision).
- After merge, flip `scripts/hooks/pre-commit` `GATE=1` and optionally add a
  `.github/workflows/i18n-parity.yml` PR gate.
- Fix the EN-source content gaps (placeholder bios, the mis-copied dissertation
  title) at the English source, then re-run `/project:translate-content --force`
  for the affected slugs.
