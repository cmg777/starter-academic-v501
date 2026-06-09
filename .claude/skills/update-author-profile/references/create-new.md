# Create-new author scaffolding (EN / ES / JA)

Used when Phase 1 finds **no matching author** and the user confirms (or passes `--create`).
Produces three bundles that satisfy the same i18n contract as an update: prose translated,
links/IDs copied verbatim. The translation rules are unchanged — see
`../../translate-content/references/field-rules.md` §authors and the glossary.

---

## 1. Bundles to create

```
content/authors/<Folder>/_index.md        # English (authoritative)
content/es/authors/<Folder>/_index.md      # Spanish  (prose translated)
content/ja/authors/<Folder>/_index.md      # Japanese (prose translated)
```

`<Folder>` follows the repo convention: CamelCase `FirstnameLastname` (e.g. `JaneDoe`), with a
`_Master` suffix only if this is a Master-level record distinct from an existing PhD one.

## 2. Required fields — prompt for any the user didn't supply

Before writing, make sure you have: display `title` (with country parenthetical, e.g.
`Jane Doe (Kenya)`), `role` (e.g. `PhD student 2024-2028`), `bio`, at least one `interests`
entry, `organizations` (default `Nagoya University` / `https://www4.gsid.nagoya-u.ac.jp/en/`
unless told otherwise), and the `social` links the user has. **Prompt in Phase 2** for anything
required but missing; never fabricate.

## 3. `user_groups` (ask explicitly)

Pick the English group for the EN file; ES/JA use the localized form per field-rules §authors:

| English (EN file) | ES | JA |
|---|---|---|
| `Doctoral students` | `Estudiantes de doctorado` | `博士課程学生` |
| `Doctoral students (sub advisor)` | (localized per home/people.md) | `博士課程学生（副指導）` |
| `Master students` | `Estudiantes de maestría` | `修士課程学生` |
| `Master students (sub advisor)` | (localized per home/people.md) | `修士課程学生（副指導）` |
| `Principal Investigators` / `Alumni *` | **kept English** | **kept English** |

Confirm the exact localized strings against `content/es/home/people.md` and
`content/ja/home/people.md` so the People widget filters correctly.

## 4. `_build` and other boilerplate

Students use:
```yaml
_build:
  render: always
  list: always
```
Set `superuser: false`, `email: "x"` (placeholder unless a real address is given). Body prose is
optional; if present, translate it and keep any `{{< staticref … >}}` shortcode intact.

## 5. Avatar

The author image is supplied by the user, not generated. Tell the user to place `avatar.jpg`
(or `.png`) into **each** of the three bundles; normalize the filename to `avatar.<ext>` (never
`avatar.jpg.png`). `scripts/i18n-parity.sh --section authors` warns on a missing ES/JA avatar.

## 6. Verify

Same recipe as an update (`scope-and-verify.md`): full Hugo build → exit 0, no `ERROR`; then
`bash scripts/i18n-parity.sh --section authors` → 0 gaps (the new EN item now has both
counterparts). Spot-check that `public/authors/<folder-lowercased>/index.html` and the
`/es/` + `/ja/` equivalents were emitted.
