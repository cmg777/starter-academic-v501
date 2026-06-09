# Scope block & verification

## Phase-2 SCOPE block

Print this (filled in), then wait for explicit `y` before editing.

### Update variant
```
SCOPE — update-author-profile
  Author:    content/authors/<Folder>/          [matched from "<input name/slug>"]
             (⚠ also exists: <Folder>_Master — confirm this is the right one)   # only if ambiguous
  Languages: en, es, ja  (all three kept in sync)
  Targets:   content/authors/<Folder>/_index.md
             content/es/authors/<Folder>/_index.md
             content/ja/authors/<Folder>/_index.md
  Changes (field → new value):
    role         "PhD student 2023-2026"  →  "PhD student 2023-2027"
    bio          <old…>  →  <new…>
    social[address-card].link   https://old  →  https://new
    education.courses[0]         M.A. / Univ A  →  M.Sc. / Univ B
  Typos fixed:   interests: curly ” → "  ;  role: curly ” → "
  Translate:     bio, role, interests, education.course/institution  (es: usted, ja: です・ます)
  Keep verbatim: email, social links, organizations.url, _build, superuser, title, user_groups
Proceed? (y/n)
```

### Create-new variant
```
SCOPE — update-author-profile (CREATE NEW)
  No author matched "<input>". Will scaffold a new bundle:
  Slug:        content/authors/<Folder>/        (+ es/ + ja/)
  user_groups: <group>   (es: <…>, ja: <…>)
  Fields:      title, role, bio, interests, organizations, social[…]
  Missing →    <list any required field still needed>
  Avatar:      you supply avatar.jpg in each of the 3 bundles (not generated)
Proceed? (y/n)
```

## Verification recipe (Phase 4)

Run after writing all targets unless `--no-build` was passed.

1. **Build** (mirrors Netlify deploy-preview flags, includes future-dated content):
   ```bash
   /tmp/hugo-verify/hugo --gc --minify --buildFuture --quiet
   ```
   - Binary must be `v0.111.3+extended` (the 0.96–0.119 window the site requires). If
     `/tmp/hugo-verify/hugo` is gone, re-download Hugo 0.111.3 extended there. **Never** use
     `~/Library/Application Support/Hugo/0.84.2/hugo` (no `continue` keyword → fails).
   - A **non-zero exit** or any new **`ERROR`** line fails the run. Report it; do not claim success.
     (A lone `.Path … deprecated` `WARN` is benign — pre-existing on this site.)

2. **Quote & link sanity** on the three edited files:
   ```bash
   grep -n $'[“”‘’]' content/authors/<F>/_index.md content/es/authors/<F>/_index.md content/ja/authors/<F>/_index.md   # expect none
   grep -n "link:" content/{,es/,ja/}authors/<F>/_index.md | sort   # social links identical across langs
   ```
   Also confirm no stale old URL remains in any of the three.

3. **i18n parity:**
   ```bash
   bash scripts/i18n-parity.sh --section authors    # expect: 0 gaps (exit 0)
   ```

## Report

Print, per file, `[✓]` written / `[~]` unchanged / `[✗]` failed, with the field-level diff and
the build/parity status. Then offer copy-paste follow-ups:
```
git add content/authors/<F>/_index.md content/es/authors/<F>/_index.md content/ja/authors/<F>/_index.md
git commit -m "docs(authors): update <Name> profile (EN/ES/JA)"
bash scripts/i18n-parity.sh        # full check, all sections
```
**Never auto-commit. Never claim success on a non-zero build exit.**
