---
name: update-author-profile
description: Update an existing author profile (or scaffold a new one) under content/authors/ from pasted YAML or freeform notes, keeping the Spanish (/es/) and Japanese (/ja/) counterparts in sync — links/email/URLs copied verbatim, prose translated via the project glossary. Fixes YAML programming typos (curly quotes, bad icon packs, malformed URLs) so the build never breaks, infers the target author and confirms before editing, then verifies with a full Hugo 0.111.3 build + i18n-parity. Leaves changes for review; never commits.
argument-hint: "<author name-or-slug> [pasted YAML or freeform notes] [--create] [--no-build]"
disable-model-invocation: true
user-invocable: true
---

# Update (or create) an author profile, tri-lingually

Apply new profile information to an author bundle under `content/authors/<Folder>/_index.md`
and keep its Spanish (`content/es/authors/<Folder>/`) and Japanese
(`content/ja/authors/<Folder>/`) counterparts in lockstep. The site has **no English
fallback** — an author only appears on `/es/` or `/ja/` if that language's bundle exists and
is current — so **every run touches all three trees**.

The user hands over new information as **either** a full pasted YAML front-matter block **or**
freeform notes ("change his GitHub to X, role to 2027, new personal site Y"). That input often
carries **programming typos** (curly quotes, wrong icon packs, malformed URLs) that would
silently break the Hugo build. This skill applies the intended changes, **normalizes the typos**,
preserves YAML formatting byte-for-byte, syncs the translations, and **verifies the site still
compiles** before handing back.

This is the **edit/create counterpart** to `translate-content` (which only creates translated
copies of an English original). It deliberately **reuses** that skill's author contract rather
than forking it.

## What this skill does NOT do

- **Does not commit or push.** It leaves the edited files in the working tree, prints a diff
  summary, and offers a copy-paste commit. The user runs the commit.
- **Does not invent content.** It applies only what the user supplied; it never fabricates
  bios, links, or affiliations. For create-new, it asks for anything required but missing.
- **Does not generate avatars.** For a new author the user supplies `avatar.jpg` separately;
  the skill only references/normalizes the filename.
- **Does not change query keys.** `authors`/`date`/`tags`/`icon`/`icon_pack`/URLs/`_build`/
  `superuser`/`highlight_name` are copied byte-for-byte unless the user explicitly changes one.

## Reference files (read before acting)

Authoritative translation contract — **reused from `translate-content`, do not duplicate**:
- `../translate-content/references/field-rules.md` → **§authors** — the Translate-vs-Keep table.
- `../translate-content/references/glossary.md` → register (ES neutral LatAm formal *usted*; JA
  です・ます), number localization, term table, DO-NOT-translate list.

This skill's own references:
- `references/edit-rules.md` — diff method, typo-fix catalog, author front-matter schema +
  the valid `icon`/`icon_pack` set, target-author inference (incl. `_Master` edge cases).
- `references/create-new.md` — scaffolding a brand-new author across EN/ES/JA.
- `references/scope-and-verify.md` — the Phase-2 SCOPE block + the build/parity verify recipe.

## Example invocations

```
# Update — paste the new front matter (or notes) after the command.
/project:update-author-profile AbdulahRusli
/project:update-author-profile "Abdulah Rusli"          # inferred from name, then confirmed
/project:update-author-profile HeDu_Master              # explicit slug skips inference

# Freeform notes instead of a YAML block.
/project:update-author-profile YangWenxuan  change github to https://github.com/...,
                                            role to "PhD student 2024-2028"

# Create a brand-new author bundle (EN/ES/JA); avatar supplied separately.
/project:update-author-profile "Jane Doe (Kenya)" --create
```

---

## Phase 1 — Pre-flight (read-only)

1. **Parse arguments.** Separate the target (name/slug) from the payload (a pasted YAML block
   *or* freeform notes) and flags (`--create`, `--no-build`).
2. **Load the contract.** Read `../translate-content/references/field-rules.md` (§authors) and
   `../translate-content/references/glossary.md`, plus this skill's `references/edit-rules.md`.
3. **Resolve the target author.** Match the given name/slug against `content/authors/*/` folders
   per `edit-rules.md` (title text, folder slug, country parenthetical). Handle edge cases:
   - `_Master`-suffixed folders are **distinct** profiles — never silently pick one over the
     other; if both `<Name>` and `<Name>_Master` exist, surface both and let Phase 2 confirm.
   - Duplicate/ambiguous names → list candidates for confirmation.
   - **No match** → this is a **create-new** flow (proceed only if `--create` or the user
     confirms in Phase 2); load `references/create-new.md`.
4. **Read current state.** Read the EN `_index.md` and its ES + JA counterparts. For an update,
   compute the per-field diff (old → new) applying only the fields the user actually changed.
   Detect typos in the payload (curly quotes, bad icon packs, malformed URLs).

## Phase 2 — Confirm scope (print SCOPE, ask, wait for `y`)

Use `AskUserQuestion` and/or print the **SCOPE block** from `references/scope-and-verify.md`.
For an **update**, show: matched folder (flagging `_Master`/ambiguity), the field-level diff,
the **typos found and how they'll be fixed**, and the three target files. For **create-new**,
show the resolved slug, prompt for any required-but-missing field and for `user_groups`, and
remind the user to drop `avatar.jpg` into each bundle. **Wait for explicit `y`.** Do not edit
before confirmation.

## Phase 3 — Apply

Edit **EN first**, then ES + JA, following `edit-rules.md` and field-rules §authors:

- **Links / email / URLs / icons:** copy **verbatim** from the finalized EN into ES + JA. They
  are identical across all three languages — a link change must land in all three.
- **Prose** (`bio`, `role`, `interests[]`, `organizations[].name`, `education.courses[].course`
  + `institution`, body): **translate** into ES (formal *usted*) and JA (です・ます) per the
  glossary; keep existing localized forms (e.g. ES `Universidad de Nagoya`, JA `名古屋大学`,
  JA en-dash year ranges `2023–2027`).
- **`user_groups`:** the four student groups use each language's localized form; PI/Alumni stay
  English (see field-rules §authors).
- **Preserve YAML byte-for-byte** except the values that changed: same indentation, same
  `- icon:` / `  icon_pack:` / `  link:` key order, same blank lines and trailing comment block.
- **Fix typos while applying:** curly→straight quotes, `icon_pack` to the valid set, URL
  scheme/whitespace. Use the `Edit` tool with unique anchors; never rewrite a whole file when a
  targeted edit suffices.

## Phase 4 — Verify & report

Run the verification recipe in `references/scope-and-verify.md`:

1. **Build** with `/tmp/hugo-verify/hugo --gc --minify --buildFuture --quiet` (re-download the
   0.111.3 extended binary there if it's gone; never use the on-disk 0.84.2). Require **exit 0**
   and **no new `ERROR`** line.
2. **Sanity checks:** grep the three edited files for residual curly quotes `“ ” ‘ ’` (must be
   none); confirm `social[]` links are identical across EN/ES/JA; confirm no stale old URLs
   remain.
3. **Parity:** `bash scripts/i18n-parity.sh --section authors` → expect **0 gaps**.

Then print a `[✓]/[~]/[✗]` report per file with the field diff, plus copy-paste follow-ups
(commit the 3 files, run full `scripts/i18n-parity.sh`). **Never claim success on a non-zero
exit. Never auto-commit.**
