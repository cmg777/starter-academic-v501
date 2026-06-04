# Scope block & verification

## Phase-2 SCOPE block (print, then wait for `y`)

```
SCOPE — translate-content
  Source:      content/<section>/<slug>/index.md   (type: <type>, mode: <full|stub>)
  Languages:   es, ja
  Targets:     content/es/<section>/<slug>/index.md   [new | exists → skip/--force]
               content/ja/<section>/<slug>/index.md   [new | exists → skip/--force]
  Translate:   <key list for this type>
  Keep:        <key list — byte-for-byte>
  Assets:      featured.jpg, cite.bib  →  copied verbatim into each target bundle
  Numbers:     "71,682" → es "71 682" / ja "71,682"   (preview of 1-2 figures)
  Glossary:    applied; unmapped proper nouns: <none | list to confirm>
Proceed? (y/n)
```

For `--all-missing`, list the full gap set (grouped by lang + section, with a
total count) instead of a single item, then process sequentially after `y`.

## Verification recipe

After writing all targets, build with the pinned extended binary (mirrors the
Netlify deploy-preview flags, includes future-dated content):

```bash
/tmp/hugo-verify/hugo --gc --minify --buildFuture -b https://example.com --quiet
```

- Binary must be `v0.111.3+extended` (the 0.96–0.119 window the site requires).
  If `/tmp/hugo-verify/hugo` is gone, re-download Hugo 0.111.3 extended there.
  Never use `~/Library/Application Support/Hugo/0.84.2/hugo` (no `continue` keyword).
- A non-zero exit or any new `ERROR` line fails the run — report it, do not claim
  success.
- Spot-check that each new full page emitted `public/<lang>/<section>/<slug>/index.html`,
  and that stub posts did NOT emit a standalone page (render: never) but DO appear
  as teaser cards on `public/<lang>/index.html`.

## Report

Per language/target, print `[✓]` written / `[~]` skipped (exists) / `[✗]` failed,
plus files written, assets copied, and build status. Then offer copy-pasteable
follow-ups (run `scripts/i18n-parity.sh`, translate remaining gaps, commit).
Never auto-commit.
