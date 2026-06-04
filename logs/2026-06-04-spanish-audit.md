# Spanish (`/es/`) site + translation audit — 2026-06-04

Multi-agent audit of the Spanish localization (shipped in `2cf0d67`, refined in `17ca072`). Scope (confirmed
with the owner): the **current translated footprint** — the homepage and the items it shows
(publications, events, projects, student profiles, tutorial-card teasers) — is the intended final scope;
Courses, post bodies, and the remaining English pages are **by design**, not defects. Target standard:
**neutral Latin American Spanish, formal `usted`** for reader-facing text. Deliverable: audit **plus fixes**,
with subjective rewrites and content-knowledge gaps flagged for approval. Japanese (`/ja/`) out of scope
(its own audit is `logs/2026-06-04-japanese-audit.md`, which this one used as a template).

Method: 3 read-only Explore passes (footprint + infra + intended scope), then 4 parallel domain-expert
review agents (home widgets; publications + projects; events + author bios; post-stubs + terminology),
plus a functional track (Node repro of the edge function + live `carlos-mendez.org` curls + local Hugo
0.111.3 build & crawl). Every high-severity finding was adversarially re-checked before any edit.

---

## 1. Headline — no new critical bug; the shared homepage-500 is already fixed AND live

The Japanese audit's critical finding (the `geo-lang.ts` `Response.redirect()` immutable-headers throw that
500'd the homepage for every first-time visitor from a **mapped country — which includes Spain and all of
Latin America**) was **already repaired in commit `65deb7b`** and is **deployed**. Verified this pass:

| Check | Result |
|---|---|
| `git` state of `geo-lang.ts` | fix committed at HEAD (`65deb7b`), working tree clean, `HEAD == origin/master` (pushed) |
| Node repro (20 assertions) | **20/20 PASS** — old pattern throws `TypeError: immutable`; new pattern returns a clean 302 → `/es/` for MX/ES/AR/CO/PE/BO, JP → `/ja/`, US/empty → no redirect; `lang_pref` precedence + `geo_seen` once-only hold; `Cache-Control: private, no-store` set |
| Live `GET /` (no cookies) | **302** (clean), not 500 — the mapped-country branch is healthy in production |
| Live `GET /es/`, `GET /ja/` | 200 / 200; `GET /` + `lang_pref=es` → 302 `/es/`; `GET /` + `lang_pref=en;geo_seen=1` → 200 |

So the Spanish geo-redirect audience (Spain + LatAm) is served correctly in production. No edge-function
change was needed.

---

## 2. Functional audit — PASS (one English leak found & fixed)

- **Local build** (`/tmp/hugo-verify/hugo --gc --minify --buildFuture`, Hugo 0.111.3 extended, the pinned
  Netlify version): **clean, exit 0.** Page counts EN 862 / **ES 139** / JA 139. One **benign** pre-existing
  `.Path … is deprecated` Wowchemy warning — unrelated to i18n.
- **`/es/` structure**: no `/es/courses/` emitted (Courses correctly omitted from the Spanish navbar);
  in-scope sub-pages render (`/es/publication|event|projects/*`, author pages); tutorial cards link to the
  **English** `/post/<slug>/` via `card_url`; language switcher lists **English / Español / 日本語**.
- **hreflang** on `/es/`: `en`, `es-es`, `ja`, **`x-default`** all present.
- **No English theme-chrome leak** on `/es/` ("Read more", "Recent Publications", "Last updated",
  "Powered by" all absent — the Wowchemy `es` i18n strings render).
- **Defect found & FIXED:** `layouts/shortcodes/tutorial-teaser.html` hard-coded `Browse all tutorials →`,
  which rendered verbatim on **both** the Spanish and Japanese homepages (the JA audit missed this). Made
  the label language-aware (`en` default, `es` → "Ver todos los tutoriales", `ja` → "すべてのチュートリアルを見る").
  Rebuilt: `Browse all tutorials` count on `/es/` and `/ja/` is now **0**; EN unchanged.

---

## 3. Translation quality — high across the board

| Section | Readability | Notes |
|---|---|---|
| Home widgets | 9 / 10 | Hero, researchLab, featured, menu + `params.description` publication-quality. |
| Publications | 9.3 / 10 | Faithful abstracts, intact numbers/DOIs, correct decimal-comma localization, idiomatic econometric terms. |
| Projects | 8.5 / 10 | Expert causal-inference / DS terminology; lost points only on `tú` register + one calque (`incrustaciones`). |
| Events | 9.5 / 10 | Fluent native-quality academic Spanish; ES even fixes EN typos ("Phnom Penh", a missing period). |
| Author bios | 9 / 10 (populated) | `admin` native-quality; the rest are faithful stub-for-stub mirrors of the EN placeholders (by design). |
| Post stubs | 9 / 10 | Accurate titles/summaries; all 6 `card_url` + `_build` correct; query-key tags kept English (intentional). |

Terminology is consistent site-wide (one canonical form for "aprendizaje automático", "luces nocturnas",
"diferencias en diferencias", "inferencia causal", "ciencia de datos", "macrodatos", "desarrollo regional").
No mojibake, no broken YAML/markdown in user-facing text, no English leakage in translated prose. The single
systematic deviation was **register**: the entire reader-facing layer used informal **`tú`** with **zero
`usted`** anywhere — addressed below.

**False positives guarded (verified, NOT changed):** the Cameron book title *"Analysis of Economics Data:
An Introduction to Econometrics"* is correct as written (not a typo); author `user_groups`/`role` values that
look mismatched faithfully mirror the EN site (empty advisor groups are empty in EN too).

---

## 4. Fixes APPLIED this pass

Principle: fix ES-unique translation/readability defects and the one shared-template leak; the EN-side
mechanical issues (em dashes, `Jörn-Steffen` umlaut in EN, GDSL abstract, `MujkanovicAdin` avatar) were
**already fixed in `65deb7b`**, so no EN content files needed editing here.

1. **`layouts/shortcodes/tutorial-teaser.html`** — language-aware "browse all" label (fixes the EN leak on
   `/es/` + `/ja/`). *(template; en/es/ja)*
2. **Register sweep `tú` → `usted`** across all reader-facing Spanish text (the dominant finding):
   - `content/es/authors/admin/_index.md` — About CTA "Descarga mi CV" → **"Descargue mi CV"**.
   - `content/es/home/researchLab.md` — "interpretarías" → "interpretaría usted"; "copia y pega" →
     "copie y pegue"; "Haz clic … descúbrelo" → "Haga clic … descúbralo".
   - `content/es/home/alumni-link.md` — "Conoce" → "Conozca".
   - `content/es/projects/intro2causal/index.md` — "Aprende" → "Aprenda"; "Haz clic"/"Inicia sesión"/
     "ejecuta"/"Explora y modifica … experimenta"/"Guarda tu trabajo … tus modificaciones" →
     "Haga clic"/"Inicie sesión"/"ejecute"/"Explore y modifique … experimente"/"Guarde su trabajo …
     sus modificaciones"; "tu navegador" → "su navegador".
   - `content/es/projects/metricsai/index.md` — same imperative/possessive sweep to `usted`.
   - `content/es/projects/ds4bolivia/index.md` — "Explora" → "Explore"; "te ayudan" → "le ayudan";
     "aprende" → "aprenda"; "Si utilizas … tu investigación, cítalo" → "Si utiliza … su investigación,
     cítelo"; "Construye tu" → "Construya su"; "Asegúrate" → "Asegúrese"; "Puedes ejecutar" → "Puede
     ejecutar"; "Si vas a corregir … envía un Pull Request" → "Si va a corregir … envíe un Pull Request".
   - `content/es/projects/ccm/index.md` — "tus propios datos" → "sus propios datos"; "Contribuye y deja
     tus comentarios" → "Contribuya y deje sus comentarios".
3. **Terminology / spelling (ES-unique):**
   - `content/es/post/python_double_lasso/index.md` — "librería" → **"biblioteca"** (false-friend calque =
     bookshop); "robustez del aprendiz" → "robustez frente al estimador base" (ML "learner" calque).
   - `content/es/projects/ds4bolivia/index.md` — "incrustaciones (satelitales)" → **"embeddings"** (×3,
     the idiomatic LatAm DS term); normalized a full-width space (U+3000) after "*Caso de uso:*".
   - `content/es/projects/intro2causal/index.md` — restored "**Jörn-Steffen** Pischke" umlaut; "` -- `" →
     em dash "—" (EN already done in `65deb7b`).
   - `content/es/projects/metricsai/index.md` — "` - `" credits separators → em dash "—".
   - `content/es/publication/20251006-SIR/index.md` — "redes viarias" → **"redes viales"** (×2; LatAm-natural).

Local rebuild after fixes: **clean, exit 0**; residual-`tú`/old-term grep across `content/es/` returns none;
localized labels verified in the built HTML.

---

## 5. Flagged for approval (NOT applied — content knowledge / subjective)

### Content-knowledge gaps (inherited from the English source — fix EN first, then re-translate)
- **Duplicated dissertation title** "…evidencia espacial del noreste de China" on **three** students —
  LeivaFavio (Peru), RestrepoKaterine (Colombia), PhonSophat (Cambodia). A copy-paste error present
  identically in EN; needs each student's real title. *(`content/{,es/}authors/{LeivaFavio,RestrepoKaterine,PhonSophat}/`)*
- **PrietoLaura** `role` says doctorado (2026-2029) but `bio` says maestría — contradiction inherited from
  EN. Decide master's vs PhD and align both fields in EN + ES.
- **Five placeholder student bios** (HeDu, CesarEchevarria2, KhounTheara, LiXiaomeng, SourHeng) carry
  truncated bios / "AÑADE aquí una biografía más extensa" bodies. These are *correct* translations of the EN
  stubs ("ADD a longer bio here"), so there is **no Spanish defect** — they need real content written in EN
  first, then ported. Renders thin/placeholder on `/es/#people` exactly as it does in English.

### Subjective wording (homepage prose)
- **Hero H1** `Sobre la geografía del desarrollo` is a faithful literal of "On the Geography of Development"
  but reads as a sentence-fragment; `La geografía del desarrollo` is a cleaner title.
  *(`content/es/home/hero2-new.md`)*
- **Posts subtitle** over-narrows to "econometría"; the tutorials also cover spatial data science / ML / GEE.
  Suggest "Tutoriales prácticos de ciencia de datos y econometría en Python, R y Stata" — but this is the
  EN homepage tagline too, so it's a copy decision for **both** `content/home/posts.md` and the ES file.

---

## 6. Verification performed
- Node repro of `geo-lang.ts`: 20/20 (old throws, new returns clean 302 for ES/LatAm; cookie precedence +
  once-only).
- Local Hugo 0.111.3 build before & after fixes: clean, exit 0, ES 139 pages.
- Built-output crawl: no `/es/courses/`; switcher EN/ES/JA; hreflang incl. `x-default`; no English
  theme-chrome leak; tutorial label now `Ver todos los tutoriales` (ES) / `すべてのチュートリアルを見る` (JA),
  `Browse all tutorials` count 0 on `/es/` + `/ja/`, EN unchanged.
- Live curls: `/es/` 200, `/ja/` 200, `/` clean 302 (no 500).

## 7. Outstanding
- **Commit & push the Spanish fixes** (this pass's working-tree edits) so they reach production on the next
  Netlify build.
- Owner to decide on the §5 flagged items (dissertation titles, Prieto master's/PhD, placeholder bios,
  hero/posts wording).
