# Japanese (`/ja/`) site + translation audit — 2026-06-04

Multi-agent audit of the Japanese localization shipped in commit `42d0d18`. Scope (confirmed with the
site owner): the **current translated footprint** — the homepage and the items it links to — is the
intended final scope; the ~78 untranslated posts / 46 publications / 26 events are **by design**, not
defects. Audience: **general + academic mix**; register です・ます. Deliverable: audit **plus safe fixes**,
with subjective/large rewrites flagged for approval.

Method: 2 read-only Explore passes to map the footprint + infrastructure, then 5 parallel domain-expert
review agents (home widgets, author profiles, publications, projects, events+post-stubs), plus a
functional audit (local Hugo 0.111.3 build + live `carlos-mendez.org` checks + a Node repro of the edge
function).

---

## 1. Headline finding — CRITICAL production bug (now fixed)

**The live homepage root `/` returned HTTP 500 for every first-time visitor.**

| Request | Before fix |
|---|---|
| `GET /` (no cookies) | **500 — "uncaught exception during edge function invocation"** |
| `GET /` + `lang_pref=en; geo_seen=1` | 200 |
| `GET /` + `lang_pref=ja` | 302 → `/ja/` (worked) |
| `GET /ja/`, `GET /es/` | 200 |

**Root cause:** `netlify/edge-functions/geo-lang.ts` built its redirect with `Response.redirect()`, whose
headers are **immutable** per the Fetch spec, then called `res.headers.set("Cache-Control" …)` /
`res.headers.set("Netlify-Vary" …)` on it — which throws `TypeError: immutable`. That branch runs for
every first-time visitor from a **mapped** country (Japan, Spain, all of Latin America). The site owner is
in Japan, so every fresh hit to `/` resolved to `JP`, entered that branch, and 500'd. The manual-preference
redirect (`lang_pref`) didn't mutate headers, which is why it worked and masked the bug for returning
visitors. **This broke the homepage for exactly the first-time JP/ES audience the geo-redirect exists to
serve, and had been live since the geo logic shipped.**

Empirically reproduced in Node:
```
OLD pattern THREW -> TypeError: immutable
NEW pattern: OK status=302 location=https://carlos-mendez.org/ja/ cc=private, no-store
```

**Fix applied** (`geo-lang.ts`): build the redirect via the `Response` constructor so the headers stay
mutable, and wrap the whole body in `try { … } catch { return; }` so the homepage **falls through to
English** on any future routing error instead of 500-ing.

> Status: fixed in the working tree and verified at the JS-behavior level. The fix only reaches production
> on deploy (push to `master` → Netlify rebuilds the edge function). **Recommend deploying promptly.**

---

## 2. Functional audit — PASS (aside from the bug above)

- **Local build** (`/tmp/hugo-verify/hugo --gc --minify --buildFuture`, Hugo 0.111.3 extended, the pinned
  Netlify version): **clean, exit 0.** Page counts EN 862 / ES 139 / **JA 139** (JA mirrors ES exactly).
  One **benign** pre-existing warning (`.Path … is deprecated`) from the Wowchemy theme — unrelated to
  i18n, not an error.
- **Live `/ja/`**: HTTP 200. Language switcher lists **English / Español / 日本語**. All 9 Japanese navbar
  labels render (プロフィール・研究室・論文・講演・チュートリアル・プロジェクト・学生・イベント・お問い合わせ);
  **Courses correctly omitted** (no `/ja/courses/` 404). **No English UI chrome leaked** onto `/ja/`
  (checked "Read more", "Recent Publications", "Last updated", "Powered by", etc.).
- **People widget**: verified correct. JA authors carry `主任研究者` (admin) + `博士課程学生` ×11 +
  `修士課程学生` ×1, which match the widget's groups, so **all 12 students render**. The two `（副指導）`
  groups are empty *exactly as in the English site* — a faithful mirror, not a bug.
- **Post stubs** (6): all functionally correct — `card_url` → the English `/post/<slug>/`, slug matches a
  real directory, `_build: {render: never, list: always}` present. Categories kept English (correct;
  they're shared query keys).

### Two agent "high-severity" flags that were FALSE POSITIVES (verified, no change made)
- **Cameron book title** "Analysis of Economics Data: An Introduction to Econometrics" — flagged as a typo
  for "…Economic Data". **Verified against Cameron's own site** (cameron.econ.ucdavis.edu/aed): the real
  2022 title *is* "Analysis of Economics Data: An Introduction to Econometrics". The EN/ES/JA text is
  **correct**.
- **People `user_groups` "mismatch"** — flagged HIGH; on verification the JA widget mirrors the EN widget
  exactly and all students render (above). Not a defect.

---

## 3. Translation quality — strong across the board

| Section | Readability | Notes |
|---|---|---|
| Home widgets | 8 / 10 | Hero, researchLab, `params.description` are publication-quality. |
| Author profiles | 9 / 10 | Where real bios exist, native-quality; rest are placeholders awaiting content. |
| Publications | 8.5 / 10 (register 9.5) | Correct, standard econometric Japanese; a few literal calques. |
| Projects | 8 / 10 | Expert causal-inference terminology; headline title choices are the weak spot. |
| Events + stubs | 9 / 10 | Fluent; well-glossed technical terms; one inherited placeholder. |

Consistent です・ます register, no mojibake, no broken YAML/markdown in user-facing text, no English
leakage in translated prose. The drafter is clearly fluent in both the language and the subject matter.

---

## 4. Safe fixes APPLIED this pass

Principle: **fix defects unique to the Japanese files; flag anything inherited from English or requiring a
wording/content judgment.**

1. **`netlify/edge-functions/geo-lang.ts`** — the homepage 500 (see §1). *(High impact.)*
2. **`content/ja/projects/ds4bolivia/index.md`** — removed a stray mid-line `>` inside the `⚠️ 識別子に関する
   重要な注意` callout that rendered as a literal `>` (JA-specific; not in EN). Verified gone in the
   rebuilt page.
3. **`content/ja/projects/ds4bolivia/index.md`** — normalized a full-width space (U+3000) after `*活用例：*`
   to a regular space, matching the sibling `*説明：*` line (JA-specific).

Local rebuild after fixes: clean, exit 0.

---

## 5. Recommendations — Tiers 1–4 APPLIED 2026-06-04 (per owner approval)

> **Update:** the owner approved applying Tiers 1–4. All items below were applied this same day. The two
> genuine *data* problems (duplicated China dissertation title ×3, Prieto MA-vs-PhD contradiction) were
> resolved later the same day with owner-provided data — `TBA` placeholders and Prieto→PhD (see §7).
> Tier-4 mechanical items were applied in **all** affected languages (EN + ES + JA where the string
> exists). What was changed, verbatim:
> - Hero `開発の地理学について` → `開発の地理学`; featured heading `主要論文` → `主要な業績`; navbar `論文` →
>   `業績`; posts subtitle now includes `データサイエンス`.
> - Project titles glossed: `因果メトリクスをマスターする（Mastering Causal Metrics）`,
>   `比較因果メトリクス（Comparative Causal Metrics）`.
> - Abstracts: `ベイズ平均化` → `ベイズ的平均化`, `回復` → `復元` (EE); `時代遅れ` → `古い`, `細やか` →
>   `きめ細か…`, `建物のフットプリント` → `建物フットプリント` (SIR); `AIが牽引する` → `AI主導の`, `様式` →
>   `形式` (metricsAI).
> - Inherited/mechanical (EN+ES+JA): GDSL `abstract: "_"` → `""`; tag `avaraging` → `averaging`;
>   intro2causal ` -- ` → `—` (×7) + `Jorn` → `Jörn`; `avatar.jpg.png` → `avatar.png`.
>
> The original recommendations are preserved below for the record.

### Tier 1 — Homepage prose (highest visibility) — recommended
- **Hero title** `開発の地理学について` → `開発の地理学`. Dropping `について` ("about/regarding") turns the
  flagship banner from a topic-fragment back into a title. *(`content/ja/home/hero2-new.md`)*
- **Featured heading** `主要論文` → `代表的な論文` / `主要な業績`, and **navbar** `論文` → `業績`, harmonized.
  "Featured Publications" reads better in standard academic-CV Japanese; `論文` is narrow (papers only).
  *(`content/ja/home/featured.md`, `config/_default/languages.yaml` ja block)*
- **Posts subtitle** broaden `…実践的な計量経済学チュートリアル` to include データサイエンス — the tutorials
  cover spatial DS / ML / GEE, not only econometrics. *(`content/ja/home/posts.md`)*

### Tier 2 — Project titles (brand/pun decisions)
- `intro2causal`: `因果メトリクスをマスターする` / `因果メトリクス` reads as software "metrics," and
  `〜をマスターする` is casual for an academic title. The English is a pun on Angrist & Pischke's
  *Mastering 'Metrics*. Suggest a noun-phrase title + English gloss, e.g. `因果メトリクス（Causal Metrics）入門`.
  Apply the same gloss to `ccm` (`比較因果メトリクス`) and the cross-reference in `ccm/index.md`.

### Tier 3 — Publication-abstract terminology (academic phrasing)
- `20250605-EE`: prefer the idiomatic adjective `ベイズ的…` over bare `ベイズ平均化`; replace the *recover*
  calque `回復する` with `復元する`/`正しく特定する`.
- `20251006-SIR`: `時代遅れ` → `古い`/`最新ではない`; `細やか` → `詳細`/`きめ細かい`; standardize
  `建物のフットプリント`.
- `20260126-metricsAI`: title `AIが牽引する計量経済学` → `AI主導の…`/`AIを活用した…` to match the abstract's
  own `AIで強化された` framing (avoids implying AI *drives the discipline*); `様式` → `形式`/`モダリティ`.

### Tier 4 — Inherited from the English source (fix in BOTH languages, or upstream)
- **GDSL event** `abstract: "_"` renders a stray underscore on the event page — write a real abstract or
  set `""`. Present in EN too. *(`content/ja/event/20241113GDSL/`, `content/event/20241113GDSL/`)*
- **`intro2causal` ` -- `** (7 spots) → em dash `—` per the project style guide; EN has the same 7.
- **Duplicated dissertation title** `…中国東北部からの空間的エビデンス` on **three** students — LeivaFavio
  (Peru), RestrepoKaterine (Colombia), PhonSophat (Cambodia). Copy-paste error in the EN source, faithfully
  translated. Fix the EN source, then re-translate.
- **PrietoLaura** `role` says 博士課程 but `bio` says 修士課程 — contradiction inherited from EN.
- Minor: `Jorn-Steffen` → `Jörn-Steffen` (umlaut); tag typo `Bayesian model avaraging` → `averaging`
  (shared query key — change across all languages); `MujkanovicAdin/avatar.jpg.png` double extension
  (renders fine; rename to `avatar.png` in both EN+JA if desired).

### Tier 5 — Content completion (not a translation problem)
- Author placeholders awaiting real bios: HeDu, KhounTheara, LiXiaomeng, SourHeng, CesarEchevarria2 (plus
  blank bodies in LeivaFavio / PhonSophat / RestrepoKaterine). The Japanese placeholder wording itself is
  correct; these need real content (in both languages).

### Optional (invisible to visitors)
- `content/ja/home/gallery/index.md` — English YAML/HTML comments only; no user-facing strings.
- Event front-matter `event:` / `summary:` keys carry 2–4 trailing spaces (cosmetic).

---

## 6. Verification performed
- Node repro of the edge-function immutable-headers throw (old pattern throws, new pattern returns 302).
- Local Hugo 0.111.3 build before and after fixes: clean, exit 0, JA 139 pages.
- Rebuilt `public/ja/projects/ds4bolivia/index.html`: stray `>` confirmed gone.
- Live curls: `/ja/` 200; switcher + menu + no-chrome-leak confirmed; `/` 500 reproduced (no-cookie) and
  isolated to the geo-lookup branch.

## 7. Outstanding (after this pass)
- **Deploy** — the edge-function fix + all Tier 1–4 edits + this log were committed and pushed to
  `master` on 2026-06-04, triggering the Netlify rebuild that clears the live homepage 500. Verify
  post-deploy: `GET /` with no cookies → expect non-500.
- **Data fixes — RESOLVED 2026-06-04 (owner-provided):**
  - The wrong "north-eastern China" dissertation title on LeivaFavio (Peru), RestrepoKaterine (Colombia),
    PhonSophat (Cambodia) → replaced with the literal `TBA` in EN + ES + JA. The same title still sits on
    3 EN-only profiles (SuleimanHussein / ChenYilin / MinhThu) — left as-is per owner (ChenYilin/MinhThu
    may be legitimately China-focused).
  - PrietoLaura → `bio` corrected to **PhD** in EN + ES + JA (she completed her MA in 2025; `role` and
    `user_groups` were already PhD).
- **Content completion** — 5 author placeholder bios (HeDu, KhounTheara, LiXiaomeng, SourHeng,
  CesarEchevarria2) await real content in both languages.
- **Optional/invisible** — gallery-widget English comments; event YAML trailing whitespace.
