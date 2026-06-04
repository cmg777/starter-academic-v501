# Project status — trilingual i18n audited & revised; homepage 500 fixed

**Date:** 2026-06-04
**Branch/commit:** `master` @ `c038718` (live on Netlify; local == `origin/master`, clean)

## TL;DR
The trilingual site (EN `/`, ES `/es/`, JA `/ja/`) was **audited and revised** today across both
non-default languages, and a **critical production bug** — every first-time visitor from a mapped
country getting an HTTP 500 on the homepage — was found and fixed. The site is healthy and live;
remaining items are EN-sourced content gaps (placeholder bios), not defects.

## Today's work (three commits, in order)

1. **`65deb7b` — Japanese audit + homepage 500 fix + translation polish**
   - **Critical fix:** `netlify/edge-functions/geo-lang.ts` was mutating `Response.redirect()`'s
     immutable headers (`headers.set(...)` → `TypeError`), so `GET /` returned **500** for every
     first-time visitor from Japan / Spain / Latin America. Rebuilt the redirect via the `Response`
     constructor (mutable headers) and wrapped the body in `try/catch` so the homepage can never 500
     on a routing error. Reproduced + verified in Node; confirmed live (`/` → 302 `/ja/`, not 500).
   - Multi-agent JA translation audit (5 reviewers): quality rated 8–9/10. Applied homepage prose,
     project-title glosses, and abstract-terminology fixes (Tiers 1–4), plus JA-only markdown
     artifacts. Full detail: `logs/2026-06-04-japanese-audit.md`.

2. **`7a35c79` — Spanish audit + revision**
   - Reader-facing ES text normalized to neutral Latin American Spanish, formal `usted`; terminology
     / calques cleaned up; fixed an English "Browse all tutorials" label leaking onto `/es/` **and**
     `/ja/` via the shared `layouts/shortcodes/tutorial-teaser.html` (now language-aware). Full
     detail: `logs/2026-06-04-spanish-audit.md`.

3. **`c038718` — owner-provided data fixes**
   - 3 students (LeivaFavio, RestrepoKaterine, PhonSophat) had a copy-pasted wrong "north-eastern
     China" dissertation title → set to literal `TBA` in EN + ES + JA.
   - PrietoLaura's bio corrected to **PhD** in EN + ES + JA (completed MA in 2025; `role`/`user_groups`
     were already PhD) — resolves the Master's-vs-PhD contradiction.

## Per-language status

| Lang | URL | Scope | Register | Audit |
|------|-----|-------|----------|-------|
| English | `/` | Full site (source of truth) | — | n/a |
| Spanish | `/es/` | Homepage + items it shows | Formal `usted`, neutral LatAm | Audited & revised (`7a35c79`) |
| Japanese | `/ja/` | Homepage + items it shows | です・ます polite | Audited & revised (`65deb7b`) |

Pinned Hugo **0.111.3** (within the 0.96–0.119 safe window). Clean build: **EN 862 / ES 139 / JA 139** pages.

## Live verification (post-deploy)
- `GET /` (no cookie, first-time JP visitor): **302 → /ja/** (was 500).
- `GET /` + `lang_pref=en`: 200 · `lang_pref=ja`: 302 → /ja/ · repeat visit (`geo_seen=1`): 200.
- `GET /ja/`, `GET /es/`: 200. Language switcher lists English / Español / 日本語; no English UI-chrome
  leak on `/ja/`.

## Open items (not blocking; EN-sourced content gaps, not translation defects)
- **5 author placeholder bios** await real content: HeDu, KhounTheara, LiXiaomeng, SourHeng,
  CesarEchevarria2 (the Japanese placeholder wording itself is already correct).
- The wrong "north-eastern China" title still sits on 3 EN-only profiles (SuleimanHussein, ChenYilin,
  MinhThu) — left as-is per owner (ChenYilin/MinhThu may be legitimately China-focused).
- Optional/invisible: gallery-widget English comments; event YAML trailing whitespace.

## References
- `logs/2026-06-04-japanese-audit.md` — full JA audit (findings, severities, the 500 root cause).
- `logs/2026-06-04-spanish-audit.md` — full ES audit.
- `logs/2026-06-04-japanese-i18n.md`, `logs/2026-06-04-bilingual-spanish-homepage.md` — how the
  languages were built.
- `CLAUDE.md` → "Internationalization (i18n)" — durable architecture notes.
