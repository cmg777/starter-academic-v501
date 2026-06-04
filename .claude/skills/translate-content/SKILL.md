---
name: translate-content
description: Translate a content bundle (publication, event, project, or author profile) into Spanish (/es/) and Japanese (/ja/), or generate the ES/JA stub card for a tutorial post. Full translations rewrite only reader-facing fields, keep query keys / URLs / DOIs / tags byte-for-byte, copy non-md assets (featured.*, cite.bib, avatar.*), apply the project glossary, and localize numbers per language; post stubs produce a card-only index.md that links back to the English tutorial. Detects content type from the path, is idempotent (skips existing targets unless --force), and verifies the result builds under the pinned Hugo 0.111.3. Confirms scope before writing.
argument-hint: "<slug-or-section/slug> [--lang es|ja|all] [--all-missing] [--type publication|event|project|post|author|courses|alumni|slides|page] [--force]"
disable-model-invocation: true
user-invocable: true
---

# Translate content into Spanish (/es/) and Japanese (/ja/)

Produce the Spanish and/or Japanese counterpart of an English content bundle so
it appears on the translated homepages. The site has **no English fallback** —
a `/es/` or `/ja/` homepage widget only shows items that exist under
`content/es/<section>/` or `content/ja/<section>/`. This skill creates those
counterparts following the repo's established per-type patterns.

It is the mechanism behind the CLAUDE.md rule "Translate new content (REQUIRED)".

## What this skill does NOT do

- **Does not invent or edit English content.** The English bundle is the
  authoritative source; the skill only produces translated copies.
- **Does not touch query keys.** `authors`, `tags`, `categories`, `date`,
  `doi`, `publication_types`, URLs, `icon`/`icon_pack`, the `image:` block,
  `_build`, slugs — all copied byte-for-byte. Only reader-facing fields and prose
  change.
- **Does not commit or push.** It leaves the new files in the working tree and
  offers a follow-up commit. The user runs the commit.
- **Does not translate post bodies.** Tutorial posts get a stub card only (the
  card links to the English tutorial).

## Example invocations

```
# Auto-detect type + section, translate into both es and ja.
/project:translate-content 20251006-SIR
/project:translate-content publication/20251006-SIR --lang es
/project:translate-content event/20240826ERSA --lang all
/project:translate-content projects/ccm
/project:translate-content authors/AbdulahRusli --lang ja

# Tutorial post → ES/JA stub cards (not a full translation).
/project:translate-content python_double_lasso --type post

# Backfill every English-only item that lacks a counterpart.
/project:translate-content --all-missing --lang all

# Overwrite an existing (e.g. stale) translation.
/project:translate-content 20251006-SIR --force
```

## Reference files (read before generating)

- `references/glossary.md` — register, number localization, EN|ES|JA term table,
  DO-NOT-translate list. The single source of terminology.
- `references/field-rules.md` — per-type Translate-vs-Keep field tables + assets.
- `references/stub-template.md` — canonical post stub-card front matter.
- `references/scope-and-verify.md` — the SCOPE block and the build-verify recipe.

---

## Phase 1 — Pre-flight

1. **Parse `$ARGUMENTS`.** First positional token is `<slug>` or
   `<section>/<slug>`. Flags: `--lang` (`es`|`ja`|`all`, default `all`),
   `--all-missing`, `--type` (override detection), `--force`. Reject unknown flags.
2. **Resolve section + type.** If the arg includes a section, use it. Otherwise
   search `content/{publication,event,projects,authors,post}/` for a matching
   item dir and infer the type. `--type` overrides. Section→type map:
   `publication`→publication, `event`→event, `projects`→project,
   `authors`→author, `post`→post. Error if not found or ambiguous.
   **Singleton pages** (one file, not a dir of items) are also covered — `courses`
   (`content/courses/_index.md`), `alumni` (`content/alumni/{index.md,people.md}`),
   `slides` (`content/slides/<deck>/`), and `page` (root `privacy.md`/`terms.md`);
   pass `--type` for these. See `field-rules.md` for their Translate-vs-Keep rules.
   Everything except posts/tutorials gets a full translation; posts stay stub-cards.
3. **Locate the English source.** publication/event/project →
   `content/<section>/<slug>/index.md`; author →
   `content/authors/<Folder>/_index.md`; post → `content/post/<slug>/index.md`.
   Read it fully.
4. **Read references.** `glossary.md` + `field-rules.md` always; `stub-template.md`
   for posts; `scope-and-verify.md` for the scope/verify steps.
5. **Compute targets** for each requested language and note which already exist
   (idempotency).

## Phase 2 — Confirm scope (MANDATORY)

Print the SCOPE block from `references/scope-and-verify.md` (source, type, mode,
target langs/paths + new/exists status, Translate-vs-Keep summary, assets to
copy, a 1–2 figure number-localization preview, and any proper noun missing from
the glossary that needs confirmation). **Wait for `y`.** For `--all-missing`,
present the full grouped gap list with a total count first.

## Phase 3 — Generate

Per type (see `field-rules.md` for the exact field split):

1. **Full translation (publication / event / project / author).** Copy the
   English front matter; rewrite ONLY the Translate-list keys for that type
   (apply the glossary term table; localize numbers per language; handle the
   `user_groups` and author-`title` special cases). Leave every Keep-list key
   byte-identical. Translate the body prose + headings (preserve emoji prefixes,
   raw HTML/iframe blocks, code, math, and internal-link paths — translate only
   visible link text). Apply the register (usted / です・ます).
2. **Stub card (post).** Fill `references/stub-template.md`: translate
   `title` + `summary`; copy `date` and English `categories[]`; set `card_url`,
   `featured: false`, `_build: {render: never, list: always, publishResources:
   false}`; empty body. Never emit `url:`.
3. **Copy assets.** For full translations, copy every non-`.md` file from the
   English bundle into the target bundle (`featured.*`, `cite.bib`, gallery
   images; author `avatar.*` normalized to `avatar.<ext>`). Stubs copy nothing.
4. **Write** `content/<lang>/<section>/<slug>/index.md` (author: `_index.md`).
   **Idempotency:** if the target index already exists and `--force` is not set,
   skip and report `[~] skipped (exists)`.
5. **`--all-missing`.** Prefer the parity-checker worklist
   (`scripts/i18n-parity.sh --list --lang <L>`); else enumerate every English
   item under the full-translation sections + `content/post/` and keep those
   with no counterpart. Process sequentially; respect `--force` per item.

## Phase 4 — Verify & report

Run the build per `references/scope-and-verify.md`
(`/tmp/hugo-verify/hugo --gc --minify --buildFuture`). A non-zero exit or new
`ERROR` line fails the run. Print the `[✓]/[~]/[✗]` report and copy-pasteable
follow-ups (run `scripts/i18n-parity.sh`, translate remaining gaps, commit).
Never auto-commit.

## Guardrails

- Touch only `content/es/**` and `content/ja/**`. Never edit English content,
  `config/`, `layouts/`, or `netlify.toml`. If a build error points at an English
  file, report it — do not "fix" it here.
- When a term is not in the glossary and has no obvious established translation,
  surface it in the SCOPE block and ask, rather than guessing.
