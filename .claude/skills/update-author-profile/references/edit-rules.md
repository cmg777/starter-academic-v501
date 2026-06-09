# Edit rules — diffing, typo-fixing, schema, target inference

Reference for the **update** path. The translation contract (which fields to translate vs keep)
lives in `../../translate-content/references/field-rules.md` §authors and the glossary; this file
covers the **edit mechanics** that are specific to applying user-supplied changes in place.

---

## 1. The diff method

The user supplies either a **full pasted YAML block** or **freeform notes**. Either way:

1. Read the current `content/authors/<Folder>/_index.md`.
2. Compute a **field-level diff** — old value → new value — for each front-matter key the user
   actually changed. For a pasted block, compare key-by-key; for freeform notes, map each
   instruction to its key.
3. **Touch only changed fields.** Leave everything else byte-for-byte:
   - Always-preserve unless explicitly changed: `_build`, `email`, `superuser`,
     `highlight_name`, `title`, `user_groups`, `organizations[].url`, `date`, and any `social[]`
     entry the user did not mention.
   - Unchanged prose stays unchanged (don't re-translate ES/JA for fields that didn't move).
4. **Never reorder keys or restructure** the file. Same indentation, same list-item order, same
   blank lines and trailing comment block. Use targeted `Edit` calls with unique anchors.

## 2. Typo-fix catalog (apply silently while editing; report in SCOPE)

User input frequently carries these — fix them so the YAML parses, **without changing intent**:

| Symptom | Why it breaks | Fix |
|---|---|---|
| Curly/smart quotes `“ ” ‘ ’` in a value | Goldmark/YAML: an opening straight `"` with a curly `”` close is an **unterminated string** → build fails | Replace all curly quotes with straight ASCII `"` (or `'`) |
| Unbalanced / missing closing quote | Unterminated scalar | Balance the quotes; quote the whole value once |
| Wrong `icon_pack` (e.g. `fas` for a brand icon) | Icon renders blank / theme warning | Normalize to the valid pack for that icon (see §3) |
| URL missing scheme or with stray spaces | Broken link / YAML parse oddities | Add `https://`, trim whitespace |
| Tab characters for indentation | YAML forbids tabs | Convert to the file's 2-space indentation |
| Full-width punctuation leaking into EN values | n/a for build, but wrong for EN | Use ASCII in EN; keep full-width only in JA prose |

Always **report** what was fixed in the Phase-2 SCOPE block so the change is transparent.

## 3. Author front-matter schema + valid icon set

Union of keys seen across `content/authors/*/_index.md`:

```
_build: {render, list}        # render/list flags (students use render: always)
bio:                          # one-line research summary  (TRANSLATE)
education:
  courses:
  - course:                   # degree            (TRANSLATE)
    institution:              # school            (TRANSLATE)
    year:                     # KEEP verbatim
email:                        # KEEP verbatim (often "x" placeholder)
interests:                    # list              (TRANSLATE)
- "..."
organizations:
- name:                       # affiliation       (TRANSLATE)
  url:                        # KEEP verbatim
role:                         # e.g. "PhD student 2023-2027"  (TRANSLATE)
social:                       # KEEP verbatim (icon/icon_pack/link)
- icon: <name>
  icon_pack: <fa|fas|fab|ai>
  link: <url>
superuser: false              # KEEP verbatim
title:                        # display name + country parenthetical  (special, see field-rules)
highlight_name:               # KEEP verbatim (PI only)
user_groups:                  # localized for 4 student groups; PI/Alumni English
- <group>
```

**Valid `icon` / `icon_pack` combinations** observed in the repo (use these; don't invent):

| icon | icon_pack | purpose |
|---|---|---|
| `address-card` | `fa` | personal website |
| `open-data` | `ai` | data / blog / project page |
| `researchgate` | `ai` | ResearchGate |
| `orcid` | `ai` | ORCID |
| `google-scholar` | `ai` | Google Scholar |
| `github` | `fab` | GitHub |
| `linkedin` | `fab` | LinkedIn |
| `twitter` | `fab` | X / Twitter |
| `envelope` | `fa` | email link |
| `address-book` | `fa` | researchmap / directory |

(`fa` = Font Awesome solid alias used in these files, `fab` = brands, `ai` = academicons.)

## 4. Target-author inference

Resolve the user's "name or slug" to exactly one folder under `content/authors/`:

1. **Exact slug match** (`AbdulahRusli`, `HeDu_Master`) → use it directly.
2. **Name match** — compare against each folder's `title:` (strip the country parenthetical,
   e.g. `Abdulah Rusli (Indonesia)` → `Abdulah Rusli`) and the folder slug.
3. **`_Master` edge case** — a `<Name>` and `<Name>_Master` folder are **two different profiles**
   (e.g. a student's PhD vs Master record). Never auto-pick; if both exist or the name is
   ambiguous about which, **list both and confirm in Phase 2**.
4. **No match** → create-new flow (see `create-new.md`); only proceed with `--create` or explicit
   user confirmation. Never silently create a folder.

Always echo the resolved folder in the SCOPE block before editing.
