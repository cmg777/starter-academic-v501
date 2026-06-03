# Bilingual site: Spanish homepage + geolocation auto-language (Japanese-ready)

**Date:** 2026-06-04

## Background

The site was English-only. Goal: let homepage visitors read the site in English or
Spanish via a top-right switcher, and **automatically** serve Spanish to visitors
whose IP geolocates to a Spanish-speaking country (all of Latin America + Spain +
Equatorial Guinea). The infrastructure had to be multi-language *by design* so that
Japanese (`/ja/`) — and full sub-page translation — can be added later as a small,
additive change, not a redesign.

Scope (confirmed with the owner): translate the **homepage** and the specific items
it shows. Featured publications, projects, events, and student profiles get **full
Spanish sub-pages**; the **Posts & Tutorials cards** get translated title/summary but
**link to the existing English tutorials** (their long, code-heavy bodies stay
English). Courses and all other sub-pages stay English for now.

## Architecture

**Content layout — module mounts, no file move.** English stays in `content/`
(served at `/`); Spanish lives in `content/es/` (served at `/es/`). Rather than the
Wowchemy-documented "move English into `content/en/`" approach (which would have
broken the `content/post/…`, `content/publication/…` paths the whole skills system +
`CLAUDE.md` depend on), `config/_default/config.yaml` defines explicit
`module.mounts`:

```yaml
mounts:
  - {source: content,    target: content, lang: en, excludeFiles: 'es/**'}
  - {source: content/es, target: content, lang: es}
  - {source: assets, target: assets}      # the remaining default mounts must be
  - {source: static, target: static}      # re-declared once any `mounts` are set,
  - {source: layouts, target: layouts}    # or the project's own assets/layouts/etc.
  - {source: data, target: data}          # stop loading
  - {source: i18n, target: i18n}
  - {source: archetypes, target: archetypes}
```

`excludeFiles: 'es/**'` keeps English from also rendering the Spanish tree; the
more-specific `content/es` mount serves it under `/es/`. `defaultContentLanguageInSubdir`
stays `false`, so **English URLs are unchanged** (no `/en/` prefix).

**Languages.** `config/_default/languages.yaml` defines `en` (weight 1) + `es`
(weight 2: Spanish title/description + a Spanish nav menu) and a commented `ja`
template. `params.yaml`: `main_menu.show_language: true` turns on the theme's built-in
globe-dropdown switcher (it auto-appears once a page `.IsTranslated`).

**Spanish homepage.** `content/es/home/` mirrors the active widgets of `content/home/`
(`index.md` + hero2-new, about, researchLab, featured, talks, posts, projects, people,
alumni-link, gallery, contact), with text translated and all query/design blocks kept
identical. The bio comes from `content/es/authors/admin/_index.md` (avatar copied into
the bundle — resources are per-language). The dynamic widgets query the *current
language's* `site.RegularPages`, so Spanish sub-pages dropped under `content/es/…` are
picked up automatically with **zero template changes**.

**Tutorial cards that link to English.** New backward-compatible tweak in
`layouts/partials/tutorial_card.html`: it now honours an optional `card_url` front-matter
key (`{{ with $p.Params.card_url }}{{ $href = . }}{{ end }}`) — English posts set none
and are unchanged. The 6 Spanish stubs at `content/es/post/<slug>/index.md` carry a
translated title/summary, verbatim English `categories` (so topic colour/icon + the
language chip still resolve), `card_url: "/post/<slug>/"`, and
`_build: {render: never, list: always}` so they feed the teaser without emitting an
orphan page. **Do NOT use the reserved `url:` key** — it would relocate the stub and
collide with the English URL.

**Geolocation routing.** `netlify/edge-functions/geo-lang.ts` (free tier, homepage-only
via `config.path = "/"`) reads `context.geo.country.code`; if it's in the Spanish-speaking
list and there's no override, it 302s `/ → /es/`. A manual switch is remembered via a
`lang_pref` cookie set by `assets/js/lang-pref.js` (registered through `params.yaml`
`plugins_js`); a `geo_seen` cookie makes the auto-redirect fire **at most once**.
SEO-safe: 302 (not a rewrite/cloak), `Cache-Control: private,no-store` +
`Netlify-Vary`, no user-agent sniffing. `layouts/partials/custom_head.html` adds the
`x-default` hreflang (→ English home; the theme already emits reciprocal `hreflang` +
self-canonical).

## Hugo version note

Verified the full site + Spanish build cleanly on **Hugo 0.111.3 extended**. The repo's
`event.html` already uses `continue` (Hugo ≥0.96), so the local 0.89.4/0.80/0.73 binaries
can't build it, and brew 0.155 is too new for Wowchemy v5 (`paginate`/`GoogleAnalytics`
removed). `netlify.toml` still pins `0.89.4`, but `origin/master` already ships the
`continue` code and deploys — so Netlify is already using ≥0.96 via env override and the
pin is stale-but-harmless. Recommended window for local/CI: **0.96–0.119** (Goldmark, so
the Blackfriday-removal caution at 0.100 does not apply). Preview binary kept at
`/tmp/hugo-verify/hugo`.

## Known minor issue

Because both mounts target `content`, a translated bundle's virtual directory is the
*union* of its en + es files. The 6 thin tutorial stubs therefore inherit and republish
the English bundle's small figure/script files under `/es/post/<slug>/` (a few MB;
`.zip`s are 26–45 KB each; `publishResources:false` does not suppress them because they
belong to the en mount). Harmless and bounded — publications/projects/events don't leak
extra (their es bundles already hold every resource). If a pristine `/es/` is wanted
later, drive the es teaser from a data file instead of stubs.

## Adding Japanese later (additive only)

1. `languages.yaml`: uncomment/translate the `ja` block.
2. `config.yaml`: add a `content/ja` mount (`lang: ja`), change the en mount's
   `excludeFiles` to `'{es,ja}/**'`, and set `hasCJKLanguage: true`.
3. `geo-lang.ts`: add `JP: "/ja/"` + `"ja"` to `KNOWN_LANGS`; `lang-pref.js`: add `ja: 1`.
4. Content: `content/ja/…` mirroring `content/es/…`. No template/structural changes.

## Verification

`hugo --gc` clean (only a `.Path` deprecation warning). `/es/` renders all 11 sections;
switcher cross-links `/ ↔ /es/`; featured pubs, events (`/es/talk/…`), projects, and 12
students populate in Spanish; the 6 tutorial cards show Spanish text and link to
`/post/<slug>/` (English) with thumbnails. English output is unchanged (home 102 882 B;
all sub-pages intact). hreflang on `/es/`: `en`, `es-es`, `x-default → /`, self-canonical.
Translations are first drafts for the owner's review. The geo-redirect requires a Netlify
deploy preview (or `netlify dev`) to exercise — it can't run under `hugo server`.
